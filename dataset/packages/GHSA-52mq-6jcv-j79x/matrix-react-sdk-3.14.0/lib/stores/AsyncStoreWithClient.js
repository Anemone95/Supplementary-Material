"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AsyncStoreWithClient = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _AsyncStore = require("./AsyncStore");

var _ReadyWatchingStore = require("./ReadyWatchingStore");

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
class AsyncStoreWithClient
/*:: <T extends Object>*/
extends _AsyncStore.AsyncStore
/*:: <T>*/
{
  constructor(dispatcher
  /*: Dispatcher<ActionPayload>*/
  , initialState
  /*: T*/
  = {}) {
    super(dispatcher, initialState); // Create an anonymous class to avoid code duplication

    (0, _defineProperty2.default)(this, "readyStore", void 0);
    const asyncStore = this; // eslint-disable-line @typescript-eslint/no-this-alias

    this.readyStore = new class extends _ReadyWatchingStore.ReadyWatchingStore {
      get mxClient()
      /*: MatrixClient*/
      {
        return this.matrixClient;
      }

      async onReady()
      /*: Promise<any>*/
      {
        return asyncStore.onReady();
      }

      async onNotReady()
      /*: Promise<any>*/
      {
        return asyncStore.onNotReady();
      }

    }(dispatcher);
  }

  get matrixClient()
  /*: MatrixClient*/
  {
    return this.readyStore.mxClient;
  }

  async onReady() {// Default implementation is to do nothing.
  }

  async onNotReady() {// Default implementation is to do nothing.
  }

  async onDispatch(payload
  /*: ActionPayload*/
  ) {
    await this.onAction(payload);
  }

}

