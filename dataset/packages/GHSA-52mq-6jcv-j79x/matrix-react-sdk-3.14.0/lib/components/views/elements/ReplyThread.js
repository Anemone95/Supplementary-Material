"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _DateUtils = require("../../../DateUtils");

var _matrixJsSdk = require("matrix-js-sdk");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _escapeHtml = _interopRequireDefault(require("escape-html"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _UIFeature = require("../../../settings/UIFeature");

var _HtmlUtils = require("../../../HtmlUtils");

/*
Copyright 2017 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019 The Matrix.org Foundation C.I.C.

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
// This component does no cycle detection, simply because the only way to make such a cycle would be to
// craft event_id's, using a homeserver that generates predictable event IDs; even then the impact would
// be low as each event being loaded (after the first) is triggered by an explicit user action.
class ReplyThread extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "updateForEventId", eventId => {
      if (this.state.events.some(event => event.getId() === eventId)) {
        this.forceUpdate();
      }
    });
    (0, _defineProperty2.default)(this, "onEventReplaced", ev => {
      if (this.unmounted) return; // If one of the events we are rendering gets replaced, force a re-render

      this.updateForEventId(ev.getId());
    });
    (0, _defineProperty2.default)(this, "onRoomRedaction", ev => {
      if (this.unmounted) return;
      const eventId = ev.getAssociatedId();
      if (!eventId) return; // If one of the events we are rendering gets redacted, force a re-render

      this.updateForEventId(eventId);
    });
    this.state = {
      // The loaded events to be rendered as linear-replies
      events: [],
      // The latest loaded event which has not yet been shown
      loadedEv: null,
      // Whether the component is still loading more events
      loading: true,
      // Whether as error was encountered fetching a replied to event.
      err: false
    };
    this.unmounted = false;
    this.context.on("Event.replaced", this.onEventReplaced);
    this.room = this.context.getRoom(this.props.parentEv.getRoomId());
    this.room.on("Room.redaction", this.onRoomRedaction);
    this.room.on("Room.redactionCancelled", this.onRoomRedaction);
    this.onQuoteClick = this.onQuoteClick.bind(this);
    this.canCollapse = this.canCollapse.bind(this);
    this.collapse = this.collapse.bind(this);
  }

  static getParentEventId(ev) {
    if (!ev || ev.isRedacted()) return; // XXX: For newer relations (annotations, replacements, etc.), we now
    // have a `getRelation` helper on the event, and you might assume it
    // could be used here for replies as well... However, the helper
    // currently assumes the relation has a `rel_type`, which older replies
    // do not, so this block is left as-is for now.

    const mRelatesTo = ev.getWireContent()['m.relates_to'];

    if (mRelatesTo && mRelatesTo['m.in_reply_to']) {
      const mInReplyTo = mRelatesTo['m.in_reply_to'];
      if (mInReplyTo && mInReplyTo['event_id']) return mInReplyTo['event_id'];
    }
  } // Part of Replies fallback support


  static stripPlainReply(body) {
    // Removes lines beginning with `> ` until you reach one that doesn't.
    const lines = body.split('\n');

    while (lines.length && lines[0].startsWith('> ')) lines.shift(); // Reply fallback has a blank line after it, so remove it to prevent leading newline


    if (lines[0] === '') lines.shift();
    return lines.join('\n');
  } // Part of Replies fallback support


  static stripHTMLReply(html) {
    // Sanitize the original HTML for inclusion in <mx-reply>.  We allow
    // any HTML, since the original sender could use special tags that we
    // don't recognize, but want to pass along to any recipients who do
    // recognize them -- recipients should be sanitizing before displaying
    // anyways.  However, we sanitize to 1) remove any mx-reply, so that we
    // don't generate a nested mx-reply, and 2) make sure that the HTML is
    // properly formatted (e.g. tags are closed where necessary)
    return (0, _sanitizeHtml.default)(html, {
      allowedTags: false,
      // false means allow everything
      allowedAttributes: false,
      // we somehow can't allow all schemes, so we allow all that we
      // know of and mxc (for img tags)
      allowedSchemes: [..._HtmlUtils.PERMITTED_URL_SCHEMES, 'mxc'],
      exclusiveFilter: frame => frame.tag === "mx-reply"
    });
  } // Part of Replies fallback support


  static getNestedReplyText(ev, permalinkCreator) {
    if (!ev) return null;
    let {
      body,
      formatted_body: html
    } = ev.getContent();

    if (this.getParentEventId(ev)) {
      if (body) body = this.stripPlainReply(body);
    }

    if (!body) body = ""; // Always ensure we have a body, for reasons.

    if (html) {
      // sanitize the HTML before we put it in an <mx-reply>
      html = this.stripHTMLReply(html);
    } else {
      // Escape the body to use as HTML below.
      // We also run a nl2br over the result to fix the fallback representation. We do this
      // after converting the text to safe HTML to avoid user-provided BR's from being converted.
      html = (0, _escapeHtml.default)(body).replace(/\n/g, '<br/>');
    } // dev note: do not rely on `body` being safe for HTML usage below.


    const evLink = permalinkCreator.forEvent(ev.getId());
    const userLink = (0, _Permalinks.makeUserPermalink)(ev.getSender());
    const mxid = ev.getSender(); // This fallback contains text that is explicitly EN.

    switch (ev.getContent().msgtype) {
      case 'm.text':
      case 'm.notice':
        {
          html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>${html}</blockquote></mx-reply>`;
          const lines = body.trim().split('\n');

          if (lines.length > 0) {
            lines[0] = `<${mxid}> ${lines[0]}`;
            body = lines.map(line => `> ${line}`).join('\n') + '\n\n';
          }

          break;
        }

      case 'm.image':
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent an image.</blockquote></mx-reply>`;
        body = `> <${mxid}> sent an image.\n\n`;
        break;

      case 'm.video':
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent a video.</blockquote></mx-reply>`;
        body = `> <${mxid}> sent a video.\n\n`;
        break;

      case 'm.audio':
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent an audio file.</blockquote></mx-reply>`;
        body = `> <${mxid}> sent an audio file.\n\n`;
        break;

      case 'm.file':
        html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> <a href="${userLink}">${mxid}</a>` + `<br>sent a file.</blockquote></mx-reply>`;
        body = `> <${mxid}> sent a file.\n\n`;
        break;

      case 'm.emote':
        {
          html = `<mx-reply><blockquote><a href="${evLink}">In reply to</a> * ` + `<a href="${userLink}">${mxid}</a><br>${html}</blockquote></mx-reply>`;
          const lines = body.trim().split('\n');

          if (lines.length > 0) {
            lines[0] = `* <${mxid}> ${lines[0]}`;
            body = lines.map(line => `> ${line}`).join('\n') + '\n\n';
          }

          break;
        }

      default:
        return null;
    }

    return {
      body,
      html
    };
  }

  static makeReplyMixIn(ev) {
    if (!ev) return {};
    return {
      'm.relates_to': {
        'm.in_reply_to': {
          'event_id': ev.getId()
        }
      }
    };
  }

  static makeThread(parentEv, onHeightChanged, permalinkCreator, ref, useIRCLayout) {
    if (!ReplyThread.getParentEventId(parentEv)) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_ReplyThread_wrapper_empty"
      });
    }

    return /*#__PURE__*/_react.default.createElement(ReplyThread, {
      parentEv: parentEv,
      onHeightChanged: onHeightChanged,
      ref: ref,
      permalinkCreator: permalinkCreator,
      useIRCLayout: useIRCLayout
    });
  }

  componentDidMount() {
    this.initialize();
  }

  componentDidUpdate() {
    this.props.onHeightChanged();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.context.removeListener("Event.replaced", this.onEventReplaced);

    if (this.room) {
      this.room.removeListener("Room.redaction", this.onRoomRedaction);
      this.room.removeListener("Room.redactionCancelled", this.onRoomRedaction);
    }
  }

  async initialize() {
    const {
      parentEv
    } = this.props; // at time of making this component we checked that props.parentEv has a parentEventId

    const ev = await this.getEvent(ReplyThread.getParentEventId(parentEv));
    if (this.unmounted) return;

    if (ev) {
      this.setState({
        events: [ev]
      }, this.loadNextEvent);
    } else {
      this.setState({
        err: true
      });
    }
  }

  async loadNextEvent() {
    if (this.unmounted) return;
    const ev = this.state.events[0];
    const inReplyToEventId = ReplyThread.getParentEventId(ev);

    if (!inReplyToEventId) {
      this.setState({
        loading: false
      });
      return;
    }

    const loadedEv = await this.getEvent(inReplyToEventId);
    if (this.unmounted) return;

    if (loadedEv) {
      this.setState({
        loadedEv
      });
    } else {
      this.setState({
        err: true
      });
    }
  }

  async getEvent(eventId) {
    const event = this.room.findEventById(eventId);
    if (event) return event;

    try {
      // ask the client to fetch the event we want using the context API, only interface to do so is to ask
      // for a timeline with that event, but once it is loaded we can use findEventById to look up the ev map
      await this.context.getEventTimeline(this.room.getUnfilteredTimelineSet(), eventId);
    } catch (e) {
      // if it fails catch the error and return early, there's no point trying to find the event in this case.
      // Return null as it is falsey and thus should be treated as an error (as the event cannot be resolved).
      return null;
    }

    return this.room.findEventById(eventId);
  }

  canCollapse() {
    return this.state.events.length > 1;
  }

  collapse() {
    this.initialize();
  }

  onQuoteClick() {
    const events = [this.state.loadedEv, ...this.state.events];
    this.setState({
      loadedEv: null,
      events
    }, this.loadNextEvent);

    _dispatcher.default.fire(_actions.Action.FocusComposer);
  }

  render() {
    let header = null;

    if (this.state.err) {
      header = /*#__PURE__*/_react.default.createElement("blockquote", {
        className: "mx_ReplyThread mx_ReplyThread_error"
      }, (0, _languageHandler._t)('Unable to load event that was replied to, ' + 'it either does not exist or you do not have permission to view it.'));
    } else if (this.state.loadedEv) {
      const ev = this.state.loadedEv;
      const Pill = sdk.getComponent('elements.Pill');
      const room = this.context.getRoom(ev.getRoomId());
      header = /*#__PURE__*/_react.default.createElement("blockquote", {
        className: "mx_ReplyThread"
      }, (0, _languageHandler._t)('<a>In reply to</a> <pill>', {}, {
        'a': sub => /*#__PURE__*/_react.default.createElement("a", {
          onClick: this.onQuoteClick,
          className: "mx_ReplyThread_show"
        }, sub),
        'pill': /*#__PURE__*/_react.default.createElement(Pill, {
          type: Pill.TYPE_USER_MENTION,
          room: room,
          url: (0, _Permalinks.makeUserPermalink)(ev.getSender()),
          shouldShowPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
        })
      }));
    } else if (this.state.loading) {
      const Spinner = sdk.getComponent("elements.Spinner");
      header = /*#__PURE__*/_react.default.createElement(Spinner, {
        w: 16,
        h: 16
      });
    }

    const EventTile = sdk.getComponent('views.rooms.EventTile');
    const DateSeparator = sdk.getComponent('messages.DateSeparator');
    const evTiles = this.state.events.map(ev => {
      let dateSep = null;

      if ((0, _DateUtils.wantsDateSeparator)(this.props.parentEv.getDate(), ev.getDate())) {
        dateSep = /*#__PURE__*/_react.default.createElement("a", {
          href: this.props.url
        }, /*#__PURE__*/_react.default.createElement(DateSeparator, {
          ts: ev.getTs()
        }));
      }

      return /*#__PURE__*/_react.default.createElement("blockquote", {
        className: "mx_ReplyThread",
        key: ev.getId()
      }, dateSep, /*#__PURE__*/_react.default.createElement(EventTile, {
        mxEvent: ev,
        tileShape: "reply",
        onHeightChanged: this.props.onHeightChanged,
        permalinkCreator: this.props.permalinkCreator,
        isRedacted: ev.isRedacted(),
        isTwelveHour: _SettingsStore.default.getValue("showTwelveHourTimestamps"),
        useIRCLayout: this.props.useIRCLayout,
        enableFlair: _SettingsStore.default.getValue(_UIFeature.UIFeature.Flair),
        replacingEventId: ev.replacingEventId()
      }));
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReplyThread_wrapper"
    }, /*#__PURE__*/_react.default.createElement("div", null, header), /*#__PURE__*/_react.default.createElement("div", null, evTiles));
  }

}

