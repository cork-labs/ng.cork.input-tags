/**
 * ng.cork.input-tags - v0.0.3 - 2015-04-10
 * https://github.com/cork-labs/ng.cork.input-tags
 *
 * Copyright (c) 2015 Cork Labs <http://cork-labs.org>
 * License: MIT <http://cork-labs.mit-license.org/2015>
 */
angular.module('ng.cork.input-tags.templates', []).run(['$templateCache', function($templateCache) {
$templateCache.put("lib/ng.cork.input-tags/control.tpl.html",
"<ng-form name=form class=cork-input-tags-control ng-class=\"{'cork-is-disabled': disabled}\"><div class=cork-it-list><div class=cork-it-tag ng-repeat=\"tag in model\" ng-class=\"{'cork-is-selected': selIx === $index, 'cork-will-delete': willDelete}\" title=\"Tag '{{tag[opts.attr.label]}}', press backspace to highlight this tag for removal, press left to select previous tag, press right to select next tag, press escape to return to the add tag input.\" ng-focus=onCursorFocus($index) ng-keydown=\"onCursorKeyDown($event, $index)\" ng-keyup=\"onCursorKeyUp($event, $index)\" ng-blur=onCursorBlur($index) cork-ui-focus-on=focus-cursor-{{$index}}><div class=cork-it-label><div class=cork-it-content ng-include=opts.tpl.label></div></div><button class=cork-it-remove-btn title=\"Tag '{{tag[opts.attr.label]}}', press backspace to remove tag, press left to select previous tag, press right to select next tag, press escape to return to the add tag input.\" ng-click=removeTag(tag) ng-focus=onRemoveBtnFocus($index) ng-keydown=\"onRemoveBtnKeyDown($event, $index)\" ng-blur=onRemoveBtnBlur($index) cork-ui-enter-click cork-ui-stop-propagation cork-events=\"['keydown']\" cork-ui-focus-on=focus-remove-btn-{{$index}}><i class=\"cork-icon fa fa-times\"></i> <span class=cork-icon-text>remove</span></button></div></div><input class=form-control ng-model=newLabel placeholder={{opts.placeholder}} ng-focus=onInputFocus() ng-keyup=onInputKeyUp($event) ng-keydown=onInputKeyDown($event) ng-blur=\"onInputBlur()\"></ng-form>");
$templateCache.put("lib/ng.cork.input-tags/input.tpl.html",
"<div class=cork-input-tags-input ng-class=\"{'cork-is-disabled': disabled}\"><div cork-input-tags-control cork-uuid={{uuid}} cork-options=opts ng-model=model></div><div class=cork-input-tags-results-container><div cork-input-tags-results cork-uuid={{uuid}} cork-options=opts></div></div></div>");
$templateCache.put("lib/ng.cork.input-tags/label.tpl.html",
"<div>{{tag[opts.attr.label]}}</div>");
$templateCache.put("lib/ng.cork.input-tags/result.tpl.html",
"<div>{{tag[opts.attr.label]}}</div>");
$templateCache.put("lib/ng.cork.input-tags/results.tpl.html",
"<div class=cork-input-tags-results><div class=cork-it-tag ng-repeat=\"tag in results\" ng-class=\"{'cork-is-selected': selIx === $index}\" ng-click=tagClick(tag)><div class=cork-it-add-icon><i class=\"cork-icon fa fa-plus\"></i> <span class=cork-icon-text>add</span></div><div class=cork-it-label><div class=cork-it-content ng-include=opts.tpl.result></div></div></div></div>");
}]);

