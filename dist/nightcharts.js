
define('draw',['require'],function(require) {
  

  return function (Chart, selection, data) {
    if (data) {
      return new Chart(selection.datum(data));
    }
    return function (data) {
      return new Chart(selection.datum(data));
    }
  }

});


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


define('base_config', [
  "d3", 
], function(d3) {
    
    return {
      // layout.
      margin: {top: 20, right: 20, bottom: 40, left: 40},
      width: 500,
      height: 400,
      vertical: true,
      // One of: ordinal, linear, time
      x_scale: 'ordinal',
      y_scale: 'linear',
      // Forces the quantitative scale bounds:
      // false    ->  min: 0, max: data_max
      // true     ->  min: data_min, max: data_max
      // obj      ->  min: obj.min, max: obj.max
      // function ->  obj = function(data), min: obj.min, max: obj.max
      force_scale_bounds: false,
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
      overlapping_charts: { names: [] }
    };
  
});


// **Useful functions that can be shared across modules**

define('utils/utils',["d3", "d3_tip"], function(d3, d3_tip) {
  
  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source, use_clone) {
    var use_clone = (typeof use_clone === "undefined") ? true : use_clone,
        target_clone = use_clone ? clone(target): target;
    for(prop in source) {
      target_clone[prop] = source[prop];
    }
    return target_clone;
  }

  function isObject (o) {
    return Object.prototype.toString.call(o) === "[object Object]";
  }

  /* Adapted from Stoyan Stafanov */
  function schonfinkelize(fn) {
      var slice = Array.prototype.slice,
          stored_args = slice.call(arguments, 1);
      return function () {
          var new_args = slice.call(arguments),
              args = stored_args.concat(new_args);
          return fn.apply(null, args);
      };
  }

  // For each attribute in `state` it sets a getter-setter function 
  // on `obj`.
  // Accepts one level nested `state` objects.
  // TODO: make this function less convoluted.
  //
  // obj - object or function
  // state - object
  function getset (obj, state) {
    d3.entries(state).forEach(function(o) {
      obj[o.key] = function (x) {
        if (!arguments.length) return state[o.key];
        var old = state[o.key];
        state[o.key] = x;
        if ( isObject(o.value) ) {
          d3.keys(o.value).forEach(function(key) {
            state[o.key][key] = typeof x[key] !== 'undefined' ? x[key] : o.value[key];
          });
        }
        return obj;
      }
    });
  }

  // Fires a callback when all transitions of a chart have ended.
  // The solution is inspired from a reply in 
  // [Single event at end of transition?](https://groups.google.com/forum/#!msg/d3-js/WC_7Xi6VV50/j1HK0vIWI-EJ). 
  // The original suggestion assumes the data length never changes, this 
  // instead also accounts for `exits` during the transition.
  function endall (elements_in_transition, data, callback) {
    var n = data.length;
    elements_in_transition 
      .each("end", function() { 
        if (!--n) {
          callback.apply(this, arguments);
        }
      });
  }

  // Initializes a [d3-tip](https://github.com/Caged/d3-tip) tooltip.
  function tip (obj) {
    var tip = d3_tip()
      .attr('class', 'd3-tip')
      .html(function(d) { return d; });
    if (typeof obj !== 'boolean') {
      Object.keys(obj).forEach(function(key) {
        var value = obj[key];
        if (key === 'attr') {
          tip.attr(value[0], value[1]);
        } else {
          tip[key](value);
        }  
      });
    }
    return tip;
  }

  function getScaffoldingMethod (chart_name) {
    var name = chart_name.substring(0, chart_name.length - 1);
    return this[name+'Scaffolding'];
  }

  function getMinMaxValues (data) {
    var min = Infinity,
        max = 0;
    data.forEach( function (data, i) {
      var min_p = d3.min( data, function(d) { return parseFloat(d[1]); } ),
          max_p = d3.max( data, function(d) { return parseFloat(d[1]); } );
      min = min_p < min ? min_p : min;
      max = max_p > max ? max_p : max;
    });
    return {min: min, max: max};
  }

  return {
    extend: extend,
    getset: getset,
    isObject: isObject,
    schonfinkelize: schonfinkelize,
    endall: endall,
    tip: tip,
    getScaffoldingMethod: getScaffoldingMethod,
    getMinMaxValues: getMinMaxValues,
  };

});


