<script lang="ts">
import { defineComponent } from 'vue';
import { initWalletModal } from './useWalletModal';
import WalletModal from './WalletModal.vue';

export default defineComponent({
    name: 'wallet-modal-provider',
    components: {
        WalletModal,
    },
    props: {
        visible: Boolean,
    },
    setup ({ visible }) {
        initWalletModal(visible);
    },
});
</script>

<template>
    <slot></slot>
    <wallet-modal></wallet-modal>
</template>
