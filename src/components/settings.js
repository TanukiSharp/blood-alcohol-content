import pagesController from '../pagesController.js';

class SettingsComponent {
    constructor() {
        this._setupElements();
    }

    _setupElements() {
        this._setupCloseButton();
    }

    _setupCloseButton() {
        const closeButtonElement = document.querySelector('.page.settings > .close');

        closeButtonElement.addEventListener('click', () => {
            pagesController.showMain();
        });
    }
}

new SettingsComponent();
