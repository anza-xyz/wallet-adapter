import { Wallet, WalletError } from '@solana/wallet-adapter-base';
import { defineComponent, PropType } from '@vue/runtime-core';
import { provideWallet } from './useWallet';

export const WalletProvider = defineComponent({
    name: 'wallet-provider',
    props: {
        wallets: {
            type: Array as PropType<Wallet[]>,
            default: () => [],
        },
        autoConnect: {
            type: Boolean as PropType<boolean>,
            default: false,
        },
        onError: {
            type: Function as PropType<(error: WalletError) => void>,
            default: (error: WalletError) => console.error(error),
        },
        localStorageKey: {
            type: String as PropType<string>,
            default: 'walletName',
        },
    },
    setup(props, { slots }) {
        provideWallet({
            wallets: props.wallets,
            autoConnect: props.autoConnect,
            onError: props.onError,
            localStorageKey: props.localStorageKey,
        });

        return () => slots.default?.();
    },
});
