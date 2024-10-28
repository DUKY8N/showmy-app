import { create } from 'zustand';

interface MediaState {
  isWebcamOn: boolean;
  isScreenSharingOn: boolean;
  isMicOn: boolean;
  isChatOpen: boolean;

  toggleWebcam: () => void;
  toggleScreenSharing: () => void;
  toggleMic: () => void;
  toggleChat: () => void;

  resetAll: () => void;
}

const useMediaStore = create<MediaState>((set) => ({
  isWebcamOn: false,
  isScreenSharingOn: false,
  isMicOn: false,
  isChatOpen: false,

  toggleWebcam: () => set((state) => ({ isWebcamOn: !state.isWebcamOn })),
  toggleScreenSharing: () => set((state) => ({ isScreenSharingOn: !state.isScreenSharingOn })),
  toggleMic: () => set((state) => ({ isMicOn: !state.isMicOn })),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  resetAll: () =>
    set({
      isWebcamOn: false,
      isScreenSharingOn: false,
      isMicOn: false,
      isChatOpen: false,
    }),
}));

export default useMediaStore;
