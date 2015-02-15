class ImageSize extends Stackla.Base
  constructor: (el, callback) ->
    super()
    @el = $(el)[0]
    @debug = on
    @complete = @el.complete
    @data =
      width: @el.width
      height: @el.height
      naturalWidth: null
      naturalHeight: null
    @_timer = null
    # Image Loaded
    if @complete
      @log "Image '#{@el.src}' is ready"
      img = new Image()
      img.src = @el.src
      $.extend @data, {naturalWidth: img.width, naturalHeight: img.height}
      callback(true, @data)
    # Image Loading
    else
      @log "Image '#{@el.src}' is NOT ready"
      img = new Image()
      img.src = @el.src
      img.onload = (e) =>
        @log "Image '#{img.src}' is loaded"
        $.extend @data, {naturalWidth: img.width, naturalHeight: img.height}
        callback(true, @data)
      img.onerror = (e) =>
        @log "Image '#{img.src}' is failed to load"
        callback(false, @data)

    # Keep an eye on resize event
    $(window).resize (e) =>
      window.clearTimeout(@_timer) if @_timer
      @_timer = window.setTimeout =>
        isEqual = @el.width is @data.width and @el.height is @data.height
        return if isEqual
        $.extend @data, {
          width: @el.width
          height: @el.height
          widthRatio: @el.width / @data.naturalWidth
          heightRatio: @el.height / @data.naturalHeight
        }
        @.emit('change', [@data])
        @_timer = null
      , 100
    return @
  toString: () -> 'ImageSize'

window.Stackla = {} unless window.Stackla
Stackla.getImageSize = (el, callback) -> new ImageSize(el, callback)
