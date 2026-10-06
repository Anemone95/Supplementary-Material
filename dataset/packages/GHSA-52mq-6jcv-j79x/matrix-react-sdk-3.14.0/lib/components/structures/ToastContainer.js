"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var React = _interopRequireWildcard(require("react"));

var _ToastStore = _interopRequireDefault(require("../../stores/ToastStore"));

var _classnames = _interopRequireDefault(require("classnames"));

/*
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
class ToastContainer extends React.Component
/*:: <{}, IState>*/
{
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "_onToastStoreUpdate", () => {
      this.setState({
        toasts: _ToastStore.default.sharedInstance().getToasts(),
        countSeen: _ToastStore.default.sharedInstance().getCountSeen()
      });
    });
    this.state = {
      toasts: _ToastStore.default.sharedInstance().getToasts(),
      countSeen: _ToastStore.default.sharedInstance().getCountSeen()
    }; // Start listening here rather than in componentDidMount because
    // toasts may dismiss themselves in their didMount if they find
    // they're already irrelevant by the time they're mounted, and
    // our own componentDidMount is too late.

    _ToastStore.default.sharedInstance().on('update', this._onToastStoreUpdate);
  }

  componentWillUnmount() {
    _ToastStore.default.sharedInstance().removeListener('update', this._onToastStoreUpdate);
  }

  render() {
    const totalCount = this.state.toasts.length;
    const isStacked = totalCount > 1;
    let toast;

    if (totalCount !== 0) {
      const topToast = this.state.toasts[0];
      const {
        title,
        icon,
        key,
        component,
        className,
        props
      } = topToast;
      const toastClasses = (0, _classnames.default)("mx_Toast_toast", {
        "mx_Toast_hasIcon": icon,
        [`mx_Toast_icon_${icon}`]: icon
      }, className);
      let countIndicator;

      if (isStacked || this.state.countSeen > 0) {
        countIndicator = ` (${this.state.countSeen + 1}/${this.state.countSeen + totalCount})`;
      }

      const toastProps = Object.assign({}, props, {
        key,
        toastKey: key
      });
      toast = /*#__PURE__*/React.createElement("div", {
        className: toastClasses
      }, /*#__PURE__*/React.createElement("div", {
        className: "mx_Toast_title"
      }, /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("span", null, countIndicator)), /*#__PURE__*/React.createElement("div", {
        className: "mx_Toast_body"
      }, /*#__PURE__*/React.createElement(component, toastProps)));
    }

    const containerClasses = (0, _classnames.default)("mx_ToastContainer", {
      "mx_ToastContainer_stacked": isStacked
    });
    return /*#__PURE__*/React.createElement("div", {
      className: containerClasses,
      role: "alert"
    }, toast);
  }

}

