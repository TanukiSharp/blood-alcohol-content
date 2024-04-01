class PagesController {
    constructor() {
        this._loadingContainerElement = document.querySelector('.page.loading');
        this._mainContainerElement = document.querySelector('.page.main');
        this._settingsContainerElement = document.querySelector('.page.settings');
    }

    hideLoading() {
        this._loadingContainerElement.classList.add('collapsed');
    }

    showMain() {
        this._mainContainerElement.classList.remove('collapsed');
        this._settingsContainerElement.classList.add('collapsed');
    }

    showSettings() {
        this._mainContainerElement.classList.add('collapsed');
        this._settingsContainerElement.classList.remove('collapsed');
    }
}

export const pagesController = new PagesController();
