ATTRS =
  NAME: 'Tagla'
  PREFIX: 'tagla-'
  DRAG_ATTR:
    containment: '.tagla'
    handle: '.tagla-icon'
  SELECT_ATTR:
    placeholder_text_single: 'Select an option'
    width: '310px'
  FORM_TEMPLATE: [
  ].join('\n')
  TAG_TEMPLATE: [
    '<div class="tagla-tag">'
    '    <i class="tagla-icon fs fs-tag"></i>'
    '    <span class="tagla-label">'
    '      {{label}}'
    '      <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-edit-link">'
    '        <i class="fs fs-pencil"></i> Edit'
    '      </a>'
    '      <a href="javascript:void(0)" class="tagla-tag-link tagla-tag-delete-link">'
    '        <i class="fs fs-cross3"></i> Delete'
    '      </a>'
    '    </span>'
    '    <div class="tagla-dialog">'
    '        {{#image}}'
    '        <div class="tagla-dialog-image">'
    '          <img src="{{image}}">'
    '        </div>'
    '        {{/image}}'
    '        <div class="tagla-dialog-text">'
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
    '        <input type="hidden" name="x">'
    '        <input type="hidden" name="y">'
    '        <select data-placeholder="Search" type="text" name="label" class="tagla-select chosen-select" placeholder="Search">'
    '            <option>Frankie Issue #6</option>'
    '            <option>Frankie Wall Calendar 2015</option>'
    '            <option>Frankie A5 Daily Planner</option>'
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
    drag.disable()
    $tag.data('draggabilly', drag)
    $tag.find('.tagla-select').chosen(Tagla.SELECT_ATTR)
    $tag.find('.tagla-select').on('change', $.proxy(@handleTagChange, @))

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
    return [x, y]

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
    $tag = $(e.target).parents('.tagla-tag')
    $tag.removeClass('tagla-tag-choose tagla-tag-active')
    console.log(params)
    @emit('change', [params])

  handleTagDelete: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.remove()
    instance = $tag.data('draggabilly')
    instance.destroy() if (instance)
    @emit('delete', [$tag.data('tag-data')])

  handleTagEdit: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.addClass('tagla-tag-choose')
    $tag.find('.tagla-select').trigger('chosen:open')
    @emit('tagla:edit', [$tag.data('tag-data')])

  handleTagMove: (instance, event, pointer) ->
    @log 'handleTagMove() is executed'
    $tag = $(instance.element)
    data = $tag.data('tag-data')
    pos = @_getPosition($tag)
    data.x = pos[0]
    data.y = pos[1]
    @emit('move', [pos, data, $tag])

  handleWrapperClick: (e) ->
    @log 'handleWrapperClick() is executed'
    @shrink()

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
        $tag.find('.tagla-select').trigger('chosen:open')

  deleteTag: ($tag) ->
    @log 'deleteTag() is executed'

  edit: ->
    return if @editor is on
    @log 'edit() is executed'
    @wrapper.addClass('tagla-editing')
    $('.tagla-tag').each -> @_applyTools($(@))
    @editor = on

  shrink: ($except = null) ->
    return if @editor is off
    @log 'shrink() is executed'
    $except = $($except)
    $('.tagla-tag').each ->
      return if $except[0] is @
      $(@).removeClass 'tagla-tag-active tagla-tag-choose'
      $(@).data('draggabilly').disable()

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

  bind: ->
    @log 'bind() is executed'
    @wrapper
      .on 'mouseenter', $.proxy(@handleMouseEnter, @)
      .on 'click', $.proxy(@handleWrapperClick, @)
      .on 'click', '.tagla-tag', $.proxy(@handleTagClick, @)
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

