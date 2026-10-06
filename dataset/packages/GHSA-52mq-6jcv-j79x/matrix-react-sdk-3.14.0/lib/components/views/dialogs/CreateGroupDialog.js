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

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

/*
Copyright 2017 Vector Creations Ltd

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
class CreateGroupDialog extends _react.default.Component {
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

}

exports.default = CreateGroupDialog;
(0, _defineProperty2.default)(CreateGroupDialog, "propTypes", {
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ3JlYXRlR3JvdXBEaWFsb2cuanMiXSwibmFtZXMiOlsiQ3JlYXRlR3JvdXBEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImdyb3VwTmFtZSIsImdyb3VwSWQiLCJncm91cEVycm9yIiwiY3JlYXRpbmciLCJjcmVhdGVFcnJvciIsImUiLCJzZXRTdGF0ZSIsInRhcmdldCIsInZhbHVlIiwiX2NoZWNrR3JvdXBJZCIsInByZXZlbnREZWZhdWx0IiwicHJvZmlsZSIsInN0YXRlIiwibmFtZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImNyZWF0ZUdyb3VwIiwibG9jYWxwYXJ0IiwidGhlbiIsInJlc3VsdCIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiZ3JvdXBfaWQiLCJncm91cF9pc19uZXciLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJjYXRjaCIsImZpbmFsbHkiLCJlcnJvciIsInRlc3QiLCJncm91cElkRXJyb3IiLCJyZW5kZXIiLCJCYXNlRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiU3Bpbm5lciIsImNyZWF0ZUVycm9yTm9kZSIsIm1lc3NhZ2UiLCJfb25Gb3JtU3VibWl0IiwiX29uR3JvdXBOYW1lQ2hhbmdlIiwiX29uR3JvdXBJZENoYW5nZSIsIl9vbkdyb3VwSWRCbHVyIiwiZ2V0RG9tYWluIiwiX29uQ2FuY2VsIiwiUHJvcFR5cGVzIiwiZnVuYyIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNlLE1BQU1BLGlCQUFOLFNBQWdDQyxlQUFNQyxTQUF0QyxDQUFnRDtBQUFBO0FBQUE7QUFBQSxpREFLbkQ7QUFDSkMsTUFBQUEs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Ii8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDcmVhdGVHcm91cERpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGdyb3VwTmFtZTogJycsXG4gICAgICAgIGdyb3VwSWQ6ICcnLFxuICAgICAgICBncm91cEVycm9yOiBudWxsLFxuICAgICAgICBjcmVhdGluZzogZmFsc2UsXG4gICAgICAgIGNyZWF0ZUVycm9yOiBudWxsLFxuICAgIH07XG5cbiAgICBfb25Hcm91cE5hbWVDaGFuZ2UgPSBlID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncm91cE5hbWU6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uR3JvdXBJZENoYW5nZSA9IGUgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyb3VwSWQ6IGUudGFyZ2V0LnZhbHVlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgX29uR3JvdXBJZEJsdXIgPSBlID0+IHtcbiAgICAgICAgdGhpcy5fY2hlY2tHcm91cElkKCk7XG4gICAgfTtcblxuICAgIF9jaGVja0dyb3VwSWQoZSkge1xuICAgICAgICBsZXQgZXJyb3IgPSBudWxsO1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JvdXBJZCkge1xuICAgICAgICAgICAgZXJyb3IgPSBfdChcIkNvbW11bml0eSBJRHMgY2Fubm90IGJlIGVtcHR5LlwiKTtcbiAgICAgICAgfSBlbHNlIGlmICghL15bYS16MC05PV9cXC0uL10qJC8udGVzdCh0aGlzLnN0YXRlLmdyb3VwSWQpKSB7XG4gICAgICAgICAgICBlcnJvciA9IF90KFwiQ29tbXVuaXR5IElEcyBtYXkgb25seSBjb250YWluIGNoYXJhY3RlcnMgYS16LCAwLTksIG9yICc9Xy0uLydcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncm91cElkRXJyb3I6IGVycm9yLFxuICAgICAgICAgICAgLy8gUmVzZXQgY3JlYXRlRXJyb3IgdG8gZ2V0IHJpZCBvZiBub3cgc3RhbGUgZXJyb3IgbWVzc2FnZVxuICAgICAgICAgICAgY3JlYXRlRXJyb3I6IG51bGwsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZXJyb3I7XG4gICAgfVxuXG4gICAgX29uRm9ybVN1Ym1pdCA9IGUgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaWYgKHRoaXMuX2NoZWNrR3JvdXBJZCgpKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgcHJvZmlsZSA9IHt9O1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ncm91cE5hbWUgIT09ICcnKSB7XG4gICAgICAgICAgICBwcm9maWxlLm5hbWUgPSB0aGlzLnN0YXRlLmdyb3VwTmFtZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtjcmVhdGluZzogdHJ1ZX0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuY3JlYXRlR3JvdXAoe1xuICAgICAgICAgICAgbG9jYWxwYXJ0OiB0aGlzLnN0YXRlLmdyb3VwSWQsXG4gICAgICAgICAgICBwcm9maWxlOiBwcm9maWxlLFxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAndmlld19ncm91cCcsXG4gICAgICAgICAgICAgICAgZ3JvdXBfaWQ6IHJlc3VsdC5ncm91cF9pZCxcbiAgICAgICAgICAgICAgICBncm91cF9pc19uZXc6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSkuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2NyZWF0ZUVycm9yOiBlfSk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y3JlYXRpbmc6IGZhbHNlfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25DYW5jZWwgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQmFzZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmRpYWxvZ3MuQmFzZURpYWxvZycpO1xuICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmNyZWF0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gPFNwaW5uZXIgLz47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3JlYXRlRXJyb3JOb2RlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5jcmVhdGVFcnJvcikge1xuICAgICAgICAgICAgLy8gWFhYOiBXZSBzaG91bGQgY2F0Y2ggZXJyY29kZXMgYW5kIGdpdmUgc2Vuc2libGUgaTE4bmVkIG1lc3NhZ2VzIGZvciB0aGVtLFxuICAgICAgICAgICAgLy8gcmF0aGVyIHRoYW4gZGlzcGxheWluZyB3aGF0IHRoZSBzZXJ2ZXIgZ2l2ZXMgdXMsIGJ1dCBzeW5hcHNlIGRvZXNuJ3QgZ2l2ZVxuICAgICAgICAgICAgLy8gYW55IHlldC5cbiAgICAgICAgICAgIGNyZWF0ZUVycm9yTm9kZSA9IDxkaXYgY2xhc3NOYW1lPVwiZXJyb3JcIiByb2xlPVwiYWxlcnRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgX3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxzdCBjcmVhdGluZyB5b3VyIGNvbW11bml0eScpIH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PnsgdGhpcy5zdGF0ZS5jcmVhdGVFcnJvci5tZXNzYWdlIH08L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ1wiIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoJ0NyZWF0ZSBDb21tdW5pdHknKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5fb25Gb3JtU3VibWl0fT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9EaWFsb2dfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19pbnB1dFJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dfbGFiZWxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJncm91cG5hbWVcIj57IF90KCdDb21tdW5pdHkgTmFtZScpIH08L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImdyb3VwbmFtZVwiIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX2lucHV0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Gb2N1cz17dHJ1ZX0gc2l6ZT1cIjY0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtfdCgnRXhhbXBsZScpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uR3JvdXBOYW1lQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuZ3JvdXBOYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX2lucHV0Um93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19sYWJlbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cImdyb3VwaWRcIj57IF90KCdDb21tdW5pdHkgSUQnKSB9PC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX2lucHV0X2dyb3VwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X0NyZWF0ZUdyb3VwRGlhbG9nX3ByZWZpeFwiPis8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCBpZD1cImdyb3VwaWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQ3JlYXRlR3JvdXBEaWFsb2dfaW5wdXQgbXhfQ3JlYXRlR3JvdXBEaWFsb2dfaW5wdXRfaGFzUHJlZml4QW5kU3VmZml4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNpemU9XCIzMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17X3QoJ2V4YW1wbGUnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkdyb3VwSWRDaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMuX29uR3JvdXBJZEJsdXJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5ncm91cElkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJteF9DcmVhdGVHcm91cERpYWxvZ19zdWZmaXhcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDp7IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXREb21haW4oKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJlcnJvclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5ncm91cElkRXJyb3IgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGNyZWF0ZUVycm9yTm9kZSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19idXR0b25zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInN1Ym1pdFwiIHZhbHVlPXtfdCgnQ3JlYXRlJyl9IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19wcmltYXJ5XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5fb25DYW5jZWx9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=