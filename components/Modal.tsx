import Button from '@/components/Button';
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
        <Button onClick={closeHandler}>닫기</Button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
