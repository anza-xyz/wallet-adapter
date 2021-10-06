import * as i10$1 from '@angular/cdk/clipboard';
import { ClipboardModule } from '@angular/cdk/clipboard';
import * as i10 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i0 from '@angular/core';
import { Pipe, Component, Input, Directive, HostListener, ChangeDetectionStrategy, ContentChild, ViewChild, NgModule } from '@angular/core';
import * as i2 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i2$1 from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import * as i1$2 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i6 from '@angular/material/list';
import { MatSelectionList, MatListModule } from '@angular/material/list';
import * as i6$1 from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';
import * as i3 from '@angular/material/toolbar';
import { MatToolbarModule } from '@angular/material/toolbar';
import * as i4 from '@ngrx/component';
import { ReactiveComponentModule } from '@ngrx/component';
import { combineLatest, BehaviorSubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import * as i1$1 from '@solana/wallet-adapter-angular';
import * as i1 from '@angular/platform-browser';
import * as i8 from '@angular/material/divider';

class SanitizeUrlPipe {
    constructor(_domSanitizer) {
        this._domSanitizer = _domSanitizer;
    }
    transform(value) {
        return this._domSanitizer.bypassSecurityTrustResourceUrl(value);
    }
}
SanitizeUrlPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: SanitizeUrlPipe, deps: [{ token: i1.DomSanitizer }], target: i0.ɵɵFactoryTarget.Pipe });
SanitizeUrlPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: SanitizeUrlPipe, name: "sanitizeUrl" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: SanitizeUrlPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'sanitizeUrl',
                    pure: true,
                }]
        }], ctorParameters: function () { return [{ type: i1.DomSanitizer }]; } });

class WalletIconComponent {
    constructor() {
        this.wallet = null;
    }
}
WalletIconComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletIconComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletIconComponent, selector: "wallet-icon", inputs: { wallet: "wallet" }, ngImport: i0, template: `
        <ng-container *ngIf="wallet">
            <img [src]="wallet.icon | sanitizeUrl" alt="" />
        </ng-container>
    `, isInline: true, styles: ["\n            :host {\n                width: 1.5rem;\n                height: 1.5rem;\n            }\n\n            img {\n                width: inherit;\n                height: inherit;\n            }\n        "], directives: [{ type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "sanitizeUrl": SanitizeUrlPipe } });
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

class WalletConnectButtonDirective {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
    }
    onClick() {
        this._walletStore.connect().subscribe();
    }
}
WalletConnectButtonDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonDirective, deps: [{ token: i1$1.WalletStore }], target: i0.ɵɵFactoryTarget.Directive });
WalletConnectButtonDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletConnectButtonDirective, selector: "button[wallet-connect-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'button[wallet-connect-button]' }]
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }]; }, propDecorators: { onClick: [{
                type: HostListener,
                args: ['click']
            }] } });

class WalletConnectButtonComponent {
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
WalletConnectButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletConnectButtonComponent, deps: [{ token: i1$1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
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
    `, isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i4.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: WalletConnectButtonDirective, selector: "button[wallet-connect-button]" }, { type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4.PushPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });

class WalletListItemComponent {
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
    `, isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
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

class WalletExpandComponent {
    constructor() {
        this.expanded = null;
    }
}
WalletExpandComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletExpandComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
WalletExpandComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletExpandComponent, selector: "wallet-expand", inputs: { expanded: "expanded" }, ngImport: i0, template: `
        <p>{{ expanded ? 'Less' : 'More' }} options</p>
        <mat-icon> {{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
    `, isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: i1$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }] });
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

