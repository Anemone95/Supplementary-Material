"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _dispatcher = _interopRequireDefault(require("./dispatcher/dispatcher"));

var _Timer = _interopRequireDefault(require("./utils/Timer"));

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2019 New Vector Ltd

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
// important these are larger than the timeouts of timers
// used with UserActivity.timeWhileActive*,
// such as READ_MARKER_INVIEW_THRESHOLD_MS (timeWhileActiveRecently),
// READ_MARKER_OUTOFVIEW_THRESHOLD_MS (timeWhileActiveRecently),
// READ_RECEIPT_INTERVAL_MS (timeWhileActiveNow) in TimelinePanel
// 'Under a few seconds'. Must be less than 'RECENTLY_ACTIVE_THRESHOLD_MS'
const CURRENTLY_ACTIVE_THRESHOLD_MS = 700; // 'Under a few minutes'.

const RECENTLY_ACTIVE_THRESHOLD_MS = 2 * 60 * 1000;
/**
 * This class watches for user activity (moving the mouse or pressing a key)
 * and starts/stops attached timers while the user is active.
 *
 * There are two classes of 'active': 'active now' and 'active recently'
 * see doc on the userActive* functions for what these mean.
 */

class UserActivity {
  constructor(window
  /*: Window*/
  , document
  /*: Document*/
  ) {
    this.window
    /*:: */
    = window
    /*:: */
    ;
    this.document
    /*:: */
    = document
    /*:: */
    ;
    (0, _defineProperty2.default)(this, "activeNowTimeout", void 0);
    (0, _defineProperty2.default)(this, "activeRecentlyTimeout", void 0);
    (0, _defineProperty2.default)(this, "attachedActiveNowTimers", []);
    (0, _defineProperty2.default)(this, "attachedActiveRecentlyTimers", []);
    (0, _defineProperty2.default)(this, "lastScreenX", 0);
    (0, _defineProperty2.default)(this, "lastScreenY", 0);
    (0, _defineProperty2.default)(this, "onPageVisibilityChanged", e => {
      if (this.document.visibilityState === "hidden") {
        this.activeNowTimeout.abort();
        this.activeRecentlyTimeout.abort();
      } else {
        this.onUserActivity(e);
      }
    });
    (0, _defineProperty2.default)(this, "onWindowBlurred", () => {
      this.activeNowTimeout.abort();
      this.activeRecentlyTimeout.abort();
    });
    (0, _defineProperty2.default)(this, "onUserActivity", (event
    /*: MouseEvent*/
    ) => {
      // ignore anything if the window isn't focused
      if (!this.document.hasFocus()) return;

      if (event.screenX && event.type === "mousemove") {
        if (event.screenX === this.lastScreenX && event.screenY === this.lastScreenY) {
          // mouse hasn't actually moved
          return;
        }

        this.lastScreenX = event.screenX;
        this.lastScreenY = event.screenY;
      }

      _dispatcher.default.dispatch({
        action: 'user_activity'
      });

      if (!this.activeNowTimeout.isRunning()) {
        this.activeNowTimeout.start();

        _dispatcher.default.dispatch({
          action: 'user_activity_start'
        });

        UserActivity.runTimersUntilTimeout(this.attachedActiveNowTimers, this.activeNowTimeout);
      } else {
        this.activeNowTimeout.restart();
      }

      if (!this.activeRecentlyTimeout.isRunning()) {
        this.activeRecentlyTimeout.start();
        UserActivity.runTimersUntilTimeout(this.attachedActiveRecentlyTimers, this.activeRecentlyTimeout);
      } else {
        this.activeRecentlyTimeout.restart();
      }
    });
    this.activeNowTimeout = new _Timer.default(CURRENTLY_ACTIVE_THRESHOLD_MS);
    this.activeRecentlyTimeout = new _Timer.default(RECENTLY_ACTIVE_THRESHOLD_MS);
  }

  static sharedInstance() {
    if (window.mxUserActivity === undefined) {
      window.mxUserActivity = new UserActivity(window, document);
    }

    return window.mxUserActivity;
  }
  /**
   * Runs the given timer while the user is 'active now', aborting when the user is no longer
   * considered currently active.
   * See userActiveNow() for what it means for a user to be 'active'.
   * Can be called multiple times with the same already running timer, which is a NO-OP.
   * Can be called before the user becomes active, in which case it is only started
   * later on when the user does become active.
   * @param {Timer} timer the timer to use
   */


