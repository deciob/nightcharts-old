(function(define) {
  return define(["d3"], function(d3) {

    // Handling the barchart orientation.

    // Sets the range and domain for the linear scale.
    function inflateLinearScale (params, range) {
      var max;
      if (params.__.max) {
        max = params.__.max;
      } else {
        max = d3.max( params.data, function(d) {return parseFloat(d[1]); } );
      }
      return this.range(range).domain([0, max]);
    }
  
    // Sets the range and domain for the ordinal scale.
    function inflateOrdinalScale (params, range) {
      return this
        .rangeRoundBands(range, params.__.padding)
        .domain(params.data.map(function(d) { return d[0]; }));
    }
  
    var vertical = {
      xScale: d3.scale.ordinal,
      yScale: d3.scale.linear,
      inflateXScale: function (params) {
        var range = [0, params.w()];
        return inflateOrdinalScale.call(this, params, range);
      },
      inflateYScale: function (params) {
        // Note the inverted range for the y-scale: bigger is up!
        var range = [params.h(), 0];
        return inflateLinearScale.call(this, params, range);
      },
      createBars: function (params) {
        return this
          .append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return params.xScale(d[1]); })
          .attr("width", params.xScale.rangeBand())
          .attr("y", params.h() + params.__.barOffSet)
          .attr("height", 0);
      },
      transitionXAxis: function (params) {
        return this
          .attr("transform", "translate(0," + params.yScale.range()[0] + ")")
          .call(params.xAxis);
      },
      transitionYAxis: function (params) {
        return this.call(params.yAxis)
          .selectAll("g")
          .delay(params.delay);
      },
      transitionBars: function (params) {
        return this.delay(params.delay)
          .attr("x", function(d) { return params.xScale(d[0]); })
          .attr("y", function(d) { return params.yScale(d[1]); })
          .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
      }
    }
  
    var horizontal = {
      xScale: d3.scale.linear,
      yScale: d3.scale.ordinal,
      inflateXScale: function (params) {
        var range = [0, params.w()];
        return inflateLinearScale.call(this, params, range);
      },
      inflateYScale: function (params) {
        // Note the inverted range for the y-scale: bigger is up!
        var range = [params.h(), 0];
        return inflateOrdinalScale.call(this, params, range);
      },
      createBars: function (params) {
        return this
          .append("rect")
          .attr("class", "bar")
          .attr("x", params.__.barOffSet)
          .attr("width", 0)
          .attr("y", function(d) { return params.yScale(d[0]); })
          .attr("height", params.yScale.rangeBand());
      },
      transitionXAxis: function (params) {
        return this.attr("transform", "translate(" + params.__.barOffSet
          + "," + params.h() + ")").call(params.xAxis);
      },
      transitionYAxis: function (params) {
        return this.call(params.yAxis)
          .selectAll("g")
          .delay(params.delay);
      },
      transitionBars: function (params) {
        return this.delay(params.delay)
          .attr("y", function(d) { return params.yScale(d[0]); })
          .attr("x", params.__.barOffSet)
          .attr("width", function(d) { 
            return params.xScale(d[1]) + params.__.barOffSet; 
          });
      }
    }
  
    return {
      vertical: vertical,
      horizontal: horizontal
    };

  });

})(typeof define === "function" && define.amd ? define : function(ids, factory) {
  var deps;
  deps = ids.map(function(id) {
    return require(id);
  });
  return module.exports = factory.apply(null, deps);
});