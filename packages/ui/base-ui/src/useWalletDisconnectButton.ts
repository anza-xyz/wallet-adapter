import { useWallet, type Wallet } from '@solana/wallet-adapter-react';
import { useCallback } from 'react';

type ButtonState = {
    buttonDisabled: boolean;
    buttonState: 'disconnecting' | 'has-wallet' | 'no-wallet';
    onButtonClick?: () => void;
    walletIcon?: Wallet['adapter']['icon'];
    walletName?: Wallet['adapter']['name'];
};

export function useWalletDisconnectButton(): ButtonState {
    const { disconnecting, disconnect, wallet } = useWallet();
    let buttonState: ButtonState['buttonState'];
    if (disconnecting) {
        buttonState = 'disconnecting';
    } else if (wallet) {
        buttonState = 'has-wallet';
    } else {
        buttonState = 'no-wallet';
    }
    const handleDisconnectButtonClick = useCallback(() => {
        disconnect().catch(() => {
            // Silently catch because any errors are caught by the context `onError` handler
        });
    }, [disconnect]);
    return {
        buttonDisabled: buttonState !== 'has-wallet',
        buttonState,
        onButtonClick: buttonState === 'has-wallet' ? handleDisconnectButtonClick : undefined,
        walletIcon: wallet?.adapter.icon,
        walletName: wallet?.adapter.name,
    };
}
