import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';

type ButtonState = {
    buttonDisabled: boolean;
    buttonState: 'connecting' | 'connected' | 'has-wallet' | 'no-wallet';
    onButtonClick?: () => void;
    walletIcon?: Wallet['adapter']['icon'];
    walletName?: Wallet['adapter']['name'];
};

export function useWalletConnectButton(): ButtonState {
    const { connect, connected, connecting, wallet } = useWallet();
    let buttonState: ButtonState['buttonState'];
    if (connecting) {
        buttonState = 'connecting';
    } else if (connected) {
        buttonState = 'connected';
    } else if (wallet) {
        buttonState = 'has-wallet';
    } else {
        buttonState = 'no-wallet';
    }
    const handleConnectButtonClick = useCallback(() => {
        connect().catch(() => {
            // Silently catch because any errors are caught by the context `onError` handler
        });
    }, [connect]);
    return {
        buttonDisabled: buttonState !== 'has-wallet',
        buttonState,
        onButtonClick: buttonState === 'has-wallet' ? handleConnectButtonClick : undefined,
        walletIcon: wallet?.adapter.icon,
        walletName: wallet?.adapter.name,
    };
}
