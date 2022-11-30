import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile';
import { type Adapter, WalletReadyState } from '@solana/wallet-adapter-base';

export enum Environment {
    DESKTOP_WEB,
    MOBILE_WEB,
}

type Config = Readonly<{
    adapters: Adapter[];
    userAgentString: string | null;
}>;

function isWebView(userAgentString: string) {
    return /(WebView|Version\/.+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)|; wv\).+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/i.test(
        userAgentString
    );
}

export default function getEnvironment({ adapters, userAgentString }: Config): Environment {
    if (
        adapters.some(
            (adapter) =>
                adapter.name !== SolanaMobileWalletAdapterWalletName &&
                adapter.readyState === WalletReadyState.Installed
        )
    ) {
        /**
         * There are only two ways a browser extension adapter should be able to reach `Installed` status:
         *
         *     1. Its browser extension is installed.
         *     2. The app is running on a mobile wallet's in-app browser.
         *
         * In either case, we consider the environment to be desktop-like.
         */
        return Environment.DESKTOP_WEB;
    }
    if (
        userAgentString &&
        // Step 1: Check whether we're on a platform that supports MWA at all.
        /android/i.test(userAgentString) &&
        // Step 2: Determine that we are *not* running in a WebView.
        !isWebView(userAgentString)
    ) {
        return Environment.MOBILE_WEB;
    } else {
        return Environment.DESKTOP_WEB;
    }
}
