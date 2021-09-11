import { Inject, Injectable, Optional } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { SendTransactionOptions, WalletNotConnectedError, WalletNotReadyError } from '@solana/wallet-adapter-base';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { Connection, Transaction } from '@solana/web3.js';
import { asyncScheduler, combineLatest, defer, from, Observable, of, throwError } from 'rxjs';
import { catchError, concatMap, filter, first, map, observeOn, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { fromAdapterEvent, isNotNull } from '../operators';
import { WalletNotSelectedError } from './wallet.errors';
import { WALLET_CONFIG } from './wallet.tokens';
import { WalletConfig, WalletState } from './wallet.types';

export const WALLET_DEFAULT_CONFIG: WalletConfig = {
    wallets: [],
    autoConnect: false,
    localStorageKey: 'walletName',
    onError: (error: unknown) => console.error(error),
};

@Injectable()
export class WalletStore extends ComponentStore<WalletState> {
    private readonly _autoConnect = this._config?.autoConnect || false;
    private readonly _localStorageKey = this._config?.localStorageKey || 'walletName';
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
        this.publicKey$.pipe(isNotNull),
        this.adapter$.pipe(isNotNull),
        (publicKey, adapter) => {
            return publicKey && 'signTransaction' in adapter && 'signAllTransactions' in adapter
                ? {
                      publicKey,
                      signTransaction: (transaction: Transaction) => this.signTransaction(transaction)?.toPromise(),
                      signAllTransactions: (transactions: Transaction[]) =>
                          this.signAllTransactions(transactions)?.toPromise(),
                  }
                : undefined;
        }
    );

    constructor(
        @Optional()
        @Inject(WALLET_CONFIG)
        private _config: WalletConfig
    ) {
        super({
            wallets: _config.wallets,
            name: null,
            wallet: null,
            adapter: null,
            connected: false,
            connecting: false,
            disconnecting: false,
            ready: false,
            publicKey: null,
            autoApprove: false,
        });

        this._config = {
            ...WALLET_DEFAULT_CONFIG,
            ...this._config,
        };

        const walletName = localStorage.getItem(this._localStorageKey);
        const wallet = this._config.wallets.find(({ name }) => name === walletName);

        if (wallet) {
            this.selectWallet(walletName as WalletName);
        } else if (this._config.wallets.length > 0) {
            this.selectWallet(this._config.wallets[0].name);
        }
    }

    readonly autoConnect = this.effect(() => {
        return combineLatest([this.adapter$, this.ready$]).pipe(
            filter(([adapter, ready]) => this._autoConnect && !!adapter && ready),
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
                    return of(null);
                }

                if (!ready) {
                    window.open(wallet.url, '_blank');
                    this._logError(new WalletNotReadyError());
                    return of(null);
                }

                return from(defer(() => adapter.connect())).pipe(catchError(() => of(null)));
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
                    return from(defer(() => adapter.disconnect())).pipe(catchError(() => of(null)));
                }
            }),
            tap(() => this.patchState({ disconnecting: false }))
        );
    });

    readonly selectWallet = this.effect((walletName$: Observable<WalletName>) => {
        return walletName$.pipe(
            concatMap((action) => of(action).pipe(withLatestFrom(this.state$))),
            filter(([walletName, { name }]) => walletName !== name),
            concatMap(([walletName, { adapter, wallets }]) =>
                of(adapter)
                    .pipe(
                        concatMap((adapter) => {
                            if (!adapter) {
                                return of(null);
                            } else {
                                return from(defer(() => adapter.disconnect())).pipe(catchError(() => of(null)));
                            }
                        })
                    )
                    .pipe(
                        tap(() => {
                            localStorage.setItem(this._localStorageKey, walletName);
                            const wallet = wallets.find(({ name }) => name === walletName);
                            const adapter = wallet ? wallet.adapter() : null;
                            this.patchState({
                                name: walletName,
                                adapter,
                                wallet,
                                ready: adapter?.ready || false,
                            });
                        })
                    )
            )
        );
    });

    readonly onConnect = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                of(adapter).pipe(
                    fromAdapterEvent('connect'),
                    tap(() =>
                        this.patchState({
                            connected: true,
                            publicKey: adapter.publicKey,
                            autoApprove: adapter.autoApprove,
                        })
                    )
                )
            )
        );
    });

    readonly onDisconnect = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            fromAdapterEvent('disconnect'),
            tap(() =>
                this.patchState({
                    connected: false,
                    autoApprove: false,
                    publicKey: null,
                })
            )
        );
    });

    readonly onReady = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            fromAdapterEvent('ready'),
            tap(() => this.patchState({ ready: true }))
        );
    });

    readonly onError = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            fromAdapterEvent('error'),
            tap((error) => this._logError(error))
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
        const { adapter } = this.get();

        return adapter && 'signTransaction' in adapter
            ? this.connected$.pipe(
                  first(),
                  concatMap((connected) => {
                      if (!connected) {
                          return throwError(new WalletNotConnectedError());
                      }

                      return from(defer(() => adapter.signTransaction(transaction)));
                  })
              )
            : undefined;
    }

    signAllTransactions(transactions: Transaction[]): Observable<Transaction[]> | undefined {
        const { adapter } = this.get();

        return adapter && 'signAllTransactions' in adapter
            ? this.connected$.pipe(
                  first(),
                  concatMap((connected) => {
                      if (!connected) {
                          return throwError(new WalletNotConnectedError());
                      }

                      return from(defer(() => adapter.signAllTransactions(transactions)));
                  })
              )
            : undefined;
    }

    signMessage(message: Uint8Array): Observable<Uint8Array> | undefined {
        const { adapter } = this.get();

        return adapter && 'signMessage' in adapter
            ? this.connected$.pipe(
                  first(),
                  concatMap((connected) => {
                      if (!connected) {
                          return throwError(new WalletNotConnectedError());
                      }

                      return from(defer(() => adapter.signMessage(message)));
                  })
              )
            : undefined;
    }
}
