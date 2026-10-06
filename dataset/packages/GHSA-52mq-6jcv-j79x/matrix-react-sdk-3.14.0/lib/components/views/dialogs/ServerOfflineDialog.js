"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _BaseDialog = _interopRequireDefault(require("./BaseDialog"));

var _languageHandler = require("../../../languageHandler");

var _EchoStore = require("../../../stores/local-echo/EchoStore");

var _DateUtils = require("../../../DateUtils");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _RoomEchoContext = require("../../../stores/local-echo/RoomEchoContext");

var _RoomAvatar = _interopRequireDefault(require("../avatars/RoomAvatar"));

var _EchoTransaction = require("../../../stores/local-echo/EchoTransaction");

var _Spinner = _interopRequireDefault(require("../elements/Spinner"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

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
class ServerOfflineDialog extends React.PureComponent
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onEchosUpdated", () => {
      this.forceUpdate(); // no state to worry about
    });
  }

  componentDidMount() {
    _EchoStore.EchoStore.instance.on(_AsyncStore.UPDATE_EVENT, this.onEchosUpdated);
  }

  componentWillUnmount() {
    _EchoStore.EchoStore.instance.off(_AsyncStore.UPDATE_EVENT, this.onEchosUpdated);
  }

  renderTimeline()
  /*: React.ReactElement[]*/
  {
    return _EchoStore.EchoStore.instance.contexts.map((c, i) => {
      if (!c.firstFailedTime) return null; // not useful

      if (!(c instanceof _RoomEchoContext.RoomEchoContext)) throw new Error("Cannot render unknown context: " + c);
      const header = /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timeline_header"
      }, /*#__PURE__*/React.createElement(_RoomAvatar.default, {
        width: 24,
        height: 24,
        room: c.room
      }), /*#__PURE__*/React.createElement("span", null, c.room.name));
      const entries = c.transactions.filter(t => t.status === _EchoTransaction.TransactionStatus.Error || t.didPreviouslyFail).map((t, j) => {
        let button = /*#__PURE__*/React.createElement(_Spinner.default, {
          w: 19,
          h: 19
        });

        if (t.status === _EchoTransaction.TransactionStatus.Error) {
          button = /*#__PURE__*/React.createElement(_AccessibleButton.default, {
            kind: "link",
            onClick: () => t.run()
          }, (0, _languageHandler._t)("Resend"));
        }

        return /*#__PURE__*/React.createElement("div", {
          className: "mx_ServerOfflineDialog_content_context_txn",
          key: `txn-${j}`
        }, /*#__PURE__*/React.createElement("span", {
          className: "mx_ServerOfflineDialog_content_context_txn_desc"
        }, t.auditName), button);
      });
      return /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context",
        key: `context-${i}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timestamp"
      }, (0, _DateUtils.formatTime)(c.firstFailedTime, _SettingsStore.default.getValue("showTwelveHourTimestamps"))), /*#__PURE__*/React.createElement("div", {
        className: "mx_ServerOfflineDialog_content_context_timeline"
      }, header, entries));
    });
  }

  render() {
    let timeline = this.renderTimeline().filter(c => !!c); // remove nulls for next check

    if (timeline.length === 0) {
      timeline = [/*#__PURE__*/React.createElement("div", {
        key: 1
      }, (0, _languageHandler._t)("You're all caught up."))];
    }

    const serverName = _MatrixClientPeg.MatrixClientPeg.getHomeserverName();

    return /*#__PURE__*/React.createElement(_BaseDialog.default, {
      title: (0, _languageHandler._t)("Server isn't responding"),
      className: "mx_ServerOfflineDialog",
      contentId: "mx_Dialog_content",
      onFinished: this.props.onFinished,
      hasCancel: true
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_ServerOfflineDialog_content"
    }, /*#__PURE__*/React.createElement("p", null, (0, _languageHandler._t)("Your server isn't responding to some of your requests. " + "Below are some of the most likely reasons.")), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server (%(serverName)s) took too long to respond.", {
      serverName
    })), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("Your firewall or anti-virus is blocking the request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("A browser extension is preventing the request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server is offline.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server has denied your request.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("Your area is experiencing difficulties connecting to the internet.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("A connection error occurred while trying to contact the server.")), /*#__PURE__*/React.createElement("li", null, (0, _languageHandler._t)("The server is not configured to indicate what the problem is (CORS)."))), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", null, (0, _languageHandler._t)("Recent changes that have not yet been received")), timeline));
  }

}

exports.default = ServerOfflineDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyT2ZmbGluZURpYWxvZy50c3giXSwibmFtZXMiOlsiU2VydmVyT2ZmbGluZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImZvcmNlVXBkYXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJFY2hvU3RvcmUiLCJpbnN0YW5jZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwib25FY2hvc1VwZGF0ZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInJlbmRlclRpbWVsaW5lIiwiY29udGV4dHMiLCJtYXAiLCJjIiwiaSIsImZpcnN0RmFpbGVkVGltZSIsIlJvb21FY2hvQ29udGV4dCIsIkVycm9yIiwiaGVhZGVyIiwicm9vbSIsIm5hbWUiLCJlbnRyaWVzIiwidHJhbnNhY3Rpb25zIiwiZmlsdGVyIiwidCIsInN0YXR1cyIsIlRyYW5zYWN0aW9uU3RhdHVzIiwiZGlkUHJldmlvdXNseUZhaWwiLCJqIiwiYnV0dG9uIiwicnVuIiwiYXVkaXROYW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicmVuZGVyIiwidGltZWxpbmUiLCJsZW5ndGgiLCJzZXJ2ZXJOYW1lIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJwcm9wcyIsIm9uRmluaXNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQW9CZSxNQUFNQSxtQkFBTixTQUFrQ0MsS0FBSyxDQUFDQztBQUF4QztBQUE4RDtBQUFBO0FBQUE7QUFBQSwwREFTaEQsTUFBTTtBQUMzQixXQUFLQyxXQUFMLEdB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VixTQUFjLHlCQUFHLHVCQUFILENBQWQsQ0FBRCxDQUFYO0FBQ0g7O0FBRUQsVUFBTUUsVUFBVSxHQUFHQyxpQ0FBZ0JDLGlCQUFoQixFQUFuQjs7QUFDQSx3QkFBTyxvQkFBQyxtQkFBRDtBQUFZLE1BQUEsS0FBSyxFQUFFLHlCQUFHLHlCQUFILENBQW5CO0FBQ0gsTUFBQSxTQUFTLEVBQUMsd0JBRFA7QUFFSCxNQUFBLFNBQVMsRUFBQyxtQkFGUDtBQUdILE1BQUEsVUFBVSxFQUFFLEtBQUtDLEtBQUwsQ0FBV0MsVUFIcEI7QUFJSCxNQUFBLFNBQVMsRUFBRTtBQUpSLG9CQU1IO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSSwrQkFBSSx5QkFDQSw0REFDQSw0Q0FGQSxDQUFKLENBREosZUFLSSw2Q0FDSSxnQ0FBSyx5QkFBRyx1REFBSCxFQUE0RDtBQUFDSixNQUFBQTtBQUFELEtBQTVELENBQUwsQ0FESixlQUVJLGdDQUFLLHlCQUFHLHNEQUFILENBQUwsQ0FGSixlQUdJLGdDQUFLLHlCQUFHLGdEQUFILENBQUwsQ0FISixlQUlJLGdDQUFLLHlCQUFHLHdCQUFILENBQUwsQ0FKSixlQUtJLGdDQUFLLHlCQUFHLHFDQUFILENBQUwsQ0FMSixlQU1JLGdDQUFLLHlCQUFHLG9FQUFILENBQUwsQ0FOSixlQU9JLGdDQUFLLHlCQUFHLGlFQUFILENBQUwsQ0FQSixlQVFJLGdDQUFLLHlCQUFHLHNFQUFILENBQUwsQ0FSSixDQUxKLGVBZUksK0JBZkosZUFnQkksZ0NBQUsseUJBQUcsZ0RBQUgsQ0FBTCxDQWhCSixFQWlCS0YsUUFqQkwsQ0FORyxDQUFQO0FBMEJIOztBQXhGd0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgQmFzZURpYWxvZyBmcm9tICcuL0Jhc2VEaWFsb2cnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgRWNob1N0b3JlIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL0VjaG9TdG9yZVwiO1xuaW1wb3J0IHsgZm9ybWF0VGltZSB9IGZyb20gXCIuLi8uLi8uLi9EYXRlVXRpbHNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBSb29tRWNob0NvbnRleHQgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL2xvY2FsLWVjaG8vUm9vbUVjaG9Db250ZXh0XCI7XG5pbXBvcnQgUm9vbUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9Sb29tQXZhdGFyXCI7XG5pbXBvcnQgeyBUcmFuc2FjdGlvblN0YXR1cyB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvVHJhbnNhY3Rpb25cIjtcbmltcG9ydCBTcGlubmVyIGZyb20gXCIuLi9lbGVtZW50cy9TcGlubmVyXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHsgVVBEQVRFX0VWRU5UIH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9Bc3luY1N0b3JlXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBJRGlhbG9nUHJvcHMgfSBmcm9tIFwiLi9JRGlhbG9nUHJvcHNcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlcnZlck9mZmxpbmVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHB1YmxpYyBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgRWNob1N0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy5vbkVjaG9zVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBFY2hvU3RvcmUuaW5zdGFuY2Uub2ZmKFVQREFURV9FVkVOVCwgdGhpcy5vbkVjaG9zVXBkYXRlZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkVjaG9zVXBkYXRlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpOyAvLyBubyBzdGF0ZSB0byB3b3JyeSBhYm91dFxuICAgIH07XG5cbiAgICBwcml2YXRlIHJlbmRlclRpbWVsaW5lKCk6IFJlYWN0LlJlYWN0RWxlbWVudFtdIHtcbiAgICAgICAgcmV0dXJuIEVjaG9TdG9yZS5pbnN0YW5jZS5jb250ZXh0cy5tYXAoKGMsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghYy5maXJzdEZhaWxlZFRpbWUpIHJldHVybiBudWxsOyAvLyBub3QgdXNlZnVsXG4gICAgICAgICAgICBpZiAoIShjIGluc3RhbmNlb2YgUm9vbUVjaG9Db250ZXh0KSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHJlbmRlciB1bmtub3duIGNvbnRleHQ6IFwiICsgYyk7XG4gICAgICAgICAgICBjb25zdCBoZWFkZXIgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90aW1lbGluZV9oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgd2lkdGg9ezI0fSBoZWlnaHQ9ezI0fSByb29tPXtjLnJvb219IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntjLnJvb20ubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY29uc3QgZW50cmllcyA9IGMudHJhbnNhY3Rpb25zXG4gICAgICAgICAgICAgICAgLmZpbHRlcih0ID0+IHQuc3RhdHVzID09PSBUcmFuc2FjdGlvblN0YXR1cy5FcnJvciB8fCB0LmRpZFByZXZpb3VzbHlGYWlsKVxuICAgICAgICAgICAgICAgIC5tYXAoKHQsIGopID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGJ1dHRvbiA9IDxTcGlubmVyIHc9ezE5fSBoPXsxOX0gLz47XG4gICAgICAgICAgICAgICAgICAgIGlmICh0LnN0YXR1cyA9PT0gVHJhbnNhY3Rpb25TdGF0dXMuRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwibGlua1wiIG9uQ2xpY2s9eygpID0+IHQucnVuKCl9PntfdChcIlJlc2VuZFwiKX08L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3R4blwiIGtleT17YHR4bi0ke2p9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50X2NvbnRleHRfdHhuX2Rlc2NcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3QuYXVkaXROYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7YnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50X2NvbnRleHRcIiBrZXk9e2Bjb250ZXh0LSR7aX1gfT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90aW1lc3RhbXBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRUaW1lKGMuZmlyc3RGYWlsZWRUaW1lLCBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50X2NvbnRleHRfdGltZWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtoZWFkZXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZW50cmllc31cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIGxldCB0aW1lbGluZSA9IHRoaXMucmVuZGVyVGltZWxpbmUoKS5maWx0ZXIoYyA9PiAhIWMpOyAvLyByZW1vdmUgbnVsbHMgZm9yIG5leHQgY2hlY2tcbiAgICAgICAgaWYgKHRpbWVsaW5lLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGltZWxpbmUgPSBbPGRpdiBrZXk9ezF9PntfdChcIllvdSdyZSBhbGwgY2F1Z2h0IHVwLlwiKX08L2Rpdj5dO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VydmVyTmFtZSA9IE1hdHJpeENsaWVudFBlZy5nZXRIb21lc2VydmVyTmFtZSgpO1xuICAgICAgICByZXR1cm4gPEJhc2VEaWFsb2cgdGl0bGU9e190KFwiU2VydmVyIGlzbid0IHJlc3BvbmRpbmdcIil9XG4gICAgICAgICAgICBjbGFzc05hbWU9J214X1NlcnZlck9mZmxpbmVEaWFsb2cnXG4gICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJZb3VyIHNlcnZlciBpc24ndCByZXNwb25kaW5nIHRvIHNvbWUgb2YgeW91ciByZXF1ZXN0cy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICBcIkJlbG93IGFyZSBzb21lIG9mIHRoZSBtb3N0IGxpa2VseSByZWFzb25zLlwiLFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlRoZSBzZXJ2ZXIgKCUoc2VydmVyTmFtZSlzKSB0b29rIHRvbyBsb25nIHRvIHJlc3BvbmQuXCIsIHtzZXJ2ZXJOYW1lfSl9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIllvdXIgZmlyZXdhbGwgb3IgYW50aS12aXJ1cyBpcyBibG9ja2luZyB0aGUgcmVxdWVzdC5cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIkEgYnJvd3NlciBleHRlbnNpb24gaXMgcHJldmVudGluZyB0aGUgcmVxdWVzdC5cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlRoZSBzZXJ2ZXIgaXMgb2ZmbGluZS5cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlRoZSBzZXJ2ZXIgaGFzIGRlbmllZCB5b3VyIHJlcXVlc3QuXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJZb3VyIGFyZWEgaXMgZXhwZXJpZW5jaW5nIGRpZmZpY3VsdGllcyBjb25uZWN0aW5nIHRvIHRoZSBpbnRlcm5ldC5cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIkEgY29ubmVjdGlvbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB0cnlpbmcgdG8gY29udGFjdCB0aGUgc2VydmVyLlwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiVGhlIHNlcnZlciBpcyBub3QgY29uZmlndXJlZCB0byBpbmRpY2F0ZSB3aGF0IHRoZSBwcm9ibGVtIGlzIChDT1JTKS5cIil9PC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgICAgIDxociAvPlxuICAgICAgICAgICAgICAgIDxoMj57X3QoXCJSZWNlbnQgY2hhbmdlcyB0aGF0IGhhdmUgbm90IHlldCBiZWVuIHJlY2VpdmVkXCIpfTwvaDI+XG4gICAgICAgICAgICAgICAge3RpbWVsaW5lfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvQmFzZURpYWxvZz47XG4gICAgfVxufVxuIl19