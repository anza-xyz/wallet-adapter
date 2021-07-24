import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, (newValue: T) => void] {
    const [value, setValue] = useState<T>(() => {
        const value = localStorage.getItem(key);
        if (value) return JSON.parse(value) as T;
        return defaultState;
    });

    const setLocalStorage = useCallback(
        (newValue: T) => {
            if (newValue === value) return;
            setValue(newValue);

            if (newValue === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(newValue));
            }
        },
        [value, setValue, key]
    );

    return [value, setLocalStorage];
}
