export class DrinkComponent {
    constructor(userRemoveFunc) {
        this._userRemoveFunc = userRemoveFunc
        this._disposeFunctions = [];
        this._createElements();
    }

    get quantity() {
        return Number(this._quantityElement.value);
    }

    get rootElement() {
        return this._rootContainerElement;
    }

    _delete() {
        for (const disposeFunction of this._disposeFunctions) {
            disposeFunction();
        }
        this._rootContainerElement.parentElement.removeChild(this._rootContainerElement);
        this._userRemoveFunc?.();
    }

    _createElements() {
        this._rootContainerElement = document.createElement('div');
        this._rootContainerElement.className = 'drink-root-container';

        // ---

        const quantityLabelElement = document.createElement('label');
        quantityLabelElement.className = 'quantity label';
        quantityLabelElement.setAttribute('for', 'quantityElement');
        quantityLabelElement.innerText = 'Drink quantity:';
        this._rootContainerElement.appendChild(quantityLabelElement);

        this._quantityElement = document.createElement('input');
        this._quantityElement.className = 'quantity value';
        this._quantityElement.id = 'quantityElement';
        this._quantityElement.type = 'number';
        this._rootContainerElement.appendChild(this._quantityElement);

        const quantityHintElement = document.createElement('span');
        quantityHintElement.className = 'quantity hint';
        quantityHintElement.innerText = 'in liters (L)';
        this._rootContainerElement.appendChild(quantityHintElement);

        // ---

        const alcoholPercentageLabelElement = document.createElement('label');
        alcoholPercentageLabelElement.className = 'alcohol-percentage label';
        alcoholPercentageLabelElement.setAttribute('for', 'alcoholPercentageElement');
        alcoholPercentageLabelElement.innerText = 'Alcohol percentage:';
        this._rootContainerElement.appendChild(alcoholPercentageLabelElement);

        this._alcoholPercentageElement = document.createElement('input');
        this._alcoholPercentageElement.className = 'alcohol-percentage value';
        this._alcoholPercentageElement.id = 'alcoholPercentageElement';
        this._alcoholPercentageElement.type = 'number';
        this._rootContainerElement.appendChild(this._alcoholPercentageElement);

        const alcoholPercentageHintElement = document.createElement('span');
        alcoholPercentageHintElement.className = 'alcohol-percentage hint';
        alcoholPercentageHintElement.innerText = 'in %';
        this._rootContainerElement.appendChild(alcoholPercentageHintElement);

        // ---

        const startedAtLabelElement = document.createElement('label');
        startedAtLabelElement.className = 'started-at label';
        startedAtLabelElement.setAttribute('for', 'startedAtElement');
        startedAtLabelElement.innerText = 'Started at:';
        this._rootContainerElement.appendChild(startedAtLabelElement);

        this._startedAtElement = document.createElement('input');
        this._startedAtElement.className = 'started-at value';
        this._startedAtElement.id = 'startedAtElement';
        this._startedAtElement.type = 'datetime';
        this._rootContainerElement.appendChild(this._startedAtElement);

        const startedAtHintElement = document.createElement('span');
        startedAtHintElement.className = 'started-at hint';
        this._rootContainerElement.appendChild(startedAtHintElement);

        // ---

        const timeToLimitLabelElement = document.createElement('span');
        timeToLimitLabelElement.className = 'time-to limit label';
        timeToLimitLabelElement.innerText = 'Time to limit:';
        this._rootContainerElement.appendChild(timeToLimitLabelElement);

        const timeToLimitProgressContainerElement = document.createElement('div');
        timeToLimitProgressContainerElement.className = 'time-to limit progress container';
        this._rootContainerElement.appendChild(timeToLimitProgressContainerElement);

        this._timeToLimitProgressElement = document.createElement('div');
        this._timeToLimitProgressElement.className = 'time-to limit progress bar';
        timeToLimitProgressContainerElement.appendChild(this._timeToLimitProgressElement);

        // ---

        const timeToZeroLabelElement = document.createElement('span');
        timeToZeroLabelElement.className = 'time-to zero label';
        timeToZeroLabelElement.innerText = 'Time to zero:';
        this._rootContainerElement.appendChild(timeToZeroLabelElement);

        const timeToZeroProgressContainerElement = document.createElement('div');
        timeToZeroProgressContainerElement.className = 'time-to zero progress container';
        this._rootContainerElement.appendChild(timeToZeroProgressContainerElement);

        this._timeToZeroProgressElement = document.createElement('div');
        this._timeToZeroProgressElement.className = 'time-to zero progress bar';
        timeToZeroProgressContainerElement.appendChild(this._timeToZeroProgressElement);

        // ---

        this._deleteButtonElement = document.createElement('button');
        this._deleteButtonElement.className = 'delete';
        this._deleteButtonElement.innerText = '❌';
        this._deleteButtonElement.title = 'Delete current drink';
        const onDeleteButtonClicked = () => {
            this._deleteButtonElement.disabled = true;
            setTimeout(() => this._delete(), 1);
        };
        this._deleteButtonElement.addEventListener('click', onDeleteButtonClicked);
        this._disposeFunctions.push(() => this._deleteButtonElement.removeEventListener('click', onDeleteButtonClicked));
        this._rootContainerElement.appendChild(this._deleteButtonElement);
    }
}
