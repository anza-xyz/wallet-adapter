import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
export class WalletExpandComponent {
    constructor() {
        this.expanded = null;
    }
}
WalletExpandComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletExpandComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletExpandComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletExpandComponent, selector: "wallet-expand", inputs: { expanded: "expanded" }, ngImport: i0, template: `
        <p>{{ expanded ? 'Less' : 'More' }} options</p>
        <mat-icon> {{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
    `, isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: i1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletExpandComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-expand',
                    template: `
        <p>{{ expanded ? 'Less' : 'More' }} options</p>
        <mat-icon> {{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
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
        }], propDecorators: { expanded: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwYW5kLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RhbC9leHBhbmQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFzQmpELE1BQU0sT0FBTyxxQkFBcUI7SUFwQmxDO1FBcUJhLGFBQVEsR0FBbUIsSUFBSSxDQUFDO0tBQzVDOztrSEFGWSxxQkFBcUI7c0dBQXJCLHFCQUFxQix1RkFsQnBCOzs7S0FHVDsyRkFlUSxxQkFBcUI7a0JBcEJqQyxTQUFTO21CQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO29CQUN6QixRQUFRLEVBQUU7OztLQUdUO29CQUNELE1BQU0sRUFBRTt3QkFDSjs7Ozs7Ozs7OztTQVVDO3FCQUNKO2lCQUNKOzhCQUVZLFFBQVE7c0JBQWhCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LWV4cGFuZCcsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPHA+e3sgZXhwYW5kZWQgPyAnTGVzcycgOiAnTW9yZScgfX0gb3B0aW9uczwvcD5cbiAgICAgICAgPG1hdC1pY29uPiB7eyBleHBhbmRlZCA/ICdleHBhbmRfbGVzcycgOiAnZXhwYW5kX21vcmUnIH19PC9tYXQtaWNvbj5cbiAgICBgLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgXG4gICAgICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcCB7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLFxuICAgIF0sXG59KVxuZXhwb3J0IGNsYXNzIFdhbGxldEV4cGFuZENvbXBvbmVudCB7XG4gICAgQElucHV0KCkgZXhwYW5kZWQ6IGJvb2xlYW4gfCBudWxsID0gbnVsbDtcbn1cbiJdfQ==