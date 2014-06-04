define([
  'd3',
  'underscore',
  'chart'
], function(d3, _, chart) {
  'use strict';

  var barFrameController = function (args) {

    console.log(chart);
    var selection = d3.select(args.selector),
        data = args.data,
        normalized_data,
        grouped_data,
        barchart,
        draw;

    barchart = chart.composer()
      .margin({left: 150, bottom: 35})
      .height(600)
      .duration(200)
      .yValue( function(d) { return d['agglomeration']; } )
      .xValue( function(d) { return d['population']; } )
      .zValue(function(d) {return d.year})
      .components(['x_axis', 'y_axis', 'bars'])
      .scale_bounds('0,40')
      .invert_data(true)
      .y_scale('ordinal')
      .x_scale('linear');
      //.drawDispatch(d3.dispatch('draw_bar'));
    normalized_data = chart.utils.normalizeData(data, barchart.__);
    grouped_data = chart.utils.groupNormalizedDataByIndex(
      2, normalized_data, barchart.__, {grouper: 'object'});
    //console.log(grouped_data);
    draw = chart.draw(barchart, selection, [grouped_data[1950]]);

  };

  return barFrameController;
  
});