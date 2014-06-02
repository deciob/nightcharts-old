define('components/line', [
  "d3",
  'utils', 
  'data'
], function (d3, utils, data_utils) {
  'use strict';

  var getIndexFromIdentifier = data_utils.getIndexFromIdentifier,
      lines_length = 0,
      handleTransitionEndBind;

  function line (__) {
    return d3.svg.line().x(function(d, i) {
      return __.xScale(d[0]);
    }).y(function(d, i) {
      return __.yScale(d[1]);
    });
  }

  function tweenDash() {
    var l = this.getTotalLength(),
        i = d3.interpolateString("0," + l, l + "," + l);
    return function(t) { 
      return i(t); };
  }

  function dataIdentifier (d) {
    //console.log('dataIdentifier', d[0]);
    return d;
  }

  function handleTransitionEnd (__, d) {
    lines_length -= 1;
    if (lines_length === 0) {
      __.handleTransitionEnd.apply(this, [d]);
    }
  }

  function transitionLH (d, __, options) {
    var self = this,
        line_head = this.select('.line.head'),
        line_head_path;

    line_head_path = line_head.selectAll(".line.head.path")
      .data([d], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    line_head_path.exit().transition().remove();
  
    line_head_path.enter().append("path")
      .attr("class", "line head path")
      .attr("d", function (d) {
        return line(__)(d);})    
      .transition()
      .delay(options.delay)
      .duration(options.duration)
      .attrTween("stroke-dasharray", tweenDash)
      .call(utils.endall, [d], handleTransitionEndBind);
  }

  function transitionLB (d, __, options) {
    var self = this,
        line_body = this.select('.line.body'),
        line_body_path;

    line_body_path = line_body.selectAll(".line.body.path")
      .data([d], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    line_body_path.exit().transition().remove();
  
    line_body_path.enter().append("path")
      .attr("class", "line body path")
      .attr("d", function (d) {
        return line(__)(d);})    
      .transition()
      .delay(options.delay)
      .duration(options.duration)
      .attrTween("stroke-dasharray", tweenDash)
      //.call(utils.endall, [d], handleTransitionEndBind);
  }

  function transitionL (d, __) {
    var index, head_d, body_d;
    if (__.old_frame_identifier) {
      index = getIndexFromIdentifier(__.old_frame_identifier, d, __.frameIdentifierKeyFunction);
      body_d = d.slice(0, index+1);
      head_d = d.slice(index);
      transitionLH.call(this, head_d, __, {delay: __.delay, duration: __.duration});
      transitionLB.call(this, body_d, __, {delay: __.delay, duration: 0});
    } else {
      transitionLH.call(this, d, __, {delay: __.delay, duration: __.duration});
    }
  }

  function setLines (selection, transition, __, data) {
    //console.log('-----------------------------------');
    //console.log(data, __.old_frame_identifier);
    //TODO: this is utils!!!
    var line = selection.selectAll(".line")
          // data is an array, each element one line.
          .data(data, dataIdentifier),
        line_g, 
        line_g_start, 
        line_g_end,
        ov_options = __.overlapping_charts.options,
        ov_line_options = ov_options ? ov_options.lines : void 0;
  
    // Exit phase (let us push out old line before the new ones come in).
    line.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // this should end the line or line segment (depends from the data),
    // if the data only represents a fraction of the line then the charting
    // function needs to be called again.
    line_g = line.enter().append("g")
      .attr("class", "line");
    line_g.append('g')
      .attr("class", "line body");
    line_g.append('g')
      .attr("class", "line head");
    lines_length = line_g[0].length;
    config = __;
    line_g.each(function (d, i) { 
      //console.log('line_g.each', d);
      //console.log('lines.enter().append("g")', d);
      return transitionL.call(d3.select(this), d, __) });

    return this;
  }

  function drawLines (selection, transition, __, data) {
    var has_timescale = __.x_scale == 'time',
        g;

    handleTransitionEndBind = handleTransitionEnd.bind(undefined, __);

    if (__.lines.class_name != '') {
      g = selection.selectAll('g.lines.' + __.lines.class_name).data([__.data]);
    } else {
      g = selection.selectAll('g.lines').data([__.data]);
    }

    g.exit().remove();
    g.enter().append('g').attr('class', 'lines ' + __.lines.class_name);

    g.each(function(data, i) {
      setLines(d3.select(this), transition, __, data);
    });

  }

  return {
    drawLines: drawLines,
  };

});

