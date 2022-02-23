import React, { FC, ReactNode, useState } from 'react';
import { NetworkModalContext } from './useNetworkModal';
import { NetworkModal, NetworkModalProps } from './NetworkModal';

export interface NetworkModalProviderProps extends NetworkModalProps {
  children: ReactNode;
}

export const NetworkModalProvider: FC<NetworkModalProviderProps> = ({ children, ...props }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <NetworkModalContext.Provider
      value={{
        modalVisible,
        setModalVisible
      }}
    >
      {children}
      {modalVisible && <NetworkModal {...props} />}
    </NetworkModalContext.Provider>
  )
}
