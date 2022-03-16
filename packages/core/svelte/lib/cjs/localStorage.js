"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLocalStorage = exports.getLocalStorage = void 0;
function getLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        if (value)
            return JSON.parse(value);
    }
    catch (error) {
        if (typeof window !== 'undefined') {
            console.error(error);
        }
    }
    return defaultValue;
}
exports.getLocalStorage = getLocalStorage;
function setLocalStorage(key, value = null) {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        }
        else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
    catch (error) {
        if (typeof window !== 'undefined') {
            console.error(error);
        }
    }
}
exports.setLocalStorage = setLocalStorage;
//# sourceMappingURL=localStorage.js.map