"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _filesize = _interopRequireDefault(require("filesize"));

/*
Copyright 2019 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>

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
class UploadConfirmDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onUploadClick", () => {
      this.props.onFinished(true);
    });
    (0, _defineProperty2.default)(this, "_onUploadAllClick", () => {
      this.props.onFinished(true, true);
    });
    this._objectUrl = URL.createObjectURL(props.file);
  }

  componentWillUnmount() {
    if (this._objectUrl) URL.revokeObjectURL(this._objectUrl);
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    let title;

    if (this.props.totalFiles > 1 && this.props.currentIndex !== undefined) {
      title = (0, _languageHandler._t)("Upload files (%(current)s of %(total)s)", {
        current: this.props.currentIndex + 1,
        total: this.props.totalFiles
      });
    } else {
      title = (0, _languageHandler._t)('Upload files');
    }

    let preview;

    if (this.props.file.type.startsWith('image/')) {
      preview = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UploadConfirmDialog_previewOuter"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_UploadConfirmDialog_previewInner"
      }, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_UploadConfirmDialog_imagePreview",
        src: this._objectUrl
      })), /*#__PURE__*/_react.default.createElement("div", null, this.props.file.name, " (", (0, _filesize.default)(this.props.file.size), ")")));
    } else {
      preview = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_UploadConfirmDialog_fileIcon",
        src: require("../../../../res/img/feather-customised/files.svg")
      }), this.props.file.name, " (", (0, _filesize.default)(this.props.file.size), ")"));
    }

    let uploadAllButton;

    if (this.props.currentIndex + 1 < this.props.totalFiles) {
      uploadAllButton = /*#__PURE__*/_react.default.createElement("button", {
        onClick: this._onUploadAllClick
      }, (0, _languageHandler._t)("Upload all"));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_UploadConfirmDialog",
      fixedWidth: false,
      onFinished: this._onCancelClick,
      title: title,
      contentId: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      id: "mx_Dialog_content"
    }, preview), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Upload'),
      hasCancel: false,
      onPrimaryButtonClick: this._onUploadClick,
      focus: true
    }, uploadAllButton));
  }

}

