// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = exports = require('./src/js/alignme.js');

},{"./src/js/alignme.js":2}],2:[function(require,module,exports){
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

//if (typeof exports === 'object' && exports) { // CommonJS
//} else if (typeof define === 'function' && define.amd) { // AMD
    //define(['exports'], AlignMe);
//}
module.exports = AlignMe;


},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){

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



},{"./base.coffee":4}],6:[function(require,module,exports){
var ATTRS, AlignMe, Base, ImageSize, Mustache, Tagla, proto,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Mustache = require('mustache');

Base = require('./base.coffee');

ImageSize = require('./image.coffee');

AlignMe = require('alignme');

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

if (typeof exports === 'object' && exports) {
  module.exports = Tagla;
} else if (typeof define === 'function' && define.amd) {
  define(['exports'], Tagla);
}



},{"./base.coffee":4,"./image.coffee":5,"alignme":1,"mustache":3}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYWxpZ25tZS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9hbGlnbm1lL3NyYy9qcy9hbGlnbm1lLmpzIiwibm9kZV9tb2R1bGVzL211c3RhY2hlL211c3RhY2hlLmpzIiwiL1VzZXJzL2pvc2VwaGovUmVwb3MvdGFnbGEyL3NyYy9jb2ZmZWUvYmFzZS5jb2ZmZWUiLCIvVXNlcnMvam9zZXBoai9SZXBvcy90YWdsYTIvc3JjL2NvZmZlZS9pbWFnZS5jb2ZmZWUiLCIvVXNlcnMvam9zZXBoai9SZXBvcy90YWdsYTIvc3JjL2NvZmZlZS90YWdsYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDemtCQTtBQUFBOztHQUFBO0FBQUEsSUFBQSxJQUFBOztBQUFBO0FBS2UsRUFBQSxjQUFDLE9BQUQsR0FBQTtBQUNYLFFBQUEsWUFBQTs7TUFEWSxVQUFVO0tBQ3RCO0FBQUEsSUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLFNBQUQsQ0FB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QU8sQ0FBQyxXQUFULENBQXFCLHFCQUFyQixDQURBLENBQUE7V0FFQSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxZQUFkLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsU0FBQSxHQUFBO0FBQy9CLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQVAsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxlQUFWLENBQTBCLENBQUMsT0FBM0IsQ0FBbUMsU0FBbkMsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFJLENBQUMsSUFBTCxDQUFVLGFBQVYsQ0FBd0IsQ0FBQyxPQUF6QixDQUFBLENBRkEsQ0FBQTthQUdBLElBQUksQ0FBQyxNQUFMLENBQUEsRUFKK0I7SUFBQSxDQUFqQyxFQUhPO0VBQUEsQ0E3VlQ7Q0ExRkYsQ0FBQTs7QUFBQSxDQWdjQyxDQUFDLE1BQUYsQ0FBUyxLQUFLLENBQUEsU0FBZCxFQUFrQixLQUFsQixDQWhjQSxDQUFBOztBQW1jQSxJQUFnQyxNQUFNLENBQUMsT0FBdkM7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBZixHQUF1QixLQUF2QixDQUFBO0NBbmNBOztBQXFjQSxJQUFHLE1BQUEsQ0FBQSxPQUFBLEtBQWtCLFFBQWxCLElBQStCLE9BQWxDO0FBQ0UsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixLQUFqQixDQURGO0NBQUEsTUFFSyxJQUFHLE1BQUEsQ0FBQSxNQUFBLEtBQWlCLFVBQWpCLElBQWdDLE1BQU0sQ0FBQyxHQUExQztBQUNILEVBQUEsTUFBQSxDQUFPLENBQUMsU0FBRCxDQUFQLEVBQW9CLEtBQXBCLENBQUEsQ0FERztDQXZjTCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSByZXF1aXJlKCcuL3NyYy9qcy9hbGlnbm1lLmpzJyk7XG4iLCIvKmdsb2JhbCB3aW5kb3csICQsIGRlZmluZSwgZG9jdW1lbnQgKi9cbi8qKlxuICogQSBKYXZhU2NyaXB0IHV0aWxpdHkgd2hpY2ggYXV0b21hdGljYWxseSBhbGlnbnMgcG9zaXRpb24gb2YgYW4gb3ZlcmxheS5cbiAqXG4gKiAgICAgIEBleGFtcGxlXG4gKiAgICAgIHZhciBhbGlnbk1lID0gbmV3IEFsaWduTWUoJG92ZXJsYXksIHtcbiAqICAgICAgICAgIHJlbGF0ZVRvOiAnLmRyYWdnYWJsZScsXG4gKiAgICAgICAgICBjb25zdHJhaW5CeTogJy5wYXJlbnQnLFxuICogICAgICAgICAgc2tpcFZpZXdwb3J0OiBmYWxzZVxuICogICAgICB9KTtcbiAqICAgICAgYWxpZ25NZS5hbGlnbigpO1xuICpcbiAqIEBjbGFzcyBBbGlnbk1lXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBvdmVybGF5IE92ZXJsYXkgZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgQ29uZmlndXJhYmxlIG9wdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBBbGlnbk1lKG92ZXJsYXksIG9wdGlvbnMpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGF0Lm92ZXJsYXkgPSAkKG92ZXJsYXkpO1xuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbmZpZyBPcHRpb25zXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IHJlbGF0ZVRvIChyZXF1aXJlZClcbiAgICAgKiBUaGUgcmVmZXJlbmNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnJlbGF0ZVRvID0gJChvcHRpb25zLnJlbGF0ZVRvKSB8fCBudWxsO1xuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSByZWxhdGVUb1xuICAgICAqIFRoZSByZWZlcmVuY2UgZWxlbWVudFxuICAgICAqL1xuICAgIHRoYXQuY29uc3RyYWluQnkgPSAkKG9wdGlvbnMuY29uc3RyYWluQnkpIHx8IG51bGw7XG4gICAgLyoqXG4gICAgICogQGNmZyB7SFRNTEVsZW1lbnR9IFtza2lwVmlld3BvcnQ9dHJ1ZV1cbiAgICAgKiBJZ25vcmUgd2luZG93IGFzIGFub3RoZXIgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LnNraXBWaWV3cG9ydCA9IChvcHRpb25zLnNraXBWaWV3cG9ydCA9PT0gZmFsc2UpID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgLy8gU3RvcCBpZiBvdmVybGF5IG9yIG9wdGlvbnMucmVsYXRlZFRvIGFyZW50IHByb3ZpZGVkXG4gICAgaWYgKCF0aGF0Lm92ZXJsYXkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgb3ZlcmxheWAgZWxlbWVudCBpcyByZXF1aXJlZCcpO1xuICAgIH1cbiAgICBpZiAoIXRoYXQucmVsYXRlVG8pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgcmVsYXRlVG9gIG9wdGlvbiBpcyByZXF1aXJlZCcpO1xuICAgIH1cbn1cblxudmFyIF9nZXRNYXgsXG4gICAgX2dldFBvaW50cyxcbiAgICBfbGlzdFBvc2l0aW9ucyxcbiAgICBfc2V0Q29uc3RyYWluQnlWaWV3cG9ydDtcblxuLy8gUmVwbGFjZW1lbnQgZm9yIF8ubWF4XG5fZ2V0TWF4ID0gZnVuY3Rpb24gKG9iaiwgYXR0cikge1xuICAgIHZhciBtYXhWYWx1ZSA9IDAsXG4gICAgICAgIG1heEl0ZW0sXG4gICAgICAgIGksIG87XG5cbiAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIG8gPSBvYmpbaV07XG4gICAgICAgICAgICBpZiAob1thdHRyXSA+IG1heFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgbWF4VmFsdWUgPSBvW2F0dHJdO1xuICAgICAgICAgICAgICAgIG1heEl0ZW0gPSBvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1heEl0ZW07XG59O1xuXG4vLyBHZXQgY29vcmRpbmF0ZXMgYW5kIGRpbWVuc2lvbiBvZiBhbiBlbGVtZW50XG5fZ2V0UG9pbnRzID0gZnVuY3Rpb24gKCRlbCkge1xuICAgIHZhciBvZmZzZXQgPSAkZWwub2Zmc2V0KCksXG4gICAgICAgIHdpZHRoID0gJGVsLm91dGVyV2lkdGgoKSxcbiAgICAgICAgaGVpZ2h0ID0gJGVsLm91dGVySGVpZ2h0KCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0ICAgOiBvZmZzZXQubGVmdCxcbiAgICAgICAgdG9wICAgIDogb2Zmc2V0LnRvcCxcbiAgICAgICAgcmlnaHQgIDogb2Zmc2V0LmxlZnQgKyB3aWR0aCxcbiAgICAgICAgYm90dG9tIDogb2Zmc2V0LnRvcCArIGhlaWdodCxcbiAgICAgICAgd2lkdGggIDogd2lkdGgsXG4gICAgICAgIGhlaWdodCA6IGhlaWdodFxuICAgIH07XG59O1xuXG4vLyBMaXN0IGFsbCBwb3NzaWJsZSBYWSBjb29yZGluZGF0ZXNcbl9saXN0UG9zaXRpb25zID0gZnVuY3Rpb24gKG92ZXJsYXlEYXRhLCByZWxhdGVUb0RhdGEpIHtcbiAgICB2YXIgY2VudGVyID0gcmVsYXRlVG9EYXRhLmxlZnQgKyAocmVsYXRlVG9EYXRhLndpZHRoIC8gMikgLSAob3ZlcmxheURhdGEud2lkdGggLyAyKTtcblxuICAgIHJldHVybiBbXG4gICAgICAgIC8vIGxibHQgWydsZWZ0JywgJ2JvdHRvbSddLCBbJ2xlZnQnLCAndG9wJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5sZWZ0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdsYmx0J30sXG4gICAgICAgIC8vIGNiY3QgWydjZW50ZXInLCAnYm90dG9tJ10sIFsnY2VudGVyJywgJ3RvcCddXG4gICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2NiY3QnfSxcbiAgICAgICAgLy8gcmJydCBbJ3JpZ2h0JywgJ2JvdHRvbSddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJydCd9LFxuXG4gICAgICAgIC8vIGx0cnQgWydsZWZ0JywgJ3RvcCddLCBbJ3JpZ2h0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCwgbmFtZTogJ2x0cnQnfSxcbiAgICAgICAgLy8gbGJyYiBbJ2xlZnQnLCAnYm90dG9tJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJyYid9LFxuXG4gICAgICAgIC8vIHJ0cmIgWydyaWdodCcsICd0b3AnXSwgWydyaWdodCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ3J0cmInfSxcbiAgICAgICAgLy8gY3RjYiBbJ2NlbnRlcicsICd0b3AnXSwgWydjZW50ZXInLCAnYm90dG9tJ11cbiAgICAgICAgLy8ge2xlZnQ6IGNlbnRlciwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnY3RjYid9LFxuICAgICAgICAvLyBsdGxiIFsnbGVmdCcsICd0b3AnXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tLCBuYW1lOiAnbHRsYid9LFxuXG4gICAgICAgIC8vIHJibGIgWydyaWdodCcsICdib3R0b20nXSwgWydsZWZ0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20gLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdyYmxiJ30sXG4gICAgICAgIC8vIHJ0bHQgWydyaWdodCcsICd0b3AnXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdydGx0J31cbiAgICBdO1xufTtcblxuLy8gVGFrZSBjdXJyZW50IHZpZXdwb3J0L3dpbmRvdyBhcyBjb25zdHJhaW4uXG5fc2V0Q29uc3RyYWluQnlWaWV3cG9ydCA9IGZ1bmN0aW9uIChjb25zdHJhaW5CeURhdGEpIHtcbiAgICB2YXIgJHdpbmRvdyA9ICQod2luZG93KSxcbiAgICAgICAgdG9wbW9zdCA9ICR3aW5kb3cuc2Nyb2xsVG9wKCksXG4gICAgICAgIGJvdHRvbW1vc3QgPSB0b3Btb3N0ICsgJHdpbmRvdy5oZWlnaHQoKTtcblxuICAgIGlmICh0b3Btb3N0ID4gY29uc3RyYWluQnlEYXRhKSB7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS50b3AgPSB0b3Btb3N0O1xuICAgIH1cbiAgICBpZiAoYm90dG9tbW9zdCA8IGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIHtcbiAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSA9IGJvdHRvbW1vc3Q7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5oZWlnaHQgPSBib3R0b21tb3N0IC0gdG9wbW9zdDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnN0cmFpbkJ5RGF0YTtcbn07XG5cbi8qKlxuICogQWxpZ24gb3ZlcmxheSBhdXRvbWF0aWNhbGx5XG4gKlxuICogQG1ldGhvZCBhbGlnblxuICogQHJldHVybiB7QXJyYXl9IFRoZSBiZXN0IFhZIGNvb3JkaW5hdGVzXG4gKi9cbkFsaWduTWUucHJvdG90eXBlLmFsaWduID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgb3ZlcmxheSA9IHRoYXQub3ZlcmxheSxcbiAgICAgICAgb3ZlcmxheURhdGEgPSBfZ2V0UG9pbnRzKG92ZXJsYXkpLFxuICAgICAgICByZWxhdGVUb0RhdGEgPSBfZ2V0UG9pbnRzKHRoYXQucmVsYXRlVG8pLFxuICAgICAgICBjb25zdHJhaW5CeURhdGEgPSBfZ2V0UG9pbnRzKHRoYXQuY29uc3RyYWluQnkpLFxuICAgICAgICBwb3NpdGlvbnMgPSBfbGlzdFBvc2l0aW9ucyhvdmVybGF5RGF0YSwgcmVsYXRlVG9EYXRhKSwgLy8gQWxsIHBvc3NpYmxlIHBvc2l0aW9uc1xuICAgICAgICBoYXNDb250YWluID0gZmFsc2UsIC8vIEluZGljYXRlcyBpZiBhbnkgcG9zaXRpb25zIGFyZSBmdWxseSBjb250YWluZWQgYnkgY29uc3RyYWluIGVsZW1lbnRcbiAgICAgICAgYmVzdFBvcyA9IHt9LCAvLyBSZXR1cm4gdmFsdWVcbiAgICAgICAgcG9zLCBpOyAvLyBGb3IgSXRlcmF0aW9uXG5cbiAgICAvLyBDb25zdHJhaW4gYnkgdmlld3BvcnRcbiAgICBpZiAoIXRoYXQuc2tpcFZpZXdwb3J0KSB7XG4gICAgICAgIF9zZXRDb25zdHJhaW5CeVZpZXdwb3J0KGNvbnN0cmFpbkJ5RGF0YSk7XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHBvc2l0aW9ucykge1xuICAgICAgICBpZiAocG9zaXRpb25zLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBwb3MgPSBwb3NpdGlvbnNbaV07XG4gICAgICAgICAgICBwb3MucmlnaHQgPSBwb3MubGVmdCArIG92ZXJsYXlEYXRhLndpZHRoO1xuICAgICAgICAgICAgcG9zLmJvdHRvbSA9IHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQ7XG4gICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgcG9zLmxlZnQgPj0gY29uc3RyYWluQnlEYXRhLmxlZnQgJiZcbiAgICAgICAgICAgICAgICBwb3MudG9wID49IGNvbnN0cmFpbkJ5RGF0YS50b3AgJiZcbiAgICAgICAgICAgICAgICBwb3MucmlnaHQgPD0gY29uc3RyYWluQnlEYXRhLnJpZ2h0ICYmXG4gICAgICAgICAgICAgICAgcG9zLmJvdHRvbSA8PSBjb25zdHJhaW5CeURhdGEuYm90dG9tXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAvLyBJbnNpZGUgZGlzdGFuY2UuIFRoZSBtb3JlIHRoZSBiZXR0ZXIuXG4gICAgICAgICAgICAgICAgLy8gNCBkaXN0YW5jZXMgdG8gYm9yZGVyIG9mIGNvbnN0cmFpblxuICAgICAgICAgICAgICAgIHBvcy5pbkRpc3RhbmNlID0gTWF0aC5taW4uYXBwbHkobnVsbCwgW1xuICAgICAgICAgICAgICAgICAgICBwb3MudG9wIC0gY29uc3RyYWluQnlEYXRhLnRvcCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLnJpZ2h0IC0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgY29uc3RyYWluQnlEYXRhLmJvdHRvbSAtIHBvcy50b3AgKyBvdmVybGF5RGF0YS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHBvcy5sZWZ0IC0gY29uc3RyYWluQnlEYXRhLmxlZnRcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAvLyBVcGRhdGUgZmxhZ1xuICAgICAgICAgICAgICAgIGhhc0NvbnRhaW4gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgbW9yZSBvdmVybGFwIHRoZSBiZXR0ZXJcbiAgICAgICAgICAgICAgICBwb3Mub3ZlcmxhcFNpemUgPVxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLnJpZ2h0LCBjb25zdHJhaW5CeURhdGEucmlnaHQpIC0gTWF0aC5tYXgocG9zLmxlZnQsIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0KSkgKlxuICAgICAgICAgICAgICAgICAgICAoTWF0aC5taW4ocG9zLmJvdHRvbSwgY29uc3RyYWluQnlEYXRhLmJvdHRvbSkgLSBNYXRoLm1heChwb3MudG9wLCBjb25zdHJhaW5CeURhdGEudG9wKSkgO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYmVzdFBvcyA9IChoYXNDb250YWluKSA/IF9nZXRNYXgocG9zaXRpb25zLCAnaW5EaXN0YW5jZScpIDogX2dldE1heChwb3NpdGlvbnMsICdvdmVybGFwU2l6ZScpO1xuICAgIG92ZXJsYXkub2Zmc2V0KGJlc3RQb3MpO1xuXG4gICAgcmV0dXJuIGJlc3RQb3M7XG59O1xuXG5pZiAod2luZG93LlN0YWNrbGEpIHsgLy8gVmFuaWxsYSBKU1xuICAgIHdpbmRvdy5TdGFja2xhLkFsaWduTWUgPSBBbGlnbk1lO1xufSBlbHNlIHtcbiAgICB3aW5kb3cuQWxpZ25NZSA9IEFsaWduTWU7XG59XG5cbi8vaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiBleHBvcnRzKSB7IC8vIENvbW1vbkpTXG4vL30gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7IC8vIEFNRFxuICAgIC8vZGVmaW5lKFsnZXhwb3J0cyddLCBBbGlnbk1lKTtcbi8vfVxubW9kdWxlLmV4cG9ydHMgPSBBbGlnbk1lO1xuXG4iLCIvKiFcbiAqIG11c3RhY2hlLmpzIC0gTG9naWMtbGVzcyB7e211c3RhY2hlfX0gdGVtcGxhdGVzIHdpdGggSmF2YVNjcmlwdFxuICogaHR0cDovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qc1xuICovXG5cbi8qZ2xvYmFsIGRlZmluZTogZmFsc2UqL1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09IFwib2JqZWN0XCIgJiYgZXhwb3J0cykge1xuICAgIGZhY3RvcnkoZXhwb3J0cyk7IC8vIENvbW1vbkpTXG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpOyAvLyBBTURcbiAgfSBlbHNlIHtcbiAgICBmYWN0b3J5KGdsb2JhbC5NdXN0YWNoZSA9IHt9KTsgLy8gPHNjcmlwdD5cbiAgfVxufSh0aGlzLCBmdW5jdGlvbiAobXVzdGFjaGUpIHtcblxuICB2YXIgT2JqZWN0X3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0X3RvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICBmdW5jdGlvbiBpc0Z1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgZnVuY3Rpb24gZXNjYXBlUmVnRXhwKHN0cmluZykge1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvW1xcLVxcW1xcXXt9KCkqKz8uLFxcXFxcXF4kfCNcXHNdL2csIFwiXFxcXCQmXCIpO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9pc3N1ZXMuYXBhY2hlLm9yZy9qaXJhL2Jyb3dzZS9DT1VDSERCLTU3N1xuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4OVxuICB2YXIgUmVnRXhwX3Rlc3QgPSBSZWdFeHAucHJvdG90eXBlLnRlc3Q7XG4gIGZ1bmN0aW9uIHRlc3RSZWdFeHAocmUsIHN0cmluZykge1xuICAgIHJldHVybiBSZWdFeHBfdGVzdC5jYWxsKHJlLCBzdHJpbmcpO1xuICB9XG5cbiAgdmFyIG5vblNwYWNlUmUgPSAvXFxTLztcbiAgZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKHN0cmluZykge1xuICAgIHJldHVybiAhdGVzdFJlZ0V4cChub25TcGFjZVJlLCBzdHJpbmcpO1xuICB9XG5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICBcIiZcIjogXCImYW1wO1wiLFxuICAgIFwiPFwiOiBcIiZsdDtcIixcbiAgICBcIj5cIjogXCImZ3Q7XCIsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG4gICAgXCIvXCI6ICcmI3gyRjsnXG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlSHRtbChzdHJpbmcpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZSgvWyY8PlwiJ1xcL10vZywgZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBlbnRpdHlNYXBbc107XG4gICAgfSk7XG4gIH1cblxuICB2YXIgd2hpdGVSZSA9IC9cXHMqLztcbiAgdmFyIHNwYWNlUmUgPSAvXFxzKy87XG4gIHZhciBlcXVhbHNSZSA9IC9cXHMqPS87XG4gIHZhciBjdXJseVJlID0gL1xccypcXH0vO1xuICB2YXIgdGFnUmUgPSAvI3xcXF58XFwvfD58XFx7fCZ8PXwhLztcblxuICAvKipcbiAgICogQnJlYWtzIHVwIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHN0cmluZyBpbnRvIGEgdHJlZSBvZiB0b2tlbnMuIElmIHRoZSBgdGFnc2BcbiAgICogYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSBpdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvIHN0cmluZyB2YWx1ZXM6IHRoZVxuICAgKiBvcGVuaW5nIGFuZCBjbG9zaW5nIHRhZ3MgdXNlZCBpbiB0aGUgdGVtcGxhdGUgKGUuZy4gWyBcIjwlXCIsIFwiJT5cIiBdKS4gT2ZcbiAgICogY291cnNlLCB0aGUgZGVmYXVsdCBpcyB0byB1c2UgbXVzdGFjaGVzIChpLmUuIG11c3RhY2hlLnRhZ3MpLlxuICAgKlxuICAgKiBBIHRva2VuIGlzIGFuIGFycmF5IHdpdGggYXQgbGVhc3QgNCBlbGVtZW50cy4gVGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlXG4gICAqIG11c3RhY2hlIHN5bWJvbCB0aGF0IHdhcyB1c2VkIGluc2lkZSB0aGUgdGFnLCBlLmcuIFwiI1wiIG9yIFwiJlwiLiBJZiB0aGUgdGFnXG4gICAqIGRpZCBub3QgY29udGFpbiBhIHN5bWJvbCAoaS5lLiB7e215VmFsdWV9fSkgdGhpcyBlbGVtZW50IGlzIFwibmFtZVwiLiBGb3JcbiAgICogYWxsIHRleHQgdGhhdCBhcHBlYXJzIG91dHNpZGUgYSBzeW1ib2wgdGhpcyBlbGVtZW50IGlzIFwidGV4dFwiLlxuICAgKlxuICAgKiBUaGUgc2Vjb25kIGVsZW1lbnQgb2YgYSB0b2tlbiBpcyBpdHMgXCJ2YWx1ZVwiLiBGb3IgbXVzdGFjaGUgdGFncyB0aGlzIGlzXG4gICAqIHdoYXRldmVyIGVsc2Ugd2FzIGluc2lkZSB0aGUgdGFnIGJlc2lkZXMgdGhlIG9wZW5pbmcgc3ltYm9sLiBGb3IgdGV4dCB0b2tlbnNcbiAgICogdGhpcyBpcyB0aGUgdGV4dCBpdHNlbGYuXG4gICAqXG4gICAqIFRoZSB0aGlyZCBhbmQgZm91cnRoIGVsZW1lbnRzIG9mIHRoZSB0b2tlbiBhcmUgdGhlIHN0YXJ0IGFuZCBlbmQgaW5kaWNlcyxcbiAgICogcmVzcGVjdGl2ZWx5LCBvZiB0aGUgdG9rZW4gaW4gdGhlIG9yaWdpbmFsIHRlbXBsYXRlLlxuICAgKlxuICAgKiBUb2tlbnMgdGhhdCBhcmUgdGhlIHJvb3Qgbm9kZSBvZiBhIHN1YnRyZWUgY29udGFpbiB0d28gbW9yZSBlbGVtZW50czogMSkgYW5cbiAgICogYXJyYXkgb2YgdG9rZW5zIGluIHRoZSBzdWJ0cmVlIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsIHRlbXBsYXRlIGF0XG4gICAqIHdoaWNoIHRoZSBjbG9zaW5nIHRhZyBmb3IgdGhhdCBzZWN0aW9uIGJlZ2lucy5cbiAgICovXG4gIGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICBpZiAoIXRlbXBsYXRlKVxuICAgICAgcmV0dXJuIFtdO1xuXG4gICAgdmFyIHNlY3Rpb25zID0gW107ICAgICAvLyBTdGFjayB0byBob2xkIHNlY3Rpb24gdG9rZW5zXG4gICAgdmFyIHRva2VucyA9IFtdOyAgICAgICAvLyBCdWZmZXIgdG8gaG9sZCB0aGUgdG9rZW5zXG4gICAgdmFyIHNwYWNlcyA9IFtdOyAgICAgICAvLyBJbmRpY2VzIG9mIHdoaXRlc3BhY2UgdG9rZW5zIG9uIHRoZSBjdXJyZW50IGxpbmVcbiAgICB2YXIgaGFzVGFnID0gZmFsc2U7ICAgIC8vIElzIHRoZXJlIGEge3t0YWd9fSBvbiB0aGUgY3VycmVudCBsaW5lP1xuICAgIHZhciBub25TcGFjZSA9IGZhbHNlOyAgLy8gSXMgdGhlcmUgYSBub24tc3BhY2UgY2hhciBvbiB0aGUgY3VycmVudCBsaW5lP1xuXG4gICAgLy8gU3RyaXBzIGFsbCB3aGl0ZXNwYWNlIHRva2VucyBhcnJheSBmb3IgdGhlIGN1cnJlbnQgbGluZVxuICAgIC8vIGlmIHRoZXJlIHdhcyBhIHt7I3RhZ319IG9uIGl0IGFuZCBvdGhlcndpc2Ugb25seSBzcGFjZS5cbiAgICBmdW5jdGlvbiBzdHJpcFNwYWNlKCkge1xuICAgICAgaWYgKGhhc1RhZyAmJiAhbm9uU3BhY2UpIHtcbiAgICAgICAgd2hpbGUgKHNwYWNlcy5sZW5ndGgpXG4gICAgICAgICAgZGVsZXRlIHRva2Vuc1tzcGFjZXMucG9wKCldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3BhY2VzID0gW107XG4gICAgICB9XG5cbiAgICAgIGhhc1RhZyA9IGZhbHNlO1xuICAgICAgbm9uU3BhY2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgb3BlbmluZ1RhZ1JlLCBjbG9zaW5nVGFnUmUsIGNsb3NpbmdDdXJseVJlO1xuICAgIGZ1bmN0aW9uIGNvbXBpbGVUYWdzKHRhZ3MpIHtcbiAgICAgIGlmICh0eXBlb2YgdGFncyA9PT0gJ3N0cmluZycpXG4gICAgICAgIHRhZ3MgPSB0YWdzLnNwbGl0KHNwYWNlUmUsIDIpO1xuXG4gICAgICBpZiAoIWlzQXJyYXkodGFncykgfHwgdGFncy5sZW5ndGggIT09IDIpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCB0YWdzOiAnICsgdGFncyk7XG5cbiAgICAgIG9wZW5pbmdUYWdSZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXhwKHRhZ3NbMF0pICsgJ1xcXFxzKicpO1xuICAgICAgY2xvc2luZ1RhZ1JlID0gbmV3IFJlZ0V4cCgnXFxcXHMqJyArIGVzY2FwZVJlZ0V4cCh0YWdzWzFdKSk7XG4gICAgICBjbG9zaW5nQ3VybHlSZSA9IG5ldyBSZWdFeHAoJ1xcXFxzKicgKyBlc2NhcGVSZWdFeHAoJ30nICsgdGFnc1sxXSkpO1xuICAgIH1cblxuICAgIGNvbXBpbGVUYWdzKHRhZ3MgfHwgbXVzdGFjaGUudGFncyk7XG5cbiAgICB2YXIgc2Nhbm5lciA9IG5ldyBTY2FubmVyKHRlbXBsYXRlKTtcblxuICAgIHZhciBzdGFydCwgdHlwZSwgdmFsdWUsIGNociwgdG9rZW4sIG9wZW5TZWN0aW9uO1xuICAgIHdoaWxlICghc2Nhbm5lci5lb3MoKSkge1xuICAgICAgc3RhcnQgPSBzY2FubmVyLnBvcztcblxuICAgICAgLy8gTWF0Y2ggYW55IHRleHQgYmV0d2VlbiB0YWdzLlxuICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChvcGVuaW5nVGFnUmUpO1xuXG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBpIDwgdmFsdWVMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGNociA9IHZhbHVlLmNoYXJBdChpKTtcblxuICAgICAgICAgIGlmIChpc1doaXRlc3BhY2UoY2hyKSkge1xuICAgICAgICAgICAgc3BhY2VzLnB1c2godG9rZW5zLmxlbmd0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0b2tlbnMucHVzaChbICd0ZXh0JywgY2hyLCBzdGFydCwgc3RhcnQgKyAxIF0pO1xuICAgICAgICAgIHN0YXJ0ICs9IDE7XG5cbiAgICAgICAgICAvLyBDaGVjayBmb3Igd2hpdGVzcGFjZSBvbiB0aGUgY3VycmVudCBsaW5lLlxuICAgICAgICAgIGlmIChjaHIgPT09ICdcXG4nKVxuICAgICAgICAgICAgc3RyaXBTcGFjZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBvcGVuaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKG9wZW5pbmdUYWdSZSkpXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBoYXNUYWcgPSB0cnVlO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB0eXBlLlxuICAgICAgdHlwZSA9IHNjYW5uZXIuc2Nhbih0YWdSZSkgfHwgJ25hbWUnO1xuICAgICAgc2Nhbm5lci5zY2FuKHdoaXRlUmUpO1xuXG4gICAgICAvLyBHZXQgdGhlIHRhZyB2YWx1ZS5cbiAgICAgIGlmICh0eXBlID09PSAnPScpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhbihlcXVhbHNSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICd7Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdDdXJseVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGN1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgICB0eXBlID0gJyYnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgY2xvc2luZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2NhbihjbG9zaW5nVGFnUmUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHRhZyBhdCAnICsgc2Nhbm5lci5wb3MpO1xuXG4gICAgICB0b2tlbiA9IFsgdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvcyBdO1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuXG4gICAgICBpZiAodHlwZSA9PT0gJyMnIHx8IHR5cGUgPT09ICdeJykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJy8nKSB7XG4gICAgICAgIC8vIENoZWNrIHNlY3Rpb24gbmVzdGluZy5cbiAgICAgICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcblxuICAgICAgICBpZiAoIW9wZW5TZWN0aW9uKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5vcGVuZWQgc2VjdGlvbiBcIicgKyB2YWx1ZSArICdcIiBhdCAnICsgc3RhcnQpO1xuXG4gICAgICAgIGlmIChvcGVuU2VjdGlvblsxXSAhPT0gdmFsdWUpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzdGFydCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICduYW1lJyB8fCB0eXBlID09PSAneycgfHwgdHlwZSA9PT0gJyYnKSB7XG4gICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJz0nKSB7XG4gICAgICAgIC8vIFNldCB0aGUgdGFncyBmb3IgdGhlIG5leHQgdGltZSBhcm91bmQuXG4gICAgICAgIGNvbXBpbGVUYWdzKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICBpZiAob3BlblNlY3Rpb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lcyB0aGUgdmFsdWVzIG9mIGNvbnNlY3V0aXZlIHRleHQgdG9rZW5zIGluIHRoZSBnaXZlbiBgdG9rZW5zYCBhcnJheVxuICAgKiB0byBhIHNpbmdsZSB0b2tlbi5cbiAgICovXG4gIGZ1bmN0aW9uIHNxdWFzaFRva2Vucyh0b2tlbnMpIHtcbiAgICB2YXIgc3F1YXNoZWRUb2tlbnMgPSBbXTtcblxuICAgIHZhciB0b2tlbiwgbGFzdFRva2VuO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuWzBdID09PSAndGV4dCcgJiYgbGFzdFRva2VuICYmIGxhc3RUb2tlblswXSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuWzFdICs9IHRva2VuWzFdO1xuICAgICAgICAgIGxhc3RUb2tlblszXSA9IHRva2VuWzNdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNxdWFzaGVkVG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgIGxhc3RUb2tlbiA9IHRva2VuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNxdWFzaGVkVG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm1zIHRoZSBnaXZlbiBhcnJheSBvZiBgdG9rZW5zYCBpbnRvIGEgbmVzdGVkIHRyZWUgc3RydWN0dXJlIHdoZXJlXG4gICAqIHRva2VucyB0aGF0IHJlcHJlc2VudCBhIHNlY3Rpb24gaGF2ZSB0d28gYWRkaXRpb25hbCBpdGVtczogMSkgYW4gYXJyYXkgb2ZcbiAgICogYWxsIHRva2VucyB0aGF0IGFwcGVhciBpbiB0aGF0IHNlY3Rpb24gYW5kIDIpIHRoZSBpbmRleCBpbiB0aGUgb3JpZ2luYWxcbiAgICogdGVtcGxhdGUgdGhhdCByZXByZXNlbnRzIHRoZSBlbmQgb2YgdGhhdCBzZWN0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gbmVzdFRva2Vucyh0b2tlbnMpIHtcbiAgICB2YXIgbmVzdGVkVG9rZW5zID0gW107XG4gICAgdmFyIGNvbGxlY3RvciA9IG5lc3RlZFRva2VucztcbiAgICB2YXIgc2VjdGlvbnMgPSBbXTtcblxuICAgIHZhciB0b2tlbiwgc2VjdGlvbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgc3dpdGNoICh0b2tlblswXSkge1xuICAgICAgY2FzZSAnIyc6XG4gICAgICBjYXNlICdeJzpcbiAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29sbGVjdG9yID0gdG9rZW5bNF0gPSBbXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICcvJzpcbiAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuICAgICAgICBzZWN0aW9uWzVdID0gdG9rZW5bMl07XG4gICAgICAgIGNvbGxlY3RvciA9IHNlY3Rpb25zLmxlbmd0aCA+IDAgPyBzZWN0aW9uc1tzZWN0aW9ucy5sZW5ndGggLSAxXVs0XSA6IG5lc3RlZFRva2VucztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG5lc3RlZFRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHNpbXBsZSBzdHJpbmcgc2Nhbm5lciB0aGF0IGlzIHVzZWQgYnkgdGhlIHRlbXBsYXRlIHBhcnNlciB0byBmaW5kXG4gICAqIHRva2VucyBpbiB0ZW1wbGF0ZSBzdHJpbmdzLlxuICAgKi9cbiAgZnVuY3Rpb24gU2Nhbm5lcihzdHJpbmcpIHtcbiAgICB0aGlzLnN0cmluZyA9IHN0cmluZztcbiAgICB0aGlzLnRhaWwgPSBzdHJpbmc7XG4gICAgdGhpcy5wb3MgPSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSB0YWlsIGlzIGVtcHR5IChlbmQgb2Ygc3RyaW5nKS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLmVvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy50YWlsID09PSBcIlwiO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUcmllcyB0byBtYXRjaCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGF0IHRoZSBjdXJyZW50IHBvc2l0aW9uLlxuICAgKiBSZXR1cm5zIHRoZSBtYXRjaGVkIHRleHQgaWYgaXQgY2FuIG1hdGNoLCB0aGUgZW1wdHkgc3RyaW5nIG90aGVyd2lzZS5cbiAgICovXG4gIFNjYW5uZXIucHJvdG90eXBlLnNjYW4gPSBmdW5jdGlvbiAocmUpIHtcbiAgICB2YXIgbWF0Y2ggPSB0aGlzLnRhaWwubWF0Y2gocmUpO1xuXG4gICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCAhPT0gMClcbiAgICAgIHJldHVybiAnJztcblxuICAgIHZhciBzdHJpbmcgPSBtYXRjaFswXTtcblxuICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCk7XG4gICAgdGhpcy5wb3MgKz0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNraXBzIGFsbCB0ZXh0IHVudGlsIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGJlIG1hdGNoZWQuIFJldHVybnNcbiAgICogdGhlIHNraXBwZWQgc3RyaW5nLCB3aGljaCBpcyB0aGUgZW50aXJlIHRhaWwgaWYgbm8gbWF0Y2ggY2FuIGJlIG1hZGUuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuVW50aWwgPSBmdW5jdGlvbiAocmUpIHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLnRhaWwuc2VhcmNoKHJlKSwgbWF0Y2g7XG5cbiAgICBzd2l0Y2ggKGluZGV4KSB7XG4gICAgY2FzZSAtMTpcbiAgICAgIG1hdGNoID0gdGhpcy50YWlsO1xuICAgICAgdGhpcy50YWlsID0gXCJcIjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgMDpcbiAgICAgIG1hdGNoID0gXCJcIjtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBtYXRjaCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgdGhpcy50YWlsID0gdGhpcy50YWlsLnN1YnN0cmluZyhpbmRleCk7XG4gICAgfVxuXG4gICAgdGhpcy5wb3MgKz0gbWF0Y2gubGVuZ3RoO1xuXG4gICAgcmV0dXJuIG1hdGNoO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgcmVuZGVyaW5nIGNvbnRleHQgYnkgd3JhcHBpbmcgYSB2aWV3IG9iamVjdCBhbmRcbiAgICogbWFpbnRhaW5pbmcgYSByZWZlcmVuY2UgdG8gdGhlIHBhcmVudCBjb250ZXh0LlxuICAgKi9cbiAgZnVuY3Rpb24gQ29udGV4dCh2aWV3LCBwYXJlbnRDb250ZXh0KSB7XG4gICAgdGhpcy52aWV3ID0gdmlldyA9PSBudWxsID8ge30gOiB2aWV3O1xuICAgIHRoaXMuY2FjaGUgPSB7ICcuJzogdGhpcy52aWV3IH07XG4gICAgdGhpcy5wYXJlbnQgPSBwYXJlbnRDb250ZXh0O1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgY29udGV4dCB1c2luZyB0aGUgZ2l2ZW4gdmlldyB3aXRoIHRoaXMgY29udGV4dFxuICAgKiBhcyB0aGUgcGFyZW50LlxuICAgKi9cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICh2aWV3KSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGlzIGNvbnRleHQsIHRyYXZlcnNpbmdcbiAgICogdXAgdGhlIGNvbnRleHQgaGllcmFyY2h5IGlmIHRoZSB2YWx1ZSBpcyBhYnNlbnQgaW4gdGhpcyBjb250ZXh0J3Mgdmlldy5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZTtcblxuICAgIHZhciB2YWx1ZTtcbiAgICBpZiAobmFtZSBpbiBjYWNoZSkge1xuICAgICAgdmFsdWUgPSBjYWNoZVtuYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbnRleHQgPSB0aGlzLCBuYW1lcywgaW5kZXg7XG5cbiAgICAgIHdoaWxlIChjb250ZXh0KSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJy4nKSA+IDApIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlldztcbiAgICAgICAgICBuYW1lcyA9IG5hbWUuc3BsaXQoJy4nKTtcbiAgICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgICAgICB3aGlsZSAodmFsdWUgIT0gbnVsbCAmJiBpbmRleCA8IG5hbWVzLmxlbmd0aClcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWVbbmFtZXNbaW5kZXgrK11dO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb250ZXh0LnZpZXcgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgICB2YWx1ZSA9IGNvbnRleHQudmlld1tuYW1lXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNvbnRleHQgPSBjb250ZXh0LnBhcmVudDtcbiAgICAgIH1cblxuICAgICAgY2FjaGVbbmFtZV0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpXG4gICAgICB2YWx1ZSA9IHZhbHVlLmNhbGwodGhpcy52aWV3KTtcblxuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQSBXcml0ZXIga25vd3MgaG93IHRvIHRha2UgYSBzdHJlYW0gb2YgdG9rZW5zIGFuZCByZW5kZXIgdGhlbSB0byBhXG4gICAqIHN0cmluZywgZ2l2ZW4gYSBjb250ZXh0LiBJdCBhbHNvIG1haW50YWlucyBhIGNhY2hlIG9mIHRlbXBsYXRlcyB0b1xuICAgKiBhdm9pZCB0aGUgbmVlZCB0byBwYXJzZSB0aGUgc2FtZSB0ZW1wbGF0ZSB0d2ljZS5cbiAgICovXG4gIGZ1bmN0aW9uIFdyaXRlcigpIHtcbiAgICB0aGlzLmNhY2hlID0ge307XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoaXMgd3JpdGVyLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuY2FjaGUgPSB7fTtcbiAgfTtcblxuICAvKipcbiAgICogUGFyc2VzIGFuZCBjYWNoZXMgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgYW5kIHJldHVybnMgdGhlIGFycmF5IG9mIHRva2Vuc1xuICAgKiB0aGF0IGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBwYXJzZS5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlO1xuICAgIHZhciB0b2tlbnMgPSBjYWNoZVt0ZW1wbGF0ZV07XG5cbiAgICBpZiAodG9rZW5zID09IG51bGwpXG4gICAgICB0b2tlbnMgPSBjYWNoZVt0ZW1wbGF0ZV0gPSBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCB0YWdzKTtcblxuICAgIHJldHVybiB0b2tlbnM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEhpZ2gtbGV2ZWwgbWV0aG9kIHRoYXQgaXMgdXNlZCB0byByZW5kZXIgdGhlIGdpdmVuIGB0ZW1wbGF0ZWAgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gYHZpZXdgLlxuICAgKlxuICAgKiBUaGUgb3B0aW9uYWwgYHBhcnRpYWxzYCBhcmd1bWVudCBtYXkgYmUgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlXG4gICAqIG5hbWVzIGFuZCB0ZW1wbGF0ZXMgb2YgcGFydGlhbHMgdGhhdCBhcmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUuIEl0IG1heVxuICAgKiBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIGxvYWQgcGFydGlhbCB0ZW1wbGF0ZXMgb24gdGhlIGZseVxuICAgKiB0aGF0IHRha2VzIGEgc2luZ2xlIGFyZ3VtZW50OiB0aGUgbmFtZSBvZiB0aGUgcGFydGlhbC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscykge1xuICAgIHZhciB0b2tlbnMgPSB0aGlzLnBhcnNlKHRlbXBsYXRlKTtcbiAgICB2YXIgY29udGV4dCA9ICh2aWV3IGluc3RhbmNlb2YgQ29udGV4dCkgPyB2aWV3IDogbmV3IENvbnRleHQodmlldyk7XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyVG9rZW5zKHRva2VucywgY29udGV4dCwgcGFydGlhbHMsIHRlbXBsYXRlKTtcbiAgfTtcblxuICAvKipcbiAgICogTG93LWxldmVsIG1ldGhvZCB0aGF0IHJlbmRlcnMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIHVzaW5nXG4gICAqIHRoZSBnaXZlbiBgY29udGV4dGAgYW5kIGBwYXJ0aWFsc2AuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBgb3JpZ2luYWxUZW1wbGF0ZWAgaXMgb25seSBldmVyIHVzZWQgdG8gZXh0cmFjdCB0aGUgcG9ydGlvblxuICAgKiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB3YXMgY29udGFpbmVkIGluIGEgaGlnaGVyLW9yZGVyIHNlY3Rpb24uXG4gICAqIElmIHRoZSB0ZW1wbGF0ZSBkb2Vzbid0IHVzZSBoaWdoZXItb3JkZXIgc2VjdGlvbnMsIHRoaXMgYXJndW1lbnQgbWF5XG4gICAqIGJlIG9taXR0ZWQuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclRva2VucyA9IGZ1bmN0aW9uICh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuXG4gICAgdmFyIHRva2VuLCBzeW1ib2wsIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICBzeW1ib2wgPSB0b2tlblswXTtcblxuICAgICAgaWYgKHN5bWJvbCA9PT0gJyMnKSB2YWx1ZSA9IHRoaXMuX3JlbmRlclNlY3Rpb24odG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ14nKSB2YWx1ZSA9IHRoaXMuX3JlbmRlckludmVydGVkKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICc+JykgdmFsdWUgPSB0aGlzLl9yZW5kZXJQYXJ0aWFsKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICcmJykgdmFsdWUgPSB0aGlzLl91bmVzY2FwZWRWYWx1ZSh0b2tlbiwgY29udGV4dCk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICduYW1lJykgdmFsdWUgPSB0aGlzLl9lc2NhcGVkVmFsdWUodG9rZW4sIGNvbnRleHQpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAndGV4dCcpIHZhbHVlID0gdGhpcy5fcmF3VmFsdWUodG9rZW4pO1xuXG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBidWZmZXI7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fcmVuZGVyU2VjdGlvbiA9IGZ1bmN0aW9uICh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byByZW5kZXIgYW4gYXJiaXRyYXJ5IHRlbXBsYXRlXG4gICAgLy8gaW4gdGhlIGN1cnJlbnQgY29udGV4dCBieSBoaWdoZXItb3JkZXIgc2VjdGlvbnMuXG4gICAgZnVuY3Rpb24gc3ViUmVuZGVyKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gc2VsZi5yZW5kZXIodGVtcGxhdGUsIGNvbnRleHQsIHBhcnRpYWxzKTtcbiAgICB9XG5cbiAgICBpZiAoIXZhbHVlKSByZXR1cm47XG5cbiAgICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGZvciAodmFyIGogPSAwLCB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaiA8IHZhbHVlTGVuZ3RoOyArK2opIHtcbiAgICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LnB1c2godmFsdWVbal0pLCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dC5wdXNoKHZhbHVlKSwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgIH0gZWxzZSBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxUZW1wbGF0ZSAhPT0gJ3N0cmluZycpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHVzZSBoaWdoZXItb3JkZXIgc2VjdGlvbnMgd2l0aG91dCB0aGUgb3JpZ2luYWwgdGVtcGxhdGUnKTtcblxuICAgICAgLy8gRXh0cmFjdCB0aGUgcG9ydGlvbiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB0aGUgc2VjdGlvbiBjb250YWlucy5cbiAgICAgIHZhbHVlID0gdmFsdWUuY2FsbChjb250ZXh0LnZpZXcsIG9yaWdpbmFsVGVtcGxhdGUuc2xpY2UodG9rZW5bM10sIHRva2VuWzVdKSwgc3ViUmVuZGVyKTtcblxuICAgICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICAgIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgYnVmZmVyICs9IHRoaXMucmVuZGVyVG9rZW5zKHRva2VuWzRdLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgfVxuICAgIHJldHVybiBidWZmZXI7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fcmVuZGVySW52ZXJ0ZWQgPSBmdW5jdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG5cbiAgICAvLyBVc2UgSmF2YVNjcmlwdCdzIGRlZmluaXRpb24gb2YgZmFsc3kuIEluY2x1ZGUgZW1wdHkgYXJyYXlzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg2XG4gICAgaWYgKCF2YWx1ZSB8fCAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSlcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3JlbmRlclBhcnRpYWwgPSBmdW5jdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMpIHtcbiAgICBpZiAoIXBhcnRpYWxzKSByZXR1cm47XG5cbiAgICB2YXIgdmFsdWUgPSBpc0Z1bmN0aW9uKHBhcnRpYWxzKSA/IHBhcnRpYWxzKHRva2VuWzFdKSA6IHBhcnRpYWxzW3Rva2VuWzFdXTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0aGlzLnBhcnNlKHZhbHVlKSwgY29udGV4dCwgcGFydGlhbHMsIHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl91bmVzY2FwZWRWYWx1ZSA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0KSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX2VzY2FwZWRWYWx1ZSA9IGZ1bmN0aW9uKHRva2VuLCBjb250ZXh0KSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIG11c3RhY2hlLmVzY2FwZSh2YWx1ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fcmF3VmFsdWUgPSBmdW5jdGlvbih0b2tlbikge1xuICAgIHJldHVybiB0b2tlblsxXTtcbiAgfTtcblxuICBtdXN0YWNoZS5uYW1lID0gXCJtdXN0YWNoZS5qc1wiO1xuICBtdXN0YWNoZS52ZXJzaW9uID0gXCIxLjEuMFwiO1xuICBtdXN0YWNoZS50YWdzID0gWyBcInt7XCIsIFwifX1cIiBdO1xuXG4gIC8vIEFsbCBoaWdoLWxldmVsIG11c3RhY2hlLiogZnVuY3Rpb25zIHVzZSB0aGlzIHdyaXRlci5cbiAgdmFyIGRlZmF1bHRXcml0ZXIgPSBuZXcgV3JpdGVyKCk7XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgY2FjaGVkIHRlbXBsYXRlcyBpbiB0aGUgZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5jbGVhckNhY2hlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZWZhdWx0V3JpdGVyLmNsZWFyQ2FjaGUoKTtcbiAgfTtcblxuICAvKipcbiAgICogUGFyc2VzIGFuZCBjYWNoZXMgdGhlIGdpdmVuIHRlbXBsYXRlIGluIHRoZSBkZWZhdWx0IHdyaXRlciBhbmQgcmV0dXJucyB0aGVcbiAgICogYXJyYXkgb2YgdG9rZW5zIGl0IGNvbnRhaW5zLiBEb2luZyB0aGlzIGFoZWFkIG9mIHRpbWUgYXZvaWRzIHRoZSBuZWVkIHRvXG4gICAqIHBhcnNlIHRlbXBsYXRlcyBvbiB0aGUgZmx5IGFzIHRoZXkgYXJlIHJlbmRlcmVkLlxuICAgKi9cbiAgbXVzdGFjaGUucGFyc2UgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHRhZ3MpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5wYXJzZSh0ZW1wbGF0ZSwgdGFncyk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlbmRlcnMgdGhlIGB0ZW1wbGF0ZWAgd2l0aCB0aGUgZ2l2ZW4gYHZpZXdgIGFuZCBgcGFydGlhbHNgIHVzaW5nIHRoZVxuICAgKiBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLnJlbmRlciA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5yZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKTtcbiAgfTtcblxuICAvLyBUaGlzIGlzIGhlcmUgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5IHdpdGggMC40LnguXG4gIG11c3RhY2hlLnRvX2h0bWwgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzLCBzZW5kKSB7XG4gICAgdmFyIHJlc3VsdCA9IG11c3RhY2hlLnJlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpO1xuXG4gICAgaWYgKGlzRnVuY3Rpb24oc2VuZCkpIHtcbiAgICAgIHNlbmQocmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBlc2NhcGluZyBmdW5jdGlvbiBzbyB0aGF0IHRoZSB1c2VyIG1heSBvdmVycmlkZSBpdC5cbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8yNDRcbiAgbXVzdGFjaGUuZXNjYXBlID0gZXNjYXBlSHRtbDtcblxuICAvLyBFeHBvcnQgdGhlc2UgbWFpbmx5IGZvciB0ZXN0aW5nLCBidXQgYWxzbyBmb3IgYWR2YW5jZWQgdXNhZ2UuXG4gIG11c3RhY2hlLlNjYW5uZXIgPSBTY2FubmVyO1xuICBtdXN0YWNoZS5Db250ZXh0ID0gQ29udGV4dDtcbiAgbXVzdGFjaGUuV3JpdGVyID0gV3JpdGVyO1xuXG59KSk7XG4iLCIjIyNcbiMgQGNsYXNzIFN0YWNrbGEuQmFzZVxuIyMjXG5jbGFzcyBCYXNlXG5cbiAgY29uc3RydWN0b3I6IChvcHRpb25zID0ge30pIC0+XG4gICAgZGVidWcgPSBAZ2V0UGFyYW1zKCdkZWJ1ZycpXG4gICAgYXR0cnMgPSBhdHRycyBvciB7fVxuICAgIGlmIGRlYnVnXG4gICAgICBAZGVidWcgPSAoZGVidWcgaXMgJ3RydWUnIG9yIGRlYnVnIGlzICcxJylcbiAgICBlbHNlIGlmIGF0dHJzLmRlYnVnXG4gICAgICBAZGVidWcgPSAoYXR0cnMuZGVidWcgaXMgb24pXG4gICAgZWxzZVxuICAgICAgQGRlYnVnID0gZmFsc2VcbiAgICBAX2xpc3RlbmVycyA9IFtdXG5cbiAgdG9TdHJpbmc6IC0+ICdCYXNlJ1xuXG4gIGxvZzogKG1zZywgdHlwZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBkZWJ1Z1xuICAgIHR5cGUgPSB0eXBlIG9yICdpbmZvJ1xuICAgIGlmIHdpbmRvdy5jb25zb2xlIGFuZCB3aW5kb3cuY29uc29sZVt0eXBlXVxuICAgICAgd2luZG93LmNvbnNvbGVbdHlwZV0gXCJbI3tAdG9TdHJpbmcoKX1dICN7bXNnfVwiXG4gICAgcmV0dXJuXG5cbiAgb246ICh0eXBlLCBjYWxsYmFjaykgLT5cbiAgICBpZiAhdHlwZSBvciAhY2FsbGJhY2tcbiAgICAgIHRocm93IG5ldyBFcnJvcignQm90aCBldmVudCB0eXBlIGFuZCBjYWxsYmFjayBhcmUgcmVxdWlyZWQgcGFyYW1ldGVycycpXG4gICAgQGxvZyAnb24oKSAtIGV2ZW50IFxcJycgKyB0eXBlICsgJ1xcJyBpcyBzdWJzY3JpYmVkJ1xuICAgIEBfbGlzdGVuZXJzW3R5cGVdID0gW10gdW5sZXNzIEBfbGlzdGVuZXJzW3R5cGVdXG4gICAgY2FsbGJhY2suaW5zdGFuY2UgPSBAXG4gICAgQF9saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjaylcbiAgICBjYWxsYmFja1xuXG4gIGVtaXQ6ICh0eXBlLCBkYXRhID0gW10pIC0+XG4gICAgQGxvZyBcImVtaXQoKSAtIGV2ZW50ICcje3R5cGV9JyBpcyB0cmlnZ2VyZWRcIlxuICAgIGRhdGEudW5zaGlmdFxuICAgICAgdHlwZTogdHlwZVxuICAgICAgdGFyZ2V0OiBAXG4gICAgdGhyb3cgbmV3IEVycm9yKCdMYWNrcyBvZiB0eXBlIHBhcmFtZXRlcicpIHVubGVzcyB0eXBlXG4gICAgaWYgQF9saXN0ZW5lcnNbdHlwZV0gYW5kIEBfbGlzdGVuZXJzW3R5cGVdLmxlbmd0aFxuICAgICAgZm9yIGkgb2YgQF9saXN0ZW5lcnNbdHlwZV1cbiAgICAgICAgQF9saXN0ZW5lcnNbdHlwZV1baV0uYXBwbHkgQCwgZGF0YVxuICAgIEBcblxuICBnZXRQYXJhbXM6IChrZXkpIC0+XG4gICAgaHJlZiA9IEBnZXRVcmwoKVxuICAgIHBhcmFtcyA9IHt9XG4gICAgcG9zID0gaHJlZi5pbmRleE9mKCc/JylcbiAgICBAbG9nICdnZXRQYXJhbXMoKSBpcyBleGVjdXRlZCdcbiAgICBpZiBocmVmLmluZGV4T2YoJyMnKSAhPSAtMVxuICAgICAgaGFzaGVzID0gaHJlZi5zbGljZShwb3MgKyAxLCBocmVmLmluZGV4T2YoJyMnKSkuc3BsaXQoJyYnKVxuICAgIGVsc2VcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSkuc3BsaXQoJyYnKVxuICAgIGZvciBpIG9mIGhhc2hlc1xuICAgICAgaGFzaCA9IGhhc2hlc1tpXS5zcGxpdCgnPScpXG4gICAgICBwYXJhbXNbaGFzaFswXV0gPSBoYXNoWzFdXG4gICAgaWYga2V5IHRoZW4gcGFyYW1zW2tleV0gZWxzZSBwYXJhbXNcblxuICBnZXRVcmw6IC0+IHdpbmRvdy5sb2NhdGlvbi5ocmVmXG5cbiMgUHJvbW90ZSB0byBnbG9iYWxcbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG53aW5kb3cuU3RhY2tsYS5CYXNlID0gQmFzZVxuXG5tb2R1bGUuZXhwb3J0cyA9IEJhc2VcblxuIiwiQmFzZSA9IHJlcXVpcmUoJy4vYmFzZS5jb2ZmZWUnKVxuXG5jbGFzcyBJbWFnZVNpemUgZXh0ZW5kcyBCYXNlXG5cbiAgY29uc3RydWN0b3I6IChlbCwgY2FsbGJhY2spIC0+XG4gICAgc3VwZXIoKVxuICAgIEBpbml0KGVsKVxuICAgIEBiaW5kKClcbiAgICBAcmVuZGVyKGNhbGxiYWNrKVxuICAgIHJldHVybiBAXG5cbiAgdG9TdHJpbmc6ICgpIC0+ICdJbWFnZVNpemUnXG5cbiAgaW5pdDogKGVsKSAtPlxuICAgIEBlbCA9ICQoZWwpWzBdXG4gICAgQGNvbXBsZXRlID0gQGVsLmNvbXBsZXRlXG4gICAgQGRhdGEgPSB7fVxuICAgIEBfdGltZXIgPSBudWxsXG4gICAgQGRhdGEud2lkdGggPSBAZWwud2lkdGhcbiAgICBAZGF0YS5oZWlnaHQgPSBAZWwuaGVpZ2h0XG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBLZWVwIGFuIGV5ZSBvbiByZXNpemUgZXZlbnRcbiAgICAkKHdpbmRvdykucmVzaXplIChlKSA9PlxuICAgICAgaXNFcXVhbCA9IEBlbC53aWR0aCBpcyBAZGF0YS53aWR0aCBhbmQgQGVsLmhlaWdodCBpcyBAZGF0YS5oZWlnaHRcbiAgICAgIHJldHVybiBpZiBpc0VxdWFsXG4gICAgICAkLmV4dGVuZCBAZGF0YSwge1xuICAgICAgICB3aWR0aDogQGVsLndpZHRoXG4gICAgICAgIGhlaWdodDogQGVsLmhlaWdodFxuICAgICAgICB3aWR0aFJhdGlvOiBAZWwud2lkdGggLyBAZGF0YS5uYXR1cmFsV2lkdGhcbiAgICAgICAgaGVpZ2h0UmF0aW86IEBlbC5oZWlnaHQgLyBAZGF0YS5uYXR1cmFsSGVpZ2h0XG4gICAgICB9XG4gICAgICBAbG9nICdoYW5kbGVSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICAgIEAuZW1pdCgnY2hhbmdlJywgW0BkYXRhXSlcblxuICByZW5kZXI6IChjYWxsYmFjaykgLT5cbiAgICBAbG9nICdyZW5kZXIoKSBpcyBleGVjdXRlZCdcbiAgICAjIEltYWdlIExvYWRlZFxuICAgIGlmIEBjb21wbGV0ZVxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5zcmMgPSBAZWwuc3JjXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIGxvYWRlZFwiXG4gICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgIEBkYXRhLm5hdHVyYWxIZWlnaHQgPSBpbWcuaGVpZ2h0XG4gICAgICBjYWxsYmFjayh0cnVlLCBAZGF0YSlcbiAgICAjIEltYWdlIExvYWRpbmdcbiAgICBlbHNlXG4gICAgICBAbG9nIFwiSW1hZ2UgJyN7QGVsLnNyY30nIGlzIE5PVCByZWFkeVwiXG4gICAgICBpbWcgPSBuZXcgSW1hZ2UoKVxuICAgICAgaW1nLnNyYyA9IEBlbC5zcmNcbiAgICAgIGltZy5vbmxvYWQgPSAoZSkgPT5cbiAgICAgICAgQGxvZyBcIkltYWdlICcje2ltZy5zcmN9JyBpcyBsb2FkZWRcIlxuICAgICAgICBAZGF0YS5uYXR1cmFsV2lkdGggPSBpbWcud2lkdGhcbiAgICAgICAgQGRhdGEubmF0dXJhbEhlaWdodCA9IGltZy5oZWlnaHRcbiAgICAgICAgY2FsbGJhY2sodHJ1ZSwgQGRhdGEpXG4gICAgICBpbWcub25lcnJvciA9IChlKSA9PlxuICAgICAgICBAbG9nIFwiSW1hZ2UgJyN7aW1nLnNyY30nIGlzIGZhaWxlZCB0byBsb2FkXCJcbiAgICAgICAgY2FsbGJhY2soZmFsc2UsIEBkYXRhKVxuXG5cbndpbmRvdy5TdGFja2xhID0ge30gdW5sZXNzIHdpbmRvdy5TdGFja2xhXG5TdGFja2xhLmdldEltYWdlU2l6ZSA9IChlbCwgY2FsbGJhY2spIC0+XG4gIG5ldyBJbWFnZVNpemUoZWwsIGNhbGxiYWNrKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldDogKGVsLCBjYWxsYmFjaykgLT5cbiAgICBuZXcgSW1hZ2VTaXplKGVsLCBjYWxsYmFjaylcblxuIiwiTXVzdGFjaGUgPSByZXF1aXJlKCdtdXN0YWNoZScpXG5CYXNlID0gcmVxdWlyZSgnLi9iYXNlLmNvZmZlZScpXG5JbWFnZVNpemUgPSByZXF1aXJlKCcuL2ltYWdlLmNvZmZlZScpXG5BbGlnbk1lID0gcmVxdWlyZSgnYWxpZ25tZScpXG5cbkFUVFJTID1cbiAgTkFNRTogJ1RhZ2xhJ1xuICBQUkVGSVg6ICd0YWdsYS0nXG4gIERSQUdfQVRUUjpcbiAgICBjb250YWlubWVudDogJy50YWdsYSdcbiAgICBoYW5kbGU6ICcudGFnbGEtaWNvbidcbiAgU0VMRUNUX0FUVFI6XG4gICAgYWxsb3dfc2luZ2xlX2Rlc2VsZWN0OiBvblxuICAgIHBsYWNlaG9sZGVyX3RleHRfc2luZ2xlOiAnU2VsZWN0IGFuIG9wdGlvbidcbiAgICB3aWR0aDogJzMxMHB4J1xuICBGT1JNX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS1mb3JtLXdyYXBwZXJcIj4nXG4gICAgJyAgICA8Zm9ybSBjbGFzcz1cInRhZ2xhLWZvcm1cIj4nXG4gICAgJyAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWZvcm0tdGl0bGVcIj4nXG4gICAgJyAgICAgICAgICAgIFNlbGVjdCBZb3VyIFByb2R1Y3QnXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCIgY2xhc3M9XCJ0YWdsYS1mb3JtLWNsb3NlXCI+w5c8L2E+J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ4XCI+J1xuICAgICcgICAgICAgIDxpbnB1dCB0eXBlPVwiaGlkZGVuXCIgbmFtZT1cInlcIj4nXG4gICAgJyAgICAgICAgPHNlbGVjdCBkYXRhLXBsYWNlaG9sZGVyPVwiU2VhcmNoXCIgdHlwZT1cInRleHRcIiBuYW1lPVwidGFnXCIgY2xhc3M9XCJ0YWdsYS1zZWxlY3QgY2hvc2VuLXNlbGVjdFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoXCI+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uPjwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjFcIj5Db2NraWU8L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIyXCI+S2l3aTwvb3B0aW9uPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIjNcIj5CdWRkeTwvb3B0aW9uPidcbiAgICAnICAgICAgICA8L3NlbGVjdD4nXG4gICAgJyAgICA8L2Zvcm0+J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbiAgVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJyAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nXCI+J1xuICAgICcgICAge3sjcHJvZHVjdH19J1xuICAgICcgICAgICAgIHt7I2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctaW1hZ2VcIj4nXG4gICAgJyAgICAgICAgICA8aW1nIHNyYz1cInt7aW1hZ2Vfc21hbGxfdXJsfX1cIj4nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgIHt7L2ltYWdlX3NtYWxsX3VybH19J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGV4dFwiPidcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZWRpdFwiPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWVkaXQtbGlua1wiPidcbiAgICAnICAgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLXBlbmNpbFwiPjwvaT4gRWRpdCdcbiAgICAnICAgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgICAgPGEgaHJlZj1cImphdmFzY3JpcHQ6dm9pZCgwKVwiIGNsYXNzPVwidGFnbGEtdGFnLWxpbmsgdGFnbGEtdGFnLWRlbGV0ZS1saW5rXCI+J1xuICAgICcgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZnMgZnMtY3Jvc3MzXCI+PC9pPiBEZWxldGUnXG4gICAgJyAgICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAgICA8aDIgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctdGl0bGVcIj57e3RhZ319PC9oMj4nXG4gICAgJyAgICAgICAgICB7eyNwcmljZX19J1xuICAgICcgICAgICAgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1wcmljZVwiPnt7cHJpY2V9fTwvZGl2PidcbiAgICAnICAgICAgICAgIHt7L3ByaWNlfX0nXG4gICAgJyAgICAgICAgICB7eyNkZXNjcmlwdGlvbn19J1xuICAgICcgICAgICAgICAgPHAgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctZGVzY3JpcHRpb25cIj57e2Rlc2NyaXB0aW9ufX08L3A+J1xuICAgICcgICAgICAgICAge3svZGVzY3JpcHRpb259fSdcbiAgICAnICAgICAgICAgIHt7I2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICAgIDxhIGhyZWY9XCJ7e2N1c3RvbV91cmx9fVwiIGNsYXNzPVwidGFnbGEtZGlhbG9nLWJ1dHRvbiBzdC1idG4gc3QtYnRuLXN1Y2Nlc3Mgc3QtYnRuLXNvbGlkXCIgdGFyZ2V0PVwiXCJ7e3RhcmdldH19XCI+J1xuICAgICcgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLWNhcnRcIj48L2k+J1xuICAgICcgICAgICAgICAgICBCdXkgTm93J1xuICAgICcgICAgICAgICAgPC9hPidcbiAgICAnICAgICAgICAgIHt7L2N1c3RvbV91cmx9fSdcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICB7ey9wcm9kdWN0fX0nXG4gICAgJyAgICA8L2Rpdj4nXG4gICAgJyAgICB7e3tmb3JtX2h0bWx9fX0nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuICBORVdfVEFHX1RFTVBMQVRFOiBbXG4gICAgJzxkaXYgY2xhc3M9XCJ0YWdsYS10YWdcIj4nXG4gICAgJyAgICA8aSBjbGFzcz1cInRhZ2xhLWljb24gZnMgZnMtdGFnMlwiPjwvaT4nXG4gICAgJzwvZGl2PidcbiAgXS5qb2luKCdcXG4nKVxuXG5jbGFzcyBUYWdsYSBleHRlbmRzIEJhc2VcbiAgY29uc3RydWN0b3I6ICgkd3JhcHBlciwgb3B0aW9ucyA9IHt9KSAtPlxuICAgIHN1cGVyKClcbiAgICBAd3JhcHBlciA9ICQoJHdyYXBwZXIpXG4gICAgQGluaXQob3B0aW9ucylcbiAgICBAYmluZCgpXG5cbiQuZXh0ZW5kKFRhZ2xhLCBBVFRSUylcblxucHJvdG8gPVxuICAjIyMjIyMjIyMjIyMjI1xuICAjIFV0aWxpdGllc1xuICAjIyMjIyMjIyMjIyMjI1xuICB0b1N0cmluZzogLT4gJ1RhZ2xhJ1xuXG4gICMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIFByaXZhdGUgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBJbml0aWFsaXplIGRyYWcgYW5kIHNlbGVjdCBsaWJzIGZvciBhIHNpbmdsZSB0YWdcbiAgX2FwcGx5VG9vbHM6ICgkdGFnKSAtPlxuICAgIEBsb2cgJ19hcHBseVRvb2xzKCkgaXMgZXhlY3V0ZWQnXG4gICAgZHJhZyA9IG5ldyBEcmFnZ2FiaWxseSgkdGFnWzBdLCBUYWdsYS5EUkFHX0FUVFIpXG4gICAgZHJhZy5vbiAnZHJhZ0VuZCcsICQucHJveHkoQGhhbmRsZVRhZ01vdmUsIEApXG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScsIGRyYWcpXG4gICAgIyBVcGRhdGUgZm9ybVxuICAgIHRhZyA9ICR0YWcuZGF0YSgndGFnLWRhdGEnKVxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eF0nKS52YWwodGFnLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwodGFnLnkpXG4gICAgJGZvcm0uZmluZChcIltuYW1lPXRhZ10gb3B0aW9uW3ZhbHVlPSN7dGFnLnZhbHVlfV1cIikuYXR0cignc2VsZWN0ZWQnLCAnc2VsZWN0ZWQnKVxuICAgICRzZWxlY3QgPSAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKVxuICAgICRzZWxlY3QuY2hvc2VuMihUYWdsYS5TRUxFQ1RfQVRUUilcbiAgICAkc2VsZWN0Lm9uICdjaGFuZ2UnLCAkLnByb3h5KEBoYW5kbGVUYWdDaGFuZ2UsIEApXG4gICAgJHNlbGVjdC5vbiAnY2hvc2VuOmhpZGluZ19kcm9wZG93bicsIChlLCBwYXJhbXMpIC0+XG4gICAgICAkc2VsZWN0LnRyaWdnZXIoJ2Nob3NlbjpvcGVuJylcblxuICBfZGlzYWJsZURyYWc6ICgkZXhjZXB0KSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yIGlzIG9mZlxuICAgIEBsb2cgJ19kaXNhYmxlRHJhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICRleGNlcHQgPSAkKCRleGNlcHQpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIEBcbiAgICAgICQoQCkuZGF0YSgnZHJhZ2dhYmlsbHknKS5kaXNhYmxlKCk7XG5cbiAgX2VuYWJsZURyYWc6ICgkZXhjZXB0KSAtPlxuICAgIHJldHVybiBpZiBAZWRpdG9yIGlzIG9mZlxuICAgIEBsb2cgJ19lbmFibGVEcmFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgcmV0dXJuIGlmICRleGNlcHRbMF0gaXMgQFxuICAgICAgJChAKS5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpO1xuXG4gIF9yZW1vdmVUb29sczogKCR0YWcpIC0+XG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmRlc3Ryb3koKVxuICAgICRzZWxlY3QgPSAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKVxuICAgICRzZWxlY3Quc2hvdygpLnJlbW92ZUNsYXNzICdjaHpuLWRvbmUnXG4gICAgJHNlbGVjdC5uZXh0KCkucmVtb3ZlKClcblxuICBfZ2V0UG9zaXRpb246ICgkdGFnKSAtPlxuICAgIEBsb2cgJ19nZXRQb3NpdGlvbigpIGlzIGV4ZWN1dGVkJ1xuICAgIHBvcyA9ICR0YWcucG9zaXRpb24oKVxuICAgIHggPSAocG9zLmxlZnQgKyAoJHRhZy53aWR0aCgpIC8gMikpIC8gQGN1cnJlbnRXaWR0aCAqIEBuYXR1cmFsV2lkdGhcbiAgICB5ID0gKHBvcy50b3AgKyAoJHRhZy5oZWlnaHQoKSAvIDIpKSAvIEBjdXJyZW50SGVpZ2h0ICogQG5hdHVyYWxIZWlnaHRcbiAgICBpZiBAdW5pdCBpcyAncGVyY2VudCdcbiAgICAgIHggPSB4IC8gQG5hdHVyYWxXaWR0aCAqIDEwMFxuICAgICAgeSA9IHkgLyBAbmF0dXJhbEhlaWdodCAqIDEwMFxuICAgIFt4LCB5XVxuXG4gIF91cGRhdGVJbWFnZVNpemU6IChkYXRhKSAtPlxuICAgIEBsb2cgJ191cGRhdGVJbWFnZVNpemUoKSBpcyBleGVjdXRlZCdcbiAgICBAbmF0dXJhbFdpZHRoID0gZGF0YS5uYXR1cmFsV2lkdGhcbiAgICBAbmF0dXJhbEhlaWdodCA9IGRhdGEubmF0dXJhbEhlaWdodFxuICAgIEBjdXJyZW50V2lkdGggPSBkYXRhLndpZHRoXG4gICAgQGN1cnJlbnRIZWlnaHQgPSBkYXRhLmhlaWdodFxuICAgIEB3aWR0aFJhdGlvID0gZGF0YS53aWR0aFJhdGlvXG4gICAgQGhlaWdodFJhdGlvID0gZGF0YS5oZWlnaHRSYXRpb1xuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgRXZlbnQgSGFuZGxlcnNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgaGFuZGxlVGFnQ2xpY2s6IChlKSAtPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICByZXR1cm4gdW5sZXNzICQoZS50YXJnZXQpLmhhc0NsYXNzKCd0YWdsYS1pY29uJylcbiAgICBAbG9nICdoYW5kbGVUYWdDbGljaygpIGlzIGV4ZWN1dGVkJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcbiAgICBAc2hyaW5rKCR0YWcpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWFjdGl2ZScpXG4gICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpXG5cbiAgaGFuZGxlVGFnQ2hhbmdlOiAoZSwgcGFyYW1zKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ0NoYW5nZSgpIGlzIGV4ZWN1dGVkJ1xuICAgICRzZWxlY3QgPSAkKGUudGFyZ2V0KVxuICAgICR0YWcgPSAkc2VsZWN0LnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGlzTmV3ID0gJHRhZy5oYXNDbGFzcygndGFnbGEtdGFnLW5ldycpXG4gICAgJHRhZy5yZW1vdmVDbGFzcyAndGFnbGEtdGFnLWNob29zZSB0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1uZXcnXG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCAkdGFnLmRhdGEoJ3RhZy1kYXRhJykpXG4gICAgZGF0YS5sYWJlbCA9ICRzZWxlY3QuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykudGV4dCgpXG4gICAgZGF0YS52YWx1ZSA9ICRzZWxlY3QudmFsKCkgfHwgZGF0YS5sYWJlbFxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuICAgICMgQWxpZ25cbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWZvcm0nKS5hbGlnbigpXG4gICAgaWYgaXNOZXdcbiAgICAgIEBlbWl0KCdhZGQnLCBbZGF0YSwgc2VyaWFsaXplLCAkdGFnXSlcbiAgICBlbHNlXG4gICAgICBAZW1pdCgnY2hhbmdlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG5cbiAgaGFuZGxlVGFnRGVsZXRlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdEZWxldGUoKSBpcyBleGVjdXRlZCdcbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmUoKVxuICAgICAgQGVtaXQoJ2RlbGV0ZScsIFtkYXRhXSlcblxuICBoYW5kbGVUYWdFZGl0OiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdFZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldCkucGFyZW50cygnLnRhZ2xhLXRhZycpXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykudHJpZ2dlcignY2hvc2VuOm9wZW4nKVxuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIEBlbWl0KCdlZGl0JywgW2RhdGEsICR0YWddKVxuXG4gIGhhbmRsZVRhZ01vdmU6IChpbnN0YW5jZSwgZXZlbnQsIHBvaW50ZXIpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW92ZSgpIGlzIGV4ZWN1dGVkJ1xuXG4gICAgJHRhZyA9ICQoaW5zdGFuY2UuZWxlbWVudClcbiAgICBkYXRhID0gJHRhZy5kYXRhKCd0YWctZGF0YScpXG4gICAgcG9zID0gQF9nZXRQb3NpdGlvbigkdGFnKVxuICAgIGRhdGEueCA9IHBvc1swXVxuICAgIGRhdGEueSA9IHBvc1sxXVxuXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICAkZm9ybS5maW5kKCdbbmFtZT14XScpLnZhbChkYXRhLngpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eV0nKS52YWwoZGF0YS55KVxuICAgIHNlcmlhbGl6ZSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKS5zZXJpYWxpemUoKVxuXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcbiAgICBkYXRhID0gJC5leHRlbmQoe30sIGRhdGEpXG4gICAgaXNOZXcgPSBpZiBkYXRhLmlkIHRoZW4gbm8gZWxzZSB5ZXNcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJykuYWxpZ24oKVxuICAgIEBlbWl0KCdtb3ZlJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZywgaXNOZXddKVxuXG4gIGhhbmRsZVRhZ01vdXNlRW50ZXI6IChlKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdXNlRW50ZXInXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KVxuXG4gICAgIyBDbGVhciBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSAgJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWhvdmVyJylcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgIEBlbWl0KCdob3ZlcicsIFskdGFnXSlcblxuICBoYW5kbGVUYWdNb3VzZUxlYXZlOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUxlYXZlJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gJHRhZy5kYXRhKCd0aW1lcicpXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKSBpZiB0aW1lclxuICAgICR0YWcucmVtb3ZlRGF0YSgndGltZXInKVxuXG4gICAgIyBTYXZlIGRlbGF5ZWQgbGVhdmUgdGltZXJcbiAgICB0aW1lciA9IHNldFRpbWVvdXQgLT5cbiAgICAgICR0YWcucmVtb3ZlQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgLCAzMDBcbiAgICAkdGFnLmRhdGEoJ3RpbWVyJywgdGltZXIpXG5cbiAgaGFuZGxlV3JhcHBlckNsaWNrOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVXcmFwcGVyQ2xpY2soKSBpcyBleGVjdXRlZCdcbiAgICAjIEhhY2sgdG8gYXZvaWQgdHJpZ2dlcmluZyBjbGljayBldmVudFxuICAgIEBzaHJpbmsoKSBpZiAobmV3IERhdGUoKSAtIEBsYXN0RHJhZ1RpbWUgPiAxMClcblxuICBoYW5kbGVJbWFnZVJlc2l6ZTogKGUsIGRhdGEpIC0+XG4gICAgQGxvZyAnaGFuZGxlSW1hZ2VSZXNpemUoKSBpcyBleGVjdXRlZCdcbiAgICBwcmV2V2lkdGggPSBAY3VycmVudFdpZHRoXG4gICAgcHJldkhlaWdodCA9IEBjdXJyZW50SGVpZ2h0XG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgICR0YWcgPSAkKEApXG4gICAgICBwb3MgPSAkdGFnLnBvc2l0aW9uKClcbiAgICAgIHggPSAocG9zLmxlZnQgLyBwcmV2V2lkdGgpICogZGF0YS53aWR0aFxuICAgICAgeSA9IChwb3MudG9wIC8gcHJldkhlaWdodCkgKiBkYXRhLmhlaWdodFxuICAgICAgJHRhZy5jc3NcbiAgICAgICAgbGVmdDogXCIje3h9cHhcIlxuICAgICAgICB0b3A6IFwiI3t5fXB4XCJcbiAgICBAX3VwZGF0ZUltYWdlU2l6ZShkYXRhKVxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgUHVibGljIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgYWRkVGFnOiAodGFnID0ge30pIC0+XG4gICAgQGxvZyAnYWRkVGFnKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBSZW5kZXIgdGFnIGVsZW1lbnQgYnkgcHJvdmlkZWQgdGVtcGxhdGVcbiAgICB0YWcgPSAkLmV4dGVuZCh7fSwgdGFnKVxuICAgIHRhZy5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICAkdGFnID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCB0YWcpKVxuICAgIGlzTmV3ID0gKCF0YWcueCBhbmQgIXRhZy55KVxuXG4gICAgIyBSZW1vdmUgcHJldmlvdXMgYWRkZWQgbmV3IHRhZyBpZiBpdCBoYXNuJ3QgYmVpbmcgc2V0XG4gICAgaWYgaXNOZXdcbiAgICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAgIGlmICQoQCkuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISQoQCkuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICAgJChAKS5mYWRlT3V0ID0+XG4gICAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG5cbiAgICBAd3JhcHBlci5hcHBlbmQoJHRhZylcbiAgICBpZiBpc05ldyAjIERlZmF1bHQgcG9zaXRpb24gZm9yIG5ldyB0YWdcbiAgICAgICMgVE9ETyAtIE5lZWQgYSBzbWFydCB3YXkgdG8gYXZvaWQgY29sbGlzaW9uXG4gICAgICB0YWcueCA9IDUwXG4gICAgICB0YWcueSA9IDUwXG4gICAgICAkdGFnLmFkZENsYXNzICd0YWdsYS10YWctbmV3IHRhZ2xhLXRhZy1hY3RpdmUgdGFnbGEtdGFnLWNob29zZSdcbiAgICBpZiBAdW5pdCBpcyAncGVyY2VudCdcbiAgICAgIHggPSBAY3VycmVudFdpZHRoICogKHRhZy54IC8gMTAwKVxuICAgICAgeSA9IEBjdXJyZW50SGVpZ2h0ICogKHRhZy55IC8gMTAwKVxuICAgIGVsc2VcbiAgICAgIHggPSB0YWcueCAqIEB3aWR0aFJhdGlvXG4gICAgICB5ID0gdGFnLnkgKiBAaGVpZ2h0UmF0aW9cbiAgICBvZmZzZXRYID0gJHRhZy5vdXRlcldpZHRoKCkgLyAyXG4gICAgb2Zmc2V0WSA9ICR0YWcub3V0ZXJIZWlnaHQoKSAvIDJcbiAgICAkdGFnLmNzc1xuICAgICAgJ2xlZnQnOiBcIiN7eCAtIG9mZnNldFh9cHhcIlxuICAgICAgJ3RvcCc6IFwiI3t5IC0gb2Zmc2V0WX1weFwiXG4gICAgIyBTYXZlIHRhZyBkYXRhIHRvIGRhdGEgYXR0ciBmb3IgZWFzeSBhY2Nlc3NcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgdGFnKVxuXG4gICAgIyBBbGlnbk1lXG4gICAgJGRpYWxvZyA9ICR0YWcuZmluZCgnLnRhZ2xhLWRpYWxvZycpXG4gICAgJGZvcm0gPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJylcbiAgICBhdHRycyA9XG4gICAgICByZWxhdGVUbzogJHRhZ1xuICAgICAgY29uc3RyYWluQnk6IEB3cmFwcGVyXG4gICAgICBza2lwVmlld3BvcnQ6IGZhbHNlXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnLCBuZXcgQWxpZ25NZSgkZGlhbG9nLCBhdHRycykpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJywgbmV3IEFsaWduTWUoJGZvcm0sIGF0dHJzKSlcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWZvcm0nKS5hbGlnbigpXG5cbiAgICAjIFJlbmRlciB0YWcgZWRpdG9yIHRvb2xzXG4gICAgaWYgQGVkaXRvclxuICAgICAgQF9hcHBseVRvb2xzKCR0YWcpXG4gICAgICBpZiBpc05ld1xuICAgICAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZW5hYmxlKClcbiAgICAgICAgJHRhZy5hZGRDbGFzcygndGFnbGEtdGFnLWNob29zZScpXG4gICAgICAgIHNldFRpbWVvdXQgPT5cbiAgICAgICAgICBAd3JhcHBlci5hZGRDbGFzcygndGFnbGEtZWRpdGluZy1zZWxlY3RpbmcnKVxuICAgICAgICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLnRyaWdnZXIgJ2Nob3NlbjpvcGVuJ1xuICAgICAgICAgIEBfZGlzYWJsZURyYWcoJHRhZylcbiAgICAgICAgICBAZW1pdCgnbmV3JywgWyR0YWddKVxuICAgICAgICAsIDEwMFxuXG4gIGRlbGV0ZVRhZzogKCR0YWcpIC0+XG4gICAgQGxvZyAnZGVsZXRlVGFnKCkgaXMgZXhlY3V0ZWQnXG5cbiAgZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvblxuICAgIEBsb2cgJ2VkaXQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5hZGRDbGFzcygndGFnbGEtZWRpdGluZycpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT4gQF9hcHBseVRvb2xzKCQoQCkpXG4gICAgQGVkaXRvciA9IG9uXG5cbiAgZ2V0VGFnczogLT5cbiAgICBAbG9nICdnZXRUYWdzKCkgaXMgZXhlY3V0ZWQnXG4gICAgdGFncyA9IFtdXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJChAKS5kYXRhKCd0YWctZGF0YScpKVxuICAgICAgdGFncy5wdXNoICQoQCkuZGF0YSgndGFnLWRhdGEnKVxuICAgIHRhZ3NcblxuICAjIFNocmluayBldmVyeXRoaW5nIGV4Y2VwdCB0aGUgJGV4Y2VwdFxuICBzaHJpbms6ICgkZXhjZXB0ID0gbnVsbCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdzaHJpbmsoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIGVsXG4gICAgICAkdGFnID0gJChlbClcbiAgICAgIGlmICR0YWcuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKSBhbmQgISR0YWcuZmluZCgnW25hbWU9dGFnXScpLnZhbCgpXG4gICAgICAgICR0YWcuZmFkZU91dCA9PlxuICAgICAgICAgICR0YWcucmVtb3ZlKClcbiAgICAgICAgICBAX3JlbW92ZVRvb2xzKCR0YWcpXG4gICAgICAkdGFnLnJlbW92ZUNsYXNzICd0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1jaG9vc2UnXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJ1xuICAgIEBfZW5hYmxlRHJhZygpXG5cbiAgdXBkYXRlRGlhbG9nOiAoJHRhZywgZGF0YSkgLT5cbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSwgZGF0YSlcbiAgICBkYXRhLmZvcm1faHRtbCA9IEBmb3JtSHRtbFxuICAgIGh0bWwgPSAkKE11c3RhY2hlLnJlbmRlcihAdGFnVGVtcGxhdGUsIGRhdGEpKS5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbCgpXG4gICAgJHRhZy5maW5kKCcudGFnbGEtZGlhbG9nJykuaHRtbChodG1sKVxuICAgICR0YWcuZGF0YSgndGFnLWRhdGEnLCBkYXRhKVxuXG4gIHVuZWRpdDogLT5cbiAgICByZXR1cm4gaWYgQGVkaXQgaXMgb2ZmXG4gICAgQGxvZyAndW5lZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggKGksIGVsKSA9PlxuICAgICAgQF9yZW1vdmVUb29scygkKGVsKSlcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEtZWRpdGluZydcbiAgICBAZWRpdG9yID0gb2ZmXG5cbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBMaWZlY3ljbGUgTWV0aG9kc1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICBpbml0OiAob3B0aW9ucykgLT5cbiAgICAjIENvbmZpZ3VyZSBPcHRpb25zXG4gICAgQGRhdGEgPSBvcHRpb25zLmRhdGEgfHwgW11cbiAgICBAZWRpdG9yID0gKG9wdGlvbnMuZWRpdG9yIGlzIG9uKSA/IG9uIDogZmFsc2VcbiAgICBAZm9ybUh0bWwgPSBpZiBvcHRpb25zLmZvcm0gdGhlbiAkKG9wdGlvbnMuZm9ybSkgZWxzZSAkKFRhZ2xhLkZPUk1fVEVNUExBVEUpXG4gICAgQGZvcm1IdG1sID0gQGZvcm1IdG1sLmh0bWwoKVxuICAgIEB0YWdUZW1wbGF0ZSA9IGlmIG9wdGlvbnMudGFnVGVtcGxhdGUgdGhlbiAkKG9wdGlvbnMudGFnVGVtcGxhdGUpLmh0bWwoKSBlbHNlIFRhZ2xhLlRBR19URU1QTEFURVxuICAgIEB1bml0ID0gaWYgb3B0aW9ucy51bml0IGlzICdwZXJjZW50JyB0aGVuICdwZXJjZW50JyBlbHNlICdwaXhlbCdcbiAgICAjIEF0dHJpYnV0ZXNcbiAgICBAaW1hZ2VTaXplID0gbnVsbFxuICAgIEBpbWFnZSA9IEB3cmFwcGVyLmZpbmQoJ2ltZycpXG4gICAgQGxhc3REcmFnVGltZSA9IG5ldyBEYXRlKClcblxuICBiaW5kOiAtPlxuICAgIEBsb2cgJ2JpbmQoKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlclxuICAgICAgLm9uICdtb3VzZWVudGVyJywgJC5wcm94eShAaGFuZGxlTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAkLnByb3h5KEBoYW5kbGVXcmFwcGVyQ2xpY2ssIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZWRpdC1saW5rJywgJC5wcm94eShAaGFuZGxlVGFnRWRpdCwgQClcbiAgICAgIC5vbiAnY2xpY2snLCAnLnRhZ2xhLXRhZy1kZWxldGUtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0RlbGV0ZSwgQClcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VFbnRlciwgQClcbiAgICAgIC5vbiAnbW91c2VsZWF2ZScsICcudGFnbGEtdGFnJywgJC5wcm94eShAaGFuZGxlVGFnTW91c2VMZWF2ZSwgQClcblxuICByZW5kZXI6IC0+XG4gICAgQGxvZyAncmVuZGVyKCkgaXMgZXhlY3V0ZWQnXG4gICAgQGltYWdlLmF0dHIoJ2RyYWdnYWJsZScsIGZhbHNlKVxuICAgIEBpbWFnZVNpemUgPSBJbWFnZVNpemUuZ2V0KEBpbWFnZSwgJC5wcm94eShAcmVuZGVyRm4sIEApKVxuICAgIEBpbWFnZVNpemUub24oJ2NoYW5nZScsICQucHJveHkoQGhhbmRsZUltYWdlUmVzaXplLCBAKSlcblxuICByZW5kZXJGbjogKHN1Y2Nlc3MsIGRhdGEpIC0+XG4gICAgQGxvZyAncmVuZGVyRm4oKSBpcyBleGVjdXRlZCdcbiAgICBpc1NhZmFyaSA9IC9TYWZhcmkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgYW5kXG4gICAgICAgICAgICAgICAvQXBwbGUgQ29tcHV0ZXIvLnRlc3QobmF2aWdhdG9yLnZlbmRvcilcbiAgICB1bmxlc3Mgc3VjY2VzcyAjIFN0b3AgaWYgaW1hZ2UgaXMgZmFpbGVkIHRvIGxvYWRcbiAgICAgIEBsb2coXCJGYWlsZWQgdG8gbG9hZCBpbWFnZTogI3tAaW1hZ2UuYXR0cignc3JjJyl9XCIsICdlcnJvcicpXG4gICAgICBAZGVzdHJveSgpXG4gICAgICByZXR1cm5cbiAgICBAX3VwZGF0ZUltYWdlU2l6ZShkYXRhKSAjIFNhdmUgZGltZW5zaW9uXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MgJ3RhZ2xhJyAjIEFwcGx5IG5lY2Vzc2FyeSBjbGFzcyBuYW1lc1xuICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYS1zYWZhcmknIGlmIGlzU2FmYXJpICMgQXZvaWQgYW5pbWF0aW9uXG4gICAgQGFkZFRhZyB0YWcgZm9yIHRhZyBpbiBAZGF0YSAjIENyZWF0ZSB0YWdzXG4gICAgc2V0VGltZW91dCA9PlxuICAgICAgQHdyYXBwZXIuYWRkQ2xhc3MgJ3RhZ2xhLWVkaXRpbmcnIGlmIEBlZGl0b3JcbiAgICAgIEBlbWl0KCdyZWFkeScsIFtAXSlcbiAgICAsIDUwMFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGxvZyAnZGVzdHJveSgpIGlzIGV4ZWN1dGVkJ1xuICAgIEB3cmFwcGVyLnJlbW92ZUNsYXNzICd0YWdsYSB0YWdsYS1lZGl0aW5nJ1xuICAgIEB3cmFwcGVyLmZpbmQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAkdGFnID0gJChAKVxuICAgICAgJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JykuY2hvc2VuMiAnZGVzdHJveSdcbiAgICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5kZXN0cm95KClcbiAgICAgICR0YWcucmVtb3ZlKClcblxuJC5leHRlbmQoVGFnbGE6OiwgcHJvdG8pXG5cbiMgVmFuaWxsYSBKU1xud2luZG93LlN0YWNrbGEuVGFnbGEgPSBUYWdsYSBpZiB3aW5kb3cuU3RhY2tsYVxuXG5pZiB0eXBlb2YgZXhwb3J0cyBpcyAnb2JqZWN0JyBhbmQgZXhwb3J0cyAjIENvbW1vbkpTXG4gIG1vZHVsZS5leHBvcnRzID0gVGFnbGFcbmVsc2UgaWYgdHlwZW9mIGRlZmluZSBpcyAnZnVuY3Rpb24nIGFuZCBkZWZpbmUuYW1kICMgQU1EXG4gIGRlZmluZShbJ2V4cG9ydHMnXSwgVGFnbGEpXG5cbiJdfQ==
