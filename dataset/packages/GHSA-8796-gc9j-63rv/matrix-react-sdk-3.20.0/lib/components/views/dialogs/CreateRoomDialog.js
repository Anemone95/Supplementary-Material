"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _room = require("matrix-js-sdk/src/models/room");

var sdk = _interopRequireWildcard(require("../../../index"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Keyboard = require("../../../Keyboard");

var _createRoom = require("../../../createRoom");

var _CommunityPrototypeStore = require("../../../stores/CommunityPrototypeStore");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let CreateRoomDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.CreateRoomDialog"), _dec(_class = (_temp = _class2 = class CreateRoomDialog extends _react.default.Component {
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

    if (this.props.parentSpace) {
      opts.parentSpace = this.props.parentSpace;
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onFinished: _propTypes.default.func.isRequired,
  defaultPublic: _propTypes.default.bool,
  parentSpace: _propTypes.default.instanceOf(_room.Room)
}), (0, _defineProperty2.default)(_class2, "_validateRoomName", (0, _Validation.default)({
  rules: [{
    key: "required",
    test: async ({
      value
    }) => !!value,
    invalid: () => (0, _languageHandler._t)("Please enter a name for the room")
  }]
})), _temp)) || _class);
exports.default = CreateRoomDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlUm9vbURpYWxvZy5qcyJdLCJuYW1lcyI6WyJDcmVhdGVSb29tRGlhbG9nIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJrZXkiLCJLZXkiLCJFTlRFUiIsIm9uT2siLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImFjdGl2ZUVsZW1lbnQiLCJkb2N1bWVudCIsImJsdXIiLCJfbmFtZUZpZWxkUmVmIiwidmFsaWRhdGUiLCJhbGxvd0VtcHR5IiwiX2FsaWFzRmllbGRSZWYiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFN0YXRlIiwic3RhdGUiLCJuYW1lSXNWYWxpZCIsImlzVmFsaWQiLCJvbkZpbmlzaGVkIiwiX3Jvb21DcmVhdGVPcHRpb25zIiwiZmllbGQiLCJmb2N1cyIsImZvY3VzZWQiLCJldiIsIm5hbWUiLCJ0YXJnZXQiLCJ2YWx1ZSIsInRvcGljIiwiaXNQdWJsaWMiLCJpc0VuY3J5cHRlZCIsImFsaWFzIiwiZGV0YWlsc09wZW4iLCJvcGVuIiwibm9GZWRlcmF0ZSIsInJlZiIsIl9kZXRhaWxzUmVmIiwiZmllbGRTdGF0ZSIsInJlc3VsdCIsIl92YWxpZGF0ZVJvb21OYW1lIiwidmFsaWQiLCJjb25maWciLCJTZGtDb25maWciLCJnZXQiLCJkZWZhdWx0UHVibGljIiwiZGVmYXVsdF9mZWRlcmF0ZSIsImNhbkNoYW5nZUVuY3J5cHRpb24iLCJNYXRyaXhDbGllbnRQZWciLCJkb2VzU2VydmVyRm9yY2VFbmNyeXB0aW9uRm9yUHJlc2V0IiwidGhlbiIsImlzRm9yY2VkIiwib3B0cyIsImNyZWF0ZU9wdHMiLCJ2aXNpYmlsaXR5IiwicHJlc2V0IiwiZ3Vlc3RBY2Nlc3MiLCJsb2NhbFBhcnQiLCJzdWJzdHIiLCJpbmRleE9mIiwiY3JlYXRpb25fY29udGVudCIsImVuY3J5cHRpb24iLCJDb21tdW5pdHlQcm90b3R5cGVTdG9yZSIsImluc3RhbmNlIiwiZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCIsImFzc29jaWF0ZWRXaXRoQ29tbXVuaXR5IiwicGFyZW50U3BhY2UiLCJjb21wb25lbnREaWRNb3VudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJvbkRldGFpbHNUb2dnbGVkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIkRpYWxvZ0J1dHRvbnMiLCJGaWVsZCIsIkxhYmVsbGVkVG9nZ2xlU3dpdGNoIiwiUm9vbUFsaWFzRmllbGQiLCJhbGlhc0ZpZWxkIiwiZG9tYWluIiwiZ2V0RG9tYWluIiwib25BbGlhc0NoYW5nZSIsInB1YmxpY1ByaXZhdGVMYWJlbCIsImUyZWVTZWN0aW9uIiwibWljcm9jb3B5Iiwib25FbmNyeXB0ZWRDaGFuZ2UiLCJmZWRlcmF0ZUxhYmVsIiwidGl0bGUiLCJnZXRTZWxlY3RlZENvbW11bml0eU5hbWUiLCJjb21tdW5pdHlOYW1lIiwiX29uS2V5RG93biIsIm9uTmFtZUNoYW5nZSIsIm9uTmFtZVZhbGlkYXRlIiwib25Ub3BpY0NoYW5nZSIsIm9uUHVibGljQ2hhbmdlIiwiY29sbGVjdERldGFpbHNSZWYiLCJzZXJ2ZXJOYW1lIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJvbk5vRmVkZXJhdGVDaGFuZ2UiLCJvbkNhbmNlbCIsIlByb3BUeXBlcyIsImZ1bmMiLCJpc1JlcXVpcmVkIiwiYm9vbCIsImluc3RhbmNlT2YiLCJSb29tIiwicnVsZXMiLCJ0ZXN0IiwiaW52YWxpZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsZ0IsV0FEcEIsZ0RBQXFCLGdDQUFyQixDLG1DQUFELE1BQ3FCQSxnQkFEckIsU0FDOENDLGVBQU1D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TUksTUFBQSxLQUFLLEVBQUUsS0FBS25GLEtBQUwsQ0FBV2tCO0FBTnRCLE1BRkosZUFVSSx3Q0FBSXFELGFBQUosQ0FWSixDQVBKLENBREosQ0FISixlQXlCSSw2QkFBQyxhQUFEO0FBQWUsTUFBQSxhQUFhLEVBQUUseUJBQUcsYUFBSCxDQUE5QjtBQUNJLE1BQUEsb0JBQW9CLEVBQUUsS0FBS3BGLElBRC9CO0FBRUksTUFBQSxRQUFRLEVBQUUsS0FBS2lHO0FBRm5CLE1BekJKLENBREo7QUErQkg7O0FBM1F5RCxDLHNEQUN2QztBQUNmakYsRUFBQUEsVUFBVSxFQUFFa0YsbUJBQVVDLElBQVYsQ0FBZUMsVUFEWjtBQUVmM0QsRUFBQUEsYUFBYSxFQUFFeUQsbUJBQVVHLElBRlY7QUFHZnZDLEVBQUFBLFdBQVcsRUFBRW9DLG1CQUFVSSxVQUFWLENBQXFCQyxVQUFyQjtBQUhFLEMsK0RBMEpRLHlCQUFlO0FBQ3RDQyxFQUFBQSxLQUFLLEVBQUUsQ0FDSDtBQUNJM0csSUFBQUEsR0FBRyxFQUFFLFVBRFQ7QUFFSTRHLElBQUFBLElBQUksRUFBRSxPQUFPO0FBQUVqRixNQUFBQTtBQUFGLEtBQVAsS0FBcUIsQ0FBQyxDQUFDQSxLQUZqQztBQUdJa0YsSUFBQUEsT0FBTyxFQUFFLE1BQU0seUJBQUcsa0NBQUg7QUFIbkIsR0FERztBQUQrQixDQUFmLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtSb29tfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb21cIjtcblxuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiBmcm9tICcuLi9lbGVtZW50cy9WYWxpZGF0aW9uJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHtLZXl9IGZyb20gXCIuLi8uLi8uLi9LZXlib2FyZFwiO1xuaW1wb3J0IHtwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWR9IGZyb20gXCIuLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQge0NvbW11bml0eVByb3RvdHlwZVN0b3JlfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL0NvbW11bml0eVByb3RvdHlwZVN0b3JlXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5DcmVhdGVSb29tRGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVSb29tRGlhbG9nIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBkZWZhdWx0UHVibGljOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgcGFyZW50U3BhY2U6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFJvb20pLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgaXNQdWJsaWM6IHRoaXMucHJvcHMuZGVmYXVsdFB1YmxpYyB8fCBmYWxzZSxcbiAgICAgICAgICAgIGlzRW5jcnlwdGVkOiBwcml2YXRlU2hvdWxkQmVFbmNyeXB0ZWQoKSxcbiAgICAgICAgICAgIG5hbWU6IFwiXCIsXG4gICAgICAgICAgICB0b3BpYzogXCJcIixcbiAgICAgICAgICAgIGFsaWFzOiBcIlwiLFxuICAgICAgICAgICAgZGV0YWlsc09wZW46IGZhbHNlLFxuICAgICAgICAgICAgbm9GZWRlcmF0ZTogY29uZmlnLmRlZmF1bHRfZmVkZXJhdGUgPT09IGZhbHNlLFxuICAgICAgICAgICAgbmFtZUlzVmFsaWQ6IGZhbHNlLFxuICAgICAgICAgICAgY2FuQ2hhbmdlRW5jcnlwdGlvbjogdHJ1ZSxcbiAgICAgICAgfTtcblxuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZG9lc1NlcnZlckZvcmNlRW5jcnlwdGlvbkZvclByZXNldChcInByaXZhdGVcIilcbiAgICAgICAgICAgIC50aGVuKGlzRm9yY2VkID0+IHRoaXMuc2V0U3RhdGUoe2NhbkNoYW5nZUVuY3J5cHRpb246ICFpc0ZvcmNlZH0pKTtcbiAgICB9XG5cbiAgICBfcm9vbUNyZWF0ZU9wdGlvbnMoKSB7XG4gICAgICAgIGNvbnN0IG9wdHMgPSB7fTtcbiAgICAgICAgY29uc3QgY3JlYXRlT3B0cyA9IG9wdHMuY3JlYXRlT3B0cyA9IHt9O1xuICAgICAgICBjcmVhdGVPcHRzLm5hbWUgPSB0aGlzLnN0YXRlLm5hbWU7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUHVibGljKSB7XG4gICAgICAgICAgICBjcmVhdGVPcHRzLnZpc2liaWxpdHkgPSBcInB1YmxpY1wiO1xuICAgICAgICAgICAgY3JlYXRlT3B0cy5wcmVzZXQgPSBcInB1YmxpY19jaGF0XCI7XG4gICAgICAgICAgICBvcHRzLmd1ZXN0QWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zdCB7YWxpYXN9ID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsUGFydCA9IGFsaWFzLnN1YnN0cigxLCBhbGlhcy5pbmRleE9mKFwiOlwiKSAtIDEpO1xuICAgICAgICAgICAgY3JlYXRlT3B0c1sncm9vbV9hbGlhc19uYW1lJ10gPSBsb2NhbFBhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUudG9waWMpIHtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMudG9waWMgPSB0aGlzLnN0YXRlLnRvcGljO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLm5vRmVkZXJhdGUpIHtcbiAgICAgICAgICAgIGNyZWF0ZU9wdHMuY3JlYXRpb25fY29udGVudCA9IHsnbS5mZWRlcmF0ZSc6IGZhbHNlfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5pc1B1YmxpYykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbikge1xuICAgICAgICAgICAgICAgIG9wdHMuZW5jcnlwdGlvbiA9IHRoaXMuc3RhdGUuaXNFbmNyeXB0ZWQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIHRoZSBzZXJ2ZXIgc2hvdWxkIGF1dG9tYXRpY2FsbHkgZG8gdGhpcyBmb3IgdXMsIGJ1dCBmb3Igc2FmZXR5XG4gICAgICAgICAgICAgICAgLy8gd2UnbGwgZGVtYW5kIGl0IHRvby5cbiAgICAgICAgICAgICAgICBvcHRzLmVuY3J5cHRpb24gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKSkge1xuICAgICAgICAgICAgb3B0cy5hc3NvY2lhdGVkV2l0aENvbW11bml0eSA9IENvbW11bml0eVByb3RvdHlwZVN0b3JlLmluc3RhbmNlLmdldFNlbGVjdGVkQ29tbXVuaXR5SWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBhcmVudFNwYWNlKSB7XG4gICAgICAgICAgICBvcHRzLnBhcmVudFNwYWNlID0gdGhpcy5wcm9wcy5wYXJlbnRTcGFjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLl9kZXRhaWxzUmVmLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b2dnbGVcIiwgdGhpcy5vbkRldGFpbHNUb2dnbGVkKTtcbiAgICAgICAgLy8gbW92ZSBmb2N1cyB0byBmaXJzdCBmaWVsZCB3aGVuIHNob3dpbmcgZGlhbG9nXG4gICAgICAgIHRoaXMuX25hbWVGaWVsZFJlZi5mb2N1cygpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl9kZXRhaWxzUmVmLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b2dnbGVcIiwgdGhpcy5vbkRldGFpbHNUb2dnbGVkKTtcbiAgICB9XG5cbiAgICBfb25LZXlEb3duID0gZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSBLZXkuRU5URVIpIHtcbiAgICAgICAgICAgIHRoaXMub25PaygpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uT2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGFjdGl2ZUVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgICAgICBpZiAoYWN0aXZlRWxlbWVudCkge1xuICAgICAgICAgICAgYWN0aXZlRWxlbWVudC5ibHVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fbmFtZUZpZWxkUmVmLnZhbGlkYXRlKHthbGxvd0VtcHR5OiBmYWxzZX0pO1xuICAgICAgICBpZiAodGhpcy5fYWxpYXNGaWVsZFJlZikge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fYWxpYXNGaWVsZFJlZi52YWxpZGF0ZSh7YWxsb3dFbXB0eTogZmFsc2V9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBWYWxpZGF0aW9uIGFuZCBzdGF0ZSB1cGRhdGVzIGFyZSBhc3luYywgc28gd2UgbmVlZCB0byB3YWl0IGZvciB0aGVtIHRvIGNvbXBsZXRlXG4gICAgICAgIC8vIGZpcnN0LiBRdWV1ZSBhIGBzZXRTdGF0ZWAgY2FsbGJhY2sgYW5kIHdhaXQgZm9yIGl0IHRvIHJlc29sdmUuXG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7fSwgcmVzb2x2ZSkpO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5uYW1lSXNWYWxpZCAmJiAoIXRoaXMuX2FsaWFzRmllbGRSZWYgfHwgdGhpcy5fYWxpYXNGaWVsZFJlZi5pc1ZhbGlkKSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUsIHRoaXMuX3Jvb21DcmVhdGVPcHRpb25zKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IGZpZWxkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN0YXRlLm5hbWVJc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgZmllbGQgPSB0aGlzLl9uYW1lRmllbGRSZWY7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2FsaWFzRmllbGRSZWYgJiYgIXRoaXMuX2FsaWFzRmllbGRSZWYuaXNWYWxpZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkID0gdGhpcy5fYWxpYXNGaWVsZFJlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgZmllbGQudmFsaWRhdGUoeyBhbGxvd0VtcHR5OiBmYWxzZSwgZm9jdXNlZDogdHJ1ZSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBvbkNhbmNlbCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgb25OYW1lQ2hhbmdlID0gZXYgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiBldi50YXJnZXQudmFsdWV9KTtcbiAgICB9O1xuXG4gICAgb25Ub3BpY0NoYW5nZSA9IGV2ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dG9waWM6IGV2LnRhcmdldC52YWx1ZX0pO1xuICAgIH07XG5cbiAgICBvblB1YmxpY0NoYW5nZSA9IGlzUHVibGljID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNQdWJsaWN9KTtcbiAgICB9O1xuXG4gICAgb25FbmNyeXB0ZWRDaGFuZ2UgPSBpc0VuY3J5cHRlZCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzRW5jcnlwdGVkfSk7XG4gICAgfTtcblxuICAgIG9uQWxpYXNDaGFuZ2UgPSBhbGlhcyA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2FsaWFzfSk7XG4gICAgfTtcblxuICAgIG9uRGV0YWlsc1RvZ2dsZWQgPSBldiA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2RldGFpbHNPcGVuOiBldi50YXJnZXQub3Blbn0pO1xuICAgIH07XG5cbiAgICBvbk5vRmVkZXJhdGVDaGFuZ2UgPSBub0ZlZGVyYXRlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7bm9GZWRlcmF0ZX0pO1xuICAgIH07XG5cbiAgICBjb2xsZWN0RGV0YWlsc1JlZiA9IHJlZiA9PiB7XG4gICAgICAgIHRoaXMuX2RldGFpbHNSZWYgPSByZWY7XG4gICAgfTtcblxuICAgIG9uTmFtZVZhbGlkYXRlID0gYXN5bmMgZmllbGRTdGF0ZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IENyZWF0ZVJvb21EaWFsb2cuX3ZhbGlkYXRlUm9vbU5hbWUoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe25hbWVJc1ZhbGlkOiByZXN1bHQudmFsaWR9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgc3RhdGljIF92YWxpZGF0ZVJvb21OYW1lID0gd2l0aFZhbGlkYXRpb24oe1xuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQbGVhc2UgZW50ZXIgYSBuYW1lIGZvciB0aGUgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCBMYWJlbGxlZFRvZ2dsZVN3aXRjaCA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkxhYmVsbGVkVG9nZ2xlU3dpdGNoJyk7XG4gICAgICAgIGNvbnN0IFJvb21BbGlhc0ZpZWxkID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuUm9vbUFsaWFzRmllbGQnKTtcblxuICAgICAgICBsZXQgYWxpYXNGaWVsZDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuaXNQdWJsaWMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRvbWFpbiA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKTtcbiAgICAgICAgICAgIGFsaWFzRmllbGQgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2FsaWFzQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSb29tQWxpYXNGaWVsZCByZWY9e3JlZiA9PiB0aGlzLl9hbGlhc0ZpZWxkUmVmID0gcmVmfSBvbkNoYW5nZT17dGhpcy5vbkFsaWFzQ2hhbmdlfSBkb21haW49e2RvbWFpbn0gdmFsdWU9e3RoaXMuc3RhdGUuYWxpYXN9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHB1YmxpY1ByaXZhdGVMYWJlbCA9IDxwPntfdChcbiAgICAgICAgICAgIFwiUHJpdmF0ZSByb29tcyBjYW4gYmUgZm91bmQgYW5kIGpvaW5lZCBieSBpbnZpdGF0aW9uIG9ubHkuIFB1YmxpYyByb29tcyBjYW4gYmUgXCIgK1xuICAgICAgICAgICAgXCJmb3VuZCBhbmQgam9pbmVkIGJ5IGFueW9uZS5cIixcbiAgICAgICAgKX08L3A+O1xuICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICBwdWJsaWNQcml2YXRlTGFiZWwgPSA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJQcml2YXRlIHJvb21zIGNhbiBiZSBmb3VuZCBhbmQgam9pbmVkIGJ5IGludml0YXRpb24gb25seS4gUHVibGljIHJvb21zIGNhbiBiZSBcIiArXG4gICAgICAgICAgICAgICAgXCJmb3VuZCBhbmQgam9pbmVkIGJ5IGFueW9uZSBpbiB0aGlzIGNvbW11bml0eS5cIixcbiAgICAgICAgICAgICl9PC9wPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBlMmVlU2VjdGlvbjtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmlzUHVibGljKSB7XG4gICAgICAgICAgICBsZXQgbWljcm9jb3B5O1xuICAgICAgICAgICAgaWYgKHByaXZhdGVTaG91bGRCZUVuY3J5cHRlZCgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtaWNyb2NvcHkgPSBfdChcIllvdSBjYW7igJl0IGRpc2FibGUgdGhpcyBsYXRlci4gQnJpZGdlcyAmIG1vc3QgYm90cyB3b27igJl0IHdvcmsgeWV0LlwiKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtaWNyb2NvcHkgPSBfdChcIllvdXIgc2VydmVyIHJlcXVpcmVzIGVuY3J5cHRpb24gdG8gYmUgZW5hYmxlZCBpbiBwcml2YXRlIHJvb21zLlwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1pY3JvY29weSA9IF90KFwiWW91ciBzZXJ2ZXIgYWRtaW4gaGFzIGRpc2FibGVkIGVuZC10by1lbmQgZW5jcnlwdGlvbiBieSBkZWZhdWx0IFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJpbiBwcml2YXRlIHJvb21zICYgRGlyZWN0IE1lc3NhZ2VzLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGUyZWVTZWN0aW9uID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxMYWJlbGxlZFRvZ2dsZVN3aXRjaFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17IF90KFwiRW5hYmxlIGVuZC10by1lbmQgZW5jcnlwdGlvblwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmNyeXB0ZWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmlzRW5jcnlwdGVkfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9J214X0NyZWF0ZVJvb21EaWFsb2dfZTJlU3dpdGNoJyAvLyBmb3IgZW5kLXRvLWVuZCB0ZXN0c1xuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUuY2FuQ2hhbmdlRW5jcnlwdGlvbn1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxwPnsgbWljcm9jb3B5IH08L3A+XG4gICAgICAgICAgICA8L1JlYWN0LkZyYWdtZW50PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBmZWRlcmF0ZUxhYmVsID0gX3QoXG4gICAgICAgICAgICBcIllvdSBtaWdodCBlbmFibGUgdGhpcyBpZiB0aGUgcm9vbSB3aWxsIG9ubHkgYmUgdXNlZCBmb3IgY29sbGFib3JhdGluZyB3aXRoIGludGVybmFsIFwiICtcbiAgICAgICAgICAgIFwidGVhbXMgb24geW91ciBob21lc2VydmVyLiBUaGlzIGNhbm5vdCBiZSBjaGFuZ2VkIGxhdGVyLlwiLFxuICAgICAgICApO1xuICAgICAgICBpZiAoU2RrQ29uZmlnLmdldCgpLmRlZmF1bHRfZmVkZXJhdGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBXZSBvbmx5IGNoYW5nZSB0aGUgbGFiZWwgaWYgdGhlIGRlZmF1bHQgc2V0dGluZyBpcyBkaWZmZXJlbnQgdG8gYXZvaWQgamFycmluZyB0ZXh0IGNoYW5nZXMgdG8gdGhlXG4gICAgICAgICAgICAvLyB1c2VyLiBUaGV5IHdpbGwgaGF2ZSByZWFkIHRoZSBpbXBsaWNhdGlvbnMgb2YgdHVybmluZyB0aGlzIG9mZi9vbiwgc28gbm8gbmVlZCB0byByZXBocmFzZSBmb3IgdGhlbS5cbiAgICAgICAgICAgIGZlZGVyYXRlTGFiZWwgPSBfdChcbiAgICAgICAgICAgICAgICBcIllvdSBtaWdodCBkaXNhYmxlIHRoaXMgaWYgdGhlIHJvb20gd2lsbCBiZSB1c2VkIGZvciBjb2xsYWJvcmF0aW5nIHdpdGggZXh0ZXJuYWwgXCIgK1xuICAgICAgICAgICAgICAgIFwidGVhbXMgd2hvIGhhdmUgdGhlaXIgb3duIGhvbWVzZXJ2ZXIuIFRoaXMgY2Fubm90IGJlIGNoYW5nZWQgbGF0ZXIuXCIsXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRpdGxlID0gdGhpcy5zdGF0ZS5pc1B1YmxpYyA/IF90KCdDcmVhdGUgYSBwdWJsaWMgcm9vbScpIDogX3QoJ0NyZWF0ZSBhIHByaXZhdGUgcm9vbScpO1xuICAgICAgICBpZiAoQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlJZCgpKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gQ29tbXVuaXR5UHJvdG90eXBlU3RvcmUuaW5zdGFuY2UuZ2V0U2VsZWN0ZWRDb21tdW5pdHlOYW1lKCk7XG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiQ3JlYXRlIGEgcm9vbSBpbiAlKGNvbW11bml0eU5hbWUpc1wiLCB7Y29tbXVuaXR5TmFtZTogbmFtZX0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nXCIgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXt0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vbk9rfSBvbktleURvd249e3RoaXMuX29uS2V5RG93bn0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZCByZWY9e3JlZiA9PiB0aGlzLl9uYW1lRmllbGRSZWYgPSByZWZ9IGxhYmVsPXsgX3QoJ05hbWUnKSB9IG9uQ2hhbmdlPXt0aGlzLm9uTmFtZUNoYW5nZX0gb25WYWxpZGF0ZT17dGhpcy5vbk5hbWVWYWxpZGF0ZX0gdmFsdWU9e3RoaXMuc3RhdGUubmFtZX0gY2xhc3NOYW1lPVwibXhfQ3JlYXRlUm9vbURpYWxvZ19uYW1lXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWVsZCBsYWJlbD17IF90KCdUb3BpYyAob3B0aW9uYWwpJykgfSBvbkNoYW5nZT17dGhpcy5vblRvcGljQ2hhbmdlfSB2YWx1ZT17dGhpcy5zdGF0ZS50b3BpY30gY2xhc3NOYW1lPVwibXhfQ3JlYXRlUm9vbURpYWxvZ190b3BpY1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TGFiZWxsZWRUb2dnbGVTd2l0Y2ggbGFiZWw9eyBfdChcIk1ha2UgdGhpcyByb29tIHB1YmxpY1wiKX0gb25DaGFuZ2U9e3RoaXMub25QdWJsaWNDaGFuZ2V9IHZhbHVlPXt0aGlzLnN0YXRlLmlzUHVibGljfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBwdWJsaWNQcml2YXRlTGFiZWwgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlMmVlU2VjdGlvbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGFsaWFzRmllbGQgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPGRldGFpbHMgcmVmPXt0aGlzLmNvbGxlY3REZXRhaWxzUmVmfSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3VtbWFyeSBjbGFzc05hbWU9XCJteF9DcmVhdGVSb29tRGlhbG9nX2RldGFpbHNfc3VtbWFyeVwiPnsgdGhpcy5zdGF0ZS5kZXRhaWxzT3BlbiA/IF90KCdIaWRlIGFkdmFuY2VkJykgOiBfdCgnU2hvdyBhZHZhbmNlZCcpIH08L3N1bW1hcnk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPExhYmVsbGVkVG9nZ2xlU3dpdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiQmxvY2sgYW55b25lIG5vdCBwYXJ0IG9mICUoc2VydmVyTmFtZSlzIGZyb20gZXZlciBqb2luaW5nIHRoaXMgcm9vbS5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzZXJ2ZXJOYW1lOiBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uTm9GZWRlcmF0ZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUubm9GZWRlcmF0ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwPntmZWRlcmF0ZUxhYmVsfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGV0YWlscz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9mb3JtPlxuICAgICAgICAgICAgICAgIDxEaWFsb2dCdXR0b25zIHByaW1hcnlCdXR0b249e190KCdDcmVhdGUgUm9vbScpfVxuICAgICAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk9rfVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkNhbmNlbH0gLz5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=