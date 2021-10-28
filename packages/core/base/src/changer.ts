import { BaseSignerWalletAdapter, SignerWalletAdapter } from './signer';
import { PublicKey } from '@solana/web3.js';


export interface UpdatingWalletAdapterProps {
    canPollForChange: boolean;
    change(): Promise<void>;
    checkForChange(adapter: ChangerWalletAdapter): Promise<boolean>;
}

export type ChangerWalletAdapter = SignerWalletAdapter & UpdatingWalletAdapterProps;

export abstract class BaseChangerWalletAdapter extends BaseSignerWalletAdapter {

    abstract change(): Promise<void>;

    async checkForChange(adapter: ChangerWalletAdapter): Promise<boolean> {
        if (!adapter.canPollForChange) return true;
        await adapter.change();
        return false;
    }

}
