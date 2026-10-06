"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../../../languageHandler");

var _SdkConfig = _interopRequireDefault(require("../../../../../SdkConfig"));

var _CallMediaHandler = _interopRequireDefault(require("../../../../../CallMediaHandler"));

var _Field = _interopRequireDefault(require("../../../elements/Field"));

var _AccessibleButton = _interopRequireDefault(require("../../../elements/AccessibleButton"));

var _MatrixClientPeg = require("../../../../../MatrixClientPeg");

var sdk = _interopRequireWildcard(require("../../../../../index"));

var _Modal = _interopRequireDefault(require("../../../../../Modal"));

var _SettingLevel = require("../../../../../settings/SettingLevel");

/*
Copyright 2019 New Vector Ltd
Copyright 2020 The Matrix.org Foundation C.I.C.

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
class VoiceUserSettingsTab extends _react.default.Component {
  constructor() {
    super();
    (0, _defineProperty2.default)(this, "_refreshMediaDevices", async stream => {
      this.setState({
        mediaDevices: await _CallMediaHandler.default.getDevices(),
        activeAudioOutput: _CallMediaHandler.default.getAudioOutput(),
        activeAudioInput: _CallMediaHandler.default.getAudioInput(),
        activeVideoInput: _CallMediaHandler.default.getVideoInput()
      });

      if (stream) {
        // kill stream (after we've enumerated the devices, otherwise we'd get empty labels again)
        // so that we don't leave it lingering around with webcam enabled etc
        // as here we called gUM to ask user for permission to their device names only
        stream.getTracks().forEach(track => track.stop());
      }
    });
    (0, _defineProperty2.default)(this, "_requestMediaPermissions", async () => {
      let constraints;
      let stream;
      let error;

      try {
        constraints = {
          video: true,
          audio: true
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // user likely doesn't have a webcam,
        // we should still allow to select a microphone
        if (err.name === "NotFoundError") {
          constraints = {
            audio: true
          };

          try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
          } catch (err) {
            error = err;
          }
        } else {
          error = err;
        }
      }

      if (error) {
        const brand = _SdkConfig.default.get().brand;

        const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');

        _Modal.default.createTrackedDialog('No media permissions', '', ErrorDialog, {
          title: (0, _languageHandler._t)('No media permissions'),
          description: (0, _languageHandler._t)('You may need to manually permit %(brand)s to access your microphone/webcam', {
            brand
          })
        });
      } else {
        this._refreshMediaDevices(stream);
      }
    });
    (0, _defineProperty2.default)(this, "_setAudioOutput", e => {
      _CallMediaHandler.default.setAudioOutput(e.target.value);

      this.setState({
        activeAudioOutput: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_setAudioInput", e => {
      _CallMediaHandler.default.setAudioInput(e.target.value);

      this.setState({
        activeAudioInput: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_setVideoInput", e => {
      _CallMediaHandler.default.setVideoInput(e.target.value);

      this.setState({
        activeVideoInput: e.target.value
      });
    });
    (0, _defineProperty2.default)(this, "_changeWebRtcMethod", p2p => {
      _MatrixClientPeg.MatrixClientPeg.get().setForceTURN(!p2p);
    });
    (0, _defineProperty2.default)(this, "_changeFallbackICEServerAllowed", allow => {
      _MatrixClientPeg.MatrixClientPeg.get().setFallbackICEServerAllowed(allow);
    });
    this.state = {
      mediaDevices: false,
      activeAudioOutput: null,
      activeAudioInput: null,
      activeVideoInput: null
    };
  }

  async componentDidMount() {
    const canSeeDeviceLabels = await _CallMediaHandler.default.hasAnyLabeledDevices();

    if (canSeeDeviceLabels) {
      this._refreshMediaDevices();
    }
  }

  _renderDeviceOptions(devices, category) {
    return devices.map(d => {
      return /*#__PURE__*/_react.default.createElement("option", {
        key: `${category}-${d.deviceId}`,
        value: d.deviceId
      }, d.label);
    });
  }

  render() {
    const SettingsFlag = sdk.getComponent("views.elements.SettingsFlag");
    let requestButton = null;
    let speakerDropdown = null;
    let microphoneDropdown = null;
    let webcamDropdown = null;

    if (this.state.mediaDevices === false) {
      requestButton = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_VoiceUserSettingsTab_missingMediaPermissions"
      }, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Missing media permissions, click the button below to request.")), /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, {
        onClick: this._requestMediaPermissions,
        kind: "primary"
      }, (0, _languageHandler._t)("Request media permissions")));
    } else if (this.state.mediaDevices) {
      speakerDropdown = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Audio Outputs detected'));
      microphoneDropdown = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Microphones detected'));
      webcamDropdown = /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)('No Webcams detected'));
      const defaultOption = {
        deviceId: '',
        label: (0, _languageHandler._t)('Default Device')
      };

      const getDefaultDevice = devices => {
        // Note we're looking for a device with deviceId 'default' but adding a device
        // with deviceId == the empty string: this is because Chrome gives us a device
        // with deviceId 'default', so we're looking for this, not the one we are adding.
        if (!devices.some(i => i.deviceId === 'default')) {
          devices.unshift(defaultOption);
          return '';
        } else {
          return 'default';
        }
      };

      const audioOutputs = this.state.mediaDevices.audiooutput.slice(0);

      if (audioOutputs.length > 0) {
        const defaultDevice = getDefaultDevice(audioOutputs);
        speakerDropdown = /*#__PURE__*/_react.default.createElement(_Field.default, {
          element: "select",
          label: (0, _languageHandler._t)("Audio Output"),
          value: this.state.activeAudioOutput || defaultDevice,
          onChange: this._setAudioOutput
        }, this._renderDeviceOptions(audioOutputs, 'audioOutput'));
      }

      const audioInputs = this.state.mediaDevices.audioinput.slice(0);

      if (audioInputs.length > 0) {
        const defaultDevice = getDefaultDevice(audioInputs);
        microphoneDropdown = /*#__PURE__*/_react.default.createElement(_Field.default, {
          element: "select",
          label: (0, _languageHandler._t)("Microphone"),
          value: this.state.activeAudioInput || defaultDevice,
          onChange: this._setAudioInput
        }, this._renderDeviceOptions(audioInputs, 'audioInput'));
      }

      const videoInputs = this.state.mediaDevices.videoinput.slice(0);

      if (videoInputs.length > 0) {
        const defaultDevice = getDefaultDevice(videoInputs);
        webcamDropdown = /*#__PURE__*/_react.default.createElement(_Field.default, {
          element: "select",
          label: (0, _languageHandler._t)("Camera"),
          value: this.state.activeVideoInput || defaultDevice,
          onChange: this._setVideoInput
        }, this._renderDeviceOptions(videoInputs, 'videoInput'));
      }
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab mx_VoiceUserSettingsTab"
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_heading"
    }, (0, _languageHandler._t)("Voice & Video")), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SettingsTab_section"
    }, requestButton, speakerDropdown, microphoneDropdown, webcamDropdown, /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "VideoView.flipVideoHorizontally",
      level: _SettingLevel.SettingLevel.ACCOUNT
    }), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "webRtcAllowPeerToPeer",
      level: _SettingLevel.SettingLevel.DEVICE,
      onChange: this._changeWebRtcMethod
    }), /*#__PURE__*/_react.default.createElement(SettingsFlag, {
      name: "fallbackICEServerAllowed",
      level: _SettingLevel.SettingLevel.DEVICE,
      onChange: this._changeFallbackICEServerAllowed
    })));
  }

}

