import { Inject, Injectable, Optional } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection, ConnectionConfig } from '@solana/web3.js';
import { tap } from 'rxjs/operators';

import { CONNECTION_CONFIG } from './connection.tokens';
import { ConnectionState } from './connection.types';

export const CONNECTION_DEFAULT_CONFIG: ConnectionConfig = {
    commitment: 'confirmed',
};

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
    connection$ = this.select(this.state$, ({ connection }) => connection);
    endpoint$ = this.select(this.state$, ({ endpoint }) => endpoint);

    constructor(
        @Optional()
        @Inject(CONNECTION_CONFIG)
        private _config: ConnectionConfig
    ) {
        super();

        this._config = {
            ...CONNECTION_DEFAULT_CONFIG,
            ...this._config,
        };

        this.setState({
            connection: null,
            endpoint: clusterApiUrl(WalletAdapterNetwork.Devnet),
        });
    }

    readonly setEndpoint = this.updater((state, endpoint: string) => ({
        ...state,
        endpoint,
    }));

    readonly onEndpointChange = this.effect(() =>
        this.endpoint$.pipe(
            tap((endpoint) =>
                this.patchState({
                    connection: new Connection(endpoint, this._config),
                })
            )
        )
    );
}
