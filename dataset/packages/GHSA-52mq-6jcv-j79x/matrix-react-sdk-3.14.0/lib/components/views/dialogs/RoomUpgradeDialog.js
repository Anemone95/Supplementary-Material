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

var sdk = _interopRequireWildcard(require("../../../index"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

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
class RoomUpgradeDialog extends _react.default.Component {
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

}

exports.default = RoomUpgradeDialog;
(0, _defineProperty2.default)(RoomUpgradeDialog, "propTypes", {
  room: _propTypes.default.object.isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3MvUm9vbVVwZ3JhZGVEaWFsb2cuanMiXSwibmFtZXMiOlsiUm9vbVVwZ3JhZGVEaWFsb2ciLCJSZWFjdCIsIkNvbXBvbmVudCIsImJ1c3kiLCJwcm9wcyIsIm9uRmluaXNoZWQiLCJzZXRTdGF0ZSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInVwZ3JhZGVSb29tIiwicm9vbSIsInJvb21JZCIsIl90YXJnZXRWZXJzaW9uIiwidGhlbiIsImNhdGNoIiwiZXJyIiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsImZpbmFsbHkiLCJjb21wb25lbnREaWRNb3VudCIsInJlY29tbWVuZGVkIiwiZ2V0UmVjb21tZW5kZWRWZXJzaW9uIiwidmVyc2lvbiIsInJlbmRlciIsIkJhc2VEaWFsb2ciLCJEaWFsb2dCdXR0b25zIiwiU3Bpbm5lciIsImJ1dHRvbnMiLCJzdGF0ZSIsIl9vblVwZ3JhZGVDbGljayIsImZvY3VzIiwiX29uQ2FuY2VsQ2xpY2siLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBU2UsTUFBTUEsaUJBQU4sU0FBZ0NDLGVBQU1DLFNBQXRDLENBQWdEO0FBQUE7QUFBQTtBQUFBLGlEQU1uRDtBQUNKQyxNQUFBQSxJQUFJLEVBQUU7QUFERixLQU5tRDtBQUFBLDBEQWdCMUMsTUFBTTtBQUNuQixXQUFLQyxLQUFMLENBQVdDLFVBQVgsQ0FBc0IsS0FBdEI7QUFDSCxLQWxCMEQ7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LENBSkosQ0FiSixFQW1CSzRCLE9BbkJMLENBREo7QUF1Qkg7O0FBaEYwRDs7OzhCQUExQ2pDLGlCLGVBQ0U7QUFDZlUsRUFBQUEsSUFBSSxFQUFFNEIsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFI7QUFFZm5DLEVBQUFBLFVBQVUsRUFBRWlDLG1CQUFVRyxJQUFWLENBQWVEO0FBRlosQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUm9vbVVwZ3JhZGVEaWFsb2cgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgb25GaW5pc2hlZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICB9O1xuXG4gICAgc3RhdGUgPSB7XG4gICAgICAgIGJ1c3k6IHRydWUsXG4gICAgfTtcblxuICAgIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCByZWNvbW1lbmRlZCA9IGF3YWl0IHRoaXMucHJvcHMucm9vbS5nZXRSZWNvbW1lbmRlZFZlcnNpb24oKTtcbiAgICAgICAgdGhpcy5fdGFyZ2V0VmVyc2lvbiA9IHJlY29tbWVuZGVkLnZlcnNpb247XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2J1c3k6IGZhbHNlfSk7XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMucHJvcHMub25GaW5pc2hlZChmYWxzZSk7XG4gICAgfTtcblxuICAgIF9vblVwZ3JhZGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YnVzeTogdHJ1ZX0pO1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkudXBncmFkZVJvb20odGhpcy5wcm9wcy5yb29tLnJvb21JZCwgdGhpcy5fdGFyZ2V0VmVyc2lvbikudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uRmluaXNoZWQodHJ1ZSk7XG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdGYWlsZWQgdG8gdXBncmFkZSByb29tJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiRmFpbGVkIHRvIHVwZ3JhZGUgcm9vbVwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogKChlcnIgJiYgZXJyLm1lc3NhZ2UpID8gZXJyLm1lc3NhZ2UgOiBfdChcIlRoZSByb29tIHVwZ3JhZGUgY291bGQgbm90IGJlIGNvbXBsZXRlZFwiKSksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtidXN5OiBmYWxzZX0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBCYXNlRGlhbG9nID0gc2RrLmdldENvbXBvbmVudCgndmlld3MuZGlhbG9ncy5CYXNlRGlhbG9nJyk7XG4gICAgICAgIGNvbnN0IERpYWxvZ0J1dHRvbnMgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5EaWFsb2dCdXR0b25zJyk7XG4gICAgICAgIGNvbnN0IFNwaW5uZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5lbGVtZW50cy5TcGlubmVyJyk7XG5cbiAgICAgICAgbGV0IGJ1dHRvbnM7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmJ1c3kpIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8U3Bpbm5lciAvPjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSA8RGlhbG9nQnV0dG9uc1xuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b249e190KFxuICAgICAgICAgICAgICAgICAgICAnVXBncmFkZSB0aGlzIHJvb20gdG8gdmVyc2lvbiAlKHZlcnNpb24pcycsXG4gICAgICAgICAgICAgICAgICAgIHt2ZXJzaW9uOiB0aGlzLl90YXJnZXRWZXJzaW9ufSxcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHByaW1hcnlCdXR0b25DbGFzcz1cImRhbmdlclwiXG4gICAgICAgICAgICAgICAgaGFzQ2FuY2VsPXt0cnVlfVxuICAgICAgICAgICAgICAgIG9uUHJpbWFyeUJ1dHRvbkNsaWNrPXt0aGlzLl9vblVwZ3JhZGVDbGlja31cbiAgICAgICAgICAgICAgICBmb2N1cz17dGhpcy5wcm9wcy5mb2N1c31cbiAgICAgICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5fb25DYW5jZWxDbGlja31cbiAgICAgICAgICAgIC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxCYXNlRGlhbG9nIGNsYXNzTmFtZT1cIm14X1Jvb21VcGdyYWRlRGlhbG9nXCJcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkPXt0aGlzLnByb3BzLm9uRmluaXNoZWR9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiVXBncmFkZSBSb29tIFZlcnNpb25cIil9XG4gICAgICAgICAgICAgICAgY29udGVudElkPSdteF9EaWFsb2dfY29udGVudCdcbiAgICAgICAgICAgICAgICBoYXNDYW5jZWw9e3RydWV9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVXBncmFkaW5nIHRoaXMgcm9vbSByZXF1aXJlcyBjbG9zaW5nIGRvd24gdGhlIGN1cnJlbnQgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJpbnN0YW5jZSBvZiB0aGUgcm9vbSBhbmQgY3JlYXRpbmcgYSBuZXcgcm9vbSBpbiBpdHMgcGxhY2UuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiVG8gZ2l2ZSByb29tIG1lbWJlcnMgdGhlIGJlc3QgcG9zc2libGUgZXhwZXJpZW5jZSwgd2Ugd2lsbDpcIixcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPG9sPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiQ3JlYXRlIGEgbmV3IHJvb20gd2l0aCB0aGUgc2FtZSBuYW1lLCBkZXNjcmlwdGlvbiBhbmQgYXZhdGFyXCIpfTwvbGk+XG4gICAgICAgICAgICAgICAgICAgIDxsaT57X3QoXCJVcGRhdGUgYW55IGxvY2FsIHJvb20gYWxpYXNlcyB0byBwb2ludCB0byB0aGUgbmV3IHJvb21cIil9PC9saT5cbiAgICAgICAgICAgICAgICAgICAgPGxpPntfdChcIlN0b3AgdXNlcnMgZnJvbSBzcGVha2luZyBpbiB0aGUgb2xkIHZlcnNpb24gb2YgdGhlIHJvb20sIGFuZCBwb3N0IGEgbWVzc2FnZSBhZHZpc2luZyB1c2VycyB0byBtb3ZlIHRvIHRoZSBuZXcgcm9vbVwiKX08L2xpPlxuICAgICAgICAgICAgICAgICAgICA8bGk+e190KFwiUHV0IGEgbGluayBiYWNrIHRvIHRoZSBvbGQgcm9vbSBhdCB0aGUgc3RhcnQgb2YgdGhlIG5ldyByb29tIHNvIHBlb3BsZSBjYW4gc2VlIG9sZCBtZXNzYWdlc1wiKX08L2xpPlxuICAgICAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgICAgICAge2J1dHRvbnN9XG4gICAgICAgICAgICA8L0Jhc2VEaWFsb2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19