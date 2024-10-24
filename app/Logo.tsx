'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

const Logo = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  const otherImages = [
    '/example-1.jpg',
    '/example-2.jpg',
    '/example-3.jpg',
    '/example-4.jpg',
    '/example-5.jpg',
  ];

  const otherImagesDescription = ['Webcam', 'Presentations', 'Code', 'Idea', 'Gaming skills'];

  useEffect(() => {
    const interval = setInterval(() => {
      // CSS 애니메이션 효과
      if (spanRef.current) spanRef.current.style.transform = 'translate(-50%, -10%)';
      if (imageRef.current) imageRef.current.style.transform = 'scale(0.8)';
      if (spanRef.current) spanRef.current.style.opacity = '0';

      // 300ms 후 원래 상태로 되돌리기
      setTimeout(() => {
        if (spanRef.current) spanRef.current.style.transform = 'translate(-50%, -50%)';
        if (imageRef.current) imageRef.current.style.transform = 'scale(1)';

        // 이미지 인덱스 증가
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % (otherImages.length * 2));
      }, 300);
    }, 3000);

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [otherImages.length]);

  useEffect(() => {
    if (currentImageIndex % 2 !== 0) {
      if (spanRef.current) spanRef.current.style.opacity = '1';
    }
  }, [currentImageIndex]);

  const currentImage =
    currentImageIndex % 2 === 0 ? '/logo.png' : otherImages[Math.floor(currentImageIndex / 2)];

  const currentImageDescription =
    currentImageIndex % 2 === 0 ? ' ' : otherImagesDescription[Math.floor(currentImageIndex / 2)];

  const imageStyle = currentImage === '/logo.png' ? { border: 'none' } : {};

  return (
    <div className={styles.logo}>
      <h1>Show My</h1>
      <div className={styles['logo-icon-wrapper']}>
        <Image
          ref={imageRef}
          src={currentImage}
          alt="logo icon"
          width={150}
          height={150}
          quality={100}
          style={imageStyle}
        />
        <span ref={spanRef}>{currentImageDescription}</span>
      </div>
    </div>
  );
};

export default Logo;
