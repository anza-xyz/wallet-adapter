import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { WalletModalComponent } from './modal.component';

@Directive({ selector: 'button[wallet-modal-button]' })
export class WalletModalButtonDirective {
    @HostListener('click') onClick(): void {
        this._matDialog.open(WalletModalComponent, { panelClass: 'wallet-modal' });
    }

    constructor(private readonly _matDialog: MatDialog) {}
}
