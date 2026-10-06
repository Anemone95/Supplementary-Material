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

var _classnames = _interopRequireDefault(require("classnames"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _UserAddress = require("../../../UserAddress.js");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _class2, _temp;

let AddressTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.AddressTile"), _dec(_class = (_temp = _class2 = class AddressTile extends _react.default.Component {
  render() {
    const address = this.props.address;
    const name = address.displayName || address.address;
    const imgUrls = [];
    const isMatrixAddress = ['mx-user-id', 'mx-room-id'].includes(address.addressType);

    if (isMatrixAddress && address.avatarMxc) {
      imgUrls.push((0, _Media.mediaFromMxc)(address.avatarMxc).getSquareThumbnailHttp(25));
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  address: _UserAddress.UserAddressType.isRequired,
  canDismiss: _propTypes.default.bool,
  onDismissed: _propTypes.default.func,
  justified: _propTypes.default.bool
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  canDismiss: false,
  onDismissed: function () {},
  // NOP
  justified: false
}), _temp)) || _class);
exports.default = AddressTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FkZHJlc3NUaWxlLmpzIl0sIm5hbWVzIjpbIkFkZHJlc3NUaWxlIiwiUmVhY3QiLCJDb21wb25lbnQiLCJyZW5kZXIiLCJhZGRyZXNzIiwicHJvcHMiLCJuYW1lIiwiZGlzcGxheU5hbWUiLCJpbWdVcmxzIiwiaXNNYXRyaXhBZGRyZXNzIiwiaW5jbHVkZXMiLCJhZGRyZXNzVHlwZSIsImF2YXRhck14YyIsInB1c2giLCJnZXRTcXVhcmVUaHVtYm5haWxIdHRwIiwicmVxdWlyZSIsIkJhc2VBdmF0YXIiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJUaW50YWJsZVN2ZyIsIm5hbWVDbGFzc2VzIiwianVzdGlmaWVkIiwiaW5mbyIsImVycm9yIiwiaXNLbm93biIsImlkQ2xhc3NlcyIsInNob3dBZGRyZXNzIiwidW5rbm93bk14Q2xhc3NlcyIsImVtYWlsQ2xhc3NlcyIsIm5hbWVOb2RlIiwidW5rbm93bkNsYXNzZXMiLCJjbGFzc2VzIiwiZGlzbWlzcyIsImNhbkRpc21pc3MiLCJvbkRpc21pc3NlZCIsIlVzZXJBZGRyZXNzVHlwZSIsImlzUmVxdWlyZWQiLCJQcm9wVHlwZXMiLCJib29sIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsVyxXQURwQixnREFBcUIsNEJBQXJCLEMsbUNBQUQsTUFDcUJBLFdBRHJCLFNBQ3lDQyxlQUFNQyxTQUQvQyxDQUN5RDtBQWNyREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsT0FBTyxHQUFHLEtBQUtDLEtBQUwsQ0FBV0QsT0FBM0I7QUFDQSxVQUFNRSxJQUFJLEdBQUdGLE9BQU8sQ0FBQ0csV0FBUixJQUF1QkgsT0FBTyxDQUFDQSxPQUE1QztBQUVBLFVBQU1JLE9BQU8sR0FBRyxFQUFoQjtBQUNBLFVBQU1DLGVBQWUsR0FB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QVMsRUFBRTtBQUhPLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IFVzZXJBZGRyZXNzVHlwZSB9IGZyb20gJy4uLy4uLy4uL1VzZXJBZGRyZXNzLmpzJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHttZWRpYUZyb21NeGN9IGZyb20gXCIuLi8uLi8uLi9jdXN0b21pc2F0aW9ucy9NZWRpYVwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5lbGVtZW50cy5BZGRyZXNzVGlsZVwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQWRkcmVzc1RpbGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIGFkZHJlc3M6IFVzZXJBZGRyZXNzVHlwZS5pc1JlcXVpcmVkLFxuICAgICAgICBjYW5EaXNtaXNzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25EaXNtaXNzZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBqdXN0aWZpZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBjYW5EaXNtaXNzOiBmYWxzZSxcbiAgICAgICAgb25EaXNtaXNzZWQ6IGZ1bmN0aW9uKCkge30sIC8vIE5PUFxuICAgICAgICBqdXN0aWZpZWQ6IGZhbHNlLFxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSB0aGlzLnByb3BzLmFkZHJlc3M7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBhZGRyZXNzLmRpc3BsYXlOYW1lIHx8IGFkZHJlc3MuYWRkcmVzcztcblxuICAgICAgICBjb25zdCBpbWdVcmxzID0gW107XG4gICAgICAgIGNvbnN0IGlzTWF0cml4QWRkcmVzcyA9IFsnbXgtdXNlci1pZCcsICdteC1yb29tLWlkJ10uaW5jbHVkZXMoYWRkcmVzcy5hZGRyZXNzVHlwZSk7XG5cbiAgICAgICAgaWYgKGlzTWF0cml4QWRkcmVzcyAmJiBhZGRyZXNzLmF2YXRhck14Yykge1xuICAgICAgICAgICAgaW1nVXJscy5wdXNoKG1lZGlhRnJvbU14YyhhZGRyZXNzLmF2YXRhck14YykuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCgyNSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGFkZHJlc3MuYWRkcmVzc1R5cGUgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgICAgIGltZ1VybHMucHVzaChyZXF1aXJlKFwiLi4vLi4vLi4vLi4vcmVzL2ltZy9pY29uLWVtYWlsLXVzZXIuc3ZnXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEJhc2VBdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdhdmF0YXJzLkJhc2VBdmF0YXInKTtcbiAgICAgICAgY29uc3QgVGludGFibGVTdmcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuVGludGFibGVTdmdcIik7XG5cbiAgICAgICAgY29uc3QgbmFtZUNsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfbmFtZVwiOiB0cnVlLFxuICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV9qdXN0aWZpZWRcIjogdGhpcy5wcm9wcy5qdXN0aWZpZWQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBpbmZvO1xuICAgICAgICBsZXQgZXJyb3IgPSBmYWxzZTtcbiAgICAgICAgaWYgKGlzTWF0cml4QWRkcmVzcyAmJiBhZGRyZXNzLmlzS25vd24pIHtcbiAgICAgICAgICAgIGNvbnN0IGlkQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfaWRcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2p1c3RpZmllZFwiOiB0aGlzLnByb3BzLmp1c3RpZmllZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfbXhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e25hbWVDbGFzc2VzfT57IG5hbWUgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuc2hvd0FkZHJlc3MgP1xuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2lkQ2xhc3Nlc30+eyBhZGRyZXNzLmFkZHJlc3MgfTwvZGl2PiA6XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IC8+XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNNYXRyaXhBZGRyZXNzKSB7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duTXhDbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV91bmtub3duTXhcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2p1c3RpZmllZFwiOiB0aGlzLnByb3BzLmp1c3RpZmllZCxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXt1bmtub3duTXhDbGFzc2VzfT57IHRoaXMucHJvcHMuYWRkcmVzcy5hZGRyZXNzIH08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoYWRkcmVzcy5hZGRyZXNzVHlwZSA9PT0gXCJlbWFpbFwiKSB7XG4gICAgICAgICAgICBjb25zdCBlbWFpbENsYXNzZXMgPSBjbGFzc05hbWVzKHtcbiAgICAgICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2VtYWlsXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgXCJteF9BZGRyZXNzVGlsZV9qdXN0aWZpZWRcIjogdGhpcy5wcm9wcy5qdXN0aWZpZWQsXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IG5hbWVOb2RlID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgbmFtZU5vZGUgPSA8ZGl2IGNsYXNzTmFtZT17bmFtZUNsYXNzZXN9PnsgYWRkcmVzcy5kaXNwbGF5TmFtZSB9PC9kaXY+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmZvID0gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfbXhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2VtYWlsQ2xhc3Nlc30+eyBhZGRyZXNzLmFkZHJlc3MgfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IG5hbWVOb2RlIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlcnJvciA9IHRydWU7XG4gICAgICAgICAgICBjb25zdCB1bmtub3duQ2xhc3NlcyA9IGNsYXNzTmFtZXMoe1xuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfdW5rbm93blwiOiB0cnVlLFxuICAgICAgICAgICAgICAgIFwibXhfQWRkcmVzc1RpbGVfanVzdGlmaWVkXCI6IHRoaXMucHJvcHMuanVzdGlmaWVkLFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGluZm8gPSAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e3Vua25vd25DbGFzc2VzfT57IF90KFwiVW5rbm93biBBZGRyZXNzXCIpIH08L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NOYW1lcyh7XG4gICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlXCI6IHRydWUsXG4gICAgICAgICAgICBcIm14X0FkZHJlc3NUaWxlX2Vycm9yXCI6IGVycm9yLFxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZGlzbWlzcztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuY2FuRGlzbWlzcykge1xuICAgICAgICAgICAgZGlzbWlzcyA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0FkZHJlc3NUaWxlX2Rpc21pc3NcIiBvbkNsaWNrPXt0aGlzLnByb3BzLm9uRGlzbWlzc2VkfSA+XG4gICAgICAgICAgICAgICAgICAgIDxUaW50YWJsZVN2ZyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb24tYWRkcmVzcy1kZWxldGUuc3ZnXCIpfSB3aWR0aD1cIjlcIiBoZWlnaHQ9XCI5XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXN9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfQWRkcmVzc1RpbGVfYXZhdGFyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxCYXNlQXZhdGFyIGRlZmF1bHRUb0luaXRpYWxMZXR0ZXI9e3RydWV9IHdpZHRoPXsyNX0gaGVpZ2h0PXsyNX0gbmFtZT17bmFtZX0gdGl0bGU9e25hbWV9IHVybHM9e2ltZ1VybHN9IC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgeyBpbmZvIH1cbiAgICAgICAgICAgICAgICB7IGRpc21pc3MgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19