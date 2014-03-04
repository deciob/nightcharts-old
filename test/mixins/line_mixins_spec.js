define([
  'chai', 
  'd3',
  'base_config',
  'utils/utils',
  'mixins/line_mixins'
], function(chai, d3, base_config, utils, line_mixins) {

  var assert = chai.assert;

  var line_mixins = line_mixins(),
      data_string = [ [['MAR, 12', 21], ['APR, 17', 71], ['OCT, 24', 322]] ],
      data_epoch = [ [[1305376000, 56], [1315376000, 26], [1325376000, 66]] ];

  after( function() {

  });
  
  describe('mixins/line_mixins', function(){
    
    it('parsed_data should contain time objects', function(){
      var __ = utils.extend(base_config, {
        date_chart: true, 
        date_type: 'string',
        date_format: '%b, %e'
      });
      var parsed_data = line_mixins.normalizeData(data_string, __);
      assert.isTrue( parsed_data[0][2][0].getMonth() == 9 );
    });

    it('parsed_data should contain time objects part 2', function(){
      var __ = utils.extend(base_config, {
        date_chart: true, 
        date_type: 'epoch'
      });
      var parsed_data = line_mixins.normalizeData(data_epoch, __);
      assert.isFunction( parsed_data[0][2][0].getYear );
    });

  });

});