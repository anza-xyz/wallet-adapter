export class LocalStorageService<T> {
    private _value = this._defaultState;

    constructor(private _key: string, private _defaultState: T) {}

    get value(): T {
        if (typeof localStorage === 'undefined') {
            return this._defaultState;
        }

        if (this._value) {
            return this._value;
        }

        const value = localStorage.getItem(this._key);
        if (value) {
            this._value = JSON.parse(value) as T;
            return this._value;
        }

        return this._defaultState;
    }

    setItem(newValue: T): void {
        if (newValue === this.value) return;

        this._value = newValue;

        if (newValue === null) {
            localStorage.removeItem(this._key);
        } else {
            localStorage.setItem(this._key, JSON.stringify(newValue));
        }
    }
}
