import { inject, InjectionKey, provide, Ref, ref } from 'vue';

export interface WalletModalStore {
    visible: Ref<boolean>;
    showModal: () => void;
    hideModal: () => void;
}

const walletModalStoreKey: InjectionKey<WalletModalStore> = Symbol();

export const useWalletModal = (): WalletModalStore | undefined => {
    return inject(walletModalStoreKey);
};

export const useWalletModalOrFail = (): WalletModalStore => {
    const walletModalStore = useWalletModal();
    if (! walletModalStore) throw new Error("Wallet modal not initialized. Please use the `WalletModalProvider` component to initialize the wallet modal.");
    return walletModalStore;
};

export const initWalletModal = (initiallyVisible = false): void => {
    const visible = ref<boolean>(initiallyVisible);
    const showModal = () => (visible.value = true);
    const hideModal = () => (visible.value = false);

    provide(walletModalStoreKey, { visible, showModal, hideModal });
};
