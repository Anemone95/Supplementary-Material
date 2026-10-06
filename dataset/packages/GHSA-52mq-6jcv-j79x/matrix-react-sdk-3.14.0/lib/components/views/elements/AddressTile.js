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

var _classnames = _interopRequireDefault(require("classnames"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var _UserAddress = require("../../../UserAddress.js");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2017 New Vector Ltd

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
class AddressTile extends _react.default.Component {
  render() {
    const address = this.props.address;
    const name = address.displayName || address.address;
    const imgUrls = [];
    const isMatrixAddress = ['mx-user-id', 'mx-room-id'].includes(address.addressType);

    if (isMatrixAddress && address.avatarMxc) {
      imgUrls.push(_MatrixClientPeg.MatrixClientPeg.get().mxcUrlToHttp(address.avatarMxc, 25, 25, 'crop'));
    } else if (address.addressType === 'email') {
      imgUrls.push(require("../../../../res/img/icon-email-user.svg"));
    }

    const BaseAvatar = sdk.getComponent('avatars.BaseAvatar');
    const TintableSvg = sdk.getComponent("elements.TintableSvg");
    const nameClasses = (0, _classnames.default)({
      "mx_AddressTile_name": true,
      "mx_AddressTile_justified": this.props.justified
    });
    let info;
    let error = false;

    if (isMatrixAddress && address.isKnown) {
      const idClasses = (0, _classnames.default)({
        "mx_AddressTile_id": true,
        "mx_AddressTile_justified": this.props.justified
      });
      info = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressTile_mx"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: nameClasses
      }, name), this.props.showAddress ? /*#__PURE__*/_react.default.createElement("div", {
        className: idClasses
      }, address.address) : /*#__PURE__*/_react.default.createElement("div", null));
    } else if (isMatrixAddress) {
      const unknownMxClasses = (0, _classnames.default)({
        "mx_AddressTile_unknownMx": true,
        "mx_AddressTile_justified": this.props.justified
      });
      info = /*#__PURE__*/_react.default.createElement("div", {
        className: unknownMxClasses
      }, this.props.address.address);
    } else if (address.addressType === "email") {
      const emailClasses = (0, _classnames.default)({
        "mx_AddressTile_email": true,
        "mx_AddressTile_justified": this.props.justified
      });
      let nameNode = null;

      if (address.displayName) {
        nameNode = /*#__PURE__*/_react.default.createElement("div", {
          className: nameClasses
        }, address.displayName);
      }

      info = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressTile_mx"
      }, /*#__PURE__*/_react.default.createElement("div", {
        className: emailClasses
      }, address.address), nameNode);
    } else {
      error = true;
      const unknownClasses = (0, _classnames.default)({
        "mx_AddressTile_unknown": true,
        "mx_AddressTile_justified": this.props.justified
      });
      info = /*#__PURE__*/_react.default.createElement("div", {
        className: unknownClasses
      }, (0, _languageHandler._t)("Unknown Address"));
    }

    const classes = (0, _classnames.default)({
      "mx_AddressTile": true,
      "mx_AddressTile_error": error
    });
    let dismiss;

    if (this.props.canDismiss) {
      dismiss = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_AddressTile_dismiss",
        onClick: this.props.onDismissed
      }, /*#__PURE__*/_react.default.createElement(TintableSvg, {
        src: require("../../../../res/img/icon-address-delete.svg"),
        width: "9",
        height: "9"
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AddressTile_avatar"
    }, /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      defaultToInitialLetter: true,
      width: 25,
      height: 25,
      name: name,
      title: name,
      urls: imgUrls
    })), info, dismiss);
  }

}

