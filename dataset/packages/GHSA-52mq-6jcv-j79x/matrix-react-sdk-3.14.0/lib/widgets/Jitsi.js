"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Jitsi = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _SdkConfig = _interopRequireDefault(require("../SdkConfig"));

var _MatrixClientPeg = require("../MatrixClientPeg");

/*
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
const JITSI_WK_PROPERTY = "im.vector.riot.jitsi";
/*:: export interface JitsiWidgetData {
    conferenceId: string;
    isAudioOnly: boolean;
    domain: string;
}*/

class Jitsi {
  constructor() {
    (0, _defineProperty2.default)(this, "domain", void 0);
    (0, _defineProperty2.default)(this, "update", async discoveryResponse =>
    /*: Promise<any>*/
    {
      // Start with a default of the config's domain
      let domain = (_SdkConfig.default.get()['jitsi'] || {})['preferredDomain'] || 'jitsi.riot.im';
      console.log("Attempting to get Jitsi conference information from homeserver");

      if (discoveryResponse && discoveryResponse[JITSI_WK_PROPERTY]) {
        const wkPreferredDomain = discoveryResponse[JITSI_WK_PROPERTY]['preferredDomain'];
        if (wkPreferredDomain) domain = wkPreferredDomain;
      } // Put the result into memory for us to use later


      this.domain = domain;
      console.log("Jitsi conference domain:", this.preferredDomain);
    });
  }

  get preferredDomain()
  /*: string*/
  {
    return this.domain || 'jitsi.riot.im';
  }
  /**
   * Checks for auth needed by looking up a well-known file
   *
   * If the file does not exist, we assume no auth.
   *
   * See https://github.com/matrix-org/prosody-mod-auth-matrix-user-verification
   */


  async getJitsiAuth()
  /*: Promise<string|null>*/
  {
    if (!this.preferredDomain) {
      return null;
    }

    let data;

    try {
      const response = await fetch(`https://${this.preferredDomain}/.well-known/element/jitsi`);
      data = await response.json();
    } catch (error) {
      return null;
    }

    if (data.auth) {
      return data.auth;
    }

    return null;
  }

  start() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    cli.on("WellKnown.client", this.update); // call update initially in case we missed the first WellKnown.client event and for if no well-known present

    this.update(cli.getClientWellKnown());
  }

  /**
   * Parses the given URL into the data needed for a Jitsi widget, if the widget
   * URL matches the preferredDomain for the app.
   * @param {string} url The URL to parse.
   * @returns {JitsiWidgetData} The widget data if eligible, otherwise null.
   */
  parsePreferredConferenceUrl(url
  /*: string*/
  )
  /*: JitsiWidgetData*/
  {
    const parsed = new URL(url);
    if (parsed.hostname !== this.preferredDomain) return null; // invalid

    return {
      conferenceId: parsed.pathname,
      domain: parsed.hostname,
      isAudioOnly: false
    };
  }

  static getInstance()
  /*: Jitsi*/
  {
    if (!Jitsi.instance) {
      Jitsi.instance = new Jitsi();
    }

    return Jitsi.instance;
  }

}

