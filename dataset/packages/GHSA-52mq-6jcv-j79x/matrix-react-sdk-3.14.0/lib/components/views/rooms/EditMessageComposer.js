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

var _model = _interopRequireDefault(require("../../../editor/model"));

var _dom = require("../../../editor/dom");

var _serialize = require("../../../editor/serialize");

var _EventUtils = require("../../../utils/EventUtils");

var _deserialize = require("../../../editor/deserialize");

var _parts = require("../../../editor/parts");

var _EditorStateTransfer = _interopRequireDefault(require("../../../utils/EditorStateTransfer"));

var _classnames = _interopRequireDefault(require("classnames"));

var _matrixJsSdk = require("matrix-js-sdk");

var _BasicMessageComposer = _interopRequireDefault(require("./BasicMessageComposer"));

var _Keyboard = require("../../../Keyboard");

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _actions = require("../../../dispatcher/actions");

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _CountlyAnalytics = _interopRequireDefault(require("../../../CountlyAnalytics"));

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

class EditMessageComposer extends _react.default.Component {
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

      if (event.metaKey || event.altKey || event.shiftKey) {
        return;
      }

      const ctrlEnterToSend = !!_SettingsStore.default.getValue('MessageComposerInput.ctrlEnterToSend');
      const send = ctrlEnterToSend ? event.key === _Keyboard.Key.ENTER && (0, _Keyboard.isOnlyCtrlOrCmdKeyEvent)(event) : event.key === _Keyboard.Key.ENTER;

