define('components/components', [
  'components/x_axis',
  'components/y_axis',
  'components/line'
], function (x_axis, y_axis, line) {

  return {
    x_axis: x_axis,
    y_axis: y_axis,
    lines: line,
  };

});