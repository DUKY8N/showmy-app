import React from 'react';
import style from './Input.module.css';

type InputProps = {
  label?: string;
  placeholder?: string;
  ref?: React.RefObject<HTMLInputElement>;
};
const Input = ({ label, placeholder, ref }: InputProps) => {
  return (
    <div className={style['input-container']}>
      {label ? <label htmlFor="nickname">{label}</label> : null}
      <input id="nickname" type="text" placeholder={placeholder} ref={ref} />
    </div>
  );
};

export default Input;
