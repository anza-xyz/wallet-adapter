<script lang="ts">
import { computed, ref, watch, defineComponent } from 'vue';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { useWallet } from '@solana/wallet-adapter-vue';
import { useWalletModal } from './useWalletModal';
import WalletButton from './WalletButton.vue';
import WalletListItem from './WalletListItem.vue';

export default defineComponent({
    name: 'wallet-modal',
    components: {
        WalletButton,
        WalletListItem,
    },
    props: {
        featuredWallets: { type: Number, default: 3 },
        container: { type: String, default: 'body' },
        logo: String,
    },
    setup ({ featuredWallets: featuredWalletsNumber, container, logo }) {
        const { wallets, select } = useWallet();
        const { visible, hideModal } = useWalletModal();
        const modal = ref<Element>();
        const expanded = ref(false);
        const featuredWallets = computed(() => wallets.slice(0, featuredWalletsNumber));
        const otherWallets = computed(() => wallets.slice(featuredWalletsNumber));

        const selectWallet = (walletName: WalletName) => {
            select(walletName);
            hideModal();
        };

        const handleTabKey = (event: KeyboardEvent) => {
            const node = modal.value;
            if (!node) return;

            // here we query all focusable elements
            const focusableElements = node.querySelectorAll('button');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey) {
                // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    event.preventDefault();
                }
            } else {
                // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    event.preventDefault();
                }
            }
        };

        watch(visible, (newVisible, oldVisible, onInvalidate) => {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    hideModal();
                } else if (event.key === 'Tab') {
                    handleTabKey(event);
                }
            };

            // Get original overflow
            let overflow = window.getComputedStyle(document.body).overflow;

            if (newVisible) {
                // Refetch original overflow
                overflow = window.getComputedStyle(document.body).overflow;
                // Prevent scrolling on mount
                document.body.style.overflow = 'hidden';
                // Listen for keydown events
                window.addEventListener('keydown', handleKeyDown, false);
            } else {
                // Re-enable scrolling when component unmounts
                document.body.style.overflow = overflow;
                window.removeEventListener('keydown', handleKeyDown, false);
            }

            onInvalidate(() => {
                // Re-enable scrolling when component unmounts
                document.body.style.overflow = overflow;
                window.removeEventListener('keydown', handleKeyDown, false);
            });
        }, { immediate: true });

        return {
            container,
            logo,
            visible,
            expanded,
            featuredWallets,
            otherWallets,
            modal,
            selectWallet,
            hideModal,
        }
    },
});
</script>

<template>
    <teleport :to="container" v-if="visible">
        <div
            aria-labelledby="wallet-adapter-modal-title"
            aria-modal="true"
            class="wallet-adapter-modal wallet-adapter-modal-fade-in"
            ref="modal"
            role="dialog"
        >
            <div class="wallet-adapter-modal-container">
                <div class="wallet-adapter-modal-wrapper" :class="{ 'wallet-adapter-modal-wrapper-no-logo': ! $slots.logo }">
                    <div class="wallet-adapter-modal-logo-wrapper" v-if="$slots.logo">
                        <slot name="logo">
                            <img alt="logo" class="wallet-adapter-modal-logo" :src="logo" />
                        </slot>
                    </div>
                    <h1 class="wallet-adapter-modal-title" id="wallet-adapter-modal-title">
                        Connect Wallet
                    </h1>
                    <button @click.prevent="hideModal" class="wallet-adapter-modal-button-close">
                        <svg width="14" height="14">
                            <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
                        </svg>
                    </button>
                    <ul class="wallet-adapter-modal-list">
                        <wallet-list-item
                            v-for="wallet in featuredWallets"
                            :key="wallet.name"
                            :wallet="wallet"
                            @click="selectWallet(wallet.name)"
                        ></wallet-list-item>
                    </ul>
                    <template v-if="otherWallets.length > 0">
                        <ul class="wallet-adapter-modal-list" v-if="expanded">
                            <wallet-list-item
                                v-for="wallet in otherWallets"
                                :key="wallet.name"
                                :wallet="wallet"
                                @click="selectWallet(wallet.name)"
                            ></wallet-list-item>
                        </ul>
                        <wallet-button
                            aria-controls="wallet-adapter-modal-collapse"
                            :aria-expanded="expanded"
                            class="wallet-adapter-modal-collapse-button"
                            :class="{ 'wallet-adapter-modal-collapse-button-active': expanded }"
                            @click="expanded = ! expanded"
                        >
                            {{ expanded ? 'Less' : 'More' }} options
                            <template #end-icon>
                                <svg width="11" height="6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m5.938 5.73 4.28-4.126a.915.915 0 0 0 0-1.322 1 1 0 0 0-1.371 0L5.253 3.736 1.659.272a1 1 0 0 0-1.371 0A.93.93 0 0 0 0 .932c0 .246.1.48.288.662l4.28 4.125a.99.99 0 0 0 1.37.01z" />
                                </svg>
                            </template>
                        </wallet-button>
                    </template>
                </div>
            </div>
            <div class="wallet-adapter-modal-overlay" @mousedown="hideModal" />
        </div>
    </teleport>
</template>
