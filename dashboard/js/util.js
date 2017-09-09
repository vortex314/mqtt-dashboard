function timeString() {

    // multiply by 1000 because Date() requires miliseconds
    var date = new Date();
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    var SSS = date.getMilliseconds();
    // If you were building a timestamp instead of a duration, you would uncomment the following line to get 12-hour (not 24) time
    // if (hh > 12) {hh = hh % 12;}
    // These lines ensure you have two-digits
    if (hh < 10) { hh = "0" + hh; }
    if (mm < 10) { mm = "0" + mm; }
    if (ss < 10) { ss = "0" + ss; }
    if (SSS < 100) {
        if (SSS < 10) {
            SSS = "00" + SSS;
        } else {
            SSS = "0" + SSS;
        }
    }
    // This formats your string to HH:MM:SS
    var t = hh + ":" + mm + ":" + ss + ',' + SSS;
    return t;
}



function log_stack() {
    var stack = new Error().stack;
    console.log("PRINTING CALL STACK");
    console.log(stack);
}

function log(s) {
    console.log(" I " + timeString() + " | " + s);
    //    $('#log').html(new Date() + " | " + s);
}

function warn(s) {
    console.error("W " + timeString() + " | " + s);
    //    $('#log').html(new Date() + " | " + s);
}



function findAngularScope(mySelector) {
    return angular.element($(mySelector)).scope();
}

function hasField(obj, field) {
    return typeof obj[field] != "undefined";
}

function intToField(value, offset, length) {
    field = value >> offset;
    field = field & ((1 << length) - 1);
    return field;
}

function fieldToInt(field, offset, length) {
    v = field & ((1 << length) - 1);
    //     v = field * Math.pow(2, offset);
    v = v * Math.pow(2, offset);
    return v;
}

function isUndefined(v) {
    return typeof v == "undefined";
}