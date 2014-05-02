define([
  'chai', 'd3', 'sample_data', 'utils', 'data'], 
function(chai, d3, data, utils, data_module) {

  var assert = chai.assert;


  describe('normalizeData', function() {

    var data  = [ [['a', 21], ['b', 71], ['d', 322]], ],
        __    = {
          xValue: function (d) { return d[0]; },
          yValue: function (d) { return d[1]; },
          data: data,
        };

    it('should return an array of arrays such as [ordinal, quantitative]', function() {
      var normalized_data;
      __.x_scale = 'ordinal';

      normalized_data = data_module.normalizeData(__);
      assert.equal(data[0][0][0], 'a', 
        'Expected input data, exit data to be the same');
      assert.equal(data[0][1][1], 71, 
        'Expected input data, exit data to be the same');
    });

    it('should return an array of arrays such as [ordinal, quantitative], but inverted', function() {
      var normalized_data;
      __.x_scale = 'ordinal';
      __.invert_data = true;

      normalized_data = data_module.normalizeData(__);
      assert.equal(normalized_data[0][0][0], 'd', 
        'Expected input data, exit data to have same structure but reversed order');
      assert.equal(normalized_data[0][0][1], 322, 
        'Expected input data, exit data to have same structure but reversed order');
    });

    it('should return an array of arrays such as [time, quantitative]', function() {
      var normalized_data,
          data = [ [['1995', 21], ['1996', 71], ['1997', 322]], ];
      __.x_scale = 'time';
      __.date_type = 'string';
      __.date_format = '%Y';
      __.data = data;

      normalized_data = data_module.normalizeData(__);
      assert.equal(normalized_data[0][0][0].getFullYear(), 1995, 
        'Expected exit data to be time object');
    });

    it('should return an array of arrays such as [time, quantitative]', function() {
      var normalized_data,
          data = [ [[1305376000, 56], [1315376000, 26], [1325376000, 66]] ];
      __.x_scale = 'time';
      __.date_type = 'epoch';
      __.data = data;

      normalized_data = data_module.normalizeData(__);
      assert.isTrue( normalized_data[0][1][0].getMonth() == 8,
        'Expected exit data to be time object, September');
    });

  });

});