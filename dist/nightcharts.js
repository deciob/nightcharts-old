// **Useful functions that can be shared across modules**

define('utils',[
  'd3'
], function (d3) {
  


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
    lines: {class_name: ''},
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
    data_parser: 'groupedDataParser', // or simpleDataParser
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
    drawDispatch: d3.dispatch('draw'),
    // .....
    use_existing_chart: false
  };
  
});


define('data', [
  "d3",
  'utils'
], function (d3, utils) {
  

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
      data = __.invert_data ? utils.clone(data).reverse() : data;
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

  function sliceGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var sliced_data = {};
    for (var id in data) {
      if( data.hasOwnProperty( id ) ) {
        // it assumes the data object is correctly sorted.
        sliced_data[id] = data[id];
        if (identifier === id) {
          break;
        }
      }
    }
    return sliced_data;
  }

  function getIndexFromIdentifier (identifier, data, __) {
    var index;
    data.forEach(function(d, i) {
      if (__.frameIdentifierKeyFunction(d) === identifier) {
        index = i;
      }
    });
    return index;
  }

  function filterGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var index = getIndexFromIdentifier(identifier, data, __);
    return data.slice(index, index+2);
  }

  //function filterGroupedNormalizedDataAtIdentifier (identifier, data, __) {
  //  var identified = false;
  //  return data.map(function(data) {
  //    return data.filter(function(d) {
  //      var include = identified ? false : true;
  //      console.log(d, identifier);
  //      indentified = d[__.frame_identifier_index] === identifier;
  //      return include;
  //    });
  //  });
  //}

//  // TODO: rock test this shit!!!!
//  function sliceNormalizedDataAtIdentifier (identifier, data, __) {
//    var sliced_data = [];
//    for (var id in data) {
//      if( data.hasOwnProperty( id ) ) {
//        var g = [];
//        data[id].forEach(function (d, i) {
//          g.push(d);
//        })
//        // it assumes the data object is correctly sorted.
//        sliced_data.push(data[id][0]);
//        if (identifier === id) {
//          break;
//        }
//      }
//    }
//    return sliced_data;
//  }



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
    setDelay: setDelay,
    normalizeData: normalizeData,
    groupNormalizedDataByIndex: groupNormalizedDataByIndex,
    sliceGroupedNormalizedDataAtIdentifier: sliceGroupedNormalizedDataAtIdentifier,
    filterGroupedNormalizedDataAtIdentifier: filterGroupedNormalizedDataAtIdentifier,
    //sliceNormalizedDataAtIdentifier: sliceNormalizedDataAtIdentifier,
    simpleDataParser: simpleDataParser,
    groupedDataParser: groupedDataParser,
  };

});


define('scale', [
  'd3',
  'utils',
  'data'
], function (d3, utils, data_module) {
  

  function _getRange (axis, __) {
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y') {
      return [__.h, 0];
    }
  }

  // It assumes the data is correctly sorted.
  // TODO: Guard against axis argument == null or undefined --- TEST TEST TEST
  // TODO: data accessor?
  function _getDomain (data, axis, __) {
    var dataParser = data_module[__.data_parser],
        min_max = utils.getMinMaxValues(data, dataParser, axis);
    return [min_max.min, min_max.max];
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

  function setScales (__) {
    __.xScale = _setScale(__.x_scale)();
    __.yScale = _setScale(__.y_scale)();
    return __;
  }

  //TODO: throw on wrong input
  function _parseScaleBounds (__, options) {
    var data = __.data,
        data_parser = data_module[__.data_parser],
        min_max = utils.getMinMaxValues(data, data_parser),
        bounds = __.scale_bounds.split(',');
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
  function _applyLinearScale (__, options) {
    var data = __.data,
        min_max = _parseScaleBounds(__, data, options);  
    return this.range(options.range).domain(min_max);
  }

  function _applyTimeScale (__, options) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var data = __.data,
        domain = _getDomain(data, 'x', __),
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
      return this.range(options.range).domain(domain);
    }
  }

  // Sets the range and domain for the ordinal scale.
  function _applyOrdinalScale (__, options) {
    var data = __.x_axis_data || __.data,  // FIXME this hack!
        range_method;
    if (options.scale_type == 'time') {
      range_method = 'rangePoints';
    } else {
      range_method = 'rangeRoundBands';
    }
    return this
      [range_method](options.range, __.padding)
      .domain(data[0].map( function(d) { return d[0]; } ) );
  }

  function _applyScale (__, options) {
    options.range = _getRange(options.axis, __);
    switch (options.scale_type) {
      case 'ordinal':
        return _applyOrdinalScale.call(this, __, options);
      case 'linear':
        return _applyLinearScale.call(this, __, options);
      case 'time':
        return _applyTimeScale.call(this, __, options);
      case undefined:
        return new Error('scale cannot be undefined');
      default:
        throw new Error('scale_type ' 
                         + scale_type 
                         + ' not supported. Is it misspelled?' );
    }
  }

  function applyScales (__) {
    var options = {};
    options.getMinMaxValues = utils.getMinMaxValues;
    options.axis = 'x';
    options.scale_type = __.x_scale;
    _applyScale.call( __.xScale, __, options);
    options.axis = 'y';
    options.scale_type = __.y_scale;
    _applyScale.call( __.yScale, __, options);
  }

  return {
    setScales: setScales,
    applyScales: applyScales,
    applyScale: _applyScale,
    //private methods, exposed for testing
    _applyLinearScale: _applyLinearScale,
    _getRange: _getRange,
    _getDomain: _getDomain,
  };

});


