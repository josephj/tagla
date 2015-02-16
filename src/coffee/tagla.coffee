ATTRS =
  NAME: 'Tagla'
  PREFIX: 'tagla-'
  DRAG_ATTR:
    containment: '.tagla'
    handle: '.tagla-icon'
  SELECT_ATTR:
    allow_single_deselect: on
    placeholder_text_single: 'Select an option'
    width: '310px'
  FORM_TEMPLATE: [
  ].join('\n')
  TAG_TEMPLATE: [
    '<div class="tagla-tag">'
    '    <i class="tagla-icon fs fs-tag"></i>'
    '    <div class="tagla-dialog">'
    '        {{#image}}'
    '        <div class="tagla-dialog-image">'
    '          <img src="{{image}}">'
    '        </div>'
    '        {{/image}}'
    '        <div class="tagla-dialog-text">'
    '          <div class="tagla-dialog-edit">'
    '            <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-edit-link">'
    '              <i class="fs fs-pencil"></i> Edit'
    '            </a>'
    '            <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-delete-link">'
    '              <i class="fs fs-cross3"></i> Delete'
    '            </a>'
    '          </div>'
    '          <h2 class="tagla-dialog-title">{{label}}</h2>'
    '          <div class="tagla-dialog-price">{{price}}</div>'
    '          <p class="tagla-dialog-description">{{description}}</p>'
    '          <a href="{{url}}" class="tagla-dialog-button st-btn st-btn-success st-btn-solid">'
    '            <i class="fs fs-cart"></i>'
    '            Buy Now'
    '          </a>'
    '        </div>'
    '    </div>'
    '    <form class="tagla-form">'
    '        <div class="tagla-form-title">'
    '          Select Your Product'
    '          <a href="javascript:void(0);" class="tagla-form-close">×</a>'
    '        </div>'
    '        <input type="hidden" name="x">'
    '        <input type="hidden" name="y">'
    '        <select data-placeholder="Search" type="text" name="tag" class="tagla-select chosen-select" placeholder="Search">'
    '            <option></option>'
    '            <option value="1">Cockie</option>'
    '            <option value="2">Kiwi</option>'
    '            <option value="3">Buddy</option>'
    '        </select>'
    '    </form>'
    '</div>'
  ].join('\n')
  NEW_TAG_TEMPLATE: [
    '<div class="tagla-tag">'
    '    <i class="tagla-icon fs fs-tag"></i>'
    '    <span class="tagla-label">{{label}}</span>'
    '</div>'
  ].join('\n')

class Tagla extends Stackla.Base
  constructor: ($wrapper, options = {}) ->
    super()
    @wrapper = $($wrapper)
    @init(options)
    @bind()

$.extend(Tagla, ATTRS)

