"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _matrixJsSdk = require("matrix-js-sdk");

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

var _event = require("matrix-js-sdk/src/@types/event");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
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
function canCancel(eventStatus) {
  return eventStatus === _matrixJsSdk.EventStatus.QUEUED || eventStatus === _matrixJsSdk.EventStatus.NOT_SENT;
}

class MessageContextMenu extends _react.default.Component {
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

      const canRedact = room.currentState.maySendRedactionForEvent(this.props.mxEvent, cli.credentials.userId) && this.props.mxEvent.getType() !== _event.EventType.RoomServerAcl;

      let canPin = room.currentState.mayClientSendStateEvent('m.room.pinned_events', cli); // HACK: Intentionally say we can't pin if the user doesn't want to use the functionality

      if (!_SettingsStore.default.getValue("feature_pinning")) canPin = false;
      this.setState({
        canRedact,
        canPin
      });
    });
    (0, _defineProperty2.default)(this, "onResendClick", () => {
      _Resend.default.resend(this.props.mxEvent);

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onResendEditClick", () => {
      _Resend.default.resend(this.props.mxEvent.replacingEvent());

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onResendRedactionClick", () => {
      _Resend.default.resend(this.props.mxEvent.localRedactionEvent());

      this.closeMenu();
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
      const ev = this.props.mxEvent.replacingEvent() || this.props.mxEvent;
      const ViewSource = sdk.getComponent('structures.ViewSource');

      _Modal.default.createTrackedDialog('View Event Source', '', ViewSource, {
        roomId: ev.getRoomId(),
        eventId: ev.getId(),
        content: ev.event
      }, 'mx_Dialog_viewsource');

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onViewClearSourceClick", () => {
      const ev = this.props.mxEvent.replacingEvent() || this.props.mxEvent;
      const ViewSource = sdk.getComponent('structures.ViewSource');

      _Modal.default.createTrackedDialog('View Clear Event Source', '', ViewSource, {
        roomId: ev.getRoomId(),
        eventId: ev.getId(),
        // FIXME: _clearEvent is private
        content: ev._clearEvent
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
    (0, _defineProperty2.default)(this, "onCancelSendClick", () => {
      const mxEvent = this.props.mxEvent;
      const editEvent = mxEvent.replacingEvent();
      const redactEvent = mxEvent.localRedactionEvent();

      const pendingReactions = this._getPendingReactions();

      if (editEvent && canCancel(editEvent.status)) {
        _Resend.default.removeFromQueue(editEvent);
      }

      if (redactEvent && canCancel(redactEvent.status)) {
        _Resend.default.removeFromQueue(redactEvent);
      }

      if (pendingReactions.length) {
        for (const reaction of pendingReactions) {
          _Resend.default.removeFromQueue(reaction);
        }
      }

      if (canCancel(mxEvent.status)) {
        _Resend.default.removeFromQueue(this.props.mxEvent);
      }

      this.closeMenu();
    });
    (0, _defineProperty2.default)(this, "onForwardClick", () => {
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
    return this._getReactions(e => e.status === _matrixJsSdk.EventStatus.NOT_SENT);
  }

  render() {
    const cli = _MatrixClientPeg.MatrixClientPeg.get();

    const me = cli.getUserId();
    const mxEvent = this.props.mxEvent;
    const eventStatus = mxEvent.status;
    const editStatus = mxEvent.replacingEvent() && mxEvent.replacingEvent().status;
    const redactStatus = mxEvent.localRedactionEvent() && mxEvent.localRedactionEvent().status;

    const unsentReactionsCount = this._getUnsentReactions().length;

    const pendingReactionsCount = this._getPendingReactions().length;

    const allowCancel = canCancel(mxEvent.status) || canCancel(editStatus) || canCancel(redactStatus) || pendingReactionsCount !== 0;
    let resendButton;
    let resendEditButton;
    let resendReactionsButton;
    let resendRedactionButton;
    let redactButton;
    let cancelButton;
    let forwardButton;
    let pinButton;
    let viewClearSourceButton;
    let unhidePreviewButton;
    let externalURLButton;
    let quoteButton;
    let collapseReplyThread; // status is SENT before remote-echo, null after

    const isSent = !eventStatus || eventStatus === _matrixJsSdk.EventStatus.SENT;

    if (!mxEvent.isRedacted()) {
      if (eventStatus === _matrixJsSdk.EventStatus.NOT_SENT) {
        resendButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onResendClick
        }, (0, _languageHandler._t)('Resend'));
      }

      if (editStatus === _matrixJsSdk.EventStatus.NOT_SENT) {
        resendEditButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onResendEditClick
        }, (0, _languageHandler._t)('Resend edit'));
      }

      if (unsentReactionsCount !== 0) {
        resendReactionsButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
          className: "mx_MessageContextMenu_field",
          onClick: this.onResendReactionsClick
        }, (0, _languageHandler._t)('Resend %(unsentCount)s reaction(s)', {
          unsentCount: unsentReactionsCount
        }));
      }
    }

    if (redactStatus === _matrixJsSdk.EventStatus.NOT_SENT) {
      resendRedactionButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onResendRedactionClick
      }, (0, _languageHandler._t)('Resend removal'));
    }

    if (isSent && this.state.canRedact) {
      redactButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onRedactClick
      }, (0, _languageHandler._t)('Remove'));
    }

    if (allowCancel) {
      cancelButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onCancelSendClick
      }, (0, _languageHandler._t)('Cancel Sending'));
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

    if (mxEvent.getType() !== mxEvent.getWireType()) {
      viewClearSourceButton = /*#__PURE__*/_react.default.createElement(_ContextMenu.MenuItem, {
        className: "mx_MessageContextMenu_field",
        onClick: this.onViewClearSourceClick
      }, (0, _languageHandler._t)('View Decrypted Source'));
    }

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
    }, resendButton, resendEditButton, resendReactionsButton, resendRedactionButton, redactButton, cancelButton, forwardButton, pinButton, viewSourceButton, viewClearSourceButton, unhidePreviewButton, permalinkButton, quoteButton, externalURLButton, collapseReplyThread, reportEventButton);
  }

}

