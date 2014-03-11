define('mixins/data_helpers', [
  "d3", 
  "utils/utils"
], function (d3, utils) {

  function dataIdentifier (d) {
    return d[0];
  }

  function delay (__) {
    var duration = __.duration,
        data = __.data;
    return function (d, i) {
      //debugger;
      return i / data[0].length * duration;
    }
  };

  function normalizeData (data, __) {
    var parsed_data = [],
        date_chart = __.x_scale == 'time' ? true : false,
        date_format = __.date_format,
        date_type = __.date_type,
        categoricalValue = __.categoricalValue;
    data.forEach( function (dataset, index) {
      parsed_data.push(dataset.map(function(d, i) {
        var x;
        // The time data is encoded in a string:
        if (date_chart && date_type == 'string') {
          x = d3.time.format(date_format)
            .parse(categoricalValue.call(dataset, d));
        // The time data is encoded in an epoch number:
        } else if (date_chart && __.date_type == 'epoch') {
          x = new Date(categoricalValue.call(dataset, d) * 1000);
        // Real categorical value:
        } else {
          x = __.categoricalValue.call(dataset, d);
        }
        return [x, __.quantativeValue.call(dataset, d)];
      }));
    });
    if (__.invert_data) {
      //parsed_data = data.reverse();  // TODO!!!
    }
    return parsed_data;
  }

  return function () {
    this.dataIdentifier = dataIdentifier;
    //this.delay = delay;
    this.normalizeData = normalizeData;
    return this;
  };

});