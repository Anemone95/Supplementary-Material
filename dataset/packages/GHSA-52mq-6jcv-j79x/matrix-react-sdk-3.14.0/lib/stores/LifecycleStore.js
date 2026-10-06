"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dispatcher = _interopRequireDefault(require("../dispatcher/dispatcher"));

var _utils = require("flux/utils");

/*
Copyright 2017 Vector Creations Ltd
Copyright 2018 New Vector Ltd
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
const INITIAL_STATE = {
  deferred_action: null
};
/**
 * A class for storing application state to do with authentication. This is a simple flux
 * store that listens for actions and updates its state accordingly, informing any
 * listeners (views) of state changes.
 */

class LifecycleStore extends _utils.Store {
  constructor() {
    super(_dispatcher.default); // Initialise state

    this._state = INITIAL_STATE;
  }

  _setState(newState) {
    this._state = Object.assign(this._state, newState);

    this.__emitChange();
  }

  __onDispatch(payload) {
    switch (payload.action) {
      case 'do_after_sync_prepared':
        this._setState({
          deferred_action: payload.deferred_action
        });

        break;

      case 'cancel_after_sync_prepared':
        this._setState({
          deferred_action: null
        });

        break;

      case 'sync_state':
        {
          if (payload.state !== 'PREPARED') {
            break;
          }

          if (!this._state.deferred_action) break;
          const deferredAction = Object.assign({}, this._state.deferred_action);

          this._setState({
            deferred_action: null
          });

          _dispatcher.default.dispatch(deferredAction);

          break;
        }

      case 'on_client_not_viable':
      case 'on_logged_out':
        this.reset();
        break;
    }
  }

  reset() {
    this._state = Object.assign({}, INITIAL_STATE);
  }

}

let singletonLifecycleStore = null;

if (!singletonLifecycleStore) {
  singletonLifecycleStore = new LifecycleStore();
}

