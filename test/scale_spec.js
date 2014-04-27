define([
  'chai', 'd3', 'utils', 'scale'], 
function(chai, d3, utils, scale) {

  describe('scale', function() {

    var assert = chai.assert;
  
    describe('setScales', function() {
  
      it('should return a d3.scale pair such as [ordinal, linear]', function() {
        var context = utils,
            __    = {
              x_scale: 'ordinal',
              y_scale: 'linear',
            };

        __ = scale.setScales.call(utils, __);

        assert.isFunction(__.xScale, 'Expected __.xScale to be a function');

        assert.isFunction(__.yScale, 'Expected __.yScale to be a function');

        assert.isUndefined(__.xScale(10), 
          'Expected a call to __.xScale to always return undefined \
           (until an output range is specified)' );

        assert.equal(__.yScale(10), 10, 
          'Expected the default linear scale to be equivalent to the \
           identity function for numbers');
        
      });
  
    });

  });

});