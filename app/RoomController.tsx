'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';

const RoomController = () => {
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState<boolean>(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState<boolean>(false);

  const joinRoomButtonHandler = (): void => {
    setIsJoinRoomModalOpen(true);
    setIsCreateRoomModalOpen(false);
  };

  const createRoomButtonHandler = (): void => {
    setIsJoinRoomModalOpen(false);
    setIsCreateRoomModalOpen(true);
  };

  const closeModal = (): void => {
    setIsJoinRoomModalOpen(false);
    setIsCreateRoomModalOpen(false);
  };

  return (
    <div className={styles.buttons}>
      <Button onClick={joinRoomButtonHandler}>방 참여</Button>
      <Button onClick={createRoomButtonHandler}>방 생성</Button>
      <ModalController
        isJoinRoomModalOpen={isJoinRoomModalOpen}
        isCreateRoomModalOpen={isCreateRoomModalOpen}
        closeModal={closeModal}
      />
    </div>
  );
};

type ModalControllerProps = {
  isJoinRoomModalOpen: boolean;
  isCreateRoomModalOpen: boolean;
  closeModal: () => void;
};
const ModalController = ({
  isJoinRoomModalOpen,
  isCreateRoomModalOpen,
  closeModal,
}: ModalControllerProps) => {
  const router = useRouter();
  const keyInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  const handleJoinRoomClick = () => {
    const key = keyInputRef.current?.value || '';
    const nickname = nicknameInputRef.current?.value || '';
    router.push(`/room?key=${key}&nickname=${nickname}`);
  };

  const handleCreateRoomClick = () => {
    const key = keyInputRef.current?.value || '';
    const nickname = nicknameInputRef.current?.value || '';
    console.log('hihi');
    router.push(`/room?key=${key}&nickname=${nickname}`);
  };

  if (isJoinRoomModalOpen) {
    return (
      <Modal onClose={closeModal} className={styles.modal}>
        <h1>방 참여</h1>
        <div className={styles['input-container']}>
          <Input
            label="방 Key"
            placeholder="https://showmy.live/join-room?key="
            ref={keyInputRef}
          />
          <Input label="닉네임" placeholder="홍길동" ref={nicknameInputRef} />
        </div>
        <Button onClick={handleJoinRoomClick}>방 참여하기</Button>
      </Modal>
    );
  }

  if (isCreateRoomModalOpen) {
    return (
      <Modal onClose={closeModal} className={styles.modal}>
        <h1>방 생성</h1>
        <div className={styles['input-container']}>
          <Input label="닉네임" placeholder="홍길동" ref={nicknameInputRef} />
        </div>
        <Button onClick={handleCreateRoomClick}>방 참여하기</Button>
      </Modal>
    );
  }

  return null;
};

export default RoomController;
