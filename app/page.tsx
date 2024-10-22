import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.logo}>
          <h1>Show My</h1>
          <Image
            aria-hidden
            src="/logo.png"
            alt="logo icon"
            width={150}
            height={150}
            quality={100}
          />
        </div>
        안녕하세요 바로 시작할 수 있는 Next.js 앱입니다.
      </main>
      <footer className={styles.footer}>
        <a href="https://github.com/DUKY8N/showmy-app" target="_blank" rel="noopener noreferrer">
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          View on GitHub →
        </a>
      </footer>
    </div>
  );
}
