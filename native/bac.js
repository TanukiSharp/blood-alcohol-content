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
 * @param {number} drinkQuantity Volume of the drink in liters.
 * @param {number} alcoholPercentage
 * @returns {number} The mass of pure alcohol, in grams.
 */
const computeAlcoholMass = function(drinkQuantity, alcoholPercentage) {
    return drinkQuantity * (alcoholPercentage / 100.0) * ALCOHOL_VOLUMIC_MASS * 1000;
};

/**
 *
 * @param {number} alcoholMass Alcohol mass in grams.
 * @param {Number} distributionVolume Distribution volume in liters.
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
    return bloodAlcoholConcentration - (elapsedTime * alcoholEliminationRate);
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
     * @param {number} bodyWeight Body weight, in kilograms.
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
     *
     * @param {number} quantity Quantity in liters.
     * @param {number} alcoholPercentage
     * @param {number} elapsedTime Elapsed time in hours.
     */
    constructor(quantity, alcoholPercentage, elapsedTime) {
        this.quantity = quantity;
        this.alcoholPercentage = alcoholPercentage;
        this.elapsedTime = elapsedTime;
    }
}

/**
 *
 * @param {Drink[]} drinks Array of Drink instances.
 * @param {Options} options Computation options.
 * @returns
 */
export const computeBloodAlcoholConcentration = function(drinks, options) {
    const distributionVolume = options.bodyWeight * options.rhoFactor;

    let totalBloodAlcoholConcentration = 0;

    for (const drink of drinks) {
        const alcoholMass = computeAlcoholMass(drink.quantity, drink.alcoholPercentage);
        const bloodAlcoholConcentration = computeAlcoholConcentration(alcoholMass, distributionVolume);
        const bloodAlcoholConcentrationAtTime = computeBloodAlcoholConcentrationAtTime(bloodAlcoholConcentration, options.alcoholEliminationRate, drink.elapsedTime);

        totalBloodAlcoholConcentration += bloodAlcoholConcentrationAtTime;
    }

    const timeToLimit = computeTimeToZeroBloodAlcoholConcentration(Math.max(totalBloodAlcoholConcentration - options.drivingLimit, 0), options.alcoholEliminationRate);
    const timeToZero = computeTimeToZeroBloodAlcoholConcentration(totalBloodAlcoholConcentration, options.alcoholEliminationRate);

    return {
        bloodAlcoholConcentration: Math.max(totalBloodAlcoholConcentration, 0),
        timeToLimit,
        timeToZero
    };
};
