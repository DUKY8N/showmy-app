import React from 'react';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const anton = localFont({
  src: './fonts/Anton.ttf',
  variable: '--font-anton',
  weight: '100 900',
});
const notoSans = localFont({
  src: './fonts/NotoSansKR.ttf',
  variable: '--font-noto-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Show My',
  description:
    'Show My는 링크 하나로 화면과 웹캠을 간편하게 공유할 수 있는 실시간 협업 웹 도구입니다.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${anton.variable} ${notoSans.variable}`}>{children}</body>
    </html>
  );
}
