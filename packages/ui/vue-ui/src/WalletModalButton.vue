<script setup>
import WalletButton from './WalletButton';
import { useWalletModal } from './useWalletModal';
const { showModal } = useWalletModal();
</script>

<template>
    <wallet-button class="wallet-adapter-button-trigger" @click="showModal">
        <slot>Select Wallet</slot>
    </wallet-button>
</template>
