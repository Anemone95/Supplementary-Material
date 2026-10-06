"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CapabilityText = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

var _languageHandler = require("../languageHandler");

var _event = require("matrix-js-sdk/src/@types/event");

var _ElementWidgetCapabilities = require("../stores/widgets/ElementWidgetCapabilities");

var _react = _interopRequireDefault(require("react"));

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
const GENERIC_WIDGET_KIND
/*: GENERIC_WIDGET_KIND*/
= "generic";
/*:: export interface TranslatedCapabilityText {
    primary: TranslatedString;
    byline?: TranslatedString;
}*/

class CapabilityText {
  static bylineFor(eventCap
  /*: WidgetEventCapability*/
  )
  /*: TranslatedString*/
  {
    if (eventCap.isState) {
      return !eventCap.keyStr ? (0, _languageHandler._t)("with an empty state key") : (0, _languageHandler._t)("with state key %(stateKey)s", {
        stateKey: eventCap.keyStr
      });
    }

    return null; // room messages are handled specially
  }

  static for(capability
  /*: Capability*/
  , kind
  /*: WidgetKind*/
  )
  /*: TranslatedCapabilityText*/
  {
    // First see if we have a super simple line of text to provide back
    if (CapabilityText.simpleCaps[capability]) {
      const textForKind = CapabilityText.simpleCaps[capability];
      if (textForKind[kind]) return {
        primary: (0, _languageHandler._t)(textForKind[kind])
      };
      if (textForKind[GENERIC_WIDGET_KIND]) return {
        primary: (0, _languageHandler._t)(textForKind[GENERIC_WIDGET_KIND])
      }; // ... we'll fall through to the generic capability processing at the end of this
      // function if we fail to locate a simple string and the capability isn't for an
      // event.
    } // We didn't have a super simple line of text, so try processing the capability as the
    // more complex event send/receive permission type.


    const [eventCap] = _matrixWidgetApi.WidgetEventCapability.findEventCapabilities([capability]);

    if (eventCap) {
      // Special case room messages so they show up a bit cleaner to the user. Result is
      // effectively "Send images" instead of "Send messages... of type images" if we were
      // to handle the msgtype nuances in this function.
      if (!eventCap.isState && eventCap.eventType === _event.EventType.RoomMessage) {
        return CapabilityText.forRoomMessageCap(eventCap, kind);
      } // See if we have a static line of text to provide for the given event type and
      // direction. The hope is that we do for common event types for friendlier copy.


      const evSendRecv = eventCap.isState ? CapabilityText.stateSendRecvCaps : CapabilityText.nonStateSendRecvCaps;

      if (evSendRecv[eventCap.eventType]) {
        const textForKind = evSendRecv[eventCap.eventType];
        const textForDirection = textForKind[kind] || textForKind[GENERIC_WIDGET_KIND];

        if (textForDirection && textForDirection[eventCap.direction]) {
          return {
            primary: (0, _languageHandler._t)(textForDirection[eventCap.direction]) // no byline because we would have already represented the event properly

          };
        }
      } // We don't have anything simple, so just return a generic string for the event cap


      if (kind === _matrixWidgetApi.WidgetKind.Room) {
        if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
          return {
            primary: (0, _languageHandler._t)("Send <b>%(eventType)s</b> events as you in this room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        } else {
          return {
            primary: (0, _languageHandler._t)("See <b>%(eventType)s</b> events posted to this room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        }
      } else {
        // assume generic
        if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
          return {
            primary: (0, _languageHandler._t)("Send <b>%(eventType)s</b> events as you in your active room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        } else {
          return {
            primary: (0, _languageHandler._t)("See <b>%(eventType)s</b> events posted to your active room", {
              eventType: eventCap.eventType
            }, {
              b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
            }),
            byline: CapabilityText.bylineFor(eventCap)
          };
        }
      }
    } // We don't have enough context to render this capability specially, so we'll present it as-is


    return {
      primary: (0, _languageHandler._t)("The <b>%(capability)s</b> capability", {
        capability
      }, {
        b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
      })
    };
  }

  static forRoomMessageCap(eventCap
  /*: WidgetEventCapability*/
  , kind
  /*: WidgetKind*/
  )
  /*: TranslatedCapabilityText*/
  {
    // First handle the case of "all messages" to make the switch later on a bit clearer
    if (!eventCap.keyStr) {
      if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
        return {
          primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send messages as you in this room") : (0, _languageHandler._t)("Send messages as you in your active room")
        };
      } else {
        return {
          primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See messages posted to this room") : (0, _languageHandler._t)("See messages posted to your active room")
        };
      }
    } // Now handle all the message types we care about. There are more message types available, however
    // they are not as common so we don't bother rendering them. They'll fall into the generic case.


    switch (eventCap.keyStr) {
      case _event.MsgType.Text:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send text messages as you in this room") : (0, _languageHandler._t)("Send text messages as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See text messages posted to this room") : (0, _languageHandler._t)("See text messages posted to your active room")
            };
          }
        }

      case _event.MsgType.Emote:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send emotes as you in this room") : (0, _languageHandler._t)("Send emotes as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See emotes posted to this room") : (0, _languageHandler._t)("See emotes posted to your active room")
            };
          }
        }

