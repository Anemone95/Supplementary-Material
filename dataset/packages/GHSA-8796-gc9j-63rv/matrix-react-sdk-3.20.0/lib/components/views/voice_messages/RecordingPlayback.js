"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _Playback = require("../../../voice/Playback");

var _react = _interopRequireDefault(require("react"));

var _AsyncStore = require("../../../stores/AsyncStore");

var _PlaybackWaveform = _interopRequireDefault(require("./PlaybackWaveform"));

var _PlayPauseButton = _interopRequireDefault(require("./PlayPauseButton"));

var _PlaybackClock = _interopRequireDefault(require("./PlaybackClock"));

/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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
class RecordingPlayback extends _react.default.PureComponent
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    (0, _defineProperty2.default)(this, "onPlaybackUpdate", (ev
    /*: PlaybackState*/
    ) => {
      this.setState({
        playbackPhase: ev
      });
    });
    this.state = {
      playbackPhase: _Playback.PlaybackState.Decoding // default assumption

    }; // We don't need to de-register: the class handles this for us internally

    this.props.playback.on(_AsyncStore.UPDATE_EVENT, this.onPlaybackUpdate); // Don't wait for the promise to complete - it will emit a progress update when it
    // is done, and it's not meant to take long anyhow.
    // noinspection JSIgnoredPromiseFromCall

    this.props.playback.prepare();
  }

  render()
  /*: ReactNode*/
  {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_VoiceMessagePrimaryContainer"
    }, /*#__PURE__*/_react.default.createElement(_PlayPauseButton.default, {
      playback: this.props.playback,
      playbackPhase: this.state.playbackPhase
    }), /*#__PURE__*/_react.default.createElement(_PlaybackClock.default, {
      playback: this.props.playback
    }), /*#__PURE__*/_react.default.createElement(_PlaybackWaveform.default, {
      playback: this.props.playback
    }));
  }

}

