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
        return [month + ', ' + data.year, data.temperature[index]];
      });

      barchart = chart.bar()
        .margin({left: 80, right: 70, bottom: 25})
        .width(600)
        .height(200)
        .duration(0)
        .barOffSet(140)
        .parseDate(parse)
        .x_axis({tickFormat: d3.time.format("%b")});
      chart.draw(barchart, selection, data);
    });

  };

  return timeseriesController;
  
});