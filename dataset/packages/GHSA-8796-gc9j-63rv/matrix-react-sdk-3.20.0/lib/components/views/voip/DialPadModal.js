"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _createRoom = require("../../../createRoom");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _Field = _interopRequireDefault(require("../elements/Field"));

var _DialPad = _interopRequireDefault(require("./DialPad"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _ErrorDialog = _interopRequireDefault(require("../../views/dialogs/ErrorDialog"));

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let DialpadModal = (_dec = (0, _replaceableComponent.replaceableComponent)("views.voip.DialPadModal"), _dec(_class = (_temp = class DialpadModal extends React.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "onChange", ev => {
      this.setState({
        value: ev.target.value
      });
    });
    (0, _defineProperty2.default)(this, "onFormSubmit", ev => {
      ev.preventDefault();
      this.onDialPress();
    });
    (0, _defineProperty2.default)(this, "onDigitPress", digit => {
      this.setState({
        value: this.state.value + digit
      });
    });
    (0, _defineProperty2.default)(this, "onDeletePress", () => {
      if (this.state.value.length === 0) return;
      this.setState({
        value: this.state.value.slice(0, -1)
      });
    });
    (0, _defineProperty2.default)(this, "onDialPress", async () => {
      const results = await _CallHandler.default.sharedInstance().pstnLookup(this.state.value);

      if (!results || results.length === 0 || !results[0].userid) {
        _Modal.default.createTrackedDialog('', '', _ErrorDialog.default, {
          title: (0, _languageHandler._t)("Unable to look up phone number"),
          description: (0, _languageHandler._t)("There was an error looking up the phone number")
        });
      }

      const userId = results[0].userid;
      const roomId = await (0, _createRoom.ensureDMExists)(_MatrixClientPeg.MatrixClientPeg.get(), userId);

      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: roomId
      });

      this.props.onFinished(true);
    });
    this.state = {
      value: ''
    };
  }

  render() {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal_header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: "mx_DialPadModal_title"
    }, (0, _languageHandler._t)("Dial pad")), /*#__PURE__*/React.createElement(_AccessibleButton.default, {
      className: "mx_DialPadModal_cancel",
      onClick: this.onCancelClick
    })), /*#__PURE__*/React.createElement("form", {
      onSubmit: this.onFormSubmit
    }, /*#__PURE__*/React.createElement(_Field.default, {
      className: "mx_DialPadModal_field",
      id: "dialpad_number",
      value: this.state.value,
      autoFocus: true,
      onChange: this.onChange
    }))), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal_horizSep"
    }), /*#__PURE__*/React.createElement("div", {
      className: "mx_DialPadModal_dialPad"
    }, /*#__PURE__*/React.createElement(_DialPad.default, {
      hasDialAndDelete: true,
      onDigitPress: this.onDigitPress,
      onDeletePress: this.onDeletePress,
      onDialPress: this.onDialPress
    })));
  }

}, _temp)) || _class);
exports.default = DialpadModal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvRGlhbFBhZE1vZGFsLnRzeCJdLCJuYW1lcyI6WyJEaWFscGFkTW9kYWwiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsImV2Iiwic2V0U3RhdGUiLCJ2YWx1ZSIsInRhcmdldCIsInByZXZlbnREZWZhdWx0Iiwib25EaWFsUHJlc3MiLCJkaWdpdCIsInN0YXRlIiwibGVuZ3RoIiwic2xpY2UiLCJyZXN1bHRzIiwiQ2FsbEhhbmRsZXIiLCJzaGFyZWRJbnN0YW5jZSIsInBzdG5Mb29rdXAiLCJ1c2VyaWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJ1c2VySWQiLCJyb29tSWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyZW5kZXIiLCJvbkNhbmNlbENsaWNrIiwib25Gb3JtU3VibWl0Iiwib25DaGFuZ2UiLCJvbkRpZ2l0UHJlc3MiLCJvbkRlbGV0ZVByZXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBV3FCQSxZLFdBRHBCLGdEQUFxQix5QkFBckIsQyx5QkFBRCxNQUNxQkEsWUFEckIsU0FDMENDLEtBQUssQ0FBQ0M7QUFEaEQ7QUFDOEU7QUFDMUVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlEQU9ILE1BQU07QUFDbEIsV0FBS0EsS0FBTCxDQUFXQyxVQUFYLENBQXNCLEtBQXRCO0FBQ0gsS0FUa0I7QUFBQSxvREFXUEMsRUFBRCxJQUFRO0FBQ2YsV0FBS0MsUUFBTCxDQUFjO0FBQUNDLFFB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YUFGeEI7QUFHSSxNQUFBLFdBQVcsRUFBRSxLQUFLNUI7QUFIdEIsTUFESixDQWRHLENBQVA7QUFzQkg7O0FBekV5RSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBlbnN1cmVETUV4aXN0cyB9IGZyb20gXCIuLi8uLi8uLi9jcmVhdGVSb29tXCI7XG5pbXBvcnQgeyBfdCB9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7IE1hdHJpeENsaWVudFBlZyB9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlQnV0dG9uXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgRGlhbFBhZCBmcm9tICcuL0RpYWxQYWQnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gXCIuLi8uLi8uLi9Nb2RhbFwiO1xuaW1wb3J0IEVycm9yRGlhbG9nIGZyb20gXCIuLi8uLi92aWV3cy9kaWFsb2dzL0Vycm9yRGlhbG9nXCI7XG5pbXBvcnQgQ2FsbEhhbmRsZXIgZnJvbSBcIi4uLy4uLy4uL0NhbGxIYW5kbGVyXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgb25GaW5pc2hlZDogKGJvb2xlYW4pID0+IHZvaWQ7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHZhbHVlOiBzdHJpbmc7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnZvaXAuRGlhbFBhZE1vZGFsXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaWFscGFkTW9kYWwgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogZXYudGFyZ2V0LnZhbHVlfSk7XG4gICAgfVxuXG4gICAgb25Gb3JtU3VibWl0ID0gKGV2KSA9PiB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHRoaXMub25EaWFsUHJlc3MoKTtcbiAgICB9XG5cbiAgICBvbkRpZ2l0UHJlc3MgPSAoZGlnaXQpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IHRoaXMuc3RhdGUudmFsdWUgKyBkaWdpdH0pO1xuICAgIH1cblxuICAgIG9uRGVsZXRlUHJlc3MgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnZhbHVlLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGhpcy5zdGF0ZS52YWx1ZS5zbGljZSgwLCAtMSl9KTtcbiAgICB9XG5cbiAgICBvbkRpYWxQcmVzcyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IENhbGxIYW5kbGVyLnNoYXJlZEluc3RhbmNlKCkucHN0bkxvb2t1cCh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzIHx8IHJlc3VsdHMubGVuZ3RoID09PSAwIHx8ICFyZXN1bHRzWzBdLnVzZXJpZCkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGxvb2sgdXAgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoZXJlIHdhcyBhbiBlcnJvciBsb29raW5nIHVwIHRoZSBwaG9uZSBudW1iZXJcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VySWQgPSByZXN1bHRzWzBdLnVzZXJpZDtcblxuICAgICAgICBjb25zdCByb29tSWQgPSBhd2FpdCBlbnN1cmVETUV4aXN0cyhNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHVzZXJJZCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxQYWRNb2RhbFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX3RpdGxlXCI+e190KFwiRGlhbCBwYWRcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfY2FuY2VsXCIgb25DbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uRm9ybVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfZmllbGRcIiBpZD1cImRpYWxwYWRfbnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfSBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX2hvcml6U2VwXCIgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX2RpYWxQYWRcIj5cbiAgICAgICAgICAgICAgICA8RGlhbFBhZCBoYXNEaWFsQW5kRGVsZXRlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkRpZ2l0UHJlc3M9e3RoaXMub25EaWdpdFByZXNzfVxuICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZVByZXNzPXt0aGlzLm9uRGVsZXRlUHJlc3N9XG4gICAgICAgICAgICAgICAgICAgIG9uRGlhbFByZXNzPXt0aGlzLm9uRGlhbFByZXNzfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==