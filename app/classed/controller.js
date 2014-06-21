define([
  'd3'
], function(d3) {
  'use strict';

  var ClassedController = function(args) {
    this.config = args.config;
    this.colours = args.colours;
    this.cities = [];//d3.map({});
  };

  ClassedController.prototype.updateCities = function(args) {
    var city = args.city,
        existing_city_idx = this.cities.indexOf(city);
    if (existing_city_idx !== -1) {
      this.cities.splice(existing_city_idx, 1);
    } else {
      this.cities.push(city);
    }
    if (this.cities.length > 2) {
      this.cities.shift();
    }
    return {cities: this.cities, warning: args.warning};
  }

  ClassedController.prototype.resetCities = function(city) {
    this.cities = [];
  }

  return ClassedController;

});