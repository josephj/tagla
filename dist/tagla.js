// DON'T MODIFY THIS FILE!
// MODIFY ITS SOURCE FILE!
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Tagla = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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



},{"./base":4,"./image":5,"alignme":1,"mustache":2}]},{},[6])(6)
});