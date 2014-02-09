define({

	// Load a basic theme. This is just a CSS file, and since a moduleLoader is
	// configured in run.js, curl knows to load this as CSS.
	theme: { module: 'theme/basic.css' },

	chart_constructor: {
		create: {
			module: 'chart',
		}
	},

	// Create a simple view by rendering html, replacing some i18n strings
	// and loading CSS.  Then, insert into the DOM
	inline_example: {
		render: {
			template: { module: 'text!inline/template.html' },
			replace: { module: 'i18n!inline/strings' },
			css: { module: 'css!inline/structure.css' }
		},
		insert: { at: 'dom.first!body' }
	},

  inline_controller: {
  	create: {
      module: 'inline/controller',
      args: {
        chart: {$ref: "chart_constructor"},
        data_url: 'app/inline/data.json',
        //el: {$ref: 'id!inline-viz', at: 'inline_example'}
        el: {$ref: "inline_example"},
        selector: '#inline-viz'
      }
    }
  },

	// Wire.js plugins
	plugins: [
		{ module: 'wire/dom', classes: { init: 'loading' } },
		{ module: 'wire/dom/render' }
	]
});