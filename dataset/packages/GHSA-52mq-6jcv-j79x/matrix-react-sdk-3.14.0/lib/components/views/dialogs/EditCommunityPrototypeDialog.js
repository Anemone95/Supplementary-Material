"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _FlairStore = _interopRequireDefault(require("../../../stores/FlairStore"));

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
// XXX: This is a lot of duplication from the create dialog, just in a different shape
class EditCommunityPrototypeDialog extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "avatarUploadRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onNameChange", (ev
    /*: ChangeEvent<HTMLInputElement>*/
    ) => {
      this.setState({
        name: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onSubmit", async ev => {
      ev.preventDefault();
      ev.stopPropagation();
      if (this.state.busy) return; // We'll create the community now to see if it's taken, leaving it active in
      // the background for the user to look at while they invite people.

      this.setState({
        busy: true
      });

      try {
        let avatarUrl = this.state.currentAvatarUrl || ""; // must be a string for synapse to accept it

        if (this.state.avatarFile) {
          avatarUrl = await _MatrixClientPeg.MatrixClientPeg.get().uploadContent(this.state.avatarFile);
        }

        await _MatrixClientPeg.MatrixClientPeg.get().setGroupProfile(this.props.communityId, {
          name: this.state.name,
          avatar_url: avatarUrl
        }); // ask the flair store to update the profile too

        await _FlairStore.default.refreshGroupProfile(_MatrixClientPeg.MatrixClientPeg.get(), this.props.communityId); // we did it, so close the dialog

        this.props.onFinished(true);
      } catch (e) {
        console.error(e);
        this.setState({
          busy: false,
          error: (0, _languageHandler._t)("There was an error updating your community. The server is unable to process your request.")
        });
      }
    });
    (0, _defineProperty2.default)(this, "onAvatarChanged", (e
    /*: ChangeEvent<HTMLInputElement>*/
    ) => {
      if (!e.target.files || !e.target.files.length) {
        this.setState({
          avatarFile: null
        });
      } else {
        this.setState({
          busy: true
        });
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (ev
        /*: ProgressEvent<FileReader>*/
        ) => {
          this.setState({
            avatarFile: file,
            busy: false,
            avatarPreview: ev.target.result
          });
        };

        reader.readAsDataURL(file);
      }
    });
    (0, _defineProperty2.default)(this, "onChangeAvatar", () => {
      if (this.avatarUploadRef.current) this.avatarUploadRef.current.click();
    });

    const profile = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getCommunityProfile(props.communityId);

    this.state = {
      name: profile?.name || "",
      error: null,
      busy: false,
      avatarFile: null,
      avatarPreview: null,
      currentAvatarUrl: profile?.avatarUrl
    };
  }

  render() {
    let preview = /*#__PURE__*/_react.default.createElement("img", {
      src: this.state.avatarPreview,
      className: "mx_EditCommunityPrototypeDialog_avatar"
    });

    if (!this.state.avatarPreview) {
      if (this.state.currentAvatarUrl) {
        const url = _MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(this.state.currentAvatarUrl);

        preview = /*#__PURE__*/_react.default.createElement("img", {
          src: url,
          className: "mx_EditCommunityPrototypeDialog_avatar"
        });
      } else {
        preview = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_EditCommunityPrototypeDialog_placeholderAvatar"
        });
      }
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_EditCommunityPrototypeDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Update community")
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditCommunityPrototypeDialog_rowName"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      value: this.state.name,
      onChange: this.onNameChange,
      placeholder: (0, _languageHandler._t)("Enter name"),
      label: (0, _languageHandler._t)("Enter name")
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditCommunityPrototypeDialog_rowAvatar"
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "file",
      style: {
        display: "none"
      },
      ref: this.avatarUploadRef,
      accept: "image/*",
      onChange: this.onAvatarChanged
    }), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      onClick: this.onChangeAvatar,
      className: "mx_EditCommunityPrototypeDialog_avatarContainer"
    }, preview), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditCommunityPrototypeDialog_tip"
    }, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Add image (optional)")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("An image will help people identify your community.")))), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.onSubmit,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Save")))));
  }

}

