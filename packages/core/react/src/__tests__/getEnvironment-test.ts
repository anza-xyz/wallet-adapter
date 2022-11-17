import { type Adapter, WalletReadyState } from '@solana/wallet-adapter-base';
import getEnvironment, { Environment } from '../getEnvironment.js';

describe('getEnvironment()', () => {
    [
        {
            description: 'on Android',
            expectedEnvironmentWithInstalledAdapter: Environment.DESKTOP_WEB,
            expectedEnvironmentWithNoInstalledAdapter: Environment.MOBILE_WEB,
            userAgentString: 'Android',
        },
        {
            description: 'in a webview',
            expectedEnvironmentWithInstalledAdapter: Environment.DESKTOP_WEB,
            expectedEnvironmentWithNoInstalledAdapter: Environment.DESKTOP_WEB,
            userAgentString: 'WebView',
        },
        {
            description: 'on desktop',
            expectedEnvironmentWithInstalledAdapter: Environment.DESKTOP_WEB,
            expectedEnvironmentWithNoInstalledAdapter: Environment.DESKTOP_WEB,
            userAgentString:
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
        },
        {
            description: 'the user agent is null',
            expectedEnvironmentWithInstalledAdapter: Environment.DESKTOP_WEB,
            expectedEnvironmentWithNoInstalledAdapter: Environment.DESKTOP_WEB,
            userAgentString: null,
        },
    ].forEach(
        ({
            description,
            expectedEnvironmentWithInstalledAdapter,
            expectedEnvironmentWithNoInstalledAdapter,
            userAgentString,
        }) => {
            describe(`when ${description}`, () => {
                describe('with no installed adapters', () => {
                    it(`returns \`${Environment[expectedEnvironmentWithNoInstalledAdapter]}\``, () => {
                        const adapters = [
                            { readyState: WalletReadyState.Loadable } as Adapter,
                            { readyState: WalletReadyState.NotDetected } as Adapter,
                            { readyState: WalletReadyState.Unsupported } as Adapter,
                        ];
                        expect(getEnvironment({ adapters, userAgentString })).toBe(
                            expectedEnvironmentWithNoInstalledAdapter
                        );
                    });
                });
                describe('with at least one installed adapter', () => {
                    it(`returns \`${Environment[expectedEnvironmentWithInstalledAdapter]}\``, () => {
                        const adapters = [
                            { readyState: WalletReadyState.Loadable } as Adapter,
                            { readyState: WalletReadyState.Installed } as Adapter,
                            { readyState: WalletReadyState.NotDetected } as Adapter,
                            { readyState: WalletReadyState.Unsupported } as Adapter,
                        ];
                        expect(getEnvironment({ adapters, userAgentString })).toBe(
                            expectedEnvironmentWithInstalledAdapter
                        );
                    });
                });
            });
        }
    );
});
