// if(window.angular === undefined) {
//   var angular = require('angular');
// }

angular
.module('uic-filter')
.directive('uicDpFilter', function() {
  return {
    controller: 'uiDpFilterController',
    controllerAs: 'uiDpFilterCtrl',
    scope: {
      config: '=?'
    },
    template: require('../../../templates/uicdpfiltertmpl.html'),
    restrict: 'AE',
    replace: true,
    link: function(scope, element) {
      scope.$on('$destroy', function() {
        element.empty();
      });

    }
  };
});
