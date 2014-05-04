// **The default base configuration module**


// Data structures:
//
// bar:
// data = [ [ [], [], [], ... [] ], ... ]
// svg.data( [data] )
//
// line:
// data = [ [ [], [], [], ... [] ], ... ]
// svg.data( [data] )
// __.x_axis_data = data[0]  #FIXME


define('defaults', [
  "d3", 
], function (d3) {
  'use strict';
    
  return {
    // used with the range methods. TODO: better name, pass function?
    padding: .1,
    // layout.
    margin: {top: 20, right: 20, bottom: 40, left: 40},
    width: void 0,
    height: void 0, // if set, height has precedence on ratio
    ratio: .4,
    //
    offset_x: 0,
    offset_y: 0,
    //vertical: true,
    //*quantitative_scale: 'y',
    orientation: 'horizontal', // needs validation or error: only bars can have vertical option
    // One of: ordinal, linear, time
    x_scale: 'ordinal',
    y_scale: 'linear',
    // Forces the quantitative scale bounds:
    // false    ->  min: 0, max: data_max
    // true     ->  min: data_min, max: data_max
    // obj      ->  min: obj.min, max: obj.max
    scale_bounds: '0,max',
    components: ['x_axis', 'y_axis'],
      // axes, properties match d3's api.
    x_axis: {
      outerTickSize: 0,
      orient: 'bottom',
      tickValues: void 0,
      tickFormat: null,
    },
    y_axis: {
      outerTickSize: 0,
      orient: 'left',
      tickValues: void 0,
    },
    lines: void 0,
    bars: void 0,
    frames: {},
    // if x_scale: 'time'
    date_type: 'string', // or 'epoc'
    date_format: '%Y',
    // false or string: 'month', 'year', etc.
    // used for extending the timescale on the margins.
    date_offset: false,
    duration: 900,  // transition duration
    delay: 100,  // transition delay
    invert_data: false,  // Data sorting
    xValue: function (d) { return d[0]; },
    yValue: function (d) { return d[1]; },
    zValue: function (d) { return d[2]; },
    // events
    handleClick: function (d, i) { return void 0; },
    handleTransitionEnd: function(d) { return void 0; },
    // [d3-tip](https://github.com/Caged/d3-tip) tooltips,
    // can pass boolean or object with d3-tip configuration.
    tooltip: false,
    overlapping_charts: { names: [] },
    drawDispatch: d3.dispatch('draw')
  };
  
});

