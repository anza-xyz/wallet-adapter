export class LocalStorageService<T> {
    private _value = this._defaultValue;

    constructor(private _key: string, private _defaultValue: T) {}

    get value(): T {
        if (this._value) return this._value;

        try {
            const value = localStorage.getItem(this._key);
            if (value) {
                this._value = JSON.parse(value) as T;
                return this._value;
            }
        } catch (error) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }

        return this._defaultValue;
    }

    setItem(newValue: T): void {
        if (newValue === this.value) return;

        this._value = newValue;

        try {
            if (newValue === null) {
                localStorage.removeItem(this._key);
            } else {
                localStorage.setItem(this._key, JSON.stringify(newValue));
            }
        } catch (error) {
            if (typeof window !== 'undefined') {
                console.error(error);
            }
        }
    }
}
