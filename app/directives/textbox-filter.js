(function() {
  "use strict";

  angular.module('uic-dp-filter')
  .directive('dpTextboxFilter', function(){
    return {
      restrict:'A',
      scope:{
        'field': '=fieldvalue',
        'openFilter': '&openFilter',
        'setQueryParams': '&setQueryParams',
        'searchParams': '=searchParams'
      },
      controller: ['$scope', 'dpConfig', function($scope, dpConfig) {
        $scope.currentfilter = null;
        $scope.params = {};
        $scope.dpConfig = dpConfig;
        $scope.clearFilter = function(field,isClearBredcrum,$event){
          $scope.currentfilter = null;
          var parent = angular.element('[description="'+$scope.field.description+'"]');
          var startobj = parent[0].querySelector('[ng-model="start"]');
          startobj.value = '';
          if(!isClearBredcrum){
            $scope.sendFilterData('0',field.field,field.placeholder,true);
          }
          if($event) { $event.stopPropagation(); }
        }

        $scope.validate = function(field){
          $scope.currentfilter = null;
          var parent = angular.element('[description="'+field.description+'"]');
          var startobj = parent[0].querySelector('[ng-model="start"]');
          $scope.removeError(parent);
          var start = startobj.value;
          
          if(!validateInput(startobj)){
            return false;
          }

          if(!start){
            $scope.errormessage = 'Please enter '+field.description;
            angular.element(startobj).addClass('errorborder')
            return false;
          }
          
          field.openfilter = false;
          $scope.sendFilterData(start,field.field,field.placeholder,false);
        };

        function validateInput(startobj){
          var start = startobj.value;
          if($scope.field.allowDecimal === true){
            if(!validateDot(start,startobj))
            {
              return false;
            }
          }
          return true;
        }
        
        function validateDot(value,valueObj){
          if(value.split('.').length >=2){ 
            if(value.split('.')[0].length < 1 || value.split('.')[0].length > 4){
              $scope.errormessage = '!!! Sorry, input should be in "NNNN.DD" format. eg: 1234.65';
              angular.element(valueObj).addClass('errorborder')
              event.preventDefault();
              return false;   
            }
            if(value.split('.')[1].length > 2){
              $scope.errormessage = '!!! Sorry, input should be in "NNNN.DD" format. eg: 1234.65';
              angular.element(valueObj).addClass('errorborder')
              event.preventDefault();
              return false;   
            }
          }
          return true;
        }

        $scope.sendFilterData = function(start,fieldvalue,placeholder,isClear){
          var request = { 
            start:start,
            field:fieldvalue,
            technology: '',
            controlType: $scope.field.type
          }
          if(!isClear){ $scope.bindSearchString(start,placeholder); }
          
          $scope.setQueryParams({param:request,isClear: isClear});
        };

        $scope.bindSearchString = function(start,placeholder){
          $scope.currentfilter = {
            start: start || 0, 
            placeholder: placeholder
          }
        };

        $scope.removeError = function(parent){
          $scope.errormessage = '';
          var parent;
          if(!parent){
            parent = angular.element('[description="'+$scope.field.description+'"]');
          }
          var elems = parent[0].querySelectorAll('.errorborder');
          for(var i=0;i<elems.length;i++){
            angular.element(elems[i]).removeClass('errorborder')  
          }
        };
        
        $scope.validateValue = function(event){
          var keyCode = event.which || event.keyCode; 
          var keyCodeChar = String.fromCharCode(keyCode); 
          $scope.removeError();
          if($scope.field.allowDecimal === true){
            if (keyCode === 13)//enter key pressed
            {
              $scope.validate($scope.field);        
            }   
            else if(keyCodeChar == '.') 
            {
              if(event.target.value.length >= 1){ 
                if(event.target.value.split('.').length>1){ // allow only single '.'
                  event.preventDefault();
                  return false;
                }
              }
              else{
                event.preventDefault();
                return false;  
              }
            }                       
            else if (!keyCodeChar.match(new RegExp("[0-9]", "i"))) { // allow only numbers
                $scope.errormessage = '!!! Sorry, only numbers allowed';
                angular.element(event.currentTarget).addClass('errorborder')
                event.preventDefault();
                return false;
            }
          }
          else{
            if(keyCode === 13)//enter key pressed
            {
              $scope.validate($scope.field);        
            } 
            else if ($scope.field.allowInt === true && !keyCodeChar.match(new RegExp("[0-9]", "i"))) {
                $scope.errormessage = '!!! Sorry, only numbers allowed';
                angular.element(event.currentTarget).addClass('errorborder')
                event.preventDefault();
                return false;
            }
          }
        };
        
        function setSearchParams(){
          var temp = $scope.searchParams ? $scope.searchParams[0] : null;
          if(Array.isArray(temp)){
            for(var i=0;i<temp.length;i++)
            {
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase()){
                $scope.params = {
                  field: temp[i].fieldType || '',
                  start: temp[i].values.technology || ''
                }
                $scope.openFilter({'field':$scope.field});
                $scope.field.openfilter = false;
                return false;
              }
            }
          }
          else if(temp){
            if(temp.fieldType.toLowerCase() == $scope.field.field.toLowerCase()){
              $scope.params = {
                field: temp.fieldType || '',
                start: temp.values.technology || ''
              }
              $scope.openFilter({'field':$scope.field});
              $scope.field.openfilter = false;
            }
          }
        }

        setSearchParams();
      }],
      link: function(scope){
        var $scope = scope;
        scope.$on('removefrompath', function(event,args){
          $scope.field.openfilter = false;
          if(args.field == $scope.field.field || args.clearAll == true){
            $scope.clearFilter($scope.field,true);
            return false;
          }
        });

        $scope.$watch('params', function(value){
          if($scope.params && $scope.params.hasOwnProperty('field') && $scope.params.field.toLowerCase() == $scope.field.field.toLowerCase()){
            $scope.bindSearchString($scope.params.start || 0,$scope.field.placeholder);
            var parent = angular.element('[description="'+$scope.field.description+'"]');
            if(parent.length > 0){
              var startobj = parent[0].querySelector('[ng-model="start"]');
              startobj.value = $scope.params.start;
            }
            return false;
          }
        });

        $scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && scope.currentfilter){
            $scope.clearFilter($scope.field,false);
          }
        });
      },
      tempalte:require('../templates/dirtextboxtmpl.html')
    }
  })
})();
