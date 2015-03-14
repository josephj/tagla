
/*
 * @class Stackla.Base
 */

(function() {
  var Base;

  Base = (function() {
    function Base(options) {
      var attrs, debug;
      if (options == null) {
        options = {};
      }
      debug = this.getParams('debug');
      attrs = attrs || {};
      if (debug) {
        this.debug = debug === 'true' || debug === '1';
      } else if (attrs.debug) {
        this.debug = attrs.debug === true;
      } else {
        this.debug = false;
      }
      this._listeners = [];
    }

    Base.prototype.toString = function() {
      return 'Base';
    };

    Base.prototype.log = function(msg, type) {
      if (!this.debug) {
        return;
      }
      type = type || 'info';
      if (window.console && window.console[type]) {
        window.console[type]("[" + (this.toString()) + "] " + msg);
      }
    };

    Base.prototype.on = function(type, callback) {
      if (!type || !callback) {
        throw new Error('Both event type and callback are required parameters');
      }
      this.log('on() - event \'' + type + '\' is subscribed');
      if (!this._listeners[type]) {
        this._listeners[type] = [];
      }
      callback.instance = this;
      this._listeners[type].push(callback);
      return callback;
    };

    Base.prototype.emit = function(type, data) {
      var i;
      if (data == null) {
        data = [];
      }
      this.log("emit() - event '" + type + "' is triggered");
      data.unshift({
        type: type,
        target: this
      });
      if (!type) {
        throw new Error('Lacks of type parameter');
      }
      if (this._listeners[type] && this._listeners[type].length) {
        for (i in this._listeners[type]) {
          this._listeners[type][i].apply(this, data);
        }
      }
      return this;
    };

    Base.prototype.getParams = function(key) {
      var hash, hashes, href, i, params, pos;
      href = this.getUrl();
      params = {};
      pos = href.indexOf('?');
      this.log('getParams() is executed');
      if (href.indexOf('#') !== -1) {
        hashes = href.slice(pos + 1, href.indexOf('#')).split('&');
      } else {
        hashes = href.slice(pos + 1).split('&');
      }
      for (i in hashes) {
        hash = hashes[i].split('=');
        params[hash[0]] = hash[1];
      }
      if (key) {
        return params[key];
      } else {
        return params;
      }
    };

    Base.prototype.getUrl = function() {
      return window.location.href;
    };

    return Base;

  })();

  if (!window.Stackla) {
    window.Stackla = {};
  }

  window.Stackla.Base = Base;

}).call(this);

(function() {
  var ImageSize,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ImageSize = (function(superClass) {
    extend(ImageSize, superClass);

    function ImageSize(el, callback) {
      ImageSize.__super__.constructor.call(this);
      this.init(el);
      this.bind();
      this.render(callback);
      return this;
    }

    ImageSize.prototype.toString = function() {
      return 'ImageSize';
    };

    ImageSize.prototype.init = function(el) {
      this.el = $(el)[0];
      this.complete = this.el.complete;
      this.data = {};
      this._timer = null;
      this.data.width = this.el.width;
      return this.data.height = this.el.height;
    };

    ImageSize.prototype.bind = function() {
      this.log('bind() is executed');
      return $(window).resize((function(_this) {
        return function(e) {
          var isEqual;
          isEqual = _this.el.width === _this.data.width && _this.el.height === _this.data.height;
          if (isEqual) {
            return;
          }
          $.extend(_this.data, {
            width: _this.el.width,
            height: _this.el.height,
            widthRatio: _this.el.width / _this.data.naturalWidth,
            heightRatio: _this.el.height / _this.data.naturalHeight
          });
          _this.log('handleResize() is executed');
          return _this.emit('change', [_this.data]);
        };
      })(this));
    };

    ImageSize.prototype.render = function(callback) {
      var img;
      this.log('render() is executed');
      if (this.complete) {
        img = new Image();
        img.src = this.el.src;
        this.log("Image '" + this.el.src + "' is loaded");
        this.data.naturalWidth = img.width;
        this.data.naturalHeight = img.height;
        return callback(true, this.data);
      } else {
        this.log("Image '" + this.el.src + "' is NOT ready");
        img = new Image();
        img.src = this.el.src;
        img.onload = (function(_this) {
          return function(e) {
            _this.log("Image '" + img.src + "' is loaded");
            _this.data.naturalWidth = img.width;
            _this.data.naturalHeight = img.height;
            return callback(true, _this.data);
          };
        })(this);
        return img.onerror = (function(_this) {
          return function(e) {
            _this.log("Image '" + img.src + "' is failed to load");
            return callback(false, _this.data);
          };
        })(this);
      }
    };

    return ImageSize;

  })(Stackla.Base);

  if (!window.Stackla) {
    window.Stackla = {};
  }

  Stackla.getImageSize = function(el, callback) {
    return new ImageSize(el, callback);
  };

}).call(this);

