define('components/components', [
  'components/x_axis',
  'components/y_axis'
], function (x_axis, y_axis) {

  return {
    x_axis: x_axis,
    y_axis: y_axis
  };

});