"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _randomstring = require("matrix-js-sdk/src/randomstring");

var _languageHandler = require("./languageHandler");

var _PlatformPeg = _interopRequireDefault(require("./PlatformPeg"));

var _SdkConfig = _interopRequireDefault(require("./SdkConfig"));

var _MatrixClientPeg = require("./MatrixClientPeg");

var _promise = require("./utils/promise");

var _RoomViewStore = _interopRequireDefault(require("./stores/RoomViewStore"));

var TextEncodingUtf8 = _interopRequireWildcard(require("text-encoding-utf-8"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let TextEncoder = window.TextEncoder;

if (!TextEncoder) {
  TextEncoder = TextEncodingUtf8.TextEncoder;
}

const INACTIVITY_TIME = 20; // seconds

const HEARTBEAT_INTERVAL = 5000; // ms

const SESSION_UPDATE_INTERVAL = 60; // seconds

const MAX_PENDING_EVENTS = 1000;
var Orientation;
/* eslint-disable camelcase */

(function (Orientation) {
  Orientation["Landscape"] = "landscape";
  Orientation["Portrait"] = "portrait";
})(Orientation || (Orientation = {}));

/* eslint-enable camelcase */
const hashHex = async (input
/*: string*/
) =>
/*: Promise<string>*/
{
  const buf = new TextEncoder().encode(input);
  const digestBuf = await window.crypto.subtle.digest("sha-256", buf);
  return [...new Uint8Array(digestBuf)].map((b
  /*: number*/
  ) => b.toString(16).padStart(2, "0")).join("");
};

const knownScreens = new Set(["register", "login", "forgot_password", "soft_logout", "new", "settings", "welcome", "home", "start", "directory", "start_sso", "start_cas", "groups", "complete_security", "post_registration", "room", "user", "group"]);

// Apply fn to all hash path parts after the 1st one
async function getViewData(anonymous = true)
/*: Promise<IViewData>*/
{
  const rand = (0, _randomstring.randomString)(8);
  const {
    origin,
    hash
  } = window.location;
  let {
    pathname
  } = window.location; // Redact paths which could contain unexpected PII

  if (origin.startsWith('file://')) {
    pathname = `/<redacted_${rand}>/`; // XXX: inject rand because Count.ly doesn't like X->X transitions
  }

  let [_, screen, ...parts] = hash.split("/");

  if (!knownScreens.has(screen)) {
    screen = `<redacted_${rand}>`;
  }

  for (let i = 0; i < parts.length; i++) {
    parts[i] = anonymous ? `<redacted_${rand}>` : await hashHex(parts[i]);
  }

  const hashStr = `${_}/${screen}/${parts.join("/")}`;
  const url = origin + pathname + hashStr;
  const meta = {};
  let name = "$/" + hash;

  switch (screen) {
    case "room":
      {
        name = "view_room";

        const roomId = _RoomViewStore.default.getRoomId();

        name += " " + parts[0]; // XXX: workaround Count.ly missing X->X transitions

        meta["room_id"] = parts[0];
        Object.assign(meta, getRoomStats(roomId));
        break;
      }
  }

  return {
    name,
    url,
    meta
  };
}

const getRoomStats = (roomId
/*: string*/
) => {
  const cli = _MatrixClientPeg.MatrixClientPeg.get();

  const room = cli?.getRoom(roomId);
  return {
    "num_users": room?.getJoinedMemberCount(),
    "is_encrypted": cli?.isRoomEncrypted(roomId),
    // eslint-disable-next-line camelcase
    "is_public": room?.currentState.getStateEvents("m.room.join_rules", "")?.getContent()?.join_rule === "public"
  };
}; // async wrapper for regex-powered String.prototype.replace


const strReplaceAsync = async (str
/*: string*/
, regex
/*: RegExp*/
, fn
/*: (...args: string[]) => Promise<string>*/
) => {
  const promises
  /*: Promise<string>[]*/
  = []; // dry-run to calculate the replace values

  str.replace(regex, (...args) => {
    promises.push(fn(...args));
    return "";
  });
  const values = await Promise.all(promises);
  return str.replace(regex, () => values.shift());
};

class CountlyAnalytics {
  constructor() {
    (0, _defineProperty2.default)(this, "baseUrl", null);
    (0, _defineProperty2.default)(this, "appKey", null);
    (0, _defineProperty2.default)(this, "userKey", null);
    (0, _defineProperty2.default)(this, "anonymous", void 0);
    (0, _defineProperty2.default)(this, "appPlatform", void 0);
    (0, _defineProperty2.default)(this, "appVersion", "unknown");
    (0, _defineProperty2.default)(this, "initTime", CountlyAnalytics.getTimestamp());
    (0, _defineProperty2.default)(this, "firstPage", true);
    (0, _defineProperty2.default)(this, "heartbeatIntervalId", void 0);
    (0, _defineProperty2.default)(this, "activityIntervalId", void 0);
    (0, _defineProperty2.default)(this, "trackTime", true);
    (0, _defineProperty2.default)(this, "lastBeat", void 0);
    (0, _defineProperty2.default)(this, "storedDuration", 0);
    (0, _defineProperty2.default)(this, "lastView", void 0);
    (0, _defineProperty2.default)(this, "lastViewTime", 0);
    (0, _defineProperty2.default)(this, "lastViewStoredDuration", 0);
    (0, _defineProperty2.default)(this, "sessionStarted", false);
    (0, _defineProperty2.default)(this, "heartbeatEnabled", false);
    (0, _defineProperty2.default)(this, "inactivityCounter", 0);
    (0, _defineProperty2.default)(this, "pendingEvents", []);
    (0, _defineProperty2.default)(this, "lastMsTs", 0);
    (0, _defineProperty2.default)(this, "getOrientation", () =>
    /*: Orientation*/
    {
      return window.innerWidth > window.innerHeight ? Orientation.Landscape : Orientation.Portrait;
    });
    (0, _defineProperty2.default)(this, "reportOrientation", () => {
      this.track("[CLY]_orientation", {
        mode: this.getOrientation()
      });
    });
    (0, _defineProperty2.default)(this, "endSession", () => {
      if (this.sessionStarted) {
        window.removeEventListener("resize", this.reportOrientation);
        this.reportViewDuration();
        this.request({
          end_session: 1,
          session_duration: CountlyAnalytics.getTimestamp() - this.lastBeat
        });
      }

      this.sessionStarted = false;
    });
    (0, _defineProperty2.default)(this, "onVisibilityChange", () => {
      if (document.hidden) {
        this.stopTime();
      } else {
        this.startTime();
      }
    });
    (0, _defineProperty2.default)(this, "onUserActivity", () => {
      if (this.inactivityCounter >= INACTIVITY_TIME) {
        this.startTime();
      }

      this.inactivityCounter = 0;
    });
  }

  static get instance()
  /*: CountlyAnalytics*/
  {
    return CountlyAnalytics.internalInstance;
  }

  get disabled() {
    return !this.baseUrl;
  }

  canEnable() {
    const config = _SdkConfig.default.get();

    return Boolean(navigator.doNotTrack !== "1" && config?.countly?.url && config?.countly?.appKey);
  }

  async changeUserKey(userKey
  /*: string*/
  , merge = false) {
    const oldUserKey = this.userKey;
    this.userKey = userKey;

    if (oldUserKey && merge) {
      await this.request({
        old_device_id: oldUserKey
      });
    }
  }

  async enable(anonymous = true) {
    if (!this.disabled && this.anonymous === anonymous) return;
    if (!this.canEnable()) return;

    if (!this.disabled) {
      // flush request queue as our userKey is going to change, no need to await it
      this.request();
    }

    const config = _SdkConfig.default.get();

    this.baseUrl = new URL("/i", config.countly.url);
    this.appKey = config.countly.appKey;
    this.anonymous = anonymous;

    if (anonymous) {
      await this.changeUserKey((0, _randomstring.randomString)(64));
    } else {
      await this.changeUserKey(await hashHex(_MatrixClientPeg.MatrixClientPeg.get().getUserId()), true);
    }

    const platform = _PlatformPeg.default.get();

    this.appPlatform = platform.getHumanReadableName();

    try {
      this.appVersion = await platform.getAppVersion();
    } catch (e) {
      console.warn("Failed to get app version, using 'unknown'");
    } // start heartbeat


    this.heartbeatIntervalId = setInterval(this.heartbeat.bind(this), HEARTBEAT_INTERVAL);
    this.trackSessions();
    this.trackErrors();
  }

  async disable() {
    if (this.disabled) return;
    await this.track("Opt-Out");
    this.endSession();
    window.clearInterval(this.heartbeatIntervalId);
    window.clearTimeout(this.activityIntervalId);
    this.baseUrl = null; // remove listeners bound in trackSessions()

    window.removeEventListener("beforeunload", this.endSession);
    window.removeEventListener("unload", this.endSession);
    window.removeEventListener("visibilitychange", this.onVisibilityChange);
    window.removeEventListener("mousemove", this.onUserActivity);
    window.removeEventListener("click", this.onUserActivity);
    window.removeEventListener("keydown", this.onUserActivity);
    window.removeEventListener("scroll", this.onUserActivity);
  }

  reportFeedback(rating
  /*: 1 | 2 | 3 | 4 | 5*/
  , comment
  /*: string*/
  ) {
    this.track("[CLY]_star_rating", {
      rating,
      comment
    }, null, {}, true);
  }

  trackPageChange(generationTimeMs
  /*: number*/
  ) {
    if (this.disabled) return; // TODO use generationTimeMs

    this.trackPageView();
  }

  async trackPageView() {
    this.reportViewDuration();
    await (0, _promise.sleep)(0); // XXX: we sleep here because otherwise we get the old hash and not the new one

    const viewData = await getViewData(this.anonymous);
    const page = viewData.name;
    this.lastView = page;
    this.lastViewTime = CountlyAnalytics.getTimestamp();

    const segments = _objectSpread(_objectSpread({}, viewData.meta), {}, {
      name: page,
      visit: 1,
      domain: window.location.hostname,
      view: viewData.url,
      segment: this.appPlatform,
      start: this.firstPage
    });

    if (this.firstPage) {
      this.firstPage = false;
    }

    this.track("[CLY]_view", segments);
  }

  static getTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  } // store the last ms timestamp returned
  // we do this to prevent the ts from ever decreasing in the case of system time changing


  getMsTimestamp() {
    const ts = new Date().getTime();

    if (this.lastMsTs >= ts) {
      // increment ts as to keep our data points well-ordered
      this.lastMsTs++;
    } else {
      this.lastMsTs = ts;
    }

    return this.lastMsTs;
  }

  async recordError(err
  /*: Error | string*/
  , fatal = false) {
    if (this.disabled || this.anonymous) return;
    let error = "";

    if (typeof err === "object") {
      if (typeof err.stack !== "undefined") {
        error = err.stack;
      } else {
        if (typeof err.name !== "undefined") {
          error += err.name + ":";
        }

        if (typeof err.message !== "undefined") {
          error += err.message + "\n";
        }

        if (typeof err.fileName !== "undefined") {
          error += "in " + err.fileName + "\n";
        }

        if (typeof err.lineNumber !== "undefined") {
          error += "on " + err.lineNumber;
        }

        if (typeof err.columnNumber !== "undefined") {
          error += ":" + err.columnNumber;
        }
      }
    } else {
      error = err + "";
    } // sanitize the error from identifiers


    error = await strReplaceAsync(error, /([!@+#]).+?:[\w:.]+/g, async (substring
    /*: string*/
    , glyph
    /*: string*/
    ) => {
      return glyph + (await hashHex(substring.substring(1)));
    });
    const metrics = this.getMetrics();
    const ob
    /*: ICrash*/
    = {
      _resolution: metrics?._resolution,
      _error: error,
      _app_version: this.appVersion,
      _run: CountlyAnalytics.getTimestamp() - this.initTime,
      _nonfatal: !fatal,
      _view: this.lastView
    };

    if (typeof navigator.onLine !== "undefined") {
      ob._online = navigator.onLine;
    }

    ob._background = document.hasFocus();
    this.request({
      crash: JSON.stringify(ob)
    });
  }

  trackErrors() {
    //override global uncaught error handler
    window.onerror = (msg, url, line, col, err) => {
      if (typeof err !== "undefined") {
        this.recordError(err, false);
      } else {
        let error = "";

        if (typeof msg !== "undefined") {
          error += msg + "\n";
        }

        if (typeof url !== "undefined") {
          error += "at " + url;
        }

        if (typeof line !== "undefined") {
          error += ":" + line;
        }

        if (typeof col !== "undefined") {
          error += ":" + col;
        }

        error += "\n";

        try {
          const stack = []; // eslint-disable-next-line no-caller

          let f = arguments.callee.caller;

          while (f) {
            stack.push(f.name);
            f = f.caller;
          }

          error += stack.join("\n");
        } catch (ex) {//silent error
        }

        this.recordError(error, false);
      }
    };

    window.addEventListener('unhandledrejection', event => {
      this.recordError(new Error(`Unhandled rejection (reason: ${event.reason?.stack || event.reason}).`), true);
    });
  }

  heartbeat() {
    const args
    /*: Pick<IParams, "session_duration">*/
    = {}; // extend session if needed

    if (this.sessionStarted && this.trackTime) {
      const last = CountlyAnalytics.getTimestamp();

      if (last - this.lastBeat >= SESSION_UPDATE_INTERVAL) {
        args.session_duration = last - this.lastBeat;
        this.lastBeat = last;
      }
    } // process event queue


    if (this.pendingEvents.length > 0 || args.session_duration) {
      this.request(args);
    }
  }

  async request(args
  /*: Omit<IParams, "app_key" | "device_id" | "timestamp" | "hour" | "dow">
              & Partial<Pick<IParams, "device_id">>*/
  = {}) {
    const request
    /*: IParams*/
    = _objectSpread(_objectSpread({
      app_key: this.appKey,
      device_id: this.userKey
    }, this.getTimeParams()), args);

    if (this.pendingEvents.length > 0) {
      const EVENT_BATCH_SIZE = 10;
      const events = this.pendingEvents.splice(0, EVENT_BATCH_SIZE);
      request.events = JSON.stringify(events);
    }

    const params = new URLSearchParams(request);

    try {
      await window.fetch(this.baseUrl.toString(), {
        method: "POST",
        mode: "no-cors",
        cache: "no-cache",
        redirect: "follow",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params
      });
    } catch (e) {
      console.error("Analytics error: ", e);
    }
  }

  getTimeParams()
  /*: Pick<IParams, "timestamp" | "hour" | "dow">*/
  {
    const date = new Date();
    return {
      timestamp: this.getMsTimestamp(),
      hour: date.getHours(),
      dow: date.getDay()
    };
  }

  queue(args
  /*: Omit<IEvent, "timestamp" | "hour" | "dow" | "count"> & Partial<Pick<IEvent, "count">>*/
  ) {
    const {
      count = 1
    } = args,
          rest = (0, _objectWithoutProperties2.default)(args, ["count"]);

    const ev = _objectSpread(_objectSpread(_objectSpread({}, this.getTimeParams()), rest), {}, {
      count,
      platform: this.appPlatform,
      app_version: this.appVersion
    });

    this.pendingEvents.push(ev);

    if (this.pendingEvents.length > MAX_PENDING_EVENTS) {
      this.pendingEvents.shift();
    }
  }

  startTime() {
    if (!this.trackTime) {
      this.trackTime = true;
      this.lastBeat = CountlyAnalytics.getTimestamp() - this.storedDuration;
      this.lastViewTime = CountlyAnalytics.getTimestamp() - this.lastViewStoredDuration;
      this.lastViewStoredDuration = 0;
    }
  }

  stopTime() {
    if (this.trackTime) {
      this.trackTime = false;
      this.storedDuration = CountlyAnalytics.getTimestamp() - this.lastBeat;
      this.lastViewStoredDuration = CountlyAnalytics.getTimestamp() - this.lastViewTime;
    }
  }

  getMetrics()
  /*: IMetrics*/
  {
    if (this.anonymous) return undefined;
    const metrics
    /*: IMetrics*/
    = {}; // getting app version

    metrics._app_version = this.appVersion;
    metrics._ua = navigator.userAgent; // getting resolution

    if (screen.width && screen.height) {
      metrics._resolution = `${screen.width}x${screen.height}`;
    } // getting density ratio


    if (window.devicePixelRatio) {
      metrics._density = window.devicePixelRatio;
    } // getting locale


    metrics._locale = (0, _languageHandler.getCurrentLanguage)();
    return metrics;
  }

  async beginSession(heartbeat = true) {
    if (!this.sessionStarted) {
      this.reportOrientation();
      window.addEventListener("resize", this.reportOrientation);
      this.lastBeat = CountlyAnalytics.getTimestamp();
      this.sessionStarted = true;
      this.heartbeatEnabled = heartbeat;
      const userDetails
      /*: IUserDetails*/
      = {
        custom: {
          "home_server": _MatrixClientPeg.MatrixClientPeg.get() && _MatrixClientPeg.MatrixClientPeg.getHomeserverName(),
          // TODO hash?
          "anonymous": this.anonymous
        }
      };
      const request
      /*: Parameters<typeof CountlyAnalytics.prototype.request>[0]*/
      = {
        begin_session: 1,
        user_details: JSON.stringify(userDetails)
      };
      const metrics = this.getMetrics();

      if (metrics) {
        request.metrics = JSON.stringify(metrics);
      }

      await this.request(request);
    }
  }

  reportViewDuration() {
    if (this.lastView) {
      this.track("[CLY]_view", {
        name: this.lastView
      }, null, {
        dur: this.trackTime ? CountlyAnalytics.getTimestamp() - this.lastViewTime : this.lastViewStoredDuration
      });
      this.lastView = null;
    }
  }

  trackSessions() {
    this.beginSession();
    this.startTime();
    window.addEventListener("beforeunload", this.endSession);
    window.addEventListener("unload", this.endSession);
    window.addEventListener("visibilitychange", this.onVisibilityChange);
    window.addEventListener("mousemove", this.onUserActivity);
    window.addEventListener("click", this.onUserActivity);
    window.addEventListener("keydown", this.onUserActivity);
    window.addEventListener("scroll", this.onUserActivity);
    this.activityIntervalId = setInterval(() => {
      this.inactivityCounter++;

      if (this.inactivityCounter >= INACTIVITY_TIME) {
        this.stopTime();
      }
    }, 60000);
  }

  trackBeginInvite(roomId
  /*: string*/
  ) {
    this.track("begin_invite", {}, roomId);
  }

  trackSendInvite(startTime
  /*: number*/
  , roomId
  /*: string*/
  , qty
  /*: number*/
  ) {
    this.track("send_invite", {}, roomId, {
      dur: CountlyAnalytics.getTimestamp() - startTime,
      sum: qty
    });
  }

  async trackRoomCreate(startTime
  /*: number*/
  , roomId
  /*: string*/
  ) {
    if (this.disabled) return;
    let endTime = CountlyAnalytics.getTimestamp();

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (!cli.getRoom(roomId)) {
      await new Promise(resolve => {
        const handler = room => {
          if (room.roomId === roomId) {
            cli.off("Room", handler);
            resolve();
          }
        };

        cli.on("Room", handler);
      });
      endTime = CountlyAnalytics.getTimestamp();
    }

    this.track("create_room", {}, roomId, {
      dur: endTime - startTime
    });
  }

  trackRoomJoin(startTime
  /*: number*/
  , roomId
  /*: string*/
  , type
  /*: IJoinRoomEvent["segmentation"]["type"]*/
  ) {
    this.track("join_room", {
      type
    }, roomId, {
      dur: CountlyAnalytics.getTimestamp() - startTime
    });
  }

  async trackSendMessage(startTime
  /*: number*/
  , // eslint-disable-next-line camelcase
  sendPromise
  /*: Promise<{event_id: string}>*/
  , roomId
  /*: string*/
  , isEdit
  /*: boolean*/
  , isReply
  /*: boolean*/
  , content
  /*: {format?: string, msgtype: string}*/
  ) {
    if (this.disabled) return;

    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(roomId);
    const eventId = (await sendPromise).event_id;
    let endTime = CountlyAnalytics.getTimestamp();

    if (!room.findEventById(eventId)) {
      await new Promise(resolve => {
        const handler = ev => {
          if (ev.getId() === eventId) {
            room.off("Room.localEchoUpdated", handler);
            resolve();
          }
        };

        room.on("Room.localEchoUpdated", handler);
      });
      endTime = CountlyAnalytics.getTimestamp();
    }

    this.track("send_message", {
      is_edit: isEdit,
      is_reply: isReply,
      msgtype: content.msgtype,
      format: content.format
    }, roomId, {
      dur: endTime - startTime
    });
  }

  trackStartCall(roomId
  /*: string*/
  , isVideo = false, isJitsi = false) {
    this.track("start_call", {
      is_video: isVideo,
      is_jitsi: isJitsi
    }, roomId);
  }

  trackJoinCall(roomId
  /*: string*/
  , isVideo = false, isJitsi = false) {
    this.track("join_call", {
      is_video: isVideo,
      is_jitsi: isJitsi
    }, roomId);
  }

  trackRoomDirectoryBegin() {
    this.track("room_directory");
  }

  trackRoomDirectory(startTime
  /*: number*/
  ) {
    this.track("room_directory_done", {}, null, {
      dur: CountlyAnalytics.getTimestamp() - startTime
    });
  }

  trackRoomDirectorySearch(numResults
  /*: number*/
  , query
  /*: string*/
  ) {
    this.track("room_directory_search", {
      query_length: query.length,
      query_num_words: query.split(" ").length
    }, null, {
      sum: numResults
    });
  }

  async track(key
  /*: E["key"]*/
  , segments
  /*: Omit<E["segmentation"], "room_id" | "num_users" | "is_encrypted" | "is_public">*/
  , roomId
  /*: string*/
  , args
  /*: Partial<Pick<E, "dur" | "sum" | "timestamp">>*/
  , anonymous = false) {
    if (this.disabled && !anonymous) return;
    let segmentation = segments || {};

    if (roomId) {
      segmentation = _objectSpread(_objectSpread({
        room_id: await hashHex(roomId)
      }, getRoomStats(roomId)), segments);
    }

    this.queue(_objectSpread({
      key,
      count: 1,
      segmentation
    }, args)); // if this event can be sent anonymously and we are disabled then dispatch it right away

    if (this.disabled && anonymous) {
      await this.request({
        device_id: (0, _randomstring.randomString)(64)
      });
    }
  }

} // expose on window for easy access from the console


exports.default = CountlyAnalytics;
(0, _defineProperty2.default)(CountlyAnalytics, "internalInstance", new CountlyAnalytics());
window.mxCountlyAnalytics = CountlyAnalytics;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9Db3VudGx5QW5hbHl0aWNzLnRzIl0sIm5hbWVzIjpbIlRleHRFbmNvZGVyIiwid2luZG93IiwiVGV4dEVuY29kaW5nVXRmOCIsIklOQUNUSVZJVFlfVElNRSIsIkhFQVJUQkVBVF9JTlRFUlZBTCIsIlNFU1NJT05fVVBEQVRFX0lOVEVSVkFMIiwiTUFYX1BFTkRJTkdfRVZFTlRTIiwiT3JpZW50YXRpb24iLCJoYXNoSGV4IiwiaW5wdXQiLCJidWYiLCJlbmNvZGUiLCJkaWdlc3RCdWYiLCJjcnlwdG8iLCJzdWJ0bGUiLCJkaWdlc3QiLCJVaW50OEFycmF5IiwibWFwIiwiYiIsInRvU3RyaW5nIiwicGFkU3RhcnQiLCJqb2luIiwia25vd25TY3JlZW5zIiwiU2V0IiwiZ2V0Vmlld0RhdGEiLCJhbm9ueW1vdXMiLCJyYW5kIiwib3JpZ2luIiwiaGFzaCIsImxvY2F0aW9uIiwicGF0aG5hbWUiLCJzdGFydHNXaXRoIiwiXyIsInNjcmVlbiIsInBhcnRzIiwic3BsaXQiLCJoYXMiLCJpIiwibGVuZ3RoIiwiaGFzaFN0ciIsInVybCIsIm1ldGEiLCJuYW1lIiwicm9vbUlkIiwiUm9vbVZpZXdTdG9yZSIsImdldFJvb21JZCIsIk9iamVjdCIsImFzc2lnbiIsImdldFJvb21TdGF0cyIsImNsaSIsIk1hdHJpeENsaWVudFBlZyIsImdldCIsInJvb20iLCJnZXRSb29tIiwiZ2V0Sm9pbmVkTWVtYmVyQ291bnQiLCJpc1Jvb21FbmNyeXB0ZWQiLCJjdXJyZW50U3RhdGUiLCJnZXRTdGF0ZUV2ZW50cyIsImdldENvbnRlbnQiLCJqb2luX3J1bGUiLCJzdHJSZXBsYWNlQXN5bmMiLCJzdHIiLCJyZWdleCIsImZuIiwicHJvbWlzZXMiLCJyZXBsYWNlIiwiYXJncyIsInB1c2giLCJ2YWx1ZXMiLCJQcm9taXNlIiwiYWxsIiwic2hpZnQiLCJDb3VudGx5QW5hbHl0aWNzIiwiZ2V0VGltZXN0YW1wIiwiaW5uZXJXaWR0aCIsImlubmVySGVpZ2h0IiwiTGFuZHNjYXBlIiwiUG9ydHJhaXQiLCJ0cmFjayIsIm1vZGUiLCJnZXRPcmllbnRhdGlvbiIsInNlc3Npb25TdGFydGVkIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInJlcG9ydE9yaWVudGF0aW9uIiwicmVwb3J0Vmlld0R1cmF0aW9uIiwicmVxdWVzdCIsImVuZF9zZXNzaW9uIiwic2Vzc2lvbl9kdXJhdGlvbiIsImxhc3RCZWF0IiwiZG9jdW1lbnQiLCJoaWRkZW4iLCJzdG9wVGltZSIsInN0YXJ0VGltZSIsImluYWN0aXZpdHlDb3VudGVyIiwiaW5zdGFuY2UiLCJpbnRlcm5hbEluc3RhbmNlIiwiZGlzYWJsZWQiLCJiYXNlVXJsIiwiY2FuRW5hYmxlIiwiY29uZmlnIiwiU2RrQ29uZmlnIiwiQm9vbGVhbiIsIm5hdmlnYXRvciIsImRvTm90VHJhY2siLCJjb3VudGx5IiwiYXBwS2V5IiwiY2hhbmdlVXNlcktleSIsInVzZXJLZXkiLCJtZXJnZSIsIm9sZFVzZXJLZXkiLCJvbGRfZGV2aWNlX2lkIiwiZW5hYmxlIiwiVVJMIiwiZ2V0VXNlcklkIiwicGxhdGZvcm0iLCJQbGF0Zm9ybVBlZyIsImFwcFBsYXRmb3JtIiwiZ2V0SHVtYW5SZWFkYWJsZU5hbWUiLCJhcHBWZXJzaW9uIiwiZ2V0QXBwVmVyc2lvbiIsImUiLCJjb25zb2xlIiwid2FybiIsImhlYXJ0YmVhdEludGVydmFsSWQiLCJzZXRJbnRlcnZhbCIsImhlYXJ0YmVhdCIsImJpbmQiLCJ0cmFja1Nlc3Npb25zIiwidHJhY2tFcnJvcnMiLCJkaXNhYmxlIiwiZW5kU2Vzc2lvbiIsImNsZWFySW50ZXJ2YWwiLCJjbGVhclRpbWVvdXQiLCJhY3Rpdml0eUludGVydmFsSWQiLCJvblZpc2liaWxpdHlDaGFuZ2UiLCJvblVzZXJBY3Rpdml0eSIsInJlcG9ydEZlZWRiYWNrIiwicmF0aW5nIiwiY29tbWVudCIsInRyYWNrUGFnZUNoYW5nZSIsImdlbmVyYXRpb25UaW1lTXMiLCJ0cmFja1BhZ2VWaWV3Iiwidmlld0RhdGEiLCJwYWdlIiwibGFzdFZpZXciLCJsYXN0Vmlld1RpbWUiLCJzZWdtZW50cyIsInZpc2l0IiwiZG9tYWluIiwiaG9zdG5hbWUiLCJ2aWV3Iiwic2VnbWVudCIsInN0YXJ0IiwiZmlyc3RQYWdlIiwiTWF0aCIsImZsb29yIiwiRGF0ZSIsImdldFRpbWUiLCJnZXRNc1RpbWVzdGFtcCIsInRzIiwibGFzdE1zVHMiLCJyZWNvcmRFcnJvciIsImVyciIsImZhdGFsIiwiZXJyb3IiLCJzdGFjayIsIm1lc3NhZ2UiLCJmaWxlTmFtZSIsImxpbmVOdW1iZXIiLCJjb2x1bW5OdW1iZXIiLCJzdWJzdHJpbmciLCJnbHlwaCIsIm1ldHJpY3MiLCJnZXRNZXRyaWNzIiwib2IiLCJfcmVzb2x1dGlvbiIsIl9lcnJvciIsIl9hcHBfdmVyc2lvbiIsIl9ydW4iLCJpbml0VGltZSIsIl9ub25mYXRhbCIsIl92aWV3Iiwib25MaW5lIiwiX29ubGluZSIsIl9iYWNrZ3JvdW5kIiwiaGFzRm9jdXMiLCJjcmFzaCIsIkpTT04iLCJzdHJpbmdpZnkiLCJvbmVycm9yIiwibXNnIiwibGluZSIsImNvbCIsImYiLCJhcmd1bWVudHMiLCJjYWxsZWUiLCJjYWxsZXIiLCJleCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsIkVycm9yIiwicmVhc29uIiwidHJhY2tUaW1lIiwibGFzdCIsInBlbmRpbmdFdmVudHMiLCJhcHBfa2V5IiwiZGV2aWNlX2lkIiwiZ2V0VGltZVBhcmFtcyIsIkVWRU5UX0JBVENIX1NJWkUiLCJldmVudHMiLCJzcGxpY2UiLCJwYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJmZXRjaCIsIm1ldGhvZCIsImNhY2hlIiwicmVkaXJlY3QiLCJoZWFkZXJzIiwiYm9keSIsImRhdGUiLCJ0aW1lc3RhbXAiLCJob3VyIiwiZ2V0SG91cnMiLCJkb3ciLCJnZXREYXkiLCJxdWV1ZSIsImNvdW50IiwicmVzdCIsImV2IiwiYXBwX3ZlcnNpb24iLCJzdG9yZWREdXJhdGlvbiIsImxhc3RWaWV3U3RvcmVkRHVyYXRpb24iLCJ1bmRlZmluZWQiLCJfdWEiLCJ1c2VyQWdlbnQiLCJ3aWR0aCIsImhlaWdodCIsImRldmljZVBpeGVsUmF0aW8iLCJfZGVuc2l0eSIsIl9sb2NhbGUiLCJiZWdpblNlc3Npb24iLCJoZWFydGJlYXRFbmFibGVkIiwidXNlckRldGFpbHMiLCJjdXN0b20iLCJnZXRIb21lc2VydmVyTmFtZSIsImJlZ2luX3Nlc3Npb24iLCJ1c2VyX2RldGFpbHMiLCJkdXIiLCJ0cmFja0JlZ2luSW52aXRlIiwidHJhY2tTZW5kSW52aXRlIiwicXR5Iiwic3VtIiwidHJhY2tSb29tQ3JlYXRlIiwiZW5kVGltZSIsInJlc29sdmUiLCJoYW5kbGVyIiwib2ZmIiwib24iLCJ0cmFja1Jvb21Kb2luIiwidHlwZSIsInRyYWNrU2VuZE1lc3NhZ2UiLCJzZW5kUHJvbWlzZSIsImlzRWRpdCIsImlzUmVwbHkiLCJjb250ZW50IiwiZXZlbnRJZCIsImV2ZW50X2lkIiwiZmluZEV2ZW50QnlJZCIsImdldElkIiwiaXNfZWRpdCIsImlzX3JlcGx5IiwibXNndHlwZSIsImZvcm1hdCIsInRyYWNrU3RhcnRDYWxsIiwiaXNWaWRlbyIsImlzSml0c2kiLCJpc192aWRlbyIsImlzX2ppdHNpIiwidHJhY2tKb2luQ2FsbCIsInRyYWNrUm9vbURpcmVjdG9yeUJlZ2luIiwidHJhY2tSb29tRGlyZWN0b3J5IiwidHJhY2tSb29tRGlyZWN0b3J5U2VhcmNoIiwibnVtUmVzdWx0cyIsInF1ZXJ5IiwicXVlcnlfbGVuZ3RoIiwicXVlcnlfbnVtX3dvcmRzIiwia2V5Iiwic2VnbWVudGF0aW9uIiwicm9vbV9pZCIsIm14Q291bnRseUFuYWx5dGljcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBOzs7Ozs7QUFDQSxJQUFJQSxXQUFXLEdBQUdDLE1BQU0sQ0FBQ0QsV0FBekI7O0FBQ0EsSUFBSSxDQUFDQSxXQUFMLEVBQWtCO0FBQ2RBLEVBQUFBLFdBQVcsR0FBR0UsZ0JBQWdCLENBQUNG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LEVBQUUsZ0NBQWEsRUFBYjtBQUFiLE9BQWIsQ0FBTjtBQUNIO0FBQ0o7O0FBL2xCaUMsQyxDQWttQnRDOzs7OzhCQWxtQnFCdEksZ0Isc0JBdUJpQixJQUFJQSxnQkFBSixFO0FBNGtCdEN2RSxNQUFNLENBQUNnUyxrQkFBUCxHQUE0QnpOLGdCQUE1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCB7cmFuZG9tU3RyaW5nfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvcmFuZG9tc3RyaW5nXCI7XG5cbmltcG9ydCB7Z2V0Q3VycmVudExhbmd1YWdlfSBmcm9tICcuL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUGxhdGZvcm1QZWcgZnJvbSAnLi9QbGF0Zm9ybVBlZyc7XG5pbXBvcnQgU2RrQ29uZmlnIGZyb20gJy4vU2RrQ29uZmlnJztcbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tIFwiLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCB7c2xlZXB9IGZyb20gXCIuL3V0aWxzL3Byb21pc2VcIjtcbmltcG9ydCBSb29tVmlld1N0b3JlIGZyb20gXCIuL3N0b3Jlcy9Sb29tVmlld1N0b3JlXCI7XG5cbi8vIHBvbHlmaWxsIHRleHRlbmNvZGVyIGlmIG5lY2Vzc2FyeVxuaW1wb3J0ICogYXMgVGV4dEVuY29kaW5nVXRmOCBmcm9tICd0ZXh0LWVuY29kaW5nLXV0Zi04JztcbmxldCBUZXh0RW5jb2RlciA9IHdpbmRvdy5UZXh0RW5jb2RlcjtcbmlmICghVGV4dEVuY29kZXIpIHtcbiAgICBUZXh0RW5jb2RlciA9IFRleHRFbmNvZGluZ1V0ZjguVGV4dEVuY29kZXI7XG59XG5cbmNvbnN0IElOQUNUSVZJVFlfVElNRSA9IDIwOyAvLyBzZWNvbmRzXG5jb25zdCBIRUFSVEJFQVRfSU5URVJWQUwgPSA1XzAwMDsgLy8gbXNcbmNvbnN0IFNFU1NJT05fVVBEQVRFX0lOVEVSVkFMID0gNjA7IC8vIHNlY29uZHNcbmNvbnN0IE1BWF9QRU5ESU5HX0VWRU5UUyA9IDEwMDA7XG5cbmVudW0gT3JpZW50YXRpb24ge1xuICAgIExhbmRzY2FwZSA9IFwibGFuZHNjYXBlXCIsXG4gICAgUG9ydHJhaXQgPSBcInBvcnRyYWl0XCIsXG59XG5cbi8qIGVzbGludC1kaXNhYmxlIGNhbWVsY2FzZSAqL1xuaW50ZXJmYWNlIElNZXRyaWNzIHtcbiAgICBfcmVzb2x1dGlvbj86IHN0cmluZztcbiAgICBfYXBwX3ZlcnNpb24/OiBzdHJpbmc7XG4gICAgX2RlbnNpdHk/OiBudW1iZXI7XG4gICAgX3VhPzogc3RyaW5nO1xuICAgIF9sb2NhbGU/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJRXZlbnQge1xuICAgIGtleTogc3RyaW5nO1xuICAgIGNvdW50OiBudW1iZXI7XG4gICAgc3VtPzogbnVtYmVyO1xuICAgIGR1cj86IG51bWJlcjtcbiAgICBzZWdtZW50YXRpb24/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgICB0aW1lc3RhbXA/OiBudW1iZXI7IC8vIFRPRE8gc2hvdWxkIHdlIHVzZSB0aGUgdGltZXN0YW1wIHdoZW4gd2Ugc3RhcnQgb3IgZW5kIGZvciB0aGUgZXZlbnQgdGltZXN0YW1wXG4gICAgaG91cj86IHVua25vd247XG4gICAgZG93PzogdW5rbm93bjtcbn1cblxuaW50ZXJmYWNlIElWaWV3RXZlbnQgZXh0ZW5kcyBJRXZlbnQge1xuICAgIGtleTogXCJbQ0xZXV92aWV3XCI7XG59XG5cbmludGVyZmFjZSBJT3JpZW50YXRpb25FdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcIltDTFldX29yaWVudGF0aW9uXCI7XG4gICAgc2VnbWVudGF0aW9uOiB7XG4gICAgICAgIG1vZGU6IE9yaWVudGF0aW9uO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBJU3RhclJhdGluZ0V2ZW50IGV4dGVuZHMgSUV2ZW50IHtcbiAgICBrZXk6IFwiW0NMWV1fc3Rhcl9yYXRpbmdcIjtcbiAgICBzZWdtZW50YXRpb246IHtcbiAgICAgICAgLy8gd2UganVzdCBjYXJlIGFib3V0IGNvbGxlY3RpbmcgZmVlZGJhY2ssIG5vIG5lZWQgdG8gYXNzb2NpYXRlIHdpdGggYSBmZWVkYmFjayB3aWRnZXRcbiAgICAgICAgd2lkZ2V0X2lkPzogc3RyaW5nO1xuICAgICAgICBjb250YWN0TWU/OiBib29sZWFuO1xuICAgICAgICBlbWFpbD86IHN0cmluZztcbiAgICAgICAgcmF0aW5nOiAxIHwgMiB8IDMgfCA0IHwgNTtcbiAgICAgICAgY29tbWVudDogc3RyaW5nO1xuICAgIH07XG59XG5cbnR5cGUgVmFsdWUgPSBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuO1xuXG5pbnRlcmZhY2UgSU9wZXJhdGlvbkluYyB7XG4gICAgXCIkaW5jXCI6IG51bWJlcjtcbn1cbmludGVyZmFjZSBJT3BlcmF0aW9uTXVsIHtcbiAgICBcIiRtdWxcIjogbnVtYmVyO1xufVxuaW50ZXJmYWNlIElPcGVyYXRpb25NYXgge1xuICAgIFwiJG1heFwiOiBudW1iZXI7XG59XG5pbnRlcmZhY2UgSU9wZXJhdGlvbk1pbiB7XG4gICAgXCIkbWluXCI6IG51bWJlcjtcbn1cbmludGVyZmFjZSBJT3BlcmF0aW9uU2V0T25jZSB7XG4gICAgXCIkc2V0T25jZVwiOiBWYWx1ZTtcbn1cbmludGVyZmFjZSBJT3BlcmF0aW9uUHVzaCB7XG4gICAgXCIkcHVzaFwiOiBWYWx1ZSB8IFZhbHVlW107XG59XG5pbnRlcmZhY2UgSU9wZXJhdGlvbkFkZFRvU2V0IHtcbiAgICBcIiRhZGRUb1NldFwiOiBWYWx1ZSB8IFZhbHVlW107XG59XG5pbnRlcmZhY2UgSU9wZXJhdGlvblB1bGwge1xuICAgIFwiJHB1bGxcIjogVmFsdWUgfCBWYWx1ZVtdO1xufVxuXG50eXBlIE9wZXJhdGlvbiA9XG4gICAgSU9wZXJhdGlvbkluYyB8XG4gICAgSU9wZXJhdGlvbk11bCB8XG4gICAgSU9wZXJhdGlvbk1heCB8XG4gICAgSU9wZXJhdGlvbk1pbiB8XG4gICAgSU9wZXJhdGlvblNldE9uY2UgfFxuICAgIElPcGVyYXRpb25QdXNoIHxcbiAgICBJT3BlcmF0aW9uQWRkVG9TZXQgfFxuICAgIElPcGVyYXRpb25QdWxsO1xuXG5pbnRlcmZhY2UgSVVzZXJEZXRhaWxzIHtcbiAgICBuYW1lPzogc3RyaW5nO1xuICAgIHVzZXJuYW1lPzogc3RyaW5nO1xuICAgIGVtYWlsPzogc3RyaW5nO1xuICAgIG9yZ2FuaXphdGlvbj86IHN0cmluZztcbiAgICBwaG9uZT86IHN0cmluZztcbiAgICBwaWN0dXJlPzogc3RyaW5nO1xuICAgIGdlbmRlcj86IHN0cmluZztcbiAgICBieWVhcj86IG51bWJlcjtcbiAgICBjdXN0b20/OiBSZWNvcmQ8c3RyaW5nLCBWYWx1ZSB8IE9wZXJhdGlvbj47IC8vIGAuYCBhbmQgYCRgIHdpbGwgYmUgc3RyaXBwZWQgb3V0XG59XG5cbmludGVyZmFjZSBJQ3Jhc2gge1xuICAgIF9yZXNvbHV0aW9uPzogc3RyaW5nO1xuICAgIF9hcHBfdmVyc2lvbjogc3RyaW5nO1xuXG4gICAgX3JhbV9jdXJyZW50PzogbnVtYmVyO1xuICAgIF9yYW1fdG90YWw/OiBudW1iZXI7XG4gICAgX2Rpc2tfY3VycmVudD86IG51bWJlcjtcbiAgICBfZGlza190b3RhbD86IG51bWJlcjtcbiAgICBfb3JpZW50YXRpb24/OiBPcmllbnRhdGlvbjtcblxuICAgIF9vbmxpbmU/OiBib29sZWFuO1xuICAgIF9tdXRlZD86IGJvb2xlYW47XG4gICAgX2JhY2tncm91bmQ/OiBib29sZWFuO1xuICAgIF92aWV3Pzogc3RyaW5nO1xuXG4gICAgX25hbWU/OiBzdHJpbmc7XG4gICAgX2Vycm9yOiBzdHJpbmc7XG4gICAgX25vbmZhdGFsPzogYm9vbGVhbjtcbiAgICBfbG9ncz86IHN0cmluZztcbiAgICBfcnVuPzogbnVtYmVyO1xuXG4gICAgX2N1c3RvbT86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBJUGFyYW1zIHtcbiAgICAvLyBBUFBfS0VZIG9mIGFuIGFwcCBmb3Igd2hpY2ggdG8gcmVwb3J0XG4gICAgYXBwX2tleTogc3RyaW5nO1xuICAgIC8vIFVzZXIgaWRlbnRpZmllclxuICAgIGRldmljZV9pZDogc3RyaW5nO1xuXG4gICAgLy8gU2hvdWxkIHByb3ZpZGUgdmFsdWUgMSB0byBpbmRpY2F0ZSBzZXNzaW9uIHN0YXJ0XG4gICAgYmVnaW5fc2Vzc2lvbj86IG51bWJlcjtcbiAgICAvLyBKU09OIG9iamVjdCBhcyBzdHJpbmcgdG8gcHJvdmlkZSBtZXRyaWNzIHRvIHRyYWNrIHdpdGggdGhlIHVzZXJcbiAgICBtZXRyaWNzPzogc3RyaW5nO1xuICAgIC8vIFByb3ZpZGVzIHNlc3Npb24gZHVyYXRpb24gaW4gc2Vjb25kcywgY2FuIGJlIHVzZWQgYXMgaGVhcnRiZWF0IHRvIHVwZGF0ZSBjdXJyZW50IHNlc3Npb25zIGR1cmF0aW9uLCByZWNvbW1lbmRlZCB0aW1lIGV2ZXJ5IDYwIHNlY29uZHNcbiAgICBzZXNzaW9uX2R1cmF0aW9uPzogbnVtYmVyO1xuICAgIC8vIFNob3VsZCBwcm92aWRlIHZhbHVlIDEgdG8gaW5kaWNhdGUgc2Vzc2lvbiBlbmRcbiAgICBlbmRfc2Vzc2lvbj86IG51bWJlcjtcblxuICAgIC8vIDEwIGRpZ2l0IFVUQyB0aW1lc3RhbXAgZm9yIHJlY29yZGluZyBwYXN0IGRhdGEuXG4gICAgdGltZXN0YW1wPzogbnVtYmVyO1xuICAgIC8vIGN1cnJlbnQgdXNlciBsb2NhbCBob3VyICgwIC0gMjMpXG4gICAgaG91cj86IG51bWJlcjtcbiAgICAvLyBkYXkgb2YgdGhlIHdlZWsgKDAtc3VuZGF5LCAxIC0gbW9uZGF5LCAuLi4gNiAtIHNhdHVyZGF5KVxuICAgIGRvdz86IG51bWJlcjtcblxuICAgIC8vIEpTT04gYXJyYXkgYXMgc3RyaW5nIGNvbnRhaW5pbmcgZXZlbnQgb2JqZWN0c1xuICAgIGV2ZW50cz86IHN0cmluZzsgLy8gSUV2ZW50W11cbiAgICAvLyBKU09OIG9iamVjdCBhcyBzdHJpbmcgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB1c2Vyc1xuICAgIHVzZXJfZGV0YWlscz86IHN0cmluZztcblxuICAgIC8vIHByb3ZpZGUgd2hlbiBjaGFuZ2luZyBkZXZpY2UgSUQsIHNvIHNlcnZlciB3b3VsZCBtZXJnZSB0aGUgZGF0YVxuICAgIG9sZF9kZXZpY2VfaWQ/OiBzdHJpbmc7XG5cbiAgICAvLyBTZWUgSUNyYXNoXG4gICAgY3Jhc2g/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBJUm9vbVNlZ21lbnRzIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgVmFsdWU+IHtcbiAgICByb29tX2lkOiBzdHJpbmc7IC8vIGhhc2hlZFxuICAgIG51bV91c2VyczogbnVtYmVyO1xuICAgIGlzX2VuY3J5cHRlZDogYm9vbGVhbjtcbiAgICBpc19wdWJsaWM6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU2VuZE1lc3NhZ2VFdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcInNlbmRfbWVzc2FnZVwiO1xuICAgIGR1cjogbnVtYmVyOyAvLyBob3cgbG9uZyBpdCB0byBzZW5kICh1bnRpbCByZW1vdGUgZWNobylcbiAgICBzZWdtZW50YXRpb246IElSb29tU2VnbWVudHMgJiB7XG4gICAgICAgIGlzX2VkaXQ6IGJvb2xlYW47XG4gICAgICAgIGlzX3JlcGx5OiBib29sZWFuO1xuICAgICAgICBtc2d0eXBlOiBzdHJpbmc7XG4gICAgICAgIGZvcm1hdD86IHN0cmluZztcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgSVJvb21EaXJlY3RvcnlFdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcInJvb21fZGlyZWN0b3J5XCI7XG59XG5cbmludGVyZmFjZSBJUm9vbURpcmVjdG9yeURvbmVFdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcInJvb21fZGlyZWN0b3J5X2RvbmVcIjtcbiAgICBkdXI6IG51bWJlcjsgLy8gdGltZSBzcGVudCBpbiB0aGUgcm9vbSBkaXJlY3RvcnkgbW9kYWxcbn1cblxuaW50ZXJmYWNlIElSb29tRGlyZWN0b3J5U2VhcmNoRXZlbnQgZXh0ZW5kcyBJRXZlbnQge1xuICAgIGtleTogXCJyb29tX2RpcmVjdG9yeV9zZWFyY2hcIjtcbiAgICBzdW06IG51bWJlcjsgLy8gbnVtYmVyIG9mIHNlYXJjaCByZXN1bHRzXG4gICAgc2VnbWVudGF0aW9uOiB7XG4gICAgICAgIHF1ZXJ5X2xlbmd0aDogbnVtYmVyO1xuICAgICAgICBxdWVyeV9udW1fd29yZHM6IG51bWJlcjtcbiAgICB9O1xufVxuXG5pbnRlcmZhY2UgSVN0YXJ0Q2FsbEV2ZW50IGV4dGVuZHMgSUV2ZW50IHtcbiAgICBrZXk6IFwic3RhcnRfY2FsbFwiO1xuICAgIHNlZ21lbnRhdGlvbjogSVJvb21TZWdtZW50cyAmIHtcbiAgICAgICAgaXNfdmlkZW86IGJvb2xlYW47XG4gICAgICAgIGlzX2ppdHNpOiBib29sZWFuO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBJSm9pbkNhbGxFdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcImpvaW5fY2FsbFwiO1xuICAgIHNlZ21lbnRhdGlvbjogSVJvb21TZWdtZW50cyAmIHtcbiAgICAgICAgaXNfdmlkZW86IGJvb2xlYW47XG4gICAgICAgIGlzX2ppdHNpOiBib29sZWFuO1xuICAgIH07XG59XG5cbmludGVyZmFjZSBJQmVnaW5JbnZpdGVFdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcImJlZ2luX2ludml0ZVwiO1xuICAgIHNlZ21lbnRhdGlvbjogSVJvb21TZWdtZW50cztcbn1cblxuaW50ZXJmYWNlIElTZW5kSW52aXRlRXZlbnQgZXh0ZW5kcyBJRXZlbnQge1xuICAgIGtleTogXCJzZW5kX2ludml0ZVwiO1xuICAgIHN1bTogbnVtYmVyOyAvLyBxdWFudGl0eSB0aGF0IHdhcyBpbnZpdGVkXG4gICAgc2VnbWVudGF0aW9uOiBJUm9vbVNlZ21lbnRzO1xufVxuXG5pbnRlcmZhY2UgSUNyZWF0ZVJvb21FdmVudCBleHRlbmRzIElFdmVudCB7XG4gICAga2V5OiBcImNyZWF0ZV9yb29tXCI7XG4gICAgZHVyOiBudW1iZXI7IC8vIGhvdyBsb25nIGl0IHRvb2sgdG8gY3JlYXRlICh1bnRpbCByZW1vdGUgZWNobylcbiAgICBzZWdtZW50YXRpb246IHtcbiAgICAgICAgcm9vbV9pZDogc3RyaW5nOyAvLyBoYXNoZWRcbiAgICAgICAgbnVtX3VzZXJzOiBudW1iZXI7XG4gICAgICAgIGlzX2VuY3J5cHRlZDogYm9vbGVhbjtcbiAgICAgICAgaXNfcHVibGljOiBib29sZWFuO1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElKb2luUm9vbUV2ZW50IGV4dGVuZHMgSUV2ZW50IHtcbiAgICBrZXk6IFwiam9pbl9yb29tXCI7XG4gICAgZHVyOiBudW1iZXI7IC8vIGhvdyBsb25nIGl0IHRvb2sgdG8gam9pbiAodW50aWwgcmVtb3RlIGVjaG8pXG4gICAgc2VnbWVudGF0aW9uOiB7XG4gICAgICAgIHJvb21faWQ6IHN0cmluZzsgLy8gaGFzaGVkXG4gICAgICAgIG51bV91c2VyczogbnVtYmVyO1xuICAgICAgICBpc19lbmNyeXB0ZWQ6IGJvb2xlYW47XG4gICAgICAgIGlzX3B1YmxpYzogYm9vbGVhbjtcbiAgICAgICAgdHlwZTogXCJyb29tX2RpcmVjdG9yeVwiIHwgXCJzbGFzaF9jb21tYW5kXCIgfCBcImxpbmtcIiB8IFwiaW52aXRlXCI7XG4gICAgfTtcbn1cbi8qIGVzbGludC1lbmFibGUgY2FtZWxjYXNlICovXG5cbmNvbnN0IGhhc2hIZXggPSBhc3luYyAoaW5wdXQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgYnVmID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKGlucHV0KTtcbiAgICBjb25zdCBkaWdlc3RCdWYgPSBhd2FpdCB3aW5kb3cuY3J5cHRvLnN1YnRsZS5kaWdlc3QoXCJzaGEtMjU2XCIsIGJ1Zik7XG4gICAgcmV0dXJuIFsuLi5uZXcgVWludDhBcnJheShkaWdlc3RCdWYpXS5tYXAoKGI6IG51bWJlcikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKS5qb2luKFwiXCIpO1xufTtcblxuY29uc3Qga25vd25TY3JlZW5zID0gbmV3IFNldChbXG4gICAgXCJyZWdpc3RlclwiLCBcImxvZ2luXCIsIFwiZm9yZ290X3Bhc3N3b3JkXCIsIFwic29mdF9sb2dvdXRcIiwgXCJuZXdcIiwgXCJzZXR0aW5nc1wiLCBcIndlbGNvbWVcIiwgXCJob21lXCIsIFwic3RhcnRcIiwgXCJkaXJlY3RvcnlcIixcbiAgICBcInN0YXJ0X3Nzb1wiLCBcInN0YXJ0X2Nhc1wiLCBcImdyb3Vwc1wiLCBcImNvbXBsZXRlX3NlY3VyaXR5XCIsIFwicG9zdF9yZWdpc3RyYXRpb25cIiwgXCJyb29tXCIsIFwidXNlclwiLCBcImdyb3VwXCIsXG5dKTtcblxuaW50ZXJmYWNlIElWaWV3RGF0YSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHVybDogc3RyaW5nO1xuICAgIG1ldGE6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbi8vIEFwcGx5IGZuIHRvIGFsbCBoYXNoIHBhdGggcGFydHMgYWZ0ZXIgdGhlIDFzdCBvbmVcbmFzeW5jIGZ1bmN0aW9uIGdldFZpZXdEYXRhKGFub255bW91cyA9IHRydWUpOiBQcm9taXNlPElWaWV3RGF0YT4ge1xuICAgIGNvbnN0IHJhbmQgPSByYW5kb21TdHJpbmcoOCk7XG4gICAgY29uc3QgeyBvcmlnaW4sIGhhc2ggfSA9IHdpbmRvdy5sb2NhdGlvbjtcbiAgICBsZXQgeyBwYXRobmFtZSB9ID0gd2luZG93LmxvY2F0aW9uO1xuXG4gICAgLy8gUmVkYWN0IHBhdGhzIHdoaWNoIGNvdWxkIGNvbnRhaW4gdW5leHBlY3RlZCBQSUlcbiAgICBpZiAob3JpZ2luLnN0YXJ0c1dpdGgoJ2ZpbGU6Ly8nKSkge1xuICAgICAgICBwYXRobmFtZSA9IGAvPHJlZGFjdGVkXyR7cmFuZH0+L2A7IC8vIFhYWDogaW5qZWN0IHJhbmQgYmVjYXVzZSBDb3VudC5seSBkb2Vzbid0IGxpa2UgWC0+WCB0cmFuc2l0aW9uc1xuICAgIH1cblxuICAgIGxldCBbXywgc2NyZWVuLCAuLi5wYXJ0c10gPSBoYXNoLnNwbGl0KFwiL1wiKTtcblxuICAgIGlmICgha25vd25TY3JlZW5zLmhhcyhzY3JlZW4pKSB7XG4gICAgICAgIHNjcmVlbiA9IGA8cmVkYWN0ZWRfJHtyYW5kfT5gO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFydHNbaV0gPSBhbm9ueW1vdXMgPyBgPHJlZGFjdGVkXyR7cmFuZH0+YCA6IGF3YWl0IGhhc2hIZXgocGFydHNbaV0pO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hTdHIgPSBgJHtffS8ke3NjcmVlbn0vJHtwYXJ0cy5qb2luKFwiL1wiKX1gO1xuICAgIGNvbnN0IHVybCA9IG9yaWdpbiArIHBhdGhuYW1lICsgaGFzaFN0cjtcblxuICAgIGNvbnN0IG1ldGEgPSB7fTtcblxuICAgIGxldCBuYW1lID0gXCIkL1wiICsgaGFzaDtcbiAgICBzd2l0Y2ggKHNjcmVlbikge1xuICAgICAgICBjYXNlIFwicm9vbVwiOiB7XG4gICAgICAgICAgICBuYW1lID0gXCJ2aWV3X3Jvb21cIjtcbiAgICAgICAgICAgIGNvbnN0IHJvb21JZCA9IFJvb21WaWV3U3RvcmUuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICBuYW1lICs9IFwiIFwiICsgcGFydHNbMF07IC8vIFhYWDogd29ya2Fyb3VuZCBDb3VudC5seSBtaXNzaW5nIFgtPlggdHJhbnNpdGlvbnNcbiAgICAgICAgICAgIG1ldGFbXCJyb29tX2lkXCJdID0gcGFydHNbMF07XG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKG1ldGEsIGdldFJvb21TdGF0cyhyb29tSWQpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgbmFtZSwgdXJsLCBtZXRhIH07XG59XG5cbmNvbnN0IGdldFJvb21TdGF0cyA9IChyb29tSWQ6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICBjb25zdCByb29tID0gY2xpPy5nZXRSb29tKHJvb21JZCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBcIm51bV91c2Vyc1wiOiByb29tPy5nZXRKb2luZWRNZW1iZXJDb3VudCgpLFxuICAgICAgICBcImlzX2VuY3J5cHRlZFwiOiBjbGk/LmlzUm9vbUVuY3J5cHRlZChyb29tSWQpLFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIFwiaXNfcHVibGljXCI6IHJvb20/LmN1cnJlbnRTdGF0ZS5nZXRTdGF0ZUV2ZW50cyhcIm0ucm9vbS5qb2luX3J1bGVzXCIsIFwiXCIpPy5nZXRDb250ZW50KCk/LmpvaW5fcnVsZSA9PT0gXCJwdWJsaWNcIixcbiAgICB9XG59XG5cbi8vIGFzeW5jIHdyYXBwZXIgZm9yIHJlZ2V4LXBvd2VyZWQgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlXG5jb25zdCBzdHJSZXBsYWNlQXN5bmMgPSBhc3luYyAoc3RyOiBzdHJpbmcsIHJlZ2V4OiBSZWdFeHAsIGZuOiAoLi4uYXJnczogc3RyaW5nW10pID0+IFByb21pc2U8c3RyaW5nPikgPT4ge1xuICAgIGNvbnN0IHByb21pc2VzOiBQcm9taXNlPHN0cmluZz5bXSA9IFtdO1xuICAgIC8vIGRyeS1ydW4gdG8gY2FsY3VsYXRlIHRoZSByZXBsYWNlIHZhbHVlc1xuICAgIHN0ci5yZXBsYWNlKHJlZ2V4LCAoLi4uYXJnczogc3RyaW5nW10pID0+IHtcbiAgICAgICAgcHJvbWlzZXMucHVzaChmbiguLi5hcmdzKSk7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH0pO1xuICAgIGNvbnN0IHZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKHByb21pc2VzKTtcbiAgICByZXR1cm4gc3RyLnJlcGxhY2UocmVnZXgsICgpID0+IHZhbHVlcy5zaGlmdCgpKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENvdW50bHlBbmFseXRpY3Mge1xuICAgIHByaXZhdGUgYmFzZVVybDogVVJMID0gbnVsbDtcbiAgICBwcml2YXRlIGFwcEtleTogc3RyaW5nID0gbnVsbDtcbiAgICBwcml2YXRlIHVzZXJLZXk6IHN0cmluZyA9IG51bGw7XG4gICAgcHJpdmF0ZSBhbm9ueW1vdXM6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBhcHBQbGF0Zm9ybTogc3RyaW5nO1xuICAgIHByaXZhdGUgYXBwVmVyc2lvbiA9IFwidW5rbm93blwiO1xuXG4gICAgcHJpdmF0ZSBpbml0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG4gICAgcHJpdmF0ZSBmaXJzdFBhZ2UgPSB0cnVlO1xuICAgIHByaXZhdGUgaGVhcnRiZWF0SW50ZXJ2YWxJZDogTm9kZUpTLlRpbWVvdXQ7XG4gICAgcHJpdmF0ZSBhY3Rpdml0eUludGVydmFsSWQ6IE5vZGVKUy5UaW1lb3V0O1xuICAgIHByaXZhdGUgdHJhY2tUaW1lID0gdHJ1ZTtcbiAgICBwcml2YXRlIGxhc3RCZWF0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBzdG9yZWREdXJhdGlvbiA9IDA7XG4gICAgcHJpdmF0ZSBsYXN0Vmlldzogc3RyaW5nO1xuICAgIHByaXZhdGUgbGFzdFZpZXdUaW1lID0gMDtcbiAgICBwcml2YXRlIGxhc3RWaWV3U3RvcmVkRHVyYXRpb24gPSAwO1xuICAgIHByaXZhdGUgc2Vzc2lvblN0YXJ0ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIGhlYXJ0YmVhdEVuYWJsZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIGluYWN0aXZpdHlDb3VudGVyID0gMDtcbiAgICBwcml2YXRlIHBlbmRpbmdFdmVudHM6IElFdmVudFtdID0gW107XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbEluc3RhbmNlID0gbmV3IENvdW50bHlBbmFseXRpY3MoKTtcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0IGluc3RhbmNlKCk6IENvdW50bHlBbmFseXRpY3Mge1xuICAgICAgICByZXR1cm4gQ291bnRseUFuYWx5dGljcy5pbnRlcm5hbEluc3RhbmNlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZGlzYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5iYXNlVXJsO1xuICAgIH1cblxuICAgIHB1YmxpYyBjYW5FbmFibGUoKSB7XG4gICAgICAgIGNvbnN0IGNvbmZpZyA9IFNka0NvbmZpZy5nZXQoKTtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4obmF2aWdhdG9yLmRvTm90VHJhY2sgIT09IFwiMVwiICYmIGNvbmZpZz8uY291bnRseT8udXJsICYmIGNvbmZpZz8uY291bnRseT8uYXBwS2V5KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIGNoYW5nZVVzZXJLZXkodXNlcktleTogc3RyaW5nLCBtZXJnZSA9IGZhbHNlKSB7XG4gICAgICAgIGNvbnN0IG9sZFVzZXJLZXkgPSB0aGlzLnVzZXJLZXk7XG4gICAgICAgIHRoaXMudXNlcktleSA9IHVzZXJLZXk7XG4gICAgICAgIGlmIChvbGRVc2VyS2V5ICYmIG1lcmdlKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnJlcXVlc3QoeyBvbGRfZGV2aWNlX2lkOiBvbGRVc2VyS2V5IH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGVuYWJsZShhbm9ueW1vdXMgPSB0cnVlKSB7XG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiB0aGlzLmFub255bW91cyA9PT0gYW5vbnltb3VzKSByZXR1cm47XG4gICAgICAgIGlmICghdGhpcy5jYW5FbmFibGUoKSkgcmV0dXJuO1xuXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xuICAgICAgICAgICAgLy8gZmx1c2ggcmVxdWVzdCBxdWV1ZSBhcyBvdXIgdXNlcktleSBpcyBnb2luZyB0byBjaGFuZ2UsIG5vIG5lZWQgdG8gYXdhaXQgaXRcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY29uZmlnID0gU2RrQ29uZmlnLmdldCgpO1xuICAgICAgICB0aGlzLmJhc2VVcmwgPSBuZXcgVVJMKFwiL2lcIiwgY29uZmlnLmNvdW50bHkudXJsKTtcbiAgICAgICAgdGhpcy5hcHBLZXkgPSBjb25maWcuY291bnRseS5hcHBLZXk7XG5cbiAgICAgICAgdGhpcy5hbm9ueW1vdXMgPSBhbm9ueW1vdXM7XG4gICAgICAgIGlmIChhbm9ueW1vdXMpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY2hhbmdlVXNlcktleShyYW5kb21TdHJpbmcoNjQpKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5jaGFuZ2VVc2VyS2V5KGF3YWl0IGhhc2hIZXgoTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFVzZXJJZCgpKSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwbGF0Zm9ybSA9IFBsYXRmb3JtUGVnLmdldCgpO1xuICAgICAgICB0aGlzLmFwcFBsYXRmb3JtID0gcGxhdGZvcm0uZ2V0SHVtYW5SZWFkYWJsZU5hbWUoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuYXBwVmVyc2lvbiA9IGF3YWl0IHBsYXRmb3JtLmdldEFwcFZlcnNpb24oKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRmFpbGVkIHRvIGdldCBhcHAgdmVyc2lvbiwgdXNpbmcgJ3Vua25vd24nXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RhcnQgaGVhcnRiZWF0XG4gICAgICAgIHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJZCA9IHNldEludGVydmFsKHRoaXMuaGVhcnRiZWF0LmJpbmQodGhpcyksIEhFQVJUQkVBVF9JTlRFUlZBTCk7XG4gICAgICAgIHRoaXMudHJhY2tTZXNzaW9ucygpO1xuICAgICAgICB0aGlzLnRyYWNrRXJyb3JzKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIGRpc2FibGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSByZXR1cm47XG4gICAgICAgIGF3YWl0IHRoaXMudHJhY2soXCJPcHQtT3V0XCIgKTtcbiAgICAgICAgdGhpcy5lbmRTZXNzaW9uKCk7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJZCk7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5hY3Rpdml0eUludGVydmFsSWQpXG4gICAgICAgIHRoaXMuYmFzZVVybCA9IG51bGw7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lcnMgYm91bmQgaW4gdHJhY2tTZXNzaW9ucygpXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsIHRoaXMuZW5kU2Vzc2lvbik7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwidW5sb2FkXCIsIHRoaXMuZW5kU2Vzc2lvbik7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwidmlzaWJpbGl0eWNoYW5nZVwiLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgdGhpcy5vblVzZXJBY3Rpdml0eSk7XG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZXBvcnRGZWVkYmFjayhyYXRpbmc6IDEgfCAyIHwgMyB8IDQgfCA1LCBjb21tZW50OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50cmFjazxJU3RhclJhdGluZ0V2ZW50PihcIltDTFldX3N0YXJfcmF0aW5nXCIsIHsgcmF0aW5nLCBjb21tZW50IH0sIG51bGwsIHt9LCB0cnVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhY2tQYWdlQ2hhbmdlKGdlbmVyYXRpb25UaW1lTXM/OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgLy8gVE9ETyB1c2UgZ2VuZXJhdGlvblRpbWVNc1xuICAgICAgICB0aGlzLnRyYWNrUGFnZVZpZXcoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGFzeW5jIHRyYWNrUGFnZVZpZXcoKSB7XG4gICAgICAgIHRoaXMucmVwb3J0Vmlld0R1cmF0aW9uKCk7XG5cbiAgICAgICAgYXdhaXQgc2xlZXAoMCk7IC8vIFhYWDogd2Ugc2xlZXAgaGVyZSBiZWNhdXNlIG90aGVyd2lzZSB3ZSBnZXQgdGhlIG9sZCBoYXNoIGFuZCBub3QgdGhlIG5ldyBvbmVcbiAgICAgICAgY29uc3Qgdmlld0RhdGEgPSBhd2FpdCBnZXRWaWV3RGF0YSh0aGlzLmFub255bW91cyk7XG5cbiAgICAgICAgY29uc3QgcGFnZSA9IHZpZXdEYXRhLm5hbWU7XG4gICAgICAgIHRoaXMubGFzdFZpZXcgPSBwYWdlO1xuICAgICAgICB0aGlzLmxhc3RWaWV3VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG4gICAgICAgIGNvbnN0IHNlZ21lbnRzID0ge1xuICAgICAgICAgICAgLi4udmlld0RhdGEubWV0YSxcbiAgICAgICAgICAgIG5hbWU6IHBhZ2UsXG4gICAgICAgICAgICB2aXNpdDogMSxcbiAgICAgICAgICAgIGRvbWFpbjogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lLFxuICAgICAgICAgICAgdmlldzogdmlld0RhdGEudXJsLFxuICAgICAgICAgICAgc2VnbWVudDogdGhpcy5hcHBQbGF0Zm9ybSxcbiAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmZpcnN0UGFnZSxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5maXJzdFBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RQYWdlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRyYWNrPElWaWV3RXZlbnQ+KFwiW0NMWV1fdmlld1wiLCBzZWdtZW50cyk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBnZXRUaW1lc3RhbXAoKSB7XG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgfVxuXG4gICAgLy8gc3RvcmUgdGhlIGxhc3QgbXMgdGltZXN0YW1wIHJldHVybmVkXG4gICAgLy8gd2UgZG8gdGhpcyB0byBwcmV2ZW50IHRoZSB0cyBmcm9tIGV2ZXIgZGVjcmVhc2luZyBpbiB0aGUgY2FzZSBvZiBzeXN0ZW0gdGltZSBjaGFuZ2luZ1xuICAgIHByaXZhdGUgbGFzdE1zVHMgPSAwO1xuXG4gICAgcHJpdmF0ZSBnZXRNc1RpbWVzdGFtcCgpIHtcbiAgICAgICAgY29uc3QgdHMgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgaWYgKHRoaXMubGFzdE1zVHMgPj0gdHMpIHtcbiAgICAgICAgICAgIC8vIGluY3JlbWVudCB0cyBhcyB0byBrZWVwIG91ciBkYXRhIHBvaW50cyB3ZWxsLW9yZGVyZWRcbiAgICAgICAgICAgIHRoaXMubGFzdE1zVHMrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubGFzdE1zVHMgPSB0cztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0TXNUcztcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgcmVjb3JkRXJyb3IoZXJyOiBFcnJvciB8IHN0cmluZywgZmF0YWwgPSBmYWxzZSkge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCB0aGlzLmFub255bW91cykgcmV0dXJuO1xuXG4gICAgICAgIGxldCBlcnJvciA9IFwiXCI7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVyci5zdGFjayAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgIGVycm9yID0gZXJyLnN0YWNrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVyci5uYW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yICs9IGVyci5uYW1lICsgXCI6XCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyLm1lc3NhZ2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgKz0gZXJyLm1lc3NhZ2UgKyBcIlxcblwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGVyci5maWxlTmFtZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBcImluIFwiICsgZXJyLmZpbGVOYW1lICsgXCJcXG5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnIubGluZU51bWJlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBcIm9uIFwiICsgZXJyLmxpbmVOdW1iZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyLmNvbHVtbk51bWJlciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBcIjpcIiArIGVyci5jb2x1bW5OdW1iZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXJyb3IgPSBlcnIgKyBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2FuaXRpemUgdGhlIGVycm9yIGZyb20gaWRlbnRpZmllcnNcbiAgICAgICAgZXJyb3IgPSBhd2FpdCBzdHJSZXBsYWNlQXN5bmMoZXJyb3IsIC8oWyFAKyNdKS4rPzpbXFx3Oi5dKy9nLCBhc3luYyAoc3Vic3RyaW5nOiBzdHJpbmcsIGdseXBoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBnbHlwaCArIGF3YWl0IGhhc2hIZXgoc3Vic3RyaW5nLnN1YnN0cmluZygxKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IG1ldHJpY3MgPSB0aGlzLmdldE1ldHJpY3MoKTtcbiAgICAgICAgY29uc3Qgb2I6IElDcmFzaCA9IHtcbiAgICAgICAgICAgIF9yZXNvbHV0aW9uOiBtZXRyaWNzPy5fcmVzb2x1dGlvbixcbiAgICAgICAgICAgIF9lcnJvcjogZXJyb3IsXG4gICAgICAgICAgICBfYXBwX3ZlcnNpb246IHRoaXMuYXBwVmVyc2lvbixcbiAgICAgICAgICAgIF9ydW46IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCkgLSB0aGlzLmluaXRUaW1lLFxuICAgICAgICAgICAgX25vbmZhdGFsOiAhZmF0YWwsXG4gICAgICAgICAgICBfdmlldzogdGhpcy5sYXN0VmlldyxcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodHlwZW9mIG5hdmlnYXRvci5vbkxpbmUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIG9iLl9vbmxpbmUgPSBuYXZpZ2F0b3Iub25MaW5lO1xuICAgICAgICB9XG5cbiAgICAgICAgb2IuX2JhY2tncm91bmQgPSBkb2N1bWVudC5oYXNGb2N1cygpO1xuXG4gICAgICAgIHRoaXMucmVxdWVzdCh7IGNyYXNoOiBKU09OLnN0cmluZ2lmeShvYikgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmFja0Vycm9ycygpIHtcbiAgICAgICAgLy9vdmVycmlkZSBnbG9iYWwgdW5jYXVnaHQgZXJyb3IgaGFuZGxlclxuICAgICAgICB3aW5kb3cub25lcnJvciA9IChtc2csIHVybCwgbGluZSwgY29sLCBlcnIpID0+IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWNvcmRFcnJvcihlcnIsIGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbGV0IGVycm9yID0gXCJcIjtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1zZyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBtc2cgKyBcIlxcblwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHVybCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBcImF0IFwiICsgdXJsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGxpbmUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgKz0gXCI6XCIgKyBsaW5lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBcIjpcIiArIGNvbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXJyb3IgKz0gXCJcXG5cIjtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jYWxsZXJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGYgPSBhcmd1bWVudHMuY2FsbGVlLmNhbGxlcjtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGYpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWNrLnB1c2goZi5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGYgPSBmLmNhbGxlcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlcnJvciArPSBzdGFjay5qb2luKFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vc2lsZW50IGVycm9yXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucmVjb3JkRXJyb3IoZXJyb3IsIGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndW5oYW5kbGVkcmVqZWN0aW9uJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlY29yZEVycm9yKG5ldyBFcnJvcihgVW5oYW5kbGVkIHJlamVjdGlvbiAocmVhc29uOiAke2V2ZW50LnJlYXNvbj8uc3RhY2sgfHwgZXZlbnQucmVhc29ufSkuYCksIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhlYXJ0YmVhdCgpIHtcbiAgICAgICAgY29uc3QgYXJnczogUGljazxJUGFyYW1zLCBcInNlc3Npb25fZHVyYXRpb25cIj4gPSB7fTtcblxuICAgICAgICAvLyBleHRlbmQgc2Vzc2lvbiBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHRoaXMuc2Vzc2lvblN0YXJ0ZWQgJiYgdGhpcy50cmFja1RpbWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3QgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuICAgICAgICAgICAgaWYgKGxhc3QgLSB0aGlzLmxhc3RCZWF0ID49IFNFU1NJT05fVVBEQVRFX0lOVEVSVkFMKSB7XG4gICAgICAgICAgICAgICAgYXJncy5zZXNzaW9uX2R1cmF0aW9uID0gbGFzdCAtIHRoaXMubGFzdEJlYXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0QmVhdCA9IGxhc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwcm9jZXNzIGV2ZW50IHF1ZXVlXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdFdmVudHMubGVuZ3RoID4gMCB8fCBhcmdzLnNlc3Npb25fZHVyYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWVzdChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgYXN5bmMgcmVxdWVzdChcbiAgICAgICAgYXJnczogT21pdDxJUGFyYW1zLCBcImFwcF9rZXlcIiB8IFwiZGV2aWNlX2lkXCIgfCBcInRpbWVzdGFtcFwiIHwgXCJob3VyXCIgfCBcImRvd1wiPlxuICAgICAgICAgICAgJiBQYXJ0aWFsPFBpY2s8SVBhcmFtcywgXCJkZXZpY2VfaWRcIj4+ID0ge30sXG4gICAgKSB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3Q6IElQYXJhbXMgPSB7XG4gICAgICAgICAgICBhcHBfa2V5OiB0aGlzLmFwcEtleSxcbiAgICAgICAgICAgIGRldmljZV9pZDogdGhpcy51c2VyS2V5LFxuICAgICAgICAgICAgLi4udGhpcy5nZXRUaW1lUGFyYW1zKCksXG4gICAgICAgICAgICAuLi5hcmdzLFxuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLnBlbmRpbmdFdmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgRVZFTlRfQkFUQ0hfU0laRSA9IDEwO1xuICAgICAgICAgICAgY29uc3QgZXZlbnRzID0gdGhpcy5wZW5kaW5nRXZlbnRzLnNwbGljZSgwLCBFVkVOVF9CQVRDSF9TSVpFKTtcbiAgICAgICAgICAgIHJlcXVlc3QuZXZlbnRzID0gSlNPTi5zdHJpbmdpZnkoZXZlbnRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocmVxdWVzdCBhcyB7fSk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdpbmRvdy5mZXRjaCh0aGlzLmJhc2VVcmwudG9TdHJpbmcoKSwge1xuICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgbW9kZTogXCJuby1jb3JzXCIsXG4gICAgICAgICAgICAgICAgY2FjaGU6IFwibm8tY2FjaGVcIixcbiAgICAgICAgICAgICAgICByZWRpcmVjdDogXCJmb2xsb3dcIixcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiBwYXJhbXMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkFuYWx5dGljcyBlcnJvcjogXCIsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRUaW1lUGFyYW1zKCk6IFBpY2s8SVBhcmFtcywgXCJ0aW1lc3RhbXBcIiB8IFwiaG91clwiIHwgXCJkb3dcIj4ge1xuICAgICAgICBjb25zdCBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogdGhpcy5nZXRNc1RpbWVzdGFtcCgpLFxuICAgICAgICAgICAgaG91cjogZGF0ZS5nZXRIb3VycygpLFxuICAgICAgICAgICAgZG93OiBkYXRlLmdldERheSgpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgcXVldWUoYXJnczogT21pdDxJRXZlbnQsIFwidGltZXN0YW1wXCIgfCBcImhvdXJcIiB8IFwiZG93XCIgfCBcImNvdW50XCI+ICYgUGFydGlhbDxQaWNrPElFdmVudCwgXCJjb3VudFwiPj4pIHtcbiAgICAgICAgY29uc3Qge2NvdW50ID0gMSwgLi4ucmVzdH0gPSBhcmdzO1xuICAgICAgICBjb25zdCBldiA9IHtcbiAgICAgICAgICAgIC4uLnRoaXMuZ2V0VGltZVBhcmFtcygpLFxuICAgICAgICAgICAgLi4ucmVzdCxcbiAgICAgICAgICAgIGNvdW50LFxuICAgICAgICAgICAgcGxhdGZvcm06IHRoaXMuYXBwUGxhdGZvcm0sXG4gICAgICAgICAgICBhcHBfdmVyc2lvbjogdGhpcy5hcHBWZXJzaW9uLFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nRXZlbnRzLnB1c2goZXYpO1xuICAgICAgICBpZiAodGhpcy5wZW5kaW5nRXZlbnRzLmxlbmd0aCA+IE1BWF9QRU5ESU5HX0VWRU5UUykge1xuICAgICAgICAgICAgdGhpcy5wZW5kaW5nRXZlbnRzLnNoaWZ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE9yaWVudGF0aW9uID0gKCk6IE9yaWVudGF0aW9uID0+IHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoID4gd2luZG93LmlubmVySGVpZ2h0ID8gT3JpZW50YXRpb24uTGFuZHNjYXBlIDogT3JpZW50YXRpb24uUG9ydHJhaXQ7XG4gICAgfTtcblxuICAgIHByaXZhdGUgcmVwb3J0T3JpZW50YXRpb24gPSAoKSA9PiB7XG4gICAgICAgIHRoaXMudHJhY2s8SU9yaWVudGF0aW9uRXZlbnQ+KFwiW0NMWV1fb3JpZW50YXRpb25cIiwge1xuICAgICAgICAgICAgbW9kZTogdGhpcy5nZXRPcmllbnRhdGlvbigpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzdGFydFRpbWUoKSB7XG4gICAgICAgIGlmICghdGhpcy50cmFja1RpbWUpIHtcbiAgICAgICAgICAgIHRoaXMudHJhY2tUaW1lID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubGFzdEJlYXQgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpIC0gdGhpcy5zdG9yZWREdXJhdGlvbjtcbiAgICAgICAgICAgIHRoaXMubGFzdFZpZXdUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKSAtIHRoaXMubGFzdFZpZXdTdG9yZWREdXJhdGlvbjtcbiAgICAgICAgICAgIHRoaXMubGFzdFZpZXdTdG9yZWREdXJhdGlvbiA9IDA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3BUaW1lKCkge1xuICAgICAgICBpZiAodGhpcy50cmFja1RpbWUpIHtcbiAgICAgICAgICAgIHRoaXMudHJhY2tUaW1lID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0b3JlZER1cmF0aW9uID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKSAtIHRoaXMubGFzdEJlYXQ7XG4gICAgICAgICAgICB0aGlzLmxhc3RWaWV3U3RvcmVkRHVyYXRpb24gPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpIC0gdGhpcy5sYXN0Vmlld1RpbWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldE1ldHJpY3MoKTogSU1ldHJpY3Mge1xuICAgICAgICBpZiAodGhpcy5hbm9ueW1vdXMpIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnN0IG1ldHJpY3M6IElNZXRyaWNzID0ge307XG5cbiAgICAgICAgLy8gZ2V0dGluZyBhcHAgdmVyc2lvblxuICAgICAgICBtZXRyaWNzLl9hcHBfdmVyc2lvbiA9IHRoaXMuYXBwVmVyc2lvbjtcbiAgICAgICAgbWV0cmljcy5fdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgICAgIC8vIGdldHRpbmcgcmVzb2x1dGlvblxuICAgICAgICBpZiAoc2NyZWVuLndpZHRoICYmIHNjcmVlbi5oZWlnaHQpIHtcbiAgICAgICAgICAgIG1ldHJpY3MuX3Jlc29sdXRpb24gPSBgJHtzY3JlZW4ud2lkdGh9eCR7c2NyZWVuLmhlaWdodH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2V0dGluZyBkZW5zaXR5IHJhdGlvXG4gICAgICAgIGlmICh3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbykge1xuICAgICAgICAgICAgbWV0cmljcy5fZGVuc2l0eSA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2V0dGluZyBsb2NhbGVcbiAgICAgICAgbWV0cmljcy5fbG9jYWxlID0gZ2V0Q3VycmVudExhbmd1YWdlKCk7XG5cbiAgICAgICAgcmV0dXJuIG1ldHJpY3M7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhc3luYyBiZWdpblNlc3Npb24oaGVhcnRiZWF0ID0gdHJ1ZSkge1xuICAgICAgICBpZiAoIXRoaXMuc2Vzc2lvblN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVwb3J0T3JpZW50YXRpb24oKTtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVwb3J0T3JpZW50YXRpb24pO1xuXG4gICAgICAgICAgICB0aGlzLmxhc3RCZWF0ID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2Vzc2lvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5oZWFydGJlYXRFbmFibGVkID0gaGVhcnRiZWF0O1xuXG4gICAgICAgICAgICBjb25zdCB1c2VyRGV0YWlsczogSVVzZXJEZXRhaWxzID0ge1xuICAgICAgICAgICAgICAgIGN1c3RvbToge1xuICAgICAgICAgICAgICAgICAgICBcImhvbWVfc2VydmVyXCI6IE1hdHJpeENsaWVudFBlZy5nZXQoKSAmJiBNYXRyaXhDbGllbnRQZWcuZ2V0SG9tZXNlcnZlck5hbWUoKSwgLy8gVE9ETyBoYXNoP1xuICAgICAgICAgICAgICAgICAgICBcImFub255bW91c1wiOiB0aGlzLmFub255bW91cyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgcmVxdWVzdDogUGFyYW1ldGVyczx0eXBlb2YgQ291bnRseUFuYWx5dGljcy5wcm90b3R5cGUucmVxdWVzdD5bMF0gPSB7XG4gICAgICAgICAgICAgICAgYmVnaW5fc2Vzc2lvbjogMSxcbiAgICAgICAgICAgICAgICB1c2VyX2RldGFpbHM6IEpTT04uc3RyaW5naWZ5KHVzZXJEZXRhaWxzKSxcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbWV0cmljcyA9IHRoaXMuZ2V0TWV0cmljcygpO1xuICAgICAgICAgICAgaWYgKG1ldHJpY3MpIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0Lm1ldHJpY3MgPSBKU09OLnN0cmluZ2lmeShtZXRyaWNzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXdhaXQgdGhpcy5yZXF1ZXN0KHJlcXVlc3QpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXBvcnRWaWV3RHVyYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RWaWV3KSB7XG4gICAgICAgICAgICB0aGlzLnRyYWNrPElWaWV3RXZlbnQ+KFwiW0NMWV1fdmlld1wiLCB7XG4gICAgICAgICAgICAgICAgbmFtZTogdGhpcy5sYXN0VmlldyxcbiAgICAgICAgICAgIH0sIG51bGwsIHtcbiAgICAgICAgICAgICAgICBkdXI6IHRoaXMudHJhY2tUaW1lID8gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKSAtIHRoaXMubGFzdFZpZXdUaW1lIDogdGhpcy5sYXN0Vmlld1N0b3JlZER1cmF0aW9uLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmxhc3RWaWV3ID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZW5kU2Vzc2lvbiA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2Vzc2lvblN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMucmVwb3J0T3JpZW50YXRpb24pXG5cbiAgICAgICAgICAgIHRoaXMucmVwb3J0Vmlld0R1cmF0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgIGVuZF9zZXNzaW9uOiAxLFxuICAgICAgICAgICAgICAgIHNlc3Npb25fZHVyYXRpb246IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCkgLSB0aGlzLmxhc3RCZWF0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXNzaW9uU3RhcnRlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVmlzaWJpbGl0eUNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xuICAgICAgICAgICAgdGhpcy5zdG9wVGltZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uVXNlckFjdGl2aXR5ID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbmFjdGl2aXR5Q291bnRlciA+PSBJTkFDVElWSVRZX1RJTUUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRUaW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmFjdGl2aXR5Q291bnRlciA9IDA7XG4gICAgfTtcblxuICAgIHByaXZhdGUgdHJhY2tTZXNzaW9ucygpIHtcbiAgICAgICAgdGhpcy5iZWdpblNlc3Npb24oKTtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUoKTtcblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLmVuZFNlc3Npb24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInVubG9hZFwiLCB0aGlzLmVuZFNlc3Npb24pO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMub25Vc2VyQWN0aXZpdHkpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCB0aGlzLm9uVXNlckFjdGl2aXR5KTtcblxuICAgICAgICB0aGlzLmFjdGl2aXR5SW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5hY3Rpdml0eUNvdW50ZXIrKztcbiAgICAgICAgICAgIGlmICh0aGlzLmluYWN0aXZpdHlDb3VudGVyID49IElOQUNUSVZJVFlfVElNRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcFRpbWUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgNjBfMDAwKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhY2tCZWdpbkludml0ZShyb29tSWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLnRyYWNrPElCZWdpbkludml0ZUV2ZW50PihcImJlZ2luX2ludml0ZVwiLCB7fSwgcm9vbUlkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhY2tTZW5kSW52aXRlKHN0YXJ0VGltZTogbnVtYmVyLCByb29tSWQ6IHN0cmluZywgcXR5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy50cmFjazxJU2VuZEludml0ZUV2ZW50PihcInNlbmRfaW52aXRlXCIsIHt9LCByb29tSWQsIHtcbiAgICAgICAgICAgIGR1cjogQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKSAtIHN0YXJ0VGltZSxcbiAgICAgICAgICAgIHN1bTogcXR5LFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdHJhY2tSb29tQ3JlYXRlKHN0YXJ0VGltZTogbnVtYmVyLCByb29tSWQ6IHN0cmluZykge1xuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIGxldCBlbmRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoIWNsaS5nZXRSb29tKHJvb21JZCkpIHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSAocm9vbSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAocm9vbS5yb29tSWQgPT09IHJvb21JZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xpLm9mZihcIlJvb21cIiwgaGFuZGxlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNsaS5vbihcIlJvb21cIiwgaGFuZGxlcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVuZFRpbWUgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy50cmFjazxJQ3JlYXRlUm9vbUV2ZW50PihcImNyZWF0ZV9yb29tXCIsIHt9LCByb29tSWQsIHtcbiAgICAgICAgICAgIGR1cjogZW5kVGltZSAtIHN0YXJ0VGltZSxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRyYWNrUm9vbUpvaW4oc3RhcnRUaW1lOiBudW1iZXIsIHJvb21JZDogc3RyaW5nLCB0eXBlOiBJSm9pblJvb21FdmVudFtcInNlZ21lbnRhdGlvblwiXVtcInR5cGVcIl0pIHtcbiAgICAgICAgdGhpcy50cmFjazxJSm9pblJvb21FdmVudD4oXCJqb2luX3Jvb21cIiwgeyB0eXBlIH0sIHJvb21JZCwge1xuICAgICAgICAgICAgZHVyOiBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpIC0gc3RhcnRUaW1lLFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXN5bmMgdHJhY2tTZW5kTWVzc2FnZShcbiAgICAgICAgc3RhcnRUaW1lOiBudW1iZXIsXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgc2VuZFByb21pc2U6IFByb21pc2U8e2V2ZW50X2lkOiBzdHJpbmd9PixcbiAgICAgICAgcm9vbUlkOiBzdHJpbmcsXG4gICAgICAgIGlzRWRpdDogYm9vbGVhbixcbiAgICAgICAgaXNSZXBseTogYm9vbGVhbixcbiAgICAgICAgY29udGVudDoge2Zvcm1hdD86IHN0cmluZywgbXNndHlwZTogc3RyaW5nfSxcbiAgICApIHtcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHJldHVybjtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20ocm9vbUlkKTtcblxuICAgICAgICBjb25zdCBldmVudElkID0gKGF3YWl0IHNlbmRQcm9taXNlKS5ldmVudF9pZDtcbiAgICAgICAgbGV0IGVuZFRpbWUgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuXG4gICAgICAgIGlmICghcm9vbS5maW5kRXZlbnRCeUlkKGV2ZW50SWQpKSB7XG4gICAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPihyZXNvbHZlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBoYW5kbGVyID0gKGV2KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldi5nZXRJZCgpID09PSBldmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb29tLm9mZihcIlJvb20ubG9jYWxFY2hvVXBkYXRlZFwiLCBoYW5kbGVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByb29tLm9uKFwiUm9vbS5sb2NhbEVjaG9VcGRhdGVkXCIsIGhhbmRsZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbmRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHJhY2s8SVNlbmRNZXNzYWdlRXZlbnQ+KFwic2VuZF9tZXNzYWdlXCIsIHtcbiAgICAgICAgICAgIGlzX2VkaXQ6IGlzRWRpdCxcbiAgICAgICAgICAgIGlzX3JlcGx5OiBpc1JlcGx5LFxuICAgICAgICAgICAgbXNndHlwZTogY29udGVudC5tc2d0eXBlLFxuICAgICAgICAgICAgZm9ybWF0OiBjb250ZW50LmZvcm1hdCxcbiAgICAgICAgfSwgcm9vbUlkLCB7XG4gICAgICAgICAgICBkdXI6IGVuZFRpbWUgLSBzdGFydFRpbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFja1N0YXJ0Q2FsbChyb29tSWQ6IHN0cmluZywgaXNWaWRlbyA9IGZhbHNlLCBpc0ppdHNpID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy50cmFjazxJU3RhcnRDYWxsRXZlbnQ+KFwic3RhcnRfY2FsbFwiLCB7XG4gICAgICAgICAgICBpc192aWRlbzogaXNWaWRlbyxcbiAgICAgICAgICAgIGlzX2ppdHNpOiBpc0ppdHNpLFxuICAgICAgICB9LCByb29tSWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFja0pvaW5DYWxsKHJvb21JZDogc3RyaW5nLCBpc1ZpZGVvID0gZmFsc2UsIGlzSml0c2kgPSBmYWxzZSkge1xuICAgICAgICB0aGlzLnRyYWNrPElKb2luQ2FsbEV2ZW50PihcImpvaW5fY2FsbFwiLCB7XG4gICAgICAgICAgICBpc192aWRlbzogaXNWaWRlbyxcbiAgICAgICAgICAgIGlzX2ppdHNpOiBpc0ppdHNpLFxuICAgICAgICB9LCByb29tSWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFja1Jvb21EaXJlY3RvcnlCZWdpbigpIHtcbiAgICAgICAgdGhpcy50cmFjazxJUm9vbURpcmVjdG9yeUV2ZW50PihcInJvb21fZGlyZWN0b3J5XCIpO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFja1Jvb21EaXJlY3Rvcnkoc3RhcnRUaW1lOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy50cmFjazxJUm9vbURpcmVjdG9yeURvbmVFdmVudD4oXCJyb29tX2RpcmVjdG9yeV9kb25lXCIsIHt9LCBudWxsLCB7XG4gICAgICAgICAgICBkdXI6IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCkgLSBzdGFydFRpbWUsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyB0cmFja1Jvb21EaXJlY3RvcnlTZWFyY2gobnVtUmVzdWx0czogbnVtYmVyLCBxdWVyeTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudHJhY2s8SVJvb21EaXJlY3RvcnlTZWFyY2hFdmVudD4oXCJyb29tX2RpcmVjdG9yeV9zZWFyY2hcIiwge1xuICAgICAgICAgICAgcXVlcnlfbGVuZ3RoOiBxdWVyeS5sZW5ndGgsXG4gICAgICAgICAgICBxdWVyeV9udW1fd29yZHM6IHF1ZXJ5LnNwbGl0KFwiIFwiKS5sZW5ndGgsXG4gICAgICAgIH0sIG51bGwsIHtcbiAgICAgICAgICAgIHN1bTogbnVtUmVzdWx0cyxcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFzeW5jIHRyYWNrPEUgZXh0ZW5kcyBJRXZlbnQ+KFxuICAgICAgICBrZXk6IEVbXCJrZXlcIl0sXG4gICAgICAgIHNlZ21lbnRzPzogT21pdDxFW1wic2VnbWVudGF0aW9uXCJdLCBcInJvb21faWRcIiB8IFwibnVtX3VzZXJzXCIgfCBcImlzX2VuY3J5cHRlZFwiIHwgXCJpc19wdWJsaWNcIj4sXG4gICAgICAgIHJvb21JZD86IHN0cmluZyxcbiAgICAgICAgYXJncz86IFBhcnRpYWw8UGljazxFLCBcImR1clwiIHwgXCJzdW1cIiB8IFwidGltZXN0YW1wXCI+PixcbiAgICAgICAgYW5vbnltb3VzID0gZmFsc2UsXG4gICAgKSB7XG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkICYmICFhbm9ueW1vdXMpIHJldHVybjtcblxuICAgICAgICBsZXQgc2VnbWVudGF0aW9uID0gc2VnbWVudHMgfHwge307XG5cbiAgICAgICAgaWYgKHJvb21JZCkge1xuICAgICAgICAgICAgc2VnbWVudGF0aW9uID0ge1xuICAgICAgICAgICAgICAgIHJvb21faWQ6IGF3YWl0IGhhc2hIZXgocm9vbUlkKSxcbiAgICAgICAgICAgICAgICAuLi5nZXRSb29tU3RhdHMocm9vbUlkKSxcbiAgICAgICAgICAgICAgICAuLi5zZWdtZW50cyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnF1ZXVlKHtcbiAgICAgICAgICAgIGtleSxcbiAgICAgICAgICAgIGNvdW50OiAxLFxuICAgICAgICAgICAgc2VnbWVudGF0aW9uLFxuICAgICAgICAgICAgLi4uYXJncyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gaWYgdGhpcyBldmVudCBjYW4gYmUgc2VudCBhbm9ueW1vdXNseSBhbmQgd2UgYXJlIGRpc2FibGVkIHRoZW4gZGlzcGF0Y2ggaXQgcmlnaHQgYXdheVxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCAmJiBhbm9ueW1vdXMpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucmVxdWVzdCh7IGRldmljZV9pZDogcmFuZG9tU3RyaW5nKDY0KSB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy8gZXhwb3NlIG9uIHdpbmRvdyBmb3IgZWFzeSBhY2Nlc3MgZnJvbSB0aGUgY29uc29sZVxud2luZG93Lm14Q291bnRseUFuYWx5dGljcyA9IENvdW50bHlBbmFseXRpY3M7XG4iXX0=