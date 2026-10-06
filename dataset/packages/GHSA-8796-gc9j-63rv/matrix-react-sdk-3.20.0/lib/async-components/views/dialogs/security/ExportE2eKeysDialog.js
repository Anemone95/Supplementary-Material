"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _fileSaver = _interopRequireDefault(require("file-saver"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _languageHandler = require("../../../../languageHandler");

var _client = require("matrix-js-sdk/src/client");

var MegolmExportEncryption = _interopRequireWildcard(require("../../../../utils/MegolmExportEncryption"));

var sdk = _interopRequireWildcard(require("../../../../index"));

/*
Copyright 2017 Vector Creations Ltd

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
const PHASE_EDIT = 1;
const PHASE_EXPORTING = 2;

class ExportE2eKeysDialog extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "_onPassphraseFormSubmit", ev => {
      ev.preventDefault();
      const passphrase = this._passphrase1.current.value;

      if (passphrase !== this._passphrase2.current.value) {
        this.setState({
          errStr: (0, _languageHandler._t)('Passphrases must match')
        });
        return false;
      }

      if (!passphrase) {
        this.setState({
          errStr: (0, _languageHandler._t)('Passphrase must not be empty')
        });
        return false;
      }

      this._startExport(passphrase);

      return false;
    });
    (0, _defineProperty2.default)(this, "_onCancelClick", ev => {
      ev.preventDefault();
      this.props.onFinished(false);
      return false;
    });
    this._unmounted = false;
    this._passphrase1 = /*#__PURE__*/(0, _react.createRef)();
    this._passphrase2 = /*#__PURE__*/(0, _react.createRef)();
    this.state = {
      phase: PHASE_EDIT,
      errStr: null
    };
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _startExport(passphrase) {
    // extra Promise.resolve() to turn synchronous exceptions into
    // asynchronous ones.
    Promise.resolve().then(() => {
      return this.props.matrixClient.exportRoomKeys();
    }).then(k => {
      return MegolmExportEncryption.encryptMegolmKeyFile(JSON.stringify(k), passphrase);
    }).then(f => {
      const blob = new Blob([f], {
        type: 'text/plain;charset=us-ascii'
      });

      _fileSaver.default.saveAs(blob, 'element-keys.txt');

      this.props.onFinished(true);
    }).catch(e => {
      console.error("Error exporting e2e keys:", e);

      if (this._unmounted) {
        return;
      }

      const msg = e.friendlyText || (0, _languageHandler._t)('Unknown error');
      this.setState({
        errStr: msg,
        phase: PHASE_EDIT
      });
    });
    this.setState({
      errStr: null,
      phase: PHASE_EXPORTING
    });
  }

  render() {
    const BaseDialog = sdk.getComponent('views.dialogs.BaseDialog');
    const disableForm = this.state.phase === PHASE_EXPORTING;
    return /*#__PURE__*/_react.default.createElement(BaseDialog, {
      className: "mx_exportE2eKeysDialog",
      onFinished: this.props.onFinished,
      title: (0, _languageHandler._t)("Export room keys")
    }, /*#__PURE__*/_react.default.createElement("form", {
      onSubmit: this._onPassphraseFormSubmit
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_content"
    }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('This process allows you to export the keys for messages ' + 'you have received in encrypted rooms to a local file. You ' + 'will then be able to import the file into another Matrix ' + 'client in the future, so that client will also be able to ' + 'decrypt these messages.')), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('The exported file will allow anyone who can read it to decrypt ' + 'any encrypted messages that you can see, so you should be ' + 'careful to keep it secure. To help with this, you should enter ' + 'a passphrase below, which will be used to encrypt the exported ' + 'data. It will only be possible to import the data by using the ' + 'same passphrase.')), /*#__PURE__*/_react.default.createElement("div", {
      className: "error"
    }, this.state.errStr), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputTable"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "passphrase1"
    }, (0, _languageHandler._t)("Enter passphrase"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this._passphrase1,
      id: "passphrase1",
      autoFocus: true,
      size: "64",
      type: "password",
      disabled: disableForm
    }))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputRow"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputLabel"
    }, /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: "passphrase2"
    }, (0, _languageHandler._t)("Confirm passphrase"))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_E2eKeysDialog_inputCell"
    }, /*#__PURE__*/_react.default.createElement("input", {
      ref: this._passphrase2,
      id: "passphrase2",
      size: "64",
      type: "password",
      disabled: disableForm
    }))))), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Dialog_buttons"
    }, /*#__PURE__*/_react.default.createElement("input", {
      className: "mx_Dialog_primary",
      type: "submit",
      value: (0, _languageHandler._t)('Export'),
      disabled: disableForm
    }), /*#__PURE__*/_react.default.createElement("button", {
      onClick: this._onCancelClick,
      disabled: disableForm
    }, (0, _languageHandler._t)("Cancel")))));
  }

}

