define([
  'when',
  'd3',
  'underscore',
  'chart',
], function(when, d3, _, chart) {
  'use strict';

  var timeseriesController = function (args) {
    var selection = d3.select(args.selector),
      barchart,
      draw;

    d3.json(args.data_url, function (err, data) {

      var parse = d3.time.format("%b, %Y").parse;
      
      data = data.month.map( function(month, index) {
        var t = data.temperature[index];
        return [month + ', ' + data.year, t];
      });

      barchart = chart.Bar()
        //.margin({left: 50, bottom: 25})
        .offset_x(35)
        .duration(0)
        .x_scale('time')
        .date_type('string') // or 'epoc'
        .date_format("%b, %Y")
        .x_axis({tickFormat: d3.time.format("%b")});
      chart.draw(barchart, selection, [data]);
    });

  };

  return timeseriesController;
  
});