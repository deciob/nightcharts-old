define([
  'when',
  'd3'
], function(when, d3) {
  'use strict';

  function accessor(d) {
    // csv headers:
    // year,rank,country,agglomeration,population
    return {
      year: +d.year,
      rank: d.rank,
      country: d.country,
      agglomeration: d.agglomeration,
      population: +d.population
    };
  }

  return when.promise(function(resolve, reject, notify) {
    d3.csv('app/data/data.csv', accessor , function(error, data) {
      resolve(data);
    });
  });

});


