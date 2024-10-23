'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

const Logo = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const otherImages = [
    '/example-1.jpg',
    '/example-2.jpg',
    '/example-3.jpg',
    '/example-4.jpg',
    '/example-5.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (imageRef.current) {
        // 이미지 크기 줄이기
        imageRef.current.style.transition = 'transform 0.3s ease-in-out';
        imageRef.current.style.transform = 'scale(0.8)';

        // 300ms 후 이미지 원래 크기로 되돌리고, 이미지 변경
        setTimeout(() => {
          if (imageRef.current) {
            // 원래 크기로
            imageRef.current.style.transform = 'scale(1)';
          }

          // 이미지 인덱스 증가
          setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (otherImages.length * 2));
        }, 300); // 애니메이션 시간만큼 딜레이
      }
    }, 3000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [otherImages.length]);

  const currentImage =
    currentImageIndex % 2 === 0 ? '/logo.png' : otherImages[Math.floor(currentImageIndex / 2)];

  const imageStyle = currentImage === '/logo.png' ? { border: 'none' } : {};

  return (
    <div className={styles.logo}>
      <h1>Show My</h1>
      <Image
        ref={imageRef}
        src={currentImage}
        alt="logo icon"
        width={150}
        height={150}
        quality={100}
        style={imageStyle}
      />
    </div>
  );
};

export default Logo;
