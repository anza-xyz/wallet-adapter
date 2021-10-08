<script lang="ts">
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

export default {
    name: 'wallet-list-item',
    components: {
        WalletButton,
        WalletIcon,
    },
    props: {
        wallet: Object,
    },
    setup ({ wallet }) {
        return { wallet };
    },
};
</script>

<template>
    <li>
        <wallet-button @click="$emit('click')">
            <slot>
                {{ wallet.name }}
            </slot>
            <template #end-icon>
                <wallet-icon :wallet="wallet"></wallet-icon>
            </template>
        </wallet-button>
    </li>
</template>
