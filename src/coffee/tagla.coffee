
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
  '<span class="tagla-tag">'
  '    <i class="fs fs-tag"><i>'
  '</span>'
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
    $tag.css
      left: "#{tag.x - offsetX}%"
      top: "#{tag.y - offsetY}%"

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

  handleWindowResize: (e) ->
    @log 'handleImageResize() is executed'
    image = @image[0]
    return if image.width is @currentWidth and image.height is @currentHeight
    @updateImageSize()

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
