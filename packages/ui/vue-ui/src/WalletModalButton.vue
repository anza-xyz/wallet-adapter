<script lang="ts">
import WalletButton from './WalletButton.vue';
import { useWalletModal } from './useWalletModal';

export default {
    name: 'wallet-modal-button',
    components: {
        WalletButton,
    },
    setup () {
        const { showModal } = useWalletModal();

        return { showModal };
    },
};
</script>

<template>
    <wallet-button class="wallet-adapter-button-trigger" @click="showModal">
        <slot>Select Wallet</slot>
    </wallet-button>
</template>
