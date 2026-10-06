"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _call = require("matrix-js-sdk/src/webrtc/call");

var _react = _interopRequireDefault(require("react"));

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _CallView = _interopRequireDefault(require("./CallView"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

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

/*
 * Wrapper for CallView that always display the call in a given room,
 * or nothing if there is no call in that room.
 */
class CallViewForRoom extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "dispatcherRef", void 0);
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'call_state':
          {
            const newCall = this.getCall();

            if (newCall !== this.state.call) {
              this.setState({
                call: newCall
              });
            }

            break;
          }
      }
    });
    this.state = {
      call: this.getCall()
    };
  }

  componentDidMount() {
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);
  }

  getCall()
  /*: MatrixCall*/
  {
    const call = _CallHandler.default.sharedInstance().getCallForRoom(this.props.roomId);

    if (call && [_call.CallState.Ended, _call.CallState.Ringing].includes(call.state)) return null;
    return call;
  }

  render() {
    if (!this.state.call) return null;
    return /*#__PURE__*/_react.default.createElement(_CallView.default, {
      call: this.state.call,
      pipMode: false,
      onResize: this.props.onResize,
      maxVideoHeight: this.props.maxVideoHeight
    });
  }

}

exports.default = CallViewForRoom;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaXAvQ2FsbFZpZXdGb3JSb29tLnRzeCJdLCJuYW1lcyI6WyJDYWxsVmlld0ZvclJvb20iLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJwYXlsb2FkIiwiYWN0aW9uIiwibmV3Q2FsbCIsImdldENhbGwiLCJzdGF0ZSIsImNhbGwiLCJzZXRTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiZGlzcGF0Y2hlclJlZiIsImRpcyIsInJlZ2lzdGVyIiwib25BY3Rpb24iLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInVucmVnaXN0ZXIiLCJDYWxsSGFuZGxlciIsInNoYXJlZEluc3RhbmNlIiwiZ2V0Q2FsbEZvclJvb20iLCJyb29tSWQiLCJDYWxsU3RhdGUiLCJFbmRlZCIsIlJpbmdpbmciLCJpbmNsdWRlcyIsInJlbmRlciIsIm9uUmVzaXplIiwibWF4VmlkZW9IZWlnaHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBd0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsZUFBTixTQUE4QkMsZUFBTUM7QUFBcEM7QUFBOEQ7QUFHekVDLEVBQUFBLFdBQVcsQ0FBQ0M7QUFBRDtBQUFBLElBQWdCO0FBQ3ZCLFVBQU1BLEtBQU47QUFEdUI7QUFBQSxvREFlUEMsT0FBRCxJQUFhO0FBQzVCLGNBQVFBLE9BQU8sQ0FBQ0MsTUFBaEI7QUFDSSxhQUFLLFlBQUw7QUFBbUI7QUFDZixrQkFBTUMsT0FBTyxHQUFHLEtBQUtDLE9BQUwsRUFBaEI7O0FBQ0EsZ0JBQUlELE9BQU8sS0FBSyxLQUFLRSxLQUFMLENBQVdDLElBQTNCLEVBQWlDO0FBQzdCLG1CQUFLQyxRQUFMLENBQWM7QUFBQ0QsZ0JBQUFBLElBQUksRUFBRUg7QUFBUCxlQUFkO0FBQ0g7O0FBQ0Q7QUFDSDtBQVBMO0FBU0gsS0F6QjBCO0FBRXZCLFNBQUtFLEtBQUwsR0FBYTtBQUNUQyxNQUFBQSxJQUFJLEVBQUUsS0FBS0YsT0FBTDtBQURHLEtBQWI7QUFHSDs7QUFFTUksRUFBQUEsaUJBQVAsR0FBMkI7QUFDdkIsU0FBS0MsYUFBTCxHQUFxQkMsb0JBQUlDLFFBQUosQ0FBYSxLQUFLQyxRQUFsQixDQUFyQjtBQUNIOztBQUVNQyxFQUFBQSxvQkFBUCxHQUE4QjtBQUMxQkgsd0JBQUlJLFVBQUosQ0FBZSxLQUFLTCxhQUFwQjtBQUNIOztBQWNPTCxFQUFBQSxPQUFSO0FBQUE7QUFBOEI7QUFDMUIsVUFBTUUsSUFBSSxHQUFHUyxxQkFBWUMsY0FBWixHQUE2QkMsY0FBN0IsQ0FBNEMsS0FBS2pCLEtBQUwsQ0FBV2tCLE1BQXZELENBQWI7O0FBRUEsUUFBSVosSUFBSSxJQUFJLENBQUNhLGdCQUFVQyxLQUFYLEVBQWtCRCxnQkFBVUUsT0FBNUIsRUFBcUNDLFFBQXJDLENBQThDaEIsSUFBSSxDQUFDRCxLQUFuRCxDQUFaLEVBQXVFLE9BQU8sSUFBUDtBQUN2RSxXQUFPQyxJQUFQO0FBQ0g7O0FBRU1pQixFQUFBQSxNQUFQLEdBQWdCO0FBQ1osUUFBSSxDQUFDLEtBQUtsQixLQUFMLENBQVdDLElBQWhCLEVBQXNCLE9BQU8sSUFBUDtBQUV0Qix3QkFBTyw2QkFBQyxpQkFBRDtBQUFVLE1BQUEsSUFBSSxFQUFFLEtBQUtELEtBQUwsQ0FBV0MsSUFBM0I7QUFBaUMsTUFBQSxPQUFPLEVBQUUsS0FBMUM7QUFDSCxNQUFBLFFBQVEsRUFBRSxLQUFLTixLQUFMLENBQVd3QixRQURsQjtBQUM0QixNQUFBLGNBQWMsRUFBRSxLQUFLeEIsS0FBTCxDQUFXeUI7QUFEdkQsTUFBUDtBQUdIOztBQTNDd0UiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBDYWxsU3RhdGUsIE1hdHJpeENhbGwgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy93ZWJydGMvY2FsbCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gJy4uLy4uLy4uL0NhbGxIYW5kbGVyJztcbmltcG9ydCBDYWxsVmlldyBmcm9tICcuL0NhbGxWaWV3JztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gV2hhdCByb29tIHdlIHNob3VsZCBkaXNwbGF5IHRoZSBjYWxsIGZvclxuICAgIHJvb21JZDogc3RyaW5nLFxuXG4gICAgLy8gbWF4SGVpZ2h0IHN0eWxlIGF0dHJpYnV0ZSBmb3IgdGhlIHZpZGVvIHBhbmVsXG4gICAgbWF4VmlkZW9IZWlnaHQ/OiBudW1iZXI7XG5cbiAgICAvLyBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuIHRoZSBjb250ZW50IGluIHRoZSBjYWxsdmlldyBjaGFuZ2VzXG4gICAgLy8gaW4gYSB3YXkgdGhhdCBpcyBsaWtlbHkgdG8gY2F1c2UgYSByZXNpemUuXG4gICAgb25SZXNpemU/OiBhbnk7XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGNhbGw6IE1hdHJpeENhbGwsXG59XG5cbi8qXG4gKiBXcmFwcGVyIGZvciBDYWxsVmlldyB0aGF0IGFsd2F5cyBkaXNwbGF5IHRoZSBjYWxsIGluIGEgZ2l2ZW4gcm9vbSxcbiAqIG9yIG5vdGhpbmcgaWYgdGhlcmUgaXMgbm8gY2FsbCBpbiB0aGF0IHJvb20uXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENhbGxWaWV3Rm9yUm9vbSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJUHJvcHMsIElTdGF0ZT4ge1xuICAgIHByaXZhdGUgZGlzcGF0Y2hlclJlZjogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBjYWxsOiB0aGlzLmdldENhbGwoKSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRpcy51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hlclJlZik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkFjdGlvbiA9IChwYXlsb2FkKSA9PiB7XG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2NhbGxfc3RhdGUnOiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Q2FsbCA9IHRoaXMuZ2V0Q2FsbCgpO1xuICAgICAgICAgICAgICAgIGlmIChuZXdDYWxsICE9PSB0aGlzLnN0YXRlLmNhbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7Y2FsbDogbmV3Q2FsbH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGdldENhbGwoKTogTWF0cml4Q2FsbCB7XG4gICAgICAgIGNvbnN0IGNhbGwgPSBDYWxsSGFuZGxlci5zaGFyZWRJbnN0YW5jZSgpLmdldENhbGxGb3JSb29tKHRoaXMucHJvcHMucm9vbUlkKTtcblxuICAgICAgICBpZiAoY2FsbCAmJiBbQ2FsbFN0YXRlLkVuZGVkLCBDYWxsU3RhdGUuUmluZ2luZ10uaW5jbHVkZXMoY2FsbC5zdGF0ZSkpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gY2FsbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuY2FsbCkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgcmV0dXJuIDxDYWxsVmlldyBjYWxsPXt0aGlzLnN0YXRlLmNhbGx9IHBpcE1vZGU9e2ZhbHNlfVxuICAgICAgICAgICAgb25SZXNpemU9e3RoaXMucHJvcHMub25SZXNpemV9IG1heFZpZGVvSGVpZ2h0PXt0aGlzLnByb3BzLm1heFZpZGVvSGVpZ2h0fVxuICAgICAgICAvPjtcbiAgICB9XG59XG4iXX0=