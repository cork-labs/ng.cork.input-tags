describe('ng.cork.deep.extend', function () {
    'use strict';

    beforeEach(module('ng.cork.deep.extend'));

    describe('corkDeepExtendProvider', function () {

        var corkDeepExtendProvider;
        beforeEach(module(function (_corkDeepExtend_) {
            corkDeepExtendProvider = _corkDeepExtend_;
        }));

        it('should be available at config time', inject(function (corkDeepExtend) {

            expect(corkDeepExtend).toBe(corkDeepExtendProvider);
        }));
    });

    describe('corkDeepExtend', function () {

        describe('when the same object is provided as source and destination', function () {

            it('should NOT modify destination.', inject(function (corkDeepExtend)  {

                var data = {
                    foo: 'bar',
                    baz: 'qux'
                };
                var copy = angular.copy(data);

                corkDeepExtend(data, data);

                expect(data).toEqual(copy);
            }));
        });

        describe('when two different objects are provided', function () {

            it('should merge/override data with the provided properties.', inject(function (corkDeepExtend)  {

                var data = {
                    foo: 'bar',
                    baz: 'qux'
                };
                var extend = {
                    foo: 'quux',
                    quuux: 'corge'
                };

                corkDeepExtend(data, extend);

                expect(data.foo).toBe('quux');
                expect(data.baz).toBe('qux');
                expect(data.quuux).toBe('corge');
            }));

            it('modifying the source data after extending should NOT affect the destination object.', inject(function (corkDeepExtend) {

                var data = {};
                var extend = {
                    id: 42,
                    foo: 'bar',
                    baz: {
                        qux: 'quux' // makes sure it is a deep copy
                    }
                };

                corkDeepExtend(data, extend);

                extend.id++;
                extend.foo = 'baz';
                extend.baz = 'quux';

                expect(data.id).toBe(42);
                expect(data.foo).toBe('bar');
                expect(data.baz.qux).toBe('quux');
            }));

            it('should copy Date properties.', inject(function (corkDeepExtend) {

                var data = {
                    foo: ''
                };
                var extend = {
                    date: new Date()
                };

                corkDeepExtend(data, extend);

                expect(data.date).toEqual(extend.date);
                expect(data.date).not.toBe(extend.date);
            }));

            it('should copy Regexp properties.', inject(function (corkDeepExtend) {

                var data = {
                    foo: ''
                };
                var extend = {
                    regexp: /foobar/g
                };

                corkDeepExtend(data, extend);

                expect(data.regexp).toEqual(extend.regexp);
                expect(data.regexp).not.toBe(extend.regexp);
            }));

            it('should re-initialize any existing scalar property if extending it with an Object.', inject(function (corkDeepExtend) {

                var data = {
                    foo: ''
                };
                var extend = {
                    id: 42,
                    foo: {
                        bar: 'baz'
                    }
                };

                corkDeepExtend(data, extend);

                expect(data.id).toBe(42);
                expect(angular.isObject(data.foo)).toBeTruthy();
                expect(angular.isArray(data.foo)).toBeFalsy();
                expect(data.foo.bar).toBe('baz');
            }));

            it('should re-initialize any existing scalar property if extending it with an Array.', inject(function (corkDeepExtend) {

                var data = {
                    foo: ''
                };
                var extend = {
                    id: 42,
                    foo: [
                        'bar'
                    ]
                };

                corkDeepExtend(data, extend);

                expect(data.id).toBe(42);
                expect(angular.isArray(data.foo)).toBeTruthy();
                expect(data.foo).toEqual(['bar']);
            }));

            it('should re-initialize any existing Array property if extending it with an Object.', inject(function (corkDeepExtend) {

                var data = {
                    foo: []
                };
                var extend = {
                    id: 42,
                    foo: {
                        bar: 'baz'
                    }
                };

                corkDeepExtend(data, extend);

                expect(data.id).toBe(42);
                expect(angular.isObject(data.foo)).toBeTruthy();
                expect(angular.isArray(data.foo)).toBeFalsy();
                expect(data.foo.bar).toBe('baz');
            }));

            it('should re-initialize any existing Object property if extending it with an Array.', inject(function (corkDeepExtend) {

                var data = {
                    foo: {}
                };
                var extend = {
                    id: 42,
                    foo: [
                        'bar'
                    ]
                };

                corkDeepExtend(data, extend);

                expect(data.id).toBe(42);
                expect(angular.isArray(data.foo)).toBeTruthy();
                expect(data.foo).toEqual(['bar']);
            }));

            it('should extend any Array property with new elements (ignoring indexes) when extending it with another Array.', inject(function (corkDeepExtend) {

                var data = {
                    foo: [1, 2, 3]
                };
                var extend = {
                    foo: [
                        'bar'
                    ]
                };

                corkDeepExtend(data, extend);

                expect(angular.isArray(data.foo)).toBeTruthy();
                expect(data.foo.length).toEqual(4);
                expect(data.foo[3]).toEqual('bar');
            }));
        });
    });
});