define('mixins/data_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function dataIdentifier (d) {
    return d[0];
  }

  function delay (__) {
    var duration = __.duration,
        data = __.data;
    return function (d, i) {
      return i / data[0].length * duration;
    }
  };

  function normalizeData (data, __) {
    var parsed_data = [],
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        categoricalValue = __.categoricalValue;
    data.forEach( function (dataset, index) {
      parsed_data.push(dataset.map(function(d, i) {
        var x;
        // The time data is encoded in a string:
        if (date_chart && date_type == 'string') {
          x = d3.time.format(date_format)
            .parse(categoricalValue.call(dataset, d));
        // The time data is encoded in an epoch number:
        } else if (date_chart && __.date_type == 'epoch') {
          x = new Date(categoricalValue.call(dataset, d) * 1000);
        // Real categorical value:
        } else {
          x = __.categoricalValue.call(dataset, d);
        }
        return [x, __.quantativeValue.call(dataset, d)];
      }));
    });
    if (__.invert_data) {
      //parsed_data = data.reverse();  // TODO!!!
    }
    return parsed_data;
  }

  return function () {
    this.dataIdentifier = dataIdentifier;
    //this.delay = delay;
    this.normalizeData = normalizeData;
    return this;
  };

});
define('mixins/layout_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function w () {
    var __ = this.__;
    return __.width - __.margin.right - __.margin.left; 
  };
      
  function h () {
    var __ = this.__;
    return __.height - __.margin.top - __.margin.bottom; 
  };

  return function () {
    this.w = w;
    this.h = h;
    return this;
  };

});
define('mixins/scale_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function _getRange (axis, __) {
    var vertical = __.vertical;
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y' && vertical ) {
      return [__.h, 0];
    } else if ( axis == 'y' && !vertical ) {
      return [0, __.w];
    }
  }

  // It assumes the data is correctly sorted.
  // TODO: Guard against axis argument == null or undefined
  function _getDomain (data, axis) {
    var d0 = Infinity, 
        d1 = 0, 
        index = axis == 'x' ? 0 : 1;
    data.forEach( function (dataset, i) {
      if (dataset[0][index] < d0) {
        d0 = dataset[0][index];
      }
      if (dataset[dataset.length - 1][index] > d1) {
        d1 = dataset[dataset.length - 1][index];
      }
    });
    return [d0, d1];
  }

  function setScale (scale_type) {
    switch (scale_type) {
      case undefined:
        return;
      case 'ordinal':
        return d3.scale.ordinal;
      case 'linear':
        return d3.scale.linear;
      case 'time':
        return d3.time.scale;
      default:
        throw new Error('scale_type `'
          + scale_type
          + '` is not supported. Supported types are: ordinal, linear, time' );
    }
  }

  // Sets the range and domain for the linear scale.
  // TODO: unit test.
  function _applyLinearScale (range, __) {
    var force_scale_bounds = __.force_scale_bounds,
        min_max,
        min,
        max;
    if ( force_scale_bounds === false ) {
      min_max = utils.getMinMaxValues(__.data);
      return this.range(range).domain([0, min_max.max]);
    } else if ( force_scale_bounds === true ) {
      min_max = utils.getMinMaxValues(__.data);
      return this.range(range).domain([min_max.min, min_max.max]);
    } else if ( utils.isObject(force_scale_bounds) ) {
      min_max = force_scale_bounds,
      min = min_max.min || 0,
      max = min_max.max || utils.getMinMaxValues(__.data).max;
      return this.range(range).domain([min, max]);
    } else {
      throw new Error("force_scale_bounds wrong type");
    }
  }

  function _applyTimeScale (range, __) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var data = __.data,
        domain = _getDomain(data, 'x'),
        t1 = domain[0],
        t2 = domain[1],
        offset = __.date_offset,
        t0,
        t3;
    if (__.date_offset) {
      t0 = d3.time[offset].offset(t1, -1);
      t3 = d3.time[offset].offset(t2, +1);
      return this
        .domain([t0, t3])
        .range([t0, t3].map(d3.time.scale()
          .domain([t1, t2])
          .range([0, __.w()])));
    } else {
      return this.range(range).domain(domain);
    }
  }

  // Sets the range and domain for the ordinal scale.
  function _applyOrdinalScale (range, __) {
    var data = __.x_axis_data || __.data;  // FIXME this hack!
    return this
      .rangeRoundBands(range, __.padding)
      .domain( __.data[0].map( function(d) { return d[0]; } ) );
  }

  function applyScale (axis, scale_type, __) {
    var range = _getRange(axis, __);
    switch (scale_type) {
      case 'ordinal':
        return _applyOrdinalScale.call(this, range, __);
      case 'linear':
        return _applyLinearScale.call(this, range, __);
      case 'time':
        return _applyTimeScale.call(this, range, __);
      case undefined:
        return new Error('scale cannot be undefined');
      default:
        throw new Error('scale_type ' 
                         + scale_type 
                         + ' not supported. Is it misspelled?' );
    }
  }

  return function () {
    this.setScale = setScale;
    this.setScales = setScale;
    this.applyScale = applyScale;
    this.applyScales = applyScale;
    // private methods, exposed for testing
    this._applyLinearScale = _applyLinearScale;
    this._getRange = _getRange;
    return this;
  };

});