  timeWhileActiveNow(timer
  /*: Timer*/
  ) {
    this.timeWhile(timer, this.attachedActiveNowTimers);

    if (this.userActiveNow()) {
      timer.start();
    }
  }
  /**
   * Runs the given timer while the user is 'active' now or recently,
   * aborting when the user becomes inactive.
   * See userActiveRecently() for what it means for a user to be 'active recently'.
   * Can be called multiple times with the same already running timer, which is a NO-OP.
   * Can be called before the user becomes active, in which case it is only started
   * later on when the user does become active.
   * @param {Timer} timer the timer to use
   */


  timeWhileActiveRecently(timer
  /*: Timer*/
  ) {
    this.timeWhile(timer, this.attachedActiveRecentlyTimers);

    if (this.userActiveRecently()) {
      timer.start();
    }
  }

  timeWhile(timer
  /*: Timer*/
  , attachedTimers
  /*: Timer[]*/
  ) {
    // important this happens first
    const index = attachedTimers.indexOf(timer);

    if (index === -1) {
      attachedTimers.push(timer); // remove when done or aborted

      timer.finished().finally(() => {
        const index = attachedTimers.indexOf(timer);

        if (index !== -1) {
          // should never be -1
          attachedTimers.splice(index, 1);
        } // as we fork the promise here,
        // avoid unhandled rejection warnings

      }).catch(err => {});
    }
  }
  /**
   * Start listening to user activity
   */


  start() {
    this.document.addEventListener('mousedown', this.onUserActivity);
    this.document.addEventListener('mousemove', this.onUserActivity);
    this.document.addEventListener('keydown', this.onUserActivity);
    this.document.addEventListener("visibilitychange", this.onPageVisibilityChanged);
    this.window.addEventListener("blur", this.onWindowBlurred);
    this.window.addEventListener("focus", this.onUserActivity); // can't use document.scroll here because that's only the document
    // itself being scrolled. Need to use addEventListener's useCapture.
    // also this needs to be the wheel event, not scroll, as scroll is
    // fired when the view scrolls down for a new message.

    this.window.addEventListener('wheel', this.onUserActivity, {
      passive: true,
      capture: true
    });
  }
  /**
   * Stop tracking user activity
   */


  stop() {
    this.document.removeEventListener('mousedown', this.onUserActivity);
    this.document.removeEventListener('mousemove', this.onUserActivity);
    this.document.removeEventListener('keydown', this.onUserActivity);
    this.window.removeEventListener('wheel', this.onUserActivity, {
      capture: true
    });
    this.document.removeEventListener("visibilitychange", this.onPageVisibilityChanged);
    this.window.removeEventListener("blur", this.onWindowBlurred);
    this.window.removeEventListener("focus", this.onUserActivity);
  }
  /**
   * Return true if the user is currently 'active'
   * A user is 'active' while they are interacting with the app and for a very short (<1s)
   * time after that. This is intended to give a strong indication that the app has the
   * user's attention at any given moment.
   * @returns {boolean} true if user is currently 'active'
   */


  userActiveNow() {
    return this.activeNowTimeout.isRunning();
  }
  /**
   * Return true if the user is currently active or has been recently
   * A user is 'active recently' for a longer period of time (~2 mins) after
   * they have been 'active' and while the app still has the focus. This is
   * intended to indicate when the app may still have the user's attention
   * (or they may have gone to make tea and left the window focused).
   * @returns {boolean} true if user has been active recently
   */


  userActiveRecently() {
    return this.activeRecentlyTimeout.isRunning();
  }

  static async runTimersUntilTimeout(attachedTimers
  /*: Timer[]*/
  , timeout
  /*: Timer*/
  ) {
    attachedTimers.forEach(t => t.start());

    try {
      await timeout.finished();
    } catch (_e) {
      /* aborted */
    }

    attachedTimers.forEach(t => t.abort());
  }

}

