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

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../index"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2018 New Vector Ltd

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
class StatusMessageContextMenu extends _react.default.Component {
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

}

exports.default = StatusMessageContextMenu;
(0, _defineProperty2.default)(StatusMessageContextMenu, "propTypes", {
  // js-sdk User object. Not required because it might not exist.
  user: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51LmpzIl0sIm5hbWVzIjpbIlN0YXR1c01lc3NhZ2VDb250ZXh0TWVudSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInNldFN0YXRlIiwibWVzc2FnZSIsImNvbWl0dGVkU3RhdHVzTWVzc2FnZSIsIndhaXRpbmciLCJlIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiX3Vuc3RhYmxlX3NldFN0YXR1c01lc3NhZ2UiLCJwcmV2ZW50RGVmYXVsdCIsInN0YXRlIiwidGFyZ2V0IiwidmFsdWUiLCJjb21wb25lbnREaWRNb3VudCIsInVzZXIiLCJvbiIsIl9vblN0YXR1c01lc3NhZ2VDb21taXR0ZWQiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2UiLCJyZW5kZXIiLCJTcGlubmVyIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiYWN0aW9uQnV0dG9uIiwiX29uQ2xlYXJDbGljayIsIl9vblN1Ym1pdCIsInNwaW5uZXIiLCJmb3JtIiwiX29uU3RhdHVzQ2hhbmdlIiwiUHJvcFR5cGVzIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTZSxNQUFNQSx3QkFBTixTQUF1Q0MsZUFBTUMsU0FBN0MsQ0FBdUQ7QUFNbEVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHFFQStCUyxNQUFNO0FBQzlCO0FBQ0EsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLE9BQU8sRUFBRSxLQUFL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QyxJQUFYO0FBQWdCLFFBQUEsQ0FBQyxFQUFDO0FBQWxCLFFBQVY7QUFDSDs7QUFFRCxVQUFNQyxJQUFJLGdCQUFHO0FBQU0sTUFBQSxTQUFTLEVBQUMsa0NBQWhCO0FBQ1QsTUFBQSxZQUFZLEVBQUMsS0FESjtBQUNVLE1BQUEsUUFBUSxFQUFFLEtBQUtGO0FBRHpCLG9CQUdUO0FBQU8sTUFBQSxJQUFJLEVBQUMsTUFBWjtBQUFtQixNQUFBLFNBQVMsRUFBQyxxQ0FBN0I7QUFDSSxNQUFBLEdBQUcsRUFBQyxTQURSO0FBQ2tCLE1BQUEsV0FBVyxFQUFFLHlCQUFHLHFCQUFILENBRC9CO0FBRUksTUFBQSxTQUFTLEVBQUUsSUFGZjtBQUVxQixNQUFBLFNBQVMsRUFBQyxJQUYvQjtBQUVvQyxNQUFBLEtBQUssRUFBRSxLQUFLaEIsS0FBTCxDQUFXUixPQUZ0RDtBQUdJLE1BQUEsUUFBUSxFQUFFLEtBQUsyQjtBQUhuQixNQUhTLGVBUVQ7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tMLFlBREwsRUFFS0csT0FGTCxDQVJTLENBQWI7O0FBY0Esd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0RDLElBREMsQ0FBUDtBQUdIOztBQW5IaUU7Ozs4QkFBakRoQyx3QixlQUNFO0FBQ2Y7QUFDQWtCLEVBQUFBLElBQUksRUFBRWdCLG1CQUFVQztBQUZELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0dXNNZXNzYWdlQ29udGV4dE1lbnUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8vIGpzLXNkayBVc2VyIG9iamVjdC4gTm90IHJlcXVpcmVkIGJlY2F1c2UgaXQgbWlnaHQgbm90IGV4aXN0LlxuICAgICAgICB1c2VyOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMuY29taXR0ZWRTdGF0dXNNZXNzYWdlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCB7IHVzZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHVzZXIub24oXCJVc2VyLl91bnN0YWJsZV9zdGF0dXNNZXNzYWdlXCIsIHRoaXMuX29uU3RhdHVzTWVzc2FnZUNvbW1pdHRlZCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHsgdXNlciB9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdXNlci5yZW1vdmVMaXN0ZW5lcihcbiAgICAgICAgICAgIFwiVXNlci5fdW5zdGFibGVfc3RhdHVzTWVzc2FnZVwiLFxuICAgICAgICAgICAgdGhpcy5fb25TdGF0dXNNZXNzYWdlQ29tbWl0dGVkLFxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldCBjb21pdHRlZFN0YXR1c01lc3NhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnVzZXIgPyB0aGlzLnByb3BzLnVzZXIuX3Vuc3RhYmxlX3N0YXR1c01lc3NhZ2UgOiBcIlwiO1xuICAgIH1cblxuICAgIF9vblN0YXR1c01lc3NhZ2VDb21taXR0ZWQgPSAoKSA9PiB7XG4gICAgICAgIC8vIFRoZSBgVXNlcmAgb2JqZWN0IGhhcyBvYnNlcnZlZCBhIHN0YXR1cyBtZXNzYWdlIGNoYW5nZS5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbWl0dGVkU3RhdHVzTWVzc2FnZSxcbiAgICAgICAgICAgIHdhaXRpbmc6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2xlYXJDbGljayA9IChlKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5fdW5zdGFibGVfc2V0U3RhdHVzTWVzc2FnZShcIlwiKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB3YWl0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU3VibWl0ID0gKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuX3Vuc3RhYmxlX3NldFN0YXR1c01lc3NhZ2UodGhpcy5zdGF0ZS5tZXNzYWdlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB3YWl0aW5nOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uU3RhdHVzQ2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgLy8gVGhlIGlucHV0IGZpZWxkJ3MgdmFsdWUgd2FzIGNoYW5nZWQuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWVzc2FnZTogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TcGlubmVyJyk7XG5cbiAgICAgICAgbGV0IGFjdGlvbkJ1dHRvbjtcbiAgICAgICAgaWYgKHRoaXMuY29taXR0ZWRTdGF0dXNNZXNzYWdlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5tZXNzYWdlID09PSB0aGlzLmNvbWl0dGVkU3RhdHVzTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbkJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1N0YXR1c01lc3NhZ2VDb250ZXh0TWVudV9jbGVhclwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xlYXJDbGlja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntfdChcIkNsZWFyIHN0YXR1c1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uID0gPEFjY2Vzc2libGVCdXR0b24gY2xhc3NOYW1lPVwibXhfU3RhdHVzTWVzc2FnZUNvbnRleHRNZW51X3N1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uU3VibWl0fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+e190KFwiVXBkYXRlIHN0YXR1c1wiKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFjdGlvbkJ1dHRvbiA9IDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT1cIm14X1N0YXR1c01lc3NhZ2VDb250ZXh0TWVudV9zdWJtaXRcIlxuICAgICAgICAgICAgICAgIGRpc2FibGVkPXshdGhpcy5zdGF0ZS5tZXNzYWdlfSBvbkNsaWNrPXt0aGlzLl9vblN1Ym1pdH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj57X3QoXCJTZXQgc3RhdHVzXCIpfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3Bpbm5lciA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLndhaXRpbmcpIHtcbiAgICAgICAgICAgIHNwaW5uZXIgPSA8U3Bpbm5lciB3PVwiMjRcIiBoPVwiMjRcIiAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZvcm0gPSA8Zm9ybSBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVfZm9ybVwiXG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJvZmZcIiBvblN1Ym1pdD17dGhpcy5fb25TdWJtaXR9XG4gICAgICAgID5cbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cIm14X1N0YXR1c01lc3NhZ2VDb250ZXh0TWVudV9tZXNzYWdlXCJcbiAgICAgICAgICAgICAgICBrZXk9XCJtZXNzYWdlXCIgcGxhY2Vob2xkZXI9e190KFwiU2V0IGEgbmV3IHN0YXR1cy4uLlwiKX1cbiAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9IG1heExlbmd0aD1cIjYwXCIgdmFsdWU9e3RoaXMuc3RhdGUubWVzc2FnZX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25TdGF0dXNDaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TdGF0dXNNZXNzYWdlQ29udGV4dE1lbnVfYWN0aW9uQ29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAge2FjdGlvbkJ1dHRvbn1cbiAgICAgICAgICAgICAgICB7c3Bpbm5lcn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Zvcm0+O1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1N0YXR1c01lc3NhZ2VDb250ZXh0TWVudVwiPlxuICAgICAgICAgICAgeyBmb3JtIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==