define('layout', [
  "d3",
  'utils'
], function (d3, utils) {
  

  function setDimensions (selection, __) {
    if ( __.width === undefined ) {
      __.width  = +selection.style('width').replace('px', '');
      __.height = __.height || __.width * __.ratio;
    } else if ( __.width && __.height === undefined) {
      __.height = __.width * __.ratio;
    }
    setW(__);
    setH(__);
    return __;
  }

  function setW (__) {
    __.w   = __.width - __.margin.right - __.margin.left;
    return __;
  };
      
  function setH (__) {
    __.h   = __.height - __.margin.top - __.margin.bottom;
    return __;
  };

  return {
    setDimensions: setDimensions,
    setW: setW,
    setH: setH,
  };

});

define('components/x_axis', [
  "d3",
  'utils'
], function (d3, utils) {
  

  function _transitionAxisV (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.yScale.range()[0] + ")")
      .call(__.xAxis);
  }

  function _transitionAxisH (__) {
    return this
      .attr("transform", "translate(" + __.offset_x + "," + __.h + ")")
      .call(__.xAxis);
  }

  function transitionAxis (__) {
    if (__.orientation == 'vertical') {
      return _transitionAxisV.call(this, __);
    } else if (__.orientation == 'horizontal') {
      return _transitionAxisH.call(this, __);
    } else {
      throw new Error('orientation must be one of: vertical, horizontal');
    } 
  }

  function setAxis (__) {
    __.xAxis = utils.setAxisProps(__.x_axis, __.xScale);
    return __;
  }

  function drawXAxis (selection, transition, __) {
    var g;
    __ = setAxis(__);
    g = selection.append("g").attr("class", "x axis");
    // Update the axis.
    transitionAxis.call(transition.selectAll('.x.axis'), __);
    return g;
  } 

  return {
    drawXAxis: drawXAxis,
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});
define('components/y_axis', [
  "d3",
  'utils'
], function (d3, utils) {
  

  function setAxis (__) {
    __.yAxis = utils.setAxisProps(__.y_axis, __.yScale);
    return __;
  }

  function transitionAxis (__) {
    return this
      .attr("transform", "translate(0,-" + __.offset_y + ")")
      .call(__.yAxis)
      .selectAll("g")
      .delay( __.delay );
  }

  function drawYAxis (selection, transition, __) {
    var g;
    __ = setAxis(__);
    g = selection.append("g").attr("class", "y axis");
    // Update the axis.
    transitionAxis.call(transition.selectAll('.y.axis'), __);
    return g; 
  }

  return {
    drawYAxis: drawYAxis,
    setAxis: setAxis,
    transitionAxis: transitionAxis,
  };

});
define('components/line', [
  "d3",
  'utils'
], function (d3, utils) {
  

  function line (__) {
    return d3.svg.line().x(function(d, i) {
      return __.xScale(d[0]);
    }).y(function(d, i) {
      return __.yScale(d[1]);
    });
  }

  function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function(t) { 
      return i(t); };
  }

  function dataIdentifier (d) {
    //console.log('dataIdentifier', d[0][0]);
    return d[0];
  }

  function transitionLine (d, __) {

    var self = this,
        line_body = this.select('.line.body'),
        line_head = this.select('.line.head'),
        line_body_path, 
        line_head_path;

    line_head_path = line_head.selectAll(".line.head.path")
      .data([d], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    line_head_path.exit().transition().remove();
  
    line_head_path.enter().append("path")
      .attr("class", "line head path")
      .attr("d", function (d) {
        //console.log(JSON.stringify(d));
        return line(__)(d);})    
      .transition()
      .delay(__.delay)
      .duration(__.duration)
      .attrTween("stroke-dasharray", tweenDash)
      .call(utils.endall, [d], __.handleTransitionEnd);
      //.each("end", function() { 
      //  self.endall.call(this, data, __.handleTransitionEnd); 
      //});
  
  }

  function setLines (selection, __, data, old_frame_identifier) {
    //console.log('-----------------------------------');
    //console.log(data);
    //TODO: this is utils!!!
    var line = selection.selectAll(".line")
          // data is an array, each element one line.
          .data(data, dataIdentifier),
        line_g, 
        line_g_start, 
        line_g_end,
        ov_options = __.overlapping_charts.options,
        ov_line_options = ov_options ? ov_options.lines : void 0;
  
    // Exit phase (let us push out old line before the new ones come in).
    line.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // this should end the line or line segment (depends from the data),
    // if the data only represents a fraction of the line then the charting
    // function needs to be called again.
    line_g = line.enter().append("g")
      .attr("class", "line");
    line_g.append('g')
      .attr("class", "line body");
    line_g.append('g')
      .attr("class", "line head");
    line_g.each(function (d, i) { 
        //console.log('lines.enter().append("g")', d);
        return transitionLine.call(d3.select(this), d, __) });

    return this;
  }

  function drawLines (selection, transition, __, old_frame_identifier) {
    var has_timescale = __.x_scale == 'time',
        g; 

    if (__.lines.class_name != '') {
      g = selection.selectAll('g.lines.' + __.lines.class_name).data([__.data]);
    } else {
      g = selection.selectAll('g.lines').data([__.data]);
    }

    g.exit().remove();
    g.enter().append('g').attr('class', 'lines ' + __.lines.class_name);

    g.each(function(data, i) {
      setLines(d3.select(this), __, data, old_frame_identifier);
      //var lines = this.selectAll(".line").data(data, __.dataIdentifier);
    });


    //__.data.forEach( function (data, i) {
    //  var g = selection.append("g").attr("class", ".lines");
    //  setLines(g, transition, __, old_frame_identifier);
    //});
  }

  return {
    drawLines: drawLines,
  };

});


