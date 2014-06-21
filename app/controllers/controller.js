define([
  'd3'
], function(d3) {
  'use strict';

  var ControllersController = function () {};

  ControllersController.prototype.handleInfo = function(args) {
    var selections = args.cities;
    if (args.warning) {
      this.showWarning();
    } else {
      this.hideWarning();
      if (selections[0].length > 0) {
        this.hideInfo();
      } else {
        this.showInfo();
      }
    }

  }

  ControllersController.prototype.hideInfo = function() {
    d3.select('section.controllers .info').classed('active', false);
  }

  ControllersController.prototype.showInfo = function() {
    d3.select('section.controllers .info').classed('active', true);
  }

  ControllersController.prototype.hideWarning = function() {
    d3.select('section.controllers .warning').classed('active', false);
  }

  ControllersController.prototype.showWarning = function() {
    d3.select('section.controllers .warning').classed('active', true);
  }

  return ControllersController;

});