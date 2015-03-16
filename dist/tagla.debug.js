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

//if (typeof exports === 'object' && exports) { // CommonJS
//} else if (typeof define === 'function' && define.amd) { // AMD
    //define(['exports'], AlignMe);
//}
module.exports = AlignMe;


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



},{"./base.coffee":3}],5:[function(require,module,exports){
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

if (window.Stackla) {
  window.Stackla.Tagla = Tagla;
}



},{"./base.coffee":3,"./image.coffee":4,"alignme":1,"mustache":2}]},{},[5])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYWxpZ25tZS9zcmMvanMvYWxpZ25tZS5qcyIsIm5vZGVfbW9kdWxlcy9tdXN0YWNoZS9tdXN0YWNoZS5qcyIsIi9Vc2Vycy9qb3NlcGhqL1JlcG9zL3RhZ2xhMi9zcmMvY29mZmVlL2Jhc2UuY29mZmVlIiwiL1VzZXJzL2pvc2VwaGovUmVwb3MvdGFnbGEyL3NyYy9jb2ZmZWUvaW1hZ2UuY29mZmVlIiwiL1VzZXJzL2pvc2VwaGovUmVwb3MvdGFnbGEyL3NyYy9jb2ZmZWUvdGFnbGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6a0JBO0FBQUE7O0dBQUE7QUFBQSxJQUFBLElBQUE7O0FBQUE7QUFLZSxFQUFBLGNBQUMsT0FBRCxHQUFBO0FBQ1gsUUFBQSxZQUFBOztNQURZLFVBQVU7S0FDdEI7QUFBQSxJQUFBLEtBQUEsR0FBUSxJQUFDLENBQUEsU0FBRCxDQUFXLE9BQVgsQ0FBUixDQUFBO0FBQUEsSUFDQSxLQUFBLEdBQVEsS0FBQSxJ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QUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxTQUFBLEdBQUE7QUFDL0IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLElBQUYsQ0FBUCxDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLGVBQVYsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQyxTQUFuQyxDQURBLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsYUFBVixDQUF3QixDQUFDLE9BQXpCLENBQUEsQ0FGQSxDQUFBO2FBR0EsSUFBSSxDQUFDLE1BQUwsQ0FBQSxFQUorQjtJQUFBLENBQWpDLEVBSE87RUFBQSxDQTdWVDtDQTFGRixDQUFBOztBQUFBLENBZ2NDLENBQUMsTUFBRixDQUFTLEtBQUssQ0FBQSxTQUFkLEVBQWtCLEtBQWxCLENBaGNBLENBQUE7O0FBbWNBLElBQWdDLE1BQU0sQ0FBQyxPQUF2QztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFmLEdBQXVCLEtBQXZCLENBQUE7Q0FuY0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWwgd2luZG93LCAkLCBkZWZpbmUsIGRvY3VtZW50ICovXG4vKipcbiAqIEEgSmF2YVNjcmlwdCB1dGlsaXR5IHdoaWNoIGF1dG9tYXRpY2FsbHkgYWxpZ25zIHBvc2l0aW9uIG9mIGFuIG92ZXJsYXkuXG4gKlxuICogICAgICBAZXhhbXBsZVxuICogICAgICB2YXIgYWxpZ25NZSA9IG5ldyBBbGlnbk1lKCRvdmVybGF5LCB7XG4gKiAgICAgICAgICByZWxhdGVUbzogJy5kcmFnZ2FibGUnLFxuICogICAgICAgICAgY29uc3RyYWluQnk6ICcucGFyZW50JyxcbiAqICAgICAgICAgIHNraXBWaWV3cG9ydDogZmFsc2VcbiAqICAgICAgfSk7XG4gKiAgICAgIGFsaWduTWUuYWxpZ24oKTtcbiAqXG4gKiBAY2xhc3MgQWxpZ25NZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gb3ZlcmxheSBPdmVybGF5IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIENvbmZpZ3VyYWJsZSBvcHRpb25zXG4gKi9cblxuZnVuY3Rpb24gQWxpZ25NZShvdmVybGF5LCBvcHRpb25zKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhhdC5vdmVybGF5ID0gJChvdmVybGF5KTtcbiAgICAvLz09PT09PT09PT09PT09PT09PT09PT1cbiAgICAvLyBDb25maWcgT3B0aW9uc1xuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PVxuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSByZWxhdGVUbyAocmVxdWlyZWQpXG4gICAgICogVGhlIHJlZmVyZW5jZSBlbGVtZW50XG4gICAgICovXG4gICAgdGhhdC5yZWxhdGVUbyA9ICQob3B0aW9ucy5yZWxhdGVUbykgfHwgbnVsbDtcbiAgICAvKipcbiAgICAgKiBAY2ZnIHtIVE1MRWxlbWVudH0gcmVsYXRlVG9cbiAgICAgKiBUaGUgcmVmZXJlbmNlIGVsZW1lbnRcbiAgICAgKi9cbiAgICB0aGF0LmNvbnN0cmFpbkJ5ID0gJChvcHRpb25zLmNvbnN0cmFpbkJ5KSB8fCBudWxsO1xuICAgIC8qKlxuICAgICAqIEBjZmcge0hUTUxFbGVtZW50fSBbc2tpcFZpZXdwb3J0PXRydWVdXG4gICAgICogSWdub3JlIHdpbmRvdyBhcyBhbm90aGVyIGNvbnN0cmFpbiBlbGVtZW50XG4gICAgICovXG4gICAgdGhhdC5za2lwVmlld3BvcnQgPSAob3B0aW9ucy5za2lwVmlld3BvcnQgPT09IGZhbHNlKSA/IGZhbHNlIDogdHJ1ZTtcblxuICAgIC8vIFN0b3AgaWYgb3ZlcmxheSBvciBvcHRpb25zLnJlbGF0ZWRUbyBhcmVudCBwcm92aWRlZFxuICAgIGlmICghdGhhdC5vdmVybGF5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYG92ZXJsYXlgIGVsZW1lbnQgaXMgcmVxdWlyZWQnKTtcbiAgICB9XG4gICAgaWYgKCF0aGF0LnJlbGF0ZVRvKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYHJlbGF0ZVRvYCBvcHRpb24gaXMgcmVxdWlyZWQnKTtcbiAgICB9XG59XG5cbnZhciBfZ2V0TWF4LFxuICAgIF9nZXRQb2ludHMsXG4gICAgX2xpc3RQb3NpdGlvbnMsXG4gICAgX3NldENvbnN0cmFpbkJ5Vmlld3BvcnQ7XG5cbi8vIFJlcGxhY2VtZW50IGZvciBfLm1heFxuX2dldE1heCA9IGZ1bmN0aW9uIChvYmosIGF0dHIpIHtcbiAgICB2YXIgbWF4VmFsdWUgPSAwLFxuICAgICAgICBtYXhJdGVtLFxuICAgICAgICBpLCBvO1xuXG4gICAgZm9yIChpIGluIG9iaikge1xuICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgICAgICBvID0gb2JqW2ldO1xuICAgICAgICAgICAgaWYgKG9bYXR0cl0gPiBtYXhWYWx1ZSkge1xuICAgICAgICAgICAgICAgIG1heFZhbHVlID0gb1thdHRyXTtcbiAgICAgICAgICAgICAgICBtYXhJdGVtID0gbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXhJdGVtO1xufTtcblxuLy8gR2V0IGNvb3JkaW5hdGVzIGFuZCBkaW1lbnNpb24gb2YgYW4gZWxlbWVudFxuX2dldFBvaW50cyA9IGZ1bmN0aW9uICgkZWwpIHtcbiAgICB2YXIgb2Zmc2V0ID0gJGVsLm9mZnNldCgpLFxuICAgICAgICB3aWR0aCA9ICRlbC5vdXRlcldpZHRoKCksXG4gICAgICAgIGhlaWdodCA9ICRlbC5vdXRlckhlaWdodCgpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdCAgIDogb2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcCAgICA6IG9mZnNldC50b3AsXG4gICAgICAgIHJpZ2h0ICA6IG9mZnNldC5sZWZ0ICsgd2lkdGgsXG4gICAgICAgIGJvdHRvbSA6IG9mZnNldC50b3AgKyBoZWlnaHQsXG4gICAgICAgIHdpZHRoICA6IHdpZHRoLFxuICAgICAgICBoZWlnaHQgOiBoZWlnaHRcbiAgICB9O1xufTtcblxuLy8gTGlzdCBhbGwgcG9zc2libGUgWFkgY29vcmRpbmRhdGVzXG5fbGlzdFBvc2l0aW9ucyA9IGZ1bmN0aW9uIChvdmVybGF5RGF0YSwgcmVsYXRlVG9EYXRhKSB7XG4gICAgdmFyIGNlbnRlciA9IHJlbGF0ZVRvRGF0YS5sZWZ0ICsgKHJlbGF0ZVRvRGF0YS53aWR0aCAvIDIpIC0gKG92ZXJsYXlEYXRhLndpZHRoIC8gMik7XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBsYmx0IFsnbGVmdCcsICdib3R0b20nXSwgWydsZWZ0JywgJ3RvcCddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEubGVmdCwgdG9wOiByZWxhdGVUb0RhdGEudG9wIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAnbGJsdCd9LFxuICAgICAgICAvLyBjYmN0IFsnY2VudGVyJywgJ2JvdHRvbSddLCBbJ2NlbnRlcicsICd0b3AnXVxuICAgICAgICAvLyB7bGVmdDogY2VudGVyLCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AgLSBvdmVybGF5RGF0YS5oZWlnaHQsIG5hbWU6ICdjYmN0J30sXG4gICAgICAgIC8vIHJicnQgWydyaWdodCcsICdib3R0b20nXSwgWydyaWdodCcsICd0b3AnXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0IC0gb3ZlcmxheURhdGEud2lkdGgsIHRvcDogcmVsYXRlVG9EYXRhLnRvcCAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ3JicnQnfSxcblxuICAgICAgICAvLyBsdHJ0IFsnbGVmdCcsICd0b3AnXSwgWydyaWdodCcsICd0b3AnXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLnJpZ2h0LCB0b3A6IHJlbGF0ZVRvRGF0YS50b3AsIG5hbWU6ICdsdHJ0J30sXG4gICAgICAgIC8vIGxicmIgWydsZWZ0JywgJ2JvdHRvbSddLCBbJ3JpZ2h0JywgJ2JvdHRvbSddXG4gICAgICAgIHtsZWZ0OiByZWxhdGVUb0RhdGEucmlnaHQsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSAtIG92ZXJsYXlEYXRhLmhlaWdodCwgbmFtZTogJ2xicmInfSxcblxuICAgICAgICAvLyBydHJiIFsncmlnaHQnLCAndG9wJ10sIFsncmlnaHQnLCAnYm90dG9tJ11cbiAgICAgICAge2xlZnQ6IHJlbGF0ZVRvRGF0YS5yaWdodCAtIG92ZXJsYXlEYXRhLndpZHRoLCB0b3A6IHJlbGF0ZVRvRGF0YS5ib3R0b20sIG5hbWU6ICdydHJiJ30sXG4gICAgICAgIC8vIGN0Y2IgWydjZW50ZXInLCAndG9wJ10sIFsnY2VudGVyJywgJ2JvdHRvbSddXG4gICAgICAgIC8vIHtsZWZ0OiBjZW50ZXIsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ2N0Y2InfSxcbiAgICAgICAgLy8gbHRsYiBbJ2xlZnQnLCAndG9wJ10sIFsnbGVmdCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQsIHRvcDogcmVsYXRlVG9EYXRhLmJvdHRvbSwgbmFtZTogJ2x0bGInfSxcblxuICAgICAgICAvLyByYmxiIFsncmlnaHQnLCAnYm90dG9tJ10sIFsnbGVmdCcsICdib3R0b20nXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEuYm90dG9tIC0gb3ZlcmxheURhdGEuaGVpZ2h0LCBuYW1lOiAncmJsYid9LFxuICAgICAgICAvLyBydGx0IFsncmlnaHQnLCAndG9wJ10sIFsnbGVmdCcsICd0b3AnXVxuICAgICAgICB7bGVmdDogcmVsYXRlVG9EYXRhLmxlZnQgLSBvdmVybGF5RGF0YS53aWR0aCwgdG9wOiByZWxhdGVUb0RhdGEudG9wLCBuYW1lOiAncnRsdCd9XG4gICAgXTtcbn07XG5cbi8vIFRha2UgY3VycmVudCB2aWV3cG9ydC93aW5kb3cgYXMgY29uc3RyYWluLlxuX3NldENvbnN0cmFpbkJ5Vmlld3BvcnQgPSBmdW5jdGlvbiAoY29uc3RyYWluQnlEYXRhKSB7XG4gICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyksXG4gICAgICAgIHRvcG1vc3QgPSAkd2luZG93LnNjcm9sbFRvcCgpLFxuICAgICAgICBib3R0b21tb3N0ID0gdG9wbW9zdCArICR3aW5kb3cuaGVpZ2h0KCk7XG5cbiAgICBpZiAodG9wbW9zdCA+IGNvbnN0cmFpbkJ5RGF0YSkge1xuICAgICAgICBjb25zdHJhaW5CeURhdGEudG9wID0gdG9wbW9zdDtcbiAgICB9XG4gICAgaWYgKGJvdHRvbW1vc3QgPCBjb25zdHJhaW5CeURhdGEuYm90dG9tKSB7XG4gICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20gPSBib3R0b21tb3N0O1xuICAgICAgICBjb25zdHJhaW5CeURhdGEuaGVpZ2h0ID0gYm90dG9tbW9zdCAtIHRvcG1vc3Q7XG4gICAgfVxuICAgIHJldHVybiBjb25zdHJhaW5CeURhdGE7XG59O1xuXG4vKipcbiAqIEFsaWduIG92ZXJsYXkgYXV0b21hdGljYWxseVxuICpcbiAqIEBtZXRob2QgYWxpZ25cbiAqIEByZXR1cm4ge0FycmF5fSBUaGUgYmVzdCBYWSBjb29yZGluYXRlc1xuICovXG5BbGlnbk1lLnByb3RvdHlwZS5hbGlnbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgIG92ZXJsYXkgPSB0aGF0Lm92ZXJsYXksXG4gICAgICAgIG92ZXJsYXlEYXRhID0gX2dldFBvaW50cyhvdmVybGF5KSxcbiAgICAgICAgcmVsYXRlVG9EYXRhID0gX2dldFBvaW50cyh0aGF0LnJlbGF0ZVRvKSxcbiAgICAgICAgY29uc3RyYWluQnlEYXRhID0gX2dldFBvaW50cyh0aGF0LmNvbnN0cmFpbkJ5KSxcbiAgICAgICAgcG9zaXRpb25zID0gX2xpc3RQb3NpdGlvbnMob3ZlcmxheURhdGEsIHJlbGF0ZVRvRGF0YSksIC8vIEFsbCBwb3NzaWJsZSBwb3NpdGlvbnNcbiAgICAgICAgaGFzQ29udGFpbiA9IGZhbHNlLCAvLyBJbmRpY2F0ZXMgaWYgYW55IHBvc2l0aW9ucyBhcmUgZnVsbHkgY29udGFpbmVkIGJ5IGNvbnN0cmFpbiBlbGVtZW50XG4gICAgICAgIGJlc3RQb3MgPSB7fSwgLy8gUmV0dXJuIHZhbHVlXG4gICAgICAgIHBvcywgaTsgLy8gRm9yIEl0ZXJhdGlvblxuXG4gICAgLy8gQ29uc3RyYWluIGJ5IHZpZXdwb3J0XG4gICAgaWYgKCF0aGF0LnNraXBWaWV3cG9ydCkge1xuICAgICAgICBfc2V0Q29uc3RyYWluQnlWaWV3cG9ydChjb25zdHJhaW5CeURhdGEpO1xuICAgIH1cblxuICAgIGZvciAoaSBpbiBwb3NpdGlvbnMpIHtcbiAgICAgICAgaWYgKHBvc2l0aW9ucy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgcG9zID0gcG9zaXRpb25zW2ldO1xuICAgICAgICAgICAgcG9zLnJpZ2h0ID0gcG9zLmxlZnQgKyBvdmVybGF5RGF0YS53aWR0aDtcbiAgICAgICAgICAgIHBvcy5ib3R0b20gPSBwb3MudG9wICsgb3ZlcmxheURhdGEuaGVpZ2h0O1xuICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgIHBvcy5sZWZ0ID49IGNvbnN0cmFpbkJ5RGF0YS5sZWZ0ICYmXG4gICAgICAgICAgICAgICAgcG9zLnRvcCA+PSBjb25zdHJhaW5CeURhdGEudG9wICYmXG4gICAgICAgICAgICAgICAgcG9zLnJpZ2h0IDw9IGNvbnN0cmFpbkJ5RGF0YS5yaWdodCAmJlxuICAgICAgICAgICAgICAgIHBvcy5ib3R0b20gPD0gY29uc3RyYWluQnlEYXRhLmJvdHRvbVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgLy8gSW5zaWRlIGRpc3RhbmNlLiBUaGUgbW9yZSB0aGUgYmV0dGVyLlxuICAgICAgICAgICAgICAgIC8vIDQgZGlzdGFuY2VzIHRvIGJvcmRlciBvZiBjb25zdHJhaW5cbiAgICAgICAgICAgICAgICBwb3MuaW5EaXN0YW5jZSA9IE1hdGgubWluLmFwcGx5KG51bGwsIFtcbiAgICAgICAgICAgICAgICAgICAgcG9zLnRvcCAtIGNvbnN0cmFpbkJ5RGF0YS50b3AsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5yaWdodCAtIHBvcy5sZWZ0ICsgb3ZlcmxheURhdGEud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20gLSBwb3MudG9wICsgb3ZlcmxheURhdGEuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICBwb3MubGVmdCAtIGNvbnN0cmFpbkJ5RGF0YS5sZWZ0XG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGZsYWdcbiAgICAgICAgICAgICAgICBoYXNDb250YWluID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIG1vcmUgb3ZlcmxhcCB0aGUgYmV0dGVyXG4gICAgICAgICAgICAgICAgcG9zLm92ZXJsYXBTaXplID1cbiAgICAgICAgICAgICAgICAgICAgKE1hdGgubWluKHBvcy5yaWdodCwgY29uc3RyYWluQnlEYXRhLnJpZ2h0KSAtIE1hdGgubWF4KHBvcy5sZWZ0LCBjb25zdHJhaW5CeURhdGEubGVmdCkpICpcbiAgICAgICAgICAgICAgICAgICAgKE1hdGgubWluKHBvcy5ib3R0b20sIGNvbnN0cmFpbkJ5RGF0YS5ib3R0b20pIC0gTWF0aC5tYXgocG9zLnRvcCwgY29uc3RyYWluQnlEYXRhLnRvcCkpIDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJlc3RQb3MgPSAoaGFzQ29udGFpbikgPyBfZ2V0TWF4KHBvc2l0aW9ucywgJ2luRGlzdGFuY2UnKSA6IF9nZXRNYXgocG9zaXRpb25zLCAnb3ZlcmxhcFNpemUnKTtcbiAgICBvdmVybGF5Lm9mZnNldChiZXN0UG9zKTtcblxuICAgIHJldHVybiBiZXN0UG9zO1xufTtcblxuaWYgKHdpbmRvdy5TdGFja2xhKSB7IC8vIFZhbmlsbGEgSlNcbiAgICB3aW5kb3cuU3RhY2tsYS5BbGlnbk1lID0gQWxpZ25NZTtcbn0gZWxzZSB7XG4gICAgd2luZG93LkFsaWduTWUgPSBBbGlnbk1lO1xufVxuXG4vL2lmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgZXhwb3J0cykgeyAvLyBDb21tb25KU1xuLy99IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgeyAvLyBBTURcbiAgICAvL2RlZmluZShbJ2V4cG9ydHMnXSwgQWxpZ25NZSk7XG4vL31cbm1vZHVsZS5leHBvcnRzID0gQWxpZ25NZTtcblxuIiwiLyohXG4gKiBtdXN0YWNoZS5qcyAtIExvZ2ljLWxlc3Mge3ttdXN0YWNoZX19IHRlbXBsYXRlcyB3aXRoIEphdmFTY3JpcHRcbiAqIGh0dHA6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanNcbiAqL1xuXG4vKmdsb2JhbCBkZWZpbmU6IGZhbHNlKi9cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSBcIm9iamVjdFwiICYmIGV4cG9ydHMpIHtcbiAgICBmYWN0b3J5KGV4cG9ydHMpOyAvLyBDb21tb25KU1xuICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KTsgLy8gQU1EXG4gIH0gZWxzZSB7XG4gICAgZmFjdG9yeShnbG9iYWwuTXVzdGFjaGUgPSB7fSk7IC8vIDxzY3JpcHQ+XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKG11c3RhY2hlKSB7XG5cbiAgdmFyIE9iamVjdF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdF90b1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNGdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1tcXC1cXFtcXF17fSgpKis/LixcXFxcXFxeJHwjXFxzXS9nLCBcIlxcXFwkJlwiKTtcbiAgfVxuXG4gIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vaXNzdWVzLmFwYWNoZS5vcmcvamlyYS9icm93c2UvQ09VQ0hEQi01NzdcbiAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzL2lzc3Vlcy8xODlcbiAgdmFyIFJlZ0V4cF90ZXN0ID0gUmVnRXhwLnByb3RvdHlwZS50ZXN0O1xuICBmdW5jdGlvbiB0ZXN0UmVnRXhwKHJlLCBzdHJpbmcpIHtcbiAgICByZXR1cm4gUmVnRXhwX3Rlc3QuY2FsbChyZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBub25TcGFjZVJlID0gL1xcUy87XG4gIGZ1bmN0aW9uIGlzV2hpdGVzcGFjZShzdHJpbmcpIHtcbiAgICByZXR1cm4gIXRlc3RSZWdFeHAobm9uU3BhY2VSZSwgc3RyaW5nKTtcbiAgfVxuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgXCImXCI6IFwiJmFtcDtcIixcbiAgICBcIjxcIjogXCImbHQ7XCIsXG4gICAgXCI+XCI6IFwiJmd0O1wiLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgIFwiL1wiOiAnJiN4MkY7J1xuICB9O1xuXG4gIGZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyaW5nKSB7XG4gICAgcmV0dXJuIFN0cmluZyhzdHJpbmcpLnJlcGxhY2UoL1smPD5cIidcXC9dL2csIGZ1bmN0aW9uIChzKSB7XG4gICAgICByZXR1cm4gZW50aXR5TWFwW3NdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHdoaXRlUmUgPSAvXFxzKi87XG4gIHZhciBzcGFjZVJlID0gL1xccysvO1xuICB2YXIgZXF1YWxzUmUgPSAvXFxzKj0vO1xuICB2YXIgY3VybHlSZSA9IC9cXHMqXFx9LztcbiAgdmFyIHRhZ1JlID0gLyN8XFxefFxcL3w+fFxce3wmfD18IS87XG5cbiAgLyoqXG4gICAqIEJyZWFrcyB1cCB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBzdHJpbmcgaW50byBhIHRyZWUgb2YgdG9rZW5zLiBJZiB0aGUgYHRhZ3NgXG4gICAqIGFyZ3VtZW50IGlzIGdpdmVuIGhlcmUgaXQgbXVzdCBiZSBhbiBhcnJheSB3aXRoIHR3byBzdHJpbmcgdmFsdWVzOiB0aGVcbiAgICogb3BlbmluZyBhbmQgY2xvc2luZyB0YWdzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIChlLmcuIFsgXCI8JVwiLCBcIiU+XCIgXSkuIE9mXG4gICAqIGNvdXJzZSwgdGhlIGRlZmF1bHQgaXMgdG8gdXNlIG11c3RhY2hlcyAoaS5lLiBtdXN0YWNoZS50YWdzKS5cbiAgICpcbiAgICogQSB0b2tlbiBpcyBhbiBhcnJheSB3aXRoIGF0IGxlYXN0IDQgZWxlbWVudHMuIFRoZSBmaXJzdCBlbGVtZW50IGlzIHRoZVxuICAgKiBtdXN0YWNoZSBzeW1ib2wgdGhhdCB3YXMgdXNlZCBpbnNpZGUgdGhlIHRhZywgZS5nLiBcIiNcIiBvciBcIiZcIi4gSWYgdGhlIHRhZ1xuICAgKiBkaWQgbm90IGNvbnRhaW4gYSBzeW1ib2wgKGkuZS4ge3tteVZhbHVlfX0pIHRoaXMgZWxlbWVudCBpcyBcIm5hbWVcIi4gRm9yXG4gICAqIGFsbCB0ZXh0IHRoYXQgYXBwZWFycyBvdXRzaWRlIGEgc3ltYm9sIHRoaXMgZWxlbWVudCBpcyBcInRleHRcIi5cbiAgICpcbiAgICogVGhlIHNlY29uZCBlbGVtZW50IG9mIGEgdG9rZW4gaXMgaXRzIFwidmFsdWVcIi4gRm9yIG11c3RhY2hlIHRhZ3MgdGhpcyBpc1xuICAgKiB3aGF0ZXZlciBlbHNlIHdhcyBpbnNpZGUgdGhlIHRhZyBiZXNpZGVzIHRoZSBvcGVuaW5nIHN5bWJvbC4gRm9yIHRleHQgdG9rZW5zXG4gICAqIHRoaXMgaXMgdGhlIHRleHQgaXRzZWxmLlxuICAgKlxuICAgKiBUaGUgdGhpcmQgYW5kIGZvdXJ0aCBlbGVtZW50cyBvZiB0aGUgdG9rZW4gYXJlIHRoZSBzdGFydCBhbmQgZW5kIGluZGljZXMsXG4gICAqIHJlc3BlY3RpdmVseSwgb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogVG9rZW5zIHRoYXQgYXJlIHRoZSByb290IG5vZGUgb2YgYSBzdWJ0cmVlIGNvbnRhaW4gdHdvIG1vcmUgZWxlbWVudHM6IDEpIGFuXG4gICAqIGFycmF5IG9mIHRva2VucyBpbiB0aGUgc3VidHJlZSBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBhdFxuICAgKiB3aGljaCB0aGUgY2xvc2luZyB0YWcgZm9yIHRoYXQgc2VjdGlvbiBiZWdpbnMuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgaWYgKCF0ZW1wbGF0ZSlcbiAgICAgIHJldHVybiBbXTtcblxuICAgIHZhciBzZWN0aW9ucyA9IFtdOyAgICAgLy8gU3RhY2sgdG8gaG9sZCBzZWN0aW9uIHRva2Vuc1xuICAgIHZhciB0b2tlbnMgPSBbXTsgICAgICAgLy8gQnVmZmVyIHRvIGhvbGQgdGhlIHRva2Vuc1xuICAgIHZhciBzcGFjZXMgPSBbXTsgICAgICAgLy8gSW5kaWNlcyBvZiB3aGl0ZXNwYWNlIHRva2VucyBvbiB0aGUgY3VycmVudCBsaW5lXG4gICAgdmFyIGhhc1RhZyA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIHt7dGFnfX0gb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICB2YXIgbm9uU3BhY2UgPSBmYWxzZTsgIC8vIElzIHRoZXJlIGEgbm9uLXNwYWNlIGNoYXIgb24gdGhlIGN1cnJlbnQgbGluZT9cblxuICAgIC8vIFN0cmlwcyBhbGwgd2hpdGVzcGFjZSB0b2tlbnMgYXJyYXkgZm9yIHRoZSBjdXJyZW50IGxpbmVcbiAgICAvLyBpZiB0aGVyZSB3YXMgYSB7eyN0YWd9fSBvbiBpdCBhbmQgb3RoZXJ3aXNlIG9ubHkgc3BhY2UuXG4gICAgZnVuY3Rpb24gc3RyaXBTcGFjZSgpIHtcbiAgICAgIGlmIChoYXNUYWcgJiYgIW5vblNwYWNlKSB7XG4gICAgICAgIHdoaWxlIChzcGFjZXMubGVuZ3RoKVxuICAgICAgICAgIGRlbGV0ZSB0b2tlbnNbc3BhY2VzLnBvcCgpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwYWNlcyA9IFtdO1xuICAgICAgfVxuXG4gICAgICBoYXNUYWcgPSBmYWxzZTtcbiAgICAgIG5vblNwYWNlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIG9wZW5pbmdUYWdSZSwgY2xvc2luZ1RhZ1JlLCBjbG9zaW5nQ3VybHlSZTtcbiAgICBmdW5jdGlvbiBjb21waWxlVGFncyh0YWdzKSB7XG4gICAgICBpZiAodHlwZW9mIHRhZ3MgPT09ICdzdHJpbmcnKVxuICAgICAgICB0YWdzID0gdGFncy5zcGxpdChzcGFjZVJlLCAyKTtcblxuICAgICAgaWYgKCFpc0FycmF5KHRhZ3MpIHx8IHRhZ3MubGVuZ3RoICE9PSAyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdGFnczogJyArIHRhZ3MpO1xuXG4gICAgICBvcGVuaW5nVGFnUmUgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cCh0YWdzWzBdKSArICdcXFxccyonKTtcbiAgICAgIGNsb3NpbmdUYWdSZSA9IG5ldyBSZWdFeHAoJ1xcXFxzKicgKyBlc2NhcGVSZWdFeHAodGFnc1sxXSkpO1xuICAgICAgY2xvc2luZ0N1cmx5UmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKCd9JyArIHRhZ3NbMV0pKTtcbiAgICB9XG5cbiAgICBjb21waWxlVGFncyh0YWdzIHx8IG11c3RhY2hlLnRhZ3MpO1xuXG4gICAgdmFyIHNjYW5uZXIgPSBuZXcgU2Nhbm5lcih0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgc3RhcnQsIHR5cGUsIHZhbHVlLCBjaHIsIHRva2VuLCBvcGVuU2VjdGlvbjtcbiAgICB3aGlsZSAoIXNjYW5uZXIuZW9zKCkpIHtcbiAgICAgIHN0YXJ0ID0gc2Nhbm5lci5wb3M7XG5cbiAgICAgIC8vIE1hdGNoIGFueSB0ZXh0IGJldHdlZW4gdGFncy5cbiAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwob3BlbmluZ1RhZ1JlKTtcblxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IHZhbHVlTGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBjaHIgPSB2YWx1ZS5jaGFyQXQoaSk7XG5cbiAgICAgICAgICBpZiAoaXNXaGl0ZXNwYWNlKGNocikpIHtcbiAgICAgICAgICAgIHNwYWNlcy5wdXNoKHRva2Vucy5sZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub25TcGFjZSA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdG9rZW5zLnB1c2goWyAndGV4dCcsIGNociwgc3RhcnQsIHN0YXJ0ICsgMSBdKTtcbiAgICAgICAgICBzdGFydCArPSAxO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgZm9yIHdoaXRlc3BhY2Ugb24gdGhlIGN1cnJlbnQgbGluZS5cbiAgICAgICAgICBpZiAoY2hyID09PSAnXFxuJylcbiAgICAgICAgICAgIHN0cmlwU3BhY2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBNYXRjaCB0aGUgb3BlbmluZyB0YWcuXG4gICAgICBpZiAoIXNjYW5uZXIuc2NhbihvcGVuaW5nVGFnUmUpKVxuICAgICAgICBicmVhaztcblxuICAgICAgaGFzVGFnID0gdHJ1ZTtcblxuICAgICAgLy8gR2V0IHRoZSB0YWcgdHlwZS5cbiAgICAgIHR5cGUgPSBzY2FubmVyLnNjYW4odGFnUmUpIHx8ICduYW1lJztcbiAgICAgIHNjYW5uZXIuc2Nhbih3aGl0ZVJlKTtcblxuICAgICAgLy8gR2V0IHRoZSB0YWcgdmFsdWUuXG4gICAgICBpZiAodHlwZSA9PT0gJz0nKSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoZXF1YWxzUmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oZXF1YWxzUmUpO1xuICAgICAgICBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nVGFnUmUpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAneycpIHtcbiAgICAgICAgdmFsdWUgPSBzY2FubmVyLnNjYW5VbnRpbChjbG9zaW5nQ3VybHlSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhbihjdXJseVJlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgICAgdHlwZSA9ICcmJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIGNsb3NpbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4oY2xvc2luZ1RhZ1JlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCB0YWcgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgICAgdG9rZW4gPSBbIHR5cGUsIHZhbHVlLCBzdGFydCwgc2Nhbm5lci5wb3MgXTtcbiAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcblxuICAgICAgaWYgKHR5cGUgPT09ICcjJyB8fCB0eXBlID09PSAnXicpIHtcbiAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICcvJykge1xuICAgICAgICAvLyBDaGVjayBzZWN0aW9uIG5lc3RpbmcuXG4gICAgICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICAgICAgaWYgKCFvcGVuU2VjdGlvbilcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vub3BlbmVkIHNlY3Rpb24gXCInICsgdmFsdWUgKyAnXCIgYXQgJyArIHN0YXJ0KTtcblxuICAgICAgICBpZiAob3BlblNlY3Rpb25bMV0gIT09IHZhbHVlKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgc2VjdGlvbiBcIicgKyBvcGVuU2VjdGlvblsxXSArICdcIiBhdCAnICsgc3RhcnQpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnbmFtZScgfHwgdHlwZSA9PT0gJ3snIHx8IHR5cGUgPT09ICcmJykge1xuICAgICAgICBub25TcGFjZSA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICAvLyBTZXQgdGhlIHRhZ3MgZm9yIHRoZSBuZXh0IHRpbWUgYXJvdW5kLlxuICAgICAgICBjb21waWxlVGFncyh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHRoZXJlIGFyZSBubyBvcGVuIHNlY3Rpb25zIHdoZW4gd2UncmUgZG9uZS5cbiAgICBvcGVuU2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuXG4gICAgaWYgKG9wZW5TZWN0aW9uKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICByZXR1cm4gbmVzdFRva2VucyhzcXVhc2hUb2tlbnModG9rZW5zKSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tYmluZXMgdGhlIHZhbHVlcyBvZiBjb25zZWN1dGl2ZSB0ZXh0IHRva2VucyBpbiB0aGUgZ2l2ZW4gYHRva2Vuc2AgYXJyYXlcbiAgICogdG8gYSBzaW5nbGUgdG9rZW4uXG4gICAqL1xuICBmdW5jdGlvbiBzcXVhc2hUb2tlbnModG9rZW5zKSB7XG4gICAgdmFyIHNxdWFzaGVkVG9rZW5zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIGxhc3RUb2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlblswXSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbiAmJiBsYXN0VG9rZW5bMF0gPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlblsxXSArPSB0b2tlblsxXTtcbiAgICAgICAgICBsYXN0VG9rZW5bM10gPSB0b2tlblszXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgaW50byBhIG5lc3RlZCB0cmVlIHN0cnVjdHVyZSB3aGVyZVxuICAgKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gICAqIGFsbCB0b2tlbnMgdGhhdCBhcHBlYXIgaW4gdGhhdCBzZWN0aW9uIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsXG4gICAqIHRlbXBsYXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgZW5kIG9mIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG5lc3RUb2tlbnModG9rZW5zKSB7XG4gICAgdmFyIG5lc3RlZFRva2VucyA9IFtdO1xuICAgIHZhciBjb2xsZWN0b3IgPSBuZXN0ZWRUb2tlbnM7XG4gICAgdmFyIHNlY3Rpb25zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIHNlY3Rpb247XG4gICAgZm9yICh2YXIgaSA9IDAsIG51bVRva2VucyA9IHRva2Vucy5sZW5ndGg7IGkgPCBudW1Ub2tlbnM7ICsraSkge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIHN3aXRjaCAodG9rZW5bMF0pIHtcbiAgICAgIGNhc2UgJyMnOlxuICAgICAgY2FzZSAnXic6XG4gICAgICAgIGNvbGxlY3Rvci5wdXNoKHRva2VuKTtcbiAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbGxlY3RvciA9IHRva2VuWzRdID0gW107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLyc6XG4gICAgICAgIHNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcbiAgICAgICAgc2VjdGlvbls1XSA9IHRva2VuWzJdO1xuICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bNF0gOiBuZXN0ZWRUb2tlbnM7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXN0ZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgc3RyaW5nIHNjYW5uZXIgdGhhdCBpcyB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSBwYXJzZXIgdG8gZmluZFxuICAgKiB0b2tlbnMgaW4gdGVtcGxhdGUgc3RyaW5ncy5cbiAgICovXG4gIGZ1bmN0aW9uIFNjYW5uZXIoc3RyaW5nKSB7XG4gICAgdGhpcy5zdHJpbmcgPSBzdHJpbmc7XG4gICAgdGhpcy50YWlsID0gc3RyaW5nO1xuICAgIHRoaXMucG9zID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdGFpbCBpcyBlbXB0eSAoZW5kIG9mIHN0cmluZykuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5lb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMudGFpbCA9PT0gXCJcIjtcbiAgfTtcblxuICAvKipcbiAgICogVHJpZXMgdG8gbWF0Y2ggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogUmV0dXJucyB0aGUgbWF0Y2hlZCB0ZXh0IGlmIGl0IGNhbiBtYXRjaCwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2UuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gKHJlKSB7XG4gICAgdmFyIG1hdGNoID0gdGhpcy50YWlsLm1hdGNoKHJlKTtcblxuICAgIGlmICghbWF0Y2ggfHwgbWF0Y2guaW5kZXggIT09IDApXG4gICAgICByZXR1cm4gJyc7XG5cbiAgICB2YXIgc3RyaW5nID0gbWF0Y2hbMF07XG5cbiAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKHN0cmluZy5sZW5ndGgpO1xuICAgIHRoaXMucG9zICs9IHN0cmluZy5sZW5ndGg7XG5cbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTa2lwcyBhbGwgdGV4dCB1bnRpbCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9uIGNhbiBiZSBtYXRjaGVkLiBSZXR1cm5zXG4gICAqIHRoZSBza2lwcGVkIHN0cmluZywgd2hpY2ggaXMgdGhlIGVudGlyZSB0YWlsIGlmIG5vIG1hdGNoIGNhbiBiZSBtYWRlLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuc2NhblVudGlsID0gZnVuY3Rpb24gKHJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWlsLnNlYXJjaChyZSksIG1hdGNoO1xuXG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgIGNhc2UgLTE6XG4gICAgICBtYXRjaCA9IHRoaXMudGFpbDtcbiAgICAgIHRoaXMudGFpbCA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDA6XG4gICAgICBtYXRjaCA9IFwiXCI7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgbWF0Y2ggPSB0aGlzLnRhaWwuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoaW5kZXgpO1xuICAgIH1cblxuICAgIHRoaXMucG9zICs9IG1hdGNoLmxlbmd0aDtcblxuICAgIHJldHVybiBtYXRjaDtcbiAgfTtcblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIHJlbmRlcmluZyBjb250ZXh0IGJ5IHdyYXBwaW5nIGEgdmlldyBvYmplY3QgYW5kXG4gICAqIG1haW50YWluaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBwYXJlbnQgY29udGV4dC5cbiAgICovXG4gIGZ1bmN0aW9uIENvbnRleHQodmlldywgcGFyZW50Q29udGV4dCkge1xuICAgIHRoaXMudmlldyA9IHZpZXcgPT0gbnVsbCA/IHt9IDogdmlldztcbiAgICB0aGlzLmNhY2hlID0geyAnLic6IHRoaXMudmlldyB9O1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50Q29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbnRleHQgdXNpbmcgdGhlIGdpdmVuIHZpZXcgd2l0aCB0aGlzIGNvbnRleHRcbiAgICogYXMgdGhlIHBhcmVudC5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiAodmlldykge1xuICAgIHJldHVybiBuZXcgQ29udGV4dCh2aWV3LCB0aGlzKTtcbiAgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGdpdmVuIG5hbWUgaW4gdGhpcyBjb250ZXh0LCB0cmF2ZXJzaW5nXG4gICAqIHVwIHRoZSBjb250ZXh0IGhpZXJhcmNoeSBpZiB0aGUgdmFsdWUgaXMgYWJzZW50IGluIHRoaXMgY29udGV4dCdzIHZpZXcuXG4gICAqL1xuICBDb250ZXh0LnByb3RvdHlwZS5sb29rdXAgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKG5hbWUgaW4gY2FjaGUpIHtcbiAgICAgIHZhbHVlID0gY2FjaGVbbmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgbmFtZXMsIGluZGV4O1xuXG4gICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICBpZiAobmFtZS5pbmRleE9mKCcuJykgPiAwKSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0LnZpZXc7XG4gICAgICAgICAgbmFtZXMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgICAgICAgd2hpbGUgKHZhbHVlICE9IG51bGwgJiYgaW5kZXggPCBuYW1lcy5sZW5ndGgpXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlW25hbWVzW2luZGV4KytdXTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgY29udGV4dC52aWV3ID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgdmFsdWUgPSBjb250ZXh0LnZpZXdbbmFtZV07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGNhY2hlW25hbWVdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKVxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKHRoaXMudmlldyk7XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgV3JpdGVyIGtub3dzIGhvdyB0byB0YWtlIGEgc3RyZWFtIG9mIHRva2VucyBhbmQgcmVuZGVyIHRoZW0gdG8gYVxuICAgKiBzdHJpbmcsIGdpdmVuIGEgY29udGV4dC4gSXQgYWxzbyBtYWludGFpbnMgYSBjYWNoZSBvZiB0ZW1wbGF0ZXMgdG9cbiAgICogYXZvaWQgdGhlIG5lZWQgdG8gcGFyc2UgdGhlIHNhbWUgdGVtcGxhdGUgdHdpY2UuXG4gICAqL1xuICBmdW5jdGlvbiBXcml0ZXIoKSB7XG4gICAgdGhpcy5jYWNoZSA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIENsZWFycyBhbGwgY2FjaGVkIHRlbXBsYXRlcyBpbiB0aGlzIHdyaXRlci5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmNhY2hlID0ge307XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiBgdGVtcGxhdGVgIGFuZCByZXR1cm5zIHRoZSBhcnJheSBvZiB0b2tlbnNcbiAgICogdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgcGFyc2UuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy5jYWNoZTtcbiAgICB2YXIgdG9rZW5zID0gY2FjaGVbdGVtcGxhdGVdO1xuXG4gICAgaWYgKHRva2VucyA9PSBudWxsKVxuICAgICAgdG9rZW5zID0gY2FjaGVbdGVtcGxhdGVdID0gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSwgdGFncyk7XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIaWdoLWxldmVsIG1ldGhvZCB0aGF0IGlzIHVzZWQgdG8gcmVuZGVyIHRoZSBnaXZlbiBgdGVtcGxhdGVgIHdpdGhcbiAgICogdGhlIGdpdmVuIGB2aWV3YC5cbiAgICpcbiAgICogVGhlIG9wdGlvbmFsIGBwYXJ0aWFsc2AgYXJndW1lbnQgbWF5IGJlIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZVxuICAgKiBuYW1lcyBhbmQgdGVtcGxhdGVzIG9mIHBhcnRpYWxzIHRoYXQgYXJlIHVzZWQgaW4gdGhlIHRlbXBsYXRlLiBJdCBtYXlcbiAgICogYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgaXMgdXNlZCB0byBsb2FkIHBhcnRpYWwgdGVtcGxhdGVzIG9uIHRoZSBmbHlcbiAgICogdGhhdCB0YWtlcyBhIHNpbmdsZSBhcmd1bWVudDogdGhlIG5hbWUgb2YgdGhlIHBhcnRpYWwuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpIHtcbiAgICB2YXIgdG9rZW5zID0gdGhpcy5wYXJzZSh0ZW1wbGF0ZSk7XG4gICAgdmFyIGNvbnRleHQgPSAodmlldyBpbnN0YW5jZW9mIENvbnRleHQpID8gdmlldyA6IG5ldyBDb250ZXh0KHZpZXcpO1xuICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCB0ZW1wbGF0ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIExvdy1sZXZlbCBtZXRob2QgdGhhdCByZW5kZXJzIHRoZSBnaXZlbiBhcnJheSBvZiBgdG9rZW5zYCB1c2luZ1xuICAgKiB0aGUgZ2l2ZW4gYGNvbnRleHRgIGFuZCBgcGFydGlhbHNgLlxuICAgKlxuICAgKiBOb3RlOiBUaGUgYG9yaWdpbmFsVGVtcGxhdGVgIGlzIG9ubHkgZXZlciB1c2VkIHRvIGV4dHJhY3QgdGhlIHBvcnRpb25cbiAgICogb2YgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHRoYXQgd2FzIGNvbnRhaW5lZCBpbiBhIGhpZ2hlci1vcmRlciBzZWN0aW9uLlxuICAgKiBJZiB0aGUgdGVtcGxhdGUgZG9lc24ndCB1c2UgaGlnaGVyLW9yZGVyIHNlY3Rpb25zLCB0aGlzIGFyZ3VtZW50IG1heVxuICAgKiBiZSBvbWl0dGVkLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5yZW5kZXJUb2tlbnMgPSBmdW5jdGlvbiAodG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSkge1xuICAgIHZhciBidWZmZXIgPSAnJztcblxuICAgIHZhciB0b2tlbiwgc3ltYm9sLCB2YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB2YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuICAgICAgc3ltYm9sID0gdG9rZW5bMF07XG5cbiAgICAgIGlmIChzeW1ib2wgPT09ICcjJykgdmFsdWUgPSB0aGlzLl9yZW5kZXJTZWN0aW9uKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICdeJykgdmFsdWUgPSB0aGlzLl9yZW5kZXJJbnZlcnRlZCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnPicpIHZhbHVlID0gdGhpcy5fcmVuZGVyUGFydGlhbCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnJicpIHZhbHVlID0gdGhpcy5fdW5lc2NhcGVkVmFsdWUodG9rZW4sIGNvbnRleHQpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAnbmFtZScpIHZhbHVlID0gdGhpcy5fZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ3RleHQnKSB2YWx1ZSA9IHRoaXMuX3Jhd1ZhbHVlKHRva2VuKTtcblxuICAgICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpXG4gICAgICAgIGJ1ZmZlciArPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3JlbmRlclNlY3Rpb24gPSBmdW5jdGlvbiAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBidWZmZXIgPSAnJztcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcmVuZGVyIGFuIGFyYml0cmFyeSB0ZW1wbGF0ZVxuICAgIC8vIGluIHRoZSBjdXJyZW50IGNvbnRleHQgYnkgaGlnaGVyLW9yZGVyIHNlY3Rpb25zLlxuICAgIGZ1bmN0aW9uIHN1YlJlbmRlcih0ZW1wbGF0ZSkge1xuICAgICAgcmV0dXJuIHNlbGYucmVuZGVyKHRlbXBsYXRlLCBjb250ZXh0LCBwYXJ0aWFscyk7XG4gICAgfVxuXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuO1xuXG4gICAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgICBmb3IgKHZhciBqID0gMCwgdmFsdWVMZW5ndGggPSB2YWx1ZS5sZW5ndGg7IGogPCB2YWx1ZUxlbmd0aDsgKytqKSB7XG4gICAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dC5wdXNoKHZhbHVlW2pdKSwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgICB9IGVsc2UgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICBpZiAodHlwZW9mIG9yaWdpbmFsVGVtcGxhdGUgIT09ICdzdHJpbmcnKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCB1c2UgaGlnaGVyLW9yZGVyIHNlY3Rpb25zIHdpdGhvdXQgdGhlIG9yaWdpbmFsIHRlbXBsYXRlJyk7XG5cbiAgICAgIC8vIEV4dHJhY3QgdGhlIHBvcnRpb24gb2YgdGhlIG9yaWdpbmFsIHRlbXBsYXRlIHRoYXQgdGhlIHNlY3Rpb24gY29udGFpbnMuXG4gICAgICB2YWx1ZSA9IHZhbHVlLmNhbGwoY29udGV4dC52aWV3LCBvcmlnaW5hbFRlbXBsYXRlLnNsaWNlKHRva2VuWzNdLCB0b2tlbls1XSksIHN1YlJlbmRlcik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3JlbmRlckludmVydGVkID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVXNlIEphdmFTY3JpcHQncyBkZWZpbml0aW9uIG9mIGZhbHN5LiBJbmNsdWRlIGVtcHR5IGFycmF5cy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4NlxuICAgIGlmICghdmFsdWUgfHwgKGlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA9PT0gMCkpXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9yZW5kZXJQYXJ0aWFsID0gZnVuY3Rpb24odG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzKSB7XG4gICAgaWYgKCFwYXJ0aWFscykgcmV0dXJuO1xuXG4gICAgdmFyIHZhbHVlID0gaXNGdW5jdGlvbihwYXJ0aWFscykgPyBwYXJ0aWFscyh0b2tlblsxXSkgOiBwYXJ0aWFsc1t0b2tlblsxXV07XG4gICAgaWYgKHZhbHVlICE9IG51bGwpXG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJUb2tlbnModGhpcy5wYXJzZSh2YWx1ZSksIGNvbnRleHQsIHBhcnRpYWxzLCB2YWx1ZSk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5fdW5lc2NhcGVkVmFsdWUgPSBmdW5jdGlvbih0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLl9lc2NhcGVkVmFsdWUgPSBmdW5jdGlvbih0b2tlbiwgY29udGV4dCkge1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiBtdXN0YWNoZS5lc2NhcGUodmFsdWUpO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuX3Jhd1ZhbHVlID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgICByZXR1cm4gdG9rZW5bMV07XG4gIH07XG5cbiAgbXVzdGFjaGUubmFtZSA9IFwibXVzdGFjaGUuanNcIjtcbiAgbXVzdGFjaGUudmVyc2lvbiA9IFwiMS4xLjBcIjtcbiAgbXVzdGFjaGUudGFncyA9IFsgXCJ7e1wiLCBcIn19XCIgXTtcblxuICAvLyBBbGwgaGlnaC1sZXZlbCBtdXN0YWNoZS4qIGZ1bmN0aW9ucyB1c2UgdGhpcyB3cml0ZXIuXG4gIHZhciBkZWZhdWx0V3JpdGVyID0gbmV3IFdyaXRlcigpO1xuXG4gIC8qKlxuICAgKiBDbGVhcnMgYWxsIGNhY2hlZCB0ZW1wbGF0ZXMgaW4gdGhlIGRlZmF1bHQgd3JpdGVyLlxuICAgKi9cbiAgbXVzdGFjaGUuY2xlYXJDYWNoZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jbGVhckNhY2hlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpbiB0aGUgZGVmYXVsdCB3cml0ZXIgYW5kIHJldHVybnMgdGhlXG4gICAqIGFycmF5IG9mIHRva2VucyBpdCBjb250YWlucy4gRG9pbmcgdGhpcyBhaGVhZCBvZiB0aW1lIGF2b2lkcyB0aGUgbmVlZCB0b1xuICAgKiBwYXJzZSB0ZW1wbGF0ZXMgb24gdGhlIGZseSBhcyB0aGV5IGFyZSByZW5kZXJlZC5cbiAgICovXG4gIG11c3RhY2hlLnBhcnNlID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCBhbmQgYHBhcnRpYWxzYCB1c2luZyB0aGVcbiAgICogZGVmYXVsdCB3cml0ZXIuXG4gICAqL1xuICBtdXN0YWNoZS5yZW5kZXIgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscyk7XG4gIH07XG5cbiAgLy8gVGhpcyBpcyBoZXJlIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSB3aXRoIDAuNC54LlxuICBtdXN0YWNoZS50b19odG1sID0gZnVuY3Rpb24gKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscywgc2VuZCkge1xuICAgIHZhciByZXN1bHQgPSBtdXN0YWNoZS5yZW5kZXIodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzKTtcblxuICAgIGlmIChpc0Z1bmN0aW9uKHNlbmQpKSB7XG4gICAgICBzZW5kKHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgZXNjYXBpbmcgZnVuY3Rpb24gc28gdGhhdCB0aGUgdXNlciBtYXkgb3ZlcnJpZGUgaXQuXG4gIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMjQ0XG4gIG11c3RhY2hlLmVzY2FwZSA9IGVzY2FwZUh0bWw7XG5cbiAgLy8gRXhwb3J0IHRoZXNlIG1haW5seSBmb3IgdGVzdGluZywgYnV0IGFsc28gZm9yIGFkdmFuY2VkIHVzYWdlLlxuICBtdXN0YWNoZS5TY2FubmVyID0gU2Nhbm5lcjtcbiAgbXVzdGFjaGUuQ29udGV4dCA9IENvbnRleHQ7XG4gIG11c3RhY2hlLldyaXRlciA9IFdyaXRlcjtcblxufSkpO1xuIiwiIyMjXG4jIEBjbGFzcyBTdGFja2xhLkJhc2VcbiMjI1xuY2xhc3MgQmFzZVxuXG4gIGNvbnN0cnVjdG9yOiAob3B0aW9ucyA9IHt9KSAtPlxuICAgIGRlYnVnID0gQGdldFBhcmFtcygnZGVidWcnKVxuICAgIGF0dHJzID0gYXR0cnMgb3Ige31cbiAgICBpZiBkZWJ1Z1xuICAgICAgQGRlYnVnID0gKGRlYnVnIGlzICd0cnVlJyBvciBkZWJ1ZyBpcyAnMScpXG4gICAgZWxzZSBpZiBhdHRycy5kZWJ1Z1xuICAgICAgQGRlYnVnID0gKGF0dHJzLmRlYnVnIGlzIG9uKVxuICAgIGVsc2VcbiAgICAgIEBkZWJ1ZyA9IGZhbHNlXG4gICAgQF9saXN0ZW5lcnMgPSBbXVxuXG4gIHRvU3RyaW5nOiAtPiAnQmFzZSdcblxuICBsb2c6IChtc2csIHR5cGUpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAZGVidWdcbiAgICB0eXBlID0gdHlwZSBvciAnaW5mbydcbiAgICBpZiB3aW5kb3cuY29uc29sZSBhbmQgd2luZG93LmNvbnNvbGVbdHlwZV1cbiAgICAgIHdpbmRvdy5jb25zb2xlW3R5cGVdIFwiWyN7QHRvU3RyaW5nKCl9XSAje21zZ31cIlxuICAgIHJldHVyblxuXG4gIG9uOiAodHlwZSwgY2FsbGJhY2spIC0+XG4gICAgaWYgIXR5cGUgb3IgIWNhbGxiYWNrXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JvdGggZXZlbnQgdHlwZSBhbmQgY2FsbGJhY2sgYXJlIHJlcXVpcmVkIHBhcmFtZXRlcnMnKVxuICAgIEBsb2cgJ29uKCkgLSBldmVudCBcXCcnICsgdHlwZSArICdcXCcgaXMgc3Vic2NyaWJlZCdcbiAgICBAX2xpc3RlbmVyc1t0eXBlXSA9IFtdIHVubGVzcyBAX2xpc3RlbmVyc1t0eXBlXVxuICAgIGNhbGxiYWNrLmluc3RhbmNlID0gQFxuICAgIEBfbGlzdGVuZXJzW3R5cGVdLnB1c2goY2FsbGJhY2spXG4gICAgY2FsbGJhY2tcblxuICBlbWl0OiAodHlwZSwgZGF0YSA9IFtdKSAtPlxuICAgIEBsb2cgXCJlbWl0KCkgLSBldmVudCAnI3t0eXBlfScgaXMgdHJpZ2dlcmVkXCJcbiAgICBkYXRhLnVuc2hpZnRcbiAgICAgIHR5cGU6IHR5cGVcbiAgICAgIHRhcmdldDogQFxuICAgIHRocm93IG5ldyBFcnJvcignTGFja3Mgb2YgdHlwZSBwYXJhbWV0ZXInKSB1bmxlc3MgdHlwZVxuICAgIGlmIEBfbGlzdGVuZXJzW3R5cGVdIGFuZCBAX2xpc3RlbmVyc1t0eXBlXS5sZW5ndGhcbiAgICAgIGZvciBpIG9mIEBfbGlzdGVuZXJzW3R5cGVdXG4gICAgICAgIEBfbGlzdGVuZXJzW3R5cGVdW2ldLmFwcGx5IEAsIGRhdGFcbiAgICBAXG5cbiAgZ2V0UGFyYW1zOiAoa2V5KSAtPlxuICAgIGhyZWYgPSBAZ2V0VXJsKClcbiAgICBwYXJhbXMgPSB7fVxuICAgIHBvcyA9IGhyZWYuaW5kZXhPZignPycpXG4gICAgQGxvZyAnZ2V0UGFyYW1zKCkgaXMgZXhlY3V0ZWQnXG4gICAgaWYgaHJlZi5pbmRleE9mKCcjJykgIT0gLTFcbiAgICAgIGhhc2hlcyA9IGhyZWYuc2xpY2UocG9zICsgMSwgaHJlZi5pbmRleE9mKCcjJykpLnNwbGl0KCcmJylcbiAgICBlbHNlXG4gICAgICBoYXNoZXMgPSBocmVmLnNsaWNlKHBvcyArIDEpLnNwbGl0KCcmJylcbiAgICBmb3IgaSBvZiBoYXNoZXNcbiAgICAgIGhhc2ggPSBoYXNoZXNbaV0uc3BsaXQoJz0nKVxuICAgICAgcGFyYW1zW2hhc2hbMF1dID0gaGFzaFsxXVxuICAgIGlmIGtleSB0aGVuIHBhcmFtc1trZXldIGVsc2UgcGFyYW1zXG5cbiAgZ2V0VXJsOiAtPiB3aW5kb3cubG9jYXRpb24uaHJlZlxuXG4jIFByb21vdGUgdG8gZ2xvYmFsXG53aW5kb3cuU3RhY2tsYSA9IHt9IHVubGVzcyB3aW5kb3cuU3RhY2tsYVxud2luZG93LlN0YWNrbGEuQmFzZSA9IEJhc2VcblxubW9kdWxlLmV4cG9ydHMgPSBCYXNlXG5cbiIsIkJhc2UgPSByZXF1aXJlKCcuL2Jhc2UuY29mZmVlJylcblxuY2xhc3MgSW1hZ2VTaXplIGV4dGVuZHMgQmFzZVxuXG4gIGNvbnN0cnVjdG9yOiAoZWwsIGNhbGxiYWNrKSAtPlxuICAgIHN1cGVyKClcbiAgICBAaW5pdChlbClcbiAgICBAYmluZCgpXG4gICAgQHJlbmRlcihjYWxsYmFjaylcbiAgICByZXR1cm4gQFxuXG4gIHRvU3RyaW5nOiAoKSAtPiAnSW1hZ2VTaXplJ1xuXG4gIGluaXQ6IChlbCkgLT5cbiAgICBAZWwgPSAkKGVsKVswXVxuICAgIEBjb21wbGV0ZSA9IEBlbC5jb21wbGV0ZVxuICAgIEBkYXRhID0ge31cbiAgICBAX3RpbWVyID0gbnVsbFxuICAgIEBkYXRhLndpZHRoID0gQGVsLndpZHRoXG4gICAgQGRhdGEuaGVpZ2h0ID0gQGVsLmhlaWdodFxuXG4gIGJpbmQ6IC0+XG4gICAgQGxvZyAnYmluZCgpIGlzIGV4ZWN1dGVkJ1xuICAgICMgS2VlcCBhbiBleWUgb24gcmVzaXplIGV2ZW50XG4gICAgJCh3aW5kb3cpLnJlc2l6ZSAoZSkgPT5cbiAgICAgIGlzRXF1YWwgPSBAZWwud2lkdGggaXMgQGRhdGEud2lkdGggYW5kIEBlbC5oZWlnaHQgaXMgQGRhdGEuaGVpZ2h0XG4gICAgICByZXR1cm4gaWYgaXNFcXVhbFxuICAgICAgJC5leHRlbmQgQGRhdGEsIHtcbiAgICAgICAgd2lkdGg6IEBlbC53aWR0aFxuICAgICAgICBoZWlnaHQ6IEBlbC5oZWlnaHRcbiAgICAgICAgd2lkdGhSYXRpbzogQGVsLndpZHRoIC8gQGRhdGEubmF0dXJhbFdpZHRoXG4gICAgICAgIGhlaWdodFJhdGlvOiBAZWwuaGVpZ2h0IC8gQGRhdGEubmF0dXJhbEhlaWdodFxuICAgICAgfVxuICAgICAgQGxvZyAnaGFuZGxlUmVzaXplKCkgaXMgZXhlY3V0ZWQnXG4gICAgICBALmVtaXQoJ2NoYW5nZScsIFtAZGF0YV0pXG5cbiAgcmVuZGVyOiAoY2FsbGJhY2spIC0+XG4gICAgQGxvZyAncmVuZGVyKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBJbWFnZSBMb2FkZWRcbiAgICBpZiBAY29tcGxldGVcbiAgICAgIGltZyA9IG5ldyBJbWFnZSgpXG4gICAgICBpbWcuc3JjID0gQGVsLnNyY1xuICAgICAgQGxvZyBcIkltYWdlICcje0BlbC5zcmN9JyBpcyBsb2FkZWRcIlxuICAgICAgQGRhdGEubmF0dXJhbFdpZHRoID0gaW1nLndpZHRoXG4gICAgICBAZGF0YS5uYXR1cmFsSGVpZ2h0ID0gaW1nLmhlaWdodFxuICAgICAgY2FsbGJhY2sodHJ1ZSwgQGRhdGEpXG4gICAgIyBJbWFnZSBMb2FkaW5nXG4gICAgZWxzZVxuICAgICAgQGxvZyBcIkltYWdlICcje0BlbC5zcmN9JyBpcyBOT1QgcmVhZHlcIlxuICAgICAgaW1nID0gbmV3IEltYWdlKClcbiAgICAgIGltZy5zcmMgPSBAZWwuc3JjXG4gICAgICBpbWcub25sb2FkID0gKGUpID0+XG4gICAgICAgIEBsb2cgXCJJbWFnZSAnI3tpbWcuc3JjfScgaXMgbG9hZGVkXCJcbiAgICAgICAgQGRhdGEubmF0dXJhbFdpZHRoID0gaW1nLndpZHRoXG4gICAgICAgIEBkYXRhLm5hdHVyYWxIZWlnaHQgPSBpbWcuaGVpZ2h0XG4gICAgICAgIGNhbGxiYWNrKHRydWUsIEBkYXRhKVxuICAgICAgaW1nLm9uZXJyb3IgPSAoZSkgPT5cbiAgICAgICAgQGxvZyBcIkltYWdlICcje2ltZy5zcmN9JyBpcyBmYWlsZWQgdG8gbG9hZFwiXG4gICAgICAgIGNhbGxiYWNrKGZhbHNlLCBAZGF0YSlcblxuXG53aW5kb3cuU3RhY2tsYSA9IHt9IHVubGVzcyB3aW5kb3cuU3RhY2tsYVxuU3RhY2tsYS5nZXRJbWFnZVNpemUgPSAoZWwsIGNhbGxiYWNrKSAtPlxuICBuZXcgSW1hZ2VTaXplKGVsLCBjYWxsYmFjaylcblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZXQ6IChlbCwgY2FsbGJhY2spIC0+XG4gICAgbmV3IEltYWdlU2l6ZShlbCwgY2FsbGJhY2spXG5cbiIsIk11c3RhY2hlID0gcmVxdWlyZSgnbXVzdGFjaGUnKVxuQWxpZ25NZSA9IHJlcXVpcmUoJ2FsaWdubWUnKVxuQmFzZSA9IHJlcXVpcmUoJy4vYmFzZS5jb2ZmZWUnKVxuSW1hZ2VTaXplID0gcmVxdWlyZSgnLi9pbWFnZS5jb2ZmZWUnKVxuXG5BVFRSUyA9XG4gIE5BTUU6ICdUYWdsYSdcbiAgUFJFRklYOiAndGFnbGEtJ1xuICBEUkFHX0FUVFI6XG4gICAgY29udGFpbm1lbnQ6ICcudGFnbGEnXG4gICAgaGFuZGxlOiAnLnRhZ2xhLWljb24nXG4gIFNFTEVDVF9BVFRSOlxuICAgIGFsbG93X3NpbmdsZV9kZXNlbGVjdDogb25cbiAgICBwbGFjZWhvbGRlcl90ZXh0X3NpbmdsZTogJ1NlbGVjdCBhbiBvcHRpb24nXG4gICAgd2lkdGg6ICczMTBweCdcbiAgRk9STV9URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtZm9ybS13cmFwcGVyXCI+J1xuICAgICcgICAgPGZvcm0gY2xhc3M9XCJ0YWdsYS1mb3JtXCI+J1xuICAgICcgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1mb3JtLXRpdGxlXCI+J1xuICAgICcgICAgICAgICAgICBTZWxlY3QgWW91ciBQcm9kdWN0J1xuICAgICcgICAgICAgICAgICA8YSBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApO1wiIGNsYXNzPVwidGFnbGEtZm9ybS1jbG9zZVwiPsOXPC9hPidcbiAgICAnICAgICAgICA8L2Rpdj4nXG4gICAgJyAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwieFwiPidcbiAgICAnICAgICAgICA8aW5wdXQgdHlwZT1cImhpZGRlblwiIG5hbWU9XCJ5XCI+J1xuICAgICcgICAgICAgIDxzZWxlY3QgZGF0YS1wbGFjZWhvbGRlcj1cIlNlYXJjaFwiIHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInRhZ1wiIGNsYXNzPVwidGFnbGEtc2VsZWN0IGNob3Nlbi1zZWxlY3RcIiBwbGFjZWhvbGRlcj1cIlNlYXJjaFwiPidcbiAgICAnICAgICAgICAgICAgPG9wdGlvbj48L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIxXCI+Q29ja2llPC9vcHRpb24+J1xuICAgICcgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMlwiPktpd2k8L29wdGlvbj4nXG4gICAgJyAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIzXCI+QnVkZHk8L29wdGlvbj4nXG4gICAgJyAgICAgICAgPC9zZWxlY3Q+J1xuICAgICcgICAgPC9mb3JtPidcbiAgICAnPC9kaXY+J1xuICBdLmpvaW4oJ1xcbicpXG4gIFRBR19URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtdGFnXCI+J1xuICAgICcgICAgPGkgY2xhc3M9XCJ0YWdsYS1pY29uIGZzIGZzLXRhZzJcIj48L2k+J1xuICAgICcgICAgPGRpdiBjbGFzcz1cInRhZ2xhLWRpYWxvZ1wiPidcbiAgICAnICAgIHt7I3Byb2R1Y3R9fSdcbiAgICAnICAgICAgICB7eyNpbWFnZV9zbWFsbF91cmx9fSdcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLWltYWdlXCI+J1xuICAgICcgICAgICAgICAgPGltZyBzcmM9XCJ7e2ltYWdlX3NtYWxsX3VybH19XCI+J1xuICAgICcgICAgICAgIDwvZGl2PidcbiAgICAnICAgICAgICB7ey9pbWFnZV9zbWFsbF91cmx9fSdcbiAgICAnICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLXRleHRcIj4nXG4gICAgJyAgICAgICAgICA8ZGl2IGNsYXNzPVwidGFnbGEtZGlhbG9nLWVkaXRcIj4nXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInRhZ2xhLXRhZy1saW5rIHRhZ2xhLXRhZy1lZGl0LWxpbmtcIj4nXG4gICAgJyAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmcyBmcy1wZW5jaWxcIj48L2k+IEVkaXQnXG4gICAgJyAgICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cInRhZ2xhLXRhZy1saW5rIHRhZ2xhLXRhZy1kZWxldGUtbGlua1wiPidcbiAgICAnICAgICAgICAgICAgICA8aSBjbGFzcz1cImZzIGZzLWNyb3NzM1wiPjwvaT4gRGVsZXRlJ1xuICAgICcgICAgICAgICAgICA8L2E+J1xuICAgICcgICAgICAgICAgPC9kaXY+J1xuICAgICcgICAgICAgICAgPGgyIGNsYXNzPVwidGFnbGEtZGlhbG9nLXRpdGxlXCI+e3t0YWd9fTwvaDI+J1xuICAgICcgICAgICAgICAge3sjcHJpY2V9fSdcbiAgICAnICAgICAgICAgIDxkaXYgY2xhc3M9XCJ0YWdsYS1kaWFsb2ctcHJpY2VcIj57e3ByaWNlfX08L2Rpdj4nXG4gICAgJyAgICAgICAgICB7ey9wcmljZX19J1xuICAgICcgICAgICAgICAge3sjZGVzY3JpcHRpb259fSdcbiAgICAnICAgICAgICAgIDxwIGNsYXNzPVwidGFnbGEtZGlhbG9nLWRlc2NyaXB0aW9uXCI+e3tkZXNjcmlwdGlvbn19PC9wPidcbiAgICAnICAgICAgICAgIHt7L2Rlc2NyaXB0aW9ufX0nXG4gICAgJyAgICAgICAgICB7eyNjdXN0b21fdXJsfX0nXG4gICAgJyAgICAgICAgICA8YSBocmVmPVwie3tjdXN0b21fdXJsfX1cIiBjbGFzcz1cInRhZ2xhLWRpYWxvZy1idXR0b24gc3QtYnRuIHN0LWJ0bi1zdWNjZXNzIHN0LWJ0bi1zb2xpZFwiIHRhcmdldD1cIlwie3t0YXJnZXR9fVwiPidcbiAgICAnICAgICAgICAgICAgPGkgY2xhc3M9XCJmcyBmcy1jYXJ0XCI+PC9pPidcbiAgICAnICAgICAgICAgICAgQnV5IE5vdydcbiAgICAnICAgICAgICAgIDwvYT4nXG4gICAgJyAgICAgICAgICB7ey9jdXN0b21fdXJsfX0nXG4gICAgJyAgICAgICAgPC9kaXY+J1xuICAgICcgICAge3svcHJvZHVjdH19J1xuICAgICcgICAgPC9kaXY+J1xuICAgICcgICAge3t7Zm9ybV9odG1sfX19J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcbiAgTkVXX1RBR19URU1QTEFURTogW1xuICAgICc8ZGl2IGNsYXNzPVwidGFnbGEtdGFnXCI+J1xuICAgICcgICAgPGkgY2xhc3M9XCJ0YWdsYS1pY29uIGZzIGZzLXRhZzJcIj48L2k+J1xuICAgICc8L2Rpdj4nXG4gIF0uam9pbignXFxuJylcblxuY2xhc3MgVGFnbGEgZXh0ZW5kcyBCYXNlXG4gIGNvbnN0cnVjdG9yOiAoJHdyYXBwZXIsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICBzdXBlcigpXG4gICAgQHdyYXBwZXIgPSAkKCR3cmFwcGVyKVxuICAgIEBpbml0KG9wdGlvbnMpXG4gICAgQGJpbmQoKVxuXG4kLmV4dGVuZChUYWdsYSwgQVRUUlMpXG5cbnByb3RvID1cbiAgIyMjIyMjIyMjIyMjIyNcbiAgIyBVdGlsaXRpZXNcbiAgIyMjIyMjIyMjIyMjIyNcbiAgdG9TdHJpbmc6IC0+ICdUYWdsYSdcblxuICAjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBQcml2YXRlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgSW5pdGlhbGl6ZSBkcmFnIGFuZCBzZWxlY3QgbGlicyBmb3IgYSBzaW5nbGUgdGFnXG4gIF9hcHBseVRvb2xzOiAoJHRhZykgLT5cbiAgICBAbG9nICdfYXBwbHlUb29scygpIGlzIGV4ZWN1dGVkJ1xuICAgIGRyYWcgPSBuZXcgRHJhZ2dhYmlsbHkoJHRhZ1swXSwgVGFnbGEuRFJBR19BVFRSKVxuICAgIGRyYWcub24gJ2RyYWdFbmQnLCAkLnByb3h5KEBoYW5kbGVUYWdNb3ZlLCBAKVxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknLCBkcmFnKVxuICAgICMgVXBkYXRlIGZvcm1cbiAgICB0YWcgPSAkdGFnLmRhdGEoJ3RhZy1kYXRhJylcbiAgICAkZm9ybSA9ICR0YWcuZmluZCgnLnRhZ2xhLWZvcm0nKVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXhdJykudmFsKHRhZy54KVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXldJykudmFsKHRhZy55KVxuICAgICRmb3JtLmZpbmQoXCJbbmFtZT10YWddIG9wdGlvblt2YWx1ZT0je3RhZy52YWx1ZX1dXCIpLmF0dHIoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJylcbiAgICAkc2VsZWN0ID0gJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JylcbiAgICAkc2VsZWN0LmNob3NlbjIoVGFnbGEuU0VMRUNUX0FUVFIpXG4gICAgJHNlbGVjdC5vbiAnY2hhbmdlJywgJC5wcm94eShAaGFuZGxlVGFnQ2hhbmdlLCBAKVxuICAgICRzZWxlY3Qub24gJ2Nob3NlbjpoaWRpbmdfZHJvcGRvd24nLCAoZSwgcGFyYW1zKSAtPlxuICAgICAgJHNlbGVjdC50cmlnZ2VyKCdjaG9zZW46b3BlbicpXG5cbiAgX2Rpc2FibGVEcmFnOiAoJGV4Y2VwdCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdfZGlzYWJsZURyYWcoKSBpcyBleGVjdXRlZCdcbiAgICAkZXhjZXB0ID0gJCgkZXhjZXB0KVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBAXG4gICAgICAkKEApLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGlzYWJsZSgpO1xuXG4gIF9lbmFibGVEcmFnOiAoJGV4Y2VwdCkgLT5cbiAgICByZXR1cm4gaWYgQGVkaXRvciBpcyBvZmZcbiAgICBAbG9nICdfZW5hYmxlRHJhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICRleGNlcHQgPSAkKCRleGNlcHQpXG4gICAgJCgnLnRhZ2xhLXRhZycpLmVhY2ggLT5cbiAgICAgIHJldHVybiBpZiAkZXhjZXB0WzBdIGlzIEBcbiAgICAgICQoQCkuZGF0YSgnZHJhZ2dhYmlsbHknKS5lbmFibGUoKTtcblxuICBfcmVtb3ZlVG9vbHM6ICgkdGFnKSAtPlxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5kZXN0cm95KClcbiAgICAkc2VsZWN0ID0gJHRhZy5maW5kKCcudGFnbGEtc2VsZWN0JylcbiAgICAkc2VsZWN0LnNob3coKS5yZW1vdmVDbGFzcyAnY2h6bi1kb25lJ1xuICAgICRzZWxlY3QubmV4dCgpLnJlbW92ZSgpXG5cbiAgX2dldFBvc2l0aW9uOiAoJHRhZykgLT5cbiAgICBAbG9nICdfZ2V0UG9zaXRpb24oKSBpcyBleGVjdXRlZCdcbiAgICBwb3MgPSAkdGFnLnBvc2l0aW9uKClcbiAgICB4ID0gKHBvcy5sZWZ0ICsgKCR0YWcud2lkdGgoKSAvIDIpKSAvIEBjdXJyZW50V2lkdGggKiBAbmF0dXJhbFdpZHRoXG4gICAgeSA9IChwb3MudG9wICsgKCR0YWcuaGVpZ2h0KCkgLyAyKSkgLyBAY3VycmVudEhlaWdodCAqIEBuYXR1cmFsSGVpZ2h0XG4gICAgaWYgQHVuaXQgaXMgJ3BlcmNlbnQnXG4gICAgICB4ID0geCAvIEBuYXR1cmFsV2lkdGggKiAxMDBcbiAgICAgIHkgPSB5IC8gQG5hdHVyYWxIZWlnaHQgKiAxMDBcbiAgICBbeCwgeV1cblxuICBfdXBkYXRlSW1hZ2VTaXplOiAoZGF0YSkgLT5cbiAgICBAbG9nICdfdXBkYXRlSW1hZ2VTaXplKCkgaXMgZXhlY3V0ZWQnXG4gICAgQG5hdHVyYWxXaWR0aCA9IGRhdGEubmF0dXJhbFdpZHRoXG4gICAgQG5hdHVyYWxIZWlnaHQgPSBkYXRhLm5hdHVyYWxIZWlnaHRcbiAgICBAY3VycmVudFdpZHRoID0gZGF0YS53aWR0aFxuICAgIEBjdXJyZW50SGVpZ2h0ID0gZGF0YS5oZWlnaHRcbiAgICBAd2lkdGhSYXRpbyA9IGRhdGEud2lkdGhSYXRpb1xuICAgIEBoZWlnaHRSYXRpbyA9IGRhdGEuaGVpZ2h0UmF0aW9cblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIEV2ZW50IEhhbmRsZXJzXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIGhhbmRsZVRhZ0NsaWNrOiAoZSkgLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgcmV0dXJuIHVubGVzcyAkKGUudGFyZ2V0KS5oYXNDbGFzcygndGFnbGEtaWNvbicpXG4gICAgQGxvZyAnaGFuZGxlVGFnQ2xpY2soKSBpcyBleGVjdXRlZCdcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpXG4gICAgQHNocmluaygkdGFnKVxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1hY3RpdmUnKVxuICAgICR0YWcuZGF0YSgnZHJhZ2dhYmlsbHknKS5lbmFibGUoKVxuXG4gIGhhbmRsZVRhZ0NoYW5nZTogKGUsIHBhcmFtcykgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdDaGFuZ2UoKSBpcyBleGVjdXRlZCdcbiAgICAkc2VsZWN0ID0gJChlLnRhcmdldClcbiAgICAkdGFnID0gJHNlbGVjdC5wYXJlbnRzKCcudGFnbGEtdGFnJylcbiAgICBpc05ldyA9ICR0YWcuaGFzQ2xhc3MoJ3RhZ2xhLXRhZy1uZXcnKVxuICAgICR0YWcucmVtb3ZlQ2xhc3MgJ3RhZ2xhLXRhZy1jaG9vc2UgdGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctbmV3J1xuICAgIGRhdGEgPSAkLmV4dGVuZCh7fSwgJHRhZy5kYXRhKCd0YWctZGF0YScpKVxuICAgIGRhdGEubGFiZWwgPSAkc2VsZWN0LmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLnRleHQoKVxuICAgIGRhdGEudmFsdWUgPSAkc2VsZWN0LnZhbCgpIHx8IGRhdGEubGFiZWxcbiAgICBzZXJpYWxpemUgPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJykuc2VyaWFsaXplKClcbiAgICAjIEFsaWduXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuICAgIGlmIGlzTmV3XG4gICAgICBAZW1pdCgnYWRkJywgW2RhdGEsIHNlcmlhbGl6ZSwgJHRhZ10pXG4gICAgZWxzZVxuICAgICAgQGVtaXQoJ2NoYW5nZScsIFtkYXRhLCBzZXJpYWxpemUsICR0YWddKVxuXG4gIGhhbmRsZVRhZ0RlbGV0ZTogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnRGVsZXRlKCkgaXMgZXhlY3V0ZWQnXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgJHRhZyA9ICQoZS5jdXJyZW50VGFyZ2V0KS5wYXJlbnRzKCcudGFnbGEtdGFnJylcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICAkdGFnLmZhZGVPdXQgPT5cbiAgICAgIEBfcmVtb3ZlVG9vbHMoJHRhZylcbiAgICAgICR0YWcucmVtb3ZlKClcbiAgICAgIEBlbWl0KCdkZWxldGUnLCBbZGF0YV0pXG5cbiAgaGFuZGxlVGFnRWRpdDogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnRWRpdCgpIGlzIGV4ZWN1dGVkJ1xuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpLnBhcmVudHMoJy50YWdsYS10YWcnKVxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1jaG9vc2UnKVxuICAgIEB3cmFwcGVyLmFkZENsYXNzKCd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZycpXG4gICAgQF9kaXNhYmxlRHJhZygkdGFnKVxuICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLnRyaWdnZXIoJ2Nob3NlbjpvcGVuJylcbiAgICBkYXRhID0gJC5leHRlbmQoe30sICR0YWcuZGF0YSgndGFnLWRhdGEnKSlcbiAgICBAZW1pdCgnZWRpdCcsIFtkYXRhLCAkdGFnXSlcblxuICBoYW5kbGVUYWdNb3ZlOiAoaW5zdGFuY2UsIGV2ZW50LCBwb2ludGVyKSAtPlxuICAgIEBsb2cgJ2hhbmRsZVRhZ01vdmUoKSBpcyBleGVjdXRlZCdcblxuICAgICR0YWcgPSAkKGluc3RhbmNlLmVsZW1lbnQpXG4gICAgZGF0YSA9ICR0YWcuZGF0YSgndGFnLWRhdGEnKVxuICAgIHBvcyA9IEBfZ2V0UG9zaXRpb24oJHRhZylcbiAgICBkYXRhLnggPSBwb3NbMF1cbiAgICBkYXRhLnkgPSBwb3NbMV1cblxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgJGZvcm0uZmluZCgnW25hbWU9eF0nKS52YWwoZGF0YS54KVxuICAgICRmb3JtLmZpbmQoJ1tuYW1lPXldJykudmFsKGRhdGEueSlcbiAgICBzZXJpYWxpemUgPSAkdGFnLmZpbmQoJy50YWdsYS1mb3JtJykuc2VyaWFsaXplKClcblxuICAgIEBsYXN0RHJhZ1RpbWUgPSBuZXcgRGF0ZSgpXG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCBkYXRhKVxuICAgIGlzTmV3ID0gaWYgZGF0YS5pZCB0aGVuIG5vIGVsc2UgeWVzXG4gICAgIyBBbGlnblxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScpLmFsaWduKClcbiAgICAkdGFnLmRhdGEoJ2FsaWduLWRpYWxvZycpLmFsaWduKClcbiAgICBAZW1pdCgnbW92ZScsIFtkYXRhLCBzZXJpYWxpemUsICR0YWcsIGlzTmV3XSlcblxuICBoYW5kbGVUYWdNb3VzZUVudGVyOiAoZSkgLT5cbiAgICBAbG9nICdoYW5kbGVUYWdNb3VzZUVudGVyJ1xuICAgICR0YWcgPSAkKGUuY3VycmVudFRhcmdldClcblxuICAgICMgQ2xlYXIgZGVsYXllZCBsZWF2ZSB0aW1lclxuICAgIHRpbWVyID0gICR0YWcuZGF0YSgndGltZXInKVxuICAgIGNsZWFyVGltZW91dCh0aW1lcikgaWYgdGltZXJcbiAgICAkdGFnLnJlbW92ZURhdGEoJ3RpbWVyJylcblxuICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1ob3ZlcicpXG4gICAgIyBBbGlnblxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJykuYWxpZ24oKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScpLmFsaWduKClcbiAgICBAZW1pdCgnaG92ZXInLCBbJHRhZ10pXG5cbiAgaGFuZGxlVGFnTW91c2VMZWF2ZTogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlVGFnTW91c2VMZWF2ZSdcbiAgICAkdGFnID0gJChlLmN1cnJlbnRUYXJnZXQpXG5cbiAgICAjIENsZWFyIGRlbGF5ZWQgbGVhdmUgdGltZXJcbiAgICB0aW1lciA9ICR0YWcuZGF0YSgndGltZXInKVxuICAgIGNsZWFyVGltZW91dCh0aW1lcikgaWYgdGltZXJcbiAgICAkdGFnLnJlbW92ZURhdGEoJ3RpbWVyJylcblxuICAgICMgU2F2ZSBkZWxheWVkIGxlYXZlIHRpbWVyXG4gICAgdGltZXIgPSBzZXRUaW1lb3V0IC0+XG4gICAgICAkdGFnLnJlbW92ZUNsYXNzKCd0YWdsYS10YWctaG92ZXInKVxuICAgICwgMzAwXG4gICAgJHRhZy5kYXRhKCd0aW1lcicsIHRpbWVyKVxuXG4gIGhhbmRsZVdyYXBwZXJDbGljazogKGUpIC0+XG4gICAgQGxvZyAnaGFuZGxlV3JhcHBlckNsaWNrKCkgaXMgZXhlY3V0ZWQnXG4gICAgIyBIYWNrIHRvIGF2b2lkIHRyaWdnZXJpbmcgY2xpY2sgZXZlbnRcbiAgICBAc2hyaW5rKCkgaWYgKG5ldyBEYXRlKCkgLSBAbGFzdERyYWdUaW1lID4gMTApXG5cbiAgaGFuZGxlSW1hZ2VSZXNpemU6IChlLCBkYXRhKSAtPlxuICAgIEBsb2cgJ2hhbmRsZUltYWdlUmVzaXplKCkgaXMgZXhlY3V0ZWQnXG4gICAgcHJldldpZHRoID0gQGN1cnJlbnRXaWR0aFxuICAgIHByZXZIZWlnaHQgPSBAY3VycmVudEhlaWdodFxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICAkdGFnID0gJChAKVxuICAgICAgcG9zID0gJHRhZy5wb3NpdGlvbigpXG4gICAgICB4ID0gKHBvcy5sZWZ0IC8gcHJldldpZHRoKSAqIGRhdGEud2lkdGhcbiAgICAgIHkgPSAocG9zLnRvcCAvIHByZXZIZWlnaHQpICogZGF0YS5oZWlnaHRcbiAgICAgICR0YWcuY3NzXG4gICAgICAgIGxlZnQ6IFwiI3t4fXB4XCJcbiAgICAgICAgdG9wOiBcIiN7eX1weFwiXG4gICAgQF91cGRhdGVJbWFnZVNpemUoZGF0YSlcblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICAjIFB1YmxpYyBNZXRob2RzXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gIGFkZFRhZzogKHRhZyA9IHt9KSAtPlxuICAgIEBsb2cgJ2FkZFRhZygpIGlzIGV4ZWN1dGVkJ1xuICAgICMgUmVuZGVyIHRhZyBlbGVtZW50IGJ5IHByb3ZpZGVkIHRlbXBsYXRlXG4gICAgdGFnID0gJC5leHRlbmQoe30sIHRhZylcbiAgICB0YWcuZm9ybV9odG1sID0gQGZvcm1IdG1sXG4gICAgJHRhZyA9ICQoTXVzdGFjaGUucmVuZGVyKEB0YWdUZW1wbGF0ZSwgdGFnKSlcbiAgICBpc05ldyA9ICghdGFnLnggYW5kICF0YWcueSlcblxuICAgICMgUmVtb3ZlIHByZXZpb3VzIGFkZGVkIG5ldyB0YWcgaWYgaXQgaGFzbid0IGJlaW5nIHNldFxuICAgIGlmIGlzTmV3XG4gICAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgICBpZiAkKEApLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JykgYW5kICEkKEApLmZpbmQoJ1tuYW1lPXRhZ10nKS52YWwoKVxuICAgICAgICAgICQoQCkuZmFkZU91dCA9PlxuICAgICAgICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuXG4gICAgQHdyYXBwZXIuYXBwZW5kKCR0YWcpXG4gICAgaWYgaXNOZXcgIyBEZWZhdWx0IHBvc2l0aW9uIGZvciBuZXcgdGFnXG4gICAgICAjIFRPRE8gLSBOZWVkIGEgc21hcnQgd2F5IHRvIGF2b2lkIGNvbGxpc2lvblxuICAgICAgdGFnLnggPSA1MFxuICAgICAgdGFnLnkgPSA1MFxuICAgICAgJHRhZy5hZGRDbGFzcyAndGFnbGEtdGFnLW5ldyB0YWdsYS10YWctYWN0aXZlIHRhZ2xhLXRhZy1jaG9vc2UnXG4gICAgaWYgQHVuaXQgaXMgJ3BlcmNlbnQnXG4gICAgICB4ID0gQGN1cnJlbnRXaWR0aCAqICh0YWcueCAvIDEwMClcbiAgICAgIHkgPSBAY3VycmVudEhlaWdodCAqICh0YWcueSAvIDEwMClcbiAgICBlbHNlXG4gICAgICB4ID0gdGFnLnggKiBAd2lkdGhSYXRpb1xuICAgICAgeSA9IHRhZy55ICogQGhlaWdodFJhdGlvXG4gICAgb2Zmc2V0WCA9ICR0YWcub3V0ZXJXaWR0aCgpIC8gMlxuICAgIG9mZnNldFkgPSAkdGFnLm91dGVySGVpZ2h0KCkgLyAyXG4gICAgJHRhZy5jc3NcbiAgICAgICdsZWZ0JzogXCIje3ggLSBvZmZzZXRYfXB4XCJcbiAgICAgICd0b3AnOiBcIiN7eSAtIG9mZnNldFl9cHhcIlxuICAgICMgU2F2ZSB0YWcgZGF0YSB0byBkYXRhIGF0dHIgZm9yIGVhc3kgYWNjZXNzXG4gICAgJHRhZy5kYXRhKCd0YWctZGF0YScsIHRhZylcblxuICAgICMgQWxpZ25NZVxuICAgICRkaWFsb2cgPSAkdGFnLmZpbmQoJy50YWdsYS1kaWFsb2cnKVxuICAgICRmb3JtID0gJHRhZy5maW5kKCcudGFnbGEtZm9ybScpXG4gICAgYXR0cnMgPVxuICAgICAgcmVsYXRlVG86ICR0YWdcbiAgICAgIGNvbnN0cmFpbkJ5OiBAd3JhcHBlclxuICAgICAgc2tpcFZpZXdwb3J0OiBmYWxzZVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZGlhbG9nJywgbmV3IEFsaWduTWUoJGRpYWxvZywgYXR0cnMpKVxuICAgICR0YWcuZGF0YSgnYWxpZ24tZm9ybScsIG5ldyBBbGlnbk1lKCRmb3JtLCBhdHRycykpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1kaWFsb2cnKS5hbGlnbigpXG4gICAgJHRhZy5kYXRhKCdhbGlnbi1mb3JtJykuYWxpZ24oKVxuXG4gICAgIyBSZW5kZXIgdGFnIGVkaXRvciB0b29sc1xuICAgIGlmIEBlZGl0b3JcbiAgICAgIEBfYXBwbHlUb29scygkdGFnKVxuICAgICAgaWYgaXNOZXdcbiAgICAgICAgJHRhZy5kYXRhKCdkcmFnZ2FiaWxseScpLmVuYWJsZSgpXG4gICAgICAgICR0YWcuYWRkQ2xhc3MoJ3RhZ2xhLXRhZy1jaG9vc2UnKVxuICAgICAgICBzZXRUaW1lb3V0ID0+XG4gICAgICAgICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmctc2VsZWN0aW5nJylcbiAgICAgICAgICAkdGFnLmZpbmQoJy50YWdsYS1zZWxlY3QnKS50cmlnZ2VyICdjaG9zZW46b3BlbidcbiAgICAgICAgICBAX2Rpc2FibGVEcmFnKCR0YWcpXG4gICAgICAgICAgQGVtaXQoJ25ldycsIFskdGFnXSlcbiAgICAgICAgLCAxMDBcblxuICBkZWxldGVUYWc6ICgkdGFnKSAtPlxuICAgIEBsb2cgJ2RlbGV0ZVRhZygpIGlzIGV4ZWN1dGVkJ1xuXG4gIGVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb25cbiAgICBAbG9nICdlZGl0KCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXIuYWRkQ2xhc3MoJ3RhZ2xhLWVkaXRpbmcnKVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+IEBfYXBwbHlUb29scygkKEApKVxuICAgIEBlZGl0b3IgPSBvblxuXG4gIGdldFRhZ3M6IC0+XG4gICAgQGxvZyAnZ2V0VGFncygpIGlzIGV4ZWN1dGVkJ1xuICAgIHRhZ3MgPSBbXVxuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIC0+XG4gICAgICBkYXRhID0gJC5leHRlbmQoe30sICQoQCkuZGF0YSgndGFnLWRhdGEnKSlcbiAgICAgIHRhZ3MucHVzaCAkKEApLmRhdGEoJ3RhZy1kYXRhJylcbiAgICB0YWdzXG5cbiAgIyBTaHJpbmsgZXZlcnl0aGluZyBleGNlcHQgdGhlICRleGNlcHRcbiAgc2hyaW5rOiAoJGV4Y2VwdCA9IG51bGwpIC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0b3IgaXMgb2ZmXG4gICAgQGxvZyAnc2hyaW5rKCkgaXMgZXhlY3V0ZWQnXG4gICAgJGV4Y2VwdCA9ICQoJGV4Y2VwdClcbiAgICAkKCcudGFnbGEtdGFnJykuZWFjaCAoaSwgZWwpID0+XG4gICAgICByZXR1cm4gaWYgJGV4Y2VwdFswXSBpcyBlbFxuICAgICAgJHRhZyA9ICQoZWwpXG4gICAgICBpZiAkdGFnLmhhc0NsYXNzKCd0YWdsYS10YWctbmV3JykgYW5kICEkdGFnLmZpbmQoJ1tuYW1lPXRhZ10nKS52YWwoKVxuICAgICAgICAkdGFnLmZhZGVPdXQgPT5cbiAgICAgICAgICAkdGFnLnJlbW92ZSgpXG4gICAgICAgICAgQF9yZW1vdmVUb29scygkdGFnKVxuICAgICAgJHRhZy5yZW1vdmVDbGFzcyAndGFnbGEtdGFnLWFjdGl2ZSB0YWdsYS10YWctY2hvb3NlJ1xuICAgIEB3cmFwcGVyLnJlbW92ZUNsYXNzICd0YWdsYS1lZGl0aW5nLXNlbGVjdGluZydcbiAgICBAX2VuYWJsZURyYWcoKVxuXG4gIHVwZGF0ZURpYWxvZzogKCR0YWcsIGRhdGEpIC0+XG4gICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCAkdGFnLmRhdGEoJ3RhZy1kYXRhJyksIGRhdGEpXG4gICAgZGF0YS5mb3JtX2h0bWwgPSBAZm9ybUh0bWxcbiAgICBodG1sID0gJChNdXN0YWNoZS5yZW5kZXIoQHRhZ1RlbXBsYXRlLCBkYXRhKSkuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoKVxuICAgICR0YWcuZmluZCgnLnRhZ2xhLWRpYWxvZycpLmh0bWwoaHRtbClcbiAgICAkdGFnLmRhdGEoJ3RhZy1kYXRhJywgZGF0YSlcblxuICB1bmVkaXQ6IC0+XG4gICAgcmV0dXJuIGlmIEBlZGl0IGlzIG9mZlxuICAgIEBsb2cgJ3VuZWRpdCgpIGlzIGV4ZWN1dGVkJ1xuICAgICQoJy50YWdsYS10YWcnKS5lYWNoIChpLCBlbCkgPT5cbiAgICAgIEBfcmVtb3ZlVG9vbHMoJChlbCkpXG4gICAgQHdyYXBwZXIucmVtb3ZlQ2xhc3MgJ3RhZ2xhLWVkaXRpbmcnXG4gICAgQGVkaXRvciA9IG9mZlxuXG4gICMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gICMgTGlmZWN5Y2xlIE1ldGhvZHNcbiAgIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgaW5pdDogKG9wdGlvbnMpIC0+XG4gICAgIyBDb25maWd1cmUgT3B0aW9uc1xuICAgIEBkYXRhID0gb3B0aW9ucy5kYXRhIHx8IFtdXG4gICAgQGVkaXRvciA9IChvcHRpb25zLmVkaXRvciBpcyBvbikgPyBvbiA6IGZhbHNlXG4gICAgQGZvcm1IdG1sID0gaWYgb3B0aW9ucy5mb3JtIHRoZW4gJChvcHRpb25zLmZvcm0pIGVsc2UgJChUYWdsYS5GT1JNX1RFTVBMQVRFKVxuICAgIEBmb3JtSHRtbCA9IEBmb3JtSHRtbC5odG1sKClcbiAgICBAdGFnVGVtcGxhdGUgPSBpZiBvcHRpb25zLnRhZ1RlbXBsYXRlIHRoZW4gJChvcHRpb25zLnRhZ1RlbXBsYXRlKS5odG1sKCkgZWxzZSBUYWdsYS5UQUdfVEVNUExBVEVcbiAgICBAdW5pdCA9IGlmIG9wdGlvbnMudW5pdCBpcyAncGVyY2VudCcgdGhlbiAncGVyY2VudCcgZWxzZSAncGl4ZWwnXG4gICAgIyBBdHRyaWJ1dGVzXG4gICAgQGltYWdlU2l6ZSA9IG51bGxcbiAgICBAaW1hZ2UgPSBAd3JhcHBlci5maW5kKCdpbWcnKVxuICAgIEBsYXN0RHJhZ1RpbWUgPSBuZXcgRGF0ZSgpXG5cbiAgYmluZDogLT5cbiAgICBAbG9nICdiaW5kKCkgaXMgZXhlY3V0ZWQnXG4gICAgQHdyYXBwZXJcbiAgICAgIC5vbiAnbW91c2VlbnRlcicsICQucHJveHkoQGhhbmRsZU1vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ2NsaWNrJywgJC5wcm94eShAaGFuZGxlV3JhcHBlckNsaWNrLCBAKVxuICAgICAgLm9uICdjbGljaycsICcudGFnbGEtdGFnLWVkaXQtbGluaycsICQucHJveHkoQGhhbmRsZVRhZ0VkaXQsIEApXG4gICAgICAub24gJ2NsaWNrJywgJy50YWdsYS10YWctZGVsZXRlLWxpbmsnLCAkLnByb3h5KEBoYW5kbGVUYWdEZWxldGUsIEApXG4gICAgICAub24gJ21vdXNlZW50ZXInLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlRW50ZXIsIEApXG4gICAgICAub24gJ21vdXNlbGVhdmUnLCAnLnRhZ2xhLXRhZycsICQucHJveHkoQGhhbmRsZVRhZ01vdXNlTGVhdmUsIEApXG5cbiAgcmVuZGVyOiAtPlxuICAgIEBsb2cgJ3JlbmRlcigpIGlzIGV4ZWN1dGVkJ1xuICAgIEBpbWFnZS5hdHRyKCdkcmFnZ2FibGUnLCBmYWxzZSlcbiAgICBAaW1hZ2VTaXplID0gSW1hZ2VTaXplLmdldChAaW1hZ2UsICQucHJveHkoQHJlbmRlckZuLCBAKSlcbiAgICBAaW1hZ2VTaXplLm9uKCdjaGFuZ2UnLCAkLnByb3h5KEBoYW5kbGVJbWFnZVJlc2l6ZSwgQCkpXG5cbiAgcmVuZGVyRm46IChzdWNjZXNzLCBkYXRhKSAtPlxuICAgIEBsb2cgJ3JlbmRlckZuKCkgaXMgZXhlY3V0ZWQnXG4gICAgaXNTYWZhcmkgPSAvU2FmYXJpLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpIGFuZFxuICAgICAgICAgICAgICAgL0FwcGxlIENvbXB1dGVyLy50ZXN0KG5hdmlnYXRvci52ZW5kb3IpXG4gICAgdW5sZXNzIHN1Y2Nlc3MgIyBTdG9wIGlmIGltYWdlIGlzIGZhaWxlZCB0byBsb2FkXG4gICAgICBAbG9nKFwiRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICN7QGltYWdlLmF0dHIoJ3NyYycpfVwiLCAnZXJyb3InKVxuICAgICAgQGRlc3Ryb3koKVxuICAgICAgcmV0dXJuXG4gICAgQF91cGRhdGVJbWFnZVNpemUoZGF0YSkgIyBTYXZlIGRpbWVuc2lvblxuICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYScgIyBBcHBseSBuZWNlc3NhcnkgY2xhc3MgbmFtZXNcbiAgICBAd3JhcHBlci5hZGRDbGFzcyAndGFnbGEtc2FmYXJpJyBpZiBpc1NhZmFyaSAjIEF2b2lkIGFuaW1hdGlvblxuICAgIEBhZGRUYWcgdGFnIGZvciB0YWcgaW4gQGRhdGEgIyBDcmVhdGUgdGFnc1xuICAgIHNldFRpbWVvdXQgPT5cbiAgICAgIEB3cmFwcGVyLmFkZENsYXNzICd0YWdsYS1lZGl0aW5nJyBpZiBAZWRpdG9yXG4gICAgICBAZW1pdCgncmVhZHknLCBbQF0pXG4gICAgLCA1MDBcblxuICBkZXN0cm95OiAtPlxuICAgIEBsb2cgJ2Rlc3Ryb3koKSBpcyBleGVjdXRlZCdcbiAgICBAd3JhcHBlci5yZW1vdmVDbGFzcyAndGFnbGEgdGFnbGEtZWRpdGluZydcbiAgICBAd3JhcHBlci5maW5kKCcudGFnbGEtdGFnJykuZWFjaCAtPlxuICAgICAgJHRhZyA9ICQoQClcbiAgICAgICR0YWcuZmluZCgnLnRhZ2xhLXNlbGVjdCcpLmNob3NlbjIgJ2Rlc3Ryb3knXG4gICAgICAkdGFnLmRhdGEoJ2RyYWdnYWJpbGx5JykuZGVzdHJveSgpXG4gICAgICAkdGFnLnJlbW92ZSgpXG5cbiQuZXh0ZW5kKFRhZ2xhOjosIHByb3RvKVxuXG4jIFZhbmlsbGEgSlNcbndpbmRvdy5TdGFja2xhLlRhZ2xhID0gVGFnbGEgaWYgd2luZG93LlN0YWNrbGFcblxuI2lmIHR5cGVvZiBleHBvcnRzIGlzICdvYmplY3QnIGFuZCBleHBvcnRzICMgQ29tbW9uSlNcbiAgI21vZHVsZS5leHBvcnRzID0gVGFnbGFcbiNlbHNlIGlmIHR5cGVvZiBkZWZpbmUgaXMgJ2Z1bmN0aW9uJyBhbmQgZGVmaW5lLmFtZCAjIEFNRFxuICAjZGVmaW5lKFsnZXhwb3J0cyddLCBUYWdsYSlcblxuIl19
