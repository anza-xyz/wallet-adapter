import { Inject, Injectable, Optional } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import {
    SendTransactionOptions,
    WalletAdapter,
    WalletNotConnectedError,
    WalletNotReadyError,
} from '@solana/wallet-adapter-base';
import { Wallet, WalletName } from '@solana/wallet-adapter-wallets';
import { Connection, Transaction } from '@solana/web3.js';
import { asyncScheduler, combineLatest, defer, from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, concatMap, filter, first, observeOn, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { fromAdapterEvent, isNotNull, messageSigner, transactionSigner, transactionsSigner } from '../operators';
import { LocalStorageService } from './local-storage';
import { WalletNotSelectedError } from './wallet.errors';
import { WALLET_CONFIG } from './wallet.tokens';
import { WalletConfig, WalletState } from './wallet.types';

export const WALLET_DEFAULT_CONFIG: WalletConfig = {
    wallets: [],
    autoConnect: false,
    localStorageKey: 'walletName',
    onError: (error: unknown) => console.error(error),
};

const initialState: {
    wallet: Wallet | null;
    adapter: ReturnType<Wallet['adapter']> | null;
} & Pick<WalletAdapter, 'ready' | 'publicKey' | 'connected' | 'autoApprove'> = {
    wallet: null,
    adapter: null,
    ready: false,
    publicKey: null,
    connected: false,
    autoApprove: false,
};

@Injectable()
export class WalletStore extends ComponentStore<WalletState> {
    private readonly _error = new Subject();
    private readonly _localStorageKey = this._config?.localStorageKey || 'walletName';
    private readonly _localStorage = new LocalStorageService<WalletName | null>(this._localStorageKey, null);
    private _logError = this._config?.onError || ((error: unknown) => console.error(error));
    readonly wallets$ = this.select((state) => state.wallets);
    readonly name$ = this.select((state) => state.name);
    readonly connected$ = this.select((state) => state.connected);
    readonly connecting$ = this.select((state) => state.connecting);
    readonly disconnecting$ = this.select((state) => state.disconnecting);
    readonly wallet$ = this.select((state) => state.wallet);
    readonly adapter$ = this.select((state) => state.adapter);
    readonly publicKey$ = this.select((state) => state.publicKey);
    readonly ready$ = this.select((state) => state.ready);
    readonly anchorWallet$ = this.select(
        this.publicKey$,
        this.adapter$,
        this.connected$,
        (publicKey, adapter, connected) => {
            const signTransaction =
                adapter && 'signTransaction' in adapter ? transactionSigner(adapter, connected) : undefined;
            const signAllTransactions =
                adapter && 'signAllTransactions' in adapter ? transactionsSigner(adapter, connected) : undefined;

            return publicKey && signTransaction && signAllTransactions
                ? {
                      publicKey,
                      signTransaction: (transaction: Transaction) => signTransaction(transaction).toPromise(),
                      signAllTransactions: (transactions: Transaction[]) =>
                          signAllTransactions(transactions).toPromise(),
                  }
                : undefined;
        },
        { debounce: true }
    );
    readonly autoConnect$ = this.select((state) => state.autoConnect);
    readonly error$ = this._error.asObservable();

    constructor(
        @Optional()
        @Inject(WALLET_CONFIG)
        private _config: WalletConfig
    ) {
        super({
            ...initialState,
            wallets: _config?.wallets || [],
            name: null,
            connecting: false,
            disconnecting: false,
            autoConnect: _config?.autoConnect || false,
        });

        this._config = {
            ...WALLET_DEFAULT_CONFIG,
            ...this._config,
        };

        const walletName = this._localStorage.value;
        if (this._config.wallets.some(({ name }) => name === walletName)) {
            this.selectWallet(walletName);
        }
    }

    readonly autoConnect = this.effect(() => {
        return combineLatest([this.autoConnect$, this.adapter$, this.ready$]).pipe(
            filter(([autoConnect, adapter, ready]) => autoConnect && adapter !== null && ready),
            observeOn(asyncScheduler),
            tap(() => this.connect())
        );
    });

    readonly connect = this.effect((action$: Observable<void>) => {
        return action$.pipe(
            concatMap(() => of(null).pipe(withLatestFrom(this.state$, (_, state) => state))),
            filter(({ connected, connecting, disconnecting }) => !connected && !connecting && !disconnecting),
            tap(() => this.patchState({ connecting: true })),
            concatMap(({ adapter, wallet, ready }) => {
                if (!wallet || !adapter) {
                    this._logError(new WalletNotSelectedError());
                    this._error.next(new WalletNotSelectedError());
                    return of(null);
                }

                if (!ready) {
                    this.selectWallet(null);

                    if (typeof window !== 'undefined') {
                        window.open(wallet.url, '_blank');
                    }

                    this._logError(new WalletNotReadyError());
                    this._error.next(new WalletNotReadyError());
                    return of(null);
                }

                return from(defer(() => adapter.connect())).pipe(
                    catchError(() => {
                        this.selectWallet(null);
                        return of(null);
                    })
                );
            }),
            tap(() => this.patchState({ connecting: false }))
        );
    });

    readonly disconnect = this.effect((action$: Observable<void>) => {
        return action$.pipe(
            concatMap(() => of(null).pipe(withLatestFrom(this.state$, (_, state) => state))),
            filter(({ disconnecting }) => !disconnecting),
            tap(() => this.patchState({ disconnecting: true })),
            concatMap(({ adapter }) => {
                if (!adapter) {
                    return of(null);
                } else {
                    return from(defer(() => adapter.disconnect())).pipe(
                        catchError(() => {
                            this.selectWallet(null);
                            return of(null);
                        })
                    );
                }
            }),
            tap(() => this.patchState({ disconnecting: false }))
        );
    });

    readonly selectWallet = this.effect((name$: Observable<WalletName | null>) => {
        return name$.pipe(
            concatMap((action) => of(action).pipe(withLatestFrom(this.state$))),
            filter(([name, wallet]) => name !== wallet.name),
            concatMap(([name, { adapter, wallets }]) =>
                of(adapter).pipe(
                    concatMap((adapter) => {
                        if (!adapter) {
                            return of(null);
                        } else {
                            return from(defer(() => adapter.disconnect())).pipe(catchError(() => of(null)));
                        }
                    }),
                    tap(() => {
                        this._localStorage.setItem(name);
                        const wallet = wallets.find((wallet) => wallet.name === name) || null;
                        const adapter = wallet ? wallet.adapter() : null;

                        if (adapter) {
                            this.patchState({
                                name,
                                adapter,
                                wallet,
                                ready: adapter.ready,
                                autoApprove: adapter.autoApprove,
                                connected: adapter.connected,
                                publicKey: adapter.publicKey,
                            });
                        } else {
                            this.patchState(initialState);
                        }
                    })
                )
            )
        );
    });

    readonly onConnect = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'connect').pipe(
                    tap(() =>
                        this.patchState({
                            connected: true,
                            publicKey: adapter.publicKey,
                            autoApprove: adapter.autoApprove,
                            ready: adapter.ready,
                        })
                    )
                )
            )
        );
    });

    readonly onDisconnect = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'disconnect').pipe(tap(() => this.patchState(initialState)))
            )
        );
    });

    readonly onReady = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) => fromAdapterEvent(adapter, 'ready').pipe(tap(() => this.patchState({ ready: true }))))
        );
    });

    readonly onError = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                fromAdapterEvent(adapter, 'error').pipe(
                    tap((error) => {
                        this._logError(error);
                        this._error.next(error);
                    })
                )
            )
        );
    });

    sendTransaction(
        transaction: Transaction,
        connection: Connection,
        options?: SendTransactionOptions
    ): Observable<string> {
        return this.state$.pipe(
            first(),
            concatMap(({ adapter, connected }) => {
                if (!adapter) {
                    return throwError(new WalletNotSelectedError());
                }

                if (!connected) {
                    return throwError(new WalletNotConnectedError());
                }

                return from(defer(() => adapter.sendTransaction(transaction, connection, options)));
            })
        );
    }

    signTransaction(transaction: Transaction): Observable<Transaction> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signTransaction' in adapter ? transactionSigner(adapter, connected)(transaction) : undefined;
    }

    signAllTransactions(transactions: Transaction[]): Observable<Transaction[]> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signAllTransactions' in adapter
            ? transactionsSigner(adapter, connected)(transactions)
            : undefined;
    }

    signMessage(message: Uint8Array): Observable<Uint8Array> | undefined {
        const { adapter, connected } = this.get();

        return adapter && 'signMessage' in adapter ? messageSigner(adapter, connected)(message) : undefined;
    }
}
