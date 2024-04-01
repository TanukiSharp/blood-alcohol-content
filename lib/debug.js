const debugCanvas = document.querySelector('.debug');
const ctx = debugCanvas.getContext('2d');

const DRINK_HEIGHT = 12;

const TIME_RATIO = 0.00002;

export class Debug {
    clear() {
        debugCanvas.width = debugCanvas.clientWidth;
        debugCanvas.height = debugCanvas.clientHeight;

        this._drinkTop = 0;

        ctx.clearRect(0, 0, debugCanvas.width, debugCanvas.height);
    }

    startDrawDrinks(startTime) {
        this._startTime = startTime;
    }

    drawDrink(startAt, endAt, text, fillStyle) {
        const x = (startAt - this._startTime) * TIME_RATIO;
        const y = this._drinkTop;
        const width = (endAt - startAt) * TIME_RATIO;
        const height = DRINK_HEIGHT;

        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.rect(x + 0.5, y + 0.5, width, height);
        ctx.fillStyle = fillStyle ?? '#eeeeee';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.fillText(text, x + 2.5, y + DRINK_HEIGHT - 2.5);

        this._drinkTop += DRINK_HEIGHT;
    }

    drawTime(dt, color) {
        const x = (dt - this._startTime) * TIME_RATIO + 0.5;

        ctx.beginPath();
        ctx.moveTo(x, 0.5);
        ctx.lineTo(x, debugCanvas.height);
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    drawSeparator() {
        const y = (this._drinkTop + (DRINK_HEIGHT / 2)) + 0.5;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(debugCanvas.width + 0.5, y);
        ctx.strokeStyle = 'black';
        ctx.stroke();

        this._drinkTop += DRINK_HEIGHT;
    }
}
