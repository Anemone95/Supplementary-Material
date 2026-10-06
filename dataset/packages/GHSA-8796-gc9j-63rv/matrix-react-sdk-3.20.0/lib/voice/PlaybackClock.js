"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlaybackClock = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _matrixWidgetApi = require("matrix-widget-api");

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
// Because keeping track of time is sufficiently complicated...
class PlaybackClock
/*:: implements IDestroyable*/
{
  constructor(context
  /*: AudioContext*/
  ) {
    this.context
    /*:: */
    = context
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "clipStart", 0);
    (0, _defineProperty2.default)(this, "stopped", true);
    (0, _defineProperty2.default)(this, "lastCheck", 0);
    (0, _defineProperty2.default)(this, "observable", new _matrixWidgetApi.SimpleObservable());
    (0, _defineProperty2.default)(this, "timerId", void 0);
    (0, _defineProperty2.default)(this, "clipDuration", 0);
    (0, _defineProperty2.default)(this, "checkTime", () => {
      const now = this.timeSeconds;

      if (this.lastCheck !== now) {
        this.observable.update([now, this.durationSeconds]);
        this.lastCheck = now;
      }
    });
  }

  get durationSeconds()
  /*: number*/
  {
    return this.clipDuration;
  }

  set durationSeconds(val
  /*: number*/
  ) {
    this.clipDuration = val;
    this.observable.update([this.timeSeconds, this.clipDuration]);
  }

  get timeSeconds()
  /*: number*/
  {
    return (this.context.currentTime - this.clipStart) % this.clipDuration;
  }

  get liveData()
  /*: SimpleObservable<number[]>*/
  {
    return this.observable;
  }

  flagStart() {
    if (this.stopped) {
      this.clipStart = this.context.currentTime;
      this.stopped = false;
    }

    if (!this.timerId) {
      // case to number because the types are wrong
      // 100ms interval to make sure the time is as accurate as possible
      this.timerId = setInterval(this.checkTime, 100);
    }
  }

  flagStop() {
    this.stopped = true;
  }

  destroy() {
    this.observable.close();
    if (this.timerId) clearInterval(this.timerId);
  }

}

