/**
 * @jest-environment jsdom
 */

'use strict';

import 'jest-localstorage-mock';
import React, { createRef, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { useLocalStorage } from '../useLocalStorage.js';

type TestRefType = {
    getPersistedValue(): string;
    persistValue(value: string | null): void;
};

const DEFAULT_VALUE = 'default value';
const STORAGE_KEY = 'storageKey';

/**
 * Sometimes merely accessing `localStorage` on the `window` object can result
 * in a fatal error being thrown - for example in a private window in Firefox.
 * Call this method to simulate this in your tests, and don't forget to call
 * the cleanup function after you're done, so that other tests can run.
 */
function configureLocalStorageToFatalOnAccess(): () => void {
    const savedPropertyDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage') as PropertyDescriptor;
    Object.defineProperty(window, 'localStorage', {
        get() {
            throw new Error(
                'Error: Accessing `localStorage` resulted in a fatal ' +
                    '(eg. accessing it in a private window in Firefox).'
            );
        },
    });
    return function restoreOldLocalStorage() {
        Object.defineProperty(window, 'localStorage', savedPropertyDescriptor);
    };
}

const TestComponent = forwardRef(function TestComponentImpl(_props, ref) {
    const [persistedValue, setPersistedValue] = useLocalStorage<string | null>(STORAGE_KEY, DEFAULT_VALUE);
    useImperativeHandle(
        ref,
        () => ({
            getPersistedValue() {
                return persistedValue;
            },
            persistValue(newValue: string | null) {
                setPersistedValue(newValue);
            },
        }),
        [persistedValue, setPersistedValue]
    );
    return null;
});

describe('useLocalStorage', () => {
    let container: HTMLDivElement | null;
    let root: ReturnType<typeof createRoot>;
    let ref: React.RefObject<TestRefType>;
    function renderTest() {
        act(() => {
            root.render(<TestComponent ref={ref} />);
        });
    }
    beforeEach(() => {
        localStorage.clear();
        jest.resetAllMocks();
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        ref = createRef();
    });
    afterEach(() => {
        if (root) {
            root.unmount();
        }
    });
    describe('getting the persisted value', () => {
        describe('when local storage has a value for the storage key', () => {
            const PERSISTED_VALUE = 'value';
            beforeEach(() => {
                (localStorage.getItem as jest.Mock).mockImplementation((storageKey) => {
                    if (storageKey !== STORAGE_KEY) {
                        return null;
                    }
                    return JSON.stringify(PERSISTED_VALUE);
                });
                expect(renderTest).not.toThrow();
            });
            it('returns that value', () => {
                expect(ref.current?.getPersistedValue()).toBe(PERSISTED_VALUE);
            });
        });
        describe('when local storage has no value for the storage key', () => {
            const PERSISTED_VALUE = 'value';
            beforeEach(() => {
                (localStorage.getItem as jest.Mock).mockReturnValue(null);
                expect(renderTest).not.toThrow();
            });
            it('returns the default value', () => {
                expect(ref.current?.getPersistedValue()).toBe(DEFAULT_VALUE);
            });
        });
        describe('when merely accessing local storage results in a fatal error', () => {
            let restoreOldLocalStorage: () => void;
            beforeEach(() => {
                restoreOldLocalStorage = configureLocalStorageToFatalOnAccess();
                expect(renderTest).not.toThrow();
            });
            afterEach(() => {
                restoreOldLocalStorage();
            });
            it('renders with the default value', () => {
                expect(ref.current?.getPersistedValue()).toBe(DEFAULT_VALUE);
            });
        });
        describe('when local storage fatals on read', () => {
            beforeEach(() => {
                (localStorage.getItem as jest.Mock).mockImplementation(() => {
                    throw new Error('Local storage derped');
                });
                expect(renderTest).not.toThrow();
            });
            it('renders with the default value', () => {
                expect(ref.current?.getPersistedValue()).toBe(DEFAULT_VALUE);
            });
        });
        describe('when local storage does not exist', () => {
            let cachedLocalStorage: Storage;
            beforeEach(() => {
                cachedLocalStorage = localStorage;
                // @ts-ignore - readonly
                delete global.localStorage;
                expect(renderTest).not.toThrow();
            });
            afterEach(() => {
                // @ts-ignore - readonly
                global.localStorage = cachedLocalStorage;
            });
            it('renders with the default value', () => {
                expect(ref.current?.getPersistedValue()).toBe(DEFAULT_VALUE);
            });
        });
        describe('when local storage contains invalid JSON', () => {
            beforeEach(() => {
                (localStorage.getItem as jest.Mock).mockReturnValue('' /* <- not valid JSON! */);
                expect(renderTest).not.toThrow();
            });
            it('renders with the default value', () => {
                expect(ref.current?.getPersistedValue()).toBe(DEFAULT_VALUE);
            });
        });
    });
    describe('setting the persisted value', () => {
        describe('when setting to a non-null value', () => {
            const NEW_VALUE = 'new value';
            beforeEach(() => {
                expect(renderTest).not.toThrow();
            });
            it('sets that value in local storage', () => {
                act(() => {
                    ref.current?.persistValue(NEW_VALUE);
                });
                expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(NEW_VALUE));
            });
            it('re-renders the component with the new value', () => {
                act(() => {
                    ref.current?.persistValue(NEW_VALUE);
                });
                expect(ref.current?.getPersistedValue()).toBe(NEW_VALUE);
            });
            describe('many times in a row', () => {
                it('sets the new value in local storage once', () => {
                    act(() => {
                        ref.current?.persistValue(NEW_VALUE);
                        ref.current?.persistValue(NEW_VALUE);
                    });
                    expect(window.localStorage.setItem).toHaveBeenCalledTimes(1);
                    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(NEW_VALUE));
                });
            });
            describe('multiple times ending with the current value', () => {
                it("does not call local storage's setter", () => {
                    act(() => {
                        ref.current?.persistValue(NEW_VALUE);
                        ref.current?.persistValue(DEFAULT_VALUE);
                    });
                    expect(window.localStorage.setItem).toHaveBeenCalledTimes(0);
                });
            });
        });
        describe('when setting to `null`', () => {
            beforeEach(() => {
                expect(renderTest).not.toThrow();
            });
            it('removes the key from local storage', () => {
                act(() => {
                    ref.current?.persistValue(null);
                });
                expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
            });
            it('re-renders the component with `null`', () => {
                act(() => {
                    ref.current?.persistValue(null);
                });
                expect(ref.current?.getPersistedValue()).toBe(null);
            });
        });
        describe('when merely accessing local storage results in a fatal error', () => {
            const NEW_VALUE = 'new value';
            let restoreOldLocalStorage: () => void;
            beforeEach(() => {
                restoreOldLocalStorage = configureLocalStorageToFatalOnAccess();
                expect(renderTest).not.toThrow();
            });
            afterEach(() => {
                restoreOldLocalStorage();
            });
            it('re-renders the component with the new value', () => {
                act(() => {
                    ref.current?.persistValue(NEW_VALUE);
                });
                expect(ref.current?.getPersistedValue()).toBe(NEW_VALUE);
            });
        });
        describe('when local storage fatals on write', () => {
            const NEW_VALUE = 'new value';
            beforeEach(() => {
                (localStorage.setItem as jest.Mock).mockImplementation(() => {
                    throw new Error('Local storage derped');
                });
                expect(renderTest).not.toThrow();
            });
            it('re-renders the component with the new value', () => {
                act(() => {
                    ref.current?.persistValue(NEW_VALUE);
                });
                expect(ref.current?.getPersistedValue()).toBe(NEW_VALUE);
            });
        });
        describe('when local storage does not exist', () => {
            let cachedLocalStorage: Storage;
            beforeEach(() => {
                cachedLocalStorage = localStorage;
                // @ts-ignore - readonly
                delete global.localStorage;
                expect(renderTest).not.toThrow();
            });
            afterEach(() => {
                // @ts-ignore - readonly
                global.localStorage = cachedLocalStorage;
            });
            describe('when setting to a non-null value', () => {
                const NEW_VALUE = 'new value';
                it('re-renders the component with the new value', () => {
                    act(() => {
                        ref.current?.persistValue(NEW_VALUE);
                    });
                    expect(ref.current?.getPersistedValue()).toBe(NEW_VALUE);
                });
            });
            describe('when setting to `null`', () => {
                it('re-renders the component with `null`', () => {
                    act(() => {
                        ref.current?.persistValue(null);
                    });
                    expect(ref.current?.getPersistedValue()).toBe(null);
                });
            });
        });
    });
});
