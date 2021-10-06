import { Directive, HostListener } from '@angular/core';
import { WalletModalComponent } from './modal.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
export class WalletModalButtonDirective {
    constructor(_matDialog) {
        this._matDialog = _matDialog;
    }
    onClick() {
        this._matDialog.open(WalletModalComponent, { panelClass: 'wallet-modal' });
    }
}
WalletModalButtonDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonDirective, deps: [{ token: i1.MatDialog }], target: i0.ɵɵFactoryTarget.Directive });
WalletModalButtonDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalButtonDirective, selector: "button[wallet-modal-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0, type: WalletModalButtonDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'button[wallet-modal-button]' }]
        }], ctorParameters: function () { return [{ type: i1.MatDialog }]; }, propDecorators: { onClick: [{
                type: HostListener,
                args: ['click']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kYWwtYnV0dG9uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tb2RhbC9tb2RhbC1idXR0b24uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3hELE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG1CQUFtQixDQUFDOzs7QUFHekQsTUFBTSxPQUFPLDBCQUEwQjtJQUtuQyxZQUE2QixVQUFxQjtRQUFyQixlQUFVLEdBQVYsVUFBVSxDQUFXO0lBQUcsQ0FBQztJQUovQixPQUFPO1FBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDL0UsQ0FBQzs7dUhBSFEsMEJBQTBCOzJHQUExQiwwQkFBMEI7MkZBQTFCLDBCQUEwQjtrQkFEdEMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSw2QkFBNkIsRUFBRTtnR0FFM0IsT0FBTztzQkFBN0IsWUFBWTt1QkFBQyxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBIb3N0TGlzdGVuZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1hdERpYWxvZyB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XG5cbmltcG9ydCB7IFdhbGxldE1vZGFsQ29tcG9uZW50IH0gZnJvbSAnLi9tb2RhbC5jb21wb25lbnQnO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdidXR0b25bd2FsbGV0LW1vZGFsLWJ1dHRvbl0nIH0pXG5leHBvcnQgY2xhc3MgV2FsbGV0TW9kYWxCdXR0b25EaXJlY3RpdmUge1xuICAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJykgb25DbGljaygpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fbWF0RGlhbG9nLm9wZW4oV2FsbGV0TW9kYWxDb21wb25lbnQsIHsgcGFuZWxDbGFzczogJ3dhbGxldC1tb2RhbCcgfSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBfbWF0RGlhbG9nOiBNYXREaWFsb2cpIHt9XG59XG4iXX0=