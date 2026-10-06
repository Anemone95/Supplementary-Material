"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WidgetLayoutStore = exports.MAX_PINNED = exports.Container = exports.WIDGET_LAYOUT_EVENT_TYPE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SettingsStore = _interopRequireDefault(require("../../settings/SettingsStore"));

var _WidgetStore = _interopRequireDefault(require("../WidgetStore"));

var _WidgetType = require("../../widgets/WidgetType");

var _numbers = require("../../utils/numbers");

var _dispatcher = _interopRequireDefault(require("../../dispatcher/dispatcher"));

var _ReadyWatchingStore = require("../ReadyWatchingStore");

var _SettingLevel = require("../../settings/SettingLevel");

var _arrays = require("../../utils/arrays");

var _AsyncStore = require("../AsyncStore");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const WIDGET_LAYOUT_EVENT_TYPE = "io.element.widgets.layout";
exports.WIDGET_LAYOUT_EVENT_TYPE = WIDGET_LAYOUT_EVENT_TYPE;
let Container;
exports.Container = Container;

(function (Container) {
  Container["Top"] = "top";
  Container["Right"] = "right";
})(Container || (exports.Container = Container = {}));
/*:: export interface IStoredLayout {
    // Where to store the widget. Required.
    container: Container;

    // The index (order) to position the widgets in. Only applies for
    // ordered containers (like the top container). Smaller numbers first,
    // and conflicts resolved by comparing widget IDs.
    index?: number;

    // Percentage (integer) for relative width of the container to consume.
    // Clamped to 0-100 and may have minimums imposed upon it. Only applies
    // to containers which support inner resizing (currently only the top
    // container).
    width?: number;

    // Percentage (integer) for relative height of the container. Note that
    // this only applies to the top container currently, and that container
    // will take the highest value among widgets in the container. Clamped
    // to 0-100 and may have minimums imposed on it.
    height?: number;

    // TODO: [Deferred] Maximizing (fullscreen) widgets by default.
}*/


// Dev note: "Pinned" widgets are ones in the top container.
const MAX_PINNED = 3; // These two are whole percentages and don't really mean anything. Later values will decide
// minimum, but these help determine proportions during our calculations here. In fact, these
// values should be *smaller* than the actual minimums imposed by later components.

exports.MAX_PINNED = MAX_PINNED;
const MIN_WIDGET_WIDTH_PCT = 10; // 10%

const MIN_WIDGET_HEIGHT_PCT = 2; // 2%

class WidgetLayoutStore extends _ReadyWatchingStore.ReadyWatchingStore {
  constructor() {
    super(_dispatcher.default);
    (0, _defineProperty2.default)(this, "byRoom", {});
    (0, _defineProperty2.default)(this, "pinnedRef", void 0);
    (0, _defineProperty2.default)(this, "layoutRef", void 0);
    (0, _defineProperty2.default)(this, "updateAllRooms", () => {
      this.byRoom = {};

      for (const room of this.matrixClient.getVisibleRooms()) {
        this.recalculateRoom(room);
      }
    });
    (0, _defineProperty2.default)(this, "updateFromWidgetStore", (roomId
    /*: string*/
    ) => {
      if (roomId) {
        const room = this.matrixClient.getRoom(roomId);
        if (room) this.recalculateRoom(room);
      } else {
        this.updateAllRooms();
      }
    });
    (0, _defineProperty2.default)(this, "updateRoomFromState", (ev
    /*: MatrixEvent*/
    ) => {
      if (ev.getType() !== WIDGET_LAYOUT_EVENT_TYPE) return;
      const room = this.matrixClient.getRoom(ev.getRoomId());
      if (room) this.recalculateRoom(room);
    });
    (0, _defineProperty2.default)(this, "updateFromSettings", (settingName
    /*: string*/
    , roomId
    /*: string*/
    ) =>
    /* and other stuff */
    {
      if (roomId) {
        const room = this.matrixClient.getRoom(roomId);
        if (room) this.recalculateRoom(room);
      } else {
        this.updateAllRooms();
      }
    });
  }

  static get instance()
  /*: WidgetLayoutStore*/
  {
    if (!WidgetLayoutStore.internalInstance) {
      WidgetLayoutStore.internalInstance = new WidgetLayoutStore();
    }

    return WidgetLayoutStore.internalInstance;
  }

  static emissionForRoom(room
  /*: Room*/
  )
  /*: string*/
  {
    return `update_${room.roomId}`;
  }

  emitFor(room
  /*: Room*/
  ) {
    this.emit(WidgetLayoutStore.emissionForRoom(room));
  }

  async onReady()
  /*: Promise<any>*/
  {
    this.updateAllRooms();
    this.matrixClient.on("RoomState.events", this.updateRoomFromState);
    this.pinnedRef = _SettingsStore.default.watchSetting("Widgets.pinned", null, this.updateFromSettings);
    this.layoutRef = _SettingsStore.default.watchSetting("Widgets.layout", null, this.updateFromSettings);

    _WidgetStore.default.instance.on(_AsyncStore.UPDATE_EVENT, this.updateFromWidgetStore);
  }

  async onNotReady()
  /*: Promise<any>*/
  {
    this.byRoom = {};

    _SettingsStore.default.unwatchSetting(this.pinnedRef);

    _SettingsStore.default.unwatchSetting(this.layoutRef);

    _WidgetStore.default.instance.off(_AsyncStore.UPDATE_EVENT, this.updateFromWidgetStore);
  }

  recalculateRoom(room
  /*: Room*/
  ) {
    const widgets = _WidgetStore.default.instance.getApps(room.roomId);

    if (!widgets?.length) {
      this.byRoom[room.roomId] = {};
      this.emitFor(room);
      return;
    }

    const beforeChanges = JSON.stringify(this.byRoom[room.roomId]);
    const layoutEv = room.currentState.getStateEvents(WIDGET_LAYOUT_EVENT_TYPE, "");

    const legacyPinned = _SettingsStore.default.getValue("Widgets.pinned", room.roomId);

    let userLayout = _SettingsStore.default.getValue("Widgets.layout", room.roomId);

    if (layoutEv && userLayout && userLayout.overrides !== layoutEv.getId()) {
      // For some other layout that we don't really care about. The user can reset this
      // by updating their personal layout.
      userLayout = null;
    }

    const roomLayout
    /*: ILayoutStateEvent*/
    = layoutEv ? layoutEv.getContent() : null; // We essentially just need to find the top container's widgets because we
    // only have two containers. Anything not in the top widget by the end of this
    // function will go into the right container.

    const topWidgets
    /*: IApp[]*/
    = [];
    const rightWidgets
    /*: IApp[]*/
    = [];

    for (const widget of widgets) {
      const stateContainer = roomLayout?.widgets?.[widget.id]?.container;
      const manualContainer = userLayout?.widgets?.[widget.id]?.container;
      const isLegacyPinned = !!legacyPinned?.[widget.id];
      const defaultContainer = _WidgetType.WidgetType.JITSI.matches(widget.type) ? Container.Top : Container.Right;

      if (manualContainer === Container.Right) {
        rightWidgets.push(widget);
      } else if (manualContainer === Container.Top || stateContainer === Container.Top) {
        topWidgets.push(widget);
      } else if (isLegacyPinned && !stateContainer) {
        topWidgets.push(widget);
      } else {
        (defaultContainer === Container.Top ? topWidgets : rightWidgets).push(widget);
      }
    } // Trim to MAX_PINNED


    const runoff = topWidgets.slice(MAX_PINNED);
    rightWidgets.push(...runoff); // Order the widgets in the top container, putting autopinned Jitsi widgets first
    // unless they have a specific order in mind

    topWidgets.sort((a, b) => {
      const layoutA = roomLayout?.widgets?.[a.id];
      const layoutB = roomLayout?.widgets?.[b.id];
      const userLayoutA = userLayout?.widgets?.[a.id];
      const userLayoutB = userLayout?.widgets?.[b.id]; // Jitsi widgets are defaulted to be the leftmost widget whereas other widgets
      // default to the right side.

      const defaultA = _WidgetType.WidgetType.JITSI.matches(a.type) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const defaultB = _WidgetType.WidgetType.JITSI.matches(b.type) ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const orderA = (0, _numbers.defaultNumber)(userLayoutA?.index, (0, _numbers.defaultNumber)(layoutA?.index, defaultA));
      const orderB = (0, _numbers.defaultNumber)(userLayoutB?.index, (0, _numbers.defaultNumber)(layoutB?.index, defaultB));

      if (orderA === orderB) {
        // We just need a tiebreak
        return a.id.localeCompare(b.id);
      }

      return orderA - orderB;
    }); // Determine width distribution and height of the top container now (the only relevant one)

    const widths
    /*: number[]*/
    = [];
    let maxHeight = null; // null == default

    let doAutobalance = true;

    for (let i = 0; i < topWidgets.length; i++) {
      const widget = topWidgets[i];
      const widgetLayout = roomLayout?.widgets?.[widget.id];
      const userWidgetLayout = userLayout?.widgets?.[widget.id];

      if (Number.isFinite(userWidgetLayout?.width) || Number.isFinite(widgetLayout?.width)) {
        const val = userWidgetLayout?.width || widgetLayout?.width;
        const normalized = (0, _numbers.clamp)(val, MIN_WIDGET_WIDTH_PCT, 100);
        widths.push(normalized);
        doAutobalance = false; // a manual width was specified
      } else {
        widths.push(100); // we'll figure this out later
      }

      if (widgetLayout?.height || userWidgetLayout?.height) {
        const defRoomHeight = (0, _numbers.defaultNumber)(widgetLayout?.height, MIN_WIDGET_HEIGHT_PCT);
        const h = (0, _numbers.defaultNumber)(userWidgetLayout?.height, defRoomHeight);
        maxHeight = Math.max(maxHeight, (0, _numbers.clamp)(h, MIN_WIDGET_HEIGHT_PCT, 100));
      }
    }

    if (doAutobalance) {
      for (let i = 0; i < widths.length; i++) {
        widths[i] = 100 / widths.length;
      }
    } else {
      // If we're not autobalancing then it means that we're trying to make
      // sure that widgets make up exactly 100% of space (not over, not under)
      const difference = (0, _numbers.sum)(...widths) - 100; // positive = over, negative = under

      if (difference < 0) {
        // For a deficit we just fill everything in equally
        for (let i = 0; i < widths.length; i++) {
          widths[i] += Math.abs(difference) / widths.length;
        }
      } else if (difference > 0) {
        // When we're over, we try to scale all the widgets within range first.
        // We clamp values to try and keep ourselves sane and within range.
        for (let i = 0; i < widths.length; i++) {
          widths[i] = (0, _numbers.clamp)(widths[i] - difference / widths.length, MIN_WIDGET_WIDTH_PCT, 100);
        } // If we're still over, find the widgets which have more width than the minimum
        // and balance them out until we're at 100%. This should keep us as close as possible
        // to the intended distributions.
        //
        // Note: if we ever decide to set a minimum which is larger than 100%/MAX_WIDGETS then
        // we probably have other issues - this code assumes we don't do that.


        const toReclaim = (0, _numbers.sum)(...widths) - 100;

        if (toReclaim > 0) {
          const largeIndices = widths.map((v, i) => [i, v]).filter(p => p[1] > MIN_WIDGET_WIDTH_PCT).map(p => p[0]);

          for (const idx of largeIndices) {
            widths[idx] -= toReclaim / largeIndices.length;
          }
        }
      }
    } // Finally, fill in our cache and update


    this.byRoom[room.roomId] = {};

    if (topWidgets.length) {
      this.byRoom[room.roomId][Container.Top] = {
        ordered: topWidgets,
        distributions: widths,
        height: maxHeight
      };
    }

    if (rightWidgets.length) {
      this.byRoom[room.roomId][Container.Right] = {
        ordered: rightWidgets
      };
    }

    const afterChanges = JSON.stringify(this.byRoom[room.roomId]);

    if (afterChanges !== beforeChanges) {
      this.emitFor(room);
    }
  }

