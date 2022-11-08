import type { FC, ReactNode } from 'react';
import React, { useState } from 'react';
import { WalletModalContext } from './useWalletModal.js';
import type { WalletModalProps } from './WalletModal.js';
import { WalletModal } from './WalletModal.js';
import { IntlProvider } from 'react-intl';

const messages = {
    'en-US': {
        selectWallet: 'Select Wallet',
        connectToContinue: 'Connect a wallet on Solana to continue',
        needWallet: "You'll need a wallet on Solana to continue",
        getStarted: 'Get started',
        viewOptions: 'Already have a wallet? View options',
        hideOptions: 'Hide options',
        copyAddress: 'Copy address',
        copied: 'Copied!',
        changeWallet: 'Change wallet',
        disconnect: 'Disconnect',
    },
    'pt-BR': {
        selectWallet: 'Selecione a Carteira',
        connectToContinue: 'Conecte uma carteira Solana para continuar',
        needWallet: 'Você vai precisar de uma carteira na Solana para continuar',
        getStarted: 'Começar',
        viewOptions: 'Já possui uma carteira? Veja as opções',
        hideOptions: 'Esconder opções',
        copyAddress: 'Copiar endereço',
        copied: 'Copiado!',
        changeWallet: 'Alterar carteira',
        disconnect: 'Desconectar',
    },
};

const defaultLocale = 'en-US';

export interface WalletModalProviderProps extends WalletModalProps {
    children: ReactNode;
}

export const WalletModalProvider: FC<WalletModalProviderProps> = ({ children, ...props }) => {
    const [visible, setVisible] = useState(false);
    const selectedLocale: string = props.locale || defaultLocale;
    return (
        <IntlProvider locale={selectedLocale} messages={messages[selectedLocale as keyof typeof messages]}>
            <WalletModalContext.Provider
                value={{
                    visible,
                    setVisible,
                }}
            >
                {children}
                {visible && <WalletModal {...props} />}
            </WalletModalContext.Provider>
        </IntlProvider>
    );
};