(function() {
  var ATTRS, Tagla, proto,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ATTRS = {
    NAME: 'Tagla',
    PREFIX: 'tagla-',
    DRAG_ATTR: {
      containment: '.tagla',
      handle: '.tagla-icon'
    },
    SELECT_ATTR: {
      allow_single_deselect: true,
      placeholder_text_single: 'Select an option',
      width: '310px'
    },
    FORM_TEMPLATE: ['<div class="tagla-form-wrapper">', '    <form class="tagla-form">', '        <div class="tagla-form-title">', '            Select Your Product', '            <a href="javascript:void(0);" class="tagla-form-close">×</a>', '        </div>', '        <input type="hidden" name="x">', '        <input type="hidden" name="y">', '        <select data-placeholder="Search" type="text" name="tag" class="tagla-select chosen-select" placeholder="Search">', '            <option></option>', '            <option value="1">Cockie</option>', '            <option value="2">Kiwi</option>', '            <option value="3">Buddy</option>', '        </select>', '    </form>', '</div>'].join('\n'),
    TAG_TEMPLATE: ['<div class="tagla-tag">', '    <i class="tagla-icon fs fs-tag2"></i>', '    <div class="tagla-dialog">', '    {{#product}}', '        {{#image_small_url}}', '        <div class="tagla-dialog-image">', '          <img src="{{image_small_url}}">', '        </div>', '        {{/image_small_url}}', '        <div class="tagla-dialog-text">', '          <div class="tagla-dialog-edit">', '            <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-edit-link">', '              <i class="fs fs-pencil"></i> Edit', '            </a>', '            <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-delete-link">', '              <i class="fs fs-cross3"></i> Delete', '            </a>', '          </div>', '          <h2 class="tagla-dialog-title">{{tag}}</h2>', '          {{#price}}', '          <div class="tagla-dialog-price">{{price}}</div>', '          {{/price}}', '          {{#description}}', '          <p class="tagla-dialog-description">{{description}}</p>', '          {{/description}}', '          {{#custom_url}}', '          <a href="{{custom_url}}" class="tagla-dialog-button st-btn st-btn-success st-btn-solid" target=""{{target}}">', '            <i class="fs fs-cart"></i>', '            Buy Now', '          </a>', '          {{/custom_url}}', '        </div>', '    {{/product}}', '    </div>', '    {{{form_html}}}', '</div>'].join('\n'),
    NEW_TAG_TEMPLATE: ['<div class="tagla-tag">', '    <i class="tagla-icon fs fs-tag2"></i>', '</div>'].join('\n')
  };

  Tagla = (function(superClass) {
    extend(Tagla, superClass);

    function Tagla($wrapper, options) {
      if (options == null) {
        options = {};
      }
      Tagla.__super__.constructor.call(this);
      this.wrapper = $($wrapper);
      this.init(options);
      this.bind();
    }

    return Tagla;

  })(Stackla.Base);

  $.extend(Tagla, ATTRS);

  proto = {
    toString: function() {
      return 'Tagla';
    },
    _applyTools: function($tag) {
      var $form, $select, drag, tag;
      this.log('_applyTools() is executed');
      drag = new Draggabilly($tag[0], Tagla.DRAG_ATTR);
      drag.on('dragEnd', $.proxy(this.handleTagMove, this));
      $tag.data('draggabilly', drag);
      tag = $tag.data('tag-data');
      $form = $tag.find('.tagla-form');
      $form.find('[name=x]').val(tag.x);
      $form.find('[name=y]').val(tag.y);
      $form.find("[name=tag] option[value=" + tag.value + "]").attr('selected', 'selected');
      $select = $tag.find('.tagla-select');
      $select.chosen2(Tagla.SELECT_ATTR);
      $select.on('change', $.proxy(this.handleTagChange, this));
      return $select.on('chosen:hiding_dropdown', function(e, params) {
        return $select.trigger('chosen:open');
      });
    },
    _disableDrag: function($except) {
      if (this.editor === false) {
        return;
      }
      this.log('_disableDrag() is executed');
      $except = $($except);
      return $('.tagla-tag').each(function() {
        if ($except[0] === this) {
          return;
        }
        return $(this).data('draggabilly').disable();
      });
    },
    _enableDrag: function($except) {
      if (this.editor === false) {
        return;
      }
      this.log('_enableDrag() is executed');
      $except = $($except);
      return $('.tagla-tag').each(function() {
        if ($except[0] === this) {
          return;
        }
        return $(this).data('draggabilly').enable();
      });
    },
    _removeTools: function($tag) {
      var $select;
      $tag.data('draggabilly').destroy();
      $select = $tag.find('.tagla-select');
      $select.show().removeClass('chzn-done');
      return $select.next().remove();
    },
    _getPosition: function($tag) {
      var pos, x, y;
      this.log('_getPosition() is executed');
      pos = $tag.position();
      x = (pos.left + ($tag.width() / 2)) / this.currentWidth * this.naturalWidth;
      y = (pos.top + ($tag.height() / 2)) / this.currentHeight * this.naturalHeight;
      if (this.unit === 'percent') {
        x = x / this.naturalWidth * 100;
        y = y / this.naturalHeight * 100;
      }
      return [x, y];
    },
    _updateImageSize: function(data) {
      this.log('_updateImageSize() is executed');
      this.naturalWidth = data.naturalWidth;
      this.naturalHeight = data.naturalHeight;
      this.currentWidth = data.width;
      this.currentHeight = data.height;
      this.widthRatio = data.widthRatio;
      return this.heightRatio = data.heightRatio;
    },
    handleTagClick: function(e) {
      var $tag;
      e.preventDefault();
      e.stopPropagation();
      if (!$(e.target).hasClass('tagla-icon')) {
        return;
      }
      this.log('handleTagClick() is executed');
      $tag = $(e.currentTarget);
      this.shrink($tag);
      $tag.addClass('tagla-tag-active');
      return $tag.data('draggabilly').enable();
    },
    handleTagChange: function(e, params) {
      var $select, $tag, data, isNew, serialize;
      this.log('handleTagChange() is executed');
      $select = $(e.target);
      $tag = $select.parents('.tagla-tag');
      isNew = $tag.hasClass('tagla-tag-new');
      $tag.removeClass('tagla-tag-choose tagla-tag-active tagla-tag-new');
      data = $.extend({}, $tag.data('tag-data'));
      data.label = $select.find('option:selected').text();
      data.value = $select.val() || data.label;
      serialize = $tag.find('.tagla-form').serialize();
      if (isNew) {
        return this.emit('add', [data, serialize, $tag]);
      } else {
        return this.emit('change', [data, serialize, $tag]);
      }
    },
    handleTagDelete: function(e) {
      var $tag, data;
      this.log('handleTagDelete() is executed');
      e.preventDefault();
      $tag = $(e.currentTarget).parents('.tagla-tag');
      data = $.extend({}, $tag.data('tag-data'));
      return $tag.fadeOut((function(_this) {
        return function() {
          _this._removeTools($tag);
          $tag.remove();
          return _this.emit('delete', [data]);
        };
      })(this));
    },
    handleTagEdit: function(e) {
      var $tag, data;
      this.log('handleTagEdit() is executed');
      e.preventDefault();
      e.stopPropagation();
      $tag = $(e.currentTarget).parents('.tagla-tag');
      $tag.addClass('tagla-tag-choose');
      this.wrapper.addClass('tagla-editing-selecting');
      this._disableDrag($tag);
      $tag.find('.tagla-select').trigger('chosen:open');
      data = $.extend({}, $tag.data('tag-data'));
      return this.emit('edit', [data, $tag]);
    },
    handleTagMove: function(instance, event, pointer) {
      var $form, $tag, data, isNew, pos, serialize;
      this.log('handleTagMove() is executed');
      $tag = $(instance.element);
      data = $tag.data('tag-data');
      pos = this._getPosition($tag);
      data.x = pos[0];
      data.y = pos[1];
      $form = $tag.find('.tagla-form');
      $form.find('[name=x]').val(data.x);
      $form.find('[name=y]').val(data.y);
      serialize = $tag.find('.tagla-form').serialize();
      this.lastDragTime = new Date();
      data = $.extend({}, data);
      isNew = data.id ? false : true;
      return this.emit('move', [data, serialize, $tag, isNew]);
    },
    handleTagMouseEnter: function(e) {
      var $tag, timer;
      this.log('handleTagMouseEnter');
      $tag = $(e.currentTarget);
      timer = $tag.data('timer');
      if (timer) {
        clearTimeout(timer);
      }
      $tag.removeData('timer');
      $tag.addClass('tagla-tag-hover');
      return this.emit('hover', [$tag]);
    },
    handleTagMouseLeave: function(e) {
      var $tag, timer;
      this.log('handleTagMouseLeave');
      $tag = $(e.currentTarget);
      timer = $tag.data('timer');
      if (timer) {
        clearTimeout(timer);
      }
      $tag.removeData('timer');
      timer = setTimeout(function() {
        return $tag.removeClass('tagla-tag-hover');
      }, 300);
      return $tag.data('timer', timer);
    },
    handleWrapperClick: function(e) {
      this.log('handleWrapperClick() is executed');
      if (new Date() - this.lastDragTime > 10) {
        return this.shrink();
      }
    },
    handleImageResize: function(e, data) {
      var prevHeight, prevWidth;
      this.log('handleImageResize() is executed');
      prevWidth = this.currentWidth;
      prevHeight = this.currentHeight;
      $('.tagla-tag').each(function() {
        var $tag, pos, x, y;
        $tag = $(this);
        pos = $tag.position();
        x = (pos.left / prevWidth) * data.width;
        y = (pos.top / prevHeight) * data.height;
        return $tag.css({
          left: x + "px",
          top: y + "px"
        });
      });
      return this._updateImageSize(data);
    },
    addTag: function(tag) {
      var $tag, isNew, offsetX, offsetY, x, y;
      if (tag == null) {
        tag = {};
      }
      this.log('addTag() is executed');
      tag = $.extend({}, tag);
      tag.form_html = this.formHtml;
      $tag = $(Mustache.render(this.tagTemplate, tag));
      isNew = !tag.x && !tag.y;
      if (isNew) {
        $('.tagla-tag').each(function() {
          if ($(this).hasClass('tagla-tag-new') && !$(this).find('[name=tag]').val()) {
            return $(this).fadeOut((function(_this) {
              return function() {
                return _this._removeTools($tag);
              };
            })(this));
          }
        });
      }
      this.wrapper.append($tag);
      if (isNew) {
        tag.x = 50;
        tag.y = 50;
        $tag.addClass('tagla-tag-new tagla-tag-active tagla-tag-choose');
      }
      if (this.unit === 'percent') {
        x = this.currentWidth * (tag.x / 100);
        y = this.currentHeight * (tag.y / 100);
      } else {
        x = tag.x * this.widthRatio;
        y = tag.y * this.heightRatio;
      }
      offsetX = $tag.outerWidth() / 2;
      offsetY = $tag.outerHeight() / 2;
      $tag.css({
        'left': (x - offsetX) + "px",
        'top': (y - offsetY) + "px"
      });
      $tag.data('tag-data', tag);
      if (this.editor) {
        this._applyTools($tag);
        if (isNew) {
          $tag.data('draggabilly').enable();
          $tag.addClass('tagla-tag-choose');
          return setTimeout((function(_this) {
            return function() {
              _this.wrapper.addClass('tagla-editing-selecting');
              $tag.find('.tagla-select').trigger('chosen:open');
              _this._disableDrag($tag);
              return _this.emit('new', [$tag]);
            };
          })(this), 100);
        }
      }
    },
    deleteTag: function($tag) {
      return this.log('deleteTag() is executed');
    },
    edit: function() {
      if (this.editor === true) {
        return;
      }
      this.log('edit() is executed');
      this.wrapper.addClass('tagla-editing');
      $('.tagla-tag').each(function() {
        return this._applyTools($(this));
      });
      return this.editor = true;
    },
    getTags: function() {
      var tags;
      this.log('getTags() is executed');
      tags = [];
      $('.tagla-tag').each(function() {
        var data;
        data = $.extend({}, $(this).data('tag-data'));
        return tags.push($(this).data('tag-data'));
      });
      return tags;
    },
    shrink: function($except) {
      if ($except == null) {
        $except = null;
      }
      if (this.editor === false) {
        return;
      }
      this.log('shrink() is executed');
      $except = $($except);
      $('.tagla-tag').each((function(_this) {
        return function(i, el) {
          var $tag;
          if ($except[0] === el) {
            return;
          }
          $tag = $(el);
          if ($tag.hasClass('tagla-tag-new') && !$tag.find('[name=tag]').val()) {
            $tag.fadeOut(function() {
              $tag.remove();
              return _this._removeTools($tag);
            });
          }
          return $tag.removeClass('tagla-tag-active tagla-tag-choose');
        };
      })(this));
      this.wrapper.removeClass('tagla-editing-selecting');
      return this._enableDrag();
    },
    updateDialog: function($tag, data) {
      var html;
      data = $.extend({}, $tag.data('tag-data'), data);
      data.form_html = this.formHtml;
      html = $(Mustache.render(this.tagTemplate, data)).find('.tagla-dialog').html();
      $tag.find('.tagla-dialog').html(html);
      return $tag.data('tag-data', data);
    },
    unedit: function() {
      if (this.edit === false) {
        return;
      }
      this.log('unedit() is executed');
      $('.tagla-tag').each((function(_this) {
        return function(i, el) {
          return _this._removeTools($(el));
        };
      })(this));
      this.wrapper.removeClass('tagla-editing');
      return this.editor = false;
    },
    init: function(options) {
      var ref;
      this.data = options.data || [];
      this.editor = (ref = options.editor === true) != null ? ref : {
        on: false
      };
      this.formHtml = options.form ? $(options.form) : $(Tagla.FORM_TEMPLATE);
      this.formHtml = this.formHtml.html();
      this.tagTemplate = options.tagTemplate ? $(options.tagTemplate).html() : Tagla.TAG_TEMPLATE;
      this.unit = options.unit === 'percent' ? 'percent' : 'pixel';
      this.imageSize = null;
      this.image = this.wrapper.find('img');
      return this.lastDragTime = new Date();
    },
    bind: function() {
      this.log('bind() is executed');
      return this.wrapper.on('mouseenter', $.proxy(this.handleMouseEnter, this)).on('click', $.proxy(this.handleWrapperClick, this)).on('click', '.tagla-tag-edit-link', $.proxy(this.handleTagEdit, this)).on('click', '.tagla-tag-delete-link', $.proxy(this.handleTagDelete, this)).on('mouseenter', '.tagla-tag', $.proxy(this.handleTagMouseEnter, this)).on('mouseleave', '.tagla-tag', $.proxy(this.handleTagMouseLeave, this));
    },
    render: function() {
      this.log('render() is executed');
      this.image.attr('draggable', false);
      this.imageSize = Stackla.getImageSize(this.image, $.proxy(this.renderFn, this));
      return this.imageSize.on('change', $.proxy(this.handleImageResize, this));
    },
    renderFn: function(success, data) {
      var isSafari, j, len, ref, tag;
      this.log('renderFn() is executed');
      isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
      if (!success) {
        this.log("Failed to load image: " + (this.image.attr('src')), 'error');
        this.destroy();
        return;
      }
      this._updateImageSize(data);
      this.wrapper.addClass('tagla');
      if (isSafari) {
        this.wrapper.addClass('tagla-safari');
      }
      ref = this.data;
      for (j = 0, len = ref.length; j < len; j++) {
        tag = ref[j];
        this.addTag(tag);
      }
      return setTimeout((function(_this) {
        return function() {
          if (_this.editor) {
            _this.wrapper.addClass('tagla-editing');
          }
          return _this.emit('ready', [_this]);
        };
      })(this), 500);
    },
    destroy: function() {
      this.log('destroy() is executed');
      this.wrapper.removeClass('tagla tagla-editing');
      return this.wrapper.find('.tagla-tag').each(function() {
        var $tag;
        $tag = $(this);
        $tag.find('.tagla-select').chosen2('destroy');
        $tag.data('draggabilly').destroy();
        return $tag.remove();
      });
    }
  };

  $.extend(Tagla.prototype, proto);

  if (!window.Stackla) {
    window.Stackla = {};
  }

  window.Stackla.Tagla = Tagla;

}).call(this);
