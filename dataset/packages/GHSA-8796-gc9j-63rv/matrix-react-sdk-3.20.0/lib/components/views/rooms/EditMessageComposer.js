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

var _model = _interopRequireDefault(require("../../../editor/model"));

var _dom = require("../../../editor/dom");

var _serialize = require("../../../editor/serialize");

var _EventUtils = require("../../../utils/EventUtils");

var _deserialize = require("../../../editor/deserialize");

var _parts = require("../../../editor/parts");

var _EditorStateTransfer = _interopRequireDefault(require("../../../utils/EditorStateTransfer"));

var _classnames = _interopRequireDefault(require("classnames"));

var _event = require("matrix-js-sdk/src/models/event");

var _BasicMessageComposer = _interopRequireDefault(require("./BasicMessageComposer"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function _isReply(mxEvent) {
  const relatesTo = mxEvent.getContent()["m.relates_to"];
  const isReply = !!(relatesTo && relatesTo["m.in_reply_to"]);
  return isReply;
}

function getHtmlReplyFallback(mxEvent) {
  const html = mxEvent.getContent().formatted_body;

  if (!html) {
    return "";
  }

  const rootNode = new DOMParser().parseFromString(html, "text/html").body;
  const mxReply = rootNode.querySelector("mx-reply");
  return mxReply && mxReply.outerHTML || "";
}

function getTextReplyFallback(mxEvent) {
  const body = mxEvent.getContent().body;
  const lines = body.split("\n").map(l => l.trim());

  if (lines.length > 2 && lines[0].startsWith("> ") && lines[1].length === 0) {
    return `${lines[0]}\n\n`;
  }

  return "";
}

function createEditContent(model, editedEvent) {
  const isEmote = (0, _serialize.containsEmote)(model);

  if (isEmote) {
    model = (0, _serialize.stripEmoteCommand)(model);
  }

  const isReply = _isReply(editedEvent);

  let plainPrefix = "";
  let htmlPrefix = "";

  if (isReply) {
    plainPrefix = getTextReplyFallback(editedEvent);
    htmlPrefix = getHtmlReplyFallback(editedEvent);
  }

  const body = (0, _serialize.textSerialize)(model);
  const newContent = {
    "msgtype": isEmote ? "m.emote" : "m.text",
    "body": body
  };
  const contentBody = {
    msgtype: newContent.msgtype,
    body: `${plainPrefix} * ${body}`
  };
  const formattedBody = (0, _serialize.htmlSerializeIfNeeded)(model, {
    forceHTML: isReply
  });

  if (formattedBody) {
    newContent.format = "org.matrix.custom.html";
    newContent.formatted_body = formattedBody;
    contentBody.format = newContent.format;
    contentBody.formatted_body = `${htmlPrefix} * ${formattedBody}`;
  }

  return Object.assign({
    "m.new_content": newContent,
    "m.relates_to": {
      "rel_type": "m.replace",
      "event_id": editedEvent.getId()
    }
  }, contentBody);
}

let EditMessageComposer = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.EditMessageComposer"), _dec(_class = (_temp = _class2 = class EditMessageComposer extends _react.default.Component {
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
          this._sendEdit();

          event.preventDefault();
          break;

        case _KeyBindingsManager.MessageComposerAction.CancelEditing:
          this._cancelEdit();

          break;

        case _KeyBindingsManager.MessageComposerAction.EditPrevMessage:
          {
            if (this._editorRef.isModified() || !this._editorRef.isCaretAtStart()) {
              return;
            }

            const previousEvent = (0, _EventUtils.findEditableEvent)(this._getRoom(), false, this.props.editState.getEvent().getId());

            if (previousEvent) {
              _dispatcher.default.dispatch({
                action: 'edit_event',
                event: previousEvent
              });

              event.preventDefault();
            }

            break;
          }

        case _KeyBindingsManager.MessageComposerAction.EditNextMessage:
          {
            if (this._editorRef.isModified() || !this._editorRef.isCaretAtEnd()) {
              return;
            }

            const nextEvent = (0, _EventUtils.findEditableEvent)(this._getRoom(), true, this.props.editState.getEvent().getId());

            if (nextEvent) {
              _dispatcher.default.dispatch({
                action: 'edit_event',
                event: nextEvent
              });
            } else {
              _dispatcher.default.dispatch({
                action: 'edit_event',
                event: null
              });

              _dispatcher.default.fire(_actions.Action.FocusComposer);
            }

            event.preventDefault();
            break;
          }
      }
    });
    (0, _defineProperty2.default)(this, "_cancelEdit", () => {
      _dispatcher.default.dispatch({
        action: "edit_event",
        event: null
      });

      _dispatcher.default.fire(_actions.Action.FocusComposer);
    });
    (0, _defineProperty2.default)(this, "_sendEdit", () => {
      const startTime = _CountlyAnalytics.default.getTimestamp();

      const editedEvent = this.props.editState.getEvent();
      const editContent = createEditContent(this.model, editedEvent);
      const newContent = editContent["m.new_content"]; // If content is modified then send an updated event into the room

      if (this._isContentModified(newContent)) {
        const roomId = editedEvent.getRoomId();

        this._cancelPreviousPendingEdit();

        const prom = this.context.sendMessage(roomId, editContent);

        _dispatcher.default.dispatch({
          action: "message_sent"
        });

        _CountlyAnalytics.default.instance.trackSendMessage(startTime, prom, roomId, true, false, editContent);
      } // close the event editing and focus composer


      _dispatcher.default.dispatch({
        action: "edit_event",
        event: null
      });

      _dispatcher.default.fire(_actions.Action.FocusComposer);
    });
    (0, _defineProperty2.default)(this, "_onChange", () => {
      if (!this.state.saveDisabled || !this._editorRef || !this._editorRef.isModified()) {
        return;
      }

      this.setState({
        saveDisabled: false
      });
    });
    this.model = null;
    this._editorRef = null;
    this.state = {
      saveDisabled: true
    };

    this._createEditorModel();
  }

  _getRoom() {
    return this.context.getRoom(this.props.editState.getEvent().getRoomId());
  }

  _isContentModified(newContent) {
    // if nothing has changed then bail
    const oldContent = this.props.editState.getEvent().getContent();

    if (!this._editorRef.isModified() || oldContent["msgtype"] === newContent["msgtype"] && oldContent["body"] === newContent["body"] && oldContent["format"] === newContent["format"] && oldContent["formatted_body"] === newContent["formatted_body"]) {
      return false;
    }

    return true;
  }

  _cancelPreviousPendingEdit() {
    const originalEvent = this.props.editState.getEvent();
    const previousEdit = originalEvent.replacingEvent();

    if (previousEdit && (previousEdit.status === _event.EventStatus.QUEUED || previousEdit.status === _event.EventStatus.NOT_SENT)) {
      this.context.cancelPendingEvent(previousEdit);
    }
  }

  componentWillUnmount() {
    // store caret and serialized parts in the
    // editorstate so it can be restored when the remote echo event tile gets rendered
    // in case we're currently editing a pending event
    const sel = document.getSelection();
    let caret;

    if (sel.focusNode) {
      caret = (0, _dom.getCaretOffsetAndText)(this._editorRef, sel).caret;
    }

    const parts = this.model.serializeParts(); // if caret is undefined because for some reason there isn't a valid selection,
    // then when mounting the editor again with the same editor state,
    // it will set the cursor at the end.

    this.props.editState.setEditorState(caret, parts);
  }

  _createEditorModel() {
    const {
      editState
    } = this.props;

    const room = this._getRoom();

    const partCreator = new _parts.PartCreator(room, this.context);
    let parts;

    if (editState.hasEditorState()) {
      // if restoring state from a previous editor,
      // restore serialized parts from the state
      parts = editState.getSerializedParts().map(p => partCreator.deserializePart(p));
    } else {
      // otherwise, parse the body of the event
      parts = (0, _deserialize.parseEvent)(editState.getEvent(), partCreator);
    }

    this.model = new _model.default(parts, partCreator);
  }

  _getInitialCaretPosition() {
    const {
      editState
    } = this.props;
    let caretPosition;

    if (editState.hasEditorState() && editState.getCaret()) {
      // if restoring state from a previous editor,
      // restore caret position from the state
      const caret = editState.getCaret();
      caretPosition = this.model.positionForOffset(caret.offset, caret.atNodeEnd);
    } else {
      // otherwise, set it at the end
      caretPosition = this.model.getPositionAtEnd();
    }

    return caretPosition;
  }

  render() {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    return /*#__PURE__*/_react.default.createElement("div", {
      className: (0, _classnames.default)("mx_EditMessageComposer", this.props.className),
      onKeyDown: this._onKeyDown
    }, /*#__PURE__*/_react.default.createElement(_BasicMessageComposer.default, {
      ref: this._setEditorRef,
      model: this.model,
      room: this._getRoom(),
      initialCaret: this.props.editState.getCaret(),
      label: (0, _languageHandler._t)("Edit message"),
      onChange: this._onChange
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EditMessageComposer_buttons"
    }, /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "secondary",
      onClick: this._cancelEdit
    }, (0, _languageHandler._t)("Cancel")), /*#__PURE__*/_react.default.createElement(AccessibleButton, {
      kind: "primary",
      onClick: this._sendEdit,
      disabled: this.state.saveDisabled
    }, (0, _languageHandler._t)("Save"))));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  // the message event being edited
  editState: _propTypes.default.instanceOf(_EditorStateTransfer.default).isRequired
}), (0, _defineProperty2.default)(_class2, "contextType", _MatrixClientContext.default), _temp)) || _class);
exports.default = EditMessageComposer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0VkaXRNZXNzYWdlQ29tcG9zZXIuanMiXSwibmFtZXMiOlsiX2lzUmVwbHkiLCJteEV2ZW50IiwicmVsYXRlc1RvIiwiZ2V0Q29udGVudCIsImlzUmVwbHkiLCJnZXRIdG1sUmVwbHlGYWxsYmFjayIsImh0bWwiLCJmb3JtYXR0ZWRfYm9keSIsInJvb3ROb2RlIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwiYm9keSIsIm14UmVwbHkiLCJxdWVyeVNlbGVjdG9yIiwib3V0ZXJIVE1MIiwiZ2V0VGV4dFJlcGx5RmFsbGJhY2siLCJsaW5lcyIsInNwbGl0IiwibWFwIiwibCIsInRyaW0iLCJsZW5ndGgiLCJzdGFydHNXaXRoIiwiY3JlYXRlRWRpdENvbnRlbnQiLCJtb2RlbCIsImVkaXRlZEV2ZW50IiwiaXNFbW90ZSIsInBsYWluUHJlZml4IiwiaHRtbFByZWZpeCIsIm5ld0NvbnRlbnQiLCJjb250ZW50Qm9keSIsIm1zZ3R5cGUiLCJmb3JtYXR0ZWRCb2R5IiwiZm9yY2VIVE1MIiwiZm9ybWF0IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0SWQiLCJFZGl0TWVzc2FnZUNvbXBvc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJlZiIsIl9lZGl0b3JSZWYiLCJldmVudCIsImlzQ29tcG9zaW5nIiwiYWN0aW9uIiwiZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uIiwiTWVzc2FnZUNvbXBvc2VyQWN0aW9uIiwiU2VuZCIsIl9zZW5kRWRpdCIsInByZXZlbnREZWZhdWx0IiwiQ2FuY2VsRWRpdGluZyIsIl9jYW5jZWxFZGl0IiwiRWRpdFByZXZNZXNzYWdlIiwiaXNNb2RpZmllZCIsImlzQ2FyZXRBdFN0YXJ0IiwicHJldmlvdXNFdmVudCIsIl9nZXRSb29tIiwiZWRpdFN0YXRlIiwiZ2V0RXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsIkVkaXROZXh0TWVzc2FnZSIsImlzQ2FyZXRBdEVuZCIsIm5leHRFdmVudCIsImZpcmUiLCJBY3Rpb24iLCJGb2N1c0NvbXBvc2VyIiwic3RhcnRUaW1lIiwiQ291bnRseUFuYWx5dGljcyIsImdldFRpbWVzdGFtcCIsImVkaXRDb250ZW50IiwiX2lzQ29udGVudE1vZGlmaWVkIiwicm9vbUlkIiwiZ2V0Um9vbUlkIiwiX2NhbmNlbFByZXZpb3VzUGVuZGluZ0VkaXQiLCJwcm9tIiwic2VuZE1lc3NhZ2UiLCJpbnN0YW5jZSIsInRyYWNrU2VuZE1lc3NhZ2UiLCJzdGF0ZSIsInNhdmVEaXNhYmxlZCIsInNldFN0YXRlIiwiX2NyZWF0ZUVkaXRvck1vZGVsIiwiZ2V0Um9vbSIsIm9sZENvbnRlbnQiLCJvcmlnaW5hbEV2ZW50IiwicHJldmlvdXNFZGl0IiwicmVwbGFjaW5nRXZlbnQiLCJzdGF0dXMiLCJFdmVudFN0YXR1cyIsIlFVRVVFRCIsIk5PVF9TRU5UIiwiY2FuY2VsUGVuZGluZ0V2ZW50IiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJzZWwiLCJkb2N1bWVudCIsImdldFNlbGVjdGlvbiIsImNhcmV0IiwiZm9jdXNOb2RlIiwicGFydHMiLCJzZXJpYWxpemVQYXJ0cyIsInNldEVkaXRvclN0YXRlIiwicm9vbSIsInBhcnRDcmVhdG9yIiwiUGFydENyZWF0b3IiLCJoYXNFZGl0b3JTdGF0ZSIsImdldFNlcmlhbGl6ZWRQYXJ0cyIsInAiLCJkZXNlcmlhbGl6ZVBhcnQiLCJFZGl0b3JNb2RlbCIsIl9nZXRJbml0aWFsQ2FyZXRQb3NpdGlvbiIsImNhcmV0UG9zaXRpb24iLCJnZXRDYXJldCIsInBvc2l0aW9uRm9yT2Zmc2V0Iiwib2Zmc2V0IiwiYXROb2RlRW5kIiwiZ2V0UG9zaXRpb25BdEVuZCIsInJlbmRlciIsIkFjY2Vzc2libGVCdXR0b24iLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjbGFzc05hbWUiLCJfb25LZXlEb3duIiwiX3NldEVkaXRvclJlZiIsIl9vbkNoYW5nZSIsIlByb3BUeXBlcyIsImluc3RhbmNlT2YiLCJFZGl0b3JTdGF0ZVRyYW5zZmVyIiwiaXNSZXF1aXJlZCIsIk1hdHJpeENsaWVudENvbnRleHQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxTQUFTQSxRQUFULENBQWtCQyxPQUFsQixFQUEyQjtBQUN2QixRQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBQ0UsVUFBUixHQUFxQixjQUFyQixDQUFsQjtBQUNBLFFBQU1DLE9BQU8sR0FBRyxDQUFDLEVBQUVGLFNBQVMsSUFBSUEsU0FBUyxDQUFDLGVBQUQsQ0FBeEIsQ0FBakI7QUFDQSxTQUFPRSxPQUFQO0FBQ0g7O0FBRUQsU0FBU0Msb0JBQVQsQ0FBOEJKLE9BQTlCLEVBQXVDO0FBQ25DLFFBQU1LLElBQUksR0FBR0wsT0FBTyxDQUFDRSxVQUFSLEdBQXFCSSxjQUFsQzs7QUFDQSxNQUFJLENBQUNELElBQUwsRUFBVztBQUNQLFdBQU8sRUFBUDtBQUNIOztBQUNELFFBQU1FLFFBQVEsR0FBRyxJQUFJQyxTQUFKLEdBQWdCQyxlQUFoQixDQUFnQ0osSUFBaEMsRUFBc0MsV0FBdEMsRUFBbURLLElBQXBFO0FBQ0EsUUFBTUMsT0FBTyxHQUFHSixRQUFRLENBQUNLLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBaEI7QUFDQSxTQUFRRCxPQUFPLElBQUlBLE9BQU8sQ0FBQ0UsU0FBcEIsSUFBa0MsRUFBekM7QUFDSDs7QUFFRCxTQUFTQyxvQkFBVCxDQUE4QmQsT0FBOUIsRUFBdUM7QUFDbkMsUUFBTVUsSUFBSSxHQUFHVixPQUFPLENBQUNFLFVBQVIsR0FBcUJRLElBQWxDO0FBQ0EsUUFBTUssS0FBSyxHQUFHTCxJQUFJLENBQUNNLEtBQUwsQ0FBVyxJQUFYLEVBQWlCQyxHQUFqQixDQUFxQkMsQ0FBQyxJ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LEdBQUdDLEdBQUcsQ0FBQ0MsWUFBSixDQUFpQiwyQkFBakIsQ0FBekI7QUFDQSx3QkFBUTtBQUFLLE1BQUEsU0FBUyxFQUFFLHlCQUFXLHdCQUFYLEVBQXFDLEtBQUtsRixLQUFMLENBQVdtRixTQUFoRCxDQUFoQjtBQUE0RSxNQUFBLFNBQVMsRUFBRSxLQUFLQztBQUE1RixvQkFDSiw2QkFBQyw2QkFBRDtBQUNJLE1BQUEsR0FBRyxFQUFFLEtBQUtDLGFBRGQ7QUFFSSxNQUFBLEtBQUssRUFBRSxLQUFLdkcsS0FGaEI7QUFHSSxNQUFBLElBQUksRUFBRSxLQUFLb0MsUUFBTCxFQUhWO0FBSUksTUFBQSxZQUFZLEVBQUUsS0FBS2xCLEtBQUwsQ0FBV21CLFNBQVgsQ0FBcUJ1RCxRQUFyQixFQUpsQjtBQUtJLE1BQUEsS0FBSyxFQUFFLHlCQUFHLGNBQUgsQ0FMWDtBQU1JLE1BQUEsUUFBUSxFQUFFLEtBQUtZO0FBTm5CLE1BREksZUFTSjtBQUFLLE1BQUEsU0FBUyxFQUFDO0FBQWYsb0JBQ0ksNkJBQUMsZ0JBQUQ7QUFBa0IsTUFBQSxJQUFJLEVBQUMsV0FBdkI7QUFBbUMsTUFBQSxPQUFPLEVBQUUsS0FBS3pFO0FBQWpELE9BQStELHlCQUFHLFFBQUgsQ0FBL0QsQ0FESixlQUVJLDZCQUFDLGdCQUFEO0FBQWtCLE1BQUEsSUFBSSxFQUFDLFNBQXZCO0FBQWlDLE1BQUEsT0FBTyxFQUFFLEtBQUtILFNBQS9DO0FBQTBELE1BQUEsUUFBUSxFQUFFLEtBQUsrQixLQUFMLENBQVdDO0FBQS9FLE9BQ0sseUJBQUcsTUFBSCxDQURMLENBRkosQ0FUSSxDQUFSO0FBZ0JIOztBQWpNNEQsQyxzREFDMUM7QUFDZjtBQUNBdkIsRUFBQUEsU0FBUyxFQUFFb0UsbUJBQVVDLFVBQVYsQ0FBcUJDLDRCQUFyQixFQUEwQ0M7QUFGdEMsQyx5REFLRUMsNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtfdH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgRWRpdG9yTW9kZWwgZnJvbSAnLi4vLi4vLi4vZWRpdG9yL21vZGVsJztcbmltcG9ydCB7Z2V0Q2FyZXRPZmZzZXRBbmRUZXh0fSBmcm9tICcuLi8uLi8uLi9lZGl0b3IvZG9tJztcbmltcG9ydCB7aHRtbFNlcmlhbGl6ZUlmTmVlZGVkLCB0ZXh0U2VyaWFsaXplLCBjb250YWluc0Vtb3RlLCBzdHJpcEVtb3RlQ29tbWFuZH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL3NlcmlhbGl6ZSc7XG5pbXBvcnQge2ZpbmRFZGl0YWJsZUV2ZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCB7cGFyc2VFdmVudH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2Rlc2VyaWFsaXplJztcbmltcG9ydCB7UGFydENyZWF0b3J9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQgRWRpdG9yU3RhdGVUcmFuc2ZlciBmcm9tICcuLi8uLi8uLi91dGlscy9FZGl0b3JTdGF0ZVRyYW5zZmVyJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtFdmVudFN0YXR1c30gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL2V2ZW50JztcbmltcG9ydCBCYXNpY01lc3NhZ2VDb21wb3NlciBmcm9tIFwiLi9CYXNpY01lc3NhZ2VDb21wb3NlclwiO1xuaW1wb3J0IE1hdHJpeENsaWVudENvbnRleHQgZnJvbSBcIi4uLy4uLy4uL2NvbnRleHRzL01hdHJpeENsaWVudENvbnRleHRcIjtcbmltcG9ydCB7QWN0aW9ufSBmcm9tIFwiLi4vLi4vLi4vZGlzcGF0Y2hlci9hY3Rpb25zXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuaW1wb3J0IHtnZXRLZXlCaW5kaW5nc01hbmFnZXIsIE1lc3NhZ2VDb21wb3NlckFjdGlvbn0gZnJvbSAnLi4vLi4vLi4vS2V5QmluZGluZ3NNYW5hZ2VyJztcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuXG5mdW5jdGlvbiBfaXNSZXBseShteEV2ZW50KSB7XG4gICAgY29uc3QgcmVsYXRlc1RvID0gbXhFdmVudC5nZXRDb250ZW50KClbXCJtLnJlbGF0ZXNfdG9cIl07XG4gICAgY29uc3QgaXNSZXBseSA9ICEhKHJlbGF0ZXNUbyAmJiByZWxhdGVzVG9bXCJtLmluX3JlcGx5X3RvXCJdKTtcbiAgICByZXR1cm4gaXNSZXBseTtcbn1cblxuZnVuY3Rpb24gZ2V0SHRtbFJlcGx5RmFsbGJhY2sobXhFdmVudCkge1xuICAgIGNvbnN0IGh0bWwgPSBteEV2ZW50LmdldENvbnRlbnQoKS5mb3JtYXR0ZWRfYm9keTtcbiAgICBpZiAoIWh0bWwpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhodG1sLCBcInRleHQvaHRtbFwiKS5ib2R5O1xuICAgIGNvbnN0IG14UmVwbHkgPSByb290Tm9kZS5xdWVyeVNlbGVjdG9yKFwibXgtcmVwbHlcIik7XG4gICAgcmV0dXJuIChteFJlcGx5ICYmIG14UmVwbHkub3V0ZXJIVE1MKSB8fCBcIlwiO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0UmVwbHlGYWxsYmFjayhteEV2ZW50KSB7XG4gICAgY29uc3QgYm9keSA9IG14RXZlbnQuZ2V0Q29udGVudCgpLmJvZHk7XG4gICAgY29uc3QgbGluZXMgPSBib2R5LnNwbGl0KFwiXFxuXCIpLm1hcChsID0+IGwudHJpbSgpKTtcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMiAmJiBsaW5lc1swXS5zdGFydHNXaXRoKFwiPiBcIikgJiYgbGluZXNbMV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBgJHtsaW5lc1swXX1cXG5cXG5gO1xuICAgIH1cbiAgICByZXR1cm4gXCJcIjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWRpdENvbnRlbnQobW9kZWwsIGVkaXRlZEV2ZW50KSB7XG4gICAgY29uc3QgaXNFbW90ZSA9IGNvbnRhaW5zRW1vdGUobW9kZWwpO1xuICAgIGlmIChpc0Vtb3RlKSB7XG4gICAgICAgIG1vZGVsID0gc3RyaXBFbW90ZUNvbW1hbmQobW9kZWwpO1xuICAgIH1cbiAgICBjb25zdCBpc1JlcGx5ID0gX2lzUmVwbHkoZWRpdGVkRXZlbnQpO1xuICAgIGxldCBwbGFpblByZWZpeCA9IFwiXCI7XG4gICAgbGV0IGh0bWxQcmVmaXggPSBcIlwiO1xuXG4gICAgaWYgKGlzUmVwbHkpIHtcbiAgICAgICAgcGxhaW5QcmVmaXggPSBnZXRUZXh0UmVwbHlGYWxsYmFjayhlZGl0ZWRFdmVudCk7XG4gICAgICAgIGh0bWxQcmVmaXggPSBnZXRIdG1sUmVwbHlGYWxsYmFjayhlZGl0ZWRFdmVudCk7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuXG4gICAgY29uc3QgbmV3Q29udGVudCA9IHtcbiAgICAgICAgXCJtc2d0eXBlXCI6IGlzRW1vdGUgPyBcIm0uZW1vdGVcIiA6IFwibS50ZXh0XCIsXG4gICAgICAgIFwiYm9keVwiOiBib2R5LFxuICAgIH07XG4gICAgY29uc3QgY29udGVudEJvZHkgPSB7XG4gICAgICAgIG1zZ3R5cGU6IG5ld0NvbnRlbnQubXNndHlwZSxcbiAgICAgICAgYm9keTogYCR7cGxhaW5QcmVmaXh9ICogJHtib2R5fWAsXG4gICAgfTtcblxuICAgIGNvbnN0IGZvcm1hdHRlZEJvZHkgPSBodG1sU2VyaWFsaXplSWZOZWVkZWQobW9kZWwsIHtmb3JjZUhUTUw6IGlzUmVwbHl9KTtcbiAgICBpZiAoZm9ybWF0dGVkQm9keSkge1xuICAgICAgICBuZXdDb250ZW50LmZvcm1hdCA9IFwib3JnLm1hdHJpeC5jdXN0b20uaHRtbFwiO1xuICAgICAgICBuZXdDb250ZW50LmZvcm1hdHRlZF9ib2R5ID0gZm9ybWF0dGVkQm9keTtcbiAgICAgICAgY29udGVudEJvZHkuZm9ybWF0ID0gbmV3Q29udGVudC5mb3JtYXQ7XG4gICAgICAgIGNvbnRlbnRCb2R5LmZvcm1hdHRlZF9ib2R5ID0gYCR7aHRtbFByZWZpeH0gKiAke2Zvcm1hdHRlZEJvZHl9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIFwibS5uZXdfY29udGVudFwiOiBuZXdDb250ZW50LFxuICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICBcInJlbF90eXBlXCI6IFwibS5yZXBsYWNlXCIsXG4gICAgICAgICAgICBcImV2ZW50X2lkXCI6IGVkaXRlZEV2ZW50LmdldElkKCksXG4gICAgICAgIH0sXG4gICAgfSwgY29udGVudEJvZHkpO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJ2aWV3cy5yb29tcy5FZGl0TWVzc2FnZUNvbXBvc2VyXCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0TWVzc2FnZUNvbXBvc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0aGUgbWVzc2FnZSBldmVudCBiZWluZyBlZGl0ZWRcbiAgICAgICAgZWRpdFN0YXRlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihFZGl0b3JTdGF0ZVRyYW5zZmVyKS5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZWRpdG9yUmVmID0gbnVsbDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2F2ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9jcmVhdGVFZGl0b3JNb2RlbCgpO1xuICAgIH1cblxuICAgIF9zZXRFZGl0b3JSZWYgPSByZWYgPT4ge1xuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgPSByZWY7XG4gICAgfTtcblxuICAgIF9nZXRSb29tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRSb29tSWQoKSk7XG4gICAgfVxuXG4gICAgX29uS2V5RG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgYW55IGtleXByZXNzIHdoaWxlIGRvaW5nIElNRSBjb21wb3NpdGlvbnNcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZi5pc0NvbXBvc2luZyhldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRNZXNzYWdlQ29tcG9zZXJBY3Rpb24oZXZlbnQpO1xuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uU2VuZDpcbiAgICAgICAgICAgICAgICB0aGlzLl9zZW5kRWRpdCgpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDb21wb3NlckFjdGlvbi5DYW5jZWxFZGl0aW5nOlxuICAgICAgICAgICAgICAgIHRoaXMuX2NhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNvbXBvc2VyQWN0aW9uLkVkaXRQcmV2TWVzc2FnZToge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9lZGl0b3JSZWYuaXNNb2RpZmllZCgpIHx8ICF0aGlzLl9lZGl0b3JSZWYuaXNDYXJldEF0U3RhcnQoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzRXZlbnQgPSBmaW5kRWRpdGFibGVFdmVudCh0aGlzLl9nZXRSb29tKCksIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpLmdldElkKCkpO1xuICAgICAgICAgICAgICAgIGlmIChwcmV2aW91c0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnZWRpdF9ldmVudCcsIGV2ZW50OiBwcmV2aW91c0V2ZW50fSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uRWRpdE5leHRNZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZi5pc01vZGlmaWVkKCkgfHwgIXRoaXMuX2VkaXRvclJlZi5pc0NhcmV0QXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRFdmVudCA9IGZpbmRFZGl0YWJsZUV2ZW50KHRoaXMuX2dldFJvb20oKSwgdHJ1ZSwgdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICBpZiAobmV4dEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnZWRpdF9ldmVudCcsIGV2ZW50OiBuZXh0RXZlbnR9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2VkaXRfZXZlbnQnLCBldmVudDogbnVsbH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfY2FuY2VsRWRpdCA9ICgpID0+IHtcbiAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwiZWRpdF9ldmVudFwiLCBldmVudDogbnVsbH0pO1xuICAgICAgICBkaXMuZmlyZShBY3Rpb24uRm9jdXNDb21wb3Nlcik7XG4gICAgfVxuXG4gICAgX2lzQ29udGVudE1vZGlmaWVkKG5ld0NvbnRlbnQpIHtcbiAgICAgICAgLy8gaWYgbm90aGluZyBoYXMgY2hhbmdlZCB0aGVuIGJhaWxcbiAgICAgICAgY29uc3Qgb2xkQ29udGVudCA9IHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCkuZ2V0Q29udGVudCgpO1xuICAgICAgICBpZiAoIXRoaXMuX2VkaXRvclJlZi5pc01vZGlmaWVkKCkgfHxcbiAgICAgICAgICAgIChvbGRDb250ZW50W1wibXNndHlwZVwiXSA9PT0gbmV3Q29udGVudFtcIm1zZ3R5cGVcIl0gJiYgb2xkQ29udGVudFtcImJvZHlcIl0gPT09IG5ld0NvbnRlbnRbXCJib2R5XCJdICYmXG4gICAgICAgICAgICBvbGRDb250ZW50W1wiZm9ybWF0XCJdID09PSBuZXdDb250ZW50W1wiZm9ybWF0XCJdICYmXG4gICAgICAgICAgICBvbGRDb250ZW50W1wiZm9ybWF0dGVkX2JvZHlcIl0gPT09IG5ld0NvbnRlbnRbXCJmb3JtYXR0ZWRfYm9keVwiXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBfc2VuZEVkaXQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IENvdW50bHlBbmFseXRpY3MuZ2V0VGltZXN0YW1wKCk7XG4gICAgICAgIGNvbnN0IGVkaXRlZEV2ZW50ID0gdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKTtcbiAgICAgICAgY29uc3QgZWRpdENvbnRlbnQgPSBjcmVhdGVFZGl0Q29udGVudCh0aGlzLm1vZGVsLCBlZGl0ZWRFdmVudCk7XG4gICAgICAgIGNvbnN0IG5ld0NvbnRlbnQgPSBlZGl0Q29udGVudFtcIm0ubmV3X2NvbnRlbnRcIl07XG5cbiAgICAgICAgLy8gSWYgY29udGVudCBpcyBtb2RpZmllZCB0aGVuIHNlbmQgYW4gdXBkYXRlZCBldmVudCBpbnRvIHRoZSByb29tXG4gICAgICAgIGlmICh0aGlzLl9pc0NvbnRlbnRNb2RpZmllZChuZXdDb250ZW50KSkge1xuICAgICAgICAgICAgY29uc3Qgcm9vbUlkID0gZWRpdGVkRXZlbnQuZ2V0Um9vbUlkKCk7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxQcmV2aW91c1BlbmRpbmdFZGl0KCk7XG4gICAgICAgICAgICBjb25zdCBwcm9tID0gdGhpcy5jb250ZXh0LnNlbmRNZXNzYWdlKHJvb21JZCwgZWRpdENvbnRlbnQpO1xuICAgICAgICAgICAgZGlzLmRpc3BhdGNoKHthY3Rpb246IFwibWVzc2FnZV9zZW50XCJ9KTtcbiAgICAgICAgICAgIENvdW50bHlBbmFseXRpY3MuaW5zdGFuY2UudHJhY2tTZW5kTWVzc2FnZShzdGFydFRpbWUsIHByb20sIHJvb21JZCwgdHJ1ZSwgZmFsc2UsIGVkaXRDb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsb3NlIHRoZSBldmVudCBlZGl0aW5nIGFuZCBmb2N1cyBjb21wb3NlclxuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJlZGl0X2V2ZW50XCIsIGV2ZW50OiBudWxsfSk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcbiAgICB9O1xuXG4gICAgX2NhbmNlbFByZXZpb3VzUGVuZGluZ0VkaXQoKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsRXZlbnQgPSB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpO1xuICAgICAgICBjb25zdCBwcmV2aW91c0VkaXQgPSBvcmlnaW5hbEV2ZW50LnJlcGxhY2luZ0V2ZW50KCk7XG4gICAgICAgIGlmIChwcmV2aW91c0VkaXQgJiYgKFxuICAgICAgICAgICAgcHJldmlvdXNFZGl0LnN0YXR1cyA9PT0gRXZlbnRTdGF0dXMuUVVFVUVEIHx8XG4gICAgICAgICAgICBwcmV2aW91c0VkaXQuc3RhdHVzID09PSBFdmVudFN0YXR1cy5OT1RfU0VOVFxuICAgICAgICApKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuY2FuY2VsUGVuZGluZ0V2ZW50KHByZXZpb3VzRWRpdCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gc3RvcmUgY2FyZXQgYW5kIHNlcmlhbGl6ZWQgcGFydHMgaW4gdGhlXG4gICAgICAgIC8vIGVkaXRvcnN0YXRlIHNvIGl0IGNhbiBiZSByZXN0b3JlZCB3aGVuIHRoZSByZW1vdGUgZWNobyBldmVudCB0aWxlIGdldHMgcmVuZGVyZWRcbiAgICAgICAgLy8gaW4gY2FzZSB3ZSdyZSBjdXJyZW50bHkgZWRpdGluZyBhIHBlbmRpbmcgZXZlbnRcbiAgICAgICAgY29uc3Qgc2VsID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGxldCBjYXJldDtcbiAgICAgICAgaWYgKHNlbC5mb2N1c05vZGUpIHtcbiAgICAgICAgICAgIGNhcmV0ID0gZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0KHRoaXMuX2VkaXRvclJlZiwgc2VsKS5jYXJldDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMubW9kZWwuc2VyaWFsaXplUGFydHMoKTtcbiAgICAgICAgLy8gaWYgY2FyZXQgaXMgdW5kZWZpbmVkIGJlY2F1c2UgZm9yIHNvbWUgcmVhc29uIHRoZXJlIGlzbid0IGEgdmFsaWQgc2VsZWN0aW9uLFxuICAgICAgICAvLyB0aGVuIHdoZW4gbW91bnRpbmcgdGhlIGVkaXRvciBhZ2FpbiB3aXRoIHRoZSBzYW1lIGVkaXRvciBzdGF0ZSxcbiAgICAgICAgLy8gaXQgd2lsbCBzZXQgdGhlIGN1cnNvciBhdCB0aGUgZW5kLlxuICAgICAgICB0aGlzLnByb3BzLmVkaXRTdGF0ZS5zZXRFZGl0b3JTdGF0ZShjYXJldCwgcGFydHMpO1xuICAgIH1cblxuICAgIF9jcmVhdGVFZGl0b3JNb2RlbCgpIHtcbiAgICAgICAgY29uc3Qge2VkaXRTdGF0ZX0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCByb29tID0gdGhpcy5fZ2V0Um9vbSgpO1xuICAgICAgICBjb25zdCBwYXJ0Q3JlYXRvciA9IG5ldyBQYXJ0Q3JlYXRvcihyb29tLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICBsZXQgcGFydHM7XG4gICAgICAgIGlmIChlZGl0U3RhdGUuaGFzRWRpdG9yU3RhdGUoKSkge1xuICAgICAgICAgICAgLy8gaWYgcmVzdG9yaW5nIHN0YXRlIGZyb20gYSBwcmV2aW91cyBlZGl0b3IsXG4gICAgICAgICAgICAvLyByZXN0b3JlIHNlcmlhbGl6ZWQgcGFydHMgZnJvbSB0aGUgc3RhdGVcbiAgICAgICAgICAgIHBhcnRzID0gZWRpdFN0YXRlLmdldFNlcmlhbGl6ZWRQYXJ0cygpLm1hcChwID0+IHBhcnRDcmVhdG9yLmRlc2VyaWFsaXplUGFydChwKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIHBhcnNlIHRoZSBib2R5IG9mIHRoZSBldmVudFxuICAgICAgICAgICAgcGFydHMgPSBwYXJzZUV2ZW50KGVkaXRTdGF0ZS5nZXRFdmVudCgpLCBwYXJ0Q3JlYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb2RlbCA9IG5ldyBFZGl0b3JNb2RlbChwYXJ0cywgcGFydENyZWF0b3IpO1xuICAgIH1cblxuICAgIF9nZXRJbml0aWFsQ2FyZXRQb3NpdGlvbigpIHtcbiAgICAgICAgY29uc3Qge2VkaXRTdGF0ZX0gPSB0aGlzLnByb3BzO1xuICAgICAgICBsZXQgY2FyZXRQb3NpdGlvbjtcbiAgICAgICAgaWYgKGVkaXRTdGF0ZS5oYXNFZGl0b3JTdGF0ZSgpICYmIGVkaXRTdGF0ZS5nZXRDYXJldCgpKSB7XG4gICAgICAgICAgICAvLyBpZiByZXN0b3Jpbmcgc3RhdGUgZnJvbSBhIHByZXZpb3VzIGVkaXRvcixcbiAgICAgICAgICAgIC8vIHJlc3RvcmUgY2FyZXQgcG9zaXRpb24gZnJvbSB0aGUgc3RhdGVcbiAgICAgICAgICAgIGNvbnN0IGNhcmV0ID0gZWRpdFN0YXRlLmdldENhcmV0KCk7XG4gICAgICAgICAgICBjYXJldFBvc2l0aW9uID0gdGhpcy5tb2RlbC5wb3NpdGlvbkZvck9mZnNldChjYXJldC5vZmZzZXQsIGNhcmV0LmF0Tm9kZUVuZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIHNldCBpdCBhdCB0aGUgZW5kXG4gICAgICAgICAgICBjYXJldFBvc2l0aW9uID0gdGhpcy5tb2RlbC5nZXRQb3NpdGlvbkF0RW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhcmV0UG9zaXRpb247XG4gICAgfVxuXG4gICAgX29uQ2hhbmdlID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuc2F2ZURpc2FibGVkIHx8ICF0aGlzLl9lZGl0b3JSZWYgfHwgIXRoaXMuX2VkaXRvclJlZi5pc01vZGlmaWVkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2F2ZURpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgY29uc3QgQWNjZXNzaWJsZUJ1dHRvbiA9IHNkay5nZXRDb21wb25lbnQoJ2VsZW1lbnRzLkFjY2Vzc2libGVCdXR0b24nKTtcbiAgICAgICAgcmV0dXJuICg8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0VkaXRNZXNzYWdlQ29tcG9zZXJcIiwgdGhpcy5wcm9wcy5jbGFzc05hbWUpfSBvbktleURvd249e3RoaXMuX29uS2V5RG93bn0+XG4gICAgICAgICAgICA8QmFzaWNNZXNzYWdlQ29tcG9zZXJcbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuX3NldEVkaXRvclJlZn1cbiAgICAgICAgICAgICAgICBtb2RlbD17dGhpcy5tb2RlbH1cbiAgICAgICAgICAgICAgICByb29tPXt0aGlzLl9nZXRSb29tKCl9XG4gICAgICAgICAgICAgICAgaW5pdGlhbENhcmV0PXt0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRDYXJldCgpfVxuICAgICAgICAgICAgICAgIGxhYmVsPXtfdChcIkVkaXQgbWVzc2FnZVwiKX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5fb25DaGFuZ2V9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9FZGl0TWVzc2FnZUNvbXBvc2VyX2J1dHRvbnNcIj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwic2Vjb25kYXJ5XCIgb25DbGljaz17dGhpcy5fY2FuY2VsRWRpdH0+e190KFwiQ2FuY2VsXCIpfTwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvbiBraW5kPVwicHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuX3NlbmRFZGl0fSBkaXNhYmxlZD17dGhpcy5zdGF0ZS5zYXZlRGlzYWJsZWR9PlxuICAgICAgICAgICAgICAgICAgICB7X3QoXCJTYXZlXCIpfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj4pO1xuICAgIH1cbn1cbiJdfQ==