exports.PlaybackClock = PlaybackClock;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy92b2ljZS9QbGF5YmFja0Nsb2NrLnRzIl0sIm5hbWVzIjpbIlBsYXliYWNrQ2xvY2siLCJjb25zdHJ1Y3RvciIsImNvbnRleHQiLCJTaW1wbGVPYnNlcnZhYmxlIiwibm93IiwidGltZVNlY29uZHMiLCJsYXN0Q2hlY2siLCJvYnNlcnZhYmxlIiwidXBkYXRlIiwiZHVyYXRpb25TZWNvbmRzIiwiY2xpcER1cmF0aW9uIiwidmFsIiwiY3VycmVudFRpbWUiLCJjbGlwU3RhcnQiLCJsaXZlRGF0YSIsImZsYWdTdGFydCIsInN0b3BwZWQiLCJ0aW1lcklkIiwic2V0SW50ZXJ2YWwiLCJjaGVja1RpbWUiLCJmbGFnU3RvcCIsImRlc3Ryb3kiLCJjbG9zZSIsImNsZWFySW50ZXJ2YWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBZ0JBOztBQWhCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLQTtBQUNPLE1BQU1BO0FBQU47QUFBNEM7QUFReENDLEVBQUFBLFdBQVAsQ0FBMkJDO0FBQTNCO0FBQUEsSUFBa0Q7QUFBQSxTQUF2QkE7QUFBdUI7QUFBQSxNQUF2QkE7QUFBdUI7QUFBQTtBQUFBLHFEQVA5QixDQU84QjtBQUFBLG1EQU5oQyxJQU1nQztBQUFBLHFEQUw5QixDQUs4QjtBQUFBLHNEQUo3QixJQUFJQyxpQ0FBSixFQUk2QjtBQUFBO0FBQUEsd0RBRjNCLENBRTJCO0FBQUEscURBb0I5QixNQUFNO0FBQ3RCLFlBQU1DLEdBQUcsR0FBRyxLQUFLQyxXQUFqQjs7QUFDQSxVQUFJLEtBQUtDLFNBQUwsS0FBbUJGLEdBQXZCLEVBQTRCO0FBQ3hCLGFBQUtHLFVBQUwsQ0FBZ0JDLE1BQWhCLENBQXVCLENBQUNKLEdBQUQsRUFBTSxLQUFLSyxlQUFYLENBQXZCO0FBQ0EsYUFBS0gsU0FBTCxHQUFpQkYsR0FBakI7QUFDSDtBQUNKLEtBMUJpRDtBQUNqRDs7QUFFRCxNQUFXSyxlQUFYO0FBQUE7QUFBcUM7QUFDakMsV0FBTyxLQUFLQyxZQUFaO0FBQ0g7O0FBRUQsTUFBV0QsZUFBWCxDQUEyQkU7QUFBM0I7QUFBQSxJQUF3QztBQUNwQyxTQUFLRCxZQUFMLEdBQW9CQyxHQUFwQjtBQUNBLFNBQUtKLFVBQUwsQ0FBZ0JDLE1BQWhCLENBQXVCLENBQUMsS0FBS0gsV0FBTixFQUFtQixLQUFLSyxZQUF4QixDQUF2QjtBQUNIOztBQUVELE1BQVdMLFdBQVg7QUFBQTtBQUFpQztBQUM3QixXQUFPLENBQUMsS0FBS0gsT0FBTCxDQUFhVSxXQUFiLEdBQTJCLEtBQUtDLFNBQWpDLElBQThDLEtBQUtILFlBQTFEO0FBQ0g7O0FBRUQsTUFBV0ksUUFBWDtBQUFBO0FBQWtEO0FBQzlDLFdBQU8sS0FBS1AsVUFBWjtBQUNIOztBQVVNUSxFQUFBQSxTQUFQLEdBQW1CO0FBQ2YsUUFBSSxLQUFLQyxPQUFULEVBQWtCO0FBQ2QsV0FBS0gsU0FBTCxHQUFpQixLQUFLWCxPQUFMLENBQWFVLFdBQTlCO0FBQ0EsV0FBS0ksT0FBTCxHQUFlLEtBQWY7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBS0MsT0FBVixFQUFtQjtBQUNmO0FBQ0E7QUFDQSxXQUFLQSxPQUFMLEdBQTRCQyxXQUFXLENBQUMsS0FBS0MsU0FBTixFQUFpQixHQUFqQixDQUF2QztBQUNIO0FBQ0o7O0FBRU1DLEVBQUFBLFFBQVAsR0FBa0I7QUFDZCxTQUFLSixPQUFMLEdBQWUsSUFBZjtBQUNIOztBQUVNSyxFQUFBQSxPQUFQLEdBQWlCO0FBQ2IsU0FBS2QsVUFBTCxDQUFnQmUsS0FBaEI7QUFDQSxRQUFJLEtBQUtMLE9BQVQsRUFBa0JNLGFBQWEsQ0FBQyxLQUFLTixPQUFOLENBQWI7QUFDckI7O0FBeEQ4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7U2ltcGxlT2JzZXJ2YWJsZX0gZnJvbSBcIm1hdHJpeC13aWRnZXQtYXBpXCI7XG5pbXBvcnQge0lEZXN0cm95YWJsZX0gZnJvbSBcIi4uL3V0aWxzL0lEZXN0cm95YWJsZVwiO1xuXG4vLyBCZWNhdXNlIGtlZXBpbmcgdHJhY2sgb2YgdGltZSBpcyBzdWZmaWNpZW50bHkgY29tcGxpY2F0ZWQuLi5cbmV4cG9ydCBjbGFzcyBQbGF5YmFja0Nsb2NrIGltcGxlbWVudHMgSURlc3Ryb3lhYmxlIHtcbiAgICBwcml2YXRlIGNsaXBTdGFydCA9IDA7XG4gICAgcHJpdmF0ZSBzdG9wcGVkID0gdHJ1ZTtcbiAgICBwcml2YXRlIGxhc3RDaGVjayA9IDA7XG4gICAgcHJpdmF0ZSBvYnNlcnZhYmxlID0gbmV3IFNpbXBsZU9ic2VydmFibGU8bnVtYmVyW10+KCk7XG4gICAgcHJpdmF0ZSB0aW1lcklkOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBjbGlwRHVyYXRpb24gPSAwO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHByaXZhdGUgY29udGV4dDogQXVkaW9Db250ZXh0KSB7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkdXJhdGlvblNlY29uZHMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY2xpcER1cmF0aW9uO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZHVyYXRpb25TZWNvbmRzKHZhbDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuY2xpcER1cmF0aW9uID0gdmFsO1xuICAgICAgICB0aGlzLm9ic2VydmFibGUudXBkYXRlKFt0aGlzLnRpbWVTZWNvbmRzLCB0aGlzLmNsaXBEdXJhdGlvbl0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdGltZVNlY29uZHMoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmNvbnRleHQuY3VycmVudFRpbWUgLSB0aGlzLmNsaXBTdGFydCkgJSB0aGlzLmNsaXBEdXJhdGlvbjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGxpdmVEYXRhKCk6IFNpbXBsZU9ic2VydmFibGU8bnVtYmVyW10+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMub2JzZXJ2YWJsZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNoZWNrVGltZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgbm93ID0gdGhpcy50aW1lU2Vjb25kcztcbiAgICAgICAgaWYgKHRoaXMubGFzdENoZWNrICE9PSBub3cpIHtcbiAgICAgICAgICAgIHRoaXMub2JzZXJ2YWJsZS51cGRhdGUoW25vdywgdGhpcy5kdXJhdGlvblNlY29uZHNdKTtcbiAgICAgICAgICAgIHRoaXMubGFzdENoZWNrID0gbm93O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHB1YmxpYyBmbGFnU3RhcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xpcFN0YXJ0ID0gdGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lO1xuICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMudGltZXJJZCkge1xuICAgICAgICAgICAgLy8gY2FzZSB0byBudW1iZXIgYmVjYXVzZSB0aGUgdHlwZXMgYXJlIHdyb25nXG4gICAgICAgICAgICAvLyAxMDBtcyBpbnRlcnZhbCB0byBtYWtlIHN1cmUgdGhlIHRpbWUgaXMgYXMgYWNjdXJhdGUgYXMgcG9zc2libGVcbiAgICAgICAgICAgIHRoaXMudGltZXJJZCA9IDxudW1iZXI+PGFueT5zZXRJbnRlcnZhbCh0aGlzLmNoZWNrVGltZSwgMTAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBmbGFnU3RvcCgpIHtcbiAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5vYnNlcnZhYmxlLmNsb3NlKCk7XG4gICAgICAgIGlmICh0aGlzLnRpbWVySWQpIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcklkKTtcbiAgICB9XG59XG4iXX0=