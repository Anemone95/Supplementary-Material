"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _languageHandler = require("../../../languageHandler");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _Validation = _interopRequireDefault(require("./Validation"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

/*
Copyright 2019 New Vector Ltd

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
// Controlled form component wrapping Field for inputting a room alias scoped to a given domain
class RoomAliasField extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onChange", ev => {
      if (this.props.onChange) {
        this.props.onChange(this._asFullAlias(ev.target.value));
      }
    });
    (0, _defineProperty2.default)(this, "_onValidate", async fieldState => {
      const result = await this._validationRules(fieldState);
      this.setState({
        isValid: result.valid
      });
      return result;
    });
    (0, _defineProperty2.default)(this, "_validationRules", (0, _Validation.default)({
      rules: [{
        key: "safeLocalpart",
        test: async ({
          value
        }) => {
          if (!value) {
            return true;
          }

          const fullAlias = this._asFullAlias(value); // XXX: FIXME https://github.com/matrix-org/matrix-doc/issues/668


          return !value.includes("#") && !value.includes(":") && !value.includes(",") && encodeURI(fullAlias) === fullAlias;
        },
        invalid: () => (0, _languageHandler._t)("Some characters not allowed")
      }, {
        key: "required",
        test: async ({
          value,
          allowEmpty
        }) => allowEmpty || !!value,
        invalid: () => (0, _languageHandler._t)("Please provide a room address")
      }, {
        key: "taken",
        final: true,
        test: async ({
          value
        }) => {
          if (!value) {
            return true;
          }

          const client = _MatrixClientPeg.MatrixClientPeg.get();

          try {
            await client.getRoomIdForAlias(this._asFullAlias(value)); // we got a room id, so the alias is taken

            return false;
          } catch (err) {
            // any server error code will do,
            // either it M_NOT_FOUND or the alias is invalid somehow,
            // in which case we don't want to show the invalid message
            return !!err.errcode;
          }
        },
        valid: () => (0, _languageHandler._t)("This address is available to use"),
        invalid: () => (0, _languageHandler._t)("This address is already in use")
      }]
    }));
    this.state = {
      isValid: true
    };
  }

  _asFullAlias(localpart) {
    return `#${localpart}:${this.props.domain}`;
  }

  render() {
    const Field = sdk.getComponent('views.elements.Field');

    const poundSign = /*#__PURE__*/_react.default.createElement("span", null, "#");

    const aliasPostfix = ":" + this.props.domain;

    const domain = /*#__PURE__*/_react.default.createElement("span", {
      title: aliasPostfix
    }, aliasPostfix);

    const maxlength = 255 - this.props.domain.length - 2; // 2 for # and :

    return /*#__PURE__*/_react.default.createElement(Field, {
      label: (0, _languageHandler._t)("Room address"),
      className: "mx_RoomAliasField",
      prefixComponent: poundSign,
      postfixComponent: domain,
      ref: ref => this._fieldRef = ref,
      onValidate: this._onValidate,
      placeholder: (0, _languageHandler._t)("e.g. my-room"),
      onChange: this._onChange,
      value: this.props.value.substring(1, this.props.value.length - this.props.domain.length - 1),
      maxLength: maxlength
    });
  }

  get isValid() {
    return this.state.isValid;
  }

  validate(options) {
    return this._fieldRef.validate(options);
  }

  focus() {
    this._fieldRef.focus();
  }

}