(function (angular) {
    'use strict';

    var module = angular.module('ng.cork.input-tags', [
        'ng.cx.generate',
        'ng.cork.throttling',
        'ng.cork.pubsub',
        'ng.cork.ui.keys',
        'ng.cork.ui.focus-on',
        'ng.cork.ui.enter-click',
        'ng.cork.ui.stop-propagation',
        'ng.cork.input-tags.templates'
    ]);

    // @todo placeholder
    // @todo disabled
    // @todo ngModel
    // @todo stringMode
    // @todo pluckIds
    // @todo minTags > set validity in control
    // @todo maxTags > set validity in control
    // @todo restrictToMax > prevent adding more than max

    var noop = angular.noop;
    var element = angular.element;

    var copy = angular.copy;
    var isObject = angular.isObject;
    var isArray = angular.isArray;
    var isFunction = angular.isFunction;

    function isPromise(value) {
        return !!value && isFunction(value.then);
    }

    /**
     * @ngdoc service
     * @name ng.cork.input-tags.corkInputTagsConfigProvider
     *
     * @description
     * Allows configuration of {@link ng.cork.input-tags.corkInputTags}, {@link ng.cork.input-tags.corkInputTagsControl} and {@link ng.cork.input-tags.corkInputTagsResults} directives.
     */
    module.provider('corkInputTagsConfig', [
        'corkDeepExtend',
        function corkInputTagsConfigProvider(corkDeepExtend) {
            var provider = this;

            /**
             * @type {Object} provider configuration.
             */
            var serviceConfig = {
                minLength: 3,
                addFn: noop,
                searchFn: noop,
                attr: {
                    id: 'id',
                    label: 'label'
                },
                tpl: {
                    label: 'lib/ng.cork.input-tags/label.tpl.html',
                    result: 'lib/ng.cork.input-tags/result.tpl.html'
                },
                debounceMs: 500
            };

            /**
             * @ngdoc function
             * @name configure
             * @methodOf ng.cork.input-tags.corkInputTagsConfigProvider
             *
             * @description
             * Configures the {@link ng.cork.input-tags.corkInputTagsConfigProvider} service.
             *
             * @param {Object} data Object with configuration options, extends base configuration.
             */
            provider.configure = function (data) {
                corkDeepExtend(serviceConfig, data);
            };

            provider.$get = [
                function corkInputTagsFactory() {

                    var CorkInputTagsConfig = function () {
                        var service = this;

                        service.setSearchFn = function (fn) {
                            serviceConfig.searchFn = fn;
                        };

                        Object.defineProperty(service, 'config', {
                            get: function () {
                                return copy(serviceConfig);
                            }
                        });

                    };

                    return new CorkInputTagsConfig();
                }
            ];

        }
    ]);

    /**
     * @ngdoc directive
     * @name ng.cork.input-tags.corkInputTags
     *
     * @description
     * Tag input container. Composes the {@link ng.cork.input-tags.corkInputTagsControl} and {@link ng.cork.input-tags.corkInputTagsResults} directives.
     *
     * @scope
     * @restrict A
     *
     * @param {object=} corkOptions Override the default options.
     */
    module.directive('corkInputTags', [
        'corkDeepExtend',
        'corkInputTagsConfig',
        'cxGenerate',
        function corkInputTags(corkDeepExtend, corkInputTagsConfig, cxGenerate) {

            return {
                templateUrl: 'lib/ng.cork.input-tags/input.tpl.html',
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    options: '=corkOptions',
                    model: '=ngModel'
                },
                link: function ($scope, $element, $attrs) {

                    /**
                     * @var {string} generate a uuid to connect corkInputTagsControl and corkInputTagsResults directives via pubsub
                     */
                    $scope.uuid = cxGenerate.uuid();

                    /**
                     * @var {object} service configuration
                     */
                    var config = corkInputTagsConfig.config;

                    /**
                     * @var {object} configuration
                     */
                    $scope.opts = corkDeepExtend(copy(config), $scope.options || {});
                }
            };
        }
    ]);

    /**
     * @ngdoc directive
     * @name ng.cork.input-tags.corkInputTagsControl
     *
     * @description
     * Tag input control
     *
     * @scope
     * @restrict A
     * @requires ngModel
     *
     * @param {string=} corkUuid Optional UUID.
     * @param {boolean=} corkDisabled Optional expression to enable/disable the field.
     * @param {object=} corkOptions Override the default options.
     */
    module.directive('corkInputTagsControl', [
        '$timeout',
        'corkDeepExtend',
        'corkInputTagsConfig',
        'corkPubsub',
        'corkUiKeys',
        'corkThrottling',
        function corkInputTagsControl($timeout, corkDeepExtend, corkInputTagsConfig, corkPubsub, corkUiKeys, corkThrottling) {

            var preventedKeys = [corkUiKeys.key.Up, corkUiKeys.key.Down, corkUiKeys.key.Enter];

            return {
                templateUrl: 'lib/ng.cork.input-tags/control.tpl.html',
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    uuid: '@corkUuid',
                    disabled: '=corkDisabled',
                    options: '=corkOptions'
                },
                link: function ($scope, $element, $attrs, $ngModel) {

                    /**
                     * @var {array} stores pubsub guids for bulk unsubscription on scope destruction
                     */
                    var ERROR = {
                        MIN_TAGS: 'cork-input-tags-min',
                        MAX_TAGS: 'cork-input-tags-max'
                    };

                    /**
                     * @var {array} stores pubsub guids for bulk unsubscription on scope destruction
                     */
                    var pubSubGuids = [];

                    /**
                     * @var {string} generates a unique event namespace for pubsub from the provided uuid
                     */
                    var eventNamespace = 'corkInputTags.' + $scope.uuid;

                    /**
                     * @var {object} default configuration
                     */
                    var config = corkInputTagsConfig.config;

                    /**
                     * configuration options
                     */
                    var opts = $scope.opts = corkDeepExtend(copy(config), $scope.options || {});

                    var optionMinLength = opts.minLength;
                    var optionFnAdd = opts.addFn;
                    var optionAttrId = opts.attr.id;
                    var optionAttrLabel = opts.attr.label;
                    var optionTplLabel = opts.tpl.label;
                    var optionMinTags = 0;
                    var optionMaxTags = 0;
                    var optionRestrictToMax = 0;
                    var optionDebounceMs = opts.debounceMs;

                    /**
                     * @var {element} cached input reference
                     */
                    var input = element($element.find('input'));

                    // -- state

                    /**
                     * @var {object} tag currently selected in corkInputTagsResults directive
                     */
                    var selectedResultTag = null;

                    // -- scope vars

                    /**
                     * @var {boolean} true if model is not an array, will force disabled
                     */
                    $scope.unbound = !isArray($scope.model);

                    /**
                     * @var {boolean} enaled (by provided option OR because not bound) updated on updateEnabled()
                     */
                    $scope.enabled = false;

                    /**
                     * @var {object} opts relevant for the template
                     */
                    $scope.opts = {
                        placeholder: null,
                        attr: {
                            label: optionAttrLabel
                        },
                        tpl: {
                            label: optionTplLabel
                        }
                    };

                    /**
                     * @var {number} index of the tag currently selected in the model tag index (-1) if none
                     */
                    $scope.selIx = -1;

                    /**
                     * @var {boolean} True if focus is on a tag remove button
                     */
                    $scope.willDelete = false;

                    // -- private

                    /**
                     *
                     */
                    function updateSelectedTag(index) {
                        var length = $scope.model.length;
                        var lastIndex = length - 1;
                        // limit to first element
                        if (index < 0) {
                            index = length ? 0 : -1;
                        }
                        // limit to last element (back to input)
                        if (index > lastIndex) {
                            index = -1;
                        }
                        $scope.selIx = index;
                        if (index === -1) {
                            input[0].focus();
                        } else {
                            // give it time for the tags to re-render, fixes issue with tag 0 not being selected after previous tag 0 is deleted
                            $timeout(function () {
                                $scope.$broadcast('focus-cursor-' + index);
                            });
                        }
                    }

                    /**
                     * removes tag from model
                     * @param {object} tag to be removed
                     */
                    function removeTag(tag) {
                        var index = $scope.model.indexOf(tag);
                        $scope.model.splice(index, 1);
                    }

                    /**
                     * updates enabled state
                     */
                    function updateEnabled() {
                        $scope.enabled = !$scope.disabled && !$scope.unbound;
                    }

                    /**
                     * notifies corkInputTagsResults directive to search for "terms"
                     * @param {string} terms
                     */
                    var debouncedSearch = corkThrottling.debounceBoth(function (terms) {
                        corkPubsub.publish(eventNamespace + '.search', terms);
                    }, optionDebounceMs, true);

                    // -- messaging handlers

                    /**
                     * handles the xxx.search event sent from the paired corkInputTagsControl directive
                     * @param {string} eventName
                     * @param {string} terms
                     */
                    var handleUpdateSelectedResultsTag = function (eventName, tag) {
                        selectedResultTag = tag;
                    };

                    var handleResultClicked = function (eventName, tag) {
                        $scope.addTag(tag);
                    };

                    /**
                     * listen for corkInputTagsResults events
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.updateSelectedResultsTag', handleUpdateSelectedResultsTag));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.resultClicked', handleResultClicked));

                    // -- public API

                    /**
                     * adds tag to model
                     * @param {object} tag to be added
                     */
                    $scope.addTag = function (tag) {
                        if (optionMaxTags && !optionRestrictToMax && $scope.model.length >= optionMaxTags) {
                            return;
                        }
                        $scope.model.push(tag);
                        $scope.newLabel = '';
                        corkPubsub.publish(eventNamespace + '.clearResults');
                    };

                    /**
                     * adds new tag to model
                     * @param {object} tag to be added
                     */
                    $scope.addNewTag = function (label) {
                        if (optionMaxTags && !optionRestrictToMax && $scope.model.length >= optionMaxTags) {
                            return;
                        }
                        if (optionMinLength && !label || label.length < optionMinLength) {
                            return;
                        }
                        var returnValue = optionFnAdd(label);
                        if (isPromise(returnValue)) {
                            returnValue.then(function (tag) {
                                if (isObject(tag)) {
                                    $scope.addTag(tag);
                                }
                            });
                        } else if (isObject(returnValue)) {
                            $scope.addTag(returnValue);
                        }
                    };

                    /**
                     *
                     */
                    $scope.unselectTag = function () {
                        $scope.selIx = -1;
                        $scope.willDelete = false;
                        input[0].focus();
                    };

                    /**
                     * removes tag, invoked on ng-click
                     * @param {object} tag
                     */
                    $scope.removeTag = function (tag) {
                        // @todo if (enabled)
                        removeTag(tag);
                        $scope.unselectTag();
                    };

                    // -- dom handlers

                    /**
                     * handles focus, unselects the model tag currently selected
                     */
                    $scope.onInputFocus = function ($event) {
                        // @todo optionally show results on focus
                        $scope.unselectTag();
                    };

                    /**
                     * handles left key presses on tag input:
                     * - Left/Backspace: select last tag in list (if cursor is at zero)
                     */
                    $scope.onInputKeyDown = function ($event) {
                        var code = corkUiKeys.getCode($event);
                        // Up/Down
                        if (code === corkUiKeys.key.Down || code === corkUiKeys.key.Up) {
                            $event.preventDefault();
                        }
                        // Left/Bsckspace
                        if (input[0].selectionEnd === 0) {
                            if (code === corkUiKeys.key.Left) {
                                updateSelectedTag($scope.model.length - 1);
                            }
                            if (code === corkUiKeys.key.Backspace) {
                                updateSelectedTag($scope.model.length - 1);
                                $scope.$broadcast('focus-remove-btn-' + $scope.selIx);
                            }
                        }
                    };

                    /**
                     * handles up/down key presses on tag input:
                     * - Down: selects next available/enabled result (if any)
                     * - Up: selects previous available/enabled result (if any)
                     * - Enter: add the tag
                     * - Left: select last tag in list
                     */
                    $scope.onInputKeyUp = function ($event) {
                        var code = corkUiKeys.getCode($event);
                        if (preventedKeys.indexOf(code) !== -1) {
                            $event.preventDefault();
                        }
                        // Down: selects next available/enabled result (if any)
                        if (code === corkUiKeys.key.Down) {
                            corkPubsub.publish(eventNamespace + '.nextResult');
                        }
                        // Up: selects previous available/enabled result (if any)
                        else if (code === corkUiKeys.key.Up) {
                            corkPubsub.publish(eventNamespace + '.previousResult');
                        }
                        // Enter: add tag currently selected (or create a new tag)
                        else if (code === corkUiKeys.key.Enter) {
                            if (selectedResultTag) {
                                $scope.addTag(selectedResultTag);
                            } else if (isFunction(optionFnAdd)) {
                                $scope.addNewTag($scope.newLabel);
                            }
                            // @todo else if optionFnAdd && min tag length
                        }
                        // Left: select last tag
                    };

                    /**
                     * handles blur
                     */
                    $scope.onInputBlur = function () {
                        // @todo optionally hide results on blur
                    };

                    /**
                     * handles focus on a tag cursor
                     */
                    $scope.onCursorFocus = function (index) {
                        $scope.selIx = index;
                    };

                    /**
                     * handles up/down key presses on a tag cursor
                     * - Escape: refocus input
                     * - Backspace: select this tag remove btn (if any)
                     * - Left: select previous tag cursor (if any or back to input)
                     */
                    $scope.onCursorKeyDown = function ($event, index) {
                        $event.preventDefault();
                        var code = corkUiKeys.getCode($event);
                        // Escape: refocus input
                        if (code === corkUiKeys.key.Esc) {
                            $scope.unselectTag();
                        }
                        // Backspace: select this tag remove button (if exists)
                        else if (code === corkUiKeys.key.Backspace) {
                            $scope.$broadcast('focus-remove-btn-' + index);
                        }
                        // Left: select previous tag cursor (if exists)
                        else if (code === corkUiKeys.key.Left) {
                            updateSelectedTag($scope.selIx - 1);
                        }
                        // Right: select next tag cursor (or back to input)
                        if (code === corkUiKeys.key.Right) {
                            updateSelectedTag($scope.selIx + 1);
                        }
                    };

                    /**
                     * handles up/down key presses on a tag cursor
                     * - Right: select next tag cursor (or back to input)
                     */
                    $scope.onCursorKeyUp = function ($event, index) {
                        $event.preventDefault();
                        var code = corkUiKeys.getCode($event);

                    };

                    /**
                     * handles blur from a tag cursor
                     */
                    $scope.onCursorBlur = function (index) {
                        // @todo optionally hide results on blur
                    };

                    /**
                     * handles focus on a remove button cursor
                     */
                    $scope.onRemoveBtnFocus = function (index) {
                        $scope.willDelete = true;
                    };

                    /**
                     * handles up/down key presses on a remove button cursor
                     * - Escape: refocus input
                     * - Backspace: remove this tag
                     * - Left: select previous tag cursor (if any or back to input)
                     * - Right: select next tag cursor (or back to input)
                     */
                    $scope.onRemoveBtnKeyDown = function ($event, index) {
                        $event.preventDefault();
                        var code = corkUiKeys.getCode($event);
                        // Escape: refocus input
                        if (code === corkUiKeys.key.Esc) {
                            $scope.unselectTag();
                        }
                        // Backspace: removes this tag, focus on previous tag cursor
                        else if (code === corkUiKeys.key.Backspace) {
                            removeTag($scope.model[$scope.selIx]);
                            updateSelectedTag($scope.selIx - 1);
                            $scope.willDelete = false;
                        }
                        // Left: select previous tag cursor (if exists)
                        else if (code === corkUiKeys.key.Left) {
                            updateSelectedTag($scope.selIx - 1);
                            $scope.willDelete = false;
                        }
                        // Right: select next tag cursor (or back to input)
                        else if (code === corkUiKeys.key.Right) {
                            updateSelectedTag($scope.selIx + 1);
                            $scope.willDelete = false;
                        }
                    };

                    /**
                     * handles blur from a remove button cursor
                     */
                    $scope.onRemoveBtnBlur = function (index) {
                        // @todo optionally hide results on blur
                        $scope.willDelete = false;
                    };

                    // -- scope handlers

                    /**
                     * updates the enabled state
                     */
                    $scope.$watch('disabled', function () {
                        updateEnabled();
                    });

                    /**
                     * updates the displayed tags when model changes
                     *
                     * notifies corkInputTagsResults in order to filter out these tags from the result set
                     */
                    $scope.$watch('model', function (newVal) {
                        if (isArray(newVal)) {
                            // @todo enable
                        } else {
                            // @todo disable
                        }
                        corkPubsub.publish(eventNamespace + '.updateExcludeTagIds', $scope.model);
                        if (optionMinTags) {
                            $scope.form.$setValidity(ERROR.MIN_TAGS, $scope.model.length >= optionMinTags);
                        }
                        if (optionMaxTags) {
                            $scope.form.$setValidity(ERROR.MAX_TAGS, $scope.model.length <= optionMaxTags);
                        }

                        updateEnabled();
                    }, true);

                    /**
                     * searches for tags when user types at least min characters, clears them if less than min
                     */
                    $scope.$watch('newLabel', function (newVal) {
                        if (newVal && newVal.length >= optionMinLength) {
                            debouncedSearch(newVal);
                        } else if (!newVal || newVal.length < optionMinLength) {
                            corkPubsub.publish(eventNamespace + '.clearResults');
                        }
                    });

                    /**
                     * removes DOM and pub/sub listeners when scope is destroyed
                     */
                    $scope.$on('$destroy', function () {
                        corkPubsub.unsubscribeArr(pubSubGuids);
                    });
                }
            };
        }
    ])

    /**
     * @ngdoc directive
     * @name ng.cork.input-tags.corkInputTagsResults
     *
     * @description
     * Tag input search results
     *
     * @scope
     * @restrict A
     *
     * @param {string=} corkUuid Optional UUID.
     * @param {object=} corkOptions Override the default options.
     */
    .directive('corkInputTagsResults', [
        'corkDeepExtend',
        'corkInputTagsConfig',
        'corkPubsub',
        function corkInputTagsResults(corkDeepExtend, corkInputTagsConfig, corkPubsub) {

            return {
                templateUrl: 'lib/ng.cork.input-tags/results.tpl.html',
                restrict: 'A',
                scope: {
                    uuid: '@corkUuid',
                    options: '=corkOptions'
                },
                link: function ($scope, $element, $attrs) {

                    /**
                     * @var {array} stores pubsub guids for bulk unsubscription on scope destruction
                     */
                    var pubSubGuids = [];

                    /**
                     * @var {string} generates a unique event namespace for pubsub from the provided uuid
                     */
                    var eventNamespace = 'corkInputTags.' + $scope.uuid;

                    /**
                     * @var {object} default configuration
                     */
                    var config = corkInputTagsConfig.config;

                    /**
                     * configuration options
                     */
                    var opts = $scope.opts = corkDeepExtend(copy(config), $scope.options || {});

                    var optionFnSearch = opts.searchFn;
                    var optionAttrId = opts.attr.id;
                    var optionAttrLabel = opts.attr.label;
                    var optionTplResult = opts.tpl.result;

                    // -- state

                    /**
                     * @var {array} rawResults unfiltered, as provided by the searchFn
                     */
                    var rawResults = [];

                    /**
                     * @var tag currently selected (will be unset if tag is no longer visible/enabled)
                     */
                    var selectedResultsTag = null;

                    /**
                     * @var if of tag currently selected tag (or previously selected tag, enables reinstating it if it becomes visisble/enabled again, e.g., if removed from model)
                     */
                    var selelctedResultsTagId = null;

                    /**
                     * @var {array} list of tags assigned to model in corkInputTagsControl, exclude these from raw results
                     */
                    var excludeTagIds = null;

                    // -- scope vars

                    /**
                     * @var {number} index of currently selected result in the filtered list
                     */
                    $scope.selIx = -1;

                    /**
                     * @var {array} results filtered, with the usedTagsId removed
                     */
                    $scope.results = [];

                    /**
                     * @var {object} opts relevant for the template
                     */
                    $scope.opts = {
                        attr: {
                            label: optionAttrLabel
                        },
                        tpl: {
                            result: optionTplResult
                        }
                    };

                    // -- private

                    /**
                     * updates results with given set, filtering out the used ones
                     * @param {array} results
                     */
                    function updateResults(results) {
                        $scope.results.length = 0;
                        var tag;
                        if (isArray(results)) {
                            for (var ix = 0; ix < results.length; ix++) {
                                tag = results[ix];
                                if (!excludeTagIds || excludeTagIds.indexOf(tag[optionAttrId]) === -1) {
                                    $scope.results.push(tag);
                                }
                            }
                        }
                    }

                    /**
                     * updates $scope.selIx and selelctedResultsTagId based on desired next index
                     * notifies paired corkInputTagsControl if selection changes
                     *
                     * @param {index} desired next index, pass -1 to revert to search for previously selected id
                     */
                    function updateSelected(index) {
                        var ix;
                        // restore to a previously selected result id (pass in -1 to trigger the update)
                        if (index < 0 && selelctedResultsTagId) {
                            for (ix = 0; ix < $scope.results.length; ix++) {
                                if (selelctedResultsTagId === $scope.results[ix][optionAttrId]) {
                                    // found it, update the index, keep the same id
                                    $scope.selIx = ix;
                                    // reinstate the tag?
                                    if (!selectedResultsTag) {
                                        selectedResultsTag = $scope.results[ix];
                                        corkPubsub.publish(eventNamespace + '.updateSelectedResultsTag', selectedResultsTag);
                                    }
                                    return;
                                }
                            }
                        }
                        // limit to list length
                        if (index + 1 > $scope.results.length) {
                            index = $scope.results.length - 1;
                        }
                        // limit to 0 or negative if list is empty
                        if (index < 0) {
                            index = $scope.results.length ? 0 : -1;
                        }
                        // update index
                        $scope.selIx = index;
                        // something is selected, update the id
                        if (index >= 0) {
                            selelctedResultsTagId = $scope.results[index][optionAttrId];
                            // and update the previously selected tag (if different OR if previously node)
                            if (!selectedResultsTag || selelctedResultsTagId !== selectedResultsTag.id) {
                                selectedResultsTag = $scope.results[index];
                                corkPubsub.publish(eventNamespace + '.updateSelectedResultsTag', selectedResultsTag);
                            }
                        }
                        // unselect the previously selected tag
                        // we just keep the id to reinstante it if it shows up in the results
                        else if (selectedResultsTag) {
                            selectedResultsTag = null;
                            corkPubsub.publish(eventNamespace + '.updateSelectedResultsTag', selectedResultsTag);
                        }
                    }

                    // -- messaging handlers

                    /**
                     * handles the xxx.updateExcludeTagIds event sent from the paired corkInputTagsControl directive
                     * @param {string} eventName
                     * @param {object} tags currently in the model, ignore these
                     */
                    var handleUpdateExcludeTagIds = function (eventName, tags) {
                        if (tags && tags.length) {
                            excludeTagIds = [];
                            for (var ix = 0; ix < tags.length; ix++) {
                                excludeTagIds.push(tags[ix][optionAttrId]);
                            }
                        } else {
                            excludeTagIds = [];
                        }
                        // update current results (if any) filtering out the used set
                        updateResults(rawResults);
                        // resets the current selection
                        updateSelected(-1);
                    };

                    /**
                     * handles the search results
                     * @param {array} results
                     */
                    var handleResults = function (results) {
                        results = results || [];
                        // update current results filtering out the used set
                        rawResults = copy(results);
                        updateResults(results);
                        // tries to find a previously selected id
                        updateSelected(-1);
                    };

                    /**
                     * handles the xxx.search event sent from the paired corkInputTagsControl directive
                     * @param {string} eventName
                     * @param {string} terms passed into the search fn()
                     */
                    var handleSearch = function (eventName, terms) {
                        var returnValue = isFunction(optionFnSearch) ? optionFnSearch(terms) : null;
                        if (isPromise(returnValue)) {
                            returnValue.then(function (results) {
                                handleResults(results);
                            });
                        } else {
                            handleResults(returnValue);
                        }
                    };

                    /**
                     * handles the xxx.search event sent from the paired corkInputTagsControl directive
                     */
                    var handleClear = function () {
                        rawResults = [];
                        $scope.results = [];
                        updateSelected(-1);
                    };

                    /**
                     * handles the xxx.search event sent from the paired corkInputTagsControl directive
                     */
                    var handleNextResult = function () {
                        updateSelected($scope.selIx + 1);
                    };

                    /**
                     * handles the xxx.previousResult event sent from the paired corkInputTagsControl directive
                     * @param {string} eventName
                     * @param {string} terms
                     */
                    var handlePreviousResult = function ($ev, terms) {
                        updateSelected($scope.selIx - 1);
                    };

                    /**
                     * listen for corkInputTags events
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.updateExcludeTagIds', handleUpdateExcludeTagIds));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.search', handleSearch));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.clearResults', handleClear));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.nextResult', handleNextResult));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.previousResult', handlePreviousResult));

                    // -- public

                    $scope.tagClick = function (tag) {
                        corkPubsub.publish(eventNamespace + '.resultClicked', $scope.results[$scope.selIx]);
                    };

                    // -- dom handlers

                    // -- scope handlers

                    /**
                     * removes listeners when scope is destroyed
                     */
                    $scope.$on('$destroy', function () {
                        corkPubsub.unsubscribeArr(pubSubGuids);
                    });
                }
            };
        }
    ]);

})(angular);
