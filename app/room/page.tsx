'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import ThumbnailVideo from '@/components/ThumbnailVideo';
import PillButton from '@/components/PillButton';
import LogoIconButton from '@/components/LogoIconButton';
import useMediaStore from '@/store/useMediaStore';

const Page = () => {
  const { resetAll, isChatOpen } = useMediaStore();

  useEffect(() => {
    resetAll();
  }, [resetAll]);

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
      ></div>
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
    isWebcamOn,
    isScreenSharingOn,
    isMicOn,
    isChatOpen,
    toggleWebcam,
    toggleScreenSharing,
    toggleMic,
    toggleChat,
  } = useMediaStore();

  const toggleWebcamHandler = () => {
    toggleWebcam();
  };
  const toggleScreenShareHandler = () => {
    toggleScreenSharing();
  };
  const toggleMuteHandler = () => {
    toggleMic();
  };
  const toggleChatHandler = () => {
    toggleChat();
  };

  return (
    <div className={styles['user-control-buttons']}>
      <div className={styles['left-buttons']}>
        <LogoIconButton href="/" tooltip="나가기" />
        <PillButton icon="link" color="dark-aqua" showActive={true}>
          초대 링크 복사하기
        </PillButton>
      </div>

      <div className={styles['middle-buttons']}>
        <PillButton
          icon={isWebcamOn ? 'person' : 'person-off'}
          color={isWebcamOn ? 'red' : 'dark'}
          showActive={false}
          onClick={toggleWebcamHandler}
        >
          웹캠 공유
        </PillButton>
        <PillButton
          icon={isScreenSharingOn ? 'screen-share' : 'screen-share-off'}
          color={isScreenSharingOn ? 'red' : 'dark'}
          showActive={false}
          onClick={toggleScreenShareHandler}
        >
          화면 공유
        </PillButton>
        <PillButton
          icon={isMicOn ? 'mic' : 'mic-off'}
          color={isMicOn ? 'red' : 'dark'}
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
