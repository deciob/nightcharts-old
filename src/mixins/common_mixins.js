define('mixins/common_mixins',["d3", "utils/utils"], function(d3, utils) {

    // Sets the range and domain for the linear scale.
    function _applyLinearScale (params, range) {
      var max;
      if (params.__.max) {
        max = params.__.max;
      } else {
        max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
      }
      return this.range(range).domain([0, max]);
    }

    function _applyTimeScale (params, range) {
      // see [bl.ocks.org/mbostock/6186172](http://bl.ocks.org/mbostock/6186172)
      var data = params.x_axis_data || params.data,  // FIXME this hack!
          t1 = data[0][0],
          t2 = data[data.length - 1][0],
          offset = params.__.time_offset,
          t0,
          t3;
      if (params.__.time_offset) {
        t0 = d3.time[offset].offset(t1, -1);
        t3 = d3.time[offset].offset(t2, +1);
        return this
          .domain([t0, t3])
          .range([t0, t3].map(d3.time.scale()
            .domain([t1, t2])
            .range([0, params.w()])));
      } else {
        return this.range(range).domain([data[0][0], data[data.length - 1][0]]);
      }
    }
  
    // Sets the range and domain for the ordinal scale.
    function _applyOrdinalScale (params, range) {
      var data = params.x_axis_data || params.data;  // FIXME this hack!
      return this
        .rangeRoundBands(range, params.__.padding)
        .domain(data.map(function(d) { return d[0]; }));
    }
  
    function _applyXScaleV (params) {
      var range = [0, params.w()];
      if (params.__.date) {
        return _applyTimeScale.call(this, params, range);
      } else {
        return _applyOrdinalScale.call(this, params, range);
      }
    }
  
    function _applyXScaleH (params) {
      var range = [0, params.w()];
      return _applyLinearScale.call(this, params, range);
    }
  
    function applyXScale (orientation, params) {
      if (orientation == 'vertical') {
        return _applyXScaleV.call(this, params);
      } else {
        return _applyXScaleH.call(this, params);
      }
    }
  
    function _applyYScaleV (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return _applyLinearScale.call(this, params, range);
    }
  
    function _applyYScaleH (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return _applyOrdinalScale.call(this, params, range);
    }
  
    function applyYScale (orientation, params) {
      if (orientation == 'vertical') {
        return _applyYScaleV.call(this, params);
      } else {
        return _applyYScaleH.call(this, params);
      }  
    }
  
    function _transitionXAxisV (params) {
      return this
        .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
        .call(params.xAxis);
    }
  
    function _transitionXAxisH (params) {
      return this.attr("transform", "translate(" + params.__.barOffSet
        + "," + params.h() + ")").call(params.xAxis);
    }
  
    function transitionXAxis (orientation, params) {
      if (orientation == 'vertical') {
        return _transitionXAxisV.call(this, params);
      } else {
        return _transitionXAxisH.call(this, params);
      }  
    }
  
    function _transitionYAxisV (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function _transitionYAxisH (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function transitionYAxis (orientation, params) {
      if (orientation == 'vertical') {
        return _transitionYAxisV.call(this, params);
      } else {
        return _transitionYAxisH.call(this, params);
      }  
    } 

    function setYScale (orientation) {
      if (orientation == 'vertical') {
        return d3.scale.linear;
      } else {
        return d3.scale.ordinal;
      }  
    }

    function setXScale (orientation, date) {
      if (orientation == 'vertical' && date) {
        return d3.time.scale;
      } else if (orientation != 'vertical' && date) {
        return new Error('Timescale is only for horizontal graphs.')
      } else if (orientation == 'vertical') {
        return d3.scale.ordinal;
      } else {
        return d3.scale.linear;
      }  
    }

    function setXAxis (x_axis, xScale) {
      var xAxis = d3.svg.axis().scale(xScale);
      d3.entries(x_axis).forEach(function(o) {
        if (o.value !== undefined) {
          xAxis[o.key](o.value);
        }
      });
      return xAxis;
    }

    function setYAxis (y_axis, yScale) {
      var yAxis = d3.svg.axis().scale(yScale);
      d3.entries(y_axis).forEach(function(o) {
        if (o.value !== undefined) {
          yAxis[o.key](o.value);
        }
      });
      return yAxis;
    }

    return function (orientation, params) {
      this.applyXScale = applyXScale;
      this.applyYScale = applyYScale;
      this.transitionXAxis = transitionXAxis;
      this.transitionYAxis = transitionYAxis;
      this.setYScale = setYScale;
      this.setXScale = setXScale;
      this.setXAxis = setXAxis;
      this.setYAxis = setYAxis;
      return this;
    };

});

