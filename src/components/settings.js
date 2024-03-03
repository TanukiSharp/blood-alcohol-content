import { AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE, MALE_RHO_FACTOR, FEMALE_RHO_FACTOR } from '../lib/bac.js';
import { bindElementToLocalStorage } from '../lib/utils.js';
import { pagesController } from '../pagesController.js';

const VERSION = 0;

const DEFAULT_BODY_WEIGHT = 50;
const DEFAULT_DRIVING_LIMIT = 0.1;

class SettingsComponent {
    constructor() {
        this._setupElements();
        console.log('------ SettingsComponent constructor ------');
    }

    get bodyWeight() {
        return this._bodyWeight;
    }

    get rhoFactor() {
        return this._rhoFactor;
    }

    get alcoholEliminationRate() {
        return this._alcoholEliminationRate;
    }

    get drivingLimit() {
        return this._drivingLimit;
    }

    setCloseFunction(onClose) {
        this._onClose = onClose;
    }

    _setupElements() {
        this._setupVersion();
        this._setupCloseButton();

        this._setupBodyWeight();
        this._setupRhoFactor();
        this._setupAlcoholEliminationRate();
        this._setupDrivingLimit();

        this._setupDefaultRhoFactors();
        this._setupDefaultAlcoholEliminationRate();
    }

    _setupVersion() {
        const versionElement = document.querySelector('.page.settings > .header > .version');
        versionElement.innerText = `version ${VERSION}`;
    }

    _setupCloseButton() {
        const closeButtonElement = document.querySelector('.page.settings > .header > .close');

        closeButtonElement.addEventListener('click', () => {
            pagesController.showMain();
            this._onClose?.();
            this._onClose = undefined;
        });
    }

    _setupBodyWeight() {
        const bodyWeightElement = document.querySelector('.page.settings > .variables > .body-weight.value');

        bindElementToLocalStorage(
            'settings:body-weight',
            bodyWeightElement,
            DEFAULT_BODY_WEIGHT,
            x => Number(x),
            newValue => this._bodyWeight = newValue,
        );
    }

    _setupRhoFactor() {
        const rhoFactorElement = document.querySelector('.page.settings > .variables > .rho-factor.value');

        bindElementToLocalStorage(
            'settings:rho-factor',
            rhoFactorElement,
            FEMALE_RHO_FACTOR,
            x => Number(x),
            newValue => this._rhoFactor = newValue,
        );
    }

    _setupAlcoholEliminationRate() {
        const alcoholEliminationRateElement = document.querySelector('.page.settings > .variables > .alcohol-elimination-rate.value');

        bindElementToLocalStorage(
            'settings:alcohol-elimination-rate',
            alcoholEliminationRateElement,
            AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE,
            x => Number(x),
            newValue => this._alcoholEliminationRate = newValue,
        );
    }

    _setupDrivingLimit() {
        const drivingLimitElement = document.querySelector('.page.settings > .variables > .driving-limit.value');

        bindElementToLocalStorage(
            'settings:driving-limit',
            drivingLimitElement,
            DEFAULT_DRIVING_LIMIT,
            x => Number(x),
            newValue => this._drivingLimit = newValue,
        );
    }

    _setupDefaultRhoFactors() {
        const maleElement = document.querySelector('.page.settings > .info > .rho-factor > .for-male > .default-value');
        maleElement.innerText = String(MALE_RHO_FACTOR);

        const femaleElement = document.querySelector('.page.settings > .info > .rho-factor > .for-female > .default-value');
        femaleElement.innerText = String(FEMALE_RHO_FACTOR);
    }

    _setupDefaultAlcoholEliminationRate() {
        const alcoholEliminationRateElement = document.querySelector('.page.settings > .info > .alcohol-elimination-rate > .for-human > .default-value');
        alcoholEliminationRateElement.innerText = String(AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE);
    }
}

export const settingsComponent = new SettingsComponent();
