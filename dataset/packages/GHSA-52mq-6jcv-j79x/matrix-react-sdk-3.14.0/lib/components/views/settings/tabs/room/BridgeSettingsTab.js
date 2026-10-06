"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var _BridgeTile = _interopRequireDefault(require("../../BridgeTile"));

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const BRIDGE_EVENT_TYPES = ["uk.half-shot.bridge" // m.bridge
];
const BRIDGES_LINK = "https://matrix.org/bridges/";

class BridgeSettingsTab extends _react.default.Component
/*:: <IProps>*/
{
  renderBridgeCard(event
  /*: MatrixEvent*/
  , room
  /*: Room*/
  ) {
    const content = event.getContent();

    if (!content || !content.channel || !content.protocol) {
      return null;
    }

    return /*#__PURE__*/_react.default.createElement(_BridgeTile.default, {
      key: event.getId(),
      room: room,
      ev: event
    });
  }

  static getBridgeStateEvents(roomId
  /*: string*/
  ) {
    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const roomState = client.getRoom(roomId).currentState;
    return BRIDGE_EVENT_TYPES.map(typeName => {
      const events = roomState.events.get(typeName);
      return events ? Array.from(events.values()) : [];
    }).flat(1);
  }

  render() {
    // This settings tab will only be invoked if the following function returns more
    // than 0 events, so no validation is needed at this stage.
    const bridgeEvents = BridgeSettingsTab.getBridgeStateEvents(this.props.roomId);

    const client = _MatrixClientPeg.MatrixClientPeg.get();

    const room = client.getRoom(this.props.roomId);
    let content
    /*: JSX.Element*/
    ;

    if (bridgeEvents.length > 0) {
      content = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This room is bridging messages to the following platforms. " + "<a>Learn more.</a>", {}, {
        // TODO: We don't have this link yet: this will prevent the translators
        // having to re-translate the string when we do.
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: BRIDGES_LINK,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      })), /*#__PURE__*/_react.default.createElement("ul", {
        className: "mx_RoomSettingsDialog_BridgeList"
      }, bridgeEvents.map(event => this.renderBridgeCard(event, room))));
    } else {
      content = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("This room isn’t bridging messages to any platforms. " + "<a>Learn more.</a>", {}, {
        // TODO: We don't have this link yet: this will prevent the translators
        // having to re-translate the string when we do.
        a: sub => /*#__PURE__*/_react.default.createElement("a", {
          href: BRIDGES_LINK,
          target: "_blank",
          rel: "noreferrer noopener"
        }, sub)
      }));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Bridges")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section mx_SettingsTab_subsectionText"
    }, content));
  }

}

