- [Solana WalletConnect Provider](#solana-walletconnect-provider)
  - [WalletConnect client instantiation](#walletconnect-client-instantiation)
    - [Requester client](#requester-client)
    - [Signer client](#signer-client)
  - [Pairing flow:](#pairing-flow)
  - [Transaction signing flow (assumes successful pairing):](#transaction-signing-flow-assumes-successful-pairing)
# Solana WalletConnect Provider

This library is intended to simplify integration of wallet connect for use with a Distributed Application (DAPP) and mobile device. The intention is allow DAPPs to integrate basic Solana functionality using WalletConnect, abstracting the wallet-connect specific RPC methods and details to make integration as simple as possible. There are 2 main classes that can be used, one for the DAPP which acts as the requester, and one for the mobile device, where the private keys are stored. The DAPP proposes pairing and transactions to be approved and signed, and the mobile device presents pairing requests and transactions for the user (key owner) to sign, then facilitates signing and communication with the DAPP.

## WalletConnect client instantiation

An already-instantiated WalletConnect client is required when calling the 'init' method for the requester and signer classes.
WalletConnect can be instantiated by providing the bridge server that the client should connect to. 

### Requester client

The requester only needs to pass the wallet connect server
```
const client = await WalletConnectClient.init({
  relayProvider: "wss://relay.walletconnect.org"
});
```

### Signer client

The Signer needs to indicate that they are the 'controller' for the connection i.e. that they own the private keys for signing transactions etc.
```
const client = await WalletConnectClient.init({
  relayProvider: WALLETCONNECT_SERVER,
  controller: true,
});
```

## Pairing flow:
1. DAPP proposes a pairing request with some meta info about the DAPP: 
```
const walletConnectRequester = new SolanaWalletConnectRequester();
  walletConnectRequester.init(client);
  await walletConnectRequester.proposePairing({
    name: "Signing Wallet",
    description: "Example Solana Wallet",
    url: "https://solana-dapp.com",
    icons: [
      "https://my-app-icon",
    ],
  });
```
2. Mobile device is listening for pairing request: 
```
const walletConnectSignerClient = new SolanaWalletConnectSigner();
    walletConnectSignerClient.init(client, currentWallet.secretKey, connectionApi.getConnection());
    walletConnectSignerClient.on(SolanaWalletConnectEvent.PAIRING_PROPOSAL, async (proposal: SessionTypes.Proposal) => {
      // present meta information from Proposal to user
      // if user approves, then approve
    });
```
3. The User views and approves the pairing proposal and the device sends back some Meta info about itself to the DAPP:
```
await walletConnectSignerClient.approvePairing(proposal, {
  name: "Test Wallet",
  description: "Test Wallet",
  url: "https://www.civic.com",
  icons: [
    "https://play-lh.googleusercontent.com/EKygllRSvy-uLK-W_IXOeeJvHWSdLUkch1Q21InVwDweqfF0LwWErjb4T7-lpFVZHKg=s180",
  ],
});
```
4. The DAPP resolves the promise from the 'proposePairing' call and extracts the info to update the display: 
```
const { session, publicKey } = await walletConnectRequester.proposePairing({
  name: "Signing Wallet",
  description: "Example Solana Wallet",
  url: "https://solana-dapp.com",
  icons: [
    "https://my-app-icon",
  ],
});
```
5. The DAPP and Mobile Device now have a secure session and the DAPP has the device publicKey that it can use to propose transactions

## Transaction signing flow (assumes successful pairing):
1. DAPP proposes a transaction to be signed:
```
const serializedTransaction = await this.walletConnectRequester.requestSignTransaction('<session topic id>', {
  fromPubkey: '<publicKey from initial pairing>'
  toPubkey: 'publicKey to send to';
  lamports: 'amount to send'
});
```
2. Mobile device is listening for transactions and receives a signing request:
```
walletConnectSignerClient.on(SolanaWalletConnectEvent.REQUEST_SIGN_TRANSACTION, async ({
    transactionRequest,
    topic,
    request,
  }: SignTransactionPayload) => {
    // present transaction to user for approval
  });
```
3. User approves transaction
4. Mobile device signs and sends transaction back:
```
await walletConnectSignerClient.signTransaction(transactionRequest, topic, request);
```
5. DAPP sends the signed transaction to the blockchain:
```
const signature: TransactionSignature = await solanaConnection.sendRawTransaction(
  rawTransaction,
  options
);
```