exports.default = AddressTile;
(0, _defineProperty2.default)(AddressTile, "propTypes", {
  address: _UserAddress.UserAddressType.isRequired,
  canDismiss: _propTypes.default.bool,
  onDismissed: _propTypes.default.func,
  justified: _propTypes.default.bool
});
(0, _defineProperty2.default)(AddressTile, "defaultProps", {
  canDismiss: false,
  onDismissed: function () {},
  // NOP
  justified: false
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FkZHJlc3NUaWxlLmpzIl0sIm5hbWVzIjpbIkFkZHJlc3NUaWxlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJyZW5kZXIiLCJhZGRyZXNzIiwicHJvcHMiLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJpbWdVcmxzIiwiaXNNYXRyaXhBZGRyZXNzIiwiaW5jbHVkZXMiLCJhZGRyZXNzVHlwZSIsImF2YXRhck14YyIsInB1c2giLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJteGNVcmxUb0h0dHAiLCJyZXF1aXJlIiwiQmFzZUF2YXRhciIsInNkayIsImdldENvbXBvbmVudCIsIlRpbnRhYmxlU3ZnIiwibmFtZUNsYXNzZXMiLCJqdXN0aWZpZWQiLCJpbmZvIiwiZXJyb3IiLCJpc0tub3duIiwiaWRDbGFzc2VzIiwic2hvd0FkZHJlc3MiLCJ1bmtub3duTXhDbGFzc2VzIiwiZW1haWxDbGFzc2VzIiwibmFtZU5vZGUiLCJ1bmtub3duQ2xhc3NlcyIsImNsYXNzZXMiLCJkaXNtaXNzIiwiY2FuRGlzbWlzcyIsIm9uRGlzbWlzc2VkIiwiVXNlckFkZHJlc3NUeXBlIiwiaXNSZXF1aXJlZCIsIlByb3BUeXBlcyIsImJvb2wiLCJmdW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVdlLE1BQU1BLFdBQU4sU0FBMEJDLGVBQU1DLFNBQWhDLENBQTBDO0FBY3JEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxPQUFPLEdBQUcsS0FBS0MsS0FBTCxDQUFXRCxPQUEzQjtBQUNBLFVBQU1FLElBQUksR0FBR0YsT0FBTyxDQUFDRyxXQUFSLElBQXVCSCxPQUFPLENBQUNB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QUpOLEM7OEJBREZ4QyxXLGtCQVFLO0FBQ2xCbUMsRUFBQUEsVUFBVSxFQUFFLEtBRE07QUFFbEJDLEVBQUFBLFdBQVcsRUFBRSxZQUFXLENBQUUsQ0FGUjtBQUVVO0FBQzVCYixFQUFBQSxTQUFTLEVBQUU7QUFITyxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSBcIi4uLy4uLy4uL2luZGV4XCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IHsgVXNlckFkZHJlc3NUeXBlIH0gZnJvbSAnLi4vLi4vLi4vVXNlckFkZHJlc3MuanMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFkZHJlc3NUaWxlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBhZGRyZXNzOiBVc2VyQWRkcmVzc1R5cGUuaXNSZXF1aXJlZCxcbiAgICAgICAgY2FuRGlzbWlzczogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uRGlzbWlzc2VkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAganVzdGlmaWVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgY2FuRGlzbWlzczogZmFsc2UsXG4gICAgICAgIG9uRGlzbWlzc2VkOiBmdW5jdGlvbigpIHt9LCAvLyBOT1BcbiAgICAgICAganVzdGlmaWVkOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gdGhpcy5wcm9wcy5hZGRyZXNzO1xuICAgICAgICBjb25zdCBuYW1lID0gYWRkcmVzcy5kaXNwbGF5TmFtZSB8fCBhZGRyZXNzLmFkZHJlc3M7XG5cbiAgICAgICAgY29uc3QgaW1nVXJscyA9IFtdO1xuICAgICAgICBjb25zdCBpc01hdHJpeEFkZHJlc3MgPSBbJ214LXVzZXItaWQnLCAnbXgtcm9vbS1pZCddLmluY2x1ZGVzKGFkZHJlc3MuYWRkcmVzc1R5cGUpO1xuXG4gICAgICAgIGlmIChpc01hdHJpeEFkZHJlc3MgJiYgYWRkcmVzcy5hdmF0YXJNeGMpIHtcbiAgICAgICAgICAgIGltZ1VybHMucHVzaChNYXRyaXhDbGllbnRQZWcuZ2V0KCkubXhjVXJsVG9IdHRwKFxuICAgICAgICAgICAgICAgIGFkZHJlc3MuYXZhdGFyTXhjLCAyNSwgMjUsICdjcm9wJyxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFkZHJlc3MuYWRkcmVzc1R5cGUgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgICAgIGltZ1VybHMucHVzaChyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9pY29uLWVtYWlsLXVzZXIuc3ZnXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdhdmF0YXJzLkJhc2VBdmF0YXInKTtcbiAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVGludGFibGVTdmdcIik7XG5cbiAgICAgICAgY29uc3QgbmFtZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfbmFtZVwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV9qdXN0aWZpZWRcIjogdGhpcy5wcm9wcy5qdXN0aWZpZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBpbmZvO1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcbiAgICAgICAgaWYgKGlzTWF0cml4QWRkcmVzcyAmJiBhZGRyZXNzLmlzS25vd24pIHtcbiAgICAgICAgICAgIGNvbnN0IGlkQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfaWRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2p1c3RpZmllZFwiOiB0aGlzLnByb3BzLmp1c3RpZmllZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfbXhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e25hbWVDbGFzc2VzfT57IG5hbWUgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd0FkZHJlc3MgP1xuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2lkQ2xhc3Nlc30+eyBhZGRyZXNzLmFkZHJlc3MgfTwvZGl2PiA6XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNNYXRyaXhBZGRyZXNzKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duTXhDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV91bmtub3duTXhcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2p1c3RpZmllZFwiOiB0aGlzLnByb3BzLmp1c3RpZmllZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt1bmtub3duTXhDbGFzc2VzfT57IHRoaXMucHJvcHMuYWRkcmVzcy5hZGRyZXNzIH08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWRkcmVzcy5hZGRyZXNzVHlwZSA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICBjb25zdCBlbWFpbENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2VtYWlsXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV9qdXN0aWZpZWRcIjogdGhpcy5wcm9wcy5qdXN0aWZpZWQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IG5hbWVOb2RlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8ZGl2IGNsYXNzTmFtZT17bmFtZUNsYXNzZXN9PnsgYWRkcmVzcy5kaXNwbGF5TmFtZSB9PC9kaXY+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfbXhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2VtYWlsQ2xhc3Nlc30+eyBhZGRyZXNzLmFkZHJlc3MgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IG5hbWVOb2RlIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfdW5rbm93blwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfanVzdGlmaWVkXCI6IHRoaXMucHJvcHMuanVzdGlmaWVkLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGluZm8gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Vua25vd25DbGFzc2VzfT57IF90KFwiVW5rbm93biBBZGRyZXNzXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2Vycm9yXCI6IGVycm9yLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGlzbWlzcztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuRGlzbWlzcykge1xuICAgICAgICAgICAgZGlzbWlzcyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NUaWxlX2Rpc21pc3NcIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uRGlzbWlzc2VkfSA+XG4gICAgICAgICAgICAgICAgICAgIDxUaW50YWJsZVN2ZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb24tYWRkcmVzcy1kZWxldGUuc3ZnXCIpfSB3aWR0aD1cIjlcIiBoZWlnaHQ9XCI5XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIGRlZmF1bHRUb0luaXRpYWxMZXR0ZXI9e3RydWV9IHdpZHRoPXsyNX0gaGVpZ2h0PXsyNX0gbmFtZT17bmFtZX0gdGl0bGU9e25hbWV9IHVybHM9e2ltZ1VybHN9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBpbmZvIH1cbiAgICAgICAgICAgICAgICB7IGRpc21pc3MgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19