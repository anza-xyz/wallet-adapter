import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@solana/wallet-adapter-angular";
import * as i2 from "../modal/modal-button.component";
import * as i3 from "../connect-button/connect-button.component";
import * as i4 from "@angular/material/button";
import * as i5 from "../shared/components/icon.component";
import * as i6 from "@angular/material/menu";
import * as i7 from "@angular/material/icon";
import * as i8 from "@angular/material/divider";
import * as i9 from "@angular/common";
import * as i10 from "@angular/cdk/clipboard";
import * as i11 from "../modal/modal-button.directive";
import * as i12 from "../disconnect-button/disconnect-button.directive";
import * as i13 from "@ngrx/component";
import * as i14 from "../shared/pipes/obscure-address.pipe";
export class WalletMultiButtonComponent {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
        this.children = null;
        this.color = 'primary';
        this.wallet$ = this._walletStore.wallet$;
        this.connected$ = this._walletStore.connected$;
        this.address$ = this._walletStore.publicKey$.pipe(map((publicKey) => publicKey && publicKey.toBase58()));
    }
}
WalletMultiButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletMultiButtonComponent, deps: [{ token: i1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
WalletMultiButtonComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletMultiButtonComponent, selector: "wallet-multi-button", inputs: { color: "color" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0, template: `
        <wallet-modal-button *ngIf="(wallet$ | ngrxPush) === null" [color]="color"></wallet-modal-button>
        <wallet-connect-button
            *ngIf="(connected$ | ngrxPush) === false && (wallet$ | ngrxPush)"
            [color]="color"
        ></wallet-connect-button>

        <ng-container *ngIf="connected$ | ngrxPush">
            <button mat-raised-button [color]="color" [matMenuTriggerFor]="walletMenu">
                <ng-content></ng-content>
                <div class="button-content" *ngIf="!children">
                    <wallet-icon [wallet]="wallet$ | ngrxPush"></wallet-icon>
                    {{ address$ | ngrxPush | obscureAddress }}
                </div>
            </button>
            <mat-menu #walletMenu="matMenu">
                <button *ngIf="address$ | ngrxPush as address" mat-menu-item [cdkCopyToClipboard]="address">
                    <mat-icon>content_copy</mat-icon>
                    Copy address
                </button>
                <button mat-menu-item wallet-modal-button>
                    <mat-icon>sync_alt</mat-icon>
                    Connect a different wallet
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item wallet-disconnect-button>
                    <mat-icon>logout</mat-icon>
                    Disconnect
                </button>
            </mat-menu>
        </ng-container>
    `, isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.WalletModalButtonComponent, selector: "wallet-modal-button", inputs: ["color"] }, { type: i3.WalletConnectButtonComponent, selector: "wallet-connect-button", inputs: ["color", "disabled"] }, { type: i4.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i5.WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }, { type: i6.MatMenu, selector: "mat-menu", exportAs: ["matMenu"] }, { type: i6.MatMenuItem, selector: "[mat-menu-item]", inputs: ["disabled", "disableRipple", "role"], exportAs: ["matMenuItem"] }, { type: i7.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i8.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }], directives: [{ type: i9.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i6.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", exportAs: ["matMenuTrigger"] }, { type: i10.CdkCopyToClipboard, selector: "[cdkCopyToClipboard]", inputs: ["cdkCopyToClipboard", "cdkCopyToClipboardAttempts"], outputs: ["cdkCopyToClipboardCopied"] }, { type: i11.WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: i12.WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }], pipes: { "ngrxPush": i13.PushPipe, "obscureAddress": i14.ObscureAddressPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletMultiButtonComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-multi-button',
                    template: `
        <wallet-modal-button *ngIf="(wallet$ | ngrxPush) === null" [color]="color"></wallet-modal-button>
        <wallet-connect-button
            *ngIf="(connected$ | ngrxPush) === false && (wallet$ | ngrxPush)"
            [color]="color"
        ></wallet-connect-button>

        <ng-container *ngIf="connected$ | ngrxPush">
            <button mat-raised-button [color]="color" [matMenuTriggerFor]="walletMenu">
                <ng-content></ng-content>
                <div class="button-content" *ngIf="!children">
                    <wallet-icon [wallet]="wallet$ | ngrxPush"></wallet-icon>
                    {{ address$ | ngrxPush | obscureAddress }}
                </div>
            </button>
            <mat-menu #walletMenu="matMenu">
                <button *ngIf="address$ | ngrxPush as address" mat-menu-item [cdkCopyToClipboard]="address">
                    <mat-icon>content_copy</mat-icon>
                    Copy address
                </button>
                <button mat-menu-item wallet-modal-button>
                    <mat-icon>sync_alt</mat-icon>
                    Connect a different wallet
                </button>
                <mat-divider></mat-divider>
                <button mat-menu-item wallet-disconnect-button>
                    <mat-icon>logout</mat-icon>
                    Disconnect
                </button>
            </mat-menu>
        </ng-container>
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
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: i1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktYnV0dG9uLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tdWx0aS1idXR0b24vbXVsdGktYnV0dG9uLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBYyxLQUFLLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEcsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FBaURyQyxNQUFNLE9BQU8sMEJBQTBCO0lBT25DLFlBQTZCLFlBQXlCO1FBQXpCLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBTjVCLGFBQVEsR0FBc0IsSUFBSSxDQUFDO1FBQ3BELFVBQUssR0FBZ0IsU0FBUyxDQUFDO1FBQy9CLFlBQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQztRQUNwQyxlQUFVLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7UUFDMUMsYUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXBELENBQUM7O3VIQVBqRCwwQkFBMEI7MkdBQTFCLDBCQUEwQix5TEEzQ3pCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBK0JUOzJGQVlRLDBCQUEwQjtrQkE3Q3RDLFNBQVM7bUJBQUM7b0JBQ1AsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBK0JUO29CQUNELE1BQU0sRUFBRTt3QkFDSjs7Ozs7O1NBTUM7cUJBQ0o7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2xEO2tHQUU2QixRQUFRO3NCQUFqQyxZQUFZO3VCQUFDLFVBQVU7Z0JBQ2YsS0FBSztzQkFBYixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgQ29udGVudENoaWxkLCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgV2FsbGV0U3RvcmUgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLWFuZ3VsYXInO1xuaW1wb3J0IHsgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBCdXR0b25Db2xvciB9IGZyb20gJy4uL3NoYXJlZC90eXBlcyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LW11bHRpLWJ1dHRvbicsXG4gICAgdGVtcGxhdGU6IGBcbiAgICAgICAgPHdhbGxldC1tb2RhbC1idXR0b24gKm5nSWY9XCIod2FsbGV0JCB8IG5ncnhQdXNoKSA9PT0gbnVsbFwiIFtjb2xvcl09XCJjb2xvclwiPjwvd2FsbGV0LW1vZGFsLWJ1dHRvbj5cbiAgICAgICAgPHdhbGxldC1jb25uZWN0LWJ1dHRvblxuICAgICAgICAgICAgKm5nSWY9XCIoY29ubmVjdGVkJCB8IG5ncnhQdXNoKSA9PT0gZmFsc2UgJiYgKHdhbGxldCQgfCBuZ3J4UHVzaClcIlxuICAgICAgICAgICAgW2NvbG9yXT1cImNvbG9yXCJcbiAgICAgICAgPjwvd2FsbGV0LWNvbm5lY3QtYnV0dG9uPlxuXG4gICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJjb25uZWN0ZWQkIHwgbmdyeFB1c2hcIj5cbiAgICAgICAgICAgIDxidXR0b24gbWF0LXJhaXNlZC1idXR0b24gW2NvbG9yXT1cImNvbG9yXCIgW21hdE1lbnVUcmlnZ2VyRm9yXT1cIndhbGxldE1lbnVcIj5cbiAgICAgICAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImJ1dHRvbi1jb250ZW50XCIgKm5nSWY9XCIhY2hpbGRyZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgPHdhbGxldC1pY29uIFt3YWxsZXRdPVwid2FsbGV0JCB8IG5ncnhQdXNoXCI+PC93YWxsZXQtaWNvbj5cbiAgICAgICAgICAgICAgICAgICAge3sgYWRkcmVzcyQgfCBuZ3J4UHVzaCB8IG9ic2N1cmVBZGRyZXNzIH19XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDxtYXQtbWVudSAjd2FsbGV0TWVudT1cIm1hdE1lbnVcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uICpuZ0lmPVwiYWRkcmVzcyQgfCBuZ3J4UHVzaCBhcyBhZGRyZXNzXCIgbWF0LW1lbnUtaXRlbSBbY2RrQ29weVRvQ2xpcGJvYXJkXT1cImFkZHJlc3NcIj5cbiAgICAgICAgICAgICAgICAgICAgPG1hdC1pY29uPmNvbnRlbnRfY29weTwvbWF0LWljb24+XG4gICAgICAgICAgICAgICAgICAgIENvcHkgYWRkcmVzc1xuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxidXR0b24gbWF0LW1lbnUtaXRlbSB3YWxsZXQtbW9kYWwtYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8bWF0LWljb24+c3luY19hbHQ8L21hdC1pY29uPlxuICAgICAgICAgICAgICAgICAgICBDb25uZWN0IGEgZGlmZmVyZW50IHdhbGxldFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxtYXQtZGl2aWRlcj48L21hdC1kaXZpZGVyPlxuICAgICAgICAgICAgICAgIDxidXR0b24gbWF0LW1lbnUtaXRlbSB3YWxsZXQtZGlzY29ubmVjdC1idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxtYXQtaWNvbj5sb2dvdXQ8L21hdC1pY29uPlxuICAgICAgICAgICAgICAgICAgICBEaXNjb25uZWN0XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L21hdC1tZW51PlxuICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICBgLFxuICAgIHN0eWxlczogW1xuICAgICAgICBgXG4gICAgICAgICAgICAuYnV0dG9uLWNvbnRlbnQge1xuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgICAgICAgICAgICAgZ2FwOiAwLjVyZW07XG4gICAgICAgICAgICAgICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgYCxcbiAgICBdLFxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxufSlcbmV4cG9ydCBjbGFzcyBXYWxsZXRNdWx0aUJ1dHRvbkNvbXBvbmVudCB7XG4gICAgQENvbnRlbnRDaGlsZCgnY2hpbGRyZW4nKSBjaGlsZHJlbjogRWxlbWVudFJlZiB8IG51bGwgPSBudWxsO1xuICAgIEBJbnB1dCgpIGNvbG9yOiBCdXR0b25Db2xvciA9ICdwcmltYXJ5JztcbiAgICByZWFkb25seSB3YWxsZXQkID0gdGhpcy5fd2FsbGV0U3RvcmUud2FsbGV0JDtcbiAgICByZWFkb25seSBjb25uZWN0ZWQkID0gdGhpcy5fd2FsbGV0U3RvcmUuY29ubmVjdGVkJDtcbiAgICByZWFkb25seSBhZGRyZXNzJCA9IHRoaXMuX3dhbGxldFN0b3JlLnB1YmxpY0tleSQucGlwZShtYXAoKHB1YmxpY0tleSkgPT4gcHVibGljS2V5ICYmIHB1YmxpY0tleS50b0Jhc2U1OCgpKSk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF93YWxsZXRTdG9yZTogV2FsbGV0U3RvcmUpIHt9XG59XG4iXX0=