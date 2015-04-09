/**
 * ng.cork.deep - v0.0.4 - 2015-04-09
 * https://github.com/cork-labs/ng.cork.deep
 *
 * Copyright (c) 2015 Cork Labs <http://cork-labs.org>
 * License: MIT <http://cork-labs.mit-license.org/2015>
 */
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

(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.deep.obj', [
        'ng.cork.deep.path'
    ]);

    var copy = angular.copy;

    var isObject = angular.isObject;

    /**
     * @ngdoc object
     * @name ng.cork.deep.obj.CorkDeepObj
     *
     * @description
     * Base class with deep get/set/delete methods.
     */
    module.factory('CorkDeepObj', [
        'corkDeepPath',
        function CorkDeepObjFactory(corkDeepPath) {

            /**
             * @ngdoc method
             * @name CorkDeepObj
             * @methodOf ng.cork.deep.obj.CorkDeepObj
             *
             * @description
             * Constructor.
             *
             * <pre>
             * var obj = new CorkDeepObj({foo: bar});
             * </pre>
             *
             * @param {object} data Seed data.
             */
            var CorkDeepObj = function (data) {
                var self = this;
                if (isObject(data)) {
                    for (var key in data) {
                        self[key] = copy(data[key]);
                    }
                }
            };

            /**
             * @ngdoc method
             * @name get
             * @methodOf ng.cork.deep.obj.CorkDeepObj
             *
             * @description
             * Deep get a property of the object by supplying the property path.
             *
             * Supply a path in dot notation to retrieve a value:
             *
             * <pre>
             * obj.get('foo.bar'); // 'baz'</pre>
             * </pre>
             *
             * If the object does not have the requested property, it throws an Error.
             *
             * <pre>
             * obj.get(obj, 'foo.foo'); // Error: Path "foo.bar" is not defined.
             * </pre>
             *
             * Supply a default value (something different from `undefined`) to suppress the error.
             *
             * You will get the default back if the object does not have the requested property.
             *
             * <pre>
             * obj.get('foo.foo', 'default value'); // 'default value'
             * </pre>
             *
             * *NOTE:* The retrieved value is a copy of the data held by the provided `obj`. Therefore, modifying the return
             * value of `obj.get(...)` will not modify the object itself (and vice-versa).
             *
             * @param {string} path The property path to read from, in dot notation. ex: `foo.bar.baz`
             * @param {*=} defaultValue A value to be returned in case the object does not have the requested property.
             * @returns {*} The property value.
             */
            Object.defineProperty(CorkDeepObj.prototype, 'get', {
                value: function (path, defaultValue) {
                    return corkDeepPath.get(this, path, defaultValue);
                }
            });

            /**
             * @ngdoc method
             * @name set
             * @methodOf ng.cork.deep.obj.CorkDeepObj
             *
             * @description
             * Deep set the value of a property of the object by supplying the property path and a new value.
             *
             * <pre>
             * obj.set('foo.qux', 'new value'); // obj.foo.qux = 'new value'
             * </pre>
             *
             * *NOTE:* The data stored in the object is a deep copy of the provided value. Therefore, modifying the `value` after
             * calling `obj.set(path, value)` will not modify the object itself (and vice-versa).
             *
             * @param {string} path The property path to write to, in dot notation. ex: `foo.bar.baz`
             * @param {*} value The value to set.
             */
            Object.defineProperty(CorkDeepObj.prototype, 'set', {
                value: function (path, value) {
                    corkDeepPath.set(this, path, value);
                }
            });

            /**
             * @ngdoc method
             * @name del
             * @methodOf ng.cork.deep.obj.CorkDeepObj
             *
             * @description
             * Deep delete a property of the object by supplying the property path.
             *
             * <pre>
             * obj.del('foo'); // obj.foo = undefined, obj = {baz: [101]}
             * </pre>
             *
             * @param {object} data Data to replace with.
             *
             * @param {string} path The property path to delete, in dot notation. ex: `foo.bar.baz`
             */
            Object.defineProperty(CorkDeepObj.prototype, 'del', {
                value: function (path) {
                    corkDeepPath.del(this, path);
                }
            });

            return CorkDeepObj;
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.deep.path', []);

    var copy = angular.copy;

    var isString = angular.isString;
    var isUndefined = angular.isUndefined;

    /**
     * @ngdoc service
     * @name ng.cork.deep.path.corkDeepPath
     *
     * @description
     * Service to get/set/delete object properties by path.
     */
    module.service('corkDeepPath', [

        function corkDeepPathFactory() {

            var CorkDeepPath = function () {
                var self = this;

                /**
                 * @ngdoc function
                 * @name get
                 * @methodOf ng.cork.deep.path.corkDeepPath
                 *
                 * @description
                 * Deep get an object property by supplying the property path.
                 *
                 * Given the object:
                 *
                 * <pre>
                 * var obj = {
                 *     foo: {
                 *         bar: 'baz'
                 *     }
                 * };
                 * </pre>
                 *
                 * Supply a path in dot notation to retrieve a value:
                 *
                 * <pre>corkDeepPath.get(obj, 'foo.bar'); // 'baz'</pre>
                 *
                 * If the object does not have the requested property, it throws an Error.
                 *
                 * <pre>
                 * corkDeepPath.get(obj, 'foo.foo'); // Error: Path "foo.bar" is not defined.
                 * </pre>
                 *
                 * Supply a default value (something different from `undefined`) to suppress the error.
                 *
                 * You will get the default back if the object does not have the requested property.
                 *
                 * <pre>
                 * corkDeepPath.get(obj, 'foo.foo', 'default value'); // 'default value'
                 * </pre>
                 *
                 * *NOTE:* The retrieved value is a copy of the data held by the provided `obj`. Therefore, modifying the return
                 * value of `corkDeepPath.get(obj, ...)` will not modify the object itself (and vice-versa).
                 *
                 * @param {object} obj The object to read from.
                 * @param {string} path The property path to read from, in dot notation. ex: `foo.bar.baz`
                 * @param {*=} defaultValue A value to be returned in case the path is undefined.
                 * @returns {*} The property value.
                 */
                self.get = function get(obj, path, defaultValue) {
                    var parts;
                    var value = obj;
                    var key;
                    var args;

                    if (isUndefined(path) || isString(path)) {
                        parts = path ? path.split('.') : [];
                        while (parts.length && value) {
                            key = parts.shift();
                            if (value.hasOwnProperty(key)) {
                                value = value[key];
                            } else {
                                // the whole path is consumed and a defaultValue was provided
                                if (!parts.length && defaultValue !== undefined) {
                                    return defaultValue;
                                } else {
                                    throw new Error('Path "' + path + '" is not defined.');
                                }
                            }
                        }
                    } else {
                        throw new Error('Invalid property path.');
                    }

                    return 'object' === typeof value ? angular.copy(value) : value;
                };

                /**
                 * @ngdoc function
                 * @name set
                 * @methodOf ng.cork.deep.path.corkDeepPath
                 *
                 * @description
                 * Deep set the value of an object property by supplying a property path and a new value.
                 *
                 * <pre>
                 * corkDeepPath.set(obj, 'foo.qux', 'new value'); // obj.foo.qux = 'new value'
                 * </pre>
                 *
                 * *NOTE:* The data stored in the object is a deep copy of the provided value. Therefore, modifying the `value` after
                 * calling `corkDeepPath.set(obj, path, value)` will not modify the object itself (and vice-versa).
                 *
                 * @param {object} obj The object to write to.
                 * @param {string} path The property path to write to, in dot notation. ex: `foo.bar.baz`
                 * @param {*} value The value to set.
                 */
                self.set = function set(obj, path, value) {
                    var parts;
                    var val = obj;
                    var key;

                    if (isString(path)) {
                        parts = path.split('.');
                        while (parts.length > 1 && val) {
                            key = parts.shift();
                            if (!val.hasOwnProperty(key) || typeof val[key] !== 'object') {
                                val[key] = {};
                            }
                            val = val[key];
                        }

                        key = parts.shift();
                        val[key] = 'object' === typeof value ? copy(value) : value;
                    } else {
                        throw new Error('Invalid property path.');
                    }
                };

                /**
                 * @ngdoc function
                 * @name del
                 * @methodOf ng.cork.deep.path.corkDeepPath
                 *
                 * @description
                 * Deep delete an object property by supplying the property path.
                 *
                 * <pre>
                 * corkDeepPath.del(obj, 'foo'); // obj.foo = undefined, obj = {baz: [101]}
                 * </pre>
                 *
                 * @param {object} obj The object to write to.
                 * @param {string} path The property path to delete, in dot notation. ex: `foo.bar.baz`
                 */
                self.del = function del(obj, path) {
                    var parts;
                    var value = obj;
                    var key;
                    var args;

                    if (isString(path)) {
                        parts = path ? path.split('.') : [];
                        while (parts.length && value) {
                            key = parts[0];
                            if (parts.length === 1) {
                                if (value.hasOwnProperty(key)) {
                                    delete value[key];
                                }
                                return;
                            }
                            value = value[key];
                            parts.shift();
                        }
                    } else {
                        throw new Error('Invalid property path.');
                    }
                };
            };

            return new CorkDeepPath();
        }
    ]);

})(angular);

(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.deep', [
        'ng.cork.deep.extend',
        'ng.cork.deep.path',
        'ng.cork.deep.obj'
    ]);

})(angular);
