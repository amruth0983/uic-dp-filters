var Component = require('../node_modules/ui-component/dist/ui-component.min.js'),
  _ = require('./lib/lodash.js'),
  angular = require('../lib/angular/angular.min.js');

require('./component.js');
require('./css/style.css');

function UicDPFilter(config) {
  var _this = this;

  this.isRendered = false;
  this.isInitialized = false;
  this.config = config || {};
  this.service = null;
  this.element = null;
  this.events = {};

  angular.module('UicDPFilter', ['uic-dp-filter'])
    .directive('uicDPFilterWrapper', [
      function() {
        return {
          restrict: 'A',
          template:
            '<div data-uic-dp-filter' +
            'data-config="config"'+
            '</div>',
          link: {
            pre: function(scope) {
              scope.config = _this.config;
            }
          }
        };
      }]);

  Component.call(this, this.config);
}

UicDPFilter.prototype = _.create(Component.prototype, {});
UicDPFilter.prototype.constructor = UicDPFilter;

UicRowFilter.prototype.render = function() {
  var rootElement;

  if (!this.isRendered) {
    rootElement = angular.element(this.config.root);
    this.element = angular.element('<div data-uic-dp-filter-wrapper></div>');

    angular.bootstrap(this.element, ['UicDPFilter']);

    rootElement.append(this.element);

    this.isRendered = true;
  }

  return this;
};

module.exports = UicDPFilter;