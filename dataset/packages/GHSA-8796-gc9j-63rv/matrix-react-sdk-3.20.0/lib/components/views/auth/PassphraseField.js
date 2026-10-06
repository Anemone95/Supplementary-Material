"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard3(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _Validation = _interopRequireDefault(require("../elements/Validation"));

var _languageHandler = require("../../../languageHandler");

var _Field = _interopRequireDefault(require("../elements/Field"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let PassphraseField = (_dec = (0, _replaceableComponent.replaceableComponent)("views.auth.PassphraseField"), _dec(_class = (_temp = _class2 = class PassphraseField extends _react.PureComponent
/*:: <IProps>*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "validate", (0, _Validation.default)({
      description: function (complexity) {
        const score = complexity ? complexity.score : 0;
        return /*#__PURE__*/_react.default.createElement("progress", {
          className: "mx_PassphraseField_progress",
          max: 4,
          value: score
        });
      },
      deriveData: async ({
        value
      }) => {
        if (!value) return null;
        const {
          scorePassword
        } = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require('../../../utils/PasswordScorer')));
        return scorePassword(value);
      },
      rules: [{
        key: "required",
        test: ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)(this.props.labelEnterPassword)
      }, {
        key: "complexity",
        test: async function ({
          value
        }, complexity) {
          if (!value) {
            return false;
          }

          const safe = complexity.score >= this.props.minScore;

          const allowUnsafe = _SdkConfig.default.get()["dangerously_allow_unsafe_and_insecure_passwords"];

          return allowUnsafe || safe;
        },
        valid: function (complexity) {
          // Unsafe passwords that are valid are only possible through a
          // configuration flag. We'll print some helper text to signal
          // to the user that their password is allowed, but unsafe.
          if (complexity.score >= this.props.minScore) {
            return (0, _languageHandler._t)(this.props.labelStrongPassword);
          }

          return (0, _languageHandler._t)(this.props.labelAllowedButUnsafe);
        },
        invalid: function (complexity) {
          if (!complexity) {
            return null;
          }

          const {
            feedback
          } = complexity;
          return feedback.warning || feedback.suggestions[0] || (0, _languageHandler._t)("Keep going...");
        }
      }]
    }));
    (0, _defineProperty2.default)(this, "onValidate", async (fieldState
    /*: IFieldState*/
    ) => {
      const result = await this.validate(fieldState);
      this.props.onValidate(result);
      return result;
    });
  }

  render() {
    return /*#__PURE__*/_react.default.createElement(_Field.default, {
      id: this.props.id,
      autoFocus: this.props.autoFocus,
      className: (0, _classnames.default)("mx_PassphraseField", this.props.className),
      ref: this.props.fieldRef,
      type: "password",
      autoComplete: "new-password",
      label: (0, _languageHandler._t)(this.props.label),
      value: this.props.value,
      onChange: this.props.onChange,
      onValidate: this.onValidate
    });
  }

}, (0, _defineProperty2.default)(_class2, "defaultProps", {
  label: (0, _languageHandler._td)("Password"),
  labelEnterPassword: (0, _languageHandler._td)("Enter password"),
  labelStrongPassword: (0, _languageHandler._td)("Nice, strong password!"),
  labelAllowedButUnsafe: (0, _languageHandler._td)("Password is allowed, but unsafe")
}), _temp)) || _class);
var _default = PassphraseField;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkLnRzeCJdLCJuYW1lcyI6WyJQYXNzcGhyYXNlRmllbGQiLCJQdXJlQ29tcG9uZW50IiwiZGVzY3JpcHRpb24iLCJjb21wbGV4aXR5Iiwic2NvcmUiLCJkZXJpdmVEYXRhIiwidmFsdWUiLCJzY29yZVBhc3N3b3JkIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImludmFsaWQiLCJwcm9wcyIsImxhYmVsRW50ZXJQYXNzd29yZCIsInNhZmUiLCJtaW5TY29yZSIsImFsbG93VW5zYWZlIiwiU2RrQ29uZmlnIiwiZ2V0IiwidmFsaWQiLCJsYWJlbFN0cm9uZ1Bhc3N3b3JkIiwibGFiZWxBbGxvd2VkQnV0VW5zYWZlIiwiZmVlZGJhY2siLCJ3YXJuaW5nIiwic3VnZ2VzdGlvbnMiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGUiLCJvblZhbGlkYXRlIiwicmVuZGVyIiwiaWQiLCJhdXRvRm9jdXMiLCJjbGFzc05hbWUiLCJmaWVsZFJlZiIsImxhYmVsIiwib25DaGFuZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQW9CTUEsZSxXQURMLGdEQUFxQiw0QkFBckIsQyxtQ0FBRCxNQUNNQSxlQUROLFNBQzhCQztBQUQ5QjtBQUNvRDtBQUFBO0FBQUE7QUFBQSxvREFRckIseUJBQTBDO0FBQ2pFQyxNQUFBQSxXQUFXLEVBQUUsVUFBU0MsVUFBVCxFQUFxQjtBQUM5QixjQUFNQyxLQUFLLEdBQUdELFVBQVUsR0FBR0EsVUFBVSxDQUFDQyxLQUFkLEdBQXNCLENBQTlDO0FBQ0EsNEJBQU87QUFBVSxVQUFBLFNBQVMsRUFBQyw2QkFBcEI7QUFBa0QsVUFBQSxHQUFHLEVBQUUsQ0FBdkQ7QUFBMEQsVUFBQSxLQUFLLEVBQUVBO0FBQWpFLFVBQVA7QUFDSCxP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QUFMLENBQVd1QixRQVRsQjtBQVVILE1BQUEsVUFBVSxFQUFFLEtBQUtQO0FBVmQsTUFBUDtBQVlIOztBQXpFK0MsQyx5REFDMUI7QUFDbEJNLEVBQUFBLEtBQUssRUFBRSwwQkFBSSxVQUFKLENBRFc7QUFFbEJyQixFQUFBQSxrQkFBa0IsRUFBRSwwQkFBSSxnQkFBSixDQUZGO0FBR2xCTyxFQUFBQSxtQkFBbUIsRUFBRSwwQkFBSSx3QkFBSixDQUhIO0FBSWxCQyxFQUFBQSxxQkFBcUIsRUFBRSwwQkFBSSxpQ0FBSjtBQUpMLEM7ZUEyRVh0QixlIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7UHVyZUNvbXBvbmVudCwgUmVmQ2FsbGJhY2ssIFJlZk9iamVjdH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuaW1wb3J0IHp4Y3ZibiBmcm9tIFwienhjdmJuXCI7XG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uLy4uLy4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uLCB7SUZpZWxkU3RhdGUsIElWYWxpZGF0aW9uUmVzdWx0fSBmcm9tIFwiLi4vZWxlbWVudHMvVmFsaWRhdGlvblwiO1xuaW1wb3J0IHtfdCwgX3RkfSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgRmllbGQsIHtJSW5wdXRQcm9wc30gZnJvbSBcIi4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIE9taXQ8SUlucHV0UHJvcHMsIFwib25WYWxpZGF0ZVwiPiB7XG4gICAgYXV0b0ZvY3VzPzogYm9vbGVhbjtcbiAgICBpZD86IHN0cmluZztcbiAgICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gICAgbWluU2NvcmU6IDAgfCAxIHwgMiB8IDMgfCA0O1xuICAgIHZhbHVlOiBzdHJpbmc7XG4gICAgZmllbGRSZWY/OiBSZWZDYWxsYmFjazxGaWVsZD4gfCBSZWZPYmplY3Q8RmllbGQ+O1xuXG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgbGFiZWxFbnRlclBhc3N3b3JkPzogc3RyaW5nO1xuICAgIGxhYmVsU3Ryb25nUGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgbGFiZWxBbGxvd2VkQnV0VW5zYWZlPzogc3RyaW5nO1xuXG4gICAgb25DaGFuZ2UoZXY6IFJlYWN0LkZvcm1FdmVudDxIVE1MRWxlbWVudD4pO1xuICAgIG9uVmFsaWRhdGUocmVzdWx0OiBJVmFsaWRhdGlvblJlc3VsdCk7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmF1dGguUGFzc3BocmFzZUZpZWxkXCIpXG5jbGFzcyBQYXNzcGhyYXNlRmllbGQgZXh0ZW5kcyBQdXJlQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIGxhYmVsOiBfdGQoXCJQYXNzd29yZFwiKSxcbiAgICAgICAgbGFiZWxFbnRlclBhc3N3b3JkOiBfdGQoXCJFbnRlciBwYXNzd29yZFwiKSxcbiAgICAgICAgbGFiZWxTdHJvbmdQYXNzd29yZDogX3RkKFwiTmljZSwgc3Ryb25nIHBhc3N3b3JkIVwiKSxcbiAgICAgICAgbGFiZWxBbGxvd2VkQnV0VW5zYWZlOiBfdGQoXCJQYXNzd29yZCBpcyBhbGxvd2VkLCBidXQgdW5zYWZlXCIpLFxuICAgIH07XG5cbiAgICBwdWJsaWMgcmVhZG9ubHkgdmFsaWRhdGUgPSB3aXRoVmFsaWRhdGlvbjx0aGlzLCB6eGN2Ym4uWlhDVkJOUmVzdWx0Pih7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBmdW5jdGlvbihjb21wbGV4aXR5KSB7XG4gICAgICAgICAgICBjb25zdCBzY29yZSA9IGNvbXBsZXhpdHkgPyBjb21wbGV4aXR5LnNjb3JlIDogMDtcbiAgICAgICAgICAgIHJldHVybiA8cHJvZ3Jlc3MgY2xhc3NOYW1lPVwibXhfUGFzc3BocmFzZUZpZWxkX3Byb2dyZXNzXCIgbWF4PXs0fSB2YWx1ZT17c2NvcmV9IC8+O1xuICAgICAgICB9LFxuICAgICAgICBkZXJpdmVEYXRhOiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IHsgc2NvcmVQYXNzd29yZCB9ID0gYXdhaXQgaW1wb3J0KCcuLi8uLi8uLi91dGlscy9QYXNzd29yZFNjb3JlcicpO1xuICAgICAgICAgICAgcmV0dXJuIHNjb3JlUGFzc3dvcmQodmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICBydWxlczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJyZXF1aXJlZFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6ICh7IHZhbHVlLCBhbGxvd0VtcHR5IH0pID0+IGFsbG93RW1wdHkgfHwgISF2YWx1ZSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdCh0aGlzLnByb3BzLmxhYmVsRW50ZXJQYXNzd29yZCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJjb21wbGV4aXR5XCIsXG4gICAgICAgICAgICAgICAgdGVzdDogYXN5bmMgZnVuY3Rpb24oeyB2YWx1ZSB9LCBjb21wbGV4aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBzYWZlID0gY29tcGxleGl0eS5zY29yZSA+PSB0aGlzLnByb3BzLm1pblNjb3JlO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGxvd1Vuc2FmZSA9IFNka0NvbmZpZy5nZXQoKVtcImRhbmdlcm91c2x5X2FsbG93X3Vuc2FmZV9hbmRfaW5zZWN1cmVfcGFzc3dvcmRzXCJdO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWxsb3dVbnNhZmUgfHwgc2FmZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZhbGlkOiBmdW5jdGlvbihjb21wbGV4aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFVuc2FmZSBwYXNzd29yZHMgdGhhdCBhcmUgdmFsaWQgYXJlIG9ubHkgcG9zc2libGUgdGhyb3VnaCBhXG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbmZpZ3VyYXRpb24gZmxhZy4gV2UnbGwgcHJpbnQgc29tZSBoZWxwZXIgdGV4dCB0byBzaWduYWxcbiAgICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHVzZXIgdGhhdCB0aGVpciBwYXNzd29yZCBpcyBhbGxvd2VkLCBidXQgdW5zYWZlLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY29tcGxleGl0eS5zY29yZSA+PSB0aGlzLnByb3BzLm1pblNjb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QodGhpcy5wcm9wcy5sYWJlbFN0cm9uZ1Bhc3N3b3JkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3QodGhpcy5wcm9wcy5sYWJlbEFsbG93ZWRCdXRVbnNhZmUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogZnVuY3Rpb24oY29tcGxleGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbXBsZXhpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZmVlZGJhY2sgfSA9IGNvbXBsZXhpdHk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmZWVkYmFjay53YXJuaW5nIHx8IGZlZWRiYWNrLnN1Z2dlc3Rpb25zWzBdIHx8IF90KFwiS2VlcCBnb2luZy4uLlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIG9uVmFsaWRhdGUgPSBhc3luYyAoZmllbGRTdGF0ZTogSUZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy52YWxpZGF0ZShmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vblZhbGlkYXRlKHJlc3VsdCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxGaWVsZFxuICAgICAgICAgICAgaWQ9e3RoaXMucHJvcHMuaWR9XG4gICAgICAgICAgICBhdXRvRm9jdXM9e3RoaXMucHJvcHMuYXV0b0ZvY3VzfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfUGFzc3BocmFzZUZpZWxkXCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lKX1cbiAgICAgICAgICAgIHJlZj17dGhpcy5wcm9wcy5maWVsZFJlZn1cbiAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICBhdXRvQ29tcGxldGU9XCJuZXctcGFzc3dvcmRcIlxuICAgICAgICAgICAgbGFiZWw9e190KHRoaXMucHJvcHMubGFiZWwpfVxuICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMudmFsdWV9XG4gICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5wcm9wcy5vbkNoYW5nZX1cbiAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMub25WYWxpZGF0ZX1cbiAgICAgICAgLz47XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQYXNzcGhyYXNlRmllbGQ7XG4iXX0=