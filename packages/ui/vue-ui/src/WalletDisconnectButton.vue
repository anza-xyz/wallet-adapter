<script lang="ts">
import { computed } from 'vue';
import { useWallet } from '@solana/wallet-adapter-vue';
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

export default {
    name: 'wallet-disconnect-button',
    components: {
        WalletButton,
        WalletIcon,
    },
    props: {
        disabled: Boolean,
    },
    setup ({ disabled }, { emit }) {
        const { wallet, disconnect, disconnecting } = useWallet();

        const content = computed(() => {
            if (disconnecting.value) return 'Disconnecting ...';
            if (wallet.value) return 'Disconnect';
            return 'Disconnect Wallet';
        });

        const handleClick = (event: MouseEvent) => {
            emit('click', event);
            if (event.defaultPrevented) return;
            disconnect().catch(() => {});
        };

        return {
            wallet,
            disconnecting,
            disabled,
            content,
            handleClick,
        };
    },
};
</script>

<template>
    <wallet-button
        class="wallet-adapter-button-trigger"
        :disabled="disabled || disconnecting || ! wallet"
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
