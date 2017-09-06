function log(s) {
    console.log(new Date() + " | " + s);
    $('#log').html(new Date() + " | " + s);
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