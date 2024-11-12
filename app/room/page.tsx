'use client';

import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import ThumbnailVideo from '@/components/ThumbnailVideo';
import PillButton from '@/components/PillButton';
import LogoIconButton from '@/components/LogoIconButton';
import useSocketStore from '@/store/useCommunicationStore';
import useVideoStreams from '@/hooks/useVideoStreams';
import SendMessageForm from '@/components/SendMessageForm';

const PageContent = () => {
  const { participants = [], localStreams } = useSocketStore();
  const searchParams = useSearchParams();
  const [focusedStream, setFocusedStream] = useState<{
    stream: MediaStream;
    nickname: string;
  } | null>(null);

  const nickname = searchParams.get('nickname');

  // 로컬 웹캠 및 화면 공유용 레퍼런스
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);

  // 각 참가자의 비디오 및 오디오 레퍼런스를 생성
  const participantVideoRefs = useMemo(() => {
    const refsMap = new Map();
    participants.forEach((participant) => {
      refsMap.set(participant.socketId, {
        webcam: React.createRef<HTMLVideoElement>(),
        screenShare: React.createRef<HTMLVideoElement>(),
      });
    });
    return refsMap;
  }, [participants]);

  const participantAudioRefs = useMemo(() => {
    const refsMap = new Map();
    participants.forEach((participant) => {
      refsMap.set(participant.socketId, React.createRef<HTMLAudioElement>());
    });
    return refsMap;
  }, [participants]);

  // useVideoStreams 훅을 통해 로컬 및 참가자 비디오 설정
  useVideoStreams({
    localVideoRef,
    screenShareVideoRef,
    participantVideoRefs,
    participantAudioRefs,
  });

  const handleVideoFocus = (stream: MediaStream, nickname: string) => {
    setFocusedStream({ stream, nickname });
  };

  // FocusVideo 컴포넌트를 메모이제이션
  const memoizedFocusVideo = useMemo(
    () => <FocusVideo focusedStream={focusedStream} />,
    [focusedStream],
  );

  return (
    <div className={styles.page}>
      <div className={styles['app-container']}>
        <UserThumbnailVideosList>
          <UserThumbnailVideos>
            <ThumbnailVideo
              ref={localVideoRef}
              isFocus={focusedStream?.stream === localStreams?.webcam}
              autoPlay
              playsInline
              muted
              nickname={`${nickname} (Me)`}
              onClick={() =>
                localStreams.webcam && handleVideoFocus(localStreams.webcam, `${nickname} (Me)`)
              }
            />
            {localStreams?.screen && (
              <ThumbnailVideo
                ref={screenShareVideoRef}
                isScreenSharing={true}
                isFocus={focusedStream?.stream === localStreams.screen}
                autoPlay
                playsInline
                nickname={`${nickname} (Me)`}
                onClick={() => handleVideoFocus(localStreams.screen!, `${nickname} (Me)`)}
              />
            )}
          </UserThumbnailVideos>
          {participants.map((participant) => (
            <div key={participant.socketId}>
              <UserThumbnailVideos>
                <ThumbnailVideo
                  ref={participantVideoRefs.get(participant.socketId)?.webcam}
                  isFocus={focusedStream?.stream === participant.streams?.webcam}
                  autoPlay
                  playsInline
                  nickname={participant.userName}
                  onClick={() =>
                    participant.streams.webcam &&
                    handleVideoFocus(participant.streams.webcam, participant.userName)
                  }
                />
                {participant.streams?.screen && (
                  <ThumbnailVideo
                    ref={participantVideoRefs.get(participant.socketId)?.screenShare}
                    isScreenSharing={true}
                    isFocus={focusedStream?.stream === participant.streams.screen}
                    autoPlay
                    playsInline
                    nickname={participant.userName}
                    onClick={() =>
                      handleVideoFocus(participant.streams.screen!, participant.userName)
                    }
                  />
                )}
              </UserThumbnailVideos>

              {participant.streams?.microphone && (
                <audio ref={participantAudioRefs.get(participant.socketId)} autoPlay playsInline />
              )}
            </div>
          ))}
        </UserThumbnailVideosList>

        {memoizedFocusVideo}

        <UserControlButtons />
      </div>

      <ChatContainer />
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
};

