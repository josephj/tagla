// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global window, $, define, document */
/**
 * A JavaScript utility which automatically aligns position of an overlay.
 *
 *      @example
 *      var alignMe = new AlignMe($overlay, {
 *          relateTo: '.draggable',
 *          constrainBy: '.parent',
 *          skipViewport: false
 *      });
 *      alignMe.align();
 *
 * @class AlignMe
 * @param {HTMLElement} overlay Overlay element
 * @param {Object} options Configurable options
 */

function AlignMe(overlay, options) {
    var that = this;

    that.overlay = $(overlay);
    //======================
    // Config Options
    //======================
    /**
     * @cfg {HTMLElement} relateTo (required)
     * The reference element
     */
    that.relateTo = $(options.relateTo) || null;
    /**
     * @cfg {HTMLElement} relateTo
     * The reference element
     */
    that.constrainBy = $(options.constrainBy) || null;
    /**
     * @cfg {HTMLElement} [skipViewport=true]
     * Ignore window as another constrain element
     */
    that.skipViewport = (options.skipViewport === false) ? false : true;

    // Stop if overlay or options.relatedTo arent provided
    if (!that.overlay) {
        throw new Error('`overlay` element is required');
    }
    if (!that.relateTo) {
        throw new Error('`relateTo` option is required');
    }
}

var _getMax,
    _getPoints,
    _listPositions,
    _setConstrainByViewport;

// Replacement for _.max
_getMax = function (obj, attr) {
    var maxValue = 0,
        maxItem,
        i, o;

    for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            o = obj[i];
            if (o[attr] > maxValue) {
                maxValue = o[attr];
                maxItem = o;
            }
        }
    }

    return maxItem;
};

// Get coordinates and dimension of an element
_getPoints = function ($el) {
    var offset = $el.offset(),
        width = $el.outerWidth(),
        height = $el.outerHeight();

    return {
        left   : offset.left,
        top    : offset.top,
        right  : offset.left + width,
        bottom : offset.top + height,
        width  : width,
        height : height
    };
};

// List all possible XY coordindates
_listPositions = function (overlayData, relateToData) {
    var center = relateToData.left + (relateToData.width / 2) - (overlayData.width / 2);

    return [
        // lblt ['left', 'bottom'], ['left', 'top']
        {left: relateToData.left, top: relateToData.top - overlayData.height, name: 'lblt'},
        // cbct ['center', 'bottom'], ['center', 'top']
        // {left: center, top: relateToData.top - overlayData.height, name: 'cbct'},
        // rbrt ['right', 'bottom'], ['right', 'top']
        {left: relateToData.right - overlayData.width, top: relateToData.top - overlayData.height, name: 'rbrt'},

        // ltrt ['left', 'top'], ['right', 'top']
        {left: relateToData.right, top: relateToData.top, name: 'ltrt'},
        // lbrb ['left', 'bottom'], ['right', 'bottom']
        {left: relateToData.right, top: relateToData.bottom - overlayData.height, name: 'lbrb'},

        // rtrb ['right', 'top'], ['right', 'bottom']
        {left: relateToData.right - overlayData.width, top: relateToData.bottom, name: 'rtrb'},
        // ctcb ['center', 'top'], ['center', 'bottom']
        // {left: center, top: relateToData.bottom, name: 'ctcb'},
        // ltlb ['left', 'top'], ['left', 'bottom']
        {left: relateToData.left, top: relateToData.bottom, name: 'ltlb'},

        // rblb ['right', 'bottom'], ['left', 'bottom']
        {left: relateToData.left - overlayData.width, top: relateToData.bottom - overlayData.height, name: 'rblb'},
        // rtlt ['right', 'top'], ['left', 'top']
        {left: relateToData.left - overlayData.width, top: relateToData.top, name: 'rtlt'}
    ];
};

// Take current viewport/window as constrain.
_setConstrainByViewport = function (constrainByData) {
    var $window = $(window),
        topmost = $window.scrollTop(),
        bottommost = topmost + $window.height();

    if (topmost > constrainByData) {
        constrainByData.top = topmost;
    }
    if (bottommost < constrainByData.bottom) {
        constrainByData.bottom = bottommost;
        constrainByData.height = bottommost - topmost;
    }
    return constrainByData;
};

/**
 * Align overlay automatically
 *
 * @method align
 * @return {Array} The best XY coordinates
 */
AlignMe.prototype.align = function () {
    var that = this,
        overlay = that.overlay,
        overlayData = _getPoints(overlay),
        relateToData = _getPoints(that.relateTo),
        constrainByData = _getPoints(that.constrainBy),
        positions = _listPositions(overlayData, relateToData), // All possible positions
        hasContain = false, // Indicates if any positions are fully contained by constrain element
        bestPos = {}, // Return value
        pos, i; // For Iteration

    // Constrain by viewport
    if (!that.skipViewport) {
        _setConstrainByViewport(constrainByData);
    }

    for (i in positions) {
        if (positions.hasOwnProperty(i)) {
            pos = positions[i];
            pos.right = pos.left + overlayData.width;
            pos.bottom = pos.top + overlayData.height;
            if (
                pos.left >= constrainByData.left &&
                pos.top >= constrainByData.top &&
                pos.right <= constrainByData.right &&
                pos.bottom <= constrainByData.bottom
            ) {
                // Inside distance. The more the better.
                // 4 distances to border of constrain
                pos.inDistance = Math.min.apply(null, [
                    pos.top - constrainByData.top,
                    constrainByData.right - pos.left + overlayData.width,
                    constrainByData.bottom - pos.top + overlayData.height,
                    pos.left - constrainByData.left
                ]);
                // Update flag
                hasContain = true;
            } else {
                // The more overlap the better
                pos.overlapSize =
                    (Math.min(pos.right, constrainByData.right) - Math.max(pos.left, constrainByData.left)) *
                    (Math.min(pos.bottom, constrainByData.bottom) - Math.max(pos.top, constrainByData.top)) ;
            }
        }
    }

    bestPos = (hasContain) ? _getMax(positions, 'inDistance') : _getMax(positions, 'overlapSize');
    overlay.offset(bestPos);

    return bestPos;
};

if (window.Stackla) { // Vanilla JS
    window.Stackla.AlignMe = AlignMe;
} else {
    window.AlignMe = AlignMe;
}

