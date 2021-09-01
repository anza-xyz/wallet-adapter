import { Inject, Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Connection, ConnectionConfig } from '@solana/web3.js';
import { map } from 'rxjs/operators';

import { CONNECTION_CONFIG } from './connection.tokens';
import { ConnectionState } from './connection.types';

@Injectable()
export class ConnectionStore extends ComponentStore<ConnectionState> {
    connection$ = this.state$.pipe(map((state) => state.connection));

    constructor(
        @Inject(CONNECTION_CONFIG)
        private _config: ConnectionConfig
    ) {
        super({
            connection: null,
        });
    }

    readonly setEndpoint = this.updater((state, endpoint: string) => ({
        ...state,
        connection: new Connection(endpoint, this._config),
    }));
}
