define({

	// Load a basic theme. This is just a CSS file, and since a moduleLoader is
	// configured in run.js, curl knows to load this as CSS.
	theme: { module: 'theme/basic.css' },

  data: {
    module: 'data/fetch_data',
  },

  controllers: {
    render: {
      template: { module: 'text!controllers/template.html' },
      css: { module: 'css!controllers/structure.css' }
    },
    insert: { at: 'dom.first!.controllers' },
    on: {
      'click:.start': 'bar_frame_controller.start',
      'click:.stop': 'bar_frame_controller.stop',
      'click:.reset': 'bar_frame_controller.reset',
    },
  },

  controllers_controller: {
    create: {
      module: 'controllers/controller',
    }
  },

  bar_frame: {
    render: {
      template: { module: 'text!bar_frame/template.html' },
      replace: { module: 'i18n!bar_frame/strings' },
      css: { module: 'css!bar_frame/structure.css' }
    },
    insert: { at: 'dom.first!.bar_frame' },
    on: {
      'click:#bar-frame-viz g.y text, #bar-frame-viz g.bars rect': 
        'bar_frame_controller.getSelections | ' + 
        'bar_frame_controller.updateSelections | ' + 
        'line_frame_controller.setFrames | ' +
        'controllers_controller.handleInfo',
    }
  },

  bar_frame_controller: {
    create: {
      module: 'bar_frame/controller',
      args: {
        el: {$ref: "bar_frame"},
        selector: '#bar-frame-viz',
        data: {$ref: "data"}
      }
    },
    connect: {
      'start': 'line_frame_controller.start',
      'stop': 'line_frame_controller.stop',
      'reset': 'line_frame_controller.reset',
    }
  },

  line_frame: {
    render: {
      template: { module: 'text!line_frame/template.html' },
      replace: { module: 'i18n!line_frame/strings' },
      css: { module: 'css!line_frame/structure.css' }
    },
    insert: { at: 'dom.first!.line_frame' }
  },

  line_frame_controller: {
    create: {
      module: 'line_frame/controller',
      args: {
        el: {$ref: "line_frame"},
        selector: '#line-frame-viz',
        data: {$ref: "data"}
      }
    }
  },

	// Wire.js plugins
	plugins: [
		{ module: 'wire/dom', classes: { init: 'loading' } },
		{ module: 'wire/dom/render' },
    { module: 'wire/on' },
    { module: 'wire/connect'},
	]
});