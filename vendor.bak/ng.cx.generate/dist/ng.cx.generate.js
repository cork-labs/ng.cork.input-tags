/**
 * ng.cx.generate - v0.0.2 - 2015-02-11
 * https://github.com/ef-ctx/ng.cx.generate
 *
 * Copyright (c) 2015 EF CTX <http://ef.com>
 * License: MIT <https://raw.githubusercontent.com/EFEducationFirstMobile/oss/master/LICENSE>
 */
(function (angular) {
    'use strict';

    var module = angular.module('ng.cx.generate', []);

    /**
     * @ngdoc  object
     * @name   ng.cx.generate.cxGenerate
     *
     * @description
     * Provides methods to generate uuid, random strings and sequences.
     */
    module.service('cxGenerate', [

        function cxGenerateFactory() {
            var self = this;

            /**
             * @var {string} used in `uuid()` generator
             */
            var hexDigits = '0123456789abcdef';

            /**
             * @var {array} sequence string components used in `sequence()` generator
             */
            var sequence = ['0', '0', '0'];

            /**
             * @var {number} index number yield by `index()` generator
             */
            var index = 0;

            // -- public API

            /**
             * @ngdoc function
             * @name uuid
             * @methodOf ng.cx.generate.cxGenerate
             *
             * @description
             * Generates RFC4122 version 4 ids http://www.ietf.org/rfc/rfc4122.txt.
             *
             * @returns {string} uuid
             */
            self.uuid = function (length) {
                var arr = new Array(36);
                for (var ix = 0; ix < 36; ix++) {
                    arr[ix] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                arr[14] = 4; // bits 12-15 of the time_hi_and_version field to 0010
                arr[19] = hexDigits.substr((arr[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
                arr[8] = arr[13] = arr[18] = arr[23] = '-';

                return arr.join('');
            };

            /**
             * @ngdoc function
             * @name hex
             * @methodOf ng.cx.generate.cxGenerate
             *
             * @description
             * Generates a random string using [a-f0-9] only characters.
             *
             * @returns {number} length Length of the generated hex string.
             * @returns {string?} prefix Optional prefix, results in `prefix-abcdef12345`.
             */
            self.hex = function (length, prefix) {
                var arr = new Array(length);
                for (var ix = 0; ix < length; ix++) {
                    arr[ix] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
                }
                return (prefix ? prefix + '-' : '') + arr.join('');
            };

            /**
             * @ngdoc function
             * @name sequence
             * @methodOf ng.cx.generate.cxGenerate
             *
             * @description
             * Generates a (optionally prefixed) sequence string. Ex: `my-00A`.
             *
             * @param {string?} prefix Optional prefix.
             * @returns {string} Sequence string, results in `prefix-00A`.
             */
            self.sequence = function (prefix) {
                var index = sequence.length;
                var digit;
                while (index) {
                    index--;
                    digit = sequence[index].charCodeAt(0);
                    if (digit === 57 /*'9'*/ ) {
                        sequence[index] = 'A';
                        return (prefix ? prefix + '-' : '') + sequence.join('');
                    }
                    if (digit === 90 /*'Z'*/ ) {
                        sequence[index] = '0';
                    } else {
                        sequence[index] = String.fromCharCode(digit + 1);
                        return (prefix ? prefix + '-' : '') + sequence.join('');
                    }
                }
                sequence.unshift('0');
                return (prefix ? prefix + '-' : '') + sequence.join('');
            };

            /**
             * @ngdoc function
             * @name index
             * @methodOf ng.cx.generate.cxGenerate
             *
             * @description
             * Generates a sequence number, starting from 0.
             *
             * @returns {number} sequence number
             */
            self.index = function () {
                return index++;
            };
        }
    ]);

})(angular);

