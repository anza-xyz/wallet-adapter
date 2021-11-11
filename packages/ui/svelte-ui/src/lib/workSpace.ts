import { writable } from 'svelte/store';
import type { Program, Provider, web3 } from '@project-serum/anchor';
import type { Connection, Keypair } from '@solana/web3.js';
import type { Idl } from '@project-serum/anchor';

type WorkSpace = {
	baseAccount?: Keypair;
	connection: Connection;
	provider?: Provider;
	program?: Program<Idl>;
	systemProgram?: typeof web3.SystemProgram;
};

export const workSpace = writable<WorkSpace>(undefined);
