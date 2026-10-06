"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SpaceFilterCondition = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = require("events");

var _IFilterCondition = require("./IFilterCondition");

var _SpaceStore = _interopRequireWildcard(require("../../SpaceStore"));

var _sets = require("../../../utils/sets");

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

/**
 * A filter condition for the room list which reveals rooms which
 * are a member of a given space or if no space is selected shows:
 *  + Orphaned rooms (ones not in any space you are a part of)
 *  + All DMs
 */
class SpaceFilterCondition extends _events.EventEmitter
/*:: implements IFilterCondition, IDestroyable*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "roomIds", new Set());
    (0, _defineProperty2.default)(this, "space", null);
    (0, _defineProperty2.default)(this, "onStoreUpdate", async () =>
    /*: Promise<void>*/
    {
      const beforeRoomIds = this.roomIds; // clone the set as it may be mutated by the space store internally

      this.roomIds = new Set(_SpaceStore.default.instance.getSpaceFilteredRoomIds(this.space));

      if ((0, _sets.setHasDiff)(beforeRoomIds, this.roomIds)) {
        this.emit(_IFilterCondition.FILTER_CHANGED); // XXX: Room List Store has a bug where updates to the pre-filter during a local echo of a
        // tags transition seem to be ignored, so refire in the next tick to work around it

        setImmediate(() => {
          this.emit(_IFilterCondition.FILTER_CHANGED);
        });
      }
    });
    (0, _defineProperty2.default)(this, "getSpaceEventKey", (space
    /*: Room | null*/
    ) => space ? space.roomId : _SpaceStore.HOME_SPACE);
  }

  get kind()
  /*: FilterKind*/
  {
    return _IFilterCondition.FilterKind.Prefilter;
  }

  isVisible(room
  /*: Room*/
  )
  /*: boolean*/
  {
    return this.roomIds.has(room.roomId);
  }

  updateSpace(space
  /*: Room*/
  ) {
    _SpaceStore.default.instance.off(this.getSpaceEventKey(this.space), this.onStoreUpdate);

    _SpaceStore.default.instance.on(this.getSpaceEventKey(this.space = space), this.onStoreUpdate);

    this.onStoreUpdate(); // initial update from the change to the space
  }

  destroy()
  /*: void*/
  {
    _SpaceStore.default.instance.off(this.getSpaceEventKey(this.space), this.onStoreUpdate);
  }

}

