
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

//# sourceMappingURL=data:application/json;base64,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Q0FERjtBQUFBLE9BUkE7QUFXQSxNQUFBLElBQUcsR0FBSDtlQUFZLE1BQU8sQ0FBQSxHQUFBLEVBQW5CO09BQUEsTUFBQTtlQUE2QixPQUE3QjtPQVpTO0lBQUEsQ0F4Q1gsQ0FBQTs7QUFBQSxtQkFzREEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBbkI7SUFBQSxDQXREUixDQUFBOztnQkFBQTs7TUFMRixDQUFBOztBQThEQSxFQUFBLElBQUEsQ0FBQSxNQUFpQyxDQUFDLE9BQWxDO0FBQUEsSUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixFQUFqQixDQUFBO0dBOURBOztBQUFBLEVBK0RBLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBZixHQUFzQixJQS9EdEIsQ0FBQTtBQUFBIiwiZmlsZSI6ImJhc2UuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiMgQGNsYXNzIFN0YWNrbGEuQmFzZVxuIyMjXG5jbGFzcyBCYXNlXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgZGVidWcgPSBAZ2V0UGFyYW1zKCdkZWJ1ZycpXG4gICAgYXR0cnMgPSBhdHRycyBvciB7fVxuICAgIGlmIGRlYnVnXG4gICAgICBAZGVidWcgPSAoZGVidWcgaXMgJ3RydWUnIG9yIGRlYnVnIGlzICcxJylcbiAgICBlbHNlIGlmIGF0dHJzLmRlYnVnXG4gICAgICBAZGVidWcgPSAoYXR0cnMuZGVidWcgaXMgb24pXG4gICAgZWxzZVxuICAgICAgQGRlYnVnID0gZmFsc2VcbiAgICBAX2xpc3RlbmVycyA9IFtdXG5cbiAgdG9TdHJpbmc6IC0+ICdCYXNlJ1xuXG4gIGxvZzogKG1zZywgdHlwZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBkZWJ1Z1xuICAgIHR5cGUgPSB0eXBlIG9yICdpbmZvJ1xuICAgIGlmIHdpbmRvdy5jb25zb2xlIGFuZCB3aW5kb3cuY29uc29sZVt0eXBlXVxuICAgICAgd2luZG93LmNvbnNvbGVbdHlwZV0gXCJbI3tAdG9TdHJpbmcoKX1dICN7bXNnfVwiXG4gICAgcmV0dXJuXG5cbiAgb246ICh0eXBlLCBjYWxsYmFjaykgLT5cbiAgICBpZiAhdHlwZSBvciAhY2FsbGJhY2tcbiAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCBldmVudCB0eXBlIGFuZCBjYWxsYmFjayBhcmUgcmVxdWlyZWQgcGFyYW1ldGVycycpXG4gICAgQGxvZyAnb24oKSAtIGV2ZW50IFxcJycgKyB0eXBlICsgJ1xcJyBpcyBzdWJzY3JpYmVkJ1xuICAgIEBfbGlzdGVuZXJzW3R5cGVdID0gW10gdW5sZXNzIEBfbGlzdGVuZXJzW3R5cGVdXG4gICAgY2FsbGJhY2suaW5zdGFuY2UgPSBAXG4gICAgQF9saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjaylcbiAgICBjYWxsYmFja1xuXG4gIGVtaXQ6ICh0eXBlLCBkYXRhID0gW10pIC0+XG4gICAgQGxvZyBcImVtaXQoKSAtIGV2ZW50ICcje3R5cGV9JyBpcyB0cmlnZ2VyZWRcIlxuICAgIGRhdGEudW5zaGlmdFxuICAgICAgdHlwZTogdHlwZVxuICAgICAgdGFyZ2V0OiBAXG4gICAgdGhyb3cgbmV3IEVycm9yKCdMYWNrcyBvZiB0eXBlIHBhcmFtZXRlcicpIHVubGVzcyB0eXBlXG4gICAgaWYgQF9saXN0ZW5lcnNbdHlwZV0gYW5kIEBfbGlzdGVuZXJzW3R5cGVdLmxlbmd0aFxuICAgICAgZm9yIGkgb2YgQF9saXN0ZW5lcnNbdHlwZV1cbiAgICAgICAgQF9saXN0ZW5lcnNbdHlwZV1baV0uYXBwbHkgQCwgZGF0YVxuICAgIEBcblxuICBnZXRQYXJhbXM6IChrZXkpIC0+XG4gICAgaHJlZiA9IEBnZXRVcmwoKVxuICAgIHBhcmFtcyA9IHt9XG4gICAgcG9zID0gaHJlZi5pbmRleE9mKCc/JylcbiAgICBAbG9nICdnZXRQYXJhbXMoKSBpcyBleGVjdXRlZCdcbiAgICBpZiBocmVmLmluZGV4T2YoJyMnKSAhPSAtMVxuICAgICAgaGFzaGVzID0gaHJlZi5zbGljZShwb3MgKyAxLCBocmVmLmluZGV4T2YoJyMnKSkuc3BsaXQoJyYnKVxuICAgIGVsc2VcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSkuc3BsaXQoJyYnKVxuICAgIGZvciBpIG9mIGhhc2hlc1xuICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpXG4gICAgICBwYXJhbXNbaGFzaFswXV0gPSBoYXNoWzFdXG4gICAgaWYga2V5IHRoZW4gcGFyYW1zW2tleV0gZWxzZSBwYXJhbXNcblxuICBnZXRVcmw6IC0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG5cbiMgUHJvbW90ZSB0byBnbG9iYWxcbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG53aW5kb3cuU3RhY2tsYS5CYXNlID0gQmFzZVxuIl19
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

