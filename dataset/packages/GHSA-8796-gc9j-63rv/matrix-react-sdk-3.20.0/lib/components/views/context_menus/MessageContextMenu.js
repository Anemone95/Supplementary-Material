"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canCancel = canCancel;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _event = require("matrix-js-sdk/src/models/event");

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var sdk = _interopRequireWildcard(require("../../../index"));

var _languageHandler = require("../../../languageHandler");

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _Resend = _interopRequireDefault(require("../../../Resend"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _HtmlUtils = require("../../../HtmlUtils");

var _EventUtils = require("../../../utils/EventUtils");

var _ContextMenu = require("../../structures/ContextMenu");

var _event2 = require("matrix-js-sdk/src/@types/event");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function canCancel(eventStatus) {
  return eventStatus === _event.EventStatus.QUEUED || eventStatus === _event.EventStatus.NOT_SENT;
}

let MessageContextMenu = (_dec = (0, _replaceableComponent.replaceableComponent)("views.context_menus.MessageContextMenu"), _dec(_class = (_temp = _class2 = class MessageContextMenu extends _react.default.Component {
  constructor(...args) {
    super(...args);
    (0, _defineProperty2.default)(this, "state", {
      canRedact: false,
      canPin: false
    });
    (0, _defineProperty2.default)(this, "_checkPermissions", () => {
      const cli = _MatrixClientPeg.MatrixClientPeg.get();

      const room = cli.getRoom(this.props.mxEvent.getRoomId()); // We explicitly decline to show the redact option on ACL events as it has a potential
      // to obliterate the room - https://github.com/matrix-org/synapse/issues/4042

      const canRedact = room.currentState.maySendRedactionForEvent(this.props.mxEvent, cli.credentials.userId) && this.props.mxEvent.getType() !== _event2.EventType.RoomServerAcl;

      let canPin = room.currentState.mayClientSendStateEvent('m.room.pinned_events', cli); // HACK: Intentionally say we can't pin if the user doesn't want to use the functionality

      if (!_SettingsStore.default.getValue("feature_pinning")) canPin = false;
      this.setState({
        canRedact,
        canPin
      });
    });
    (0, _defineProperty2.default)(this, "onResendReactionsClick", () => {
      for (const reaction of this._getUnsentReactions()) {
        _Resend.default.resend(reaction);
      }

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onReportEventClick", () => {
      const ReportEventDialog = sdk.getComponent("dialogs.ReportEventDialog");

      _Modal.default.createTrackedDialog('Report Event', '', ReportEventDialog, {
        mxEvent: this.props.mxEvent
      }, 'mx_Dialog_reportEvent');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onViewSourceClick", () => {
      const ViewSource = sdk.getComponent('structures.ViewSource');

      _Modal.default.createTrackedDialog('View Event Source', '', ViewSource, {
        mxEvent: this.props.mxEvent
      }, 'mx_Dialog_viewsource');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onRedactClick", () => {
      const ConfirmRedactDialog = sdk.getComponent("dialogs.ConfirmRedactDialog");

      _Modal.default.createTrackedDialog('Confirm Redact Dialog', '', ConfirmRedactDialog, {
        onFinished: async (proceed, reason) => {
          if (!proceed) return;

          const cli = _MatrixClientPeg.MatrixClientPeg.get();

          try {
            if (this.props.onCloseDialog) this.props.onCloseDialog();
            await cli.redactEvent(this.props.mxEvent.getRoomId(), this.props.mxEvent.getId(), undefined, reason ? {
              reason
            } : {});
          } catch (e) {
            const code = e.errcode || e.statusCode; // only show the dialog if failing for something other than a network error
            // (e.g. no errcode or statusCode) as in that case the redactions end up in the
            // detached queue and we show the room status bar to allow retry

            if (typeof code !== "undefined") {
              const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog"); // display error message stating you couldn't delete this.

              _Modal.default.createTrackedDialog('You cannot delete this message', '', ErrorDialog, {
                title: (0, _languageHandler._t)('Error'),
                description: (0, _languageHandler._t)('You cannot delete this message. (%(code)s)', {
                  code
                })
              });
            }
          }
        }
      }, 'mx_Dialog_confirmredact');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onForwardClick", () => {
      if (this.props.onCloseDialog) this.props.onCloseDialog();

      _dispatcher.default.dispatch({
        action: 'forward_event',
        event: this.props.mxEvent
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onPinClick", () => {
      _MatrixClientPeg.MatrixClientPeg.get().getStateEvent(this.props.mxEvent.getRoomId(), 'm.room.pinned_events', '').catch(e => {
        // Intercept the Event Not Found error and fall through the promise chain with no event.
        if (e.errcode === "M_NOT_FOUND") return null;
        throw e;
      }).then(event => {
        const eventIds = (event ? event.pinned : []) || [];

        if (!eventIds.includes(this.props.mxEvent.getId())) {
          // Not pinned - add
          eventIds.push(this.props.mxEvent.getId());
        } else {
          // Pinned - remove
          eventIds.splice(eventIds.indexOf(this.props.mxEvent.getId()), 1);
        }

        const cli = _MatrixClientPeg.MatrixClientPeg.get();

        cli.sendStateEvent(this.props.mxEvent.getRoomId(), 'm.room.pinned_events', {
          pinned: eventIds
        }, '');
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "closeMenu", () => {
      if (this.props.onFinished) this.props.onFinished();
    });
    (0, _defineProperty2.default)(this, "onUnhidePreviewClick", () => {
      if (this.props.eventTileOps) {
        this.props.eventTileOps.unhideWidget();
      }

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onQuoteClick", () => {
      _dispatcher.default.dispatch({
        action: 'quote',
        event: this.props.mxEvent
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onPermalinkClick", (e
    /*: Event*/
    ) => {
      e.preventDefault();
      const ShareDialog = sdk.getComponent("dialogs.ShareDialog");

      _Modal.default.createTrackedDialog('share room message dialog', '', ShareDialog, {
        target: this.props.mxEvent,
        permalinkCreator: this.props.permalinkCreator
      });

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onCollapseReplyThreadClick", () => {
      this.props.collapseReplyThread();
      this.closeMenu();
    });
  }

  componentDidMount() {
    _MatrixClientPeg.MatrixClientPeg.get().on('RoomMember.powerLevel', this._checkPermissions);

    this._checkPermissions();
  }

  componentWillUnmount() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    if (cli) {
      cli.removeListener('RoomMember.powerLevel', this._checkPermissions);
    }
  }

  _isPinned() {
    const room = _MatrixClientPeg.MatrixClientPeg.get().getRoom(this.props.mxEvent.getRoomId());

    const pinnedEvent = room.currentState.getStateEvents('m.room.pinned_events', '');
    if (!pinnedEvent) return false;
    const content = pinnedEvent.getContent();
    return content.pinned && Array.isArray(content.pinned) && content.pinned.includes(this.props.mxEvent.getId());
  }

  _getReactions(filter) {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const room = cli.getRoom(this.props.mxEvent.getRoomId());
    const eventId = this.props.mxEvent.getId();
    return room.getPendingEvents().filter(e => {
      const relation = e.getRelation();
      return relation && relation.rel_type === "m.annotation" && relation.event_id === eventId && filter(e);
    });
  }

  _getPendingReactions() {
    return this._getReactions(e => canCancel(e.status));
  }

  _getUnsentReactions() {
    return this._getReactions(e => e.status === _event.EventStatus.NOT_SENT);
  }

  render() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const me = cli.getUserId();
    const mxEvent = this.props.mxEvent;
    const eventStatus = mxEvent.status;

    const unsentReactionsCount = this._getUnsentReactions().length;

    let resendReactionsButton;
    let redactButton;
    let forwardButton;
    let pinButton;
    let unhidePreviewButton;
    let externalURLButton;
    let quoteButton;
    let collapseReplyThread; // status is SENT before remote-echo, null after

    const isSent = !eventStatus || eventStatus === _event.EventStatus.SENT;

    if (!mxEvent.isRedacted()) {
      if (unsentReactionsCount !== 0) {
        resendReactionsButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onResendReactionsClick
        }, (0, _languageHandler._t)('Resend %(unsentCount)s reaction(s)', {
          unsentCount: unsentReactionsCount
        }));
      }
    }

    if (isSent && this.state.canRedact) {
      redactButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onRedactClick
      }, (0, _languageHandler._t)('Remove'));
    }

    if ((0, _EventUtils.isContentActionable)(mxEvent)) {
      forwardButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onForwardClick
      }, (0, _languageHandler._t)('Forward Message'));

      if (this.state.canPin) {
        pinButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onPinClick
        }, this._isPinned() ? (0, _languageHandler._t)('Unpin Message') : (0, _languageHandler._t)('Pin Message'));
      }
    }

    const viewSourceButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      className: "mx_MessageContextMenu_field",
      onClick: this.onViewSourceClick
    }, (0, _languageHandler._t)('View Source'));

    if (this.props.eventTileOps) {
      if (this.props.eventTileOps.isWidgetHidden()) {
        unhidePreviewButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onUnhidePreviewClick
        }, (0, _languageHandler._t)('Unhide Preview'));
      }
    }

    let permalink;

    if (this.props.permalinkCreator) {
      permalink = this.props.permalinkCreator.forEvent(this.props.mxEvent.getId());
    } // XXX: if we use room ID, we should also include a server where the event can be found (other than in the domain of the event ID)


    const permalinkButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
      element: "a",
      className: "mx_MessageContextMenu_field",
      onClick: this.onPermalinkClick,
      href: permalink,
      target: "_blank",
      rel: "noreferrer noopener"
    }, mxEvent.isRedacted() || mxEvent.getType() !== 'm.room.message' ? (0, _languageHandler._t)('Share Permalink') : (0, _languageHandler._t)('Share Message'));

    if (this.props.eventTileOps) {
      // this event is rendered using TextualBody
      quoteButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onQuoteClick
      }, (0, _languageHandler._t)('Quote'));
    } // Bridges can provide a 'external_url' to link back to the source.


    if (typeof mxEvent.event.content.external_url === "string" && (0, _HtmlUtils.isUrlPermitted)(mxEvent.event.content.external_url)) {
      externalURLButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        element: "a",
        className: "mx_MessageContextMenu_field",
        target: "_blank",
        rel: "noreferrer noopener",
        onClick: this.closeMenu,
        href: mxEvent.event.content.external_url
      }, (0, _languageHandler._t)('Source URL'));
    }

    if (this.props.collapseReplyThread) {
      collapseReplyThread = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onCollapseReplyThreadClick
      }, (0, _languageHandler._t)('Collapse Reply Thread'));
    }

    let reportEventButton;

    if (mxEvent.getSender() !== me) {
      reportEventButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onReportEventClick
      }, (0, _languageHandler._t)('Report Content'));
    }

    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_MessageContextMenu"
    }, resendReactionsButton, redactButton, forwardButton, pinButton, viewSourceButton, unhidePreviewButton, permalinkButton, quoteButton, externalURLButton, collapseReplyThread, reportEventButton);
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  /* the MatrixEvent associated with the context menu */
  mxEvent: _propTypes.default.object.isRequired,

  /* an optional EventTileOps implementation that can be used to unhide preview widgets */
  eventTileOps: _propTypes.default.object,

  /* an optional function to be called when the user clicks collapse thread, if not provided hide button */
  collapseReplyThread: _propTypes.default.func,

  /* callback called when the menu is dismissed */
  onFinished: _propTypes.default.func,

  /* if the menu is inside a dialog, we sometimes need to close that dialog after click (forwarding) */
  onCloseDialog: _propTypes.default.func
}), _temp)) || _class);
exports.default = MessageContextMenu;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvTWVzc2FnZUNvbnRleHRNZW51LmpzIl0sIm5hbWVzIjpbImNhbkNhbmNlbCIsImV2ZW50U3RhdHVzIiwiRXZlbnRTdGF0dXMiLCJRVUVVRUQiLCJOT1RfU0VOVCIsIk1lc3NhZ2VDb250ZXh0TWVudSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY2FuUmVkYWN0IiwiY2FuUGluIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwicm9vbSIsImdldFJvb20iLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRSb29tSWQiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tU2VydmVyQWNsIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzZXRTdGF0ZSIsInJlYWN0aW9uIiwiX2dldFVuc2VudFJlYWN0aW9ucyIsIlJlc2VuZCIsInJlc2VuZCIsImNsb3NlTWVudSIsIlJlcG9ydEV2ZW50RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiVmlld1NvdXJjZSIsIkNvbmZpcm1SZWRhY3REaWFsb2ciLCJvbkZpbmlzaGVkIiwicHJvY2VlZCIsInJlYXNvbiIsIm9uQ2xvc2VEaWFsb2ciLCJyZWRhY3RFdmVudCIsImdldElkIiwidW5kZWZpbmVkIiwiZSIsImNvZGUiLCJlcnJjb2RlIiwic3RhdHVzQ29kZSIsIkVycm9yRGlhbG9nIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwiZXZlbnQiLCJnZXRTdGF0ZUV2ZW50IiwiY2F0Y2giLCJ0aGVuIiwiZXZlbnRJZHMiLCJwaW5uZWQiLCJpbmNsdWRlcyIsInB1c2giLCJzcGxpY2UiLCJpbmRleE9mIiwic2VuZFN0YXRlRXZlbnQiLCJldmVudFRpbGVPcHMiLCJ1bmhpZGVXaWRnZXQiLCJwcmV2ZW50RGVmYXVsdCIsIlNoYXJlRGlhbG9nIiwidGFyZ2V0IiwicGVybWFsaW5rQ3JlYXRvciIsImNvbGxhcHNlUmVwbHlUaHJlYWQiLCJjb21wb25lbnREaWRNb3VudCIsIm9uIiwiX2NoZWNrUGVybWlzc2lvbnMiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInJlbW92ZUxpc3RlbmVyIiwiX2lzUGlubmVkIiwicGlubmVkRXZlbnQiLCJnZXRTdGF0ZUV2ZW50cyIsImNvbnRlbnQiLCJnZXRDb250ZW50IiwiQXJyYXkiLCJpc0FycmF5IiwiX2dldFJlYWN0aW9ucyIsImZpbHRlciIsImV2ZW50SWQiLCJnZXRQZW5kaW5nRXZlbnRzIiwicmVsYXRpb24iLCJnZXRSZWxhdGlvbiIsInJlbF90eXBlIiwiZXZlbnRfaWQiLCJfZ2V0UGVuZGluZ1JlYWN0aW9ucyIsInN0YXR1cyIsInJlbmRlciIsIm1lIiwiZ2V0VXNlcklkIiwidW5zZW50UmVhY3Rpb25zQ291bnQiLCJsZW5ndGgiLCJyZXNlbmRSZWFjdGlvbnNCdXR0b24iLCJyZWRhY3RCdXR0b24iLCJmb3J3YXJkQnV0dG9uIiwicGluQnV0dG9uIiwidW5oaWRlUHJldmlld0J1dHRvbiIsImV4dGVybmFsVVJMQnV0dG9uIiwicXVvdGVCdXR0b24iLCJpc1NlbnQiLCJTRU5UIiwiaXNSZWRhY3RlZCIsIm9uUmVzZW5kUmVhY3Rpb25zQ2xpY2siLCJ1bnNlbnRDb3VudCIsInN0YXRlIiwib25SZWRhY3RDbGljayIsIm9uRm9yd2FyZENsaWNrIiwib25QaW5DbGljayIsInZpZXdTb3VyY2VCdXR0b24iLCJvblZpZXdTb3VyY2VDbGljayIsImlzV2lkZ2V0SGlkZGVuIiwib25VbmhpZGVQcmV2aWV3Q2xpY2siLCJwZXJtYWxpbmsiLCJmb3JFdmVudCIsInBlcm1hbGlua0J1dHRvbiIsIm9uUGVybWFsaW5rQ2xpY2siLCJvblF1b3RlQ2xpY2siLCJleHRlcm5hbF91cmwiLCJvbkNvbGxhcHNlUmVwbHlUaHJlYWRDbGljayIsInJlcG9ydEV2ZW50QnV0dG9uIiwiZ2V0U2VuZGVyIiwib25SZXBvcnRFdmVudENsaWNrIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImZ1bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRU8sU0FBU0EsU0FBVCxDQUFtQkMsV0FBbkIsRUFBZ0M7QUFDbkMsU0FBT0EsV0FBVyxLQUFLQyxtQkFBWUMsTUFBNUIsSUFBc0NGLFdBQVcsS0FBS0MsbUJBQVlFLFFBQXpFO0FBQ0g7O0lBR29CQyxrQixXQURwQixnREFBcUIsd0NBQXJCLEMsbUNBQUQsTUFDcUJBLGtCQURyQixTQUNnREMsZUFBTUMsU0FEdEQsQ0FDZ0U7QUFBQTtBQUFBO0FBQUEsaURBa0JwRDtBQUNKQyxNQUFBQSxTQUFTLEVBQUUsS0FEUDtBQUVKQyxNQUFBQSxNQUFNLEVBQUU7QUFGSixLQWxCb0Q7QUFBQSw2REFtQ3hDLE1BQU07QUFDdEIsWUFBTUMsR0FBRyxHQUFHQyxpQ0FBZ0JDLEdBQWhCLEVBQVo7O0FBQ0EsWUFBTUMsSUFBSSxHQUFHSCxHQUFHLENBQUNJLE9BQUosQ0FBWSxLQUFLQyxLQUFMLENBQVdDLE9BQVgsQ0FBbUJDLFNBQW5CLEVBQVosQ0FBYixDQUZzQixDQUl0QjtBQUNBOztBQUNBLFlBQU1ULFNBQVMsR0FBR0ssSUFBSSxDQUFDSyxZQUFMLENBQWtCQyx3QkFBbEIsQ0FBMkMsS0FBS0osS0FBTCxDQUFXQyxPQUF0RCxFQUErRE4sR0FBRyxDQUFDVSxXQUFKLENBQWdCQyxNQUEvRSxLQUNYLEtBQUtOLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQk0sT0FBbkIsT0FBaUNDLGtCQUFVQyxhQURsRDs7QUFFQSxVQUFJZixNQUFNLEdBQUdJLElBQUks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QUFKOztBQUNBLFFBQUlsSCxPQUFPLENBQUNtSCxTQUFSLE9BQXdCaEMsRUFBNUIsRUFBZ0M7QUFDNUIrQixNQUFBQSxpQkFBaUIsZ0JBQ2IsNkJBQUMscUJBQUQ7QUFBVSxRQUFBLFNBQVMsRUFBQyw2QkFBcEI7QUFBa0QsUUFBQSxPQUFPLEVBQUUsS0FBS0U7QUFBaEUsU0FDTSx5QkFBRyxnQkFBSCxDQUROLENBREo7QUFLSDs7QUFFRCx3QkFDSTtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsT0FDTTdCLHFCQUROLEVBRU1DLFlBRk4sRUFHTUMsYUFITixFQUlNQyxTQUpOLEVBS01hLGdCQUxOLEVBTU1aLG1CQU5OLEVBT01rQixlQVBOLEVBUU1oQixXQVJOLEVBU01ELGlCQVROLEVBVU1qQyxtQkFWTixFQVdNdUQsaUJBWE4sQ0FESjtBQWVIOztBQTVWMkQsQyxzREFDekM7QUFDZjtBQUNBbEgsRUFBQUEsT0FBTyxFQUFFcUgsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRlg7O0FBSWY7QUFDQWxFLEVBQUFBLFlBQVksRUFBRWdFLG1CQUFVQyxNQUxUOztBQU9mO0FBQ0EzRCxFQUFBQSxtQkFBbUIsRUFBRTBELG1CQUFVRyxJQVJoQjs7QUFVZjtBQUNBL0YsRUFBQUEsVUFBVSxFQUFFNEYsbUJBQVVHLElBWFA7O0FBYWY7QUFDQTVGLEVBQUFBLGFBQWEsRUFBRXlGLG1CQUFVRztBQWRWLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxNSwgMjAxNiwgMjAxOCwgMjAxOSwgMjAyMSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtFdmVudFN0YXR1c30gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcblxuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gJy4uLy4uLy4uL01hdHJpeENsaWVudFBlZyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBSZXNlbmQgZnJvbSAnLi4vLi4vLi4vUmVzZW5kJztcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gJy4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmUnO1xuaW1wb3J0IHsgaXNVcmxQZXJtaXR0ZWQgfSBmcm9tICcuLi8uLi8uLi9IdG1sVXRpbHMnO1xuaW1wb3J0IHsgaXNDb250ZW50QWN0aW9uYWJsZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0V2ZW50VXRpbHMnO1xuaW1wb3J0IHtNZW51SXRlbX0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7RXZlbnRUeXBlfSBmcm9tIFwibWF0cml4LWpzLXNkay9zcmMvQHR5cGVzL2V2ZW50XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNhbkNhbmNlbChldmVudFN0YXR1cykge1xuICAgIHJldHVybiBldmVudFN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuUVVFVUVEIHx8IGV2ZW50U3RhdHVzID09PSBFdmVudFN0YXR1cy5OT1RfU0VOVDtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuY29udGV4dF9tZW51cy5NZXNzYWdlQ29udGV4dE1lbnVcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2VDb250ZXh0TWVudSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogdGhlIE1hdHJpeEV2ZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgY29udGV4dCBtZW51ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKiBhbiBvcHRpb25hbCBFdmVudFRpbGVPcHMgaW1wbGVtZW50YXRpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB1bmhpZGUgcHJldmlldyB3aWRnZXRzICovXG4gICAgICAgIGV2ZW50VGlsZU9wczogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvKiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjbGlja3MgY29sbGFwc2UgdGhyZWFkLCBpZiBub3QgcHJvdmlkZWQgaGlkZSBidXR0b24gKi9cbiAgICAgICAgY29sbGFwc2VSZXBseVRocmVhZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogY2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIG1lbnUgaXMgZGlzbWlzc2VkICovXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8qIGlmIHRoZSBtZW51IGlzIGluc2lkZSBhIGRpYWxvZywgd2Ugc29tZXRpbWVzIG5lZWQgdG8gY2xvc2UgdGhhdCBkaWFsb2cgYWZ0ZXIgY2xpY2sgKGZvcndhcmRpbmcpICovXG4gICAgICAgIG9uQ2xvc2VEaWFsb2c6IFByb3BUeXBlcy5mdW5jLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgY2FuUmVkYWN0OiBmYWxzZSxcbiAgICAgICAgY2FuUGluOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignUm9vbU1lbWJlci5wb3dlckxldmVsJywgdGhpcy5fY2hlY2tQZXJtaXNzaW9ucyk7XG4gICAgICAgIHRoaXMuX2NoZWNrUGVybWlzc2lvbnMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpKSB7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoJ1Jvb21NZW1iZXIucG93ZXJMZXZlbCcsIHRoaXMuX2NoZWNrUGVybWlzc2lvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NoZWNrUGVybWlzc2lvbnMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG5cbiAgICAgICAgLy8gV2UgZXhwbGljaXRseSBkZWNsaW5lIHRvIHNob3cgdGhlIHJlZGFjdCBvcHRpb24gb24gQUNMIGV2ZW50cyBhcyBpdCBoYXMgYSBwb3RlbnRpYWxcbiAgICAgICAgLy8gdG8gb2JsaXRlcmF0ZSB0aGUgcm9vbSAtIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzQwNDJcbiAgICAgICAgY29uc3QgY2FuUmVkYWN0ID0gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFJlZGFjdGlvbkZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudCwgY2xpLmNyZWRlbnRpYWxzLnVzZXJJZClcbiAgICAgICAgICAgICYmIHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tU2VydmVyQWNsO1xuICAgICAgICBsZXQgY2FuUGluID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoJ20ucm9vbS5waW5uZWRfZXZlbnRzJywgY2xpKTtcblxuICAgICAgICAvLyBIQUNLOiBJbnRlbnRpb25hbGx5IHNheSB3ZSBjYW4ndCBwaW4gaWYgdGhlIHVzZXIgZG9lc24ndCB3YW50IHRvIHVzZSB0aGUgZnVuY3Rpb25hbGl0eVxuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3Bpbm5pbmdcIikpIGNhblBpbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NhblJlZGFjdCwgY2FuUGlufSk7XG4gICAgfTtcblxuICAgIF9pc1Bpbm5lZCgpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IHBpbm5lZEV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5waW5uZWRfZXZlbnRzJywgJycpO1xuICAgICAgICBpZiAoIXBpbm5lZEV2ZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwaW5uZWRFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIHJldHVybiBjb250ZW50LnBpbm5lZCAmJiBBcnJheS5pc0FycmF5KGNvbnRlbnQucGlubmVkKSAmJiBjb250ZW50LnBpbm5lZC5pbmNsdWRlcyh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgfVxuXG4gICAgb25SZXNlbmRSZWFjdGlvbnNDbGljayA9ICgpID0+IHtcbiAgICAgICAgZm9yIChjb25zdCByZWFjdGlvbiBvZiB0aGlzLl9nZXRVbnNlbnRSZWFjdGlvbnMoKSkge1xuICAgICAgICAgICAgUmVzZW5kLnJlc2VuZChyZWFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgb25SZXBvcnRFdmVudENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBSZXBvcnRFdmVudERpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlJlcG9ydEV2ZW50RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdSZXBvcnQgRXZlbnQnLCAnJywgUmVwb3J0RXZlbnREaWFsb2csIHtcbiAgICAgICAgICAgIG14RXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgfSwgJ214X0RpYWxvZ19yZXBvcnRFdmVudCcpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvblZpZXdTb3VyY2VDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgVmlld1NvdXJjZSA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuVmlld1NvdXJjZScpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdWaWV3IEV2ZW50IFNvdXJjZScsICcnLCBWaWV3U291cmNlLCB7XG4gICAgICAgICAgICBteEV2ZW50OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgIH0sICdteF9EaWFsb2dfdmlld3NvdXJjZScpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvblJlZGFjdENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBDb25maXJtUmVkYWN0RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuQ29uZmlybVJlZGFjdERpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnQ29uZmlybSBSZWRhY3QgRGlhbG9nJywgJycsIENvbmZpcm1SZWRhY3REaWFsb2csIHtcbiAgICAgICAgICAgIG9uRmluaXNoZWQ6IGFzeW5jIChwcm9jZWVkLCByZWFzb24pID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXByb2NlZWQpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNsb3NlRGlhbG9nKSB0aGlzLnByb3BzLm9uQ2xvc2VEaWFsb2coKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgY2xpLnJlZGFjdEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICByZWFzb24gPyB7IHJlYXNvbiB9IDoge30sXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2RlID0gZS5lcnJjb2RlIHx8IGUuc3RhdHVzQ29kZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gb25seSBzaG93IHRoZSBkaWFsb2cgaWYgZmFpbGluZyBmb3Igc29tZXRoaW5nIG90aGVyIHRoYW4gYSBuZXR3b3JrIGVycm9yXG4gICAgICAgICAgICAgICAgICAgIC8vIChlLmcuIG5vIGVycmNvZGUgb3Igc3RhdHVzQ29kZSkgYXMgaW4gdGhhdCBjYXNlIHRoZSByZWRhY3Rpb25zIGVuZCB1cCBpbiB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gZGV0YWNoZWQgcXVldWUgYW5kIHdlIHNob3cgdGhlIHJvb20gc3RhdHVzIGJhciB0byBhbGxvdyByZXRyeVxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvZGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkaXNwbGF5IGVycm9yIG1lc3NhZ2Ugc3RhdGluZyB5b3UgY291bGRuJ3QgZGVsZXRlIHRoaXMuXG4gICAgICAgICAgICAgICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdZb3UgY2Fubm90IGRlbGV0ZSB0aGlzIG1lc3NhZ2UnLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoJ0Vycm9yJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IF90KCdZb3UgY2Fubm90IGRlbGV0ZSB0aGlzIG1lc3NhZ2UuICglKGNvZGUpcyknLCB7Y29kZX0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9LCAnbXhfRGlhbG9nX2NvbmZpcm1yZWRhY3QnKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgb25Gb3J3YXJkQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2xvc2VEaWFsb2cpIHRoaXMucHJvcHMub25DbG9zZURpYWxvZygpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnZm9yd2FyZF9ldmVudCcsXG4gICAgICAgICAgICBldmVudDogdGhpcy5wcm9wcy5teEV2ZW50LFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgb25QaW5DbGljayA9ICgpID0+IHtcbiAgICAgICAgTWF0cml4Q2xpZW50UGVnLmdldCgpLmdldFN0YXRlRXZlbnQodGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpLCAnbS5yb29tLnBpbm5lZF9ldmVudHMnLCAnJylcbiAgICAgICAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEludGVyY2VwdCB0aGUgRXZlbnQgTm90IEZvdW5kIGVycm9yIGFuZCBmYWxsIHRocm91Z2ggdGhlIHByb21pc2UgY2hhaW4gd2l0aCBubyBldmVudC5cbiAgICAgICAgICAgICAgICBpZiAoZS5lcnJjb2RlID09PSBcIk1fTk9UX0ZPVU5EXCIpIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRJZHMgPSAoZXZlbnQgPyBldmVudC5waW5uZWQgOiBbXSkgfHwgW107XG4gICAgICAgICAgICAgICAgaWYgKCFldmVudElkcy5pbmNsdWRlcyh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IHBpbm5lZCAtIGFkZFxuICAgICAgICAgICAgICAgICAgICBldmVudElkcy5wdXNoKHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBQaW5uZWQgLSByZW1vdmVcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRJZHMuc3BsaWNlKGV2ZW50SWRzLmluZGV4T2YodGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBjbGkgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCk7XG4gICAgICAgICAgICAgICAgY2xpLnNlbmRTdGF0ZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSwgJ20ucm9vbS5waW5uZWRfZXZlbnRzJywge3Bpbm5lZDogZXZlbnRJZHN9LCAnJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgY2xvc2VNZW51ID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkZpbmlzaGVkKSB0aGlzLnByb3BzLm9uRmluaXNoZWQoKTtcbiAgICB9O1xuXG4gICAgb25VbmhpZGVQcmV2aWV3Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50VGlsZU9wcykge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5ldmVudFRpbGVPcHMudW5oaWRlV2lkZ2V0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgb25RdW90ZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAncXVvdGUnLFxuICAgICAgICAgICAgZXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUGVybWFsaW5rQ2xpY2sgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBTaGFyZURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLlNoYXJlRGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdzaGFyZSByb29tIG1lc3NhZ2UgZGlhbG9nJywgJycsIFNoYXJlRGlhbG9nLCB7XG4gICAgICAgICAgICB0YXJnZXQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcixcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uQ29sbGFwc2VSZXBseVRocmVhZENsaWNrID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnByb3BzLmNvbGxhcHNlUmVwbHlUaHJlYWQoKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgX2dldFJlYWN0aW9ucyhmaWx0ZXIpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCByb29tID0gY2xpLmdldFJvb20odGhpcy5wcm9wcy5teEV2ZW50LmdldFJvb21JZCgpKTtcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpO1xuICAgICAgICByZXR1cm4gcm9vbS5nZXRQZW5kaW5nRXZlbnRzKCkuZmlsdGVyKGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpb24gPSBlLmdldFJlbGF0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm4gcmVsYXRpb24gJiZcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5yZWxfdHlwZSA9PT0gXCJtLmFubm90YXRpb25cIiAmJlxuICAgICAgICAgICAgICAgIHJlbGF0aW9uLmV2ZW50X2lkID09PSBldmVudElkICYmXG4gICAgICAgICAgICAgICAgZmlsdGVyKGUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfZ2V0UGVuZGluZ1JlYWN0aW9ucygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dldFJlYWN0aW9ucyhlID0+IGNhbkNhbmNlbChlLnN0YXR1cykpO1xuICAgIH1cblxuICAgIF9nZXRVbnNlbnRSZWFjdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRSZWFjdGlvbnMoZSA9PiBlLnN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBjb25zdCBtZSA9IGNsaS5nZXRVc2VySWQoKTtcbiAgICAgICAgY29uc3QgbXhFdmVudCA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgZXZlbnRTdGF0dXMgPSBteEV2ZW50LnN0YXR1cztcbiAgICAgICAgY29uc3QgdW5zZW50UmVhY3Rpb25zQ291bnQgPSB0aGlzLl9nZXRVbnNlbnRSZWFjdGlvbnMoKS5sZW5ndGg7XG4gICAgICAgIGxldCByZXNlbmRSZWFjdGlvbnNCdXR0b247XG4gICAgICAgIGxldCByZWRhY3RCdXR0b247XG4gICAgICAgIGxldCBmb3J3YXJkQnV0dG9uO1xuICAgICAgICBsZXQgcGluQnV0dG9uO1xuICAgICAgICBsZXQgdW5oaWRlUHJldmlld0J1dHRvbjtcbiAgICAgICAgbGV0IGV4dGVybmFsVVJMQnV0dG9uO1xuICAgICAgICBsZXQgcXVvdGVCdXR0b247XG4gICAgICAgIGxldCBjb2xsYXBzZVJlcGx5VGhyZWFkO1xuXG4gICAgICAgIC8vIHN0YXR1cyBpcyBTRU5UIGJlZm9yZSByZW1vdGUtZWNobywgbnVsbCBhZnRlclxuICAgICAgICBjb25zdCBpc1NlbnQgPSAhZXZlbnRTdGF0dXMgfHwgZXZlbnRTdGF0dXMgPT09IEV2ZW50U3RhdHVzLlNFTlQ7XG4gICAgICAgIGlmICghbXhFdmVudC5pc1JlZGFjdGVkKCkpIHtcbiAgICAgICAgICAgIGlmICh1bnNlbnRSZWFjdGlvbnNDb3VudCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc2VuZFJlYWN0aW9uc0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25SZXNlbmRSZWFjdGlvbnNDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdSZXNlbmQgJSh1bnNlbnRDb3VudClzIHJlYWN0aW9uKHMpJywge3Vuc2VudENvdW50OiB1bnNlbnRSZWFjdGlvbnNDb3VudH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU2VudCAmJiB0aGlzLnN0YXRlLmNhblJlZGFjdCkge1xuICAgICAgICAgICAgcmVkYWN0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uUmVkYWN0Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdSZW1vdmUnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNDb250ZW50QWN0aW9uYWJsZShteEV2ZW50KSkge1xuICAgICAgICAgICAgZm9yd2FyZEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vbkZvcndhcmRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ0ZvcndhcmQgTWVzc2FnZScpIH1cbiAgICAgICAgICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuY2FuUGluKSB7XG4gICAgICAgICAgICAgICAgcGluQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblBpbkNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5faXNQaW5uZWQoKSA/IF90KCdVbnBpbiBNZXNzYWdlJykgOiBfdCgnUGluIE1lc3NhZ2UnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHZpZXdTb3VyY2VCdXR0b24gPSAoXG4gICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblZpZXdTb3VyY2VDbGlja30+XG4gICAgICAgICAgICAgICAgeyBfdCgnVmlldyBTb3VyY2UnKSB9XG4gICAgICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50VGlsZU9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMuZXZlbnRUaWxlT3BzLmlzV2lkZ2V0SGlkZGVuKCkpIHtcbiAgICAgICAgICAgICAgICB1bmhpZGVQcmV2aWV3QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblVuaGlkZVByZXZpZXdDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdVbmhpZGUgUHJldmlldycpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBlcm1hbGluaztcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvcikge1xuICAgICAgICAgICAgcGVybWFsaW5rID0gdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLmZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBYWFg6IGlmIHdlIHVzZSByb29tIElELCB3ZSBzaG91bGQgYWxzbyBpbmNsdWRlIGEgc2VydmVyIHdoZXJlIHRoZSBldmVudCBjYW4gYmUgZm91bmQgKG90aGVyIHRoYW4gaW4gdGhlIGRvbWFpbiBvZiB0aGUgZXZlbnQgSUQpXG4gICAgICAgIGNvbnN0IHBlcm1hbGlua0J1dHRvbiA9IChcbiAgICAgICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9XCJhXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25QZXJtYWxpbmtDbGlja31cbiAgICAgICAgICAgICAgICBocmVmPXtwZXJtYWxpbmt9XG4gICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IG14RXZlbnQuaXNSZWRhY3RlZCgpIHx8IG14RXZlbnQuZ2V0VHlwZSgpICE9PSAnbS5yb29tLm1lc3NhZ2UnXG4gICAgICAgICAgICAgICAgICAgID8gX3QoJ1NoYXJlIFBlcm1hbGluaycpIDogX3QoJ1NoYXJlIE1lc3NhZ2UnKSB9XG4gICAgICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50VGlsZU9wcykgeyAvLyB0aGlzIGV2ZW50IGlzIHJlbmRlcmVkIHVzaW5nIFRleHR1YWxCb2R5XG4gICAgICAgICAgICBxdW90ZUJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblF1b3RlQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdRdW90ZScpIH1cbiAgICAgICAgICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJyaWRnZXMgY2FuIHByb3ZpZGUgYSAnZXh0ZXJuYWxfdXJsJyB0byBsaW5rIGJhY2sgdG8gdGhlIHNvdXJjZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICAgdHlwZW9mKG14RXZlbnQuZXZlbnQuY29udGVudC5leHRlcm5hbF91cmwpID09PSBcInN0cmluZ1wiICYmXG4gICAgICAgICAgICBpc1VybFBlcm1pdHRlZChteEV2ZW50LmV2ZW50LmNvbnRlbnQuZXh0ZXJuYWxfdXJsKVxuICAgICAgICApIHtcbiAgICAgICAgICAgIGV4dGVybmFsVVJMQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwiYVwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vcmVmZXJyZXIgbm9vcGVuZXJcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmNsb3NlTWVudX1cbiAgICAgICAgICAgICAgICAgICAgaHJlZj17bXhFdmVudC5ldmVudC5jb250ZW50LmV4dGVybmFsX3VybH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1NvdXJjZSBVUkwnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5jb2xsYXBzZVJlcGx5VGhyZWFkKSB7XG4gICAgICAgICAgICBjb2xsYXBzZVJlcGx5VGhyZWFkID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uQ29sbGFwc2VSZXBseVRocmVhZENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnQ29sbGFwc2UgUmVwbHkgVGhyZWFkJykgfVxuICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHJlcG9ydEV2ZW50QnV0dG9uO1xuICAgICAgICBpZiAobXhFdmVudC5nZXRTZW5kZXIoKSAhPT0gbWUpIHtcbiAgICAgICAgICAgIHJlcG9ydEV2ZW50QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uUmVwb3J0RXZlbnRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1JlcG9ydCBDb250ZW50JykgfVxuICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51XCI+XG4gICAgICAgICAgICAgICAgeyByZXNlbmRSZWFjdGlvbnNCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcmVkYWN0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGZvcndhcmRCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcGluQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHZpZXdTb3VyY2VCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgdW5oaWRlUHJldmlld0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBwZXJtYWxpbmtCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcXVvdGVCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgZXh0ZXJuYWxVUkxCdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgY29sbGFwc2VSZXBseVRocmVhZCB9XG4gICAgICAgICAgICAgICAgeyByZXBvcnRFdmVudEJ1dHRvbiB9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=