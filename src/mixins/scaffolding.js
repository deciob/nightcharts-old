define('mixins/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function chartScaffolding (selection, __, chart_class) {

    // Select the svg element, if it exists.
    this.svg = selection.selectAll("svg").data([this.data]);
    // Otherwise, create the skeletal chart.
    this.gEnter = this.svg.enter().append("svg").append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      this.tip = utils.tip( __.tooltip );
      this.gEnter.call(this.tip);
    }

    this.gEnter.append("g").attr("class", chart_class);
    this.gEnter.append("g").attr("class", "x axis");
    this.gEnter.append("g").attr("class", "y axis")
     .attr("transform", "translate(-" + (__.y_axis_offset) + ",0)");
     
    // Update the outer dimensions.
    this.svg.attr("width", __.width)
      .attr("height", __.height);

    // Update the inner dimensions.
    this.g = this.svg.select("g")
      .attr("transform", "translate(" + 
      __.margin.left + "," + __.margin.top + ")");

    // Transitions root.
    this.transition = this.g.transition().duration(__.duration);

    // Update the y axis.
    this.transitionAxis.call(
      this.transition.selectAll('.y.axis'), 'y', __);

    // Update the x axis.
    this.transitionAxis.call(
      this.transition.selectAll('.x.axis'), 'x', __);

    return this
  };
      
  return function () {
    this.chartScaffolding = chartScaffolding;
    return this;
  };

});