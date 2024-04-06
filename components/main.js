import { DrinkComponent } from './drink.js';
import { localStorageEx } from '../lib/localStorage.js';
import { toDateTimeInputElementString, round, toHumanReadableTime, addHoursToDate } from '../lib/utils.js';
import { Drink, Options, computeBloodAlcoholConcentration } from '../lib/bac.js';
import { settingsComponent } from './settings.js';
import { pagesController } from '../pagesController.js';
import { timeline } from '../lib/timeline.js';

const VERSION = 7;

class MainComponent {
    constructor() {
        this._lastBloodAlcoholConcentration = 0;
        this._drinks = [];
        this._setupElements();
        this._loadDrinks();
        this._recompute();

        setInterval(() => this._recompute(), 1000);
    }

    _setupElements() {
        this._drinksContainer = document.querySelector('.page.main > .drinks.container');

        this._setupAddDrinkButton();
        this._setupVersion();
        this._setupShowSettingsButton();

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

    _setupVersion() {
        const versionElement = document.querySelector('.page.main > .toolbar.container > .version');
        versionElement.innerText = `version ${VERSION}`;
    }

    _onDrinkValueChanged() {
        this._saveDrinks();
        this._recompute();
    }

    _addDrink(quantity, alcoholPercentage, startedAt) {
        let drink;

        const onRemove = (cancellable) => {
            if (drink.isEffective && drink.isValid(Date.now())) {
                if (prompt('Are you sure you want to delete this drink ?\nIt may end up in a completely wrong computation.\n\nType \'yes\' to confirm drink deletion.')?.toLocaleLowerCase() !== 'yes') {
                    cancellable.isCancelled = true;
                    return;
                }
            }

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
            this._timeToLimitContainerElement.classList.remove('collapsed');
        } else {
            this._timeToLimitContainerElement.classList.add('collapsed');
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

        const now = Date.now();

        const drinks = [];

        for (const drinkComponent of this._drinks) {
            drinkComponent.setBloodAlcoholConcentration(0);
            drinkComponent.setIsEffective(false);
            drinkComponent.evaluateTimeAndEffectiveness(now);

            drinks.push(new Drink(
                drinkComponent.quantity,
                drinkComponent.alcoholPercentage,
                new Date(drinkComponent.startedAt).getTime()
            ));
        }

        const result = computeBloodAlcoholConcentration(drinks, now, options);

        for (const lifetimeDrink of result.lifetimeDrinks) {
            const sourceDrink = this._drinks[lifetimeDrink.index];

            sourceDrink.setBloodAlcoholConcentration(round(lifetimeDrink.bloodAlcoholConcentration, 3));
            sourceDrink.setIsEffective(lifetimeDrink.isEffective);
            sourceDrink.evaluateTimeAndEffectiveness(now);
        }

        this._lastBloodAlcoholConcentration = result.bloodAlcoholConcentration;

        this._alcoholBloodConcentrationValueElement.innerText = round(result.bloodAlcoholConcentration, 2);

        this._timeToLimitValueElement.innerText = this._timeToDisplayString(now, result.timeToLimit);
        this._timeToZeroValueElement.innerText = this._timeToDisplayString(now, result.timeToZero);

        timeline.draw(now, settingsComponent.drivingLimit <= 0 ? 0 : result.timeToLimit, result.lifetimeDrinks);
    }

    _timeToDisplayString(date, timeTo) {
        if (timeTo <= 0) {
            return '-';
        }

        return `${toHumanReadableTime(timeTo)} (at ${addHoursToDate(date, timeTo)})`
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
