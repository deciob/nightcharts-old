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
		insert: { at: 'dom.first!.inline' }
	},

  inline_controller: {
  	create: {
      module: 'inline/controller',
      args: {
        //chart: {$ref: "chart_constructor"},
        data_url: 'app/inline/data.json',
        el: {$ref: "inline_example"},
        selector: '#inline-viz'
      }
    }
  },

  // Create a simple view by rendering html, replacing some i18n strings
	// and loading CSS.  Then, insert into the DOM
	tooltip_example: {
		render: {
			template: { module: 'text!tooltip/template.html' },
			replace: { module: 'i18n!tooltip/strings' },
			css: { module: 'css!tooltip/structure.css' }
		},
		insert: { at: 'dom.first!.tooltip' }
	},

  tooltip_controller: {
  	create: {
      module: 'tooltip/controller',
      args: {
        //chart: {$ref: "chart_constructor"},
        data_url: 'app/tooltip/data.json',
        el: {$ref: "tooltip_example"},
        selector: '#tooltip-viz'
      }
    }
  },

	// Wire.js plugins
	plugins: [
		{ module: 'wire/dom', classes: { init: 'loading' } },
		{ module: 'wire/dom/render' }
	]
});