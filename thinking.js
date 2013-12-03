dispatch = d3.dispatch("start", "stop", "next", "prev", "reset", "end")
dispatch.start()
dispatch.on('start.bar', callback)

data = [ [], [], [] ]
selection = d3.select("#viz")
bar = chart.bar().width(1100).height(760)

selection.datum(data_by_year[current_year]).call(bar)

////////////////////////////////////////////////////////

bar = new chart.Bar().width(1100).height(760)
bar.draw("#viz")
bar.dispatch.on('start.bar', callback)  // mixin?
bar.dispatch.start()

bar_orient methods as mixins?