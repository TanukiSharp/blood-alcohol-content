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

        this.STARTED_AT_FOR_HUMANS = new Date(startedAt);
    }
}

export class LifetimeDrink {
    /**
     * @param {number} bloodAlcoholConcentration Blood alcohol concentration, in g/L.
     * @param {number} startedAt Started at, in milliseconds since UNIX epoc.
     * @param {number} endsAt The time the drink is supposed to be fully eliminated, in milliseconds since UNIX epoc.
     * @param {number} index The index of the original drink.
     */
    constructor(bloodAlcoholConcentration, startedAt, endsAt, index) {
        this.bloodAlcoholConcentration = bloodAlcoholConcentration;
        this.startedAt = startedAt;
        this.virtualStartedAt = startedAt;
        this.endsAt = endsAt;
        this.virtualEndsAt = endsAt;
        this.index = index;
    }
}

/**
 * @param {LifetimeDrink[]} lifetimeDrinks
 */
const lineupLifetimeDrinks = function(lifetimeDrinks) {
    if (lifetimeDrinks.length <= 0) {
        return;
    }

    lifetimeDrinks[0].dependsOnPrevious = false;

    for (let i = 1; i < lifetimeDrinks.length; i += 1) {
        if (lifetimeDrinks[i].startedAt < lifetimeDrinks[i - 1].virtualEndsAt) {
            const duration = lifetimeDrinks[i].endsAt - lifetimeDrinks[i].startedAt;
            lifetimeDrinks[i].virtualStartedAt = lifetimeDrinks[i - 1].endsAt;
            lifetimeDrinks[i].virtualEndsAt = lifetimeDrinks[i].virtualStartedAt + duration;
            lifetimeDrinks[i].dependsOnPrevious = true;
        } else {
            lifetimeDrinks[i].dependsOnPrevious = false;
        }
    }
};

/**
 * @param {LifetimeDrink[]} lifetimeDrinks
 */
const setEffectiveDrinks = function(now, lifetimeDrinks) {
    for (let i = 0; i < lifetimeDrinks.length; i += 1) {
        lifetimeDrinks[i].isEffective = false;
    }

    for (let i = 0; i < lifetimeDrinks.length; i += 1) {
        if (lifetimeDrinks[i].virtualStartedAt <= now && now <= lifetimeDrinks[i].virtualEndsAt) {
            for (let j = i; j < lifetimeDrinks.length; j += 1) {
                lifetimeDrinks[j].isEffective = lifetimeDrinks[j].startedAt <= now || lifetimeDrinks[j].virtualStartedAt <= now;
            }
            for (let j = i - 1; j >= 0; j -= 1) {
                if (lifetimeDrinks[j + 1].dependsOnPrevious) {
                    lifetimeDrinks[j].isEffective = true;
                } else {
                    break;
                }
            }

            break;
        }
    }
};

const createEmptyResult = function() {
    return {
        bloodAlcoholConcentration: 0,
        timeToLimit: 0,
        timeToZero: 0,
        lifetimeDrinks: [],
    };
};

/**
 *
 * @param {Drink[]} drinks Array of Drink instances.
 * @param {number} now Current time, in milliseconds since UNIX epoc.
 * @param {Options} options Computation options.
 * @returns
 */
export const computeBloodAlcoholConcentration = function(drinks, now, options) {
    if (drinks.length === 0 || options.bodyWeight <= 0 || options.rhoFactor <= 0 || options.alcoholEliminationRate <= 0) {
        return createEmptyResult();
    }

    const distributionVolume = options.bodyWeight * options.rhoFactor;

    const sortedDrinks = drinks
        .map((drink, index) => ({ drink, index }))
        .sort((lhs, rhs) => lhs.drink.startedAt - rhs.drink.startedAt);

    const lifetimeDrinks = [];

    for (const drinkObject of sortedDrinks) {
        const alcoholMass = computeAlcoholMass(drinkObject.drink.quantity, drinkObject.drink.alcoholPercentage);
        const bloodAlcoholConcentration = computeAlcoholConcentration(alcoholMass, distributionVolume);

        const timeToZero = computeTimeToZeroBloodAlcoholConcentration(bloodAlcoholConcentration, options.alcoholEliminationRate);
        const endsAt = drinkObject.drink.startedAt + (timeToZero * MILLISECONDS_PER_HOUR);

        lifetimeDrinks.push(new LifetimeDrink(bloodAlcoholConcentration, drinkObject.drink.startedAt, endsAt, drinkObject.index));
    }

    lineupLifetimeDrinks(lifetimeDrinks);
    setEffectiveDrinks(now, lifetimeDrinks);

    let totalBloodAlcoholConcentration = 0;
    let firstEffectiveDrinkTime = -1;

    for (const lifetimeDrink of lifetimeDrinks) {
        if (lifetimeDrink.isEffective === false) {
            continue;
        }

        if (firstEffectiveDrinkTime < 0) {
            firstEffectiveDrinkTime = lifetimeDrink.startedAt;
        }

        totalBloodAlcoholConcentration += lifetimeDrink.bloodAlcoholConcentration;
    }

    const elapsedTime = (now - firstEffectiveDrinkTime) / MILLISECONDS_PER_HOUR;
    const bloodAlcoholConcentrationAtTime = computeBloodAlcoholConcentrationAtTime(totalBloodAlcoholConcentration, options.alcoholEliminationRate, elapsedTime);

    const timeToLimit = computeTimeToZeroBloodAlcoholConcentration(Math.max(0, bloodAlcoholConcentrationAtTime - options.drivingLimit), options.alcoholEliminationRate);
    const timeToZero = computeTimeToZeroBloodAlcoholConcentration(bloodAlcoholConcentrationAtTime, options.alcoholEliminationRate);

    return {
        bloodAlcoholConcentration: bloodAlcoholConcentrationAtTime,
        timeToLimit,
        timeToZero,
        lifetimeDrinks,
    };
};
