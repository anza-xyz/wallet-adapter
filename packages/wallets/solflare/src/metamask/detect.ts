import type { WindowWithEthereum, EthereumProvider } from '@solflare-wallet/metamask-sdk';

export async function isSnapSupported(provider: EthereumProvider) {
    try {
        await provider.request({ method: 'wallet_getSnaps' });
        return true;
    } catch (error) {
        return false;
    }
}

export async function detectEthereumProvider() {
    try {
        // @ts-ignore
        const provider = (window as WindowWithEthereum).ethereum;

        if (!provider) {
            return null;
        }

        if (provider.providers && Array.isArray(provider.providers)) {
            const providers = provider.providers;

            for (const provider of providers) {
                if (await isSnapSupported(provider)) {
                    return provider;
                }
            }
        }

        if (provider.detected && Array.isArray(provider.detected)) {
            const providers = provider.detected;

            for (const provider of providers) {
                if (await isSnapSupported(provider)) {
                    return provider;
                }
            }
        }

        if (await isSnapSupported(provider)) {
            return provider;
        }

        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}
