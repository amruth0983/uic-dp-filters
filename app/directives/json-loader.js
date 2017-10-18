(function () {
    "use strict";

    angular.module("DesignPortal")
            .directive('dpHiearchyTree', dpHiearchyTree)
            .directive('treeItem', treeItem)
            .directive('jsonLevelData', jsonLevelData)
            .constant("_", _)
})();

treeItem.$inject = ["$compile", "$rootScope", "$location"];
jsonLevelData.$inject = ["$templateCache", "$compile", "$route"];

function dpHiearchyTree() {

    return {
        restrict: 'A',
        scope: {
          dpHiearchyTree: '=dpHiearchyTree',
          cls: '=ngClass'
        },
        replace: true,
        template: '<ul><li ng-repeat="item in dpHiearchyTree" tree-item="item"></li></ul>',
        link: function(scope, element, attrs) {
          element.addClass(attrs.class);
          element.addClass(scope.cls);
        }
    };
}

function treeItem($compile, $rootScope, $location) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
          item: '=treeItem'
        },
        template: "<li><a href='/calendar?{{item.level}}={{item.title}}'>{{item.title}}</a></li>",
        controller: function() {
            this.menuClick = function(item) {
                console.log(item.link);
            }
        },
        link: function (scope, element, attrs) {
//          element.find('a').bind('click', function() {
//            $rootScope.$broadcast('sendkey', {data: scope.item.title});
//          });
          $compile(element.contents())(scope);
        }
    };
}

function jsonLevelData($templateCache, $compile, $route) {
     return {
        restrict: 'E',
        scope: {
            jsonData: '='
        },
        templateUrl: 'components/calendar-mgmt/partials/filtertmpl.html',
        controller: controller,
        link: jsonLooping
     };

    function controller($scope, dpConfig, MOSMaterialSearchService) {
        $scope.expandAddonFilter = function(field) {
            var suggestParams = {};
            field.openfilter = !field.openfilter;
            if (field.openfilter === true) {
                suggestParams.field = field.field;
                suggestParams.technology = "weft-knitted";
                var method = MOSMaterialSearchService.getFilters;
                 method(suggestParams).then(function (data) {
                    field.loading = _this.filterloading = false;
                    if (data.p_err_code === dpConfig.returnCode.SUCCESS) {
                        field.searchFieldValues = data.data;
                        //setSelectedFilter(field);
                    }

                }, function(error) {
                     console.log(error);
                });
            }
        }
    }

    function jsonLooping(scope, element, attrs) {
         var url ="template/filters/" + attrs.json + ".json",
             jsonResult = JSON.parse($templateCache.get(url)), i, receivedData;
            scope.jsonData = [];

        attrs.$observe("filterModule", function (filterModule) {
            initialPageFilter(filterModule, jsonResult);
        });

        function initialPageFilter(filterModule, data) {
            if(data.hasOwnProperty(filterModule) && Array.isArray(data[filterModule].filters)) {
                for(var i=0; i<data[filterModule].filters.length; i++) {
                    scope.jsonData.push(data[filterModule].filters[i]);
                    console.log(scope.jsonData);
                }
            }
        }

        var levelsArr = [];
        for(var i=1; i<= attrs.levels; i++) {
            var level = "level" + i;
            levelsArr.push(attrs[level]);
        }

        scope.$watch($route.current.params, fetchFilters(), true);

        function fetchFilters() {
            _.forEach($route.current.params, function(value, key) {
                if(levelsArr.indexOf(key)>= 0) {
                    receivedData = value;
                    retrieveFiltersData(receivedData, jsonResult);
                }
            });
        }

        function retrieveFiltersData(filterKey, jsonData) {
            var nextObjData;
            _.forEach(jsonData, function(arrLevelData, key) {
                if(_.has(arrLevelData, filterKey)) {
                    loopFilterData(arrLevelData);
                } else {
                    if(_.has(arrLevelData, 'filters')) {
                        loopFilterData(arrLevelData);
                        nextObjData = _.filter(arrLevelData, function(item) {
                                        if(!(item instanceof Array)) {
                                            return item;
                                        }
                                      });
                        retrieveFiltersData(filterKey, nextObjData);
                    }
                }
            });
        }

        function loopFilterData(arr) {
            var filterData;
            filterData = _.flatten(_.without(_.map(arr, 'filters'), undefined))
            _.forEach(filterData, function(value) {
                scope.jsonData.push(value);
            });
        }
        $compile(element.contents())(scope);
    }
}
