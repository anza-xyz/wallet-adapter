import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react';

function getLocalStorage(): Storage | null {
    try {
        if (typeof globalThis === 'undefined') return null;
        const storage = (globalThis as any).localStorage as Storage | undefined;
        return storage ?? null;
    } catch {
        // e.g. private mode / restricted environments where accessing localStorage throws
        return null;
    }
}

export function useLocalStorage<T>(key: string, defaultState: T): [T, Dispatch<SetStateAction<T>>] {
    const state = useState<T>(() => {
        const storage = getLocalStorage();
        if (!storage) return defaultState;

        try {
            const value = storage.getItem(key);
            if (value) return JSON.parse(value) as T;
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }

        return defaultState;
    });
    const value = state[0];

    const isFirstRenderRef = useRef(true);
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        try {
            const storage = getLocalStorage();
            if (!storage) return;

            if (value === null) {
                storage.removeItem(key);
            } else {
                storage.setItem(key, JSON.stringify(value));
            }
        } catch (error: any) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }
    }, [value, key]);

    return state;
}
