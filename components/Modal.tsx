import Button from '@/components/Button';
import style from './Modal.module.css';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
};
const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className={style['modal-outside']}>
      <div className={style.modal}>
        <Button onClick={onClose}>닫기</Button>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
