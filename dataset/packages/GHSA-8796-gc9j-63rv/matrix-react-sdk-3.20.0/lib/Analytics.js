"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Analytics = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("./languageHandler");

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _Modal = _interopRequireDefault(require("./Modal"));

var sdk = _interopRequireWildcard(require("./index"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const hashRegex = /#\/(groups?|room|user|settings|register|login|forgot_password|home|directory)/;
const hashVarRegex = /#\/(group|room|user)\/.*$/; // Remove all but the first item in the hash path. Redact unexpected hashes.

function getRedactedHash(hash
/*: string*/
)
/*: string*/
{
  // Don't leak URLs we aren't expecting - they could contain tokens/PII
  const match = hashRegex.exec(hash);

  if (!match) {
    console.warn(`Unexpected hash location "${hash}"`);
    return '#/<unexpected hash location>';
  }

  if (hashVarRegex.test(hash)) {
    return hash.replace(hashVarRegex, "#/$1/<redacted>");
  }

  return hash.replace(hashRegex, "#/$1");
} // Return the current origin, path and hash separated with a `/`. This does
// not include query parameters.


function getRedactedUrl()
/*: string*/
{
  const {
    origin,
    hash
  } = window.location;
  let {
    pathname
  } = window.location; // Redact paths which could contain unexpected PII

  if (origin.startsWith('file://')) {
    pathname = "/<redacted>/";
  }

  return origin + pathname + getRedactedHash(hash);
}

const customVariables
/*: Record<string, IVariable>*/
= {
  // The Matomo installation at https://matomo.riot.im is currently configured
  // with a limit of 10 custom variables.
  'App Platform': {
    id: 1,
    expl: (0, _languageHandler._td)('The platform you\'re on'),
    example: 'Electron Platform'
  },
  'App Version': {
    id: 2,
    expl: (0, _languageHandler._td)('The version of %(brand)s'),
    getTextVariables: () => ({
      brand: _SdkConfig.default.get().brand
    }),
    example: '15.0.0'
  },
  'User Type': {
    id: 3,
    expl: (0, _languageHandler._td)('Whether or not you\'re logged in (we don\'t record your username)'),
    example: 'Logged In'
  },
  'Chosen Language': {
    id: 4,
    expl: (0, _languageHandler._td)('Your language of choice'),
    example: 'en'
  },
  'Instance': {
    id: 5,
    expl: (0, _languageHandler._td)('Which officially provided instance you are using, if any'),
    example: 'app'
  },
  'RTE: Uses Richtext Mode': {
    id: 6,
    expl: (0, _languageHandler._td)('Whether or not you\'re using the Richtext mode of the Rich Text Editor'),
    example: 'off'
  },
  'Homeserver URL': {
    id: 7,
    expl: (0, _languageHandler._td)('Your homeserver\'s URL'),
    example: 'https://matrix.org'
  },
  'Touch Input': {
    id: 8,
    expl: (0, _languageHandler._td)("Whether you're using %(brand)s on a device where touch is the primary input mechanism"),
    getTextVariables: () => ({
      brand: _SdkConfig.default.get().brand
    }),
    example: 'false'
  },
  'Breadcrumbs': {
    id: 9,
    expl: (0, _languageHandler._td)("Whether or not you're using the 'breadcrumbs' feature (avatars above the room list)"),
    example: 'disabled'
  },
  'Installed PWA': {
    id: 10,
    expl: (0, _languageHandler._td)("Whether you're using %(brand)s as an installed Progressive Web App"),
    getTextVariables: () => ({
      brand: _SdkConfig.default.get().brand
    }),
    example: 'false'
  }
};

function whitelistRedact(whitelist
/*: string[]*/
, str
/*: string*/
)
/*: string*/
{
  if (whitelist.includes(str)) return str;
  return '<redacted>';
}

const UID_KEY = "mx_Riot_Analytics_uid";
const CREATION_TS_KEY = "mx_Riot_Analytics_cts";
const VISIT_COUNT_KEY = "mx_Riot_Analytics_vc";
const LAST_VISIT_TS_KEY = "mx_Riot_Analytics_lvts";

function getUid()
/*: string*/
{
  try {
    let data = localStorage && localStorage.getItem(UID_KEY);

    if (!data && localStorage) {
      localStorage.setItem(UID_KEY, data = [...Array(16)].map(() => Math.random().toString(16)[2]).join(''));
    }

    return data;
  } catch (e) {
    console.error("Analytics error: ", e);
    return "";
  }
}

const HEARTBEAT_INTERVAL = 30 * 1000; // seconds

class Analytics {
  // {[id: number]: [name: string, value: string]}
  constructor() {
    (0, _defineProperty2.default)(this, "baseUrl", null);
    (0, _defineProperty2.default)(this, "siteId", null);
    (0, _defineProperty2.default)(this, "visitVariables", {});
    (0, _defineProperty2.default)(this, "firstPage", true);
    (0, _defineProperty2.default)(this, "heartbeatIntervalID", null);
    (0, _defineProperty2.default)(this, "creationTs", void 0);
    (0, _defineProperty2.default)(this, "lastVisitTs", void 0);
    (0, _defineProperty2.default)(this, "visitCount", void 0);
    (0, _defineProperty2.default)(this, "showDetailsModal", () => {
      let rows = [];

      if (!this.disabled) {
        rows = Object.values(this.visitVariables);
      } else {
        rows = Object.keys(customVariables).map(k => [k, (0, _languageHandler._t)('e.g. %(exampleValue)s', {
          exampleValue: customVariables[k].example
        })]);
      }

      const resolution = `${window.screen.width}x${window.screen.height}`;
      const otherVariables = [{
        expl: (0, _languageHandler._td)('Every page you use in the app'),
        value: (0, _languageHandler._t)('e.g. <CurrentPageURL>', {}, {
          CurrentPageURL: getRedactedUrl
        })
      }, {
        expl: (0, _languageHandler._td)('Your user agent'),
        value: navigator.userAgent
      }, {
        expl: (0, _languageHandler._td)('Your device resolution'),
        value: resolution
      }];
      const ErrorDialog = sdk.getComponent('dialogs.ErrorDialog');

      _Modal.default.createTrackedDialog('Analytics Details', '', ErrorDialog, {
        title: (0, _languageHandler._t)('Analytics'),
        description: /*#__PURE__*/_react.default.createElement("div", {
          className: "mx_AnalyticsModal"
        }, /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('The information being sent to us to help make %(brand)s better includes:', {
          brand: _SdkConfig.default.get().brand
        })), /*#__PURE__*/_react.default.createElement("table", null, rows.map(row => /*#__PURE__*/_react.default.createElement("tr", {
          key: row[0]
        }, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)(customVariables[row[0]].expl, customVariables[row[0]].getTextVariables ? customVariables[row[0]].getTextVariables() : null)), row[1] !== undefined && /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, row[1])))), otherVariables.map((item, index) => /*#__PURE__*/_react.default.createElement("tr", {
          key: index
        }, /*#__PURE__*/_react.default.createElement("td", null, (0, _languageHandler._t)(item.expl)), /*#__PURE__*/_react.default.createElement("td", null, /*#__PURE__*/_react.default.createElement("code", null, item.value))))), /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)('Where this page includes identifiable information, such as a room, ' + 'user or group ID, that data is removed before being sent to the server.')))
      });
    });
    this.creationTs = localStorage && localStorage.getItem(CREATION_TS_KEY);

    if (!this.creationTs && localStorage) {
      localStorage.setItem(CREATION_TS_KEY, this.creationTs = String(new Date().getTime()));
    }

    this.lastVisitTs = localStorage && localStorage.getItem(LAST_VISIT_TS_KEY);
    this.visitCount = localStorage && localStorage.getItem(VISIT_COUNT_KEY) || "0";
    this.visitCount = String(parseInt(this.visitCount, 10) + 1); // increment

    if (localStorage) {
      localStorage.setItem(VISIT_COUNT_KEY, this.visitCount);
    }
  }

  get disabled() {
    return !this.baseUrl;
  }

  canEnable() {
    const config = _SdkConfig.default.get();

    return navigator.doNotTrack !== "1" && config && config.piwik && config.piwik.url && config.piwik.siteId;
  }
  /**
   * Enable Analytics if initialized but disabled
   * otherwise try and initalize, no-op if piwik config missing
   */


  async enable() {
    if (!this.disabled) return;
    if (!this.canEnable()) return;

    const config = _SdkConfig.default.get();

    this.baseUrl = new URL("piwik.php", config.piwik.url); // set constants

    this.baseUrl.searchParams.set("rec", "1"); // rec is required for tracking

    this.baseUrl.searchParams.set("idsite", config.piwik.siteId); // rec is required for tracking

    this.baseUrl.searchParams.set("apiv", "1"); // API version to use

    this.baseUrl.searchParams.set("send_image", "0"); // we want a 204, not a tiny GIF
    // set user parameters

    this.baseUrl.searchParams.set("_id", getUid()); // uuid

    this.baseUrl.searchParams.set("_idts", this.creationTs); // first ts

    this.baseUrl.searchParams.set("_idvc", this.visitCount); // visit count

    if (this.lastVisitTs) {
      this.baseUrl.searchParams.set("_viewts", this.lastVisitTs); // last visit ts
    }

    const platform = _PlatformPeg.default.get();

    this.setVisitVariable('App Platform', platform.getHumanReadableName());

    try {
      this.setVisitVariable('App Version', await platform.getAppVersion());
    } catch (e) {
      this.setVisitVariable('App Version', 'unknown');
    }

    this.setVisitVariable('Chosen Language', (0, _languageHandler.getCurrentLanguage)());
    const hostname = window.location.hostname;

    if (hostname === 'riot.im') {
      this.setVisitVariable('Instance', window.location.pathname);
    } else if (hostname.endsWith('.element.io')) {
      this.setVisitVariable('Instance', hostname.replace('.element.io', ''));
    }

    let installedPWA = "unknown";

    try {
      // Known to work at least for desktop Chrome
      installedPWA = String(window.matchMedia('(display-mode: standalone)').matches);
    } catch (e) {}

    this.setVisitVariable('Installed PWA', installedPWA);
    let touchInput = "unknown";

    try {
      // MDN claims broad support across browsers
      touchInput = String(window.matchMedia('(pointer: coarse)').matches);
    } catch (e) {}

    this.setVisitVariable('Touch Input', touchInput); // start heartbeat

    this.heartbeatIntervalID = window.setInterval(this.ping.bind(this), HEARTBEAT_INTERVAL);
  }
  /**
   * Disable Analytics, stop the heartbeat and clear identifiers from localStorage
   */


  disable() {
    if (this.disabled) return;
    this.trackEvent('Analytics', 'opt-out');
    window.clearInterval(this.heartbeatIntervalID);
    this.baseUrl = null;
    this.visitVariables = {};
    localStorage.removeItem(UID_KEY);
    localStorage.removeItem(CREATION_TS_KEY);
    localStorage.removeItem(VISIT_COUNT_KEY);
    localStorage.removeItem(LAST_VISIT_TS_KEY);
  }

  async _track(data
  /*: IData*/
  ) {
    if (this.disabled) return;
    const now = new Date();

    const params = _objectSpread(_objectSpread({}, data), {}, {
      url: getRedactedUrl(),
      _cvar: JSON.stringify(this.visitVariables),
      // user custom vars
      res: `${window.screen.width}x${window.screen.height}`,
      // resolution as WWWWxHHHH
      rand: String(Math.random()).slice(2, 8),
      // random nonce to cache-bust
      h: now.getHours(),
      m: now.getMinutes(),
      s: now.getSeconds()
    });

    const url = new URL(this.baseUrl.toString()); // copy

    for (const key in params) {
      url.searchParams.set(key, params[key]);
    }

    try {
      await window.fetch(url.toString(), {
        method: "GET",
        mode: "no-cors",
        cache: "no-cache",
        redirect: "follow"
      });
    } catch (e) {
      console.error("Analytics error: ", e);
    }
  }

  ping() {
    this._track({
      ping: "1"
    });

    localStorage.setItem(LAST_VISIT_TS_KEY, String(new Date().getTime())); // update last visit ts
  }

  trackPageChange(generationTimeMs
  /*: number*/
  ) {
    if (this.disabled) return;

    if (this.firstPage) {
      // De-duplicate first page
      // router seems to hit the fn twice
      this.firstPage = false;
      return;
    }

    if (typeof generationTimeMs !== 'number') {
      console.warn('Analytics.trackPageChange: expected generationTimeMs to be a number'); // But continue anyway because we still want to track the change
    }

    this._track({
      gt_ms: String(generationTimeMs)
    });
  }

  trackEvent(category
  /*: string*/
  , action
  /*: string*/
  , name
  /*: string*/
  , value
  /*: string*/
  ) {
    if (this.disabled) return;

    this._track({
      e_c: category,
      e_a: action,
      e_n: name,
      e_v: value
    });
  }

  setVisitVariable(key
  /*: keyof typeof customVariables*/
  , value
  /*: string*/
  ) {
    if (this.disabled) return;
    this.visitVariables[customVariables[key].id] = [key, value];
  }

  setLoggedIn(isGuest
  /*: boolean*/
  , homeserverUrl
  /*: string*/
  ) {
    if (this.disabled) return;

    const config = _SdkConfig.default.get();

    if (!config.piwik) return;
    const whitelistedHSUrls = config.piwik.whitelistedHSUrls || [];
    this.setVisitVariable('User Type', isGuest ? 'Guest' : 'Logged In');
    this.setVisitVariable('Homeserver URL', whitelistRedact(whitelistedHSUrls, homeserverUrl));
  }

  setBreadcrumbs(state
  /*: boolean*/
  ) {
    if (this.disabled) return;
    this.setVisitVariable('Breadcrumbs', state ? 'enabled' : 'disabled');
  }

}

