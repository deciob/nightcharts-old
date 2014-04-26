define([
  'chai', 
  'd3', 
  'composer'
], function (chai, d3, composer) {

  var assert = chai.assert;

  describe('composer', function() {
    var chart = composer();
    it('should return a function', function() {
      assert.isFunction(chart, 'Expected chart to be a function');
    });

    it('should return a get/setter function', function() {
      chart.width(200);
      assert.equal(chart.width(), 200, 'Expected chart width to equal 200');
    });    

  });

  describe('clone', function() {
    it('should be a property of composer', function() {
      assert.isFunction(composer.clone, 
        'Expected composer.clone to be a function');
    });

  });

});