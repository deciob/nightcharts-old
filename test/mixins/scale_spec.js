define([
  'chai', 'd3', 'utils/mixins', 'mixins/scale'], 
function(chai, d3, utils_mixins, scale_mixins) {

  var assert = chai.assert;


  describe('mixins.scale._applyLinearScale', function() {

    var utils = utils_mixins(),
        data  = [ [['a', 21], ['b', 71], ['d', 322]], ],
        __    = {
          data: data
        },
        range = [0, 500],
        _applyLinearScale = scale_mixins()._applyLinearScale;

    it('should set the domain to 0 - max_data', function() {
      __.xScale = d3.scale.linear();
      __.scale_bounds = false;
      var s = _applyLinearScale.call(__.xScale, range, __);
      assert.equal(s(0), 0, 
        'Expected scale(0) to be 0');
      assert.isTrue(s(323) > 322, 
        'Expected scale(max_data + 1) to be bigger than max_data');
    });

    it('should set the domain to min_data - max_data', function() {
      __.xScale = d3.scale.linear();
      __.scale_bounds = true;
      var s = _applyLinearScale.call(__.xScale, range, __);
      assert.isTrue(s(0) < 0, 
        'Expected scale(0) to be smaller than 0');
      assert.isTrue(s(323) > 322, 
        'Expected scale(max_data + 1) to be bigger than max_data');
    });

  });

});