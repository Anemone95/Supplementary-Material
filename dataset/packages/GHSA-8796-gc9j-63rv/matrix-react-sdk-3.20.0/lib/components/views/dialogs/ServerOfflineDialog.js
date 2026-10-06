"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let ServerOfflineDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.ServerOfflineDialog"), _dec(_class = (_temp = class ServerOfflineDialog extends React.PureComponent
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

}, _temp)) || _class);
exports.default = ServerOfflineDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvU2VydmVyT2ZmbGluZURpYWxvZy50c3giXSwibmFtZXMiOlsiU2VydmVyT2ZmbGluZURpYWxvZyIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImZvcmNlVXBkYXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJFY2hvU3RvcmUiLCJpbnN0YW5jZSIsIm9uIiwiVVBEQVRFX0VWRU5UIiwib25FY2hvc1VwZGF0ZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIm9mZiIsInJlbmRlclRpbWVsaW5lIiwiY29udGV4dHMiLCJtYXAiLCJjIiwiaSIsImZpcnN0RmFpbGVkVGltZSIsIlJvb21FY2hvQ29udGV4dCIsIkVycm9yIiwiaGVhZGVyIiwicm9vbSIsIm5hbWUiLCJlbnRyaWVzIiwidHJhbnNhY3Rpb25zIiwiZmlsdGVyIiwidCIsInN0YXR1cyIsIlRyYW5zYWN0aW9uU3RhdHVzIiwiZGlkUHJldmlvdXNseUZhaWwiLCJqIiwiYnV0dG9uIiwicnVuIiwiYXVkaXROYW1lIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwicmVuZGVyIiwidGltZWxpbmUiLCJsZW5ndGgiLCJzZXJ2ZXJOYW1lIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0SG9tZXNlcnZlck5hbWUiLCJwcm9wcyIsIm9uRmluaXNoZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7Ozs7SUFNcUJBLG1CLFdBRHBCLGdEQUFxQixtQ0FBckIsQyx5QkFBRCxNQUNxQkEsbUJBRHJCLFNBQ2lEQyxLQUFLLENBQUNDO0FBRHZEO0FBQzZFO0FBQUE7QUFBQTtBQUFBLDBEQVNoRCxNQUFNO0FBQzNCLFdBQUtDLFdBQUwsR0FEMkIsQ0FDUDtBQUN2QixLQVh3RTtBQUFBOztBQUNsRUMs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QUFDSDs7QUFFRCxVQUFNRSxVQUFVLEdBQUdDLGlDQUFnQkMsaUJBQWhCLEVBQW5COztBQUNBLHdCQUFPLG9CQUFDLG1CQUFEO0FBQVksTUFBQSxLQUFLLEVBQUUseUJBQUcseUJBQUgsQ0FBbkI7QUFDSCxNQUFBLFNBQVMsRUFBQyx3QkFEUDtBQUVILE1BQUEsU0FBUyxFQUFDLG1CQUZQO0FBR0gsTUFBQSxVQUFVLEVBQUUsS0FBS0MsS0FBTCxDQUFXQyxVQUhwQjtBQUlILE1BQUEsU0FBUyxFQUFFO0FBSlIsb0JBTUg7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLCtCQUFJLHlCQUNBLDREQUNBLDRDQUZBLENBQUosQ0FESixlQUtJLDZDQUNJLGdDQUFLLHlCQUFHLHVEQUFILEVBQTREO0FBQUNKLE1BQUFBO0FBQUQsS0FBNUQsQ0FBTCxDQURKLGVBRUksZ0NBQUsseUJBQUcsc0RBQUgsQ0FBTCxDQUZKLGVBR0ksZ0NBQUsseUJBQUcsZ0RBQUgsQ0FBTCxDQUhKLGVBSUksZ0NBQUsseUJBQUcsd0JBQUgsQ0FBTCxDQUpKLGVBS0ksZ0NBQUsseUJBQUcscUNBQUgsQ0FBTCxDQUxKLGVBTUksZ0NBQUsseUJBQUcsb0VBQUgsQ0FBTCxDQU5KLGVBT0ksZ0NBQUsseUJBQUcsaUVBQUgsQ0FBTCxDQVBKLGVBUUksZ0NBQUsseUJBQUcsc0VBQUgsQ0FBTCxDQVJKLENBTEosZUFlSSwrQkFmSixlQWdCSSxnQ0FBSyx5QkFBRyxnREFBSCxDQUFMLENBaEJKLEVBaUJLRixRQWpCTCxDQU5HLENBQVA7QUEwQkg7O0FBeEZ3RSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IEJhc2VEaWFsb2cgZnJvbSAnLi9CYXNlRGlhbG9nJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IEVjaG9TdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvbG9jYWwtZWNoby9FY2hvU3RvcmVcIjtcbmltcG9ydCB7IGZvcm1hdFRpbWUgfSBmcm9tIFwiLi4vLi4vLi4vRGF0ZVV0aWxzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHsgUm9vbUVjaG9Db250ZXh0IH0gZnJvbSBcIi4uLy4uLy4uL3N0b3Jlcy9sb2NhbC1lY2hvL1Jvb21FY2hvQ29udGV4dFwiO1xuaW1wb3J0IFJvb21BdmF0YXIgZnJvbSBcIi4uL2F2YXRhcnMvUm9vbUF2YXRhclwiO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25TdGF0dXMgfSBmcm9tIFwiLi4vLi4vLi4vc3RvcmVzL2xvY2FsLWVjaG8vRWNob1RyYW5zYWN0aW9uXCI7XG5pbXBvcnQgU3Bpbm5lciBmcm9tIFwiLi4vZWxlbWVudHMvU3Bpbm5lclwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSBcIi4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b25cIjtcbmltcG9ydCB7IFVQREFURV9FVkVOVCB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50UGVnIH0gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgSURpYWxvZ1Byb3BzIH0gZnJvbSBcIi4vSURpYWxvZ1Byb3BzXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElEaWFsb2dQcm9wcyB7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuU2VydmVyT2ZmbGluZURpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VydmVyT2ZmbGluZURpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQ8SVByb3BzPiB7XG4gICAgcHVibGljIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBFY2hvU3RvcmUuaW5zdGFuY2Uub24oVVBEQVRFX0VWRU5ULCB0aGlzLm9uRWNob3NVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIEVjaG9TdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLm9uRWNob3NVcGRhdGVkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRWNob3NVcGRhdGVkID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7IC8vIG5vIHN0YXRlIHRvIHdvcnJ5IGFib3V0XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVuZGVyVGltZWxpbmUoKTogUmVhY3QuUmVhY3RFbGVtZW50W10ge1xuICAgICAgICByZXR1cm4gRWNob1N0b3JlLmluc3RhbmNlLmNvbnRleHRzLm1hcCgoYywgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjLmZpcnN0RmFpbGVkVGltZSkgcmV0dXJuIG51bGw7IC8vIG5vdCB1c2VmdWxcbiAgICAgICAgICAgIGlmICghKGMgaW5zdGFuY2VvZiBSb29tRWNob0NvbnRleHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgcmVuZGVyIHVua25vd24gY29udGV4dDogXCIgKyBjKTtcbiAgICAgICAgICAgIGNvbnN0IGhlYWRlciA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3RpbWVsaW5lX2hlYWRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8Um9vbUF2YXRhciB3aWR0aD17MjR9IGhlaWdodD17MjR9IHJvb209e2Mucm9vbX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2Mucm9vbS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzID0gYy50cmFuc2FjdGlvbnNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHQgPT4gdC5zdGF0dXMgPT09IFRyYW5zYWN0aW9uU3RhdHVzLkVycm9yIHx8IHQuZGlkUHJldmlvdXNseUZhaWwpXG4gICAgICAgICAgICAgICAgLm1hcCgodCwgaikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYnV0dG9uID0gPFNwaW5uZXIgdz17MTl9IGg9ezE5fSAvPjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHQuc3RhdHVzID09PSBUcmFuc2FjdGlvblN0YXR1cy5FcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJsaW5rXCIgb25DbGljaz17KCkgPT4gdC5ydW4oKX0+e190KFwiUmVzZW5kXCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50X2NvbnRleHRfdHhuXCIga2V5PXtgdHhuLSR7an1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90eG5fZGVzY1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dC5hdWRpdE5hbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtidXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dFwiIGtleT17YGNvbnRleHQtJHtpfWB9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NlcnZlck9mZmxpbmVEaWFsb2dfY29udGVudF9jb250ZXh0X3RpbWVzdGFtcFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2Zvcm1hdFRpbWUoYy5maXJzdEZhaWxlZFRpbWUsIFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93VHdlbHZlSG91clRpbWVzdGFtcHNcIikpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXJ2ZXJPZmZsaW5lRGlhbG9nX2NvbnRlbnRfY29udGV4dF90aW1lbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2hlYWRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlbnRyaWVzfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIClcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IHRpbWVsaW5lID0gdGhpcy5yZW5kZXJUaW1lbGluZSgpLmZpbHRlcihjID0+ICEhYyk7IC8vIHJlbW92ZSBudWxscyBmb3IgbmV4dCBjaGVja1xuICAgICAgICBpZiAodGltZWxpbmUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aW1lbGluZSA9IFs8ZGl2IGtleT17MX0+e190KFwiWW91J3JlIGFsbCBjYXVnaHQgdXAuXCIpfTwvZGl2Pl07XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXJ2ZXJOYW1lID0gTWF0cml4Q2xpZW50UGVnLmdldEhvbWVzZXJ2ZXJOYW1lKCk7XG4gICAgICAgIHJldHVybiA8QmFzZURpYWxvZyB0aXRsZT17X3QoXCJTZXJ2ZXIgaXNuJ3QgcmVzcG9uZGluZ1wiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT0nbXhfU2VydmVyT2ZmbGluZURpYWxvZydcbiAgICAgICAgICAgIGNvbnRlbnRJZD0nbXhfRGlhbG9nX2NvbnRlbnQnXG4gICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VydmVyT2ZmbGluZURpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgPHA+e190KFxuICAgICAgICAgICAgICAgICAgICBcIllvdXIgc2VydmVyIGlzbid0IHJlc3BvbmRpbmcgdG8gc29tZSBvZiB5b3VyIHJlcXVlc3RzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiQmVsb3cgYXJlIHNvbWUgb2YgdGhlIG1vc3QgbGlrZWx5IHJlYXNvbnMuXCIsXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiVGhlIHNlcnZlciAoJShzZXJ2ZXJOYW1lKXMpIHRvb2sgdG9vIGxvbmcgdG8gcmVzcG9uZC5cIiwge3NlcnZlck5hbWV9KX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiWW91ciBmaXJld2FsbCBvciBhbnRpLXZpcnVzIGlzIGJsb2NraW5nIHRoZSByZXF1ZXN0LlwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiQSBicm93c2VyIGV4dGVuc2lvbiBpcyBwcmV2ZW50aW5nIHRoZSByZXF1ZXN0LlwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiVGhlIHNlcnZlciBpcyBvZmZsaW5lLlwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiVGhlIHNlcnZlciBoYXMgZGVuaWVkIHlvdXIgcmVxdWVzdC5cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIllvdXIgYXJlYSBpcyBleHBlcmllbmNpbmcgZGlmZmljdWx0aWVzIGNvbm5lY3RpbmcgdG8gdGhlIGludGVybmV0LlwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiQSBjb25uZWN0aW9uIGVycm9yIG9jY3VycmVkIHdoaWxlIHRyeWluZyB0byBjb250YWN0IHRoZSBzZXJ2ZXIuXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJUaGUgc2VydmVyIGlzIG5vdCBjb25maWd1cmVkIHRvIGluZGljYXRlIHdoYXQgdGhlIHByb2JsZW0gaXMgKENPUlMpLlwiKX08L2xpPlxuICAgICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICAgICAgPGhyIC8+XG4gICAgICAgICAgICAgICAgPGgyPntfdChcIlJlY2VudCBjaGFuZ2VzIHRoYXQgaGF2ZSBub3QgeWV0IGJlZW4gcmVjZWl2ZWRcIil9PC9oMj5cbiAgICAgICAgICAgICAgICB7dGltZWxpbmV9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9CYXNlRGlhbG9nPjtcbiAgICB9XG59XG4iXX0=