(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/cdk/clipboard'), require('@angular/common'), require('@angular/core'), require('@angular/material/button'), require('@angular/material/dialog'), require('@angular/material/icon'), require('@angular/material/list'), require('@angular/material/menu'), require('@angular/material/toolbar'), require('@ngrx/component'), require('rxjs'), require('rxjs/operators'), require('@solana/wallet-adapter-angular'), require('@angular/platform-browser'), require('@angular/material/divider')) :
    typeof define === 'function' && define.amd ? define('@solana/wallet-adapter-angular-material-ui', ['exports', '@angular/cdk/clipboard', '@angular/common', '@angular/core', '@angular/material/button', '@angular/material/dialog', '@angular/material/icon', '@angular/material/list', '@angular/material/menu', '@angular/material/toolbar', '@ngrx/component', 'rxjs', 'rxjs/operators', '@solana/wallet-adapter-angular', '@angular/platform-browser', '@angular/material/divider'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.solana = global.solana || {}, global.solana["wallet-adapter-angular-material-ui"] = {}), global.ng.cdk.clipboard, global.ng.common, global.ng.core, global.ng.material.button, global.ng.material.dialog, global.ng.material.icon, global.ng.material.list, global.ng.material.menu, global.ng.material.toolbar, global["@ngrx/component"], global.rxjs, global.rxjs.operators, global["@solana/wallet-adapter-angular"], global.ng.platformBrowser, global.ng.material.divider));
})(this, (function (exports, i10$1, i10, i0, i2, i2$1, i1$2, i6, i6$1, i3, i4, rxjs, operators, i1$1, i1, i8) { 'use strict';

    function _interopNamespace(e) {
        if (e && e.__esModule) return e;
        var n = Object.create(null);
        if (e) {
            Object.keys(e).forEach(function (k) {
                if (k !== 'default') {
                    var d = Object.getOwnPropertyDescriptor(e, k);
                    Object.defineProperty(n, k, d.get ? d : {
                        enumerable: true,
                        get: function () { return e[k]; }
                    });
                }
            });
        }
        n["default"] = e;
        return Object.freeze(n);
    }

    var i10__namespace$1 = /*#__PURE__*/_interopNamespace(i10$1);
    var i10__namespace = /*#__PURE__*/_interopNamespace(i10);
    var i0__namespace = /*#__PURE__*/_interopNamespace(i0);
    var i2__namespace = /*#__PURE__*/_interopNamespace(i2);
    var i2__namespace$1 = /*#__PURE__*/_interopNamespace(i2$1);
    var i1__namespace$2 = /*#__PURE__*/_interopNamespace(i1$2);
    var i6__namespace = /*#__PURE__*/_interopNamespace(i6);
    var i6__namespace$1 = /*#__PURE__*/_interopNamespace(i6$1);
    var i3__namespace = /*#__PURE__*/_interopNamespace(i3);
    var i4__namespace = /*#__PURE__*/_interopNamespace(i4);
    var i1__namespace$1 = /*#__PURE__*/_interopNamespace(i1$1);
    var i1__namespace = /*#__PURE__*/_interopNamespace(i1);
    var i8__namespace = /*#__PURE__*/_interopNamespace(i8);

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    /** @deprecated */
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    /** @deprecated */
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2)
            for (var i = 0, l = from.length, ar; i < l; i++) {
                if (ar || !(i in from)) {
                    if (!ar)
                        ar = Array.prototype.slice.call(from, 0, i);
                    ar[i] = from[i];
                }
            }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, state, kind, f) {
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    }
    function __classPrivateFieldSet(receiver, state, value, kind, f) {
        if (kind === "m")
            throw new TypeError("Private method is not writable");
        if (kind === "a" && !f)
            throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    }

    var SanitizeUrlPipe = /** @class */ (function () {
        function SanitizeUrlPipe(_domSanitizer) {
            this._domSanitizer = _domSanitizer;
        }
        SanitizeUrlPipe.prototype.transform = function (value) {
            return this._domSanitizer.bypassSecurityTrustResourceUrl(value);
        };
        return SanitizeUrlPipe;
    }());
    SanitizeUrlPipe.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: SanitizeUrlPipe, deps: [{ token: i1__namespace.DomSanitizer }], target: i0__namespace.ɵɵFactoryTarget.Pipe });
    SanitizeUrlPipe.ɵpipe = i0__namespace.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: SanitizeUrlPipe, name: "sanitizeUrl" });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: SanitizeUrlPipe, decorators: [{
                type: i0.Pipe,
                args: [{
                        name: 'sanitizeUrl',
                        pure: true,
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace.DomSanitizer }]; } });

    var WalletIconComponent = /** @class */ (function () {
        function WalletIconComponent() {
            this.wallet = null;
        }
        return WalletIconComponent;
    }());
    WalletIconComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletIconComponent, deps: [], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletIconComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletIconComponent, selector: "wallet-icon", inputs: { wallet: "wallet" }, ngImport: i0__namespace, template: "\n        <ng-container *ngIf=\"wallet\">\n            <img [src]=\"wallet.icon | sanitizeUrl\" alt=\"\" />\n        </ng-container>\n    ", isInline: true, styles: ["\n            :host {\n                width: 1.5rem;\n                height: 1.5rem;\n            }\n\n            img {\n                width: inherit;\n                height: inherit;\n            }\n        "], directives: [{ type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "sanitizeUrl": SanitizeUrlPipe } });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletIconComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-icon',
                        template: "\n        <ng-container *ngIf=\"wallet\">\n            <img [src]=\"wallet.icon | sanitizeUrl\" alt=\"\" />\n        </ng-container>\n    ",
                        styles: [
                            "\n            :host {\n                width: 1.5rem;\n                height: 1.5rem;\n            }\n\n            img {\n                width: inherit;\n                height: inherit;\n            }\n        ",
                        ],
                    }]
            }], propDecorators: { wallet: [{
                    type: i0.Input
                }] } });

    var WalletConnectButtonDirective = /** @class */ (function () {
        function WalletConnectButtonDirective(_walletStore) {
            this._walletStore = _walletStore;
        }
        WalletConnectButtonDirective.prototype.onClick = function () {
            this._walletStore.connect().subscribe();
        };
        return WalletConnectButtonDirective;
    }());
    WalletConnectButtonDirective.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletConnectButtonDirective, deps: [{ token: i1__namespace$1.WalletStore }], target: i0__namespace.ɵɵFactoryTarget.Directive });
    WalletConnectButtonDirective.ɵdir = i0__namespace.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletConnectButtonDirective, selector: "button[wallet-connect-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0__namespace });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletConnectButtonDirective, decorators: [{
                type: i0.Directive,
                args: [{ selector: 'button[wallet-connect-button]' }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }]; }, propDecorators: { onClick: [{
                    type: i0.HostListener,
                    args: ['click']
                }] } });

    var WalletConnectButtonComponent = /** @class */ (function () {
        function WalletConnectButtonComponent(_walletStore) {
            this._walletStore = _walletStore;
            this.children = null;
            this.color = 'primary';
            this.disabled = false;
            this.wallet$ = this._walletStore.wallet$;
            this.connecting$ = this._walletStore.connecting$;
            this.connected$ = this._walletStore.connected$;
            this.innerText$ = rxjs.combineLatest([this.connecting$, this.connected$, this.wallet$]).pipe(operators.map(function (_a) {
                var _b = __read(_a, 3), connecting = _b[0], connected = _b[1], wallet = _b[2];
                if (connecting)
                    return 'Connecting...';
                if (connected)
                    return 'Connected';
                if (wallet)
                    return 'Connect';
                return 'Connect Wallet';
            }));
        }
        return WalletConnectButtonComponent;
    }());
    WalletConnectButtonComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletConnectButtonComponent, deps: [{ token: i1__namespace$1.WalletStore }], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletConnectButtonComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletConnectButtonComponent, selector: "wallet-connect-button", inputs: { color: "color", disabled: "disabled" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0__namespace, template: "\n        <button\n            *ngrxLet=\"wallet$; let wallet\"\n            mat-raised-button\n            wallet-connect-button\n            [color]=\"color\"\n            [disabled]=\"disabled || (connecting$ | ngrxPush) || !wallet || (connected$ | ngrxPush)\"\n        >\n            <ng-content></ng-content>\n            <div class=\"button-content\" *ngIf=\"!children\">\n                <wallet-icon *ngIf=\"wallet\" [wallet]=\"wallet\"></wallet-icon>\n                {{ innerText$ | ngrxPush }}\n            </div>\n        </button>\n    ", isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2__namespace.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i4__namespace.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: WalletConnectButtonDirective, selector: "button[wallet-connect-button]" }, { type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4__namespace.PushPipe }, changeDetection: i0__namespace.ChangeDetectionStrategy.OnPush });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletConnectButtonComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-connect-button',
                        template: "\n        <button\n            *ngrxLet=\"wallet$; let wallet\"\n            mat-raised-button\n            wallet-connect-button\n            [color]=\"color\"\n            [disabled]=\"disabled || (connecting$ | ngrxPush) || !wallet || (connected$ | ngrxPush)\"\n        >\n            <ng-content></ng-content>\n            <div class=\"button-content\" *ngIf=\"!children\">\n                <wallet-icon *ngIf=\"wallet\" [wallet]=\"wallet\"></wallet-icon>\n                {{ innerText$ | ngrxPush }}\n            </div>\n        </button>\n    ",
                        styles: [
                            "\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        ",
                        ],
                        changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }]; }, propDecorators: { children: [{
                    type: i0.ContentChild,
                    args: ['children']
                }], color: [{
                    type: i0.Input
                }], disabled: [{
                    type: i0.Input
                }] } });

    var WalletListItemComponent = /** @class */ (function () {
        function WalletListItemComponent() {
            this.wallet = null;
        }
        return WalletListItemComponent;
    }());
    WalletListItemComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletListItemComponent, deps: [], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletListItemComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletListItemComponent, selector: "wallet-list-item", inputs: { wallet: "wallet" }, ngImport: i0__namespace, template: "\n        <ng-container *ngIf=\"wallet\">\n            <p>{{ wallet.name }}</p>\n\n            <wallet-icon [wallet]=\"wallet\"></wallet-icon>\n        </ng-container>\n    ", isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }], directives: [{ type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletListItemComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-list-item',
                        template: "\n        <ng-container *ngIf=\"wallet\">\n            <p>{{ wallet.name }}</p>\n\n            <wallet-icon [wallet]=\"wallet\"></wallet-icon>\n        </ng-container>\n    ",
                        styles: [
                            "\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        ",
                        ],
                    }]
            }], propDecorators: { wallet: [{
                    type: i0.Input
                }] } });

    var WalletExpandComponent = /** @class */ (function () {
        function WalletExpandComponent() {
            this.expanded = null;
        }
        return WalletExpandComponent;
    }());
    WalletExpandComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletExpandComponent, deps: [], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletExpandComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletExpandComponent, selector: "wallet-expand", inputs: { expanded: "expanded" }, ngImport: i0__namespace, template: "\n        <p>{{ expanded ? 'Less' : 'More' }} options</p>\n        <mat-icon> {{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>\n    ", isInline: true, styles: ["\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        "], components: [{ type: i1__namespace$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletExpandComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-expand',
                        template: "\n        <p>{{ expanded ? 'Less' : 'More' }} options</p>\n        <mat-icon> {{ expanded ? 'expand_less' : 'expand_more' }}</mat-icon>\n    ",
                        styles: [
                            "\n            :host {\n                display: flex;\n                justify-content: space-between;\n                align-items: center;\n            }\n\n            p {\n                margin: 0;\n            }\n        ",
                        ],
                    }]
            }], propDecorators: { expanded: [{
                    type: i0.Input
                }] } });

    var WalletModalComponent = /** @class */ (function () {
        function WalletModalComponent(_walletStore, _matDialogRef) {
            this._walletStore = _walletStore;
            this._matDialogRef = _matDialogRef;
            this.matSelectionList = null;
            this._expanded = new rxjs.BehaviorSubject(false);
            this.expanded$ = this._expanded.asObservable();
            this._featuredWallets = new rxjs.BehaviorSubject(3);
            this.featuredWallets$ = this._featuredWallets.asObservable();
            this.wallets$ = this._walletStore.wallets$;
            this.featured$ = rxjs.combineLatest([this._walletStore.wallets$, this.featuredWallets$]).pipe(operators.map(function (_b) {
                var _c = __read(_b, 2), wallets = _c[0], featuredWallets = _c[1];
                return wallets.slice(0, featuredWallets);
            }));
            this.more$ = rxjs.combineLatest([this._walletStore.wallets$, this.featuredWallets$]).pipe(operators.map(function (_b) {
                var _c = __read(_b, 2), wallets = _c[0], featuredWallets = _c[1];
                return wallets.slice(featuredWallets);
            }));
        }
        WalletModalComponent.prototype.onSelectionChange = function (_b) {
            var options = _b.options;
            var _a;
            var _c = __read(options, 1), option = _c[0];
            if (option.value === null) {
                (_a = this.matSelectionList) === null || _a === void 0 ? void 0 : _a.deselectAll();
                this._expanded.next(!this._expanded.getValue());
            }
            else {
                this._walletStore.selectWallet(option.value || null);
                this._matDialogRef.close();
            }
        };
        return WalletModalComponent;
    }());
    WalletModalComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalComponent, deps: [{ token: i1__namespace$1.WalletStore }, { token: i2__namespace$1.MatDialogRef }], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletModalComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalComponent, selector: "wallet-modal", viewQueries: [{ propertyName: "matSelectionList", first: true, predicate: i6.MatSelectionList, descendants: true }], ngImport: i0__namespace, template: "\n        <mat-toolbar color=\"primary\">\n            <h2 mat-dialog-title>Select Wallet</h2>\n            <button mat-icon-button mat-dialog-close aria-label=\"Close wallet adapter selection\">\n                <mat-icon>close</mat-icon>\n            </button>\n        </mat-toolbar>\n        <ng-container *ngrxLet=\"more$; let moreWallets\">\n            <ng-container *ngrxLet=\"expanded$; let expanded\">\n                <mat-selection-list [multiple]=\"false\" (selectionChange)=\"onSelectionChange($event)\">\n                    <mat-list-option\n                        *ngFor=\"let wallet of featured$ | ngrxPush; last as isLast\"\n                        [value]=\"wallet.name\"\n                        [ngClass]=\"{\n                            'bottom-separator': moreWallets.length > 0 || !isLast\n                        }\"\n                    >\n                        <wallet-list-item [wallet]=\"wallet\"> </wallet-list-item>\n                    </mat-list-option>\n                    <ng-container *ngIf=\"moreWallets.length > 0\">\n                        <ng-container *ngIf=\"expanded\">\n                            <mat-list-option\n                                *ngFor=\"let wallet of moreWallets; last as isLast\"\n                                [value]=\"wallet.name\"\n                                class=\"bottom-separator\"\n                            >\n                                <wallet-list-item [wallet]=\"wallet\"> </wallet-list-item>\n                            </mat-list-option>\n                        </ng-container>\n                        <mat-list-option [value]=\"null\">\n                            <wallet-expand [expanded]=\"expanded\"> </wallet-expand>\n                        </mat-list-option>\n                    </ng-container>\n                </mat-selection-list>\n            </ng-container>\n        </ng-container>\n    ", isInline: true, styles: ["\n            :host {\n                display: block;\n                min-width: 280px;\n            }\n\n            .mat-dialog-title {\n                margin: 0;\n            }\n\n            .mat-toolbar {\n                justify-content: space-between;\n            }\n\n            .mat-list-base {\n                padding: 0 !important;\n            }\n\n            .bottom-separator {\n                border-bottom: solid 1px rgb(255 255 255 / 10%);\n            }\n        "], components: [{ type: i3__namespace.MatToolbar, selector: "mat-toolbar", inputs: ["color"], exportAs: ["matToolbar"] }, { type: i2__namespace.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i1__namespace$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i6__namespace.MatSelectionList, selector: "mat-selection-list", inputs: ["disableRipple", "tabIndex", "color", "compareWith", "disabled", "multiple"], outputs: ["selectionChange"], exportAs: ["matSelectionList"] }, { type: i6__namespace.MatListOption, selector: "mat-list-option", inputs: ["disableRipple", "checkboxPosition", "color", "value", "selected", "disabled"], outputs: ["selectedChange"], exportAs: ["matListOption"] }, { type: WalletListItemComponent, selector: "wallet-list-item", inputs: ["wallet"] }, { type: WalletExpandComponent, selector: "wallet-expand", inputs: ["expanded"] }], directives: [{ type: i2__namespace$1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { type: i2__namespace$1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["type", "mat-dialog-close", "aria-label", "matDialogClose"], exportAs: ["matDialogClose"] }, { type: i4__namespace.LetDirective, selector: "[ngrxLet]", inputs: ["ngrxLet"] }, { type: i10__namespace.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i10__namespace.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4__namespace.PushPipe }, changeDetection: i0__namespace.ChangeDetectionStrategy.OnPush });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-modal',
                        template: "\n        <mat-toolbar color=\"primary\">\n            <h2 mat-dialog-title>Select Wallet</h2>\n            <button mat-icon-button mat-dialog-close aria-label=\"Close wallet adapter selection\">\n                <mat-icon>close</mat-icon>\n            </button>\n        </mat-toolbar>\n        <ng-container *ngrxLet=\"more$; let moreWallets\">\n            <ng-container *ngrxLet=\"expanded$; let expanded\">\n                <mat-selection-list [multiple]=\"false\" (selectionChange)=\"onSelectionChange($event)\">\n                    <mat-list-option\n                        *ngFor=\"let wallet of featured$ | ngrxPush; last as isLast\"\n                        [value]=\"wallet.name\"\n                        [ngClass]=\"{\n                            'bottom-separator': moreWallets.length > 0 || !isLast\n                        }\"\n                    >\n                        <wallet-list-item [wallet]=\"wallet\"> </wallet-list-item>\n                    </mat-list-option>\n                    <ng-container *ngIf=\"moreWallets.length > 0\">\n                        <ng-container *ngIf=\"expanded\">\n                            <mat-list-option\n                                *ngFor=\"let wallet of moreWallets; last as isLast\"\n                                [value]=\"wallet.name\"\n                                class=\"bottom-separator\"\n                            >\n                                <wallet-list-item [wallet]=\"wallet\"> </wallet-list-item>\n                            </mat-list-option>\n                        </ng-container>\n                        <mat-list-option [value]=\"null\">\n                            <wallet-expand [expanded]=\"expanded\"> </wallet-expand>\n                        </mat-list-option>\n                    </ng-container>\n                </mat-selection-list>\n            </ng-container>\n        </ng-container>\n    ",
                        styles: [
                            "\n            :host {\n                display: block;\n                min-width: 280px;\n            }\n\n            .mat-dialog-title {\n                margin: 0;\n            }\n\n            .mat-toolbar {\n                justify-content: space-between;\n            }\n\n            .mat-list-base {\n                padding: 0 !important;\n            }\n\n            .bottom-separator {\n                border-bottom: solid 1px rgb(255 255 255 / 10%);\n            }\n        ",
                        ],
                        changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }, { type: i2__namespace$1.MatDialogRef }]; }, propDecorators: { matSelectionList: [{
                    type: i0.ViewChild,
                    args: [i6.MatSelectionList]
                }] } });

    var WalletModalButtonDirective = /** @class */ (function () {
        function WalletModalButtonDirective(_matDialog) {
            this._matDialog = _matDialog;
        }
        WalletModalButtonDirective.prototype.onClick = function () {
            this._matDialog.open(WalletModalComponent, { panelClass: 'wallet-modal' });
        };
        return WalletModalButtonDirective;
    }());
    WalletModalButtonDirective.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalButtonDirective, deps: [{ token: i2__namespace$1.MatDialog }], target: i0__namespace.ɵɵFactoryTarget.Directive });
    WalletModalButtonDirective.ɵdir = i0__namespace.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalButtonDirective, selector: "button[wallet-modal-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0__namespace });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalButtonDirective, decorators: [{
                type: i0.Directive,
                args: [{ selector: 'button[wallet-modal-button]' }]
            }], ctorParameters: function () { return [{ type: i2__namespace$1.MatDialog }]; }, propDecorators: { onClick: [{
                    type: i0.HostListener,
                    args: ['click']
                }] } });

    var WalletModalButtonComponent = /** @class */ (function () {
        function WalletModalButtonComponent() {
            this.children = null;
            this.color = 'primary';
        }
        return WalletModalButtonComponent;
    }());
    WalletModalButtonComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalButtonComponent, deps: [], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletModalButtonComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletModalButtonComponent, selector: "wallet-modal-button", inputs: { color: "color" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0__namespace, template: "\n        <button mat-raised-button [color]=\"color\" wallet-modal-button>\n            <ng-content></ng-content>\n            <ng-container *ngIf=\"!children\">Select Wallet</ng-container>\n        </button>\n    ", isInline: true, styles: ["\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2__namespace.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }], directives: [{ type: WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0__namespace.ChangeDetectionStrategy.OnPush });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletModalButtonComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-modal-button',
                        template: "\n        <button mat-raised-button [color]=\"color\" wallet-modal-button>\n            <ng-content></ng-content>\n            <ng-container *ngIf=\"!children\">Select Wallet</ng-container>\n        </button>\n    ",
                        styles: [
                            "\n            button {\n                display: inline-block;\n            }\n\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        ",
                        ],
                        changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    }]
            }], propDecorators: { children: [{
                    type: i0.ContentChild,
                    args: ['children']
                }], color: [{
                    type: i0.Input
                }] } });

    var WalletDisconnectButtonDirective = /** @class */ (function () {
        function WalletDisconnectButtonDirective(_walletStore) {
            this._walletStore = _walletStore;
        }
        WalletDisconnectButtonDirective.prototype.onClick = function () {
            this._walletStore.disconnect().subscribe();
        };
        return WalletDisconnectButtonDirective;
    }());
    WalletDisconnectButtonDirective.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletDisconnectButtonDirective, deps: [{ token: i1__namespace$1.WalletStore }], target: i0__namespace.ɵɵFactoryTarget.Directive });
    WalletDisconnectButtonDirective.ɵdir = i0__namespace.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "12.2.9", type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]", host: { listeners: { "click": "onClick()" } }, ngImport: i0__namespace });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletDisconnectButtonDirective, decorators: [{
                type: i0.Directive,
                args: [{ selector: 'button[wallet-disconnect-button]' }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }]; }, propDecorators: { onClick: [{
                    type: i0.HostListener,
                    args: ['click']
                }] } });

    var WalletDisconnectButtonComponent = /** @class */ (function () {
        function WalletDisconnectButtonComponent(_walletStore) {
            this._walletStore = _walletStore;
            this.children = null;
            this.color = 'primary';
            this.disabled = false;
            this.innerText$ = rxjs.combineLatest([this._walletStore.disconnecting$, this._walletStore.wallet$]).pipe(operators.map(function (_a) {
                var _b = __read(_a, 2), disconnecting = _b[0], wallet = _b[1];
                if (disconnecting)
                    return 'Disconnecting ...';
                if (wallet)
                    return 'Disconnect';
                return 'Disconnect Wallet';
            }));
            this.wallet$ = this._walletStore.wallet$;
            this.disconnecting$ = this._walletStore.disconnecting$;
        }
        return WalletDisconnectButtonComponent;
    }());
    WalletDisconnectButtonComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletDisconnectButtonComponent, deps: [{ token: i1__namespace$1.WalletStore }], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletDisconnectButtonComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletDisconnectButtonComponent, selector: "wallet-disconnect-button", inputs: { color: "color", disabled: "disabled" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0__namespace, template: "\n        <button\n            mat-raised-button\n            wallet-disconnect-button\n            [color]=\"color\"\n            [disabled]=\"disabled || (disconnecting$ | ngrxPush) || (wallet$ | ngrxPush) === null\"\n        >\n            <ng-content></ng-content>\n            <div class=\"button-content\" *ngIf=\"!children\">\n                <mat-icon>logout</mat-icon>\n                {{ innerText$ | ngrxPush }}\n            </div>\n        </button>\n    ", isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: i2__namespace.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: i1__namespace$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], directives: [{ type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }, { type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], pipes: { "ngrxPush": i4__namespace.PushPipe } });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletDisconnectButtonComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-disconnect-button',
                        template: "\n        <button\n            mat-raised-button\n            wallet-disconnect-button\n            [color]=\"color\"\n            [disabled]=\"disabled || (disconnecting$ | ngrxPush) || (wallet$ | ngrxPush) === null\"\n        >\n            <ng-content></ng-content>\n            <div class=\"button-content\" *ngIf=\"!children\">\n                <mat-icon>logout</mat-icon>\n                {{ innerText$ | ngrxPush }}\n            </div>\n        </button>\n    ",
                        styles: [
                            "\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        ",
                        ],
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }]; }, propDecorators: { children: [{
                    type: i0.ContentChild,
                    args: ['children']
                }], color: [{
                    type: i0.Input
                }], disabled: [{
                    type: i0.Input
                }] } });

    var ObscureAddressPipe = /** @class */ (function () {
        function ObscureAddressPipe() {
        }
        ObscureAddressPipe.prototype.transform = function (value) {
            if (value === null) {
                return '';
            }
            return value
                .split('')
                .reduce(function (state, curr, index) { return state + (index <= 3 || index >= 39 ? curr : '*'); })
                .split('*')
                .filter(function (segment) { return segment; })
                .join('***');
        };
        return ObscureAddressPipe;
    }());
    ObscureAddressPipe.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: ObscureAddressPipe, deps: [], target: i0__namespace.ɵɵFactoryTarget.Pipe });
    ObscureAddressPipe.ɵpipe = i0__namespace.ɵɵngDeclarePipe({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: ObscureAddressPipe, name: "obscureAddress" });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: ObscureAddressPipe, decorators: [{
                type: i0.Pipe,
                args: [{
                        name: 'obscureAddress',
                    }]
            }] });

    var WalletMultiButtonComponent = /** @class */ (function () {
        function WalletMultiButtonComponent(_walletStore) {
            this._walletStore = _walletStore;
            this.children = null;
            this.color = 'primary';
            this.wallet$ = this._walletStore.wallet$;
            this.connected$ = this._walletStore.connected$;
            this.address$ = this._walletStore.publicKey$.pipe(operators.map(function (publicKey) { return publicKey && publicKey.toBase58(); }));
        }
        return WalletMultiButtonComponent;
    }());
    WalletMultiButtonComponent.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletMultiButtonComponent, deps: [{ token: i1__namespace$1.WalletStore }], target: i0__namespace.ɵɵFactoryTarget.Component });
    WalletMultiButtonComponent.ɵcmp = i0__namespace.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "12.2.9", type: WalletMultiButtonComponent, selector: "wallet-multi-button", inputs: { color: "color" }, queries: [{ propertyName: "children", first: true, predicate: ["children"], descendants: true }], ngImport: i0__namespace, template: "\n        <wallet-modal-button *ngIf=\"(wallet$ | ngrxPush) === null\" [color]=\"color\"></wallet-modal-button>\n        <wallet-connect-button\n            *ngIf=\"(connected$ | ngrxPush) === false && (wallet$ | ngrxPush)\"\n            [color]=\"color\"\n        ></wallet-connect-button>\n\n        <ng-container *ngIf=\"connected$ | ngrxPush\">\n            <button mat-raised-button [color]=\"color\" [matMenuTriggerFor]=\"walletMenu\">\n                <ng-content></ng-content>\n                <div class=\"button-content\" *ngIf=\"!children\">\n                    <wallet-icon [wallet]=\"wallet$ | ngrxPush\"></wallet-icon>\n                    {{ address$ | ngrxPush | obscureAddress }}\n                </div>\n            </button>\n            <mat-menu #walletMenu=\"matMenu\">\n                <button *ngIf=\"address$ | ngrxPush as address\" mat-menu-item [cdkCopyToClipboard]=\"address\">\n                    <mat-icon>content_copy</mat-icon>\n                    Copy address\n                </button>\n                <button mat-menu-item wallet-modal-button>\n                    <mat-icon>sync_alt</mat-icon>\n                    Connect a different wallet\n                </button>\n                <mat-divider></mat-divider>\n                <button mat-menu-item wallet-disconnect-button>\n                    <mat-icon>logout</mat-icon>\n                    Disconnect\n                </button>\n            </mat-menu>\n        </ng-container>\n    ", isInline: true, styles: ["\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        "], components: [{ type: WalletModalButtonComponent, selector: "wallet-modal-button", inputs: ["color"] }, { type: WalletConnectButtonComponent, selector: "wallet-connect-button", inputs: ["color", "disabled"] }, { type: i2__namespace.MatButton, selector: "button[mat-button], button[mat-raised-button], button[mat-icon-button],             button[mat-fab], button[mat-mini-fab], button[mat-stroked-button],             button[mat-flat-button]", inputs: ["disabled", "disableRipple", "color"], exportAs: ["matButton"] }, { type: WalletIconComponent, selector: "wallet-icon", inputs: ["wallet"] }, { type: i6__namespace$1.MatMenu, selector: "mat-menu", exportAs: ["matMenu"] }, { type: i6__namespace$1.MatMenuItem, selector: "[mat-menu-item]", inputs: ["disabled", "disableRipple", "role"], exportAs: ["matMenuItem"] }, { type: i1__namespace$2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { type: i8__namespace.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }], directives: [{ type: i10__namespace.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }, { type: i6__namespace$1.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", exportAs: ["matMenuTrigger"] }, { type: i10__namespace$1.CdkCopyToClipboard, selector: "[cdkCopyToClipboard]", inputs: ["cdkCopyToClipboard", "cdkCopyToClipboardAttempts"], outputs: ["cdkCopyToClipboardCopied"] }, { type: WalletModalButtonDirective, selector: "button[wallet-modal-button]" }, { type: WalletDisconnectButtonDirective, selector: "button[wallet-disconnect-button]" }], pipes: { "ngrxPush": i4__namespace.PushPipe, "obscureAddress": ObscureAddressPipe }, changeDetection: i0__namespace.ChangeDetectionStrategy.OnPush });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletMultiButtonComponent, decorators: [{
                type: i0.Component,
                args: [{
                        selector: 'wallet-multi-button',
                        template: "\n        <wallet-modal-button *ngIf=\"(wallet$ | ngrxPush) === null\" [color]=\"color\"></wallet-modal-button>\n        <wallet-connect-button\n            *ngIf=\"(connected$ | ngrxPush) === false && (wallet$ | ngrxPush)\"\n            [color]=\"color\"\n        ></wallet-connect-button>\n\n        <ng-container *ngIf=\"connected$ | ngrxPush\">\n            <button mat-raised-button [color]=\"color\" [matMenuTriggerFor]=\"walletMenu\">\n                <ng-content></ng-content>\n                <div class=\"button-content\" *ngIf=\"!children\">\n                    <wallet-icon [wallet]=\"wallet$ | ngrxPush\"></wallet-icon>\n                    {{ address$ | ngrxPush | obscureAddress }}\n                </div>\n            </button>\n            <mat-menu #walletMenu=\"matMenu\">\n                <button *ngIf=\"address$ | ngrxPush as address\" mat-menu-item [cdkCopyToClipboard]=\"address\">\n                    <mat-icon>content_copy</mat-icon>\n                    Copy address\n                </button>\n                <button mat-menu-item wallet-modal-button>\n                    <mat-icon>sync_alt</mat-icon>\n                    Connect a different wallet\n                </button>\n                <mat-divider></mat-divider>\n                <button mat-menu-item wallet-disconnect-button>\n                    <mat-icon>logout</mat-icon>\n                    Disconnect\n                </button>\n            </mat-menu>\n        </ng-container>\n    ",
                        styles: [
                            "\n            .button-content {\n                display: flex;\n                gap: 0.5rem;\n                align-items: center;\n            }\n        ",
                        ],
                        changeDetection: i0.ChangeDetectionStrategy.OnPush,
                    }]
            }], ctorParameters: function () { return [{ type: i1__namespace$1.WalletStore }]; }, propDecorators: { children: [{
                    type: i0.ContentChild,
                    args: ['children']
                }], color: [{
                    type: i0.Input
                }] } });

    var isNotNull = function (source) { return source.pipe(operators.filter(function (value) { return value !== null; })); };

    var WalletUiModule = /** @class */ (function () {
        function WalletUiModule() {
        }
        return WalletUiModule;
    }());
    WalletUiModule.ɵfac = i0__namespace.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletUiModule, deps: [], target: i0__namespace.ɵɵFactoryTarget.NgModule });
    WalletUiModule.ɵmod = i0__namespace.ɵɵngDeclareNgModule({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletUiModule, declarations: [WalletConnectButtonComponent,
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
            ObscureAddressPipe], imports: [i10.CommonModule,
            i10$1.ClipboardModule,
            i2.MatButtonModule,
            i2$1.MatDialogModule,
            i1$2.MatIconModule,
            i6.MatListModule,
            i6$1.MatMenuModule,
            i3.MatToolbarModule,
            i4.ReactiveComponentModule], exports: [WalletConnectButtonComponent,
            WalletConnectButtonDirective,
            WalletDisconnectButtonComponent,
            WalletDisconnectButtonDirective,
            WalletMultiButtonComponent,
            WalletModalButtonComponent,
            WalletModalButtonDirective,
            WalletModalComponent,
            WalletIconComponent] });
    WalletUiModule.ɵinj = i0__namespace.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletUiModule, imports: [[
                i10.CommonModule,
                i10$1.ClipboardModule,
                i2.MatButtonModule,
                i2$1.MatDialogModule,
                i1$2.MatIconModule,
                i6.MatListModule,
                i6$1.MatMenuModule,
                i3.MatToolbarModule,
                i4.ReactiveComponentModule,
            ]] });
    i0__namespace.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "12.2.9", ngImport: i0__namespace, type: WalletUiModule, decorators: [{
                type: i0.NgModule,
                args: [{
                        imports: [
                            i10.CommonModule,
                            i10$1.ClipboardModule,
                            i2.MatButtonModule,
                            i2$1.MatDialogModule,
                            i1$2.MatIconModule,
                            i6.MatListModule,
                            i6$1.MatMenuModule,
                            i3.MatToolbarModule,
                            i4.ReactiveComponentModule,
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

    exports.WalletConnectButtonComponent = WalletConnectButtonComponent;
    exports.WalletConnectButtonDirective = WalletConnectButtonDirective;
    exports.WalletDisconnectButtonComponent = WalletDisconnectButtonComponent;
    exports.WalletDisconnectButtonDirective = WalletDisconnectButtonDirective;
    exports.WalletIconComponent = WalletIconComponent;
    exports.WalletModalButtonComponent = WalletModalButtonComponent;
    exports.WalletModalButtonDirective = WalletModalButtonDirective;
    exports.WalletModalComponent = WalletModalComponent;
    exports.WalletMultiButtonComponent = WalletMultiButtonComponent;
    exports.WalletUiModule = WalletUiModule;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=solana-wallet-adapter-angular-material-ui.umd.js.map
