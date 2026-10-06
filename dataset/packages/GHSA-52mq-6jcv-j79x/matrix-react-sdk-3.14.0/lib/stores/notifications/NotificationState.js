"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotificationStateSnapshot = exports.NotificationState = exports.NOTIFICATION_STATE_UPDATE = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _events = require("events");

var _NotificationColor = require("./NotificationColor");

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
const NOTIFICATION_STATE_UPDATE = "update";
exports.NOTIFICATION_STATE_UPDATE = NOTIFICATION_STATE_UPDATE;

class NotificationState extends _events.EventEmitter
/*:: implements IDestroyable*/
{
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_symbol", void 0);
    (0, _defineProperty2.default)(this, "_count", void 0);
    (0, _defineProperty2.default)(this, "_color", void 0);
  }

  get symbol()
  /*: string*/
  {
    return this._symbol;
  }

  get count()
  /*: number*/
  {
    return this._count;
  }

  get color()
  /*: NotificationColor*/
  {
    return this._color;
  }

  get isIdle()
  /*: boolean*/
  {
    return this.color <= _NotificationColor.NotificationColor.None;
  }

  get isUnread()
  /*: boolean*/
  {
    return this.color >= _NotificationColor.NotificationColor.Bold;
  }

  get hasUnreadCount()
  /*: boolean*/
  {
    return this.color >= _NotificationColor.NotificationColor.Grey && (!!this.count || !!this.symbol);
  }

  get hasMentions()
  /*: boolean*/
  {
    return this.color >= _NotificationColor.NotificationColor.Red;
  }

  emitIfUpdated(snapshot
  /*: NotificationStateSnapshot*/
  ) {
    if (snapshot.isDifferentFrom(this)) {
      this.emit(NOTIFICATION_STATE_UPDATE);
    }
  }

  snapshot()
  /*: NotificationStateSnapshot*/
  {
    return new NotificationStateSnapshot(this);
  }

  destroy()
  /*: void*/
  {
    this.removeAllListeners(NOTIFICATION_STATE_UPDATE);
  }

}

exports.NotificationState = NotificationState;

class NotificationStateSnapshot {
  constructor(state
  /*: NotificationState*/
  ) {
    (0, _defineProperty2.default)(this, "symbol", void 0);
    (0, _defineProperty2.default)(this, "count", void 0);
    (0, _defineProperty2.default)(this, "color", void 0);
    this.symbol = state.symbol;
    this.count = state.count;
    this.color = state.color;
  }

  isDifferentFrom(other
  /*: NotificationState*/
  )
  /*: boolean*/
  {
    const before = {
      count: this.count,
      symbol: this.symbol,
      color: this.color
    };
    const after = {
      count: other.count,
      symbol: other.symbol,
      color: other.color
    };
    return JSON.stringify(before) !== JSON.stringify(after);
  }

}

