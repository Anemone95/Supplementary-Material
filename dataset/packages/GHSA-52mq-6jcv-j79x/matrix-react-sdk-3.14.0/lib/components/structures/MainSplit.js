"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reResizable = require("re-resizable");

/*
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
class MainSplit extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "_onResizeStart", () => {
      this.props.resizeNotifier.startResizing();
    });
    (0, _defineProperty2.default)(this, "_onResize", () => {
      this.props.resizeNotifier.notifyRightHandleResized();
    });
    (0, _defineProperty2.default)(this, "_onResizeStop", (event, direction, refToElement, delta) => {
      this.props.resizeNotifier.stopResizing();
      window.localStorage.setItem("mx_rhs_size", this._loadSidePanelSize().width + delta.width);
    });
  }

  _loadSidePanelSize() {
    let rhsSize = parseInt(window.localStorage.getItem("mx_rhs_size"), 10);

    if (isNaN(rhsSize)) {
      rhsSize = 350;
    }

    return {
      height: "100%",
      width: rhsSize
    };
  }

  render() {
    const bodyView = _react.default.Children.only(this.props.children);

    const panelView = this.props.panel;
    const hasResizer = !this.props.collapsedRhs && panelView;
    let children;

    if (hasResizer) {
      children = /*#__PURE__*/_react.default.createElement(_reResizable.Resizable, {
        defaultSize: this._loadSidePanelSize(),
        minWidth: 264,
        maxWidth: "50%",
        enable: {
          top: false,
          right: false,
          bottom: false,
          left: true,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        },
        onResizeStart: this._onResizeStart,
        onResize: this._onResize,
        onResizeStop: this._onResizeStop,
        className: "mx_RightPanel_ResizeWrapper",
        handleClasses: {
          left: "mx_RightPanel_ResizeHandle"
        }
      }, panelView);
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MainSplit"
    }, bodyView, children);
  }

}

