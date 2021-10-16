<script lang="ts">
import { defineComponent } from 'vue';
import { useWalletModal } from './useWalletModal';
import WalletButton from './WalletButton.vue';

export default defineComponent({
    name: 'wallet-modal-button',
    components: {
        WalletButton,
    },
    setup () {
        const { showModal } = useWalletModal();

        return { showModal };
    },
});
</script>

<template>
    <wallet-button class="wallet-adapter-button-trigger" @click="showModal">
        <slot>Select Wallet</slot>
    </wallet-button>
</template>
