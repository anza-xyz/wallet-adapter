import { customRef, Ref } from '@vue/reactivity';

export function useLocalStorage<T>(key: string, defaultValue: T | null = null): Ref<T | null> {
    return customRef<T | null>((track, trigger) => ({
        get() {
            track();

            try {
                const value = localStorage.getItem(key);
                if (value) return JSON.parse(value) as T;
            } catch (error) {
                if (typeof window !== 'undefined') {
                    console.error(error);
                }
            }

            return defaultValue;
        },
        set(value) {
            try {
                if (value === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            } catch (error) {
                if (typeof window !== 'undefined') {
                    console.error(error);
                }
            }

            trigger();
        },
    }));
}