      case _event.MsgType.Image:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send images as you in this room") : (0, _languageHandler._t)("Send images as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See images posted to this room") : (0, _languageHandler._t)("See images posted to your active room")
            };
          }
        }

      case _event.MsgType.Video:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send videos as you in this room") : (0, _languageHandler._t)("Send videos as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See videos posted to this room") : (0, _languageHandler._t)("See videos posted to your active room")
            };
          }
        }

      case _event.MsgType.File:
        {
          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("Send general files as you in this room") : (0, _languageHandler._t)("Send general files as you in your active room")
            };
          } else {
            return {
              primary: kind === _matrixWidgetApi.WidgetKind.Room ? (0, _languageHandler._t)("See general files posted to this room") : (0, _languageHandler._t)("See general files posted to your active room")
            };
          }
        }

      default:
        {
          let primary
          /*: TranslatedString*/
          ;

          if (eventCap.direction === _matrixWidgetApi.EventDirection.Send) {
            if (kind === _matrixWidgetApi.WidgetKind.Room) {
              primary = (0, _languageHandler._t)("Send <b>%(msgtype)s</b> messages as you in this room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            } else {
              primary = (0, _languageHandler._t)("Send <b>%(msgtype)s</b> messages as you in your active room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            }
          } else {
            if (kind === _matrixWidgetApi.WidgetKind.Room) {
              primary = (0, _languageHandler._t)("See <b>%(msgtype)s</b> messages posted to this room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            } else {
              primary = (0, _languageHandler._t)("See <b>%(msgtype)s</b> messages posted to your active room", {
                msgtype: eventCap.keyStr
              }, {
                b: sub => /*#__PURE__*/_react.default.createElement("b", null, sub)
              });
            }
          }

          return {
            primary
          };
        }
    }
  }

}

exports.CapabilityText = CapabilityText;
(0, _defineProperty2.default)(CapabilityText, "simpleCaps", {
  [_matrixWidgetApi.MatrixCapabilities.AlwaysOnScreen]: {
    [_matrixWidgetApi.WidgetKind.Room]: (0, _languageHandler._td)("Remain on your screen when viewing another room, when running"),
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Remain on your screen while running")
  },
  [_matrixWidgetApi.MatrixCapabilities.StickerSending]: {
    [_matrixWidgetApi.WidgetKind.Room]: (0, _languageHandler._td)("Send stickers into this room"),
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Send stickers into your active room")
  },
  [_ElementWidgetCapabilities.ElementWidgetCapabilities.CanChangeViewedRoom]: {
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Change which room you're viewing")
  },
  [_matrixWidgetApi.MatrixCapabilities.MSC2931Navigate]: {
    [GENERIC_WIDGET_KIND]: (0, _languageHandler._td)("Change which room, message, or user you're viewing")
  }
});
(0, _defineProperty2.default)(CapabilityText, "stateSendRecvCaps", {
  [_event.EventType.RoomTopic]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the topic of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the topic changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the topic of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the topic changes in your active room")
    }
  },
  [_event.EventType.RoomName]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the name of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the name changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the name of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the name changes in your active room")
    }
  },
  [_event.EventType.RoomAvatar]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the avatar of this room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the avatar changes in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Change the avatar of your active room"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when the avatar changes in your active room")
    }
  }
});
(0, _defineProperty2.default)(CapabilityText, "nonStateSendRecvCaps", {
  [_event.EventType.Sticker]: {
    [_matrixWidgetApi.WidgetKind.Room]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Send stickers to this room as you"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when a sticker is posted in this room")
    },
    [GENERIC_WIDGET_KIND]: {
      [_matrixWidgetApi.EventDirection.Send]: (0, _languageHandler._td)("Send stickers to your active room as you"),
      [_matrixWidgetApi.EventDirection.Receive]: (0, _languageHandler._td)("See when anyone posts a sticker to your active room")
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93aWRnZXRzL0NhcGFiaWxpdHlUZXh0LnRzeCJdLCJuYW1lcyI6WyJHRU5FUklDX1dJREdFVF9LSU5EIiwiQ2FwYWJpbGl0eVRleHQiLCJieWxpbmVGb3IiLCJldmVudENhcCIsImlzU3RhdGUiLCJrZXlTdHIiLCJzdGF0ZUtleSIsImZvciIsImNhcGFiaWxpdHkiLCJraW5kIiwic2ltcGxlQ2FwcyIsInRleHRGb3JLaW5kIiwicHJpbWFyeSIsIldpZGdldEV2ZW50Q2FwYWJpbGl0eSIsImZpbmRFdmVudENhcGFiaWxpdGllcyIsImV2ZW50VHlwZSIsIkV2ZW50VHlwZSIsIlJvb21NZXNzYWdlIiwiZm9yUm9vbU1lc3NhZ2VDYXAiLCJldlNlbmRSZWN2Iiwic3RhdGVTZW5kUmVjdkNhcHMiLCJub25TdGF0ZVNlbmRSZWN2Q2FwcyIsInRleHRGb3JEaXJlY3Rpb24iLCJkaXJlY3Rpb24iLCJXaWRnZXRLaW5kIiwiUm9vbSIsIkV2ZW50RGlyZWN0aW9uIiwiU2VuZCIsImIiLCJzdWIiLCJieWxpbmUiLCJNc2dUeXBlIiwiVGV4dCIsIkVtb3RlIiwiSW1hZ2UiLCJWaWRlbyIsIkZpbGUiLCJtc2d0eXBlIiwiTWF0cml4Q2FwYWJpbGl0aWVzIiwiQWx3YXlzT25TY3JlZW4iLCJTdGlja2VyU2VuZGluZyIsIkVsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXMiLCJDYW5DaGFuZ2VWaWV3ZWRSb29tIiwiTVNDMjkzMU5hdmlnYXRlIiwiUm9vbVRvcGljIiwiUmVjZWl2ZSIsIlJvb21OYW1lIiwiUm9vbUF2YXRhciIsIlN0aWNrZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTQSxNQUFNQTtBQUF3QztBQUFBLEVBQUcsU0FBakQ7O0FBdkJBO0FBQ0E7QUFD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QWVDLElBQWhCLEdBQXVCLDBCQUFJLG1DQUFKLENBRFI7QUFFZixPQUFDRCxnQ0FBZW1CLE9BQWhCLEdBQTBCLDBCQUFJLDJDQUFKO0FBRlgsS0FERjtBQUtqQixLQUFDN0MsbUJBQUQsR0FBdUI7QUFDbkIsT0FBQzBCLGdDQUFlQyxJQUFoQixHQUF1QiwwQkFBSSwwQ0FBSixDQURKO0FBRW5CLE9BQUNELGdDQUFlbUIsT0FBaEIsR0FBMEIsMEJBQUkscURBQUo7QUFGUDtBQUxOO0FBRHFDLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBDYXBhYmlsaXR5LCBFdmVudERpcmVjdGlvbiwgTWF0cml4Q2FwYWJpbGl0aWVzLCBXaWRnZXRFdmVudENhcGFiaWxpdHksIFdpZGdldEtpbmQgfSBmcm9tIFwibWF0cml4LXdpZGdldC1hcGlcIjtcbmltcG9ydCB7IF90LCBfdGQsIFRyYW5zbGF0ZWRTdHJpbmcgfSBmcm9tIFwiLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBFdmVudFR5cGUsIE1zZ1R5cGUgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQgeyBFbGVtZW50V2lkZ2V0Q2FwYWJpbGl0aWVzIH0gZnJvbSBcIi4uL3N0b3Jlcy93aWRnZXRzL0VsZW1lbnRXaWRnZXRDYXBhYmlsaXRpZXNcIjtcbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxudHlwZSBHRU5FUklDX1dJREdFVF9LSU5EID0gXCJnZW5lcmljXCI7XG5jb25zdCBHRU5FUklDX1dJREdFVF9LSU5EOiBHRU5FUklDX1dJREdFVF9LSU5EID0gXCJnZW5lcmljXCI7XG5cbmludGVyZmFjZSBJU2VuZFJlY3ZTdGF0aWNDYXBUZXh0IHtcbiAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgdGhlIGtleSB0byBiZSBhIHN0cmluZywgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgW2V2ZW50VHlwZTogRXZlbnRUeXBlXToge1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgdGhlIGtleSB0byBiZSBhIHN0cmluZywgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgICAgIFt3aWRnZXRLaW5kOiBXaWRnZXRLaW5kIHwgR0VORVJJQ19XSURHRVRfS0lORF06IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBUUyB3YW50cyB0aGUga2V5IHRvIGJlIGEgc3RyaW5nLCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICAgICAgICAgIFtkaXJlY3Rpb246IEV2ZW50RGlyZWN0aW9uXTogc3RyaW5nO1xuICAgICAgICB9O1xuICAgIH07XG59XG5cbmludGVyZmFjZSBJU3RhdGljQ2FwVGV4dCB7XG4gICAgLy8gQHRzLWlnbm9yZSAtIFRTIHdhbnRzIHRoZSBrZXkgdG8gYmUgYSBzdHJpbmcsIGJ1dCB3ZSBrbm93IGJldHRlclxuICAgIFtjYXBhYmlsaXR5OiBDYXBhYmlsaXR5XToge1xuICAgICAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgdGhlIGtleSB0byBiZSBhIHN0cmluZywgYnV0IHdlIGtub3cgYmV0dGVyXG4gICAgICAgIFt3aWRnZXRLaW5kOiBXaWRnZXRLaW5kIHwgR0VORVJJQ19XSURHRVRfS0lORF06IHN0cmluZztcbiAgICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyYW5zbGF0ZWRDYXBhYmlsaXR5VGV4dCB7XG4gICAgcHJpbWFyeTogVHJhbnNsYXRlZFN0cmluZztcbiAgICBieWxpbmU/OiBUcmFuc2xhdGVkU3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQ2FwYWJpbGl0eVRleHQge1xuICAgIHByaXZhdGUgc3RhdGljIHNpbXBsZUNhcHM6IElTdGF0aWNDYXBUZXh0ID0ge1xuICAgICAgICBbTWF0cml4Q2FwYWJpbGl0aWVzLkFsd2F5c09uU2NyZWVuXToge1xuICAgICAgICAgICAgW1dpZGdldEtpbmQuUm9vbV06IF90ZChcIlJlbWFpbiBvbiB5b3VyIHNjcmVlbiB3aGVuIHZpZXdpbmcgYW5vdGhlciByb29tLCB3aGVuIHJ1bm5pbmdcIiksXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IF90ZChcIlJlbWFpbiBvbiB5b3VyIHNjcmVlbiB3aGlsZSBydW5uaW5nXCIpLFxuICAgICAgICB9LFxuICAgICAgICBbTWF0cml4Q2FwYWJpbGl0aWVzLlN0aWNrZXJTZW5kaW5nXToge1xuICAgICAgICAgICAgW1dpZGdldEtpbmQuUm9vbV06IF90ZChcIlNlbmQgc3RpY2tlcnMgaW50byB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IF90ZChcIlNlbmQgc3RpY2tlcnMgaW50byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICB9LFxuICAgICAgICBbRWxlbWVudFdpZGdldENhcGFiaWxpdGllcy5DYW5DaGFuZ2VWaWV3ZWRSb29tXToge1xuICAgICAgICAgICAgW0dFTkVSSUNfV0lER0VUX0tJTkRdOiBfdGQoXCJDaGFuZ2Ugd2hpY2ggcm9vbSB5b3UncmUgdmlld2luZ1wiKSxcbiAgICAgICAgfSxcbiAgICAgICAgW01hdHJpeENhcGFiaWxpdGllcy5NU0MyOTMxTmF2aWdhdGVdOiB7XG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IF90ZChcIkNoYW5nZSB3aGljaCByb29tLCBtZXNzYWdlLCBvciB1c2VyIHlvdSdyZSB2aWV3aW5nXCIpLFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBzdGF0ZVNlbmRSZWN2Q2FwczogSVNlbmRSZWN2U3RhdGljQ2FwVGV4dCA9IHtcbiAgICAgICAgW0V2ZW50VHlwZS5Sb29tVG9waWNdOiB7XG4gICAgICAgICAgICBbV2lkZ2V0S2luZC5Sb29tXToge1xuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5TZW5kXTogX3RkKFwiQ2hhbmdlIHRoZSB0b3BpYyBvZiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiB0aGUgdG9waWMgY2hhbmdlcyBpbiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW0dFTkVSSUNfV0lER0VUX0tJTkRdOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIHRvcGljIG9mIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiB0aGUgdG9waWMgY2hhbmdlcyBpbiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgW0V2ZW50VHlwZS5Sb29tTmFtZV06IHtcbiAgICAgICAgICAgIFtXaWRnZXRLaW5kLlJvb21dOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIG5hbWUgb2YgdGhpcyByb29tXCIpLFxuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5SZWNlaXZlXTogX3RkKFwiU2VlIHdoZW4gdGhlIG5hbWUgY2hhbmdlcyBpbiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgW0dFTkVSSUNfV0lER0VUX0tJTkRdOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIG5hbWUgb2YgeW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHRoZSBuYW1lIGNoYW5nZXMgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFtFdmVudFR5cGUuUm9vbUF2YXRhcl06IHtcbiAgICAgICAgICAgIFtXaWRnZXRLaW5kLlJvb21dOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJDaGFuZ2UgdGhlIGF2YXRhciBvZiB0aGlzIHJvb21cIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiB0aGUgYXZhdGFyIGNoYW5nZXMgaW4gdGhpcyByb29tXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFtHRU5FUklDX1dJREdFVF9LSU5EXToge1xuICAgICAgICAgICAgICAgIFtFdmVudERpcmVjdGlvbi5TZW5kXTogX3RkKFwiQ2hhbmdlIHRoZSBhdmF0YXIgb2YgeW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uUmVjZWl2ZV06IF90ZChcIlNlZSB3aGVuIHRoZSBhdmF0YXIgY2hhbmdlcyBpbiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgbm9uU3RhdGVTZW5kUmVjdkNhcHM6IElTZW5kUmVjdlN0YXRpY0NhcFRleHQgPSB7XG4gICAgICAgIFtFdmVudFR5cGUuU3RpY2tlcl06IHtcbiAgICAgICAgICAgIFtXaWRnZXRLaW5kLlJvb21dOiB7XG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlNlbmRdOiBfdGQoXCJTZW5kIHN0aWNrZXJzIHRvIHRoaXMgcm9vbSBhcyB5b3VcIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiBhIHN0aWNrZXIgaXMgcG9zdGVkIGluIHRoaXMgcm9vbVwiKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBbR0VORVJJQ19XSURHRVRfS0lORF06IHtcbiAgICAgICAgICAgICAgICBbRXZlbnREaXJlY3Rpb24uU2VuZF06IF90ZChcIlNlbmQgc3RpY2tlcnMgdG8geW91ciBhY3RpdmUgcm9vbSBhcyB5b3VcIiksXG4gICAgICAgICAgICAgICAgW0V2ZW50RGlyZWN0aW9uLlJlY2VpdmVdOiBfdGQoXCJTZWUgd2hlbiBhbnlvbmUgcG9zdHMgYSBzdGlja2VyIHRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBieWxpbmVGb3IoZXZlbnRDYXA6IFdpZGdldEV2ZW50Q2FwYWJpbGl0eSk6IFRyYW5zbGF0ZWRTdHJpbmcge1xuICAgICAgICBpZiAoZXZlbnRDYXAuaXNTdGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuICFldmVudENhcC5rZXlTdHJcbiAgICAgICAgICAgICAgICA/IF90KFwid2l0aCBhbiBlbXB0eSBzdGF0ZSBrZXlcIilcbiAgICAgICAgICAgICAgICA6IF90KFwid2l0aCBzdGF0ZSBrZXkgJShzdGF0ZUtleSlzXCIsIHtzdGF0ZUtleTogZXZlbnRDYXAua2V5U3RyfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7IC8vIHJvb20gbWVzc2FnZXMgYXJlIGhhbmRsZWQgc3BlY2lhbGx5XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBmb3IoY2FwYWJpbGl0eTogQ2FwYWJpbGl0eSwga2luZDogV2lkZ2V0S2luZCk6IFRyYW5zbGF0ZWRDYXBhYmlsaXR5VGV4dCB7XG4gICAgICAgIC8vIEZpcnN0IHNlZSBpZiB3ZSBoYXZlIGEgc3VwZXIgc2ltcGxlIGxpbmUgb2YgdGV4dCB0byBwcm92aWRlIGJhY2tcbiAgICAgICAgaWYgKENhcGFiaWxpdHlUZXh0LnNpbXBsZUNhcHNbY2FwYWJpbGl0eV0pIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRGb3JLaW5kID0gQ2FwYWJpbGl0eVRleHQuc2ltcGxlQ2Fwc1tjYXBhYmlsaXR5XTtcbiAgICAgICAgICAgIGlmICh0ZXh0Rm9yS2luZFtraW5kXSkgcmV0dXJuIHtwcmltYXJ5OiBfdCh0ZXh0Rm9yS2luZFtraW5kXSl9O1xuICAgICAgICAgICAgaWYgKHRleHRGb3JLaW5kW0dFTkVSSUNfV0lER0VUX0tJTkRdKSByZXR1cm4ge3ByaW1hcnk6IF90KHRleHRGb3JLaW5kW0dFTkVSSUNfV0lER0VUX0tJTkRdKX07XG5cbiAgICAgICAgICAgIC8vIC4uLiB3ZSdsbCBmYWxsIHRocm91Z2ggdG8gdGhlIGdlbmVyaWMgY2FwYWJpbGl0eSBwcm9jZXNzaW5nIGF0IHRoZSBlbmQgb2YgdGhpc1xuICAgICAgICAgICAgLy8gZnVuY3Rpb24gaWYgd2UgZmFpbCB0byBsb2NhdGUgYSBzaW1wbGUgc3RyaW5nIGFuZCB0aGUgY2FwYWJpbGl0eSBpc24ndCBmb3IgYW5cbiAgICAgICAgICAgIC8vIGV2ZW50LlxuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgZGlkbid0IGhhdmUgYSBzdXBlciBzaW1wbGUgbGluZSBvZiB0ZXh0LCBzbyB0cnkgcHJvY2Vzc2luZyB0aGUgY2FwYWJpbGl0eSBhcyB0aGVcbiAgICAgICAgLy8gbW9yZSBjb21wbGV4IGV2ZW50IHNlbmQvcmVjZWl2ZSBwZXJtaXNzaW9uIHR5cGUuXG4gICAgICAgIGNvbnN0IFtldmVudENhcF0gPSBXaWRnZXRFdmVudENhcGFiaWxpdHkuZmluZEV2ZW50Q2FwYWJpbGl0aWVzKFtjYXBhYmlsaXR5XSk7XG4gICAgICAgIGlmIChldmVudENhcCkge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBjYXNlIHJvb20gbWVzc2FnZXMgc28gdGhleSBzaG93IHVwIGEgYml0IGNsZWFuZXIgdG8gdGhlIHVzZXIuIFJlc3VsdCBpc1xuICAgICAgICAgICAgLy8gZWZmZWN0aXZlbHkgXCJTZW5kIGltYWdlc1wiIGluc3RlYWQgb2YgXCJTZW5kIG1lc3NhZ2VzLi4uIG9mIHR5cGUgaW1hZ2VzXCIgaWYgd2Ugd2VyZVxuICAgICAgICAgICAgLy8gdG8gaGFuZGxlIHRoZSBtc2d0eXBlIG51YW5jZXMgaW4gdGhpcyBmdW5jdGlvbi5cbiAgICAgICAgICAgIGlmICghZXZlbnRDYXAuaXNTdGF0ZSAmJiBldmVudENhcC5ldmVudFR5cGUgPT09IEV2ZW50VHlwZS5Sb29tTWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBDYXBhYmlsaXR5VGV4dC5mb3JSb29tTWVzc2FnZUNhcChldmVudENhcCwga2luZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNlZSBpZiB3ZSBoYXZlIGEgc3RhdGljIGxpbmUgb2YgdGV4dCB0byBwcm92aWRlIGZvciB0aGUgZ2l2ZW4gZXZlbnQgdHlwZSBhbmRcbiAgICAgICAgICAgIC8vIGRpcmVjdGlvbi4gVGhlIGhvcGUgaXMgdGhhdCB3ZSBkbyBmb3IgY29tbW9uIGV2ZW50IHR5cGVzIGZvciBmcmllbmRsaWVyIGNvcHkuXG4gICAgICAgICAgICBjb25zdCBldlNlbmRSZWN2ID0gZXZlbnRDYXAuaXNTdGF0ZVxuICAgICAgICAgICAgICAgID8gQ2FwYWJpbGl0eVRleHQuc3RhdGVTZW5kUmVjdkNhcHNcbiAgICAgICAgICAgICAgICA6IENhcGFiaWxpdHlUZXh0Lm5vblN0YXRlU2VuZFJlY3ZDYXBzO1xuICAgICAgICAgICAgaWYgKGV2U2VuZFJlY3ZbZXZlbnRDYXAuZXZlbnRUeXBlXSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRGb3JLaW5kID0gZXZTZW5kUmVjdltldmVudENhcC5ldmVudFR5cGVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRleHRGb3JEaXJlY3Rpb24gPSB0ZXh0Rm9yS2luZFtraW5kXSB8fCB0ZXh0Rm9yS2luZFtHRU5FUklDX1dJREdFVF9LSU5EXTtcbiAgICAgICAgICAgICAgICBpZiAodGV4dEZvckRpcmVjdGlvbiAmJiB0ZXh0Rm9yRGlyZWN0aW9uW2V2ZW50Q2FwLmRpcmVjdGlvbl0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KHRleHRGb3JEaXJlY3Rpb25bZXZlbnRDYXAuZGlyZWN0aW9uXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBubyBieWxpbmUgYmVjYXVzZSB3ZSB3b3VsZCBoYXZlIGFscmVhZHkgcmVwcmVzZW50ZWQgdGhlIGV2ZW50IHByb3Blcmx5XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXZSBkb24ndCBoYXZlIGFueXRoaW5nIHNpbXBsZSwgc28ganVzdCByZXR1cm4gYSBnZW5lcmljIHN0cmluZyBmb3IgdGhlIGV2ZW50IGNhcFxuICAgICAgICAgICAgaWYgKGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IF90KFwiU2VuZCA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgYXMgeW91IGluIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudENhcC5ldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlsaW5lOiBDYXBhYmlsaXR5VGV4dC5ieWxpbmVGb3IoZXZlbnRDYXApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBfdChcIlNlZSA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgcG9zdGVkIHRvIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudENhcC5ldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlsaW5lOiBDYXBhYmlsaXR5VGV4dC5ieWxpbmVGb3IoZXZlbnRDYXApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7IC8vIGFzc3VtZSBnZW5lcmljXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Q2FwLmRpcmVjdGlvbiA9PT0gRXZlbnREaXJlY3Rpb24uU2VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeTogX3QoXCJTZW5kIDxiPiUoZXZlbnRUeXBlKXM8L2I+IGV2ZW50cyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRUeXBlOiBldmVudENhcC5ldmVudFR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgYnlsaW5lOiBDYXBhYmlsaXR5VGV4dC5ieWxpbmVGb3IoZXZlbnRDYXApLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBfdChcIlNlZSA8Yj4lKGV2ZW50VHlwZSlzPC9iPiBldmVudHMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50VHlwZTogZXZlbnRDYXAuZXZlbnRUeXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5bGluZTogQ2FwYWJpbGl0eVRleHQuYnlsaW5lRm9yKGV2ZW50Q2FwKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXZSBkb24ndCBoYXZlIGVub3VnaCBjb250ZXh0IHRvIHJlbmRlciB0aGlzIGNhcGFiaWxpdHkgc3BlY2lhbGx5LCBzbyB3ZSdsbCBwcmVzZW50IGl0IGFzLWlzXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwcmltYXJ5OiBfdChcIlRoZSA8Yj4lKGNhcGFiaWxpdHkpczwvYj4gY2FwYWJpbGl0eVwiLCB7Y2FwYWJpbGl0eX0sIHtcbiAgICAgICAgICAgICAgICBiOiBzdWIgPT4gPGI+e3N1Yn08L2I+LFxuICAgICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzdGF0aWMgZm9yUm9vbU1lc3NhZ2VDYXAoZXZlbnRDYXA6IFdpZGdldEV2ZW50Q2FwYWJpbGl0eSwga2luZDogV2lkZ2V0S2luZCk6IFRyYW5zbGF0ZWRDYXBhYmlsaXR5VGV4dCB7XG4gICAgICAgIC8vIEZpcnN0IGhhbmRsZSB0aGUgY2FzZSBvZiBcImFsbCBtZXNzYWdlc1wiIHRvIG1ha2UgdGhlIHN3aXRjaCBsYXRlciBvbiBhIGJpdCBjbGVhcmVyXG4gICAgICAgIGlmICghZXZlbnRDYXAua2V5U3RyKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRDYXAuZGlyZWN0aW9uID09PSBFdmVudERpcmVjdGlvbi5TZW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VuZCBtZXNzYWdlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VuZCBtZXNzYWdlcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgbWVzc2FnZXMgcG9zdGVkIHRvIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSBtZXNzYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gTm93IGhhbmRsZSBhbGwgdGhlIG1lc3NhZ2UgdHlwZXMgd2UgY2FyZSBhYm91dC4gVGhlcmUgYXJlIG1vcmUgbWVzc2FnZSB0eXBlcyBhdmFpbGFibGUsIGhvd2V2ZXJcbiAgICAgICAgLy8gdGhleSBhcmUgbm90IGFzIGNvbW1vbiBzbyB3ZSBkb24ndCBib3RoZXIgcmVuZGVyaW5nIHRoZW0uIFRoZXknbGwgZmFsbCBpbnRvIHRoZSBnZW5lcmljIGNhc2UuXG4gICAgICAgIHN3aXRjaCAoZXZlbnRDYXAua2V5U3RyKSB7XG4gICAgICAgICAgICBjYXNlIE1zZ1R5cGUuVGV4dDoge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZW5kIHRleHQgbWVzc2FnZXMgYXMgeW91IGluIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZW5kIHRleHQgbWVzc2FnZXMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgdGV4dCBtZXNzYWdlcyBwb3N0ZWQgdG8gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSB0ZXh0IG1lc3NhZ2VzIHBvc3RlZCB0byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTXNnVHlwZS5FbW90ZToge1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZW5kIGVtb3RlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlbmQgZW1vdGVzIGFzIHlvdSBpbiB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VlIGVtb3RlcyBwb3N0ZWQgdG8gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlZSBlbW90ZXMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNc2dUeXBlLkltYWdlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Q2FwLmRpcmVjdGlvbiA9PT0gRXZlbnREaXJlY3Rpb24uU2VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlbmQgaW1hZ2VzIGFzIHlvdSBpbiB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VuZCBpbWFnZXMgYXMgeW91IGluIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnk6IGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gX3QoXCJTZWUgaW1hZ2VzIHBvc3RlZCB0byB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VlIGltYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIE1zZ1R5cGUuVmlkZW86IHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnRDYXAuZGlyZWN0aW9uID09PSBFdmVudERpcmVjdGlvbi5TZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmltYXJ5OiBraW5kID09PSBXaWRnZXRLaW5kLlJvb21cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IF90KFwiU2VuZCB2aWRlb3MgYXMgeW91IGluIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZW5kIHZpZGVvcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlZSB2aWRlb3MgcG9zdGVkIHRvIHRoaXMgcm9vbVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogX3QoXCJTZWUgdmlkZW9zIHBvc3RlZCB0byB5b3VyIGFjdGl2ZSByb29tXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgTXNnVHlwZS5GaWxlOiB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50Q2FwLmRpcmVjdGlvbiA9PT0gRXZlbnREaXJlY3Rpb24uU2VuZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlbmQgZ2VuZXJhbCBmaWxlcyBhcyB5b3UgaW4gdGhpcyByb29tXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBfdChcIlNlbmQgZ2VuZXJhbCBmaWxlcyBhcyB5b3UgaW4geW91ciBhY3RpdmUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeToga2luZCA9PT0gV2lkZ2V0S2luZC5Sb29tXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBfdChcIlNlZSBnZW5lcmFsIGZpbGVzIHBvc3RlZCB0byB0aGlzIHJvb21cIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IF90KFwiU2VlIGdlbmVyYWwgZmlsZXMgcG9zdGVkIHRvIHlvdXIgYWN0aXZlIHJvb21cIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgICAgICAgIGxldCBwcmltYXJ5OiBUcmFuc2xhdGVkU3RyaW5nO1xuICAgICAgICAgICAgICAgIGlmIChldmVudENhcC5kaXJlY3Rpb24gPT09IEV2ZW50RGlyZWN0aW9uLlNlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VuZCA8Yj4lKG1zZ3R5cGUpczwvYj4gbWVzc2FnZXMgYXMgeW91IGluIHRoaXMgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNndHlwZTogZXZlbnRDYXAua2V5U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnkgPSBfdChcIlNlbmQgPGI+JShtc2d0eXBlKXM8L2I+IG1lc3NhZ2VzIGFzIHlvdSBpbiB5b3VyIGFjdGl2ZSByb29tXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2d0eXBlOiBldmVudENhcC5rZXlTdHIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtpbmQgPT09IFdpZGdldEtpbmQuUm9vbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VlIDxiPiUobXNndHlwZSlzPC9iPiBtZXNzYWdlcyBwb3N0ZWQgdG8gdGhpcyByb29tXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtc2d0eXBlOiBldmVudENhcC5rZXlTdHIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYjogc3ViID0+IDxiPntzdWJ9PC9iPixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbWFyeSA9IF90KFwiU2VlIDxiPiUobXNndHlwZSlzPC9iPiBtZXNzYWdlcyBwb3N0ZWQgdG8geW91ciBhY3RpdmUgcm9vbVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXNndHlwZTogZXZlbnRDYXAua2V5U3RyLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGI6IHN1YiA9PiA8Yj57c3VifTwvYj4sXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4ge3ByaW1hcnl9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19