exports.default = ReplyThread;
(0, _defineProperty2.default)(ReplyThread, "propTypes", {
  // the latest event in this chain of replies
  parentEv: _propTypes.default.instanceOf(_matrixJsSdk.MatrixEvent),
  // called when the ReplyThread contents has changed, including EventTiles thereof
  onHeightChanged: _propTypes.default.func.isRequired,
  permalinkCreator: _propTypes.default.instanceOf(_Permalinks.RoomPermalinkCreator).isRequired,
  // Specifies which layout to use.
  useIRCLayout: _propTypes.default.bool
});
(0, _defineProperty2.default)(ReplyThread, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1JlcGx5VGhyZWFkLmpzIl0sIm5hbWVzIjpbIlJlcGx5VGhyZWFkIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImV2ZW50SWQiLCJzdGF0ZSIsImV2ZW50cyIsInNvbWUiLCJldmVudCIsImdldElkIiwiZm9yY2VVcGRhdGUiLCJldiIsInVubW91bnRlZCIsInVwZGF0ZUZvckV2ZW50SWQiLCJnZXRBc3NvY2lhdGVkSWQiLCJsb2FkZWRFdiIsImxvYWRpbmciLCJlcnIiLCJvbiIsIm9uRXZlbnRSZXBsYWNlZCIsInJvb20iLCJnZXRSb29tIiwicGFyZW50RXYiLCJnZXRSb29tSWQiLCJvblJvb21SZWRhY3Rpb24iLCJvblF1b3RlQ2xpY2siLCJiaW5kIiwiY2FuQ29sbGFwc2UiLCJjb2xsYXBzZSIsImdldFBhcmVudEV2ZW50SWQiLCJpc1JlZGFjdGVkIiwibVJlbGF0ZXNUbyIsImdldFdpcmVDb250ZW50IiwibUluUmVwbHlUbyIsInN0cmlwUGxhaW5SZXBseSIsImJvZHkiLCJsaW5lcyIsInNwbGl0IiwibGVuZ3RoIiwic3RhcnRzV2l0aCIsInNoaWZ0Iiwiam9pbiIsInN0cmlwSFRNTFJlcGx5IiwiaHRtbCIsImFsbG93ZWRUYWdzIiwiYWxsb3dlZEF0dHJpYnV0ZXMiLCJhbGxvd2VkU2NoZW1lcyIsIlBFUk1JVFRFRF9VUkxfU0NIRU1FUyIsImV4Y2x1c2l2ZUZpbHRlciIsImZyYW1lIiwidGFnIiwiZ2V0TmVzdGVkUmVwbHlUZXh0IiwicGVybWFsaW5rQ3JlYXRvciIsImZvcm1hdHRlZF9ib2R5IiwiZ2V0Q29udGVudCIsInJlcGxhY2UiLCJldkxpbmsiLCJmb3JFdmVudCIsInVzZXJMaW5rIiwiZ2V0U2VuZGVyIiwibXhpZCIsIm1zZ3R5cGUiLCJ0cmltIiwibWFwIiwibGluZSIsIm1ha2VSZXBseU1peEluIiwibWFrZVRocmVhZCIsIm9uSGVpZ2h0Q2hhbmdlZCIsInJlZiIsInVzZUlSQ0xheW91dCIsImNvbXBvbmVudERpZE1vdW50IiwiaW5pdGlhbGl6ZSIsImNvbXBvbmVudERpZFVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJnZXRFdmVudCIsInNldFN0YXRlIiwibG9hZE5leHRFdmVudCIsImluUmVwbHlUb0V2ZW50SWQiLCJmaW5kRXZlbnRCeUlkIiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImUiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiRm9jdXNDb21wb3NlciIsInJlbmRlciIsImhlYWRlciIsIlBpbGwiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJzdWIiLCJUWVBFX1VTRVJfTUVOVElPTiIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlNwaW5uZXIiLCJFdmVudFRpbGUiLCJEYXRlU2VwYXJhdG9yIiwiZXZUaWxlcyIsImRhdGVTZXAiLCJnZXREYXRlIiwidXJsIiwiZ2V0VHMiLCJVSUZlYXR1cmUiLCJGbGFpciIsInJlcGxhY2luZ0V2ZW50SWQiLCJQcm9wVHlwZXMiLCJpbnN0YW5jZU9mIiwiTWF0cml4RXZlbnQiLCJmdW5jIiwiaXNSZXF1aXJlZCIsIlJvb21QZXJtYWxpbmtDcmVhdG9yIiwiYm9vbCIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFpQkE7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsV0FBTixTQUEwQkMsZUFBTUMsU0FBaEMsQ0FBMEM7QUFhckRDLEVB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LENBQXVCUyxxQkFBVUMsS0FBakMsQ0FSakI7QUFTSSxRQUFBLGdCQUFnQixFQUFFOUYsRUFBRSxDQUFDK0YsZ0JBQUg7QUFUdEIsUUFGRyxDQUFQO0FBY0gsS0FyQmUsQ0FBaEI7QUF1QkEsd0JBQU87QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNILDBDQUFPbEIsTUFBUCxDQURHLGVBRUgsMENBQU9XLE9BQVAsQ0FGRyxDQUFQO0FBSUg7O0FBM1dvRDs7OzhCQUFwQ3JHLFcsZUFDRTtBQUNmO0FBQ0F3QixFQUFBQSxRQUFRLEVBQUVxRixtQkFBVUMsVUFBVixDQUFxQkMsd0JBQXJCLENBRks7QUFHZjtBQUNBMUMsRUFBQUEsZUFBZSxFQUFFd0MsbUJBQVVHLElBQVYsQ0FBZUMsVUFKakI7QUFLZjNELEVBQUFBLGdCQUFnQixFQUFFdUQsbUJBQVVDLFVBQVYsQ0FBcUJJLGdDQUFyQixFQUEyQ0QsVUFMOUM7QUFNZjtBQUNBMUMsRUFBQUEsWUFBWSxFQUFFc0MsbUJBQVVNO0FBUFQsQzs4QkFERm5ILFcsaUJBV0lvSCw0QiIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7X3R9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHt3YW50c0RhdGVTZXBhcmF0b3J9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQge01hdHJpeEV2ZW50fSBmcm9tICdtYXRyaXgtanMtc2RrJztcbmltcG9ydCB7bWFrZVVzZXJQZXJtYWxpbmssIFJvb21QZXJtYWxpbmtDcmVhdG9yfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IGVzY2FwZUh0bWwgZnJvbSBcImVzY2FwZS1odG1sXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBzYW5pdGl6ZUh0bWwgZnJvbSBcInNhbml0aXplLWh0bWxcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge1BFUk1JVFRFRF9VUkxfU0NIRU1FU30gZnJvbSBcIi4uLy4uLy4uL0h0bWxVdGlsc1wiO1xuXG4vLyBUaGlzIGNvbXBvbmVudCBkb2VzIG5vIGN5Y2xlIGRldGVjdGlvbiwgc2ltcGx5IGJlY2F1c2UgdGhlIG9ubHkgd2F5IHRvIG1ha2Ugc3VjaCBhIGN5Y2xlIHdvdWxkIGJlIHRvXG4vLyBjcmFmdCBldmVudF9pZCdzLCB1c2luZyBhIGhvbWVzZXJ2ZXIgdGhhdCBnZW5lcmF0ZXMgcHJlZGljdGFibGUgZXZlbnQgSURzOyBldmVuIHRoZW4gdGhlIGltcGFjdCB3b3VsZFxuLy8gYmUgbG93IGFzIGVhY2ggZXZlbnQgYmVpbmcgbG9hZGVkIChhZnRlciB0aGUgZmlyc3QpIGlzIHRyaWdnZXJlZCBieSBhbiBleHBsaWNpdCB1c2VyIGFjdGlvbi5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGx5VGhyZWFkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0aGUgbGF0ZXN0IGV2ZW50IGluIHRoaXMgY2hhaW4gb2YgcmVwbGllc1xuICAgICAgICBwYXJlbnRFdjogUHJvcFR5cGVzLmluc3RhbmNlT2YoTWF0cml4RXZlbnQpLFxuICAgICAgICAvLyBjYWxsZWQgd2hlbiB0aGUgUmVwbHlUaHJlYWQgY29udGVudHMgaGFzIGNoYW5nZWQsIGluY2x1ZGluZyBFdmVudFRpbGVzIHRoZXJlb2ZcbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tUGVybWFsaW5rQ3JlYXRvcikuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gU3BlY2lmaWVzIHdoaWNoIGxheW91dCB0byB1c2UuXG4gICAgICAgIHVzZUlSQ0xheW91dDogUHJvcFR5cGVzLmJvb2wsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIFRoZSBsb2FkZWQgZXZlbnRzIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmVhci1yZXBsaWVzXG4gICAgICAgICAgICBldmVudHM6IFtdLFxuXG4gICAgICAgICAgICAvLyBUaGUgbGF0ZXN0IGxvYWRlZCBldmVudCB3aGljaCBoYXMgbm90IHlldCBiZWVuIHNob3duXG4gICAgICAgICAgICBsb2FkZWRFdjogbnVsbCxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBzdGlsbCBsb2FkaW5nIG1vcmUgZXZlbnRzXG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyBXaGV0aGVyIGFzIGVycm9yIHdhcyBlbmNvdW50ZXJlZCBmZXRjaGluZyBhIHJlcGxpZWQgdG8gZXZlbnQuXG4gICAgICAgICAgICBlcnI6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIkV2ZW50LnJlcGxhY2VkXCIsIHRoaXMub25FdmVudFJlcGxhY2VkKTtcbiAgICAgICAgdGhpcy5yb29tID0gdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5wYXJlbnRFdi5nZXRSb29tSWQoKSk7XG4gICAgICAgIHRoaXMucm9vbS5vbihcIlJvb20ucmVkYWN0aW9uXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgdGhpcy5yb29tLm9uKFwiUm9vbS5yZWRhY3Rpb25DYW5jZWxsZWRcIiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuXG4gICAgICAgIHRoaXMub25RdW90ZUNsaWNrID0gdGhpcy5vblF1b3RlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jYW5Db2xsYXBzZSA9IHRoaXMuY2FuQ29sbGFwc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jb2xsYXBzZSA9IHRoaXMuY29sbGFwc2UuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UGFyZW50RXZlbnRJZChldikge1xuICAgICAgICBpZiAoIWV2IHx8IGV2LmlzUmVkYWN0ZWQoKSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFhYWDogRm9yIG5ld2VyIHJlbGF0aW9ucyAoYW5ub3RhdGlvbnMsIHJlcGxhY2VtZW50cywgZXRjLiksIHdlIG5vd1xuICAgICAgICAvLyBoYXZlIGEgYGdldFJlbGF0aW9uYCBoZWxwZXIgb24gdGhlIGV2ZW50LCBhbmQgeW91IG1pZ2h0IGFzc3VtZSBpdFxuICAgICAgICAvLyBjb3VsZCBiZSB1c2VkIGhlcmUgZm9yIHJlcGxpZXMgYXMgd2VsbC4uLiBIb3dldmVyLCB0aGUgaGVscGVyXG4gICAgICAgIC8vIGN1cnJlbnRseSBhc3N1bWVzIHRoZSByZWxhdGlvbiBoYXMgYSBgcmVsX3R5cGVgLCB3aGljaCBvbGRlciByZXBsaWVzXG4gICAgICAgIC8vIGRvIG5vdCwgc28gdGhpcyBibG9jayBpcyBsZWZ0IGFzLWlzIGZvciBub3cuXG4gICAgICAgIGNvbnN0IG1SZWxhdGVzVG8gPSBldi5nZXRXaXJlQ29udGVudCgpWydtLnJlbGF0ZXNfdG8nXTtcbiAgICAgICAgaWYgKG1SZWxhdGVzVG8gJiYgbVJlbGF0ZXNUb1snbS5pbl9yZXBseV90byddKSB7XG4gICAgICAgICAgICBjb25zdCBtSW5SZXBseVRvID0gbVJlbGF0ZXNUb1snbS5pbl9yZXBseV90byddO1xuICAgICAgICAgICAgaWYgKG1JblJlcGx5VG8gJiYgbUluUmVwbHlUb1snZXZlbnRfaWQnXSkgcmV0dXJuIG1JblJlcGx5VG9bJ2V2ZW50X2lkJ107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgIHN0YXRpYyBzdHJpcFBsYWluUmVwbHkoYm9keSkge1xuICAgICAgICAvLyBSZW1vdmVzIGxpbmVzIGJlZ2lubmluZyB3aXRoIGA+IGAgdW50aWwgeW91IHJlYWNoIG9uZSB0aGF0IGRvZXNuJ3QuXG4gICAgICAgIGNvbnN0IGxpbmVzID0gYm9keS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0uc3RhcnRzV2l0aCgnPiAnKSkgbGluZXMuc2hpZnQoKTtcbiAgICAgICAgLy8gUmVwbHkgZmFsbGJhY2sgaGFzIGEgYmxhbmsgbGluZSBhZnRlciBpdCwgc28gcmVtb3ZlIGl0IHRvIHByZXZlbnQgbGVhZGluZyBuZXdsaW5lXG4gICAgICAgIGlmIChsaW5lc1swXSA9PT0gJycpIGxpbmVzLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgIHN0YXRpYyBzdHJpcEhUTUxSZXBseShodG1sKSB7XG4gICAgICAgIC8vIFNhbml0aXplIHRoZSBvcmlnaW5hbCBIVE1MIGZvciBpbmNsdXNpb24gaW4gPG14LXJlcGx5Pi4gIFdlIGFsbG93XG4gICAgICAgIC8vIGFueSBIVE1MLCBzaW5jZSB0aGUgb3JpZ2luYWwgc2VuZGVyIGNvdWxkIHVzZSBzcGVjaWFsIHRhZ3MgdGhhdCB3ZVxuICAgICAgICAvLyBkb24ndCByZWNvZ25pemUsIGJ1dCB3YW50IHRvIHBhc3MgYWxvbmcgdG8gYW55IHJlY2lwaWVudHMgd2hvIGRvXG4gICAgICAgIC8vIHJlY29nbml6ZSB0aGVtIC0tIHJlY2lwaWVudHMgc2hvdWxkIGJlIHNhbml0aXppbmcgYmVmb3JlIGRpc3BsYXlpbmdcbiAgICAgICAgLy8gYW55d2F5cy4gIEhvd2V2ZXIsIHdlIHNhbml0aXplIHRvIDEpIHJlbW92ZSBhbnkgbXgtcmVwbHksIHNvIHRoYXQgd2VcbiAgICAgICAgLy8gZG9uJ3QgZ2VuZXJhdGUgYSBuZXN0ZWQgbXgtcmVwbHksIGFuZCAyKSBtYWtlIHN1cmUgdGhhdCB0aGUgSFRNTCBpc1xuICAgICAgICAvLyBwcm9wZXJseSBmb3JtYXR0ZWQgKGUuZy4gdGFncyBhcmUgY2xvc2VkIHdoZXJlIG5lY2Vzc2FyeSlcbiAgICAgICAgcmV0dXJuIHNhbml0aXplSHRtbChcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWxsb3dlZFRhZ3M6IGZhbHNlLCAvLyBmYWxzZSBtZWFucyBhbGxvdyBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgYWxsb3dlZEF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIHdlIHNvbWVob3cgY2FuJ3QgYWxsb3cgYWxsIHNjaGVtZXMsIHNvIHdlIGFsbG93IGFsbCB0aGF0IHdlXG4gICAgICAgICAgICAgICAgLy8ga25vdyBvZiBhbmQgbXhjIChmb3IgaW1nIHRhZ3MpXG4gICAgICAgICAgICAgICAgYWxsb3dlZFNjaGVtZXM6IFsuLi5QRVJNSVRURURfVVJMX1NDSEVNRVMsICdteGMnXSxcbiAgICAgICAgICAgICAgICBleGNsdXNpdmVGaWx0ZXI6IChmcmFtZSkgPT4gZnJhbWUudGFnID09PSBcIm14LXJlcGx5XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFBhcnQgb2YgUmVwbGllcyBmYWxsYmFjayBzdXBwb3J0XG4gICAgc3RhdGljIGdldE5lc3RlZFJlcGx5VGV4dChldiwgcGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICBpZiAoIWV2KSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQge2JvZHksIGZvcm1hdHRlZF9ib2R5OiBodG1sfSA9IGV2LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGFyZW50RXZlbnRJZChldikpIHtcbiAgICAgICAgICAgIGlmIChib2R5KSBib2R5ID0gdGhpcy5zdHJpcFBsYWluUmVwbHkoYm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWJvZHkpIGJvZHkgPSBcIlwiOyAvLyBBbHdheXMgZW5zdXJlIHdlIGhhdmUgYSBib2R5LCBmb3IgcmVhc29ucy5cblxuICAgICAgICBpZiAoaHRtbCkge1xuICAgICAgICAgICAgLy8gc2FuaXRpemUgdGhlIEhUTUwgYmVmb3JlIHdlIHB1dCBpdCBpbiBhbiA8bXgtcmVwbHk+XG4gICAgICAgICAgICBodG1sID0gdGhpcy5zdHJpcEhUTUxSZXBseShodG1sKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEVzY2FwZSB0aGUgYm9keSB0byB1c2UgYXMgSFRNTCBiZWxvdy5cbiAgICAgICAgICAgIC8vIFdlIGFsc28gcnVuIGEgbmwyYnIgb3ZlciB0aGUgcmVzdWx0IHRvIGZpeCB0aGUgZmFsbGJhY2sgcmVwcmVzZW50YXRpb24uIFdlIGRvIHRoaXNcbiAgICAgICAgICAgIC8vIGFmdGVyIGNvbnZlcnRpbmcgdGhlIHRleHQgdG8gc2FmZSBIVE1MIHRvIGF2b2lkIHVzZXItcHJvdmlkZWQgQlIncyBmcm9tIGJlaW5nIGNvbnZlcnRlZC5cbiAgICAgICAgICAgIGh0bWwgPSBlc2NhcGVIdG1sKGJvZHkpLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldiBub3RlOiBkbyBub3QgcmVseSBvbiBgYm9keWAgYmVpbmcgc2FmZSBmb3IgSFRNTCB1c2FnZSBiZWxvdy5cblxuICAgICAgICBjb25zdCBldkxpbmsgPSBwZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KGV2LmdldElkKCkpO1xuICAgICAgICBjb25zdCB1c2VyTGluayA9IG1ha2VVc2VyUGVybWFsaW5rKGV2LmdldFNlbmRlcigpKTtcbiAgICAgICAgY29uc3QgbXhpZCA9IGV2LmdldFNlbmRlcigpO1xuXG4gICAgICAgIC8vIFRoaXMgZmFsbGJhY2sgY29udGFpbnMgdGV4dCB0aGF0IGlzIGV4cGxpY2l0bHkgRU4uXG4gICAgICAgIHN3aXRjaCAoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ20udGV4dCc6XG4gICAgICAgICAgICBjYXNlICdtLm5vdGljZSc6IHtcbiAgICAgICAgICAgICAgICBodG1sID0gYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+IDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+YFxuICAgICAgICAgICAgICAgICAgICArIGA8YnI+JHtodG1sfTwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBib2R5LnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbMF0gPSBgPCR7bXhpZH0+ICR7bGluZXNbMF19YDtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IGxpbmVzLm1hcCgobGluZSkgPT4gYD4gJHtsaW5lfWApLmpvaW4oJ1xcbicpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbS5pbWFnZSc6XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYW4gaW1hZ2UuPC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYW4gaW1hZ2UuXFxuXFxuYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ20udmlkZW8nOlxuICAgICAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgICAgICsgYDxicj5zZW50IGEgdmlkZW8uPC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYSB2aWRlby5cXG5cXG5gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbS5hdWRpbyc6XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYW4gYXVkaW8gZmlsZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBgPiA8JHtteGlkfT4gc2VudCBhbiBhdWRpbyBmaWxlLlxcblxcbmA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtLmZpbGUnOlxuICAgICAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgICAgICsgYDxicj5zZW50IGEgZmlsZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBgPiA8JHtteGlkfT4gc2VudCBhIGZpbGUuXFxuXFxuYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ20uZW1vdGUnOiB7XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiAqIGBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT48YnI+JHtodG1sfTwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBib2R5LnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbMF0gPSBgKiA8JHtteGlkfT4gJHtsaW5lc1swXX1gO1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gbGluZXMubWFwKChsaW5lKSA9PiBgPiAke2xpbmV9YCkuam9pbignXFxuJykgKyAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtib2R5LCBodG1sfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFrZVJlcGx5TWl4SW4oZXYpIHtcbiAgICAgICAgaWYgKCFldikgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ20ucmVsYXRlc190byc6IHtcbiAgICAgICAgICAgICAgICAnbS5pbl9yZXBseV90byc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V2ZW50X2lkJzogZXYuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFrZVRocmVhZChwYXJlbnRFdiwgb25IZWlnaHRDaGFuZ2VkLCBwZXJtYWxpbmtDcmVhdG9yLCByZWYsIHVzZUlSQ0xheW91dCkge1xuICAgICAgICBpZiAoIVJlcGx5VGhyZWFkLmdldFBhcmVudEV2ZW50SWQocGFyZW50RXYpKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9SZXBseVRocmVhZF93cmFwcGVyX2VtcHR5XCIgLz47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxSZXBseVRocmVhZFxuICAgICAgICAgICAgcGFyZW50RXY9e3BhcmVudEV2fVxuICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkPXtvbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICByZWY9e3JlZn1cbiAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3Blcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICB1c2VJUkNMYXlvdXQ9e3VzZUlSQ0xheW91dH1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5yZXBsYWNlZFwiLCB0aGlzLm9uRXZlbnRSZXBsYWNlZCk7XG4gICAgICAgIGlmICh0aGlzLnJvb20pIHtcbiAgICAgICAgICAgIHRoaXMucm9vbS5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVkYWN0aW9uXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucm9vbS5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVkYWN0aW9uQ2FuY2VsbGVkXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZUZvckV2ZW50SWQgPSAoZXZlbnRJZCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudHMuc29tZShldmVudCA9PiBldmVudC5nZXRJZCgpID09PSBldmVudElkKSkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uRXZlbnRSZXBsYWNlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGV2ZW50cyB3ZSBhcmUgcmVuZGVyaW5nIGdldHMgcmVwbGFjZWQsIGZvcmNlIGEgcmUtcmVuZGVyXG4gICAgICAgIHRoaXMudXBkYXRlRm9yRXZlbnRJZChldi5nZXRJZCgpKTtcbiAgICB9O1xuXG4gICAgb25Sb29tUmVkYWN0aW9uID0gKGV2KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldi5nZXRBc3NvY2lhdGVkSWQoKTtcbiAgICAgICAgaWYgKCFldmVudElkKSByZXR1cm47XG5cbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBldmVudHMgd2UgYXJlIHJlbmRlcmluZyBnZXRzIHJlZGFjdGVkLCBmb3JjZSBhIHJlLXJlbmRlclxuICAgICAgICB0aGlzLnVwZGF0ZUZvckV2ZW50SWQoZXZlbnRJZCk7XG4gICAgfTtcblxuICAgIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IHtwYXJlbnRFdn0gPSB0aGlzLnByb3BzO1xuICAgICAgICAvLyBhdCB0aW1lIG9mIG1ha2luZyB0aGlzIGNvbXBvbmVudCB3ZSBjaGVja2VkIHRoYXQgcHJvcHMucGFyZW50RXYgaGFzIGEgcGFyZW50RXZlbnRJZFxuICAgICAgICBjb25zdCBldiA9IGF3YWl0IHRoaXMuZ2V0RXZlbnQoUmVwbHlUaHJlYWQuZ2V0UGFyZW50RXZlbnRJZChwYXJlbnRFdikpO1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICBpZiAoZXYpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV2ZW50czogW2V2XSxcbiAgICAgICAgICAgIH0sIHRoaXMubG9hZE5leHRFdmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGxvYWROZXh0RXZlbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBldiA9IHRoaXMuc3RhdGUuZXZlbnRzWzBdO1xuICAgICAgICBjb25zdCBpblJlcGx5VG9FdmVudElkID0gUmVwbHlUaHJlYWQuZ2V0UGFyZW50RXZlbnRJZChldik7XG5cbiAgICAgICAgaWYgKCFpblJlcGx5VG9FdmVudElkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9hZGVkRXYgPSBhd2FpdCB0aGlzLmdldEV2ZW50KGluUmVwbHlUb0V2ZW50SWQpO1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICBpZiAobG9hZGVkRXYpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRlZEV2fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGdldEV2ZW50KGV2ZW50SWQpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSB0aGlzLnJvb20uZmluZEV2ZW50QnlJZChldmVudElkKTtcbiAgICAgICAgaWYgKGV2ZW50KSByZXR1cm4gZXZlbnQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGFzayB0aGUgY2xpZW50IHRvIGZldGNoIHRoZSBldmVudCB3ZSB3YW50IHVzaW5nIHRoZSBjb250ZXh0IEFQSSwgb25seSBpbnRlcmZhY2UgdG8gZG8gc28gaXMgdG8gYXNrXG4gICAgICAgICAgICAvLyBmb3IgYSB0aW1lbGluZSB3aXRoIHRoYXQgZXZlbnQsIGJ1dCBvbmNlIGl0IGlzIGxvYWRlZCB3ZSBjYW4gdXNlIGZpbmRFdmVudEJ5SWQgdG8gbG9vayB1cCB0aGUgZXYgbWFwXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQuZ2V0RXZlbnRUaW1lbGluZSh0aGlzLnJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCksIGV2ZW50SWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBpZiBpdCBmYWlscyBjYXRjaCB0aGUgZXJyb3IgYW5kIHJldHVybiBlYXJseSwgdGhlcmUncyBubyBwb2ludCB0cnlpbmcgdG8gZmluZCB0aGUgZXZlbnQgaW4gdGhpcyBjYXNlLlxuICAgICAgICAgICAgLy8gUmV0dXJuIG51bGwgYXMgaXQgaXMgZmFsc2V5IGFuZCB0aHVzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGFuIGVycm9yIChhcyB0aGUgZXZlbnQgY2Fubm90IGJlIHJlc29sdmVkKS5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJvb20uZmluZEV2ZW50QnlJZChldmVudElkKTtcbiAgICB9XG5cbiAgICBjYW5Db2xsYXBzZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCA+IDE7XG4gICAgfVxuXG4gICAgY29sbGFwc2UoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIG9uUXVvdGVDbGljaygpIHtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gW3RoaXMuc3RhdGUubG9hZGVkRXYsIC4uLnRoaXMuc3RhdGUuZXZlbnRzXTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZEV2OiBudWxsLFxuICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICB9LCB0aGlzLmxvYWROZXh0RXZlbnQpO1xuXG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBoZWFkZXIgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycikge1xuICAgICAgICAgICAgaGVhZGVyID0gPGJsb2NrcXVvdGUgY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWQgbXhfUmVwbHlUaHJlYWRfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIF90KCdVbmFibGUgdG8gbG9hZCBldmVudCB0aGF0IHdhcyByZXBsaWVkIHRvLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpdCBlaXRoZXIgZG9lcyBub3QgZXhpc3Qgb3IgeW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gdmlldyBpdC4nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvYmxvY2txdW90ZT47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5sb2FkZWRFdikge1xuICAgICAgICAgICAgY29uc3QgZXYgPSB0aGlzLnN0YXRlLmxvYWRlZEV2O1xuICAgICAgICAgICAgY29uc3QgUGlsbCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlBpbGwnKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmNvbnRleHQuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICBoZWFkZXIgPSA8YmxvY2txdW90ZSBjbGFzc05hbWU9XCJteF9SZXBseVRocmVhZFwiPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX3QoJzxhPkluIHJlcGx5IHRvPC9hPiA8cGlsbD4nLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2EnOiAoc3ViKSA9PiA8YSBvbkNsaWNrPXt0aGlzLm9uUXVvdGVDbGlja30gY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWRfc2hvd1wiPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3BpbGwnOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT17UGlsbC5UWVBFX1VTRVJfTUVOVElPTn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhldi5nZXRTZW5kZXIoKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNob3dQaWxsQXZhdGFyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Jsb2NrcXVvdGU+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgaGVhZGVyID0gPFNwaW5uZXIgdz17MTZ9IGg9ezE2fSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEV2ZW50VGlsZSA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnJvb21zLkV2ZW50VGlsZScpO1xuICAgICAgICBjb25zdCBEYXRlU2VwYXJhdG9yID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuRGF0ZVNlcGFyYXRvcicpO1xuICAgICAgICBjb25zdCBldlRpbGVzID0gdGhpcy5zdGF0ZS5ldmVudHMubWFwKChldikgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGVTZXAgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAod2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJvcHMucGFyZW50RXYuZ2V0RGF0ZSgpLCBldi5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVNlcCA9IDxhIGhyZWY9e3RoaXMucHJvcHMudXJsfT48RGF0ZVNlcGFyYXRvciB0cz17ZXYuZ2V0VHMoKX0gLz48L2E+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPGJsb2NrcXVvdGUgY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWRcIiBrZXk9e2V2LmdldElkKCl9PlxuICAgICAgICAgICAgICAgIHsgZGF0ZVNlcCB9XG4gICAgICAgICAgICAgICAgPEV2ZW50VGlsZVxuICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtldn1cbiAgICAgICAgICAgICAgICAgICAgdGlsZVNoYXBlPVwicmVwbHlcIlxuICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgIGlzUmVkYWN0ZWQ9e2V2LmlzUmVkYWN0ZWQoKX1cbiAgICAgICAgICAgICAgICAgICAgaXNUd2VsdmVIb3VyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpfVxuICAgICAgICAgICAgICAgICAgICB1c2VJUkNMYXlvdXQ9e3RoaXMucHJvcHMudXNlSVJDTGF5b3V0fVxuICAgICAgICAgICAgICAgICAgICBlbmFibGVGbGFpcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuRmxhaXIpfVxuICAgICAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkPXtldi5yZXBsYWNpbmdFdmVudElkKCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvYmxvY2txdW90ZT47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1JlcGx5VGhyZWFkX3dyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXY+eyBoZWFkZXIgfTwvZGl2PlxuICAgICAgICAgICAgPGRpdj57IGV2VGlsZXMgfTwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl19