define('data', [
  "d3",
  'utils'
], function (d3, utils) {
  'use strict';

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

  function normalizeData (data, __) {
    var parsed_data,
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        xValue = __.xValue,
        yValue = __.yValue,
        zValue = __.zValue;

    if (date_chart) {
      parsed_data = data.map(function(d, i) {
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
      });
    } else {
      data = __.invert_data ? utils.clone(data).reverse() : data;
      parsed_data = data.map(function(d, i) {
        var x = xValue.call(data, d),
            z = zValue.call(data, d);
        if (z) {
          return [x, yValue.call(data, d), z];
        } else {
          return [x, yValue.call(data, d)];
        }
      });
    }

    return parsed_data;
  }

  function _groupInObj (data, __, identifier_index) {
    var parsed_data = {};
    data.forEach(function (d, i) {
      var group = parsed_data[d[identifier_index]];
      if (group) {
        group.push(d)
      } else {
        parsed_data[d[identifier_index]] = [d];
      }
    });
    return parsed_data;    
  }

  function _groupInArr (data, __, identifier_index) {
    var parsed_data = [],
        objGroupedData = _groupInObj(data, __, identifier_index);
    for ( var identifier in objGroupedData ) {
      if( objGroupedData.hasOwnProperty( identifier ) ) {
        parsed_data.push(objGroupedData[identifier]);
      }
    }
    return parsed_data;
  }

  // Expects dataset argument to be the return value of normalizeData
  function groupNormalizedDataBy (data, __, identifier_index, grouper) {
    if (grouper === 'object') {
      return _groupInObj(data, __, identifier_index);
    } else if (grouper === 'array') {
      return _groupInArr(data, __, identifier_index);
    } else {
      throw new Error('grouper must be either `object` or `array`');
    }
  }

  function simpleDataParser (data, callback) {
    data.forEach( function (d, i, data) {
      callback(d, i, data);
    });
  }

  function groupedDataParser (dataset, callback) {
    dataset.forEach( function (data, index, dataset) {
      simpleDataParser(data, callback);
    });
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
    setDelay: setDelay,
    normalizeData: normalizeData,
    groupNormalizedDataBy: groupNormalizedDataBy,
    simpleDataParser: simpleDataParser,
    groupedDataParser: groupedDataParser,
    parseDataForSequentialFrame: parseDataForSequentialFrame,
    parseDataForFrame: parseDataForFrame,
  };

});

