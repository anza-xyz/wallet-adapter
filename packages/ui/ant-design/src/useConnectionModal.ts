import { createContext, useContext } from 'react';

export interface ConnectionModalContextState {
    visible: boolean;
    setVisible: (open: boolean) => void;
}

export const ConnectionModalContext = createContext<ConnectionModalContextState>({} as ConnectionModalContextState);

export function useConnectionModal(): ConnectionModalContextState {
    return useContext(ConnectionModalContext);
}
