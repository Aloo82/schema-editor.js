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

  return DataEdit;
});

/**
 * Add property
 * Edit property
 *  - type
 *  - value
 */
