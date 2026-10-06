"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMessageContent = createMessageContent;
exports.isQuickReaction = isQuickReaction;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _model = _interopRequireDefault(require("../../../editor/model"));

var _serialize = require("../../../editor/serialize");

var _parts = require("../../../editor/parts");

var _BasicMessageComposer = _interopRequireDefault(require("./BasicMessageComposer"));

var _ReplyThread = _interopRequireDefault(require("../elements/ReplyThread"));

var _deserialize = require("../../../editor/deserialize");

var _EventUtils = require("../../../utils/EventUtils");

var _SendHistoryManager = _interopRequireDefault(require("../../../SendHistoryManager"));

var _SlashCommands = require("../../../SlashCommands");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _languageHandler = require("../../../languageHandler");

var _ContentMessages = _interopRequireDefault(require("../../../ContentMessages"));

var _Keyboard = require("../../../Keyboard");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _ratelimitedfunc = _interopRequireDefault(require("../../../ratelimitedfunc"));

var _actions = require("../../../dispatcher/actions");

var _utils = require("../../../effects/utils");

var _effects = require("../../../effects");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

/*
Copyright 2019 New Vector Ltd
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
function addReplyToMessageContent(content, repliedToEvent, permalinkCreator) {
  const replyContent = _ReplyThread.default.makeReplyMixIn(repliedToEvent);

  Object.assign(content, replyContent); // Part of Replies fallback support - prepend the text we're sending
  // with the text we're replying to

  const nestedReply = _ReplyThread.default.getNestedReplyText(repliedToEvent, permalinkCreator);

  if (nestedReply) {
    if (content.formatted_body) {
      content.formatted_body = nestedReply.html + content.formatted_body;
    }

    content.body = nestedReply.body + content.body;
  }
} // exported for tests


function createMessageContent(model, permalinkCreator, replyToEvent) {
  const isEmote = (0, _serialize.containsEmote)(model);

  if (isEmote) {
    model = (0, _serialize.stripEmoteCommand)(model);
  }

  if ((0, _serialize.startsWith)(model, "//")) {
    model = (0, _serialize.stripPrefix)(model, "/");
  }

  model = (0, _serialize.unescapeMessage)(model);
  const body = (0, _serialize.textSerialize)(model);
  const content = {
    msgtype: isEmote ? "m.emote" : "m.text",
    body: body
  };
  const formattedBody = (0, _serialize.htmlSerializeIfNeeded)(model, {
    forceHTML: !!replyToEvent
  });

  if (formattedBody) {
    content.format = "org.matrix.custom.html";
    content.formatted_body = formattedBody;
  }

  if (replyToEvent) {
    addReplyToMessageContent(content, replyToEvent, permalinkCreator);
  }

  return content;
} // exported for tests


function isQuickReaction(model) {
  const parts = model.parts;
  if (parts.length == 0) return false;
  const text = (0, _serialize.textSerialize)(model); // shortcut takes the form "+:emoji:" or "+ :emoji:""
  // can be in 1 or 2 parts

  if (parts.length <= 2) {
    const hasShortcut = text.startsWith("+") || text.startsWith("+ ");
    const emojiMatch = text.match(_emojibaseRegex.default);

    if (hasShortcut && emojiMatch && emojiMatch.length == 1) {
      return emojiMatch[0] === text.substring(1) || emojiMatch[0] === text.substring(2);
    }
  }

  return false;
}

class SendMessageComposer extends _react.default.Component {
  constructor(props, context) {
    super(props, context);
    (0, _defineProperty2.default)(this, "_setEditorRef", ref => {
      this._editorRef = ref;
    });
    (0, _defineProperty2.default)(this, "_onKeyDown", event => {
      // ignore any keypress while doing IME compositions
      if (this._editorRef.isComposing(event)) {
        return;
      }

      const hasModifier = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
      const ctrlEnterToSend = !!_SettingsStore.default.getValue('MessageComposerInput.ctrlEnterToSend');
      const send = ctrlEnterToSend ? event.key === _Keyboard.Key.ENTER && (0, _Keyboard.isOnlyCtrlOrCmdKeyEvent)(event) : event.key === _Keyboard.Key.ENTER && !hasModifier;

      if (send) {
        this._sendMessage();

        event.preventDefault();
      } else if (event.key === _Keyboard.Key.ARROW_UP) {
        this.onVerticalArrow(event, true);
      } else if (event.key === _Keyboard.Key.ARROW_DOWN) {
        this.onVerticalArrow(event, false);
      } else if (event.key === _Keyboard.Key.ESCAPE) {
        _dispatcher.default.dispatch({
          action: 'reply_to_event',
          event: null
        });
      } else if (this._prepareToEncrypt) {
        // This needs to be last!
        this._prepareToEncrypt();
      }
    });
    (0, _defineProperty2.default)(this, "_saveStoredEditorState", () => {
      if (this.model.isEmpty) {
        this._clearStoredEditorState();
      } else {
        const item = _SendHistoryManager.default.createItem(this.model, this.props.replyToEvent);

        localStorage.setItem(this._editorStateKey, JSON.stringify(item));
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      switch (payload.action) {
        case 'reply_to_event':
        case _actions.Action.FocusComposer:
          this._editorRef && this._editorRef.focus();
          break;

        case 'insert_mention':
          this._insertMention(payload.user_id);

          break;

        case 'quote':
          this._insertQuotedMessage(payload.event);

          break;

        case 'insert_emoji':
          this._insertEmoji(payload.emoji);

          break;
      }
    });
    (0, _defineProperty2.default)(this, "_insertEmoji", emoji => {
      const {
        model
      } = this;
      const {
        partCreator
      } = model;

      const caret = this._editorRef.getCaret();

      const position = model.positionForOffset(caret.offset, caret.atNodeEnd);
      model.transform(() => {
        const addedLen = model.insert([partCreator.plain(emoji)], position);
        return model.positionForOffset(caret.offset + addedLen, true);
      });
    });
    (0, _defineProperty2.default)(this, "_onPaste", event => {
      const {
        clipboardData
      } = event; // Prioritize text on the clipboard over files as Office on macOS puts a bitmap
      // in the clipboard as well as the content being copied.

      if (clipboardData.files.length && !clipboardData.types.some(t => t === "text/plain")) {
        // This actually not so much for 'files' as such (at time of writing
        // neither chrome nor firefox let you paste a plain file copied
        // from Finder) but more images copied from a different website
        // / word processor etc.
        _ContentMessages.default.sharedInstance().sendContentListToRoom(Array.from(clipboardData.files), this.props.room.roomId, this.context);

        return true; // to skip internal onPaste handler
      }
    });
    this.model = null;
    this._editorRef = null;
    this.currentlyComposedEditorState = null;

    if (this.context.isCryptoEnabled() && this.context.isRoomEncrypted(this.props.room.roomId)) {
      this._prepareToEncrypt = new _ratelimitedfunc.default(() => {
        this.context.prepareToEncrypt(this.props.room);
      }, 60000);
    }

    window.addEventListener("beforeunload", this._saveStoredEditorState);
  }

  onVerticalArrow(e, up) {
    // arrows from an initial-caret composer navigates recent messages to edit
    // ctrl-alt-arrows navigate send history
    if (e.shiftKey || e.metaKey) return;
    const shouldSelectHistory = e.altKey && e.ctrlKey;
    const shouldEditLastMessage = !e.altKey && !e.ctrlKey && up && !this.props.replyToEvent;

    if (shouldSelectHistory) {
      // Try select composer history
      const selected = this.selectSendHistory(up);

      if (selected) {
        // We're selecting history, so prevent the key event from doing anything else
        e.preventDefault();
      }
    } else if (shouldEditLastMessage) {
      // selection must be collapsed and caret at start
      if (this._editorRef.isSelectionCollapsed() && this._editorRef.isCaretAtStart()) {
        const editEvent = (0, _EventUtils.findEditableEvent)(this.props.room, false);

        if (editEvent) {
          // We're selecting history, so prevent the key event from doing anything else
          e.preventDefault();

          _dispatcher.default.dispatch({
            action: 'edit_event',
            event: editEvent
          });
        }
      }
    }
  } // we keep sent messages/commands in a separate history (separate from undo history)
  // so you can alt+up/down in them


  selectSendHistory(up) {
    const delta = up ? -1 : 1; // True if we are not currently selecting history, but composing a message

    if (this.sendHistoryManager.currentIndex === this.sendHistoryManager.history.length) {
      // We can't go any further - there isn't any more history, so nop.
      if (!up) {
        return;
      }

      this.currentlyComposedEditorState = this.model.serializeParts();
    } else if (this.sendHistoryManager.currentIndex + delta === this.sendHistoryManager.history.length) {
      // True when we return to the message being composed currently
      this.model.reset(this.currentlyComposedEditorState);
      this.sendHistoryManager.currentIndex = this.sendHistoryManager.history.length;
      return;
    }

    const {
      parts,
      replyEventId
    } = this.sendHistoryManager.getItem(delta);

    _dispatcher.default.dispatch({
      action: 'reply_to_event',
      event: replyEventId ? this.props.room.findEventById(replyEventId) : null
    });

    if (parts) {
      this.model.reset(parts);

      this._editorRef.focus();
    }
  }

  _isSlashCommand() {
    const parts = this.model.parts;
    const firstPart = parts[0];

    if (firstPart) {
      if (firstPart.type === "command" && firstPart.text.startsWith("/") && !firstPart.text.startsWith("//")) {
        return true;
      } // be extra resilient when somehow the AutocompleteWrapperModel or
      // CommandPartCreator fails to insert a command part, so we don't send
      // a command as a message


      if (firstPart.text.startsWith("/") && !firstPart.text.startsWith("//") && (firstPart.type === "plain" || firstPart.type === "pill-candidate")) {
        return true;
      }
    }

    return false;
  }

  _sendQuickReaction() {
    const timeline = this.props.room.getLiveTimeline();
    const events = timeline.getEvents();
    const reaction = this.model.parts[1].text;

    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].getType() === "m.room.message") {
        let shouldReact = true;
        const lastMessage = events[i];

        const userId = _MatrixClientPeg.MatrixClientPeg.get().getUserId();

        const messageReactions = this.props.room.getUnfilteredTimelineSet().getRelationsForEvent(lastMessage.getId(), "m.annotation", "m.reaction"); // if we have already sent this reaction, don't redact but don't re-send

        if (messageReactions) {
          const myReactionEvents = messageReactions.getAnnotationsBySender()[userId] || [];
          const myReactionKeys = [...myReactionEvents].filter(event => !event.isRedacted()).map(event => event.getRelation().key);
          shouldReact = !myReactionKeys.includes(reaction);
        }

        if (shouldReact) {
          _MatrixClientPeg.MatrixClientPeg.get().sendEvent(lastMessage.getRoomId(), "m.reaction", {
            "m.relates_to": {
              "rel_type": "m.annotation",
              "event_id": lastMessage.getId(),
              "key": reaction
            }
          });

          _dispatcher.default.dispatch({
            action: "message_sent"
          });
        }

        break;
      }
    }
  }

  _getSlashCommand() {
    const commandText = this.model.parts.reduce((text, part) => {
      // use mxid to textify user pills in a command
      if (part.type === "user-pill") {
        return text + part.resourceId;
      }

      return text + part.text;
    }, "");
    return [(0, _SlashCommands.getCommand)(this.props.room.roomId, commandText), commandText];
  }

  async _runSlashCommand(fn) {
    const cmd = fn();
    let error = cmd.error;

    if (cmd.promise) {
      try {
        await cmd.promise;
      } catch (err) {
        error = err;
      }
    }

    if (error) {
      console.error("Command failure: %s", error);
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog"); // assume the error is a server error when the command is async

      const isServerError = !!cmd.promise;
      const title = isServerError ? (0, _languageHandler._td)("Server error") : (0, _languageHandler._td)("Command error");
      let errText;

      if (typeof error === 'string') {
        errText = error;
      } else if (error.message) {
        errText = error.message;
      } else {
        errText = (0, _languageHandler._t)("Server unavailable, overloaded, or something else went wrong.");
      }

      _Modal.default.createTrackedDialog(title, '', ErrorDialog, {
        title: (0, _languageHandler._t)(title),
        description: errText
      });
    } else {
      console.log("Command success.");
    }
  }

  async _sendMessage() {
    if (this.model.isEmpty) {
      return;
    }

    let shouldSend = true;

    if (!(0, _serialize.containsEmote)(this.model) && this._isSlashCommand()) {
      const [cmd, commandText] = this._getSlashCommand();

      if (cmd) {
        shouldSend = false;

        this._runSlashCommand(cmd);
      } else {
        // ask the user if their unknown command should be sent as a message
        const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");

        const {
          finished
        } = _Modal.default.createTrackedDialog("Unknown command", "", QuestionDialog, {
          title: (0, _languageHandler._t)("Unknown Command"),
          description: /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Unrecognised command: %(commandText)s", {
            commandText
          })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("You can use <code>/help</code> to list available commands. " + "Did you mean to send this as a message?", {}, {
            code: t => /*#__PURE__*/_react.default.createElement("code", null, t)
          })), /*#__PURE__*/_react.default.createElement("p", null, (0, _languageHandler._t)("Hint: Begin your message with <code>//</code> to start it with a slash.", {}, {
            code: t => /*#__PURE__*/_react.default.createElement("code", null, t)
          }))),
          button: (0, _languageHandler._t)('Send as message')
        });

        const [sendAnyway] = await finished; // if !sendAnyway bail to let the user edit the composer and try again

        if (!sendAnyway) return;
      }
    }

    if (isQuickReaction(this.model)) {
      shouldSend = false;

      this._sendQuickReaction();
    }

    const replyToEvent = this.props.replyToEvent;

    if (shouldSend) {
      const startTime = _CountlyAnalytics.default.getTimestamp();

      const {
        roomId
      } = this.props.room;
      const content = createMessageContent(this.model, this.props.permalinkCreator, replyToEvent); // don't bother sending an empty message

      if (!content.body.trim()) return;
      const prom = this.context.sendMessage(roomId, content);

      if (replyToEvent) {
        // Clear reply_to_event as we put the message into the queue
        // if the send fails, retry will handle resending.
        _dispatcher.default.dispatch({
          action: 'reply_to_event',
          event: null
        });
      }

      _dispatcher.default.dispatch({
        action: "message_sent"
      });

      _effects.CHAT_EFFECTS.forEach(effect => {
        if ((0, _utils.containsEmoji)(content, effect.emojis)) {
          _dispatcher.default.dispatch({
            action: `effects.${effect.command}`
          });
        }
      });

      _CountlyAnalytics.default.instance.trackSendMessage(startTime, prom, roomId, false, !!replyToEvent, content);
    }

    this.sendHistoryManager.save(this.model, replyToEvent); // clear composer

    this.model.reset([]);

    this._editorRef.clearUndoHistory();

    this._editorRef.focus();

    this._clearStoredEditorState();

    _dispatcher.default.dispatch({
      action: "scroll_to_bottom"
    });
  }

  componentWillUnmount() {
    _dispatcher.default.unregister(this.dispatcherRef);

    window.removeEventListener("beforeunload", this._saveStoredEditorState);

    this._saveStoredEditorState();
  } // TODO: [REACT-WARNING] Move this to constructor


  UNSAFE_componentWillMount() {
    // eslint-disable-line camelcase
    const partCreator = new _parts.CommandPartCreator(this.props.room, this.context);
    const parts = this._restoreStoredEditorState(partCreator) || [];
    this.model = new _model.default(parts, partCreator);
    this.dispatcherRef = _dispatcher.default.register(this.onAction);
    this.sendHistoryManager = new _SendHistoryManager.default(this.props.room.roomId, 'mx_cider_history_');
  }

  get _editorStateKey() {
    return `mx_cider_state_${this.props.room.roomId}`;
  }

  _clearStoredEditorState() {
    localStorage.removeItem(this._editorStateKey);
  }

  _restoreStoredEditorState(partCreator) {
    const json = localStorage.getItem(this._editorStateKey);

    if (json) {
      try {
        const {
          parts: serializedParts,
          replyEventId
        } = JSON.parse(json);
        const parts = serializedParts.map(p => partCreator.deserializePart(p));

        if (replyEventId) {
          _dispatcher.default.dispatch({
            action: 'reply_to_event',
            event: this.props.room.findEventById(replyEventId)
          });
        }

        return parts;
      } catch (e) {
        console.error(e);
      }
    }
  }

  _insertMention(userId) {
    const {
      model
    } = this;
    const {
      partCreator
    } = model;
    const member = this.props.room.getMember(userId);
    const displayName = member ? member.rawDisplayName : userId;

    const caret = this._editorRef.getCaret();

    const position = model.positionForOffset(caret.offset, caret.atNodeEnd); // index is -1 if there are no parts but we only care for if this would be the part in position 0

    const insertIndex = position.index > 0 ? position.index : 0;
    const parts = partCreator.createMentionParts(insertIndex, displayName, userId);
    model.transform(() => {
      const addedLen = model.insert(parts, position);
      return model.positionForOffset(caret.offset + addedLen, true);
    }); // refocus on composer, as we just clicked "Mention"

    this._editorRef && this._editorRef.focus();
  }

  _insertQuotedMessage(event) {
    const {
      model
    } = this;
    const {
      partCreator
    } = model;
    const quoteParts = (0, _deserialize.parseEvent)(event, partCreator, {
      isQuotedMessage: true
    }); // add two newlines

    quoteParts.push(partCreator.newline());
    quoteParts.push(partCreator.newline());
    model.transform(() => {
      const addedLen = model.insert(quoteParts, model.positionForOffset(0));
      return model.positionForOffset(addedLen, true);
    }); // refocus on composer, as we just clicked "Quote"

    this._editorRef && this._editorRef.focus();
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_SendMessageComposer",
      onClick: this.focusComposer,
      onKeyDown: this._onKeyDown
    }, /*#__PURE__*/_react.default.createElement(_BasicMessageComposer.default, {
      ref: this._setEditorRef,
      model: this.model,
      room: this.props.room,
      label: this.props.placeholder,
      placeholder: this.props.placeholder,
      onPaste: this._onPaste
    }));
  }

}

