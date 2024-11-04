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
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreams.webcam || null;
      console.log('로컬 웹캠 스트림 설정:', localStreams.webcam);
    }

    if (screenShareVideoRef.current) {
      screenShareVideoRef.current.srcObject = localStreams.screen || null;
      console.log('로컬 화면공유 스트림 설정:', localStreams.screen);
    }

    // 참가자 비디오 스트림 설정
    participants.forEach((participant) => {
      const streams = participant.streams;
      const participantRefs = participantVideoRefs.get(participant.socketId);

      console.log(`참가자 ${participant.socketId} 스트림 설정:`, streams);

      if (participantRefs && streams) {
        if (participantRefs.webcam.current) {
          participantRefs.webcam.current.srcObject = streams.webcam || null;
          if (streams.webcam) {
            participantRefs.webcam.current.play().catch(console.error);
          }
        }
        if (participantRefs.screenShare.current) {
          participantRefs.screenShare.current.srcObject = streams.screen || null;
          if (streams.screen) {
            participantRefs.screenShare.current.play().catch(console.error);
          }
        }
      }
    });
  }, [participants, localStreams, localVideoRef, screenShareVideoRef, participantVideoRefs]);
};

export default useVideoStreams;