exports.default = MessageContextMenu;
(0, _defineProperty2.default)(MessageContextMenu, "propTypes", {
  /* the MatrixEvent associated with the context menu */
  mxEvent: _propTypes.default.object.isRequired,

  /* an optional EventTileOps implementation that can be used to unhide preview widgets */
  eventTileOps: _propTypes.default.object,

  /* an optional function to be called when the user clicks collapse thread, if not provided hide button */
  collapseReplyThread: _propTypes.default.func,

  /* callback called when the menu is dismissed */
  onFinished: _propTypes.default.func
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2NvbnRleHRfbWVudXMvTWVzc2FnZUNvbnRleHRNZW51LmpzIl0sIm5hbWVzIjpbImNhbkNhbmNlbCIsImV2ZW50U3RhdHVzIiwiRXZlbnRTdGF0dXMiLCJRVUVVRUQiLCJOT1RfU0VOVCIsIk1lc3NhZ2VDb250ZXh0TWVudSIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY2FuUmVkYWN0IiwiY2FuUGluIiwiY2xpIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0Iiwicm9vbSIsImdldFJvb20iLCJwcm9wcyIsIm14RXZlbnQiLCJnZXRSb29tSWQiLCJjdXJyZW50U3RhdGUiLCJtYXlTZW5kUmVkYWN0aW9uRm9yRXZlbnQiLCJjcmVkZW50aWFscyIsInVzZXJJZCIsImdldFR5cGUiLCJFdmVudFR5cGUiLCJSb29tU2VydmVyQWNsIiwibWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJzZXRTdGF0ZSIsIlJlc2VuZCIsInJlc2VuZCIsImNsb3NlTWVudSIsInJlcGxhY2luZ0V2ZW50IiwibG9jYWxSZWRhY3Rpb25FdmVudCIsInJlYWN0aW9uIiwiX2dldFVuc2VudFJlYWN0aW9ucyIsIlJlcG9ydEV2ZW50RGlhbG9nIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiZXYiLCJWaWV3U291cmNlIiwicm9vbUlkIiwiZXZlbnRJZCIsImdldElkIiwiY29udGVudCIsImV2ZW50IiwiX2NsZWFyRXZlbnQiLCJDb25maXJtUmVkYWN0RGlhbG9nIiwib25GaW5pc2hlZCIsInByb2NlZWQiLCJyZWFzb24iLCJyZWRhY3RFdmVudCIsInVuZGVmaW5lZCIsImUiLCJjb2RlIiwiZXJyY29kZSIsInN0YXR1c0NvZGUiLCJFcnJvckRpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJlZGl0RXZlbnQiLCJwZW5kaW5nUmVhY3Rpb25zIiwiX2dldFBlbmRpbmdSZWFjdGlvbnMiLCJzdGF0dXMiLCJyZW1vdmVGcm9tUXVldWUiLCJsZW5ndGgiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsImdldFN0YXRlRXZlbnQiLCJjYXRjaCIsInRoZW4iLCJldmVudElkcyIsInBpbm5lZCIsImluY2x1ZGVzIiwicHVzaCIsInNwbGljZSIsImluZGV4T2YiLCJzZW5kU3RhdGVFdmVudCIsImV2ZW50VGlsZU9wcyIsInVuaGlkZVdpZGdldCIsInByZXZlbnREZWZhdWx0IiwiU2hhcmVEaWFsb2ciLCJ0YXJnZXQiLCJwZXJtYWxpbmtDcmVhdG9yIiwiY29sbGFwc2VSZXBseVRocmVhZCIsImNvbXBvbmVudERpZE1vdW50Iiwib24iLCJfY2hlY2tQZXJtaXNzaW9ucyIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJfaXNQaW5uZWQiLCJwaW5uZWRFdmVudCIsImdldFN0YXRlRXZlbnRzIiwiZ2V0Q29udGVudCIsIkFycmF5IiwiaXNBcnJheSIsIl9nZXRSZWFjdGlvbnMiLCJmaWx0ZXIiLCJnZXRQZW5kaW5nRXZlbnRzIiwicmVsYXRpb24iLCJnZXRSZWxhdGlvbiIsInJlbF90eXBlIiwiZXZlbnRfaWQiLCJyZW5kZXIiLCJtZSIsImdldFVzZXJJZCIsImVkaXRTdGF0dXMiLCJyZWRhY3RTdGF0dXMiLCJ1bnNlbnRSZWFjdGlvbnNDb3VudCIsInBlbmRpbmdSZWFjdGlvbnNDb3VudCIsImFsbG93Q2FuY2VsIiwicmVzZW5kQnV0dG9uIiwicmVzZW5kRWRpdEJ1dHRvbiIsInJlc2VuZFJlYWN0aW9uc0J1dHRvbiIsInJlc2VuZFJlZGFjdGlvbkJ1dHRvbiIsInJlZGFjdEJ1dHRvbiIsImNhbmNlbEJ1dHRvbiIsImZvcndhcmRCdXR0b24iLCJwaW5CdXR0b24iLCJ2aWV3Q2xlYXJTb3VyY2VCdXR0b24iLCJ1bmhpZGVQcmV2aWV3QnV0dG9uIiwiZXh0ZXJuYWxVUkxCdXR0b24iLCJxdW90ZUJ1dHRvbiIsImlzU2VudCIsIlNFTlQiLCJpc1JlZGFjdGVkIiwib25SZXNlbmRDbGljayIsIm9uUmVzZW5kRWRpdENsaWNrIiwib25SZXNlbmRSZWFjdGlvbnNDbGljayIsInVuc2VudENvdW50Iiwib25SZXNlbmRSZWRhY3Rpb25DbGljayIsInN0YXRlIiwib25SZWRhY3RDbGljayIsIm9uQ2FuY2VsU2VuZENsaWNrIiwib25Gb3J3YXJkQ2xpY2siLCJvblBpbkNsaWNrIiwidmlld1NvdXJjZUJ1dHRvbiIsIm9uVmlld1NvdXJjZUNsaWNrIiwiZ2V0V2lyZVR5cGUiLCJvblZpZXdDbGVhclNvdXJjZUNsaWNrIiwiaXNXaWRnZXRIaWRkZW4iLCJvblVuaGlkZVByZXZpZXdDbGljayIsInBlcm1hbGluayIsImZvckV2ZW50IiwicGVybWFsaW5rQnV0dG9uIiwib25QZXJtYWxpbmtDbGljayIsIm9uUXVvdGVDbGljayIsImV4dGVybmFsX3VybCIsIm9uQ29sbGFwc2VSZXBseVRocmVhZENsaWNrIiwicmVwb3J0RXZlbnRCdXR0b24iLCJnZXRTZW5kZXIiLCJvblJlcG9ydEV2ZW50Q2xpY2siLCJQcm9wVHlwZXMiLCJvYmplY3QiLCJpc1JlcXVpcmVkIiwiZnVuYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBa0JBLFNBQVNBLFNBQVQsQ0FBbUJDLFdBQW5CLEVBQWdDO0FBQzVCLFNBQU9BLFdBQVcsS0FBS0MseUJBQVlDLE1BQTVCLElBQXNDRixXQUFXLEtBQUtDLHlCQUFZRSxRQUF6RTtBQUNIOztBQUVjLE1BQU1DLGtCQUFOLFNBQWlDQyxlQUFNQyxTQUF2QyxDQUFpRDtBQUFBO0FBQUE7QUFBQSxpREFlcEQ7QUFD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TXJDLG1CQWZOLEVBZ0JNaUUsaUJBaEJOLENBREo7QUFvQkg7O0FBcmMyRDs7OzhCQUEzQ25KLGtCLGVBQ0U7QUFDZjtBQUNBVyxFQUFBQSxPQUFPLEVBQUUySSxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWDs7QUFJZjtBQUNBNUUsRUFBQUEsWUFBWSxFQUFFMEUsbUJBQVVDLE1BTFQ7O0FBT2Y7QUFDQXJFLEVBQUFBLG1CQUFtQixFQUFFb0UsbUJBQVVHLElBUmhCOztBQVVmO0FBQ0E1RyxFQUFBQSxVQUFVLEVBQUV5RyxtQkFBVUc7QUFYUCxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHtFdmVudFN0YXR1c30gZnJvbSAnbWF0cml4LWpzLXNkayc7XG5cbmltcG9ydCB7TWF0cml4Q2xpZW50UGVnfSBmcm9tICcuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWcnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gJy4uLy4uLy4uL2luZGV4JztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBNb2RhbCBmcm9tICcuLi8uLi8uLi9Nb2RhbCc7XG5pbXBvcnQgUmVzZW5kIGZyb20gJy4uLy4uLy4uL1Jlc2VuZCc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tICcuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlJztcbmltcG9ydCB7IGlzVXJsUGVybWl0dGVkIH0gZnJvbSAnLi4vLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCB7IGlzQ29udGVudEFjdGlvbmFibGUgfSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCB7TWVudUl0ZW19IGZyb20gXCIuLi8uLi9zdHJ1Y3R1cmVzL0NvbnRleHRNZW51XCI7XG5pbXBvcnQge0V2ZW50VHlwZX0gZnJvbSBcIm1hdHJpeC1qcy1zZGsvc3JjL0B0eXBlcy9ldmVudFwiO1xuXG5mdW5jdGlvbiBjYW5DYW5jZWwoZXZlbnRTdGF0dXMpIHtcbiAgICByZXR1cm4gZXZlbnRTdGF0dXMgPT09IEV2ZW50U3RhdHVzLlFVRVVFRCB8fCBldmVudFN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1lc3NhZ2VDb250ZXh0TWVudSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogdGhlIE1hdHJpeEV2ZW50IGFzc29jaWF0ZWQgd2l0aCB0aGUgY29udGV4dCBtZW51ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKiBhbiBvcHRpb25hbCBFdmVudFRpbGVPcHMgaW1wbGVtZW50YXRpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB1bmhpZGUgcHJldmlldyB3aWRnZXRzICovXG4gICAgICAgIGV2ZW50VGlsZU9wczogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvKiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjbGlja3MgY29sbGFwc2UgdGhyZWFkLCBpZiBub3QgcHJvdmlkZWQgaGlkZSBidXR0b24gKi9cbiAgICAgICAgY29sbGFwc2VSZXBseVRocmVhZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogY2FsbGJhY2sgY2FsbGVkIHdoZW4gdGhlIG1lbnUgaXMgZGlzbWlzc2VkICovXG4gICAgICAgIG9uRmluaXNoZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIH07XG5cbiAgICBzdGF0ZSA9IHtcbiAgICAgICAgY2FuUmVkYWN0OiBmYWxzZSxcbiAgICAgICAgY2FuUGluOiBmYWxzZSxcbiAgICB9O1xuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5vbignUm9vbU1lbWJlci5wb3dlckxldmVsJywgdGhpcy5fY2hlY2tQZXJtaXNzaW9ucyk7XG4gICAgICAgIHRoaXMuX2NoZWNrUGVybWlzc2lvbnMoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICBpZiAoY2xpKSB7XG4gICAgICAgICAgICBjbGkucmVtb3ZlTGlzdGVuZXIoJ1Jvb21NZW1iZXIucG93ZXJMZXZlbCcsIHRoaXMuX2NoZWNrUGVybWlzc2lvbnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2NoZWNrUGVybWlzc2lvbnMgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG5cbiAgICAgICAgLy8gV2UgZXhwbGljaXRseSBkZWNsaW5lIHRvIHNob3cgdGhlIHJlZGFjdCBvcHRpb24gb24gQUNMIGV2ZW50cyBhcyBpdCBoYXMgYSBwb3RlbnRpYWxcbiAgICAgICAgLy8gdG8gb2JsaXRlcmF0ZSB0aGUgcm9vbSAtIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXRyaXgtb3JnL3N5bmFwc2UvaXNzdWVzLzQwNDJcbiAgICAgICAgY29uc3QgY2FuUmVkYWN0ID0gcm9vbS5jdXJyZW50U3RhdGUubWF5U2VuZFJlZGFjdGlvbkZvckV2ZW50KHRoaXMucHJvcHMubXhFdmVudCwgY2xpLmNyZWRlbnRpYWxzLnVzZXJJZClcbiAgICAgICAgICAgICYmIHRoaXMucHJvcHMubXhFdmVudC5nZXRUeXBlKCkgIT09IEV2ZW50VHlwZS5Sb29tU2VydmVyQWNsO1xuICAgICAgICBsZXQgY2FuUGluID0gcm9vbS5jdXJyZW50U3RhdGUubWF5Q2xpZW50U2VuZFN0YXRlRXZlbnQoJ20ucm9vbS5waW5uZWRfZXZlbnRzJywgY2xpKTtcblxuICAgICAgICAvLyBIQUNLOiBJbnRlbnRpb25hbGx5IHNheSB3ZSBjYW4ndCBwaW4gaWYgdGhlIHVzZXIgZG9lc24ndCB3YW50IHRvIHVzZSB0aGUgZnVuY3Rpb25hbGl0eVxuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJmZWF0dXJlX3Bpbm5pbmdcIikpIGNhblBpbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NhblJlZGFjdCwgY2FuUGlufSk7XG4gICAgfTtcblxuICAgIF9pc1Bpbm5lZCgpIHtcbiAgICAgICAgY29uc3Qgcm9vbSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IHBpbm5lZEV2ZW50ID0gcm9vbS5jdXJyZW50U3RhdGUuZ2V0U3RhdGVFdmVudHMoJ20ucm9vbS5waW5uZWRfZXZlbnRzJywgJycpO1xuICAgICAgICBpZiAoIXBpbm5lZEV2ZW50KSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBwaW5uZWRFdmVudC5nZXRDb250ZW50KCk7XG4gICAgICAgIHJldHVybiBjb250ZW50LnBpbm5lZCAmJiBBcnJheS5pc0FycmF5KGNvbnRlbnQucGlubmVkKSAmJiBjb250ZW50LnBpbm5lZC5pbmNsdWRlcyh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgfVxuXG4gICAgb25SZXNlbmRDbGljayA9ICgpID0+IHtcbiAgICAgICAgUmVzZW5kLnJlc2VuZCh0aGlzLnByb3BzLm14RXZlbnQpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvblJlc2VuZEVkaXRDbGljayA9ICgpID0+IHtcbiAgICAgICAgUmVzZW5kLnJlc2VuZCh0aGlzLnByb3BzLm14RXZlbnQucmVwbGFjaW5nRXZlbnQoKSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUmVzZW5kUmVkYWN0aW9uQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIFJlc2VuZC5yZXNlbmQodGhpcy5wcm9wcy5teEV2ZW50LmxvY2FsUmVkYWN0aW9uRXZlbnQoKSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUmVzZW5kUmVhY3Rpb25zQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgcmVhY3Rpb24gb2YgdGhpcy5fZ2V0VW5zZW50UmVhY3Rpb25zKCkpIHtcbiAgICAgICAgICAgIFJlc2VuZC5yZXNlbmQocmVhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUmVwb3J0RXZlbnRDbGljayA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgUmVwb3J0RXZlbnREaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5SZXBvcnRFdmVudERpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnUmVwb3J0IEV2ZW50JywgJycsIFJlcG9ydEV2ZW50RGlhbG9nLCB7XG4gICAgICAgICAgICBteEV2ZW50OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgIH0sICdteF9EaWFsb2dfcmVwb3J0RXZlbnQnKTtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcbiAgICB9O1xuXG4gICAgb25WaWV3U291cmNlQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGV2ID0gdGhpcy5wcm9wcy5teEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgfHwgdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBjb25zdCBWaWV3U291cmNlID0gc2RrLmdldENvbXBvbmVudCgnc3RydWN0dXJlcy5WaWV3U291cmNlJyk7XG4gICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ1ZpZXcgRXZlbnQgU291cmNlJywgJycsIFZpZXdTb3VyY2UsIHtcbiAgICAgICAgICAgIHJvb21JZDogZXYuZ2V0Um9vbUlkKCksXG4gICAgICAgICAgICBldmVudElkOiBldi5nZXRJZCgpLFxuICAgICAgICAgICAgY29udGVudDogZXYuZXZlbnQsXG4gICAgICAgIH0sICdteF9EaWFsb2dfdmlld3NvdXJjZScpO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvblZpZXdDbGVhclNvdXJjZUNsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBldiA9IHRoaXMucHJvcHMubXhFdmVudC5yZXBsYWNpbmdFdmVudCgpIHx8IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgVmlld1NvdXJjZSA9IHNkay5nZXRDb21wb25lbnQoJ3N0cnVjdHVyZXMuVmlld1NvdXJjZScpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdWaWV3IENsZWFyIEV2ZW50IFNvdXJjZScsICcnLCBWaWV3U291cmNlLCB7XG4gICAgICAgICAgICByb29tSWQ6IGV2LmdldFJvb21JZCgpLFxuICAgICAgICAgICAgZXZlbnRJZDogZXYuZ2V0SWQoKSxcbiAgICAgICAgICAgIC8vIEZJWE1FOiBfY2xlYXJFdmVudCBpcyBwcml2YXRlXG4gICAgICAgICAgICBjb250ZW50OiBldi5fY2xlYXJFdmVudCxcbiAgICAgICAgfSwgJ214X0RpYWxvZ192aWV3c291cmNlJyk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUmVkYWN0Q2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IENvbmZpcm1SZWRhY3REaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5Db25maXJtUmVkYWN0RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdDb25maXJtIFJlZGFjdCBEaWFsb2cnLCAnJywgQ29uZmlybVJlZGFjdERpYWxvZywge1xuICAgICAgICAgICAgb25GaW5pc2hlZDogYXN5bmMgKHByb2NlZWQsIHJlYXNvbikgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghcHJvY2VlZCkgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IGNsaS5yZWRhY3RFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVhc29uID8geyByZWFzb24gfSA6IHt9LFxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29kZSA9IGUuZXJyY29kZSB8fCBlLnN0YXR1c0NvZGU7XG4gICAgICAgICAgICAgICAgICAgIC8vIG9ubHkgc2hvdyB0aGUgZGlhbG9nIGlmIGZhaWxpbmcgZm9yIHNvbWV0aGluZyBvdGhlciB0aGFuIGEgbmV0d29yayBlcnJvclxuICAgICAgICAgICAgICAgICAgICAvLyAoZS5nLiBubyBlcnJjb2RlIG9yIHN0YXR1c0NvZGUpIGFzIGluIHRoYXQgY2FzZSB0aGUgcmVkYWN0aW9ucyBlbmQgdXAgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGRldGFjaGVkIHF1ZXVlIGFuZCB3ZSBzaG93IHRoZSByb29tIHN0YXR1cyBiYXIgdG8gYWxsb3cgcmV0cnlcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb2RlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBFcnJvckRpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJkaWFsb2dzLkVycm9yRGlhbG9nXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGlzcGxheSBlcnJvciBtZXNzYWdlIHN0YXRpbmcgeW91IGNvdWxkbid0IGRlbGV0ZSB0aGlzLlxuICAgICAgICAgICAgICAgICAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnWW91IGNhbm5vdCBkZWxldGUgdGhpcyBtZXNzYWdlJywgJycsIEVycm9yRGlhbG9nLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KCdFcnJvcicpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBfdCgnWW91IGNhbm5vdCBkZWxldGUgdGhpcyBtZXNzYWdlLiAoJShjb2RlKXMpJywge2NvZGV9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSwgJ214X0RpYWxvZ19jb25maXJtcmVkYWN0Jyk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uQ2FuY2VsU2VuZENsaWNrID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBteEV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBjb25zdCBlZGl0RXZlbnQgPSBteEV2ZW50LnJlcGxhY2luZ0V2ZW50KCk7XG4gICAgICAgIGNvbnN0IHJlZGFjdEV2ZW50ID0gbXhFdmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCk7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdSZWFjdGlvbnMgPSB0aGlzLl9nZXRQZW5kaW5nUmVhY3Rpb25zKCk7XG5cbiAgICAgICAgaWYgKGVkaXRFdmVudCAmJiBjYW5DYW5jZWwoZWRpdEV2ZW50LnN0YXR1cykpIHtcbiAgICAgICAgICAgIFJlc2VuZC5yZW1vdmVGcm9tUXVldWUoZWRpdEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVkYWN0RXZlbnQgJiYgY2FuQ2FuY2VsKHJlZGFjdEV2ZW50LnN0YXR1cykpIHtcbiAgICAgICAgICAgIFJlc2VuZC5yZW1vdmVGcm9tUXVldWUocmVkYWN0RXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwZW5kaW5nUmVhY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgZm9yIChjb25zdCByZWFjdGlvbiBvZiBwZW5kaW5nUmVhY3Rpb25zKSB7XG4gICAgICAgICAgICAgICAgUmVzZW5kLnJlbW92ZUZyb21RdWV1ZShyZWFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbkNhbmNlbChteEV2ZW50LnN0YXR1cykpIHtcbiAgICAgICAgICAgIFJlc2VuZC5yZW1vdmVGcm9tUXVldWUodGhpcy5wcm9wcy5teEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvbkZvcndhcmRDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2ZvcndhcmRfZXZlbnQnLFxuICAgICAgICAgICAgZXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUGluQ2xpY2sgPSAoKSA9PiB7XG4gICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRTdGF0ZUV2ZW50KHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSwgJ20ucm9vbS5waW5uZWRfZXZlbnRzJywgJycpXG4gICAgICAgICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJbnRlcmNlcHQgdGhlIEV2ZW50IE5vdCBGb3VuZCBlcnJvciBhbmQgZmFsbCB0aHJvdWdoIHRoZSBwcm9taXNlIGNoYWluIHdpdGggbm8gZXZlbnQuXG4gICAgICAgICAgICAgICAgaWYgKGUuZXJyY29kZSA9PT0gXCJNX05PVF9GT1VORFwiKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50SWRzID0gKGV2ZW50ID8gZXZlbnQucGlubmVkIDogW10pIHx8IFtdO1xuICAgICAgICAgICAgICAgIGlmICghZXZlbnRJZHMuaW5jbHVkZXModGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vdCBwaW5uZWQgLSBhZGRcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRJZHMucHVzaCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUGlubmVkIC0gcmVtb3ZlXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50SWRzLnNwbGljZShldmVudElkcy5pbmRleE9mKHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpID0gTWF0cml4Q2xpZW50UGVnLmdldCgpO1xuICAgICAgICAgICAgICAgIGNsaS5zZW5kU3RhdGVFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Um9vbUlkKCksICdtLnJvb20ucGlubmVkX2V2ZW50cycsIHtwaW5uZWQ6IGV2ZW50SWRzfSwgJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIGNsb3NlTWVudSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25GaW5pc2hlZCkgdGhpcy5wcm9wcy5vbkZpbmlzaGVkKCk7XG4gICAgfTtcblxuICAgIG9uVW5oaWRlUHJldmlld0NsaWNrID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5ldmVudFRpbGVPcHMpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMuZXZlbnRUaWxlT3BzLnVuaGlkZVdpZGdldCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIG9uUXVvdGVDbGljayA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3F1b3RlJyxcbiAgICAgICAgICAgIGV2ZW50OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvblBlcm1hbGlua0NsaWNrID0gKGU6IEV2ZW50KSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgU2hhcmVEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5TaGFyZURpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZygnc2hhcmUgcm9vbSBtZXNzYWdlIGRpYWxvZycsICcnLCBTaGFyZURpYWxvZywge1xuICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLnByb3BzLm14RXZlbnQsXG4gICAgICAgICAgICBwZXJtYWxpbmtDcmVhdG9yOiB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xuICAgIH07XG5cbiAgICBvbkNvbGxhcHNlUmVwbHlUaHJlYWRDbGljayA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5wcm9wcy5jb2xsYXBzZVJlcGx5VGhyZWFkKCk7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XG4gICAgfTtcblxuICAgIF9nZXRSZWFjdGlvbnMoZmlsdGVyKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3Qgcm9vbSA9IGNsaS5nZXRSb29tKHRoaXMucHJvcHMubXhFdmVudC5nZXRSb29tSWQoKSk7XG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKTtcbiAgICAgICAgcmV0dXJuIHJvb20uZ2V0UGVuZGluZ0V2ZW50cygpLmZpbHRlcihlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uID0gZS5nZXRSZWxhdGlvbigpO1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aW9uICYmXG4gICAgICAgICAgICAgICAgcmVsYXRpb24ucmVsX3R5cGUgPT09IFwibS5hbm5vdGF0aW9uXCIgJiZcbiAgICAgICAgICAgICAgICByZWxhdGlvbi5ldmVudF9pZCA9PT0gZXZlbnRJZCAmJlxuICAgICAgICAgICAgICAgIGZpbHRlcihlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgX2dldFBlbmRpbmdSZWFjdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9nZXRSZWFjdGlvbnMoZSA9PiBjYW5DYW5jZWwoZS5zdGF0dXMpKTtcbiAgICB9XG5cbiAgICBfZ2V0VW5zZW50UmVhY3Rpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0UmVhY3Rpb25zKGUgPT4gZS5zdGF0dXMgPT09IEV2ZW50U3RhdHVzLk5PVF9TRU5UKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IGNsaSA9IE1hdHJpeENsaWVudFBlZy5nZXQoKTtcbiAgICAgICAgY29uc3QgbWUgPSBjbGkuZ2V0VXNlcklkKCk7XG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGNvbnN0IGV2ZW50U3RhdHVzID0gbXhFdmVudC5zdGF0dXM7XG4gICAgICAgIGNvbnN0IGVkaXRTdGF0dXMgPSBteEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgJiYgbXhFdmVudC5yZXBsYWNpbmdFdmVudCgpLnN0YXR1cztcbiAgICAgICAgY29uc3QgcmVkYWN0U3RhdHVzID0gbXhFdmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkgJiYgbXhFdmVudC5sb2NhbFJlZGFjdGlvbkV2ZW50KCkuc3RhdHVzO1xuICAgICAgICBjb25zdCB1bnNlbnRSZWFjdGlvbnNDb3VudCA9IHRoaXMuX2dldFVuc2VudFJlYWN0aW9ucygpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGVuZGluZ1JlYWN0aW9uc0NvdW50ID0gdGhpcy5fZ2V0UGVuZGluZ1JlYWN0aW9ucygpLmxlbmd0aDtcbiAgICAgICAgY29uc3QgYWxsb3dDYW5jZWwgPSBjYW5DYW5jZWwobXhFdmVudC5zdGF0dXMpIHx8XG4gICAgICAgICAgICBjYW5DYW5jZWwoZWRpdFN0YXR1cykgfHxcbiAgICAgICAgICAgIGNhbkNhbmNlbChyZWRhY3RTdGF0dXMpIHx8XG4gICAgICAgICAgICBwZW5kaW5nUmVhY3Rpb25zQ291bnQgIT09IDA7XG4gICAgICAgIGxldCByZXNlbmRCdXR0b247XG4gICAgICAgIGxldCByZXNlbmRFZGl0QnV0dG9uO1xuICAgICAgICBsZXQgcmVzZW5kUmVhY3Rpb25zQnV0dG9uO1xuICAgICAgICBsZXQgcmVzZW5kUmVkYWN0aW9uQnV0dG9uO1xuICAgICAgICBsZXQgcmVkYWN0QnV0dG9uO1xuICAgICAgICBsZXQgY2FuY2VsQnV0dG9uO1xuICAgICAgICBsZXQgZm9yd2FyZEJ1dHRvbjtcbiAgICAgICAgbGV0IHBpbkJ1dHRvbjtcbiAgICAgICAgbGV0IHZpZXdDbGVhclNvdXJjZUJ1dHRvbjtcbiAgICAgICAgbGV0IHVuaGlkZVByZXZpZXdCdXR0b247XG4gICAgICAgIGxldCBleHRlcm5hbFVSTEJ1dHRvbjtcbiAgICAgICAgbGV0IHF1b3RlQnV0dG9uO1xuICAgICAgICBsZXQgY29sbGFwc2VSZXBseVRocmVhZDtcblxuICAgICAgICAvLyBzdGF0dXMgaXMgU0VOVCBiZWZvcmUgcmVtb3RlLWVjaG8sIG51bGwgYWZ0ZXJcbiAgICAgICAgY29uc3QgaXNTZW50ID0gIWV2ZW50U3RhdHVzIHx8IGV2ZW50U3RhdHVzID09PSBFdmVudFN0YXR1cy5TRU5UO1xuICAgICAgICBpZiAoIW14RXZlbnQuaXNSZWRhY3RlZCgpKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRTdGF0dXMgPT09IEV2ZW50U3RhdHVzLk5PVF9TRU5UKSB7XG4gICAgICAgICAgICAgICAgcmVzZW5kQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblJlc2VuZENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoJ1Jlc2VuZCcpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZWRpdFN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuTk9UX1NFTlQpIHtcbiAgICAgICAgICAgICAgICByZXNlbmRFZGl0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vblJlc2VuZEVkaXRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KCdSZXNlbmQgZWRpdCcpIH1cbiAgICAgICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodW5zZW50UmVhY3Rpb25zQ291bnQgIT09IDApIHtcbiAgICAgICAgICAgICAgICByZXNlbmRSZWFjdGlvbnNCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uUmVzZW5kUmVhY3Rpb25zQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnUmVzZW5kICUodW5zZW50Q291bnQpcyByZWFjdGlvbihzKScsIHt1bnNlbnRDb3VudDogdW5zZW50UmVhY3Rpb25zQ291bnR9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZWRhY3RTdGF0dXMgPT09IEV2ZW50U3RhdHVzLk5PVF9TRU5UKSB7XG4gICAgICAgICAgICByZXNlbmRSZWRhY3Rpb25CdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25SZXNlbmRSZWRhY3Rpb25DbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ1Jlc2VuZCByZW1vdmFsJykgfVxuICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzU2VudCAmJiB0aGlzLnN0YXRlLmNhblJlZGFjdCkge1xuICAgICAgICAgICAgcmVkYWN0QnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uUmVkYWN0Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdSZW1vdmUnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYWxsb3dDYW5jZWwpIHtcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8TWVudUl0ZW0gY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCIgb25DbGljaz17dGhpcy5vbkNhbmNlbFNlbmRDbGlja30+XG4gICAgICAgICAgICAgICAgICAgIHsgX3QoJ0NhbmNlbCBTZW5kaW5nJykgfVxuICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzQ29udGVudEFjdGlvbmFibGUobXhFdmVudCkpIHtcbiAgICAgICAgICAgIGZvcndhcmRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25Gb3J3YXJkQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdGb3J3YXJkIE1lc3NhZ2UnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRlLmNhblBpbikge1xuICAgICAgICAgICAgICAgIHBpbkJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25QaW5DbGlja30+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRoaXMuX2lzUGlubmVkKCkgPyBfdCgnVW5waW4gTWVzc2FnZScpIDogX3QoJ1BpbiBNZXNzYWdlJykgfVxuICAgICAgICAgICAgICAgICAgICA8L01lbnVJdGVtPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB2aWV3U291cmNlQnV0dG9uID0gKFxuICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25WaWV3U291cmNlQ2xpY2t9PlxuICAgICAgICAgICAgICAgIHsgX3QoJ1ZpZXcgU291cmNlJykgfVxuICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAobXhFdmVudC5nZXRUeXBlKCkgIT09IG14RXZlbnQuZ2V0V2lyZVR5cGUoKSkge1xuICAgICAgICAgICAgdmlld0NsZWFyU291cmNlQnV0dG9uID0gKFxuICAgICAgICAgICAgICAgIDxNZW51SXRlbSBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIiBvbkNsaWNrPXt0aGlzLm9uVmlld0NsZWFyU291cmNlQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdWaWV3IERlY3J5cHRlZCBTb3VyY2UnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5ldmVudFRpbGVPcHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLmV2ZW50VGlsZU9wcy5pc1dpZGdldEhpZGRlbigpKSB7XG4gICAgICAgICAgICAgICAgdW5oaWRlUHJldmlld0J1dHRvbiA9IChcbiAgICAgICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25VbmhpZGVQcmV2aWV3Q2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBfdCgnVW5oaWRlIFByZXZpZXcnKSB9XG4gICAgICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBwZXJtYWxpbms7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IpIHtcbiAgICAgICAgICAgIHBlcm1hbGluayA9IHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvci5mb3JFdmVudCh0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWFhYOiBpZiB3ZSB1c2Ugcm9vbSBJRCwgd2Ugc2hvdWxkIGFsc28gaW5jbHVkZSBhIHNlcnZlciB3aGVyZSB0aGUgZXZlbnQgY2FuIGJlIGZvdW5kIChvdGhlciB0aGFuIGluIHRoZSBkb21haW4gb2YgdGhlIGV2ZW50IElEKVxuICAgICAgICBjb25zdCBwZXJtYWxpbmtCdXR0b24gPSAoXG4gICAgICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICAgICAgICBlbGVtZW50PVwiYVwiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTWVzc2FnZUNvbnRleHRNZW51X2ZpZWxkXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uUGVybWFsaW5rQ2xpY2t9XG4gICAgICAgICAgICAgICAgaHJlZj17cGVybWFsaW5rfVxuICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgcmVsPVwibm9yZWZlcnJlciBub29wZW5lclwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBteEV2ZW50LmlzUmVkYWN0ZWQoKSB8fCBteEV2ZW50LmdldFR5cGUoKSAhPT0gJ20ucm9vbS5tZXNzYWdlJ1xuICAgICAgICAgICAgICAgICAgICA/IF90KCdTaGFyZSBQZXJtYWxpbmsnKSA6IF90KCdTaGFyZSBNZXNzYWdlJykgfVxuICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5ldmVudFRpbGVPcHMpIHsgLy8gdGhpcyBldmVudCBpcyByZW5kZXJlZCB1c2luZyBUZXh0dWFsQm9keVxuICAgICAgICAgICAgcXVvdGVCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25RdW90ZUNsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnUXVvdGUnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBCcmlkZ2VzIGNhbiBwcm92aWRlIGEgJ2V4dGVybmFsX3VybCcgdG8gbGluayBiYWNrIHRvIHRoZSBzb3VyY2UuXG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGVvZihteEV2ZW50LmV2ZW50LmNvbnRlbnQuZXh0ZXJuYWxfdXJsKSA9PT0gXCJzdHJpbmdcIiAmJlxuICAgICAgICAgICAgaXNVcmxQZXJtaXR0ZWQobXhFdmVudC5ldmVudC5jb250ZW50LmV4dGVybmFsX3VybClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICBleHRlcm5hbFVSTEJ1dHRvbiA9IChcbiAgICAgICAgICAgICAgICA8TWVudUl0ZW1cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cImFcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVfZmllbGRcIlxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyIG5vb3BlbmVyXCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5jbG9zZU1lbnV9XG4gICAgICAgICAgICAgICAgICAgIGhyZWY9e214RXZlbnQuZXZlbnQuY29udGVudC5leHRlcm5hbF91cmx9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdTb3VyY2UgVVJMJykgfVxuICAgICAgICAgICAgICAgIDwvTWVudUl0ZW0+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmNvbGxhcHNlUmVwbHlUaHJlYWQpIHtcbiAgICAgICAgICAgIGNvbGxhcHNlUmVwbHlUaHJlYWQgPSAoXG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25Db2xsYXBzZVJlcGx5VGhyZWFkQ2xpY2t9PlxuICAgICAgICAgICAgICAgICAgICB7IF90KCdDb2xsYXBzZSBSZXBseSBUaHJlYWQnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgcmVwb3J0RXZlbnRCdXR0b247XG4gICAgICAgIGlmIChteEV2ZW50LmdldFNlbmRlcigpICE9PSBtZSkge1xuICAgICAgICAgICAgcmVwb3J0RXZlbnRCdXR0b24gPSAoXG4gICAgICAgICAgICAgICAgPE1lbnVJdGVtIGNsYXNzTmFtZT1cIm14X01lc3NhZ2VDb250ZXh0TWVudV9maWVsZFwiIG9uQ2xpY2s9e3RoaXMub25SZXBvcnRFdmVudENsaWNrfT5cbiAgICAgICAgICAgICAgICAgICAgeyBfdCgnUmVwb3J0IENvbnRlbnQnKSB9XG4gICAgICAgICAgICAgICAgPC9NZW51SXRlbT5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9NZXNzYWdlQ29udGV4dE1lbnVcIj5cbiAgICAgICAgICAgICAgICB7IHJlc2VuZEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyByZXNlbmRFZGl0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHJlc2VuZFJlYWN0aW9uc0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyByZXNlbmRSZWRhY3Rpb25CdXR0b24gfVxuICAgICAgICAgICAgICAgIHsgcmVkYWN0QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IGNhbmNlbEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBmb3J3YXJkQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHBpbkJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyB2aWV3U291cmNlQnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHZpZXdDbGVhclNvdXJjZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyB1bmhpZGVQcmV2aWV3QnV0dG9uIH1cbiAgICAgICAgICAgICAgICB7IHBlcm1hbGlua0J1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBxdW90ZUJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBleHRlcm5hbFVSTEJ1dHRvbiB9XG4gICAgICAgICAgICAgICAgeyBjb2xsYXBzZVJlcGx5VGhyZWFkIH1cbiAgICAgICAgICAgICAgICB7IHJlcG9ydEV2ZW50QnV0dG9uIH1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==