define([
  'd3'
], function(d3) {
  'use strict';

  var ControllersController = function () {};

  function hideInfo() {
    d3.select('section.controllers .info').classed('active', false);
  }

  function showInfo() {
    d3.select('section.controllers .info').classed('active', true);
  }

  ControllersController.prototype.handleInfo = function(selections) {
    if (selections[0].length > 0) {
      hideInfo();
    } else {
      showInfo();
    }
  }

  return ControllersController;

});