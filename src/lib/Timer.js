class Timer {
    constructor(fn, delay, ...params) {
        this.id = setTimeout(fn, delay, ...params);
        this.endTime = new Date().getTime() + delay;
    }

    getId() {
        return this.id;
    }

    getRemainingTime() {
        const remainingTime = this.endTime - new Date().getTime();
        return remainingTime > 0 ? remainingTime : 0;
    }
}

module.exports = Timer;