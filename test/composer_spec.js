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


});