//# sourceMappingURL=data:application/json;base64,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QSxHQUFHLENBQUMsT0FBSixHQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxDQUFELEdBQUE7QUFDWixZQUFBLEtBQUMsQ0FBQSxHQUFELENBQUssU0FBQSxHQUFVLEdBQUcsQ0FBQyxHQUFkLEdBQWtCLHFCQUF2QixDQUFBLENBQUE7bUJBQ0EsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsS0FBQyxDQUFBLElBQWpCLEVBRlk7VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxFQWpCaEI7T0FITTtJQUFBLENBaENSLENBQUE7O3FCQUFBOztLQUZzQixPQUFPLENBQUMsS0FBaEMsQ0FBQTs7QUEyREEsRUFBQSxJQUFBLENBQUEsTUFBaUMsQ0FBQyxPQUFsQztBQUFBLElBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsRUFBakIsQ0FBQTtHQTNEQTs7QUFBQSxFQTZEQSxPQUFPLENBQUMsWUFBUixHQUF1QixTQUFDLEVBQUQsRUFBSyxRQUFMLEdBQUE7V0FDakIsSUFBQSxTQUFBLENBQVUsRUFBVixFQUFjLFFBQWQsRUFEaUI7RUFBQSxDQTdEdkIsQ0FBQTtBQUFBIiwiZmlsZSI6ImltYWdlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSW1hZ2VTaXplIGV4dGVuZHMgU3RhY2tsYS5CYXNlXG5cbiAgY29uc3RydWN0b3I6IChlbCwgY2FsbGJhY2spIC0+XG4gICAgc3VwZXIoKVxuICAgIEBpbml0KGVsKVxuICAgIEBiaW5kKClcbiAgICBAcmVuZGVyKGNhbGxiYWNrKVxuICAgIHJldHVybiBAXG5cbiAgdG9TdHJpbmc6ICgpIC0+ICdJbWFnZVNpemUnXG5cbiAgaW5pdDogKGVsKSAtPlxuICAgIEBlbCA9ICQoZWwpWzBdXG4gICAgQGNvbXBsZXRlID0gQGVsLmNvbXBsZXRlXG4gICAgQGRhdGEgPSB7fVxuICAgIEBfdGltZXIgPSBudWxsXG4gICAgQGRhdGEud2lkdGggPSBAZWwud2lkdGhcbiAgICBAZGF0YS5oZWlnaHQgPSBAZWwuaGVpZ2h0XG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBLZWVwIGFuIGV5ZSBvbiByZXNpemUgZXZlbnRcbiAgICAkKHdpbmRvdykucmVzaXplIChlKSA9PlxuICAgICAgaXNFcXVhbCA9IEBlbC53aWR0aCBpcyBAZGF0YS53aWR0aCBhbmQgQGVsLmhlaWdodCBpcyBAZGF0YS5oZWlnaHRcbiAgICAgIHJldHVybiBpZiBpc0VxdWFsXG4gICAgICAkLmV4dGVuZCBAZGF0YSwge1xuICAgICAgICB3aWR0aDogQGVsLndpZHRoXG4gICAgICAgIGhlaWdodDogQGVsLmhlaWdodFxuICAgICAgICB3aWR0aFJhdGlvOiBAZWwud2lkdGggLyBAZGF0YS5uYXR1cmFsV2lkdGhcbiAgICAgICAgaGVpZ2h0UmF0aW86IEBlbC5oZWlnaHQgLyBAZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgICB9XG4gICAgICBAbG9nICdoYW5kbGVSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICAgIEAuZW1pdCgnY2hhbmdlJywgW0BkYXRhXSlcblxuICByZW5kZXI6IChjYWxsYmFjaykgLT5cbiAgICBAbG9nICdyZW5kZXIoKSBpcyBleGVjdXRlZCdcbiAgICAjIEltYWdlIExvYWRlZFxuICAgIGlmIEBjb21wbGV0ZVxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5zcmMgPSBAZWwuc3JjXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIGxvYWRlZFwiXG4gICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgIEBkYXRhLm5hdHVyYWxIZWlnaHQgPSBpbWcuaGVpZ2h0XG4gICAgICBjYWxsYmFjayh0cnVlLCBAZGF0YSlcbiAgICAjIEltYWdlIExvYWRpbmdcbiAgICBlbHNlXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIE5PVCByZWFkeVwiXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgaW1nLnNyYyA9IEBlbC5zcmNcbiAgICAgIGltZy5vbmxvYWQgPSAoZSkgPT5cbiAgICAgICAgQGxvZyBcIkltYWdlICcje2ltZy5zcmN9JyBpcyBsb2FkZWRcIlxuICAgICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgICAgQGRhdGEubmF0dXJhbEhlaWdodCA9IGltZy5oZWlnaHRcbiAgICAgICAgY2FsbGJhY2sodHJ1ZSwgQGRhdGEpXG4gICAgICBpbWcub25lcnJvciA9IChlKSA9PlxuICAgICAgICBAbG9nIFwiSW1hZ2UgJyN7aW1nLnNyY30nIGlzIGZhaWxlZCB0byBsb2FkXCJcbiAgICAgICAgY2FsbGJhY2soZmFsc2UsIEBkYXRhKVxuXG5cbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG5cblN0YWNrbGEuZ2V0SW1hZ2VTaXplID0gKGVsLCBjYWxsYmFjaykgLT5cbiAgbmV3IEltYWdlU2l6ZShlbCwgY2FsbGJhY2spXG4iXX0=
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
