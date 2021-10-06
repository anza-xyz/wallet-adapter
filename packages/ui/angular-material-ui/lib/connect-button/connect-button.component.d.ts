import { ElementRef } from '@angular/core';
import { WalletStore } from '@solana/wallet-adapter-angular';
import { ButtonColor } from '../shared/types';
import * as i0 from "@angular/core";
export declare class WalletConnectButtonComponent {
    private readonly _walletStore;
    children: ElementRef | null;
    color: ButtonColor;
    disabled: boolean;
    readonly wallet$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet | null>;
    readonly connecting$: import("rxjs").Observable<boolean>;
    readonly connected$: import("rxjs").Observable<boolean>;
    readonly innerText$: import("rxjs").Observable<"Connecting..." | "Connected" | "Connect" | "Connect Wallet">;
    constructor(_walletStore: WalletStore);
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletConnectButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WalletConnectButtonComponent, "wallet-connect-button", never, { "color": "color"; "disabled": "disabled"; }, {}, ["children"], ["*"]>;
}
