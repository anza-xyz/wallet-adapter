import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
    Adapter,
    SendTransactionOptions,
    WalletError,
    WalletName,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletReadyState,
} from '@solana/wallet-adapter-base';
import { Connection, PublicKey, Transaction, TransactionSignature } from '@solana/web3.js';
import { combineLatest, defer, EMPTY, from, fromEvent, merge, Observable, of, throwError } from 'rxjs';
import {
    catchError,
    concatMap,
    filter,
    finalize,
    first,
    map,
    pairwise,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs/operators';
import {
    fromAdapterEvent,
    isNotNull,
    LocalStorageSubject,
    signAllTransactions,
    signMessage,
    signTransaction,
    WalletNotSelectedError,
} from './internals';

/*


    THINGS TO DO:


    1: Fix publish command to work with lerna publish
    2: Improve signing logic (signTransaction, signAllTransactions, signMessage)
    3: Move anchorWallet logic to another file


*/

export interface Wallet {
    adapter: Adapter;
    readyState: WalletReadyState;
}

export interface WalletConfig {
    localStorageKey: string;
    autoConnect: boolean;
}

export const WALLET_CONFIG = new InjectionToken<WalletConfig>('walletConfig');

export const walletConfigProviderFactory = (config: Partial<WalletConfig>) => ({
    provide: WALLET_CONFIG,
    useValue: {
        autoConnect: false,
        localStorageKey: 'walletName',
        ...config,
    },
});

interface WalletState {
    adapters: Adapter[];
    wallets: Wallet[];
    wallet: Wallet | null;
    adapter: Adapter | null;
    connecting: boolean;
    disconnecting: boolean;
    unloading: boolean;
    connected: boolean;
    readyState: WalletReadyState | null;
    publicKey: PublicKey | null;
    autoConnect: boolean;
    error: WalletError | null;
}

const initialState: {
    wallet: Wallet | null;
    adapter: Adapter | null;
    connected: boolean;
    publicKey: PublicKey | null;
} = {
    wallet: null,
    adapter: null,
    connected: false,
    publicKey: null,
};

@Injectable()
export class WalletStore extends ComponentStore<WalletState> {
    private readonly _name = new LocalStorageSubject<WalletName>(this._config.localStorageKey);
    private readonly _unloading$ = this.select(({ unloading }) => unloading);
    private readonly _adapters$ = this.select(({ adapters }) => adapters);
    private readonly _adapter$ = this.select(({ adapter }) => adapter);
    private readonly _name$ = this._name.asObservable();
    private readonly _readyState$ = this.select(
        this._adapter$,
        (adapter) => adapter?.readyState || WalletReadyState.Unsupported
    );
    readonly wallets$ = this.select(({ wallets }) => wallets);
    readonly autoConnect$ = this.select(({ autoConnect }) => autoConnect);
    readonly wallet$ = this.select(({ wallet }) => wallet);
    readonly publicKey$ = this.select(({ publicKey }) => publicKey);
    readonly connecting$ = this.select(({ connecting }) => connecting);
    readonly disconnecting$ = this.select(({ disconnecting }) => disconnecting);
    readonly connected$ = this.select(({ connected }) => connected);
    readonly error$ = this.select(({ error }) => error);
    readonly anchorWallet$ = this.select(
        this.publicKey$,
        this._adapter$,
        this.connected$,
        (publicKey, adapter, connected) => {
            const adapterSignTransaction =
                adapter && 'signTransaction' in adapter
                    ? signTransaction(adapter, connected, (error) => this.handleError(error))
                    : undefined;
            const adapterSignAllTransactions =
                adapter && 'signAllTransactions' in adapter
                    ? signAllTransactions(adapter, connected, (error) => this.handleError(error))
                    : undefined;

            return publicKey && adapterSignTransaction && adapterSignAllTransactions
                ? {
                      publicKey,
                      signTransaction: (transaction: Transaction) => adapterSignTransaction(transaction).toPromise(),
                      signAllTransactions: (transactions: Transaction[]) =>
                          adapterSignAllTransactions(transactions).toPromise(),
                  }
                : undefined;
        },
        { debounce: true }
    );

    constructor(
        @Inject(WALLET_CONFIG)
        private _config: WalletConfig
    ) {
        super({
            ...initialState,
            wallets: [],
            adapters: [],
            connecting: false,
            disconnecting: false,
            unloading: false,
            autoConnect: _config.autoConnect || false,
            readyState: null,
            error: null,
        });
    }

    // Set adapters
    readonly setAdapters = this.updater((state, adapters: Adapter[]) => ({
        ...state,
        adapters,
        wallets: adapters.map((adapter) => ({
            adapter,
            readyState: adapter.readyState,
        })),
    }));

    // Set wallets
    readonly setWallets = this.updater((state, wallets: Wallet[]) => ({
        ...state,
        wallets,
    }));

    // Update ready state for newly selected adapter
    readonly onAdapterChangeDisconnectPreviousAdapter = this.effect(() =>
        this._adapter$.pipe(
            isNotNull,
            pairwise(),
            filter(([adapter]) => adapter.connected),
            concatMap(([adapter]) => from(defer(() => adapter.disconnect())))
        )
    );

    // When the selected wallet changes, initialize the state
    readonly onWalletChanged = this.effect(() =>
        combineLatest([this._name$, this.wallets$]).pipe(
            tap(([name, wallets]) => {
                const wallet = wallets.find(({ adapter }) => adapter.name === name);

                if (wallet) {
                    this.patchState({
                        wallet,
                        adapter: wallet.adapter,
                        connected: wallet.adapter.connected,
                        publicKey: wallet.adapter.publicKey,
                    });
                } else {
                    this.patchState(initialState);
                }
            })
        )
    );

    // If autoConnect is enabled, try to connect when the adapter changes and is ready
    readonly onAutoConnect = this.effect(() => {
        return combineLatest([
            this.autoConnect$,
            this._adapter$.pipe(isNotNull),
            this._readyState$,
            this.connecting$,
            this.connected$,
        ]).pipe(
            filter(
                ([autoConnect, , readyState, connecting, connected]) =>
                    autoConnect &&
                    (readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable) &&
                    !connecting &&
                    !connected
            ),
            concatMap(([, adapter]) => {
                this.patchState({ connecting: true });
                return from(defer(() => adapter.connect())).pipe(
                    catchError(() => {
                        // Clear the selected wallet
                        this.clearWallet();
                        // Don't throw error, but onError will still be called
                        return EMPTY;
                    }),
                    finalize(() => this.patchState({ connecting: false }))
                );
            })
        );
    });

    // If the window is closing or reloading, ignore disconnect and error events from the adapter
    readonly onWindowUnload = this.effect(() => {
        if (typeof window === 'undefined') {
            return of(null);
        }

        return fromEvent(window, 'beforeunload').pipe(tap(() => this.patchState({ unloading: true })));
    });

    // Handle the adapter's connect event
    readonly onConnect = this.effect(() => {
        return this._adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'connect').pipe(
                    tap(() =>
                        this.patchState({
                            connected: adapter.connected,
                            publicKey: adapter.publicKey,
                        })
                    )
                )
            )
        );
    });

    // Handle the adapter's disconnect event
    readonly onDisconnect = this.effect(() => {
        return this._adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'disconnect').pipe(
                    concatMap(() => of(null).pipe(withLatestFrom(this._unloading$))),
                    filter(([, unloading]) => !unloading),
                    tap(() => this.clearWallet())
                )
            )
        );
    });

    // Handle the adapter's error event
    readonly onError = this.effect(() => {
        return this._adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'error').pipe(
                    concatMap((error) => of(error).pipe(withLatestFrom(this._unloading$))),
                    filter(([, unloading]) => !unloading),
                    tap(([error]) => this.handleError(error))
                )
            )
        );
    });

    // Handle all adapters ready state change events
    readonly onReadyStateChanges = this.effect(() => {
        return this._adapters$.pipe(
            switchMap((adapters) =>
                merge(
                    adapters.map((adapter) =>
                        fromAdapterEvent(adapter, 'readyStateChange').pipe(
                            concatMap((readyState) => of(readyState).pipe(withLatestFrom(this.wallets$))),
                            map(([readyState, prevWallets]) => {
                                const walletIndex = prevWallets.findIndex(
                                    (wallet) => wallet.adapter.name === adapter.name
                                );
                                if (walletIndex === -1) return prevWallets;

                                return [
                                    ...prevWallets.slice(0, walletIndex),
                                    { ...prevWallets[walletIndex], readyState },
                                    ...prevWallets.slice(walletIndex + 1),
                                ];
                            }),
                            tap((wallets) => this.setWallets(wallets))
                        )
                    )
                )
            )
        );
    });

    // Handle error
    handleError(error: WalletError) {
        this.patchState({ error });
        return error;
    }

    // Select a new wallet
    selectWallet(walletName: WalletName | null) {
        this._name.next(walletName);
    }

    // Clear the selected wallet
    clearWallet() {
        this._name.next(null);
    }

    // Connect the adapter to the wallet
    connect(): Observable<unknown> {
        return combineLatest([
            this.connecting$,
            this.disconnecting$,
            this.connected$,
            this._adapter$,
            this._readyState$,
        ]).pipe(
            first(),
            filter(([connecting, disconnecting, connected]) => !connected && !connecting && !disconnecting),
            concatMap(([, , , adapter, readyState]) => {
                if (!adapter) {
                    return throwError(this.handleError(new WalletNotSelectedError()));
                }

                if (!(readyState === WalletReadyState.Installed || readyState === WalletReadyState.Loadable)) {
                    this.clearWallet();

                    if (typeof window !== 'undefined') {
                        window.open(adapter.url, '_blank');
                    }

                    return throwError(this.handleError(new WalletNotReadyError()));
                }

                this.patchState({ connecting: true });

                return from(defer(() => adapter.connect())).pipe(
                    catchError((error) => {
                        this.clearWallet();
                        return throwError(error);
                    }),
                    finalize(() => this.patchState({ connecting: false }))
                );
            })
        );
    }

    // Disconnect the adapter from the wallet
    disconnect(): Observable<unknown> {
        return combineLatest([this.disconnecting$, this._adapter$]).pipe(
            first(),
            filter(([disconnecting]) => !disconnecting),
            concatMap(([, adapter]) => {
                if (!adapter) {
                    this.clearWallet();
                    return EMPTY;
                }

                this.patchState({ disconnecting: true });
                return from(defer(() => adapter.disconnect())).pipe(
                    catchError((error) => {
                        this.clearWallet();
                        // Rethrow the error, and handleError will also be called
                        return throwError(error);
                    }),
                    finalize(() => {
                        this.patchState({ disconnecting: false });
                    })
                );
            })
        );
    }

    // Send a transaction using the provided connection
    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Observable<TransactionSignature> {
        return combineLatest([this._adapter$, this.connected$]).pipe(
            first(),
            concatMap(([adapter, connected]) => {
                if (!adapter) {
                    return throwError(this.handleError(new WalletNotSelectedError()));
                }

                if (!connected) {
                    return throwError(this.handleError(new WalletNotConnectedError()));
                }

                return from(defer(() => adapter.sendTransaction(transaction, connection, options)));
            })
        );
    }

    // Sign a transaction if the wallet supports it
    signTransaction(transaction: Transaction): Observable<Transaction> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signTransaction' in adapter
            ? signTransaction(adapter, connected, (error) => this.handleError(error))(transaction)
            : undefined;
    }

    // Sign multiple transactions if the wallet supports it
    signAllTransactions(transactions: Transaction[]): Observable<Transaction[]> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signAllTransactions' in adapter
            ? signAllTransactions(adapter, connected, (error) => this.handleError(error))(transactions)
            : undefined;
    }

    // Sign an arbitrary message if the wallet supports it
    signMessage(message: Uint8Array): Observable<Uint8Array> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signMessage' in adapter
            ? signMessage(adapter, connected, (error) => this.handleError(error))(message)
            : undefined;
    }
}
