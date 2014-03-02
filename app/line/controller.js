define([
  'when',
  'd3',
  'underscore',
  'chart',
], function(when, d3, _, chart) {
  'use strict';

  var lineController = function (args) {
    var selection = d3.select(args.selector),
      linechart,
      draw;

    d3.json(args.data_url, function (err, data) {

      var parse = d3.time.format("%b, %Y").parse;
      var formatted_data = []
      var max = 0;
      
      data.temperature.forEach( function (t, index) {
        var m = d3.max( t, function(d) {return parseFloat(d); } );
        if (m > max) { max = m; }
        formatted_data.push(
          data.month.map( function (m, i) {
            return [m, data.temperature[index][i]];
          })
        )
      });

      linechart = chart.line()
        .margin({left: 80, right: 70, bottom: 25})
        .width(600)
        .height(200)
        .duration(0)
        .barOffSet(140)
        //.parseDate(parse)
        .max(max);
        //.x_axis({tickFormat: d3.time.format("%b")});
      chart.draw(linechart, selection, formatted_data);
    });

  };

  return lineController;
  
});