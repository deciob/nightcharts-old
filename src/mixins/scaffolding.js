define('mixins/scaffolding', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function axisScaffolding (data, __) {
    // Scales are functions that map from an input domain to an output range.
    this.xScale = this.setScale(__.x_scale)();
    this.yScale = this.setScale(__.y_scale)();

    // Axes, see: [SVG-Axes](https://github.com/mbostock/d3/wiki/SVG-Axes).
    this.xAxis = this.setAxisProps(__.x_axis, this.xScale);
    this.yAxis = this.setAxisProps(__.y_axis, this.yScale);

    utils.extend(
      this.__, 
      {
        data: data,
        //x_axis_data: data[0], // FIXME this hack!
        yScale: this.yScale,
        xScale: this.xScale,
        xAxis: this.xAxis,
        yAxis: this.yAxis,
        delay: this.delay,
        w: this.w(),
        h: this.h(),
      }, 
      false
    );

    this.applyScale.call( this.xScale, 'x', __.x_scale, __ );
    this.applyScale.call( this.yScale, 'y', __.y_scale, __ );

    return this;
  }

  function chartScaffolding (selection, __, chart_class) {

    //console.log(selection[0].tagName.toLowerCase())
    var self = this;

    // Select the svg element, if it exists.
    //this.gWrapper = selection.selectAll("g." + chart_class + '_wrapper')
    this.svg = selection.selectAll("svg").data([this.__.data]);
    // Otherwise, create the skeletal chart.
    this.gEnter = this.svg.enter().append("svg")
      //.attr('class', chart_class + '_wrapper')
      .append("g");
    // Initializing the tooltip.
    if ( __.tooltip ) {
      this.tip = utils.tip( __.tooltip );
      this.gEnter.call(this.tip);
    }

    this.gEnter.append("g").attr("class", chart_class);

    __.overlapping_charts.forEach( function (chart_name) {
      self.gEnter.append("g").attr("class", chart_name);
    });

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

    return this;
  };
      
  return function () {
    this.axisScaffolding = axisScaffolding;
    this.chartScaffolding = chartScaffolding;
    return this;
  };

});

