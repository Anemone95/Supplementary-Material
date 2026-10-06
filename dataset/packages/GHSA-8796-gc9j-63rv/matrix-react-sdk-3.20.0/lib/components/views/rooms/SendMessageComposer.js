"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _ratelimitedfunc = _interopRequireDefault(require("../../../ratelimitedfunc"));

var _actions = require("../../../dispatcher/actions");

var _utils = require("../../../effects/utils");

var _effects = require("../../../effects");

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _MatrixClientPeg = require("../../../MatrixClientPeg");

var _emojibaseRegex = _interopRequireDefault(require("emojibase-regex"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _dec, _class, _class2, _temp;

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

let SendMessageComposer = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.SendMessageComposer"), _dec(_class = (_temp = _class2 = class SendMessageComposer extends _react.default.Component {
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

      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getMessageComposerAction(event);

      switch (action) {
        case _KeyBindingsManager.MessageComposerAction.Send:
          this._sendMessage();

          event.preventDefault();
          break;

        case _KeyBindingsManager.MessageComposerAction.SelectPrevSendHistory:
        case _KeyBindingsManager.MessageComposerAction.SelectNextSendHistory:
          {
            // Try select composer history
            const selected = this.selectSendHistory(action === _KeyBindingsManager.MessageComposerAction.SelectPrevSendHistory);

            if (selected) {
              // We're selecting history, so prevent the key event from doing anything else
              event.preventDefault();
            }

            break;
          }

        case _KeyBindingsManager.MessageComposerAction.EditPrevMessage:
          // selection must be collapsed and caret at start
          if (this._editorRef.isSelectionCollapsed() && this._editorRef.isCaretAtStart()) {
            const editEvent = (0, _EventUtils.findEditableEvent)(this.props.room, false);

            if (editEvent) {
              // We're selecting history, so prevent the key event from doing anything else
              event.preventDefault();

              _dispatcher.default.dispatch({
                action: 'edit_event',
                event: editEvent
              });
            }
          }

          break;

        case _KeyBindingsManager.MessageComposerAction.CancelEditing:
          _dispatcher.default.dispatch({
            action: 'reply_to_event',
            event: null
          });

          break;

        default:
          if (this._prepareToEncrypt) {
            // This needs to be last!
            this._prepareToEncrypt();
          }

      }
    });
    (0, _defineProperty2.default)(this, "_shouldSaveStoredEditorState", () => {
      return !this.model.isEmpty || this.props.replyToEvent;
    });
    (0, _defineProperty2.default)(this, "_saveStoredEditorState", () => {
      if (this._shouldSaveStoredEditorState()) {
        const item = _SendHistoryManager.default.createItem(this.model, this.props.replyToEvent);

        localStorage.setItem(this._editorStateKey, JSON.stringify(item));
      } else {
        this._clearStoredEditorState();
      }
    });
    (0, _defineProperty2.default)(this, "onAction", payload => {
      // don't let the user into the composer if it is disabled - all of these branches lead
      // to the cursor being in the composer
      if (this.props.disabled) return;

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
    (0, _defineProperty2.default)(this, "onChange", () => {
      if (this.props.onChange) this.props.onChange(this.model);
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

  // we keep sent messages/commands in a separate history (separate from undo history)
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
    const {
      cmd,
      args
    } = (0, _SlashCommands.getCommand)(commandText);
    return [cmd, args, commandText];
  }

  async _runSlashCommand(cmd, args) {
    const result = cmd.run(this.props.room.roomId, args);
    let messageContent;
    let error = result.error;

    if (result.promise) {
      try {
        if (cmd.category === _SlashCommands.CommandCategories.messages) {
          // The command returns a modified message that we need to pass on
          messageContent = await result.promise;
        } else {
          await result.promise;
        }
      } catch (err) {
        error = err;
      }
    }

    if (error) {
      console.error("Command failure: %s", error);
      const ErrorDialog = sdk.getComponent("dialogs.ErrorDialog"); // assume the error is a server error when the command is async

      const isServerError = !!result.promise;
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
      if (messageContent) return messageContent;
    }
  }

  async _sendMessage() {
    if (this.model.isEmpty) {
      return;
    }

    const replyToEvent = this.props.replyToEvent;
    let shouldSend = true;
    let content;

    if (!(0, _serialize.containsEmote)(this.model) && this._isSlashCommand()) {
      const [cmd, args, commandText] = this._getSlashCommand();

      if (cmd) {
        if (cmd.category === _SlashCommands.CommandCategories.messages) {
          content = await this._runSlashCommand(cmd, args);

          if (replyToEvent) {
            addReplyToMessageContent(content, replyToEvent, this.props.permalinkCreator);
          }
        } else {
          this._runSlashCommand(cmd, args);

          shouldSend = false;
        }
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

    if (shouldSend) {
      const startTime = _CountlyAnalytics.default.getTimestamp();

      const {
        roomId
      } = this.props.room;

      if (!content) {
        content = createMessageContent(this.model, this.props.permalinkCreator, replyToEvent);
      } // don't bother sending an empty message


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

    if (_SettingsStore.default.getValue("scrollToBottomOnMessageSent")) {
      _dispatcher.default.dispatch({
        action: "scroll_to_bottom"
      });
    }
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
  } // should save state when editor has contents or reply is open


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

    const position = model.positionForOffset(caret.offset, caret.atNodeEnd); // Insert suffix only if the caret is at the start of the composer

    const parts = partCreator.createMentionParts(caret.offset === 0, displayName, userId);
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
      onChange: this.onChange,
      ref: this._setEditorRef,
      model: this.model,
      room: this.props.room,
      label: this.props.placeholder,
      placeholder: this.props.placeholder,
      onPaste: this._onPaste,
      disabled: this.props.disabled
    }));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  room: _propTypes.default.object.isRequired,
  placeholder: _propTypes.default.string,
  permalinkCreator: _propTypes.default.object.isRequired,
  replyToEvent: _propTypes.default.object,
  onChange: _propTypes.default.func,
  disabled: _propTypes.default.bool
}), (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = SendMessageComposer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL1NlbmRNZXNzYWdlQ29tcG9zZXIuanMiXSwibmFtZXMiOlsiYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50IiwiY29udGVudCIsInJlcGxpZWRUb0V2ZW50IiwicGVybWFsaW5rQ3JlYXRvciIsInJlcGx5Q29udGVudCIsIlJlcGx5VGhyZWFkIiwibWFrZVJlcGx5TWl4SW4iLCJPYmplY3QiLCJhc3NpZ24iLCJuZXN0ZWRSZXBseSIsImdldE5lc3RlZFJlcGx5VGV4dCIsImZvcm1hdHRlZF9ib2R5IiwiaHRtbCIsImJvZHkiLCJjcmVhdGVNZXNzYWdlQ29udGVudCIsIm1vZGVsIiwicmVwbHlUb0V2ZW50IiwiaXNFbW90ZSIsIm1zZ3R5cGUiLCJmb3JtYXR0ZWRCb2R5IiwiZm9yY2VIVE1MIiwiZm9ybWF0IiwiaXNRdWlja1JlYWN0aW9uIiwicGFydHMiLCJsZW5ndGgiLCJ0ZXh0IiwiaGFzU2hvcnRjdXQiLCJzdGFydHNXaXRoIiwiZW1vamlNYXRjaCIsIm1hdGNoIiwiRU1PSklfUkVHRVgiLCJzdWJzdHJpbmciLCJTZW5kTWVzc2FnZUNvbXBvc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJlZiIsIl9lZGl0b3JSZWYiLCJldmVudCIsImlzQ29tcG9zaW5nIiwiYWN0aW9uIiwiZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uIiwiTWVzc2FnZUNvbXBvc2VyQWN0aW9uIiwiU2VuZCIsIl9zZW5kTWVzc2FnZSIsInByZXZlbnREZWZhdWx0IiwiU2VsZWN0UHJldlNlbmRIaXN0b3J5IiwiU2VsZWN0TmV4dFNlbmRIaXN0b3J5Iiwic2VsZWN0ZWQiLCJzZWxlY3RTZW5kSGlzdG9yeSIsIkVkaXRQcmV2TWVzc2FnZSIsImlzU2VsZWN0aW9uQ29sbGFwc2VkIiwiaXNDYXJldEF0U3RhcnQiLCJlZGl0RXZlbnQiLCJyb29tIiwiZGlzIiwiZGlzcGF0Y2giLCJDYW5jZWxFZGl0aW5nIiwiX3ByZXBhcmVUb0VuY3J5cHQiLCJpc0VtcHR5IiwiX3Nob3VsZFNhdmVTdG9yZWRFZGl0b3JTdGF0ZSIsIml0ZW0iLCJTZW5kSGlzdG9yeU1hbmFnZXIiLCJjcmVhdGVJdGVtIiwibG9jYWxTdG9yYWdlIiwic2V0SXRlbSIsIl9lZGl0b3JTdGF0ZUtleSIsIkpTT04iLCJzdHJpbmdpZnkiLCJfY2xlYXJTdG9yZWRFZGl0b3JTdGF0ZSIsInBheWxvYWQiLCJkaXNhYmxlZCIsIkFjdGlvbiIsIkZvY3VzQ29tcG9zZXIiLCJmb2N1cyIsIl9pbnNlcnRNZW50aW9uIiwidXNlcl9pZCIsIl9pbnNlcnRRdW90ZWRNZXNzYWdlIiwiX2luc2VydEVtb2ppIiwiZW1vamkiLCJwYXJ0Q3JlYXRvciIsImNhcmV0IiwiZ2V0Q2FyZXQiLCJwb3NpdGlvbiIsInBvc2l0aW9uRm9yT2Zmc2V0Iiwib2Zmc2V0IiwiYXROb2RlRW5kIiwidHJhbnNmb3JtIiwiYWRkZWRMZW4iLCJpbnNlcnQiLCJwbGFpbiIsImNsaXBib2FyZERhdGEiLCJmaWxlcyIsInR5cGVzIiwic29tZSIsInQiLCJDb250ZW50TWVzc2FnZXMiLCJzaGFyZWRJbnN0YW5jZSIsInNlbmRDb250ZW50TGlzdFRvUm9vbSIsIkFycmF5IiwiZnJvbSIsInJvb21JZCIsIm9uQ2hhbmdlIiwiY3VycmVudGx5Q29tcG9zZWRFZGl0b3JTdGF0ZSIsImlzQ3J5cHRvRW5hYmxlZCIsImlzUm9vbUVuY3J5cHRlZCIsIlJhdGVMaW1pdGVkRnVuYyIsInByZXBhcmVUb0VuY3J5cHQiLCJ3aW5kb3ciLCJhZGRFdmVudExpc3RlbmVyIiwiX3NhdmVTdG9yZWRFZGl0b3JTdGF0ZSIsInVwIiwiZGVsdGEiLCJzZW5kSGlzdG9yeU1hbmFnZXIiLCJjdXJyZW50SW5kZXgiLCJoaXN0b3J5Iiwic2VyaWFsaXplUGFydHMiLCJyZXNldCIsInJlcGx5RXZlbnRJZCIsImdldEl0ZW0iLCJmaW5kRXZlbnRCeUlkIiwiX2lzU2xhc2hDb21tYW5kIiwiZmlyc3RQYXJ0IiwidHlwZSIsIl9zZW5kUXVpY2tSZWFjdGlvbiIsInRpbWVsaW5lIiwiZ2V0TGl2ZVRpbWVsaW5lIiwiZXZlbnRzIiwiZ2V0RXZlbnRzIiwicmVhY3Rpb24iLCJpIiwiZ2V0VHlwZSIsInNob3VsZFJlYWN0IiwibGFzdE1lc3NhZ2UiLCJ1c2VySWQiLCJNYXRyaXhDbGllbnRQZWciLCJnZXQiLCJnZXRVc2VySWQiLCJtZXNzYWdlUmVhY3Rpb25zIiwiZ2V0VW5maWx0ZXJlZFRpbWVsaW5lU2V0IiwiZ2V0UmVsYXRpb25zRm9yRXZlbnQiLCJnZXRJZCIsIm15UmVhY3Rpb25FdmVudHMiLCJnZXRBbm5vdGF0aW9uc0J5U2VuZGVyIiwibXlSZWFjdGlvbktleXMiLCJmaWx0ZXIiLCJpc1JlZGFjdGVkIiwibWFwIiwiZ2V0UmVsYXRpb24iLCJrZXkiLCJpbmNsdWRlcyIsInNlbmRFdmVudCIsImdldFJvb21JZCIsIl9nZXRTbGFzaENvbW1hbmQiLCJjb21tYW5kVGV4dCIsInJlZHVjZSIsInBhcnQiLCJyZXNvdXJjZUlkIiwiY21kIiwiYXJncyIsIl9ydW5TbGFzaENvbW1hbmQiLCJyZXN1bHQiLCJydW4iLCJtZXNzYWdlQ29udGVudCIsImVycm9yIiwicHJvbWlzZSIsImNhdGVnb3J5IiwiQ29tbWFuZENhdGVnb3JpZXMiLCJtZXNzYWdlcyIsImVyciIsImNvbnNvbGUiLCJFcnJvckRpYWxvZyIsInNkayIsImdldENvbXBvbmVudCIsImlzU2VydmVyRXJyb3IiLCJ0aXRsZSIsImVyclRleHQiLCJtZXNzYWdlIiwiTW9kYWwiLCJjcmVhdGVUcmFja2VkRGlhbG9nIiwiZGVzY3JpcHRpb24iLCJsb2ciLCJzaG91bGRTZW5kIiwiUXVlc3Rpb25EaWFsb2ciLCJmaW5pc2hlZCIsImNvZGUiLCJidXR0b24iLCJzZW5kQW55d2F5Iiwic3RhcnRUaW1lIiwiQ291bnRseUFuYWx5dGljcyIsImdldFRpbWVzdGFtcCIsInRyaW0iLCJwcm9tIiwic2VuZE1lc3NhZ2UiLCJDSEFUX0VGRkVDVFMiLCJmb3JFYWNoIiwiZWZmZWN0IiwiZW1vamlzIiwiY29tbWFuZCIsImluc3RhbmNlIiwidHJhY2tTZW5kTWVzc2FnZSIsInNhdmUiLCJjbGVhclVuZG9IaXN0b3J5IiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJ1bnJlZ2lzdGVyIiwiZGlzcGF0Y2hlclJlZiIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJVTlNBRkVfY29tcG9uZW50V2lsbE1vdW50IiwiQ29tbWFuZFBhcnRDcmVhdG9yIiwiX3Jlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZSIsIkVkaXRvck1vZGVsIiwicmVnaXN0ZXIiLCJvbkFjdGlvbiIsInJlbW92ZUl0ZW0iLCJqc29uIiwic2VyaWFsaXplZFBhcnRzIiwicGFyc2UiLCJwIiwiZGVzZXJpYWxpemVQYXJ0IiwiZSIsIm1lbWJlciIsImdldE1lbWJlciIsImRpc3BsYXlOYW1lIiwicmF3RGlzcGxheU5hbWUiLCJjcmVhdGVNZW50aW9uUGFydHMiLCJxdW90ZVBhcnRzIiwiaXNRdW90ZWRNZXNzYWdlIiwicHVzaCIsIm5ld2xpbmUiLCJyZW5kZXIiLCJmb2N1c0NvbXBvc2VyIiwiX29uS2V5RG93biIsIl9zZXRFZGl0b3JSZWYiLCJwbGFjZWhvbGRlciIsIl9vblBhc3RlIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsInN0cmluZyIsImZ1bmMiLCJib29sIiwiTWF0cml4Q2xpZW50Q29udGV4dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQVNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsU0FBU0Esd0JBQVQsQ0FBa0NDLE9BQWxDLEVBQTJDQyxjQUEzQyxFQUEy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QkFBRDtBQUNJLE1BQUEsUUFBUSxFQUFFLEtBQUtuSSxRQURuQjtBQUVJLE1BQUEsR0FBRyxFQUFFLEtBQUtvSSxhQUZkO0FBR0ksTUFBQSxLQUFLLEVBQUUsS0FBSzdOLEtBSGhCO0FBSUksTUFBQSxJQUFJLEVBQUUsS0FBS3FCLEtBQUwsQ0FBV29CLElBSnJCO0FBS0ksTUFBQSxLQUFLLEVBQUUsS0FBS3BCLEtBQUwsQ0FBV3lNLFdBTHRCO0FBTUksTUFBQSxXQUFXLEVBQUUsS0FBS3pNLEtBQUwsQ0FBV3lNLFdBTjVCO0FBT0ksTUFBQSxPQUFPLEVBQUUsS0FBS0MsUUFQbEI7QUFRSSxNQUFBLFFBQVEsRUFBRSxLQUFLMU0sS0FBTCxDQUFXcUM7QUFSekIsTUFESixDQURKO0FBY0g7O0FBaGQ0RCxDLHNEQUMxQztBQUNmakIsRUFBQUEsSUFBSSxFQUFFdUwsbUJBQVVDLE1BQVYsQ0FBaUJDLFVBRFI7QUFFZkosRUFBQUEsV0FBVyxFQUFFRSxtQkFBVUcsTUFGUjtBQUdmL08sRUFBQUEsZ0JBQWdCLEVBQUU0TyxtQkFBVUMsTUFBVixDQUFpQkMsVUFIcEI7QUFJZmpPLEVBQUFBLFlBQVksRUFBRStOLG1CQUFVQyxNQUpUO0FBS2Z4SSxFQUFBQSxRQUFRLEVBQUV1SSxtQkFBVUksSUFMTDtBQU1mMUssRUFBQUEsUUFBUSxFQUFFc0ssbUJBQVVLO0FBTkwsQyx5REFTRUMsNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IEVkaXRvck1vZGVsIGZyb20gJy4uLy4uLy4uL2VkaXRvci9tb2RlbCc7XG5pbXBvcnQge1xuICAgIGh0bWxTZXJpYWxpemVJZk5lZWRlZCxcbiAgICB0ZXh0U2VyaWFsaXplLFxuICAgIGNvbnRhaW5zRW1vdGUsXG4gICAgc3RyaXBFbW90ZUNvbW1hbmQsXG4gICAgdW5lc2NhcGVNZXNzYWdlLFxuICAgIHN0YXJ0c1dpdGgsXG4gICAgc3RyaXBQcmVmaXgsXG59IGZyb20gJy4uLy4uLy4uL2VkaXRvci9zZXJpYWxpemUnO1xuaW1wb3J0IHtDb21tYW5kUGFydENyZWF0b3J9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQgQmFzaWNNZXNzYWdlQ29tcG9zZXIgZnJvbSBcIi4vQmFzaWNNZXNzYWdlQ29tcG9zZXJcIjtcbmltcG9ydCBSZXBseVRocmVhZCBmcm9tIFwiLi4vZWxlbWVudHMvUmVwbHlUaHJlYWRcIjtcbmltcG9ydCB7cGFyc2VFdmVudH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2Rlc2VyaWFsaXplJztcbmltcG9ydCB7ZmluZEVkaXRhYmxlRXZlbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL0V2ZW50VXRpbHMnO1xuaW1wb3J0IFNlbmRIaXN0b3J5TWFuYWdlciBmcm9tIFwiLi4vLi4vLi4vU2VuZEhpc3RvcnlNYW5hZ2VyXCI7XG5pbXBvcnQge0NvbW1hbmRDYXRlZ29yaWVzLCBnZXRDb21tYW5kfSBmcm9tICcuLi8uLi8uLi9TbGFzaENvbW1hbmRzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IHtfdCwgX3RkfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0IENvbnRlbnRNZXNzYWdlcyBmcm9tICcuLi8uLi8uLi9Db250ZW50TWVzc2FnZXMnO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCBSYXRlTGltaXRlZEZ1bmMgZnJvbSAnLi4vLi4vLi4vcmF0ZWxpbWl0ZWRmdW5jJztcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQge2NvbnRhaW5zRW1vaml9IGZyb20gXCIuLi8uLi8uLi9lZmZlY3RzL3V0aWxzXCI7XG5pbXBvcnQge0NIQVRfRUZGRUNUU30gZnJvbSAnLi4vLi4vLi4vZWZmZWN0cyc7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHtNYXRyaXhDbGllbnRQZWd9IGZyb20gXCIuLi8uLi8uLi9NYXRyaXhDbGllbnRQZWdcIjtcbmltcG9ydCBFTU9KSV9SRUdFWCBmcm9tICdlbW9qaWJhc2UtcmVnZXgnO1xuaW1wb3J0IHtnZXRLZXlCaW5kaW5nc01hbmFnZXIsIE1lc3NhZ2VDb21wb3NlckFjdGlvbn0gZnJvbSAnLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSAnLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZSc7XG5cbmZ1bmN0aW9uIGFkZFJlcGx5VG9NZXNzYWdlQ29udGVudChjb250ZW50LCByZXBsaWVkVG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcikge1xuICAgIGNvbnN0IHJlcGx5Q29udGVudCA9IFJlcGx5VGhyZWFkLm1ha2VSZXBseU1peEluKHJlcGxpZWRUb0V2ZW50KTtcbiAgICBPYmplY3QuYXNzaWduKGNvbnRlbnQsIHJlcGx5Q29udGVudCk7XG5cbiAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydCAtIHByZXBlbmQgdGhlIHRleHQgd2UncmUgc2VuZGluZ1xuICAgIC8vIHdpdGggdGhlIHRleHQgd2UncmUgcmVwbHlpbmcgdG9cbiAgICBjb25zdCBuZXN0ZWRSZXBseSA9IFJlcGx5VGhyZWFkLmdldE5lc3RlZFJlcGx5VGV4dChyZXBsaWVkVG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcik7XG4gICAgaWYgKG5lc3RlZFJlcGx5KSB7XG4gICAgICAgIGlmIChjb250ZW50LmZvcm1hdHRlZF9ib2R5KSB7XG4gICAgICAgICAgICBjb250ZW50LmZvcm1hdHRlZF9ib2R5ID0gbmVzdGVkUmVwbHkuaHRtbCArIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGVudC5ib2R5ID0gbmVzdGVkUmVwbHkuYm9keSArIGNvbnRlbnQuYm9keTtcbiAgICB9XG59XG5cbi8vIGV4cG9ydGVkIGZvciB0ZXN0c1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VDb250ZW50KG1vZGVsLCBwZXJtYWxpbmtDcmVhdG9yLCByZXBseVRvRXZlbnQpIHtcbiAgICBjb25zdCBpc0Vtb3RlID0gY29udGFpbnNFbW90ZShtb2RlbCk7XG4gICAgaWYgKGlzRW1vdGUpIHtcbiAgICAgICAgbW9kZWwgPSBzdHJpcEVtb3RlQ29tbWFuZChtb2RlbCk7XG4gICAgfVxuICAgIGlmIChzdGFydHNXaXRoKG1vZGVsLCBcIi8vXCIpKSB7XG4gICAgICAgIG1vZGVsID0gc3RyaXBQcmVmaXgobW9kZWwsIFwiL1wiKTtcbiAgICB9XG4gICAgbW9kZWwgPSB1bmVzY2FwZU1lc3NhZ2UobW9kZWwpO1xuXG4gICAgY29uc3QgYm9keSA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuICAgIGNvbnN0IGNvbnRlbnQgPSB7XG4gICAgICAgIG1zZ3R5cGU6IGlzRW1vdGUgPyBcIm0uZW1vdGVcIiA6IFwibS50ZXh0XCIsXG4gICAgICAgIGJvZHk6IGJvZHksXG4gICAgfTtcbiAgICBjb25zdCBmb3JtYXR0ZWRCb2R5ID0gaHRtbFNlcmlhbGl6ZUlmTmVlZGVkKG1vZGVsLCB7Zm9yY2VIVE1MOiAhIXJlcGx5VG9FdmVudH0pO1xuICAgIGlmIChmb3JtYXR0ZWRCb2R5KSB7XG4gICAgICAgIGNvbnRlbnQuZm9ybWF0ID0gXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCI7XG4gICAgICAgIGNvbnRlbnQuZm9ybWF0dGVkX2JvZHkgPSBmb3JtYXR0ZWRCb2R5O1xuICAgIH1cblxuICAgIGlmIChyZXBseVRvRXZlbnQpIHtcbiAgICAgICAgYWRkUmVwbHlUb01lc3NhZ2VDb250ZW50KGNvbnRlbnQsIHJlcGx5VG9FdmVudCwgcGVybWFsaW5rQ3JlYXRvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbnRlbnQ7XG59XG5cbi8vIGV4cG9ydGVkIGZvciB0ZXN0c1xuZXhwb3J0IGZ1bmN0aW9uIGlzUXVpY2tSZWFjdGlvbihtb2RlbCkge1xuICAgIGNvbnN0IHBhcnRzID0gbW9kZWwucGFydHM7XG4gICAgaWYgKHBhcnRzLmxlbmd0aCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3QgdGV4dCA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuICAgIC8vIHNob3J0Y3V0IHRha2VzIHRoZSBmb3JtIFwiKzplbW9qaTpcIiBvciBcIisgOmVtb2ppOlwiXCJcbiAgICAvLyBjYW4gYmUgaW4gMSBvciAyIHBhcnRzXG4gICAgaWYgKHBhcnRzLmxlbmd0aCA8PSAyKSB7XG4gICAgICAgIGNvbnN0IGhhc1Nob3J0Y3V0ID0gdGV4dC5zdGFydHNXaXRoKFwiK1wiKSB8fCB0ZXh0LnN0YXJ0c1dpdGgoXCIrIFwiKTtcbiAgICAgICAgY29uc3QgZW1vamlNYXRjaCA9IHRleHQubWF0Y2goRU1PSklfUkVHRVgpO1xuICAgICAgICBpZiAoaGFzU2hvcnRjdXQgJiYgZW1vamlNYXRjaCAmJiBlbW9qaU1hdGNoLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZW1vamlNYXRjaFswXSA9PT0gdGV4dC5zdWJzdHJpbmcoMSkgfHxcbiAgICAgICAgICAgICAgICBlbW9qaU1hdGNoWzBdID09PSB0ZXh0LnN1YnN0cmluZygyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJvb21zLlNlbmRNZXNzYWdlQ29tcG9zZXJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbmRNZXNzYWdlQ29tcG9zZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIHJvb206IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIHBlcm1hbGlua0NyZWF0b3I6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgICAgICAgcmVwbHlUb0V2ZW50OiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBvbkNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB9O1xuXG4gICAgc3RhdGljIGNvbnRleHRUeXBlID0gTWF0cml4Q2xpZW50Q29udGV4dDtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzLCBjb250ZXh0KSB7XG4gICAgICAgIHN1cGVyKHByb3BzLCBjb250ZXh0KTtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2VkaXRvclJlZiA9IG51bGw7XG4gICAgICAgIHRoaXMuY3VycmVudGx5Q29tcG9zZWRFZGl0b3JTdGF0ZSA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmNvbnRleHQuaXNDcnlwdG9FbmFibGVkKCkgJiYgdGhpcy5jb250ZXh0LmlzUm9vbUVuY3J5cHRlZCh0aGlzLnByb3BzLnJvb20ucm9vbUlkKSkge1xuICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRvRW5jcnlwdCA9IG5ldyBSYXRlTGltaXRlZEZ1bmMoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wcmVwYXJlVG9FbmNyeXB0KHRoaXMucHJvcHMucm9vbSk7XG4gICAgICAgICAgICB9LCA2MDAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImJlZm9yZXVubG9hZFwiLCB0aGlzLl9zYXZlU3RvcmVkRWRpdG9yU3RhdGUpO1xuICAgIH1cblxuICAgIF9zZXRFZGl0b3JSZWYgPSByZWYgPT4ge1xuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgPSByZWY7XG4gICAgfTtcblxuICAgIF9vbktleURvd24gPSAoZXZlbnQpID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGFueSBrZXlwcmVzcyB3aGlsZSBkb2luZyBJTUUgY29tcG9zaXRpb25zXG4gICAgICAgIGlmICh0aGlzLl9lZGl0b3JSZWYuaXNDb21wb3NpbmcoZXZlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uKGV2ZW50KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNvbXBvc2VyQWN0aW9uLlNlbmQ6XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VuZE1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uU2VsZWN0UHJldlNlbmRIaXN0b3J5OlxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uU2VsZWN0TmV4dFNlbmRIaXN0b3J5OiB7XG4gICAgICAgICAgICAgICAgLy8gVHJ5IHNlbGVjdCBjb21wb3NlciBoaXN0b3J5XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLnNlbGVjdFNlbmRIaXN0b3J5KGFjdGlvbiA9PT0gTWVzc2FnZUNvbXBvc2VyQWN0aW9uLlNlbGVjdFByZXZTZW5kSGlzdG9yeSk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHNlbGVjdGluZyBoaXN0b3J5LCBzbyBwcmV2ZW50IHRoZSBrZXkgZXZlbnQgZnJvbSBkb2luZyBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uRWRpdFByZXZNZXNzYWdlOlxuICAgICAgICAgICAgICAgIC8vIHNlbGVjdGlvbiBtdXN0IGJlIGNvbGxhcHNlZCBhbmQgY2FyZXQgYXQgc3RhcnRcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZWRpdG9yUmVmLmlzU2VsZWN0aW9uQ29sbGFwc2VkKCkgJiYgdGhpcy5fZWRpdG9yUmVmLmlzQ2FyZXRBdFN0YXJ0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZWRpdEV2ZW50ID0gZmluZEVkaXRhYmxlRXZlbnQodGhpcy5wcm9wcy5yb29tLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlZGl0RXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlJ3JlIHNlbGVjdGluZyBoaXN0b3J5LCBzbyBwcmV2ZW50IHRoZSBrZXkgZXZlbnQgZnJvbSBkb2luZyBhbnl0aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdlZGl0X2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudDogZWRpdEV2ZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDb21wb3NlckFjdGlvbi5DYW5jZWxFZGl0aW5nOlxuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJ3JlcGx5X3RvX2V2ZW50JyxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG51bGwsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wcmVwYXJlVG9FbmNyeXB0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgbmVlZHMgdG8gYmUgbGFzdCFcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJlcGFyZVRvRW5jcnlwdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyB3ZSBrZWVwIHNlbnQgbWVzc2FnZXMvY29tbWFuZHMgaW4gYSBzZXBhcmF0ZSBoaXN0b3J5IChzZXBhcmF0ZSBmcm9tIHVuZG8gaGlzdG9yeSlcbiAgICAvLyBzbyB5b3UgY2FuIGFsdCt1cC9kb3duIGluIHRoZW1cbiAgICBzZWxlY3RTZW5kSGlzdG9yeSh1cCkge1xuICAgICAgICBjb25zdCBkZWx0YSA9IHVwID8gLTEgOiAxO1xuICAgICAgICAvLyBUcnVlIGlmIHdlIGFyZSBub3QgY3VycmVudGx5IHNlbGVjdGluZyBoaXN0b3J5LCBidXQgY29tcG9zaW5nIGEgbWVzc2FnZVxuICAgICAgICBpZiAodGhpcy5zZW5kSGlzdG9yeU1hbmFnZXIuY3VycmVudEluZGV4ID09PSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5oaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gV2UgY2FuJ3QgZ28gYW55IGZ1cnRoZXIgLSB0aGVyZSBpc24ndCBhbnkgbW9yZSBoaXN0b3J5LCBzbyBub3AuXG4gICAgICAgICAgICBpZiAoIXVwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50bHlDb21wb3NlZEVkaXRvclN0YXRlID0gdGhpcy5tb2RlbC5zZXJpYWxpemVQYXJ0cygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmN1cnJlbnRJbmRleCArIGRlbHRhID09PSB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5oaXN0b3J5Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gVHJ1ZSB3aGVuIHdlIHJldHVybiB0byB0aGUgbWVzc2FnZSBiZWluZyBjb21wb3NlZCBjdXJyZW50bHlcbiAgICAgICAgICAgIHRoaXMubW9kZWwucmVzZXQodGhpcy5jdXJyZW50bHlDb21wb3NlZEVkaXRvclN0YXRlKTtcbiAgICAgICAgICAgIHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmN1cnJlbnRJbmRleCA9IHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmhpc3RvcnkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHtwYXJ0cywgcmVwbHlFdmVudElkfSA9IHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyLmdldEl0ZW0oZGVsdGEpO1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAncmVwbHlfdG9fZXZlbnQnLFxuICAgICAgICAgICAgZXZlbnQ6IHJlcGx5RXZlbnRJZCA/IHRoaXMucHJvcHMucm9vbS5maW5kRXZlbnRCeUlkKHJlcGx5RXZlbnRJZCkgOiBudWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHBhcnRzKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGVsLnJlc2V0KHBhcnRzKTtcbiAgICAgICAgICAgIHRoaXMuX2VkaXRvclJlZi5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2lzU2xhc2hDb21tYW5kKCkge1xuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMubW9kZWwucGFydHM7XG4gICAgICAgIGNvbnN0IGZpcnN0UGFydCA9IHBhcnRzWzBdO1xuICAgICAgICBpZiAoZmlyc3RQYXJ0KSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwiY29tbWFuZFwiICYmIGZpcnN0UGFydC50ZXh0LnN0YXJ0c1dpdGgoXCIvXCIpICYmICFmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiLy9cIikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGJlIGV4dHJhIHJlc2lsaWVudCB3aGVuIHNvbWVob3cgdGhlIEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbCBvclxuICAgICAgICAgICAgLy8gQ29tbWFuZFBhcnRDcmVhdG9yIGZhaWxzIHRvIGluc2VydCBhIGNvbW1hbmQgcGFydCwgc28gd2UgZG9uJ3Qgc2VuZFxuICAgICAgICAgICAgLy8gYSBjb21tYW5kIGFzIGEgbWVzc2FnZVxuICAgICAgICAgICAgaWYgKGZpcnN0UGFydC50ZXh0LnN0YXJ0c1dpdGgoXCIvXCIpICYmICFmaXJzdFBhcnQudGV4dC5zdGFydHNXaXRoKFwiLy9cIilcbiAgICAgICAgICAgICAgICAmJiAoZmlyc3RQYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fCBmaXJzdFBhcnQudHlwZSA9PT0gXCJwaWxsLWNhbmRpZGF0ZVwiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBfc2VuZFF1aWNrUmVhY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0IHRpbWVsaW5lID0gdGhpcy5wcm9wcy5yb29tLmdldExpdmVUaW1lbGluZSgpO1xuICAgICAgICBjb25zdCBldmVudHMgPSB0aW1lbGluZS5nZXRFdmVudHMoKTtcbiAgICAgICAgY29uc3QgcmVhY3Rpb24gPSB0aGlzLm1vZGVsLnBhcnRzWzFdLnRleHQ7XG4gICAgICAgIGZvciAobGV0IGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGlmIChldmVudHNbaV0uZ2V0VHlwZSgpID09PSBcIm0ucm9vbS5tZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBsZXQgc2hvdWxkUmVhY3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxhc3RNZXNzYWdlID0gZXZlbnRzW2ldO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IE1hdHJpeENsaWVudFBlZy5nZXQoKS5nZXRVc2VySWQoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlUmVhY3Rpb25zID0gdGhpcy5wcm9wcy5yb29tLmdldFVuZmlsdGVyZWRUaW1lbGluZVNldCgpXG4gICAgICAgICAgICAgICAgICAgIC5nZXRSZWxhdGlvbnNGb3JFdmVudChsYXN0TWVzc2FnZS5nZXRJZCgpLCBcIm0uYW5ub3RhdGlvblwiLCBcIm0ucmVhY3Rpb25cIik7XG5cbiAgICAgICAgICAgICAgICAvLyBpZiB3ZSBoYXZlIGFscmVhZHkgc2VudCB0aGlzIHJlYWN0aW9uLCBkb24ndCByZWRhY3QgYnV0IGRvbid0IHJlLXNlbmRcbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZVJlYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBteVJlYWN0aW9uRXZlbnRzID0gbWVzc2FnZVJlYWN0aW9ucy5nZXRBbm5vdGF0aW9uc0J5U2VuZGVyKClbdXNlcklkXSB8fCBbXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbXlSZWFjdGlvbktleXMgPSBbLi4ubXlSZWFjdGlvbkV2ZW50c11cbiAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZXZlbnQgPT4gIWV2ZW50LmlzUmVkYWN0ZWQoKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZXZlbnQgPT4gZXZlbnQuZ2V0UmVsYXRpb24oKS5rZXkpO1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRSZWFjdCA9ICFteVJlYWN0aW9uS2V5cy5pbmNsdWRlcyhyZWFjdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaG91bGRSZWFjdCkge1xuICAgICAgICAgICAgICAgICAgICBNYXRyaXhDbGllbnRQZWcuZ2V0KCkuc2VuZEV2ZW50KGxhc3RNZXNzYWdlLmdldFJvb21JZCgpLCBcIm0ucmVhY3Rpb25cIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJtLnJlbGF0ZXNfdG9cIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicmVsX3R5cGVcIjogXCJtLmFubm90YXRpb25cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImV2ZW50X2lkXCI6IGxhc3RNZXNzYWdlLmdldElkKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogcmVhY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwibWVzc2FnZV9zZW50XCJ9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0U2xhc2hDb21tYW5kKCkge1xuICAgICAgICBjb25zdCBjb21tYW5kVGV4dCA9IHRoaXMubW9kZWwucGFydHMucmVkdWNlKCh0ZXh0LCBwYXJ0KSA9PiB7XG4gICAgICAgICAgICAvLyB1c2UgbXhpZCB0byB0ZXh0aWZ5IHVzZXIgcGlsbHMgaW4gYSBjb21tYW5kXG4gICAgICAgICAgICBpZiAocGFydC50eXBlID09PSBcInVzZXItcGlsbFwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRleHQgKyBwYXJ0LnJlc291cmNlSWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGV4dCArIHBhcnQudGV4dDtcbiAgICAgICAgfSwgXCJcIik7XG4gICAgICAgIGNvbnN0IHtjbWQsIGFyZ3N9ID0gZ2V0Q29tbWFuZChjb21tYW5kVGV4dCk7XG4gICAgICAgIHJldHVybiBbY21kLCBhcmdzLCBjb21tYW5kVGV4dF07XG4gICAgfVxuXG4gICAgYXN5bmMgX3J1blNsYXNoQ29tbWFuZChjbWQsIGFyZ3MpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gY21kLnJ1bih0aGlzLnByb3BzLnJvb20ucm9vbUlkLCBhcmdzKTtcbiAgICAgICAgbGV0IG1lc3NhZ2VDb250ZW50O1xuICAgICAgICBsZXQgZXJyb3IgPSByZXN1bHQuZXJyb3I7XG4gICAgICAgIGlmIChyZXN1bHQucHJvbWlzZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoY21kLmNhdGVnb3J5ID09PSBDb21tYW5kQ2F0ZWdvcmllcy5tZXNzYWdlcykge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY29tbWFuZCByZXR1cm5zIGEgbW9kaWZpZWQgbWVzc2FnZSB0aGF0IHdlIG5lZWQgdG8gcGFzcyBvblxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlQ29udGVudCA9IGF3YWl0IHJlc3VsdC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IHJlc3VsdC5wcm9taXNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGVycm9yID0gZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvbW1hbmQgZmFpbHVyZTogJXNcIiwgZXJyb3IpO1xuICAgICAgICAgICAgY29uc3QgRXJyb3JEaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5FcnJvckRpYWxvZ1wiKTtcbiAgICAgICAgICAgIC8vIGFzc3VtZSB0aGUgZXJyb3IgaXMgYSBzZXJ2ZXIgZXJyb3Igd2hlbiB0aGUgY29tbWFuZCBpcyBhc3luY1xuICAgICAgICAgICAgY29uc3QgaXNTZXJ2ZXJFcnJvciA9ICEhcmVzdWx0LnByb21pc2U7XG4gICAgICAgICAgICBjb25zdCB0aXRsZSA9IGlzU2VydmVyRXJyb3IgPyBfdGQoXCJTZXJ2ZXIgZXJyb3JcIikgOiBfdGQoXCJDb21tYW5kIGVycm9yXCIpO1xuXG4gICAgICAgICAgICBsZXQgZXJyVGV4dDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgZXJyVGV4dCA9IGVycm9yO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgZXJyVGV4dCA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVyclRleHQgPSBfdChcIlNlcnZlciB1bmF2YWlsYWJsZSwgb3ZlcmxvYWRlZCwgb3Igc29tZXRoaW5nIGVsc2Ugd2VudCB3cm9uZy5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2codGl0bGUsICcnLCBFcnJvckRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdCh0aXRsZSksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGVyclRleHQsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ29tbWFuZCBzdWNjZXNzLlwiKTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlQ29udGVudCkgcmV0dXJuIG1lc3NhZ2VDb250ZW50O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXN5bmMgX3NlbmRNZXNzYWdlKCkge1xuICAgICAgICBpZiAodGhpcy5tb2RlbC5pc0VtcHR5KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBseVRvRXZlbnQgPSB0aGlzLnByb3BzLnJlcGx5VG9FdmVudDtcbiAgICAgICAgbGV0IHNob3VsZFNlbmQgPSB0cnVlO1xuICAgICAgICBsZXQgY29udGVudDtcblxuICAgICAgICBpZiAoIWNvbnRhaW5zRW1vdGUodGhpcy5tb2RlbCkgJiYgdGhpcy5faXNTbGFzaENvbW1hbmQoKSkge1xuICAgICAgICAgICAgY29uc3QgW2NtZCwgYXJncywgY29tbWFuZFRleHRdID0gdGhpcy5fZ2V0U2xhc2hDb21tYW5kKCk7XG4gICAgICAgICAgICBpZiAoY21kKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNtZC5jYXRlZ29yeSA9PT0gQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCA9IGF3YWl0IHRoaXMuX3J1blNsYXNoQ29tbWFuZChjbWQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRSZXBseVRvTWVzc2FnZUNvbnRlbnQoY29udGVudCwgcmVwbHlUb0V2ZW50LCB0aGlzLnByb3BzLnBlcm1hbGlua0NyZWF0b3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcnVuU2xhc2hDb21tYW5kKGNtZCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIHNob3VsZFNlbmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGFzayB0aGUgdXNlciBpZiB0aGVpciB1bmtub3duIGNvbW1hbmQgc2hvdWxkIGJlIHNlbnQgYXMgYSBtZXNzYWdlXG4gICAgICAgICAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgICAgICAgICBjb25zdCB7ZmluaXNoZWR9ID0gTW9kYWwuY3JlYXRlVHJhY2tlZERpYWxvZyhcIlVua25vd24gY29tbWFuZFwiLCBcIlwiLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJVbmtub3duIENvbW1hbmRcIiksXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIlVucmVjb2duaXNlZCBjb21tYW5kOiAlKGNvbW1hbmRUZXh0KXNcIiwge2NvbW1hbmRUZXh0fSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBfdChcIllvdSBjYW4gdXNlIDxjb2RlPi9oZWxwPC9jb2RlPiB0byBsaXN0IGF2YWlsYWJsZSBjb21tYW5kcy4gXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRpZCB5b3UgbWVhbiB0byBzZW5kIHRoaXMgYXMgYSBtZXNzYWdlP1wiLCB7fSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2RlOiB0ID0+IDxjb2RlPnsgdCB9PC9jb2RlPixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiSGludDogQmVnaW4geW91ciBtZXNzYWdlIHdpdGggPGNvZGU+Ly88L2NvZGU+IHRvIHN0YXJ0IGl0IHdpdGggYSBzbGFzaC5cIiwge30sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29kZTogdCA9PiA8Y29kZT57IHQgfTwvY29kZT4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj4sXG4gICAgICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoJ1NlbmQgYXMgbWVzc2FnZScpLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IFtzZW5kQW55d2F5XSA9IGF3YWl0IGZpbmlzaGVkO1xuICAgICAgICAgICAgICAgIC8vIGlmICFzZW5kQW55d2F5IGJhaWwgdG8gbGV0IHRoZSB1c2VyIGVkaXQgdGhlIGNvbXBvc2VyIGFuZCB0cnkgYWdhaW5cbiAgICAgICAgICAgICAgICBpZiAoIXNlbmRBbnl3YXkpIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc1F1aWNrUmVhY3Rpb24odGhpcy5tb2RlbCkpIHtcbiAgICAgICAgICAgIHNob3VsZFNlbmQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuX3NlbmRRdWlja1JlYWN0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2hvdWxkU2VuZCkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHtyb29tSWR9ID0gdGhpcy5wcm9wcy5yb29tO1xuICAgICAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgY29udGVudCA9IGNyZWF0ZU1lc3NhZ2VDb250ZW50KHRoaXMubW9kZWwsIHRoaXMucHJvcHMucGVybWFsaW5rQ3JlYXRvciwgcmVwbHlUb0V2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGRvbid0IGJvdGhlciBzZW5kaW5nIGFuIGVtcHR5IG1lc3NhZ2VcbiAgICAgICAgICAgIGlmICghY29udGVudC5ib2R5LnRyaW0oKSkgcmV0dXJuO1xuXG4gICAgICAgICAgICBjb25zdCBwcm9tID0gdGhpcy5jb250ZXh0LnNlbmRNZXNzYWdlKHJvb21JZCwgY29udGVudCk7XG4gICAgICAgICAgICBpZiAocmVwbHlUb0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgcmVwbHlfdG9fZXZlbnQgYXMgd2UgcHV0IHRoZSBtZXNzYWdlIGludG8gdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgLy8gaWYgdGhlIHNlbmQgZmFpbHMsIHJldHJ5IHdpbGwgaGFuZGxlIHJlc2VuZGluZy5cbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXBseV90b19ldmVudCcsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwibWVzc2FnZV9zZW50XCJ9KTtcbiAgICAgICAgICAgIENIQVRfRUZGRUNUUy5mb3JFYWNoKChlZmZlY3QpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY29udGFpbnNFbW9qaShjb250ZW50LCBlZmZlY3QuZW1vamlzKSkge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogYGVmZmVjdHMuJHtlZmZlY3QuY29tbWFuZH1gfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBDb3VudGx5QW5hbHl0aWNzLmluc3RhbmNlLnRyYWNrU2VuZE1lc3NhZ2Uoc3RhcnRUaW1lLCBwcm9tLCByb29tSWQsIGZhbHNlLCAhIXJlcGx5VG9FdmVudCwgY29udGVudCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbmRIaXN0b3J5TWFuYWdlci5zYXZlKHRoaXMubW9kZWwsIHJlcGx5VG9FdmVudCk7XG4gICAgICAgIC8vIGNsZWFyIGNvbXBvc2VyXG4gICAgICAgIHRoaXMubW9kZWwucmVzZXQoW10pO1xuICAgICAgICB0aGlzLl9lZGl0b3JSZWYuY2xlYXJVbmRvSGlzdG9yeSgpO1xuICAgICAgICB0aGlzLl9lZGl0b3JSZWYuZm9jdXMoKTtcbiAgICAgICAgdGhpcy5fY2xlYXJTdG9yZWRFZGl0b3JTdGF0ZSgpO1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNjcm9sbFRvQm90dG9tT25NZXNzYWdlU2VudFwiKSkge1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwic2Nyb2xsX3RvX2JvdHRvbVwifSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgZGlzLnVucmVnaXN0ZXIodGhpcy5kaXNwYXRjaGVyUmVmKTtcbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJiZWZvcmV1bmxvYWRcIiwgdGhpcy5fc2F2ZVN0b3JlZEVkaXRvclN0YXRlKTtcbiAgICAgICAgdGhpcy5fc2F2ZVN0b3JlZEVkaXRvclN0YXRlKCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogW1JFQUNULVdBUk5JTkddIE1vdmUgdGhpcyB0byBjb25zdHJ1Y3RvclxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsTW91bnQoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgY2FtZWxjYXNlXG4gICAgICAgIGNvbnN0IHBhcnRDcmVhdG9yID0gbmV3IENvbW1hbmRQYXJ0Q3JlYXRvcih0aGlzLnByb3BzLnJvb20sIHRoaXMuY29udGV4dCk7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy5fcmVzdG9yZVN0b3JlZEVkaXRvclN0YXRlKHBhcnRDcmVhdG9yKSB8fCBbXTtcbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBFZGl0b3JNb2RlbChwYXJ0cywgcGFydENyZWF0b3IpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIodGhpcy5vbkFjdGlvbik7XG4gICAgICAgIHRoaXMuc2VuZEhpc3RvcnlNYW5hZ2VyID0gbmV3IFNlbmRIaXN0b3J5TWFuYWdlcih0aGlzLnByb3BzLnJvb20ucm9vbUlkLCAnbXhfY2lkZXJfaGlzdG9yeV8nKTtcbiAgICB9XG5cbiAgICBnZXQgX2VkaXRvclN0YXRlS2V5KCkge1xuICAgICAgICByZXR1cm4gYG14X2NpZGVyX3N0YXRlXyR7dGhpcy5wcm9wcy5yb29tLnJvb21JZH1gO1xuICAgIH1cblxuICAgIF9jbGVhclN0b3JlZEVkaXRvclN0YXRlKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9lZGl0b3JTdGF0ZUtleSk7XG4gICAgfVxuXG4gICAgX3Jlc3RvcmVTdG9yZWRFZGl0b3JTdGF0ZShwYXJ0Q3JlYXRvcikge1xuICAgICAgICBjb25zdCBqc29uID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5fZWRpdG9yU3RhdGVLZXkpO1xuICAgICAgICBpZiAoanNvbikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCB7cGFydHM6IHNlcmlhbGl6ZWRQYXJ0cywgcmVwbHlFdmVudElkfSA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSBzZXJpYWxpemVkUGFydHMubWFwKHAgPT4gcGFydENyZWF0b3IuZGVzZXJpYWxpemVQYXJ0KHApKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbHlFdmVudElkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBhY3Rpb246ICdyZXBseV90b19ldmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudDogdGhpcy5wcm9wcy5yb29tLmZpbmRFdmVudEJ5SWQocmVwbHlFdmVudElkKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJ0cztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc2hvdWxkIHNhdmUgc3RhdGUgd2hlbiBlZGl0b3IgaGFzIGNvbnRlbnRzIG9yIHJlcGx5IGlzIG9wZW5cbiAgICBfc2hvdWxkU2F2ZVN0b3JlZEVkaXRvclN0YXRlID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gIXRoaXMubW9kZWwuaXNFbXB0eSB8fCB0aGlzLnByb3BzLnJlcGx5VG9FdmVudDtcbiAgICB9XG5cbiAgICBfc2F2ZVN0b3JlZEVkaXRvclN0YXRlID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fc2hvdWxkU2F2ZVN0b3JlZEVkaXRvclN0YXRlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBTZW5kSGlzdG9yeU1hbmFnZXIuY3JlYXRlSXRlbSh0aGlzLm1vZGVsLCB0aGlzLnByb3BzLnJlcGx5VG9FdmVudCk7XG4gICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9lZGl0b3JTdGF0ZUtleSwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY2xlYXJTdG9yZWRFZGl0b3JTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25BY3Rpb24gPSAocGF5bG9hZCkgPT4ge1xuICAgICAgICAvLyBkb24ndCBsZXQgdGhlIHVzZXIgaW50byB0aGUgY29tcG9zZXIgaWYgaXQgaXMgZGlzYWJsZWQgLSBhbGwgb2YgdGhlc2UgYnJhbmNoZXMgbGVhZFxuICAgICAgICAvLyB0byB0aGUgY3Vyc29yIGJlaW5nIGluIHRoZSBjb21wb3NlclxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkgcmV0dXJuO1xuXG4gICAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlcGx5X3RvX2V2ZW50JzpcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkZvY3VzQ29tcG9zZXI6XG4gICAgICAgICAgICAgICAgdGhpcy5fZWRpdG9yUmVmICYmIHRoaXMuX2VkaXRvclJlZi5mb2N1cygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0X21lbnRpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuX2luc2VydE1lbnRpb24ocGF5bG9hZC51c2VyX2lkKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3F1b3RlJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnNlcnRRdW90ZWRNZXNzYWdlKHBheWxvYWQuZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0X2Vtb2ppJzpcbiAgICAgICAgICAgICAgICB0aGlzLl9pbnNlcnRFbW9qaShwYXlsb2FkLmVtb2ppKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfaW5zZXJ0TWVudGlvbih1c2VySWQpIHtcbiAgICAgICAgY29uc3Qge21vZGVsfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHtwYXJ0Q3JlYXRvcn0gPSBtb2RlbDtcbiAgICAgICAgY29uc3QgbWVtYmVyID0gdGhpcy5wcm9wcy5yb29tLmdldE1lbWJlcih1c2VySWQpO1xuICAgICAgICBjb25zdCBkaXNwbGF5TmFtZSA9IG1lbWJlciA/XG4gICAgICAgICAgICBtZW1iZXIucmF3RGlzcGxheU5hbWUgOiB1c2VySWQ7XG4gICAgICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5fZWRpdG9yUmVmLmdldENhcmV0KCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICAvLyBJbnNlcnQgc3VmZml4IG9ubHkgaWYgdGhlIGNhcmV0IGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgY29tcG9zZXJcbiAgICAgICAgY29uc3QgcGFydHMgPSBwYXJ0Q3JlYXRvci5jcmVhdGVNZW50aW9uUGFydHMoY2FyZXQub2Zmc2V0ID09PSAwLCBkaXNwbGF5TmFtZSwgdXNlcklkKTtcbiAgICAgICAgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFkZGVkTGVuID0gbW9kZWwuaW5zZXJ0KHBhcnRzLCBwb3NpdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gcmVmb2N1cyBvbiBjb21wb3NlciwgYXMgd2UganVzdCBjbGlja2VkIFwiTWVudGlvblwiXG4gICAgICAgIHRoaXMuX2VkaXRvclJlZiAmJiB0aGlzLl9lZGl0b3JSZWYuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBfaW5zZXJ0UXVvdGVkTWVzc2FnZShldmVudCkge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcztcbiAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICBjb25zdCBxdW90ZVBhcnRzID0gcGFyc2VFdmVudChldmVudCwgcGFydENyZWF0b3IsIHtpc1F1b3RlZE1lc3NhZ2U6IHRydWV9KTtcbiAgICAgICAgLy8gYWRkIHR3byBuZXdsaW5lc1xuICAgICAgICBxdW90ZVBhcnRzLnB1c2gocGFydENyZWF0b3IubmV3bGluZSgpKTtcbiAgICAgICAgcXVvdGVQYXJ0cy5wdXNoKHBhcnRDcmVhdG9yLm5ld2xpbmUoKSk7XG4gICAgICAgIG1vZGVsLnRyYW5zZm9ybSgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IG1vZGVsLmluc2VydChxdW90ZVBhcnRzLCBtb2RlbC5wb3NpdGlvbkZvck9mZnNldCgwKSk7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gcmVmb2N1cyBvbiBjb21wb3NlciwgYXMgd2UganVzdCBjbGlja2VkIFwiUXVvdGVcIlxuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgJiYgdGhpcy5fZWRpdG9yUmVmLmZvY3VzKCk7XG4gICAgfVxuXG4gICAgX2luc2VydEVtb2ppID0gKGVtb2ppKSA9PiB7XG4gICAgICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7cGFydENyZWF0b3J9ID0gbW9kZWw7XG4gICAgICAgIGNvbnN0IGNhcmV0ID0gdGhpcy5fZWRpdG9yUmVmLmdldENhcmV0KCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICBtb2RlbC50cmFuc2Zvcm0oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWRkZWRMZW4gPSBtb2RlbC5pbnNlcnQoW3BhcnRDcmVhdG9yLnBsYWluKGVtb2ppKV0sIHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiBtb2RlbC5wb3NpdGlvbkZvck9mZnNldChjYXJldC5vZmZzZXQgKyBhZGRlZExlbiwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb25QYXN0ZSA9IChldmVudCkgPT4ge1xuICAgICAgICBjb25zdCB7Y2xpcGJvYXJkRGF0YX0gPSBldmVudDtcbiAgICAgICAgLy8gUHJpb3JpdGl6ZSB0ZXh0IG9uIHRoZSBjbGlwYm9hcmQgb3ZlciBmaWxlcyBhcyBPZmZpY2Ugb24gbWFjT1MgcHV0cyBhIGJpdG1hcFxuICAgICAgICAvLyBpbiB0aGUgY2xpcGJvYXJkIGFzIHdlbGwgYXMgdGhlIGNvbnRlbnQgYmVpbmcgY29waWVkLlxuICAgICAgICBpZiAoY2xpcGJvYXJkRGF0YS5maWxlcy5sZW5ndGggJiYgIWNsaXBib2FyZERhdGEudHlwZXMuc29tZSh0ID0+IHQgPT09IFwidGV4dC9wbGFpblwiKSkge1xuICAgICAgICAgICAgLy8gVGhpcyBhY3R1YWxseSBub3Qgc28gbXVjaCBmb3IgJ2ZpbGVzJyBhcyBzdWNoIChhdCB0aW1lIG9mIHdyaXRpbmdcbiAgICAgICAgICAgIC8vIG5laXRoZXIgY2hyb21lIG5vciBmaXJlZm94IGxldCB5b3UgcGFzdGUgYSBwbGFpbiBmaWxlIGNvcGllZFxuICAgICAgICAgICAgLy8gZnJvbSBGaW5kZXIpIGJ1dCBtb3JlIGltYWdlcyBjb3BpZWQgZnJvbSBhIGRpZmZlcmVudCB3ZWJzaXRlXG4gICAgICAgICAgICAvLyAvIHdvcmQgcHJvY2Vzc29yIGV0Yy5cbiAgICAgICAgICAgIENvbnRlbnRNZXNzYWdlcy5zaGFyZWRJbnN0YW5jZSgpLnNlbmRDb250ZW50TGlzdFRvUm9vbShcbiAgICAgICAgICAgICAgICBBcnJheS5mcm9tKGNsaXBib2FyZERhdGEuZmlsZXMpLCB0aGlzLnByb3BzLnJvb20ucm9vbUlkLCB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7IC8vIHRvIHNraXAgaW50ZXJuYWwgb25QYXN0ZSBoYW5kbGVyXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHRoaXMucHJvcHMub25DaGFuZ2UodGhpcy5tb2RlbCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9TZW5kTWVzc2FnZUNvbXBvc2VyXCIgb25DbGljaz17dGhpcy5mb2N1c0NvbXBvc2VyfSBvbktleURvd249e3RoaXMuX29uS2V5RG93bn0+XG4gICAgICAgICAgICAgICAgPEJhc2ljTWVzc2FnZUNvbXBvc2VyXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3NldEVkaXRvclJlZn1cbiAgICAgICAgICAgICAgICAgICAgbW9kZWw9e3RoaXMubW9kZWx9XG4gICAgICAgICAgICAgICAgICAgIHJvb209e3RoaXMucHJvcHMucm9vbX1cbiAgICAgICAgICAgICAgICAgICAgbGFiZWw9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXt0aGlzLnByb3BzLnBsYWNlaG9sZGVyfVxuICAgICAgICAgICAgICAgICAgICBvblBhc3RlPXt0aGlzLl9vblBhc3RlfVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19