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

  function extend (target, source) {
    var target_clone = clone(target);
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

  return {
    extend: extend,
    getset: getset,
    isObject: isObject,
    schonfinkelize: schonfinkelize,
    endall: endall,
    tip: tip,
  };

});

