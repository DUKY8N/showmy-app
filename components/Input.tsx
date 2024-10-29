import React, { forwardRef } from 'react';
import style from './Input.module.css';

type InputProps = {
  label?: string;
  placeholder?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, placeholder }, ref) => {
  return (
    <div className={style['input-container']}>
      {label ? <label htmlFor="nickname">{label}</label> : null}
      <input id="nickname" type="text" placeholder={placeholder} ref={ref} autoComplete="off" />
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
