import React, { useEffect } from 'react';
import useSocketStore from '@/store/useCommunicationStore';

interface VideoRefs {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  screenShareVideoRef: React.RefObject<HTMLVideoElement>;
  participantVideoRefs: Map<
    string,
    {
      webcam: React.RefObject<HTMLVideoElement>;
      screenShare: React.RefObject<HTMLVideoElement>;
    }
  >;
}

const useVideoStreams = ({
  localVideoRef,
  screenShareVideoRef,
  participantVideoRefs,
}: VideoRefs) => {
  const { participants, localStreams } = useSocketStore();

  useEffect(() => {
    // 로컬 비디오 설정
    if (localStreams[0] && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreams[0];
    }
    if (localStreams[1] && screenShareVideoRef.current) {
      screenShareVideoRef.current.srcObject = localStreams[1];
    }

    participants.forEach((participant) => {
      const streams = participant.streams;
      const participantRefs = participantVideoRefs.get(participant.socketId);

      if (participantRefs) {
        if (streams?.webcam && participantRefs.webcam.current) {
          participantRefs.webcam.current.srcObject = streams.webcam;
        }
        if (streams?.screen && participantRefs.screenShare.current) {
          participantRefs.screenShare.current.srcObject = streams.screen;
        }
      }
    });
  }, [participants, localStreams, localVideoRef, screenShareVideoRef, participantVideoRefs]);

  return null;
};

export default useVideoStreams;
