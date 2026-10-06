"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let RoomAliasField = ( // Controlled form component wrapping Field for inputting a room alias scoped to a given domain
_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.RoomAliasField"), _dec(_class = (_temp = _class2 = class RoomAliasField extends _react.default.PureComponent {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  domain: _propTypes.default.string.isRequired,
  onChange: _propTypes.default.func,
  value: _propTypes.default.string.isRequired
}), _temp)) || _class);
exports.default = RoomAliasField;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1Jvb21BbGlhc0ZpZWxkLmpzIl0sIm5hbWVzIjpbIlJvb21BbGlhc0ZpZWxkIiwiUmVhY3QiLCJQdXJlQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2Iiwib25DaGFuZ2UiLCJfYXNGdWxsQWxpYXMiLCJ0YXJnZXQiLCJ2YWx1ZSIsImZpZWxkU3RhdGUiLCJyZXN1bHQiLCJfdmFsaWRhdGlvblJ1bGVzIiwic2V0U3RhdGUiLCJpc1ZhbGlkIiwidmFsaWQiLCJydWxlcyIsImtleSIsInRlc3QiLCJmdWxsQWxpYXMiLCJpbmNsdWRlcyIsImVuY29kZVVSSSIsImludmFsaWQiLCJhbGxvd0VtcHR5IiwiZmluYWwiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tSWRGb3JBbGlhcyIsImVyciIsImVycmNvZGUiLCJzdGF0ZSIsImxvY2FscGFydCIsImRvbWFpbiIsInJlbmRlciIsIkZpZWxkIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwicG91bmRTaWduIiwiYWxpYXNQb3N0Zml4IiwibWF4bGVuZ3RoIiwibGVuZ3RoIiwicmVmIiwiX2ZpZWxkUmVmIiwiX29uVmFsaWRhdGUiLCJfb25DaGFuZ2UiLCJzdWJzdHJpbmciLCJ2YWxpZGF0ZSIsIm9wdGlvbnMiLCJmb2N1cyIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFJcUJBLGMsS0FGckI7T0FDQyxnREFBcUIsK0JBQXJCLEMsbUNBQUQsTUFDcUJBLGNBRHJCLFNBQzRDQyxlQUFNQyxhQURsRCxDQUNnRTtBQU81REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUscURBK0JOQyxFQUFELElBQVE7QUFD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OztBQXZHMkQsQyxzREFDekM7QUFDZmhCLEVBQUFBLE1BQU0sRUFBRWlCLG1CQUFVQyxNQUFWLENBQWlCQyxVQURWO0FBRWY5QyxFQUFBQSxRQUFRLEVBQUU0QyxtQkFBVUcsSUFGTDtBQUdmNUMsRUFBQUEsS0FBSyxFQUFFeUMsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBSFQsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgd2l0aFZhbGlkYXRpb24gZnJvbSAnLi9WYWxpZGF0aW9uJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIENvbnRyb2xsZWQgZm9ybSBjb21wb25lbnQgd3JhcHBpbmcgRmllbGQgZm9yIGlucHV0dGluZyBhIHJvb20gYWxpYXMgc2NvcGVkIHRvIGEgZ2l2ZW4gZG9tYWluXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5Sb29tQWxpYXNGaWVsZFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbUFsaWFzRmllbGQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBkb21haW46IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICAgICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7aXNWYWxpZDogdHJ1ZX07XG4gICAgfVxuXG4gICAgX2FzRnVsbEFsaWFzKGxvY2FscGFydCkge1xuICAgICAgICByZXR1cm4gYCMke2xvY2FscGFydH06JHt0aGlzLnByb3BzLmRvbWFpbn1gO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgRmllbGQgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5GaWVsZCcpO1xuICAgICAgICBjb25zdCBwb3VuZFNpZ24gPSAoPHNwYW4+Izwvc3Bhbj4pO1xuICAgICAgICBjb25zdCBhbGlhc1Bvc3RmaXggPSBcIjpcIiArIHRoaXMucHJvcHMuZG9tYWluO1xuICAgICAgICBjb25zdCBkb21haW4gPSAoPHNwYW4gdGl0bGU9e2FsaWFzUG9zdGZpeH0+e2FsaWFzUG9zdGZpeH08L3NwYW4+KTtcbiAgICAgICAgY29uc3QgbWF4bGVuZ3RoID0gMjU1IC0gdGhpcy5wcm9wcy5kb21haW4ubGVuZ3RoIC0gMjsgICAvLyAyIGZvciAjIGFuZCA6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8RmllbGRcbiAgICAgICAgICAgICAgICBsYWJlbD17X3QoXCJSb29tIGFkZHJlc3NcIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfUm9vbUFsaWFzRmllbGRcIlxuICAgICAgICAgICAgICAgIHByZWZpeENvbXBvbmVudD17cG91bmRTaWdufVxuICAgICAgICAgICAgICAgIHBvc3RmaXhDb21wb25lbnQ9e2RvbWFpbn1cbiAgICAgICAgICAgICAgICByZWY9e3JlZiA9PiB0aGlzLl9maWVsZFJlZiA9IHJlZn1cbiAgICAgICAgICAgICAgICBvblZhbGlkYXRlPXt0aGlzLl9vblZhbGlkYXRlfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdChcImUuZy4gbXktcm9vbVwiKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMudmFsdWUuc3Vic3RyaW5nKDEsIHRoaXMucHJvcHMudmFsdWUubGVuZ3RoIC0gdGhpcy5wcm9wcy5kb21haW4ubGVuZ3RoIC0gMSl9XG4gICAgICAgICAgICAgICAgbWF4TGVuZ3RoPXttYXhsZW5ndGh9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIF9vbkNoYW5nZSA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZSh0aGlzLl9hc0Z1bGxBbGlhcyhldi50YXJnZXQudmFsdWUpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfb25WYWxpZGF0ZSA9IGFzeW5jIChmaWVsZFN0YXRlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3ZhbGlkYXRpb25SdWxlcyhmaWVsZFN0YXRlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7aXNWYWxpZDogcmVzdWx0LnZhbGlkfSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIF92YWxpZGF0aW9uUnVsZXMgPSB3aXRoVmFsaWRhdGlvbih7XG4gICAgICAgIHJ1bGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcInNhZmVMb2NhbHBhcnRcIixcbiAgICAgICAgICAgICAgICB0ZXN0OiBhc3luYyAoeyB2YWx1ZSB9KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZ1bGxBbGlhcyA9IHRoaXMuX2FzRnVsbEFsaWFzKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gWFhYOiBGSVhNRSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9tYXRyaXgtZG9jL2lzc3Vlcy82NjhcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICF2YWx1ZS5pbmNsdWRlcyhcIiNcIikgJiYgIXZhbHVlLmluY2x1ZGVzKFwiOlwiKSAmJiAhdmFsdWUuaW5jbHVkZXMoXCIsXCIpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmNvZGVVUkkoZnVsbEFsaWFzKSA9PT0gZnVsbEFsaWFzO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaW52YWxpZDogKCkgPT4gX3QoXCJTb21lIGNoYXJhY3RlcnMgbm90IGFsbG93ZWRcIiksXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBcInJlcXVpcmVkXCIsXG4gICAgICAgICAgICAgICAgdGVzdDogYXN5bmMgKHsgdmFsdWUsIGFsbG93RW1wdHkgfSkgPT4gYWxsb3dFbXB0eSB8fCAhIXZhbHVlLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiUGxlYXNlIHByb3ZpZGUgYSByb29tIGFkZHJlc3NcIiksXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAga2V5OiBcInRha2VuXCIsXG4gICAgICAgICAgICAgICAgZmluYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgdGVzdDogYXN5bmMgKHt2YWx1ZX0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpZW50LmdldFJvb21JZEZvckFsaWFzKHRoaXMuX2FzRnVsbEFsaWFzKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSBnb3QgYSByb29tIGlkLCBzbyB0aGUgYWxpYXMgaXMgdGFrZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbnkgc2VydmVyIGVycm9yIGNvZGUgd2lsbCBkbyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVpdGhlciBpdCBNX05PVF9GT1VORCBvciB0aGUgYWxpYXMgaXMgaW52YWxpZCBzb21laG93LFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW4gd2hpY2ggY2FzZSB3ZSBkb24ndCB3YW50IHRvIHNob3cgdGhlIGludmFsaWQgbWVzc2FnZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICEhZXJyLmVycmNvZGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHZhbGlkOiAoKSA9PiBfdChcIlRoaXMgYWRkcmVzcyBpcyBhdmFpbGFibGUgdG8gdXNlXCIpLFxuICAgICAgICAgICAgICAgIGludmFsaWQ6ICgpID0+IF90KFwiVGhpcyBhZGRyZXNzIGlzIGFscmVhZHkgaW4gdXNlXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICB9KTtcblxuICAgIGdldCBpc1ZhbGlkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5pc1ZhbGlkO1xuICAgIH1cblxuICAgIHZhbGlkYXRlKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpZWxkUmVmLnZhbGlkYXRlKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLl9maWVsZFJlZi5mb2N1cygpO1xuICAgIH1cbn1cbiJdfQ==