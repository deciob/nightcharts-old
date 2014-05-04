define([
  'chai', 'd3', 'utils', 'data'], 
function(chai, d3, utils, data_module) {

  var assert = chai.assert;


  describe('getMinMaxValues', function() {

    var data  = [ [27, 21], [36, 71], [12, 322] ];

    it('should return the smaller and biggest values from the data input', function() {
      var min_max,
          data_parser = data_module['simpleDataParser'];

      min_max = utils.getMinMaxValues(data, data_parser);
      assert.equal(min_max.min, 21, 
        'Expected min value to equal 21');
      assert.equal(min_max.max, 322, 
        'Expected max value to equal 322');
    });

  });

});