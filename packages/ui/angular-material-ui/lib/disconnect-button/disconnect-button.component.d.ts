import { ElementRef } from '@angular/core';
import { WalletStore } from '@solana/wallet-adapter-angular';
import { ButtonColor } from '../shared/types';
import * as i0 from "@angular/core";
export declare class WalletDisconnectButtonComponent {
    private readonly _walletStore;
    children: ElementRef | null;
    color: ButtonColor;
    disabled: boolean;
    readonly innerText$: import("rxjs").Observable<"Disconnecting ..." | "Disconnect" | "Disconnect Wallet">;
    readonly wallet$: import("rxjs").Observable<import("@solana/wallet-adapter-wallets").Wallet | null>;
    readonly disconnecting$: import("rxjs").Observable<boolean>;
    constructor(_walletStore: WalletStore);
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletDisconnectButtonComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WalletDisconnectButtonComponent, "wallet-disconnect-button", never, { "color": "color"; "disabled": "disabled"; }, {}, ["children"], ["*"]>;
}
