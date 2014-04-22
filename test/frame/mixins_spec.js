define([
  'chai', 'data_array', 'd3', 'utils/mixins', 'frame/mixins'], 
function(chai, data, d3, utils_mixins, frame_mixins) {

  var assert = chai.assert;

  describe('mixins.generateDataBlocks', function() {

    var mixins = frame_mixins(),
        __    = {
          data: data,
          frame_identifier: 'year',
        };

    it('should return an object. The object keys are the frame_identifier', 
    function() {

      var data_blocks = mixins.generateDataBlocks.call({__: __});

      assert.isObject(data_blocks);
      assert.isArray(data_blocks[1955]);
      assert.equal(data_blocks[1955][0]['year'], 1955, 
        'Expected year to be 1955');
      assert.equal(data_blocks[1955][0]['agglomeration'], "Tokyo", 
        'Expected agglomeration to be "Tokyo"');
    });

  });

  describe('mixins.generateDataBlocksSeq', function() {

    var mixins = frame_mixins(),
        __    = {
          data: data.filter(function (d) {return d.agglomeration == 'Tokyo'}),
          frame_identifier: 'year'
        },
        data_blocks = mixins.generateDataBlocks.call({__: __});

    it('should return an array of growing data_blocks, up to current_frame', 
    function() {

      var data_blocks_seq = mixins.generateDataBlocksSeq.call(
        {__: __, frame: 1995, data_blocks: data_blocks});

      assert.isArray(data_blocks_seq);
      assert.isArray(data_blocks_seq[0]);
      assert.isObject(data_blocks_seq[0][0]);
      assert.strictEqual(data_blocks_seq[1].length, 3);
      assert.strictEqual(data_blocks_seq[1][0]['year'], 1950);
      assert.strictEqual(data_blocks_seq[1][1]['year'], 1955);
      
    });

  });

});