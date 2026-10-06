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

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _languageHandler = require("../../../languageHandler");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

/*
Copyright 2017 Vector Creations Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019 The Matrix.org Foundation C.I.C.

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
class RoomAvatarEvent extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onAvatarClick", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const ev = this.props.mxEvent;
      const httpUrl = cli.mxcUrlToHttp(ev.getContent().url);
      const room = cli.getRoom(this.props.mxEvent.getRoomId());
      const text = (0, _languageHandler._t)('%(senderDisplayName)s changed the avatar for %(roomName)s', {
        senderDisplayName: ev.sender && ev.sender.name ? ev.sender.name : ev.getSender(),
        roomName: room ? room.name : ''
      });
      const ImageView = sdk.getComponent("elements.ImageView");
      const params = {
        src: httpUrl,
        name: text
      };

      _Modal.default.createDialog(ImageView, params, "mx_Dialog_lightbox");
    });
  }

  render() {
    const ev = this.props.mxEvent;
    const senderDisplayName = ev.sender && ev.sender.name ? ev.sender.name : ev.getSender();
    const RoomAvatar = sdk.getComponent("avatars.RoomAvatar");

    if (!ev.getContent().url || ev.getContent().url.trim().length === 0) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_TextualEvent"
      }, (0, _languageHandler._t)('%(senderDisplayName)s removed the room avatar.', {
        senderDisplayName
      }));
    }

    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(ev.getRoomId()); // Provide all arguments to RoomAvatar via oobData because the avatar is historic


    const oobData = {
      avatarUrl: ev.getContent().url,
      name: room ? room.name : ""
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomAvatarEvent"
    }, (0, _languageHandler._t)('%(senderDisplayName)s changed the room avatar to <img/>', {
      senderDisplayName: senderDisplayName
    }, {
      'img': () => /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        key: "avatar",
        className: "mx_RoomAvatarEvent_avatar",
        onClick: this.onAvatarClick
      }, /*#__PURE__*/_react.default.createElement(RoomAvatar, {
        width: 14,
        height: 14,
        oobData: oobData
      }))
    }));
  }

}