exports.AsyncStoreWithClient = AsyncStoreWithClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdG9yZXMvQXN5bmNTdG9yZVdpdGhDbGllbnQudHMiXSwibmFtZXMiOlsiQXN5bmNTdG9yZVdpdGhDbGllbnQiLCJBc3luY1N0b3JlIiwiY29uc3RydWN0b3IiLCJkaXNwYXRjaGVyIiwiaW5pdGlhbFN0YXRlIiwiYXN5bmNTdG9yZSIsInJlYWR5U3RvcmUiLCJSZWFkeVdhdGNoaW5nU3RvcmUiLCJteENsaWVudCIsIm1hdHJpeENsaWVudCIsIm9uUmVhZHkiLCJvbk5vdFJlYWR5Iiwib25EaXNwYXRjaCIsInBheWxvYWQiLCJvbkFjdGlvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBR0E7O0FBcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVFPLE1BQWVBO0FBQWY7QUFBQSxRQUE4REM7QUFBOUQ7QUFBNEU7QUFHckVDLEVBQUFBLFdBQVYsQ0FBc0JDO0FBQXRCO0FBQUEsSUFBNkRDO0FBQWU7QUFBQSxJQUFNLEVBQWxGLEVBQXNGO0FBQ2xGLFVBQU1ELFVBQU4sRUFBa0JDLFlBQWxCLEVBRGtGLENBR2xGOztBQUhrRjtBQUlsRixVQUFNQyxVQUFVLEdBQUcsSUFBbkIsQ0FKa0YsQ0FJekQ7O0FBQ3pCLFNBQUtDLFVBQUwsR0FBa0IsSUFBSyxjQUFjQyxzQ0FBZCxDQUFpQztBQUNwRCxVQUFXQyxRQUFYO0FBQUE7QUFBb0M7QUFDaEMsZUFBTyxLQUFLQyxZQUFaO0FBQ0g7O0FBRUQsWUFBZ0JDLE9BQWhCO0FBQUE7QUFBd0M7QUFDcEMsZUFBT0wsVUFBVSxDQUFDSyxPQUFYLEVBQVA7QUFDSDs7QUFFRCxZQUFnQkMsVUFBaEI7QUFBQTtBQUEyQztBQUN2QyxlQUFPTixVQUFVLENBQUNNLFVBQVgsRUFBUDtBQUNIOztBQVhtRCxLQUF0QyxDQVlmUixVQVplLENBQWxCO0FBYUg7O0FBRUQsTUFBSU0sWUFBSjtBQUFBO0FBQWlDO0FBQzdCLFdBQU8sS0FBS0gsVUFBTCxDQUFnQkUsUUFBdkI7QUFDSDs7QUFFRCxRQUFnQkUsT0FBaEIsR0FBMEIsQ0FDdEI7QUFDSDs7QUFFRCxRQUFnQkMsVUFBaEIsR0FBNkIsQ0FDekI7QUFDSDs7QUFJRCxRQUFnQkMsVUFBaEIsQ0FBMkJDO0FBQTNCO0FBQUEsSUFBbUQ7QUFDL0MsVUFBTSxLQUFLQyxRQUFMLENBQWNELE9BQWQsQ0FBTjtBQUNIOztBQXZDOEUiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvY2xpZW50XCI7XG5pbXBvcnQgeyBBc3luY1N0b3JlIH0gZnJvbSBcIi4vQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHsgQWN0aW9uUGF5bG9hZCB9IGZyb20gXCIuLi9kaXNwYXRjaGVyL3BheWxvYWRzXCI7XG5pbXBvcnQgeyBEaXNwYXRjaGVyIH0gZnJvbSBcImZsdXhcIjtcbmltcG9ydCB7IFJlYWR5V2F0Y2hpbmdTdG9yZSB9IGZyb20gXCIuL1JlYWR5V2F0Y2hpbmdTdG9yZVwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQXN5bmNTdG9yZVdpdGhDbGllbnQ8VCBleHRlbmRzIE9iamVjdD4gZXh0ZW5kcyBBc3luY1N0b3JlPFQ+IHtcbiAgICBwcm90ZWN0ZWQgcmVhZHlTdG9yZTogUmVhZHlXYXRjaGluZ1N0b3JlO1xuXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKGRpc3BhdGNoZXI6IERpc3BhdGNoZXI8QWN0aW9uUGF5bG9hZD4sIGluaXRpYWxTdGF0ZTogVCA9IDxUPnt9KSB7XG4gICAgICAgIHN1cGVyKGRpc3BhdGNoZXIsIGluaXRpYWxTdGF0ZSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIGFub255bW91cyBjbGFzcyB0byBhdm9pZCBjb2RlIGR1cGxpY2F0aW9uXG4gICAgICAgIGNvbnN0IGFzeW5jU3RvcmUgPSB0aGlzOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG4gICAgICAgIHRoaXMucmVhZHlTdG9yZSA9IG5ldyAoY2xhc3MgZXh0ZW5kcyBSZWFkeVdhdGNoaW5nU3RvcmUge1xuICAgICAgICAgICAgcHVibGljIGdldCBteENsaWVudCgpOiBNYXRyaXhDbGllbnQge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm1hdHJpeENsaWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcHJvdGVjdGVkIGFzeW5jIG9uUmVhZHkoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmNTdG9yZS5vblJlYWR5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHByb3RlY3RlZCBhc3luYyBvbk5vdFJlYWR5KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jU3RvcmUub25Ob3RSZWFkeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KShkaXNwYXRjaGVyKTtcbiAgICB9XG5cbiAgICBnZXQgbWF0cml4Q2xpZW50KCk6IE1hdHJpeENsaWVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlYWR5U3RvcmUubXhDbGllbnQ7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIG9uUmVhZHkoKSB7XG4gICAgICAgIC8vIERlZmF1bHQgaW1wbGVtZW50YXRpb24gaXMgdG8gZG8gbm90aGluZy5cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgb25Ob3RSZWFkeSgpIHtcbiAgICAgICAgLy8gRGVmYXVsdCBpbXBsZW1lbnRhdGlvbiBpcyB0byBkbyBub3RoaW5nLlxuICAgIH1cblxuICAgIHByb3RlY3RlZCBhYnN0cmFjdCBvbkFjdGlvbihwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogUHJvbWlzZTx2b2lkPjtcblxuICAgIHByb3RlY3RlZCBhc3luYyBvbkRpc3BhdGNoKHBheWxvYWQ6IEFjdGlvblBheWxvYWQpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5vbkFjdGlvbihwYXlsb2FkKTtcbiAgICB9XG59XG4iXX0=