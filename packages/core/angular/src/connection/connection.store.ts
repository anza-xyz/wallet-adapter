import { Inject, Injectable, Optional } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { tap } from 'rxjs/operators';
import { isNotNull } from '../operators';
import { CONNECTION_CONFIG } from './connection.tokens';

export const CONNECTION_DEFAULT_CONFIG: ConnectionConfig = {
    commitment: 'confirmed',
};

interface ConnectionState {
    connection: Connection | null;
    endpoint: string | null;
}

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
    readonly connection$ = this.select(this.state$, ({ connection }) => connection);
    readonly endpoint$ = this.select(this.state$, ({ endpoint }) => endpoint);

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
            endpoint: null,
        });
    }

    readonly setEndpoint = this.updater((state, endpoint: string) => ({
        ...state,
        endpoint,
    }));

    readonly onEndpointChange = this.effect(() =>
        this.endpoint$.pipe(
            isNotNull,
            tap((endpoint) =>
                this.patchState({
                    connection: new Connection(endpoint, this._config),
                })
            )
        )
    );
}
