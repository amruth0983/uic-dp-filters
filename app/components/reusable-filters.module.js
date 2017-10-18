angular.module('reusableFilters.landing', [
	'reusableFilters.landing.controller'
])
	.config(routeConfig);

routeConfig.$inject = ['$routeProvider'];

function routeConfig($routeProvider) {
	$routeProvider.when('/', {
		controller: 'reusableFilterController',
		controllerAs: 'rfvm',
		templateUrl: 'app/components/reusable-filters.html'
	});
}
