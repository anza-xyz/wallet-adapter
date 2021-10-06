import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../shared/components/icon.component";
import * as i2 from "@angular/common";
export class WalletListItemComponent {
    constructor() {
        this.wallet = null;
    }
}
WalletListItemComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletListItemComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletListItemComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletListItemComponent, selector: "wallet-list-item", inputs: { wallet: "wallet" }, ngImport: i0, template: `
        <ng-container *ngIf="wallet">
            <p>{{ wallet.name }}</p>

            <wallet-icon [wallet]="wallet"></wallet-icon>
        </ng-container>
    `, isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: i1.WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i2.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletListItemComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-list-item',
                    template: `
        <ng-container *ngIf="wallet">
            <p>{{ wallet.name }}</p>

            <wallet-icon [wallet]="wallet"></wallet-icon>
        </ng-container>
    `,
                    styles: [
                        `
            :host {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            p {
                margin: 0;
            }
        `,
                    ],
                }]
        }], propDecorators: { wallet: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RhbC9saXN0LWl0ZW0uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7O0FBMEJqRCxNQUFNLE9BQU8sdUJBQXVCO0lBdkJwQztRQXdCYSxXQUFNLEdBQWtCLElBQUksQ0FBQztLQUN6Qzs7b0hBRlksdUJBQXVCO3dHQUF2Qix1QkFBdUIsc0ZBckJ0Qjs7Ozs7O0tBTVQ7MkZBZVEsdUJBQXVCO2tCQXZCbkMsU0FBUzttQkFBQztvQkFDUCxRQUFRLEVBQUUsa0JBQWtCO29CQUM1QixRQUFRLEVBQUU7Ozs7OztLQU1UO29CQUNELE1BQU0sRUFBRTt3QkFDSjs7Ozs7Ozs7OztTQVVDO3FCQUNKO2lCQUNKOzhCQUVZLE1BQU07c0JBQWQsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFdhbGxldCB9IGZyb20gJ0Bzb2xhbmEvd2FsbGV0LWFkYXB0ZXItd2FsbGV0cyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LWxpc3QtaXRlbScsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIndhbGxldFwiPlxuICAgICAgICAgICAgPHA+e3sgd2FsbGV0Lm5hbWUgfX08L3A+XG5cbiAgICAgICAgICAgIDx3YWxsZXQtaWNvbiBbd2FsbGV0XT1cIndhbGxldFwiPjwvd2FsbGV0LWljb24+XG4gICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgIGAsXG4gICAgc3R5bGVzOiBbXG4gICAgICAgIGBcbiAgICAgICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xuICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwIHtcbiAgICAgICAgICAgICAgICBtYXJnaW46IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsXG4gICAgXSxcbn0pXG5leHBvcnQgY2xhc3MgV2FsbGV0TGlzdEl0ZW1Db21wb25lbnQge1xuICAgIEBJbnB1dCgpIHdhbGxldDogV2FsbGV0IHwgbnVsbCA9IG51bGw7XG59XG4iXX0=