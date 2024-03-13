import { MILLISECONDS_PER_HOUR } from './utils.js';

/**
 * Average human alcohol elimination rate, in g/L/hour.
 */
export const AVERAGE_HUMAN_ALCOHOL_ELIMINATION_RATE = 0.148;

/**
 * Rho factor for male, in L/kg.
 */
export const MALE_RHO_FACTOR = 0.71;

/**
 * Rho factor for female, in L/kg.
 */
export const FEMALE_RHO_FACTOR = 0.58;

/**
 * Volumic mass of ethanol, in kg/L.
 */
const ALCOHOL_VOLUMIC_MASS = 0.798;

/**
 *
 * @param {number} drinkQuantity Volume of the drink in L.
 * @param {number} alcoholPercentage
 * @returns {number} The mass of pure alcohol, in grams.
 */
const computeAlcoholMass = function(drinkQuantity, alcoholPercentage) {
    return drinkQuantity * (alcoholPercentage / 100.0) * ALCOHOL_VOLUMIC_MASS * 1000;
};

/**
 *
 * @param {number} alcoholMass Alcohol mass in grams.
 * @param {Number} distributionVolume Distribution volume in L.
 * @returns {number} Blood alcohol concentration in g/L.
 */
const computeAlcoholConcentration = function(alcoholMass, distributionVolume) {
    return alcoholMass / distributionVolume;
};

/**
 *
 * @param {number} bloodAlcoholConcentration Blood alcohol concentration in g/L.
 * @param {number} alcoholEliminationRate Alcohol elimination rate, in g/L/hour.
 * @param {number} elapsedTime Elapsed time in hours.
 * @returns {number} Blood alcohol concentration at a given time, in g/L.
 */
const computeBloodAlcoholConcentrationAtTime = function(bloodAlcoholConcentration, alcoholEliminationRate, elapsedTime) {
    return Math.max(0, bloodAlcoholConcentration - (elapsedTime * alcoholEliminationRate));
};

/**
 *
 * @param {number} bloodAlcoholConcentration Blood alcohol concentration in g/L.
 * @param {number} alcoholEliminationRate Alcohol elimination rate, in g/L/hour.
 * @returns {number} Time to 0 blood alcohol concentration, in hours.
 */
const computeTimeToZeroBloodAlcoholConcentration = function(bloodAlcoholConcentration, alcoholEliminationRate) {
    return bloodAlcoholConcentration / alcoholEliminationRate;
};

export class Options {
    /**
     *
     * @param {number} bodyWeight Body weight, in kg.
     * @param {number} rhoFactor Rho factor, in L/kg.
     * @param {number} alcoholEliminationRate Alcohol elimination rate, in g/L/hour.
     * @param {number} drivingLimit The limit at which you are still allowed to drive, in g/L.
     */
    constructor(bodyWeight, rhoFactor, alcoholEliminationRate, drivingLimit) {
        this.bodyWeight = bodyWeight;
        this.rhoFactor = rhoFactor;
        this.alcoholEliminationRate = alcoholEliminationRate;
        this.drivingLimit = drivingLimit;
    }
}

export class Drink {
    /**
     * @param {number} quantity Quantity in L.
     * @param {number} alcoholPercentage
     * @param {number} startedAt Started at, in milliseconds since UNIX epoc.
     */
    constructor(quantity, alcoholPercentage, startedAt) {
        this.quantity = quantity;
        this.alcoholPercentage = alcoholPercentage;
        this.startedAt = startedAt;
    }
}

export class LifetimeDrink {
    /**
     * @param {number} bloodAlcoholConcentration Blood alcohol concentration, in g/L.
     * @param {number} startedAt Started at, in milliseconds since UNIX epoc.
     * @param {number} endAt The time the drink is supposed to be fully eliminated, in milliseconds since UNIX epoc.
     */
    constructor(bloodAlcoholConcentration, startedAt, endAt) {
        this.bloodAlcoholConcentration = bloodAlcoholConcentration;
        this.startedAt = startedAt;
        this.endAt = endAt;
    }
}

/**
 * @param {LifetimeDrink[]} lifetimeDrinks
 */
const lineupLifetimeDrink = function(lifetimeDrinks) {
    for (let i = 1; i < lifetimeDrinks.length; i += 1) {
        if (lifetimeDrinks[i].startedAt < lifetimeDrinks[i - 1].endAt) {
            const duration = lifetimeDrinks[i].endAt - lifetimeDrinks[i].startedAt;
            lifetimeDrinks[i].startedAt = lifetimeDrinks[i - 1].endAt;
            lifetimeDrinks[i].endAt = lifetimeDrinks[i].startedAt + duration;
        }
    }
};

