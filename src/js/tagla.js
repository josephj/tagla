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

//# sourceMappingURL=data:application/json;base64,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QUFELENBQUssdUJBQUwsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsQ0FBcUIscUJBQXJCLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxTQUFBLEdBQUE7QUFDL0IsWUFBQSxJQUFBO0FBQUEsUUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBUCxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxTQUFuQyxDQURBLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF3QixDQUFDLE9BQXpCLENBQUEsQ0FGQSxDQUFBO2VBR0EsSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUorQjtNQUFBLENBQWpDLEVBSE87SUFBQSxDQXZVVDtHQXJGRixDQUFBOztBQUFBLEVBcWFBLENBQUMsQ0FBQyxNQUFGLENBQVMsS0FBSyxDQUFBLFNBQWQsRUFBa0IsS0FBbEIsQ0FyYUEsQ0FBQTs7QUFzYUEsRUFBQSxJQUFBLENBQUEsTUFBaUMsQ0FBQyxPQUFsQztBQUFBLElBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsRUFBakIsQ0FBQTtHQXRhQTs7QUFBQSxFQXVhQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsR0FBdUIsS0F2YXZCLENBQUE7QUFBQSIsImZpbGUiOiJ0YWdsYS5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIkFUVFJTID1cbiAgTkFNRTogJ1RhZ2xhJ1xuICBQUkVGSVg6ICd0YWdsYS0nXG4gIERSQUdfQVRUUjpcbiAgICBjb250YWlubWVudDogJy50YWdsYSdcbiAgICBoYW5kbGU6ICcudGFnbGEtaWNvbidcbiAgU0VMRUNUX0FUVFI6XG4gICAgYWxsb3dfc2luZ2xlX2Rlc2VsZWN0OiBvblxuICAgIHBsYWNlaG9sZGVyX3RleHRfc2luZ2xlOiAnU2VsZWN0IGFuIG9wdGlvbidcbiAgICB3aWR0aDogJzMxMHB4J1xuICBGT1JNX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS1mb3JtLXdyYXBwZXJcIj4nXG4gICAgJyAgICA8Zm9ybSBjbGFzcz1cInRhZ2xhLWZvcm1cIj4nXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWZvcm0tdGl0bGVcIj4nXG4gICAgJyAgICAgICAgICAgIFNlbGVjdCBZb3VyIFByb2R1Y3QnXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgY2xhc3M9XCJ0YWdsYS1mb3JtLWNsb3NlXCI+w5c8L2E+J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ4XCI+J1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInlcIj4nXG4gICAgJyAgICAgICAgPHNlbGVjdCBkYXRhLXBsYWNlaG9sZGVyPVwiU2VhcmNoXCIgdHlwZT1cInRleHRcIiBuYW1lPVwidGFnXCIgY2xhc3M9XCJ0YWdsYS1zZWxlY3QgY2hvc2VuLXNlbGVjdFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCI+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uPjwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjFcIj5Db2NraWU8L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIyXCI+S2l3aTwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjNcIj5CdWRkeTwvb3B0aW9uPidcbiAgICAnICAgICAgICA8L3NlbGVjdD4nXG4gICAgJyAgICA8L2Zvcm0+J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbiAgVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nXCI+J1xuICAgICcgICAge3sjcHJvZHVjdH19J1xuICAgICcgICAgICAgIHt7I2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctaW1hZ2VcIj4nXG4gICAgJyAgICAgICAgICA8aW1nIHNyYz1cInt7aW1hZ2Vfc21hbGxfdXJsfX1cIj4nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgIHt7L2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGV4dFwiPidcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZWRpdFwiPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWVkaXQtbGlua1wiPidcbiAgICAnICAgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLXBlbmNpbFwiPjwvaT4gRWRpdCdcbiAgICAnICAgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWRlbGV0ZS1saW5rXCI+J1xuICAgICcgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZnMgZnMtY3Jvc3MzXCI+PC9pPiBEZWxldGUnXG4gICAgJyAgICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAgICA8aDIgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGl0bGVcIj57e3RhZ319PC9oMj4nXG4gICAgJyAgICAgICAgICB7eyNwcmljZX19J1xuICAgICcgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1wcmljZVwiPnt7cHJpY2V9fTwvZGl2PidcbiAgICAnICAgICAgICAgIHt7L3ByaWNlfX0nXG4gICAgJyAgICAgICAgICB7eyNkZXNjcmlwdGlvbn19J1xuICAgICcgICAgICAgICAgPHAgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZGVzY3JpcHRpb25cIj57e2Rlc2NyaXB0aW9ufX08L3A+J1xuICAgICcgICAgICAgICAge3svZGVzY3JpcHRpb259fSdcbiAgICAnICAgICAgICAgIHt7I2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICAgIDxhIGhyZWY9XCJ7e2N1c3RvbV91cmx9fVwiIGNsYXNzPVwidGFnbGEtZGlhbG9nLWJ1dHRvbiBzdC1idG4gc3QtYnRuLXN1Y2Nlc3Mgc3QtYnRuLXNvbGlkXCIgdGFyZ2V0PVwiXCJ7e3RhcmdldH19XCI+J1xuICAgICcgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLWNhcnRcIj48L2k+J1xuICAgICcgICAgICAgICAgICBCdXkgTm93J1xuICAgICcgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgIHt7L2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICB7ey9wcm9kdWN0fX0nXG4gICAgJyAgICA8L2Rpdj4nXG4gICAgJyAgICB7e3tmb3JtX2h0bWx9fX0nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuICBORVdfVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuXG5jbGFzcyBUYWdsYSBleHRlbmRzIFN0YWNrbGEuQmFzZVxuICBjb25zdHJ1Y3RvcjogKCR3cmFwcGVyLCBvcHRpb25zID0ge30pIC0+XG4gICAgc3VwZXIoKVxuICAgIEB3cmFwcGVyID0gJCgkd3JhcHBlcilcbiAgICBAaW5pdChvcHRpb25zKVxuICAgIEBiaW5kKClcblxuJC5leHRlbmQoVGFnbGEsIEFUVFJTKVxuXG5wcm90byA9XG4gICMjIyMjIyMjIyMjIyMjXG4gICMgVXRpbGl0aWVzXG4gICMjIyMjIyMjIyMjIyMjXG4gIHRvU3RyaW5nOiAtPiAnVGFnbGEnXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgUHJpdmF0ZSBNZXRob2RzXG4gICMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIEluaXRpYWxpemUgZHJhZyBhbmQgc2VsZWN0IGxpYnMgZm9yIGEgc2luZ2xlIHRhZ1xuICBfYXBwbHlUb29sczogKCR0YWcpIC0+XG4gICAgQGxvZyAnX2FwcGx5VG9vbHMoKSBpcyBleGVjdXRlZCdcbiAgICBkcmFnID0gbmV3IERyYWdnYWJpbGx5KCR0YWdbMF0sIFRhZ2xhLkRSQUdfQVRUUilcbiAgICBkcmFnLm9uICdkcmFnRW5kJywgJC5wcm94eShAaGFuZGxlVGFnTW92ZSwgQClcbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JywgZHJhZylcbiAgICAjIFVwZGF0ZSBmb3JtXG4gICAgdGFnID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbCh0YWcueClcbiAgICAkZm9ybS5maW5kKCdbbmFtZT15XScpLnZhbCh0YWcueSlcbiAgICAkZm9ybS5maW5kKFwiW25hbWU9dGFnXSBvcHRpb25bdmFsdWU9I3t0YWcudmFsdWV9XVwiKS5hdHRyKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpXG4gICAgJHNlbGVjdCA9ICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpXG4gICAgJHNlbGVjdC5jaG9zZW4yKFRhZ2xhLlNFTEVDVF9BVFRSKVxuICAgICRzZWxlY3Qub24gJ2NoYW5nZScsICQucHJveHkoQGhhbmRsZVRhZ0NoYW5nZSwgQClcbiAgICAkc2VsZWN0Lm9uICdjaG9zZW46aGlkaW5nX2Ryb3Bkb3duJywgKGUsIHBhcmFtcykgLT5cbiAgICAgICRzZWxlY3QudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuXG4gIF9kaXNhYmxlRHJhZzogKCRleGNlcHQpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnX2Rpc2FibGVEcmFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgcmV0dXJuIGlmICRleGNlcHRbMF0gaXMgQFxuICAgICAgJChAKS5kYXRhKCdkcmFnZ2FiaWxseScpLmRpc2FibGUoKTtcblxuICBfZW5hYmxlRHJhZzogKCRleGNlcHQpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnX2VuYWJsZURyYWcoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBAXG4gICAgICAkKEApLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKCk7XG5cbiAgX3JlbW92ZVRvb2xzOiAoJHRhZykgLT5cbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGVzdHJveSgpXG4gICAgJHNlbGVjdCA9ICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpXG4gICAgJHNlbGVjdC5zaG93KCkucmVtb3ZlQ2xhc3MgJ2Noem4tZG9uZSdcbiAgICAkc2VsZWN0Lm5leHQoKS5yZW1vdmUoKVxuXG4gIF9nZXRQb3NpdGlvbjogKCR0YWcpIC0+XG4gICAgQGxvZyAnX2dldFBvc2l0aW9uKCkgaXMgZXhlY3V0ZWQnXG4gICAgcG9zID0gJHRhZy5wb3NpdGlvbigpXG4gICAgeCA9IChwb3MubGVmdCArICgkdGFnLndpZHRoKCkgLyAyKSkgLyBAY3VycmVudFdpZHRoICogQG5hdHVyYWxXaWR0aFxuICAgIHkgPSAocG9zLnRvcCArICgkdGFnLmhlaWdodCgpIC8gMikpIC8gQGN1cnJlbnRIZWlnaHQgKiBAbmF0dXJhbEhlaWdodFxuICAgIGlmIEB1bml0IGlzICdwZXJjZW50J1xuICAgICAgeCA9IHggLyBAbmF0dXJhbFdpZHRoICogMTAwXG4gICAgICB5ID0geSAvIEBuYXR1cmFsSGVpZ2h0ICogMTAwXG4gICAgW3gsIHldXG5cbiAgX3VwZGF0ZUltYWdlU2l6ZTogKGRhdGEpIC0+XG4gICAgQGxvZyAnX3VwZGF0ZUltYWdlU2l6ZSgpIGlzIGV4ZWN1dGVkJ1xuICAgIEBuYXR1cmFsV2lkdGggPSBkYXRhLm5hdHVyYWxXaWR0aFxuICAgIEBuYXR1cmFsSGVpZ2h0ID0gZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgQGN1cnJlbnRXaWR0aCA9IGRhdGEud2lkdGhcbiAgICBAY3VycmVudEhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgQHdpZHRoUmF0aW8gPSBkYXRhLndpZHRoUmF0aW9cbiAgICBAaGVpZ2h0UmF0aW8gPSBkYXRhLmhlaWdodFJhdGlvXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBFdmVudCBIYW5kbGVyc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBoYW5kbGVUYWdDbGljazogKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJldHVybiB1bmxlc3MgJChlLnRhcmdldCkuaGFzQ2xhc3MoJ3RhZ2xhLWljb24nKVxuICAgIEBsb2cgJ2hhbmRsZVRhZ0NsaWNrKCkgaXMgZXhlY3V0ZWQnXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuICAgIEBzaHJpbmsoJHRhZylcbiAgICAkdGFnLmFkZENsYXNzKCd0YWdsYS10YWctYWN0aXZlJylcbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKClcblxuICBoYW5kbGVUYWdDaGFuZ2U6IChlLCBwYXJhbXMpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnQ2hhbmdlKCkgaXMgZXhlY3V0ZWQnXG4gICAgJHNlbGVjdCA9ICQoZS50YXJnZXQpXG4gICAgJHRhZyA9ICRzZWxlY3QucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgaXNOZXcgPSAkdGFnLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JylcbiAgICAkdGFnLnJlbW92ZUNsYXNzICd0YWdsYS10YWctY2hvb3NlIHRhZ2xhLXRhZy1hY3RpdmUgdGFnbGEtdGFnLW5ldydcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICBkYXRhLmxhYmVsID0gJHNlbGVjdC5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS50ZXh0KClcbiAgICBkYXRhLnZhbHVlID0gJHNlbGVjdC52YWwoKSB8fCBkYXRhLmxhYmVsXG4gICAgc2VyaWFsaXplID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpLnNlcmlhbGl6ZSgpXG4gICAgaWYgaXNOZXdcbiAgICAgIEBlbWl0KCdhZGQnLCBbZGF0YSwgc2VyaWFsaXplLCAkdGFnXSlcbiAgICBlbHNlXG4gICAgICBAZW1pdCgnY2hhbmdlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG5cbiAgaGFuZGxlVGFnRGVsZXRlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdEZWxldGUoKSBpcyBleGVjdXRlZCdcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmUoKVxuICAgICAgQGVtaXQoJ2RlbGV0ZScsIFtkYXRhXSlcblxuICBoYW5kbGVUYWdFZGl0OiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdFZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIEBlbWl0KCdlZGl0JywgW2RhdGEsICR0YWddKVxuXG4gIGhhbmRsZVRhZ01vdmU6IChpbnN0YW5jZSwgZXZlbnQsIHBvaW50ZXIpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW92ZSgpIGlzIGV4ZWN1dGVkJ1xuXG4gICAgJHRhZyA9ICQoaW5zdGFuY2UuZWxlbWVudClcbiAgICBkYXRhID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgcG9zID0gQF9nZXRQb3NpdGlvbigkdGFnKVxuICAgIGRhdGEueCA9IHBvc1swXVxuICAgIGRhdGEueSA9IHBvc1sxXVxuXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbChkYXRhLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwoZGF0YS55KVxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcbiAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpXG4gICAgaXNOZXcgPSBpZiBkYXRhLmlkIHRoZW4gbm8gZWxzZSB5ZXNcbiAgICBAZW1pdCgnbW92ZScsIFtkYXRhLCBzZXJpYWxpemUsICR0YWcsIGlzTmV3XSlcblxuICBoYW5kbGVUYWdNb3VzZUVudGVyOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUVudGVyJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gICR0YWcuZGF0YSgndGltZXInKVxuICAgIGNsZWFyVGltZW91dCh0aW1lcikgaWYgdGltZXJcbiAgICAkdGFnLnJlbW92ZURhdGEoJ3RpbWVyJylcblxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgQGVtaXQoJ2hvdmVyJywgWyR0YWddKVxuXG4gIGhhbmRsZVRhZ01vdXNlTGVhdmU6IChlKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdXNlTGVhdmUnXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXG4gICAgIyBDbGVhciBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSAkdGFnLmRhdGEoJ3RpbWVyJylcbiAgICBjbGVhclRpbWVvdXQodGltZXIpIGlmIHRpbWVyXG4gICAgJHRhZy5yZW1vdmVEYXRhKCd0aW1lcicpXG5cbiAgICAjIFNhdmUgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gc2V0VGltZW91dCAtPlxuICAgICAgJHRhZy5yZW1vdmVDbGFzcygndGFnbGEtdGFnLWhvdmVyJylcbiAgICAsIDMwMFxuICAgICR0YWcuZGF0YSgndGltZXInLCB0aW1lcilcblxuICBoYW5kbGVXcmFwcGVyQ2xpY2s6IChlKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVdyYXBwZXJDbGljaygpIGlzIGV4ZWN1dGVkJ1xuICAgICMgSGFjayB0byBhdm9pZCB0cmlnZ2VyaW5nIGNsaWNrIGV2ZW50XG4gICAgQHNocmluaygpIGlmIChuZXcgRGF0ZSgpIC0gQGxhc3REcmFnVGltZSA+IDEwKVxuXG4gIGhhbmRsZUltYWdlUmVzaXplOiAoZSwgZGF0YSkgLT5cbiAgICBAbG9nICdoYW5kbGVJbWFnZVJlc2l6ZSgpIGlzIGV4ZWN1dGVkJ1xuICAgIHByZXZXaWR0aCA9IEBjdXJyZW50V2lkdGhcbiAgICBwcmV2SGVpZ2h0ID0gQGN1cnJlbnRIZWlnaHRcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgJHRhZyA9ICQoQClcbiAgICAgIHBvcyA9ICR0YWcucG9zaXRpb24oKVxuICAgICAgeCA9IChwb3MubGVmdCAvIHByZXZXaWR0aCkgKiBkYXRhLndpZHRoXG4gICAgICB5ID0gKHBvcy50b3AgLyBwcmV2SGVpZ2h0KSAqIGRhdGEuaGVpZ2h0XG4gICAgICAkdGFnLmNzc1xuICAgICAgICBsZWZ0OiBcIiN7eH1weFwiXG4gICAgICAgIHRvcDogXCIje3l9cHhcIlxuICAgIEBfdXBkYXRlSW1hZ2VTaXplKGRhdGEpXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBQdWJsaWMgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBhZGRUYWc6ICh0YWcgPSB7fSkgLT5cbiAgICBAbG9nICdhZGRUYWcoKSBpcyBleGVjdXRlZCdcbiAgICAjIFJlbmRlciB0YWcgZWxlbWVudCBieSBwcm92aWRlZCB0ZW1wbGF0ZVxuICAgIHRhZyA9ICQuZXh0ZW5kKHt9LCB0YWcpXG4gICAgdGFnLmZvcm1faHRtbCA9IEBmb3JtSHRtbFxuICAgICR0YWcgPSAkKE11c3RhY2hlLnJlbmRlcihAdGFnVGVtcGxhdGUsIHRhZykpXG4gICAgaXNOZXcgPSAoIXRhZy54IGFuZCAhdGFnLnkpXG5cbiAgICAjIFJlbW92ZSBwcmV2aW91cyBhZGRlZCBuZXcgdGFnIGlmIGl0IGhhc24ndCBiZWluZyBzZXRcbiAgICBpZiBpc05ld1xuICAgICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgICAgaWYgJChAKS5oYXNDbGFzcygndGFnbGEtdGFnLW5ldycpIGFuZCAhJChAKS5maW5kKCdbbmFtZT10YWddJykudmFsKClcbiAgICAgICAgICAkKEApLmZhZGVPdXQgPT5cbiAgICAgICAgICAgIEBfcmVtb3ZlVG9vbHMoJHRhZylcblxuICAgIEB3cmFwcGVyLmFwcGVuZCgkdGFnKVxuICAgIGlmIGlzTmV3ICMgRGVmYXVsdCBwb3NpdGlvbiBmb3IgbmV3IHRhZ1xuICAgICAgIyBUT0RPIC0gTmVlZCBhIHNtYXJ0IHdheSB0byBhdm9pZCBjb2xsaXNpb25cbiAgICAgIHRhZy54ID0gNTBcbiAgICAgIHRhZy55ID0gNTBcbiAgICAgICR0YWcuYWRkQ2xhc3MgJ3RhZ2xhLXRhZy1uZXcgdGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctY2hvb3NlJ1xuICAgIGlmIEB1bml0IGlzICdwZXJjZW50J1xuICAgICAgeCA9IEBjdXJyZW50V2lkdGggKiAodGFnLnggLyAxMDApXG4gICAgICB5ID0gQGN1cnJlbnRIZWlnaHQgKiAodGFnLnkgLyAxMDApXG4gICAgZWxzZVxuICAgICAgeCA9IHRhZy54ICogQHdpZHRoUmF0aW9cbiAgICAgIHkgPSB0YWcueSAqIEBoZWlnaHRSYXRpb1xuICAgIG9mZnNldFggPSAkdGFnLm91dGVyV2lkdGgoKSAvIDJcbiAgICBvZmZzZXRZID0gJHRhZy5vdXRlckhlaWdodCgpIC8gMlxuICAgICR0YWcuY3NzXG4gICAgICAnbGVmdCc6IFwiI3t4IC0gb2Zmc2V0WH1weFwiXG4gICAgICAndG9wJzogXCIje3kgLSBvZmZzZXRZfXB4XCJcbiAgICAjIFNhdmUgdGFnIGRhdGEgdG8gZGF0YSBhdHRyIGZvciBlYXN5IGFjY2Vzc1xuICAgICR0YWcuZGF0YSgndGFnLWRhdGEnLCB0YWcpXG4gICAgIyBSZW5kZXIgdGFnIGVkaXRvciB0b29sc1xuICAgIGlmIEBlZGl0b3JcbiAgICAgIEBfYXBwbHlUb29scygkdGFnKVxuICAgICAgaWYgaXNOZXdcbiAgICAgICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpXG4gICAgICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1jaG9vc2UnKVxuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICAgICAgICAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKS50cmlnZ2VyICdjaG9zZW46b3BlbidcbiAgICAgICAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgICAgICAgQGVtaXQoJ25ldycsIFskdGFnXSlcbiAgICAgICAgLCAxMDBcblxuICBkZWxldGVUYWc6ICgkdGFnKSAtPlxuICAgIEBsb2cgJ2RlbGV0ZVRhZygpIGlzIGV4ZWN1dGVkJ1xuXG4gIGVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb25cbiAgICBAbG9nICdlZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmcnKVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+IEBfYXBwbHlUb29scygkKEApKVxuICAgIEBlZGl0b3IgPSBvblxuXG4gIGdldFRhZ3M6IC0+XG4gICAgQGxvZyAnZ2V0VGFncygpIGlzIGV4ZWN1dGVkJ1xuICAgIHRhZ3MgPSBbXVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICBkYXRhID0gJC5leHRlbmQoe30sICQoQCkuZGF0YSgndGFnLWRhdGEnKSlcbiAgICAgIHRhZ3MucHVzaCAkKEApLmRhdGEoJ3RhZy1kYXRhJylcbiAgICB0YWdzXG5cbiAgIyBTaHJpbmsgZXZlcnl0aGluZyBleGNlcHQgdGhlICRleGNlcHRcbiAgc2hyaW5rOiAoJGV4Y2VwdCA9IG51bGwpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnc2hyaW5rKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAoaSwgZWwpID0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBlbFxuICAgICAgJHRhZyA9ICQoZWwpXG4gICAgICBpZiAkdGFnLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JykgYW5kICEkdGFnLmZpbmQoJ1tuYW1lPXRhZ10nKS52YWwoKVxuICAgICAgICAkdGFnLmZhZGVPdXQgPT5cbiAgICAgICAgICAkdGFnLnJlbW92ZSgpXG4gICAgICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmVDbGFzcyAndGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctY2hvb3NlJ1xuICAgIEB3cmFwcGVyLnJlbW92ZUNsYXNzICd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZydcbiAgICBAX2VuYWJsZURyYWcoKVxuXG4gIHVwZGF0ZURpYWxvZzogKCR0YWcsIGRhdGEpIC0+XG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCAkdGFnLmRhdGEoJ3RhZy1kYXRhJyksIGRhdGEpXG4gICAgZGF0YS5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICBodG1sID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCBkYXRhKSkuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoKVxuICAgICR0YWcuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoaHRtbClcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgZGF0YSlcblxuICB1bmVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0IGlzIG9mZlxuICAgIEBsb2cgJ3VuZWRpdCgpIGlzIGV4ZWN1dGVkJ1xuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIEBfcmVtb3ZlVG9vbHMoJChlbCkpXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmcnXG4gICAgQGVkaXRvciA9IG9mZlxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgTGlmZWN5Y2xlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgaW5pdDogKG9wdGlvbnMpIC0+XG4gICAgIyBDb25maWd1cmUgT3B0aW9uc1xuICAgIEBkYXRhID0gb3B0aW9ucy5kYXRhIHx8IFtdXG4gICAgQGVkaXRvciA9IChvcHRpb25zLmVkaXRvciBpcyBvbikgPyBvbiA6IGZhbHNlXG4gICAgQGZvcm1IdG1sID0gaWYgb3B0aW9ucy5mb3JtIHRoZW4gJChvcHRpb25zLmZvcm0pIGVsc2UgJChUYWdsYS5GT1JNX1RFTVBMQVRFKVxuICAgIEBmb3JtSHRtbCA9IEBmb3JtSHRtbC5odG1sKClcbiAgICBAdGFnVGVtcGxhdGUgPSBpZiBvcHRpb25zLnRhZ1RlbXBsYXRlIHRoZW4gJChvcHRpb25zLnRhZ1RlbXBsYXRlKS5odG1sKCkgZWxzZSBUYWdsYS5UQUdfVEVNUExBVEVcbiAgICBAdW5pdCA9IGlmIG9wdGlvbnMudW5pdCBpcyAncGVyY2VudCcgdGhlbiAncGVyY2VudCcgZWxzZSAncGl4ZWwnXG4gICAgIyBBdHRyaWJ1dGVzXG4gICAgQGltYWdlU2l6ZSA9IG51bGxcbiAgICBAaW1hZ2UgPSBAd3JhcHBlci5maW5kKCdpbWcnKVxuICAgIEBsYXN0RHJhZ1RpbWUgPSBuZXcgRGF0ZSgpXG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXJcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICQucHJveHkoQGhhbmRsZU1vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ2NsaWNrJywgJC5wcm94eShAaGFuZGxlV3JhcHBlckNsaWNrLCBAKVxuICAgICAgLm9uICdjbGljaycsICcudGFnbGEtdGFnLWVkaXQtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0VkaXQsIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZGVsZXRlLWxpbmsnLCAkLnByb3h5KEBoYW5kbGVUYWdEZWxldGUsIEApXG4gICAgICAub24gJ21vdXNlZW50ZXInLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ21vdXNlbGVhdmUnLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlTGVhdmUsIEApXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBsb2cgJ3JlbmRlcigpIGlzIGV4ZWN1dGVkJ1xuICAgIEBpbWFnZS5hdHRyKCdkcmFnZ2FibGUnLCBmYWxzZSlcbiAgICBAaW1hZ2VTaXplID0gU3RhY2tsYS5nZXRJbWFnZVNpemUoQGltYWdlLCAkLnByb3h5KEByZW5kZXJGbiwgQCkpXG4gICAgQGltYWdlU2l6ZS5vbignY2hhbmdlJywgJC5wcm94eShAaGFuZGxlSW1hZ2VSZXNpemUsIEApKVxuXG4gIHJlbmRlckZuOiAoc3VjY2VzcywgZGF0YSkgLT5cbiAgICBAbG9nICdyZW5kZXJGbigpIGlzIGV4ZWN1dGVkJ1xuICAgIGlzU2FmYXJpID0gL1NhZmFyaS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSBhbmRcbiAgICAgICAgICAgICAgIC9BcHBsZSBDb21wdXRlci8udGVzdChuYXZpZ2F0b3IudmVuZG9yKVxuICAgIHVubGVzcyBzdWNjZXNzICMgU3RvcCBpZiBpbWFnZSBpcyBmYWlsZWQgdG8gbG9hZFxuICAgICAgQGxvZyhcIkZhaWxlZCB0byBsb2FkIGltYWdlOiAje0BpbWFnZS5hdHRyKCdzcmMnKX1cIiwgJ2Vycm9yJylcbiAgICAgIEBkZXN0cm95KClcbiAgICAgIHJldHVyblxuICAgIEBfdXBkYXRlSW1hZ2VTaXplKGRhdGEpICMgU2F2ZSBkaW1lbnNpb25cbiAgICBAd3JhcHBlci5hZGRDbGFzcyAndGFnbGEnICMgQXBwbHkgbmVjZXNzYXJ5IGNsYXNzIG5hbWVzXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MgJ3RhZ2xhLXNhZmFyaScgaWYgaXNTYWZhcmkgIyBBdm9pZCBhbmltYXRpb25cbiAgICBAYWRkVGFnIHRhZyBmb3IgdGFnIGluIEBkYXRhICMgQ3JlYXRlIHRhZ3NcbiAgICBzZXRUaW1lb3V0ID0+XG4gICAgICBAd3JhcHBlci5hZGRDbGFzcyAndGFnbGEtZWRpdGluZycgaWYgQGVkaXRvclxuICAgICAgQGVtaXQoJ3JlYWR5JywgW0BdKVxuICAgICwgNTAwXG5cbiAgZGVzdHJveTogLT5cbiAgICBAbG9nICdkZXN0cm95KCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhIHRhZ2xhLWVkaXRpbmcnXG4gICAgQHdyYXBwZXIuZmluZCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgICR0YWcgPSAkKEApXG4gICAgICAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKS5jaG9zZW4yICdkZXN0cm95J1xuICAgICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmRlc3Ryb3koKVxuICAgICAgJHRhZy5yZW1vdmUoKVxuXG4kLmV4dGVuZChUYWdsYTo6LCBwcm90bylcbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG53aW5kb3cuU3RhY2tsYS5UYWdsYSA9IFRhZ2xhXG5cbiJdfQ==