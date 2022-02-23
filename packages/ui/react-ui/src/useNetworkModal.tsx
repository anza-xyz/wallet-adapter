import { createContext, useContext } from "react";

export interface NetworkModalContextState {
  modalVisible: boolean;
  setModalVisible: (open: boolean) => void;
}

export const NetworkModalContext = createContext<NetworkModalContextState>({} as NetworkModalContextState);

export function useNetworkModal(): NetworkModalContextState {
  return useContext(NetworkModalContext);
}
