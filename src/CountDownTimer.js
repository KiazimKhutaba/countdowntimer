/**
 * CountDownTimer class
 *
 */
function CountDownTimer(duration, granularity) {
    this.duration = duration; // duration of timer in seconds
    this.granularity = granularity || 1000; // tick interval
    this.running = false; // flag that indicates is timer running
    this.onStopCallback = undefined; // callback function which will be called when timer stopped
    this.tickFunctions = []; // callback functions for tick events
}


CountDownTimer.prototype.onTick = function (callback) {
    if (typeof callback == 'function') {
        this.tickFunctions.push(callback);
    }

    return this;
};

/**
 * Converts hh:mm:ss time format to seconds
 *
 */
CountDownTimer.toSeconds = function (str) {

    let timeParts = str.split(':');
    let hours, minutes, seconds;

    // if time string consists only from two elements
    // we suppose that first value from left to right it's minutes and seconds
    // value is next
    if (timeParts.length === 2) {
        [minutes, seconds] = timeParts;
        return (+minutes) * 60 + (+seconds);
    } else {
        // split time format into array
        [hours, minutes, seconds] = timeParts;
    }

    // convert string presentation to integer (add plus sign before variable for converting from string to number)
    return (+hours) * 3600 + (+minutes) * 60 + (+seconds);
};


/**
 * Convert number of seconds to time object
 *
 * @param seconds
 * @returns {{seconds: number, minutes: number}}
 */
CountDownTimer.toTimeObject = function (seconds) {

    if (seconds <= 3599) {
        return {
            minutes: (seconds / 60) | 0, // extract minutes part
            seconds: (seconds % 60) | 0  // extract seconds part
        };
    }

    return {
        hours: (seconds / 3600) | 0,       // extract hour part and round to integer by using bitwise |
        minutes: ((seconds / 60) | 0) % 60, // extract minutes part
        seconds: (seconds % 60) | 0        // extract seconds part
    };
};


/**
 * Format time by adding leading 0 if time part less than ten
 *
 * @param time object
 * @returns {string} formatted string
 */
CountDownTimer.addLeadingZero = function (time) {

    let hours, minutes, seconds;

    // for hh:mm:ss format
    if (time.hours) {
        hours = time.hours < 10 ? '0' + time.hours : time.hours;
        minutes = time.minutes < 10 ? '0' + time.minutes : time.minutes;
        seconds = time.seconds < 10 ? '0' + time.seconds : time.seconds;

        return hours + ':' + minutes + ':' + seconds;
    } else {
        //for mm:ss format
        minutes = time.minutes < 10 ? '0' + time.minutes : time.minutes;
        seconds = time.seconds < 10 ? '0' + time.seconds : time.seconds;

        return minutes + ':' + seconds;
    }

};

/**
 * Convert number of seconds to hh:mm:ss format string
 */
CountDownTimer.prototype.format = function (seconds) {
    return CountDownTimer.addLeadingZero(CountDownTimer.toTimeObject(seconds));
};


/**
 * Start CountDownTimer
 *
 */
CountDownTimer.prototype.start = function () {
    // if timer is running simply return from it
    if (this.running) {
        return;
    }

    this.running = true;
    let that = this, diff;

    (function timer() {
        diff = that.duration--;

        if (diff > 0) {
            setTimeout(timer, that.granularity);
        } else {
            diff = 0;
            that.running = false;
            if (that.onStopCallback) that.onStopCallback.call(that);
            return;
        }

        that.tickFunctions.forEach(function (callback) {
            callback.call(this, diff);
        }, that);

    }());
};

/**
 * Adds callback for timer stop event
 *
 * @param callback
 * @returns {CountDownTimer}
 */
CountDownTimer.prototype.onStop = function (callback) {
    this.onStopCallback = callback;
    return this;
};


/**
 * We run under Node.js
 */
//if( window === 'undefined' )
exports.CountDownTimer = CountDownTimer;
