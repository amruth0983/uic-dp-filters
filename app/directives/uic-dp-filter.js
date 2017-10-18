var angular = require('../lib/angular/angular.min.js');

angular
.module('uic-dp-filter')
.directive('uicDPFilter', function() {
  return {
    scope: {
      config: '=?'
    },
    template: require('../templates/uic-dp-filter.html'),
    restrict: 'AE',
    replace: true,
    link: function(scope, element) {
      console.log('hai');
      scope.$on('$destroy', function() {
        element.empty();
      });

    }
  };
});
