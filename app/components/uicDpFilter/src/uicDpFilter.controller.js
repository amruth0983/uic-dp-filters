(function () {
	'use strict';

function uiDpFilterController($scope, $templateCache, $timeout) {
	var _this = this;
	_this.filtersArr = [];
	_this.filterType = null;
	_this.filterObj = null;
	_this.filterLabelParam = [];
	_this.filterTypesList = ['hybrid', 'range', 'fromto', 'dropdown', 'checkbox', 'textbox'];
	_this.configObj = $scope.config;
	_this.currentStateParams = {};


	function retrieveFiltersBasedOnType(type, $event) {
		if (angular.isUndefined($event) || $event.target.nodeName !== 'INPUT') {
			return;
		}
		var filtersList = _this.configObj.data,i;
		_this.filtersArr = [];
		console.log(type);

			for(i = 0; i<filtersList.length; i++) {
				if(type === filtersList[i].type) {
					_this.filtersArr.push(filtersList[i]);
				}
			}
	}

	function showHideFilters(field, hideAll) {
		var i, len = _this.filterObj.length;
		for (i = 0; i < len; i++) {
			// if(hideAll) {
			// 	_this.filterObj[i].openfilter = false;
			// } else {
				if (_this.filterObj[i].openfilter && _this.filterObj[i].field != field.field) {
					_this.filterObj[i].openfilter = false;
				}
			// }
		}
	}

	function expandAddonFilter(field) {
		showHideFilters(field);
		field.openfilter = !field.openfilter;
		if (field.openfilter == true) {
			if (field.type != 'textbox' && field.type != 'fromto' && field.type != 'conditionalfromto') {
				getSelectedFilterValues(field);
			} else {
				$timeout(function() {
					angular.element('.'+field.field+'.mos-filter-section input.' + field.field + '-start')[0].focus();
				});
			}
		}
	}

	function setQueryParams(param, isClear) {
		if (!isClear) {
			selectFilter(param.field, param.start, param.end, '', param.controlType, param.placeholder);
		} else {
			removeFilters(param.field, param.start, param.end, param.technology, 'true');
		}
	}

	function compositionSearch(params, isClear, type) {
		var i, len = params.length,
				compositionType = '';
		compositionType = (type === 'composition') ? 'comp' : type;
		_this.compositionsAdded = [];
		if (!isClear) {
			for (i = 0; i < _this.filterLabelParam.length; i++) {
				if (_this.filterLabelParam[i]['field'] == type) {
					_this.filterLabelParam.splice(i, 1);
					i--;
				}
			}
			_this.currentStateParams[compositionType] = [];
			for (i = 0; i < len; i++) {
				var localCompObj = {};
				localCompObj.technology = params[i]['type'];
				localCompObj.start = params[i]['start'];
				localCompObj.end = params[i]['end'];
				localCompObj.field = type;
				localCompObj.type = compositionType;
				_this.compositionsAdded.push(localCompObj);
				_this.filterLabelParam.push(localCompObj);

				var compString = params[i]['type'].toLowerCase().split(' ').join('') + ':' + params[i]['start'] + ':' + params[i]['end'];
				_this.currentStateParams[compositionType].push(compString);
			}
			search();
		} else {
			removeFilters(type, params.start, params.end, params.technology, 'true');
		}
	}

	function selectFilter(field, start, end, technology, controlType, placeholder) {
		var flag = 0;
		field = field.toLowerCase();
		if (start && start.indexOf(' ') > -1) {
			start = parseInt(start.substr(start.indexOf(' ') + 1, start.length));
		}
		if (end && end.indexOf(' ') > -1) {
			end = parseInt(end.substr(end.indexOf(' ') + 1, end.length));
		}
		if (isNaN(end)) {
			end = '*';
		}
		if (isNaN(start)) {
			start = 0;
		}
		angular.forEach(_this.filterLabelParam, function (item, i) {
			if (item.field === field) {
				_this.filterLabelParam.splice(i, 1);
			}
		});
		pushValues(field, start, end, technology, placeholder);
		search();
	}

	function pushValues(field, start, end, technology, placeholder) {
		//Function only pushes the values to the filterParams. Reduces code redundancy
		var currentFilterParam = {};
		currentFilterParam.field = field;
		currentFilterParam.start = start;
		currentFilterParam.end = end;
		currentFilterParam.placeholder = placeholder || '';
		if (technology) {
			currentFilterParam.technology = technology;
		} else {
			currentFilterParam.technology = '';
		}
		_this.filterLabelParam.push(currentFilterParam);
		_this.currentStateParams[field.toLowerCase()] = start + ':' + end;
	}

	function getSelectedFilter(field) {
		var suggestParams = {};
			suggestParams.field = field.field == 'comp' ? 'composition' : field.field;
		angular.forEach(_this.filterLabelParam, function (item) {
			if(item.field !== 'grouptype') {
				if (!item.type) {
					if(suggestParams.field !== item.field){
						if (item.end) {
							suggestParams[item.field.toLowerCase()] = item.start + ':' + item.end;
						} else if (!item.technology && item.start) {
							suggestParams[item.field.toLowerCase()] = item.start + ':*';
						} else if (item.technology && !item.start) {
							suggestParams[item.field.toLowerCase()] = item.technology;
						}
					}
				} else {
					if(!suggestParams[item.field.toLowerCase()]){ suggestParams[item.field.toLowerCase()] = []; }
					var compString = item.technology.toLowerCase() + ':' + item.start + ':' + item.end;
					if(!item.start){
						compString = item.technology.toLowerCase();
						suggestParams[item.field.toLowerCase()].push(compString);
					} else{
						suggestParams[item.field.toLowerCase()].push(compString);
					}
				}
			} else if(item.field === 'grouptype'){
				suggestParams[item.field.toLowerCase()] = item.technology.split(' ')[0];
				suggestParams['id'] = item.technology.split(' ')[2];
			}
		});
		return suggestParams;
	}

	function getSelectedFilterValues(field) {
		var suggestParams = getSelectedFilter(field),
			filterServiceName = $scope.config.serviceName;

		filterServiceName.getFilters(suggestParams).then(function (data) {
			field.loading = _this.filterloading = false;
			if (data.p_err_code === "success") {
				// if(_this.currentStateParams.hasOwnProperty(field.field) && field.type === 'dropdown') {
				// 	//Remove already selected value from the filter suggest dropdown.
				// 	data.data = data.data.filter(function(filtervalue) {
				// 		if(field.multiple) {
				// 			return (_this.currentStateParams[field.field].indexOf(filtervalue.name) === -1);
				// 		} else {
				// 			return (filtervalue.name !== _this.currentStateParams[field.field]);
				// 		}
				// 	});
				// }
				field.searchFieldValues = data.data;
				setSelectedFilter(field);
			}
			// Focus in the input fields as soon as the BE suggest data is received.
			// if(field.type === 'dropdown') {
			// 	if(field.multiple) {
			// 		angular.element('.'+field.field+ '.mos-filter-section input')[0].focus();
			// 		var uiSelect = angular.element('.'+field.field+ ' .ui-select-container').controller('uiSelect');
			// 		if(angular.isDefined(uiSelect)) {
			// 			uiSelect.activate();
			// 		}
			// 	} else {
			// 		var uiSelect = angular.element('.'+field.field+ ' .ui-select-container').controller('uiSelect');
			// 		$timeout(function() {
			// 			angular.element("."+field.field+ " .ui-select-container input[ng-model='$select.search']")[0].focus();
			// 		});
			// 		uiSelect.open = true;
			// 		uiSelect.activate();
			// 	}
			// } else if(field.type !== 'checkbox') {
			// 	$timeout(function() {
			// 		angular.element('.'+field.field+ '.mos-filter-section input.'+field.field+'-start')[0].focus();
			// 	});
			// }
		}, function (errData) {
			var err = errData;
			field.loading = _this.filterloading = false;
		});
	}

	function setSelectedFilter(field){
		if(field.type === 'range' || field.type === 'checkbox'){
			var i,len=_this.filterLabelParam.length;
			for(var i=0;i<len;i++){
				if(_this.filterLabelParam[i]['field'] === field.field){
					var start = _this.filterLabelParam[i]['start'];
					var end = _this.filterLabelParam[i]['end'];
					var j,valueLen=field.searchFieldValues.length;
					for(j=0;j<valueLen;j++){
						field.searchFieldValues[j].checked = false;
					}
					if(field.type === 'range'){
						for(j=0;j<valueLen;j++){
							if(field.searchFieldValues[j].start == start && field.searchFieldValues[j].end == end){
								field.searchFieldValues[j].checked = true;
								field.anyselected = true;
								return false;
							} else if(field.searchFieldValues[j].start.indexOf('above') >= 0 && end === '*'){
								field.searchFieldValues[j].checked = true;
								field.anyselected = true;
								return false;
							}
						}
					}
				}
			}
		}
	}

	function search() {
		console.log('came here');
	}

	function removeSelectedFilterItem(index, value) {
		_this.filterObj.splice(index, 1);
	}

	_this.retrieveFiltersBasedOnType = retrieveFiltersBasedOnType;
	_this.expandAddonFilter = expandAddonFilter;
	_this.setQueryParams = setQueryParams;
	_this.removeSelectedFilterItem = removeSelectedFilterItem;
	_this.compositionSearch = compositionSearch;
}

uiDpFilterController.$inject=['$scope', '$templateCache', '$timeout'];


angular
.module('uic-filter')
.controller('uiDpFilterController', uiDpFilterController);

}());