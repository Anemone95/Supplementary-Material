"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _Keyboard = require("../../../Keyboard");

/*
 Copyright 2017 Vector Creations Ltd
 Copyright 2017 Michael Telatynski

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
class ForwardMessage extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onKeyDown", ev => {
      switch (ev.key) {
        case _Keyboard.Key.ESCAPE:
          this.props.onCancelClick();
          break;
      }
    });
  }

  componentDidMount() {
    document.addEventListener('keydown', this._onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._onKeyDown);
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ForwardMessage"
    }, /*#__PURE__*/_react.default.createElement("h1", null, (0, _languageHandler._t)('Please select the destination room for this message')));
  }

}

exports.default = ForwardMessage;
(0, _defineProperty2.default)(ForwardMessage, "propTypes", {
  onCancelClick: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0ZvcndhcmRNZXNzYWdlLmpzIl0sIm5hbWVzIjpbIkZvcndhcmRNZXNzYWdlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJldiIsImtleSIsIktleSIsIkVTQ0FQRSIsInByb3BzIiwib25DYW5jZWxDbGljayIsImNvbXBvbmVudERpZE1vdW50IiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwiX29uS2V5RG93biIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbmRlciIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRZSxNQUFNQSxjQUFOLFNBQTZCQyxlQUFNQyxTQUFuQyxDQUE2QztBQUFBO0FBQUE7QUFBQSxzREFhM0NDLEVBQUUsSUFBSTtBQUNmLGNBQVFBLEVBQUUsQ0FBQ0MsR0FBWDtBQUNJLGFBQUtDLGNBQUlDLE1BQVQ7QUFDSSxlQUFLQyxLQUFMLENBQVdDLGFBQVg7QUFDQTtBQUhSO0FBS0gsS0FuQnVEO0FBQUE7O0FBS3hEQyxFQUFBQSxpQkFBaUIsR0FBRztBQUNoQkMsSUFBQUEsUUFBUSxDQUFDQyxnQkFBVCxDQUEwQixTQUExQixFQUFxQyxLQUFLQyxVQUExQztBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQkgsSUFBQUEsUUFBUSxDQUFDSSxtQkFBVCxDQUE2QixTQUE3QixFQUF3QyxLQUFLRixVQUE3QztBQUNIOztBQVVERyxFQUFBQSxNQUFNLEdBQUc7QUFDTCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0kseUNBQU0seUJBQUcscURBQUgsQ0FBTixDQURKLENBREo7QUFLSDs7QUEzQnVEOzs7OEJBQXZDZixjLGVBQ0U7QUFDZlEsRUFBQUEsYUFBYSxFQUFFUSxtQkFBVUMsSUFBVixDQUFlQztBQURmLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG4gQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBUZWxhdHluc2tpXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge0tleX0gZnJvbSAnLi4vLi4vLi4vS2V5Ym9hcmQnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcndhcmRNZXNzYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkNhbmNlbENsaWNrOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX29uS2V5RG93bik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLl9vbktleURvd24pO1xuICAgIH1cblxuICAgIF9vbktleURvd24gPSBldiA9PiB7XG4gICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICBjYXNlIEtleS5FU0NBUEU6XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbENsaWNrKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Gb3J3YXJkTWVzc2FnZVwiPlxuICAgICAgICAgICAgICAgIDxoMT57IF90KCdQbGVhc2Ugc2VsZWN0IHRoZSBkZXN0aW5hdGlvbiByb29tIGZvciB0aGlzIG1lc3NhZ2UnKSB9PC9oMT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==