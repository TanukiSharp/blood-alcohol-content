const fakeDateTimeInput = document.querySelector('.page.main > .toolbar.container > .debug.time');

export class Time {
    // static now() {
    //     return Date.now()
    // }

    static now() {
        const meh = fakeDateTimeInput.value || Date.now();
        return new Date(meh);
    }
}
