<script lang="ts">
    import { Connection } from '@solana/web3.js';
    import type { Commitment, ConnectionConfig } from '@solana/web3.js';
    import { workSpace } from './workSpace';

    export let network: string,
        config: Commitment | ConnectionConfig | undefined = 'processed';

    const connection = new Connection(network, config);

    workSpace.set({ connection });
</script>
