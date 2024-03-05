class PagesController {
    constructor() {
        this._loadingContainerElement = document.querySelector('.page.loading');
        this._mainContainerElement = document.querySelector('.page.main');
        this._settingsContainerElement = document.querySelector('.page.settings');
    }

    hideLoading() {
        this._loadingContainerElement.style.display = 'none';
    }

    showMain() {
        this._mainContainerElement.style.removeProperty('display');
        this._settingsContainerElement.style.display = 'none';
    }

    showSettings() {
        this._mainContainerElement.style.display = 'none';
        this._settingsContainerElement.style.removeProperty('display');
    }
}

export const pagesController = new PagesController();
