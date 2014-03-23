// **Useful functions that can be shared across modules**

define(["d3", "d3_tip"], function(d3, d3_tip) {

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