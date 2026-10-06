"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _MImageBody = _interopRequireDefault(require("./MImageBody"));

var sdk = _interopRequireWildcard(require("../../../index"));

/*
Copyright 2018 New Vector Ltd

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
class MStickerBody extends _MImageBody.default {
  // Mostly empty to prevent default behaviour of MImageBody
  onClick(ev) {
    ev.preventDefault();

    if (!this.state.showImage) {
      this.showImage();
    }
  } // MStickerBody doesn't need a wrapping `<a href=...>`, but it does need extra padding
  // which is added by mx_MStickerBody_wrapper


  wrapImage(contentUrl, children) {
    let onClick = null;

    if (!this.state.showImage) {
      onClick = this.onClick;
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MStickerBody_wrapper",
      onClick: onClick
    }, " ", children, " ");
  } // Placeholder to show in place of the sticker image if
  // img onLoad hasn't fired yet.


  getPlaceholder() {
    const TintableSVG = sdk.getComponent('elements.TintableSvg');
    return /*#__PURE__*/_react.default.createElement(TintableSVG, {
      src: require("../../../../res/img/icons-show-stickers.svg"),
      width: "75",
      height: "75"
    });
  } // Tooltip to show on mouse over


  getTooltip() {
    const content = this.props.mxEvent && this.props.mxEvent.getContent();
    if (!content || !content.body || !content.info || !content.info.w) return null;
    const Tooltip = sdk.getComponent('elements.Tooltip');
    return /*#__PURE__*/_react.default.createElement("div", {
      style: {
        left: content.info.w + 'px'
      },
      className: "mx_MStickerBody_tooltip"
    }, /*#__PURE__*/_react.default.createElement(Tooltip, {
      label: content.body
    }));
  } // Don't show "Download this_file.png ..."


  getFileBody() {
    return null;
  }

}

