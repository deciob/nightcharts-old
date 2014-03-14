define('mixins/scale_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function _getRange (axis, __) {
    var vertical = __.vertical;
    if ( axis == 'x') {
      return [0, __.w];
    } else if ( axis == 'y' && vertical ) {
      return [__.h, 0];
    } else if ( axis == 'y' && !vertical ) {
      return [0, __.w];
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

  function setScale (scale_type) {
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

  // Sets the range and domain for the linear scale.
  // TODO: unit test.
  function _applyLinearScale (range, __) {
    var force_scale_bounds = __.force_scale_bounds,
        min_max,
        min,
        max;
    if ( force_scale_bounds === false ) {
      min_max = utils.getMinMaxValues(__.data);
      return this.range(range).domain([0, min_max.max]);
    } else if ( force_scale_bounds === true ) {
      min_max = utils.getMinMaxValues(__.data);
      return this.range(range).domain([min_max.min, min_max.max]);
    } else if ( utils.isObject(force_scale_bounds) ) {
      min_max = force_scale_bounds,
      min = min_max.min || 0,
      max = min_max.max || utils.getMinMaxValues(__.data).max;
      return this.range(range).domain([min, max]);
    } else {
      throw new Error("force_scale_bounds wrong type");
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
          .range([0, __.w()])));
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

  function applyScale (axis, scale_type, __) {
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

  return function () {
    this.setScale = setScale;
    this.setScales = setScale;
    this.applyScale = applyScale;
    this.applyScales = applyScale;
    // private methods, exposed for testing
    this._applyLinearScale = _applyLinearScale;
    this._getRange = _getRange;
    return this;
  };

});

