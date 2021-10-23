import { ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { WalletName } from '@solana/wallet-adapter-wallets';
import { Wallet } from '@solana/wallet-adapter-wallets';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'wallet-modal',
    template: `
        <mat-toolbar color="primary">
            <h2 mat-dialog-title>Select Wallet</h2>
            <button mat-icon-button mat-dialog-close aria-label="Close wallet adapter selection">
                <mat-icon>close</mat-icon>
            </button>
        </mat-toolbar>

        <ng-container *ngrxLet="expanded$; let expanded">
            <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
                <mat-list-option
                    *ngFor="let wallet of featured; last as isLast"
                    [value]="wallet.name"
                    [ngClass]="{
                        'bottom-separator': more.length > 0 || !isLast
                    }"
                >
                    <wallet-list-item [wallet]="wallet"> </wallet-list-item>
                </mat-list-option>
                <ng-container *ngIf="more.length > 0">
                    <ng-container *ngIf="expanded">
                        <mat-list-option
                            *ngFor="let wallet of more; last as isLast"
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
})
export class WalletModalComponent {
    @ViewChild(MatSelectionList) matSelectionList: MatSelectionList | null = null;
    private readonly _expanded = new BehaviorSubject(false);
    readonly expanded$ = this._expanded.asObservable();
    readonly featured: Wallet[];
    readonly more: Wallet[];

    constructor(
        private readonly _matDialogRef: MatDialogRef<WalletModalComponent, WalletName>,
        @Inject(MAT_DIALOG_DATA) data: { wallets: Wallet[]; featured: number }
    ) {
        this.featured = data.wallets.slice(0, data.featured);
        this.more = data.wallets.slice(data.featured);
    }

    onSelectionChange({ options }: MatSelectionListChange): void {
        const [option] = options;

        if (option.value === null) {
            // Mat list options doesn't allow selecting a selected option.
            // Once the modal expands, the collapse button is selected and
            // cannot be selected again.
            this.matSelectionList?.deselectAll();
            this._expanded.next(!this._expanded.getValue());
        } else {
            this._matDialogRef.close(option.value);
        }
    }
}
