define('bar/mixins',["d3"], function(d3) {

    function _getBarOrientation (__) {
      if ( (__.x_scale == 'ordinal' || __.x_scale == 'time') &&
            __.y_scale == 'linear') {
        return 'vertical';
      } else if (__.x_scale == 'linear' && __.y_scale == 'ordinal') {
        return 'horizontal';
      } else {
        throw new Error('x_scale-y_scale wrong options combination');
      }
    }

    function _createVerticalBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("width", __.xScale.rangeBand())
        .attr("y", __.h + __.barOffSet)
        .attr("height", 0);
    }

    function _createTimeBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.bar_width / 2;
        })
        .attr("width", __.bar_width)
        //attention TODO: this get then overridden by the transition
        .attr("y", __.h + __.barOffSet) 
        .attr("height", 0);
    }

    function _createHorizontalBars (__) {
      return this.append("rect")
        .attr("class", "bar")
        .attr("x", __.barOffSet)
        .attr("width", 0)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("height", __.yScale.rangeBand());
    }

    function createBars (__) {
      var orientation = _getBarOrientation(__);
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return _createVerticalBars.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return _createTimeBars.call(this, __);
      } else if (orientation == 'horizontal') {
        return _createHorizontalBars.call(this, __);
      } else {
        throw new Error("orientation-x_scale wrong combination");
      }
    }

    function _transitionVerticalBars (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { return __.xScale(d[0]); })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function _transitionTimeBars (__) {
      return this.delay(__.delay)
        .attr("x", function(d) { 
          return __.xScale(d[0]) - __.bar_width / 2;
        })
        .attr("y", function(d) { return __.yScale(d[1]); })
        .attr("height", function(d) { return __.h - __.yScale(d[1]); });
    }

    function _transitionHorizontalBars (__) {
      return this.delay(__.delay)
        .attr("y", function(d) { return __.yScale(d[0]); })
        .attr("x", __.barOffSet)
        .attr("width", function(d) { 
          return __.xScale(d[1]) + __.barOffSet; 
        });
    }

    function transitionBars (orientation, __) {
      var orientation = _getBarOrientation(__);
      if (orientation == 'vertical' && __.x_scale !== 'time') {
        return _transitionVerticalBars.call(this, __);
      } else if (orientation == 'vertical' && __.x_scale == 'time') {
        return _transitionTimeBars.call(this, __);
      } else if (orientation == 'horizontal') {
        return _transitionHorizontalBars.call(this, __);
      } else {
        throw new Error("orientation-x_scale wrong combination");
      }
    }

    function setBars () {
      var self = this,
          __ = this.__;

      __.data.forEach( function (data, i) {
        var bars = self.g.selectAll(".bar")
              .data(data, self.dataIdentifier),
            ov_options = __.overlapping_charts.options,
            ov_bar_options = ov_options ? ov_options.bars : void 0;
  
        // Exit phase (pushes out old bars before new ones come in).
        bars.exit()
          .transition().duration(__.duration).style('opacity', 0).remove();
  
        self.createBars.call(bars.enter(), __)
          .on('click', __.handleClick);
    
        // And transition them.
        self.transitionBars
          .call(self.transition.selectAll('.bar'), __.orientation, __)
          .call(self.endall, data, __.handleTransitionEnd);
    
        if (__.tooltip) {
          bars
           .on('mouseover', self.tip.show)
           .on('mouseout', self.tip.hide);
        }
      });

    }

    return function (orientation, __) {
      this.setBars = setBars;
      this.transitionBars = transitionBars;
      this.createBars = createBars;
      return this;
    };

});

