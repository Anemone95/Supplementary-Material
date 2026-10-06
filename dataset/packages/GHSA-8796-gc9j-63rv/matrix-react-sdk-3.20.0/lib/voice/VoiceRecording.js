"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VoiceRecording = exports.RecordingState = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var Recorder = _interopRequireWildcard(require("opus-recorder"));

var _encoderWorkerMin = _interopRequireDefault(require("opus-recorder/dist/encoderWorker.min.js"));

var _CallMediaHandler = _interopRequireDefault(require("../CallMediaHandler"));

var _matrixWidgetApi = require("matrix-widget-api");

var _numbers = require("../utils/numbers");

var _events = _interopRequireDefault(require("events"));

var _Singleflight = require("../utils/Singleflight");

var _consts = require("./consts");

var _AsyncStore = require("../stores/AsyncStore");

var _Playback = require("./Playback");

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
const CHANNELS = 1; // stereo isn't important

const SAMPLE_RATE = 48000; // 48khz is what WebRTC uses. 12khz is where we lose quality.

const BITRATE = 24000; // 24kbps is pretty high quality for our use case in opus.

const TARGET_MAX_LENGTH = 120; // 2 minutes in seconds. Somewhat arbitrary, though longer == larger files.

const TARGET_WARN_TIME_LEFT = 10; // 10 seconds, also somewhat arbitrary.

/*:: export interface IRecordingUpdate {
    waveform: number[]; // floating points between 0 (low) and 1 (high).
    timeSeconds: number; // float
}*/

let RecordingState;
exports.RecordingState = RecordingState;

(function (RecordingState) {
  RecordingState["Started"] = "started";
  RecordingState["EndingSoon"] = "ending_soon";
  RecordingState["Ended"] = "ended";
  RecordingState["Uploading"] = "uploading";
  RecordingState["Uploaded"] = "uploaded";
})(RecordingState || (exports.RecordingState = RecordingState = {}));

