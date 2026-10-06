"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _Pill = _interopRequireDefault(require("../elements/Pill"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _HtmlUtils = require("../../../HtmlUtils");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _Media = require("../../../customisations/Media");

var _dec, _class, _class2, _temp;

let BridgeTile = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.BridgeTile"), _dec(_class = (_temp = _class2 = class BridgeTile extends _react.default.PureComponent
/*:: <IProps>*/
{
  render() {
    const content
    /*: IBridgeStateEvent*/
    = this.props.ev.getContent(); // Validate

    if (!content.channel?.id || !content.protocol?.id) {
      console.warn(`Bridge info event ${this.props.ev.getId()} has missing content. Tile will not render`);
      return null;
    }

    if (!content.bridgebot) {
      // Bridgebot was not required previously, so in order to not break rooms we are allowing
      // the sender to be used in place. When the proposal is merged, this should be removed.
      console.warn(`Bridge info event ${this.props.ev.getId()} does not provide a 'bridgebot' key which` + "is deprecated behaviour. Using sender for now.");
      content.bridgebot = this.props.ev.getSender();
    }

    const {
      channel,
      network,
      protocol
    } = content;
    const protocolName = protocol.displayname || protocol.id;
    const channelName = channel.displayname || channel.id;
    let creator = null;

    if (content.creator) {
      creator = /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("This bridge was provisioned by <user />.", {}, {
        user: () => /*#__PURE__*/_react.default.createElement(_Pill.default, {
          type: _Pill.default.TYPE_USER_MENTION,
          room: this.props.room,
          url: (0, _Permalinks.makeUserPermalink)(content.creator),
          shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
        })
      }));
    }

    const bot = /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("This bridge is managed by <user />.", {}, {
      user: () => /*#__PURE__*/_react.default.createElement(_Pill.default, {
        type: _Pill.default.TYPE_USER_MENTION,
        room: this.props.room,
        url: (0, _Permalinks.makeUserPermalink)(content.bridgebot),
        shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
      })
    }));

    let networkIcon;

    if (protocol.avatar_url) {
      const avatarUrl = (0, _Media.mediaFromMxc)(protocol.avatar_url).getSquareThumbnailHttp(64);
      networkIcon = /*#__PURE__*/_react.default.createElement(_BaseAvatar.default, {
        className: "protocol-icon",
        width: 48,
        height: 48,
        resizeMethod: "crop",
        name: protocolName,
        idName: protocolName,
        url: avatarUrl
      });
    } else {
      networkIcon = /*#__PURE__*/_react.default.createElement("div", {
        className: "noProtocolIcon"
      });
    }

    let networkItem = null;

    if (network) {
      const networkName = network.displayname || network.id;

      let networkLink = /*#__PURE__*/_react.default.createElement("span", null, networkName);

      if (typeof network.external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(network.external_url)) {
        networkLink = /*#__PURE__*/_react.default.createElement("a", {
          href: network.external_url,
          target: "_blank",
          rel: "noreferrer noopener"
        }, networkName);
      }

      networkItem = (0, _languageHandler._t)("Workspace: <networkLink/>", {}, {
        networkLink: () => networkLink
      });
    }

    let channelLink = /*#__PURE__*/_react.default.createElement("span", null, channelName);

    if (typeof channel.external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(channel.external_url)) {
      channelLink = /*#__PURE__*/_react.default.createElement("a", {
        href: channel.external_url,
        target: "_blank",
        rel: "noreferrer noopener"
      }, channelName);
    }

    const id = this.props.ev.getId();
    return /*#__PURE__*/_react.default.createElement("li", {
      key: id
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "column-icon"
    }, networkIcon), /*#__PURE__*/_react.default.createElement("div", {
      className: "column-data"
    }, /*#__PURE__*/_react.default.createElement("h3", null, protocolName), /*#__PURE__*/_react.default.createElement("p", {
      className: "workspace-channel-details"
    }, networkItem, /*#__PURE__*/_react.default.createElement("span", {
      className: "channel"
    }, (0, _languageHandler._t)("Channel: <channelLink/>", {}, {
      channelLink: () => channelLink
    }))), /*#__PURE__*/_react.default.createElement("ul", {
      className: "metadata"
    }, creator, " ", bot)));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  ev: _propTypes.default.object.isRequired,
  room: _propTypes.default.object.isRequired
}), _temp)) || _class);
exports.default = BridgeTile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0JyaWRnZVRpbGUudHN4Il0sIm5hbWVzIjpbIkJyaWRnZVRpbGUiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJyZW5kZXIiLCJjb250ZW50IiwicHJvcHMiLCJldiIsImdldENvbnRlbnQiLCJjaGFubmVsIiwiaWQiLCJwcm90b2NvbCIsImNvbnNvbGUiLCJ3YXJuIiwiZ2V0SWQiLCJicmlkZ2Vib3QiLCJnZXRTZW5kZXIiLCJuZXR3b3JrIiwicHJvdG9jb2xOYW1lIiwiZGlzcGxheW5hbWUiLCJjaGFubmVsTmFtZSIsImNyZWF0b3IiLCJ1c2VyIiwiUGlsbCIsIlRZUEVfVVNFUl9NRU5USU9OIiwicm9vbSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImJvdCIsIm5ldHdvcmtJY29uIiwiYXZhdGFyX3VybCIsImF2YXRhclVybCIsImdldFNxdWFyZVRodW1ibmFpbEh0dHAiLCJuZXR3b3JrSXRlbSIsIm5ldHdvcmtOYW1lIiwibmV0d29ya0xpbmsiLCJleHRlcm5hbF91cmwiLCJjaGFubmVsTGluayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQUNBOztBQUNBOzs7O0lBd0NxQkEsVSxXQURwQixnREFBcUIsMkJBQXJCLEMsbUNBQUQsTUFDcUJBLFVBRHJCLFNBQ3dDQyxlQUFNQztBQUQ5QztBQUNvRTtBQU1oRUMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUM7QUFBMEI7QUFBQSxNQUFHLEtBQUtDLEtBQUwsQ0FBV0MsRUFBWCxDQUFjQyxVQUFkLEVBQW5DLENBREssQ0FFTDs7QUFDQSxRQUFJLENBQUNILE9BQU8sQ0FBQ0ksT0FBUixFQUFpQkMsRUFBbEIsSUFBd0IsQ0FBQ0wsT0FBTyxDQUFDTSxRQUFSLEVBQWtCRCxF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OEIsRUFBOUIsRUFBa0M7QUFDekRJLE1BQUFBLFdBQVcsRUFBRSxNQUFNQTtBQURzQyxLQUFsQyxDQUEzQixDQUZKLENBRkosZUFRSTtBQUFJLE1BQUEsU0FBUyxFQUFDO0FBQWQsT0FDS2hCLE9BREwsT0FDZU8sR0FEZixDQVJKLENBSkksQ0FBUjtBQWlCSDs7QUFoRytELEMsc0RBQzdDO0FBQ2ZyQixFQUFBQSxFQUFFLEVBQUUrQixtQkFBVUMsTUFBVixDQUFpQkMsVUFETjtBQUVmZixFQUFBQSxJQUFJLEVBQUVhLG1CQUFVQyxNQUFWLENBQWlCQztBQUZSLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCBQaWxsIGZyb20gXCIuLi9lbGVtZW50cy9QaWxsXCI7XG5pbXBvcnQge21ha2VVc2VyUGVybWFsaW5rfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgQmFzZUF2YXRhciBmcm9tIFwiLi4vYXZhdGFycy9CYXNlQXZhdGFyXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtNYXRyaXhFdmVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHsgaXNVcmxQZXJtaXR0ZWQgfSBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5pbXBvcnQge21lZGlhRnJvbU14Y30gZnJvbSBcIi4uLy4uLy4uL2N1c3RvbWlzYXRpb25zL01lZGlhXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGV2OiBNYXRyaXhFdmVudDtcbiAgICByb29tOiBSb29tO1xufVxuXG4vKipcbiAqIFRoaXMgc2hvdWxkIG1hdGNoIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvYmxvYi9ocy9tc2MtYnJpZGdlLWluZi9wcm9wb3NhbHMvMjM0Ni1icmlkZ2UtaW5mby1zdGF0ZS1ldmVudC5tZCNtYnJpZGdlXG4gKi9cbmludGVyZmFjZSBJQnJpZGdlU3RhdGVFdmVudCB7XG4gICAgYnJpZGdlYm90OiBzdHJpbmc7XG4gICAgY3JlYXRvcj86IHN0cmluZztcbiAgICBwcm90b2NvbDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBkaXNwbGF5bmFtZT86IHN0cmluZztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICBhdmF0YXJfdXJsPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGV4dGVybmFsX3VybD86IHN0cmluZztcbiAgICB9O1xuICAgIG5ldHdvcms/OiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIGRpc3BsYXluYW1lPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGF2YXRhcl91cmw/OiBzdHJpbmc7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgZXh0ZXJuYWxfdXJsPzogc3RyaW5nO1xuICAgIH07XG4gICAgY2hhbm5lbDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBkaXNwbGF5bmFtZT86IHN0cmluZztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICBhdmF0YXJfdXJsPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGV4dGVybmFsX3VybD86IHN0cmluZztcbiAgICB9O1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy5CcmlkZ2VUaWxlXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2VUaWxlIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBldjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICByb29tOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50OiBJQnJpZGdlU3RhdGVFdmVudCA9IHRoaXMucHJvcHMuZXYuZ2V0Q29udGVudCgpO1xuICAgICAgICAvLyBWYWxpZGF0ZVxuICAgICAgICBpZiAoIWNvbnRlbnQuY2hhbm5lbD8uaWQgfHwgIWNvbnRlbnQucHJvdG9jb2w/LmlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJyaWRnZSBpbmZvIGV2ZW50ICR7dGhpcy5wcm9wcy5ldi5nZXRJZCgpfSBoYXMgbWlzc2luZyBjb250ZW50LiBUaWxlIHdpbGwgbm90IHJlbmRlcmApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb250ZW50LmJyaWRnZWJvdCkge1xuICAgICAgICAgICAgLy8gQnJpZGdlYm90IHdhcyBub3QgcmVxdWlyZWQgcHJldmlvdXNseSwgc28gaW4gb3JkZXIgdG8gbm90IGJyZWFrIHJvb21zIHdlIGFyZSBhbGxvd2luZ1xuICAgICAgICAgICAgLy8gdGhlIHNlbmRlciB0byBiZSB1c2VkIGluIHBsYWNlLiBXaGVuIHRoZSBwcm9wb3NhbCBpcyBtZXJnZWQsIHRoaXMgc2hvdWxkIGJlIHJlbW92ZWQuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJyaWRnZSBpbmZvIGV2ZW50ICR7dGhpcy5wcm9wcy5ldi5nZXRJZCgpfSBkb2VzIG5vdCBwcm92aWRlIGEgJ2JyaWRnZWJvdCcga2V5IHdoaWNoYFxuICAgICAgICAgICAgICsgXCJpcyBkZXByZWNhdGVkIGJlaGF2aW91ci4gVXNpbmcgc2VuZGVyIGZvciBub3cuXCIpO1xuICAgICAgICAgICAgY29udGVudC5icmlkZ2Vib3QgPSB0aGlzLnByb3BzLmV2LmdldFNlbmRlcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgY2hhbm5lbCwgbmV0d29yaywgcHJvdG9jb2wgfSA9IGNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHByb3RvY29sTmFtZSA9IHByb3RvY29sLmRpc3BsYXluYW1lIHx8IHByb3RvY29sLmlkO1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZSA9IGNoYW5uZWwuZGlzcGxheW5hbWUgfHwgY2hhbm5lbC5pZDtcblxuICAgICAgICBsZXQgY3JlYXRvciA9IG51bGw7XG4gICAgICAgIGlmIChjb250ZW50LmNyZWF0b3IpIHtcbiAgICAgICAgICAgIGNyZWF0b3IgPSA8bGk+e190KFwiVGhpcyBicmlkZ2Ugd2FzIHByb3Zpc2lvbmVkIGJ5IDx1c2VyIC8+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIHVzZXI6ICgpID0+IDxQaWxsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9e1BpbGwuVFlQRV9VU0VSX01FTlRJT059XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhjb250ZW50LmNyZWF0b3IpfVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICB9KX08L2xpPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvdCA9IDxsaT57X3QoXCJUaGlzIGJyaWRnZSBpcyBtYW5hZ2VkIGJ5IDx1c2VyIC8+LlwiLCB7fSwge1xuICAgICAgICAgICAgdXNlcjogKCkgPT4gPFBpbGxcbiAgICAgICAgICAgICAgICB0eXBlPXtQaWxsLlRZUEVfVVNFUl9NRU5USU9OfVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICB1cmw9e21ha2VVc2VyUGVybWFsaW5rKGNvbnRlbnQuYnJpZGdlYm90KX1cbiAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAvPixcbiAgICAgICAgfSl9PC9saT47XG5cbiAgICAgICAgbGV0IG5ldHdvcmtJY29uO1xuXG4gICAgICAgIGlmIChwcm90b2NvbC5hdmF0YXJfdXJsKSB7XG4gICAgICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBtZWRpYUZyb21NeGMocHJvdG9jb2wuYXZhdGFyX3VybCkuZ2V0U3F1YXJlVGh1bWJuYWlsSHR0cCg2NCk7XG5cbiAgICAgICAgICAgIG5ldHdvcmtJY29uID0gPEJhc2VBdmF0YXIgY2xhc3NOYW1lPVwicHJvdG9jb2wtaWNvblwiXG4gICAgICAgICAgICAgICAgd2lkdGg9ezQ4fVxuICAgICAgICAgICAgICAgIGhlaWdodD17NDh9XG4gICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPSdjcm9wJ1xuICAgICAgICAgICAgICAgIG5hbWU9eyBwcm90b2NvbE5hbWUgfVxuICAgICAgICAgICAgICAgIGlkTmFtZT17IHByb3RvY29sTmFtZSB9XG4gICAgICAgICAgICAgICAgdXJsPXsgYXZhdGFyVXJsIH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV0d29ya0ljb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm5vUHJvdG9jb2xJY29uXCI+PC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXR3b3JrSXRlbSA9IG51bGw7XG4gICAgICAgIGlmIChuZXR3b3JrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrTmFtZSA9IG5ldHdvcmsuZGlzcGxheW5hbWUgfHwgbmV0d29yay5pZDtcbiAgICAgICAgICAgIGxldCBuZXR3b3JrTGluayA9IDxzcGFuPntuZXR3b3JrTmFtZX08L3NwYW4+O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXR3b3JrLmV4dGVybmFsX3VybCA9PT0gXCJzdHJpbmdcIiAmJiBpc1VybFBlcm1pdHRlZChuZXR3b3JrLmV4dGVybmFsX3VybCkpIHtcbiAgICAgICAgICAgICAgICBuZXR3b3JrTGluayA9IDxhIGhyZWY9e25ldHdvcmsuZXh0ZXJuYWxfdXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e25ldHdvcmtOYW1lfTwvYT5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ldHdvcmtJdGVtID0gX3QoXCJXb3Jrc3BhY2U6IDxuZXR3b3JrTGluay8+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgbmV0d29ya0xpbms6ICgpID0+IG5ldHdvcmtMaW5rLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbm5lbExpbmsgPSA8c3Bhbj57Y2hhbm5lbE5hbWV9PC9zcGFuPjtcbiAgICAgICAgaWYgKHR5cGVvZiBjaGFubmVsLmV4dGVybmFsX3VybCA9PT0gXCJzdHJpbmdcIiAmJiBpc1VybFBlcm1pdHRlZChjaGFubmVsLmV4dGVybmFsX3VybCkpIHtcbiAgICAgICAgICAgIGNoYW5uZWxMaW5rID0gPGEgaHJlZj17Y2hhbm5lbC5leHRlcm5hbF91cmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57Y2hhbm5lbE5hbWV9PC9hPlxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLnByb3BzLmV2LmdldElkKCk7XG4gICAgICAgIHJldHVybiAoPGxpIGtleT17aWR9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2x1bW4taWNvblwiPlxuICAgICAgICAgICAgICAgIHtuZXR3b3JrSWNvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2x1bW4tZGF0YVwiPlxuICAgICAgICAgICAgICAgIDxoMz57cHJvdG9jb2xOYW1lfTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid29ya3NwYWNlLWNoYW5uZWwtZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICB7bmV0d29ya0l0ZW19XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNoYW5uZWxcIj57X3QoXCJDaGFubmVsOiA8Y2hhbm5lbExpbmsvPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbExpbms6ICgpID0+IGNoYW5uZWxMaW5rLFxuICAgICAgICAgICAgICAgICAgICB9KX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJtZXRhZGF0YVwiPlxuICAgICAgICAgICAgICAgICAgICB7Y3JlYXRvcn0ge2JvdH1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+KTtcbiAgICB9XG59XG4iXX0=