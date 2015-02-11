
class Tagla
  constructor: ($wrapper, options = {}) ->
    @wrapper = $($wrapper)
    @init(options)
    @bind()

Tagla.NAME = 'Tagla'
Tagla.PREFIX = 'tagla-'
Tagla.FORM_TEMPLATE = [
  '<form class="photo-tags-form photo-tags-form-hide">'
  '     <input type="hidden" name="x">'
  '     <input type="hidden" name="y">'
  '     <label class="photo-tags-form-label">'
  '         <select data-placeholder="Choose tags..." type="text" name="label" class="tagla-form-input chosen-select">'
  '             <option>Frankie Issue #6</option>'
  '             <option>Frankie Wall Calendar 2015</option>'
  '             <option>Frankie A5 Daily Planner</option>'
  '         </select>'
  '     </label>'
  '     <button type="submit" class="photo-tags-form-button">Save</button>'
  '     <button type="reset" class="photo-tags-form-button">Cancel</button>'
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
  '</div>'
].join('\n')
Tagla.NEW_TAG_TEMPLATE = [
  '<div class="tagla-tag">'
  '    <i class="tagla-icon fs fs-tag"></i>'
  '    <span class="tagla-label">{{label}}</span>'
  '</div>'
].join('\n')

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

  appendTag: (tag) ->
    @log 'appendTag() is executed'
    $tag = $(Mustache.render(@tagTemplate, tag))
    @wrapper.append($tag)

    offsetX = @formatFloat($tag.outerWidth() / 2 / @wrapper.width() * 100, 2)
    offsetY = @formatFloat($tag.outerHeight() / 2 / @wrapper.height() * 100, 2)
    setTimeout ->
      $tag.css
        left: "#{tag.x - offsetX}%"
        top: "#{tag.y - offsetY}%"
      , 500

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

  handleTagDelete: (e) ->
    @log 'handleTagDelete() is executed'
    e.preventDefault()
    $tag = $(e.currentTarget).parents('.tagla-tag')
    $tag.remove()
    instance = $tag.data('tagla-instance')
    instance.destroy() if (instance)

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
      instance = $(@).data('tagla-instance')
      if instance
        instance.enable()
      else
        instance = new Draggabilly(@, {containment: '.tagla'})
        $(@).data('tagla-instance', instance)

    @editor = on

  unedit: ->
    return if @edit is off
    @log 'unedit() is executed'
    @wrapper.find('.tagla-tag').each ->
      instance = $(@).data('tagla-instance')
      instance.disable()
    @wrapper.removeClass('tagla-editing')
    @editor = off

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
    instance = new Draggabilly($tag[0], {containment: '.tagla'})
    $(@).data('tagla-instance', instance)

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
    @wrapper.on 'mouseenter', $.proxy(@handleMouseEnter, @)
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
    @appendTag tag for tag in @data
    @wrapper.addClass 'tagla'


  destroy: ->
    @log 'destroy() is executed'

$.extend(Tagla::, proto)
window.Tagla = Tagla
