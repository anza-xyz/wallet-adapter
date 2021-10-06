import { Component, Input } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "../pipes/sanitize-url.pipe";
export class WalletIconComponent {
    constructor() {
        this.wallet = null;
    }
}
WalletIconComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletIconComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletIconComponent, selector: "wallet-icon", inputs: { wallet: "wallet" }, ngImport: i0, template: `
        <ng-container *ngIf="wallet">
            <img [src]="wallet.icon | sanitizeUrl" alt="" />
        </ng-container>
    `, isInline: true, styles: ["\n            :host {\n                width: 1.5rem;\n                height: 1.5rem;\n            }\n\n            img {\n                width: inherit;\n                height: inherit;\n            }\n        "], directives: [{ type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "sanitizeUrl": i2.SanitizeUrlPipe } });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletIconComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-icon',
                    template: `
        <ng-container *ngIf="wallet">
            <img [src]="wallet.icon | sanitizeUrl" alt="" />
        </ng-container>
    `,
                    styles: [
                        `
            :host {
                width: 1.5rem;
                height: 1.5rem;
            }

            img {
                width: inherit;
                height: inherit;
            }
        `,
                    ],
                }]
        }], propDecorators: { wallet: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2hhcmVkL2NvbXBvbmVudHMvaWNvbi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7QUF3QmpELE1BQU0sT0FBTyxtQkFBbUI7SUFyQmhDO1FBc0JhLFdBQU0sR0FBa0IsSUFBSSxDQUFDO0tBQ3pDOztnSEFGWSxtQkFBbUI7b0dBQW5CLG1CQUFtQixpRkFuQmxCOzs7O0tBSVQ7MkZBZVEsbUJBQW1CO2tCQXJCL0IsU0FBUzttQkFBQztvQkFDUCxRQUFRLEVBQUUsYUFBYTtvQkFDdkIsUUFBUSxFQUFFOzs7O0tBSVQ7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKOzs7Ozs7Ozs7O1NBVUM7cUJBQ0o7aUJBQ0o7OEJBRVksTUFBTTtzQkFBZCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgV2FsbGV0IH0gZnJvbSAnQHNvbGFuYS93YWxsZXQtYWRhcHRlci13YWxsZXRzJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICd3YWxsZXQtaWNvbicsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIndhbGxldFwiPlxuICAgICAgICAgICAgPGltZyBbc3JjXT1cIndhbGxldC5pY29uIHwgc2FuaXRpemVVcmxcIiBhbHQ9XCJcIiAvPlxuICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICBgLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgXG4gICAgICAgICAgICA6aG9zdCB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEuNXJlbTtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IDEuNXJlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW1nIHtcbiAgICAgICAgICAgICAgICB3aWR0aDogaW5oZXJpdDtcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGluaGVyaXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIGAsXG4gICAgXSxcbn0pXG5leHBvcnQgY2xhc3MgV2FsbGV0SWNvbkNvbXBvbmVudCB7XG4gICAgQElucHV0KCkgd2FsbGV0OiBXYWxsZXQgfCBudWxsID0gbnVsbDtcbn1cbiJdfQ==