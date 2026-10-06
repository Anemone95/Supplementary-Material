"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unicodeToShortcode = unicodeToShortcode;
exports.shortcodeToUnicode = shortcodeToUnicode;
exports.processHtmlForSending = processHtmlForSending;
exports.sanitizedHtmlNode = sanitizedHtmlNode;
exports.sanitizedHtmlNodeInnerText = sanitizedHtmlNodeInnerText;
exports.isUrlPermitted = isUrlPermitted;
exports.bodyToHtml = bodyToHtml;
exports.linkifyString = linkifyString;
exports.linkifyElement = linkifyElement;
exports.linkifyAndSanitizeHtml = linkifyAndSanitizeHtml;
exports.checkBlockNode = checkBlockNode;
exports.PERMITTED_URL_SCHEMES = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var linkify = _interopRequireWildcard(require("linkifyjs"));

var _linkifyMatrix = _interopRequireDefault(require("./linkify-matrix"));

var _element = _interopRequireDefault(require("linkifyjs/element"));

var _string = _interopRequireDefault(require("linkifyjs/string"));

var _classnames = _interopRequireDefault(require("classnames"));

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

var _url = _interopRequireDefault(require("url"));

var _katex = _interopRequireDefault(require("katex"));

var _htmlEntities = require("html-entities");

