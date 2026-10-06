"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _MFileBody = _interopRequireDefault(require("./MFileBody"));

var _DecryptFile = require("../../../utils/DecryptFile");

var _languageHandler = require("../../../languageHandler");

var _InlineSpinner = _interopRequireDefault(require("../elements/InlineSpinner"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class;

let MAudioBody = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.MAudioBody"), _dec(_class = class MAudioBody extends _react.default.Component {
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
    const media = (0, _Media.mediaFromContent)(this.props.mxEvent.getContent());

    if (media.isEncrypted) {
      return this.state.decryptedUrl;
    } else {
      return media.srcHttp;
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
      decryptedBlob: this.state.decryptedBlob,
      showGenericPlaceholder: false
    })));
  }

}) || _class);
exports.default = MAudioBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01BdWRpb0JvZHkuanMiXSwibmFtZXMiOlsiTUF1ZGlvQm9keSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInN0YXRlIiwicGxheWluZyIsImRlY3J5cHRlZFVybCIsImRlY3J5cHRlZEJsb2IiLCJlcnJvciIsIm9uUGxheVRvZ2dsZSIsInNldFN0YXRlIiwiX2dldENvbnRlbnRVcmwiLCJtZWRpYSIsIm14RXZlbnQiLCJnZXRDb250ZW50IiwiaXNFbmNyeXB0ZWQiLCJzcmNIdHRwIiwiY29tcG9uZW50RGlkTW91bnQiLCJjb250ZW50IiwiZmlsZSIsInVuZGVmaW5lZCIsInRoZW4iLCJibG9iIiwiVVJMIiwiY3JlYXRlT2JqZWN0VVJMIiwidXJsIiwiZXJyIiwiY29uc29sZSIsIndhcm4iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJldm9rZU9iamVjdFVSTCIsInJlbmRlciIsInJlcXVpcmUiLCJjb250ZW50VXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsVSxXQURwQixnREFBcUIsMkJBQXJCLEMsZ0JBQUQsTUFDcUJBLFVBRHJCLFNBQ3dDQyxlQUFNQyxTQUQ5QyxDQUN3RDtBQUNwREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBQ0EsU0FBS0MsS0FBTCxHQUFhO0FBQ1RDLE1BQUFBLE9BQU8sRUFBRSxLQURBO0FBRVRDLE1BQUFBLFlBQVksRUFBRSxJQUZMO0FBR1RDLE1BQUFBLGFBQWEsRUFBRSxJQUhOO0FBSVRDLE1BQUFBLEtBQUssRUFBRTtBQUpFLEtBQWI7QUFNSDs7QUFDREMsRUFBQUEsWUFBWSxHQUFHO0FBQ1gsU0FBS0MsUUFBTCxDQUFjO0FBQ1ZMLE1BQUFBLE9BQU8sRUFBRSxDQUFDLEtBQUtE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TWFya2V0IEx0ZFxuXG4gTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgTUZpbGVCb2R5IGZyb20gJy4vTUZpbGVCb2R5JztcblxuaW1wb3J0IHsgZGVjcnlwdEZpbGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9EZWNyeXB0RmlsZSc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgSW5saW5lU3Bpbm5lciBmcm9tICcuLi9lbGVtZW50cy9JbmxpbmVTcGlubmVyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHttZWRpYUZyb21Db250ZW50fSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MubWVzc2FnZXMuTUF1ZGlvQm9keVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUF1ZGlvQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGxheWluZzogZmFsc2UsXG4gICAgICAgICAgICBkZWNyeXB0ZWRVcmw6IG51bGwsXG4gICAgICAgICAgICBkZWNyeXB0ZWRCbG9iOiBudWxsLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuICAgIG9uUGxheVRvZ2dsZSgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwbGF5aW5nOiAhdGhpcy5zdGF0ZS5wbGF5aW5nLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0Q29udGVudFVybCgpIHtcbiAgICAgICAgY29uc3QgbWVkaWEgPSBtZWRpYUZyb21Db250ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRDb250ZW50KCkpO1xuICAgICAgICBpZiAobWVkaWEuaXNFbmNyeXB0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBtZWRpYS5zcmNIdHRwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoY29udGVudC5maWxlICE9PSB1bmRlZmluZWQgJiYgdGhpcy5zdGF0ZS5kZWNyeXB0ZWRVcmwgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGxldCBkZWNyeXB0ZWRCbG9iO1xuICAgICAgICAgICAgZGVjcnlwdEZpbGUoY29udGVudC5maWxlKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgICAgICAgICAgICBkZWNyeXB0ZWRCbG9iID0gYmxvYjtcbiAgICAgICAgICAgICAgICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChkZWNyeXB0ZWRCbG9iKTtcbiAgICAgICAgICAgIH0pLnRoZW4oKHVybCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBkZWNyeXB0ZWRVcmw6IHVybCxcbiAgICAgICAgICAgICAgICAgICAgZGVjcnlwdGVkQmxvYjogZGVjcnlwdGVkQmxvYixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oXCJVbmFibGUgdG8gZGVjcnlwdCBhdHRhY2htZW50OiBcIiwgZXJyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGVycixcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCkge1xuICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01BdWRpb0JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL3dhcm5pbmcuc3ZnXCIpfSB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiAvPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiRXJyb3IgZGVjcnlwdGluZyBhdWRpb1wiKSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb250ZW50LmZpbGUgIT09IHVuZGVmaW5lZCAmJiB0aGlzLnN0YXRlLmRlY3J5cHRlZFVybCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gTmVlZCB0byBkZWNyeXB0IHRoZSBhdHRhY2htZW50XG4gICAgICAgICAgICAvLyBUaGUgYXR0YWNobWVudCBpcyBkZWNyeXB0ZWQgaW4gY29tcG9uZW50RGlkTW91bnQuXG4gICAgICAgICAgICAvLyBGb3Igbm93IGFkZCBhbiBpbWcgdGFnIHdpdGggYSAxNngxNiBzcGlubmVyLlxuICAgICAgICAgICAgLy8gTm90IHN1cmUgaG93IHRhbGwgdGhlIGF1ZGlvIHBsYXllciBpcyBzbyBub3Qgc3VyZSBob3cgdGFsbCBpdCBzaG91bGQgYWN0dWFsbHkgYmUuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01BdWRpb0JvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgPElubGluZVNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGVudFVybCA9IHRoaXMuX2dldENvbnRlbnRVcmwoKTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfTUF1ZGlvQm9keVwiPlxuICAgICAgICAgICAgICAgIDxhdWRpbyBzcmM9e2NvbnRlbnRVcmx9IGNvbnRyb2xzIC8+XG4gICAgICAgICAgICAgICAgPE1GaWxlQm9keSB7Li4udGhpcy5wcm9wc30gZGVjcnlwdGVkQmxvYj17dGhpcy5zdGF0ZS5kZWNyeXB0ZWRCbG9ifSBzaG93R2VuZXJpY1BsYWNlaG9sZGVyPXtmYWxzZX0gLz5cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=