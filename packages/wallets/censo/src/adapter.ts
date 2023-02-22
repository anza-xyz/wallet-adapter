import type { CensoWallet } from '@censo-custody/solana-wallet-adapter';
import type { SendTransactionOptions, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseSignerWalletAdapter,
    WalletConfigError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletLoadError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
    WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import type { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';

interface CensoWindow extends Window {
    censo?: CensoWallet;
}

declare const window: CensoWindow;

export interface CensoWalletAdapterConfig {}

export const CensoWalletName = 'Censo' as WalletName<'Censo'>;

export class CensoWalletAdapter extends BaseSignerWalletAdapter {
    name = CensoWalletName;
    url = 'https://wallet.censocustody.com';
    icon =
        'data:image/svg+xml;base64,PHN2ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAyMTYuNCAyMTAuMiIgdmlld0JveD0iMCAwIDIxNi40IDIxMC4yIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxnIGZpbGw9IiNlZDFjMjQiPjxwYXRoIGQ9Im0yMDAuOCAxNDcuOWMuNC0uMi41LS40LjQtLjgtLjMuMi0uNC40LS40Ljh6bS0zLjYgNi40YzEuNy0xLjkgMi44LTQgMy43LTYuNC0xLjggMi0zIDMuOS0zLjcgNi40em0tMS42IDkuM2MtLjIuMy0uNC41LS41LjdzLS4xLjEtLjEuMWMtLjMuMi0uOSAxLS4xLjguMi0uMS40LS4zLjYtLjRzLjUtLjMuNS0uN2MxLjItLjcgMS43LTEuNSAyLTIuOC0xLjEuNS0xLjggMS4zLTIuNCAyLjN6bS0xNzEgOC4xYy0uMi0uMi0uMy0uNC0uNS0uNi4xLjIuMi40LjUuNnptMTIwLjUtMTUwLjJjLTEuOC0xLjctMy43LTEuMy02LTEgLjIuNi41IDEuMSAxIDEuNS0uNi0uMS0xLjMtLjEtMS45IDAgLjQuNS45LjggMS41LjlzMS0uMiAxLjUtLjRjMS4yLjEgMi4yLjEgMy4zLS4yLjIgMCAuMS0uMi4zLS4ycy4zLjIuNi4yLjktLjEgMS4zLS4yYy43LjEgMS4zLjIgMS42LS42LS41LS4xLTEgLjEtMS41IDBzLTEtLjMtMS43IDB6bS0yLjUtNS4zYy0xLjgtLjQtMy40LjEtNS4yLjYgMS45LjQgMy43LjIgNS42LS4xIDEuNS0uMiAzIDAgNC40LS40LTEuNy0uNi0zLjEtMS00LjgtLjF6bS03NS40IDU0LjdjLS4yLjMtLjQuNi0uNy45LjQtLjIuNi0uNC43LS45em02Ny00Ny40YzEgMCAyLS4xIDMtLjEtLjktLjQtMy4zLTEuNy0zIC4xem0tOC0zLjRjLjQtLjIgMS0uMiAxLjItLjJoLjJjMS4zLS4xIDIuMi0uNSAzLjEtMS40LTEuNi0uMS0zLjMtLjEtNC44IDAtLjIgMC0uMi0uMS0uNC0uMS0uMSAwLS4xIDAtLjEgMC0uMS0uMy0uNC0uNi0uOC0uNS0uMy4xLjIuMy0uMS40LS4yLjEtLjYgMC0uOC0uMS0uMiAwIC4xLS4zLjEtLjMtMS4xLS4yLTIuMS4xLTMuMi40cy0yLjIuNS0zLjMgMWMwIDAgLjEgMCAwIDAtLjIgMC0uOC4yLS45LjRzLjMtLjIuMyAwLS4xLjMtLjEuNWMtNSAuNy0xMi4yLjctMTMuOSA2LjMgNS42LTIuMSAxMS4xLTQgMTYuOS00LjkgMS40LS4yIDIuOC0uNSA0LjItLjggMS0uMyAxLjgtLjMgMi40LS43em0tNjkuNyA5MS0uNS0uNGMuOS0uNyAxLjMtMS4yLjMtMiAuOS0yLjggMS4xLTUuNSAxLjEtOC41IDAtMS0uMS0xLjkuMS0yLjkgMC0uMS4yLjIuMi4xLjYtLjcuNy0xLjQuNS0yLjMuNi0xLjYuOC0yLjkuMy00LjUgMi4xLTEuOCAzLTMuNCAxLjktNi4xIDEuNi0xLjMgMi40LTIuNiAyLjgtNC42LjctLjggMS0xLjQuNi0yLjQgMC0uMS4xIDAgLjIgMCAuMi0uMy4yLS42IDAtLjkuOC0uNi42LTEgMC0xLjYuNC0uMi45LS4zIDEuMi0uNi44LS45LjgtMS43LjctMi45LjkuMiAxLjctMS4yIDEuOC0xLjZzLjEtLjQuMS0uNGMuNS0xLjYgMS0zLjEgMS42LTQuNiAwLS4xLjMtLjEuNC0uMi42LS40LjktLjggMS0xLjYgMC0uMi4yIDAgLjMtLjEgMS40LTEuMSAyLjMtMi40IDMuMi0zLjkuMSAwIC40LjEuNiAwIC42LS40IDEuNi0xLjcgMS45LTIuMS4zLS4zLjItLjIuMy0uMy41LS41LjYtLjkuNy0xLjQuMS0uMi4zIDAgLjQgMCAuOS0uNSAxLjUtMSAxLjgtMiAuNC0uMy42LS42LjctMS4xLjUtLjEgMS4xLS4yLjgtLjguNS0uMiAxLS40IDEuNC0uNy40LS4yLjctLjQuOC0uOCAwLS4xLS4yLjEtLjIuMXMtLjEtLjEgMC0uMWMxLjYtLjUgMi45LTEuMyA0LjItMi4zaC4xYy4zLS4xLjUtLjIuOC0uNHMuNi0uNS44LS44Yy4yLjQuNy4xLjgtLjFzLS4xLS4xIDAtLjItLjUgMC0uNS0uMSAwLS4xLjEtLjEuMy4yLjQuMmMuMS0uMS4zLS4xLjQtLjEuMS0uMS4yLS4xLjMtLjEuNy0uNSAxLjMtMSAxLjYtMS44IDItLjQgMy4zLTEuMyA0LjUtMi45LTIuOC0uNC01LjEtLjEtNy42IDEtLjMgMC0uOC4yLTEgLjNzLS4xLjEtLjIuMWMtLjEuMS0uMS4xLS4yLjJzLS4xLjEtLjIuMmMwIC4xLjEtLjEuMSAwIDAgLjItLjEuMy0uMS41LS45LS4yLTEuNyAwLTIuNi0uM3MtMS42LS43LTIuMy4yYy0uMi0uMy0xLS4zLTEuMi0uMy0uMyAwLS4xIDAtLjIgMHMwIDAgMCAwYy0uMy0uNy0xLjUuNC0xLjcuNXMwIDAgMCAwYy0uOC4yLTEuNC40LTIuMi4yLjItLjYuMy0xLjMuNi0xLjguOC0xLjIgMS43LTIuMiAyLjYtMy4zLjEuMy0uMS42LjMuOCAyLjktMi42IDkuMi02LjMgMTEuNy03LjggMS42LS45IDEuNS0uOCAxLjYtLjggMy0xLjEgNi44LTEuNiA2LjctNS4zLTMuMyAxLTYuMiAxLjktOC45IDQuMi0uNS4xLTEuMS4yLTEuNi40LS4xIDAtLjMuMS0uNC4yLTEuNC45LTQuMiAyLjItNS41IDIuNy0yLjEuOC0yLjIuNy0zLjIgMi40LTQuMSAxLjgtNy40IDQuNy0xMi4xIDUuMSAxLjItMS43IDIuNy0zLjMgNC4zLTQuNi4zLS4yLjYtLjUuNy0uNnMwLS4xLjEtLjFjLjEtLjEgMC0uMiAwLS4yLjMuMi44LS4yLjctLjUgMC0uMy0uNi0uMS0uNy0uMXMtLjEgMC0uMSAwLS4xLS4xIDAtLjFjLjQgMCAuOC0uMSAxLjItLjItLjEuMS0uMi4zLS4zLjQuNC0uMS44LS40IDEtLjcuNS0uMSAxLjQtLjkgMS41LTEuMnMuMS0uMi4xLS4yYy44LS43IDEuNS0xLjIgMS43LTIuMi0xIC4xLTEuNy4zLTIuNCAxLjEtLjguMi0xLjguNy0yLjUgMS0xLjEuNS0xLjcuOS0yLjUgMS43LTEuNS43LTIuOCAxLjMtNC40LjkgMS42LS41IDIuNy0xLjMgMy43LTIuNi0uMy0uMS0uNS0uMy0uOC0uNCA1LjUtMi42IDEwLjgtNS41IDE2LTguNy0uMS0uMS0uMy0uMi0uNC0uM3MwLS4xLjEtLjFjMy0uMyA1LjUtMSA3LTMuOCAwLS4xIDAtLjEuMSAwIDEuNi45IDIuOC40IDMuNC0xLjMgMy41LS4xIDYuMi0xLjMgOS4xLTIuOS0uMyAwLS42LS4xLS45LS4xIDUuOS0xLjQgMTEuNy0zLjEgMTcuNS01LjEuMy4xLjYtLjEuNy0uMnMuMy0uMi40LS4yYzEtLjEgMS45LS4zIDIuOC0uOC0uMyAwLS43LS4xLTEtLjEuNS0uMy45LS41IDEuMy0uOC4xLjMuMy41LjQuOC45IDAgMS4zLS4zIDEuNC0xLjIgNS41LjggMTAuMy0uMyAxNS42LTEuOC01LTEuNC05LjktLjktMTUuMi0uNS0uOC4xLTMuNC0xLjMtMy4zLjMtNS4yLS40LTEwLjMtLjItMTUuNS4yLTItLjEtMy4xLjgtNC43IDItMS4zLS4zLTIuNS0uMi0zLjgtLjEtMS0uNi0xLjUtLjMtMi4yLjYtLjkuMy0xLjguNi0yLjYuOS0uMSAwLS4yLS4xLS4yIDAgLjIgMyAxIDUuMSA0LjIgNS4yLjMuMS42LjIuOS4yLjItNy43LTYuOS0zLjktMTAuOS0xLjItMi44IDAtNS4xLjUtNy41IDEuOC0uOC4xLTEuMy4zLTEuNyAxLjEtLjguMS0xLjQuMi0xLjkgMS0uMS0uMS0uNS0uMS0uNiAwLS4xIDAgMCAwLS4xIDBzMCAwLS4xIDAgMCAwLS4xIDAtLjMuMS0uNS4yYy0uMS4xLS4xLjItLjQuMnMtLjkuMy0xIC41Yy0uMi4yLS4xLjEtLjIuMnMtLjQuMy0uNS40Yy0uNi40LTEgLjctMS40IDEuMi0uNy0uMi0xLjEtLjEtMS42LjUtLjEuMS4xLjMuMS4zLTEuOC4yLTMuMS44LTQuMiAyLjMtMS4xLjMtMi4xLjctMS4xIDEuOC4xLjEuNS4xLjUuMy0uMS4yLS40LjMtLjYuMXMtLjUtLjQtLjctLjYtLjMtLjYtLjctLjVjLS40IDAtLjkuMi0xLjEuNnMtLjkgMS4xLTEuMyAxLjItLjIgMC0uMiAwYy0yLjMtLjItMy41LjktNSAyLjUtLjIgMC0uNS4yLS43LjNzLS41LjMtLjUuNGMtLjEuMSAwIC4xLS4xLjEtMS43IDEuMS0zLjcgMS41LTUuNyAyLjEtLjEtLjEtLjEtLjItLjItLjMuOC0uNCAxLjUtMS4xIDItMS43LjItLjMuNC0uMy40LS42LjEtLjMtLjIuMy0uMy4xIDAtLjItLjItLjUtLjItLjdzLjMgMCAuNS0uMWMuMS43LjguMy44IDAgMC0uMi0uNi0uMS0uNi0uMXMzLTEuOCAzLjUtMy44Yy42LS4zIDEuMS0uNyAxLjYtMS4yLS4yIDAtLjItLjEtLjUgMC0uMiAwLS4yLjEtLjMgMC0uMi0uMi0uMS0uMy4yLS4zLjIgMCAuMSAwIC4zLjFzLjQgMCAuNyAwYzEtLjEgMS40LS40IDEuNy0xLjMgMi43LTEuNSA1LjQtMyA3LjktNSAyLjUtMSA0LjctMS44IDYuNS0zLjkuMyAwIC42LS4yLjgtLjJzLS40LjMtLjEuMi41LS4zLjgtLjRjMi0uOSA0LjEtMS45IDYuMS0yLjktLjUtMi4xLTYuNCAxLjYtNy43IDIuMS0uNS4yLS42LjEtLjcuNi4yLS4yLjUtLjQuNy0uNi0uMi4yLS4zLjUtLjUuNnMtLjItLjEtLjMtLjFjLTEuMSAwLTIgLjMtMyAuNiAyLjItMS42IDQuNC0zLjEgNi42LTQuOC04LjQgMi4zLTE1IDYuMS0yMS42IDExLjgtMS45LjMtMy4zLjctNCAyLjYtMSAuMS0xLjguMy0xLjIgMS40LS4zIDAtLjcuMS0uOS4xLS4zIDAgLjEtLjEtLjEtLjJzLS40LjEtLjUuMi4xLjEuMS4xYy0xLjUuNy0yLjQgMS4zLTIuMiAzLTIuMy42LTQgMS41LTUuNSAzLjMuMSAwIC4xLjEuMi4xLTIgMS0zLjIgMS44LTMuNSA0LjItLjkuMi0xLjkgMS41LTIuMyAycy0uMS4yLS4zLjRjLS4zLjEtLjUuNS0uNy43cy0uNS41LS41LjcuMSAwIC4xLjFjLTEuMiAxLjItMiAyLjQtMi42IDQtLjIgMC0uNS4yLS42LjNzLjMtLjMuMS0uMWMtLjMuMS0uNC4zLS41LjZzLS41LjgtLjcgMS4xLS4zLjctLjUuOS0uMS4xLS4xLjFjLTIuNyAxLTIuOCAyLjktMi41IDUuNS0uMyAwLS41LjEtLjguMS0xLjEgMS45LTIuMiAzLjctMi44IDUuOS0uNC4zLS43LjgtLjkgMS4yIDAtLjEtLjEtLjMtLjEtLjQtLjYuNi0xIDEuMi0xIDIgMCAuMS0uMS4xLS4xLjEtMS4zIDEuOC0yLjIgMy4zLTIuMSA1LjYtLjEuMS0uMi4yLS4yLjNzLjEuMi4xLjNjLTEuMS4yLTEuMi45LTEuMSAxLjkuNC4yLjguNCAxLjEuNi0uNS0uNi0xLjEuMS0xLjIuNHMwIC4zIDAgLjNjLS4zLjQtLjQuNi0uNyAxLS4xLS42LS42LS43LS42LTEuNXMuOC0xLjktLjEtMi41Yy4xLS4xLjEtLjQuMy0uNXMuMi40LjMuM2MuNC0uMy40LS43LS4xLS44aC0uMWMuOS0xIDEuMy0xLjkgMS4xLTMuMy4zIDAgLjUgMCAuNy0uMnMuMS0uOC0uMS0xYy0uMS0uMiAwLS4yLjEtLjMuOC0yLjMuOS00LjUtMi4xLTQuMy0uNiAwLS42IDEtLjkgMS40LS4xLS4xLS4zLS4yLS4zLS40cy4xIDAgLjItLjNjMS4yLTIuOSAyLjItNS45IDMtOSAxLjItMi4zIDIuNC00LjUgMy4xLTYuOS0xLjkuNy0yLjcgMS43LTMuMiAzLjctMS4xLjQtMS42IDEtMi40IDEuOS0uNC41LS45IDEuNy0xLjQgMi4xLTIuNiAyLjUtNSA2LjYtNC44IDkuOS4xIDIuMi41LjQuMi44cy0uOS4yLTEuMS42LS4xLjQtLjEuN2MtLjYuNS0uNyAxLjEtLjcgMS45LS42LjctLjkgMS4yLS41IDItLjguOS0xLjEgMS42LTEgMi44LTEgLjEtMS4zIDEuOC0xLjQgMi4zczAgLjMtLjEuM2MtLjEuMSAwIC4xIDAgLjEtMi45IDMuNC00LjYgOC45LTQuNSAxMi41IDAgMS43LjEuNC4xIDEgMCAuNy4xIDAgMCAuM3MtLjEuNSAwIC43YzAgLjItLjEtLjEtLjEgMC0uNyAyLTEuMiAzLjktMSA2LjEgMCAuMS0uMi4xLS4yLjItLjMuOS0uMyAxLjgtLjEgMi43LS45IDQuNi0xIDguOS0uNCAxMy42LS40IDEuOC0uMSAzLjEuOSA0LjctLjIgMC0uMS4zLS4zLjEtLjItLjEtLjQtLjQtLjYtLjYtLjMgMy0uMyA1LjguOCA4LjcgMCAuNS4xLjkuMyAxLjRoLS4xYy0uMy40LjEgMS4yLjMgMS40czAgMCAuMi4xLjUuNC44LjFjMCAwLS4yLS4xIDAtLjEuMS4xLjQtLjEuNS0uM3MuMSAwIC4xLS4xYy4xIDMuNyAxIDcgMi4yIDEwLjUgMCAxLjEuMSAyLjEuNSAzLjEtLjEtLjgtLjYtMS43LTEuMi0yLjEtLjItLjItLjEgMC0uMi0uMS0uNi0uNi0uNi0xLjMtMS0xLjktLjIgMSAwIDEuNiAxIDEuOS0uMyA0LjUgMS42IDcuNiA0LjEgMTEuMiAwIC4xLS4yLS4xLS4xIDAgLjEuMi4zLjQuNC42bC45IDEuNWMwIC4xLjIgMCAuMiAwLS4xLjUtLjIgMS4xLjQgMS4zLjEgMCAwIC4xIDAgLjIuNiAyIDEuNSAzLjggMi43IDUuNiAwIDAtLjEuMS0uMS4xLjIuOS40IDEuNSAxLjEgMi4xLjEuOC41IDEuNyAxIDIuMi41LjYgMSAuOSAxLjYgMS4zLTEuNS41LjEgMS4zLjkgMS43LjIgMy4xIDEuOCA0LjggMy45IDYuOC41IDEgMS4xIDEuOCAyLjIgMi4zLjcuOSAxLjUgMS43IDIuMiAyLjUuMS4xLS40IDAtLjIuMS42LjIgMS4yLjQgMS44LjUtLjMuMS0uNi4zLS45LjUgMS42IDEuNyAzLjIgMy4zIDUuMSA0LjYgMSAxLjIgMiAyIDMuNiAyLjUgMCAuMS0uMS4yLS4xLjNzLjIuMS4yLjItLjItLjMtLjItLjEuNC40LjYuNWMuMiAwLS4yLS4yLS4xLS4yLjYuNSAxLjIuOSAxLjggMS40LS4yLjMtLjQuNC0uNC43LjEuNC40LjUuOC40LjcgMi4zIDIgMy4xIDQuMiAzLjUuMi4yLS4yLjQuMS42cy44IDAgMS4xLS4zYy44IDIgMi4xIDMgNC4xIDMuOSAxLjYgMS40IDMuNCAyLjQgNS40IDMuMi0uMS4xLS4xLjItLjIuMiAxLjkgMS43IDMuNCAzLjEgNiAyLjcuMSAwIC4yLS4xLjMgMCAuNy42IDIgMS41IDIuNSAyLjFzMCAuMy4zLjRjLjYgMS4yIDEuNSAxLjggMi40LjUgMS4yIDEuNSAyLjUgMi4yIDQuNCAyLjcuMSAwIC4zIDAgLjQuMS45LjYgMS42LjggMi4zIDAgMi40IDIuNyA0LjUgMi44IDguMSAzLjYgMS4xLjMgMy42IDEuNSA1LjEgMS42IDEuNi43IDIuNyAxIDQuNC41LTEuMi0uNi0yLjMtMS4xLTMuNi0xLjEtLjEtLjItLjEtLjQtLjItLjYtLjEtLjEtLjMtLjEtLjQtLjIuOCAwIDEuNiAwIDIuNC4xIDEuMi44IDIuMyAxIDMuNy41IDEuMy41IDIuNi43IDQgLjYuMiAwIDAtLjMuMi0uM3MuMy4xLjYuMWMuNSAxLjIgMy41IDEgNC4yIDFzLjEtLjEuNC0uMS40LS4xLjctLjFjLjIgMCAwIC4xIDAgLjEuNi4xIDEgLjIgMS4zLS41IDAgMCAwLS4xLjEgMCAxLjkgMSAzLjIuMyA1LjEtLjUgMi43IDIuMyA5IDEuMSAxMS40LjkgNC40LS4zIDUuMS0uMiA4LjUtMiAuNC4yIDEgLjIgMS41LjItLjQuMy0uOC42LTEuMi45IDQtLjQgNy4yLTEgMTEuMy0xLjkgMy41LS44IDcuNy0xLjYgMTAuNi00LjMuMiAwIC4zLjIuNC4yczAtLjIuMS0uMmMuNS0uMS45IDAgMS4zLjEgMi4xLS41IDMuOS0uOSA0LjQtMy4zLjIuMy40LjcuNCAxLjEgMS41LS4zIDIuNy0uNiAzLjUtMiAuMiAwIC41LS4xLjctLjIgMy44LTIgNy4yLTQuNCAxMC41LTcuMi4xLjEuMy4zLjUuNCA1LTEuOCA4LjQtNC41IDExLjQtOC45IDEuMy0xLjEgMi42LTIuMiAzLjYtMy41IDAgMCAwIC4xLjEgMCAxLjYtMi4xIDMuMi00LjIgNC44LTYuMi41LS41LjktMSAxLjItMS43aC0uMWMuMi0uNC40LS45LjUtMS4zcy4yIDAgLjQtLjFjLjUtLjQuNi0uOS44LTEuNS0xLjEtLjUtMS43IDAtMS43IDEuMi0uNC4xLS44LjItMS4xLjQgMCAwIDAgLjEtLjEuMSAwIDAgLjIgMCAwIDBzLS41LjMtLjYuNS0uMS4xLS4yLjJjLS4yLjEtLjMuMy0uNS41LTEuNSAxLjQtMi44IDIuMS00LjggMS43LTIuNC0xLjItNCAxLjEtNS42IDIuNy0uMy4zLS45LjctMS4yIDEuMXMtMSAuOS0xLjQgMS4zYzAgMCAuMS0uMSAwIDBzLS40LjItLjUuMy4xIDAgLjEuMWMtLjUuNC0uOS45LTEuNSAxLjEtMSAuNC0yIC41LTIuOS44LjUtLjUuOC0xIDEtMS43LjktLjcgMS42LTEuNCAyLjEtMi4zLS4yLS4zLS4zLS42LS41LS45IDEtLjIgMi40LS4yIDItMS42IDMuNS0xLjkgNi00LjEgOC03LjV2LjVjMS0uOCAxLjYtMS41IDEuNi0yLjggMS42LS42IDIuNS0xLjMgMy4yLTIuOSAxLjEtMSAxLjctMS44IDEuNi0zLjMuMi0uMS40LS4xLjYtLjMuMi0uMS4yLS40LjMtLjZzLjEgMCAuMiAwLS4xIDAgLjEtLjEuNS0uNC41LS42Yy4xLS4yLS4xIDAtLjEgMCAxLjEtMS4yIDItMi4yIDEuNy0zLjkgMy41LTIuOCA0LjYtNi4zIDYtMTAuNC00LjIgMS43LTUuMiA2LjYtNy4xIDEwLjMtLjcgMS4zLTEuOSAyLjQtMi4yIDMuOS0uNy4yLTEuMS41LTEuNSAxLjEtLjEuMS0uMy4xLS40LjEgMS4xLTEuNSAyLTIuOCAxLjktNC44LjEgMCAuMi4xLjMuMSAxLjItMS41IDIuMS0zLjEgMi45LTQuOC40LS44LjgtMS4zLjctMi4zLjEuMS4yLjEuMy4yIDEuMS0yIDIuNC0zLjkgMi45LTYuMi41LS4zIDEtLjYgMS41LS43LjEtLjUgMC0uOS0uMi0xLjMuOS0xIDEuMi0xLjkuOS0zLjItLjUuNS0xIC45LTEuNiAxLjIgMS42LTIuMyAyLjMtNC41IDIuNS03LjMuNS0yIC43LTMuOC41LTUuOS4xIDAgLjMuMS40LjEuNS0yIC43LTMuOCAwLTUuOC0xLjQgMS40LTEuOSAyLjYtMS43IDQuNi0xLjQuMy0yLjQgMS0zLjUgMS45di0uMWwxLjEtNi44Yy4xLS42LjEtMS4yIDAtMS44LTIuMi45LTIuNSAyLjktMy41IDQuOC00LjQgMS4yLTQuNiA1LTUuNiA4LjktMS4xLjYtMi4zIDMtMi41IDMuOHMtLjEuNi0uMi43Yy0xLjUgMi4yLTMgMi41LTUuNSAyLjYtLjcuNS0xLjIgMS0xLjUgMS44LS4xLjEtLjEtLjEtLjItLjEtLjUuMi0uOC42LTEuMSAxLTIuNy0uOS00LjQuNy02LjQgMi40IDAtLjIuMS0uNC4xLS42LTIgMS41LTMuNSAyLjgtMy44IDUuNC0xIC44LTIuNiAxLjUtMy4zLjMtLjMtLjUuMS0uNC0uMS0uNCAxLjMtMS43IDIuOS0zLjUgMS01LjMtMS40IDEuMi0yLjUgMi4yLTIuOCA0LS4yLS4xLS41LS4yLS44LS4yLTEtLjEtMS4yLS40LTEuMi0xLjQtLjMuMS0uNi40LS44LjQtLjMgMCAwLS4zLS4xLS40IDEuNi0uOCAyLjQtMS44IDMtMy40LS4yLS4xLS41LS4zLS43LS40LjktLjcgMS42LTEuNCAyLjItMi40IDAgLjEuMS4yLjEuMy44LTEuNSAxLjUtMi43LjgtNC40LjMtLjEuNS0uMy44LS40LjItNC4yLTMtLjctNC40LjkgMCAwIC4xIDAgMCAuMS0uMi4xLS4zLjEtLjUuMy45LTEuNS43LTMuNi0uOC0yLjMtLjkuOC0uMy41LS42LjdzMCAuMS0uMS4yIDAgMCAwIC4xYy0uNC41LS43LjktMS4xIDEuNC0uMS4xLS4xLjMtLjIuNHMtLjIuNS0uMy43Yy0uNy43LTEuMiAxLjUtMS42IDIuNSAwIC4xLjIgMCAuMi4xcy0uMy4zLS4zLjNjLS4xIDAgLjMtLjMuMS0uM3MtLjcuNC0uNy43LjEtLjEuMiAwYzAgLjEtLjEuMS0uMi4yczAgMCAwIDBjLS40LS4xLS43LjUtLjguN3YuMnMwIDAgMCAwIDAgMC0uMSAwYzAgMCAuMi0uMSAwIDBzLS41LjMtLjcuNmMtLjIuMi0uNy43LS45LjlzLS4xLjEtLjIuMi0uMS40LS4yLjVjLS4xLjItLjMuMi0uNC4xcy4yLS4zLS4xLS4zLS42LjMtLjcuNS4yLjEuMS4xYy0xLjUuOC0yLjYgMS44LTMuMyAzLjUtLjEtLjEtLjItLjItLjMtLjItMS44IDEuMS0zLjUgMi4zLTUgMy44LS4xLjItLjQgMC0uNS4xLTEuMSAxIC4yLjggMSAuNy01LjYgMi4yLTExLjUgNC42LTE3IDYuNy0xIC40LS43LjMtMS41LjctMS43LS40LTIuOC4yLTQuMSAxLjEtLjMtLjMtLjctLjUtMS0uOC01LjItLjEtMTAuNC0uNC0xNS42LS4yLTQuNS0uNS04LjYtLjctMTIuOC0yLjYtMi45LTEuMy01LjQtMi43LTguNC0uN2gtLjJjLjEtLjEtMS4yLjYtMS4zLjZzLS40IDAtLjEtLjFjLjItLjIgMS4zLS40IDEuNC0uNXMuNy0uOS4xLS45Yy40LS41LjYtLjkuOC0xLjRoLS4xYy0xLjgtMS4xLTMuNi0yLTUuNS0zLS4zLS44LTItMS43LTIuNS0xLjlzLS40LS4xLS41LS4xYy0xLjItLjgtMi4xLTEuMS0zLjQtLjcuNC0uOC40LTEuMi0uNC0xLjcuMi0uMS4zLS4zLjUtLjQtMS4zLTEuOC0yLjYtMy4xLTQuNi00LjEuNS0yLjEtLjctMy4yLTIuMS00LjctLjEtLjEtLjMtLjQtLjQtLjUtLjIgMCAwLS4xLS4yLS4xcy0uMS4zLS40LjFjMS4yLS41LS43LTIuOS0uOS0zLjMtLjItLjMtLjEgMC0uMi0uMnMuNC41LjIuMi0uMS0uOC0uMy0xYy0uMi0uMS0uMSAwLS4xIDAgMC0uNS0uMi0xLS40LTEuNS0uNC0xLS44LTItMS4yLTMgLjEgMCAuMS4xLjIuMi0uMS0xLjctLjUtMi44LTIuMS0zLjUuMS0uNS4xLS45LjItMS40LjIuMS41LjIuNy4zIDAtLjctLjItMS40LS42LTIgMC0uMS0uMS4zLS40IDAgMS41LS45LTEuOC02LjEtMi44LTYuOG00MS4yLTEwMi43YzAgLjEgMCAuMSAwIDAgMCAuMS0uMSAwLS4xIDB6bS0yMi4yIDExLjdjMCAuMSAwIC4xIDAgMHptLTczLjYgMTAyLjFjMCAuMS4yLS4xLjItLjJzLjEgMCAuMSAwYy0uMS4xLS4zLjItLjMuMnptLjUtLjFzLjEuMSAwIDB6bTEyLjktNjQuMWMtLjEgMC0uMSAwIDAgMHptMjEuMS0yMC43czAgLjEgMCAwYzAgLjEgMCAuMSAwIDB6bTM4LjggMTEzYy4xIDAgLjEgMCAwIDB6bTEyNC43LTUuN2MtLjEgMC0uMSAwIDAgMC0uMSAwIDAgMCAwIDB6bTEyLjktMjIuNWMtMS4xIDItMS42IDQuMi0yLjIgNi41IDIuMi0xLjggMi41LTMuOCAyLjItNi41em0tNS42IDEuNmMtLjkgMS42LTEuNSAzLjEtMS45IDQuOSAyLjEtLjIgMS45LTMuNCAxLjktNC45em0tMTM5LjUtNTMuNWMtLjIuMy0uMy41LS41LjguMy0uMy41LS41LjUtLjh6bTQyLjUtNDAuOWMtMS4xLS40LTEuNi0uMS0xLjkgMSAuNy0uMyAxLjMtLjYgMS45LTF6bTEwNi4yIDkzLjZjLS44IDIuNC0xLjcgNS4xLTIuMyA3LjYtLjMgMS4yLS40IDIuNC0uOCAzLjMtLjIuNC0uMS4yLS4yLjMtLjQuMy0xIDEtLjMgMS4zczEuMS0uNy44LTEuM2MuOS0xIDEuMS0xLjkuNy0zLjIgMi4zLTIuMyAyLjItNC45IDIuMS04em0tMTE4LjQtODguN2MzLjUtMS4xIDYuOS0yLjUgMTAuMy0zLjktNC4zLS42LTcuMSAxLjMtMTAuMyAzLjl6Ii8+PHBhdGggZD0ibTE5Ni44IDExOS4ycy43LTYgLjUtMTEuMmMwLS4zIDAtLjQgMC0uNyAwLS4yIDAgLjEuMSAwIC41LTEuNi41LTMuMi41LTQuOSAxLjEuMyAxLjYgMS4zIDEuNyAyLjMuMiAxIC42IDItLjQgMi41LS45LTIuNy42IDEuOS41IDIuNy0uMS45LS4zIDIuMi0uMiAzLjItLjEtLjItLjEtLjQtLjEtLjUtLjYgMS4zLTEuMiAyLjUtMS43IDMuOXoiLz48cGF0aCBkPSJtODMuMiA1LjljMS40LS40IDIuNy0uOCA0LjEtMS4yLjgtLjMgMS41LS41IDIuMy0uOC45LS4zIDEuOS0uNyAyLjgtMS4xIDEuMS0uNCAyLjItLjkgMy4zLTEuMyAxLjEtLjUgMi4zLTEgMy41LTEuNS0yIC4zLTMuOS43LTUuNyAxLjMtMS43LjUtMy4zIDEuMS00LjkgMS45LTEuOC43LTMuNiAxLjctNS40IDIuN3oiLz48cGF0aCBkPSJtMTU3LjUgMjEuOGMtMS43LS45LTMtMS4xLTUuMS0uMiAxLjYgMS4xIDMgMS4xIDUuMS4yeiIvPjxwYXRoIGQ9Im0xMTguMiAyNi40YzIuMS43IDMuNC4xIDUtMS0yLS41LTMuNC0uMi01IDF6Ii8+PHBhdGggZD0ibTIxMC40IDEwOC4zYy4xLS4xIDAgMCAwIDAgMCAuMS4xLjEgMCAuMi0xLjMgMS40LS43IDIuNy4yIDQuMi4xLS44IDAtMS43LjItMi40LjItLjguMy0xLjIuMi0ycy0uMS0yLjUtLjEtMy4xYy0uMS0uNiAwLS40IDAtLjQuMi0xLjItLjQtMy41LS42LTQuNC0uNS0xLjktLjcgNi45LS42IDguMi4zLS4xLjUtLjIuNy0uM3oiLz48L2c+PC9zdmc+';
    readonly supportedTransactionVersions = null;

    private _connecting: boolean;
    private _wallet: CensoWallet | null;
    private _publicKey: PublicKey | null;
    private _readyState: WalletReadyState =
        typeof window === 'undefined' || typeof document === 'undefined'
            ? WalletReadyState.Unsupported
            : WalletReadyState.Loadable;

    constructor(config: CensoWalletAdapterConfig = {}) {
        super();
        this._connecting = false;
        this._wallet = null;
        this._publicKey = null;
    }

    get publicKey() {
        return this._publicKey;
    }

    get connecting() {
        return this._connecting;
    }

    get connected() {
        return !!this._wallet?.isLoggedIn;
    }

    get readyState() {
        return this._readyState;
    }

    async connect(): Promise<void> {
        try {
            if (this.connected || this.connecting) return;
            if (this._readyState !== WalletReadyState.Loadable) throw new WalletNotReadyError();

            this._connecting = true;

            let CensoClass: typeof CensoWallet;
            try {
                CensoClass = (await import('@censo-custody/solana-wallet-adapter')).CensoWallet;
            } catch (error: any) {
                throw new WalletLoadError(error?.message, error);
            }

            let wallet: CensoWallet;
            try {
                wallet = window.censo || new CensoClass();
            } catch (error: any) {
                throw new WalletConfigError(error?.message, error);
            }

            let publicKey: PublicKey;
            try {
                publicKey = await wallet.connect(this.url);
            } catch (error: any) {
                throw new WalletConnectionError(error?.message, error);
            }

            wallet.on('disconnect', this._disconnected);

            this._wallet = wallet;
            this._publicKey = publicKey;

            this.emit('connect', this._publicKey);
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
                if (wallet.isLoggedIn) await wallet.cleanUp();
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
                return await wallet.sendTransaction(transaction, connection, options);
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
            }
        } catch (error: any) {
            this.emit('error', error);
            throw error;
        }
    }

    async signTransaction<T extends Transaction>(transaction: T): Promise<T> {
        try {
            const wallet = this._wallet;
            if (!wallet) throw new WalletNotConnectedError();

            try {
                return (await wallet.signTransaction(transaction)) as T;
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
                return (await wallet.signAllTransactions(transactions)) as T[];
            } catch (error: any) {
                throw new WalletSignTransactionError(error?.message, error);
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
