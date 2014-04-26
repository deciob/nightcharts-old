define(function(require) {
  'use strict';

  return function (Chart, selection, data, old_frame_identifier) {
    if (data) {
      return new Chart(selection.datum(data), old_frame_identifier);
    }
    return function (data, old_frame_identifier) {
      return new Chart(selection.datum(data), old_frame_identifier);
    }
  }

});

