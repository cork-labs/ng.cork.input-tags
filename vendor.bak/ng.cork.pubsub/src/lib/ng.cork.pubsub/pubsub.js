(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.pubsub', [
        'ng.cx.generate'
    ]);

    /**
     * @ngdoc object
     * @name ng.cork.pubsub.corkPubsub
     *
     * @description
     * Minimal pubsub service.
     */
    module.service('corkPubsub', [
        'cxGenerate',
        function corkPubsub(cxGenerate) {
            var self = this;

            /**
             * @var {object} subscribers stored by name
             */
            var subscriptions = {};

            /**
             * @var {object} maps subscriber guids to message name
             */
            var subscribers = {};

            /**
             * checks if a certain message is no longer subscribed to
             *
             * @param {string} name the message to check for subscribers
             * @returns {boolean} True if there are no more subscribers
             */
            function hasNoSubscribers(name) {
                for (var guid in subscriptions[name]) {
                    return false;
                }
                return true;
            }

            // -- public API

            /**
             * @ngdoc function
             * @name subscribe
             * @methodOf ng.cork.pubsub.corkPubsub
             *
             * @description
             * Subscribes to a a message.
             *
             * @param {string} name Message name to subscribe to.
             * @param {Function} fn Callback function.
             * @returns {string} A guid that can (should!) be used to unsubscribe.
             */
            self.subscribe = function (name, fn, context) {
                var guid = cxGenerate.uuid();
                subscriptions[name] = subscriptions[name] || {};
                subscriptions[name][guid] = {
                    fn: fn,
                    ctx: context
                };
                subscribers[guid] = name;
                return guid;
            };

            /**
             * @ngdoc function
             * @name publish
             * @methodOf ng.cork.pubsub.corkPubsub
             *
             * @description
             * Publish a message and notifify subscriptions
             *
             * @param {string} name The message name.
             * @param {...*} args Optional one or more arguments which will be passed onto the subscribers.
             */
            self.publish = function () {
                var params = [].slice.call(arguments);
                var name = params[0];
                if (subscriptions[name]) {
                    var subscription;
                    for (var guid in subscriptions[name]) {
                        subscription = subscriptions[name][guid];
                        subscription.fn.apply(subscription.ctx, params);
                    }
                }
            };

            /**
             * @ngdoc function
             * @name unsubscribe
             * @methodOf ng.cork.pubsub.corkPubsub
             *
             * @description
             * Unsubscribers this listener
             *
             * @param {string} guid The guid
             */
            self.unsubscribe = function (guid) {
                var name = subscribers[guid];
                if (name) {
                    delete subscriptions[name][guid];
                    if (hasNoSubscribers(name)) {
                        delete subscriptions[name];
                    }
                }
            };

            /**
             * @ngdoc function
             * @name unsubscribeAll
             * @methodOf ng.cork.pubsub.corkPubsub
             *
             * @description
             * Convinience method to unsubscribe all subscribers for clients that store subscribers guids in an array.
             *
             * @param {array} guids An array of guids
             */
            self.unsubscribeArr = function (guids) {
                for (var ix = 0; ix < guids.length; ix++) {
                    self.unsubscribe(guids[ix]);
                }
            };

            /**
             * @ngdoc function
             * @name unsubscribeAll
             * @methodOf ng.cork.pubsub.corkPubsub
             *
             * @description
             * Convinience method to unsubscribe all subscribers for clients that store guids in a hash map.
             *
             * @param {array|object} guids An hash of guids (keys ignored).
             */
            self.unsubscribeObj = function (guids) {
                for (var key in guids) {
                    self.unsubscribe(guids[key]);
                }
            };
        }
    ]);

})(angular);
