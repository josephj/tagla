###
# @class Stackla.Base
###
class Base

  constructor: (options = {}) ->
    debug = @getParams('debug')
    attrs = attrs or {}
    if debug
      @debug = (debug is 'true' or debug is '1')
    else if attrs.debug
      @debug = (attrs.debug is on)
    else
      @debug = false
    @_listeners = []

  toString: -> 'Base'

  log: (msg, type) ->
    return unless @debug
    type = type or 'info'
    if window.console and window.console[type]
      window.console[type] "[#{@toString()}] #{msg}"
    return

  on: (type, callback) ->
    if !type or !callback
      throw new Error('Both event type and callback are required parameters')
    @log 'on() - event \'' + type + '\' is subscribed'
    @_listeners[type] = [] unless @_listeners[type]
    callback.instance = @
    @_listeners[type].push(callback)
    callback

  emit: (type, data = []) ->
    @log "emit() - event '#{type}' is triggered"
    data.unshift
      type: type
      target: @
    throw new Error('Lacks of type parameter') unless type
    if @_listeners[type] and @_listeners[type].length
      for i of @_listeners[type]
        @_listeners[type][i].apply @, data
    @

  getParams: (key) ->
    href = @getUrl()
    params = {}
    pos = href.indexOf('?')
    @log 'getParams() is executed'
    if href.indexOf('#') != -1
      hashes = href.slice(pos + 1, href.indexOf('#')).split('&')
    else
      hashes = href.slice(pos + 1).split('&')
    for i of hashes
      hash = hashes[i].split('=')
      params[hash[0]] = hash[1]
    if key then params[key] else params

  getUrl: -> window.location.href

# Promote to global
window.Stackla = {} unless window.Stackla
window.Stackla.Base = Base
