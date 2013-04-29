(function() {
  define(["d3"], function(d3) {
    var barChart;

    return barChart = function() {
      var chart, color, events, format, height, margin, updateBars, updateLegend, width, x0Scale, x1Scale, xAxis, yAxis, yScale, _drawLegend;

      margin = {
        top: 20,
        right: 100,
        bottom: 20,
        left: 30
      };
      width = 760 - margin.left - margin.right;
      height = 500 - margin.top - margin.bottom;
      format = d3.format(".0");
      x0Scale = d3.scale.ordinal();
      x1Scale = d3.scale.ordinal();
      yScale = d3.scale.linear();
      xAxis = d3.svg.axis().scale(x0Scale).orient("bottom");
      yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(format);
      color = d3.scale.linear().range(["#15534C", "#E2E062"]);
      events = ["onClick"];
      _drawLegend = function(selection, data) {
        var dispatch, legend, outer_legend, txt;

        outer_legend = selection.selectAll("g.outer_legend").data([data]).enter().append("g").attr("class", "outer_legend").attr("transform", "translate(" + margin.left + "," + 0 + ")");
        legend = outer_legend.selectAll("g.legend").data(data.slice()).enter().append("g").attr("class", "legend").attr("transform", function(d, i) {
          return "translate(0," + i * 20 + ")";
        });
        legend.append("rect").attr("x", width).attr("width", 18).attr("height", 18).style("fill", function(d, i) {
          return color(i + 1);
        });
        txt = legend.append("text").attr("x", width + 22).attr("y", 9).attr("dy", ".35em").text(function(d) {
          return d;
        }).attr("id", function(d) {
          return "l_" + d;
        });
        if (_.find(events, function(evt) {
          return evt === "onHover";
        }) === "onHover") {
          dispatch = WukumUrl.Charters.barChart.dispatch;
          txt.on("mouseover", function(d, i) {
            d = {
              name: d
            };
            return dispatch.onHover.apply(this, [d, i, true]);
          });
          return txt.on("mouseout", function(d, i) {
            d = {
              name: d
            };
            return dispatch.onHover.apply(this, [d, i]);
          });
        }
      };
      /*
        User interactions section
        See: https://github.com/mbostock/d3/wiki/Internals#wiki-d3_dispatch
      */

      updateLegend = function(d, i, entering) {
        var item, name;

        name = d.name;
        item = d3.select("#l_" + name);
        if (entering) {
          return item.attr("class", "selected");
        } else {
          return item.attr("class", "");
        }
      };
      updateBars = function(d, i, entering) {
        var items, name, original_class_values;

        name = d.name;
        items = d3.selectAll(".b_" + name);
        original_class_values = items.attr("class").replace(/selected/, "");
        if (entering) {
          return items.attr("class", "" + original_class_values + " selected");
        } else {
          return items.attr("class", original_class_values);
        }
      };
      /*
       Public Interface
      */

      chart = function(selection) {
        var dispatch;

        WukumUrl.Charters.barChart.dispatch = d3.dispatch.call(this, events);
        dispatch = WukumUrl.Charters.barChart.dispatch;
        _.each(events, function(evt) {
          dispatch.on("" + evt + ".legend", updateLegend);
          return dispatch.on("" + evt + ".onHover.bar", updateBars);
        });
        x0Scale.rangeRoundBands([0, width], .1, .02);
        yScale.range([height, 0]);
        return selection.each(function(data, i) {
          var bar_names, chart_group, g, gEnter, svg;

          bar_names = _.map(data[0].values, function(d) {
            return d.name;
          });
          x0Scale.domain(data.map(function(d) {
            return d.name;
          }));
          yScale.domain([
            0, d3.max(data, function(d) {
              return d.max;
            })
          ]);
          color.domain([0, data[0].values.length]);
          svg = d3.select(this).selectAll("svg").data([data]);
          gEnter = svg.enter().append("svg").append("g");
          gEnter.append("g").attr("class", "x axis");
          gEnter.append("g").attr("class", "y axis");
          svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);
          g = svg.select("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          g.select(".x.axis").attr("transform", "translate(0," + height + ")").call(xAxis);
          g.select(".y.axis").call(yAxis);
          chart_group = g.selectAll("g.chart_group").data(data);
          chart_group.enter().append("g").attr("class", "chart_group").attr("transform", function(d) {
            return "translate(" + x0Scale(d.name) + ",0)";
          });
          chart_group.each(function(inner_data, i) {
            var bar;

            x1Scale.rangeRoundBands([0, width / data.length], .1, .2);
            x1Scale.domain(inner_data.values.map(function(d) {
              return d.name;
            }));
            bar = d3.select(this).selectAll('.bar').data(function(d) {
              return d.values;
            });
            bar.enter().append("rect").attr("class", function(d) {
              return "bar b_" + d.name;
            }).attr("x", function(d) {
              return x1Scale(d.name);
            }).attr("width", 0).attr("y", function(d) {
              return height;
            }).attr("height", function(d) {
              return 0;
            }).style("fill", function(d, i) {
              return color(i + 1);
            });
            bar.exit().remove();
            bar.transition().duration(500).attr("x", function(d) {
              return x1Scale(d.name);
            }).attr("width", x1Scale.rangeBand()).attr("y", function(d) {
              return yScale(d.val);
            }).attr("height", function(d) {
              return height - yScale(d.val);
            });
            if (_.find(events, function(evt) {
              return evt === "onHover";
            }) === "onHover") {
              bar.on("mouseover", function(d, i) {
                return dispatch.onHover.apply(this, [d, i, true]);
              });
              return bar.on("mouseout", function(d, i) {
                return dispatch.onHover.apply(this, [d, i]);
              });
            }
          });
          chart_group.exit().remove();
          return _drawLegend(g, bar_names);
        });
      };
      chart.margin = function(_) {
        if (!arguments.length) {
          return margin;
        }
        margin = _;
        return chart;
      };
      chart.width = function(_) {
        if (!arguments.length) {
          return width;
        }
        width = _ - margin.left - margin.right;
        return chart;
      };
      chart.height = function(_) {
        if (!arguments.length) {
          return height;
        }
        height = _ - margin.top - margin.bottom;
        return chart;
      };
      chart.x0Scale = function(_) {
        if (!arguments.length) {
          return x0Scale;
        }
        x0Scale = _;
        return chart;
      };
      chart.yScale = function(_) {
        if (!arguments.length) {
          return yScale;
        }
        yScale = _;
        return chart;
      };
      chart.events = function(_) {
        if (!arguments.length) {
          return events;
        }
        events = _;
        return chart;
      };
      return chart;
    };
  });

}).call(this);
