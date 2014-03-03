define('mixins/line_mixins',["d3", "utils/utils"], function(d3, utils) {

      //parse = d3.time.format("%Y-%m-%d").parse
      //format = d3.time.format("%Y-%m-%d")
      //format(new Date(2011, 0, 1))

  function normalizeData (data, __) {
    var parsed_data = [];
    data.forEach( function (dataset, index) {
      parsed_data.push(dataset.map(function(d, i) {
        var x;
        if (__.date && __.date_type == 'string') {
          x = d3.time.format(__.date_format)
            .parse(__.categoricalValue.call(dataset, d));
        } else if (__.date && __.date_type == 'epoch') {
          x = d3.time.format(__.date_format)(new Date(__.categoricalValue.call(dataset, d) * 1000));
        } else {
          x = __.categoricalValue.call(dataset, d);
        }
        return [
          x, 
          __.quantativeValue.call(dataset, d)
        ];
      }));
    });
    if (__.invert_data) {
      //parsed_data = data.reverse();  // TODO
    }
    return parsed_data;
  }

  function line (params) {
    return d3.svg.line().x(function(d, i) {
        return params.xScale(d[0]);
      }).y(function(d, i) {
        return params.yScale(d[1]);
      });
  }

  function createLines (params) {
    return this.append("path")
      .attr("class", "line")
      .attr("d", line(params) );
  }

  function transitionLines (params) {
    
  }

  return function (orientation, params) {
    this.createLines = createLines;
    this.transitionLines = transitionLines;
    this.normalizeData = normalizeData;
    return this;
  };
  
});

