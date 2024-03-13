# Overview

> [!CAUTION]
> If you ran into this project by mistake, DO NTO use it, it has a severe issue.

This project is a web-based blood alcohol content calculator.

Most of information needed to understand the (easy) math can be found here: https://en.wikipedia.org/wiki/Blood_alcohol_content

⚠️ Please have a look at the warning section at the end of this document.

## Web application

The web application can be found here: https://tanukisharp.github.io/blood-alcohol-content

## How to run (for developers)

When working locally for development purpose, just spawn a local web server where the `index.js` is located and open a browser to the hosting address and port.

## How to use (for users)

### Settings

The first thing to do is to do a bit of setup. For that, click on the settings button.

![Settings button](./docs/settings-button.png)

Then set your `Body weight`, and your `Rho factor`. The women average is 0.58 and the men average is 0.71, as indicated on the settings page.

As for the `Alcohol elimination rate`, you can let the default value, unless you know what you are doing.

You can also set the `Driving limit` to the regulation value where you drive, but feel free to set it lower if you want.

Your settings are stored in the browser's local storage, so if you refresh the page or close it and reopen it later, your settings are maintained, but if you use another browser or uninstall it and reinstall it, or clean it's local storage data, you will have to setup the application again.

### Main page

Then add a drink by clicking on the following button:

![Add drink button](./docs/add-drink-button.png)

A drink entry appears below. Set the `Drink quantity`, in liters, and the `Alcohol percentage` in percentage of alcohol contained in the drink.

When a drink is added, the `Started at` date and time are automatically set to now, but you can tweak it if you started to drink before entering values.

Click on the crossed swords button to remove a drink.

![Remove drink button](./docs/remove-drink-button.png)

On a drink entry, the `Time to zero` is the progression of the alcohol elimination. When the bar is full, the alcohol contained in the drink is completely eliminated by your body, and the entry turns green. At this moment, you can remove it, because it does not affect your alcohol concentration anymore.

Note that a drink with the `Started at` value set in the future turns purple, and is not taken into account to compute your alcohol concentration.

An effective drink has a blue background.

Also note that drink data is stored in the browser's local storage alongside your settings, so this data remain if you refresh the page or close and reopen your browser.

At the top of the page, there are three main textual indicators and hereafter are their descriptions.

`Alcohol concentration`

This represents the amount of pure alcohol in your blood at the moment, in grams of pure alcohol per liter of blood. Of course this is not entirely true, because people drink overtime, and even if you drink bottoms up, it takes a bit of time for alcohol to be absorbed, so this value makes more sense in the long run.

`Time to limit`

This represents the time until your alcohol concentration reaches the `Driving limit` you have set in the settings page. In short, this tells you when you can drive.

The driving limit value set in the settings page is indicated in parentheses beside the `Time to limit` value.

Note that if you set this limit to zero or lower, the `Time to limit` indicator disappears from the page.

`Time to zero`

This represents the time until your alcohol concentration reaches zero grams of alcohol per liter of blood. In other words, this is when your body fully eliminated all the alcohol you have drunk.

At this time, all the drink entries below should be green, and you can remove them all and drive safely.

Hereafter is an example of the main page:

![Main page](./docs/main-page.png)

## ⚠️ Warning ⚠️

Remember that this application and computations behind are for indication purpose and cannot be in anyway perfectly accurate.

Drive carefully, and simply avoid driving after drinking.
