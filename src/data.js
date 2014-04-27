define('data', [
  "d3"
], function(
  d3
) {

  function dataIdentifier (d) {
    return d[0];
  }

  function setDelay (__, data) {
    var duration = __.duration;
    if (duration == undefined) { throw new Error('__.duration unset')}
    __.delay = function (d, i) {
      // FIXME: only referring to the first dataset, 
      // while setting the delay on all!
      return i / data[0].length * duration;
    }
    return __;
  };

  function normalizeData (__, data) {
    var self = this,
        parsed_data = [],
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        xValue = __.xValue;
    data.forEach( function (dataset, index) {
      if (date_chart) {
        parsed_data.push(dataset.map(function(d, i) {
          var x;
          // The time data is encoded in a string:
          if (date_chart && date_type == 'string') {
            x = d3.time.format(date_format)
              .parse(xValue.call(dataset, d));
          // The time data is encoded in an epoch number:
          } else if (date_chart && __.date_type == 'epoch') {
            x = new Date(xValue.call(dataset, d) * 1000);
          } 
          return [x, __.yValue.call(dataset, d)];
        }));
      } else {
        dataset = __.invert_data ? self.clone(dataset).reverse() : dataset;
        parsed_data.push(dataset.map(function(d, i) {
          var x = __.xValue.call(dataset, d);
          return [x, __.yValue.call(dataset, d)];
        }));
      }
    });
    return parsed_data;
  }

  function parseDataForBlockFrame () {
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
  function parseDataForSequentialFrame () {
    var self = this,
        __ = this.__,
        data_blocks = this.data_blocks || this.parseDataForBlockFrame(),
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

  function parseDataForFrame () {
    var frame_type = this.frame_type(),
        frame = this.frame,
        data_blocks_seq_obj = {};
    if (frame_type == 'block') { // barchart frames
      return this.parseDataForBlockFrame();
    } else if (frame_type == 'sequential') { // line frames
      data_blocks_seq_obj[frame] = this.parseDataForSequentialFrame();
      return data_blocks_seq_obj;
    } else {
      throw new Error('Wrong frame type, must be one of: block, sequence');
    }
  }

  return {
    dataIdentifier: dataIdentifier, // TODO: ????????
    setDelay: setDelay,
    normalizeData: normalizeData,
    parseDataForBlockFrame: parseDataForBlockFrame,
    parseDataForSequentialFrame: parseDataForSequentialFrame,
    parseDataForFrame: parseDataForFrame,
  };

});

