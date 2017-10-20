(function() {
  "use strict";

  angular.module('uic-dp-filter')
  .directive('dpInputFilter', function(){
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
        $scope.clearFilter = function(field,allitems,isClearBredcrum,$event){
          var selectedFilter = {};
          if($scope.searchParams && $scope.searchParams[0] && $scope.searchParams[0].length) {
            for(var i=0;i<$scope.searchParams[0].length;i++) {
              if($scope.searchParams[0][i].fieldType.toLowerCase() == $scope.field.field.toLowerCase()) {
                selectedFilter = $scope.searchParams[0][i].values;
              }
            }
          }
          for(var i in allitems){
            if(allitems[i].checked) {
              selectedFilter = allitems[i];
            }
          }
          var parent = angular.element('[description="'+$scope.field.description+'"]');
          var startobj = parent[0].querySelector('[ng-model="start"]');
          var endobj = parent[0].querySelector('[ng-model="end"]');
          if(!isClearBredcrum){
            $scope.sendFilterData(selectedFilter.start,selectedFilter.end,field.field,field.placeholder,false,true);  
          }
          field.anyselected = false;
          $scope.currentfilter = null;
          for(var i in allitems){
            allitems[i].checked = false;
          }
          startobj.value = '';
          endobj.value = '';
          if($event) { $event.stopPropagation(); }
        }

        function unCheck(field){
          field.anyselected = false;
          $scope.currentfilter = null;
          var allitems = field.searchFieldValues;
          for(var i in allitems){
            allitems[i].checked = false;
          }
          $scope.sendFilterData('0','0',$scope.field.field,$scope.field.placeholder,true,true);  
        }

        function validateInput(startobj,endobj){
          var start = startobj.value;
          var end = endobj.value;
          if($scope.field.allowDecimal === true){
            if(!validateDot(start,startobj) || !validateDot(end,endobj))
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

        $scope.validate = function(field,allitems,isChecked,checkedObj){
          var isSelected = checkedObj ? checkedObj.checked : false;
          if(isSelected){
            unCheck(field);
            return false;
          }
          for(var i in allitems){
            allitems[i].checked = false;
          }
          field.anyselected = false;
          $scope.currentfilter = null;
          var parent = angular.element('[description="'+field.description+'"]');
          var startobj = parent[0].querySelector('[ng-model="start"]');
          var endobj = parent[0].querySelector('[ng-model="end"]');
          $scope.removeError(parent);
          var start = startobj.value;
          var end = endobj.value;
          if(isChecked){
            checkedObj.checked = !checkedObj.checked;
            field.anyselected = true;
            startobj.value = endobj.value = '';
            if(checkedObj.checked){ start = checkedObj.start; end = checkedObj.end; } else { start = 0; end = 0; }
            field.openfilter = false;
            $scope.sendFilterData(start || 0,end || 0,field.field,field.placeholder,isChecked,false);
            return false;
          }
          if(!validateInput(startobj,endobj)){
            return false;
          }
          if(!start){
            $scope.errormessage = 'Please enter start value';
            angular.element(startobj).addClass('errorborder')
            return false;
          }
          
          if(!end){
            $scope.errormessage = 'Please enter end value';
            angular.element(endobj).addClass('errorborder')
            return false;
          }

          if(Number(start) > Number(end)){
            $scope.errormessage = 'End value must be greater than start value';
            angular.element(endobj).addClass('errorborder')
            return false; 
          }
          field.anyselected = true;
          field.openfilter = false;
          $scope.sendFilterData(start,end,field.field,field.placeholder,false,false);
        };

        $scope.sendFilterData = function(start,end,fieldvalue,placeholder,isChecked,isClear){
          if(start && start.indexOf('above') > -1) {
            end = '*';
          }
          $scope.currentfilter = {
            start: start || 0, 
            end: end || 0,
            placeholder: placeholder
          }
          var request = { 
            start:start,
            end:end,
            field:fieldvalue,
            technology: '',
            isChecked: isChecked,
            controlType: $scope.field.type,
            placeholder: placeholder
          }
          $scope.setQueryParams({param:request,isClear: isClear});
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
        
        $scope.openFilterFunction = function(field){
          $scope.params = {};
          $scope.openFilter({'field':field});
        };

        function setSearchParams() {
          var temp = $scope.searchParams ? $scope.searchParams[0] : null;
          if(Array.isArray(temp))
          {
            for(var i=0;i<temp.length;i++)
            {
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase())
              {
                $scope.params = {
                  field: temp[i].fieldType || '',
                  start: temp[i].values.start || '',
                  end: temp[i].values.end || '',
                  technology: temp[i].values.technology || '',
                  isInput: temp[i].isChecked || false
                }
                $scope.openFilter({'field':$scope.field});
                $scope.field.openfilter = false;
                return false;
              }
            }  
          }
          else if(temp)
          {
            if(temp.fieldType.toLowerCase() == $scope.field.field.toLowerCase())
            {
              $scope.params = {
                field: temp.fieldType || '',
                start: temp.values.start || '',
                end: temp.values.end || '',
                technology: temp.values.technology || '',
                isInput: temp.isChecked || false
              }
              $scope.openFilter({'field':$scope.field});
              $scope.field.openfilter = false;
            }
          }
        }
        
        $scope.$watch('field.searchFieldValues', function(value){
          if(value && $scope.params && $scope.params.hasOwnProperty('field')){
            if($scope.params.field.toLowerCase() == $scope.field.field.toLowerCase()){
              $scope.currentfilter = {
                start: $scope.params.start || 0, 
                end: $scope.params.end || 0,
                placeholder: $scope.field.placeholder
              }
              if(!$scope.field.anyselected){
                var parent = angular.element('[description="'+$scope.field.description+'"]');
                var startobj = parent[0].querySelector('[ng-model="start"]');
                var endobj = parent[0].querySelector('[ng-model="end"]');
                startobj.value = $scope.params.start;
                endobj.value = $scope.params.end;
                $scope.field.anyselected = true;  
                return false;  
              }
            }
          }
        });

        $scope.validateValue = function(event){
          var keyCode = event.which || event.keyCode; 
          var keyCodeChar = String.fromCharCode(keyCode); 
          $scope.removeError();
          if($scope.field.allowDecimal === true){
            if (keyCode === 13)//enter key pressed
            {
              $scope.validate($scope.field,$scope.field.searchFieldValues, false);        
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
            /*else if(event.target.value.split('.').length >=2){ // allow only two character after '.'
              if(event.target.value.split('.')[1].length >= 3){
                event.preventDefault();
                return false;   
              }
            }*/
          }
          else{
            if(keyCode === 13)//enter key pressed
            {
              $scope.validate($scope.field,$scope.field.searchFieldValues, false);        
            } 
            else if (!keyCodeChar.match(new RegExp("[0-9]", "i"))) {
                $scope.errormessage = '!!! Sorry, only numbers allowed';
                angular.element(event.currentTarget).addClass('errorborder')
                event.preventDefault();
                return false;
            }
          }
        };

        setSearchParams();
      }],
      link: function(scope){
        var $scope = scope;
        scope.$on('removefrompath', function(event,args){
          $scope.field.openfilter = false;
          if(args.field == $scope.field.field || args.clearAll == true){
            $scope.clearFilter($scope.field,$scope.field.searchFieldValues,true);
            return false;
          }
        });

        scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && $scope.field.anyselected){
            $scope.clearFilter($scope.field,$scope.field.searchFieldValues,false);
          }
        });
      },
      template: require('../templates/dirinputtmpl.html')
    }
  })
})();
