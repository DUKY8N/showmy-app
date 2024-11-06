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

  // 비디오 엘리먼트에 스트림 설정하는 함수
  const setVideoStream = useCallback(
    async (videoRef: React.RefObject<HTMLVideoElement>, stream: MediaStream | null | undefined) => {
      // 스트림이 준비되었는지 확인하는 함수를 내부로 이동
      const isStreamReady = (stream: MediaStream | null | undefined): boolean => {
        if (!stream) return false;
        const tracks = stream.getTracks();
        return tracks.length > 0 && tracks.every((track) => track.readyState === 'live');
      };

      // 비디오 엘리먼트가 없거나 스트림이 준비되지 않은 경우 조기 반환
      if (!videoRef.current || !stream || !isStreamReady(stream)) {
        return;
      }

      try {
        // 현재 srcObject와 새 스트림이 같으면 스킵
        if (videoRef.current.srcObject === stream) {
          return;
        }

        videoRef.current.srcObject = stream;

        // loadedmetadata 이벤트를 기다림
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not found'));
            return;
          }

          const handleLoadedMetadata = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            resolve();
          };

          const handleError = () => {
            video.removeEventListener('error', handleError);
            reject(new Error('Video loading failed'));
          };

          if (video.readyState >= 2) {
            resolve();
          } else {
            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('error', handleError);
          }
        });

        // 재생 시도
        if (videoRef.current) {
          try {
            await videoRef.current.play();
          } catch (playError) {
            console.warn('자동 재생 실패, 음소거 후 재시도:', playError);
            if (videoRef.current) {
              videoRef.current.muted = true;
              try {
                await videoRef.current.play();
              } catch (mutedPlayError) {
                console.error('음소거 후에도 재생 실패:', mutedPlayError);
              }
            }
          }
        }
      } catch (error) {
        console.error('비디오 스트림 설정 중 오류:', error);
      }
    },
    [], // 이제 의존성 배열이 비어있을 수 있습니다
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
