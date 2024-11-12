import React from 'react';
import styles from './SendMessageForm.module.css';
import Image from 'next/image';

type SendMessageFormProps = {
  onSubmit?: (message: string) => void;
  className?: string;
};

const SendMessageForm = ({ onSubmit, className }: SendMessageFormProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputRef.current) {
      const message = inputRef.current.value.trim();
      if (message && onSubmit) onSubmit(message);

      inputRef.current.value = '';
    }
  };

  return (
    <form className={`${styles['send-message-form']} ${className}`} onSubmit={handleSubmit}>
      <input type="text" placeholder="메시지를 입력하세요" ref={inputRef} />
      <button type="submit">
        <Image src="/arrow-upward-black.svg" alt="send" width={15} height={15} />
      </button>
    </form>
  );
};

export default SendMessageForm;
