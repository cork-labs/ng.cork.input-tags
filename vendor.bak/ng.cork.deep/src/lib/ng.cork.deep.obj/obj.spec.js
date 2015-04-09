describe('ng.cork.deep.obj', function () {
    'use strict';

    beforeEach(module('ng.cork.deep.obj'));

    describe('CorkDeepObj', function () {

        describe('Constructor', function () {});

        describe('get()', function () {

            it('should throw an error if "path" argument is of an invalid type.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj();

                expect(function () {
                    obj.get([]);
                }).toThrow(new Error('Invalid property path.'));
            }));

            it('should retrieve all the existing properties if no path provided.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {
                        bar: 42
                    },
                    baz: 99
                });

                var expected = angular.copy(obj);
                expect(obj.get()).toEqual(expected);
            }));

            it('should retrieve existing properties by path.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {
                        bar: 42
                    }
                });

                expect(obj.get('foo.bar')).toBe(42);
            }));

            it('should clone the data before returning it: modifying the data should NOT modify the object.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {
                        bar: 'baz'
                    }
                });

                var foo = obj.get('foo');

                foo.bar = 'qux';

                expect(obj.get('foo.bar')).toBe('baz');
            }));

            it('should throw an error if data is not defined.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj();

                expect(function () {
                    obj.get('qux');
                }).toThrow(new Error('Path "qux" is not defined.'));
            }));

            describe('when a default value is provided', function () {

                it('should still throw an error if data is not defined.', inject(function (CorkDeepObj) {

                    var obj = new CorkDeepObj({
                        foo: {
                            bar: {
                                baz: 42
                            }
                        }
                    });

                    expect(function () {
                        obj.get('foo.qux.quux', 'default');
                    }).toThrow(new Error('Path "foo.qux.quux" is not defined.'));
                }));

                it('should return the provided default if final property is not defined.', inject(function (CorkDeepObj) {

                    var obj = new CorkDeepObj({
                        foo: {
                            bar: 42
                        }
                    });

                    expect(obj.get('foo.bar.baz', 'default')).toBe('default');
                }));
            });
        });

        describe('set()', function () {

            it('should throw an error if "path" argument is of an invalid type.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj();

                expect(function () {
                    obj.set([]);
                }).toThrow(new Error('Invalid property path.'));
            }));

            it('should store the provided data in the object.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {}
                });

                obj.set('foo.bar', 42);

                expect(obj.foo.bar).toBe(42);
            }));

            it('should override existing objects with scalars.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {
                        bar: {}
                    }
                });

                obj.set('foo', 42);

                expect(obj.foo).toBe(42);
            }));

            it('should override existing scalars with objects.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: 42
                });

                obj.set('foo.bar', 42);

                expect(obj.foo.bar).toBe(42);
            }));

            it('should clone provided data: modifying it after set() should NOT modify the object', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj();
                var data = {
                    bar: 'baz'
                };

                obj.set('foo', data);

                data.bar = 'qux';

                expect(obj.foo.bar).toBe('baz');

                obj.set('foo.bar', 'quux');

                expect(data.bar).toBe('qux');
            }));
        });

        describe('del()', function () {

            it('should throw an error if "path" argument is of an invalid type.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj();

                expect(function () {
                    obj.del([]);
                }).toThrow(new Error('Invalid property path.'));
            }));

            it('should delete the property from the obj.', inject(function (CorkDeepObj) {

                var obj = new CorkDeepObj({
                    foo: {
                        bar: {
                            baz: 42
                        }
                    }
                });

                obj.del('foo.bar');

                expect(obj.foo.bar).toBe(undefined);
            }));
        });
    });
});
