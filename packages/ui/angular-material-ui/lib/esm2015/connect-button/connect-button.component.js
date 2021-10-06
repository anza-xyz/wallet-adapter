import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@solana/wallet-adapter-angular";
import * as i2 from "@angular/material/button";
import * as i3 from "../shared/components/icon.component";
import * as i4 from "@ngrx/component";
import * as i5 from "./connect-button.directive";
import * as i6 from "@angular/common";
export class WalletConnectButtonComponent {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
        this.children = null;
        this.color = 'primary';
        this.disabled = false;
        this.wallet$ = this._walletStore.wallet$;
        this.connecting$ = this._walletStore.connecting$;
        this.connected$ = this._walletStore.connected$;
        this.innerText$ = combineLatest([this.connecting$, this.connected$, this.wallet$]).pipe(map(([connecting, connected, wallet]) => {
            if (connecting)
                return 'Connecting...';
            if (connected)
                return 'Connected';
            if (wallet)
                return 'Connect';
            return 'Connect Wallet';
        }));
    }
}
WalletConnectButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonComponent, deps: [{ token: i1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
WalletConnectButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletConnectButtonComponent, selector: "wallet-connect-button", inputs: { color: "color", disabled: "disabled" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0, template: `
        <button
            *ngrxLet="wallet$; let wallet"
            mat-raised-button
            wallet-connect-button
            [color]="color"
            [disabled]="disabled || (connecting$ | ngrxPush) || !wallet || (connected$ | ngrxPush)"
        >
            <ng-content></ng-content>
            <div class="button-content" *ngIf="!children">
                <wallet-icon *ngIf="wallet" [wallet]="wallet"></wallet-icon>
                {{ innerText$ | ngrxPush }}
            </div>
        </button>
    `, isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i3.WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i4.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: i5.WalletConnectButtonDirective, selector: "button[wallet-connect-button]" }, { type: i6.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4.PushPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-connect-button',
                    template: `
        <button
            *ngrxLet="wallet$; let wallet"
            mat-raised-button
            wallet-connect-button
            [color]="color"
            [disabled]="disabled || (connecting$ | ngrxPush) || !wallet || (connected$ | ngrxPush)"
        >
            <ng-content></ng-content>
            <div class="button-content" *ngIf="!children">
                <wallet-icon *ngIf="wallet" [wallet]="wallet"></wallet-icon>
                {{ innerText$ | ngrxPush }}
            </div>
        </button>
    `,
                    styles: [
                        `
            button {
                display: inline-block;
            }

            .button-content {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
        `,
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: i1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29ubmVjdC1idXR0b24uY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2Nvbm5lY3QtYnV0dG9uL2Nvbm5lY3QtYnV0dG9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBYyxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7O0FBb0NyQyxNQUFNLE9BQU8sNEJBQTRCO0lBZ0JyQyxZQUE2QixZQUF5QjtRQUF6QixpQkFBWSxHQUFaLFlBQVksQ0FBYTtRQWY1QixhQUFRLEdBQXNCLElBQUksQ0FBQztRQUNwRCxVQUFLLEdBQWdCLFNBQVMsQ0FBQztRQUMvQixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLFlBQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxnQkFBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDO1FBQzVDLGVBQVUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUMxQyxlQUFVLEdBQUcsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDdkYsR0FBRyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUU7WUFDcEMsSUFBSSxVQUFVO2dCQUFFLE9BQU8sZUFBZSxDQUFDO1lBQ3ZDLElBQUksU0FBUztnQkFBRSxPQUFPLFdBQVcsQ0FBQztZQUNsQyxJQUFJLE1BQU07Z0JBQUUsT0FBTyxTQUFTLENBQUM7WUFDN0IsT0FBTyxnQkFBZ0IsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FDTCxDQUFDO0lBRXVELENBQUM7O3lIQWhCakQsNEJBQTRCOzZHQUE1Qiw0QkFBNEIsaU5BOUIzQjs7Ozs7Ozs7Ozs7Ozs7S0FjVDsyRkFnQlEsNEJBQTRCO2tCQWhDeEMsU0FBUzttQkFBQztvQkFDUCxRQUFRLEVBQUUsdUJBQXVCO29CQUNqQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7O0tBY1Q7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKOzs7Ozs7Ozs7O1NBVUM7cUJBQ0o7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2xEO2tHQUU2QixRQUFRO3NCQUFqQyxZQUFZO3VCQUFDLFVBQVU7Z0JBQ2YsS0FBSztzQkFBYixLQUFLO2dCQUNHLFFBQVE7c0JBQWhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEVsZW1lbnRSZWYsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBXYWxsZXRTdG9yZSB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItYW5ndWxhcic7XG5pbXBvcnQgeyBjb21iaW5lTGF0ZXN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEJ1dHRvbkNvbG9yIH0gZnJvbSAnLi4vc2hhcmVkL3R5cGVzJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3YWxsZXQtY29ubmVjdC1idXR0b24nLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICpuZ3J4TGV0PVwid2FsbGV0JDsgbGV0IHdhbGxldFwiXG4gICAgICAgICAgICBtYXQtcmFpc2VkLWJ1dHRvblxuICAgICAgICAgICAgd2FsbGV0LWNvbm5lY3QtYnV0dG9uXG4gICAgICAgICAgICBbY29sb3JdPVwiY29sb3JcIlxuICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkIHx8IChjb25uZWN0aW5nJCB8IG5ncnhQdXNoKSB8fCAhd2FsbGV0IHx8IChjb25uZWN0ZWQkIHwgbmdyeFB1c2gpXCJcbiAgICAgICAgPlxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1jb250ZW50XCIgKm5nSWY9XCIhY2hpbGRyZW5cIj5cbiAgICAgICAgICAgICAgICA8d2FsbGV0LWljb24gKm5nSWY9XCJ3YWxsZXRcIiBbd2FsbGV0XT1cIndhbGxldFwiPjwvd2FsbGV0LWljb24+XG4gICAgICAgICAgICAgICAge3sgaW5uZXJUZXh0JCB8IG5ncnhQdXNoIH19XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgYCxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYFxuICAgICAgICAgICAgYnV0dG9uIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC5idXR0b24tY29udGVudCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBnYXA6IDAuNXJlbTtcbiAgICAgICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLFxuICAgIF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIFdhbGxldENvbm5lY3RCdXR0b25Db21wb25lbnQge1xuICAgIEBDb250ZW50Q2hpbGQoJ2NoaWxkcmVuJykgY2hpbGRyZW46IEVsZW1lbnRSZWYgfCBudWxsID0gbnVsbDtcbiAgICBASW5wdXQoKSBjb2xvcjogQnV0dG9uQ29sb3IgPSAncHJpbWFyeSc7XG4gICAgQElucHV0KCkgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICByZWFkb25seSB3YWxsZXQkID0gdGhpcy5fd2FsbGV0U3RvcmUud2FsbGV0JDtcbiAgICByZWFkb25seSBjb25uZWN0aW5nJCA9IHRoaXMuX3dhbGxldFN0b3JlLmNvbm5lY3RpbmckO1xuICAgIHJlYWRvbmx5IGNvbm5lY3RlZCQgPSB0aGlzLl93YWxsZXRTdG9yZS5jb25uZWN0ZWQkO1xuICAgIHJlYWRvbmx5IGlubmVyVGV4dCQgPSBjb21iaW5lTGF0ZXN0KFt0aGlzLmNvbm5lY3RpbmckLCB0aGlzLmNvbm5lY3RlZCQsIHRoaXMud2FsbGV0JF0pLnBpcGUoXG4gICAgICAgIG1hcCgoW2Nvbm5lY3RpbmcsIGNvbm5lY3RlZCwgd2FsbGV0XSkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbm5lY3RpbmcpIHJldHVybiAnQ29ubmVjdGluZy4uLic7XG4gICAgICAgICAgICBpZiAoY29ubmVjdGVkKSByZXR1cm4gJ0Nvbm5lY3RlZCc7XG4gICAgICAgICAgICBpZiAod2FsbGV0KSByZXR1cm4gJ0Nvbm5lY3QnO1xuICAgICAgICAgICAgcmV0dXJuICdDb25uZWN0IFdhbGxldCc7XG4gICAgICAgIH0pXG4gICAgKTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgX3dhbGxldFN0b3JlOiBXYWxsZXRTdG9yZSkge31cbn1cbiJdfQ==