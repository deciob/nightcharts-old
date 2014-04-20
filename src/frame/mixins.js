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

  function generateDataBlocksSeq () {
    var self = this,
        __ = this.__,
        data_blocks = this.data_blocks || this.generateDataBlocks(),
        data_blocks_seq = [[]];

    for (var identifier in data_blocks) {
      if( data_blocks.hasOwnProperty( identifier ) ) {
        var block = data_blocks[identifier],
            tmp = data_blocks_seq[data_blocks_seq.length - 1].concat([block]);
        data_blocks_seq.push(tmp);
        // TODO: danger zone, it expects data_block objects to be sorted and
        // it is doing sloppy coercions (ie: '1995' == 1995)
        if (identifier == self.frame) {
          data_blocks_seq.shift();
          return data_blocks_seq;
        }
      } 
    }
    
  }

  function parseData () {
    var frame_type = this.frame_type();
    if (frame_type == 'block') {
      return this.generateDataBlocks();
    } else if (frame_type == 'sequence') {
      return this.generateDataBlocksSeq();
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