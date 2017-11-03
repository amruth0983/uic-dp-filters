(function () {
	'use strict';

function uiDpFilterController($scope, $templateCache, $timeout, $location) {
	var _this = this;
	_this.filtersArr = [];
	_this.filterType = null;
	_this.filterObj = [];
	_this.filterVal = '';
	_this.filterLabelParam = [];
	_this.isPageRefreshed = true;
	_this.filterTypesList = ['hybrid', 'range', 'fromto', 'dropdown', 'checkbox', 'textbox'];
	_this.configObj = $scope.config;
	_this.currentStateParams = (_this.configObj) ? _this.configObj.routeParams : {};
	_this.filterServiceName = (_this.configObj) ? _this.configObj.serviceName : '';
	_this.availableFilters = [];


	if(_this.isPageRefreshed) {
		var filters = getFilterFromUrl();
		if(_this.configObj.data && filters && filters.length > 0) {
			var filtersSelected = {
				filters: filters,
				filterLabelParam : _this.filterLabelParam
			}
			$scope.$emit('filtersFromurl', filtersSelected);
			_this.availableFilters.push(filters);
			displayFiltersFromUrl(filters);
		}
		_this.isPageRefreshed = false;
	}

	function displayFiltersFromUrl(filters) {

		var selectedField = [],
		 i, j, k;
		 for(j=0; j< _this.availableFilters[0].length; j++) {
		 	selectedField.push(_this.availableFilters[0][j].fieldType);
		 }
		_this.filterObj = [];
		for(k=0; k< selectedField.length; k++) {
			for(i=0; i< _this.configObj.data.length; i++) {
				if(_this.configObj.data[i].field === selectedField[k]) {
					_this.filterObj.push(_this.configObj.data[i]);
					_this.filterType = _this.configObj.data[i].type;
					break;
				}
			}
		}
		_this.searchParams = _this.availableFilters;	
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

	function retrieveFiltersBasedOnType(type, $event) {
		if (angular.isUndefined($event) || $event.target.nodeName !== 'INPUT') {
			return;
		}
		var filtersList = _this.configObj.data,i;
		_this.filtersArr = [];

			for(i = 0; i<filtersList.length; i++) {
				if(type === filtersList[i].type) {
					_this.filtersArr.push(filtersList[i]);
				}
			}
	}

	function setFilterInfo() {
		if(_this.filterVal && _this.filterVal.length > 0)
		_this.filterObj.push(_this.filterVal[0]);
	}

	function setFilterPlaceHolderDescription() {
		setFilterInfo();
		_this.filterVal = '';
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

	function dropdownSearch(param, isClear) {
		var i, len = param.length;
		for (i = 0; i < _this.filterLabelParam.length; i++) {
			if (_this.filterLabelParam[i]['field'] == param.type) {
				_this.filterLabelParam.splice(i, 1);
				i--;
			}
		}
		var localCompObj = {};
		localCompObj.field = param.type;
		localCompObj.technology = param.selected;
		_this.filterLabelParam.push(localCompObj);
		_this.currentStateParams[param.type.toLowerCase()] = param.selected;
		if (isClear) {
			removeFilters(param.type, param.start, param.end, param.technology, 'true');
		}
		else{ search(); }
	}

	function multiDropdownSearch(params, isClear) {
		var i;
		for (i = 0; i < _this.filterLabelParam.length; i++) {
			if (_this.filterLabelParam[i]['field'] == params.type) {
				_this.filterLabelParam.splice(i, 1);
				i--;
			}
		}
		var len = params.selected.length;
		if(len > 0 && params.selected[0] !== ''){
			_this.currentStateParams[params.type.toLowerCase()] = [];
			for (i = 0; i < len; i++) {
				var localCompObj = {};
				localCompObj.technology = params.selected[i];
				localCompObj.field = params.type;
				localCompObj.type = params.type;
				_this.filterLabelParam.push(localCompObj);
				_this.currentStateParams[params.type.toLowerCase()].push(params.selected[i]);
			}
		}
		else{
			delete _this.currentStateParams[params.type.toLowerCase()];
		}
		if (isClear) {
			removeFilters(params.type, params.start, params.end, params.technology, 'true');
		}
		else{
			search();
		}
	}

	function checkboxSearch(param, isClear) {
		if (!isClear) {
			var i, len = param.length;
			for (i = 0; i < _this.filterLabelParam.length; i++) {
				if (_this.filterLabelParam[i]['field'] == param.type) {
					_this.filterLabelParam.splice(i, 1);
					i--;
				}
			}
			if (_this.currentStateParams[param.type] && (_this.currentStateParams[param.type] === param.selected)) {
				delete _this.currentStateParams[param.type];
				removeFilters(param.type, param.start, param.end, param.selected, 'true');
			} else {
				var localObject = {};
				localObject.field = param.type;
				localObject.technology = param.selected;
				_this.filterLabelParam.push(localObject);
				_this.currentStateParams[param.type] = param.selected;
			}
			if(param.type === 'isag') {
				localStorage.setItem('isag', param.selected);
			}
			search();
		} else {
			if(param.type === 'isag') {
				localStorage.removeItem('isag');
			}
			removeFilters(param.type, param.start, param.end, param.selected, 'true');
		}
	}

	function fromtoSearch(param, isClear) {
		setQueryParams(param, isClear);
	}

	function textboxSearch(param, isClear) {
		var queryParam = {}, iterator = 0;
		_this.currentStateParams[param.field] = param.start;
		for (var i = 0; i < _this.filterLabelParam.length; i++) {
			if (_this.filterLabelParam[i].field === param.field) {
				_this.filterLabelParam[i].technology = param.start;
				break;
			}
			iterator++;
		}
		if ((iterator === _this.filterLabelParam.length) || _this.filterLabelParam.length === 0) {
			queryParam.field = param.field;
			queryParam.technology = _this.currentStateParams[param.field];
			_this.filterLabelParam.push(queryParam);
		}
		if (isClear) {
			removeFilters(param.field, param.start, param.end, param.start, 'true');
		}
		else { search(); }
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
				if(_this.currentStateParams.hasOwnProperty(field.field) && field.type === 'dropdown') {
					//Remove already selected value from the filter suggest dropdown.
					data.data = data.data.filter(function(filtervalue) {
						if(field.multiple) {
							return (_this.currentStateParams[field.field].indexOf(filtervalue.name) === -1);
						} else {
							return (filtervalue.name !== _this.currentStateParams[field.field]);
						}
					});
				}
				field.searchFieldValues = data.data;
				setSelectedFilter(field);
			}
			// Focus in the input fields as soon as the BE suggest data is received.
			if(field.type === 'dropdown') {
				if(field.multiple) {
					angular.element('.'+field.field+ '.mos-filter-section input')[0].focus();
					var uiSelect = angular.element('.'+field.field+ ' .ui-select-container').controller('uiSelect');
					if(angular.isDefined(uiSelect)) {
						uiSelect.activate();
					}
				} else {
					var uiSelect = angular.element('.'+field.field+ ' .ui-select-container').controller('uiSelect');
					$timeout(function() {
						angular.element("."+field.field+ " .ui-select-container input[ng-model='$select.search']")[0].focus();
					});
					uiSelect.open = true;
					uiSelect.activate();
				}
			} else if(field.type !== 'checkbox') {
				$timeout(function() {
					angular.element('.'+field.field+ '.mos-filter-section input.'+field.field+'-start')[0].focus();
				});
			}
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
		var searchParams = {
			currentParams: _this.currentStateParams,
			filterParams: _this.filterLabelParam
		}
		$scope.$emit("uicDPFilterResultData", searchParams);
	}

	function removeFilters(field, start, end, technology, remove, controlType) {
		if(_this.filterLabelParam.length > 0) {
			var searchParams = {
				field: field,
				start: start,
				end: end,
				technology: technology,
				remov: remove,
				controlType: controlType
			}
			$scope.$emit("uicDPRemoveFilterResultData", searchParams);
		}
	}

	function removeSelectedFilterItem(index, value) {
		_this.filterObj.splice(index, 1);
		if(_this.filterLabelParam.length > 0) {
			var removedObj = {
				field: value.field,
				clearAll: true
			}
			if(angular.isDefined(_this.searchParams)) {
				for(var i=0; i< _this.searchParams[0].length; i++) {
					if(_this.searchParams[0][i].fieldType === removedObj.field) {
						_this.searchParams[0].splice(i,1);
					}
				}
			}
			$scope.$broadcast("unCheckFilter", removedObj);
		}
	}

	function getFilterFromUrl() {
		var keys = $location.search();
		var availableFilters = [],
		filtersList = _this.configObj.data;

		for (var i in filtersList) {
			if (keys.hasOwnProperty(filtersList[i].field)) {
				availableFilters.push({
					key: filtersList[i].field,
					value: keys[filtersList[i].field],
					type: filtersList[i].type,
					multiple: filtersList[i].multiple,
					placeholder: filtersList[i].placeholder,
					isChecked: keys['isChecked'] ? (keys['isChecked'] == 'true' ? true : false) : false
				});
				filtersList[i].selected = true;
			}
		}

		if (keys.hasOwnProperty('id') && keys.hasOwnProperty('grouptype')) {
			var localObject = {};
			localObject.field = 'grouptype';
			//localObject.technology = keys['grouptype'] + ' of ' + _this.materialData.material.name;
			localObject.technology = keys['grouptype'] + ' of ' + keys['id'];
			_this.filterLabelParam.push(localObject);
		}
		if (keys.hasOwnProperty('q') && keys['q'] != '*') {
			availableFilters.push({
				key: "q",
				value: keys["q"],
				type: "",
				multiple: false,
				placeholder: ''
			});
		}
		if (keys.hasOwnProperty('keyword')) {
			availableFilters.push({
				key: "keyword",
				value: keys["keyword"],
				type: "",
				multiple: false,
				placeholder: ''
			});
		}
		var filterbox = {
			type: keys.type,
			filters: availableFilters
		}
		var finalbox = [];
		for (var i = 0; i < filterbox.filters.length; i++) {
			var filterObj = {};
			filterObj.fieldType = filterbox.filters[i].key;
			if (filterbox.filters[i].type == 'range') {
				filterObj.isChecked = filterbox.filters[i].isChecked;
				filterObj.values = {
					controlType: filterbox.filters[i].type,
					end: filterbox.filters[i].value.split(':')[1] || '',
					field: filterbox.filters[i].key,
					isChecked: filterbox.filters[i].isChecked,
					start: filterbox.filters[i].value.split(':')[1] == '*' ? 'above ' + (filterbox.filters[i].value.split(':')[0] || '') : (filterbox.filters[i].value.split(':')[0] || ''),
					technology: ""
				}
				if (filterbox.filters[i].value.split(':')[1] == '*') {
					filterObj.isChecked = true;
				}
			} else if (filterbox.filters[i].type == 'checkbox') {
				filterObj.isChecked = true;
				filterObj.values = {
					field: filterbox.filters[i].key,
					isChecked: true,
					technology: filterbox.filters[i].value
				}
			} else if (filterbox.filters[i].type == 'textbox') {
				filterObj.isChecked = false;
				filterObj.values = {
					field: filterbox.filters[i].key,
					technology: filterbox.filters[i].value
				}
			} else if (filterbox.filters[i].type == 'fromto') {
				filterObj.isChecked = false;
				filterObj.values = {
					controlType: filterbox.filters[i].type,
					end: filterbox.filters[i].value.split(':')[1] || '',
					field: filterbox.filters[i].key,
					start: filterbox.filters[i].value.split(':')[0] || ''
				}
			} else if (filterbox.filters[i].type == 'dropdown' && filterbox.filters[i].multiple) {
				filterObj.values = [];
				if (Array.isArray(filterbox.filters[i].value)) {
					var len = filterbox.filters[i].value.length;
					_this.currentStateParams[filterbox.filters[i].key] = [];
					for (j = 0; j < len; j++) {
						var localCompObj = {};
						localCompObj.technology = filterbox.filters[i].value[j];
						localCompObj.field = filterbox.filters[i].key;
						filterObj.values.push(localCompObj);

						_this.filterLabelParam.push({
							field: localCompObj.field || '',
							start: localCompObj.start || '',
							end: localCompObj.end || '',
							technology: localCompObj.technology || '',
							placeholder: filterbox.filters[i].placeholder,
							type: localCompObj.field || ''
						});
						_this.currentStateParams[filterbox.filters[i].key].push(localCompObj.technology);
					}
				} else {
					var localCompObj = {};
					localCompObj.technology = filterbox.filters[i].value;
					localCompObj.field = filterbox.filters[i].key;
					filterObj.values.push(localCompObj);
					_this.filterLabelParam.push({
						field: localCompObj.field || '',
						start: localCompObj.start || '',
						end: localCompObj.end || '',
						technology: localCompObj.technology || '',
						placeholder: filterbox.filters[i].placeholder,
						type: localCompObj.field || ''
					});
					_this.currentStateParams[localCompObj.field] = localCompObj.technology;
				}
			} else if (filterbox.filters[i].type == 'hybrid' || filterbox.filters[i].type == 'conditionalfromto') {
				filterObj.values = [];
				if (Array.isArray(filterbox.filters[i].value)) {
					_this.currentStateParams[filterbox.filters[i].key] = [];
					var len = filterbox.filters[i].value.length;
					for (j = 0; j < len; j++) {
						var localCompObj = {};
						localCompObj.technology = filterbox.filters[i].value[j].split(':')[0];
						localCompObj.field = filterbox.filters[i].key;
						localCompObj.start = filterbox.filters[i].value[j].split(':')[1];
						localCompObj.end = filterbox.filters[i].value[j].split(':')[2];
						if(filterbox.filters[i].type == 'conditionalfromto'){
							localCompObj.technology = filterbox.filters[i].value[j].split(':')[1];
							localCompObj.start = filterbox.filters[i].value[j].split(':')[2];
							localCompObj.end = filterbox.filters[i].value[j].split(':')[3];
						}
						filterObj.values.push(localCompObj);
						_this.filterLabelParam.push({
							field: localCompObj.field || '',
							start: localCompObj.start || '',
							end: localCompObj.end || '',
							technology: localCompObj.technology || '',
							placeholder: filterbox.filters[i].placeholder,
							type: localCompObj.field
						});
						var compString = localCompObj.technology.toLowerCase() + ':' + localCompObj.start + ':' + localCompObj.end;
						if(filterbox.filters[i].type == 'conditionalfromto'){
							var trimtype = _this.currentStateParams['trimtype'].toLowerCase() !== 'zipper/ puller' && _this.currentStateParams['trimtype'].toLowerCase() !== 'tiecords' ? 'others' : _this.currentStateParams['trimtype'].toLowerCase();
							compString = trimtype + ':' + localCompObj.technology.toLowerCase() + ':' + localCompObj.start + ':' + localCompObj.end;
							_this.currentStateParams[localCompObj.field].push(compString.split(' ').join(''));
						}
						else{
							_this.currentStateParams[localCompObj.field].push(compString);
						}
					}
				} else {
					var localCompObj = {};
					localCompObj.technology = filterbox.filters[i].value.split(':')[0];
					localCompObj.field = filterbox.filters[i].key;
					localCompObj.start = filterbox.filters[i].value.split(':')[1];
					localCompObj.end = filterbox.filters[i].value.split(':')[2];
					if(filterbox.filters[i].type == 'conditionalfromto'){
						localCompObj.technology = filterbox.filters[i].value.split(':')[1];
						localCompObj.start = filterbox.filters[i].value.split(':')[2];
						localCompObj.end = filterbox.filters[i].value.split(':')[3];
					}
					filterObj.values.push(localCompObj);

					_this.filterLabelParam.push({
						field: localCompObj.field || '',
						start: localCompObj.start || '',
						end: localCompObj.end || '',
						technology: localCompObj.technology || '',
						placeholder: filterbox.filters[i].placeholder,
						type: localCompObj.field
					});

					if(filterbox.filters[i].type == 'conditionalfromto'){
						var trimtype = _this.currentStateParams['trimtype'].toLowerCase() !== 'zipper/ puller' && _this.currentStateParams['trimtype'].toLowerCase() !== 'tiecords' ? 'others' : _this.currentStateParams['trimtype'].toLowerCase();
						compString = trimtype + ':' + filterbox.filters[i].value.split(':')[1].toLowerCase() + ':' + localCompObj.start + ':' + localCompObj.end;
						_this.currentStateParams[localCompObj.field] = compString.split(' ').join('');
					}
					else{
						_this.currentStateParams[localCompObj.field] = filterbox.filters[i].value;
					}
				}
			} else if (filterbox.filters[i].type == 'dropdown' && !filterbox.filters[i].multiple) {
				filterObj.isChecked = false;
				filterObj.values = {
					field: filterbox.filters[i].key,
					technology: filterbox.filters[i].value
				}
				_this.filterLabelParam.push({
					field: filterObj.values.field || '',
					start: filterObj.values.start || '',
					end: filterObj.values.end || '',
					technology: filterObj.values.technology || '',
					placeholder: filterbox.filters[i].placeholder
				});
			}

			if (filterbox.filters[i].type != 'hybrid' && filterbox.filters[i].type != 'conditionalfromto' && filterbox.filters[i].type != 'dropdown' && filterbox.filters[i].key != 'q' && filterbox.filters[i].key != 'keyword') {
				var start = filterObj.values.start,
						end = filterObj.values.end;
				start = (start && start.indexOf(' ') !== -1) ? parseInt(start.substr(start.indexOf(' ') + 1, start.length)) : start;
				_this.filterLabelParam.push({
					field: filterObj.values.field || '',
					start: start || '',
					end: end || '',
					technology: filterObj.values.technology || '',
					placeholder: filterbox.filters[i].placeholder
				});
			}
			if (filterbox.filters[i].key === 'q' || filterbox.filters[i].key === 'keyword' ) {
				_this.filterLabelParam.push({
					field: filterbox.filters[i].key || '',
					technology: filterbox.filters[i].value || '',
					placeholder: filterbox.filters[i].placeholder
				});
			}
			finalbox.push(filterObj);
		}
		searchFilterCall();
		return finalbox
	}

	function searchFilterCall() {
		angular.forEach(_this.filterLabelParam, function (item) {
			if (!item.type) {
				if (item.end) {
					_this.currentStateParams[item.field.toLowerCase()] = item.start + ':' + item.end;
				} else if (!item.technology && item.start) {
					_this.currentStateParams[item.field.toLowerCase()] = item.start + ':*';
				} else if (item.technology && !item.start) {
					_this.currentStateParams[item.field.toLowerCase()] = item.technology;
				} else if (item.field === 'grouptype') {
					_this.currentStateParams[item.field.toLowerCase()] = item.technology.split(' of')[0];
				}
			} else if (item.type){
				//_this.currentStateParams[item.field.toLowerCase()] = item.technology;
			}
		});
	}

	_this.retrieveFiltersBasedOnType = retrieveFiltersBasedOnType;
	_this.expandAddonFilter = expandAddonFilter;
	_this.setQueryParams = setQueryParams;
	_this.removeSelectedFilterItem = removeSelectedFilterItem;
	_this.compositionSearch = compositionSearch;
	_this.textboxSearch = textboxSearch;
	_this.multiDropdownSearch = multiDropdownSearch;
	_this.fromtoSearch = fromtoSearch;
	_this.checkboxSearch = checkboxSearch;
	_this.dropdownSearch = dropdownSearch;
	_this.setFilterPlaceHolderDescription = setFilterPlaceHolderDescription;
	_this.removeFilters = removeFilters;
}

uiDpFilterController.$inject=['$scope', '$templateCache', '$timeout', '$location'];


angular
.module('uic-filter')
.controller('uiDpFilterController', uiDpFilterController);

}());