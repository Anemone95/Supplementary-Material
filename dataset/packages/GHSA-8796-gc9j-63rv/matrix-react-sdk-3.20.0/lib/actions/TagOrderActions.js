"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Analytics = _interopRequireDefault(require("../Analytics"));

var _actionCreators = require("./actionCreators");

var _GroupFilterOrderStore = _interopRequireDefault(require("../stores/GroupFilterOrderStore"));

var _payloads = require("../dispatcher/payloads");

/*
Copyright 2017 New Vector Ltd
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
class TagOrderActions {
  /**
   * Creates an action thunk that will do an asynchronous request to
   * move a tag in GroupFilterOrderStore to destinationIx.
   *
   * @param {MatrixClient} matrixClient the matrix client to set the
   * account data on.
   * @param {string} tag the tag to move.
   * @param {number} destinationIx the new position of the tag.
   * @returns {AsyncActionPayload} an async action payload that will
   * dispatch actions indicating the status of the request.
   * @see asyncAction
   */
  static moveTag(matrixClient
  /*: MatrixClient*/
  , tag
  /*: string*/
  , destinationIx
  /*: number*/
  )
  /*: AsyncActionPayload*/
  {
    // Only commit tags if the state is ready, i.e. not null
    let tags = _GroupFilterOrderStore.default.getOrderedTags();

    let removedTags = _GroupFilterOrderStore.default.getRemovedTagsAccountData() || [];

    if (!tags) {
      return;
    }

    tags = tags.filter(t => t !== tag);
    tags = [...tags.slice(0, destinationIx), tag, ...tags.slice(destinationIx)];
    removedTags = removedTags.filter(t => t !== tag);

    const storeId = _GroupFilterOrderStore.default.getStoreId();

    return (0, _actionCreators.asyncAction)('TagOrderActions.moveTag', () => {
      _Analytics.default.trackEvent('TagOrderActions', 'commitTagOrdering');

      return matrixClient.setAccountData('im.vector.web.tag_ordering', {
        tags,
        removedTags,
        _storeId: storeId
      });
    }, () => {
      // For an optimistic update
      return {
        tags,
        removedTags
      };
    });
  }
  /**
   * Creates an action thunk that will do an asynchronous request to
   * label a tag as removed in im.vector.web.tag_ordering account data.
   *
   * The reason this is implemented with new state `removedTags` is that
   * we incrementally and initially populate `tags` with groups that
   * have been joined. If we remove a group from `tags`, it will just
   * get added (as it looks like a group we've recently joined).
   *
   * NB: If we ever support adding of tags (which is planned), we should
   * take special care to remove the tag from `removedTags` when we add
   * it.
   *
   * @param {MatrixClient} matrixClient the matrix client to set the
   * account data on.
   * @param {string} tag the tag to remove.
   * @returns {function} an async action payload that will dispatch
   * actions indicating the status of the request.
   * @see asyncAction
   */


  static removeTag(matrixClient
  /*: MatrixClient*/
  , tag
  /*: string*/
  )
  /*: AsyncActionPayload*/
  {
    // Don't change tags, just removedTags
    const tags = _GroupFilterOrderStore.default.getOrderedTags();

    const removedTags = _GroupFilterOrderStore.default.getRemovedTagsAccountData() || [];

    if (removedTags.includes(tag)) {
      // Return a thunk that doesn't do anything, we don't even need
      // an asynchronous action here, the tag is already removed.
      return new _payloads.AsyncActionPayload(() => {});
    }

    removedTags.push(tag);

    const storeId = _GroupFilterOrderStore.default.getStoreId();

    return (0, _actionCreators.asyncAction)('TagOrderActions.removeTag', () => {
      _Analytics.default.trackEvent('TagOrderActions', 'removeTag');

      return matrixClient.setAccountData('im.vector.web.tag_ordering', {
        tags,
        removedTags,
        _storeId: storeId
      });
    }, () => {
      // For an optimistic update
      return {
        removedTags
      };
    });
  }

}

