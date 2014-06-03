define('components/bar', [
  "d3",
  'utils', 
], function (d3, utils) {
  'use strict';

  var getIndexFromIdentifier = utils.getIndexFromIdentifier,
      lines_length = 0,
      handleTransitionEndBind;


  function dataIdentifier (d) {
    //console.log('dataIdentifier', d[1]);
    return d[1];
  }

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
      .attr("y", __.h)
      .attr("height", 0);
  }

  function _createTimeBars (__) {
    return this.append("rect")
      .attr("class", "bar")
      .attr("x", function(d) {
        return __.xScale(d[0]) - __.bar_width / 2;
      })
      .attr("width", __.bar_width)
      //attention TODO: this gets then overridden by the transition
      .attr("y", __.h) 
      .attr("height", 0);
  }

  function _createHorizontalBars (__) {
    return this.append("rect")
      .attr("class", "bar")
      .attr("width", 0)
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
      .attr("x", function(d) { return __.xScale(d[1]) + __.offset_x; })
      .attr("y", function(d) { return __.yScale(d[0]) - __.offset_y; })
      .attr("height", function(d) { return __.h - __.yScale(d[0]); });
  }

  function _transitionTimeBars (__) {
    return this.delay(__.delay)
      .attr("x", function(d) { 
        return __.xScale(d[0]) + __.offset_x - __.bar_width / 2;
      })
      .attr("y", function(d) { return __.yScale(d[1]) - __.offset_y; })
      .attr("height", function(d) { return __.h - __.yScale(d[1]); });
  }

  function _transitionHorizontalBars (__) {
    return this.delay(__.delay)
      .attr("y", function(d) { 
        return __.yScale(d[1]) - __.offset_y; })
      .attr("x", __.offset_x)
      .attr("width", function(d) { 
        return __.xScale(d[0]) + __.offset_x; 
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

  function setBars (selection, transition, __, data) {
    //console.log('-----------------------------------');
    //console.log(data, __.old_frame_identifier);
    data.forEach( function (data, i) {
      var bar = selection.selectAll(".bar")
            .data(data, dataIdentifier),
          ov_options = __.overlapping_charts.options,
          ov_bar_options = ov_options ? ov_options.bars : void 0;
      // Exit phase (pushes out old bars before new ones come in).
      bar.exit()
        .transition().duration(__.duration).style('opacity', 0).remove();
      createBars.call(bar.enter(), __)
        .on('click', __.handleClick);
  
      // And transition them.
      transitionBars
        .call(transition.selectAll('.bar'), __.orientation, __)
        .call(utils.endall, data, __.handleTransitionEnd);
    });
  }

  function drawBars (selection, transition, __, data) {
    var g,
        has_timescale = __.x_scale == 'time';
        //selection = d3.select('svg > g'),
        //transition = selection.transition().duration(__.duration);

    if (__.bars.class_name != '') {
      g = selection.selectAll('g.bars.' + __.bars.class_name).data([data]);
    } else {
      g = selection.selectAll('g.bars').data([data]);
    }

    g.exit().remove();
    g.enter().append('g').attr('class', 'bars ' + __.bars.class_name);

    g.each(function(data, i) {
      setBars(d3.select(this), transition, __, data);
    });

  }

  return {
    drawBars: drawBars,
  };

});

