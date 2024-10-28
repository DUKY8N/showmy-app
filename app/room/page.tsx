'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import ThumbnailVideo from '@/components/ThumbnailVideo';
import PillButton from '@/components/PillButton';
import LogoIconButton from '@/components/LogoIconButton';

const page = () => {
  return (
    <div className={styles.page}>
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
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isScreenSharingOn, setIsScreenSharingOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleWebcamHandler = () => {
    setIsWebcamOn((prev) => !prev);
  };
  const toggleScreenShareHandler = () => {
    setIsScreenSharingOn((prev) => !prev);
  };
  const toggleMuteHandler = () => {
    setIsMicOn((prev) => !prev);
  };
  const toggleChatHandler = () => {
    setIsChatOpen((prev) => !prev);
  };

  return (
    <div className={styles['user-control-buttons']}>
      <div className={styles['left-buttons']}>
        <LogoIconButton tooltip="나가기" />
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

export default page;
