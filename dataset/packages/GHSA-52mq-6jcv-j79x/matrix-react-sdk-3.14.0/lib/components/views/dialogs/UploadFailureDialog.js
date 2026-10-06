"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _filesize = _interopRequireDefault(require("filesize"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _ContentMessages = _interopRequireDefault(require("../../../ContentMessages"));

/*
Copyright 2019 New Vector Ltd

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

/*
 * Tells the user about files we know cannot be uploaded before we even try uploading
 * them. This is named fairly generically but the only thing we check right now is
 * the size of the file.
 */
class UploadFailureDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onUploadClick", () => {
      this.props.onFinished(true);
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    let message;
    let preview;
    let buttons;

    if (this.props.totalFiles === 1 && this.props.badFiles.length === 1) {
      message = (0, _languageHandler._t)("This file is <b>too large</b> to upload. " + "The file size limit is %(limit)s but this file is %(sizeOfThisFile)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit()),
        sizeOfThisFile: (0, _filesize.default)(this.props.badFiles[0].size)
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      buttons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('OK'),
        hasCancel: false,
        onPrimaryButtonClick: this._onCancelClick,
        focus: true
      });
    } else if (this.props.totalFiles === this.props.badFiles.length) {
      message = (0, _languageHandler._t)("These files are <b>too large</b> to upload. " + "The file size limit is %(limit)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit())
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      buttons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('OK'),
        hasCancel: false,
        onPrimaryButtonClick: this._onCancelClick,
        focus: true
      });
    } else {
      message = (0, _languageHandler._t)("Some files are <b>too large</b> to be uploaded. " + "The file size limit is %(limit)s.", {
        limit: (0, _filesize.default)(this.props.contentMessages.getUploadLimit())
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      });
      const howManyOthers = this.props.totalFiles - this.props.badFiles.length;
      buttons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Upload %(count)s other files', {
          count: howManyOthers
        }),
        onPrimaryButtonClick: this._onUploadClick,
        hasCancel: true,
        cancelButton: (0, _languageHandler._t)("Cancel All"),
        onCancel: this._onCancelClick,
        focus: true
      });
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_UploadFailureDialog",
      onFinished: this._onCancelClick,
      title: (0, _languageHandler._t)("Upload Error"),
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, message, preview), buttons);
  }

}

