import { ModuleWithProviders, NgModule } from '@angular/core';
import { WalletConfig, WalletStore, walletConfigProviderFactory } from './wallet.store';
import { connectionConfigProviderFactory, ConnectionStore } from './connection.store';
import { ConnectionConfig } from '@solana/web3.js';

@NgModule({})
export class WalletAdapterModule {
    static forRoot(
        walletConfig: Partial<WalletConfig>,
        connectionConfig: ConnectionConfig = {}
    ): ModuleWithProviders<WalletAdapterModule> {
        return {
            ngModule: WalletAdapterModule,
            providers: [
                walletConfigProviderFactory(walletConfig),
                connectionConfigProviderFactory(connectionConfig),
                ConnectionStore,
                WalletStore,
            ],
        };
    }
}
