import Image from 'next/image';
import style from './Modal.module.css';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};
const Modal = ({ children, onClose }: ModalProps) => {
  document.body.style.overflow = 'hidden';
  document.documentElement.style.overflow = 'hidden';

  const closeHandler = () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    onClose();
  };
  return (
    <div className={style['modal-outside']} onClick={closeHandler}>
      <div className={style.modal}>
        <button className={style['close-button']} onClick={closeHandler}>
          <Image src="/close.svg" alt="Close" width={18} height={18} />
        </button>
        <div className={style.contents}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
