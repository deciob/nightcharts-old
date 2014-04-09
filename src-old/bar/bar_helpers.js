define('bar/bar_helpers',["d3", "utils/utils"], function(d3, utils) {

    function createBarsV (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("width", __.xScale.rangeBand())
        .attr("y", __.h() + __.barOffSet)
        .attr("height", 0);
    }

    function createTimeBarsV (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.bar_width / 2;
        })
        .attr("width", __.bar_width)
        //attention TODO: this get then overridden by the transition
        .attr("y", __.h() + __.barOffSet) 
        .attr("height", 0);
    }

    function createBarsH (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", __.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("height", __.yScale.rangeBand());
    }

    function createBars (orientation, __) {
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return createBarsV.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return createTimeBarsV.call(this, __);
      } else {
        return createBarsH.call(this, __);
      }
    }

    function transitionBarsV (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h() - __.yScale(d[1]); });
    }

    function transitionTimeBarsV (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.bar_width / 2;
        })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h() - __.yScale(d[1]); });
    }

    function transitionBarsH (__) {
      return this.delay(__.delay)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("x", __.barOffSet)
        .attr("width", function(d) { 
          return __.xScale(d[1]) + __.barOffSet; 
        });
    }

    function transitionBars (orientation, __) {
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return transitionBarsV.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return transitionTimeBarsV.call(this, __);
      } else {
        return transitionBarsH.call(this, __);
      }
    }

    return function (orientation, __) {
      this.createBars = createBars;
      this.transitionBars = transitionBars;
      return this;
    };

});

