import { DrinkComponent } from './drink.js';
import { localStorageEx } from '../lib/localStorage.js';
import { toDateTimeInputElementString, round, toHumanReadableTime, toDateTime } from '../lib/utils.js';
import { Drink, Options, computeBloodAlcoholConcentration } from '../lib/bac.js';
import { settingsComponent } from './settings.js';
import { pagesController } from '../pagesController.js';

const DEBUG = false;

class MainComponent {
    constructor() {
        const debugCanvas = document.querySelector('.page.main > .debug');
        this._debug = debugCanvas.getContext('2d');
        this._debugTime = 0;
        this._debugPrevBac = -1;
        this._debug.canvas.width = this._debug.canvas.clientWidth;
        this._debug.canvas.height = this._debug.canvas.clientHeight;
        this._debugNow = (new Date(2024, 2, 10, 22, 16, 55)).getTime();

        this._drinks = [];
        this._setupElements();
        this._loadDrinks();
        this._recompute();

        if (DEBUG) {
            this._debugNow = (new Date(2024, 2, 10, 22, 16, 55)).getTime();
            for (let i = 0; i < 800; i += 1) {
                this._recompute();
                this._debugNow += 1000;
            }
        } else {
            this._debugNow = Date.now();
            setInterval(() => this._recompute(), 1000);
        }
    }

    _setupElements() {
        this._drinksContainer = document.querySelector('.page.main > .drinks.container');

        this._setupShowSettingsButton();
        this._setupAddDrinkButton();

        this._setupAlcoholBloodConcentrationElement();
        this._setupTimeToLimitElement();
        this._setupTimeToZeroElement();
    }

    _setupShowSettingsButton() {
        const settingsButtonElement = document.querySelector('.page.main > .toolbar.container > .show-settings');

        settingsButtonElement.addEventListener('click', () => {
            settingsComponent.setCloseFunction(() => {
                this._updateTimeToLimitHint();
                this._recompute();
            });
            pagesController.showSettings();
        });
    }

    _onDrinkValueChanged() {
        this._saveDrinks();
        this._recompute();
    }

    _addDrink(quantity, alcoholPercentage, startedAt) {
        let drink;

        const onRemove = () => {
            const index = this._drinks.indexOf(drink);
            this._drinks.splice(index, 1);
            this._numberDrinks();
            this._saveDrinks();
        };

        drink = new DrinkComponent(quantity, alcoholPercentage, startedAt, onRemove, () => this._onDrinkValueChanged());

        this._drinks.push(drink);
        this._drinksContainer.appendChild(drink.rootElement);

        this._numberDrinks();
    }

    _setupAddDrinkButton() {
        const addDrinkButton = document.querySelector('.page.main > .toolbar.container > .add-drink');

        addDrinkButton.addEventListener('click', () => {
            this._addDrink(undefined, undefined, toDateTimeInputElementString(new Date()));
            this._saveDrinks();
        });
    }

    _setupAlcoholBloodConcentrationElement() {
        this._alcoholBloodConcentrationValueElement = document.querySelector('.page.main > .output.bac > .value');
    }

    _setupTimeToLimitElement() {
        this._timeToLimitContainerElement = document.querySelector('.page.main > .output.time-to.limit');

        this._timeToLimitValueElement = document.querySelector('.page.main > .output.time-to.limit > .value');

        this._timeToLimitHintElement = document.querySelector('.page.main > .output.time-to.limit > .hint');
        this._updateTimeToLimitHint();
    }

    _updateTimeToLimitHint() {
        if (settingsComponent.drivingLimit > 0) {
            this._timeToLimitHintElement.innerText = `(${settingsComponent.drivingLimit} g/L)`;
            this._timeToLimitContainerElement.style.removeProperty('display');
        } else {
            this._timeToLimitContainerElement.style.display = 'none';
        }
    }

    _setupTimeToZeroElement() {
        this._timeToZeroValueElement = document.querySelector('.page.main > .output.time-to.zero > .value');
    }

    _recompute() {
        const bodyWeight = settingsComponent.bodyWeight;
        const rhoFactor = settingsComponent.rhoFactor;
        const alcoholEliminationRate = settingsComponent.alcoholEliminationRate;
        const drivingLimit = settingsComponent.drivingLimit;

        const options = new Options(
            bodyWeight,
            rhoFactor,
            alcoholEliminationRate,
            drivingLimit
        );

        let now;
        if (DEBUG) {
            now = this._debugNow;
        } else {
            now = Date.now();
        }

        const drinks = [];

        for (const drinkComponent of this._drinks) {
            drinkComponent.evaluateParameters(now);
            drinkComponent.setEliminationRatio(0);

            drinks.push(new Drink(
                drinkComponent.quantity,
                drinkComponent.alcoholPercentage,
                new Date(drinkComponent.startedAt).getTime(),
            ));
        }

        const result = computeBloodAlcoholConcentration(drinks, now, options);

        if (result === null) {
            return;
        }

        for (let i = 0; i < result.drinkEliminationRatios.length; i += 1) {
            this._drinks[i].setEliminationRatio(result.drinkEliminationRatios[i]);
        }

        if (this._debugPrevBac < 0) {
            this._debugPrevBac = result.bloodAlcoholConcentration;
        }

        const bacResolution = 200;
        this._debug.moveTo(this._debugTime, this._debug.canvas.clientHeight - this._debugPrevBac * bacResolution - 1);
        this._debugTime += 1.5;
        this._debug.lineTo(this._debugTime, this._debug.canvas.clientHeight - result.bloodAlcoholConcentration * bacResolution - 1);
        this._debug.stroke();
        this._debugPrevBac = result.bloodAlcoholConcentration;

        this._alcoholBloodConcentrationValueElement.innerText = round(result.bloodAlcoholConcentration, 2);

        this._timeToLimitValueElement.innerText = this._timeToDisplayString(result.timeToLimit);
        this._timeToZeroValueElement.innerText = this._timeToDisplayString(result.timeToZero);
    }

    _timeToDisplayString(timeTo) {
        if (timeTo <= 0) {
            return '-';
        }

        return `${toHumanReadableTime(timeTo)} (at ${toDateTime(timeTo)})`
    }

    _numberDrinks() {
        for (let i = 0; i < this._drinks.length; i += 1) {
            this._drinks[i].setDrinkNumber(i + 1);
        }
    }

    _loadDrinks() {
        const drinks = localStorageEx.getItem('main:drinks');

        if (drinks === undefined || drinks === null || drinks.length === 0) {
            return;
        }

        for (const drink of drinks) {
            this._addDrink(drink.quantity, drink.alcoholPercentage, drink.startedAt);
        }
    }

    _saveDrinks() {
        const drinks = [];

        for (const drink of this._drinks) {
            drinks.push({
                quantity: drink.quantity,
                alcoholPercentage: drink.alcoholPercentage,
                startedAt: drink.startedAt,
            });
        }

        localStorageEx.setItem('main:drinks', drinks);
    }
}

new MainComponent();
