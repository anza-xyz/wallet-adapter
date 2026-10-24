import assert from 'node:assert/strict';
import test from 'node:test';
import { isIosAndRedirectable } from '../lib/esm/adapter.js';

test('returns false when navigator is unavailable during server-side rendering', () => {
    const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    try {
        assert.equal(Reflect.deleteProperty(globalThis, 'navigator'), true);
        assert.equal(isIosAndRedirectable(), false);
    } finally {
        if (navigatorDescriptor) {
            Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
        }
    }
});
