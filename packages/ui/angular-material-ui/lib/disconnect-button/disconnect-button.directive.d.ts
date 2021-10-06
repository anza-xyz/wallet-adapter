import { WalletStore } from '@solana/wallet-adapter-angular';
import * as i0 from "@angular/core";
export declare class WalletDisconnectButtonDirective {
    private readonly _walletStore;
    onClick(): void;
    constructor(_walletStore: WalletStore);
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletDisconnectButtonDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<WalletDisconnectButtonDirective, "button[wallet-disconnect-button]", never, {}, {}, never>;
}
