# `@solana/wallet-adapter-react`

## Creating a custom connect button

This package exports a series of hooks that you can use to create custom wallet connection buttons. They manage the state of the wallet connection for you, and return helper methods that you can attach to your event handlers.

What follows is the documentation for `useWalletMultiButton()`.

### States

-   `no-wallet` \
    In this state you are neither connected nor is there a wallet selected. Allow your users to select from the list of `wallets`, then call `onSelectWallet()` with the name of the wallet they chose.
-   `has-wallet` \
    This state implies that there is a wallet selected, but that your app is not connected to it. Render a connect button that calls `onConnect()` when clicked.
-   `disconnecting` \
    When in this state, the last-connected wallet is in mid-disconnection.
-   `connected` \
    In this state, you have access to the connected `publicKey` and an `onDisconnect()` method that you can call to disconnect from the wallet. At any time you can call `onSelectWallet()` to change wallets.
-   `connecting` \
    When in this state, the wallet is in mid-connection.

### Functions

-   `onConnect` \
     Connects the currently selected wallet. Available in the `has-wallet` state.
-   `onDisconnect` \
     Disconnects the currently selected wallet. Available in the `has-wallet`, `connected`, and `connecting` states.
-   `onSelectWallet()` \
     Calls the `onSelectWallet()` function that you supplied as config to `useWalletMultiButton`. That function receives the list of `wallets` and offers you an `onSelectWallet()` callback that you can call with the name of the wallet to switch to.

### Example

```ts
function CustomConnectButton() {
    const [walletModalConfig, setWalletModalConfig] = useState<Readonly<{
        onSelectWallet(walletName: WalletName): void;
        wallets: Wallet[];
    }> | null>(null);
    const { buttonState, onConnect, onDisconnect, onSelectWallet } = useWalletMultiButton({
        onSelectWallet: setWalletModalConfig,
    });
    let label;
    switch (buttonState) {
        case 'connected':
            label = 'Disconnect';
            break;
        case 'connecting':
            label = 'Connecting';
            break;
        case 'disconnecting':
            label = 'Disconnecting';
            break;
        case 'has-wallet':
            label = 'Connect';
            break;
        case 'no-wallet':
            label = 'Select Wallet';
            break;
    }
    const handleClick = useCallback(() => {
        switch (buttonState) {
            case 'connected':
                return onDisconnect;
            case 'connecting':
            case 'disconnecting':
                break;
            case 'has-wallet':
                return onConnect;
            case 'no-wallet':
                return onSelectWallet;
                break;
        }
    }, [buttonState, onDisconnect, onConnect, onSelectWallet]);
    return (
        <>
            <button disabled={buttonState === 'connecting' || buttonState === 'disconnecting'} onClick={handleClick}>
                {label}
            </button>
            {walletModalConfig ? (
                <Modal>
                    {walletModalConfig.wallets.map((wallet) => (
                        <button
                            key={wallet.adapter.name}
                            onClick={() => {
                                walletModalConfig.onSelectWallet(wallet.adapter.name);
                                setWalletModalConfig(null);
                            }}
                        >
                            {wallet.adapter.name}
                        </button>
                    ))}
                </Modal>
            ) : null}
        </>
    );
}
```