exports.default = ToastContainer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVG9hc3RDb250YWluZXIudHN4Il0sIm5hbWVzIjpbIlRvYXN0Q29udGFpbmVyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInNldFN0YXRlIiwidG9hc3RzIiwiVG9hc3RTdG9yZSIsInNoYXJlZEluc3RhbmNlIiwiZ2V0VG9hc3RzIiwiY291bnRTZWVuIiwiZ2V0Q291bnRTZWVuIiwic3RhdGUiLCJvbiIsIl9vblRvYXN0U3RvcmVVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwicmVuZGVyIiwidG90YWxDb3VudCIsImxlbmd0aCIsImlzU3RhY2tlZCIsInRvYXN0IiwidG9wVG9hc3QiLCJ0aXRsZSIsImljb24iLCJrZXkiLCJjb21wb25lbnQiLCJjbGFzc05hbWUiLCJ0b2FzdENsYXNzZXMiLCJjb3VudEluZGljYXRvciIsInRvYXN0UHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJ0b2FzdEtleSIsImNyZWF0ZUVsZW1lbnQiLCJjb250YWluZXJDbGFzc2VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQWxCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFXZSxNQUFNQSxjQUFOLFNBQTZCQyxLQUFLLENBQUNDO0FBQW5DO0FBQXlEO0FBQ3BFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUUMsT0FBUixFQUFpQjtBQUN4QixVQUFNRCxLQUFOLEVBQWFDLE9BQWI7QUFEd0IsK0RBa0JOLE1BQU07QUFDeEIsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLE1BQU0sRUFBRUMsb0JBQVdDLGNBQVgsR0FBNEJDLFNBQTVCLEVBREU7QUFFVkMsUUFBQUEsU0FBUyxFQUFFSCxvQkFBV0MsY0FBWCxHQUE0QkcsWUFBNUI7QUFGRCxPQUFkO0FBSUgsS0F2QjJCO0FBRXhCLFNBQUtDLEtBQUwsR0FBYTtBQUNUTixNQUFBQSxNQUFNLEVBQUVDLG9CQUFXQyxjQUFYLEdBQTRCQyxTQUE1QixFQURDO0FBRVRDLE1BQUFBLFNBQVMsRUFBRUgsb0JBQVdDLGNBQVgsR0FBNEJHLFlBQTVCO0FBRkYsS0FBYixDQUZ3QixDQU94QjtBQUNBO0FBQ0E7QUFDQTs7QUFDQUosd0JBQVdDLGNBQVgsR0FBNEJLLEVBQTVCLENBQStCLFFBQS9CLEVBQXlDLEtBQUtDLG1CQUE5QztBQUNIOztBQUVEQyxFQUFBQSxvQkFBb0IsR0FBRztBQUNuQlIsd0JBQVdDLGNBQVgsR0FBNEJRLGNBQTVCLENBQTJDLFFBQTNDLEVBQXFELEtBQUtGLG1CQUExRDtBQUNIOztBQVNERyxFQUFBQSxNQUFNLEdBQUc7QUFDTCxVQUFNQyxVQUFVLEdBQUcsS0FBS04sS0FBTCxDQUFXTixNQUFYLENBQWtCYSxNQUFyQztBQUNBLFVBQU1DLFNBQVMsR0FBR0YsVUFBVSxHQUFHLENBQS9CO0FBQ0EsUUFBSUcsS0FBSjs7QUFDQSxRQUFJSCxVQUFVLEtBQUssQ0FBbkIsRUFBc0I7QUFDbEIsWUFBTUksUUFBUSxHQUFHLEtBQUtWLEtBQUwsQ0FBV04sTUFBWCxDQUFrQixDQUFsQixDQUFqQjtBQUNBLFlBQU07QUFBQ2lCLFFBQUFBLEtBQUQ7QUFBUUMsUUFBQUEsSUFBUjtBQUFjQyxRQUFBQSxHQUFkO0FBQW1CQyxRQUFBQSxTQUFuQjtBQUE4QkMsUUFBQUEsU0FBOUI7QUFBeUN4QixRQUFBQTtBQUF6QyxVQUFrRG1CLFFBQXhEO0FBQ0EsWUFBTU0sWUFBWSxHQUFHLHlCQUFXLGdCQUFYLEVBQTZCO0FBQzlDLDRCQUFvQkosSUFEMEI7QUFFOUMsU0FBRSxpQkFBZ0JBLElBQUssRUFBdkIsR0FBMkJBO0FBRm1CLE9BQTdCLEVBR2xCRyxTQUhrQixDQUFyQjtBQUtBLFVBQUlFLGNBQUo7O0FBQ0EsVUFBSVQsU0FBUyxJQUFJLEtBQUtSLEtBQUwsQ0FBV0YsU0FBWCxHQUF1QixDQUF4QyxFQUEyQztBQUN2Q21CLFFBQUFBLGNBQWMsR0FBSSxLQUFJLEtBQUtqQixLQUFMLENBQVdGLFNBQVgsR0FBdUIsQ0FBRSxJQUFHLEtBQUtFLEtBQUwsQ0FBV0YsU0FBWCxHQUF1QlEsVUFBVyxHQUFwRjtBQUNIOztBQUVELFlBQU1ZLFVBQVUsR0FBR0MsTUFBTSxDQUFDQyxNQUFQLENBQWMsRUFBZCxFQUFrQjdCLEtBQWxCLEVBQXlCO0FBQ3hDc0IsUUFBQUEsR0FEd0M7QUFFeENRLFFBQUFBLFFBQVEsRUFBRVI7QUFGOEIsT0FBekIsQ0FBbkI7QUFJQUosTUFBQUEsS0FBSyxnQkFBSTtBQUFLLFFBQUEsU0FBUyxFQUFFTztBQUFoQixzQkFDTDtBQUFLLFFBQUEsU0FBUyxFQUFDO0FBQWYsc0JBQ0ksZ0NBQUtMLEtBQUwsQ0FESixlQUVJLGtDQUFPTSxjQUFQLENBRkosQ0FESyxlQUtMO0FBQUssUUFBQSxTQUFTLEVBQUM7QUFBZixzQkFBZ0M3QixLQUFLLENBQUNrQyxhQUFOLENBQW9CUixTQUFwQixFQUErQkksVUFBL0IsQ0FBaEMsQ0FMSyxDQUFUO0FBT0g7O0FBRUQsVUFBTUssZ0JBQWdCLEdBQUcseUJBQVcsbUJBQVgsRUFBZ0M7QUFDckQsbUNBQTZCZjtBQUR3QixLQUFoQyxDQUF6QjtBQUlBLHdCQUNJO0FBQUssTUFBQSxTQUFTLEVBQUVlLGdCQUFoQjtBQUFrQyxNQUFBLElBQUksRUFBQztBQUF2QyxPQUNLZCxLQURMLENBREo7QUFLSDs7QUFqRW1FIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgVG9hc3RTdG9yZSwge0lUb2FzdH0gZnJvbSBcIi4uLy4uL3N0b3Jlcy9Ub2FzdFN0b3JlXCI7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tIFwiY2xhc3NuYW1lc1wiO1xuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICB0b2FzdHM6IElUb2FzdDxhbnk+W107XG4gICAgY291bnRTZWVuOiBudW1iZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRvYXN0Q29udGFpbmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHt9LCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICB0b2FzdHM6IFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5nZXRUb2FzdHMoKSxcbiAgICAgICAgICAgIGNvdW50U2VlbjogVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLmdldENvdW50U2VlbigpLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFN0YXJ0IGxpc3RlbmluZyBoZXJlIHJhdGhlciB0aGFuIGluIGNvbXBvbmVudERpZE1vdW50IGJlY2F1c2VcbiAgICAgICAgLy8gdG9hc3RzIG1heSBkaXNtaXNzIHRoZW1zZWx2ZXMgaW4gdGhlaXIgZGlkTW91bnQgaWYgdGhleSBmaW5kXG4gICAgICAgIC8vIHRoZXkncmUgYWxyZWFkeSBpcnJlbGV2YW50IGJ5IHRoZSB0aW1lIHRoZXkncmUgbW91bnRlZCwgYW5kXG4gICAgICAgIC8vIG91ciBvd24gY29tcG9uZW50RGlkTW91bnQgaXMgdG9vIGxhdGUuXG4gICAgICAgIFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5vbigndXBkYXRlJywgdGhpcy5fb25Ub2FzdFN0b3JlVXBkYXRlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgVG9hc3RTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLnJlbW92ZUxpc3RlbmVyKCd1cGRhdGUnLCB0aGlzLl9vblRvYXN0U3RvcmVVcGRhdGUpO1xuICAgIH1cblxuICAgIF9vblRvYXN0U3RvcmVVcGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdG9hc3RzOiBUb2FzdFN0b3JlLnNoYXJlZEluc3RhbmNlKCkuZ2V0VG9hc3RzKCksXG4gICAgICAgICAgICBjb3VudFNlZW46IFRvYXN0U3RvcmUuc2hhcmVkSW5zdGFuY2UoKS5nZXRDb3VudFNlZW4oKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgdG90YWxDb3VudCA9IHRoaXMuc3RhdGUudG9hc3RzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgaXNTdGFja2VkID0gdG90YWxDb3VudCA+IDE7XG4gICAgICAgIGxldCB0b2FzdDtcbiAgICAgICAgaWYgKHRvdGFsQ291bnQgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHRvcFRvYXN0ID0gdGhpcy5zdGF0ZS50b2FzdHNbMF07XG4gICAgICAgICAgICBjb25zdCB7dGl0bGUsIGljb24sIGtleSwgY29tcG9uZW50LCBjbGFzc05hbWUsIHByb3BzfSA9IHRvcFRvYXN0O1xuICAgICAgICAgICAgY29uc3QgdG9hc3RDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X1RvYXN0X3RvYXN0XCIsIHtcbiAgICAgICAgICAgICAgICBcIm14X1RvYXN0X2hhc0ljb25cIjogaWNvbixcbiAgICAgICAgICAgICAgICBbYG14X1RvYXN0X2ljb25fJHtpY29ufWBdOiBpY29uLFxuICAgICAgICAgICAgfSwgY2xhc3NOYW1lKTtcblxuICAgICAgICAgICAgbGV0IGNvdW50SW5kaWNhdG9yO1xuICAgICAgICAgICAgaWYgKGlzU3RhY2tlZCB8fCB0aGlzLnN0YXRlLmNvdW50U2VlbiA+IDApIHtcbiAgICAgICAgICAgICAgICBjb3VudEluZGljYXRvciA9IGAgKCR7dGhpcy5zdGF0ZS5jb3VudFNlZW4gKyAxfS8ke3RoaXMuc3RhdGUuY291bnRTZWVuICsgdG90YWxDb3VudH0pYDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdG9hc3RQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHByb3BzLCB7XG4gICAgICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgICAgIHRvYXN0S2V5OiBrZXksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRvYXN0ID0gKDxkaXYgY2xhc3NOYW1lPXt0b2FzdENsYXNzZXN9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9hc3RfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgyPnt0aXRsZX08L2gyPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj57Y291bnRJbmRpY2F0b3J9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9hc3RfYm9keVwiPntSZWFjdC5jcmVhdGVFbGVtZW50KGNvbXBvbmVudCwgdG9hc3RQcm9wcyl9PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29udGFpbmVyQ2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9Ub2FzdENvbnRhaW5lclwiLCB7XG4gICAgICAgICAgICBcIm14X1RvYXN0Q29udGFpbmVyX3N0YWNrZWRcIjogaXNTdGFja2VkLFxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2NvbnRhaW5lckNsYXNzZXN9IHJvbGU9XCJhbGVydFwiPlxuICAgICAgICAgICAgICAgIHt0b2FzdH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==