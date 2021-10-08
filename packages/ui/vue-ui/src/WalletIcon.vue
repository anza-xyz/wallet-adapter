<script setup lang="ts">
import { toRefs } from 'vue'
const props = defineProps({ wallet: Object });
const { wallet } = toRefs(props);
</script>

<template>
    <img v-if="wallet" :src="wallet.icon" :alt="`${wallet.name} icon`">
</template>
