<script lang="ts">
    import { Connection } from '@solana/web3.js';
    import type { Commitment, ConnectionConfig } from '@solana/web3.js';
    import { workSpace } from './workSpace';
    import * as pkg from '@project-serum/anchor';
    import { walletStore } from './walletStore';

    const { web3, Provider, Program } = pkg;

    export let idl,
        network: string,
        config: Commitment | ConnectionConfig | undefined = 'processed';

    const { PublicKey } = web3;
    const programID = new PublicKey(idl.metadata.address);
    const baseAccount = web3.Keypair.generate();
    const systemProgram = web3.SystemProgram;
    const connection = new Connection(network, config);

    function defineProgramAndProvider(walletStore) {
        let { sendTransaction, signTransaction, signAllTransactions, signMessage, publicKey } = walletStore;
        const providerWallet = {
            sendTransaction,
            signTransaction,
            signAllTransactions,
            signMessage,
            publicKey,
        };
        const provider = new Provider(connection, providerWallet, {
            preflightCommitment: 'processed',
        });
        const program = new Program(idl, programID, provider);
        workSpace.set({ baseAccount, connection, provider, program, systemProgram });
    }

    $: $walletStore && $walletStore.publicKey && defineProgramAndProvider($walletStore);
</script>

<slot />