define('mixins/axis_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function setAxisProps (axis_conf, scale) {
    if ( !axis_conf.show ) { return; }
    var axis = d3.svg.axis().scale(scale);
    d3.entries(axis_conf).forEach(function(o) {
      if ( o.value !== undefined && o.key !== 'show' ) {
        axis[o.key](o.value);
      }
    });
    return axis;
  }

  function _transitionXAxisV (__) {
    return this
      .attr("transform", "translate(0," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this.attr("transform", "translate(" + __.barOffSet
      + "," + __.h + ")").call(__.xAxis);
  }

  function _transitionXAxis (__) {
    if ( !__.x_axis.show ) { return; }
    var vertical = __.vertical;
    if (vertical == true) {
      return _transitionXAxisV.call(this, __);
    } else {
      return _transitionXAxisH.call(this, __);
    }  
  }

  function _transitionYAxis (__) {
    if ( !__.y_axis.show ) { return; }
    return this.call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  function transitionAxis (axis, __) {
    switch (axis) {
      case 'x':
        return _transitionXAxis.call(this, __);
      case 'y':
        return _transitionYAxis.call(this, __);
      default:
        throw new Error('axis must be one of: x, y. Not ' + axis );
    } 
  } 

  return function () {
    this.setAxisProps = setAxisProps;
    this.transitionAxis = transitionAxis;
    return this;
  };

});


define('mixins/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function axisScaffolding (data, __) {
    
    // Scales are functions that map from an input domain to an output range.
    this.xScale = this.setScale(__.x_scale)();
    this.yScale = this.setScale(__.y_scale)();

    // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes).
    this.xAxis = this.setAxisProps(__.x_axis, this.xScale);
    this.yAxis = this.setAxisProps(__.y_axis, this.yScale);

    var delay = function (d, i) {
      // Attention, delay can not be longer of transition time! Test!
      return i / data.length * __.duration;
    }

    utils.extend(
      this.__, 
      {
        data: data,
        delay: delay,
        yScale: this.yScale,
        xScale: this.xScale,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        w: this.w(),
        h: this.h(),
      }, 
      false
    );

    this.applyScale.call( this.xScale, 'x', __.x_scale, __ );
    this.applyScale.call( this.yScale, 'y', __.y_scale, __ );

    return this;
  }

  function chartScaffolding (selection, __, chart_class) {

    //console.log(selection[0].tagName.toLowerCase())
    var self = this;

    // Select the svg element, if it exists.
    this.svg = selection.selectAll("svg").data([this.__.data]);
    // Otherwise, create the skeletal chart.
    this.gEnter = this.svg.enter().append("svg")
      .append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      this.tip = utils.tip( __.tooltip );
      this.gEnter.call(this.tip);
    }
   
    this.gEnter.append("g").attr("class", chart_class);
    //TODO: we need to handle bar offsets and others?

    __.overlapping_charts.names.forEach( function (chart_name) {
      self.gEnter.append("g").attr("class", chart_name);
    });

    this.gEnter.append("g").attr("class", "x axis");
    this.gEnter.append("g").attr("class", "y axis")
     .attr("transform", "translate(-" + (__.y_axis_offset) + ",0)");
     
    // Update the outer dimensions.
    this.svg.attr("width", __.width)
      .attr("height", __.height);

    // Update the inner dimensions.
    this.g = this.svg.select("g")
      .attr("transform", "translate(" + 
      __.margin.left + "," + __.margin.top + ")");

    // Transitions root.
    this.transition = this.g.transition().duration(__.duration);

    // Update the y axis.
    this.transitionAxis.call(
      this.transition.selectAll('.y.axis'), 'y', __);

    // Update the x axis.
    this.transitionAxis.call(
      this.transition.selectAll('.x.axis'), 'x', __);

    return this;
  };
      
  return function () {
    this.axisScaffolding = axisScaffolding;
    this.chartScaffolding = chartScaffolding;
    return this;
  };

});


