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
  const { localStreams, participants } = useSocketStore();

  // 로컬 비디오 스트림 설정
  useEffect(() => {
    localStreams.forEach((stream) => {
      const videoTrackLabel = stream.getVideoTracks()[0]?.label || '';
      const isScreenShare = /Screen|Entire screen|Window/.test(videoTrackLabel);

      const targetRef = isScreenShare ? screenShareVideoRef : localVideoRef;

      if (targetRef?.current) targetRef.current.srcObject = stream;
    });
  }, [localStreams, localVideoRef, screenShareVideoRef]);

  // 참여자 비디오 스트림 설정
  useEffect(() => {
    participants.forEach((participant) => {
      const videoRefs = participantVideoRefs.get(participant.socketId);
      if (!videoRefs) return;

      (participant.streams || []).forEach((stream) => {
        const videoTrackLabel = stream.getVideoTracks()[0]?.label || '';
        const isScreenShare = /Screen|Entire screen|Window/.test(videoTrackLabel);
        const targetRef = isScreenShare ? videoRefs.screenShare : videoRefs.webcam;

        if (targetRef?.current) targetRef.current.srcObject = stream;
      });
    });
  }, [participants, participantVideoRefs]);
};

export default useVideoStreams;