proto =
  ##############
  # Utilities
  ##############
  formatFloat: (num, pos) ->
    size = Math.pow(10, pos)
    Math.round(num * size) / size
  toString: -> 'Tagla'

  ##################
  # Private Methods
  ##################
  # Initialize drag and select libs for a single tag
  _applyTools: ($tag) ->
    drag = new Draggabilly($tag[0], Tagla.DRAG_ATTR)
    drag.on 'dragEnd', $.proxy(@handleTagMove, @)
    $tag.data('draggabilly', drag)
    # Update form
    tag = $tag.data('tag-data')
    $form = $tag.find('.tagla-form')
    $form.find('[name=x]').val(tag.x)
    $form.find('[name=y]').val(tag.y)
    $form.find("[name=tag] option[value=#{tag.value}]").attr('selected', 'selected')
    $select = $tag.find('.tagla-select')
    $select.chosen(Tagla.SELECT_ATTR)
    $select.on 'change', $.proxy(@handleTagChange, @)
    $select.on 'chosen:hiding_dropdown', (e, params) ->
      $select.trigger('chosen:open')
  _removeTools: ($tag) ->
    $tag.data('draggabilly').destroy()
    $select = $tag.find('.tagla-select')
    $select.show().removeClass 'chzn-done'
    $select.next().remove()

  _getPosition: ($tag) ->
    @log '_getPosition() is executed'
    pos = $tag.position()
    x = (pos.left + ($tag.width() / 2)) / @currentWidth * @naturalWidth
    y = (pos.top + ($tag.height() / 2)) / @currentHeight * @naturalWidth
    if @unit is 'percent'
      x = x / @naturalWidth * 100
      y = y / @naturalHeight * 100
    [x, y]

  _updateImageSize: (data) ->
    @log '_updateImageSize() is executed'
    @naturalWidth = data.naturalWidth
    @naturalHeight = data.naturalHeight
    @currentWidth = data.width
    @currentHeight = data.height
    @widthRatio = data.widthRatio
    @heightRatio = data.heightRatio

  ####################
  # Event Handlers
  ####################
  handleTagClick: (e) ->
    e.preventDefault()
    e.stopPropagation()
    return unless $(e.target).hasClass('tagla-icon')
    @log 'handleTagClick() is executed'
    $tag = $(e.currentTarget)
    @shrink($tag)
    $tag.addClass('tagla-tag-active')
    $tag.data('draggabilly').enable()

  handleTagChange: (e, params) ->
    @log 'handleTagChange() is executed'
    $select = $(e.target)
    $tag = $select.parents('.tagla-tag')
    $tag.removeClass 'tagla-tag-choose tagla-tag-active'
    data = $tag.data('tag-data')
    data.label = $select.find('option:selected').text()
    data.value = $select.val() || data.label
    serialize = $tag.find('.tagla-form').serialize()
    @emit('change', [data, serialize, $tag])

  handleTagDelete: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.remove()
    instance = $tag.data('draggabilly')
    instance.destroy() if (instance)
    data = $tag.data('tag-data')
    @emit('delete', [data])

  handleTagEdit: (e) ->
    @log 'handleTagEdit() is executed'
    e.preventDefault()
    e.stopPropagation()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.addClass('tagla-tag-choose')
    @wrapper.addClass('tagla-editing-selecting')
    $tag.find('.tagla-select').trigger('chosen:open')
    @emit('edit', [$tag.data('tag-data')])

  handleTagMove: (instance, event, pointer) ->
    @log 'handleTagMove() is executed'

    $tag = $(instance.element)
    data = $tag.data('tag-data')
    pos = @_getPosition($tag)
    data.x = pos[0]
    data.y = pos[1]

    $form = $tag.find('.tagla-form')
    $form.find('[name=x]').val(data.x)
    $form.find('[name=y]').val(data.y)
    serialize = $tag.find('.tagla-form').serialize()

    @lastDragTime = new Date()
    @emit('move', [data, serialize, $tag])

  handleWrapperClick: (e) ->
    @log 'handleWrapperClick() is executed'
    # Hack to avoid triggering click event
    @shrink() if (new Date() - @lastDragTime > 10)

  handleImageResize: (e, data) ->
    @log 'handleImageResize() is executed'
    prevWidth = @currentWidth
    prevHeight = @currentHeight
    $('.tagla-tag').each ->
      $tag = $(@)
      pos = $tag.position()
      x = (pos.left / prevWidth) * data.width
      y = (pos.top / prevHeight) * data.height
      $tag.css
        left: "#{x}px"
        top: "#{y}px"
    @_updateImageSize(data)

  ####################
  # Public Methods
  ####################
  addTag: (tag = {}) ->
    @log 'addTag() is executed'
    # Render tag element by provided template
    $tag = $(Mustache.render(@tagTemplate, tag))
    isNew = $.isEmptyObject(tag)
    @wrapper.append($tag)
    # Default position for new tag
    if isNew
      tag.x = 50
      tag.y = 50
      $tag.addClass 'tagla-tag-new tagla-tag-active tagla-tag-choose'
    if @unit is 'percent'
      x = @currentWidth * (tag.x / 100)
      y = @currentHeight * (tag.y / 100)
    else
      x = tag.x * @widthRatio
      y = tag.y * @heightRatio
    offsetX = $tag.outerWidth() / 2
    offsetY = $tag.outerHeight() / 2
    $tag.css
      left: "#{x - offsetX}px"
      top: "#{y - offsetY}px"
    # Save tag data to data attr for easy access
    $tag.data('tag-data', tag)
    # Render tag editor tools
    if @editor
      @_applyTools($tag)
      if isNew
        $tag.data('draggabilly').enable()
        $tag.addClass('tagla-tag-choose')
        setTimeout =>
          @wrapper.addClass('tagla-editing-selecting')
          $tag.find('.tagla-select').trigger 'chosen:open'
        , 100

  deleteTag: ($tag) ->
    @log 'deleteTag() is executed'

  edit: ->
    return if @editor is on
    @log 'edit() is executed'
    @wrapper.addClass('tagla-editing')
    $('.tagla-tag').each -> @_applyTools($(@))
    @editor = on

  # Shrink everything except the $except
  shrink: ($except = null) ->
    return if @editor is off
    @log 'shrink() is executed'
    $except = $($except)
    @wrapper.removeClass 'tagla-editing-selecting'
    $('.tagla-tag').each ->
      return if $except[0] is @
      $tag = $(@)
      if $tag.hasClass('tagla-tag-new') and !$tag.find('[name=tag]').val()
        $tag.remove()
      $tag.removeClass 'tagla-tag-active tagla-tag-choose'

  updateDialog: ($tag, data) ->
    html = $(Mustache.render(@tagTemplate, data)).find('.tagla-dialog').html()
    $tag.find('.tagla-dialog').html(html)
    $tag.data('tag-data', data)

  unedit: ->
    return if @edit is off
    @log 'unedit() is executed'
    $('.tagla-tag').each -> @_removeTools($(@))
    @wrapper.removeClass 'tagla-editing'
    @editor = off

  ####################
  # Lifecycle Methods
  ####################
  init: (options) ->
    # Configure Options
    @data = options.data || []
    @editor = (options.editor is on) ? on : false
    @form = if options.form then $(options.form) else Tagla.FORM_TEMPLATE
    @tagTemplate = if options.tagTemplate then $(options.tagTemplate).html() else Tagla.TAG_TEMPLATE
    @unit = if options.unit is 'percent' then 'percent' else 'pixel'
    # Attributes
    @imageSize = null
    @image = @wrapper.find('img')
    @lastDragTime = new Date()

  bind: ->
    @log 'bind() is executed'
    @wrapper
      .on 'mouseenter', $.proxy(@handleMouseEnter, @)
      .on 'click', $.proxy(@handleWrapperClick, @)
      .on 'click', '.tagla-tag-edit-link', $.proxy(@handleTagEdit, @)
      .on 'click', '.tagla-tag-delete-link', $.proxy(@handleTagDelete, @)

  renderFn: (success, data) ->
    # Stop if image is failed to load
    unless success
      @log("Failed to load image: #{@image.attr('src')}", 'error')
      @destroy()
      return
    # Save dimension
    @_updateImageSize(data)
    # Apply necessary class names
    @wrapper.addClass 'tagla'
    @wrapper.addClass 'tagla-editing' if @editor
    # Create tags
    @addTag tag for tag in @data

  render: ->
    @log 'render() is executed'
    @imageSize = Stackla.getImageSize(@image, $.proxy(@renderFn, @))
    @imageSize.on('change', $.proxy(@handleImageResize, @))

  destroy: ->
    @log 'destroy() is executed'

$.extend(Tagla::, proto)

window.Stackla = {} unless window.Stackla
window.Stackla.Tagla = Tagla

