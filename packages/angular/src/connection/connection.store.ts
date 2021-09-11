import { Inject, Injectable, Optional } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { CONNECTION_CONFIG } from './connection.tokens';
import { ConnectionState } from './connection.types';

export const CONNECTION_DEFAULT_CONFIG: ConnectionConfig = { commitment: 'confirmed' };

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
    connection$ = this.state$.pipe(map((state) => state.connection));

    constructor(
        @Optional()
        @Inject(CONNECTION_CONFIG)
        private _config: ConnectionConfig
    ) {
        super({
            connection: null,
        });

        if (!this._config) {
            this._config = CONNECTION_DEFAULT_CONFIG;
        } else {
            this._config = {
                ...CONNECTION_DEFAULT_CONFIG,
                ...this._config,
            };
        }
    }

    readonly setEndpoint = this.updater((state, endpoint: string) => ({
        ...state,
        connection: new Connection(endpoint, this._config),
    }));
}
