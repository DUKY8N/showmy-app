import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';

interface Streams {
  [key: string]: MediaStream | undefined;
  webcam?: MediaStream;
  screen?: MediaStream;
  microphone?: MediaStream;
}

// 참가자 인터페이스
interface Participant {
  socketId: string;
  userName: string;
  streams: Streams;
  trackInfo?: { [trackId: string]: string };
}

// 시그널링 데이터 인터페이스
interface SignalData<T> {
  senderSocketId: string;
  content: T;
}

// 채팅 메시지 타입 추가 (senderSocketId 추가)
interface ChatMessage {
  id: string;
  sender: string;
  senderSocketId: string; // 추가된 부분
  content: string;
  timestamp: number;
}

// 상태 인터페이스
interface CommunicationState {
  // 상태 값
  socket: Socket | null;
  roomKey: string | null;
  participants: Participant[];
  localStreams: Streams;

  // 화면 공유 여부, 웹캠 공유 여부, 마이크 상태
  isScreenSharing: boolean;
  isWebcamSharing: boolean;
  isMicrophoneOn: boolean;
  isChatOpen: boolean;

  // 채팅 관련 상태 추가
  messages: ChatMessage[];
  sendMessage: (content: string) => void;

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

interface CustomMediaStream extends MediaStream {
  streamType?: 'webcam' | 'screen';
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
    if (peerConnectionState) return peerConnectionState;

    const configuration = {
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // 현재 피어의 polite 여부 결정
    const localSocketId = get().socket?.id;
    if (!localSocketId) throw new Error('Socket is not initialized');
    const polite = localSocketId < socketId;

    peerConnectionState = {
      pc,
      makingOffer: false,
      isSettingRemoteAnswerPending: false,
      polite,
    };

    // ICE 후보 처리
    pc.onicecandidate = (event) => {
      const { socket, roomKey } = get();

      if (!event.candidate || !socket || !roomKey) return;

      socket.emit('signal:iceCandidate', roomKey, {
        content: event.candidate,
        to: socketId,
      });
    };

    // 원격 스트림 수신
    pc.ontrack = (event) => {
      const track = event.track;
      const newStream = event.streams[0] as CustomMediaStream;

      const participant = get().participants.find((p) => p.socketId === socketId);
      const mediaType = participant?.trackInfo?.[track.id];

      console.log('트랙 수신 상세:', {
        trackId: track.id,
        mediaType,
        participant,
        streams: event.streams,
        kind: track.kind,
      });

      if (mediaType) {
        set((state) => {
          const participantIndex = state.participants.findIndex((p) => p.socketId === socketId);
          if (participantIndex === -1) return state;

          const updatedParticipants = [...state.participants];
          const participant = updatedParticipants[participantIndex];

          // streams 객체가 없으면 초기화
          if (!participant.streams) {
            participant.streams = {};
          }

          // 기존 스트림이 있으면 트랙 추가, 없으면 새 스트림 설정
          if (participant.streams[mediaType]) {
            participant.streams[mediaType]?.addTrack(track);
          } else {
            participant.streams[mediaType] = newStream;
          }

          console.log('스트림 업데이트 후:', {
            socketId,
            mediaType,
            streams: participant.streams,
          });

          return { participants: updatedParticipants };
        });
      }
    };

    // 시그널링 상태 변경 이벤트 처리 (디버깅 목적)
    pc.onsignalingstatechange = () => {
      console.log('Signaling state change:', pc.signalingState);
    };

    // 새로운 피어에 로컬 트랙 추가
    const { localStreams } = get();
    Object.entries(localStreams).forEach(([type, stream]) => {
      if (stream) {
        console.log(`새 피어에 ${type} 트랙 추가`);
        stream.getTracks().forEach((track: MediaStreamTrack) => {
          addTrackWithMetadata(pc, track, stream, type as keyof Streams, socketId);
        });
      }
    });

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
      console.log('기존 참가자 목록:', participants);

      // 기존 참가자들을 상태에 추가
      set((state) => ({
        participants: [...state.participants, ...participants],
      }));

      // 각 참가자와 피어 연결 설정
      for (const participant of participants) {
        const peerState = createPeerConnection(participant.socketId);

        // 현재 활성화된 로컬 스트림이 있다면 공유
        const { localStreams } = get();

        if (localStreams.webcam) {
          console.log(`기존 참가자 ${participant.socketId}에게 웹캠 스트림 공유`);
          localStreams.webcam.getTracks().forEach((track) => {
            peerState.pc.addTrack(track, localStreams.webcam!);
          });
        }

        if (localStreams.screen) {
          console.log(`기존 참가자 ${participant.socketId}에게 화면공유 스트림 공유`);
          localStreams.screen.getTracks().forEach((track) => {
            peerState.pc.addTrack(track, localStreams.screen!);
          });
        }
      }
    });

