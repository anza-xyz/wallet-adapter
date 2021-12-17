<script context="module" lang="ts">
	import { Buffer } from 'buffer';
	import process from 'process';

	globalThis.Buffer = Buffer;
	globalThis.process = process;

    if (typeof window !== 'undefined') {
        window.global = window;
    }
</script>

<script lang="ts">
	import type { Wallet } from '@solana/wallet-adapter-wallets';
	import { initialize } from '@solana/wallet-adapter-svelte';
	import type { WalletError } from '@solana/wallet-adapter-base';

	export let localStorageKey: string,
		wallets: Wallet[],
		autoConnect = false,
		onError = (error: WalletError) => console.error(error);

	$: wallets && initialize({ wallets, autoConnect, localStorageKey, onError });
</script>
