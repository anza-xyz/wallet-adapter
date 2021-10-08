<script lang="ts">
import { computed } from 'vue';
import { useWallet } from '@solana/wallet-adapter-vue';
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

export default {
    name: 'wallet-connect-button',
    components: {
        WalletButton,
        WalletIcon,
    },
    props: {
        disabled: Boolean,
    },
    setup ({ disabled }, { emit }) {
        const { wallet, connect, connecting, connected } = useWallet();

        const content = computed(() => {
            if (connecting.value) return 'Connecting ...';
            if (connected.value) return 'Connected';
            if (wallet.value) return 'Connect';
            return 'Connect Wallet';
        });

        const handleClick = (event: MouseEvent) => {
            emit('click', event);
            if (event.defaultPrevented) return;
            connect().catch(() => {});
        };

        return {
            wallet,
            disabled,
            connecting,
            connected,
            content,
            handleClick,
        };
    },
};
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
