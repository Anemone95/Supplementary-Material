"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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
class PassphraseField extends _react.PureComponent
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

}

(0, _defineProperty2.default)(PassphraseField, "defaultProps", {
  label: (0, _languageHandler._td)("Password"),
  labelEnterPassword: (0, _languageHandler._td)("Enter password"),
  labelStrongPassword: (0, _languageHandler._td)("Nice, strong password!"),
  labelAllowedButUnsafe: (0, _languageHandler._td)("Password is allowed, but unsafe")
});
var _default = PassphraseField;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F1dGgvUGFzc3BocmFzZUZpZWxkLnRzeCJdLCJuYW1lcyI6WyJQYXNzcGhyYXNlRmllbGQiLCJQdXJlQ29tcG9uZW50IiwiZGVzY3JpcHRpb24iLCJjb21wbGV4aXR5Iiwic2NvcmUiLCJkZXJpdmVEYXRhIiwidmFsdWUiLCJzY29yZVBhc3N3b3JkIiwicnVsZXMiLCJrZXkiLCJ0ZXN0IiwiYWxsb3dFbXB0eSIsImludmFsaWQiLCJwcm9wcyIsImxhYmVsRW50ZXJQYXNzd29yZCIsInNhZmUiLCJtaW5TY29yZSIsImFsbG93VW5zYWZlIiwiU2RrQ29uZmlnIiwiZ2V0IiwidmFsaWQiLCJsYWJlbFN0cm9uZ1Bhc3N3b3JkIiwibGFiZWxBbGxvd2VkQnV0VW5zYWZlIiwiZmVlZGJhY2siLCJ3YXJuaW5nIiwic3VnZ2VzdGlvbnMiLCJmaWVsZFN0YXRlIiwicmVzdWx0IiwidmFsaWRhdGUiLCJvblZhbGlkYXRlIiwicmVuZGVyIiwiaWQiLCJhdXRvRm9jdXMiLCJjbGFzc05hbWUiLCJmaWVsZFJlZiIsImxhYmVsIiwib25DaGFuZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNEJBLE1BQU1BLGVBQU4sU0FBOEJDO0FBQTlCO0FBQW9EO0FBQUE7QUFBQTtBQUFBLG9EQVFyQix5QkFBMEM7QUFDakVDLE1BQUFBLFdBQVcsRUFBRSxVQUFTQyxVQUFULEVBQXFCO0FBQzlCLGNBQU1DLEtBQUssR0FBR0QsVUFBVSxHQUFHQSxVQUFVLENBQUNDLEtBQWQsR0FBc0IsQ0FBOUM7QUFDQSw0QkFBTztBQUFVLFVBQUEsU0FBUyxFQUFDLDZCQUFwQjtBQUFrRCxVQUFBLEdBQUcsRUFBRSxDQUF2RDtB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Q0FBV1AsS0FSZjtBQVNILE1BQUEsUUFBUSxFQUFFLEtBQUtPLEtBQUwsQ0FBV3VCLFFBVGxCO0FBVUgsTUFBQSxVQUFVLEVBQUUsS0FBS1A7QUFWZCxNQUFQO0FBWUg7O0FBekUrQzs7OEJBQTlDN0IsZSxrQkFDb0I7QUFDbEJtQyxFQUFBQSxLQUFLLEVBQUUsMEJBQUksVUFBSixDQURXO0FBRWxCckIsRUFBQUEsa0JBQWtCLEVBQUUsMEJBQUksZ0JBQUosQ0FGRjtBQUdsQk8sRUFBQUEsbUJBQW1CLEVBQUUsMEJBQUksd0JBQUosQ0FISDtBQUlsQkMsRUFBQUEscUJBQXFCLEVBQUUsMEJBQUksaUNBQUo7QUFKTCxDO2VBMkVYdEIsZSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge1B1cmVDb21wb25lbnQsIFJlZkNhbGxiYWNrLCBSZWZPYmplY3R9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSBcImNsYXNzbmFtZXNcIjtcbmltcG9ydCB6eGN2Ym4gZnJvbSBcInp4Y3ZiblwiO1xuXG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCB3aXRoVmFsaWRhdGlvbiwge0lGaWVsZFN0YXRlLCBJVmFsaWRhdGlvblJlc3VsdH0gZnJvbSBcIi4uL2VsZW1lbnRzL1ZhbGlkYXRpb25cIjtcbmltcG9ydCB7X3QsIF90ZH0gZnJvbSBcIi4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlclwiO1xuaW1wb3J0IEZpZWxkLCB7SUlucHV0UHJvcHN9IGZyb20gXCIuLi9lbGVtZW50cy9GaWVsZFwiO1xuXG5pbnRlcmZhY2UgSVByb3BzIGV4dGVuZHMgT21pdDxJSW5wdXRQcm9wcywgXCJvblZhbGlkYXRlXCI+IHtcbiAgICBhdXRvRm9jdXM/OiBib29sZWFuO1xuICAgIGlkPzogc3RyaW5nO1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbiAgICBtaW5TY29yZTogMCB8IDEgfCAyIHwgMyB8IDQ7XG4gICAgdmFsdWU6IHN0cmluZztcbiAgICBmaWVsZFJlZj86IFJlZkNhbGxiYWNrPEZpZWxkPiB8IFJlZk9iamVjdDxGaWVsZD47XG5cbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBsYWJlbEVudGVyUGFzc3dvcmQ/OiBzdHJpbmc7XG4gICAgbGFiZWxTdHJvbmdQYXNzd29yZD86IHN0cmluZztcbiAgICBsYWJlbEFsbG93ZWRCdXRVbnNhZmU/OiBzdHJpbmc7XG5cbiAgICBvbkNoYW5nZShldjogUmVhY3QuRm9ybUV2ZW50PEhUTUxFbGVtZW50Pik7XG4gICAgb25WYWxpZGF0ZShyZXN1bHQ6IElWYWxpZGF0aW9uUmVzdWx0KTtcbn1cblxuY2xhc3MgUGFzc3BocmFzZUZpZWxkIGV4dGVuZHMgUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBsYWJlbDogX3RkKFwiUGFzc3dvcmRcIiksXG4gICAgICAgIGxhYmVsRW50ZXJQYXNzd29yZDogX3RkKFwiRW50ZXIgcGFzc3dvcmRcIiksXG4gICAgICAgIGxhYmVsU3Ryb25nUGFzc3dvcmQ6IF90ZChcIk5pY2UsIHN0cm9uZyBwYXNzd29yZCFcIiksXG4gICAgICAgIGxhYmVsQWxsb3dlZEJ1dFVuc2FmZTogX3RkKFwiUGFzc3dvcmQgaXMgYWxsb3dlZCwgYnV0IHVuc2FmZVwiKSxcbiAgICB9O1xuXG4gICAgcHVibGljIHJlYWRvbmx5IHZhbGlkYXRlID0gd2l0aFZhbGlkYXRpb248dGhpcywgenhjdmJuLlpYQ1ZCTlJlc3VsdD4oe1xuICAgICAgICBkZXNjcmlwdGlvbjogZnVuY3Rpb24oY29tcGxleGl0eSkge1xuICAgICAgICAgICAgY29uc3Qgc2NvcmUgPSBjb21wbGV4aXR5ID8gY29tcGxleGl0eS5zY29yZSA6IDA7XG4gICAgICAgICAgICByZXR1cm4gPHByb2dyZXNzIGNsYXNzTmFtZT1cIm14X1Bhc3NwaHJhc2VGaWVsZF9wcm9ncmVzc1wiIG1heD17NH0gdmFsdWU9e3Njb3JlfSAvPjtcbiAgICAgICAgfSxcbiAgICAgICAgZGVyaXZlRGF0YTogYXN5bmMgKHsgdmFsdWUgfSkgPT4ge1xuICAgICAgICAgICAgaWYgKCF2YWx1ZSkgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjb25zdCB7IHNjb3JlUGFzc3dvcmQgfSA9IGF3YWl0IGltcG9ydCgnLi4vLi4vLi4vdXRpbHMvUGFzc3dvcmRTY29yZXInKTtcbiAgICAgICAgICAgIHJldHVybiBzY29yZVBhc3N3b3JkKHZhbHVlKTtcbiAgICAgICAgfSxcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QodGhpcy5wcm9wcy5sYWJlbEVudGVyUGFzc3dvcmQpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiY29tcGxleGl0eVwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jIGZ1bmN0aW9uKHsgdmFsdWUgfSwgY29tcGxleGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2FmZSA9IGNvbXBsZXhpdHkuc2NvcmUgPj0gdGhpcy5wcm9wcy5taW5TY29yZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxsb3dVbnNhZmUgPSBTZGtDb25maWcuZ2V0KClbXCJkYW5nZXJvdXNseV9hbGxvd191bnNhZmVfYW5kX2luc2VjdXJlX3Bhc3N3b3Jkc1wiXTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFsbG93VW5zYWZlIHx8IHNhZmU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB2YWxpZDogZnVuY3Rpb24oY29tcGxleGl0eSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBVbnNhZmUgcGFzc3dvcmRzIHRoYXQgYXJlIHZhbGlkIGFyZSBvbmx5IHBvc3NpYmxlIHRocm91Z2ggYVxuICAgICAgICAgICAgICAgICAgICAvLyBjb25maWd1cmF0aW9uIGZsYWcuIFdlJ2xsIHByaW50IHNvbWUgaGVscGVyIHRleHQgdG8gc2lnbmFsXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSB1c2VyIHRoYXQgdGhlaXIgcGFzc3dvcmQgaXMgYWxsb3dlZCwgYnV0IHVuc2FmZS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbXBsZXhpdHkuc2NvcmUgPj0gdGhpcy5wcm9wcy5taW5TY29yZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KHRoaXMucHJvcHMubGFiZWxTdHJvbmdQYXNzd29yZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF90KHRoaXMucHJvcHMubGFiZWxBbGxvd2VkQnV0VW5zYWZlKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGludmFsaWQ6IGZ1bmN0aW9uKGNvbXBsZXhpdHkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb21wbGV4aXR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IGZlZWRiYWNrIH0gPSBjb21wbGV4aXR5O1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmVlZGJhY2sud2FybmluZyB8fCBmZWVkYmFjay5zdWdnZXN0aW9uc1swXSB8fCBfdChcIktlZXAgZ29pbmcuLi5cIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBvblZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGU6IElGaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMudmFsaWRhdGUoZmllbGRTdGF0ZSk7XG4gICAgICAgIHRoaXMucHJvcHMub25WYWxpZGF0ZShyZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8RmllbGRcbiAgICAgICAgICAgIGlkPXt0aGlzLnByb3BzLmlkfVxuICAgICAgICAgICAgYXV0b0ZvY3VzPXt0aGlzLnByb3BzLmF1dG9Gb2N1c31cbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1Bhc3NwaHJhc2VGaWVsZFwiLCB0aGlzLnByb3BzLmNsYXNzTmFtZSl9XG4gICAgICAgICAgICByZWY9e3RoaXMucHJvcHMuZmllbGRSZWZ9XG4gICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgYXV0b0NvbXBsZXRlPVwibmV3LXBhc3N3b3JkXCJcbiAgICAgICAgICAgIGxhYmVsPXtfdCh0aGlzLnByb3BzLmxhYmVsKX1cbiAgICAgICAgICAgIHZhbHVlPXt0aGlzLnByb3BzLnZhbHVlfVxuICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMucHJvcHMub25DaGFuZ2V9XG4gICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLm9uVmFsaWRhdGV9XG4gICAgICAgIC8+O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGFzc3BocmFzZUZpZWxkO1xuIl19