import Image from 'next/image';
import React from 'react';
import styles from './LogoIconButton.module.css';

type LogoIconButtonProps = {
  tooltip?: string;
  href?: string;
  onClick?: () => void;
};
const LogoIconButton = ({ tooltip, onClick, href }: LogoIconButtonProps) => {
  if (href) {
    return (
      <a className={styles['logo-icon-button']} href={href} onClick={onClick}>
        {tooltip ? <span>{tooltip}</span> : null}
        <Image src={'/small-dark-logo.png'} alt={'icon'} width={51} height={51} />
      </a>
    );
  }

  return (
    <button className={styles['logo-icon-button']} onClick={onClick}>
      {tooltip ? <span>{tooltip}</span> : null}
      <Image src={'/small-dark-logo.png'} alt={'icon'} width={51} height={51} />
    </button>
  );
};

export default LogoIconButton;