exports.default = MainSplit;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvTWFpblNwbGl0LmpzIl0sIm5hbWVzIjpbIk1haW5TcGxpdCIsIlJlYWN0IiwiQ29tcG9uZW50IiwicHJvcHMiLCJyZXNpemVOb3RpZmllciIsInN0YXJ0UmVzaXppbmciLCJub3RpZnlSaWdodEhhbmRsZVJlc2l6ZWQiLCJldmVudCIsImRpcmVjdGlvbiIsInJlZlRvRWxlbWVudCIsImRlbHRhIiwic3RvcFJlc2l6aW5nIiwid2luZG93IiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIl9sb2FkU2lkZVBhbmVsU2l6ZSIsIndpZHRoIiwicmhzU2l6ZSIsInBhcnNlSW50IiwiZ2V0SXRlbSIsImlzTmFOIiwiaGVpZ2h0IiwicmVuZGVyIiwiYm9keVZpZXciLCJDaGlsZHJlbiIsIm9ubHkiLCJjaGlsZHJlbiIsInBhbmVsVmlldyIsInBhbmVsIiwiaGFzUmVzaXplciIsImNvbGxhcHNlZFJocyIsInRvcCIsInJpZ2h0IiwiYm90dG9tIiwibGVmdCIsInRvcFJpZ2h0IiwiYm90dG9tUmlnaHQiLCJib3R0b21MZWZ0IiwidG9wTGVmdCIsIl9vblJlc2l6ZVN0YXJ0IiwiX29uUmVzaXplIiwiX29uUmVzaXplU3RvcCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS2UsTUFBTUEsU0FBTixTQUF3QkMsZUFBTUMsU0FBOUIsQ0FBd0M7QUFBQTtBQUFBO0FBQUEsMERBQ2xDLE1BQU07QUFDbkIsV0FBS0MsS0FBTCxDQUFXQyxjQUFYLENBQTBCQyxhQUExQjtBQUNILEtBSGtEO0FBQUEscURBS3ZDLE1BQU07QUFDZCxXQUFLRixLQUFMLENBQVdDLGNBQVgsQ0FBMEJFLHdCQUExQjtBQUNILEtBUGtEO0FBQUEseURBU25DLENBQUNDLEtBQUQsRUFBUUMsU0FBUixFQUFtQkMsWUFBbkIsRUFBaUNDLEtBQWpDLEtBQTJDO0FBQ3ZELFdBQUtQLEtBQUwsQ0FBV0MsY0FBWCxDQUEwQk8sWUFBMUI7QUFDQUMsTUFBQUEsTUFBTSxDQUFDQyxZQUFQLENBQW9CQyxPQUFwQixDQUE0QixhQUE1QixFQUEyQyxLQUFLQyxrQkFBTCxHQUEwQkMsS0FBMUIsR0FBa0NOLEtBQUssQ0FBQ00sS0FBbkY7QUFDSCxLQVprRDtBQUFBOztBQWNuREQsRUFBQUEsa0JBQWtCLEdBQUc7QUFDakIsUUFBSUUsT0FBTyxHQUFHQyxRQUFRLENBQUNOLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQk0sT0FBcEIsQ0FBNEIsYUFBNUIsQ0FBRCxFQUE2QyxFQUE3QyxDQUF0Qjs7QUFFQSxRQUFJQyxLQUFLLENBQUNILE9BQUQsQ0FBVCxFQUFvQjtBQUNoQkEsTUFBQUEsT0FBTyxHQUFHLEdBQVY7QUFDSDs7QUFFRCxXQUFPO0FBQ0hJLE1BQUFBLE1BQU0sRUFBRSxNQURMO0FBRUhMLE1BQUFBLEtBQUssRUFBRUM7QUFGSixLQUFQO0FBSUg7O0FBRURLLEVBQUFBLE1BQU0sR0FBRztBQUNMLFVBQU1DLFFBQVEsR0FBR3RCLGVBQU11QixRQUFOLENBQWVDLElBQWYsQ0FBb0IsS0FBS3RCLEtBQUwsQ0FBV3VCLFFBQS9CLENBQWpCOztBQUNBLFVBQU1DLFNBQVMsR0FBRyxLQUFLeEIsS0FBTCxDQUFXeUIsS0FBN0I7QUFFQSxVQUFNQyxVQUFVLEdBQUcsQ0FBQyxLQUFLMUIsS0FBTCxDQUFXMkIsWUFBWixJQUE0QkgsU0FBL0M7QUFFQSxRQUFJRCxRQUFKOztBQUNBLFFBQUlHLFVBQUosRUFBZ0I7QUFDWkgsTUFBQUEsUUFBUSxnQkFBRyw2QkFBQyxzQkFBRDtBQUNQLFFBQUEsV0FBVyxFQUFFLEtBQUtYLGtCQUFMLEVBRE47QUFFUCxRQUFBLFFBQVEsRUFBRSxHQUZIO0FBR1AsUUFBQSxRQUFRLEVBQUMsS0FIRjtBQUlQLFFBQUEsTUFBTSxFQUFFO0FBQ0pnQixVQUFBQSxHQUFHLEVBQUUsS0FERDtBQUVKQyxVQUFBQSxLQUFLLEVBQUUsS0FGSDtBQUdKQyxVQUFBQSxNQUFNLEVBQUUsS0FISjtBQUlKQyxVQUFBQSxJQUFJLEVBQUUsSUFKRjtBQUtKQyxVQUFBQSxRQUFRLEVBQUUsS0FMTjtBQU1KQyxVQUFBQSxXQUFXLEVBQUUsS0FOVDtBQU9KQyxVQUFBQSxVQUFVLEVBQUUsS0FQUjtBQVFKQyxVQUFBQSxPQUFPLEVBQUU7QUFSTCxTQUpEO0FBY1AsUUFBQSxhQUFhLEVBQUUsS0FBS0MsY0FkYjtBQWVQLFFBQUEsUUFBUSxFQUFFLEtBQUtDLFNBZlI7QUFnQlAsUUFBQSxZQUFZLEVBQUUsS0FBS0MsYUFoQlo7QUFpQlAsUUFBQSxTQUFTLEVBQUMsNkJBakJIO0FBa0JQLFFBQUEsYUFBYSxFQUFFO0FBQUNQLFVBQUFBLElBQUksRUFBRTtBQUFQO0FBbEJSLFNBb0JMUCxTQXBCSyxDQUFYO0FBc0JIOztBQUVELHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNESixRQURDLEVBRURHLFFBRkMsQ0FBUDtBQUlIOztBQS9Ea0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFJlc2l6YWJsZSB9IGZyb20gJ3JlLXJlc2l6YWJsZSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1haW5TcGxpdCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgX29uUmVzaXplU3RhcnQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIuc3RhcnRSZXNpemluZygpO1xuICAgIH07XG5cbiAgICBfb25SZXNpemUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIubm90aWZ5UmlnaHRIYW5kbGVSZXNpemVkKCk7XG4gICAgfTtcblxuICAgIF9vblJlc2l6ZVN0b3AgPSAoZXZlbnQsIGRpcmVjdGlvbiwgcmVmVG9FbGVtZW50LCBkZWx0YSkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLnN0b3BSZXNpemluZygpO1xuICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJteF9yaHNfc2l6ZVwiLCB0aGlzLl9sb2FkU2lkZVBhbmVsU2l6ZSgpLndpZHRoICsgZGVsdGEud2lkdGgpO1xuICAgIH07XG5cbiAgICBfbG9hZFNpZGVQYW5lbFNpemUoKSB7XG4gICAgICAgIGxldCByaHNTaXplID0gcGFyc2VJbnQod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibXhfcmhzX3NpemVcIiksIDEwKTtcblxuICAgICAgICBpZiAoaXNOYU4ocmhzU2l6ZSkpIHtcbiAgICAgICAgICAgIHJoc1NpemUgPSAzNTA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaGVpZ2h0OiBcIjEwMCVcIixcbiAgICAgICAgICAgIHdpZHRoOiByaHNTaXplLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgYm9keVZpZXcgPSBSZWFjdC5DaGlsZHJlbi5vbmx5KHRoaXMucHJvcHMuY2hpbGRyZW4pO1xuICAgICAgICBjb25zdCBwYW5lbFZpZXcgPSB0aGlzLnByb3BzLnBhbmVsO1xuXG4gICAgICAgIGNvbnN0IGhhc1Jlc2l6ZXIgPSAhdGhpcy5wcm9wcy5jb2xsYXBzZWRSaHMgJiYgcGFuZWxWaWV3O1xuXG4gICAgICAgIGxldCBjaGlsZHJlbjtcbiAgICAgICAgaWYgKGhhc1Jlc2l6ZXIpIHtcbiAgICAgICAgICAgIGNoaWxkcmVuID0gPFJlc2l6YWJsZVxuICAgICAgICAgICAgICAgIGRlZmF1bHRTaXplPXt0aGlzLl9sb2FkU2lkZVBhbmVsU2l6ZSgpfVxuICAgICAgICAgICAgICAgIG1pbldpZHRoPXsyNjR9XG4gICAgICAgICAgICAgICAgbWF4V2lkdGg9XCI1MCVcIlxuICAgICAgICAgICAgICAgIGVuYWJsZT17e1xuICAgICAgICAgICAgICAgICAgICB0b3A6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRvcFJpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tUmlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBib3R0b21MZWZ0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgdG9wTGVmdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICBvblJlc2l6ZVN0YXJ0PXt0aGlzLl9vblJlc2l6ZVN0YXJ0fVxuICAgICAgICAgICAgICAgIG9uUmVzaXplPXt0aGlzLl9vblJlc2l6ZX1cbiAgICAgICAgICAgICAgICBvblJlc2l6ZVN0b3A9e3RoaXMuX29uUmVzaXplU3RvcH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9SaWdodFBhbmVsX1Jlc2l6ZVdyYXBwZXJcIlxuICAgICAgICAgICAgICAgIGhhbmRsZUNsYXNzZXM9e3tsZWZ0OiBcIm14X1JpZ2h0UGFuZWxfUmVzaXplSGFuZGxlXCJ9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIHsgcGFuZWxWaWV3IH1cbiAgICAgICAgICAgIDwvUmVzaXphYmxlPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X01haW5TcGxpdFwiPlxuICAgICAgICAgICAgeyBib2R5VmlldyB9XG4gICAgICAgICAgICB7IGNoaWxkcmVuIH1cbiAgICAgICAgPC9kaXY+O1xuICAgIH1cbn1cbiJdfQ==