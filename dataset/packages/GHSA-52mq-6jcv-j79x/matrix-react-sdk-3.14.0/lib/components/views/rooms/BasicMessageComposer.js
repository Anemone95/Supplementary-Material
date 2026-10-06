"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _classnames = _interopRequireDefault(require("classnames"));

var _react = _interopRequireWildcard(require("react"));

var _emoticon = _interopRequireDefault(require("emojibase-regex/emoticon"));

var _history = _interopRequireDefault(require("../../../editor/history"));

var _caret = require("../../../editor/caret");

var _operations = require("../../../editor/operations");

var _dom = require("../../../editor/dom");

var _Autocomplete = _interopRequireWildcard(require("../rooms/Autocomplete"));

var _parts = require("../../../editor/parts");

var _deserialize = require("../../../editor/deserialize");

var _render = require("../../../editor/render");

var _TypingStore = _interopRequireDefault(require("../../../stores/TypingStore"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _Keyboard = require("../../../Keyboard");

var _emoji = require("../../../emoji");

var _SlashCommands = require("../../../SlashCommands");

var _range = _interopRequireDefault(require("../../../editor/range"));

var _MessageComposerFormatBar = _interopRequireDefault(require("./MessageComposerFormatBar"));

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
// matches emoticons which follow the start of a line or whitespace
const REGEX_EMOTICON_WHITESPACE = new RegExp('(?:^|\\s)(' + _emoticon.default.source + ')\\s$');
const IS_MAC = navigator.platform.indexOf("Mac") !== -1;

function ctrlShortcutLabel(key) {
  return (IS_MAC ? "⌘" : "Ctrl") + "+" + key;
}

function cloneSelection(selection
/*: Selection*/
)
/*: Partial<Selection>*/
{
  return {
    anchorNode: selection.anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode: selection.focusNode,
    focusOffset: selection.focusOffset,
    isCollapsed: selection.isCollapsed,
    rangeCount: selection.rangeCount,
    type: selection.type
  };
}

function selectionEquals(a
/*: Partial<Selection>*/
, b
/*: Selection*/
)
/*: boolean*/
{
  return a.anchorNode === b.anchorNode && a.anchorOffset === b.anchorOffset && a.focusNode === b.focusNode && a.focusOffset === b.focusOffset && a.isCollapsed === b.isCollapsed && a.rangeCount === b.rangeCount && a.type === b.type;
}

var Formatting;

(function (Formatting) {
  Formatting["Bold"] = "bold";
  Formatting["Italics"] = "italics";
  Formatting["Strikethrough"] = "strikethrough";
  Formatting["Code"] = "code";
  Formatting["Quote"] = "quote";
})(Formatting || (Formatting = {}));

class BasicMessageEditor extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "editorRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "autocompleteRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "formatBarRef", /*#__PURE__*/(0, _react.createRef)());
    (0, _defineProperty2.default)(this, "modifiedFlag", false);
    (0, _defineProperty2.default)(this, "isIMEComposing", false);
    (0, _defineProperty2.default)(this, "hasTextSelected", false);
    (0, _defineProperty2.default)(this, "_isCaretAtEnd", void 0);
    (0, _defineProperty2.default)(this, "lastCaret", void 0);
    (0, _defineProperty2.default)(this, "lastSelection", void 0);
    (0, _defineProperty2.default)(this, "emoticonSettingHandle", void 0);
    (0, _defineProperty2.default)(this, "shouldShowPillAvatarSettingHandle", void 0);
    (0, _defineProperty2.default)(this, "historyManager", new _history.default());
    (0, _defineProperty2.default)(this, "replaceEmoticon", (caretPosition
    /*: DocumentPosition*/
    ) => {
      const {
        model
      } = this.props;
      const range = model.startRange(caretPosition); // expand range max 8 characters backwards from caretPosition,
      // as a space to look for an emoticon

      let n = 8;
      range.expandBackwardsWhile((index, offset) => {
        const part = model.parts[index];
        n -= 1;
        return n >= 0 && (part.type === "plain" || part.type === "pill-candidate");
      });
      const emoticonMatch = REGEX_EMOTICON_WHITESPACE.exec(range.text);

      if (emoticonMatch) {
        const query = emoticonMatch[1].replace("-", ""); // try both exact match and lower-case, this means that xd won't match xD but :P will match :p

        const data = _emoji.EMOTICON_TO_EMOJI.get(query) || _emoji.EMOTICON_TO_EMOJI.get(query.toLowerCase());

        if (data) {
          const {
            partCreator
          } = model;
          const hasPrecedingSpace = emoticonMatch[0][0] === " "; // we need the range to only comprise of the emoticon
          // because we'll replace the whole range with an emoji,
          // so move the start forward to the start of the emoticon.
          // Take + 1 because index is reported without the possible preceding space.

          range.moveStart(emoticonMatch.index + (hasPrecedingSpace ? 1 : 0)); // this returns the amount of added/removed characters during the replace
          // so the caret position can be adjusted.

          return range.replace([partCreator.plain(data.unicode + " ")]);
        }
      }
    });
    (0, _defineProperty2.default)(this, "updateEditorState", (selection
    /*: Caret*/
    , inputType
    /*: string*/
    , diff
    /*: IDiff*/
    ) => {
      (0, _render.renderModel)(this.editorRef.current, this.props.model);

      if (selection) {
        // set the caret/selection
        try {
          (0, _caret.setSelection)(this.editorRef.current, this.props.model, selection);
        } catch (err) {
          console.error(err);
        } // if caret selection is a range, take the end position


        const position = selection instanceof _range.default ? selection.end : selection;
        this.setLastCaretFromPosition(position);
      }

      const {
        isEmpty
      } = this.props.model;

      if (this.props.placeholder) {
        if (isEmpty) {
          this.showPlaceholder();
        } else {
          this.hidePlaceholder();
        }
      }

      if (isEmpty) {
        this.formatBarRef.current.hide();
      }

      this.setState({
        autoComplete: this.props.model.autoComplete
      });
      this.historyManager.tryPush(this.props.model, selection, inputType, diff);
      let isTyping = !this.props.model.isEmpty; // If the user is entering a command, only consider them typing if it is one which sends a message into the room

      if (isTyping && this.props.model.parts[0].type === "command") {
        const {
          cmd
        } = (0, _SlashCommands.parseCommandString)(this.props.model.parts[0].text);

        const command = _SlashCommands.CommandMap.get(cmd);

        if (!command || !command.isEnabled() || command.category !== _SlashCommands.CommandCategories.messages) {
          isTyping = false;
        }
      }

      _TypingStore.default.sharedInstance().setSelfTyping(this.props.room.roomId, isTyping);

      if (this.props.onChange) {
        this.props.onChange();
      }
    });
    (0, _defineProperty2.default)(this, "onCompositionStart", () => {
      this.isIMEComposing = true; // even if the model is empty, the composition text shouldn't be mixed with the placeholder

      this.hidePlaceholder();
    });
    (0, _defineProperty2.default)(this, "onCompositionEnd", () => {
      this.isIMEComposing = false; // some browsers (Chrome) don't fire an input event after ending a composition,
      // so trigger a model update after the composition is done by calling the input handler.
      // however, modifying the DOM (caused by the editor model update) from the compositionend handler seems
      // to confuse the IME in Chrome, likely causing https://github.com/vector-im/element-web/issues/10913 ,
      // so we do it async
      // however, doing this async seems to break things in Safari for some reason, so browser sniff.

      const ua = navigator.userAgent.toLowerCase();
      const isSafari = ua.includes('safari/') && !ua.includes('chrome/');

      if (isSafari) {
        this.onInput({
          inputType: "insertCompositionText"
        });
      } else {
        Promise.resolve().then(() => {
          this.onInput({
            inputType: "insertCompositionText"
          });
        });
      }
    });
    (0, _defineProperty2.default)(this, "onCutCopy", (event
    /*: ClipboardEvent*/
    , type
    /*: string*/
    ) => {
      const selection = document.getSelection();
      const text = selection.toString();

      if (text) {
        const {
          model
        } = this.props;
        const range = (0, _dom.getRangeForSelection)(this.editorRef.current, model, selection);
        const selectedParts = range.parts.map(p => p.serialize());
        event.clipboardData.setData("application/x-element-composer", JSON.stringify(selectedParts));
        event.clipboardData.setData("text/plain", text); // so plain copy/paste works

        if (type === "cut") {
          // Remove the text, updating the model as appropriate
          this.modifiedFlag = true;
          (0, _operations.replaceRangeAndMoveCaret)(range, []);
        }

        event.preventDefault();
      }
    });
    (0, _defineProperty2.default)(this, "onCopy", (event
    /*: ClipboardEvent*/
    ) => {
      this.onCutCopy(event, "copy");
    });
    (0, _defineProperty2.default)(this, "onCut", (event
    /*: ClipboardEvent*/
    ) => {
      this.onCutCopy(event, "cut");
    });
    (0, _defineProperty2.default)(this, "onPaste", (event
    /*: ClipboardEvent<HTMLDivElement>*/
    ) => {
      event.preventDefault(); // we always handle the paste ourselves

      if (this.props.onPaste && this.props.onPaste(event, this.props.model)) {
        // to prevent double handling, allow props.onPaste to skip internal onPaste
        return true;
      }

      const {
        model
      } = this.props;
      const {
        partCreator
      } = model;
      const partsText = event.clipboardData.getData("application/x-element-composer");
      let parts;

      if (partsText) {
        const serializedTextParts = JSON.parse(partsText);
        const deserializedParts = serializedTextParts.map(p => partCreator.deserializePart(p));
        parts = deserializedParts;
      } else {
        const text = event.clipboardData.getData("text/plain");
        parts = (0, _deserialize.parsePlainTextMessage)(text, partCreator);
      }

      this.modifiedFlag = true;
      const range = (0, _dom.getRangeForSelection)(this.editorRef.current, model, document.getSelection());
      (0, _operations.replaceRangeAndMoveCaret)(range, parts);
    });
    (0, _defineProperty2.default)(this, "onInput", (event
    /*: Partial<InputEvent>*/
    ) => {
      // ignore any input while doing IME compositions
      if (this.isIMEComposing) {
        return;
      }

      this.modifiedFlag = true;
      const sel = document.getSelection();
      const {
        caret,
        text
      } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, sel);
      this.props.model.update(text, event.inputType, caret);
    });
    (0, _defineProperty2.default)(this, "onBlur", () => {
      document.removeEventListener("selectionchange", this.onSelectionChange);
    });
    (0, _defineProperty2.default)(this, "onFocus", () => {
      document.addEventListener("selectionchange", this.onSelectionChange); // force to recalculate

      this.lastSelection = null;
      this.refreshLastCaretIfNeeded();
    });
    (0, _defineProperty2.default)(this, "onSelectionChange", () => {
      const {
        isEmpty
      } = this.props.model;
      this.refreshLastCaretIfNeeded();
      const selection = document.getSelection();

      if (this.hasTextSelected && selection.isCollapsed) {
        this.hasTextSelected = false;

        if (this.formatBarRef.current) {
          this.formatBarRef.current.hide();
        }
      } else if (!selection.isCollapsed && !isEmpty) {
        this.hasTextSelected = true;

        if (this.formatBarRef.current) {
          const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
          this.formatBarRef.current.showAt(selectionRect);
        }
      }
    });
    (0, _defineProperty2.default)(this, "onKeyDown", (event
    /*: React.KeyboardEvent*/
    ) => {
      const model = this.props.model;
      const modKey = IS_MAC ? event.metaKey : event.ctrlKey;
      let handled = false; // format bold

      if (modKey && event.key === _Keyboard.Key.B) {
        this.onFormatAction(Formatting.Bold);
        handled = true; // format italics
      } else if (modKey && event.key === _Keyboard.Key.I) {
        this.onFormatAction(Formatting.Italics);
        handled = true; // format quote
      } else if (modKey && event.key === _Keyboard.Key.GREATER_THAN) {
        this.onFormatAction(Formatting.Quote);
        handled = true; // redo
      } else if (!IS_MAC && modKey && event.key === _Keyboard.Key.Y || IS_MAC && modKey && event.shiftKey && event.key === _Keyboard.Key.Z) {
        if (this.historyManager.canRedo()) {
          const {
            parts,
            caret
          } = this.historyManager.redo(); // pass matching inputType so historyManager doesn't push echo
          // when invoked from rerender callback.

          model.reset(parts, caret, "historyRedo");
        }

        handled = true; // undo
      } else if (modKey && event.key === _Keyboard.Key.Z) {
        if (this.historyManager.canUndo()) {
          const {
            parts,
            caret
          } = this.historyManager.undo(this.props.model); // pass matching inputType so historyManager doesn't push echo
          // when invoked from rerender callback.

          model.reset(parts, caret, "historyUndo");
        }

        handled = true; // insert newline on Shift+Enter
      } else if (event.key === _Keyboard.Key.ENTER && (event.shiftKey || IS_MAC && event.altKey)) {
        this.insertText("\n");
        handled = true; // move selection to start of composer
      } else if (modKey && event.key === _Keyboard.Key.HOME && !event.shiftKey) {
        (0, _caret.setSelection)(this.editorRef.current, model, {
          index: 0,
          offset: 0
        });
        handled = true; // move selection to end of composer
      } else if (modKey && event.key === _Keyboard.Key.END && !event.shiftKey) {
        (0, _caret.setSelection)(this.editorRef.current, model, {
          index: model.parts.length - 1,
          offset: model.parts[model.parts.length - 1].text.length
        });
        handled = true; // autocomplete or enter to send below shouldn't have any modifier keys pressed.
      } else {
        const metaOrAltPressed = event.metaKey || event.altKey;
        const modifierPressed = metaOrAltPressed || event.shiftKey;

        if (model.autoComplete && model.autoComplete.hasCompletions()) {
          const autoComplete = model.autoComplete;

          switch (event.key) {
            case _Keyboard.Key.ARROW_UP:
              if (!modifierPressed) {
                autoComplete.onUpArrow(event);
                handled = true;
              }

              break;

            case _Keyboard.Key.ARROW_DOWN:
              if (!modifierPressed) {
                autoComplete.onDownArrow(event);
                handled = true;
              }

              break;

            case _Keyboard.Key.TAB:
              if (!metaOrAltPressed) {
                autoComplete.onTab(event);
                handled = true;
              }

              break;

            case _Keyboard.Key.ESCAPE:
              if (!modifierPressed) {
                autoComplete.onEscape(event);
                handled = true;
              }

              break;

            default:
              return;
            // don't preventDefault on anything else
          }
        } else if (event.key === _Keyboard.Key.TAB) {
          this.tabCompleteName(event);
          handled = true;
        } else if (event.key === _Keyboard.Key.BACKSPACE || event.key === _Keyboard.Key.DELETE) {
          this.formatBarRef.current.hide();
        }
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
    (0, _defineProperty2.default)(this, "onAutoCompleteConfirm", (completion
    /*: ICompletion*/
    ) => {
      this.modifiedFlag = true;
      this.props.model.autoComplete.onComponentConfirm(completion);
    });
    (0, _defineProperty2.default)(this, "onAutoCompleteSelectionChange", (completion
    /*: ICompletion*/
    , completionIndex
    /*: number*/
    ) => {
      this.modifiedFlag = true;
      this.props.model.autoComplete.onComponentSelectionChange(completion);
      this.setState({
        completionIndex
      });
    });
    (0, _defineProperty2.default)(this, "configureEmoticonAutoReplace", () => {
      const shouldReplace = _SettingsStore.default.getValue('MessageComposerInput.autoReplaceEmoji');

      this.props.model.setTransformCallback(shouldReplace ? this.replaceEmoticon : null);
    });
    (0, _defineProperty2.default)(this, "configureShouldShowPillAvatar", () => {
      const showPillAvatar = _SettingsStore.default.getValue("Pill.shouldShowPillAvatar");

      this.setState({
        showPillAvatar
      });
    });
    (0, _defineProperty2.default)(this, "onFormatAction", (action
    /*: Formatting*/
    ) => {
      const range = (0, _dom.getRangeForSelection)(this.editorRef.current, this.props.model, document.getSelection()); // trim the range as we want it to exclude leading/trailing spaces

      range.trim();

      if (range.length === 0) {
        return;
      }

      this.historyManager.ensureLastChangesPushed(this.props.model);
      this.modifiedFlag = true;

      switch (action) {
        case Formatting.Bold:
          (0, _operations.toggleInlineFormat)(range, "**");
          break;

        case Formatting.Italics:
          (0, _operations.toggleInlineFormat)(range, "_");
          break;

        case Formatting.Strikethrough:
          (0, _operations.toggleInlineFormat)(range, "<del>", "</del>");
          break;

        case Formatting.Code:
          (0, _operations.formatRangeAsCode)(range);
          break;

        case Formatting.Quote:
          (0, _operations.formatRangeAsQuote)(range);
          break;
      }
    });
    this.state = {
      showPillAvatar: _SettingsStore.default.getValue("Pill.shouldShowPillAvatar")
    };
    this.emoticonSettingHandle = _SettingsStore.default.watchSetting('MessageComposerInput.autoReplaceEmoji', null, this.configureEmoticonAutoReplace);
    this.configureEmoticonAutoReplace();
    this.shouldShowPillAvatarSettingHandle = _SettingsStore.default.watchSetting("Pill.shouldShowPillAvatar", null, this.configureShouldShowPillAvatar);
  }

  componentDidUpdate(prevProps
  /*: IProps*/
  ) {
    if (this.props.placeholder !== prevProps.placeholder && this.props.placeholder) {
      const {
        isEmpty
      } = this.props.model;

      if (isEmpty) {
        this.showPlaceholder();
      } else {
        this.hidePlaceholder();
      }
    }
  }

  showPlaceholder() {
    // escape single quotes
    const placeholder = this.props.placeholder.replace(/'/g, '\\\'');
    this.editorRef.current.style.setProperty("--placeholder", `'${placeholder}'`);
    this.editorRef.current.classList.add("mx_BasicMessageComposer_inputEmpty");
  }

  hidePlaceholder() {
    this.editorRef.current.classList.remove("mx_BasicMessageComposer_inputEmpty");
    this.editorRef.current.style.removeProperty("--placeholder");
  }

  isComposing(event
  /*: React.KeyboardEvent*/
  ) {
    // checking the event.isComposing flag just in case any browser out there
    // emits events related to the composition after compositionend
    // has been fired
    return !!(this.isIMEComposing || event.nativeEvent && event.nativeEvent.isComposing);
  }

  insertText(textToInsert
  /*: string*/
  , inputType = "insertText") {
    const sel = document.getSelection();
    const {
      caret,
      text
    } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, sel);
    const newText = text.substr(0, caret.offset) + textToInsert + text.substr(caret.offset);
    caret.offset += textToInsert.length;
    this.modifiedFlag = true;
    this.props.model.update(newText, inputType, caret);
  } // this is used later to see if we need to recalculate the caret
  // on selectionchange. If it is just a consequence of typing
  // we don't need to. But if the user is navigating the caret without input
  // we need to recalculate it, to be able to know where to insert content after
  // losing focus


  setLastCaretFromPosition(position
  /*: DocumentPosition*/
  ) {
    const {
      model
    } = this.props;
    this._isCaretAtEnd = position.isAtEnd(model);
    this.lastCaret = position.asOffset(model);
    this.lastSelection = cloneSelection(document.getSelection());
  }

  refreshLastCaretIfNeeded() {
    // XXX: needed when going up and down in editing messages ... not sure why yet
    // because the editors should stop doing this when when blurred ...
    // maybe it's on focus and the _editorRef isn't available yet or something.
    if (!this.editorRef.current) {
      return;
    }

    const selection = document.getSelection();

    if (!this.lastSelection || !selectionEquals(this.lastSelection, selection)) {
      this.lastSelection = cloneSelection(selection);
      const {
        caret,
        text
      } = (0, _dom.getCaretOffsetAndText)(this.editorRef.current, selection);
      this.lastCaret = caret;
      this._isCaretAtEnd = caret.offset === text.length;
    }

    return this.lastCaret;
  }

  clearUndoHistory() {
    this.historyManager.clear();
  }

  getCaret() {
    return this.lastCaret;
  }

  isSelectionCollapsed() {
    return !this.lastSelection || this.lastSelection.isCollapsed;
  }

  isCaretAtStart() {
    return this.getCaret().offset === 0;
  }

  isCaretAtEnd() {
    return this._isCaretAtEnd;
  }

  async tabCompleteName(event
  /*: React.KeyboardEvent*/
  ) {
    try {
      await new Promise(resolve => this.setState({
        showVisualBell: false
      }, resolve));
      const {
        model
      } = this.props;
      const caret = this.getCaret();
      const position = model.positionForOffset(caret.offset, caret.atNodeEnd);
      const range = model.startRange(position);
      range.expandBackwardsWhile((index, offset, part) => {
        return part.text[offset] !== " " && part.text[offset] !== "+" && (part.type === "plain" || part.type === "pill-candidate" || part.type === "command");
      });
      const {
        partCreator
      } = model; // await for auto-complete to be open

      await model.transform(() => {
        const addedLen = range.replace([partCreator.pillCandidate(range.text)]);
        return model.positionForOffset(caret.offset + addedLen, true);
      }); // Don't try to do things with the autocomplete if there is none shown

      if (model.autoComplete) {
        await model.autoComplete.onTab(event);

        if (!model.autoComplete.hasSelection()) {
          this.setState({
            showVisualBell: true
          });
          model.autoComplete.close();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  isModified() {
    return this.modifiedFlag;
  }

  componentWillUnmount() {
    document.removeEventListener("selectionchange", this.onSelectionChange);
    this.editorRef.current.removeEventListener("input", this.onInput, true);
    this.editorRef.current.removeEventListener("compositionstart", this.onCompositionStart, true);
    this.editorRef.current.removeEventListener("compositionend", this.onCompositionEnd, true);

    _SettingsStore.default.unwatchSetting(this.emoticonSettingHandle);

    _SettingsStore.default.unwatchSetting(this.shouldShowPillAvatarSettingHandle);
  }

  componentDidMount() {
    const model = this.props.model;
    model.setUpdateCallback(this.updateEditorState);
    const partCreator = model.partCreator; // TODO: does this allow us to get rid of EditorStateTransfer?
    // not really, but we could not serialize the parts, and just change the autoCompleter

    partCreator.setAutoCompleteCreator((0, _parts.getAutoCompleteCreator)(() => this.autocompleteRef.current, query => new Promise(resolve => this.setState({
      query
    }, resolve)))); // initial render of model

    this.updateEditorState(this.getInitialCaretPosition()); // attach input listener by hand so React doesn't proxy the events,
    // as the proxied event doesn't support inputType, which we need.

    this.editorRef.current.addEventListener("input", this.onInput, true);
    this.editorRef.current.addEventListener("compositionstart", this.onCompositionStart, true);
    this.editorRef.current.addEventListener("compositionend", this.onCompositionEnd, true);
    this.editorRef.current.focus();
  }

  getInitialCaretPosition() {
    let caretPosition;

    if (this.props.initialCaret) {
      // if restoring state from a previous editor,
      // restore caret position from the state
      const caret = this.props.initialCaret;
      caretPosition = this.props.model.positionForOffset(caret.offset, caret.atNodeEnd);
    } else {
      // otherwise, set it at the end
      caretPosition = this.props.model.getPositionAtEnd();
    }

    return caretPosition;
  }

  render() {
    let autoComplete;

    if (this.state.autoComplete) {
      const query = this.state.query;
      const queryLen = query.length;
      autoComplete = /*#__PURE__*/_react.default.createElement("div", {
        className: "mx_BasicMessageComposer_AutoCompleteWrapper"
      }, /*#__PURE__*/_react.default.createElement(_Autocomplete.default, {
        ref: this.autocompleteRef,
        query: query,
        onConfirm: this.onAutoCompleteConfirm,
        onSelectionChange: this.onAutoCompleteSelectionChange,
        selection: {
          beginning: true,
          end: queryLen,
          start: queryLen
        },
        room: this.props.room
      }));
    }

    const wrapperClasses = (0, _classnames.default)("mx_BasicMessageComposer", {
      "mx_BasicMessageComposer_input_error": this.state.showVisualBell
    });
    const classes = (0, _classnames.default)("mx_BasicMessageComposer_input", {
      "mx_BasicMessageComposer_input_shouldShowPillAvatar": this.state.showPillAvatar
    });
    const shortcuts = {
      bold: ctrlShortcutLabel("B"),
      italics: ctrlShortcutLabel("I"),
      quote: ctrlShortcutLabel(">")
    };
    const {
      completionIndex
    } = this.state;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: wrapperClasses
    }, autoComplete, /*#__PURE__*/_react.default.createElement(_MessageComposerFormatBar.default, {
      ref: this.formatBarRef,
      onAction: this.onFormatAction,
      shortcuts: shortcuts
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: classes,
      contentEditable: "true",
      tabIndex: 0,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
      onCopy: this.onCopy,
      onCut: this.onCut,
      onPaste: this.onPaste,
      onKeyDown: this.onKeyDown,
      ref: this.editorRef,
      "aria-label": this.props.label,
      role: "textbox",
      "aria-multiline": "true",
      "aria-autocomplete": "both",
      "aria-haspopup": "listbox",
      "aria-expanded": Boolean(this.state.autoComplete),
      "aria-activedescendant": completionIndex >= 0 ? (0, _Autocomplete.generateCompletionDomId)(completionIndex) : undefined,
      dir: "auto"
    }));
  }

  focus() {
    this.editorRef.current.focus();
  }

}

exports.default = BasicMessageEditor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0Jhc2ljTWVzc2FnZUNvbXBvc2VyLnRzeCJdLCJuYW1lcyI6WyJSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFIiwiUmVnRXhwIiwiRU1PVElDT05fUkVHRVgiLCJzb3VyY2UiLCJJU19NQUMiLCJuYXZpZ2F0b3IiLCJwbGF0Zm9ybSIsImluZGV4T2YiLCJjdHJsU2hvcnRjdXRMYWJlbCIsImtleSIsImNsb25lU2VsZWN0aW9uIiwic2VsZWN0aW9uIiwiYW5jaG9yTm9kZSIsImFuY2hvck9mZnNldCIsImZvY3VzTm9kZSIsImZvY3VzT2Zmc2V0IiwiaXNDb2xsYXBzZWQiLCJyYW5nZUNvdW50IiwidHlwZSIsInNlbGVjdGlvbkVxdWFscyIsImEiLCJiIiwiRm9ybWF0dGluZyIsIkJhc2ljTWVzc2FnZUVkaXRvciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIkhpc3RvcnlNYW5hZ2VyIiwiY2FyZXRQb3NpdGlvbiIsIm1vZGVsIiwicmFuZ2UiLCJzdGFydFJhbmdlIiwibiIsImV4cGFuZEJhY2t3YXJkc1doaWxlIiwiaW5kZXgiLCJvZmZzZXQiLCJwYXJ0IiwicGFydHMiLCJlbW90aWNvbk1hdGNoIiwiZXhlYyIsInRleHQiLCJxdWVyeSIsInJlcGxhY2UiLCJkYXRhIiwiRU1PVElDT05fVE9fRU1PSkkiLCJnZXQiLCJ0b0xvd2VyQ2FzZSIsInBhcnRDcmVhdG9yIiwiaGFzUHJlY2VkaW5nU3BhY2UiLCJtb3ZlU3RhcnQiLCJwbGFpbiIsInVuaWNvZGUiLCJpbnB1dFR5cGUiLCJkaWZmIiwiZWRpdG9yUmVmIiwiY3VycmVudCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInBvc2l0aW9uIiwiUmFuZ2UiLCJlbmQiLCJzZXRMYXN0Q2FyZXRGcm9tUG9zaXRpb24iLCJpc0VtcHR5IiwicGxhY2Vob2xkZXIiLCJzaG93UGxhY2Vob2xkZXIiLCJoaWRlUGxhY2Vob2xkZXIiLCJmb3JtYXRCYXJSZWYiLCJoaWRlIiwic2V0U3RhdGUiLCJhdXRvQ29tcGxldGUiLCJoaXN0b3J5TWFuYWdlciIsInRyeVB1c2giLCJpc1R5cGluZyIsImNtZCIsImNvbW1hbmQiLCJDb21tYW5kTWFwIiwiaXNFbmFibGVkIiwiY2F0ZWdvcnkiLCJDb21tYW5kQ2F0ZWdvcmllcyIsIm1lc3NhZ2VzIiwiVHlwaW5nU3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsInNldFNlbGZUeXBpbmciLCJyb29tIiwicm9vbUlkIiwib25DaGFuZ2UiLCJpc0lNRUNvbXBvc2luZyIsInVhIiwidXNlckFnZW50IiwiaXNTYWZhcmkiLCJpbmNsdWRlcyIsIm9uSW5wdXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJldmVudCIsImRvY3VtZW50IiwiZ2V0U2VsZWN0aW9uIiwidG9TdHJpbmciLCJzZWxlY3RlZFBhcnRzIiwibWFwIiwicCIsInNlcmlhbGl6ZSIsImNsaXBib2FyZERhdGEiLCJzZXREYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1vZGlmaWVkRmxhZyIsInByZXZlbnREZWZhdWx0Iiwib25DdXRDb3B5Iiwib25QYXN0ZSIsInBhcnRzVGV4dCIsImdldERhdGEiLCJzZXJpYWxpemVkVGV4dFBhcnRzIiwicGFyc2UiLCJkZXNlcmlhbGl6ZWRQYXJ0cyIsImRlc2VyaWFsaXplUGFydCIsInNlbCIsImNhcmV0IiwidXBkYXRlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uU2VsZWN0aW9uQ2hhbmdlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImxhc3RTZWxlY3Rpb24iLCJyZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQiLCJoYXNUZXh0U2VsZWN0ZWQiLCJzZWxlY3Rpb25SZWN0IiwiZ2V0UmFuZ2VBdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNob3dBdCIsIm1vZEtleSIsIm1ldGFLZXkiLCJjdHJsS2V5IiwiaGFuZGxlZCIsIktleSIsIkIiLCJvbkZvcm1hdEFjdGlvbiIsIkJvbGQiLCJJIiwiSXRhbGljcyIsIkdSRUFURVJfVEhBTiIsIlF1b3RlIiwiWSIsInNoaWZ0S2V5IiwiWiIsImNhblJlZG8iLCJyZWRvIiwicmVzZXQiLCJjYW5VbmRvIiwidW5kbyIsIkVOVEVSIiwiYWx0S2V5IiwiaW5zZXJ0VGV4dCIsIkhPTUUiLCJFTkQiLCJsZW5ndGgiLCJtZXRhT3JBbHRQcmVzc2VkIiwibW9kaWZpZXJQcmVzc2VkIiwiaGFzQ29tcGxldGlvbnMiLCJBUlJPV19VUCIsIm9uVXBBcnJvdyIsIkFSUk9XX0RPV04iLCJvbkRvd25BcnJvdyIsIlRBQiIsIm9uVGFiIiwiRVNDQVBFIiwib25Fc2NhcGUiLCJ0YWJDb21wbGV0ZU5hbWUiLCJCQUNLU1BBQ0UiLCJERUxFVEUiLCJzdG9wUHJvcGFnYXRpb24iLCJjb21wbGV0aW9uIiwib25Db21wb25lbnRDb25maXJtIiwiY29tcGxldGlvbkluZGV4Iiwib25Db21wb25lbnRTZWxlY3Rpb25DaGFuZ2UiLCJzaG91bGRSZXBsYWNlIiwiU2V0dGluZ3NTdG9yZSIsImdldFZhbHVlIiwic2V0VHJhbnNmb3JtQ2FsbGJhY2siLCJyZXBsYWNlRW1vdGljb24iLCJzaG93UGlsbEF2YXRhciIsImFjdGlvbiIsInRyaW0iLCJlbnN1cmVMYXN0Q2hhbmdlc1B1c2hlZCIsIlN0cmlrZXRocm91Z2giLCJDb2RlIiwic3RhdGUiLCJlbW90aWNvblNldHRpbmdIYW5kbGUiLCJ3YXRjaFNldHRpbmciLCJjb25maWd1cmVFbW90aWNvbkF1dG9SZXBsYWNlIiwic2hvdWxkU2hvd1BpbGxBdmF0YXJTZXR0aW5nSGFuZGxlIiwiY29uZmlndXJlU2hvdWxkU2hvd1BpbGxBdmF0YXIiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJzdHlsZSIsInNldFByb3BlcnR5IiwiY2xhc3NMaXN0IiwiYWRkIiwicmVtb3ZlIiwicmVtb3ZlUHJvcGVydHkiLCJpc0NvbXBvc2luZyIsIm5hdGl2ZUV2ZW50IiwidGV4dFRvSW5zZXJ0IiwibmV3VGV4dCIsInN1YnN0ciIsIl9pc0NhcmV0QXRFbmQiLCJpc0F0RW5kIiwibGFzdENhcmV0IiwiYXNPZmZzZXQiLCJjbGVhclVuZG9IaXN0b3J5IiwiY2xlYXIiLCJnZXRDYXJldCIsImlzU2VsZWN0aW9uQ29sbGFwc2VkIiwiaXNDYXJldEF0U3RhcnQiLCJpc0NhcmV0QXRFbmQiLCJzaG93VmlzdWFsQmVsbCIsInBvc2l0aW9uRm9yT2Zmc2V0IiwiYXROb2RlRW5kIiwidHJhbnNmb3JtIiwiYWRkZWRMZW4iLCJwaWxsQ2FuZGlkYXRlIiwiaGFzU2VsZWN0aW9uIiwiY2xvc2UiLCJpc01vZGlmaWVkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvbkNvbXBvc2l0aW9uU3RhcnQiLCJvbkNvbXBvc2l0aW9uRW5kIiwidW53YXRjaFNldHRpbmciLCJjb21wb25lbnREaWRNb3VudCIsInNldFVwZGF0ZUNhbGxiYWNrIiwidXBkYXRlRWRpdG9yU3RhdGUiLCJzZXRBdXRvQ29tcGxldGVDcmVhdG9yIiwiYXV0b2NvbXBsZXRlUmVmIiwiZ2V0SW5pdGlhbENhcmV0UG9zaXRpb24iLCJmb2N1cyIsImluaXRpYWxDYXJldCIsImdldFBvc2l0aW9uQXRFbmQiLCJyZW5kZXIiLCJxdWVyeUxlbiIsIm9uQXV0b0NvbXBsZXRlQ29uZmlybSIsIm9uQXV0b0NvbXBsZXRlU2VsZWN0aW9uQ2hhbmdlIiwiYmVnaW5uaW5nIiwic3RhcnQiLCJ3cmFwcGVyQ2xhc3NlcyIsImNsYXNzZXMiLCJzaG9ydGN1dHMiLCJib2xkIiwiaXRhbGljcyIsInF1b3RlIiwib25CbHVyIiwib25Gb2N1cyIsIm9uQ29weSIsIm9uQ3V0Iiwib25LZXlEb3duIiwibGFiZWwiLCJCb29sZWFuIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUdBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQTFDQTtBQUNBO0FBQ0E7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SyxFQUFFLEtBQUtDLEtBUGhCO0FBUUksTUFBQSxPQUFPLEVBQUUsS0FBSzlJLE9BUmxCO0FBU0ksTUFBQSxTQUFTLEVBQUUsS0FBSytJLFNBVHBCO0FBVUksTUFBQSxHQUFHLEVBQUUsS0FBS3hNLFNBVmQ7QUFXSSxvQkFBWSxLQUFLNUIsS0FBTCxDQUFXcU8sS0FYM0I7QUFZSSxNQUFBLElBQUksRUFBQyxTQVpUO0FBYUksd0JBQWUsTUFibkI7QUFjSSwyQkFBa0IsTUFkdEI7QUFlSSx1QkFBYyxTQWZsQjtBQWdCSSx1QkFBZUMsT0FBTyxDQUFDLEtBQUtyRSxLQUFMLENBQVdySCxZQUFaLENBaEIxQjtBQWlCSSwrQkFBdUJ3RyxlQUFlLElBQUksQ0FBbkIsR0FBdUIsMkNBQXdCQSxlQUF4QixDQUF2QixHQUFrRW1GLFNBakI3RjtBQWtCSSxNQUFBLEdBQUcsRUFBQztBQWxCUixNQUhJLENBQVI7QUF3Qkg7O0FBRUR0QixFQUFBQSxLQUFLLEdBQUc7QUFDSixTQUFLckwsU0FBTCxDQUFlQyxPQUFmLENBQXVCb0wsS0FBdkI7QUFDSDs7QUEzbEIyRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZiwgQ2xpcGJvYXJkRXZlbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um9vbX0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IEVNT1RJQ09OX1JFR0VYIGZyb20gJ2Vtb2ppYmFzZS1yZWdleC9lbW90aWNvbic7XG5cbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tICcuLi8uLi8uLi9lZGl0b3IvbW9kZWwnO1xuaW1wb3J0IEhpc3RvcnlNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL2VkaXRvci9oaXN0b3J5JztcbmltcG9ydCB7Q2FyZXQsIHNldFNlbGVjdGlvbn0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2NhcmV0JztcbmltcG9ydCB7XG4gICAgZm9ybWF0UmFuZ2VBc1F1b3RlLFxuICAgIGZvcm1hdFJhbmdlQXNDb2RlLFxuICAgIHRvZ2dsZUlubGluZUZvcm1hdCxcbiAgICByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQsXG59IGZyb20gJy4uLy4uLy4uL2VkaXRvci9vcGVyYXRpb25zJztcbmltcG9ydCB7Z2V0Q2FyZXRPZmZzZXRBbmRUZXh0LCBnZXRSYW5nZUZvclNlbGVjdGlvbn0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2RvbSc7XG5pbXBvcnQgQXV0b2NvbXBsZXRlLCB7Z2VuZXJhdGVDb21wbGV0aW9uRG9tSWR9IGZyb20gJy4uL3Jvb21zL0F1dG9jb21wbGV0ZSc7XG5pbXBvcnQge2dldEF1dG9Db21wbGV0ZUNyZWF0b3J9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQge3BhcnNlUGxhaW5UZXh0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2Rlc2VyaWFsaXplJztcbmltcG9ydCB7cmVuZGVyTW9kZWx9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9yZW5kZXInO1xuaW1wb3J0IFR5cGluZ1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVHlwaW5nU3RvcmVcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge0VNT1RJQ09OX1RPX0VNT0pJfSBmcm9tIFwiLi4vLi4vLi4vZW1vamlcIjtcbmltcG9ydCB7Q29tbWFuZENhdGVnb3JpZXMsIENvbW1hbmRNYXAsIHBhcnNlQ29tbWFuZFN0cmluZ30gZnJvbSBcIi4uLy4uLy4uL1NsYXNoQ29tbWFuZHNcIjtcbmltcG9ydCBSYW5nZSBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL3JhbmdlXCI7XG5pbXBvcnQgTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyIGZyb20gXCIuL01lc3NhZ2VDb21wb3NlckZvcm1hdEJhclwiO1xuaW1wb3J0IERvY3VtZW50T2Zmc2V0IGZyb20gXCIuLi8uLi8uLi9lZGl0b3Ivb2Zmc2V0XCI7XG5pbXBvcnQge0lEaWZmfSBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL2RpZmZcIjtcbmltcG9ydCBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwgZnJvbSBcIi4uLy4uLy4uL2VkaXRvci9hdXRvY29tcGxldGVcIjtcbmltcG9ydCBEb2N1bWVudFBvc2l0aW9uIGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvcG9zaXRpb25cIjtcbmltcG9ydCB7SUNvbXBsZXRpb259IGZyb20gXCIuLi8uLi8uLi9hdXRvY29tcGxldGUvQXV0b2NvbXBsZXRlclwiO1xuXG4vLyBtYXRjaGVzIGVtb3RpY29ucyB3aGljaCBmb2xsb3cgdGhlIHN0YXJ0IG9mIGEgbGluZSBvciB3aGl0ZXNwYWNlXG5jb25zdCBSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFID0gbmV3IFJlZ0V4cCgnKD86XnxcXFxccykoJyArIEVNT1RJQ09OX1JFR0VYLnNvdXJjZSArICcpXFxcXHMkJyk7XG5cbmNvbnN0IElTX01BQyA9IG5hdmlnYXRvci5wbGF0Zm9ybS5pbmRleE9mKFwiTWFjXCIpICE9PSAtMTtcblxuZnVuY3Rpb24gY3RybFNob3J0Y3V0TGFiZWwoa2V5KSB7XG4gICAgcmV0dXJuIChJU19NQUMgPyBcIuKMmFwiIDogXCJDdHJsXCIpICsgXCIrXCIgKyBrZXk7XG59XG5cbmZ1bmN0aW9uIGNsb25lU2VsZWN0aW9uKHNlbGVjdGlvbjogU2VsZWN0aW9uKTogUGFydGlhbDxTZWxlY3Rpb24+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBhbmNob3JOb2RlOiBzZWxlY3Rpb24uYW5jaG9yTm9kZSxcbiAgICAgICAgYW5jaG9yT2Zmc2V0OiBzZWxlY3Rpb24uYW5jaG9yT2Zmc2V0LFxuICAgICAgICBmb2N1c05vZGU6IHNlbGVjdGlvbi5mb2N1c05vZGUsXG4gICAgICAgIGZvY3VzT2Zmc2V0OiBzZWxlY3Rpb24uZm9jdXNPZmZzZXQsXG4gICAgICAgIGlzQ29sbGFwc2VkOiBzZWxlY3Rpb24uaXNDb2xsYXBzZWQsXG4gICAgICAgIHJhbmdlQ291bnQ6IHNlbGVjdGlvbi5yYW5nZUNvdW50LFxuICAgICAgICB0eXBlOiBzZWxlY3Rpb24udHlwZSxcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBzZWxlY3Rpb25FcXVhbHMoYTogUGFydGlhbDxTZWxlY3Rpb24+LCBiOiBTZWxlY3Rpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gYS5hbmNob3JOb2RlID09PSBiLmFuY2hvck5vZGUgJiZcbiAgICAgICAgYS5hbmNob3JPZmZzZXQgPT09IGIuYW5jaG9yT2Zmc2V0ICYmXG4gICAgICAgIGEuZm9jdXNOb2RlID09PSBiLmZvY3VzTm9kZSAmJlxuICAgICAgICBhLmZvY3VzT2Zmc2V0ID09PSBiLmZvY3VzT2Zmc2V0ICYmXG4gICAgICAgIGEuaXNDb2xsYXBzZWQgPT09IGIuaXNDb2xsYXBzZWQgJiZcbiAgICAgICAgYS5yYW5nZUNvdW50ID09PSBiLnJhbmdlQ291bnQgJiZcbiAgICAgICAgYS50eXBlID09PSBiLnR5cGU7XG59XG5cbmVudW0gRm9ybWF0dGluZyB7XG4gICAgQm9sZCA9IFwiYm9sZFwiLFxuICAgIEl0YWxpY3MgPSBcIml0YWxpY3NcIixcbiAgICBTdHJpa2V0aHJvdWdoID0gXCJzdHJpa2V0aHJvdWdoXCIsXG4gICAgQ29kZSA9IFwiY29kZVwiLFxuICAgIFF1b3RlID0gXCJxdW90ZVwiLFxufVxuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBtb2RlbDogRWRpdG9yTW9kZWw7XG4gICAgcm9vbTogUm9vbTtcbiAgICBwbGFjZWhvbGRlcj86IHN0cmluZztcbiAgICBsYWJlbD86IHN0cmluZztcbiAgICBpbml0aWFsQ2FyZXQ/OiBEb2N1bWVudE9mZnNldDtcblxuICAgIG9uQ2hhbmdlPygpO1xuICAgIG9uUGFzdGU/KGV2ZW50OiBDbGlwYm9hcmRFdmVudDxIVE1MRGl2RWxlbWVudD4sIG1vZGVsOiBFZGl0b3JNb2RlbCk6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIHNob3dQaWxsQXZhdGFyOiBib29sZWFuO1xuICAgIHF1ZXJ5Pzogc3RyaW5nO1xuICAgIHNob3dWaXN1YWxCZWxsPzogYm9vbGVhbjtcbiAgICBhdXRvQ29tcGxldGU/OiBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWw7XG4gICAgY29tcGxldGlvbkluZGV4PzogbnVtYmVyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNpY01lc3NhZ2VFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBwcml2YXRlIGVkaXRvclJlZiA9IGNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcbiAgICBwcml2YXRlIGF1dG9jb21wbGV0ZVJlZiA9IGNyZWF0ZVJlZjxBdXRvY29tcGxldGU+KCk7XG4gICAgcHJpdmF0ZSBmb3JtYXRCYXJSZWYgPSBjcmVhdGVSZWY8dHlwZW9mIE1lc3NhZ2VDb21wb3NlckZvcm1hdEJhcj4oKTtcblxuICAgIHByaXZhdGUgbW9kaWZpZWRGbGFnID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBpc0lNRUNvbXBvc2luZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgaGFzVGV4dFNlbGVjdGVkID0gZmFsc2U7XG5cbiAgICBwcml2YXRlIF9pc0NhcmV0QXRFbmQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBsYXN0Q2FyZXQ6IERvY3VtZW50T2Zmc2V0O1xuICAgIHByaXZhdGUgbGFzdFNlbGVjdGlvbjogUmV0dXJuVHlwZTx0eXBlb2YgY2xvbmVTZWxlY3Rpb24+O1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBlbW90aWNvblNldHRpbmdIYW5kbGU6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgaGlzdG9yeU1hbmFnZXIgPSBuZXcgSGlzdG9yeU1hbmFnZXIoKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHNob3dQaWxsQXZhdGFyOiBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmVtb3RpY29uU2V0dGluZ0hhbmRsZSA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKCdNZXNzYWdlQ29tcG9zZXJJbnB1dC5hdXRvUmVwbGFjZUVtb2ppJywgbnVsbCxcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlRW1vdGljb25BdXRvUmVwbGFjZSk7XG4gICAgICAgIHRoaXMuY29uZmlndXJlRW1vdGljb25BdXRvUmVwbGFjZSgpO1xuICAgICAgICB0aGlzLnNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZSA9IFNldHRpbmdzU3RvcmUud2F0Y2hTZXR0aW5nKFwiUGlsbC5zaG91bGRTaG93UGlsbEF2YXRhclwiLCBudWxsLFxuICAgICAgICAgICAgdGhpcy5jb25maWd1cmVTaG91bGRTaG93UGlsbEF2YXRhcik7XG4gICAgfVxuXG4gICAgcHVibGljIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IElQcm9wcykge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wbGFjZWhvbGRlciAhPT0gcHJldlByb3BzLnBsYWNlaG9sZGVyICYmIHRoaXMucHJvcHMucGxhY2Vob2xkZXIpIHtcbiAgICAgICAgICAgIGNvbnN0IHtpc0VtcHR5fSA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZVBsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlcGxhY2VFbW90aWNvbiA9IChjYXJldFBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCByYW5nZSA9IG1vZGVsLnN0YXJ0UmFuZ2UoY2FyZXRQb3NpdGlvbik7XG4gICAgICAgIC8vIGV4cGFuZCByYW5nZSBtYXggOCBjaGFyYWN0ZXJzIGJhY2t3YXJkcyBmcm9tIGNhcmV0UG9zaXRpb24sXG4gICAgICAgIC8vIGFzIGEgc3BhY2UgdG8gbG9vayBmb3IgYW4gZW1vdGljb25cbiAgICAgICAgbGV0IG4gPSA4O1xuICAgICAgICByYW5nZS5leHBhbmRCYWNrd2FyZHNXaGlsZSgoaW5kZXgsIG9mZnNldCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGFydCA9IG1vZGVsLnBhcnRzW2luZGV4XTtcbiAgICAgICAgICAgIG4gLT0gMTtcbiAgICAgICAgICAgIHJldHVybiBuID49IDAgJiYgKHBhcnQudHlwZSA9PT0gXCJwbGFpblwiIHx8IHBhcnQudHlwZSA9PT0gXCJwaWxsLWNhbmRpZGF0ZVwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGVtb3RpY29uTWF0Y2ggPSBSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFLmV4ZWMocmFuZ2UudGV4dCk7XG4gICAgICAgIGlmIChlbW90aWNvbk1hdGNoKSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IGVtb3RpY29uTWF0Y2hbMV0ucmVwbGFjZShcIi1cIiwgXCJcIik7XG4gICAgICAgICAgICAvLyB0cnkgYm90aCBleGFjdCBtYXRjaCBhbmQgbG93ZXItY2FzZSwgdGhpcyBtZWFucyB0aGF0IHhkIHdvbid0IG1hdGNoIHhEIGJ1dCA6UCB3aWxsIG1hdGNoIDpwXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gRU1PVElDT05fVE9fRU1PSkkuZ2V0KHF1ZXJ5KSB8fCBFTU9USUNPTl9UT19FTU9KSS5nZXQocXVlcnkudG9Mb3dlckNhc2UoKSk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICAgICAgICAgIGNvbnN0IGhhc1ByZWNlZGluZ1NwYWNlID0gZW1vdGljb25NYXRjaFswXVswXSA9PT0gXCIgXCI7XG4gICAgICAgICAgICAgICAgLy8gd2UgbmVlZCB0aGUgcmFuZ2UgdG8gb25seSBjb21wcmlzZSBvZiB0aGUgZW1vdGljb25cbiAgICAgICAgICAgICAgICAvLyBiZWNhdXNlIHdlJ2xsIHJlcGxhY2UgdGhlIHdob2xlIHJhbmdlIHdpdGggYW4gZW1vamksXG4gICAgICAgICAgICAgICAgLy8gc28gbW92ZSB0aGUgc3RhcnQgZm9yd2FyZCB0byB0aGUgc3RhcnQgb2YgdGhlIGVtb3RpY29uLlxuICAgICAgICAgICAgICAgIC8vIFRha2UgKyAxIGJlY2F1c2UgaW5kZXggaXMgcmVwb3J0ZWQgd2l0aG91dCB0aGUgcG9zc2libGUgcHJlY2VkaW5nIHNwYWNlLlxuICAgICAgICAgICAgICAgIHJhbmdlLm1vdmVTdGFydChlbW90aWNvbk1hdGNoLmluZGV4ICsgKGhhc1ByZWNlZGluZ1NwYWNlID8gMSA6IDApKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHJldHVybnMgdGhlIGFtb3VudCBvZiBhZGRlZC9yZW1vdmVkIGNoYXJhY3RlcnMgZHVyaW5nIHRoZSByZXBsYWNlXG4gICAgICAgICAgICAgICAgLy8gc28gdGhlIGNhcmV0IHBvc2l0aW9uIGNhbiBiZSBhZGp1c3RlZC5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmFuZ2UucmVwbGFjZShbcGFydENyZWF0b3IucGxhaW4oZGF0YS51bmljb2RlICsgXCIgXCIpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVFZGl0b3JTdGF0ZSA9IChzZWxlY3Rpb246IENhcmV0LCBpbnB1dFR5cGU/OiBzdHJpbmcsIGRpZmY/OiBJRGlmZikgPT4ge1xuICAgICAgICByZW5kZXJNb2RlbCh0aGlzLmVkaXRvclJlZi5jdXJyZW50LCB0aGlzLnByb3BzLm1vZGVsKTtcbiAgICAgICAgaWYgKHNlbGVjdGlvbikgeyAvLyBzZXQgdGhlIGNhcmV0L3NlbGVjdGlvblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBzZXRTZWxlY3Rpb24odGhpcy5lZGl0b3JSZWYuY3VycmVudCwgdGhpcy5wcm9wcy5tb2RlbCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIGNhcmV0IHNlbGVjdGlvbiBpcyBhIHJhbmdlLCB0YWtlIHRoZSBlbmQgcG9zaXRpb25cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gc2VsZWN0aW9uIGluc3RhbmNlb2YgUmFuZ2UgPyBzZWxlY3Rpb24uZW5kIDogc2VsZWN0aW9uO1xuICAgICAgICAgICAgdGhpcy5zZXRMYXN0Q2FyZXRGcm9tUG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHtpc0VtcHR5fSA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnBsYWNlaG9sZGVyKSB7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1BsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaGlkZVBsYWNlaG9sZGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2F1dG9Db21wbGV0ZTogdGhpcy5wcm9wcy5tb2RlbC5hdXRvQ29tcGxldGV9KTtcbiAgICAgICAgdGhpcy5oaXN0b3J5TWFuYWdlci50cnlQdXNoKHRoaXMucHJvcHMubW9kZWwsIHNlbGVjdGlvbiwgaW5wdXRUeXBlLCBkaWZmKTtcblxuICAgICAgICBsZXQgaXNUeXBpbmcgPSAhdGhpcy5wcm9wcy5tb2RlbC5pc0VtcHR5O1xuICAgICAgICAvLyBJZiB0aGUgdXNlciBpcyBlbnRlcmluZyBhIGNvbW1hbmQsIG9ubHkgY29uc2lkZXIgdGhlbSB0eXBpbmcgaWYgaXQgaXMgb25lIHdoaWNoIHNlbmRzIGEgbWVzc2FnZSBpbnRvIHRoZSByb29tXG4gICAgICAgIGlmIChpc1R5cGluZyAmJiB0aGlzLnByb3BzLm1vZGVsLnBhcnRzWzBdLnR5cGUgPT09IFwiY29tbWFuZFwiKSB7XG4gICAgICAgICAgICBjb25zdCB7Y21kfSA9IHBhcnNlQ29tbWFuZFN0cmluZyh0aGlzLnByb3BzLm1vZGVsLnBhcnRzWzBdLnRleHQpO1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IENvbW1hbmRNYXAuZ2V0KGNtZCk7XG4gICAgICAgICAgICBpZiAoIWNvbW1hbmQgfHwgIWNvbW1hbmQuaXNFbmFibGVkKCkgfHwgY29tbWFuZC5jYXRlZ29yeSAhPT0gQ29tbWFuZENhdGVnb3JpZXMubWVzc2FnZXMpIHtcbiAgICAgICAgICAgICAgICBpc1R5cGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFR5cGluZ1N0b3JlLnNoYXJlZEluc3RhbmNlKCkuc2V0U2VsZlR5cGluZyh0aGlzLnByb3BzLnJvb20ucm9vbUlkLCBpc1R5cGluZyk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHNob3dQbGFjZWhvbGRlcigpIHtcbiAgICAgICAgLy8gZXNjYXBlIHNpbmdsZSBxdW90ZXNcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXIgPSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyLnJlcGxhY2UoLycvZywgJ1xcXFxcXCcnKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tcGxhY2Vob2xkZXJcIiwgYCcke3BsYWNlaG9sZGVyfSdgKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5jbGFzc0xpc3QuYWRkKFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRFbXB0eVwiKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhpZGVQbGFjZWhvbGRlcigpIHtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRFbXB0eVwiKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5zdHlsZS5yZW1vdmVQcm9wZXJ0eShcIi0tcGxhY2Vob2xkZXJcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkNvbXBvc2l0aW9uU3RhcnQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNJTUVDb21wb3NpbmcgPSB0cnVlO1xuICAgICAgICAvLyBldmVuIGlmIHRoZSBtb2RlbCBpcyBlbXB0eSwgdGhlIGNvbXBvc2l0aW9uIHRleHQgc2hvdWxkbid0IGJlIG1peGVkIHdpdGggdGhlIHBsYWNlaG9sZGVyXG4gICAgICAgIHRoaXMuaGlkZVBsYWNlaG9sZGVyKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db21wb3NpdGlvbkVuZCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5pc0lNRUNvbXBvc2luZyA9IGZhbHNlO1xuICAgICAgICAvLyBzb21lIGJyb3dzZXJzIChDaHJvbWUpIGRvbid0IGZpcmUgYW4gaW5wdXQgZXZlbnQgYWZ0ZXIgZW5kaW5nIGEgY29tcG9zaXRpb24sXG4gICAgICAgIC8vIHNvIHRyaWdnZXIgYSBtb2RlbCB1cGRhdGUgYWZ0ZXIgdGhlIGNvbXBvc2l0aW9uIGlzIGRvbmUgYnkgY2FsbGluZyB0aGUgaW5wdXQgaGFuZGxlci5cblxuICAgICAgICAvLyBob3dldmVyLCBtb2RpZnlpbmcgdGhlIERPTSAoY2F1c2VkIGJ5IHRoZSBlZGl0b3IgbW9kZWwgdXBkYXRlKSBmcm9tIHRoZSBjb21wb3NpdGlvbmVuZCBoYW5kbGVyIHNlZW1zXG4gICAgICAgIC8vIHRvIGNvbmZ1c2UgdGhlIElNRSBpbiBDaHJvbWUsIGxpa2VseSBjYXVzaW5nIGh0dHBzOi8vZ2l0aHViLmNvbS92ZWN0b3ItaW0vZWxlbWVudC13ZWIvaXNzdWVzLzEwOTEzICxcbiAgICAgICAgLy8gc28gd2UgZG8gaXQgYXN5bmNcblxuICAgICAgICAvLyBob3dldmVyLCBkb2luZyB0aGlzIGFzeW5jIHNlZW1zIHRvIGJyZWFrIHRoaW5ncyBpbiBTYWZhcmkgZm9yIHNvbWUgcmVhc29uLCBzbyBicm93c2VyIHNuaWZmLlxuXG4gICAgICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xuICAgICAgICBjb25zdCBpc1NhZmFyaSA9IHVhLmluY2x1ZGVzKCdzYWZhcmkvJykgJiYgIXVhLmluY2x1ZGVzKCdjaHJvbWUvJyk7XG5cbiAgICAgICAgaWYgKGlzU2FmYXJpKSB7XG4gICAgICAgICAgICB0aGlzLm9uSW5wdXQoe2lucHV0VHlwZTogXCJpbnNlcnRDb21wb3NpdGlvblRleHRcIn0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5vbklucHV0KHtpbnB1dFR5cGU6IFwiaW5zZXJ0Q29tcG9zaXRpb25UZXh0XCJ9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGlzQ29tcG9zaW5nKGV2ZW50OiBSZWFjdC5LZXlib2FyZEV2ZW50KSB7XG4gICAgICAgIC8vIGNoZWNraW5nIHRoZSBldmVudC5pc0NvbXBvc2luZyBmbGFnIGp1c3QgaW4gY2FzZSBhbnkgYnJvd3NlciBvdXQgdGhlcmVcbiAgICAgICAgLy8gZW1pdHMgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIGNvbXBvc2l0aW9uIGFmdGVyIGNvbXBvc2l0aW9uZW5kXG4gICAgICAgIC8vIGhhcyBiZWVuIGZpcmVkXG4gICAgICAgIHJldHVybiAhISh0aGlzLmlzSU1FQ29tcG9zaW5nIHx8IChldmVudC5uYXRpdmVFdmVudCAmJiBldmVudC5uYXRpdmVFdmVudC5pc0NvbXBvc2luZykpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DdXRDb3B5ID0gKGV2ZW50OiBDbGlwYm9hcmRFdmVudCwgdHlwZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gc2VsZWN0aW9uLnRvU3RyaW5nKCk7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZ2V0UmFuZ2VGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3JSZWYuY3VycmVudCwgbW9kZWwsIHNlbGVjdGlvbik7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFBhcnRzID0gcmFuZ2UucGFydHMubWFwKHAgPT4gcC5zZXJpYWxpemUoKSk7XG4gICAgICAgICAgICBldmVudC5jbGlwYm9hcmREYXRhLnNldERhdGEoXCJhcHBsaWNhdGlvbi94LWVsZW1lbnQtY29tcG9zZXJcIiwgSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWRQYXJ0cykpO1xuICAgICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFwidGV4dC9wbGFpblwiLCB0ZXh0KTsgLy8gc28gcGxhaW4gY29weS9wYXN0ZSB3b3Jrc1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09IFwiY3V0XCIpIHtcbiAgICAgICAgICAgICAgICAvLyBSZW1vdmUgdGhlIHRleHQsIHVwZGF0aW5nIHRoZSBtb2RlbCBhcyBhcHByb3ByaWF0ZVxuICAgICAgICAgICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQocmFuZ2UsIFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkNvcHkgPSAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMub25DdXRDb3B5KGV2ZW50LCBcImNvcHlcIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25DdXQgPSAoZXZlbnQ6IENsaXBib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMub25DdXRDb3B5KGV2ZW50LCBcImN1dFwiKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblBhc3RlID0gKGV2ZW50OiBDbGlwYm9hcmRFdmVudDxIVE1MRGl2RWxlbWVudD4pID0+IHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgLy8gd2UgYWx3YXlzIGhhbmRsZSB0aGUgcGFzdGUgb3Vyc2VsdmVzXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uUGFzdGUgJiYgdGhpcy5wcm9wcy5vblBhc3RlKGV2ZW50LCB0aGlzLnByb3BzLm1vZGVsKSkge1xuICAgICAgICAgICAgLy8gdG8gcHJldmVudCBkb3VibGUgaGFuZGxpbmcsIGFsbG93IHByb3BzLm9uUGFzdGUgdG8gc2tpcCBpbnRlcm5hbCBvblBhc3RlXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7cGFydENyZWF0b3J9ID0gbW9kZWw7XG4gICAgICAgIGNvbnN0IHBhcnRzVGV4dCA9IGV2ZW50LmNsaXBib2FyZERhdGEuZ2V0RGF0YShcImFwcGxpY2F0aW9uL3gtZWxlbWVudC1jb21wb3NlclwiKTtcbiAgICAgICAgbGV0IHBhcnRzO1xuICAgICAgICBpZiAocGFydHNUZXh0KSB7XG4gICAgICAgICAgICBjb25zdCBzZXJpYWxpemVkVGV4dFBhcnRzID0gSlNPTi5wYXJzZShwYXJ0c1RleHQpO1xuICAgICAgICAgICAgY29uc3QgZGVzZXJpYWxpemVkUGFydHMgPSBzZXJpYWxpemVkVGV4dFBhcnRzLm1hcChwID0+IHBhcnRDcmVhdG9yLmRlc2VyaWFsaXplUGFydChwKSk7XG4gICAgICAgICAgICBwYXJ0cyA9IGRlc2VyaWFsaXplZFBhcnRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGV2ZW50LmNsaXBib2FyZERhdGEuZ2V0RGF0YShcInRleHQvcGxhaW5cIik7XG4gICAgICAgICAgICBwYXJ0cyA9IHBhcnNlUGxhaW5UZXh0TWVzc2FnZSh0ZXh0LCBwYXJ0Q3JlYXRvcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICBjb25zdCByYW5nZSA9IGdldFJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIG1vZGVsLCBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSk7XG4gICAgICAgIHJlcGxhY2VSYW5nZUFuZE1vdmVDYXJldChyYW5nZSwgcGFydHMpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSW5wdXQgPSAoZXZlbnQ6IFBhcnRpYWw8SW5wdXRFdmVudD4pID0+IHtcbiAgICAgICAgLy8gaWdub3JlIGFueSBpbnB1dCB3aGlsZSBkb2luZyBJTUUgY29tcG9zaXRpb25zXG4gICAgICAgIGlmICh0aGlzLmlzSU1FQ29tcG9zaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICBjb25zdCBzZWwgPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3Qge2NhcmV0LCB0ZXh0fSA9IGdldENhcmV0T2Zmc2V0QW5kVGV4dCh0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBzZWwpO1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnVwZGF0ZSh0ZXh0LCBldmVudC5pbnB1dFR5cGUsIGNhcmV0KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBpbnNlcnRUZXh0KHRleHRUb0luc2VydDogc3RyaW5nLCBpbnB1dFR5cGUgPSBcImluc2VydFRleHRcIikge1xuICAgICAgICBjb25zdCBzZWwgPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3Qge2NhcmV0LCB0ZXh0fSA9IGdldENhcmV0T2Zmc2V0QW5kVGV4dCh0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBzZWwpO1xuICAgICAgICBjb25zdCBuZXdUZXh0ID0gdGV4dC5zdWJzdHIoMCwgY2FyZXQub2Zmc2V0KSArIHRleHRUb0luc2VydCArIHRleHQuc3Vic3RyKGNhcmV0Lm9mZnNldCk7XG4gICAgICAgIGNhcmV0Lm9mZnNldCArPSB0ZXh0VG9JbnNlcnQubGVuZ3RoO1xuICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwudXBkYXRlKG5ld1RleHQsIGlucHV0VHlwZSwgY2FyZXQpO1xuICAgIH1cblxuICAgIC8vIHRoaXMgaXMgdXNlZCBsYXRlciB0byBzZWUgaWYgd2UgbmVlZCB0byByZWNhbGN1bGF0ZSB0aGUgY2FyZXRcbiAgICAvLyBvbiBzZWxlY3Rpb25jaGFuZ2UuIElmIGl0IGlzIGp1c3QgYSBjb25zZXF1ZW5jZSBvZiB0eXBpbmdcbiAgICAvLyB3ZSBkb24ndCBuZWVkIHRvLiBCdXQgaWYgdGhlIHVzZXIgaXMgbmF2aWdhdGluZyB0aGUgY2FyZXQgd2l0aG91dCBpbnB1dFxuICAgIC8vIHdlIG5lZWQgdG8gcmVjYWxjdWxhdGUgaXQsIHRvIGJlIGFibGUgdG8ga25vdyB3aGVyZSB0byBpbnNlcnQgY29udGVudCBhZnRlclxuICAgIC8vIGxvc2luZyBmb2N1c1xuICAgIHByaXZhdGUgc2V0TGFzdENhcmV0RnJvbVBvc2l0aW9uKHBvc2l0aW9uOiBEb2N1bWVudFBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHttb2RlbH0gPSB0aGlzLnByb3BzO1xuICAgICAgICB0aGlzLl9pc0NhcmV0QXRFbmQgPSBwb3NpdGlvbi5pc0F0RW5kKG1vZGVsKTtcbiAgICAgICAgdGhpcy5sYXN0Q2FyZXQgPSBwb3NpdGlvbi5hc09mZnNldChtb2RlbCk7XG4gICAgICAgIHRoaXMubGFzdFNlbGVjdGlvbiA9IGNsb25lU2VsZWN0aW9uKGRvY3VtZW50LmdldFNlbGVjdGlvbigpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZnJlc2hMYXN0Q2FyZXRJZk5lZWRlZCgpIHtcbiAgICAgICAgLy8gWFhYOiBuZWVkZWQgd2hlbiBnb2luZyB1cCBhbmQgZG93biBpbiBlZGl0aW5nIG1lc3NhZ2VzIC4uLiBub3Qgc3VyZSB3aHkgeWV0XG4gICAgICAgIC8vIGJlY2F1c2UgdGhlIGVkaXRvcnMgc2hvdWxkIHN0b3AgZG9pbmcgdGhpcyB3aGVuIHdoZW4gYmx1cnJlZCAuLi5cbiAgICAgICAgLy8gbWF5YmUgaXQncyBvbiBmb2N1cyBhbmQgdGhlIF9lZGl0b3JSZWYgaXNuJ3QgYXZhaWxhYmxlIHlldCBvciBzb21ldGhpbmcuXG4gICAgICAgIGlmICghdGhpcy5lZGl0b3JSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdGlvbiA9IGRvY3VtZW50LmdldFNlbGVjdGlvbigpO1xuICAgICAgICBpZiAoIXRoaXMubGFzdFNlbGVjdGlvbiB8fCAhc2VsZWN0aW9uRXF1YWxzKHRoaXMubGFzdFNlbGVjdGlvbiwgc2VsZWN0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0aW9uID0gY2xvbmVTZWxlY3Rpb24oc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IHtjYXJldCwgdGV4dH0gPSBnZXRDYXJldE9mZnNldEFuZFRleHQodGhpcy5lZGl0b3JSZWYuY3VycmVudCwgc2VsZWN0aW9uKTtcbiAgICAgICAgICAgIHRoaXMubGFzdENhcmV0ID0gY2FyZXQ7XG4gICAgICAgICAgICB0aGlzLl9pc0NhcmV0QXRFbmQgPSBjYXJldC5vZmZzZXQgPT09IHRleHQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RDYXJldDtcbiAgICB9XG5cbiAgICBjbGVhclVuZG9IaXN0b3J5KCkge1xuICAgICAgICB0aGlzLmhpc3RvcnlNYW5hZ2VyLmNsZWFyKCk7XG4gICAgfVxuXG4gICAgZ2V0Q2FyZXQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RDYXJldDtcbiAgICB9XG5cbiAgICBpc1NlbGVjdGlvbkNvbGxhcHNlZCgpIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmxhc3RTZWxlY3Rpb24gfHwgdGhpcy5sYXN0U2VsZWN0aW9uLmlzQ29sbGFwc2VkO1xuICAgIH1cblxuICAgIGlzQ2FyZXRBdFN0YXJ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDYXJldCgpLm9mZnNldCA9PT0gMDtcbiAgICB9XG5cbiAgICBpc0NhcmV0QXRFbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pc0NhcmV0QXRFbmQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkJsdXIgPSAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgdGhpcy5vblNlbGVjdGlvbkNoYW5nZSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Gb2N1cyA9ICgpID0+IHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInNlbGVjdGlvbmNoYW5nZVwiLCB0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlKTtcbiAgICAgICAgLy8gZm9yY2UgdG8gcmVjYWxjdWxhdGVcbiAgICAgICAgdGhpcy5sYXN0U2VsZWN0aW9uID0gbnVsbDtcbiAgICAgICAgdGhpcy5yZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvblNlbGVjdGlvbkNoYW5nZSA9ICgpID0+IHtcbiAgICAgICAgY29uc3Qge2lzRW1wdHl9ID0gdGhpcy5wcm9wcy5tb2RlbDtcblxuICAgICAgICB0aGlzLnJlZnJlc2hMYXN0Q2FyZXRJZk5lZWRlZCgpO1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgaWYgKHRoaXMuaGFzVGV4dFNlbGVjdGVkICYmIHNlbGVjdGlvbi5pc0NvbGxhcHNlZCkge1xuICAgICAgICAgICAgdGhpcy5oYXNUZXh0U2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZvcm1hdEJhclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIXNlbGVjdGlvbi5pc0NvbGxhcHNlZCAmJiAhaXNFbXB0eSkge1xuICAgICAgICAgICAgdGhpcy5oYXNUZXh0U2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3Rpb25SZWN0ID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoMCkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudC5zaG93QXQoc2VsZWN0aW9uUmVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbktleURvd24gPSAoZXZlbnQ6IFJlYWN0LktleWJvYXJkRXZlbnQpID0+IHtcbiAgICAgICAgY29uc3QgbW9kZWwgPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBjb25zdCBtb2RLZXkgPSBJU19NQUMgPyBldmVudC5tZXRhS2V5IDogZXZlbnQuY3RybEtleTtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gZm9ybWF0IGJvbGRcbiAgICAgICAgaWYgKG1vZEtleSAmJiBldmVudC5rZXkgPT09IEtleS5CKSB7XG4gICAgICAgICAgICB0aGlzLm9uRm9ybWF0QWN0aW9uKEZvcm1hdHRpbmcuQm9sZCk7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gZm9ybWF0IGl0YWxpY3NcbiAgICAgICAgfSBlbHNlIGlmIChtb2RLZXkgJiYgZXZlbnQua2V5ID09PSBLZXkuSSkge1xuICAgICAgICAgICAgdGhpcy5vbkZvcm1hdEFjdGlvbihGb3JtYXR0aW5nLkl0YWxpY3MpO1xuICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgIC8vIGZvcm1hdCBxdW90ZVxuICAgICAgICB9IGVsc2UgaWYgKG1vZEtleSAmJiBldmVudC5rZXkgPT09IEtleS5HUkVBVEVSX1RIQU4pIHtcbiAgICAgICAgICAgIHRoaXMub25Gb3JtYXRBY3Rpb24oRm9ybWF0dGluZy5RdW90ZSk7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gcmVkb1xuICAgICAgICB9IGVsc2UgaWYgKCghSVNfTUFDICYmIG1vZEtleSAmJiBldmVudC5rZXkgPT09IEtleS5ZKSB8fFxuICAgICAgICAgICAgICAgICAgKElTX01BQyAmJiBtb2RLZXkgJiYgZXZlbnQuc2hpZnRLZXkgJiYgZXZlbnQua2V5ID09PSBLZXkuWikpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmhpc3RvcnlNYW5hZ2VyLmNhblJlZG8oKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtwYXJ0cywgY2FyZXR9ID0gdGhpcy5oaXN0b3J5TWFuYWdlci5yZWRvKCk7XG4gICAgICAgICAgICAgICAgLy8gcGFzcyBtYXRjaGluZyBpbnB1dFR5cGUgc28gaGlzdG9yeU1hbmFnZXIgZG9lc24ndCBwdXNoIGVjaG9cbiAgICAgICAgICAgICAgICAvLyB3aGVuIGludm9rZWQgZnJvbSByZXJlbmRlciBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICBtb2RlbC5yZXNldChwYXJ0cywgY2FyZXQsIFwiaGlzdG9yeVJlZG9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gdW5kb1xuICAgICAgICB9IGVsc2UgaWYgKG1vZEtleSAmJiBldmVudC5rZXkgPT09IEtleS5aKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5oaXN0b3J5TWFuYWdlci5jYW5VbmRvKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7cGFydHMsIGNhcmV0fSA9IHRoaXMuaGlzdG9yeU1hbmFnZXIudW5kbyh0aGlzLnByb3BzLm1vZGVsKTtcbiAgICAgICAgICAgICAgICAvLyBwYXNzIG1hdGNoaW5nIGlucHV0VHlwZSBzbyBoaXN0b3J5TWFuYWdlciBkb2Vzbid0IHB1c2ggZWNob1xuICAgICAgICAgICAgICAgIC8vIHdoZW4gaW52b2tlZCBmcm9tIHJlcmVuZGVyIGNhbGxiYWNrLlxuICAgICAgICAgICAgICAgIG1vZGVsLnJlc2V0KHBhcnRzLCBjYXJldCwgXCJoaXN0b3J5VW5kb1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAvLyBpbnNlcnQgbmV3bGluZSBvbiBTaGlmdCtFbnRlclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gS2V5LkVOVEVSICYmIChldmVudC5zaGlmdEtleSB8fCAoSVNfTUFDICYmIGV2ZW50LmFsdEtleSkpKSB7XG4gICAgICAgICAgICB0aGlzLmluc2VydFRleHQoXCJcXG5cIik7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gbW92ZSBzZWxlY3Rpb24gdG8gc3RhcnQgb2YgY29tcG9zZXJcbiAgICAgICAgfSBlbHNlIGlmIChtb2RLZXkgJiYgZXZlbnQua2V5ID09PSBLZXkuSE9NRSAmJiAhZXZlbnQuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIHNldFNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBtb2RlbCwge1xuICAgICAgICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICAgICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgIC8vIG1vdmUgc2VsZWN0aW9uIHRvIGVuZCBvZiBjb21wb3NlclxuICAgICAgICB9IGVsc2UgaWYgKG1vZEtleSAmJiBldmVudC5rZXkgPT09IEtleS5FTkQgJiYgIWV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICBzZXRTZWxlY3Rpb24odGhpcy5lZGl0b3JSZWYuY3VycmVudCwgbW9kZWwsIHtcbiAgICAgICAgICAgICAgICBpbmRleDogbW9kZWwucGFydHMubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IG1vZGVsLnBhcnRzW21vZGVsLnBhcnRzLmxlbmd0aCAtIDFdLnRleHQubGVuZ3RoLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgLy8gYXV0b2NvbXBsZXRlIG9yIGVudGVyIHRvIHNlbmQgYmVsb3cgc2hvdWxkbid0IGhhdmUgYW55IG1vZGlmaWVyIGtleXMgcHJlc3NlZC5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IG1ldGFPckFsdFByZXNzZWQgPSBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmFsdEtleTtcbiAgICAgICAgICAgIGNvbnN0IG1vZGlmaWVyUHJlc3NlZCA9IG1ldGFPckFsdFByZXNzZWQgfHwgZXZlbnQuc2hpZnRLZXk7XG4gICAgICAgICAgICBpZiAobW9kZWwuYXV0b0NvbXBsZXRlICYmIG1vZGVsLmF1dG9Db21wbGV0ZS5oYXNDb21wbGV0aW9ucygpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXV0b0NvbXBsZXRlID0gbW9kZWwuYXV0b0NvbXBsZXRlO1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgS2V5LkFSUk9XX1VQOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllclByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGUub25VcEFycm93KGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIEtleS5BUlJPV19ET1dOOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllclByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGUub25Eb3duQXJyb3coZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgS2V5LlRBQjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWV0YU9yQWx0UHJlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZS5vblRhYihldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBLZXkuRVNDQVBFOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllclByZXNzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvQ29tcGxldGUub25Fc2NhcGUoZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47IC8vIGRvbid0IHByZXZlbnREZWZhdWx0IG9uIGFueXRoaW5nIGVsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gS2V5LlRBQikge1xuICAgICAgICAgICAgICAgIHRoaXMudGFiQ29tcGxldGVOYW1lKGV2ZW50KTtcbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBLZXkuQkFDS1NQQUNFIHx8IGV2ZW50LmtleSA9PT0gS2V5LkRFTEVURSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBhc3luYyB0YWJDb21wbGV0ZU5hbWUoZXZlbnQ6IFJlYWN0LktleWJvYXJkRXZlbnQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7c2hvd1Zpc3VhbEJlbGw6IGZhbHNlfSwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qge21vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBjYXJldCA9IHRoaXMuZ2V0Q2FyZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBtb2RlbC5zdGFydFJhbmdlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHJhbmdlLmV4cGFuZEJhY2t3YXJkc1doaWxlKChpbmRleCwgb2Zmc2V0LCBwYXJ0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnQudGV4dFtvZmZzZXRdICE9PSBcIiBcIiAmJiBwYXJ0LnRleHRbb2Zmc2V0XSAhPT0gXCIrXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwicGlsbC1jYW5kaWRhdGVcIiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwiY29tbWFuZFwiXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICAgICAgLy8gYXdhaXQgZm9yIGF1dG8tY29tcGxldGUgdG8gYmUgb3BlblxuICAgICAgICAgICAgYXdhaXQgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IHJhbmdlLnJlcGxhY2UoW3BhcnRDcmVhdG9yLnBpbGxDYW5kaWRhdGUocmFuZ2UudGV4dCldKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERvbid0IHRyeSB0byBkbyB0aGluZ3Mgd2l0aCB0aGUgYXV0b2NvbXBsZXRlIGlmIHRoZXJlIGlzIG5vbmUgc2hvd25cbiAgICAgICAgICAgIGlmIChtb2RlbC5hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBtb2RlbC5hdXRvQ29tcGxldGUub25UYWIoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGlmICghbW9kZWwuYXV0b0NvbXBsZXRlLmhhc1NlbGVjdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dWaXN1YWxCZWxsOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICAgIG1vZGVsLmF1dG9Db21wbGV0ZS5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc01vZGlmaWVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tb2RpZmllZEZsYWc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkF1dG9Db21wbGV0ZUNvbmZpcm0gPSAoY29tcGxldGlvbjogSUNvbXBsZXRpb24pID0+IHtcbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLmF1dG9Db21wbGV0ZS5vbkNvbXBvbmVudENvbmZpcm0oY29tcGxldGlvbik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25BdXRvQ29tcGxldGVTZWxlY3Rpb25DaGFuZ2UgPSAoY29tcGxldGlvbjogSUNvbXBsZXRpb24sIGNvbXBsZXRpb25JbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5hdXRvQ29tcGxldGUub25Db21wb25lbnRTZWxlY3Rpb25DaGFuZ2UoY29tcGxldGlvbik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe2NvbXBsZXRpb25JbmRleH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNvbmZpZ3VyZUVtb3RpY29uQXV0b1JlcGxhY2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNob3VsZFJlcGxhY2UgPSBTZXR0aW5nc1N0b3JlLmdldFZhbHVlKCdNZXNzYWdlQ29tcG9zZXJJbnB1dC5hdXRvUmVwbGFjZUVtb2ppJyk7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwuc2V0VHJhbnNmb3JtQ2FsbGJhY2soc2hvdWxkUmVwbGFjZSA/IHRoaXMucmVwbGFjZUVtb3RpY29uIDogbnVsbCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgY29uZmlndXJlU2hvdWxkU2hvd1BpbGxBdmF0YXIgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNob3dQaWxsQXZhdGFyID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIik7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzaG93UGlsbEF2YXRhciB9KTtcbiAgICB9O1xuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgdGhpcy5vblNlbGVjdGlvbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMub25JbnB1dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uc3RhcnRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uU3RhcnQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCB0aGlzLm9uQ29tcG9zaXRpb25FbmQsIHRydWUpO1xuICAgICAgICBTZXR0aW5nc1N0b3JlLnVud2F0Y2hTZXR0aW5nKHRoaXMuZW1vdGljb25TZXR0aW5nSGFuZGxlKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLnNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgbW9kZWwuc2V0VXBkYXRlQ2FsbGJhY2sodGhpcy51cGRhdGVFZGl0b3JTdGF0ZSk7XG4gICAgICAgIGNvbnN0IHBhcnRDcmVhdG9yID0gbW9kZWwucGFydENyZWF0b3I7XG4gICAgICAgIC8vIFRPRE86IGRvZXMgdGhpcyBhbGxvdyB1cyB0byBnZXQgcmlkIG9mIEVkaXRvclN0YXRlVHJhbnNmZXI/XG4gICAgICAgIC8vIG5vdCByZWFsbHksIGJ1dCB3ZSBjb3VsZCBub3Qgc2VyaWFsaXplIHRoZSBwYXJ0cywgYW5kIGp1c3QgY2hhbmdlIHRoZSBhdXRvQ29tcGxldGVyXG4gICAgICAgIHBhcnRDcmVhdG9yLnNldEF1dG9Db21wbGV0ZUNyZWF0b3IoZ2V0QXV0b0NvbXBsZXRlQ3JlYXRvcihcbiAgICAgICAgICAgICgpID0+IHRoaXMuYXV0b2NvbXBsZXRlUmVmLmN1cnJlbnQsXG4gICAgICAgICAgICBxdWVyeSA9PiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHRoaXMuc2V0U3RhdGUoe3F1ZXJ5fSwgcmVzb2x2ZSkpLFxuICAgICAgICApKTtcbiAgICAgICAgLy8gaW5pdGlhbCByZW5kZXIgb2YgbW9kZWxcbiAgICAgICAgdGhpcy51cGRhdGVFZGl0b3JTdGF0ZSh0aGlzLmdldEluaXRpYWxDYXJldFBvc2l0aW9uKCkpO1xuICAgICAgICAvLyBhdHRhY2ggaW5wdXQgbGlzdGVuZXIgYnkgaGFuZCBzbyBSZWFjdCBkb2Vzbid0IHByb3h5IHRoZSBldmVudHMsXG4gICAgICAgIC8vIGFzIHRoZSBwcm94aWVkIGV2ZW50IGRvZXNuJ3Qgc3VwcG9ydCBpbnB1dFR5cGUsIHdoaWNoIHdlIG5lZWQuXG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIHRoaXMub25JbnB1dCwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNvbXBvc2l0aW9uc3RhcnRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uU3RhcnQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbmVuZFwiLCB0aGlzLm9uQ29tcG9zaXRpb25FbmQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmZvY3VzKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJbml0aWFsQ2FyZXRQb3NpdGlvbigpIHtcbiAgICAgICAgbGV0IGNhcmV0UG9zaXRpb247XG4gICAgICAgIGlmICh0aGlzLnByb3BzLmluaXRpYWxDYXJldCkge1xuICAgICAgICAgICAgLy8gaWYgcmVzdG9yaW5nIHN0YXRlIGZyb20gYSBwcmV2aW91cyBlZGl0b3IsXG4gICAgICAgICAgICAvLyByZXN0b3JlIGNhcmV0IHBvc2l0aW9uIGZyb20gdGhlIHN0YXRlXG4gICAgICAgICAgICBjb25zdCBjYXJldCA9IHRoaXMucHJvcHMuaW5pdGlhbENhcmV0O1xuICAgICAgICAgICAgY2FyZXRQb3NpdGlvbiA9IHRoaXMucHJvcHMubW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBzZXQgaXQgYXQgdGhlIGVuZFxuICAgICAgICAgICAgY2FyZXRQb3NpdGlvbiA9IHRoaXMucHJvcHMubW9kZWwuZ2V0UG9zaXRpb25BdEVuZCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjYXJldFBvc2l0aW9uO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Gb3JtYXRBY3Rpb24gPSAoYWN0aW9uOiBGb3JtYXR0aW5nKSA9PiB7XG4gICAgICAgIGNvbnN0IHJhbmdlID0gZ2V0UmFuZ2VGb3JTZWxlY3Rpb24odGhpcy5lZGl0b3JSZWYuY3VycmVudCwgdGhpcy5wcm9wcy5tb2RlbCwgZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkpO1xuICAgICAgICAvLyB0cmltIHRoZSByYW5nZSBhcyB3ZSB3YW50IGl0IHRvIGV4Y2x1ZGUgbGVhZGluZy90cmFpbGluZyBzcGFjZXNcbiAgICAgICAgcmFuZ2UudHJpbSgpO1xuXG4gICAgICAgIGlmIChyYW5nZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuaGlzdG9yeU1hbmFnZXIuZW5zdXJlTGFzdENoYW5nZXNQdXNoZWQodGhpcy5wcm9wcy5tb2RlbCk7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgRm9ybWF0dGluZy5Cb2xkOlxuICAgICAgICAgICAgICAgIHRvZ2dsZUlubGluZUZvcm1hdChyYW5nZSwgXCIqKlwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRm9ybWF0dGluZy5JdGFsaWNzOlxuICAgICAgICAgICAgICAgIHRvZ2dsZUlubGluZUZvcm1hdChyYW5nZSwgXCJfXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBGb3JtYXR0aW5nLlN0cmlrZXRocm91Z2g6XG4gICAgICAgICAgICAgICAgdG9nZ2xlSW5saW5lRm9ybWF0KHJhbmdlLCBcIjxkZWw+XCIsIFwiPC9kZWw+XCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBGb3JtYXR0aW5nLkNvZGU6XG4gICAgICAgICAgICAgICAgZm9ybWF0UmFuZ2VBc0NvZGUocmFuZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBGb3JtYXR0aW5nLlF1b3RlOlxuICAgICAgICAgICAgICAgIGZvcm1hdFJhbmdlQXNRdW90ZShyYW5nZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgYXV0b0NvbXBsZXRlO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5zdGF0ZS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IHF1ZXJ5TGVuID0gcXVlcnkubGVuZ3RoO1xuICAgICAgICAgICAgYXV0b0NvbXBsZXRlID0gKDxkaXYgY2xhc3NOYW1lPVwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfQXV0b0NvbXBsZXRlV3JhcHBlclwiPlxuICAgICAgICAgICAgICAgIDxBdXRvY29tcGxldGVcbiAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmF1dG9jb21wbGV0ZVJlZn1cbiAgICAgICAgICAgICAgICAgICAgcXVlcnk9e3F1ZXJ5fVxuICAgICAgICAgICAgICAgICAgICBvbkNvbmZpcm09e3RoaXMub25BdXRvQ29tcGxldGVDb25maXJtfVxuICAgICAgICAgICAgICAgICAgICBvblNlbGVjdGlvbkNoYW5nZT17dGhpcy5vbkF1dG9Db21wbGV0ZVNlbGVjdGlvbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uPXt7YmVnaW5uaW5nOiB0cnVlLCBlbmQ6IHF1ZXJ5TGVuLCBzdGFydDogcXVlcnlMZW59fVxuICAgICAgICAgICAgICAgICAgICByb29tPXt0aGlzLnByb3BzLnJvb219XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2Pik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgd3JhcHBlckNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJcIiwge1xuICAgICAgICAgICAgXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dF9lcnJvclwiOiB0aGlzLnN0YXRlLnNob3dWaXN1YWxCZWxsLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY2xhc3NlcyA9IGNsYXNzTmFtZXMoXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dFwiLCB7XG4gICAgICAgICAgICBcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX2lucHV0X3Nob3VsZFNob3dQaWxsQXZhdGFyXCI6IHRoaXMuc3RhdGUuc2hvd1BpbGxBdmF0YXIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IHNob3J0Y3V0cyA9IHtcbiAgICAgICAgICAgIGJvbGQ6IGN0cmxTaG9ydGN1dExhYmVsKFwiQlwiKSxcbiAgICAgICAgICAgIGl0YWxpY3M6IGN0cmxTaG9ydGN1dExhYmVsKFwiSVwiKSxcbiAgICAgICAgICAgIHF1b3RlOiBjdHJsU2hvcnRjdXRMYWJlbChcIj5cIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3Qge2NvbXBsZXRpb25JbmRleH0gPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9e3dyYXBwZXJDbGFzc2VzfT5cbiAgICAgICAgICAgIHsgYXV0b0NvbXBsZXRlIH1cbiAgICAgICAgICAgIDxNZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXIgcmVmPXt0aGlzLmZvcm1hdEJhclJlZn0gb25BY3Rpb249e3RoaXMub25Gb3JtYXRBY3Rpb259IHNob3J0Y3V0cz17c2hvcnRjdXRzfSAvPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3Nlc31cbiAgICAgICAgICAgICAgICBjb250ZW50RWRpdGFibGU9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICB0YWJJbmRleD17MH1cbiAgICAgICAgICAgICAgICBvbkJsdXI9e3RoaXMub25CbHVyfVxuICAgICAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgICAgICBvbkNvcHk9e3RoaXMub25Db3B5fVxuICAgICAgICAgICAgICAgIG9uQ3V0PXt0aGlzLm9uQ3V0fVxuICAgICAgICAgICAgICAgIG9uUGFzdGU9e3RoaXMub25QYXN0ZX1cbiAgICAgICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgICAgIHJlZj17dGhpcy5lZGl0b3JSZWZ9XG4gICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17dGhpcy5wcm9wcy5sYWJlbH1cbiAgICAgICAgICAgICAgICByb2xlPVwidGV4dGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1tdWx0aWxpbmU9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICBhcmlhLWF1dG9jb21wbGV0ZT1cImJvdGhcIlxuICAgICAgICAgICAgICAgIGFyaWEtaGFzcG9wdXA9XCJsaXN0Ym94XCJcbiAgICAgICAgICAgICAgICBhcmlhLWV4cGFuZGVkPXtCb29sZWFuKHRoaXMuc3RhdGUuYXV0b0NvbXBsZXRlKX1cbiAgICAgICAgICAgICAgICBhcmlhLWFjdGl2ZWRlc2NlbmRhbnQ9e2NvbXBsZXRpb25JbmRleCA+PSAwID8gZ2VuZXJhdGVDb21wbGV0aW9uRG9tSWQoY29tcGxldGlvbkluZGV4KSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICBkaXI9XCJhdXRvXCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICB9XG59XG4iXX0=