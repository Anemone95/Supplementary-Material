"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _classnames = _interopRequireDefault(require("classnames"));

var _RoomDetailRow = require("./RoomDetailRow");

/*
Copyright 2017 New Vector Ltd.

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
class RoomDetailList extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "onDetailsClick", (ev, room) => {
      _dispatcher.default.dispatch({
        action: 'view_room',
        room_id: room.roomId,
        room_alias: room.canonicalAlias || (room.aliases || [])[0]
      });
    });
  }

  getRows() {
    if (!this.props.rooms) return [];
    const RoomDetailRow = sdk.getComponent('rooms.RoomDetailRow');
    return this.props.rooms.map((room, index) => {
      return /*#__PURE__*/_react.default.createElement(RoomDetailRow, {
        key: index,
        room: room,
        onClick: this.onDetailsClick
      });
    });
  }

  render() {
    const rows = this.getRows();
    let rooms;

    if (rows.length === 0) {
      rooms = /*#__PURE__*/_react.default.createElement("i", null, (0, _languageHandler._t)('No rooms to show'));
    } else {
      rooms = /*#__PURE__*/_react.default.createElement("table", {
        className: "mx_RoomDirectory_table"
      }, /*#__PURE__*/_react.default.createElement("tbody", null, this.getRows()));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_RoomDetailList", this.props.className)
    }, rooms);
  }

}

exports.default = RoomDetailList;
(0, _defineProperty2.default)(RoomDetailList, "propTypes", {
  rooms: _propTypes.default.arrayOf(_RoomDetailRow.roomShape),
  className: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21EZXRhaWxMaXN0LmpzIl0sIm5hbWVzIjpbIlJvb21EZXRhaWxMaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJldiIsInJvb20iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyb29tSWQiLCJyb29tX2FsaWFzIiwiY2Fub25pY2FsQWxpYXMiLCJhbGlhc2VzIiwiZ2V0Um93cyIsInByb3BzIiwicm9vbXMiLCJSb29tRGV0YWlsUm93Iiwic2RrIiwiZ2V0Q29tcG9uZW50IiwibWFwIiwiaW5kZXgiLCJvbkRldGFpbHNDbGljayIsInJlbmRlciIsInJvd3MiLCJsZW5ndGgiLCJjbGFzc05hbWUiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwicm9vbVNoYXBlIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQXZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXZSxNQUFNQSxjQUFOLFNBQTZCQyxlQUFNQyxTQUFuQyxDQUE2QztBQUFBO0FBQUE7QUFBQSwwREFldkMsQ0FBQ0MsRUFBRCxFQUFLQyxJQUFMLEtBQWM7QUFDM0JDLDBCQUFJQyxRQUFKLENBQWE7QUFDVEMsUUFBQUEsTUFBTSxFQUFFLFdBREM7QUFFVEMsUUFBQUEsT0FBTyxFQUFFSixJQUFJLENBQUNLLE1BRkw7QUFHVEMsUUFBQUEsVUFBVSxFQUFFTixJQUFJLENBQUNPLGNBQUwsSUFBdUIsQ0FBQ1AsSUFBSSxDQUFDUSxPQUFMLElBQWdCLEVBQWpCLEVBQXFCLENBQXJCO0FBSDFCLE9BQWI7QUFLSCxLQXJCdUQ7QUFBQTs7QUFNeERDLEVBQUFBLE9BQU8sR0FBRztBQUNOLFFBQUksQ0FBQyxLQUFLQyxLQUFMLENBQVdDLEtBQWhCLEVBQXVCLE9BQU8sRUFBUDtBQUV2QixVQUFNQyxhQUFhLEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixxQkFBakIsQ0FBdEI7QUFDQSxXQUFPLEtBQUtKLEtBQUwsQ0FBV0MsS0FBWCxDQUFpQkksR0FBakIsQ0FBcUIsQ0FBQ2YsSUFBRCxFQUFPZ0IsS0FBUCxLQUFpQjtBQUN6QywwQkFBTyw2QkFBQyxhQUFEO0FBQWUsUUFBQSxHQUFHLEVBQUVBLEtBQXBCO0FBQTJCLFFBQUEsSUFBSSxFQUFFaEIsSUFBakM7QUFBdUMsUUFBQSxPQUFPLEVBQUUsS0FBS2lCO0FBQXJELFFBQVA7QUFDSCxLQUZNLENBQVA7QUFHSDs7QUFVREMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsSUFBSSxHQUFHLEtBQUtWLE9BQUwsRUFBYjtBQUNBLFFBQUlFLEtBQUo7O0FBQ0EsUUFBSVEsSUFBSSxDQUFDQyxNQUFMLEtBQWdCLENBQXBCLEVBQXVCO0FBQ25CVCxNQUFBQSxLQUFLLGdCQUFHLHdDQUFLLHlCQUFHLGtCQUFILENBQUwsQ0FBUjtBQUNILEtBRkQsTUFFTztBQUNIQSxNQUFBQSxLQUFLLGdCQUFHO0FBQU8sUUFBQSxTQUFTLEVBQUM7QUFBakIsc0JBQ0osNENBQ00sS0FBS0YsT0FBTCxFQUROLENBREksQ0FBUjtBQUtIOztBQUNELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUUseUJBQVcsbUJBQVgsRUFBZ0MsS0FBS0MsS0FBTCxDQUFXVyxTQUEzQztBQUFoQixPQUNEVixLQURDLENBQVA7QUFHSDs7QUF0Q3VEOzs7OEJBQXZDZixjLGVBQ0U7QUFDZmUsRUFBQUEsS0FBSyxFQUFFVyxtQkFBVUMsT0FBVixDQUFrQkMsd0JBQWxCLENBRFE7QUFFZkgsRUFBQUEsU0FBUyxFQUFFQyxtQkFBVUc7QUFGTixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQge3Jvb21TaGFwZX0gZnJvbSAnLi9Sb29tRGV0YWlsUm93JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbURldGFpbExpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21zOiBQcm9wVHlwZXMuYXJyYXlPZihyb29tU2hhcGUpLFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIGdldFJvd3MoKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5yb29tcykgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IFJvb21EZXRhaWxSb3cgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5Sb29tRGV0YWlsUm93Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvb21zLm1hcCgocm9vbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiA8Um9vbURldGFpbFJvdyBrZXk9e2luZGV4fSByb29tPXtyb29tfSBvbkNsaWNrPXt0aGlzLm9uRGV0YWlsc0NsaWNrfSAvPjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25EZXRhaWxzQ2xpY2sgPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIHJvb21fYWxpYXM6IHJvb20uY2Fub25pY2FsQWxpYXMgfHwgKHJvb20uYWxpYXNlcyB8fCBbXSlbMF0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSB0aGlzLmdldFJvd3MoKTtcbiAgICAgICAgbGV0IHJvb21zO1xuICAgICAgICBpZiAocm93cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJvb21zID0gPGk+eyBfdCgnTm8gcm9vbXMgdG8gc2hvdycpIH08L2k+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm9vbXMgPSA8dGFibGUgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV90YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmdldFJvd3MoKSB9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1Jvb21EZXRhaWxMaXN0XCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lKX0+XG4gICAgICAgICAgICB7IHJvb21zIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==