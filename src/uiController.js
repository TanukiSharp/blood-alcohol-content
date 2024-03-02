class UiController {
    constructor() {
        this._mainContainerElement = document.querySelector('.page.main');
        this._settingsContainerElement = document.querySelector('.page.settings');

        this.showMain();

        console.log('------------- UiController constructor -----------------');
    }

    showMain() {
        this._mainContainerElement.style.display = undefined;
        this._settingsContainerElement.style.display = 'none';
    }

    showSettings() {
        this._mainContainerElement.style.display = 'none';
        this._settingsContainerElement.style.display = undefined;
    }
}

const uiController = new UiController();

export default uiController;
