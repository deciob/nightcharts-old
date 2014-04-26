// **Useful functions that can be shared across modules**

define('utils',[
  'd3'
], function(
  d3
) {

  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source, use_clone, not_override) {
    var use_clone = (typeof use_clone === "undefined") ? true : use_clone,
        target_clone = use_clone ? clone(target): target;
    for(prop in source) {
      if (not_override) {
        target_clone[prop] = target_clone[prop] ? target_clone[prop] : source[prop];
      } else {
        target_clone[prop] = source[prop];
      }
    }
    return target_clone;
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

  return {
    clone: clone,
    extend: extend,
    isObject: isObject,
    getset: getset,
    endall: endall,
    tip: tip,
    getGraphHelperMethod: getGraphHelperMethod,
    getMinMaxValues: getMinMaxValues,
  };

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
      delay: 100,  // transition delay
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


define("defaults", function(){});

define('composer',[
  'd3',
  'utils',
  'defaults',
], function(
  d3,
  utils,
  defaults
) {

  return function (user_config) {

    var config = user_config || {},
        utils  = utils,
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(defaults, config);

    function composer (selection) {

      debugger;

    }

    getset(composer, __);
    d3.keys(utils).each( function (k) { d3.rebind(composer, utils, utils[k]); });

    return composer;

  }

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


define("data", function(){});

define('chart',[
  'd3',
  'utils',
  'defaults',
  'composer',
  'data',
], function (
  d3,
  utils,
  defaults, 
  composer,
  data 
) {

  return {
    d3: d3,
    utils: utils,
    defaults: defaults,
    composer: composer,
    data: data,
  };

});