class WalletModalComponent {
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
WalletModalComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalComponent, deps: [{ token: i1$1.WalletStore }, { token: i2$1.MatDialogRef }], target: i0.ɵɵFactoryTarget.Component });
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
    `, isInline: true, styles: ["\n            :host {\n                display: block;\n                min-width: 280px;\n            }\n\n            .mat-dialog-title {\n                margin: 0;\n            }\n\n            .mat-toolbar {\n                justify-content: space-between;\n            }\n\n            .mat-list-base {\n                padding: 0 !important;\n            }\n\n            .bottom-separator {\n                border-bottom: solid 1px rgb(255 255 255 / 10%);\n            }\n        "], components: [{ type: i3.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i1$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i6.MatSelectionList, selector: "mat-selection-list", inputs: ["disableRipple", "tabIndex", "color", "compareWith", "disabled", "multiple"], outputs: ["selectionChange"], exportAs: ["matSelectionList"] }, { type: i6.MatListOption, selector: "mat-list-option", inputs: ["disableRipple", "checkboxPosition", "color", "value", "selected", "disabled"], outputs: ["selectedChange"], exportAs: ["matListOption"] }, { type: WalletListItemComponent, selector: "wallet-list-item", inputs: ["wallet"] }, { type: WalletExpandComponent, selector: "wallet-expand", inputs: ["expanded"] }], directives: [{ type: i2$1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { type: i2$1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["type", "mat-dialog-close", "aria-label", "matDialogClose"], exportAs: ["matDialogClose"] }, { type: i4.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: i10.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i10.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4.PushPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }, { type: i2$1.MatDialogRef }]; }, propDecorators: { matSelectionList: [{
                type: ViewChild,
                args: [MatSelectionList]
            }] } });

class WalletModalButtonDirective {
    constructor(_matDialog) {
        this._matDialog = _matDialog;
    }
    onClick() {
        this._matDialog.open(WalletModalComponent, { panelClass: 'wallet-modal' });
    }
}
WalletModalButtonDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonDirective, deps: [{ token: i2$1.MatDialog }], target: i0.ɵɵFactoryTarget.Directive });
WalletModalButtonDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalButtonDirective, selector: "button[wallet-modal-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'button[wallet-modal-button]' }]
        }], ctorParameters: function () { return [{ type: i2$1.MatDialog }]; }, propDecorators: { onClick: [{
                type: HostListener,
                args: ['click']
            }] } });

class WalletModalButtonComponent {
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
    `, isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], directives: [{ type: WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
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

class WalletDisconnectButtonDirective {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
    }
    onClick() {
        this._walletStore.disconnect().subscribe();
    }
}
WalletDisconnectButtonDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletDisconnectButtonDirective, deps: [{ token: i1$1.WalletStore }], target: i0.ɵɵFactoryTarget.Directive });
WalletDisconnectButtonDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletDisconnectButtonDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'button[wallet-disconnect-button]' }]
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }]; }, propDecorators: { onClick: [{
                type: HostListener,
                args: ['click']
            }] } });

class WalletDisconnectButtonComponent {
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
WalletDisconnectButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletDisconnectButtonComponent, deps: [{ token: i1$1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
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
    `, isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i1$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], directives: [{ type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }, { type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4.PushPipe } });
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
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }], disabled: [{
                type: Input
            }] } });

class ObscureAddressPipe {
    transform(value) {
        if (value === null) {
            return '';
        }
        return value
            .split('')
            .reduce((state, curr, index) => state + (index <= 3 || index >= 39 ? curr : '*'))
            .split('*')
            .filter((segment) => segment)
            .join('***');
    }
}
ObscureAddressPipe.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
ObscureAddressPipe.ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, name: "obscureAddress" });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: ObscureAddressPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'obscureAddress',
                }]
        }] });

class WalletMultiButtonComponent {
    constructor(_walletStore) {
        this._walletStore = _walletStore;
        this.children = null;
        this.color = 'primary';
        this.wallet$ = this._walletStore.wallet$;
        this.connected$ = this._walletStore.connected$;
        this.address$ = this._walletStore.publicKey$.pipe(map((publicKey) => publicKey && publicKey.toBase58()));
    }
}
WalletMultiButtonComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletMultiButtonComponent, deps: [{ token: i1$1.WalletStore }], target: i0.ɵɵFactoryTarget.Component });
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
    `, isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: WalletModalButtonComponent, selector: "wallet-modal-button", inputs: ["color"] }, { type: WalletConnectButtonComponent, selector: "wallet-connect-button", inputs: ["color", "disabled"] }, { type: i2.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }, { type: i6$1.MatMenu, selector: "mat-menu", exportAs: ["matMenu"] }, { type: i6$1.MatMenuItem, selector: "[mat-menu-item]", inputs: ["disabled", "disableRipple", "role"], exportAs: ["matMenuItem"] }, { type: i1$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i8.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }], directives: [{ type: i10.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i6$1.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", exportAs: ["matMenuTrigger"] }, { type: i10$1.CdkCopyToClipboard, selector: "[cdkCopyToClipboard]", inputs: ["cdkCopyToClipboard", "cdkCopyToClipboardAttempts"], outputs: ["cdkCopyToClipboardCopied"] }, { type: WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }], pipes: { "ngrxPush": i4.PushPipe, "obscureAddress": ObscureAddressPipe }, changeDetection: i0.ChangeDetectionStrategy.OnPush });
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
        }], ctorParameters: function () { return [{ type: i1$1.WalletStore }]; }, propDecorators: { children: [{
                type: ContentChild,
                args: ['children']
            }], color: [{
                type: Input
            }] } });

