(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.deep.extend', []);

    var copy = angular.copy;

    var isDate = angular.isDate;
    var isObject = angular.isObject;
    var isArray = angular.isArray;

    function isRegExp(value) {
        return window.toString.call(value) === '[object RegExp]';
    }

    var extend = function (destination, source) {
        var ix;
        var key;
        // bailout
        if (destination !== source) {
            // handles dates and regexps
            if (isDate(source)) {
                destination = new Date(source.getTime());
            } else if (isRegExp(source)) {
                destination = new RegExp(source.source, source.toString().match(/[^\/]*$/)[0]);
                destination.lastIndex = source.lastIndex;
            }
            // if source is object (or array) go recursive
            else if (isObject(source)) {
                // initialize as (or smash to) destination property to Array
                if (isArray(source)) {
                    if (!isArray(destination)) {
                        destination = [];
                    }
                    for (ix = 0; ix < source.length; ix++) {
                        destination.push(source[ix]);
                    }
                } else {
                    // initialize as (or smash to) destination property to Object
                    if (!isObject(destination) || isArray(destination)) {
                        destination = {};
                    }
                    for (key in source) {
                        destination[key] = extend(destination[key], source[key]);
                    }
                }
            } else if (typeof source !== 'undefined') {
                destination = source;
            }
        }
        return destination;
    };

    /**
     * @ngdoc object
     * @name ng.cork.deep.extend.corkDeepExtend
     *
     * @description
     * Provides a function that deep extends one object with another.
     *
     * **NOTE:** the function is provided as a constant and is available to other providers and during config time.
     *
     * <pre>
     * angular.module('app', ['ng.cork.deep.extend'])
     *.provider('myService', [
     *    'corkDeepExtend',
     *    function (corkDeepExtend) {
     *        var obj1 = {foo: 'bar'};
     *        var obj2 = {baz: 'qux'};
     *        corkDeepExtend(obj1, obj2);
     *    }
     * ]);
     * </pre>
     */
    module.constant('corkDeepExtend', extend);

    /**
     * @ngdoc function
     * @name corkDeepExtend
     * @methodOf ng.cork.deep.extend.corkDeepExtend
     *
     * @description
     * Deep extend/merge utility function.
     *
     * @param {*} destination The object to extend. If it is an object, it will be modified in place, but if a
     *   scalar value is provided you need to look at the returned value for the result (a new object or scalar,
     * depending on the value of `source`).
     * @param {*} source The source object.
     * @returns {object} The extended object.
     */

})(angular);
