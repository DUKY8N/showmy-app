import React from 'react';
import Image from 'next/image';
import styles from './PillButton.module.css';

type PillButtonProps = {
  children?: React.ReactNode;
  color?: 'dark' | 'white' | 'red' | 'dark-aqua';
  showActive?: boolean;
  icon?:
    | 'link'
    | 'chat'
    | 'mic'
    | 'mic-off'
    | 'person'
    | 'person-off'
    | 'screen-share'
    | 'screen-share-off';
  href?: string;
  onClick?: () => void;
};
const PillButton = ({
  children,
  color = 'dark',
  showActive = false,
  icon,
  href,
  onClick,
}: PillButtonProps) => {
  let iconSrc: string = '/' + icon;

  if (color === 'white') iconSrc += '-gray-800.svg';
  else if (color === 'dark-aqua') iconSrc += '-aqua-500.svg';
  else iconSrc += '-white.svg';

  if (href) {
    return (
      <a
        className={`
          ${styles['pill-button']}
          ${styles[color]}
          ${showActive ? styles.active : ''}
        `}
        href={href}
        onClick={onClick}
      >
        {icon ? <Image src={iconSrc} alt="icon" width={19} height={19} /> : null}
        {children}
      </a>
    );
  }

  return (
    <button
      className={`
        ${styles['pill-button']}
        ${styles[color]}
        ${showActive ? styles['show-active'] : ''}
      `}
      onClick={onClick}
    >
      {icon ? <Image src={iconSrc} alt="icon" width={19} height={19} /> : null}
      {children}
    </button>
  );
};

export default PillButton;
