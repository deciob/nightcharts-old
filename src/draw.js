define(function(require) {
  'use strict';

  return function (chart, selection) {
    return function (data) {
      selection.datum(data).call(chart);
    }
  }

});