define('components/components', [
  'components/x_axis',
  'components/y_axis',
  'components/line'
], function (x_axis, y_axis, line) {

  return {
    x_axis: x_axis,
    y_axis: y_axis,
    lines: line,
  };

});
define('composer',[
  'd3',
  'utils',
  'defaults',
  'data',
  'scale',
  'layout',
  'components/components',
], function(
  d3,
  utils,
  defaults,
  data_module,
  scale,
  layout,
  components_module
) {
  

  var defaults = defaults,
      utils  = utils,
      extend = utils.extend,
      getset = utils.getset;

  function composer (user_config) {

    var config = user_config || {},
        __     = extend(defaults, config);

    function compose (selection, options) {
      var is_frame = (!options || options.is_frame === "undefined") ? false : options.is_frame,
          old_frame_identifier = (!options || options.old_frame_identifier === "undefined") ? void 0 : options.old_frame_identifier,
          data = selection.datum(),
          svg,
          g,
          transition;

      // TODO: run a validation function on __, if debug mode.

      compose.current_configuration = extend ({}, __, {use_clone: true});

      __.data = data;
      __ = data_module.setDelay(data, __); //FIXME and TESTME
      if (!__.use_existing_chart) {
        __ = layout.setDimensions(selection, __);
        __ = scale.setScales(__);
  
        scale.applyScales(__); //TESTME
  
        compose.current_applied_configuration = extend ({}, __, {use_clone: true});

      }

      if (__.use_existing_chart) {
        g = selection.select('g');
      } else {
        // Select the svg element, if it exists.
        svg = selection.selectAll("svg").data([data]);
        // Otherwise, create the skeletal chart.
        g = svg.enter().append("svg").append("g");
        // Update the outer dimensions.
        svg.attr("width", __.width).attr("height", __.height);
        // Update the inner dimensions.
        g.attr("transform", "translate(" + 
          __.margin.left + "," + __.margin.top + ")");
      }
      // Transitions root.
      transition = g.transition().duration(__.duration);

      __.components.forEach( function (component) {
        var method_name;
        if (components_module[component]) {
          method_name = utils.toCamelCase('draw_' + component);
          components_module[component][method_name](g, transition, __);
        }
      });

    }

    getset(compose, __);
    //compose.getCurrentConfiguration = __;
    compose.__ = __;

    return compose;

  }

  return composer;

});
define('draw',['require'],function(require) {
  

  return function (chart, selection, data, options) {
    if (data) {
      return chart(selection.datum(data), options);
    }
    return function (data, options) {
      return chart(selection.datum(data), options);
    }
  }

});