/**
 *
 * @param {Drink[]} drinks Array of Drink instances.
 * @param {number} now Current time, in milliseconds since UNIX epoc.
 * @param {Options} options Computation options.
 * @returns
 */
export const computeBloodAlcoholConcentration = function(drinks, now, options) {
    if (options.bodyWeight <= 0 || options.rhoFactor <= 0 || options.alcoholEliminationRate <= 0) {
        return null;
    }

    const distributionVolume = options.bodyWeight * options.rhoFactor;

    const effectiveSortedDrinks = drinks
        .filter(x => x.quantity > 0 && x.alcoholPercentage > 0 && x.startedAt < now)
        .sort((lhs, rhs) => lhs.startedAt - rhs.startedAt);

    const lifetimeDrinks = [];

    for (const drink of effectiveSortedDrinks) {
        const alcoholMass = computeAlcoholMass(drink.quantity, drink.alcoholPercentage);
        const bloodAlcoholConcentration = computeAlcoholConcentration(alcoholMass, distributionVolume);

        const timeToZero = computeTimeToZeroBloodAlcoholConcentration(bloodAlcoholConcentration, options.alcoholEliminationRate);
        const endAt = drink.startedAt + (timeToZero * MILLISECONDS_PER_HOUR);

        lifetimeDrinks.push(new LifetimeDrink(bloodAlcoholConcentration, drink.startedAt, endAt));
    }

    lineupLifetimeDrink(lifetimeDrinks);

    let totalBloodAlcoholConcentration = 0;
    const drinkEliminationRatios = [];
    let firstEffectiveDrinkTime = -1;

    for (const drink of lifetimeDrinks) {
        if (drink.endAt < now) {
            drinkEliminationRatios.push(1);
            continue;
        }

        if (firstEffectiveDrinkTime < 0) {
            firstEffectiveDrinkTime = drink.startedAt;
        }

        totalBloodAlcoholConcentration += drink.bloodAlcoholConcentration;

        if (drink.startedAt > now) {
            drinkEliminationRatios.push(0);
            continue;
        }

        const eliminationRatio = (now - drink.startedAt) / (drink.endAt - drink.startedAt);
        drinkEliminationRatios.push(eliminationRatio);
    }

    const elapsedTime = (now - firstEffectiveDrinkTime) / MILLISECONDS_PER_HOUR;
    const bloodAlcoholConcentrationAtTime = computeBloodAlcoholConcentrationAtTime(totalBloodAlcoholConcentration, options.alcoholEliminationRate, elapsedTime);

    const timeToLimit = computeTimeToZeroBloodAlcoholConcentration(Math.max(0, bloodAlcoholConcentrationAtTime - options.drivingLimit), options.alcoholEliminationRate);
    const timeToZero = computeTimeToZeroBloodAlcoholConcentration(bloodAlcoholConcentrationAtTime, options.alcoholEliminationRate);





    // const elapsedTime = (now - firstDrinkTime) / MILLISECONDS_PER_HOUR;
    // const bloodAlcoholConcentrationAtTime = computeBloodAlcoholConcentrationAtTime(totalBloodAlcoholConcentration, options.alcoholEliminationRate, elapsedTime);

    // const timeToLimit = computeTimeToZeroBloodAlcoholConcentration(Math.max(0, bloodAlcoholConcentrationAtTime - options.drivingLimit), options.alcoholEliminationRate);
    // const timeToZero = computeTimeToZeroBloodAlcoholConcentration(bloodAlcoholConcentrationAtTime, options.alcoholEliminationRate);

    // const drinkEliminationRatio = [];

    // let eliminated = totalBloodAlcoholConcentration - bloodAlcoholConcentrationAtTime;

    // for (const bloodAlcoholConcentration of bloodAlcoholConcentrations) {
    //     if (eliminated > 0) {
    //         drinkEliminationRatio.push(Math.min(eliminated / bloodAlcoholConcentration, 1));
    //     } else {
    //         drinkEliminationRatio.push(0);
    //     }

    //     eliminated -= bloodAlcoholConcentration;
    // }

    return {
        bloodAlcoholConcentration: bloodAlcoholConcentrationAtTime,
        timeToLimit,
        timeToZero,
        drinkEliminationRatios,
    };
};
