"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _event = require("matrix-js-sdk/src/models/event");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Markdown = _interopRequireDefault(require("../../../Markdown"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ReportEventDialog = (
/*
 * A dialog for reporting an event.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.ReportEventDialog"), _dec(_class = (_temp = _class2 = class ReportEventDialog extends _react.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onReasonChange", ({
      target: {
        value: reason
      }
    }) => {
      this.setState({
        reason
      });
    });
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onSubmit", async () => {
      if (!this.state.reason || !this.state.reason.trim()) {
        this.setState({
          err: (0, _languageHandler._t)("Please fill why you're reporting.")
        });
        return;
      }

      this.setState({
        busy: true,
        err: null
      });

      try {
        const ev = this.props.mxEvent;
        await _MatrixClientPeg.MatrixClientPeg.get().reportEvent(ev.getRoomId(), ev.getId(), -100, this.state.reason.trim());
        this.props.onFinished(true);
      } catch (e) {
        this.setState({
          busy: false,
          err: e.message
        });
      }
    });
    this.state = {
      reason: "",
      busy: false,
      err: null
    };
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    const Loader = sdk.getComponent('elements.Spinner');
    const Field = sdk.getComponent('elements.Field');
    let error = null;

    if (this.state.err) {
      error = /*#__PURE__*/_react.default.createElement("div", {
        className: "error"
      }, this.state.err);
    }

    let progress = null;

    if (this.state.busy) {
      progress = /*#__PURE__*/_react.default.createElement("div", {
        className: "progress"
      }, /*#__PURE__*/_react.default.createElement(Loader, null));
    }

    const adminMessageMD = _SdkConfig.default.get().reportEvent && _SdkConfig.default.get().reportEvent.adminMessageMD;

    let adminMessage;

    if (adminMessageMD) {
      const html = new _Markdown.default(adminMessageMD).toHTML({
        externalLinks: true
      });
      adminMessage = /*#__PURE__*/_react.default.createElement("p", {
        dangerouslySetInnerHTML: {
          __html: html
        }
      });
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_BugReportDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Report Content to Your Homeserver Administrator'),
      contentId: "mx_ReportEventDialog"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReportEventDialog",
      id: "mx_ReportEventDialog"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Reporting this message will send its unique 'event ID' to the administrator of " + "your homeserver. If messages in this room are encrypted, your homeserver " + "administrator will not be able to read the message text or view any files or images.")), adminMessage, /*#__PURE__*/_react.default.createElement(Field, {
      className: "mx_ReportEventDialog_reason",
      element: "textarea",
      label: (0, _languageHandler._t)("Reason"),
      rows: 5,
      onChange: this._onReasonChange,
      value: this.state.reason,
      disabled: this.state.busy
    }), progress, error), /*#__PURE__*/_react.default.createElement(DialogButtons, {
      primaryButton: (0, _languageHandler._t)("Send report"),
      onPrimaryButtonClick: this._onSubmit,
      focus: true,
      onCancel: this._onCancel,
      disabled: this.state.busy
    }));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  mxEvent: _propTypes.default.instanceOf(_event.MatrixEvent).isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = ReportEventDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUmVwb3J0RXZlbnREaWFsb2cuanMiXSwibmFtZXMiOlsiUmVwb3J0RXZlbnREaWFsb2ciLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInRhcmdldCIsInZhbHVlIiwicmVhc29uIiwic2V0U3RhdGUiLCJvbkZpbmlzaGVkIiwic3RhdGUiLCJ0cmltIiwiZXJyIiwiYnVzeSIsImV2IiwibXhFdmVudCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJlcG9ydEV2ZW50IiwiZ2V0Um9vbUlkIiwiZ2V0SWQiLCJlIiwibWVzc2FnZSIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJEaWFsb2dCdXR0b25zIiwiTG9hZGVyIiwiRmllbGQiLCJlcnJvciIsInByb2dyZXNzIiwiYWRtaW5NZXNzYWdlTUQiLCJTZGtDb25maWciLCJhZG1pbk1lc3NhZ2UiLCJodG1sIiwiTWFya2Rvd24iLCJ0b0hUTUwiLCJleHRlcm5hbExpbmtzIiwiX19odG1sIiwiX29uUmVhc29uQ2hhbmdlIiwiX29uU3VibWl0IiwiX29uQ2FuY2VsIiwiUHJvcFR5cGVzIiwiaW5zdGFuY2VPZiIsIk1hdHJpeEV2ZW50IiwiaXNSZXF1aXJlZCIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFNcUJBLGlCO0FBSnJCO0FBQ0E7QUFDQTtPQUNDLGdEQUFxQixpQ0FBckIsQyxtQ0FBRCxNQUNxQkEsaUJBRHJCLFNBQytDQyxvQkFEL0MsQ0FDNkQ7QUFNekRDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLDJEQVVELENBQUM7QUFBQ0MsTUFBQUEsTUFBTSxFQUFFO0FBQUNDLFFBQUFBLEtBQUssRUFBRUM7QUFBUjtB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dXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBNaWNoYWVsIFRlbGF0eW5za2kgPDd0M2NoZ3V5QGdtYWlsLmNvbT5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtQdXJlQ29tcG9uZW50fSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tIFwicHJvcC10eXBlc1wiO1xuaW1wb3J0IHtNYXRyaXhFdmVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBTZGtDb25maWcgZnJvbSAnLi4vLi4vLi4vU2RrQ29uZmlnJztcbmltcG9ydCBNYXJrZG93biBmcm9tICcuLi8uLi8uLi9NYXJrZG93bic7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLypcbiAqIEEgZGlhbG9nIGZvciByZXBvcnRpbmcgYW4gZXZlbnQuXG4gKi9cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuUmVwb3J0RXZlbnREaWFsb2dcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcG9ydEV2ZW50RGlhbG9nIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLmluc3RhbmNlT2YoTWF0cml4RXZlbnQpLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcmVhc29uOiBcIlwiLFxuICAgICAgICAgICAgYnVzeTogZmFsc2UsXG4gICAgICAgICAgICBlcnI6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgX29uUmVhc29uQ2hhbmdlID0gKHt0YXJnZXQ6IHt2YWx1ZTogcmVhc29ufX0pID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHJlYXNvbiB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICBfb25TdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5yZWFzb24gfHwgIXRoaXMuc3RhdGUucmVhc29uLnRyaW0oKSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgZXJyOiBfdChcIlBsZWFzZSBmaWxsIHdoeSB5b3UncmUgcmVwb3J0aW5nLlwiKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBidXN5OiB0cnVlLFxuICAgICAgICAgICAgZXJyOiBudWxsLFxuICAgICAgICB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZXYgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgICAgICBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkucmVwb3J0RXZlbnQoZXYuZ2V0Um9vbUlkKCksIGV2LmdldElkKCksIC0xMDAsIHRoaXMuc3RhdGUucmVhc29uLnRyaW0oKSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGJ1c3k6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGVycjogZS5tZXNzYWdlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgIGNvbnN0IExvYWRlciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5GaWVsZCcpO1xuXG4gICAgICAgIGxldCBlcnJvciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycikge1xuICAgICAgICAgICAgZXJyb3IgPSA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCI+XG4gICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuZXJyfVxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHByb2dyZXNzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgcHJvZ3Jlc3MgPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwcm9ncmVzc1wiPlxuICAgICAgICAgICAgICAgICAgICA8TG9hZGVyIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWRtaW5NZXNzYWdlTUQgPVxuICAgICAgICAgICAgU2RrQ29uZmlnLmdldCgpLnJlcG9ydEV2ZW50ICYmXG4gICAgICAgICAgICBTZGtDb25maWcuZ2V0KCkucmVwb3J0RXZlbnQuYWRtaW5NZXNzYWdlTUQ7XG4gICAgICAgIGxldCBhZG1pbk1lc3NhZ2U7XG4gICAgICAgIGlmIChhZG1pbk1lc3NhZ2VNRCkge1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9IG5ldyBNYXJrZG93bihhZG1pbk1lc3NhZ2VNRCkudG9IVE1MKHsgZXh0ZXJuYWxMaW5rczogdHJ1ZSB9KTtcbiAgICAgICAgICAgIGFkbWluTWVzc2FnZSA9IDxwIGRhbmdlcm91c2x5U2V0SW5uZXJIVE1MPXt7IF9faHRtbDogaHRtbCB9fSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0J1Z1JlcG9ydERpYWxvZ1wiXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnUmVwb3J0IENvbnRlbnQgdG8gWW91ciBIb21lc2VydmVyIEFkbWluaXN0cmF0b3InKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X1JlcG9ydEV2ZW50RGlhbG9nJ1xuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUmVwb3J0RXZlbnREaWFsb2dcIiBpZD1cIm14X1JlcG9ydEV2ZW50RGlhbG9nXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90KFwiUmVwb3J0aW5nIHRoaXMgbWVzc2FnZSB3aWxsIHNlbmQgaXRzIHVuaXF1ZSAnZXZlbnQgSUQnIHRvIHRoZSBhZG1pbmlzdHJhdG9yIG9mIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ5b3VyIGhvbWVzZXJ2ZXIuIElmIG1lc3NhZ2VzIGluIHRoaXMgcm9vbSBhcmUgZW5jcnlwdGVkLCB5b3VyIGhvbWVzZXJ2ZXIgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFkbWluaXN0cmF0b3Igd2lsbCBub3QgYmUgYWJsZSB0byByZWFkIHRoZSBtZXNzYWdlIHRleHQgb3IgdmlldyBhbnkgZmlsZXMgb3IgaW1hZ2VzLlwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgIHthZG1pbk1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUmVwb3J0RXZlbnREaWFsb2dfcmVhc29uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSZWFzb25cIil9XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dzPXs1fVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uUmVhc29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUucmVhc29ufVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUuYnVzeX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAge3Byb2dyZXNzfVxuICAgICAgICAgICAgICAgICAgICB7ZXJyb3J9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPERpYWxvZ0J1dHRvbnNcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXCJTZW5kIHJlcG9ydFwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBmb2N1cz17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMuX29uQ2FuY2VsfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5zdGF0ZS5idXN5fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19