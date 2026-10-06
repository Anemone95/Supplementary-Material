"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let UploadFailureDialog = (
/*
 * Tells the user about files we know cannot be uploaded before we even try uploading
 * them. This is named fairly generically but the only thing we check right now is
 * the size of the file.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.UploadFailureDialog"), _dec(_class = (_temp = _class2 = class UploadFailureDialog extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  badFiles: _propTypes.default.arrayOf(_propTypes.default.object).isRequired,
  totalFiles: _propTypes.default.number.isRequired,
  contentMessages: _propTypes.default.instanceOf(_ContentMessages.default).isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = UploadFailureDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkRmFpbHVyZURpYWxvZy5qcyJdLCJuYW1lcyI6WyJVcGxvYWRGYWlsdXJlRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsIm1lc3NhZ2UiLCJwcmV2aWV3IiwiYnV0dG9ucyIsInRvdGFsRmlsZXMiLCJiYWRGaWxlcyIsImxlbmd0aCIsImxpbWl0IiwiY29udGVudE1lc3NhZ2VzIiwiZ2V0VXBsb2FkTGltaXQiLCJzaXplT2ZUaGlzRmlsZSIsInNpemUiLCJiIiwic3ViIiwiX29uQ2FuY2VsQ2xpY2siLCJob3dNYW55T3RoZXJzIiwiY291bnQiLCJfb25VcGxvYWRDbGljayIsIlByb3BUeXBlcyIsImFycmF5T2YiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwibnVtYmVyIiwiaW5zdGFuY2VPZiIsIkNvbnRlbnRNZXNzYWdlcyIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFRcUJBLG1CO0FBTnJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7T0FDQyxnREFBcUIsbUNBQXJCLEMsbUNBQUQsTUFDcUJBLG1CQURyQixTQUNpREMsZUFBTUMsU0FEdkQsQ0FDaUU7QUFBQTtBQUFBO0FBQUEsMERBUTVDLE1BQU07QUFDbkIsV0FBS0MsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0FBQ0gsS0FWNEQ7QUFBQSwwREFZNUMsTUFBTTtBQUNuQixXQUFLRCxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsSUFBdEI7QUFDSCxLQWQ0RDtBQUFBOztBQWdCN0RDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFVBQVUsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENB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QUhkLG9CQUtJO0FBQUssTUFBQSxFQUFFLEVBQUM7QUFBUixPQUNLYixPQURMLEVBRUtDLE9BRkwsQ0FMSixFQVVLQyxPQVZMLENBREo7QUFjSDs7QUF6RjRELEMsc0RBQzFDO0FBQ2ZFLEVBQUFBLFFBQVEsRUFBRWEsbUJBQVVDLE9BQVYsQ0FBa0JELG1CQUFVRSxNQUE1QixFQUFvQ0MsVUFEL0I7QUFFZmpCLEVBQUFBLFVBQVUsRUFBRWMsbUJBQVVJLE1BQVYsQ0FBaUJELFVBRmQ7QUFHZmIsRUFBQUEsZUFBZSxFQUFFVSxtQkFBVUssVUFBVixDQUFxQkMsd0JBQXJCLEVBQXNDSCxVQUh4QztBQUlmMUIsRUFBQUEsVUFBVSxFQUFFdUIsbUJBQVVPLElBQVYsQ0FBZUo7QUFKWixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGZpbGVzaXplIGZyb20gJ2ZpbGVzaXplJztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IENvbnRlbnRNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9Db250ZW50TWVzc2FnZXMnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8qXG4gKiBUZWxscyB0aGUgdXNlciBhYm91dCBmaWxlcyB3ZSBrbm93IGNhbm5vdCBiZSB1cGxvYWRlZCBiZWZvcmUgd2UgZXZlbiB0cnkgdXBsb2FkaW5nXG4gKiB0aGVtLiBUaGlzIGlzIG5hbWVkIGZhaXJseSBnZW5lcmljYWxseSBidXQgdGhlIG9ubHkgdGhpbmcgd2UgY2hlY2sgcmlnaHQgbm93IGlzXG4gKiB0aGUgc2l6ZSBvZiB0aGUgZmlsZS5cbiAqL1xuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5VcGxvYWRGYWlsdXJlRGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcGxvYWRGYWlsdXJlRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBiYWRGaWxlczogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm9iamVjdCkuaXNSZXF1aXJlZCxcbiAgICAgICAgdG90YWxGaWxlczogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICAgICAgICBjb250ZW50TWVzc2FnZXM6IFByb3BUeXBlcy5pbnN0YW5jZU9mKENvbnRlbnRNZXNzYWdlcykuaXNSZXF1aXJlZCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBfb25VcGxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBEaWFsb2dCdXR0b25zID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRGlhbG9nQnV0dG9ucycpO1xuXG4gICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICBsZXQgcHJldmlldztcbiAgICAgICAgbGV0IGJ1dHRvbnM7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnRvdGFsRmlsZXMgPT09IDEgJiYgdGhpcy5wcm9wcy5iYWRGaWxlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBfdChcbiAgICAgICAgICAgICAgICBcIlRoaXMgZmlsZSBpcyA8Yj50b28gbGFyZ2U8L2I+IHRvIHVwbG9hZC4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVGhlIGZpbGUgc2l6ZSBsaW1pdCBpcyAlKGxpbWl0KXMgYnV0IHRoaXMgZmlsZSBpcyAlKHNpemVPZlRoaXNGaWxlKXMuXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW1pdDogZmlsZXNpemUodGhpcy5wcm9wcy5jb250ZW50TWVzc2FnZXMuZ2V0VXBsb2FkTGltaXQoKSksXG4gICAgICAgICAgICAgICAgICAgIHNpemVPZlRoaXNGaWxlOiBmaWxlc2l6ZSh0aGlzLnByb3BzLmJhZEZpbGVzWzBdLnNpemUpLFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnT0snKX1cbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIGZvY3VzPXt0cnVlfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy50b3RhbEZpbGVzID09PSB0aGlzLnByb3BzLmJhZEZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiVGhlc2UgZmlsZXMgYXJlIDxiPnRvbyBsYXJnZTwvYj4gdG8gdXBsb2FkLiBcIiArXG4gICAgICAgICAgICAgICAgXCJUaGUgZmlsZSBzaXplIGxpbWl0IGlzICUobGltaXQpcy5cIixcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiBmaWxlc2l6ZSh0aGlzLnByb3BzLmNvbnRlbnRNZXNzYWdlcy5nZXRVcGxvYWRMaW1pdCgpKSxcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBidXR0b25zID0gPERpYWxvZ0J1dHRvbnMgcHJpbWFyeUJ1dHRvbj17X3QoJ09LJyl9XG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiU29tZSBmaWxlcyBhcmUgPGI+dG9vIGxhcmdlPC9iPiB0byBiZSB1cGxvYWRlZC4gXCIgK1xuICAgICAgICAgICAgICAgIFwiVGhlIGZpbGUgc2l6ZSBsaW1pdCBpcyAlKGxpbWl0KXMuXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBsaW1pdDogZmlsZXNpemUodGhpcy5wcm9wcy5jb250ZW50TWVzc2FnZXMuZ2V0VXBsb2FkTGltaXQoKSksXG4gICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+e3N1Yn08L2I+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgaG93TWFueU90aGVycyA9IHRoaXMucHJvcHMudG90YWxGaWxlcyAtIHRoaXMucHJvcHMuYmFkRmlsZXMubGVuZ3RoO1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoJ1VwbG9hZCAlKGNvdW50KXMgb3RoZXIgZmlsZXMnLCB7IGNvdW50OiBob3dNYW55T3RoZXJzIH0pfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblVwbG9hZENsaWNrfVxuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiQ2FuY2VsIEFsbFwiKX1cbiAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfVXBsb2FkRmFpbHVyZURpYWxvZydcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIlVwbG9hZCBFcnJvclwiKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAge21lc3NhZ2V9XG4gICAgICAgICAgICAgICAgICAgIHtwcmV2aWV3fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAge2J1dHRvbnN9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19