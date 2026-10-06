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

var _components = require('../components');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LiveMarkdownTextarea = function (_React$Component) {
  (0, _inherits3.default)(LiveMarkdownTextarea, _React$Component);

  function LiveMarkdownTextarea(props) {
    (0, _classCallCheck3.default)(this, LiveMarkdownTextarea);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LiveMarkdownTextarea.__proto__ || (0, _getPrototypeOf2.default)(LiveMarkdownTextarea)).call(this, props));

    _this.state = {
      value: props.defaultValue ? props.defaultValue : ''
    };
    return _this;
  }

  (0, _createClass3.default)(LiveMarkdownTextarea, [{
    key: 'handleTextChange',
    value: function handleTextChange(e) {
      this.setState({ value: e.target.value });
      if (this.props.onTextChange) {
        this.props.onTextChange(e.target.value);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.setState({ value: '' });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          placeholder = _props.placeholder,
          className = _props.className,
          inputClassName = _props.inputClassName,
          previewClassName = _props.previewClassName;
      var value = this.state.value;

      return _react2.default.createElement(
        'section',
        { className: className },
        _react2.default.createElement(_components.MarkdownInput, {
          placeholder: placeholder,
          onChange: this.handleTextChange.bind(this),
          value: value,
          className: inputClassName
        }),
        _react2.default.createElement(_components.MarkdownPreview, {
          value: value,
          className: previewClassName
        })
      );
    }
  }]);
  return LiveMarkdownTextarea;
}(_react2.default.Component);

exports.default = LiveMarkdownTextarea;


LiveMarkdownTextarea.propTypes = {
  onTextChange: _propTypes2.default.func,
  defaultValue: _propTypes2.default.string,
  placeholder: _propTypes2.default.string,
  className: _propTypes2.default.string,
  inputClassName: _propTypes2.default.string,
  previewClassName: _propTypes2.default.string
};