import React from 'react';
import Image from 'next/image';
import styles from './ThumbnailVideo.module.css';

type ThumbnailVideoProps = {
  isFocus?: boolean;
  isScreenSharing?: boolean;
} & React.ComponentPropsWithRef<'video'>;

const ThumbnailVideo = React.forwardRef<HTMLVideoElement, ThumbnailVideoProps>(
  ({ isFocus = false, isScreenSharing = false, ...rest }, ref) => {
    return (
      <div
        className={`
          ${styles['thumbnail-video']}
          ${isFocus ? styles.focus : ''}
          ${isScreenSharing ? styles['screen-sharing'] : ''}
        `}
      >
        <video ref={ref} autoPlay playsInline muted {...rest} />
        <div className={styles.nickname}>
          <Image
            src={isScreenSharing ? '/screen-share-white.svg' : '/person-white.svg'}
            alt={'icon'}
            width={12}
            height={12}
          />
          <span>테스트</span>
        </div>
      </div>
    );
  },
);

ThumbnailVideo.displayName = 'ThumbnailVideo';

export default ThumbnailVideo;
