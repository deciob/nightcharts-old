define(["d3", "utils/utils"], function(d3, utils) {

  return (function() {

    // Sets the range and domain for the linear scale.
    function applyLinearScale (params, range) {
      var max;
      if (params.__.max) {
        max = params.__.max;
      } else {
        max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
      }
      return this.range(range).domain([0, max]);
    }
  
    // Sets the range and domain for the ordinal scale.
    function applyOrdinalScale (params, range) {
      return this
        .rangeRoundBands(range, params.__.padding)
        .domain(params.data.map(function(d) { return d[0]; }));
    }
  
    function applyXScaleV (params) {
      var range = [0, params.w()];
      return applyOrdinalScale.call(this, params, range);
    }
  
    function applyXScaleH (params) {
      var range = [0, params.w()];
      return applyLinearScale.call(this, params, range);
    }
  
    function applyXScale (orientation, params) {
      if (orientation == 'vertical') {
        applyXScaleV.call(this, params);
      } else {
        applyXScaleH.call(this, params);
      }
    }
  
    function applyYScaleV (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return applyLinearScale.call(this, params, range);
    }
  
    function applyYScaleH (params) {
      // Note the inverted range for the y-scale: bigger is up!
      var range = [params.h(), 0];
      return applyOrdinalScale.call(this, params, range);
    }
  
    function applyYScale (orientation, params) {
      if (orientation == 'vertical') {
        applyYScaleV.call(this, params);
      } else {
        applyYScaleH.call(this, params);
      }  
    }
  
    function transitionXAxisV (params) {
      return this
        .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
        .call(params.xAxis);
    }
  
    function transitionXAxisH (params) {
      return this.attr("transform", "translate(" + params.__.barOffSet
        + "," + params.h() + ")").call(params.xAxis);
    }
  
    function transitionXAxis (orientation, params) {
      if (orientation == 'vertical') {
        transitionXAxisV.call(this, params);
      } else {
        transitionXAxisH.call(this, params);
      }  
    }
  
    function transitionYAxisV (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function transitionYAxisH (params) {
      return this.call(params.yAxis)
        .selectAll("g")
        .delay(params.delay);
    }
  
    function transitionYAxis (orientation, params) {
      if (orientation == 'vertical') {
        transitionYAxisV.call(this, params);
      } else {
        transitionYAxisH.call(this, params);
      }  
    } 

    function setYScale (orientation) {
      if (orientation == 'vertical') {
        return d3.scale.linear;
      } else {
        return d3.scale.ordinal;
      }  
    }

    function setXScale (orientation) {
      if (orientation == 'vertical') {
        return d3.scale.ordinal;
      } else {
        return d3.scale.linear;
      }  
    }

    return function(orientation, params) {
      this.applyXScale = utils.schonfinkelize(applyXScale, orientation, params);
      this.applyYScale = utils.schonfinkelize(applyYScale, orientation, params);
      this.transitionXAxis = utils.schonfinkelize(transitionXAxis, orientation, params);
      this.transitionYAxis = utils.schonfinkelize(transitionYAxis, orientation, params);
      this.setYScale = utils.schonfinkelize(setYScale, orientation);
      this.setXScale = utils.schonfinkelize(setXScale, orientation);
      return this;
    };

  })();

});