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

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class;

const BRIDGE_EVENT_TYPES = ["uk.half-shot.bridge" // m.bridge
];
const BRIDGES_LINK = "https://matrix.org/bridges/";
let BridgeSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.room.BridgeSettingsTab"), _dec(_class = class BridgeSettingsTab extends _react.default.Component
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

}) || _class);
exports.default = BridgeSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvcm9vbS9CcmlkZ2VTZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOlsiQlJJREdFX0VWRU5UX1RZUEVTIiwiQlJJREdFU19MSU5LIiwiQnJpZGdlU2V0dGluZ3NUYWIiLCJSZWFjdCIsIkNvbXBvbmVudCIsInJlbmRlckJyaWRnZUNhcmQiLCJldmVudCIsInJvb20iLCJjb250ZW50IiwiZ2V0Q29udGVudCIsImNoYW5uZWwiLCJwcm90b2NvbCIsImdldElkIiwiZ2V0QnJpZGdlU3RhdGVFdmVudHMiLCJyb29tSWQiLCJjbGllbnQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJyb29tU3RhdGUiLCJnZXRSb29tIiwiY3VycmVudFN0YXRlIiwibWFwIiwidHlwZU5hbWUiLCJldmVudHMiLCJBcnJheSIsImZyb20iLCJ2YWx1ZXMiLCJmbGF0IiwicmVuZGVyIiwiYnJpZGdlRXZlbnRzIiwicHJvcHMiLCJsZW5ndGgiLCJhIiwic3ViIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFnQkE7O0FBSUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxrQkFBa0IsR0FBRyxDQUN2QixxQkFEdUIsQ0FFdkI7QUFGdUIsQ0FBM0I7QUFLQSxNQUFNQyxZQUFZLEdBQUcsNkJBQXJCO0lBT3FCQyxpQixXQURwQixnREFBcUIsNENBQXJCLEMsZ0JBQUQsTUFDcUJBLGlCQURyQixTQUMrQ0MsZUFBTUM7QUFEckQ7QUFDdUU7QUFDM0RDLEVBQUFBLGdCQUFSLENBQXlCQztBQUF6QjtBQUFBLElBQTZDQztBQUE3QztBQUFBLElBQXlEO0FBQ3JELFVBQU1DLE9BQU8sR0FBR0YsS0FBSyxDQUFDRyxVQUFOLEVBQWhCOztBQUNBLFFBQUksQ0FBQ0QsT0FBRCxJQUFZLENBQUNBLE9BQU8sQ0FBQ0UsT0FBckIsSUFBZ0MsQ0FBQ0YsT0FBTyxDQUFDRyxRQUE3QyxFQUF1RDtBQUNuRCxhQUFPLElBQVA7QUFDSDs7QUFDRCx3QkFBTyw2QkFBQyxtQkFBRDtBQUFZLE1BQUEsR0FBRyxFQUFFTCxLQUFLLENBQUNNLEtBQU4sRUFBakI7QUFBZ0MsTUFBQSxJQUFJLEVBQUVMLElBQXRDO0FBQTRDLE1BQUEsRUFBRSxFQUFFRDtBQUFoRCxNQUFQO0FBQ0g7O0FBRUQsU0FBT08sb0JBQVAsQ0FBNEJDO0FBQTVCO0FBQUEsSUFBNEM7QUFDeEMsVUFBTUMsTUFBTSxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEVBQWY7O0FBQ0EsVUFBTUMsU0FBUyxHQUFHSCxNQUFNLENBQUNJLE9BQVAsQ0FBZUwsTUFBZixFQUF1Qk0sWUFBekM7QUFFQSxXQUFPcEIsa0JBQWtCLENBQUNxQixHQUFuQixDQUF1QkMsUUFBUSxJQUFJO0FBQ3RDLFlBQU1DLE1BQU0sR0FBR0wsU0FBUyxDQUFDSyxNQUFWLENBQWlCTixHQUFqQixDQUFxQkssUUFBckIsQ0FBZjtBQUNBLGFBQU9DLE1BQU0sR0FBR0MsS0FBSyxDQUFDQyxJQUFOLENBQVdGLE1BQU0sQ0FBQ0csTUFBUCxFQUFYLENBQUgsR0FBaUMsRUFBOUM7QUFDSCxLQUhNLEVBR0pDLElBSEksQ0FHQyxDQUhELENBQVA7QUFJSDs7QUFFREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0w7QUFDQTtBQUNBLFVBQU1DLFlBQVksR0FBRzNCLGlCQUFpQixDQUFDVyxvQkFBbEIsQ0FBdUMsS0FBS2lCLEtBQUwsQ0FBV2hCLE1BQWxELENBQXJCOztBQUNBLFVBQU1DLE1BQU0sR0FBR0MsaUNBQWdCQyxHQUFoQixFQUFmOztBQUNBLFVBQU1WLElBQUksR0FBR1EsTUFBTSxDQUFDSSxPQUFQLENBQWUsS0FBS1csS0FBTCxDQUFXaEIsTUFBMUIsQ0FBYjtBQUVBLFFBQUlOO0FBQW9CO0FBQXhCOztBQUNBLFFBQUlxQixZQUFZLENBQUNFLE1BQWIsR0FBc0IsQ0FBMUIsRUFBNkI7QUFDekJ2QixNQUFBQSxPQUFPLGdCQUFHLHVEQUNOLHdDQUFJLHlCQUNBLGdFQUNBLG9CQUZBLEVBRXNCLEVBRnRCLEVBR0E7QUFDSTtBQUNBO0FBQ0F3QixRQUFBQSxDQUFDLEVBQUVDLEdBQUcsaUJBQUk7QUFBRyxVQUFBLElBQUksRUFBRWhDLFlBQVQ7QUFBdUIsVUFBQSxNQUFNLEVBQUMsUUFBOUI7QUFBdUMsVUFBQSxHQUFHLEVBQUM7QUFBM0MsV0FBa0VnQyxHQUFsRTtBQUhkLE9BSEEsQ0FBSixDQURNLGVBVU47QUFBSSxRQUFBLFNBQVMsRUFBQztBQUFkLFNBQ01KLFlBQVksQ0FBQ1IsR0FBYixDQUFrQmYsS0FBRCxJQUFXLEtBQUtELGdCQUFMLENBQXNCQyxLQUF0QixFQUE2QkMsSUFBN0IsQ0FBNUIsQ0FETixDQVZNLENBQVY7QUFjSCxLQWZELE1BZU87QUFDSEMsTUFBQUEsT0FBTyxnQkFBRyx3Q0FBSSx5QkFDVix5REFDQSxvQkFGVSxFQUVZLEVBRlosRUFHVjtBQUNJO0FBQ0E7QUFDQXdCLFFBQUFBLENBQUMsRUFBRUMsR0FBRyxpQkFBSTtBQUFHLFVBQUEsSUFBSSxFQUFFaEMsWUFBVDtBQUF1QixVQUFBLE1BQU0sRUFBQyxRQUE5QjtBQUF1QyxVQUFBLEdBQUcsRUFBQztBQUEzQyxXQUFrRWdDLEdBQWxFO0FBSGQsT0FIVSxDQUFKLENBQVY7QUFTSDs7QUFFRCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDLHlCQUFHLFNBQUgsQ0FBekMsQ0FESixlQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLekIsT0FETCxDQUZKLENBREo7QUFRSDs7QUE5RGtFLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge1Jvb219IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuaW1wb3J0IHtNYXRyaXhFdmVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuXG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEJyaWRnZVRpbGUgZnJvbSBcIi4uLy4uL0JyaWRnZVRpbGVcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5jb25zdCBCUklER0VfRVZFTlRfVFlQRVMgPSBbXG4gICAgXCJ1ay5oYWxmLXNob3QuYnJpZGdlXCIsXG4gICAgLy8gbS5icmlkZ2Vcbl07XG5cbmNvbnN0IEJSSURHRVNfTElOSyA9IFwiaHR0cHM6Ly9tYXRyaXgub3JnL2JyaWRnZXMvXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21JZDogc3RyaW5nO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5zZXR0aW5ncy50YWJzLnJvb20uQnJpZGdlU2V0dGluZ3NUYWJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWRnZVNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcz4ge1xuICAgIHByaXZhdGUgcmVuZGVyQnJpZGdlQ2FyZChldmVudDogTWF0cml4RXZlbnQsIHJvb206IFJvb20pIHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGV2ZW50LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKCFjb250ZW50IHx8ICFjb250ZW50LmNoYW5uZWwgfHwgIWNvbnRlbnQucHJvdG9jb2wpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8QnJpZGdlVGlsZSBrZXk9e2V2ZW50LmdldElkKCl9IHJvb209e3Jvb219IGV2PXtldmVudH0gLz47XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEJyaWRnZVN0YXRlRXZlbnRzKHJvb21JZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGNsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbVN0YXRlID0gY2xpZW50LmdldFJvb20ocm9vbUlkKS5jdXJyZW50U3RhdGU7XG5cbiAgICAgICAgcmV0dXJuIEJSSURHRV9FVkVOVF9UWVBFUy5tYXAodHlwZU5hbWUgPT4ge1xuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gcm9vbVN0YXRlLmV2ZW50cy5nZXQodHlwZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIGV2ZW50cyA/IEFycmF5LmZyb20oZXZlbnRzLnZhbHVlcygpKSA6IFtdO1xuICAgICAgICB9KS5mbGF0KDEpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gVGhpcyBzZXR0aW5ncyB0YWIgd2lsbCBvbmx5IGJlIGludm9rZWQgaWYgdGhlIGZvbGxvd2luZyBmdW5jdGlvbiByZXR1cm5zIG1vcmVcbiAgICAgICAgLy8gdGhhbiAwIGV2ZW50cywgc28gbm8gdmFsaWRhdGlvbiBpcyBuZWVkZWQgYXQgdGhpcyBzdGFnZS5cbiAgICAgICAgY29uc3QgYnJpZGdlRXZlbnRzID0gQnJpZGdlU2V0dGluZ3NUYWIuZ2V0QnJpZGdlU3RhdGVFdmVudHModGhpcy5wcm9wcy5yb29tSWQpO1xuICAgICAgICBjb25zdCBjbGllbnQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNvbnN0IHJvb20gPSBjbGllbnQuZ2V0Um9vbSh0aGlzLnByb3BzLnJvb21JZCk7XG5cbiAgICAgICAgbGV0IGNvbnRlbnQ6IEpTWC5FbGVtZW50O1xuICAgICAgICBpZiAoYnJpZGdlRXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwPntfdChcbiAgICAgICAgICAgICAgICAgICAgXCJUaGlzIHJvb20gaXMgYnJpZGdpbmcgbWVzc2FnZXMgdG8gdGhlIGZvbGxvd2luZyBwbGF0Zm9ybXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgXCI8YT5MZWFybiBtb3JlLjwvYT5cIiwge30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFdlIGRvbid0IGhhdmUgdGhpcyBsaW5rIHlldDogdGhpcyB3aWxsIHByZXZlbnQgdGhlIHRyYW5zbGF0b3JzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBoYXZpbmcgdG8gcmUtdHJhbnNsYXRlIHRoZSBzdHJpbmcgd2hlbiB3ZSBkby5cbiAgICAgICAgICAgICAgICAgICAgICAgIGE6IHN1YiA9PiA8YSBocmVmPXtCUklER0VTX0xJTkt9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIj57c3VifTwvYT4sXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKX08L3A+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cIm14X1Jvb21TZXR0aW5nc0RpYWxvZ19CcmlkZ2VMaXN0XCI+XG4gICAgICAgICAgICAgICAgICAgIHsgYnJpZGdlRXZlbnRzLm1hcCgoZXZlbnQpID0+IHRoaXMucmVuZGVyQnJpZGdlQ2FyZChldmVudCwgcm9vbSkpIH1cbiAgICAgICAgICAgICAgICA8L3VsPlxuICAgICAgICAgICAgPC9kaXY+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGVudCA9IDxwPntfdChcbiAgICAgICAgICAgICAgICBcIlRoaXMgcm9vbSBpc27igJl0IGJyaWRnaW5nIG1lc3NhZ2VzIHRvIGFueSBwbGF0Zm9ybXMuIFwiICtcbiAgICAgICAgICAgICAgICBcIjxhPkxlYXJuIG1vcmUuPC9hPlwiLCB7fSxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IFdlIGRvbid0IGhhdmUgdGhpcyBsaW5rIHlldDogdGhpcyB3aWxsIHByZXZlbnQgdGhlIHRyYW5zbGF0b3JzXG4gICAgICAgICAgICAgICAgICAgIC8vIGhhdmluZyB0byByZS10cmFuc2xhdGUgdGhlIHN0cmluZyB3aGVuIHdlIGRvLlxuICAgICAgICAgICAgICAgICAgICBhOiBzdWIgPT4gPGEgaHJlZj17QlJJREdFU19MSU5LfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCI+e3N1Yn08L2E+LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApfTwvcD47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2V0dGluZ3NUYWJfaGVhZGluZ1wiPntfdChcIkJyaWRnZXNcIil9PC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X1NldHRpbmdzVGFiX3NlY3Rpb24gbXhfU2V0dGluZ3NUYWJfc3Vic2VjdGlvblRleHQnPlxuICAgICAgICAgICAgICAgICAgICB7Y29udGVudH1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==