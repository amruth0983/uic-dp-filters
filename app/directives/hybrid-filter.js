(function() {
  "use strict";

  angular.module('uic-dp-filter')
  .directive('dpHybridFilter', function(){
    return {
      restrict:'A',
      scope:{
        'field': '=fieldvalue',
        'openFilter': '&openFilter',
        'setQueryParams': '&setQueryParams',
        'searchParams': '=searchParams'
      },
      controller: ['$scope', 'dpConfig', function($scope, dpConfig) {
        $scope.controlsCount = 1;
        $scope.selectedItems = [];
        $scope.currentfilter = null;
        $scope.dpConfig = dpConfig;
        $scope.clearFilter = function(isClearBredcrum,$event){
          $scope.controlsCount = 1;
          $scope.selectedItems = [];
          $scope.selectedItems[0] = {};
          $scope.params = {};
          if(isClearBredcrum){$scope.currentfilter = '';}
          else{
            $scope.setFilterData(true);
          }
          if($event) { $event.stopPropagation(); }
        }

        $scope.clearSelectedFilter = function(field){
          var i,len=$scope.selectedItems.length;
          for(i=0;i<len;i++){
            if($scope.selectedItems[i].type && $scope.selectedItems[i].type.name == field.technology){
              $scope.selectedItems.splice(i,1);
              $scope.controlsCount -= 1;
              $scope.bindSearchString();
              bindParams();
              if($scope.selectedItems.length <=0){
                $scope.controlsCount = 1;
                $scope.selectedItems[0] = {};
                $scope.currentfilter = '';
              }
              return false;
            }
          }
        };

        $scope.addElement = function(){
          $scope.controlsCount += 1;
        };

        $scope.removeElement = function(field){
          $scope.controlsCount -= 1;
          $scope.selectedItems.pop();
          $scope.validate(field);
        };

        $scope.validate = function(field){
          var parent = angular.element('[description="'+field.description+'"]');
          $scope.removeError(parent);
          var i,length=$scope.selectedItems.length;
          for(i=0; i<length;i++){
            var typeobj = angular.element('[elem="type'+i+'"]'); 
            var startobj = angular.element('[elem="start'+i+'"]'); 
            var endobj = angular.element('[elem="end'+i+'"]'); 
            var type = $scope.selectedItems[i].type.name;
            var start = $scope.selectedItems[i].start;
            var end = $scope.selectedItems[i].end;
            
            if(!type){
              $scope.errormessage = '!!Select a Composition';
              angular.element(typeobj).addClass('errorborder')
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

            if(Number(start) > 100){
              $scope.errormessage = '!!Choose a value between 0-100%';
              angular.element(startobj).addClass('errorborder')
              return false; 
            }

            if(Number(end) > 100){
              $scope.errormessage = '!!Choose a value between 0-100%';
              angular.element(endobj).addClass('errorborder')
              return false; 
            }

            if(Number(start) > Number(end)){
              $scope.errormessage = 'End value must be greater than start value';
              angular.element(endobj).addClass('errorborder')
              return false; 
            }
          }
          $scope.setFilterData();
        };

        $scope.bindSearchString = function(){
          var currentfilter = '';
          var i,len=$scope.selectedItems.length;
          for(i=0;i<len;i++){
            currentfilter += ($scope.selectedItems[i]['type'] ? $scope.selectedItems[i]['type']['name'] : '')+' '+ 
                            ($scope.selectedItems[i]['start'] || 0) + '-' + 
                            ($scope.selectedItems[i]['end'] || 0) + 
                            ($scope.field.placeholder || '%') + '/';
          }
          $scope.currentfilter = currentfilter.substr(0,currentfilter.length-1);
        };

        $scope.setFilterData = function(isClear,isClearBredcrum){
          if(!isClear){
            $scope.bindSearchString();
            $scope.field.openfilter = false;
            $scope.sendFilterData(isClear);
          }
          else{
            $scope.currentfilter = '';
            $scope.field.openfilter = false;
            $scope.sendFilterData(isClear); 
          }
        };

        function bindParams(){
          var request = [];
          $scope.params = {
            field:$scope.field.field,
            values:[]  
          };
          for(var i in $scope.selectedItems){
            request.push({
              type:$scope.selectedItems[i]['type'] ? $scope.selectedItems[i]['type']['name'] : '',
              start:$scope.selectedItems[i]['start'],
              end:$scope.selectedItems[i]['end']
            });
            $scope.params.values.push({
              technology:$scope.selectedItems[i]['type'] ? $scope.selectedItems[i]['type']['name'] : '',
              start:$scope.selectedItems[i]['start'],
              end:$scope.selectedItems[i]['end'],
              field:$scope.params.field
            });
          }
          return request;
        }

        $scope.sendFilterData = function(isClear){
          var request = [];
          if(isClear){
            request.push({
              type:'',
              start:'',
              end:''
            });
          }
          else{
            request = bindParams();
          }
          $scope.setQueryParams({params:request,isClear:isClear,type:$scope.field.field});
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
        }

        $scope.validateValue = function(event){
          var keyCode = event.which || event.keyCode; 
          var keyCodeChar = String.fromCharCode(keyCode); 
          $scope.removeError();
          if( keyCode === 13)//enter key pressed
          {
              $scope.validate( $scope.field);
          }
          else if (!keyCodeChar.match(new RegExp("[0-9]", "i"))) {
              $scope.errormessage = '!!! Sorry, only numbers allowed';
              angular.element(event.currentTarget).addClass('errorborder')
              event.preventDefault();
              return false;
          }
        };
        
        function setSearchParams(){
          var temp = $scope.searchParams ? $scope.searchParams[0] : null;
          if(Array.isArray(temp)){
            for(var i=0;i<temp.length;i++)
            {
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase())
              {
                $scope.params = {
                  field: temp[i].fieldType || '',
                  values: temp[i].values,
                  isInput: temp[i].isChecked || false
                }
                $scope.controlsCount = temp[i].values.length;
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
                values: temp.values,
                isInput: temp.isChecked || false
              }
              $scope.controlsCount = temp.values.length;
              $scope.openFilter({'field':$scope.field});
              $scope.field.openfilter = false;
            }    
          }
        }
        
        $scope.$watch('field.searchFieldValues', function(value){
          if((value && $scope.params) && ($scope.params.field.toLowerCase() == $scope.field.field.toLowerCase())){
            var currentfilter = '';
            var i,len=$scope.params.values.length;
            $scope.selectedItems = [];
            for(i=0;i<len;i++){
              var start = $scope.params.values[i].start;
              var end = $scope.params.values[i].end;
              var tech = $scope.params.values[i].technology;

              currentfilter += tech+' '+ start + '-' + end + ($scope.field.placeholder || '%') + '/';

              $scope.selectedItems.push({
                'type':{name:tech},
                'start':start,
                'end':end
              })
            }
            $scope.currentfilter = currentfilter.substr(0,currentfilter.length-1);
          }
        });

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
            $scope.clearSelectedFilter(args);
            return false;
          }
          else if(args.clearAll == true){
            $scope.clearFilter(true);
          }
        });

        scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && scope.currentfilter){
            $scope.clearFilter(false);
          }
        });
      },
      tempalte:require('../templates/dirhybridtmpl.html')
    }
  });

})();
