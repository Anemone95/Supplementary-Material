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

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Keyboard = require("../../../Keyboard");

var _createRoom = require("../../../createRoom");

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

/*
Copyright 2017 Michael Telatynski <7t3chguy@gmail.com>
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
class CreateRoomDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onKeyDown", event => {
      if (event.key === _Keyboard.Key.ENTER) {
        this.onOk();
        event.preventDefault();
        event.stopPropagation();
      }
    });
    (0, _defineProperty2.default)(this, "onOk", async () => {
      const activeElement = document.activeElement;

      if (activeElement) {
        activeElement.blur();
      }

      await this._nameFieldRef.validate({
        allowEmpty: false
      });

      if (this._aliasFieldRef) {
        await this._aliasFieldRef.validate({
          allowEmpty: false
        });
      } // Validation and state updates are async, so we need to wait for them to complete
      // first. Queue a `setState` callback and wait for it to resolve.


      await new Promise(resolve => this.setState({}, resolve));

      if (this.state.nameIsValid && (!this._aliasFieldRef || this._aliasFieldRef.isValid)) {
        this.props.onFinished(true, this._roomCreateOptions());
      } else {
        let field;

        if (!this.state.nameIsValid) {
          field = this._nameFieldRef;
        } else if (this._aliasFieldRef && !this._aliasFieldRef.isValid) {
          field = this._aliasFieldRef;
        }

        if (field) {
          field.focus();
          field.validate({
            allowEmpty: false,
            focused: true
          });
        }
      }
    });
    (0, _defineProperty2.default)(this, "onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onNameChange", ev => {
      this.setState({
        name: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onTopicChange", ev => {
      this.setState({
        topic: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onPublicChange", isPublic => {
      this.setState({
        isPublic
      });
    });
    (0, _defineProperty2.default)(this, "onEncryptedChange", isEncrypted => {
      this.setState({
        isEncrypted
      });
    });
    (0, _defineProperty2.default)(this, "onAliasChange", alias => {
      this.setState({
        alias
      });
    });
    (0, _defineProperty2.default)(this, "onDetailsToggled", ev => {
      this.setState({
        detailsOpen: ev.target.open
      });
    });
    (0, _defineProperty2.default)(this, "onNoFederateChange", noFederate => {
      this.setState({
        noFederate
      });
    });
    (0, _defineProperty2.default)(this, "collectDetailsRef", ref => {
      this._detailsRef = ref;
    });
    (0, _defineProperty2.default)(this, "onNameValidate", async fieldState => {
      const result = await CreateRoomDialog._validateRoomName(fieldState);
      this.setState({
        nameIsValid: result.valid
      });
      return result;
    });

    const config = _SdkConfig.default.get();

    this.state = {
      isPublic: this.props.defaultPublic || false,
      isEncrypted: (0, _createRoom.privateShouldBeEncrypted)(),
      name: "",
      topic: "",
      alias: "",
      detailsOpen: false,
      noFederate: config.default_federate === false,
      nameIsValid: false,
      canChangeEncryption: true
    };

    _MatrixClientPeg.MatrixClientPeg.get().doesServerForceEncryptionForPreset("private").then(isForced => this.setState({
      canChangeEncryption: !isForced
    }));
  }

  _roomCreateOptions() {
    const opts = {};
    const createOpts = opts.createOpts = {};
    createOpts.name = this.state.name;

    if (this.state.isPublic) {
      createOpts.visibility = "public";
      createOpts.preset = "public_chat";
      opts.guestAccess = false;
      const {
        alias
      } = this.state;
      const localPart = alias.substr(1, alias.indexOf(":") - 1);
      createOpts['room_alias_name'] = localPart;
    }

    if (this.state.topic) {
      createOpts.topic = this.state.topic;
    }

    if (this.state.noFederate) {
      createOpts.creation_content = {
        'm.federate': false
      };
    }

    if (!this.state.isPublic) {
      if (this.state.canChangeEncryption) {
        opts.encryption = this.state.isEncrypted;
      } else {
        // the server should automatically do this for us, but for safety
        // we'll demand it too.
        opts.encryption = true;
      }
    }

    if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()) {
      opts.associatedWithCommunity = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId();
    }

    return opts;
  }

  componentDidMount() {
    this._detailsRef.addEventListener("toggle", this.onDetailsToggled); // move focus to first field when showing dialog


    this._nameFieldRef.focus();
  }

  componentWillUnmount() {
    this._detailsRef.removeEventListener("toggle", this.onDetailsToggled);
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    const Field = sdk.getComponent('views.elements.Field');
    const LabelledToggleSwitch = sdk.getComponent('views.elements.LabelledToggleSwitch');
    const RoomAliasField = sdk.getComponent('views.elements.RoomAliasField');
    let aliasField;

    if (this.state.isPublic) {
      const domain = _MatrixClientPeg.MatrixClientPeg.get().getDomain();

      aliasField = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_CreateRoomDialog_aliasContainer"
      }, /*#__PURE__*/_react.default.createElement(RoomAliasField, {
        ref: ref => this._aliasFieldRef = ref,
        onChange: this.onAliasChange,
        domain: domain,
        value: this.state.alias
      }));
    }

    let publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Private rooms can be found and joined by invitation only. Public rooms can be " + "found and joined by anyone."));

    if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()) {
      publicPrivateLabel = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Private rooms can be found and joined by invitation only. Public rooms can be " + "found and joined by anyone in this community."));
    }

    let e2eeSection;

    if (!this.state.isPublic) {
      let microcopy;

      if ((0, _createRoom.privateShouldBeEncrypted)()) {
        if (this.state.canChangeEncryption) {
          microcopy = (0, _languageHandler._t)("You can’t disable this later. Bridges & most bots won’t work yet.");
        } else {
          microcopy = (0, _languageHandler._t)("Your server requires encryption to be enabled in private rooms.");
        }
      } else {
        microcopy = (0, _languageHandler._t)("Your server admin has disabled end-to-end encryption by default " + "in private rooms & Direct Messages.");
      }

      e2eeSection = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(LabelledToggleSwitch, {
        label: (0, _languageHandler._t)("Enable end-to-end encryption"),
        onChange: this.onEncryptedChange,
        value: this.state.isEncrypted,
        className: "mx_CreateRoomDialog_e2eSwitch" // for end-to-end tests
        ,
        disabled: !this.state.canChangeEncryption
      }), /*#__PURE__*/_react.default.createElement("p", null, microcopy));
    }

    let federateLabel = (0, _languageHandler._t)("You might enable this if the room will only be used for collaborating with internal " + "teams on your homeserver. This cannot be changed later.");

    if (_SdkConfig.default.get().default_federate === false) {
      // We only change the label if the default setting is different to avoid jarring text changes to the
      // user. They will have read the implications of turning this off/on, so no need to rephrase for them.
      federateLabel = (0, _languageHandler._t)("You might disable this if the room will be used for collaborating with external " + "teams who have their own homeserver. This cannot be changed later.");
    }

    let title = this.state.isPublic ? (0, _languageHandler._t)('Create a public room') : (0, _languageHandler._t)('Create a private room');

    if (_CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityId()) {
      const name = _CommunityPrototypeStore.CommunityPrototypeStore.instance.getSelectedCommunityName();

      title = (0, _languageHandler._t)("Create a room in %(communityName)s", {
        communityName: name
      });
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_CreateRoomDialog",
      onFinished: this.props.onFinished,
      title: title
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this.onOk,
      onKeyDown: this._onKeyDown
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement(Field, {
      ref: ref => this._nameFieldRef = ref,
      label: (0, _languageHandler._t)('Name'),
      onChange: this.onNameChange,
      onValidate: this.onNameValidate,
      value: this.state.name,
      className: "mx_CreateRoomDialog_name"
    }), /*#__PURE__*/_react.default.createElement(Field, {
      label: (0, _languageHandler._t)('Topic (optional)'),
      onChange: this.onTopicChange,
      value: this.state.topic,
      className: "mx_CreateRoomDialog_topic"
    }), /*#__PURE__*/_react.default.createElement(LabelledToggleSwitch, {
      label: (0, _languageHandler._t)("Make this room public"),
      onChange: this.onPublicChange,
      value: this.state.isPublic
    }), publicPrivateLabel, e2eeSection, aliasField, /*#__PURE__*/_react.default.createElement("details", {
      ref: this.collectDetailsRef,
      className: "mx_CreateRoomDialog_details"
    }, /*#__PURE__*/_react.default.createElement("summary", {
      className: "mx_CreateRoomDialog_details_summary"
    }, this.state.detailsOpen ? (0, _languageHandler._t)('Hide advanced') : (0, _languageHandler._t)('Show advanced')), /*#__PURE__*/_react.default.createElement(LabelledToggleSwitch, {
      label: (0, _languageHandler._t)("Block anyone not part of %(serverName)s from ever joining this room.", {
        serverName: _MatrixClientPeg.MatrixClientPeg.getHomeserverName()
      }),
      onChange: this.onNoFederateChange,
      value: this.state.noFederate
    }), /*#__PURE__*/_react.default.createElement("p", null, federateLabel)))), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)('Create Room'),
      onPrimaryButtonClick: this.onOk,
      onCancel: this.onCancel
    }));
  }

}

