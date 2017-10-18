angular.module('reusableFilters.landing.controller', [])
	.controller('reusableFilterController', reusableFilterController);

reusableFilterController.$inject=['$scope', '$templateCache'];

function reusableFilterController($scope, $templateCache) {
	var _this = this;
	console.log('hai');
}
