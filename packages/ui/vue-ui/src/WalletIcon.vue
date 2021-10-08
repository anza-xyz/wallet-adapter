<script lang="ts">
export default {
    name: 'wallet-icon',
    props: {
        wallet: Object,
    },
    setup ({ wallet }) {
        return { wallet };
    },
};
</script>

<template>
    <img v-if="wallet" :src="wallet.icon" :alt="`${wallet.name} icon`">
</template>
