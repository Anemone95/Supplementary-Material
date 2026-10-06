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

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _KeyVerificationStateObserver = require("../../../utils/KeyVerificationStateObserver");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _RightPanelStorePhases = require("../../../stores/RightPanelStorePhases");

var _actions = require("../../../dispatcher/actions");

var _EventTileBubble = _interopRequireDefault(require("./EventTileBubble"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let MKeyVerificationRequest = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.MKeyVerificationRequest"), _dec(_class = (_temp = class MKeyVerificationRequest extends _react.default.Component {
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

}, _temp)) || _class);
exports.default = MKeyVerificationRequest;
MKeyVerificationRequest.propTypes = {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01LZXlWZXJpZmljYXRpb25SZXF1ZXN0LmpzIl0sIm5hbWVzIjpbIk1LZXlWZXJpZmljYXRpb25SZXF1ZXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwidmVyaWZpY2F0aW9uUmVxdWVzdCIsIm14RXZlbnQiLCJtZW1iZXIiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VyIiwib3RoZXJVc2VySWQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFjdGlvbiIsIlNldFJpZ2h0UGFuZWxQaGFzZSIsInBoYXNlIiwiUmlnaHRQYW5lbFBoYXNlcyIsIkVuY3J5cHRpb25QYW5lbCIsInJlZmlyZVBhcmFtcyIsImZvcmNlVXBkYXRlIiwicmVxdWVzdCIsIl9vcGVuUmVxdWVzdCIsImFjY2VwdCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsIm1lc3NhZ2UiLCJjYW5jZWwiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJfb25SZXF1ZXN0Q2hhbmdlZCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwib2ZmIiwiX2FjY2VwdGVkTGFiZWwiLCJ1c2VySWQiLCJjbGllbnQiLCJteVVzZXJJZCIsImdldFVzZXJJZCIsIm5hbWUiLCJnZXRSb29tSWQiLCJfY2FuY2VsbGVkTGFiZWwiLCJjYW5jZWxsYXRpb25Db2RlIiwiZGVjbGluZWQiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiRm9ybUJ1dHRvbiIsImludmFsaWQiLCJ0aXRsZSIsInN1YnRpdGxlIiwic3RhdGVOb2RlIiwiY2FuQWNjZXB0Iiwic3RhdGVMYWJlbCIsImFjY2VwdGVkIiwicmVhZHkiLCJzdGFydGVkIiwiZG9uZSIsInJlY2VpdmluZ1VzZXJJZCIsImNhbmNlbGxlZCIsImNhbmNlbGxpbmdVc2VySWQiLCJhY2NlcHRpbmciLCJkZWNsaW5pbmciLCJpbml0aWF0ZWRCeU1lIiwicmVxdWVzdGluZ1VzZXJJZCIsIl9vblJlamVjdENsaWNrZWQiLCJfb25BY2NlcHRDbGlja2VkIiwicHJvcFR5cGVzIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsdUIsV0FEcEIsZ0RBQXFCLHdDQUFyQixDLHlCQUFELE1BQ3FCQSx1QkFEckIsU0FDcURDLGVBQU1DLFNBRDNELENBQ3FFO0FBQ2pFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSx3REFtQkosTUFBTTtBQUNqQixZQUFNO0FBQUNDLFFBQUFBO0FBQUQsVUFBd0IsS0FBS0QsS0FBTCxDQUFXRSxPQUF6Qzs7QUFDQSxZQUFNQyxNQUFNLEdBQUdDLGlDQUFnQkMsR0FBaEIsR0FBc0JDLE9BQXRCLENBQThCTCxtQkFBbUIsQ0FBQ00sV0FBbEQsQ0FBZjs7QUFDQUMsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUVDLGdCQUFPQyxrQkFETjtBQUVUQyxRQUFBQSxLQUFLLEVBQUVDLHdDQUFpQkMsZUFGZjtBQUdUQyxRQUFBQSxZQUFZLEVBQUU7QUFBQ2YsVUFBQUEsbUJBQUQ7QUFBc0JFLFVBQUFBO0FBQXRCO0FBSEwsT0FBYjtBQUtILEtBM0JrQjtBQUFBLDZEQTZCQyxNQUFNO0FBQ3RCLFdBQUtjLFdBQUw7QUFDSCxLQS9Ca0I7QUFBQSw0REFpQ0EsWUFBWTtBQUMzQixZQUFNQyxPQUFPLEdBQUcsS0FBS2xCLEtBQUwsQ0FBV0UsT0FBWCxDQUFtQkQsbUJBQW5DOztBQUNBLFVBQUlpQixPQUFKLEVBQWE7QUFDVCxZQUFJO0FBQ0EsZUFBS0MsWUFBTDs7QUFDQSxnQkFBTUQsT0FBTyxDQUFDRSxNQUFSLEVBQU47QUFDSCxTQUhE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QUhQLFNBS0RDLFNBTEMsQ0FBUDtBQU9IOztBQUNELFdBQU8sSUFBUDtBQUNIOztBQWhKZ0UsQzs7QUFtSnJFdEQsdUJBQXVCLENBQUNzRSxTQUF4QixHQUFvQztBQUNoQztBQUNBaEUsRUFBQUEsT0FBTyxFQUFFaUUsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRk0sQ0FBcEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7Z2V0TmFtZUZvckV2ZW50Um9vbSwgdXNlckxhYmVsRm9yRXZlbnRSb29tfVxuICAgIGZyb20gJy4uLy4uLy4uL3V0aWxzL0tleVZlcmlmaWNhdGlvblN0YXRlT2JzZXJ2ZXInO1xuaW1wb3J0IGRpcyBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyXCI7XG5pbXBvcnQge1JpZ2h0UGFuZWxQaGFzZXN9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvUmlnaHRQYW5lbFN0b3JlUGhhc2VzXCI7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IEV2ZW50VGlsZUJ1YmJsZSBmcm9tIFwiLi9FdmVudFRpbGVCdWJibGVcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5tZXNzYWdlcy5NS2V5VmVyaWZpY2F0aW9uUmVxdWVzdFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUtleVZlcmlmaWNhdGlvblJlcXVlc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5wcm9wcy5teEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgICAgIGlmIChyZXF1ZXN0KSB7XG4gICAgICAgICAgICByZXF1ZXN0Lm9uKFwiY2hhbmdlXCIsIHRoaXMuX29uUmVxdWVzdENoYW5nZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHJlcXVlc3Qub2ZmKFwiY2hhbmdlXCIsIHRoaXMuX29uUmVxdWVzdENoYW5nZWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX29wZW5SZXF1ZXN0ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCB7dmVyaWZpY2F0aW9uUmVxdWVzdH0gPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IG1lbWJlciA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VyKHZlcmlmaWNhdGlvblJlcXVlc3Qub3RoZXJVc2VySWQpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiBBY3Rpb24uU2V0UmlnaHRQYW5lbFBoYXNlLFxuICAgICAgICAgICAgcGhhc2U6IFJpZ2h0UGFuZWxQaGFzZXMuRW5jcnlwdGlvblBhbmVsLFxuICAgICAgICAgICAgcmVmaXJlUGFyYW1zOiB7dmVyaWZpY2F0aW9uUmVxdWVzdCwgbWVtYmVyfSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblJlcXVlc3RDaGFuZ2VkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfTtcblxuICAgIF9vbkFjY2VwdENsaWNrZWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLnByb3BzLm14RXZlbnQudmVyaWZpY2F0aW9uUmVxdWVzdDtcbiAgICAgICAgaWYgKHJlcXVlc3QpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fb3BlblJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICBhd2FpdCByZXF1ZXN0LmFjY2VwdCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX29uUmVqZWN0Q2xpY2tlZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVxdWVzdCA9IHRoaXMucHJvcHMubXhFdmVudC52ZXJpZmljYXRpb25SZXF1ZXN0O1xuICAgICAgICBpZiAocmVxdWVzdCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBhd2FpdCByZXF1ZXN0LmNhbmNlbCgpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX2FjY2VwdGVkTGFiZWwodXNlcklkKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgbXlVc2VySWQgPSBjbGllbnQuZ2V0VXNlcklkKCk7XG4gICAgICAgIGlmICh1c2VySWQgPT09IG15VXNlcklkKSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCJZb3UgYWNjZXB0ZWRcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gX3QoXCIlKG5hbWUpcyBhY2NlcHRlZFwiLCB7bmFtZTogZ2V0TmFtZUZvckV2ZW50Um9vbSh1c2VySWQsIHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSl9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jYW5jZWxsZWRMYWJlbCh1c2VySWQpIHtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBteVVzZXJJZCA9IGNsaWVudC5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3Qge2NhbmNlbGxhdGlvbkNvZGV9ID0gdGhpcy5wcm9wcy5teEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG4gICAgICAgIGNvbnN0IGRlY2xpbmVkID0gY2FuY2VsbGF0aW9uQ29kZSA9PT0gXCJtLnVzZXJcIjtcbiAgICAgICAgaWYgKHVzZXJJZCA9PT0gbXlVc2VySWQpIHtcbiAgICAgICAgICAgIGlmIChkZWNsaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIllvdSBkZWNsaW5lZFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF90KFwiWW91IGNhbmNlbGxlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkZWNsaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfdChcIiUobmFtZSlzIGRlY2xpbmVkXCIsIHtuYW1lOiBnZXROYW1lRm9yRXZlbnRSb29tKHVzZXJJZCwgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3QoXCIlKG5hbWUpcyBjYW5jZWxsZWRcIiwge25hbWU6IGdldE5hbWVGb3JFdmVudFJvb20odXNlcklkLCB0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCkpfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgRm9ybUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5Gb3JtQnV0dG9uXCIpO1xuXG4gICAgICAgIGNvbnN0IHtteEV2ZW50fSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHJlcXVlc3QgPSBteEV2ZW50LnZlcmlmaWNhdGlvblJlcXVlc3Q7XG5cbiAgICAgICAgaWYgKCFyZXF1ZXN0IHx8IHJlcXVlc3QuaW52YWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdGl0bGU7XG4gICAgICAgIGxldCBzdWJ0aXRsZTtcbiAgICAgICAgbGV0IHN0YXRlTm9kZTtcblxuICAgICAgICBpZiAoIXJlcXVlc3QuY2FuQWNjZXB0KSB7XG4gICAgICAgICAgICBsZXQgc3RhdGVMYWJlbDtcbiAgICAgICAgICAgIGNvbnN0IGFjY2VwdGVkID0gcmVxdWVzdC5yZWFkeSB8fCByZXF1ZXN0LnN0YXJ0ZWQgfHwgcmVxdWVzdC5kb25lO1xuICAgICAgICAgICAgaWYgKGFjY2VwdGVkKSB7XG4gICAgICAgICAgICAgICAgc3RhdGVMYWJlbCA9ICg8QWNjZXNzaWJsZUJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vcGVuUmVxdWVzdH0+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLl9hY2NlcHRlZExhYmVsKHJlcXVlc3QucmVjZWl2aW5nVXNlcklkKX1cbiAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUxhYmVsID0gdGhpcy5fY2FuY2VsbGVkTGFiZWwocmVxdWVzdC5jYW5jZWxsaW5nVXNlcklkKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5hY2NlcHRpbmcpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZUxhYmVsID0gX3QoXCJBY2NlcHRpbmcg4oCmXCIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyZXF1ZXN0LmRlY2xpbmluZykge1xuICAgICAgICAgICAgICAgIHN0YXRlTGFiZWwgPSBfdChcIkRlY2xpbmluZyDigKZcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzdGF0ZU5vZGUgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudF9zdGF0ZVwiPntzdGF0ZUxhYmVsfTwvZGl2Pik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlcXVlc3QuaW5pdGlhdGVkQnlNZSkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IGdldE5hbWVGb3JFdmVudFJvb20ocmVxdWVzdC5yZXF1ZXN0aW5nVXNlcklkLCBteEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgICAgIHRpdGxlID0gX3QoXCIlKG5hbWUpcyB3YW50cyB0byB2ZXJpZnlcIiwge25hbWV9KTtcbiAgICAgICAgICAgIHN1YnRpdGxlID0gdXNlckxhYmVsRm9yRXZlbnRSb29tKHJlcXVlc3QucmVxdWVzdGluZ1VzZXJJZCwgbXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICBpZiAocmVxdWVzdC5jYW5BY2NlcHQpIHtcbiAgICAgICAgICAgICAgICBzdGF0ZU5vZGUgPSAoPGRpdiBjbGFzc05hbWU9XCJteF9jcnlwdG9FdmVudF9idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxGb3JtQnV0dG9uIGtpbmQ9XCJkYW5nZXJcIiBvbkNsaWNrPXt0aGlzLl9vblJlamVjdENsaWNrZWR9IGxhYmVsPXtfdChcIkRlY2xpbmVcIil9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxGb3JtQnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQWNjZXB0Q2xpY2tlZH0gbGFiZWw9e190KFwiQWNjZXB0XCIpfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIHJlcXVlc3Qgc2VudCBieSB1c1xuICAgICAgICAgICAgdGl0bGUgPSBfdChcIllvdSBzZW50IGEgdmVyaWZpY2F0aW9uIHJlcXVlc3RcIik7XG4gICAgICAgICAgICBzdWJ0aXRsZSA9IHVzZXJMYWJlbEZvckV2ZW50Um9vbShyZXF1ZXN0LnJlY2VpdmluZ1VzZXJJZCwgbXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGl0bGUpIHtcbiAgICAgICAgICAgIHJldHVybiA8RXZlbnRUaWxlQnViYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfY3J5cHRvRXZlbnQgbXhfY3J5cHRvRXZlbnRfaWNvblwiXG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIHN1YnRpdGxlPXtzdWJ0aXRsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IHN0YXRlTm9kZSB9XG4gICAgICAgICAgICA8L0V2ZW50VGlsZUJ1YmJsZT47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG5NS2V5VmVyaWZpY2F0aW9uUmVxdWVzdC5wcm9wVHlwZXMgPSB7XG4gICAgLyogdGhlIE1hdHJpeEV2ZW50IHRvIHNob3cgKi9cbiAgICBteEV2ZW50OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG59O1xuIl19