exports.default = BridgeSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9CcmlkZ2VTZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOlsiQlJJREdFX0VWRU5UX1RZUEVTIiwiQlJJREdFU19MSU5LIiwiQnJpZGdlU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJlbmRlckJyaWRnZUNhcmQiLCJldmVudCIsInJvb20iLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImNoYW5uZWwiLCJwcm90b2NvbCIsImdldElkIiwiZ2V0QnJpZGdlU3RhdGVFdmVudHMiLCJyb29tSWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tU3RhdGUiLCJnZXRSb29tIiwiY3VycmVudFN0YXRlIiwibWFwIiwidHlwZU5hbWUiLCJldmVudHMiLCJBcnJheSIsImZyb20iLCJ2YWx1ZXMiLCJmbGF0IiwicmVuZGVyIiwiYnJpZGdlRXZlbnRzIiwicHJvcHMiLCJsZW5ndGgiLCJhIiwic3ViIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVVBLE1BQU1BLGtCQUFrQixHQUFHLENBQ3ZCLHFCQUR1QixDQUV2QjtBQUZ1QixDQUEzQjtBQUtBLE1BQU1DLFlBQVksR0FBRyw2QkFBckI7O0FBTWUsTUFBTUMsaUJBQU4sU0FBZ0NDLGVBQU1DO0FBQXRDO0FBQXdEO0FBQzNEQyxFQUFBQSxnQkFBUixDQUF5QkM7QUFBekI7QUFBQSxJQUE2Q0M7QUFBN0M7QUFBQSxJQUF5RDtBQUNyRCxVQUFNQyxPQUFPLEdBQUdGLEtBQUssQ0FBQ0csVUFBTixFQUFoQjs7QUFDQSxRQUFJLENBQUNELE9BQUQsSUFBWSxDQUFDQSxPQUFPLENBQUNFLE9BQXJCLElBQWdDLENBQUNGLE9BQU8sQ0FBQ0csUUFBN0MsRUFBdUQ7QUFDbkQsYUFBTyxJQUFQO0FBQ0g7O0FBQ0Qsd0JBQU8sNkJBQUMsbUJBQUQ7QUFBWSxNQUFBLEdBQUcsRUFBRUwsS0FBSyxDQUFDTSxLQUFOLEVBQWpCO0FBQWdDLE1BQUEsSUFBSSxFQUFFTCxJQUF0QztBQUE0QyxNQUFBLEVBQUUsRUFBRUQ7QUFBaEQsTUFBUDtBQUNIOztBQUVELFNBQU9PLG9CQUFQLENBQTRCQztBQUE1QjtBQUFBLElBQTRDO0FBQ3hDLFVBQU1DLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFVBQU1DLFNBQVMsR0FBR0gsTUFBTSxDQUFDSSxPQUFQLENBQWVMLE1BQWYsRUFBdUJNLFlBQXpDO0FBRUEsV0FBT3BCLGtCQUFrQixDQUFDcUIsR0FBbkIsQ0FBdUJDLFFBQVEsSUFBSTtBQUN0QyxZQUFNQyxNQUFNLEdBQUdMLFNBQVMsQ0FBQ0ssTUFBVixDQUFpQk4sR0FBakIsQ0FBcUJLLFFBQXJCLENBQWY7QUFDQSxhQUFPQyxNQUFNLEdBQUdDLEtBQUssQ0FBQ0MsSUFBTixDQUFXRixNQUFNLENBQUNHLE1BQVAsRUFBWCxDQUFILEdBQWlDLEVBQTlDO0FBQ0gsS0FITSxFQUdKQyxJQUhJLENBR0MsQ0FIRCxDQUFQO0FBSUg7O0FBRURDLEVBQUFBLE1BQU0sR0FBRztBQUNMO0FBQ0E7QUFDQSxVQUFNQyxZQUFZLEdBQUczQixpQkFBaUIsQ0FBQ1csb0JBQWxCLENBQXVDLEtBQUtpQixLQUFMLENBQVdoQixNQUFsRCxDQUFyQjs7QUFDQSxVQUFNQyxNQUFNLEdBQUdDLGlDQUFnQkMsR0FBaEIsRUFBZjs7QUFDQSxVQUFNVixJQUFJLEdBQUdRLE1BQU0sQ0FBQ0ksT0FBUCxDQUFlLEtBQUtXLEtBQUwsQ0FBV2hCLE1BQTFCLENBQWI7QUFFQSxRQUFJTjtBQUFvQjtBQUF4Qjs7QUFDQSxRQUFJcUIsWUFBWSxDQUFDRSxNQUFiLEdBQXNCLENBQTFCLEVBQTZCO0FBQ3pCdkIsTUFBQUEsT0FBTyxnQkFBRyx1REFDTix3Q0FBSSx5QkFDQSxnRUFDQSxvQkFGQSxFQUVzQixFQUZ0QixFQUdBO0FBQ0k7QUFDQTtBQUNBd0IsUUFBQUEsQ0FBQyxFQUFFQyxHQUFHLGlCQUFJO0FBQUcsVUFBQSxJQUFJLEVBQUVoQyxZQUFUO0FBQXVCLFVBQUEsTUFBTSxFQUFDLFFBQTlCO0FBQXVDLFVBQUEsR0FBRyxFQUFDO0FBQTNDLFdBQWtFZ0MsR0FBbEU7QUFIZCxPQUhBLENBQUosQ0FETSxlQVVOO0FBQUksUUFBQSxTQUFTLEVBQUM7QUFBZCxTQUNNSixZQUFZLENBQUNSLEdBQWIsQ0FBa0JmLEtBQUQsSUFBVyxLQUFLRCxnQkFBTCxDQUFzQkMsS0FBdEIsRUFBNkJDLElBQTdCLENBQTVCLENBRE4sQ0FWTSxDQUFWO0FBY0gsS0FmRCxNQWVPO0FBQ0hDLE1BQUFBLE9BQU8sZ0JBQUcsd0NBQUkseUJBQ1YseURBQ0Esb0JBRlUsRUFFWSxFQUZaLEVBR1Y7QUFDSTtBQUNBO0FBQ0F3QixRQUFBQSxDQUFDLEVBQUVDLEdBQUcsaUJBQUk7QUFBRyxVQUFBLElBQUksRUFBRWhDLFlBQVQ7QUFBdUIsVUFBQSxNQUFNLEVBQUMsUUFBOUI7QUFBdUMsVUFBQSxHQUFHLEVBQUM7QUFBM0MsV0FBa0VnQyxHQUFsRTtBQUhkLE9BSFUsQ0FBSixDQUFWO0FBU0g7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5Qyx5QkFBRyxTQUFILENBQXpDLENBREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDS3pCLE9BREwsQ0FGSixDQURKO0FBUUg7O0FBOURrRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7Um9vbX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50XCI7XG5cbmltcG9ydCB7X3R9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXJcIjtcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgQnJpZGdlVGlsZSBmcm9tIFwiLi4vLi4vQnJpZGdlVGlsZVwiO1xuXG5jb25zdCBCUklER0VfRVZFTlRfVFlQRVMgPSBbXG4gICAgXCJ1ay5oYWxmLXNob3QuYnJpZGdlXCIsXG4gICAgLy8gbS5icmlkZ2Vcbl07XG5cbmNvbnN0IEJSSURHRVNfTElOSyA9IFwiaHR0cHM6Ly9tYXRyaXgub3JnL2JyaWRnZXMvXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcmlkZ2VTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHM+IHtcbiAgICBwcml2YXRlIHJlbmRlckJyaWRnZUNhcmQoZXZlbnQ6IE1hdHJpeEV2ZW50LCByb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBldmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIGlmICghY29udGVudCB8fCAhY29udGVudC5jaGFubmVsIHx8ICFjb250ZW50LnByb3RvY29sKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPEJyaWRnZVRpbGUga2V5PXtldmVudC5nZXRJZCgpfSByb29tPXtyb29tfSBldj17ZXZlbnR9IC8+O1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRCcmlkZ2VTdGF0ZUV2ZW50cyhyb29tSWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb21TdGF0ZSA9IGNsaWVudC5nZXRSb29tKHJvb21JZCkuY3VycmVudFN0YXRlO1xuXG4gICAgICAgIHJldHVybiBCUklER0VfRVZFTlRfVFlQRVMubWFwKHR5cGVOYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50cyA9IHJvb21TdGF0ZS5ldmVudHMuZ2V0KHR5cGVOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBldmVudHMgPyBBcnJheS5mcm9tKGV2ZW50cy52YWx1ZXMoKSkgOiBbXTtcbiAgICAgICAgfSkuZmxhdCgxKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIFRoaXMgc2V0dGluZ3MgdGFiIHdpbGwgb25seSBiZSBpbnZva2VkIGlmIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb24gcmV0dXJucyBtb3JlXG4gICAgICAgIC8vIHRoYW4gMCBldmVudHMsIHNvIG5vIHZhbGlkYXRpb24gaXMgbmVlZGVkIGF0IHRoaXMgc3RhZ2UuXG4gICAgICAgIGNvbnN0IGJyaWRnZUV2ZW50cyA9IEJyaWRnZVNldHRpbmdzVGFiLmdldEJyaWRnZVN0YXRlRXZlbnRzKHRoaXMucHJvcHMucm9vbUlkKTtcbiAgICAgICAgY29uc3QgY2xpZW50ID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpZW50LmdldFJvb20odGhpcy5wcm9wcy5yb29tSWQpO1xuXG4gICAgICAgIGxldCBjb250ZW50OiBKU1guRWxlbWVudDtcbiAgICAgICAgaWYgKGJyaWRnZUV2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb250ZW50ID0gPGRpdj5cbiAgICAgICAgICAgICAgICA8cD57X3QoXG4gICAgICAgICAgICAgICAgICAgIFwiVGhpcyByb29tIGlzIGJyaWRnaW5nIG1lc3NhZ2VzIHRvIHRoZSBmb2xsb3dpbmcgcGxhdGZvcm1zLiBcIiArXG4gICAgICAgICAgICAgICAgICAgIFwiPGE+TGVhcm4gbW9yZS48L2E+XCIsIHt9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBXZSBkb24ndCBoYXZlIHRoaXMgbGluayB5ZXQ6IHRoaXMgd2lsbCBwcmV2ZW50IHRoZSB0cmFuc2xhdG9yc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGF2aW5nIHRvIHJlLXRyYW5zbGF0ZSB0aGUgc3RyaW5nIHdoZW4gd2UgZG8uXG4gICAgICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgaHJlZj17QlJJREdFU19MSU5LfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICl9PC9wPlxuICAgICAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9XCJteF9Sb29tU2V0dGluZ3NEaWFsb2dfQnJpZGdlTGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICB7IGJyaWRnZUV2ZW50cy5tYXAoKGV2ZW50KSA9PiB0aGlzLnJlbmRlckJyaWRnZUNhcmQoZXZlbnQsIHJvb20pKSB9XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8cD57X3QoXG4gICAgICAgICAgICAgICAgXCJUaGlzIHJvb20gaXNu4oCZdCBicmlkZ2luZyBtZXNzYWdlcyB0byBhbnkgcGxhdGZvcm1zLiBcIiArXG4gICAgICAgICAgICAgICAgXCI8YT5MZWFybiBtb3JlLjwvYT5cIiwge30sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPOiBXZSBkb24ndCBoYXZlIHRoaXMgbGluayB5ZXQ6IHRoaXMgd2lsbCBwcmV2ZW50IHRoZSB0cmFuc2xhdG9yc1xuICAgICAgICAgICAgICAgICAgICAvLyBoYXZpbmcgdG8gcmUtdHJhbnNsYXRlIHRoZSBzdHJpbmcgd2hlbiB3ZSBkby5cbiAgICAgICAgICAgICAgICAgICAgYTogc3ViID0+IDxhIGhyZWY9e0JSSURHRVNfTElOS30gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiPntzdWJ9PC9hPixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKX08L3A+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX2hlYWRpbmdcIj57X3QoXCJCcmlkZ2VzXCIpfTwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9TZXR0aW5nc1RhYl9zZWN0aW9uIG14X1NldHRpbmdzVGFiX3N1YnNlY3Rpb25UZXh0Jz5cbiAgICAgICAgICAgICAgICAgICAge2NvbnRlbnR9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=