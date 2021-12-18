import { BehaviorSubject } from 'rxjs';

export class LocalStorageService<T> {
    private _value = new BehaviorSubject(this.getInitialValue());
    value$ = this._value.asObservable();

    constructor(private _key: string, private _defaultValue: T) {}

    private getInitialValue(): T {
        try {
            const value = localStorage.getItem(this._key);

            return value ? (JSON.parse(value) as T) : this._defaultValue;
        } catch (error) {
            console.error(error);
        }

        return this._defaultValue;
    }

    setItem(newValue: T): void {
        const value = this._value.getValue();

        if (newValue === value) return;

        this._value.next(newValue);

        try {
            if (newValue === null) {
                localStorage.removeItem(this._key);
            } else {
                localStorage.setItem(this._key, JSON.stringify(newValue));
            }
        } catch (error) {
            console.error(error);
        }
    }
}