exports.default = ExportE2eKeysDialog;
(0, _defineProperty2.default)(ExportE2eKeysDialog, "propTypes", {
  matrixClient: _propTypes.default.instanceOf(_client.MatrixClient).isRequired,
  onFinished: _propTypes.default.func.isRequired
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9hc3luYy1jb21wb25lbnRzL3ZpZXdzL2RpYWxvZ3Mvc2VjdXJpdHkvRXhwb3J0RTJlS2V5c0RpYWxvZy5qcyJdLCJuYW1lcyI6WyJQSEFTRV9FRElUIiwiUEhBU0VfRVhQT1JUSU5HIiwiRXhwb3J0RTJlS2V5c0RpYWxvZyIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2IiwicHJldmVudERlZmF1bHQiLCJwYXNzcGhyYXNlIiwiX3Bhc3NwaHJhc2UxIiwiY3VycmVudCIsInZhbHVlIiwiX3Bhc3NwaHJhc2UyIiwic2V0U3RhdGUiLCJlcnJTdHIiLCJfc3RhcnRFeHBvcnQiLCJvbkZpbmlzaGVkIiwiX3VubW91bnRlZCIsInN0YXRlIiwicGhhc2UiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsIlByb21pc2UiLCJyZXNvbHZlIiwidGhlbiIsIm1hdHJpeENsaWVudCIsImV4cG9ydFJvb21LZXlzIiwiayIsIk1lZ29sbUV4cG9ydEVuY3J5cHRpb24iLCJlbmNyeXB0TWVnb2xtS2V5RmlsZSIsIkpTT04iLCJzdHJpbmdpZnkiLCJmIiwiYmxvYiIsIkJsb2IiLCJ0eXBlIiwiRmlsZVNhdmVyIiwic2F2ZUFzIiwiY2F0Y2giLCJlIiwiY29uc29sZSIsImVycm9yIiwibXNnIiwiZnJpZW5kbHlUZXh0IiwicmVuZGVyIiwiQmFzZURpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImRpc2FibGVGb3JtIiwiX29uUGFzc3BocmFzZUZvcm1TdWJtaXQiLCJfb25DYW5jZWxDbGljayIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJNYXRyaXhDbGllbnQiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUF2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QixNQUFBLElBQUksRUFBQyxVQURwQztBQUVJLE1BQUEsUUFBUSxFQUFFc0M7QUFGZCxNQURKLENBTkosQ0FESixlQWNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTyxNQUFBLE9BQU8sRUFBQztBQUFmLE9BQ00seUJBQUcsb0JBQUgsQ0FETixDQURKLENBREosZUFNSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBTyxNQUFBLEdBQUcsRUFBRSxLQUFLbkMsWUFBakI7QUFBK0IsTUFBQSxFQUFFLEVBQUMsYUFBbEM7QUFDSSxNQUFBLElBQUksRUFBQyxJQURUO0FBQ2MsTUFBQSxJQUFJLEVBQUMsVUFEbkI7QUFFSSxNQUFBLFFBQVEsRUFBRW1DO0FBRmQsTUFESixDQU5KLENBZEosQ0F2QkosQ0FESixlQXFESTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFDSSxNQUFBLFNBQVMsRUFBQyxtQkFEZDtBQUVJLE1BQUEsSUFBSSxFQUFDLFFBRlQ7QUFHSSxNQUFBLEtBQUssRUFBRSx5QkFBRyxRQUFILENBSFg7QUFJSSxNQUFBLFFBQVEsRUFBRUE7QUFKZCxNQURKLGVBT0k7QUFBUSxNQUFBLE9BQU8sRUFBRSxLQUFLRSxjQUF0QjtBQUFzQyxNQUFBLFFBQVEsRUFBRUY7QUFBaEQsT0FDTSx5QkFBRyxRQUFILENBRE4sQ0FQSixDQXJESixDQUpKLENBREo7QUF3RUg7O0FBN0o0RDs7OzhCQUE1QzlDLG1CLGVBQ0U7QUFDZnVCLEVBQUFBLFlBQVksRUFBRTBCLG1CQUFVQyxVQUFWLENBQXFCQyxvQkFBckIsRUFBbUNDLFVBRGxDO0FBRWZyQyxFQUFBQSxVQUFVLEVBQUVrQyxtQkFBVUksSUFBVixDQUFlRDtBQUZaLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgVmVjdG9yIENyZWF0aW9ucyBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgRmlsZVNhdmVyIGZyb20gJ2ZpbGUtc2F2ZXInO1xuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5pbXBvcnQgeyBNYXRyaXhDbGllbnQgfSBmcm9tICdtYXRyaXgtanMtc2RrL3NyYy9jbGllbnQnO1xuaW1wb3J0ICogYXMgTWVnb2xtRXhwb3J0RW5jcnlwdGlvbiBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9NZWdvbG1FeHBvcnRFbmNyeXB0aW9uJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi8uLi9pbmRleCc7XG5cbmNvbnN0IFBIQVNFX0VESVQgPSAxO1xuY29uc3QgUEhBU0VfRVhQT1JUSU5HID0gMjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhwb3J0RTJlS2V5c0RpYWxvZyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgbWF0cml4Q2xpZW50OiBQcm9wVHlwZXMuaW5zdGFuY2VPZihNYXRyaXhDbGllbnQpLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLl9wYXNzcGhyYXNlMSA9IGNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLl9wYXNzcGhyYXNlMiA9IGNyZWF0ZVJlZigpO1xuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwaGFzZTogUEhBU0VfRURJVCxcbiAgICAgICAgICAgIGVyclN0cjogbnVsbCxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBfb25QYXNzcGhyYXNlRm9ybVN1Ym1pdCA9IChldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IHBhc3NwaHJhc2UgPSB0aGlzLl9wYXNzcGhyYXNlMS5jdXJyZW50LnZhbHVlO1xuICAgICAgICBpZiAocGFzc3BocmFzZSAhPT0gdGhpcy5fcGFzc3BocmFzZTIuY3VycmVudC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7ZXJyU3RyOiBfdCgnUGFzc3BocmFzZXMgbXVzdCBtYXRjaCcpfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFwYXNzcGhyYXNlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnJTdHI6IF90KCdQYXNzcGhyYXNlIG11c3Qgbm90IGJlIGVtcHR5Jyl9KTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX3N0YXJ0RXhwb3J0KHBhc3NwaHJhc2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIF9zdGFydEV4cG9ydChwYXNzcGhyYXNlKSB7XG4gICAgICAgIC8vIGV4dHJhIFByb21pc2UucmVzb2x2ZSgpIHRvIHR1cm4gc3luY2hyb25vdXMgZXhjZXB0aW9ucyBpbnRvXG4gICAgICAgIC8vIGFzeW5jaHJvbm91cyBvbmVzLlxuICAgICAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm1hdHJpeENsaWVudC5leHBvcnRSb29tS2V5cygpO1xuICAgICAgICB9KS50aGVuKChrKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gTWVnb2xtRXhwb3J0RW5jcnlwdGlvbi5lbmNyeXB0TWVnb2xtS2V5RmlsZShcbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShrKSwgcGFzc3BocmFzZSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0pLnRoZW4oKGYpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZl0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dC9wbGFpbjtjaGFyc2V0PXVzLWFzY2lpJyxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgRmlsZVNhdmVyLnNhdmVBcyhibG9iLCAnZWxlbWVudC1rZXlzLnR4dCcpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKHRydWUpO1xuICAgICAgICB9KS5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIGV4cG9ydGluZyBlMmUga2V5czpcIiwgZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5fdW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbXNnID0gZS5mcmllbmRseVRleHQgfHwgX3QoJ1Vua25vd24gZXJyb3InKTtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGVyclN0cjogbXNnLFxuICAgICAgICAgICAgICAgIHBoYXNlOiBQSEFTRV9FRElULFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZXJyU3RyOiBudWxsLFxuICAgICAgICAgICAgcGhhc2U6IFBIQVNFX0VYUE9SVElORyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX29uQ2FuY2VsQ2xpY2sgPSAoZXYpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IEJhc2VEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KCd2aWV3cy5kaWFsb2dzLkJhc2VEaWFsb2cnKTtcblxuICAgICAgICBjb25zdCBkaXNhYmxlRm9ybSA9ICh0aGlzLnN0YXRlLnBoYXNlID09PSBQSEFTRV9FWFBPUlRJTkcpO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QmFzZURpYWxvZyBjbGFzc05hbWU9J214X2V4cG9ydEUyZUtleXNEaWFsb2cnXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZD17dGhpcy5wcm9wcy5vbkZpbmlzaGVkfVxuICAgICAgICAgICAgICAgIHRpdGxlPXtfdChcIkV4cG9ydCByb29tIGtleXNcIil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMuX29uUGFzc3BocmFzZUZvcm1TdWJtaXR9PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0RpYWxvZ19jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnVGhpcyBwcm9jZXNzIGFsbG93cyB5b3UgdG8gZXhwb3J0IHRoZSBrZXlzIGZvciBtZXNzYWdlcyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3lvdSBoYXZlIHJlY2VpdmVkIGluIGVuY3J5cHRlZCByb29tcyB0byBhIGxvY2FsIGZpbGUuIFlvdSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3dpbGwgdGhlbiBiZSBhYmxlIHRvIGltcG9ydCB0aGUgZmlsZSBpbnRvIGFub3RoZXIgTWF0cml4ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2xpZW50IGluIHRoZSBmdXR1cmUsIHNvIHRoYXQgY2xpZW50IHdpbGwgYWxzbyBiZSBhYmxlIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGVjcnlwdCB0aGVzZSBtZXNzYWdlcy4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1RoZSBleHBvcnRlZCBmaWxlIHdpbGwgYWxsb3cgYW55b25lIHdobyBjYW4gcmVhZCBpdCB0byBkZWNyeXB0ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYW55IGVuY3J5cHRlZCBtZXNzYWdlcyB0aGF0IHlvdSBjYW4gc2VlLCBzbyB5b3Ugc2hvdWxkIGJlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2FyZWZ1bCB0byBrZWVwIGl0IHNlY3VyZS4gVG8gaGVscCB3aXRoIHRoaXMsIHlvdSBzaG91bGQgZW50ZXIgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhIHBhc3NwaHJhc2UgYmVsb3csIHdoaWNoIHdpbGwgYmUgdXNlZCB0byBlbmNyeXB0IHRoZSBleHBvcnRlZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEuIEl0IHdpbGwgb25seSBiZSBwb3NzaWJsZSB0byBpbXBvcnQgdGhlIGRhdGEgYnkgdXNpbmcgdGhlICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnc2FtZSBwYXNzcGhyYXNlLicsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nZXJyb3InPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5zdGF0ZS5lcnJTdHIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dFRhYmxlJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dFJvdyc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPSdteF9FMmVLZXlzRGlhbG9nX2lucHV0TGFiZWwnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9J3Bhc3NwaHJhc2UxJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiRW50ZXIgcGFzc3BocmFzZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRDZWxsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZWY9e3RoaXMuX3Bhc3NwaHJhc2UxfSBpZD0ncGFzc3BocmFzZTEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzPXt0cnVlfSBzaXplPSc2NCcgdHlwZT0ncGFzc3dvcmQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2Rpc2FibGVGb3JtfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRSb3cnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRTJlS2V5c0RpYWxvZ19pbnB1dExhYmVsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBodG1sRm9yPSdwYXNzcGhyYXNlMic+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkNvbmZpcm0gcGFzc3BocmFzZVwiKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J214X0UyZUtleXNEaWFsb2dfaW5wdXRDZWxsJz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCByZWY9e3RoaXMuX3Bhc3NwaHJhc2UyfSBpZD0ncGFzc3BocmFzZTInXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZT0nNjQnIHR5cGU9J3Bhc3N3b3JkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtkaXNhYmxlRm9ybX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfRGlhbG9nX2J1dHRvbnMnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPSdteF9EaWFsb2dfcHJpbWFyeSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSdzdWJtaXQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e190KCdFeHBvcnQnKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZUZvcm19XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLl9vbkNhbmNlbENsaWNrfSBkaXNhYmxlZD17ZGlzYWJsZUZvcm19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJDYW5jZWxcIikgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvQmFzZURpYWxvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=