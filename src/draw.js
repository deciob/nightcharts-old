define(function(require) {
  'use strict';

  return function (chart, selection, data, options) {
    if (data) {
      return chart(selection.datum(data), options);
    }
    return function (data, options) {
      return chart(selection.datum(data), options);
    }
  }

});