const isNotNull = (source) => source.pipe(filter((value) => value !== null));

class WalletUiModule {
}
WalletUiModule.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletUiModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule });
WalletUiModule.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletUiModule, declarations: [WalletConnectButtonComponent,
        WalletConnectButtonDirective,
        WalletDisconnectButtonComponent,
        WalletDisconnectButtonDirective,
        WalletMultiButtonComponent,
        WalletModalButtonComponent,
        WalletModalButtonDirective,
        WalletModalComponent,
        WalletListItemComponent,
        WalletExpandComponent,
        WalletIconComponent,
        SanitizeUrlPipe,
        ObscureAddressPipe], imports: [CommonModule,
        ClipboardModule,
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        MatListModule,
        MatMenuModule,
        MatToolbarModule,
        ReactiveComponentModule], exports: [WalletConnectButtonComponent,
        WalletConnectButtonDirective,
        WalletDisconnectButtonComponent,
        WalletDisconnectButtonDirective,
        WalletMultiButtonComponent,
        WalletModalButtonComponent,
        WalletModalButtonDirective,
        WalletModalComponent,
        WalletIconComponent] });
WalletUiModule.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletUiModule, imports: [[
            CommonModule,
            ClipboardModule,
            MatButtonModule,
            MatDialogModule,
            MatIconModule,
            MatListModule,
            MatMenuModule,
            MatToolbarModule,
            ReactiveComponentModule,
        ]] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletUiModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [
                        CommonModule,
                        ClipboardModule,
                        MatButtonModule,
                        MatDialogModule,
                        MatIconModule,
                        MatListModule,
                        MatMenuModule,
                        MatToolbarModule,
                        ReactiveComponentModule,
                    ],
                    exports: [
                        WalletConnectButtonComponent,
                        WalletConnectButtonDirective,
                        WalletDisconnectButtonComponent,
                        WalletDisconnectButtonDirective,
                        WalletMultiButtonComponent,
                        WalletModalButtonComponent,
                        WalletModalButtonDirective,
                        WalletModalComponent,
                        WalletIconComponent,
                    ],
                    declarations: [
                        WalletConnectButtonComponent,
                        WalletConnectButtonDirective,
                        WalletDisconnectButtonComponent,
                        WalletDisconnectButtonDirective,
                        WalletMultiButtonComponent,
                        WalletModalButtonComponent,
                        WalletModalButtonDirective,
                        WalletModalComponent,
                        WalletListItemComponent,
                        WalletExpandComponent,
                        WalletIconComponent,
                        SanitizeUrlPipe,
                        ObscureAddressPipe,
                    ],
                }]
        }] });

/**
 * Generated bundle index. Do not edit.
 */

export { WalletConnectButtonComponent, WalletConnectButtonDirective, WalletDisconnectButtonComponent, WalletDisconnectButtonDirective, WalletIconComponent, WalletModalButtonComponent, WalletModalButtonDirective, WalletModalComponent, WalletMultiButtonComponent, WalletUiModule };
//# sourceMappingURL=solana-wallet-adapter-angular-material-ui.js.map
