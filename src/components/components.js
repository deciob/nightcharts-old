define('components/components', [
  'components/x_axis',
  'components/y_axis',
  'components/line',
  'components/bar'
], function (x_axis, y_axis, line, bar) {

  return {
    x_axis: x_axis,
    y_axis: y_axis,
    lines: line,
    bars: bar,
  };

});