      if (send) {
        this._sendEdit();

        event.preventDefault();
      } else if (event.key === _Keyboard.Key.ESCAPE) {
        this._cancelEdit();
      } else if (event.key === _Keyboard.Key.ARROW_UP) {
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
      } else if (event.key === _Keyboard.Key.ARROW_DOWN) {
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

    if (previousEdit && (previousEdit.status === _matrixJsSdk.EventStatus.QUEUED || previousEdit.status === _matrixJsSdk.EventStatus.NOT_SENT)) {
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

}

exports.default = EditMessageComposer;
(0, _defineProperty2.default)(EditMessageComposer, "propTypes", {
  // the message event being edited
  editState: _propTypes.default.instanceOf(_EditorStateTransfer.default).isRequired
});
(0, _defineProperty2.default)(EditMessageComposer, "contextType", _MatrixClientContext.default);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0VkaXRNZXNzYWdlQ29tcG9zZXIuanMiXSwibmFtZXMiOlsiX2lzUmVwbHkiLCJteEV2ZW50IiwicmVsYXRlc1RvIiwiZ2V0Q29udGVudCIsImlzUmVwbHkiLCJnZXRIdG1sUmVwbHlGYWxsYmFjayIsImh0bWwiLCJmb3JtYXR0ZWRfYm9keSIsInJvb3ROb2RlIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwiYm9keSIsIm14UmVwbHkiLCJxdWVyeVNlbGVjdG9yIiwib3V0ZXJIVE1MIiwiZ2V0VGV4dFJlcGx5RmFsbGJhY2siLCJsaW5lcyIsInNwbGl0IiwibWFwIiwibCIsInRyaW0iLCJsZW5ndGgiLCJzdGFydHNXaXRoIiwiY3JlYXRlRWRpdENvbnRlbnQiLCJtb2RlbCIsImVkaXRlZEV2ZW50IiwiaXNFbW90ZSIsInBsYWluUHJlZml4IiwiaHRtbFByZWZpeCIsIm5ld0NvbnRlbnQiLCJjb250ZW50Qm9keSIsIm1zZ3R5cGUiLCJmb3JtYXR0ZWRCb2R5IiwiZm9yY2VIVE1MIiwiZm9ybWF0IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0SWQiLCJFZGl0TWVzc2FnZUNvbXBvc2VyIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiY29udGV4dCIsInJlZiIsIl9lZGl0b3JSZWYiLCJldmVudCIsImlzQ29tcG9zaW5nIiwibWV0YUtleSIsImFsdEtleSIsInNoaWZ0S2V5IiwiY3RybEVudGVyVG9TZW5kIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2VuZCIsImtleSIsIktleSIsIkVOVEVSIiwiX3NlbmRFZGl0IiwicHJldmVudERlZmF1bHQiLCJFU0NBUEUiLCJfY2FuY2VsRWRpdCIsIkFSUk9XX1VQIiwiaXNNb2RpZmllZCIsImlzQ2FyZXRBdFN0YXJ0IiwicHJldmlvdXNFdmVudCIsIl9nZXRSb29tIiwiZWRpdFN0YXRlIiwiZ2V0RXZlbnQiLCJkaXMiLCJkaXNwYXRjaCIsImFjdGlvbiIsIkFSUk9XX0RPV04iLCJpc0NhcmV0QXRFbmQiLCJuZXh0RXZlbnQiLCJmaXJlIiwiQWN0aW9uIiwiRm9jdXNDb21wb3NlciIsInN0YXJ0VGltZSIsIkNvdW50bHlBbmFseXRpY3MiLCJnZXRUaW1lc3RhbXAiLCJlZGl0Q29udGVudCIsIl9pc0NvbnRlbnRNb2RpZmllZCIsInJvb21JZCIsImdldFJvb21JZCIsIl9jYW5jZWxQcmV2aW91c1BlbmRpbmdFZGl0IiwicHJvbSIsInNlbmRNZXNzYWdlIiwiaW5zdGFuY2UiLCJ0cmFja1NlbmRNZXNzYWdlIiwic3RhdGUiLCJzYXZlRGlzYWJsZWQiLCJzZXRTdGF0ZSIsIl9jcmVhdGVFZGl0b3JNb2RlbCIsImdldFJvb20iLCJvbGRDb250ZW50Iiwib3JpZ2luYWxFdmVudCIsInByZXZpb3VzRWRpdCIsInJlcGxhY2luZ0V2ZW50Iiwic3RhdHVzIiwiRXZlbnRTdGF0dXMiLCJRVUVVRUQiLCJOT1RfU0VOVCIsImNhbmNlbFBlbmRpbmdFdmVudCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwic2VsIiwiZG9jdW1lbnQiLCJnZXRTZWxlY3Rpb24iLCJjYXJldCIsImZvY3VzTm9kZSIsInBhcnRzIiwic2VyaWFsaXplUGFydHMiLCJzZXRFZGl0b3JTdGF0ZSIsInJvb20iLCJwYXJ0Q3JlYXRvciIsIlBhcnRDcmVhdG9yIiwiaGFzRWRpdG9yU3RhdGUiLCJnZXRTZXJpYWxpemVkUGFydHMiLCJwIiwiZGVzZXJpYWxpemVQYXJ0IiwiRWRpdG9yTW9kZWwiLCJfZ2V0SW5pdGlhbENhcmV0UG9zaXRpb24iLCJjYXJldFBvc2l0aW9uIiwiZ2V0Q2FyZXQiLCJwb3NpdGlvbkZvck9mZnNldCIsIm9mZnNldCIsImF0Tm9kZUVuZCIsImdldFBvc2l0aW9uQXRFbmQiLCJyZW5kZXIiLCJBY2Nlc3NpYmxlQnV0dG9uIiwic2RrIiwiZ2V0Q29tcG9uZW50IiwiY2xhc3NOYW1lIiwiX29uS2V5RG93biIsIl9zZXRFZGl0b3JSZWYiLCJfb25DaGFuZ2UiLCJQcm9wVHlwZXMiLCJpbnN0YW5jZU9mIiwiRWRpdG9yU3RhdGVUcmFuc2ZlciIsImlzUmVxdWlyZWQiLCJNYXRyaXhDbGllbnRDb250ZXh0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQW5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNCQSxTQUFTQSxRQUFULENBQWtCQyxPQUFsQixFQUEyQjtBQUN2QixRQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBQ0UsVUFBUixHQUFxQixjQUFyQixDQUFsQjtBQUNBLFFBQU1DLE9BQU8sR0FBRyxDQUFDLEVBQUVGLFNBQVMsSUFBSUEsU0FBUyxDQUFDLGVBQUQsQ0FBeEIsQ0FBakI7QUFDQSxTQUFPRSxPQUFQO0FBQ0g7O0FBRUQsU0FBU0Msb0JBQVQsQ0FBOEJKLE9BQTlCLEVBQXVDO0FBQ25DLFFBQU1LLElBQUksR0FBR0wsT0FBTyxDQUFDRSxVQUFSLEdBQXFCSSxjQUFsQzs7QUFDQSxNQUFJLENBQUNELElBQUwsRUFBVztBQUNQLFdBQU8sRUFBUDtBQUNIOztBQUNELFFBQU1FLFFBQVEsR0FBRyxJQUFJQyxTQUFKLEdBQWdCQyxlQUFoQixDQUFnQ0osSUFBaEMsRUFBc0MsV0FBdEMsRUFBbURLLElBQXBFO0FBQ0EsUUFBTUMsT0FBTyxHQUFHSixRQUFRLENBQUNLLGFBQVQsQ0FBdUIsVUFBdkIsQ0FBaEI7QUFDQSxTQUFRRCxPQUFPLElBQUlBLE9BQU8sQ0FBQ0UsU0FBcEIsSUFBa0MsRUFBekM7QUFDSDs7QUFFRCxTQUFTQyxvQkFBVCxDQUE4QmQsT0FBOUIsRUFBdUM7QUFDbkMsUUFBTVUsSUFBSSxHQUFH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QUMsZ0JBQUQ7QUFBa0IsTUFBQSxJQUFJLEVBQUMsU0FBdkI7QUFBaUMsTUFBQSxPQUFPLEVBQUUsS0FBS0gsU0FBL0M7QUFBMEQsTUFBQSxRQUFRLEVBQUUsS0FBS2dDLEtBQUwsQ0FBV0M7QUFBL0UsT0FDSyx5QkFBRyxNQUFILENBREwsQ0FGSixDQVRJLENBQVI7QUFnQkg7O0FBOUw0RDs7OzhCQUE1Q3JELG1CLGVBQ0U7QUFDZjtBQUNBNkIsRUFBQUEsU0FBUyxFQUFFcUUsbUJBQVVDLFVBQVYsQ0FBcUJDLDRCQUFyQixFQUEwQ0M7QUFGdEMsQzs4QkFERnJHLG1CLGlCQU1Jc0csNEIiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IHtfdH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgRWRpdG9yTW9kZWwgZnJvbSAnLi4vLi4vLi4vZWRpdG9yL21vZGVsJztcbmltcG9ydCB7Z2V0Q2FyZXRPZmZzZXRBbmRUZXh0fSBmcm9tICcuLi8uLi8uLi9lZGl0b3IvZG9tJztcbmltcG9ydCB7aHRtbFNlcmlhbGl6ZUlmTmVlZGVkLCB0ZXh0U2VyaWFsaXplLCBjb250YWluc0Vtb3RlLCBzdHJpcEVtb3RlQ29tbWFuZH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL3NlcmlhbGl6ZSc7XG5pbXBvcnQge2ZpbmRFZGl0YWJsZUV2ZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9FdmVudFV0aWxzJztcbmltcG9ydCB7cGFyc2VFdmVudH0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2Rlc2VyaWFsaXplJztcbmltcG9ydCB7UGFydENyZWF0b3J9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQgRWRpdG9yU3RhdGVUcmFuc2ZlciBmcm9tICcuLi8uLi8uLi91dGlscy9FZGl0b3JTdGF0ZVRyYW5zZmVyJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtFdmVudFN0YXR1c30gZnJvbSAnbWF0cml4LWpzLXNkayc7XG5pbXBvcnQgQmFzaWNNZXNzYWdlQ29tcG9zZXIgZnJvbSBcIi4vQmFzaWNNZXNzYWdlQ29tcG9zZXJcIjtcbmltcG9ydCB7S2V5LCBpc09ubHlDdHJsT3JDbWRLZXlFdmVudH0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHtBY3Rpb259IGZyb20gXCIuLi8uLi8uLi9kaXNwYXRjaGVyL2FjdGlvbnNcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQgQ291bnRseUFuYWx5dGljcyBmcm9tIFwiLi4vLi4vLi4vQ291bnRseUFuYWx5dGljc1wiO1xuXG5mdW5jdGlvbiBfaXNSZXBseShteEV2ZW50KSB7XG4gICAgY29uc3QgcmVsYXRlc1RvID0gbXhFdmVudC5nZXRDb250ZW50KClbXCJtLnJlbGF0ZXNfdG9cIl07XG4gICAgY29uc3QgaXNSZXBseSA9ICEhKHJlbGF0ZXNUbyAmJiByZWxhdGVzVG9bXCJtLmluX3JlcGx5X3RvXCJdKTtcbiAgICByZXR1cm4gaXNSZXBseTtcbn1cblxuZnVuY3Rpb24gZ2V0SHRtbFJlcGx5RmFsbGJhY2sobXhFdmVudCkge1xuICAgIGNvbnN0IGh0bWwgPSBteEV2ZW50LmdldENvbnRlbnQoKS5mb3JtYXR0ZWRfYm9keTtcbiAgICBpZiAoIWh0bWwpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuICAgIGNvbnN0IHJvb3ROb2RlID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhodG1sLCBcInRleHQvaHRtbFwiKS5ib2R5O1xuICAgIGNvbnN0IG14UmVwbHkgPSByb290Tm9kZS5xdWVyeVNlbGVjdG9yKFwibXgtcmVwbHlcIik7XG4gICAgcmV0dXJuIChteFJlcGx5ICYmIG14UmVwbHkub3V0ZXJIVE1MKSB8fCBcIlwiO1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0UmVwbHlGYWxsYmFjayhteEV2ZW50KSB7XG4gICAgY29uc3QgYm9keSA9IG14RXZlbnQuZ2V0Q29udGVudCgpLmJvZHk7XG4gICAgY29uc3QgbGluZXMgPSBib2R5LnNwbGl0KFwiXFxuXCIpLm1hcChsID0+IGwudHJpbSgpKTtcbiAgICBpZiAobGluZXMubGVuZ3RoID4gMiAmJiBsaW5lc1swXS5zdGFydHNXaXRoKFwiPiBcIikgJiYgbGluZXNbMV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiBgJHtsaW5lc1swXX1cXG5cXG5gO1xuICAgIH1cbiAgICByZXR1cm4gXCJcIjtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWRpdENvbnRlbnQobW9kZWwsIGVkaXRlZEV2ZW50KSB7XG4gICAgY29uc3QgaXNFbW90ZSA9IGNvbnRhaW5zRW1vdGUobW9kZWwpO1xuICAgIGlmIChpc0Vtb3RlKSB7XG4gICAgICAgIG1vZGVsID0gc3RyaXBFbW90ZUNvbW1hbmQobW9kZWwpO1xuICAgIH1cbiAgICBjb25zdCBpc1JlcGx5ID0gX2lzUmVwbHkoZWRpdGVkRXZlbnQpO1xuICAgIGxldCBwbGFpblByZWZpeCA9IFwiXCI7XG4gICAgbGV0IGh0bWxQcmVmaXggPSBcIlwiO1xuXG4gICAgaWYgKGlzUmVwbHkpIHtcbiAgICAgICAgcGxhaW5QcmVmaXggPSBnZXRUZXh0UmVwbHlGYWxsYmFjayhlZGl0ZWRFdmVudCk7XG4gICAgICAgIGh0bWxQcmVmaXggPSBnZXRIdG1sUmVwbHlGYWxsYmFjayhlZGl0ZWRFdmVudCk7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IHRleHRTZXJpYWxpemUobW9kZWwpO1xuXG4gICAgY29uc3QgbmV3Q29udGVudCA9IHtcbiAgICAgICAgXCJtc2d0eXBlXCI6IGlzRW1vdGUgPyBcIm0uZW1vdGVcIiA6IFwibS50ZXh0XCIsXG4gICAgICAgIFwiYm9keVwiOiBib2R5LFxuICAgIH07XG4gICAgY29uc3QgY29udGVudEJvZHkgPSB7XG4gICAgICAgIG1zZ3R5cGU6IG5ld0NvbnRlbnQubXNndHlwZSxcbiAgICAgICAgYm9keTogYCR7cGxhaW5QcmVmaXh9ICogJHtib2R5fWAsXG4gICAgfTtcblxuICAgIGNvbnN0IGZvcm1hdHRlZEJvZHkgPSBodG1sU2VyaWFsaXplSWZOZWVkZWQobW9kZWwsIHtmb3JjZUhUTUw6IGlzUmVwbHl9KTtcbiAgICBpZiAoZm9ybWF0dGVkQm9keSkge1xuICAgICAgICBuZXdDb250ZW50LmZvcm1hdCA9IFwib3JnLm1hdHJpeC5jdXN0b20uaHRtbFwiO1xuICAgICAgICBuZXdDb250ZW50LmZvcm1hdHRlZF9ib2R5ID0gZm9ybWF0dGVkQm9keTtcbiAgICAgICAgY29udGVudEJvZHkuZm9ybWF0ID0gbmV3Q29udGVudC5mb3JtYXQ7XG4gICAgICAgIGNvbnRlbnRCb2R5LmZvcm1hdHRlZF9ib2R5ID0gYCR7aHRtbFByZWZpeH0gKiAke2Zvcm1hdHRlZEJvZHl9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIFwibS5uZXdfY29udGVudFwiOiBuZXdDb250ZW50LFxuICAgICAgICBcIm0ucmVsYXRlc190b1wiOiB7XG4gICAgICAgICAgICBcInJlbF90eXBlXCI6IFwibS5yZXBsYWNlXCIsXG4gICAgICAgICAgICBcImV2ZW50X2lkXCI6IGVkaXRlZEV2ZW50LmdldElkKCksXG4gICAgICAgIH0sXG4gICAgfSwgY29udGVudEJvZHkpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFZGl0TWVzc2FnZUNvbXBvc2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyB0aGUgbWVzc2FnZSBldmVudCBiZWluZyBlZGl0ZWRcbiAgICAgICAgZWRpdFN0YXRlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihFZGl0b3JTdGF0ZVRyYW5zZmVyKS5pc1JlcXVpcmVkLFxuICAgIH07XG5cbiAgICBzdGF0aWMgY29udGV4dFR5cGUgPSBNYXRyaXhDbGllbnRDb250ZXh0O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICAgICAgc3VwZXIocHJvcHMsIGNvbnRleHQpO1xuICAgICAgICB0aGlzLm1vZGVsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fZWRpdG9yUmVmID0gbnVsbDtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgc2F2ZURpc2FibGVkOiB0cnVlLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9jcmVhdGVFZGl0b3JNb2RlbCgpO1xuICAgIH1cblxuICAgIF9zZXRFZGl0b3JSZWYgPSByZWYgPT4ge1xuICAgICAgICB0aGlzLl9lZGl0b3JSZWYgPSByZWY7XG4gICAgfTtcblxuICAgIF9nZXRSb29tKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmdldFJvb20odGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRSb29tSWQoKSk7XG4gICAgfVxuXG4gICAgX29uS2V5RG93biA9IChldmVudCkgPT4ge1xuICAgICAgICAvLyBpZ25vcmUgYW55IGtleXByZXNzIHdoaWxlIGRvaW5nIElNRSBjb21wb3NpdGlvbnNcbiAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZi5pc0NvbXBvc2luZyhldmVudCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkgfHwgZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHJsRW50ZXJUb1NlbmQgPSAhIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ01lc3NhZ2VDb21wb3NlcklucHV0LmN0cmxFbnRlclRvU2VuZCcpO1xuICAgICAgICBjb25zdCBzZW5kID0gY3RybEVudGVyVG9TZW5kID8gZXZlbnQua2V5ID09PSBLZXkuRU5URVIgJiYgaXNPbmx5Q3RybE9yQ21kS2V5RXZlbnQoZXZlbnQpXG4gICAgICAgICAgICA6IGV2ZW50LmtleSA9PT0gS2V5LkVOVEVSO1xuICAgICAgICBpZiAoc2VuZCkge1xuICAgICAgICAgICAgdGhpcy5fc2VuZEVkaXQoKTtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBLZXkuRVNDQVBFKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxFZGl0KCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBLZXkuQVJST1dfVVApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9lZGl0b3JSZWYuaXNNb2RpZmllZCgpIHx8ICF0aGlzLl9lZGl0b3JSZWYuaXNDYXJldEF0U3RhcnQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzRXZlbnQgPSBmaW5kRWRpdGFibGVFdmVudCh0aGlzLl9nZXRSb29tKCksIGZhbHNlLCB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpLmdldElkKCkpO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2VkaXRfZXZlbnQnLCBldmVudDogcHJldmlvdXNFdmVudH0pO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBLZXkuQVJST1dfRE9XTikge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2VkaXRvclJlZi5pc01vZGlmaWVkKCkgfHwgIXRoaXMuX2VkaXRvclJlZi5pc0NhcmV0QXRFbmQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG5leHRFdmVudCA9IGZpbmRFZGl0YWJsZUV2ZW50KHRoaXMuX2dldFJvb20oKSwgdHJ1ZSwgdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRJZCgpKTtcbiAgICAgICAgICAgIGlmIChuZXh0RXZlbnQpIHtcbiAgICAgICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogJ2VkaXRfZXZlbnQnLCBldmVudDogbmV4dEV2ZW50fSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiAnZWRpdF9ldmVudCcsIGV2ZW50OiBudWxsfSk7XG4gICAgICAgICAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9jYW5jZWxFZGl0ID0gKCkgPT4ge1xuICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJlZGl0X2V2ZW50XCIsIGV2ZW50OiBudWxsfSk7XG4gICAgICAgIGRpcy5maXJlKEFjdGlvbi5Gb2N1c0NvbXBvc2VyKTtcbiAgICB9XG5cbiAgICBfaXNDb250ZW50TW9kaWZpZWQobmV3Q29udGVudCkge1xuICAgICAgICAvLyBpZiBub3RoaW5nIGhhcyBjaGFuZ2VkIHRoZW4gYmFpbFxuICAgICAgICBjb25zdCBvbGRDb250ZW50ID0gdGhpcy5wcm9wcy5lZGl0U3RhdGUuZ2V0RXZlbnQoKS5nZXRDb250ZW50KCk7XG4gICAgICAgIGlmICghdGhpcy5fZWRpdG9yUmVmLmlzTW9kaWZpZWQoKSB8fFxuICAgICAgICAgICAgKG9sZENvbnRlbnRbXCJtc2d0eXBlXCJdID09PSBuZXdDb250ZW50W1wibXNndHlwZVwiXSAmJiBvbGRDb250ZW50W1wiYm9keVwiXSA9PT0gbmV3Q29udGVudFtcImJvZHlcIl0gJiZcbiAgICAgICAgICAgIG9sZENvbnRlbnRbXCJmb3JtYXRcIl0gPT09IG5ld0NvbnRlbnRbXCJmb3JtYXRcIl0gJiZcbiAgICAgICAgICAgIG9sZENvbnRlbnRbXCJmb3JtYXR0ZWRfYm9keVwiXSA9PT0gbmV3Q29udGVudFtcImZvcm1hdHRlZF9ib2R5XCJdKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIF9zZW5kRWRpdCA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gQ291bnRseUFuYWx5dGljcy5nZXRUaW1lc3RhbXAoKTtcbiAgICAgICAgY29uc3QgZWRpdGVkRXZlbnQgPSB0aGlzLnByb3BzLmVkaXRTdGF0ZS5nZXRFdmVudCgpO1xuICAgICAgICBjb25zdCBlZGl0Q29udGVudCA9IGNyZWF0ZUVkaXRDb250ZW50KHRoaXMubW9kZWwsIGVkaXRlZEV2ZW50KTtcbiAgICAgICAgY29uc3QgbmV3Q29udGVudCA9IGVkaXRDb250ZW50W1wibS5uZXdfY29udGVudFwiXTtcblxuICAgICAgICAvLyBJZiBjb250ZW50IGlzIG1vZGlmaWVkIHRoZW4gc2VuZCBhbiB1cGRhdGVkIGV2ZW50IGludG8gdGhlIHJvb21cbiAgICAgICAgaWYgKHRoaXMuX2lzQ29udGVudE1vZGlmaWVkKG5ld0NvbnRlbnQpKSB7XG4gICAgICAgICAgICBjb25zdCByb29tSWQgPSBlZGl0ZWRFdmVudC5nZXRSb29tSWQoKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbFByZXZpb3VzUGVuZGluZ0VkaXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHByb20gPSB0aGlzLmNvbnRleHQuc2VuZE1lc3NhZ2Uocm9vbUlkLCBlZGl0Q29udGVudCk7XG4gICAgICAgICAgICBkaXMuZGlzcGF0Y2goe2FjdGlvbjogXCJtZXNzYWdlX3NlbnRcIn0pO1xuICAgICAgICAgICAgQ291bnRseUFuYWx5dGljcy5pbnN0YW5jZS50cmFja1NlbmRNZXNzYWdlKHN0YXJ0VGltZSwgcHJvbSwgcm9vbUlkLCB0cnVlLCBmYWxzZSwgZWRpdENvbnRlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2xvc2UgdGhlIGV2ZW50IGVkaXRpbmcgYW5kIGZvY3VzIGNvbXBvc2VyXG4gICAgICAgIGRpcy5kaXNwYXRjaCh7YWN0aW9uOiBcImVkaXRfZXZlbnRcIiwgZXZlbnQ6IG51bGx9KTtcbiAgICAgICAgZGlzLmZpcmUoQWN0aW9uLkZvY3VzQ29tcG9zZXIpO1xuICAgIH07XG5cbiAgICBfY2FuY2VsUHJldmlvdXNQZW5kaW5nRWRpdCgpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWxFdmVudCA9IHRoaXMucHJvcHMuZWRpdFN0YXRlLmdldEV2ZW50KCk7XG4gICAgICAgIGNvbnN0IHByZXZpb3VzRWRpdCA9IG9yaWdpbmFsRXZlbnQucmVwbGFjaW5nRXZlbnQoKTtcbiAgICAgICAgaWYgKHByZXZpb3VzRWRpdCAmJiAoXG4gICAgICAgICAgICBwcmV2aW91c0VkaXQuc3RhdHVzID09PSBFdmVudFN0YXR1cy5RVUVVRUQgfHxcbiAgICAgICAgICAgIHByZXZpb3VzRWRpdC5zdGF0dXMgPT09IEV2ZW50U3RhdHVzLk5PVF9TRU5UXG4gICAgICAgICkpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jYW5jZWxQZW5kaW5nRXZlbnQocHJldmlvdXNFZGl0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBzdG9yZSBjYXJldCBhbmQgc2VyaWFsaXplZCBwYXJ0cyBpbiB0aGVcbiAgICAgICAgLy8gZWRpdG9yc3RhdGUgc28gaXQgY2FuIGJlIHJlc3RvcmVkIHdoZW4gdGhlIHJlbW90ZSBlY2hvIGV2ZW50IHRpbGUgZ2V0cyByZW5kZXJlZFxuICAgICAgICAvLyBpbiBjYXNlIHdlJ3JlIGN1cnJlbnRseSBlZGl0aW5nIGEgcGVuZGluZyBldmVudFxuICAgICAgICBjb25zdCBzZWwgPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgbGV0IGNhcmV0O1xuICAgICAgICBpZiAoc2VsLmZvY3VzTm9kZSkge1xuICAgICAgICAgICAgY2FyZXQgPSBnZXRDYXJldE9mZnNldEFuZFRleHQodGhpcy5fZWRpdG9yUmVmLCBzZWwpLmNhcmV0O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhcnRzID0gdGhpcy5tb2RlbC5zZXJpYWxpemVQYXJ0cygpO1xuICAgICAgICAvLyBpZiBjYXJldCBpcyB1bmRlZmluZWQgYmVjYXVzZSBmb3Igc29tZSByZWFzb24gdGhlcmUgaXNuJ3QgYSB2YWxpZCBzZWxlY3Rpb24sXG4gICAgICAgIC8vIHRoZW4gd2hlbiBtb3VudGluZyB0aGUgZWRpdG9yIGFnYWluIHdpdGggdGhlIHNhbWUgZWRpdG9yIHN0YXRlLFxuICAgICAgICAvLyBpdCB3aWxsIHNldCB0aGUgY3Vyc29yIGF0IHRoZSBlbmQuXG4gICAgICAgIHRoaXMucHJvcHMuZWRpdFN0YXRlLnNldEVkaXRvclN0YXRlKGNhcmV0LCBwYXJ0cyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUVkaXRvck1vZGVsKCkge1xuICAgICAgICBjb25zdCB7ZWRpdFN0YXRlfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGNvbnN0IHJvb20gPSB0aGlzLl9nZXRSb29tKCk7XG4gICAgICAgIGNvbnN0IHBhcnRDcmVhdG9yID0gbmV3IFBhcnRDcmVhdG9yKHJvb20sIHRoaXMuY29udGV4dCk7XG4gICAgICAgIGxldCBwYXJ0cztcbiAgICAgICAgaWYgKGVkaXRTdGF0ZS5oYXNFZGl0b3JTdGF0ZSgpKSB7XG4gICAgICAgICAgICAvLyBpZiByZXN0b3Jpbmcgc3RhdGUgZnJvbSBhIHByZXZpb3VzIGVkaXRvcixcbiAgICAgICAgICAgIC8vIHJlc3RvcmUgc2VyaWFsaXplZCBwYXJ0cyBmcm9tIHRoZSBzdGF0ZVxuICAgICAgICAgICAgcGFydHMgPSBlZGl0U3RhdGUuZ2V0U2VyaWFsaXplZFBhcnRzKCkubWFwKHAgPT4gcGFydENyZWF0b3IuZGVzZXJpYWxpemVQYXJ0KHApKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgcGFyc2UgdGhlIGJvZHkgb2YgdGhlIGV2ZW50XG4gICAgICAgICAgICBwYXJ0cyA9IHBhcnNlRXZlbnQoZWRpdFN0YXRlLmdldEV2ZW50KCksIHBhcnRDcmVhdG9yKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1vZGVsID0gbmV3IEVkaXRvck1vZGVsKHBhcnRzLCBwYXJ0Q3JlYXRvcik7XG4gICAgfVxuXG4gICAgX2dldEluaXRpYWxDYXJldFBvc2l0aW9uKCkge1xuICAgICAgICBjb25zdCB7ZWRpdFN0YXRlfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIGxldCBjYXJldFBvc2l0aW9uO1xuICAgICAgICBpZiAoZWRpdFN0YXRlLmhhc0VkaXRvclN0YXRlKCkgJiYgZWRpdFN0YXRlLmdldENhcmV0KCkpIHtcbiAgICAgICAgICAgIC8vIGlmIHJlc3RvcmluZyBzdGF0ZSBmcm9tIGEgcHJldmlvdXMgZWRpdG9yLFxuICAgICAgICAgICAgLy8gcmVzdG9yZSBjYXJldCBwb3NpdGlvbiBmcm9tIHRoZSBzdGF0ZVxuICAgICAgICAgICAgY29uc3QgY2FyZXQgPSBlZGl0U3RhdGUuZ2V0Q2FyZXQoKTtcbiAgICAgICAgICAgIGNhcmV0UG9zaXRpb24gPSB0aGlzLm1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgc2V0IGl0IGF0IHRoZSBlbmRcbiAgICAgICAgICAgIGNhcmV0UG9zaXRpb24gPSB0aGlzLm1vZGVsLmdldFBvc2l0aW9uQXRFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FyZXRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICBfb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5zYXZlRGlzYWJsZWQgfHwgIXRoaXMuX2VkaXRvclJlZiB8fCAhdGhpcy5fZWRpdG9yUmVmLmlzTW9kaWZpZWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzYXZlRGlzYWJsZWQ6IGZhbHNlLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfRWRpdE1lc3NhZ2VDb21wb3NlclwiLCB0aGlzLnByb3BzLmNsYXNzTmFtZSl9IG9uS2V5RG93bj17dGhpcy5fb25LZXlEb3dufT5cbiAgICAgICAgICAgIDxCYXNpY01lc3NhZ2VDb21wb3NlclxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5fc2V0RWRpdG9yUmVmfVxuICAgICAgICAgICAgICAgIG1vZGVsPXt0aGlzLm1vZGVsfVxuICAgICAgICAgICAgICAgIHJvb209e3RoaXMuX2dldFJvb20oKX1cbiAgICAgICAgICAgICAgICBpbml0aWFsQ2FyZXQ9e3RoaXMucHJvcHMuZWRpdFN0YXRlLmdldENhcmV0KCl9XG4gICAgICAgICAgICAgICAgbGFiZWw9e190KFwiRWRpdCBtZXNzYWdlXCIpfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLl9vbkNoYW5nZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X0VkaXRNZXNzYWdlQ29tcG9zZXJfYnV0dG9uc1wiPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJzZWNvbmRhcnlcIiBvbkNsaWNrPXt0aGlzLl9jYW5jZWxFZGl0fT57X3QoXCJDYW5jZWxcIil9PC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGtpbmQ9XCJwcmltYXJ5XCIgb25DbGljaz17dGhpcy5fc2VuZEVkaXR9IGRpc2FibGVkPXt0aGlzLnN0YXRlLnNhdmVEaXNhYmxlZH0+XG4gICAgICAgICAgICAgICAgICAgIHtfdChcIlNhdmVcIil9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxufVxuIl19