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
      //
      offset_x: 0,
      offset_y: 0,
      //vertical: true,
      quantitative_scale: 'y',
      // One of: ordinal, linear, time
      x_scale: 'ordinal',
      y_scale: 'linear',
      // Forces the quantitative scale bounds:
      // false    ->  min: 0, max: data_max
      // true     ->  min: data_min, max: data_max
      // obj      ->  min: obj.min, max: obj.max
      scale_bounds: '0,max',
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
      // if x_scale: 'time'
      date_type: 'string', // or 'epoc'
      date_format: '%Y',
      // false or string: 'month', 'year', etc.
      // used for extending the timescale on the margins.
      date_offset: false,
      duration: 900,  // transition duration
      invert_data: false,  // Data sorting
      categoricalValue: function (d) { return d[0]; },
      quantativeValue: function (d) { return d[1]; },
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

  function getGraphHelperMethod (chart_name) {
    var name = chart_name.replace(/(?:^|\s)\S/g, 
      function(a) { return a.toUpperCase(); });
    return this['set' + name];
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
    this.getGraphHelperMethod = getGraphHelperMethod;
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

  function setDelay () {
    var __ = this.__,
        duration = __.duration,
        data = __.data;
    if (duration == undefined) { throw new Error('__.duration unset')}
    __.delay = function (d, i) {
      // FIXME: only referring to the first dataset, 
      // while setting the delay on all!
      return i / data[0].length * duration;
    }
    return this;
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
      if (date_chart) {
        parsed_data.push(dataset.map(function(d, i) {
          var x;
          // The time data is encoded in a string:
          if (date_chart && date_type == 'string') {
            x = d3.time.format(date_format)
              .parse(categoricalValue.call(dataset, d));
          // The time data is encoded in an epoch number:
          } else if (date_chart && __.date_type == 'epoch') {
            x = new Date(categoricalValue.call(dataset, d) * 1000);
          } 
          return [x, __.quantativeValue.call(dataset, d)];
        }));
      } else {
        dataset = __.invert_data ? this.clone(dataset).reverse() : dataset;
        parsed_data.push(dataset.map(function(d, i) {
          var x = __.categoricalValue.call(dataset, d);
          return [x, __.quantativeValue.call(dataset, d)];
        }));
      }
    });
    __.data = parsed_data;
    return this;
  }

  return function () {
    this.dataIdentifier = dataIdentifier;
    this.setDelay = setDelay;
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
    this.setW();
    this.setH();
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

  //TODO: throw on wrong input
  function _parseScaleBounds (bounds, __) {
    var min_max = getMinMaxValues(__.data);
    bounds = bounds.split(',');
    if (bounds[0] == 'min') { 
      bounds[0] = min_max.min; 
    } else {
      bounds[0] = +bounds[0];
    }
    if (bounds[1] == 'max') {
      bounds[1] = min_max.max; 
    } else {
      bounds[1] = +bounds[1];
    }
    return bounds;
  }

  // Sets the range and domain for the linear scale.
  function _applyLinearScale (range, __) {
    var scale_bounds = __.scale_bounds,
        min_max = _parseScaleBounds(scale_bounds, __);  
    return this.range(range).domain(min_max);
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
    var __ = this.__;
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
      .attr("transform", "translate(" + __.offset_x + "," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionXAxisH (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.h + ")")
      .call(__.xAxis);
  }

  function _transitionXAxis (__) {
    if ( !__.x_axis.show ) { return; }
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
    return this
      .attr("transform", "translate(0,-" + __.offset_y + ")")
      .call(__.yAxis)
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
    self.gEnter.append("g").attr("class", "y axis");
     
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
        padding: .1
      },
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});


define('bar/mixins',["d3"], function(d3) {

    function _getBarOrientation (__) {
      if ( (__.x_scale == 'ordinal' || __.x_scale == 'time') &&
            __.y_scale == 'linear') {
        return 'vertical';
      } else if (__.x_scale == 'linear' && __.y_scale == 'ordinal') {
        return 'horizontal';
      } else {
        throw new Error('x_scale-y_scale wrong options combination');
      }
    }

    function _createVerticalBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("width", __.xScale.rangeBand())
        .attr("y", __.h)
        .attr("height", 0);
    }

    function _createTimeBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
          return __.xScale(d[0]) - __.bar_width / 2;
        })
        .attr("width", __.bar_width)
        //attention TODO: this gets then overridden by the transition
        .attr("y", __.h) 
        .attr("height", 0);
    }

    function _createHorizontalBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("width", 0)
        .attr("height", __.yScale.rangeBand());
    }

    function createBars (__) {
      var orientation = _getBarOrientation(__);
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return _createVerticalBars.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return _createTimeBars.call(this, __);
      } else if (orientation == 'horizontal') {
        return _createHorizontalBars.call(this, __);
      } else {
        throw new Error("orientation-x_scale wrong combination");
      }
    }

    function _transitionVerticalBars (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { return __.xScale(d[0]) + __.offset_x; })
        .attr("y", function(d) { return __.yScale(d[1]) - __.offset_y; })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function _transitionTimeBars (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { 
          return __.xScale(d[0]) + __.offset_x - __.bar_width / 2;
        })
        .attr("y", function(d) { return __.yScale(d[1]) - __.offset_y; })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function _transitionHorizontalBars (__) {
      return this.delay(__.delay)
        .attr("y", function(d) { return __.yScale(d[0]) - __.offset_y; })
        .attr("x", __.offset_x)
        .attr("width", function(d) { 
          return __.xScale(d[1]) + __.offset_x; 
        });
    }

    function transitionBars (orientation, __) {
      var orientation = _getBarOrientation(__);
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return _transitionVerticalBars.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return _transitionTimeBars.call(this, __);
      } else if (orientation == 'horizontal') {
        return _transitionHorizontalBars.call(this, __);
      } else {
        throw new Error("orientation-x_scale wrong combination");
      }
    }

    function setBars () {
      var self = this,
          __ = this.__;

      __.data.forEach( function (data, i) {
        var bars = self.g.select('.bars').selectAll(".bar")
              .data(data, self.dataIdentifier),
            ov_options = __.overlapping_charts.options,
            ov_bar_options = ov_options ? ov_options.bars : void 0;
  
        // Exit phase (pushes out old bars before new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();
  
        self.createBars.call(bars.enter(), __)
          .on('click', __.handleClick);
    
        // And transition them.
        self.transitionBars
          .call(self.transition.selectAll('.bar'), __.orientation, __)
          .call(self.endall, data, __.handleTransitionEnd);
    
        if (__.tooltip) {
          bars
           .on('mouseover', self.tip.show)
           .on('mouseout', self.tip.hide);
        }
      });

    }

    return function (orientation, __) {
      this.setBars = setBars;
      this.transitionBars = transitionBars;
      this.createBars = createBars;
      return this;
    };

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
  "bar/mixins",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins,
  bar_mixins
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins(),
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

      if (has_timescale) { self.adjustDimensionsToTimeScale(); }

      self.setScales();
      self.setAxes();
      self.setDelay();
      self.applyScales();
      self.setChart('bars');
      self.setBars();

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
    bar_mixins.call(Bar.prototype);

    Bar.prototype.adjustDimensionsToTimeScale = function () {
      __.bar_width = (__.w / __.data[0].length) * .9;
      __.width += __.bar_width + __.offset_x; //FIXME: this should be smarter!
      offset_x = __.offset_x == 0 ? __.bar_width * .6 : __.offset_x;
      __.margin = utils.extend(__.margin, {
          left: __.margin.left + offset_x,
          right: __.margin.right + offset_x
      });
      return this;
    }

    return Bar;
  }

});


// **The default configuration module for the line.line module**

define('line/config',[
  "d3", 
  "base_config",
  "utils/mixins",
], function(d3, base_config, utils_mixins) {
    
  var config = {
        x_scale: 'time',
      },
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});


