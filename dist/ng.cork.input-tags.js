/**
 * ng.cork.input-tags - v0.0.5 - 2015-04-16
 * https://github.com/cork-labs/ng.cork.input-tags
 *
 * Copyright (c) 2015 Cork Labs <http://cork-labs.org>
 * License: MIT <http://cork-labs.mit-license.org/2015>
 */
angular.module('ng.cork.input-tags.templates', []).run(['$templateCache', function($templateCache) {
$templateCache.put("lib/ng.cork.input-tags/inputTags.tpl.html",
"<ng-form name=form class=\"cork-input-tags cork-input-tags-control\" ng-class=\"{'cork-is-disabled': disabled, 'cork-it-results-block': opts.display.results === 'block', 'cork-it-results-inline': opts.display.results === 'inline', 'cork-it-tags-block': opts.display.tags === 'block', 'cork-it-tags-inline': opts.display.tags === 'inline'}\"><div ng-if=\"opts.display.tags !== 'hide'\" cork-input-tags-tags ng-model=model cork-uuid={{UUID}} cork-options=options cork-disabled=disabled></div><div class=cork-it-input-container><input class=form-control ng-model=newLabel placeholder={{opts.placeholder}} ng-focus=onInputFocus() ng-keyup=onInputKeyUp($event) ng-keydown=\"onInputKeyDown($event)\"><div ng-if=\"opts.display.results !== 'hide'\" class=cork-it-results-container><div cork-input-tags-results cork-uuid={{UUID}} cork-options=opts></div></div></div></ng-form>");
$templateCache.put("lib/ng.cork.input-tags/inputTagsResults.tpl.html",
"<div class=\"cork-input-tags cork-input-tags-results\"><div class=cork-it-tag ng-repeat=\"tag in results\" ng-class=\"{'cork-is-selected': selIx === $index}\" ng-click=tagClick(tag)><div class=cork-it-add-icon><i class=\"cork-icon fa fa-plus\"></i> <span class=cork-icon-text>add</span></div><div class=cork-it-label><div class=cork-it-content ng-include=opts.tpl.result></div></div></div></div>");
$templateCache.put("lib/ng.cork.input-tags/inputTagsTags.tpl.html",
"<div class=\"cork-input-tags cork-input-tags-tags\"><div class=cork-it-tag ng-repeat=\"tag in model\" ng-class=\"{'cork-is-selected': selIx === $index, 'cork-will-delete': willDelete}\" title=\"Tag '{{tag[opts.attr.label]}}', press backspace to highlight this tag for removal, press left to select previous tag, press right to select next tag, press escape to return to the add tag input.\" ng-focus=onTagFocus($index) ng-keydown=\"onTagKeyDown($event, $index)\" cork-ui-focus-on=corkInputTags.focus-tag-{{$index}}><div class=cork-it-label><div class=cork-it-content ng-include=opts.tpl.label></div></div><button class=cork-it-remove-btn title=\"Tag '{{tag[opts.attr.label]}}', press backspace to remove tag, press left to select previous tag, press right to select next tag, press escape to return to the add tag input.\" ng-click=removeTag(tag) ng-focus=onRemoveBtnFocus($index) ng-keydown=\"onRemoveBtnKeyDown($event, $index)\" ng-blur=onRemoveBtnBlur($index) cork-ui-enter-click cork-ui-stop-propagation cork-events=\"['keydown']\" cork-ui-focus-on=corkInputTags.focus-remove-btn-{{$index}}><i class=\"cork-icon fa fa-times\"></i> <span class=cork-icon-text>remove</span></button></div></div>");
$templateCache.put("lib/ng.cork.input-tags/label.tpl.html",
"<div>{{tag[opts.attr.label]}}</div>");
$templateCache.put("lib/ng.cork.input-tags/result.tpl.html",
"<div>{{tag[opts.attr.label]}}</div>");
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
     * Allows configuration of {@link ng.cork.input-tags.corkInputTags}, {@link ng.cork.input-tags.corkInputTags} and {@link ng.cork.input-tags.corkInputTagsResults} directives.
     */
    module.provider('corkInputTagsConfig', [
        'corkDeepExtend',
        function corkInputTagsConfigProvider(corkDeepExtend) {
            var provider = this;

            /**
             * @type {Object} provider configuration.
             */
            var serviceConfig = {
                minLength: 2,
                addFn: noop,
                searchFn: noop,
                attr: {
                    id: 'id',
                    label: 'label'
                },
                display: {
                    tags: 'inline',
                    results: 'inline',
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
     * Tag input control
     *
     * @scope
     * @restrict A
     * @requires ngModel
     *
     * @param {string=} corkUuid Optional UUID.
     * @param {object=} corkOptions Override the default options.
     * @param {boolean=} corkDisabled Optional expression to enable/disable the field.
     */
    module.directive('corkInputTags', [
        'cxGenerate',
        'corkDeepExtend',
        'corkInputTagsConfig',
        'corkPubsub',
        'corkUiKeys',
        'corkThrottling',
        function corkInputTags(cxGenerate, corkDeepExtend, corkInputTagsConfig, corkPubsub, corkUiKeys, corkThrottling) {

            var preventedKeys = [corkUiKeys.key.Up, corkUiKeys.key.Down, corkUiKeys.key.Enter];

            return {
                templateUrl: 'lib/ng.cork.input-tags/inputTags.tpl.html',
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    uuid: '@corkUuid',
                    options: '=corkOptions',
                    disabled: '=corkDisabled'
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
                     * @var {object} default configuration
                     */
                    var config = corkInputTagsConfig.config;

                    /**
                     * configuration options
                     */
                    var opts = $scope.opts = corkDeepExtend(copy(config), $scope.options || {});

                    $scope.UUID = $scope.uuid || cxGenerate.uuid();

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
                     * @var {string} generates a unique event namespace for pubsub from the provided uuid
                     */
                    var eventNamespace = 'corkInputTags.' + $scope.UUID;

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
                     * @var {number} index of the tag currently selected in the model tag index (-1) if none
                     */
                    $scope.selIx = -1;

                    /**
                     * @var {boolean} True if focus is on a tag remove button
                     */
                    $scope.willDelete = false;

                    // -- private

                    function focusInput() {
                        input[0].focus();
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

                    function clearResults() {
                        selectedResultTag = null;
                        corkPubsub.publish(eventNamespace + '.results.clearResults');
                    }

                    /**
                     * notifies corkInputTagsResults directive to search for "terms"
                     * @param {string} terms
                     */
                    var debouncedSearch = corkThrottling.debounceBoth(function (terms) {
                        corkPubsub.publish(eventNamespace + '.results.search', terms);
                    }, optionDebounceMs, true);

                    // -- message handlers

                    /**
                     * @param {string} eventName
                     * @param {object} tag
                     */
                    var handleOnTagsBlur = function () {
                        if (opts.display.tags !== 'hide') {
                            focusInput();
                        }
                    };

                    /**
                     * @param {string} eventName
                     * @param {object} tag
                     */
                    var handleOnRemoveTag = function () {
                        removeTag();
                    };

                    /**
                     * @param {string} eventName
                     * @param {object} tag
                     */
                    var handleOnSelectResult = function (eventName, tag) {
                        selectedResultTag = tag;
                    };

                    /**
                     * @param {string} eventName
                     * @param {string} terms
                     */
                    var handleOnResultClicked = function (eventName, tag) {
                        $scope.addTag(tag);
                        input[0].focus();
                    };

                    /**
                     * events
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.tags.onBlur', handleOnTagsBlur));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.tags.onRemoveTag', handleOnRemoveTag));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.onSelectResult', handleOnSelectResult));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.onResultClicked', handleOnResultClicked));

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
                        clearResults();
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
                     * removes tag, invoked on ng-click
                     * @param {object} tag
                     */
                    $scope.removeTag = function (tag) {
                        // @todo if (enabled)
                        removeTag(tag);
                        corkPubsub.publish(eventNamespace + '.tags.unselectTags');
                        input[0].focus();
                    };

                    // -- dom handlers

                    /**
                     * handles focus, unselects the model tag currently selected
                     */
                    $scope.onInputFocus = function ($event) {
                        // @todo optionally show results on focus
                        corkPubsub.publish(eventNamespace + '.tags.unselectTags');
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
                        // Left/Backspace
                        if (input[0].selectionEnd === 0 && opts.display.tags !== 'hide') {
                            if (code === corkUiKeys.key.Left) {
                                corkPubsub.publish(eventNamespace + '.tags.selectLastTag');
                            }
                            if (code === corkUiKeys.key.Backspace) {
                                corkPubsub.publish(eventNamespace + '.tags.selectLastTag');
                                corkPubsub.publish(eventNamespace + '.tags.focusRemoveButton');
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
                            corkPubsub.publish(eventNamespace + '.results.nextResult');
                        }
                        // Up: selects previous available/enabled result (if any)
                        else if (code === corkUiKeys.key.Up) {
                            corkPubsub.publish(eventNamespace + '.results.previousResult');
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

                    // -- scope handlers

                    /**
                     * searches for tags when user types at least min characters, clears them if less than min
                     */
                    $scope.$watch('newLabel', function (newVal) {
                        if (newVal && newVal.length >= optionMinLength) {
                            debouncedSearch(newVal);
                        } else if (!newVal || newVal.length < optionMinLength) {
                            clearResults();
                        }
                    });

                    /**
                     * notifies corkInputTagsResults to re-filter out these tags from the result set
                     * @todo set form validity
                     * updates the enabled state
                     */
                    $scope.$watch('model', function (newVal) {

                        // notify corkInputTagsResults to re-filter
                        corkPubsub.publish(eventNamespace + '.results.updateExcludeTagIds', $scope.model);

                        // @todo set form validity
                        if (optionMinTags) {
                            $scope.form.$setValidity(ERROR.MIN_TAGS, $scope.model.length >= optionMinTags);
                        }
                        if (optionMaxTags) {
                            $scope.form.$setValidity(ERROR.MAX_TAGS, $scope.model.length <= optionMaxTags);
                        }

                        // enable/disable depending on a valid ng-model
                        $scope.unbound = !isArray(newVal);
                        updateEnabled();

                    }, true);

                    /**
                     * updates the enabled state
                     */
                    $scope.$watch('disabled', function () {
                        updateEnabled();
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
    ]);

    /**
     * @ngdoc directive
     * @name ng.cork.input-tags.corkInputTagsTags
     *
     * @description
     * Displays model tags and provides a way to remove them from model.
     *
     * @scope
     * @restrict A
     * @requires ngModel
     *
     * @param {string=} corkUuid Optional UUID.
     * @param {object=} corkOptions Override the default options.
     */
    module.directive('corkInputTagsTags', [
        '$timeout',
        'corkDeepExtend',
        'corkInputTagsConfig',
        'corkPubsub',
        'corkUiKeys',
        function corkInputTagsTags($timeout, corkDeepExtend, corkInputTagsConfig, corkPubsub, corkUiKeys) {

            return {
                templateUrl: 'lib/ng.cork.input-tags/inputTagsTags.tpl.html',
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    uuid: '@corkUuid',
                    options: '=corkOptions',
                    disabled: '=corkDisabled',
                },
                link: function ($scope, $element, $attrs, $ngModel) {

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

                    // -- scope vars

                    /**
                     * @var {boolean} true if model is not an array, will force disabled
                     */
                    $scope.unbound = false;

                    /**
                     * @var {boolean} enaled (by provided option OR because not bound) updated on updateEnabled()
                     */
                    $scope.enabled = false;

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
                        var length = $scope.model && $scope.model.length || 0;
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
                            corkPubsub.publish(eventNamespace + '.tags.onBlur');
                        } else {
                            // give it time for the tags to re-render, fixes issue with tag 0 not being selected after previous tag 0 is deleted
                            $timeout(function () {
                                $scope.$broadcast('corkInputTags.focus-tag-' + index);
                            });
                        }
                    }

                    /**
                     * updates enabled state
                     */
                    function updateEnabled() {
                        $scope.enabled = !$scope.disabled && !$scope.unbound;
                    }

                    /**
                     *
                     */
                    function unselectTag() {
                        $scope.selIx = -1;
                        $scope.willDelete = false;
                    }

                    /**
                     *
                     */
                    function selectLastTag() {
                        if ($scope.model && $scope.model.length) {
                            $scope.selIx = $scope.model.length - 1;
                            $scope.$broadcast('corkInputTags.focus-tag-' + $scope.selIx);
                        }
                    }

                    /**
                     *
                     */
                    function focusRemoveButton() {
                        $scope.$broadcast('corkInputTags.focus-remove-btn-' + $scope.selIx);
                    }

                    /**
                     * commands
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.tags.unselectTags', unselectTag));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.tags.selectLastTag', selectLastTag));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.tags.focusRemoveButton', focusRemoveButton));

                    // -- public

                    /**
                     * handles focus on a tag cursor
                     */
                    $scope.onTagFocus = function (index) {
                        $scope.selIx = index;
                    };

                    /**
                     * handles up/down key presses on a tag cursor
                     * - Escape: refocus input
                     * - Backspace: select this tag remove btn (if any)
                     * - Left: select previous tag cursor (if any or back to input)
                     * - Right: select next tag cursor (or back to input)
                     */
                    $scope.onTagKeyDown = function ($event, index) {
                        $event.preventDefault();
                        var code = corkUiKeys.getCode($event);
                        // Escape: refocus input
                        if (code === corkUiKeys.key.Esc) {
                            unselectTag();
                            corkPubsub.publish(eventNamespace + '.tags.onBlur');
                        }
                        // Backspace: select this tag remove button (if exists)
                        else if (code === corkUiKeys.key.Backspace) {
                            $scope.$broadcast('corkInputTags.focus-remove-btn-' + index);
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
                            unselectTag();
                            corkPubsub.publish(eventNamespace + '.tags.onBlur');
                        }
                        // Backspace: removes this tag, focus on previous tag cursor or input
                        else if (code === corkUiKeys.key.Backspace) {
                            corkPubsub.publish(eventNamespace + '.tags.onRemoveTag', $scope.model[$scope.selIx]);
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

                    // -- scope watches

                    /**
                     * updates the enabled state
                     */
                    $scope.$watch('model', function (newVal) {
                        $scope.unbound = !isArray(newVal);
                        updateEnabled();
                    });

                    /**
                     * updates the enabled state
                     */
                    $scope.$watch('disabled', function () {
                        updateEnabled();
                    });

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
    module.directive('corkInputTagsResults', [
        'corkDeepExtend',
        'corkInputTagsConfig',
        'corkPubsub',
        function corkInputTagsResults(corkDeepExtend, corkInputTagsConfig, corkPubsub) {

            return {
                templateUrl: 'lib/ng.cork.input-tags/inputTagsResults.tpl.html',
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
                     * @var {object} tag currently selected (will be unset if tag is no longer visible/enabled)
                     */
                    var selectedTag = null;

                    /**
                     * @var {array} list of tags assigned to model in corkInputTags, exclude these from raw results
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
                     * updates $scope.selIx based on desired next index
                     * notifies paired corkInputTags if selection changes
                     *
                     * @param {index} desired next index, pass -1 to revert to search for previously selected id
                     */
                    function updateSelected(index) {
                        var ix;
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
                            // and update the previously selected tag (if different OR if previously none)
                            if (!selectedTag) {
                                selectedTag = $scope.results[index];
                                corkPubsub.publish(eventNamespace + '.results.onSelectResult', selectedTag);
                            }
                        }
                        // unselect the previously selected tag
                        else if (selectedTag) {
                            selectedTag = null;
                            corkPubsub.publish(eventNamespace + '.results.onSelectResult', selectedTag);
                        }
                    }

                    // -- messaging handlers

                    /**
                     * handles the xxx.results.updateExcludeTagIds event sent from the paired corkInputTags directive
                     * @param {string} eventName
                     * @param {object} tags currently in the model, ignore these
                     */
                    var updateExcludeTagIds = function (eventName, tags) {
                        if (isArray(tags) && tags.length) {
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
                     * handles the results.search message sent from the paired corkInputTags directive
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
                     * handles the results.clear message sent from the paired corkInputTags directive
                     */
                    var clearResults = function () {
                        rawResults = [];
                        $scope.results = [];
                        updateSelected(-1);
                    };

                    /**
                     * handles the xxx.search message sent from the paired corkInputTags directive
                     */
                    var nextResult = function () {
                        updateSelected($scope.selIx + 1);
                    };

                    /**
                     * handles the xxx.results.previousResult message sent from the paired corkInputTags directive
                     * @param {string} eventName
                     * @param {string} terms
                     */
                    var previousResult = function ($ev, terms) {
                        updateSelected($scope.selIx - 1);
                    };

                    /**
                     * commands
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.search', handleSearch));

                    /**
                     * events
                     */
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.updateExcludeTagIds', updateExcludeTagIds));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.clearResults', clearResults));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.nextResult', nextResult));
                    pubSubGuids.push(corkPubsub.subscribe(eventNamespace + '.results.previousResult', previousResult));

                    // -- public

                    $scope.tagClick = function (tag) {
                        corkPubsub.publish(eventNamespace + '.results.onResultClicked', $scope.results[$scope.selIx]);
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
