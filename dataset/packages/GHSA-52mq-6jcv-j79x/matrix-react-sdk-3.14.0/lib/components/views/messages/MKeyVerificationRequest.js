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

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _KeyVerificationStateObserver = require("../../../utils/KeyVerificationStateObserver");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _actions = require("../../../dispatcher/actions");

var _EventTileBubble = _interopRequireDefault(require("./EventTileBubble"));

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
class MKeyVerificationRequest extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_openRequest", () => {
      const {
        verificationRequest
      } = this.props.mxEvent;

      const member = _MatrixClientPeg.MatrixClientPeg.get().getUser(verificationRequest.otherUserId);

      _dispatcher.default.dispatch({
        action: _actions.Action.SetRightPanelPhase,
        phase: _RightPanelStorePhases.RightPanelPhases.EncryptionPanel,
        refireParams: {
          verificationRequest,
          member
        }
      });
    });
    (0, _defineProperty2.default)(this, "_onRequestChanged", () => {
      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "_onAcceptClicked", async () => {
      const request = this.props.mxEvent.verificationRequest;

      if (request) {
        try {
          this._openRequest();

          await request.accept();
        } catch (err) {
          console.error(err.message);
        }
      }
    });
    (0, _defineProperty2.default)(this, "_onRejectClicked", async () => {
      const request = this.props.mxEvent.verificationRequest;

      if (request) {
        try {
          await request.cancel();
        } catch (err) {
          console.error(err.message);
        }
      }
    });
    this.state = {};
  }

  componentDidMount() {
    const request = this.props.mxEvent.verificationRequest;

    if (request) {
      request.on("change", this._onRequestChanged);
    }
  }

  componentWillUnmount() {
    const request = this.props.mxEvent.verificationRequest;

    if (request) {
      request.off("change", this._onRequestChanged);
    }
  }

  _acceptedLabel(userId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const myUserId = client.getUserId();

    if (userId === myUserId) {
      return (0, _languageHandler._t)("You accepted");
    } else {
      return (0, _languageHandler._t)("%(name)s accepted", {
        name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
      });
    }
  }

  _cancelledLabel(userId) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const myUserId = client.getUserId();
    const {
      cancellationCode
    } = this.props.mxEvent.verificationRequest;
    const declined = cancellationCode === "m.user";

    if (userId === myUserId) {
      if (declined) {
        return (0, _languageHandler._t)("You declined");
      } else {
        return (0, _languageHandler._t)("You cancelled");
      }
    } else {
      if (declined) {
        return (0, _languageHandler._t)("%(name)s declined", {
          name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
        });
      } else {
        return (0, _languageHandler._t)("%(name)s cancelled", {
          name: (0, _KeyVerificationStateObserver.getNameForEventRoom)(userId, this.props.mxEvent.getRoomId())
        });
      }
    }
  }

  render() {
    const AccessibleButton = sdk.getComponent("elements.AccessibleButton");
    const FormButton = sdk.getComponent("elements.FormButton");
    const {
      mxEvent
    } = this.props;
    const request = mxEvent.verificationRequest;

    if (!request || request.invalid) {
      return null;
    }

    let title;
    let subtitle;
    let stateNode;

    if (!request.canAccept) {
      let stateLabel;
      const accepted = request.ready || request.started || request.done;

      if (accepted) {
        stateLabel = /*#__PURE__*/_react.default.createElement(AccessibleButton, {
          onClick: this._openRequest
        }, this._acceptedLabel(request.receivingUserId));
      } else if (request.cancelled) {
        stateLabel = this._cancelledLabel(request.cancellingUserId);
      } else if (request.accepting) {
        stateLabel = (0, _languageHandler._t)("Accepting …");
      } else if (request.declining) {
        stateLabel = (0, _languageHandler._t)("Declining …");
      }

      stateNode = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_cryptoEvent_state"
      }, stateLabel);
    }

    if (!request.initiatedByMe) {
      const name = (0, _KeyVerificationStateObserver.getNameForEventRoom)(request.requestingUserId, mxEvent.getRoomId());
      title = (0, _languageHandler._t)("%(name)s wants to verify", {
        name
      });
      subtitle = (0, _KeyVerificationStateObserver.userLabelForEventRoom)(request.requestingUserId, mxEvent.getRoomId());

      if (request.canAccept) {
        stateNode = /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_cryptoEvent_buttons"
        }, /*#__PURE__*/_react.default.createElement(FormButton, {
          kind: "danger",
          onClick: this._onRejectClicked,
          label: (0, _languageHandler._t)("Decline")
        }), /*#__PURE__*/_react.default.createElement(FormButton, {
          onClick: this._onAcceptClicked,
          label: (0, _languageHandler._t)("Accept")
        }));
      }
    } else {
      // request sent by us
      title = (0, _languageHandler._t)("You sent a verification request");
      subtitle = (0, _KeyVerificationStateObserver.userLabelForEventRoom)(request.receivingUserId, mxEvent.getRoomId());
    }

    if (title) {
      return /*#__PURE__*/_react.default.createElement(_EventTileBubble.default, {
        className: "mx_cryptoEvent mx_cryptoEvent_icon",
        title: title,
        subtitle: subtitle
      }, stateNode);
    }

    return null;
  }

}

