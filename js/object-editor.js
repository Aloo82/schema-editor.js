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
(function ($) {
  /**
   *
   * @param name
   * @param value
   * @constructor
   */
  var DataEdit = function(name, value) {
    this.dataName  = name;
    this.dataValue = value;
  };

  DataEdit.prototype.draw = function(options) {
    var html  = $('<div/>'),
      name  = this.dataName,
      v     = this.dataValue;

    options = options || {};

    /**
     * Add prepend elements
     */
    options.prepend && html.prepend(options.prepend);
    window.console && console.log(typeof v, v);
    switch (typeof v) {
      case 'object':
        if (Array.isArray(v)) {
          html.append(this._drawArray(name, v));
        } else {
          /**
           * typeof null returns "object", ignore null values
           */
          (v !== null) && html.append(this._drawObject(name, v));
        }
        break;
      case 'boolean':
        var inpt = $('<input/>', {type: 'checkbox', class: 'data-value', checked: v, name: name});
        html.append(inpt);
        break;
      case 'number':
        var inpt = $('<input/>', {type: 'number', class: 'data-value', value: v, name: name});
        html.append(inpt);
        break;
      default:
        var inpt = $('<input/>', {type: 'text', class: 'data-value', value: v, name: name});
        html.append(inpt);
        break;
    }
    /**
     * Add append elements
     */
    options.append && html.append(options.append);
    return html.children();
  };

  DataEdit.prototype._drawObject = function(parentName, o) {
    var html = $('<dl/>', {class: 'editable data-value'});
    $.each(o, function (property, value) {
      var name = parentName + '[' + property + ']',
        data = new DataEdit(name, value),
        dt   = $('<dt/>', {class: 'editable', html: $('<input/>', {value: property})}),
        dl   = $('<dd/>', {html: data.draw()});

      html
        .append(dt)
        .append(dl);
    });
    return html;
  };

  DataEdit.addProperty = function(parent, name, value) {
    var tag = parent.prop('tagName').toLocaleLowerCase();

    if (tag == 'dl') {
      var data = new DataEdit(name, value),
        dt   = $('<dt/>', {class: 'editable', html: $('<input/>', {value: name})}),
        dd   = $('<dd/>', {html: data.draw()});

      parent
        .append(dt)
        .append(dd);
    }
  };

  DataEdit.removeProperty = function(property) {
    var tag = property.prop('tagName').toLocaleLowerCase();
    window.console && console.log('remove property',tag);
    if (tag == 'dt') {
      property.next('dd').remove();
      property.remove();
    }
  };

  DataEdit.editPropertyType = function(property, type) {
    var tag = property.prop('tagName').toLocaleLowerCase();
    window.console && console.log('edit property',tag, type);
    if (tag == 'dt') {
      var value;
      switch (type) {
        case 'object':
          value = {'new':'object'};
          break;
        case 'array':
          value = ['new collection'];
          break;
        case 'number':
          value = 0;
          break;
        case 'boolean':
          value = false;
          break;
        default:
          value = '';
          break;
      }
      var data = new DataEdit('some-name', value),
        dd   = $('<dd/>', {html: data.draw()});
      property.next('dd').remove();
      property.after(dd);
    }
  };

  DataEdit.prototype._drawArray = function(parentName, a) {
    var html = $('<ul/>', {class: 'editable data-value', 'data-name' : parentName});
    $.each(a, function (i, value) {
      var name = parentName + '[]',
        data = new DataEdit(name, value),
        li   = $('<li/>', {class: 'editable', html: data.draw()});
      html
        .append(li);
    });
    return html;
  };

  DataEdit.addRow = function(element, value) {
    var tag = element.prop('tagName').toLocaleLowerCase();

    if (tag == 'ul') {
      var name = element.attr('data-name') + '[]',
        data = new DataEdit('', value),
        li   = $('<li/>', {class: 'editable', html: data.draw()});
      element
        .append(li);
    }
  };

  DataEdit.editRowType = function(row, type) {
    var tag = row.prop('tagName').toLocaleLowerCase();
    window.console && console.log('edit row',tag, type);
    if (tag == 'li') {
      var value;
      switch (type) {
        case 'object':
          value = {'new':'object'};
          break;
        case 'array':
          value = ['new collection'];
          break;
        case 'number':
          value = 0;
          break;
        case 'boolean':
          value = false;
          break;
        default:
          value = '';
          break;
      }
      var data = new DataEdit('some-name', value),
        li   = $('<li/>', {class: 'editable', html: data.draw()});
      row.replaceWith(li);
    }
  };

  DataEdit.removeRow = function(element) {
    var tag = element.prop('tagName').toLocaleLowerCase();
    window.console && console.log('remove row',tag);
    if (tag == 'li') {
      element.remove();
    }
  };

  DataEdit.toData = function(element) {
    var data = null,
      tag  = element.length ? element.prop('tagName').toLocaleLowerCase() : null;
    switch (tag) {
      case 'dl':
        data = {};
        var lastProp = null;
        element.find('>dt,>dd').each(function (i,e) {
          var el = $(e), tag = el.prop('tagName').toLocaleLowerCase();
          switch (tag) {
            case 'dt':
              lastProp = el.find('input').val();
              break;
            case 'dd':
              data[lastProp] = DataEdit._toData(el);
              break;
          }
        });
        break;
      case 'ul':
        data = [];
        element.find('>li').each(function (i,e) {
          var el  = $(e);
          data[i] = DataEdit._toData(el);
        });
        break;
    }
    return data;
  };

  DataEdit._toData = function(element) {
    var data = null,
      inpt = element.find('.data-value'),
      tag  = inpt.length ? inpt.prop('tagName').toLocaleLowerCase() : null;
    if (tag == 'input') {
      var type = inpt.prop('type').toLocaleLowerCase();
      switch (type) {
        case 'number':
          data = Number(inpt.val());
          break;
        case 'checkbox':
          data = inpt.val() ? true : false;
          break;
        case 'text':
          data = inpt.val();
          break;
      }
    } else {
      data = DataEdit.toData(inpt);
    }
    return data;
  };
  $.widget("ui.objectEditor", {
    _editorTarget: null,
    /**
     *
     * @private
     */
    _create: function() {
      var self = this,
        O    = self.options,
        E    = self.element,
        D    = JSON.parse(self.element.val());

      self._data = new DataEdit('myObjectInput', D);
      /**
       * DOM Element to represent the editor
       * @type {*|jQuery|HTMLElement}
       */
      self._E = {};
      self._E.container = $('<div/>');
      self._E.editor    = $('<div/>').bind({
        'click' : function(e) {self._handleClick(e)}
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
      window.console && console.log('hello');
      self.element
        .on('click', function () {
          var data = DataEdit.toData(self._E.editor.find('>.data-value'));
          self.element.val(JSON.stringify(data));
        })
        .before(this._E.editor);
    },
    /**
     *
     * @param event
     * @private
     */
    _handleClick: function (event) {
      var self     = this,
        target   = $(event.target),
        editable = target.parents('dl,dt,ul,li'),
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
            self._uiControls(element);
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
          DataEdit.addProperty(target, '', '');
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
          DataEdit.editPropertyType(target, params);
          break;
        case 'remove':
          DataEdit.removeProperty(target);
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
          DataEdit.addRow(target, '');
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
          DataEdit.editRowType(target, params);
          break;
        case 'remove':
          DataEdit.removeRow(target);
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
          'null'   : 'Null',
          'object' : 'Object',
          'array'  : 'Collection',
          'number' : 'Number',
          'string' : 'Text',
          'boolean': 'Bool'
        };
      $.each(types, function(value, label) {
        select.append($('<option/>',{value: value, text: label}));
      });
      return select;
    }
  });

  $('[data-ui-objecteditor]').each(function () {
    var editor = $(this).objectEditor({some : 'option'});
    editor.objectEditor('show');
  });
})(jQuery);