import React, { useEffect, useCallback } from 'react';
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

  // 스트림이 준비되었는지 확인하는 함수
  const isStreamReady = (stream: MediaStream | null | undefined): boolean => {
    if (!stream) return false;
    const tracks = stream.getTracks();
    return tracks.length > 0 && tracks.every((track) => track.readyState === 'live');
  };

  // 비디오 엘리먼트에 스트림 설정하는 함수
  const setVideoStream = useCallback(
    async (videoRef: React.RefObject<HTMLVideoElement>, stream: MediaStream | null | undefined) => {
      if (!videoRef.current) return;

      try {
        videoRef.current.srcObject = stream || null;

        if (stream && isStreamReady(stream)) {
          // loadedmetadata 이벤트를 기다림
          await new Promise((resolve) => {
            const handleLoadedMetadata = () => {
              videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
              resolve(true);
            };
            videoRef.current?.addEventListener('loadedmetadata', handleLoadedMetadata);
          });

          await videoRef.current.play();
        }
      } catch (error) {
        console.error('비디오 스트림 설정 중 오류:', error);
      }
    },
    [],
  );

  useEffect(() => {
    // 로컬 스트림 설정
    setVideoStream(localVideoRef, localStreams.webcam);
    setVideoStream(screenShareVideoRef, localStreams.screen);

    // 참가자 스트림 설정
    participants.forEach((participant) => {
      const streams = participant.streams;
      const participantRefs = participantVideoRefs.get(participant.socketId);

      if (participantRefs && streams) {
        setVideoStream(participantRefs.webcam, streams.webcam);
        setVideoStream(participantRefs.screenShare, streams.screen);
      }
    });
  }, [
    participants,
    localStreams,
    localVideoRef,
    screenShareVideoRef,
    participantVideoRefs,
    setVideoStream,
  ]);
};

export default useVideoStreams;
