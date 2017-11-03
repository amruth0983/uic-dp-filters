require('ui-component');

require('./components/uicDpFilter/uicDpFilter');

angular.module('uic-dp-filter', ['uic-filter']);

require('./directives/hybrid-filter.js');
require('./directives/checkbox-filter.js');
require('./directives/dropdown-filter.js');
require('./directives/multidropdown-filter.js');
require('./directives/fromto-filter.js');
require('./directives/textbox-filter.js');
require('./directives/input-filter.js');
require('./directives/conditional-fromto-filter.js');

