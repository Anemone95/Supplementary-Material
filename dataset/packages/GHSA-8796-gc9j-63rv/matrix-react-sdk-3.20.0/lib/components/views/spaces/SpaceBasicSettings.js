"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../../languageHandler");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
const SpaceBasicSettings = ({
  avatarUrl,
  avatarDisabled = false,
  setAvatar,
  name = "",
  nameDisabled = false,
  setName,
  topic = "",
  topicDisabled = false,
  setTopic
}
/*: IProps*/
) => {
  const avatarUploadRef = (0, _react.useRef)();
  const [avatar, setAvatarDataUrl] = (0, _react.useState)(avatarUrl); // avatar data url cache

  let avatarSection;

  if (avatarDisabled) {
    if (avatar) {
      avatarSection = /*#__PURE__*/_react.default.createElement("img", {
        className: "mx_SpaceBasicSettings_avatar",
        src: avatar,
        alt: ""
      });
    } else {
      avatarSection = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceBasicSettings_avatar"
      });
    }
  } else {
    if (avatar) {
      avatarSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_SpaceBasicSettings_avatar",
        onClick: () => avatarUploadRef.current?.click(),
        element: "img",
        src: avatar,
        alt: ""
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: () => {
          avatarUploadRef.current.value = "";
          setAvatarDataUrl(undefined);
          setAvatar(undefined);
        },
        kind: "link",
        className: "mx_SpaceBasicSettings_avatar_remove"
      }, (0, _languageHandler._t)("Delete")));
    } else {
      avatarSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_SpaceBasicSettings_avatar",
        onClick: () => avatarUploadRef.current?.click()
      }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: () => avatarUploadRef.current?.click(),
        kind: "link"
      }, (0, _languageHandler._t)("Upload")));
    }
  }

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceBasicSettings"
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_SpaceBasicSettings_avatarContainer"
  }, avatarSection, /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    ref: avatarUploadRef,
    onChange: e => {
      if (!e.target.files?.length) return;
      const file = e.target.files[0];
      setAvatar(file);
      const reader = new FileReader();

      reader.onload = ev => {
        setAvatarDataUrl(ev.target.result);
      };

      reader.readAsDataURL(file);
    },
    accept: "image/*"
  })), /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceName",
    label: (0, _languageHandler._t)("Name"),
    autoFocus: true,
    value: name,
    onChange: ev => setName(ev.target.value),
    disabled: nameDisabled
  }), /*#__PURE__*/_react.default.createElement(_Field.default, {
    name: "spaceTopic",
    element: "textarea",
    label: (0, _languageHandler._t)("Description"),
    value: topic,
    onChange: ev => setTopic(ev.target.value),
    rows: 3,
    disabled: topicDisabled
  }));
};

