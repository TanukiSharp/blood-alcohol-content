import { addEventListener, bindToLabel, MILLISECONDS_PER_HOUR } from '../lib/utils.js';

export class DrinkComponent {
    constructor(quantity, alcoholPercentage, startedAt, userRemoveFunc, valueChangedFunc) {
        this._userRemoveFunc = userRemoveFunc
        this._valueChangedFunc = valueChangedFunc;

        this._disposeFunctions = [];
        this._createElements();

        this._quantityElement.value = quantity;
        this._alcoholPercentageElement.value = alcoholPercentage;
        this._startedAtElement.value = startedAt;

        this.setTimeToZero(0, 0);
    }

    get quantity() {
        return Number(this._quantityElement.value);
    }

    get alcoholPercentage() {
        return Number(this._alcoholPercentageElement.value);
    }

    get startedAt() {
        return this._startedAtElement.value;
    }

    get rootElement() {
        return this._rootContainerElement;
    }

    isValid(now) {
        if (this.quantity <= 0 || this.alcoholPercentage <= 0) {
            return false;
        }

        const startedAt = new Date(this.startedAt).getTime();

        if (startedAt > now) {
            return false;
        }

        return true;
    }

    setDrinkNumber(num) {
        this._quantityLabelElement.innerText = `Drink ${num} quantity:`;
    }

    evaluateParameters(now) {
        if (this.isValid(now) === false) {
            this._rootContainerElement.style.backgroundColor = '#edf';
            return false;
        } else {
            this._rootContainerElement.style.removeProperty('background-color');
            return true;
        }
    }

    setEliminationRatio(ratio) {
        this._timeToZeroProgressElement.style.width = `${ratio * 100}%`;

        if (ratio >= 1) {
            this._rootContainerElement.classList.add('done');
        } else {
            this._rootContainerElement.classList.remove('done');
        }
    }

    setTimeToZero(now, timeToZero) {
        const startedAt = new Date(this._startedAtElement.value).getTime();

        const endOfZero = now + timeToZero * MILLISECONDS_PER_HOUR;
        const ratioOfZero = Math.min((now - startedAt) / (endOfZero - startedAt), 1);
        this._timeToZeroProgressElement.style.width = `${ratioOfZero * 100}%`;

        if (ratioOfZero >= 1) {
            this._rootContainerElement.classList.add('done');
        } else {
            this._rootContainerElement.classList.remove('done');
        }
    }

    _delete() {
        const cancellable = {
            isCancelled: false,
        }

        this._userRemoveFunc?.(cancellable);

        if (cancellable.isCancelled) {
            this._deleteButtonElement.disabled = false;
            return;
        }

        for (const disposeFunction of this._disposeFunctions) {
            disposeFunction();
        }

        this._rootContainerElement.parentElement.removeChild(this._rootContainerElement);

        this._valueChangedFunc?.();
    }

    _createElements() {
        this._rootContainerElement = document.createElement('div');
        this._rootContainerElement.className = 'drink-root container';

        // ---

        this._quantityLabelElement = document.createElement('label');
        this._quantityLabelElement.className = 'quantity label';
        this._quantityLabelElement.innerText = 'Drink quantity:';
        this._rootContainerElement.appendChild(this._quantityLabelElement);

        this._quantityElement = document.createElement('input');
        this._quantityElement.className = 'quantity value';
        this._quantityElement.type = 'number';
        bindToLabel(this._quantityLabelElement, this._quantityElement);
        addEventListener(this._disposeFunctions, this._quantityElement, 'input', () => this._valueChangedFunc?.());
        this._rootContainerElement.appendChild(this._quantityElement);

        const quantityHintElement = document.createElement('span');
        quantityHintElement.className = 'quantity hint';
        quantityHintElement.innerText = 'in L';
        this._rootContainerElement.appendChild(quantityHintElement);

        // ---

        const alcoholPercentageLabelElement = document.createElement('label');
        alcoholPercentageLabelElement.className = 'alcohol-percentage label';
        alcoholPercentageLabelElement.innerText = 'Alcohol percentage:';
        this._rootContainerElement.appendChild(alcoholPercentageLabelElement);

        this._alcoholPercentageElement = document.createElement('input');
        this._alcoholPercentageElement.className = 'alcohol-percentage value';
        this._alcoholPercentageElement.type = 'number';
        bindToLabel(alcoholPercentageLabelElement, this._alcoholPercentageElement);
        addEventListener(this._disposeFunctions, this._alcoholPercentageElement, 'input', () => this._valueChangedFunc?.());
        this._rootContainerElement.appendChild(this._alcoholPercentageElement);

        const alcoholPercentageHintElement = document.createElement('span');
        alcoholPercentageHintElement.className = 'alcohol-percentage hint';
        alcoholPercentageHintElement.innerText = 'in %';
        this._rootContainerElement.appendChild(alcoholPercentageHintElement);

        // ---

        const startedAtLabelElement = document.createElement('label');
        startedAtLabelElement.className = 'started-at label';
        startedAtLabelElement.innerText = 'Started at:';
        this._rootContainerElement.appendChild(startedAtLabelElement);

        this._startedAtElement = document.createElement('input');
        this._startedAtElement.className = 'started-at value';
        this._startedAtElement.type = 'datetime-local';
        bindToLabel(startedAtLabelElement, this._startedAtElement);
        addEventListener(this._disposeFunctions, this._startedAtElement, 'input', () => this._valueChangedFunc?.());
        this._rootContainerElement.appendChild(this._startedAtElement);

        // ---

        const timeToZeroLabelElement = document.createElement('span');
        timeToZeroLabelElement.className = 'time-to zero label';
        timeToZeroLabelElement.innerText = 'Time to zero:';
        this._rootContainerElement.appendChild(timeToZeroLabelElement);

        const timeToZeroProgressContainerElement = document.createElement('div');
        timeToZeroProgressContainerElement.className = 'time-to zero progress-container';
        this._rootContainerElement.appendChild(timeToZeroProgressContainerElement);

        this._timeToZeroProgressElement = document.createElement('div');
        this._timeToZeroProgressElement.className = 'time-to zero progress-bar';
        timeToZeroProgressContainerElement.appendChild(this._timeToZeroProgressElement);

        // ---

        const deleteButtonContentElement = document.createElement('div');
        deleteButtonContentElement.innerText = '⚔️';

        this._deleteButtonElement = document.createElement('button');
        this._deleteButtonElement.className = 'delete';
        this._deleteButtonElement.type = 'button';
        this._deleteButtonElement.appendChild(deleteButtonContentElement);
        this._deleteButtonElement.title = 'Delete current drink';
        addEventListener(this._disposeFunctions, this._deleteButtonElement, 'click', () => {
            this._deleteButtonElement.disabled = true;
            setTimeout(() => this._delete(), 1);
        });
        this._rootContainerElement.appendChild(this._deleteButtonElement);
    }
}
