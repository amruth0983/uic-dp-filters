(function() {
  "use strict";

  angular.module('uic-dp-filter')
  .directive('dpDropdownFilter', function(){
    return {
      restrict:'A',
      scope:{
        'field': '=fieldvalue',
        'openFilter': '&openFilter',
        'setQueryParams': '&setQueryParams',
        'searchParams': '=searchParams'
      },
      controller: ['$scope', 'dpConfig', function ($scope, dpConfig) {
        $scope.selectedValue = {};
        $scope.dpConfig = dpConfig;

        $scope.clearFilter = function(isClearBredcrum,$event){
          $scope.selectedValue = {};
          var request = {
            selected: '',
            type: $scope.field.field,
            placeholder: $scope.field.placeholder
          } 
          if(!isClearBredcrum){
            $scope.setQueryParams({param:request,isClear:true});
          }
          if($event) { $event.stopPropagation(); }
        };

        function setSearchParams(){
          var temp = $scope.searchParams ? $scope.searchParams[0] : null;
          if(Array.isArray(temp)){
            for(var i=0;i<temp.length;i++)
            {
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase()){
                $scope.selectedValue['value'] = {};
                $scope.selectedValue['value']['name'] = temp[i].values.technology;
                $scope.openFilter({'field':$scope.field});
                $scope.field.openfilter = false;
                return false;
              }
            }
          }
          else if(temp){
            if(temp.fieldType.toLowerCase() == $scope.field.field.toLowerCase()){
              $scope.selectedValue['value'] = {};
              $scope.selectedValue['value']['name'] = temp.values.technology;
              $scope.openFilter({'field':$scope.field});
              $scope.field.openfilter = false;
            }
          }
        }

        $scope.sendFilterData = function(){
          var request = {
            selected: $scope.selectedValue.value.name || '',
            type: $scope.field.field,
            placeholder: $scope.field.placeholder
          } 
          $scope.field.openfilter = false;
          $scope.setQueryParams({param:request});
        };

        $scope.validate = function(){
          $scope.sendFilterData();
        };

        $scope.showTooltip = function(event, last) {
          if($(event.target).position().top <= 52) {
            //Count the first 2 elements to display their tooltips at the bottom(approx. 52px)
            if(!last) {
              $(event.target).parent().addClass('first-dropdown-element');
            } else {
              $(event.target).parent().addClass('small-dropdown-list');
            }
          }
        };

        $scope.resetClasses = function(event) {
          $('.first-dropdown-element').removeClass('first-dropdown-element');
          $('.small-dropdown-list').removeClass('small-dropdown-list');
        };

        setSearchParams();
      }],
      link: function(scope){
        var $scope = scope;
        scope.$on('removefrompath', function(event,args){
          $scope.field.openfilter = false;
          if(args.field == $scope.field.field || args.clearAll == true){
            $scope.clearFilter(true);
            return false;
          }
        });

        scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && Object.keys($scope.selectedValue).length > 0){
            $scope.clearFilter(false);
          }
        });
      },
      tempalte:require('../templates/dirdropdowntmpl.html')
    }
  })
})();