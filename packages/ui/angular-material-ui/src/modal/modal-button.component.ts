import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, Input } from '@angular/core';

import { ButtonColor } from '../shared/types';

@Component({
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
})
export class WalletModalButtonComponent {
    @ContentChild('children') children: ElementRef | null = null;
    @Input() color: ButtonColor = 'primary';
}