// **The default configuration module for the bar.bar module**

define('bar/config',[
    "base_config",
    "utils/utils",
  ], function(base_config, utils) {
    
  var config = {
    orientation: 'vertical',
    padding: .1,    
    barOffSet: 4,
  };

  return utils.extend(base_config, config);
  
});


define('bar/bar_helpers',["d3", "utils/utils"], function(d3, utils) {

    function createBarsV (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("width", __.xScale.rangeBand())
        .attr("y", __.h + __.barOffSet)
        .attr("height", 0);
    }

    function createTimeBarsV (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.y_axis_offset; 
        })
        .attr("width", __.bar_width)
        //attention TODO: this get then overridden by the transition
        .attr("y", __.h + __.barOffSet) 
        .attr("height", 0);
    }

    function createBarsH (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", __.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("height", __.yScale.rangeBand());
    }

    function createBars (orientation, __) {
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return createBarsV.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return createTimeBarsV.call(this, __);
      } else {
        return createBarsH.call(this, __);
      }
    }

    function transitionBarsV (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function transitionTimeBarsV (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.y_axis_offset; 
        })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function transitionBarsH (__) {
      return this.delay(__.delay)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("x", __.barOffSet)
        .attr("width", function(d) { 
          return __.xScale(d[1]) + __.barOffSet; 
        });
    }

    function transitionBars (orientation, __) {
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return transitionBarsV.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return transitionTimeBarsV.call(this, __);
      } else {
        return transitionBarsH.call(this, __);
      }
    }

    return function (orientation, __) {
      this.createBars = createBars;
      this.transitionBars = transitionBars;
      return this;
    };

});


define('bar/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function barScaffolding ( __ ) {
    var self = this,
        data = __.data,
        bars_enter;

    // Select the bar elements, if they exists.
    self.bars_g = self.g.select("g.bars").selectAll(".bars")
      .data(data, self.dataIdentifier);
  
    // Exit phase (let us push out old bars before the new ones come in).
    self.bars_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.bars_g.enter().append("g").each( function (data, i) {
      var bars = d3.select(this).selectAll(".bar")
            .data(data, self.dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_bar_options = ov_options ? ov_options.bars : void 0;

      // Exit phase (let us push out old circles before the new ones come in).
      bars.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      self.createBars.call(bars.enter(), __.orientation, __)
        .on('click', __.handleClick);
  
      // And transition them.
      self.transitionBars
        .call(self.transition.selectAll('.bar'), __.orientation, __)
        .call(utils.endall, data, __.handleTransitionEnd);
  
      if (__.tooltip) {
        bars
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
    });
      
    return this;
  }

  return function () {
    this.barScaffolding = barScaffolding;
    return this;
  };

});

    






