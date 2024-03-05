import './components/main.js';
import './components/settings.js';
import { pagesController } from './pagesController.js';

const main = function() {
    pagesController.showMain();
    pagesController.hideLoading();
};

main();
