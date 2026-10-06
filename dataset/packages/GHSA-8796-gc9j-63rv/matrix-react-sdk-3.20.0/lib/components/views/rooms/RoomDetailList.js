"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let RoomDetailList = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.RoomDetailList"), _dec(_class = (_temp = _class2 = class RoomDetailList extends _react.default.Component {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  rooms: _propTypes.default.arrayOf(_RoomDetailRow.roomShape),
  className: _propTypes.default.string
}), _temp)) || _class);
exports.default = RoomDetailList;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1Jvb21EZXRhaWxMaXN0LmpzIl0sIm5hbWVzIjpbIlJvb21EZXRhaWxMaXN0IiwiUmVhY3QiLCJDb21wb25lbnQiLCJldiIsInJvb20iLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsInJvb21faWQiLCJyb29tSWQiLCJyb29tX2FsaWFzIiwiY2Fub25pY2FsQWxpYXMiLCJhbGlhc2VzIiwiZ2V0Um93cyIsInByb3BzIiwicm9vbXMiLCJSb29tRGV0YWlsUm93Iiwic2RrIiwiZ2V0Q29tcG9uZW50IiwibWFwIiwiaW5kZXgiLCJvbkRldGFpbHNDbGljayIsInJlbmRlciIsInJvd3MiLCJsZW5ndGgiLCJjbGFzc05hbWUiLCJQcm9wVHlwZXMiLCJhcnJheU9mIiwicm9vbVNoYXBlIiwic3RyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOzs7O0lBR3FCQSxjLFdBRHBCLGdEQUFxQiw0QkFBckIsQyxtQ0FBRCxNQUNxQkEsY0FEckIsU0FDNENDLGVBQU1DLFNBRGxELENBQzREO0FBQUE7QUFBQTtBQUFBLDBEQWV2QyxDQUFDQyxFQUFELEVBQUtDLElBQUwsS0FBYztBQUMzQkMsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUUsV0FEQztBQUVUQyxRQUFBQSxPQUFPLEVBQUVKLElBQUksQ0FBQ0ssTUFGTDtBQUdUQyxRQUFBQSxVQUFVLEVBQUVOLElBQUksQ0FBQ08sY0FBTCxJQUF1QixDQUFDUCxJQUFJLENBQUNRLE9BQUwsSUFBZ0IsRUFBakIsRUFBcUIsQ0FBckI7QUFIMUIsT0FBYjtBQUtILEtBckJ1RDtBQUFBOztBQU14REMsRUFBQUEsT0FBTyxHQUFHO0FBQ04sUUFBSSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0MsS0FBaEIsRUFBdUIsT0FBTyxFQUFQO0FBRXZCLFVBQU1DLGFBQWEsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUF0QjtBQUNBLFdBQU8sS0FBS0osS0FBTCxDQUFXQyxLQUFYLENBQWlCSSxHQUFqQixDQUFxQixDQUFDZixJQUFELEVBQU9nQixLQUFQLEtBQWlCO0FBQ3pDLDBCQUFPLDZCQUFDLGFBQUQ7QUFBZSxRQUFBLEdBQUcsRUFBRUEsS0FBcEI7QUFBMkIsUUFBQSxJQUFJLEVBQUVoQixJQUFqQztBQUF1QyxRQUFBLE9BQU8sRUFBRSxLQUFLaUI7QUFBckQsUUFBUDtBQUNILEtBRk0sQ0FBUDtBQUdIOztBQVVEQyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxJQUFJLEdBQUcsS0FBS1YsT0FBTCxFQUFiO0FBQ0EsUUFBSUUsS0FBSjs7QUFDQSxRQUFJUSxJQUFJLENBQUNDLE1BQUwsS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDbkJULE1BQUFBLEtBQUssZ0JBQUcsd0NBQUsseUJBQUcsa0JBQUgsQ0FBTCxDQUFSO0FBQ0gsS0FGRCxNQUVPO0FBQ0hBLE1BQUFBLEtBQUssZ0JBQUc7QUFBTyxRQUFBLFNBQVMsRUFBQztBQUFqQixzQkFDSiw0Q0FDTSxLQUFLRixPQUFMLEVBRE4sQ0FESSxDQUFSO0FBS0g7O0FBQ0Qsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBRSx5QkFBVyxtQkFBWCxFQUFnQyxLQUFLQyxLQUFMLENBQVdXLFNBQTNDO0FBQWhCLE9BQ0RWLEtBREMsQ0FBUDtBQUdIOztBQXRDdUQsQyxzREFDckM7QUFDZkEsRUFBQUEsS0FBSyxFQUFFVyxtQkFBVUMsT0FBVixDQUFrQkMsd0JBQWxCLENBRFE7QUFFZkgsRUFBQUEsU0FBUyxFQUFFQyxtQkFBVUc7QUFGTixDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG5pbXBvcnQge3Jvb21TaGFwZX0gZnJvbSAnLi9Sb29tRGV0YWlsUm93JztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5Sb29tRGV0YWlsTGlzdFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbURldGFpbExpc3QgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb21zOiBQcm9wVHlwZXMuYXJyYXlPZihyb29tU2hhcGUpLFxuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIGdldFJvd3MoKSB7XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5yb29tcykgcmV0dXJuIFtdO1xuXG4gICAgICAgIGNvbnN0IFJvb21EZXRhaWxSb3cgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5Sb29tRGV0YWlsUm93Jyk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLnJvb21zLm1hcCgocm9vbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiA8Um9vbURldGFpbFJvdyBrZXk9e2luZGV4fSByb29tPXtyb29tfSBvbkNsaWNrPXt0aGlzLm9uRGV0YWlsc0NsaWNrfSAvPjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25EZXRhaWxzQ2xpY2sgPSAoZXYsIHJvb20pID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3ZpZXdfcm9vbScsXG4gICAgICAgICAgICByb29tX2lkOiByb29tLnJvb21JZCxcbiAgICAgICAgICAgIHJvb21fYWxpYXM6IHJvb20uY2Fub25pY2FsQWxpYXMgfHwgKHJvb20uYWxpYXNlcyB8fCBbXSlbMF0sXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSB0aGlzLmdldFJvd3MoKTtcbiAgICAgICAgbGV0IHJvb21zO1xuICAgICAgICBpZiAocm93cy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJvb21zID0gPGk+eyBfdCgnTm8gcm9vbXMgdG8gc2hvdycpIH08L2k+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm9vbXMgPSA8dGFibGUgY2xhc3NOYW1lPVwibXhfUm9vbURpcmVjdG9yeV90YWJsZVwiPlxuICAgICAgICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLmdldFJvd3MoKSB9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgIDwvdGFibGU+O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X1Jvb21EZXRhaWxMaXN0XCIsIHRoaXMucHJvcHMuY2xhc3NOYW1lKX0+XG4gICAgICAgICAgICB7IHJvb21zIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==