import React, { useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultState: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const state = useState<T>(() => {
        try {
            const value = localStorage.getItem(key);
            if (value) return JSON.parse(value) as T;
        } catch (error) {
            console.error(error);
        }

        return defaultState;
    });

    const isFirstRender = useRef(true);
    useEffect(() => {
        if (isFirstRender.current === true) {
            isFirstRender.current = false;
            return;
        }
        try {
            if (state[0] === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify(state[0]));
            }
        } catch (error) {
            console.error(error);
        }
    }, [state[0]]);

    return state;
}
