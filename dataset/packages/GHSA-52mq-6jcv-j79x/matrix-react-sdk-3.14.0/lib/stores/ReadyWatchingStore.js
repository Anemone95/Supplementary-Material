"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadyWatchingStore = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _MatrixClientPeg = require("../MatrixClientPeg");

var _events = require("events");

/*
 * Copyright 2021 The Matrix.org Foundation C.I.C.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class ReadyWatchingStore extends _events.EventEmitter
/*:: implements IDestroyable*/
{
  constructor(dispatcher
  /*: Dispatcher<ActionPayload>*/
  ) {
    super();
    this.dispatcher
    /*:: */
    = dispatcher
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "matrixClient", void 0);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", async (payload
    /*: ActionPayload*/
    ) => {
      if (payload.action === 'MatrixActions.sync') {
        // Only set the client on the transition into the PREPARED state.
        // Everything after this is unnecessary (we only need to know once we have a client)
        // and we intentionally don't set the client before this point to avoid stores
        // updating for every event emitted during the cached sync.
        if (!(payload.prevState === 'PREPARED' && payload.state !== 'PREPARED')) {
          return;
        }

        if (this.matrixClient !== payload.matrixClient) {
          if (this.matrixClient) {
            await this.onNotReady();
          }

          this.matrixClient = payload.matrixClient;
          await this.onReady();
        }
      } else if (payload.action === 'on_client_not_viable' || payload.action === 'on_logged_out') {
        if (this.matrixClient) {
          await this.onNotReady();
          this.matrixClient = null;
        }
      }
    });
    this.dispatcherRef = this.dispatcher.register(this.onAction);

    if (_MatrixClientPeg.MatrixClientPeg.get()) {
      this.matrixClient = _MatrixClientPeg.MatrixClientPeg.get(); // noinspection JSIgnoredPromiseFromCall

      this.onReady();
    }
  }

  get mxClient()
  /*: MatrixClient*/
  {
    return this.matrixClient; // for external readonly access
  }

  useUnitTestClient(cli
  /*: MatrixClient*/
  ) {
    this.matrixClient = cli;
  }

  destroy() {
    this.dispatcher.unregister(this.dispatcherRef);
  }

  async onReady() {// Default implementation is to do nothing.
  }

  async onNotReady() {// Default implementation is to do nothing.
  }

}

