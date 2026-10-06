"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var React = _interopRequireWildcard(require("react"));

var _qrcode = require("qrcode");

var _classnames = _interopRequireDefault(require("classnames"));

var _languageHandler = require("../../../languageHandler");

var _Spinner = _interopRequireDefault(require("./Spinner"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const defaultOptions
/*: QRCodeToDataURLOptions*/
= {
  errorCorrectionLevel: 'L' // we want it as trivial-looking as possible

};

const QRCode
/*: React.FC<IProps>*/
= (_ref) => {
  let {
    data,
    className
  } = _ref,
      options = (0, _objectWithoutProperties2.default)(_ref, ["data", "className"]);
  const [dataUri, setUri] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    (0, _qrcode.toDataURL)(data, _objectSpread(_objectSpread({}, defaultOptions), options)).then(uri => {
      if (cancelled) return;
      setUri(uri);
    });
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(data), options]); // eslint-disable-line react-hooks/exhaustive-deps

  return /*#__PURE__*/React.createElement("div", {
    className: (0, _classnames.default)("mx_QRCode", className)
  }, dataUri ? /*#__PURE__*/React.createElement("img", {
    src: dataUri,
    className: "mx_VerificationQRCode",
    alt: (0, _languageHandler._t)("QR Code")
  }) : /*#__PURE__*/React.createElement(_Spinner.default, null));
};

var _default = QRCode;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1FSQ29kZS50c3giXSwibmFtZXMiOlsiZGVmYXVsdE9wdGlvbnMiLCJlcnJvckNvcnJlY3Rpb25MZXZlbCIsIlFSQ29kZSIsImRhdGEiLCJjbGFzc05hbWUiLCJvcHRpb25zIiwiZGF0YVVyaSIsInNldFVyaSIsIlJlYWN0IiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJjYW5jZWxsZWQiLCJ0aGVuIiwidXJpIiwiSlNPTiIsInN0cmluZ2lmeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7Ozs7QUFPQSxNQUFNQTtBQUFzQztBQUFBLEVBQUc7QUFDM0NDLEVBQUFBLG9CQUFvQixFQUFFLEdBRHFCLENBQ2hCOztBQURnQixDQUEvQzs7QUFJQSxNQUFNQztBQUF3QjtBQUFBLEVBQUcsVUFBbUM7QUFBQSxNQUFsQztBQUFDQyxJQUFBQSxJQUFEO0FBQU9DLElBQUFBO0FBQVAsR0FBa0M7QUFBQSxNQUFiQyxPQUFhO0FBQ2hFLFFBQU0sQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLElBQW9CQyxLQUFLLENBQUNDLFFBQU4sQ0FBdUIsSUFBdkIsQ0FBMUI7QUFDQUQsRUFBQUEsS0FBSyxDQUFDRSxTQUFOLENBQWdCLE1BQU07QUFDbEIsUUFBSUMsU0FBUyxHQUFHLEtBQWhCO0FBQ0EsMkJBQVVSLElBQVYsa0NBQW9CSCxjQUFwQixHQUF1Q0ssT0FBdkMsR0FBaURPLElBQWpELENBQXNEQyxHQUFHLElBQUk7QUFDekQsVUFBSUYsU0FBSixFQUFlO0FBQ2ZKLE1BQUFBLE1BQU0sQ0FBQ00sR0FBRCxDQUFOO0FBQ0gsS0FIRDtBQUlBLFdBQU8sTUFBTTtBQUNURixNQUFBQSxTQUFTLEdBQUcsSUFBWjtBQUNILEtBRkQ7QUFHSCxHQVRELEVBU0csQ0FBQ0csSUFBSSxDQUFDQyxTQUFMLENBQWVaLElBQWYsQ0FBRCxFQUF1QkUsT0FBdkIsQ0FUSCxFQUZnRSxDQVczQjs7QUFFckMsc0JBQU87QUFBSyxJQUFBLFNBQVMsRUFBRSx5QkFBVyxXQUFYLEVBQXdCRCxTQUF4QjtBQUFoQixLQUNERSxPQUFPLGdCQUFHO0FBQUssSUFBQSxHQUFHLEVBQUVBLE9BQVY7QUFBbUIsSUFBQSxTQUFTLEVBQUMsdUJBQTdCO0FBQXFELElBQUEsR0FBRyxFQUFFLHlCQUFHLFNBQUg7QUFBMUQsSUFBSCxnQkFBaUYsb0JBQUMsZ0JBQUQsT0FEdkYsQ0FBUDtBQUdILENBaEJEOztlQWtCZUosTSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHt0b0RhdGFVUkwsIFFSQ29kZVNlZ21lbnQsIFFSQ29kZVRvRGF0YVVSTE9wdGlvbnN9IGZyb20gXCJxcmNvZGVcIjtcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gXCJjbGFzc25hbWVzXCI7XG5cbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuL1NwaW5uZXJcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIFFSQ29kZVRvRGF0YVVSTE9wdGlvbnMge1xuICAgIGRhdGE6IHN0cmluZyB8IFFSQ29kZVNlZ21lbnRbXTtcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBRUkNvZGVUb0RhdGFVUkxPcHRpb25zID0ge1xuICAgIGVycm9yQ29ycmVjdGlvbkxldmVsOiAnTCcsIC8vIHdlIHdhbnQgaXQgYXMgdHJpdmlhbC1sb29raW5nIGFzIHBvc3NpYmxlXG59O1xuXG5jb25zdCBRUkNvZGU6IFJlYWN0LkZDPElQcm9wcz4gPSAoe2RhdGEsIGNsYXNzTmFtZSwgLi4ub3B0aW9uc30pID0+IHtcbiAgICBjb25zdCBbZGF0YVVyaSwgc2V0VXJpXSA9IFJlYWN0LnVzZVN0YXRlPHN0cmluZz4obnVsbCk7XG4gICAgUmVhY3QudXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuICAgICAgICB0b0RhdGFVUkwoZGF0YSwgey4uLmRlZmF1bHRPcHRpb25zLCAuLi5vcHRpb25zfSkudGhlbih1cmkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbmNlbGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0VXJpKHVyaSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICB9LCBbSlNPTi5zdHJpbmdpZnkoZGF0YSksIG9wdGlvbnNdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1FSQ29kZVwiLCBjbGFzc05hbWUpfT5cbiAgICAgICAgeyBkYXRhVXJpID8gPGltZyBzcmM9e2RhdGFVcml9IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblFSQ29kZVwiIGFsdD17X3QoXCJRUiBDb2RlXCIpfSAvPiA6IDxTcGlubmVyIC8+IH1cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBRUkNvZGU7XG4iXX0=