class VoiceRecording extends _events.default
/*:: implements IDestroyable*/
{
  // use this.audioBuffer to access
  // at each second mark, generated
  constructor(client
  /*: MatrixClient*/
  ) {
    super();
    this.client
    /*:: */
    = client
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "recorder", void 0);
    (0, _defineProperty2.default)(this, "recorderContext", void 0);
    (0, _defineProperty2.default)(this, "recorderSource", void 0);
    (0, _defineProperty2.default)(this, "recorderStream", void 0);
    (0, _defineProperty2.default)(this, "recorderFFT", void 0);
    (0, _defineProperty2.default)(this, "recorderWorklet", void 0);
    (0, _defineProperty2.default)(this, "buffer", new Uint8Array(0));
    (0, _defineProperty2.default)(this, "mxc", void 0);
    (0, _defineProperty2.default)(this, "recording", false);
    (0, _defineProperty2.default)(this, "observable", void 0);
    (0, _defineProperty2.default)(this, "amplitudes", []);
    (0, _defineProperty2.default)(this, "playback", void 0);
    (0, _defineProperty2.default)(this, "processAudioUpdate", (timeSeconds
    /*: number*/
    ) => {
      if (!this.recording) return; // The time domain is the input to the FFT, which means we use an array of the same
      // size. The time domain is also known as the audio waveform. We're ignoring the
      // output of the FFT here (frequency data) because we're not interested in it.

      const data = new Float32Array(this.recorderFFT.fftSize);
      this.recorderFFT.getFloatTimeDomainData(data); // We can't just `Array.from()` the array because we're dealing with 32bit floats
      // and the built-in function won't consider that when converting between numbers.
      // However, the runtime will convert the float32 to a float64 during the math operations
      // which is why the loop works below. Note that a `.map()` call also doesn't work
      // and will instead return a Float32Array still.

      const translatedData
      /*: number[]*/
      = [];

      for (let i = 0; i < data.length; i++) {
        // We're clamping the values so we can do that math operation mentioned above,
        // and to ensure that we produce consistent data (it's possible for the array
        // to exceed the specified range with some audio input devices).
        translatedData.push((0, _numbers.clamp)(data[i], 0, 1));
      }

      this.observable.update({
        waveform: translatedData,
        timeSeconds: timeSeconds
      }); // Now that we've updated the data/waveform, let's do a time check. We don't want to
      // go horribly over the limit. We also emit a warning state if needed.
      //
      // We use the recorder's perspective of time to make sure we don't cut off the last
      // frame of audio, otherwise we end up with a 1:59 clip (119.68 seconds). This extra
      // safety can allow us to overshoot the target a bit, but at least when we say 2min
      // maximum we actually mean it.
      //
      // In testing, recorder time and worker time lag by about 400ms, which is roughly the
      // time needed to encode a sample/frame.
      //
      // Ref for recorderSeconds: https://github.com/chris-rudmin/opus-recorder#instance-fields

      const recorderSeconds = this.recorder.encodedSamplePosition / 48000;
      const secondsLeft = TARGET_MAX_LENGTH - recorderSeconds;

      if (secondsLeft < 0) {
        // go over to make sure we definitely capture that last frame
        // noinspection JSIgnoredPromiseFromCall - we aren't concerned with it overlapping
        this.stop();
      } else if (secondsLeft <= TARGET_WARN_TIME_LEFT) {
        _Singleflight.Singleflight.for(this, "ending_soon").do(() => {
          this.emit(RecordingState.EndingSoon, {
            secondsLeft
          });
          return _Singleflight.Singleflight.Void;
        });
      }
    });
  }

  get contentType()
  /*: string*/
  {
    return "audio/ogg";
  }

  get contentLength()
  /*: number*/
  {
    return this.buffer.length;
  }

  get durationSeconds()
  /*: number*/
  {
    if (!this.recorder) throw new Error("Duration not available without a recording");
    return this.recorderContext.currentTime;
  }

  get isRecording()
  /*: boolean*/
  {
    return this.recording;
  }

  emit(event
  /*: string*/
  , ...args)
  /*: boolean*/
  {
    super.emit(event, ...args);
    super.emit(_AsyncStore.UPDATE_EVENT, event, ...args);
    return true; // we don't ever care if the event had listeners, so just return "yes"
  }

  async makeRecorder() {
    this.recorderStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: CHANNELS,
        noiseSuppression: true,
        // browsers ignore constraints they can't honour
        deviceId: _CallMediaHandler.default.getAudioInput()
      }
    });
    this.recorderContext = new AudioContext({// latencyHint: "interactive", // we don't want a latency hint (this causes data smoothing)
    });
    this.recorderSource = this.recorderContext.createMediaStreamSource(this.recorderStream);
    this.recorderFFT = this.recorderContext.createAnalyser(); // Bring the FFT time domain down a bit. The default is 2048, and this must be a power
    // of two. We use 64 points because we happen to know down the line we need less than
    // that, but 32 would be too few. Large numbers are not helpful here and do not add
    // precision: they introduce higher precision outputs of the FFT (frequency data), but
    // it makes the time domain less than helpful.

    this.recorderFFT.fftSize = 64; // Set up our worklet. We use this for timing information and waveform analysis: the
    // web audio API prefers this be done async to avoid holding the main thread with math.

    const mxRecorderWorkletPath = document.body.dataset.vectorRecorderWorkletScript;

    if (!mxRecorderWorkletPath) {
      throw new Error("Unable to create recorder: no worklet script registered");
    }

    await this.recorderContext.audioWorklet.addModule(mxRecorderWorkletPath);
    this.recorderWorklet = new AudioWorkletNode(this.recorderContext, _consts.WORKLET_NAME); // Connect our inputs and outputs

    this.recorderSource.connect(this.recorderFFT);
    this.recorderSource.connect(this.recorderWorklet);
    this.recorderWorklet.connect(this.recorderContext.destination); // Dev note: we can't use `addEventListener` for some reason. It just doesn't work.

    this.recorderWorklet.port.onmessage = ev => {
      switch (ev.data['ev']) {
        case _consts.PayloadEvent.Timekeep:
          this.processAudioUpdate(ev.data['timeSeconds']);
          break;

        case _consts.PayloadEvent.AmplitudeMark:
          // Sanity check to make sure we're adding about one sample per second
          if (ev.data['forSecond'] === this.amplitudes.length) {
            this.amplitudes.push(ev.data['amplitude']);
          }

          break;
      }
    };

    this.recorder = new Recorder({
      encoderPath: _encoderWorkerMin.default,
      // magic from webpack
      encoderSampleRate: SAMPLE_RATE,
      encoderApplication: 2048,
      // voice (default is "audio")
      streamPages: true,
      // this speeds up the encoding process by using CPU over time
      encoderFrameSize: 20,
      // ms, arbitrary frame size we send to the encoder
      numberOfChannels: CHANNELS,
      sourceNode: this.recorderSource,
      encoderBitRate: BITRATE,
      // We use low values for the following to ease CPU usage - the resulting waveform
      // is indistinguishable for a voice message. Note that the underlying library will
      // pick defaults which prefer the highest possible quality, CPU be damned.
      encoderComplexity: 3,
      // 0-10, 10 is slow and high quality.
      resampleQuality: 3 // 0-10, 10 is slow and high quality

    });

    this.recorder.ondataavailable = (a
    /*: ArrayBuffer*/
    ) => {
      const buf = new Uint8Array(a);
      const newBuf = new Uint8Array(this.buffer.length + buf.length);
      newBuf.set(this.buffer, 0);
      newBuf.set(buf, this.buffer.length);
      this.buffer = newBuf;
    };
  }

  get audioBuffer()
  /*: Uint8Array*/
  {
    // We need a clone of the buffer to avoid accidentally changing the position
    // on the real thing.
    return this.buffer.slice(0);
  }

  get liveData()
  /*: SimpleObservable<IRecordingUpdate>*/
  {
    if (!this.recording) throw new Error("No observable when not recording");
    return this.observable;
  }

  get isSupported()
  /*: boolean*/
  {
    return !!Recorder.isRecordingSupported();
  }

  get hasRecording()
  /*: boolean*/
  {
    return this.buffer.length > 0;
  }

  get mxcUri()
  /*: string*/
  {
    if (!this.mxc) {
      throw new Error("Recording has not been uploaded yet");
    }

    return this.mxc;
  }

  async start()
  /*: Promise<void>*/
  {
    if (this.mxc || this.hasRecording) {
      throw new Error("Recording already prepared");
    }

    if (this.recording) {
      throw new Error("Recording already in progress");
    }

    if (this.observable) {
      this.observable.close();
    }

    this.observable = new _matrixWidgetApi.SimpleObservable();
    await this.makeRecorder();
    await this.recorder.start();
    this.recording = true;
    this.emit(RecordingState.Started);
  }

  async stop()
  /*: Promise<Uint8Array>*/
  {
    return _Singleflight.Singleflight.for(this, "stop").do(async () => {
      if (!this.recording) {
        throw new Error("No recording to stop");
      } // Disconnect the source early to start shutting down resources


      await this.recorder.stop(); // stop first to flush the last frame

      this.recorderSource.disconnect();
      this.recorderWorklet.disconnect(); // close the context after the recorder so the recorder doesn't try to
      // connect anything to the context (this would generate a warning)

      await this.recorderContext.close(); // Now stop all the media tracks so we can release them back to the user/OS

      this.recorderStream.getTracks().forEach(t => t.stop()); // Finally do our post-processing and clean up

      this.recording = false;
      await this.recorder.close();
      this.emit(RecordingState.Ended);
      return this.audioBuffer;
    });
  }
  /**
   * Gets a playback instance for this voice recording. Note that the playback will not
   * have been prepared fully, meaning the `prepare()` function needs to be called on it.
   *
   * The same playback instance is returned each time.
   *
   * @returns {Playback} The playback instance.
   */


  getPlayback()
  /*: Playback*/
  {
    this.playback = _Singleflight.Singleflight.for(this, "playback").do(() => {
      return new _Playback.Playback(this.audioBuffer.buffer, this.amplitudes); // cast to ArrayBuffer proper;
    });
    return this.playback;
  }

  destroy() {
    // noinspection JSIgnoredPromiseFromCall - not concerned about stop() being called async here
    this.stop();
    this.removeAllListeners();

    _Singleflight.Singleflight.forgetAllFor(this); // noinspection JSIgnoredPromiseFromCall - not concerned about being called async here


    this.playback?.destroy();
    this.observable.close();
  }

  async upload()
  /*: Promise<string>*/
  {
    if (!this.hasRecording) {
      throw new Error("No recording available to upload");
    }

    if (this.mxc) return this.mxc;
    this.emit(RecordingState.Uploading);
    this.mxc = await this.client.uploadContent(new Blob([this.audioBuffer], {
      type: this.contentType
    }), {
      onlyContentUri: false // to stop the warnings in the console

    }).then(r => r['content_uri']);
    this.emit(RecordingState.Uploaded);
    return this.mxc;
  }

}

exports.VoiceRecording = VoiceRecording;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92b2ljZS9Wb2ljZVJlY29yZGluZy50cyJdLCJuYW1lcyI6WyJDSEFOTkVMUyIsIlNBTVBMRV9SQVRFIiwiQklUUkFURSIsIlRBUkdFVF9NQVhfTEVOR1RIIiwiVEFSR0VUX1dBUk5fVElNRV9MRUZUIiwiUmVjb3JkaW5nU3RhdGUiLCJWb2ljZVJlY29yZGluZyIsIkV2ZW50RW1pdHRlciIsImNvbnN0cnVjdG9yIiwiY2xpZW50IiwiVWludDhBcnJheSIsInRpbWVTZWNvbmRzIiwicmVjb3JkaW5nIiwiZGF0YSIsIkZsb2F0MzJBcnJheSIsInJlY29yZGVyRkZUIiwiZmZ0U2l6ZSIsImdldEZsb2F0VGltZURvbWFpbkRhdGEiLCJ0cmFuc2xhdGVkRGF0YSIsImkiLCJsZW5ndGgiLCJwdXNoIiwib2JzZXJ2YWJsZSIsInVwZGF0ZSIsIndhdmVmb3JtIiwicmVjb3JkZXJTZWNvbmRzIiwicmVjb3JkZXIiLCJlbmNvZGVkU2FtcGxlUG9zaXRpb24iLCJzZWNvbmRzTGVmdCIsInN0b3AiLCJTaW5nbGVmbGlnaHQiLCJmb3IiLCJkbyIsImVtaXQiLCJFbmRpbmdTb29uIiwiVm9pZCIsImNvbnRlbnRUeXBlIiwiY29udGVudExlbmd0aCIsImJ1ZmZlciIsImR1cmF0aW9uU2Vjb25kcyIsIkVycm9yIiwicmVjb3JkZXJDb250ZXh0IiwiY3VycmVudFRpbWUiLCJpc1JlY29yZGluZyIsImV2ZW50IiwiYXJncyIsIlVQREFURV9FVkVOVCIsIm1ha2VSZWNvcmRlciIsInJlY29yZGVyU3RyZWFtIiwibmF2aWdhdG9yIiwibWVkaWFEZXZpY2VzIiwiZ2V0VXNlck1lZGlhIiwiYXVkaW8iLCJjaGFubmVsQ291bnQiLCJub2lzZVN1cHByZXNzaW9uIiwiZGV2aWNlSWQiLCJDYWxsTWVkaWFIYW5kbGVyIiwiZ2V0QXVkaW9JbnB1dCIsIkF1ZGlvQ29udGV4dCIsInJlY29yZGVyU291cmNlIiwiY3JlYXRlTWVkaWFTdHJlYW1Tb3VyY2UiLCJjcmVhdGVBbmFseXNlciIsIm14UmVjb3JkZXJXb3JrbGV0UGF0aCIsImRvY3VtZW50IiwiYm9keSIsImRhdGFzZXQiLCJ2ZWN0b3JSZWNvcmRlcldvcmtsZXRTY3JpcHQiLCJhdWRpb1dvcmtsZXQiLCJhZGRNb2R1bGUiLCJyZWNvcmRlcldvcmtsZXQiLCJBdWRpb1dvcmtsZXROb2RlIiwiV09SS0xFVF9OQU1FIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwicG9ydCIsIm9ubWVzc2FnZSIsImV2IiwiUGF5bG9hZEV2ZW50IiwiVGltZWtlZXAiLCJwcm9jZXNzQXVkaW9VcGRhdGUiLCJBbXBsaXR1ZGVNYXJrIiwiYW1wbGl0dWRlcyIsIlJlY29yZGVyIiwiZW5jb2RlclBhdGgiLCJlbmNvZGVyU2FtcGxlUmF0ZSIsImVuY29kZXJBcHBsaWNhdGlvbiIsInN0cmVhbVBhZ2VzIiwiZW5jb2RlckZyYW1lU2l6ZSIsIm51bWJlck9mQ2hhbm5lbHMiLCJzb3VyY2VOb2RlIiwiZW5jb2RlckJpdFJhdGUiLCJlbmNvZGVyQ29tcGxleGl0eSIsInJlc2FtcGxlUXVhbGl0eSIsIm9uZGF0YWF2YWlsYWJsZSIsImEiLCJidWYiLCJuZXdCdWYiLCJzZXQiLCJhdWRpb0J1ZmZlciIsInNsaWNlIiwibGl2ZURhdGEiLCJpc1N1cHBvcnRlZCIsImlzUmVjb3JkaW5nU3VwcG9ydGVkIiwiaGFzUmVjb3JkaW5nIiwibXhjVXJpIiwibXhjIiwic3RhcnQiLCJjbG9zZSIsIlNpbXBsZU9ic2VydmFibGUiLCJTdGFydGVkIiwiZGlzY29ubmVjdCIsImdldFRyYWNrcyIsImZvckVhY2giLCJ0IiwiRW5kZWQiLCJnZXRQbGF5YmFjayIsInBsYXliYWNrIiwiUGxheWJhY2siLCJkZXN0cm95IiwicmVtb3ZlQWxsTGlzdGVuZXJzIiwiZm9yZ2V0QWxsRm9yIiwidXBsb2FkIiwiVXBsb2FkaW5nIiwidXBsb2FkQ29udGVudCIsIkJsb2IiLCJ0eXBlIiwib25seUNvbnRlbnRVcmkiLCJ0aGVuIiwiciIsIlVwbG9hZGVkIl0sIm1hcHBpbmdzIjoiOzs7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QUFLbUMsUUFBWjtBQUNIOztBQUVNRSxFQUFBQSxPQUFQLEdBQWlCO0FBQ2I7QUFDQSxTQUFLekYsSUFBTDtBQUNBLFNBQUswRixrQkFBTDs7QUFDQXpGLCtCQUFhMEYsWUFBYixDQUEwQixJQUExQixFQUphLENBS2I7OztBQUNBLFNBQUtKLFFBQUwsRUFBZUUsT0FBZjtBQUNBLFNBQUtoRyxVQUFMLENBQWdCcUYsS0FBaEI7QUFDSDs7QUFFRCxRQUFhYyxNQUFiO0FBQUE7QUFBdUM7QUFDbkMsUUFBSSxDQUFDLEtBQUtsQixZQUFWLEVBQXdCO0FBQ3BCLFlBQU0sSUFBSS9ELEtBQUosQ0FBVSxrQ0FBVixDQUFOO0FBQ0g7O0FBRUQsUUFBSSxLQUFLaUUsR0FBVCxFQUFjLE9BQU8sS0FBS0EsR0FBWjtBQUVkLFNBQUt4RSxJQUFMLENBQVU1QixjQUFjLENBQUNxSCxTQUF6QjtBQUNBLFNBQUtqQixHQUFMLEdBQVcsTUFBTSxLQUFLaEcsTUFBTCxDQUFZa0gsYUFBWixDQUEwQixJQUFJQyxJQUFKLENBQVMsQ0FBQyxLQUFLMUIsV0FBTixDQUFULEVBQTZCO0FBQ3BFMkIsTUFBQUEsSUFBSSxFQUFFLEtBQUt6RjtBQUR5RCxLQUE3QixDQUExQixFQUViO0FBQ0EwRixNQUFBQSxjQUFjLEVBQUUsS0FEaEIsQ0FDdUI7O0FBRHZCLEtBRmEsRUFJZEMsSUFKYyxDQUlUQyxDQUFDLElBQUlBLENBQUMsQ0FBQyxhQUFELENBSkcsQ0FBakI7QUFLQSxTQUFLL0YsSUFBTCxDQUFVNUIsY0FBYyxDQUFDNEgsUUFBekI7QUFDQSxXQUFPLEtBQUt4QixHQUFaO0FBQ0g7O0FBdFJvRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCAqIGFzIFJlY29yZGVyIGZyb20gJ29wdXMtcmVjb3JkZXInO1xuaW1wb3J0IGVuY29kZXJQYXRoIGZyb20gJ29wdXMtcmVjb3JkZXIvZGlzdC9lbmNvZGVyV29ya2VyLm1pbi5qcyc7XG5pbXBvcnQge01hdHJpeENsaWVudH0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL2NsaWVudFwiO1xuaW1wb3J0IENhbGxNZWRpYUhhbmRsZXIgZnJvbSBcIi4uL0NhbGxNZWRpYUhhbmRsZXJcIjtcbmltcG9ydCB7U2ltcGxlT2JzZXJ2YWJsZX0gZnJvbSBcIm1hdHJpeC13aWRnZXQtYXBpXCI7XG5pbXBvcnQge2NsYW1wfSBmcm9tIFwiLi4vdXRpbHMvbnVtYmVyc1wiO1xuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQge0lEZXN0cm95YWJsZX0gZnJvbSBcIi4uL3V0aWxzL0lEZXN0cm95YWJsZVwiO1xuaW1wb3J0IHtTaW5nbGVmbGlnaHR9IGZyb20gXCIuLi91dGlscy9TaW5nbGVmbGlnaHRcIjtcbmltcG9ydCB7UGF5bG9hZEV2ZW50LCBXT1JLTEVUX05BTUV9IGZyb20gXCIuL2NvbnN0c1wiO1xuaW1wb3J0IHtVUERBVEVfRVZFTlR9IGZyb20gXCIuLi9zdG9yZXMvQXN5bmNTdG9yZVwiO1xuaW1wb3J0IHtQbGF5YmFja30gZnJvbSBcIi4vUGxheWJhY2tcIjtcblxuY29uc3QgQ0hBTk5FTFMgPSAxOyAvLyBzdGVyZW8gaXNuJ3QgaW1wb3J0YW50XG5jb25zdCBTQU1QTEVfUkFURSA9IDQ4MDAwOyAvLyA0OGtoeiBpcyB3aGF0IFdlYlJUQyB1c2VzLiAxMmtoeiBpcyB3aGVyZSB3ZSBsb3NlIHF1YWxpdHkuXG5jb25zdCBCSVRSQVRFID0gMjQwMDA7IC8vIDI0a2JwcyBpcyBwcmV0dHkgaGlnaCBxdWFsaXR5IGZvciBvdXIgdXNlIGNhc2UgaW4gb3B1cy5cbmNvbnN0IFRBUkdFVF9NQVhfTEVOR1RIID0gMTIwOyAvLyAyIG1pbnV0ZXMgaW4gc2Vjb25kcy4gU29tZXdoYXQgYXJiaXRyYXJ5LCB0aG91Z2ggbG9uZ2VyID09IGxhcmdlciBmaWxlcy5cbmNvbnN0IFRBUkdFVF9XQVJOX1RJTUVfTEVGVCA9IDEwOyAvLyAxMCBzZWNvbmRzLCBhbHNvIHNvbWV3aGF0IGFyYml0cmFyeS5cblxuZXhwb3J0IGludGVyZmFjZSBJUmVjb3JkaW5nVXBkYXRlIHtcbiAgICB3YXZlZm9ybTogbnVtYmVyW107IC8vIGZsb2F0aW5nIHBvaW50cyBiZXR3ZWVuIDAgKGxvdykgYW5kIDEgKGhpZ2gpLlxuICAgIHRpbWVTZWNvbmRzOiBudW1iZXI7IC8vIGZsb2F0XG59XG5cbmV4cG9ydCBlbnVtIFJlY29yZGluZ1N0YXRlIHtcbiAgICBTdGFydGVkID0gXCJzdGFydGVkXCIsXG4gICAgRW5kaW5nU29vbiA9IFwiZW5kaW5nX3Nvb25cIiwgLy8gZW1pdHMgYW4gb2JqZWN0IHdpdGggYSBzaW5nbGUgbnVtZXJpY2FsIHZhbHVlOiBzZWNvbmRzTGVmdFxuICAgIEVuZGVkID0gXCJlbmRlZFwiLFxuICAgIFVwbG9hZGluZyA9IFwidXBsb2FkaW5nXCIsXG4gICAgVXBsb2FkZWQgPSBcInVwbG9hZGVkXCIsXG59XG5cbmV4cG9ydCBjbGFzcyBWb2ljZVJlY29yZGluZyBleHRlbmRzIEV2ZW50RW1pdHRlciBpbXBsZW1lbnRzIElEZXN0cm95YWJsZSB7XG4gICAgcHJpdmF0ZSByZWNvcmRlcjogUmVjb3JkZXI7XG4gICAgcHJpdmF0ZSByZWNvcmRlckNvbnRleHQ6IEF1ZGlvQ29udGV4dDtcbiAgICBwcml2YXRlIHJlY29yZGVyU291cmNlOiBNZWRpYVN0cmVhbUF1ZGlvU291cmNlTm9kZTtcbiAgICBwcml2YXRlIHJlY29yZGVyU3RyZWFtOiBNZWRpYVN0cmVhbTtcbiAgICBwcml2YXRlIHJlY29yZGVyRkZUOiBBbmFseXNlck5vZGU7XG4gICAgcHJpdmF0ZSByZWNvcmRlcldvcmtsZXQ6IEF1ZGlvV29ya2xldE5vZGU7XG4gICAgcHJpdmF0ZSBidWZmZXIgPSBuZXcgVWludDhBcnJheSgwKTsgLy8gdXNlIHRoaXMuYXVkaW9CdWZmZXIgdG8gYWNjZXNzXG4gICAgcHJpdmF0ZSBteGM6IHN0cmluZztcbiAgICBwcml2YXRlIHJlY29yZGluZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgb2JzZXJ2YWJsZTogU2ltcGxlT2JzZXJ2YWJsZTxJUmVjb3JkaW5nVXBkYXRlPjtcbiAgICBwcml2YXRlIGFtcGxpdHVkZXM6IG51bWJlcltdID0gW107IC8vIGF0IGVhY2ggc2Vjb25kIG1hcmssIGdlbmVyYXRlZFxuICAgIHByaXZhdGUgcGxheWJhY2s6IFBsYXliYWNrO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY2xpZW50OiBNYXRyaXhDbGllbnQpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNvbnRlbnRUeXBlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiBcImF1ZGlvL29nZ1wiO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgY29udGVudExlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXIubGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZHVyYXRpb25TZWNvbmRzKCk6IG51bWJlciB7XG4gICAgICAgIGlmICghdGhpcy5yZWNvcmRlcikgdGhyb3cgbmV3IEVycm9yKFwiRHVyYXRpb24gbm90IGF2YWlsYWJsZSB3aXRob3V0IGEgcmVjb3JkaW5nXCIpO1xuICAgICAgICByZXR1cm4gdGhpcy5yZWNvcmRlckNvbnRleHQuY3VycmVudFRpbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpc1JlY29yZGluZygpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVjb3JkaW5nO1xuICAgIH1cblxuICAgIHB1YmxpYyBlbWl0KGV2ZW50OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKTogYm9vbGVhbiB7XG4gICAgICAgIHN1cGVyLmVtaXQoZXZlbnQsIC4uLmFyZ3MpO1xuICAgICAgICBzdXBlci5lbWl0KFVQREFURV9FVkVOVCwgZXZlbnQsIC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gd2UgZG9uJ3QgZXZlciBjYXJlIGlmIHRoZSBldmVudCBoYWQgbGlzdGVuZXJzLCBzbyBqdXN0IHJldHVybiBcInllc1wiXG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBtYWtlUmVjb3JkZXIoKSB7XG4gICAgICAgIHRoaXMucmVjb3JkZXJTdHJlYW0gPSBhd2FpdCBuYXZpZ2F0b3IubWVkaWFEZXZpY2VzLmdldFVzZXJNZWRpYSh7XG4gICAgICAgICAgICBhdWRpbzoge1xuICAgICAgICAgICAgICAgIGNoYW5uZWxDb3VudDogQ0hBTk5FTFMsXG4gICAgICAgICAgICAgICAgbm9pc2VTdXBwcmVzc2lvbjogdHJ1ZSwgLy8gYnJvd3NlcnMgaWdub3JlIGNvbnN0cmFpbnRzIHRoZXkgY2FuJ3QgaG9ub3VyXG4gICAgICAgICAgICAgICAgZGV2aWNlSWQ6IENhbGxNZWRpYUhhbmRsZXIuZ2V0QXVkaW9JbnB1dCgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVjb3JkZXJDb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCh7XG4gICAgICAgICAgICAvLyBsYXRlbmN5SGludDogXCJpbnRlcmFjdGl2ZVwiLCAvLyB3ZSBkb24ndCB3YW50IGEgbGF0ZW5jeSBoaW50ICh0aGlzIGNhdXNlcyBkYXRhIHNtb290aGluZylcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucmVjb3JkZXJTb3VyY2UgPSB0aGlzLnJlY29yZGVyQ29udGV4dC5jcmVhdGVNZWRpYVN0cmVhbVNvdXJjZSh0aGlzLnJlY29yZGVyU3RyZWFtKTtcbiAgICAgICAgdGhpcy5yZWNvcmRlckZGVCA9IHRoaXMucmVjb3JkZXJDb250ZXh0LmNyZWF0ZUFuYWx5c2VyKCk7XG5cbiAgICAgICAgLy8gQnJpbmcgdGhlIEZGVCB0aW1lIGRvbWFpbiBkb3duIGEgYml0LiBUaGUgZGVmYXVsdCBpcyAyMDQ4LCBhbmQgdGhpcyBtdXN0IGJlIGEgcG93ZXJcbiAgICAgICAgLy8gb2YgdHdvLiBXZSB1c2UgNjQgcG9pbnRzIGJlY2F1c2Ugd2UgaGFwcGVuIHRvIGtub3cgZG93biB0aGUgbGluZSB3ZSBuZWVkIGxlc3MgdGhhblxuICAgICAgICAvLyB0aGF0LCBidXQgMzIgd291bGQgYmUgdG9vIGZldy4gTGFyZ2UgbnVtYmVycyBhcmUgbm90IGhlbHBmdWwgaGVyZSBhbmQgZG8gbm90IGFkZFxuICAgICAgICAvLyBwcmVjaXNpb246IHRoZXkgaW50cm9kdWNlIGhpZ2hlciBwcmVjaXNpb24gb3V0cHV0cyBvZiB0aGUgRkZUIChmcmVxdWVuY3kgZGF0YSksIGJ1dFxuICAgICAgICAvLyBpdCBtYWtlcyB0aGUgdGltZSBkb21haW4gbGVzcyB0aGFuIGhlbHBmdWwuXG4gICAgICAgIHRoaXMucmVjb3JkZXJGRlQuZmZ0U2l6ZSA9IDY0O1xuXG4gICAgICAgIC8vIFNldCB1cCBvdXIgd29ya2xldC4gV2UgdXNlIHRoaXMgZm9yIHRpbWluZyBpbmZvcm1hdGlvbiBhbmQgd2F2ZWZvcm0gYW5hbHlzaXM6IHRoZVxuICAgICAgICAvLyB3ZWIgYXVkaW8gQVBJIHByZWZlcnMgdGhpcyBiZSBkb25lIGFzeW5jIHRvIGF2b2lkIGhvbGRpbmcgdGhlIG1haW4gdGhyZWFkIHdpdGggbWF0aC5cbiAgICAgICAgY29uc3QgbXhSZWNvcmRlcldvcmtsZXRQYXRoID0gZG9jdW1lbnQuYm9keS5kYXRhc2V0LnZlY3RvclJlY29yZGVyV29ya2xldFNjcmlwdDtcbiAgICAgICAgaWYgKCFteFJlY29yZGVyV29ya2xldFBhdGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVuYWJsZSB0byBjcmVhdGUgcmVjb3JkZXI6IG5vIHdvcmtsZXQgc2NyaXB0IHJlZ2lzdGVyZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlckNvbnRleHQuYXVkaW9Xb3JrbGV0LmFkZE1vZHVsZShteFJlY29yZGVyV29ya2xldFBhdGgpO1xuICAgICAgICB0aGlzLnJlY29yZGVyV29ya2xldCA9IG5ldyBBdWRpb1dvcmtsZXROb2RlKHRoaXMucmVjb3JkZXJDb250ZXh0LCBXT1JLTEVUX05BTUUpO1xuXG4gICAgICAgIC8vIENvbm5lY3Qgb3VyIGlucHV0cyBhbmQgb3V0cHV0c1xuICAgICAgICB0aGlzLnJlY29yZGVyU291cmNlLmNvbm5lY3QodGhpcy5yZWNvcmRlckZGVCk7XG4gICAgICAgIHRoaXMucmVjb3JkZXJTb3VyY2UuY29ubmVjdCh0aGlzLnJlY29yZGVyV29ya2xldCk7XG4gICAgICAgIHRoaXMucmVjb3JkZXJXb3JrbGV0LmNvbm5lY3QodGhpcy5yZWNvcmRlckNvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgICAgIC8vIERldiBub3RlOiB3ZSBjYW4ndCB1c2UgYGFkZEV2ZW50TGlzdGVuZXJgIGZvciBzb21lIHJlYXNvbi4gSXQganVzdCBkb2Vzbid0IHdvcmsuXG4gICAgICAgIHRoaXMucmVjb3JkZXJXb3JrbGV0LnBvcnQub25tZXNzYWdlID0gKGV2KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2LmRhdGFbJ2V2J10pIHtcbiAgICAgICAgICAgICAgICBjYXNlIFBheWxvYWRFdmVudC5UaW1la2VlcDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9jZXNzQXVkaW9VcGRhdGUoZXYuZGF0YVsndGltZVNlY29uZHMnXSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF5bG9hZEV2ZW50LkFtcGxpdHVkZU1hcms6XG4gICAgICAgICAgICAgICAgICAgIC8vIFNhbml0eSBjaGVjayB0byBtYWtlIHN1cmUgd2UncmUgYWRkaW5nIGFib3V0IG9uZSBzYW1wbGUgcGVyIHNlY29uZFxuICAgICAgICAgICAgICAgICAgICBpZiAoZXYuZGF0YVsnZm9yU2Vjb25kJ10gPT09IHRoaXMuYW1wbGl0dWRlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW1wbGl0dWRlcy5wdXNoKGV2LmRhdGFbJ2FtcGxpdHVkZSddKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlY29yZGVyID0gbmV3IFJlY29yZGVyKHtcbiAgICAgICAgICAgIGVuY29kZXJQYXRoLCAvLyBtYWdpYyBmcm9tIHdlYnBhY2tcbiAgICAgICAgICAgIGVuY29kZXJTYW1wbGVSYXRlOiBTQU1QTEVfUkFURSxcbiAgICAgICAgICAgIGVuY29kZXJBcHBsaWNhdGlvbjogMjA0OCwgLy8gdm9pY2UgKGRlZmF1bHQgaXMgXCJhdWRpb1wiKVxuICAgICAgICAgICAgc3RyZWFtUGFnZXM6IHRydWUsIC8vIHRoaXMgc3BlZWRzIHVwIHRoZSBlbmNvZGluZyBwcm9jZXNzIGJ5IHVzaW5nIENQVSBvdmVyIHRpbWVcbiAgICAgICAgICAgIGVuY29kZXJGcmFtZVNpemU6IDIwLCAvLyBtcywgYXJiaXRyYXJ5IGZyYW1lIHNpemUgd2Ugc2VuZCB0byB0aGUgZW5jb2RlclxuICAgICAgICAgICAgbnVtYmVyT2ZDaGFubmVsczogQ0hBTk5FTFMsXG4gICAgICAgICAgICBzb3VyY2VOb2RlOiB0aGlzLnJlY29yZGVyU291cmNlLFxuICAgICAgICAgICAgZW5jb2RlckJpdFJhdGU6IEJJVFJBVEUsXG5cbiAgICAgICAgICAgIC8vIFdlIHVzZSBsb3cgdmFsdWVzIGZvciB0aGUgZm9sbG93aW5nIHRvIGVhc2UgQ1BVIHVzYWdlIC0gdGhlIHJlc3VsdGluZyB3YXZlZm9ybVxuICAgICAgICAgICAgLy8gaXMgaW5kaXN0aW5ndWlzaGFibGUgZm9yIGEgdm9pY2UgbWVzc2FnZS4gTm90ZSB0aGF0IHRoZSB1bmRlcmx5aW5nIGxpYnJhcnkgd2lsbFxuICAgICAgICAgICAgLy8gcGljayBkZWZhdWx0cyB3aGljaCBwcmVmZXIgdGhlIGhpZ2hlc3QgcG9zc2libGUgcXVhbGl0eSwgQ1BVIGJlIGRhbW5lZC5cbiAgICAgICAgICAgIGVuY29kZXJDb21wbGV4aXR5OiAzLCAvLyAwLTEwLCAxMCBpcyBzbG93IGFuZCBoaWdoIHF1YWxpdHkuXG4gICAgICAgICAgICByZXNhbXBsZVF1YWxpdHk6IDMsIC8vIDAtMTAsIDEwIGlzIHNsb3cgYW5kIGhpZ2ggcXVhbGl0eVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWNvcmRlci5vbmRhdGFhdmFpbGFibGUgPSAoYTogQXJyYXlCdWZmZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZiA9IG5ldyBVaW50OEFycmF5KGEpO1xuICAgICAgICAgICAgY29uc3QgbmV3QnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5idWZmZXIubGVuZ3RoICsgYnVmLmxlbmd0aCk7XG4gICAgICAgICAgICBuZXdCdWYuc2V0KHRoaXMuYnVmZmVyLCAwKTtcbiAgICAgICAgICAgIG5ld0J1Zi5zZXQoYnVmLCB0aGlzLmJ1ZmZlci5sZW5ndGgpO1xuICAgICAgICAgICAgdGhpcy5idWZmZXIgPSBuZXdCdWY7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXQgYXVkaW9CdWZmZXIoKTogVWludDhBcnJheSB7XG4gICAgICAgIC8vIFdlIG5lZWQgYSBjbG9uZSBvZiB0aGUgYnVmZmVyIHRvIGF2b2lkIGFjY2lkZW50YWxseSBjaGFuZ2luZyB0aGUgcG9zaXRpb25cbiAgICAgICAgLy8gb24gdGhlIHJlYWwgdGhpbmcuXG4gICAgICAgIHJldHVybiB0aGlzLmJ1ZmZlci5zbGljZSgwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGxpdmVEYXRhKCk6IFNpbXBsZU9ic2VydmFibGU8SVJlY29yZGluZ1VwZGF0ZT4ge1xuICAgICAgICBpZiAoIXRoaXMucmVjb3JkaW5nKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBvYnNlcnZhYmxlIHdoZW4gbm90IHJlY29yZGluZ1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzU3VwcG9ydGVkKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gISFSZWNvcmRlci5pc1JlY29yZGluZ1N1cHBvcnRlZCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaGFzUmVjb3JkaW5nKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5idWZmZXIubGVuZ3RoID4gMDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG14Y1VyaSgpOiBzdHJpbmcge1xuICAgICAgICBpZiAoIXRoaXMubXhjKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZWNvcmRpbmcgaGFzIG5vdCBiZWVuIHVwbG9hZGVkIHlldFwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5teGM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBwcm9jZXNzQXVkaW9VcGRhdGUgPSAodGltZVNlY29uZHM6IG51bWJlcikgPT4ge1xuICAgICAgICBpZiAoIXRoaXMucmVjb3JkaW5nKSByZXR1cm47XG5cbiAgICAgICAgLy8gVGhlIHRpbWUgZG9tYWluIGlzIHRoZSBpbnB1dCB0byB0aGUgRkZULCB3aGljaCBtZWFucyB3ZSB1c2UgYW4gYXJyYXkgb2YgdGhlIHNhbWVcbiAgICAgICAgLy8gc2l6ZS4gVGhlIHRpbWUgZG9tYWluIGlzIGFsc28ga25vd24gYXMgdGhlIGF1ZGlvIHdhdmVmb3JtLiBXZSdyZSBpZ25vcmluZyB0aGVcbiAgICAgICAgLy8gb3V0cHV0IG9mIHRoZSBGRlQgaGVyZSAoZnJlcXVlbmN5IGRhdGEpIGJlY2F1c2Ugd2UncmUgbm90IGludGVyZXN0ZWQgaW4gaXQuXG4gICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucmVjb3JkZXJGRlQuZmZ0U2l6ZSk7XG4gICAgICAgIHRoaXMucmVjb3JkZXJGRlQuZ2V0RmxvYXRUaW1lRG9tYWluRGF0YShkYXRhKTtcblxuICAgICAgICAvLyBXZSBjYW4ndCBqdXN0IGBBcnJheS5mcm9tKClgIHRoZSBhcnJheSBiZWNhdXNlIHdlJ3JlIGRlYWxpbmcgd2l0aCAzMmJpdCBmbG9hdHNcbiAgICAgICAgLy8gYW5kIHRoZSBidWlsdC1pbiBmdW5jdGlvbiB3b24ndCBjb25zaWRlciB0aGF0IHdoZW4gY29udmVydGluZyBiZXR3ZWVuIG51bWJlcnMuXG4gICAgICAgIC8vIEhvd2V2ZXIsIHRoZSBydW50aW1lIHdpbGwgY29udmVydCB0aGUgZmxvYXQzMiB0byBhIGZsb2F0NjQgZHVyaW5nIHRoZSBtYXRoIG9wZXJhdGlvbnNcbiAgICAgICAgLy8gd2hpY2ggaXMgd2h5IHRoZSBsb29wIHdvcmtzIGJlbG93LiBOb3RlIHRoYXQgYSBgLm1hcCgpYCBjYWxsIGFsc28gZG9lc24ndCB3b3JrXG4gICAgICAgIC8vIGFuZCB3aWxsIGluc3RlYWQgcmV0dXJuIGEgRmxvYXQzMkFycmF5IHN0aWxsLlxuICAgICAgICBjb25zdCB0cmFuc2xhdGVkRGF0YTogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyBXZSdyZSBjbGFtcGluZyB0aGUgdmFsdWVzIHNvIHdlIGNhbiBkbyB0aGF0IG1hdGggb3BlcmF0aW9uIG1lbnRpb25lZCBhYm92ZSxcbiAgICAgICAgICAgIC8vIGFuZCB0byBlbnN1cmUgdGhhdCB3ZSBwcm9kdWNlIGNvbnNpc3RlbnQgZGF0YSAoaXQncyBwb3NzaWJsZSBmb3IgdGhlIGFycmF5XG4gICAgICAgICAgICAvLyB0byBleGNlZWQgdGhlIHNwZWNpZmllZCByYW5nZSB3aXRoIHNvbWUgYXVkaW8gaW5wdXQgZGV2aWNlcykuXG4gICAgICAgICAgICB0cmFuc2xhdGVkRGF0YS5wdXNoKGNsYW1wKGRhdGFbaV0sIDAsIDEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZS51cGRhdGUoe1xuICAgICAgICAgICAgd2F2ZWZvcm06IHRyYW5zbGF0ZWREYXRhLFxuICAgICAgICAgICAgdGltZVNlY29uZHM6IHRpbWVTZWNvbmRzLFxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgdGhhdCB3ZSd2ZSB1cGRhdGVkIHRoZSBkYXRhL3dhdmVmb3JtLCBsZXQncyBkbyBhIHRpbWUgY2hlY2suIFdlIGRvbid0IHdhbnQgdG9cbiAgICAgICAgLy8gZ28gaG9ycmlibHkgb3ZlciB0aGUgbGltaXQuIFdlIGFsc28gZW1pdCBhIHdhcm5pbmcgc3RhdGUgaWYgbmVlZGVkLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB1c2UgdGhlIHJlY29yZGVyJ3MgcGVyc3BlY3RpdmUgb2YgdGltZSB0byBtYWtlIHN1cmUgd2UgZG9uJ3QgY3V0IG9mZiB0aGUgbGFzdFxuICAgICAgICAvLyBmcmFtZSBvZiBhdWRpbywgb3RoZXJ3aXNlIHdlIGVuZCB1cCB3aXRoIGEgMTo1OSBjbGlwICgxMTkuNjggc2Vjb25kcykuIFRoaXMgZXh0cmFcbiAgICAgICAgLy8gc2FmZXR5IGNhbiBhbGxvdyB1cyB0byBvdmVyc2hvb3QgdGhlIHRhcmdldCBhIGJpdCwgYnV0IGF0IGxlYXN0IHdoZW4gd2Ugc2F5IDJtaW5cbiAgICAgICAgLy8gbWF4aW11bSB3ZSBhY3R1YWxseSBtZWFuIGl0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBJbiB0ZXN0aW5nLCByZWNvcmRlciB0aW1lIGFuZCB3b3JrZXIgdGltZSBsYWcgYnkgYWJvdXQgNDAwbXMsIHdoaWNoIGlzIHJvdWdobHkgdGhlXG4gICAgICAgIC8vIHRpbWUgbmVlZGVkIHRvIGVuY29kZSBhIHNhbXBsZS9mcmFtZS5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gUmVmIGZvciByZWNvcmRlclNlY29uZHM6IGh0dHBzOi8vZ2l0aHViLmNvbS9jaHJpcy1ydWRtaW4vb3B1cy1yZWNvcmRlciNpbnN0YW5jZS1maWVsZHNcbiAgICAgICAgY29uc3QgcmVjb3JkZXJTZWNvbmRzID0gdGhpcy5yZWNvcmRlci5lbmNvZGVkU2FtcGxlUG9zaXRpb24gLyA0ODAwMDtcbiAgICAgICAgY29uc3Qgc2Vjb25kc0xlZnQgPSBUQVJHRVRfTUFYX0xFTkdUSCAtIHJlY29yZGVyU2Vjb25kcztcbiAgICAgICAgaWYgKHNlY29uZHNMZWZ0IDwgMCkgeyAvLyBnbyBvdmVyIHRvIG1ha2Ugc3VyZSB3ZSBkZWZpbml0ZWx5IGNhcHR1cmUgdGhhdCBsYXN0IGZyYW1lXG4gICAgICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsIC0gd2UgYXJlbid0IGNvbmNlcm5lZCB3aXRoIGl0IG92ZXJsYXBwaW5nXG4gICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgfSBlbHNlIGlmIChzZWNvbmRzTGVmdCA8PSBUQVJHRVRfV0FSTl9USU1FX0xFRlQpIHtcbiAgICAgICAgICAgIFNpbmdsZWZsaWdodC5mb3IodGhpcywgXCJlbmRpbmdfc29vblwiKS5kbygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KFJlY29yZGluZ1N0YXRlLkVuZGluZ1Nvb24sIHtzZWNvbmRzTGVmdH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBTaW5nbGVmbGlnaHQuVm9pZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyBhc3luYyBzdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgaWYgKHRoaXMubXhjIHx8IHRoaXMuaGFzUmVjb3JkaW5nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZWNvcmRpbmcgYWxyZWFkeSBwcmVwYXJlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWNvcmRpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlY29yZGluZyBhbHJlYWR5IGluIHByb2dyZXNzXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9ic2VydmFibGUpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2YWJsZS5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZSA9IG5ldyBTaW1wbGVPYnNlcnZhYmxlPElSZWNvcmRpbmdVcGRhdGU+KCk7XG4gICAgICAgIGF3YWl0IHRoaXMubWFrZVJlY29yZGVyKCk7XG4gICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXIuc3RhcnQoKTtcbiAgICAgICAgdGhpcy5yZWNvcmRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmVtaXQoUmVjb3JkaW5nU3RhdGUuU3RhcnRlZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHN0b3AoKTogUHJvbWlzZTxVaW50OEFycmF5PiB7XG4gICAgICAgIHJldHVybiBTaW5nbGVmbGlnaHQuZm9yKHRoaXMsIFwic3RvcFwiKS5kbyhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucmVjb3JkaW5nKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcmVjb3JkaW5nIHRvIHN0b3BcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIERpc2Nvbm5lY3QgdGhlIHNvdXJjZSBlYXJseSB0byBzdGFydCBzaHV0dGluZyBkb3duIHJlc291cmNlc1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlci5zdG9wKCk7IC8vIHN0b3AgZmlyc3QgdG8gZmx1c2ggdGhlIGxhc3QgZnJhbWVcbiAgICAgICAgICAgIHRoaXMucmVjb3JkZXJTb3VyY2UuZGlzY29ubmVjdCgpO1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRlcldvcmtsZXQuZGlzY29ubmVjdCgpO1xuXG4gICAgICAgICAgICAvLyBjbG9zZSB0aGUgY29udGV4dCBhZnRlciB0aGUgcmVjb3JkZXIgc28gdGhlIHJlY29yZGVyIGRvZXNuJ3QgdHJ5IHRvXG4gICAgICAgICAgICAvLyBjb25uZWN0IGFueXRoaW5nIHRvIHRoZSBjb250ZXh0ICh0aGlzIHdvdWxkIGdlbmVyYXRlIGEgd2FybmluZylcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVjb3JkZXJDb250ZXh0LmNsb3NlKCk7XG5cbiAgICAgICAgICAgIC8vIE5vdyBzdG9wIGFsbCB0aGUgbWVkaWEgdHJhY2tzIHNvIHdlIGNhbiByZWxlYXNlIHRoZW0gYmFjayB0byB0aGUgdXNlci9PU1xuICAgICAgICAgICAgdGhpcy5yZWNvcmRlclN0cmVhbS5nZXRUcmFja3MoKS5mb3JFYWNoKHQgPT4gdC5zdG9wKCkpO1xuXG4gICAgICAgICAgICAvLyBGaW5hbGx5IGRvIG91ciBwb3N0LXByb2Nlc3NpbmcgYW5kIGNsZWFuIHVwXG4gICAgICAgICAgICB0aGlzLnJlY29yZGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZWNvcmRlci5jbG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5lbWl0KFJlY29yZGluZ1N0YXRlLkVuZGVkKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYXVkaW9CdWZmZXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBwbGF5YmFjayBpbnN0YW5jZSBmb3IgdGhpcyB2b2ljZSByZWNvcmRpbmcuIE5vdGUgdGhhdCB0aGUgcGxheWJhY2sgd2lsbCBub3RcbiAgICAgKiBoYXZlIGJlZW4gcHJlcGFyZWQgZnVsbHksIG1lYW5pbmcgdGhlIGBwcmVwYXJlKClgIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIGNhbGxlZCBvbiBpdC5cbiAgICAgKlxuICAgICAqIFRoZSBzYW1lIHBsYXliYWNrIGluc3RhbmNlIGlzIHJldHVybmVkIGVhY2ggdGltZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtQbGF5YmFja30gVGhlIHBsYXliYWNrIGluc3RhbmNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRQbGF5YmFjaygpOiBQbGF5YmFjayB7XG4gICAgICAgIHRoaXMucGxheWJhY2sgPSBTaW5nbGVmbGlnaHQuZm9yKHRoaXMsIFwicGxheWJhY2tcIikuZG8oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQbGF5YmFjayh0aGlzLmF1ZGlvQnVmZmVyLmJ1ZmZlciwgdGhpcy5hbXBsaXR1ZGVzKTsgLy8gY2FzdCB0byBBcnJheUJ1ZmZlciBwcm9wZXI7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5YmFjaztcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgLy8gbm9pbnNwZWN0aW9uIEpTSWdub3JlZFByb21pc2VGcm9tQ2FsbCAtIG5vdCBjb25jZXJuZWQgYWJvdXQgc3RvcCgpIGJlaW5nIGNhbGxlZCBhc3luYyBoZXJlXG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgICBTaW5nbGVmbGlnaHQuZm9yZ2V0QWxsRm9yKHRoaXMpO1xuICAgICAgICAvLyBub2luc3BlY3Rpb24gSlNJZ25vcmVkUHJvbWlzZUZyb21DYWxsIC0gbm90IGNvbmNlcm5lZCBhYm91dCBiZWluZyBjYWxsZWQgYXN5bmMgaGVyZVxuICAgICAgICB0aGlzLnBsYXliYWNrPy5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZS5jbG9zZSgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhc3luYyB1cGxvYWQoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc1JlY29yZGluZykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gcmVjb3JkaW5nIGF2YWlsYWJsZSB0byB1cGxvYWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5teGMpIHJldHVybiB0aGlzLm14YztcblxuICAgICAgICB0aGlzLmVtaXQoUmVjb3JkaW5nU3RhdGUuVXBsb2FkaW5nKTtcbiAgICAgICAgdGhpcy5teGMgPSBhd2FpdCB0aGlzLmNsaWVudC51cGxvYWRDb250ZW50KG5ldyBCbG9iKFt0aGlzLmF1ZGlvQnVmZmVyXSwge1xuICAgICAgICAgICAgdHlwZTogdGhpcy5jb250ZW50VHlwZSxcbiAgICAgICAgfSksIHtcbiAgICAgICAgICAgIG9ubHlDb250ZW50VXJpOiBmYWxzZSwgLy8gdG8gc3RvcCB0aGUgd2FybmluZ3MgaW4gdGhlIGNvbnNvbGVcbiAgICAgICAgfSkudGhlbihyID0+IHJbJ2NvbnRlbnRfdXJpJ10pO1xuICAgICAgICB0aGlzLmVtaXQoUmVjb3JkaW5nU3RhdGUuVXBsb2FkZWQpO1xuICAgICAgICByZXR1cm4gdGhpcy5teGM7XG4gICAgfVxufVxuIl19