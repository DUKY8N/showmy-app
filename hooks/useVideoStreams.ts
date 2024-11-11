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
  participantAudioRefs: Map<string, React.RefObject<HTMLAudioElement>>;
}

const useVideoStreams = ({
  localVideoRef,
  screenShareVideoRef,
  participantVideoRefs,
  participantAudioRefs,
}: VideoRefs) => {
  const { participants, localStreams } = useCommunicationStore();

  // 비디오 및 오디오 엘리먼트에 스트림 설정하는 함수
  const setMediaStream = useCallback(
    async (
      mediaRef: React.RefObject<HTMLVideoElement | HTMLAudioElement>,
      stream: MediaStream | null | undefined,
    ) => {
      if (!mediaRef.current || !stream) {
        return;
      }

      try {
        if (mediaRef.current.srcObject === stream) {
          return;
        }

        mediaRef.current.srcObject = stream;

        // 재생 시도
        if (mediaRef.current) {
          try {
            await mediaRef.current.play();
          } catch (playError) {
            console.warn('미디어 자동 재생 실패:', playError);
            if ('muted' in mediaRef.current) {
              mediaRef.current.muted = true;
              try {
                await mediaRef.current.play();
              } catch (mutedPlayError) {
                console.error('음소거 후에도 재생 실패:', mutedPlayError);
              }
            }
          }
        }
      } catch (error) {
        console.error('미디어 스트림 설정 중 오류:', error);
      }
    },
    [],
  );

  useEffect(() => {
    // 로컬 스트림 설정
    setMediaStream(localVideoRef, localStreams.webcam);
    setMediaStream(screenShareVideoRef, localStreams.screen);

    // 참가자 스트림 설정
    participants.forEach((participant) => {
      const streams = participant.streams;
      const participantRefs = participantVideoRefs.get(participant.socketId);
      const audioRef = participantAudioRefs.get(participant.socketId);

      if (participantRefs && streams) {
        setMediaStream(participantRefs.webcam, streams.webcam);
        setMediaStream(participantRefs.screenShare, streams.screen);
      }

      // 마이크 스트림 설정
      if (audioRef && streams?.microphone) {
        setMediaStream(audioRef, streams.microphone);
      }
    });
  }, [
    participants,
    localStreams,
    localVideoRef,
    screenShareVideoRef,
    participantVideoRefs,
    participantAudioRefs,
    setMediaStream,
  ]);
};

export default useVideoStreams;
