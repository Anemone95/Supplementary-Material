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

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let StatusMessageContextMenu = (_dec = (0, _replaceableComponent.replaceableComponent)("views.context_menus.StatusMessageContextMenu"), _dec(_class = (_temp = _class2 = class StatusMessageContextMenu extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onStatusMessageCommitted", () => {
      // The `User` object has observed a status message change.
      this.setState({
        message: this.comittedStatusMessage,
        waiting: false
      });
    });
    (0, _defineProperty2.default)(this, "_onClearClick", e => {
      _MatrixClientPeg.MatrixClientPeg.get()._unstable_setStatusMessage("");

      this.setState({
        waiting: true
      });
    });
    (0, _defineProperty2.default)(this, "_onSubmit", e => {
      e.preventDefault();

      _MatrixClientPeg.MatrixClientPeg.get()._unstable_setStatusMessage(this.state.message);

      this.setState({
        waiting: true
      });
    });
    (0, _defineProperty2.default)(this, "_onStatusChange", e => {
      // The input field's value was changed.
      this.setState({
        message: e.target.value
      });
    });
    this.state = {
      message: this.comittedStatusMessage
    };
  }

  componentDidMount() {
    const {
      user
    } = this.props;

    if (!user) {
      return;
    }

    user.on("User._unstable_statusMessage", this._onStatusMessageCommitted);
  }

  componentWillUnmount() {
    const {
      user
    } = this.props;

    if (!user) {
      return;
    }

    user.removeListener("User._unstable_statusMessage", this._onStatusMessageCommitted);
  }

  get comittedStatusMessage() {
    return this.props.user ? this.props.user._unstable_statusMessage : "";
  }

  render() {
    const Spinner = sdk.getComponent('views.elements.Spinner');
    let actionButton;

    if (this.comittedStatusMessage) {
      if (this.state.message === this.comittedStatusMessage) {
        actionButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_StatusMessageContextMenu_clear",
          onClick: this._onClearClick
        }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Clear status")));
      } else {
        actionButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
          className: "mx_StatusMessageContextMenu_submit",
          onClick: this._onSubmit
        }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Update status")));
      }
    } else {
      actionButton = /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        className: "mx_StatusMessageContextMenu_submit",
        disabled: !this.state.message,
        onClick: this._onSubmit
      }, /*#__PURE__*/_react.default.createElement("span", null, (0, _languageHandler._t)("Set status")));
    }

    let spinner = null;

    if (this.state.waiting) {
      spinner = /*#__PURE__*/_react.default.createElement(Spinner, {
        w: "24",
        h: "24"
      });
    }

    const form = /*#__PURE__*/_react.default.createElement("form", {
      className: "mx_StatusMessageContextMenu_form",
      autoComplete: "off",
      onSubmit: this._onSubmit
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "text",
      className: "mx_StatusMessageContextMenu_message",
      key: "message",
      placeholder: (0, _languageHandler._t)("Set a new status..."),
      autoFocus: true,
      maxLength: "60",
      value: this.state.message,
      onChange: this._onStatusChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_StatusMessageContextMenu_actionContainer"
    }, actionButton, spinner));

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_StatusMessageContextMenu"
    }, form);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // js-sdk User object. Not required because it might not exist.
  user: _propTypes.default.object
}), _temp)) || _class);
exports.default = StatusMessageContextMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51LmpzIl0sIm5hbWVzIjpbIlN0YXR1c01lc3NhZ2VDb250ZXh0TWVudSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwibWVzc2FnZSIsImNvbWl0dGVkU3RhdHVzTWVzc2FnZSIsIndhaXRpbmciLCJlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiX3Vuc3RhYmxlX3NldFN0YXR1c01lc3NhZ2UiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXRlIiwidGFyZ2V0IiwidmFsdWUiLCJjb21wb25lbnREaWRNb3VudCIsInVzZXIiLCJvbiIsIl9vblN0YXR1c01lc3NhZ2VDb21taXR0ZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2UiLCJyZW5kZXIiLCJTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiYWN0aW9uQnV0dG9uIiwiX29uQ2xlYXJDbGljayIsIl9vblN1Ym1pdCIsInNwaW5uZXIiLCJmb3JtIiwiX29uU3RhdHVzQ2hhbmdlIiwiUHJvcFR5cGVzIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBR3FCQSx3QixXQURwQixnREFBcUIsOENBQXJCLEMsbUNBQUQsTUFDcUJBLHdCQURyQixTQUNzREMsZUFBTUMsU0FENUQsQ0FDc0U7QUFNbEVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHFFQStCUyxNQUFNO0FBQzlCO0FBQ0EsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLE9BQU8sRUFBRSxLQUFLQyxxQkFESjtBQUVWQyxRQUFBQSxPQUFPLEVBQUU7QUFG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LFFBQVY7QUFDSDs7QUFFRCxVQUFNQyxJQUFJLGdCQUFHO0FBQU0sTUFBQSxTQUFTLEVBQUMsa0NBQWhCO0FBQ1QsTUFBQSxZQUFZLEVBQUMsS0FESjtBQUNVLE1BQUEsUUFBUSxFQUFFLEtBQUtGO0FBRHpCLG9CQUdUO0FBQU8sTUFBQSxJQUFJLEVBQUMsTUFBWjtBQUFtQixNQUFBLFNBQVMsRUFBQyxxQ0FBN0I7QUFDSSxNQUFBLEdBQUcsRUFBQyxTQURSO0FBQ2tCLE1BQUEsV0FBVyxFQUFFLHlCQUFHLHFCQUFILENBRC9CO0FBRUksTUFBQSxTQUFTLEVBQUUsSUFGZjtBQUVxQixNQUFBLFNBQVMsRUFBQyxJQUYvQjtBQUVvQyxNQUFBLEtBQUssRUFBRSxLQUFLaEIsS0FBTCxDQUFXUixPQUZ0RDtBQUdJLE1BQUEsUUFBUSxFQUFFLEtBQUsyQjtBQUhuQixNQUhTLGVBUVQ7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tMLFlBREwsRUFFS0csT0FGTCxDQVJTLENBQWI7O0FBY0Esd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0RDLElBREMsQ0FBUDtBQUdIOztBQW5IaUUsQyxzREFDL0M7QUFDZjtBQUNBZCxFQUFBQSxJQUFJLEVBQUVnQixtQkFBVUM7QUFGRCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE4IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tICcuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5jb250ZXh0X21lbnVzLlN0YXR1c01lc3NhZ2VDb250ZXh0TWVudVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBqcy1zZGsgVXNlciBvYmplY3QuIE5vdCByZXF1aXJlZCBiZWNhdXNlIGl0IG1pZ2h0IG5vdCBleGlzdC5cbiAgICAgICAgdXNlcjogUHJvcFR5cGVzLm9iamVjdCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbWl0dGVkU3RhdHVzTWVzc2FnZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgY29uc3QgeyB1c2VyIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB1c2VyLm9uKFwiVXNlci5fdW5zdGFibGVfc3RhdHVzTWVzc2FnZVwiLCB0aGlzLl9vblN0YXR1c01lc3NhZ2VDb21taXR0ZWQpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBjb25zdCB7IHVzZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHVzZXIucmVtb3ZlTGlzdGVuZXIoXG4gICAgICAgICAgICBcIlVzZXIuX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2VcIixcbiAgICAgICAgICAgIHRoaXMuX29uU3RhdHVzTWVzc2FnZUNvbW1pdHRlZCxcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBnZXQgY29taXR0ZWRTdGF0dXNNZXNzYWdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy51c2VyID8gdGhpcy5wcm9wcy51c2VyLl91bnN0YWJsZV9zdGF0dXNNZXNzYWdlIDogXCJcIjtcbiAgICB9XG5cbiAgICBfb25TdGF0dXNNZXNzYWdlQ29tbWl0dGVkID0gKCkgPT4ge1xuICAgICAgICAvLyBUaGUgYFVzZXJgIG9iamVjdCBoYXMgb2JzZXJ2ZWQgYSBzdGF0dXMgbWVzc2FnZSBjaGFuZ2UuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5jb21pdHRlZFN0YXR1c01lc3NhZ2UsXG4gICAgICAgICAgICB3YWl0aW5nOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkNsZWFyQ2xpY2sgPSAoZSkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuX3Vuc3RhYmxlX3NldFN0YXR1c01lc3NhZ2UoXCJcIik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgd2FpdGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblN1Ym1pdCA9IChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLl91bnN0YWJsZV9zZXRTdGF0dXNNZXNzYWdlKHRoaXMuc3RhdGUubWVzc2FnZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgd2FpdGluZzogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblN0YXR1c0NoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgIC8vIFRoZSBpbnB1dCBmaWVsZCdzIHZhbHVlIHdhcyBjaGFuZ2VkLlxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuU3Bpbm5lcicpO1xuXG4gICAgICAgIGxldCBhY3Rpb25CdXR0b247XG4gICAgICAgIGlmICh0aGlzLmNvbWl0dGVkU3RhdHVzTWVzc2FnZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVzc2FnZSA9PT0gdGhpcy5jb21pdHRlZFN0YXR1c01lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBhY3Rpb25CdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVfY2xlYXJcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vbkNsZWFyQ2xpY2t9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJDbGVhciBzdGF0dXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFjdGlvbkJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1N0YXR1c01lc3NhZ2VDb250ZXh0TWVudV9zdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vblN1Ym1pdH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntfdChcIlVwZGF0ZSBzdGF0dXNcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3Rpb25CdXR0b24gPSA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVfc3VibWl0XCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17IXRoaXMuc3RhdGUubWVzc2FnZX0gb25DbGljaz17dGhpcy5fb25TdWJtaXR9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+e190KFwiU2V0IHN0YXR1c1wiKX08L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHNwaW5uZXIgPSBudWxsO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS53YWl0aW5nKSB7XG4gICAgICAgICAgICBzcGlubmVyID0gPFNwaW5uZXIgdz1cIjI0XCIgaD1cIjI0XCIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmb3JtID0gPGZvcm0gY2xhc3NOYW1lPVwibXhfU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51X2Zvcm1cIlxuICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwib2ZmXCIgb25TdWJtaXQ9e3RoaXMuX29uU3VibWl0fVxuICAgICAgICA+XG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVfbWVzc2FnZVwiXG4gICAgICAgICAgICAgICAga2V5PVwibWVzc2FnZVwiIHBsYWNlaG9sZGVyPXtfdChcIlNldCBhIG5ldyBzdGF0dXMuLi5cIil9XG4gICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfSBtYXhMZW5ndGg9XCI2MFwiIHZhbHVlPXt0aGlzLnN0YXRlLm1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uU3RhdHVzQ2hhbmdlfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51X2FjdGlvbkNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgIHthY3Rpb25CdXR0b259XG4gICAgICAgICAgICAgICAge3NwaW5uZXJ9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9mb3JtPjtcblxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVcIj5cbiAgICAgICAgICAgIHsgZm9ybSB9XG4gICAgICAgIDwvZGl2PjtcbiAgICB9XG59XG4iXX0=