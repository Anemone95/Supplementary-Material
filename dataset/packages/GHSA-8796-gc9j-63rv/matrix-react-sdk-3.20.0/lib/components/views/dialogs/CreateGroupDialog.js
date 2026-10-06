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

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let CreateGroupDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.CreateGroupDialog"), _dec(_class = (_temp = _class2 = class CreateGroupDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      groupName: '',
      groupId: '',
      groupError: null,
      creating: false,
      createError: null
    });
    (0, _defineProperty2.default)(this, "_onGroupNameChange", e => {
      this.setState({
        groupName: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onGroupIdChange", e => {
      this.setState({
        groupId: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_onGroupIdBlur", e => {
      this._checkGroupId();
    });
    (0, _defineProperty2.default)(this, "_onFormSubmit", e => {
      e.preventDefault();
      if (this._checkGroupId()) return;
      const profile = {};

      if (this.state.groupName !== '') {
        profile.name = this.state.groupName;
      }

      this.setState({
        creating: true
      });

      _MatrixClientPeg.MatrixClientPeg.get().createGroup({
        localpart: this.state.groupId,
        profile: profile
      }).then(result => {
        _dispatcher.default.dispatch({
          action: 'view_group',
          group_id: result.group_id,
          group_is_new: true
        });

        this.props.onFinished(true);
      }).catch(e => {
        this.setState({
          createError: e
        });
      }).finally(() => {
        this.setState({
          creating: false
        });
      });
    });
    (0, _defineProperty2.default)(this, "_onCancel", () => {
      this.props.onFinished(false);
    });
  }

  _checkGroupId(e) {
    let error = null;

    if (!this.state.groupId) {
      error = (0, _languageHandler._t)("Community IDs cannot be empty.");
    } else if (!/^[a-z0-9=_\-./]*$/.test(this.state.groupId)) {
      error = (0, _languageHandler._t)("Community IDs may only contain characters a-z, 0-9, or '=_-./'");
    }

    this.setState({
      groupIdError: error,
      // Reset createError to get rid of now stale error message
      createError: null
    });
    return error;
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const Spinner = sdk.getComponent('elements.Spinner');

    if (this.state.creating) {
      return /*#__PURE__*/_react.default.createElement(Spinner, null);
    }

    let createErrorNode;

    if (this.state.createError) {
      // XXX: We should catch errcodes and give sensible i18ned messages for them,
      // rather than displaying what the server gives us, but synapse doesn't give
      // any yet.
      createErrorNode = /*#__PURE__*/_react.default.createElement("div", {
        className: "error",
        role: "alert"
      }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Something went wrong whilst creating your community')), /*#__PURE__*/_react.default.createElement("div", null, this.state.createError.message));
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_CreateGroupDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)('Create Community')
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onFormSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateGroupDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateGroupDialog_label"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "groupname"
    }, (0, _languageHandler._t)('Community Name'))), /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("input", {
      id: "groupname",
      className: "mx_CreateGroupDialog_input",
      autoFocus: true,
      size: "64",
      placeholder: (0, _languageHandler._t)('Example'),
      onChange: this._onGroupNameChange,
      value: this.state.groupName
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateGroupDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateGroupDialog_label"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "groupid"
    }, (0, _languageHandler._t)('Community ID'))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_CreateGroupDialog_input_group"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateGroupDialog_prefix"
    }, "+"), /*#__PURE__*/_react.default.createElement("input", {
      id: "groupid",
      className: "mx_CreateGroupDialog_input mx_CreateGroupDialog_input_hasPrefixAndSuffix",
      size: "32",
      placeholder: (0, _languageHandler._t)('example'),
      onChange: this._onGroupIdChange,
      onBlur: this._onGroupIdBlur,
      value: this.state.groupId
    }), /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_CreateGroupDialog_suffix"
    }, ":", _MatrixClientPeg.MatrixClientPeg.get().getDomain()))), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.groupIdError), createErrorNode), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      type: "submit",
      value: (0, _languageHandler._t)('Create'),
      className: "mx_Dialog_primary"
    }), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onCancel
    }, (0, _languageHandler._t)("Cancel")))));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = CreateGroupDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlR3JvdXBEaWFsb2cuanMiXSwibmFtZXMiOlsiQ3JlYXRlR3JvdXBEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImdyb3VwTmFtZSIsImdyb3VwSWQiLCJncm91cEVycm9yIiwiY3JlYXRpbmciLCJjcmVhdGVFcnJvciIsImUiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiX2NoZWNrR3JvdXBJZCIsInByZXZlbnREZWZhdWx0IiwicHJvZmlsZSIsInN0YXRlIiwibmFtZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImNyZWF0ZUdyb3VwIiwibG9jYWxwYXJ0IiwidGhlbiIsInJlc3VsdCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiZ3JvdXBfaWQiLCJncm91cF9pc19uZXciLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJjYXRjaCIsImZpbmFsbHkiLCJlcnJvciIsInRlc3QiLCJncm91cElkRXJyb3IiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiU3Bpbm5lciIsImNyZWF0ZUVycm9yTm9kZSIsIm1lc3NhZ2UiLCJfb25Gb3JtU3VibWl0IiwiX29uR3JvdXBOYW1lQ2hhbmdlIiwiX29uR3JvdXBJZENoYW5nZSIsIl9vbkdyb3VwSWRCbHVyIiwiZ2V0RG9tYWluIiwiX29uQ2FuY2VsIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLGlCLFdBRHBCLGdEQUFxQixpQ0FBckIsQyxtQ0FBRCxNQUNxQkEsaUJBRHJCLFNBQytDQyxlQUFNQyxTQURyRCxDQUMrRDtBQUFBO0FBQUE7QUFBQSxpREFLbkQ7QUFDSkMsTUFBQUEsU0FBUyxFQUFFLEVBRFA7QUFFSkMsTUFBQUEsT0FBTyxF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bkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZGlhbG9ncy5DcmVhdGVHcm91cERpYWxvZ1wiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3JlYXRlR3JvdXBEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIHN0YXRlID0ge1xuICAgICAgICBncm91cE5hbWU6ICcnLFxuICAgICAgICBncm91cElkOiAnJyxcbiAgICAgICAgZ3JvdXBFcnJvcjogbnVsbCxcbiAgICAgICAgY3JlYXRpbmc6IGZhbHNlLFxuICAgICAgICBjcmVhdGVFcnJvcjogbnVsbCxcbiAgICB9O1xuXG4gICAgX29uR3JvdXBOYW1lQ2hhbmdlID0gZSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JvdXBOYW1lOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkdyb3VwSWRDaGFuZ2UgPSBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncm91cElkOiBlLnRhcmdldC52YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vbkdyb3VwSWRCbHVyID0gZSA9PiB7XG4gICAgICAgIHRoaXMuX2NoZWNrR3JvdXBJZCgpO1xuICAgIH07XG5cbiAgICBfY2hlY2tHcm91cElkKGUpIHtcbiAgICAgICAgbGV0IGVycm9yID0gbnVsbDtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdyb3VwSWQpIHtcbiAgICAgICAgICAgIGVycm9yID0gX3QoXCJDb21tdW5pdHkgSURzIGNhbm5vdCBiZSBlbXB0eS5cIik7XG4gICAgICAgIH0gZWxzZSBpZiAoIS9eW2EtejAtOT1fXFwtLi9dKiQvLnRlc3QodGhpcy5zdGF0ZS5ncm91cElkKSkge1xuICAgICAgICAgICAgZXJyb3IgPSBfdChcIkNvbW11bml0eSBJRHMgbWF5IG9ubHkgY29udGFpbiBjaGFyYWN0ZXJzIGEteiwgMC05LCBvciAnPV8tLi8nXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JvdXBJZEVycm9yOiBlcnJvcixcbiAgICAgICAgICAgIC8vIFJlc2V0IGNyZWF0ZUVycm9yIHRvIGdldCByaWQgb2Ygbm93IHN0YWxlIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIGNyZWF0ZUVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgIH1cblxuICAgIF9vbkZvcm1TdWJtaXQgPSBlID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jaGVja0dyb3VwSWQoKSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHByb2ZpbGUgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZ3JvdXBOYW1lICE9PSAnJykge1xuICAgICAgICAgICAgcHJvZmlsZS5uYW1lID0gdGhpcy5zdGF0ZS5ncm91cE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y3JlYXRpbmc6IHRydWV9KTtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmNyZWF0ZUdyb3VwKHtcbiAgICAgICAgICAgIGxvY2FscGFydDogdGhpcy5zdGF0ZS5ncm91cElkLFxuICAgICAgICAgICAgcHJvZmlsZTogcHJvZmlsZSxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfZ3JvdXAnLFxuICAgICAgICAgICAgICAgIGdyb3VwX2lkOiByZXN1bHQuZ3JvdXBfaWQsXG4gICAgICAgICAgICAgICAgZ3JvdXBfaXNfbmV3OiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0pLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtjcmVhdGVFcnJvcjogZX0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NyZWF0aW5nOiBmYWxzZX0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uQ2FuY2VsID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoZmFsc2UpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlNwaW5uZXInKTtcblxuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jcmVhdGluZykge1xuICAgICAgICAgICAgcmV0dXJuIDxTcGlubmVyIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNyZWF0ZUVycm9yTm9kZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuY3JlYXRlRXJyb3IpIHtcbiAgICAgICAgICAgIC8vIFhYWDogV2Ugc2hvdWxkIGNhdGNoIGVycmNvZGVzIGFuZCBnaXZlIHNlbnNpYmxlIGkxOG5lZCBtZXNzYWdlcyBmb3IgdGhlbSxcbiAgICAgICAgICAgIC8vIHJhdGhlciB0aGFuIGRpc3BsYXlpbmcgd2hhdCB0aGUgc2VydmVyIGdpdmVzIHVzLCBidXQgc3luYXBzZSBkb2Vzbid0IGdpdmVcbiAgICAgICAgICAgIC8vIGFueSB5ZXQuXG4gICAgICAgICAgICBjcmVhdGVFcnJvck5vZGUgPSA8ZGl2IGNsYXNzTmFtZT1cImVycm9yXCIgcm9sZT1cImFsZXJ0XCI+XG4gICAgICAgICAgICAgICAgPGRpdj57IF90KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsc3QgY3JlYXRpbmcgeW91ciBjb21tdW5pdHknKSB9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdj57IHRoaXMuc3RhdGUuY3JlYXRlRXJyb3IubWVzc2FnZSB9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dcIiBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KCdDcmVhdGUgQ29tbXVuaXR5Jyl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uRm9ybVN1Ym1pdH0+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRGlhbG9nX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dfaW5wdXRSb3dcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX2xhYmVsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwiZ3JvdXBuYW1lXCI+eyBfdCgnQ29tbXVuaXR5IE5hbWUnKSB9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJncm91cG5hbWVcIiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXM9e3RydWV9IHNpemU9XCI2NFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoJ0V4YW1wbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkdyb3VwTmFtZUNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLmdyb3VwTmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19pbnB1dFJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJncm91cGlkXCI+eyBfdCgnQ29tbXVuaXR5IElEJykgfTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19pbnB1dF9ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19wcmVmaXhcIj4rPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJncm91cGlkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX2lucHV0IG14X0NyZWF0ZUdyb3VwRGlhbG9nX2lucHV0X2hhc1ByZWZpeEFuZFN1ZmZpeFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaXplPVwiMzJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9e190KCdleGFtcGxlJyl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25Hcm91cElkQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9vbkdyb3VwSWRCbHVyfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZ3JvdXBJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dfc3VmZml4XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6eyBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0RG9tYWluKCkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuZ3JvdXBJZEVycm9yIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBjcmVhdGVFcnJvck5vZGUgfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJzdWJtaXRcIiB2YWx1ZT17X3QoJ0NyZWF0ZScpfSBjbGFzc05hbWU9XCJteF9EaWFsb2dfcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3RoaXMuX29uQ2FuY2VsfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiQ2FuY2VsXCIpIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19