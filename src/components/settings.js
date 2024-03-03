import { AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE, MALE_RHO_FACTOR, FEMALE_RHO_FACTOR } from '../lib/bac.js';
import { bindElementToLocalStorage } from '../lib/utils.js';
import pagesController from '../pagesController.js';

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

    get eliminationRate() {
        return this._eliminationRate;
    }

    get drivingLimit() {
        return this._drivingLimit;
    }

    _setupElements() {
        this._setupCloseButton();

        this._setupBodyWeight();
        this._setupRhoFactor();
        this._setupEliminationRate();
        this._setupDrivingLimit();

        this._setupDefaultRhoFactors();
        this._setupDefaultEliminationRate();
    }

    _setupCloseButton() {
        const closeButtonElement = document.querySelector('.page.settings > .close');

        closeButtonElement.addEventListener('click', () => {
            pagesController.showMain();
        });
    }

    _setupBodyWeight() {
        const bodyWeightElement = document.querySelector('.page.settings > .variables > .body-weight.value');

        bindElementToLocalStorage(
            'settings::body-weight',
            bodyWeightElement,
            DEFAULT_BODY_WEIGHT,
            x => Number(x),
            newValue => this._bodyWeight = newValue,
        );
    }

    _setupRhoFactor() {
        const rhoFactorElement = document.querySelector('.page.settings > .variables > .rho-factor.value');

        bindElementToLocalStorage(
            'settings::rho-factor',
            rhoFactorElement,
            FEMALE_RHO_FACTOR,
            x => Number(x),
            newValue => this._rhoFactor = newValue,
        );
    }

    _setupEliminationRate() {
        const eliminationRateElement = document.querySelector('.page.settings > .variables > .elimination-rate.value');

        bindElementToLocalStorage(
            'settings::elimination-rate',
            eliminationRateElement,
            AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE,
            x => Number(x),
            newValue => this._eliminationRate = newValue,
        );
    }

    _setupDrivingLimit() {
        const drivingLimitElement = document.querySelector('.page.settings > .variables > .driving-limit.value');

        bindElementToLocalStorage(
            'settings::driving-limit',
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

    _setupDefaultEliminationRate() {
        const eliminationRateElement = document.querySelector('.page.settings > .info > .elimination-rate > .for-human > .default-value');
        eliminationRateElement.innerText = String(AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE);
    }
}

export const settingsComponent = new SettingsComponent();
