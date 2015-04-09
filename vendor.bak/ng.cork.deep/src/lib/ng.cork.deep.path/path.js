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
