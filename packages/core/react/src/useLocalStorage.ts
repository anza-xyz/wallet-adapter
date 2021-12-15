import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, (newValue: T) => void] {
    const [value, setValue] = useState<T>(() => {
        try {
            const value = localStorage.getItem(key);
            if (value) return JSON.parse(value) as T;
        } catch (error) {
            console.error(error);
        }

        return defaultState;
    });

    const setLocalStorage = useCallback(
        (newValue: T) => {
            if (newValue === value) return;
            setValue(newValue);

            try {
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
