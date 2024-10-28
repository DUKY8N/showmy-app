import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './LogoIconButton.module.css';

type LogoIconButtonProps = {
  tooltip?: string;
  href?: string;
  onClick?: () => void;
};
const LogoIconButton = ({ tooltip, onClick, href }: LogoIconButtonProps) => {
  if (href) {
    return (
      <Link className={styles['logo-icon-button']} href={href} onClick={onClick}>
        {tooltip ? <span>{tooltip}</span> : null}
        <Image src={'/small-dark-logo.png'} alt={'icon'} width={51} height={51} />
      </Link>
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
