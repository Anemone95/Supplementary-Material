"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _contentRepo = require("matrix-js-sdk/src/content-repo");

var _languageHandler = require("../../../languageHandler");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Pill = _interopRequireDefault(require("../elements/Pill"));

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _BaseAvatar = _interopRequireDefault(require("../avatars/BaseAvatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _HtmlUtils = require("../../../HtmlUtils");

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
class BridgeTile extends _react.default.PureComponent
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
      const avatarUrl = (0, _contentRepo.getHttpUriForMxc)(_MatrixClientPeg.MatrixClientPeg.get().getHomeserverUrl(), protocol.avatar_url, 64, 64, "crop");
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

}

exports.default = BridgeTile;
(0, _defineProperty2.default)(BridgeTile, "propTypes", {
  ev: _propTypes.default.object.isRequired,
  room: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL0JyaWRnZVRpbGUudHN4Il0sIm5hbWVzIjpbIkJyaWRnZVRpbGUiLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJyZW5kZXIiLCJjb250ZW50IiwicHJvcHMiLCJldiIsImdldENvbnRlbnQiLCJjaGFubmVsIiwiaWQiLCJwcm90b2NvbCIsImNvbnNvbGUiLCJ3YXJuIiwiZ2V0SWQiLCJicmlkZ2Vib3QiLCJnZXRTZW5kZXIiLCJuZXR3b3JrIiwicHJvdG9jb2xOYW1lIiwiZGlzcGxheW5hbWUiLCJjaGFubmVsTmFtZSIsImNyZWF0b3IiLCJ1c2VyIiwiUGlsbCIsIlRZUEVfVVNFUl9NRU5USU9OIiwicm9vbSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsImJvdCIsIm5ldHdvcmtJY29uIiwiYXZhdGFyX3VybCIsImF2YXRhclVybCIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImdldEhvbWVzZXJ2ZXJVcmwiLCJuZXR3b3JrSXRlbSIsIm5ldHdvcmtOYW1lIiwibmV0d29ya0xpbmsiLCJleHRlcm5hbF91cmwiLCJjaGFubmVsTGluayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOztBQTNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvRGUsTUFBTUEsVUFBTixTQUF5QkMsZUFBTUM7QUFBL0I7QUFBcUQ7QUFNaEVDLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DO0FBQTBCO0FBQUEsTUFBRyxLQUFLQyxLQUFMLENBQVdDLEVBQVgsQ0FBY0MsVUFBZCxFQUFuQyxDQURLLENBRUw7O0FBQ0EsUUFBSSxDQUFDSCxPQUFPLENB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TCxDQURKLGVBRUk7QUFBRyxNQUFBLFNBQVMsRUFBQztBQUFiLE9BQ0tpQixXQURMLGVBRUk7QUFBTSxNQUFBLFNBQVMsRUFBQztBQUFoQixPQUEyQix5QkFBRyx5QkFBSCxFQUE4QixFQUE5QixFQUFrQztBQUN6REksTUFBQUEsV0FBVyxFQUFFLE1BQU1BO0FBRHNDLEtBQWxDLENBQTNCLENBRkosQ0FGSixlQVFJO0FBQUksTUFBQSxTQUFTLEVBQUM7QUFBZCxPQUNLbEIsT0FETCxPQUNlTyxHQURmLENBUkosQ0FKSSxDQUFSO0FBaUJIOztBQW5HK0Q7Ozs4QkFBL0MzQixVLGVBQ0U7QUFDZk0sRUFBQUEsRUFBRSxFQUFFaUMsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRE47QUFFZmpCLEVBQUFBLElBQUksRUFBRWUsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRlIsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtnZXRIdHRwVXJpRm9yTXhjfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY29udGVudC1yZXBvXCI7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IFBpbGwgZnJvbSBcIi4uL2VsZW1lbnRzL1BpbGxcIjtcbmltcG9ydCB7bWFrZVVzZXJQZXJtYWxpbmt9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCBCYXNlQXZhdGFyIGZyb20gXCIuLi9hdmF0YXJzL0Jhc2VBdmF0YXJcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgeyBpc1VybFBlcm1pdHRlZCB9IGZyb20gJy4uLy4uLy4uL0h0bWxVdGlscyc7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGV2OiBNYXRyaXhFdmVudDtcbiAgICByb29tOiBSb29tO1xufVxuXG4vKipcbiAqIFRoaXMgc2hvdWxkIG1hdGNoIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL21hdHJpeC1kb2MvYmxvYi9ocy9tc2MtYnJpZGdlLWluZi9wcm9wb3NhbHMvMjM0Ni1icmlkZ2UtaW5mby1zdGF0ZS1ldmVudC5tZCNtYnJpZGdlXG4gKi9cbmludGVyZmFjZSBJQnJpZGdlU3RhdGVFdmVudCB7XG4gICAgYnJpZGdlYm90OiBzdHJpbmc7XG4gICAgY3JlYXRvcj86IHN0cmluZztcbiAgICBwcm90b2NvbDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBkaXNwbGF5bmFtZT86IHN0cmluZztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICBhdmF0YXJfdXJsPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGV4dGVybmFsX3VybD86IHN0cmluZztcbiAgICB9O1xuICAgIG5ldHdvcms/OiB7XG4gICAgICAgIGlkOiBzdHJpbmc7XG4gICAgICAgIGRpc3BsYXluYW1lPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGF2YXRhcl91cmw/OiBzdHJpbmc7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgZXh0ZXJuYWxfdXJsPzogc3RyaW5nO1xuICAgIH07XG4gICAgY2hhbm5lbDoge1xuICAgICAgICBpZDogc3RyaW5nO1xuICAgICAgICBkaXNwbGF5bmFtZT86IHN0cmluZztcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNhbWVsY2FzZVxuICAgICAgICBhdmF0YXJfdXJsPzogc3RyaW5nO1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGV4dGVybmFsX3VybD86IHN0cmluZztcbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2VUaWxlIGV4dGVuZHMgUmVhY3QuUHVyZUNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICBldjogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICByb29tOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBjb250ZW50OiBJQnJpZGdlU3RhdGVFdmVudCA9IHRoaXMucHJvcHMuZXYuZ2V0Q29udGVudCgpO1xuICAgICAgICAvLyBWYWxpZGF0ZVxuICAgICAgICBpZiAoIWNvbnRlbnQuY2hhbm5lbD8uaWQgfHwgIWNvbnRlbnQucHJvdG9jb2w/LmlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJyaWRnZSBpbmZvIGV2ZW50ICR7dGhpcy5wcm9wcy5ldi5nZXRJZCgpfSBoYXMgbWlzc2luZyBjb250ZW50LiBUaWxlIHdpbGwgbm90IHJlbmRlcmApO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb250ZW50LmJyaWRnZWJvdCkge1xuICAgICAgICAgICAgLy8gQnJpZGdlYm90IHdhcyBub3QgcmVxdWlyZWQgcHJldmlvdXNseSwgc28gaW4gb3JkZXIgdG8gbm90IGJyZWFrIHJvb21zIHdlIGFyZSBhbGxvd2luZ1xuICAgICAgICAgICAgLy8gdGhlIHNlbmRlciB0byBiZSB1c2VkIGluIHBsYWNlLiBXaGVuIHRoZSBwcm9wb3NhbCBpcyBtZXJnZWQsIHRoaXMgc2hvdWxkIGJlIHJlbW92ZWQuXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYEJyaWRnZSBpbmZvIGV2ZW50ICR7dGhpcy5wcm9wcy5ldi5nZXRJZCgpfSBkb2VzIG5vdCBwcm92aWRlIGEgJ2JyaWRnZWJvdCcga2V5IHdoaWNoYFxuICAgICAgICAgICAgICsgXCJpcyBkZXByZWNhdGVkIGJlaGF2aW91ci4gVXNpbmcgc2VuZGVyIGZvciBub3cuXCIpO1xuICAgICAgICAgICAgY29udGVudC5icmlkZ2Vib3QgPSB0aGlzLnByb3BzLmV2LmdldFNlbmRlcigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgY2hhbm5lbCwgbmV0d29yaywgcHJvdG9jb2wgfSA9IGNvbnRlbnQ7XG4gICAgICAgIGNvbnN0IHByb3RvY29sTmFtZSA9IHByb3RvY29sLmRpc3BsYXluYW1lIHx8IHByb3RvY29sLmlkO1xuICAgICAgICBjb25zdCBjaGFubmVsTmFtZSA9IGNoYW5uZWwuZGlzcGxheW5hbWUgfHwgY2hhbm5lbC5pZDtcblxuICAgICAgICBsZXQgY3JlYXRvciA9IG51bGw7XG4gICAgICAgIGlmIChjb250ZW50LmNyZWF0b3IpIHtcbiAgICAgICAgICAgIGNyZWF0b3IgPSA8bGk+e190KFwiVGhpcyBicmlkZ2Ugd2FzIHByb3Zpc2lvbmVkIGJ5IDx1c2VyIC8+LlwiLCB7fSwge1xuICAgICAgICAgICAgICAgIHVzZXI6ICgpID0+IDxQaWxsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9e1BpbGwuVFlQRV9VU0VSX01FTlRJT059XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhjb250ZW50LmNyZWF0b3IpfVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgLz4sXG4gICAgICAgICAgICB9KX08L2xpPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJvdCA9IDxsaT57X3QoXCJUaGlzIGJyaWRnZSBpcyBtYW5hZ2VkIGJ5IDx1c2VyIC8+LlwiLCB7fSwge1xuICAgICAgICAgICAgdXNlcjogKCkgPT4gPFBpbGxcbiAgICAgICAgICAgICAgICB0eXBlPXtQaWxsLlRZUEVfVVNFUl9NRU5USU9OfVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICB1cmw9e21ha2VVc2VyUGVybWFsaW5rKGNvbnRlbnQuYnJpZGdlYm90KX1cbiAgICAgICAgICAgICAgICBzaG91bGRTaG93UGlsbEF2YXRhcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIil9XG4gICAgICAgICAgICAvPixcbiAgICAgICAgfSl9PC9saT47XG5cbiAgICAgICAgbGV0IG5ldHdvcmtJY29uO1xuXG4gICAgICAgIGlmIChwcm90b2NvbC5hdmF0YXJfdXJsKSB7XG4gICAgICAgICAgICBjb25zdCBhdmF0YXJVcmwgPSBnZXRIdHRwVXJpRm9yTXhjKFxuICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRIb21lc2VydmVyVXJsKCksXG4gICAgICAgICAgICAgICAgcHJvdG9jb2wuYXZhdGFyX3VybCwgNjQsIDY0LCBcImNyb3BcIixcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIG5ldHdvcmtJY29uID0gPEJhc2VBdmF0YXIgY2xhc3NOYW1lPVwicHJvdG9jb2wtaWNvblwiXG4gICAgICAgICAgICAgICAgd2lkdGg9ezQ4fVxuICAgICAgICAgICAgICAgIGhlaWdodD17NDh9XG4gICAgICAgICAgICAgICAgcmVzaXplTWV0aG9kPSdjcm9wJ1xuICAgICAgICAgICAgICAgIG5hbWU9eyBwcm90b2NvbE5hbWUgfVxuICAgICAgICAgICAgICAgIGlkTmFtZT17IHByb3RvY29sTmFtZSB9XG4gICAgICAgICAgICAgICAgdXJsPXsgYXZhdGFyVXJsIH1cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV0d29ya0ljb24gPSA8ZGl2IGNsYXNzTmFtZT1cIm5vUHJvdG9jb2xJY29uXCI+PC9kaXY+O1xuICAgICAgICB9XG4gICAgICAgIGxldCBuZXR3b3JrSXRlbSA9IG51bGw7XG4gICAgICAgIGlmIChuZXR3b3JrKSB7XG4gICAgICAgICAgICBjb25zdCBuZXR3b3JrTmFtZSA9IG5ldHdvcmsuZGlzcGxheW5hbWUgfHwgbmV0d29yay5pZDtcbiAgICAgICAgICAgIGxldCBuZXR3b3JrTGluayA9IDxzcGFuPntuZXR3b3JrTmFtZX08L3NwYW4+O1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBuZXR3b3JrLmV4dGVybmFsX3VybCA9PT0gXCJzdHJpbmdcIiAmJiBpc1VybFBlcm1pdHRlZChuZXR3b3JrLmV4dGVybmFsX3VybCkpIHtcbiAgICAgICAgICAgICAgICBuZXR3b3JrTGluayA9IDxhIGhyZWY9e25ldHdvcmsuZXh0ZXJuYWxfdXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e25ldHdvcmtOYW1lfTwvYT5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ldHdvcmtJdGVtID0gX3QoXCJXb3Jrc3BhY2U6IDxuZXR3b3JrTGluay8+XCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgbmV0d29ya0xpbms6ICgpID0+IG5ldHdvcmtMaW5rLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY2hhbm5lbExpbmsgPSA8c3Bhbj57Y2hhbm5lbE5hbWV9PC9zcGFuPjtcbiAgICAgICAgaWYgKHR5cGVvZiBjaGFubmVsLmV4dGVybmFsX3VybCA9PT0gXCJzdHJpbmdcIiAmJiBpc1VybFBlcm1pdHRlZChjaGFubmVsLmV4dGVybmFsX3VybCkpIHtcbiAgICAgICAgICAgIGNoYW5uZWxMaW5rID0gPGEgaHJlZj17Y2hhbm5lbC5leHRlcm5hbF91cmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57Y2hhbm5lbE5hbWV9PC9hPlxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaWQgPSB0aGlzLnByb3BzLmV2LmdldElkKCk7XG4gICAgICAgIHJldHVybiAoPGxpIGtleT17aWR9PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2x1bW4taWNvblwiPlxuICAgICAgICAgICAgICAgIHtuZXR3b3JrSWNvbn1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2x1bW4tZGF0YVwiPlxuICAgICAgICAgICAgICAgIDxoMz57cHJvdG9jb2xOYW1lfTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwid29ya3NwYWNlLWNoYW5uZWwtZGV0YWlsc1wiPlxuICAgICAgICAgICAgICAgICAgICB7bmV0d29ya0l0ZW19XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImNoYW5uZWxcIj57X3QoXCJDaGFubmVsOiA8Y2hhbm5lbExpbmsvPlwiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbExpbms6ICgpID0+IGNoYW5uZWxMaW5rLFxuICAgICAgICAgICAgICAgICAgICB9KX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJtZXRhZGF0YVwiPlxuICAgICAgICAgICAgICAgICAgICB7Y3JlYXRvcn0ge2JvdH1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbGk+KTtcbiAgICB9XG59XG4iXX0=