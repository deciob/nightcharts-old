define('scale', [
  'd3',
  'utils',
], function (d3, utils) {
  'use strict';

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
    var dataParser = utils[__.data_parser],
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
  function _parseScaleBounds (__, data, options) {
    var data_parser = utils[__.data_parser],
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
    var range_method, callback;
    if (options.scale_type == 'time') {
      range_method = 'rangePoints';
    } else {
      range_method = 'rangeRoundBands';
    }
    // FIXME!!! 
    // This is based on the wrong? assumption that you can only have one 
    // ordinal scale, on the x axis or on the y axis.
    if (__.x_scale == 'ordinal') {
      callback = __.xValueN
    } else {
      callback = __.yValueN
    }
    return this
      [range_method](options.range, __.padding)
      .domain(__.data[0].map( callback ) );
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