exports.default = VoiceUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Wb2ljZVVzZXJTZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJWb2ljZVVzZXJTZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJzdHJlYW0iLCJzZXRTdGF0ZSIsIm1lZGlhRGV2aWNlcyIsIkNhbGxNZWRpYUhhbmRsZXIiLCJnZXREZXZpY2VzIiwiYWN0aXZlQXVkaW9PdXRwdXQiLCJnZXRBdWRpb091dHB1dCIsImFjdGl2ZUF1ZGlvSW5wdXQiLCJnZXRBdWRpb0lucHV0IiwiYWN0aXZlVmlkZW9JbnB1dCIsImdldFZpZGVvSW5wdXQiLCJnZXRUcmFja3MiLCJmb3JFYWNoIiwidHJhY2siLCJzdG9wIiwiY29uc3RyYWludHMiLCJlcnJvciIsInZpZGVvIiwiYXVkaW8iLCJuYXZpZ2F0b3IiLCJnZXRVc2VyTWVkaWEiLCJlcnIiLCJuYW1lIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJfcmVmcmVzaE1lZGlhRGV2aWNlcyIsImUiLCJzZXRBdWRpb091dHB1dCIsInRhcmdldCIsInZhbHVlIiwic2V0QXVkaW9JbnB1dCIsInNldFZpZGVvSW5wdXQiLCJwMnAiLCJNYXRyaXhDbGllbnRQZWciLCJzZXRGb3JjZVRVUk4iLCJhbGxvdyIsInNldEZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZCIsInN0YXRlIiwiY29tcG9uZW50RGlkTW91bnQiLCJjYW5TZWVEZXZpY2VMYWJlbHMiLCJoYXNBbnlMYWJlbGVkRGV2aWNlcyIsIl9yZW5kZXJEZXZpY2VPcHRpb25zIiwiZGV2aWNlcyIsImNhdGVnb3J5IiwibWFwIiwiZCIsImRldmljZUlkIiwibGFiZWwiLCJyZW5kZXIiLCJTZXR0aW5nc0ZsYWciLCJyZXF1ZXN0QnV0dG9uIiwic3BlYWtlckRyb3Bkb3duIiwibWljcm9waG9uZURyb3Bkb3duIiwid2ViY2FtRHJvcGRvd24iLCJfcmVxdWVzdE1lZGlhUGVybWlzc2lvbnMiLCJkZWZhdWx0T3B0aW9uIiwiZ2V0RGVmYXVsdERldmljZSIsInNvbWUiLCJpIiwidW5zaGlmdCIsImF1ZGlvT3V0cHV0cyIsImF1ZGlvb3V0cHV0Iiwic2xpY2UiLCJsZW5ndGgiLCJkZWZhdWx0RGV2aWNlIiwiX3NldEF1ZGlvT3V0cHV0IiwiYXVkaW9JbnB1dHMiLCJhdWRpb2lucHV0IiwiX3NldEF1ZGlvSW5wdXQiLCJ2aWRlb0lucHV0cyIsInZpZGVvaW5wdXQiLCJfc2V0VmlkZW9JbnB1dCIsIlNldHRpbmdMZXZlbCIsIkFDQ09VTlQiLCJERVZJQ0UiLCJfY2hhbmdlV2ViUnRjTWV0aG9kIiwiX2NoYW5nZUZhbGxiYWNrSUNFU2VydmVyQWxsb3dlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFhZSxNQUFNQSxvQkFBTixTQUFtQ0MsZUFBTUMsU0FBekMsQ0FBbUQ7QUFDOURDLEVBQUFBLFdBQVcsR0FBRztBQUNWO0FBRFUsZ0VBa0JTLE1BQU9DLE1BQVAsSUFBa0I7QUFDckMsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLFlBQVksRUFBRSxNQUFNQywwQkFBaUJDLFVBQWpCLEVBRFY7QUFFVkMsUUFBQUEsaUJBQWlCLEVBQUVGLDBCQUFpQkcsY0FBakIsRUFGVDtBQUdWQyxRQUFBQSxnQkFBZ0IsRUFBRUosMEJBQWlCSyxhQUFqQixFQUhSO0FBSVZDLFFBQUFBLGdCQUFnQixFQUFFTiwwQkFBaUJPLGFBQWpCO0FBSlIsT0FB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QUQ3QztBQUVPLFVBQUEsUUFBUSxFQUFFLEtBQUtPO0FBRnRCLFdBR0ssS0FBSzlCLG9CQUFMLENBQTBCNEIsV0FBMUIsRUFBdUMsWUFBdkMsQ0FITCxDQURKO0FBT0g7QUFDSjs7QUFFRCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLE9BQXlDLHlCQUFHLGVBQUgsQ0FBekMsQ0FESixlQUVJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLbkIsYUFETCxFQUVLQyxlQUZMLEVBR0tDLGtCQUhMLEVBSUtDLGNBSkwsZUFLSSw2QkFBQyxZQUFEO0FBQWMsTUFBQSxJQUFJLEVBQUMsaUNBQW5CO0FBQXFELE1BQUEsS0FBSyxFQUFFbUIsMkJBQWFDO0FBQXpFLE1BTEosZUFNSSw2QkFBQyxZQUFEO0FBQ0ksTUFBQSxJQUFJLEVBQUMsdUJBRFQ7QUFFSSxNQUFBLEtBQUssRUFBRUQsMkJBQWFFLE1BRnhCO0FBR0ksTUFBQSxRQUFRLEVBQUUsS0FBS0M7QUFIbkIsTUFOSixlQVdJLDZCQUFDLFlBQUQ7QUFDSSxNQUFBLElBQUksRUFBQywwQkFEVDtBQUVJLE1BQUEsS0FBSyxFQUFFSCwyQkFBYUUsTUFGeEI7QUFHSSxNQUFBLFFBQVEsRUFBRSxLQUFLRTtBQUhuQixNQVhKLENBRkosQ0FESjtBQXNCSDs7QUF6TTZEIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBDYWxsTWVkaWFIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9DYWxsTWVkaWFIYW5kbGVyXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZvaWNlVXNlclNldHRpbmdzVGFiIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgbWVkaWFEZXZpY2VzOiBmYWxzZSxcbiAgICAgICAgICAgIGFjdGl2ZUF1ZGlvT3V0cHV0OiBudWxsLFxuICAgICAgICAgICAgYWN0aXZlQXVkaW9JbnB1dDogbnVsbCxcbiAgICAgICAgICAgIGFjdGl2ZVZpZGVvSW5wdXQ6IG51bGwsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IGNhblNlZURldmljZUxhYmVscyA9IGF3YWl0IENhbGxNZWRpYUhhbmRsZXIuaGFzQW55TGFiZWxlZERldmljZXMoKTtcbiAgICAgICAgaWYgKGNhblNlZURldmljZUxhYmVscykge1xuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaE1lZGlhRGV2aWNlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX3JlZnJlc2hNZWRpYURldmljZXMgPSBhc3luYyAoc3RyZWFtKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbWVkaWFEZXZpY2VzOiBhd2FpdCBDYWxsTWVkaWFIYW5kbGVyLmdldERldmljZXMoKSxcbiAgICAgICAgICAgIGFjdGl2ZUF1ZGlvT3V0cHV0OiBDYWxsTWVkaWFIYW5kbGVyLmdldEF1ZGlvT3V0cHV0KCksXG4gICAgICAgICAgICBhY3RpdmVBdWRpb0lucHV0OiBDYWxsTWVkaWFIYW5kbGVyLmdldEF1ZGlvSW5wdXQoKSxcbiAgICAgICAgICAgIGFjdGl2ZVZpZGVvSW5wdXQ6IENhbGxNZWRpYUhhbmRsZXIuZ2V0VmlkZW9JbnB1dCgpLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICAgICAgLy8ga2lsbCBzdHJlYW0gKGFmdGVyIHdlJ3ZlIGVudW1lcmF0ZWQgdGhlIGRldmljZXMsIG90aGVyd2lzZSB3ZSdkIGdldCBlbXB0eSBsYWJlbHMgYWdhaW4pXG4gICAgICAgICAgICAvLyBzbyB0aGF0IHdlIGRvbid0IGxlYXZlIGl0IGxpbmdlcmluZyBhcm91bmQgd2l0aCB3ZWJjYW0gZW5hYmxlZCBldGNcbiAgICAgICAgICAgIC8vIGFzIGhlcmUgd2UgY2FsbGVkIGdVTSB0byBhc2sgdXNlciBmb3IgcGVybWlzc2lvbiB0byB0aGVpciBkZXZpY2UgbmFtZXMgb25seVxuICAgICAgICAgICAgc3RyZWFtLmdldFRyYWNrcygpLmZvckVhY2goKHRyYWNrKSA9PiB0cmFjay5zdG9wKCkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9yZXF1ZXN0TWVkaWFQZXJtaXNzaW9ucyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgbGV0IGNvbnN0cmFpbnRzO1xuICAgICAgICBsZXQgc3RyZWFtO1xuICAgICAgICBsZXQgZXJyb3I7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdHJhaW50cyA9IHt2aWRlbzogdHJ1ZSwgYXVkaW86IHRydWV9O1xuICAgICAgICAgICAgc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIC8vIHVzZXIgbGlrZWx5IGRvZXNuJ3QgaGF2ZSBhIHdlYmNhbSxcbiAgICAgICAgICAgIC8vIHdlIHNob3VsZCBzdGlsbCBhbGxvdyB0byBzZWxlY3QgYSBtaWNyb3Bob25lXG4gICAgICAgICAgICBpZiAoZXJyLm5hbWUgPT09IFwiTm90Rm91bmRFcnJvclwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3RyYWludHMgPSB7IGF1ZGlvOiB0cnVlIH07XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgc3RyZWFtID0gYXdhaXQgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoY29uc3RyYWludHMpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuRXJyb3JEaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIG1lZGlhIHBlcm1pc3Npb25zJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdObyBtZWRpYSBwZXJtaXNzaW9ucycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgJ1lvdSBtYXkgbmVlZCB0byBtYW51YWxseSBwZXJtaXQgJShicmFuZClzIHRvIGFjY2VzcyB5b3VyIG1pY3JvcGhvbmUvd2ViY2FtJyxcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hNZWRpYURldmljZXMoc3RyZWFtKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2V0QXVkaW9PdXRwdXQgPSAoZSkgPT4ge1xuICAgICAgICBDYWxsTWVkaWFIYW5kbGVyLnNldEF1ZGlvT3V0cHV0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhY3RpdmVBdWRpb091dHB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfc2V0QXVkaW9JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgIENhbGxNZWRpYUhhbmRsZXIuc2V0QXVkaW9JbnB1dChlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWN0aXZlQXVkaW9JbnB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfc2V0VmlkZW9JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgIENhbGxNZWRpYUhhbmRsZXIuc2V0VmlkZW9JbnB1dChlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWN0aXZlVmlkZW9JbnB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfY2hhbmdlV2ViUnRjTWV0aG9kID0gKHAycCkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Rm9yY2VUVVJOKCFwMnApO1xuICAgIH07XG5cbiAgICBfY2hhbmdlRmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkID0gKGFsbG93KSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQoYWxsb3cpO1xuICAgIH07XG5cbiAgICBfcmVuZGVyRGV2aWNlT3B0aW9ucyhkZXZpY2VzLCBjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gZGV2aWNlcy5tYXAoKGQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoPG9wdGlvbiBrZXk9e2Ake2NhdGVnb3J5fS0ke2QuZGV2aWNlSWR9YH0gdmFsdWU9e2QuZGV2aWNlSWR9PntkLmxhYmVsfTwvb3B0aW9uPik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLlNldHRpbmdzRmxhZ1wiKTtcblxuICAgICAgICBsZXQgcmVxdWVzdEJ1dHRvbiA9IG51bGw7XG4gICAgICAgIGxldCBzcGVha2VyRHJvcGRvd24gPSBudWxsO1xuICAgICAgICBsZXQgbWljcm9waG9uZURyb3Bkb3duID0gbnVsbDtcbiAgICAgICAgbGV0IHdlYmNhbURyb3Bkb3duID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmVxdWVzdEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfVm9pY2VVc2VyU2V0dGluZ3NUYWJfbWlzc2luZ01lZGlhUGVybWlzc2lvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJNaXNzaW5nIG1lZGlhIHBlcm1pc3Npb25zLCBjbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIHJlcXVlc3QuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fcmVxdWVzdE1lZGlhUGVybWlzc2lvbnN9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZXF1ZXN0IG1lZGlhIHBlcm1pc3Npb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzKSB7XG4gICAgICAgICAgICBzcGVha2VyRHJvcGRvd24gPSA8cD57IF90KCdObyBBdWRpbyBPdXRwdXRzIGRldGVjdGVkJykgfTwvcD47XG4gICAgICAgICAgICBtaWNyb3Bob25lRHJvcGRvd24gPSA8cD57IF90KCdObyBNaWNyb3Bob25lcyBkZXRlY3RlZCcpIH08L3A+O1xuICAgICAgICAgICAgd2ViY2FtRHJvcGRvd24gPSA8cD57IF90KCdObyBXZWJjYW1zIGRldGVjdGVkJykgfTwvcD47XG5cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlSWQ6ICcnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnRGVmYXVsdCBEZXZpY2UnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBnZXREZWZhdWx0RGV2aWNlID0gKGRldmljZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHdlJ3JlIGxvb2tpbmcgZm9yIGEgZGV2aWNlIHdpdGggZGV2aWNlSWQgJ2RlZmF1bHQnIGJ1dCBhZGRpbmcgYSBkZXZpY2VcbiAgICAgICAgICAgICAgICAvLyB3aXRoIGRldmljZUlkID09IHRoZSBlbXB0eSBzdHJpbmc6IHRoaXMgaXMgYmVjYXVzZSBDaHJvbWUgZ2l2ZXMgdXMgYSBkZXZpY2VcbiAgICAgICAgICAgICAgICAvLyB3aXRoIGRldmljZUlkICdkZWZhdWx0Jywgc28gd2UncmUgbG9va2luZyBmb3IgdGhpcywgbm90IHRoZSBvbmUgd2UgYXJlIGFkZGluZy5cbiAgICAgICAgICAgICAgICBpZiAoIWRldmljZXMuc29tZSgoaSkgPT4gaS5kZXZpY2VJZCA9PT0gJ2RlZmF1bHQnKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXZpY2VzLnVuc2hpZnQoZGVmYXVsdE9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGF1ZGlvT3V0cHV0cyA9IHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzLmF1ZGlvb3V0cHV0LnNsaWNlKDApO1xuICAgICAgICAgICAgaWYgKGF1ZGlvT3V0cHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdERldmljZSA9IGdldERlZmF1bHREZXZpY2UoYXVkaW9PdXRwdXRzKTtcbiAgICAgICAgICAgICAgICBzcGVha2VyRHJvcGRvd24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBlbGVtZW50PVwic2VsZWN0XCIgbGFiZWw9e190KFwiQXVkaW8gT3V0cHV0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlQXVkaW9PdXRwdXQgfHwgZGVmYXVsdERldmljZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9zZXRBdWRpb091dHB1dH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyRGV2aWNlT3B0aW9ucyhhdWRpb091dHB1dHMsICdhdWRpb091dHB1dCcpfVxuICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGF1ZGlvSW5wdXRzID0gdGhpcy5zdGF0ZS5tZWRpYURldmljZXMuYXVkaW9pbnB1dC5zbGljZSgwKTtcbiAgICAgICAgICAgIGlmIChhdWRpb0lucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdERldmljZSA9IGdldERlZmF1bHREZXZpY2UoYXVkaW9JbnB1dHMpO1xuICAgICAgICAgICAgICAgIG1pY3JvcGhvbmVEcm9wZG93biA9IChcbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkIGVsZW1lbnQ9XCJzZWxlY3RcIiBsYWJlbD17X3QoXCJNaWNyb3Bob25lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlQXVkaW9JbnB1dCB8fCBkZWZhdWx0RGV2aWNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3NldEF1ZGlvSW5wdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckRldmljZU9wdGlvbnMoYXVkaW9JbnB1dHMsICdhdWRpb0lucHV0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdmlkZW9JbnB1dHMgPSB0aGlzLnN0YXRlLm1lZGlhRGV2aWNlcy52aWRlb2lucHV0LnNsaWNlKDApO1xuICAgICAgICAgICAgaWYgKHZpZGVvSW5wdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0RGV2aWNlID0gZ2V0RGVmYXVsdERldmljZSh2aWRlb0lucHV0cyk7XG4gICAgICAgICAgICAgICAgd2ViY2FtRHJvcGRvd24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBlbGVtZW50PVwic2VsZWN0XCIgbGFiZWw9e190KFwiQ2FtZXJhXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlVmlkZW9JbnB1dCB8fCBkZWZhdWx0RGV2aWNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3NldFZpZGVvSW5wdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckRldmljZU9wdGlvbnModmlkZW9JbnB1dHMsICd2aWRlb0lucHV0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X1ZvaWNlVXNlclNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiVm9pY2UgJiBWaWRlb1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAge3JlcXVlc3RCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIHtzcGVha2VyRHJvcGRvd259XG4gICAgICAgICAgICAgICAgICAgIHttaWNyb3Bob25lRHJvcGRvd259XG4gICAgICAgICAgICAgICAgICAgIHt3ZWJjYW1Ecm9wZG93bn1cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPSdWaWRlb1ZpZXcuZmxpcFZpZGVvSG9yaXpvbnRhbGx5JyBsZXZlbD17U2V0dGluZ0xldmVsLkFDQ09VTlR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9J3dlYlJ0Y0FsbG93UGVlclRvUGVlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2NoYW5nZVdlYlJ0Y01ldGhvZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT0nZmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fY2hhbmdlRmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19