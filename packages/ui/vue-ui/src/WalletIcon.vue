<script lang="ts">
import { Wallet } from "@solana/wallet-adapter-base";
import { defineComponent, PropType } from "vue";

export default defineComponent({
    name: 'wallet-icon',
    props: {
        wallet: Object as PropType<Wallet>,
    },
    setup ({ wallet }) {
        return { wallet };
    },
});
</script>

<template>
    <img v-if="wallet" :src="wallet.icon" :alt="`${wallet.name} icon`">
</template>