var _SettingsStore = _interopRequireDefault(require("./settings/SettingsStore"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _Permalinks = require("./utils/permalinks/Permalinks");

var _emoji = require("./emoji");

var _ReplyThread = _interopRequireDefault(require("./components/views/elements/ReplyThread"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

(0, _linkifyMatrix.default)(linkify); // Anything outside the basic multilingual plane will be a surrogate pair

const SURROGATE_PAIR_PATTERN = /([\ud800-\udbff])([\udc00-\udfff])/; // And there a bunch more symbol characters that emojibase has within the
// BMP, so this includes the ranges from 'letterlike symbols' to
// 'miscellaneous symbols and arrows' which should catch all of them
// (with plenty of false positives, but that's OK)

const SYMBOL_PATTERN = /([\u2100-\u2bff])/; // Regex pattern for Zero-Width joiner unicode characters

const ZWJ_REGEX = new RegExp("\u200D|\u2003", "g"); // Regex pattern for whitespace characters

const WHITESPACE_REGEX = new RegExp("\\s", "g");
const BIGEMOJI_REGEX = new RegExp(`^(${_emojibaseRegex.default.source})+$`, 'i');
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const PERMITTED_URL_SCHEMES = ['http', 'https', 'ftp', 'mailto', 'magnet'];
/*
 * Return true if the given string contains emoji
 * Uses a much, much simpler regex than emojibase's so will give false
 * positives, but useful for fast-path testing strings to see if they
 * need emojification.
 * unicodeToImage uses this function.
 */

exports.PERMITTED_URL_SCHEMES = PERMITTED_URL_SCHEMES;

function mightContainEmoji(str
/*: string*/
) {
  return SURROGATE_PAIR_PATTERN.test(str) || SYMBOL_PATTERN.test(str);
}
/**
 * Returns the shortcode for an emoji character.
 *
 * @param {String} char The emoji character
 * @return {String} The shortcode (such as :thumbup:)
 */


function unicodeToShortcode(char
/*: string*/
) {
  const data = (0, _emoji.getEmojiFromUnicode)(char);
  return data && data.shortcodes ? `:${data.shortcodes[0]}:` : '';
}
/**
 * Returns the unicode character for an emoji shortcode
 *
 * @param {String} shortcode The shortcode (such as :thumbup:)
 * @return {String} The emoji character; null if none exists
 */


function shortcodeToUnicode(shortcode
/*: string*/
) {
  shortcode = shortcode.slice(1, shortcode.length - 1);

  const data = _emoji.SHORTCODE_TO_EMOJI.get(shortcode);

  return data ? data.unicode : null;
}

function processHtmlForSending(html
/*: string*/
)
/*: string*/
{
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = html;

  if (contentDiv.children.length === 0) {
    return contentDiv.innerHTML;
  }

  let contentHTML = "";

  for (let i = 0; i < contentDiv.children.length; i++) {
    const element = contentDiv.children[i];

    if (element.tagName.toLowerCase() === 'p') {
      contentHTML += element.innerHTML; // Don't add a <br /> for the last <p>

      if (i !== contentDiv.children.length - 1) {
        contentHTML += '<br />';
      }
    } else {
      const temp = document.createElement('div');
      temp.appendChild(element.cloneNode(true));
      contentHTML += temp.innerHTML;
    }
  }

  return contentHTML;
}
/*
 * Given an untrusted HTML string, return a React node with an sanitized version
 * of that HTML.
 */


function sanitizedHtmlNode(insaneHtml
/*: string*/
) {
  const saneHtml = (0, _sanitizeHtml.default)(insaneHtml, sanitizeHtmlParams);
  return /*#__PURE__*/_react.default.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: saneHtml
    },
    dir: "auto"
  });
}

function sanitizedHtmlNodeInnerText(insaneHtml
/*: string*/
) {
  const saneHtml = (0, _sanitizeHtml.default)(insaneHtml, sanitizeHtmlParams);
  const contentDiv = document.createElement("div");
  contentDiv.innerHTML = saneHtml;
  return contentDiv.innerText;
}
/**
 * Tests if a URL from an untrusted source may be safely put into the DOM
 * The biggest threat here is javascript: URIs.
 * Note that the HTML sanitiser library has its own internal logic for
 * doing this, to which we pass the same list of schemes. This is used in
 * other places we need to sanitise URLs.
 * @return true if permitted, otherwise false
 */


function isUrlPermitted(inputUrl
/*: string*/
) {
  try {
    const parsed = _url.default.parse(inputUrl);

    if (!parsed.protocol) return false; // URL parser protocol includes the trailing colon

    return PERMITTED_URL_SCHEMES.includes(parsed.protocol.slice(0, -1));
  } catch (e) {
    return false;
  }
}

const transformTags
/*: IExtendedSanitizeOptions["transformTags"]*/
= {
  // custom to matrix
  // add blank targets to all hyperlinks except vector URLs
  'a': function (tagName
  /*: string*/
  , attribs
  /*: sanitizeHtml.Attributes*/
  ) {
    if (attribs.href) {
      attribs.target = '_blank'; // by default

      const transformed = (0, _Permalinks.tryTransformPermalinkToLocalHref)(attribs.href);

      if (transformed !== attribs.href || attribs.href.match(_linkifyMatrix.default.ELEMENT_URL_PATTERN)) {
        attribs.href = transformed;
        delete attribs.target;
      }
    }

    attribs.rel = 'noreferrer noopener'; // https://mathiasbynens.github.io/rel-noopener/

    return {
      tagName,
      attribs
    };
  },
  'img': function (tagName
  /*: string*/
  , attribs
  /*: sanitizeHtml.Attributes*/
  ) {
    // Strip out imgs that aren't `mxc` here instead of using allowedSchemesByTag
    // because transformTags is used _before_ we filter by allowedSchemesByTag and
    // we don't want to allow images with `https?` `src`s.
    // We also drop inline images (as if they were not present at all) when the "show
    // images" preference is disabled. Future work might expose some UI to reveal them
    // like standalone image events have.
    if (!attribs.src || !attribs.src.startsWith('mxc://') || !_SettingsStore.default.getValue("showImages")) {
      return {
        tagName,
        attribs: {}
      };
    }

    attribs.src = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(attribs.src, attribs.width || 800, attribs.height || 600);
    return {
      tagName,
      attribs
    };
  },
  'code': function (tagName
  /*: string*/
  , attribs
  /*: sanitizeHtml.Attributes*/
  ) {
    if (typeof attribs.class !== 'undefined') {
      // Filter out all classes other than ones starting with language- for syntax highlighting.
      const classes = attribs.class.split(/\s/).filter(function (cl) {
        return cl.startsWith('language-') && !cl.startsWith('language-_');
      });
      attribs.class = classes.join(' ');
    }

    return {
      tagName,
      attribs
    };
  },
  '*': function (tagName
  /*: string*/
  , attribs
  /*: sanitizeHtml.Attributes*/
  ) {
    // Delete any style previously assigned, style is an allowedTag for font and span
    // because attributes are stripped after transforming
    delete attribs.style; // Sanitise and transform data-mx-color and data-mx-bg-color to their CSS
    // equivalents

    const customCSSMapper = {
      'data-mx-color': 'color',
      'data-mx-bg-color': 'background-color' // $customAttributeKey: $cssAttributeKey

    };
    let style = "";
    Object.keys(customCSSMapper).forEach(customAttributeKey => {
      const cssAttributeKey = customCSSMapper[customAttributeKey];
      const customAttributeValue = attribs[customAttributeKey];

      if (customAttributeValue && typeof customAttributeValue === 'string' && COLOR_REGEX.test(customAttributeValue)) {
        style += cssAttributeKey + ":" + customAttributeValue + ";";
        delete attribs[customAttributeKey];
      }
    });

    if (style) {
      attribs.style = style;
    }

    return {
      tagName,
      attribs
    };
  }
};
const sanitizeHtmlParams
/*: IExtendedSanitizeOptions*/
= {
  allowedTags: ['font', // custom to matrix for IRC-style font coloring
  'del', // for markdown
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'sup', 'sub', 'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'],
  allowedAttributes: {
    // custom ones first:
    font: ['color', 'data-mx-bg-color', 'data-mx-color', 'style'],
    // custom to matrix
    span: ['data-mx-maths', 'data-mx-bg-color', 'data-mx-color', 'data-mx-spoiler', 'style'],
    // custom to matrix
    div: ['data-mx-maths'],
    a: ['href', 'name', 'target', 'rel'],
    // remote target: custom to matrix
    img: ['src', 'width', 'height', 'alt', 'title'],
    ol: ['start'],
    code: ['class'] // We don't actually allow all classes, we filter them in transformTags

  },
  // Lots of these won't come up by default because we don't allow them
  selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
  // URL schemes we permit
  allowedSchemes: PERMITTED_URL_SCHEMES,
  allowProtocolRelative: false,
  transformTags,
  // 50 levels deep "should be enough for anyone"
  nestingLimit: 50
}; // this is the same as the above except with less rewriting

const composerSanitizeHtmlParams
/*: IExtendedSanitizeOptions*/
= _objectSpread(_objectSpread({}, sanitizeHtmlParams), {}, {
  transformTags: {
    'code': transformTags['code'],
    '*': transformTags['*']
  }
});

class BaseHighlighter
/*:: <T extends React.ReactNode>*/
{
  constructor(highlightClass
  /*: string*/
  , highlightLink
  /*: string*/
  ) {
    this.highlightClass
    /*:: */
    = highlightClass
    /*:: */
    ;
    this.highlightLink
    /*:: */
    = highlightLink
    /*:: */
    ;
  }
  /**
   * apply the highlights to a section of text
   *
   * @param {string} safeSnippet The snippet of text to apply the highlights
   *     to.
   * @param {string[]} safeHighlights A list of substrings to highlight,
   *     sorted by descending length.
   *
   * returns a list of results (strings for HtmlHighligher, react nodes for
   * TextHighlighter).
   */


  applyHighlights(safeSnippet
  /*: string*/
  , safeHighlights
  /*: string[]*/
  )
  /*: T[]*/
  {
    let lastOffset = 0;
    let offset;
    let nodes
    /*: T[]*/
    = [];
    const safeHighlight = safeHighlights[0];

    while ((offset = safeSnippet.toLowerCase().indexOf(safeHighlight.toLowerCase(), lastOffset)) >= 0) {
      // handle preamble
      if (offset > lastOffset) {
        const subSnippet = safeSnippet.substring(lastOffset, offset);
        nodes = nodes.concat(this.applySubHighlights(subSnippet, safeHighlights));
      } // do highlight. use the original string rather than safeHighlight
      // to preserve the original casing.


      const endOffset = offset + safeHighlight.length;
      nodes.push(this.processSnippet(safeSnippet.substring(offset, endOffset), true));
      lastOffset = endOffset;
    } // handle postamble


    if (lastOffset !== safeSnippet.length) {
      const subSnippet = safeSnippet.substring(lastOffset, undefined);
      nodes = nodes.concat(this.applySubHighlights(subSnippet, safeHighlights));
    }

    return nodes;
  }

  applySubHighlights(safeSnippet
  /*: string*/
  , safeHighlights
  /*: string[]*/
  )
  /*: T[]*/
  {
    if (safeHighlights[1]) {
      // recurse into this range to check for the next set of highlight matches
      return this.applyHighlights(safeSnippet, safeHighlights.slice(1));
    } else {
      // no more highlights to be found, just return the unhighlighted string
      return [this.processSnippet(safeSnippet, false)];
    }
  }

}

class HtmlHighlighter extends BaseHighlighter
/*:: <string>*/
{
  /* highlight the given snippet if required
   *
   * snippet: content of the span; must have been sanitised
   * highlight: true to highlight as a search match
   *
   * returns an HTML string
   */
  processSnippet(snippet
  /*: string*/
  , highlight
  /*: boolean*/
  )
  /*: string*/
  {
    if (!highlight) {
      // nothing required here
      return snippet;
    }

    let span = `<span class="${this.highlightClass}">${snippet}</span>`;

    if (this.highlightLink) {
      span = `<a href="${encodeURI(this.highlightLink)}">${span}</a>`;
    }

    return span;
  }

}

/* turn a matrix event body into html
 *
 * content: 'content' of the MatrixEvent
 *
 * highlights: optional list of words to highlight, ordered by longest word first
 *
 * opts.highlightLink: optional href to add to highlighted words
 * opts.disableBigEmoji: optional argument to disable the big emoji class.
 * opts.stripReplyFallback: optional argument specifying the event is a reply and so fallback needs removing
 * opts.returnString: return an HTML string rather than JSX elements
 * opts.forComposerQuote: optional param to lessen the url rewriting done by sanitization, for quoting into composer
 * opts.ref: React ref to attach to any React components returned (not compatible with opts.returnString)
 */
function bodyToHtml(content
/*: IContent*/
, highlights
/*: string[]*/
, opts
/*: IOpts*/
= {}) {
  const isHtmlMessage = content.format === "org.matrix.custom.html" && content.formatted_body;
  let bodyHasEmoji = false;
  let sanitizeParams = sanitizeHtmlParams;

  if (opts.forComposerQuote) {
    sanitizeParams = composerSanitizeHtmlParams;
  }

  let strippedBody
  /*: string*/
  ;
  let safeBody
  /*: string*/
  ;
  let isDisplayedWithHtml
  /*: boolean*/
  ; // XXX: We sanitize the HTML whilst also highlighting its text nodes, to avoid accidentally trying
  // to highlight HTML tags themselves.  However, this does mean that we don't highlight textnodes which
  // are interrupted by HTML tags (not that we did before) - e.g. foo<span/>bar won't get highlighted
  // by an attempt to search for 'foobar'.  Then again, the search query probably wouldn't work either

  try {
    if (highlights && highlights.length > 0) {
      const highlighter = new HtmlHighlighter("mx_EventTile_searchHighlight", opts.highlightLink);
      const safeHighlights = highlights.map(function (highlight) {
        return (0, _sanitizeHtml.default)(highlight, sanitizeParams);
      }); // XXX: hacky bodge to temporarily apply a textFilter to the sanitizeParams structure.

      sanitizeParams.textFilter = function (safeText) {
        return highlighter.applyHighlights(safeText, safeHighlights).join('');
      };
    }

    let formattedBody = typeof content.formatted_body === 'string' ? content.formatted_body : null;
    const plainBody = typeof content.body === 'string' ? content.body : "";
    if (opts.stripReplyFallback && formattedBody) formattedBody = _ReplyThread.default.stripHTMLReply(formattedBody);
    strippedBody = opts.stripReplyFallback ? _ReplyThread.default.stripPlainReply(plainBody) : plainBody;
    bodyHasEmoji = mightContainEmoji(isHtmlMessage ? formattedBody : plainBody); // Only generate safeBody if the message was sent as org.matrix.custom.html

    if (isHtmlMessage) {
      isDisplayedWithHtml = true;
      safeBody = (0, _sanitizeHtml.default)(formattedBody, sanitizeParams);

      if (_SettingsStore.default.getValue("feature_latex_maths")) {
        const phtml = _cheerio.default.load(safeBody, {
          _useHtmlParser2: true,
          decodeEntities: false
        }); // @ts-ignore - The types for `replaceWith` wrongly expect
        // Cheerio instance to be returned.


        phtml('div, span[data-mx-maths!=""]').replaceWith(function (i, e) {
          return _katex.default.renderToString(_htmlEntities.AllHtmlEntities.decode(phtml(e).attr('data-mx-maths')), {
            throwOnError: false,
            displayMode: e.name == 'div',
            output: "htmlAndMathml"
          });
        });
        safeBody = phtml.html();
      }
    }
  } finally {
    delete sanitizeParams.textFilter;
  }

  const contentBody = isDisplayedWithHtml ? safeBody : strippedBody;

  if (opts.returnString) {
    return contentBody;
  }

  let emojiBody = false;

  if (!opts.disableBigEmoji && bodyHasEmoji) {
    let contentBodyTrimmed = contentBody !== undefined ? contentBody.trim() : ''; // Ignore spaces in body text. Emojis with spaces in between should
    // still be counted as purely emoji messages.

    contentBodyTrimmed = contentBodyTrimmed.replace(WHITESPACE_REGEX, ''); // Remove zero width joiner characters from emoji messages. This ensures
    // that emojis that are made up of multiple unicode characters are still
    // presented as large.

    contentBodyTrimmed = contentBodyTrimmed.replace(ZWJ_REGEX, '');
    const match = BIGEMOJI_REGEX.exec(contentBodyTrimmed);
    emojiBody = match && match[0] && match[0].length === contentBodyTrimmed.length && ( // Prevent user pills expanding for users with only emoji in
    // their username. Permalinks (links in pills) can be any URL
    // now, so we just check for an HTTP-looking thing.
    strippedBody === safeBody || // replies have the html fallbacks, account for that here
    content.formatted_body === undefined || !content.formatted_body.includes("http:") && !content.formatted_body.includes("https:"));
  }

  const className = (0, _classnames.default)({
    'mx_EventTile_body': true,
    'mx_EventTile_bigEmoji': emojiBody,
    'markdown-body': isHtmlMessage && !emojiBody
  });
  return isDisplayedWithHtml ? /*#__PURE__*/_react.default.createElement("span", {
    key: "body",
    ref: opts.ref,
    className: className,
    dangerouslySetInnerHTML: {
      __html: safeBody
    },
    dir: "auto"
  }) : /*#__PURE__*/_react.default.createElement("span", {
    key: "body",
    ref: opts.ref,
    className: className,
    dir: "auto"
  }, strippedBody);
}
/**
 * Linkifies the given string. This is a wrapper around 'linkifyjs/string'.
 *
 * @param {string} str string to linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrix.options
 * @returns {string} Linkified string
 */


function linkifyString(str
/*: string*/
, options = _linkifyMatrix.default.options) {
  return (0, _string.default)(str, options);
}
/**
 * Linkifies the given DOM element. This is a wrapper around 'linkifyjs/element'.
 *
 * @param {object} element DOM element to linkify
 * @param {object} [options] Options for linkifyElement. Default: linkifyMatrix.options
 * @returns {object}
 */


function linkifyElement(element
/*: HTMLElement*/
, options = _linkifyMatrix.default.options) {
  return (0, _element.default)(element, options);
}
/**
 * Linkify the given string and sanitize the HTML afterwards.
 *
 * @param {string} dirtyHtml The HTML string to sanitize and linkify
 * @param {object} [options] Options for linkifyString. Default: linkifyMatrix.options
 * @returns {string}
 */


function linkifyAndSanitizeHtml(dirtyHtml
/*: string*/
, options = _linkifyMatrix.default.options) {
  return (0, _sanitizeHtml.default)(linkifyString(dirtyHtml, options), sanitizeHtmlParams);
}
/**
 * Returns if a node is a block element or not.
 * Only takes html nodes into account that are allowed in matrix messages.
 *
 * @param {Node} node
 * @returns {bool}
 */


function checkBlockNode(node
/*: Node*/
) {
  switch (node.nodeName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6":
    case "PRE":
    case "BLOCKQUOTE":
    case "P":
    case "UL":
    case "OL":
    case "LI":
    case "HR":
    case "TABLE":
    case "THEAD":
    case "TBODY":
    case "TR":
    case "TH":
    case "TD":
      return true;

    case "DIV":
      // don't treat math nodes as block nodes for deserializing
      return !node.hasAttribute("data-mx-maths");

    default:
      return false;
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9IdG1sVXRpbHMudHN4Il0sIm5hbWVzIjpbImxpbmtpZnkiLCJTVVJST0dBVEVfUEFJUl9QQVRURVJOIiwiU1lNQk9MX1BBVFRFUk4iLCJaV0pfUkVHRVgiLCJSZWdFeHAiLCJXSElURVNQQUNFX1JFR0VYIiwiQklHRU1PSklfUkVHRVgiLCJFTU9KSUJBU0VfUkVHRVgiLCJzb3VyY2UiLCJDT0xPUl9SRUdFWCIsIlBFUk1JVFRFRF9VUkxfU0NIRU1FUyIsIm1pZ2h0Q29udGFpbkVtb2ppIiwic3RyIiwidGVzdCIsInVuaWNvZGVUb1Nob3J0Y29kZSIsImNoYXIiLCJkYXRhIiwic2hvcnRjb2RlcyIsInNob3J0Y29kZVRvVW5pY29kZSIsInNob3J0Y29kZSIsInNsaWNlIiwibGVuZ3RoIiwiU0hPUlRDT0RFX1RPX0VNT0pJIiwiZ2V0IiwidW5pY29kZSIsInByb2Nlc3NIdG1sRm9yU2VuZGluZyIsImh0bWwiLCJjb250ZW50RGl2IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiY2hpbGRyZW4iLCJjb250ZW50SFRNTCIsImkiLCJlbGVtZW50IiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwidGVtcCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwic2FuaXRpemVkSHRtbE5vZGUiLCJpbnNhbmVIdG1sIiwic2FuZUh0bWwiLCJzYW5pdGl6ZUh0bWxQYXJhbXMiLCJfX2h0bWwiLCJzYW5pdGl6ZWRIdG1sTm9kZUlubmVyVGV4dCIsImlubmVyVGV4dCIsImlzVXJsUGVybWl0dGVkIiwiaW5wdXRVcmwiLCJwYXJzZWQiLCJ1cmwiLCJwYXJzZSIsInByb3RvY29sIiwiaW5jbHVkZXMiLCJlIiwidHJhbnNmb3JtVGFncyIsImF0dHJpYnMiLCJocmVmIiwidGFyZ2V0IiwidHJhbnNmb3JtZWQiLCJtYXRjaCIsImxpbmtpZnlNYXRyaXgiLCJFTEVNRU5UX1VSTF9QQVRURVJOIiwicmVsIiwic3JjIiwic3RhcnRzV2l0aCIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIk1hdHJpeENsaWVudFBlZyIsIm14Y1VybFRvSHR0cCIsIndpZHRoIiwiaGVpZ2h0IiwiY2xhc3MiLCJjbGFzc2VzIiwic3BsaXQiLCJmaWx0ZXIiLCJjbCIsImpvaW4iLCJzdHlsZSIsImN1c3RvbUNTU01hcHBlciIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwiY3VzdG9tQXR0cmlidXRlS2V5IiwiY3NzQXR0cmlidXRlS2V5IiwiY3VzdG9tQXR0cmlidXRlVmFsdWUiLCJhbGxvd2VkVGFncyIsImFsbG93ZWRBdHRyaWJ1dGVzIiwiZm9udCIsInNwYW4iLCJkaXYiLCJhIiwiaW1nIiwib2wiLCJjb2RlIiwic2VsZkNsb3NpbmciLCJhbGxvd2VkU2NoZW1lcyIsImFsbG93UHJvdG9jb2xSZWxhdGl2ZSIsIm5lc3RpbmdMaW1pdCIsImNvbXBvc2VyU2FuaXRpemVIdG1sUGFyYW1zIiwiQmFzZUhpZ2hsaWdodGVyIiwiY29uc3RydWN0b3IiLCJoaWdobGlnaHRDbGFzcyIsImhpZ2hsaWdodExpbmsiLCJhcHBseUhpZ2hsaWdodHMiLCJzYWZlU25pcHBldCIsInNhZmVIaWdobGlnaHRzIiwibGFzdE9mZnNldCIsIm9mZnNldCIsIm5vZGVzIiwic2FmZUhpZ2hsaWdodCIsImluZGV4T2YiLCJzdWJTbmlwcGV0Iiwic3Vic3RyaW5nIiwiY29uY2F0IiwiYXBwbHlTdWJIaWdobGlnaHRzIiwiZW5kT2Zmc2V0IiwicHVzaCIsInByb2Nlc3NTbmlwcGV0IiwidW5kZWZpbmVkIiwiSHRtbEhpZ2hsaWdodGVyIiwic25pcHBldCIsImhpZ2hsaWdodCIsImVuY29kZVVSSSIsImJvZHlUb0h0bWwiLCJjb250ZW50IiwiaGlnaGxpZ2h0cyIsIm9wdHMiLCJpc0h0bWxNZXNzYWdlIiwiZm9ybWF0IiwiZm9ybWF0dGVkX2JvZHkiLCJib2R5SGFzRW1vamkiLCJzYW5pdGl6ZVBhcmFtcyIsImZvckNvbXBvc2VyUXVvdGUiLCJzdHJpcHBlZEJvZHkiLCJzYWZlQm9keSIsImlzRGlzcGxheWVkV2l0aEh0bWwiLCJoaWdobGlnaHRlciIsIm1hcCIsInRleHRGaWx0ZXIiLCJzYWZlVGV4dCIsImZvcm1hdHRlZEJvZHkiLCJwbGFpbkJvZHkiLCJib2R5Iiwic3RyaXBSZXBseUZhbGxiYWNrIiwiUmVwbHlUaHJlYWQiLCJzdHJpcEhUTUxSZXBseSIsInN0cmlwUGxhaW5SZXBseSIsInBodG1sIiwiY2hlZXJpbyIsImxvYWQiLCJfdXNlSHRtbFBhcnNlcjIiLCJkZWNvZGVFbnRpdGllcyIsInJlcGxhY2VXaXRoIiwia2F0ZXgiLCJyZW5kZXJUb1N0cmluZyIsIkFsbEh0bWxFbnRpdGllcyIsImRlY29kZSIsImF0dHIiLCJ0aHJvd09uRXJyb3IiLCJkaXNwbGF5TW9kZSIsIm5hbWUiLCJvdXRwdXQiLCJjb250ZW50Qm9keSIsInJldHVyblN0cmluZyIsImVtb2ppQm9keSIsImRpc2FibGVCaWdFbW9qaSIsImNvbnRlbnRCb2R5VHJpbW1lZCIsInRyaW0iLCJyZXBsYWNlIiwiZXhlYyIsImNsYXNzTmFtZSIsInJlZiIsImxpbmtpZnlTdHJpbmciLCJvcHRpb25zIiwibGlua2lmeUVsZW1lbnQiLCJsaW5raWZ5QW5kU2FuaXRpemVIdG1sIiwiZGlydHlIdG1sIiwiY2hlY2tCbG9ja05vZGUiLCJub2RlIiwibm9kZU5hbWUiLCJoYXNBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsNEJBQWNBLE9BQWQsRSxDQUVBOztBQUNBLE1BQU1DLHNCQUFzQixHQUFHLG9DQUEvQixDLENBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLG1CQUF2QixDLENBRUE7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUlDLE1BQUosQ0FBVyxlQUFYLEVB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MDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNywgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc2FuaXRpemVIdG1sIGZyb20gJ3Nhbml0aXplLWh0bWwnO1xuaW1wb3J0IHsgSUV4dGVuZGVkU2FuaXRpemVPcHRpb25zIH0gZnJvbSAnLi9AdHlwZXMvc2FuaXRpemUtaHRtbCc7XG5pbXBvcnQgKiBhcyBsaW5raWZ5IGZyb20gJ2xpbmtpZnlqcyc7XG5pbXBvcnQgbGlua2lmeU1hdHJpeCBmcm9tICcuL2xpbmtpZnktbWF0cml4JztcbmltcG9ydCBfbGlua2lmeUVsZW1lbnQgZnJvbSAnbGlua2lmeWpzL2VsZW1lbnQnO1xuaW1wb3J0IF9saW5raWZ5U3RyaW5nIGZyb20gJ2xpbmtpZnlqcy9zdHJpbmcnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgRU1PSklCQVNFX1JFR0VYIGZyb20gJ2Vtb2ppYmFzZS1yZWdleCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5pbXBvcnQga2F0ZXggZnJvbSAna2F0ZXgnO1xuaW1wb3J0IHsgQWxsSHRtbEVudGl0aWVzIH0gZnJvbSAnaHRtbC1lbnRpdGllcyc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbyc7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge3RyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmfSBmcm9tIFwiLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7U0hPUlRDT0RFX1RPX0VNT0pJLCBnZXRFbW9qaUZyb21Vbmljb2RlfSBmcm9tIFwiLi9lbW9qaVwiO1xuaW1wb3J0IFJlcGx5VGhyZWFkIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUmVwbHlUaHJlYWRcIjtcblxubGlua2lmeU1hdHJpeChsaW5raWZ5KTtcblxuLy8gQW55dGhpbmcgb3V0c2lkZSB0aGUgYmFzaWMgbXVsdGlsaW5ndWFsIHBsYW5lIHdpbGwgYmUgYSBzdXJyb2dhdGUgcGFpclxuY29uc3QgU1VSUk9HQVRFX1BBSVJfUEFUVEVSTiA9IC8oW1xcdWQ4MDAtXFx1ZGJmZl0pKFtcXHVkYzAwLVxcdWRmZmZdKS87XG4vLyBBbmQgdGhlcmUgYSBidW5jaCBtb3JlIHN5bWJvbCBjaGFyYWN0ZXJzIHRoYXQgZW1vamliYXNlIGhhcyB3aXRoaW4gdGhlXG4vLyBCTVAsIHNvIHRoaXMgaW5jbHVkZXMgdGhlIHJhbmdlcyBmcm9tICdsZXR0ZXJsaWtlIHN5bWJvbHMnIHRvXG4vLyAnbWlzY2VsbGFuZW91cyBzeW1ib2xzIGFuZCBhcnJvd3MnIHdoaWNoIHNob3VsZCBjYXRjaCBhbGwgb2YgdGhlbVxuLy8gKHdpdGggcGxlbnR5IG9mIGZhbHNlIHBvc2l0aXZlcywgYnV0IHRoYXQncyBPSylcbmNvbnN0IFNZTUJPTF9QQVRURVJOID0gLyhbXFx1MjEwMC1cXHUyYmZmXSkvO1xuXG4vLyBSZWdleCBwYXR0ZXJuIGZvciBaZXJvLVdpZHRoIGpvaW5lciB1bmljb2RlIGNoYXJhY3RlcnNcbmNvbnN0IFpXSl9SRUdFWCA9IG5ldyBSZWdFeHAoXCJcXHUyMDBEfFxcdTIwMDNcIiwgXCJnXCIpO1xuXG4vLyBSZWdleCBwYXR0ZXJuIGZvciB3aGl0ZXNwYWNlIGNoYXJhY3RlcnNcbmNvbnN0IFdISVRFU1BBQ0VfUkVHRVggPSBuZXcgUmVnRXhwKFwiXFxcXHNcIiwgXCJnXCIpO1xuXG5jb25zdCBCSUdFTU9KSV9SRUdFWCA9IG5ldyBSZWdFeHAoYF4oJHtFTU9KSUJBU0VfUkVHRVguc291cmNlfSkrJGAsICdpJyk7XG5cbmNvbnN0IENPTE9SX1JFR0VYID0gL14jWzAtOWEtZkEtRl17Nn0kLztcblxuZXhwb3J0IGNvbnN0IFBFUk1JVFRFRF9VUkxfU0NIRU1FUyA9IFsnaHR0cCcsICdodHRwcycsICdmdHAnLCAnbWFpbHRvJywgJ21hZ25ldCddO1xuXG4vKlxuICogUmV0dXJuIHRydWUgaWYgdGhlIGdpdmVuIHN0cmluZyBjb250YWlucyBlbW9qaVxuICogVXNlcyBhIG11Y2gsIG11Y2ggc2ltcGxlciByZWdleCB0aGFuIGVtb2ppYmFzZSdzIHNvIHdpbGwgZ2l2ZSBmYWxzZVxuICogcG9zaXRpdmVzLCBidXQgdXNlZnVsIGZvciBmYXN0LXBhdGggdGVzdGluZyBzdHJpbmdzIHRvIHNlZSBpZiB0aGV5XG4gKiBuZWVkIGVtb2ppZmljYXRpb24uXG4gKiB1bmljb2RlVG9JbWFnZSB1c2VzIHRoaXMgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG1pZ2h0Q29udGFpbkVtb2ppKHN0cjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIFNVUlJPR0FURV9QQUlSX1BBVFRFUk4udGVzdChzdHIpIHx8IFNZTUJPTF9QQVRURVJOLnRlc3Qoc3RyKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzaG9ydGNvZGUgZm9yIGFuIGVtb2ppIGNoYXJhY3Rlci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gY2hhciBUaGUgZW1vamkgY2hhcmFjdGVyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBzaG9ydGNvZGUgKHN1Y2ggYXMgOnRodW1idXA6KVxuICovXG5leHBvcnQgZnVuY3Rpb24gdW5pY29kZVRvU2hvcnRjb2RlKGNoYXI6IHN0cmluZykge1xuICAgIGNvbnN0IGRhdGEgPSBnZXRFbW9qaUZyb21Vbmljb2RlKGNoYXIpO1xuICAgIHJldHVybiAoZGF0YSAmJiBkYXRhLnNob3J0Y29kZXMgPyBgOiR7ZGF0YS5zaG9ydGNvZGVzWzBdfTpgIDogJycpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHVuaWNvZGUgY2hhcmFjdGVyIGZvciBhbiBlbW9qaSBzaG9ydGNvZGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2hvcnRjb2RlIFRoZSBzaG9ydGNvZGUgKHN1Y2ggYXMgOnRodW1idXA6KVxuICogQHJldHVybiB7U3RyaW5nfSBUaGUgZW1vamkgY2hhcmFjdGVyOyBudWxsIGlmIG5vbmUgZXhpc3RzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG9ydGNvZGVUb1VuaWNvZGUoc2hvcnRjb2RlOiBzdHJpbmcpIHtcbiAgICBzaG9ydGNvZGUgPSBzaG9ydGNvZGUuc2xpY2UoMSwgc2hvcnRjb2RlLmxlbmd0aCAtIDEpO1xuICAgIGNvbnN0IGRhdGEgPSBTSE9SVENPREVfVE9fRU1PSkkuZ2V0KHNob3J0Y29kZSk7XG4gICAgcmV0dXJuIGRhdGEgPyBkYXRhLnVuaWNvZGUgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0h0bWxGb3JTZW5kaW5nKGh0bWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgY29udGVudERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNvbnRlbnREaXYuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIGlmIChjb250ZW50RGl2LmNoaWxkcmVuLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gY29udGVudERpdi5pbm5lckhUTUw7XG4gICAgfVxuXG4gICAgbGV0IGNvbnRlbnRIVE1MID0gXCJcIjtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvbnRlbnREaXYuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGNvbnRlbnREaXYuY2hpbGRyZW5baV07XG4gICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3AnKSB7XG4gICAgICAgICAgICBjb250ZW50SFRNTCArPSBlbGVtZW50LmlubmVySFRNTDtcbiAgICAgICAgICAgIC8vIERvbid0IGFkZCBhIDxiciAvPiBmb3IgdGhlIGxhc3QgPHA+XG4gICAgICAgICAgICBpZiAoaSAhPT0gY29udGVudERpdi5jaGlsZHJlbi5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgY29udGVudEhUTUwgKz0gJzxiciAvPic7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICB0ZW1wLmFwcGVuZENoaWxkKGVsZW1lbnQuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgICAgIGNvbnRlbnRIVE1MICs9IHRlbXAuaW5uZXJIVE1MO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnRIVE1MO1xufVxuXG4vKlxuICogR2l2ZW4gYW4gdW50cnVzdGVkIEhUTUwgc3RyaW5nLCByZXR1cm4gYSBSZWFjdCBub2RlIHdpdGggYW4gc2FuaXRpemVkIHZlcnNpb25cbiAqIG9mIHRoYXQgSFRNTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplZEh0bWxOb2RlKGluc2FuZUh0bWw6IHN0cmluZykge1xuICAgIGNvbnN0IHNhbmVIdG1sID0gc2FuaXRpemVIdG1sKGluc2FuZUh0bWwsIHNhbml0aXplSHRtbFBhcmFtcyk7XG5cbiAgICByZXR1cm4gPGRpdiBkYW5nZXJvdXNseVNldElubmVySFRNTD17eyBfX2h0bWw6IHNhbmVIdG1sIH19IGRpcj1cImF1dG9cIiAvPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0aXplZEh0bWxOb2RlSW5uZXJUZXh0KGluc2FuZUh0bWw6IHN0cmluZykge1xuICAgIGNvbnN0IHNhbmVIdG1sID0gc2FuaXRpemVIdG1sKGluc2FuZUh0bWwsIHNhbml0aXplSHRtbFBhcmFtcyk7XG4gICAgY29uc3QgY29udGVudERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY29udGVudERpdi5pbm5lckhUTUwgPSBzYW5lSHRtbDtcbiAgICByZXR1cm4gY29udGVudERpdi5pbm5lclRleHQ7XG59XG5cbi8qKlxuICogVGVzdHMgaWYgYSBVUkwgZnJvbSBhbiB1bnRydXN0ZWQgc291cmNlIG1heSBiZSBzYWZlbHkgcHV0IGludG8gdGhlIERPTVxuICogVGhlIGJpZ2dlc3QgdGhyZWF0IGhlcmUgaXMgamF2YXNjcmlwdDogVVJJcy5cbiAqIE5vdGUgdGhhdCB0aGUgSFRNTCBzYW5pdGlzZXIgbGlicmFyeSBoYXMgaXRzIG93biBpbnRlcm5hbCBsb2dpYyBmb3JcbiAqIGRvaW5nIHRoaXMsIHRvIHdoaWNoIHdlIHBhc3MgdGhlIHNhbWUgbGlzdCBvZiBzY2hlbWVzLiBUaGlzIGlzIHVzZWQgaW5cbiAqIG90aGVyIHBsYWNlcyB3ZSBuZWVkIHRvIHNhbml0aXNlIFVSTHMuXG4gKiBAcmV0dXJuIHRydWUgaWYgcGVybWl0dGVkLCBvdGhlcndpc2UgZmFsc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVXJsUGVybWl0dGVkKGlucHV0VXJsOiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWQgPSB1cmwucGFyc2UoaW5wdXRVcmwpO1xuICAgICAgICBpZiAoIXBhcnNlZC5wcm90b2NvbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvLyBVUkwgcGFyc2VyIHByb3RvY29sIGluY2x1ZGVzIHRoZSB0cmFpbGluZyBjb2xvblxuICAgICAgICByZXR1cm4gUEVSTUlUVEVEX1VSTF9TQ0hFTUVTLmluY2x1ZGVzKHBhcnNlZC5wcm90b2NvbC5zbGljZSgwLCAtMSkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuY29uc3QgdHJhbnNmb3JtVGFnczogSUV4dGVuZGVkU2FuaXRpemVPcHRpb25zW1widHJhbnNmb3JtVGFnc1wiXSA9IHsgLy8gY3VzdG9tIHRvIG1hdHJpeFxuICAgIC8vIGFkZCBibGFuayB0YXJnZXRzIHRvIGFsbCBoeXBlcmxpbmtzIGV4Y2VwdCB2ZWN0b3IgVVJMc1xuICAgICdhJzogZnVuY3Rpb24odGFnTmFtZTogc3RyaW5nLCBhdHRyaWJzOiBzYW5pdGl6ZUh0bWwuQXR0cmlidXRlcykge1xuICAgICAgICBpZiAoYXR0cmlicy5ocmVmKSB7XG4gICAgICAgICAgICBhdHRyaWJzLnRhcmdldCA9ICdfYmxhbmsnOyAvLyBieSBkZWZhdWx0XG5cbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkID0gdHJ5VHJhbnNmb3JtUGVybWFsaW5rVG9Mb2NhbEhyZWYoYXR0cmlicy5ocmVmKTtcbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm1lZCAhPT0gYXR0cmlicy5ocmVmIHx8IGF0dHJpYnMuaHJlZi5tYXRjaChsaW5raWZ5TWF0cml4LkVMRU1FTlRfVVJMX1BBVFRFUk4pKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlicy5ocmVmID0gdHJhbnNmb3JtZWQ7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnMudGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGF0dHJpYnMucmVsID0gJ25vcmVmZXJyZXIgbm9vcGVuZXInOyAvLyBodHRwczovL21hdGhpYXNieW5lbnMuZ2l0aHViLmlvL3JlbC1ub29wZW5lci9cbiAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmlicyB9O1xuICAgIH0sXG4gICAgJ2ltZyc6IGZ1bmN0aW9uKHRhZ05hbWU6IHN0cmluZywgYXR0cmliczogc2FuaXRpemVIdG1sLkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgLy8gU3RyaXAgb3V0IGltZ3MgdGhhdCBhcmVuJ3QgYG14Y2AgaGVyZSBpbnN0ZWFkIG9mIHVzaW5nIGFsbG93ZWRTY2hlbWVzQnlUYWdcbiAgICAgICAgLy8gYmVjYXVzZSB0cmFuc2Zvcm1UYWdzIGlzIHVzZWQgX2JlZm9yZV8gd2UgZmlsdGVyIGJ5IGFsbG93ZWRTY2hlbWVzQnlUYWcgYW5kXG4gICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gYWxsb3cgaW1hZ2VzIHdpdGggYGh0dHBzP2AgYHNyY2BzLlxuICAgICAgICAvLyBXZSBhbHNvIGRyb3AgaW5saW5lIGltYWdlcyAoYXMgaWYgdGhleSB3ZXJlIG5vdCBwcmVzZW50IGF0IGFsbCkgd2hlbiB0aGUgXCJzaG93XG4gICAgICAgIC8vIGltYWdlc1wiIHByZWZlcmVuY2UgaXMgZGlzYWJsZWQuIEZ1dHVyZSB3b3JrIG1pZ2h0IGV4cG9zZSBzb21lIFVJIHRvIHJldmVhbCB0aGVtXG4gICAgICAgIC8vIGxpa2Ugc3RhbmRhbG9uZSBpbWFnZSBldmVudHMgaGF2ZS5cbiAgICAgICAgaWYgKCFhdHRyaWJzLnNyYyB8fCAhYXR0cmlicy5zcmMuc3RhcnRzV2l0aCgnbXhjOi8vJykgfHwgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93SW1hZ2VzXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzOiB7fX07XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlicy5zcmMgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKFxuICAgICAgICAgICAgYXR0cmlicy5zcmMsXG4gICAgICAgICAgICBhdHRyaWJzLndpZHRoIHx8IDgwMCxcbiAgICAgICAgICAgIGF0dHJpYnMuaGVpZ2h0IHx8IDYwMCxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmlicyB9O1xuICAgIH0sXG4gICAgJ2NvZGUnOiBmdW5jdGlvbih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnM6IHNhbml0aXplSHRtbC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXR0cmlicy5jbGFzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIC8vIEZpbHRlciBvdXQgYWxsIGNsYXNzZXMgb3RoZXIgdGhhbiBvbmVzIHN0YXJ0aW5nIHdpdGggbGFuZ3VhZ2UtIGZvciBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IGF0dHJpYnMuY2xhc3Muc3BsaXQoL1xccy8pLmZpbHRlcihmdW5jdGlvbihjbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbC5zdGFydHNXaXRoKCdsYW5ndWFnZS0nKSAmJiAhY2wuc3RhcnRzV2l0aCgnbGFuZ3VhZ2UtXycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhdHRyaWJzLmNsYXNzID0gY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgdGFnTmFtZSwgYXR0cmlicyB9O1xuICAgIH0sXG4gICAgJyonOiBmdW5jdGlvbih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnM6IHNhbml0aXplSHRtbC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIC8vIERlbGV0ZSBhbnkgc3R5bGUgcHJldmlvdXNseSBhc3NpZ25lZCwgc3R5bGUgaXMgYW4gYWxsb3dlZFRhZyBmb3IgZm9udCBhbmQgc3BhblxuICAgICAgICAvLyBiZWNhdXNlIGF0dHJpYnV0ZXMgYXJlIHN0cmlwcGVkIGFmdGVyIHRyYW5zZm9ybWluZ1xuICAgICAgICBkZWxldGUgYXR0cmlicy5zdHlsZTtcblxuICAgICAgICAvLyBTYW5pdGlzZSBhbmQgdHJhbnNmb3JtIGRhdGEtbXgtY29sb3IgYW5kIGRhdGEtbXgtYmctY29sb3IgdG8gdGhlaXIgQ1NTXG4gICAgICAgIC8vIGVxdWl2YWxlbnRzXG4gICAgICAgIGNvbnN0IGN1c3RvbUNTU01hcHBlciA9IHtcbiAgICAgICAgICAgICdkYXRhLW14LWNvbG9yJzogJ2NvbG9yJyxcbiAgICAgICAgICAgICdkYXRhLW14LWJnLWNvbG9yJzogJ2JhY2tncm91bmQtY29sb3InLFxuICAgICAgICAgICAgLy8gJGN1c3RvbUF0dHJpYnV0ZUtleTogJGNzc0F0dHJpYnV0ZUtleVxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBzdHlsZSA9IFwiXCI7XG4gICAgICAgIE9iamVjdC5rZXlzKGN1c3RvbUNTU01hcHBlcikuZm9yRWFjaCgoY3VzdG9tQXR0cmlidXRlS2V5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjc3NBdHRyaWJ1dGVLZXkgPSBjdXN0b21DU1NNYXBwZXJbY3VzdG9tQXR0cmlidXRlS2V5XTtcbiAgICAgICAgICAgIGNvbnN0IGN1c3RvbUF0dHJpYnV0ZVZhbHVlID0gYXR0cmlic1tjdXN0b21BdHRyaWJ1dGVLZXldO1xuICAgICAgICAgICAgaWYgKGN1c3RvbUF0dHJpYnV0ZVZhbHVlICYmXG4gICAgICAgICAgICAgICAgdHlwZW9mIGN1c3RvbUF0dHJpYnV0ZVZhbHVlID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgICAgICAgIENPTE9SX1JFR0VYLnRlc3QoY3VzdG9tQXR0cmlidXRlVmFsdWUpXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICBzdHlsZSArPSBjc3NBdHRyaWJ1dGVLZXkgKyBcIjpcIiArIGN1c3RvbUF0dHJpYnV0ZVZhbHVlICsgXCI7XCI7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGF0dHJpYnNbY3VzdG9tQXR0cmlidXRlS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICBhdHRyaWJzLnN0eWxlID0gc3R5bGU7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbn07XG5cbmNvbnN0IHNhbml0aXplSHRtbFBhcmFtczogSUV4dGVuZGVkU2FuaXRpemVPcHRpb25zID0ge1xuICAgIGFsbG93ZWRUYWdzOiBbXG4gICAgICAgICdmb250JywgLy8gY3VzdG9tIHRvIG1hdHJpeCBmb3IgSVJDLXN0eWxlIGZvbnQgY29sb3JpbmdcbiAgICAgICAgJ2RlbCcsIC8vIGZvciBtYXJrZG93blxuICAgICAgICAnaDEnLCAnaDInLCAnaDMnLCAnaDQnLCAnaDUnLCAnaDYnLCAnYmxvY2txdW90ZScsICdwJywgJ2EnLCAndWwnLCAnb2wnLCAnc3VwJywgJ3N1YicsXG4gICAgICAgICdubCcsICdsaScsICdiJywgJ2knLCAndScsICdzdHJvbmcnLCAnZW0nLCAnc3RyaWtlJywgJ2NvZGUnLCAnaHInLCAnYnInLCAnZGl2JyxcbiAgICAgICAgJ3RhYmxlJywgJ3RoZWFkJywgJ2NhcHRpb24nLCAndGJvZHknLCAndHInLCAndGgnLCAndGQnLCAncHJlJywgJ3NwYW4nLCAnaW1nJyxcbiAgICBdLFxuICAgIGFsbG93ZWRBdHRyaWJ1dGVzOiB7XG4gICAgICAgIC8vIGN1c3RvbSBvbmVzIGZpcnN0OlxuICAgICAgICBmb250OiBbJ2NvbG9yJywgJ2RhdGEtbXgtYmctY29sb3InLCAnZGF0YS1teC1jb2xvcicsICdzdHlsZSddLCAvLyBjdXN0b20gdG8gbWF0cml4XG4gICAgICAgIHNwYW46IFsnZGF0YS1teC1tYXRocycsICdkYXRhLW14LWJnLWNvbG9yJywgJ2RhdGEtbXgtY29sb3InLCAnZGF0YS1teC1zcG9pbGVyJywgJ3N0eWxlJ10sIC8vIGN1c3RvbSB0byBtYXRyaXhcbiAgICAgICAgZGl2OiBbJ2RhdGEtbXgtbWF0aHMnXSxcbiAgICAgICAgYTogWydocmVmJywgJ25hbWUnLCAndGFyZ2V0JywgJ3JlbCddLCAvLyByZW1vdGUgdGFyZ2V0OiBjdXN0b20gdG8gbWF0cml4XG4gICAgICAgIGltZzogWydzcmMnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2FsdCcsICd0aXRsZSddLFxuICAgICAgICBvbDogWydzdGFydCddLFxuICAgICAgICBjb2RlOiBbJ2NsYXNzJ10sIC8vIFdlIGRvbid0IGFjdHVhbGx5IGFsbG93IGFsbCBjbGFzc2VzLCB3ZSBmaWx0ZXIgdGhlbSBpbiB0cmFuc2Zvcm1UYWdzXG4gICAgfSxcbiAgICAvLyBMb3RzIG9mIHRoZXNlIHdvbid0IGNvbWUgdXAgYnkgZGVmYXVsdCBiZWNhdXNlIHdlIGRvbid0IGFsbG93IHRoZW1cbiAgICBzZWxmQ2xvc2luZzogWydpbWcnLCAnYnInLCAnaHInLCAnYXJlYScsICdiYXNlJywgJ2Jhc2Vmb250JywgJ2lucHV0JywgJ2xpbmsnLCAnbWV0YSddLFxuICAgIC8vIFVSTCBzY2hlbWVzIHdlIHBlcm1pdFxuICAgIGFsbG93ZWRTY2hlbWVzOiBQRVJNSVRURURfVVJMX1NDSEVNRVMsXG4gICAgYWxsb3dQcm90b2NvbFJlbGF0aXZlOiBmYWxzZSxcbiAgICB0cmFuc2Zvcm1UYWdzLFxuICAgIC8vIDUwIGxldmVscyBkZWVwIFwic2hvdWxkIGJlIGVub3VnaCBmb3IgYW55b25lXCJcbiAgICBuZXN0aW5nTGltaXQ6IDUwLFxufTtcblxuLy8gdGhpcyBpcyB0aGUgc2FtZSBhcyB0aGUgYWJvdmUgZXhjZXB0IHdpdGggbGVzcyByZXdyaXRpbmdcbmNvbnN0IGNvbXBvc2VyU2FuaXRpemVIdG1sUGFyYW1zOiBJRXh0ZW5kZWRTYW5pdGl6ZU9wdGlvbnMgPSB7XG4gICAgLi4uc2FuaXRpemVIdG1sUGFyYW1zLFxuICAgIHRyYW5zZm9ybVRhZ3M6IHtcbiAgICAgICAgJ2NvZGUnOiB0cmFuc2Zvcm1UYWdzWydjb2RlJ10sXG4gICAgICAgICcqJzogdHJhbnNmb3JtVGFnc1snKiddLFxuICAgIH0sXG59O1xuXG5hYnN0cmFjdCBjbGFzcyBCYXNlSGlnaGxpZ2h0ZXI8VCBleHRlbmRzIFJlYWN0LlJlYWN0Tm9kZT4ge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBoaWdobGlnaHRDbGFzczogc3RyaW5nLCBwdWJsaWMgaGlnaGxpZ2h0TGluazogc3RyaW5nKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogYXBwbHkgdGhlIGhpZ2hsaWdodHMgdG8gYSBzZWN0aW9uIG9mIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzYWZlU25pcHBldCBUaGUgc25pcHBldCBvZiB0ZXh0IHRvIGFwcGx5IHRoZSBoaWdobGlnaHRzXG4gICAgICogICAgIHRvLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNhZmVIaWdobGlnaHRzIEEgbGlzdCBvZiBzdWJzdHJpbmdzIHRvIGhpZ2hsaWdodCxcbiAgICAgKiAgICAgc29ydGVkIGJ5IGRlc2NlbmRpbmcgbGVuZ3RoLlxuICAgICAqXG4gICAgICogcmV0dXJucyBhIGxpc3Qgb2YgcmVzdWx0cyAoc3RyaW5ncyBmb3IgSHRtbEhpZ2hsaWdoZXIsIHJlYWN0IG5vZGVzIGZvclxuICAgICAqIFRleHRIaWdobGlnaHRlcikuXG4gICAgICovXG4gICAgcHVibGljIGFwcGx5SGlnaGxpZ2h0cyhzYWZlU25pcHBldDogc3RyaW5nLCBzYWZlSGlnaGxpZ2h0czogc3RyaW5nW10pOiBUW10ge1xuICAgICAgICBsZXQgbGFzdE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBvZmZzZXQ7XG4gICAgICAgIGxldCBub2RlczogVFtdID0gW107XG5cbiAgICAgICAgY29uc3Qgc2FmZUhpZ2hsaWdodCA9IHNhZmVIaWdobGlnaHRzWzBdO1xuICAgICAgICB3aGlsZSAoKG9mZnNldCA9IHNhZmVTbmlwcGV0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzYWZlSGlnaGxpZ2h0LnRvTG93ZXJDYXNlKCksIGxhc3RPZmZzZXQpKSA+PSAwKSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgcHJlYW1ibGVcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiBsYXN0T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG5vZGVzID0gbm9kZXMuY29uY2F0KHRoaXMuYXBwbHlTdWJIaWdobGlnaHRzKHN1YlNuaXBwZXQsIHNhZmVIaWdobGlnaHRzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIGhpZ2hsaWdodC4gdXNlIHRoZSBvcmlnaW5hbCBzdHJpbmcgcmF0aGVyIHRoYW4gc2FmZUhpZ2hsaWdodFxuICAgICAgICAgICAgLy8gdG8gcHJlc2VydmUgdGhlIG9yaWdpbmFsIGNhc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGVuZE9mZnNldCA9IG9mZnNldCArIHNhZmVIaWdobGlnaHQubGVuZ3RoO1xuICAgICAgICAgICAgbm9kZXMucHVzaCh0aGlzLnByb2Nlc3NTbmlwcGV0KHNhZmVTbmlwcGV0LnN1YnN0cmluZyhvZmZzZXQsIGVuZE9mZnNldCksIHRydWUpKTtcblxuICAgICAgICAgICAgbGFzdE9mZnNldCA9IGVuZE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSBwb3N0YW1ibGVcbiAgICAgICAgaWYgKGxhc3RPZmZzZXQgIT09IHNhZmVTbmlwcGV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgbm9kZXMgPSBub2Rlcy5jb25jYXQodGhpcy5hcHBseVN1YkhpZ2hsaWdodHMoc3ViU25pcHBldCwgc2FmZUhpZ2hsaWdodHMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVN1YkhpZ2hsaWdodHMoc2FmZVNuaXBwZXQ6IHN0cmluZywgc2FmZUhpZ2hsaWdodHM6IHN0cmluZ1tdKTogVFtdIHtcbiAgICAgICAgaWYgKHNhZmVIaWdobGlnaHRzWzFdKSB7XG4gICAgICAgICAgICAvLyByZWN1cnNlIGludG8gdGhpcyByYW5nZSB0byBjaGVjayBmb3IgdGhlIG5leHQgc2V0IG9mIGhpZ2hsaWdodCBtYXRjaGVzXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseUhpZ2hsaWdodHMoc2FmZVNuaXBwZXQsIHNhZmVIaWdobGlnaHRzLnNsaWNlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vIG1vcmUgaGlnaGxpZ2h0cyB0byBiZSBmb3VuZCwganVzdCByZXR1cm4gdGhlIHVuaGlnaGxpZ2h0ZWQgc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gW3RoaXMucHJvY2Vzc1NuaXBwZXQoc2FmZVNuaXBwZXQsIGZhbHNlKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcHJvY2Vzc1NuaXBwZXQoc25pcHBldDogc3RyaW5nLCBoaWdobGlnaHQ6IGJvb2xlYW4pOiBUO1xufVxuXG5jbGFzcyBIdG1sSGlnaGxpZ2h0ZXIgZXh0ZW5kcyBCYXNlSGlnaGxpZ2h0ZXI8c3RyaW5nPiB7XG4gICAgLyogaGlnaGxpZ2h0IHRoZSBnaXZlbiBzbmlwcGV0IGlmIHJlcXVpcmVkXG4gICAgICpcbiAgICAgKiBzbmlwcGV0OiBjb250ZW50IG9mIHRoZSBzcGFuOyBtdXN0IGhhdmUgYmVlbiBzYW5pdGlzZWRcbiAgICAgKiBoaWdobGlnaHQ6IHRydWUgdG8gaGlnaGxpZ2h0IGFzIGEgc2VhcmNoIG1hdGNoXG4gICAgICpcbiAgICAgKiByZXR1cm5zIGFuIEhUTUwgc3RyaW5nXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NTbmlwcGV0KHNuaXBwZXQ6IHN0cmluZywgaGlnaGxpZ2h0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFoaWdobGlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5vdGhpbmcgcmVxdWlyZWQgaGVyZVxuICAgICAgICAgICAgcmV0dXJuIHNuaXBwZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3BhbiA9IGA8c3BhbiBjbGFzcz1cIiR7dGhpcy5oaWdobGlnaHRDbGFzc31cIj4ke3NuaXBwZXR9PC9zcGFuPmA7XG5cbiAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0TGluaykge1xuICAgICAgICAgICAgc3BhbiA9IGA8YSBocmVmPVwiJHtlbmNvZGVVUkkodGhpcy5oaWdobGlnaHRMaW5rKX1cIj4ke3NwYW59PC9hPmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNwYW47XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSUNvbnRlbnQge1xuICAgIGZvcm1hdD86IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgZm9ybWF0dGVkX2JvZHk/OiBzdHJpbmc7XG4gICAgYm9keTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSU9wdHMge1xuICAgIGhpZ2hsaWdodExpbms/OiBzdHJpbmc7XG4gICAgZGlzYWJsZUJpZ0Vtb2ppPzogYm9vbGVhbjtcbiAgICBzdHJpcFJlcGx5RmFsbGJhY2s/OiBib29sZWFuO1xuICAgIHJldHVyblN0cmluZz86IGJvb2xlYW47XG4gICAgZm9yQ29tcG9zZXJRdW90ZT86IGJvb2xlYW47XG4gICAgcmVmPzogUmVhY3QuUmVmPGFueT47XG59XG5cbi8qIHR1cm4gYSBtYXRyaXggZXZlbnQgYm9keSBpbnRvIGh0bWxcbiAqXG4gKiBjb250ZW50OiAnY29udGVudCcgb2YgdGhlIE1hdHJpeEV2ZW50XG4gKlxuICogaGlnaGxpZ2h0czogb3B0aW9uYWwgbGlzdCBvZiB3b3JkcyB0byBoaWdobGlnaHQsIG9yZGVyZWQgYnkgbG9uZ2VzdCB3b3JkIGZpcnN0XG4gKlxuICogb3B0cy5oaWdobGlnaHRMaW5rOiBvcHRpb25hbCBocmVmIHRvIGFkZCB0byBoaWdobGlnaHRlZCB3b3Jkc1xuICogb3B0cy5kaXNhYmxlQmlnRW1vamk6IG9wdGlvbmFsIGFyZ3VtZW50IHRvIGRpc2FibGUgdGhlIGJpZyBlbW9qaSBjbGFzcy5cbiAqIG9wdHMuc3RyaXBSZXBseUZhbGxiYWNrOiBvcHRpb25hbCBhcmd1bWVudCBzcGVjaWZ5aW5nIHRoZSBldmVudCBpcyBhIHJlcGx5IGFuZCBzbyBmYWxsYmFjayBuZWVkcyByZW1vdmluZ1xuICogb3B0cy5yZXR1cm5TdHJpbmc6IHJldHVybiBhbiBIVE1MIHN0cmluZyByYXRoZXIgdGhhbiBKU1ggZWxlbWVudHNcbiAqIG9wdHMuZm9yQ29tcG9zZXJRdW90ZTogb3B0aW9uYWwgcGFyYW0gdG8gbGVzc2VuIHRoZSB1cmwgcmV3cml0aW5nIGRvbmUgYnkgc2FuaXRpemF0aW9uLCBmb3IgcXVvdGluZyBpbnRvIGNvbXBvc2VyXG4gKiBvcHRzLnJlZjogUmVhY3QgcmVmIHRvIGF0dGFjaCB0byBhbnkgUmVhY3QgY29tcG9uZW50cyByZXR1cm5lZCAobm90IGNvbXBhdGlibGUgd2l0aCBvcHRzLnJldHVyblN0cmluZylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvZHlUb0h0bWwoY29udGVudDogSUNvbnRlbnQsIGhpZ2hsaWdodHM6IHN0cmluZ1tdLCBvcHRzOiBJT3B0cyA9IHt9KSB7XG4gICAgY29uc3QgaXNIdG1sTWVzc2FnZSA9IGNvbnRlbnQuZm9ybWF0ID09PSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIiAmJiBjb250ZW50LmZvcm1hdHRlZF9ib2R5O1xuICAgIGxldCBib2R5SGFzRW1vamkgPSBmYWxzZTtcblxuICAgIGxldCBzYW5pdGl6ZVBhcmFtcyA9IHNhbml0aXplSHRtbFBhcmFtcztcbiAgICBpZiAob3B0cy5mb3JDb21wb3NlclF1b3RlKSB7XG4gICAgICAgIHNhbml0aXplUGFyYW1zID0gY29tcG9zZXJTYW5pdGl6ZUh0bWxQYXJhbXM7XG4gICAgfVxuXG4gICAgbGV0IHN0cmlwcGVkQm9keTogc3RyaW5nO1xuICAgIGxldCBzYWZlQm9keTogc3RyaW5nO1xuICAgIGxldCBpc0Rpc3BsYXllZFdpdGhIdG1sOiBib29sZWFuO1xuICAgIC8vIFhYWDogV2Ugc2FuaXRpemUgdGhlIEhUTUwgd2hpbHN0IGFsc28gaGlnaGxpZ2h0aW5nIGl0cyB0ZXh0IG5vZGVzLCB0byBhdm9pZCBhY2NpZGVudGFsbHkgdHJ5aW5nXG4gICAgLy8gdG8gaGlnaGxpZ2h0IEhUTUwgdGFncyB0aGVtc2VsdmVzLiAgSG93ZXZlciwgdGhpcyBkb2VzIG1lYW4gdGhhdCB3ZSBkb24ndCBoaWdobGlnaHQgdGV4dG5vZGVzIHdoaWNoXG4gICAgLy8gYXJlIGludGVycnVwdGVkIGJ5IEhUTUwgdGFncyAobm90IHRoYXQgd2UgZGlkIGJlZm9yZSkgLSBlLmcuIGZvbzxzcGFuLz5iYXIgd29uJ3QgZ2V0IGhpZ2hsaWdodGVkXG4gICAgLy8gYnkgYW4gYXR0ZW1wdCB0byBzZWFyY2ggZm9yICdmb29iYXInLiAgVGhlbiBhZ2FpbiwgdGhlIHNlYXJjaCBxdWVyeSBwcm9iYWJseSB3b3VsZG4ndCB3b3JrIGVpdGhlclxuICAgIHRyeSB7XG4gICAgICAgIGlmIChoaWdobGlnaHRzICYmIGhpZ2hsaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZXIgPSBuZXcgSHRtbEhpZ2hsaWdodGVyKFwibXhfRXZlbnRUaWxlX3NlYXJjaEhpZ2hsaWdodFwiLCBvcHRzLmhpZ2hsaWdodExpbmspO1xuICAgICAgICAgICAgY29uc3Qgc2FmZUhpZ2hsaWdodHMgPSBoaWdobGlnaHRzLm1hcChmdW5jdGlvbihoaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2FuaXRpemVIdG1sKGhpZ2hsaWdodCwgc2FuaXRpemVQYXJhbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBYWFg6IGhhY2t5IGJvZGdlIHRvIHRlbXBvcmFyaWx5IGFwcGx5IGEgdGV4dEZpbHRlciB0byB0aGUgc2FuaXRpemVQYXJhbXMgc3RydWN0dXJlLlxuICAgICAgICAgICAgc2FuaXRpemVQYXJhbXMudGV4dEZpbHRlciA9IGZ1bmN0aW9uKHNhZmVUZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhpZ2hsaWdodGVyLmFwcGx5SGlnaGxpZ2h0cyhzYWZlVGV4dCwgc2FmZUhpZ2hsaWdodHMpLmpvaW4oJycpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmb3JtYXR0ZWRCb2R5ID0gdHlwZW9mIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPT09ICdzdHJpbmcnID8gY29udGVudC5mb3JtYXR0ZWRfYm9keSA6IG51bGw7XG4gICAgICAgIGNvbnN0IHBsYWluQm9keSA9IHR5cGVvZiBjb250ZW50LmJvZHkgPT09ICdzdHJpbmcnID8gY29udGVudC5ib2R5IDogXCJcIjtcblxuICAgICAgICBpZiAob3B0cy5zdHJpcFJlcGx5RmFsbGJhY2sgJiYgZm9ybWF0dGVkQm9keSkgZm9ybWF0dGVkQm9keSA9IFJlcGx5VGhyZWFkLnN0cmlwSFRNTFJlcGx5KGZvcm1hdHRlZEJvZHkpO1xuICAgICAgICBzdHJpcHBlZEJvZHkgPSBvcHRzLnN0cmlwUmVwbHlGYWxsYmFjayA/IFJlcGx5VGhyZWFkLnN0cmlwUGxhaW5SZXBseShwbGFpbkJvZHkpIDogcGxhaW5Cb2R5O1xuXG4gICAgICAgIGJvZHlIYXNFbW9qaSA9IG1pZ2h0Q29udGFpbkVtb2ppKGlzSHRtbE1lc3NhZ2UgPyBmb3JtYXR0ZWRCb2R5IDogcGxhaW5Cb2R5KTtcblxuICAgICAgICAvLyBPbmx5IGdlbmVyYXRlIHNhZmVCb2R5IGlmIHRoZSBtZXNzYWdlIHdhcyBzZW50IGFzIG9yZy5tYXRyaXguY3VzdG9tLmh0bWxcbiAgICAgICAgaWYgKGlzSHRtbE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlzRGlzcGxheWVkV2l0aEh0bWwgPSB0cnVlO1xuICAgICAgICAgICAgc2FmZUJvZHkgPSBzYW5pdGl6ZUh0bWwoZm9ybWF0dGVkQm9keSwgc2FuaXRpemVQYXJhbXMpO1xuXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwaHRtbCA9IGNoZWVyaW8ubG9hZChzYWZlQm9keSxcbiAgICAgICAgICAgICAgICAgICAgeyBfdXNlSHRtbFBhcnNlcjI6IHRydWUsIGRlY29kZUVudGl0aWVzOiBmYWxzZSB9KVxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUaGUgdHlwZXMgZm9yIGByZXBsYWNlV2l0aGAgd3JvbmdseSBleHBlY3RcbiAgICAgICAgICAgICAgICAvLyBDaGVlcmlvIGluc3RhbmNlIHRvIGJlIHJldHVybmVkLlxuICAgICAgICAgICAgICAgIHBodG1sKCdkaXYsIHNwYW5bZGF0YS1teC1tYXRocyE9XCJcIl0nKS5yZXBsYWNlV2l0aChmdW5jdGlvbihpLCBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrYXRleC5yZW5kZXJUb1N0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEFsbEh0bWxFbnRpdGllcy5kZWNvZGUocGh0bWwoZSkuYXR0cignZGF0YS1teC1tYXRocycpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvd09uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RlOiBlLm5hbWUgPT0gJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBcImh0bWxBbmRNYXRobWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNhZmVCb2R5ID0gcGh0bWwuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZGVsZXRlIHNhbml0aXplUGFyYW1zLnRleHRGaWx0ZXI7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudEJvZHkgPSBpc0Rpc3BsYXllZFdpdGhIdG1sID8gc2FmZUJvZHkgOiBzdHJpcHBlZEJvZHk7XG4gICAgaWYgKG9wdHMucmV0dXJuU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50Qm9keTtcbiAgICB9XG5cbiAgICBsZXQgZW1vamlCb2R5ID0gZmFsc2U7XG4gICAgaWYgKCFvcHRzLmRpc2FibGVCaWdFbW9qaSAmJiBib2R5SGFzRW1vamkpIHtcbiAgICAgICAgbGV0IGNvbnRlbnRCb2R5VHJpbW1lZCA9IGNvbnRlbnRCb2R5ICE9PSB1bmRlZmluZWQgPyBjb250ZW50Qm9keS50cmltKCkgOiAnJztcblxuICAgICAgICAvLyBJZ25vcmUgc3BhY2VzIGluIGJvZHkgdGV4dC4gRW1vamlzIHdpdGggc3BhY2VzIGluIGJldHdlZW4gc2hvdWxkXG4gICAgICAgIC8vIHN0aWxsIGJlIGNvdW50ZWQgYXMgcHVyZWx5IGVtb2ppIG1lc3NhZ2VzLlxuICAgICAgICBjb250ZW50Qm9keVRyaW1tZWQgPSBjb250ZW50Qm9keVRyaW1tZWQucmVwbGFjZShXSElURVNQQUNFX1JFR0VYLCAnJyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHplcm8gd2lkdGggam9pbmVyIGNoYXJhY3RlcnMgZnJvbSBlbW9qaSBtZXNzYWdlcy4gVGhpcyBlbnN1cmVzXG4gICAgICAgIC8vIHRoYXQgZW1vamlzIHRoYXQgYXJlIG1hZGUgdXAgb2YgbXVsdGlwbGUgdW5pY29kZSBjaGFyYWN0ZXJzIGFyZSBzdGlsbFxuICAgICAgICAvLyBwcmVzZW50ZWQgYXMgbGFyZ2UuXG4gICAgICAgIGNvbnRlbnRCb2R5VHJpbW1lZCA9IGNvbnRlbnRCb2R5VHJpbW1lZC5yZXBsYWNlKFpXSl9SRUdFWCwgJycpO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoID0gQklHRU1PSklfUkVHRVguZXhlYyhjb250ZW50Qm9keVRyaW1tZWQpO1xuICAgICAgICBlbW9qaUJvZHkgPSBtYXRjaCAmJiBtYXRjaFswXSAmJiBtYXRjaFswXS5sZW5ndGggPT09IGNvbnRlbnRCb2R5VHJpbW1lZC5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCB1c2VyIHBpbGxzIGV4cGFuZGluZyBmb3IgdXNlcnMgd2l0aCBvbmx5IGVtb2ppIGluXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZWlyIHVzZXJuYW1lLiBQZXJtYWxpbmtzIChsaW5rcyBpbiBwaWxscykgY2FuIGJlIGFueSBVUkxcbiAgICAgICAgICAgICAgICAgICAgLy8gbm93LCBzbyB3ZSBqdXN0IGNoZWNrIGZvciBhbiBIVFRQLWxvb2tpbmcgdGhpbmcuXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwcGVkQm9keSA9PT0gc2FmZUJvZHkgfHwgLy8gcmVwbGllcyBoYXZlIHRoZSBodG1sIGZhbGxiYWNrcywgYWNjb3VudCBmb3IgdGhhdCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LmZvcm1hdHRlZF9ib2R5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICghY29udGVudC5mb3JtYXR0ZWRfYm9keS5pbmNsdWRlcyhcImh0dHA6XCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhY29udGVudC5mb3JtYXR0ZWRfYm9keS5pbmNsdWRlcyhcImh0dHBzOlwiKSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgJ214X0V2ZW50VGlsZV9ib2R5JzogdHJ1ZSxcbiAgICAgICAgJ214X0V2ZW50VGlsZV9iaWdFbW9qaSc6IGVtb2ppQm9keSxcbiAgICAgICAgJ21hcmtkb3duLWJvZHknOiBpc0h0bWxNZXNzYWdlICYmICFlbW9qaUJvZHksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXNEaXNwbGF5ZWRXaXRoSHRtbCA/XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgICBrZXk9XCJib2R5XCJcbiAgICAgICAgICAgIHJlZj17b3B0cy5yZWZ9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc2FmZUJvZHkgfX1cbiAgICAgICAgICAgIGRpcj1cImF1dG9cIlxuICAgICAgICAvPiA6IDxzcGFuIGtleT1cImJvZHlcIiByZWY9e29wdHMucmVmfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gZGlyPVwiYXV0b1wiPnsgc3RyaXBwZWRCb2R5IH08L3NwYW4+O1xufVxuXG4vKipcbiAqIExpbmtpZmllcyB0aGUgZ2l2ZW4gc3RyaW5nLiBUaGlzIGlzIGEgd3JhcHBlciBhcm91bmQgJ2xpbmtpZnlqcy9zdHJpbmcnLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgc3RyaW5nIHRvIGxpbmtpZnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBmb3IgbGlua2lmeVN0cmluZy4gRGVmYXVsdDogbGlua2lmeU1hdHJpeC5vcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBMaW5raWZpZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5U3RyaW5nKHN0cjogc3RyaW5nLCBvcHRpb25zID0gbGlua2lmeU1hdHJpeC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIF9saW5raWZ5U3RyaW5nKHN0ciwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogTGlua2lmaWVzIHRoZSBnaXZlbiBET00gZWxlbWVudC4gVGhpcyBpcyBhIHdyYXBwZXIgYXJvdW5kICdsaW5raWZ5anMvZWxlbWVudCcuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGVsZW1lbnQgRE9NIGVsZW1lbnQgdG8gbGlua2lmeVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIGZvciBsaW5raWZ5RWxlbWVudC4gRGVmYXVsdDogbGlua2lmeU1hdHJpeC5vcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlua2lmeUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnMgPSBsaW5raWZ5TWF0cml4Lm9wdGlvbnMpIHtcbiAgICByZXR1cm4gX2xpbmtpZnlFbGVtZW50KGVsZW1lbnQsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIExpbmtpZnkgdGhlIGdpdmVuIHN0cmluZyBhbmQgc2FuaXRpemUgdGhlIEhUTUwgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlydHlIdG1sIFRoZSBIVE1MIHN0cmluZyB0byBzYW5pdGl6ZSBhbmQgbGlua2lmeVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIGZvciBsaW5raWZ5U3RyaW5nLiBEZWZhdWx0OiBsaW5raWZ5TWF0cml4Lm9wdGlvbnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5QW5kU2FuaXRpemVIdG1sKGRpcnR5SHRtbDogc3RyaW5nLCBvcHRpb25zID0gbGlua2lmeU1hdHJpeC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIHNhbml0aXplSHRtbChsaW5raWZ5U3RyaW5nKGRpcnR5SHRtbCwgb3B0aW9ucyksIHNhbml0aXplSHRtbFBhcmFtcyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBpZiBhIG5vZGUgaXMgYSBibG9jayBlbGVtZW50IG9yIG5vdC5cbiAqIE9ubHkgdGFrZXMgaHRtbCBub2RlcyBpbnRvIGFjY291bnQgdGhhdCBhcmUgYWxsb3dlZCBpbiBtYXRyaXggbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJucyB7Ym9vbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQmxvY2tOb2RlKG5vZGU6IE5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUubm9kZU5hbWUpIHtcbiAgICAgICAgY2FzZSBcIkgxXCI6XG4gICAgICAgIGNhc2UgXCJIMlwiOlxuICAgICAgICBjYXNlIFwiSDNcIjpcbiAgICAgICAgY2FzZSBcIkg0XCI6XG4gICAgICAgIGNhc2UgXCJINVwiOlxuICAgICAgICBjYXNlIFwiSDZcIjpcbiAgICAgICAgY2FzZSBcIlBSRVwiOlxuICAgICAgICBjYXNlIFwiQkxPQ0tRVU9URVwiOlxuICAgICAgICBjYXNlIFwiUFwiOlxuICAgICAgICBjYXNlIFwiVUxcIjpcbiAgICAgICAgY2FzZSBcIk9MXCI6XG4gICAgICAgIGNhc2UgXCJMSVwiOlxuICAgICAgICBjYXNlIFwiSFJcIjpcbiAgICAgICAgY2FzZSBcIlRBQkxFXCI6XG4gICAgICAgIGNhc2UgXCJUSEVBRFwiOlxuICAgICAgICBjYXNlIFwiVEJPRFlcIjpcbiAgICAgICAgY2FzZSBcIlRSXCI6XG4gICAgICAgIGNhc2UgXCJUSFwiOlxuICAgICAgICBjYXNlIFwiVERcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlIFwiRElWXCI6XG4gICAgICAgICAgICAvLyBkb24ndCB0cmVhdCBtYXRoIG5vZGVzIGFzIGJsb2NrIG5vZGVzIGZvciBkZXNlcmlhbGl6aW5nXG4gICAgICAgICAgICByZXR1cm4gIShub2RlIGFzIEhUTUxFbGVtZW50KS5oYXNBdHRyaWJ1dGUoXCJkYXRhLW14LW1hdGhzXCIpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==