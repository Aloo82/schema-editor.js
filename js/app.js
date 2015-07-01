/**
 * Created by jknight on 21/06/15.
 */
requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: 'js/lib',
  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
    app: '../app'
  },

  shim: {
    'jquery-ui:': {
      deps: ['jquery']
    }
  }
});

// Start the main app logic.
requirejs(['jquery', 'app/data', 'jquery-ui'],
  function   ($, VisualData) {
    $.widget("ui.objectEditor", {
      _editorTarget: null,
      /**
       *
       * @private
       */
      _create: function() {
        var self = this,
            data = JSON.parse(self.element.val());

        self.options = $.extend(self.options, self.data_options(self.element));
        self._data   = new VisualData('myObjectInput', data);
        window.console && console.log(self.options);
        /**
         * DOM Element to represent the editor
         * @type {*|jQuery|HTMLElement}
         */
        self._E = {};
        self._E.container = $('<div/>', {class: 'schema-editor'});
        self._E.editor    = $('<div/>', {class: 'view-port'}).bind({
          'click' : function(e) {self._handleClick(e)}
        });
        $(document.body).on('schema-change', function () {
          window.console && console.log('schema change');
          var data = VisualData.toData(self._E.editor.find('>.data-value'));
          self.element.val(JSON.stringify(data,null,'\t'));
        });
        self._E.controls = $('<div/>');
      },
      /**
       *
       */
      show: function () {
        var self = this;
        self._E.editor.append(this._data.draw());
        //this.element.css({display: 'none'}).after(this._E.editor);
        self.element
          .wrap(self._E.container)
          .before(this._E.editor);
        if (!self.options['show-output']) {
          self.element.hide();
        }
      },
      /**
       *
       * @param event
       * @private
       */
      _handleClick: function (event) {
        var self     = this,
            target   = $(event.target),
            editable = target.parents('dl,dt,ol,li'),
            element  = null;

        if (target.length) {
          var clickHandled = false;
          /**
           * Get the closest editable element
           */
          element = $(target[0]);
          if (element.attr('data-action')) {
            var action = element.attr('data-action');
            self._handleAction(action);
            clickHandled = true;
          }
          if (!clickHandled && editable.length) {
            /**
             * Get the closest editable element
             */
            element = $(editable[0]);
            if (element.hasClass('editable')) {
              self._editorTarget = element;
              //self._uiControls(element);
            }
          }
        }
      },
      /**
       *
       * @param action
       * @param params
       * @private
       */
      _handleAction: function (action, params) {
        var target = this._editorTarget;
        if (target && target.length) {
          var tag = target.prop('tagName').toLowerCase();
          window.console && console.log('action on',tag);
          switch (tag) {
            case 'dl':
              this._handleObjectAction(action, params);
              break;
            case 'dt':
              this._handlePropertyAction(action, params);
              break;
            case 'ul':
              this._handleArrayAction(action, params);
              break;
            case 'li':
              this._handleRowAction(action, params);
              break;
          }
        }
      },
      /**
       *
       * @param action
       * @param params
       * @private
       */
      _handleObjectAction: function (action, params) {
        var target = this._editorTarget;
        switch (action) {
          case 'add':
            VisualData.addProperty(target, '', '');
            break;
        }
      },
      /**
       *
       * @param action
       * @param params
       * @private
       */
      _handlePropertyAction: function (action, params) {
        var target = this._editorTarget;
        switch (action) {
          case 'editType':
            VisualData.editPropertyType(target, params);
            break;
          case 'remove':
            VisualData.removeProperty(target);
            break;
        }
      },
      /**
       *
       * @param action
       * @param params
       * @private
       */
      _handleArrayAction: function (action, params) {
        var target = this._editorTarget;
        switch (action) {
          case 'add':
            VisualData.addRow(target, '');
            break;
        }
      },
      /**
       *
       * @param action
       * @param params
       * @private
       */
      _handleRowAction: function (action, params) {
        var target = this._editorTarget;
        switch (action) {
          case 'editType':
            VisualData.editRowType(target, params);
            break;
          case 'remove':
            VisualData.removeRow(target);
            break;
        }
      },
      /**
       *
       * @param element
       * @private
       */
      _uiControls: function (element) {
        var self      = this,
            tag       = element.prop('tagName').toLowerCase(),
            controls  = this._E.controls;

        if (controls.data('target') !== element[0]) {
          window.console && console.log('new control target');
          controls
            .data('target', element[0])
            .empty();

          switch (tag) {
            case 'dl':
              controls.append($('<a/>',{text: 'add', 'data-action' : 'add'}));
              element.after(controls);
              break;
            case 'dt':
              var drop = this._uiTypeDropdown().on('change', function() {
                self._handleAction('editType', $(this).find(':selected').val());
              });
              controls
                .append(drop)
                .append($('<a/>',{text: 'remove', 'data-action' : 'remove'}));
              element.append(controls);
              break;
            case 'ul':
              controls.append($('<a/>',{text: 'add', 'data-action' : 'add'}));
              element.after(controls);
              break;
            case 'li':
              var drop = this._uiTypeDropdown().on('change', function() {
                self._handleAction('editType', $(this).find(':selected').val());
              });
              controls
                .append(drop)
                .append($('<a/>',{text: 'remove', 'data-action' : 'remove'}));
              element.append(controls);
              break;
          }
        }
      },

      _uiTypeDropdown : function() {
        var select = $('<select/>'),
          types  = {
            'string' : 'Text',
            'object' : 'Object',
            'array'  : 'Collection',
            'number' : 'Number',
            'boolean': 'Bool',
            'null'   : 'Null'
          };
        $.each(types, function(value, label) {
          select.append($('<option/>',{value: value, text: label}));
        });
        return select;
      },

      // Description:
      //    Parses data-options attribute
      //
      // Arguments:
      //    El (jQuery Object): Element to be parsed.
      //
      // Returns:
      //    Options (Javascript Object): Contents of the element's data-options
      //    attribute.
      data_options : function (el, data_attr_name) {
        data_attr_name = data_attr_name || 'options';
        var opts = {}, ii, p, opts_arr,
          data_options = function (el) {
            var namespace = '';

            if (namespace.length > 0) {
              return el.data(namespace + '-' + data_attr_name);
            }

            return el.data(data_attr_name);
          };

        var cached_options = data_options(el);

        if (typeof cached_options === 'object') {
          return cached_options;
        }

        opts_arr = (cached_options || ':').split(';');
        ii = opts_arr.length;

        function isNumber (o) {
          return !isNaN (o - 0) && o !== null && o !== '' && o !== false && o !== true;
        }

        function trim (str) {
          if (typeof str === 'string') {
            return $.trim(str);
          }
          return str;
        }

        while (ii--) {
          p = opts_arr[ii].split(':');
          p = [p[0], p.slice(1).join(':')];

          if (/true/i.test(p[1])) {
            p[1] = true;
          }
          if (/false/i.test(p[1])) {
            p[1] = false;
          }
          if (isNumber(p[1])) {
            if (p[1].indexOf('.') === -1) {
              p[1] = parseInt(p[1], 10);
            } else {
              p[1] = parseFloat(p[1]);
            }
          }

          if (p.length === 2 && p[0].length > 0) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      }
    });

    $('[data-schema-editor]').each(function () {
      var editor = $(this).objectEditor({some : 'option'});
      editor.objectEditor('show');
    });
  }
);