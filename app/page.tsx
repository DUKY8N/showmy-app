import Image from 'next/image';
import styles from './page.module.css';
import Button from '@/components/Button';
import Logo from './Logo';

const Page = () => {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <p>다양한 사람들과 실시간 화상통화, 화면 공유, 채팅을 한 번에!</p>
        <p>어디너사 나를 쉽고 빠르게 공유하는 방법</p>
        <div className={styles.buttons}>
          <Button>방 입장</Button>
          <Button href="#">방 생성</Button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={`${styles['features-section']} }`}>
          <Article title="간편한 사용">
            <p>로그인이나 회원가입 없이도 즉시 방을 만들고, 생성된 링크를 공유하실 수 있습니다.</p>
            <p>
              링크를 받은 사람들은 별도의 과정 없이 바로 접속하여, 실시간으로 화상통화, 화면 공유,
              채팅을 시작할 수 있습니다.
            </p>
          </Article>
          <Article title="개인 정보 보호">
            <p>로그인이나 회원가입이 필요 없이 완전히 익명으로 사용할 수 있습니다.</p>
            <p>
              또한, WebRTC 기술을 통해 통화 내용이 서버를 거치지 않고 사용자 간 직접 연결되는 종단
              간 통신을 제공합니다.
            </p>
          </Article>
          <Article title="브라우저 기반">
            <p>별도의 소프트웨어 설치 없이, 브라우저만 있으면 바로 사용할 수 있습니다. </p>
            <p>
              모든 기능이 웹 브라우저에서 원활히 작동하도록 설계되어, 어떤 환경에서도 간편하게
              접근할 수 있습니다.
            </p>
          </Article>
          <Article title="모든 기능 무료">
            <p>
              화상통화, 화면 공유, 채팅 등 필요한 모든 기능을 비용 부담 없이 이용할 수 있으며,
              서비스 내 광고도 전혀 없습니다.
            </p>
            <p>불필요한 방해 요소 없이 오직 소통과 협업에 집중할 수 있습니다.</p>
          </Article>
          <Article title="제한 없는 인원 수">
            <p>인원 제한 없이 다양한 사람들과 함께 소통할 수 있도록 설계되었습니다.</p>
            <p>
              회의, 그룹 스터디, 가족 모임 등 어떤 상황에서도 원하는 만큼 참여자를 초대할 수
              있습니다.
            </p>
          </Article>
          <Article title="완전한 오픈 소스">
            <p>
              Show My는 완전한 오픈소스 프로젝트로, 누구나 소스 코드를 열람하고 수정할 수 있습니다.
            </p>
            <p>
              코드의 투명성을 보장하여 사용자들이 신뢰할 수 있는 환경에서 사용할 수 있으며,
              커뮤니티의 기여와 피드백을 환영합니다.
            </p>
          </Article>
        </section>
      </main>

      <Footer />
    </div>
  );
};

type ArticleProps = {
  children: React.ReactNode;
  title: string;
};
const Article = ({ children, title }: ArticleProps) => {
  return (
    <article className={styles['features-article']}>
      <h2>{title}</h2>
      {children}
    </article>
  );
};

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a href="https://github.com/DUKY8N/showmy-app" target="_blank" rel="noopener noreferrer">
        <Image src="/github-aqua-800.svg" alt="Globe icon" width={18} height={18} />
        View on GitHub →
      </a>
    </footer>
  );
};

export default Page;