exports.default = RoomAliasField;
(0, _defineProperty2.default)(RoomAliasField, "propTypes", {
  domain: _propTypes.default.string.isRequired,
  onChange: _propTypes.default.func,
  value: _propTypes.default.string.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Jvb21BbGlhc0ZpZWxkLmpzIl0sIm5hbWVzIjpbIlJvb21BbGlhc0ZpZWxkIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2Iiwib25DaGFuZ2UiLCJfYXNGdWxsQWxpYXMiLCJ0YXJnZXQiLCJ2YWx1ZSIsImZpZWxkU3RhdGUiLCJyZXN1bHQiLCJfdmFsaWRhdGlvblJ1bGVzIiwic2V0U3RhdGUiLCJpc1ZhbGlkIiwidmFsaWQiLCJydWxlcyIsImtleSIsInRlc3QiLCJmdWxsQWxpYXMiLCJpbmNsdWRlcyIsImVuY29kZVVSSSIsImludmFsaWQiLCJhbGxvd0VtcHR5IiwiZmluYWwiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tSWRGb3JBbGlhcyIsImVyciIsImVycmNvZGUiLCJzdGF0ZSIsImxvY2FscGFydCIsImRvbWFpbiIsInJlbmRlciIsIkZpZWxkIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwicG91bmRTaWduIiwiYWxpYXNQb3N0Zml4IiwibWF4bGVuZ3RoIiwibGVuZ3RoIiwicmVmIiwiX2ZpZWxkUmVmIiwiX29uVmFsaWRhdGUiLCJfb25DaGFuZ2UiLCJzdWJzdHJpbmciLCJ2YWxpZGF0ZSIsIm9wdGlvbnMiLCJmb2N1cyIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFBO0FBQ2UsTUFBTUEsY0FBTixTQUE2QkMsZUFBTUMsYUFBbkMsQ0FBaUQ7QUFPNURDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFB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QUc7QUFDSixTQUFLTixTQUFMLENBQWVNLEtBQWY7QUFDSDs7QUF0RzJEOzs7OEJBQTNDakQsYyxlQUNFO0FBQ2ZpQyxFQUFBQSxNQUFNLEVBQUVpQixtQkFBVUMsTUFBVixDQUFpQkMsVUFEVjtBQUVmOUMsRUFBQUEsUUFBUSxFQUFFNEMsbUJBQVVHLElBRkw7QUFHZjVDLEVBQUFBLEtBQUssRUFBRXlDLG1CQUFVQyxNQUFWLENBQWlCQztBQUhULEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHdpdGhWYWxpZGF0aW9uIGZyb20gJy4vVmFsaWRhdGlvbic7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSAnLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnJztcblxuLy8gQ29udHJvbGxlZCBmb3JtIGNvbXBvbmVudCB3cmFwcGluZyBGaWVsZCBmb3IgaW5wdXR0aW5nIGEgcm9vbSBhbGlhcyBzY29wZWQgdG8gYSBnaXZlbiBkb21haW5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJvb21BbGlhc0ZpZWxkIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgZG9tYWluOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgdmFsdWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge2lzVmFsaWQ6IHRydWV9O1xuICAgIH1cblxuICAgIF9hc0Z1bGxBbGlhcyhsb2NhbHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIGAjJHtsb2NhbHBhcnR9OiR7dGhpcy5wcm9wcy5kb21haW59YDtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEZpZWxkID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZWxlbWVudHMuRmllbGQnKTtcbiAgICAgICAgY29uc3QgcG91bmRTaWduID0gKDxzcGFuPiM8L3NwYW4+KTtcbiAgICAgICAgY29uc3QgYWxpYXNQb3N0Zml4ID0gXCI6XCIgKyB0aGlzLnByb3BzLmRvbWFpbjtcbiAgICAgICAgY29uc3QgZG9tYWluID0gKDxzcGFuIHRpdGxlPXthbGlhc1Bvc3RmaXh9PnthbGlhc1Bvc3RmaXh9PC9zcGFuPik7XG4gICAgICAgIGNvbnN0IG1heGxlbmd0aCA9IDI1NSAtIHRoaXMucHJvcHMuZG9tYWluLmxlbmd0aCAtIDI7ICAgLy8gMiBmb3IgIyBhbmQgOlxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxGaWVsZFxuICAgICAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSb29tIGFkZHJlc3NcIil9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X1Jvb21BbGlhc0ZpZWxkXCJcbiAgICAgICAgICAgICAgICAgICAgcHJlZml4Q29tcG9uZW50PXtwb3VuZFNpZ259XG4gICAgICAgICAgICAgICAgICAgIHBvc3RmaXhDb21wb25lbnQ9e2RvbWFpbn1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtyZWYgPT4gdGhpcy5fZmllbGRSZWYgPSByZWZ9XG4gICAgICAgICAgICAgICAgICAgIG9uVmFsaWRhdGU9e3RoaXMuX29uVmFsaWRhdGV9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcImUuZy4gbXktcm9vbVwiKX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5wcm9wcy52YWx1ZS5zdWJzdHJpbmcoMSwgdGhpcy5wcm9wcy52YWx1ZS5sZW5ndGggLSB0aGlzLnByb3BzLmRvbWFpbi5sZW5ndGggLSAxKX1cbiAgICAgICAgICAgICAgICAgICAgbWF4TGVuZ3RoPXttYXhsZW5ndGh9IC8+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlID0gKGV2KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKHRoaXMuX2FzRnVsbEFsaWFzKGV2LnRhcmdldC52YWx1ZSkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9vblZhbGlkYXRlID0gYXN5bmMgKGZpZWxkU3RhdGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fdmFsaWRhdGlvblJ1bGVzKGZpZWxkU3RhdGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtpc1ZhbGlkOiByZXN1bHQudmFsaWR9KTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgX3ZhbGlkYXRpb25SdWxlcyA9IHdpdGhWYWxpZGF0aW9uKHtcbiAgICAgICAgcnVsZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwic2FmZUxvY2FscGFydFwiLFxuICAgICAgICAgICAgICAgIHRlc3Q6IGFzeW5jICh7IHZhbHVlIH0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZnVsbEFsaWFzID0gdGhpcy5fYXNGdWxsQWxpYXModmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBYWFg6IEZJWE1FIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvaXNzdWVzLzY2OFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gIXZhbHVlLmluY2x1ZGVzKFwiI1wiKSAmJiAhdmFsdWUuaW5jbHVkZXMoXCI6XCIpICYmICF2YWx1ZS5pbmNsdWRlcyhcIixcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kZVVSSShmdWxsQWxpYXMpID09PSBmdWxsQWxpYXM7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBpbnZhbGlkOiAoKSA9PiBfdChcIlNvbWUgY2hhcmFjdGVycyBub3QgYWxsb3dlZFwiKSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwicmVxdWlyZWRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSwgYWxsb3dFbXB0eSB9KSA9PiBhbGxvd0VtcHR5IHx8ICEhdmFsdWUsXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJQbGVhc2UgcHJvdmlkZSBhIHJvb20gYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwidGFrZW5cIixcbiAgICAgICAgICAgICAgICBmaW5hbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoe3ZhbHVlfSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBjbGllbnQuZ2V0Um9vbUlkRm9yQWxpYXModGhpcy5fYXNGdWxsQWxpYXModmFsdWUpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlIGdvdCBhIHJvb20gaWQsIHNvIHRoZSBhbGlhcyBpcyB0YWtlblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFueSBzZXJ2ZXIgZXJyb3IgY29kZSB3aWxsIGRvLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWl0aGVyIGl0IE1fTk9UX0ZPVU5EIG9yIHRoZSBhbGlhcyBpcyBpbnZhbGlkIHNvbWVob3csXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbiB3aGljaCBjYXNlIHdlIGRvbid0IHdhbnQgdG8gc2hvdyB0aGUgaW52YWxpZCBtZXNzYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gISFlcnIuZXJyY29kZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdmFsaWQ6ICgpID0+IF90KFwiVGhpcyBhZGRyZXNzIGlzIGF2YWlsYWJsZSB0byB1c2VcIiksXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJUaGlzIGFkZHJlc3MgaXMgYWxyZWFkeSBpbiB1c2VcIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgIH0pO1xuXG4gICAgZ2V0IGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLmlzVmFsaWQ7XG4gICAgfVxuXG4gICAgdmFsaWRhdGUob3B0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmllbGRSZWYudmFsaWRhdGUob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuX2ZpZWxkUmVmLmZvY3VzKCk7XG4gICAgfVxufVxuIl19