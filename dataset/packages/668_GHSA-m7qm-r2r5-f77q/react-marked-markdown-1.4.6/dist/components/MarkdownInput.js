'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MarkdownInput = function (_React$Component) {
  (0, _inherits3.default)(MarkdownInput, _React$Component);

  function MarkdownInput() {
    (0, _classCallCheck3.default)(this, MarkdownInput);
    return (0, _possibleConstructorReturn3.default)(this, (MarkdownInput.__proto__ || (0, _getPrototypeOf2.default)(MarkdownInput)).apply(this, arguments));
  }

  (0, _createClass3.default)(MarkdownInput, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          onChange = _props.onChange,
          value = _props.value,
          placeholder = _props.placeholder,
          className = _props.className;

      return _react2.default.createElement('textarea', {
        onChange: onChange,
        value: value,
        placeholder: placeholder,
        ref: 'textareaRef',
        className: className
      });
    }
  }]);
  return MarkdownInput;
}(_react2.default.Component);

exports.default = MarkdownInput;


MarkdownInput.propTypes = {
  onChange: _propTypes2.default.func,
  value: _propTypes2.default.string,
  placeholder: _propTypes2.default.string,
  className: _propTypes2.default.string
};