<script setup>
import { toRefs } from 'vue'
import WalletButton from './WalletButton';
import WalletIcon from './WalletIcon';

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
