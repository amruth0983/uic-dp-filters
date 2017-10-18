(function () {
	"use strict";

	angular.module('reusableFilters')
		.directive('dpCheckboxFilter', function () {
		return {
			restrict: 'E',
			scope: {
				'field': '=fieldvalue',
				'openFilter': '&openFilter',
				'setQueryParams': '&setQueryParams',
				'searchParams': '=searchParams'
			},
			controller: ['$scope', 'dpConfig', function ($scope, dpConfig) {
				$scope.currentfilter = null;
				$scope.params = {};
				$scope.dpConfig = dpConfig;
				$scope.clearFilter = function (field, allitems, isClearBredcrum, $event) {
					$scope.currentfilter = null;
					if (!isClearBredcrum) {
						var request = {
							selected: '',
							type: $scope.field.field,
							placeholder: $scope.field.placeholder
						};
						$scope.setQueryParams({param: request, isClear: true});
					}
					if ($event) {
						$event.stopPropagation();
					}
				};

				$scope.validate = function (field, allitems, isChecked, checkedObj) {
					$scope.currentfilter = checkedObj;
					field.openfilter = false;

					var request = {
						selected: checkedObj || '',
						type: $scope.field.field,
						placeholder: $scope.field.placeholder
					};

					$scope.field.openfilter = false;
					$scope.setQueryParams({param: request, isClear: false});
				};

				function setSearchParams() {
					var temp = $scope.searchParams ? $scope.searchParams[0] : null;
					if (Array.isArray(temp))
					{
						for (var i = 0; i < temp.length; i++)
						{
							if (temp[i].fieldType.toLowerCase() === $scope.field.field.toLowerCase()) {
								$scope.params = {
									field: temp[i].fieldType || '',
									technology: temp[i].values.technology || ''
								};
								$scope.openFilter({'field': $scope.field});
								$scope.field.openfilter = false;
								return false;
							}
						}
					} else if (temp) {
						$scope.params = {
							field: temp.fieldType || '',
							technology: temp.values.technology || ''
						};
						if ($scope.params.field.toLowerCase() === $scope.field.field.toLowerCase()) {
							$scope.openFilter({'field': $scope.field});
							$scope.field.openfilter = false;
						}
					}
				}

				$scope.openFilterFunction = function(field){
					$scope.params = {};
					$scope.openFilter({'field':field});
				};

				$scope.$watch('field.searchFieldValues', function (value) {
					if (value && $scope.params && $scope.params.hasOwnProperty('field')) {
						if ($scope.params.field.toLowerCase() === $scope.field.field.toLowerCase())
						{
							var i, len = value.length;
							for (i = 0; i < len; i++) {
								if (value[i].name === $scope.params.technology) {
									value[i].checked = true;
									$scope.currentfilter = value[i].name;
									return false;
								}
							}
						}
					}
				});

				setSearchParams();
			}],
			link: function (scope) {
				var $scope = scope;
				scope.$on('removefrompath', function (event, args) {
					$scope.field.openfilter = false;
					if (args.field === $scope.field.field || args.clearAll) {
						$scope.clearFilter($scope.field, $scope.field.searchFieldValues, true);
						return false;
					}
				});

				scope.$on('unCheckFilter', function(event,args){
					if(args.field == $scope.field.field && scope.currentfilter){
						$scope.clearFilter($scope.field,$scope.field.searchFieldValues,false);
					}
				});
			},
			templateUrl: '../app/templates/dircheckboxtmpl.html'
		};
	});
})();
