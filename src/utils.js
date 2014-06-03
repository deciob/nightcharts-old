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
    for(var prop in source) {
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

  function getMinMaxValues (data, dataParser, axis) {
    var min = Infinity,
        max = 0,
        index;
    if (axis === undefined) {axis = 'y'};
    if (axis === 'x') {index = 0} else if (axis === 'y') {index = 1};

    function callback (d, i, data) {
      //TODO: handle parseFloat
      var min_p = d3.min( data, function(d) { return d[index]; } ),
          max_p = d3.max( data, function(d) { return d[index]; } );
      min = min_p < min ? min_p : min;
      max = max_p > max ? max_p : max;
    }

    dataParser(data, callback);

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



  // Data functions


  function setDelay (data, __) {
    var duration = __.duration;
    if (duration == undefined) { throw new Error('__.duration unset')}
    __.delay = function (d, i) {
      // FIXME: only referring to the first dataset, 
      // while setting the delay on all!
      return i / data[0].length * duration;
    }
    return __;
  };

  function normalizeData (data, __) {
    var parsed_data,
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        xValue = __.xValue,
        yValue = __.yValue,
        zValue = __.zValue;

    if (date_chart) {
      parsed_data = data.map(function(d, i) {
        var x,
            z = zValue.call(data, d);
        // The time data is encoded in a string:
        if (date_chart && date_type == 'string') {
          x = d3.time.format(date_format)
            .parse( xValue.call(data, d).toString() );
        // The time data is encoded in an epoch number:
        } else if (date_chart && date_type == 'epoch') {
          x = new Date(xValue.call(data, d) * 1000);
        }
        if (z) {
          return [x, yValue.call(data, d), z];
        } else {
          return [x, yValue.call(data, d)];
        }
      });
    } else {
      data = __.invert_data ? clone(data).reverse() : data;
      parsed_data = data.map(function(d, i) {
        var x = xValue.call(data, d),
            z = zValue.call(data, d);
        if (z) {
          return [x, yValue.call(data, d), z];
        } else {
          return [x, yValue.call(data, d)];
        }
      });
    }
    // Now the data is normalized:
    __.xValueN = function (d) { return d[0]; };
    __.yValueN = function (d) { return d[1]; };
    __.zValueN = function (d) { return d[2]; };
    
    return parsed_data;
  }

  function _groupInObj (identifier_index, data, __, options) {
    var parsed_data = {},
        keyFunction = options && options.keyFunction || function(k){return k;};
    data.forEach(function (d, i) {
      var group = parsed_data[keyFunction(d[identifier_index])];
      if (group) {
        group.push(d);
      } else {
        parsed_data[keyFunction(d[identifier_index])] = [d];
      }
    });
    return parsed_data;    
  }

  function _groupInArr (identifier_index, data, __, options) {
    var parsed_data = [],
        obj_grouped_data = options && options.obj_grouped_data || 
          _groupInObj(identifier_index, data, __, options);
    for ( var identifier in obj_grouped_data ) {
      if( obj_grouped_data.hasOwnProperty( identifier ) ) {
        parsed_data.push(obj_grouped_data[identifier]);
      }
    }
    return parsed_data;
  }

  // Expects dataset argument to be the return value of normalizeData
  // groupNormalizedDataByIndex(index, options) data, __, identifier_index, grouper
  function groupNormalizedDataByIndex (identifier_index, data, __, options) {
    var grouper = options.grouper;
    if (grouper === 'object') {
      return _groupInObj(identifier_index, data, __, options);
    } else if (grouper === 'array') {
      return _groupInArr(identifier_index, data, __, options);
    } else {
      throw new Error('grouper must be either `object` or `array`');
    }
  }

  function getIndexFromIdentifier (identifier, data, frameIdentifierKeyFunction) {
    var index;
    data.forEach(function(d, i) {
      if (frameIdentifierKeyFunction(d) === identifier) {
        index = i;
      }
    });
    return index;
  }

  function filterGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var index = getIndexFromIdentifier(identifier, data, __.frameIdentifierKeyFunction);
    return data.slice(index, index+2);
  }

  function sliceGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var index = getIndexFromIdentifier(identifier, data, __.frameIdentifierKeyFunction);
    return data.slice(0, index+1);
  }

  function simpleDataParser (data, callback) {
    data.forEach( function (d, i, data) {
      callback(d, i, data);
    });
  }

  function groupedDataParser (dataset, callback) {
    dataset.forEach( function (data, index, dataset) {
      simpleDataParser(data, callback);
    });
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
    // data functions
    setDelay: setDelay,
    normalizeData: normalizeData,
    groupNormalizedDataByIndex: groupNormalizedDataByIndex,
    sliceGroupedNormalizedDataAtIdentifier: sliceGroupedNormalizedDataAtIdentifier,
    filterGroupedNormalizedDataAtIdentifier: filterGroupedNormalizedDataAtIdentifier,
    getIndexFromIdentifier: getIndexFromIdentifier,
    simpleDataParser: simpleDataParser,
    groupedDataParser: groupedDataParser,
  };

});