exports.SpaceFilterCondition = SpaceFilterCondition;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zdG9yZXMvcm9vbS1saXN0L2ZpbHRlcnMvU3BhY2VGaWx0ZXJDb25kaXRpb24udHMiXSwibmFtZXMiOlsiU3BhY2VGaWx0ZXJDb25kaXRpb24iLCJFdmVudEVtaXR0ZXIiLCJTZXQiLCJiZWZvcmVSb29tSWRzIiwicm9vbUlkcyIsIlNwYWNlU3RvcmUiLCJpbnN0YW5jZSIsImdldFNwYWNlRmlsdGVyZWRSb29tSWRzIiwic3BhY2UiLCJlbWl0IiwiRklMVEVSX0NIQU5HRUQiLCJzZXRJbW1lZGlhdGUiLCJyb29tSWQiLCJIT01FX1NQQUNFIiwia2luZCIsIkZpbHRlcktpbmQiLCJQcmVmaWx0ZXIiLCJpc1Zpc2libGUiLCJyb29tIiwiaGFzIiwidXBkYXRlU3BhY2UiLCJvZmYiLCJnZXRTcGFjZUV2ZW50S2V5Iiwib25TdG9yZVVwZGF0ZSIsIm9uIiwiZGVzdHJveSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFHQTs7QUFFQTs7QUFDQTs7QUF0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNPLE1BQU1BLG9CQUFOLFNBQW1DQztBQUFuQztBQUEwRjtBQUFBO0FBQUE7QUFBQSxtREFDM0UsSUFBSUMsR0FBSixFQUQyRTtBQUFBLGlEQUV2RSxJQUZ1RTtBQUFBLHlEQVlyRTtBQUFBO0FBQTJCO0FBQy9DLFlBQU1DLGFBQWEsR0FBRyxLQUFLQyxPQUEzQixDQUQrQyxDQUUvQzs7QUFDQSxXQUFLQSxPQUFMLEdBQWUsSUFBSUYsR0FBSixDQUFRRyxvQkFBV0MsUUFBWCxDQUFvQkMsdUJBQXBCLENBQTRDLEtBQUtDLEtBQWpELENBQVIsQ0FBZjs7QUFFQSxVQUFJLHNCQUFXTCxhQUFYLEVBQTBCLEtBQUtDLE9BQS9CLENBQUosRUFBNkM7QUFDekMsYUFBS0ssSUFBTCxDQUFVQyxnQ0FBVixFQUR5QyxDQUV6QztBQUNBOztBQUNBQyxRQUFBQSxZQUFZLENBQUMsTUFBTTtBQUNmLGVBQUtGLElBQUwsQ0FBVUMsZ0NBQVY7QUFDSCxTQUZXLENBQVo7QUFHSDtBQUNKLEtBekI0RjtBQUFBLDREQTJCbEUsQ0FBQ0Y7QUFBRDtBQUFBLFNBQXdCQSxLQUFLLEdBQUdBLEtBQUssQ0FBQ0ksTUFBVCxHQUFrQkMsc0JBM0JtQjtBQUFBOztBQUk3RixNQUFXQyxJQUFYO0FBQUE7QUFBOEI7QUFDMUIsV0FBT0MsNkJBQVdDLFNBQWxCO0FBQ0g7O0FBRU1DLEVBQUFBLFNBQVAsQ0FBaUJDO0FBQWpCO0FBQUE7QUFBQTtBQUFzQztBQUNsQyxXQUFPLEtBQUtkLE9BQUwsQ0FBYWUsR0FBYixDQUFpQkQsSUFBSSxDQUFDTixNQUF0QixDQUFQO0FBQ0g7O0FBbUJNUSxFQUFBQSxXQUFQLENBQW1CWjtBQUFuQjtBQUFBLElBQWdDO0FBQzVCSCx3QkFBV0MsUUFBWCxDQUFvQmUsR0FBcEIsQ0FBd0IsS0FBS0MsZ0JBQUwsQ0FBc0IsS0FBS2QsS0FBM0IsQ0FBeEIsRUFBMkQsS0FBS2UsYUFBaEU7O0FBQ0FsQix3QkFBV0MsUUFBWCxDQUFvQmtCLEVBQXBCLENBQXVCLEtBQUtGLGdCQUFMLENBQXNCLEtBQUtkLEtBQUwsR0FBYUEsS0FBbkMsQ0FBdkIsRUFBa0UsS0FBS2UsYUFBdkU7O0FBQ0EsU0FBS0EsYUFBTCxHQUg0QixDQUdOO0FBQ3pCOztBQUVNRSxFQUFBQSxPQUFQO0FBQUE7QUFBdUI7QUFDbkJwQix3QkFBV0MsUUFBWCxDQUFvQmUsR0FBcEIsQ0FBd0IsS0FBS0MsZ0JBQUwsQ0FBc0IsS0FBS2QsS0FBM0IsQ0FBeEIsRUFBMkQsS0FBS2UsYUFBaEU7QUFDSDs7QUFyQzRGIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0IHsgUm9vbSB9IGZyb20gXCJtYXRyaXgtanMtc2RrL3NyYy9tb2RlbHMvcm9vbVwiO1xuXG5pbXBvcnQgeyBGSUxURVJfQ0hBTkdFRCwgRmlsdGVyS2luZCwgSUZpbHRlckNvbmRpdGlvbiB9IGZyb20gXCIuL0lGaWx0ZXJDb25kaXRpb25cIjtcbmltcG9ydCB7IElEZXN0cm95YWJsZSB9IGZyb20gXCIuLi8uLi8uLi91dGlscy9JRGVzdHJveWFibGVcIjtcbmltcG9ydCBTcGFjZVN0b3JlLCB7SE9NRV9TUEFDRX0gZnJvbSBcIi4uLy4uL1NwYWNlU3RvcmVcIjtcbmltcG9ydCB7IHNldEhhc0RpZmYgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc2V0c1wiO1xuXG4vKipcbiAqIEEgZmlsdGVyIGNvbmRpdGlvbiBmb3IgdGhlIHJvb20gbGlzdCB3aGljaCByZXZlYWxzIHJvb21zIHdoaWNoXG4gKiBhcmUgYSBtZW1iZXIgb2YgYSBnaXZlbiBzcGFjZSBvciBpZiBubyBzcGFjZSBpcyBzZWxlY3RlZCBzaG93czpcbiAqICArIE9ycGhhbmVkIHJvb21zIChvbmVzIG5vdCBpbiBhbnkgc3BhY2UgeW91IGFyZSBhIHBhcnQgb2YpXG4gKiAgKyBBbGwgRE1zXG4gKi9cbmV4cG9ydCBjbGFzcyBTcGFjZUZpbHRlckNvbmRpdGlvbiBleHRlbmRzIEV2ZW50RW1pdHRlciBpbXBsZW1lbnRzIElGaWx0ZXJDb25kaXRpb24sIElEZXN0cm95YWJsZSB7XG4gICAgcHJpdmF0ZSByb29tSWRzID0gbmV3IFNldDxSb29tPigpO1xuICAgIHByaXZhdGUgc3BhY2U6IFJvb20gPSBudWxsO1xuXG4gICAgcHVibGljIGdldCBraW5kKCk6IEZpbHRlcktpbmQge1xuICAgICAgICByZXR1cm4gRmlsdGVyS2luZC5QcmVmaWx0ZXI7XG4gICAgfVxuXG4gICAgcHVibGljIGlzVmlzaWJsZShyb29tOiBSb29tKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvb21JZHMuaGFzKHJvb20ucm9vbUlkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU3RvcmVVcGRhdGUgPSBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgIGNvbnN0IGJlZm9yZVJvb21JZHMgPSB0aGlzLnJvb21JZHM7XG4gICAgICAgIC8vIGNsb25lIHRoZSBzZXQgYXMgaXQgbWF5IGJlIG11dGF0ZWQgYnkgdGhlIHNwYWNlIHN0b3JlIGludGVybmFsbHlcbiAgICAgICAgdGhpcy5yb29tSWRzID0gbmV3IFNldChTcGFjZVN0b3JlLmluc3RhbmNlLmdldFNwYWNlRmlsdGVyZWRSb29tSWRzKHRoaXMuc3BhY2UpKTtcblxuICAgICAgICBpZiAoc2V0SGFzRGlmZihiZWZvcmVSb29tSWRzLCB0aGlzLnJvb21JZHMpKSB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoRklMVEVSX0NIQU5HRUQpO1xuICAgICAgICAgICAgLy8gWFhYOiBSb29tIExpc3QgU3RvcmUgaGFzIGEgYnVnIHdoZXJlIHVwZGF0ZXMgdG8gdGhlIHByZS1maWx0ZXIgZHVyaW5nIGEgbG9jYWwgZWNobyBvZiBhXG4gICAgICAgICAgICAvLyB0YWdzIHRyYW5zaXRpb24gc2VlbSB0byBiZSBpZ25vcmVkLCBzbyByZWZpcmUgaW4gdGhlIG5leHQgdGljayB0byB3b3JrIGFyb3VuZCBpdFxuICAgICAgICAgICAgc2V0SW1tZWRpYXRlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmVtaXQoRklMVEVSX0NIQU5HRUQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBnZXRTcGFjZUV2ZW50S2V5ID0gKHNwYWNlOiBSb29tIHwgbnVsbCkgPT4gc3BhY2UgPyBzcGFjZS5yb29tSWQgOiBIT01FX1NQQUNFO1xuXG4gICAgcHVibGljIHVwZGF0ZVNwYWNlKHNwYWNlOiBSb29tKSB7XG4gICAgICAgIFNwYWNlU3RvcmUuaW5zdGFuY2Uub2ZmKHRoaXMuZ2V0U3BhY2VFdmVudEtleSh0aGlzLnNwYWNlKSwgdGhpcy5vblN0b3JlVXBkYXRlKTtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vbih0aGlzLmdldFNwYWNlRXZlbnRLZXkodGhpcy5zcGFjZSA9IHNwYWNlKSwgdGhpcy5vblN0b3JlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5vblN0b3JlVXBkYXRlKCk7IC8vIGluaXRpYWwgdXBkYXRlIGZyb20gdGhlIGNoYW5nZSB0byB0aGUgc3BhY2VcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpOiB2b2lkIHtcbiAgICAgICAgU3BhY2VTdG9yZS5pbnN0YW5jZS5vZmYodGhpcy5nZXRTcGFjZUV2ZW50S2V5KHRoaXMuc3BhY2UpLCB0aGlzLm9uU3RvcmVVcGRhdGUpO1xuICAgIH1cbn1cbiJdfQ==