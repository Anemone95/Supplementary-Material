/*
 Copyright 2016 OpenMarket Ltd

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
'use strict';

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _DecryptFile = require("../../../utils/DecryptFile");

var _languageHandler = require("../../../languageHandler");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

class MAudioBody extends _react.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      decryptedUrl: null,
      decryptedBlob: null,
      error: null
    };
  }

  onPlayToggle() {
    this.setState({
      playing: !this.state.playing
    });
  }

  _getContentUrl() {
    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined) {
      return this.state.decryptedUrl;
    } else {
      return _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(content.url);
    }
  }

  componentDidMount() {
    const content = this.props.mxEvent.getContent();

    if (content.file !== undefined && this.state.decryptedUrl === null) {
      let decryptedBlob;
      (0, _DecryptFile.decryptFile)(content.file).then(function (blob) {
        decryptedBlob = blob;
        return URL.createObjectURL(decryptedBlob);
      }).then(url => {
        this.setState({
          decryptedUrl: url,
          decryptedBlob: decryptedBlob
        });
      }, err => {
        console.warn("Unable to decrypt attachment: ", err);
        this.setState({
          error: err
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.state.decryptedUrl) {
      URL.revokeObjectURL(this.state.decryptedUrl);
    }
  }

  render() {
    const content = this.props.mxEvent.getContent();

    if (this.state.error !== null) {
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MAudioBody"
      }, /*#__PURE__*/_react.default.createElement("img", {
        src: require("../../../../res/img/warning.svg"),
        width: "16",
        height: "16"
      }), (0, _languageHandler._t)("Error decrypting audio"));
    }

    if (content.file !== undefined && this.state.decryptedUrl === null) {
      // Need to decrypt the attachment
      // The attachment is decrypted in componentDidMount.
      // For now add an img tag with a 16x16 spinner.
      // Not sure how tall the audio player is so not sure how tall it should actually be.
      return /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_MAudioBody"
      }, /*#__PURE__*/_react.default.createElement(_InlineSpinner.default, null));
    }

    const contentUrl = this._getContentUrl();

    return /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_MAudioBody"
    }, /*#__PURE__*/_react.default.createElement("audio", {
      src: contentUrl,
      controls: true
    }), /*#__PURE__*/_react.default.createElement(_MFileBody.default, (0, _extends2.default)({}, this.props, {
      decryptedBlob: this.state.decryptedBlob
    })));
  }

}

exports.default = MAudioBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01BdWRpb0JvZHkuanMiXSwibmFtZXMiOlsiTUF1ZGlvQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwicGxheWluZyIsImRlY3J5cHRlZFVybCIsImRlY3J5cHRlZEJsb2IiLCJlcnJvciIsIm9uUGxheVRvZ2dsZSIsInNldFN0YXRlIiwiX2dldENvbnRlbnRVcmwiLCJjb250ZW50IiwibXhFdmVudCIsImdldENvbnRlbnQiLCJmaWxlIiwidW5kZWZpbmVkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwibXhjVXJsVG9IdHRwIiwidXJsIiwiY29tcG9uZW50RGlkTW91bnQiLCJ0aGVuIiwiYmxvYiIsIlVSTCIsImNyZWF0ZU9iamVjdFVSTCIsImVyciIsImNvbnNvbGUiLCJ3YXJuIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZXZva2VPYmplY3RVUkwiLCJyZW5kZXIiLCJyZXF1aXJlIiwiY29udGVudFVybCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7Ozs7Ozs7Ozs7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRWUsTUFBTUEsVUFBTixTQUF5QkMsZUFBTUMsU0FBL0IsQ0FBeUM7QUFDcERDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQUNBLFNBQUtDLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxPQUFPLEVBQUUsS0FEQTtBQUVUQyxNQUFBQSxZQUFZLEVBQUUsSUFGTDtBQUdUQyxNQUFBQSxhQUFhLEVBQUUsSUFITjtBQUlUQyxNQUFBQSxLQUFLLEVBQUU7QUFKRSxLQUFiO0FBTUg7O0FBQ0RDLEVBQUFBLFlBQVksR0FBRztBQUNYLFNBQUtD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OztBQXBGbUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IE1GaWxlQm9keSBmcm9tICcuL01GaWxlQm9keSc7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHsgZGVjcnlwdEZpbGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9EZWNyeXB0RmlsZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9JbmxpbmVTcGlubmVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUF1ZGlvQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGxheWluZzogZmFsc2UsXG4gICAgICAgICAgICBkZWNyeXB0ZWRVcmw6IG51bGwsXG4gICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBudWxsLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuICAgIG9uUGxheVRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0Q29udGVudFVybCgpIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGlmIChjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZGVjcnlwdGVkVXJsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE1hdHJpeENsaWVudFBlZy5nZXQoKS5teGNVcmxUb0h0dHAoY29udGVudC51cmwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBkZWNyeXB0ZWRCbG9iO1xuICAgICAgICAgICAgZGVjcnlwdEZpbGUoY29udGVudC5maWxlKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iID0gYmxvYjtcbiAgICAgICAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChkZWNyeXB0ZWRCbG9iKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRVcmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdCBhdHRhY2htZW50OiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCkge1xuICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01BdWRpb0JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3dhcm5pbmcuc3ZnXCIpfSB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRXJyb3IgZGVjcnlwdGluZyBhdWRpb1wiKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAvLyBUaGUgYXR0YWNobWVudCBpcyBkZWNyeXB0ZWQgaW4gY29tcG9uZW50RGlkTW91bnQuXG4gICAgICAgICAgICAvLyBGb3Igbm93IGFkZCBhbiBpbWcgdGFnIHdpdGggYSAxNngxNiBzcGlubmVyLlxuICAgICAgICAgICAgLy8gTm90IHN1cmUgaG93IHRhbGwgdGhlIGF1ZGlvIHBsYXllciBpcyBzbyBub3Qgc3VyZSBob3cgdGFsbCBpdCBzaG91bGQgYWN0dWFsbHkgYmUuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01BdWRpb0JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPElubGluZVNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudFVybCA9IHRoaXMuX2dldENvbnRlbnRVcmwoKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUF1ZGlvQm9keVwiPlxuICAgICAgICAgICAgICAgIDxhdWRpbyBzcmM9e2NvbnRlbnRVcmx9IGNvbnRyb2xzIC8+XG4gICAgICAgICAgICAgICAgPE1GaWxlQm9keSB7Li4udGhpcy5wcm9wc30gZGVjcnlwdGVkQmxvYj17dGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9ifSAvPlxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==