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
    // Now the data is normalized:
    __.xValueN = function (d) { return d[0]; };
    __.yValueN = function (d) { return d[1]; };
    __.zValueN = function (d) { return d[2]; };
    
    return parsed_data;
  }

  function _groupInObj (identifier_index, data, __, options) {
    var parsed_data = {},
        keyFunction = options && options.keyFunction || function(k){return k;};
    data.forEach(function (d, i) {
      var group = parsed_data[keyFunction(d[identifier_index])];
      if (group) {
        group.push(d);
      } else {
        parsed_data[keyFunction(d[identifier_index])] = [d];
      }
    });
    return parsed_data;    
  }

  function _groupInArr (identifier_index, data, __, options) {
    var parsed_data = [],
        obj_grouped_data = options && options.obj_grouped_data || 
          _groupInObj(identifier_index, data, __, options);
    for ( var identifier in obj_grouped_data ) {
      if( obj_grouped_data.hasOwnProperty( identifier ) ) {
        parsed_data.push(obj_grouped_data[identifier]);
      }
    }
    return parsed_data;
  }

  // Expects dataset argument to be the return value of normalizeData
  // groupNormalizedDataByIndex(index, options) data, __, identifier_index, grouper
  function groupNormalizedDataByIndex (identifier_index, data, __, options) {
    var grouper = options.grouper;
    if (grouper === 'object') {
      return _groupInObj(identifier_index, data, __, options);
    } else if (grouper === 'array') {
      return _groupInArr(identifier_index, data, __, options);
    } else {
      throw new Error('grouper must be either `object` or `array`');
    }
  }

  //function sliceGroupedNormalizedDataAtIdentifier (identifier, data, __) {
  //  var sliced_data = {};
  //  for (var id in data) {
  //    if( data.hasOwnProperty( id ) ) {
  //      // it assumes the data object is correctly sorted.
  //      sliced_data[id] = data[id];
  //      if (identifier === id) {
  //        break;
  //      }
  //    }
  //  }
  //  return sliced_data;
  //}

  function getIndexFromIdentifier (identifier, data, frameIdentifierKeyFunction) {
    var index;
    data.forEach(function(d, i) {
      if (frameIdentifierKeyFunction(d) === identifier) {
        index = i;
      }
    });
    return index;
  }

  function filterGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var index = getIndexFromIdentifier(identifier, data, __.frameIdentifierKeyFunction);
    console.log(data.slice(index, index+2));
    return data.slice(index, index+2);
  }

  function sliceGroupedNormalizedDataAtIdentifier (identifier, data, __) {
    var index = getIndexFromIdentifier(identifier, data, __.frameIdentifierKeyFunction);
    //console.log(data.slice(0, index+1));
    return data.slice(0, index+1);
  }

  //function filterGroupedNormalizedDataAtIdentifier (identifier, data, __) {
  //  var identified = false;
  //  return data.map(function(data) {
  //    return data.filter(function(d) {
  //      var include = identified ? false : true;
  //      console.log(d, identifier);
  //      indentified = d[__.frame_identifier_index] === identifier;
  //      return include;
  //    });
  //  });
  //}

//  // TODO: rock test this shit!!!!
//  function sliceNormalizedDataAtIdentifier (identifier, data, __) {
//    var sliced_data = [];
//    for (var id in data) {
//      if( data.hasOwnProperty( id ) ) {
//        var g = [];
//        data[id].forEach(function (d, i) {
//          g.push(d);
//        })
//        // it assumes the data object is correctly sorted.
//        sliced_data.push(data[id][0]);
//        if (identifier === id) {
//          break;
//        }
//      }
//    }
//    return sliced_data;
//  }



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

  return {
    setDelay: setDelay,
    normalizeData: normalizeData,
    groupNormalizedDataByIndex: groupNormalizedDataByIndex,
    sliceGroupedNormalizedDataAtIdentifier: sliceGroupedNormalizedDataAtIdentifier,
    filterGroupedNormalizedDataAtIdentifier: filterGroupedNormalizedDataAtIdentifier,
    getIndexFromIdentifier: getIndexFromIdentifier,
    //sliceNormalizedDataAtIdentifier: sliceNormalizedDataAtIdentifier,
    simpleDataParser: simpleDataParser,
    groupedDataParser: groupedDataParser,
  };

});

