(function() {
  "use strict";

  angular.module('DesignPortal')
  .directive('dpMultiDropdownFilter', function(){
    return {
      restrict:'A',
      scope:{
        'field': '=fieldvalue',
        'openFilter': '&openFilter',
        'setQueryParams': '&setQueryParams',
        'searchParams': '=searchParams'
      },
      controller: ['$scope', 'dpConfig', function($scope, dpConfig) {
        $scope.selectedValue = {};
        $scope.currentfilter = '';
        $scope.dpConfig = dpConfig;
        $scope.clearFilter = function(isClearBredcrum,$event){
          $scope.selectedValue = {};
          $scope.currentfilter = '';
          var request = {
            selected: [],
            type: $scope.field.field,
            placeholder: $scope.field.placeholder
          } 
          if(!isClearBredcrum){
            $scope.setQueryParams({params:request,isClear:true});
          }
          if($event) { $event.stopPropagation(); }
        };

        function setSearchParams(){
          var temp = $scope.searchParams ? $scope.searchParams[0] : null;
          $scope.selectedValue['value'] = [];
          if(Array.isArray(temp)){
            for(var i=0;i<temp.length;i++)
            {
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase())
              {
                var j,len=temp[i].values.length;
                for(j=0;j<len;j++){
                  $scope.selectedValue.value.push({'name':temp[i].values[j].technology});
                }
                $scope.openFilter({'field':$scope.field});  
                $scope.bindSearchString();
               // $scope.field.openfilter = false;
                return false;
              }
            }
          }
          else if(temp){
            if(temp.fieldType.toLowerCase() == $scope.field.field.toLowerCase()){
              var i,len=temp.values.length;
              for(i=0;i<len;i++){
                $scope.selectedValue.value.push({'name':temp[i].values[j].technology});
              }
              $scope.openFilter({'field':$scope.field});
              $scope.bindSearchString();
              $scope.field.openfilter = false;
            }
          }
        }

        $scope.bindSearchString = function(){
          var currentfilter = '';
          var i,len=$scope.selectedValue.value.length;
          for(i=0;i<len;i++){
            currentfilter += $scope.selectedValue.value[i]['name']+'/';
          }
          $scope.currentfilter = currentfilter.substr(0,currentfilter.length-1);
        };

        $scope.sendFilterData = function(){
          var i,len=$scope.selectedValue.value.length;
          var strValues = [];
          for(i=0;i<len;i++){
            strValues.push($scope.selectedValue.value[i]['name']);
          }
          var request = {
            selected: strValues,
            type: $scope.field.field,
            placeholder: $scope.field.placeholder
          } 
          $scope.bindSearchString();
          //$scope.field.openfilter = false;
          $scope.setQueryParams({params:request});
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
          if(args.field == $scope.field.field){
            var i,len=$scope.selectedValue.value ? $scope.selectedValue.value.length : 0;
            for(i=0;i<len;i++){
              if($scope.selectedValue.value[i]['name'] == args.technology){
                $scope.selectedValue.value.splice(i,1);
                $scope.bindSearchString();
                return false;
              }
            }
          }
          else if(args.clearAll == true){
            $scope.clearFilter(true);
            return false;
          }
        });

        scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && $scope.currentfilter){
            $scope.clearFilter(false);
          }
        });
      },
      tempalte:require('../templates/dirmultidropdowntmpl.html')
    }
  })
})();
