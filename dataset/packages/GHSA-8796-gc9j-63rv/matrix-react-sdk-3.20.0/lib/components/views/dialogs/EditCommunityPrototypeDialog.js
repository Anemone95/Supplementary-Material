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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _temp;

let EditCommunityPrototypeDialog = ( // XXX: This is a lot of duplication from the create dialog, just in a different shape
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.EditCommunityPrototypeDialog"), _dec(_class = (_temp = class EditCommunityPrototypeDialog extends _react.default.PureComponent
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
        const url = (0, _Media.mediaFromMxc)(this.state.currentAvatarUrl).srcHttp;
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

}, _temp)) || _class);
exports.default = EditCommunityPrototypeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZy50c3giXSwibmFtZXMiOlsiRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjcmVhdGVSZWYiLCJldiIsInNldFN0YXRlIiwibmFtZSIsInRhcmdldCIsInZhbHVlIiwicHJldmVudERlZmF1bHQiLCJzdG9wUHJvcGFnYXRpb24iLCJzdGF0ZSIsImJ1c3kiLCJhdmF0YXJVcmwiLCJjdXJyZW50QXZhdGFyVXJsIiwiYXZhdGFyRmlsZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwbG9hZENvbnRlbnQiLCJzZXRHcm91cFByb2ZpbGUiLCJjb21tdW5pdHlJZCIsImF2YXRhcl91cmwiLCJGbGFpclN0b3JlIiwicmVmcmVzaEdyb3VwUHJvZmlsZSIsIm9uRmluaXNoZWQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiZmlsZXMiLCJsZW5ndGgiLCJmaWxlIiwicmVhZGVyIiwiRmlsZVJlYWRlciIsIm9ubG9hZCIsImF2YXRhclByZXZpZXciLCJyZXN1bHQiLCJyZWFkQXNEYXRhVVJMIiwiYXZhdGFyVXBsb2FkUmVmIiwiY3VycmVudCIsImNsaWNrIiwicHJvZmlsZSIsIkNvbW11bml0eVByb3RvdHlwZVN0b3JlIiwiaW5zdGFuY2UiLCJnZXRDb21tdW5pdHlQcm9maWxlIiwicmVuZGVyIiwicHJldmlldyIsInVybCIsInNyY0h0dHAiLCJvblN1Ym1pdCIsIm9uTmFtZUNoYW5nZSIsImRpc3BsYXkiLCJvbkF2YXRhckNoYW5nZWQiLCJvbkNoYW5nZUF2YXRhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFpQnFCQSw0QixLQUZyQjtP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ckMsS0FBTCxDQUFXQztBQUE5RSxPQUNLLHlCQUFHLE1BQUgsQ0FETCxDQTFCSixDQURKLENBTEosQ0FESjtBQXdDSDs7QUE3SHlGLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHsgQ2hhbmdlRXZlbnQgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tIFwiLi9CYXNlRGlhbG9nXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IElEaWFsb2dQcm9wcyB9IGZyb20gXCIuL0lEaWFsb2dQcm9wc1wiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7IENvbW11bml0eVByb3RvdHlwZVN0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Db21tdW5pdHlQcm90b3R5cGVTdG9yZVwiO1xuaW1wb3J0IEZsYWlyU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9GbGFpclN0b3JlXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcbmltcG9ydCB7bWVkaWFGcm9tTXhjfSBmcm9tIFwiLi4vLi4vLi4vY3VzdG9taXNhdGlvbnMvTWVkaWFcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG4gICAgY29tbXVuaXR5SWQ6IHN0cmluZztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGVycm9yOiBzdHJpbmc7XG4gICAgYnVzeTogYm9vbGVhbjtcbiAgICBjdXJyZW50QXZhdGFyVXJsOiBzdHJpbmc7XG4gICAgYXZhdGFyRmlsZTogRmlsZTtcbiAgICBhdmF0YXJQcmV2aWV3OiBzdHJpbmc7XG59XG5cbi8vIFhYWDogVGhpcyBpcyBhIGxvdCBvZiBkdXBsaWNhdGlvbiBmcm9tIHRoZSBjcmVhdGUgZGlhbG9nLCBqdXN0IGluIGEgZGlmZmVyZW50IHNoYXBlXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBhdmF0YXJVcGxvYWRSZWY6IFJlYWN0LlJlZk9iamVjdDxIVE1MSW5wdXRFbGVtZW50PiA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldENvbW11bml0eVByb2ZpbGUocHJvcHMuY29tbXVuaXR5SWQpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBuYW1lOiBwcm9maWxlPy5uYW1lIHx8IFwiXCIsXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgYXZhdGFyRmlsZTogbnVsbCxcbiAgICAgICAgICAgIGF2YXRhclByZXZpZXc6IG51bGwsXG4gICAgICAgICAgICBjdXJyZW50QXZhdGFyVXJsOiBwcm9maWxlPy5hdmF0YXJVcmwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbk5hbWVDaGFuZ2UgPSAoZXY6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25hbWU6IGV2LnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uU3VibWl0ID0gYXN5bmMgKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJ1c3kpIHJldHVybjtcblxuICAgICAgICAvLyBXZSdsbCBjcmVhdGUgdGhlIGNvbW11bml0eSBub3cgdG8gc2VlIGlmIGl0J3MgdGFrZW4sIGxlYXZpbmcgaXQgYWN0aXZlIGluXG4gICAgICAgIC8vIHRoZSBiYWNrZ3JvdW5kIGZvciB0aGUgdXNlciB0byBsb29rIGF0IHdoaWxlIHRoZXkgaW52aXRlIHBlb3BsZS5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGF2YXRhclVybCA9IHRoaXMuc3RhdGUuY3VycmVudEF2YXRhclVybCB8fCBcIlwiOyAvLyBtdXN0IGJlIGEgc3RyaW5nIGZvciBzeW5hcHNlIHRvIGFjY2VwdCBpdFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXZhdGFyRmlsZSkge1xuICAgICAgICAgICAgICAgIGF2YXRhclVybCA9IGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGxvYWRDb250ZW50KHRoaXMuc3RhdGUuYXZhdGFyRmlsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRHcm91cFByb2ZpbGUodGhpcy5wcm9wcy5jb21tdW5pdHlJZCwge1xuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuc3RhdGUubmFtZSxcbiAgICAgICAgICAgICAgICBhdmF0YXJfdXJsOiBhdmF0YXJVcmwsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gYXNrIHRoZSBmbGFpciBzdG9yZSB0byB1cGRhdGUgdGhlIHByb2ZpbGUgdG9vXG4gICAgICAgICAgICBhd2FpdCBGbGFpclN0b3JlLnJlZnJlc2hHcm91cFByb2ZpbGUoTWF0cml4Q2xpZW50UGVnLmdldCgpLCB0aGlzLnByb3BzLmNvbW11bml0eUlkKTtcblxuICAgICAgICAgICAgLy8gd2UgZGlkIGl0LCBzbyBjbG9zZSB0aGUgZGlhbG9nXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBidXN5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBlcnJvcjogX3QoXCJUaGVyZSB3YXMgYW4gZXJyb3IgdXBkYXRpbmcgeW91ciBjb21tdW5pdHkuIFRoZSBzZXJ2ZXIgaXMgdW5hYmxlIHRvIHByb2Nlc3MgeW91ciByZXF1ZXN0LlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BdmF0YXJDaGFuZ2VkID0gKGU6IENoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGlmICghZS50YXJnZXQuZmlsZXMgfHwgIWUudGFyZ2V0LmZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YXZhdGFyRmlsZTogbnVsbH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZXY6IFByb2dyZXNzRXZlbnQ8RmlsZVJlYWRlcj4pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHthdmF0YXJGaWxlOiBmaWxlLCBidXN5OiBmYWxzZSwgYXZhdGFyUHJldmlldzogZXYudGFyZ2V0LnJlc3VsdCBhcyBzdHJpbmd9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlQXZhdGFyID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5hdmF0YXJVcGxvYWRSZWYuY3VycmVudCkgdGhpcy5hdmF0YXJVcGxvYWRSZWYuY3VycmVudC5jbGljaygpO1xuICAgIH07XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBsZXQgcHJldmlldyA9IDxpbWcgc3JjPXt0aGlzLnN0YXRlLmF2YXRhclByZXZpZXd9IGNsYXNzTmFtZT1cIm14X0VkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfYXZhdGFyXCIgLz47XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5hdmF0YXJQcmV2aWV3KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50QXZhdGFyVXJsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gbWVkaWFGcm9tTXhjKHRoaXMuc3RhdGUuY3VycmVudEF2YXRhclVybCkuc3JjSHR0cDtcbiAgICAgICAgICAgICAgICBwcmV2aWV3ID0gPGltZyBzcmM9e3VybH0gY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19hdmF0YXJcIiAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHJldmlldyA9IDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19wbGFjZWhvbGRlckF2YXRhclwiIC8+XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2dcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiVXBkYXRlIGNvbW11bml0eVwiKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRWRpdENvbW11bml0eVByb3RvdHlwZURpYWxvZ19yb3dOYW1lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLm5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRW50ZXIgbmFtZVwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfcm93QXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJmaWxlXCIgc3R5bGU9e3tkaXNwbGF5OiBcIm5vbmVcIn19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5hdmF0YXJVcGxvYWRSZWZ9IGFjY2VwdD1cImltYWdlLypcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkF2YXRhckNoYW5nZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2hhbmdlQXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FZGl0Q29tbXVuaXR5UHJvdG90eXBlRGlhbG9nX2F2YXRhckNvbnRhaW5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPntwcmV2aWV3fTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRDb21tdW5pdHlQcm90b3R5cGVEaWFsb2dfdGlwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxiPntfdChcIkFkZCBpbWFnZSAob3B0aW9uYWwpXCIpfTwvYj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJBbiBpbWFnZSB3aWxsIGhlbHAgcGVvcGxlIGlkZW50aWZ5IHlvdXIgY29tbXVuaXR5LlwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMub25TdWJtaXR9IGRpc2FibGVkPXt0aGlzLnN0YXRlLmJ1c3l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIlNhdmVcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=