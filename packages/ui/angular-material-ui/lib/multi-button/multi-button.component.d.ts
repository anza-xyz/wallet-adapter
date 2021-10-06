import { ElementRef } from '@angular/core';
import { WalletStore } from '@solana/wallet-adapter-angular';
import { ButtonColor } from '../shared/types';
import * as i0 from "@angular/core";
export declare class WalletMultiButtonComponent {
    private readonly _walletStore;
    children: ElementRef | null;
    color: ButtonColor;
    readonly wallet$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet | null>;
    readonly connected$: import("rxjs").Observable<boolean>;
    readonly address$: import("rxjs").Observable<string | null>;
    constructor(_walletStore: WalletStore);
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletMultiButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WalletMultiButtonComponent, "wallet-multi-button", never, { "color": "color"; }, {}, ["children"], ["*"]>;
}
