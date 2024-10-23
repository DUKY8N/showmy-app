'use client';
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
      <a className={`${style.button} ${style[color]}`} href={href} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button className={`${style.button} ${style[color]}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
