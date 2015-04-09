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
