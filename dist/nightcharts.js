
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
      width: void 0,
      height: void 0, // if set, height has precedence on ratio
      ratio: .4,
      //vertical: true,
      quantitative_scale: 'y',
      // One of: ordinal, linear, time
      x_scale: 'ordinal',
      y_scale: 'linear',
      // Forces the quantitative scale bounds:
      // false    ->  min: 0, max: data_max
      // true     ->  min: data_min, max: data_max
      // obj      ->  min: obj.min, max: obj.max
      scale_bounds: false,
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
//      // if x_scale: 'time'
//      date_type: 'string', // or 'epoc'
//      date_format: '%Y',
//      // false or string: 'month', 'year', etc.
//      // used for extending the timescale on the margins.
//      date_offset: false,
      duration: 900,  // transition duration
//      colour: 'LightSteelBlue',
//      // data
//      max: void 0,         // Max value for the linear scale
//      invert_data: false,  // Data sorting
      categoricalValue: function (d) { return d[0]; },
      quantativeValue: function (d) { return d[1]; },
      // events
//      handleClick: function (d, i) { return void 0; },
//      handleTransitionEnd: function(d) { return void 0; },
//      // [d3-tip](https://github.com/Caged/d3-tip) tooltips,
//      // can pass boolean or object with d3-tip configuration.
//      tooltip: false,
      overlapping_charts: { names: [] }
    };
  
});


// **Useful functions that can be shared across modules**

define('utils/mixins',["d3", "d3_tip"], function(d3, d3_tip) {

  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source, clone_target, not_override) {
    var clone_target = (typeof clone === "undefined") ? true : clone,
        target_c = clone_target ? clone(target): target;
    for(prop in source) {
      if (not_override) {
        target_c[prop] = target_c[prop] ? target_c[prop] : source[prop];
      } else {
        target_c[prop] = source[prop];
      }
    }
    return target_c;
  }

  function isObject (o) {
    return Object.prototype.toString.call(o) === "[object Object]";
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

  return function () {
    this.clone = clone;
    this.extend = extend;
    this.isObject = isObject;
    this.getset = getset;
    this.endall = endall;
    this.tip = tip;
    this.getScaffoldingMethod = getScaffoldingMethod;
    this.getMinMaxValues = getMinMaxValues;
    return this;
  };

});
define('mixins/data', [
  "d3"
], function (d3) {

  function dataIdentifier (d) {
    return d[0];
  }

  function delay (__) {
    var duration = __.duration,
        data = __.data;
    if (duration == undefined) { throw new Error('__.duration unset')}
    return function (d, i) {
      return i / data[0].length * duration;
    }
  };

  function normalizeData () {
    var data = this.selection.datum(),
        __ = this.__,
        parsed_data = [],
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
    __.data = parsed_data;
    return this;
  }

  return function () {
    this.dataIdentifier = dataIdentifier;
    //this.delay = delay;
    this.normalizeData = normalizeData;
    return this;
  };

});
define('mixins/layout', [
  "d3"
], function (d3) {

  // TODO: unit test.
  function setDimensions () {
    var __ = this.__;
    if ( __.width === undefined ) {
      __.width  = +this.selection.style('width').replace('px', '');
      __.height = __.height || __.width * __.ratio;
    } else if ( __.width && __.height === undefined) {
      __.height = __.width * __.ratio;
    }
    setW();
    setH();
    return this;
  }

  function setW () {
    var __ = this.__;
    __.w   = __.width - __.margin.right - __.margin.left;
    return this;
  };
      
  function setH () {
    var __ = this.__;
    __.h   = __.height - __.margin.top - __.margin.bottom;
    return this; 
  };

  return function () {
    this.setDimensions = setDimensions;
    this.setW = setW;
    this.setH = setH;
    return this;
  };

});

