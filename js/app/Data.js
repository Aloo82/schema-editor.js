/**
 * Created by jknight on 21/06/15.
 */
define(['jquery'], function ($, VisualObject) {
  'use strict';
  /**
   * TODO : adding & editing properties and values need input names
   */
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
          html
            .append(this._drawArray(name, v))
            .append($('<a/>', {class: 'action-add'}));
        } else {
          /**
           * typeof null returns "object", ignore null values
           */
          (v !== null) && html
                            .append(this._drawObject(name, v))
                            .append($('<a/>', {class: 'action-add'}));
        }
        break;
      case 'boolean':
        var inpt = $('<input/>', {type: 'checkbox', class: 'data-value data-type-bool', checked: v, name: name}).on('change', function () {DataEdit.change(this)});
        html.append(inpt);
        break;
      case 'number':
        var inpt = $('<input/>', {type: 'number', class: 'data-value data-type-number', value: v, name: name}).on('change keyup', function () {DataEdit.change(this)});
        html.append(inpt);
        break;
      default:
        var inpt = $('<input/>', {type: 'text', class: 'data-value data-type-text', value: v, name: name}).on('change keyup', function () {DataEdit.change(this)});
        html.append(inpt);
        break;
    }
    /**
     * Add a remove link
     */
    html.append($('<a/>', {class: 'action-remove'}));
    /**
     * Add append elements
     */
    options.append && html.append(options.append);
    return html.children();
  };

  DataEdit.prototype._drawObject = function(parentName, o) {
    var html = $('<dl/>', {class: 'editable data-value data-type-object'});
    $.each(o, function (property, value) {
      var name = parentName + '[' + property + ']',
          data = new DataEdit(name, value),
          dt   = $('<dt/>', {class: 'editable', html: $('<input/>', {type: 'text', value: property, class: 'property-name'}).on('change keyup', function () {$(this).trigger('schema-change');})}),
          dl   = $('<dd/>', {html: data.draw()});
      /**
       * Add type selector for each element
       */
      dt.prepend(DataEdit.typeSelector(typeof value));

      html
        .append(dt)
        .append(dl);
    });
    return html;
  };

  DataEdit.change = function(element) {
    var e = $(element);
    e.parent().data('schema-value', DataEdit.returnInputValue(e));
    window.console && console.log(DataEdit.returnInputValue(e), e.parent(), e.parent().data('schema-value'));
    e.trigger('schema-change');
  };

  DataEdit.addProperty = function(parent, name, value) {
    var tag = parent.prop('tagName').toLocaleLowerCase();

    if (tag == 'dl') {
      var data = new DataEdit(name, value),
          dt   = $('<dt/>', {class: 'editable', html: $('<input/>', {type: 'text', value: name, class: 'property-name'}).on('change keyup', function () {$(this).trigger('schema-change');})}),
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
      var p = property.parent();
      property.next('dd').remove();
      property.remove();
      p.trigger('schema-change');
    }

  };

  DataEdit.editPropertyType = function(property, type) {
    var tag = property.prop('tagName').toLocaleLowerCase();
    window.console && console.log('edit property',tag, type,property.data('schema-value'));
    if (tag == 'dt') {
      var value = property.data('schema-value');
      switch (type) {
        case 'object':
          value = value || {'new':'object'};
          break;
        case 'array':
          value = value || ['new collection'];
          break;
        case 'number':
          value = value || 0;
          break;
        case 'boolean':
          value = value || false;
          break;
        default:
          value = value || '';
          break;
      }
      var data = new DataEdit('some-name', value),
          dd   = $('<dd/>', {html: data.draw()});
      property.next('dd').remove();
      property.after(dd);
    }
  };

  DataEdit.prototype._drawArray = function(parentName, a) {
    var html = $('<ol/>', {class: 'editable data-value data-type-array', 'data-name' : parentName});
    $.each(a, function (i, value) {
      var name = parentName + '[]',
          data = new DataEdit(name, value),
          li   = $('<li/>', {class: 'editable', html: data.draw()});
      li.prepend(DataEdit.typeSelector(typeof value));
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
      li.prepend(DataEdit.typeSelector(typeof value));
      element
        .append(li);
    }
  };

  DataEdit.editRowType = function(row, type) {
    var tag = row.prop('tagName').toLocaleLowerCase(),
        p   = row.parent();
    window.console && console.log('edit row',tag, type, row.data('schema-value'));
    if (tag == 'li') {
      var value = row.data('schema-value');
      switch (type) {
        case 'object':
          value = value || {'new':'object'};
          break;
        case 'array':
          value = value || ['new collection'];
          break;
        case 'number':
          value = Number(value) || 0;
          break;
        case 'boolean':
          value = (value && true) || false;
          break;
        default:
          value = value || '';
          break;
      }
      var data = new DataEdit('some-name', value),
          li   = $('<li/>', {class: 'editable', html: data.draw()});
      row.replaceWith(li);
      window.console && console.log(p);
      p.trigger('schema-change');
    }
  };

  DataEdit.removeRow = function(element) {
    var tag = element.prop('tagName').toLocaleLowerCase();
    window.console && console.log('remove row',tag);
    if (tag == 'li') {
      var p = element.parent();
      element.remove();
      p.trigger('schema-change')
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
      data = DataEdit.returnInputValue(inpt);
    } else {
      data = DataEdit.toData(inpt);
    }
    return data;
  };

  DataEdit.returnInputValue = function(inpt) {
    var data = null,
        type = inpt.prop('type').toLocaleLowerCase();
    switch (type) {
      case 'number':
        data = Number(inpt.val());
        break;
      case 'checkbox':
        data = inpt.is(':checked');
        break;
      case 'text':
        data = inpt.val();
        break;
    }
    return data;
  };

  DataEdit.typeSelector = function(selected) {
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
  };

  return DataEdit;
});

/**
 * Add property
 * Edit property
 *  - type
 *  - value
 */
