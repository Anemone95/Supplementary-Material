"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

let ConfirmAndWaitRedactDialog = (
/*
 * A dialog for confirming a redaction.
 * Also shows a spinner (and possible error) while the redaction is ongoing,
 * and only closes the dialog when the redaction is done or failed.
 *
 * This is done to prevent the edit history dialog racing with the redaction:
 * if this dialog closes and the MessageEditHistoryDialog is shown again,
 * it will fetch the relations again, which will race with the ongoing /redact request.
 * which will cause the edit to appear unredacted.
 *
 * To avoid this, we keep the dialog open as long as /redact is in progress.
 */
_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.ConfirmAndWaitRedactDialog"), _dec(_class = (_temp = class ConfirmAndWaitRedactDialog extends _react.default.PureComponent {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onParentFinished", async proceed => {
      if (proceed) {
        this.setState({
          isRedacting: true
        });

        try {
          await this.props.redact();
          this.props.onFinished(true);
        } catch (error) {
          const code = error.errcode || error.statusCode;

          if (typeof code !== "undefined") {
            this.setState({
              redactionErrorCode: code
            });
          } else {
            this.props.onFinished(true);
          }
        }
      } else {
        this.props.onFinished(false);
      }
    });
    this.state = {
      isRedacting: false,
      redactionErrorCode: null
    };
  }

  render() {
    if (this.state.isRedacting) {
      if (this.state.redactionErrorCode) {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");
        const code = this.state.redactionErrorCode;
        return /*#__PURE__*/_react.default.createElement(ErrorDialog, {
          onFinished: this.props.onFinished,
          title: (0, _languageHandler._t)('Error'),
          description: (0, _languageHandler._t)('You cannot delete this message. (%(code)s)', {
            code
          })
        });
      } else {
        const BaseDialog = sdk.getComponent("dialogs.BaseDialog");
        const Spinner = sdk.getComponent('elements.Spinner');
        return /*#__PURE__*/_react.default.createElement(BaseDialog, {
          onFinished: this.props.onFinished,
          hasCancel: false,
          title: (0, _languageHandler._t)("Removing…")
        }, /*#__PURE__*/_react.default.createElement(Spinner, null));
      }
    } else {
      const ConfirmRedactDialog = sdk.getComponent("dialogs.ConfirmRedactDialog");
      return /*#__PURE__*/_react.default.createElement(ConfirmRedactDialog, {
        onFinished: this.onParentFinished
      });
    }
  }

}, _temp)) || _class);
exports.default = ConfirmAndWaitRedactDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2cuanMiXSwibmFtZXMiOlsiQ29uZmlybUFuZFdhaXRSZWRhY3REaWFsb2ciLCJSZWFjdCIsIlB1cmVDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwicHJvY2VlZCIsInNldFN0YXRlIiwiaXNSZWRhY3RpbmciLCJyZWRhY3QiLCJvbkZpbmlzaGVkIiwiZXJyb3IiLCJjb2RlIiwiZXJyY29kZSIsInN0YXR1c0NvZGUiLCJyZWRhY3Rpb25FcnJvckNvZGUiLCJzdGF0ZSIsInJlbmRlciIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiQmFzZURpYWxvZyIsIlNwaW5uZXIiLCJDb25maXJtUmVkYWN0RGlhbG9nIiwib25QYXJlbnRGaW5pc2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQWVxQkEsMEI7QUFickI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO09BQ0MsZ0RBQXFCLDBDQUFyQixDLHlCQUFELE1BQ3FCQSwwQkFEckIsU0FDd0RDLGVBQU1DLGFBRDlELENBQzRFO0FBQ3hFQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFEZSw0REFRQSxNQUFPQyxPQUFQLElBQW1CO0FBQ2xDLFVBQUlBLE9BQUosRUFBYTtBQUNULGFBQUtDLFFBQUwsQ0FBYztBQUFDQyxVQUFBQSxXQUFXLEVBQUU7QUFBZCxTQUFkOztBQUNBLFlBQUk7QUFDQSxnQkFBTSxLQUFLSCxLQUFMLENBQVdJLE1BQVgsRUFBTjtBQUNBLGVBQUtKLEtBQUwsQ0FBV0ssVUFBWCxDQUFzQixJQUF0QjtBQUNILFNBSEQsQ0FHRSxPQUFPQyxLQUFQLEVBQWM7QUFDWixnQkFBTUMsSUFBSSxHQUFHRCxLQUFLLENBQUNFLE9BQU4sSUFBaUJGLEtBQUssQ0FBQ0csVUFBcEM7O0FBQ0EsY0FBSSxPQUFPRixJQUFQLEtBQWdCLFdBQXBCLEVBQWlDO0FBQzdCLGlCQUFLTCxRQUFMLENBQWM7QUFBQ1EsY0FBQUEsa0JBQWtCLEVBQUVIO0FBQXJCLGFBQWQ7QUFDSCxXQUZELE1BRU87QUFDSCxpQkFBS1AsS0FBTCxDQUFXSyxVQUFYLENBQXNCLElBQXRCO0FBQ0g7QUFDSjtBQUNKLE9BYkQsTUFhTztBQUNILGFBQUtMLEtBQUwsQ0FBV0ssVUFBWCxDQUFzQixLQUF0QjtBQUNIO0FBQ0osS0F6QmtCO0FBRWYsU0FBS00sS0FBTCxHQUFhO0FBQ1RSLE1BQUFBLFdBQVcsRUFBRSxLQURKO0FBRVRPLE1BQUFBLGtCQUFrQixFQUFFO0FBRlgsS0FBYjtBQUlIOztBQXFCREUsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsUUFBSSxLQUFLRCxLQUFMLENBQVdSLFdBQWYsRUFBNEI7QUFDeEIsVUFBSSxLQUFLUSxLQUFMLENBQVdELGtCQUFmLEVBQW1DO0FBQy9CLGNBQU1HLFdBQVcsR0FBR0MsR0FBRyxDQUFDQyxZQUFKLENBQWlCLHFCQUFqQixDQUFwQjtBQUNBLGNBQU1SLElBQUksR0FBRyxLQUFLSSxLQUFMLENBQVdELGtCQUF4QjtBQUNBLDRCQUNJLDZCQUFDLFdBQUQ7QUFDSSxVQUFBLFVBQVUsRUFBRSxLQUFLVixLQUFMLENBQVdLLFVBRDNCO0FBRUksVUFBQSxLQUFLLEVBQUUseUJBQUcsT0FBSCxDQUZYO0FBR0ksVUFBQSxXQUFXLEVBQUUseUJBQUcsNENBQUgsRUFBaUQ7QUFBQ0UsWUFBQUE7QUFBRCxXQUFqRDtBQUhqQixVQURKO0FBT0gsT0FWRCxNQVVPO0FBQ0gsY0FBTVMsVUFBVSxHQUFHRixHQUFHLENBQUNDLFlBQUosQ0FBaUIsb0JBQWpCLENBQW5CO0FBQ0EsY0FBTUUsT0FBTyxHQUFHSCxHQUFHLENBQUNDLFlBQUosQ0FBaUIsa0JBQWpCLENBQWhCO0FBQ0EsNEJBQ0ksNkJBQUMsVUFBRDtBQUNJLFVBQUEsVUFBVSxFQUFFLEtBQUtmLEtBQUwsQ0FBV0ssVUFEM0I7QUFFSSxVQUFBLFNBQVMsRUFBRSxLQUZmO0FBR0ksVUFBQSxLQUFLLEVBQUUseUJBQUcsV0FBSDtBQUhYLHdCQUlJLDZCQUFDLE9BQUQsT0FKSixDQURKO0FBUUg7QUFDSixLQXZCRCxNQXVCTztBQUNILFlBQU1hLG1CQUFtQixHQUFHSixHQUFHLENBQUNDLFlBQUosQ0FBaUIsNkJBQWpCLENBQTVCO0FBQ0EsMEJBQU8sNkJBQUMsbUJBQUQ7QUFBcUIsUUFBQSxVQUFVLEVBQUUsS0FBS0k7QUFBdEMsUUFBUDtBQUNIO0FBQ0o7O0FBeER1RSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLypcbiAqIEEgZGlhbG9nIGZvciBjb25maXJtaW5nIGEgcmVkYWN0aW9uLlxuICogQWxzbyBzaG93cyBhIHNwaW5uZXIgKGFuZCBwb3NzaWJsZSBlcnJvcikgd2hpbGUgdGhlIHJlZGFjdGlvbiBpcyBvbmdvaW5nLFxuICogYW5kIG9ubHkgY2xvc2VzIHRoZSBkaWFsb2cgd2hlbiB0aGUgcmVkYWN0aW9uIGlzIGRvbmUgb3IgZmFpbGVkLlxuICpcbiAqIFRoaXMgaXMgZG9uZSB0byBwcmV2ZW50IHRoZSBlZGl0IGhpc3RvcnkgZGlhbG9nIHJhY2luZyB3aXRoIHRoZSByZWRhY3Rpb246XG4gKiBpZiB0aGlzIGRpYWxvZyBjbG9zZXMgYW5kIHRoZSBNZXNzYWdlRWRpdEhpc3RvcnlEaWFsb2cgaXMgc2hvd24gYWdhaW4sXG4gKiBpdCB3aWxsIGZldGNoIHRoZSByZWxhdGlvbnMgYWdhaW4sIHdoaWNoIHdpbGwgcmFjZSB3aXRoIHRoZSBvbmdvaW5nIC9yZWRhY3QgcmVxdWVzdC5cbiAqIHdoaWNoIHdpbGwgY2F1c2UgdGhlIGVkaXQgdG8gYXBwZWFyIHVucmVkYWN0ZWQuXG4gKlxuICogVG8gYXZvaWQgdGhpcywgd2Uga2VlcCB0aGUgZGlhbG9nIG9wZW4gYXMgbG9uZyBhcyAvcmVkYWN0IGlzIGluIHByb2dyZXNzLlxuICovXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLkNvbmZpcm1BbmRXYWl0UmVkYWN0RGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25maXJtQW5kV2FpdFJlZGFjdERpYWxvZyBleHRlbmRzIFJlYWN0LlB1cmVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGlzUmVkYWN0aW5nOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZGFjdGlvbkVycm9yQ29kZTogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBvblBhcmVudEZpbmlzaGVkID0gYXN5bmMgKHByb2NlZWQpID0+IHtcbiAgICAgICAgaWYgKHByb2NlZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2lzUmVkYWN0aW5nOiB0cnVlfSk7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucHJvcHMucmVkYWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gZXJyb3IuZXJyY29kZSB8fCBlcnJvci5zdGF0dXNDb2RlO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29kZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtyZWRhY3Rpb25FcnJvckNvZGU6IGNvZGV9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmlzUmVkYWN0aW5nKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGF0ZS5yZWRhY3Rpb25FcnJvckNvZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvZGUgPSB0aGlzLnN0YXRlLnJlZGFjdGlvbkVycm9yQ29kZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8RXJyb3JEaWFsb2dcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXtfdCgnRXJyb3InKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uPXtfdCgnWW91IGNhbm5vdCBkZWxldGUgdGhpcyBtZXNzYWdlLiAoJShjb2RlKXMpJywge2NvZGV9KX1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQmFzZURpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBTcGlubmVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3Bpbm5lcicpO1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxCYXNlRGlhbG9nXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e2ZhbHNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9e190KFwiUmVtb3ZpbmfigKZcIil9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9CYXNlRGlhbG9nPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBDb25maXJtUmVkYWN0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQ29uZmlybVJlZGFjdERpYWxvZ1wiKTtcbiAgICAgICAgICAgIHJldHVybiA8Q29uZmlybVJlZGFjdERpYWxvZyBvbkZpbmlzaGVkPXt0aGlzLm9uUGFyZW50RmluaXNoZWR9IC8+O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19