/*! minibus - v3.1.0 - 2014-11-22
 * https://github.com/axelpale/minibus
 *
 * Copyright (c) 2014 Akseli Palen <akseli.palen@gmail.com>;
 * Licensed under the MIT license */

(function (root, factory) {
    'use strict';
    // UMD pattern commonjsStrict.js
    // https://github.com/umdjs/umd
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS & Node
        factory(exports);
    } else {
        // Browser globals
        factory((root.Minibus = {}));
    }
}(this, function (exports) {
    'use strict';

    // Minibus

    //**************
    // Constructor *
    //**************

    var Bus = function () {
        // event string -> sub route map
        this.eventMap = {};

        // route string -> route object
        this.routeMap = {};

        // free namespace shared between the event handlers on the bus.
        this.busContext = {};
    };

    exports.create = function () {
        return new Bus();
    };

    // For extendability.
    // Usage: Minibus.extension.myFunction = function (...) {...};
    exports.extension = Bus.prototype;



    //*******************
    // Helper functions *
    //*******************

    var isArray = function (v) {
        return Object.prototype.toString.call(v) === '[object Array]';
    };

    var isEmpty = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };



    //*************
    // Exceptions *
    //*************

    var InvalidEventStringError = function (eventString) {
        // Usage
        //   throw new InvalidEventStringError(eventString)
        this.name = 'InvalidEventStringError';
        this.message = 'Invalid event string given: ' + eventString;
    };

    var InvalidRouteStringError = function (routeString) {
        // Usage
        //   throw new InvalidRouteStringError(routeString)
        this.name = 'InvalidRouteStringError';
        this.message = 'Invalid route string given: ' + routeString;
    };

    var InvalidEventHandlerError = function (eventHandler) {
        // Usage
        //   throw new InvalidEventHandlerError(eventHandler)
        this.name = 'InvalidEventHandlerError';
        this.message = 'Invalid event handler function given: ' + eventHandler;
    };

    function findPropertyNameByRegex(o, r) {
        var list = [];
        for (var key in o) {
            if (r.match(key)) {
                list.push(key);
            }
        }
        if (list.length == 0)
            return undefined;
        else return list;
    };

    //*******************************************
    // Member functions. They all are mutators. *
    //*******************************************

    var _emit = function (eventString) {
        // Emit an event to execute the bound event handler functions.
        // The event handlers are executed immediately.
        //
        // Parameter
        //   eventString
        //     Event string or array of event strings.
        //   arg1 (optional)
        //     Argument to be passed to the handler functions.
        //   arg2 (optional)
        //   ...
        //
        // Return
        //   nothing
        //
        // Throw
        //   InvalidEventStringError
        //     if given event string is not a string or array of strings.
        //
        var emitArgs, i, j, subRouteMap, routeString, eventHandlers, busContext, evStr, str;

        // Turn to array for more general code.
        if (!isArray(eventString)) {
            eventString = [eventString];
        }

        // Validate all eventStrings before mutating anything.
        // This makes the on call more atomic.
        for (i = 0; i < eventString.length; i += 1) {
            if (typeof eventString[i] !== 'string') {
                throw new InvalidEventStringError(eventString[i]);
            }
        }

        // Collect passed arguments after the eventString argument.
        emitArgs = [];
        for (i = 1; i < arguments.length; i += 1) {
            emitArgs.push(arguments[i]);
        }

        // Collect all the event handlers bound to the given eventString
        eventHandlers = [];
        for (i = 0; i < eventString.length; i += 1) {

            if (findPropertyNameByRegex(this.eventMap, eventString[i]) != undefined) {
                evStr = findPropertyNameByRegex(this.eventMap, eventString[i]);
                for (j = 0; j < evStr.length; j++) {
                    str = evStr[j];
                    subRouteMap = this.eventMap[str]; //LMR
                    for (routeString in subRouteMap) {
                        if (subRouteMap.hasOwnProperty(routeString)) {
                            eventHandlers.push(subRouteMap[routeString].eventHandler);
                        }
                    }
                }
            } else if (this.eventMap.hasOwnProperty(eventString[i])) {
                subRouteMap = this.eventMap[eventString[i]]; //LMR
                for (routeString in subRouteMap) {
                    if (subRouteMap.hasOwnProperty(routeString)) {
                        eventHandlers.push(subRouteMap[routeString].eventHandler);
                    }
                }
            }
        }

        // Apply the event handlers.
        // All event handlers on the bus share a same bus context.
        busContext = this.busContext;
        for (i = 0; i < eventHandlers.length; i += 1) {
            eventHandlers[i].apply(busContext, emitArgs);
        }
    };

    // See Node.js events.EventEmitter.emit
    Bus.prototype.emit = _emit;

    // See Backbone.js Events.trigger
    Bus.prototype.trigger = _emit;

    // See Mozilla Web API EventTarget.dispatchEvent
    // See http://stackoverflow.com/a/10085161/638546
    // Uncomment to enable. Too lengthy to be included by default.
    //Bus.prototype.dispatchEvent = _emit;

    // See http://stackoverflow.com/a/9672223/638546
    // Uncomment to enable. Too rare to be included by default.
    //Bus.prototype.fireEvent = _emit;



    var _on = function (eventString, eventHandler) {
        // Bind an event string(s) to an event handler function.
        //
        // Parameter
        //   eventString
        //     Event string or array of event strings.
        //     Empty array is ok but does nothing.
        //   eventHandler
        //     Event handler function to be executed when the event is emitted.
        //
        // Throw
        //   InvalidEventStringError
        //   InvalidEventHandlerError
        //
        // Return
        //   a route string or an array of route strings
        //
        var wasArray, i, routeObject, routeString, routeStringArray;

        // Turn to array for more general code.
        // Store whether parameter was array to return right type of value.
        wasArray = isArray(eventString);
        if (!wasArray) {
            eventString = [eventString];
        }

        // Validate all eventStrings before mutating anything.
        // This makes the on call more atomic.
        for (i = 0; i < eventString.length; i += 1) {
            if (typeof eventString[i] !== 'string') {
                throw new InvalidEventStringError(eventString[i]);
            }
        }

        // Validate the eventHandler
        if (typeof eventHandler !== 'function') {
            throw new InvalidEventHandlerError(eventHandler);
        }

        routeStringArray = [];
        for (i = 0; i < eventString.length; i += 1) {
            routeObject = {
                eventString: eventString[i],
                eventHandler: eventHandler
            };

            routeString = Identity.create();
            routeStringArray.push(routeString);

            if (!this.eventMap.hasOwnProperty(eventString[i])) {
                this.eventMap[eventString[i]] = {};
            }
            this.eventMap[eventString[i]][routeString] = routeObject;
            this.routeMap[routeString] = routeObject;
        }

        if (wasArray) {
            return routeStringArray;
        } // else
        return routeStringArray[0];
    };

    // See Backbone.js Events.on
    // See Node.js events.EventEmitter.on
    Bus.prototype.on = _on;

    // See http://stackoverflow.com/a/9672223/638546
    Bus.prototype.listen = _on;

    // See Node.js events.EventEmitter.addListener
    // Uncomment to enable. Too lengthy to be included by default.
    //Bus.prototype.addListener = _on;

    // See Mozilla Web API EventTarget.addEventListener
    // See http://stackoverflow.com/a/11237657/638546
    // Uncomment to enable. Too lengthy to be included by default.
    //Bus.prototype.addEventListener = _on;



    var _once = function (eventString, eventHandler) {
        // Like _on but reacts to emit only once.
        //
        // Parameter
        //   See _on
        //
        // Return
        //   See _on
        //
        // Throw
        //   InvalidEventStringError
        //   InvalidEventHandlerError
        //
        var that, routeString, called;

        // Validate the eventHandler. On does the validation also.
        // Duplicate validation is required because a wrapper function
        // is feed into on instead the given eventHandler.
        if (typeof eventHandler !== 'function') {
            throw new InvalidEventHandlerError(eventHandler);
        }

        that = this;
        called = false;
        routeString = this.on(eventString, function () {
            if (!called) {
                called = true; // Required to prevent duplicate sync calls
                that.off(routeString);
                // Apply. Use the context given by emit to embrace code dryness.
                eventHandler.apply(this, arguments);
            }
        });
        return routeString;
    };

    // See Node.js events.EventEmitter.once
    // See Backbone.js Events.once
    Bus.prototype.once = _once;



    var _off = function (routeString) {
        // Unbind one or many event handlers.
        //
        // Parameter
        //   routeString
        //     A route string or an array of route strings or
        //     an array of arrays of route strings.
        //     The route to be shut down.
        //
        // Parameter (Alternative)
        //   eventString
        //     An event string or an array of event strings or
        //     an array of arrays of event strings.
        //     Shut down all the routes with this event string.
        //
        // Parameter (Alternative)
        //   (nothing)
        //     Shut down all the routes i.e. unbind all the event handlers.
        //
        // Throws
        //   InvalidRouteStringError
        //
        // Return
        //   nothing
        //
        var noArgs, i, routeObject, eventString, subRouteMap, rs;

        noArgs = (typeof routeString === 'undefined');
        if (noArgs) {
            this.routeMap = {};
            this.eventMap = {};
            return;
        }

        // Turn to array for more general code.
        if (!isArray(routeString)) {
            routeString = [routeString];
        }

        // Flatten arrays to allow arrays of arrays of route strings.
        // This is needed if user wants to off an array of routes. Some routes
        // might be arrays or route strings because 'on' interface.
        // http://stackoverflow.com/a/10865042/638546
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/
        //   Reference/Global_Objects/Array/concat
        var flat = [];
        flat = flat.concat.apply(flat, routeString);
        routeString = flat;

        // Validate all routeStrings before mutating anything.
        // This makes the off call more atomic.
        for (i = 0; i < routeString.length; i += 1) {
            if (typeof routeString[i] !== 'string') {
                throw new InvalidRouteStringError(routeString[i]);
            }
        }

        for (i = 0; i < routeString.length; i += 1) {
            if (this.routeMap.hasOwnProperty(routeString[i])) {
                routeObject = this.routeMap[routeString[i]];
                delete this.routeMap[routeString[i]];
                delete this.eventMap[routeObject.eventString][routeString[i]];
                // Remove sub route map from the event map if it is empty.
                // This prevents outdated eventStrings piling up on the eventMap.
                if (isEmpty(this.eventMap[routeObject.eventString])) {
                    delete this.eventMap[routeObject.eventString];
                }
            } else {
                // As eventString
                eventString = routeString[i];
                if (this.eventMap.hasOwnProperty(eventString)) {
                    subRouteMap = this.eventMap[eventString];
                    for (rs in subRouteMap) {
                        if (subRouteMap.hasOwnProperty(rs)) {
                            delete this.routeMap[rs];
                        }
                    }
                    delete this.eventMap[eventString];
                }
            }
        }
        // Assert: event handlers and their routes removed.
    };

    // Backbone.js Events.off
    Bus.prototype.off = _off;

    // Node.js events.EventEmitter.removeListener
    Bus.prototype.removeListener = _off;

    // See Mozilla Web API EventTarget.removeEventListener
    // Uncomment to enable. Too lengthy to be included by default.
    //Bus.prototype.removeEventListener = _off;


    var Identity = (function () {
        // A utility for creating unique strings for identification.
        // Abstracts how uniqueness is archieved.
        //
        // Usages
        //   >>> Identity.create();
        //   '532402059994638'
        //   >>> Identity.create();
        //   '544258285779506'
        //
        var exports = {};
        /////////////////

        exports.create = function () {
            return Math.random().toString().substring(2);
        };

        ///////////////
        return exports;
    }());


    // Version
    exports.version = '3.1.0';

    var _emitLocal = function (es, object) {
        var emitArgs = [];
        var i;
        for (i = 1; i < arguments.length; i += 1) {
            emitArgs.push(arguments[i]);
        }
        if (object === undefined) object = {};
        object.event = "src/local/" + es;
        this.emit("src/local/" + es, object);
    }
    Bus.prototype.emitLocal = _emitLocal;

    var _onLocal = function (es, f) {
        this.on("src/local/" + es, f);
    }

    Bus.prototype.onLocal = _onLocal;


    // End of intro
}));
