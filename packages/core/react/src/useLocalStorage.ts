import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, (newValue: T) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            if (typeof localStorage === 'undefined') return defaultState;
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(value) as T;
            }
        } catch (error) {
            console.warn(error);
        }

        return defaultState;
    });

    const setLocalStorage = useCallback(
        (newValue: T) => {
            if (newValue === value) return;
            setValue(newValue);

            try {
                if (typeof localStorage === 'undefined') return;
                if (newValue === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(newValue));
                }
            } catch (error) {
                console.error(error);
            }
        },
        [value, setValue, key]
    );

    return [value, setLocalStorage];
}
