// **The default base configuration module**

define('base_config', [
  "d3", 
], function(d3) {
    
    return {
      // layout.
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      padding: .1,
      vertical: true,
      // One of: ordinal, linear, time
      x_scale: 'ordinal',
      y_scale: 'linear',
      // axes, apart from `show`, properties match d3's api.
      x_axis: {
        show: true,
        outerTickSize: 0,
        orient: 'bottom',
        tickValues: void 0,
        tickFormat: null,
      },
      y_axis: {
        show: true,
        outerTickSize: 0,
        orient: 'left',
        tickValues: void 0,
      },
      y_axis_offset: 0,
      // if x_scale: 'time'
      date_type: 'string', // or 'epoc'
      date_format: '%Y',
      // false or string: 'month', 'year', etc.
      // used for extending the timescale on the margins.
      date_offset: false,

      duration: 900,  // transition duration
      colour: 'LightSteelBlue',
      //// layout
      //padding: .1,
      //barOffSet: 4,
      //orientation: 'vertical',
      //// axes
      //x_axis: {
      //  outerTickSize: 0,
      //  orient: 'bottom',
      //  tickValues: void 0,
      //  tickFormat: null,
      //},
      //y_axis: {
      //  outerTickSize: 0,
      //  orient: 'left',
      //  tickValues: void 0,
      //},
      // data
      max: void 0,         // Max value for the linear scale
      invert_data: false,  // Data sorting
      categoricalValue: function (d) { return d[0]; },
      quantativeValue: function (d) { return d[1]; },
      // events
      handleClick: function (d, i) { return void 0; },
      handleTransitionEnd: function(d) { return void 0; },
      // [d3-tip](https://github.com/Caged/d3-tip) tooltips,
      // can pass boolean or object with d3-tip configuration.
      tooltip: false,
    };
  
});

