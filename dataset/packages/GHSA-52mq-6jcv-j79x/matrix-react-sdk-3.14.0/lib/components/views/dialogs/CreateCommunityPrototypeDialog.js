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

var _InfoTooltip = _interopRequireDefault(require("../elements/InfoTooltip"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RoomInvite = require("../../../RoomInvite");

var _GroupStore = _interopRequireDefault(require("../../../stores/GroupStore"));

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
class CreateCommunityPrototypeDialog extends _react.default.PureComponent
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
      const localpart = (ev.target.value || "").toLowerCase().replace(/[^a-z0-9.\-_]/g, '-');
      this.setState({
        name: ev.target.value,
        localpart
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
        let avatarUrl = ''; // must be a string for synapse to accept it

        if (this.state.avatarFile) {
          avatarUrl = await _MatrixClientPeg.MatrixClientPeg.get().uploadContent(this.state.avatarFile);
        }

        const result = await _MatrixClientPeg.MatrixClientPeg.get().createGroup({
          localpart: this.state.localpart,
          profile: {
            name: this.state.name,
            avatar_url: avatarUrl
          }
        }); // Ensure the tag gets selected now that we've created it

        _dispatcher.default.dispatch({
          action: 'deselect_tags'
        }, true);

        _dispatcher.default.dispatch({
          action: 'select_tag',
          tag: result.group_id
        }); // Close our own dialog before moving much further


        this.props.onFinished(true);

        if (result.room_id) {
          // Force the group store to update as it might have missed the general chat
          await _GroupStore.default.refreshGroupRooms(result.group_id);

          _dispatcher.default.dispatch({
            action: 'view_room',
            room_id: result.room_id
          });

          (0, _RoomInvite.showCommunityRoomInviteDialog)(result.room_id, this.state.name);
        } else {
          _dispatcher.default.dispatch({
            action: 'view_group',
            group_id: result.group_id,
            group_is_new: true
          });
        }
      } catch (e) {
        console.error(e);
        this.setState({
          busy: false,
          error: (0, _languageHandler._t)("There was an error creating your community. The name may be taken or the " + "server is unable to process your request.")
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
    this.state = {
      name: "",
      localpart: "",
      error: null,
      busy: false,
      avatarFile: null,
      avatarPreview: null
    };
  }

  render() {
    let communityId = null;

    if (this.state.localpart) {
      communityId = /*#__PURE__*/_react.default.createElement("span", {
        className: "mx_CreateCommunityPrototypeDialog_communityId"
      }, (0, _languageHandler._t)("Community ID: +<localpart />:%(domain)s", {
        domain: _MatrixClientPeg.MatrixClientPeg.getHomeserverName()
      }, {
        localpart: () => /*#__PURE__*/_react.default.createElement("u", null, this.state.localpart)
      }), /*#__PURE__*/_react.default.createElement(_InfoTooltip.default, {
        tooltip: (0, _languageHandler._t)("Use this when referencing your community to others. The community ID " + "cannot be changed.")
      }));
    }

    let helpText = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateCommunityPrototypeDialog_subtext"
    }, (0, _languageHandler._t)("You can change this later if needed."));

    if (this.state.error) {
      const classes = "mx_CreateCommunityPrototypeDialog_subtext mx_CreateCommunityPrototypeDialog_subtext_error";
      helpText = /*#__PURE__*/_react.default.createElement("span", {
        className: classes
      }, this.state.error);
    }

    let preview = /*#__PURE__*/_react.default.createElement("img", {
      src: this.state.avatarPreview,
      className: "mx_CreateCommunityPrototypeDialog_avatar"
    });

    if (!this.state.avatarPreview) {
      preview = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateCommunityPrototypeDialog_placeholderAvatar"
      });
    }

    return /*#__PURE__*/_react.default.createElement(_BaseDialog.default, {
      className: "mx_CreateCommunityPrototypeDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("What's the name of your community or team?")
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateCommunityPrototypeDialog_colName"
    }, /*#__PURE__*/_react.default.createElement(_Field.default, {
      value: this.state.name,
      onChange: this.onNameChange,
      placeholder: (0, _languageHandler._t)("Enter name"),
      label: (0, _languageHandler._t)("Enter name")
    }), helpText, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateCommunityPrototypeDialog_subtext"
    }, "\xA0", communityId), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
      kind: "primary",
      onClick: this.onSubmit,
      disabled: this.state.busy
    }, (0, _languageHandler._t)("Create"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateCommunityPrototypeDialog_colAvatar"
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
      className: "mx_CreateCommunityPrototypeDialog_avatarContainer"
    }, preview), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateCommunityPrototypeDialog_tip"
    }, /*#__PURE__*/_react.default.createElement("b", null, (0, _languageHandler._t)("Add image (optional)")), /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("An image will help people identify your community.")))))));
  }

}

exports.default = CreateCommunityPrototypeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJDcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiZXYiLCJsb2NhbHBhcnQiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsInNldFN0YXRlIiwibmFtZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic3RhdGUiLCJidXN5IiwiYXZhdGFyVXJsIiwiYXZhdGFyRmlsZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwbG9hZENvbnRlbnQiLCJyZXN1bHQiLCJjcmVhdGVHcm91cCIsInByb2ZpbGUiLCJhdmF0YXJfdXJsIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJ0YWciLCJncm91cF9pZCIsIm9uRmluaXNoZWQiLCJyb29tX2lkIiwiR3JvdXBTdG9yZSIsInJlZnJlc2hHcm91cFJvb21zIiwiZ3JvdXBfaXNfbmV3IiwiZSIsImNvbnNvbGUiLCJlcnJvciIsImZpbGVzIiwibGVuZ3RoIiwiZmlsZSIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJhdmF0YXJQcmV2aWV3IiwicmVhZEFzRGF0YVVSTCIsImF2YXRhclVwbG9hZFJlZiIsImN1cnJlbnQiLCJjbGljayIsInJlbmRlciIsImNvbW11bml0eUlkIiwiZG9tYWluIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJoZWxwVGV4dCIsImNsYXNzZXMiLCJwcmV2aWV3Iiwib25TdWJtaXQiLCJvbk5hbWVDaGFuZ2UiLCJkaXNwbGF5Iiwib25BdmF0YXJDaGFuZ2VkIiwib25DaGFuZ2VBdmF0YXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVB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REosZUFNSSw2QkFBQyx5QkFBRDtBQUNJLE1BQUEsT0FBTyxFQUFFLEtBQUtDLGNBRGxCO0FBRUksTUFBQSxTQUFTLEVBQUM7QUFGZCxPQUlLTCxPQUpMLENBTkosZUFZSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksd0NBQUkseUJBQUcsc0JBQUgsQ0FBSixDQURKLGVBRUksMkNBQ0sseUJBQUcsb0RBQUgsQ0FETCxDQUZKLENBWkosQ0FqQkosQ0FESixDQUxKLENBREo7QUErQ0g7O0FBekwyRiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwgeyBDaGFuZ2VFdmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBCYXNlRGlhbG9nIGZyb20gXCIuL0Jhc2VEaWFsb2dcIjtcbmltcG9ydCB7IF90IH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEluZm9Ub29sdGlwIGZyb20gXCIuLi9lbGVtZW50cy9JbmZvVG9vbHRpcFwiO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge3Nob3dDb21tdW5pdHlSb29tSW52aXRlRGlhbG9nfSBmcm9tIFwiLi4vLi4vLi4vUm9vbUludml0ZVwiO1xuaW1wb3J0IEdyb3VwU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Hcm91cFN0b3JlXCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgbG9jYWxwYXJ0OiBzdHJpbmc7XG4gICAgZXJyb3I6IHN0cmluZztcbiAgICBidXN5OiBib29sZWFuO1xuICAgIGF2YXRhckZpbGU6IEZpbGU7XG4gICAgYXZhdGFyUHJldmlldzogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBhdmF0YXJVcGxvYWRSZWY6IFJlYWN0LlJlZk9iamVjdDxIVE1MSW5wdXRFbGVtZW50PiA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICBsb2NhbHBhcnQ6IFwiXCIsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgYXZhdGFyRmlsZTogbnVsbCxcbiAgICAgICAgICAgIGF2YXRhclByZXZpZXc6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk5hbWVDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGNvbnN0IGxvY2FscGFydCA9IChldi50YXJnZXQudmFsdWUgfHwgXCJcIikudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOS5cXC1fXS9nLCAnLScpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiBldi50YXJnZXQudmFsdWUsIGxvY2FscGFydH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gYXN5bmMgKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJ1c3kpIHJldHVybjtcblxuICAgICAgICAvLyBXZSdsbCBjcmVhdGUgdGhlIGNvbW11bml0eSBub3cgdG8gc2VlIGlmIGl0J3MgdGFrZW4sIGxlYXZpbmcgaXQgYWN0aXZlIGluXG4gICAgICAgIC8vIHRoZSBiYWNrZ3JvdW5kIGZvciB0aGUgdXNlciB0byBsb29rIGF0IHdoaWxlIHRoZXkgaW52aXRlIHBlb3BsZS5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGF2YXRhclVybCA9ICcnOyAvLyBtdXN0IGJlIGEgc3RyaW5nIGZvciBzeW5hcHNlIHRvIGFjY2VwdCBpdFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXZhdGFyRmlsZSkge1xuICAgICAgICAgICAgICAgIGF2YXRhclVybCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGxvYWRDb250ZW50KHRoaXMuc3RhdGUuYXZhdGFyRmlsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5jcmVhdGVHcm91cCh7XG4gICAgICAgICAgICAgICAgbG9jYWxwYXJ0OiB0aGlzLnN0YXRlLmxvY2FscGFydCxcbiAgICAgICAgICAgICAgICBwcm9maWxlOiB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuc3RhdGUubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgYXZhdGFyX3VybDogYXZhdGFyVXJsLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRW5zdXJlIHRoZSB0YWcgZ2V0cyBzZWxlY3RlZCBub3cgdGhhdCB3ZSd2ZSBjcmVhdGVkIGl0XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2Rlc2VsZWN0X3RhZ3MnfSwgdHJ1ZSk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3NlbGVjdF90YWcnLFxuICAgICAgICAgICAgICAgIHRhZzogcmVzdWx0Lmdyb3VwX2lkLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIENsb3NlIG91ciBvd24gZGlhbG9nIGJlZm9yZSBtb3ZpbmcgbXVjaCBmdXJ0aGVyXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmIChyZXN1bHQucm9vbV9pZCkge1xuICAgICAgICAgICAgICAgIC8vIEZvcmNlIHRoZSBncm91cCBzdG9yZSB0byB1cGRhdGUgYXMgaXQgbWlnaHQgaGF2ZSBtaXNzZWQgdGhlIGdlbmVyYWwgY2hhdFxuICAgICAgICAgICAgICAgIGF3YWl0IEdyb3VwU3RvcmUucmVmcmVzaEdyb3VwUm9vbXMocmVzdWx0Lmdyb3VwX2lkKTtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICd2aWV3X3Jvb20nLFxuICAgICAgICAgICAgICAgICAgICByb29tX2lkOiByZXN1bHQucm9vbV9pZCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBzaG93Q29tbXVuaXR5Um9vbUludml0ZURpYWxvZyhyZXN1bHQucm9vbV9pZCwgdGhpcy5zdGF0ZS5uYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19ncm91cCcsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwX2lkOiByZXN1bHQuZ3JvdXBfaWQsXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwX2lzX25ldzogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycm9yOiBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGVyZSB3YXMgYW4gZXJyb3IgY3JlYXRpbmcgeW91ciBjb21tdW5pdHkuIFRoZSBuYW1lIG1heSBiZSB0YWtlbiBvciB0aGUgXCIgK1xuICAgICAgICAgICAgICAgICAgICBcInNlcnZlciBpcyB1bmFibGUgdG8gcHJvY2VzcyB5b3VyIHJlcXVlc3QuXCIsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BdmF0YXJDaGFuZ2VkID0gKGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGlmICghZS50YXJnZXQuZmlsZXMgfHwgIWUudGFyZ2V0LmZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YXZhdGFyRmlsZTogbnVsbH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZXY6IFByb2dyZXNzRXZlbnQ8RmlsZVJlYWRlcj4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHthdmF0YXJGaWxlOiBmaWxlLCBidXN5OiBmYWxzZSwgYXZhdGFyUHJldmlldzogZXYudGFyZ2V0LnJlc3VsdCBhcyBzdHJpbmd9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlQXZhdGFyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdmF0YXJVcGxvYWRSZWYuY3VycmVudCkgdGhpcy5hdmF0YXJVcGxvYWRSZWYuY3VycmVudC5jbGljaygpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBsZXQgY29tbXVuaXR5SWQgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5sb2NhbHBhcnQpIHtcbiAgICAgICAgICAgIGNvbW11bml0eUlkID0gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19jb21tdW5pdHlJZFwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJDb21tdW5pdHkgSUQ6ICs8bG9jYWxwYXJ0IC8+OiUoZG9tYWluKXNcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tYWluOiBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKSxcbiAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxwYXJ0OiAoKSA9PiA8dT57dGhpcy5zdGF0ZS5sb2NhbHBhcnR9PC91PixcbiAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIDxJbmZvVG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD17X3QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJVc2UgdGhpcyB3aGVuIHJlZmVyZW5jaW5nIHlvdXIgY29tbXVuaXR5IHRvIG90aGVycy4gVGhlIGNvbW11bml0eSBJRCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYW5ub3QgYmUgY2hhbmdlZC5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBoZWxwVGV4dCA9IChcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19zdWJ0ZXh0XCI+XG4gICAgICAgICAgICAgICAge190KFwiWW91IGNhbiBjaGFuZ2UgdGhpcyBsYXRlciBpZiBuZWVkZWQuXCIpfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5lcnJvcikge1xuICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IFwibXhfQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX3N1YnRleHQgbXhfQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX3N1YnRleHRfZXJyb3JcIjtcbiAgICAgICAgICAgIGhlbHBUZXh0ID0gKFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17Y2xhc3Nlc30+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLmVycm9yfVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcHJldmlldyA9IDxpbWcgc3JjPXt0aGlzLnN0YXRlLmF2YXRhclByZXZpZXd9IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19hdmF0YXJcIiAvPjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmF2YXRhclByZXZpZXcpIHtcbiAgICAgICAgICAgIHByZXZpZXcgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19wbGFjZWhvbGRlckF2YXRhclwiIC8+XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJXaGF0J3MgdGhlIG5hbWUgb2YgeW91ciBjb21tdW5pdHkgb3IgdGVhbT9cIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19jb2xOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtoZWxwVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfc3VidGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LypuYnNwIGlzIHRvIHJlc2VydmUgdGhlIGhlaWdodCBvZiB0aGlzIGVsZW1lbnQgd2hlbiB0aGVyZSdzIG5vdGhpbmcqL31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJm5ic3A7e2NvbW11bml0eUlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMub25TdWJtaXR9IGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJDcmVhdGVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19jb2xBdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImZpbGVcIiBzdHlsZT17e2Rpc3BsYXk6IFwibm9uZVwifX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmF2YXRhclVwbG9hZFJlZn0gYWNjZXB0PVwiaW1hZ2UvKlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQXZhdGFyQ2hhbmdlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DaGFuZ2VBdmF0YXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19hdmF0YXJDb250YWluZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ByZXZpZXd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX3RpcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Yj57X3QoXCJBZGQgaW1hZ2UgKG9wdGlvbmFsKVwiKX08L2I+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQW4gaW1hZ2Ugd2lsbCBoZWxwIHBlb3BsZSBpZGVudGlmeSB5b3VyIGNvbW11bml0eS5cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19