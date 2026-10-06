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
exports.getHtmlText = getHtmlText;
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

var _Permalinks = require("./utils/permalinks/Permalinks");

var _emoji = require("./emoji");

var _ReplyThread = _interopRequireDefault(require("./components/views/elements/ReplyThread"));

var _Media = require("./customisations/Media");

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

function getHtmlText(insaneHtml
/*: string*/
) {
  return (0, _sanitizeHtml.default)(insaneHtml, {
    allowedTags: [],
    allowedAttributes: {},
    selfClosing: [],
    allowedSchemes: [],
    disallowedTagsMode: 'discard'
  });
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

    const width = Number(attribs.width) || 800;
    const height = Number(attribs.height) || 600;
    attribs.src = (0, _Media.mediaFromMxc)(attribs.src).getThumbnailOfSourceHttp(width, height);
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
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'sup', 'sub', 'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img', 'details', 'summary'],
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9IdG1sVXRpbHMudHN4Il0sIm5hbWVzIjpbImxpbmtpZnkiLCJTVVJST0dBVEVfUEFJUl9QQVRURVJOIiwiU1lNQk9MX1BBVFRFUk4iLCJaV0pfUkVHRVgiLCJSZWdFeHAiLCJXSElURVNQQUNFX1JFR0VYIiwiQklHRU1PSklfUkVHRVgiLCJFTU9KSUJBU0VfUkVHRVgiLCJzb3VyY2UiLCJDT0xPUl9SRUdFWCIsIlBFUk1JVFRFRF9VUkxfU0NIRU1FUyIsIm1pZ2h0Q29udGFpbkVtb2ppIiwic3RyIiwidGVzdCIsInVuaWNvZGVUb1Nob3J0Y29kZSIsImNoYXIiLCJkYXRhIiwic2hvcnRjb2RlcyIsInNob3J0Y29kZVRvVW5pY29kZSIsInNob3J0Y29kZSIsInNsaWNlIiwibGVuZ3RoIiwiU0hPUlRDT0RFX1RPX0VNT0pJIiwiZ2V0IiwidW5pY29kZSIsInByb2Nlc3NIdG1sRm9yU2VuZGluZyIsImh0bWwiLCJjb250ZW50RGl2IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiY2hpbGRyZW4iLCJjb250ZW50SFRNTCIsImkiLCJlbGVtZW50IiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwidGVtcCIsImFwcGVuZENoaWxkIiwiY2xvbmVOb2RlIiwic2FuaXRpemVkSHRtbE5vZGUiLCJpbnNhbmVIdG1sIiwic2FuZUh0bWwiLCJzYW5pdGl6ZUh0bWxQYXJhbXMiLCJfX2h0bWwiLCJnZXRIdG1sVGV4dCIsImFsbG93ZWRUYWdzIiwiYWxsb3dlZEF0dHJpYnV0ZXMiLCJzZWxmQ2xvc2luZyIsImFsbG93ZWRTY2hlbWVzIiwiZGlzYWxsb3dlZFRhZ3NNb2RlIiwiaXNVcmxQZXJtaXR0ZWQiLCJpbnB1dFVybCIsInBhcnNlZCIsInVybCIsInBhcnNlIiwicHJvdG9jb2wiLCJpbmNsdWRlcyIsImUiLCJ0cmFuc2Zvcm1UYWdzIiwiYXR0cmlicyIsImhyZWYiLCJ0YXJnZXQiLCJ0cmFuc2Zvcm1lZCIsIm1hdGNoIiwibGlua2lmeU1hdHJpeCIsIkVMRU1FTlRfVVJMX1BBVFRFUk4iLCJyZWwiLCJzcmMiLCJzdGFydHNXaXRoIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwid2lkdGgiLCJOdW1iZXIiLCJoZWlnaHQiLCJnZXRUaHVtYm5haWxPZlNvdXJjZUh0dHAiLCJjbGFzcyIsImNsYXNzZXMiLCJzcGxpdCIsImZpbHRlciIsImNsIiwiam9pbiIsInN0eWxlIiwiY3VzdG9tQ1NTTWFwcGVyIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJjdXN0b21BdHRyaWJ1dGVLZXkiLCJjc3NBdHRyaWJ1dGVLZXkiLCJjdXN0b21BdHRyaWJ1dGVWYWx1ZSIsImZvbnQiLCJzcGFuIiwiZGl2IiwiYSIsImltZyIsIm9sIiwiY29kZSIsImFsbG93UHJvdG9jb2xSZWxhdGl2ZSIsIm5lc3RpbmdMaW1pdCIsImNvbXBvc2VyU2FuaXRpemVIdG1sUGFyYW1zIiwiQmFzZUhpZ2hsaWdodGVyIiwiY29uc3RydWN0b3IiLCJoaWdobGlnaHRDbGFzcyIsImhpZ2hsaWdodExpbmsiLCJhcHBseUhpZ2hsaWdodHMiLCJzYWZlU25pcHBldCIsInNhZmVIaWdobGlnaHRzIiwibGFzdE9mZnNldCIsIm9mZnNldCIsIm5vZGVzIiwic2FmZUhpZ2hsaWdodCIsImluZGV4T2YiLCJzdWJTbmlwcGV0Iiwic3Vic3RyaW5nIiwiY29uY2F0IiwiYXBwbHlTdWJIaWdobGlnaHRzIiwiZW5kT2Zmc2V0IiwicHVzaCIsInByb2Nlc3NTbmlwcGV0IiwidW5kZWZpbmVkIiwiSHRtbEhpZ2hsaWdodGVyIiwic25pcHBldCIsImhpZ2hsaWdodCIsImVuY29kZVVSSSIsImJvZHlUb0h0bWwiLCJjb250ZW50IiwiaGlnaGxpZ2h0cyIsIm9wdHMiLCJpc0h0bWxNZXNzYWdlIiwiZm9ybWF0IiwiZm9ybWF0dGVkX2JvZHkiLCJib2R5SGFzRW1vamkiLCJzYW5pdGl6ZVBhcmFtcyIsImZvckNvbXBvc2VyUXVvdGUiLCJzdHJpcHBlZEJvZHkiLCJzYWZlQm9keSIsImlzRGlzcGxheWVkV2l0aEh0bWwiLCJoaWdobGlnaHRlciIsIm1hcCIsInRleHRGaWx0ZXIiLCJzYWZlVGV4dCIsImZvcm1hdHRlZEJvZHkiLCJwbGFpbkJvZHkiLCJib2R5Iiwic3RyaXBSZXBseUZhbGxiYWNrIiwiUmVwbHlUaHJlYWQiLCJzdHJpcEhUTUxSZXBseSIsInN0cmlwUGxhaW5SZXBseSIsInBodG1sIiwiY2hlZXJpbyIsImxvYWQiLCJfdXNlSHRtbFBhcnNlcjIiLCJkZWNvZGVFbnRpdGllcyIsInJlcGxhY2VXaXRoIiwia2F0ZXgiLCJyZW5kZXJUb1N0cmluZyIsIkFsbEh0bWxFbnRpdGllcyIsImRlY29kZSIsImF0dHIiLCJ0aHJvd09uRXJyb3IiLCJkaXNwbGF5TW9kZSIsIm5hbWUiLCJvdXRwdXQiLCJjb250ZW50Qm9keSIsInJldHVyblN0cmluZyIsImVtb2ppQm9keSIsImRpc2FibGVCaWdFbW9qaSIsImNvbnRlbnRCb2R5VHJpbW1lZCIsInRyaW0iLCJyZXBsYWNlIiwiZXhlYyIsImNsYXNzTmFtZSIsInJlZiIsImxpbmtpZnlTdHJpbmciLCJvcHRpb25zIiwibGlua2lmeUVsZW1lbnQiLCJsaW5raWZ5QW5kU2FuaXRpemVIdG1sIiwiZGlydHlIdG1sIiwiY2hlY2tCbG9ja05vZGUiLCJub2RlIiwibm9kZU5hbWUiLCJoYXNBdHRyaWJ1dGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsNEJBQWNBLE9BQWQsRSxDQUVBOztBQUNBLE1BQU1DLHNCQUFzQixHQUFHLG9DQUEvQixDLENBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLG1CQUF2QixDLENBRUE7O0FBQ0EsTUFBTUMsU0FBUyxHQUFHLElBQUlDLE1BQUosQ0FBVyxlQUFYLEVBQTRC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RCxDQUFzQkUsWUFBdEIsQ0FBbUMsZUFBbkMsQ0FBUjs7QUFDSjtBQUNJLGFBQU8sS0FBUDtBQXpCUjtBQTJCSCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcsIDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHNhbml0aXplSHRtbCBmcm9tICdzYW5pdGl6ZS1odG1sJztcbmltcG9ydCB7IElFeHRlbmRlZFNhbml0aXplT3B0aW9ucyB9IGZyb20gJy4vQHR5cGVzL3Nhbml0aXplLWh0bWwnO1xuaW1wb3J0ICogYXMgbGlua2lmeSBmcm9tICdsaW5raWZ5anMnO1xuaW1wb3J0IGxpbmtpZnlNYXRyaXggZnJvbSAnLi9saW5raWZ5LW1hdHJpeCc7XG5pbXBvcnQgX2xpbmtpZnlFbGVtZW50IGZyb20gJ2xpbmtpZnlqcy9lbGVtZW50JztcbmltcG9ydCBfbGlua2lmeVN0cmluZyBmcm9tICdsaW5raWZ5anMvc3RyaW5nJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IEVNT0pJQkFTRV9SRUdFWCBmcm9tICdlbW9qaWJhc2UtcmVnZXgnO1xuaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IGthdGV4IGZyb20gJ2thdGV4JztcbmltcG9ydCB7IEFsbEh0bWxFbnRpdGllcyB9IGZyb20gJ2h0bWwtZW50aXRpZXMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nO1xuXG5pbXBvcnQge3RyeVRyYW5zZm9ybVBlcm1hbGlua1RvTG9jYWxIcmVmfSBmcm9tIFwiLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7U0hPUlRDT0RFX1RPX0VNT0pJLCBnZXRFbW9qaUZyb21Vbmljb2RlfSBmcm9tIFwiLi9lbW9qaVwiO1xuaW1wb3J0IFJlcGx5VGhyZWFkIGZyb20gXCIuL2NvbXBvbmVudHMvdmlld3MvZWxlbWVudHMvUmVwbHlUaHJlYWRcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuXG5saW5raWZ5TWF0cml4KGxpbmtpZnkpO1xuXG4vLyBBbnl0aGluZyBvdXRzaWRlIHRoZSBiYXNpYyBtdWx0aWxpbmd1YWwgcGxhbmUgd2lsbCBiZSBhIHN1cnJvZ2F0ZSBwYWlyXG5jb25zdCBTVVJST0dBVEVfUEFJUl9QQVRURVJOID0gLyhbXFx1ZDgwMC1cXHVkYmZmXSkoW1xcdWRjMDAtXFx1ZGZmZl0pLztcbi8vIEFuZCB0aGVyZSBhIGJ1bmNoIG1vcmUgc3ltYm9sIGNoYXJhY3RlcnMgdGhhdCBlbW9qaWJhc2UgaGFzIHdpdGhpbiB0aGVcbi8vIEJNUCwgc28gdGhpcyBpbmNsdWRlcyB0aGUgcmFuZ2VzIGZyb20gJ2xldHRlcmxpa2Ugc3ltYm9scycgdG9cbi8vICdtaXNjZWxsYW5lb3VzIHN5bWJvbHMgYW5kIGFycm93cycgd2hpY2ggc2hvdWxkIGNhdGNoIGFsbCBvZiB0aGVtXG4vLyAod2l0aCBwbGVudHkgb2YgZmFsc2UgcG9zaXRpdmVzLCBidXQgdGhhdCdzIE9LKVxuY29uc3QgU1lNQk9MX1BBVFRFUk4gPSAvKFtcXHUyMTAwLVxcdTJiZmZdKS87XG5cbi8vIFJlZ2V4IHBhdHRlcm4gZm9yIFplcm8tV2lkdGggam9pbmVyIHVuaWNvZGUgY2hhcmFjdGVyc1xuY29uc3QgWldKX1JFR0VYID0gbmV3IFJlZ0V4cChcIlxcdTIwMER8XFx1MjAwM1wiLCBcImdcIik7XG5cbi8vIFJlZ2V4IHBhdHRlcm4gZm9yIHdoaXRlc3BhY2UgY2hhcmFjdGVyc1xuY29uc3QgV0hJVEVTUEFDRV9SRUdFWCA9IG5ldyBSZWdFeHAoXCJcXFxcc1wiLCBcImdcIik7XG5cbmNvbnN0IEJJR0VNT0pJX1JFR0VYID0gbmV3IFJlZ0V4cChgXigke0VNT0pJQkFTRV9SRUdFWC5zb3VyY2V9KSskYCwgJ2knKTtcblxuY29uc3QgQ09MT1JfUkVHRVggPSAvXiNbMC05YS1mQS1GXXs2fSQvO1xuXG5leHBvcnQgY29uc3QgUEVSTUlUVEVEX1VSTF9TQ0hFTUVTID0gWydodHRwJywgJ2h0dHBzJywgJ2Z0cCcsICdtYWlsdG8nLCAnbWFnbmV0J107XG5cbi8qXG4gKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgZ2l2ZW4gc3RyaW5nIGNvbnRhaW5zIGVtb2ppXG4gKiBVc2VzIGEgbXVjaCwgbXVjaCBzaW1wbGVyIHJlZ2V4IHRoYW4gZW1vamliYXNlJ3Mgc28gd2lsbCBnaXZlIGZhbHNlXG4gKiBwb3NpdGl2ZXMsIGJ1dCB1c2VmdWwgZm9yIGZhc3QtcGF0aCB0ZXN0aW5nIHN0cmluZ3MgdG8gc2VlIGlmIHRoZXlcbiAqIG5lZWQgZW1vamlmaWNhdGlvbi5cbiAqIHVuaWNvZGVUb0ltYWdlIHVzZXMgdGhpcyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWlnaHRDb250YWluRW1vamkoc3RyOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gU1VSUk9HQVRFX1BBSVJfUEFUVEVSTi50ZXN0KHN0cikgfHwgU1lNQk9MX1BBVFRFUk4udGVzdChzdHIpO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHNob3J0Y29kZSBmb3IgYW4gZW1vamkgY2hhcmFjdGVyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBjaGFyIFRoZSBlbW9qaSBjaGFyYWN0ZXJcbiAqIEByZXR1cm4ge1N0cmluZ30gVGhlIHNob3J0Y29kZSAoc3VjaCBhcyA6dGh1bWJ1cDopXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bmljb2RlVG9TaG9ydGNvZGUoY2hhcjogc3RyaW5nKSB7XG4gICAgY29uc3QgZGF0YSA9IGdldEVtb2ppRnJvbVVuaWNvZGUoY2hhcik7XG4gICAgcmV0dXJuIChkYXRhICYmIGRhdGEuc2hvcnRjb2RlcyA/IGA6JHtkYXRhLnNob3J0Y29kZXNbMF19OmAgOiAnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgdW5pY29kZSBjaGFyYWN0ZXIgZm9yIGFuIGVtb2ppIHNob3J0Y29kZVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzaG9ydGNvZGUgVGhlIHNob3J0Y29kZSAoc3VjaCBhcyA6dGh1bWJ1cDopXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFRoZSBlbW9qaSBjaGFyYWN0ZXI7IG51bGwgaWYgbm9uZSBleGlzdHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3J0Y29kZVRvVW5pY29kZShzaG9ydGNvZGU6IHN0cmluZykge1xuICAgIHNob3J0Y29kZSA9IHNob3J0Y29kZS5zbGljZSgxLCBzaG9ydGNvZGUubGVuZ3RoIC0gMSk7XG4gICAgY29uc3QgZGF0YSA9IFNIT1JUQ09ERV9UT19FTU9KSS5nZXQoc2hvcnRjb2RlKTtcbiAgICByZXR1cm4gZGF0YSA/IGRhdGEudW5pY29kZSA6IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzSHRtbEZvclNlbmRpbmcoaHRtbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBjb250ZW50RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY29udGVudERpdi5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgaWYgKGNvbnRlbnREaXYuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50RGl2LmlubmVySFRNTDtcbiAgICB9XG5cbiAgICBsZXQgY29udGVudEhUTUwgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29udGVudERpdi5jaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gY29udGVudERpdi5jaGlsZHJlbltpXTtcbiAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAncCcpIHtcbiAgICAgICAgICAgIGNvbnRlbnRIVE1MICs9IGVsZW1lbnQuaW5uZXJIVE1MO1xuICAgICAgICAgICAgLy8gRG9uJ3QgYWRkIGEgPGJyIC8+IGZvciB0aGUgbGFzdCA8cD5cbiAgICAgICAgICAgIGlmIChpICE9PSBjb250ZW50RGl2LmNoaWxkcmVuLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICBjb250ZW50SFRNTCArPSAnPGJyIC8+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIHRlbXAuYXBwZW5kQ2hpbGQoZWxlbWVudC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgICAgY29udGVudEhUTUwgKz0gdGVtcC5pbm5lckhUTUw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY29udGVudEhUTUw7XG59XG5cbi8qXG4gKiBHaXZlbiBhbiB1bnRydXN0ZWQgSFRNTCBzdHJpbmcsIHJldHVybiBhIFJlYWN0IG5vZGUgd2l0aCBhbiBzYW5pdGl6ZWQgdmVyc2lvblxuICogb2YgdGhhdCBIVE1MLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2FuaXRpemVkSHRtbE5vZGUoaW5zYW5lSHRtbDogc3RyaW5nKSB7XG4gICAgY29uc3Qgc2FuZUh0bWwgPSBzYW5pdGl6ZUh0bWwoaW5zYW5lSHRtbCwgc2FuaXRpemVIdG1sUGFyYW1zKTtcblxuICAgIHJldHVybiA8ZGl2IGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc2FuZUh0bWwgfX0gZGlyPVwiYXV0b1wiIC8+O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SHRtbFRleHQoaW5zYW5lSHRtbDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHNhbml0aXplSHRtbChpbnNhbmVIdG1sLCB7XG4gICAgICAgIGFsbG93ZWRUYWdzOiBbXSxcbiAgICAgICAgYWxsb3dlZEF0dHJpYnV0ZXM6IHt9LFxuICAgICAgICBzZWxmQ2xvc2luZzogW10sXG4gICAgICAgIGFsbG93ZWRTY2hlbWVzOiBbXSxcbiAgICAgICAgZGlzYWxsb3dlZFRhZ3NNb2RlOiAnZGlzY2FyZCcsXG4gICAgfSlcbn1cblxuLyoqXG4gKiBUZXN0cyBpZiBhIFVSTCBmcm9tIGFuIHVudHJ1c3RlZCBzb3VyY2UgbWF5IGJlIHNhZmVseSBwdXQgaW50byB0aGUgRE9NXG4gKiBUaGUgYmlnZ2VzdCB0aHJlYXQgaGVyZSBpcyBqYXZhc2NyaXB0OiBVUklzLlxuICogTm90ZSB0aGF0IHRoZSBIVE1MIHNhbml0aXNlciBsaWJyYXJ5IGhhcyBpdHMgb3duIGludGVybmFsIGxvZ2ljIGZvclxuICogZG9pbmcgdGhpcywgdG8gd2hpY2ggd2UgcGFzcyB0aGUgc2FtZSBsaXN0IG9mIHNjaGVtZXMuIFRoaXMgaXMgdXNlZCBpblxuICogb3RoZXIgcGxhY2VzIHdlIG5lZWQgdG8gc2FuaXRpc2UgVVJMcy5cbiAqIEByZXR1cm4gdHJ1ZSBpZiBwZXJtaXR0ZWQsIG90aGVyd2lzZSBmYWxzZVxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNVcmxQZXJtaXR0ZWQoaW5wdXRVcmw6IHN0cmluZykge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IHVybC5wYXJzZShpbnB1dFVybCk7XG4gICAgICAgIGlmICghcGFyc2VkLnByb3RvY29sKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vIFVSTCBwYXJzZXIgcHJvdG9jb2wgaW5jbHVkZXMgdGhlIHRyYWlsaW5nIGNvbG9uXG4gICAgICAgIHJldHVybiBQRVJNSVRURURfVVJMX1NDSEVNRVMuaW5jbHVkZXMocGFyc2VkLnByb3RvY29sLnNsaWNlKDAsIC0xKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG5jb25zdCB0cmFuc2Zvcm1UYWdzOiBJRXh0ZW5kZWRTYW5pdGl6ZU9wdGlvbnNbXCJ0cmFuc2Zvcm1UYWdzXCJdID0geyAvLyBjdXN0b20gdG8gbWF0cml4XG4gICAgLy8gYWRkIGJsYW5rIHRhcmdldHMgdG8gYWxsIGh5cGVybGlua3MgZXhjZXB0IHZlY3RvciBVUkxzXG4gICAgJ2EnOiBmdW5jdGlvbih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnM6IHNhbml0aXplSHRtbC5BdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChhdHRyaWJzLmhyZWYpIHtcbiAgICAgICAgICAgIGF0dHJpYnMudGFyZ2V0ID0gJ19ibGFuayc7IC8vIGJ5IGRlZmF1bHRcblxuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZWQgPSB0cnlUcmFuc2Zvcm1QZXJtYWxpbmtUb0xvY2FsSHJlZihhdHRyaWJzLmhyZWYpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybWVkICE9PSBhdHRyaWJzLmhyZWYgfHwgYXR0cmlicy5ocmVmLm1hdGNoKGxpbmtpZnlNYXRyaXguRUxFTUVOVF9VUkxfUEFUVEVSTikpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJzLmhyZWYgPSB0cmFuc2Zvcm1lZDtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlicy50YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlicy5yZWwgPSAnbm9yZWZlcnJlciBub29wZW5lcic7IC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5naXRodWIuaW8vcmVsLW5vb3BlbmVyL1xuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbiAgICAnaW1nJzogZnVuY3Rpb24odGFnTmFtZTogc3RyaW5nLCBhdHRyaWJzOiBzYW5pdGl6ZUh0bWwuQXR0cmlidXRlcykge1xuICAgICAgICAvLyBTdHJpcCBvdXQgaW1ncyB0aGF0IGFyZW4ndCBgbXhjYCBoZXJlIGluc3RlYWQgb2YgdXNpbmcgYWxsb3dlZFNjaGVtZXNCeVRhZ1xuICAgICAgICAvLyBiZWNhdXNlIHRyYW5zZm9ybVRhZ3MgaXMgdXNlZCBfYmVmb3JlXyB3ZSBmaWx0ZXIgYnkgYWxsb3dlZFNjaGVtZXNCeVRhZyBhbmRcbiAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBhbGxvdyBpbWFnZXMgd2l0aCBgaHR0cHM/YCBgc3JjYHMuXG4gICAgICAgIC8vIFdlIGFsc28gZHJvcCBpbmxpbmUgaW1hZ2VzIChhcyBpZiB0aGV5IHdlcmUgbm90IHByZXNlbnQgYXQgYWxsKSB3aGVuIHRoZSBcInNob3dcbiAgICAgICAgLy8gaW1hZ2VzXCIgcHJlZmVyZW5jZSBpcyBkaXNhYmxlZC4gRnV0dXJlIHdvcmsgbWlnaHQgZXhwb3NlIHNvbWUgVUkgdG8gcmV2ZWFsIHRoZW1cbiAgICAgICAgLy8gbGlrZSBzdGFuZGFsb25lIGltYWdlIGV2ZW50cyBoYXZlLlxuICAgICAgICBpZiAoIWF0dHJpYnMuc3JjIHx8ICFhdHRyaWJzLnNyYy5zdGFydHNXaXRoKCdteGM6Ly8nKSB8fCAhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dJbWFnZXNcIikpIHtcbiAgICAgICAgICAgIHJldHVybiB7IHRhZ05hbWUsIGF0dHJpYnM6IHt9fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB3aWR0aCA9IE51bWJlcihhdHRyaWJzLndpZHRoKSB8fCA4MDA7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IE51bWJlcihhdHRyaWJzLmhlaWdodCkgfHwgNjAwO1xuICAgICAgICBhdHRyaWJzLnNyYyA9IG1lZGlhRnJvbU14YyhhdHRyaWJzLnNyYykuZ2V0VGh1bWJuYWlsT2ZTb3VyY2VIdHRwKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbiAgICAnY29kZSc6IGZ1bmN0aW9uKHRhZ05hbWU6IHN0cmluZywgYXR0cmliczogc2FuaXRpemVIdG1sLkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhdHRyaWJzLmNsYXNzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgLy8gRmlsdGVyIG91dCBhbGwgY2xhc3NlcyBvdGhlciB0aGFuIG9uZXMgc3RhcnRpbmcgd2l0aCBsYW5ndWFnZS0gZm9yIHN5bnRheCBoaWdobGlnaHRpbmcuXG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gYXR0cmlicy5jbGFzcy5zcGxpdCgvXFxzLykuZmlsdGVyKGZ1bmN0aW9uKGNsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNsLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLScpICYmICFjbC5zdGFydHNXaXRoKCdsYW5ndWFnZS1fJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF0dHJpYnMuY2xhc3MgPSBjbGFzc2VzLmpvaW4oJyAnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyB0YWdOYW1lLCBhdHRyaWJzIH07XG4gICAgfSxcbiAgICAnKic6IGZ1bmN0aW9uKHRhZ05hbWU6IHN0cmluZywgYXR0cmliczogc2FuaXRpemVIdG1sLkF0dHJpYnV0ZXMpIHtcbiAgICAgICAgLy8gRGVsZXRlIGFueSBzdHlsZSBwcmV2aW91c2x5IGFzc2lnbmVkLCBzdHlsZSBpcyBhbiBhbGxvd2VkVGFnIGZvciBmb250IGFuZCBzcGFuXG4gICAgICAgIC8vIGJlY2F1c2UgYXR0cmlidXRlcyBhcmUgc3RyaXBwZWQgYWZ0ZXIgdHJhbnNmb3JtaW5nXG4gICAgICAgIGRlbGV0ZSBhdHRyaWJzLnN0eWxlO1xuXG4gICAgICAgIC8vIFNhbml0aXNlIGFuZCB0cmFuc2Zvcm0gZGF0YS1teC1jb2xvciBhbmQgZGF0YS1teC1iZy1jb2xvciB0byB0aGVpciBDU1NcbiAgICAgICAgLy8gZXF1aXZhbGVudHNcbiAgICAgICAgY29uc3QgY3VzdG9tQ1NTTWFwcGVyID0ge1xuICAgICAgICAgICAgJ2RhdGEtbXgtY29sb3InOiAnY29sb3InLFxuICAgICAgICAgICAgJ2RhdGEtbXgtYmctY29sb3InOiAnYmFja2dyb3VuZC1jb2xvcicsXG4gICAgICAgICAgICAvLyAkY3VzdG9tQXR0cmlidXRlS2V5OiAkY3NzQXR0cmlidXRlS2V5XG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IHN0eWxlID0gXCJcIjtcbiAgICAgICAgT2JqZWN0LmtleXMoY3VzdG9tQ1NTTWFwcGVyKS5mb3JFYWNoKChjdXN0b21BdHRyaWJ1dGVLZXkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNzc0F0dHJpYnV0ZUtleSA9IGN1c3RvbUNTU01hcHBlcltjdXN0b21BdHRyaWJ1dGVLZXldO1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tQXR0cmlidXRlVmFsdWUgPSBhdHRyaWJzW2N1c3RvbUF0dHJpYnV0ZUtleV07XG4gICAgICAgICAgICBpZiAoY3VzdG9tQXR0cmlidXRlVmFsdWUgJiZcbiAgICAgICAgICAgICAgICB0eXBlb2YgY3VzdG9tQXR0cmlidXRlVmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICAgICAgICAgICAgICAgQ09MT1JfUkVHRVgudGVzdChjdXN0b21BdHRyaWJ1dGVWYWx1ZSlcbiAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgIHN0eWxlICs9IGNzc0F0dHJpYnV0ZUtleSArIFwiOlwiICsgY3VzdG9tQXR0cmlidXRlVmFsdWUgKyBcIjtcIjtcbiAgICAgICAgICAgICAgICBkZWxldGUgYXR0cmlic1tjdXN0b21BdHRyaWJ1dGVLZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc3R5bGUpIHtcbiAgICAgICAgICAgIGF0dHJpYnMuc3R5bGUgPSBzdHlsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7IHRhZ05hbWUsIGF0dHJpYnMgfTtcbiAgICB9LFxufTtcblxuY29uc3Qgc2FuaXRpemVIdG1sUGFyYW1zOiBJRXh0ZW5kZWRTYW5pdGl6ZU9wdGlvbnMgPSB7XG4gICAgYWxsb3dlZFRhZ3M6IFtcbiAgICAgICAgJ2ZvbnQnLCAvLyBjdXN0b20gdG8gbWF0cml4IGZvciBJUkMtc3R5bGUgZm9udCBjb2xvcmluZ1xuICAgICAgICAnZGVsJywgLy8gZm9yIG1hcmtkb3duXG4gICAgICAgICdoMScsICdoMicsICdoMycsICdoNCcsICdoNScsICdoNicsICdibG9ja3F1b3RlJywgJ3AnLCAnYScsICd1bCcsICdvbCcsICdzdXAnLCAnc3ViJyxcbiAgICAgICAgJ25sJywgJ2xpJywgJ2InLCAnaScsICd1JywgJ3N0cm9uZycsICdlbScsICdzdHJpa2UnLCAnY29kZScsICdocicsICdicicsICdkaXYnLFxuICAgICAgICAndGFibGUnLCAndGhlYWQnLCAnY2FwdGlvbicsICd0Ym9keScsICd0cicsICd0aCcsICd0ZCcsICdwcmUnLCAnc3BhbicsICdpbWcnLFxuICAgICAgICAnZGV0YWlscycsICdzdW1tYXJ5JyxcbiAgICBdLFxuICAgIGFsbG93ZWRBdHRyaWJ1dGVzOiB7XG4gICAgICAgIC8vIGN1c3RvbSBvbmVzIGZpcnN0OlxuICAgICAgICBmb250OiBbJ2NvbG9yJywgJ2RhdGEtbXgtYmctY29sb3InLCAnZGF0YS1teC1jb2xvcicsICdzdHlsZSddLCAvLyBjdXN0b20gdG8gbWF0cml4XG4gICAgICAgIHNwYW46IFsnZGF0YS1teC1tYXRocycsICdkYXRhLW14LWJnLWNvbG9yJywgJ2RhdGEtbXgtY29sb3InLCAnZGF0YS1teC1zcG9pbGVyJywgJ3N0eWxlJ10sIC8vIGN1c3RvbSB0byBtYXRyaXhcbiAgICAgICAgZGl2OiBbJ2RhdGEtbXgtbWF0aHMnXSxcbiAgICAgICAgYTogWydocmVmJywgJ25hbWUnLCAndGFyZ2V0JywgJ3JlbCddLCAvLyByZW1vdGUgdGFyZ2V0OiBjdXN0b20gdG8gbWF0cml4XG4gICAgICAgIGltZzogWydzcmMnLCAnd2lkdGgnLCAnaGVpZ2h0JywgJ2FsdCcsICd0aXRsZSddLFxuICAgICAgICBvbDogWydzdGFydCddLFxuICAgICAgICBjb2RlOiBbJ2NsYXNzJ10sIC8vIFdlIGRvbid0IGFjdHVhbGx5IGFsbG93IGFsbCBjbGFzc2VzLCB3ZSBmaWx0ZXIgdGhlbSBpbiB0cmFuc2Zvcm1UYWdzXG4gICAgfSxcbiAgICAvLyBMb3RzIG9mIHRoZXNlIHdvbid0IGNvbWUgdXAgYnkgZGVmYXVsdCBiZWNhdXNlIHdlIGRvbid0IGFsbG93IHRoZW1cbiAgICBzZWxmQ2xvc2luZzogWydpbWcnLCAnYnInLCAnaHInLCAnYXJlYScsICdiYXNlJywgJ2Jhc2Vmb250JywgJ2lucHV0JywgJ2xpbmsnLCAnbWV0YSddLFxuICAgIC8vIFVSTCBzY2hlbWVzIHdlIHBlcm1pdFxuICAgIGFsbG93ZWRTY2hlbWVzOiBQRVJNSVRURURfVVJMX1NDSEVNRVMsXG4gICAgYWxsb3dQcm90b2NvbFJlbGF0aXZlOiBmYWxzZSxcbiAgICB0cmFuc2Zvcm1UYWdzLFxuICAgIC8vIDUwIGxldmVscyBkZWVwIFwic2hvdWxkIGJlIGVub3VnaCBmb3IgYW55b25lXCJcbiAgICBuZXN0aW5nTGltaXQ6IDUwLFxufTtcblxuLy8gdGhpcyBpcyB0aGUgc2FtZSBhcyB0aGUgYWJvdmUgZXhjZXB0IHdpdGggbGVzcyByZXdyaXRpbmdcbmNvbnN0IGNvbXBvc2VyU2FuaXRpemVIdG1sUGFyYW1zOiBJRXh0ZW5kZWRTYW5pdGl6ZU9wdGlvbnMgPSB7XG4gICAgLi4uc2FuaXRpemVIdG1sUGFyYW1zLFxuICAgIHRyYW5zZm9ybVRhZ3M6IHtcbiAgICAgICAgJ2NvZGUnOiB0cmFuc2Zvcm1UYWdzWydjb2RlJ10sXG4gICAgICAgICcqJzogdHJhbnNmb3JtVGFnc1snKiddLFxuICAgIH0sXG59O1xuXG5hYnN0cmFjdCBjbGFzcyBCYXNlSGlnaGxpZ2h0ZXI8VCBleHRlbmRzIFJlYWN0LlJlYWN0Tm9kZT4ge1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBoaWdobGlnaHRDbGFzczogc3RyaW5nLCBwdWJsaWMgaGlnaGxpZ2h0TGluazogc3RyaW5nKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogYXBwbHkgdGhlIGhpZ2hsaWdodHMgdG8gYSBzZWN0aW9uIG9mIHRleHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzYWZlU25pcHBldCBUaGUgc25pcHBldCBvZiB0ZXh0IHRvIGFwcGx5IHRoZSBoaWdobGlnaHRzXG4gICAgICogICAgIHRvLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nW119IHNhZmVIaWdobGlnaHRzIEEgbGlzdCBvZiBzdWJzdHJpbmdzIHRvIGhpZ2hsaWdodCxcbiAgICAgKiAgICAgc29ydGVkIGJ5IGRlc2NlbmRpbmcgbGVuZ3RoLlxuICAgICAqXG4gICAgICogcmV0dXJucyBhIGxpc3Qgb2YgcmVzdWx0cyAoc3RyaW5ncyBmb3IgSHRtbEhpZ2hsaWdoZXIsIHJlYWN0IG5vZGVzIGZvclxuICAgICAqIFRleHRIaWdobGlnaHRlcikuXG4gICAgICovXG4gICAgcHVibGljIGFwcGx5SGlnaGxpZ2h0cyhzYWZlU25pcHBldDogc3RyaW5nLCBzYWZlSGlnaGxpZ2h0czogc3RyaW5nW10pOiBUW10ge1xuICAgICAgICBsZXQgbGFzdE9mZnNldCA9IDA7XG4gICAgICAgIGxldCBvZmZzZXQ7XG4gICAgICAgIGxldCBub2RlczogVFtdID0gW107XG5cbiAgICAgICAgY29uc3Qgc2FmZUhpZ2hsaWdodCA9IHNhZmVIaWdobGlnaHRzWzBdO1xuICAgICAgICB3aGlsZSAoKG9mZnNldCA9IHNhZmVTbmlwcGV0LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzYWZlSGlnaGxpZ2h0LnRvTG93ZXJDYXNlKCksIGxhc3RPZmZzZXQpKSA+PSAwKSB7XG4gICAgICAgICAgICAvLyBoYW5kbGUgcHJlYW1ibGVcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiBsYXN0T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG5vZGVzID0gbm9kZXMuY29uY2F0KHRoaXMuYXBwbHlTdWJIaWdobGlnaHRzKHN1YlNuaXBwZXQsIHNhZmVIaWdobGlnaHRzKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIGhpZ2hsaWdodC4gdXNlIHRoZSBvcmlnaW5hbCBzdHJpbmcgcmF0aGVyIHRoYW4gc2FmZUhpZ2hsaWdodFxuICAgICAgICAgICAgLy8gdG8gcHJlc2VydmUgdGhlIG9yaWdpbmFsIGNhc2luZy5cbiAgICAgICAgICAgIGNvbnN0IGVuZE9mZnNldCA9IG9mZnNldCArIHNhZmVIaWdobGlnaHQubGVuZ3RoO1xuICAgICAgICAgICAgbm9kZXMucHVzaCh0aGlzLnByb2Nlc3NTbmlwcGV0KHNhZmVTbmlwcGV0LnN1YnN0cmluZyhvZmZzZXQsIGVuZE9mZnNldCksIHRydWUpKTtcblxuICAgICAgICAgICAgbGFzdE9mZnNldCA9IGVuZE9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGhhbmRsZSBwb3N0YW1ibGVcbiAgICAgICAgaWYgKGxhc3RPZmZzZXQgIT09IHNhZmVTbmlwcGV0Lmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3Qgc3ViU25pcHBldCA9IHNhZmVTbmlwcGV0LnN1YnN0cmluZyhsYXN0T2Zmc2V0LCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgbm9kZXMgPSBub2Rlcy5jb25jYXQodGhpcy5hcHBseVN1YkhpZ2hsaWdodHMoc3ViU25pcHBldCwgc2FmZUhpZ2hsaWdodHMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhcHBseVN1YkhpZ2hsaWdodHMoc2FmZVNuaXBwZXQ6IHN0cmluZywgc2FmZUhpZ2hsaWdodHM6IHN0cmluZ1tdKTogVFtdIHtcbiAgICAgICAgaWYgKHNhZmVIaWdobGlnaHRzWzFdKSB7XG4gICAgICAgICAgICAvLyByZWN1cnNlIGludG8gdGhpcyByYW5nZSB0byBjaGVjayBmb3IgdGhlIG5leHQgc2V0IG9mIGhpZ2hsaWdodCBtYXRjaGVzXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hcHBseUhpZ2hsaWdodHMoc2FmZVNuaXBwZXQsIHNhZmVIaWdobGlnaHRzLnNsaWNlKDEpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG5vIG1vcmUgaGlnaGxpZ2h0cyB0byBiZSBmb3VuZCwganVzdCByZXR1cm4gdGhlIHVuaGlnaGxpZ2h0ZWQgc3RyaW5nXG4gICAgICAgICAgICByZXR1cm4gW3RoaXMucHJvY2Vzc1NuaXBwZXQoc2FmZVNuaXBwZXQsIGZhbHNlKV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgcHJvY2Vzc1NuaXBwZXQoc25pcHBldDogc3RyaW5nLCBoaWdobGlnaHQ6IGJvb2xlYW4pOiBUO1xufVxuXG5jbGFzcyBIdG1sSGlnaGxpZ2h0ZXIgZXh0ZW5kcyBCYXNlSGlnaGxpZ2h0ZXI8c3RyaW5nPiB7XG4gICAgLyogaGlnaGxpZ2h0IHRoZSBnaXZlbiBzbmlwcGV0IGlmIHJlcXVpcmVkXG4gICAgICpcbiAgICAgKiBzbmlwcGV0OiBjb250ZW50IG9mIHRoZSBzcGFuOyBtdXN0IGhhdmUgYmVlbiBzYW5pdGlzZWRcbiAgICAgKiBoaWdobGlnaHQ6IHRydWUgdG8gaGlnaGxpZ2h0IGFzIGEgc2VhcmNoIG1hdGNoXG4gICAgICpcbiAgICAgKiByZXR1cm5zIGFuIEhUTUwgc3RyaW5nXG4gICAgICovXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NTbmlwcGV0KHNuaXBwZXQ6IHN0cmluZywgaGlnaGxpZ2h0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKCFoaWdobGlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5vdGhpbmcgcmVxdWlyZWQgaGVyZVxuICAgICAgICAgICAgcmV0dXJuIHNuaXBwZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3BhbiA9IGA8c3BhbiBjbGFzcz1cIiR7dGhpcy5oaWdobGlnaHRDbGFzc31cIj4ke3NuaXBwZXR9PC9zcGFuPmA7XG5cbiAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0TGluaykge1xuICAgICAgICAgICAgc3BhbiA9IGA8YSBocmVmPVwiJHtlbmNvZGVVUkkodGhpcy5oaWdobGlnaHRMaW5rKX1cIj4ke3NwYW59PC9hPmA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNwYW47XG4gICAgfVxufVxuXG5pbnRlcmZhY2UgSUNvbnRlbnQge1xuICAgIGZvcm1hdD86IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgZm9ybWF0dGVkX2JvZHk/OiBzdHJpbmc7XG4gICAgYm9keTogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSU9wdHMge1xuICAgIGhpZ2hsaWdodExpbms/OiBzdHJpbmc7XG4gICAgZGlzYWJsZUJpZ0Vtb2ppPzogYm9vbGVhbjtcbiAgICBzdHJpcFJlcGx5RmFsbGJhY2s/OiBib29sZWFuO1xuICAgIHJldHVyblN0cmluZz86IGJvb2xlYW47XG4gICAgZm9yQ29tcG9zZXJRdW90ZT86IGJvb2xlYW47XG4gICAgcmVmPzogUmVhY3QuUmVmPGFueT47XG59XG5cbi8qIHR1cm4gYSBtYXRyaXggZXZlbnQgYm9keSBpbnRvIGh0bWxcbiAqXG4gKiBjb250ZW50OiAnY29udGVudCcgb2YgdGhlIE1hdHJpeEV2ZW50XG4gKlxuICogaGlnaGxpZ2h0czogb3B0aW9uYWwgbGlzdCBvZiB3b3JkcyB0byBoaWdobGlnaHQsIG9yZGVyZWQgYnkgbG9uZ2VzdCB3b3JkIGZpcnN0XG4gKlxuICogb3B0cy5oaWdobGlnaHRMaW5rOiBvcHRpb25hbCBocmVmIHRvIGFkZCB0byBoaWdobGlnaHRlZCB3b3Jkc1xuICogb3B0cy5kaXNhYmxlQmlnRW1vamk6IG9wdGlvbmFsIGFyZ3VtZW50IHRvIGRpc2FibGUgdGhlIGJpZyBlbW9qaSBjbGFzcy5cbiAqIG9wdHMuc3RyaXBSZXBseUZhbGxiYWNrOiBvcHRpb25hbCBhcmd1bWVudCBzcGVjaWZ5aW5nIHRoZSBldmVudCBpcyBhIHJlcGx5IGFuZCBzbyBmYWxsYmFjayBuZWVkcyByZW1vdmluZ1xuICogb3B0cy5yZXR1cm5TdHJpbmc6IHJldHVybiBhbiBIVE1MIHN0cmluZyByYXRoZXIgdGhhbiBKU1ggZWxlbWVudHNcbiAqIG9wdHMuZm9yQ29tcG9zZXJRdW90ZTogb3B0aW9uYWwgcGFyYW0gdG8gbGVzc2VuIHRoZSB1cmwgcmV3cml0aW5nIGRvbmUgYnkgc2FuaXRpemF0aW9uLCBmb3IgcXVvdGluZyBpbnRvIGNvbXBvc2VyXG4gKiBvcHRzLnJlZjogUmVhY3QgcmVmIHRvIGF0dGFjaCB0byBhbnkgUmVhY3QgY29tcG9uZW50cyByZXR1cm5lZCAobm90IGNvbXBhdGlibGUgd2l0aCBvcHRzLnJldHVyblN0cmluZylcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJvZHlUb0h0bWwoY29udGVudDogSUNvbnRlbnQsIGhpZ2hsaWdodHM6IHN0cmluZ1tdLCBvcHRzOiBJT3B0cyA9IHt9KSB7XG4gICAgY29uc3QgaXNIdG1sTWVzc2FnZSA9IGNvbnRlbnQuZm9ybWF0ID09PSBcIm9yZy5tYXRyaXguY3VzdG9tLmh0bWxcIiAmJiBjb250ZW50LmZvcm1hdHRlZF9ib2R5O1xuICAgIGxldCBib2R5SGFzRW1vamkgPSBmYWxzZTtcblxuICAgIGxldCBzYW5pdGl6ZVBhcmFtcyA9IHNhbml0aXplSHRtbFBhcmFtcztcbiAgICBpZiAob3B0cy5mb3JDb21wb3NlclF1b3RlKSB7XG4gICAgICAgIHNhbml0aXplUGFyYW1zID0gY29tcG9zZXJTYW5pdGl6ZUh0bWxQYXJhbXM7XG4gICAgfVxuXG4gICAgbGV0IHN0cmlwcGVkQm9keTogc3RyaW5nO1xuICAgIGxldCBzYWZlQm9keTogc3RyaW5nO1xuICAgIGxldCBpc0Rpc3BsYXllZFdpdGhIdG1sOiBib29sZWFuO1xuICAgIC8vIFhYWDogV2Ugc2FuaXRpemUgdGhlIEhUTUwgd2hpbHN0IGFsc28gaGlnaGxpZ2h0aW5nIGl0cyB0ZXh0IG5vZGVzLCB0byBhdm9pZCBhY2NpZGVudGFsbHkgdHJ5aW5nXG4gICAgLy8gdG8gaGlnaGxpZ2h0IEhUTUwgdGFncyB0aGVtc2VsdmVzLiAgSG93ZXZlciwgdGhpcyBkb2VzIG1lYW4gdGhhdCB3ZSBkb24ndCBoaWdobGlnaHQgdGV4dG5vZGVzIHdoaWNoXG4gICAgLy8gYXJlIGludGVycnVwdGVkIGJ5IEhUTUwgdGFncyAobm90IHRoYXQgd2UgZGlkIGJlZm9yZSkgLSBlLmcuIGZvbzxzcGFuLz5iYXIgd29uJ3QgZ2V0IGhpZ2hsaWdodGVkXG4gICAgLy8gYnkgYW4gYXR0ZW1wdCB0byBzZWFyY2ggZm9yICdmb29iYXInLiAgVGhlbiBhZ2FpbiwgdGhlIHNlYXJjaCBxdWVyeSBwcm9iYWJseSB3b3VsZG4ndCB3b3JrIGVpdGhlclxuICAgIHRyeSB7XG4gICAgICAgIGlmIChoaWdobGlnaHRzICYmIGhpZ2hsaWdodHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgaGlnaGxpZ2h0ZXIgPSBuZXcgSHRtbEhpZ2hsaWdodGVyKFwibXhfRXZlbnRUaWxlX3NlYXJjaEhpZ2hsaWdodFwiLCBvcHRzLmhpZ2hsaWdodExpbmspO1xuICAgICAgICAgICAgY29uc3Qgc2FmZUhpZ2hsaWdodHMgPSBoaWdobGlnaHRzLm1hcChmdW5jdGlvbihoaWdobGlnaHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2FuaXRpemVIdG1sKGhpZ2hsaWdodCwgc2FuaXRpemVQYXJhbXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBYWFg6IGhhY2t5IGJvZGdlIHRvIHRlbXBvcmFyaWx5IGFwcGx5IGEgdGV4dEZpbHRlciB0byB0aGUgc2FuaXRpemVQYXJhbXMgc3RydWN0dXJlLlxuICAgICAgICAgICAgc2FuaXRpemVQYXJhbXMudGV4dEZpbHRlciA9IGZ1bmN0aW9uKHNhZmVUZXh0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhpZ2hsaWdodGVyLmFwcGx5SGlnaGxpZ2h0cyhzYWZlVGV4dCwgc2FmZUhpZ2hsaWdodHMpLmpvaW4oJycpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmb3JtYXR0ZWRCb2R5ID0gdHlwZW9mIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPT09ICdzdHJpbmcnID8gY29udGVudC5mb3JtYXR0ZWRfYm9keSA6IG51bGw7XG4gICAgICAgIGNvbnN0IHBsYWluQm9keSA9IHR5cGVvZiBjb250ZW50LmJvZHkgPT09ICdzdHJpbmcnID8gY29udGVudC5ib2R5IDogXCJcIjtcblxuICAgICAgICBpZiAob3B0cy5zdHJpcFJlcGx5RmFsbGJhY2sgJiYgZm9ybWF0dGVkQm9keSkgZm9ybWF0dGVkQm9keSA9IFJlcGx5VGhyZWFkLnN0cmlwSFRNTFJlcGx5KGZvcm1hdHRlZEJvZHkpO1xuICAgICAgICBzdHJpcHBlZEJvZHkgPSBvcHRzLnN0cmlwUmVwbHlGYWxsYmFjayA/IFJlcGx5VGhyZWFkLnN0cmlwUGxhaW5SZXBseShwbGFpbkJvZHkpIDogcGxhaW5Cb2R5O1xuXG4gICAgICAgIGJvZHlIYXNFbW9qaSA9IG1pZ2h0Q29udGFpbkVtb2ppKGlzSHRtbE1lc3NhZ2UgPyBmb3JtYXR0ZWRCb2R5IDogcGxhaW5Cb2R5KTtcblxuICAgICAgICAvLyBPbmx5IGdlbmVyYXRlIHNhZmVCb2R5IGlmIHRoZSBtZXNzYWdlIHdhcyBzZW50IGFzIG9yZy5tYXRyaXguY3VzdG9tLmh0bWxcbiAgICAgICAgaWYgKGlzSHRtbE1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGlzRGlzcGxheWVkV2l0aEh0bWwgPSB0cnVlO1xuICAgICAgICAgICAgc2FmZUJvZHkgPSBzYW5pdGl6ZUh0bWwoZm9ybWF0dGVkQm9keSwgc2FuaXRpemVQYXJhbXMpO1xuXG4gICAgICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImZlYXR1cmVfbGF0ZXhfbWF0aHNcIikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwaHRtbCA9IGNoZWVyaW8ubG9hZChzYWZlQm9keSxcbiAgICAgICAgICAgICAgICAgICAgeyBfdXNlSHRtbFBhcnNlcjI6IHRydWUsIGRlY29kZUVudGl0aWVzOiBmYWxzZSB9KVxuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUaGUgdHlwZXMgZm9yIGByZXBsYWNlV2l0aGAgd3JvbmdseSBleHBlY3RcbiAgICAgICAgICAgICAgICAvLyBDaGVlcmlvIGluc3RhbmNlIHRvIGJlIHJldHVybmVkLlxuICAgICAgICAgICAgICAgIHBodG1sKCdkaXYsIHNwYW5bZGF0YS1teC1tYXRocyE9XCJcIl0nKS5yZXBsYWNlV2l0aChmdW5jdGlvbihpLCBlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrYXRleC5yZW5kZXJUb1N0cmluZyhcbiAgICAgICAgICAgICAgICAgICAgICAgIEFsbEh0bWxFbnRpdGllcy5kZWNvZGUocGh0bWwoZSkuYXR0cignZGF0YS1teC1tYXRocycpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvd09uRXJyb3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXlNb2RlOiBlLm5hbWUgPT0gJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiBcImh0bWxBbmRNYXRobWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHNhZmVCb2R5ID0gcGh0bWwuaHRtbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZGVsZXRlIHNhbml0aXplUGFyYW1zLnRleHRGaWx0ZXI7XG4gICAgfVxuXG4gICAgY29uc3QgY29udGVudEJvZHkgPSBpc0Rpc3BsYXllZFdpdGhIdG1sID8gc2FmZUJvZHkgOiBzdHJpcHBlZEJvZHk7XG4gICAgaWYgKG9wdHMucmV0dXJuU3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBjb250ZW50Qm9keTtcbiAgICB9XG5cbiAgICBsZXQgZW1vamlCb2R5ID0gZmFsc2U7XG4gICAgaWYgKCFvcHRzLmRpc2FibGVCaWdFbW9qaSAmJiBib2R5SGFzRW1vamkpIHtcbiAgICAgICAgbGV0IGNvbnRlbnRCb2R5VHJpbW1lZCA9IGNvbnRlbnRCb2R5ICE9PSB1bmRlZmluZWQgPyBjb250ZW50Qm9keS50cmltKCkgOiAnJztcblxuICAgICAgICAvLyBJZ25vcmUgc3BhY2VzIGluIGJvZHkgdGV4dC4gRW1vamlzIHdpdGggc3BhY2VzIGluIGJldHdlZW4gc2hvdWxkXG4gICAgICAgIC8vIHN0aWxsIGJlIGNvdW50ZWQgYXMgcHVyZWx5IGVtb2ppIG1lc3NhZ2VzLlxuICAgICAgICBjb250ZW50Qm9keVRyaW1tZWQgPSBjb250ZW50Qm9keVRyaW1tZWQucmVwbGFjZShXSElURVNQQUNFX1JFR0VYLCAnJyk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHplcm8gd2lkdGggam9pbmVyIGNoYXJhY3RlcnMgZnJvbSBlbW9qaSBtZXNzYWdlcy4gVGhpcyBlbnN1cmVzXG4gICAgICAgIC8vIHRoYXQgZW1vamlzIHRoYXQgYXJlIG1hZGUgdXAgb2YgbXVsdGlwbGUgdW5pY29kZSBjaGFyYWN0ZXJzIGFyZSBzdGlsbFxuICAgICAgICAvLyBwcmVzZW50ZWQgYXMgbGFyZ2UuXG4gICAgICAgIGNvbnRlbnRCb2R5VHJpbW1lZCA9IGNvbnRlbnRCb2R5VHJpbW1lZC5yZXBsYWNlKFpXSl9SRUdFWCwgJycpO1xuXG4gICAgICAgIGNvbnN0IG1hdGNoID0gQklHRU1PSklfUkVHRVguZXhlYyhjb250ZW50Qm9keVRyaW1tZWQpO1xuICAgICAgICBlbW9qaUJvZHkgPSBtYXRjaCAmJiBtYXRjaFswXSAmJiBtYXRjaFswXS5sZW5ndGggPT09IGNvbnRlbnRCb2R5VHJpbW1lZC5sZW5ndGggJiZcbiAgICAgICAgICAgICAgICAgICAgLy8gUHJldmVudCB1c2VyIHBpbGxzIGV4cGFuZGluZyBmb3IgdXNlcnMgd2l0aCBvbmx5IGVtb2ppIGluXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZWlyIHVzZXJuYW1lLiBQZXJtYWxpbmtzIChsaW5rcyBpbiBwaWxscykgY2FuIGJlIGFueSBVUkxcbiAgICAgICAgICAgICAgICAgICAgLy8gbm93LCBzbyB3ZSBqdXN0IGNoZWNrIGZvciBhbiBIVFRQLWxvb2tpbmcgdGhpbmcuXG4gICAgICAgICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmlwcGVkQm9keSA9PT0gc2FmZUJvZHkgfHwgLy8gcmVwbGllcyBoYXZlIHRoZSBodG1sIGZhbGxiYWNrcywgYWNjb3VudCBmb3IgdGhhdCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50LmZvcm1hdHRlZF9ib2R5ID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICghY29udGVudC5mb3JtYXR0ZWRfYm9keS5pbmNsdWRlcyhcImh0dHA6XCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAhY29udGVudC5mb3JtYXR0ZWRfYm9keS5pbmNsdWRlcyhcImh0dHBzOlwiKSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgJ214X0V2ZW50VGlsZV9ib2R5JzogdHJ1ZSxcbiAgICAgICAgJ214X0V2ZW50VGlsZV9iaWdFbW9qaSc6IGVtb2ppQm9keSxcbiAgICAgICAgJ21hcmtkb3duLWJvZHknOiBpc0h0bWxNZXNzYWdlICYmICFlbW9qaUJvZHksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gaXNEaXNwbGF5ZWRXaXRoSHRtbCA/XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgICBrZXk9XCJib2R5XCJcbiAgICAgICAgICAgIHJlZj17b3B0cy5yZWZ9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgICAgICAgIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogc2FmZUJvZHkgfX1cbiAgICAgICAgICAgIGRpcj1cImF1dG9cIlxuICAgICAgICAvPiA6IDxzcGFuIGtleT1cImJvZHlcIiByZWY9e29wdHMucmVmfSBjbGFzc05hbWU9e2NsYXNzTmFtZX0gZGlyPVwiYXV0b1wiPnsgc3RyaXBwZWRCb2R5IH08L3NwYW4+O1xufVxuXG4vKipcbiAqIExpbmtpZmllcyB0aGUgZ2l2ZW4gc3RyaW5nLiBUaGlzIGlzIGEgd3JhcHBlciBhcm91bmQgJ2xpbmtpZnlqcy9zdHJpbmcnLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgc3RyaW5nIHRvIGxpbmtpZnlcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBmb3IgbGlua2lmeVN0cmluZy4gRGVmYXVsdDogbGlua2lmeU1hdHJpeC5vcHRpb25zXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBMaW5raWZpZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5U3RyaW5nKHN0cjogc3RyaW5nLCBvcHRpb25zID0gbGlua2lmeU1hdHJpeC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIF9saW5raWZ5U3RyaW5nKHN0ciwgb3B0aW9ucyk7XG59XG5cbi8qKlxuICogTGlua2lmaWVzIHRoZSBnaXZlbiBET00gZWxlbWVudC4gVGhpcyBpcyBhIHdyYXBwZXIgYXJvdW5kICdsaW5raWZ5anMvZWxlbWVudCcuXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGVsZW1lbnQgRE9NIGVsZW1lbnQgdG8gbGlua2lmeVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIGZvciBsaW5raWZ5RWxlbWVudC4gRGVmYXVsdDogbGlua2lmeU1hdHJpeC5vcHRpb25zXG4gKiBAcmV0dXJucyB7b2JqZWN0fVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGlua2lmeUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIG9wdGlvbnMgPSBsaW5raWZ5TWF0cml4Lm9wdGlvbnMpIHtcbiAgICByZXR1cm4gX2xpbmtpZnlFbGVtZW50KGVsZW1lbnQsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIExpbmtpZnkgdGhlIGdpdmVuIHN0cmluZyBhbmQgc2FuaXRpemUgdGhlIEhUTUwgYWZ0ZXJ3YXJkcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlydHlIdG1sIFRoZSBIVE1MIHN0cmluZyB0byBzYW5pdGl6ZSBhbmQgbGlua2lmeVxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSBPcHRpb25zIGZvciBsaW5raWZ5U3RyaW5nLiBEZWZhdWx0OiBsaW5raWZ5TWF0cml4Lm9wdGlvbnNcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsaW5raWZ5QW5kU2FuaXRpemVIdG1sKGRpcnR5SHRtbDogc3RyaW5nLCBvcHRpb25zID0gbGlua2lmeU1hdHJpeC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIHNhbml0aXplSHRtbChsaW5raWZ5U3RyaW5nKGRpcnR5SHRtbCwgb3B0aW9ucyksIHNhbml0aXplSHRtbFBhcmFtcyk7XG59XG5cbi8qKlxuICogUmV0dXJucyBpZiBhIG5vZGUgaXMgYSBibG9jayBlbGVtZW50IG9yIG5vdC5cbiAqIE9ubHkgdGFrZXMgaHRtbCBub2RlcyBpbnRvIGFjY291bnQgdGhhdCBhcmUgYWxsb3dlZCBpbiBtYXRyaXggbWVzc2FnZXMuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJucyB7Ym9vbH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrQmxvY2tOb2RlKG5vZGU6IE5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUubm9kZU5hbWUpIHtcbiAgICAgICAgY2FzZSBcIkgxXCI6XG4gICAgICAgIGNhc2UgXCJIMlwiOlxuICAgICAgICBjYXNlIFwiSDNcIjpcbiAgICAgICAgY2FzZSBcIkg0XCI6XG4gICAgICAgIGNhc2UgXCJINVwiOlxuICAgICAgICBjYXNlIFwiSDZcIjpcbiAgICAgICAgY2FzZSBcIlBSRVwiOlxuICAgICAgICBjYXNlIFwiQkxPQ0tRVU9URVwiOlxuICAgICAgICBjYXNlIFwiUFwiOlxuICAgICAgICBjYXNlIFwiVUxcIjpcbiAgICAgICAgY2FzZSBcIk9MXCI6XG4gICAgICAgIGNhc2UgXCJMSVwiOlxuICAgICAgICBjYXNlIFwiSFJcIjpcbiAgICAgICAgY2FzZSBcIlRBQkxFXCI6XG4gICAgICAgIGNhc2UgXCJUSEVBRFwiOlxuICAgICAgICBjYXNlIFwiVEJPRFlcIjpcbiAgICAgICAgY2FzZSBcIlRSXCI6XG4gICAgICAgIGNhc2UgXCJUSFwiOlxuICAgICAgICBjYXNlIFwiVERcIjpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICBjYXNlIFwiRElWXCI6XG4gICAgICAgICAgICAvLyBkb24ndCB0cmVhdCBtYXRoIG5vZGVzIGFzIGJsb2NrIG5vZGVzIGZvciBkZXNlcmlhbGl6aW5nXG4gICAgICAgICAgICByZXR1cm4gIShub2RlIGFzIEhUTUxFbGVtZW50KS5oYXNBdHRyaWJ1dGUoXCJkYXRhLW14LW1hdGhzXCIpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==