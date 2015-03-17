// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global window, define, document */
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

if (typeof $ === 'undefined' && typeof $tackla !== 'undefined') {
    $ = window.$tackla;
}

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
var Base, ImageSize,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Base = require('./base');

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



},{"./base":4}],6:[function(require,module,exports){
var ATTRS, AlignMe, Base, ImageSize, Mustache, Tagla, proto,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Mustache = require('mustache');

AlignMe = require('alignme');

Base = require('./base.coffee');

ImageSize = require('./image.coffee');

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

window.Tagla = Tagla;

if (window.Stackla) {
  window.Stackla.Tagla = Tagla;
}

if (typeof exports === 'object' && exports) {
  module.exports = Tagla;
} else if (typeof define === 'function' && define.amd) {
  define(['exports'], Tagla);
}



},{"./base.coffee":3,"./image.coffee":5,"alignme":1,"mustache":2}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYWxpZ25tZS9zcmMvanMvYWxpZ25tZS5qcyIsIm5vZGVfbW9kdWxlcy9tdXN0YWNoZS9tdXN0YWNoZS5qcyIsIi9Vc2Vycy9qb3NlcGhqL1JlcG9zL3RhZ2xhMi9zcmMvY29mZmVlL2Jhc2UuY29mZmVlIiwic3JjL2NvZmZlZS9iYXNlLmpzIiwiL1VzZXJzL2pvc2VwaGovUmVwb3MvdGFnbGEyL3NyYy9jb2ZmZWUvaW1hZ2UuY29mZmVlIiwiL1VzZXJzL2pvc2VwaGovUmVwb3MvdGFnbGEyL3NyYy9jb2ZmZWUvdGFnbGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3prQkE7QUFBQTs7R0FBQTtBQUFBLElBQUEsSUFBQTs7QUFBQTtBQUtlLEVBQUEsY0FBQyxPQUFELEdBQUE7QUFDWCxRQUFBLFlBQUE7O01BRFksVUFBVTtLQUN0QjtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxTQUFELENBQVcs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QSxDQUFqQyxFQUhPO0VBQUEsQ0E3VlQ7Q0ExRkYsQ0FBQTs7QUFBQSxDQWdjQyxDQUFDLE1BQUYsQ0FBUyxLQUFLLENBQUEsU0FBZCxFQUFrQixLQUFsQixDQWhjQSxDQUFBOztBQUFBLE1BbWNNLENBQUMsS0FBUCxHQUFlLEtBbmNmLENBQUE7O0FBb2NBLElBQWdDLE1BQU0sQ0FBQyxPQUF2QztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFmLEdBQXVCLEtBQXZCLENBQUE7Q0FwY0E7O0FBc2NBLElBQUcsTUFBQSxDQUFBLE9BQUEsS0FBa0IsUUFBbEIsSUFBK0IsT0FBbEM7QUFDRSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLEtBQWpCLENBREY7Q0FBQSxNQUVLLElBQUcsTUFBQSxDQUFBLE1BQUEsS0FBaUIsVUFBakIsSUFBZ0MsTUFBTSxDQUFDLEdBQTFDO0FBQ0gsRUFBQSxNQUFBLENBQU8sQ0FBQyxTQUFELENBQVAsRUFBb0IsS0FBcEIsQ0FBQSxDQURHO0NBeGNMIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFsIHdpbmRvdywgZGVmaW5lLCBkb2N1bWVudCAqL1xuLyoqXG4gKiBBIEphdmFTY3JpcHQgdXRpbGl0eSB3aGljaCBhdXRvbWF0aWNhbGx5IGFsaWducyBwb3NpdGlvbiBvZiBhbiBvdmVybGF5LlxuICpcbiAqICAgICAgQGV4YW1wbGVcbiAqICAgICAgdmFyIGFsaWduTWUgPSBuZXcgQWxpZ25NZSgkb3ZlcmxheSwge1xuICogICAgICAgICAgcmVsYXRlVG86ICcuZHJhZ2dhYmxlJyxcbiAqICAgICAgICAgIGNvbnN0cmFpbkJ5OiAnLnBhcmVudCcsXG4gKiAgICAgICAgICBza2lwVmlld3BvcnQ6IGZhbHNlXG4gKiAgICAgIH0pO1xuICogICAgICBhbGlnbk1lLmFsaWduKCk7XG4gKlxuICogQGNsYXNzIEFsaWduTWVcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IG92ZXJsYXkgT3ZlcmxheSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBDb25maWd1cmFibGUgb3B0aW9uc1xuICovXG5cbmlmICh0eXBlb2YgJCA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mICR0YWNrbGEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgJCA9IHdpbmRvdy4kdGFja2xhO1xufVxuXG5mdW5jdGlvbiBBbGlnbk1lKG92ZXJsYXksIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGF0Lm92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbmZpZyBPcHRpb25zXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IHJlbGF0ZVRvIChyZXF1aXJlZClcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnJlbGF0ZVRvID0gJChvcHRpb25zLnJlbGF0ZVRvKSB8fCBudWxsO1xuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSByZWxhdGVUb1xuICAgICAqIFRoZSByZWZlcmVuY2UgZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQuY29uc3RyYWluQnkgPSAkKG9wdGlvbnMuY29uc3RyYWluQnkpIHx8IG51bGw7XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IFtza2lwVmlld3BvcnQ9dHJ1ZV1cbiAgICAgKiBJZ25vcmUgd2luZG93IGFzIGFub3RoZXIgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnNraXBWaWV3cG9ydCA9IChvcHRpb25zLnNraXBWaWV3cG9ydCA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgLy8gU3RvcCBpZiBvdmVybGF5IG9yIG9wdGlvbnMucmVsYXRlZFRvIGFyZW50IHByb3ZpZGVkXG4gICAgaWYgKCF0aGF0Lm92ZXJsYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgb3ZlcmxheWAgZWxlbWVudCBpcyByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBpZiAoIXRoYXQucmVsYXRlVG8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgcmVsYXRlVG9gIG9wdGlvbiBpcyByZXF1aXJlZCcpO1xuICAgIH1cbn1cblxudmFyIF9nZXRNYXgsXG4gICAgX2dldFBvaW50cyxcbiAgICBfbGlzdFBvc2l0aW9ucyxcbiAgICBfc2V0Q29uc3RyYWluQnlWaWV3cG9ydDtcblxuLy8gUmVwbGFjZW1lbnQgZm9yIF8ubWF4XG5fZ2V0TWF4ID0gZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgIHZhciBtYXhWYWx1ZSA9IDAsXG4gICAgICAgIG1heEl0ZW0sXG4gICAgICAgIGksIG87XG5cbiAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIG8gPSBvYmpbaV07XG4gICAgICAgICAgICBpZiAob1thdHRyXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbWF4VmFsdWUgPSBvW2F0dHJdO1xuICAgICAgICAgICAgICAgIG1heEl0ZW0gPSBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heEl0ZW07XG59O1xuXG4vLyBHZXQgY29vcmRpbmF0ZXMgYW5kIGRpbWVuc2lvbiBvZiBhbiBlbGVtZW50XG5fZ2V0UG9pbnRzID0gZnVuY3Rpb24gKCRlbCkge1xuICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCksXG4gICAgICAgIHdpZHRoID0gJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgaGVpZ2h0ID0gJGVsLm91dGVySGVpZ2h0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0ICAgOiBvZmZzZXQubGVmdCxcbiAgICAgICAgdG9wICAgIDogb2Zmc2V0LnRvcCxcbiAgICAgICAgcmlnaHQgIDogb2Zmc2V0LmxlZnQgKyB3aWR0aCxcbiAgICAgICAgYm90dG9tIDogb2Zmc2V0LnRvcCArIGhlaWdodCxcbiAgICAgICAgd2lkdGggIDogd2lkdGgsXG4gICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgIH07XG59O1xuXG4vLyBMaXN0IGFsbCBwb3NzaWJsZSBYWSBjb29yZGluZGF0ZXNcbl9saXN0UG9zaXRpb25zID0gZnVuY3Rpb24gKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpIHtcbiAgICB2YXIgY2VudGVyID0gcmVsYXRlVG9EYXRhLmxlZnQgKyAocmVsYXRlVG9EYXRhLndpZHRoIC8gMikgLSAob3ZlcmxheURhdGEud2lkdGggLyAyKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC8vIGxibHQgWydsZWZ0JywgJ2JvdHRvbSddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdsYmx0J30sXG4gICAgICAgIC8vIGNiY3QgWydjZW50ZXInLCAnYm90dG9tJ10sIFsnY2VudGVyJywgJ3RvcCddXG4gICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2NiY3QnfSxcbiAgICAgICAgLy8gcmJydCBbJ3JpZ2h0JywgJ2JvdHRvbSddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJydCd9LFxuXG4gICAgICAgIC8vIGx0cnQgWydsZWZ0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCwgbmFtZTogJ2x0cnQnfSxcbiAgICAgICAgLy8gbGJyYiBbJ2xlZnQnLCAnYm90dG9tJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJyYid9LFxuXG4gICAgICAgIC8vIHJ0cmIgWydyaWdodCcsICd0b3AnXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ3J0cmInfSxcbiAgICAgICAgLy8gY3RjYiBbJ2NlbnRlcicsICd0b3AnXSwgWydjZW50ZXInLCAnYm90dG9tJ11cbiAgICAgICAgLy8ge2xlZnQ6IGNlbnRlciwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnY3RjYid9LFxuICAgICAgICAvLyBsdGxiIFsnbGVmdCcsICd0b3AnXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnbHRsYid9LFxuXG4gICAgICAgIC8vIHJibGIgWydyaWdodCcsICdib3R0b20nXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20gLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYmxiJ30sXG4gICAgICAgIC8vIHJ0bHQgWydyaWdodCcsICd0b3AnXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdydGx0J31cbiAgICBdO1xufTtcblxuLy8gVGFrZSBjdXJyZW50IHZpZXdwb3J0L3dpbmRvdyBhcyBjb25zdHJhaW4uXG5fc2V0Q29uc3RyYWluQnlWaWV3cG9ydCA9IGZ1bmN0aW9uIChjb25zdHJhaW5CeURhdGEpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KSxcbiAgICAgICAgdG9wbW9zdCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCksXG4gICAgICAgIGJvdHRvbW1vc3QgPSB0b3Btb3N0ICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgIGlmICh0b3Btb3N0ID4gY29uc3RyYWluQnlEYXRhKSB7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS50b3AgPSB0b3Btb3N0O1xuICAgIH1cbiAgICBpZiAoYm90dG9tbW9zdCA8IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIHtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSA9IGJvdHRvbW1vc3Q7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5oZWlnaHQgPSBib3R0b21tb3N0IC0gdG9wbW9zdDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnN0cmFpbkJ5RGF0YTtcbn07XG5cbi8qKlxuICogQWxpZ24gb3ZlcmxheSBhdXRvbWF0aWNhbGx5XG4gKlxuICogQG1ldGhvZCBhbGlnblxuICogQHJldHVybiB7QXJyYXl9IFRoZSBiZXN0IFhZIGNvb3JkaW5hdGVzXG4gKi9cbkFsaWduTWUucHJvdG90eXBlLmFsaWduID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgb3ZlcmxheSA9IHRoYXQub3ZlcmxheSxcbiAgICAgICAgb3ZlcmxheURhdGEgPSBfZ2V0UG9pbnRzKG92ZXJsYXkpLFxuICAgICAgICByZWxhdGVUb0RhdGEgPSBfZ2V0UG9pbnRzKHRoYXQucmVsYXRlVG8pLFxuICAgICAgICBjb25zdHJhaW5CeURhdGEgPSBfZ2V0UG9pbnRzKHRoYXQuY29uc3RyYWluQnkpLFxuICAgICAgICBwb3NpdGlvbnMgPSBfbGlzdFBvc2l0aW9ucyhvdmVybGF5RGF0YSwgcmVsYXRlVG9EYXRhKSwgLy8gQWxsIHBvc3NpYmxlIHBvc2l0aW9uc1xuICAgICAgICBoYXNDb250YWluID0gZmFsc2UsIC8vIEluZGljYXRlcyBpZiBhbnkgcG9zaXRpb25zIGFyZSBmdWxseSBjb250YWluZWQgYnkgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgICAgYmVzdFBvcyA9IHt9LCAvLyBSZXR1cm4gdmFsdWVcbiAgICAgICAgcG9zLCBpOyAvLyBGb3IgSXRlcmF0aW9uXG5cbiAgICAvLyBDb25zdHJhaW4gYnkgdmlld3BvcnRcbiAgICBpZiAoIXRoYXQuc2tpcFZpZXdwb3J0KSB7XG4gICAgICAgIF9zZXRDb25zdHJhaW5CeVZpZXdwb3J0KGNvbnN0cmFpbkJ5RGF0YSk7XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHBvc2l0aW9ucykge1xuICAgICAgICBpZiAocG9zaXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBwb3MgPSBwb3NpdGlvbnNbaV07XG4gICAgICAgICAgICBwb3MucmlnaHQgPSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoO1xuICAgICAgICAgICAgcG9zLmJvdHRvbSA9IHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQ7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcG9zLmxlZnQgPj0gY29uc3RyYWluQnlEYXRhLmxlZnQgJiZcbiAgICAgICAgICAgICAgICBwb3MudG9wID49IGNvbnN0cmFpbkJ5RGF0YS50b3AgJiZcbiAgICAgICAgICAgICAgICBwb3MucmlnaHQgPD0gY29uc3RyYWluQnlEYXRhLnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgcG9zLmJvdHRvbSA8PSBjb25zdHJhaW5CeURhdGEuYm90dG9tXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBJbnNpZGUgZGlzdGFuY2UuIFRoZSBtb3JlIHRoZSBiZXR0ZXIuXG4gICAgICAgICAgICAgICAgLy8gNCBkaXN0YW5jZXMgdG8gYm9yZGVyIG9mIGNvbnN0cmFpblxuICAgICAgICAgICAgICAgIHBvcy5pbkRpc3RhbmNlID0gTWF0aC5taW4uYXBwbHkobnVsbCwgW1xuICAgICAgICAgICAgICAgICAgICBwb3MudG9wIC0gY29uc3RyYWluQnlEYXRhLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLnJpZ2h0IC0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSAtIHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBvcy5sZWZ0IC0gY29uc3RyYWluQnlEYXRhLmxlZnRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZmxhZ1xuICAgICAgICAgICAgICAgIGhhc0NvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbW9yZSBvdmVybGFwIHRoZSBiZXR0ZXJcbiAgICAgICAgICAgICAgICBwb3Mub3ZlcmxhcFNpemUgPVxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLnJpZ2h0LCBjb25zdHJhaW5CeURhdGEucmlnaHQpIC0gTWF0aC5tYXgocG9zLmxlZnQsIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0KSkgKlxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLmJvdHRvbSwgY29uc3RyYWluQnlEYXRhLmJvdHRvbSkgLSBNYXRoLm1heChwb3MudG9wLCBjb25zdHJhaW5CeURhdGEudG9wKSkgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmVzdFBvcyA9IChoYXNDb250YWluKSA/IF9nZXRNYXgocG9zaXRpb25zLCAnaW5EaXN0YW5jZScpIDogX2dldE1heChwb3NpdGlvbnMsICdvdmVybGFwU2l6ZScpO1xuICAgIG92ZXJsYXkub2Zmc2V0KGJlc3RQb3MpO1xuXG4gICAgcmV0dXJuIGJlc3RQb3M7XG59O1xuXG5pZiAod2luZG93LlN0YWNrbGEpIHsgLy8gVmFuaWxsYSBKU1xuICAgIHdpbmRvdy5TdGFja2xhLkFsaWduTWUgPSBBbGlnbk1lO1xufSBlbHNlIHtcbiAgICB3aW5kb3cuQWxpZ25NZSA9IEFsaWduTWU7XG59XG5cbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgZXhwb3J0cykgeyAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gQWxpZ25NZTtcbn0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7IC8vIEFNRFxuICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgQWxpZ25NZSk7XG59XG5cbiIsIi8qIVxuICogbXVzdGFjaGUuanMgLSBMb2dpYy1sZXNzIHt7bXVzdGFjaGV9fSB0ZW1wbGF0ZXMgd2l0aCBKYXZhU2NyaXB0XG4gKiBodHRwOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzXG4gKi9cblxuLypnbG9iYWwgZGVmaW5lOiBmYWxzZSovXG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiBleHBvcnRzKSB7XG4gICAgZmFjdG9yeShleHBvcnRzKTsgLy8gQ29tbW9uSlNcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSk7IC8vIEFNRFxuICB9IGVsc2Uge1xuICAgIGZhY3RvcnkoZ2xvYmFsLk11c3RhY2hlID0ge30pOyAvLyA8c2NyaXB0PlxuICB9XG59KHRoaXMsIGZ1bmN0aW9uIChtdXN0YWNoZSkge1xuXG4gIHZhciBPYmplY3RfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBPYmplY3RfdG9TdHJpbmcuY2FsbChvYmplY3QpID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZywgXCJcXFxcJCZcIik7XG4gIH1cblxuICAvLyBXb3JrYXJvdW5kIGZvciBodHRwczovL2lzc3Vlcy5hcGFjaGUub3JnL2ppcmEvYnJvd3NlL0NPVUNIREItNTc3XG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg5XG4gIHZhciBSZWdFeHBfdGVzdCA9IFJlZ0V4cC5wcm90b3R5cGUudGVzdDtcbiAgZnVuY3Rpb24gdGVzdFJlZ0V4cChyZSwgc3RyaW5nKSB7XG4gICAgcmV0dXJuIFJlZ0V4cF90ZXN0LmNhbGwocmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgbm9uU3BhY2VSZSA9IC9cXFMvO1xuICBmdW5jdGlvbiBpc1doaXRlc3BhY2Uoc3RyaW5nKSB7XG4gICAgcmV0dXJuICF0ZXN0UmVnRXhwKG5vblNwYWNlUmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIFwiJlwiOiBcIiZhbXA7XCIsXG4gICAgXCI8XCI6IFwiJmx0O1wiLFxuICAgIFwiPlwiOiBcIiZndDtcIixcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjMzk7JyxcbiAgICBcIi9cIjogJyYjeDJGOydcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVIdG1sKHN0cmluZykge1xuICAgIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKC9bJjw+XCInXFwvXS9nLCBmdW5jdGlvbiAocykge1xuICAgICAgcmV0dXJuIGVudGl0eU1hcFtzXTtcbiAgICB9KTtcbiAgfVxuXG4gIHZhciB3aGl0ZVJlID0gL1xccyovO1xuICB2YXIgc3BhY2VSZSA9IC9cXHMrLztcbiAgdmFyIGVxdWFsc1JlID0gL1xccyo9LztcbiAgdmFyIGN1cmx5UmUgPSAvXFxzKlxcfS87XG4gIHZhciB0YWdSZSA9IC8jfFxcXnxcXC98PnxcXHt8Jnw9fCEvO1xuXG4gIC8qKlxuICAgKiBCcmVha3MgdXAgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgc3RyaW5nIGludG8gYSB0cmVlIG9mIHRva2Vucy4gSWYgdGhlIGB0YWdzYFxuICAgKiBhcmd1bWVudCBpcyBnaXZlbiBoZXJlIGl0IG11c3QgYmUgYW4gYXJyYXkgd2l0aCB0d28gc3RyaW5nIHZhbHVlczogdGhlXG4gICAqIG9wZW5pbmcgYW5kIGNsb3NpbmcgdGFncyB1c2VkIGluIHRoZSB0ZW1wbGF0ZSAoZS5nLiBbIFwiPCVcIiwgXCIlPlwiIF0pLiBPZlxuICAgKiBjb3Vyc2UsIHRoZSBkZWZhdWx0IGlzIHRvIHVzZSBtdXN0YWNoZXMgKGkuZS4gbXVzdGFjaGUudGFncykuXG4gICAqXG4gICAqIEEgdG9rZW4gaXMgYW4gYXJyYXkgd2l0aCBhdCBsZWFzdCA0IGVsZW1lbnRzLiBUaGUgZmlyc3QgZWxlbWVudCBpcyB0aGVcbiAgICogbXVzdGFjaGUgc3ltYm9sIHRoYXQgd2FzIHVzZWQgaW5zaWRlIHRoZSB0YWcsIGUuZy4gXCIjXCIgb3IgXCImXCIuIElmIHRoZSB0YWdcbiAgICogZGlkIG5vdCBjb250YWluIGEgc3ltYm9sIChpLmUuIHt7bXlWYWx1ZX19KSB0aGlzIGVsZW1lbnQgaXMgXCJuYW1lXCIuIEZvclxuICAgKiBhbGwgdGV4dCB0aGF0IGFwcGVhcnMgb3V0c2lkZSBhIHN5bWJvbCB0aGlzIGVsZW1lbnQgaXMgXCJ0ZXh0XCIuXG4gICAqXG4gICAqIFRoZSBzZWNvbmQgZWxlbWVudCBvZiBhIHRva2VuIGlzIGl0cyBcInZhbHVlXCIuIEZvciBtdXN0YWNoZSB0YWdzIHRoaXMgaXNcbiAgICogd2hhdGV2ZXIgZWxzZSB3YXMgaW5zaWRlIHRoZSB0YWcgYmVzaWRlcyB0aGUgb3BlbmluZyBzeW1ib2wuIEZvciB0ZXh0IHRva2Vuc1xuICAgKiB0aGlzIGlzIHRoZSB0ZXh0IGl0c2VsZi5cbiAgICpcbiAgICogVGhlIHRoaXJkIGFuZCBmb3VydGggZWxlbWVudHMgb2YgdGhlIHRva2VuIGFyZSB0aGUgc3RhcnQgYW5kIGVuZCBpbmRpY2VzLFxuICAgKiByZXNwZWN0aXZlbHksIG9mIHRoZSB0b2tlbiBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUuXG4gICAqXG4gICAqIFRva2VucyB0aGF0IGFyZSB0aGUgcm9vdCBub2RlIG9mIGEgc3VidHJlZSBjb250YWluIHR3byBtb3JlIGVsZW1lbnRzOiAxKSBhblxuICAgKiBhcnJheSBvZiB0b2tlbnMgaW4gdGhlIHN1YnRyZWUgYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgYXRcbiAgICogd2hpY2ggdGhlIGNsb3NpbmcgdGFnIGZvciB0aGF0IHNlY3Rpb24gYmVnaW5zLlxuICAgKi9cbiAgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncykge1xuICAgIGlmICghdGVtcGxhdGUpXG4gICAgICByZXR1cm4gW107XG5cbiAgICB2YXIgc2VjdGlvbnMgPSBbXTsgICAgIC8vIFN0YWNrIHRvIGhvbGQgc2VjdGlvbiB0b2tlbnNcbiAgICB2YXIgdG9rZW5zID0gW107ICAgICAgIC8vIEJ1ZmZlciB0byBob2xkIHRoZSB0b2tlbnNcbiAgICB2YXIgc3BhY2VzID0gW107ICAgICAgIC8vIEluZGljZXMgb2Ygd2hpdGVzcGFjZSB0b2tlbnMgb24gdGhlIGN1cnJlbnQgbGluZVxuICAgIHZhciBoYXNUYWcgPSBmYWxzZTsgICAgLy8gSXMgdGhlcmUgYSB7e3RhZ319IG9uIHRoZSBjdXJyZW50IGxpbmU/XG4gICAgdmFyIG5vblNwYWNlID0gZmFsc2U7ICAvLyBJcyB0aGVyZSBhIG5vbi1zcGFjZSBjaGFyIG9uIHRoZSBjdXJyZW50IGxpbmU/XG5cbiAgICAvLyBTdHJpcHMgYWxsIHdoaXRlc3BhY2UgdG9rZW5zIGFycmF5IGZvciB0aGUgY3VycmVudCBsaW5lXG4gICAgLy8gaWYgdGhlcmUgd2FzIGEge3sjdGFnfX0gb24gaXQgYW5kIG90aGVyd2lzZSBvbmx5IHNwYWNlLlxuICAgIGZ1bmN0aW9uIHN0cmlwU3BhY2UoKSB7XG4gICAgICBpZiAoaGFzVGFnICYmICFub25TcGFjZSkge1xuICAgICAgICB3aGlsZSAoc3BhY2VzLmxlbmd0aClcbiAgICAgICAgICBkZWxldGUgdG9rZW5zW3NwYWNlcy5wb3AoKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZXMgPSBbXTtcbiAgICAgIH1cblxuICAgICAgaGFzVGFnID0gZmFsc2U7XG4gICAgICBub25TcGFjZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBvcGVuaW5nVGFnUmUsIGNsb3NpbmdUYWdSZSwgY2xvc2luZ0N1cmx5UmU7XG4gICAgZnVuY3Rpb24gY29tcGlsZVRhZ3ModGFncykge1xuICAgICAgaWYgKHR5cGVvZiB0YWdzID09PSAnc3RyaW5nJylcbiAgICAgICAgdGFncyA9IHRhZ3Muc3BsaXQoc3BhY2VSZSwgMik7XG5cbiAgICAgIGlmICghaXNBcnJheSh0YWdzKSB8fCB0YWdzLmxlbmd0aCAhPT0gMilcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHRhZ3M6ICcgKyB0YWdzKTtcblxuICAgICAgb3BlbmluZ1RhZ1JlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeHAodGFnc1swXSkgKyAnXFxcXHMqJyk7XG4gICAgICBjbG9zaW5nVGFnUmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKHRhZ3NbMV0pKTtcbiAgICAgIGNsb3NpbmdDdXJseVJlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCgnfScgKyB0YWdzWzFdKSk7XG4gICAgfVxuXG4gICAgY29tcGlsZVRhZ3ModGFncyB8fCBtdXN0YWNoZS50YWdzKTtcblxuICAgIHZhciBzY2FubmVyID0gbmV3IFNjYW5uZXIodGVtcGxhdGUpO1xuXG4gICAgdmFyIHN0YXJ0LCB0eXBlLCB2YWx1ZSwgY2hyLCB0b2tlbiwgb3BlblNlY3Rpb247XG4gICAgd2hpbGUgKCFzY2FubmVyLmVvcygpKSB7XG4gICAgICBzdGFydCA9IHNjYW5uZXIucG9zO1xuXG4gICAgICAvLyBNYXRjaCBhbnkgdGV4dCBiZXR3ZWVuIHRhZ3MuXG4gICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKG9wZW5pbmdUYWdSZSk7XG5cbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGkgPCB2YWx1ZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgY2hyID0gdmFsdWUuY2hhckF0KGkpO1xuXG4gICAgICAgICAgaWYgKGlzV2hpdGVzcGFjZShjaHIpKSB7XG4gICAgICAgICAgICBzcGFjZXMucHVzaCh0b2tlbnMubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRva2Vucy5wdXNoKFsgJ3RleHQnLCBjaHIsIHN0YXJ0LCBzdGFydCArIDEgXSk7XG4gICAgICAgICAgc3RhcnQgKz0gMTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aGl0ZXNwYWNlIG9uIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgICAgICAgaWYgKGNociA9PT0gJ1xcbicpXG4gICAgICAgICAgICBzdHJpcFNwYWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIG9wZW5pbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4ob3BlbmluZ1RhZ1JlKSlcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGhhc1RhZyA9IHRydWU7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHR5cGUuXG4gICAgICB0eXBlID0gc2Nhbm5lci5zY2FuKHRhZ1JlKSB8fCAnbmFtZSc7XG4gICAgICBzY2FubmVyLnNjYW4od2hpdGVSZSk7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHZhbHVlLlxuICAgICAgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ0N1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oY3VybHlSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICAgIHR5cGUgPSAnJic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBjbG9zaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKGNsb3NpbmdUYWdSZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgdGFnIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICAgIHRva2VuID0gWyB0eXBlLCB2YWx1ZSwgc3RhcnQsIHNjYW5uZXIucG9zIF07XG4gICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG5cbiAgICAgIGlmICh0eXBlID09PSAnIycgfHwgdHlwZSA9PT0gJ14nKSB7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnLycpIHtcbiAgICAgICAgLy8gQ2hlY2sgc2VjdGlvbiBuZXN0aW5nLlxuICAgICAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuXG4gICAgICAgIGlmICghb3BlblNlY3Rpb24pXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbm9wZW5lZCBzZWN0aW9uIFwiJyArIHZhbHVlICsgJ1wiIGF0ICcgKyBzdGFydCk7XG5cbiAgICAgICAgaWYgKG9wZW5TZWN0aW9uWzFdICE9PSB2YWx1ZSlcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHN0YXJ0KTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ25hbWUnIHx8IHR5cGUgPT09ICd7JyB8fCB0eXBlID09PSAnJicpIHtcbiAgICAgICAgbm9uU3BhY2UgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgLy8gU2V0IHRoZSB0YWdzIGZvciB0aGUgbmV4dCB0aW1lIGFyb3VuZC5cbiAgICAgICAgY29tcGlsZVRhZ3ModmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gb3BlbiBzZWN0aW9ucyB3aGVuIHdlJ3JlIGRvbmUuXG4gICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcblxuICAgIGlmIChvcGVuU2VjdGlvbilcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgcmV0dXJuIG5lc3RUb2tlbnMoc3F1YXNoVG9rZW5zKHRva2VucykpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbWJpbmVzIHRoZSB2YWx1ZXMgb2YgY29uc2VjdXRpdmUgdGV4dCB0b2tlbnMgaW4gdGhlIGdpdmVuIGB0b2tlbnNgIGFycmF5XG4gICAqIHRvIGEgc2luZ2xlIHRva2VuLlxuICAgKi9cbiAgZnVuY3Rpb24gc3F1YXNoVG9rZW5zKHRva2Vucykge1xuICAgIHZhciBzcXVhc2hlZFRva2VucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBsYXN0VG9rZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIGlmICh0b2tlbikge1xuICAgICAgICBpZiAodG9rZW5bMF0gPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4gJiYgbGFzdFRva2VuWzBdID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW5bMV0gKz0gdG9rZW5bMV07XG4gICAgICAgICAgbGFzdFRva2VuWzNdID0gdG9rZW5bM107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3F1YXNoZWRUb2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgbGFzdFRva2VuID0gdG9rZW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc3F1YXNoZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogRm9ybXMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIGludG8gYSBuZXN0ZWQgdHJlZSBzdHJ1Y3R1cmUgd2hlcmVcbiAgICogdG9rZW5zIHRoYXQgcmVwcmVzZW50IGEgc2VjdGlvbiBoYXZlIHR3byBhZGRpdGlvbmFsIGl0ZW1zOiAxKSBhbiBhcnJheSBvZlxuICAgKiBhbGwgdG9rZW5zIHRoYXQgYXBwZWFyIGluIHRoYXQgc2VjdGlvbiBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbFxuICAgKiB0ZW1wbGF0ZSB0aGF0IHJlcHJlc2VudHMgdGhlIGVuZCBvZiB0aGF0IHNlY3Rpb24uXG4gICAqL1xuICBmdW5jdGlvbiBuZXN0VG9rZW5zKHRva2Vucykge1xuICAgIHZhciBuZXN0ZWRUb2tlbnMgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gbmVzdGVkVG9rZW5zO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBzZWN0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICBjYXNlICcjJzpcbiAgICAgIGNhc2UgJ14nOlxuICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgIHNlY3Rpb25zLnB1c2godG9rZW4pO1xuICAgICAgICBjb2xsZWN0b3IgPSB0b2tlbls0XSA9IFtdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy8nOlxuICAgICAgICBzZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG4gICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgY29sbGVjdG9yID0gc2VjdGlvbnMubGVuZ3RoID4gMCA/IHNlY3Rpb25zW3NlY3Rpb25zLmxlbmd0aCAtIDFdWzRdIDogbmVzdGVkVG9rZW5zO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmVzdGVkVG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHN0cmluZyBzY2FubmVyIHRoYXQgaXMgdXNlZCBieSB0aGUgdGVtcGxhdGUgcGFyc2VyIHRvIGZpbmRcbiAgICogdG9rZW5zIGluIHRlbXBsYXRlIHN0cmluZ3MuXG4gICAqL1xuICBmdW5jdGlvbiBTY2FubmVyKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnRhaWwgPT09IFwiXCI7XG4gIH07XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIG1hdGNoIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gYXQgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAqIFJldHVybnMgdGhlIG1hdGNoZWQgdGV4dCBpZiBpdCBjYW4gbWF0Y2gsIHRoZSBlbXB0eSBzdHJpbmcgb3RoZXJ3aXNlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBtYXRjaCA9IHRoaXMudGFpbC5tYXRjaChyZSk7XG5cbiAgICBpZiAoIW1hdGNoIHx8IG1hdGNoLmluZGV4ICE9PSAwKVxuICAgICAgcmV0dXJuICcnO1xuXG4gICAgdmFyIHN0cmluZyA9IG1hdGNoWzBdO1xuXG4gICAgdGhpcy50YWlsID0gdGhpcy50YWlsLnN1YnN0cmluZyhzdHJpbmcubGVuZ3RoKTtcbiAgICB0aGlzLnBvcyArPSBzdHJpbmcubGVuZ3RoO1xuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcblxuICAvKipcbiAgICogU2tpcHMgYWxsIHRleHQgdW50aWwgdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBjYW4gYmUgbWF0Y2hlZC4gUmV0dXJuc1xuICAgKiB0aGUgc2tpcHBlZCBzdHJpbmcsIHdoaWNoIGlzIHRoZSBlbnRpcmUgdGFpbCBpZiBubyBtYXRjaCBjYW4gYmUgbWFkZS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLnNjYW5VbnRpbCA9IGZ1bmN0aW9uIChyZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMudGFpbC5zZWFyY2gocmUpLCBtYXRjaDtcblxuICAgIHN3aXRjaCAoaW5kZXgpIHtcbiAgICBjYXNlIC0xOlxuICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICB0aGlzLnRhaWwgPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAwOlxuICAgICAgbWF0Y2ggPSBcIlwiO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIG1hdGNoID0gdGhpcy50YWlsLnN1YnN0cmluZygwLCBpbmRleCk7XG4gICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSByZW5kZXJpbmcgY29udGV4dCBieSB3cmFwcGluZyBhIHZpZXcgb2JqZWN0IGFuZFxuICAgKiBtYWludGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAqL1xuICBmdW5jdGlvbiBDb250ZXh0KHZpZXcsIHBhcmVudENvbnRleHQpIHtcbiAgICB0aGlzLnZpZXcgPSB2aWV3ID09IG51bGwgPyB7fSA6IHZpZXc7XG4gICAgdGhpcy5jYWNoZSA9IHsgJy4nOiB0aGlzLnZpZXcgfTtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudENvbnRleHQ7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBjb250ZXh0IHVzaW5nIHRoZSBnaXZlbiB2aWV3IHdpdGggdGhpcyBjb250ZXh0XG4gICAqIGFzIHRoZSBwYXJlbnQuXG4gICAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKHZpZXcpIHtcbiAgICByZXR1cm4gbmV3IENvbnRleHQodmlldywgdGhpcyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBuYW1lIGluIHRoaXMgY29udGV4dCwgdHJhdmVyc2luZ1xuICAgKiB1cCB0aGUgY29udGV4dCBoaWVyYXJjaHkgaWYgdGhlIHZhbHVlIGlzIGFic2VudCBpbiB0aGlzIGNvbnRleHQncyB2aWV3LlxuICAgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUubG9va3VwID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlO1xuXG4gICAgdmFyIHZhbHVlO1xuICAgIGlmIChuYW1lIGluIGNhY2hlKSB7XG4gICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIG5hbWVzLCBpbmRleDtcblxuICAgICAgd2hpbGUgKGNvbnRleHQpIHtcbiAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignLicpID4gMCkge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dC52aWV3O1xuICAgICAgICAgIG5hbWVzID0gbmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAgIHdoaWxlICh2YWx1ZSAhPSBudWxsICYmIGluZGV4IDwgbmFtZXMubGVuZ3RoKVxuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZVtuYW1lc1tpbmRleCsrXV07XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnRleHQudmlldyA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHZhbHVlID0gY29udGV4dC52aWV3W25hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQucGFyZW50O1xuICAgICAgfVxuXG4gICAgICBjYWNoZVtuYW1lXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSlcbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbCh0aGlzLnZpZXcpO1xuXG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBBIFdyaXRlciBrbm93cyBob3cgdG8gdGFrZSBhIHN0cmVhbSBvZiB0b2tlbnMgYW5kIHJlbmRlciB0aGVtIHRvIGFcbiAgICogc3RyaW5nLCBnaXZlbiBhIGNvbnRleHQuIEl0IGFsc28gbWFpbnRhaW5zIGEgY2FjaGUgb2YgdGVtcGxhdGVzIHRvXG4gICAqIGF2b2lkIHRoZSBuZWVkIHRvIHBhcnNlIHRoZSBzYW1lIHRlbXBsYXRlIHR3aWNlLlxuICAgKi9cbiAgZnVuY3Rpb24gV3JpdGVyKCkge1xuICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0ZW1wbGF0ZXMgaW4gdGhpcyB3cml0ZXIuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBhbmQgcmV0dXJucyB0aGUgYXJyYXkgb2YgdG9rZW5zXG4gICAqIHRoYXQgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIHBhcnNlLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG4gICAgdmFyIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXTtcblxuICAgIGlmICh0b2tlbnMgPT0gbnVsbClcbiAgICAgIHRva2VucyA9IGNhY2hlW3RlbXBsYXRlXSA9IHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHRhZ3MpO1xuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfTtcblxuICAvKipcbiAgICogSGlnaC1sZXZlbCBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCB3aXRoXG4gICAqIHRoZSBnaXZlbiBgdmlld2AuXG4gICAqXG4gICAqIFRoZSBvcHRpb25hbCBgcGFydGlhbHNgIGFyZ3VtZW50IG1heSBiZSBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGVcbiAgICogbmFtZXMgYW5kIHRlbXBsYXRlcyBvZiBwYXJ0aWFscyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZS4gSXQgbWF5XG4gICAqIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gbG9hZCBwYXJ0aWFsIHRlbXBsYXRlcyBvbiB0aGUgZmx5XG4gICAqIHRoYXQgdGFrZXMgYSBzaW5nbGUgYXJndW1lbnQ6IHRoZSBuYW1lIG9mIHRoZSBwYXJ0aWFsLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgdmFyIHRva2VucyA9IHRoaXMucGFyc2UodGVtcGxhdGUpO1xuICAgIHZhciBjb250ZXh0ID0gKHZpZXcgaW5zdGFuY2VvZiBDb250ZXh0KSA/IHZpZXcgOiBuZXcgQ29udGV4dCh2aWV3KTtcbiAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgdGVtcGxhdGUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBMb3ctbGV2ZWwgbWV0aG9kIHRoYXQgcmVuZGVycyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgdXNpbmdcbiAgICogdGhlIGdpdmVuIGBjb250ZXh0YCBhbmQgYHBhcnRpYWxzYC5cbiAgICpcbiAgICogTm90ZTogVGhlIGBvcmlnaW5hbFRlbXBsYXRlYCBpcyBvbmx5IGV2ZXIgdXNlZCB0byBleHRyYWN0IHRoZSBwb3J0aW9uXG4gICAqIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHdhcyBjb250YWluZWQgaW4gYSBoaWdoZXItb3JkZXIgc2VjdGlvbi5cbiAgICogSWYgdGhlIHRlbXBsYXRlIGRvZXNuJ3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucywgdGhpcyBhcmd1bWVudCBtYXlcbiAgICogYmUgb21pdHRlZC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyVG9rZW5zID0gZnVuY3Rpb24gKHRva2VucywgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpIHtcbiAgICB2YXIgYnVmZmVyID0gJyc7XG5cbiAgICB2YXIgdG9rZW4sIHN5bWJvbCwgdmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcbiAgICAgIHN5bWJvbCA9IHRva2VuWzBdO1xuXG4gICAgICBpZiAoc3ltYm9sID09PSAnIycpIHZhbHVlID0gdGhpcy5fcmVuZGVyU2VjdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnXicpIHZhbHVlID0gdGhpcy5fcmVuZGVySW52ZXJ0ZWQodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJz4nKSB2YWx1ZSA9IHRoaXMuX3JlbmRlclBhcnRpYWwodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJyYnKSB2YWx1ZSA9IHRoaXMuX3VuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ25hbWUnKSB2YWx1ZSA9IHRoaXMuX2VzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICd0ZXh0JykgdmFsdWUgPSB0aGlzLl9yYXdWYWx1ZSh0b2tlbik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yZW5kZXJTZWN0aW9uID0gZnVuY3Rpb24gKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYnVmZmVyID0gJyc7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJlbmRlciBhbiBhcmJpdHJhcnkgdGVtcGxhdGVcbiAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBzZWN0aW9ucy5cbiAgICBmdW5jdGlvbiBzdWJSZW5kZXIodGVtcGxhdGUpIHtcbiAgICAgIHJldHVybiBzZWxmLnJlbmRlcih0ZW1wbGF0ZSwgY29udGV4dCwgcGFydGlhbHMpO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHJldHVybjtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBqIDwgdmFsdWVMZW5ndGg7ICsraikge1xuICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZVtqXSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LnB1c2godmFsdWUpLCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbFRlbXBsYXRlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucyB3aXRob3V0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZScpO1xuXG4gICAgICAvLyBFeHRyYWN0IHRoZSBwb3J0aW9uIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHRoZSBzZWN0aW9uIGNvbnRhaW5zLlxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKGNvbnRleHQudmlldywgb3JpZ2luYWxUZW1wbGF0ZS5zbGljZSh0b2tlblszXSwgdG9rZW5bNV0pLCBzdWJSZW5kZXIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yZW5kZXJJbnZlcnRlZCA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcblxuICAgIC8vIFVzZSBKYXZhU2NyaXB0J3MgZGVmaW5pdGlvbiBvZiBmYWxzeS4gSW5jbHVkZSBlbXB0eSBhcnJheXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODZcbiAgICBpZiAoIXZhbHVlIHx8IChpc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT09IDApKVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fcmVuZGVyUGFydGlhbCA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscykge1xuICAgIGlmICghcGFydGlhbHMpIHJldHVybjtcblxuICAgIHZhciB2YWx1ZSA9IGlzRnVuY3Rpb24ocGFydGlhbHMpID8gcGFydGlhbHModG9rZW5bMV0pIDogcGFydGlhbHNbdG9rZW5bMV1dO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRoaXMucGFyc2UodmFsdWUpLCBjb250ZXh0LCBwYXJ0aWFscywgdmFsdWUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3VuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gbXVzdGFjaGUuZXNjYXBlKHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yYXdWYWx1ZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgcmV0dXJuIHRva2VuWzFdO1xuICB9O1xuXG4gIG11c3RhY2hlLm5hbWUgPSBcIm11c3RhY2hlLmpzXCI7XG4gIG11c3RhY2hlLnZlcnNpb24gPSBcIjEuMS4wXCI7XG4gIG11c3RhY2hlLnRhZ3MgPSBbIFwie3tcIiwgXCJ9fVwiIF07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIuY2xlYXJDYWNoZSgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBQYXJzZXMgYW5kIGNhY2hlcyB0aGUgZ2l2ZW4gdGVtcGxhdGUgaW4gdGhlIGRlZmF1bHQgd3JpdGVyIGFuZCByZXR1cm5zIHRoZVxuICAgKiBhcnJheSBvZiB0b2tlbnMgaXQgY29udGFpbnMuIERvaW5nIHRoaXMgYWhlYWQgb2YgdGltZSBhdm9pZHMgdGhlIG5lZWQgdG9cbiAgICogcGFyc2UgdGVtcGxhdGVzIG9uIHRoZSBmbHkgYXMgdGhleSBhcmUgcmVuZGVyZWQuXG4gICAqL1xuICBtdXN0YWNoZS5wYXJzZSA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnBhcnNlKHRlbXBsYXRlLCB0YWdzKTtcbiAgfTtcblxuICAvKipcbiAgICogUmVuZGVycyB0aGUgYHRlbXBsYXRlYCB3aXRoIHRoZSBnaXZlbiBgdmlld2AgYW5kIGBwYXJ0aWFsc2AgdXNpbmcgdGhlXG4gICAqIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUucmVuZGVyID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuICB9O1xuXG4gIC8vIFRoaXMgaXMgaGVyZSBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkgd2l0aCAwLjQueC5cbiAgbXVzdGFjaGUudG9faHRtbCA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIHNlbmQpIHtcbiAgICB2YXIgcmVzdWx0ID0gbXVzdGFjaGUucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyk7XG5cbiAgICBpZiAoaXNGdW5jdGlvbihzZW5kKSkge1xuICAgICAgc2VuZChyZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIGVzY2FwaW5nIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIHVzZXIgbWF5IG92ZXJyaWRlIGl0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzI0NFxuICBtdXN0YWNoZS5lc2NhcGUgPSBlc2NhcGVIdG1sO1xuXG4gIC8vIEV4cG9ydCB0aGVzZSBtYWlubHkgZm9yIHRlc3RpbmcsIGJ1dCBhbHNvIGZvciBhZHZhbmNlZCB1c2FnZS5cbiAgbXVzdGFjaGUuU2Nhbm5lciA9IFNjYW5uZXI7XG4gIG11c3RhY2hlLkNvbnRleHQgPSBDb250ZXh0O1xuICBtdXN0YWNoZS5Xcml0ZXIgPSBXcml0ZXI7XG5cbn0pKTtcbiIsIiMjI1xuIyBAY2xhc3MgU3RhY2tsYS5CYXNlXG4jIyNcbmNsYXNzIEJhc2VcblxuICBjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cbiAgICBkZWJ1ZyA9IEBnZXRQYXJhbXMoJ2RlYnVnJylcbiAgICBhdHRycyA9IGF0dHJzIG9yIHt9XG4gICAgaWYgZGVidWdcbiAgICAgIEBkZWJ1ZyA9IChkZWJ1ZyBpcyAndHJ1ZScgb3IgZGVidWcgaXMgJzEnKVxuICAgIGVsc2UgaWYgYXR0cnMuZGVidWdcbiAgICAgIEBkZWJ1ZyA9IChhdHRycy5kZWJ1ZyBpcyBvbilcbiAgICBlbHNlXG4gICAgICBAZGVidWcgPSBmYWxzZVxuICAgIEBfbGlzdGVuZXJzID0gW11cblxuICB0b1N0cmluZzogLT4gJ0Jhc2UnXG5cbiAgbG9nOiAobXNnLCB0eXBlKSAtPlxuICAgIHJldHVybiB1bmxlc3MgQGRlYnVnXG4gICAgdHlwZSA9IHR5cGUgb3IgJ2luZm8nXG4gICAgaWYgd2luZG93LmNvbnNvbGUgYW5kIHdpbmRvdy5jb25zb2xlW3R5cGVdXG4gICAgICB3aW5kb3cuY29uc29sZVt0eXBlXSBcIlsje0B0b1N0cmluZygpfV0gI3ttc2d9XCJcbiAgICByZXR1cm5cblxuICBvbjogKHR5cGUsIGNhbGxiYWNrKSAtPlxuICAgIGlmICF0eXBlIG9yICFjYWxsYmFja1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb3RoIGV2ZW50IHR5cGUgYW5kIGNhbGxiYWNrIGFyZSByZXF1aXJlZCBwYXJhbWV0ZXJzJylcbiAgICBAbG9nICdvbigpIC0gZXZlbnQgXFwnJyArIHR5cGUgKyAnXFwnIGlzIHN1YnNjcmliZWQnXG4gICAgQF9saXN0ZW5lcnNbdHlwZV0gPSBbXSB1bmxlc3MgQF9saXN0ZW5lcnNbdHlwZV1cbiAgICBjYWxsYmFjay5pbnN0YW5jZSA9IEBcbiAgICBAX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGNhbGxiYWNrKVxuICAgIGNhbGxiYWNrXG5cbiAgZW1pdDogKHR5cGUsIGRhdGEgPSBbXSkgLT5cbiAgICBAbG9nIFwiZW1pdCgpIC0gZXZlbnQgJyN7dHlwZX0nIGlzIHRyaWdnZXJlZFwiXG4gICAgZGF0YS51bnNoaWZ0XG4gICAgICB0eXBlOiB0eXBlXG4gICAgICB0YXJnZXQ6IEBcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0xhY2tzIG9mIHR5cGUgcGFyYW1ldGVyJykgdW5sZXNzIHR5cGVcbiAgICBpZiBAX2xpc3RlbmVyc1t0eXBlXSBhbmQgQF9saXN0ZW5lcnNbdHlwZV0ubGVuZ3RoXG4gICAgICBmb3IgaSBvZiBAX2xpc3RlbmVyc1t0eXBlXVxuICAgICAgICBAX2xpc3RlbmVyc1t0eXBlXVtpXS5hcHBseSBALCBkYXRhXG4gICAgQFxuXG4gIGdldFBhcmFtczogKGtleSkgLT5cbiAgICBocmVmID0gQGdldFVybCgpXG4gICAgcGFyYW1zID0ge31cbiAgICBwb3MgPSBocmVmLmluZGV4T2YoJz8nKVxuICAgIEBsb2cgJ2dldFBhcmFtcygpIGlzIGV4ZWN1dGVkJ1xuICAgIGlmIGhyZWYuaW5kZXhPZignIycpICE9IC0xXG4gICAgICBoYXNoZXMgPSBocmVmLnNsaWNlKHBvcyArIDEsIGhyZWYuaW5kZXhPZignIycpKS5zcGxpdCgnJicpXG4gICAgZWxzZVxuICAgICAgaGFzaGVzID0gaHJlZi5zbGljZShwb3MgKyAxKS5zcGxpdCgnJicpXG4gICAgZm9yIGkgb2YgaGFzaGVzXG4gICAgICBoYXNoID0gaGFzaGVzW2ldLnNwbGl0KCc9JylcbiAgICAgIHBhcmFtc1toYXNoWzBdXSA9IGhhc2hbMV1cbiAgICBpZiBrZXkgdGhlbiBwYXJhbXNba2V5XSBlbHNlIHBhcmFtc1xuXG4gIGdldFVybDogLT4gd2luZG93LmxvY2F0aW9uLmhyZWZcblxuIyBQcm9tb3RlIHRvIGdsb2JhbFxud2luZG93LlN0YWNrbGEgPSB7fSB1bmxlc3Mgd2luZG93LlN0YWNrbGFcbndpbmRvdy5TdGFja2xhLkJhc2UgPSBCYXNlXG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZVxuXG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG5cbi8qXG4gKiBAY2xhc3MgU3RhY2tsYS5CYXNlXG4gKi9cbnZhciBCYXNlO1xuXG5CYXNlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBCYXNlKG9wdGlvbnMpIHtcbiAgICB2YXIgYXR0cnMsIGRlYnVnO1xuICAgIGlmIChvcHRpb25zID09IG51bGwpIHtcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgZGVidWcgPSB0aGlzLmdldFBhcmFtcygnZGVidWcnKTtcbiAgICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuICAgIGlmIChkZWJ1Zykge1xuICAgICAgdGhpcy5kZWJ1ZyA9IGRlYnVnID09PSAndHJ1ZScgfHwgZGVidWcgPT09ICcxJztcbiAgICB9IGVsc2UgaWYgKGF0dHJzLmRlYnVnKSB7XG4gICAgICB0aGlzLmRlYnVnID0gYXR0cnMuZGVidWcgPT09IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVidWcgPSBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gIH1cblxuICBCYXNlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnQmFzZSc7XG4gIH07XG5cbiAgQmFzZS5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24obXNnLCB0eXBlKSB7XG4gICAgaWYgKCF0aGlzLmRlYnVnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHR5cGUgPSB0eXBlIHx8ICdpbmZvJztcbiAgICBpZiAod2luZG93LmNvbnNvbGUgJiYgd2luZG93LmNvbnNvbGVbdHlwZV0pIHtcbiAgICAgIHdpbmRvdy5jb25zb2xlW3R5cGVdKFwiW1wiICsgKHRoaXMudG9TdHJpbmcoKSkgKyBcIl0gXCIgKyBtc2cpO1xuICAgIH1cbiAgfTtcblxuICBCYXNlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0eXBlIHx8ICFjYWxsYmFjaykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCb3RoIGV2ZW50IHR5cGUgYW5kIGNhbGxiYWNrIGFyZSByZXF1aXJlZCBwYXJhbWV0ZXJzJyk7XG4gICAgfVxuICAgIHRoaXMubG9nKCdvbigpIC0gZXZlbnQgXFwnJyArIHR5cGUgKyAnXFwnIGlzIHN1YnNjcmliZWQnKTtcbiAgICBpZiAoIXRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgdGhpcy5fbGlzdGVuZXJzW3R5cGVdID0gW107XG4gICAgfVxuICAgIGNhbGxiYWNrLmluc3RhbmNlID0gdGhpcztcbiAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjayk7XG4gICAgcmV0dXJuIGNhbGxiYWNrO1xuICB9O1xuXG4gIEJhc2UucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlLCBkYXRhKSB7XG4gICAgdmFyIGk7XG4gICAgaWYgKGRhdGEgPT0gbnVsbCkge1xuICAgICAgZGF0YSA9IFtdO1xuICAgIH1cbiAgICB0aGlzLmxvZyhcImVtaXQoKSAtIGV2ZW50ICdcIiArIHR5cGUgKyBcIicgaXMgdHJpZ2dlcmVkXCIpO1xuICAgIGRhdGEudW5zaGlmdCh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdGFyZ2V0OiB0aGlzXG4gICAgfSk7XG4gICAgaWYgKCF0eXBlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xhY2tzIG9mIHR5cGUgcGFyYW1ldGVyJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9saXN0ZW5lcnNbdHlwZV0gJiYgdGhpcy5fbGlzdGVuZXJzW3R5cGVdLmxlbmd0aCkge1xuICAgICAgZm9yIChpIGluIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSkge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV1baV0uYXBwbHkodGhpcywgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIEJhc2UucHJvdG90eXBlLmdldFBhcmFtcyA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBoYXNoLCBoYXNoZXMsIGhyZWYsIGksIHBhcmFtcywgcG9zO1xuICAgIGhyZWYgPSB0aGlzLmdldFVybCgpO1xuICAgIHBhcmFtcyA9IHt9O1xuICAgIHBvcyA9IGhyZWYuaW5kZXhPZignPycpO1xuICAgIHRoaXMubG9nKCdnZXRQYXJhbXMoKSBpcyBleGVjdXRlZCcpO1xuICAgIGlmIChocmVmLmluZGV4T2YoJyMnKSAhPT0gLTEpIHtcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSwgaHJlZi5pbmRleE9mKCcjJykpLnNwbGl0KCcmJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSkuc3BsaXQoJyYnKTtcbiAgICB9XG4gICAgZm9yIChpIGluIGhhc2hlcykge1xuICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpO1xuICAgICAgcGFyYW1zW2hhc2hbMF1dID0gaGFzaFsxXTtcbiAgICB9XG4gICAgaWYgKGtleSkge1xuICAgICAgcmV0dXJuIHBhcmFtc1trZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cbiAgfTtcblxuICBCYXNlLnByb3RvdHlwZS5nZXRVcmwgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhyZWY7XG4gIH07XG5cbiAgcmV0dXJuIEJhc2U7XG5cbn0pKCk7XG5cbmlmICghd2luZG93LlN0YWNrbGEpIHtcbiAgd2luZG93LlN0YWNrbGEgPSB7fTtcbn1cblxud2luZG93LlN0YWNrbGEuQmFzZSA9IEJhc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gQmFzZTtcbiIsIkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKVxuXG5jbGFzcyBJbWFnZVNpemUgZXh0ZW5kcyBCYXNlXG5cbiAgY29uc3RydWN0b3I6IChlbCwgY2FsbGJhY2spIC0+XG4gICAgc3VwZXIoKVxuICAgIEBpbml0KGVsKVxuICAgIEBiaW5kKClcbiAgICBAcmVuZGVyKGNhbGxiYWNrKVxuICAgIHJldHVybiBAXG5cbiAgdG9TdHJpbmc6ICgpIC0+ICdJbWFnZVNpemUnXG5cbiAgaW5pdDogKGVsKSAtPlxuICAgIEBlbCA9ICQoZWwpWzBdXG4gICAgQGNvbXBsZXRlID0gQGVsLmNvbXBsZXRlXG4gICAgQGRhdGEgPSB7fVxuICAgIEBfdGltZXIgPSBudWxsXG4gICAgQGRhdGEud2lkdGggPSBAZWwud2lkdGhcbiAgICBAZGF0YS5oZWlnaHQgPSBAZWwuaGVpZ2h0XG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBLZWVwIGFuIGV5ZSBvbiByZXNpemUgZXZlbnRcbiAgICAkKHdpbmRvdykucmVzaXplIChlKSA9PlxuICAgICAgaXNFcXVhbCA9IEBlbC53aWR0aCBpcyBAZGF0YS53aWR0aCBhbmQgQGVsLmhlaWdodCBpcyBAZGF0YS5oZWlnaHRcbiAgICAgIHJldHVybiBpZiBpc0VxdWFsXG4gICAgICAkLmV4dGVuZCBAZGF0YSwge1xuICAgICAgICB3aWR0aDogQGVsLndpZHRoXG4gICAgICAgIGhlaWdodDogQGVsLmhlaWdodFxuICAgICAgICB3aWR0aFJhdGlvOiBAZWwud2lkdGggLyBAZGF0YS5uYXR1cmFsV2lkdGhcbiAgICAgICAgaGVpZ2h0UmF0aW86IEBlbC5oZWlnaHQgLyBAZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgICB9XG4gICAgICBAbG9nICdoYW5kbGVSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICAgIEAuZW1pdCgnY2hhbmdlJywgW0BkYXRhXSlcblxuICByZW5kZXI6IChjYWxsYmFjaykgLT5cbiAgICBAbG9nICdyZW5kZXIoKSBpcyBleGVjdXRlZCdcbiAgICAjIEltYWdlIExvYWRlZFxuICAgIGlmIEBjb21wbGV0ZVxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5zcmMgPSBAZWwuc3JjXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIGxvYWRlZFwiXG4gICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgIEBkYXRhLm5hdHVyYWxIZWlnaHQgPSBpbWcuaGVpZ2h0XG4gICAgICBjYWxsYmFjayh0cnVlLCBAZGF0YSlcbiAgICAjIEltYWdlIExvYWRpbmdcbiAgICBlbHNlXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIE5PVCByZWFkeVwiXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgaW1nLnNyYyA9IEBlbC5zcmNcbiAgICAgIGltZy5vbmxvYWQgPSAoZSkgPT5cbiAgICAgICAgQGxvZyBcIkltYWdlICcje2ltZy5zcmN9JyBpcyBsb2FkZWRcIlxuICAgICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgICAgQGRhdGEubmF0dXJhbEhlaWdodCA9IGltZy5oZWlnaHRcbiAgICAgICAgY2FsbGJhY2sodHJ1ZSwgQGRhdGEpXG4gICAgICBpbWcub25lcnJvciA9IChlKSA9PlxuICAgICAgICBAbG9nIFwiSW1hZ2UgJyN7aW1nLnNyY30nIGlzIGZhaWxlZCB0byBsb2FkXCJcbiAgICAgICAgY2FsbGJhY2soZmFsc2UsIEBkYXRhKVxuXG5cbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG5TdGFja2xhLmdldEltYWdlU2l6ZSA9IChlbCwgY2FsbGJhY2spIC0+XG4gIG5ldyBJbWFnZVNpemUoZWwsIGNhbGxiYWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldDogKGVsLCBjYWxsYmFjaykgLT5cbiAgICBuZXcgSW1hZ2VTaXplKGVsLCBjYWxsYmFjaylcblxuIiwiTXVzdGFjaGUgPSByZXF1aXJlKCdtdXN0YWNoZScpXG5BbGlnbk1lID0gcmVxdWlyZSgnYWxpZ25tZScpXG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlLmNvZmZlZScpXG5JbWFnZVNpemUgPSByZXF1aXJlKCcuL2ltYWdlLmNvZmZlZScpXG5cbkFUVFJTID1cbiAgTkFNRTogJ1RhZ2xhJ1xuICBQUkVGSVg6ICd0YWdsYS0nXG4gIERSQUdfQVRUUjpcbiAgICBjb250YWlubWVudDogJy50YWdsYSdcbiAgICBoYW5kbGU6ICcudGFnbGEtaWNvbidcbiAgU0VMRUNUX0FUVFI6XG4gICAgYWxsb3dfc2luZ2xlX2Rlc2VsZWN0OiBvblxuICAgIHBsYWNlaG9sZGVyX3RleHRfc2luZ2xlOiAnU2VsZWN0IGFuIG9wdGlvbidcbiAgICB3aWR0aDogJzMxMHB4J1xuICBGT1JNX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS1mb3JtLXdyYXBwZXJcIj4nXG4gICAgJyAgICA8Zm9ybSBjbGFzcz1cInRhZ2xhLWZvcm1cIj4nXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWZvcm0tdGl0bGVcIj4nXG4gICAgJyAgICAgICAgICAgIFNlbGVjdCBZb3VyIFByb2R1Y3QnXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgY2xhc3M9XCJ0YWdsYS1mb3JtLWNsb3NlXCI+w5c8L2E+J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ4XCI+J1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInlcIj4nXG4gICAgJyAgICAgICAgPHNlbGVjdCBkYXRhLXBsYWNlaG9sZGVyPVwiU2VhcmNoXCIgdHlwZT1cInRleHRcIiBuYW1lPVwidGFnXCIgY2xhc3M9XCJ0YWdsYS1zZWxlY3QgY2hvc2VuLXNlbGVjdFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCI+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uPjwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjFcIj5Db2NraWU8L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIyXCI+S2l3aTwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjNcIj5CdWRkeTwvb3B0aW9uPidcbiAgICAnICAgICAgICA8L3NlbGVjdD4nXG4gICAgJyAgICA8L2Zvcm0+J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbiAgVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nXCI+J1xuICAgICcgICAge3sjcHJvZHVjdH19J1xuICAgICcgICAgICAgIHt7I2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctaW1hZ2VcIj4nXG4gICAgJyAgICAgICAgICA8aW1nIHNyYz1cInt7aW1hZ2Vfc21hbGxfdXJsfX1cIj4nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgIHt7L2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGV4dFwiPidcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZWRpdFwiPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWVkaXQtbGlua1wiPidcbiAgICAnICAgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLXBlbmNpbFwiPjwvaT4gRWRpdCdcbiAgICAnICAgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWRlbGV0ZS1saW5rXCI+J1xuICAgICcgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZnMgZnMtY3Jvc3MzXCI+PC9pPiBEZWxldGUnXG4gICAgJyAgICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAgICA8aDIgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGl0bGVcIj57e3RhZ319PC9oMj4nXG4gICAgJyAgICAgICAgICB7eyNwcmljZX19J1xuICAgICcgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1wcmljZVwiPnt7cHJpY2V9fTwvZGl2PidcbiAgICAnICAgICAgICAgIHt7L3ByaWNlfX0nXG4gICAgJyAgICAgICAgICB7eyNkZXNjcmlwdGlvbn19J1xuICAgICcgICAgICAgICAgPHAgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZGVzY3JpcHRpb25cIj57e2Rlc2NyaXB0aW9ufX08L3A+J1xuICAgICcgICAgICAgICAge3svZGVzY3JpcHRpb259fSdcbiAgICAnICAgICAgICAgIHt7I2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICAgIDxhIGhyZWY9XCJ7e2N1c3RvbV91cmx9fVwiIGNsYXNzPVwidGFnbGEtZGlhbG9nLWJ1dHRvbiBzdC1idG4gc3QtYnRuLXN1Y2Nlc3Mgc3QtYnRuLXNvbGlkXCIgdGFyZ2V0PVwiXCJ7e3RhcmdldH19XCI+J1xuICAgICcgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLWNhcnRcIj48L2k+J1xuICAgICcgICAgICAgICAgICBCdXkgTm93J1xuICAgICcgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgIHt7L2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICB7ey9wcm9kdWN0fX0nXG4gICAgJyAgICA8L2Rpdj4nXG4gICAgJyAgICB7e3tmb3JtX2h0bWx9fX0nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuICBORVdfVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuXG5jbGFzcyBUYWdsYSBleHRlbmRzIEJhc2VcbiAgY29uc3RydWN0b3I6ICgkd3JhcHBlciwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIHN1cGVyKClcbiAgICBAd3JhcHBlciA9ICQoJHdyYXBwZXIpXG4gICAgQGluaXQob3B0aW9ucylcbiAgICBAYmluZCgpXG5cbiQuZXh0ZW5kKFRhZ2xhLCBBVFRSUylcblxucHJvdG8gPVxuICAjIyMjIyMjIyMjIyMjI1xuICAjIFV0aWxpdGllc1xuICAjIyMjIyMjIyMjIyMjI1xuICB0b1N0cmluZzogLT4gJ1RhZ2xhJ1xuXG4gICMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIFByaXZhdGUgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBJbml0aWFsaXplIGRyYWcgYW5kIHNlbGVjdCBsaWJzIGZvciBhIHNpbmdsZSB0YWdcbiAgX2FwcGx5VG9vbHM6ICgkdGFnKSAtPlxuICAgIEBsb2cgJ19hcHBseVRvb2xzKCkgaXMgZXhlY3V0ZWQnXG4gICAgZHJhZyA9IG5ldyBEcmFnZ2FiaWxseSgkdGFnWzBdLCBUYWdsYS5EUkFHX0FUVFIpXG4gICAgZHJhZy5vbiAnZHJhZ0VuZCcsICQucHJveHkoQGhhbmRsZVRhZ01vdmUsIEApXG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScsIGRyYWcpXG4gICAgIyBVcGRhdGUgZm9ybVxuICAgIHRhZyA9ICR0YWcuZGF0YSgndGFnLWRhdGEnKVxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eF0nKS52YWwodGFnLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwodGFnLnkpXG4gICAgJGZvcm0uZmluZChcIltuYW1lPXRhZ10gb3B0aW9uW3ZhbHVlPSN7dGFnLnZhbHVlfV1cIikuYXR0cignc2VsZWN0ZWQnLCAnc2VsZWN0ZWQnKVxuICAgICRzZWxlY3QgPSAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKVxuICAgICRzZWxlY3QuY2hvc2VuMihUYWdsYS5TRUxFQ1RfQVRUUilcbiAgICAkc2VsZWN0Lm9uICdjaGFuZ2UnLCAkLnByb3h5KEBoYW5kbGVUYWdDaGFuZ2UsIEApXG4gICAgJHNlbGVjdC5vbiAnY2hvc2VuOmhpZGluZ19kcm9wZG93bicsIChlLCBwYXJhbXMpIC0+XG4gICAgICAkc2VsZWN0LnRyaWdnZXIoJ2Nob3NlbjpvcGVuJylcblxuICBfZGlzYWJsZURyYWc6ICgkZXhjZXB0KSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yIGlzIG9mZlxuICAgIEBsb2cgJ19kaXNhYmxlRHJhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICRleGNlcHQgPSAkKCRleGNlcHQpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIEBcbiAgICAgICQoQCkuZGF0YSgnZHJhZ2dhYmlsbHknKS5kaXNhYmxlKCk7XG5cbiAgX2VuYWJsZURyYWc6ICgkZXhjZXB0KSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yIGlzIG9mZlxuICAgIEBsb2cgJ19lbmFibGVEcmFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgcmV0dXJuIGlmICRleGNlcHRbMF0gaXMgQFxuICAgICAgJChAKS5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpO1xuXG4gIF9yZW1vdmVUb29sczogKCR0YWcpIC0+XG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmRlc3Ryb3koKVxuICAgICRzZWxlY3QgPSAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKVxuICAgICRzZWxlY3Quc2hvdygpLnJlbW92ZUNsYXNzICdjaHpuLWRvbmUnXG4gICAgJHNlbGVjdC5uZXh0KCkucmVtb3ZlKClcblxuICBfZ2V0UG9zaXRpb246ICgkdGFnKSAtPlxuICAgIEBsb2cgJ19nZXRQb3NpdGlvbigpIGlzIGV4ZWN1dGVkJ1xuICAgIHBvcyA9ICR0YWcucG9zaXRpb24oKVxuICAgIHggPSAocG9zLmxlZnQgKyAoJHRhZy53aWR0aCgpIC8gMikpIC8gQGN1cnJlbnRXaWR0aCAqIEBuYXR1cmFsV2lkdGhcbiAgICB5ID0gKHBvcy50b3AgKyAoJHRhZy5oZWlnaHQoKSAvIDIpKSAvIEBjdXJyZW50SGVpZ2h0ICogQG5hdHVyYWxIZWlnaHRcbiAgICBpZiBAdW5pdCBpcyAncGVyY2VudCdcbiAgICAgIHggPSB4IC8gQG5hdHVyYWxXaWR0aCAqIDEwMFxuICAgICAgeSA9IHkgLyBAbmF0dXJhbEhlaWdodCAqIDEwMFxuICAgIFt4LCB5XVxuXG4gIF91cGRhdGVJbWFnZVNpemU6IChkYXRhKSAtPlxuICAgIEBsb2cgJ191cGRhdGVJbWFnZVNpemUoKSBpcyBleGVjdXRlZCdcbiAgICBAbmF0dXJhbFdpZHRoID0gZGF0YS5uYXR1cmFsV2lkdGhcbiAgICBAbmF0dXJhbEhlaWdodCA9IGRhdGEubmF0dXJhbEhlaWdodFxuICAgIEBjdXJyZW50V2lkdGggPSBkYXRhLndpZHRoXG4gICAgQGN1cnJlbnRIZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIEB3aWR0aFJhdGlvID0gZGF0YS53aWR0aFJhdGlvXG4gICAgQGhlaWdodFJhdGlvID0gZGF0YS5oZWlnaHRSYXRpb1xuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgRXZlbnQgSGFuZGxlcnNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgaGFuZGxlVGFnQ2xpY2s6IChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByZXR1cm4gdW5sZXNzICQoZS50YXJnZXQpLmhhc0NsYXNzKCd0YWdsYS1pY29uJylcbiAgICBAbG9nICdoYW5kbGVUYWdDbGljaygpIGlzIGV4ZWN1dGVkJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcbiAgICBAc2hyaW5rKCR0YWcpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWFjdGl2ZScpXG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpXG5cbiAgaGFuZGxlVGFnQ2hhbmdlOiAoZSwgcGFyYW1zKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ0NoYW5nZSgpIGlzIGV4ZWN1dGVkJ1xuICAgICRzZWxlY3QgPSAkKGUudGFyZ2V0KVxuICAgICR0YWcgPSAkc2VsZWN0LnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGlzTmV3ID0gJHRhZy5oYXNDbGFzcygndGFnbGEtdGFnLW5ldycpXG4gICAgJHRhZy5yZW1vdmVDbGFzcyAndGFnbGEtdGFnLWNob29zZSB0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1uZXcnXG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCAkdGFnLmRhdGEoJ3RhZy1kYXRhJykpXG4gICAgZGF0YS5sYWJlbCA9ICRzZWxlY3QuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykudGV4dCgpXG4gICAgZGF0YS52YWx1ZSA9ICRzZWxlY3QudmFsKCkgfHwgZGF0YS5sYWJlbFxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuICAgICMgQWxpZ25cbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWZvcm0nKS5hbGlnbigpXG4gICAgaWYgaXNOZXdcbiAgICAgIEBlbWl0KCdhZGQnLCBbZGF0YSwgc2VyaWFsaXplLCAkdGFnXSlcbiAgICBlbHNlXG4gICAgICBAZW1pdCgnY2hhbmdlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG5cbiAgaGFuZGxlVGFnRGVsZXRlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdEZWxldGUoKSBpcyBleGVjdXRlZCdcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmUoKVxuICAgICAgQGVtaXQoJ2RlbGV0ZScsIFtkYXRhXSlcblxuICBoYW5kbGVUYWdFZGl0OiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdFZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIEBlbWl0KCdlZGl0JywgW2RhdGEsICR0YWddKVxuXG4gIGhhbmRsZVRhZ01vdmU6IChpbnN0YW5jZSwgZXZlbnQsIHBvaW50ZXIpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW92ZSgpIGlzIGV4ZWN1dGVkJ1xuXG4gICAgJHRhZyA9ICQoaW5zdGFuY2UuZWxlbWVudClcbiAgICBkYXRhID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgcG9zID0gQF9nZXRQb3NpdGlvbigkdGFnKVxuICAgIGRhdGEueCA9IHBvc1swXVxuICAgIGRhdGEueSA9IHBvc1sxXVxuXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbChkYXRhLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwoZGF0YS55KVxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcbiAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpXG4gICAgaXNOZXcgPSBpZiBkYXRhLmlkIHRoZW4gbm8gZWxzZSB5ZXNcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJykuYWxpZ24oKVxuICAgIEBlbWl0KCdtb3ZlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZywgaXNOZXddKVxuXG4gIGhhbmRsZVRhZ01vdXNlRW50ZXI6IChlKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdXNlRW50ZXInXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXG4gICAgIyBDbGVhciBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSAgJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWhvdmVyJylcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgIEBlbWl0KCdob3ZlcicsIFskdGFnXSlcblxuICBoYW5kbGVUYWdNb3VzZUxlYXZlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUxlYXZlJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgIyBTYXZlIGRlbGF5ZWQgbGVhdmUgdGltZXJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQgLT5cbiAgICAgICR0YWcucmVtb3ZlQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgLCAzMDBcbiAgICAkdGFnLmRhdGEoJ3RpbWVyJywgdGltZXIpXG5cbiAgaGFuZGxlV3JhcHBlckNsaWNrOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVXcmFwcGVyQ2xpY2soKSBpcyBleGVjdXRlZCdcbiAgICAjIEhhY2sgdG8gYXZvaWQgdHJpZ2dlcmluZyBjbGljayBldmVudFxuICAgIEBzaHJpbmsoKSBpZiAobmV3IERhdGUoKSAtIEBsYXN0RHJhZ1RpbWUgPiAxMClcblxuICBoYW5kbGVJbWFnZVJlc2l6ZTogKGUsIGRhdGEpIC0+XG4gICAgQGxvZyAnaGFuZGxlSW1hZ2VSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICBwcmV2V2lkdGggPSBAY3VycmVudFdpZHRoXG4gICAgcHJldkhlaWdodCA9IEBjdXJyZW50SGVpZ2h0XG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgICR0YWcgPSAkKEApXG4gICAgICBwb3MgPSAkdGFnLnBvc2l0aW9uKClcbiAgICAgIHggPSAocG9zLmxlZnQgLyBwcmV2V2lkdGgpICogZGF0YS53aWR0aFxuICAgICAgeSA9IChwb3MudG9wIC8gcHJldkhlaWdodCkgKiBkYXRhLmhlaWdodFxuICAgICAgJHRhZy5jc3NcbiAgICAgICAgbGVmdDogXCIje3h9cHhcIlxuICAgICAgICB0b3A6IFwiI3t5fXB4XCJcbiAgICBAX3VwZGF0ZUltYWdlU2l6ZShkYXRhKVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgUHVibGljIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgYWRkVGFnOiAodGFnID0ge30pIC0+XG4gICAgQGxvZyAnYWRkVGFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBSZW5kZXIgdGFnIGVsZW1lbnQgYnkgcHJvdmlkZWQgdGVtcGxhdGVcbiAgICB0YWcgPSAkLmV4dGVuZCh7fSwgdGFnKVxuICAgIHRhZy5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICAkdGFnID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCB0YWcpKVxuICAgIGlzTmV3ID0gKCF0YWcueCBhbmQgIXRhZy55KVxuXG4gICAgIyBSZW1vdmUgcHJldmlvdXMgYWRkZWQgbmV3IHRhZyBpZiBpdCBoYXNuJ3QgYmVpbmcgc2V0XG4gICAgaWYgaXNOZXdcbiAgICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAgIGlmICQoQCkuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISQoQCkuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICAgJChAKS5mYWRlT3V0ID0+XG4gICAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG5cbiAgICBAd3JhcHBlci5hcHBlbmQoJHRhZylcbiAgICBpZiBpc05ldyAjIERlZmF1bHQgcG9zaXRpb24gZm9yIG5ldyB0YWdcbiAgICAgICMgVE9ETyAtIE5lZWQgYSBzbWFydCB3YXkgdG8gYXZvaWQgY29sbGlzaW9uXG4gICAgICB0YWcueCA9IDUwXG4gICAgICB0YWcueSA9IDUwXG4gICAgICAkdGFnLmFkZENsYXNzICd0YWdsYS10YWctbmV3IHRhZ2xhLXRhZy1hY3RpdmUgdGFnbGEtdGFnLWNob29zZSdcbiAgICBpZiBAdW5pdCBpcyAncGVyY2VudCdcbiAgICAgIHggPSBAY3VycmVudFdpZHRoICogKHRhZy54IC8gMTAwKVxuICAgICAgeSA9IEBjdXJyZW50SGVpZ2h0ICogKHRhZy55IC8gMTAwKVxuICAgIGVsc2VcbiAgICAgIHggPSB0YWcueCAqIEB3aWR0aFJhdGlvXG4gICAgICB5ID0gdGFnLnkgKiBAaGVpZ2h0UmF0aW9cbiAgICBvZmZzZXRYID0gJHRhZy5vdXRlcldpZHRoKCkgLyAyXG4gICAgb2Zmc2V0WSA9ICR0YWcub3V0ZXJIZWlnaHQoKSAvIDJcbiAgICAkdGFnLmNzc1xuICAgICAgJ2xlZnQnOiBcIiN7eCAtIG9mZnNldFh9cHhcIlxuICAgICAgJ3RvcCc6IFwiI3t5IC0gb2Zmc2V0WX1weFwiXG4gICAgIyBTYXZlIHRhZyBkYXRhIHRvIGRhdGEgYXR0ciBmb3IgZWFzeSBhY2Nlc3NcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgdGFnKVxuXG4gICAgIyBBbGlnbk1lXG4gICAgJGRpYWxvZyA9ICR0YWcuZmluZCgnLnRhZ2xhLWRpYWxvZycpXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICBhdHRycyA9XG4gICAgICByZWxhdGVUbzogJHRhZ1xuICAgICAgY29uc3RyYWluQnk6IEB3cmFwcGVyXG4gICAgICBza2lwVmlld3BvcnQ6IGZhbHNlXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnLCBuZXcgQWxpZ25NZSgkZGlhbG9nLCBhdHRycykpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJywgbmV3IEFsaWduTWUoJGZvcm0sIGF0dHJzKSlcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWZvcm0nKS5hbGlnbigpXG5cbiAgICAjIFJlbmRlciB0YWcgZWRpdG9yIHRvb2xzXG4gICAgaWYgQGVkaXRvclxuICAgICAgQF9hcHBseVRvb2xzKCR0YWcpXG4gICAgICBpZiBpc05ld1xuICAgICAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKClcbiAgICAgICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAd3JhcHBlci5hZGRDbGFzcygndGFnbGEtZWRpdGluZy1zZWxlY3RpbmcnKVxuICAgICAgICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLnRyaWdnZXIgJ2Nob3NlbjpvcGVuJ1xuICAgICAgICAgIEBfZGlzYWJsZURyYWcoJHRhZylcbiAgICAgICAgICBAZW1pdCgnbmV3JywgWyR0YWddKVxuICAgICAgICAsIDEwMFxuXG4gIGRlbGV0ZVRhZzogKCR0YWcpIC0+XG4gICAgQGxvZyAnZGVsZXRlVGFnKCkgaXMgZXhlY3V0ZWQnXG5cbiAgZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvblxuICAgIEBsb2cgJ2VkaXQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5hZGRDbGFzcygndGFnbGEtZWRpdGluZycpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT4gQF9hcHBseVRvb2xzKCQoQCkpXG4gICAgQGVkaXRvciA9IG9uXG5cbiAgZ2V0VGFnczogLT5cbiAgICBAbG9nICdnZXRUYWdzKCkgaXMgZXhlY3V0ZWQnXG4gICAgdGFncyA9IFtdXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJChAKS5kYXRhKCd0YWctZGF0YScpKVxuICAgICAgdGFncy5wdXNoICQoQCkuZGF0YSgndGFnLWRhdGEnKVxuICAgIHRhZ3NcblxuICAjIFNocmluayBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgJGV4Y2VwdFxuICBzaHJpbms6ICgkZXhjZXB0ID0gbnVsbCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdzaHJpbmsoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIGVsXG4gICAgICAkdGFnID0gJChlbClcbiAgICAgIGlmICR0YWcuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISR0YWcuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgICAgICR0YWcucmVtb3ZlKClcbiAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG4gICAgICAkdGFnLnJlbW92ZUNsYXNzICd0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1jaG9vc2UnXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJ1xuICAgIEBfZW5hYmxlRHJhZygpXG5cbiAgdXBkYXRlRGlhbG9nOiAoJHRhZywgZGF0YSkgLT5cbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSwgZGF0YSlcbiAgICBkYXRhLmZvcm1faHRtbCA9IEBmb3JtSHRtbFxuICAgIGh0bWwgPSAkKE11c3RhY2hlLnJlbmRlcihAdGFnVGVtcGxhdGUsIGRhdGEpKS5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbCgpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbChodG1sKVxuICAgICR0YWcuZGF0YSgndGFnLWRhdGEnLCBkYXRhKVxuXG4gIHVuZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXQgaXMgb2ZmXG4gICAgQGxvZyAndW5lZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggKGksIGVsKSA9PlxuICAgICAgQF9yZW1vdmVUb29scygkKGVsKSlcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEtZWRpdGluZydcbiAgICBAZWRpdG9yID0gb2ZmXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBMaWZlY3ljbGUgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBpbml0OiAob3B0aW9ucykgLT5cbiAgICAjIENvbmZpZ3VyZSBPcHRpb25zXG4gICAgQGRhdGEgPSBvcHRpb25zLmRhdGEgfHwgW11cbiAgICBAZWRpdG9yID0gKG9wdGlvbnMuZWRpdG9yIGlzIG9uKSA/IG9uIDogZmFsc2VcbiAgICBAZm9ybUh0bWwgPSBpZiBvcHRpb25zLmZvcm0gdGhlbiAkKG9wdGlvbnMuZm9ybSkgZWxzZSAkKFRhZ2xhLkZPUk1fVEVNUExBVEUpXG4gICAgQGZvcm1IdG1sID0gQGZvcm1IdG1sLmh0bWwoKVxuICAgIEB0YWdUZW1wbGF0ZSA9IGlmIG9wdGlvbnMudGFnVGVtcGxhdGUgdGhlbiAkKG9wdGlvbnMudGFnVGVtcGxhdGUpLmh0bWwoKSBlbHNlIFRhZ2xhLlRBR19URU1QTEFURVxuICAgIEB1bml0ID0gaWYgb3B0aW9ucy51bml0IGlzICdwZXJjZW50JyB0aGVuICdwZXJjZW50JyBlbHNlICdwaXhlbCdcbiAgICAjIEF0dHJpYnV0ZXNcbiAgICBAaW1hZ2VTaXplID0gbnVsbFxuICAgIEBpbWFnZSA9IEB3cmFwcGVyLmZpbmQoJ2ltZycpXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcblxuICBiaW5kOiAtPlxuICAgIEBsb2cgJ2JpbmQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlclxuICAgICAgLm9uICdtb3VzZWVudGVyJywgJC5wcm94eShAaGFuZGxlTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAkLnByb3h5KEBoYW5kbGVXcmFwcGVyQ2xpY2ssIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZWRpdC1saW5rJywgJC5wcm94eShAaGFuZGxlVGFnRWRpdCwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAnLnRhZ2xhLXRhZy1kZWxldGUtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0RlbGV0ZSwgQClcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnbW91c2VsZWF2ZScsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VMZWF2ZSwgQClcblxuICByZW5kZXI6IC0+XG4gICAgQGxvZyAncmVuZGVyKCkgaXMgZXhlY3V0ZWQnXG4gICAgQGltYWdlLmF0dHIoJ2RyYWdnYWJsZScsIGZhbHNlKVxuICAgIEBpbWFnZVNpemUgPSBJbWFnZVNpemUuZ2V0KEBpbWFnZSwgJC5wcm94eShAcmVuZGVyRm4sIEApKVxuICAgIEBpbWFnZVNpemUub24oJ2NoYW5nZScsICQucHJveHkoQGhhbmRsZUltYWdlUmVzaXplLCBAKSlcblxuICByZW5kZXJGbjogKHN1Y2Nlc3MsIGRhdGEpIC0+XG4gICAgQGxvZyAncmVuZGVyRm4oKSBpcyBleGVjdXRlZCdcbiAgICBpc1NhZmFyaSA9IC9TYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgYW5kXG4gICAgICAgICAgICAgICAvQXBwbGUgQ29tcHV0ZXIvLnRlc3QobmF2aWdhdG9yLnZlbmRvcilcbiAgICB1bmxlc3Mgc3VjY2VzcyAjIFN0b3AgaWYgaW1hZ2UgaXMgZmFpbGVkIHRvIGxvYWRcbiAgICAgIEBsb2coXCJGYWlsZWQgdG8gbG9hZCBpbWFnZTogI3tAaW1hZ2UuYXR0cignc3JjJyl9XCIsICdlcnJvcicpXG4gICAgICBAZGVzdHJveSgpXG4gICAgICByZXR1cm5cbiAgICBAX3VwZGF0ZUltYWdlU2l6ZShkYXRhKSAjIFNhdmUgZGltZW5zaW9uXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MgJ3RhZ2xhJyAjIEFwcGx5IG5lY2Vzc2FyeSBjbGFzcyBuYW1lc1xuICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYS1zYWZhcmknIGlmIGlzU2FmYXJpICMgQXZvaWQgYW5pbWF0aW9uXG4gICAgQGFkZFRhZyB0YWcgZm9yIHRhZyBpbiBAZGF0YSAjIENyZWF0ZSB0YWdzXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgQHdyYXBwZXIuYWRkQ2xhc3MgJ3RhZ2xhLWVkaXRpbmcnIGlmIEBlZGl0b3JcbiAgICAgIEBlbWl0KCdyZWFkeScsIFtAXSlcbiAgICAsIDUwMFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGxvZyAnZGVzdHJveSgpIGlzIGV4ZWN1dGVkJ1xuICAgIEB3cmFwcGVyLnJlbW92ZUNsYXNzICd0YWdsYSB0YWdsYS1lZGl0aW5nJ1xuICAgIEB3cmFwcGVyLmZpbmQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAkdGFnID0gJChAKVxuICAgICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykuY2hvc2VuMiAnZGVzdHJveSdcbiAgICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5kZXN0cm95KClcbiAgICAgICR0YWcucmVtb3ZlKClcblxuJC5leHRlbmQoVGFnbGE6OiwgcHJvdG8pXG5cbiMgVmFuaWxsYSBKU1xud2luZG93LlRhZ2xhID0gVGFnbGFcbndpbmRvdy5TdGFja2xhLlRhZ2xhID0gVGFnbGEgaWYgd2luZG93LlN0YWNrbGFcblxuaWYgdHlwZW9mIGV4cG9ydHMgaXMgJ29iamVjdCcgYW5kIGV4cG9ydHMgIyBDb21tb25KU1xuICBtb2R1bGUuZXhwb3J0cyA9IFRhZ2xhXG5lbHNlIGlmIHR5cGVvZiBkZWZpbmUgaXMgJ2Z1bmN0aW9uJyBhbmQgZGVmaW5lLmFtZCAjIEFNRFxuICBkZWZpbmUoWydleHBvcnRzJ10sIFRhZ2xhKVxuXG4iXX0=
