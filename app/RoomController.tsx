'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Input from '@/components/Input';
import useCommunicationStore from '@/store/useCommunicationStore';

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
  const { initialize, createRoom, joinRoom } = useCommunicationStore();
  const router = useRouter();
  const keyInputRef = useRef<HTMLInputElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleJoinRoomClick = async () => {
    const key = extractRoomKey(keyInputRef.current?.value || '');
    const nickname = nicknameInputRef.current?.value || '익명';

    try {
      await joinRoom(key, nickname);
      router.push(`/room?key=${key}&nickname=${nickname}`);
    } catch (error) {
      alert('방을 찾을 수 없습니다.');
      console.log(error);
    }
  };

  const handleCreateRoomClick = async () => {
    const nickname = nicknameInputRef.current?.value || '익명';
    const key = await createRoom(nickname);
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
          <Input label="닉네임" placeholder="익명" ref={nicknameInputRef} />
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
          <Input label="닉네임" placeholder="익명" ref={nicknameInputRef} />
        </div>
        <Button onClick={handleCreateRoomClick}>방 생성하기</Button>
      </Modal>
    );
  }

  return null;
};

const extractRoomKey = (input: string): string => {
  if (input.includes('showmy.live/join-room?key=')) {
    return input.split('key=')[1];
  }
  return input;
};

export default RoomController;
