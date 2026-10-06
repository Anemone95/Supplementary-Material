"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../../../utils/replaceableComponent");

var _dec, _class, _temp;

let VoiceUserSettingsTab = (_dec = (0, _replaceableComponent.replaceableComponent)("views.settings.tabs.user.VoiceUserSettingsTab"), _dec(_class = (_temp = class VoiceUserSettingsTab extends _react.default.Component {
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
        console.log("Failed to list userMedia devices", error);

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

}, _temp)) || _class);
exports.default = VoiceUserSettingsTab;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3NldHRpbmdzL3RhYnMvdXNlci9Wb2ljZVVzZXJTZXR0aW5nc1RhYi5qcyJdLCJuYW1lcyI6WyJWb2ljZVVzZXJTZXR0aW5nc1RhYiIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJzdHJlYW0iLCJzZXRTdGF0ZSIsIm1lZGlhRGV2aWNlcyIsIkNhbGxNZWRpYUhhbmRsZXIiLCJnZXREZXZpY2VzIiwiYWN0aXZlQXVkaW9PdXRwdXQiLCJnZXRBdWRpb091dHB1dCIsImFjdGl2ZUF1ZGlvSW5wdXQiLCJnZXRBdWRpb0lucHV0IiwiYWN0aXZlVmlkZW9JbnB1dCIsImdldFZpZGVvSW5wdXQiLCJnZXRUcmFja3MiLCJmb3JFYWNoIiwidHJhY2siLCJzdG9wIiwiY29uc3RyYWludHMiLCJlcnJvciIsInZpZGVvIiwiYXVkaW8iLCJuYXZpZ2F0b3IiLCJnZXRVc2VyTWVkaWEiLCJlcnIiLCJuYW1lIiwiY29uc29sZSIsImxvZyIsImJyYW5kIiwiU2RrQ29uZmlnIiwiZ2V0IiwiRXJyb3JEaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJNb2RhbCIsImNyZWF0ZVRyYWNrZWREaWFsb2ciLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiX3JlZnJlc2hNZWRpYURldmljZXMiLCJlIiwic2V0QXVkaW9PdXRwdXQiLCJ0YXJnZXQiLCJ2YWx1ZSIsInNldEF1ZGlvSW5wdXQiLCJzZXRWaWRlb0lucHV0IiwicDJwIiwiTWF0cml4Q2xpZW50UGVnIiwic2V0Rm9yY2VUVVJOIiwiYWxsb3ciLCJzZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQiLCJzdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY2FuU2VlRGV2aWNlTGFiZWxzIiwiaGFzQW55TGFiZWxlZERldmljZXMiLCJfcmVuZGVyRGV2aWNlT3B0aW9ucyIsImRldmljZXMiLCJjYXRlZ29yeSIsIm1hcCIsImQiLCJkZXZpY2VJZCIsImxhYmVsIiwicmVuZGVyIiwiU2V0dGluZ3NGbGFnIiwicmVxdWVzdEJ1dHRvbiIsInNwZWFrZXJEcm9wZG93biIsIm1pY3JvcGhvbmVEcm9wZG93biIsIndlYmNhbURyb3Bkb3duIiwiX3JlcXVlc3RNZWRpYVBlcm1pc3Npb25zIiwiZGVmYXVsdE9wdGlvbiIsImdldERlZmF1bHREZXZpY2UiLCJzb21lIiwiaSIsInVuc2hpZnQiLCJhdWRpb091dHB1dHMiLCJhdWRpb291dHB1dCIsInNsaWNlIiwibGVuZ3RoIiwiZGVmYXVsdERldmljZSIsIl9zZXRBdWRpb091dHB1dCIsImF1ZGlvSW5wdXRzIiwiYXVkaW9pbnB1dCIsIl9zZXRBdWRpb0lucHV0IiwidmlkZW9JbnB1dHMiLCJ2aWRlb2lucHV0IiwiX3NldFZpZGVvSW5wdXQiLCJTZXR0aW5nTGV2ZWwiLCJBQ0NPVU5UIiwiREVWSUNFIiwiX2NoYW5nZVdlYlJ0Y01ldGhvZCIsIl9jaGFuZ2VGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7SUFHcUJBLG9CLFdBRHBCLGdEQUFxQiwrQ0FBckIsQyx5QkFBRCxNQUNxQkEsb0JBRHJCLFNBQ2tEQyxlQUFNQyxTQUR4RCxDQUNrRTtBQUM5REMsRUFBQUEsV0FBVyxHQUFHO0FBQ1Y7QUFEVSxnRUFrQlMsTUFBT0MsTUFBUCxJQUFrQjtBQUNyQyxXQUFLQyxRQUFMLENBQWM7QUFDVkMsUUFBQUEsWUFBWSxFQUFFLE1BQU1DLDBCQUFpQkMsVUFBakIsRUFEVjtBQUVWQyxRQUFBQSxpQkFBaUIsRUFBRUYsMEJBQWlCRyxjQUFqQixFQUZUO0FBR1ZDLFFBQUFBLGdCQUFnQixFQUFFSiwwQkFBaUJLLGFBQWpCLEVBSFI7QUFJVkMsUUFBQUEsZ0JBQWdCLEVBQUVOLDBCQUFpQk8sYUFBakI7QUFKUixPQUFkOztBQU1BLFVBQUlWLE1BQUosRUFB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S2hCLEtBQUwsQ0FBV3RDLGdCQUFYLElBQStCaUUsYUFEMUM7QUFFSSxVQUFBLFFBQVEsRUFBRSxLQUFLTztBQUZuQixXQUdLLEtBQUs5QixvQkFBTCxDQUEwQjRCLFdBQTFCLEVBQXVDLFlBQXZDLENBSEwsQ0FESjtBQU9IO0FBQ0o7O0FBRUQsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUF5Qyx5QkFBRyxlQUFILENBQXpDLENBREosZUFFSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDS25CLGFBREwsRUFFS0MsZUFGTCxFQUdLQyxrQkFITCxFQUlLQyxjQUpMLGVBS0ksNkJBQUMsWUFBRDtBQUFjLE1BQUEsSUFBSSxFQUFDLGlDQUFuQjtBQUFxRCxNQUFBLEtBQUssRUFBRW1CLDJCQUFhQztBQUF6RSxNQUxKLGVBTUksNkJBQUMsWUFBRDtBQUNJLE1BQUEsSUFBSSxFQUFDLHVCQURUO0FBRUksTUFBQSxLQUFLLEVBQUVELDJCQUFhRSxNQUZ4QjtBQUdJLE1BQUEsUUFBUSxFQUFFLEtBQUtDO0FBSG5CLE1BTkosZUFXSSw2QkFBQyxZQUFEO0FBQ0ksTUFBQSxJQUFJLEVBQUMsMEJBRFQ7QUFFSSxNQUFBLEtBQUssRUFBRUgsMkJBQWFFLE1BRnhCO0FBR0ksTUFBQSxRQUFRLEVBQUUsS0FBS0U7QUFIbkIsTUFYSixDQUZKLENBREo7QUFzQkg7O0FBMU02RCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge190fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9TZGtDb25maWdcIjtcbmltcG9ydCBDYWxsTWVkaWFIYW5kbGVyIGZyb20gXCIuLi8uLi8uLi8uLi8uLi9DYWxsTWVkaWFIYW5kbGVyXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcIi4uLy4uLy4uL2VsZW1lbnRzL0ZpZWxkXCI7XG5pbXBvcnQgQWNjZXNzaWJsZUJ1dHRvbiBmcm9tIFwiLi4vLi4vLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvblwiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCAqIGFzIHNkayBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vaW5kZXhcIjtcbmltcG9ydCBNb2RhbCBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vTW9kYWxcIjtcbmltcG9ydCB7U2V0dGluZ0xldmVsfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ0xldmVsXCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3Muc2V0dGluZ3MudGFicy51c2VyLlZvaWNlVXNlclNldHRpbmdzVGFiXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWb2ljZVVzZXJTZXR0aW5nc1RhYiBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIG1lZGlhRGV2aWNlczogZmFsc2UsXG4gICAgICAgICAgICBhY3RpdmVBdWRpb091dHB1dDogbnVsbCxcbiAgICAgICAgICAgIGFjdGl2ZUF1ZGlvSW5wdXQ6IG51bGwsXG4gICAgICAgICAgICBhY3RpdmVWaWRlb0lucHV0OiBudWxsLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGFzeW5jIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCBjYW5TZWVEZXZpY2VMYWJlbHMgPSBhd2FpdCBDYWxsTWVkaWFIYW5kbGVyLmhhc0FueUxhYmVsZWREZXZpY2VzKCk7XG4gICAgICAgIGlmIChjYW5TZWVEZXZpY2VMYWJlbHMpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hNZWRpYURldmljZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9yZWZyZXNoTWVkaWFEZXZpY2VzID0gYXN5bmMgKHN0cmVhbSkgPT4ge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIG1lZGlhRGV2aWNlczogYXdhaXQgQ2FsbE1lZGlhSGFuZGxlci5nZXREZXZpY2VzKCksXG4gICAgICAgICAgICBhY3RpdmVBdWRpb091dHB1dDogQ2FsbE1lZGlhSGFuZGxlci5nZXRBdWRpb091dHB1dCgpLFxuICAgICAgICAgICAgYWN0aXZlQXVkaW9JbnB1dDogQ2FsbE1lZGlhSGFuZGxlci5nZXRBdWRpb0lucHV0KCksXG4gICAgICAgICAgICBhY3RpdmVWaWRlb0lucHV0OiBDYWxsTWVkaWFIYW5kbGVyLmdldFZpZGVvSW5wdXQoKSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdHJlYW0pIHtcbiAgICAgICAgICAgIC8vIGtpbGwgc3RyZWFtIChhZnRlciB3ZSd2ZSBlbnVtZXJhdGVkIHRoZSBkZXZpY2VzLCBvdGhlcndpc2Ugd2UnZCBnZXQgZW1wdHkgbGFiZWxzIGFnYWluKVxuICAgICAgICAgICAgLy8gc28gdGhhdCB3ZSBkb24ndCBsZWF2ZSBpdCBsaW5nZXJpbmcgYXJvdW5kIHdpdGggd2ViY2FtIGVuYWJsZWQgZXRjXG4gICAgICAgICAgICAvLyBhcyBoZXJlIHdlIGNhbGxlZCBnVU0gdG8gYXNrIHVzZXIgZm9yIHBlcm1pc3Npb24gdG8gdGhlaXIgZGV2aWNlIG5hbWVzIG9ubHlcbiAgICAgICAgICAgIHN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKCh0cmFjaykgPT4gdHJhY2suc3RvcCgpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfcmVxdWVzdE1lZGlhUGVybWlzc2lvbnMgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGxldCBjb25zdHJhaW50cztcbiAgICAgICAgbGV0IHN0cmVhbTtcbiAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3RyYWludHMgPSB7dmlkZW86IHRydWUsIGF1ZGlvOiB0cnVlfTtcbiAgICAgICAgICAgIHN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAvLyB1c2VyIGxpa2VseSBkb2Vzbid0IGhhdmUgYSB3ZWJjYW0sXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGQgc3RpbGwgYWxsb3cgdG8gc2VsZWN0IGEgbWljcm9waG9uZVxuICAgICAgICAgICAgaWYgKGVyci5uYW1lID09PSBcIk5vdEZvdW5kRXJyb3JcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0cmFpbnRzID0geyBhdWRpbzogdHJ1ZSB9O1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmVhbSA9IGF3YWl0IG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKGNvbnN0cmFpbnRzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmFpbGVkIHRvIGxpc3QgdXNlck1lZGlhIGRldmljZXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgYnJhbmQgPSBTZGtDb25maWcuZ2V0KCkuYnJhbmQ7XG4gICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuRXJyb3JEaWFsb2cnKTtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ05vIG1lZGlhIHBlcm1pc3Npb25zJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgdGl0bGU6IF90KCdObyBtZWRpYSBwZXJtaXNzaW9ucycpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdChcbiAgICAgICAgICAgICAgICAgICAgJ1lvdSBtYXkgbmVlZCB0byBtYW51YWxseSBwZXJtaXQgJShicmFuZClzIHRvIGFjY2VzcyB5b3VyIG1pY3JvcGhvbmUvd2ViY2FtJyxcbiAgICAgICAgICAgICAgICAgICAgeyBicmFuZCB9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hNZWRpYURldmljZXMoc3RyZWFtKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2V0QXVkaW9PdXRwdXQgPSAoZSkgPT4ge1xuICAgICAgICBDYWxsTWVkaWFIYW5kbGVyLnNldEF1ZGlvT3V0cHV0KGUudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBhY3RpdmVBdWRpb091dHB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfc2V0QXVkaW9JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgIENhbGxNZWRpYUhhbmRsZXIuc2V0QXVkaW9JbnB1dChlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWN0aXZlQXVkaW9JbnB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfc2V0VmlkZW9JbnB1dCA9IChlKSA9PiB7XG4gICAgICAgIENhbGxNZWRpYUhhbmRsZXIuc2V0VmlkZW9JbnB1dChlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgYWN0aXZlVmlkZW9JbnB1dDogZS50YXJnZXQudmFsdWUsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfY2hhbmdlV2ViUnRjTWV0aG9kID0gKHAycCkgPT4ge1xuICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2V0Rm9yY2VUVVJOKCFwMnApO1xuICAgIH07XG5cbiAgICBfY2hhbmdlRmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkID0gKGFsbG93KSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZXRGYWxsYmFja0lDRVNlcnZlckFsbG93ZWQoYWxsb3cpO1xuICAgIH07XG5cbiAgICBfcmVuZGVyRGV2aWNlT3B0aW9ucyhkZXZpY2VzLCBjYXRlZ29yeSkge1xuICAgICAgICByZXR1cm4gZGV2aWNlcy5tYXAoKGQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoPG9wdGlvbiBrZXk9e2Ake2NhdGVnb3J5fS0ke2QuZGV2aWNlSWR9YH0gdmFsdWU9e2QuZGV2aWNlSWR9PntkLmxhYmVsfTwvb3B0aW9uPik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgU2V0dGluZ3NGbGFnID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmVsZW1lbnRzLlNldHRpbmdzRmxhZ1wiKTtcblxuICAgICAgICBsZXQgcmVxdWVzdEJ1dHRvbiA9IG51bGw7XG4gICAgICAgIGxldCBzcGVha2VyRHJvcGRvd24gPSBudWxsO1xuICAgICAgICBsZXQgbWljcm9waG9uZURyb3Bkb3duID0gbnVsbDtcbiAgICAgICAgbGV0IHdlYmNhbURyb3Bkb3duID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmVxdWVzdEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0nbXhfVm9pY2VVc2VyU2V0dGluZ3NUYWJfbWlzc2luZ01lZGlhUGVybWlzc2lvbnMnPlxuICAgICAgICAgICAgICAgICAgICA8cD57X3QoXCJNaXNzaW5nIG1lZGlhIHBlcm1pc3Npb25zLCBjbGljayB0aGUgYnV0dG9uIGJlbG93IHRvIHJlcXVlc3QuXCIpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b24gb25DbGljaz17dGhpcy5fcmVxdWVzdE1lZGlhUGVybWlzc2lvbnN9IGtpbmQ9XCJwcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7X3QoXCJSZXF1ZXN0IG1lZGlhIHBlcm1pc3Npb25zXCIpfVxuICAgICAgICAgICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzKSB7XG4gICAgICAgICAgICBzcGVha2VyRHJvcGRvd24gPSA8cD57IF90KCdObyBBdWRpbyBPdXRwdXRzIGRldGVjdGVkJykgfTwvcD47XG4gICAgICAgICAgICBtaWNyb3Bob25lRHJvcGRvd24gPSA8cD57IF90KCdObyBNaWNyb3Bob25lcyBkZXRlY3RlZCcpIH08L3A+O1xuICAgICAgICAgICAgd2ViY2FtRHJvcGRvd24gPSA8cD57IF90KCdObyBXZWJjYW1zIGRldGVjdGVkJykgfTwvcD47XG5cbiAgICAgICAgICAgIGNvbnN0IGRlZmF1bHRPcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgZGV2aWNlSWQ6ICcnLFxuICAgICAgICAgICAgICAgIGxhYmVsOiBfdCgnRGVmYXVsdCBEZXZpY2UnKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBnZXREZWZhdWx0RGV2aWNlID0gKGRldmljZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHdlJ3JlIGxvb2tpbmcgZm9yIGEgZGV2aWNlIHdpdGggZGV2aWNlSWQgJ2RlZmF1bHQnIGJ1dCBhZGRpbmcgYSBkZXZpY2VcbiAgICAgICAgICAgICAgICAvLyB3aXRoIGRldmljZUlkID09IHRoZSBlbXB0eSBzdHJpbmc6IHRoaXMgaXMgYmVjYXVzZSBDaHJvbWUgZ2l2ZXMgdXMgYSBkZXZpY2VcbiAgICAgICAgICAgICAgICAvLyB3aXRoIGRldmljZUlkICdkZWZhdWx0Jywgc28gd2UncmUgbG9va2luZyBmb3IgdGhpcywgbm90IHRoZSBvbmUgd2UgYXJlIGFkZGluZy5cbiAgICAgICAgICAgICAgICBpZiAoIWRldmljZXMuc29tZSgoaSkgPT4gaS5kZXZpY2VJZCA9PT0gJ2RlZmF1bHQnKSkge1xuICAgICAgICAgICAgICAgICAgICBkZXZpY2VzLnVuc2hpZnQoZGVmYXVsdE9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2RlZmF1bHQnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGF1ZGlvT3V0cHV0cyA9IHRoaXMuc3RhdGUubWVkaWFEZXZpY2VzLmF1ZGlvb3V0cHV0LnNsaWNlKDApO1xuICAgICAgICAgICAgaWYgKGF1ZGlvT3V0cHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdERldmljZSA9IGdldERlZmF1bHREZXZpY2UoYXVkaW9PdXRwdXRzKTtcbiAgICAgICAgICAgICAgICBzcGVha2VyRHJvcGRvd24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBlbGVtZW50PVwic2VsZWN0XCIgbGFiZWw9e190KFwiQXVkaW8gT3V0cHV0XCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlQXVkaW9PdXRwdXQgfHwgZGVmYXVsdERldmljZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9zZXRBdWRpb091dHB1dH0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyRGV2aWNlT3B0aW9ucyhhdWRpb091dHB1dHMsICdhdWRpb091dHB1dCcpfVxuICAgICAgICAgICAgICAgICAgICA8L0ZpZWxkPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGF1ZGlvSW5wdXRzID0gdGhpcy5zdGF0ZS5tZWRpYURldmljZXMuYXVkaW9pbnB1dC5zbGljZSgwKTtcbiAgICAgICAgICAgIGlmIChhdWRpb0lucHV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGVmYXVsdERldmljZSA9IGdldERlZmF1bHREZXZpY2UoYXVkaW9JbnB1dHMpO1xuICAgICAgICAgICAgICAgIG1pY3JvcGhvbmVEcm9wZG93biA9IChcbiAgICAgICAgICAgICAgICAgICAgPEZpZWxkIGVsZW1lbnQ9XCJzZWxlY3RcIiBsYWJlbD17X3QoXCJNaWNyb3Bob25lXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlQXVkaW9JbnB1dCB8fCBkZWZhdWx0RGV2aWNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3NldEF1ZGlvSW5wdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckRldmljZU9wdGlvbnMoYXVkaW9JbnB1dHMsICdhdWRpb0lucHV0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdmlkZW9JbnB1dHMgPSB0aGlzLnN0YXRlLm1lZGlhRGV2aWNlcy52aWRlb2lucHV0LnNsaWNlKDApO1xuICAgICAgICAgICAgaWYgKHZpZGVvSW5wdXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZWZhdWx0RGV2aWNlID0gZ2V0RGVmYXVsdERldmljZSh2aWRlb0lucHV0cyk7XG4gICAgICAgICAgICAgICAgd2ViY2FtRHJvcGRvd24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxGaWVsZCBlbGVtZW50PVwic2VsZWN0XCIgbGFiZWw9e190KFwiQ2FtZXJhXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUuYWN0aXZlVmlkZW9JbnB1dCB8fCBkZWZhdWx0RGV2aWNlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX3NldFZpZGVvSW5wdXR9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckRldmljZU9wdGlvbnModmlkZW9JbnB1dHMsICd2aWRlb0lucHV0Jyl9XG4gICAgICAgICAgICAgICAgICAgIDwvRmllbGQ+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiIG14X1ZvaWNlVXNlclNldHRpbmdzVGFiXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZXR0aW5nc1RhYl9oZWFkaW5nXCI+e190KFwiVm9pY2UgJiBWaWRlb1wiKX08L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1NldHRpbmdzVGFiX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICAgICAge3JlcXVlc3RCdXR0b259XG4gICAgICAgICAgICAgICAgICAgIHtzcGVha2VyRHJvcGRvd259XG4gICAgICAgICAgICAgICAgICAgIHttaWNyb3Bob25lRHJvcGRvd259XG4gICAgICAgICAgICAgICAgICAgIHt3ZWJjYW1Ecm9wZG93bn1cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZyBuYW1lPSdWaWRlb1ZpZXcuZmxpcFZpZGVvSG9yaXpvbnRhbGx5JyBsZXZlbD17U2V0dGluZ0xldmVsLkFDQ09VTlR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxTZXR0aW5nc0ZsYWdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9J3dlYlJ0Y0FsbG93UGVlclRvUGVlcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldmVsPXtTZXR0aW5nTGV2ZWwuREVWSUNFfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2NoYW5nZVdlYlJ0Y01ldGhvZH1cbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPFNldHRpbmdzRmxhZ1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT0nZmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV2ZWw9e1NldHRpbmdMZXZlbC5ERVZJQ0V9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fY2hhbmdlRmFsbGJhY2tJQ0VTZXJ2ZXJBbGxvd2VkfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19