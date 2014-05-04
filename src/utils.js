// **Useful functions that can be shared across modules**

define([
  'd3'
], function (d3) {
  'use strict';

  function toCamelCase (str) {
    // http://stackoverflow.com/a/6661012/1932827
    return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
  }

  function clone (obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  function extend (target, source, options) {
    var use_clone = (!options || options.use_clone === "undefined") ?
          true : options.use_clone,
        not_override = (!options || options.not_override === "undefined") ? 
          true : options.not_override,
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
  function getset (obj, state, options) {
    var exclude = (!options || options.exclude === "undefined") ?
      [] : options.exclude;
    d3.entries(state).forEach(function(o) {
      if (exclude.indexOf(o.key) === -1) {
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
      }
    });
    return obj;
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

  function getMinMaxValues (dataset) {
    var min = Infinity,
        max = 0;
    dataset.forEach( function (data, index) {
      data.forEach( function (data, i) {
        var min_p = d3.min( data, function(d) { return parseFloat(d[1]); } ),
            max_p = d3.max( data, function(d) { return parseFloat(d[1]); } );
        min = min_p < min ? min_p : min;
        max = max_p > max ? max_p : max;
      });
    });
    return {min: min, max: max};
  }

  function setAxisProps (axis_conf, scale) { 
    var axis = d3.svg.axis().scale(scale);
    d3.entries(axis_conf).forEach(function(o) {
      if ( o.value !== undefined && o.key !== 'show' ) {
        axis[o.key](o.value);
      }
    });
    return axis;
  }

  return {
    toCamelCase: toCamelCase,
    clone: clone,
    extend: extend,
    isObject: isObject,
    getset: getset,
    endall: endall,
    tip: tip,
    getGraphHelperMethod: getGraphHelperMethod,
    getMinMaxValues: getMinMaxValues,
    setAxisProps: setAxisProps,
  };

});