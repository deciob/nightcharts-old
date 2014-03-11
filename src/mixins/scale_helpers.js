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
  function _applyLinearScale (range, __) {
    var max;
    if (__.max) {
      max = __.max;
    } else {
      // TODO: this is fundamentally broken!!!
      // It does not handle array of arrays...
      // Relying for now on passing __.max
      max = d3.max( __.data, function(d) { return parseFloat(d[1]); } );
    }
    return this.range(range).domain([0, max]);
  }

  function _applyTimeScale (range, __) {
    // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
    var data = __.x_axis_data || __.data,  // FIXME this hack!
        t1 = data[0][0],
        t2 = data[data.length - 1][0],
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
      return this.range(range).domain([data[0][0], data[data.length - 1][0]]);
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
    return this;
  };

});