define('mixins/scale', [
  "d3",
  "utils/mixins",
], function (d3, utils_mixins) {

  function _getRange (axis, __) {
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y') {
      return [__.h, 0];
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

  function _setScale (scale_type) {
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

  function setScales () {
    var __ = this.__;
    __.xScale = this._setScale(__.x_scale)();
    __.yScale = this._setScale(__.y_scale)();
    return this;
  }

  // Sets the range and domain for the linear scale.
  function _applyLinearScale (range, __) {
    var scale_bounds = __.scale_bounds,
        min_max,
        min,
        max,
        getMinMaxValues = utils_mixins().getMinMaxValues;
    if ( scale_bounds === false ) {
      min_max = getMinMaxValues(__.data);
      return this.range(range).domain([0, min_max.max]);
    } else if ( scale_bounds === true ) {
      min_max = getMinMaxValues(__.data);
      return this.range(range).domain([min_max.min, min_max.max]);
    } else if ( this.isObject(scale_bounds) ) {
      min_max = scale_bounds,
      min = min_max.min || 0,
      max = min_max.max || getMinMaxValues(__.data).max;
      return this.range(range).domain([min, max]);
    } else {
      throw new Error("scale_bounds wrong type");
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
          .range([0, __.w])));
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

  function _applyScale (axis, scale_type, __) {
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

  function applyScales () {
    this.applyScale.call( __.xScale, 'x', __.x_scale, __ );
    this.applyScale.call( __.yScale, 'y', __.y_scale, __ );
    return this;
  }

  return function () {

    this.setScales = setScales;
    this.applyScales = applyScales;
    this.applyScale = _applyScale;
    // private methods, exposed for testing
    this._setScale = _setScale;
    this._applyLinearScale = _applyLinearScale;
    this._getRange = _getRange;
    return this;
  };

});


define('mixins/axis', [
  "d3"
], function (d3) {

  function _setProps (axis_conf, scale) { 
    if ( !axis_conf.show ) { return; }
    var axis = d3.svg.axis().scale(scale);
    d3.entries(axis_conf).forEach(function(o) {
      if ( o.value !== undefined && o.key !== 'show' ) {
        axis[o.key](o.value);
      }
    });
    return axis;
  }

  function setAxes () {
    var __ = this.__;
    __.xAxis = this._setProps(__.x_axis, __.xScale);
    __.yAxis = this._setProps(__.y_axis, __.yScale);
    return this;
  }

  function _transitionXAxisV (__) {
    return this
      .attr("transform", "translate(0," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this
      .attr("transform", "translate(" + 10 + "," + __.h + ")")
      .call(__.xAxis);
  }

  function _transitionXAxis (__) {
    if ( !__.x_axis.show ) { return; }
    __.quantitative_scale //?????????????
    if (__.quantitative_scale == 'y') {
      return _transitionXAxisV.call(this, __);
    } else if (__.quantitative_scale == 'x') {
      return _transitionXAxisH.call(this, __);
    } else {
      throw new Error('quantitative_scale must be one of: x, y');
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
    this.setAxes = setAxes;
    this._setProps = _setProps;
    this.transitionAxis = transitionAxis;
    return this;
  };

});
define('mixins/chart', [
  "d3"
], function (d3) {

  function setChart (chart_class) {

    //console.log(selection[0].tagName.toLowerCase())
    var self = this,
        __   = self.__;

    // Select the svg element, if it exists.
    self.svg = self.selection.selectAll("svg").data([__.data]);
    // Otherwise, create the skeletal chart.
    self.gEnter = self.svg.enter().append("svg")
      .append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      self.tip = self.tip( __.tooltip );
      self.gEnter.call(self.tip);
    }
   
    self.gEnter.append("g").attr("class", chart_class);
    //TODO: we need to handle bar offsets and others?

    __.overlapping_charts.names.forEach( function (chart_name) {
      self.gEnter.append("g").attr("class", chart_name);
    });

    self.gEnter.append("g").attr("class", "x axis");
    self.gEnter.append("g").attr("class", "y axis")
     .attr("transform", "translate(-" + (__.y_axis_offset) + ",0)");
     
    // Update the outer dimensions.
    self.svg.attr("width", __.width)
      .attr("height", __.height);

    // Update the inner dimensions.
    self.g = self.svg.select("g")
      .attr("transform", "translate(" + 
      __.margin.left + "," + __.margin.top + ")");

    // Transitions root.
    self.transition = self.g.transition().duration(__.duration);

    // Update the y axis.
    self.transitionAxis.call(
      self.transition.selectAll('.y.axis'), 'y', __);

    // Update the x axis.
    self.transitionAxis.call(
      self.transition.selectAll('.x.axis'), 'x', __);

    return self;
  };

  return function () {
    this.setChart = setChart;
    return this;
  };

});


// **The default configuration module for the bar.bar module**

define('bar/config', [
  "base_config",
  "utils/mixins",
], function(base_config, utils_mixins) {
    
  var config = {
        orientation: 'vertical',
        padding: .1,    
        barOffSet: 4,
      },
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});


// **The bar.bar module**

define('bar/bar',[
  "d3", 
  "utils/mixins",
  "bar/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
//  "bar/bar_helpers",
//  "bar/scaffolding",
//  "line/scaffolding",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins
//  bar_helpers,
//  bar_scaffolding,
//  line_scaffolding
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins()
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Bar (selection) {

      var self = this instanceof Bar
               ? this
               : new Bar(selection),
          has_timescale = __.x_scale == 'time',
          bars;

      self.__        = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();

      if (has_timescale) {
//        __.bar_width = (__.w() / data[0].length) * .9;
//        __.y_axis_offset = __.y_axis_offset == 0 ? __.bar_width * .6 : __.y_axis_offset;
//        //TODO: set events?
//        __.margin = utils.extend(__.margin, {
//            left: __.margin.left + __.y_axis_offset,
//            right: __.margin.right + __.y_axis_offset
//        });
      }

      self.setScales();
      self.setAxes();

      __.delay = function (d, i) {
        // Attention, delay can not be longer of transition time! Test!
        return i / __.data.length * __.duration;
      }

      self.applyScales();
      self.setChart('bars');

//
//      self.chartScaffolding.call(self, selection, __, 'bars');
//      //self.barScaffolding.call(self, __);
//
//      __.overlapping_charts.names.forEach( function (chart_name) {
//        utils.getScaffoldingMethod.call(self, chart_name).call(self, __);
//      });

      return selection;
    }

    getset(Bar, __);
    utils_mixins.call(Bar.prototype);
    data_mixins.call(Bar.prototype);
    layout_mixins.call(Bar.prototype);
    scale_mixins.call(Bar.prototype);
    axis_mixins.call(Bar.prototype);
    chart_mixins.call(Bar.prototype);
    //bar_helpers.call(Bar.prototype);
    //bar_scaffolding.call(Bar.prototype);
    //line_scaffolding.call(Bar.prototype);

    return Bar;
  }

});


define('chart',[
  "d3", 
  "d3_tip",
  "draw",
  "base_config",
  "utils/mixins",
  ////"utils/mixins",
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "bar/config",
  //"bar/bar_helpers", 
  //"bar/scaffolding",
  "bar/bar"
  //"line/config",
  //"line/scaffolding",
  //"line/line",
  //"circle/config",
  //"circle/scaffolding",
  //"circle/circle",
  //"frame/states",
  //"frame/state_machine",
  //"frame/frame"
], function(
  d3, 
  d3_tip,
  draw, 
  base_config, 
  utils_mixins,
  ////utils_mixins, 
  data_mixins, 
  layout_mixins, 
  scale_mixins,
  axis_mixins,
  chart_mixins,
  bar_config,
  //bar_helpers,
  //bar_scaffolding,
  Bar
  //line_config,
  //line_scaffolding,
  //Line,
  //circle_config,
  //circle_scaffolding,
  //Circle
  //states, 
  //StateMachine, 
  //Frame
) {

  d3.d3_tip = d3_tip;

  return {
    d3: d3,
    draw: draw,
    base_config: base_config,
    utils_mixins: utils_mixins,
    ////utils_mixins: utils_mixins,
    data_mixins: data_mixins,
    layout_mixins: layout_mixins,
    scale_mixins: scale_mixins,
    axis_mixins: axis_mixins,
    chart_mixins: chart_mixins,
    bar_config: bar_config,
    //bar_helpers: bar_helpers,
    //bar_scaffolding: bar_scaffolding,
    Bar: Bar
    //line_config: line_config,
    //line_scaffolding: line_scaffolding,
    //Line: Line,
    //circle_config: circle_config,
    //circle_scaffolding: circle_scaffolding,
    //Circle: Circle,
    //Frame: Frame,
    //states: states, 
    //StateMachine: StateMachine,
  };

});

