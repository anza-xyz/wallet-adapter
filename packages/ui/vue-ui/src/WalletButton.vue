<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: 'wallet-button',
    setup (props, { slots }) {
        const justifyContent = (slots['end-icon'] || slots['start-icon']) ? 'space-between' : 'center';

        return { justifyContent };
    },
});
</script>

<template>
    <button class="wallet-adapter-button" :style="`justify-content: ${justifyContent};`" type="button">
        <i v-if="$slots['start-icon']" className="wallet-adapter-button-start-icon">
            <slot name="start-icon"></slot>
        </i>
        <slot></slot>
        <i v-if="$slots['end-icon']" className="wallet-adapter-button-end-icon">
            <slot name="end-icon"></slot>
        </i>
    </button>
</template>
