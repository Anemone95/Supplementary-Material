"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../languageHandler");

var _ContextMenu = require("../../structures/ContextMenu");

var _CallHandler = _interopRequireDefault(require("../../../CallHandler"));

var _InviteDialog = _interopRequireWildcard(require("../dialogs/InviteDialog"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

/*
Copyright 2020 New Vector Ltd

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
class CallContextMenu extends _react.default.Component
/*:: <IProps>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onHoldClick", () => {
      this.props.call.setRemoteOnHold(true);
      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onUnholdClick", () => {
      _CallHandler.default.sharedInstance().setActiveCallRoomId(this.props.call.roomId);

      this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onTransferClick", () => {
      _Modal.default.createTrackedDialog('Transfer Call', '', _InviteDialog.default, {
        kind: _InviteDialog.KIND_CALL_TRANSFER,
        call: this.props.call
      },
      /*className=*/
      null,
      /*isPriority=*/
      false,
      /*isStatic=*/
      true);

      this.props.onFinished();
    });
  }

  render() {
    const holdUnholdCaption = this.props.call.isRemoteOnHold() ? (0, _languageHandler._t)("Resume") : (0, _languageHandler._t)("Hold");
    const handler = this.props.call.isRemoteOnHold() ? this.onUnholdClick : this.onHoldClick;
    let transferItem;

    if (this.props.call.opponentCanBeTransferred()) {
      transferItem = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_CallContextMenu_item",
        onClick: this.onTransferClick
      }, (0, _languageHandler._t)("Transfer"));
    }

    return /*#__PURE__*/_react.default.createElement(_ContextMenu.ContextMenu, this.props, /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      className: "mx_CallContextMenu_item",
      onClick: handler
    }, holdUnholdCaption), transferItem);
  }

}

