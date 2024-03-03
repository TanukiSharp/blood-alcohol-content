import { DrinkComponent } from './drink.js';
import pagesController from '../pagesController.js';

class MainComponent {
    constructor() {
        this._setupElements();
        this._drinks = [];
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

    _setupAddDrinkButton() {
        const addDrinkButton = document.querySelector('.page.main > .add-drink');

        addDrinkButton.addEventListener('click', () => {
            let drink;

            const onRemove = () => {
                const index = this._drinks.indexOf(drink);
                this._drinks.splice(index, 1);
            };

            drink = new DrinkComponent(onRemove);

            this._drinks.push(drink);
            this._drinksContainer.appendChild(drink.rootElement);
        });
    }
}

new MainComponent();
