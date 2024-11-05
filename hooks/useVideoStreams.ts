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

      console.log('참가자 스트림 설정 상세:', {
        socketId: participant.socketId,
        streams,
        hasWebcamRef: !!participantRefs?.webcam.current,
        hasScreenShareRef: !!participantRefs?.screenShare.current,
        webcamStream: streams?.webcam,
        screenStream: streams?.screen,
      });

      if (participantRefs && streams) {
        // 웹캠 스트림 설정
        if (participantRefs.webcam.current) {
          participantRefs.webcam.current.srcObject = streams.webcam || null;
          if (streams.webcam) {
            participantRefs.webcam.current.play().catch(console.error);
          }
        }

        // 화면 공유 스트림 설정
        if (participantRefs.screenShare.current) {
          const screenStream = streams.screen;
          if (screenStream) {
            console.log('화면 공유 스트림 설정 시도:', {
              socketId: participant.socketId,
              stream: screenStream,
              tracks: screenStream.getTracks().map((t) => ({
                id: t.id,
                kind: t.kind,
                enabled: t.enabled,
              })),
            });

            participantRefs.screenShare.current.srcObject = screenStream;
            participantRefs.screenShare.current.play().catch((error) => {
              console.error('화면 공유 재생 실패:', error);
            });
          } else {
            participantRefs.screenShare.current.srcObject = null;
          }
        }
      }
    });
  }, [participants, localStreams, localVideoRef, screenShareVideoRef, participantVideoRefs]);
};

export default useVideoStreams;
