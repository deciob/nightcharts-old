define(function(require) {
  'use strict';

  return function (chart, selection, data) {
    if (data) {
      //return selection.datum(data).call(chart);
      return chart.call( null, selection.datum(data) );
    }
    return function (data) {
      //selection.datum(data).call(chart);
      return chart.call( null, selection.datum(data) );
    }
  }

});

