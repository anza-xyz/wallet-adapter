import type { EventEmitter, SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

interface SaifuWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface SaifuWallet extends EventEmitter<SaifuWalletEvents> {
    isSaifu?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction?(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface SolanaWindow extends Window {
    saifu?: SaifuWallet;
}

declare const window: SolanaWindow;

export interface SaifuWalletAdapterConfig {}

export const SaifuWalletName = 'Saifu' as WalletName<'Saifu'>;

export class SaifuWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = SaifuWalletName;
    url = 'https://saifuwallet.com';
    icon =
        'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNTQxcHgiIGhlaWdodD0iNTQxcHgiIHZpZXdCb3g9IjAgMCA1NDEgNTQxIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPkFydGJvYXJkIENvcHkgOTwvdGl0bGU+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgeDE9IjEuNzk5ODcyMTYlIiB5MT0iMCUiIHgyPSI5OC4zOTcxMDUxJSIgeTI9Ijk3Ljk5MDI5MSUiIGlkPSJsaW5lYXJHcmFkaWVudC0xIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0ZCOTIzQyIgb2Zmc2V0PSIwJSI+PC9zdG9wPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRUM0ODk5IiBvZmZzZXQ9IjEwMCUiPjwvc3RvcD4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPC9kZWZzPgogICAgPGcgaWQ9IkFydGJvYXJkLUNvcHktOSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTIzMi4yNzAwNDQsLTcuODU2NzI5NzFlLTE1IEwzMDcuNzI5OTU2LDcuODU2NzI5NzFlLTE1IEMzNzkuNDY1Mzc2LC01LjMyMDg1MzMyZS0xNSA0MTIuMzM3Mzc5LDguODE4NDMzMDYgNDQzLjMwMDM0MiwyNS4zNzc2MDY5IEM0NzQuMjYzMzA1LDQxLjkzNjc4MDcgNDk4LjU2MzIxOSw2Ni4yMzY2OTUyIDUxNS4xMjIzOTMsOTcuMTk5NjU4MiBDNTMxLjY4MTU2NywxMjguMTYyNjIxIDU0MC41LDE2MS4wMzQ2MjQgNTQwLjUsMjMyLjc3MDA0NCBMNTQwLjUsMzA4LjIyOTk1NiBDNTQwLjUsMzc5Ljk2NTM3NiA1MzEuNjgxNTY3LDQxMi44MzczNzkgNTE1LjEyMjM5Myw0NDMuODAwMzQyIEM0OTguNTYzMjE5LDQ3NC43NjMzMDUgNDc0LjI2MzMwNSw0OTkuMDYzMjE5IDQ0My4zMDAzNDIsNTE1LjYyMjM5MyBDNDEyLjMzNzM3OSw1MzIuMTgxNTY3IDM3OS40NjUzNzYsNTQxIDMwNy43Mjk5NTYsNTQxIEwyMzIuMjcwMDQ0LDU0MSBDMTYwLjUzNDYyNCw1NDEgMTI3LjY2MjYyMSw1MzIuMTgxNTY3IDk2LjY5OTY1ODIsNTE1LjYyMjM5MyBDNjUuNzM2Njk1Miw0OTkuMDYzMjE5IDQxLjQzNjc4MDcsNDc0Ljc2MzMwNSAyNC44Nzc2MDY5LDQ0My44MDAzNDIgQzguMzE4NDMzMDYsNDEyLjgzNzM3OSAtMC41LDM3OS45NjUzNzYgLTAuNSwzMDguMjI5OTU2IEwtMC41LDIzMi43NzAwNDQgQy0wLjUsMTYxLjAzNDYyNCA4LjMxODQzMzA2LDEyOC4xNjI2MjEgMjQuODc3NjA2OSw5Ny4xOTk2NTgyIEM0MS40MzY3ODA3LDY2LjIzNjY5NTIgNjUuNzM2Njk1Miw0MS45MzY3ODA3IDk2LjY5OTY1ODIsMjUuMzc3NjA2OSBDMTI3LjY2MjYyMSw4LjgxODQzMzA2IDE2MC41MzQ2MjQsNS4zMjA4NTMzMmUtMTUgMjMyLjI3MDA0NCwtNy44NTY3Mjk3MWUtMTUgWiIgaWQ9IlJlY3RhbmdsZSIgZmlsbD0idXJsKCNsaW5lYXJHcmFkaWVudC0xKSI+PC9wYXRoPgogICAgICAgIDxnIGlkPSJMYXllciIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTA3LjUwMjc2NCwgODcuMDIxNTg5KSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xNjEuMzI1MTQ3LDMyMy44NjM0MjEgQzE0Mi44Mjk2OTQsMzIzLjc5NzY1NSAxMjMuMjczNDA1LDMyMy4xODE2MjggMTE1LjYyMDA1NCwzMjIuNDIzNjkzIEMxMDguMjYyNjAyLDMyMS42OTUwNTUgOTYuMTg1MjU1MywzMTkuOTI1MzEgODguNzgxNTA3MywzMTguNDkwODYyIEM4MS4zNzc3NjAzLDMxNy4wNTY0NDQgNzAuNTIyNDg5MywzMTQuMzEyMjczIDY0LjY1ODY4OTMsMzEyLjM5MjcxOCBDNTguNzk0ODg5MywzMTAuNDczMTMxIDUwLjMxNDQ1MTMsMzA3LjEyMTE3MiA0NS44MTMyNzYzLDMwNC45NDM4NjUgQzQxLjMxMjA5MzMsMzAyLjc2NjU4OCAzMy45ODIzODIzLDI5OC4yMzcxMzkgMjkuNTI1MDMwMywyOTQuODc4NDM1IEMyNS4wNjc2NzEzLDI5MS41MTk3MDEgMTkuMTY5NTMxMywyODYuMDA1Njk0IDE2LjQxODA0MzMsMjgyLjYyNTAxNyBDMTMuNjY2NTU1MywyNzkuMjQ0NDAyIDkuNjgzMDk2MjksMjczLjAzNzM3MSA3LjU2NTkwMTI5LDI2OC44MzE2MjEgQzUuNDQ4NzEzMjksMjY0LjYyNTg3MiAyLjg3OTY0NDI5LDI1Ny42NTA4OTYgMS44NTY4NTUyOSwyNTMuMzMxNjIxIEMwLjU0MDkzNzI4NywyNDcuNzc0NDkzIDAsMjQxLjY3NzU2OSAwLDIzMi40Nzg0MTEgQzAsMjIzLjk1Mzc1MyAwLjYyMzY5MzI4NywyMTYuMzgwMDgzIDEuODA2NDE3MjksMjEwLjQ3ODQxMSBDMi43OTg0MjkyOSwyMDUuNTI4Mzk5IDQuOTYyNzg5MjksMTk3LjQyODQyMyA2LjYxNjExNzI5LDE5Mi40Nzg0MTEgQzguMjY5NDQ1MjksMTg3LjUyODM5OSAxMS4zNzA1MjczLDE3OS41MzcwOTYgMTMuNTA3NDIxMywxNzQuNzE5OTI3IEMxNy4zOTI2NjgzLDE2NS45NjE0NDMgMTcuMzkyNjY4MywxNjUuOTYxNDQzIDE0Ljg0OTI0MTMsMTYxLjA1OTA5OSBDMTMuMjU3MzY4MywxNTcuOTkwODMyIDEyLjI0ODA5MDMsMTU0LjMwNjUwNSAxMi4xNTE1MjUzLDE1MS4yMTExODQgQzEyLjA2NjY2MzMsMTQ4LjQ5MTEyMiAxMi42MjU5NTkzLDE0NC41MTM1MDYgMTMuMzk0Mzk5MywxNDIuMzcyMDI3IEMxNC4xNjI4NDAzLDE0MC4yMzA1NDcgMTcuOTQ4MTk0MywxMzQuMjE2NDc5IDIxLjgwNjMwMzMsMTI5LjAwNzQzMyBDMjUuNjY0NDExMywxMjMuNzk4Mzg4IDMzLjEzNTY4NzMsMTE1LjA3NTYwOSAzOC40MDkxMzkzLDEwOS42MjM0OTIgQzQzLjY4MjU5MjMsMTA0LjE3MTM3NCA1MS41OTcyNDIzLDk2LjY3NTczODQgNTUuOTk3MjM2Myw5Mi45NjY0Nzk0IEM2MC4zOTcyMzAzLDg5LjI1NzI1MDQgNjcuODIyMjMzMyw4My42Nzk5MTk0IDcyLjQ5NzIzNjMsODAuNTcyNDM2NCBDNzcuMTcyMjM5Myw3Ny40NjQ5MjI0IDg1LjQwNTkyNzMsNzIuNjU0Mzc1NCA5MC43OTQzMjUzLDY5Ljg4MjMxMTQgQzk2LjE4MjcyMjMsNjcuMTEwMjQ3NCAxMDQuNTg1OTgxLDYzLjM1NzEwNDQgMTA5LjQ2ODIxNCw2MS41NDE5NDk0IEMxMTQuMzUwNDYyLDU5LjcyNjgyNDQgMTIxLjQxNjc2MSw1Ny40MzYzMjc0IDEyNS4xNzExMjUsNTYuNDUxOTgzNCBDMTI4LjkyNTQ4OSw1NS40Njc2MDg0IDEzMi4zNzk0MzgsNTQuMzI4NjYxNCAxMzIuODQ2NTcxLDUzLjkyMDk3NzQgQzEzMy4zMTM3MDMsNTMuNTEzMjkzNCAxMzMuMzkzNDkxLDUyLjIyNjg4NTQgMTMzLjAyMzg2Myw1MS4wNjIzMDQ0IEMxMzIuNjU0MjM0LDQ5Ljg5NzcyMzQgMTMwLjY1NDQzMiw0OC4wNzg5MzY0IDEyOC41Nzk4NDcsNDcuMDIwNTU2NCBDMTI2LjUwNTI2Miw0NS45NjIxNzY0IDEyMy4zMzE2OTMsNDMuNDE0OTY1NCAxMjEuNTI3NDY0LDQxLjM2MDA2NDQgQzExOS43MjMyMzQsMzkuMzA1MTYzNCAxMTcuNjI4MzQsMzYuMTQzMDg0NCAxMTYuODcyMTQ0LDM0LjMzMzI2OTQgQzExNi4xMTU5NDksMzIuNTIzNDI0NCAxMTUuNDk3MjM2LDI4LjMxMzczODQgMTE1LjQ5NzIzNiwyNC45Nzg0MTE0IEMxMTUuNDk3MjM2LDIxLjY0MzA4NDQgMTE2LjE4NjE1NSwxNy4yNjUzMzc0IDExNy4wMjgxODEsMTUuMjUwMTA5NCBDMTE3Ljg3MDE5MSwxMy4yMzQ4ODE0IDExOS42OTgxMDMsMTAuMDkyNzkxNCAxMjEuMDkwMTkzLDguMjY3NjU3NDMgQzEyMi40ODIyNjcsNi40NDI1NTM0MyAxMjUuODI4Mzk3LDMuODMwODI4NDMgMTI4LjUyNTk5OSwyLjQ2MzgyNDQzIEMxMzIuMzM4NDIzLDAuNTMxOTM5NDI1IDEzNC45NDE0MTksLTAuMDE2NzA1NTc0NiAxNDAuMjEzOTg3LDAgQzE0NC42MTc5NDgsMC4wMTQ2MzU0MjU0IDE0OC40MTM4NDcsMC42NjU4MTk0MjUgMTUxLjAzNTk0OCwxLjg1Njg5MDQzIEMxNTMuMjU3MjMxLDIuODY1ODkzNDMgMTU2Ljk2OTc0LDUuODQ0MzQ3NDMgMTU5LjI4NTk0OCw4LjQ3NTcyNTQzIEMxNjMuNDk3MjM2LDEzLjI1OTk5NzQgMTYzLjQ5NzIzNiwxMy4yNTk5OTc0IDE2Ny43MDg1MjQsOC40NzU3MjU0MyBDMTcwLjAyNDczMiw1Ljg0NDM0NzQzIDE3My43MzcyNDEsMi44NjU4OTM0MyAxNzUuOTU4NTI0LDEuODU2ODkwNDMgQzE3OC41ODA2MjUsMC42NjU4MTk0MjUgMTgyLjM3NjUzOSwwLjAxNDYzNTQyNTQgMTg2Ljc4MDQ3LDAgQzE5Mi4wNTMwNTMsLTAuMDE2NzA1NTc0NiAxOTQuNjU2MDQ5LDAuNTMxOTM5NDI1IDE5OC40Njg0NTgsMi40NjM4MjQ0MyBDMjAxLjE2NjA5LDMuODMwODI4NDMgMjA0LjQ3MzAwNSw2LjQxODMyMjQzIDIwNS44MTcxODIsOC4yMTM4MjQ0MyBDMjA3LjE2MTM2LDEwLjAwOTM1NjQgMjA4Ljk4OTI0LDEyLjkxODU2NjQgMjA5Ljg3OTE5NCwxNC42Nzg3NTk0IEMyMTAuODgxODgsMTYuNjYxOTQ0NCAyMTEuNDk3MjM2LDIwLjM4MjIyMDQgMjExLjQ5NzIzNiwyNC40NjA4NjM0IEMyMTEuNDk3MjM2LDI4LjA4MDg1OTQgMjEwLjg3ODUyMywzMi41MjM0MjQ0IDIxMC4xMjIzMjgsMzQuMzMzMjY5NCBDMjA5LjM2NjEzMiwzNi4xNDMwODQ0IDIwNy4yNzEyNTMsMzkuMzA1MTYzNCAyMDUuNDY3MDI0LDQxLjM2MDA2NDQgQzIwMy42NjI3OTQsNDMuNDE0OTY1NCAyMDAuNDg5MjEsNDUuOTYyMTc2NCAxOTguNDE0NjI1LDQ3LjAyMDU1NjQgQzE5Ni4zNDAwNCw0OC4wNzg5MzY0IDE5NC4zNDAyMjMsNDkuODk3NzIzNCAxOTMuOTcwNjI1LDUxLjA2MjMwNDQgQzE5My42MDA5OTYsNTIuMjI2ODg1NCAxOTMuNjgwNzY5LDUzLjUwODI4ODQgMTk0LjE0NzkwMSw1My45MDk4Mzg0IEMxOTQuNjE1MDM0LDU0LjMxMTM4ODQgMTk3LjY5NzI0OCw1NS4zNzA1MzE0IDIwMC45OTcyMzYsNTYuMjYzNDQ1NCBDMjA0LjI5NzIyNCw1Ny4xNTYzNTk0IDIxMC4xNTMwODksNTguOTY5NDM5NCAyMTQuMDEwMjA2LDYwLjI5MjQ5ODQgQzIxNy44NjczNTMsNjEuNjE1NTI2NCAyMjQuMzY0NzI5LDY0LjE2NDYyOTQgMjI4LjQ0ODgzNSw2NS45NTcxNzE0IEMyMzIuNTMyOTQyLDY3Ljc0OTcxMjQgMjQwLjI5MjA2Niw3MS44MzkzNzM0IDI0NS42OTEyOTcsNzUuMDQ1MzM2NCBDMjUxLjA5MDUyOCw3OC4yNTEyOTk0IDI1OC45OTMxNDcsODMuNDY0MjgxNCAyNjMuMjUyNjY4LDg2LjYyOTcxNzQgQzI2Ny41MTIxOSw4OS43OTUxODM0IDI3Ny4xMTY2ODIsOTguNDgxMDk3NCAyODQuNTk2MDIxLDEwNS45MzE3NSBDMjkyLjA3NTM2MSwxMTMuMzgyNDAzIDMwMS40MTI0MjgsMTIzLjgzNTQ2NyAzMDUuMzQ1MDc1LDEyOS4xNjA3ODQgQzMwOS4yNzc2OTMsMTM0LjQ4NjA3MSAzMTIuOTQ1NzUzLDE0MC4wMjc4OCAzMTMuNDk2MjU5LDE0MS40NzU4NzggQzMxNC4wNDY3OTcsMTQyLjkyMzg3NiAzMTQuNDk3MjM2LDE0Ni45MzcyODkgMzE0LjQ5NzIzNiwxNTAuMzk0NTY0IEMzMTQuNDk3MjM2LDE1NS4xMzAxMjkgMzEzLjg5ODExNSwxNTcuODA3Mjk5IDMxMi4wNjgxODksMTYxLjI0ODkxOSBDMzA5LjYzOTE3MywxNjUuODE3MzI0IDMwOS42MzkxNzMsMTY1LjgxNzMyNCAzMTQuNjI4MjE3LDE3Ny41ODk4MzEgQzMxNy4zNzIxNzUsMTg0LjA2NDcxNSAzMjAuNzM4NzUyLDE5My4yMTM0NTcgMzIyLjEwOTQ0OSwxOTcuOTIwMzY3IEMzMjMuNDgwMTc3LDIwMi42MjcyNzYgMzI1LjI5ODAxNywyMTAuOTc4NDExIDMyNi4xNDkwOTEsMjE2LjQ3ODQxMSBDMzI3LjIxNTAwOSwyMjMuMzY2Njg2IDMyNy41MTg4NDIsMjI5LjkwMTMyNCAzMjcuMTI1NTAxLDIzNy40Nzg0MTEgQzMyNi43OTc0MzcsMjQzLjc5NzY4NiAzMjUuNjgwNDY0LDI1MS41OTY4OCAzMjQuNTAwNTYyLDI1NS44MDcwMjQgQzMyMy4zNzA4OTMsMjU5LjgzNzc4NiAzMjEuMTU2ODEyLDI2NS42OTA3ODMgMzE5LjU4MDM5NiwyNjguODEzNjc3IEMzMTguMDAzOTUsMjcxLjkzNjYwMiAzMTQuNTU1NzA4LDI3Ny4zNjMwNTUgMzExLjkxNzY0NiwyODAuODcyNDU0IEMzMDkuMjc5NTU0LDI4NC4zODE4ODQgMzAzLjgyNDc4MSwyODkuODcyNjk4IDI5OS43OTU5NDIsMjkzLjA3NDI5NyBDMjk1Ljc2NzA3MiwyOTYuMjc1ODY2IDI4OS42NjQxOTgsMzAwLjQ2Mzg4NSAyODYuMjMzOTkxLDMwMi4zODA5NjggQzI4Mi44MDM3ODUsMzA0LjI5ODA4MyAyNzUuODc1MDEzLDMwNy40NTc3NTEgMjcwLjgzNjc0NCwzMDkuNDAyNDgzIEMyNjUuNzk4NDc1LDMxMS4zNDcyNDYgMjU3LjI0ODQ1NywzMTQuMDkwNTk0IDI1MS44MzY3NDQsMzE1LjQ5ODgyNyBDMjQ2LjQyNTAwMSwzMTYuOTA3MDYxIDIzNi41OTcyNDIsMzE4LjkxNDY5IDIyOS45OTcyMzYsMzE5Ljk2MDI4NCBDMjIzLjM5NzIzLDMyMS4wMDU4NDYgMjEyLjUxOTc4OCwzMjIuMzM3NjY0IDIwNS44MjUxNDcsMzIyLjkxOTg0OCBDMTk5LjEzMDUwNiwzMjMuNTAyMDYyIDE3OS4xMDU0OTcsMzIzLjkyNjY4NCAxNjEuMzI1MTQ3LDMyMy44NjM0MjEgWiIgaWQ9IlNoYXBlIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: SaifuWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: SaifuWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.saifu) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isConnected;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window.saifu!;

            if (!wallet.isConnected) {
                try {
                    await wallet.connect();
                } catch (error: any) {
                    throw new WalletConnectionError(error?.message, error);
                }
            }

            if (!wallet.publicKey) throw new WalletAccountError();

            let publicKey: PublicKey;
            try {
                publicKey = new PublicKey(wallet.publicKey.toBytes());
            } catch (error: any) {
                throw new WalletPublicKeyError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', publicKey);
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        } finally {
            this._connecting = false;
        }
    }

    async disconnect(): Promise<void> {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            try {
                await wallet.disconnect();
            } catch (error: any) {
                this.emit('error', new WalletDisconnectionError(error?.message, error));
            }
        }

        this.emit('disconnect');
    }

    async sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options: SendTransactionOptions = {}
    ): Promise<TransactionSignature> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            if (wallet.signAndSendTransaction) {
                try {
                    const { signers, ...sendOptions } = options;

                    transaction = await this.prepareTransaction(transaction, connection, sendOptions);

                    signers?.length && transaction.partialSign(...signers);

                    sendOptions.preflightCommitment = sendOptions.preflightCommitment || connection.commitment;

                    const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                    return signature;
                } catch (error: any) {
                    if (error instanceof WalletError) throw error;
                    throw new WalletSendTransactionError(error?.message, error);
                }
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }

        return await super.sendTransaction(transaction, connection, options);
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signTransaction(transaction)) as T) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions<T extends Transaction>(transactions: T[]): Promise<T[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return ((await wallet.signAllTransactions(transactions)) as T[]) || transactions;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signMessage(message: Uint8Array): Promise<Uint8Array> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                const { signature } = await wallet.signMessage(message);
                return signature;
            } catch (error: any) {
                throw new WalletSignMessageError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    private _disconnected = () => {
        const wallet = this._wallet;
        if (wallet) {
            wallet.off('disconnect', this._disconnected);

            this._wallet = null;
            this._publicKey = null;

            this.emit('error', new WalletDisconnectedError());
            this.emit('disconnect');
        }
    };
}
