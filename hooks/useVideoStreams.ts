import React, { useEffect } from 'react';
import useCommunicationStore from '@/store/useCommunicationStore';

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
  const { participants, localStreams } = useCommunicationStore();

  useEffect(() => {
    // 로컬 비디오 스트림 설정
    if (localStreams.webcam && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreams.webcam;
    }
    if (localStreams.screen && screenShareVideoRef.current) {
      screenShareVideoRef.current.srcObject = localStreams.screen;
    }

    // 참가자 비디오 스트림 설정
    participants.forEach((participant) => {
      const streams = participant.streams;
      const participantRefs = participantVideoRefs.get(participant.socketId);

      if (participantRefs && streams) {
        // streams가 정의되었는지 확인
        if (streams.webcam && participantRefs.webcam.current) {
          participantRefs.webcam.current.srcObject = streams.webcam;
        }
        if (streams.screen && participantRefs.screenShare.current) {
          participantRefs.screenShare.current.srcObject = streams.screen;
        }
      }
    });
  }, [participants, localStreams, localVideoRef, screenShareVideoRef, participantVideoRefs]);

  return null;
};

export default useVideoStreams;
