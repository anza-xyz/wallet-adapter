export function getLocalStorage<T>(key: string, defaultValue: T | null = null): T | null {
    try {
        const value = localStorage.getItem(key);
        if (value) return JSON.parse(value) as T;
    } catch (error) {
        if (typeof window !== 'undefined') {
            console.error(error);
        }
    }

    return defaultValue;
}

export function setLocalStorage<T>(key: string, value: T | null = null): void {
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
}