exports.default = UploadConfirmDialog;
(0, _defineProperty2.default)(UploadConfirmDialog, "propTypes", {
  file: _propTypes.default.object.isRequired,
  currentIndex: _propTypes.default.number,
  totalFiles: _propTypes.default.number,
  onFinished: _propTypes.default.func.isRequired
});
(0, _defineProperty2.default)(UploadConfirmDialog, "defaultProps", {
  totalFiles: 1
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvVXBsb2FkQ29uZmlybURpYWxvZy5qcyJdLCJuYW1lcyI6WyJVcGxvYWRDb25maXJtRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsIl9vYmplY3RVcmwiLCJVUkwiLCJjcmVhdGVPYmplY3RVUkwiLCJmaWxlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZXZva2VPYmplY3RVUkwiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRGlhbG9nQnV0dG9ucyIsInRpdGxlIiwidG90YWxGaWxlcyIsImN1cnJlbnRJbmRleCIsInVuZGVmaW5lZCIsImN1cnJlbnQiLCJ0b3RhbCIsInByZXZpZXciLCJ0eXBlIiwic3RhcnRzV2l0aCIsIm5hbWUiLCJzaXplIiwicmVxdWlyZSIsInVwbG9hZEFsbEJ1dHRvbiIsIl9vblVwbG9hZEFsbENsaWNrIiwiX29uQ2FuY2VsQ2xpY2siLCJfb25VcGxvYWRDbGljayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJudW1iZXIiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFlLE1BQU1BLG1CQUFOLFNBQWtDQyxlQUFNQyxTQUF4QyxDQUFrRDtBQVk3REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUsMERBVUYsTUFBTTtBQUNuQixXQUFLQSxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQVprQjtBQUFBLDBEQWNGLE1BQU07QUFDbkIsV0FBS0QsS0FBTCxDQUFXQyxV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QUEsU0FBUyxFQUFFLEtBRGY7QUFFSSxNQUFBLG9CQUFvQixFQUFFLEtBQUtTLGNBRi9CO0FBR0ksTUFBQSxLQUFLLEVBQUU7QUFIWCxPQUtLSCxlQUxMLENBVkosQ0FESjtBQW9CSDs7QUFqRzREOzs7OEJBQTVDN0IsbUIsZUFDRTtBQUNmUyxFQUFBQSxJQUFJLEVBQUV3QixtQkFBVUMsTUFBVixDQUFpQkMsVUFEUjtBQUVmaEIsRUFBQUEsWUFBWSxFQUFFYyxtQkFBVUcsTUFGVDtBQUdmbEIsRUFBQUEsVUFBVSxFQUFFZSxtQkFBVUcsTUFIUDtBQUlmL0IsRUFBQUEsVUFBVSxFQUFFNEIsbUJBQVVJLElBQVYsQ0FBZUY7QUFKWixDOzhCQURGbkMsbUIsa0JBUUs7QUFDbEJrQixFQUFBQSxVQUFVLEVBQUU7QUFETSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgZmlsZXNpemUgZnJvbSBcImZpbGVzaXplXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwbG9hZENvbmZpcm1EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGZpbGU6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgY3VycmVudEluZGV4OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICB0b3RhbEZpbGVzOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH1cblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHRvdGFsRmlsZXM6IDEsXG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX29iamVjdFVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwocHJvcHMuZmlsZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9vYmplY3RVcmwpIFVSTC5yZXZva2VPYmplY3RVUkwodGhpcy5fb2JqZWN0VXJsKTtcbiAgICB9XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBfb25VcGxvYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgIH1cblxuICAgIF9vblVwbG9hZEFsbENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG5cbiAgICAgICAgbGV0IHRpdGxlO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy50b3RhbEZpbGVzID4gMSAmJiB0aGlzLnByb3BzLmN1cnJlbnRJbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFxuICAgICAgICAgICAgICAgIFwiVXBsb2FkIGZpbGVzICglKGN1cnJlbnQpcyBvZiAlKHRvdGFsKXMpXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiB0aGlzLnByb3BzLmN1cnJlbnRJbmRleCArIDEsXG4gICAgICAgICAgICAgICAgICAgIHRvdGFsOiB0aGlzLnByb3BzLnRvdGFsRmlsZXMsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aXRsZSA9IF90KCdVcGxvYWQgZmlsZXMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwcmV2aWV3O1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5maWxlLnR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykpIHtcbiAgICAgICAgICAgIHByZXZpZXcgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1VwbG9hZENvbmZpcm1EaWFsb2dfcHJldmlld091dGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9VcGxvYWRDb25maXJtRGlhbG9nX3ByZXZpZXdJbm5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2PjxpbWcgY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ19pbWFnZVByZXZpZXdcIiBzcmM9e3RoaXMuX29iamVjdFVybH0gLz48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj57dGhpcy5wcm9wcy5maWxlLm5hbWV9ICh7ZmlsZXNpemUodGhpcy5wcm9wcy5maWxlLnNpemUpfSk8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByZXZpZXcgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibXhfVXBsb2FkQ29uZmlybURpYWxvZ19maWxlSWNvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ZlYXRoZXItY3VzdG9taXNlZC9maWxlcy5zdmdcIil9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmZpbGUubmFtZX0gKHtmaWxlc2l6ZSh0aGlzLnByb3BzLmZpbGUuc2l6ZSl9KVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHVwbG9hZEFsbEJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY3VycmVudEluZGV4ICsgMSA8IHRoaXMucHJvcHMudG90YWxGaWxlcykge1xuICAgICAgICAgICAgdXBsb2FkQWxsQnV0dG9uID0gPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vblVwbG9hZEFsbENsaWNrfT5cbiAgICAgICAgICAgICAgICB7X3QoXCJVcGxvYWQgYWxsXCIpfVxuICAgICAgICAgICAgPC9idXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT0nbXhfVXBsb2FkQ29uZmlybURpYWxvZydcbiAgICAgICAgICAgICAgICBmaXhlZFdpZHRoPXtmYWxzZX1cbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgaWQ9J214X0RpYWxvZ19jb250ZW50Jz5cbiAgICAgICAgICAgICAgICAgICAge3ByZXZpZXd9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8RGlhbG9nQnV0dG9ucyBwcmltYXJ5QnV0dG9uPXtfdCgnVXBsb2FkJyl9XG4gICAgICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblVwbG9hZENsaWNrfVxuICAgICAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHt1cGxvYWRBbGxCdXR0b259XG4gICAgICAgICAgICAgICAgPC9EaWFsb2dCdXR0b25zPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==