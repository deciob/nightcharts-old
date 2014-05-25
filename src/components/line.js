define('components/line', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

  function line (__) {
    return d3.svg.line().x(function(d, i) {
      //if(1950 === d[0].getFullYear() && d[2]==='São Paulo') {
      //  debugger;
      //}
      //console.log(d[0], __.xScale(d[0]));
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
    //console.log('dataIdentifier', d[0][0]);
    return d[0];
  }

  function transitionLine (d, __) {

    var self = this,
        line_body = this.select('.line.body'),
        line_head = this.select('.line.head'),
        line_body_path, 
        line_head_path;

    line_head_path = line_head.selectAll(".line.head.path")
      .data([d], function(d) {
        //console.log(d[0], '@@');
        return d.length;});

    line_head_path.exit().transition().remove();
  
    line_head_path.enter().append("path")
      .attr("class", "line head path")
      .attr("d", function (d) {
        //console.log(JSON.stringify(d));
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
    //console.log('-----------------------------------');
    //console.log(data);
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
    line_g.each(function (d, i) { 
        //console.log('lines.enter().append("g")', d);
        return transitionLine.call(d3.select(this), d, __) });

    return this;
  }

  function drawLines (selection, transition, __, old_frame_identifier) {
    console.log(__.data, 'xxx');
    var has_timescale = __.x_scale == 'time',
        g; 

    if (__.lines.class_name != '') {
      g = selection.selectAll('g.lines.' + __.lines.class_name).data([__.data]);
    } else {
      g = selection.selectAll('g.lines').data([__.data]);
    }

    g.exit().remove();
    g.enter().append('g').attr('class', 'lines ' + __.lines.class_name);

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

