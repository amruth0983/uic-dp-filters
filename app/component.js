var angular = require('../lib/angular/angular.min.js');

require('../lib/angular/jquery-2.1.4.min.js');
require('../node_modules/ui-component/dist/ui-component.min.js');

angular.module('uic-dp-filter', []);

require('./directives/checkbox-filter.js');
require('./directives/uic-dp-filter.js');
