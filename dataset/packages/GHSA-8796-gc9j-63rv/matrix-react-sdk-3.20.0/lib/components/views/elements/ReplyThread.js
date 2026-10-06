"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _event = require("matrix-js-sdk/src/models/event");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Layout = require("../../../settings/Layout");

var _escapeHtml = _interopRequireDefault(require("escape-html"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _sanitizeHtml = _interopRequireDefault(require("sanitize-html"));

var _UIFeature = require("../../../settings/UIFeature");

var _HtmlUtils = require("../../../HtmlUtils");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

let ReplyThread = ( // This component does no cycle detection, simply because the only way to make such a cycle would be to
// craft event_id's, using a homeserver that generates predictable event IDs; even then the impact would
// be low as each event being loaded (after the first) is triggered by an explicit user action.
_dec = (0, _replaceableComponent.replaceableComponent)("views.elements.ReplyThread"), _dec(_class = (_temp = _class2 = class ReplyThread extends _react.default.Component {
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

  static makeThread(parentEv, onHeightChanged, permalinkCreator, ref, layout) {
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
      layout: layout
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
        layout: this.props.layout,
        enableFlair: _SettingsStore.default.getValue(_UIFeature.UIFeature.Flair),
        replacingEventId: ev.replacingEventId()
      }));
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_ReplyThread_wrapper"
    }, /*#__PURE__*/_react.default.createElement("div", null, header), /*#__PURE__*/_react.default.createElement("div", null, evTiles));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // the latest event in this chain of replies
  parentEv: _propTypes.default.instanceOf(_event.MatrixEvent),
  // called when the ReplyThread contents has changed, including EventTiles thereof
  onHeightChanged: _propTypes.default.func.isRequired,
  permalinkCreator: _propTypes.default.instanceOf(_Permalinks.RoomPermalinkCreator).isRequired,
  // Specifies which layout to use.
  layout: _Layout.LayoutPropType
}), (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = ReplyThread;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL1JlcGx5VGhyZWFkLmpzIl0sIm5hbWVzIjpbIlJlcGx5VGhyZWFkIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsImV2ZW50SWQiLCJzdGF0ZSIsImV2ZW50cyIsInNvbWUiLCJldmVudCIsImdldElkIiwiZm9yY2VVcGRhdGUiLCJldiIsInVubW91bnRlZCIsInVwZGF0ZUZvckV2ZW50SWQiLCJnZXRBc3NvY2lhdGVkSWQiLCJsb2FkZWRFdiIsImxvYWRpbmciLCJlcnIiLCJvbiIsIm9uRXZlbnRSZXBsYWNlZCIsInJvb20iLCJnZXRSb29tIiwicGFyZW50RXYiLCJnZXRSb29tSWQiLCJvblJvb21SZWRhY3Rpb24iLCJvblF1b3RlQ2xpY2siLCJiaW5kIiwiY2FuQ29sbGFwc2UiLCJjb2xsYXBzZSIsImdldFBhcmVudEV2ZW50SWQiLCJpc1JlZGFjdGVkIiwibVJlbGF0ZXNUbyIsImdldFdpcmVDb250ZW50IiwibUluUmVwbHlUbyIsInN0cmlwUGxhaW5SZXBseSIsImJvZHkiLCJsaW5lcyIsInNwbGl0IiwibGVuZ3RoIiwic3RhcnRzV2l0aCIsInNoaWZ0Iiwiam9pbiIsInN0cmlwSFRNTFJlcGx5IiwiaHRtbCIsImFsbG93ZWRUYWdzIiwiYWxsb3dlZEF0dHJpYnV0ZXMiLCJhbGxvd2VkU2NoZW1lcyIsIlBFUk1JVFRFRF9VUkxfU0NIRU1FUyIsImV4Y2x1c2l2ZUZpbHRlciIsImZyYW1lIiwidGFnIiwiZ2V0TmVzdGVkUmVwbHlUZXh0IiwicGVybWFsaW5rQ3JlYXRvciIsImZvcm1hdHRlZF9ib2R5IiwiZ2V0Q29udGVudCIsInJlcGxhY2UiLCJldkxpbmsiLCJmb3JFdmVudCIsInVzZXJMaW5rIiwiZ2V0U2VuZGVyIiwibXhpZCIsIm1zZ3R5cGUiLCJ0cmltIiwibWFwIiwibGluZSIsIm1ha2VSZXBseU1peEluIiwibWFrZVRocmVhZCIsIm9uSGVpZ2h0Q2hhbmdlZCIsInJlZiIsImxheW91dCIsImNvbXBvbmVudERpZE1vdW50IiwiaW5pdGlhbGl6ZSIsImNvbXBvbmVudERpZFVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJnZXRFdmVudCIsInNldFN0YXRlIiwibG9hZE5leHRFdmVudCIsImluUmVwbHlUb0V2ZW50SWQiLCJmaW5kRXZlbnRCeUlkIiwiZ2V0RXZlbnRUaW1lbGluZSIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImUiLCJkaXMiLCJmaXJlIiwiQWN0aW9uIiwiRm9jdXNDb21wb3NlciIsInJlbmRlciIsImhlYWRlciIsIlBpbGwiLCJzZGsiLCJnZXRDb21wb25lbnQiLCJzdWIiLCJUWVBFX1VTRVJfTUVOVElPTiIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIlNwaW5uZXIiLCJFdmVudFRpbGUiLCJEYXRlU2VwYXJhdG9yIiwiZXZUaWxlcyIsImRhdGVTZXAiLCJnZXREYXRlIiwidXJsIiwiZ2V0VHMiLCJVSUZlYXR1cmUiLCJGbGFpciIsInJlcGxhY2luZ0V2ZW50SWQiLCJQcm9wVHlwZXMiLCJpbnN0YW5jZU9mIiwiTWF0cml4RXZlbnQiLCJmdW5jIiwiaXNSZXF1aXJlZCIsIlJvb21QZXJtYWxpbmtDcmVhdG9yIiwiTGF5b3V0UHJvcFR5cGUiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0lBTXFCQSxXLEtBSnJCO0FBQ0E7QUFDQTtPQUNDLGdEQUFxQiw0QkFBckIsQyxtQ0FBRCxNQUNxQkEsV0FEckIsU0FDeUNDLGVBQU1DLFNBRC9DLENBQ3lEO0FBYXJEQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUUMsT0FBUixFQUFp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QSxnQkFBZ0IsRUFBRTlGLEVBQUUsQ0FBQytGLGdCQUFIO0FBVHRCLFFBRkcsQ0FBUDtBQWNILEtBckJlLENBQWhCO0FBdUJBLHdCQUFPO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixvQkFDSCwwQ0FBT2xCLE1BQVAsQ0FERyxlQUVILDBDQUFPVyxPQUFQLENBRkcsQ0FBUDtBQUlIOztBQTNXb0QsQyxzREFDbEM7QUFDZjtBQUNBN0UsRUFBQUEsUUFBUSxFQUFFcUYsbUJBQVVDLFVBQVYsQ0FBcUJDLGtCQUFyQixDQUZLO0FBR2Y7QUFDQTFDLEVBQUFBLGVBQWUsRUFBRXdDLG1CQUFVRyxJQUFWLENBQWVDLFVBSmpCO0FBS2YzRCxFQUFBQSxnQkFBZ0IsRUFBRXVELG1CQUFVQyxVQUFWLENBQXFCSSxnQ0FBckIsRUFBMkNELFVBTDlDO0FBTWY7QUFDQTFDLEVBQUFBLE1BQU0sRUFBRTRDO0FBUE8sQyx5REFVRUMsNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IE1pY2hhZWwgVGVsYXR5bnNraSA8N3QzY2hndXlAZ21haWwuY29tPlxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7d2FudHNEYXRlU2VwYXJhdG9yfSBmcm9tICcuLi8uLi8uLi9EYXRlVXRpbHMnO1xuaW1wb3J0IHtNYXRyaXhFdmVudH0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCB7bWFrZVVzZXJQZXJtYWxpbmssIFJvb21QZXJtYWxpbmtDcmVhdG9yfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IHtMYXlvdXRQcm9wVHlwZX0gZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL0xheW91dFwiO1xuaW1wb3J0IGVzY2FwZUh0bWwgZnJvbSBcImVzY2FwZS1odG1sXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBzYW5pdGl6ZUh0bWwgZnJvbSBcInNhbml0aXplLWh0bWxcIjtcbmltcG9ydCB7VUlGZWF0dXJlfSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvVUlGZWF0dXJlXCI7XG5pbXBvcnQge1BFUk1JVFRFRF9VUkxfU0NIRU1FU30gZnJvbSBcIi4uLy4uLy4uL0h0bWxVdGlsc1wiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8vIFRoaXMgY29tcG9uZW50IGRvZXMgbm8gY3ljbGUgZGV0ZWN0aW9uLCBzaW1wbHkgYmVjYXVzZSB0aGUgb25seSB3YXkgdG8gbWFrZSBzdWNoIGEgY3ljbGUgd291bGQgYmUgdG9cbi8vIGNyYWZ0IGV2ZW50X2lkJ3MsIHVzaW5nIGEgaG9tZXNlcnZlciB0aGF0IGdlbmVyYXRlcyBwcmVkaWN0YWJsZSBldmVudCBJRHM7IGV2ZW4gdGhlbiB0aGUgaW1wYWN0IHdvdWxkXG4vLyBiZSBsb3cgYXMgZWFjaCBldmVudCBiZWluZyBsb2FkZWQgKGFmdGVyIHRoZSBmaXJzdCkgaXMgdHJpZ2dlcmVkIGJ5IGFuIGV4cGxpY2l0IHVzZXIgYWN0aW9uLlxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZWxlbWVudHMuUmVwbHlUaHJlYWRcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlcGx5VGhyZWFkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0aGUgbGF0ZXN0IGV2ZW50IGluIHRoaXMgY2hhaW4gb2YgcmVwbGllc1xuICAgICAgICBwYXJlbnRFdjogUHJvcFR5cGVzLmluc3RhbmNlT2YoTWF0cml4RXZlbnQpLFxuICAgICAgICAvLyBjYWxsZWQgd2hlbiB0aGUgUmVwbHlUaHJlYWQgY29udGVudHMgaGFzIGNoYW5nZWQsIGluY2x1ZGluZyBFdmVudFRpbGVzIHRoZXJlb2ZcbiAgICAgICAgb25IZWlnaHRDaGFuZ2VkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihSb29tUGVybWFsaW5rQ3JlYXRvcikuaXNSZXF1aXJlZCxcbiAgICAgICAgLy8gU3BlY2lmaWVzIHdoaWNoIGxheW91dCB0byB1c2UuXG4gICAgICAgIGxheW91dDogTGF5b3V0UHJvcFR5cGUsXG4gICAgfTtcblxuICAgIHN0YXRpYyBjb250ZXh0VHlwZSA9IE1hdHJpeENsaWVudENvbnRleHQ7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcywgY29udGV4dCkge1xuICAgICAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIFRoZSBsb2FkZWQgZXZlbnRzIHRvIGJlIHJlbmRlcmVkIGFzIGxpbmVhci1yZXBsaWVzXG4gICAgICAgICAgICBldmVudHM6IFtdLFxuXG4gICAgICAgICAgICAvLyBUaGUgbGF0ZXN0IGxvYWRlZCBldmVudCB3aGljaCBoYXMgbm90IHlldCBiZWVuIHNob3duXG4gICAgICAgICAgICBsb2FkZWRFdjogbnVsbCxcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgdGhlIGNvbXBvbmVudCBpcyBzdGlsbCBsb2FkaW5nIG1vcmUgZXZlbnRzXG4gICAgICAgICAgICBsb2FkaW5nOiB0cnVlLFxuXG4gICAgICAgICAgICAvLyBXaGV0aGVyIGFzIGVycm9yIHdhcyBlbmNvdW50ZXJlZCBmZXRjaGluZyBhIHJlcGxpZWQgdG8gZXZlbnQuXG4gICAgICAgICAgICBlcnI6IGZhbHNlLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29udGV4dC5vbihcIkV2ZW50LnJlcGxhY2VkXCIsIHRoaXMub25FdmVudFJlcGxhY2VkKTtcbiAgICAgICAgdGhpcy5yb29tID0gdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5wYXJlbnRFdi5nZXRSb29tSWQoKSk7XG4gICAgICAgIHRoaXMucm9vbS5vbihcIlJvb20ucmVkYWN0aW9uXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgdGhpcy5yb29tLm9uKFwiUm9vbS5yZWRhY3Rpb25DYW5jZWxsZWRcIiwgdGhpcy5vblJvb21SZWRhY3Rpb24pO1xuXG4gICAgICAgIHRoaXMub25RdW90ZUNsaWNrID0gdGhpcy5vblF1b3RlQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jYW5Db2xsYXBzZSA9IHRoaXMuY2FuQ29sbGFwc2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5jb2xsYXBzZSA9IHRoaXMuY29sbGFwc2UuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UGFyZW50RXZlbnRJZChldikge1xuICAgICAgICBpZiAoIWV2IHx8IGV2LmlzUmVkYWN0ZWQoKSkgcmV0dXJuO1xuXG4gICAgICAgIC8vIFhYWDogRm9yIG5ld2VyIHJlbGF0aW9ucyAoYW5ub3RhdGlvbnMsIHJlcGxhY2VtZW50cywgZXRjLiksIHdlIG5vd1xuICAgICAgICAvLyBoYXZlIGEgYGdldFJlbGF0aW9uYCBoZWxwZXIgb24gdGhlIGV2ZW50LCBhbmQgeW91IG1pZ2h0IGFzc3VtZSBpdFxuICAgICAgICAvLyBjb3VsZCBiZSB1c2VkIGhlcmUgZm9yIHJlcGxpZXMgYXMgd2VsbC4uLiBIb3dldmVyLCB0aGUgaGVscGVyXG4gICAgICAgIC8vIGN1cnJlbnRseSBhc3N1bWVzIHRoZSByZWxhdGlvbiBoYXMgYSBgcmVsX3R5cGVgLCB3aGljaCBvbGRlciByZXBsaWVzXG4gICAgICAgIC8vIGRvIG5vdCwgc28gdGhpcyBibG9jayBpcyBsZWZ0IGFzLWlzIGZvciBub3cuXG4gICAgICAgIGNvbnN0IG1SZWxhdGVzVG8gPSBldi5nZXRXaXJlQ29udGVudCgpWydtLnJlbGF0ZXNfdG8nXTtcbiAgICAgICAgaWYgKG1SZWxhdGVzVG8gJiYgbVJlbGF0ZXNUb1snbS5pbl9yZXBseV90byddKSB7XG4gICAgICAgICAgICBjb25zdCBtSW5SZXBseVRvID0gbVJlbGF0ZXNUb1snbS5pbl9yZXBseV90byddO1xuICAgICAgICAgICAgaWYgKG1JblJlcGx5VG8gJiYgbUluUmVwbHlUb1snZXZlbnRfaWQnXSkgcmV0dXJuIG1JblJlcGx5VG9bJ2V2ZW50X2lkJ107XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgIHN0YXRpYyBzdHJpcFBsYWluUmVwbHkoYm9keSkge1xuICAgICAgICAvLyBSZW1vdmVzIGxpbmVzIGJlZ2lubmluZyB3aXRoIGA+IGAgdW50aWwgeW91IHJlYWNoIG9uZSB0aGF0IGRvZXNuJ3QuXG4gICAgICAgIGNvbnN0IGxpbmVzID0gYm9keS5zcGxpdCgnXFxuJyk7XG4gICAgICAgIHdoaWxlIChsaW5lcy5sZW5ndGggJiYgbGluZXNbMF0uc3RhcnRzV2l0aCgnPiAnKSkgbGluZXMuc2hpZnQoKTtcbiAgICAgICAgLy8gUmVwbHkgZmFsbGJhY2sgaGFzIGEgYmxhbmsgbGluZSBhZnRlciBpdCwgc28gcmVtb3ZlIGl0IHRvIHByZXZlbnQgbGVhZGluZyBuZXdsaW5lXG4gICAgICAgIGlmIChsaW5lc1swXSA9PT0gJycpIGxpbmVzLnNoaWZ0KCk7XG4gICAgICAgIHJldHVybiBsaW5lcy5qb2luKCdcXG4nKTtcbiAgICB9XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgIHN0YXRpYyBzdHJpcEhUTUxSZXBseShodG1sKSB7XG4gICAgICAgIC8vIFNhbml0aXplIHRoZSBvcmlnaW5hbCBIVE1MIGZvciBpbmNsdXNpb24gaW4gPG14LXJlcGx5Pi4gIFdlIGFsbG93XG4gICAgICAgIC8vIGFueSBIVE1MLCBzaW5jZSB0aGUgb3JpZ2luYWwgc2VuZGVyIGNvdWxkIHVzZSBzcGVjaWFsIHRhZ3MgdGhhdCB3ZVxuICAgICAgICAvLyBkb24ndCByZWNvZ25pemUsIGJ1dCB3YW50IHRvIHBhc3MgYWxvbmcgdG8gYW55IHJlY2lwaWVudHMgd2hvIGRvXG4gICAgICAgIC8vIHJlY29nbml6ZSB0aGVtIC0tIHJlY2lwaWVudHMgc2hvdWxkIGJlIHNhbml0aXppbmcgYmVmb3JlIGRpc3BsYXlpbmdcbiAgICAgICAgLy8gYW55d2F5cy4gIEhvd2V2ZXIsIHdlIHNhbml0aXplIHRvIDEpIHJlbW92ZSBhbnkgbXgtcmVwbHksIHNvIHRoYXQgd2VcbiAgICAgICAgLy8gZG9uJ3QgZ2VuZXJhdGUgYSBuZXN0ZWQgbXgtcmVwbHksIGFuZCAyKSBtYWtlIHN1cmUgdGhhdCB0aGUgSFRNTCBpc1xuICAgICAgICAvLyBwcm9wZXJseSBmb3JtYXR0ZWQgKGUuZy4gdGFncyBhcmUgY2xvc2VkIHdoZXJlIG5lY2Vzc2FyeSlcbiAgICAgICAgcmV0dXJuIHNhbml0aXplSHRtbChcbiAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgYWxsb3dlZFRhZ3M6IGZhbHNlLCAvLyBmYWxzZSBtZWFucyBhbGxvdyBldmVyeXRoaW5nXG4gICAgICAgICAgICAgICAgYWxsb3dlZEF0dHJpYnV0ZXM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC8vIHdlIHNvbWVob3cgY2FuJ3QgYWxsb3cgYWxsIHNjaGVtZXMsIHNvIHdlIGFsbG93IGFsbCB0aGF0IHdlXG4gICAgICAgICAgICAgICAgLy8ga25vdyBvZiBhbmQgbXhjIChmb3IgaW1nIHRhZ3MpXG4gICAgICAgICAgICAgICAgYWxsb3dlZFNjaGVtZXM6IFsuLi5QRVJNSVRURURfVVJMX1NDSEVNRVMsICdteGMnXSxcbiAgICAgICAgICAgICAgICBleGNsdXNpdmVGaWx0ZXI6IChmcmFtZSkgPT4gZnJhbWUudGFnID09PSBcIm14LXJlcGx5XCIsXG4gICAgICAgICAgICB9LFxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIFBhcnQgb2YgUmVwbGllcyBmYWxsYmFjayBzdXBwb3J0XG4gICAgc3RhdGljIGdldE5lc3RlZFJlcGx5VGV4dChldiwgcGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICBpZiAoIWV2KSByZXR1cm4gbnVsbDtcblxuICAgICAgICBsZXQge2JvZHksIGZvcm1hdHRlZF9ib2R5OiBodG1sfSA9IGV2LmdldENvbnRlbnQoKTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0UGFyZW50RXZlbnRJZChldikpIHtcbiAgICAgICAgICAgIGlmIChib2R5KSBib2R5ID0gdGhpcy5zdHJpcFBsYWluUmVwbHkoYm9keSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWJvZHkpIGJvZHkgPSBcIlwiOyAvLyBBbHdheXMgZW5zdXJlIHdlIGhhdmUgYSBib2R5LCBmb3IgcmVhc29ucy5cblxuICAgICAgICBpZiAoaHRtbCkge1xuICAgICAgICAgICAgLy8gc2FuaXRpemUgdGhlIEhUTUwgYmVmb3JlIHdlIHB1dCBpdCBpbiBhbiA8bXgtcmVwbHk+XG4gICAgICAgICAgICBodG1sID0gdGhpcy5zdHJpcEhUTUxSZXBseShodG1sKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEVzY2FwZSB0aGUgYm9keSB0byB1c2UgYXMgSFRNTCBiZWxvdy5cbiAgICAgICAgICAgIC8vIFdlIGFsc28gcnVuIGEgbmwyYnIgb3ZlciB0aGUgcmVzdWx0IHRvIGZpeCB0aGUgZmFsbGJhY2sgcmVwcmVzZW50YXRpb24uIFdlIGRvIHRoaXNcbiAgICAgICAgICAgIC8vIGFmdGVyIGNvbnZlcnRpbmcgdGhlIHRleHQgdG8gc2FmZSBIVE1MIHRvIGF2b2lkIHVzZXItcHJvdmlkZWQgQlIncyBmcm9tIGJlaW5nIGNvbnZlcnRlZC5cbiAgICAgICAgICAgIGh0bWwgPSBlc2NhcGVIdG1sKGJvZHkpLnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRldiBub3RlOiBkbyBub3QgcmVseSBvbiBgYm9keWAgYmVpbmcgc2FmZSBmb3IgSFRNTCB1c2FnZSBiZWxvdy5cblxuICAgICAgICBjb25zdCBldkxpbmsgPSBwZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KGV2LmdldElkKCkpO1xuICAgICAgICBjb25zdCB1c2VyTGluayA9IG1ha2VVc2VyUGVybWFsaW5rKGV2LmdldFNlbmRlcigpKTtcbiAgICAgICAgY29uc3QgbXhpZCA9IGV2LmdldFNlbmRlcigpO1xuXG4gICAgICAgIC8vIFRoaXMgZmFsbGJhY2sgY29udGFpbnMgdGV4dCB0aGF0IGlzIGV4cGxpY2l0bHkgRU4uXG4gICAgICAgIHN3aXRjaCAoZXYuZ2V0Q29udGVudCgpLm1zZ3R5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ20udGV4dCc6XG4gICAgICAgICAgICBjYXNlICdtLm5vdGljZSc6IHtcbiAgICAgICAgICAgICAgICBodG1sID0gYDxteC1yZXBseT48YmxvY2txdW90ZT48YSBocmVmPVwiJHtldkxpbmt9XCI+SW4gcmVwbHkgdG88L2E+IDxhIGhyZWY9XCIke3VzZXJMaW5rfVwiPiR7bXhpZH08L2E+YFxuICAgICAgICAgICAgICAgICAgICArIGA8YnI+JHtodG1sfTwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBib2R5LnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbMF0gPSBgPCR7bXhpZH0+ICR7bGluZXNbMF19YDtcbiAgICAgICAgICAgICAgICAgICAgYm9keSA9IGxpbmVzLm1hcCgobGluZSkgPT4gYD4gJHtsaW5lfWApLmpvaW4oJ1xcbicpICsgJ1xcblxcbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSAnbS5pbWFnZSc6XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYW4gaW1hZ2UuPC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYW4gaW1hZ2UuXFxuXFxuYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ20udmlkZW8nOlxuICAgICAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgICAgICsgYDxicj5zZW50IGEgdmlkZW8uPC9ibG9ja3F1b3RlPjwvbXgtcmVwbHk+YDtcbiAgICAgICAgICAgICAgICBib2R5ID0gYD4gPCR7bXhpZH0+IHNlbnQgYSB2aWRlby5cXG5cXG5gO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbS5hdWRpbyc6XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiA8YSBocmVmPVwiJHt1c2VyTGlua31cIj4ke214aWR9PC9hPmBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGJyPnNlbnQgYW4gYXVkaW8gZmlsZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBgPiA8JHtteGlkfT4gc2VudCBhbiBhdWRpbyBmaWxlLlxcblxcbmA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdtLmZpbGUnOlxuICAgICAgICAgICAgICAgIGh0bWwgPSBgPG14LXJlcGx5PjxibG9ja3F1b3RlPjxhIGhyZWY9XCIke2V2TGlua31cIj5JbiByZXBseSB0bzwvYT4gPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT5gXG4gICAgICAgICAgICAgICAgICAgICsgYDxicj5zZW50IGEgZmlsZS48L2Jsb2NrcXVvdGU+PC9teC1yZXBseT5gO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBgPiA8JHtteGlkfT4gc2VudCBhIGZpbGUuXFxuXFxuYDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ20uZW1vdGUnOiB7XG4gICAgICAgICAgICAgICAgaHRtbCA9IGA8bXgtcmVwbHk+PGJsb2NrcXVvdGU+PGEgaHJlZj1cIiR7ZXZMaW5rfVwiPkluIHJlcGx5IHRvPC9hPiAqIGBcbiAgICAgICAgICAgICAgICAgICAgKyBgPGEgaHJlZj1cIiR7dXNlckxpbmt9XCI+JHtteGlkfTwvYT48YnI+JHtodG1sfTwvYmxvY2txdW90ZT48L214LXJlcGx5PmA7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSBib2R5LnRyaW0oKS5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxpbmVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZXNbMF0gPSBgKiA8JHtteGlkfT4gJHtsaW5lc1swXX1gO1xuICAgICAgICAgICAgICAgICAgICBib2R5ID0gbGluZXMubWFwKChsaW5lKSA9PiBgPiAke2xpbmV9YCkuam9pbignXFxuJykgKyAnXFxuXFxuJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtib2R5LCBodG1sfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFrZVJlcGx5TWl4SW4oZXYpIHtcbiAgICAgICAgaWYgKCFldikgcmV0dXJuIHt9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ20ucmVsYXRlc190byc6IHtcbiAgICAgICAgICAgICAgICAnbS5pbl9yZXBseV90byc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2V2ZW50X2lkJzogZXYuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgbWFrZVRocmVhZChwYXJlbnRFdiwgb25IZWlnaHRDaGFuZ2VkLCBwZXJtYWxpbmtDcmVhdG9yLCByZWYsIGxheW91dCkge1xuICAgICAgICBpZiAoIVJlcGx5VGhyZWFkLmdldFBhcmVudEV2ZW50SWQocGFyZW50RXYpKSB7XG4gICAgICAgICAgICByZXR1cm4gPGRpdiBjbGFzc05hbWU9XCJteF9SZXBseVRocmVhZF93cmFwcGVyX2VtcHR5XCIgLz47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDxSZXBseVRocmVhZFxuICAgICAgICAgICAgcGFyZW50RXY9e3BhcmVudEV2fVxuICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkPXtvbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICByZWY9e3JlZn1cbiAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I9e3Blcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICBsYXlvdXQ9e2xheW91dH1cbiAgICAgICAgLz47XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZSgpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWQoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgdGhpcy51bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRleHQucmVtb3ZlTGlzdGVuZXIoXCJFdmVudC5yZXBsYWNlZFwiLCB0aGlzLm9uRXZlbnRSZXBsYWNlZCk7XG4gICAgICAgIGlmICh0aGlzLnJvb20pIHtcbiAgICAgICAgICAgIHRoaXMucm9vbS5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVkYWN0aW9uXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMucm9vbS5yZW1vdmVMaXN0ZW5lcihcIlJvb20ucmVkYWN0aW9uQ2FuY2VsbGVkXCIsIHRoaXMub25Sb29tUmVkYWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZUZvckV2ZW50SWQgPSAoZXZlbnRJZCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5ldmVudHMuc29tZShldmVudCA9PiBldmVudC5nZXRJZCgpID09PSBldmVudElkKSkge1xuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uRXZlbnRSZXBsYWNlZCA9IChldikgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGV2ZW50cyB3ZSBhcmUgcmVuZGVyaW5nIGdldHMgcmVwbGFjZWQsIGZvcmNlIGEgcmUtcmVuZGVyXG4gICAgICAgIHRoaXMudXBkYXRlRm9yRXZlbnRJZChldi5nZXRJZCgpKTtcbiAgICB9O1xuXG4gICAgb25Sb29tUmVkYWN0aW9uID0gKGV2KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldi5nZXRBc3NvY2lhdGVkSWQoKTtcbiAgICAgICAgaWYgKCFldmVudElkKSByZXR1cm47XG5cbiAgICAgICAgLy8gSWYgb25lIG9mIHRoZSBldmVudHMgd2UgYXJlIHJlbmRlcmluZyBnZXRzIHJlZGFjdGVkLCBmb3JjZSBhIHJlLXJlbmRlclxuICAgICAgICB0aGlzLnVwZGF0ZUZvckV2ZW50SWQoZXZlbnRJZCk7XG4gICAgfTtcblxuICAgIGFzeW5jIGluaXRpYWxpemUoKSB7XG4gICAgICAgIGNvbnN0IHtwYXJlbnRFdn0gPSB0aGlzLnByb3BzO1xuICAgICAgICAvLyBhdCB0aW1lIG9mIG1ha2luZyB0aGlzIGNvbXBvbmVudCB3ZSBjaGVja2VkIHRoYXQgcHJvcHMucGFyZW50RXYgaGFzIGEgcGFyZW50RXZlbnRJZFxuICAgICAgICBjb25zdCBldiA9IGF3YWl0IHRoaXMuZ2V0RXZlbnQoUmVwbHlUaHJlYWQuZ2V0UGFyZW50RXZlbnRJZChwYXJlbnRFdikpO1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICBpZiAoZXYpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGV2ZW50czogW2V2XSxcbiAgICAgICAgICAgIH0sIHRoaXMubG9hZE5leHRFdmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGxvYWROZXh0RXZlbnQoKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICBjb25zdCBldiA9IHRoaXMuc3RhdGUuZXZlbnRzWzBdO1xuICAgICAgICBjb25zdCBpblJlcGx5VG9FdmVudElkID0gUmVwbHlUaHJlYWQuZ2V0UGFyZW50RXZlbnRJZChldik7XG5cbiAgICAgICAgaWYgKCFpblJlcGx5VG9FdmVudElkKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBsb2FkaW5nOiBmYWxzZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbG9hZGVkRXYgPSBhd2FpdCB0aGlzLmdldEV2ZW50KGluUmVwbHlUb0V2ZW50SWQpO1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHJldHVybjtcblxuICAgICAgICBpZiAobG9hZGVkRXYpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe2xvYWRlZEV2fSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtlcnI6IHRydWV9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFzeW5jIGdldEV2ZW50KGV2ZW50SWQpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSB0aGlzLnJvb20uZmluZEV2ZW50QnlJZChldmVudElkKTtcbiAgICAgICAgaWYgKGV2ZW50KSByZXR1cm4gZXZlbnQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGFzayB0aGUgY2xpZW50IHRvIGZldGNoIHRoZSBldmVudCB3ZSB3YW50IHVzaW5nIHRoZSBjb250ZXh0IEFQSSwgb25seSBpbnRlcmZhY2UgdG8gZG8gc28gaXMgdG8gYXNrXG4gICAgICAgICAgICAvLyBmb3IgYSB0aW1lbGluZSB3aXRoIHRoYXQgZXZlbnQsIGJ1dCBvbmNlIGl0IGlzIGxvYWRlZCB3ZSBjYW4gdXNlIGZpbmRFdmVudEJ5SWQgdG8gbG9vayB1cCB0aGUgZXYgbWFwXG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbnRleHQuZ2V0RXZlbnRUaW1lbGluZSh0aGlzLnJvb20uZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0KCksIGV2ZW50SWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBpZiBpdCBmYWlscyBjYXRjaCB0aGUgZXJyb3IgYW5kIHJldHVybiBlYXJseSwgdGhlcmUncyBubyBwb2ludCB0cnlpbmcgdG8gZmluZCB0aGUgZXZlbnQgaW4gdGhpcyBjYXNlLlxuICAgICAgICAgICAgLy8gUmV0dXJuIG51bGwgYXMgaXQgaXMgZmFsc2V5IGFuZCB0aHVzIHNob3VsZCBiZSB0cmVhdGVkIGFzIGFuIGVycm9yIChhcyB0aGUgZXZlbnQgY2Fubm90IGJlIHJlc29sdmVkKS5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnJvb20uZmluZEV2ZW50QnlJZChldmVudElkKTtcbiAgICB9XG5cbiAgICBjYW5Db2xsYXBzZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUuZXZlbnRzLmxlbmd0aCA+IDE7XG4gICAgfVxuXG4gICAgY29sbGFwc2UoKSB7XG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIH1cblxuICAgIG9uUXVvdGVDbGljaygpIHtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gW3RoaXMuc3RhdGUubG9hZGVkRXYsIC4uLnRoaXMuc3RhdGUuZXZlbnRzXTtcblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZEV2OiBudWxsLFxuICAgICAgICAgICAgZXZlbnRzLFxuICAgICAgICB9LCB0aGlzLmxvYWROZXh0RXZlbnQpO1xuXG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBoZWFkZXIgPSBudWxsO1xuXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLmVycikge1xuICAgICAgICAgICAgaGVhZGVyID0gPGJsb2NrcXVvdGUgY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWQgbXhfUmVwbHlUaHJlYWRfZXJyb3JcIj5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIF90KCdVbmFibGUgdG8gbG9hZCBldmVudCB0aGF0IHdhcyByZXBsaWVkIHRvLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdpdCBlaXRoZXIgZG9lcyBub3QgZXhpc3Qgb3IgeW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gdmlldyBpdC4nKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDwvYmxvY2txdW90ZT47XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5sb2FkZWRFdikge1xuICAgICAgICAgICAgY29uc3QgZXYgPSB0aGlzLnN0YXRlLmxvYWRlZEV2O1xuICAgICAgICAgICAgY29uc3QgUGlsbCA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLlBpbGwnKTtcbiAgICAgICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLmNvbnRleHQuZ2V0Um9vbShldi5nZXRSb29tSWQoKSk7XG4gICAgICAgICAgICBoZWFkZXIgPSA8YmxvY2txdW90ZSBjbGFzc05hbWU9XCJteF9SZXBseVRocmVhZFwiPlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX3QoJzxhPkluIHJlcGx5IHRvPC9hPiA8cGlsbD4nLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2EnOiAoc3ViKSA9PiA8YSBvbkNsaWNrPXt0aGlzLm9uUXVvdGVDbGlja30gY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWRfc2hvd1wiPnsgc3ViIH08L2E+LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3BpbGwnOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFBpbGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT17UGlsbC5UWVBFX1VTRVJfTUVOVElPTn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vbT17cm9vbX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsPXttYWtlVXNlclBlcm1hbGluayhldi5nZXRTZW5kZXIoKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFNob3dQaWxsQXZhdGFyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L2Jsb2NrcXVvdGU+O1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubG9hZGluZykge1xuICAgICAgICAgICAgY29uc3QgU3Bpbm5lciA9IHNkay5nZXRDb21wb25lbnQoXCJlbGVtZW50cy5TcGlubmVyXCIpO1xuICAgICAgICAgICAgaGVhZGVyID0gPFNwaW5uZXIgdz17MTZ9IGg9ezE2fSAvPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IEV2ZW50VGlsZSA9IHNkay5nZXRDb21wb25lbnQoJ3ZpZXdzLnJvb21zLkV2ZW50VGlsZScpO1xuICAgICAgICBjb25zdCBEYXRlU2VwYXJhdG9yID0gc2RrLmdldENvbXBvbmVudCgnbWVzc2FnZXMuRGF0ZVNlcGFyYXRvcicpO1xuICAgICAgICBjb25zdCBldlRpbGVzID0gdGhpcy5zdGF0ZS5ldmVudHMubWFwKChldikgPT4ge1xuICAgICAgICAgICAgbGV0IGRhdGVTZXAgPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAod2FudHNEYXRlU2VwYXJhdG9yKHRoaXMucHJvcHMucGFyZW50RXYuZ2V0RGF0ZSgpLCBldi5nZXREYXRlKCkpKSB7XG4gICAgICAgICAgICAgICAgZGF0ZVNlcCA9IDxhIGhyZWY9e3RoaXMucHJvcHMudXJsfT48RGF0ZVNlcGFyYXRvciB0cz17ZXYuZ2V0VHMoKX0gLz48L2E+O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gPGJsb2NrcXVvdGUgY2xhc3NOYW1lPVwibXhfUmVwbHlUaHJlYWRcIiBrZXk9e2V2LmdldElkKCl9PlxuICAgICAgICAgICAgICAgIHsgZGF0ZVNlcCB9XG4gICAgICAgICAgICAgICAgPEV2ZW50VGlsZVxuICAgICAgICAgICAgICAgICAgICBteEV2ZW50PXtldn1cbiAgICAgICAgICAgICAgICAgICAgdGlsZVNoYXBlPVwicmVwbHlcIlxuICAgICAgICAgICAgICAgICAgICBvbkhlaWdodENoYW5nZWQ9e3RoaXMucHJvcHMub25IZWlnaHRDaGFuZ2VkfVxuICAgICAgICAgICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yPXt0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3J9XG4gICAgICAgICAgICAgICAgICAgIGlzUmVkYWN0ZWQ9e2V2LmlzUmVkYWN0ZWQoKX1cbiAgICAgICAgICAgICAgICAgICAgaXNUd2VsdmVIb3VyPXtTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwic2hvd1R3ZWx2ZUhvdXJUaW1lc3RhbXBzXCIpfVxuICAgICAgICAgICAgICAgICAgICBsYXlvdXQ9e3RoaXMucHJvcHMubGF5b3V0fVxuICAgICAgICAgICAgICAgICAgICBlbmFibGVGbGFpcj17U2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShVSUZlYXR1cmUuRmxhaXIpfVxuICAgICAgICAgICAgICAgICAgICByZXBsYWNpbmdFdmVudElkPXtldi5yZXBsYWNpbmdFdmVudElkKCl9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvYmxvY2txdW90ZT47XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cIm14X1JlcGx5VGhyZWFkX3dyYXBwZXJcIj5cbiAgICAgICAgICAgIDxkaXY+eyBoZWFkZXIgfTwvZGl2PlxuICAgICAgICAgICAgPGRpdj57IGV2VGlsZXMgfTwvZGl2PlxuICAgICAgICA8L2Rpdj47XG4gICAgfVxufVxuIl19