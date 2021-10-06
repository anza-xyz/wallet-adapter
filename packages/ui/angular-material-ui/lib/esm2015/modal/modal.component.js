import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatSelectionList } from '@angular/material/list';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@solana/wallet-adapter-angular";
import * as i2 from "@angular/material/dialog";
import * as i3 from "@angular/material/toolbar";
import * as i4 from "@angular/material/button";
import * as i5 from "@angular/material/icon";
import * as i6 from "@angular/material/list";
import * as i7 from "./list-item.component";
import * as i8 from "./expand.component";
import * as i9 from "@ngrx/component";
import * as i10 from "@angular/common";
export class WalletModalComponent {
    constructor(_walletStore, _matDialogRef) {
        this._walletStore = _walletStore;
        this._matDialogRef = _matDialogRef;
        this.matSelectionList = null;
        this._expanded = new BehaviorSubject(false);
        this.expanded$ = this._expanded.asObservable();
        this._featuredWallets = new BehaviorSubject(3);
        this.featuredWallets$ = this._featuredWallets.asObservable();
        this.wallets$ = this._walletStore.wallets$;
        this.featured$ = combineLatest([this._walletStore.wallets$, this.featuredWallets$]).pipe(map(([wallets, featuredWallets]) => wallets.slice(0, featuredWallets)));
        this.more$ = combineLatest([this._walletStore.wallets$, this.featuredWallets$]).pipe(map(([wallets, featuredWallets]) => wallets.slice(featuredWallets)));
    }
    onSelectionChange({ options }) {
        var _a;
        const [option] = options;
        if (option.value === null) {
            (_a = this.matSelectionList) === null || _a === void 0 ? void 0 : _a.deselectAll();
            this._expanded.next(!this._expanded.getValue());
        }
        else {
            this._walletStore.selectWallet(option.value || null);
            this._matDialogRef.close();
        }
    }
}
WalletModalComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalComponent, deps: [{ token: i1.WalletStore }, { token: i2.MatDialogRef }], target: i0.ɵɵFactoryTarget.Component });
WalletModalComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalComponent, selector: "wallet-modal", viewQueries: [{ propertyName: "matSelectionList", first: true, predicate: MatSelectionList, descendants: true }], ngImport: i0, template: `
        <mat-toolbar color="primary">
            <h2 mat-dialog-title>Select Wallet</h2>
            <button mat-icon-button mat-dialog-close aria-label="Close wallet adapter selection">
                <mat-icon>close</mat-icon>
            </button>
        </mat-toolbar>
        <ng-container *ngrxLet="more$; let moreWallets">
            <ng-container *ngrxLet="expanded$; let expanded">
                <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
                    <mat-list-option
                        *ngFor="let wallet of featured$ | ngrxPush; last as isLast"
                        [value]="wallet.name"
                        [ngClass]="{
                            'bottom-separator': moreWallets.length > 0 || !isLast
                        }"
                    >
                        <wallet-list-item [wallet]="wallet"> </wallet-list-item>
                    </mat-list-option>
                    <ng-container *ngIf="moreWallets.length > 0">
                        <ng-container *ngIf="expanded">
                            <mat-list-option
                                *ngFor="let wallet of moreWallets; last as isLast"
                                [value]="wallet.name"
                                class="bottom-separator"
                            >
                                <wallet-list-item [wallet]="wallet"> </wallet-list-item>
                            </mat-list-option>
                        </ng-container>
                        <mat-list-option [value]="null">
                            <wallet-expand [expanded]="expanded"> </wallet-expand>
                        </mat-list-option>
                    </ng-container>
                </mat-selection-list>
            </ng-container>
        </ng-container>
    `, isInline: true, styles: ["\n            :host {\n                display: block;\n                min-width: 280px;\n            }\n\n            .mat-dialog-title {\n                margin: 0;\n            }\n\n            .mat-toolbar {\n                justify-content: space-between;\n            }\n\n            .mat-list-base {\n                padding: 0 !important;\n            }\n\n            .bottom-separator {\n                border-bottom: solid 1px rgb(255 255 255 / 10%);\n            }\n        "], components: [{ type: i3.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { type: i4.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i5.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i6.MatSelectionList, selector: "mat-selection-list", inputs: ["disableRipple", "tabIndex", "color", "compareWith", "disabled", "multiple"], outputs: ["selectionChange"], exportAs: ["matSelectionList"] }, { type: i6.MatListOption, selector: "mat-list-option", inputs: ["disableRipple", "checkboxPosition", "color", "value", "selected", "disabled"], outputs: ["selectedChange"], exportAs: ["matListOption"] }, { type: i7.WalletListItemComponent, selector: "wallet-list-item", inputs: ["wallet"] }, { type: i8.WalletExpandComponent, selector: "wallet-expand", inputs: ["expanded"] }], directives: [{ type: i2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { type: i2.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["type", "mat-dialog-close", "aria-label", "matDialogClose"], exportAs: ["matDialogClose"] }, { type: i9.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: i10.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i10.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i9.PushPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'wallet-modal',
                    template: `
        <mat-toolbar color="primary">
            <h2 mat-dialog-title>Select Wallet</h2>
            <button mat-icon-button mat-dialog-close aria-label="Close wallet adapter selection">
                <mat-icon>close</mat-icon>
            </button>
        </mat-toolbar>
        <ng-container *ngrxLet="more$; let moreWallets">
            <ng-container *ngrxLet="expanded$; let expanded">
                <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
                    <mat-list-option
                        *ngFor="let wallet of featured$ | ngrxPush; last as isLast"
                        [value]="wallet.name"
                        [ngClass]="{
                            'bottom-separator': moreWallets.length > 0 || !isLast
                        }"
                    >
                        <wallet-list-item [wallet]="wallet"> </wallet-list-item>
                    </mat-list-option>
                    <ng-container *ngIf="moreWallets.length > 0">
                        <ng-container *ngIf="expanded">
                            <mat-list-option
                                *ngFor="let wallet of moreWallets; last as isLast"
                                [value]="wallet.name"
                                class="bottom-separator"
                            >
                                <wallet-list-item [wallet]="wallet"> </wallet-list-item>
                            </mat-list-option>
                        </ng-container>
                        <mat-list-option [value]="null">
                            <wallet-expand [expanded]="expanded"> </wallet-expand>
                        </mat-list-option>
                    </ng-container>
                </mat-selection-list>
            </ng-container>
        </ng-container>
    `,
                    styles: [
                        `
            :host {
                display: block;
                min-width: 280px;
            }

            .mat-dialog-title {
                margin: 0;
            }

            .mat-toolbar {
                justify-content: space-between;
            }

            .mat-list-base {
                padding: 0 !important;
            }

            .bottom-separator {
                border-bottom: solid 1px rgb(255 255 255 / 10%);
            }
        `,
                    ],
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: i1.WalletStore }, { type: i2.MatDialogRef }]; }, propDecorators: { matSelectionList: [{
                type: ViewChild,
                args: [MatSelectionList]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL21vZGFsL21vZGFsLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU5RSxPQUFPLEVBQUUsZ0JBQWdCLEVBQTBCLE1BQU0sd0JBQXdCLENBQUM7QUFFbEYsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7QUFtRXJDLE1BQU0sT0FBTyxvQkFBb0I7SUFjN0IsWUFDcUIsWUFBeUIsRUFDekIsYUFBaUQ7UUFEakQsaUJBQVksR0FBWixZQUFZLENBQWE7UUFDekIsa0JBQWEsR0FBYixhQUFhLENBQW9DO1FBZnpDLHFCQUFnQixHQUE0QixJQUFJLENBQUM7UUFDN0QsY0FBUyxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9DLGNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xDLHFCQUFnQixHQUFHLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELHFCQUFnQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUN4RCxhQUFRLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUM7UUFDdEMsY0FBUyxHQUFHLGFBQWEsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUN4RixHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FDekUsQ0FBQztRQUNPLFVBQUssR0FBRyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FDcEYsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FDdEUsQ0FBQztJQUtDLENBQUM7SUFFSixpQkFBaUIsQ0FBQyxFQUFFLE9BQU8sRUFBMEI7O1FBQ2pELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUM7UUFFekIsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksRUFBRTtZQUN2QixNQUFBLElBQUksQ0FBQyxnQkFBZ0IsMENBQUUsV0FBVyxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDbkQ7YUFBTTtZQUNILElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUM7WUFDckQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUM5QjtJQUNMLENBQUM7O2lIQTdCUSxvQkFBb0I7cUdBQXBCLG9CQUFvQixzR0FDbEIsZ0JBQWdCLGdEQWhFakI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQW9DVDsyRkEyQlEsb0JBQW9CO2tCQWpFaEMsU0FBUzttQkFBQztvQkFDUCxRQUFRLEVBQUUsY0FBYztvQkFDeEIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FvQ1Q7b0JBQ0QsTUFBTSxFQUFFO3dCQUNKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FxQkM7cUJBQ0o7b0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07aUJBQ2xEOzZIQUVnQyxnQkFBZ0I7c0JBQTVDLFNBQVM7dUJBQUMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIENvbXBvbmVudCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xuaW1wb3J0IHsgTWF0U2VsZWN0aW9uTGlzdCwgTWF0U2VsZWN0aW9uTGlzdENoYW5nZSB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2xpc3QnO1xuaW1wb3J0IHsgV2FsbGV0U3RvcmUgfSBmcm9tICdAc29sYW5hL3dhbGxldC1hZGFwdGVyLWFuZ3VsYXInO1xuaW1wb3J0IHsgQmVoYXZpb3JTdWJqZWN0LCBjb21iaW5lTGF0ZXN0IH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBtYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnd2FsbGV0LW1vZGFsJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8bWF0LXRvb2xiYXIgY29sb3I9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICA8aDIgbWF0LWRpYWxvZy10aXRsZT5TZWxlY3QgV2FsbGV0PC9oMj5cbiAgICAgICAgICAgIDxidXR0b24gbWF0LWljb24tYnV0dG9uIG1hdC1kaWFsb2ctY2xvc2UgYXJpYS1sYWJlbD1cIkNsb3NlIHdhbGxldCBhZGFwdGVyIHNlbGVjdGlvblwiPlxuICAgICAgICAgICAgICAgIDxtYXQtaWNvbj5jbG9zZTwvbWF0LWljb24+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9tYXQtdG9vbGJhcj5cbiAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdyeExldD1cIm1vcmUkOyBsZXQgbW9yZVdhbGxldHNcIj5cbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5ncnhMZXQ9XCJleHBhbmRlZCQ7IGxldCBleHBhbmRlZFwiPlxuICAgICAgICAgICAgICAgIDxtYXQtc2VsZWN0aW9uLWxpc3QgW211bHRpcGxlXT1cImZhbHNlXCIgKHNlbGVjdGlvbkNoYW5nZSk9XCJvblNlbGVjdGlvbkNoYW5nZSgkZXZlbnQpXCI+XG4gICAgICAgICAgICAgICAgICAgIDxtYXQtbGlzdC1vcHRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICpuZ0Zvcj1cImxldCB3YWxsZXQgb2YgZmVhdHVyZWQkIHwgbmdyeFB1c2g7IGxhc3QgYXMgaXNMYXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFt2YWx1ZV09XCJ3YWxsZXQubmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBbbmdDbGFzc109XCJ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2JvdHRvbS1zZXBhcmF0b3InOiBtb3JlV2FsbGV0cy5sZW5ndGggPiAwIHx8ICFpc0xhc3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8d2FsbGV0LWxpc3QtaXRlbSBbd2FsbGV0XT1cIndhbGxldFwiPiA8L3dhbGxldC1saXN0LWl0ZW0+XG4gICAgICAgICAgICAgICAgICAgIDwvbWF0LWxpc3Qtb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwibW9yZVdhbGxldHMubGVuZ3RoID4gMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImV4cGFuZGVkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1hdC1saXN0LW9wdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqbmdGb3I9XCJsZXQgd2FsbGV0IG9mIG1vcmVXYWxsZXRzOyBsYXN0IGFzIGlzTGFzdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFt2YWx1ZV09XCJ3YWxsZXQubmFtZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYm90dG9tLXNlcGFyYXRvclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8d2FsbGV0LWxpc3QtaXRlbSBbd2FsbGV0XT1cIndhbGxldFwiPiA8L3dhbGxldC1saXN0LWl0ZW0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tYXQtbGlzdC1vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtYXQtbGlzdC1vcHRpb24gW3ZhbHVlXT1cIm51bGxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8d2FsbGV0LWV4cGFuZCBbZXhwYW5kZWRdPVwiZXhwYW5kZWRcIj4gPC93YWxsZXQtZXhwYW5kPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9tYXQtbGlzdC1vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgICAgICAgICAgICAgIDwvbWF0LXNlbGVjdGlvbi1saXN0PlxuICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XG4gICAgICAgIDwvbmctY29udGFpbmVyPlxuICAgIGAsXG4gICAgc3R5bGVzOiBbXG4gICAgICAgIGBcbiAgICAgICAgICAgIDpob3N0IHtcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBibG9jaztcbiAgICAgICAgICAgICAgICBtaW4td2lkdGg6IDI4MHB4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAubWF0LWRpYWxvZy10aXRsZSB7XG4gICAgICAgICAgICAgICAgbWFyZ2luOiAwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAubWF0LXRvb2xiYXIge1xuICAgICAgICAgICAgICAgIGp1c3RpZnktY29udGVudDogc3BhY2UtYmV0d2VlbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLm1hdC1saXN0LWJhc2Uge1xuICAgICAgICAgICAgICAgIHBhZGRpbmc6IDAgIWltcG9ydGFudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLmJvdHRvbS1zZXBhcmF0b3Ige1xuICAgICAgICAgICAgICAgIGJvcmRlci1ib3R0b206IHNvbGlkIDFweCByZ2IoMjU1IDI1NSAyNTUgLyAxMCUpO1xuICAgICAgICAgICAgfVxuICAgICAgICBgLFxuICAgIF0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIFdhbGxldE1vZGFsQ29tcG9uZW50IHtcbiAgICBAVmlld0NoaWxkKE1hdFNlbGVjdGlvbkxpc3QpIG1hdFNlbGVjdGlvbkxpc3Q6IE1hdFNlbGVjdGlvbkxpc3QgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9leHBhbmRlZCA9IG5ldyBCZWhhdmlvclN1YmplY3QoZmFsc2UpO1xuICAgIHJlYWRvbmx5IGV4cGFuZGVkJCA9IHRoaXMuX2V4cGFuZGVkLmFzT2JzZXJ2YWJsZSgpO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2ZlYXR1cmVkV2FsbGV0cyA9IG5ldyBCZWhhdmlvclN1YmplY3QoMyk7XG4gICAgcmVhZG9ubHkgZmVhdHVyZWRXYWxsZXRzJCA9IHRoaXMuX2ZlYXR1cmVkV2FsbGV0cy5hc09ic2VydmFibGUoKTtcbiAgICByZWFkb25seSB3YWxsZXRzJCA9IHRoaXMuX3dhbGxldFN0b3JlLndhbGxldHMkO1xuICAgIHJlYWRvbmx5IGZlYXR1cmVkJCA9IGNvbWJpbmVMYXRlc3QoW3RoaXMuX3dhbGxldFN0b3JlLndhbGxldHMkLCB0aGlzLmZlYXR1cmVkV2FsbGV0cyRdKS5waXBlKFxuICAgICAgICBtYXAoKFt3YWxsZXRzLCBmZWF0dXJlZFdhbGxldHNdKSA9PiB3YWxsZXRzLnNsaWNlKDAsIGZlYXR1cmVkV2FsbGV0cykpXG4gICAgKTtcbiAgICByZWFkb25seSBtb3JlJCA9IGNvbWJpbmVMYXRlc3QoW3RoaXMuX3dhbGxldFN0b3JlLndhbGxldHMkLCB0aGlzLmZlYXR1cmVkV2FsbGV0cyRdKS5waXBlKFxuICAgICAgICBtYXAoKFt3YWxsZXRzLCBmZWF0dXJlZFdhbGxldHNdKSA9PiB3YWxsZXRzLnNsaWNlKGZlYXR1cmVkV2FsbGV0cykpXG4gICAgKTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJlYWRvbmx5IF93YWxsZXRTdG9yZTogV2FsbGV0U3RvcmUsXG4gICAgICAgIHByaXZhdGUgcmVhZG9ubHkgX21hdERpYWxvZ1JlZjogTWF0RGlhbG9nUmVmPFdhbGxldE1vZGFsQ29tcG9uZW50PlxuICAgICkge31cblxuICAgIG9uU2VsZWN0aW9uQ2hhbmdlKHsgb3B0aW9ucyB9OiBNYXRTZWxlY3Rpb25MaXN0Q2hhbmdlKTogdm9pZCB7XG4gICAgICAgIGNvbnN0IFtvcHRpb25dID0gb3B0aW9ucztcblxuICAgICAgICBpZiAob3B0aW9uLnZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm1hdFNlbGVjdGlvbkxpc3Q/LmRlc2VsZWN0QWxsKCk7XG4gICAgICAgICAgICB0aGlzLl9leHBhbmRlZC5uZXh0KCF0aGlzLl9leHBhbmRlZC5nZXRWYWx1ZSgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3dhbGxldFN0b3JlLnNlbGVjdFdhbGxldChvcHRpb24udmFsdWUgfHwgbnVsbCk7XG4gICAgICAgICAgICB0aGlzLl9tYXREaWFsb2dSZWYuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==