import { PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as i0 from "@angular/core";
export declare class SanitizeUrlPipe implements PipeTransform {
    private readonly _domSanitizer;
    constructor(_domSanitizer: DomSanitizer);
    transform(value: string): SafeResourceUrl;
    static ɵfac: i0.ɵɵFactoryDeclaration<SanitizeUrlPipe, never>;
    static ɵpipe: i0.ɵɵPipeDeclaration<SanitizeUrlPipe, "sanitizeUrl">;
}
