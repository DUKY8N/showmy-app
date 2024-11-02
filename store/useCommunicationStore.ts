import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';

// 참가자 인터페이스
interface Participant {
  socketId: string;
  userName: string;
  streams: MediaStream[];
}

// 시그널링 데이터 인터페이스
interface SignalData<T> {
  senderSocketId: string;
  content: T;
}

// 상태 인터페이스
interface CommunicationState {
  // 상태 값
  socket: Socket | null;
  roomKey: string | null;
  participants: Participant[];
  localStreams: MediaStream[];

  // 화면 공유 여부, 웹캠 공유 여부, 마이크 상태
  isScreenSharing: boolean;
  isWebcamSharing: boolean;
  isMicrophoneOn: boolean;
  isChatOpen: boolean;

  // 비즈니스 로직 메서드
  initialize: () => void;
  createRoom: (userName: string) => Promise<string>;
  joinRoom: (roomKey: string, userName: string) => Promise<void>;
  leaveRoom: () => void;
  toggleScreenShare: () => Promise<void>;
  toggleWebcamShare: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleChat: () => void;
}

const useCommunicationStore = create<CommunicationState>((set, get) => {
  // 피어 연결 상태 인터페이스
  interface PeerConnectionState {
    pc: RTCPeerConnection;
    makingOffer: boolean;
    isSettingRemoteAnswerPending: boolean;
    polite: boolean;
  }

  // 내부 상태: 피어 연결 관리
  const peerConnections: { [socketId: string]: PeerConnectionState } = {};

  // 내부 함수: 피어 연결 생성
  const createPeerConnection = (socketId: string): PeerConnectionState => {
    let peerConnectionState = peerConnections[socketId];
    if (peerConnectionState) {
      return peerConnectionState;
    }

    const pc = new RTCPeerConnection();

    // 현재 피어의 polite 여부 결정 (예: socketId를 비교하여 결정)
    const localSocketId = get().socket?.id;
    if (!localSocketId) {
      throw new Error('Socket is not initialized');
    }
    const polite = localSocketId < socketId;

    peerConnectionState = {
      pc,
      makingOffer: false,
      isSettingRemoteAnswerPending: false,
      polite,
    };

    // ICE 후보 처리
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = get().socket;
        const roomKey = get().roomKey;
        if (socket && roomKey) {
          socket.emit('signal:iceCandidate', roomKey, {
            content: event.candidate,
            to: socketId,
          });
        }
      }
    };

    // 원격 스트림 수신
    pc.ontrack = (event) => {
      set((state) => {
        const participant = state.participants.find((p) => p.socketId === socketId);
        if (participant) {
          // 기존 스트림에 추가하거나 새로운 스트림으로 추가
          const streams = participant.streams;
          if (!streams.includes(event.streams[0])) {
            participant.streams = [...streams, event.streams[0]];
          }
        } else {
          // 참가자가 없으면 새로운 참가자로 추가
          state.participants.push({
            socketId,
            userName: '', // 필요 시 서버에서 사용자 이름을 받아와 설정
            streams: [event.streams[0]],
          });
        }
        return { participants: state.participants };
      });
    };

    // 시그널링 상태 변경 이벤트 처리 (디버깅 목적)
    pc.onsignalingstatechange = () => {
      console.log('Signaling state change:', pc.signalingState);
    };

    // 로컬 스트림 추가
    const localStreams = get().localStreams;
    if (localStreams.length > 0) {
      localStreams.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      });
    }

    peerConnections[socketId] = peerConnectionState;
    return peerConnectionState;
  };

  // 내부 함수: 소켓 이벤트 설정
  const setupSocketEvents = (socket: Socket) => {
    socket.on('connect', () => {
      console.log('서버에 연결되었습니다:', socket.id);
    });

    socket.on('room:joined', (roomKey: string) => {
      set({ roomKey });
    });

    socket.on('room:notFound', () => {
      console.error('방을 찾을 수 없습니다.');
    });

    socket.on('room:existingParticipants', async (participants: Participant[]) => {
      // 기존 참가자들과의 연결 설정
      for (const participant of participants) {
        await initiateCall(participant.socketId);
      }
    });

    socket.on('participant:new', async (participant: Participant) => {
      set((state) => ({
        participants: [...state.participants, participant],
      }));
      // 새로운 참가자와의 연결 설정
      await initiateCall(participant.socketId);
    });

    socket.on('participant:left', (socketId: string) => {
      set((state) => ({
        participants: state.participants.filter((p) => p.socketId !== socketId),
      }));
      // 피어 연결 해제
      const peerConnectionState = peerConnections[socketId];
      if (peerConnectionState) {
        peerConnectionState.pc.close();
        delete peerConnections[socketId];
      }
    });

    // 시그널링 이벤트 처리
    socket.on('signal:offerAwaiting', async (data: SignalData<RTCSessionDescriptionInit>) => {
      await handleOffer(data);
    });

    socket.on('signal:answerResponse', async (data: SignalData<RTCSessionDescriptionInit>) => {
      await handleAnswer(data);
    });

    socket.on('signal:iceCandidateReceived', async (data: SignalData<RTCIceCandidateInit>) => {
      await handleIceCandidate(data);
    });
  };

  // 시그널링 처리 함수들
  const handleOffer = async (data: SignalData<RTCSessionDescriptionInit>) => {
    const { senderSocketId, content } = data;
    const state = createPeerConnection(senderSocketId);
    const pc = state.pc;
    const polite = state.polite;

    const offerCollision = pc.signalingState !== 'stable' || state.makingOffer;

    if (offerCollision) {
      if (!polite) {
        console.log('오퍼 충돌 발생: impolite 피어는 오퍼를 무시합니다.');
        return;
      } else {
        console.log('오퍼 충돌 발생: polite 피어는 오퍼를 처리합니다.');
      }
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(content));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = get().socket;
      const roomKey = get().roomKey;
      if (socket && roomKey) {
        socket.emit('signal:answer', roomKey, {
          content: pc.localDescription,
          to: senderSocketId,
        });
      }
    } catch (err) {
      console.error('오퍼 처리 중 오류 발생:', err);
    }
  };

  const handleAnswer = async (data: SignalData<RTCSessionDescriptionInit>) => {
    const { senderSocketId, content } = data;
    const state = peerConnections[senderSocketId];
    const pc = state?.pc;
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(content));
      } catch (err) {
        console.error('Answer 처리 중 오류 발생:', err);
      }
    }
  };

  const handleIceCandidate = async (data: SignalData<RTCIceCandidateInit>) => {
    const { senderSocketId, content } = data;
    const state = peerConnections[senderSocketId];
    const pc = state?.pc;
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(content));
      } catch (err) {
        console.error('ICE 후보 처리 중 오류 발생:', err);
      }
    }
  };

  // 내부 함수: 통화 시작
  const initiateCall = async (socketId: string) => {
    const state = createPeerConnection(socketId);
    const pc = state.pc;

    try {
      state.makingOffer = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = get().socket;
      const roomKey = get().roomKey;
      if (socket && roomKey) {
        socket.emit('signal:offer', roomKey, {
          content: pc.localDescription,
          to: socketId,
        });
      }
    } catch (err) {
      console.error('통화 시작 중 오류 발생:', err);
    } finally {
      state.makingOffer = false;
    }
  };

  // 로컬 스트림 추가
  const addLocalStream = (stream: MediaStream) => {
    set((state) => ({ localStreams: [...state.localStreams, stream] }));
    // 기존 피어 연결에 트랙 추가
    Object.values(peerConnections).forEach(({ pc }) => {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    });
  };

  // 로컬 스트림 제거
  const removeLocalStream = (stream: MediaStream) => {
    set((state) => {
      const updatedStreams = state.localStreams.filter((s) => s !== stream);
      return { localStreams: updatedStreams };
    });

    // 피어 연결에서 해당 트랙 제거
    Object.values(peerConnections).forEach(({ pc }) => {
      pc.getSenders().forEach((sender) => {
        if (stream.getTracks().includes(sender.track!)) {
          pc.removeTrack(sender);
        }
      });
    });

    // 스트림의 트랙 정지
    stream.getTracks().forEach((track) => track.stop());
  };

  // 화면 공유 토글
  const toggleScreenShare = async () => {
    if (!get().isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        set({ isScreenSharing: true });
        addLocalStream(screenStream);

        // 화면 공유가 종료되면 로컬 스트림에서 제거
        const [videoTrack] = screenStream.getVideoTracks();
        videoTrack.onended = () => {
          if (get().isScreenSharing) {
            toggleScreenShare();
          }
        };
      } catch (error) {
        console.error('화면 공유 중 오류 발생:', error);
      }
    } else {
      // 화면 공유 중지
      const localStreams = get().localStreams;
      const screenStream = localStreams.find(
        (stream) =>
          stream.getVideoTracks()[0]?.label.includes('Screen') ||
          stream.getVideoTracks()[0]?.label.includes('Entire screen'),
      );
      if (screenStream) {
        removeLocalStream(screenStream);
      }
      set({ isScreenSharing: false });
    }
  };

  // 웹캠 공유 토글 (마이크 제외)
  const toggleWebcamShare = async () => {
    if (!get().isWebcamSharing) {
      try {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        set({ isWebcamSharing: true });
        addLocalStream(webcamStream);
      } catch (error) {
        console.error('웹캠 공유 중 오류 발생:', error);
      }
    } else {
      // 웹캠 공유 중지
      const localStreams = get().localStreams;
      const webcamStream = localStreams.find(
        (stream) => stream.getVideoTracks().length > 0 && stream.getAudioTracks().length === 0,
      );
      if (webcamStream) {
        removeLocalStream(webcamStream);
      }
      set({ isWebcamSharing: false });
    }
  };

  // 마이크 토글
  const toggleMicrophone = async () => {
    if (!get().isMicrophoneOn) {
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        set({ isMicrophoneOn: true });
        addLocalStream(micStream);
      } catch (error) {
        console.error('마이크 사용 중 오류 발생:', error);
      }
    } else {
      // 마이크 중지
      const localStreams = get().localStreams;
      const micStream = localStreams.find(
        (stream) => stream.getAudioTracks().length > 0 && stream.getVideoTracks().length === 0,
      );
      if (micStream) {
        removeLocalStream(micStream);
      }
      set({ isMicrophoneOn: false });
    }
  };

  // 채팅창 토글
  const toggleChat = () => {
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  };

  return {
    socket: null,
    roomKey: null,
    participants: [],
    localStreams: [],
    isScreenSharing: false,
    isWebcamSharing: false,
    isMicrophoneOn: false,
    isChatOpen: false,

    // 통신 초기화
    initialize: () => {
      if (get().socket) return;

      const socket = io('https://localhost:8181', { secure: true });
      set({ socket });
      setupSocketEvents(socket);
    },

    // 방 생성
    createRoom: (userName: string) => {
      return new Promise((resolve) => {
        const socket = get().socket;
        if (socket) {
          socket.emit('room:create', userName, (roomKey: string) => {
            set({ roomKey });
            resolve(roomKey);
          });
        } else {
          resolve(''); // 또는 오류를 발생시킬 수 있습니다.
        }
      });
    },

    // 방 참가
    joinRoom: async (roomKey: string, userName: string) => {
      const socket = get().socket;
      if (!socket) throw new Error('Socket is not initialized');

      return new Promise<void>((resolve, reject) => {
        socket.emit('room:join', roomKey, userName, (response: string) => {
          if (response === 'success') {
            set({ roomKey });
            resolve();
          } else {
            reject(new Error('방에 참가할 수 없습니다.'));
          }
        });
      });
    },

    // 방 나가기
    leaveRoom: () => {
      const roomKey = get().roomKey;
      const socket = get().socket;
      if (roomKey && socket) {
        socket.emit('room:leave', roomKey);
        set({ roomKey: null, participants: [] });
        // 모든 피어 연결 해제
        Object.values(peerConnections).forEach(({ pc }) => pc.close());
        // 로컬 스트림 정리
        get().localStreams.forEach((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
        set({ localStreams: [] });

        set({ isScreenSharing: false, isWebcamSharing: false, isMicrophoneOn: false });
      }
    },

    // 화면 공유 토글
    toggleScreenShare,

    // 웹캠 공유 토글
    toggleWebcamShare,

    // 마이크 토글
    toggleMicrophone,

    // 채팅창 토글
    toggleChat,
  };
});

export default useCommunicationStore;