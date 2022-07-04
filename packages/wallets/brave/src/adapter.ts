import {
    BaseMessageSignerWalletAdapter,
    EventEmitter,
    scopePollingDetectionStrategy,
    SendTransactionOptions,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
    WalletSignMessageError,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';

interface BraveWalletEvents {
    connect(...args: unknown[]): unknown;
    disconnect(...args: unknown[]): unknown;
}

interface BraveWallet extends EventEmitter<BraveWalletEvents> {
    isBraveWallet?: boolean;
    publicKey?: { toBytes(): Uint8Array };
    isConnected: boolean;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
    signAndSendTransaction(
        transaction: Transaction,
        options?: SendOptions
    ): Promise<{ signature: TransactionSignature }>;
    signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}

interface BraveWindow extends Window {
    braveSolana?: BraveWallet;
}

declare const window: BraveWindow;

export interface BraveWalletAdapterConfig {}

export const BraveWalletName = 'Brave' as WalletName<'Brave'>;

export class BraveWalletAdapter extends BaseMessageSignerWalletAdapter {
    name = BraveWalletName;
    url = 'https://brave.com/wallet';
    icon =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTE4IiBoZWlnaHQ9IjEzNSIgdmlld0JveD0iMCAwIDExOCAxMzUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMTEyLjI5NCAzMi4zMTgxTDExNS40NTQgMjQuNTYyOEMxMTUuNDU0IDI0LjU2MjggMTExLjQzMiAyMC4yNTQzIDEwNi41NDkgMTUuMzcxM0MxMDEuNjY1IDEwLjQ4ODQgOTEuMzI0MyAxMy4zNjA3IDkxLjMyNDMgMTMuMzYwN0w3OS41NDY5IDBINTguODY0NkgzOC4xODIzTDI2LjQwNDkgMTMuMzYwN0MyNi40MDQ5IDEzLjM2MDcgMTYuMDYzOCAxMC40ODg0IDExLjE4MDUgMTUuMzcxM0M2LjI5NzEzIDIwLjI1NDMgMi4yNzU1OCAyNC41NjI4IDIuMjc1NTggMjQuNTYyOEw1LjQzNTM3IDMyLjMxODFMMS40MTM4MiA0My44MDc1QzEuNDEzODIgNDMuODA3NSAxMy4yNDE1IDg4LjYwMzEgMTQuNjI3NSA5NC4wNzM1QzE3LjM1NjQgMTA0Ljg0NSAxOS4yMjM2IDEwOS4wMSAyNi45Nzk0IDExNC40NjdDMzQuNzM1MyAxMTkuOTI1IDQ4LjgxMDcgMTI5LjQwMyA1MS4xMDg3IDEzMC44MzlDNTMuNDA2OCAxMzIuMjc2IDU2LjI3OTMgMTM0LjcyMiA1OC44NjQ2IDEzNC43MjJDNjEuNDQ5OSAxMzQuNzIyIDY0LjMyMjQgMTMyLjI3NiA2Ni42MjA1IDEzMC44MzlDNjguOTE4NSAxMjkuNDAzIDgyLjk5MzkgMTE5LjkyNSA5MC43NDk4IDExNC40NjdDOTguNTA1NiAxMDkuMDEgMTAwLjM3MyAxMDQuODQ1IDEwMy4xMDIgOTQuMDczNUMxMDQuNDg3IDg4LjYwMzEgMTE2LjMxNSA0My44MDc1IDExNi4zMTUgNDMuODA3NUwxMTIuMjk0IDMyLjMxODFaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNNzMuNTE0NiAyNC4yNzU2Qzc1LjIzODIgMjQuMjc1NiA4OC4wMjEgMjEuODM0MSA4OC4wMjEgMjEuODM0MUM4OC4wMjEgMjEuODM0MSAxMDMuMTcgNDAuMTQ1MyAxMDMuMTcgNDQuMDU4OEMxMDMuMTcgNDcuMjk0NiAxMDEuODY3IDQ4LjU2MTEgMTAwLjMzMyA1MC4wNTI2QzEwMC4wMTEgNTAuMzY1MSA5OS42Nzk4IDUwLjY4NzQgOTkuMzQ4IDUxLjAzOThDOTcuNDMyIDUzLjA3NDIgODkuMDY0IDYxLjk1OTUgODcuOTg5NCA2My4xMDA0Qzg3Ljg3NjggNjMuMjIgODcuNzUxNSA2My4zNDYgODcuNjE4OCA2My40Nzk0Qzg2LjQ4NSA2NC42MTkzIDg0LjgxNTUgNjYuMjk3OCA4NS45OTM1IDY5LjA4NTVDODYuMDcyMyA2OS4yNzE5IDg2LjE1MzMgNjkuNDYxMyA4Ni4yMzU1IDY5LjY1MzVDODcuNTI3MSA3Mi42NzM5IDg5LjEyMTUgNzYuNDAyMyA4Ny4wOTIgODAuMTgwOEM4NC45MzMgODQuMTk5OCA4MS4yMzQ2IDg2Ljg4MjMgNzguODY0OCA4Ni40Mzg4Qzc2LjQ5NDkgODUuOTk1IDcwLjkyOTQgODMuMDg2NyA2OC44ODI3IDgxLjc1ODNDNjYuODM2IDgwLjQyOTggNjAuMzQ5MiA3NS4wODA0IDYwLjM0OTIgNzMuMDMzNkM2MC4zNDkyIDcxLjMyNjUgNjUuMDE0MyA2OC40ODY2IDY3LjI4MSA2Ny4xMDY4QzY3LjczMTggNjYuODMyNCA2OC4wODc3IDY2LjYxNTcgNjguMjkzMiA2Ni40NzcxQzY4LjUyNzIgNjYuMzE5NSA2OC45MTg2IDY2LjA3NjQgNjkuNDAwMiA2NS43NzcyQzcxLjQ2OTEgNjQuNDkxOSA3NS4yMDQ2IDYyLjE3MTIgNzUuMjk4NSA2MS4xNDIzQzc1LjQxNCA1OS44NzM2IDc1LjM3IDU5LjUwMTcgNzMuNzAyNSA1Ni4zNjc0QzczLjM0NzkgNTUuNzAwOSA3Mi45MzMgNTQuOTg3IDcyLjUwNDIgNTQuMjQ5MkM3MC45MTYzIDUxLjUxNzMgNjkuMTM4MyA0OC40NTgzIDY5LjUzMTkgNDYuMjY3MUM2OS45NzYyIDQzLjc5MzUgNzMuODUyMyA0Mi4zNzUzIDc3LjEzNTYgNDEuMTc0Qzc3LjU0NiA0MS4wMjM4IDc3Ljk0NzEgNDAuODc3MSA3OC4zMzEgNDAuNzMyMUM3OS4yODkzIDQwLjM3MDIgODAuNDkzNSAzOS45MTkyIDgxLjc1MTMgMzkuNDQ4MUM4NS4wMjkzIDM4LjIyMDMgODguNjcxNCAzNi44NTYyIDg5LjI3MiAzNi41NzkyQzkwLjEwMzYgMzYuMTk1OCA4OS44ODg3IDM1LjgzMDcgODcuMzcwMyAzNS41OTJDODcuMDM3MiAzNS41NjA0IDg2LjYyMjkgMzUuNTE2NCA4Ni4xNDc1IDM1LjQ2NTlDODMuMDMwMSAzNS4xMzQ2IDc3LjI4MDUgMzQuNTIzNyA3NC40ODUzIDM1LjMwMjhDNzMuOTM1NSAzNS40NTYgNzMuMzE5MiAzNS42MjI5IDcyLjY3MjkgMzUuNzk3OUM2OS41MzI1IDM2LjY0ODMgNjUuNjgzOSAzNy42OTA0IDY1LjMxNDEgMzguMjkxMkM2NS4yNDk0IDM4LjM5NjMgNjUuMTg1OSAzOC40ODY2IDY1LjEyNTggMzguNTcyQzY0Ljc3MjEgMzkuMDc0NyA2NC41NDE1IDM5LjQwMjUgNjQuOTMyOSA0MS41Mzg5QzY1LjA0OTQgNDIuMTc1MSA2NS4yODkxIDQzLjQyNjYgNjUuNTg1NCA0NC45NzM5QzY2LjQ1MjggNDkuNTA0MiA2Ny44MDYgNTYuNTcxIDY3Ljk3NjQgNTguMTU4NkM2OC4wMDAzIDU4LjM4MDggNjguMDI2NSA1OC41OTUxIDY4LjA1MTggNTguODAxNEM2OC4yNjg5IDYwLjU3MjYgNjguNDEzMyA2MS43NTEyIDY2LjM1NjMgNjIuMjIxNUM2Ni4xODUgNjIuMjYwNiA2Ni4wMDUxIDYyLjMwMTkgNjUuODE4MSA2Mi4zNDQ4QzYzLjQ5NyA2Mi44Nzc0IDYwLjA5NDIgNjMuNjU4MiA1OC44NjQ3IDYzLjY1ODJDNTcuNjM0NyA2My42NTgyIDU0LjIyOTMgNjIuODc2OCA1MS45MDg0IDYyLjM0NDJDNTEuNzIyNCA2Mi4zMDE1IDUxLjU0MzUgNjIuMjYwNCA1MS4zNzMxIDYyLjIyMTVDNDkuMzE1OSA2MS43NTEyIDQ5LjQ2MDMgNjAuNTcyNiA0OS42NzczIDU4LjgwMTRDNDkuNzAyNiA1OC41OTUxIDQ5LjcyODggNTguMzgwOCA0OS43NTI3IDU4LjE1ODZDNDkuOTIzNiA1Ni41Njg3IDUxLjI4MDIgNDkuNDg0NSA1Mi4xNDc2IDQ0Ljk1NUM1Mi40NDIyIDQzLjQxNjQgNTIuNjgwNCA0Mi4xNzI1IDUyLjc5NjUgNDEuNTM4OUM1My4xODc2IDM5LjQwMjcgNTIuOTU3IDM5LjA3NDggNTIuNjAzNSAzOC41NzIxQzUyLjU0MzUgMzguNDg2NyA1Mi40Nzk5IDM4LjM5NjMgNTIuNDE1MyAzOC4yOTEyQzUyLjA0NTYgMzcuNjkwNCA0OC4xOTcyIDM2LjY0ODQgNDUuMDU2OCAzNS43OThDNDQuNDEwMyAzNS42MjMgNDMuNzkzOCAzNS40NTYxIDQzLjI0MzggMzUuMzAyOEM0MC40NDg3IDM0LjUyMzcgMzQuNjk5NyAzNS4xMzQ2IDMxLjU4MjEgMzUuNDY1OUMzMS4xMDY1IDM1LjUxNjQgMzAuNjkyMSAzNS41NjA0IDMwLjM1ODggMzUuNTkyQzI3Ljg0MDcgMzUuODMwNyAyNy42MjU4IDM2LjE5NTggMjguNDU3MiAzNi41NzkyQzI5LjA1NzggMzYuODU2MSAzMi42OTgxIDM4LjIxOTYgMzUuOTc1NSAzOS40NDcxQzM3LjIzNDIgMzkuOTE4NiAzOC40Mzk0IDQwLjM3IDM5LjM5ODQgNDAuNzMyMUMzOS43ODI1IDQwLjg3NzIgNDAuMTgzOCA0MS4wMjQgNDAuNTk0MyA0MS4xNzQyQzQzLjg3NzQgNDIuMzc1NSA0Ny43NTMzIDQzLjc5MzcgNDguMTk3NSA0Ni4yNjcxQzQ4LjU5MSA0OC40NTggNDYuODEzNCA1MS41MTY0IDQ1LjIyNTggNTQuMjQ4QzQ0Ljc5NjggNTQuOTg2MiA0NC4zODE2IDU1LjcwMDUgNDQuMDI2OSA1Ni4zNjc0QzQyLjM1OTQgNTkuNTAxNyA0Mi4zMTUxIDU5Ljg3MzYgNDIuNDMwOSA2MS4xNDIzQzQyLjUyNDYgNjIuMTcxIDQ2LjI1ODggNjQuNDkxIDQ4LjMyNzggNjUuNzc2NUM0OC44MSA2Ni4wNzYgNDkuMjAxNyA2Ni4zMTk0IDQ5LjQzNTkgNjYuNDc3MUM0OS42NDEzIDY2LjYxNTYgNDkuOTk2OSA2Ni44MzIgNTAuNDQ3MyA2Ny4xMDYyQzUyLjcxMzYgNjguNDg1OCA1Ny4zNzk5IDcxLjMyNjMgNTcuMzc5OSA3My4wMzM2QzU3LjM3OTkgNzUuMDgwNCA1MC44OTM0IDgwLjQyOTggNDguODQ2NyA4MS43NTgzQzQ2LjggODMuMDg2NyA0MS4yMzQ1IDg1Ljk5NSAzOC44NjQ3IDg2LjQzODhDMzYuNDk0OCA4Ni44ODIzIDMyLjc5NjQgODQuMTk5OCAzMC42Mzc0IDgwLjE4MDhDMjguNjA4IDc2LjQwMjYgMzAuMjAyMSA3Mi42NzQ1IDMxLjQ5MzQgNjkuNjU0MkMzMS41NzU3IDY5LjQ2MTcgMzEuNjU2OCA2OS4yNzIxIDMxLjczNTYgNjkuMDg1NUMzMi45MTM4IDY2LjI5NzUgMzEuMjQzOSA2NC42MTg5IDMwLjExIDYzLjQ3OUMyOS45Nzc1IDYzLjM0NTcgMjkuODUyMiA2My4yMTk5IDI5LjczOTcgNjMuMTAwNEMyOS4xMTY3IDYyLjQzODcgMjYuMDQgNTkuMTcxOSAyMy4xOTE2IDU2LjE0NzVDMjEuMTI4OSA1My45NTczIDE5LjE4NTkgNTEuODk0MyAxOC4zODEyIDUxLjAzOThDMTguMDQ5NCA1MC42ODc1IDE3LjcxNzkgNTAuMzY1MiAxNy4zOTY2IDUwLjA1MjhDMTUuODYyNCA0OC41NjEyIDE0LjU1OTggNDcuMjk0NyAxNC41NTk4IDQ0LjA1ODhDMTQuNTU5OCA0MC4xNDUzIDI5LjcwODQgMjEuODM0MSAyOS43MDg0IDIxLjgzNDFDMjkuNzA4NCAyMS44MzQxIDQyLjQ5MTIgMjQuMjc1NiA0NC4yMTQ4IDI0LjI3NTZDNDUuNTkwMSAyNC4yNzU2IDQ4LjI0NTcgMjMuMzYxMSA1MS4wMTQxIDIyLjQwNzhDNTEuNzE1IDIyLjE2NjUgNTIuNDIzMiAyMS45MjI2IDUzLjExOTYgMjEuNjkwNUM1Ni41NjY3IDIwLjU0MTUgNTguODY0NyAyMC41MzMyIDU4Ljg2NDcgMjAuNTMzMkM1OC44NjQ3IDIwLjUzMzIgNjEuMTYyNyAyMC41NDE1IDY0LjYwOTggMjEuNjkwNUM2NS4zMDYyIDIxLjkyMjYgNjYuMDE0NCAyMi4xNjY1IDY2LjcxNTQgMjIuNDA3OEM2OS40ODM3IDIzLjM2MTEgNzIuMTM5NCAyNC4yNzU2IDczLjUxNDYgMjQuMjc1NlpNNzEuMzIwNiA4OS4wNDQyQzc0LjAyMjggOTAuNDM2NiA3NS45Mzk4IDkxLjQyNDQgNzYuNjY0NiA5MS44Nzc5Qzc3LjYwMjIgOTIuNDY1IDc3LjAzMDMgOTMuNTcxNyA3Ni4xNzYzIDk0LjE3NTVDNzUuMzIyIDk0Ljc3OTMgNjMuODQzIDEwMy42NjcgNjIuNzI5MSAxMDQuNjVDNjIuNTg2NSAxMDQuNzc2IDYyLjQzNTQgMTA0LjkxMiA2Mi4yNzc5IDEwNS4wNTRDNjEuMjA0NSAxMDYuMDIxIDU5LjgzNTMgMTA3LjI1NSA1OC44NjQ2IDEwNy4yNTVDNTcuODkzNiAxMDcuMjU1IDU2LjUyMzUgMTA2LjAyIDU1LjQ1IDEwNS4wNTJDNTUuMjkzIDEwNC45MTEgNTUuMTQyNCAxMDQuNzc1IDU1LjAwMDIgMTA0LjY1QzUzLjg4NiAxMDMuNjY3IDQyLjQwNzMgOTQuNzc5MyA0MS41NTMgOTQuMTc1NUM0MC42OTg3IDkzLjU3MTcgNDAuMTI3MSA5Mi40NjUgNDEuMDY0NyA5MS44Nzc5QzQxLjc5IDkxLjQyNDEgNDMuNzA4OCA5MC40MzU0IDQ2LjQxMzcgODkuMDQxN0M0Ny4yMDY2IDg4LjYzMzIgNDguMDY2OSA4OC4xODk5IDQ4Ljk4NDYgODcuNzE1QzUzLjAzMjIgODUuNjIwNSA1OC4wNzczIDgzLjgzOTcgNTguODY0NiA4My44Mzk3QzU5LjY1MiA4My44Mzk3IDY0LjY5NjggODUuNjIwNSA2OC43NDUgODcuNzE1QzY5LjY2NDUgODguMTkwOCA3MC41MjY0IDg4LjYzNSA3MS4zMjA2IDg5LjA0NDJaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTkxLjMyNDMgMTMuMzYwN0w3OS41NDY5IDBINTguODY0NkgzOC4xODIzTDI2LjQwNDkgMTMuMzYwN0MyNi40MDQ5IDEzLjM2MDcgMTYuMDYzNyAxMC40ODg0IDExLjE4MDQgMTUuMzcxM0MxMS4xODA0IDE1LjM3MTMgMjQuOTY4NiAxNC4xMjY3IDI5LjcwODMgMjEuODM0MUMyOS43MDgzIDIxLjgzNDEgNDIuNDkxMSAyNC4yNzU2IDQ0LjIxNDYgMjQuMjc1NkM0NS45MzgxIDI0LjI3NTYgNDkuNjcyNCAyMi44Mzk0IDUzLjExOTUgMjEuNjkwNUM1Ni41NjY1IDIwLjU0MTUgNTguODY0NiAyMC41MzMyIDU4Ljg2NDYgMjAuNTMzMkM1OC44NjQ2IDIwLjUzMzIgNjEuMTYyNiAyMC41NDE1IDY0LjYwOTYgMjEuNjkwNUM2OC4wNTY3IDIyLjgzOTQgNzEuNzkxIDI0LjI3NTYgNzMuNTE0NSAyNC4yNzU2Qzc1LjIzOCAyNC4yNzU2IDg4LjAyMDggMjEuODM0MSA4OC4wMjA4IDIxLjgzNDFDOTIuNzYwNSAxNC4xMjY3IDEwNi41NDkgMTUuMzcxMyAxMDYuNTQ5IDE1LjM3MTNDMTAxLjY2NSAxMC40ODg0IDkxLjMyNDMgMTMuMzYwNyA5MS4zMjQzIDEzLjM2MDdaIiBmaWxsPSJ1cmwoI3BhaW50MV9saW5lYXIpIi8+CjxtYXNrIGlkPSJtYXNrMCIgbWFzay10eXBlPSJhbHBoYSIgbWFza1VuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeD0iMTEiIHk9IjAiIHdpZHRoPSI5NiIgaGVpZ2h0PSIyNSI+CjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOTEuMzI0MyAxMy4zNjA3TDc5LjU0NjkgMEg1OC44NjQ2SDM4LjE4MjNMMjYuNDA0OSAxMy4zNjA3QzI2LjQwNDkgMTMuMzYwNyAxNi4wNjM3IDEwLjQ4ODQgMTEuMTgwNCAxNS4zNzEzQzExLjE4MDQgMTUuMzcxMyAyNC45Njg2IDE0LjEyNjcgMjkuNzA4MyAyMS44MzQxQzI5LjcwODMgMjEuODM0MSA0Mi40OTExIDI0LjI3NTYgNDQuMjE0NiAyNC4yNzU2QzQ1LjkzODEgMjQuMjc1NiA0OS42NzI0IDIyLjgzOTQgNTMuMTE5NSAyMS42OTA1QzU2LjU2NjUgMjAuNTQxNSA1OC44NjQ2IDIwLjUzMzIgNTguODY0NiAyMC41MzMyQzU4Ljg2NDYgMjAuNTMzMiA2MS4xNjI2IDIwLjU0MTUgNjQuNjA5NiAyMS42OTA1QzY4LjA1NjcgMjIuODM5NCA3MS43OTEgMjQuMjc1NiA3My41MTQ1IDI0LjI3NTZDNzUuMjM4IDI0LjI3NTYgODguMDIwOCAyMS44MzQxIDg4LjAyMDggMjEuODM0MUM5Mi43NjA1IDE0LjEyNjcgMTA2LjU0OSAxNS4zNzEzIDEwNi41NDkgMTUuMzcxM0MxMDEuNjY1IDEwLjQ4ODQgOTEuMzI0MyAxMy4zNjA3IDkxLjMyNDMgMTMuMzYwN1oiIGZpbGw9IndoaXRlIi8+CjwvbWFzaz4KPGcgbWFzaz0idXJsKCNtYXNrMCkiPgo8L2c+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIxLjQxMzgyIiB5MT0iMTM1LjY3MiIgeDI9IjExNi4zMTUiIHkyPSIxMzUuNjcyIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjU1MDAiLz4KPHN0b3Agb2Zmc2V0PSIwLjQwOTg3NyIgc3RvcC1jb2xvcj0iI0ZGNTUwMCIvPgo8c3RvcCBvZmZzZXQ9IjAuNTgxOTgxIiBzdG9wLWNvbG9yPSIjRkYyMDAwIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGMjAwMCIvPgo8L2xpbmVhckdyYWRpZW50Pgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MV9saW5lYXIiIHgxPSIxMy4yMjkzIiB5MT0iMjQuMTg2MSIgeDI9IjEwNi41NDkiIHkyPSIyNC4xODYxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIHN0b3AtY29sb3I9IiNGRjQ1MkEiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkYyMDAwIi8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==';

    private _connecting: boolean;
    private _wallet: BraveWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.NotDetected;

    constructor(config: BraveWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;

        if (this._readyState !== WalletReadyState.Unsupported) {
            scopePollingDetectionStrategy(() => {
                if (window.braveSolana?.isBraveWallet) {
                    this._readyState = WalletReadyState.Installed;
                    this.emit('readyStateChange', this._readyState);
                    return true;
                }
                return false;
            });
        }
    }

    get publicKey(): PublicKey | null {
        return this._publicKey;
    }

    get connecting(): boolean {
        return this._connecting;
    }

    get connected(): boolean {
        return !!this._wallet?.isConnected;
    }

    get readyState(): WalletReadyState {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Installed) throw new WalletNotReadyError();

            this._connecting = true;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const wallet = window!.braveSolana!;

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

            try {
                transaction = await this.prepareTransaction(transaction, connection);

                const { signers, ...sendOptions } = options;
                signers?.length && transaction.partialSign(...signers);

                const { signature } = await wallet.signAndSendTransaction(transaction, sendOptions);
                return signature;
            } catch (error: any) {
                if (error instanceof WalletError) throw error;
                throw new WalletSendTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction(transaction: Transaction): Promise<Transaction> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) || transaction;
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signAllTransactions(transactions)) || transactions;
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
