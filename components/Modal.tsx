import React from 'react';
import Image from 'next/image';
import style from './Modal.module.css';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};
const Modal = ({ children, onClose, className }: ModalProps) => {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  const closeHandler = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    onClose();
  };

  return (
    <div className={style['modal-outside']} onClick={closeHandler}>
      <div className={style.modal} onClick={(e) => e.stopPropagation()}>
        <button className={style['close-button']} onClick={closeHandler}>
          <Image src="/close.svg" alt="Close" width={18} height={18} />
        </button>
        <div className={className}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
