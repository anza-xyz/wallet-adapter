import { WalletStore } from '@solana/wallet-adapter-angular';
import * as i0 from "@angular/core";
export declare class WalletConnectButtonDirective {
    private readonly _walletStore;
    onClick(): void;
    constructor(_walletStore: WalletStore);
    static ɵfac: i0.ɵɵFactoryDeclaration<WalletConnectButtonDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<WalletConnectButtonDirective, "button[wallet-connect-button]", never, {}, {}, never>;
}
