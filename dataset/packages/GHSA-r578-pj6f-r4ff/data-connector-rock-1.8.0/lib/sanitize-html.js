"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'br', 'caption', 'img', 'div'];
const allowedAttributes = {
  a: ['href', 'target'],
  img: ['src']
}; // A very picky HTML sanitizer

function _default(dirty) {
  return (0, _sanitizeHtml.default)(dirty, {
    allowedTags,
    allowedAttributes
  });
}
//# sourceMappingURL=sanitize-html.js.map