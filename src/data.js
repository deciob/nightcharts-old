define('data', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

  function dataIdentifier (d) {
    return d[0];
  }

  function setDelay (data, __) {
    var duration = __.duration;
    if (duration == undefined) { throw new Error('__.duration unset')}
    __.delay = function (d, i) {
      // FIXME: only referring to the first dataset, 
      // while setting the delay on all!
      return i / data[0].length * duration;
    }
    return __;
  };

  function normalizeData (dataset, __) {
    var parsed_data = [],
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        xValue = __.xValue,
        yValue = __.yValue,
        zValue = __.zValue;
    dataset.forEach( function (data, index) {
      if (date_chart) {
        parsed_data.push(data.map(function(d, i) {
          var x,
              z = zValue.call(data, d);
          // The time data is encoded in a string:
          if (date_chart && date_type == 'string') {
            x = d3.time.format(date_format)
              .parse( xValue.call(data, d).toString() );
          // The time data is encoded in an epoch number:
          } else if (date_chart && date_type == 'epoch') {
            x = new Date(xValue.call(data, d) * 1000);
          }
          if (z) {
            return [x, yValue.call(data, d), z];
          } else {
            return [x, yValue.call(data, d)];
          }
        }));
      } else {
        data = __.invert_data ? utils.clone(data).reverse() : data;
        parsed_data.push(data.map(function(d, i) {
          var x = xValue.call(data, d),
              z = zValue.call(data, d);
          if (z) {
            return [x, yValue.call(data, d), z];
          } else {
            return [x, yValue.call(data, d)];
          }
        }));
      }
    });
    return parsed_data;
  }

  function _groupInObj (dataset, __, identifier_index) {
    var parsed_data = [];
    dataset.forEach(function (data, index) {
      parsed_data.push({});
      data.forEach(function (d, i) {
        var group = parsed_data[index][d[identifier_index]];
        if (group) {
          group.push(d)
        } else {
          parsed_data[index][d[identifier_index]] = [d];
        }
      });
    });
    return parsed_data;    
  }

  function _groupInArr (dataset, __, identifier_index) {
    var parsed_data = [];
    _groupInObj(dataset, __, identifier_index).forEach(function (data, index) {
      parsed_data.push([]);
      for (var identifier in data) {
        if( data.hasOwnProperty( identifier ) ) {
          parsed_data[index].push(data[identifier]);
        }
      }
    });
    return parsed_data;  
  }

  // Expects dataset argument to be the return value of normalizeData
  function groupNormalizedDataBy (dataset, __, identifier_index, grouper) {
    if (grouper === 'object') {
      return _groupInObj(dataset, __, identifier_index);
    } else if (grouper === 'array') {
      return _groupInArr(dataset, __, identifier_index);
    } else {
      throw new Error('grouper must be either `object` or `array`');
    }
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
    groupNormalizedDataBy: groupNormalizedDataBy,
    parseDataForSequentialFrame: parseDataForSequentialFrame,
    parseDataForFrame: parseDataForFrame,
  };

});

