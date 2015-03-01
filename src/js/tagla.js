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
      return this.emit('edit', [data]);
    },
    handleTagMove: function(instance, event, pointer) {
      var $form, $tag, data, pos, serialize;
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
      if (data.id) {
        return this.emit('move', [data, serialize, $tag]);
      }
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
      return $tag.addClass('tagla-tag-hover');
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
              return _this._disableDrag($tag);
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

//# sourceMappingURL=data:application/json;base64,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LElBQUksQ0FBQyxJQUFMLENBQVUsZUFBVixDQUEwQixDQUFDLE9BQTNCLENBQW1DLFNBQW5DLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxhQUFWLENBQXdCLENBQUMsT0FBekIsQ0FBQSxDQUZBLENBQUE7ZUFHQSxJQUFJLENBQUMsTUFBTCxDQUFBLEVBSitCO01BQUEsQ0FBakMsRUFITztJQUFBLENBblVUO0dBckZGLENBQUE7O0FBQUEsRUFpYUEsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxLQUFLLENBQUEsU0FBZCxFQUFrQixLQUFsQixDQWphQSxDQUFBOztBQWthQSxFQUFBLElBQUEsQ0FBQSxNQUFpQyxDQUFDLE9BQWxDO0FBQUEsSUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixFQUFqQixDQUFBO0dBbGFBOztBQUFBLEVBbWFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBZixHQUF1QixLQW5hdkIsQ0FBQTtBQUFBIiwiZmlsZSI6InRhZ2xhLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiQVRUUlMgPVxuICBOQU1FOiAnVGFnbGEnXG4gIFBSRUZJWDogJ3RhZ2xhLSdcbiAgRFJBR19BVFRSOlxuICAgIGNvbnRhaW5tZW50OiAnLnRhZ2xhJ1xuICAgIGhhbmRsZTogJy50YWdsYS1pY29uJ1xuICBTRUxFQ1RfQVRUUjpcbiAgICBhbGxvd19zaW5nbGVfZGVzZWxlY3Q6IG9uXG4gICAgcGxhY2Vob2xkZXJfdGV4dF9zaW5nbGU6ICdTZWxlY3QgYW4gb3B0aW9uJ1xuICAgIHdpZHRoOiAnMzEwcHgnXG4gIEZPUk1fVEVNUExBVEU6IFtcbiAgICAnPGRpdiBjbGFzcz1cInRhZ2xhLWZvcm0td3JhcHBlclwiPidcbiAgICAnICAgIDxmb3JtIGNsYXNzPVwidGFnbGEtZm9ybVwiPidcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZm9ybS10aXRsZVwiPidcbiAgICAnICAgICAgICAgICAgU2VsZWN0IFlvdXIgUHJvZHVjdCdcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKTtcIiBjbGFzcz1cInRhZ2xhLWZvcm0tY2xvc2VcIj7DlzwvYT4nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInhcIj4nXG4gICAgJyAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwieVwiPidcbiAgICAnICAgICAgICA8c2VsZWN0IGRhdGEtcGxhY2Vob2xkZXI9XCJTZWFyY2hcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJ0YWdcIiBjbGFzcz1cInRhZ2xhLXNlbGVjdCBjaG9zZW4tc2VsZWN0XCIgcGxhY2Vob2xkZXI9XCJTZWFyY2hcIj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24+PC9vcHRpb24+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMVwiPkNvY2tpZTwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjJcIj5LaXdpPC9vcHRpb24+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiM1wiPkJ1ZGR5PC9vcHRpb24+J1xuICAgICcgICAgICAgIDwvc2VsZWN0PidcbiAgICAnICAgIDwvZm9ybT4nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuICBUQUdfVEVNUExBVEU6IFtcbiAgICAnPGRpdiBjbGFzcz1cInRhZ2xhLXRhZ1wiPidcbiAgICAnICAgIDxpIGNsYXNzPVwidGFnbGEtaWNvbiBmcyBmcy10YWcyXCI+PC9pPidcbiAgICAnICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2dcIj4nXG4gICAgJyAgICB7eyNwcm9kdWN0fX0nXG4gICAgJyAgICAgICAge3sjaW1hZ2Vfc21hbGxfdXJsfX0nXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1pbWFnZVwiPidcbiAgICAnICAgICAgICAgIDxpbWcgc3JjPVwie3tpbWFnZV9zbWFsbF91cmx9fVwiPidcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAge3svaW1hZ2Vfc21hbGxfdXJsfX0nXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy10ZXh0XCI+J1xuICAgICcgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1lZGl0XCI+J1xuICAgICcgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJ0YWdsYS10YWctbGluayB0YWdsYS10YWctZWRpdC1saW5rXCI+J1xuICAgICcgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZnMgZnMtcGVuY2lsXCI+PC9pPiBFZGl0J1xuICAgICcgICAgICAgICAgICA8L2E+J1xuICAgICcgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgY2xhc3M9XCJ0YWdsYS10YWctbGluayB0YWdsYS10YWctZGVsZXRlLWxpbmtcIj4nXG4gICAgJyAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmcyBmcy1jcm9zczNcIj48L2k+IERlbGV0ZSdcbiAgICAnICAgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICAgIDxoMiBjbGFzcz1cInRhZ2xhLWRpYWxvZy10aXRsZVwiPnt7dGFnfX08L2gyPidcbiAgICAnICAgICAgICAgIHt7I3ByaWNlfX0nXG4gICAgJyAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLXByaWNlXCI+e3twcmljZX19PC9kaXY+J1xuICAgICcgICAgICAgICAge3svcHJpY2V9fSdcbiAgICAnICAgICAgICAgIHt7I2Rlc2NyaXB0aW9ufX0nXG4gICAgJyAgICAgICAgICA8cCBjbGFzcz1cInRhZ2xhLWRpYWxvZy1kZXNjcmlwdGlvblwiPnt7ZGVzY3JpcHRpb259fTwvcD4nXG4gICAgJyAgICAgICAgICB7ey9kZXNjcmlwdGlvbn19J1xuICAgICcgICAgICAgICAge3sjY3VzdG9tX3VybH19J1xuICAgICcgICAgICAgICAgPGEgaHJlZj1cInt7Y3VzdG9tX3VybH19XCIgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctYnV0dG9uIHN0LWJ0biBzdC1idG4tc3VjY2VzcyBzdC1idG4tc29saWRcIiB0YXJnZXQ9XCJcInt7dGFyZ2V0fX1cIj4nXG4gICAgJyAgICAgICAgICAgIDxpIGNsYXNzPVwiZnMgZnMtY2FydFwiPjwvaT4nXG4gICAgJyAgICAgICAgICAgIEJ1eSBOb3cnXG4gICAgJyAgICAgICAgICA8L2E+J1xuICAgICcgICAgICAgICAge3svY3VzdG9tX3VybH19J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgIHt7L3Byb2R1Y3R9fSdcbiAgICAnICAgIDwvZGl2PidcbiAgICAnICAgIHt7e2Zvcm1faHRtbH19fSdcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG4gIE5FV19UQUdfVEVNUExBVEU6IFtcbiAgICAnPGRpdiBjbGFzcz1cInRhZ2xhLXRhZ1wiPidcbiAgICAnICAgIDxpIGNsYXNzPVwidGFnbGEtaWNvbiBmcyBmcy10YWcyXCI+PC9pPidcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG5cbmNsYXNzIFRhZ2xhIGV4dGVuZHMgU3RhY2tsYS5CYXNlXG4gIGNvbnN0cnVjdG9yOiAoJHdyYXBwZXIsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBzdXBlcigpXG4gICAgQHdyYXBwZXIgPSAkKCR3cmFwcGVyKVxuICAgIEBpbml0KG9wdGlvbnMpXG4gICAgQGJpbmQoKVxuXG4kLmV4dGVuZChUYWdsYSwgQVRUUlMpXG5cbnByb3RvID1cbiAgIyMjIyMjIyMjIyMjIyNcbiAgIyBVdGlsaXRpZXNcbiAgIyMjIyMjIyMjIyMjIyNcbiAgdG9TdHJpbmc6IC0+ICdUYWdsYSdcblxuICAjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBQcml2YXRlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgSW5pdGlhbGl6ZSBkcmFnIGFuZCBzZWxlY3QgbGlicyBmb3IgYSBzaW5nbGUgdGFnXG4gIF9hcHBseVRvb2xzOiAoJHRhZykgLT5cbiAgICBkcmFnID0gbmV3IERyYWdnYWJpbGx5KCR0YWdbMF0sIFRhZ2xhLkRSQUdfQVRUUilcbiAgICBkcmFnLm9uICdkcmFnRW5kJywgJC5wcm94eShAaGFuZGxlVGFnTW92ZSwgQClcbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JywgZHJhZylcbiAgICAjIFVwZGF0ZSBmb3JtXG4gICAgdGFnID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbCh0YWcueClcbiAgICAkZm9ybS5maW5kKCdbbmFtZT15XScpLnZhbCh0YWcueSlcbiAgICAkZm9ybS5maW5kKFwiW25hbWU9dGFnXSBvcHRpb25bdmFsdWU9I3t0YWcudmFsdWV9XVwiKS5hdHRyKCdzZWxlY3RlZCcsICdzZWxlY3RlZCcpXG4gICAgJHNlbGVjdCA9ICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpXG4gICAgJHNlbGVjdC5jaG9zZW4yKFRhZ2xhLlNFTEVDVF9BVFRSKVxuICAgICRzZWxlY3Qub24gJ2NoYW5nZScsICQucHJveHkoQGhhbmRsZVRhZ0NoYW5nZSwgQClcbiAgICAkc2VsZWN0Lm9uICdjaG9zZW46aGlkaW5nX2Ryb3Bkb3duJywgKGUsIHBhcmFtcykgLT5cbiAgICAgICRzZWxlY3QudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuXG4gIF9kaXNhYmxlRHJhZzogKCRleGNlcHQpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnX2Rpc2FibGVEcmFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgcmV0dXJuIGlmICRleGNlcHRbMF0gaXMgQFxuICAgICAgJChAKS5kYXRhKCdkcmFnZ2FiaWxseScpLmRpc2FibGUoKTtcblxuICBfZW5hYmxlRHJhZzogKCRleGNlcHQpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnX2VuYWJsZURyYWcoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBAXG4gICAgICAkKEApLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKCk7XG5cbiAgX3JlbW92ZVRvb2xzOiAoJHRhZykgLT5cbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGVzdHJveSgpXG4gICAgJHNlbGVjdCA9ICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpXG4gICAgJHNlbGVjdC5zaG93KCkucmVtb3ZlQ2xhc3MgJ2Noem4tZG9uZSdcbiAgICAkc2VsZWN0Lm5leHQoKS5yZW1vdmUoKVxuXG4gIF9nZXRQb3NpdGlvbjogKCR0YWcpIC0+XG4gICAgQGxvZyAnX2dldFBvc2l0aW9uKCkgaXMgZXhlY3V0ZWQnXG4gICAgcG9zID0gJHRhZy5wb3NpdGlvbigpXG4gICAgeCA9IChwb3MubGVmdCArICgkdGFnLndpZHRoKCkgLyAyKSkgLyBAY3VycmVudFdpZHRoICogQG5hdHVyYWxXaWR0aFxuICAgIHkgPSAocG9zLnRvcCArICgkdGFnLmhlaWdodCgpIC8gMikpIC8gQGN1cnJlbnRIZWlnaHQgKiBAbmF0dXJhbEhlaWdodFxuICAgIGlmIEB1bml0IGlzICdwZXJjZW50J1xuICAgICAgeCA9IHggLyBAbmF0dXJhbFdpZHRoICogMTAwXG4gICAgICB5ID0geSAvIEBuYXR1cmFsSGVpZ2h0ICogMTAwXG4gICAgW3gsIHldXG5cbiAgX3VwZGF0ZUltYWdlU2l6ZTogKGRhdGEpIC0+XG4gICAgQGxvZyAnX3VwZGF0ZUltYWdlU2l6ZSgpIGlzIGV4ZWN1dGVkJ1xuICAgIEBuYXR1cmFsV2lkdGggPSBkYXRhLm5hdHVyYWxXaWR0aFxuICAgIEBuYXR1cmFsSGVpZ2h0ID0gZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgQGN1cnJlbnRXaWR0aCA9IGRhdGEud2lkdGhcbiAgICBAY3VycmVudEhlaWdodCA9IGRhdGEuaGVpZ2h0XG4gICAgQHdpZHRoUmF0aW8gPSBkYXRhLndpZHRoUmF0aW9cbiAgICBAaGVpZ2h0UmF0aW8gPSBkYXRhLmhlaWdodFJhdGlvXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBFdmVudCBIYW5kbGVyc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBoYW5kbGVUYWdDbGljazogKGUpIC0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgIHJldHVybiB1bmxlc3MgJChlLnRhcmdldCkuaGFzQ2xhc3MoJ3RhZ2xhLWljb24nKVxuICAgIEBsb2cgJ2hhbmRsZVRhZ0NsaWNrKCkgaXMgZXhlY3V0ZWQnXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuICAgIEBzaHJpbmsoJHRhZylcbiAgICAkdGFnLmFkZENsYXNzKCd0YWdsYS10YWctYWN0aXZlJylcbiAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKClcblxuICBoYW5kbGVUYWdDaGFuZ2U6IChlLCBwYXJhbXMpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnQ2hhbmdlKCkgaXMgZXhlY3V0ZWQnXG4gICAgJHNlbGVjdCA9ICQoZS50YXJnZXQpXG4gICAgJHRhZyA9ICRzZWxlY3QucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgaXNOZXcgPSAkdGFnLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JylcbiAgICAkdGFnLnJlbW92ZUNsYXNzICd0YWdsYS10YWctY2hvb3NlIHRhZ2xhLXRhZy1hY3RpdmUgdGFnbGEtdGFnLW5ldydcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICBkYXRhLmxhYmVsID0gJHNlbGVjdC5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS50ZXh0KClcbiAgICBkYXRhLnZhbHVlID0gJHNlbGVjdC52YWwoKSB8fCBkYXRhLmxhYmVsXG4gICAgc2VyaWFsaXplID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpLnNlcmlhbGl6ZSgpXG4gICAgaWYgaXNOZXdcbiAgICAgIEBlbWl0KCdhZGQnLCBbZGF0YSwgc2VyaWFsaXplLCAkdGFnXSlcbiAgICBlbHNlXG4gICAgICBAZW1pdCgnY2hhbmdlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG5cbiAgaGFuZGxlVGFnRGVsZXRlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdEZWxldGUoKSBpcyBleGVjdXRlZCdcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmUoKVxuICAgICAgQGVtaXQoJ2RlbGV0ZScsIFtkYXRhXSlcblxuICBoYW5kbGVUYWdFZGl0OiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdFZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIEBlbWl0KCdlZGl0JywgW2RhdGFdKVxuXG4gIGhhbmRsZVRhZ01vdmU6IChpbnN0YW5jZSwgZXZlbnQsIHBvaW50ZXIpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW92ZSgpIGlzIGV4ZWN1dGVkJ1xuXG4gICAgJHRhZyA9ICQoaW5zdGFuY2UuZWxlbWVudClcbiAgICBkYXRhID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgcG9zID0gQF9nZXRQb3NpdGlvbigkdGFnKVxuICAgIGRhdGEueCA9IHBvc1swXVxuICAgIGRhdGEueSA9IHBvc1sxXVxuXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbChkYXRhLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwoZGF0YS55KVxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcbiAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpXG4gICAgQGVtaXQoJ21vdmUnLCBbZGF0YSwgc2VyaWFsaXplLCAkdGFnXSkgaWYgZGF0YS5pZFxuXG4gIGhhbmRsZVRhZ01vdXNlRW50ZXI6IChlKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdXNlRW50ZXInXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXG4gICAgIyBDbGVhciBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSAgJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWhvdmVyJylcblxuICBoYW5kbGVUYWdNb3VzZUxlYXZlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUxlYXZlJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgIyBTYXZlIGRlbGF5ZWQgbGVhdmUgdGltZXJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQgLT5cbiAgICAgICR0YWcucmVtb3ZlQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgLCAzMDBcbiAgICAkdGFnLmRhdGEoJ3RpbWVyJywgdGltZXIpXG5cbiAgaGFuZGxlV3JhcHBlckNsaWNrOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVXcmFwcGVyQ2xpY2soKSBpcyBleGVjdXRlZCdcbiAgICAjIEhhY2sgdG8gYXZvaWQgdHJpZ2dlcmluZyBjbGljayBldmVudFxuICAgIEBzaHJpbmsoKSBpZiAobmV3IERhdGUoKSAtIEBsYXN0RHJhZ1RpbWUgPiAxMClcblxuICBoYW5kbGVJbWFnZVJlc2l6ZTogKGUsIGRhdGEpIC0+XG4gICAgQGxvZyAnaGFuZGxlSW1hZ2VSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICBwcmV2V2lkdGggPSBAY3VycmVudFdpZHRoXG4gICAgcHJldkhlaWdodCA9IEBjdXJyZW50SGVpZ2h0XG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgICR0YWcgPSAkKEApXG4gICAgICBwb3MgPSAkdGFnLnBvc2l0aW9uKClcbiAgICAgIHggPSAocG9zLmxlZnQgLyBwcmV2V2lkdGgpICogZGF0YS53aWR0aFxuICAgICAgeSA9IChwb3MudG9wIC8gcHJldkhlaWdodCkgKiBkYXRhLmhlaWdodFxuICAgICAgJHRhZy5jc3NcbiAgICAgICAgbGVmdDogXCIje3h9cHhcIlxuICAgICAgICB0b3A6IFwiI3t5fXB4XCJcbiAgICBAX3VwZGF0ZUltYWdlU2l6ZShkYXRhKVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgUHVibGljIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgYWRkVGFnOiAodGFnID0ge30pIC0+XG4gICAgQGxvZyAnYWRkVGFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBSZW5kZXIgdGFnIGVsZW1lbnQgYnkgcHJvdmlkZWQgdGVtcGxhdGVcbiAgICB0YWcgPSAkLmV4dGVuZCh7fSwgdGFnKVxuICAgIHRhZy5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICAkdGFnID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCB0YWcpKVxuICAgIGlzTmV3ID0gKCF0YWcueCBhbmQgIXRhZy55KVxuXG4gICAgIyBSZW1vdmUgcHJldmlvdXMgYWRkZWQgbmV3IHRhZyBpZiBpdCBoYXNuJ3QgYmVpbmcgc2V0XG4gICAgaWYgaXNOZXdcbiAgICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAgIGlmICQoQCkuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISQoQCkuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICAgJChAKS5mYWRlT3V0ID0+XG4gICAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG5cbiAgICBAd3JhcHBlci5hcHBlbmQoJHRhZylcbiAgICBpZiBpc05ldyAjIERlZmF1bHQgcG9zaXRpb24gZm9yIG5ldyB0YWdcbiAgICAgICMgVE9ETyAtIE5lZWQgYSBzbWFydCB3YXkgdG8gYXZvaWQgY29sbGlzaW9uXG4gICAgICB0YWcueCA9IDUwXG4gICAgICB0YWcueSA9IDUwXG4gICAgICAkdGFnLmFkZENsYXNzICd0YWdsYS10YWctbmV3IHRhZ2xhLXRhZy1hY3RpdmUgdGFnbGEtdGFnLWNob29zZSdcbiAgICBpZiBAdW5pdCBpcyAncGVyY2VudCdcbiAgICAgIHggPSBAY3VycmVudFdpZHRoICogKHRhZy54IC8gMTAwKVxuICAgICAgeSA9IEBjdXJyZW50SGVpZ2h0ICogKHRhZy55IC8gMTAwKVxuICAgIGVsc2VcbiAgICAgIHggPSB0YWcueCAqIEB3aWR0aFJhdGlvXG4gICAgICB5ID0gdGFnLnkgKiBAaGVpZ2h0UmF0aW9cbiAgICBvZmZzZXRYID0gJHRhZy5vdXRlcldpZHRoKCkgLyAyXG4gICAgb2Zmc2V0WSA9ICR0YWcub3V0ZXJIZWlnaHQoKSAvIDJcbiAgICAkdGFnLmNzc1xuICAgICAgJ2xlZnQnOiBcIiN7eCAtIG9mZnNldFh9cHhcIlxuICAgICAgJ3RvcCc6IFwiI3t5IC0gb2Zmc2V0WX1weFwiXG4gICAgIyBTYXZlIHRhZyBkYXRhIHRvIGRhdGEgYXR0ciBmb3IgZWFzeSBhY2Nlc3NcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgdGFnKVxuICAgICMgUmVuZGVyIHRhZyBlZGl0b3IgdG9vbHNcbiAgICBpZiBAZWRpdG9yXG4gICAgICBAX2FwcGx5VG9vbHMoJHRhZylcbiAgICAgIGlmIGlzTmV3XG4gICAgICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5lbmFibGUoKVxuICAgICAgICAkdGFnLmFkZENsYXNzKCd0YWdsYS10YWctY2hvb3NlJylcbiAgICAgICAgc2V0VGltZW91dCA9PlxuICAgICAgICAgIEB3cmFwcGVyLmFkZENsYXNzKCd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZycpXG4gICAgICAgICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykudHJpZ2dlciAnY2hvc2VuOm9wZW4nXG4gICAgICAgICAgQF9kaXNhYmxlRHJhZygkdGFnKVxuICAgICAgICAsIDEwMFxuXG4gIGRlbGV0ZVRhZzogKCR0YWcpIC0+XG4gICAgQGxvZyAnZGVsZXRlVGFnKCkgaXMgZXhlY3V0ZWQnXG5cbiAgZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvblxuICAgIEBsb2cgJ2VkaXQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5hZGRDbGFzcygndGFnbGEtZWRpdGluZycpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT4gQF9hcHBseVRvb2xzKCQoQCkpXG4gICAgQGVkaXRvciA9IG9uXG5cbiAgZ2V0VGFnczogLT5cbiAgICBAbG9nICdnZXRUYWdzKCkgaXMgZXhlY3V0ZWQnXG4gICAgdGFncyA9IFtdXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJChAKS5kYXRhKCd0YWctZGF0YScpKVxuICAgICAgdGFncy5wdXNoICQoQCkuZGF0YSgndGFnLWRhdGEnKVxuICAgIHRhZ3NcblxuICAjIFNocmluayBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgJGV4Y2VwdFxuICBzaHJpbms6ICgkZXhjZXB0ID0gbnVsbCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdzaHJpbmsoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIGVsXG4gICAgICAkdGFnID0gJChlbClcbiAgICAgIGlmICR0YWcuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISR0YWcuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgICAgICR0YWcucmVtb3ZlKClcbiAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG4gICAgICAkdGFnLnJlbW92ZUNsYXNzICd0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1jaG9vc2UnXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJ1xuICAgIEBfZW5hYmxlRHJhZygpXG5cbiAgdXBkYXRlRGlhbG9nOiAoJHRhZywgZGF0YSkgLT5cbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSwgZGF0YSlcbiAgICBkYXRhLmZvcm1faHRtbCA9IEBmb3JtSHRtbFxuICAgIGh0bWwgPSAkKE11c3RhY2hlLnJlbmRlcihAdGFnVGVtcGxhdGUsIGRhdGEpKS5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbCgpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbChodG1sKVxuICAgICR0YWcuZGF0YSgndGFnLWRhdGEnLCBkYXRhKVxuXG4gIHVuZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXQgaXMgb2ZmXG4gICAgQGxvZyAndW5lZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggKGksIGVsKSA9PlxuICAgICAgQF9yZW1vdmVUb29scygkKGVsKSlcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEtZWRpdGluZydcbiAgICBAZWRpdG9yID0gb2ZmXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBMaWZlY3ljbGUgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBpbml0OiAob3B0aW9ucykgLT5cbiAgICAjIENvbmZpZ3VyZSBPcHRpb25zXG4gICAgQGRhdGEgPSBvcHRpb25zLmRhdGEgfHwgW11cbiAgICBAZWRpdG9yID0gKG9wdGlvbnMuZWRpdG9yIGlzIG9uKSA/IG9uIDogZmFsc2VcbiAgICBAZm9ybUh0bWwgPSBpZiBvcHRpb25zLmZvcm0gdGhlbiAkKG9wdGlvbnMuZm9ybSkgZWxzZSAkKFRhZ2xhLkZPUk1fVEVNUExBVEUpXG4gICAgQGZvcm1IdG1sID0gQGZvcm1IdG1sLmh0bWwoKVxuICAgIEB0YWdUZW1wbGF0ZSA9IGlmIG9wdGlvbnMudGFnVGVtcGxhdGUgdGhlbiAkKG9wdGlvbnMudGFnVGVtcGxhdGUpLmh0bWwoKSBlbHNlIFRhZ2xhLlRBR19URU1QTEFURVxuICAgIEB1bml0ID0gaWYgb3B0aW9ucy51bml0IGlzICdwZXJjZW50JyB0aGVuICdwZXJjZW50JyBlbHNlICdwaXhlbCdcbiAgICAjIEF0dHJpYnV0ZXNcbiAgICBAaW1hZ2VTaXplID0gbnVsbFxuICAgIEBpbWFnZSA9IEB3cmFwcGVyLmZpbmQoJ2ltZycpXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcblxuICBiaW5kOiAtPlxuICAgIEBsb2cgJ2JpbmQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlclxuICAgICAgLm9uICdtb3VzZWVudGVyJywgJC5wcm94eShAaGFuZGxlTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAkLnByb3h5KEBoYW5kbGVXcmFwcGVyQ2xpY2ssIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZWRpdC1saW5rJywgJC5wcm94eShAaGFuZGxlVGFnRWRpdCwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAnLnRhZ2xhLXRhZy1kZWxldGUtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0RlbGV0ZSwgQClcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnbW91c2VsZWF2ZScsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VMZWF2ZSwgQClcblxuICByZW5kZXI6IC0+XG4gICAgQGxvZyAncmVuZGVyKCkgaXMgZXhlY3V0ZWQnXG4gICAgQGltYWdlLmF0dHIoJ2RyYWdnYWJsZScsIGZhbHNlKVxuICAgIEBpbWFnZVNpemUgPSBTdGFja2xhLmdldEltYWdlU2l6ZShAaW1hZ2UsICQucHJveHkoQHJlbmRlckZuLCBAKSlcbiAgICBAaW1hZ2VTaXplLm9uKCdjaGFuZ2UnLCAkLnByb3h5KEBoYW5kbGVJbWFnZVJlc2l6ZSwgQCkpXG5cbiAgcmVuZGVyRm46IChzdWNjZXNzLCBkYXRhKSAtPlxuICAgIEBsb2cgJ3JlbmRlckZuKCkgaXMgZXhlY3V0ZWQnXG4gICAgaXNTYWZhcmkgPSAvU2FmYXJpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIGFuZFxuICAgICAgICAgICAgICAgL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpXG4gICAgdW5sZXNzIHN1Y2Nlc3MgIyBTdG9wIGlmIGltYWdlIGlzIGZhaWxlZCB0byBsb2FkXG4gICAgICBAbG9nKFwiRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICN7QGltYWdlLmF0dHIoJ3NyYycpfVwiLCAnZXJyb3InKVxuICAgICAgQGRlc3Ryb3koKVxuICAgICAgcmV0dXJuXG4gICAgQF91cGRhdGVJbWFnZVNpemUoZGF0YSkgIyBTYXZlIGRpbWVuc2lvblxuICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYScgIyBBcHBseSBuZWNlc3NhcnkgY2xhc3MgbmFtZXNcbiAgICBAd3JhcHBlci5hZGRDbGFzcyAndGFnbGEtc2FmYXJpJyBpZiBpc1NhZmFyaSAjIEF2b2lkIGFuaW1hdGlvblxuICAgIEBhZGRUYWcgdGFnIGZvciB0YWcgaW4gQGRhdGEgIyBDcmVhdGUgdGFnc1xuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYS1lZGl0aW5nJyBpZiBAZWRpdG9yXG4gICAgICBAZW1pdCgncmVhZHknLCBbQF0pXG4gICAgLCA1MDBcblxuICBkZXN0cm95OiAtPlxuICAgIEBsb2cgJ2Rlc3Ryb3koKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEgdGFnbGEtZWRpdGluZydcbiAgICBAd3JhcHBlci5maW5kKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgJHRhZyA9ICQoQClcbiAgICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLmNob3NlbjIgJ2Rlc3Ryb3knXG4gICAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGVzdHJveSgpXG4gICAgICAkdGFnLnJlbW92ZSgpXG5cbiQuZXh0ZW5kKFRhZ2xhOjosIHByb3RvKVxud2luZG93LlN0YWNrbGEgPSB7fSB1bmxlc3Mgd2luZG93LlN0YWNrbGFcbndpbmRvdy5TdGFja2xhLlRhZ2xhID0gVGFnbGFcblxuIl19