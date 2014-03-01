define('mixins/bar_mixins',["d3", "utils/utils"], function(d3, utils) {

    function createBarsV (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return params.xScale(d[1]); })
        .attr("width", params.xScale.rangeBand())
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    }

    function createTimeBarsV (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          return params.xScale(d[1]); })
        .attr("width", 25)
        .attr("y", params.h() + params.__.barOffSet)
        .attr("height", 0);
    }

    function createBarsH (params) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", params.__.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("height", params.yScale.rangeBand());
    }

    function createBars (orientation, params) {
      if (orientation == 'vertical' && !params.__.parseTime) {
        return createBarsV.call(this, params);
      } else if (orientation == 'vertical' && params.__.parseTime) {
        return createTimeBarsV.call(this, params);
      } else {
        return createBarsH.call(this, params);
      }
    }

    function transitionBarsV (params) {
      return this.delay(params.delay)
        .attr("x", function(d) { return params.xScale(d[0]); })
        .attr("y", function(d) { return params.yScale(d[1]); })
        .attr("height", function(d) { return params.h() - params.yScale(d[1]); });
    }

    function transitionBarsH (params) {
      return this.delay(params.delay)
        .attr("y", function(d) { return params.yScale(d[0]); })
        .attr("x", params.__.barOffSet)
        .attr("width", function(d) { 
          return params.xScale(d[1]) + params.__.barOffSet; 
        });
    }

    function transitionBars (orientation, params) {
      if (orientation == 'vertical') {
        return transitionBarsV.call(this, params);
      } else {
        return transitionBarsH.call(this, params);
      }
    }

    return function (orientation, params) {
      this.createBars = createBars;
      this.transitionBars = transitionBars;
      return this;
    };

});

