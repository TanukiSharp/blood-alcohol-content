import { DrinkComponent } from './drink.js';
import { localStorageEx } from '../lib/localStorage.js';
import { toDateTimeInputElementString } from '../lib/utils.js';
import pagesController from '../pagesController.js';

class MainComponent {
    constructor() {
        this._drinks = [];
        this._setupElements();
        this._loadDrinks();
    }

    _setupElements() {
        this._drinksContainer = document.querySelector('.page.main > .drinks-container');

        this._setupShowSettingsButton();
        this._setupAddDrinkButton();
    }

    _setupShowSettingsButton() {
        const settingsButtonElement = document.querySelector('.page.main > .show-settings');

        settingsButtonElement.addEventListener('click', () => {
            pagesController.showSettings();
        });
    }

    /*
    const drinkQuantity = document.getElementsByClassName('drink-quantity')[0];
    const drinkPercent = document.getElementsByClassName('drink-percent')[0];
    const elapsedTime = document.getElementsByClassName('elapsed-time')[0];

    const outputBloodAlcoholConcentration = document.getElementsByClassName('output-blood-alcohol-concentration')[0];
    const outputTimeToLimit = document.getElementsByClassName('output-time-to-limit')[0];
    const outputTimeToZero = document.getElementsByClassName('output-time-to-zero')[0];
    */

    _onDrinkValueChanged() {
        this._saveDrinks();
    }

    _addDrink(quantity, alcoholPercentage, startedAt) {
        let drink;

        const onRemove = () => {
            const index = this._drinks.indexOf(drink);
            this._drinks.splice(index, 1);
            this._saveDrinks();
        };

        drink = new DrinkComponent(quantity, alcoholPercentage, startedAt, onRemove, () => this._onDrinkValueChanged());

        this._drinks.push(drink);
        this._drinksContainer.appendChild(drink.rootElement);
    }

    _setupAddDrinkButton() {
        const addDrinkButton = document.querySelector('.page.main > .add-drink');

        addDrinkButton.addEventListener('click', () => {
            this._addDrink(undefined, undefined, toDateTimeInputElementString(new Date()));
            this._saveDrinks();
        });
    }

    _loadDrinks() {
        const drinks = localStorageEx.getItem('drinks');

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

        localStorageEx.setItem('drinks', drinks);
    }
}

new MainComponent();
