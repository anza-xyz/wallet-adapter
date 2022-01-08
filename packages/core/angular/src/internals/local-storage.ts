import { BehaviorSubject } from 'rxjs';

const getInitialValue = <T>(key: string): T | null => {
    try {
        const value = localStorage.getItem(key);

        return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
        console.error(error);
    }

    return null;
};

export class LocalStorageSubject<T> extends BehaviorSubject<T | null> {
    constructor(private _key: string) {
        super(getInitialValue<T>(_key));
    }

    next(value: T | null): void {
        try {
            if (value === null) {
                localStorage.removeItem(this._key);
            } else {
                localStorage.setItem(this._key, JSON.stringify(value));
            }
        } catch (error) {
            console.error(error);
        }

        super.next(value);
    }
}