exports.default = UploadFailureDialog;
(0, _defineProperty2.default)(UploadFailureDialog, "propTypes", {
  badFiles: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  totalFiles: _propTypes.default.number.isRequired,
  contentMessages: _propTypes.default.instanceOf(_ContentMessages.default).isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkRmFpbHVyZURpYWxvZy5qcyJdLCJuYW1lcyI6WyJVcGxvYWRGYWlsdXJlRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsIm1lc3NhZ2UiLCJwcmV2aWV3IiwiYnV0dG9ucyIsInRvdGFsRmlsZXMiLCJiYWRGaWxlcyIsImxlbmd0aCIsImxpbWl0IiwiY29udGVudE1lc3NhZ2VzIiwiZ2V0VXBsb2FkTGltaXQiLCJzaXplT2ZUaGlzRmlsZSIsInNpemUiLCJiIiwic3ViIiwiX29uQ2FuY2VsQ2xpY2siLCJob3dNYW55T3RoZXJzIiwiY291bnQiLCJfb25VcGxvYWRDbGljayIsIlByb3BUeXBlcyIsImFycmF5T2YiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwibnVtYmVyIiwiaW5zdGFuY2VPZiIsIkNvbnRlbnRNZXNzYWdlcyIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsbUJBQU4sU0FBa0NDLGVBQU1DLFNBQXhDLENBQWtEO0FBQUE7QUFBQTtBQUFBLDBEQVE1QyxNQUFNO0FBQ25CLFdBQUtDLEtBQUwsQ0FBV0MsVUFBWCxDQUFzQixLQUF0QjtBQUNILEtBVjREO0FBQUEsMERBWTVDLE1BQU07QUFDbkIsV0FBS0QsS0FBTCxDQUFXQyxVQUFYLENBQXNCLElBQXRCO0FBQ0gsS0FkNEQ7QUFBQTs7QUFnQjdEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxV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QUcsY0FBSCxDQUZYO0FBR0ksTUFBQSxTQUFTLEVBQUM7QUFIZCxvQkFLSTtBQUFLLE1BQUEsRUFBRSxFQUFDO0FBQVIsT0FDS2IsT0FETCxFQUVLQyxPQUZMLENBTEosRUFVS0MsT0FWTCxDQURKO0FBY0g7O0FBekY0RDs7OzhCQUE1Q1osbUIsZUFDRTtBQUNmYyxFQUFBQSxRQUFRLEVBQUVhLG1CQUFVQyxPQUFWLENBQWtCRCxtQkFBVUUsTUFBNUIsRUFBb0NDLFVBRC9CO0FBRWZqQixFQUFBQSxVQUFVLEVBQUVjLG1CQUFVSSxNQUFWLENBQWlCRCxVQUZkO0FBR2ZiLEVBQUFBLGVBQWUsRUFBRVUsbUJBQVVLLFVBQVYsQ0FBcUJDLHdCQUFyQixFQUFzQ0gsVUFIeEM7QUFJZjFCLEVBQUFBLFVBQVUsRUFBRXVCLG1CQUFVTyxJQUFWLENBQWVKO0FBSlosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBmaWxlc2l6ZSBmcm9tICdmaWxlc2l6ZSc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBDb250ZW50TWVzc2FnZXMgZnJvbSAnLi4vLi4vLi4vQ29udGVudE1lc3NhZ2VzJztcblxuLypcbiAqIFRlbGxzIHRoZSB1c2VyIGFib3V0IGZpbGVzIHdlIGtub3cgY2Fubm90IGJlIHVwbG9hZGVkIGJlZm9yZSB3ZSBldmVuIHRyeSB1cGxvYWRpbmdcbiAqIHRoZW0uIFRoaXMgaXMgbmFtZWQgZmFpcmx5IGdlbmVyaWNhbGx5IGJ1dCB0aGUgb25seSB0aGluZyB3ZSBjaGVjayByaWdodCBub3cgaXNcbiAqIHRoZSBzaXplIG9mIHRoZSBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcGxvYWRGYWlsdXJlRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBiYWRGaWxlczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCkuaXNSZXF1aXJlZCxcbiAgICAgICAgdG90YWxGaWxlczogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICBjb250ZW50TWVzc2FnZXM6IFByb3BUeXBlcy5pbnN0YW5jZU9mKENvbnRlbnRNZXNzYWdlcykuaXNSZXF1aXJlZCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBfb25VcGxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICBsZXQgcHJldmlldztcbiAgICAgICAgbGV0IGJ1dHRvbnM7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRvdGFsRmlsZXMgPT09IDEgJiYgdGhpcy5wcm9wcy5iYWRGaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdChcbiAgICAgICAgICAgICAgICBcIlRoaXMgZmlsZSBpcyA8Yj50b28gbGFyZ2U8L2I+IHRvIHVwbG9hZC4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVGhlIGZpbGUgc2l6ZSBsaW1pdCBpcyAlKGxpbWl0KXMgYnV0IHRoaXMgZmlsZSBpcyAlKHNpemVPZlRoaXNGaWxlKXMuXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW1pdDogZmlsZXNpemUodGhpcy5wcm9wcy5jb250ZW50TWVzc2FnZXMuZ2V0VXBsb2FkTGltaXQoKSksXG4gICAgICAgICAgICAgICAgICAgIHNpemVPZlRoaXNGaWxlOiBmaWxlc2l6ZSh0aGlzLnByb3BzLmJhZEZpbGVzWzBdLnNpemUpLFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnT0snKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50b3RhbEZpbGVzID09PSB0aGlzLnByb3BzLmJhZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiVGhlc2UgZmlsZXMgYXJlIDxiPnRvbyBsYXJnZTwvYj4gdG8gdXBsb2FkLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUaGUgZmlsZSBzaXplIGxpbWl0IGlzICUobGltaXQpcy5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiBmaWxlc2l6ZSh0aGlzLnByb3BzLmNvbnRlbnRNZXNzYWdlcy5nZXRVcGxvYWRMaW1pdCgpKSxcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBidXR0b25zID0gPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ09LJyl9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiU29tZSBmaWxlcyBhcmUgPGI+dG9vIGxhcmdlPC9iPiB0byBiZSB1cGxvYWRlZC4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVGhlIGZpbGUgc2l6ZSBsaW1pdCBpcyAlKGxpbWl0KXMuXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW1pdDogZmlsZXNpemUodGhpcy5wcm9wcy5jb250ZW50TWVzc2FnZXMuZ2V0VXBsb2FkTGltaXQoKSksXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+e3N1Yn08L2I+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaG93TWFueU90aGVycyA9IHRoaXMucHJvcHMudG90YWxGaWxlcyAtIHRoaXMucHJvcHMuYmFkRmlsZXMubGVuZ3RoO1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ1VwbG9hZCAlKGNvdW50KXMgb3RoZXIgZmlsZXMnLCB7IGNvdW50OiBob3dNYW55T3RoZXJzIH0pfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblVwbG9hZENsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiQ2FuY2VsIEFsbFwiKX1cbiAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfVXBsb2FkRmFpbHVyZURpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlVwbG9hZCBFcnJvclwiKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgICAgICAgICAgICAgIHtwcmV2aWV3fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAge2J1dHRvbnN9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19