  getContainerWidgets(room
  /*: Room*/
  , container
  /*: Container*/
  )
  /*: IApp[]*/
  {
    return this.byRoom[room.roomId]?.[container]?.ordered || [];
  }

  isInContainer(room
  /*: Room*/
  , widget
  /*: IApp*/
  , container
  /*: Container*/
  )
  /*: boolean*/
  {
    return this.getContainerWidgets(room, container).some(w => w.id === widget.id);
  }

  canAddToContainer(room
  /*: Room*/
  , container
  /*: Container*/
  )
  /*: boolean*/
  {
    return this.getContainerWidgets(room, container).length < MAX_PINNED;
  }

  getResizerDistributions(room
  /*: Room*/
  , container
  /*: Container*/
  )
  /*: string[]*/
  {
    // yes, string.
    let distributions = this.byRoom[room.roomId]?.[container]?.distributions;
    if (!distributions || distributions.length < 2) return []; // The distributor actually expects to be fed N-1 sizes and expands the middle section
    // instead of the edges. Therefore, we need to return [0] when there's two widgets or
    // [0, 2] when there's three (skipping [1] because it's irrelevant).

    if (distributions.length === 2) distributions = [distributions[0]];
    if (distributions.length === 3) distributions = [distributions[0], distributions[2]];
    return distributions.map(d => `${d.toFixed(1)}%`); // actual percents - these are decoded later
  }

