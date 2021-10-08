<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useWallet } from '@solana/wallet-adapter-vue';
import { useWalletModal } from './useWalletModal';
import WalletConnectButton from './WalletConnectButton.vue';
import WalletModalButton from './WalletModalButton.vue';
import WalletButton from './WalletButton.vue';
import WalletIcon from './WalletIcon.vue';

const { publicKey, wallet, disconnect } = useWallet();
const { showModal } = useWalletModal();
const copied = ref(false);
const active = ref(false);
const dropdown = ref(null);

const base58 = computed(() => publicKey.value?.toBase58());
const content = computed(() => {
    if (! wallet.value || ! base58.value) return null;
    return base58.value.slice(0, 4) + '..' + base58.value.slice(-4);
});

const copyAddress = async () => {
    if (! base58.value) return;
    await navigator.clipboard.writeText(base58.value);
    copied.value = true;
    setTimeout(() => copied.value = false, 400);
};

const openDropdown = () => active.value = true;
const closeDropdown = () => active.value = false;
const openModal = () => {
    showModal();
    closeDropdown();
};

watchEffect(onInvalidate => {
    const listener = event => {
        const node = dropdown.value;
        // Do nothing if clicking dropdown or its descendants
        if (!node || node.contains(event.target)) return;
        closeDropdown();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    onInvalidate(() => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
    });
});
</script>

<template>
    <wallet-modal-button v-if="! wallet">
        <slot></slot>
    </wallet-modal-button>
    <wallet-connect-button v-else-if="! base58">
        <slot></slot>
    </wallet-connect-button>
    <div v-else className="wallet-adapter-dropdown">
        <wallet-button
            class="wallet-adapter-button-trigger"
            :style="{ pointerEvents: active ? 'none' : 'auto' }"
            :aria-expanded="active"
            @click="openDropdown"
        >
            <template #start-icon>
                <wallet-icon :wallet="wallet"></wallet-icon>
            </template>
            <slot>{{ content }}</slot>
        </wallet-button>
        <ul
            aria-label="dropdown-list"
            class="wallet-adapter-dropdown-list"
            :class="{ 'wallet-adapter-dropdown-list-active': active }"
            ref="dropdown"
            role="menu"
        >
            <li @click="copyAddress" class="wallet-adapter-dropdown-list-item" role="menuitem">
                {{ copied ? 'Copied' : 'Copy address' }}
            </li>
            <li @click="openModal" class="wallet-adapter-dropdown-list-item" role="menuitem">
                Connect a different wallet
            </li>
            <li @click="disconnect" class="wallet-adapter-dropdown-list-item" role="menuitem">
                Disconnect
            </li>
        </ul>
    </div>
</template>
