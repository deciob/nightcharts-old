###### Why call it nightcharts?

When work has ended and children are resting and all is dark and quiet, I code.


Example:  [data-story.org/wup/](http://data-story.org/wup/) ([source code](https://github.com/deciob/wup))

*Minimal barchart example*:

```js
data = [];
selection = d3.select('#viz');
barchart = chart.bar();
draw = chart.draw(barchart, selection);
draw(data);
```
