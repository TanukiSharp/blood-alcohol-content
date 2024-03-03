class LocalStorage {
    constructor(namespace) {
        this._namespace = namespace;
    }

    getItem(key) {
        const realKey = `${this._namespace}::${key}`;
        const rawValue = localStorage.getItem(realKey);

        if (rawValue === null) {
            return null;
        }

        return JSON.parse(rawValue);
    }

    setItem(key, value) {
        const realKey = `${this._namespace}::${key}`;
        const jsonValue = JSON.stringify(value);

        localStorage.setItem(realKey, jsonValue);
    }
}

export const localStorageEx = new LocalStorage('bac-calculator');
