define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var lineFrameController = function (args) {

    var selection = d3.select(args.selector),
        data = args.data,
        normalized_data,
        grouped_data,
        linechart,
        draw;

    linechart = chart.composer()
      .margin({bottom: 35})
      .xValue(function(d) {return d.year})
      .yValue(function(d) {return d.population})
      .zValue(function(d) {return d.agglomeration})
      .duration(1000)
      .height(400)
      .date_format('%Y')
      .x_scale('time')
      .components(['x_axis', 'y_axis', 'lines'])
      .x_axis({tickFormat: d3.time.format("%Y")})
      .lines({class_name: 'linechart'});
    normalized_data = chart.utils.normalizeData(data, linechart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, linechart.__, {grouper: 'array'});
    chart.draw(linechart, selection, grouped_data);

    function test() {
      console.log('sssssssssss');
    }

  };

  return lineFrameController;
  
});