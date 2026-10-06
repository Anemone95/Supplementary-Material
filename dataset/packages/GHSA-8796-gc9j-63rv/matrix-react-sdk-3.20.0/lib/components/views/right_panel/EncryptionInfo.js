"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.PendingActionSpinner = void 0;

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const PendingActionSpinner = ({
  text
}) => {
  const Spinner = sdk.getComponent('elements.Spinner');
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_EncryptionInfo_spinner"
  }, /*#__PURE__*/_react.default.createElement(Spinner, null), text);
};

exports.PendingActionSpinner = PendingActionSpinner;

const EncryptionInfo
/*: React.FC<IProps>*/
= ({
  waitingForOtherParty,
  waitingForNetwork,
  member,
  onStartVerification,
  isRoomEncrypted,
  inDialog,
  isSelfVerification
}
/*: IProps*/
) => {
  let content
  /*: JSX.Element*/
  ;

  if (waitingForOtherParty || waitingForNetwork) {
    let text
    /*: string*/
    ;

    if (waitingForOtherParty) {
      if (isSelfVerification) {
        text = (0, _languageHandler._t)("Accept on your other login…");
      } else {
        text = (0, _languageHandler._t)("Waiting for %(displayName)s to accept…", {
          displayName: member.displayName || member.name || member.userId
        });
      }
    } else {
      text = (0, _languageHandler._t)("Accepting…");
    }

    content = /*#__PURE__*/_react.default.createElement(PendingActionSpinner, {
      text: text
    });
  } else {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    content = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary",
      className: "mx_UserInfo_wideButton",
      onClick: onStartVerification
    }, (0, _languageHandler._t)("Start Verification"));
  }

  let description
  /*: JSX.Element*/
  ;

  if (isRoomEncrypted) {
    description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Messages in this room are end-to-end encrypted.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Your messages are secured and only you and the recipient have " + "the unique keys to unlock them.")));
  } else {
    description = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Messages in this room are not end-to-end encrypted.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("In encrypted rooms, your messages are secured and only you and the recipient have " + "the unique keys to unlock them.")));
  }

  if (inDialog) {
    return content;
  }

  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Encryption")), description), /*#__PURE__*/_react.default.createElement("div", {
    className: "mx_UserInfo_container"
  }, /*#__PURE__*/_react.default.createElement("h3", null, (0, _languageHandler._t)("Verify User")), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("For extra security, verify this user by checking a one-time code on both of your devices.")), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("To be secure, do this in person or use a trusted way to communicate.")), content)));
};

