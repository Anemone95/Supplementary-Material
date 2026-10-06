"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

/*
Copyright 2018, 2021 The Matrix.org Foundation C.I.C.

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

/**
A countdown timer, exposing a promise api.
A timer starts in a non-started state,
and needs to be started by calling `start()`` on it first.

Timers can be `abort()`-ed which makes the promise reject prematurely.

Once a timer is finished or aborted, it can't be started again
(because the promise should not be replaced). Instead, create
a new one through `clone()` or `cloneIfRun()`.
*/
class Timer {
  constructor(timeout
  /*: number*/
  ) {
    this.timeout
    /*:: */
    = timeout
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "timerHandle", void 0);
    (0, _defineProperty2.default)(this, "startTs", void 0);
    (0, _defineProperty2.default)(this, "promise", void 0);
    (0, _defineProperty2.default)(this, "resolve", void 0);
    (0, _defineProperty2.default)(this, "reject", void 0);
    (0, _defineProperty2.default)(this, "onTimeout", () => {
      const now = Date.now();
      const elapsed = now - this.startTs;

      if (elapsed >= this.timeout) {
        this.resolve();
        this.setNotStarted();
      } else {
        const delta = this.timeout - elapsed;
        this.timerHandle = setTimeout(this.onTimeout, delta);
      }
    });
    this.setNotStarted();
  }

  setNotStarted() {
    this.timerHandle = null;
    this.startTs = null;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    }).finally(() => {
      this.timerHandle = null;
    });
  }

  changeTimeout(timeout
  /*: number*/
  ) {
    if (timeout === this.timeout) {
      return;
    }

    const isSmallerTimeout = timeout < this.timeout;
    this.timeout = timeout;

    if (this.isRunning() && isSmallerTimeout) {
      clearTimeout(this.timerHandle);
      this.onTimeout();
    }
  }
  /**
   * if not started before, starts the timer.
   * @returns {Timer} the same timer
   */


  start() {
    if (!this.isRunning()) {
      this.startTs = Date.now();
      this.timerHandle = setTimeout(this.onTimeout, this.timeout);
    }

    return this;
  }
  /**
   * (re)start the timer. If it's running, reset the timeout. If not, start it.
   * @returns {Timer} the same timer
   */


  restart() {
    if (this.isRunning()) {
      // don't clearTimeout here as this method
      // can be called in fast succession,
      // instead just take note and compare
      // when the already running timeout expires
      this.startTs = Date.now();
      return this;
    } else {
      return this.start();
    }
  }
  /**
   * if the timer is running, abort it,
   * and reject the promise for this timer.
   * @returns {Timer} the same timer
   */


  abort() {
    if (this.isRunning()) {
      clearTimeout(this.timerHandle);
      this.reject(new Error("Timer was aborted."));
      this.setNotStarted();
    }

    return this;
  }
  /**
   *promise that will resolve when the timer elapses,
   *or is rejected when abort is called
   *@return {Promise}
   */


  finished() {
    return this.promise;
  }

  isRunning() {
    return this.timerHandle !== null;
  }

}