define('line/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function lineScaffolding ( __ ) {
    var self = this,
        data = __.data;

    // Select the line elements, if they exists.
    self.lines_g = self.g.select('g.lines').selectAll(".lines")
      .data(data, self.dataIdentifier);

    // Exit phase (let us push out old lines before the new ones come in).
    self.lines_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.lines_g.enter().append("g").each( function (data, i) {
      var lines = d3.select(this).selectAll(".bar")
            .data([data], self.dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_line_options = ov_options ? ov_options.bars : void 0;

      // Exit phase (let us push out old lines before the new ones come in).
      lines.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();      

      lines.enter().append("path")
        .attr("class", "line")
        .attr("d", self.line(__) )
        .on('click', __.handleClick);
      
      if (__.tooltip) {
        lines
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }
        
      //TODO
      //And transition them.
      //self.transitionLines
      //  .call(transition.selectAll('.line'), 'vertical', params)
      //  .call(utils.endall, data, __.handleTransitionEnd);

    });

    return this;
  }

  return function () {
    this.lineScaffolding = lineScaffolding;
    return this;
  };

});
// **The bar.bar module**

define('bar/bar',[
  "d3", 
  "utils/utils",
  "bar/config", 
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "bar/bar_helpers",
  "bar/scaffolding",
  "line/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_helpers, 
  layout_helpers, 
  scale_helpers, 
  axis_helpers, 
  scaffolding,
  bar_helpers,
  bar_scaffolding,
  line_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Bar (selection) {

      var self = this instanceof Bar
               ? this
               : new Bar(selection),
          data = self.normalizeData(selection.datum(), __),
          bars;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);

      if (__.x_scale == 'time') {
        __.bar_width = (__.w / data[0].length) - .5;
      }

      self.chartScaffolding.call(self, selection, __, 'bars');
      self.barScaffolding.call(self, __);

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
      });

      return selection;
    }

    utils.getset(Bar, __);
    data_helpers.call(Bar.prototype);
    layout_helpers.call(Bar.prototype);
    scale_helpers.call(Bar.prototype);
    axis_helpers.call(Bar.prototype);
    scaffolding.call(Bar.prototype);
    bar_helpers.call(Bar.prototype);
    bar_scaffolding.call(Bar.prototype);
    line_scaffolding.call(Bar.prototype);

    return Bar;
  }

});


// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    x_scale: 'time',
    // TODO this is an yAxis offset....
    //date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});


define('circle/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function circleScaffolding ( __ ) {
    var self = this,
        data = __.data;

    // Select the circle elements, if they exists.
    self.circles_g = self.g.select('g.circles').selectAll(".circles")
      .data(data, self.dataIdentifier);

    // Exit phase (let us push out old circles before the new ones come in).
    self.circles_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.circles_g.enter().append("g").each( function (data, i) {
      var circles = d3.select(this).selectAll(".circle")
            .data(data, self.dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_circle_options = ov_options ? ov_options.circles : void 0;

      // Exit phase (let us push out old circles before the new ones come in).
      circles.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();

      // Otherwise, create them.
      circles.enter().append("circle")
        .attr("class", "dot")
        .attr("r", ov_circle_options && ov_circle_options.r ? ov_circle_options.r : 4)
        .attr("cx", function(d) { return __.xScale(d[0]); })
        .attr("cy", function(d) { return __.yScale(d[1]); })
        // TODO: this will need a fix if is an overlapping chart!
        .on('click', __.handleClick); 

      // Tooltips.
      if (ov_circle_options && ov_circle_options.tooltip) {
        self.tip = utils.tip( ov_circle_options.tooltip );
        self.gEnter.call(self.tip);
      }
      if (__.tooltip || ov_circle_options && ov_circle_options.tooltip) {
        circles
         .on('mouseover', self.tip.show)
         .on('mouseout', self.tip.hide);
      }

    });
    
    //TODO
    //And transition them.
    //self.transitionCircles
    //  .call(transition.selectAll('.circle'), 'vertical', params)
    //  .call(utils.endall, data, __.handleTransitionEnd);

    return this;
  }

  return function () {
    this.circleScaffolding = circleScaffolding;
    return this;
  };

});
// **The line.line module**

