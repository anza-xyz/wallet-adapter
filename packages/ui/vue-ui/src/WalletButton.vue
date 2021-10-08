<script setup lang="ts">
import { useSlots } from 'vue';
const slots = useSlots();
const justifyContent = (slots['end-icon'] || slots['start-icon']) ? 'space-between' : 'center';
</script>

<template>
    <button class="wallet-adapter-button" :style="`justify-content: ${justifyContent};`">
        <i v-if="$slots['start-icon']" className="wallet-adapter-button-start-icon">
            <slot name="start-icon"></slot>
        </i>
        <slot></slot>
        <i v-if="$slots['end-icon']" className="wallet-adapter-button-end-icon">
            <slot name="end-icon"></slot>
        </i>
    </button>
</template>
