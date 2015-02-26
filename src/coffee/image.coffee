class ImageSize extends Stackla.Base

  constructor: (el, callback) ->
    super()
    @init(el)
    @bind()
    @render(callback)
    return @

  toString: () -> 'ImageSize'

  init: (el) ->
    @el = $(el)[0]
    @complete = @el.complete
    @data = {}
    @_timer = null
    @data.width = @el.width
    @data.height = @el.height

  bind: ->
    @log 'bind() is executed'
    # Keep an eye on resize event
    $(window).resize (e) =>
      isEqual = @el.width is @data.width and @el.height is @data.height
      return if isEqual
      $.extend @data, {
        width: @el.width
        height: @el.height
        widthRatio: @el.width / @data.naturalWidth
        heightRatio: @el.height / @data.naturalHeight
      }
      @log 'handleResize() is executed'
      @.emit('change', [@data])

  render: (callback) ->
    @log 'render() is executed'
    # Image Loaded
    if @complete
      img = new Image()
      img.src = @el.src
      @log "Image '#{@el.src}' is loaded"
      @data.naturalWidth = img.width
      @data.naturalHeight = img.height
      callback(true, @data)
    # Image Loading
    else
      @log "Image '#{@el.src}' is NOT ready"
      img = new Image()
      img.src = @el.src
      img.onload = (e) =>
        @log "Image '#{img.src}' is loaded"
        @data.naturalWidth = img.width
        @data.naturalHeight = img.height
        callback(true, @data)
      img.onerror = (e) =>
        @log "Image '#{img.src}' is failed to load"
        callback(false, @data)


window.Stackla = {} unless window.Stackla

Stackla.getImageSize = (el, callback) ->
  new ImageSize(el, callback)