var _default = EncryptionInfo;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3JpZ2h0X3BhbmVsL0VuY3J5cHRpb25JbmZvLnRzeCJdLCJuYW1lcyI6WyJQZW5kaW5nQWN0aW9uU3Bpbm5lciIsInRleHQiLCJTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRW5jcnlwdGlvbkluZm8iLCJ3YWl0aW5nRm9yT3RoZXJQYXJ0eSIsIndhaXRpbmdGb3JOZXR3b3JrIiwibWVtYmVyIiwib25TdGFydFZlcmlmaWNhdGlvbiIsImlzUm9vbUVuY3J5cHRlZCIsImluRGlhbG9nIiwiaXNTZWxmVmVyaWZpY2F0aW9uIiwiY29udGVudCIsImRpc3BsYXlOYW1lIiwibmFtZSIsInVzZXJJZCIsIkFjY2Vzc2libGVCdXR0b24iLCJkZXNjcmlwdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBRUE7O0FBQ0E7O0FBbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFPLE1BQU1BLG9CQUFvQixHQUFHLENBQUM7QUFBQ0MsRUFBQUE7QUFBRCxDQUFELEtBQVk7QUFDNUMsUUFBTUMsT0FBTyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBQ0Esc0JBQU87QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLGtCQUNILDZCQUFDLE9BQUQsT0FERyxFQUVESCxJQUZDLENBQVA7QUFJSCxDQU5NOzs7O0FBa0JQLE1BQU1JO0FBQWdDO0FBQUEsRUFBRyxDQUFDO0FBQ3RDQyxFQUFBQSxvQkFEc0M7QUFFdENDLEVBQUFBLGlCQUZzQztBQUd0Q0MsRUFBQUEsTUFIc0M7QUFJdENDLEVBQUFBLG1CQUpzQztBQUt0Q0MsRUFBQUEsZUFMc0M7QUFNdENDLEVBQUFBLFFBTnNDO0FBT3RDQyxFQUFBQTtBQVBzQztBQUFEO0FBQUEsS0FRM0I7QUFDVixNQUFJQztBQUFvQjtBQUF4Qjs7QUFDQSxNQUFJUCxvQkFBb0IsSUFBSUMsaUJBQTVCLEVBQStDO0FBQzNDLFFBQUlOO0FBQVk7QUFBaEI7O0FBQ0EsUUFBSUssb0JBQUosRUFBMEI7QUFDdEIsVUFBSU0sa0JBQUosRUFBd0I7QUFDcEJYLFFBQUFBLElBQUksR0FBRyx5QkFBRyw2QkFBSCxDQUFQO0FBQ0gsT0FGRCxNQUVPO0FBQ0hBLFFBQUFBLElBQUksR0FBRyx5QkFBRyx3Q0FBSCxFQUE2QztBQUNoRGEsVUFBQUEsV0FBVyxFQUFFTixNQUFNLENBQUNNLFdBQVAsSUFBc0JOLE1BQU0sQ0FBQ08sSUFBN0IsSUFBcUNQLE1BQU0sQ0FBQ1E7QUFEVCxTQUE3QyxDQUFQO0FBR0g7QUFDSixLQVJELE1BUU87QUFDSGYsTUFBQUEsSUFBSSxHQUFHLHlCQUFHLFlBQUgsQ0FBUDtBQUNIOztBQUNEWSxJQUFBQSxPQUFPLGdCQUFHLDZCQUFDLG9CQUFEO0FBQXNCLE1BQUEsSUFBSSxFQUFFWjtBQUE1QixNQUFWO0FBQ0gsR0FkRCxNQWNPO0FBQ0gsVUFBTWdCLGdCQUFnQixHQUFHZCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsMkJBQWpCLENBQXpCO0FBQ0FTLElBQUFBLE9BQU8sZ0JBQ0gsNkJBQUMsZ0JBQUQ7QUFBa0IsTUFBQSxJQUFJLEVBQUMsU0FBdkI7QUFBaUMsTUFBQSxTQUFTLEVBQUMsd0JBQTNDO0FBQW9FLE1BQUEsT0FBTyxFQUFFSjtBQUE3RSxPQUNLLHlCQUFHLG9CQUFILENBREwsQ0FESjtBQUtIOztBQUVELE1BQUlTO0FBQXdCO0FBQTVCOztBQUNBLE1BQUlSLGVBQUosRUFBcUI7QUFDakJRLElBQUFBLFdBQVcsZ0JBQ1AsdURBQ0ksd0NBQUkseUJBQUcsaURBQUgsQ0FBSixDQURKLGVBRUksd0NBQUkseUJBQUcsbUVBQ0gsaUNBREEsQ0FBSixDQUZKLENBREo7QUFPSCxHQVJELE1BUU87QUFDSEEsSUFBQUEsV0FBVyxnQkFDUCx1REFDSSx3Q0FBSSx5QkFBRyxxREFBSCxDQUFKLENBREosZUFFSSx3Q0FBSSx5QkFBRyx1RkFDSCxpQ0FEQSxDQUFKLENBRkosQ0FESjtBQU9IOztBQUVELE1BQUlQLFFBQUosRUFBYztBQUNWLFdBQU9FLE9BQVA7QUFDSDs7QUFFRCxzQkFBTyw2QkFBQyxjQUFELENBQU8sUUFBUCxxQkFDSDtBQUFLLElBQUEsU0FBUyxFQUFDO0FBQWYsa0JBQ0kseUNBQUsseUJBQUcsWUFBSCxDQUFMLENBREosRUFFTUssV0FGTixDQURHLGVBS0g7QUFBSyxJQUFBLFNBQVMsRUFBQztBQUFmLGtCQUNJLHlDQUFLLHlCQUFHLGFBQUgsQ0FBTCxDQURKLGVBRUksdURBQ0ksd0NBQUkseUJBQUcsMkZBQUgsQ0FBSixDQURKLGVBRUksd0NBQUkseUJBQUcsc0VBQUgsQ0FBSixDQUZKLEVBR01MLE9BSE4sQ0FGSixDQUxHLENBQVA7QUFjSCxDQXRFRDs7ZUF3RWVSLGMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7Um9vbU1lbWJlcn0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tLW1lbWJlclwiO1xuXG5leHBvcnQgY29uc3QgUGVuZGluZ0FjdGlvblNwaW5uZXIgPSAoe3RleHR9KSA9PiB7XG4gICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcbiAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9FbmNyeXB0aW9uSW5mb19zcGlubmVyXCI+XG4gICAgICAgIDxTcGlubmVyIC8+XG4gICAgICAgIHsgdGV4dCB9XG4gICAgPC9kaXY+O1xufTtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgd2FpdGluZ0Zvck90aGVyUGFydHk6IGJvb2xlYW47XG4gICAgd2FpdGluZ0Zvck5ldHdvcms6IGJvb2xlYW47XG4gICAgbWVtYmVyOiBSb29tTWVtYmVyO1xuICAgIG9uU3RhcnRWZXJpZmljYXRpb246ICgpID0+IFByb21pc2U8dm9pZD47XG4gICAgaXNSb29tRW5jcnlwdGVkOiBib29sZWFuO1xuICAgIGluRGlhbG9nOiBib29sZWFuO1xuICAgIGlzU2VsZlZlcmlmaWNhdGlvbjogYm9vbGVhbjtcbn1cblxuY29uc3QgRW5jcnlwdGlvbkluZm86IFJlYWN0LkZDPElQcm9wcz4gPSAoe1xuICAgIHdhaXRpbmdGb3JPdGhlclBhcnR5LFxuICAgIHdhaXRpbmdGb3JOZXR3b3JrLFxuICAgIG1lbWJlcixcbiAgICBvblN0YXJ0VmVyaWZpY2F0aW9uLFxuICAgIGlzUm9vbUVuY3J5cHRlZCxcbiAgICBpbkRpYWxvZyxcbiAgICBpc1NlbGZWZXJpZmljYXRpb24sXG59OiBJUHJvcHMpID0+IHtcbiAgICBsZXQgY29udGVudDogSlNYLkVsZW1lbnQ7XG4gICAgaWYgKHdhaXRpbmdGb3JPdGhlclBhcnR5IHx8IHdhaXRpbmdGb3JOZXR3b3JrKSB7XG4gICAgICAgIGxldCB0ZXh0OiBzdHJpbmc7XG4gICAgICAgIGlmICh3YWl0aW5nRm9yT3RoZXJQYXJ0eSkge1xuICAgICAgICAgICAgaWYgKGlzU2VsZlZlcmlmaWNhdGlvbikge1xuICAgICAgICAgICAgICAgIHRleHQgPSBfdChcIkFjY2VwdCBvbiB5b3VyIG90aGVyIGxvZ2lu4oCmXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gX3QoXCJXYWl0aW5nIGZvciAlKGRpc3BsYXlOYW1lKXMgdG8gYWNjZXB04oCmXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheU5hbWU6IG1lbWJlci5kaXNwbGF5TmFtZSB8fCBtZW1iZXIubmFtZSB8fCBtZW1iZXIudXNlcklkLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGV4dCA9IF90KFwiQWNjZXB0aW5n4oCmXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRlbnQgPSA8UGVuZGluZ0FjdGlvblNwaW5uZXIgdGV4dD17dGV4dH0gLz47XG4gICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgY29udGVudCA9IChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fd2lkZUJ1dHRvblwiIG9uQ2xpY2s9e29uU3RhcnRWZXJpZmljYXRpb259PlxuICAgICAgICAgICAgICAgIHtfdChcIlN0YXJ0IFZlcmlmaWNhdGlvblwiKX1cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgZGVzY3JpcHRpb246IEpTWC5FbGVtZW50O1xuICAgIGlmIChpc1Jvb21FbmNyeXB0ZWQpIHtcbiAgICAgICAgZGVzY3JpcHRpb24gPSAoXG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcIk1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgZW5kLXRvLWVuZCBlbmNyeXB0ZWQuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJZb3VyIG1lc3NhZ2VzIGFyZSBzZWN1cmVkIGFuZCBvbmx5IHlvdSBhbmQgdGhlIHJlY2lwaWVudCBoYXZlIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aGUgdW5pcXVlIGtleXMgdG8gdW5sb2NrIHRoZW0uXCIpfTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRlc2NyaXB0aW9uID0gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXCJNZXNzYWdlcyBpbiB0aGlzIHJvb20gYXJlIG5vdCBlbmQtdG8tZW5kIGVuY3J5cHRlZC5cIil9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcIkluIGVuY3J5cHRlZCByb29tcywgeW91ciBtZXNzYWdlcyBhcmUgc2VjdXJlZCBhbmQgb25seSB5b3UgYW5kIHRoZSByZWNpcGllbnQgaGF2ZSBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwidGhlIHVuaXF1ZSBrZXlzIHRvIHVubG9jayB0aGVtLlwiKX08L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoaW5EaWFsb2cpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRlbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIDxSZWFjdC5GcmFnbWVudD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Vc2VySW5mb19jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxoMz57X3QoXCJFbmNyeXB0aW9uXCIpfTwvaDM+XG4gICAgICAgICAgICB7IGRlc2NyaXB0aW9uIH1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVXNlckluZm9fY29udGFpbmVyXCI+XG4gICAgICAgICAgICA8aDM+e190KFwiVmVyaWZ5IFVzZXJcIil9PC9oMz5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHA+e190KFwiRm9yIGV4dHJhIHNlY3VyaXR5LCB2ZXJpZnkgdGhpcyB1c2VyIGJ5IGNoZWNraW5nIGEgb25lLXRpbWUgY29kZSBvbiBib3RoIG9mIHlvdXIgZGV2aWNlcy5cIil9PC9wPlxuICAgICAgICAgICAgICAgIDxwPntfdChcIlRvIGJlIHNlY3VyZSwgZG8gdGhpcyBpbiBwZXJzb24gb3IgdXNlIGEgdHJ1c3RlZCB3YXkgdG8gY29tbXVuaWNhdGUuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICB7IGNvbnRlbnQgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgRW5jcnlwdGlvbkluZm87XG4iXX0=