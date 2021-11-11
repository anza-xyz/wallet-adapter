import { writable } from 'svelte/store';
import type { Connection } from '@solana/web3.js';

type WorkSpace = {
	connection: Connection;
};

export const workSpace = writable<WorkSpace>(undefined);
