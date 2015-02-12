class Tagla
  constructor: ($wrapper, options = {}) ->
    @wrapper = $($wrapper)
    @init(options)
    @bind()

Tagla.NAME = 'Tagla'
Tagla.PREFIX = 'tagla-'
Tagla.FORM_TEMPLATE = [
  '<form class="tagla-form">'
  '    <input type="hidden" name="x">'
  '    <input type="hidden" name="y">'
  '    <select data-placeholder="Search" type="text" name="label" class="tagla-select chosen-select" placeholder="Search">'
  '        <option>Frankie Issue #6</option>'
  '        <option>Frankie Wall Calendar 2015</option>'
  '        <option>Frankie A5 Daily Planner</option>'
  '    </select>'
  '</form>'
].join('\n')
Tagla.TAG_TEMPLATE = [
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
  "    #{Tagla.FORM_TEMPLATE}"
  '</div>'
].join('\n')
Tagla.NEW_TAG_TEMPLATE = [
  '<div class="tagla-tag">'
  '    <i class="tagla-icon fs fs-tag"></i>'
  '    <span class="tagla-label">{{label}}</span>'
  '</div>'
].join('\n')
Tagla.DRAG_ATTR =
  containment: '.tagla'
  handle: '.tagla-icon'
Tagla.SELECT_ATTR =
  placeholder_text_single: 'Select an option'
  width: '310px'

