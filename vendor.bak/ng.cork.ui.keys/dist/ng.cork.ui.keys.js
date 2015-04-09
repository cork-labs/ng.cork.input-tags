/**
 * ng.cork.ui.keys - v0.0.5 - 2015-04-09
 * https://github.com/cork-labs/ng.cork.ui.keys
 *
 * Copyright (c) 2015 Cork Labs <http://cork-labs.org>
 * License: MIT <http://cork-labs.mit-license.org/2015>
 */
(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.ui.keys', [
        'ng.cork.deep.extend'
    ]);

    /**
     * @var {string} tag names, minifies better
     */
    var del = 'deletion';
    var nav = 'navigation';
    var mov = 'movement';
    var pag = 'pagination';
    var dir = 'direction';

    /**
     * http://unixpapa.com/js/key.html
     * http://docs.closure-library.googlecode.com/git/interface_goog_events_ListenableKey.html
     * @var {array} denormalizedCodes, contains key codes, names and tags
     */
    var denormalizedCodes = [{
        c: 8,
        n: 'Backspace',
        t: [del, nav]
    }, {
        c: 9,
        n: 'Tab',
        t: [nav]
    }, {
        c: 13,
        n: 'Enter',
        t: [nav]
    }, {
        c: 27,
        n: 'Esc',
        t: [nav]
    }, {
        c: 33,
        n: 'PageUp',
        t: [mov, pag]
    }, {
        c: 34,
        n: 'PageDown',
        t: [mov, pag]
    }, {
        c: 35,
        n: 'End',
        t: [mov, pag]
    }, {
        c: 36,
        n: 'Home',
        t: [mov, pag]
    }, {
        c: 37,
        n: 'Left',
        t: [mov, dir]
    }, {
        c: 38,
        n: 'Up',
        t: [mov, dir]
    }, {
        c: 39,
        n: 'Right',
        t: [mov, dir]
    }, {
        c: 40,
        n: 'Down',
        t: [mov, dir]
    }, {
        c: 45,
        n: 'Insert',
        t: []
    }, {
        c: 46,
        n: 'Delete',
        t: [del]
    }, ];

    /**
     * @var {object} browser
     */
    var browserMaps = {
        ie: {
            map: {

            },
            filter: function (code) {
                return code;
            }
        },
        opera: {
            map: {
                5: 10
            }
        }
    };

    /**
     * @var {object} normalizedCodes maps code names to codes
     */
    var normalizedCodes = {};

    /**
     * @var {object} tags maps tags to array of codes
     */
    var tags = {};

    /**
     * builds the normalized codes and tags
     */
    var key;
    var code;
    var ix;
    var ox;
    var tag;
    for (ix = 0; ix < denormalizedCodes.length; ix++) {
        key = denormalizedCodes[ix];
        normalizedCodes[key.n] = key.c;
        if (key.t) {
            for (ox = 0; ox < key.t.length; ox++) {
                tag = key.t[ox];
                if (!tags[tag]) {
                    tags[tag] = [];
                }
                tags[tag].push(key.c);
            }
        }
    }

    /**
     * @ngdoc object
     * @name ng.cork.ui.keys.constant:corkUiKeysCodes
     *
     * @description
     * Normalized key codes
     */
    module.constant('corkUiKeysCodes', normalizedCodes);

    /**
     * @ngdoc object
     * @name ng.cork.ui.keys.corkUiKeysProvider
     *
     * @description
     * Configure the {@link ng.cork.ui.keys.corkUiKeys corkUiKeys} service.
     */
    module.provider('corkUiKeys', [
        'corkDeepExtend',
        'corkUiKeysCodes',
        function corkUiKeysProvider(corkDeepExtend, corkUiKeysCodes) {
            var provider = this;

            /**
             * @type {Object} provider configuration, allows extending the existing tags, or creating new ones
             */
            var serviceConfig = {
                tags: tags
            };

            /**
             * @ngdoc function
             * @name configure
             * @methodOf ng.cork.ui.keys.corkUiKeysProvider
             *
             * @description
             * Configures the {@link ng.cork.ui.keys.corkUiKeys} service.
             *
             * @param {Object} data Object with configuration options, extends base configuration. Ex:
             *
             * ````
             * var keyCodes = corkUiKeysCodes;
             * corkUiKeysProvider.configure({
             *     tags: {
             *         upDown: [keyCodes.PageUp, keyCodes.PageDown]
             *     }
             * });
             * ````
             */
            provider.configure = function (data) {
                corkDeepExtend(serviceConfig, data);
            };

            /**
             * @ngdoc service
             * @name ng.cork.ui.keys.corkUiKeys
             *
             * @description
             * Normalizes key codes across browsers and provides a way to match key codes by tags.
             *
             * @property {object} key A list of key name constants. Ex: `corkUiKeys.key.up`
             */
            provider.$get = [

                function corkUiKeysFactory() {

                    /**
                     * @var {string} id of browser to lookup
                     * @todo
                     */
                    var browserId;

                    /**
                     * @var {object} shortcut for the current browser map/filter functions
                     */
                    var browserMap = browserMaps[browserId];

                    /**
                     * @param {number} code
                     * @returns {number} code
                     */
                    function map(code) {
                        if ('function' === typeof browserMap.filter) {
                            code = browserMap.filter(code);
                        }
                        if (browserMap.amp[code]) {

                        }
                    }

                    // -- public API

                    var corkUiKeys = {

                        /**
                         * property: key
                         */
                        key: normalizedCodes,

                        /**
                         * @ngdoc function
                         * @name getCode
                         * @methodOf ng.cork.ui.keys.corkUiKeys
                         *
                         * @description
                         * Returns the normalized key code for this event.
                         *
                         * @param {object} ev Native event.
                         * @returns {number} normalized key code;
                         */
                        getCode: function (ev) {
                            var keyCode = ev.charCode ? ev.charCode : ev.keyCode;
                            if (browserMap) {
                                keyCode = map(keyCode);
                            }
                            return keyCode;
                        },

                        /**
                         * @ngdoc function
                         * @name is
                         * @methodOf ng.cork.ui.keys.corkUiKeys
                         *
                         * @description
                         * Checks if a certain key code is tagged with a tag.
                         *
                         * @param {string} tag The tag name.
                         * @param {number} code The normalized key code
                         * @returns {boolean} True if this code is tagged with the provided tag.
                         */
                        is: function (tag, code) {
                            return (!!tags[tag] && tags[tag].indexOf(code) !== -1);
                        }
                    };

                    return corkUiKeys;
                }
            ];
        }
    ]);

}(angular));
