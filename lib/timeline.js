const timelineElement = document.querySelector('.page.main > .timeline.container > .timeline');

const DRINK_HEIGHT = 18;
const TIME_RATIO = 0.00001;

class Timeline {
    collapse() {
        timelineElement.parentElement.classList.add('collapsed');
    }

    show() {
        timelineElement.parentElement.classList.remove('collapsed');
    }

    draw(now, inputDrinks, lifetimeDrinks) {
        if (inputDrinks.length === 0) {
            return;
        }

        this.show();

        this._computeCanvasSize(lifetimeDrinks);

        this._clear();

        this._startTime = inputDrinks[0].drink.startedAt;

        this._drinkTop = 0;
        this._currentStartTime = this._startTime;

        for (const inputDrink of inputDrinks) {
            this._drawDrink(inputDrink.drink.startedAt, inputDrink.drink.endsAt, String(inputDrink.index + 1));
        }

        this._drawSeparator();

        this._currentStartTime = this._startTime;

        for (const lifetimeDrink of lifetimeDrinks) {
            this._drawDrink(lifetimeDrink.virtualStartedAt, lifetimeDrink.endsAt, String(lifetimeDrink.index + 1), lifetimeDrink.isEffective ? 'red' : undefined);
        }

        this._drawTime(now, 'red');
    }

    _clear() {
        timelineElement.innerHTML = '';
    }

    _computeCanvasSize(lifetimeDrinks) {
        const startTime = lifetimeDrinks[0].startedAt;
        let endTime;

        for (const lifetimeDrink of lifetimeDrinks) {
            if (endTime === undefined || lifetimeDrink.endsAt > endTime) {
                endTime = lifetimeDrink.endsAt;
            }
        }

        let width = (endTime - startTime) * TIME_RATIO;
        const height = (lifetimeDrinks.length * 2 + 1) * (DRINK_HEIGHT + 1) - 1;

        if (width < timelineElement.parentElement.clientWidth) {
            width = timelineElement.parentElement.clientWidth;
        }

        timelineElement.width = `${width}px`;
        timelineElement.height = `${height}px`;

        timelineElement.style.width = `${width}px`;
        timelineElement.style.height = `${height}px`;
    }

    _drawDrink(startAt, endAt, text, fillStyle) {
        const x = Math.floor((startAt - this._currentStartTime) * TIME_RATIO);
        const y = Math.floor(this._drinkTop);
        const width = Math.floor((endAt - startAt) * TIME_RATIO);
        const height = DRINK_HEIGHT;

        const element = document.createElement('div');

        if (fillStyle) {
            element.style.backgroundColor = fillStyle;
        }
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;

        element.innerText = text;

        timelineElement.appendChild(element);

        this._drinkTop += DRINK_HEIGHT + 1;
    }

    _drawTime(dt) {
        const x = Math.floor((dt - this._currentStartTime) * TIME_RATIO) + 0.5;

        const element = document.createElement('div');

        element.className = 'now';
        element.style.left = `${x}px`;
        element.style.top = 0;
        element.style.width = '0.5px';
        element.style.height = `${timelineElement.clientHeight}px`;

        timelineElement.appendChild(element);
    }

    _drawSeparator() {
        const y = Math.floor(this._drinkTop + (DRINK_HEIGHT / 2)) + 0.5;

        const element = document.createElement('div');

        element.className = 'separator';
        element.style.left = 0;
        element.style.top = `${y}px`;
        element.style.width = `${timelineElement.clientWidth}px`;
        element.style.height = '0.5px';

        timelineElement.appendChild(element);

        this._drinkTop += DRINK_HEIGHT + 1;
    }
}

export const timeline = new Timeline();
