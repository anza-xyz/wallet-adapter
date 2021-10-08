<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    props: {
        wallet: Object
    },

    setup (props) {
        return {
            wallet: props.wallet,
        }
    },
})
</script>

<template>
    <img v-if="wallet" :src="wallet.icon" :alt="`${wallet.name} icon`">
</template>