if (typeof exports === 'object' && exports) { // CommonJS
    module.exports = AlignMe;
} else if (typeof define === 'function' && define.amd) { // AMD
    define(['exports'], AlignMe);
}


},{}],2:[function(require,module,exports){
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false*/

(function (global, factory) {
  if (typeof exports === "object" && exports) {
    factory(exports); // CommonJS
  } else if (typeof define === "function" && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory(global.Mustache = {}); // <script>
  }
}(this, function (mustache) {

  var Object_toString = Object.prototype.toString;
  var isArray = Array.isArray || function (object) {
    return Object_toString.call(object) === '[object Array]';
  };

  function isFunction(object) {
    return typeof object === 'function';
  }

  function escapeRegExp(string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var RegExp_test = RegExp.prototype.test;
  function testRegExp(re, string) {
    return RegExp_test.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace(string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

  function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   */
  function parseTemplate(template, tags) {
    if (!template)
      return [];

    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace() {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags(tags) {
      if (typeof tags === 'string')
        tags = tags.split(spaceRe, 2);

      if (!isArray(tags) || tags.length !== 2)
        throw new Error('Invalid tags: ' + tags);

      openingTagRe = new RegExp(escapeRegExp(tags[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tags[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
          } else {
            nonSpace = true;
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n')
            stripSpace();
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      token = [ type, value, start, scanner.pos ];
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens(tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens(tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
      case '#':
      case '^':
        collector.push(token);
        sections.push(token);
        collector = token[4] = [];
        break;
      case '/':
        section = sections.pop();
        section[5] = token[2];
        collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
        break;
      default:
        collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner(string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function () {
    return this.tail === "";
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function (re) {
    var index = this.tail.search(re), match;

    switch (index) {
    case -1:
      match = this.tail;
      this.tail = "";
      break;
    case 0:
      match = "";
      break;
    default:
      match = this.tail.substring(0, index);
      this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context(view, parentContext) {
    this.view = view == null ? {} : view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function (name) {
    var cache = this.cache;

    var value;
    if (name in cache) {
      value = cache[name];
    } else {
      var context = this, names, index;

      while (context) {
        if (name.indexOf('.') > 0) {
          value = context.view;
          names = name.split('.');
          index = 0;

          while (value != null && index < names.length)
            value = value[names[index++]];
        } else if (typeof context.view == 'object') {
          value = context.view[name];
        }

        if (value != null)
          break;

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer() {
    this.cache = {};
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function () {
    this.cache = {};
  };

  /**
   * Parses and caches the given `template` and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function (template, tags) {
    var cache = this.cache;
    var tokens = cache[template];

    if (tokens == null)
      tokens = cache[template] = parseTemplate(template, tags);

    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   */
  Writer.prototype.render = function (template, view, partials) {
    var tokens = this.parse(template);
    var context = (view instanceof Context) ? view : new Context(view);
    return this.renderTokens(tokens, context, partials, template);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function (tokens, context, partials, originalTemplate) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this._renderSection(token, context, partials, originalTemplate);
      else if (symbol === '^') value = this._renderInverted(token, context, partials, originalTemplate);
      else if (symbol === '>') value = this._renderPartial(token, context, partials, originalTemplate);
      else if (symbol === '&') value = this._unescapedValue(token, context);
      else if (symbol === 'name') value = this._escapedValue(token, context);
      else if (symbol === 'text') value = this._rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype._renderSection = function (token, context, partials, originalTemplate) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender(template) {
      return self.render(template, context, partials);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
      }
    } else if (typeof value === 'object' || typeof value === 'string') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate);
    }
    return buffer;
  };

  Writer.prototype._renderInverted = function(token, context, partials, originalTemplate) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate);
  };

  Writer.prototype._renderPartial = function(token, context, partials) {
    if (!partials) return;

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null)
      return this.renderTokens(this.parse(value), context, partials, value);
  };

  Writer.prototype._unescapedValue = function(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype._escapedValue = function(token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return mustache.escape(value);
  };

  Writer.prototype._rawValue = function(token) {
    return token[1];
  };

  mustache.name = "mustache.js";
  mustache.version = "1.1.0";
  mustache.tags = [ "{{", "}}" ];

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view` and `partials` using the
   * default writer.
   */
  mustache.render = function (template, view, partials) {
    return defaultWriter.render(template, view, partials);
  };

  // This is here for backwards compatibility with 0.4.x.
  mustache.to_html = function (template, view, partials, send) {
    var result = mustache.render(template, view, partials);

    if (isFunction(send)) {
      send(result);
    } else {
      return result;
    }
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

}));

},{}],3:[function(require,module,exports){

/*
 * @class Stackla.Base
 */
var Base;

Base = (function() {
  function Base(options) {
    var attrs, debug;
    if (options == null) {
      options = {};
    }
    debug = this.getParams('debug');
    attrs = attrs || {};
    if (debug) {
      this.debug = debug === 'true' || debug === '1';
    } else if (attrs.debug) {
      this.debug = attrs.debug === true;
    } else {
      this.debug = false;
    }
    this._listeners = [];
  }

  Base.prototype.toString = function() {
    return 'Base';
  };

  Base.prototype.log = function(msg, type) {
    if (!this.debug) {
      return;
    }
    type = type || 'info';
    if (window.console && window.console[type]) {
      window.console[type]("[" + (this.toString()) + "] " + msg);
    }
  };

  Base.prototype.on = function(type, callback) {
    if (!type || !callback) {
      throw new Error('Both event type and callback are required parameters');
    }
    this.log('on() - event \'' + type + '\' is subscribed');
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    callback.instance = this;
    this._listeners[type].push(callback);
    return callback;
  };

  Base.prototype.emit = function(type, data) {
    var i;
    if (data == null) {
      data = [];
    }
    this.log("emit() - event '" + type + "' is triggered");
    data.unshift({
      type: type,
      target: this
    });
    if (!type) {
      throw new Error('Lacks of type parameter');
    }
    if (this._listeners[type] && this._listeners[type].length) {
      for (i in this._listeners[type]) {
        this._listeners[type][i].apply(this, data);
      }
    }
    return this;
  };

  Base.prototype.getParams = function(key) {
    var hash, hashes, href, i, params, pos;
    href = this.getUrl();
    params = {};
    pos = href.indexOf('?');
    this.log('getParams() is executed');
    if (href.indexOf('#') !== -1) {
      hashes = href.slice(pos + 1, href.indexOf('#')).split('&');
    } else {
      hashes = href.slice(pos + 1).split('&');
    }
    for (i in hashes) {
      hash = hashes[i].split('=');
      params[hash[0]] = hash[1];
    }
    if (key) {
      return params[key];
    } else {
      return params;
    }
  };

  Base.prototype.getUrl = function() {
    return window.location.href;
  };

  return Base;

})();

if (!window.Stackla) {
  window.Stackla = {};
}

window.Stackla.Base = Base;

module.exports = Base;



},{}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1

/*
 * @class Stackla.Base
 */
var Base;

Base = (function() {
  function Base(options) {
    var attrs, debug;
    if (options == null) {
      options = {};
    }
    debug = this.getParams('debug');
    attrs = attrs || {};
    if (debug) {
      this.debug = debug === 'true' || debug === '1';
    } else if (attrs.debug) {
      this.debug = attrs.debug === true;
    } else {
      this.debug = false;
    }
    this._listeners = [];
  }

  Base.prototype.toString = function() {
    return 'Base';
  };

  Base.prototype.log = function(msg, type) {
    if (!this.debug) {
      return;
    }
    type = type || 'info';
    if (window.console && window.console[type]) {
      window.console[type]("[" + (this.toString()) + "] " + msg);
    }
  };

  Base.prototype.on = function(type, callback) {
    if (!type || !callback) {
      throw new Error('Both event type and callback are required parameters');
    }
    this.log('on() - event \'' + type + '\' is subscribed');
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    callback.instance = this;
    this._listeners[type].push(callback);
    return callback;
  };

  Base.prototype.emit = function(type, data) {
    var i;
    if (data == null) {
      data = [];
    }
    this.log("emit() - event '" + type + "' is triggered");
    data.unshift({
      type: type,
      target: this
    });
    if (!type) {
      throw new Error('Lacks of type parameter');
    }
    if (this._listeners[type] && this._listeners[type].length) {
      for (i in this._listeners[type]) {
        this._listeners[type][i].apply(this, data);
      }
    }
    return this;
  };

  Base.prototype.getParams = function(key) {
    var hash, hashes, href, i, params, pos;
    href = this.getUrl();
    params = {};
    pos = href.indexOf('?');
    this.log('getParams() is executed');
    if (href.indexOf('#') !== -1) {
      hashes = href.slice(pos + 1, href.indexOf('#')).split('&');
    } else {
      hashes = href.slice(pos + 1).split('&');
    }
    for (i in hashes) {
      hash = hashes[i].split('=');
      params[hash[0]] = hash[1];
    }
    if (key) {
      return params[key];
    } else {
      return params;
    }
  };

  Base.prototype.getUrl = function() {
    return window.location.href;
  };

  return Base;

})();

if (!window.Stackla) {
  window.Stackla = {};
}

window.Stackla.Base = Base;

module.exports = Base;

},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var Base, ImageSize,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Base = require('./base.coffee');

ImageSize = (function(superClass) {
  extend(ImageSize, superClass);

  function ImageSize(el, callback) {
    ImageSize.__super__.constructor.call(this);
    this.init(el);
    this.bind();
    this.render(callback);
    return this;
  }

  ImageSize.prototype.toString = function() {
    return 'ImageSize';
  };

  ImageSize.prototype.init = function(el) {
    this.el = $(el)[0];
    this.complete = this.el.complete;
    this.data = {};
    this._timer = null;
    this.data.width = this.el.width;
    return this.data.height = this.el.height;
  };

  ImageSize.prototype.bind = function() {
    this.log('bind() is executed');
    return $(window).resize((function(_this) {
      return function(e) {
        var isEqual;
        isEqual = _this.el.width === _this.data.width && _this.el.height === _this.data.height;
        if (isEqual) {
          return;
        }
        $.extend(_this.data, {
          width: _this.el.width,
          height: _this.el.height,
          widthRatio: _this.el.width / _this.data.naturalWidth,
          heightRatio: _this.el.height / _this.data.naturalHeight
        });
        _this.log('handleResize() is executed');
        return _this.emit('change', [_this.data]);
      };
    })(this));
  };

  ImageSize.prototype.render = function(callback) {
    var img;
    this.log('render() is executed');
    if (this.complete) {
      img = new Image();
      img.src = this.el.src;
      this.log("Image '" + this.el.src + "' is loaded");
      this.data.naturalWidth = img.width;
      this.data.naturalHeight = img.height;
      return callback(true, this.data);
    } else {
      this.log("Image '" + this.el.src + "' is NOT ready");
      img = new Image();
      img.src = this.el.src;
      img.onload = (function(_this) {
        return function(e) {
          _this.log("Image '" + img.src + "' is loaded");
          _this.data.naturalWidth = img.width;
          _this.data.naturalHeight = img.height;
          return callback(true, _this.data);
        };
      })(this);
      return img.onerror = (function(_this) {
        return function(e) {
          _this.log("Image '" + img.src + "' is failed to load");
          return callback(false, _this.data);
        };
      })(this);
    }
  };

  return ImageSize;

})(Base);

if (!window.Stackla) {
  window.Stackla = {};
}

Stackla.getImageSize = function(el, callback) {
  return new ImageSize(el, callback);
};

module.exports = {
  get: function(el, callback) {
    return new ImageSize(el, callback);
  }
};

},{"./base.coffee":3}],6:[function(require,module,exports){
var ATTRS, AlignMe, Base, ImageSize, Mustache, Tagla, proto,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Mustache = require('mustache');

AlignMe = require('alignme');

Base = require('./base');

ImageSize = require('./image');

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

})(Base);

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
    $tag.data('align-dialog').align();
    $tag.data('align-form').align();
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
    $tag.data('align-form').align();
    $tag.data('align-dialog').align();
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
    $tag.data('align-dialog').align();
    $tag.data('align-form').align();
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
    var $dialog, $form, $tag, attrs, isNew, offsetX, offsetY, x, y;
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
    $dialog = $tag.find('.tagla-dialog');
    $form = $tag.find('.tagla-form');
    attrs = {
      relateTo: $tag,
      constrainBy: this.wrapper,
      skipViewport: false
    };
    $tag.data('align-dialog', new AlignMe($dialog, attrs));
    $tag.data('align-form', new AlignMe($form, attrs));
    $tag.data('align-dialog').align();
    $tag.data('align-form').align();
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
    this.imageSize = ImageSize.get(this.image, $.proxy(this.renderFn, this));
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

if (window.Stackla) {
  window.Stackla.Tagla = Tagla;
}



},{"./base":4,"./image":5,"alignme":1,"mustache":2}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYWxpZ25tZS9zcmMvanMvYWxpZ25tZS5qcyIsIm5vZGVfbW9kdWxlcy9tdXN0YWNoZS9tdXN0YWNoZS5qcyIsIi9Vc2Vycy9qb3NlcGhqL1JlcG9zL3RhZ2xhMi9zcmMvY29mZmVlL2Jhc2UuY29mZmVlIiwic3JjL2NvZmZlZS9iYXNlLmpzIiwic3JjL2NvZmZlZS9pbWFnZS5qcyIsIi9Vc2Vycy9qb3NlcGhqL1JlcG9zL3RhZ2xhMi9zcmMvY29mZmVlL3RhZ2xhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemtCQTtBQUFBOztHQUFBO0FBQUEsSUFBQSxJQUFBOztBQUFBO0FBS2UsRUFBQSxjQUFDLE9BQUQsR0FBQTtBQUNYLFFBQUEsWUFBQTs7TUFEWSxVQUFVO0tBQ3RCO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxPQUFYLENBQVIsQ0FBQTtBQUFBLElBQ0EsS0FBQSxHQUFRLEtBQUEsSUFBUyxFQURqQixD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aUIsRUFBakIsQ0FBQTtDQTlEQTs7QUFBQSxNQStETSxDQUFDLE9BQU8sQ0FBQyxJQUFmLEdBQXNCLElBL0R0QixDQUFBOztBQUFBLE1BaUVNLENBQUMsT0FBUCxHQUFpQixJQWpFakIsQ0FBQTs7Ozs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDLE9BQXZDO0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQWYsR0FBdUIsS0FBdkIsQ0FBQTtDQW5jQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCB3aW5kb3csICQsIGRlZmluZSwgZG9jdW1lbnQgKi9cbi8qKlxuICogQSBKYXZhU2NyaXB0IHV0aWxpdHkgd2hpY2ggYXV0b21hdGljYWxseSBhbGlnbnMgcG9zaXRpb24gb2YgYW4gb3ZlcmxheS5cbiAqXG4gKiAgICAgIEBleGFtcGxlXG4gKiAgICAgIHZhciBhbGlnbk1lID0gbmV3IEFsaWduTWUoJG92ZXJsYXksIHtcbiAqICAgICAgICAgIHJlbGF0ZVRvOiAnLmRyYWdnYWJsZScsXG4gKiAgICAgICAgICBjb25zdHJhaW5CeTogJy5wYXJlbnQnLFxuICogICAgICAgICAgc2tpcFZpZXdwb3J0OiBmYWxzZVxuICogICAgICB9KTtcbiAqICAgICAgYWxpZ25NZS5hbGlnbigpO1xuICpcbiAqIEBjbGFzcyBBbGlnbk1lXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvdmVybGF5IE92ZXJsYXkgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQ29uZmlndXJhYmxlIG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBBbGlnbk1lKG92ZXJsYXksIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGF0Lm92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbmZpZyBPcHRpb25zXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IHJlbGF0ZVRvIChyZXF1aXJlZClcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnJlbGF0ZVRvID0gJChvcHRpb25zLnJlbGF0ZVRvKSB8fCBudWxsO1xuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSByZWxhdGVUb1xuICAgICAqIFRoZSByZWZlcmVuY2UgZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQuY29uc3RyYWluQnkgPSAkKG9wdGlvbnMuY29uc3RyYWluQnkpIHx8IG51bGw7XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IFtza2lwVmlld3BvcnQ9dHJ1ZV1cbiAgICAgKiBJZ25vcmUgd2luZG93IGFzIGFub3RoZXIgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnNraXBWaWV3cG9ydCA9IChvcHRpb25zLnNraXBWaWV3cG9ydCA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgLy8gU3RvcCBpZiBvdmVybGF5IG9yIG9wdGlvbnMucmVsYXRlZFRvIGFyZW50IHByb3ZpZGVkXG4gICAgaWYgKCF0aGF0Lm92ZXJsYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgb3ZlcmxheWAgZWxlbWVudCBpcyByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBpZiAoIXRoYXQucmVsYXRlVG8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgcmVsYXRlVG9gIG9wdGlvbiBpcyByZXF1aXJlZCcpO1xuICAgIH1cbn1cblxudmFyIF9nZXRNYXgsXG4gICAgX2dldFBvaW50cyxcbiAgICBfbGlzdFBvc2l0aW9ucyxcbiAgICBfc2V0Q29uc3RyYWluQnlWaWV3cG9ydDtcblxuLy8gUmVwbGFjZW1lbnQgZm9yIF8ubWF4XG5fZ2V0TWF4ID0gZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgIHZhciBtYXhWYWx1ZSA9IDAsXG4gICAgICAgIG1heEl0ZW0sXG4gICAgICAgIGksIG87XG5cbiAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIG8gPSBvYmpbaV07XG4gICAgICAgICAgICBpZiAob1thdHRyXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbWF4VmFsdWUgPSBvW2F0dHJdO1xuICAgICAgICAgICAgICAgIG1heEl0ZW0gPSBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heEl0ZW07XG59O1xuXG4vLyBHZXQgY29vcmRpbmF0ZXMgYW5kIGRpbWVuc2lvbiBvZiBhbiBlbGVtZW50XG5fZ2V0UG9pbnRzID0gZnVuY3Rpb24gKCRlbCkge1xuICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCksXG4gICAgICAgIHdpZHRoID0gJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgaGVpZ2h0ID0gJGVsLm91dGVySGVpZ2h0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0ICAgOiBvZmZzZXQubGVmdCxcbiAgICAgICAgdG9wICAgIDogb2Zmc2V0LnRvcCxcbiAgICAgICAgcmlnaHQgIDogb2Zmc2V0LmxlZnQgKyB3aWR0aCxcbiAgICAgICAgYm90dG9tIDogb2Zmc2V0LnRvcCArIGhlaWdodCxcbiAgICAgICAgd2lkdGggIDogd2lkdGgsXG4gICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgIH07XG59O1xuXG4vLyBMaXN0IGFsbCBwb3NzaWJsZSBYWSBjb29yZGluZGF0ZXNcbl9saXN0UG9zaXRpb25zID0gZnVuY3Rpb24gKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpIHtcbiAgICB2YXIgY2VudGVyID0gcmVsYXRlVG9EYXRhLmxlZnQgKyAocmVsYXRlVG9EYXRhLndpZHRoIC8gMikgLSAob3ZlcmxheURhdGEud2lkdGggLyAyKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC8vIGxibHQgWydsZWZ0JywgJ2JvdHRvbSddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdsYmx0J30sXG4gICAgICAgIC8vIGNiY3QgWydjZW50ZXInLCAnYm90dG9tJ10sIFsnY2VudGVyJywgJ3RvcCddXG4gICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2NiY3QnfSxcbiAgICAgICAgLy8gcmJydCBbJ3JpZ2h0JywgJ2JvdHRvbSddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJydCd9LFxuXG4gICAgICAgIC8vIGx0cnQgWydsZWZ0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCwgbmFtZTogJ2x0cnQnfSxcbiAgICAgICAgLy8gbGJyYiBbJ2xlZnQnLCAnYm90dG9tJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJyYid9LFxuXG4gICAgICAgIC8vIHJ0cmIgWydyaWdodCcsICd0b3AnXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ3J0cmInfSxcbiAgICAgICAgLy8gY3RjYiBbJ2NlbnRlcicsICd0b3AnXSwgWydjZW50ZXInLCAnYm90dG9tJ11cbiAgICAgICAgLy8ge2xlZnQ6IGNlbnRlciwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnY3RjYid9LFxuICAgICAgICAvLyBsdGxiIFsnbGVmdCcsICd0b3AnXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnbHRsYid9LFxuXG4gICAgICAgIC8vIHJibGIgWydyaWdodCcsICdib3R0b20nXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20gLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYmxiJ30sXG4gICAgICAgIC8vIHJ0bHQgWydyaWdodCcsICd0b3AnXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdydGx0J31cbiAgICBdO1xufTtcblxuLy8gVGFrZSBjdXJyZW50IHZpZXdwb3J0L3dpbmRvdyBhcyBjb25zdHJhaW4uXG5fc2V0Q29uc3RyYWluQnlWaWV3cG9ydCA9IGZ1bmN0aW9uIChjb25zdHJhaW5CeURhdGEpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KSxcbiAgICAgICAgdG9wbW9zdCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCksXG4gICAgICAgIGJvdHRvbW1vc3QgPSB0b3Btb3N0ICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgIGlmICh0b3Btb3N0ID4gY29uc3RyYWluQnlEYXRhKSB7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS50b3AgPSB0b3Btb3N0O1xuICAgIH1cbiAgICBpZiAoYm90dG9tbW9zdCA8IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIHtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSA9IGJvdHRvbW1vc3Q7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5oZWlnaHQgPSBib3R0b21tb3N0IC0gdG9wbW9zdDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnN0cmFpbkJ5RGF0YTtcbn07XG5cbi8qKlxuICogQWxpZ24gb3ZlcmxheSBhdXRvbWF0aWNhbGx5XG4gKlxuICogQG1ldGhvZCBhbGlnblxuICogQHJldHVybiB7QXJyYXl9IFRoZSBiZXN0IFhZIGNvb3JkaW5hdGVzXG4gKi9cbkFsaWduTWUucHJvdG90eXBlLmFsaWduID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgb3ZlcmxheSA9IHRoYXQub3ZlcmxheSxcbiAgICAgICAgb3ZlcmxheURhdGEgPSBfZ2V0UG9pbnRzKG92ZXJsYXkpLFxuICAgICAgICByZWxhdGVUb0RhdGEgPSBfZ2V0UG9pbnRzKHRoYXQucmVsYXRlVG8pLFxuICAgICAgICBjb25zdHJhaW5CeURhdGEgPSBfZ2V0UG9pbnRzKHRoYXQuY29uc3RyYWluQnkpLFxuICAgICAgICBwb3NpdGlvbnMgPSBfbGlzdFBvc2l0aW9ucyhvdmVybGF5RGF0YSwgcmVsYXRlVG9EYXRhKSwgLy8gQWxsIHBvc3NpYmxlIHBvc2l0aW9uc1xuICAgICAgICBoYXNDb250YWluID0gZmFsc2UsIC8vIEluZGljYXRlcyBpZiBhbnkgcG9zaXRpb25zIGFyZSBmdWxseSBjb250YWluZWQgYnkgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgICAgYmVzdFBvcyA9IHt9LCAvLyBSZXR1cm4gdmFsdWVcbiAgICAgICAgcG9zLCBpOyAvLyBGb3IgSXRlcmF0aW9uXG5cbiAgICAvLyBDb25zdHJhaW4gYnkgdmlld3BvcnRcbiAgICBpZiAoIXRoYXQuc2tpcFZpZXdwb3J0KSB7XG4gICAgICAgIF9zZXRDb25zdHJhaW5CeVZpZXdwb3J0KGNvbnN0cmFpbkJ5RGF0YSk7XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHBvc2l0aW9ucykge1xuICAgICAgICBpZiAocG9zaXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBwb3MgPSBwb3NpdGlvbnNbaV07XG4gICAgICAgICAgICBwb3MucmlnaHQgPSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoO1xuICAgICAgICAgICAgcG9zLmJvdHRvbSA9IHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQ7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcG9zLmxlZnQgPj0gY29uc3RyYWluQnlEYXRhLmxlZnQgJiZcbiAgICAgICAgICAgICAgICBwb3MudG9wID49IGNvbnN0cmFpbkJ5RGF0YS50b3AgJiZcbiAgICAgICAgICAgICAgICBwb3MucmlnaHQgPD0gY29uc3RyYWluQnlEYXRhLnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgcG9zLmJvdHRvbSA8PSBjb25zdHJhaW5CeURhdGEuYm90dG9tXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBJbnNpZGUgZGlzdGFuY2UuIFRoZSBtb3JlIHRoZSBiZXR0ZXIuXG4gICAgICAgICAgICAgICAgLy8gNCBkaXN0YW5jZXMgdG8gYm9yZGVyIG9mIGNvbnN0cmFpblxuICAgICAgICAgICAgICAgIHBvcy5pbkRpc3RhbmNlID0gTWF0aC5taW4uYXBwbHkobnVsbCwgW1xuICAgICAgICAgICAgICAgICAgICBwb3MudG9wIC0gY29uc3RyYWluQnlEYXRhLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLnJpZ2h0IC0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSAtIHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBvcy5sZWZ0IC0gY29uc3RyYWluQnlEYXRhLmxlZnRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZmxhZ1xuICAgICAgICAgICAgICAgIGhhc0NvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbW9yZSBvdmVybGFwIHRoZSBiZXR0ZXJcbiAgICAgICAgICAgICAgICBwb3Mub3ZlcmxhcFNpemUgPVxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLnJpZ2h0LCBjb25zdHJhaW5CeURhdGEucmlnaHQpIC0gTWF0aC5tYXgocG9zLmxlZnQsIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0KSkgKlxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLmJvdHRvbSwgY29uc3RyYWluQnlEYXRhLmJvdHRvbSkgLSBNYXRoLm1heChwb3MudG9wLCBjb25zdHJhaW5CeURhdGEudG9wKSkgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmVzdFBvcyA9IChoYXNDb250YWluKSA/IF9nZXRNYXgocG9zaXRpb25zLCAnaW5EaXN0YW5jZScpIDogX2dldE1heChwb3NpdGlvbnMsICdvdmVybGFwU2l6ZScpO1xuICAgIG92ZXJsYXkub2Zmc2V0KGJlc3RQb3MpO1xuXG4gICAgcmV0dXJuIGJlc3RQb3M7XG59O1xuXG5pZiAod2luZG93LlN0YWNrbGEpIHsgLy8gVmFuaWxsYSBKU1xuICAgIHdpbmRvdy5TdGFja2xhLkFsaWduTWUgPSBBbGlnbk1lO1xufSBlbHNlIHtcbiAgICB3aW5kb3cuQWxpZ25NZSA9IEFsaWduTWU7XG59XG5cbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgZXhwb3J0cykgeyAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gQWxpZ25NZTtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7IC8vIEFNRFxuICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgQWxpZ25NZSk7XG59XG5cbiIsIi8qIVxuICogbXVzdGFjaGUuanMgLSBMb2dpYy1sZXNzIHt7bXVzdGFjaGV9fSB0ZW1wbGF0ZXMgd2l0aCBKYXZhU2NyaXB0XG4gKiBodHRwOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzXG4gKi9cblxuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiBleHBvcnRzKSB7XG4gICAgZmFjdG9yeShleHBvcnRzKTsgLy8gQ29tbW9uSlNcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSk7IC8vIEFNRFxuICB9IGVsc2Uge1xuICAgIGZhY3RvcnkoZ2xvYmFsLk11c3RhY2hlID0ge30pOyAvLyA8c2NyaXB0PlxuICB9XG59KHRoaXMsIGZ1bmN0aW9uIChtdXN0YWNoZSkge1xuXG4gIHZhciBPYmplY3RfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3RfdG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIik7XG4gIH1cblxuICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2lzc3Vlcy5hcGFjaGUub3JnL2ppcmEvYnJvd3NlL0NPVUNIREItNTc3XG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg5XG4gIHZhciBSZWdFeHBfdGVzdCA9IFJlZ0V4cC5wcm90b3R5cGUudGVzdDtcbiAgZnVuY3Rpb24gdGVzdFJlZ0V4cChyZSwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIFJlZ0V4cF90ZXN0LmNhbGwocmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgbm9uU3BhY2VSZSA9IC9cXFMvO1xuICBmdW5jdGlvbiBpc1doaXRlc3BhY2Uoc3RyaW5nKSB7XG4gICAgcmV0dXJuICF0ZXN0UmVnRXhwKG5vblNwYWNlUmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIFwiJlwiOiBcIiZhbXA7XCIsXG4gICAgXCI8XCI6IFwiJmx0O1wiLFxuICAgIFwiPlwiOiBcIiZndDtcIixcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICBcIi9cIjogJyYjeDJGOydcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVIdG1sKHN0cmluZykge1xuICAgIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKC9bJjw+XCInXFwvXS9nLCBmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciB3aGl0ZVJlID0gL1xccyovO1xuICB2YXIgc3BhY2VSZSA9IC9cXHMrLztcbiAgdmFyIGVxdWFsc1JlID0gL1xccyo9LztcbiAgdmFyIGN1cmx5UmUgPSAvXFxzKlxcfS87XG4gIHZhciB0YWdSZSA9IC8jfFxcXnxcXC98PnxcXHt8Jnw9fCEvO1xuXG4gIC8qKlxuICAgKiBCcmVha3MgdXAgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgc3RyaW5nIGludG8gYSB0cmVlIG9mIHRva2Vucy4gSWYgdGhlIGB0YWdzYFxuICAgKiBhcmd1bWVudCBpcyBnaXZlbiBoZXJlIGl0IG11c3QgYmUgYW4gYXJyYXkgd2l0aCB0d28gc3RyaW5nIHZhbHVlczogdGhlXG4gICAqIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLiBbIFwiPCVcIiwgXCIlPlwiIF0pLiBPZlxuICAgKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gbXVzdGFjaGUudGFncykuXG4gICAqXG4gICAqIEEgdG9rZW4gaXMgYW4gYXJyYXkgd2l0aCBhdCBsZWFzdCA0IGVsZW1lbnRzLiBUaGUgZmlyc3QgZWxlbWVudCBpcyB0aGVcbiAgICogbXVzdGFjaGUgc3ltYm9sIHRoYXQgd2FzIHVzZWQgaW5zaWRlIHRoZSB0YWcsIGUuZy4gXCIjXCIgb3IgXCImXCIuIElmIHRoZSB0YWdcbiAgICogZGlkIG5vdCBjb250YWluIGEgc3ltYm9sIChpLmUuIHt7bXlWYWx1ZX19KSB0aGlzIGVsZW1lbnQgaXMgXCJuYW1lXCIuIEZvclxuICAgKiBhbGwgdGV4dCB0aGF0IGFwcGVhcnMgb3V0c2lkZSBhIHN5bWJvbCB0aGlzIGVsZW1lbnQgaXMgXCJ0ZXh0XCIuXG4gICAqXG4gICAqIFRoZSBzZWNvbmQgZWxlbWVudCBvZiBhIHRva2VuIGlzIGl0cyBcInZhbHVlXCIuIEZvciBtdXN0YWNoZSB0YWdzIHRoaXMgaXNcbiAgICogd2hhdGV2ZXIgZWxzZSB3YXMgaW5zaWRlIHRoZSB0YWcgYmVzaWRlcyB0aGUgb3BlbmluZyBzeW1ib2wuIEZvciB0ZXh0IHRva2Vuc1xuICAgKiB0aGlzIGlzIHRoZSB0ZXh0IGl0c2VsZi5cbiAgICpcbiAgICogVGhlIHRoaXJkIGFuZCBmb3VydGggZWxlbWVudHMgb2YgdGhlIHRva2VuIGFyZSB0aGUgc3RhcnQgYW5kIGVuZCBpbmRpY2VzLFxuICAgKiByZXNwZWN0aXZlbHksIG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXG4gICAqXG4gICAqIFRva2VucyB0aGF0IGFyZSB0aGUgcm9vdCBub2RlIG9mIGEgc3VidHJlZSBjb250YWluIHR3byBtb3JlIGVsZW1lbnRzOiAxKSBhblxuICAgKiBhcnJheSBvZiB0b2tlbnMgaW4gdGhlIHN1YnRyZWUgYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgYXRcbiAgICogd2hpY2ggdGhlIGNsb3NpbmcgdGFnIGZvciB0aGF0IHNlY3Rpb24gYmVnaW5zLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncykge1xuICAgIGlmICghdGVtcGxhdGUpXG4gICAgICByZXR1cm4gW107XG5cbiAgICB2YXIgc2VjdGlvbnMgPSBbXTsgICAgIC8vIFN0YWNrIHRvIGhvbGQgc2VjdGlvbiB0b2tlbnNcbiAgICB2YXIgdG9rZW5zID0gW107ICAgICAgIC8vIEJ1ZmZlciB0byBob2xkIHRoZSB0b2tlbnNcbiAgICB2YXIgc3BhY2VzID0gW107ICAgICAgIC8vIEluZGljZXMgb2Ygd2hpdGVzcGFjZSB0b2tlbnMgb24gdGhlIGN1cnJlbnQgbGluZVxuICAgIHZhciBoYXNUYWcgPSBmYWxzZTsgICAgLy8gSXMgdGhlcmUgYSB7e3RhZ319IG9uIHRoZSBjdXJyZW50IGxpbmU/XG4gICAgdmFyIG5vblNwYWNlID0gZmFsc2U7ICAvLyBJcyB0aGVyZSBhIG5vbi1zcGFjZSBjaGFyIG9uIHRoZSBjdXJyZW50IGxpbmU/XG5cbiAgICAvLyBTdHJpcHMgYWxsIHdoaXRlc3BhY2UgdG9rZW5zIGFycmF5IGZvciB0aGUgY3VycmVudCBsaW5lXG4gICAgLy8gaWYgdGhlcmUgd2FzIGEge3sjdGFnfX0gb24gaXQgYW5kIG90aGVyd2lzZSBvbmx5IHNwYWNlLlxuICAgIGZ1bmN0aW9uIHN0cmlwU3BhY2UoKSB7XG4gICAgICBpZiAoaGFzVGFnICYmICFub25TcGFjZSkge1xuICAgICAgICB3aGlsZSAoc3BhY2VzLmxlbmd0aClcbiAgICAgICAgICBkZWxldGUgdG9rZW5zW3NwYWNlcy5wb3AoKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgaGFzVGFnID0gZmFsc2U7XG4gICAgICBub25TcGFjZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBvcGVuaW5nVGFnUmUsIGNsb3NpbmdUYWdSZSwgY2xvc2luZ0N1cmx5UmU7XG4gICAgZnVuY3Rpb24gY29tcGlsZVRhZ3ModGFncykge1xuICAgICAgaWYgKHR5cGVvZiB0YWdzID09PSAnc3RyaW5nJylcbiAgICAgICAgdGFncyA9IHRhZ3Muc3BsaXQoc3BhY2VSZSwgMik7XG5cbiAgICAgIGlmICghaXNBcnJheSh0YWdzKSB8fCB0YWdzLmxlbmd0aCAhPT0gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZ3M6ICcgKyB0YWdzKTtcblxuICAgICAgb3BlbmluZ1RhZ1JlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAodGFnc1swXSkgKyAnXFxcXHMqJyk7XG4gICAgICBjbG9zaW5nVGFnUmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKHRhZ3NbMV0pKTtcbiAgICAgIGNsb3NpbmdDdXJseVJlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCgnfScgKyB0YWdzWzFdKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZVRhZ3ModGFncyB8fCBtdXN0YWNoZS50YWdzKTtcblxuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgdmFyIHN0YXJ0LCB0eXBlLCB2YWx1ZSwgY2hyLCB0b2tlbiwgb3BlblNlY3Rpb247XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvcygpKSB7XG4gICAgICBzdGFydCA9IHNjYW5uZXIucG9zO1xuXG4gICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKG9wZW5pbmdUYWdSZSk7XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCB2YWx1ZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2hyID0gdmFsdWUuY2hhckF0KGkpO1xuXG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjaHIpKSB7XG4gICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRva2Vucy5wdXNoKFsgJ3RleHQnLCBjaHIsIHN0YXJ0LCBzdGFydCArIDEgXSk7XG4gICAgICAgICAgc3RhcnQgKz0gMTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aGl0ZXNwYWNlIG9uIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgICAgICAgaWYgKGNociA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdHJpcFNwYWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIG9wZW5pbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4ob3BlbmluZ1RhZ1JlKSlcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGhhc1RhZyA9IHRydWU7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHR5cGUuXG4gICAgICB0eXBlID0gc2Nhbm5lci5zY2FuKHRhZ1JlKSB8fCAnbmFtZSc7XG4gICAgICBzY2FubmVyLnNjYW4od2hpdGVSZSk7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHZhbHVlLlxuICAgICAgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ0N1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oY3VybHlSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICAgIHR5cGUgPSAnJic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBjbG9zaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKGNsb3NpbmdUYWdSZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgdGFnIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICAgIHRva2VuID0gWyB0eXBlLCB2YWx1ZSwgc3RhcnQsIHNjYW5uZXIucG9zIF07XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG5cbiAgICAgIGlmICh0eXBlID09PSAnIycgfHwgdHlwZSA9PT0gJ14nKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnLycpIHtcbiAgICAgICAgLy8gQ2hlY2sgc2VjdGlvbiBuZXN0aW5nLlxuICAgICAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuXG4gICAgICAgIGlmICghb3BlblNlY3Rpb24pXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbm9wZW5lZCBzZWN0aW9uIFwiJyArIHZhbHVlICsgJ1wiIGF0ICcgKyBzdGFydCk7XG5cbiAgICAgICAgaWYgKG9wZW5TZWN0aW9uWzFdICE9PSB2YWx1ZSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHN0YXJ0KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ25hbWUnIHx8IHR5cGUgPT09ICd7JyB8fCB0eXBlID09PSAnJicpIHtcbiAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgLy8gU2V0IHRoZSB0YWdzIGZvciB0aGUgbmV4dCB0aW1lIGFyb3VuZC5cbiAgICAgICAgY29tcGlsZVRhZ3ModmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3BlbiBzZWN0aW9ucyB3aGVuIHdlJ3JlIGRvbmUuXG4gICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcblxuICAgIGlmIChvcGVuU2VjdGlvbilcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgcmV0dXJuIG5lc3RUb2tlbnMoc3F1YXNoVG9rZW5zKHRva2VucykpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbWJpbmVzIHRoZSB2YWx1ZXMgb2YgY29uc2VjdXRpdmUgdGV4dCB0b2tlbnMgaW4gdGhlIGdpdmVuIGB0b2tlbnNgIGFycmF5XG4gICAqIHRvIGEgc2luZ2xlIHRva2VuLlxuICAgKi9cbiAgZnVuY3Rpb24gc3F1YXNoVG9rZW5zKHRva2Vucykge1xuICAgIHZhciBzcXVhc2hlZFRva2VucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBsYXN0VG9rZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW5bMF0gPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4gJiYgbGFzdFRva2VuWzBdID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW5bMV0gKz0gdG9rZW5bMV07XG4gICAgICAgICAgbGFzdFRva2VuWzNdID0gdG9rZW5bM107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3F1YXNoZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgbGFzdFRva2VuID0gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3F1YXNoZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogRm9ybXMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIGludG8gYSBuZXN0ZWQgdHJlZSBzdHJ1Y3R1cmUgd2hlcmVcbiAgICogdG9rZW5zIHRoYXQgcmVwcmVzZW50IGEgc2VjdGlvbiBoYXZlIHR3byBhZGRpdGlvbmFsIGl0ZW1zOiAxKSBhbiBhcnJheSBvZlxuICAgKiBhbGwgdG9rZW5zIHRoYXQgYXBwZWFyIGluIHRoYXQgc2VjdGlvbiBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbFxuICAgKiB0ZW1wbGF0ZSB0aGF0IHJlcHJlc2VudHMgdGhlIGVuZCBvZiB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBuZXN0VG9rZW5zKHRva2Vucykge1xuICAgIHZhciBuZXN0ZWRUb2tlbnMgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gbmVzdGVkVG9rZW5zO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBzZWN0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICBjYXNlICcjJzpcbiAgICAgIGNhc2UgJ14nOlxuICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgICBjb2xsZWN0b3IgPSB0b2tlbls0XSA9IFtdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICBzZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgY29sbGVjdG9yID0gc2VjdGlvbnMubGVuZ3RoID4gMCA/IHNlY3Rpb25zW3NlY3Rpb25zLmxlbmd0aCAtIDFdWzRdIDogbmVzdGVkVG9rZW5zO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmVzdGVkVG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHN0cmluZyBzY2FubmVyIHRoYXQgaXMgdXNlZCBieSB0aGUgdGVtcGxhdGUgcGFyc2VyIHRvIGZpbmRcbiAgICogdG9rZW5zIGluIHRlbXBsYXRlIHN0cmluZ3MuXG4gICAqL1xuICBmdW5jdGlvbiBTY2FubmVyKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRhaWwgPT09IFwiXCI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIG1hdGNoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIFJldHVybnMgdGhlIG1hdGNoZWQgdGV4dCBpZiBpdCBjYW4gbWF0Y2gsIHRoZSBlbXB0eSBzdHJpbmcgb3RoZXJ3aXNlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBtYXRjaCA9IHRoaXMudGFpbC5tYXRjaChyZSk7XG5cbiAgICBpZiAoIW1hdGNoIHx8IG1hdGNoLmluZGV4ICE9PSAwKVxuICAgICAgcmV0dXJuICcnO1xuXG4gICAgdmFyIHN0cmluZyA9IG1hdGNoWzBdO1xuXG4gICAgdGhpcy50YWlsID0gdGhpcy50YWlsLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKTtcbiAgICB0aGlzLnBvcyArPSBzdHJpbmcubGVuZ3RoO1xuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcblxuICAvKipcbiAgICogU2tpcHMgYWxsIHRleHQgdW50aWwgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBjYW4gYmUgbWF0Y2hlZC4gUmV0dXJuc1xuICAgKiB0aGUgc2tpcHBlZCBzdHJpbmcsIHdoaWNoIGlzIHRoZSBlbnRpcmUgdGFpbCBpZiBubyBtYXRjaCBjYW4gYmUgbWFkZS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLnNjYW5VbnRpbCA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGFpbC5zZWFyY2gocmUpLCBtYXRjaDtcblxuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICBjYXNlIC0xOlxuICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICB0aGlzLnRhaWwgPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAwOlxuICAgICAgbWF0Y2ggPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1hdGNoID0gdGhpcy50YWlsLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSByZW5kZXJpbmcgY29udGV4dCBieSB3cmFwcGluZyBhIHZpZXcgb2JqZWN0IGFuZFxuICAgKiBtYWludGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAqL1xuICBmdW5jdGlvbiBDb250ZXh0KHZpZXcsIHBhcmVudENvbnRleHQpIHtcbiAgICB0aGlzLnZpZXcgPSB2aWV3ID09IG51bGwgPyB7fSA6IHZpZXc7XG4gICAgdGhpcy5jYWNoZSA9IHsgJy4nOiB0aGlzLnZpZXcgfTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudENvbnRleHQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjb250ZXh0IHVzaW5nIHRoZSBnaXZlbiB2aWV3IHdpdGggdGhpcyBjb250ZXh0XG4gICAqIGFzIHRoZSBwYXJlbnQuXG4gICAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKHZpZXcpIHtcbiAgICByZXR1cm4gbmV3IENvbnRleHQodmlldywgdGhpcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBuYW1lIGluIHRoaXMgY29udGV4dCwgdHJhdmVyc2luZ1xuICAgKiB1cCB0aGUgY29udGV4dCBoaWVyYXJjaHkgaWYgdGhlIHZhbHVlIGlzIGFic2VudCBpbiB0aGlzIGNvbnRleHQncyB2aWV3LlxuICAgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlO1xuXG4gICAgdmFyIHZhbHVlO1xuICAgIGlmIChuYW1lIGluIGNhY2hlKSB7XG4gICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIG5hbWVzLCBpbmRleDtcblxuICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignLicpID4gMCkge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dC52aWV3O1xuICAgICAgICAgIG5hbWVzID0gbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAgIHdoaWxlICh2YWx1ZSAhPSBudWxsICYmIGluZGV4IDwgbmFtZXMubGVuZ3RoKVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVtuYW1lc1tpbmRleCsrXV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnRleHQudmlldyA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dC52aWV3W25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICBjYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSlcbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLnZpZXcpO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIFdyaXRlciBrbm93cyBob3cgdG8gdGFrZSBhIHN0cmVhbSBvZiB0b2tlbnMgYW5kIHJlbmRlciB0aGVtIHRvIGFcbiAgICogc3RyaW5nLCBnaXZlbiBhIGNvbnRleHQuIEl0IGFsc28gbWFpbnRhaW5zIGEgY2FjaGUgb2YgdGVtcGxhdGVzIHRvXG4gICAqIGF2b2lkIHRoZSBuZWVkIHRvIHBhcnNlIHRoZSBzYW1lIHRlbXBsYXRlIHR3aWNlLlxuICAgKi9cbiAgZnVuY3Rpb24gV3JpdGVyKCkge1xuICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0ZW1wbGF0ZXMgaW4gdGhpcyB3cml0ZXIuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBhbmQgcmV0dXJucyB0aGUgYXJyYXkgb2YgdG9rZW5zXG4gICAqIHRoYXQgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHBhcnNlLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG4gICAgdmFyIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXTtcblxuICAgIGlmICh0b2tlbnMgPT0gbnVsbClcbiAgICAgIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHRhZ3MpO1xuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfTtcblxuICAvKipcbiAgICogSGlnaC1sZXZlbCBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCB3aXRoXG4gICAqIHRoZSBnaXZlbiBgdmlld2AuXG4gICAqXG4gICAqIFRoZSBvcHRpb25hbCBgcGFydGlhbHNgIGFyZ3VtZW50IG1heSBiZSBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGVcbiAgICogbmFtZXMgYW5kIHRlbXBsYXRlcyBvZiBwYXJ0aWFscyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZS4gSXQgbWF5XG4gICAqIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gbG9hZCBwYXJ0aWFsIHRlbXBsYXRlcyBvbiB0aGUgZmx5XG4gICAqIHRoYXQgdGFrZXMgYSBzaW5nbGUgYXJndW1lbnQ6IHRoZSBuYW1lIG9mIHRoZSBwYXJ0aWFsLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgdmFyIHRva2VucyA9IHRoaXMucGFyc2UodGVtcGxhdGUpO1xuICAgIHZhciBjb250ZXh0ID0gKHZpZXcgaW5zdGFuY2VvZiBDb250ZXh0KSA/IHZpZXcgOiBuZXcgQ29udGV4dCh2aWV3KTtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgdGVtcGxhdGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb3ctbGV2ZWwgbWV0aG9kIHRoYXQgcmVuZGVycyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgdXNpbmdcbiAgICogdGhlIGdpdmVuIGBjb250ZXh0YCBhbmQgYHBhcnRpYWxzYC5cbiAgICpcbiAgICogTm90ZTogVGhlIGBvcmlnaW5hbFRlbXBsYXRlYCBpcyBvbmx5IGV2ZXIgdXNlZCB0byBleHRyYWN0IHRoZSBwb3J0aW9uXG4gICAqIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHdhcyBjb250YWluZWQgaW4gYSBoaWdoZXItb3JkZXIgc2VjdGlvbi5cbiAgICogSWYgdGhlIHRlbXBsYXRlIGRvZXNuJ3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucywgdGhpcyBhcmd1bWVudCBtYXlcbiAgICogYmUgb21pdHRlZC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpIHtcbiAgICB2YXIgYnVmZmVyID0gJyc7XG5cbiAgICB2YXIgdG9rZW4sIHN5bWJvbCwgdmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIHN5bWJvbCA9IHRva2VuWzBdO1xuXG4gICAgICBpZiAoc3ltYm9sID09PSAnIycpIHZhbHVlID0gdGhpcy5fcmVuZGVyU2VjdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnXicpIHZhbHVlID0gdGhpcy5fcmVuZGVySW52ZXJ0ZWQodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJz4nKSB2YWx1ZSA9IHRoaXMuX3JlbmRlclBhcnRpYWwodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJyYnKSB2YWx1ZSA9IHRoaXMuX3VuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ25hbWUnKSB2YWx1ZSA9IHRoaXMuX2VzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICd0ZXh0JykgdmFsdWUgPSB0aGlzLl9yYXdWYWx1ZSh0b2tlbik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yZW5kZXJTZWN0aW9uID0gZnVuY3Rpb24gKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYnVmZmVyID0gJyc7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJlbmRlciBhbiBhcmJpdHJhcnkgdGVtcGxhdGVcbiAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBzZWN0aW9ucy5cbiAgICBmdW5jdGlvbiBzdWJSZW5kZXIodGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBzZWxmLnJlbmRlcih0ZW1wbGF0ZSwgY29udGV4dCwgcGFydGlhbHMpO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHJldHVybjtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBqIDwgdmFsdWVMZW5ndGg7ICsraikge1xuICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZVtqXSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LnB1c2godmFsdWUpLCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbFRlbXBsYXRlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucyB3aXRob3V0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZScpO1xuXG4gICAgICAvLyBFeHRyYWN0IHRoZSBwb3J0aW9uIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHRoZSBzZWN0aW9uIGNvbnRhaW5zLlxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKGNvbnRleHQudmlldywgb3JpZ2luYWxUZW1wbGF0ZS5zbGljZSh0b2tlblszXSwgdG9rZW5bNV0pLCBzdWJSZW5kZXIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yZW5kZXJJbnZlcnRlZCA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcblxuICAgIC8vIFVzZSBKYXZhU2NyaXB0J3MgZGVmaW5pdGlvbiBvZiBmYWxzeS4gSW5jbHVkZSBlbXB0eSBhcnJheXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODZcbiAgICBpZiAoIXZhbHVlIHx8IChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApKVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fcmVuZGVyUGFydGlhbCA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscykge1xuICAgIGlmICghcGFydGlhbHMpIHJldHVybjtcblxuICAgIHZhciB2YWx1ZSA9IGlzRnVuY3Rpb24ocGFydGlhbHMpID8gcGFydGlhbHModG9rZW5bMV0pIDogcGFydGlhbHNbdG9rZW5bMV1dO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRoaXMucGFyc2UodmFsdWUpLCBjb250ZXh0LCBwYXJ0aWFscywgdmFsdWUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3VuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gbXVzdGFjaGUuZXNjYXBlKHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yYXdWYWx1ZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgcmV0dXJuIHRva2VuWzFdO1xuICB9O1xuXG4gIG11c3RhY2hlLm5hbWUgPSBcIm11c3RhY2hlLmpzXCI7XG4gIG11c3RhY2hlLnZlcnNpb24gPSBcIjEuMS4wXCI7XG4gIG11c3RhY2hlLnRhZ3MgPSBbIFwie3tcIiwgXCJ9fVwiIF07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY2xlYXJDYWNoZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gdGVtcGxhdGUgaW4gdGhlIGRlZmF1bHQgd3JpdGVyIGFuZCByZXR1cm5zIHRoZVxuICAgKiBhcnJheSBvZiB0b2tlbnMgaXQgY29udGFpbnMuIERvaW5nIHRoaXMgYWhlYWQgb2YgdGltZSBhdm9pZHMgdGhlIG5lZWQgdG9cbiAgICogcGFyc2UgdGVtcGxhdGVzIG9uIHRoZSBmbHkgYXMgdGhleSBhcmUgcmVuZGVyZWQuXG4gICAqL1xuICBtdXN0YWNoZS5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnBhcnNlKHRlbXBsYXRlLCB0YWdzKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgYHRlbXBsYXRlYCB3aXRoIHRoZSBnaXZlbiBgdmlld2AgYW5kIGBwYXJ0aWFsc2AgdXNpbmcgdGhlXG4gICAqIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUucmVuZGVyID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuICB9O1xuXG4gIC8vIFRoaXMgaXMgaGVyZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCAwLjQueC5cbiAgbXVzdGFjaGUudG9faHRtbCA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHNlbmQpIHtcbiAgICB2YXIgcmVzdWx0ID0gbXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihzZW5kKSkge1xuICAgICAgc2VuZChyZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIGVzY2FwaW5nIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIHVzZXIgbWF5IG92ZXJyaWRlIGl0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzI0NFxuICBtdXN0YWNoZS5lc2NhcGUgPSBlc2NhcGVIdG1sO1xuXG4gIC8vIEV4cG9ydCB0aGVzZSBtYWlubHkgZm9yIHRlc3RpbmcsIGJ1dCBhbHNvIGZvciBhZHZhbmNlZCB1c2FnZS5cbiAgbXVzdGFjaGUuU2Nhbm5lciA9IFNjYW5uZXI7XG4gIG11c3RhY2hlLkNvbnRleHQgPSBDb250ZXh0O1xuICBtdXN0YWNoZS5Xcml0ZXIgPSBXcml0ZXI7XG5cbn0pKTtcbiIsIiMjI1xuIyBAY2xhc3MgU3RhY2tsYS5CYXNlXG4jIyNcbmNsYXNzIEJhc2VcblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBkZWJ1ZyA9IEBnZXRQYXJhbXMoJ2RlYnVnJylcbiAgICBhdHRycyA9IGF0dHJzIG9yIHt9XG4gICAgaWYgZGVidWdcbiAgICAgIEBkZWJ1ZyA9IChkZWJ1ZyBpcyAndHJ1ZScgb3IgZGVidWcgaXMgJzEnKVxuICAgIGVsc2UgaWYgYXR0cnMuZGVidWdcbiAgICAgIEBkZWJ1ZyA9IChhdHRycy5kZWJ1ZyBpcyBvbilcbiAgICBlbHNlXG4gICAgICBAZGVidWcgPSBmYWxzZVxuICAgIEBfbGlzdGVuZXJzID0gW11cblxuICB0b1N0cmluZzogLT4gJ0Jhc2UnXG5cbiAgbG9nOiAobXNnLCB0eXBlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGRlYnVnXG4gICAgdHlwZSA9IHR5cGUgb3IgJ2luZm8nXG4gICAgaWYgd2luZG93LmNvbnNvbGUgYW5kIHdpbmRvdy5jb25zb2xlW3R5cGVdXG4gICAgICB3aW5kb3cuY29uc29sZVt0eXBlXSBcIlsje0B0b1N0cmluZygpfV0gI3ttc2d9XCJcbiAgICByZXR1cm5cblxuICBvbjogKHR5cGUsIGNhbGxiYWNrKSAtPlxuICAgIGlmICF0eXBlIG9yICFjYWxsYmFja1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb3RoIGV2ZW50IHR5cGUgYW5kIGNhbGxiYWNrIGFyZSByZXF1aXJlZCBwYXJhbWV0ZXJzJylcbiAgICBAbG9nICdvbigpIC0gZXZlbnQgXFwnJyArIHR5cGUgKyAnXFwnIGlzIHN1YnNjcmliZWQnXG4gICAgQF9saXN0ZW5lcnNbdHlwZV0gPSBbXSB1bmxlc3MgQF9saXN0ZW5lcnNbdHlwZV1cbiAgICBjYWxsYmFjay5pbnN0YW5jZSA9IEBcbiAgICBAX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGNhbGxiYWNrKVxuICAgIGNhbGxiYWNrXG5cbiAgZW1pdDogKHR5cGUsIGRhdGEgPSBbXSkgLT5cbiAgICBAbG9nIFwiZW1pdCgpIC0gZXZlbnQgJyN7dHlwZX0nIGlzIHRyaWdnZXJlZFwiXG4gICAgZGF0YS51bnNoaWZ0XG4gICAgICB0eXBlOiB0eXBlXG4gICAgICB0YXJnZXQ6IEBcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0xhY2tzIG9mIHR5cGUgcGFyYW1ldGVyJykgdW5sZXNzIHR5cGVcbiAgICBpZiBAX2xpc3RlbmVyc1t0eXBlXSBhbmQgQF9saXN0ZW5lcnNbdHlwZV0ubGVuZ3RoXG4gICAgICBmb3IgaSBvZiBAX2xpc3RlbmVyc1t0eXBlXVxuICAgICAgICBAX2xpc3RlbmVyc1t0eXBlXVtpXS5hcHBseSBALCBkYXRhXG4gICAgQFxuXG4gIGdldFBhcmFtczogKGtleSkgLT5cbiAgICBocmVmID0gQGdldFVybCgpXG4gICAgcGFyYW1zID0ge31cbiAgICBwb3MgPSBocmVmLmluZGV4T2YoJz8nKVxuICAgIEBsb2cgJ2dldFBhcmFtcygpIGlzIGV4ZWN1dGVkJ1xuICAgIGlmIGhyZWYuaW5kZXhPZignIycpICE9IC0xXG4gICAgICBoYXNoZXMgPSBocmVmLnNsaWNlKHBvcyArIDEsIGhyZWYuaW5kZXhPZignIycpKS5zcGxpdCgnJicpXG4gICAgZWxzZVxuICAgICAgaGFzaGVzID0gaHJlZi5zbGljZShwb3MgKyAxKS5zcGxpdCgnJicpXG4gICAgZm9yIGkgb2YgaGFzaGVzXG4gICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9JylcbiAgICAgIHBhcmFtc1toYXNoWzBdXSA9IGhhc2hbMV1cbiAgICBpZiBrZXkgdGhlbiBwYXJhbXNba2V5XSBlbHNlIHBhcmFtc1xuXG4gIGdldFVybDogLT4gd2luZG93LmxvY2F0aW9uLmhyZWZcblxuIyBQcm9tb3RlIHRvIGdsb2JhbFxud2luZG93LlN0YWNrbGEgPSB7fSB1bmxlc3Mgd2luZG93LlN0YWNrbGFcbndpbmRvdy5TdGFja2xhLkJhc2UgPSBCYXNlXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuXG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG5cbi8qXG4gKiBAY2xhc3MgU3RhY2tsYS5CYXNlXG4gKi9cbnZhciBCYXNlO1xuXG5CYXNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBCYXNlKG9wdGlvbnMpIHtcbiAgICB2YXIgYXR0cnMsIGRlYnVnO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgZGVidWcgPSB0aGlzLmdldFBhcmFtcygnZGVidWcnKTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIGlmIChkZWJ1Zykge1xuICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnID09PSAndHJ1ZScgfHwgZGVidWcgPT09ICcxJztcbiAgICB9IGVsc2UgaWYgKGF0dHJzLmRlYnVnKSB7XG4gICAgICB0aGlzLmRlYnVnID0gYXR0cnMuZGVidWcgPT09IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVidWcgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gIH1cblxuICBCYXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnQmFzZSc7XG4gIH07XG5cbiAgQmFzZS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24obXNnLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLmRlYnVnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHR5cGUgPSB0eXBlIHx8ICdpbmZvJztcbiAgICBpZiAod2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGVbdHlwZV0pIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlW3R5cGVdKFwiW1wiICsgKHRoaXMudG9TdHJpbmcoKSkgKyBcIl0gXCIgKyBtc2cpO1xuICAgIH1cbiAgfTtcblxuICBCYXNlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb3RoIGV2ZW50IHR5cGUgYW5kIGNhbGxiYWNrIGFyZSByZXF1aXJlZCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuICAgIHRoaXMubG9nKCdvbigpIC0gZXZlbnQgXFwnJyArIHR5cGUgKyAnXFwnIGlzIHN1YnNjcmliZWQnKTtcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGNhbGxiYWNrLmluc3RhbmNlID0gdGhpcztcbiAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9O1xuXG4gIEJhc2UucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgZGF0YSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmxvZyhcImVtaXQoKSAtIGV2ZW50ICdcIiArIHR5cGUgKyBcIicgaXMgdHJpZ2dlcmVkXCIpO1xuICAgIGRhdGEudW5zaGlmdCh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdGFyZ2V0OiB0aGlzXG4gICAgfSk7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xhY2tzIG9mIHR5cGUgcGFyYW1ldGVyJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0ZW5lcnNbdHlwZV0gJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmxlbmd0aCkge1xuICAgICAgZm9yIChpIGluIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV1baV0uYXBwbHkodGhpcywgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEJhc2UucHJvdG90eXBlLmdldFBhcmFtcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBoYXNoLCBoYXNoZXMsIGhyZWYsIGksIHBhcmFtcywgcG9zO1xuICAgIGhyZWYgPSB0aGlzLmdldFVybCgpO1xuICAgIHBhcmFtcyA9IHt9O1xuICAgIHBvcyA9IGhyZWYuaW5kZXhPZignPycpO1xuICAgIHRoaXMubG9nKCdnZXRQYXJhbXMoKSBpcyBleGVjdXRlZCcpO1xuICAgIGlmIChocmVmLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSwgaHJlZi5pbmRleE9mKCcjJykpLnNwbGl0KCcmJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSkuc3BsaXQoJyYnKTtcbiAgICB9XG4gICAgZm9yIChpIGluIGhhc2hlcykge1xuICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xuICAgICAgcGFyYW1zW2hhc2hbMF1dID0gaGFzaFsxXTtcbiAgICB9XG4gICAgaWYgKGtleSkge1xuICAgICAgcmV0dXJuIHBhcmFtc1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cbiAgfTtcblxuICBCYXNlLnByb3RvdHlwZS5nZXRVcmwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIH07XG5cbiAgcmV0dXJuIEJhc2U7XG5cbn0pKCk7XG5cbmlmICghd2luZG93LlN0YWNrbGEpIHtcbiAgd2luZG93LlN0YWNrbGEgPSB7fTtcbn1cblxud2luZG93LlN0YWNrbGEuQmFzZSA9IEJhc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBCYXNlLCBJbWFnZVNpemUsXG4gIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlLmNvZmZlZScpO1xuXG5JbWFnZVNpemUgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICBleHRlbmQoSW1hZ2VTaXplLCBzdXBlckNsYXNzKTtcblxuICBmdW5jdGlvbiBJbWFnZVNpemUoZWwsIGNhbGxiYWNrKSB7XG4gICAgSW1hZ2VTaXplLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMpO1xuICAgIHRoaXMuaW5pdChlbCk7XG4gICAgdGhpcy5iaW5kKCk7XG4gICAgdGhpcy5yZW5kZXIoY2FsbGJhY2spO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgSW1hZ2VTaXplLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnSW1hZ2VTaXplJztcbiAgfTtcblxuICBJbWFnZVNpemUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihlbCkge1xuICAgIHRoaXMuZWwgPSAkKGVsKVswXTtcbiAgICB0aGlzLmNvbXBsZXRlID0gdGhpcy5lbC5jb21wbGV0ZTtcbiAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB0aGlzLl90aW1lciA9IG51bGw7XG4gICAgdGhpcy5kYXRhLndpZHRoID0gdGhpcy5lbC53aWR0aDtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmhlaWdodCA9IHRoaXMuZWwuaGVpZ2h0O1xuICB9O1xuXG4gIEltYWdlU2l6ZS5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMubG9nKCdiaW5kKCkgaXMgZXhlY3V0ZWQnKTtcbiAgICByZXR1cm4gJCh3aW5kb3cpLnJlc2l6ZSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciBpc0VxdWFsO1xuICAgICAgICBpc0VxdWFsID0gX3RoaXMuZWwud2lkdGggPT09IF90aGlzLmRhdGEud2lkdGggJiYgX3RoaXMuZWwuaGVpZ2h0ID09PSBfdGhpcy5kYXRhLmhlaWdodDtcbiAgICAgICAgaWYgKGlzRXF1YWwpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJC5leHRlbmQoX3RoaXMuZGF0YSwge1xuICAgICAgICAgIHdpZHRoOiBfdGhpcy5lbC53aWR0aCxcbiAgICAgICAgICBoZWlnaHQ6IF90aGlzLmVsLmhlaWdodCxcbiAgICAgICAgICB3aWR0aFJhdGlvOiBfdGhpcy5lbC53aWR0aCAvIF90aGlzLmRhdGEubmF0dXJhbFdpZHRoLFxuICAgICAgICAgIGhlaWdodFJhdGlvOiBfdGhpcy5lbC5oZWlnaHQgLyBfdGhpcy5kYXRhLm5hdHVyYWxIZWlnaHRcbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLmxvZygnaGFuZGxlUmVzaXplKCkgaXMgZXhlY3V0ZWQnKTtcbiAgICAgICAgcmV0dXJuIF90aGlzLmVtaXQoJ2NoYW5nZScsIFtfdGhpcy5kYXRhXSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfTtcblxuICBJbWFnZVNpemUucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGltZztcbiAgICB0aGlzLmxvZygncmVuZGVyKCkgaXMgZXhlY3V0ZWQnKTtcbiAgICBpZiAodGhpcy5jb21wbGV0ZSkge1xuICAgICAgaW1nID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWcuc3JjID0gdGhpcy5lbC5zcmM7XG4gICAgICB0aGlzLmxvZyhcIkltYWdlICdcIiArIHRoaXMuZWwuc3JjICsgXCInIGlzIGxvYWRlZFwiKTtcbiAgICAgIHRoaXMuZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGg7XG4gICAgICB0aGlzLmRhdGEubmF0dXJhbEhlaWdodCA9IGltZy5oZWlnaHQ7XG4gICAgICByZXR1cm4gY2FsbGJhY2sodHJ1ZSwgdGhpcy5kYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5sb2coXCJJbWFnZSAnXCIgKyB0aGlzLmVsLnNyYyArIFwiJyBpcyBOT1QgcmVhZHlcIik7XG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltZy5zcmMgPSB0aGlzLmVsLnNyYztcbiAgICAgIGltZy5vbmxvYWQgPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBfdGhpcy5sb2coXCJJbWFnZSAnXCIgKyBpbWcuc3JjICsgXCInIGlzIGxvYWRlZFwiKTtcbiAgICAgICAgICBfdGhpcy5kYXRhLm5hdHVyYWxXaWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICBfdGhpcy5kYXRhLm5hdHVyYWxIZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjayh0cnVlLCBfdGhpcy5kYXRhKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgcmV0dXJuIGltZy5vbmVycm9yID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgX3RoaXMubG9nKFwiSW1hZ2UgJ1wiICsgaW1nLnNyYyArIFwiJyBpcyBmYWlsZWQgdG8gbG9hZFwiKTtcbiAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZmFsc2UsIF90aGlzLmRhdGEpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBJbWFnZVNpemU7XG5cbn0pKEJhc2UpO1xuXG5pZiAoIXdpbmRvdy5TdGFja2xhKSB7XG4gIHdpbmRvdy5TdGFja2xhID0ge307XG59XG5cblN0YWNrbGEuZ2V0SW1hZ2VTaXplID0gZnVuY3Rpb24oZWwsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBuZXcgSW1hZ2VTaXplKGVsLCBjYWxsYmFjayk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ2V0OiBmdW5jdGlvbihlbCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gbmV3IEltYWdlU2l6ZShlbCwgY2FsbGJhY2spO1xuICB9XG59O1xuIiwiTXVzdGFjaGUgPSByZXF1aXJlKCdtdXN0YWNoZScpXG5BbGlnbk1lID0gcmVxdWlyZSgnYWxpZ25tZScpXG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlJylcbkltYWdlU2l6ZSA9IHJlcXVpcmUoJy4vaW1hZ2UnKVxuXG5BVFRSUyA9XG4gIE5BTUU6ICdUYWdsYSdcbiAgUFJFRklYOiAndGFnbGEtJ1xuICBEUkFHX0FUVFI6XG4gICAgY29udGFpbm1lbnQ6ICcudGFnbGEnXG4gICAgaGFuZGxlOiAnLnRhZ2xhLWljb24nXG4gIFNFTEVDVF9BVFRSOlxuICAgIGFsbG93X3NpbmdsZV9kZXNlbGVjdDogb25cbiAgICBwbGFjZWhvbGRlcl90ZXh0X3NpbmdsZTogJ1NlbGVjdCBhbiBvcHRpb24nXG4gICAgd2lkdGg6ICczMTBweCdcbiAgRk9STV9URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtZm9ybS13cmFwcGVyXCI+J1xuICAgICcgICAgPGZvcm0gY2xhc3M9XCJ0YWdsYS1mb3JtXCI+J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1mb3JtLXRpdGxlXCI+J1xuICAgICcgICAgICAgICAgICBTZWxlY3QgWW91ciBQcm9kdWN0J1xuICAgICcgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIGNsYXNzPVwidGFnbGEtZm9ybS1jbG9zZVwiPsOXPC9hPidcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwieFwiPidcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ5XCI+J1xuICAgICcgICAgICAgIDxzZWxlY3QgZGF0YS1wbGFjZWhvbGRlcj1cIlNlYXJjaFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInRhZ1wiIGNsYXNzPVwidGFnbGEtc2VsZWN0IGNob3Nlbi1zZWxlY3RcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaFwiPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbj48L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxXCI+Q29ja2llPC9vcHRpb24+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMlwiPktpd2k8L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzXCI+QnVkZHk8L29wdGlvbj4nXG4gICAgJyAgICAgICAgPC9zZWxlY3Q+J1xuICAgICcgICAgPC9mb3JtPidcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG4gIFRBR19URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtdGFnXCI+J1xuICAgICcgICAgPGkgY2xhc3M9XCJ0YWdsYS1pY29uIGZzIGZzLXRhZzJcIj48L2k+J1xuICAgICcgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZ1wiPidcbiAgICAnICAgIHt7I3Byb2R1Y3R9fSdcbiAgICAnICAgICAgICB7eyNpbWFnZV9zbWFsbF91cmx9fSdcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLWltYWdlXCI+J1xuICAgICcgICAgICAgICAgPGltZyBzcmM9XCJ7e2ltYWdlX3NtYWxsX3VybH19XCI+J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICB7ey9pbWFnZV9zbWFsbF91cmx9fSdcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLXRleHRcIj4nXG4gICAgJyAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLWVkaXRcIj4nXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInRhZ2xhLXRhZy1saW5rIHRhZ2xhLXRhZy1lZGl0LWxpbmtcIj4nXG4gICAgJyAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmcyBmcy1wZW5jaWxcIj48L2k+IEVkaXQnXG4gICAgJyAgICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInRhZ2xhLXRhZy1saW5rIHRhZ2xhLXRhZy1kZWxldGUtbGlua1wiPidcbiAgICAnICAgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLWNyb3NzM1wiPjwvaT4gRGVsZXRlJ1xuICAgICcgICAgICAgICAgICA8L2E+J1xuICAgICcgICAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgICAgPGgyIGNsYXNzPVwidGFnbGEtZGlhbG9nLXRpdGxlXCI+e3t0YWd9fTwvaDI+J1xuICAgICcgICAgICAgICAge3sjcHJpY2V9fSdcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctcHJpY2VcIj57e3ByaWNlfX08L2Rpdj4nXG4gICAgJyAgICAgICAgICB7ey9wcmljZX19J1xuICAgICcgICAgICAgICAge3sjZGVzY3JpcHRpb259fSdcbiAgICAnICAgICAgICAgIDxwIGNsYXNzPVwidGFnbGEtZGlhbG9nLWRlc2NyaXB0aW9uXCI+e3tkZXNjcmlwdGlvbn19PC9wPidcbiAgICAnICAgICAgICAgIHt7L2Rlc2NyaXB0aW9ufX0nXG4gICAgJyAgICAgICAgICB7eyNjdXN0b21fdXJsfX0nXG4gICAgJyAgICAgICAgICA8YSBocmVmPVwie3tjdXN0b21fdXJsfX1cIiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1idXR0b24gc3QtYnRuIHN0LWJ0bi1zdWNjZXNzIHN0LWJ0bi1zb2xpZFwiIHRhcmdldD1cIlwie3t0YXJnZXR9fVwiPidcbiAgICAnICAgICAgICAgICAgPGkgY2xhc3M9XCJmcyBmcy1jYXJ0XCI+PC9pPidcbiAgICAnICAgICAgICAgICAgQnV5IE5vdydcbiAgICAnICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICB7ey9jdXN0b21fdXJsfX0nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAge3svcHJvZHVjdH19J1xuICAgICcgICAgPC9kaXY+J1xuICAgICcgICAge3t7Zm9ybV9odG1sfX19J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbiAgTkVXX1RBR19URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtdGFnXCI+J1xuICAgICcgICAgPGkgY2xhc3M9XCJ0YWdsYS1pY29uIGZzIGZzLXRhZzJcIj48L2k+J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcblxuY2xhc3MgVGFnbGEgZXh0ZW5kcyBCYXNlXG4gIGNvbnN0cnVjdG9yOiAoJHdyYXBwZXIsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBzdXBlcigpXG4gICAgQHdyYXBwZXIgPSAkKCR3cmFwcGVyKVxuICAgIEBpbml0KG9wdGlvbnMpXG4gICAgQGJpbmQoKVxuXG4kLmV4dGVuZChUYWdsYSwgQVRUUlMpXG5cbnByb3RvID1cbiAgIyMjIyMjIyMjIyMjIyNcbiAgIyBVdGlsaXRpZXNcbiAgIyMjIyMjIyMjIyMjIyNcbiAgdG9TdHJpbmc6IC0+ICdUYWdsYSdcblxuICAjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBQcml2YXRlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgSW5pdGlhbGl6ZSBkcmFnIGFuZCBzZWxlY3QgbGlicyBmb3IgYSBzaW5nbGUgdGFnXG4gIF9hcHBseVRvb2xzOiAoJHRhZykgLT5cbiAgICBAbG9nICdfYXBwbHlUb29scygpIGlzIGV4ZWN1dGVkJ1xuICAgIGRyYWcgPSBuZXcgRHJhZ2dhYmlsbHkoJHRhZ1swXSwgVGFnbGEuRFJBR19BVFRSKVxuICAgIGRyYWcub24gJ2RyYWdFbmQnLCAkLnByb3h5KEBoYW5kbGVUYWdNb3ZlLCBAKVxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknLCBkcmFnKVxuICAgICMgVXBkYXRlIGZvcm1cbiAgICB0YWcgPSAkdGFnLmRhdGEoJ3RhZy1kYXRhJylcbiAgICAkZm9ybSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXhdJykudmFsKHRhZy54KVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXldJykudmFsKHRhZy55KVxuICAgICRmb3JtLmZpbmQoXCJbbmFtZT10YWddIG9wdGlvblt2YWx1ZT0je3RhZy52YWx1ZX1dXCIpLmF0dHIoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJylcbiAgICAkc2VsZWN0ID0gJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JylcbiAgICAkc2VsZWN0LmNob3NlbjIoVGFnbGEuU0VMRUNUX0FUVFIpXG4gICAgJHNlbGVjdC5vbiAnY2hhbmdlJywgJC5wcm94eShAaGFuZGxlVGFnQ2hhbmdlLCBAKVxuICAgICRzZWxlY3Qub24gJ2Nob3NlbjpoaWRpbmdfZHJvcGRvd24nLCAoZSwgcGFyYW1zKSAtPlxuICAgICAgJHNlbGVjdC50cmlnZ2VyKCdjaG9zZW46b3BlbicpXG5cbiAgX2Rpc2FibGVEcmFnOiAoJGV4Y2VwdCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdfZGlzYWJsZURyYWcoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBAXG4gICAgICAkKEApLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGlzYWJsZSgpO1xuXG4gIF9lbmFibGVEcmFnOiAoJGV4Y2VwdCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdfZW5hYmxlRHJhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICRleGNlcHQgPSAkKCRleGNlcHQpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIEBcbiAgICAgICQoQCkuZGF0YSgnZHJhZ2dhYmlsbHknKS5lbmFibGUoKTtcblxuICBfcmVtb3ZlVG9vbHM6ICgkdGFnKSAtPlxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5kZXN0cm95KClcbiAgICAkc2VsZWN0ID0gJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JylcbiAgICAkc2VsZWN0LnNob3coKS5yZW1vdmVDbGFzcyAnY2h6bi1kb25lJ1xuICAgICRzZWxlY3QubmV4dCgpLnJlbW92ZSgpXG5cbiAgX2dldFBvc2l0aW9uOiAoJHRhZykgLT5cbiAgICBAbG9nICdfZ2V0UG9zaXRpb24oKSBpcyBleGVjdXRlZCdcbiAgICBwb3MgPSAkdGFnLnBvc2l0aW9uKClcbiAgICB4ID0gKHBvcy5sZWZ0ICsgKCR0YWcud2lkdGgoKSAvIDIpKSAvIEBjdXJyZW50V2lkdGggKiBAbmF0dXJhbFdpZHRoXG4gICAgeSA9IChwb3MudG9wICsgKCR0YWcuaGVpZ2h0KCkgLyAyKSkgLyBAY3VycmVudEhlaWdodCAqIEBuYXR1cmFsSGVpZ2h0XG4gICAgaWYgQHVuaXQgaXMgJ3BlcmNlbnQnXG4gICAgICB4ID0geCAvIEBuYXR1cmFsV2lkdGggKiAxMDBcbiAgICAgIHkgPSB5IC8gQG5hdHVyYWxIZWlnaHQgKiAxMDBcbiAgICBbeCwgeV1cblxuICBfdXBkYXRlSW1hZ2VTaXplOiAoZGF0YSkgLT5cbiAgICBAbG9nICdfdXBkYXRlSW1hZ2VTaXplKCkgaXMgZXhlY3V0ZWQnXG4gICAgQG5hdHVyYWxXaWR0aCA9IGRhdGEubmF0dXJhbFdpZHRoXG4gICAgQG5hdHVyYWxIZWlnaHQgPSBkYXRhLm5hdHVyYWxIZWlnaHRcbiAgICBAY3VycmVudFdpZHRoID0gZGF0YS53aWR0aFxuICAgIEBjdXJyZW50SGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBAd2lkdGhSYXRpbyA9IGRhdGEud2lkdGhSYXRpb1xuICAgIEBoZWlnaHRSYXRpbyA9IGRhdGEuaGVpZ2h0UmF0aW9cblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIEV2ZW50IEhhbmRsZXJzXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIGhhbmRsZVRhZ0NsaWNrOiAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcmV0dXJuIHVubGVzcyAkKGUudGFyZ2V0KS5oYXNDbGFzcygndGFnbGEtaWNvbicpXG4gICAgQGxvZyAnaGFuZGxlVGFnQ2xpY2soKSBpcyBleGVjdXRlZCdcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgQHNocmluaygkdGFnKVxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1hY3RpdmUnKVxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5lbmFibGUoKVxuXG4gIGhhbmRsZVRhZ0NoYW5nZTogKGUsIHBhcmFtcykgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdDaGFuZ2UoKSBpcyBleGVjdXRlZCdcbiAgICAkc2VsZWN0ID0gJChlLnRhcmdldClcbiAgICAkdGFnID0gJHNlbGVjdC5wYXJlbnRzKCcudGFnbGEtdGFnJylcbiAgICBpc05ldyA9ICR0YWcuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKVxuICAgICR0YWcucmVtb3ZlQ2xhc3MgJ3RhZ2xhLXRhZy1jaG9vc2UgdGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctbmV3J1xuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIGRhdGEubGFiZWwgPSAkc2VsZWN0LmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKVxuICAgIGRhdGEudmFsdWUgPSAkc2VsZWN0LnZhbCgpIHx8IGRhdGEubGFiZWxcbiAgICBzZXJpYWxpemUgPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJykuc2VyaWFsaXplKClcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgIGlmIGlzTmV3XG4gICAgICBAZW1pdCgnYWRkJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG4gICAgZWxzZVxuICAgICAgQGVtaXQoJ2NoYW5nZScsIFtkYXRhLCBzZXJpYWxpemUsICR0YWddKVxuXG4gIGhhbmRsZVRhZ0RlbGV0ZTogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnRGVsZXRlKCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnRzKCcudGFnbGEtdGFnJylcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICAkdGFnLmZhZGVPdXQgPT5cbiAgICAgIEBfcmVtb3ZlVG9vbHMoJHRhZylcbiAgICAgICR0YWcucmVtb3ZlKClcbiAgICAgIEBlbWl0KCdkZWxldGUnLCBbZGF0YV0pXG5cbiAgaGFuZGxlVGFnRWRpdDogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnRWRpdCgpIGlzIGV4ZWN1dGVkJ1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1jaG9vc2UnKVxuICAgIEB3cmFwcGVyLmFkZENsYXNzKCd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZycpXG4gICAgQF9kaXNhYmxlRHJhZygkdGFnKVxuICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLnRyaWdnZXIoJ2Nob3NlbjpvcGVuJylcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICBAZW1pdCgnZWRpdCcsIFtkYXRhLCAkdGFnXSlcblxuICBoYW5kbGVUYWdNb3ZlOiAoaW5zdGFuY2UsIGV2ZW50LCBwb2ludGVyKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdmUoKSBpcyBleGVjdXRlZCdcblxuICAgICR0YWcgPSAkKGluc3RhbmNlLmVsZW1lbnQpXG4gICAgZGF0YSA9ICR0YWcuZGF0YSgndGFnLWRhdGEnKVxuICAgIHBvcyA9IEBfZ2V0UG9zaXRpb24oJHRhZylcbiAgICBkYXRhLnggPSBwb3NbMF1cbiAgICBkYXRhLnkgPSBwb3NbMV1cblxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eF0nKS52YWwoZGF0YS54KVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXldJykudmFsKGRhdGEueSlcbiAgICBzZXJpYWxpemUgPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJykuc2VyaWFsaXplKClcblxuICAgIEBsYXN0RHJhZ1RpbWUgPSBuZXcgRGF0ZSgpXG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCBkYXRhKVxuICAgIGlzTmV3ID0gaWYgZGF0YS5pZCB0aGVuIG5vIGVsc2UgeWVzXG4gICAgIyBBbGlnblxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICBAZW1pdCgnbW92ZScsIFtkYXRhLCBzZXJpYWxpemUsICR0YWcsIGlzTmV3XSlcblxuICBoYW5kbGVUYWdNb3VzZUVudGVyOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUVudGVyJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gICR0YWcuZGF0YSgndGltZXInKVxuICAgIGNsZWFyVGltZW91dCh0aW1lcikgaWYgdGltZXJcbiAgICAkdGFnLnJlbW92ZURhdGEoJ3RpbWVyJylcblxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgIyBBbGlnblxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJykuYWxpZ24oKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScpLmFsaWduKClcbiAgICBAZW1pdCgnaG92ZXInLCBbJHRhZ10pXG5cbiAgaGFuZGxlVGFnTW91c2VMZWF2ZTogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW91c2VMZWF2ZSdcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpXG5cbiAgICAjIENsZWFyIGRlbGF5ZWQgbGVhdmUgdGltZXJcbiAgICB0aW1lciA9ICR0YWcuZGF0YSgndGltZXInKVxuICAgIGNsZWFyVGltZW91dCh0aW1lcikgaWYgdGltZXJcbiAgICAkdGFnLnJlbW92ZURhdGEoJ3RpbWVyJylcblxuICAgICMgU2F2ZSBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0IC0+XG4gICAgICAkdGFnLnJlbW92ZUNsYXNzKCd0YWdsYS10YWctaG92ZXInKVxuICAgICwgMzAwXG4gICAgJHRhZy5kYXRhKCd0aW1lcicsIHRpbWVyKVxuXG4gIGhhbmRsZVdyYXBwZXJDbGljazogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlV3JhcHBlckNsaWNrKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBIYWNrIHRvIGF2b2lkIHRyaWdnZXJpbmcgY2xpY2sgZXZlbnRcbiAgICBAc2hyaW5rKCkgaWYgKG5ldyBEYXRlKCkgLSBAbGFzdERyYWdUaW1lID4gMTApXG5cbiAgaGFuZGxlSW1hZ2VSZXNpemU6IChlLCBkYXRhKSAtPlxuICAgIEBsb2cgJ2hhbmRsZUltYWdlUmVzaXplKCkgaXMgZXhlY3V0ZWQnXG4gICAgcHJldldpZHRoID0gQGN1cnJlbnRXaWR0aFxuICAgIHByZXZIZWlnaHQgPSBAY3VycmVudEhlaWdodFxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAkdGFnID0gJChAKVxuICAgICAgcG9zID0gJHRhZy5wb3NpdGlvbigpXG4gICAgICB4ID0gKHBvcy5sZWZ0IC8gcHJldldpZHRoKSAqIGRhdGEud2lkdGhcbiAgICAgIHkgPSAocG9zLnRvcCAvIHByZXZIZWlnaHQpICogZGF0YS5oZWlnaHRcbiAgICAgICR0YWcuY3NzXG4gICAgICAgIGxlZnQ6IFwiI3t4fXB4XCJcbiAgICAgICAgdG9wOiBcIiN7eX1weFwiXG4gICAgQF91cGRhdGVJbWFnZVNpemUoZGF0YSlcblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIFB1YmxpYyBNZXRob2RzXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIGFkZFRhZzogKHRhZyA9IHt9KSAtPlxuICAgIEBsb2cgJ2FkZFRhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICMgUmVuZGVyIHRhZyBlbGVtZW50IGJ5IHByb3ZpZGVkIHRlbXBsYXRlXG4gICAgdGFnID0gJC5leHRlbmQoe30sIHRhZylcbiAgICB0YWcuZm9ybV9odG1sID0gQGZvcm1IdG1sXG4gICAgJHRhZyA9ICQoTXVzdGFjaGUucmVuZGVyKEB0YWdUZW1wbGF0ZSwgdGFnKSlcbiAgICBpc05ldyA9ICghdGFnLnggYW5kICF0YWcueSlcblxuICAgICMgUmVtb3ZlIHByZXZpb3VzIGFkZGVkIG5ldyB0YWcgaWYgaXQgaGFzbid0IGJlaW5nIHNldFxuICAgIGlmIGlzTmV3XG4gICAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgICBpZiAkKEApLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JykgYW5kICEkKEApLmZpbmQoJ1tuYW1lPXRhZ10nKS52YWwoKVxuICAgICAgICAgICQoQCkuZmFkZU91dCA9PlxuICAgICAgICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuXG4gICAgQHdyYXBwZXIuYXBwZW5kKCR0YWcpXG4gICAgaWYgaXNOZXcgIyBEZWZhdWx0IHBvc2l0aW9uIGZvciBuZXcgdGFnXG4gICAgICAjIFRPRE8gLSBOZWVkIGEgc21hcnQgd2F5IHRvIGF2b2lkIGNvbGxpc2lvblxuICAgICAgdGFnLnggPSA1MFxuICAgICAgdGFnLnkgPSA1MFxuICAgICAgJHRhZy5hZGRDbGFzcyAndGFnbGEtdGFnLW5ldyB0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1jaG9vc2UnXG4gICAgaWYgQHVuaXQgaXMgJ3BlcmNlbnQnXG4gICAgICB4ID0gQGN1cnJlbnRXaWR0aCAqICh0YWcueCAvIDEwMClcbiAgICAgIHkgPSBAY3VycmVudEhlaWdodCAqICh0YWcueSAvIDEwMClcbiAgICBlbHNlXG4gICAgICB4ID0gdGFnLnggKiBAd2lkdGhSYXRpb1xuICAgICAgeSA9IHRhZy55ICogQGhlaWdodFJhdGlvXG4gICAgb2Zmc2V0WCA9ICR0YWcub3V0ZXJXaWR0aCgpIC8gMlxuICAgIG9mZnNldFkgPSAkdGFnLm91dGVySGVpZ2h0KCkgLyAyXG4gICAgJHRhZy5jc3NcbiAgICAgICdsZWZ0JzogXCIje3ggLSBvZmZzZXRYfXB4XCJcbiAgICAgICd0b3AnOiBcIiN7eSAtIG9mZnNldFl9cHhcIlxuICAgICMgU2F2ZSB0YWcgZGF0YSB0byBkYXRhIGF0dHIgZm9yIGVhc3kgYWNjZXNzXG4gICAgJHRhZy5kYXRhKCd0YWctZGF0YScsIHRhZylcblxuICAgICMgQWxpZ25NZVxuICAgICRkaWFsb2cgPSAkdGFnLmZpbmQoJy50YWdsYS1kaWFsb2cnKVxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgYXR0cnMgPVxuICAgICAgcmVsYXRlVG86ICR0YWdcbiAgICAgIGNvbnN0cmFpbkJ5OiBAd3JhcHBlclxuICAgICAgc2tpcFZpZXdwb3J0OiBmYWxzZVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJywgbmV3IEFsaWduTWUoJGRpYWxvZywgYXR0cnMpKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScsIG5ldyBBbGlnbk1lKCRmb3JtLCBhdHRycykpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuXG4gICAgIyBSZW5kZXIgdGFnIGVkaXRvciB0b29sc1xuICAgIGlmIEBlZGl0b3JcbiAgICAgIEBfYXBwbHlUb29scygkdGFnKVxuICAgICAgaWYgaXNOZXdcbiAgICAgICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpXG4gICAgICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1jaG9vc2UnKVxuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICAgICAgICAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKS50cmlnZ2VyICdjaG9zZW46b3BlbidcbiAgICAgICAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgICAgICAgQGVtaXQoJ25ldycsIFskdGFnXSlcbiAgICAgICAgLCAxMDBcblxuICBkZWxldGVUYWc6ICgkdGFnKSAtPlxuICAgIEBsb2cgJ2RlbGV0ZVRhZygpIGlzIGV4ZWN1dGVkJ1xuXG4gIGVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb25cbiAgICBAbG9nICdlZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmcnKVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+IEBfYXBwbHlUb29scygkKEApKVxuICAgIEBlZGl0b3IgPSBvblxuXG4gIGdldFRhZ3M6IC0+XG4gICAgQGxvZyAnZ2V0VGFncygpIGlzIGV4ZWN1dGVkJ1xuICAgIHRhZ3MgPSBbXVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICBkYXRhID0gJC5leHRlbmQoe30sICQoQCkuZGF0YSgndGFnLWRhdGEnKSlcbiAgICAgIHRhZ3MucHVzaCAkKEApLmRhdGEoJ3RhZy1kYXRhJylcbiAgICB0YWdzXG5cbiAgIyBTaHJpbmsgZXZlcnl0aGluZyBleGNlcHQgdGhlICRleGNlcHRcbiAgc2hyaW5rOiAoJGV4Y2VwdCA9IG51bGwpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnc2hyaW5rKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAoaSwgZWwpID0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBlbFxuICAgICAgJHRhZyA9ICQoZWwpXG4gICAgICBpZiAkdGFnLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JykgYW5kICEkdGFnLmZpbmQoJ1tuYW1lPXRhZ10nKS52YWwoKVxuICAgICAgICAkdGFnLmZhZGVPdXQgPT5cbiAgICAgICAgICAkdGFnLnJlbW92ZSgpXG4gICAgICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmVDbGFzcyAndGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctY2hvb3NlJ1xuICAgIEB3cmFwcGVyLnJlbW92ZUNsYXNzICd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZydcbiAgICBAX2VuYWJsZURyYWcoKVxuXG4gIHVwZGF0ZURpYWxvZzogKCR0YWcsIGRhdGEpIC0+XG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCAkdGFnLmRhdGEoJ3RhZy1kYXRhJyksIGRhdGEpXG4gICAgZGF0YS5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICBodG1sID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCBkYXRhKSkuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoKVxuICAgICR0YWcuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoaHRtbClcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgZGF0YSlcblxuICB1bmVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0IGlzIG9mZlxuICAgIEBsb2cgJ3VuZWRpdCgpIGlzIGV4ZWN1dGVkJ1xuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIEBfcmVtb3ZlVG9vbHMoJChlbCkpXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmcnXG4gICAgQGVkaXRvciA9IG9mZlxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgTGlmZWN5Y2xlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgaW5pdDogKG9wdGlvbnMpIC0+XG4gICAgIyBDb25maWd1cmUgT3B0aW9uc1xuICAgIEBkYXRhID0gb3B0aW9ucy5kYXRhIHx8IFtdXG4gICAgQGVkaXRvciA9IChvcHRpb25zLmVkaXRvciBpcyBvbikgPyBvbiA6IGZhbHNlXG4gICAgQGZvcm1IdG1sID0gaWYgb3B0aW9ucy5mb3JtIHRoZW4gJChvcHRpb25zLmZvcm0pIGVsc2UgJChUYWdsYS5GT1JNX1RFTVBMQVRFKVxuICAgIEBmb3JtSHRtbCA9IEBmb3JtSHRtbC5odG1sKClcbiAgICBAdGFnVGVtcGxhdGUgPSBpZiBvcHRpb25zLnRhZ1RlbXBsYXRlIHRoZW4gJChvcHRpb25zLnRhZ1RlbXBsYXRlKS5odG1sKCkgZWxzZSBUYWdsYS5UQUdfVEVNUExBVEVcbiAgICBAdW5pdCA9IGlmIG9wdGlvbnMudW5pdCBpcyAncGVyY2VudCcgdGhlbiAncGVyY2VudCcgZWxzZSAncGl4ZWwnXG4gICAgIyBBdHRyaWJ1dGVzXG4gICAgQGltYWdlU2l6ZSA9IG51bGxcbiAgICBAaW1hZ2UgPSBAd3JhcHBlci5maW5kKCdpbWcnKVxuICAgIEBsYXN0RHJhZ1RpbWUgPSBuZXcgRGF0ZSgpXG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXJcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICQucHJveHkoQGhhbmRsZU1vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ2NsaWNrJywgJC5wcm94eShAaGFuZGxlV3JhcHBlckNsaWNrLCBAKVxuICAgICAgLm9uICdjbGljaycsICcudGFnbGEtdGFnLWVkaXQtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0VkaXQsIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZGVsZXRlLWxpbmsnLCAkLnByb3h5KEBoYW5kbGVUYWdEZWxldGUsIEApXG4gICAgICAub24gJ21vdXNlZW50ZXInLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ21vdXNlbGVhdmUnLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlTGVhdmUsIEApXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBsb2cgJ3JlbmRlcigpIGlzIGV4ZWN1dGVkJ1xuICAgIEBpbWFnZS5hdHRyKCdkcmFnZ2FibGUnLCBmYWxzZSlcbiAgICBAaW1hZ2VTaXplID0gSW1hZ2VTaXplLmdldChAaW1hZ2UsICQucHJveHkoQHJlbmRlckZuLCBAKSlcbiAgICBAaW1hZ2VTaXplLm9uKCdjaGFuZ2UnLCAkLnByb3h5KEBoYW5kbGVJbWFnZVJlc2l6ZSwgQCkpXG5cbiAgcmVuZGVyRm46IChzdWNjZXNzLCBkYXRhKSAtPlxuICAgIEBsb2cgJ3JlbmRlckZuKCkgaXMgZXhlY3V0ZWQnXG4gICAgaXNTYWZhcmkgPSAvU2FmYXJpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIGFuZFxuICAgICAgICAgICAgICAgL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpXG4gICAgdW5sZXNzIHN1Y2Nlc3MgIyBTdG9wIGlmIGltYWdlIGlzIGZhaWxlZCB0byBsb2FkXG4gICAgICBAbG9nKFwiRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICN7QGltYWdlLmF0dHIoJ3NyYycpfVwiLCAnZXJyb3InKVxuICAgICAgQGRlc3Ryb3koKVxuICAgICAgcmV0dXJuXG4gICAgQF91cGRhdGVJbWFnZVNpemUoZGF0YSkgIyBTYXZlIGRpbWVuc2lvblxuICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYScgIyBBcHBseSBuZWNlc3NhcnkgY2xhc3MgbmFtZXNcbiAgICBAd3JhcHBlci5hZGRDbGFzcyAndGFnbGEtc2FmYXJpJyBpZiBpc1NhZmFyaSAjIEF2b2lkIGFuaW1hdGlvblxuICAgIEBhZGRUYWcgdGFnIGZvciB0YWcgaW4gQGRhdGEgIyBDcmVhdGUgdGFnc1xuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYS1lZGl0aW5nJyBpZiBAZWRpdG9yXG4gICAgICBAZW1pdCgncmVhZHknLCBbQF0pXG4gICAgLCA1MDBcblxuICBkZXN0cm95OiAtPlxuICAgIEBsb2cgJ2Rlc3Ryb3koKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEgdGFnbGEtZWRpdGluZydcbiAgICBAd3JhcHBlci5maW5kKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgJHRhZyA9ICQoQClcbiAgICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLmNob3NlbjIgJ2Rlc3Ryb3knXG4gICAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGVzdHJveSgpXG4gICAgICAkdGFnLnJlbW92ZSgpXG5cbiQuZXh0ZW5kKFRhZ2xhOjosIHByb3RvKVxuXG4jIFZhbmlsbGEgSlNcbndpbmRvdy5TdGFja2xhLlRhZ2xhID0gVGFnbGEgaWYgd2luZG93LlN0YWNrbGFcblxuI2lmIHR5cGVvZiBleHBvcnRzIGlzICdvYmplY3QnIGFuZCBleHBvcnRzICMgQ29tbW9uSlNcbiAgI21vZHVsZS5leHBvcnRzID0gVGFnbGFcbiNlbHNlIGlmIHR5cGVvZiBkZWZpbmUgaXMgJ2Z1bmN0aW9uJyBhbmQgZGVmaW5lLmFtZCAjIEFNRFxuICAjZGVmaW5lKFsnZXhwb3J0cyddLCBUYWdsYSlcblxuIl19