exports.default = EditCommunityPrototypeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZy50c3giXSwibmFtZXMiOlsiRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJldiIsInNldFN0YXRlIiwibmFtZSIsInRhcmdldCIsInZhbHVlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdGF0ZSIsImJ1c3kiLCJhdmF0YXJVcmwiLCJjdXJyZW50QXZhdGFyVXJsIiwiYXZhdGFyRmlsZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwbG9hZENvbnRlbnQiLCJzZXRHcm91cFByb2ZpbGUiLCJjb21tdW5pdHlJZCIsImF2YXRhcl91cmwiLCJGbGFpclN0b3JlIiwicmVmcmVzaEdyb3VwUHJvZmlsZSIsIm9uRmluaXNoZWQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiZmlsZXMiLCJsZW5ndGgiLCJmaWxlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImF2YXRhclByZXZpZXciLCJyZXN1bHQiLCJyZWFkQXNEYXRhVVJMIiwiYXZhdGFyVXBsb2FkUmVmIiwiY3VycmVudCIsImNsaWNrIiwicHJvZmlsZSIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRDb21tdW5pdHlQcm9maWxlIiwicmVuZGVyIiwicHJldmlldyIsInVybCIsIm14Y1VybFRvSHR0cCIsIm9uU3VibWl0Iiwib25OYW1lQ2hhbmdlIiwiZGlzcGxheSIsIm9uQXZhdGFyQ2hhbmdlZCIsIm9uQ2hhbmdlQXZhdGFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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aUMsTUFBQSxPQUFPLEVBQUUsS0FBS0csUUFBL0M7QUFBeUQsTUFBQSxRQUFRLEVBQUUsS0FBS3JDLEtBQUwsQ0FBV0M7QUFBOUUsT0FDSyx5QkFBRyxNQUFILENBREwsQ0ExQkosQ0FESixDQUxKLENBREo7QUF3Q0g7O0FBN0h5RiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDaGFuZ2VFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQgRmxhaXJTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0ZsYWlyU3RvcmVcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgY29tbXVuaXR5SWQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVycm9yOiBzdHJpbmc7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBjdXJyZW50QXZhdGFyVXJsOiBzdHJpbmc7XG4gICAgYXZhdGFyRmlsZTogRmlsZTtcbiAgICBhdmF0YXJQcmV2aWV3OiBzdHJpbmc7XG59XG5cbi8vIFhYWDogVGhpcyBpcyBhIGxvdCBvZiBkdXBsaWNhdGlvbiBmcm9tIHRoZSBjcmVhdGUgZGlhbG9nLCBqdXN0IGluIGEgZGlmZmVyZW50IHNoYXBlXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgYXZhdGFyVXBsb2FkUmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTElucHV0RWxlbWVudD4gPSBSZWFjdC5jcmVhdGVSZWYoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSBDb21tdW5pdHlQcm90b3R5cGVTdG9yZS5pbnN0YW5jZS5nZXRDb21tdW5pdHlQcm9maWxlKHByb3BzLmNvbW11bml0eUlkKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbmFtZTogcHJvZmlsZT8ubmFtZSB8fCBcIlwiLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGF2YXRhckZpbGU6IG51bGwsXG4gICAgICAgICAgICBhdmF0YXJQcmV2aWV3OiBudWxsLFxuICAgICAgICAgICAgY3VycmVudEF2YXRhclVybDogcHJvZmlsZT8uYXZhdGFyVXJsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25OYW1lQ2hhbmdlID0gKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiBldi50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdCA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSByZXR1cm47XG5cbiAgICAgICAgLy8gV2UnbGwgY3JlYXRlIHRoZSBjb21tdW5pdHkgbm93IHRvIHNlZSBpZiBpdCdzIHRha2VuLCBsZWF2aW5nIGl0IGFjdGl2ZSBpblxuICAgICAgICAvLyB0aGUgYmFja2dyb3VuZCBmb3IgdGhlIHVzZXIgdG8gbG9vayBhdCB3aGlsZSB0aGV5IGludml0ZSBwZW9wbGUuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBhdmF0YXJVcmwgPSB0aGlzLnN0YXRlLmN1cnJlbnRBdmF0YXJVcmwgfHwgXCJcIjsgLy8gbXVzdCBiZSBhIHN0cmluZyBmb3Igc3luYXBzZSB0byBhY2NlcHQgaXRcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmF2YXRhckZpbGUpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmwgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBsb2FkQ29udGVudCh0aGlzLnN0YXRlLmF2YXRhckZpbGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0R3JvdXBQcm9maWxlKHRoaXMucHJvcHMuY29tbXVuaXR5SWQsIHtcbiAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm5hbWUsXG4gICAgICAgICAgICAgICAgYXZhdGFyX3VybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIGFzayB0aGUgZmxhaXIgc3RvcmUgdG8gdXBkYXRlIHRoZSBwcm9maWxlIHRvb1xuICAgICAgICAgICAgYXdhaXQgRmxhaXJTdG9yZS5yZWZyZXNoR3JvdXBQcm9maWxlKE1hdHJpeENsaWVudFBlZy5nZXQoKSwgdGhpcy5wcm9wcy5jb21tdW5pdHlJZCk7XG5cbiAgICAgICAgICAgIC8vIHdlIGRpZCBpdCwgc28gY2xvc2UgdGhlIGRpYWxvZ1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZXJyb3I6IF90KFwiVGhlcmUgd2FzIGFuIGVycm9yIHVwZGF0aW5nIHlvdXIgY29tbXVuaXR5LiBUaGUgc2VydmVyIGlzIHVuYWJsZSB0byBwcm9jZXNzIHlvdXIgcmVxdWVzdC5cIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQXZhdGFyQ2hhbmdlZCA9IChlOiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICBpZiAoIWUudGFyZ2V0LmZpbGVzIHx8ICFlLnRhcmdldC5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2F2YXRhckZpbGU6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gKGV2OiBQcm9ncmVzc0V2ZW50PEZpbGVSZWFkZXI+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YXZhdGFyRmlsZTogZmlsZSwgYnVzeTogZmFsc2UsIGF2YXRhclByZXZpZXc6IGV2LnRhcmdldC5yZXN1bHQgYXMgc3RyaW5nfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZUF2YXRhciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQpIHRoaXMuYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHByZXZpZXcgPSA8aW1nIHNyYz17dGhpcy5zdGF0ZS5hdmF0YXJQcmV2aWV3fSBjbGFzc05hbWU9XCJteF9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX2F2YXRhclwiIC8+O1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuYXZhdGFyUHJldmlldykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3VycmVudEF2YXRhclVybCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5teGNVcmxUb0h0dHAodGhpcy5zdGF0ZS5jdXJyZW50QXZhdGFyVXJsKTtcbiAgICAgICAgICAgICAgICBwcmV2aWV3ID0gPGltZyBzcmM9e3VybH0gY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19hdmF0YXJcIiAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJldmlldyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19wbGFjZWhvbGRlckF2YXRhclwiIC8+XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiVXBkYXRlIGNvbW11bml0eVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19yb3dOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfcm93QXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCIgc3R5bGU9e3tkaXNwbGF5OiBcIm5vbmVcIn19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5hdmF0YXJVcGxvYWRSZWZ9IGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkF2YXRhckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2hhbmdlQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX2F2YXRhckNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPntwcmV2aWV3fTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfdGlwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxiPntfdChcIkFkZCBpbWFnZSAob3B0aW9uYWwpXCIpfTwvYj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJBbiBpbWFnZSB3aWxsIGhlbHAgcGVvcGxlIGlkZW50aWZ5IHlvdXIgY29tbXVuaXR5LlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMub25TdWJtaXR9IGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNhdmVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=