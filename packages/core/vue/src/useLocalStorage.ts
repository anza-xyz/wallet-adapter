import { customRef, Ref } from 'vue'

export default function<T> (key: string, defaultValue: T | null = null): Ref<T | null> {
    return customRef<T | null>((track, trigger) => ({
        get: () => {
            track()
            const value = localStorage.getItem(key)
            return value ? JSON.parse(value) : defaultValue
        },
        set: value => {
            if (value === null) {
                localStorage.removeItem(key)
            } else {
                localStorage.setItem(key, JSON.stringify(value))
            }
            trigger()
        },
    }))
}
