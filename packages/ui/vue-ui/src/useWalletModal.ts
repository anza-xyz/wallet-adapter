import { ref, Ref, InjectionKey, provide, inject } from 'vue';

export interface WalletModalStore {
    visible: Ref<boolean>;
    showModal: () => void;
    hideModal: () => void;
}

const walletModalStoreKey: InjectionKey<WalletModalStore> = Symbol();

export const useWalletModal = (): WalletModalStore | undefined => {
    return inject(walletModalStoreKey);
};

export const initWalletModal = (initiallyVisible = false): void => {
    const visible = ref<boolean>(initiallyVisible);
    const showModal = () => (visible.value = true);
    const hideModal = () => (visible.value = false);

    provide(walletModalStoreKey, { visible, showModal, hideModal });
};