exports.default = CreateRoomDialog;
(0, _defineProperty2.default)(CreateRoomDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired,
  defaultPublic: _propTypes.default.bool
});
(0, _defineProperty2.default)(CreateRoomDialog, "_validateRoomName", (0, _Validation.default)({
  rules: [{
    key: "required",
    test: async ({
      value
    }) => !!value,
    invalid: () => (0, _languageHandler._t)("Please enter a name for the room")
  }]
}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlUm9vbURpYWxvZy5qcyJdLCJuYW1lcyI6WyJDcmVhdGVSb29tRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJrZXkiLCJLZXkiLCJFTlRFUiIsIm9uT2siLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImFjdGl2ZUVsZW1lbnQiLCJkb2N1bWVudCIsImJsdXIiLCJfbmFtZUZpZWxkUmVmIiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5IiwiX2FsaWFzRmllbGRSZWYiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFN0YXRlIiwic3RhdGUiLCJuYW1lSXNWYWxpZCIsImlzVmFsaWQiLCJvbkZpbmlzaGVkIiwiX3Jvb21DcmVhdGVPcHRpb25zIiwiZmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJldiIsIm5hbWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRvcGljIiwiaXNQdWJsaWMiLCJpc0VuY3J5cHRlZCIsImFsaWFzIiwiZGV0YWlsc09wZW4iLCJvcGVuIiwibm9GZWRlcmF0ZSIsInJlZiIsIl9kZXRhaWxzUmVmIiwiZmllbGRTdGF0ZSIsInJlc3VsdCIsIl92YWxpZGF0ZVJvb21OYW1lIiwidmFsaWQiLCJjb25maWciLCJTZGtDb25maWciLCJnZXQiLCJkZWZhdWx0UHVibGljIiwiZGVmYXVsdF9mZWRlcmF0ZSIsImNhbkNoYW5nZUVuY3J5cHRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJkb2VzU2VydmVyRm9yY2VFbmNyeXB0aW9uRm9yUHJlc2V0IiwidGhlbiIsImlzRm9yY2VkIiwib3B0cyIsImNyZWF0ZU9wdHMiLCJ2aXNpYmlsaXR5IiwicHJlc2V0IiwiZ3Vlc3RBY2Nlc3MiLCJsb2NhbFBhcnQiLCJzdWJzdHIiLCJpbmRleE9mIiwiY3JlYXRpb25fY29udGVudCIsImVuY3J5cHRpb24iLCJDb21tdW5pdHlQcm90b3R5cGVTdG9yZSIsImluc3RhbmNlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCIsImFzc29jaWF0ZWRXaXRoQ29tbXVuaXR5IiwiY29tcG9uZW50RGlkTW91bnQiLCJhZGRFdmVudExpc3RlbmVyIiwib25EZXRhaWxzVG9nZ2xlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJEaWFsb2dCdXR0b25zIiwiRmllbGQiLCJMYWJlbGxlZFRvZ2dsZVN3aXRjaCIsIlJvb21BbGlhc0ZpZWxkIiwiYWxpYXNGaWVsZCIsImRvbWFpbiIsImdldERvbWFpbiIsIm9uQWxpYXNDaGFuZ2UiLCJwdWJsaWNQcml2YXRlTGFiZWwiLCJlMmVlU2VjdGlvbiIsIm1pY3JvY29weSIsIm9uRW5jcnlwdGVkQ2hhbmdlIiwiZmVkZXJhdGVMYWJlbCIsInRpdGxlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lIiwiY29tbXVuaXR5TmFtZSIsIl9vbktleURvd24iLCJvbk5hbWVDaGFuZ2UiLCJvbk5hbWVWYWxpZGF0ZSIsIm9uVG9waWNDaGFuZ2UiLCJvblB1YmxpY0NoYW5nZSIsImNvbGxlY3REZXRhaWxzUmVmIiwic2VydmVyTmFtZSIsImdldEhvbWVzZXJ2ZXJOYW1lIiwib25Ob0ZlZGVyYXRlQ2hhbmdlIiwib25DYW5jZWwiLCJQcm9wVHlwZXMiLCJmdW5jIiwiaXNSZXF1aXJlZCIsImJvb2wiLCJydWxlcyIsInRlc3QiLCJpbnZhbGlkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWFlLE1BQU1BLGdCQUFOLFNBQStCQyxlQUFNQyxT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TUFBQSxhQUFhLEVBQUUseUJBQUcsYUFBSCxDQUE5QjtBQUNJLE1BQUEsb0JBQW9CLEVBQUUsS0FBS25GLElBRC9CO0FBRUksTUFBQSxRQUFRLEVBQUUsS0FBS2dHO0FBRm5CLE1BekJKLENBREo7QUErQkg7O0FBdFF5RDs7OzhCQUF6Q3pHLGdCLGVBQ0U7QUFDZnlCLEVBQUFBLFVBQVUsRUFBRWlGLG1CQUFVQyxJQUFWLENBQWVDLFVBRFo7QUFFZjFELEVBQUFBLGFBQWEsRUFBRXdELG1CQUFVRztBQUZWLEM7OEJBREY3RyxnQix1QkFzSlUseUJBQWU7QUFDdEM4RyxFQUFBQSxLQUFLLEVBQUUsQ0FDSDtBQUNJeEcsSUFBQUEsR0FBRyxFQUFFLFVBRFQ7QUFFSXlHLElBQUFBLElBQUksRUFBRSxPQUFPO0FBQUU5RSxNQUFBQTtBQUFGLEtBQVAsS0FBcUIsQ0FBQyxDQUFDQSxLQUZqQztBQUdJK0UsSUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcsa0NBQUg7QUFIbkIsR0FERztBQUQrQixDQUFmLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tICcuLi9lbGVtZW50cy9WYWxpZGF0aW9uJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IHtwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWR9IGZyb20gXCIuLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQge0NvbW11bml0eVByb3RvdHlwZVN0b3JlfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENyZWF0ZVJvb21EaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIGRlZmF1bHRQdWJsaWM6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNQdWJsaWM6IHRoaXMucHJvcHMuZGVmYXVsdFB1YmxpYyB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzRW5jcnlwdGVkOiBwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSxcbiAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICB0b3BpYzogXCJcIixcbiAgICAgICAgICAgIGFsaWFzOiBcIlwiLFxuICAgICAgICAgICAgZGV0YWlsc09wZW46IGZhbHNlLFxuICAgICAgICAgICAgbm9GZWRlcmF0ZTogY29uZmlnLmRlZmF1bHRfZmVkZXJhdGUgPT09IGZhbHNlLFxuICAgICAgICAgICAgbmFtZUlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgY2FuQ2hhbmdlRW5jcnlwdGlvbjogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZG9lc1NlcnZlckZvcmNlRW5jcnlwdGlvbkZvclByZXNldChcInByaXZhdGVcIilcbiAgICAgICAgICAgIC50aGVuKGlzRm9yY2VkID0+IHRoaXMuc2V0U3RhdGUoe2NhbkNoYW5nZUVuY3J5cHRpb246ICFpc0ZvcmNlZH0pKTtcbiAgICB9XG5cbiAgICBfcm9vbUNyZWF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7fTtcbiAgICAgICAgY29uc3QgY3JlYXRlT3B0cyA9IG9wdHMuY3JlYXRlT3B0cyA9IHt9O1xuICAgICAgICBjcmVhdGVPcHRzLm5hbWUgPSB0aGlzLnN0YXRlLm5hbWU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUHVibGljKSB7XG4gICAgICAgICAgICBjcmVhdGVPcHRzLnZpc2liaWxpdHkgPSBcInB1YmxpY1wiO1xuICAgICAgICAgICAgY3JlYXRlT3B0cy5wcmVzZXQgPSBcInB1YmxpY19jaGF0XCI7XG4gICAgICAgICAgICBvcHRzLmd1ZXN0QWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCB7YWxpYXN9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsUGFydCA9IGFsaWFzLnN1YnN0cigxLCBhbGlhcy5pbmRleE9mKFwiOlwiKSAtIDEpO1xuICAgICAgICAgICAgY3JlYXRlT3B0c1sncm9vbV9hbGlhc19uYW1lJ10gPSBsb2NhbFBhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudG9waWMpIHtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMudG9waWMgPSB0aGlzLnN0YXRlLnRvcGljO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm5vRmVkZXJhdGUpIHtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMuY3JlYXRpb25fY29udGVudCA9IHsnbS5mZWRlcmF0ZSc6IGZhbHNlfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc1B1YmxpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbikge1xuICAgICAgICAgICAgICAgIG9wdHMuZW5jcnlwdGlvbiA9IHRoaXMuc3RhdGUuaXNFbmNyeXB0ZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBzZXJ2ZXIgc2hvdWxkIGF1dG9tYXRpY2FsbHkgZG8gdGhpcyBmb3IgdXMsIGJ1dCBmb3Igc2FmZXR5XG4gICAgICAgICAgICAgICAgLy8gd2UnbGwgZGVtYW5kIGl0IHRvby5cbiAgICAgICAgICAgICAgICBvcHRzLmVuY3J5cHRpb24gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKSkge1xuICAgICAgICAgICAgb3B0cy5hc3NvY2lhdGVkV2l0aENvbW11bml0eSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9kZXRhaWxzUmVmLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b2dnbGVcIiwgdGhpcy5vbkRldGFpbHNUb2dnbGVkKTtcbiAgICAgICAgLy8gbW92ZSBmb2N1cyB0byBmaXJzdCBmaWVsZCB3aGVuIHNob3dpbmcgZGlhbG9nXG4gICAgICAgIHRoaXMuX25hbWVGaWVsZFJlZi5mb2N1cygpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl9kZXRhaWxzUmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b2dnbGVcIiwgdGhpcy5vbkRldGFpbHNUb2dnbGVkKTtcbiAgICB9XG5cbiAgICBfb25LZXlEb3duID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIHRoaXMub25PaygpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uT2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBpZiAoYWN0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fbmFtZUZpZWxkUmVmLnZhbGlkYXRlKHthbGxvd0VtcHR5OiBmYWxzZX0pO1xuICAgICAgICBpZiAodGhpcy5fYWxpYXNGaWVsZFJlZikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fYWxpYXNGaWVsZFJlZi52YWxpZGF0ZSh7YWxsb3dFbXB0eTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5uYW1lSXNWYWxpZCAmJiAoIXRoaXMuX2FsaWFzRmllbGRSZWYgfHwgdGhpcy5fYWxpYXNGaWVsZFJlZi5pc1ZhbGlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUsIHRoaXMuX3Jvb21DcmVhdGVPcHRpb25zKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGZpZWxkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5hbWVJc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgZmllbGQgPSB0aGlzLl9uYW1lRmllbGRSZWY7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2FsaWFzRmllbGRSZWYgJiYgIXRoaXMuX2FsaWFzRmllbGRSZWYuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkID0gdGhpcy5fYWxpYXNGaWVsZFJlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgb25OYW1lQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiBldi50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgb25Ub3BpY0NoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dG9waWM6IGV2LnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBvblB1YmxpY0NoYW5nZSA9IGlzUHVibGljID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNQdWJsaWN9KTtcbiAgICB9O1xuXG4gICAgb25FbmNyeXB0ZWRDaGFuZ2UgPSBpc0VuY3J5cHRlZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRW5jcnlwdGVkfSk7XG4gICAgfTtcblxuICAgIG9uQWxpYXNDaGFuZ2UgPSBhbGlhcyA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2FsaWFzfSk7XG4gICAgfTtcblxuICAgIG9uRGV0YWlsc1RvZ2dsZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RldGFpbHNPcGVuOiBldi50YXJnZXQub3Blbn0pO1xuICAgIH07XG5cbiAgICBvbk5vRmVkZXJhdGVDaGFuZ2UgPSBub0ZlZGVyYXRlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm9GZWRlcmF0ZX0pO1xuICAgIH07XG5cbiAgICBjb2xsZWN0RGV0YWlsc1JlZiA9IHJlZiA9PiB7XG4gICAgICAgIHRoaXMuX2RldGFpbHNSZWYgPSByZWY7XG4gICAgfTtcblxuICAgIG9uTmFtZVZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENyZWF0ZVJvb21EaWFsb2cuX3ZhbGlkYXRlUm9vbU5hbWUoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25hbWVJc1ZhbGlkOiByZXN1bHQudmFsaWR9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgc3RhdGljIF92YWxpZGF0ZVJvb21OYW1lID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQbGVhc2UgZW50ZXIgYSBuYW1lIGZvciB0aGUgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCBMYWJlbGxlZFRvZ2dsZVN3aXRjaCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkxhYmVsbGVkVG9nZ2xlU3dpdGNoJyk7XG4gICAgICAgIGNvbnN0IFJvb21BbGlhc0ZpZWxkID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuUm9vbUFsaWFzRmllbGQnKTtcblxuICAgICAgICBsZXQgYWxpYXNGaWVsZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNQdWJsaWMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvbWFpbiA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgICAgIGFsaWFzRmllbGQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2FsaWFzQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSb29tQWxpYXNGaWVsZCByZWY9e3JlZiA9PiB0aGlzLl9hbGlhc0ZpZWxkUmVmID0gcmVmfSBvbkNoYW5nZT17dGhpcy5vbkFsaWFzQ2hhbmdlfSBkb21haW49e2RvbWFpbn0gdmFsdWU9e3RoaXMuc3RhdGUuYWxpYXN9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHB1YmxpY1ByaXZhdGVMYWJlbCA9IDxwPntfdChcbiAgICAgICAgICAgIFwiUHJpdmF0ZSByb29tcyBjYW4gYmUgZm91bmQgYW5kIGpvaW5lZCBieSBpbnZpdGF0aW9uIG9ubHkuIFB1YmxpYyByb29tcyBjYW4gYmUgXCIgK1xuICAgICAgICAgICAgXCJmb3VuZCBhbmQgam9pbmVkIGJ5IGFueW9uZS5cIixcbiAgICAgICAgKX08L3A+O1xuICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICBwdWJsaWNQcml2YXRlTGFiZWwgPSA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJQcml2YXRlIHJvb21zIGNhbiBiZSBmb3VuZCBhbmQgam9pbmVkIGJ5IGludml0YXRpb24gb25seS4gUHVibGljIHJvb21zIGNhbiBiZSBcIiArXG4gICAgICAgICAgICAgICAgXCJmb3VuZCBhbmQgam9pbmVkIGJ5IGFueW9uZSBpbiB0aGlzIGNvbW11bml0eS5cIixcbiAgICAgICAgICAgICl9PC9wPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlMmVlU2VjdGlvbjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzUHVibGljKSB7XG4gICAgICAgICAgICBsZXQgbWljcm9jb3B5O1xuICAgICAgICAgICAgaWYgKHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtaWNyb2NvcHkgPSBfdChcIllvdSBjYW7igJl0IGRpc2FibGUgdGhpcyBsYXRlci4gQnJpZGdlcyAmIG1vc3QgYm90cyB3b27igJl0IHdvcmsgeWV0LlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtaWNyb2NvcHkgPSBfdChcIllvdXIgc2VydmVyIHJlcXVpcmVzIGVuY3J5cHRpb24gdG8gYmUgZW5hYmxlZCBpbiBwcml2YXRlIHJvb21zLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1pY3JvY29weSA9IF90KFwiWW91ciBzZXJ2ZXIgYWRtaW4gaGFzIGRpc2FibGVkIGVuZC10by1lbmQgZW5jcnlwdGlvbiBieSBkZWZhdWx0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpbiBwcml2YXRlIHJvb21zICYgRGlyZWN0IE1lc3NhZ2VzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUyZWVTZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17IF90KFwiRW5hYmxlIGVuZC10by1lbmQgZW5jcnlwdGlvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmNyeXB0ZWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmlzRW5jcnlwdGVkfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0NyZWF0ZVJvb21EaWFsb2dfZTJlU3dpdGNoJyAvLyBmb3IgZW5kLXRvLWVuZCB0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxwPnsgbWljcm9jb3B5IH08L3A+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmZWRlcmF0ZUxhYmVsID0gX3QoXG4gICAgICAgICAgICBcIllvdSBtaWdodCBlbmFibGUgdGhpcyBpZiB0aGUgcm9vbSB3aWxsIG9ubHkgYmUgdXNlZCBmb3IgY29sbGFib3JhdGluZyB3aXRoIGludGVybmFsIFwiICtcbiAgICAgICAgICAgIFwidGVhbXMgb24geW91ciBob21lc2VydmVyLiBUaGlzIGNhbm5vdCBiZSBjaGFuZ2VkIGxhdGVyLlwiLFxuICAgICAgICApO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmRlZmF1bHRfZmVkZXJhdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBXZSBvbmx5IGNoYW5nZSB0aGUgbGFiZWwgaWYgdGhlIGRlZmF1bHQgc2V0dGluZyBpcyBkaWZmZXJlbnQgdG8gYXZvaWQgamFycmluZyB0ZXh0IGNoYW5nZXMgdG8gdGhlXG4gICAgICAgICAgICAvLyB1c2VyLiBUaGV5IHdpbGwgaGF2ZSByZWFkIHRoZSBpbXBsaWNhdGlvbnMgb2YgdHVybmluZyB0aGlzIG9mZi9vbiwgc28gbm8gbmVlZCB0byByZXBocmFzZSBmb3IgdGhlbS5cbiAgICAgICAgICAgIGZlZGVyYXRlTGFiZWwgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdSBtaWdodCBkaXNhYmxlIHRoaXMgaWYgdGhlIHJvb20gd2lsbCBiZSB1c2VkIGZvciBjb2xsYWJvcmF0aW5nIHdpdGggZXh0ZXJuYWwgXCIgK1xuICAgICAgICAgICAgICAgIFwidGVhbXMgd2hvIGhhdmUgdGhlaXIgb3duIGhvbWVzZXJ2ZXIuIFRoaXMgY2Fubm90IGJlIGNoYW5nZWQgbGF0ZXIuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlID0gdGhpcy5zdGF0ZS5pc1B1YmxpYyA/IF90KCdDcmVhdGUgYSBwdWJsaWMgcm9vbScpIDogX3QoJ0NyZWF0ZSBhIHByaXZhdGUgcm9vbScpO1xuICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lKCk7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiQ3JlYXRlIGEgcm9vbSBpbiAlKGNvbW11bml0eU5hbWUpc1wiLCB7Y29tbXVuaXR5TmFtZTogbmFtZX0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nXCIgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbk9rfSBvbktleURvd249e3RoaXMuX29uS2V5RG93bn0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZCByZWY9e3JlZiA9PiB0aGlzLl9uYW1lRmllbGRSZWYgPSByZWZ9IGxhYmVsPXsgX3QoJ05hbWUnKSB9IG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX0gb25WYWxpZGF0ZT17dGhpcy5vbk5hbWVWYWxpZGF0ZX0gdmFsdWU9e3RoaXMuc3RhdGUubmFtZX0gY2xhc3NOYW1lPVwibXhfQ3JlYXRlUm9vbURpYWxvZ19uYW1lXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZCBsYWJlbD17IF90KCdUb3BpYyAob3B0aW9uYWwpJykgfSBvbkNoYW5nZT17dGhpcy5vblRvcGljQ2hhbmdlfSB2YWx1ZT17dGhpcy5zdGF0ZS50b3BpY30gY2xhc3NOYW1lPVwibXhfQ3JlYXRlUm9vbURpYWxvZ190b3BpY1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2ggbGFiZWw9eyBfdChcIk1ha2UgdGhpcyByb29tIHB1YmxpY1wiKX0gb25DaGFuZ2U9e3RoaXMub25QdWJsaWNDaGFuZ2V9IHZhbHVlPXt0aGlzLnN0YXRlLmlzUHVibGljfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBwdWJsaWNQcml2YXRlTGFiZWwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlMmVlU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGFsaWFzRmllbGQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRldGFpbHMgcmVmPXt0aGlzLmNvbGxlY3REZXRhaWxzUmVmfSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNfc3VtbWFyeVwiPnsgdGhpcy5zdGF0ZS5kZXRhaWxzT3BlbiA/IF90KCdIaWRlIGFkdmFuY2VkJykgOiBfdCgnU2hvdyBhZHZhbmNlZCcpIH08L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsbGVkVG9nZ2xlU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmxvY2sgYW55b25lIG5vdCBwYXJ0IG9mICUoc2VydmVyTmFtZSlzIGZyb20gZXZlciBqb2luaW5nIHRoaXMgcm9vbS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzZXJ2ZXJOYW1lOiBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTm9GZWRlcmF0ZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubm9GZWRlcmF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPntmZWRlcmF0ZUxhYmVsfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdDcmVhdGUgUm9vbScpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk9rfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH0gLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=