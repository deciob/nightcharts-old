define(function(require) {
  'use strict';

  return function (chart, selection) {
    return function (d) {
      selection.datum(d).call(chart);
    }
  }

});