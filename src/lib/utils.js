import { localStorageEx } from './localStorage.js';

export const toHumanReadableTime = function(hours) {
    const fullHours = Math.floor(hours);
    const minutesDecimals = hours - fullHours;
    const fullMinutes = Math.floor(60 * minutesDecimals).toString().padStart(2, '0');

    if (fullHours > 0) {
        return `${fullHours}h ${fullMinutes}m`;
    }

    return `${fullMinutes}m`;
};

export const toDateTime = function(hours) {
    const newMs = Date.now() + (hours * 3600 * 1000);
    const newDate = new Date(newMs);

    const date = newDate.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = newDate.toLocaleTimeString('ja-JP');

    return `${date} ${time}`;
};

export const toDateTimeInputElementString = function(date) {
    const dateParts = [
        String(date.getFullYear()),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ];

    const timeParts = [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
    ];

    return `${dateParts.join('-')}T${timeParts.join(':')}`;
}

export const round = function(value, digitCount) {
    const multiplier = Math.pow(10, digitCount);
    return Math.round(value * multiplier) / multiplier;
};

export const bindElementToLocalStorage = function(key, element, defaultValue, coercionFunc, onValueChanged) {
    const value = localStorageEx.getItem(key) ?? defaultValue;

    if (value !== null && value !== undefined) {
        element.value = value;
    }

    const onChanged = () => {
        const newValue = coercionFunc(element.value);
        localStorageEx.setItem(key, newValue);
        onValueChanged?.(newValue);
    };

    element.addEventListener('input', onChanged);
    onChanged();
};

export const addEventListener = function(disposeFuncs, element, eventType, callback) {
    element.addEventListener(eventType, callback);
    disposeFuncs.push(() => element.removeEventListener(eventType, callback));
}
