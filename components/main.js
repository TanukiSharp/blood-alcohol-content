import { DrinkComponent } from './drink.js';
import { localStorageEx } from '../lib/localStorage.js';
import { toDateTimeInputElementString, round, toHumanReadableTime, toDateTime } from '../lib/utils.js';
import { Drink, Options, computeBloodAlcoholConcentration } from '../lib/bac.js';
import { settingsComponent } from './settings.js';
import { pagesController } from '../pagesController.js';

class MainComponent {
    constructor() {
        this._drinks = [];
        this._setupElements();
        this._loadDrinks();
        this._recompute();

        setInterval(() => this._recompute(), 1000);
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
        this._timeToLimitValueElement = document.querySelector('.page.main > .output.time-to.limit > .value');

        this._timeToLimitHintElement = document.querySelector('.page.main > .output.time-to.limit > .hint');
        this._updateTimeToLimitHint();
    }

    _updateTimeToLimitHint() {
        this._timeToLimitHintElement.innerText = `(${settingsComponent.drivingLimit} g/L)`;
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

        const now = Date.now();

        const drinks = [];

        for (const drinkComponent of this._drinks) {
            drinkComponent.evaluateStartedAt(now);

            drinks.push(new Drink(
                drinkComponent.quantity,
                drinkComponent.alcoholPercentage,
                new Date(drinkComponent.startedAt).getTime(),
            ));
        }

        const result = computeBloodAlcoholConcentration(drinks, now, options);

        for (let i = 0; i < result.drinkTimeToZeroResults.length; i += 1) {
            this._drinks[i].setTimeToZero(now, result.drinkTimeToZeroResults[i]);
        }

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
