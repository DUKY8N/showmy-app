import Image from 'next/image';
import styles from './ThumbnailVideo.module.css';

type ThumbnailVideoProps = {
  isFocus?: boolean;
  isScreenSharing?: boolean;
};
const ThumbnailVideo = ({ isFocus = false, isScreenSharing = false }: ThumbnailVideoProps) => {
  return (
    <div
      className={`
        ${styles['thumbnail-video']}
        ${isFocus ? styles.focus : ''}
        ${isScreenSharing ? styles['screen-sharing'] : ''}
      `}
    >
      <video />
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
};

export default ThumbnailVideo;
