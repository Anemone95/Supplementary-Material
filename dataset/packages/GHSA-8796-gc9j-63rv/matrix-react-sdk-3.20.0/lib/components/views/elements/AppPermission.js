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

var _url = _interopRequireDefault(require("url"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../SdkConfig"));

var _WidgetUtils = _interopRequireDefault(require("../../../utils/WidgetUtils"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let AppPermission = (_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.AppPermission"), _dec(_class = (_temp = _class2 = class AppPermission extends _react.default.Component {
  constructor(props) {
    super(props); // The first step is to pick apart the widget so we can render information about it

    const urlInfo = this.parseWidgetUrl(); // The second step is to find the user's profile so we can show it on the prompt

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.roomId);

    let roomMember;
    if (room) roomMember = room.getMember(this.props.creatorUserId); // Set all this into the initial state

    this.state = _objectSpread(_objectSpread({}, urlInfo), {}, {
      roomMember
    });
  }

  parseWidgetUrl() {
    const widgetUrl = _url.default.parse(this.props.url);

    const params = new URLSearchParams(widgetUrl.search); // HACK: We're relying on the query params when we should be relying on the widget's `data`.
    // This is a workaround for Scalar.

    if (_WidgetUtils.default.isScalarUrl(widgetUrl) && params && params.get('url')) {
      const unwrappedUrl = _url.default.parse(params.get('url'));

      return {
        widgetDomain: unwrappedUrl.host || unwrappedUrl.hostname,
        isWrapped: true
      };
    } else {
      return {
        widgetDomain: widgetUrl.host || widgetUrl.hostname,
        isWrapped: false
      };
    }
  }

  render() {
    const brand = _SdkConfig.default.get().brand;

    const AccessibleButton = sdk.getComponent("views.elements.AccessibleButton");
    const MemberAvatar = sdk.getComponent("views.avatars.MemberAvatar");
    const BaseAvatar = sdk.getComponent("views.avatars.BaseAvatar");
    const TextWithTooltip = sdk.getComponent("views.elements.TextWithTooltip");
    const displayName = this.state.roomMember ? this.state.roomMember.name : this.props.creatorUserId;
    const userId = displayName === this.props.creatorUserId ? null : this.props.creatorUserId;
    const avatar = this.state.roomMember ? /*#__PURE__*/_react.default.createElement(MemberAvatar, {
      member: this.state.roomMember,
      width: 38,
      height: 38
    }) : /*#__PURE__*/_react.default.createElement(BaseAvatar, {
      name: this.props.creatorUserId,
      width: 38,
      height: 38
    });

    const warningTooltipText = /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("Any of the following data may be shared:"), /*#__PURE__*/_react.default.createElement("ul", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your display name")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your avatar URL")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your user ID")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Your theme")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("%(brand)s URL", {
      brand
    })), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Room ID")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Widget ID"))));

    const warningTooltip = /*#__PURE__*/_react.default.createElement(TextWithTooltip, {
      tooltip: warningTooltipText,
      tooltipClass: "mx_AppPermissionWarning_tooltip mx_Tooltip_dark"
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_AppPermissionWarning_helpIcon"
    })); // Due to i18n limitations, we can't dedupe the code for variables in these two messages.


    const warning = this.state.isWrapped ? (0, _languageHandler._t)("Using this widget may share data <helpIcon /> with %(widgetDomain)s & your Integration Manager.", {
      widgetDomain: this.state.widgetDomain
    }, {
      helpIcon: () => warningTooltip
    }) : (0, _languageHandler._t)("Using this widget may share data <helpIcon /> with %(widgetDomain)s.", {
      widgetDomain: this.state.widgetDomain
    }, {
      helpIcon: () => warningTooltip
    });
    const encryptionWarning = this.props.isRoomEncrypted ? (0, _languageHandler._t)("Widgets do not use message encryption.") : null;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_bolder mx_AppPermissionWarning_smallText"
    }, (0, _languageHandler._t)("Widget added by")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row"
    }, avatar, /*#__PURE__*/_react.default.createElement("h4", {
      className: "mx_AppPermissionWarning_bolder"
    }, displayName), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_smallText"
    }, userId)), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_smallText"
    }, warning), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row mx_AppPermissionWarning_smallText"
    }, (0, _languageHandler._t)("This widget may use cookies."), "\xA0", encryptionWarning), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_AppPermissionWarning_row"
    }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary_sm",
      onClick: this.props.onPermissionGranted
    }, (0, _languageHandler._t)("Continue"))));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  url: _propTypes.default.string.isRequired,
  creatorUserId: _propTypes.default.string.isRequired,
  roomId: _propTypes.default.string.isRequired,
  onPermissionGranted: _propTypes.default.func.isRequired,
  isRoomEncrypted: _propTypes.default.bool
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  onPermissionGranted: () => {}
}), _temp)) || _class);
exports.default = AppPermission;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0FwcFBlcm1pc3Npb24uanMiXSwibmFtZXMiOlsiQXBwUGVybWlzc2lvbiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsInVybEluZm8iLCJwYXJzZVdpZGdldFVybCIsInJvb20iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRSb29tIiwicm9vbUlkIiwicm9vbU1lbWJlciIsImdldE1lbWJlciIsImNyZWF0b3JVc2VySWQiLCJzdGF0ZSIsIndpZGdldFVybCIsInVybCIsInBhcnNlIiwicGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwic2VhcmNoIiwiV2lkZ2V0VXRpbHMiLCJpc1NjYWxhclVybCIsInVud3JhcHBlZFVybCIsIndpZGdldERvbWFpbiIsImhvc3QiLCJob3N0bmFtZSIsImlzV3JhcHBlZCIsInJlbmRlciIsImJyYW5kIiwiU2RrQ29uZmlnIiwiQWNjZXNzaWJsZUJ1dHRvbiIsInNkayIsImdldENvbXBvbmVudCIsIk1lbWJlckF2YXRhciIsIkJhc2VBdmF0YXIiLCJUZXh0V2l0aFRvb2x0aXAiLCJkaXNwbGF5TmFtZSIsIm5hbWUiLCJ1c2VySWQiLCJhdmF0YXIiLCJ3YXJuaW5nVG9vbHRpcFRleHQiLCJ3YXJuaW5nVG9vbHRpcCIsIndhcm5pbmciLCJoZWxwSWNvbiIsImVuY3J5cHRpb25XYXJuaW5nIiwiaXNSb29tRW5jcnlwdGVkIiwib25QZXJtaXNzaW9uR3JhbnRlZCIsIlByb3BUeXBlcyIsInN0cmluZyIsImlzUmVxdWlyZWQiLCJmdW5jIiwiYm9vbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWtCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7SUFHcUJBLGEsV0FEcEIsZ0RBQXFCLDhCQUFyQixDLG1DQUFELE1BQ3FCQSxhQURyQixTQUMyQ0MsZUFBTUMs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QUFDO0FBQWYsT0FDS04sTUFETCxlQUVJO0FBQUksTUFBQSxTQUFTLEVBQUM7QUFBZCxPQUFnREgsV0FBaEQsQ0FGSixlQUdJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUFvREUsTUFBcEQsQ0FISixDQUpKLGVBU0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ0tJLE9BREwsQ0FUSixlQVlJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLLHlCQUFHLDhCQUFILENBREwsVUFDK0NFLGlCQUQvQyxDQVpKLGVBZUk7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJLDZCQUFDLGdCQUFEO0FBQWtCLE1BQUEsSUFBSSxFQUFDLFlBQXZCO0FBQW9DLE1BQUEsT0FBTyxFQUFFLEtBQUsxQyxLQUFMLENBQVc0QztBQUF4RCxPQUNLLHlCQUFHLFVBQUgsQ0FETCxDQURKLENBZkosQ0FESjtBQXVCSDs7QUFySHNELEMsc0RBQ3BDO0FBQ2YvQixFQUFBQSxHQUFHLEVBQUVnQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFEUDtBQUVmckMsRUFBQUEsYUFBYSxFQUFFbUMsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRmpCO0FBR2Z4QyxFQUFBQSxNQUFNLEVBQUVzQyxtQkFBVUMsTUFBVixDQUFpQkMsVUFIVjtBQUlmSCxFQUFBQSxtQkFBbUIsRUFBRUMsbUJBQVVHLElBQVYsQ0FBZUQsVUFKckI7QUFLZkosRUFBQUEsZUFBZSxFQUFFRSxtQkFBVUk7QUFMWixDLDBEQVFHO0FBQ2xCTCxFQUFBQSxtQkFBbUIsRUFBRSxNQUFNLENBQUU7QUFEWCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IFZlY3RvciBDcmVhdGlvbnMgTHRkXG5Db3B5cmlnaHQgMjAxOCwgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4uLy4uLy4uL1Nka0NvbmZpZyc7XG5pbXBvcnQgV2lkZ2V0VXRpbHMgZnJvbSBcIi4uLy4uLy4uL3V0aWxzL1dpZGdldFV0aWxzXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLkFwcFBlcm1pc3Npb25cIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFwcFBlcm1pc3Npb24gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHVybDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBjcmVhdG9yVXNlcklkOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgICAgIHJvb21JZDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICAgICAgICBvblBlcm1pc3Npb25HcmFudGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBpc1Jvb21FbmNyeXB0ZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBvblBlcm1pc3Npb25HcmFudGVkOiAoKSA9PiB7fSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIC8vIFRoZSBmaXJzdCBzdGVwIGlzIHRvIHBpY2sgYXBhcnQgdGhlIHdpZGdldCBzbyB3ZSBjYW4gcmVuZGVyIGluZm9ybWF0aW9uIGFib3V0IGl0XG4gICAgICAgIGNvbnN0IHVybEluZm8gPSB0aGlzLnBhcnNlV2lkZ2V0VXJsKCk7XG5cbiAgICAgICAgLy8gVGhlIHNlY29uZCBzdGVwIGlzIHRvIGZpbmQgdGhlIHVzZXIncyBwcm9maWxlIHNvIHdlIGNhbiBzaG93IGl0IG9uIHRoZSBwcm9tcHRcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgbGV0IHJvb21NZW1iZXI7XG4gICAgICAgIGlmIChyb29tKSByb29tTWVtYmVyID0gcm9vbS5nZXRNZW1iZXIodGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkKTtcblxuICAgICAgICAvLyBTZXQgYWxsIHRoaXMgaW50byB0aGUgaW5pdGlhbCBzdGF0ZVxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLi4udXJsSW5mbyxcbiAgICAgICAgICAgIHJvb21NZW1iZXIsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcGFyc2VXaWRnZXRVcmwoKSB7XG4gICAgICAgIGNvbnN0IHdpZGdldFVybCA9IHVybC5wYXJzZSh0aGlzLnByb3BzLnVybCk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2lkZ2V0VXJsLnNlYXJjaCk7XG5cbiAgICAgICAgLy8gSEFDSzogV2UncmUgcmVseWluZyBvbiB0aGUgcXVlcnkgcGFyYW1zIHdoZW4gd2Ugc2hvdWxkIGJlIHJlbHlpbmcgb24gdGhlIHdpZGdldCdzIGBkYXRhYC5cbiAgICAgICAgLy8gVGhpcyBpcyBhIHdvcmthcm91bmQgZm9yIFNjYWxhci5cbiAgICAgICAgaWYgKFdpZGdldFV0aWxzLmlzU2NhbGFyVXJsKHdpZGdldFVybCkgJiYgcGFyYW1zICYmIHBhcmFtcy5nZXQoJ3VybCcpKSB7XG4gICAgICAgICAgICBjb25zdCB1bndyYXBwZWRVcmwgPSB1cmwucGFyc2UocGFyYW1zLmdldCgndXJsJykpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWRnZXREb21haW46IHVud3JhcHBlZFVybC5ob3N0IHx8IHVud3JhcHBlZFVybC5ob3N0bmFtZSxcbiAgICAgICAgICAgICAgICBpc1dyYXBwZWQ6IHRydWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB3aWRnZXREb21haW46IHdpZGdldFVybC5ob3N0IHx8IHdpZGdldFVybC5ob3N0bmFtZSxcbiAgICAgICAgICAgICAgICBpc1dyYXBwZWQ6IGZhbHNlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgIGNvbnN0IEFjY2Vzc2libGVCdXR0b24gPSBzZGsuZ2V0Q29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgTWVtYmVyQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmF2YXRhcnMuTWVtYmVyQXZhdGFyXCIpO1xuICAgICAgICBjb25zdCBCYXNlQXZhdGFyID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmF2YXRhcnMuQmFzZUF2YXRhclwiKTtcbiAgICAgICAgY29uc3QgVGV4dFdpdGhUb29sdGlwID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLlRleHRXaXRoVG9vbHRpcFwiKTtcblxuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IHRoaXMuc3RhdGUucm9vbU1lbWJlciA/IHRoaXMuc3RhdGUucm9vbU1lbWJlci5uYW1lIDogdGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkO1xuICAgICAgICBjb25zdCB1c2VySWQgPSBkaXNwbGF5TmFtZSA9PT0gdGhpcy5wcm9wcy5jcmVhdG9yVXNlcklkID8gbnVsbCA6IHRoaXMucHJvcHMuY3JlYXRvclVzZXJJZDtcblxuICAgICAgICBjb25zdCBhdmF0YXIgPSB0aGlzLnN0YXRlLnJvb21NZW1iZXJcbiAgICAgICAgICAgID8gPE1lbWJlckF2YXRhciBtZW1iZXI9e3RoaXMuc3RhdGUucm9vbU1lbWJlcn0gd2lkdGg9ezM4fSBoZWlnaHQ9ezM4fSAvPlxuICAgICAgICAgICAgOiA8QmFzZUF2YXRhciBuYW1lPXt0aGlzLnByb3BzLmNyZWF0b3JVc2VySWR9IHdpZHRoPXszOH0gaGVpZ2h0PXszOH0gLz47XG5cbiAgICAgICAgY29uc3Qgd2FybmluZ1Rvb2x0aXBUZXh0ID0gKFxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICB7X3QoXCJBbnkgb2YgdGhlIGZvbGxvd2luZyBkYXRhIG1heSBiZSBzaGFyZWQ6XCIpfVxuICAgICAgICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIllvdXIgZGlzcGxheSBuYW1lXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJZb3VyIGF2YXRhciBVUkxcIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIllvdXIgdXNlciBJRFwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiWW91ciB0aGVtZVwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiJShicmFuZClzIFVSTFwiLCB7IGJyYW5kIH0pfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJSb29tIElEXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJXaWRnZXQgSURcIil9PC9saT5cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IHdhcm5pbmdUb29sdGlwID0gKFxuICAgICAgICAgICAgPFRleHRXaXRoVG9vbHRpcCB0b29sdGlwPXt3YXJuaW5nVG9vbHRpcFRleHR9IHRvb2x0aXBDbGFzcz0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfdG9vbHRpcCBteF9Ub29sdGlwX2RhcmsnPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfaGVscEljb24nIC8+XG4gICAgICAgICAgICA8L1RleHRXaXRoVG9vbHRpcD5cbiAgICAgICAgKTtcblxuICAgICAgICAvLyBEdWUgdG8gaTE4biBsaW1pdGF0aW9ucywgd2UgY2FuJ3QgZGVkdXBlIHRoZSBjb2RlIGZvciB2YXJpYWJsZXMgaW4gdGhlc2UgdHdvIG1lc3NhZ2VzLlxuICAgICAgICBjb25zdCB3YXJuaW5nID0gdGhpcy5zdGF0ZS5pc1dyYXBwZWRcbiAgICAgICAgICAgID8gX3QoXCJVc2luZyB0aGlzIHdpZGdldCBtYXkgc2hhcmUgZGF0YSA8aGVscEljb24gLz4gd2l0aCAlKHdpZGdldERvbWFpbilzICYgeW91ciBJbnRlZ3JhdGlvbiBNYW5hZ2VyLlwiLFxuICAgICAgICAgICAgICAgIHt3aWRnZXREb21haW46IHRoaXMuc3RhdGUud2lkZ2V0RG9tYWlufSwge2hlbHBJY29uOiAoKSA9PiB3YXJuaW5nVG9vbHRpcH0pXG4gICAgICAgICAgICA6IF90KFwiVXNpbmcgdGhpcyB3aWRnZXQgbWF5IHNoYXJlIGRhdGEgPGhlbHBJY29uIC8+IHdpdGggJSh3aWRnZXREb21haW4pcy5cIixcbiAgICAgICAgICAgICAgICB7d2lkZ2V0RG9tYWluOiB0aGlzLnN0YXRlLndpZGdldERvbWFpbn0sIHtoZWxwSWNvbjogKCkgPT4gd2FybmluZ1Rvb2x0aXB9KTtcblxuICAgICAgICBjb25zdCBlbmNyeXB0aW9uV2FybmluZyA9IHRoaXMucHJvcHMuaXNSb29tRW5jcnlwdGVkID8gX3QoXCJXaWRnZXRzIGRvIG5vdCB1c2UgbWVzc2FnZSBlbmNyeXB0aW9uLlwiKSA6IG51bGw7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZyc+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3JvdyBteF9BcHBQZXJtaXNzaW9uV2FybmluZ19ib2xkZXIgbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge190KFwiV2lkZ2V0IGFkZGVkIGJ5XCIpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ19yb3cnPlxuICAgICAgICAgICAgICAgICAgICB7YXZhdGFyfVxuICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ19ib2xkZXInPntkaXNwbGF5TmFtZX08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz57dXNlcklkfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9BcHBQZXJtaXNzaW9uV2FybmluZ19yb3cgbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfc21hbGxUZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge3dhcm5pbmd9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0FwcFBlcm1pc3Npb25XYXJuaW5nX3JvdyBteF9BcHBQZXJtaXNzaW9uV2FybmluZ19zbWFsbFRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJUaGlzIHdpZGdldCBtYXkgdXNlIGNvb2tpZXMuXCIpfSZuYnNwO3tlbmNyeXB0aW9uV2FybmluZ31cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfQXBwUGVybWlzc2lvbldhcm5pbmdfcm93Jz5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24ga2luZD0ncHJpbWFyeV9zbScgb25DbGljaz17dGhpcy5wcm9wcy5vblBlcm1pc3Npb25HcmFudGVkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtfdChcIkNvbnRpbnVlXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=