'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import ThumbnailVideo from '@/components/ThumbnailVideo';
import PillButton from '@/components/PillButton';
import LogoIconButton from '@/components/LogoIconButton';
import useSocketStore from '@/store/useCommunicationStore';

const Page = () => {
  const { roomKey, socket, participants, isChatOpen } = useSocketStore();
  const searchParams = useSearchParams();

  const key = searchParams.get('key');
  const nickname = searchParams.get('nickname');

  return (
    <div className={styles.page}>
      <div className={styles['app-container']}>
        <UserThumbnailVideosList>
          <UserThumbnailVideos>
            <ThumbnailVideo isFocus={true} />
            <ThumbnailVideo isScreenSharing={true} />
          </UserThumbnailVideos>
          <UserThumbnailVideos>
            <ThumbnailVideo />
            <ThumbnailVideo isScreenSharing={true} />
          </UserThumbnailVideos>
        </UserThumbnailVideosList>

        <div className={styles['focus-video']} />

        <UserControlButtons />
      </div>

      <div
        className={`
          ${styles['chat-container']}
          ${isChatOpen ? styles.show : ''}
        `}
      >
        <p>key: {key}</p>
        <hr />
        <p>nickname: {nickname}</p>
        <hr />
        <p>socket: {String(socket)}</p>
        <hr />
        <p>roomKey: {roomKey}</p>
        <hr />
        <p>participants: {participants.map((p) => p.userName).join(' ')}</p>
        <hr />
      </div>
    </div>
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

export default Page;
