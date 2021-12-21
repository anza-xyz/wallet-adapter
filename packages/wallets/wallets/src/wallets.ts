import { Wallet, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { getBitKeepWallet } from '@solana/wallet-adapter-bitkeep';
import { getBitpieWallet } from '@solana/wallet-adapter-bitpie';
import { getBloctoWallet } from '@solana/wallet-adapter-blocto';
import { getCloverWallet } from '@solana/wallet-adapter-clover';
import { getCoin98Wallet } from '@solana/wallet-adapter-coin98';
import { getCoinhubWallet } from '@solana/wallet-adapter-coinhub';
import { getLedgerWallet } from '@solana/wallet-adapter-ledger';
import { getMathWallet } from '@solana/wallet-adapter-mathwallet';
import { getPhantomWallet } from '@solana/wallet-adapter-phantom';
import { getSafePalWallet } from '@solana/wallet-adapter-safepal';
import { getSlopeWallet } from '@solana/wallet-adapter-slope';
import { getSolflareWallet } from '@solana/wallet-adapter-solflare';
import { getSolflareWebWallet, getSolletExtensionWallet, getSolletWallet } from '@solana/wallet-adapter-sollet';
import { getSolongWallet } from '@solana/wallet-adapter-solong';
import { getTokenPocketWallet } from '@solana/wallet-adapter-tokenpocket';
import { getTorusWallet } from '@solana/wallet-adapter-torus';

export interface WalletsConfig {
    network?: WalletAdapterNetwork;
}

export function getWallets({ network = WalletAdapterNetwork.Mainnet }: WalletsConfig = {}): Wallet[] {
    return [
        getPhantomWallet(),
        getSlopeWallet(),
        getSolflareWallet(),
        getSolletExtensionWallet({ network }),

        getBitKeepWallet(),
        getBitpieWallet(),
        getCloverWallet(),
        getCoin98Wallet(),
        getCoinhubWallet(),
        getMathWallet(),
        getSafePalWallet(),
        getSolongWallet(),
        getTokenPocketWallet(),

        getTorusWallet({ params: { showTorusButton: false } }),
        getLedgerWallet(),
        getSolletWallet({ network }),
        getSolflareWebWallet({ network }),
        getBloctoWallet({ network }),
    ];
}