exports.default = Timer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9UaW1lci50cyJdLCJuYW1lcyI6WyJUaW1lciIsImNvbnN0cnVjdG9yIiwidGltZW91dCIsIm5vdyIsIkRhdGUiLCJlbGFwc2VkIiwic3RhcnRUcyIsInJlc29sdmUiLCJzZXROb3RTdGFydGVkIiwiZGVsdGEiLCJ0aW1lckhhbmRsZSIsInNldFRpbWVvdXQiLCJvblRpbWVvdXQiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlamVjdCIsImZpbmFsbHkiLCJjaGFuZ2VUaW1lb3V0IiwiaXNTbWFsbGVyVGltZW91dCIsImlzUnVubmluZyIsImNsZWFyVGltZW91dCIsInN0YXJ0IiwicmVzdGFydCIsImFib3J0IiwiRXJyb3IiLCJmaW5pc2hlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNlLE1BQU1BLEtBQU4sQ0FBWTtBQU92QkMsRUFBQUEsV0FBVyxDQUFTQztBQUFUO0FBQUEsSUFBMEI7QUFBQSxTQUFqQkE7QUFBaUI7QUFBQSxNQUFqQkE7QUFBaUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxxREFlakIsTUFBTTtBQUN0QixZQUFNQyxHQUFHLEdBQUdDLElBQUksQ0FBQ0QsR0FBTCxFQUFaO0FBQ0EsWUFBTUUsT0FBTyxHQUFHRixHQUFHLEdBQUcsS0FBS0csT0FBM0I7O0FBQ0EsVUFBSUQsT0FBTyxJQUFJLEtBQUtILE9BQXBCLEVBQTZCO0FBQ3pCLGFBQUtLLE9BQUw7QUFDQSxhQUFLQyxhQUFMO0FBQ0gsT0FIRCxNQUdPO0FBQ0gsY0FBTUMsS0FBSyxHQUFHLEtBQUtQLE9BQUwsR0FBZUcsT0FBN0I7QUFDQSxhQUFLSyxXQUFMLEdBQW1CQyxVQUFVLENBQUMsS0FBS0MsU0FBTixFQUFpQkgsS0FBakIsQ0FBN0I7QUFDSDtBQUNKLEtBekJvQztBQUNqQyxTQUFLRCxhQUFMO0FBQ0g7O0FBRU9BLEVBQUFBLGFBQVIsR0FBd0I7QUFDcEIsU0FBS0UsV0FBTCxHQUFtQixJQUFuQjtBQUNBLFNBQUtKLE9BQUwsR0FBZSxJQUFmO0FBQ0EsU0FBS08sT0FBTCxHQUFlLElBQUlDLE9BQUosQ0FBa0IsQ0FBQ1AsT0FBRCxFQUFVUSxNQUFWLEtBQXFCO0FBQ2xELFdBQUtSLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFdBQUtRLE1BQUwsR0FBY0EsTUFBZDtBQUNILEtBSGMsRUFHWkMsT0FIWSxDQUdKLE1BQU07QUFDYixXQUFLTixXQUFMLEdBQW1CLElBQW5CO0FBQ0gsS0FMYyxDQUFmO0FBTUg7O0FBY0RPLEVBQUFBLGFBQWEsQ0FBQ2Y7QUFBRDtBQUFBLElBQWtCO0FBQzNCLFFBQUlBLE9BQU8sS0FBSyxLQUFLQSxPQUFyQixFQUE4QjtBQUMxQjtBQUNIOztBQUNELFVBQU1nQixnQkFBZ0IsR0FBR2hCLE9BQU8sR0FBRyxLQUFLQSxPQUF4QztBQUNBLFNBQUtBLE9BQUwsR0FBZUEsT0FBZjs7QUFDQSxRQUFJLEtBQUtpQixTQUFMLE1BQW9CRCxnQkFBeEIsRUFBMEM7QUFDdENFLE1BQUFBLFlBQVksQ0FBQyxLQUFLVixXQUFOLENBQVo7QUFDQSxXQUFLRSxTQUFMO0FBQ0g7QUFDSjtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7QUFDSVMsRUFBQUEsS0FBSyxHQUFHO0FBQ0osUUFBSSxDQUFDLEtBQUtGLFNBQUwsRUFBTCxFQUF1QjtBQUNuQixXQUFLYixPQUFMLEdBQWVGLElBQUksQ0FBQ0QsR0FBTCxFQUFmO0FBQ0EsV0FBS08sV0FBTCxHQUFtQkMsVUFBVSxDQUFDLEtBQUtDLFNBQU4sRUFBaUIsS0FBS1YsT0FBdEIsQ0FBN0I7QUFDSDs7QUFDRCxXQUFPLElBQVA7QUFDSDtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7QUFDSW9CLEVBQUFBLE9BQU8sR0FBRztBQUNOLFFBQUksS0FBS0gsU0FBTCxFQUFKLEVBQXNCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBS2IsT0FBTCxHQUFlRixJQUFJLENBQUNELEdBQUwsRUFBZjtBQUNBLGFBQU8sSUFBUDtBQUNILEtBUEQsTUFPTztBQUNILGFBQU8sS0FBS2tCLEtBQUwsRUFBUDtBQUNIO0FBQ0o7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSUUsRUFBQUEsS0FBSyxHQUFHO0FBQ0osUUFBSSxLQUFLSixTQUFMLEVBQUosRUFBc0I7QUFDbEJDLE1BQUFBLFlBQVksQ0FBQyxLQUFLVixXQUFOLENBQVo7QUFDQSxXQUFLSyxNQUFMLENBQVksSUFBSVMsS0FBSixDQUFVLG9CQUFWLENBQVo7QUFDQSxXQUFLaEIsYUFBTDtBQUNIOztBQUNELFdBQU8sSUFBUDtBQUNIO0FBRUQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0lpQixFQUFBQSxRQUFRLEdBQUc7QUFDUCxXQUFPLEtBQUtaLE9BQVo7QUFDSDs7QUFFRE0sRUFBQUEsU0FBUyxHQUFHO0FBQ1IsV0FBTyxLQUFLVCxXQUFMLEtBQXFCLElBQTVCO0FBQ0g7O0FBcEdzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOCwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbi8qKlxuQSBjb3VudGRvd24gdGltZXIsIGV4cG9zaW5nIGEgcHJvbWlzZSBhcGkuXG5BIHRpbWVyIHN0YXJ0cyBpbiBhIG5vbi1zdGFydGVkIHN0YXRlLFxuYW5kIG5lZWRzIHRvIGJlIHN0YXJ0ZWQgYnkgY2FsbGluZyBgc3RhcnQoKWBgIG9uIGl0IGZpcnN0LlxuXG5UaW1lcnMgY2FuIGJlIGBhYm9ydCgpYC1lZCB3aGljaCBtYWtlcyB0aGUgcHJvbWlzZSByZWplY3QgcHJlbWF0dXJlbHkuXG5cbk9uY2UgYSB0aW1lciBpcyBmaW5pc2hlZCBvciBhYm9ydGVkLCBpdCBjYW4ndCBiZSBzdGFydGVkIGFnYWluXG4oYmVjYXVzZSB0aGUgcHJvbWlzZSBzaG91bGQgbm90IGJlIHJlcGxhY2VkKS4gSW5zdGVhZCwgY3JlYXRlXG5hIG5ldyBvbmUgdGhyb3VnaCBgY2xvbmUoKWAgb3IgYGNsb25lSWZSdW4oKWAuXG4qL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGltZXIge1xuICAgIHByaXZhdGUgdGltZXJIYW5kbGU6IE5vZGVKUy5UaW1lb3V0O1xuICAgIHByaXZhdGUgc3RhcnRUczogbnVtYmVyO1xuICAgIHByaXZhdGUgcHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgICBwcml2YXRlIHJlc29sdmU6ICgpID0+IHZvaWQ7XG4gICAgcHJpdmF0ZSByZWplY3Q6IChFcnJvcikgPT4gdm9pZDtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgdGltZW91dDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2V0Tm90U3RhcnRlZCgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0Tm90U3RhcnRlZCgpIHtcbiAgICAgICAgdGhpcy50aW1lckhhbmRsZSA9IG51bGw7XG4gICAgICAgIHRoaXMuc3RhcnRUcyA9IG51bGw7XG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSkuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRpbWVySGFuZGxlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSBub3cgLSB0aGlzLnN0YXJ0VHM7XG4gICAgICAgIGlmIChlbGFwc2VkID49IHRoaXMudGltZW91dCkge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICB0aGlzLnNldE5vdFN0YXJ0ZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy50aW1lb3V0IC0gZWxhcHNlZDtcbiAgICAgICAgICAgIHRoaXMudGltZXJIYW5kbGUgPSBzZXRUaW1lb3V0KHRoaXMub25UaW1lb3V0LCBkZWx0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGFuZ2VUaW1lb3V0KHRpbWVvdXQ6IG51bWJlcikge1xuICAgICAgICBpZiAodGltZW91dCA9PT0gdGhpcy50aW1lb3V0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNTbWFsbGVyVGltZW91dCA9IHRpbWVvdXQgPCB0aGlzLnRpbWVvdXQ7XG4gICAgICAgIHRoaXMudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICAgIGlmICh0aGlzLmlzUnVubmluZygpICYmIGlzU21hbGxlclRpbWVvdXQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySGFuZGxlKTtcbiAgICAgICAgICAgIHRoaXMub25UaW1lb3V0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpZiBub3Qgc3RhcnRlZCBiZWZvcmUsIHN0YXJ0cyB0aGUgdGltZXIuXG4gICAgICogQHJldHVybnMge1RpbWVyfSB0aGUgc2FtZSB0aW1lclxuICAgICAqL1xuICAgIHN0YXJ0KCkge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUcyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLnRpbWVySGFuZGxlID0gc2V0VGltZW91dCh0aGlzLm9uVGltZW91dCwgdGhpcy50aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAocmUpc3RhcnQgdGhlIHRpbWVyLiBJZiBpdCdzIHJ1bm5pbmcsIHJlc2V0IHRoZSB0aW1lb3V0LiBJZiBub3QsIHN0YXJ0IGl0LlxuICAgICAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIHNhbWUgdGltZXJcbiAgICAgKi9cbiAgICByZXN0YXJ0KCkge1xuICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgY2xlYXJUaW1lb3V0IGhlcmUgYXMgdGhpcyBtZXRob2RcbiAgICAgICAgICAgIC8vIGNhbiBiZSBjYWxsZWQgaW4gZmFzdCBzdWNjZXNzaW9uLFxuICAgICAgICAgICAgLy8gaW5zdGVhZCBqdXN0IHRha2Ugbm90ZSBhbmQgY29tcGFyZVxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgYWxyZWFkeSBydW5uaW5nIHRpbWVvdXQgZXhwaXJlc1xuICAgICAgICAgICAgdGhpcy5zdGFydFRzID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlmIHRoZSB0aW1lciBpcyBydW5uaW5nLCBhYm9ydCBpdCxcbiAgICAgKiBhbmQgcmVqZWN0IHRoZSBwcm9taXNlIGZvciB0aGlzIHRpbWVyLlxuICAgICAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIHNhbWUgdGltZXJcbiAgICAgKi9cbiAgICBhYm9ydCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNSdW5uaW5nKCkpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVySGFuZGxlKTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0KG5ldyBFcnJvcihcIlRpbWVyIHdhcyBhYm9ydGVkLlwiKSk7XG4gICAgICAgICAgICB0aGlzLnNldE5vdFN0YXJ0ZWQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKnByb21pc2UgdGhhdCB3aWxsIHJlc29sdmUgd2hlbiB0aGUgdGltZXIgZWxhcHNlcyxcbiAgICAgKm9yIGlzIHJlamVjdGVkIHdoZW4gYWJvcnQgaXMgY2FsbGVkXG4gICAgICpAcmV0dXJuIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGZpbmlzaGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9taXNlO1xuICAgIH1cblxuICAgIGlzUnVubmluZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZXJIYW5kbGUgIT09IG51bGw7XG4gICAgfVxufVxuIl19