exports.default = SendMessageComposer;
(0, _defineProperty2.default)(SendMessageComposer, "propTypes", {
  room: _propTypes.default.object.isRequired,
  placeholder: _propTypes.default.string,
  permalinkCreator: _propTypes.default.object.isRequired,
  replyToEvent: _propTypes.default.object
});
(0, _defineProperty2.default)(SendMessageComposer, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NlbmRNZXNzYWdlQ29tcG9zZXIuanMiXSwibmFtZXMiOlsiYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50IiwiY29udGVudCIsInJlcGxpZWRUb0V2ZW50IiwicGVybWFsaW5rQ3JlYXRvciIsInJlcGx5Q29udGVudCIsIlJlcGx5VGhyZWFkIiwibWFrZVJlcGx5TWl4SW4iLCJPYmplY3QiLCJhc3NpZ24iLCJuZXN0ZWRSZXBseSIsImdldE5lc3RlZFJlcGx5VGV4dCIsImZvcm1hdHRlZF9ib2R5IiwiaHRtbCIsImJvZHkiLCJjcmVhdGVNZXNzYWdlQ29udGVudCIsIm1vZGVsIiwicmVwbHlUb0V2ZW50IiwiaXNFbW90ZSIsIm1zZ3R5cGUiLCJmb3JtYXR0ZWRCb2R5IiwiZm9yY2VIVE1MIiwiZm9ybWF0IiwiaXNRdWlja1JlYWN0aW9uIiwicGFydHMiLCJsZW5ndGgiLCJ0ZXh0IiwiaGFzU2hvcnRjdXQiLCJzdGFydHNXaXRoIiwiZW1vamlNYXRjaCIsIm1hdGNoIiwiRU1PSklfUkVHRVgiLCJzdWJzdHJpbmciLCJTZW5kTWVzc2FnZUNvbXBvc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJlZiIsIl9lZGl0b3JSZWYiLCJldmVudCIsImlzQ29tcG9zaW5nIiwiaGFzTW9kaWZpZXIiLCJhbHRLZXkiLCJjdHJsS2V5IiwibWV0YUtleSIsInNoaWZ0S2V5IiwiY3RybEVudGVyVG9TZW5kIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2VuZCIsImtleSIsIktleSIsIkVOVEVSIiwiX3NlbmRNZXNzYWdlIiwicHJldmVudERlZmF1bHQiLCJBUlJPV19VUCIsIm9uVmVydGljYWxBcnJvdyIsIkFSUk9XX0RPV04iLCJFU0NBUEUiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIl9wcmVwYXJlVG9FbmNyeXB0IiwiaXNFbXB0eSIsIl9jbGVhclN0b3JlZEVkaXRvclN0YXRlIiwiaXRlbSIsIlNlbmRIaXN0b3J5TWFuYWdlciIsImNyZWF0ZUl0ZW0iLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwiX2VkaXRvclN0YXRlS2V5IiwiSlNPTiIsInN0cmluZ2lmeSIsInBheWxvYWQiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwiZm9jdXMiLCJfaW5zZXJ0TWVudGlvbiIsInVzZXJfaWQiLCJfaW5zZXJ0UXVvdGVkTWVzc2FnZSIsIl9pbnNlcnRFbW9qaSIsImVtb2ppIiwicGFydENyZWF0b3IiLCJjYXJldCIsImdldENhcmV0IiwicG9zaXRpb24iLCJwb3NpdGlvbkZvck9mZnNldCIsIm9mZnNldCIsImF0Tm9kZUVuZCIsInRyYW5zZm9ybSIsImFkZGVkTGVuIiwiaW5zZXJ0IiwicGxhaW4iLCJjbGlwYm9hcmREYXRhIiwiZmlsZXMiLCJ0eXBlcyIsInNvbWUiLCJ0IiwiQ29udGVudE1lc3NhZ2VzIiwic2hhcmVkSW5zdGFuY2UiLCJzZW5kQ29udGVudExpc3RUb1Jvb20iLCJBcnJheSIsImZyb20iLCJyb29tIiwicm9vbUlkIiwiY3VycmVudGx5Q29tcG9zZWRFZGl0b3JTdGF0ZSIsImlzQ3J5cHRvRW5hYmxlZCIsImlzUm9vbUVuY3J5cHRlZCIsIlJhdGVMaW1pdGVkRnVuYyIsInByZXBhcmVUb0VuY3J5cHQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiX3NhdmVTdG9yZWRFZGl0b3JTdGF0ZSIsImUiLCJ1cCIsInNob3VsZFNlbGVjdEhpc3RvcnkiLCJzaG91bGRFZGl0TGFzdE1lc3NhZ2UiLCJzZWxlY3RlZCIsInNlbGVjdFNlbmRIaXN0b3J5IiwiaXNTZWxlY3Rpb25Db2xsYXBzZWQiLCJpc0NhcmV0QXRTdGFydCIsImVkaXRFdmVudCIsImRlbHRhIiwic2VuZEhpc3RvcnlNYW5hZ2VyIiwiY3VycmVudEluZGV4IiwiaGlzdG9yeSIsInNlcmlhbGl6ZVBhcnRzIiwicmVzZXQiLCJyZXBseUV2ZW50SWQiLCJnZXRJdGVtIiwiZmluZEV2ZW50QnlJZCIsIl9pc1NsYXNoQ29tbWFuZCIsImZpcnN0UGFydCIsInR5cGUiLCJfc2VuZFF1aWNrUmVhY3Rpb24iLCJ0aW1lbGluZSIsImdldExpdmVUaW1lbGluZSIsImV2ZW50cyIsImdldEV2ZW50cyIsInJlYWN0aW9uIiwiaSIsImdldFR5cGUiLCJzaG91bGRSZWFjdCIsImxhc3RNZXNzYWdlIiwidXNlcklkIiwiTWF0cml4Q2xpZW50UGVnIiwiZ2V0IiwiZ2V0VXNlcklkIiwibWVzc2FnZVJlYWN0aW9ucyIsImdldFVuZmlsdGVyZWRUaW1lbGluZVNldCIsImdldFJlbGF0aW9uc0ZvckV2ZW50IiwiZ2V0SWQiLCJteVJlYWN0aW9uRXZlbnRzIiwiZ2V0QW5ub3RhdGlvbnNCeVNlbmRlciIsIm15UmVhY3Rpb25LZXlzIiwiZmlsdGVyIiwiaXNSZWRhY3RlZCIsIm1hcCIsImdldFJlbGF0aW9uIiwiaW5jbHVkZXMiLCJzZW5kRXZlbnQiLCJnZXRSb29tSWQiLCJfZ2V0U2xhc2hDb21tYW5kIiwiY29tbWFuZFRleHQiLCJyZWR1Y2UiLCJwYXJ0IiwicmVzb3VyY2VJZCIsIl9ydW5TbGFzaENvbW1hbmQiLCJmbiIsImNtZCIsImVycm9yIiwicHJvbWlzZSIsImVyciIsImNvbnNvbGUiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImlzU2VydmVyRXJyb3IiLCJ0aXRsZSIsImVyclRleHQiLCJtZXNzYWdlIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJsb2ciLCJzaG91bGRTZW5kIiwiUXVlc3Rpb25EaWFsb2ciLCJmaW5pc2hlZCIsImNvZGUiLCJidXR0b24iLCJzZW5kQW55d2F5Iiwic3RhcnRUaW1lIiwiQ291bnRseUFuYWx5dGljcyIsImdldFRpbWVzdGFtcCIsInRyaW0iLCJwcm9tIiwic2VuZE1lc3NhZ2UiLCJDSEFUX0VGRkVDVFMiLCJmb3JFYWNoIiwiZWZmZWN0IiwiZW1vamlzIiwiY29tbWFuZCIsImluc3RhbmNlIiwidHJhY2tTZW5kTWVzc2FnZSIsInNhdmUiLCJjbGVhclVuZG9IaXN0b3J5IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiZGlzcGF0Y2hlclJlZiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiQ29tbWFuZFBhcnRDcmVhdG9yIiwiX3Jlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZSIsIkVkaXRvck1vZGVsIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsInJlbW92ZUl0ZW0iLCJqc29uIiwic2VyaWFsaXplZFBhcnRzIiwicGFyc2UiLCJwIiwiZGVzZXJpYWxpemVQYXJ0IiwibWVtYmVyIiwiZ2V0TWVtYmVyIiwiZGlzcGxheU5hbWUiLCJyYXdEaXNwbGF5TmFtZSIsImluc2VydEluZGV4IiwiaW5kZXgiLCJjcmVhdGVNZW50aW9uUGFydHMiLCJxdW90ZVBhcnRzIiwiaXNRdW90ZWRNZXNzYWdlIiwicHVzaCIsIm5ld2xpbmUiLCJyZW5kZXIiLCJmb2N1c0NvbXBvc2VyIiwiX29uS2V5RG93biIsIl9zZXRFZGl0b3JSZWYiLCJwbGFjZWhvbGRlciIsIl9vblBhc3RlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsInN0cmluZyIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFTQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFvQ0EsU0FBU0Esd0JBQVQsQ0FBa0NDLE9BQWxDLEVBQTJDQyxjQUEzQyxF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SSxNQUFBLFdBQVcsRUFBRSxLQUFLMU0sS0FBTCxDQUFXME0sV0FMNUI7QUFNSSxNQUFBLE9BQU8sRUFBRSxLQUFLQztBQU5sQixNQURKLENBREo7QUFZSDs7QUF0YjREOzs7OEJBQTVDL00sbUIsZUFDRTtBQUNmd0UsRUFBQUEsSUFBSSxFQUFFd0ksbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFI7QUFFZkosRUFBQUEsV0FBVyxFQUFFRSxtQkFBVUcsTUFGUjtBQUdmaFAsRUFBQUEsZ0JBQWdCLEVBQUU2TyxtQkFBVUMsTUFBVixDQUFpQkMsVUFIcEI7QUFJZmxPLEVBQUFBLFlBQVksRUFBRWdPLG1CQUFVQztBQUpULEM7OEJBREZqTixtQixpQkFRSW9OLDRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE5IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tICcuLi8uLi8uLi9lZGl0b3IvbW9kZWwnO1xuaW1wb3J0IHtcbiAgICBodG1sU2VyaWFsaXplSWZOZWVkZWQsXG4gICAgdGV4dFNlcmlhbGl6ZSxcbiAgICBjb250YWluc0Vtb3RlLFxuICAgIHN0cmlwRW1vdGVDb21tYW5kLFxuICAgIHVuZXNjYXBlTWVzc2FnZSxcbiAgICBzdGFydHNXaXRoLFxuICAgIHN0cmlwUHJlZml4LFxufSBmcm9tICcuLi8uLi8uLi9lZGl0b3Ivc2VyaWFsaXplJztcbmltcG9ydCB7Q29tbWFuZFBhcnRDcmVhdG9yfSBmcm9tICcuLi8uLi8uLi9lZGl0b3IvcGFydHMnO1xuaW1wb3J0IEJhc2ljTWVzc2FnZUNvbXBvc2VyIGZyb20gXCIuL0Jhc2ljTWVzc2FnZUNvbXBvc2VyXCI7XG5pbXBvcnQgUmVwbHlUaHJlYWQgZnJvbSBcIi4uL2VsZW1lbnRzL1JlcGx5VGhyZWFkXCI7XG5pbXBvcnQge3BhcnNlRXZlbnR9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9kZXNlcmlhbGl6ZSc7XG5pbXBvcnQge2ZpbmRFZGl0YWJsZUV2ZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCBTZW5kSGlzdG9yeU1hbmFnZXIgZnJvbSBcIi4uLy4uLy4uL1NlbmRIaXN0b3J5TWFuYWdlclwiO1xuaW1wb3J0IHtnZXRDb21tYW5kfSBmcm9tICcuLi8uLi8uLi9TbGFzaENvbW1hbmRzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHtfdCwgX3RkfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IENvbnRlbnRNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9Db250ZW50TWVzc2FnZXMnO1xuaW1wb3J0IHtLZXksIGlzT25seUN0cmxPckNtZEtleUV2ZW50fSBmcm9tIFwiLi4vLi4vLi4vS2V5Ym9hcmRcIjtcbmltcG9ydCBNYXRyaXhDbGllbnRDb250ZXh0IGZyb20gXCIuLi8uLi8uLi9jb250ZXh0cy9NYXRyaXhDbGllbnRDb250ZXh0XCI7XG5pbXBvcnQgUmF0ZUxpbWl0ZWRGdW5jIGZyb20gJy4uLy4uLy4uL3JhdGVsaW1pdGVkZnVuYyc7XG5pbXBvcnQge0FjdGlvbn0gZnJvbSBcIi4uLy4uLy4uL2Rpc3BhdGNoZXIvYWN0aW9uc1wiO1xuaW1wb3J0IHtjb250YWluc0Vtb2ppfSBmcm9tIFwiLi4vLi4vLi4vZWZmZWN0cy91dGlsc1wiO1xuaW1wb3J0IHtDSEFUX0VGRkVDVFN9IGZyb20gJy4uLy4uLy4uL2VmZmVjdHMnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBDb3VudGx5QW5hbHl0aWNzIGZyb20gXCIuLi8uLi8uLi9Db3VudGx5QW5hbHl0aWNzXCI7XG5pbXBvcnQge01hdHJpeENsaWVudFBlZ30gZnJvbSBcIi4uLy4uLy4uL01hdHJpeENsaWVudFBlZ1wiO1xuaW1wb3J0IEVNT0pJX1JFR0VYIGZyb20gJ2Vtb2ppYmFzZS1yZWdleCc7XG5cbmZ1bmN0aW9uIGFkZFJlcGx5VG9NZXNzYWdlQ29udGVudChjb250ZW50LCByZXBsaWVkVG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcikge1xuICAgIGNvbnN0IHJlcGx5Q29udGVudCA9IFJlcGx5VGhyZWFkLm1ha2VSZXBseU1peEluKHJlcGxpZWRUb0V2ZW50KTtcbiAgICBPYmplY3QuYXNzaWduKGNvbnRlbnQsIHJlcGx5Q29udGVudCk7XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydCAtIHByZXBlbmQgdGhlIHRleHQgd2UncmUgc2VuZGluZ1xuICAgIC8vIHdpdGggdGhlIHRleHQgd2UncmUgcmVwbHlpbmcgdG9cbiAgICBjb25zdCBuZXN0ZWRSZXBseSA9IFJlcGx5VGhyZWFkLmdldE5lc3RlZFJlcGx5VGV4dChyZXBsaWVkVG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcik7XG4gICAgaWYgKG5lc3RlZFJlcGx5KSB7XG4gICAgICAgIGlmIChjb250ZW50LmZvcm1hdHRlZF9ib2R5KSB7XG4gICAgICAgICAgICBjb250ZW50LmZvcm1hdHRlZF9ib2R5ID0gbmVzdGVkUmVwbHkuaHRtbCArIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5ib2R5ID0gbmVzdGVkUmVwbHkuYm9keSArIGNvbnRlbnQuYm9keTtcbiAgICB9XG59XG5cbi8vIGV4cG9ydGVkIGZvciB0ZXN0c1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VDb250ZW50KG1vZGVsLCBwZXJtYWxpbmtDcmVhdG9yLCByZXBseVRvRXZlbnQpIHtcbiAgICBjb25zdCBpc0Vtb3RlID0gY29udGFpbnNFbW90ZShtb2RlbCk7XG4gICAgaWYgKGlzRW1vdGUpIHtcbiAgICAgICAgbW9kZWwgPSBzdHJpcEVtb3RlQ29tbWFuZChtb2RlbCk7XG4gICAgfVxuICAgIGlmIChzdGFydHNXaXRoKG1vZGVsLCBcIi8vXCIpKSB7XG4gICAgICAgIG1vZGVsID0gc3RyaXBQcmVmaXgobW9kZWwsIFwiL1wiKTtcbiAgICB9XG4gICAgbW9kZWwgPSB1bmVzY2FwZU1lc3NhZ2UobW9kZWwpO1xuXG4gICAgY29uc3QgYm9keSA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgIG1zZ3R5cGU6IGlzRW1vdGUgPyBcIm0uZW1vdGVcIiA6IFwibS50ZXh0XCIsXG4gICAgICAgIGJvZHk6IGJvZHksXG4gICAgfTtcbiAgICBjb25zdCBmb3JtYXR0ZWRCb2R5ID0gaHRtbFNlcmlhbGl6ZUlmTmVlZGVkKG1vZGVsLCB7Zm9yY2VIVE1MOiAhIXJlcGx5VG9FdmVudH0pO1xuICAgIGlmIChmb3JtYXR0ZWRCb2R5KSB7XG4gICAgICAgIGNvbnRlbnQuZm9ybWF0ID0gXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCI7XG4gICAgICAgIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPSBmb3JtYXR0ZWRCb2R5O1xuICAgIH1cblxuICAgIGlmIChyZXBseVRvRXZlbnQpIHtcbiAgICAgICAgYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50KGNvbnRlbnQsIHJlcGx5VG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8vIGV4cG9ydGVkIGZvciB0ZXN0c1xuZXhwb3J0IGZ1bmN0aW9uIGlzUXVpY2tSZWFjdGlvbihtb2RlbCkge1xuICAgIGNvbnN0IHBhcnRzID0gbW9kZWwucGFydHM7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdGV4dCA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuICAgIC8vIHNob3J0Y3V0IHRha2VzIHRoZSBmb3JtIFwiKzplbW9qaTpcIiBvciBcIisgOmVtb2ppOlwiXCJcbiAgICAvLyBjYW4gYmUgaW4gMSBvciAyIHBhcnRzXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA8PSAyKSB7XG4gICAgICAgIGNvbnN0IGhhc1Nob3J0Y3V0ID0gdGV4dC5zdGFydHNXaXRoKFwiK1wiKSB8fCB0ZXh0LnN0YXJ0c1dpdGgoXCIrIFwiKTtcbiAgICAgICAgY29uc3QgZW1vamlNYXRjaCA9IHRleHQubWF0Y2goRU1PSklfUkVHRVgpO1xuICAgICAgICBpZiAoaGFzU2hvcnRjdXQgJiYgZW1vamlNYXRjaCAmJiBlbW9qaU1hdGNoLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1vamlNYXRjaFswXSA9PT0gdGV4dC5zdWJzdHJpbmcoMSkgfHxcbiAgICAgICAgICAgICAgICBlbW9qaU1hdGNoWzBdID09PSB0ZXh0LnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbmRNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgcmVwbHlUb0V2ZW50OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZWRpdG9yUmVmID0gbnVsbDtcbiAgICAgICAgdGhpcy5jdXJyZW50bHlDb21wb3NlZEVkaXRvclN0YXRlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuY29udGV4dC5pc0NyeXB0b0VuYWJsZWQoKSAmJiB0aGlzLmNvbnRleHQuaXNSb29tRW5jcnlwdGVkKHRoaXMucHJvcHMucm9vbS5yb29tSWQpKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmVwYXJlVG9FbmNyeXB0ID0gbmV3IFJhdGVMaW1pdGVkRnVuYygoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnByZXBhcmVUb0VuY3J5cHQodGhpcy5wcm9wcy5yb29tKTtcbiAgICAgICAgICAgIH0sIDYwMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsIHRoaXMuX3NhdmVTdG9yZWRFZGl0b3JTdGF0ZSk7XG4gICAgfVxuXG4gICAgX3NldEVkaXRvclJlZiA9IHJlZiA9PiB7XG4gICAgICAgIHRoaXMuX2VkaXRvclJlZiA9IHJlZjtcbiAgICB9O1xuXG4gICAgX29uS2V5RG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgYW55IGtleXByZXNzIHdoaWxlIGRvaW5nIElNRSBjb21wb3NpdGlvbnNcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZi5pc0NvbXBvc2luZyhldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBoYXNNb2RpZmllciA9IGV2ZW50LmFsdEtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuc2hpZnRLZXk7XG4gICAgICAgIGNvbnN0IGN0cmxFbnRlclRvU2VuZCA9ICEhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnTWVzc2FnZUNvbXBvc2VySW5wdXQuY3RybEVudGVyVG9TZW5kJyk7XG4gICAgICAgIGNvbnN0IHNlbmQgPSBjdHJsRW50ZXJUb1NlbmRcbiAgICAgICAgICAgID8gZXZlbnQua2V5ID09PSBLZXkuRU5URVIgJiYgaXNPbmx5Q3RybE9yQ21kS2V5RXZlbnQoZXZlbnQpXG4gICAgICAgICAgICA6IGV2ZW50LmtleSA9PT0gS2V5LkVOVEVSICYmICFoYXNNb2RpZmllcjtcbiAgICAgICAgaWYgKHNlbmQpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbmRNZXNzYWdlKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gS2V5LkFSUk9XX1VQKSB7XG4gICAgICAgICAgICB0aGlzLm9uVmVydGljYWxBcnJvdyhldmVudCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBLZXkuQVJST1dfRE9XTikge1xuICAgICAgICAgICAgdGhpcy5vblZlcnRpY2FsQXJyb3coZXZlbnQsIGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09IEtleS5FU0NBUEUpIHtcbiAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgYWN0aW9uOiAncmVwbHlfdG9fZXZlbnQnLFxuICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fcHJlcGFyZVRvRW5jcnlwdCkge1xuICAgICAgICAgICAgLy8gVGhpcyBuZWVkcyB0byBiZSBsYXN0IVxuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRvRW5jcnlwdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIG9uVmVydGljYWxBcnJvdyhlLCB1cCkge1xuICAgICAgICAvLyBhcnJvd3MgZnJvbSBhbiBpbml0aWFsLWNhcmV0IGNvbXBvc2VyIG5hdmlnYXRlcyByZWNlbnQgbWVzc2FnZXMgdG8gZWRpdFxuICAgICAgICAvLyBjdHJsLWFsdC1hcnJvd3MgbmF2aWdhdGUgc2VuZCBoaXN0b3J5XG4gICAgICAgIGlmIChlLnNoaWZ0S2V5IHx8IGUubWV0YUtleSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IHNob3VsZFNlbGVjdEhpc3RvcnkgPSBlLmFsdEtleSAmJiBlLmN0cmxLZXk7XG4gICAgICAgIGNvbnN0IHNob3VsZEVkaXRMYXN0TWVzc2FnZSA9ICFlLmFsdEtleSAmJiAhZS5jdHJsS2V5ICYmIHVwICYmICF0aGlzLnByb3BzLnJlcGx5VG9FdmVudDtcblxuICAgICAgICBpZiAoc2hvdWxkU2VsZWN0SGlzdG9yeSkge1xuICAgICAgICAgICAgLy8gVHJ5IHNlbGVjdCBjb21wb3NlciBoaXN0b3J5XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMuc2VsZWN0U2VuZEhpc3RvcnkodXApO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gV2UncmUgc2VsZWN0aW5nIGhpc3RvcnksIHNvIHByZXZlbnQgdGhlIGtleSBldmVudCBmcm9tIGRvaW5nIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc2hvdWxkRWRpdExhc3RNZXNzYWdlKSB7XG4gICAgICAgICAgICAvLyBzZWxlY3Rpb24gbXVzdCBiZSBjb2xsYXBzZWQgYW5kIGNhcmV0IGF0IHN0YXJ0XG4gICAgICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmLmlzU2VsZWN0aW9uQ29sbGFwc2VkKCkgJiYgdGhpcy5fZWRpdG9yUmVmLmlzQ2FyZXRBdFN0YXJ0KCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlZGl0RXZlbnQgPSBmaW5kRWRpdGFibGVFdmVudCh0aGlzLnByb3BzLnJvb20sIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBpZiAoZWRpdEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHNlbGVjdGluZyBoaXN0b3J5LCBzbyBwcmV2ZW50IHRoZSBrZXkgZXZlbnQgZnJvbSBkb2luZyBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ2VkaXRfZXZlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IGVkaXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gd2Uga2VlcCBzZW50IG1lc3NhZ2VzL2NvbW1hbmRzIGluIGEgc2VwYXJhdGUgaGlzdG9yeSAoc2VwYXJhdGUgZnJvbSB1bmRvIGhpc3RvcnkpXG4gICAgLy8gc28geW91IGNhbiBhbHQrdXAvZG93biBpbiB0aGVtXG4gICAgc2VsZWN0U2VuZEhpc3RvcnkodXApIHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSB1cCA/IC0xIDogMTtcbiAgICAgICAgLy8gVHJ1ZSBpZiB3ZSBhcmUgbm90IGN1cnJlbnRseSBzZWxlY3RpbmcgaGlzdG9yeSwgYnV0IGNvbXBvc2luZyBhIG1lc3NhZ2VcbiAgICAgICAgaWYgKHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmN1cnJlbnRJbmRleCA9PT0gdGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIuaGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFdlIGNhbid0IGdvIGFueSBmdXJ0aGVyIC0gdGhlcmUgaXNuJ3QgYW55IG1vcmUgaGlzdG9yeSwgc28gbm9wLlxuICAgICAgICAgICAgaWYgKCF1cCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuY3VycmVudGx5Q29tcG9zZWRFZGl0b3JTdGF0ZSA9IHRoaXMubW9kZWwuc2VyaWFsaXplUGFydHMoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5jdXJyZW50SW5kZXggKyBkZWx0YSA9PT0gdGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIuaGlzdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFRydWUgd2hlbiB3ZSByZXR1cm4gdG8gdGhlIG1lc3NhZ2UgYmVpbmcgY29tcG9zZWQgY3VycmVudGx5XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnJlc2V0KHRoaXMuY3VycmVudGx5Q29tcG9zZWRFZGl0b3JTdGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5jdXJyZW50SW5kZXggPSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5oaXN0b3J5Lmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7cGFydHMsIHJlcGx5RXZlbnRJZH0gPSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5nZXRJdGVtKGRlbHRhKTtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgIGV2ZW50OiByZXBseUV2ZW50SWQgPyB0aGlzLnByb3BzLnJvb20uZmluZEV2ZW50QnlJZChyZXBseUV2ZW50SWQpIDogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChwYXJ0cykge1xuICAgICAgICAgICAgdGhpcy5tb2RlbC5yZXNldChwYXJ0cyk7XG4gICAgICAgICAgICB0aGlzLl9lZGl0b3JSZWYuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9pc1NsYXNoQ29tbWFuZCgpIHtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLm1vZGVsLnBhcnRzO1xuICAgICAgICBjb25zdCBmaXJzdFBhcnQgPSBwYXJ0c1swXTtcbiAgICAgICAgaWYgKGZpcnN0UGFydCkge1xuICAgICAgICAgICAgaWYgKGZpcnN0UGFydC50eXBlID09PSBcImNvbW1hbmRcIiAmJiBmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiL1wiKSAmJiAhZmlyc3RQYXJ0LnRleHQuc3RhcnRzV2l0aChcIi8vXCIpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBiZSBleHRyYSByZXNpbGllbnQgd2hlbiBzb21laG93IHRoZSBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwgb3JcbiAgICAgICAgICAgIC8vIENvbW1hbmRQYXJ0Q3JlYXRvciBmYWlscyB0byBpbnNlcnQgYSBjb21tYW5kIHBhcnQsIHNvIHdlIGRvbid0IHNlbmRcbiAgICAgICAgICAgIC8vIGEgY29tbWFuZCBhcyBhIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmIChmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiL1wiKSAmJiAhZmlyc3RQYXJ0LnRleHQuc3RhcnRzV2l0aChcIi8vXCIpXG4gICAgICAgICAgICAgICAgJiYgKGZpcnN0UGFydC50eXBlID09PSBcInBsYWluXCIgfHwgZmlyc3RQYXJ0LnR5cGUgPT09IFwicGlsbC1jYW5kaWRhdGVcIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgX3NlbmRRdWlja1JlYWN0aW9uKCkge1xuICAgICAgICBjb25zdCB0aW1lbGluZSA9IHRoaXMucHJvcHMucm9vbS5nZXRMaXZlVGltZWxpbmUoKTtcbiAgICAgICAgY29uc3QgZXZlbnRzID0gdGltZWxpbmUuZ2V0RXZlbnRzKCk7XG4gICAgICAgIGNvbnN0IHJlYWN0aW9uID0gdGhpcy5tb2RlbC5wYXJ0c1sxXS50ZXh0O1xuICAgICAgICBmb3IgKGxldCBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRzW2ldLmdldFR5cGUoKSA9PT0gXCJtLnJvb20ubWVzc2FnZVwiKSB7XG4gICAgICAgICAgICAgICAgbGV0IHNob3VsZFJlYWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0TWVzc2FnZSA9IGV2ZW50c1tpXTtcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuZ2V0VXNlcklkKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZVJlYWN0aW9ucyA9IHRoaXMucHJvcHMucm9vbS5nZXRVbmZpbHRlcmVkVGltZWxpbmVTZXQoKVxuICAgICAgICAgICAgICAgICAgICAuZ2V0UmVsYXRpb25zRm9yRXZlbnQobGFzdE1lc3NhZ2UuZ2V0SWQoKSwgXCJtLmFubm90YXRpb25cIiwgXCJtLnJlYWN0aW9uXCIpO1xuXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgaGF2ZSBhbHJlYWR5IHNlbnQgdGhpcyByZWFjdGlvbiwgZG9uJ3QgcmVkYWN0IGJ1dCBkb24ndCByZS1zZW5kXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VSZWFjdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXlSZWFjdGlvbkV2ZW50cyA9IG1lc3NhZ2VSZWFjdGlvbnMuZ2V0QW5ub3RhdGlvbnNCeVNlbmRlcigpW3VzZXJJZF0gfHwgW107XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG15UmVhY3Rpb25LZXlzID0gWy4uLm15UmVhY3Rpb25FdmVudHNdXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGV2ZW50ID0+ICFldmVudC5pc1JlZGFjdGVkKCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKGV2ZW50ID0+IGV2ZW50LmdldFJlbGF0aW9uKCkua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZFJlYWN0ID0gIW15UmVhY3Rpb25LZXlzLmluY2x1ZGVzKHJlYWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFJlYWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIE1hdHJpeENsaWVudFBlZy5nZXQoKS5zZW5kRXZlbnQobGFzdE1lc3NhZ2UuZ2V0Um9vbUlkKCksIFwibS5yZWFjdGlvblwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWxfdHlwZVwiOiBcIm0uYW5ub3RhdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXZlbnRfaWRcIjogbGFzdE1lc3NhZ2UuZ2V0SWQoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiByZWFjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJtZXNzYWdlX3NlbnRcIn0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRTbGFzaENvbW1hbmQoKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmRUZXh0ID0gdGhpcy5tb2RlbC5wYXJ0cy5yZWR1Y2UoKHRleHQsIHBhcnQpID0+IHtcbiAgICAgICAgICAgIC8vIHVzZSBteGlkIHRvIHRleHRpZnkgdXNlciBwaWxscyBpbiBhIGNvbW1hbmRcbiAgICAgICAgICAgIGlmIChwYXJ0LnR5cGUgPT09IFwidXNlci1waWxsXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGV4dCArIHBhcnQucmVzb3VyY2VJZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0ZXh0ICsgcGFydC50ZXh0O1xuICAgICAgICB9LCBcIlwiKTtcbiAgICAgICAgcmV0dXJuIFtnZXRDb21tYW5kKHRoaXMucHJvcHMucm9vbS5yb29tSWQsIGNvbW1hbmRUZXh0KSwgY29tbWFuZFRleHRdO1xuICAgIH1cblxuICAgIGFzeW5jIF9ydW5TbGFzaENvbW1hbmQoZm4pIHtcbiAgICAgICAgY29uc3QgY21kID0gZm4oKTtcbiAgICAgICAgbGV0IGVycm9yID0gY21kLmVycm9yO1xuICAgICAgICBpZiAoY21kLnByb21pc2UpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgY21kLnByb21pc2U7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDb21tYW5kIGZhaWx1cmU6ICVzXCIsIGVycm9yKTtcbiAgICAgICAgICAgIGNvbnN0IEVycm9yRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuRXJyb3JEaWFsb2dcIik7XG4gICAgICAgICAgICAvLyBhc3N1bWUgdGhlIGVycm9yIGlzIGEgc2VydmVyIGVycm9yIHdoZW4gdGhlIGNvbW1hbmQgaXMgYXN5bmNcbiAgICAgICAgICAgIGNvbnN0IGlzU2VydmVyRXJyb3IgPSAhIWNtZC5wcm9taXNlO1xuICAgICAgICAgICAgY29uc3QgdGl0bGUgPSBpc1NlcnZlckVycm9yID8gX3RkKFwiU2VydmVyIGVycm9yXCIpIDogX3RkKFwiQ29tbWFuZCBlcnJvclwiKTtcblxuICAgICAgICAgICAgbGV0IGVyclRleHQ7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGVyclRleHQgPSBlcnJvcjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgIGVyclRleHQgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJUZXh0ID0gX3QoXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIG92ZXJsb2FkZWQsIG9yIHNvbWV0aGluZyBlbHNlIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKHRpdGxlLCAnJywgRXJyb3JEaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QodGl0bGUpLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBlcnJUZXh0LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvbW1hbmQgc3VjY2Vzcy5cIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhc3luYyBfc2VuZE1lc3NhZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLm1vZGVsLmlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBzaG91bGRTZW5kID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIWNvbnRhaW5zRW1vdGUodGhpcy5tb2RlbCkgJiYgdGhpcy5faXNTbGFzaENvbW1hbmQoKSkge1xuICAgICAgICAgICAgY29uc3QgW2NtZCwgY29tbWFuZFRleHRdID0gdGhpcy5fZ2V0U2xhc2hDb21tYW5kKCk7XG4gICAgICAgICAgICBpZiAoY21kKSB7XG4gICAgICAgICAgICAgICAgc2hvdWxkU2VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3J1blNsYXNoQ29tbWFuZChjbWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBhc2sgdGhlIHVzZXIgaWYgdGhlaXIgdW5rbm93biBjb21tYW5kIHNob3VsZCBiZSBzZW50IGFzIGEgbWVzc2FnZVxuICAgICAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICAgICAgY29uc3Qge2ZpbmlzaGVkfSA9IE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coXCJVbmtub3duIGNvbW1hbmRcIiwgXCJcIiwgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IF90KFwiVW5rbm93biBDb21tYW5kXCIpLFxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJVbnJlY29nbmlzZWQgY29tbWFuZDogJShjb21tYW5kVGV4dClzXCIsIHtjb21tYW5kVGV4dH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3UgY2FuIHVzZSA8Y29kZT4vaGVscDwvY29kZT4gdG8gbGlzdCBhdmFpbGFibGUgY29tbWFuZHMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJEaWQgeW91IG1lYW4gdG8gc2VuZCB0aGlzIGFzIGEgbWVzc2FnZT9cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogdCA9PiA8Y29kZT57IHQgfTwvY29kZT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIkhpbnQ6IEJlZ2luIHlvdXIgbWVzc2FnZSB3aXRoIDxjb2RlPi8vPC9jb2RlPiB0byBzdGFydCBpdCB3aXRoIGEgc2xhc2guXCIsIHt9LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGU6IHQgPT4gPGNvZGU+eyB0IH08L2NvZGU+LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgICAgICBidXR0b246IF90KCdTZW5kIGFzIG1lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjb25zdCBbc2VuZEFueXdheV0gPSBhd2FpdCBmaW5pc2hlZDtcbiAgICAgICAgICAgICAgICAvLyBpZiAhc2VuZEFueXdheSBiYWlsIHRvIGxldCB0aGUgdXNlciBlZGl0IHRoZSBjb21wb3NlciBhbmQgdHJ5IGFnYWluXG4gICAgICAgICAgICAgICAgaWYgKCFzZW5kQW55d2F5KSByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNRdWlja1JlYWN0aW9uKHRoaXMubW9kZWwpKSB7XG4gICAgICAgICAgICBzaG91bGRTZW5kID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl9zZW5kUXVpY2tSZWFjdGlvbigpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVwbHlUb0V2ZW50ID0gdGhpcy5wcm9wcy5yZXBseVRvRXZlbnQ7XG4gICAgICAgIGlmIChzaG91bGRTZW5kKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBDb3VudGx5QW5hbHl0aWNzLmdldFRpbWVzdGFtcCgpO1xuICAgICAgICAgICAgY29uc3Qge3Jvb21JZH0gPSB0aGlzLnByb3BzLnJvb207XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gY3JlYXRlTWVzc2FnZUNvbnRlbnQodGhpcy5tb2RlbCwgdGhpcy5wcm9wcy5wZXJtYWxpbmtDcmVhdG9yLCByZXBseVRvRXZlbnQpO1xuICAgICAgICAgICAgLy8gZG9uJ3QgYm90aGVyIHNlbmRpbmcgYW4gZW1wdHkgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKCFjb250ZW50LmJvZHkudHJpbSgpKSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IHByb20gPSB0aGlzLmNvbnRleHQuc2VuZE1lc3NhZ2Uocm9vbUlkLCBjb250ZW50KTtcbiAgICAgICAgICAgIGlmIChyZXBseVRvRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAvLyBDbGVhciByZXBseV90b19ldmVudCBhcyB3ZSBwdXQgdGhlIG1lc3NhZ2UgaW50byB0aGUgcXVldWVcbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgc2VuZCBmYWlscywgcmV0cnkgd2lsbCBoYW5kbGUgcmVzZW5kaW5nLlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJtZXNzYWdlX3NlbnRcIn0pO1xuICAgICAgICAgICAgQ0hBVF9FRkZFQ1RTLmZvckVhY2goKGVmZmVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb250YWluc0Vtb2ppKGNvbnRlbnQsIGVmZmVjdC5lbW9qaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBgZWZmZWN0cy4ke2VmZmVjdC5jb21tYW5kfWB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tTZW5kTWVzc2FnZShzdGFydFRpbWUsIHByb20sIHJvb21JZCwgZmFsc2UsICEhcmVwbHlUb0V2ZW50LCBjb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLnNhdmUodGhpcy5tb2RlbCwgcmVwbHlUb0V2ZW50KTtcbiAgICAgICAgLy8gY2xlYXIgY29tcG9zZXJcbiAgICAgICAgdGhpcy5tb2RlbC5yZXNldChbXSk7XG4gICAgICAgIHRoaXMuX2VkaXRvclJlZi5jbGVhclVuZG9IaXN0b3J5KCk7XG4gICAgICAgIHRoaXMuX2VkaXRvclJlZi5mb2N1cygpO1xuICAgICAgICB0aGlzLl9jbGVhclN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcInNjcm9sbF90b19ib3R0b21cIn0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkaXMudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoZXJSZWYpO1xuICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLl9zYXZlU3RvcmVkRWRpdG9yU3RhdGUpO1xuICAgICAgICB0aGlzLl9zYXZlU3RvcmVkRWRpdG9yU3RhdGUoKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBbUkVBQ1QtV0FSTklOR10gTW92ZSB0aGlzIHRvIGNvbnN0cnVjdG9yXG4gICAgVU5TQUZFX2NvbXBvbmVudFdpbGxNb3VudCgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBjYW1lbGNhc2VcbiAgICAgICAgY29uc3QgcGFydENyZWF0b3IgPSBuZXcgQ29tbWFuZFBhcnRDcmVhdG9yKHRoaXMucHJvcHMucm9vbSwgdGhpcy5jb250ZXh0KTtcbiAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLl9yZXN0b3JlU3RvcmVkRWRpdG9yU3RhdGUocGFydENyZWF0b3IpIHx8IFtdO1xuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IEVkaXRvck1vZGVsKHBhcnRzLCBwYXJ0Q3JlYXRvcik7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hlclJlZiA9IGRpcy5yZWdpc3Rlcih0aGlzLm9uQWN0aW9uKTtcbiAgICAgICAgdGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIgPSBuZXcgU2VuZEhpc3RvcnlNYW5hZ2VyKHRoaXMucHJvcHMucm9vbS5yb29tSWQsICdteF9jaWRlcl9oaXN0b3J5XycpO1xuICAgIH1cblxuICAgIGdldCBfZWRpdG9yU3RhdGVLZXkoKSB7XG4gICAgICAgIHJldHVybiBgbXhfY2lkZXJfc3RhdGVfJHt0aGlzLnByb3BzLnJvb20ucm9vbUlkfWA7XG4gICAgfVxuXG4gICAgX2NsZWFyU3RvcmVkRWRpdG9yU3RhdGUoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2VkaXRvclN0YXRlS2V5KTtcbiAgICB9XG5cbiAgICBfcmVzdG9yZVN0b3JlZEVkaXRvclN0YXRlKHBhcnRDcmVhdG9yKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9lZGl0b3JTdGF0ZUtleSk7XG4gICAgICAgIGlmIChqc29uKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtwYXJ0czogc2VyaWFsaXplZFBhcnRzLCByZXBseUV2ZW50SWR9ID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwYXJ0cyA9IHNlcmlhbGl6ZWRQYXJ0cy5tYXAocCA9PiBwYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBseUV2ZW50SWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50OiB0aGlzLnByb3BzLnJvb20uZmluZEV2ZW50QnlJZChyZXBseUV2ZW50SWQpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnRzO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfc2F2ZVN0b3JlZEVkaXRvclN0YXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5tb2RlbC5pc0VtcHR5KSB7XG4gICAgICAgICAgICB0aGlzLl9jbGVhclN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtID0gU2VuZEhpc3RvcnlNYW5hZ2VyLmNyZWF0ZUl0ZW0odGhpcy5tb2RlbCwgdGhpcy5wcm9wcy5yZXBseVRvRXZlbnQpO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5fZWRpdG9yU3RhdGVLZXksIEpTT04uc3RyaW5naWZ5KGl0ZW0pKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQWN0aW9uID0gKHBheWxvYWQpID0+IHtcbiAgICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAncmVwbHlfdG9fZXZlbnQnOlxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRm9jdXNDb21wb3NlcjpcbiAgICAgICAgICAgICAgICB0aGlzLl9lZGl0b3JSZWYgJiYgdGhpcy5fZWRpdG9yUmVmLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbnNlcnRfbWVudGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5faW5zZXJ0TWVudGlvbihwYXlsb2FkLnVzZXJfaWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncXVvdGUnOlxuICAgICAgICAgICAgICAgIHRoaXMuX2luc2VydFF1b3RlZE1lc3NhZ2UocGF5bG9hZC5ldmVudCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpbnNlcnRfZW1vamknOlxuICAgICAgICAgICAgICAgIHRoaXMuX2luc2VydEVtb2ppKHBheWxvYWQuZW1vamkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIF9pbnNlcnRNZW50aW9uKHVzZXJJZCkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICBjb25zdCBtZW1iZXIgPSB0aGlzLnByb3BzLnJvb20uZ2V0TWVtYmVyKHVzZXJJZCk7XG4gICAgICAgIGNvbnN0IGRpc3BsYXlOYW1lID0gbWVtYmVyID9cbiAgICAgICAgICAgIG1lbWJlci5yYXdEaXNwbGF5TmFtZSA6IHVzZXJJZDtcbiAgICAgICAgY29uc3QgY2FyZXQgPSB0aGlzLl9lZGl0b3JSZWYuZ2V0Q2FyZXQoKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBtb2RlbC5wb3NpdGlvbkZvck9mZnNldChjYXJldC5vZmZzZXQsIGNhcmV0LmF0Tm9kZUVuZCk7XG4gICAgICAgIC8vIGluZGV4IGlzIC0xIGlmIHRoZXJlIGFyZSBubyBwYXJ0cyBidXQgd2Ugb25seSBjYXJlIGZvciBpZiB0aGlzIHdvdWxkIGJlIHRoZSBwYXJ0IGluIHBvc2l0aW9uIDBcbiAgICAgICAgY29uc3QgaW5zZXJ0SW5kZXggPSBwb3NpdGlvbi5pbmRleCA+IDAgPyBwb3NpdGlvbi5pbmRleCA6IDA7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gcGFydENyZWF0b3IuY3JlYXRlTWVudGlvblBhcnRzKGluc2VydEluZGV4LCBkaXNwbGF5TmFtZSwgdXNlcklkKTtcbiAgICAgICAgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkTGVuID0gbW9kZWwuaW5zZXJ0KHBhcnRzLCBwb3NpdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gcmVmb2N1cyBvbiBjb21wb3NlciwgYXMgd2UganVzdCBjbGlja2VkIFwiTWVudGlvblwiXG4gICAgICAgIHRoaXMuX2VkaXRvclJlZiAmJiB0aGlzLl9lZGl0b3JSZWYuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBfaW5zZXJ0UXVvdGVkTWVzc2FnZShldmVudCkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICBjb25zdCBxdW90ZVBhcnRzID0gcGFyc2VFdmVudChldmVudCwgcGFydENyZWF0b3IsIHsgaXNRdW90ZWRNZXNzYWdlOiB0cnVlIH0pO1xuICAgICAgICAvLyBhZGQgdHdvIG5ld2xpbmVzXG4gICAgICAgIHF1b3RlUGFydHMucHVzaChwYXJ0Q3JlYXRvci5uZXdsaW5lKCkpO1xuICAgICAgICBxdW90ZVBhcnRzLnB1c2gocGFydENyZWF0b3IubmV3bGluZSgpKTtcbiAgICAgICAgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkTGVuID0gbW9kZWwuaW5zZXJ0KHF1b3RlUGFydHMsIG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KDApKTtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5wb3NpdGlvbkZvck9mZnNldChhZGRlZExlbiwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyByZWZvY3VzIG9uIGNvbXBvc2VyLCBhcyB3ZSBqdXN0IGNsaWNrZWQgXCJRdW90ZVwiXG4gICAgICAgIHRoaXMuX2VkaXRvclJlZiAmJiB0aGlzLl9lZGl0b3JSZWYuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBfaW5zZXJ0RW1vamkgPSAoZW1vamkpID0+IHtcbiAgICAgICAgY29uc3Qge21vZGVsfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtwYXJ0Q3JlYXRvcn0gPSBtb2RlbDtcbiAgICAgICAgY29uc3QgY2FyZXQgPSB0aGlzLl9lZGl0b3JSZWYuZ2V0Q2FyZXQoKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBtb2RlbC5wb3NpdGlvbkZvck9mZnNldChjYXJldC5vZmZzZXQsIGNhcmV0LmF0Tm9kZUVuZCk7XG4gICAgICAgIG1vZGVsLnRyYW5zZm9ybSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IG1vZGVsLmluc2VydChbcGFydENyZWF0b3IucGxhaW4oZW1vamkpXSwgcG9zaXRpb24pO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCArIGFkZGVkTGVuLCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vblBhc3RlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IHtjbGlwYm9hcmREYXRhfSA9IGV2ZW50O1xuICAgICAgICAvLyBQcmlvcml0aXplIHRleHQgb24gdGhlIGNsaXBib2FyZCBvdmVyIGZpbGVzIGFzIE9mZmljZSBvbiBtYWNPUyBwdXRzIGEgYml0bWFwXG4gICAgICAgIC8vIGluIHRoZSBjbGlwYm9hcmQgYXMgd2VsbCBhcyB0aGUgY29udGVudCBiZWluZyBjb3BpZWQuXG4gICAgICAgIGlmIChjbGlwYm9hcmREYXRhLmZpbGVzLmxlbmd0aCAmJiAhY2xpcGJvYXJkRGF0YS50eXBlcy5zb21lKHQgPT4gdCA9PT0gXCJ0ZXh0L3BsYWluXCIpKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGFjdHVhbGx5IG5vdCBzbyBtdWNoIGZvciAnZmlsZXMnIGFzIHN1Y2ggKGF0IHRpbWUgb2Ygd3JpdGluZ1xuICAgICAgICAgICAgLy8gbmVpdGhlciBjaHJvbWUgbm9yIGZpcmVmb3ggbGV0IHlvdSBwYXN0ZSBhIHBsYWluIGZpbGUgY29waWVkXG4gICAgICAgICAgICAvLyBmcm9tIEZpbmRlcikgYnV0IG1vcmUgaW1hZ2VzIGNvcGllZCBmcm9tIGEgZGlmZmVyZW50IHdlYnNpdGVcbiAgICAgICAgICAgIC8vIC8gd29yZCBwcm9jZXNzb3IgZXRjLlxuICAgICAgICAgICAgQ29udGVudE1lc3NhZ2VzLnNoYXJlZEluc3RhbmNlKCkuc2VuZENvbnRlbnRMaXN0VG9Sb29tKFxuICAgICAgICAgICAgICAgIEFycmF5LmZyb20oY2xpcGJvYXJkRGF0YS5maWxlcyksIHRoaXMucHJvcHMucm9vbS5yb29tSWQsIHRoaXMuY29udGV4dCxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gdG8gc2tpcCBpbnRlcm5hbCBvblBhc3RlIGhhbmRsZXJcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfU2VuZE1lc3NhZ2VDb21wb3NlclwiIG9uQ2xpY2s9e3RoaXMuZm9jdXNDb21wb3Nlcn0gb25LZXlEb3duPXt0aGlzLl9vbktleURvd259PlxuICAgICAgICAgICAgICAgIDxCYXNpY01lc3NhZ2VDb21wb3NlclxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3NldEVkaXRvclJlZn1cbiAgICAgICAgICAgICAgICAgICAgbW9kZWw9e3RoaXMubW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICAgICAgICBvblBhc3RlPXt0aGlzLl9vblBhc3RlfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=