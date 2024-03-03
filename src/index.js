import './components/main.js';
import './components/settings.js';
import pagesController from './pagesController.js';




// const recompute = function() {
//     const bodyWeightValue = Number(bodyWeight.value);
//     const genderIndex = gender.selectedIndex;
//     const eliminationRateValue = Number(eliminationRate.value);
//     const drivingLimitValue = Number(drivingLimit.value);

//     const drinkQuantityValue = Number(drinkQuantity.value);
//     const drinkPercentValue = Number(drinkPercent.value);
//     const elapsedTimeValue = Number(elapsedTime.value);

//     const rhoFactor = genderIndex === GENDER_MALE ? maleRhoFactor.value : femaleRhoFactor.value;

//     const options = new Options(
//         bodyWeightValue,
//         rhoFactor,
//         eliminationRateValue,
//         drivingLimitValue
//     );

//     const result = computeBloodAlcoholConcentration(
//         [
//             new Drink(drinkQuantityValue, drinkPercentValue, elapsedTimeValue),
//             // new Drink(0.33, 5, 0),
//             // new Drink(0.33, 5, 0),
//             // new Drink(0.15, 12, 0),
//         ],
//         options
//     );

//     outputBloodAlcoholConcentration.innerText = `${round(result.bloodAlcoholConcentration, 2)} g/L`;
//     outputTimeToLimit.innerText = `${toHumanReadableTime(result.timeToLimit)} (at ${toDateTime(result.timeToLimit)})`;
//     outputTimeToZero.innerText = `${toHumanReadableTime(result.timeToZero)} (at ${toDateTime(result.timeToZero)})`;
// };

const main = function() {
    pagesController.showMain();
    pagesController.hideLoading();
};

main();