var _default = singletonLifecycleStore;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvTGlmZWN5Y2xlU3RvcmUuanMiXSwibmFtZXMiOlsiSU5JVElBTF9TVEFURSIsImRlZmVycmVkX2FjdGlvbiIsIkxpZmVjeWNsZVN0b3JlIiwiU3RvcmUiLCJjb25zdHJ1Y3RvciIsImRpcyIsIl9zdGF0ZSIsIl9zZXRTdGF0ZSIsIm5ld1N0YXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiX19lbWl0Q2hhbmdlIiwiX19vbkRpc3BhdGNoIiwicGF5bG9hZCIsImFjdGlvbiIsInN0YXRlIiwiZGVmZXJyZWRBY3Rpb24iLCJkaXNwYXRjaCIsInJlc2V0Iiwic2luZ2xldG9uTGlmZWN5Y2xlU3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBLE1BQU1BLGFBQWEsR0FBRztBQUNsQkMsRUFBQUEsZUFBZSxFQUFFO0FBREMsQ0FBdEI7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQU1DLGNBQU4sU0FBNkJDLFlBQTdCLENBQW1DO0FBQy9CQyxFQUFBQSxXQUFXLEdBQUc7QUFDVixVQUFNQyxtQkFBTixFQURVLENBR1Y7O0FBQ0EsU0FBS0MsTUFBTCxHQUFjTixhQUFkO0FBQ0g7O0FBRURPLEVBQUFBLFNBQVMsQ0FBQ0MsUUFBRCxFQUFXO0FBQ2hCLFNBQUtGLE1BQUwsR0FBY0csTUFBTSxDQUFDQyxNQUFQLENBQWMsS0FBS0osTUFBbkIsRUFBMkJFLFFBQTNCLENBQWQ7O0FBQ0EsU0FBS0csWUFBTDtBQUNIOztBQUVEQyxFQUFBQSxZQUFZLENBQUNDLE9BQUQsRUFBVTtBQUNsQixZQUFRQSxPQUFPLENBQUNDLE1BQWhCO0FBQ0ksV0FBSyx3QkFBTDtBQUNJLGFBQUtQLFNBQUwsQ0FBZTtBQUNYTixVQUFBQSxlQUFlLEVBQUVZLE9BQU8sQ0FBQ1o7QUFEZCxTQUFmOztBQUdBOztBQUNKLFdBQUssNEJBQUw7QUFDSSxhQUFLTSxTQUFMLENBQWU7QUFDWE4sVUFBQUEsZUFBZSxFQUFFO0FBRE4sU0FBZjs7QUFHQTs7QUFDSixXQUFLLFlBQUw7QUFBbUI7QUFDZixjQUFJWSxPQUFPLENBQUNFLEtBQVIsS0FBa0IsVUFBdEIsRUFBa0M7QUFDOUI7QUFDSDs7QUFDRCxjQUFJLENBQUMsS0FBS1QsTUFBTCxDQUFZTCxlQUFqQixFQUFrQztBQUNsQyxnQkFBTWUsY0FBYyxHQUFHUCxNQUFNLENBQUNDLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEtBQUtKLE1BQUwsQ0FBWUwsZUFBOUIsQ0FBdkI7O0FBQ0EsZUFBS00sU0FBTCxDQUFlO0FBQ1hOLFlBQUFBLGVBQWUsRUFBRTtBQUROLFdBQWY7O0FBR0FJLDhCQUFJWSxRQUFKLENBQWFELGNBQWI7O0FBQ0E7QUFDSDs7QUFDRCxXQUFLLHNCQUFMO0FBQ0EsV0FBSyxlQUFMO0FBQ0ksYUFBS0UsS0FBTDtBQUNBO0FBMUJSO0FBNEJIOztBQUVEQSxFQUFBQSxLQUFLLEdBQUc7QUFDSixTQUFLWixNQUFMLEdBQWNHLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JWLGFBQWxCLENBQWQ7QUFDSDs7QUE5QzhCOztBQWlEbkMsSUFBSW1CLHVCQUF1QixHQUFHLElBQTlCOztBQUNBLElBQUksQ0FBQ0EsdUJBQUwsRUFBOEI7QUFDMUJBLEVBQUFBLHVCQUF1QixHQUFHLElBQUlqQixjQUFKLEVBQTFCO0FBQ0g7O2VBQ2NpQix1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBWZWN0b3IgQ3JlYXRpb25zIEx0ZFxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBkaXMgZnJvbSAnLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7U3RvcmV9IGZyb20gJ2ZsdXgvdXRpbHMnO1xuXG5jb25zdCBJTklUSUFMX1NUQVRFID0ge1xuICAgIGRlZmVycmVkX2FjdGlvbjogbnVsbCxcbn07XG5cbi8qKlxuICogQSBjbGFzcyBmb3Igc3RvcmluZyBhcHBsaWNhdGlvbiBzdGF0ZSB0byBkbyB3aXRoIGF1dGhlbnRpY2F0aW9uLiBUaGlzIGlzIGEgc2ltcGxlIGZsdXhcbiAqIHN0b3JlIHRoYXQgbGlzdGVucyBmb3IgYWN0aW9ucyBhbmQgdXBkYXRlcyBpdHMgc3RhdGUgYWNjb3JkaW5nbHksIGluZm9ybWluZyBhbnlcbiAqIGxpc3RlbmVycyAodmlld3MpIG9mIHN0YXRlIGNoYW5nZXMuXG4gKi9cbmNsYXNzIExpZmVjeWNsZVN0b3JlIGV4dGVuZHMgU3RvcmUge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcihkaXMpO1xuXG4gICAgICAgIC8vIEluaXRpYWxpc2Ugc3RhdGVcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBJTklUSUFMX1NUQVRFO1xuICAgIH1cblxuICAgIF9zZXRTdGF0ZShuZXdTdGF0ZSkge1xuICAgICAgICB0aGlzLl9zdGF0ZSA9IE9iamVjdC5hc3NpZ24odGhpcy5fc3RhdGUsIG5ld1N0YXRlKTtcbiAgICAgICAgdGhpcy5fX2VtaXRDaGFuZ2UoKTtcbiAgICB9XG5cbiAgICBfX29uRGlzcGF0Y2gocGF5bG9hZCkge1xuICAgICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdkb19hZnRlcl9zeW5jX3ByZXBhcmVkJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkX2FjdGlvbjogcGF5bG9hZC5kZWZlcnJlZF9hY3Rpb24sXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdjYW5jZWxfYWZ0ZXJfc3luY19wcmVwYXJlZCc6XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZF9hY3Rpb246IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzeW5jX3N0YXRlJzoge1xuICAgICAgICAgICAgICAgIGlmIChwYXlsb2FkLnN0YXRlICE9PSAnUFJFUEFSRUQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX3N0YXRlLmRlZmVycmVkX2FjdGlvbikgYnJlYWs7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmZXJyZWRBY3Rpb24gPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9zdGF0ZS5kZWZlcnJlZF9hY3Rpb24pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRfYWN0aW9uOiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaChkZWZlcnJlZEFjdGlvbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdvbl9jbGllbnRfbm90X3ZpYWJsZSc6XG4gICAgICAgICAgICBjYXNlICdvbl9sb2dnZWRfb3V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5fc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBJTklUSUFMX1NUQVRFKTtcbiAgICB9XG59XG5cbmxldCBzaW5nbGV0b25MaWZlY3ljbGVTdG9yZSA9IG51bGw7XG5pZiAoIXNpbmdsZXRvbkxpZmVjeWNsZVN0b3JlKSB7XG4gICAgc2luZ2xldG9uTGlmZWN5Y2xlU3RvcmUgPSBuZXcgTGlmZWN5Y2xlU3RvcmUoKTtcbn1cbmV4cG9ydCBkZWZhdWx0IHNpbmdsZXRvbkxpZmVjeWNsZVN0b3JlO1xuIl19