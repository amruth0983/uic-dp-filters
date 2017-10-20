// if(window.angular === undefined) {
//   var angular = require('angular');
// }

angular
.module('uic-dp-filter')
.directive('uicDpFilter', function() {
  return {
    scope: {
      config: '=?'
    },
    template: require('../templates/uicdpfiltertmpl.html'),
    restrict: 'AE',
    replace: true,
    link: function(scope, element) {
      scope.$on('$destroy', function() {
        element.empty();
      });

    }
  };
});
