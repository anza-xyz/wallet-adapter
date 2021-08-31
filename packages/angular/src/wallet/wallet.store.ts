import { Inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import {
    SendTransactionOptions,
    WalletNotConnectedError,
    WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { Connection, Transaction } from "@solana/web3.js";
import {
    asyncScheduler,
    combineLatest,
    defer,
    EMPTY,
    from,
    Observable,
    of,
    throwError,
} from "rxjs";
import {
    catchError,
    concatMap,
    filter,
    first,
    map,
    observeOn,
    switchMap,
    tap,
    withLatestFrom,
} from "rxjs/operators";

import { fromAdapterEvent, isNotNull } from "../operators";
import {
    SignAllTransactionsNotFoundError,
    SignTransactionNotFoundError,
    WalletNotSelectedError,
} from "./wallet.errors";
import { WALLET_CONFIG } from "./wallet.tokens";
import { WalletConfig, WalletState } from "./wallet.types";

@Injectable()
export class WalletStore extends ComponentStore<WalletState> {
    private readonly _autoConnect = this._config?.autoConnect || false;
    private readonly _localStorageKey =
        this._config?.localStorageKey || "walletName";
    readonly wallets$ = this.select((state) => state.wallets);
    readonly selectedWallet$ = this.select((state) => state.selectedWallet);
    readonly connected$ = this.select((state) => state.connected);
    readonly connecting$ = this.select((state) => state.connecting);
    readonly disconnecting$ = this.select((state) => state.disconnecting);
    readonly wallet$ = this.select((state) => state.wallet);
    readonly adapter$ = this.select((state) => state.adapter);
    readonly publicKey$ = this.select((state) => state.publicKey);
    readonly ready$ = this.select((state) => state.ready);
    readonly anchorWallet$ = this.select(
        this.publicKey$.pipe(isNotNull),
        (publicKey) => ({
            publicKey,
            signTransaction: (transaction: Transaction) =>
                this.signTransaction(transaction).toPromise(),
            signAllTransactions: (transactions: Transaction[]) =>
                this.signAllTransactions(transactions).toPromise(),
        })
    );

    constructor(
        @Inject(WALLET_CONFIG)
        private _config: WalletConfig
    ) {
        super({
            wallets: _config.wallets,
            selectedWallet: null,
            wallet: null,
            adapter: null,
            connected: false,
            connecting: false,
            disconnecting: false,
            ready: false,
            publicKey: null,
            autoApprove: false,
        });

        const walletName = localStorage.getItem(this._localStorageKey);
        const wallet = _config.wallets.find(({ name }) => name === walletName);

        if (wallet) {
            this.selectWallet(walletName as WalletName);
        } else if (_config.wallets.length > 0) {
            this.selectWallet(_config.wallets[0].name);
        }
    }

    readonly autoConnect = this.effect(() => {
        return combineLatest([this.adapter$, this.ready$]).pipe(
            filter(
                ([adapter, ready]) => this._autoConnect && !!adapter && ready
            ),
            observeOn(asyncScheduler),
            tap(() => this.connect())
        );
    });

    readonly connect = this.effect((action$: Observable<void>) => {
        return action$.pipe(
            concatMap(() =>
                of(null).pipe(withLatestFrom(this.state$, (_, state) => state))
            ),
            filter(
                ({ connected, connecting, disconnecting }) =>
                    !connected && !connecting && !disconnecting
            ),
            tap(() => this.patchState({ connecting: true })),
            concatMap(({ adapter, wallet, ready }) => {
                if (!wallet || !adapter) {
                    this.logError(new WalletNotSelectedError());
                    return of(null);
                }

                if (!ready) {
                    window.open(wallet.url, "_blank");
                    this.logError(new WalletNotReadyError());
                    return of(null);
                }

                return from(defer(() => adapter.connect())).pipe(
                    catchError(() => of(null))
                );
            }),
            tap(() => this.patchState({ connecting: false }))
        );
    });

    readonly disconnect = this.effect((action$: Observable<void>) => {
        return action$.pipe(
            concatMap(() =>
                of(null).pipe(withLatestFrom(this.state$, (_, state) => state))
            ),
            filter(({ disconnecting }) => !disconnecting),
            tap(() => this.patchState({ disconnecting: true })),
            concatMap(({ adapter }) => {
                if (!adapter) {
                    return of(null);
                } else {
                    return from(defer(() => adapter.disconnect())).pipe(
                        catchError(() => of(null))
                    );
                }
            }),
            tap(() => this.patchState({ disconnecting: false }))
        );
    });

    readonly selectWallet = this.effect(
        (walletName$: Observable<WalletName>) => {
            return walletName$.pipe(
                concatMap((action) =>
                    of(action).pipe(withLatestFrom(this.state$))
                ),
                filter(
                    ([walletName, { selectedWallet }]) =>
                        walletName !== selectedWallet
                ),
                concatMap(([walletName, { adapter, wallets }]) =>
                    of(adapter)
                        .pipe(
                            concatMap((adapter) => {
                                if (!adapter) {
                                    return of(null);
                                } else {
                                    return from(
                                        defer(() => adapter.disconnect())
                                    ).pipe(catchError(() => of(null)));
                                }
                            })
                        )
                        .pipe(
                            tap(() => {
                                localStorage.setItem(
                                    this._localStorageKey,
                                    walletName
                                );
                                const wallet = wallets.find(
                                    ({ name }) => name === walletName
                                );
                                const adapter = wallet
                                    ? wallet.adapter()
                                    : null;
                                this.patchState({
                                    selectedWallet: walletName as WalletName,
                                    adapter,
                                    wallet,
                                    ready: adapter?.ready || false,
                                });
                            })
                        )
                )
            );
        }
    );

    readonly onConnect = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            switchMap((adapter) =>
                of(adapter).pipe(
                    fromAdapterEvent("connect"),
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
            fromAdapterEvent("disconnect"),
            tap(() =>
                this.patchState({
                    connected: false,
                    connecting: false,
                    disconnecting: false,
                    autoApprove: false,
                    publicKey: null,
                })
            )
        );
    });

    readonly onReady = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            fromAdapterEvent("ready"),
            tap(() => this.patchState({ ready: true }))
        );
    });

    readonly onError = this.effect(() => {
        return this.adapter$.pipe(
            isNotNull,
            fromAdapterEvent("error"),
            tap((error) => this.logError(error))
        );
    });

    private logError = (error: unknown) => console.error(error);

    setErrorHandler(errorHandler: (error: unknown) => void) {
        this.logError = errorHandler;
    }

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

                return from(
                    defer(() =>
                        adapter.sendTransaction(
                            transaction,
                            connection,
                            options
                        )
                    )
                ).pipe(
                    map((txId) => txId as string),
                    catchError(() => EMPTY)
                );
            })
        );
    }

    signTransaction(transaction: Transaction): Observable<Transaction> {
        return this.state$.pipe(
            first(),
            concatMap(({ adapter, connected }) => {
                if (!adapter) {
                    return throwError(new WalletNotSelectedError());
                }

                if (!connected) {
                    return throwError(new WalletNotConnectedError());
                }

                if (!("signTransaction" in adapter)) {
                    return throwError(new SignTransactionNotFoundError());
                }

                return from(
                    defer(() => adapter.signTransaction(transaction))
                ).pipe(map((transaction) => transaction as Transaction));
            })
        );
    }

    signAllTransactions(
        transactions: Transaction[]
    ): Observable<Transaction[]> {
        return this.state$.pipe(
            first(),
            concatMap(({ adapter, connected }) => {
                if (!adapter) {
                    return throwError(new WalletNotSelectedError());
                }

                if (!connected) {
                    return throwError(new WalletNotConnectedError());
                }

                if (!("signAllTransactions" in adapter)) {
                    return throwError(new SignAllTransactionsNotFoundError());
                }

                return from(
                    defer(() => adapter.signAllTransactions(transactions))
                ).pipe(map((transactions) => transactions as Transaction[]));
            })
        );
    }
}