exports.default = TagOrderActions;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY3Rpb25zL1RhZ09yZGVyQWN0aW9ucy50cyJdLCJuYW1lcyI6WyJUYWdPcmRlckFjdGlvbnMiLCJtb3ZlVGFnIiwibWF0cml4Q2xpZW50IiwidGFnIiwiZGVzdGluYXRpb25JeCIsInRhZ3MiLCJHcm91cEZpbHRlck9yZGVyU3RvcmUiLCJnZXRPcmRlcmVkVGFncyIsInJlbW92ZWRUYWdzIiwiZ2V0UmVtb3ZlZFRhZ3NBY2NvdW50RGF0YSIsImZpbHRlciIsInQiLCJzbGljZSIsInN0b3JlSWQiLCJnZXRTdG9yZUlkIiwiQW5hbHl0aWNzIiwidHJhY2tFdmVudCIsInNldEFjY291bnREYXRhIiwiX3N0b3JlSWQiLCJyZW1vdmVUYWciLCJpbmNsdWRlcyIsIkFzeW5jQWN0aW9uUGF5bG9hZCIsInB1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRZSxNQUFNQSxlQUFOLENBQXNCO0FBQ2pDO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNJLFNBQWNDLE9BQWQsQ0FBc0JDO0FBQXRCO0FBQUEsSUFBa0RDO0FBQWxEO0FBQUEsSUFBK0RDO0FBQS9EO0FBQUE7QUFBQTtBQUEwRztBQUN0RztBQUNBLFFBQUlDLElBQUksR0FBR0MsK0JBQXNCQyxjQUF0QixFQUFYOztBQUNBLFFBQUlDLFdBQVcsR0FBR0YsK0JBQXNCRyx5QkFBdEIsTUFBcUQsRUFBdkU7O0FBQ0EsUUFBSSxDQUFDSixJQUFMLEVBQVc7QUFDUDtBQUNIOztBQUVEQSxJQUFBQSxJQUFJLEdBQUdBLElBQUksQ0FBQ0ssTUFBTCxDQUFhQyxDQUFELElBQU9BLENBQUMsS0FBS1IsR0FBekIsQ0FBUDtBQUNBRSxJQUFBQSxJQUFJLEdBQUcsQ0FBQyxHQUFHQSxJQUFJLENBQUNPLEtBQUwsQ0FBVyxDQUFYLEVBQWNSLGFBQWQsQ0FBSixFQUFrQ0QsR0FBbEMsRUFBdUMsR0FBR0UsSUFBSSxDQUFDTyxLQUFMLENBQVdSLGFBQVgsQ0FBMUMsQ0FBUDtBQUVBSSxJQUFBQSxXQUFXLEdBQUdBLFdBQVcsQ0FBQ0UsTUFBWixDQUFvQkMsQ0FBRCxJQUFPQSxDQUFDLEtBQUtSLEdBQWhDLENBQWQ7O0FBRUEsVUFBTVUsT0FBTyxHQUFHUCwrQkFBc0JRLFVBQXRCLEVBQWhCOztBQUVBLFdBQU8saUNBQVkseUJBQVosRUFBdUMsTUFBTTtBQUNoREMseUJBQVVDLFVBQVYsQ0FBcUIsaUJBQXJCLEVBQXdDLG1CQUF4Qzs7QUFDQSxhQUFPZCxZQUFZLENBQUNlLGNBQWIsQ0FDSCw0QkFERyxFQUVIO0FBQUNaLFFBQUFBLElBQUQ7QUFBT0csUUFBQUEsV0FBUDtBQUFvQlUsUUFBQUEsUUFBUSxFQUFFTDtBQUE5QixPQUZHLENBQVA7QUFJSCxLQU5NLEVBTUosTUFBTTtBQUNMO0FBQ0EsYUFBTztBQUFDUixRQUFBQSxJQUFEO0FBQU9HLFFBQUFBO0FBQVAsT0FBUDtBQUNILEtBVE0sQ0FBUDtBQVVIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksU0FBY1csU0FBZCxDQUF3QmpCO0FBQXhCO0FBQUEsSUFBb0RDO0FBQXBEO0FBQUE7QUFBQTtBQUFxRjtBQUNqRjtBQUNBLFVBQU1FLElBQUksR0FBR0MsK0JBQXNCQyxjQUF0QixFQUFiOztBQUNBLFVBQU1DLFdBQVcsR0FBR0YsK0JBQXNCRyx5QkFBdEIsTUFBcUQsRUFBekU7O0FBRUEsUUFBSUQsV0FBVyxDQUFDWSxRQUFaLENBQXFCakIsR0FBckIsQ0FBSixFQUErQjtBQUMzQjtBQUNBO0FBQ0EsYUFBTyxJQUFJa0IsNEJBQUosQ0FBdUIsTUFBTSxDQUFFLENBQS9CLENBQVA7QUFDSDs7QUFFRGIsSUFBQUEsV0FBVyxDQUFDYyxJQUFaLENBQWlCbkIsR0FBakI7O0FBRUEsVUFBTVUsT0FBTyxHQUFHUCwrQkFBc0JRLFVBQXRCLEVBQWhCOztBQUVBLFdBQU8saUNBQVksMkJBQVosRUFBeUMsTUFBTTtBQUNsREMseUJBQVVDLFVBQVYsQ0FBcUIsaUJBQXJCLEVBQXdDLFdBQXhDOztBQUNBLGFBQU9kLFlBQVksQ0FBQ2UsY0FBYixDQUNILDRCQURHLEVBRUg7QUFBQ1osUUFBQUEsSUFBRDtBQUFPRyxRQUFBQSxXQUFQO0FBQW9CVSxRQUFBQSxRQUFRLEVBQUVMO0FBQTlCLE9BRkcsQ0FBUDtBQUlILEtBTk0sRUFNSixNQUFNO0FBQ0w7QUFDQSxhQUFPO0FBQUNMLFFBQUFBO0FBQUQsT0FBUDtBQUNILEtBVE0sQ0FBUDtBQVVIOztBQXJGZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IEFuYWx5dGljcyBmcm9tICcuLi9BbmFseXRpY3MnO1xuaW1wb3J0IHsgYXN5bmNBY3Rpb24gfSBmcm9tICcuL2FjdGlvbkNyZWF0b3JzJztcbmltcG9ydCBHcm91cEZpbHRlck9yZGVyU3RvcmUgZnJvbSAnLi4vc3RvcmVzL0dyb3VwRmlsdGVyT3JkZXJTdG9yZSc7XG5pbXBvcnQgeyBBc3luY0FjdGlvblBheWxvYWQgfSBmcm9tIFwiLi4vZGlzcGF0Y2hlci9wYXlsb2Fkc1wiO1xuaW1wb3J0IHsgTWF0cml4Q2xpZW50IH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUYWdPcmRlckFjdGlvbnMge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYWN0aW9uIHRodW5rIHRoYXQgd2lsbCBkbyBhbiBhc3luY2hyb25vdXMgcmVxdWVzdCB0b1xuICAgICAqIG1vdmUgYSB0YWcgaW4gR3JvdXBGaWx0ZXJPcmRlclN0b3JlIHRvIGRlc3RpbmF0aW9uSXguXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge01hdHJpeENsaWVudH0gbWF0cml4Q2xpZW50IHRoZSBtYXRyaXggY2xpZW50IHRvIHNldCB0aGVcbiAgICAgKiBhY2NvdW50IGRhdGEgb24uXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyB0aGUgdGFnIHRvIG1vdmUuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGRlc3RpbmF0aW9uSXggdGhlIG5ldyBwb3NpdGlvbiBvZiB0aGUgdGFnLlxuICAgICAqIEByZXR1cm5zIHtBc3luY0FjdGlvblBheWxvYWR9IGFuIGFzeW5jIGFjdGlvbiBwYXlsb2FkIHRoYXQgd2lsbFxuICAgICAqIGRpc3BhdGNoIGFjdGlvbnMgaW5kaWNhdGluZyB0aGUgc3RhdHVzIG9mIHRoZSByZXF1ZXN0LlxuICAgICAqIEBzZWUgYXN5bmNBY3Rpb25cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIG1vdmVUYWcobWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQsIHRhZzogc3RyaW5nLCBkZXN0aW5hdGlvbkl4OiBudW1iZXIpOiBBc3luY0FjdGlvblBheWxvYWQge1xuICAgICAgICAvLyBPbmx5IGNvbW1pdCB0YWdzIGlmIHRoZSBzdGF0ZSBpcyByZWFkeSwgaS5lLiBub3QgbnVsbFxuICAgICAgICBsZXQgdGFncyA9IEdyb3VwRmlsdGVyT3JkZXJTdG9yZS5nZXRPcmRlcmVkVGFncygpO1xuICAgICAgICBsZXQgcmVtb3ZlZFRhZ3MgPSBHcm91cEZpbHRlck9yZGVyU3RvcmUuZ2V0UmVtb3ZlZFRhZ3NBY2NvdW50RGF0YSgpIHx8IFtdO1xuICAgICAgICBpZiAoIXRhZ3MpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhZ3MgPSB0YWdzLmZpbHRlcigodCkgPT4gdCAhPT0gdGFnKTtcbiAgICAgICAgdGFncyA9IFsuLi50YWdzLnNsaWNlKDAsIGRlc3RpbmF0aW9uSXgpLCB0YWcsIC4uLnRhZ3Muc2xpY2UoZGVzdGluYXRpb25JeCldO1xuXG4gICAgICAgIHJlbW92ZWRUYWdzID0gcmVtb3ZlZFRhZ3MuZmlsdGVyKCh0KSA9PiB0ICE9PSB0YWcpO1xuXG4gICAgICAgIGNvbnN0IHN0b3JlSWQgPSBHcm91cEZpbHRlck9yZGVyU3RvcmUuZ2V0U3RvcmVJZCgpO1xuXG4gICAgICAgIHJldHVybiBhc3luY0FjdGlvbignVGFnT3JkZXJBY3Rpb25zLm1vdmVUYWcnLCAoKSA9PiB7XG4gICAgICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnVGFnT3JkZXJBY3Rpb25zJywgJ2NvbW1pdFRhZ09yZGVyaW5nJyk7XG4gICAgICAgICAgICByZXR1cm4gbWF0cml4Q2xpZW50LnNldEFjY291bnREYXRhKFxuICAgICAgICAgICAgICAgICdpbS52ZWN0b3Iud2ViLnRhZ19vcmRlcmluZycsXG4gICAgICAgICAgICAgICAge3RhZ3MsIHJlbW92ZWRUYWdzLCBfc3RvcmVJZDogc3RvcmVJZH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICAvLyBGb3IgYW4gb3B0aW1pc3RpYyB1cGRhdGVcbiAgICAgICAgICAgIHJldHVybiB7dGFncywgcmVtb3ZlZFRhZ3N9O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGFjdGlvbiB0aHVuayB0aGF0IHdpbGwgZG8gYW4gYXN5bmNocm9ub3VzIHJlcXVlc3QgdG9cbiAgICAgKiBsYWJlbCBhIHRhZyBhcyByZW1vdmVkIGluIGltLnZlY3Rvci53ZWIudGFnX29yZGVyaW5nIGFjY291bnQgZGF0YS5cbiAgICAgKlxuICAgICAqIFRoZSByZWFzb24gdGhpcyBpcyBpbXBsZW1lbnRlZCB3aXRoIG5ldyBzdGF0ZSBgcmVtb3ZlZFRhZ3NgIGlzIHRoYXRcbiAgICAgKiB3ZSBpbmNyZW1lbnRhbGx5IGFuZCBpbml0aWFsbHkgcG9wdWxhdGUgYHRhZ3NgIHdpdGggZ3JvdXBzIHRoYXRcbiAgICAgKiBoYXZlIGJlZW4gam9pbmVkLiBJZiB3ZSByZW1vdmUgYSBncm91cCBmcm9tIGB0YWdzYCwgaXQgd2lsbCBqdXN0XG4gICAgICogZ2V0IGFkZGVkIChhcyBpdCBsb29rcyBsaWtlIGEgZ3JvdXAgd2UndmUgcmVjZW50bHkgam9pbmVkKS5cbiAgICAgKlxuICAgICAqIE5COiBJZiB3ZSBldmVyIHN1cHBvcnQgYWRkaW5nIG9mIHRhZ3MgKHdoaWNoIGlzIHBsYW5uZWQpLCB3ZSBzaG91bGRcbiAgICAgKiB0YWtlIHNwZWNpYWwgY2FyZSB0byByZW1vdmUgdGhlIHRhZyBmcm9tIGByZW1vdmVkVGFnc2Agd2hlbiB3ZSBhZGRcbiAgICAgKiBpdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7TWF0cml4Q2xpZW50fSBtYXRyaXhDbGllbnQgdGhlIG1hdHJpeCBjbGllbnQgdG8gc2V0IHRoZVxuICAgICAqIGFjY291bnQgZGF0YSBvbi5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdGFnIHRoZSB0YWcgdG8gcmVtb3ZlLlxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbn0gYW4gYXN5bmMgYWN0aW9uIHBheWxvYWQgdGhhdCB3aWxsIGRpc3BhdGNoXG4gICAgICogYWN0aW9ucyBpbmRpY2F0aW5nIHRoZSBzdGF0dXMgb2YgdGhlIHJlcXVlc3QuXG4gICAgICogQHNlZSBhc3luY0FjdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVtb3ZlVGFnKG1hdHJpeENsaWVudDogTWF0cml4Q2xpZW50LCB0YWc6IHN0cmluZyk6IEFzeW5jQWN0aW9uUGF5bG9hZCB7XG4gICAgICAgIC8vIERvbid0IGNoYW5nZSB0YWdzLCBqdXN0IHJlbW92ZWRUYWdzXG4gICAgICAgIGNvbnN0IHRhZ3MgPSBHcm91cEZpbHRlck9yZGVyU3RvcmUuZ2V0T3JkZXJlZFRhZ3MoKTtcbiAgICAgICAgY29uc3QgcmVtb3ZlZFRhZ3MgPSBHcm91cEZpbHRlck9yZGVyU3RvcmUuZ2V0UmVtb3ZlZFRhZ3NBY2NvdW50RGF0YSgpIHx8IFtdO1xuXG4gICAgICAgIGlmIChyZW1vdmVkVGFncy5pbmNsdWRlcyh0YWcpKSB7XG4gICAgICAgICAgICAvLyBSZXR1cm4gYSB0aHVuayB0aGF0IGRvZXNuJ3QgZG8gYW55dGhpbmcsIHdlIGRvbid0IGV2ZW4gbmVlZFxuICAgICAgICAgICAgLy8gYW4gYXN5bmNocm9ub3VzIGFjdGlvbiBoZXJlLCB0aGUgdGFnIGlzIGFscmVhZHkgcmVtb3ZlZC5cbiAgICAgICAgICAgIHJldHVybiBuZXcgQXN5bmNBY3Rpb25QYXlsb2FkKCgpID0+IHt9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbW92ZWRUYWdzLnB1c2godGFnKTtcblxuICAgICAgICBjb25zdCBzdG9yZUlkID0gR3JvdXBGaWx0ZXJPcmRlclN0b3JlLmdldFN0b3JlSWQoKTtcblxuICAgICAgICByZXR1cm4gYXN5bmNBY3Rpb24oJ1RhZ09yZGVyQWN0aW9ucy5yZW1vdmVUYWcnLCAoKSA9PiB7XG4gICAgICAgICAgICBBbmFseXRpY3MudHJhY2tFdmVudCgnVGFnT3JkZXJBY3Rpb25zJywgJ3JlbW92ZVRhZycpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdHJpeENsaWVudC5zZXRBY2NvdW50RGF0YShcbiAgICAgICAgICAgICAgICAnaW0udmVjdG9yLndlYi50YWdfb3JkZXJpbmcnLFxuICAgICAgICAgICAgICAgIHt0YWdzLCByZW1vdmVkVGFncywgX3N0b3JlSWQ6IHN0b3JlSWR9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gRm9yIGFuIG9wdGltaXN0aWMgdXBkYXRlXG4gICAgICAgICAgICByZXR1cm4ge3JlbW92ZWRUYWdzfTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19