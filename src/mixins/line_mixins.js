define('mixins/line_mixins',["d3", "utils/utils"], function(d3, utils) {

  function line (params) {
    return d3.svg.line().x(function(d) {
        return params.xScale(d[0]);
      }).y(function(d) {
        return params.yScale(d[1]);
      });
  }

  function createLines (params) {
    return this.append("path")
      .attr("class", "line")
      .attr("d", line(params) );
  }

  function transitionLines (params) {
    
  }

  return function (orientation, params) {
    this.createLines = createLines;
    this.transitionLines = transitionLines;
    return this;
  };
  
});

