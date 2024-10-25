'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Button from '@/components/Button';
import Modal from '@/components/Modal';

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
  if (isJoinRoomModalOpen) {
    return <Modal onClose={closeModal}>방 참여</Modal>;
  }

  if (isCreateRoomModalOpen) {
    return <Modal onClose={closeModal}>방 생성</Modal>;
  }

  return null;
};

export default RoomController;
