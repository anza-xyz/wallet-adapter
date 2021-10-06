import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveComponentModule } from '@ngrx/component';
import { WalletConnectButtonComponent, WalletConnectButtonDirective } from './connect-button';
import { WalletModalButtonComponent, WalletModalButtonDirective, WalletModalComponent, WalletExpandComponent, WalletListItemComponent, } from './modal';
import { WalletDisconnectButtonComponent, WalletDisconnectButtonDirective } from './disconnect-button';
import { WalletMultiButtonComponent } from './multi-button';
import { ObscureAddressPipe, SanitizeUrlPipe, WalletIconComponent } from './shared';
import * as i0 from "@angular/core";
export class WalletUiModule {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ndWxhci1tYXRlcmlhbC11aS5tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYW5ndWxhci1tYXRlcmlhbC11aS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMvQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDN0QsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUQsT0FBTyxFQUFFLDRCQUE0QixFQUFFLDRCQUE0QixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDOUYsT0FBTyxFQUNILDBCQUEwQixFQUMxQiwwQkFBMEIsRUFDMUIsb0JBQW9CLEVBQ3BCLHFCQUFxQixFQUNyQix1QkFBdUIsR0FDMUIsTUFBTSxTQUFTLENBQUM7QUFDakIsT0FBTyxFQUFFLCtCQUErQixFQUFFLCtCQUErQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkcsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQzs7QUF5Q3BGLE1BQU0sT0FBTyxjQUFjOzsyR0FBZCxjQUFjOzRHQUFkLGNBQWMsaUJBZm5CLDRCQUE0QjtRQUM1Qiw0QkFBNEI7UUFDNUIsK0JBQStCO1FBQy9CLCtCQUErQjtRQUMvQiwwQkFBMEI7UUFDMUIsMEJBQTBCO1FBQzFCLDBCQUEwQjtRQUMxQixvQkFBb0I7UUFDcEIsdUJBQXVCO1FBQ3ZCLHFCQUFxQjtRQUNyQixtQkFBbUI7UUFDbkIsZUFBZTtRQUNmLGtCQUFrQixhQWxDbEIsWUFBWTtRQUNaLGVBQWU7UUFDZixlQUFlO1FBQ2YsZUFBZTtRQUNmLGFBQWE7UUFDYixhQUFhO1FBQ2IsYUFBYTtRQUNiLGdCQUFnQjtRQUNoQix1QkFBdUIsYUFHdkIsNEJBQTRCO1FBQzVCLDRCQUE0QjtRQUM1QiwrQkFBK0I7UUFDL0IsK0JBQStCO1FBQy9CLDBCQUEwQjtRQUMxQiwwQkFBMEI7UUFDMUIsMEJBQTBCO1FBQzFCLG9CQUFvQjtRQUNwQixtQkFBbUI7NEdBa0JkLGNBQWMsWUF0Q2Q7WUFDTCxZQUFZO1lBQ1osZUFBZTtZQUNmLGVBQWU7WUFDZixlQUFlO1lBQ2YsYUFBYTtZQUNiLGFBQWE7WUFDYixhQUFhO1lBQ2IsZ0JBQWdCO1lBQ2hCLHVCQUF1QjtTQUMxQjsyRkE0QlEsY0FBYztrQkF2QzFCLFFBQVE7bUJBQUM7b0JBQ04sT0FBTyxFQUFFO3dCQUNMLFlBQVk7d0JBQ1osZUFBZTt3QkFDZixlQUFlO3dCQUNmLGVBQWU7d0JBQ2YsYUFBYTt3QkFDYixhQUFhO3dCQUNiLGFBQWE7d0JBQ2IsZ0JBQWdCO3dCQUNoQix1QkFBdUI7cUJBQzFCO29CQUNELE9BQU8sRUFBRTt3QkFDTCw0QkFBNEI7d0JBQzVCLDRCQUE0Qjt3QkFDNUIsK0JBQStCO3dCQUMvQiwrQkFBK0I7d0JBQy9CLDBCQUEwQjt3QkFDMUIsMEJBQTBCO3dCQUMxQiwwQkFBMEI7d0JBQzFCLG9CQUFvQjt3QkFDcEIsbUJBQW1CO3FCQUN0QjtvQkFDRCxZQUFZLEVBQUU7d0JBQ1YsNEJBQTRCO3dCQUM1Qiw0QkFBNEI7d0JBQzVCLCtCQUErQjt3QkFDL0IsK0JBQStCO3dCQUMvQiwwQkFBMEI7d0JBQzFCLDBCQUEwQjt3QkFDMUIsMEJBQTBCO3dCQUMxQixvQkFBb0I7d0JBQ3BCLHVCQUF1Qjt3QkFDdkIscUJBQXFCO3dCQUNyQixtQkFBbUI7d0JBQ25CLGVBQWU7d0JBQ2Ysa0JBQWtCO3FCQUNyQjtpQkFDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsaXBib2FyZE1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jbGlwYm9hcmQnO1xuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9idXR0b24nO1xuaW1wb3J0IHsgTWF0RGlhbG9nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcbmltcG9ydCB7IE1hdEljb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9pY29uJztcbmltcG9ydCB7IE1hdExpc3RNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9saXN0JztcbmltcG9ydCB7IE1hdE1lbnVNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9tZW51JztcbmltcG9ydCB7IE1hdFRvb2xiYXJNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC90b29sYmFyJztcbmltcG9ydCB7IFJlYWN0aXZlQ29tcG9uZW50TW9kdWxlIH0gZnJvbSAnQG5ncngvY29tcG9uZW50JztcblxuaW1wb3J0IHsgV2FsbGV0Q29ubmVjdEJ1dHRvbkNvbXBvbmVudCwgV2FsbGV0Q29ubmVjdEJ1dHRvbkRpcmVjdGl2ZSB9IGZyb20gJy4vY29ubmVjdC1idXR0b24nO1xuaW1wb3J0IHtcbiAgICBXYWxsZXRNb2RhbEJ1dHRvbkNvbXBvbmVudCxcbiAgICBXYWxsZXRNb2RhbEJ1dHRvbkRpcmVjdGl2ZSxcbiAgICBXYWxsZXRNb2RhbENvbXBvbmVudCxcbiAgICBXYWxsZXRFeHBhbmRDb21wb25lbnQsXG4gICAgV2FsbGV0TGlzdEl0ZW1Db21wb25lbnQsXG59IGZyb20gJy4vbW9kYWwnO1xuaW1wb3J0IHsgV2FsbGV0RGlzY29ubmVjdEJ1dHRvbkNvbXBvbmVudCwgV2FsbGV0RGlzY29ubmVjdEJ1dHRvbkRpcmVjdGl2ZSB9IGZyb20gJy4vZGlzY29ubmVjdC1idXR0b24nO1xuaW1wb3J0IHsgV2FsbGV0TXVsdGlCdXR0b25Db21wb25lbnQgfSBmcm9tICcuL211bHRpLWJ1dHRvbic7XG5pbXBvcnQgeyBPYnNjdXJlQWRkcmVzc1BpcGUsIFNhbml0aXplVXJsUGlwZSwgV2FsbGV0SWNvbkNvbXBvbmVudCB9IGZyb20gJy4vc2hhcmVkJztcblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgICAgIENvbW1vbk1vZHVsZSxcbiAgICAgICAgQ2xpcGJvYXJkTW9kdWxlLFxuICAgICAgICBNYXRCdXR0b25Nb2R1bGUsXG4gICAgICAgIE1hdERpYWxvZ01vZHVsZSxcbiAgICAgICAgTWF0SWNvbk1vZHVsZSxcbiAgICAgICAgTWF0TGlzdE1vZHVsZSxcbiAgICAgICAgTWF0TWVudU1vZHVsZSxcbiAgICAgICAgTWF0VG9vbGJhck1vZHVsZSxcbiAgICAgICAgUmVhY3RpdmVDb21wb25lbnRNb2R1bGUsXG4gICAgXSxcbiAgICBleHBvcnRzOiBbXG4gICAgICAgIFdhbGxldENvbm5lY3RCdXR0b25Db21wb25lbnQsXG4gICAgICAgIFdhbGxldENvbm5lY3RCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldERpc2Nvbm5lY3RCdXR0b25Db21wb25lbnQsXG4gICAgICAgIFdhbGxldERpc2Nvbm5lY3RCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldE11bHRpQnV0dG9uQ29tcG9uZW50LFxuICAgICAgICBXYWxsZXRNb2RhbEJ1dHRvbkNvbXBvbmVudCxcbiAgICAgICAgV2FsbGV0TW9kYWxCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldE1vZGFsQ29tcG9uZW50LFxuICAgICAgICBXYWxsZXRJY29uQ29tcG9uZW50LFxuICAgIF0sXG4gICAgZGVjbGFyYXRpb25zOiBbXG4gICAgICAgIFdhbGxldENvbm5lY3RCdXR0b25Db21wb25lbnQsXG4gICAgICAgIFdhbGxldENvbm5lY3RCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldERpc2Nvbm5lY3RCdXR0b25Db21wb25lbnQsXG4gICAgICAgIFdhbGxldERpc2Nvbm5lY3RCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldE11bHRpQnV0dG9uQ29tcG9uZW50LFxuICAgICAgICBXYWxsZXRNb2RhbEJ1dHRvbkNvbXBvbmVudCxcbiAgICAgICAgV2FsbGV0TW9kYWxCdXR0b25EaXJlY3RpdmUsXG4gICAgICAgIFdhbGxldE1vZGFsQ29tcG9uZW50LFxuICAgICAgICBXYWxsZXRMaXN0SXRlbUNvbXBvbmVudCxcbiAgICAgICAgV2FsbGV0RXhwYW5kQ29tcG9uZW50LFxuICAgICAgICBXYWxsZXRJY29uQ29tcG9uZW50LFxuICAgICAgICBTYW5pdGl6ZVVybFBpcGUsXG4gICAgICAgIE9ic2N1cmVBZGRyZXNzUGlwZSxcbiAgICBdLFxufSlcbmV4cG9ydCBjbGFzcyBXYWxsZXRVaU1vZHVsZSB7fVxuIl19