define('components/line', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

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
    return d[0];
  }

  function transitionLine (d, __) {

    var self = this,
        start_line = this.select('.line.start'),
        end_line = this.select('.line.end'),
        start_line_path, 
        end_line_path;

    end_line_path = end_line.selectAll(".line.end.path")
      .data([d], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    end_line_path.exit().transition().remove();
  
    end_line_path.enter().append("path")
      .attr("class", "line end path")
      .attr("d", function (d) {
        return line(__)(d);})    
      .transition()
      .delay(__.delay)
      .duration(__.duration)
      .attrTween("stroke-dasharray", tweenDash)
      .call(utils.endall, [d], __.handleTransitionEnd);
      //.each("end", function() { 
      //  self.endall.call(this, data, __.handleTransitionEnd); 
      //});
  
  }

  function setLines (selection, __, data, old_frame_identifier) {
    //TODO: this is utils!!!
    var lines = selection.selectAll(".line")
          // data is an array, each element one line.
          .data([data], dataIdentifier),
        line_g, 
        line_g_start, 
        line_g_end,
        ov_options = __.overlapping_charts.options,
        ov_line_options = ov_options ? ov_options.lines : void 0;
  
    // Exit phase (let us push out old lines before the new ones come in).
    lines.exit()
      .transition().duration(__.duration).style('opacity', 0).remove();

    // this should end the line or line segment (depends from the data),
    // if the data only represents a fraction of the line then the charting
    // function needs to be called again.
    line_g = lines.enter().append("g")
      .attr("class", "line");
    line_g.append('g')
      .attr("class", "line start");
    line_g.append('g')
      .attr("class", "line end");
    line_g.each(function (d, i) { 
        //console.log('lines.enter().append("g")', d);
        return transitionLine.call(selection, d, __) });

    return this;
  }

  function drawLines (selection, transition, __, old_frame_identifier) {
    var has_timescale = __.x_scale == 'time',
        g = selection.selectAll('g.lines').data(__.data);

    g.exit().remove();
    g.enter().append('g').attr('class', 'lines');

    g.each(function(data, i) {
      setLines(d3.select(this), __, data, old_frame_identifier);
      //var lines = this.selectAll(".line").data(data, __.dataIdentifier);
    });


    //__.data.forEach( function (data, i) {
    //  var g = selection.append("g").attr("class", ".lines");
    //  setLines(g, transition, __, old_frame_identifier);
    //});
  }

  return {
    drawLines: drawLines,
  };

});

