"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _EncryptionInfo = require("../right_panel/EncryptionInfo");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _DialogButtons = _interopRequireDefault(require("../elements/DialogButtons"));

var _FontManager = require("../../../utils/FontManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

let VerificationShowSas = (_dec = (0, _replaceableComponent.replaceableComponent)("views.verification.VerificationShowSas"), _dec(_class = (_temp = _class2 = class VerificationShowSas extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onMatchClick", () => {
      this.setState({
        pending: true
      });
      this.props.onDone();
    });
    (0, _defineProperty2.default)(this, "onDontMatchClick", () => {
      this.setState({
        cancelling: true
      });
      this.props.onCancel();
    });
    this.state = {
      pending: false
    };
  }

  componentWillMount() {
    // As this component is also used before login (during complete security),
    // also make sure we have a working emoji font to display the SAS emojis here.
    // This is also done from LoggedInView.
    (0, _FontManager.fixupColorFonts)();
  }

  render() {
    let sasDisplay;
    let sasCaption;

    if (this.props.sas.emoji) {
      const emojiBlocks = this.props.sas.emoji.map((emoji, i) => /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_block",
        key: i
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_emoji"
      }, emoji[0]), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_label"
      }, (0, _languageHandler._t)(capFirst(emoji[1])))));
      sasDisplay = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas"
      }, emojiBlocks.slice(0, 4), /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_emojiSas_break"
      }), emojiBlocks.slice(4));
      sasCaption = this.props.isSelf ? (0, _languageHandler._t)("Confirm the emoji below are displayed on both sessions, in the same order:") : (0, _languageHandler._t)("Verify this user by confirming the following emoji appear on their screen.");
    } else if (this.props.sas.decimal) {
      const numberBlocks = this.props.sas.decimal.map((num, i) => /*#__PURE__*/_react.default.createElement("span", {
        key: i
      }, num));
      sasDisplay = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VerificationShowSas_decimalSas"
      }, numberBlocks);
      sasCaption = this.props.isSelf ? (0, _languageHandler._t)("Verify this session by confirming the following number appears on its screen.") : (0, _languageHandler._t)("Verify this user by confirming the following number appears on their screen.");
    } else {
      return /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Unable to find a supported verification method."), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        kind: "primary",
        onClick: this.props.onCancel,
        className: "mx_UserInfo_wideButton"
      }, (0, _languageHandler._t)('Cancel')));
    }

    let confirm;

    if (this.state.pending || this.state.cancelling) {
      let text;

      if (this.state.pending) {
        if (this.props.isSelf) {
          // device shouldn't be null in this situation but it can be, eg. if the device is
          // logged out during verification
          if (this.props.device) {
            text = (0, _languageHandler._t)("Waiting for your other session, %(deviceName)s (%(deviceId)s), to verify…", {
              deviceName: this.props.device ? this.props.device.getDisplayName() : '',
              deviceId: this.props.device ? this.props.device.deviceId : ''
            });
          } else {
            text = (0, _languageHandler._t)("Waiting for your other session to verify…");
          }
        } else {
          const {
            displayName
          } = this.props;
          text = (0, _languageHandler._t)("Waiting for %(displayName)s to verify…", {
            displayName
          });
        }
      } else {
        text = (0, _languageHandler._t)("Cancelling…");
      }

      confirm = /*#__PURE__*/_react.default.createElement(_EncryptionInfo.PendingActionSpinner, {
        text: text
      });
    } else if (this.props.inDialog) {
      // FIXME: stop using DialogButtons here once this component is only used in the right panel verification
      confirm = /*#__PURE__*/_react.default.createElement(_DialogButtons.default, {
        primaryButton: (0, _languageHandler._t)("They match"),
        onPrimaryButtonClick: this.onMatchClick,
        primaryButtonClass: "mx_UserInfo_wideButton mx_VerificationShowSas_matchButton",
        cancelButton: (0, _languageHandler._t)("They don't match"),
        onCancel: this.onDontMatchClick,
        cancelButtonClass: "mx_UserInfo_wideButton mx_VerificationShowSas_noMatchButton"
      });
    } else {
      confirm = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onDontMatchClick,
        kind: "danger"
      }, (0, _languageHandler._t)("They don't match")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this.onMatchClick,
        kind: "primary"
      }, (0, _languageHandler._t)("They match")));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_VerificationShowSas"
    }, /*#__PURE__*/_react.default.createElement("p", null, sasCaption), sasDisplay, /*#__PURE__*/_react.default.createElement("p", null, this.props.isSelf ? "" : (0, _languageHandler._t)("To be secure, do this in person or use a trusted way to communicate.")), confirm);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  pending: _propTypes.default.bool,
  displayName: _propTypes.default.string,
  // required if pending is true
  device: _propTypes.default.object,
  onDone: _propTypes.default.func.isRequired,
  onCancel: _propTypes.default.func.isRequired,
  sas: _propTypes.default.object.isRequired,
  isSelf: _propTypes.default.bool,
  inDialog: _propTypes.default.bool // whether this component is being shown in a dialog and to use DialogButtons

}), _temp)) || _class);
exports.default = VerificationShowSas;
// List of Emoji strings from the js-sdk, for i18n
(0, _languageHandler._td)("Dog");
(0, _languageHandler._td)("Cat");
(0, _languageHandler._td)("Lion");
(0, _languageHandler._td)("Horse");
(0, _languageHandler._td)("Unicorn");
(0, _languageHandler._td)("Pig");
(0, _languageHandler._td)("Elephant");
(0, _languageHandler._td)("Rabbit");
(0, _languageHandler._td)("Panda");
(0, _languageHandler._td)("Rooster");
(0, _languageHandler._td)("Penguin");
(0, _languageHandler._td)("Turtle");
(0, _languageHandler._td)("Fish");
(0, _languageHandler._td)("Octopus");
(0, _languageHandler._td)("Butterfly");
(0, _languageHandler._td)("Flower");
(0, _languageHandler._td)("Tree");
(0, _languageHandler._td)("Cactus");
(0, _languageHandler._td)("Mushroom");
(0, _languageHandler._td)("Globe");
(0, _languageHandler._td)("Moon");
(0, _languageHandler._td)("Cloud");
(0, _languageHandler._td)("Fire");
(0, _languageHandler._td)("Banana");
(0, _languageHandler._td)("Apple");
(0, _languageHandler._td)("Strawberry");
(0, _languageHandler._td)("Corn");
(0, _languageHandler._td)("Pizza");
(0, _languageHandler._td)("Cake");
(0, _languageHandler._td)("Heart");
(0, _languageHandler._td)("Smiley");
(0, _languageHandler._td)("Robot");
(0, _languageHandler._td)("Hat");
(0, _languageHandler._td)("Glasses");
(0, _languageHandler._td)("Spanner");
(0, _languageHandler._td)("Santa");
(0, _languageHandler._td)("Thumbs up");
(0, _languageHandler._td)("Umbrella");
(0, _languageHandler._td)("Hourglass");
(0, _languageHandler._td)("Clock");
(0, _languageHandler._td)("Gift");
(0, _languageHandler._td)("Light bulb");
(0, _languageHandler._td)("Book");
(0, _languageHandler._td)("Pencil");
(0, _languageHandler._td)("Paperclip");
(0, _languageHandler._td)("Scissors");
(0, _languageHandler._td)("Lock");
(0, _languageHandler._td)("Key");
(0, _languageHandler._td)("Hammer");
(0, _languageHandler._td)("Telephone");
(0, _languageHandler._td)("Flag");
(0, _languageHandler._td)("Train");
(0, _languageHandler._td)("Bicycle");
(0, _languageHandler._td)("Aeroplane");
(0, _languageHandler._td)("Rocket");
(0, _languageHandler._td)("Trophy");
(0, _languageHandler._td)("Ball");
(0, _languageHandler._td)("Guitar");
(0, _languageHandler._td)("Trumpet");
(0, _languageHandler._td)("Bell");
(0, _languageHandler._td)("Anchor");
(0, _languageHandler._td)("Headphones");
(0, _languageHandler._td)("Folder");
(0, _languageHandler._td)("Pin");
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZlcmlmaWNhdGlvbi9WZXJpZmljYXRpb25TaG93U2FzLmpzIl0sIm5hbWVzIjpbImNhcEZpcnN0IiwicyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJWZXJpZmljYXRpb25TaG93U2FzIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJwZW5kaW5nIiwib25Eb25lIiwiY2FuY2VsbGluZyIsIm9uQ2FuY2VsIiwic3RhdGUiLCJjb21wb25lbnRXaWxsTW91bnQiLCJyZW5kZXIiLCJzYXNEaXNwbGF5Iiwic2FzQ2FwdGlvbiIsInNhcyIsImVtb2ppIiwiZW1vamlCbG9ja3MiLCJtYXAiLCJpIiwiaXNTZWxmIiwiZGVjaW1hbCIsIm51bWJlckJsb2NrcyIsIm51bSIsImNvbmZpcm0iLCJ0ZXh0IiwiZGV2aWNlIiwiZGV2aWNlTmFtZSIsImdldERpc3BsYXlOYW1lIiwiZGV2aWNlSWQiLCJkaXNwbGF5TmFtZSIsImluRGlhbG9nIiwib25NYXRjaENsaWNrIiwib25Eb250TWF0Y2hDbGljayIsIlByb3BUeXBlcyIsImJvb2wiLCJzdHJpbmciLCJvYmplY3QiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxDQUFsQixFQUFxQjtBQUNqQixTQUFPQSxDQUFDLENBQUNDLE1BQUYsQ0FBUyxDQUFULEVBQVlDLFdBQVosS0FBNEJGLENBQUMsQ0FBQ0csS0FBRixDQUFRLENBQVIsQ0FBbkM7QUFDSDs7SUFHb0JDLG1CLFdBRHBCLGdEQUFxQix3Q0FBckIsQyxtQ0FBRCxNQUNxQkEsbUJBRHJCLFNBQ2lEQyxlQUFNQyxTQUR2RCxDQUNpRTtBQVk3REMsRUFBQUEsV0FBVyxDQUFDQyxL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QUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksS0FBSjtBQUNBLDBCQUFJLFVBQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksV0FBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLFVBQUo7QUFDQSwwQkFBSSxPQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxZQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxPQUFKO0FBQ0EsMEJBQUksS0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFdBQUo7QUFDQSwwQkFBSSxVQUFKO0FBQ0EsMEJBQUksV0FBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksWUFBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksV0FBSjtBQUNBLDBCQUFJLFVBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksS0FBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxXQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksV0FBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxTQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxZQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLEtBQUoiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90LCBfdGQgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtQZW5kaW5nQWN0aW9uU3Bpbm5lcn0gZnJvbSBcIi4uL3JpZ2h0X3BhbmVsL0VuY3J5cHRpb25JbmZvXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IERpYWxvZ0J1dHRvbnMgZnJvbSBcIi4uL2VsZW1lbnRzL0RpYWxvZ0J1dHRvbnNcIjtcbmltcG9ydCB7IGZpeHVwQ29sb3JGb250cyB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0ZvbnRNYW5hZ2VyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5mdW5jdGlvbiBjYXBGaXJzdChzKSB7XG4gICAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy52ZXJpZmljYXRpb24uVmVyaWZpY2F0aW9uU2hvd1Nhc1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVyaWZpY2F0aW9uU2hvd1NhcyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgcGVuZGluZzogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGRpc3BsYXlOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLCAvLyByZXF1aXJlZCBpZiBwZW5kaW5nIGlzIHRydWVcbiAgICAgICAgZGV2aWNlOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBvbkRvbmU6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uQ2FuY2VsOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBzYXM6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgaXNTZWxmOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgaW5EaWFsb2c6IFByb3BUeXBlcy5ib29sLCAvLyB3aGV0aGVyIHRoaXMgY29tcG9uZW50IGlzIGJlaW5nIHNob3duIGluIGEgZGlhbG9nIGFuZCB0byB1c2UgRGlhbG9nQnV0dG9uc1xuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBlbmRpbmc6IGZhbHNlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICAgICAgLy8gQXMgdGhpcyBjb21wb25lbnQgaXMgYWxzbyB1c2VkIGJlZm9yZSBsb2dpbiAoZHVyaW5nIGNvbXBsZXRlIHNlY3VyaXR5KSxcbiAgICAgICAgLy8gYWxzbyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHdvcmtpbmcgZW1vamkgZm9udCB0byBkaXNwbGF5IHRoZSBTQVMgZW1vamlzIGhlcmUuXG4gICAgICAgIC8vIFRoaXMgaXMgYWxzbyBkb25lIGZyb20gTG9nZ2VkSW5WaWV3LlxuICAgICAgICBmaXh1cENvbG9yRm9udHMoKTtcbiAgICB9XG5cbiAgICBvbk1hdGNoQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBwZW5kaW5nOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uRG9uZSgpO1xuICAgIH07XG5cbiAgICBvbkRvbnRNYXRjaENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgY2FuY2VsbGluZzogdHJ1ZSB9KTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBzYXNEaXNwbGF5O1xuICAgICAgICBsZXQgc2FzQ2FwdGlvbjtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc2FzLmVtb2ppKSB7XG4gICAgICAgICAgICBjb25zdCBlbW9qaUJsb2NrcyA9IHRoaXMucHJvcHMuc2FzLmVtb2ppLm1hcChcbiAgICAgICAgICAgICAgICAoZW1vamksIGkpID0+IDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc19ibG9ja1wiIGtleT17aX0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc19lbW9qaVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBlbW9qaVswXSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblNob3dTYXNfZW1vamlTYXNfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChjYXBGaXJzdChlbW9qaVsxXSkpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc2FzRGlzcGxheSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc1wiPlxuICAgICAgICAgICAgICAgIHtlbW9qaUJsb2Nrcy5zbGljZSgwLCA0KX1cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblNob3dTYXNfZW1vamlTYXNfYnJlYWtcIiAvPlxuICAgICAgICAgICAgICAgIHtlbW9qaUJsb2Nrcy5zbGljZSg0KX1cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIHNhc0NhcHRpb24gPSB0aGlzLnByb3BzLmlzU2VsZiA/XG4gICAgICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiQ29uZmlybSB0aGUgZW1vamkgYmVsb3cgYXJlIGRpc3BsYXllZCBvbiBib3RoIHNlc3Npb25zLCBpbiB0aGUgc2FtZSBvcmRlcjpcIixcbiAgICAgICAgICAgICAgICApOlxuICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICBcIlZlcmlmeSB0aGlzIHVzZXIgYnkgY29uZmlybWluZyB0aGUgZm9sbG93aW5nIGVtb2ppIGFwcGVhciBvbiB0aGVpciBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByb3BzLnNhcy5kZWNpbWFsKSB7XG4gICAgICAgICAgICBjb25zdCBudW1iZXJCbG9ja3MgPSB0aGlzLnByb3BzLnNhcy5kZWNpbWFsLm1hcCgobnVtLCBpKSA9PiA8c3BhbiBrZXk9e2l9PlxuICAgICAgICAgICAgICAgIHtudW19XG4gICAgICAgICAgICA8L3NwYW4+KTtcbiAgICAgICAgICAgIHNhc0Rpc3BsYXkgPSA8ZGl2IGNsYXNzTmFtZT1cIm14X1ZlcmlmaWNhdGlvblNob3dTYXNfZGVjaW1hbFNhc1wiPlxuICAgICAgICAgICAgICAgIHtudW1iZXJCbG9ja3N9XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgICAgICBzYXNDYXB0aW9uID0gdGhpcy5wcm9wcy5pc1NlbGYgP1xuICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICBcIlZlcmlmeSB0aGlzIHNlc3Npb24gYnkgY29uZmlybWluZyB0aGUgZm9sbG93aW5nIG51bWJlciBhcHBlYXJzIG9uIGl0cyBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTpcbiAgICAgICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJWZXJpZnkgdGhpcyB1c2VyIGJ5IGNvbmZpcm1pbmcgdGhlIGZvbGxvd2luZyBudW1iZXIgYXBwZWFycyBvbiB0aGVpciBzY3JlZW4uXCIsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiA8ZGl2PlxuICAgICAgICAgICAgICAgIHtfdChcIlVuYWJsZSB0byBmaW5kIGEgc3VwcG9ydGVkIHZlcmlmaWNhdGlvbiBtZXRob2QuXCIpfVxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5wcm9wcy5vbkNhbmNlbH0gY2xhc3NOYW1lPVwibXhfVXNlckluZm9fd2lkZUJ1dHRvblwiPlxuICAgICAgICAgICAgICAgICAgICB7X3QoJ0NhbmNlbCcpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBjb25maXJtO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nIHx8IHRoaXMuc3RhdGUuY2FuY2VsbGluZykge1xuICAgICAgICAgICAgbGV0IHRleHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5wZW5kaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuaXNTZWxmKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGRldmljZSBzaG91bGRuJ3QgYmUgbnVsbCBpbiB0aGlzIHNpdHVhdGlvbiBidXQgaXQgY2FuIGJlLCBlZy4gaWYgdGhlIGRldmljZSBpc1xuICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZWQgb3V0IGR1cmluZyB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJXYWl0aW5nIGZvciB5b3VyIG90aGVyIHNlc3Npb24sICUoZGV2aWNlTmFtZSlzICglKGRldmljZUlkKXMpLCB0byB2ZXJpZnnigKZcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZU5hbWU6IHRoaXMucHJvcHMuZGV2aWNlID8gdGhpcy5wcm9wcy5kZXZpY2UuZ2V0RGlzcGxheU5hbWUoKSA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldmljZUlkOiB0aGlzLnByb3BzLmRldmljZSA/IHRoaXMucHJvcHMuZGV2aWNlLmRldmljZUlkIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIldhaXRpbmcgZm9yIHlvdXIgb3RoZXIgc2Vzc2lvbiB0byB2ZXJpZnnigKZcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB7ZGlzcGxheU5hbWV9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiV2FpdGluZyBmb3IgJShkaXNwbGF5TmFtZSlzIHRvIHZlcmlmeeKAplwiLCB7ZGlzcGxheU5hbWV9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIkNhbmNlbGxpbmfigKZcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25maXJtID0gPFBlbmRpbmdBY3Rpb25TcGlubmVyIHRleHQ9e3RleHR9IC8+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuaW5EaWFsb2cpIHtcbiAgICAgICAgICAgIC8vIEZJWE1FOiBzdG9wIHVzaW5nIERpYWxvZ0J1dHRvbnMgaGVyZSBvbmNlIHRoaXMgY29tcG9uZW50IGlzIG9ubHkgdXNlZCBpbiB0aGUgcmlnaHQgcGFuZWwgdmVyaWZpY2F0aW9uXG4gICAgICAgICAgICBjb25maXJtID0gPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICBwcmltYXJ5QnV0dG9uPXtfdChcIlRoZXkgbWF0Y2hcIil9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMub25NYXRjaENsaWNrfVxuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzcz1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b24gbXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19tYXRjaEJ1dHRvblwiXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uPXtfdChcIlRoZXkgZG9uJ3QgbWF0Y2hcIil9XG4gICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMub25Eb250TWF0Y2hDbGlja31cbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25DbGFzcz1cIm14X1VzZXJJbmZvX3dpZGVCdXR0b24gbXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19ub01hdGNoQnV0dG9uXCJcbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uZmlybSA9IDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uRG9udE1hdGNoQ2xpY2t9IGtpbmQ9XCJkYW5nZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRoZXkgZG9uJ3QgbWF0Y2hcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uTWF0Y2hDbGlja30ga2luZD1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdChcIlRoZXkgbWF0Y2hcIikgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc1wiPlxuICAgICAgICAgICAgPHA+e3Nhc0NhcHRpb259PC9wPlxuICAgICAgICAgICAge3Nhc0Rpc3BsYXl9XG4gICAgICAgICAgICA8cD57dGhpcy5wcm9wcy5pc1NlbGYgP1xuICAgICAgICAgICAgICAgIFwiXCI6XG4gICAgICAgICAgICAgICAgX3QoXCJUbyBiZSBzZWN1cmUsIGRvIHRoaXMgaW4gcGVyc29uIG9yIHVzZSBhIHRydXN0ZWQgd2F5IHRvIGNvbW11bmljYXRlLlwiKX08L3A+XG4gICAgICAgICAgICB7Y29uZmlybX1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cblxuLy8gTGlzdCBvZiBFbW9qaSBzdHJpbmdzIGZyb20gdGhlIGpzLXNkaywgZm9yIGkxOG5cbl90ZChcIkRvZ1wiKTtcbl90ZChcIkNhdFwiKTtcbl90ZChcIkxpb25cIik7XG5fdGQoXCJIb3JzZVwiKTtcbl90ZChcIlVuaWNvcm5cIik7XG5fdGQoXCJQaWdcIik7XG5fdGQoXCJFbGVwaGFudFwiKTtcbl90ZChcIlJhYmJpdFwiKTtcbl90ZChcIlBhbmRhXCIpO1xuX3RkKFwiUm9vc3RlclwiKTtcbl90ZChcIlBlbmd1aW5cIik7XG5fdGQoXCJUdXJ0bGVcIik7XG5fdGQoXCJGaXNoXCIpO1xuX3RkKFwiT2N0b3B1c1wiKTtcbl90ZChcIkJ1dHRlcmZseVwiKTtcbl90ZChcIkZsb3dlclwiKTtcbl90ZChcIlRyZWVcIik7XG5fdGQoXCJDYWN0dXNcIik7XG5fdGQoXCJNdXNocm9vbVwiKTtcbl90ZChcIkdsb2JlXCIpO1xuX3RkKFwiTW9vblwiKTtcbl90ZChcIkNsb3VkXCIpO1xuX3RkKFwiRmlyZVwiKTtcbl90ZChcIkJhbmFuYVwiKTtcbl90ZChcIkFwcGxlXCIpO1xuX3RkKFwiU3RyYXdiZXJyeVwiKTtcbl90ZChcIkNvcm5cIik7XG5fdGQoXCJQaXp6YVwiKTtcbl90ZChcIkNha2VcIik7XG5fdGQoXCJIZWFydFwiKTtcbl90ZChcIlNtaWxleVwiKTtcbl90ZChcIlJvYm90XCIpO1xuX3RkKFwiSGF0XCIpO1xuX3RkKFwiR2xhc3Nlc1wiKTtcbl90ZChcIlNwYW5uZXJcIik7XG5fdGQoXCJTYW50YVwiKTtcbl90ZChcIlRodW1icyB1cFwiKTtcbl90ZChcIlVtYnJlbGxhXCIpO1xuX3RkKFwiSG91cmdsYXNzXCIpO1xuX3RkKFwiQ2xvY2tcIik7XG5fdGQoXCJHaWZ0XCIpO1xuX3RkKFwiTGlnaHQgYnVsYlwiKTtcbl90ZChcIkJvb2tcIik7XG5fdGQoXCJQZW5jaWxcIik7XG5fdGQoXCJQYXBlcmNsaXBcIik7XG5fdGQoXCJTY2lzc29yc1wiKTtcbl90ZChcIkxvY2tcIik7XG5fdGQoXCJLZXlcIik7XG5fdGQoXCJIYW1tZXJcIik7XG5fdGQoXCJUZWxlcGhvbmVcIik7XG5fdGQoXCJGbGFnXCIpO1xuX3RkKFwiVHJhaW5cIik7XG5fdGQoXCJCaWN5Y2xlXCIpO1xuX3RkKFwiQWVyb3BsYW5lXCIpO1xuX3RkKFwiUm9ja2V0XCIpO1xuX3RkKFwiVHJvcGh5XCIpO1xuX3RkKFwiQmFsbFwiKTtcbl90ZChcIkd1aXRhclwiKTtcbl90ZChcIlRydW1wZXRcIik7XG5fdGQoXCJCZWxsXCIpO1xuX3RkKFwiQW5jaG9yXCIpO1xuX3RkKFwiSGVhZHBob25lc1wiKTtcbl90ZChcIkZvbGRlclwiKTtcbl90ZChcIlBpblwiKTtcbiJdfQ==