exports.default = MStickerBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL01TdGlja2VyQm9keS5qcyJdLCJuYW1lcyI6WyJNU3RpY2tlckJvZHkiLCJNSW1hZ2VCb2R5Iiwib25DbGljayIsImV2IiwicHJldmVudERlZmF1bHQiLCJzdGF0ZSIsInNob3dJbWFnZSIsIndyYXBJbWFnZSIsImNvbnRlbnRVcmwiLCJjaGlsZHJlbiIsImdldFBsYWNlaG9sZGVyIiwiVGludGFibGVTVkciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJyZXF1aXJlIiwiZ2V0VG9vbHRpcCIsImNvbnRlbnQiLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRDb250ZW50IiwiYm9keSIsImluZm8iLCJ3IiwiVG9vbHRpcCIsImxlZnQiLCJnZXRGaWxlQm9keSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1lLE1BQU1BLFlBQU4sU0FBMkJDLG1CQUEzQixDQUFzQztBQUNqRDtBQUNBQyxFQUFBQSxPQUFPLENBQUNDLEVBQUQsRUFBSztBQUNSQSxJQUFBQSxFQUFFLENBQUNDLGNBQUg7O0FBQ0EsUUFBSSxDQUFDLEtBQUtDLEtBQUwsQ0FBV0MsU0FBaEIsRUFBMkI7QUFDdkIsV0FBS0EsU0FBTDtBQUNIO0FBQ0osR0FQZ0QsQ0FTakQ7QUFDQTs7O0FBQ0FDLEVBQUFBLFNBQVMsQ0FBQ0MsVUFBRCxFQUFhQyxRQUFiLEVBQXVCO0FBQzVCLFFBQUlQLE9BQU8sR0FBRyxJQUFkOztBQUNBLFFBQUksQ0FBQyxLQUFLRyxLQUFMLENBQVdDLFNBQWhCLEVBQTJCO0FBQ3ZCSixNQUFBQSxPQUFPLEdBQUcsS0FBS0EsT0FBZjtBQUNIOztBQUNELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUMseUJBQWY7QUFBeUMsTUFBQSxPQUFPLEVBQUVBO0FBQWxELFlBQThETyxRQUE5RCxNQUFQO0FBQ0gsR0FqQmdELENBbUJqRDtBQUNBOzs7QUFDQUMsRUFBQUEsY0FBYyxHQUFHO0FBQ2IsVUFBTUMsV0FBVyxHQUFHQyxHQUFHLENBQUNDLFlBQUosQ0FBaUIsc0JBQWpCLENBQXBCO0FBQ0Esd0JBQU8sNkJBQUMsV0FBRDtBQUFhLE1BQUEsR0FBRyxFQUFFQyxPQUFPLENBQUMsNkNBQUQsQ0FBekI7QUFBMEUsTUFBQSxLQUFLLEVBQUMsSUFBaEY7QUFBcUYsTUFBQSxNQUFNLEVBQUM7QUFBNUYsTUFBUDtBQUNILEdBeEJnRCxDQTBCakQ7OztBQUNBQyxFQUFBQSxVQUFVLEdBQUc7QUFDVCxVQUFNQyxPQUFPLEdBQUcsS0FBS0MsS0FBTCxDQUFXQyxPQUFYLElBQXNCLEtBQUtELEtBQUwsQ0FBV0MsT0FBWCxDQUFtQkMsVUFBbkIsRUFBdEM7QUFFQSxRQUFJLENBQUNILE9BQUQsSUFBWSxDQUFDQSxPQUFPLENBQUNJLElBQXJCLElBQTZCLENBQUNKLE9BQU8sQ0FBQ0ssSUFBdEMsSUFBOEMsQ0FBQ0wsT0FBTyxDQUFDSyxJQUFSLENBQWFDLENBQWhFLEVBQW1FLE9BQU8sSUFBUDtBQUVuRSxVQUFNQyxPQUFPLEdBQUdYLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQixrQkFBakIsQ0FBaEI7QUFDQSx3QkFBTztBQUFLLE1BQUEsS0FBSyxFQUFFO0FBQUNXLFFBQUFBLElBQUksRUFBRVIsT0FBTyxDQUFDSyxJQUFSLENBQWFDLENBQWIsR0FBaUI7QUFBeEIsT0FBWjtBQUEyQyxNQUFBLFNBQVMsRUFBQztBQUFyRCxvQkFDSCw2QkFBQyxPQUFEO0FBQVMsTUFBQSxLQUFLLEVBQUVOLE9BQU8sQ0FBQ0k7QUFBeEIsTUFERyxDQUFQO0FBR0gsR0FwQ2dELENBc0NqRDs7O0FBQ0FLLEVBQUFBLFdBQVcsR0FBRztBQUNWLFdBQU8sSUFBUDtBQUNIOztBQXpDZ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IE1JbWFnZUJvZHkgZnJvbSAnLi9NSW1hZ2VCb2R5JztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1TdGlja2VyQm9keSBleHRlbmRzIE1JbWFnZUJvZHkge1xuICAgIC8vIE1vc3RseSBlbXB0eSB0byBwcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3VyIG9mIE1JbWFnZUJvZHlcbiAgICBvbkNsaWNrKGV2KSB7XG4gICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zaG93SW1hZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0ltYWdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNU3RpY2tlckJvZHkgZG9lc24ndCBuZWVkIGEgd3JhcHBpbmcgYDxhIGhyZWY9Li4uPmAsIGJ1dCBpdCBkb2VzIG5lZWQgZXh0cmEgcGFkZGluZ1xuICAgIC8vIHdoaWNoIGlzIGFkZGVkIGJ5IG14X01TdGlja2VyQm9keV93cmFwcGVyXG4gICAgd3JhcEltYWdlKGNvbnRlbnRVcmwsIGNoaWxkcmVuKSB7XG4gICAgICAgIGxldCBvbkNsaWNrID0gbnVsbDtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLnNob3dJbWFnZSkge1xuICAgICAgICAgICAgb25DbGljayA9IHRoaXMub25DbGljaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9NU3RpY2tlckJvZHlfd3JhcHBlclwiIG9uQ2xpY2s9e29uQ2xpY2t9PiB7IGNoaWxkcmVuIH0gPC9kaXY+O1xuICAgIH1cblxuICAgIC8vIFBsYWNlaG9sZGVyIHRvIHNob3cgaW4gcGxhY2Ugb2YgdGhlIHN0aWNrZXIgaW1hZ2UgaWZcbiAgICAvLyBpbWcgb25Mb2FkIGhhc24ndCBmaXJlZCB5ZXQuXG4gICAgZ2V0UGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIGNvbnN0IFRpbnRhYmxlU1ZHID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuVGludGFibGVTdmcnKTtcbiAgICAgICAgcmV0dXJuIDxUaW50YWJsZVNWRyBzcmM9e3JlcXVpcmUoXCIuLi8uLi8uLi8uLi9yZXMvaW1nL2ljb25zLXNob3ctc3RpY2tlcnMuc3ZnXCIpfSB3aWR0aD1cIjc1XCIgaGVpZ2h0PVwiNzVcIiAvPjtcbiAgICB9XG5cbiAgICAvLyBUb29sdGlwIHRvIHNob3cgb24gbW91c2Ugb3ZlclxuICAgIGdldFRvb2x0aXAoKSB7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQgJiYgdGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKTtcblxuICAgICAgICBpZiAoIWNvbnRlbnQgfHwgIWNvbnRlbnQuYm9keSB8fCAhY29udGVudC5pbmZvIHx8ICFjb250ZW50LmluZm8udykgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgY29uc3QgVG9vbHRpcCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlRvb2x0aXAnKTtcbiAgICAgICAgcmV0dXJuIDxkaXYgc3R5bGU9e3tsZWZ0OiBjb250ZW50LmluZm8udyArICdweCd9fSBjbGFzc05hbWU9XCJteF9NU3RpY2tlckJvZHlfdG9vbHRpcFwiPlxuICAgICAgICAgICAgPFRvb2x0aXAgbGFiZWw9e2NvbnRlbnQuYm9keX0gLz5cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cblxuICAgIC8vIERvbid0IHNob3cgXCJEb3dubG9hZCB0aGlzX2ZpbGUucG5nIC4uLlwiXG4gICAgZ2V0RmlsZUJvZHkoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbiJdfQ==