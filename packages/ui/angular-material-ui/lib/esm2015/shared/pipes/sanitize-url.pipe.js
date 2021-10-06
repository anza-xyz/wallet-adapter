import { Pipe } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/platform-browser";
export class SanitizeUrlPipe {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FuaXRpemUtdXJsLnBpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2hhcmVkL3BpcGVzL3Nhbml0aXplLXVybC5waXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDOzs7QUFPcEQsTUFBTSxPQUFPLGVBQWU7SUFDeEIsWUFBNkIsYUFBMkI7UUFBM0Isa0JBQWEsR0FBYixhQUFhLENBQWM7SUFBRyxDQUFDO0lBRTVELFNBQVMsQ0FBQyxLQUFhO1FBQ25CLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRSxDQUFDOzs0R0FMUSxlQUFlOzBHQUFmLGVBQWU7MkZBQWYsZUFBZTtrQkFKM0IsSUFBSTttQkFBQztvQkFDRixJQUFJLEVBQUUsYUFBYTtvQkFDbkIsSUFBSSxFQUFFLElBQUk7aUJBQ2IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIsIFNhZmVSZXNvdXJjZVVybCB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3Nhbml0aXplVXJsJyxcbiAgICBwdXJlOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBTYW5pdGl6ZVVybFBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJlYWRvbmx5IF9kb21TYW5pdGl6ZXI6IERvbVNhbml0aXplcikge31cblxuICAgIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nKTogU2FmZVJlc291cmNlVXJsIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RvbVNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodmFsdWUpO1xuICAgIH1cbn1cbiJdfQ==