exports.default = UserActivity;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Vc2VyQWN0aXZpdHkudHMiXSwibmFtZXMiOlsiQ1VSUkVOVExZX0FDVElWRV9USFJFU0hPTERfTVMiLCJSRUNFTlRMWV9BQ1RJVkVfVEhSRVNIT0xEX01TIiwiVXNlckFjdGl2aXR5IiwiY29uc3RydWN0b3IiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImUiLCJ2aXNpYmlsaXR5U3RhdGUiLCJhY3RpdmVOb3dUaW1lb3V0IiwiYWJvcnQiLCJhY3RpdmVSZWNlbnRseVRpbWVvdXQiLCJvblVzZXJBY3Rpdml0eSIsImV2ZW50IiwiaGFzRm9jdXMiLCJzY3JlZW5YIiwidHlwZSIsImxhc3RTY3JlZW5YIiwic2NyZWVuWSIsImxhc3RTY3JlZW5ZIiwiZGlzIiwiZGlzcGF0Y2giLCJhY3Rpb24iLCJpc1J1bm5pbmciLCJzdGFydCIsInJ1blRpbWVyc1VudGlsVGltZW91dCIsImF0dGFjaGVkQWN0aXZlTm93VGltZXJzIiwicmVzdGFydCIsImF0dGFjaGVkQWN0aXZlUmVjZW50bHlUaW1lcnMiLCJUaW1lciIsInNoYXJlZEluc3RhbmNlIiwibXhVc2VyQWN0aXZpdHkiLCJ1bmRlZmluZWQiLCJ0aW1lV2hpbGVBY3RpdmVOb3ciLCJ0aW1lciIsInRpbWVXaGlsZSIsInVzZXJBY3RpdmVOb3ciLCJ0aW1lV2hpbGVBY3RpdmVSZWNlbnRseSIsInVzZXJBY3RpdmVSZWNlbnRseSIsImF0dGFjaGVkVGltZXJzIiwiaW5kZXgiLCJpbmRleE9mIiwicHVzaCIsImZpbmlzaGVkIiwiZmluYWxseSIsInNwbGljZSIsImNhdGNoIiwiZXJyIiwiYWRkRXZlbnRMaXN0ZW5lciIsIm9uUGFnZVZpc2liaWxpdHlDaGFuZ2VkIiwib25XaW5kb3dCbHVycmVkIiwicGFzc2l2ZSIsImNhcHR1cmUiLCJzdG9wIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInRpbWVvdXQiLCJmb3JFYWNoIiwidCIsIl9lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWlCQTs7QUFDQTs7QUFsQkE7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Z2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IGRpcyBmcm9tICcuL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgVGltZXIgZnJvbSAnLi91dGlscy9UaW1lcic7XG5cbi8vIGltcG9ydGFudCB0aGVzZSBhcmUgbGFyZ2VyIHRoYW4gdGhlIHRpbWVvdXRzIG9mIHRpbWVyc1xuLy8gdXNlZCB3aXRoIFVzZXJBY3Rpdml0eS50aW1lV2hpbGVBY3RpdmUqLFxuLy8gc3VjaCBhcyBSRUFEX01BUktFUl9JTlZJRVdfVEhSRVNIT0xEX01TICh0aW1lV2hpbGVBY3RpdmVSZWNlbnRseSksXG4vLyBSRUFEX01BUktFUl9PVVRPRlZJRVdfVEhSRVNIT0xEX01TICh0aW1lV2hpbGVBY3RpdmVSZWNlbnRseSksXG4vLyBSRUFEX1JFQ0VJUFRfSU5URVJWQUxfTVMgKHRpbWVXaGlsZUFjdGl2ZU5vdykgaW4gVGltZWxpbmVQYW5lbFxuXG4vLyAnVW5kZXIgYSBmZXcgc2Vjb25kcycuIE11c3QgYmUgbGVzcyB0aGFuICdSRUNFTlRMWV9BQ1RJVkVfVEhSRVNIT0xEX01TJ1xuY29uc3QgQ1VSUkVOVExZX0FDVElWRV9USFJFU0hPTERfTVMgPSA3MDA7XG5cbi8vICdVbmRlciBhIGZldyBtaW51dGVzJy5cbmNvbnN0IFJFQ0VOVExZX0FDVElWRV9USFJFU0hPTERfTVMgPSAyICogNjAgKiAxMDAwO1xuXG4vKipcbiAqIFRoaXMgY2xhc3Mgd2F0Y2hlcyBmb3IgdXNlciBhY3Rpdml0eSAobW92aW5nIHRoZSBtb3VzZSBvciBwcmVzc2luZyBhIGtleSlcbiAqIGFuZCBzdGFydHMvc3RvcHMgYXR0YWNoZWQgdGltZXJzIHdoaWxlIHRoZSB1c2VyIGlzIGFjdGl2ZS5cbiAqXG4gKiBUaGVyZSBhcmUgdHdvIGNsYXNzZXMgb2YgJ2FjdGl2ZSc6ICdhY3RpdmUgbm93JyBhbmQgJ2FjdGl2ZSByZWNlbnRseSdcbiAqIHNlZSBkb2Mgb24gdGhlIHVzZXJBY3RpdmUqIGZ1bmN0aW9ucyBmb3Igd2hhdCB0aGVzZSBtZWFuLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBVc2VyQWN0aXZpdHkge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgYWN0aXZlTm93VGltZW91dDogVGltZXI7XG4gICAgcHJpdmF0ZSByZWFkb25seSBhY3RpdmVSZWNlbnRseVRpbWVvdXQ6IFRpbWVyO1xuICAgIHByaXZhdGUgYXR0YWNoZWRBY3RpdmVOb3dUaW1lcnM6IFRpbWVyW10gPSBbXTtcbiAgICBwcml2YXRlIGF0dGFjaGVkQWN0aXZlUmVjZW50bHlUaW1lcnM6IFRpbWVyW10gPSBbXTtcbiAgICBwcml2YXRlIGxhc3RTY3JlZW5YID0gMDtcbiAgICBwcml2YXRlIGxhc3RTY3JlZW5ZID0gMDtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgd2luZG93OiBXaW5kb3csIHByaXZhdGUgcmVhZG9ubHkgZG9jdW1lbnQ6IERvY3VtZW50KSB7XG4gICAgICAgIHRoaXMuYWN0aXZlTm93VGltZW91dCA9IG5ldyBUaW1lcihDVVJSRU5UTFlfQUNUSVZFX1RIUkVTSE9MRF9NUyk7XG4gICAgICAgIHRoaXMuYWN0aXZlUmVjZW50bHlUaW1lb3V0ID0gbmV3IFRpbWVyKFJFQ0VOVExZX0FDVElWRV9USFJFU0hPTERfTVMpO1xuICAgIH1cblxuICAgIHN0YXRpYyBzaGFyZWRJbnN0YW5jZSgpIHtcbiAgICAgICAgaWYgKHdpbmRvdy5teFVzZXJBY3Rpdml0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB3aW5kb3cubXhVc2VyQWN0aXZpdHkgPSBuZXcgVXNlckFjdGl2aXR5KHdpbmRvdywgZG9jdW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB3aW5kb3cubXhVc2VyQWN0aXZpdHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUnVucyB0aGUgZ2l2ZW4gdGltZXIgd2hpbGUgdGhlIHVzZXIgaXMgJ2FjdGl2ZSBub3cnLCBhYm9ydGluZyB3aGVuIHRoZSB1c2VyIGlzIG5vIGxvbmdlclxuICAgICAqIGNvbnNpZGVyZWQgY3VycmVudGx5IGFjdGl2ZS5cbiAgICAgKiBTZWUgdXNlckFjdGl2ZU5vdygpIGZvciB3aGF0IGl0IG1lYW5zIGZvciBhIHVzZXIgdG8gYmUgJ2FjdGl2ZScuXG4gICAgICogQ2FuIGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB3aXRoIHRoZSBzYW1lIGFscmVhZHkgcnVubmluZyB0aW1lciwgd2hpY2ggaXMgYSBOTy1PUC5cbiAgICAgKiBDYW4gYmUgY2FsbGVkIGJlZm9yZSB0aGUgdXNlciBiZWNvbWVzIGFjdGl2ZSwgaW4gd2hpY2ggY2FzZSBpdCBpcyBvbmx5IHN0YXJ0ZWRcbiAgICAgKiBsYXRlciBvbiB3aGVuIHRoZSB1c2VyIGRvZXMgYmVjb21lIGFjdGl2ZS5cbiAgICAgKiBAcGFyYW0ge1RpbWVyfSB0aW1lciB0aGUgdGltZXIgdG8gdXNlXG4gICAgICovXG4gICAgcHVibGljIHRpbWVXaGlsZUFjdGl2ZU5vdyh0aW1lcjogVGltZXIpIHtcbiAgICAgICAgdGhpcy50aW1lV2hpbGUodGltZXIsIHRoaXMuYXR0YWNoZWRBY3RpdmVOb3dUaW1lcnMpO1xuICAgICAgICBpZiAodGhpcy51c2VyQWN0aXZlTm93KCkpIHtcbiAgICAgICAgICAgIHRpbWVyLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSdW5zIHRoZSBnaXZlbiB0aW1lciB3aGlsZSB0aGUgdXNlciBpcyAnYWN0aXZlJyBub3cgb3IgcmVjZW50bHksXG4gICAgICogYWJvcnRpbmcgd2hlbiB0aGUgdXNlciBiZWNvbWVzIGluYWN0aXZlLlxuICAgICAqIFNlZSB1c2VyQWN0aXZlUmVjZW50bHkoKSBmb3Igd2hhdCBpdCBtZWFucyBmb3IgYSB1c2VyIHRvIGJlICdhY3RpdmUgcmVjZW50bHknLlxuICAgICAqIENhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgd2l0aCB0aGUgc2FtZSBhbHJlYWR5IHJ1bm5pbmcgdGltZXIsIHdoaWNoIGlzIGEgTk8tT1AuXG4gICAgICogQ2FuIGJlIGNhbGxlZCBiZWZvcmUgdGhlIHVzZXIgYmVjb21lcyBhY3RpdmUsIGluIHdoaWNoIGNhc2UgaXQgaXMgb25seSBzdGFydGVkXG4gICAgICogbGF0ZXIgb24gd2hlbiB0aGUgdXNlciBkb2VzIGJlY29tZSBhY3RpdmUuXG4gICAgICogQHBhcmFtIHtUaW1lcn0gdGltZXIgdGhlIHRpbWVyIHRvIHVzZVxuICAgICAqL1xuICAgIHB1YmxpYyB0aW1lV2hpbGVBY3RpdmVSZWNlbnRseSh0aW1lcjogVGltZXIpIHtcbiAgICAgICAgdGhpcy50aW1lV2hpbGUodGltZXIsIHRoaXMuYXR0YWNoZWRBY3RpdmVSZWNlbnRseVRpbWVycyk7XG4gICAgICAgIGlmICh0aGlzLnVzZXJBY3RpdmVSZWNlbnRseSgpKSB7XG4gICAgICAgICAgICB0aW1lci5zdGFydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0aW1lV2hpbGUodGltZXI6IFRpbWVyLCBhdHRhY2hlZFRpbWVyczogVGltZXJbXSkge1xuICAgICAgICAvLyBpbXBvcnRhbnQgdGhpcyBoYXBwZW5zIGZpcnN0XG4gICAgICAgIGNvbnN0IGluZGV4ID0gYXR0YWNoZWRUaW1lcnMuaW5kZXhPZih0aW1lcik7XG4gICAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgIGF0dGFjaGVkVGltZXJzLnB1c2godGltZXIpO1xuICAgICAgICAgICAgLy8gcmVtb3ZlIHdoZW4gZG9uZSBvciBhYm9ydGVkXG4gICAgICAgICAgICB0aW1lci5maW5pc2hlZCgpLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gYXR0YWNoZWRUaW1lcnMuaW5kZXhPZih0aW1lcik7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkgeyAvLyBzaG91bGQgbmV2ZXIgYmUgLTFcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNoZWRUaW1lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhcyB3ZSBmb3JrIHRoZSBwcm9taXNlIGhlcmUsXG4gICAgICAgICAgICAvLyBhdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uIHdhcm5pbmdzXG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7fSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdGFydCBsaXN0ZW5pbmcgdG8gdXNlciBhY3Rpdml0eVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGFydCgpIHtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vblVzZXJBY3Rpdml0eSk7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgdGhpcy5vblBhZ2VWaXNpYmlsaXR5Q2hhbmdlZCk7XG4gICAgICAgIHRoaXMud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIHRoaXMub25XaW5kb3dCbHVycmVkKTtcbiAgICAgICAgdGhpcy53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgICAgICAvLyBjYW4ndCB1c2UgZG9jdW1lbnQuc2Nyb2xsIGhlcmUgYmVjYXVzZSB0aGF0J3Mgb25seSB0aGUgZG9jdW1lbnRcbiAgICAgICAgLy8gaXRzZWxmIGJlaW5nIHNjcm9sbGVkLiBOZWVkIHRvIHVzZSBhZGRFdmVudExpc3RlbmVyJ3MgdXNlQ2FwdHVyZS5cbiAgICAgICAgLy8gYWxzbyB0aGlzIG5lZWRzIHRvIGJlIHRoZSB3aGVlbCBldmVudCwgbm90IHNjcm9sbCwgYXMgc2Nyb2xsIGlzXG4gICAgICAgIC8vIGZpcmVkIHdoZW4gdGhlIHZpZXcgc2Nyb2xscyBkb3duIGZvciBhIG5ldyBtZXNzYWdlLlxuICAgICAgICB0aGlzLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd3aGVlbCcsIHRoaXMub25Vc2VyQWN0aXZpdHksIHtcbiAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgICBjYXB0dXJlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9wIHRyYWNraW5nIHVzZXIgYWN0aXZpdHlcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RvcCgpIHtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vblVzZXJBY3Rpdml0eSk7XG4gICAgICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3doZWVsJywgdGhpcy5vblVzZXJBY3Rpdml0eSwge1xuICAgICAgICAgICAgY2FwdHVyZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgdGhpcy5vblBhZ2VWaXNpYmlsaXR5Q2hhbmdlZCk7XG4gICAgICAgIHRoaXMud2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJibHVyXCIsIHRoaXMub25XaW5kb3dCbHVycmVkKTtcbiAgICAgICAgdGhpcy53aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImZvY3VzXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB1c2VyIGlzIGN1cnJlbnRseSAnYWN0aXZlJ1xuICAgICAqIEEgdXNlciBpcyAnYWN0aXZlJyB3aGlsZSB0aGV5IGFyZSBpbnRlcmFjdGluZyB3aXRoIHRoZSBhcHAgYW5kIGZvciBhIHZlcnkgc2hvcnQgKDwxcylcbiAgICAgKiB0aW1lIGFmdGVyIHRoYXQuIFRoaXMgaXMgaW50ZW5kZWQgdG8gZ2l2ZSBhIHN0cm9uZyBpbmRpY2F0aW9uIHRoYXQgdGhlIGFwcCBoYXMgdGhlXG4gICAgICogdXNlcidzIGF0dGVudGlvbiBhdCBhbnkgZ2l2ZW4gbW9tZW50LlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHVzZXIgaXMgY3VycmVudGx5ICdhY3RpdmUnXG4gICAgICovXG4gICAgcHVibGljIHVzZXJBY3RpdmVOb3coKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU5vd1RpbWVvdXQuaXNSdW5uaW5nKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHVzZXIgaXMgY3VycmVudGx5IGFjdGl2ZSBvciBoYXMgYmVlbiByZWNlbnRseVxuICAgICAqIEEgdXNlciBpcyAnYWN0aXZlIHJlY2VudGx5JyBmb3IgYSBsb25nZXIgcGVyaW9kIG9mIHRpbWUgKH4yIG1pbnMpIGFmdGVyXG4gICAgICogdGhleSBoYXZlIGJlZW4gJ2FjdGl2ZScgYW5kIHdoaWxlIHRoZSBhcHAgc3RpbGwgaGFzIHRoZSBmb2N1cy4gVGhpcyBpc1xuICAgICAqIGludGVuZGVkIHRvIGluZGljYXRlIHdoZW4gdGhlIGFwcCBtYXkgc3RpbGwgaGF2ZSB0aGUgdXNlcidzIGF0dGVudGlvblxuICAgICAqIChvciB0aGV5IG1heSBoYXZlIGdvbmUgdG8gbWFrZSB0ZWEgYW5kIGxlZnQgdGhlIHdpbmRvdyBmb2N1c2VkKS5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB1c2VyIGhhcyBiZWVuIGFjdGl2ZSByZWNlbnRseVxuICAgICAqL1xuICAgIHB1YmxpYyB1c2VyQWN0aXZlUmVjZW50bHkoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVJlY2VudGx5VGltZW91dC5pc1J1bm5pbmcoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uUGFnZVZpc2liaWxpdHlDaGFuZ2VkID0gZSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50LnZpc2liaWxpdHlTdGF0ZSA9PT0gXCJoaWRkZW5cIikge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOb3dUaW1lb3V0LmFib3J0KCk7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJlY2VudGx5VGltZW91dC5hYm9ydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5vblVzZXJBY3Rpdml0eShlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uV2luZG93Qmx1cnJlZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5hY3RpdmVOb3dUaW1lb3V0LmFib3J0KCk7XG4gICAgICAgIHRoaXMuYWN0aXZlUmVjZW50bHlUaW1lb3V0LmFib3J0KCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Vc2VyQWN0aXZpdHkgPSAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGFueXRoaW5nIGlmIHRoZSB3aW5kb3cgaXNuJ3QgZm9jdXNlZFxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnQuaGFzRm9jdXMoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmIChldmVudC5zY3JlZW5YICYmIGV2ZW50LnR5cGUgPT09IFwibW91c2Vtb3ZlXCIpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5zY3JlZW5YID09PSB0aGlzLmxhc3RTY3JlZW5YICYmIGV2ZW50LnNjcmVlblkgPT09IHRoaXMubGFzdFNjcmVlblkpIHtcbiAgICAgICAgICAgICAgICAvLyBtb3VzZSBoYXNuJ3QgYWN0dWFsbHkgbW92ZWRcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxhc3RTY3JlZW5YID0gZXZlbnQuc2NyZWVuWDtcbiAgICAgICAgICAgIHRoaXMubGFzdFNjcmVlblkgPSBldmVudC5zY3JlZW5ZO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246ICd1c2VyX2FjdGl2aXR5J30pO1xuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlTm93VGltZW91dC5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVOb3dUaW1lb3V0LnN0YXJ0KCk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ3VzZXJfYWN0aXZpdHlfc3RhcnQnfSk7XG5cbiAgICAgICAgICAgIFVzZXJBY3Rpdml0eS5ydW5UaW1lcnNVbnRpbFRpbWVvdXQodGhpcy5hdHRhY2hlZEFjdGl2ZU5vd1RpbWVycywgdGhpcy5hY3RpdmVOb3dUaW1lb3V0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlTm93VGltZW91dC5yZXN0YXJ0KCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuYWN0aXZlUmVjZW50bHlUaW1lb3V0LmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVJlY2VudGx5VGltZW91dC5zdGFydCgpO1xuXG4gICAgICAgICAgICBVc2VyQWN0aXZpdHkucnVuVGltZXJzVW50aWxUaW1lb3V0KHRoaXMuYXR0YWNoZWRBY3RpdmVSZWNlbnRseVRpbWVycywgdGhpcy5hY3RpdmVSZWNlbnRseVRpbWVvdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVSZWNlbnRseVRpbWVvdXQucmVzdGFydCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc3RhdGljIGFzeW5jIHJ1blRpbWVyc1VudGlsVGltZW91dChhdHRhY2hlZFRpbWVyczogVGltZXJbXSwgdGltZW91dDogVGltZXIpIHtcbiAgICAgICAgYXR0YWNoZWRUaW1lcnMuZm9yRWFjaCgodCkgPT4gdC5zdGFydCgpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHRpbWVvdXQuZmluaXNoZWQoKTtcbiAgICAgICAgfSBjYXRjaCAoX2UpIHsgLyogYWJvcnRlZCAqLyB9XG4gICAgICAgIGF0dGFjaGVkVGltZXJzLmZvckVhY2goKHQpID0+IHQuYWJvcnQoKSk7XG4gICAgfVxufVxuIl19