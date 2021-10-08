<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { useWallet } from '@solana/wallet-adapter-vue';
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

const emit = defineEmits(['click'])
const props = defineProps({ disabled: Boolean });
const { disabled } = toRefs(props);

const { wallet, connect, connecting, connected } = useWallet();

const handleClick = event => {
    emit('click', event);
    if (event.defaultPrevented) return;
    connect().catch(() => {});
};

const content = computed(() => {
    if (connecting.value) return 'Connecting ...';
    if (connected.value) return 'Connected';
    if (wallet.value) return 'Connect';
    return 'Connect Wallet';
});
</script>

<template>
    <wallet-button
        class="wallet-adapter-button-trigger"
        :disabled="disabled || ! wallet || connecting || connected"
        @click="handleClick"
    >
        <template #start-icon v-if="wallet">
            <wallet-icon :wallet="wallet"></wallet-icon>
        </template>
        <slot>
            {{ content }}
        </slot>
    </wallet-button>
</template>
