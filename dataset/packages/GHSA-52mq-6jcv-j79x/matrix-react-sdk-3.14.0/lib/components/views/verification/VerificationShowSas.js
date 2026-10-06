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

/*
Copyright 2019 Vector Creations Ltd

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
function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

class VerificationShowSas extends _react.default.Component {
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

} // List of Emoji strings from the js-sdk, for i18n


exports.default = VerificationShowSas;
(0, _defineProperty2.default)(VerificationShowSas, "propTypes", {
  pending: _propTypes.default.bool,
  displayName: _propTypes.default.string,
  // required if pending is true
  device: _propTypes.default.object,
  onDone: _propTypes.default.func.isRequired,
  onCancel: _propTypes.default.func.isRequired,
  sas: _propTypes.default.object.isRequired,
  isSelf: _propTypes.default.bool,
  inDialog: _propTypes.default.bool // whether this component is being shown in a dialog and to use DialogButtons

});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZlcmlmaWNhdGlvbi9WZXJpZmljYXRpb25TaG93U2FzLmpzIl0sIm5hbWVzIjpbImNhcEZpcnN0IiwicyIsImNoYXJBdCIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJWZXJpZmljYXRpb25TaG93U2FzIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwic2V0U3RhdGUiLCJwZW5kaW5nIiwib25Eb25lIiwiY2FuY2VsbGluZyIsIm9uQ2FuY2VsIiwic3RhdGUiLCJjb21wb25lbnRXaWxsTW91bnQiLCJyZW5kZXIiLCJzYXNEaXNwbGF5Iiwic2FzQ2FwdGlvbiIsInNhcyIsImVtb2ppIiwiZW1vamlCbG9ja3MiLCJtYXAiLCJpIiwiaXNTZWxmIiwiZGVjaW1hbCIsIm51bWJlckJsb2NrcyIsIm51bSIsImNvbmZpcm0iLCJ0ZXh0IiwiZGV2aWNlIiwiZGV2aWNlTmFtZSIsImdldERpc3BsYXlOYW1lIiwiZGV2aWNlSWQiLCJkaXNwbGF5TmFtZSIsImluRGlhbG9nIiwib25NYXRjaENsaWNrIiwib25Eb250TWF0Y2hDbGljayIsIlByb3BUeXBlcyIsImJvb2wiLCJzdHJpbmciLCJvYmplY3QiLCJmdW5jIiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVBLFNBQVNBLFFBQVQsQ0FBa0JDLENBQWxCLEVBQXFCO0FBQ2pCLFNBQU9BLENBQUMsQ0FBQ0MsTUFBRixDQUFTLENBQVQsRUFBWUMsV0FBWixLQUE0QkYsQ0FBQyxDQUFDRyxLQUFGLENBQVEsQ0FBUixDQUFuQztBQUNIOztBQUVjLE1BQU1DLG1CQUFOLFNBQWtDQyxlQUFNQyxTQUF4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SjtBQUNBLDBCQUFJLEtBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxLQUFKO0FBQ0EsMEJBQUksVUFBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxPQUFKO0FBQ0EsMEJBQUksU0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxXQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksVUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFlBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxPQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLE9BQUo7QUFDQSwwQkFBSSxLQUFKO0FBQ0EsMEJBQUksU0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxPQUFKO0FBQ0EsMEJBQUksV0FBSjtBQUNBLDBCQUFJLFVBQUo7QUFDQSwwQkFBSSxXQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxZQUFKO0FBQ0EsMEJBQUksTUFBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxXQUFKO0FBQ0EsMEJBQUksVUFBSjtBQUNBLDBCQUFJLE1BQUo7QUFDQSwwQkFBSSxLQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLFdBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksT0FBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxXQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLFFBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLFNBQUo7QUFDQSwwQkFBSSxNQUFKO0FBQ0EsMEJBQUksUUFBSjtBQUNBLDBCQUFJLFlBQUo7QUFDQSwwQkFBSSxRQUFKO0FBQ0EsMEJBQUksS0FBSiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QsIF90ZCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge1BlbmRpbmdBY3Rpb25TcGlubmVyfSBmcm9tIFwiLi4vcmlnaHRfcGFuZWwvRW5jcnlwdGlvbkluZm9cIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nQnV0dG9ucyBmcm9tIFwiLi4vZWxlbWVudHMvRGlhbG9nQnV0dG9uc1wiO1xuaW1wb3J0IHsgZml4dXBDb2xvckZvbnRzIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvRm9udE1hbmFnZXInO1xuXG5mdW5jdGlvbiBjYXBGaXJzdChzKSB7XG4gICAgcmV0dXJuIHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWZXJpZmljYXRpb25TaG93U2FzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBwZW5kaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgZGlzcGxheU5hbWU6IFByb3BUeXBlcy5zdHJpbmcsIC8vIHJlcXVpcmVkIGlmIHBlbmRpbmcgaXMgdHJ1ZVxuICAgICAgICBkZXZpY2U6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgICAgIG9uRG9uZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAgICAgb25DYW5jZWw6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgICAgIHNhczogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBpc1NlbGY6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBpbkRpYWxvZzogUHJvcFR5cGVzLmJvb2wsIC8vIHdoZXRoZXIgdGhpcyBjb21wb25lbnQgaXMgYmVpbmcgc2hvd24gaW4gYSBkaWFsb2cgYW5kIHRvIHVzZSBEaWFsb2dCdXR0b25zXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcGVuZGluZzogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgICAgICAvLyBBcyB0aGlzIGNvbXBvbmVudCBpcyBhbHNvIHVzZWQgYmVmb3JlIGxvZ2luIChkdXJpbmcgY29tcGxldGUgc2VjdXJpdHkpLFxuICAgICAgICAvLyBhbHNvIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgd29ya2luZyBlbW9qaSBmb250IHRvIGRpc3BsYXkgdGhlIFNBUyBlbW9qaXMgaGVyZS5cbiAgICAgICAgLy8gVGhpcyBpcyBhbHNvIGRvbmUgZnJvbSBMb2dnZWRJblZpZXcuXG4gICAgICAgIGZpeHVwQ29sb3JGb250cygpO1xuICAgIH1cblxuICAgIG9uTWF0Y2hDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHBlbmRpbmc6IHRydWUgfSk7XG4gICAgICAgIHRoaXMucHJvcHMub25Eb25lKCk7XG4gICAgfTtcblxuICAgIG9uRG9udE1hdGNoQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBjYW5jZWxsaW5nOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2FuY2VsKCk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHNhc0Rpc3BsYXk7XG4gICAgICAgIGxldCBzYXNDYXB0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zYXMuZW1vamkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVtb2ppQmxvY2tzID0gdGhpcy5wcm9wcy5zYXMuZW1vamkubWFwKFxuICAgICAgICAgICAgICAgIChlbW9qaSwgaSkgPT4gPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzX2Vtb2ppU2FzX2Jsb2NrXCIga2V5PXtpfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzX2Vtb2ppU2FzX2Vtb2ppXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGVtb2ppWzBdIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc19sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge190KGNhcEZpcnN0KGVtb2ppWzFdKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBzYXNEaXNwbGF5ID0gPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzX2Vtb2ppU2FzXCI+XG4gICAgICAgICAgICAgICAge2Vtb2ppQmxvY2tzLnNsaWNlKDAsIDQpfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19lbW9qaVNhc19icmVha1wiIC8+XG4gICAgICAgICAgICAgICAge2Vtb2ppQmxvY2tzLnNsaWNlKDQpfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICAgICAgc2FzQ2FwdGlvbiA9IHRoaXMucHJvcHMuaXNTZWxmID9cbiAgICAgICAgICAgICAgICBfdChcbiAgICAgICAgICAgICAgICAgICAgXCJDb25maXJtIHRoZSBlbW9qaSBiZWxvdyBhcmUgZGlzcGxheWVkIG9uIGJvdGggc2Vzc2lvbnMsIGluIHRoZSBzYW1lIG9yZGVyOlwiLFxuICAgICAgICAgICAgICAgICk6XG4gICAgICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVmVyaWZ5IHRoaXMgdXNlciBieSBjb25maXJtaW5nIHRoZSBmb2xsb3dpbmcgZW1vamkgYXBwZWFyIG9uIHRoZWlyIHNjcmVlbi5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucHJvcHMuc2FzLmRlY2ltYWwpIHtcbiAgICAgICAgICAgIGNvbnN0IG51bWJlckJsb2NrcyA9IHRoaXMucHJvcHMuc2FzLmRlY2ltYWwubWFwKChudW0sIGkpID0+IDxzcGFuIGtleT17aX0+XG4gICAgICAgICAgICAgICAge251bX1cbiAgICAgICAgICAgIDwvc3Bhbj4pO1xuICAgICAgICAgICAgc2FzRGlzcGxheSA9IDxkaXYgY2xhc3NOYW1lPVwibXhfVmVyaWZpY2F0aW9uU2hvd1Nhc19kZWNpbWFsU2FzXCI+XG4gICAgICAgICAgICAgICAge251bWJlckJsb2Nrc31cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgICAgIHNhc0NhcHRpb24gPSB0aGlzLnByb3BzLmlzU2VsZiA/XG4gICAgICAgICAgICAgICAgX3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVmVyaWZ5IHRoaXMgc2Vzc2lvbiBieSBjb25maXJtaW5nIHRoZSBmb2xsb3dpbmcgbnVtYmVyIGFwcGVhcnMgb24gaXRzIHNjcmVlbi5cIixcbiAgICAgICAgICAgICAgICApOlxuICAgICAgICAgICAgICAgIF90KFxuICAgICAgICAgICAgICAgICAgICBcIlZlcmlmeSB0aGlzIHVzZXIgYnkgY29uZmlybWluZyB0aGUgZm9sbG93aW5nIG51bWJlciBhcHBlYXJzIG9uIHRoZWlyIHNjcmVlbi5cIixcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXY+XG4gICAgICAgICAgICAgICAge190KFwiVW5hYmxlIHRvIGZpbmQgYSBzdXBwb3J0ZWQgdmVyaWZpY2F0aW9uIG1ldGhvZC5cIil9XG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD1cInByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2FuY2VsfSBjbGFzc05hbWU9XCJteF9Vc2VySW5mb193aWRlQnV0dG9uXCI+XG4gICAgICAgICAgICAgICAgICAgIHtfdCgnQ2FuY2VsJyl9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNvbmZpcm07XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmcgfHwgdGhpcy5zdGF0ZS5jYW5jZWxsaW5nKSB7XG4gICAgICAgICAgICBsZXQgdGV4dDtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLnBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5pc1NlbGYpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZGV2aWNlIHNob3VsZG4ndCBiZSBudWxsIGluIHRoaXMgc2l0dWF0aW9uIGJ1dCBpdCBjYW4gYmUsIGVnLiBpZiB0aGUgZGV2aWNlIGlzXG4gICAgICAgICAgICAgICAgICAgIC8vIGxvZ2dlZCBvdXQgZHVyaW5nIHZlcmlmaWNhdGlvblxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5kZXZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIldhaXRpbmcgZm9yIHlvdXIgb3RoZXIgc2Vzc2lvbiwgJShkZXZpY2VOYW1lKXMgKCUoZGV2aWNlSWQpcyksIHRvIHZlcmlmeeKAplwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlTmFtZTogdGhpcy5wcm9wcy5kZXZpY2UgPyB0aGlzLnByb3BzLmRldmljZS5nZXREaXNwbGF5TmFtZSgpIDogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGV2aWNlSWQ6IHRoaXMucHJvcHMuZGV2aWNlID8gdGhpcy5wcm9wcy5kZXZpY2UuZGV2aWNlSWQgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiV2FpdGluZyBmb3IgeW91ciBvdGhlciBzZXNzaW9uIHRvIHZlcmlmeeKAplwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHtkaXNwbGF5TmFtZX0gPSB0aGlzLnByb3BzO1xuICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJXYWl0aW5nIGZvciAlKGRpc3BsYXlOYW1lKXMgdG8gdmVyaWZ54oCmXCIsIHtkaXNwbGF5TmFtZX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9IF90KFwiQ2FuY2VsbGluZ+KAplwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbmZpcm0gPSA8UGVuZGluZ0FjdGlvblNwaW5uZXIgdGV4dD17dGV4dH0gLz47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wcy5pbkRpYWxvZykge1xuICAgICAgICAgICAgLy8gRklYTUU6IHN0b3AgdXNpbmcgRGlhbG9nQnV0dG9ucyBoZXJlIG9uY2UgdGhpcyBjb21wb25lbnQgaXMgb25seSB1c2VkIGluIHRoZSByaWdodCBwYW5lbCB2ZXJpZmljYXRpb25cbiAgICAgICAgICAgIGNvbmZpcm0gPSA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFwiVGhleSBtYXRjaFwiKX1cbiAgICAgICAgICAgICAgICBvblByaW1hcnlCdXR0b25DbGljaz17dGhpcy5vbk1hdGNoQ2xpY2t9XG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwibXhfVXNlckluZm9fd2lkZUJ1dHRvbiBteF9WZXJpZmljYXRpb25TaG93U2FzX21hdGNoQnV0dG9uXCJcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b249e190KFwiVGhleSBkb24ndCBtYXRjaFwiKX1cbiAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5vbkRvbnRNYXRjaENsaWNrfVxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvbkNsYXNzPVwibXhfVXNlckluZm9fd2lkZUJ1dHRvbiBteF9WZXJpZmljYXRpb25TaG93U2FzX25vTWF0Y2hCdXR0b25cIlxuICAgICAgICAgICAgLz47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25maXJtID0gPFJlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25Eb250TWF0Y2hDbGlja30ga2luZD1cImRhbmdlclwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhleSBkb24ndCBtYXRjaFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMub25NYXRjaENsaWNrfSBraW5kPVwicHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgICAgICB7IF90KFwiVGhleSBtYXRjaFwiKSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9SZWFjdC5GcmFnbWVudD47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9WZXJpZmljYXRpb25TaG93U2FzXCI+XG4gICAgICAgICAgICA8cD57c2FzQ2FwdGlvbn08L3A+XG4gICAgICAgICAgICB7c2FzRGlzcGxheX1cbiAgICAgICAgICAgIDxwPnt0aGlzLnByb3BzLmlzU2VsZiA/XG4gICAgICAgICAgICAgICAgXCJcIjpcbiAgICAgICAgICAgICAgICBfdChcIlRvIGJlIHNlY3VyZSwgZG8gdGhpcyBpbiBwZXJzb24gb3IgdXNlIGEgdHJ1c3RlZCB3YXkgdG8gY29tbXVuaWNhdGUuXCIpfTwvcD5cbiAgICAgICAgICAgIHtjb25maXJtfVxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuXG4vLyBMaXN0IG9mIEVtb2ppIHN0cmluZ3MgZnJvbSB0aGUganMtc2RrLCBmb3IgaTE4blxuX3RkKFwiRG9nXCIpO1xuX3RkKFwiQ2F0XCIpO1xuX3RkKFwiTGlvblwiKTtcbl90ZChcIkhvcnNlXCIpO1xuX3RkKFwiVW5pY29yblwiKTtcbl90ZChcIlBpZ1wiKTtcbl90ZChcIkVsZXBoYW50XCIpO1xuX3RkKFwiUmFiYml0XCIpO1xuX3RkKFwiUGFuZGFcIik7XG5fdGQoXCJSb29zdGVyXCIpO1xuX3RkKFwiUGVuZ3VpblwiKTtcbl90ZChcIlR1cnRsZVwiKTtcbl90ZChcIkZpc2hcIik7XG5fdGQoXCJPY3RvcHVzXCIpO1xuX3RkKFwiQnV0dGVyZmx5XCIpO1xuX3RkKFwiRmxvd2VyXCIpO1xuX3RkKFwiVHJlZVwiKTtcbl90ZChcIkNhY3R1c1wiKTtcbl90ZChcIk11c2hyb29tXCIpO1xuX3RkKFwiR2xvYmVcIik7XG5fdGQoXCJNb29uXCIpO1xuX3RkKFwiQ2xvdWRcIik7XG5fdGQoXCJGaXJlXCIpO1xuX3RkKFwiQmFuYW5hXCIpO1xuX3RkKFwiQXBwbGVcIik7XG5fdGQoXCJTdHJhd2JlcnJ5XCIpO1xuX3RkKFwiQ29yblwiKTtcbl90ZChcIlBpenphXCIpO1xuX3RkKFwiQ2FrZVwiKTtcbl90ZChcIkhlYXJ0XCIpO1xuX3RkKFwiU21pbGV5XCIpO1xuX3RkKFwiUm9ib3RcIik7XG5fdGQoXCJIYXRcIik7XG5fdGQoXCJHbGFzc2VzXCIpO1xuX3RkKFwiU3Bhbm5lclwiKTtcbl90ZChcIlNhbnRhXCIpO1xuX3RkKFwiVGh1bWJzIHVwXCIpO1xuX3RkKFwiVW1icmVsbGFcIik7XG5fdGQoXCJIb3VyZ2xhc3NcIik7XG5fdGQoXCJDbG9ja1wiKTtcbl90ZChcIkdpZnRcIik7XG5fdGQoXCJMaWdodCBidWxiXCIpO1xuX3RkKFwiQm9va1wiKTtcbl90ZChcIlBlbmNpbFwiKTtcbl90ZChcIlBhcGVyY2xpcFwiKTtcbl90ZChcIlNjaXNzb3JzXCIpO1xuX3RkKFwiTG9ja1wiKTtcbl90ZChcIktleVwiKTtcbl90ZChcIkhhbW1lclwiKTtcbl90ZChcIlRlbGVwaG9uZVwiKTtcbl90ZChcIkZsYWdcIik7XG5fdGQoXCJUcmFpblwiKTtcbl90ZChcIkJpY3ljbGVcIik7XG5fdGQoXCJBZXJvcGxhbmVcIik7XG5fdGQoXCJSb2NrZXRcIik7XG5fdGQoXCJUcm9waHlcIik7XG5fdGQoXCJCYWxsXCIpO1xuX3RkKFwiR3VpdGFyXCIpO1xuX3RkKFwiVHJ1bXBldFwiKTtcbl90ZChcIkJlbGxcIik7XG5fdGQoXCJBbmNob3JcIik7XG5fdGQoXCJIZWFkcGhvbmVzXCIpO1xuX3RkKFwiRm9sZGVyXCIpO1xuX3RkKFwiUGluXCIpO1xuIl19