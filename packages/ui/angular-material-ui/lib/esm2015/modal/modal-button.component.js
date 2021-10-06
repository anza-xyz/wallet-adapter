import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "./modal-button.directive";
import * as i3 from "@angular/common";
export class WalletModalButtonComponent {
    constructor() {
        this.children = null;
        this.color = 'primary';
    }
}
WalletModalButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletModalButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalButtonComponent, selector: "wallet-modal-button", inputs: { color: "color" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0, template: `
        <button mat-raised-button [color]="color" wallet-modal-button>
            <ng-content></ng-content>
            <ng-container *ngIf="!children">Select Wallet</ng-container>
        </button>
    `, isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i1.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], directives: [{ type: i2.WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: i3.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-modal-button',
                    template: `
        <button mat-raised-button [color]="color" wallet-modal-button>
            <ng-content></ng-content>
            <ng-container *ngIf="!children">Select Wallet</ng-container>
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
        }], propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwtYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RhbC9tb2RhbC1idXR0b24uY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFjLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUEyQnBHLE1BQU0sT0FBTywwQkFBMEI7SUF2QnZDO1FBd0I4QixhQUFRLEdBQXNCLElBQUksQ0FBQztRQUNwRCxVQUFLLEdBQWdCLFNBQVMsQ0FBQztLQUMzQzs7dUhBSFksMEJBQTBCOzJHQUExQiwwQkFBMEIseUxBckJ6Qjs7Ozs7S0FLVDsyRkFnQlEsMEJBQTBCO2tCQXZCdEMsU0FBUzttQkFBQztvQkFDUCxRQUFRLEVBQUUscUJBQXFCO29CQUMvQixRQUFRLEVBQUU7Ozs7O0tBS1Q7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKOzs7Ozs7Ozs7O1NBVUM7cUJBQ0o7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2xEOzhCQUU2QixRQUFRO3NCQUFqQyxZQUFZO3VCQUFDLFVBQVU7Z0JBQ2YsS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCdXR0b25Db2xvciB9IGZyb20gJy4uL3NoYXJlZC90eXBlcyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LW1vZGFsLWJ1dHRvbicsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPGJ1dHRvbiBtYXQtcmFpc2VkLWJ1dHRvbiBbY29sb3JdPVwiY29sb3JcIiB3YWxsZXQtbW9kYWwtYnV0dG9uPlxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIiFjaGlsZHJlblwiPlNlbGVjdCBXYWxsZXQ8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPC9idXR0b24+XG4gICAgYCxcbiAgICBzdHlsZXM6IFtcbiAgICAgICAgYFxuICAgICAgICAgICAgYnV0dG9uIHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC5idXR0b24tY29udGVudCB7XG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmxleDtcbiAgICAgICAgICAgICAgICBnYXA6IDAuNXJlbTtcbiAgICAgICAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLFxuICAgIF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIFdhbGxldE1vZGFsQnV0dG9uQ29tcG9uZW50IHtcbiAgICBAQ29udGVudENoaWxkKCdjaGlsZHJlbicpIGNoaWxkcmVuOiBFbGVtZW50UmVmIHwgbnVsbCA9IG51bGw7XG4gICAgQElucHV0KCkgY29sb3I6IEJ1dHRvbkNvbG9yID0gJ3ByaW1hcnknO1xufVxuIl19