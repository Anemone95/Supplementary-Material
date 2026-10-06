"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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
class DialpadModal extends React.PureComponent
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
      const results = await _MatrixClientPeg.MatrixClientPeg.get().getThirdpartyUser('im.vector.protocol.pstn', {
        'm.id.phone': this.state.value
      });

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

}

exports.default = DialpadModal;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvRGlhbFBhZE1vZGFsLnRzeCJdLCJuYW1lcyI6WyJEaWFscGFkTW9kYWwiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwib25GaW5pc2hlZCIsImV2Iiwic2V0U3RhdGUiLCJ2YWx1ZSIsInRhcmdldCIsInByZXZlbnREZWZhdWx0Iiwib25EaWFsUHJlc3MiLCJkaWdpdCIsInN0YXRlIiwibGVuZ3RoIiwic2xpY2UiLCJyZXN1bHRzIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VGhpcmRwYXJ0eVVzZXIiLCJ1c2VyaWQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJ1c2VySWQiLCJyb29tSWQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyZW5kZXIiLCJvbkNhbmNlbENsaWNrIiwib25Gb3JtU3VibWl0Iiwib25DaGFuZ2UiLCJvbkRpZ2l0UHJlc3MiLCJvbkRlbGV0ZVByZXNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXpCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFxQmUsTUFBTUEsWUFBTixTQUEyQkMsS0FBSyxDQUFDQztBQUFqQztBQUErRDtBQUMxRUMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUseURBT0gsTUFBTTtBQUNsQixXQUFLQSxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQVRrQjtBQUFBLG9EQVdQQyxFQUFELElBQVE7QUFDZixXQUFLQyxRQUFMLENBQWM7QUFB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LEtBQUtDLFlBRHZCO0FBRUksTUFBQSxhQUFhLEVBQUUsS0FBS0MsYUFGeEI7QUFHSSxNQUFBLFdBQVcsRUFBRSxLQUFLMUI7QUFIdEIsTUFESixDQWRHLENBQVA7QUFzQkg7O0FBM0V5RSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgZW5zdXJlRE1FeGlzdHMgfSBmcm9tIFwiLi4vLi4vLi4vY3JlYXRlUm9vbVwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IEZpZWxkIGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuaW1wb3J0IERpYWxQYWQgZnJvbSAnLi9EaWFsUGFkJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCBFcnJvckRpYWxvZyBmcm9tIFwiLi4vLi4vdmlld3MvZGlhbG9ncy9FcnJvckRpYWxvZ1wiO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBvbkZpbmlzaGVkOiAoYm9vbGVhbikgPT4gdm9pZDtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgdmFsdWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGlhbHBhZE1vZGFsIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfVxuXG4gICAgb25DaGFuZ2UgPSAoZXYpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IGV2LnRhcmdldC52YWx1ZX0pO1xuICAgIH1cblxuICAgIG9uRm9ybVN1Ym1pdCA9IChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB0aGlzLm9uRGlhbFByZXNzKCk7XG4gICAgfVxuXG4gICAgb25EaWdpdFByZXNzID0gKGRpZ2l0KSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnN0YXRlLnZhbHVlICsgZGlnaXR9KTtcbiAgICB9XG5cbiAgICBvbkRlbGV0ZVByZXNzID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS52YWx1ZS5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IHRoaXMuc3RhdGUudmFsdWUuc2xpY2UoMCwgLTEpfSk7XG4gICAgfVxuXG4gICAgb25EaWFsUHJlc3MgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VGhpcmRwYXJ0eVVzZXIoJ2ltLnZlY3Rvci5wcm90b2NvbC5wc3RuJywge1xuICAgICAgICAgICAgJ20uaWQucGhvbmUnOiB0aGlzLnN0YXRlLnZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFyZXN1bHRzIHx8IHJlc3VsdHMubGVuZ3RoID09PSAwIHx8ICFyZXN1bHRzWzBdLnVzZXJpZCkge1xuICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5hYmxlIHRvIGxvb2sgdXAgcGhvbmUgbnVtYmVyXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcIlRoZXJlIHdhcyBhbiBlcnJvciBsb29raW5nIHVwIHRoZSBwaG9uZSBudW1iZXJcIiksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB1c2VySWQgPSByZXN1bHRzWzBdLnVzZXJpZDtcblxuICAgICAgICBjb25zdCByb29tSWQgPSBhd2FpdCBlbnN1cmVETUV4aXN0cyhNYXRyaXhDbGllbnRQZWcuZ2V0KCksIHVzZXJJZCk7XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiByb29tSWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxQYWRNb2RhbFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfaGVhZGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX3RpdGxlXCI+e190KFwiRGlhbCBwYWRcIil9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfY2FuY2VsXCIgb25DbGljaz17dGhpcy5vbkNhbmNlbENsaWNrfSAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uRm9ybVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBjbGFzc05hbWU9XCJteF9EaWFsUGFkTW9kYWxfZmllbGRcIiBpZD1cImRpYWxwYWRfbnVtYmVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfSBhdXRvRm9jdXM9e3RydWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX2hvcml6U2VwXCIgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbFBhZE1vZGFsX2RpYWxQYWRcIj5cbiAgICAgICAgICAgICAgICA8RGlhbFBhZCBoYXNEaWFsQW5kRGVsZXRlPXt0cnVlfVxuICAgICAgICAgICAgICAgICAgICBvbkRpZ2l0UHJlc3M9e3RoaXMub25EaWdpdFByZXNzfVxuICAgICAgICAgICAgICAgICAgICBvbkRlbGV0ZVByZXNzPXt0aGlzLm9uRGVsZXRlUHJlc3N9XG4gICAgICAgICAgICAgICAgICAgIG9uRGlhbFByZXNzPXt0aGlzLm9uRGlhbFByZXNzfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==