var _default = SpaceBasicSettings;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NwYWNlcy9TcGFjZUJhc2ljU2V0dGluZ3MudHN4Il0sIm5hbWVzIjpbIlNwYWNlQmFzaWNTZXR0aW5ncyIsImF2YXRhclVybCIsImF2YXRhckRpc2FibGVkIiwic2V0QXZhdGFyIiwibmFtZSIsIm5hbWVEaXNhYmxlZCIsInNldE5hbWUiLCJ0b3BpYyIsInRvcGljRGlzYWJsZWQiLCJzZXRUb3BpYyIsImF2YXRhclVwbG9hZFJlZiIsImF2YXRhciIsInNldEF2YXRhckRhdGFVcmwiLCJhdmF0YXJTZWN0aW9uIiwiY3VycmVudCIsImNsaWNrIiwidmFsdWUiLCJ1bmRlZmluZWQiLCJlIiwidGFyZ2V0IiwiZmlsZXMiLCJsZW5ndGgiLCJmaWxlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImV2IiwicmVzdWx0IiwicmVhZEFzRGF0YVVSTCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CQSxNQUFNQSxrQkFBa0IsR0FBRyxDQUFDO0FBQ3hCQyxFQUFBQSxTQUR3QjtBQUV4QkMsRUFBQUEsY0FBYyxHQUFHLEtBRk87QUFHeEJDLEVBQUFBLFNBSHdCO0FBSXhCQyxFQUFBQSxJQUFJLEdBQUcsRUFKaUI7QUFLeEJDLEVBQUFBLFlBQVksR0FBRyxLQUxTO0FBTXhCQyxFQUFBQSxPQU53QjtBQU94QkMsRUFBQUEsS0FBSyxHQUFHLEVBUGdCO0FBUXhCQyxFQUFBQSxhQUFhLEdBQUcsS0FSUTtBQVN4QkMsRUFBQUE7QUFUd0I7QUFBRDtBQUFBLEtBVWI7QUFDVixRQUFNQyxlQUFlLEdBQUcsb0JBQXhCO0FBQ0EsUUFBTSxDQUFDQyxNQUFELEVBQVNDLGdCQUFULElBQTZCLHFCQUFTWCxTQUFULENBQW5DLENBRlUsQ0FFOEM7O0FBRXhELE1BQUlZLGFBQUo7O0FBQ0EsTUFBSVgsY0FBSixFQUFvQjtBQUNoQixRQUFJUyxNQUFKLEVBQVk7QUFDUkUsTUFBQUEsYUFBYSxnQkFBRztBQUFLLFFBQUEsU0FBUyxFQUFDLDhCQUFmO0FBQThDLFFBQUEsR0FBRyxFQUFFRixNQUFuRDtBQUEyRCxRQUFBLEdBQUcsRUFBQztBQUEvRCxRQUFoQjtBQUNILEtBRkQsTUFFTztBQUNIRSxNQUFBQSxhQUFhLGdCQUFHO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixRQUFoQjtBQUNIO0FBQ0osR0FORCxNQU1PO0FBQ0gsUUFBSUYsTUFBSixFQUFZO0FBQ1JFLE1BQUFBLGFBQWEsZ0JBQUcsNkJBQUMsY0FBRCxDQUFPLFFBQVAscUJBQ1osNkJBQUMseUJBQUQ7QUFDSSxRQUFBLFNBQVMsRUFBQyw4QkFEZDtBQUVJLFFBQUEsT0FBTyxFQUFFLE1BQU1ILGVBQWUsQ0FBQ0ksT0FBaEIsRUFBeUJDLEtBQXpCLEVBRm5CO0FBR0ksUUFBQSxPQUFPLEVBQUMsS0FIWjtBQUlJLFFBQUEsR0FBRyxFQUFFSixNQUpUO0FBS0ksUUFBQSxHQUFHLEVBQUM7QUFMUixRQURZLGVBUVosNkJBQUMseUJBQUQ7QUFBa0IsUUFBQSxPQUFPLEVBQUUsTUFBTTtBQUM3QkQsVUFBQUEsZUFBZSxDQUFDSSxPQUFoQixDQUF3QkUsS0FBeEIsR0FBZ0MsRUFBaEM7QUFDQUosVUFBQUEsZ0JBQWdCLENBQUNLLFNBQUQsQ0FBaEI7QUFDQWQsVUFBQUEsU0FBUyxDQUFDYyxTQUFELENBQVQ7QUFDSCxTQUpEO0FBSUcsUUFBQSxJQUFJLEVBQUMsTUFKUjtBQUllLFFBQUEsU0FBUyxFQUFDO0FBSnpCLFNBS00seUJBQUcsUUFBSCxDQUxOLENBUlksQ0FBaEI7QUFnQkgsS0FqQkQsTUFpQk87QUFDSEosTUFBQUEsYUFBYSxnQkFBRyw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFDWjtBQUFLLFFBQUEsU0FBUyxFQUFDLDhCQUFmO0FBQThDLFFBQUEsT0FBTyxFQUFFLE1BQU1ILGVBQWUsQ0FBQ0ksT0FBaEIsRUFBeUJDLEtBQXpCO0FBQTdELFFBRFksZUFFWiw2QkFBQyx5QkFBRDtBQUFrQixRQUFBLE9BQU8sRUFBRSxNQUFNTCxlQUFlLENBQUNJLE9BQWhCLEVBQXlCQyxLQUF6QixFQUFqQztBQUFtRSxRQUFBLElBQUksRUFBQztBQUF4RSxTQUNNLHlCQUFHLFFBQUgsQ0FETixDQUZZLENBQWhCO0FBTUg7QUFDSjs7QUFFRCxzQkFBTztBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0g7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLEtBQ01GLGFBRE4sZUFFSTtBQUFPLElBQUEsSUFBSSxFQUFDLE1BQVo7QUFBbUIsSUFBQSxHQUFHLEVBQUVILGVBQXhCO0FBQXlDLElBQUEsUUFBUSxFQUFHUSxDQUFELElBQU87QUFDdEQsVUFBSSxDQUFDQSxDQUFDLENBQUNDLE1BQUYsQ0FBU0MsS0FBVCxFQUFnQkMsTUFBckIsRUFBNkI7QUFDN0IsWUFBTUMsSUFBSSxHQUFHSixDQUFDLENBQUNDLE1BQUYsQ0FBU0MsS0FBVCxDQUFlLENBQWYsQ0FBYjtBQUNBakIsTUFBQUEsU0FBUyxDQUFDbUIsSUFBRCxDQUFUO0FBQ0EsWUFBTUMsTUFBTSxHQUFHLElBQUlDLFVBQUosRUFBZjs7QUFDQUQsTUFBQUEsTUFBTSxDQUFDRSxNQUFQLEdBQWlCQyxFQUFELElBQVE7QUFDcEJkLFFBQUFBLGdCQUFnQixDQUFDYyxFQUFFLENBQUNQLE1BQUgsQ0FBVVEsTUFBWCxDQUFoQjtBQUNILE9BRkQ7O0FBR0FKLE1BQUFBLE1BQU0sQ0FBQ0ssYUFBUCxDQUFxQk4sSUFBckI7QUFDSCxLQVREO0FBU0csSUFBQSxNQUFNLEVBQUM7QUFUVixJQUZKLENBREcsZUFlSCw2QkFBQyxjQUFEO0FBQ0ksSUFBQSxJQUFJLEVBQUMsV0FEVDtBQUVJLElBQUEsS0FBSyxFQUFFLHlCQUFHLE1BQUgsQ0FGWDtBQUdJLElBQUEsU0FBUyxFQUFFLElBSGY7QUFJSSxJQUFBLEtBQUssRUFBRWxCLElBSlg7QUFLSSxJQUFBLFFBQVEsRUFBRXNCLEVBQUUsSUFBSXBCLE9BQU8sQ0FBQ29CLEVBQUUsQ0FBQ1AsTUFBSCxDQUFVSCxLQUFYLENBTDNCO0FBTUksSUFBQSxRQUFRLEVBQUVYO0FBTmQsSUFmRyxlQXdCSCw2QkFBQyxjQUFEO0FBQ0ksSUFBQSxJQUFJLEVBQUMsWUFEVDtBQUVJLElBQUEsT0FBTyxFQUFDLFVBRlo7QUFHSSxJQUFBLEtBQUssRUFBRSx5QkFBRyxhQUFILENBSFg7QUFJSSxJQUFBLEtBQUssRUFBRUUsS0FKWDtBQUtJLElBQUEsUUFBUSxFQUFFbUIsRUFBRSxJQUFJakIsUUFBUSxDQUFDaUIsRUFBRSxDQUFDUCxNQUFILENBQVVILEtBQVgsQ0FMNUI7QUFNSSxJQUFBLElBQUksRUFBRSxDQU5WO0FBT0ksSUFBQSxRQUFRLEVBQUVSO0FBUGQsSUF4QkcsQ0FBUDtBQWtDSCxDQW5GRDs7ZUFxRmVSLGtCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7dXNlUmVmLCB1c2VTdGF0ZX0gZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGF2YXRhclVybD86IHN0cmluZztcbiAgICBhdmF0YXJEaXNhYmxlZD86IGJvb2xlYW47XG4gICAgbmFtZT86IHN0cmluZyxcbiAgICBuYW1lRGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIHRvcGljPzogc3RyaW5nO1xuICAgIHRvcGljRGlzYWJsZWQ/OiBib29sZWFuO1xuICAgIHNldEF2YXRhcihhdmF0YXI6IEZpbGUpOiB2b2lkO1xuICAgIHNldE5hbWUobmFtZTogc3RyaW5nKTogdm9pZDtcbiAgICBzZXRUb3BpYyh0b3BpYzogc3RyaW5nKTogdm9pZDtcbn1cblxuY29uc3QgU3BhY2VCYXNpY1NldHRpbmdzID0gKHtcbiAgICBhdmF0YXJVcmwsXG4gICAgYXZhdGFyRGlzYWJsZWQgPSBmYWxzZSxcbiAgICBzZXRBdmF0YXIsXG4gICAgbmFtZSA9IFwiXCIsXG4gICAgbmFtZURpc2FibGVkID0gZmFsc2UsXG4gICAgc2V0TmFtZSxcbiAgICB0b3BpYyA9IFwiXCIsXG4gICAgdG9waWNEaXNhYmxlZCA9IGZhbHNlLFxuICAgIHNldFRvcGljLFxufTogSVByb3BzKSA9PiB7XG4gICAgY29uc3QgYXZhdGFyVXBsb2FkUmVmID0gdXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KCk7XG4gICAgY29uc3QgW2F2YXRhciwgc2V0QXZhdGFyRGF0YVVybF0gPSB1c2VTdGF0ZShhdmF0YXJVcmwpOyAvLyBhdmF0YXIgZGF0YSB1cmwgY2FjaGVcblxuICAgIGxldCBhdmF0YXJTZWN0aW9uO1xuICAgIGlmIChhdmF0YXJEaXNhYmxlZCkge1xuICAgICAgICBpZiAoYXZhdGFyKSB7XG4gICAgICAgICAgICBhdmF0YXJTZWN0aW9uID0gPGltZyBjbGFzc05hbWU9XCJteF9TcGFjZUJhc2ljU2V0dGluZ3NfYXZhdGFyXCIgc3JjPXthdmF0YXJ9IGFsdD1cIlwiIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXZhdGFyU2VjdGlvbiA9IDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhclwiIC8+O1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGF2YXRhcikge1xuICAgICAgICAgICAgYXZhdGFyU2VjdGlvbiA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9TcGFjZUJhc2ljU2V0dGluZ3NfYXZhdGFyXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQ/LmNsaWNrKCl9XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJpbWdcIlxuICAgICAgICAgICAgICAgICAgICBzcmM9e2F2YXRhcn1cbiAgICAgICAgICAgICAgICAgICAgYWx0PVwiXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBzZXRBdmF0YXJEYXRhVXJsKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIHNldEF2YXRhcih1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH19IGtpbmQ9XCJsaW5rXCIgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhcl9yZW1vdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIkRlbGV0ZVwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhdmF0YXJTZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3BhY2VCYXNpY1NldHRpbmdzX2F2YXRhclwiIG9uQ2xpY2s9eygpID0+IGF2YXRhclVwbG9hZFJlZi5jdXJyZW50Py5jbGljaygpfSAvPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9eygpID0+IGF2YXRhclVwbG9hZFJlZi5jdXJyZW50Py5jbGljaygpfSBraW5kPVwibGlua1wiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVXBsb2FkXCIpIH1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlQmFzaWNTZXR0aW5nc1wiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NwYWNlQmFzaWNTZXR0aW5nc19hdmF0YXJDb250YWluZXJcIj5cbiAgICAgICAgICAgIHsgYXZhdGFyU2VjdGlvbiB9XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiByZWY9e2F2YXRhclVwbG9hZFJlZn0gb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFlLnRhcmdldC5maWxlcz8ubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIHNldEF2YXRhcihmaWxlKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZXYpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc2V0QXZhdGFyRGF0YVVybChldi50YXJnZXQucmVzdWx0IGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgICAgIH19IGFjY2VwdD1cImltYWdlLypcIiAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICA8RmllbGRcbiAgICAgICAgICAgIG5hbWU9XCJzcGFjZU5hbWVcIlxuICAgICAgICAgICAgbGFiZWw9e190KFwiTmFtZVwiKX1cbiAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgIHZhbHVlPXtuYW1lfVxuICAgICAgICAgICAgb25DaGFuZ2U9e2V2ID0+IHNldE5hbWUoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIGRpc2FibGVkPXtuYW1lRGlzYWJsZWR9XG4gICAgICAgIC8+XG5cbiAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICBuYW1lPVwic3BhY2VUb3BpY1wiXG4gICAgICAgICAgICBlbGVtZW50PVwidGV4dGFyZWFcIlxuICAgICAgICAgICAgbGFiZWw9e190KFwiRGVzY3JpcHRpb25cIil9XG4gICAgICAgICAgICB2YWx1ZT17dG9waWN9XG4gICAgICAgICAgICBvbkNoYW5nZT17ZXYgPT4gc2V0VG9waWMoZXYudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIHJvd3M9ezN9XG4gICAgICAgICAgICBkaXNhYmxlZD17dG9waWNEaXNhYmxlZH1cbiAgICAgICAgLz5cbiAgICA8L2Rpdj47XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTcGFjZUJhc2ljU2V0dGluZ3M7XG4iXX0=