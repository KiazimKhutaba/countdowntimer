/**
 * CountDown Class
 *
 * @param duration    - accept duration in hh:mm:ss or mm:ss string format
 * @param granularity - tick interval
 * @constructor
 */
function CountDownTimer(duration, granularity) {

    // before starting we should remember which kind of
    // time format we are see hh:mm:ss or mm:ss
    // depending on this format script will print formatted string
    // so if we have 00:05:09 it will print 00:05:08 etc. with leading '00'
    this.time_format = this.getTimeFormat(duration);

    this.duration = this.toSeconds(duration); // duration of timer work in seconds
    this.granularity = granularity || 1000; // tick interval ( how often we should call out timer)
    this.running = false; // flag that indicates  if timer is running
    this.onStopCallback = undefined; // callback function which will be called when timer shall stop
    this.tickFunctions = []; // callback functions for tick events
}

/**
 * HH:MM:SS time format constant
 *
 * @type {string}
 */
CountDownTimer.TIME_FORMAT_HHMMSS = 'hh:mm:ss';

/**
 * MM:SS time format constant
 *
 * @type {string}
 */
CountDownTimer.TIME_FORMAT_MMSS = 'mm:ss';


/**
 * Return time string format comparing timeStr argument
 * with predefined regex patterns
 *
 * @param timeStr
 * @returns {string}
 */
CountDownTimer.prototype.getTimeFormat = function( timeStr )
{
    let formats = [ /^\d{2}:\d{2}:\d{2}$/, /^\d{2}:\d{2}$/ ];

    // check for hh:mm:ss
    if( formats[0].test(timeStr) ) {
        return CountDownTimer.TIME_FORMAT_HHMMSS;
    }

    // mm:ss
    if( formats[1].test(timeStr) ) {
        return CountDownTimer.TIME_FORMAT_MMSS;
    }

    // if no matches found throw error
    throw new Error('Unsupported time format!');
};


CountDownTimer.prototype.onTick = function (callback) {
    if (typeof callback == 'function') {
        this.tickFunctions.push(callback);
    }

    return this;
};

/**
 * Converts hh:mm:ss|mm:ss time format to seconds
 *
 */
CountDownTimer.prototype.toSeconds = function (str) {

    let timeParts = str.split(':');
    let hours, minutes, seconds;


    if ( this.time_format === CountDownTimer.TIME_FORMAT_MMSS  ) {
        [minutes, seconds] = timeParts;
        return (+minutes) * 60 + (+seconds);
    }

    if ( this.time_format === CountDownTimer.TIME_FORMAT_HHMMSS ) {
        [hours, minutes, seconds] = timeParts;
    }

    // convert string time format to integer (add plus sign before variable for converting from string to number)
    return (+hours) * 3600 + (+minutes) * 60 + (+seconds);
};


/**
 * Convert number of seconds to time object
 *
 * @param seconds
 * @returns {{seconds: number, minutes: number}}
 */
CountDownTimer.prototype.toTimeObject = function (seconds) {

    //if (seconds <= 3599) {
    if ( this.time_format === CountDownTimer.TIME_FORMAT_MMSS ) {
        return {
            minutes: (seconds / 60) | 0, // extract minutes part
            seconds: (seconds % 60) | 0  // extract seconds part
        };
    }

    return {
        hours: (seconds / 3600) | 0,        // extract hour part and round to integer by using bitwise |
        minutes: ((seconds / 60) | 0) % 60, // extract minutes part
        seconds: (seconds % 60) | 0         // extract seconds part
    };
};



/**
 * Format time by adding leading 0 if time part less than ten
 *
 * @param time object
 * @returns {string} formatted string
 */
CountDownTimer.prototype.zeroPad = function (time) {

    let pad = (value) => value < 10 ? '0' + value : value;
    let _time = [];

    for( let prop in time ) {
        if( time.hasOwnProperty(prop) ) _time.push(pad(time[prop]));
    }

    return _time.join(':');
};

/**
 * Convert number of seconds to hh:mm:ss format string
 */
CountDownTimer.prototype.format = function (seconds) {
    return this.zeroPad(this.toTimeObject(seconds));
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

        if (diff >= 0) {
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
 * throws error in browsers
 */
//if( window === 'undefined' )
exports.CountDownTimer = CountDownTimer;
