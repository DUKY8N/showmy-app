import React from 'react';
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

      <div className={styles['user-control-buttons']}>
        <div className={styles['left-buttons']}>
          <LogoIconButton tooltip="나가기" />
          <PillButton icon="link" color="dark-aqua" showActive={true}>
            초대 링크 복사하기
          </PillButton>
        </div>

        <div className={styles['middle-buttons']}>
          <PillButton icon="person" color="dark" showActive={false}>
            웹캠 공유
          </PillButton>
          <PillButton icon="screen-share" color="dark" showActive={false}>
            화면 공유
          </PillButton>
          <PillButton icon="mic" color="dark" showActive={false}>
            음소거
          </PillButton>
          <PillButton icon="chat" />
        </div>
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

export default page;
