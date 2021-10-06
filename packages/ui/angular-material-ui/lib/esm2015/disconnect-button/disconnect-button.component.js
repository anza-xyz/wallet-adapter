import { Component, ContentChild, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@solana/wallet-adapter-angular";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "./disconnect-button.directive";
import * as i5 from "@angular/common";
import * as i6 from "@ngrx/component";
export class WalletDisconnectButtonComponent {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
        this.children = null;
        this.color = 'primary';
        this.disabled = false;
        this.innerText$ = combineLatest([this._walletStore.disconnecting$, this._walletStore.wallet$]).pipe(map(([disconnecting, wallet]) => {
            if (disconnecting)
                return 'Disconnecting ...';
            if (wallet)
                return 'Disconnect';
            return 'Disconnect Wallet';
        }));
        this.wallet$ = this._walletStore.wallet$;
        this.disconnecting$ = this._walletStore.disconnecting$;
    }
}
WalletDisconnectButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletDisconnectButtonComponent, deps: [{ token: i1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
WalletDisconnectButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletDisconnectButtonComponent, selector: "wallet-disconnect-button", inputs: { color: "color", disabled: "disabled" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0, template: `
        <button
            mat-raised-button
            wallet-disconnect-button
            [color]="color"
            [disabled]="disabled || (disconnecting$ | ngrxPush) || (wallet$ | ngrxPush) === null"
        >
            <ng-content></ng-content>
            <div class="button-content" *ngIf="!children">
                <mat-icon>logout</mat-icon>
                {{ innerText$ | ngrxPush }}
            </div>
        </button>
    `, isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], directives: [{ type: i4.WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }, { type: i5.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i6.PushPipe } });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletDisconnectButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-disconnect-button',
                    template: `
        <button
            mat-raised-button
            wallet-disconnect-button
            [color]="color"
            [disabled]="disabled || (disconnecting$ | ngrxPush) || (wallet$ | ngrxPush) === null"
        >
            <ng-content></ng-content>
            <div class="button-content" *ngIf="!children">
                <mat-icon>logout</mat-icon>
                {{ innerText$ | ngrxPush }}
            </div>
        </button>
    `,
                    styles: [
                        `
            .button-content {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
        `,
                    ],
                }]
        }], ctorParameters: function () { return [{ type: i1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY29ubmVjdC1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Rpc2Nvbm5lY3QtYnV0dG9uL2Rpc2Nvbm5lY3QtYnV0dG9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBYyxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0UsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7O0FBOEJyQyxNQUFNLE9BQU8sK0JBQStCO0lBY3hDLFlBQTZCLFlBQXlCO1FBQXpCLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBYjVCLGFBQVEsR0FBc0IsSUFBSSxDQUFDO1FBQ3BELFVBQUssR0FBZ0IsU0FBUyxDQUFDO1FBQy9CLGFBQVEsR0FBRyxLQUFLLENBQUM7UUFDakIsZUFBVSxHQUFHLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQ25HLEdBQUcsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7WUFDNUIsSUFBSSxhQUFhO2dCQUFFLE9BQU8sbUJBQW1CLENBQUM7WUFDOUMsSUFBSSxNQUFNO2dCQUFFLE9BQU8sWUFBWSxDQUFDO1lBQ2hDLE9BQU8sbUJBQW1CLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQ0wsQ0FBQztRQUNPLFlBQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxtQkFBYyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDO0lBRUYsQ0FBQzs7NEhBZGpELCtCQUErQjtnSEFBL0IsK0JBQStCLG9OQXhCOUI7Ozs7Ozs7Ozs7Ozs7S0FhVDsyRkFXUSwrQkFBK0I7a0JBMUIzQyxTQUFTO21CQUFDO29CQUNQLFFBQVEsRUFBRSwwQkFBMEI7b0JBQ3BDLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7OztLQWFUO29CQUNELE1BQU0sRUFBRTt3QkFDSjs7Ozs7O1NBTUM7cUJBQ0o7aUJBQ0o7a0dBRTZCLFFBQVE7c0JBQWpDLFlBQVk7dUJBQUMsVUFBVTtnQkFDZixLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csUUFBUTtzQkFBaEIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkLCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgV2FsbGV0U3RvcmUgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLWFuZ3VsYXInO1xuaW1wb3J0IHsgY29tYmluZUxhdGVzdCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBCdXR0b25Db2xvciB9IGZyb20gJy4uL3NoYXJlZC90eXBlcyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LWRpc2Nvbm5lY3QtYnV0dG9uJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBtYXQtcmFpc2VkLWJ1dHRvblxuICAgICAgICAgICAgd2FsbGV0LWRpc2Nvbm5lY3QtYnV0dG9uXG4gICAgICAgICAgICBbY29sb3JdPVwiY29sb3JcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkIHx8IChkaXNjb25uZWN0aW5nJCB8IG5ncnhQdXNoKSB8fCAod2FsbGV0JCB8IG5ncnhQdXNoKSA9PT0gbnVsbFwiXG4gICAgICAgID5cbiAgICAgICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJidXR0b24tY29udGVudFwiICpuZ0lmPVwiIWNoaWxkcmVuXCI+XG4gICAgICAgICAgICAgICAgPG1hdC1pY29uPmxvZ291dDwvbWF0LWljb24+XG4gICAgICAgICAgICAgICAge3sgaW5uZXJUZXh0JCB8IG5ncnhQdXNoIH19XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgYCxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYFxuICAgICAgICAgICAgLmJ1dHRvbi1jb250ZW50IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgICAgIGdhcDogMC41cmVtO1xuICAgICAgICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsXG4gICAgXSxcbn0pXG5leHBvcnQgY2xhc3MgV2FsbGV0RGlzY29ubmVjdEJ1dHRvbkNvbXBvbmVudCB7XG4gICAgQENvbnRlbnRDaGlsZCgnY2hpbGRyZW4nKSBjaGlsZHJlbjogRWxlbWVudFJlZiB8IG51bGwgPSBudWxsO1xuICAgIEBJbnB1dCgpIGNvbG9yOiBCdXR0b25Db2xvciA9ICdwcmltYXJ5JztcbiAgICBASW5wdXQoKSBkaXNhYmxlZCA9IGZhbHNlO1xuICAgIHJlYWRvbmx5IGlubmVyVGV4dCQgPSBjb21iaW5lTGF0ZXN0KFt0aGlzLl93YWxsZXRTdG9yZS5kaXNjb25uZWN0aW5nJCwgdGhpcy5fd2FsbGV0U3RvcmUud2FsbGV0JF0pLnBpcGUoXG4gICAgICAgIG1hcCgoW2Rpc2Nvbm5lY3RpbmcsIHdhbGxldF0pID0+IHtcbiAgICAgICAgICAgIGlmIChkaXNjb25uZWN0aW5nKSByZXR1cm4gJ0Rpc2Nvbm5lY3RpbmcgLi4uJztcbiAgICAgICAgICAgIGlmICh3YWxsZXQpIHJldHVybiAnRGlzY29ubmVjdCc7XG4gICAgICAgICAgICByZXR1cm4gJ0Rpc2Nvbm5lY3QgV2FsbGV0JztcbiAgICAgICAgfSlcbiAgICApO1xuICAgIHJlYWRvbmx5IHdhbGxldCQgPSB0aGlzLl93YWxsZXRTdG9yZS53YWxsZXQkO1xuICAgIHJlYWRvbmx5IGRpc2Nvbm5lY3RpbmckID0gdGhpcy5fd2FsbGV0U3RvcmUuZGlzY29ubmVjdGluZyQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF93YWxsZXRTdG9yZTogV2FsbGV0U3RvcmUpIHt9XG59XG4iXX0=