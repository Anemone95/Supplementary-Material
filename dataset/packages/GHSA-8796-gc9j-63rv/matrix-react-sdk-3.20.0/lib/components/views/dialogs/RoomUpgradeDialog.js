"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let RoomUpgradeDialog = (_dec = (0, _replaceableComponent.replaceableComponent)("views.dialogs.RoomUpgradeDialog"), _dec(_class = (_temp = _class2 = class RoomUpgradeDialog extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      busy: true
    });
    (0, _defineProperty2.default)(this, "_onCancelClick", () => {
      this.props.onFinished(false);
    });
    (0, _defineProperty2.default)(this, "_onUpgradeClick", () => {
      this.setState({
        busy: true
      });

      _MatrixClientPeg.MatrixClientPeg.get().upgradeRoom(this.props.room.roomId, this._targetVersion).then(() => {
        this.props.onFinished(true);
      }).catch(err => {
        const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog");

        _Modal.default.createTrackedDialog('Failed to upgrade room', '', ErrorDialog, {
          title: (0, _languageHandler._t)("Failed to upgrade room"),
          description: err && err.message ? err.message : (0, _languageHandler._t)("The room upgrade could not be completed")
        });
      }).finally(() => {
        this.setState({
          busy: false
        });
      });
    });
  }

  async componentDidMount() {
    const recommended = await this.props.room.getRecommendedVersion();
    this._targetVersion = recommended.version;
    this.setState({
      busy: false
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const DialogButtons = sdk.getComponent('views.elements.DialogButtons');
    const Spinner = sdk.getComponent('views.elements.Spinner');
    let buttons;

    if (this.state.busy) {
      buttons = /*#__PURE__*/_react.default.createElement(Spinner, null);
    } else {
      buttons = /*#__PURE__*/_react.default.createElement(DialogButtons, {
        primaryButton: (0, _languageHandler._t)('Upgrade this room to version %(version)s', {
          version: this._targetVersion
        }),
        primaryButtonClass: "danger",
        hasCancel: true,
        onPrimaryButtonClick: this._onUpgradeClick,
        focus: this.props.focus,
        onCancel: this._onCancelClick
      });
    }

    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_RoomUpgradeDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Upgrade Room Version"),
      contentId: "mx_Dialog_content",
      hasCancel: true
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Upgrading this room requires closing down the current " + "instance of the room and creating a new room in its place. " + "To give room members the best possible experience, we will:")), /*#__PURE__*/_react.default.createElement("ol", null, /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Create a new room with the same name, description and avatar")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Update any local room aliases to point to the new room")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Stop users from speaking in the old version of the room, and post a message advising users to move to the new room")), /*#__PURE__*/_react.default.createElement("li", null, (0, _languageHandler._t)("Put a link back to the old room at the start of the new room so people can see old messages"))), buttons);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  room: _propTypes.default.object.isRequired,
  onFinished: _propTypes.default.func.isRequired
}), _temp)) || _class);
exports.default = RoomUpgradeDialog;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUm9vbVVwZ3JhZGVEaWFsb2cuanMiXSwibmFtZXMiOlsiUm9vbVVwZ3JhZGVEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImJ1c3kiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzZXRTdGF0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwZ3JhZGVSb29tIiwicm9vbSIsInJvb21JZCIsIl90YXJnZXRWZXJzaW9uIiwidGhlbiIsImNhdGNoIiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImZpbmFsbHkiLCJjb21wb25lbnREaWRNb3VudCIsInJlY29tbWVuZGVkIiwiZ2V0UmVjb21tZW5kZWRWZXJzaW9uIiwidmVyc2lvbiIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJEaWFsb2dCdXR0b25zIiwiU3Bpbm5lciIsImJ1dHRvbnMiLCJzdGF0ZSIsIl9vblVwZ3JhZGVDbGljayIsImZvY3VzIiwiX29uQ2FuY2VsQ2xpY2siLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7OztJQUdxQkEsaUIsV0FEcEIsZ0RBQXFCLGlDQUFyQixDLG1DQUFELE1BQ3FCQSxpQkFEckIsU0FDK0NDLGVBQU1DLFNBRHJELENBQytEO0FBQUE7QUFBQTtBQUFBLGlEQU1uRDtBQUNKQyxNQUFBQSxJQUFJLEVBQUU7QUFERixLQU5tRDtBQUFBLDBEQWdCMUMsTUFBTTtBQUNuQixXQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQWxCMEQ7QUFBQSwyREFvQnpDLE1BQU07QUFDcEIsV0FBS0MsUUFB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Qkg7O0FBaEYwRCxDLHNEQUN4QztBQUNmdkIsRUFBQUEsSUFBSSxFQUFFNEIsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFI7QUFFZm5DLEVBQUFBLFVBQVUsRUFBRWlDLG1CQUFVRyxJQUFWLENBQWVEO0FBRlosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLlJvb21VcGdyYWRlRGlhbG9nXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSb29tVXBncmFkZURpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgcm9vbTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICAgICAgICBvbkZpbmlzaGVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgYnVzeTogdHJ1ZSxcbiAgICB9O1xuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IHJlY29tbWVuZGVkID0gYXdhaXQgdGhpcy5wcm9wcy5yb29tLmdldFJlY29tbWVuZGVkVmVyc2lvbigpO1xuICAgICAgICB0aGlzLl90YXJnZXRWZXJzaW9uID0gcmVjb21tZW5kZWQudmVyc2lvbjtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogZmFsc2V9KTtcbiAgICB9XG5cbiAgICBfb25DYW5jZWxDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICB9O1xuXG4gICAgX29uVXBncmFkZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiB0cnVlfSk7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS51cGdyYWRlUm9vbSh0aGlzLnByb3BzLnJvb20ucm9vbUlkLCB0aGlzLl90YXJnZXRWZXJzaW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZCh0cnVlKTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0ZhaWxlZCB0byB1cGdyYWRlIHJvb20nLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJGYWlsZWQgdG8gdXBncmFkZSByb29tXCIpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAoKGVyciAmJiBlcnIubWVzc2FnZSkgPyBlcnIubWVzc2FnZSA6IF90KFwiVGhlIHJvb20gdXBncmFkZSBjb3VsZCBub3QgYmUgY29tcGxldGVkXCIpKSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcbiAgICAgICAgY29uc3QgRGlhbG9nQnV0dG9ucyA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLkRpYWxvZ0J1dHRvbnMnKTtcbiAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLmVsZW1lbnRzLlNwaW5uZXInKTtcblxuICAgICAgICBsZXQgYnV0dG9ucztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYnVzeSkge1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxTcGlubmVyIC8+O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9ucyA9IDxEaWFsb2dCdXR0b25zXG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbj17X3QoXG4gICAgICAgICAgICAgICAgICAgICdVcGdyYWRlIHRoaXMgcm9vbSB0byB2ZXJzaW9uICUodmVyc2lvbilzJyxcbiAgICAgICAgICAgICAgICAgICAge3ZlcnNpb246IHRoaXMuX3RhcmdldFZlcnNpb259LFxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgcHJpbWFyeUJ1dHRvbkNsYXNzPVwiZGFuZ2VyXCJcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICAgICAgb25QcmltYXJ5QnV0dG9uQ2xpY2s9e3RoaXMuX29uVXBncmFkZUNsaWNrfVxuICAgICAgICAgICAgICAgIGZvY3VzPXt0aGlzLnByb3BzLmZvY3VzfVxuICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLl9vbkNhbmNlbENsaWNrfVxuICAgICAgICAgICAgLz47XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEJhc2VEaWFsb2cgY2xhc3NOYW1lPVwibXhfUm9vbVVwZ3JhZGVEaWFsb2dcIlxuICAgICAgICAgICAgICAgIG9uRmluaXNoZWQ9e3RoaXMucHJvcHMub25GaW5pc2hlZH1cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJVcGdyYWRlIFJvb20gVmVyc2lvblwiKX1cbiAgICAgICAgICAgICAgICBjb250ZW50SWQ9J214X0RpYWxvZ19jb250ZW50J1xuICAgICAgICAgICAgICAgIGhhc0NhbmNlbD17dHJ1ZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAge190KFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJVcGdyYWRpbmcgdGhpcyByb29tIHJlcXVpcmVzIGNsb3NpbmcgZG93biB0aGUgY3VycmVudCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcImluc3RhbmNlIG9mIHRoZSByb29tIGFuZCBjcmVhdGluZyBhIG5ldyByb29tIGluIGl0cyBwbGFjZS4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJUbyBnaXZlIHJvb20gbWVtYmVycyB0aGUgYmVzdCBwb3NzaWJsZSBleHBlcmllbmNlLCB3ZSB3aWxsOlwiLFxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8b2w+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJDcmVhdGUgYSBuZXcgcm9vbSB3aXRoIHRoZSBzYW1lIG5hbWUsIGRlc2NyaXB0aW9uIGFuZCBhdmF0YXJcIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlVwZGF0ZSBhbnkgbG9jYWwgcm9vbSBhbGlhc2VzIHRvIHBvaW50IHRvIHRoZSBuZXcgcm9vbVwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiU3RvcCB1c2VycyBmcm9tIHNwZWFraW5nIGluIHRoZSBvbGQgdmVyc2lvbiBvZiB0aGUgcm9vbSwgYW5kIHBvc3QgYSBtZXNzYWdlIGFkdmlzaW5nIHVzZXJzIHRvIG1vdmUgdG8gdGhlIG5ldyByb29tXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJQdXQgYSBsaW5rIGJhY2sgdG8gdGhlIG9sZCByb29tIGF0IHRoZSBzdGFydCBvZiB0aGUgbmV3IHJvb20gc28gcGVvcGxlIGNhbiBzZWUgb2xkIG1lc3NhZ2VzXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICAgICAgICB7YnV0dG9uc31cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=