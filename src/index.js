import { Drink, computeBloodAlcoholConcentration, AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE, MALE_RHO_FACTOR, FEMALE_RHO_FACTOR, Options } from './bac.js';
import { DrinkComponent } from './drinkComponent.js';
import uiController from './uiController.js';

const bodyWeight = document.getElementsByClassName('body-weight')[0];
const gender = document.getElementsByClassName('gender')[0];

const maleRhoFactor = document.getElementsByClassName('male-rho-factor')[0];
const defaultMaleRhoFactor = document.getElementsByClassName('default-male-rho-factor')[0];
const femaleRhoFactor = document.getElementsByClassName('female-rho-factor')[0];
const defaultFemaleRhoFactor = document.getElementsByClassName('default-female-rho-factor')[0];
const eliminationRate = document.getElementsByClassName('elimination-rate')[0];
const defaultEliminationRate = document.getElementsByClassName('default-elimination-rate')[0];
const drivingLimit = document.getElementsByClassName('driving-limit')[0];

const drinkQuantity = document.getElementsByClassName('drink-quantity')[0];
const drinkPercent = document.getElementsByClassName('drink-percent')[0];
const elapsedTime = document.getElementsByClassName('elapsed-time')[0];

const drinksContainer = document.getElementsByClassName('drinks-container')[0];

const outputBloodAlcoholConcentration = document.getElementsByClassName('output-blood-alcohol-concentration')[0];
const outputTimeToLimit = document.getElementsByClassName('output-time-to-limit')[0];
const outputTimeToZero = document.getElementsByClassName('output-time-to-zero')[0];

const GENDER_MALE = 0;

/**
 *
 * @param {HTMLInputElement} control
 */
const initializeControl = function(control, defaultValue, onValueChanged) {
    const keyName = `control::${control.className}`;

    const value = localStorage.getItem(keyName) ?? defaultValue;

    if (value !== null && value !== undefined) {
        control.value = value;
    }

    control.addEventListener('input', () => {
        localStorage.setItem(keyName, control.value);
        onValueChanged?.();
    });
};

const initializeControls = function() {
    defaultEliminationRate.innerText = AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE.toString();
    defaultMaleRhoFactor.innerText = MALE_RHO_FACTOR.toString();
    defaultFemaleRhoFactor.innerText = FEMALE_RHO_FACTOR.toString();

    initializeControl(bodyWeight, undefined, recompute);
    initializeControl(gender, undefined, recompute);

    initializeControl(maleRhoFactor, MALE_RHO_FACTOR, recompute);
    initializeControl(femaleRhoFactor, FEMALE_RHO_FACTOR, recompute);
    initializeControl(eliminationRate, AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE, recompute);
    initializeControl(drivingLimit, undefined, recompute);
};

const toHumanReadableTime = function(hours) {
    const fullHours = Math.floor(hours);
    const minutesDecimals = hours - fullHours;
    const fullMinutes = Math.floor(60 * minutesDecimals).toString().padStart(2, '0');

    if (fullHours > 0) {
        return `${fullHours}h ${fullMinutes}m`;
    }

    return `${fullMinutes}m`;
};

const toDateTime = function(hours) {
    const newMs = Date.now() + (hours * 3600 * 1000);
    const newDate = new Date(newMs);

    const date = newDate.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = newDate.toLocaleTimeString('ja-JP');

    return `${date} ${time}`;
};

const round = function(value, digitCount) {
    const multiplier = Math.pow(10, digitCount);
    return Math.round(value * multiplier) / multiplier;
};

const createNewDrink = function() {
    const container = document.createElement('div');


    return
};

const recompute = function() {
    const bodyWeightValue = Number(bodyWeight.value);
    const genderIndex = gender.selectedIndex;
    const eliminationRateValue = Number(eliminationRate.value);
    const drivingLimitValue = Number(drivingLimit.value);

    const drinkQuantityValue = Number(drinkQuantity.value);
    const drinkPercentValue = Number(drinkPercent.value);
    const elapsedTimeValue = Number(elapsedTime.value);

    const rhoFactor = genderIndex === GENDER_MALE ? maleRhoFactor.value : femaleRhoFactor.value;

    const options = new Options(
        bodyWeightValue,
        rhoFactor,
        eliminationRateValue,
        drivingLimitValue
    );

    const result = computeBloodAlcoholConcentration(
        [
            new Drink(drinkQuantityValue, drinkPercentValue, elapsedTimeValue),
            // new Drink(0.33, 5, 0),
            // new Drink(0.33, 5, 0),
            // new Drink(0.15, 12, 0),
        ],
        options
    );

    outputBloodAlcoholConcentration.innerText = `${round(result.bloodAlcoholConcentration, 2)} g/L`;
    outputTimeToLimit.innerText = `${toHumanReadableTime(result.timeToLimit)} (at ${toDateTime(result.timeToLimit)})`;
    outputTimeToZero.innerText = `${toHumanReadableTime(result.timeToZero)} (at ${toDateTime(result.timeToZero)})`;
};

const main = function() {
    initializeControls();
    //recompute();

    let x = new DrinkComponent();
    drinksContainer.appendChild(x.rootElement);
    x = new DrinkComponent();
    drinksContainer.appendChild(x.rootElement);
    x = new DrinkComponent();
    drinksContainer.appendChild(x.rootElement);
};

main();
