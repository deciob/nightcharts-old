###### Why call it nightcharts?

When work has ended and children are resting and all is dark and quiet, I code.


Example:  [data-story.org/wup/](http://data-story.org/wup/) ([source code](https://github.com/deciob/wup))


#### Data

The `bar` module expects an array of objects:
```js
 data = [{value: 10, name: 'a'}, {value: 20, name: 'b'}]
```

The `frame` module expects an object with arrays of objects:
```js
 data = { 
  1950: [{value: 10, name: 'a'}, {value: 20, name: 'b'}],
  1960: [{value: 11, name: 'a'}, {value: 23, name: 'b'}]
 }
```

#### Minimal barchart example

```js
selection = d3.select('#viz');
barchart = chart.bar();
draw = chart.draw(barchart, selection);
draw(data);
```