define('line/line',[
  "d3", 
  "utils/utils",
  "line/config", 
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "line/scaffolding",
  "circle/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_helpers, 
  layout_helpers, 
  scale_helpers, 
  axis_helpers, 
  scaffolding,
  line_scaffolding,
  circle_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          data = self.normalizeData(selection.datum(), __),
          lines;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'lines');
      self.lineScaffolding.call(self, __);

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
      });

      return selection;
    }

    utils.getset(Line, __);
    data_helpers.call(Line.prototype);
    layout_helpers.call(Line.prototype);
    scale_helpers.call(Line.prototype);
    axis_helpers.call(Line.prototype);
    scaffolding.call(Line.prototype);
    line_scaffolding.call(Line.prototype);
    circle_scaffolding.call(Line.prototype);

    Line.prototype.line = function (__) {
      return d3.svg.line().x(function(d, i) {
        return __.xScale(d[0]);
      }).y(function(d, i) {
        return __.yScale(d[1]);
      });
    }

    return Line;
  }

});


// **The default configuration module for the point.point module**

define('circle/config', [
  "d3", 
  "base_config",
  "utils/utils",
], function(d3, base_config, utils) {
    
  var config = {
    //x_scale: 'time',
    // TODO this is an yAxis offset....
    //date_adjust: 5
  };

  return utils.extend(base_config, config);
  
});


// **The circle.circle module**

define('circle/circle',[
  "d3", 
  "utils/utils",
  "circle/config", 
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "circle/scaffolding",
], function(
  d3, 
  utils, 
  default_config, 
  data_helpers, 
  layout_helpers, 
  scale_helpers, 
  axis_helpers, 
  scaffolding, 
  circle_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        __ = utils.extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          data = self.normalizeData(selection.datum(), __),
          circles;

      self.__ = __;

      self.axisScaffolding.call(self, data, __);
      self.chartScaffolding.call(self, selection, __, 'circles');
      self.circleScaffolding.call(self, __);

      return selection;
    }

    utils.getset(Circle, __);
    data_helpers.call(Circle.prototype);
    layout_helpers.call(Circle.prototype);
    scale_helpers.call(Circle.prototype);
    axis_helpers.call(Circle.prototype);
    scaffolding.call(Circle.prototype);
    circle_scaffolding.call(Circle.prototype);

    return Circle;
  }

});


define('chart',[
  "d3", 
  "d3_tip",
  "draw",
  "base_config",
  "utils/utils",
  "mixins/data_helpers",
  "mixins/layout_helpers",
  "mixins/scale_helpers",
  "mixins/axis_helpers",
  "mixins/scaffolding",
  "bar/config",
  "bar/bar_helpers", 
  "bar/scaffolding",
  "bar/bar",
  "line/config",
  "line/scaffolding",
  "line/line",
  "circle/config",
  "circle/scaffolding",
  "circle/circle",
  //"frame/states",
  //"frame/state_machine",
  //"frame/frame"
], function(
  d3, 
  d3_tip,
  draw, 
  base_config, 
  utils, 
  data_helpers, 
  layout_helpers, 
  scale_helpers,
  axis_helpers,
  scaffolding,
  bar_config,
  bar_helpers,
  bar_scaffolding,
  Bar, 
  line_config,
  line_scaffolding,
  Line,
  circle_config,
  circle_scaffolding,
  Circle
  //states, 
  //StateMachine, 
  //Frame
) {

  d3.d3_tip = d3_tip;

  return {
    d3: d3,
    draw: draw,
    base_config: base_config,
    utils: utils,
    data_helpers: data_helpers,
    layout_helpers: layout_helpers,
    scale_helpers: scale_helpers,
    axis_helpers: axis_helpers,
    scaffolding: scaffolding,
    bar_config: bar_config,
    bar_helpers: bar_helpers,
    bar_scaffolding: bar_scaffolding,
    Bar: Bar,
    line_config: line_config,
    line_scaffolding: line_scaffolding,
    Line: Line,
    circle_config: circle_config,
    circle_scaffolding: circle_scaffolding,
    Circle: Circle,
    //Frame: Frame,
    //states: states, 
    //StateMachine: StateMachine,
  };

});