    socket.on('room:newParticipant', async (participant: Participant) => {
      console.log('새로운 참가자 입장:', participant);

      // 참가자 목록에 추가
      set((state) => ({
        participants: [...state.participants, participant],
      }));

      // 새 참가자와 피어 연결 설정
      const peerState = createPeerConnection(participant.socketId);

      // 재 활성화된 로컬 스트림이 있다면 새 피어에게 공유
      const { localStreams, isWebcamSharing, isScreenSharing } = get();

      if (isWebcamSharing && localStreams.webcam) {
        console.log(`새 참가자 ${participant.socketId}에게 웹캠 스트림 공유`);
        localStreams.webcam.getTracks().forEach((track) => {
          peerState.pc.addTrack(track, localStreams.webcam!);
        });
      }

      if (isScreenSharing && localStreams.screen) {
        console.log(`새 참가자 ${participant.socketId}에게 화면공유 스트림 공유`);
        localStreams.screen.getTracks().forEach((track) => {
          peerState.pc.addTrack(track, localStreams.screen!);
        });
      }

      // 시그널링 협상 시작
      try {
        const offer = await peerState.pc.createOffer();
        await peerState.pc.setLocalDescription(offer);

        const { socket, roomKey } = get();
        if (!socket || !roomKey) return;

        socket.emit('signal:offer', roomKey, {
          content: offer,
          to: participant.socketId,
        });
      } catch (err) {
        console.error('시그널링 협상 중 오류:', err);
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

      // 피 연결 해제
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

    socket.on('signal:trackInfo', (data: SignalData<{ trackId: string; mediaType: string }>) => {
      const { senderSocketId, content } = data;

      set((state) => {
        const participantIndex = state.participants.findIndex((p) => p.socketId === senderSocketId);
        if (participantIndex === -1) return state;

        const updatedParticipants = [...state.participants];
        const participant = updatedParticipants[participantIndex];

        if (!participant.trackInfo) {
          participant.trackInfo = {};
        }

        participant.trackInfo[content.trackId] = content.mediaType;

        return { participants: updatedParticipants };
      });
    });

    socket.on('signal:removeTrack', (data: SignalData<{ mediaType: string }>) => {
      const { senderSocketId, content } = data;

      set((state) => {
        const participantIndex = state.participants.findIndex((p) => p.socketId === senderSocketId);

        if (participantIndex === -1) return state;

        const updatedParticipants = [...state.participants];
        const participant = updatedParticipants[participantIndex];

        // 해당 미디어 타입의 스트림 제거
        if (participant.streams && participant.streams[content.mediaType]) {
          participant.streams[content.mediaType]?.getTracks().forEach((track) => track.stop());
          delete participant.streams[content.mediaType];
        }

        return { participants: updatedParticipants };
      });
    });

    // 채팅 관련 코드 추가
    socket.on('chat:receive', (message: ChatMessage) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });
  };

  // 시그널링 처리 함수들
  const handleOffer = async (data: SignalData<RTCSessionDescriptionInit>) => {
    const { senderSocketId, content } = data;
    const { pc, polite, makingOffer } = createPeerConnection(senderSocketId);

    const offerCollision = pc.signalingState !== 'stable' || makingOffer;

    if (offerCollision && !polite) {
      console.log('오퍼 충돌 발생: impolite 피어는 오퍼를 무시합니다.');
      return;
    }

    if (offerCollision && polite) {
      console.log('오퍼 충돌 발생: polite 피어는 오퍼를 처리합니다.');
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(content));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const { socket, roomKey } = get();
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
    const pc = peerConnections[senderSocketId]?.pc;

    if (!pc) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(content));
    } catch (err) {
      console.error('Answer 처리 중 오류 발생:', err);
    }
  };

  const handleIceCandidate = async (data: SignalData<RTCIceCandidateInit>) => {
    const { senderSocketId, content } = data;
    const pc = peerConnections[senderSocketId]?.pc;

    if (!pc) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(content));
    } catch (err) {
      console.error('ICE 후보 처리 중 오류 발생:', err);
    }
  };

  // 내부 함수: 통화 시작
  const initiateCall = async (socketId: string) => {
    const state = createPeerConnection(socketId);
    const pc = state.pc;

    const { socket, roomKey } = get();
    if (!socket || !roomKey) return;

    try {
      state.makingOffer = true;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('signal:offer', roomKey, {
        content: pc.localDescription,
        to: socketId,
      });
    } catch (err) {
      console.error('통화 시작 중 오류 발생:', err);
    } finally {
      state.makingOffer = false;
    }
  };

  // 로컬 스트림 추가
  const addLocalStream = (stream: MediaStream, type: keyof Streams) => {
    set((state) => ({
      localStreams: {
        ...state.localStreams,
        [type]: stream,
      },
    }));

    // 기존 피어 연결에 트랙 추가
    Object.entries(peerConnections).forEach(async ([targetSocketId, { pc }]) => {
      stream.getTracks().forEach((track: MediaStreamTrack) => {
        addTrackWithMetadata(pc, track, stream, type, targetSocketId);
      });

      // 새로운 오퍼 생성 및 전송
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const { socket, roomKey } = get();
        if (socket && roomKey) {
          socket.emit('signal:offer', roomKey, {
            content: offer,
            to: targetSocketId,
          });
        }
      } catch (err) {
        console.error('트랙 추가 후 시그널링 중 오류:', err);
      }
    });
  };

  // 로컬 스트림 제거
  const removeLocalStream = (type: keyof Streams) => {
    const stream = get().localStreams[type];
    if (stream) {
      // 피어 연결에서 해당 트랙 제거
      Object.entries(peerConnections).forEach(async ([socketId, { pc }]) => {
        const senders = pc.getSenders();
        const tracksToRemove = senders.filter((sender) =>
          stream.getTracks().includes(sender.track!),
        );

        // 트랙 제거 및 시그널링
        for (const sender of tracksToRemove) {
          pc.removeTrack(sender);

          // 트랙 제거 시그널링
          const { socket, roomKey } = get();
          if (socket && roomKey) {
            socket.emit('signal:removeTrack', roomKey, {
              to: socketId,
              mediaType: type,
            });
          }
        }

        // 새로운 offer 생성 및 전송
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          const { socket, roomKey } = get();
          if (socket && roomKey) {
            socket.emit('signal:offer', roomKey, {
              content: offer,
              to: socketId,
            });
          }
        } catch (err) {
          console.error('트랙 제거 후 시그널링 중 오류:', err);
        }
      });

      // 스트림의 트랙 정지
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

      set((state) => ({
        localStreams: {
          ...state.localStreams,
          [type]: undefined,
        },
      }));
    }
  };

  // 화면 공유 토글
  const toggleScreenShare = async () => {
    const { isScreenSharing, socket, roomKey } = get();

    if (!socket || !roomKey) {
      console.error('Socket is not initialized');
      return;
    }

    if (!isScreenSharing) {
      try {
        const screenStream = (await navigator.mediaDevices.getDisplayMedia({
          video: true,
        })) as CustomMediaStream;
        screenStream.streamType = 'screen';

        set((state) => ({
          localStreams: {
            ...state.localStreams,
            screen: screenStream,
          },
          isScreenSharing: true,
        }));

        // 시그널링 순서 보장을 위해 순차적으로 처리
        for (const [socketId, { pc }] of Object.entries(peerConnections)) {
          console.log('피어에 화면공유 트랙 추가:', socketId);

          screenStream.getTracks().forEach((track) => {
            addTrackWithMetadata(pc, track, screenStream, 'screen', socketId);
          });

          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('signal:offer', roomKey, {
              content: offer,
              to: socketId,
            });
          } catch (err) {
            console.error('화면공유 시그널링 중 오류:', err);
          }
        }
      } catch (err) {
        console.error('화면공유 활성화 중 오류:', err);
      }
    } else {
      removeLocalStream('screen');
      set({ isScreenSharing: false });
    }
  };

  // 웹캠 공유 토글 (마이크 제외)
  const toggleWebcamShare = async () => {
    const { isWebcamSharing, socket, roomKey } = get();

    if (!socket || !roomKey) {
      console.error('Socket is not initialized');
      return;
    }

    if (!isWebcamSharing) {
      try {
        const mediaStream = (await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })) as CustomMediaStream;
        mediaStream.streamType = 'webcam';

        // 상태 업데이트
        set((state) => ({
          localStreams: {
            ...state.localStreams,
            webcam: mediaStream,
          },
          isWebcamSharing: true,
        }));

        // 모든 피어 연결에 트랙 추가 및 시그널링 시작
        for (const [socketId, { pc }] of Object.entries(peerConnections)) {
          console.log('피어에 웹캠 트랙 추가:', socketId);
          mediaStream.getTracks().forEach((track) => {
            addTrackWithMetadata(pc, track, mediaStream, 'webcam', socketId);
          });

          // 시그널링 협상 시작
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit('signal:offer', roomKey, {
              content: offer,
              to: socketId,
            });
          } catch (err) {
            console.error('시그널링 협상 중 오류:', err);
          }
        }
      } catch (err) {
        console.error('웹캠 활성화 중 오류:', err);
      }
    } else {
      removeLocalStream('webcam');
      set({ isWebcamSharing: false });
    }
  };

  // 마이크 토글
  const toggleMicrophone = async () => {
    const { isMicrophoneOn } = get();

    if (!isMicrophoneOn) {
      try {
        // 마이크 스트림 생성
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        // 로컬 스트림에 마이크 스트림 추가
        addLocalStream(micStream, 'microphone');

        set({ isMicrophoneOn: true });
      } catch (error) {
        console.error('마이크 사용 중 오류 발생:', error);
      }
    } else {
      // 마이크 스트림 제거
      removeLocalStream('microphone');
      set({ isMicrophoneOn: false });
    }
  };

  // 채팅창 토글
  const toggleChat = () => {
    set((state) => ({ isChatOpen: !state.isChatOpen }));
  };

  // 트랙 추가 함수 수정
  const addTrackWithMetadata = (
    pc: RTCPeerConnection,
    track: MediaStreamTrack,
    stream: MediaStream,
    type: keyof Streams,
    targetSocketId: string,
  ) => {
    const transceiver = pc.addTransceiver(track, {
      streams: [stream],
      direction: 'sendonly',
    });

    const { socket, roomKey } = get();
    if (socket && roomKey) {
      socket.emit('signal:trackInfo', roomKey, {
        to: targetSocketId,
        trackId: track.id,
        mediaType: type,
      });
    }

    return transceiver;
  };

  // 메시지 전송 함수 수정
  const sendMessage = (content: string) => {
    const { socket, roomKey } = get();
    const urlParams = new URLSearchParams(window.location.search);
    const nickname = urlParams.get('nickname');

    if (!socket || !socket.id || !roomKey || !nickname) {
      console.error('필요한 정보가 없습니다.');
      return;
    }

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random()}`,
      sender: nickname,
      senderSocketId: socket.id, // 추가된 부분
      content,
      timestamp: Date.now(),
    };

    socket.emit('chat:send', roomKey, message);
    set((state) => ({
      messages: [...state.messages, message],
    }));
  };

  return {
    socket: null,
    roomKey: null,
    participants: [],
    localStreams: {},
    isScreenSharing: false,
    isWebcamSharing: false,
    isMicrophoneOn: false,
    isChatOpen: false,
    messages: [],

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
        set({
          roomKey: null,
          participants: [],
          messages: [],
          localStreams: {},
          isScreenSharing: false,
          isWebcamSharing: false,
          isMicrophoneOn: false,
        });

        // 모든 피어 연결 해제
        Object.values(peerConnections).forEach(({ pc }) => pc.close());

        // peerConnections 객체 초기화
        Object.keys(peerConnections).forEach((key) => {
          delete peerConnections[key];
        });

        // 로컬 스트림 정리
        Object.values(get().localStreams).forEach((stream) => {
          if (stream) {
            stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          }
        });
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

    // 메시지 전송 함수 수정
    sendMessage,
  };
});

export default useCommunicationStore;
