import { Directive, HostListener } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@solana/wallet-adapter-angular";
export class WalletConnectButtonDirective {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
    }
    onClick() {
        this._walletStore.connect().subscribe();
    }
}
WalletConnectButtonDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonDirective, deps: [{ token: i1.WalletStore }], target: i0.ɵɵFactoryTarget.Directive });
WalletConnectButtonDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletConnectButtonDirective, selector: "button[wallet-connect-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'button[wallet-connect-button]' }]
        }], ctorParameters: function () { return [{ type: i1.WalletStore }]; }, propDecorators: { onClick: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdC1idXR0b24uZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nvbm5lY3QtYnV0dG9uL2Nvbm5lY3QtYnV0dG9uLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBSXhELE1BQU0sT0FBTyw0QkFBNEI7SUFLckMsWUFBNkIsWUFBeUI7UUFBekIsaUJBQVksR0FBWixZQUFZLENBQWE7SUFBRyxDQUFDO0lBSm5DLE9BQU87UUFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUM1QyxDQUFDOzt5SEFIUSw0QkFBNEI7NkdBQTVCLDRCQUE0QjsyRkFBNUIsNEJBQTRCO2tCQUR4QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLCtCQUErQixFQUFFO2tHQUU3QixPQUFPO3NCQUE3QixZQUFZO3VCQUFDLE9BQU8iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEhvc3RMaXN0ZW5lciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgV2FsbGV0U3RvcmUgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLWFuZ3VsYXInO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdidXR0b25bd2FsbGV0LWNvbm5lY3QtYnV0dG9uXScgfSlcbmV4cG9ydCBjbGFzcyBXYWxsZXRDb25uZWN0QnV0dG9uRGlyZWN0aXZlIHtcbiAgICBASG9zdExpc3RlbmVyKCdjbGljaycpIG9uQ2xpY2soKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX3dhbGxldFN0b3JlLmNvbm5lY3QoKS5zdWJzY3JpYmUoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF93YWxsZXRTdG9yZTogV2FsbGV0U3RvcmUpIHt9XG59XG4iXX0=