define('line/mixins', ["d3"], function (d3) {

  function setLines () {
    var self = this,
          __ = this.__;

    // Select the line elements, if they exists.
    self.lines_g = self.g.select('g.lines').selectAll(".lines")
      .data(__.data, self.dataIdentifier);

    // Exit phase (let us push out old lines before the new ones come in).
    self.lines_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.lines_g.enter().append("g").each( function (data, i) {
      var lines = d3.select(this).selectAll(".line")
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
    this.setLines = setLines;
    return this;
  };

});


define('circle/mixins', ["d3"], function (d3, utils) {

  function setCircles () {
    var self = this,
          __ = this.__;

    // Select the circle elements, if they exists.
    self.circles_g = self.g.select('g.circles').selectAll(".circles")
      .data(__.data, self.dataIdentifier);

    // Exit phase (let us push out old circles before the new ones come in).
    self.circles_g.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // Otherwise, create them.
    self.circles_g.enter().append("g").each( function (data, i) {
      var circles = d3.select(this).selectAll(".circle")
            .data(data, self.dataIdentifier),
          tip,
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
        tip = self.tip( ov_circle_options.tooltip );
        self.gEnter.call(tip);
      }
      if (__.tooltip || ov_circle_options && ov_circle_options.tooltip) {
        tip = tip || self.tip;
        circles
         .on('mouseover', tip.show)
         .on('mouseout', tip.hide);
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
    this.setCircles = setCircles;
    return this;
  };

});
// **The line.line module**

define('line/line',[
  "d3", 
  "utils/mixins",
  "line/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "line/mixins",
  "circle/mixins",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins,
  line_mixins,
  circle_mixins
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins(),
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Line (selection) {

      var self = this instanceof Line
               ? this
               : new Line(selection),
          has_timescale = __.x_scale == 'time',
          lines;

      self.__ = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();
      self.setScales();
      self.setAxes();
      self.setDelay();
      self.applyScales();
      self.setChart('lines');
      self.setLines();

      __.overlapping_charts.names.forEach( function (chart_name) {
        utils.getGraphHelperMethod.call(self, chart_name).call(self, __);
      });

      return selection;
    }

    getset(Line, __);
    utils_mixins.call(Line.prototype);
    data_mixins.call(Line.prototype);
    layout_mixins.call(Line.prototype);
    scale_mixins.call(Line.prototype);
    axis_mixins.call(Line.prototype);
    chart_mixins.call(Line.prototype);
    line_mixins.call(Line.prototype);
    circle_mixins.call(Line.prototype);

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
  "base_config",
  "utils/mixins",
], function(base_config, utils_mixins) {
    
  var config = {},
      utils = utils_mixins();

  return utils.extend(base_config, config);
  
});


// **The circle.circle module**

define('circle/circle',[
  "d3", 
  "utils/mixins",
  "circle/config", 
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "circle/mixins",
], function(
  d3, 
  utils_mixins, 
  default_config, 
  data_mixins,
  layout_mixins,
  scale_mixins,
  axis_mixins,
  chart_mixins,
  circle_mixins
) {
  
  return function (user_config) {

    var config = user_config || {},
        utils  = utils_mixins(),
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config);

    function Circle (selection) {

      var self = this instanceof Circle
               ? this
               : new Circle(selection),
          has_timescale = __.x_scale == 'time',
          circles;

      self.__ = __;
      self.selection = selection;

      self.normalizeData();
      self.setDimensions();
      self.setScales();
      self.setAxes();
      self.setDelay();
      self.applyScales();
      self.setChart('circles');
      self.setCircles();

      return selection;
    }

    getset(Line, __);
    utils_mixins.call(Circle.prototype);
    data_mixins.call(Circle.prototype);
    layout_mixins.call(Circle.prototype);
    scale_mixins.call(Circle.prototype);
    axis_mixins.call(Circle.prototype);
    chart_mixins.call(Circle.prototype);
    circle_mixins.call(Circle.prototype);

    return Circle;
  }

});


// **frame.states module**

// Used by the *frame.state_machine* module.
// Name-spaced, might add other states if needed.

define('frame/states',['require'],function(require) {

  var transition_states = [
    {
      'name': 'in_pause',
      'initial': true,
      'events': {
        'start': 'in_transition_start',
        'next': 'in_transition_next',
        'prev': 'in_transition_prev',
        'jump': 'in_transition_jump',
        'reset': 'in_transition_reset'
      }
    },
    {
      'name': 'in_transition_start',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_next',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_prev',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_jump',
      'events': {
        'stop': 'in_pause'
      }
    },
    {
      'name': 'in_transition_reset',
      'events': {
        'stop': 'in_pause'
      }
    }
  ];

  return { transition_states: transition_states};

});


// **frame.state_machine module**
// 
// From http://lamehacks.net/blog/implementing-a-state-machine-in-javascript/

define('frame/state_machine',['require'],function(require) {

  function StateMachine (states) {
    this.states = states;
    this.indexes = {};
    for( var i = 0; i < this.states.length; i++) {
      this.indexes[this.states[i].name] = i;
      if (this.states[i].initial){
        this.currentState = this.states[i];
      }
    }
  }

  StateMachine.prototype.consumeEvent = function (e) {
    if(this.currentState.events[e]){
      this.currentState = this.states[this.indexes[this.currentState.events[e]]];
    }
  }

  StateMachine.prototype.getStatus = function () {
    return this.currentState.name;
  }

  // getLastEvent();

  return StateMachine;

});


// **frame.frame module**

define('frame/frame',[
  'd3',
  'utils/mixins',
  'frame/states',
  'frame/state_machine'
], function(d3, utils_mixins, states, StateMachine) {

  var Frame = function (conf) {
    var self  = this,
        utils = utils_mixins();
    
    this.initial_frame = this.frame = conf.frame;
    this.old_frame = void 0;
    this.current_timeout = void 0;
    this.draw_dispatch = conf.draw_dispatch;
    this.delta = conf.delta;
    this.step = conf.step;
    this.data = conf.data;

    this.state_machine = new StateMachine(states.transition_states);
    this.dispatch = d3.dispatch(
      'start', 
      'stop', 
      'next', 
      'prev', 
      'reset', 
      'end',
      'jump',
      'at_beginning_of_transition'
    );
    
    // Fired when all the chart related transitions within a frame are 
    // terminated.
    // It is the only dispatch event that does not have a state_machine 
    // equivalent event.
    // `frame` is an arbitrary namespace, in order to register multiple 
    // listeners for the same event type.
    //
    // https://github.com/mbostock/d3/wiki/Internals#events:
    // If an event listener was already registered for the same type, the 
    // existing listener is removed before the new listener is added. To 
    // register multiple listeners for the same event type, the type may be 
    // followed by an optional namespace, such as 'click.foo' and 'click.bar'.
    this.dispatch.on('end.frame', self.handleFrameEnd);

    this.dispatch.on('stop', self.handleStop);

    this.dispatch.on('start', self.handleStart);

    this.dispatch.on('next', self.handleNext);

    this.dispatch.on('prev', self.handlePrev);

    this.dispatch.on('reset', self.handleReset);

    this.dispatch.on('jump', self.handleJump);
  }


  Frame.prototype.startTransition = function () {
    var self = this;
    clearTimeout(this.current_timeout);
    if (this.data[this.frame]) {
      this.current_timeout = setTimeout( function () {
        // Fire the draw event
        self.draw_dispatch.draw.call(self, self.data[self.frame]);
      }, self.step);
    } else {
      // When no data is left to consume, let us stop the running frames!
      this.state_machine.consumeEvent('stop');
      this.frame = this.old_frame;
    }
    self.dispatch.at_beginning_of_transition.call(self);
  }

  Frame.prototype.handleFrameEnd = function () {
    this.handleTransition();
    return this;
  }

  Frame.prototype.handleStop = function () {
    this.state_machine.consumeEvent('stop');
    return this;
  }

  // TODO: there is a lot of repetition here!

  Frame.prototype.handleStart = function () {
    if (this.state_machine.getStatus() === 'in_pause') {
      this.state_machine.consumeEvent('start');
      this.handleTransition();
    } else {
      console.log('State already in in_transition_start.');
    }
    return this;
  }

  // TODO:
  // for next and prev we are allowing multiple prev-next events to be 
  // fired without waiting for the current frame to end. Change?

  Frame.prototype.handleNext = function () {
    this.state_machine.consumeEvent('next');
    if (this.state_machine.getStatus() === 'in_transition_next') {
      this.handleTransition();
    } else {
      console.log('State not in pause when next event was fired.');
    }
    return this;
  }

  Frame.prototype.handlePrev = function () {
    this.state_machine.consumeEvent('prev');
    if (this.state_machine.getStatus() === 'in_transition_prev') {
      this.handleTransition();
    } else {
      console.log('State not in pause when prev event was fired.');
    }
    return this;
  }

  Frame.prototype.handleReset = function () {
    this.state_machine.consumeEvent('reset');
    if (this.state_machine.getStatus() === 'in_transition_reset') {
      this.handleTransition();
    } else {
      console.log('State not in pause when reset event was fired.');
    }
    return this;
  }

  Frame.prototype.handleJump = function (value) {
    this.state_machine.consumeEvent('jump');
    if (this.state_machine.getStatus() === 'in_transition_jump') {
      this.handleTransition(value);
    } else {
      console.log('State not in pause when jump event was fired.');
    }
    return this;
  }

  
  Frame.prototype.handleTransition = function (value) {
    var self = this, status = this.state_machine.getStatus();
    if (status === 'in_transition_start') {
      this.old_frame = this.frame;
      this.frame += this.delta;
      this.startTransition();
    } else if (status === 'in_transition_prev') {
      this.old_frame = this.frame;
      this.frame -= this.delta;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_next') {
      this.old_frame = this.frame;
      this.frame += this.delta;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_jump') {
      if (!value) return new Error('need to pass a value to jump!');
      this.old_frame = this.frame;
      this.frame = value;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_transition_reset') {
      this.old_frame = this.frame;
      this.frame = this.initial_frame;
      this.startTransition();
      self.state_machine.consumeEvent('stop');
    } else if (status === 'in_pause') {
      return;
    } 
  }

  return Frame;
  
});


define('chart',[
  "d3", 
  "d3_tip",
  "draw",
  "base_config",
  "utils/mixins",
  "mixins/data",
  "mixins/layout",
  "mixins/scale",
  "mixins/axis",
  "mixins/chart",
  "bar/config",
  "bar/mixins", 
  "bar/bar",
  "line/config",
  "line/mixins",
  "line/line",
  "circle/config",
  "circle/mixins",
  "circle/circle",
  "frame/states",
  "frame/state_machine",
  "frame/frame"
], function(
  d3, 
  d3_tip,
  draw, 
  base_config, 
  utils_mixins, 
  data_mixins, 
  layout_mixins, 
  scale_mixins,
  axis_mixins,
  chart_mixins,
  bar_config,
  bar_mixins,
  Bar,
  line_config,
  line_mixins,
  Line,
  circle_config,
  circle_mixins,
  Circle,
  states, 
  StateMachine, 
  Frame
) {

  d3.d3_tip = d3_tip;

  return {
    d3: d3,
    draw: draw,
    base_config: base_config,
    utils_mixins: utils_mixins,
    data_mixins: data_mixins,
    layout_mixins: layout_mixins,
    scale_mixins: scale_mixins,
    axis_mixins: axis_mixins,
    chart_mixins: chart_mixins,
    bar_config: bar_config,
    bar_mixins: bar_mixins,
    Bar: Bar,
    line_config: line_config,
    line_mixins: line_mixins,
    Line: Line,
    circle_config: circle_config,
    circle_mixins: circle_mixins,
    Circle: Circle,
    Frame: Frame,
    states: states, 
    StateMachine: StateMachine,
  };

});


