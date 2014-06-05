define([
  'chai', 'd3', 'utils', 'scale'], 
function(chai, d3, utils, scale) {

  describe('scale', function() {

    var assert = chai.assert;

    describe('_getDomain', function() {
      it('should return the input domain for the data (min, max)', function() {
        var data  = [ [['a', 21], ['b', 71], ['d', 322]], ],
            domain,
            __ = { data_parser: 'groupedDataParser'};
        domain = scale._getDomain(data, 'y', __);
        assert.equal(domain[0], 21);
    
      });
    });
  
    describe('setScales', function() {
  
      it('should return a d3.scale pair such as [ordinal, linear]', function() {
        var context = utils,
            __    = {
              x_scale: 'ordinal',
              y_scale: 'linear',
            };

        __ = scale.setScales(__);

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

    describe('applyScales', function() {
  
      it('should set full ordinal and linear scales', function() {
        var data  = [ [['a', 21], ['b', 71], ['d', 322]], ],
            __    = {
              x_scale: 'ordinal',
              y_scale: 'linear',
              scale_bounds: '0,max',
              h: 322,
              w: 100,
              padding: .1,
              data: data,
              data_parser: 'groupedDataParser',
            };

        __.xValueN = function (d) { return d[0]; };
        __.yValueN = function (d) { return d[1]; };
        __ = scale.setScales(__);
        scale.applyScales(__);

        assert.isFunction(__.xScale, 'Expected __.xScale to be a function');
        assert.isFunction(__.yScale, 'Expected __.yScale to be a function');
        assert.isTrue(__.xScale('a') < __.xScale('b'), 
          'Expected xScale of "a" to be smaller than xScale of "b"');
        assert.isTrue(__.yScale(322) < 0.0001, 
          'Expected yScale of max to be almost 0');
      });

      it('should set full ordinal and time scales', function() {
        var context = utils,
            data  = [ [['1995', 21], ['1996', 71], ['1997', 322]], ],
            __    = {
              x_scale: 'time',
              y_scale: 'linear',
              scale_bounds: '0,max',
              h: 322,
              w: 100,
              padding: .1,
              date_type: 'string',
              date_format: '%Y',
              data: data,
              data_parser: 'groupedDataParser'
            };

        __ = scale.setScales(__);
        scale.applyScales(__);

        assert.isFunction(__.xScale, 'Expected __.xScale to be a function');
        assert.isFunction(__.yScale, 'Expected __.yScale to be a function');
        assert.isNumber(__.xScale('1995'), 
          'Expected __.xScale of string "1995" to be a number');
        assert.isTrue(__.xScale('1995') < __.xScale('1996'), 
          'Expected xScale of "a" to be smaller than xScale of "b"');
      });
  
    });

  });

});