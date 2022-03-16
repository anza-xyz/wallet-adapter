export function getLocalStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        if (value)
            return JSON.parse(value);
    }
    catch (error) {
        if (typeof window !== 'undefined') {
            console.error(error);
        }
    }
    return defaultValue;
}
export function setLocalStorage(key, value = null) {
    try {
        if (value === null) {
            localStorage.removeItem(key);
        }
        else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    }
    catch (error) {
        if (typeof window !== 'undefined') {
            console.error(error);
        }
    }
}
//# sourceMappingURL=localStorage.js.map