exports.default = CallContextMenu;
(0, _defineProperty2.default)(CallContextMenu, "propTypes", {
  // js-sdk User object. Not required because it might not exist.
  user: _propTypes.default.object
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvQ2FsbENvbnRleHRNZW51LnRzeCJdLCJuYW1lcyI6WyJDYWxsQ29udGV4dE1lbnUiLCJSZWFjdCIsIkNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJjYWxsIiwic2V0UmVtb3RlT25Ib2xkIiwib25GaW5pc2hlZCIsIkNhbGxIYW5kbGVyIiwic2hhcmVkSW5zdGFuY2UiLCJzZXRBY3RpdmVDYWxsUm9vbUlkIiwicm9vbUlkIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiSW52aXRlRGlhbG9nIiwia2luZCIsIktJTkRfQ0FMTF9UUkFOU0ZFUiIsInJlbmRlciIsImhvbGRVbmhvbGRDYXB0aW9uIiwiaXNSZW1vdGVPbkhvbGQiLCJoYW5kbGVyIiwib25VbmhvbGRDbGljayIsIm9uSG9sZENsaWNrIiwidHJhbnNmZXJJdGVtIiwib3Bwb25lbnRDYW5CZVRyYW5zZmVycmVkIiwib25UcmFuc2ZlckNsaWNrIiwidXNlciIsIlByb3BUeXBlcyIsIm9iamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZWUsTUFBTUEsZUFBTixTQUE4QkMsZUFBTUM7QUFBcEM7QUFBc0Q7QUFNakVDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHVEQUlMLE1BQU07QUFDaEIsV0FBS0EsS0FBTCxDQUFXQyxJQUFYLENBQWdCQyxlQUFoQixDQUFnQyxJQUFoQztBQUNBLFdBQUtGLEtBQUwsQ0FBV0csVUFBWDtBQUNILEtBUGtCO0FBQUEseURBU0gsTUFBTTtBQUNsQkMsMkJBQVlDLGNBQVosR0FBNkJDLG1CQUE3QixDQUFpRCxLQUFLTixLQUFMLENBQVdDLElBQVgsQ0FBZ0JNLE1BQWpFOztBQUVBLFdBQUtQLEtBQUwsQ0FBV0csVUFBWDtBQUNILEtBYmtCO0FBQUEsMkRBZUQsTUFBTTtBQUNwQksscUJBQU1DLG1CQUFOLENBQ0ksZUFESixFQUNxQixFQURyQixFQUN5QkMscUJBRHpCLEVBQ3VDO0FBQUNDLFFBQUFBLElBQUksRUFBRUMsZ0NBQVA7QUFBMkJYLFFBQUFBLElBQUksRUFBRSxLQUFLRCxLQUFMLENBQVdDO0FBQTVDLE9BRHZDO0FBRUk7QUFBYyxVQUZsQjtBQUV3QjtBQUFlLFdBRnZDO0FBRThDO0FBQWEsVUFGM0Q7O0FBSUEsV0FBS0QsS0FBTCxDQUFXRyxVQUFYO0FBQ0gsS0FyQmtCO0FBRWxCOztBQXFCRFUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsVUFBTUMsaUJBQWlCLEdBQUcsS0FBS2QsS0FBTCxDQUFXQyxJQUFYLENBQWdCYyxjQUFoQixLQUFtQyx5QkFBRyxRQUFILENBQW5DLEdBQWtELHlCQUFHLE1BQUgsQ0FBNUU7QUFDQSxVQUFNQyxPQUFPLEdBQUcsS0FBS2hCLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQmMsY0FBaEIsS0FBbUMsS0FBS0UsYUFBeEMsR0FBd0QsS0FBS0MsV0FBN0U7QUFFQSxRQUFJQyxZQUFKOztBQUNBLFFBQUksS0FBS25CLEtBQUwsQ0FBV0MsSUFBWCxDQUFnQm1CLHdCQUFoQixFQUFKLEVBQWdEO0FBQzVDRCxNQUFBQSxZQUFZLGdCQUFHLDZCQUFDLHFCQUFEO0FBQVUsUUFBQSxTQUFTLEVBQUMseUJBQXBCO0FBQThDLFFBQUEsT0FBTyxFQUFFLEtBQUtFO0FBQTVELFNBQ1YseUJBQUcsVUFBSCxDQURVLENBQWY7QUFHSDs7QUFFRCx3QkFBTyw2QkFBQyx3QkFBRCxFQUFpQixLQUFLckIsS0FBdEIsZUFDSCw2QkFBQyxxQkFBRDtBQUFVLE1BQUEsU0FBUyxFQUFDLHlCQUFwQjtBQUE4QyxNQUFBLE9BQU8sRUFBRWdCO0FBQXZELE9BQ0tGLGlCQURMLENBREcsRUFJRkssWUFKRSxDQUFQO0FBTUg7O0FBOUNnRTs7OzhCQUFoRHZCLGUsZUFDRTtBQUNmO0FBQ0EwQixFQUFBQSxJQUFJLEVBQUVDLG1CQUFVQztBQUZELEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMjAgTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7IENvbnRleHRNZW51LCBJUHJvcHMgYXMgSUNvbnRleHRNZW51UHJvcHMsIE1lbnVJdGVtIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgeyBNYXRyaXhDYWxsIH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvd2VicnRjL2NhbGwnO1xuaW1wb3J0IENhbGxIYW5kbGVyIGZyb20gJy4uLy4uLy4uL0NhbGxIYW5kbGVyJztcbmltcG9ydCBJbnZpdGVEaWFsb2csIHsgS0lORF9DQUxMX1RSQU5TRkVSIH0gZnJvbSAnLi4vZGlhbG9ncy9JbnZpdGVEaWFsb2cnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcblxuaW50ZXJmYWNlIElQcm9wcyBleHRlbmRzIElDb250ZXh0TWVudVByb3BzIHtcbiAgICBjYWxsOiBNYXRyaXhDYWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDYWxsQ29udGV4dE1lbnUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzPiB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLy8ganMtc2RrIFVzZXIgb2JqZWN0LiBOb3QgcmVxdWlyZWQgYmVjYXVzZSBpdCBtaWdodCBub3QgZXhpc3QuXG4gICAgICAgIHVzZXI6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG5cbiAgICBvbkhvbGRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jYWxsLnNldFJlbW90ZU9uSG9sZCh0cnVlKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfVxuXG4gICAgb25VbmhvbGRDbGljayA9ICgpID0+IHtcbiAgICAgICAgQ2FsbEhhbmRsZXIuc2hhcmVkSW5zdGFuY2UoKS5zZXRBY3RpdmVDYWxsUm9vbUlkKHRoaXMucHJvcHMuY2FsbC5yb29tSWQpO1xuXG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCgpO1xuICAgIH1cblxuICAgIG9uVHJhbnNmZXJDbGljayA9ICgpID0+IHtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcbiAgICAgICAgICAgICdUcmFuc2ZlciBDYWxsJywgJycsIEludml0ZURpYWxvZywge2tpbmQ6IEtJTkRfQ0FMTF9UUkFOU0ZFUiwgY2FsbDogdGhpcy5wcm9wcy5jYWxsfSxcbiAgICAgICAgICAgIC8qY2xhc3NOYW1lPSovbnVsbCwgLyppc1ByaW9yaXR5PSovZmFsc2UsIC8qaXNTdGF0aWM9Ki90cnVlLFxuICAgICAgICApO1xuICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGhvbGRVbmhvbGRDYXB0aW9uID0gdGhpcy5wcm9wcy5jYWxsLmlzUmVtb3RlT25Ib2xkKCkgPyBfdChcIlJlc3VtZVwiKSA6IF90KFwiSG9sZFwiKTtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHRoaXMucHJvcHMuY2FsbC5pc1JlbW90ZU9uSG9sZCgpID8gdGhpcy5vblVuaG9sZENsaWNrIDogdGhpcy5vbkhvbGRDbGljaztcblxuICAgICAgICBsZXQgdHJhbnNmZXJJdGVtO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jYWxsLm9wcG9uZW50Q2FuQmVUcmFuc2ZlcnJlZCgpKSB7XG4gICAgICAgICAgICB0cmFuc2Zlckl0ZW0gPSA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfQ2FsbENvbnRleHRNZW51X2l0ZW1cIiBvbkNsaWNrPXt0aGlzLm9uVHJhbnNmZXJDbGlja30+XG4gICAgICAgICAgICAgICAge190KFwiVHJhbnNmZXJcIil9XG4gICAgICAgICAgICA8L01lbnVJdGVtPjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8Q29udGV4dE1lbnUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X0NhbGxDb250ZXh0TWVudV9pdGVtXCIgb25DbGljaz17aGFuZGxlcn0+XG4gICAgICAgICAgICAgICAge2hvbGRVbmhvbGRDYXB0aW9ufVxuICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgIHt0cmFuc2Zlckl0ZW19XG4gICAgICAgIDwvQ29udGV4dE1lbnU+O1xuICAgIH1cbn1cbiJdfQ==