import { LegacyOneKeyWallet } from './legacyAdapter';
import { OneKeyWallet } from './adapter';

function getInjectedProvider(name: 'solana' | 'sollet'): any {
    if (typeof window !== 'undefined') {
        // @ts-ignore
        const provider = window?.$onekey?.[name] ?? window?.[name];
        if (provider?.isOneKey) {
            return provider;
        }
    }
    return null;
}

function getProvider(): OneKeyWallet | null {
    return getInjectedProvider('solana');
}

function getLegacyProvider(): LegacyOneKeyWallet | null {
    return getInjectedProvider('sollet');
}

export default {
    getProvider,
    getLegacyProvider
}
