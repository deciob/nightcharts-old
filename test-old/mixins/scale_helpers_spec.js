define([
  'chai', 
  'd3',
  'base_config',
  'utils/utils',
  'mixins/scale_helpers'
], function(chai, d3, base_config, utils, scale_helpers) {

  var assert = chai.assert;

  var scale_helpers = scale_helpers(),
      data_string = [ [['MAR, 12', 21], ['APR, 17', 71], ['OCT, 24', 322]] ],
      data_epoch = [ [[1305376000, 56], [1315376000, 26], [1325376000, 66]] ];

  before( function() {
   
  });

  after( function() {

  });
  
  describe('#mixins/scale_helpers/_applyLinearScale', function(){
    
    it('should return a d3 linear scale with domain [0, data_max]', function(){
      var __ =  utils.extend( base_config, {
                  vertical: true,
                  data: data_string,
                  w: function () { return 200; },
                  h: function () { return 200; },
                }),
                scale = scale_helpers.setScale('linear')(),
                range_values = scale_helpers._getRange('x', __),
                applied_scale;
      applied_scale = scale_helpers._applyLinearScale.call(scale, range_values, __);
      assert.equal( applied_scale.domain()[0], 0 );
      assert.equal( applied_scale.domain()[1], 322 );
    });

    it('should return a d3 linear scale with domain [data_min, data_max]', function(){
      var __ =  utils.extend( base_config, {
                  vertical: true,
                  data: data_string,
                  w: function () { return 200; },
                  h: function () { return 200; },
                  force_scale_bounds: true
                }),
                scale = scale_helpers.setScale('linear')(),
                range_values = scale_helpers._getRange('x', __),
                applied_scale;
      applied_scale = scale_helpers._applyLinearScale.call(scale, range_values, __);
      assert.equal( applied_scale.domain()[0], 21 );
      assert.equal( applied_scale.domain()[1], 322 );
    });

    it('should return a d3 linear scale with arbitrary domain [5, 50]', function(){
      var __ =  utils.extend( base_config, {
                  vertical: true,
                  data: data_string,
                  w: function () { return 200; },
                  h: function () { return 200; },
                  force_scale_bounds: {min: 5, max: 50}
                }),
                scale = scale_helpers.setScale('linear')(),
                range_values = scale_helpers._getRange('x', __),
                applied_scale;
      applied_scale = scale_helpers._applyLinearScale.call(scale, range_values, __);
      assert.equal( applied_scale.domain()[0], 5 );
      assert.equal( applied_scale.domain()[1], 50 );
    });

    it('should return a d3 linear scale with arbitrary domain [5, data_max]', function(){
      var __ =  utils.extend( base_config, {
                  vertical: true,
                  data: data_string,
                  w: function () { return 200; },
                  h: function () { return 200; },
                  force_scale_bounds: {min: 5}
                }),
                scale = scale_helpers.setScale('linear')(),
                range_values = scale_helpers._getRange('x', __),
                applied_scale;
      applied_scale = scale_helpers._applyLinearScale.call(scale, range_values, __);
      assert.equal( applied_scale.domain()[0], 5 );
      assert.equal( applied_scale.domain()[1], 322 );
    });

  });

});