exports.default = RoomAvatarEvent;
(0, _defineProperty2.default)(RoomAvatarEvent, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1Jvb21BdmF0YXJFdmVudC5qcyJdLCJuYW1lcyI6WyJSb29tQXZhdGFyRXZlbnQiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsImV2IiwicHJvcHMiLCJteEV2ZW50IiwiaHR0cFVybCIsIm14Y1VybFRvSHR0cCIsImdldENvbnRlbnQiLCJ1cmwiLCJyb29tIiwiZ2V0Um9vbSIsImdldFJvb21JZCIsInRleHQiLCJzZW5kZXJEaXNwbGF5TmFtZSIsInNlbmRlciIsIm5hbWUiLCJnZXRTZW5kZXIiLCJyb29tTmFtZSIsIkltYWdlVmlldyIsInNkayIsImdldENvbXBvbmVudCIsInBhcmFtcyIsInNyYyIsIk1vZGFsIiwiY3JlYXRlRGlhbG9nIiwicmVuZGVyIiwiUm9vbUF2YXRhciIsInRyaW0iLCJsZW5ndGgiLCJvb2JEYXRhIiwiYXZhdGFyVXJsIiwib25BdmF0YXJDbGljayIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVZSxNQUFNQSxlQUFOLFNBQThCQyxlQUFNQyxTQUFwQyxDQUE4QztBQUFBO0FBQUE7QUFBQSx5REFNekMsTUFBTTtBQUNsQixZQUFNQyxHQUFHLEdBQUdDLGlDQUFnQkMsR0FBaEIsRUFBWjs7QUFDQSxZQUFNQyxFQUFFLEdBQUcsS0FBS0MsS0FBTCxDQUFXQyxPQUF0QjtBQUNBLFlBQU1DLE9BQU8sR0FBR04sR0FBRyxDQUFDTyxZQUFKLENBQWlCSixFQUFFLENBQUNLLFVBQUgsR0FBZ0JDLEdBQWpDLENBQWhCO0FBRUEsWUFBTUMsSUFBSSxHQUFHVixHQUFHLENBQUNXLE9BQUosQ0FBWSxLQUFLUCxLQUFMLENBQVdDLE9BQVgsQ0FBbUJPLFNBQW5CLEVBQVosQ0FBYjtBQUNBLFlBQU1DLElBQUksR0FBRyx5QkFBRywyREFBSCxFQUFnRTtBQUN6RUMsUUFBQUEsaUJBQWlCLEVBQUVYLEVBQUUsQ0FBQ1ksTUFBSCxJQUFhWixFQUFFLENBQUNZLE1BQUgsQ0FBVUMsSUFBdkIsR0FBOEJiLEVBQUUsQ0FBQ1ksTUFBSCxDQUFVQyxJQUF4QyxHQUErQ2IsRUFBRSxDQUFDYyxTQUFILEVBRE87QUFFekVDLFFBQUFBLFFBQVEsRUFBRVIsSUFBSSxHQUFHQSxJQUFJLENBQUNNLElBQVIsR0FBZTtBQUY0QyxPQUFoRSxDQUFiO0FBS0EsWUFBTUcsU0FBUyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsb0JBQWpCLENBQWxCO0FBQ0EsWUFBTUMsTUFBTSxHQUFHO0FBQ1hDLFFBQUFBLEdBQUcsRUFBRWpCLE9BRE07QUFFWFUsUUFBQUEsSUFBSSxFQUFFSDtBQUZLLE9BQWY7O0FBSUFXLHFCQUFNQyxZQUFOLENBQW1CTixTQUFuQixFQUE4QkcsTUFBOUIsRUFBc0Msb0JBQXRDO0FBQ0gsS0F2QndEO0FBQUE7O0FBeUJ6REksRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTXZCLEVBQUUsR0FBRyxLQUFLQyxLQUFMLENBQVdDLE9BQXRCO0FBQ0EsVUFBTVMsaUJBQWlCLEdBQUdYLEVBQUUsQ0FBQ1ksTUFBSCxJQUFhWixFQUFFLENBQUNZLE1BQUgsQ0FBVUMsSUFBdkIsR0FBOEJiLEVBQUUsQ0FBQ1ksTUFBSCxDQUFVQyxJQUF4QyxHQUErQ2IsRUFBRSxDQUFDYyxTQUFILEVBQXpFO0FBQ0EsVUFBTVUsVUFBVSxHQUFHUCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsb0JBQWpCLENBQW5COztBQUVBLFFBQUksQ0FBQ2xCLEVBQUUsQ0FBQ0ssVUFBSCxHQUFnQkMsR0FBakIsSUFBd0JOLEVBQUUsQ0FBQ0ssVUFBSCxHQUFnQkMsR0FBaEIsQ0FBb0JtQixJQUFwQixHQUEyQkMsTUFBM0IsS0FBc0MsQ0FBbEUsRUFBcUU7QUFDakUsMEJBQ0k7QUFBSyxRQUFBLFNBQVMsRUFBQztBQUFmLFNBQ00seUJBQUcsZ0RBQUgsRUFBcUQ7QUFBQ2YsUUFBQUE7QUFBRCxPQUFyRCxDQUROLENBREo7QUFLSDs7QUFFRCxVQUFNSixJQUFJLEdBQUdULGlDQUFnQkMsR0FBaEIsR0FBc0JTLE9BQXRCLENBQThCUixFQUFFLENBQUNTLFNBQUgsRUFBOUIsQ0FBYixDQWJLLENBY0w7OztBQUNBLFVBQU1rQixPQUFPLEdBQUc7QUFDWkMsTUFBQUEsU0FBUyxFQUFFNUIsRUFBRSxDQUFDSyxVQUFILEdBQWdCQyxHQURmO0FBRVpPLE1BQUFBLElBQUksRUFBRU4sSUFBSSxHQUFHQSxJQUFJLENBQUNNLElBQVIsR0FBZTtBQUZiLEtBQWhCO0FBS0Esd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQ00seUJBQUcseURBQUgsRUFDRTtBQUFFRixNQUFBQSxpQkFBaUIsRUFBRUE7QUFBckIsS0FERixFQUVFO0FBQ0ksYUFBTyxtQkFDSCw2QkFBQyx5QkFBRDtBQUFrQixRQUFBLEdBQUcsRUFBQyxRQUF0QjtBQUErQixRQUFBLFNBQVMsRUFBQywyQkFBekM7QUFDSSxRQUFBLE9BQU8sRUFBRSxLQUFLa0I7QUFEbEIsc0JBRUksNkJBQUMsVUFBRDtBQUFZLFFBQUEsS0FBSyxFQUFFLEVBQW5CO0FBQXVCLFFBQUEsTUFBTSxFQUFFLEVBQS9CO0FBQW1DLFFBQUEsT0FBTyxFQUFFRjtBQUE1QyxRQUZKO0FBRlIsS0FGRixDQUROLENBREo7QUFjSDs7QUEzRHdEOzs7OEJBQXhDakMsZSxlQUNFO0FBQ2Y7QUFDQVEsRUFBQUEsT0FBTyxFQUFFNEIsbUJBQVVDLE1BQVYsQ0FBaUJDO0FBRlgsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBBY2Nlc3NpYmxlQnV0dG9uIGZyb20gJy4uL2VsZW1lbnRzL0FjY2Vzc2libGVCdXR0b24nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tQXZhdGFyRXZlbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgb25BdmF0YXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBldiA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgaHR0cFVybCA9IGNsaS5teGNVcmxUb0h0dHAoZXYuZ2V0Q29udGVudCgpLnVybCk7XG5cbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIGNoYW5nZWQgdGhlIGF2YXRhciBmb3IgJShyb29tTmFtZSlzJywge1xuICAgICAgICAgICAgc2VuZGVyRGlzcGxheU5hbWU6IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCksXG4gICAgICAgICAgICByb29tTmFtZTogcm9vbSA/IHJvb20ubmFtZSA6ICcnLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBJbWFnZVZpZXcgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZWxlbWVudHMuSW1hZ2VWaWV3XCIpO1xuICAgICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgICAgICBzcmM6IGh0dHBVcmwsXG4gICAgICAgICAgICBuYW1lOiB0ZXh0LFxuICAgICAgICB9O1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coSW1hZ2VWaWV3LCBwYXJhbXMsIFwibXhfRGlhbG9nX2xpZ2h0Ym94XCIpO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGV2ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBjb25zdCBzZW5kZXJEaXNwbGF5TmFtZSA9IGV2LnNlbmRlciAmJiBldi5zZW5kZXIubmFtZSA/IGV2LnNlbmRlci5uYW1lIDogZXYuZ2V0U2VuZGVyKCk7XG4gICAgICAgIGNvbnN0IFJvb21BdmF0YXIgPSBzZGsuZ2V0Q29tcG9uZW50KFwiYXZhdGFycy5Sb29tQXZhdGFyXCIpO1xuXG4gICAgICAgIGlmICghZXYuZ2V0Q29udGVudCgpLnVybCB8fCBldi5nZXRDb250ZW50KCkudXJsLnRyaW0oKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UZXh0dWFsRXZlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnJShzZW5kZXJEaXNwbGF5TmFtZSlzIHJlbW92ZWQgdGhlIHJvb20gYXZhdGFyLicsIHtzZW5kZXJEaXNwbGF5TmFtZX0pIH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tID0gTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFJvb20oZXYuZ2V0Um9vbUlkKCkpO1xuICAgICAgICAvLyBQcm92aWRlIGFsbCBhcmd1bWVudHMgdG8gUm9vbUF2YXRhciB2aWEgb29iRGF0YSBiZWNhdXNlIHRoZSBhdmF0YXIgaXMgaGlzdG9yaWNcbiAgICAgICAgY29uc3Qgb29iRGF0YSA9IHtcbiAgICAgICAgICAgIGF2YXRhclVybDogZXYuZ2V0Q29udGVudCgpLnVybCxcbiAgICAgICAgICAgIG5hbWU6IHJvb20gPyByb29tLm5hbWUgOiBcIlwiLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Jvb21BdmF0YXJFdmVudFwiPlxuICAgICAgICAgICAgICAgIHsgX3QoJyUoc2VuZGVyRGlzcGxheU5hbWUpcyBjaGFuZ2VkIHRoZSByb29tIGF2YXRhciB0byA8aW1nLz4nLFxuICAgICAgICAgICAgICAgICAgICB7IHNlbmRlckRpc3BsYXlOYW1lOiBzZW5kZXJEaXNwbGF5TmFtZSB9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnaW1nJzogKCkgPT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBrZXk9XCJhdmF0YXJcIiBjbGFzc05hbWU9XCJteF9Sb29tQXZhdGFyRXZlbnRfYXZhdGFyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkF2YXRhckNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJvb21BdmF0YXIgd2lkdGg9ezE0fSBoZWlnaHQ9ezE0fSBvb2JEYXRhPXtvb2JEYXRhfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj4sXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19