exports.ReadyWatchingStore = ReadyWatchingStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvUmVhZHlXYXRjaGluZ1N0b3JlLnRzIl0sIm5hbWVzIjpbIlJlYWR5V2F0Y2hpbmdTdG9yZSIsIkV2ZW50RW1pdHRlciIsImNvbnN0cnVjdG9yIiwiZGlzcGF0Y2hlciIsInBheWxvYWQiLCJhY3Rpb24iLCJwcmV2U3RhdGUiLCJzdGF0ZSIsIm1hdHJpeENsaWVudCIsIm9uTm90UmVhZHkiLCJvblJlYWR5IiwiZGlzcGF0Y2hlclJlZiIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJteENsaWVudCIsInVzZVVuaXRUZXN0Q2xpZW50IiwiY2xpIiwiZGVzdHJveSIsInVucmVnaXN0ZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBaUJBOztBQUlBOztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFTTyxNQUFlQSxrQkFBZixTQUEwQ0M7QUFBMUM7QUFBK0U7QUFJbEZDLEVBQUFBLFdBQVcsQ0FBb0JDO0FBQXBCO0FBQUEsSUFBMkQ7QUFDbEU7QUFEa0UsU0FBdkNBO0FBQXVDO0FBQUEsTUFBdkNBO0FBQXVDO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0RBaUNuRCxPQUFPQztBQUFQO0FBQUEsU0FBa0M7QUFDakQsVUFBSUEsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLG9CQUF2QixFQUE2QztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQUksRUFBRUQsT0FBTyxDQUFDRSxTQUFSLEtBQXNCLFVBQXRCLElBQW9DRixPQUFPLENBQUNHLEtBQVIsS0FBa0IsVUFBeEQsQ0FBSixFQUF5RTtBQUNyRTtBQUNIOztBQUVELFlBQUksS0FBS0MsWUFBTCxLQUFzQkosT0FBTyxDQUFDSSxZQUFsQyxFQUFnRDtBQUM1QyxjQUFJLEtBQUtBLFlBQVQsRUFBdUI7QUFDbkIsa0JBQU0sS0FBS0MsVUFBTCxFQUFOO0FBQ0g7O0FBQ0QsZUFBS0QsWUFBTCxHQUFvQkosT0FBTyxDQUFDSSxZQUE1QjtBQUNBLGdCQUFNLEtBQUtFLE9BQUwsRUFBTjtBQUNIO0FBQ0osT0FoQkQsTUFnQk8sSUFBSU4sT0FBTyxDQUFDQyxNQUFSLEtBQW1CLHNCQUFuQixJQUE2Q0QsT0FBTyxDQUFDQyxNQUFSLEtBQW1CLGVBQXBFLEVBQXFGO0FBQ3hGLFlBQUksS0FBS0csWUFBVCxFQUF1QjtBQUNuQixnQkFBTSxLQUFLQyxVQUFMLEVBQU47QUFDQSxlQUFLRCxZQUFMLEdBQW9CLElBQXBCO0FBQ0g7QUFDSjtBQUNKLEtBeERxRTtBQUdsRSxTQUFLRyxhQUFMLEdBQXFCLEtBQUtSLFVBQUwsQ0FBZ0JTLFFBQWhCLENBQXlCLEtBQUtDLFFBQTlCLENBQXJCOztBQUVBLFFBQUlDLGlDQUFnQkMsR0FBaEIsRUFBSixFQUEyQjtBQUN2QixXQUFLUCxZQUFMLEdBQW9CTSxpQ0FBZ0JDLEdBQWhCLEVBQXBCLENBRHVCLENBR3ZCOztBQUNBLFdBQUtMLE9BQUw7QUFDSDtBQUNKOztBQUVELE1BQVdNLFFBQVg7QUFBQTtBQUFvQztBQUNoQyxXQUFPLEtBQUtSLFlBQVosQ0FEZ0MsQ0FDTjtBQUM3Qjs7QUFFTVMsRUFBQUEsaUJBQVAsQ0FBeUJDO0FBQXpCO0FBQUEsSUFBNEM7QUFDeEMsU0FBS1YsWUFBTCxHQUFvQlUsR0FBcEI7QUFDSDs7QUFFTUMsRUFBQUEsT0FBUCxHQUFpQjtBQUNiLFNBQUtoQixVQUFMLENBQWdCaUIsVUFBaEIsQ0FBMkIsS0FBS1QsYUFBaEM7QUFDSDs7QUFFRCxRQUFnQkQsT0FBaEIsR0FBMEIsQ0FDdEI7QUFDSDs7QUFFRCxRQUFnQkQsVUFBaEIsR0FBNkIsQ0FDekI7QUFDSDs7QUFuQ2lGIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIENvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBNYXRyaXhDbGllbnRQZWcgfSBmcm9tIFwiLi4vTWF0cml4Q2xpZW50UGVnXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXlsb2FkIH0gZnJvbSBcIi4uL2Rpc3BhdGNoZXIvcGF5bG9hZHNcIjtcbmltcG9ydCB7IERpc3BhdGNoZXIgfSBmcm9tIFwiZmx1eFwiO1xuaW1wb3J0IHsgSURlc3Ryb3lhYmxlIH0gZnJvbSBcIi4uL3V0aWxzL0lEZXN0cm95YWJsZVwiO1xuaW1wb3J0IHsgRXZlbnRFbWl0dGVyIH0gZnJvbSBcImV2ZW50c1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVhZHlXYXRjaGluZ1N0b3JlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIGltcGxlbWVudHMgSURlc3Ryb3lhYmxlIHtcbiAgICBwcm90ZWN0ZWQgbWF0cml4Q2xpZW50OiBNYXRyaXhDbGllbnQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBkaXNwYXRjaGVyUmVmOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgcmVhZG9ubHkgZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjxBY3Rpb25QYXlsb2FkPikge1xuICAgICAgICBzdXBlcigpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IHRoaXMuZGlzcGF0Y2hlci5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcblxuICAgICAgICBpZiAoTWF0cml4Q2xpZW50UGVnLmdldCgpKSB7XG4gICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcblxuICAgICAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbFxuICAgICAgICAgICAgdGhpcy5vblJlYWR5KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG14Q2xpZW50KCk6IE1hdHJpeENsaWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudDsgLy8gZm9yIGV4dGVybmFsIHJlYWRvbmx5IGFjY2Vzc1xuICAgIH1cblxuICAgIHB1YmxpYyB1c2VVbml0VGVzdENsaWVudChjbGk6IE1hdHJpeENsaWVudCkge1xuICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IGNsaTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5kaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25SZWFkeSgpIHtcbiAgICAgICAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyB0byBkbyBub3RoaW5nLlxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCkge1xuICAgICAgICAvLyBEZWZhdWx0IGltcGxlbWVudGF0aW9uIGlzIHRvIGRvIG5vdGhpbmcuXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IGFzeW5jIChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmFjdGlvbiA9PT0gJ01hdHJpeEFjdGlvbnMuc3luYycpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHRoZSBjbGllbnQgb24gdGhlIHRyYW5zaXRpb24gaW50byB0aGUgUFJFUEFSRUQgc3RhdGUuXG4gICAgICAgICAgICAvLyBFdmVyeXRoaW5nIGFmdGVyIHRoaXMgaXMgdW5uZWNlc3NhcnkgKHdlIG9ubHkgbmVlZCB0byBrbm93IG9uY2Ugd2UgaGF2ZSBhIGNsaWVudClcbiAgICAgICAgICAgIC8vIGFuZCB3ZSBpbnRlbnRpb25hbGx5IGRvbid0IHNldCB0aGUgY2xpZW50IGJlZm9yZSB0aGlzIHBvaW50IHRvIGF2b2lkIHN0b3Jlc1xuICAgICAgICAgICAgLy8gdXBkYXRpbmcgZm9yIGV2ZXJ5IGV2ZW50IGVtaXR0ZWQgZHVyaW5nIHRoZSBjYWNoZWQgc3luYy5cbiAgICAgICAgICAgIGlmICghKHBheWxvYWQucHJldlN0YXRlID09PSAnUFJFUEFSRUQnICYmIHBheWxvYWQuc3RhdGUgIT09ICdQUkVQQVJFRCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXRyaXhDbGllbnQgIT09IHBheWxvYWQubWF0cml4Q2xpZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWF0cml4Q2xpZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25Ob3RSZWFkeSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm1hdHJpeENsaWVudCA9IHBheWxvYWQubWF0cml4Q2xpZW50O1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25SZWFkeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHBheWxvYWQuYWN0aW9uID09PSAnb25fY2xpZW50X25vdF92aWFibGUnIHx8IHBheWxvYWQuYWN0aW9uID09PSAnb25fbG9nZ2VkX291dCcpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hdHJpeENsaWVudCkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMub25Ob3RSZWFkeSgpO1xuICAgICAgICAgICAgICAgIHRoaXMubWF0cml4Q2xpZW50ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4iXX0=