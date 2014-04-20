define([
  'chai', 'd3', 'data', 'utils/mixins', 'mixins/data'], 
function(chai, d3, data, utils_mixins, data_mixins) {

  var assert = chai.assert;


  describe('mixins.data.normalizeData', function() {

    var utils = data_mixins(),
        data  = [ [['a', 21], ['b', 71], ['d', 322]], ],
        __    = {
          data: data,
          categoricalValue: function (d) { return d[0]; },
          quantativeValue: function (d) { return d[1]; },
        };

    it('should return an array of arrays such as [ordinal, quantitative]', function() {
      var selection = d3.select('body'),
          context = {},
          normalized_data;
      selection.datum(data);
      __.x_scale = 'ordinal';
      context.__ = __;
      context.selection = selection;

      normalized_data = data_mixins().normalizeData.call(context);
      assert.equal(__.data[0][0][0], 'a', 
        'Expected input data, exit data to be the same');
      assert.equal(__.data[0][1][1], 71, 
        'Expected input data, exit data to be the same');
    });

    it('should return an array of arrays such as [ordinal, quantitative], but inverted', function() {
      var selection = d3.select('body'),
          context = {},
          normalized_data;
      selection.datum(data);
      __.x_scale = 'ordinal';
      __.invert_data = true;
      context.__ = __;
      context.selection = selection;

      normalized_data = data_mixins().normalizeData.call(context);
      //console.log(normalized_data);
      assert.equal(__.data[0][0][0], 'd', 
        'Expected input data, exit data to have same structure but reversed order');
      assert.equal(__.data[0][0][1], 322, 
        'Expected input data, exit data to have same structure but reversed order');
    });

    it('should return an array of arrays such as [time, quantitative]', function() {
      var selection = d3.select('body'),
          context = {},
          normalized_data,
          data = [ [['1995', 21], ['1996', 71], ['1997', 322]], ];
      selection.datum(data);
      __.x_scale = 'time';
      __.date_type = 'string';
      __.date_format = '%Y';
      context.__ = __;
      context.selection = selection;

      normalized_data = data_mixins().normalizeData.call(context);
      assert.equal(__.data[0][0][0].getFullYear(), 1995, 
        'Expected exit data to be time object');
    });

    it('should return an array of arrays such as [time, quantitative]', function() {
      var selection = d3.select('body'),
          context = {},
          normalized_data,
          data = [ [[1305376000, 56], [1315376000, 26], [1325376000, 66]] ];
      selection.datum(data);
      __.x_scale = 'time';
      __.date_type = 'epoch';
      context.__ = __;
      context.selection = selection;

      normalized_data = data_mixins().normalizeData.call(context);
      assert.isTrue( __.data[0][1][0].getMonth() == 8,
        'Expected exit data to be time object, September');
    });

  });

});