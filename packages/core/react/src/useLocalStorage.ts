import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, (newValue: T) => void] {
    const [value, setValue] = useState<T>(() => {
        if (typeof localStorage === 'undefined') return defaultState;

        const value = localStorage.getItem(key);
        try {
            return value ? (JSON.parse(value) as T) : defaultState;
        } catch (error) {
            console.warn(error);
            return defaultState;
        }
    });

    const setLocalStorage = useCallback(
        (newValue: T) => {
            if (newValue === value) return;
            setValue(newValue);

            if (newValue === null) {
                localStorage.removeItem(key);
            } else {
                try {
                    localStorage.setItem(key, JSON.stringify(newValue));
                } catch (error) {
                    console.error(error);
                }
            }
        },
        [value, setValue, key]
    );

    return [value, setLocalStorage];
}
