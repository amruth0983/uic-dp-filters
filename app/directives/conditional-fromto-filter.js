(function() {
  "use strict";

  angular.module('DesignPortal')
  .directive('dpConditionalFromToFilter', function(){
    return {
      restrict:'A',
      scope:{
        'field': '=fieldvalue',
        'openFilter': '&openFilter',
        'setQueryParams': '&setQueryParams',
        'searchParams': '=searchParams',
        'currentStateParams':'=currentStateParams'
      },
      controller: ['$scope', 'dpConfig', function($scope, dpConfig) {
        $scope.selectedItems = [];
        $scope.titles = [];
        $scope.currentfilter = null;
        $scope.dpConfig = dpConfig;
        $scope.clearFilter = function(isClearBredcrum,$event){
          $scope.filterType = '';
          var i;
          for(i in $scope.selectedItems){
            $scope.selectedItems[i]['start'] = '';
            $scope.selectedItems[i]['end'] = '';
          }
          if(isClearBredcrum){$scope.currentfilter = '';}
          else{
            $scope.setFilterData(true);
          }
          if($event) { $event.stopPropagation(); }
        }

        $scope.validate = function(field){
          var parent = angular.element('[description="'+field.description+'"]');
          $scope.removeError(parent);
          var i;
          for(i in $scope.selectedItems){
            var startobj = angular.element('[elem="start'+i+'"]'); 
            var endobj = angular.element('[elem="end'+i+'"]'); 
            var start = $scope.selectedItems[i].start;
            var end = $scope.selectedItems[i].end;

            if(!validateInput(startobj,endobj)){
              return false;
            }

            if(!start && end){
              $scope.errormessage = 'Please enter start value';
              angular.element(startobj).addClass('errorborder')
              return false;
            }
            
            if(!end && start){
              $scope.errormessage = 'Please enter end value';
              angular.element(endobj).addClass('errorborder')
              return false;
            }

            if(start && end){
              if(Number(start) > Number(end)){
                $scope.errormessage = 'End value must be greater than start value';
                angular.element(endobj).addClass('errorborder')
                return false; 
              }  
            }
          }
          $scope.setFilterData();
        };

        function validateInput(startobj,endobj){
          var start = startobj.value || startobj[0].value;
          var end = endobj.value || endobj[0].value;
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

        $scope.bindSearchString = function(){
          var currentfilter = '';
          var i;
          for(i in $scope.selectedItems){
            if($scope.selectedItems[i]['start'] && $scope.selectedItems[i]['end']){
              currentfilter += i+' '+ 
                            ($scope.selectedItems[i]['start'] || 0) + '-' + 
                            ($scope.selectedItems[i]['end'] || 0) + 
                            ($scope.field.placeholder || '') + '/';
            }
          }
          $scope.currentfilter = currentfilter.substr(0,currentfilter.length-1);
        };

        $scope.setFilterData = function(isClear,isClearBredcrum){
          var tmpArray = [];
          var i;
          if(isClear){
            $scope.currentfilter = '';
            $scope.field.openfilter = false;
            $scope.sendFilterData(isClear);   
          }
          else{
            for(i in $scope.selectedItems){
              if($scope.selectedItems[i]['start'] && $scope.selectedItems[i]['end']){
                tmpArray[tmpArray.length] = {
                  type:i,
                  start:$scope.selectedItems[i]['start'],
                  end:$scope.selectedItems[i]['end']
                }
              }
            }

            if(tmpArray.length>0){
              $scope.bindSearchString();
              $scope.field.openfilter = false;
              $scope.sendFilterData(isClear,tmpArray);
            }
            else{
              var startobj = angular.element('[elem="start'+$scope.titles[0].toLowerCase()+'"]');
              var endobj = angular.element('[elem="end'+$scope.titles[0].toLowerCase()+'"]');
                
              $scope.errormessage = 'Please enter start and end value';
              angular.element(startobj).addClass('errorborder')
              angular.element(endobj).addClass('errorborder')
            }
          }
        };

        $scope.sendFilterData = function(isClear,tmpArray){
          var request = [];
          if(isClear){
            request.push({
              type:'',
              start:'',
              end:''
            });
            $scope.setQueryParams({params:request,isClear:isClear,type:$scope.field.field});
          }
          else{
            if(tmpArray.length>0){
              $scope.setQueryParams({params:tmpArray,isClear:isClear,type:$scope.field.field});
            }
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
        }

        $scope.validateValue = function(event){
          var keyCode = event.which || event.keyCode; 
          var keyCodeChar = String.fromCharCode(keyCode); 
          $scope.removeError();
          if( keyCode === 13)//enter key pressed
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
          else if (!keyCodeChar.match(new RegExp("[0-9]", "i"))) {
              $scope.errormessage = '!!! Sorry, only numbers allowed';
              angular.element(event.currentTarget).addClass('errorborder')
              event.preventDefault();
              return false;
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
            else if (!keyCodeChar.match(new RegExp("[0-9]", "i"))) {
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
              if(temp[i].fieldType.toLowerCase() == $scope.field.field.toLowerCase())
              {
                $scope.params = {
                  field: temp[i].fieldType || '',
                  values: temp[i].values,
                  isInput: temp[i].isChecked || false
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
                values: temp.values,
                isInput: temp.isChecked || false
              }
              $scope.openFilter({'field':$scope.field});
              $scope.field.openfilter = false;
            }    
          }
        }
        
        $scope.$watch('field.searchFieldValues', function(value){
          if($scope.params && $scope.params.hasOwnProperty('field') && $scope.params.field.toLowerCase() == $scope.field.field.toLowerCase()){
            var currentfilter = '';
            var i,len=$scope.params.values.length;
            for(i=0;i<len;i++){
              var start = $scope.params.values[i].start;
              var end = $scope.params.values[i].end;
              var tech = $scope.params.values[i].technology;

              currentfilter += tech + ' ' + start + '-' + end + ($scope.field.placeholder || '') + '/';

              $scope.selectedItems[tech]['start'] = start;
              $scope.selectedItems[tech]['end'] = end;
            }
            $scope.currentfilter = currentfilter.substr(0,currentfilter.length-1);
          }
        });

        $scope.init = function(filterType){
          $scope.currentfilter = '';
          $scope.selectedItems = {};
          $scope.titles = [];
          if(!filterType){
            return false;
          }
          else if(filterType === 'finished component'){
            $scope.titles = ['Width','Height','Length'];
            $scope.selectedItems['width'] = {};
            $scope.selectedItems['width']['start'] = '';
            $scope.selectedItems['width']['end'] = '';
            $scope.selectedItems['height'] = {};
            $scope.selectedItems['height']['start'] = '';
            $scope.selectedItems['height']['end'] = '';
            $scope.selectedItems['length'] = {};
            $scope.selectedItems['length']['start'] = '';
            $scope.selectedItems['length']['end'] = '';
          }
          else if(filterType === 'tiecords'){
            $scope.titles = ['Width tiecord','Width ending','Height ending'];
            $scope.selectedItems['widthtiecord'] = {};
            $scope.selectedItems['widthtiecord']['start'] = '';
            $scope.selectedItems['widthtiecord']['end'] = '';
            $scope.selectedItems['widthending'] = {};
            $scope.selectedItems['widthending']['start'] = '';
            $scope.selectedItems['widthending']['end'] = '';
            $scope.selectedItems['heightending'] = {};
            $scope.selectedItems['heightending']['start'] = '';
            $scope.selectedItems['heightending']['end'] = '';
          }
          else if(filterType === 'zipper/ puller'){
            $scope.titles = ['Widthteeth'];
            $scope.selectedItems['widthteeth'] = {};
            $scope.selectedItems['widthteeth']['start'] = '';
            $scope.selectedItems['widthteeth']['end'] = '';
          }
          else{
            $scope.titles = ['Width','Height'];
            $scope.selectedItems['width'] = {};
            $scope.selectedItems['width']['start'] = '';
            $scope.selectedItems['width']['end'] = '';
            $scope.selectedItems['height'] = {};
            $scope.selectedItems['height']['start'] = '';
            $scope.selectedItems['height']['end'] = '';
          }
          $scope.filterType = filterType;
        };

        $scope.clearSelectedFilter = function(field){
          var i;
          for(i in $scope.selectedItems)
          {
            if(i == field.technology){
              $scope.selectedItems[i]['start'] = '';
              $scope.selectedItems[i]['end'] = '';
              $scope.bindSearchString();
              return false;
            }
          }
        };

        $scope.init(($scope.currentStateParams && $scope.currentStateParams['trimtype']) ? $scope.currentStateParams['trimtype'] : ($scope.currentStateParams['division'] === 'footwear' ? $scope.currentStateParams['type'] : null));
        setSearchParams();
      }],
      link: function(scope){
        var $scope = scope;
        
        $scope.$on('hierarchyChanged', function(event,value){
          if($scope.filterType != value.trimtype){
            $scope.init(value.trimtype);
          }
        });

        $scope.$on('removefrompath', function(event,args){
          $scope.field.openfilter = false;
          if(args.field == $scope.field.field){
            $scope.clearSelectedFilter(args);
            return false;
          }
          else if(args.clearAll == true){
            $scope.clearFilter(true);
          }
        });

        $scope.$on('unCheckFilter', function(event,args){
          if(args.field == $scope.field.field && scope.currentfilter){
            $scope.clearFilter(false);
          }
        });
      },
      tempalte:require('../templates/dirconditionalfromtotmpl.html')
    }
  })
})();
