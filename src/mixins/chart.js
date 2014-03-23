define('mixins/chart', [
  "d3"
], function (d3) {

  function setChart (chart_class) {

    //console.log(selection[0].tagName.toLowerCase())
    var self = this,
        __   = self.__;

    // Select the svg element, if it exists.
    self.svg = self.selection.selectAll("svg").data([__.data]);
    // Otherwise, create the skeletal chart.
    self.gEnter = self.svg.enter().append("svg")
      .append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      self.tip = self.tip( __.tooltip );
      self.gEnter.call(self.tip);
    }
   
    self.gEnter.append("g").attr("class", chart_class);
    //TODO: we need to handle bar offsets and others?

    __.overlapping_charts.names.forEach( function (chart_name) {
      self.gEnter.append("g").attr("class", chart_name);
    });

    self.gEnter.append("g").attr("class", "x axis");
    self.gEnter.append("g").attr("class", "y axis")
     .attr("transform", "translate(-" + (__.y_axis_offset) + ",0)");
     
    // Update the outer dimensions.
    self.svg.attr("width", __.width)
      .attr("height", __.height);

    // Update the inner dimensions.
    self.g = self.svg.select("g")
      .attr("transform", "translate(" + 
      __.margin.left + "," + __.margin.top + ")");

    // Transitions root.
    self.transition = self.g.transition().duration(__.duration);

    // Update the y axis.
    self.transitionAxis.call(
      self.transition.selectAll('.y.axis'), 'y', __);

    // Update the x axis.
    self.transitionAxis.call(
      this.transition.selectAll('.x.axis'), 'x', __);

    return self;
  };

  return function () {
    this.setChart = setChart;
    return this;
  };

});

