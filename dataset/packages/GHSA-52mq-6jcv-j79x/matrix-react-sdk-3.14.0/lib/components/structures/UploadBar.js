"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ContentMessages = _interopRequireDefault(require("../../ContentMessages"));

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _filesize = _interopRequireDefault(require("filesize"));

var _languageHandler = require("../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class UploadBar extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'upload_progress':
        case 'upload_finished':
        case 'upload_canceled':
        case 'upload_failed':
          if (this.mounted) this.forceUpdate();
          break;
      }
    });
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;

    _dispatcher.default.unregister(this.dispatcherRef);
  }

  render() {
    const uploads = _ContentMessages.default.sharedInstance().getCurrentUploads(); // for testing UI... - also fix up the ContentMessages.getCurrentUploads().length
    // check in RoomView
    //
    // uploads = [{
    //     roomId: this.props.room.roomId,
    //     loaded: 123493,
    //     total: 347534,
    //     fileName: "testing_fooble.jpg",
    // }];


    if (uploads.length == 0) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    let upload;

    for (let i = 0; i < uploads.length; ++i) {
      if (uploads[i].roomId == this.props.room.roomId) {
        upload = uploads[i];
        break;
      }
    }

    if (!upload) {
      return /*#__PURE__*/_react.default.createElement("div", null);
    }

    const innerProgressStyle = {
      width: upload.loaded / (upload.total || 1) * 100 + '%'
    };
    let uploadedSize = (0, _filesize.default)(upload.loaded);
    const totalSize = (0, _filesize.default)(upload.total);

    if (uploadedSize.replace(/^.* /, '') === totalSize.replace(/^.* /, '')) {
      uploadedSize = uploadedSize.replace(/ .*/, '');
    } // MUST use var name 'count' for pluralization to kick in


    const uploadText = (0, _languageHandler._t)("Uploading %(filename)s and %(count)s others", {
      filename: upload.fileName,
      count: uploads.length - 1
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadBar"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadBar_uploadProgressOuter"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadBar_uploadProgressInner",
      style: innerProgressStyle
    })), /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_UploadBar_uploadIcon mx_filterFlipColor",
      src: require("../../../res/img/fileicon.png"),
      width: "17",
      height: "22"
    }), /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_UploadBar_uploadCancel mx_filterFlipColor",
      src: require("../../../res/img/cancel.svg"),
      width: "18",
      height: "18",
      onClick: function () {
        _ContentMessages.default.sharedInstance().cancelUpload(upload.promise);
      }
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadBar_uploadBytes"
    }, uploadedSize, " / ", totalSize), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_UploadBar_uploadFilename"
    }, uploadText));
  }

}