exports.Jitsi = Jitsi;
(0, _defineProperty2.default)(Jitsi, "instance", void 0);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93aWRnZXRzL0ppdHNpLnRzIl0sIm5hbWVzIjpbIkpJVFNJX1dLX1BST1BFUlRZIiwiSml0c2kiLCJkaXNjb3ZlcnlSZXNwb25zZSIsImRvbWFpbiIsIlNka0NvbmZpZyIsImdldCIsImNvbnNvbGUiLCJsb2ciLCJ3a1ByZWZlcnJlZERvbWFpbiIsInByZWZlcnJlZERvbWFpbiIsImdldEppdHNpQXV0aCIsImRhdGEiLCJyZXNwb25zZSIsImZldGNoIiwianNvbiIsImVycm9yIiwiYXV0aCIsInN0YXJ0IiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwib24iLCJ1cGRhdGUiLCJnZXRDbGllbnRXZWxsS25vd24iLCJwYXJzZVByZWZlcnJlZENvbmZlcmVuY2VVcmwiLCJ1cmwiLCJwYXJzZWQiLCJVUkwiLCJob3N0bmFtZSIsImNvbmZlcmVuY2VJZCIsInBhdGhuYW1lIiwiaXNBdWRpb09ubHkiLCJnZXRJbnN0YW5jZSIsImluc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBS0EsTUFBTUEsaUJBQWlCLEdBQUcsc0JBQTFCOztBQW5CQTtBQUNBO0FBQ0E7QUFDQTs7QUF3Qk8sTUFBTUMsS0FBTixDQUFZO0FBQUE7QUFBQTtBQUFBLGtEQXdDRSxNQUFPQyxpQkFBUDtBQUFBO0FBQTJDO0FBQ3hEO0FBQ0EsVUFBSUMsTUFBTSxHQUFHLENBQUNDLG1CQUFVQyxHQUFWLEdBQWdCLE9BQWhCLEtBQTRCLEVBQTdCLEVBQWlDLGlCQUFqQyxLQUF1RCxlQUFwRTtBQUVBQyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxnRUFBWjs7QUFDQSxVQUFJTCxpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNGLGlCQUFELENBQTFDLEVBQStEO0FBQzNELGNBQU1RLGlCQUFpQixHQUFHTixpQkFBaUIsQ0FBQ0YsaUJBQUQsQ0FBakIsQ0FBcUMsaUJBQXJDLENBQTFCO0FBQ0EsWUFBSVEsaUJBQUosRUFBdUJMLE1BQU0sR0FBR0ssaUJBQVQ7QUFDMUIsT0FSdUQsQ0FVeEQ7OztBQUNBLFdBQUtMLE1BQUwsR0FBY0EsTUFBZDtBQUNBRyxNQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSwwQkFBWixFQUF3QyxLQUFLRSxlQUE3QztBQUNILEtBckRjO0FBQUE7O0FBS2YsTUFBV0EsZUFBWDtBQUFBO0FBQXFDO0FBQ2pDLFdBQU8sS0FBS04sTUFBTCxJQUFlLGVBQXRCO0FBQ0g7QUFFRDtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBQ0ksUUFBYU8sWUFBYjtBQUFBO0FBQWtEO0FBQzlDLFFBQUksQ0FBQyxLQUFLRCxlQUFWLEVBQTJCO0FBQ3ZCLGFBQU8sSUFBUDtBQUNIOztBQUNELFFBQUlFLElBQUo7O0FBQ0EsUUFBSTtBQUNBLFlBQU1DLFFBQVEsR0FBRyxNQUFNQyxLQUFLLENBQUUsV0FBVSxLQUFLSixlQUFnQiw0QkFBakMsQ0FBNUI7QUFDQUUsTUFBQUEsSUFBSSxHQUFHLE1BQU1DLFFBQVEsQ0FBQ0UsSUFBVCxFQUFiO0FBQ0gsS0FIRCxDQUdFLE9BQU9DLEtBQVAsRUFBYztBQUNaLGFBQU8sSUFBUDtBQUNIOztBQUNELFFBQUlKLElBQUksQ0FBQ0ssSUFBVCxFQUFlO0FBQ1gsYUFBT0wsSUFBSSxDQUFDSyxJQUFaO0FBQ0g7O0FBQ0QsV0FBTyxJQUFQO0FBQ0g7O0FBRU1DLEVBQUFBLEtBQVAsR0FBZTtBQUNYLFVBQU1DLEdBQUcsR0FBR0MsaUNBQWdCZCxHQUFoQixFQUFaOztBQUNBYSxJQUFBQSxHQUFHLENBQUNFLEVBQUosQ0FBTyxrQkFBUCxFQUEyQixLQUFLQyxNQUFoQyxFQUZXLENBR1g7O0FBQ0EsU0FBS0EsTUFBTCxDQUFZSCxHQUFHLENBQUNJLGtCQUFKLEVBQVo7QUFDSDs7QUFpQkQ7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ1dDLEVBQUFBLDJCQUFQLENBQW1DQztBQUFuQztBQUFBO0FBQUE7QUFBaUU7QUFDN0QsVUFBTUMsTUFBTSxHQUFHLElBQUlDLEdBQUosQ0FBUUYsR0FBUixDQUFmO0FBQ0EsUUFBSUMsTUFBTSxDQUFDRSxRQUFQLEtBQW9CLEtBQUtsQixlQUE3QixFQUE4QyxPQUFPLElBQVAsQ0FGZSxDQUVGOztBQUMzRCxXQUFPO0FBQ0htQixNQUFBQSxZQUFZLEVBQUVILE1BQU0sQ0FBQ0ksUUFEbEI7QUFFSDFCLE1BQUFBLE1BQU0sRUFBRXNCLE1BQU0sQ0FBQ0UsUUFGWjtBQUdIRyxNQUFBQSxXQUFXLEVBQUU7QUFIVixLQUFQO0FBS0g7O0FBRUQsU0FBY0MsV0FBZDtBQUFBO0FBQW1DO0FBQy9CLFFBQUksQ0FBQzlCLEtBQUssQ0FBQytCLFFBQVgsRUFBcUI7QUFDakIvQixNQUFBQSxLQUFLLENBQUMrQixRQUFOLEdBQWlCLElBQUkvQixLQUFKLEVBQWpCO0FBQ0g7O0FBQ0QsV0FBT0EsS0FBSyxDQUFDK0IsUUFBYjtBQUNIOztBQTVFYzs7OzhCQUFOL0IsSyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBTZGtDb25maWcgZnJvbSBcIi4uL1Nka0NvbmZpZ1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi9NYXRyaXhDbGllbnRQZWdcIjtcblxuY29uc3QgSklUU0lfV0tfUFJPUEVSVFkgPSBcImltLnZlY3Rvci5yaW90LmppdHNpXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSml0c2lXaWRnZXREYXRhIHtcbiAgICBjb25mZXJlbmNlSWQ6IHN0cmluZztcbiAgICBpc0F1ZGlvT25seTogYm9vbGVhbjtcbiAgICBkb21haW46IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIEppdHNpIHtcbiAgICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogSml0c2k7XG5cbiAgICBwcml2YXRlIGRvbWFpbjogc3RyaW5nO1xuXG4gICAgcHVibGljIGdldCBwcmVmZXJyZWREb21haW4oKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9tYWluIHx8ICdqaXRzaS5yaW90LmltJztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDaGVja3MgZm9yIGF1dGggbmVlZGVkIGJ5IGxvb2tpbmcgdXAgYSB3ZWxsLWtub3duIGZpbGVcbiAgICAgKlxuICAgICAqIElmIHRoZSBmaWxlIGRvZXMgbm90IGV4aXN0LCB3ZSBhc3N1bWUgbm8gYXV0aC5cbiAgICAgKlxuICAgICAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbWF0cml4LW9yZy9wcm9zb2R5LW1vZC1hdXRoLW1hdHJpeC11c2VyLXZlcmlmaWNhdGlvblxuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBnZXRKaXRzaUF1dGgoKTogUHJvbWlzZTxzdHJpbmd8bnVsbD4ge1xuICAgICAgICBpZiAoIXRoaXMucHJlZmVycmVkRG9tYWluKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vJHt0aGlzLnByZWZlcnJlZERvbWFpbn0vLndlbGwta25vd24vZWxlbWVudC9qaXRzaWApO1xuICAgICAgICAgICAgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhLmF1dGgpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmF1dGg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0KCkge1xuICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgIGNsaS5vbihcIldlbGxLbm93bi5jbGllbnRcIiwgdGhpcy51cGRhdGUpO1xuICAgICAgICAvLyBjYWxsIHVwZGF0ZSBpbml0aWFsbHkgaW4gY2FzZSB3ZSBtaXNzZWQgdGhlIGZpcnN0IFdlbGxLbm93bi5jbGllbnQgZXZlbnQgYW5kIGZvciBpZiBubyB3ZWxsLWtub3duIHByZXNlbnRcbiAgICAgICAgdGhpcy51cGRhdGUoY2xpLmdldENsaWVudFdlbGxLbm93bigpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZSA9IGFzeW5jIChkaXNjb3ZlcnlSZXNwb25zZSk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBkZWZhdWx0IG9mIHRoZSBjb25maWcncyBkb21haW5cbiAgICAgICAgbGV0IGRvbWFpbiA9IChTZGtDb25maWcuZ2V0KClbJ2ppdHNpJ10gfHwge30pWydwcmVmZXJyZWREb21haW4nXSB8fCAnaml0c2kucmlvdC5pbSc7XG5cbiAgICAgICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIHRvIGdldCBKaXRzaSBjb25mZXJlbmNlIGluZm9ybWF0aW9uIGZyb20gaG9tZXNlcnZlclwiKTtcbiAgICAgICAgaWYgKGRpc2NvdmVyeVJlc3BvbnNlICYmIGRpc2NvdmVyeVJlc3BvbnNlW0pJVFNJX1dLX1BST1BFUlRZXSkge1xuICAgICAgICAgICAgY29uc3Qgd2tQcmVmZXJyZWREb21haW4gPSBkaXNjb3ZlcnlSZXNwb25zZVtKSVRTSV9XS19QUk9QRVJUWV1bJ3ByZWZlcnJlZERvbWFpbiddO1xuICAgICAgICAgICAgaWYgKHdrUHJlZmVycmVkRG9tYWluKSBkb21haW4gPSB3a1ByZWZlcnJlZERvbWFpbjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFB1dCB0aGUgcmVzdWx0IGludG8gbWVtb3J5IGZvciB1cyB0byB1c2UgbGF0ZXJcbiAgICAgICAgdGhpcy5kb21haW4gPSBkb21haW47XG4gICAgICAgIGNvbnNvbGUubG9nKFwiSml0c2kgY29uZmVyZW5jZSBkb21haW46XCIsIHRoaXMucHJlZmVycmVkRG9tYWluKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUGFyc2VzIHRoZSBnaXZlbiBVUkwgaW50byB0aGUgZGF0YSBuZWVkZWQgZm9yIGEgSml0c2kgd2lkZ2V0LCBpZiB0aGUgd2lkZ2V0XG4gICAgICogVVJMIG1hdGNoZXMgdGhlIHByZWZlcnJlZERvbWFpbiBmb3IgdGhlIGFwcC5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsIFRoZSBVUkwgdG8gcGFyc2UuXG4gICAgICogQHJldHVybnMge0ppdHNpV2lkZ2V0RGF0YX0gVGhlIHdpZGdldCBkYXRhIGlmIGVsaWdpYmxlLCBvdGhlcndpc2UgbnVsbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgcGFyc2VQcmVmZXJyZWRDb25mZXJlbmNlVXJsKHVybDogc3RyaW5nKTogSml0c2lXaWRnZXREYXRhIHtcbiAgICAgICAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCh1cmwpO1xuICAgICAgICBpZiAocGFyc2VkLmhvc3RuYW1lICE9PSB0aGlzLnByZWZlcnJlZERvbWFpbikgcmV0dXJuIG51bGw7IC8vIGludmFsaWRcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvbmZlcmVuY2VJZDogcGFyc2VkLnBhdGhuYW1lLFxuICAgICAgICAgICAgZG9tYWluOiBwYXJzZWQuaG9zdG5hbWUsXG4gICAgICAgICAgICBpc0F1ZGlvT25seTogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBKaXRzaSB7XG4gICAgICAgIGlmICghSml0c2kuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIEppdHNpLmluc3RhbmNlID0gbmV3IEppdHNpKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEppdHNpLmluc3RhbmNlO1xuICAgIH1cbn1cbiJdfQ==