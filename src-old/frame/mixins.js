define('frame/mixins', [
  "d3"
], function (d3) {

  function generateDataBlocks () {
    var __ = this.__;
    var data_by_identifier = {};
    __.data.forEach(function (d) {
      var identifier = d[__.frame_identifier], 
          g = data_by_identifier[identifier];
      if (g) {
        g.push(d);
      } else {
        data_by_identifier[identifier] = [d];
      }
    });

    return data_by_identifier;
  }

  // TODO: not handling multiple data block groups!!!
  // example: tokio and ny and cairo
  function generateDataBlocksSeq () {
    var self = this,
        __ = this.__,
        data_blocks = this.data_blocks || this.generateDataBlocks(),
        data_blocks_seq = [];

    for (var identifier in data_blocks) {
      if( data_blocks.hasOwnProperty( identifier ) ) {
        var block = data_blocks[identifier],
            prev_block_arr;
        if (data_blocks_seq.length > 0) {
          prev_block_arr = data_blocks_seq.slice(-1)[0];
          current_block_arr = block;
          new_block_arr = prev_block_arr.concat(current_block_arr);
          data_blocks_seq.push(new_block_arr);
        } else {
          data_blocks_seq.push(block);
        };
        // TODO: danger zone, it expects data_block objects to be sorted and
        // it is doing sloppy coercions (ie: '1995' == 1995)
        if (identifier == self.frame) {
          data_blocks_seq.shift(); // first block can not create a line.
          return data_blocks_seq;
        }
      } 
    }
    
  }

  function parseData () {
    var frame_type = this.frame_type(),
        frame = this.frame,
        data_blocks_seq_obj = {};
    if (frame_type == 'block') {
      return this.generateDataBlocks();
    } else if (frame_type == 'sequence') {
      data_blocks_seq_obj[frame] = this.generateDataBlocksSeq();
      return data_blocks_seq_obj;
    } else {
      throw new Error('Wrong frame type, must be one of: block, sequence');
    }
  }

  return function () {
    this.generateDataBlocks = generateDataBlocks;
    this.generateDataBlocksSeq = generateDataBlocksSeq;
    this.parseData = parseData;
    return this;
  };

});