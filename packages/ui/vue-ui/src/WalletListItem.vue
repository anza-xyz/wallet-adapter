<script setup lang="ts">
import { toRefs } from 'vue'
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

const props = defineProps({ wallet: Object });
const { wallet } = toRefs(props);
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