type UserThumbnailVideosListProps = {
  children?: React.ReactNode;
};
const UserThumbnailVideosList = ({ children }: UserThumbnailVideosListProps) => {
  return (
    <div className={styles['user-thumbnail-videos-list']}>
      <Image src="/left.svg" alt="icon" width={19} height={19} />
      {children}
      <Image src="/right.svg" alt="icon" width={19} height={19} />
    </div>
  );
};

type UserThumbnailVideosProps = {
  children: React.ReactNode;
};
const UserThumbnailVideos = ({ children }: UserThumbnailVideosProps) => {
  return <div className={styles['user-thumbnail-videos']}>{children}</div>;
};

type FocusVideoProps = {
  focusedStream: {
    stream: MediaStream;
    nickname: string;
  } | null;
};

const FocusVideo = React.memo(({ focusedStream }: FocusVideoProps) => {
  return (
    <div className={styles['focus-video-wrapper']}>
      {focusedStream && (
        <>
          <video
            ref={(el) => {
              if (el) {
                el.srcObject = focusedStream.stream;
              }
            }}
            className={styles['focus-video']}
            autoPlay
            playsInline
          />
          <div className={styles['focus-video-nickname']}>{focusedStream.nickname}</div>
        </>
      )}
    </div>
  );
});
FocusVideo.displayName = 'FocusVideo';

const UserControlButtons = () => {
  const {
    roomKey,
    isWebcamSharing,
    isScreenSharing,
    isMicrophoneOn,
    isChatOpen,
    toggleWebcamShare,
    toggleScreenShare,
    toggleMicrophone,
    toggleChat,
    leaveRoom,
  } = useSocketStore();

  const toggleWebcamHandler = async () => {
    await toggleWebcamShare();
  };
  const toggleScreenShareHandler = async () => {
    await toggleScreenShare();
  };
  const toggleMuteHandler = async () => {
    await toggleMicrophone();
  };
  const toggleChatHandler = () => {
    toggleChat();
  };

  const copyRoomKeyToClipboard = async () => {
    await navigator.clipboard.writeText(roomKey ?? '');
  };

  return (
    <div className={styles['user-control-buttons']}>
      <div className={styles['left-buttons']}>
        <LogoIconButton href="/" tooltip="나가기" onClick={leaveRoom} />
        <PillButton
          icon="link"
          color="dark-aqua"
          showActive={true}
          onClick={copyRoomKeyToClipboard}
        >
          초대 링크 복사하기
        </PillButton>
      </div>

      <div className={styles['middle-buttons']}>
        <PillButton
          icon={isWebcamSharing ? 'person' : 'person-off'}
          color={isWebcamSharing ? 'red' : 'dark'}
          showActive={false}
          onClick={toggleWebcamHandler}
        >
          웹캠 공유
        </PillButton>
        <PillButton
          icon={isScreenSharing ? 'screen-share' : 'screen-share-off'}
          color={isScreenSharing ? 'red' : 'dark'}
          showActive={false}
          onClick={toggleScreenShareHandler}
        >
          화면 공유
        </PillButton>
        <PillButton
          icon={isMicrophoneOn ? 'mic' : 'mic-off'}
          color={isMicrophoneOn ? 'red' : 'dark'}
          showActive={false}
          onClick={toggleMuteHandler}
        >
          음소거
        </PillButton>
        <PillButton
          icon="chat"
          color={isChatOpen ? 'white' : 'dark'}
          showActive={false}
          onClick={toggleChatHandler}
        />
      </div>
    </div>
  );
};

const ChatContainer = () => {
  const { messages, sendMessage, isChatOpen, socket } = useSocketStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (messageContent: string) => {
    sendMessage(messageContent);
  };

  return (
    <div
      className={`
        ${styles['chat-container']}
        ${isChatOpen ? styles.show : ''}
      `}
    >
      <div className={styles['chat-messages']}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`
              ${styles['chat-message']}
              ${msg.senderSocketId === socket?.id ? styles['my-message'] : ''}
            `}
          >
            <span className={styles['message-sender']}>{msg.sender}</span>
            <div className={styles['bottom-container']}>
              <span className={styles['message-content']}>{msg.content}</span>
              <span className={styles['message-time']}>
                {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <SendMessageForm onSubmit={handleSubmit} className={styles['send-message-form']} />
    </div>
  );
};

export default Page;
