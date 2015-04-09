describe('ng.cork.pubsub', function () {
    'use strict';

    beforeEach(module('ng.cork.pubsub'));

    describe('subscribe()', function () {

        it('should return a string', inject(function (corkPubsub) {
            expect(typeof corkPubsub.subscribe()).toBe('string');
        }));
    });

    describe('publish()', function () {

        it('should return undefined', inject(function (corkPubsub) {
            expect(typeof corkPubsub.publish()).toBe('undefined');
        }));
    });

    describe('unsubscribe()', function () {

        it('should return undefined', inject(function (corkPubsub) {
            expect(typeof corkPubsub.unsubscribe()).toBe('undefined');
        }));
    });

    describe('unsubscribeArr()', function () {

        it('should return undefined', inject(function (corkPubsub) {
            expect(typeof corkPubsub.unsubscribeArr([])).toBe('undefined');
        }));
    });

    describe('unsubscribeObj()', function () {

        it('should return undefined', inject(function (corkPubsub) {
            expect(typeof corkPubsub.unsubscribeObj({})).toBe('undefined');
        }));
    });
});
