# `@solana/wallet-adapter-walletconnect`

```
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';

const App = () => {
  ...
  const wallets = useMemo(
      () => [
          new WalletConnectWalletAdapter({
              network,
              options: {
                  relayUrl: 'wss://relay.walletconnect.com',
                  // example WC app project ID
                  projectId: 'e899c82be21d4acca2c8aec45e893598',
                  metadata: {
                      name: 'Example App',
                      description: 'Example App',
                      url: 'https://github.com/solana-labs/wallet-adapter',
                      icons: ['https://avatars.githubusercontent.com/u/35608259?s=200'],
                  },
              },
          }),
      ],
      []
  );
  ...
}
```
