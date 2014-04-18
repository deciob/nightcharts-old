define([
  'when',
  'd3',
  'underscore',
  'chart',
], function(when, d3, _, chart) {
  'use strict';

  var inlineController = function (args) {
    var selection = d3.select(args.selector),
      barchart,
      draw;

    d3.json(args.data_url, function (err, data) {
      
      data = data.year.map( function(year, index) {
        var wp = data.world_urban_pop[index];
        return [year, wp];
      });



      barchart = chart.Bar()
        .margin({top: 0, right: 0, bottom: 0, left: 0})
        //.x_axis({ show: false })  // TODO: broken
        //.y_axis({ show: false })  // TODO: broken
        .width(100)
        .height(20)
        .padding(0)
        .duration(0);
      chart.draw(barchart, selection, [data]);
    });

  };

  return inlineController;
  
});