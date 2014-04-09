define(function(require) {
  'use strict';

  return function (Chart, selection, data) {
    if (data) {
      return new Chart(selection.datum(data));
    }
    return function (data) {
      return new Chart(selection.datum(data));
    }
  }

});