proto =
  ##############
  # Utilities
  ##############
  log: (msg, type = 'info') ->
    return if !@debug or !window.console or !window.console[type]
    window.console[type] "[#{Tagla.NAME}] #{msg}"

  formatFloat: (num, pos) ->
    size = Math.pow(10, pos)
    Math.round(num * size) / size

  ##################
  # Private Methods
  ##################
  # Initialize drag and select libs for a single tag
  _setTools: ($tag) ->
    drag = new Draggabilly($tag[0], Tagla.DRAG_ATTR)
    drag.disable()
    $tag.data('draggabilly', drag)
    $tag.find('.tagla-select').chosen(Tagla.SELECT_ATTR)

  ##################
  # Public Mehtods
  ##################
  appendTag: (tag) ->
    @log 'appendTag() is executed'
    # Render tag element by provided template
    $tag = $(Mustache.render(@tagTemplate, tag))
    @wrapper.append($tag)
    # Default position for new tag
    tag.x = tag.x || 50
    tag.y = tag.y || 50
    # Make offset so the position could be center point of icon
    # TODO - Current convert percent to pixel, should allow user to
    #        define the unit instead of hard code it
    x = @wrapper.width() * (tag.x / 100)
    y = @wrapper.height() * (tag.y / 100)
    offsetX = $tag.outerWidth() / 2
    offsetY = $tag.outerHeight() / 2
    $tag.css
      left: "#{x - offsetX}px"
      top: "#{y - offsetY}px"
    # Save tag data to data attr for easy access
    $tag.data('tag-data', tag)
    # Render tag editor tools
    @_setTools($tag) if @editor

  updateImageSize: ->
    @log 'updateImageSize() is executed'
    image = @image[0]
    @currentWidth = image.width
    @currentHeight = image.height
    @widthRatio = @currentWidth / @naturalWidth
    @heightRatio = @currentHeight / @naturalHeight

  ####################
  # Event Handlers
  ####################
  handleImageError: (e) ->
    @log 'handleImageError() is executed'
    @imageLoaded = false
    @destroy()

  handleImageLoad: (e) ->
    @log 'handleImageLoad() is executed'
    @imageLoaded = true
    @naturalWidth = @image[0].width
    @naturalHeight = @image[0].height
    @updateImageSize()
    @render()

  handleTagClick: (e) ->
    @log 'handleTagClick() is executed'
    e.preventDefault()
    e.stopPropagation()
    $tag = $(e.currentTarget)
    $('.tagla-tag').each ->
      if @ isnt $tag[0]
        $(@).removeClass('tagla-tag-active')
        $(@).removeClass('tagla-tag-choose')
        $(@).data('draggabilly').disable()
        #$(@).find('.tagla-select').trigger('chosen:open')
    $tag.addClass('tagla-tag-active')
    $tag.data('draggabilly').enable()

  handleTagDelete: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.remove()
    instance = $tag.data('draggabilly')
    instance.destroy() if (instance)
    $(document).trigger('tagla:delete', $tag.data('tag-data'))

  handleTagEdit: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.addClass('tagla-tag-choose')
    $tag.find('.tagla-select').trigger('chosen:open')
    $tag.find('.tagla-select').on 'change', (e) ->
      $tag.removeClass('tagla-tag-choose tagla-tag-active')
    $(document).trigger('tagla:edit', $tag.data('tag-data'))

  handleWrapperClick: (e) ->
    @log 'handleWrapperClick() is executed'
    $('.tagla-tag').each ->
      $(@).removeClass('tagla-tag-active')
      $(@).data('draggabilly').disable()

  handleWindowResize: (e) ->
    @log 'handleImageResize() is executed'
    image = @image[0]
    return if image.width is @currentWidth and image.height is @currentHeight
    @updateImageSize()

  ####################
  # Public Methods
  ####################
  edit: ->
    return if @editor is on
    @log 'edit() is executed'
    @wrapper.addClass('tagla-editing')
    $('.tagla-tag').each ->
      instance = $(@).data('draggabilly')
      if instance
        instance.enable()
      else
        instance = new Draggabilly(@, Tagla.DRAG_ATTR)
        $(@).data('draggabilly', instance)
    @editor = on

  unedit: ->
    return if @edit is off
    @log 'unedit() is executed'
    @wrapper.find('.tagla-tag').each ->
      instance = $(@).data('draggabilly')
      instance.disable()
    @wrapper.removeClass('tagla-editing')
    @editor = off

  # Append a new tag to page
  addTag: ->
    return unless @editor # Only for editor mode
    @log 'addTag() is executed'
    $tag = $(Mustache.render(Tagla.NEW_TAG_TEMPLATE, tag))
    @wrapper.append($tag)
    tag = x: 50, y: 50
    offsetX = @formatFloat($tag.outerWidth() / 2 / @wrapper.width() * 100, 2)
    offsetY = @formatFloat($tag.outerHeight() / 2 / @wrapper.height() * 100, 2)
    $tag.css
      left: "#{tag.x - offsetX}%"
      top: "#{tag.y - offsetY}%"
    instance = new Draggabilly($tag[0], Tagla.DRAG_ATTR)
    $(@).data('draggabilly', instance)

  deleteTag: (e) ->


  ####################
  # Lifecycle Methods
  ####################
  init: (options) ->
    # Configure Options
    @data = options.data || []
    @editor = (options.editor is on) ? on : false
    @form = if options.form then $(options.form) else Tagla.FORM_TEMPLATE
    @tagTemplate = if options.tagTemplate then $(options.tagTemplate).html() else Tagla.TAG_TEMPLATE
    # Attributes
    @debug = true
    @image = @wrapper.find('img')
    @imageLoaded = @image[0].complete
    @currentWidth = @image[0].width
    @currentHeight = @image[0].height

  bind: ->
    @log 'bind() is executed'
    @wrapper.on 'mouseenter', $.proxy(@handleMouseEnter, @)
    @wrapper.on 'click', $.proxy(@handleWrapperClick, @)
    @wrapper.on 'click', '.tagla-tag', $.proxy(@handleTagClick, @)
    @wrapper.on 'click', '.tagla-tag-edit-link', $.proxy(@handleTagEdit, @)
    @wrapper.on 'click', '.tagla-tag-delete-link', $.proxy(@handleTagDelete, @)
    $(window).on 'resize', $.proxy(@handleWindowResize, @)

  render: ->
    # Delay to get dimension first
    unless @imageLoaded
      img = new Image()
      img.src = @image.attr('src')
      $(img)
        .one 'load', $.proxy(@handleImageLoad, @)
        .one 'error', $.proxy(@handleImageError, @)
      return

    @log 'render() is executed'
    @wrapper.addClass 'tagla'
    @appendTag tag for tag in @data
    @wrapper.addClass 'tagla-editing' if @editor

  destroy: ->
    @log 'destroy() is executed'

$.extend(Tagla::, proto)
window.Tagla = Tagla


###
      @wrapper.find('.tagla-select').each ->
        $(@).chosen
          placeholder_text_single: "Select an option"
          width: '310px'
        chosen = $(@).chosen().data('chosen')
        autoClose = false
        chosen_resultSelect_fn = chosen.result_select
        chosen.search_contains = true
        chosen.result_select = (evt) ->
          resultHighlight = null
          unless autoClose
            evt['metaKey'] = true
            evt['ctrlKey'] = true
            resultHighlight = chosen.result_highlight
          stext = chosen.get_search_text()
          result = chosen_resultSelect_fn.call(chosen, evt)

          if autoClose is off && resultHighlight != null
            resultHighlight.addClass('result-selected')

          @search_field.val(stext)
          @winnow_results()
          @search_field_scale()
          result
###