exports.default = UploadBar;
(0, _defineProperty2.default)(UploadBar, "propTypes", {
  room: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVXBsb2FkQmFyLmpzIl0sIm5hbWVzIjpbIlVwbG9hZEJhciIsIlJlYWN0IiwiQ29tcG9uZW50IiwicGF5bG9hZCIsImFjdGlvbiIsIm1vdW50ZWQiLCJmb3JjZVVwZGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJyZW5kZXIiLCJ1cGxvYWRzIiwiQ29udGVudE1lc3NhZ2VzIiwic2hhcmVkSW5zdGFuY2UiLCJnZXRDdXJyZW50VXBsb2FkcyIsImxlbmd0aCIsInVwbG9hZCIsImkiLCJyb29tSWQiLCJwcm9wcyIsInJvb20iLCJpbm5lclByb2dyZXNzU3R5bGUiLCJ3aWR0aCIsImxvYWRlZCIsInRvdGFsIiwidXBsb2FkZWRTaXplIiwidG90YWxTaXplIiwicmVwbGFjZSIsInVwbG9hZFRleHQiLCJmaWxlbmFtZSIsImZpbGVOYW1lIiwiY291bnQiLCJyZXF1aXJlIiwiY2FuY2VsVXBsb2FkIiwicHJvbWlzZSIsIlByb3BUeXBlcyIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsU0FBTixTQUF3QkMsZUFBTUMsU0FBOUIsQ0FBd0M7QUFBQTtBQUFBO0FBQUEsb0RBZXhDQyxPQUFPLElBQUk7QUFDbEIsY0FBUUEsT0FBTyxDQUFDQyxNQUFoQjtBQUNJLGFBQUssaUJBQUw7QUFDQSxhQUFLLGlCQUFMO0FBQ0EsYUFBSyxpQkFBTDtBQUNBLGFBQUssZUFBTDtBQUNJLGNBQUksS0FBS0MsT0FBVCxFQUFrQixLQUFL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QUFNLENBQUNrQixPQUFyRDtBQUFnRTtBQUQxRixNQUxKLGVBUUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ01ULFlBRE4sU0FDeUJDLFNBRHpCLENBUkosZUFXSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FBK0NFLFVBQS9DLENBWEosQ0FESjtBQWVIOztBQW5Ga0Q7Ozs4QkFBbENoQyxTLGVBQ0U7QUFDZndCLEVBQUFBLElBQUksRUFBRWUsbUJBQVVDO0FBREQsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBDb250ZW50TWVzc2FnZXMgZnJvbSAnLi4vLi4vQ29udGVudE1lc3NhZ2VzJztcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IGZpbGVzaXplIGZyb20gXCJmaWxlc2l6ZVwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVcGxvYWRCYXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMubW91bnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgIH1cblxuICAgIG9uQWN0aW9uID0gcGF5bG9hZCA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3VwbG9hZF9wcm9ncmVzcyc6XG4gICAgICAgICAgICBjYXNlICd1cGxvYWRfZmluaXNoZWQnOlxuICAgICAgICAgICAgY2FzZSAndXBsb2FkX2NhbmNlbGVkJzpcbiAgICAgICAgICAgIGNhc2UgJ3VwbG9hZF9mYWlsZWQnOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1vdW50ZWQpIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHVwbG9hZHMgPSBDb250ZW50TWVzc2FnZXMuc2hhcmVkSW5zdGFuY2UoKS5nZXRDdXJyZW50VXBsb2FkcygpO1xuXG4gICAgICAgIC8vIGZvciB0ZXN0aW5nIFVJLi4uIC0gYWxzbyBmaXggdXAgdGhlIENvbnRlbnRNZXNzYWdlcy5nZXRDdXJyZW50VXBsb2FkcygpLmxlbmd0aFxuICAgICAgICAvLyBjaGVjayBpbiBSb29tVmlld1xuICAgICAgICAvL1xuICAgICAgICAvLyB1cGxvYWRzID0gW3tcbiAgICAgICAgLy8gICAgIHJvb21JZDogdGhpcy5wcm9wcy5yb29tLnJvb21JZCxcbiAgICAgICAgLy8gICAgIGxvYWRlZDogMTIzNDkzLFxuICAgICAgICAvLyAgICAgdG90YWw6IDM0NzUzNCxcbiAgICAgICAgLy8gICAgIGZpbGVOYW1lOiBcInRlc3RpbmdfZm9vYmxlLmpwZ1wiLFxuICAgICAgICAvLyB9XTtcblxuICAgICAgICBpZiAodXBsb2Fkcy5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBsb2FkO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVwbG9hZHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGlmICh1cGxvYWRzW2ldLnJvb21JZCA9PSB0aGlzLnByb3BzLnJvb20ucm9vbUlkKSB7XG4gICAgICAgICAgICAgICAgdXBsb2FkID0gdXBsb2Fkc1tpXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXVwbG9hZCkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXYgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbm5lclByb2dyZXNzU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogKCh1cGxvYWQubG9hZGVkIC8gKHVwbG9hZC50b3RhbCB8fCAxKSkgKiAxMDApICsgJyUnLFxuICAgICAgICB9O1xuICAgICAgICBsZXQgdXBsb2FkZWRTaXplID0gZmlsZXNpemUodXBsb2FkLmxvYWRlZCk7XG4gICAgICAgIGNvbnN0IHRvdGFsU2l6ZSA9IGZpbGVzaXplKHVwbG9hZC50b3RhbCk7XG4gICAgICAgIGlmICh1cGxvYWRlZFNpemUucmVwbGFjZSgvXi4qIC8sICcnKSA9PT0gdG90YWxTaXplLnJlcGxhY2UoL14uKiAvLCAnJykpIHtcbiAgICAgICAgICAgIHVwbG9hZGVkU2l6ZSA9IHVwbG9hZGVkU2l6ZS5yZXBsYWNlKC8gLiovLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBNVVNUIHVzZSB2YXIgbmFtZSAnY291bnQnIGZvciBwbHVyYWxpemF0aW9uIHRvIGtpY2sgaW5cbiAgICAgICAgY29uc3QgdXBsb2FkVGV4dCA9IF90KFxuICAgICAgICAgICAgXCJVcGxvYWRpbmcgJShmaWxlbmFtZSlzIGFuZCAlKGNvdW50KXMgb3RoZXJzXCIsIHtmaWxlbmFtZTogdXBsb2FkLmZpbGVOYW1lLCBjb3VudDogKHVwbG9hZHMubGVuZ3RoIC0gMSl9LFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VwbG9hZEJhclwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXBsb2FkQmFyX3VwbG9hZFByb2dyZXNzT3V0ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9VcGxvYWRCYXJfdXBsb2FkUHJvZ3Jlc3NJbm5lclwiIHN0eWxlPXtpbm5lclByb2dyZXNzU3R5bGV9PjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxpbWcgY2xhc3NOYW1lPVwibXhfVXBsb2FkQmFyX3VwbG9hZEljb24gbXhfZmlsdGVyRmxpcENvbG9yXCIgc3JjPXtyZXF1aXJlKFwiLi4vLi4vLi4vcmVzL2ltZy9maWxlaWNvbi5wbmdcIil9IHdpZHRoPVwiMTdcIiBoZWlnaHQ9XCIyMlwiIC8+XG4gICAgICAgICAgICAgICAgPGltZyBjbGFzc05hbWU9XCJteF9VcGxvYWRCYXJfdXBsb2FkQ2FuY2VsIG14X2ZpbHRlckZsaXBDb2xvclwiIHNyYz17cmVxdWlyZShcIi4uLy4uLy4uL3Jlcy9pbWcvY2FuY2VsLnN2Z1wiKX0gd2lkdGg9XCIxOFwiIGhlaWdodD1cIjE4XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17ZnVuY3Rpb24oKSB7IENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLmNhbmNlbFVwbG9hZCh1cGxvYWQucHJvbWlzZSk7IH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1VwbG9hZEJhcl91cGxvYWRCeXRlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7IHVwbG9hZGVkU2l6ZSB9IC8geyB0b3RhbFNpemUgfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXBsb2FkQmFyX3VwbG9hZEZpbGVuYW1lXCI+eyB1cGxvYWRUZXh0IH08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==