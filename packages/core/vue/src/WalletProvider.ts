import { WalletError } from "@solana/wallet-adapter-base";
import { Wallet } from "@solana/wallet-adapter-wallets";
import { defineComponent, PropType } from "@vue/runtime-core";
import { initWallet } from "./useWallet";

export default defineComponent({
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
    setup (props) {
        initWallet({
            wallets: props.wallets,
            autoConnect: props.autoConnect,
            onError: props.onError,
            localStorageKey: props.localStorageKey,
        });
    },
    render () {
        return this.$slots.default?.()
    }
})