exports.default = RecordingPlayback;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3ZvaWNlX21lc3NhZ2VzL1JlY29yZGluZ1BsYXliYWNrLnRzeCJdLCJuYW1lcyI6WyJSZWNvcmRpbmdQbGF5YmFjayIsIlJlYWN0IiwiUHVyZUNvbXBvbmVudCIsImNvbnN0cnVjdG9yIiwicHJvcHMiLCJldiIsInNldFN0YXRlIiwicGxheWJhY2tQaGFzZSIsInN0YXRlIiwiUGxheWJhY2tTdGF0ZSIsIkRlY29kaW5nIiwicGxheWJhY2siLCJvbiIsIlVQREFURV9FVkVOVCIsIm9uUGxheWJhY2tVcGRhdGUiLCJwcmVwYXJlIiwicmVuZGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBbUJlLE1BQU1BLGlCQUFOLFNBQWdDQyxlQUFNQztBQUF0QztBQUFvRTtBQUMvRUMsRUFBQUEsV0FBVyxDQUFDQztBQUFEO0FBQUEsSUFBZ0I7QUFDdkIsVUFBTUEsS0FBTjtBQUR1Qiw0REFnQkEsQ0FBQ0M7QUFBRDtBQUFBLFNBQXVCO0FBQzlDLFdBQUtDLFFBQUwsQ0FBYztBQUFDQyxRQUFBQSxhQUFhLEVBQUVGO0FBQWhCLE9BQWQ7QUFDSCxLQWxCMEI7QUFHdkIsU0FBS0csS0FBTCxHQUFhO0FBQ1RELE1BQUFBLGFBQWEsRUFBRUUsd0JBQWNDLFFBRHBCLENBQzhCOztBQUQ5QixLQUFiLENBSHVCLENBT3ZCOztBQUNBLFNBQUtOLEtBQUwsQ0FBV08sUUFBWCxDQUFvQkMsRUFBcEIsQ0FBdUJDLHdCQUF2QixFQUFxQyxLQUFLQyxnQkFBMUMsRUFSdUIsQ0FVdkI7QUFDQTtBQUNBOztBQUNBLFNBQUtWLEtBQUwsQ0FBV08sUUFBWCxDQUFvQkksT0FBcEI7QUFDSDs7QUFNTUMsRUFBQUEsTUFBUDtBQUFBO0FBQTJCO0FBQ3ZCLHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSCw2QkFBQyx3QkFBRDtBQUFpQixNQUFBLFFBQVEsRUFBRSxLQUFLWixLQUFMLENBQVdPLFFBQXRDO0FBQWdELE1BQUEsYUFBYSxFQUFFLEtBQUtILEtBQUwsQ0FBV0Q7QUFBMUUsTUFERyxlQUVILDZCQUFDLHNCQUFEO0FBQWUsTUFBQSxRQUFRLEVBQUUsS0FBS0gsS0FBTCxDQUFXTztBQUFwQyxNQUZHLGVBR0gsNkJBQUMseUJBQUQ7QUFBa0IsTUFBQSxRQUFRLEVBQUUsS0FBS1AsS0FBTCxDQUFXTztBQUF2QyxNQUhHLENBQVA7QUFLSDs7QUEzQjhFIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIxIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHtQbGF5YmFjaywgUGxheWJhY2tTdGF0ZX0gZnJvbSBcIi4uLy4uLy4uL3ZvaWNlL1BsYXliYWNrXCI7XG5pbXBvcnQgUmVhY3QsIHtSZWFjdE5vZGV9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHtVUERBVEVfRVZFTlR9IGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IFBsYXliYWNrV2F2ZWZvcm0gZnJvbSBcIi4vUGxheWJhY2tXYXZlZm9ybVwiO1xuaW1wb3J0IFBsYXlQYXVzZUJ1dHRvbiBmcm9tIFwiLi9QbGF5UGF1c2VCdXR0b25cIjtcbmltcG9ydCBQbGF5YmFja0Nsb2NrIGZyb20gXCIuL1BsYXliYWNrQ2xvY2tcIjtcblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgLy8gUGxheWJhY2sgaW5zdGFuY2UgdG8gcmVuZGVyLiBDYW5ub3QgY2hhbmdlIGR1cmluZyBjb21wb25lbnQgbGlmZWN5Y2xlOiBjcmVhdGVcbiAgICAvLyBhbiBhbGwtbmV3IGNvbXBvbmVudCBpbnN0ZWFkLlxuICAgIHBsYXliYWNrOiBQbGF5YmFjaztcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgcGxheWJhY2tQaGFzZTogUGxheWJhY2tTdGF0ZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjb3JkaW5nUGxheWJhY2sgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgY29uc3RydWN0b3IocHJvcHM6IElQcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHBsYXliYWNrUGhhc2U6IFBsYXliYWNrU3RhdGUuRGVjb2RpbmcsIC8vIGRlZmF1bHQgYXNzdW1wdGlvblxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZGUtcmVnaXN0ZXI6IHRoZSBjbGFzcyBoYW5kbGVzIHRoaXMgZm9yIHVzIGludGVybmFsbHlcbiAgICAgICAgdGhpcy5wcm9wcy5wbGF5YmFjay5vbihVUERBVEVfRVZFTlQsIHRoaXMub25QbGF5YmFja1VwZGF0ZSk7XG5cbiAgICAgICAgLy8gRG9uJ3Qgd2FpdCBmb3IgdGhlIHByb21pc2UgdG8gY29tcGxldGUgLSBpdCB3aWxsIGVtaXQgYSBwcm9ncmVzcyB1cGRhdGUgd2hlbiBpdFxuICAgICAgICAvLyBpcyBkb25lLCBhbmQgaXQncyBub3QgbWVhbnQgdG8gdGFrZSBsb25nIGFueWhvdy5cbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbFxuICAgICAgICB0aGlzLnByb3BzLnBsYXliYWNrLnByZXBhcmUoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGxheWJhY2tVcGRhdGUgPSAoZXY6IFBsYXliYWNrU3RhdGUpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7cGxheWJhY2tQaGFzZTogZXZ9KTtcbiAgICB9O1xuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9J214X1ZvaWNlTWVzc2FnZVByaW1hcnlDb250YWluZXInPlxuICAgICAgICAgICAgPFBsYXlQYXVzZUJ1dHRvbiBwbGF5YmFjaz17dGhpcy5wcm9wcy5wbGF5YmFja30gcGxheWJhY2tQaGFzZT17dGhpcy5zdGF0ZS5wbGF5YmFja1BoYXNlfSAvPlxuICAgICAgICAgICAgPFBsYXliYWNrQ2xvY2sgcGxheWJhY2s9e3RoaXMucHJvcHMucGxheWJhY2t9IC8+XG4gICAgICAgICAgICA8UGxheWJhY2tXYXZlZm9ybSBwbGF5YmFjaz17dGhpcy5wcm9wcy5wbGF5YmFja30gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgfVxufVxuIl19