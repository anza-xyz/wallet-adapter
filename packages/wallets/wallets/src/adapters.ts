import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { BitKeepWalletAdapter } from '@solana/wallet-adapter-bitkeep';
import { BitpieWalletAdapter } from '@solana/wallet-adapter-bitpie';
import { BloctoWalletAdapter } from '@solana/wallet-adapter-blocto';
import { CloverWalletAdapter } from '@solana/wallet-adapter-clover';
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98';
import { CoinhubWalletAdapter } from '@solana/wallet-adapter-coinhub';
import { HuobiWalletAdapter } from '@solana/wallet-adapter-huobi';
import { LedgerWalletAdapter } from '@solana/wallet-adapter-ledger';
import { MathWalletAdapter } from '@solana/wallet-adapter-mathwallet';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SafePalWalletAdapter } from '@solana/wallet-adapter-safepal';
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { SolletExtensionWalletAdapter, SolletWalletAdapter } from '@solana/wallet-adapter-sollet';
import { SolongWalletAdapter } from '@solana/wallet-adapter-solong';
import { TokenPocketWalletAdapter } from '@solana/wallet-adapter-tokenpocket';
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus';

export interface WalletsConfig {
    network?: WalletAdapterNetwork;
}

export function getWalletAdapters({ network = WalletAdapterNetwork.Mainnet }: WalletsConfig = {}): Adapter[] {
    return [
        new PhantomWalletAdapter(),
        new GlowWalletAdapter(),
        new SlopeWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new SolletExtensionWalletAdapter({ network }),
        new BitKeepWalletAdapter(),
        new BitpieWalletAdapter(),
        new CloverWalletAdapter(),
        new Coin98WalletAdapter(),
        new CoinhubWalletAdapter(),
        new HuobiWalletAdapter(),
        new MathWalletAdapter(),
        new SafePalWalletAdapter(),
        new SolongWalletAdapter(),
        new TokenPocketWalletAdapter(),
        new TorusWalletAdapter(),
        new LedgerWalletAdapter(),
        new SolletWalletAdapter({ network }),
        new BloctoWalletAdapter({ network }),
    ];
}