exports.NotificationStateSnapshot = NotificationStateSnapshot;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zdG9yZXMvbm90aWZpY2F0aW9ucy9Ob3RpZmljYXRpb25TdGF0ZS50cyJdLCJuYW1lcyI6WyJOT1RJRklDQVRJT05fU1RBVEVfVVBEQVRFIiwiTm90aWZpY2F0aW9uU3RhdGUiLCJFdmVudEVtaXR0ZXIiLCJzeW1ib2wiLCJfc3ltYm9sIiwiY291bnQiLCJfY291bnQiLCJjb2xvciIsIl9jb2xvciIsImlzSWRsZSIsIk5vdGlmaWNhdGlvbkNvbG9yIiwiTm9uZSIsImlzVW5yZWFkIiwiQm9sZCIsImhhc1VucmVhZENvdW50IiwiR3JleSIsImhhc01lbnRpb25zIiwiUmVkIiwiZW1pdElmVXBkYXRlZCIsInNuYXBzaG90IiwiaXNEaWZmZXJlbnRGcm9tIiwiZW1pdCIsIk5vdGlmaWNhdGlvblN0YXRlU25hcHNob3QiLCJkZXN0cm95IiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiY29uc3RydWN0b3IiLCJzdGF0ZSIsIm90aGVyIiwiYmVmb3JlIiwiYWZ0ZXIiLCJKU09OIiwic3RyaW5naWZ5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBTU8sTUFBTUEseUJBQXlCLEdBQUcsUUFBbEM7OztBQUVBLE1BQWVDLGlCQUFmLFNBQXlDQztBQUF6QztBQUE4RTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFLakYsTUFBV0MsTUFBWDtBQUFBO0FBQTRCO0FBQ3hCLFdBQU8sS0FBS0MsT0FBWjtBQUNIOztBQUVELE1BQVdDLEtBQVg7QUFBQTtBQUEyQjtBQUN2QixXQUFPLEtBQUtDLE1BQVo7QUFDSDs7QUFFRCxNQUFXQyxLQUFYO0FBQUE7QUFBc0M7QUFDbEMsV0FBTyxLQUFLQyxNQUFaO0FBQ0g7O0FBRUQsTUFBV0MsTUFBWDtBQUFBO0FBQTZCO0FBQ3pCLFdBQU8sS0FBS0YsS0FBTCxJQUFjRyxxQ0FBa0JDLElBQXZDO0FBQ0g7O0FBRUQsTUFBV0MsUUFBWDtBQUFBO0FBQStCO0FBQzNCLFdBQU8sS0FBS0wsS0FBTCxJQUFjRyxxQ0FBa0JHLElBQXZDO0FBQ0g7O0FBRUQsTUFBV0MsY0FBWDtBQUFBO0FBQXFDO0FBQ2pDLFdBQU8sS0FBS1AsS0FBTCxJQUFjRyxxQ0FBa0JLLElBQWhDLEtBQXlDLENBQUMsQ0FBQyxLQUFLVixLQUFQLElBQWdCLENBQUMsQ0FBQyxLQUFLRixNQUFoRSxDQUFQO0FBQ0g7O0FBRUQsTUFBV2EsV0FBWDtBQUFBO0FBQWtDO0FBQzlCLFdBQU8sS0FBS1QsS0FBTCxJQUFjRyxxQ0FBa0JPLEdBQXZDO0FBQ0g7O0FBRVNDLEVBQUFBLGFBQVYsQ0FBd0JDO0FBQXhCO0FBQUEsSUFBNkQ7QUFDekQsUUFBSUEsUUFBUSxDQUFDQyxlQUFULENBQXlCLElBQXpCLENBQUosRUFBb0M7QUFDaEMsV0FBS0MsSUFBTCxDQUFVckIseUJBQVY7QUFDSDtBQUNKOztBQUVTbUIsRUFBQUEsUUFBVjtBQUFBO0FBQWdEO0FBQzVDLFdBQU8sSUFBSUcseUJBQUosQ0FBOEIsSUFBOUIsQ0FBUDtBQUNIOztBQUVNQyxFQUFBQSxPQUFQO0FBQUE7QUFBdUI7QUFDbkIsU0FBS0Msa0JBQUwsQ0FBd0J4Qix5QkFBeEI7QUFDSDs7QUE3Q2dGOzs7O0FBZ0Q5RSxNQUFNc0IseUJBQU4sQ0FBZ0M7QUFLbkNHLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQTJCO0FBQUE7QUFBQTtBQUFBO0FBQ2xDLFNBQUt2QixNQUFMLEdBQWN1QixLQUFLLENBQUN2QixNQUFwQjtBQUNBLFNBQUtFLEtBQUwsR0FBYXFCLEtBQUssQ0FBQ3JCLEtBQW5CO0FBQ0EsU0FBS0UsS0FBTCxHQUFhbUIsS0FBSyxDQUFDbkIsS0FBbkI7QUFDSDs7QUFFTWEsRUFBQUEsZUFBUCxDQUF1Qk87QUFBdkI7QUFBQTtBQUFBO0FBQTBEO0FBQ3RELFVBQU1DLE1BQU0sR0FBRztBQUFDdkIsTUFBQUEsS0FBSyxFQUFFLEtBQUtBLEtBQWI7QUFBb0JGLE1BQUFBLE1BQU0sRUFBRSxLQUFLQSxNQUFqQztBQUF5Q0ksTUFBQUEsS0FBSyxFQUFFLEtBQUtBO0FBQXJELEtBQWY7QUFDQSxVQUFNc0IsS0FBSyxHQUFHO0FBQUN4QixNQUFBQSxLQUFLLEVBQUVzQixLQUFLLENBQUN0QixLQUFkO0FBQXFCRixNQUFBQSxNQUFNLEVBQUV3QixLQUFLLENBQUN4QixNQUFuQztBQUEyQ0ksTUFBQUEsS0FBSyxFQUFFb0IsS0FBSyxDQUFDcEI7QUFBeEQsS0FBZDtBQUNBLFdBQU91QixJQUFJLENBQUNDLFNBQUwsQ0FBZUgsTUFBZixNQUEyQkUsSUFBSSxDQUFDQyxTQUFMLENBQWVGLEtBQWYsQ0FBbEM7QUFDSDs7QUFma0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgeyBOb3RpZmljYXRpb25Db2xvciB9IGZyb20gXCIuL05vdGlmaWNhdGlvbkNvbG9yXCI7XG5pbXBvcnQgeyBJRGVzdHJveWFibGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvSURlc3Ryb3lhYmxlXCI7XG5cbmV4cG9ydCBjb25zdCBOT1RJRklDQVRJT05fU1RBVEVfVVBEQVRFID0gXCJ1cGRhdGVcIjtcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5vdGlmaWNhdGlvblN0YXRlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIGltcGxlbWVudHMgSURlc3Ryb3lhYmxlIHtcbiAgICBwcm90ZWN0ZWQgX3N5bWJvbDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfY291bnQ6IG51bWJlcjtcbiAgICBwcm90ZWN0ZWQgX2NvbG9yOiBOb3RpZmljYXRpb25Db2xvcjtcblxuICAgIHB1YmxpYyBnZXQgc3ltYm9sKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zeW1ib2w7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb3VudCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fY291bnQ7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjb2xvcigpOiBOb3RpZmljYXRpb25Db2xvciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jb2xvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzSWRsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3IgPD0gTm90aWZpY2F0aW9uQ29sb3IuTm9uZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzVW5yZWFkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvciA+PSBOb3RpZmljYXRpb25Db2xvci5Cb2xkO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGFzVW5yZWFkQ291bnQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9yID49IE5vdGlmaWNhdGlvbkNvbG9yLkdyZXkgJiYgKCEhdGhpcy5jb3VudCB8fCAhIXRoaXMuc3ltYm9sKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGhhc01lbnRpb25zKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvciA+PSBOb3RpZmljYXRpb25Db2xvci5SZWQ7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIGVtaXRJZlVwZGF0ZWQoc25hcHNob3Q6IE5vdGlmaWNhdGlvblN0YXRlU25hcHNob3QpIHtcbiAgICAgICAgaWYgKHNuYXBzaG90LmlzRGlmZmVyZW50RnJvbSh0aGlzKSkge1xuICAgICAgICAgICAgdGhpcy5lbWl0KE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHNuYXBzaG90KCk6IE5vdGlmaWNhdGlvblN0YXRlU25hcHNob3Qge1xuICAgICAgICByZXR1cm4gbmV3IE5vdGlmaWNhdGlvblN0YXRlU25hcHNob3QodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKE5PVElGSUNBVElPTl9TVEFURV9VUERBVEUpO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIE5vdGlmaWNhdGlvblN0YXRlU25hcHNob3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc3ltYm9sOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjb3VudDogbnVtYmVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgY29sb3I6IE5vdGlmaWNhdGlvbkNvbG9yO1xuXG4gICAgY29uc3RydWN0b3Ioc3RhdGU6IE5vdGlmaWNhdGlvblN0YXRlKSB7XG4gICAgICAgIHRoaXMuc3ltYm9sID0gc3RhdGUuc3ltYm9sO1xuICAgICAgICB0aGlzLmNvdW50ID0gc3RhdGUuY291bnQ7XG4gICAgICAgIHRoaXMuY29sb3IgPSBzdGF0ZS5jb2xvcjtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNEaWZmZXJlbnRGcm9tKG90aGVyOiBOb3RpZmljYXRpb25TdGF0ZSk6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBiZWZvcmUgPSB7Y291bnQ6IHRoaXMuY291bnQsIHN5bWJvbDogdGhpcy5zeW1ib2wsIGNvbG9yOiB0aGlzLmNvbG9yfTtcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSB7Y291bnQ6IG90aGVyLmNvdW50LCBzeW1ib2w6IG90aGVyLnN5bWJvbCwgY29sb3I6IG90aGVyLmNvbG9yfTtcbiAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGJlZm9yZSkgIT09IEpTT04uc3RyaW5naWZ5KGFmdGVyKTtcbiAgICB9XG59XG4iXX0=