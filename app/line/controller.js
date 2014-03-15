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
      data_points,
      draw;

    d3.json(args.data_url, function (err, data) {

      var parse = d3.time.format("%b, %Y").parse;
      var formatted_data = [];
      
      data.temperature.forEach( function (t, index) {
        var m = d3.max( t, function(d) {return parseFloat(d); } );
        formatted_data.push(
          data.month.map( function (m, i) {
            return [m, data.temperature[index][i]];
          })
        )
      });

      var fd = [ formatted_data[1].map(function(d) {
        return [d[0]+', 2012', d[1]] }) ];

      
      var tooltip_format = d3.time.format("%b, %Y");
      var tooltip_conf = {
        html: function (d, i) {
          return '<b>Date:</b> ' 
            + tooltip_format(d[0]) + ' <br> <b>Temperature:</b> ' + d[1] + ' C';
        },
        offset: [-12, 0]  // [top, left]
      }

      linechart = chart.Line()
        .y_axis_offset(6)
        .duration(0)
        .date_format('%b, %Y')
        .overlapping_charts({ 
          names: ['circles'],
          options: { circles: { tooltip: tooltip_conf } }
        })
        .x_axis({tickFormat: d3.time.format("%b")});
      chart.draw(linechart, selection, fd);

    });

  };

  return lineController;
  
});