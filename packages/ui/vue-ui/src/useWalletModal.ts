import { ref, Ref } from '@vue/runtime-core';

export interface WalletModalStore {
    visible: Ref<boolean>,
    showModal: () => void,
    hideModal: () => void,
}

const visible = ref(false);
const showModal = () => visible.value = true;
const hideModal = () => visible.value = false;
const modalStore: WalletModalStore = { visible, showModal, hideModal };

export const useWalletModal = (): WalletModalStore => modalStore
