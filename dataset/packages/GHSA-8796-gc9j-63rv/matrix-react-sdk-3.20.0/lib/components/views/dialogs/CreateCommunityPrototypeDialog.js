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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let CreateCommunityPrototypeDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.CreateCommunityPrototypeDialog"), _dec(_class = (_temp = class CreateCommunityPrototypeDialog extends _react.default.PureComponent
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

}, _temp)) || _class);
exports.default = CreateCommunityPrototypeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nLnRzeCJdLCJuYW1lcyI6WyJDcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY3JlYXRlUmVmIiwiZXYiLCJsb2NhbHBhcnQiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRvTG93ZXJDYXNlIiwicmVwbGFjZSIsInNldFN0YXRlIiwibmFtZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic3RhdGUiLCJidXN5IiwiYXZhdGFyVXJsIiwiYXZhdGFyRmlsZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwbG9hZENvbnRlbnQiLCJyZXN1bHQiLCJjcmVhdGVHcm91cCIsInByb2ZpbGUiLCJhdmF0YXJfdXJsIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJ0YWciLCJncm91cF9pZCIsIm9uRmluaXNoZWQiLCJyb29tX2lkIiwiR3JvdXBTdG9yZSIsInJlZnJlc2hHcm91cFJvb21zIiwiZ3JvdXBfaXNfbmV3IiwiZSIsImNvbnNvbGUiLCJlcnJvciIsImZpbGVzIiwibGVuZ3RoIiwiZmlsZSIsInJlYWRlciIsIkZpbGVSZWFkZXIiLCJvbmxvYWQiLCJhdmF0YXJQcmV2aWV3IiwicmVhZEFzRGF0YVVSTCIsImF2YXRhclVwbG9hZFJlZiIsImN1cnJlbnQiLCJjbGljayIsInJlbmRlciIsImNvbW11bml0eUlkIiwiZG9tYWluIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJoZWxwVGV4dCIsImNsYXNzZXMiLCJwcmV2aWV3Iiwib25TdWJtaXQiLCJvbk5hbWVDaGFuZ2UiLCJkaXNwbGF5Iiwib25BdmF0YXJDaGFuZ2VkIiwib25DaGFuZ2VBdmF0YXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUVB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LEVBQUUsS0FBS0MsY0FEbEI7QUFFSSxNQUFBLFNBQVMsRUFBQztBQUZkLE9BSUtMLE9BSkwsQ0FOSixlQVlJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSx3Q0FBSSx5QkFBRyxzQkFBSCxDQUFKLENBREosZUFFSSwyQ0FDSyx5QkFBRyxvREFBSCxDQURMLENBRkosQ0FaSixDQWpCSixDQURKLENBTEosQ0FESjtBQStDSDs7QUF6TDJGLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBJbmZvVG9vbHRpcCBmcm9tIFwiLi4vZWxlbWVudHMvSW5mb1Rvb2x0aXBcIjtcbmltcG9ydCBkaXMgZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlclwiO1xuaW1wb3J0IHtzaG93Q29tbXVuaXR5Um9vbUludml0ZURpYWxvZ30gZnJvbSBcIi4uLy4uLy4uL1Jvb21JbnZpdGVcIjtcbmltcG9ydCBHcm91cFN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvR3JvdXBTdG9yZVwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbmludGVyZmFjZSBJUHJvcHMgZXh0ZW5kcyBJRGlhbG9nUHJvcHMge1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgbG9jYWxwYXJ0OiBzdHJpbmc7XG4gICAgZXJyb3I6IHN0cmluZztcbiAgICBidXN5OiBib29sZWFuO1xuICAgIGF2YXRhckZpbGU6IEZpbGU7XG4gICAgYXZhdGFyUHJldmlldzogc3RyaW5nO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkNyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgYXZhdGFyVXBsb2FkUmVmOiBSZWFjdC5SZWZPYmplY3Q8SFRNTElucHV0RWxlbWVudD4gPSBSZWFjdC5jcmVhdGVSZWYoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBuYW1lOiBcIlwiLFxuICAgICAgICAgICAgbG9jYWxwYXJ0OiBcIlwiLFxuICAgICAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgIGF2YXRhckZpbGU6IG51bGwsXG4gICAgICAgICAgICBhdmF0YXJQcmV2aWV3OiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgb25OYW1lQ2hhbmdlID0gKGV2OiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICBjb25zdCBsb2NhbHBhcnQgPSAoZXYudGFyZ2V0LnZhbHVlIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvW15hLXowLTkuXFwtX10vZywgJy0nKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bmFtZTogZXYudGFyZ2V0LnZhbHVlLCBsb2NhbHBhcnR9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblN1Ym1pdCA9IGFzeW5jIChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5idXN5KSByZXR1cm47XG5cbiAgICAgICAgLy8gV2UnbGwgY3JlYXRlIHRoZSBjb21tdW5pdHkgbm93IHRvIHNlZSBpZiBpdCdzIHRha2VuLCBsZWF2aW5nIGl0IGFjdGl2ZSBpblxuICAgICAgICAvLyB0aGUgYmFja2dyb3VuZCBmb3IgdGhlIHVzZXIgdG8gbG9vayBhdCB3aGlsZSB0aGV5IGludml0ZSBwZW9wbGUuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBhdmF0YXJVcmwgPSAnJzsgLy8gbXVzdCBiZSBhIHN0cmluZyBmb3Igc3luYXBzZSB0byBhY2NlcHQgaXRcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmF2YXRhckZpbGUpIHtcbiAgICAgICAgICAgICAgICBhdmF0YXJVcmwgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBsb2FkQ29udGVudCh0aGlzLnN0YXRlLmF2YXRhckZpbGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlR3JvdXAoe1xuICAgICAgICAgICAgICAgIGxvY2FscGFydDogdGhpcy5zdGF0ZS5sb2NhbHBhcnQsXG4gICAgICAgICAgICAgICAgcHJvZmlsZToge1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLnN0YXRlLm5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGF2YXRhcl91cmw6IGF2YXRhclVybCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEVuc3VyZSB0aGUgdGFnIGdldHMgc2VsZWN0ZWQgbm93IHRoYXQgd2UndmUgY3JlYXRlZCBpdFxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICdkZXNlbGVjdF90YWdzJ30sIHRydWUpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICBhY3Rpb246ICdzZWxlY3RfdGFnJyxcbiAgICAgICAgICAgICAgICB0YWc6IHJlc3VsdC5ncm91cF9pZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBDbG9zZSBvdXIgb3duIGRpYWxvZyBiZWZvcmUgbW92aW5nIG11Y2ggZnVydGhlclxuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuXG4gICAgICAgICAgICBpZiAocmVzdWx0LnJvb21faWQpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3JjZSB0aGUgZ3JvdXAgc3RvcmUgdG8gdXBkYXRlIGFzIGl0IG1pZ2h0IGhhdmUgbWlzc2VkIHRoZSBnZW5lcmFsIGNoYXRcbiAgICAgICAgICAgICAgICBhd2FpdCBHcm91cFN0b3JlLnJlZnJlc2hHcm91cFJvb21zKHJlc3VsdC5ncm91cF9pZCk7XG4gICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19yb29tJyxcbiAgICAgICAgICAgICAgICAgICAgcm9vbV9pZDogcmVzdWx0LnJvb21faWQsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc2hvd0NvbW11bml0eVJvb21JbnZpdGVEaWFsb2cocmVzdWx0LnJvb21faWQsIHRoaXMuc3RhdGUubmFtZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfZ3JvdXAnLFxuICAgICAgICAgICAgICAgICAgICBncm91cF9pZDogcmVzdWx0Lmdyb3VwX2lkLFxuICAgICAgICAgICAgICAgICAgICBncm91cF9pc19uZXc6IHRydWUsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhlcmUgd2FzIGFuIGVycm9yIGNyZWF0aW5nIHlvdXIgY29tbXVuaXR5LiBUaGUgbmFtZSBtYXkgYmUgdGFrZW4gb3IgdGhlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJzZXJ2ZXIgaXMgdW5hYmxlIHRvIHByb2Nlc3MgeW91ciByZXF1ZXN0LlwiLFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQXZhdGFyQ2hhbmdlZCA9IChlOiBDaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgICAgICBpZiAoIWUudGFyZ2V0LmZpbGVzIHx8ICFlLnRhcmdldC5maWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2F2YXRhckZpbGU6IG51bGx9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IHRydWV9KTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICByZWFkZXIub25sb2FkID0gKGV2OiBQcm9ncmVzc0V2ZW50PEZpbGVSZWFkZXI+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YXZhdGFyRmlsZTogZmlsZSwgYnVzeTogZmFsc2UsIGF2YXRhclByZXZpZXc6IGV2LnRhcmdldC5yZXN1bHQgYXMgc3RyaW5nfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNoYW5nZUF2YXRhciA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQpIHRoaXMuYXZhdGFyVXBsb2FkUmVmLmN1cnJlbnQuY2xpY2soKTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGNvbW11bml0eUlkID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubG9jYWxwYXJ0KSB7XG4gICAgICAgICAgICBjb21tdW5pdHlJZCA9IChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfY29tbXVuaXR5SWRcIj5cbiAgICAgICAgICAgICAgICAgICAge190KFwiQ29tbXVuaXR5IElEOiArPGxvY2FscGFydCAvPjolKGRvbWFpbilzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbWFpbjogTWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCksXG4gICAgICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FscGFydDogKCkgPT4gPHU+e3RoaXMuc3RhdGUubG9jYWxwYXJ0fTwvdT4sXG4gICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICA8SW5mb1Rvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiVXNlIHRoaXMgd2hlbiByZWZlcmVuY2luZyB5b3VyIGNvbW11bml0eSB0byBvdGhlcnMuIFRoZSBjb21tdW5pdHkgSUQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiY2Fubm90IGJlIGNoYW5nZWQuXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaGVscFRleHQgPSAoXG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfc3VidGV4dFwiPlxuICAgICAgICAgICAgICAgIHtfdChcIllvdSBjYW4gY2hhbmdlIHRoaXMgbGF0ZXIgaWYgbmVlZGVkLlwiKX1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBcIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19zdWJ0ZXh0IG14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ19zdWJ0ZXh0X2Vycm9yXCI7XG4gICAgICAgICAgICBoZWxwVGV4dCA9IChcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgICAgICB7dGhpcy5zdGF0ZS5lcnJvcn1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByZXZpZXcgPSA8aW1nIHNyYz17dGhpcy5zdGF0ZS5hdmF0YXJQcmV2aWV3fSBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfYXZhdGFyXCIgLz47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5hdmF0YXJQcmV2aWV3KSB7XG4gICAgICAgICAgICBwcmV2aWV3ID0gPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfcGxhY2Vob2xkZXJBdmF0YXJcIiAvPlxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiV2hhdCdzIHRoZSBuYW1lIG9mIHlvdXIgY29tbXVuaXR5IG9yIHRlYW0/XCIpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfY29sTmFtZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5uYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbk5hbWVDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcIkVudGVyIG5hbWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVudGVyIG5hbWVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aGVscFRleHR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQ3JlYXRlQ29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX3N1YnRleHRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgey8qbmJzcCBpcyB0byByZXNlcnZlIHRoZSBoZWlnaHQgb2YgdGhpcyBlbGVtZW50IHdoZW4gdGhlcmUncyBub3RoaW5nKi99XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICZuYnNwO3tjb21tdW5pdHlJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLm9uU3VibWl0fSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge190KFwiQ3JlYXRlXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfY29sQXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCIgc3R5bGU9e3tkaXNwbGF5OiBcIm5vbmVcIn19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5hdmF0YXJVcGxvYWRSZWZ9IGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkF2YXRhckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2hhbmdlQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9DcmVhdGVDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfYXZhdGFyQ29udGFpbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtwcmV2aWV3fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUNvbW11bml0eVByb3RvdHlwZURpYWxvZ190aXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGI+e190KFwiQWRkIGltYWdlIChvcHRpb25hbClcIil9PC9iPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkFuIGltYWdlIHdpbGwgaGVscCBwZW9wbGUgaWRlbnRpZnkgeW91ciBjb21tdW5pdHkuXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==