  setResizerDistributions(room
  /*: Room*/
  , container
  /*: Container*/
  , distributions
  /*: string[]*/
  ) {
    if (container !== Container.Top) return; // ignore - not relevant

    const numbers = distributions.map(d => Number(Number(d.substring(0, d.length - 1)).toFixed(1)));
    const widgets = this.getContainerWidgets(room, container); // From getResizerDistributions, we need to fill in the middle size if applicable.

    const remaining = 100 - (0, _numbers.sum)(...numbers);
    if (numbers.length === 2) numbers.splice(1, 0, remaining);
    if (numbers.length === 1) numbers.push(remaining);
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: numbers[i],
        index: i,
        height: this.byRoom[room.roomId]?.[container]?.height || MIN_WIDGET_HEIGHT_PCT
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  getContainerHeight(room
  /*: Room*/
  , container
  /*: Container*/
  )
  /*: number*/
  {
    return this.byRoom[room.roomId]?.[container]?.height; // let the default get returned if needed
  }

  setContainerHeight(room
  /*: Room*/
  , container
  /*: Container*/
  , height
  /*: number*/
  ) {
    const widgets = this.getContainerWidgets(room, container);
    const widths = this.byRoom[room.roomId]?.[container]?.distributions;
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: widths[i],
        index: i,
        height: height
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  moveWithinContainer(room
  /*: Room*/
  , container
  /*: Container*/
  , widget
  /*: IApp*/
  , delta
  /*: number*/
  ) {
    const widgets = (0, _arrays.arrayFastClone)(this.getContainerWidgets(room, container));
    const currentIdx = widgets.findIndex(w => w.id === widget.id);
    if (currentIdx < 0) return; // no change needed

    widgets.splice(currentIdx, 1); // remove existing widget

    const newIdx = (0, _numbers.clamp)(currentIdx + delta, 0, widgets.length);
    widgets.splice(newIdx, 0, widget);
    const widths = this.byRoom[room.roomId]?.[container]?.distributions;
    const height = this.byRoom[room.roomId]?.[container]?.height;
    const localLayout = {};
    widgets.forEach((w, i) => {
      localLayout[w.id] = {
        container: container,
        width: widths[i],
        index: i,
        height: height
      };
    });
    this.updateUserLayout(room, localLayout);
  }

  moveToContainer(room
  /*: Room*/
  , widget
  /*: IApp*/
  , toContainer
  /*: Container*/
  ) {
    const allWidgets = this.getAllWidgets(room);
    if (!allWidgets.some(([w]) => w.id === widget.id)) return; // invalid

    this.updateUserLayout(room, {
      [widget.id]: {
        container: toContainer
      }
    });
  }

  canCopyLayoutToRoom(room
  /*: Room*/
  )
  /*: boolean*/
  {
    if (!this.matrixClient) return false; // not ready yet

    return room.currentState.maySendStateEvent(WIDGET_LAYOUT_EVENT_TYPE, this.matrixClient.getUserId());
  }

  copyLayoutToRoom(room
  /*: Room*/
  ) {
    const allWidgets = this.getAllWidgets(room);
    const evContent
    /*: ILayoutStateEvent*/
    = {
      widgets: {}
    };

    for (const [widget, container] of allWidgets) {
      evContent.widgets[widget.id] = {
        container
      };

      if (container === Container.Top) {
        const containerWidgets = this.getContainerWidgets(room, container);
        const idx = containerWidgets.findIndex(w => w.id === widget.id);
        const widths = this.byRoom[room.roomId]?.[container]?.distributions;
        const height = this.byRoom[room.roomId]?.[container]?.height;
        evContent.widgets[widget.id] = _objectSpread(_objectSpread({}, evContent.widgets[widget.id]), {}, {
          height: height ? Math.round(height) : null,
          width: widths[idx] ? Math.round(widths[idx]) : null,
          index: idx
        });
      }
    }

    this.matrixClient.sendStateEvent(room.roomId, WIDGET_LAYOUT_EVENT_TYPE, evContent, "");
  }

  getAllWidgets(room
  /*: Room*/
  )
  /*: [IApp, Container][]*/
  {
    const containers = this.byRoom[room.roomId];
    if (!containers) return [];
    const ret = [];

    for (const container of Object.keys(containers)) {
      const widgets = containers[container].ordered;

      for (const widget of widgets) {
        ret.push([widget, container]);
      }
    }

    return ret;
  }

  updateUserLayout(room
  /*: Room*/
  , newLayout
  /*: IWidgetLayouts*/
  ) {
    // Polyfill any missing widgets
    const allWidgets = this.getAllWidgets(room);

    for (const [widget, container] of allWidgets) {
      const containerWidgets = this.getContainerWidgets(room, container);
      const idx = containerWidgets.findIndex(w => w.id === widget.id);
      const widths = this.byRoom[room.roomId]?.[container]?.distributions;

      if (!newLayout[widget.id]) {
        newLayout[widget.id] = {
          container: container,
          index: idx,
          height: this.byRoom[room.roomId]?.[container]?.height,
          width: widths?.[idx]
        };
      }
    }

    const layoutEv = room.currentState.getStateEvents(WIDGET_LAYOUT_EVENT_TYPE, "");

    _SettingsStore.default.setValue("Widgets.layout", room.roomId, _SettingLevel.SettingLevel.ROOM_ACCOUNT, {
      overrides: layoutEv?.getId(),
      widgets: newLayout
    }).catch(() => this.recalculateRoom(room));

    this.recalculateRoom(room); // call to try local echo on changes (the catch above undoes any errors)
  }

}

exports.WidgetLayoutStore = WidgetLayoutStore;
(0, _defineProperty2.default)(WidgetLayoutStore, "internalInstance", void 0);
window.mxWidgetLayoutStore = WidgetLayoutStore.instance;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvd2lkZ2V0cy9XaWRnZXRMYXlvdXRTdG9yZS50cyJdLCJuYW1lcyI6WyJXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUiLCJDb250YWluZXIiLCJNQVhfUElOTkVEIiwiTUlOX1dJREdFVF9XSURUSF9QQ1QiLCJNSU5fV0lER0VUX0hFSUdIVF9QQ1QiLCJXaWRnZXRMYXlvdXRTdG9yZSIsIlJlYWR5V2F0Y2hpbmdTdG9yZSIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdERpc3BhdGNoZXIiLCJieVJvb20iLCJyb29tIiwibWF0cml4Q2xpZW50IiwiZ2V0VmlzaWJsZVJvb21zIiwicmVjYWxjdWxhdGVSb29tIiwicm9vbUlkIiwiZ2V0Um9vbSIsInVwZGF0ZUFsbFJvb21zIiwiZXYiLCJnZXRUeXBlIiwiZ2V0Um9vbUlkIiwic2V0dGluZ05hbWUiLCJpbnN0YW5jZSIsImludGVybmFsSW5zdGFuY2UiLCJlbWlzc2lvbkZvclJvb20iLCJlbWl0Rm9yIiwiZW1pdCIsIm9uUmVhZHkiLCJvbiIsInVwZGF0ZVJvb21Gcm9tU3RhdGUiLCJwaW5uZWRSZWYiLCJTZXR0aW5nc1N0b3JlIiwid2F0Y2hTZXR0aW5nIiwidXBkYXRlRnJvbVNldHRpbmdzIiwibGF5b3V0UmVmIiwiV2lkZ2V0U3RvcmUiLCJVUERBVEVfRVZFTlQiLCJ1cGRhdGVGcm9tV2lkZ2V0U3RvcmUiLCJvbk5vdFJlYWR5IiwidW53YXRjaFNldHRpbmciLCJvZmYiLCJ3aWRnZXRzIiwiZ2V0QXBwcyIsImxlbmd0aCIsImJlZm9yZUNoYW5nZXMiLCJKU09OIiwic3RyaW5naWZ5IiwibGF5b3V0RXYiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImxlZ2FjeVBpbm5lZCIsImdldFZhbHVlIiwidXNlckxheW91dCIsIm92ZXJyaWRlcyIsImdldElkIiwicm9vbUxheW91dCIsImdldENvbnRlbnQiLCJ0b3BXaWRnZXRzIiwicmlnaHRXaWRnZXRzIiwid2lkZ2V0Iiwic3RhdGVDb250YWluZXIiLCJpZCIsImNvbnRhaW5lciIsIm1hbnVhbENvbnRhaW5lciIsImlzTGVnYWN5UGlubmVkIiwiZGVmYXVsdENvbnRhaW5lciIsIldpZGdldFR5cGUiLCJKSVRTSSIsIm1hdGNoZXMiLCJ0eXBlIiwiVG9wIiwiUmlnaHQiLCJwdXNoIiwicnVub2ZmIiwic2xpY2UiLCJzb3J0IiwiYSIsImIiLCJsYXlvdXRBIiwibGF5b3V0QiIsInVzZXJMYXlvdXRBIiwidXNlckxheW91dEIiLCJkZWZhdWx0QSIsIk51bWJlciIsIk1JTl9TQUZFX0lOVEVHRVIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiZGVmYXVsdEIiLCJvcmRlckEiLCJpbmRleCIsIm9yZGVyQiIsImxvY2FsZUNvbXBhcmUiLCJ3aWR0aHMiLCJtYXhIZWlnaHQiLCJkb0F1dG9iYWxhbmNlIiwiaSIsIndpZGdldExheW91dCIsInVzZXJXaWRnZXRMYXlvdXQiLCJpc0Zpbml0ZSIsIndpZHRoIiwidmFsIiwibm9ybWFsaXplZCIsImhlaWdodCIsImRlZlJvb21IZWlnaHQiLCJoIiwiTWF0aCIsIm1heCIsImRpZmZlcmVuY2UiLCJhYnMiLCJ0b1JlY2xhaW0iLCJsYXJnZUluZGljZXMiLCJtYXAiLCJ2IiwiZmlsdGVyIiwicCIsImlkeCIsIm9yZGVyZWQiLCJkaXN0cmlidXRpb25zIiwiYWZ0ZXJDaGFuZ2VzIiwiZ2V0Q29udGFpbmVyV2lkZ2V0cyIsImlzSW5Db250YWluZXIiLCJzb21lIiwidyIsImNhbkFkZFRvQ29udGFpbmVyIiwiZ2V0UmVzaXplckRpc3RyaWJ1dGlvbnMiLCJkIiwidG9GaXhlZCIsInNldFJlc2l6ZXJEaXN0cmlidXRpb25zIiwibnVtYmVycyIsInN1YnN0cmluZyIsInJlbWFpbmluZyIsInNwbGljZSIsImxvY2FsTGF5b3V0IiwiZm9yRWFjaCIsInVwZGF0ZVVzZXJMYXlvdXQiLCJnZXRDb250YWluZXJIZWlnaHQiLCJzZXRDb250YWluZXJIZWlnaHQiLCJtb3ZlV2l0aGluQ29udGFpbmVyIiwiZGVsdGEiLCJjdXJyZW50SWR4IiwiZmluZEluZGV4IiwibmV3SWR4IiwibW92ZVRvQ29udGFpbmVyIiwidG9Db250YWluZXIiLCJhbGxXaWRnZXRzIiwiZ2V0QWxsV2lkZ2V0cyIsImNhbkNvcHlMYXlvdXRUb1Jvb20iLCJtYXlTZW5kU3RhdGVFdmVudCIsImdldFVzZXJJZCIsImNvcHlMYXlvdXRUb1Jvb20iLCJldkNvbnRlbnQiLCJjb250YWluZXJXaWRnZXRzIiwicm91bmQiLCJzZW5kU3RhdGVFdmVudCIsImNvbnRhaW5lcnMiLCJyZXQiLCJPYmplY3QiLCJrZXlzIiwibmV3TGF5b3V0Iiwic2V0VmFsdWUiLCJTZXR0aW5nTGV2ZWwiLCJST09NX0FDQ09VTlQiLCJjYXRjaCIsIndpbmRvdyIsIm14V2lkZ2V0TGF5b3V0U3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7QUFFTyxNQUFNQSx3QkFBd0IsR0FBRywyQkFBakM7O0lBRUtDLFM7OztXQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztHQUFBQSxTLHlCQUFBQSxTOztBQTlCWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBNkRBO0FBQ08sTUFBTUMsVUFBVSxHQUFHLENBQW5CLEMsQ0FFUDtBQUNBO0FBQ0E7OztBQUNBLE1BQU1DLG9CQUFvQixHQUFHLEVBQTdCLEMsQ0FBaUM7O0FBQ2pDLE1BQU1DLHFCQUFxQixHQUFHLENBQTlCLEMsQ0FBaUM7O0FBRTFCLE1BQU1DLGlCQUFOLFNBQWdDQyxzQ0FBaEMsQ0FBbUQ7QUFpQjlDQyxFQUFBQSxXQUFSLEdBQXNCO0FBQ2xCLFVBQU1DLG1CQUFOO0FBRGtCLGtEQUxsQixFQUtrQjtBQUFBO0FBQUE7QUFBQSwwREFvQ0csTUFBTTtB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QTNCLEdBQXVDdUMsTUFINUI7QUFJbkJILFVBQUFBLEtBQUssRUFBRVAsTUFBTSxHQUFHdUIsR0FBSDtBQUpNLFNBQXZCO0FBTUg7QUFDSjs7QUFFRCxVQUFNbkUsUUFBUSxHQUFHcEMsSUFBSSxDQUFDcUMsWUFBTCxDQUFrQkMsY0FBbEIsQ0FBaUNoRCx3QkFBakMsRUFBMkQsRUFBM0QsQ0FBakI7O0FBQ0E4QiwyQkFBYytILFFBQWQsQ0FBdUIsZ0JBQXZCLEVBQXlDbkosSUFBSSxDQUFDSSxNQUE5QyxFQUFzRGdKLDJCQUFhQyxZQUFuRSxFQUFpRjtBQUM3RTNHLE1BQUFBLFNBQVMsRUFBRU4sUUFBUSxFQUFFTyxLQUFWLEVBRGtFO0FBRTdFYixNQUFBQSxPQUFPLEVBQUVvSDtBQUZvRSxLQUFqRixFQUdHSSxLQUhILENBR1MsTUFBTSxLQUFLbkosZUFBTCxDQUFxQkgsSUFBckIsQ0FIZjs7QUFJQSxTQUFLRyxlQUFMLENBQXFCSCxJQUFyQixFQXRCNEQsQ0FzQmhDO0FBQy9COztBQWxacUQ7Ozs4QkFBN0NMLGlCO0FBcVpiNEosTUFBTSxDQUFDQyxtQkFBUCxHQUE2QjdKLGlCQUFpQixDQUFDZ0IsUUFBL0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogQ29weXJpZ2h0IDIwMjEgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgeyBSb29tIH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9yb29tXCI7XG5pbXBvcnQgV2lkZ2V0U3RvcmUsIHsgSUFwcCB9IGZyb20gXCIuLi9XaWRnZXRTdG9yZVwiO1xuaW1wb3J0IHsgV2lkZ2V0VHlwZSB9IGZyb20gXCIuLi8uLi93aWRnZXRzL1dpZGdldFR5cGVcIjtcbmltcG9ydCB7IGNsYW1wLCBkZWZhdWx0TnVtYmVyLCBzdW0gfSBmcm9tIFwiLi4vLi4vdXRpbHMvbnVtYmVyc1wiO1xuaW1wb3J0IGRlZmF1bHREaXNwYXRjaGVyIGZyb20gXCIuLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXJcIjtcbmltcG9ydCB7IFJlYWR5V2F0Y2hpbmdTdG9yZSB9IGZyb20gXCIuLi9SZWFkeVdhdGNoaW5nU3RvcmVcIjtcbmltcG9ydCB7IE1hdHJpeEV2ZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL21vZGVscy9ldmVudFwiO1xuaW1wb3J0IHsgU2V0dGluZ0xldmVsIH0gZnJvbSBcIi4uLy4uL3NldHRpbmdzL1NldHRpbmdMZXZlbFwiO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5pbXBvcnQgeyBVUERBVEVfRVZFTlQgfSBmcm9tIFwiLi4vQXN5bmNTdG9yZVwiO1xuXG5leHBvcnQgY29uc3QgV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFID0gXCJpby5lbGVtZW50LndpZGdldHMubGF5b3V0XCI7XG5cbmV4cG9ydCBlbnVtIENvbnRhaW5lciB7XG4gICAgLy8gXCJUb3BcIiBpcyB0aGUgYXBwIGRyYXdlciwgYW5kIGN1cnJlbnRseSB0aGUgb25seSBzZW5zaWJsZSB2YWx1ZS5cbiAgICBUb3AgPSBcInRvcFwiLFxuXG4gICAgLy8gXCJSaWdodFwiIGlzIHRoZSByaWdodCBwYW5lbCwgYW5kIHRoZSBkZWZhdWx0IGZvciB3aWRnZXRzLiBTZXR0aW5nXG4gICAgLy8gdGhpcyBhcyBhIGNvbnRhaW5lciBvbiBhIHdpZGdldCBpcyBlc3NlbnRpYWxseSBsaWtlIHNheWluZyBcIm5vXG4gICAgLy8gY2hhbmdlcyBuZWVkZWRcIiwgdGhvdWdoIHRoaXMgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICAgIFJpZ2h0ID0gXCJyaWdodFwiLFxuXG4gICAgLy8gLi4uIG1vcmUgYXMgbmVlZGVkLiBOb3RlIHRoYXQgbW9zdCBvZiB0aGlzIGNvZGUgYXNzdW1lcyB0aGF0IHRoZXJlXG4gICAgLy8gYXJlIG9ubHkgdHdvIGNvbnRhaW5lcnMsIGFuZCB0aGF0IG9ubHkgdGhlIHRvcCBjb250YWluZXIgaXMgc3BlY2lhbC5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJU3RvcmVkTGF5b3V0IHtcbiAgICAvLyBXaGVyZSB0byBzdG9yZSB0aGUgd2lkZ2V0LiBSZXF1aXJlZC5cbiAgICBjb250YWluZXI6IENvbnRhaW5lcjtcblxuICAgIC8vIFRoZSBpbmRleCAob3JkZXIpIHRvIHBvc2l0aW9uIHRoZSB3aWRnZXRzIGluLiBPbmx5IGFwcGxpZXMgZm9yXG4gICAgLy8gb3JkZXJlZCBjb250YWluZXJzIChsaWtlIHRoZSB0b3AgY29udGFpbmVyKS4gU21hbGxlciBudW1iZXJzIGZpcnN0LFxuICAgIC8vIGFuZCBjb25mbGljdHMgcmVzb2x2ZWQgYnkgY29tcGFyaW5nIHdpZGdldCBJRHMuXG4gICAgaW5kZXg/OiBudW1iZXI7XG5cbiAgICAvLyBQZXJjZW50YWdlIChpbnRlZ2VyKSBmb3IgcmVsYXRpdmUgd2lkdGggb2YgdGhlIGNvbnRhaW5lciB0byBjb25zdW1lLlxuICAgIC8vIENsYW1wZWQgdG8gMC0xMDAgYW5kIG1heSBoYXZlIG1pbmltdW1zIGltcG9zZWQgdXBvbiBpdC4gT25seSBhcHBsaWVzXG4gICAgLy8gdG8gY29udGFpbmVycyB3aGljaCBzdXBwb3J0IGlubmVyIHJlc2l6aW5nIChjdXJyZW50bHkgb25seSB0aGUgdG9wXG4gICAgLy8gY29udGFpbmVyKS5cbiAgICB3aWR0aD86IG51bWJlcjtcblxuICAgIC8vIFBlcmNlbnRhZ2UgKGludGVnZXIpIGZvciByZWxhdGl2ZSBoZWlnaHQgb2YgdGhlIGNvbnRhaW5lci4gTm90ZSB0aGF0XG4gICAgLy8gdGhpcyBvbmx5IGFwcGxpZXMgdG8gdGhlIHRvcCBjb250YWluZXIgY3VycmVudGx5LCBhbmQgdGhhdCBjb250YWluZXJcbiAgICAvLyB3aWxsIHRha2UgdGhlIGhpZ2hlc3QgdmFsdWUgYW1vbmcgd2lkZ2V0cyBpbiB0aGUgY29udGFpbmVyLiBDbGFtcGVkXG4gICAgLy8gdG8gMC0xMDAgYW5kIG1heSBoYXZlIG1pbmltdW1zIGltcG9zZWQgb24gaXQuXG4gICAgaGVpZ2h0PzogbnVtYmVyO1xuXG4gICAgLy8gVE9ETzogW0RlZmVycmVkXSBNYXhpbWl6aW5nIChmdWxsc2NyZWVuKSB3aWRnZXRzIGJ5IGRlZmF1bHQuXG59XG5cbmludGVyZmFjZSBJV2lkZ2V0TGF5b3V0cyB7XG4gICAgW3dpZGdldElkOiBzdHJpbmddOiBJU3RvcmVkTGF5b3V0O1xufVxuXG5pbnRlcmZhY2UgSUxheW91dFN0YXRlRXZlbnQge1xuICAgIC8vIFRPRE86IFtEZWZlcnJlZF0gRm9yY2VkIGxheW91dCAoZml4ZWQgd2l0aCBubyBjaGFuZ2VzKVxuXG4gICAgLy8gVGhlIHdpZGdldCBsYXlvdXRzLlxuICAgIHdpZGdldHM6IElXaWRnZXRMYXlvdXRzO1xufVxuXG5pbnRlcmZhY2UgSUxheW91dFNldHRpbmdzIGV4dGVuZHMgSUxheW91dFN0YXRlRXZlbnQge1xuICAgIG92ZXJyaWRlcz86IHN0cmluZzsgLy8gZXZlbnQgSUQgZm9yIGxheW91dCBzdGF0ZSBldmVudCwgaWYgcHJlc2VudFxufVxuXG4vLyBEZXYgbm90ZTogXCJQaW5uZWRcIiB3aWRnZXRzIGFyZSBvbmVzIGluIHRoZSB0b3AgY29udGFpbmVyLlxuZXhwb3J0IGNvbnN0IE1BWF9QSU5ORUQgPSAzO1xuXG4vLyBUaGVzZSB0d28gYXJlIHdob2xlIHBlcmNlbnRhZ2VzIGFuZCBkb24ndCByZWFsbHkgbWVhbiBhbnl0aGluZy4gTGF0ZXIgdmFsdWVzIHdpbGwgZGVjaWRlXG4vLyBtaW5pbXVtLCBidXQgdGhlc2UgaGVscCBkZXRlcm1pbmUgcHJvcG9ydGlvbnMgZHVyaW5nIG91ciBjYWxjdWxhdGlvbnMgaGVyZS4gSW4gZmFjdCwgdGhlc2Vcbi8vIHZhbHVlcyBzaG91bGQgYmUgKnNtYWxsZXIqIHRoYW4gdGhlIGFjdHVhbCBtaW5pbXVtcyBpbXBvc2VkIGJ5IGxhdGVyIGNvbXBvbmVudHMuXG5jb25zdCBNSU5fV0lER0VUX1dJRFRIX1BDVCA9IDEwOyAvLyAxMCVcbmNvbnN0IE1JTl9XSURHRVRfSEVJR0hUX1BDVCA9IDI7IC8vIDIlXG5cbmV4cG9ydCBjbGFzcyBXaWRnZXRMYXlvdXRTdG9yZSBleHRlbmRzIFJlYWR5V2F0Y2hpbmdTdG9yZSB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50ZXJuYWxJbnN0YW5jZTogV2lkZ2V0TGF5b3V0U3RvcmU7XG5cbiAgICBwcml2YXRlIGJ5Um9vbToge1xuICAgICAgICBbcm9vbUlkOiBzdHJpbmddOiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIC0gVFMgd2FudHMgYSBzdHJpbmcga2V5LCBidXQgd2Uga25vdyBiZXR0ZXJcbiAgICAgICAgICAgIFtjb250YWluZXI6IENvbnRhaW5lcl06IHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiBJQXBwW107XG4gICAgICAgICAgICAgICAgaGVpZ2h0PzogbnVtYmVyO1xuICAgICAgICAgICAgICAgIGRpc3RyaWJ1dGlvbnM/OiBudW1iZXJbXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfSA9IHt9O1xuXG4gICAgcHJpdmF0ZSBwaW5uZWRSZWY6IHN0cmluZztcbiAgICBwcml2YXRlIGxheW91dFJlZjogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoZGVmYXVsdERpc3BhdGNoZXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IFdpZGdldExheW91dFN0b3JlIHtcbiAgICAgICAgaWYgKCFXaWRnZXRMYXlvdXRTdG9yZS5pbnRlcm5hbEluc3RhbmNlKSB7XG4gICAgICAgICAgICBXaWRnZXRMYXlvdXRTdG9yZS5pbnRlcm5hbEluc3RhbmNlID0gbmV3IFdpZGdldExheW91dFN0b3JlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFdpZGdldExheW91dFN0b3JlLmludGVybmFsSW5zdGFuY2U7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBlbWlzc2lvbkZvclJvb20ocm9vbTogUm9vbSk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBgdXBkYXRlXyR7cm9vbS5yb29tSWR9YDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVtaXRGb3Iocm9vbTogUm9vbSkge1xuICAgICAgICB0aGlzLmVtaXQoV2lkZ2V0TGF5b3V0U3RvcmUuZW1pc3Npb25Gb3JSb29tKHJvb20pKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25SZWFkeSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZUFsbFJvb21zKCk7XG5cbiAgICAgICAgdGhpcy5tYXRyaXhDbGllbnQub24oXCJSb29tU3RhdGUuZXZlbnRzXCIsIHRoaXMudXBkYXRlUm9vbUZyb21TdGF0ZSk7XG4gICAgICAgIHRoaXMucGlubmVkUmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJXaWRnZXRzLnBpbm5lZFwiLCBudWxsLCB0aGlzLnVwZGF0ZUZyb21TZXR0aW5ncyk7XG4gICAgICAgIHRoaXMubGF5b3V0UmVmID0gU2V0dGluZ3NTdG9yZS53YXRjaFNldHRpbmcoXCJXaWRnZXRzLmxheW91dFwiLCBudWxsLCB0aGlzLnVwZGF0ZUZyb21TZXR0aW5ncyk7XG4gICAgICAgIFdpZGdldFN0b3JlLmluc3RhbmNlLm9uKFVQREFURV9FVkVOVCwgdGhpcy51cGRhdGVGcm9tV2lkZ2V0U3RvcmUpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMuYnlSb29tID0ge307XG5cbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnBpbm5lZFJlZik7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5sYXlvdXRSZWYpO1xuICAgICAgICBXaWRnZXRTdG9yZS5pbnN0YW5jZS5vZmYoVVBEQVRFX0VWRU5ULCB0aGlzLnVwZGF0ZUZyb21XaWRnZXRTdG9yZSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVBbGxSb29tcyA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5ieVJvb20gPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCByb29tIG9mIHRoaXMubWF0cml4Q2xpZW50LmdldFZpc2libGVSb29tcygpKSB7XG4gICAgICAgICAgICB0aGlzLnJlY2FsY3VsYXRlUm9vbShyb29tKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZUZyb21XaWRnZXRTdG9yZSA9IChyb29tSWQ/OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbSA9IHRoaXMubWF0cml4Q2xpZW50LmdldFJvb20ocm9vbUlkKTtcbiAgICAgICAgICAgIGlmIChyb29tKSB0aGlzLnJlY2FsY3VsYXRlUm9vbShyb29tKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQWxsUm9vbXMoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHVwZGF0ZVJvb21Gcm9tU3RhdGUgPSAoZXY6IE1hdHJpeEV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldi5nZXRUeXBlKCkgIT09IFdJREdFVF9MQVlPVVRfRVZFTlRfVFlQRSkgcmV0dXJuO1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5tYXRyaXhDbGllbnQuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG4gICAgICAgIGlmIChyb29tKSB0aGlzLnJlY2FsY3VsYXRlUm9vbShyb29tKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVGcm9tU2V0dGluZ3MgPSAoc2V0dGluZ05hbWU6IHN0cmluZywgcm9vbUlkOiBzdHJpbmcgLyogYW5kIG90aGVyIHN0dWZmICovKSA9PiB7XG4gICAgICAgIGlmIChyb29tSWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLm1hdHJpeENsaWVudC5nZXRSb29tKHJvb21JZCk7XG4gICAgICAgICAgICBpZiAocm9vbSkgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUFsbFJvb21zKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSByZWNhbGN1bGF0ZVJvb20ocm9vbTogUm9vbSkge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gV2lkZ2V0U3RvcmUuaW5zdGFuY2UuZ2V0QXBwcyhyb29tLnJvb21JZCk7XG4gICAgICAgIGlmICghd2lkZ2V0cz8ubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuZW1pdEZvcihyb29tKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJlZm9yZUNoYW5nZXMgPSBKU09OLnN0cmluZ2lmeSh0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0pO1xuXG4gICAgICAgIGNvbnN0IGxheW91dEV2ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLCBcIlwiKTtcbiAgICAgICAgY29uc3QgbGVnYWN5UGlubmVkID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIldpZGdldHMucGlubmVkXCIsIHJvb20ucm9vbUlkKTtcbiAgICAgICAgbGV0IHVzZXJMYXlvdXQgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlPElMYXlvdXRTZXR0aW5ncz4oXCJXaWRnZXRzLmxheW91dFwiLCByb29tLnJvb21JZCk7XG5cbiAgICAgICAgaWYgKGxheW91dEV2ICYmIHVzZXJMYXlvdXQgJiYgdXNlckxheW91dC5vdmVycmlkZXMgIT09IGxheW91dEV2LmdldElkKCkpIHtcbiAgICAgICAgICAgIC8vIEZvciBzb21lIG90aGVyIGxheW91dCB0aGF0IHdlIGRvbid0IHJlYWxseSBjYXJlIGFib3V0LiBUaGUgdXNlciBjYW4gcmVzZXQgdGhpc1xuICAgICAgICAgICAgLy8gYnkgdXBkYXRpbmcgdGhlaXIgcGVyc29uYWwgbGF5b3V0LlxuICAgICAgICAgICAgdXNlckxheW91dCA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByb29tTGF5b3V0OiBJTGF5b3V0U3RhdGVFdmVudCA9IGxheW91dEV2ID8gbGF5b3V0RXYuZ2V0Q29udGVudCgpIDogbnVsbDtcblxuICAgICAgICAvLyBXZSBlc3NlbnRpYWxseSBqdXN0IG5lZWQgdG8gZmluZCB0aGUgdG9wIGNvbnRhaW5lcidzIHdpZGdldHMgYmVjYXVzZSB3ZVxuICAgICAgICAvLyBvbmx5IGhhdmUgdHdvIGNvbnRhaW5lcnMuIEFueXRoaW5nIG5vdCBpbiB0aGUgdG9wIHdpZGdldCBieSB0aGUgZW5kIG9mIHRoaXNcbiAgICAgICAgLy8gZnVuY3Rpb24gd2lsbCBnbyBpbnRvIHRoZSByaWdodCBjb250YWluZXIuXG4gICAgICAgIGNvbnN0IHRvcFdpZGdldHM6IElBcHBbXSA9IFtdO1xuICAgICAgICBjb25zdCByaWdodFdpZGdldHM6IElBcHBbXSA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHdpZGdldCBvZiB3aWRnZXRzKSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0ZUNvbnRhaW5lciA9IHJvb21MYXlvdXQ/LndpZGdldHM/Llt3aWRnZXQuaWRdPy5jb250YWluZXI7XG4gICAgICAgICAgICBjb25zdCBtYW51YWxDb250YWluZXIgPSB1c2VyTGF5b3V0Py53aWRnZXRzPy5bd2lkZ2V0LmlkXT8uY29udGFpbmVyO1xuICAgICAgICAgICAgY29uc3QgaXNMZWdhY3lQaW5uZWQgPSAhIWxlZ2FjeVBpbm5lZD8uW3dpZGdldC5pZF07XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0Q29udGFpbmVyID0gV2lkZ2V0VHlwZS5KSVRTSS5tYXRjaGVzKHdpZGdldC50eXBlKSA/IENvbnRhaW5lci5Ub3AgOiBDb250YWluZXIuUmlnaHQ7XG5cbiAgICAgICAgICAgIGlmIChtYW51YWxDb250YWluZXIgPT09IENvbnRhaW5lci5SaWdodCkge1xuICAgICAgICAgICAgICAgIHJpZ2h0V2lkZ2V0cy5wdXNoKHdpZGdldCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1hbnVhbENvbnRhaW5lciA9PT0gQ29udGFpbmVyLlRvcCB8fCBzdGF0ZUNvbnRhaW5lciA9PT0gQ29udGFpbmVyLlRvcCkge1xuICAgICAgICAgICAgICAgIHRvcFdpZGdldHMucHVzaCh3aWRnZXQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0xlZ2FjeVBpbm5lZCAmJiAhc3RhdGVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB0b3BXaWRnZXRzLnB1c2god2lkZ2V0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKGRlZmF1bHRDb250YWluZXIgPT09IENvbnRhaW5lci5Ub3AgPyB0b3BXaWRnZXRzIDogcmlnaHRXaWRnZXRzKS5wdXNoKHdpZGdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcmltIHRvIE1BWF9QSU5ORURcbiAgICAgICAgY29uc3QgcnVub2ZmID0gdG9wV2lkZ2V0cy5zbGljZShNQVhfUElOTkVEKTtcbiAgICAgICAgcmlnaHRXaWRnZXRzLnB1c2goLi4ucnVub2ZmKTtcblxuICAgICAgICAvLyBPcmRlciB0aGUgd2lkZ2V0cyBpbiB0aGUgdG9wIGNvbnRhaW5lciwgcHV0dGluZyBhdXRvcGlubmVkIEppdHNpIHdpZGdldHMgZmlyc3RcbiAgICAgICAgLy8gdW5sZXNzIHRoZXkgaGF2ZSBhIHNwZWNpZmljIG9yZGVyIGluIG1pbmRcbiAgICAgICAgdG9wV2lkZ2V0cy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBsYXlvdXRBID0gcm9vbUxheW91dD8ud2lkZ2V0cz8uW2EuaWRdO1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0QiA9IHJvb21MYXlvdXQ/LndpZGdldHM/LltiLmlkXTtcblxuICAgICAgICAgICAgY29uc3QgdXNlckxheW91dEEgPSB1c2VyTGF5b3V0Py53aWRnZXRzPy5bYS5pZF07XG4gICAgICAgICAgICBjb25zdCB1c2VyTGF5b3V0QiA9IHVzZXJMYXlvdXQ/LndpZGdldHM/LltiLmlkXTtcblxuICAgICAgICAgICAgLy8gSml0c2kgd2lkZ2V0cyBhcmUgZGVmYXVsdGVkIHRvIGJlIHRoZSBsZWZ0bW9zdCB3aWRnZXQgd2hlcmVhcyBvdGhlciB3aWRnZXRzXG4gICAgICAgICAgICAvLyBkZWZhdWx0IHRvIHRoZSByaWdodCBzaWRlLlxuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEEgPSBXaWRnZXRUeXBlLkpJVFNJLm1hdGNoZXMoYS50eXBlKSA/IE51bWJlci5NSU5fU0FGRV9JTlRFR0VSIDogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0QiA9IFdpZGdldFR5cGUuSklUU0kubWF0Y2hlcyhiLnR5cGUpID8gTnVtYmVyLk1JTl9TQUZFX0lOVEVHRVIgOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUjtcblxuICAgICAgICAgICAgY29uc3Qgb3JkZXJBID0gZGVmYXVsdE51bWJlcih1c2VyTGF5b3V0QT8uaW5kZXgsIGRlZmF1bHROdW1iZXIobGF5b3V0QT8uaW5kZXgsIGRlZmF1bHRBKSk7XG4gICAgICAgICAgICBjb25zdCBvcmRlckIgPSBkZWZhdWx0TnVtYmVyKHVzZXJMYXlvdXRCPy5pbmRleCwgZGVmYXVsdE51bWJlcihsYXlvdXRCPy5pbmRleCwgZGVmYXVsdEIpKTtcblxuICAgICAgICAgICAgaWYgKG9yZGVyQSA9PT0gb3JkZXJCKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UganVzdCBuZWVkIGEgdGllYnJlYWtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pZC5sb2NhbGVDb21wYXJlKGIuaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb3JkZXJBIC0gb3JkZXJCO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBEZXRlcm1pbmUgd2lkdGggZGlzdHJpYnV0aW9uIGFuZCBoZWlnaHQgb2YgdGhlIHRvcCBjb250YWluZXIgbm93ICh0aGUgb25seSByZWxldmFudCBvbmUpXG4gICAgICAgIGNvbnN0IHdpZHRoczogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgbGV0IG1heEhlaWdodCA9IG51bGw7IC8vIG51bGwgPT0gZGVmYXVsdFxuICAgICAgICBsZXQgZG9BdXRvYmFsYW5jZSA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9wV2lkZ2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gdG9wV2lkZ2V0c1tpXTtcbiAgICAgICAgICAgIGNvbnN0IHdpZGdldExheW91dCA9IHJvb21MYXlvdXQ/LndpZGdldHM/Llt3aWRnZXQuaWRdO1xuICAgICAgICAgICAgY29uc3QgdXNlcldpZGdldExheW91dCA9IHVzZXJMYXlvdXQ/LndpZGdldHM/Llt3aWRnZXQuaWRdO1xuXG4gICAgICAgICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHVzZXJXaWRnZXRMYXlvdXQ/LndpZHRoKSB8fCBOdW1iZXIuaXNGaW5pdGUod2lkZ2V0TGF5b3V0Py53aWR0aCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2YWwgPSB1c2VyV2lkZ2V0TGF5b3V0Py53aWR0aCB8fCB3aWRnZXRMYXlvdXQ/LndpZHRoO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWQgPSBjbGFtcCh2YWwsIE1JTl9XSURHRVRfV0lEVEhfUENULCAxMDApO1xuICAgICAgICAgICAgICAgIHdpZHRocy5wdXNoKG5vcm1hbGl6ZWQpO1xuICAgICAgICAgICAgICAgIGRvQXV0b2JhbGFuY2UgPSBmYWxzZTsgLy8gYSBtYW51YWwgd2lkdGggd2FzIHNwZWNpZmllZFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB3aWR0aHMucHVzaCgxMDApOyAvLyB3ZSdsbCBmaWd1cmUgdGhpcyBvdXQgbGF0ZXJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHdpZGdldExheW91dD8uaGVpZ2h0IHx8IHVzZXJXaWRnZXRMYXlvdXQ/LmhlaWdodCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRlZlJvb21IZWlnaHQgPSBkZWZhdWx0TnVtYmVyKHdpZGdldExheW91dD8uaGVpZ2h0LCBNSU5fV0lER0VUX0hFSUdIVF9QQ1QpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGggPSBkZWZhdWx0TnVtYmVyKHVzZXJXaWRnZXRMYXlvdXQ/LmhlaWdodCwgZGVmUm9vbUhlaWdodCk7XG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0ID0gTWF0aC5tYXgobWF4SGVpZ2h0LCBjbGFtcChoLCBNSU5fV0lER0VUX0hFSUdIVF9QQ1QsIDEwMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkb0F1dG9iYWxhbmNlKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHdpZHRoc1tpXSA9IDEwMCAvIHdpZHRocy5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSdyZSBub3QgYXV0b2JhbGFuY2luZyB0aGVuIGl0IG1lYW5zIHRoYXQgd2UncmUgdHJ5aW5nIHRvIG1ha2VcbiAgICAgICAgICAgIC8vIHN1cmUgdGhhdCB3aWRnZXRzIG1ha2UgdXAgZXhhY3RseSAxMDAlIG9mIHNwYWNlIChub3Qgb3Zlciwgbm90IHVuZGVyKVxuICAgICAgICAgICAgY29uc3QgZGlmZmVyZW5jZSA9IHN1bSguLi53aWR0aHMpIC0gMTAwOyAvLyBwb3NpdGl2ZSA9IG92ZXIsIG5lZ2F0aXZlID0gdW5kZXJcbiAgICAgICAgICAgIGlmIChkaWZmZXJlbmNlIDwgMCkge1xuICAgICAgICAgICAgICAgIC8vIEZvciBhIGRlZmljaXQgd2UganVzdCBmaWxsIGV2ZXJ5dGhpbmcgaW4gZXF1YWxseVxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoc1tpXSArPSBNYXRoLmFicyhkaWZmZXJlbmNlKSAvIHdpZHRocy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChkaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIFdoZW4gd2UncmUgb3Zlciwgd2UgdHJ5IHRvIHNjYWxlIGFsbCB0aGUgd2lkZ2V0cyB3aXRoaW4gcmFuZ2UgZmlyc3QuXG4gICAgICAgICAgICAgICAgLy8gV2UgY2xhbXAgdmFsdWVzIHRvIHRyeSBhbmQga2VlcCBvdXJzZWx2ZXMgc2FuZSBhbmQgd2l0aGluIHJhbmdlLlxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoc1tpXSA9IGNsYW1wKHdpZHRoc1tpXSAtIChkaWZmZXJlbmNlIC8gd2lkdGhzLmxlbmd0aCksIE1JTl9XSURHRVRfV0lEVEhfUENULCAxMDApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIHdlJ3JlIHN0aWxsIG92ZXIsIGZpbmQgdGhlIHdpZGdldHMgd2hpY2ggaGF2ZSBtb3JlIHdpZHRoIHRoYW4gdGhlIG1pbmltdW1cbiAgICAgICAgICAgICAgICAvLyBhbmQgYmFsYW5jZSB0aGVtIG91dCB1bnRpbCB3ZSdyZSBhdCAxMDAlLiBUaGlzIHNob3VsZCBrZWVwIHVzIGFzIGNsb3NlIGFzIHBvc3NpYmxlXG4gICAgICAgICAgICAgICAgLy8gdG8gdGhlIGludGVuZGVkIGRpc3RyaWJ1dGlvbnMuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBOb3RlOiBpZiB3ZSBldmVyIGRlY2lkZSB0byBzZXQgYSBtaW5pbXVtIHdoaWNoIGlzIGxhcmdlciB0aGFuIDEwMCUvTUFYX1dJREdFVFMgdGhlblxuICAgICAgICAgICAgICAgIC8vIHdlIHByb2JhYmx5IGhhdmUgb3RoZXIgaXNzdWVzIC0gdGhpcyBjb2RlIGFzc3VtZXMgd2UgZG9uJ3QgZG8gdGhhdC5cbiAgICAgICAgICAgICAgICBjb25zdCB0b1JlY2xhaW0gPSBzdW0oLi4ud2lkdGhzKSAtIDEwMDtcbiAgICAgICAgICAgICAgICBpZiAodG9SZWNsYWltID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXJnZUluZGljZXMgPSB3aWR0aHNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKHYsIGkpID0+IChbaSwgdl0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihwID0+IHBbMV0gPiBNSU5fV0lER0VUX1dJRFRIX1BDVClcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAocCA9PiBwWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBpZHggb2YgbGFyZ2VJbmRpY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aHNbaWR4XSAtPSB0b1JlY2xhaW0gLyBsYXJnZUluZGljZXMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmluYWxseSwgZmlsbCBpbiBvdXIgY2FjaGUgYW5kIHVwZGF0ZVxuICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0gPSB7fTtcbiAgICAgICAgaWYgKHRvcFdpZGdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF1bQ29udGFpbmVyLlRvcF0gPSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZDogdG9wV2lkZ2V0cyxcbiAgICAgICAgICAgICAgICBkaXN0cmlidXRpb25zOiB3aWR0aHMsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBtYXhIZWlnaHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChyaWdodFdpZGdldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF1bQ29udGFpbmVyLlJpZ2h0XSA9IHtcbiAgICAgICAgICAgICAgICBvcmRlcmVkOiByaWdodFdpZGdldHMsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgYWZ0ZXJDaGFuZ2VzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5ieVJvb21bcm9vbS5yb29tSWRdKTtcbiAgICAgICAgaWYgKGFmdGVyQ2hhbmdlcyAhPT0gYmVmb3JlQ2hhbmdlcykge1xuICAgICAgICAgICAgdGhpcy5lbWl0Rm9yKHJvb20pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldENvbnRhaW5lcldpZGdldHMocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIpOiBJQXBwW10ge1xuICAgICAgICByZXR1cm4gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8ub3JkZXJlZCB8fCBbXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNJbkNvbnRhaW5lcihyb29tOiBSb29tLCB3aWRnZXQ6IElBcHAsIGNvbnRhaW5lcjogQ29udGFpbmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgY29udGFpbmVyKS5zb21lKHcgPT4gdy5pZCA9PT0gd2lkZ2V0LmlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2FuQWRkVG9Db250YWluZXIocm9vbTogUm9vbSwgY29udGFpbmVyOiBDb250YWluZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpLmxlbmd0aCA8IE1BWF9QSU5ORUQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFJlc2l6ZXJEaXN0cmlidXRpb25zKHJvb206IFJvb20sIGNvbnRhaW5lcjogQ29udGFpbmVyKTogc3RyaW5nW10geyAvLyB5ZXMsIHN0cmluZy5cbiAgICAgICAgbGV0IGRpc3RyaWJ1dGlvbnMgPSB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0/Lltjb250YWluZXJdPy5kaXN0cmlidXRpb25zO1xuICAgICAgICBpZiAoIWRpc3RyaWJ1dGlvbnMgfHwgZGlzdHJpYnV0aW9ucy5sZW5ndGggPCAyKSByZXR1cm4gW107XG5cbiAgICAgICAgLy8gVGhlIGRpc3RyaWJ1dG9yIGFjdHVhbGx5IGV4cGVjdHMgdG8gYmUgZmVkIE4tMSBzaXplcyBhbmQgZXhwYW5kcyB0aGUgbWlkZGxlIHNlY3Rpb25cbiAgICAgICAgLy8gaW5zdGVhZCBvZiB0aGUgZWRnZXMuIFRoZXJlZm9yZSwgd2UgbmVlZCB0byByZXR1cm4gWzBdIHdoZW4gdGhlcmUncyB0d28gd2lkZ2V0cyBvclxuICAgICAgICAvLyBbMCwgMl0gd2hlbiB0aGVyZSdzIHRocmVlIChza2lwcGluZyBbMV0gYmVjYXVzZSBpdCdzIGlycmVsZXZhbnQpLlxuXG4gICAgICAgIGlmIChkaXN0cmlidXRpb25zLmxlbmd0aCA9PT0gMikgZGlzdHJpYnV0aW9ucyA9IFtkaXN0cmlidXRpb25zWzBdXTtcbiAgICAgICAgaWYgKGRpc3RyaWJ1dGlvbnMubGVuZ3RoID09PSAzKSBkaXN0cmlidXRpb25zID0gW2Rpc3RyaWJ1dGlvbnNbMF0sIGRpc3RyaWJ1dGlvbnNbMl1dO1xuICAgICAgICByZXR1cm4gZGlzdHJpYnV0aW9ucy5tYXAoZCA9PiBgJHtkLnRvRml4ZWQoMSl9JWApOyAvLyBhY3R1YWwgcGVyY2VudHMgLSB0aGVzZSBhcmUgZGVjb2RlZCBsYXRlclxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRSZXNpemVyRGlzdHJpYnV0aW9ucyhyb29tOiBSb29tLCBjb250YWluZXI6IENvbnRhaW5lciwgZGlzdHJpYnV0aW9uczogc3RyaW5nW10pIHtcbiAgICAgICAgaWYgKGNvbnRhaW5lciAhPT0gQ29udGFpbmVyLlRvcCkgcmV0dXJuOyAvLyBpZ25vcmUgLSBub3QgcmVsZXZhbnRcblxuICAgICAgICBjb25zdCBudW1iZXJzID0gZGlzdHJpYnV0aW9ucy5tYXAoZCA9PiBOdW1iZXIoTnVtYmVyKGQuc3Vic3RyaW5nKDAsIGQubGVuZ3RoIC0gMSkpLnRvRml4ZWQoMSkpKTtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpO1xuXG4gICAgICAgIC8vIEZyb20gZ2V0UmVzaXplckRpc3RyaWJ1dGlvbnMsIHdlIG5lZWQgdG8gZmlsbCBpbiB0aGUgbWlkZGxlIHNpemUgaWYgYXBwbGljYWJsZS5cbiAgICAgICAgY29uc3QgcmVtYWluaW5nID0gMTAwIC0gc3VtKC4uLm51bWJlcnMpO1xuICAgICAgICBpZiAobnVtYmVycy5sZW5ndGggPT09IDIpIG51bWJlcnMuc3BsaWNlKDEsIDAsIHJlbWFpbmluZyk7XG4gICAgICAgIGlmIChudW1iZXJzLmxlbmd0aCA9PT0gMSkgbnVtYmVycy5wdXNoKHJlbWFpbmluZyk7XG5cbiAgICAgICAgY29uc3QgbG9jYWxMYXlvdXQgPSB7fTtcbiAgICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3LCBpKSA9PiB7XG4gICAgICAgICAgICBsb2NhbExheW91dFt3LmlkXSA9IHtcbiAgICAgICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICB3aWR0aDogbnVtYmVyc1tpXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmhlaWdodCB8fCBNSU5fV0lER0VUX0hFSUdIVF9QQ1QsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyTGF5b3V0KHJvb20sIGxvY2FsTGF5b3V0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q29udGFpbmVySGVpZ2h0KHJvb206IFJvb20sIGNvbnRhaW5lcjogQ29udGFpbmVyKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmhlaWdodDsgLy8gbGV0IHRoZSBkZWZhdWx0IGdldCByZXR1cm5lZCBpZiBuZWVkZWRcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0Q29udGFpbmVySGVpZ2h0KHJvb206IFJvb20sIGNvbnRhaW5lcjogQ29udGFpbmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICBjb25zdCB3aWRnZXRzID0gdGhpcy5nZXRDb250YWluZXJXaWRnZXRzKHJvb20sIGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnN0IHdpZHRocyA9IHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmRpc3RyaWJ1dGlvbnM7XG4gICAgICAgIGNvbnN0IGxvY2FsTGF5b3V0ID0ge307XG4gICAgICAgIHdpZGdldHMuZm9yRWFjaCgodywgaSkgPT4ge1xuICAgICAgICAgICAgbG9jYWxMYXlvdXRbdy5pZF0gPSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoc1tpXSxcbiAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVVzZXJMYXlvdXQocm9vbSwgbG9jYWxMYXlvdXQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBtb3ZlV2l0aGluQ29udGFpbmVyKHJvb206IFJvb20sIGNvbnRhaW5lcjogQ29udGFpbmVyLCB3aWRnZXQ6IElBcHAsIGRlbHRhOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IGFycmF5RmFzdENsb25lKHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpKTtcbiAgICAgICAgY29uc3QgY3VycmVudElkeCA9IHdpZGdldHMuZmluZEluZGV4KHcgPT4gdy5pZCA9PT0gd2lkZ2V0LmlkKTtcbiAgICAgICAgaWYgKGN1cnJlbnRJZHggPCAwKSByZXR1cm47IC8vIG5vIGNoYW5nZSBuZWVkZWRcblxuICAgICAgICB3aWRnZXRzLnNwbGljZShjdXJyZW50SWR4LCAxKTsgLy8gcmVtb3ZlIGV4aXN0aW5nIHdpZGdldFxuICAgICAgICBjb25zdCBuZXdJZHggPSBjbGFtcChjdXJyZW50SWR4ICsgZGVsdGEsIDAsIHdpZGdldHMubGVuZ3RoKTtcbiAgICAgICAgd2lkZ2V0cy5zcGxpY2UobmV3SWR4LCAwLCB3aWRnZXQpO1xuXG4gICAgICAgIGNvbnN0IHdpZHRocyA9IHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmRpc3RyaWJ1dGlvbnM7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuYnlSb29tW3Jvb20ucm9vbUlkXT8uW2NvbnRhaW5lcl0/LmhlaWdodDtcbiAgICAgICAgY29uc3QgbG9jYWxMYXlvdXQgPSB7fTtcbiAgICAgICAgd2lkZ2V0cy5mb3JFYWNoKCh3LCBpKSA9PiB7XG4gICAgICAgICAgICBsb2NhbExheW91dFt3LmlkXSA9IHtcbiAgICAgICAgICAgICAgICBjb250YWluZXI6IGNvbnRhaW5lcixcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzW2ldLFxuICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudXBkYXRlVXNlckxheW91dChyb29tLCBsb2NhbExheW91dCk7XG4gICAgfVxuXG4gICAgcHVibGljIG1vdmVUb0NvbnRhaW5lcihyb29tOiBSb29tLCB3aWRnZXQ6IElBcHAsIHRvQ29udGFpbmVyOiBDb250YWluZXIpIHtcbiAgICAgICAgY29uc3QgYWxsV2lkZ2V0cyA9IHRoaXMuZ2V0QWxsV2lkZ2V0cyhyb29tKTtcbiAgICAgICAgaWYgKCFhbGxXaWRnZXRzLnNvbWUoKFt3XSk9PiB3LmlkID09PSB3aWRnZXQuaWQpKSByZXR1cm47IC8vIGludmFsaWRcbiAgICAgICAgdGhpcy51cGRhdGVVc2VyTGF5b3V0KHJvb20sIHtcbiAgICAgICAgICAgIFt3aWRnZXQuaWRdOiB7Y29udGFpbmVyOiB0b0NvbnRhaW5lcn0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5Db3B5TGF5b3V0VG9Sb29tKHJvb206IFJvb20pOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLm1hdHJpeENsaWVudCkgcmV0dXJuIGZhbHNlOyAvLyBub3QgcmVhZHkgeWV0XG4gICAgICAgIHJldHVybiByb29tLmN1cnJlbnRTdGF0ZS5tYXlTZW5kU3RhdGVFdmVudChXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUsIHRoaXMubWF0cml4Q2xpZW50LmdldFVzZXJJZCgpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29weUxheW91dFRvUm9vbShyb29tOiBSb29tKSB7XG4gICAgICAgIGNvbnN0IGFsbFdpZGdldHMgPSB0aGlzLmdldEFsbFdpZGdldHMocm9vbSk7XG4gICAgICAgIGNvbnN0IGV2Q29udGVudDogSUxheW91dFN0YXRlRXZlbnQgPSB7d2lkZ2V0czoge319O1xuICAgICAgICBmb3IgKGNvbnN0IFt3aWRnZXQsIGNvbnRhaW5lcl0gb2YgYWxsV2lkZ2V0cykge1xuICAgICAgICAgICAgZXZDb250ZW50LndpZGdldHNbd2lkZ2V0LmlkXSA9IHtjb250YWluZXJ9O1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lciA9PT0gQ29udGFpbmVyLlRvcCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lcldpZGdldHMgPSB0aGlzLmdldENvbnRhaW5lcldpZGdldHMocm9vbSwgY29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBjb25zdCBpZHggPSBjb250YWluZXJXaWRnZXRzLmZpbmRJbmRleCh3ID0+IHcuaWQgPT09IHdpZGdldC5pZCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF0/Lltjb250YWluZXJdPy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgZXZDb250ZW50LndpZGdldHNbd2lkZ2V0LmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgLi4uZXZDb250ZW50LndpZGdldHNbd2lkZ2V0LmlkXSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQgPyBNYXRoLnJvdW5kKGhlaWdodCkgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzW2lkeF0gPyBNYXRoLnJvdW5kKHdpZHRoc1tpZHhdKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpZHgsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1hdHJpeENsaWVudC5zZW5kU3RhdGVFdmVudChyb29tLnJvb21JZCwgV0lER0VUX0xBWU9VVF9FVkVOVF9UWVBFLCBldkNvbnRlbnQsIFwiXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0QWxsV2lkZ2V0cyhyb29tOiBSb29tKTogW0lBcHAsIENvbnRhaW5lcl1bXSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lcnMgPSB0aGlzLmJ5Um9vbVtyb29tLnJvb21JZF07XG4gICAgICAgIGlmICghY29udGFpbmVycykgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IHJldCA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGNvbnRhaW5lciBvZiBPYmplY3Qua2V5cyhjb250YWluZXJzKSkge1xuICAgICAgICAgICAgY29uc3Qgd2lkZ2V0cyA9IGNvbnRhaW5lcnNbY29udGFpbmVyXS5vcmRlcmVkO1xuICAgICAgICAgICAgZm9yIChjb25zdCB3aWRnZXQgb2Ygd2lkZ2V0cykge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKFt3aWRnZXQsIGNvbnRhaW5lcl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGVVc2VyTGF5b3V0KHJvb206IFJvb20sIG5ld0xheW91dDogSVdpZGdldExheW91dHMpIHtcbiAgICAgICAgLy8gUG9seWZpbGwgYW55IG1pc3Npbmcgd2lkZ2V0c1xuICAgICAgICBjb25zdCBhbGxXaWRnZXRzID0gdGhpcy5nZXRBbGxXaWRnZXRzKHJvb20pO1xuICAgICAgICBmb3IgKGNvbnN0IFt3aWRnZXQsIGNvbnRhaW5lcl0gb2YgYWxsV2lkZ2V0cykge1xuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyV2lkZ2V0cyA9IHRoaXMuZ2V0Q29udGFpbmVyV2lkZ2V0cyhyb29tLCBjb250YWluZXIpO1xuICAgICAgICAgICAgY29uc3QgaWR4ID0gY29udGFpbmVyV2lkZ2V0cy5maW5kSW5kZXgodyA9PiB3LmlkID09PSB3aWRnZXQuaWQpO1xuICAgICAgICAgICAgY29uc3Qgd2lkdGhzID0gdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uZGlzdHJpYnV0aW9ucztcbiAgICAgICAgICAgIGlmICghbmV3TGF5b3V0W3dpZGdldC5pZF0pIHtcbiAgICAgICAgICAgICAgICBuZXdMYXlvdXRbd2lkZ2V0LmlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyOiBjb250YWluZXIsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpZHgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdGhpcy5ieVJvb21bcm9vbS5yb29tSWRdPy5bY29udGFpbmVyXT8uaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGhzPy5baWR4XSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbGF5b3V0RXYgPSByb29tLmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhXSURHRVRfTEFZT1VUX0VWRU5UX1RZUEUsIFwiXCIpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnNldFZhbHVlKFwiV2lkZ2V0cy5sYXlvdXRcIiwgcm9vbS5yb29tSWQsIFNldHRpbmdMZXZlbC5ST09NX0FDQ09VTlQsIHtcbiAgICAgICAgICAgIG92ZXJyaWRlczogbGF5b3V0RXY/LmdldElkKCksXG4gICAgICAgICAgICB3aWRnZXRzOiBuZXdMYXlvdXQsXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHRoaXMucmVjYWxjdWxhdGVSb29tKHJvb20pKTtcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZVJvb20ocm9vbSk7IC8vIGNhbGwgdG8gdHJ5IGxvY2FsIGVjaG8gb24gY2hhbmdlcyAodGhlIGNhdGNoIGFib3ZlIHVuZG9lcyBhbnkgZXJyb3JzKVxuICAgIH1cbn1cblxud2luZG93Lm14V2lkZ2V0TGF5b3V0U3RvcmUgPSBXaWRnZXRMYXlvdXRTdG9yZS5pbnN0YW5jZTtcbiJdfQ==