exports.Analytics = Analytics;

if (!window.mxAnalytics) {
  window.mxAnalytics = new Analytics();
}

var _default = window.mxAnalytics;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9BbmFseXRpY3MudHN4Il0sIm5hbWVzIjpbImhhc2hSZWdleCIsImhhc2hWYXJSZWdleCIsImdldFJlZGFjdGVkSGFzaCIsImhhc2giLCJtYXRjaCIsImV4ZWMiLCJjb25zb2xlIiwid2FybiIsInRlc3QiLCJyZXBsYWNlIiwiZ2V0UmVkYWN0ZWRVcmwiLCJvcmlnaW4iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInBhdGhuYW1lIiwic3RhcnRzV2l0aCIsImN1c3RvbVZhcmlhYmxlcyIsImlkIiwiZXhwbCIsImV4YW1wbGUiLCJnZXRUZXh0VmFyaWFibGVzIiwiYnJhbmQiLCJTZGtDb25maWciLCJnZXQiLCJ3aGl0ZWxpc3RSZWRhY3QiLCJ3aGl0ZWxpc3QiLCJzdHIiLCJpbmNsdWRlcyIsIlVJRF9LRVkiLCJDUkVBVElPTl9UU19LRVkiLCJWSVNJVF9DT1VOVF9LRVkiLCJMQVNUX1ZJU0lUX1RTX0tFWSIsImdldFVpZCIsImRhdGEiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwic2V0SXRlbSIsIkFycmF5IiwibWFwIiwiTWF0aCIsInJhbmRvbSIsInRvU3RyaW5nIiwiam9pbiIsImUiLCJlcnJvciIsIkhFQVJUQkVBVF9JTlRFUlZBTCIsIkFuYWx5dGljcyIsImNvbnN0cnVjdG9yIiwicm93cyIsImRpc2FibGVkIiwiT2JqZWN0IiwidmFsdWVzIiwidmlzaXRWYXJpYWJsZXMiLCJrZXlzIiwiayIsImV4YW1wbGVWYWx1ZSIsInJlc29sdXRpb24iLCJzY3JlZW4iLCJ3aWR0aCIsImhlaWdodCIsIm90aGVyVmFyaWFibGVzIiwidmFsdWUiLCJDdXJyZW50UGFnZVVSTCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIkVycm9yRGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsInJvdyIsInVuZGVmaW5lZCIsIml0ZW0iLCJpbmRleCIsImNyZWF0aW9uVHMiLCJTdHJpbmciLCJEYXRlIiwiZ2V0VGltZSIsImxhc3RWaXNpdFRzIiwidmlzaXRDb3VudCIsInBhcnNlSW50IiwiYmFzZVVybCIsImNhbkVuYWJsZSIsImNvbmZpZyIsImRvTm90VHJhY2siLCJwaXdpayIsInVybCIsInNpdGVJZCIsImVuYWJsZSIsIlVSTCIsInNlYXJjaFBhcmFtcyIsInNldCIsInBsYXRmb3JtIiwiUGxhdGZvcm1QZWciLCJzZXRWaXNpdFZhcmlhYmxlIiwiZ2V0SHVtYW5SZWFkYWJsZU5hbWUiLCJnZXRBcHBWZXJzaW9uIiwiaG9zdG5hbWUiLCJlbmRzV2l0aCIsImluc3RhbGxlZFBXQSIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwidG91Y2hJbnB1dCIsImhlYXJ0YmVhdEludGVydmFsSUQiLCJzZXRJbnRlcnZhbCIsInBpbmciLCJiaW5kIiwiZGlzYWJsZSIsInRyYWNrRXZlbnQiLCJjbGVhckludGVydmFsIiwicmVtb3ZlSXRlbSIsIl90cmFjayIsIm5vdyIsInBhcmFtcyIsIl9jdmFyIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlcyIsInJhbmQiLCJzbGljZSIsImgiLCJnZXRIb3VycyIsIm0iLCJnZXRNaW51dGVzIiwicyIsImdldFNlY29uZHMiLCJrZXkiLCJmZXRjaCIsIm1ldGhvZCIsIm1vZGUiLCJjYWNoZSIsInJlZGlyZWN0IiwidHJhY2tQYWdlQ2hhbmdlIiwiZ2VuZXJhdGlvblRpbWVNcyIsImZpcnN0UGFnZSIsImd0X21zIiwiY2F0ZWdvcnkiLCJhY3Rpb24iLCJuYW1lIiwiZV9jIiwiZV9hIiwiZV9uIiwiZV92Iiwic2V0TG9nZ2VkSW4iLCJpc0d1ZXN0IiwiaG9tZXNlcnZlclVybCIsIndoaXRlbGlzdGVkSFNVcmxzIiwic2V0QnJlYWRjcnVtYnMiLCJzdGF0ZSIsIm14QW5hbHl0aWNzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQSxNQUFNQSxTQUFTLEdBQUcsK0VBQWxCO0FB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ckcsUUFBVCxFQUFtQjtBQUNuQixTQUFLK0MsZ0JBQUwsQ0FBc0IsYUFBdEIsRUFBcUNzRCxLQUFLLEdBQUcsU0FBSCxHQUFlLFVBQXpEO0FBQ0g7O0FBcE1rQjs7OztBQW9RdkIsSUFBSSxDQUFDMUksTUFBTSxDQUFDMkksV0FBWixFQUF5QjtBQUNyQjNJLEVBQUFBLE1BQU0sQ0FBQzJJLFdBQVAsR0FBcUIsSUFBSXpHLFNBQUosRUFBckI7QUFDSDs7ZUFDY2xDLE1BQU0sQ0FBQzJJLFciLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmltcG9ydCB7Z2V0Q3VycmVudExhbmd1YWdlLCBfdCwgX3RkLCBJVmFyaWFibGVzfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSAnLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4vU2RrQ29uZmlnJztcbmltcG9ydCBNb2RhbCBmcm9tICcuL01vZGFsJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuL2luZGV4JztcblxuY29uc3QgaGFzaFJlZ2V4ID0gLyNcXC8oZ3JvdXBzP3xyb29tfHVzZXJ8c2V0dGluZ3N8cmVnaXN0ZXJ8bG9naW58Zm9yZ290X3Bhc3N3b3JkfGhvbWV8ZGlyZWN0b3J5KS87XG5jb25zdCBoYXNoVmFyUmVnZXggPSAvI1xcLyhncm91cHxyb29tfHVzZXIpXFwvLiokLztcblxuLy8gUmVtb3ZlIGFsbCBidXQgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIGhhc2ggcGF0aC4gUmVkYWN0IHVuZXhwZWN0ZWQgaGFzaGVzLlxuZnVuY3Rpb24gZ2V0UmVkYWN0ZWRIYXNoKGhhc2g6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRG9uJ3QgbGVhayBVUkxzIHdlIGFyZW4ndCBleHBlY3RpbmcgLSB0aGV5IGNvdWxkIGNvbnRhaW4gdG9rZW5zL1BJSVxuICAgIGNvbnN0IG1hdGNoID0gaGFzaFJlZ2V4LmV4ZWMoaGFzaCk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgICBjb25zb2xlLndhcm4oYFVuZXhwZWN0ZWQgaGFzaCBsb2NhdGlvbiBcIiR7aGFzaH1cImApO1xuICAgICAgICByZXR1cm4gJyMvPHVuZXhwZWN0ZWQgaGFzaCBsb2NhdGlvbj4nO1xuICAgIH1cblxuICAgIGlmIChoYXNoVmFyUmVnZXgudGVzdChoYXNoKSkge1xuICAgICAgICByZXR1cm4gaGFzaC5yZXBsYWNlKGhhc2hWYXJSZWdleCwgXCIjLyQxLzxyZWRhY3RlZD5cIik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGhhc2gucmVwbGFjZShoYXNoUmVnZXgsIFwiIy8kMVwiKTtcbn1cblxuLy8gUmV0dXJuIHRoZSBjdXJyZW50IG9yaWdpbiwgcGF0aCBhbmQgaGFzaCBzZXBhcmF0ZWQgd2l0aCBhIGAvYC4gVGhpcyBkb2VzXG4vLyBub3QgaW5jbHVkZSBxdWVyeSBwYXJhbWV0ZXJzLlxuZnVuY3Rpb24gZ2V0UmVkYWN0ZWRVcmwoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IG9yaWdpbiwgaGFzaCB9ID0gd2luZG93LmxvY2F0aW9uO1xuICAgIGxldCB7IHBhdGhuYW1lIH0gPSB3aW5kb3cubG9jYXRpb247XG5cbiAgICAvLyBSZWRhY3QgcGF0aHMgd2hpY2ggY291bGQgY29udGFpbiB1bmV4cGVjdGVkIFBJSVxuICAgIGlmIChvcmlnaW4uc3RhcnRzV2l0aCgnZmlsZTovLycpKSB7XG4gICAgICAgIHBhdGhuYW1lID0gXCIvPHJlZGFjdGVkPi9cIjtcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZ2luICsgcGF0aG5hbWUgKyBnZXRSZWRhY3RlZEhhc2goaGFzaCk7XG59XG5cbmludGVyZmFjZSBJRGF0YSB7XG4gICAgLyogZXNsaW50LWRpc2FibGUgY2FtZWxjYXNlICovXG4gICAgZ3RfbXM/OiBzdHJpbmc7XG4gICAgZV9jPzogc3RyaW5nO1xuICAgIGVfYT86IHN0cmluZztcbiAgICBlX24/OiBzdHJpbmc7XG4gICAgZV92Pzogc3RyaW5nO1xuICAgIHBpbmc/OiBzdHJpbmc7XG4gICAgLyogZXNsaW50LWVuYWJsZSBjYW1lbGNhc2UgKi9cbn1cblxuaW50ZXJmYWNlIElWYXJpYWJsZSB7XG4gICAgaWQ6IG51bWJlcjtcbiAgICBleHBsOiBzdHJpbmc7IC8vIGV4cGxhbmF0aW9uXG4gICAgZXhhbXBsZTogc3RyaW5nOyAvLyBleGFtcGxlIHZhbHVlXG4gICAgZ2V0VGV4dFZhcmlhYmxlcz8oKTogSVZhcmlhYmxlczsgLy8gb2JqZWN0IHRvIHBhc3MgYXMgMm5kIGFyZ3VtZW50IHRvIGBfdGBcbn1cblxuY29uc3QgY3VzdG9tVmFyaWFibGVzOiBSZWNvcmQ8c3RyaW5nLCBJVmFyaWFibGU+ID0ge1xuICAgIC8vIFRoZSBNYXRvbW8gaW5zdGFsbGF0aW9uIGF0IGh0dHBzOi8vbWF0b21vLnJpb3QuaW0gaXMgY3VycmVudGx5IGNvbmZpZ3VyZWRcbiAgICAvLyB3aXRoIGEgbGltaXQgb2YgMTAgY3VzdG9tIHZhcmlhYmxlcy5cbiAgICAnQXBwIFBsYXRmb3JtJzoge1xuICAgICAgICBpZDogMSxcbiAgICAgICAgZXhwbDogX3RkKCdUaGUgcGxhdGZvcm0geW91XFwncmUgb24nKSxcbiAgICAgICAgZXhhbXBsZTogJ0VsZWN0cm9uIFBsYXRmb3JtJyxcbiAgICB9LFxuICAgICdBcHAgVmVyc2lvbic6IHtcbiAgICAgICAgaWQ6IDIsXG4gICAgICAgIGV4cGw6IF90ZCgnVGhlIHZlcnNpb24gb2YgJShicmFuZClzJyksXG4gICAgICAgIGdldFRleHRWYXJpYWJsZXM6ICgpID0+ICh7XG4gICAgICAgICAgICBicmFuZDogU2RrQ29uZmlnLmdldCgpLmJyYW5kLFxuICAgICAgICB9KSxcbiAgICAgICAgZXhhbXBsZTogJzE1LjAuMCcsXG4gICAgfSxcbiAgICAnVXNlciBUeXBlJzoge1xuICAgICAgICBpZDogMyxcbiAgICAgICAgZXhwbDogX3RkKCdXaGV0aGVyIG9yIG5vdCB5b3VcXCdyZSBsb2dnZWQgaW4gKHdlIGRvblxcJ3QgcmVjb3JkIHlvdXIgdXNlcm5hbWUpJyksXG4gICAgICAgIGV4YW1wbGU6ICdMb2dnZWQgSW4nLFxuICAgIH0sXG4gICAgJ0Nob3NlbiBMYW5ndWFnZSc6IHtcbiAgICAgICAgaWQ6IDQsXG4gICAgICAgIGV4cGw6IF90ZCgnWW91ciBsYW5ndWFnZSBvZiBjaG9pY2UnKSxcbiAgICAgICAgZXhhbXBsZTogJ2VuJyxcbiAgICB9LFxuICAgICdJbnN0YW5jZSc6IHtcbiAgICAgICAgaWQ6IDUsXG4gICAgICAgIGV4cGw6IF90ZCgnV2hpY2ggb2ZmaWNpYWxseSBwcm92aWRlZCBpbnN0YW5jZSB5b3UgYXJlIHVzaW5nLCBpZiBhbnknKSxcbiAgICAgICAgZXhhbXBsZTogJ2FwcCcsXG4gICAgfSxcbiAgICAnUlRFOiBVc2VzIFJpY2h0ZXh0IE1vZGUnOiB7XG4gICAgICAgIGlkOiA2LFxuICAgICAgICBleHBsOiBfdGQoJ1doZXRoZXIgb3Igbm90IHlvdVxcJ3JlIHVzaW5nIHRoZSBSaWNodGV4dCBtb2RlIG9mIHRoZSBSaWNoIFRleHQgRWRpdG9yJyksXG4gICAgICAgIGV4YW1wbGU6ICdvZmYnLFxuICAgIH0sXG4gICAgJ0hvbWVzZXJ2ZXIgVVJMJzoge1xuICAgICAgICBpZDogNyxcbiAgICAgICAgZXhwbDogX3RkKCdZb3VyIGhvbWVzZXJ2ZXJcXCdzIFVSTCcpLFxuICAgICAgICBleGFtcGxlOiAnaHR0cHM6Ly9tYXRyaXgub3JnJyxcbiAgICB9LFxuICAgICdUb3VjaCBJbnB1dCc6IHtcbiAgICAgICAgaWQ6IDgsXG4gICAgICAgIGV4cGw6IF90ZChcIldoZXRoZXIgeW91J3JlIHVzaW5nICUoYnJhbmQpcyBvbiBhIGRldmljZSB3aGVyZSB0b3VjaCBpcyB0aGUgcHJpbWFyeSBpbnB1dCBtZWNoYW5pc21cIiksXG4gICAgICAgIGdldFRleHRWYXJpYWJsZXM6ICgpID0+ICh7XG4gICAgICAgICAgICBicmFuZDogU2RrQ29uZmlnLmdldCgpLmJyYW5kLFxuICAgICAgICB9KSxcbiAgICAgICAgZXhhbXBsZTogJ2ZhbHNlJyxcbiAgICB9LFxuICAgICdCcmVhZGNydW1icyc6IHtcbiAgICAgICAgaWQ6IDksXG4gICAgICAgIGV4cGw6IF90ZChcIldoZXRoZXIgb3Igbm90IHlvdSdyZSB1c2luZyB0aGUgJ2JyZWFkY3J1bWJzJyBmZWF0dXJlIChhdmF0YXJzIGFib3ZlIHRoZSByb29tIGxpc3QpXCIpLFxuICAgICAgICBleGFtcGxlOiAnZGlzYWJsZWQnLFxuICAgIH0sXG4gICAgJ0luc3RhbGxlZCBQV0EnOiB7XG4gICAgICAgIGlkOiAxMCxcbiAgICAgICAgZXhwbDogX3RkKFwiV2hldGhlciB5b3UncmUgdXNpbmcgJShicmFuZClzIGFzIGFuIGluc3RhbGxlZCBQcm9ncmVzc2l2ZSBXZWIgQXBwXCIpLFxuICAgICAgICBnZXRUZXh0VmFyaWFibGVzOiAoKSA9PiAoe1xuICAgICAgICAgICAgYnJhbmQ6IFNka0NvbmZpZy5nZXQoKS5icmFuZCxcbiAgICAgICAgfSksXG4gICAgICAgIGV4YW1wbGU6ICdmYWxzZScsXG4gICAgfSxcbn07XG5cbmZ1bmN0aW9uIHdoaXRlbGlzdFJlZGFjdCh3aGl0ZWxpc3Q6IHN0cmluZ1tdLCBzdHI6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKHdoaXRlbGlzdC5pbmNsdWRlcyhzdHIpKSByZXR1cm4gc3RyO1xuICAgIHJldHVybiAnPHJlZGFjdGVkPic7XG59XG5cbmNvbnN0IFVJRF9LRVkgPSBcIm14X1Jpb3RfQW5hbHl0aWNzX3VpZFwiO1xuY29uc3QgQ1JFQVRJT05fVFNfS0VZID0gXCJteF9SaW90X0FuYWx5dGljc19jdHNcIjtcbmNvbnN0IFZJU0lUX0NPVU5UX0tFWSA9IFwibXhfUmlvdF9BbmFseXRpY3NfdmNcIjtcbmNvbnN0IExBU1RfVklTSVRfVFNfS0VZID0gXCJteF9SaW90X0FuYWx5dGljc19sdnRzXCI7XG5cbmZ1bmN0aW9uIGdldFVpZCgpOiBzdHJpbmcge1xuICAgIHRyeSB7XG4gICAgICAgIGxldCBkYXRhID0gbG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFVJRF9LRVkpO1xuICAgICAgICBpZiAoIWRhdGEgJiYgbG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShVSURfS0VZLCBkYXRhID0gWy4uLkFycmF5KDE2KV0ubWFwKCgpID0+IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMTYpWzJdKS5qb2luKCcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiQW5hbHl0aWNzIGVycm9yOiBcIiwgZSk7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbn1cblxuY29uc3QgSEVBUlRCRUFUX0lOVEVSVkFMID0gMzAgKiAxMDAwOyAvLyBzZWNvbmRzXG5cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3Mge1xuICAgIHByaXZhdGUgYmFzZVVybDogVVJMID0gbnVsbDtcbiAgICBwcml2YXRlIHNpdGVJZDogc3RyaW5nID0gbnVsbDtcbiAgICBwcml2YXRlIHZpc2l0VmFyaWFibGVzOiBSZWNvcmQ8bnVtYmVyLCBbc3RyaW5nLCBzdHJpbmddPiA9IHt9OyAvLyB7W2lkOiBudW1iZXJdOiBbbmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nXX1cbiAgICBwcml2YXRlIGZpcnN0UGFnZSA9IHRydWU7XG4gICAgcHJpdmF0ZSBoZWFydGJlYXRJbnRlcnZhbElEOiBudW1iZXIgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBjcmVhdGlvblRzOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBsYXN0VmlzaXRUczogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgdmlzaXRDb3VudDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuY3JlYXRpb25UcyA9IGxvY2FsU3RvcmFnZSAmJiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShDUkVBVElPTl9UU19LRVkpO1xuICAgICAgICBpZiAoIXRoaXMuY3JlYXRpb25UcyAmJiBsb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKENSRUFUSU9OX1RTX0tFWSwgdGhpcy5jcmVhdGlvblRzID0gU3RyaW5nKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxhc3RWaXNpdFRzID0gbG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKExBU1RfVklTSVRfVFNfS0VZKTtcbiAgICAgICAgdGhpcy52aXNpdENvdW50ID0gbG9jYWxTdG9yYWdlICYmIGxvY2FsU3RvcmFnZS5nZXRJdGVtKFZJU0lUX0NPVU5UX0tFWSkgfHwgXCIwXCI7XG4gICAgICAgIHRoaXMudmlzaXRDb3VudCA9IFN0cmluZyhwYXJzZUludCh0aGlzLnZpc2l0Q291bnQsIDEwKSArIDEpOyAvLyBpbmNyZW1lbnRcbiAgICAgICAgaWYgKGxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oVklTSVRfQ09VTlRfS0VZLCB0aGlzLnZpc2l0Q291bnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkaXNhYmxlZCgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmJhc2VVcmw7XG4gICAgfVxuXG4gICAgcHVibGljIGNhbkVuYWJsZSgpIHtcbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmRvTm90VHJhY2sgIT09IFwiMVwiICYmIGNvbmZpZyAmJiBjb25maWcucGl3aWsgJiYgY29uZmlnLnBpd2lrLnVybCAmJiBjb25maWcucGl3aWsuc2l0ZUlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuYWJsZSBBbmFseXRpY3MgaWYgaW5pdGlhbGl6ZWQgYnV0IGRpc2FibGVkXG4gICAgICogb3RoZXJ3aXNlIHRyeSBhbmQgaW5pdGFsaXplLCBuby1vcCBpZiBwaXdpayBjb25maWcgbWlzc2luZ1xuICAgICAqL1xuICAgIHB1YmxpYyBhc3luYyBlbmFibGUoKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICBpZiAoIXRoaXMuY2FuRW5hYmxlKCkpIHJldHVybjtcbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuXG4gICAgICAgIHRoaXMuYmFzZVVybCA9IG5ldyBVUkwoXCJwaXdpay5waHBcIiwgY29uZmlnLnBpd2lrLnVybCk7XG4gICAgICAgIC8vIHNldCBjb25zdGFudHNcbiAgICAgICAgdGhpcy5iYXNlVXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJyZWNcIiwgXCIxXCIpOyAvLyByZWMgaXMgcmVxdWlyZWQgZm9yIHRyYWNraW5nXG4gICAgICAgIHRoaXMuYmFzZVVybC5zZWFyY2hQYXJhbXMuc2V0KFwiaWRzaXRlXCIsIGNvbmZpZy5waXdpay5zaXRlSWQpOyAvLyByZWMgaXMgcmVxdWlyZWQgZm9yIHRyYWNraW5nXG4gICAgICAgIHRoaXMuYmFzZVVybC5zZWFyY2hQYXJhbXMuc2V0KFwiYXBpdlwiLCBcIjFcIik7IC8vIEFQSSB2ZXJzaW9uIHRvIHVzZVxuICAgICAgICB0aGlzLmJhc2VVcmwuc2VhcmNoUGFyYW1zLnNldChcInNlbmRfaW1hZ2VcIiwgXCIwXCIpOyAvLyB3ZSB3YW50IGEgMjA0LCBub3QgYSB0aW55IEdJRlxuICAgICAgICAvLyBzZXQgdXNlciBwYXJhbWV0ZXJzXG4gICAgICAgIHRoaXMuYmFzZVVybC5zZWFyY2hQYXJhbXMuc2V0KFwiX2lkXCIsIGdldFVpZCgpKTsgLy8gdXVpZFxuICAgICAgICB0aGlzLmJhc2VVcmwuc2VhcmNoUGFyYW1zLnNldChcIl9pZHRzXCIsIHRoaXMuY3JlYXRpb25Ucyk7IC8vIGZpcnN0IHRzXG4gICAgICAgIHRoaXMuYmFzZVVybC5zZWFyY2hQYXJhbXMuc2V0KFwiX2lkdmNcIiwgdGhpcy52aXNpdENvdW50KTsgLy8gdmlzaXQgY291bnRcbiAgICAgICAgaWYgKHRoaXMubGFzdFZpc2l0VHMpIHtcbiAgICAgICAgICAgIHRoaXMuYmFzZVVybC5zZWFyY2hQYXJhbXMuc2V0KFwiX3ZpZXd0c1wiLCB0aGlzLmxhc3RWaXNpdFRzKTsgLy8gbGFzdCB2aXNpdCB0c1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcGxhdGZvcm0gPSBQbGF0Zm9ybVBlZy5nZXQoKTtcbiAgICAgICAgdGhpcy5zZXRWaXNpdFZhcmlhYmxlKCdBcHAgUGxhdGZvcm0nLCBwbGF0Zm9ybS5nZXRIdW1hblJlYWRhYmxlTmFtZSgpKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnQXBwIFZlcnNpb24nLCBhd2FpdCBwbGF0Zm9ybS5nZXRBcHBWZXJzaW9uKCkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFZpc2l0VmFyaWFibGUoJ0FwcCBWZXJzaW9uJywgJ3Vua25vd24nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnQ2hvc2VuIExhbmd1YWdlJywgZ2V0Q3VycmVudExhbmd1YWdlKCkpO1xuXG4gICAgICAgIGNvbnN0IGhvc3RuYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lO1xuICAgICAgICBpZiAoaG9zdG5hbWUgPT09ICdyaW90LmltJykge1xuICAgICAgICAgICAgdGhpcy5zZXRWaXNpdFZhcmlhYmxlKCdJbnN0YW5jZScsIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaG9zdG5hbWUuZW5kc1dpdGgoJy5lbGVtZW50LmlvJykpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnSW5zdGFuY2UnLCBob3N0bmFtZS5yZXBsYWNlKCcuZWxlbWVudC5pbycsICcnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgaW5zdGFsbGVkUFdBID0gXCJ1bmtub3duXCI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBLbm93biB0byB3b3JrIGF0IGxlYXN0IGZvciBkZXNrdG9wIENocm9tZVxuICAgICAgICAgICAgaW5zdGFsbGVkUFdBID0gU3RyaW5nKHdpbmRvdy5tYXRjaE1lZGlhKCcoZGlzcGxheS1tb2RlOiBzdGFuZGFsb25lKScpLm1hdGNoZXMpO1xuICAgICAgICB9IGNhdGNoIChlKSB7IH1cbiAgICAgICAgdGhpcy5zZXRWaXNpdFZhcmlhYmxlKCdJbnN0YWxsZWQgUFdBJywgaW5zdGFsbGVkUFdBKTtcblxuICAgICAgICBsZXQgdG91Y2hJbnB1dCA9IFwidW5rbm93blwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTUROIGNsYWltcyBicm9hZCBzdXBwb3J0IGFjcm9zcyBicm93c2Vyc1xuICAgICAgICAgICAgdG91Y2hJbnB1dCA9IFN0cmluZyh3aW5kb3cubWF0Y2hNZWRpYSgnKHBvaW50ZXI6IGNvYXJzZSknKS5tYXRjaGVzKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyB9XG4gICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnVG91Y2ggSW5wdXQnLCB0b3VjaElucHV0KTtcblxuICAgICAgICAvLyBzdGFydCBoZWFydGJlYXRcbiAgICAgICAgdGhpcy5oZWFydGJlYXRJbnRlcnZhbElEID0gd2luZG93LnNldEludGVydmFsKHRoaXMucGluZy5iaW5kKHRoaXMpLCBIRUFSVEJFQVRfSU5URVJWQUwpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERpc2FibGUgQW5hbHl0aWNzLCBzdG9wIHRoZSBoZWFydGJlYXQgYW5kIGNsZWFyIGlkZW50aWZpZXJzIGZyb20gbG9jYWxTdG9yYWdlXG4gICAgICovXG4gICAgcHVibGljIGRpc2FibGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIHRoaXMudHJhY2tFdmVudCgnQW5hbHl0aWNzJywgJ29wdC1vdXQnKTtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5oZWFydGJlYXRJbnRlcnZhbElEKTtcbiAgICAgICAgdGhpcy5iYXNlVXJsID0gbnVsbDtcbiAgICAgICAgdGhpcy52aXNpdFZhcmlhYmxlcyA9IHt9O1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShVSURfS0VZKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oQ1JFQVRJT05fVFNfS0VZKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oVklTSVRfQ09VTlRfS0VZKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oTEFTVF9WSVNJVF9UU19LRVkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgX3RyYWNrKGRhdGE6IElEYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgcGFyYW1zID0ge1xuICAgICAgICAgICAgLi4uZGF0YSxcbiAgICAgICAgICAgIHVybDogZ2V0UmVkYWN0ZWRVcmwoKSxcblxuICAgICAgICAgICAgX2N2YXI6IEpTT04uc3RyaW5naWZ5KHRoaXMudmlzaXRWYXJpYWJsZXMpLCAvLyB1c2VyIGN1c3RvbSB2YXJzXG4gICAgICAgICAgICByZXM6IGAke3dpbmRvdy5zY3JlZW4ud2lkdGh9eCR7d2luZG93LnNjcmVlbi5oZWlnaHR9YCwgLy8gcmVzb2x1dGlvbiBhcyBXV1dXeEhISEhcbiAgICAgICAgICAgIHJhbmQ6IFN0cmluZyhNYXRoLnJhbmRvbSgpKS5zbGljZSgyLCA4KSwgLy8gcmFuZG9tIG5vbmNlIHRvIGNhY2hlLWJ1c3RcbiAgICAgICAgICAgIGg6IG5vdy5nZXRIb3VycygpLFxuICAgICAgICAgICAgbTogbm93LmdldE1pbnV0ZXMoKSxcbiAgICAgICAgICAgIHM6IG5vdy5nZXRTZWNvbmRzKCksXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTCh0aGlzLmJhc2VVcmwudG9TdHJpbmcoKSk7IC8vIGNvcHlcbiAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gcGFyYW1zKSB7XG4gICAgICAgICAgICB1cmwuc2VhcmNoUGFyYW1zLnNldChrZXksIHBhcmFtc1trZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCB3aW5kb3cuZmV0Y2godXJsLnRvU3RyaW5nKCksIHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgbW9kZTogXCJuby1jb3JzXCIsXG4gICAgICAgICAgICAgICAgY2FjaGU6IFwibm8tY2FjaGVcIixcbiAgICAgICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQW5hbHl0aWNzIGVycm9yOiBcIiwgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcGluZygpIHtcbiAgICAgICAgdGhpcy5fdHJhY2soe1xuICAgICAgICAgICAgcGluZzogXCIxXCIsXG4gICAgICAgIH0pO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShMQVNUX1ZJU0lUX1RTX0tFWSwgU3RyaW5nKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7IC8vIHVwZGF0ZSBsYXN0IHZpc2l0IHRzXG4gICAgfVxuXG4gICAgcHVibGljIHRyYWNrUGFnZUNoYW5nZShnZW5lcmF0aW9uVGltZU1zPzogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzLmZpcnN0UGFnZSkge1xuICAgICAgICAgICAgLy8gRGUtZHVwbGljYXRlIGZpcnN0IHBhZ2VcbiAgICAgICAgICAgIC8vIHJvdXRlciBzZWVtcyB0byBoaXQgdGhlIGZuIHR3aWNlXG4gICAgICAgICAgICB0aGlzLmZpcnN0UGFnZSA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBnZW5lcmF0aW9uVGltZU1zICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdBbmFseXRpY3MudHJhY2tQYWdlQ2hhbmdlOiBleHBlY3RlZCBnZW5lcmF0aW9uVGltZU1zIHRvIGJlIGEgbnVtYmVyJyk7XG4gICAgICAgICAgICAvLyBCdXQgY29udGludWUgYW55d2F5IGJlY2F1c2Ugd2Ugc3RpbGwgd2FudCB0byB0cmFjayB0aGUgY2hhbmdlXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl90cmFjayh7XG4gICAgICAgICAgICBndF9tczogU3RyaW5nKGdlbmVyYXRpb25UaW1lTXMpLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhY2tFdmVudChjYXRlZ29yeTogc3RyaW5nLCBhY3Rpb246IHN0cmluZywgbmFtZT86IHN0cmluZywgdmFsdWU/OiBzdHJpbmcpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5fdHJhY2soe1xuICAgICAgICAgICAgZV9jOiBjYXRlZ29yeSxcbiAgICAgICAgICAgIGVfYTogYWN0aW9uLFxuICAgICAgICAgICAgZV9uOiBuYW1lLFxuICAgICAgICAgICAgZV92OiB2YWx1ZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRWaXNpdFZhcmlhYmxlKGtleToga2V5b2YgdHlwZW9mIGN1c3RvbVZhcmlhYmxlcywgdmFsdWU6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnZpc2l0VmFyaWFibGVzW2N1c3RvbVZhcmlhYmxlc1trZXldLmlkXSA9IFtrZXksIHZhbHVlXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TG9nZ2VkSW4oaXNHdWVzdDogYm9vbGVhbiwgaG9tZXNlcnZlclVybDogc3RyaW5nKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICBpZiAoIWNvbmZpZy5waXdpaykgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHdoaXRlbGlzdGVkSFNVcmxzID0gY29uZmlnLnBpd2lrLndoaXRlbGlzdGVkSFNVcmxzIHx8IFtdO1xuXG4gICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnVXNlciBUeXBlJywgaXNHdWVzdCA/ICdHdWVzdCcgOiAnTG9nZ2VkIEluJyk7XG4gICAgICAgIHRoaXMuc2V0VmlzaXRWYXJpYWJsZSgnSG9tZXNlcnZlciBVUkwnLCB3aGl0ZWxpc3RSZWRhY3Qod2hpdGVsaXN0ZWRIU1VybHMsIGhvbWVzZXJ2ZXJVcmwpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QnJlYWRjcnVtYnMoc3RhdGU6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5zZXRWaXNpdFZhcmlhYmxlKCdCcmVhZGNydW1icycsIHN0YXRlID8gJ2VuYWJsZWQnIDogJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3dEZXRhaWxzTW9kYWwgPSAoKSA9PiB7XG4gICAgICAgIGxldCByb3dzID0gW107XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgcm93cyA9IE9iamVjdC52YWx1ZXModGhpcy52aXNpdFZhcmlhYmxlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByb3dzID0gT2JqZWN0LmtleXMoY3VzdG9tVmFyaWFibGVzKS5tYXAoXG4gICAgICAgICAgICAgICAgKGspID0+IFtcbiAgICAgICAgICAgICAgICAgICAgayxcbiAgICAgICAgICAgICAgICAgICAgX3QoJ2UuZy4gJShleGFtcGxlVmFsdWUpcycsIHsgZXhhbXBsZVZhbHVlOiBjdXN0b21WYXJpYWJsZXNba10uZXhhbXBsZSB9KSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJlc29sdXRpb24gPSBgJHt3aW5kb3cuc2NyZWVuLndpZHRofXgke3dpbmRvdy5zY3JlZW4uaGVpZ2h0fWA7XG4gICAgICAgIGNvbnN0IG90aGVyVmFyaWFibGVzID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGV4cGw6IF90ZCgnRXZlcnkgcGFnZSB5b3UgdXNlIGluIHRoZSBhcHAnKSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogX3QoXG4gICAgICAgICAgICAgICAgICAgICdlLmcuIDxDdXJyZW50UGFnZVVSTD4nLFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgQ3VycmVudFBhZ2VVUkw6IGdldFJlZGFjdGVkVXJsLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBleHBsOiBfdGQoJ1lvdXIgdXNlciBhZ2VudCcpLCB2YWx1ZTogbmF2aWdhdG9yLnVzZXJBZ2VudCB9LFxuICAgICAgICAgICAgeyBleHBsOiBfdGQoJ1lvdXIgZGV2aWNlIHJlc29sdXRpb24nKSwgdmFsdWU6IHJlc29sdXRpb24gfSxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoJ2RpYWxvZ3MuRXJyb3JEaWFsb2cnKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQW5hbHl0aWNzIERldGFpbHMnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgIHRpdGxlOiBfdCgnQW5hbHl0aWNzJyksXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdiBjbGFzc05hbWU9XCJteF9BbmFseXRpY3NNb2RhbFwiPlxuICAgICAgICAgICAgICAgIDxkaXY+e190KCdUaGUgaW5mb3JtYXRpb24gYmVpbmcgc2VudCB0byB1cyB0byBoZWxwIG1ha2UgJShicmFuZClzIGJldHRlciBpbmNsdWRlczonLCB7XG4gICAgICAgICAgICAgICAgICAgIGJyYW5kOiBTZGtDb25maWcuZ2V0KCkuYnJhbmQsXG4gICAgICAgICAgICAgICAgfSl9PC9kaXY+XG4gICAgICAgICAgICAgICAgPHRhYmxlPlxuICAgICAgICAgICAgICAgICAgICB7IHJvd3MubWFwKChyb3cpID0+IDx0ciBrZXk9e3Jvd1swXX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQ+e190KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVZhcmlhYmxlc1tyb3dbMF1dLmV4cGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVmFyaWFibGVzW3Jvd1swXV0uZ2V0VGV4dFZhcmlhYmxlcyA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVZhcmlhYmxlc1tyb3dbMF1dLmdldFRleHRWYXJpYWJsZXMoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICApfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHJvd1sxXSAhPT0gdW5kZWZpbmVkICYmIDx0ZD48Y29kZT57IHJvd1sxXSB9PC9jb2RlPjwvdGQ+IH1cbiAgICAgICAgICAgICAgICAgICAgPC90cj4pIH1cbiAgICAgICAgICAgICAgICAgICAgeyBvdGhlclZhcmlhYmxlcy5tYXAoKGl0ZW0sIGluZGV4KSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW5kZXh9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ZD57IF90KGl0ZW0uZXhwbCkgfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkPjxjb2RlPnsgaXRlbS52YWx1ZSB9PC9jb2RlPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RyPixcbiAgICAgICAgICAgICAgICAgICAgKSB9XG4gICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdXaGVyZSB0aGlzIHBhZ2UgaW5jbHVkZXMgaWRlbnRpZmlhYmxlIGluZm9ybWF0aW9uLCBzdWNoIGFzIGEgcm9vbSwgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAndXNlciBvciBncm91cCBJRCwgdGhhdCBkYXRhIGlzIHJlbW92ZWQgYmVmb3JlIGJlaW5nIHNlbnQgdG8gdGhlIHNlcnZlci4nKSB9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbmlmICghd2luZG93Lm14QW5hbHl0aWNzKSB7XG4gICAgd2luZG93Lm14QW5hbHl0aWNzID0gbmV3IEFuYWx5dGljcygpO1xufVxuZXhwb3J0IGRlZmF1bHQgd2luZG93Lm14QW5hbHl0aWNzO1xuIl19