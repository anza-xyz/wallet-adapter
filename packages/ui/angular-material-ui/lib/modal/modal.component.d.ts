import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { WalletStore } from '@solana/wallet-adapter-angular';
import * as i0 from "@angular/core";
export declare class WalletModalComponent {
    private readonly _walletStore;
    private readonly _matDialogRef;
    matSelectionList: MatSelectionList | null;
    private readonly _expanded;
    readonly expanded$: import("rxjs").Observable<boolean>;
    private readonly _featuredWallets;
    readonly featuredWallets$: import("rxjs").Observable<number>;
    readonly wallets$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet[]>;
    readonly featured$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet[]>;
    readonly more$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet[]>;
    constructor(_walletStore: WalletStore, _matDialogRef: MatDialogRef<WalletModalComponent>);
    onSelectionChange({ options }: MatSelectionListChange): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletModalComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WalletModalComponent, "wallet-modal", never, {}, {}, never, never>;
}
