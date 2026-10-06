"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
  constructor(timeout) {
    this._timeout = timeout;
    this._onTimeout = this._onTimeout.bind(this);

    this._setNotStarted();
  }

  _setNotStarted() {
    this._timerHandle = null;
    this._startTs = null;
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    }).finally(() => {
      this._timerHandle = null;
    });
  }

  _onTimeout() {
    const now = Date.now();
    const elapsed = now - this._startTs;

    if (elapsed >= this._timeout) {
      this._resolve();

      this._setNotStarted();
    } else {
      const delta = this._timeout - elapsed;
      this._timerHandle = setTimeout(this._onTimeout, delta);
    }
  }

  changeTimeout(timeout) {
    if (timeout === this._timeout) {
      return;
    }

    const isSmallerTimeout = timeout < this._timeout;
    this._timeout = timeout;

    if (this.isRunning() && isSmallerTimeout) {
      clearTimeout(this._timerHandle);

      this._onTimeout();
    }
  }
  /**
   * if not started before, starts the timer.
   * @returns {Timer} the same timer
   */


  start() {
    if (!this.isRunning()) {
      this._startTs = Date.now();
      this._timerHandle = setTimeout(this._onTimeout, this._timeout);
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
      this._startTs = Date.now();
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
      clearTimeout(this._timerHandle);

      this._reject(new Error("Timer was aborted."));

      this._setNotStarted();
    }

    return this;
  }
  /**
   *promise that will resolve when the timer elapses,
   *or is rejected when abort is called
   *@return {Promise}
   */


  finished() {
    return this._promise;
  }

  isRunning() {
    return this._timerHandle !== null;
  }

}