define('frame/defaults', [], function() {
    
  return {

    initial_frame: void 0,
    old_frame: void 0,
    frame_identifier_index: void 0,
    frameIdentifierKeyFunction: void 0,
    frame_identifier: void 0, // deprecated, obsolete, no longer used?
    current_timeout: void 0,
    draw_dispatch: void 0,
    delta: 1,
    step: 500,
    data: {},
    frame_type: 'block', //or 'sequence'
    categoricalValue: function (d) { return d[0]; },
    normalize_data: false

  };

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
  'utils',
  'data',
  'frame/defaults',
  'frame/states',
  'frame/state_machine'
], function(d3, utils, data_module, default_config, states, StateMachine) {

  return function (user_config) {

    var config = user_config || {},
        extend = utils.extend,
        getset = utils.getset,
        __     = extend(default_config, config, {not_override: false});

    function Frame () {
  
      var self = this instanceof Frame
                 ? this
                 : new Frame();
      
      self.__ = __;
      getset(self, __);
      self.frame = __.initial_frame;

      self.normalized_data = __.normalize_data ? data_module.normalizeData(__.data, __) : __.data;
      //self.parsed_data = data_module.groupNormalizedDataByIndex(
      //  __.frame_identifier_index, self.normalized_data, __, 
      //  {grouper: 'object', keyFunction: __.frameIdentifierKeyFunction});
  
      self.state_machine = new StateMachine(states.transition_states);
      self.dispatch = d3.dispatch(
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
      self.dispatch.on('end.frame', self.handleFrameEnd);
  
      self.dispatch.on('stop', self.handleStop);
  
      self.dispatch.on('start', self.handleStart);
  
      self.dispatch.on('next', self.handleNext);
  
      self.dispatch.on('prev', self.handlePrev);
  
      self.dispatch.on('reset', self.handleReset);
  
      self.dispatch.on('jump', self.handleJump);
  
      return self;
    }
  
    //getset(Frame.prototype, __);
    getset(Frame, __);
  
    Frame.prototype.startTransition = function () {
      var self = this;
      clearTimeout(__.current_timeout);
      var data = self.getDataForFrame(self.normalized_data, __);
      if (data[0].length > 0) { //data[0] FIXME???
      __.current_timeout = setTimeout( function () {
        // Fire the draw event
        __.draw_dispatch.draw.call(self, data, __.old_frame);
      }, __.step);
      } else {
        // When no data is left to consume, let us stop the running frames!
        this.state_machine.consumeEvent('stop');
        this.frame = __.old_frame;
      }
      self.dispatch.at_beginning_of_transition.call(self);
    }

    Frame.prototype.getDataForFrame = function (data, __) {
      var self = this;
      if (__.frame_type == 'block') {
        return [this.parsed_data[this.frame]]; //FIXME!!!!
      } else {
        return data.map(function(d) {
          return data_module.filterGroupedNormalizedDataAtIdentifier(
            self.frame, d, __);
        });
      }
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
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
      } else if (status === 'in_transition_prev') {
        __.old_frame = this.frame;
        this.frame -= __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_next') {
        __.old_frame = this.frame;
        this.frame += __.delta;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_jump') {
        if (!value) return new Error('need to pass a value to jump!');
        __.old_frame = this.frame;
        this.frame = value;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_transition_reset') {
        __.old_frame = this.frame;
        this.frame = __.initial_frame;
        this.startTransition();
        self.state_machine.consumeEvent('stop');
      } else if (status === 'in_pause') {
        return;
      } 
    }
  
    return Frame;

  };
  
});


define('chart',[
  'd3',
  'utils',
  'defaults',
  'composer',
  'draw',
  'data',
  'scale',
  'layout',
  'components/components',
  'frame/frame'
], function (
  d3,
  utils,
  defaults, 
  composer,
  draw,
  data,
  scale,
  layout,
  components,
  Frame
) {

  return {
    d3: d3,
    utils: utils,
    defaults: defaults,
    composer: composer,
    draw: draw,
    data: data,
    scale: scale,
    layout: layout,
    components: components,
    Frame: Frame
  };

});


