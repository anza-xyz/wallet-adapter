import { Component, Input } from '@angular/core';

@Component({
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
})
export class WalletExpandComponent {
    @Input() expanded: boolean | null = null;
}