exports.default = Timer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9UaW1lci5qcyJdLCJuYW1lcyI6WyJUaW1lciIsImNvbnN0cnVjdG9yIiwidGltZW91dCIsIl90aW1lb3V0IiwiX29uVGltZW91dCIsImJpbmQiLCJfc2V0Tm90U3RhcnRlZCIsIl90aW1lckhhbmRsZSIsIl9zdGFydFRzIiwiX3Byb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIl9yZXNvbHZlIiwiX3JlamVjdCIsImZpbmFsbHkiLCJub3ciLCJEYXRlIiwiZWxhcHNlZCIsImRlbHRhIiwic2V0VGltZW91dCIsImNoYW5nZVRpbWVvdXQiLCJpc1NtYWxsZXJUaW1lb3V0IiwiaXNSdW5uaW5nIiwiY2xlYXJUaW1lb3V0Iiwic3RhcnQiLCJyZXN0YXJ0IiwiYWJvcnQiLCJFcnJvciIsImZpbmlzaGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDZSxNQUFNQSxLQUFOLENBQVk7QUFDdkJDLEVBQUFBLFdBQVcsQ0FBQ0MsT0FBRCxFQUFVO0FBQ2pCLFNBQUtDLFFBQUwsR0FBZ0JELE9BQWhCO0FBQ0EsU0FBS0UsVUFBTCxHQUFrQixLQUFLQSxVQUFMLENBQWdCQyxJQUFoQixDQUFxQixJQUFyQixDQUFsQjs7QUFDQSxTQUFLQyxjQUFMO0FBQ0g7O0FBRURBLEVBQUFBLGNBQWMsR0FBRztBQUNiLFNBQUtDLFlBQUwsR0FBb0IsSUFBcEI7QUFDQSxTQUFLQyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQixJQUFJQyxPQUFKLENBQVksQ0FBQ0MsT0FBRCxFQUFVQyxNQUFWLEtBQXFCO0FBQzdDLFdBQUtDLFFBQUwsR0FBZ0JGLE9BQWhCO0FBQ0EsV0FBS0csT0FBTCxHQUFlRixNQUFmO0FBQ0gsS0FIZSxFQUdiRyxPQUhhLENBR0wsTUFBTTtBQUNiLFdBQUtSLFlBQUwsR0FBb0IsSUFBcEI7QUFDSCxLQUxlLENBQWhCO0FBTUg7O0FBRURILEVBQUFBLFVBQVUsR0FBRztBQUNULFVBQU1ZLEdBQUcsR0FBR0MsSUFBSSxDQUFDRCxHQUFMLEVBQVo7QUFDQSxVQUFNRSxPQUFPLEdBQUdGLEdBQUcsR0FBRyxLQUFLUixRQUEzQjs7QUFDQSxRQUFJVSxPQUFPLElBQUksS0FBS2YsUUFBcEIsRUFBOEI7QUFDMUIsV0FBS1UsUUFBTDs7QUFDQSxXQUFLUCxjQUFMO0FBQ0gsS0FIRCxNQUdPO0FBQ0gsWUFBTWEsS0FBSyxHQUFHLEtBQUtoQixRQUFMLEdBQWdCZSxPQUE5QjtBQUNBLFdBQUtYLFlBQUwsR0FBb0JhLFVBQVUsQ0FBQyxLQUFLaEIsVUFBTixFQUFrQmUsS0FBbEIsQ0FBOUI7QUFDSDtBQUNKOztBQUVERSxFQUFBQSxhQUFhLENBQUNuQixPQUFELEVBQVU7QUFDbkIsUUFBSUEsT0FBTyxLQUFLLEtBQUtDLFFBQXJCLEVBQStCO0FBQzNCO0FBQ0g7O0FBQ0QsVUFBTW1CLGdCQUFnQixHQUFHcEIsT0FBTyxHQUFHLEtBQUtDLFFBQXhDO0FBQ0EsU0FBS0EsUUFBTCxHQUFnQkQsT0FBaEI7O0FBQ0EsUUFBSSxLQUFLcUIsU0FBTCxNQUFvQkQsZ0JBQXhCLEVBQTBDO0FBQ3RDRSxNQUFBQSxZQUFZLENBQUMsS0FBS2pCLFlBQU4sQ0FBWjs7QUFDQSxXQUFLSCxVQUFMO0FBQ0g7QUFDSjtBQUVEO0FBQ0o7QUFDQTtBQUNBOzs7QUFDSXFCLEVBQUFBLEtBQUssR0FBRztBQUNKLFFBQUksQ0FBQyxLQUFLRixTQUFMLEVBQUwsRUFBdUI7QUFDbkIsV0FBS2YsUUFBTCxHQUFnQlMsSUFBSSxDQUFDRCxHQUFMLEVBQWhCO0FBQ0EsV0FBS1QsWUFBTCxHQUFvQmEsVUFBVSxDQUFDLEtBQUtoQixVQUFOLEVBQWtCLEtBQUtELFFBQXZCLENBQTlCO0FBQ0g7O0FBQ0QsV0FBTyxJQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTs7O0FBQ0l1QixFQUFBQSxPQUFPLEdBQUc7QUFDTixRQUFJLEtBQUtILFNBQUwsRUFBSixFQUFzQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQUtmLFFBQUwsR0FBZ0JTLElBQUksQ0FBQ0QsR0FBTCxFQUFoQjtBQUNBLGFBQU8sSUFBUDtBQUNILEtBUEQsTUFPTztBQUNILGFBQU8sS0FBS1MsS0FBTCxFQUFQO0FBQ0g7QUFDSjtBQUVEO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7OztBQUNJRSxFQUFBQSxLQUFLLEdBQUc7QUFDSixRQUFJLEtBQUtKLFNBQUwsRUFBSixFQUFzQjtBQUNsQkMsTUFBQUEsWUFBWSxDQUFDLEtBQUtqQixZQUFOLENBQVo7O0FBQ0EsV0FBS08sT0FBTCxDQUFhLElBQUljLEtBQUosQ0FBVSxvQkFBVixDQUFiOztBQUNBLFdBQUt0QixjQUFMO0FBQ0g7O0FBQ0QsV0FBTyxJQUFQO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBOzs7QUFDSXVCLEVBQUFBLFFBQVEsR0FBRztBQUNQLFdBQU8sS0FBS3BCLFFBQVo7QUFDSDs7QUFFRGMsRUFBQUEsU0FBUyxHQUFHO0FBQ1IsV0FBTyxLQUFLaEIsWUFBTCxLQUFzQixJQUE3QjtBQUNIOztBQWhHc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTggTmV3IFZlY3RvciBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vKipcbkEgY291bnRkb3duIHRpbWVyLCBleHBvc2luZyBhIHByb21pc2UgYXBpLlxuQSB0aW1lciBzdGFydHMgaW4gYSBub24tc3RhcnRlZCBzdGF0ZSxcbmFuZCBuZWVkcyB0byBiZSBzdGFydGVkIGJ5IGNhbGxpbmcgYHN0YXJ0KClgYCBvbiBpdCBmaXJzdC5cblxuVGltZXJzIGNhbiBiZSBgYWJvcnQoKWAtZWQgd2hpY2ggbWFrZXMgdGhlIHByb21pc2UgcmVqZWN0IHByZW1hdHVyZWx5LlxuXG5PbmNlIGEgdGltZXIgaXMgZmluaXNoZWQgb3IgYWJvcnRlZCwgaXQgY2FuJ3QgYmUgc3RhcnRlZCBhZ2FpblxuKGJlY2F1c2UgdGhlIHByb21pc2Ugc2hvdWxkIG5vdCBiZSByZXBsYWNlZCkuIEluc3RlYWQsIGNyZWF0ZVxuYSBuZXcgb25lIHRocm91Z2ggYGNsb25lKClgIG9yIGBjbG9uZUlmUnVuKClgLlxuKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRpbWVyIHtcbiAgICBjb25zdHJ1Y3Rvcih0aW1lb3V0KSB7XG4gICAgICAgIHRoaXMuX3RpbWVvdXQgPSB0aW1lb3V0O1xuICAgICAgICB0aGlzLl9vblRpbWVvdXQgPSB0aGlzLl9vblRpbWVvdXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5fc2V0Tm90U3RhcnRlZCgpO1xuICAgIH1cblxuICAgIF9zZXROb3RTdGFydGVkKCkge1xuICAgICAgICB0aGlzLl90aW1lckhhbmRsZSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3N0YXJ0VHMgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICB0aGlzLl9yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fdGltZXJIYW5kbGUgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfb25UaW1lb3V0KCkge1xuICAgICAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBjb25zdCBlbGFwc2VkID0gbm93IC0gdGhpcy5fc3RhcnRUcztcbiAgICAgICAgaWYgKGVsYXBzZWQgPj0gdGhpcy5fdGltZW91dCkge1xuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZSgpO1xuICAgICAgICAgICAgdGhpcy5fc2V0Tm90U3RhcnRlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLl90aW1lb3V0IC0gZWxhcHNlZDtcbiAgICAgICAgICAgIHRoaXMuX3RpbWVySGFuZGxlID0gc2V0VGltZW91dCh0aGlzLl9vblRpbWVvdXQsIGRlbHRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoYW5nZVRpbWVvdXQodGltZW91dCkge1xuICAgICAgICBpZiAodGltZW91dCA9PT0gdGhpcy5fdGltZW91dCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlzU21hbGxlclRpbWVvdXQgPSB0aW1lb3V0IDwgdGhpcy5fdGltZW91dDtcbiAgICAgICAgdGhpcy5fdGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICAgIGlmICh0aGlzLmlzUnVubmluZygpICYmIGlzU21hbGxlclRpbWVvdXQpIHtcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lckhhbmRsZSk7XG4gICAgICAgICAgICB0aGlzLl9vblRpbWVvdXQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGlmIG5vdCBzdGFydGVkIGJlZm9yZSwgc3RhcnRzIHRoZSB0aW1lci5cbiAgICAgKiBAcmV0dXJucyB7VGltZXJ9IHRoZSBzYW1lIHRpbWVyXG4gICAgICovXG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUcyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lckhhbmRsZSA9IHNldFRpbWVvdXQodGhpcy5fb25UaW1lb3V0LCB0aGlzLl90aW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAocmUpc3RhcnQgdGhlIHRpbWVyLiBJZiBpdCdzIHJ1bm5pbmcsIHJlc2V0IHRoZSB0aW1lb3V0LiBJZiBub3QsIHN0YXJ0IGl0LlxuICAgICAqIEByZXR1cm5zIHtUaW1lcn0gdGhlIHNhbWUgdGltZXJcbiAgICAgKi9cbiAgICByZXN0YXJ0KCkge1xuICAgICAgICBpZiAodGhpcy5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgLy8gZG9uJ3QgY2xlYXJUaW1lb3V0IGhlcmUgYXMgdGhpcyBtZXRob2RcbiAgICAgICAgICAgIC8vIGNhbiBiZSBjYWxsZWQgaW4gZmFzdCBzdWNjZXNzaW9uLFxuICAgICAgICAgICAgLy8gaW5zdGVhZCBqdXN0IHRha2Ugbm90ZSBhbmQgY29tcGFyZVxuICAgICAgICAgICAgLy8gd2hlbiB0aGUgYWxyZWFkeSBydW5uaW5nIHRpbWVvdXQgZXhwaXJlc1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRUcyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpZiB0aGUgdGltZXIgaXMgcnVubmluZywgYWJvcnQgaXQsXG4gICAgICogYW5kIHJlamVjdCB0aGUgcHJvbWlzZSBmb3IgdGhpcyB0aW1lci5cbiAgICAgKiBAcmV0dXJucyB7VGltZXJ9IHRoZSBzYW1lIHRpbWVyXG4gICAgICovXG4gICAgYWJvcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXJIYW5kbGUpO1xuICAgICAgICAgICAgdGhpcy5fcmVqZWN0KG5ldyBFcnJvcihcIlRpbWVyIHdhcyBhYm9ydGVkLlwiKSk7XG4gICAgICAgICAgICB0aGlzLl9zZXROb3RTdGFydGVkKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICpwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHdoZW4gdGhlIHRpbWVyIGVsYXBzZXMsXG4gICAgICpvciBpcyByZWplY3RlZCB3aGVuIGFib3J0IGlzIGNhbGxlZFxuICAgICAqQHJldHVybiB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBmaW5pc2hlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21pc2U7XG4gICAgfVxuXG4gICAgaXNSdW5uaW5nKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdGltZXJIYW5kbGUgIT09IG51bGw7XG4gICAgfVxufVxuIl19