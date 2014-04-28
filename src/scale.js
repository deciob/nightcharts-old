define('scale', [
  "d3",
], function (d3) {

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

  function setScales (__) {
    __.xScale = _setScale(__.x_scale)();
    __.yScale = _setScale(__.y_scale)();
    return __;
  }

  //TODO: throw on wrong input
  function _parseScaleBounds (__, data, options) {
    var min_max = options.getMinMaxValues(data);
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
  function _applyLinearScale (__, data, options) {
    var min_max = _parseScaleBounds(__, data, options);  
    return this.range(options.range).domain(min_max);
  }

  function _applyTimeScale (__, data, options) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var domain = _getDomain(data, 'x'),
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
  function _applyOrdinalScale (__, data, options) {
    var data = __.x_axis_data || data,  // FIXME this hack!
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

  function _applyScale (__, data, options) {
    options.range = _getRange(options.axis, __);
    switch (options.scale_type) {
      case 'ordinal':
        return _applyOrdinalScale.call(this, __, data, options);
      case 'linear':
        return _applyLinearScale.call(this, __, data, options);
      case 'time':
        return _applyTimeScale.call(this, __, data, options);
      case undefined:
        return new Error('scale cannot be undefined');
      default:
        throw new Error('scale_type ' 
                         + scale_type 
                         + ' not supported. Is it misspelled?' );
    }
  }

  function applyScales (__, data) {
    var options = {};
    options.getMinMaxValues = this.getMinMaxValues;
    options.axis = 'x';
    options.scale_type = __.x_scale;
    _applyScale.call( __.xScale, __, data, options);
    options.axis = 'y';
    options.scale_type = __.y_scale;
    _applyScale.call( __.yScale, __, data, options);
  }

  return {
    setScales: setScales,
    applyScales: applyScales,
    applyScale: _applyScale,
    //private methods, exposed for testing
    _applyLinearScale: _applyLinearScale,
    _getRange: _getRange,
  };

});

