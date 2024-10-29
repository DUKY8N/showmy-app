// stores/useSocketStore.ts
import { create } from 'zustand';
import io, { Socket } from 'socket.io-client';

interface Participant {
  socketId: string;
  userName: string;
}

interface SignalData {
  content: string;
  to: string;
}

interface SocketState {
  socket: Socket | null;
  roomKey: string | null;
  participants: Participant[];

  initSocket: () => void;
  createRoom: (userName: string) => Promise<string>;
  joinRoom: (roomKey: string, userName: string) => void;
  sendOffer: (data: SignalData) => void;
  sendAnswer: (data: SignalData) => void;
  sendIceCandidate: (data: SignalData) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (socketId: string) => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  roomKey: null,
  participants: [],

  initSocket: () => {
    if (get().socket) return;

    const socket = io('https://localhost:8181', { secure: true });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      set({ socket });
    });

    socket.on('room:joined', (roomKey: string) => {
      set({ roomKey });
    });

    socket.on('room:notFound', () => {
      alert('방을 찾을 수 없습니다.');
    });

    socket.on('room:existingParticipants', (participants: Participant[]) => {
      get().setParticipants(participants);
    });

    socket.on('participant:new', (participant: Participant) => {
      get().addParticipant(participant);
    });

    socket.on('participant:left', (socketId: string) => {
      get().removeParticipant(socketId);
    });
  },
  createRoom: (userName: string) => {
    return new Promise((resolve) => {
      get().socket?.emit('room:create', userName, (roomKey: string) => {
        set({ roomKey });
        resolve(roomKey);
      });
    });
  },
  joinRoom: (roomKey: string, userName: string) => {
    get().socket?.emit('room:join', roomKey, userName);
  },
  sendOffer: (data: SignalData) => {
    get().socket?.emit('signal:offer', get().roomKey, data);
  },
  sendAnswer: (data: SignalData) => {
    get().socket?.emit('signal:answer', get().roomKey, data);
  },
  sendIceCandidate: (data: SignalData) => {
    get().socket?.emit('signal:iceCandidate', get().roomKey, data);
  },
  setParticipants: (participants: Participant[]) => {
    set({ participants });
  },
  addParticipant: (participant: Participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },
  removeParticipant: (socketId: string) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.socketId !== socketId),
    }));
  },
}));

export default useSocketStore;