exports.default = MKeyVerificationRequest;
MKeyVerificationRequest.propTypes = {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01LZXlWZXJpZmljYXRpb25SZXF1ZXN0LmpzIl0sIm5hbWVzIjpbIk1LZXlWZXJpZmljYXRpb25SZXF1ZXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwidmVyaWZpY2F0aW9uUmVxdWVzdCIsIm14RXZlbnQiLCJtZW1iZXIiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VyIiwib3RoZXJVc2VySWQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlNldFJpZ2h0UGFuZWxQaGFzZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIkVuY3J5cHRpb25QYW5lbCIsInJlZmlyZVBhcmFtcyIsImZvcmNlVXBkYXRlIiwicmVxdWVzdCIsIl9vcGVuUmVxdWVzdCIsImFjY2VwdCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm1lc3NhZ2UiLCJjYW5jZWwiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJfb25SZXF1ZXN0Q2hhbmdlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwiX2FjY2VwdGVkTGFiZWwiLCJ1c2VySWQiLCJjbGllbnQiLCJteVVzZXJJZCIsImdldFVzZXJJZCIsIm5hbWUiLCJnZXRSb29tSWQiLCJfY2FuY2VsbGVkTGFiZWwiLCJjYW5jZWxsYXRpb25Db2RlIiwiZGVjbGluZWQiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRm9ybUJ1dHRvbiIsImludmFsaWQiLCJ0aXRsZSIsInN1YnRpdGxlIiwic3RhdGVOb2RlIiwiY2FuQWNjZXB0Iiwic3RhdGVMYWJlbCIsImFjY2VwdGVkIiwicmVhZHkiLCJzdGFydGVkIiwiZG9uZSIsInJlY2VpdmluZ1VzZXJJZCIsImNhbmNlbGxlZCIsImNhbmNlbGxpbmdVc2VySWQiLCJhY2NlcHRpbmciLCJkZWNsaW5pbmciLCJpbml0aWF0ZWRCeU1lIiwicmVxdWVzdGluZ1VzZXJJZCIsIl9vblJlamVjdENsaWNrZWQiLCJfb25BY2NlcHRDbGlja2VkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBY2UsTUFBTUEsdUJBQU4sU0FBc0NDLGVBQU1DLFNBQTVDLENBQXNEO0FBQ2pFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx3REFtQkosTUFBTTtBQUNqQixZQUFNO0FBQUNDLFFBQUFBO0FBQUQsVUFBd0IsS0FBS0QsS0FBTCxDQUFXRSxPQUF6Qzs7QUFDQSxZQUFNQyxNQUFNLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLE9BQXRCLENBQThCTCxtQkFBbUIsQ0FBQ00sV0FBbEQsQ0FBZjs7QUFDQUMsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUVDLGdCQUFPQyxrQkFETjtBQUVUQyxRQUFBQSxLQUFLLEVBQUVDLHdDQUFpQkMsZUFGZjtBQUdUQyxRQUFBQSxZQUFZLEVBQUU7QUFBQ2YsVUFBQUEsbUJBQUQ7QUFBc0JFLFVBQUFBO0FBQXRCO0FBSEwsT0FBYjtBQUtILEtBM0JrQjtBQUFBLDZEQTZCQyxNQUFNO0FBQ3RCLFdBQUtjLFdBQUw7QUFDSCxLQS9Ca0I7QUFBQSw0REFpQ0EsWUFBWTtBQUMzQixZQUFNQyxPQUFPLEdBQUcsS0FBS2xCLEtBQUwsQ0FBV0UsT0FBWCxDQUFtQkQsbUJBQW5DOztBQUNBLFVBQUlpQixPQUFKLEVBQWE7QUFDVCxZQUFJO0FBQ0EsZUFBS0MsWUFBTDs7QUFDQSxnQkFB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RUFBRUEsS0FGSjtBQUdILFFBQUEsUUFBUSxFQUFFQztBQUhQLFNBS0RDLFNBTEMsQ0FBUDtBQU9IOztBQUNELFdBQU8sSUFBUDtBQUNIOztBQWhKZ0U7OztBQW1KckV0RCx1QkFBdUIsQ0FBQ3NFLFNBQXhCLEdBQW9DO0FBQ2hDO0FBQ0FoRSxFQUFBQSxPQUFPLEVBQUVpRSxtQkFBVUMsTUFBVixDQUFpQkM7QUFGTSxDQUFwQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtnZXROYW1lRm9yRXZlbnRSb29tLCB1c2VyTGFiZWxGb3JFdmVudFJvb219XG4gICAgZnJvbSAnLi4vLi4vLi4vdXRpbHMvS2V5VmVyaWZpY2F0aW9uU3RhdGVPYnNlcnZlcic7XG5pbXBvcnQgZGlzIGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7UmlnaHRQYW5lbFBoYXNlc30gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9SaWdodFBhbmVsU3RvcmVQaGFzZXNcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgRXZlbnRUaWxlQnViYmxlIGZyb20gXCIuL0V2ZW50VGlsZUJ1YmJsZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNS2V5VmVyaWZpY2F0aW9uUmVxdWVzdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge307XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJlcXVlc3Qub24oXCJjaGFuZ2VcIiwgdGhpcy5fb25SZXF1ZXN0Q2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucHJvcHMubXhFdmVudC52ZXJpZmljYXRpb25SZXF1ZXN0O1xuICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgcmVxdWVzdC5vZmYoXCJjaGFuZ2VcIiwgdGhpcy5fb25SZXF1ZXN0Q2hhbmdlZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfb3BlblJlcXVlc3QgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHt2ZXJpZmljYXRpb25SZXF1ZXN0fSA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXIodmVyaWZpY2F0aW9uUmVxdWVzdC5vdGhlclVzZXJJZCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246IEFjdGlvbi5TZXRSaWdodFBhbmVsUGhhc2UsXG4gICAgICAgICAgICBwaGFzZTogUmlnaHRQYW5lbFBoYXNlcy5FbmNyeXB0aW9uUGFuZWwsXG4gICAgICAgICAgICByZWZpcmVQYXJhbXM6IHt2ZXJpZmljYXRpb25SZXF1ZXN0LCBtZW1iZXJ9LFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uUmVxdWVzdENoYW5nZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgX29uQWNjZXB0Q2xpY2tlZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucHJvcHMubXhFdmVudC52ZXJpZmljYXRpb25SZXF1ZXN0O1xuICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9vcGVuUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QuYWNjZXB0KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25SZWplY3RDbGlja2VkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5wcm9wcy5teEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHJlcXVlc3QuY2FuY2VsKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfYWNjZXB0ZWRMYWJlbCh1c2VySWQpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gbXlVc2VySWQpIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIllvdSBhY2NlcHRlZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGFjY2VwdGVkXCIsIHtuYW1lOiBnZXROYW1lRm9yRXZlbnRSb29tKHVzZXJJZCwgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKX0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NhbmNlbGxlZExhYmVsKHVzZXJJZCkge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IG15VXNlcklkID0gY2xpZW50LmdldFVzZXJJZCgpO1xuICAgICAgICBjb25zdCB7Y2FuY2VsbGF0aW9uQ29kZX0gPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgY29uc3QgZGVjbGluZWQgPSBjYW5jZWxsYXRpb25Db2RlID09PSBcIm0udXNlclwiO1xuICAgICAgICBpZiAodXNlcklkID09PSBteVVzZXJJZCkge1xuICAgICAgICAgICAgaWYgKGRlY2xpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiWW91IGRlY2xpbmVkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCJZb3UgY2FuY2VsbGVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRlY2xpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiJShuYW1lKXMgZGVjbGluZWRcIiwge25hbWU6IGdldE5hbWVGb3JFdmVudFJvb20odXNlcklkLCB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGNhbmNlbGxlZFwiLCB7bmFtZTogZ2V0TmFtZUZvckV2ZW50Um9vbSh1c2VySWQsIHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5BY2Nlc3NpYmxlQnV0dG9uXCIpO1xuICAgICAgICBjb25zdCBGb3JtQnV0dG9uID0gc2RrLmdldENvbXBvbmVudChcImVsZW1lbnRzLkZvcm1CdXR0b25cIik7XG5cbiAgICAgICAgY29uc3Qge214RXZlbnR9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IG14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcblxuICAgICAgICBpZiAoIXJlcXVlc3QgfHwgcmVxdWVzdC5pbnZhbGlkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0aXRsZTtcbiAgICAgICAgbGV0IHN1YnRpdGxlO1xuICAgICAgICBsZXQgc3RhdGVOb2RlO1xuXG4gICAgICAgIGlmICghcmVxdWVzdC5jYW5BY2NlcHQpIHtcbiAgICAgICAgICAgIGxldCBzdGF0ZUxhYmVsO1xuICAgICAgICAgICAgY29uc3QgYWNjZXB0ZWQgPSByZXF1ZXN0LnJlYWR5IHx8IHJlcXVlc3Quc3RhcnRlZCB8fCByZXF1ZXN0LmRvbmU7XG4gICAgICAgICAgICBpZiAoYWNjZXB0ZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUxhYmVsID0gKDxBY2Nlc3NpYmxlQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29wZW5SZXF1ZXN0fT5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuX2FjY2VwdGVkTGFiZWwocmVxdWVzdC5yZWNlaXZpbmdVc2VySWQpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgICAgIHN0YXRlTGFiZWwgPSB0aGlzLl9jYW5jZWxsZWRMYWJlbChyZXF1ZXN0LmNhbmNlbGxpbmdVc2VySWQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmFjY2VwdGluZykge1xuICAgICAgICAgICAgICAgIHN0YXRlTGFiZWwgPSBfdChcIkFjY2VwdGluZyDigKZcIik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJlcXVlc3QuZGVjbGluaW5nKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVMYWJlbCA9IF90KFwiRGVjbGluaW5nIOKAplwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YXRlTm9kZSA9ICg8ZGl2IGNsYXNzTmFtZT1cIm14X2NyeXB0b0V2ZW50X3N0YXRlXCI+e3N0YXRlTGFiZWx9PC9kaXY+KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcmVxdWVzdC5pbml0aWF0ZWRCeU1lKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gZ2V0TmFtZUZvckV2ZW50Um9vbShyZXF1ZXN0LnJlcXVlc3RpbmdVc2VySWQsIG14RXZlbnQuZ2V0Um9vbUlkKCkpO1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIiUobmFtZSlzIHdhbnRzIHRvIHZlcmlmeVwiLCB7bmFtZX0pO1xuICAgICAgICAgICAgc3VidGl0bGUgPSB1c2VyTGFiZWxGb3JFdmVudFJvb20ocmVxdWVzdC5yZXF1ZXN0aW5nVXNlcklkLCBteEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIGlmIChyZXF1ZXN0LmNhbkFjY2VwdCkge1xuICAgICAgICAgICAgICAgIHN0YXRlTm9kZSA9ICg8ZGl2IGNsYXNzTmFtZT1cIm14X2NyeXB0b0V2ZW50X2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1CdXR0b24ga2luZD1cImRhbmdlclwiIG9uQ2xpY2s9e3RoaXMuX29uUmVqZWN0Q2xpY2tlZH0gbGFiZWw9e190KFwiRGVjbGluZVwiKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPEZvcm1CdXR0b24gb25DbGljaz17dGhpcy5fb25BY2NlcHRDbGlja2VkfSBsYWJlbD17X3QoXCJBY2NlcHRcIil9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gcmVxdWVzdCBzZW50IGJ5IHVzXG4gICAgICAgICAgICB0aXRsZSA9IF90KFwiWW91IHNlbnQgYSB2ZXJpZmljYXRpb24gcmVxdWVzdFwiKTtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gdXNlckxhYmVsRm9yRXZlbnRSb29tKHJlcXVlc3QucmVjZWl2aW5nVXNlcklkLCBteEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aXRsZSkge1xuICAgICAgICAgICAgcmV0dXJuIDxFdmVudFRpbGVCdWJibGVcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudCBteF9jcnlwdG9FdmVudF9pY29uXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgc3VidGl0bGU9e3N1YnRpdGxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgc3RhdGVOb2RlIH1cbiAgICAgICAgICAgIDwvRXZlbnRUaWxlQnViYmxlPjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbk1LZXlWZXJpZmljYXRpb25SZXF1ZXN0LnByb3BUeXBlcyA9IHtcbiAgICAvKiB0aGUgTWF0cml4RXZlbnQgdG8gc2hvdyAqL1xuICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbn07XG4iXX0=