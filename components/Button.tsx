import React from 'react';
import Link from 'next/link';
import style from './Button.module.css';

type ButtonProps = {
  children: React.ReactNode;
  color?: 'primary' | 'success' | 'info' | 'warning' | 'important';
  href?: string;
  onClick?: () => void;
};
const Button = ({ children, color = 'primary', href, onClick }: ButtonProps) => {
  if (href) {
    return (
      <Link className={`${style.button} ${style[color]}`} href={href} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button className={`${style.button} ${style[color]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
