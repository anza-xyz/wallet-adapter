<script lang="ts">
import { PropType } from 'vue';
import { Wallet } from '@solana/wallet-adapter-wallets';

export default {
    name: 'wallet-icon',
    props: {
        wallet: Object as PropType<Wallet>,
    },
    setup ({ wallet }) {
        return { wallet };
    },
};
</script>

<template>
    <img v-if="wallet" :src="wallet.icon" :alt="`${wallet.name} icon`">
</template>
