import { MILLISECONDS_PER_HOUR } from './utils.js';

const timelineElement = document.querySelector('.page.main > .timeline.container > .timeline');

const DRINK_HEIGHT = 18;
const TIME_RATIO = 0.00001;

const INEFFECTIVE_DRINK_COLOR = '#ddffe8';
const EFFECTIVE_DRINK_COLOR = '#ddf8ff';
const INVALID_DRINK_COLOR = '#eeddff';

const MARGINS = 2;

class Timeline {
    collapse() {
        timelineElement.parentElement.classList.add('collapsed');
    }

    show() {
        timelineElement.parentElement.classList.remove('collapsed');
    }

    draw(now, timeToLimit, lifetimeDrinks) {
        if (lifetimeDrinks.length === 0) {
            this.collapse();
            return;
        }

        this.show();

        this._computeTimelineSize(lifetimeDrinks);

        this._clear();

        this._startTime = lifetimeDrinks[0].startedAt;

        this._drinkTop = 0;
        this._currentStartTime = this._startTime;

        for (const lifetimeDrink of lifetimeDrinks) {
            this._drawDrink(
                lifetimeDrink.startedAt,
                lifetimeDrink.endsAt,
                String(lifetimeDrink.index + 1),
                this._getBackgroundColor(lifetimeDrink)
            );
        }

        this._drawSeparator();

        this._currentStartTime = this._startTime;

        for (const lifetimeDrink of lifetimeDrinks) {
            this._drawDrink(
                lifetimeDrink.virtualStartedAt,
                lifetimeDrink.virtualEndsAt,
                String(lifetimeDrink.index + 1),
                this._getBackgroundColor(lifetimeDrink)
            );
        }

        const dtToLimit = now + (timeToLimit * MILLISECONDS_PER_HOUR);
        this._drawTime(dtToLimit, 'time-to-limit');

        this._drawTime(now, 'now');
    }

    _getBackgroundColor(lifetimeDrink) {
        if (lifetimeDrink.isValid === false) {
            return INVALID_DRINK_COLOR;
        }
        if (lifetimeDrink.isEffective === false) {
            return INEFFECTIVE_DRINK_COLOR;
        }
        return EFFECTIVE_DRINK_COLOR;
    }

    _clear() {
        timelineElement.innerHTML = '';
    }

    _computeTimelineSize(lifetimeDrinks) {
        const startTime = lifetimeDrinks[0].startedAt;
        let endTime;

        for (const lifetimeDrink of lifetimeDrinks) {
            if (endTime === undefined || lifetimeDrink.virtualEndsAt > endTime) {
                endTime = lifetimeDrink.virtualEndsAt;
            }
        }

        let width = (endTime - startTime) * TIME_RATIO + (MARGINS * 2);
        const height = (lifetimeDrinks.length * 2 + 1) * (DRINK_HEIGHT + 1) + (MARGINS * 2) - 1;

        if (width < timelineElement.parentElement.clientWidth) {
            width = timelineElement.parentElement.clientWidth;
        }

        timelineElement.width = `${width}px`;
        timelineElement.height = `${height}px`;

        timelineElement.style.width = `${width}px`;
        timelineElement.style.height = `${height}px`;
    }

    _drawDrink(startAt, endAt, text, fillStyle) {
        const x = Math.floor((startAt - this._currentStartTime) * TIME_RATIO) + MARGINS;
        const y = Math.floor(this._drinkTop) + MARGINS;
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

        element.style.paddingLeft = this._computeDrinkPadding(width);

        element.innerText = text;

        timelineElement.appendChild(element);

        this._drinkTop += DRINK_HEIGHT + 1;
    }

    _computeDrinkPadding(width) {
        const padding = Math.min(4, Math.floor(width / 8));
        return `${padding}px`;
    }

    _drawTime(dt, className) {
        const x = Math.floor((dt - this._currentStartTime) * TIME_RATIO) + MARGINS;

        const element = document.createElement('div');

        element.className = className;
        element.style.left = `${x}px`;
        element.style.top = 0;
        element.style.width = '1.5px';
        element.style.height = `${timelineElement.clientHeight}px`;

        timelineElement.appendChild(element);
    }

    _drawSeparator() {
        const y = Math.floor(this._drinkTop + (DRINK_HEIGHT / 2)) + MARGINS;

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
