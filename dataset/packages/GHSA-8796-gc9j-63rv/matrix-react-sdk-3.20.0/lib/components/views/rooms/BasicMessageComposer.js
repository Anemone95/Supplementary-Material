"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _KeyBindingsManager = require("../../../KeyBindingsManager");

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

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

let BasicMessageEditor = (_dec = (0, _replaceableComponent.replaceableComponent)("views.rooms.BasicMessageEditor"), _dec(_class = (_temp = class BasicMessageEditor extends _react.default.Component
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
      let handled = false;
      const action = (0, _KeyBindingsManager.getKeyBindingsManager)().getMessageComposerAction(event);

      switch (action) {
        case _KeyBindingsManager.MessageComposerAction.FormatBold:
          this.onFormatAction(Formatting.Bold);
          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.FormatItalics:
          this.onFormatAction(Formatting.Italics);
          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.FormatQuote:
          this.onFormatAction(Formatting.Quote);
          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.EditRedo:
          if (this.historyManager.canRedo()) {
            const {
              parts,
              caret
            } = this.historyManager.redo(); // pass matching inputType so historyManager doesn't push echo
            // when invoked from rerender callback.

            model.reset(parts, caret, "historyRedo");
          }

          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.EditUndo:
          if (this.historyManager.canUndo()) {
            const {
              parts,
              caret
            } = this.historyManager.undo(this.props.model); // pass matching inputType so historyManager doesn't push echo
            // when invoked from rerender callback.

            model.reset(parts, caret, "historyUndo");
          }

          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.NewLine:
          this.insertText("\n");
          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.MoveCursorToStart:
          (0, _caret.setSelection)(this.editorRef.current, model, {
            index: 0,
            offset: 0
          });
          handled = true;
          break;

        case _KeyBindingsManager.MessageComposerAction.MoveCursorToEnd:
          (0, _caret.setSelection)(this.editorRef.current, model, {
            index: model.parts.length - 1,
            offset: model.parts[model.parts.length - 1].text.length
          });
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      const autocompleteAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getAutocompleteAction(event);

      if (model.autoComplete && model.autoComplete.hasCompletions()) {
        const autoComplete = model.autoComplete;

        switch (autocompleteAction) {
          case _KeyBindingsManager.AutocompleteAction.CompleteOrPrevSelection:
          case _KeyBindingsManager.AutocompleteAction.PrevSelection:
            autoComplete.selectPreviousSelection();
            handled = true;
            break;

          case _KeyBindingsManager.AutocompleteAction.CompleteOrNextSelection:
          case _KeyBindingsManager.AutocompleteAction.NextSelection:
            autoComplete.selectNextSelection();
            handled = true;
            break;

          case _KeyBindingsManager.AutocompleteAction.Cancel:
            autoComplete.onEscape(event);
            handled = true;
            break;

          default:
            return;
          // don't preventDefault on anything else
        }
      } else if (autocompleteAction === _KeyBindingsManager.AutocompleteAction.CompleteOrPrevSelection || autocompleteAction === _KeyBindingsManager.AutocompleteAction.CompleteOrNextSelection) {
        // there is no current autocomplete window, try to open it
        this.tabCompleteName();
        handled = true;
      } else if (event.key === _Keyboard.Key.BACKSPACE || event.key === _Keyboard.Key.DELETE) {
        this.formatBarRef.current.hide();
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
    // We need to re-check the placeholder when the enabled state changes because it causes the
    // placeholder element to remount, which gets rid of the `::before` class. Re-evaluating the
    // placeholder means we get a proper `::before` with the placeholder.
    const enabledChange = this.props.disabled !== prevProps.disabled;
    const placeholderChanged = this.props.placeholder !== prevProps.placeholder;

    if (this.props.placeholder && (placeholderChanged || enabledChange)) {
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

  async tabCompleteName() {
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
        await model.autoComplete.startSelection();

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
      "mx_BasicMessageComposer_input_shouldShowPillAvatar": this.state.showPillAvatar,
      "mx_BasicMessageComposer_input_disabled": this.props.disabled
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
      dir: "auto",
      "aria-disabled": this.props.disabled
    }));
  }

  focus() {
    this.editorRef.current.focus();
  }

}, _temp)) || _class);
exports.default = BasicMessageEditor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL3Jvb21zL0Jhc2ljTWVzc2FnZUNvbXBvc2VyLnRzeCJdLCJuYW1lcyI6WyJSRUdFWF9FTU9USUNPTl9XSElURVNQQUNFIiwiUmVnRXhwIiwiRU1PVElDT05fUkVHRVgiLCJzb3VyY2UiLCJJU19NQUMiLCJuYXZpZ2F0b3IiLCJwbGF0Zm9ybSIsImluZGV4T2YiLCJjdHJsU2hvcnRjdXRMYWJlbCIsImtleSIsImNsb25lU2VsZWN0aW9uIiwic2VsZWN0aW9uIiwiYW5jaG9yTm9kZSIsImFuY2hvck9mZnNldCIsImZvY3VzTm9kZSIsImZvY3VzT2Zmc2V0IiwiaXNDb2xsYXBzZWQiLCJyYW5nZUNvdW50IiwidHlwZSIsInNlbGVjdGlvbkVxdWFscyIsImEiLCJiIiwiRm9ybWF0dGluZyIsIkJhc2ljTWVzc2FnZUVkaXRvciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsIkhpc3RvcnlNYW5hZ2VyIiwiY2FyZXRQb3NpdGlvbiIsIm1vZGVsIiwicmFuZ2UiLCJzdGFydFJhbmdlIiwibiIsImV4cGFuZEJhY2t3YXJkc1doaWxlIiwiaW5kZXgiLCJvZmZzZXQiLCJwYXJ0IiwicGFydHMiLCJlbW90aWNvbk1hdGNoIiwiZXhlYyIsInRleHQiLCJxdWVyeSIsInJlcGxhY2UiLCJkYXRhIiwiRU1PVElDT05fVE9fRU1PSkkiLCJnZXQiLCJ0b0xvd2VyQ2FzZSIsInBhcnRDcmVhdG9yIiwiaGFzUHJlY2VkaW5nU3BhY2UiLCJtb3ZlU3RhcnQiLCJwbGFpbiIsInVuaWNvZGUiLCJpbnB1dFR5cGUiLCJkaWZmIiwiZWRpdG9yUmVmIiwiY3VycmVudCIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInBvc2l0aW9uIiwiUmFuZ2UiLCJlbmQiLCJzZXRMYXN0Q2FyZXRGcm9tUG9zaXRpb24iLCJpc0VtcHR5IiwicGxhY2Vob2xkZXIiLCJzaG93UGxhY2Vob2xkZXIiLCJoaWRlUGxhY2Vob2xkZXIiLCJmb3JtYXRCYXJSZWYiLCJoaWRlIiwic2V0U3RhdGUiLCJhdXRvQ29tcGxldGUiLCJoaXN0b3J5TWFuYWdlciIsInRyeVB1c2giLCJpc1R5cGluZyIsImNtZCIsImNvbW1hbmQiLCJDb21tYW5kTWFwIiwiaXNFbmFibGVkIiwiY2F0ZWdvcnkiLCJDb21tYW5kQ2F0ZWdvcmllcyIsIm1lc3NhZ2VzIiwiVHlwaW5nU3RvcmUiLCJzaGFyZWRJbnN0YW5jZSIsInNldFNlbGZUeXBpbmciLCJyb29tIiwicm9vbUlkIiwib25DaGFuZ2UiLCJpc0lNRUNvbXBvc2luZyIsInVhIiwidXNlckFnZW50IiwiaXNTYWZhcmkiLCJpbmNsdWRlcyIsIm9uSW5wdXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInRoZW4iLCJldmVudCIsImRvY3VtZW50IiwiZ2V0U2VsZWN0aW9uIiwidG9TdHJpbmciLCJzZWxlY3RlZFBhcnRzIiwibWFwIiwicCIsInNlcmlhbGl6ZSIsImNsaXBib2FyZERhdGEiLCJzZXREYXRhIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1vZGlmaWVkRmxhZyIsInByZXZlbnREZWZhdWx0Iiwib25DdXRDb3B5Iiwib25QYXN0ZSIsInBhcnRzVGV4dCIsImdldERhdGEiLCJzZXJpYWxpemVkVGV4dFBhcnRzIiwicGFyc2UiLCJkZXNlcmlhbGl6ZWRQYXJ0cyIsImRlc2VyaWFsaXplUGFydCIsInNlbCIsImNhcmV0IiwidXBkYXRlIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uU2VsZWN0aW9uQ2hhbmdlIiwiYWRkRXZlbnRMaXN0ZW5lciIsImxhc3RTZWxlY3Rpb24iLCJyZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQiLCJoYXNUZXh0U2VsZWN0ZWQiLCJzZWxlY3Rpb25SZWN0IiwiZ2V0UmFuZ2VBdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInNob3dBdCIsImhhbmRsZWQiLCJhY3Rpb24iLCJnZXRNZXNzYWdlQ29tcG9zZXJBY3Rpb24iLCJNZXNzYWdlQ29tcG9zZXJBY3Rpb24iLCJGb3JtYXRCb2xkIiwib25Gb3JtYXRBY3Rpb24iLCJCb2xkIiwiRm9ybWF0SXRhbGljcyIsIkl0YWxpY3MiLCJGb3JtYXRRdW90ZSIsIlF1b3RlIiwiRWRpdFJlZG8iLCJjYW5SZWRvIiwicmVkbyIsInJlc2V0IiwiRWRpdFVuZG8iLCJjYW5VbmRvIiwidW5kbyIsIk5ld0xpbmUiLCJpbnNlcnRUZXh0IiwiTW92ZUN1cnNvclRvU3RhcnQiLCJNb3ZlQ3Vyc29yVG9FbmQiLCJsZW5ndGgiLCJzdG9wUHJvcGFnYXRpb24iLCJhdXRvY29tcGxldGVBY3Rpb24iLCJnZXRBdXRvY29tcGxldGVBY3Rpb24iLCJoYXNDb21wbGV0aW9ucyIsIkF1dG9jb21wbGV0ZUFjdGlvbiIsIkNvbXBsZXRlT3JQcmV2U2VsZWN0aW9uIiwiUHJldlNlbGVjdGlvbiIsInNlbGVjdFByZXZpb3VzU2VsZWN0aW9uIiwiQ29tcGxldGVPck5leHRTZWxlY3Rpb24iLCJOZXh0U2VsZWN0aW9uIiwic2VsZWN0TmV4dFNlbGVjdGlvbiIsIkNhbmNlbCIsIm9uRXNjYXBlIiwidGFiQ29tcGxldGVOYW1lIiwiS2V5IiwiQkFDS1NQQUNFIiwiREVMRVRFIiwiY29tcGxldGlvbiIsIm9uQ29tcG9uZW50Q29uZmlybSIsImNvbXBsZXRpb25JbmRleCIsIm9uQ29tcG9uZW50U2VsZWN0aW9uQ2hhbmdlIiwic2hvdWxkUmVwbGFjZSIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsInNldFRyYW5zZm9ybUNhbGxiYWNrIiwicmVwbGFjZUVtb3RpY29uIiwic2hvd1BpbGxBdmF0YXIiLCJ0cmltIiwiZW5zdXJlTGFzdENoYW5nZXNQdXNoZWQiLCJTdHJpa2V0aHJvdWdoIiwiQ29kZSIsInN0YXRlIiwiZW1vdGljb25TZXR0aW5nSGFuZGxlIiwid2F0Y2hTZXR0aW5nIiwiY29uZmlndXJlRW1vdGljb25BdXRvUmVwbGFjZSIsInNob3VsZFNob3dQaWxsQXZhdGFyU2V0dGluZ0hhbmRsZSIsImNvbmZpZ3VyZVNob3VsZFNob3dQaWxsQXZhdGFyIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwiZW5hYmxlZENoYW5nZSIsImRpc2FibGVkIiwicGxhY2Vob2xkZXJDaGFuZ2VkIiwic3R5bGUiLCJzZXRQcm9wZXJ0eSIsImNsYXNzTGlzdCIsImFkZCIsInJlbW92ZSIsInJlbW92ZVByb3BlcnR5IiwiaXNDb21wb3NpbmciLCJuYXRpdmVFdmVudCIsInRleHRUb0luc2VydCIsIm5ld1RleHQiLCJzdWJzdHIiLCJfaXNDYXJldEF0RW5kIiwiaXNBdEVuZCIsImxhc3RDYXJldCIsImFzT2Zmc2V0IiwiY2xlYXJVbmRvSGlzdG9yeSIsImNsZWFyIiwiZ2V0Q2FyZXQiLCJpc1NlbGVjdGlvbkNvbGxhcHNlZCIsImlzQ2FyZXRBdFN0YXJ0IiwiaXNDYXJldEF0RW5kIiwic2hvd1Zpc3VhbEJlbGwiLCJwb3NpdGlvbkZvck9mZnNldCIsImF0Tm9kZUVuZCIsInRyYW5zZm9ybSIsImFkZGVkTGVuIiwicGlsbENhbmRpZGF0ZSIsInN0YXJ0U2VsZWN0aW9uIiwiaGFzU2VsZWN0aW9uIiwiY2xvc2UiLCJpc01vZGlmaWVkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJvbkNvbXBvc2l0aW9uU3RhcnQiLCJvbkNvbXBvc2l0aW9uRW5kIiwidW53YXRjaFNldHRpbmciLCJjb21wb25lbnREaWRNb3VudCIsInNldFVwZGF0ZUNhbGxiYWNrIiwidXBkYXRlRWRpdG9yU3RhdGUiLCJzZXRBdXRvQ29tcGxldGVDcmVhdG9yIiwiYXV0b2NvbXBsZXRlUmVmIiwiZ2V0SW5pdGlhbENhcmV0UG9zaXRpb24iLCJmb2N1cyIsImluaXRpYWxDYXJldCIsImdldFBvc2l0aW9uQXRFbmQiLCJyZW5kZXIiLCJxdWVyeUxlbiIsIm9uQXV0b0NvbXBsZXRlQ29uZmlybSIsIm9uQXV0b0NvbXBsZXRlU2VsZWN0aW9uQ2hhbmdlIiwiYmVnaW5uaW5nIiwic3RhcnQiLCJ3cmFwcGVyQ2xhc3NlcyIsImNsYXNzZXMiLCJzaG9ydGN1dHMiLCJib2xkIiwiaXRhbGljcyIsInF1b3RlIiwib25CbHVyIiwib25Gb2N1cyIsIm9uQ29weSIsIm9uQ3V0Iiwib25LZXlEb3duIiwibGFiZWwiLCJCb29sZWFuIiwidW5kZWZpbmVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBaUJBOztBQUNBOztBQUVBOztBQUdBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQU1BOztBQUNBOzs7O0FBRUE7QUFDQSxNQUFNQSx5QkFBeUIsR0FBRyxJQUFJQyxNQUFKLENBQVcsZUFBZUMsa0JBQWVDLE1BQTlCLEdBQXVDLE9BQWxELENBQWxDO0FBRUEsTUFBTUMsTUFBTSxHQUFHQyxTQUFTLENBQUNDLFFBQVYsQ0FBbUJDLE9BQW5CLENBQTJCLEtBQTNCLE1BQXNDLENBQUMsQ0FBdEQ7O0FBRUEsU0FBU0MsaUJBQVQsQ0FBMkJDLEdBQTNCLEVBQWdDO0FBQzVCLFNBQU8sQ0FBQ0wsTUFBTSxHQUFHLEdBQUgsR0FBUyxNQUFoQixJQUEwQixHQUExQixHQUFnQ0ssR0FBdkM7QUFDSDs7QUFFRCxTQUFTQyxjQUFULENBQXdCQztBQUF4QjtBQUFBO0FBQUE7QUFBa0U7QUFDOUQsU0FBTztBQUNIQyxJQUFBQSxVQUFVLEVBQUVELFNBQVMsQ0FBQ0MsVUFEbkI7QUFFSEMsSUFBQUEsWUFBWSxFQUFFRixTQUFTLENBQUNFLFlBRnJCO0FBR0hDLElBQUFBLFNBQVMsRUFBRUgsU0FBUyxDQUFDRyxTQUhsQjtBQUlIQyxJQUFBQSxXQUFXLEVBQUVKLFNBQVMsQ0FBQ0ksV0FKcEI7QUFLSEMsSUFBQUEsV0FBVyxFQUFFTCxTQUFTLENBQUNLLFdBTHBCO0FBTUhDLElBQUFBLFVBQVUsRUFBRU4sU0FBUyxDQUFDTSxVQU5uQjtBQU9IQyxJQUFBQSxJQUFJLEVBQUVQLFNBQVMsQ0FBQ087QUFQYixHQUFQO0FBU0g7O0FBRUQsU0FBU0MsZUFBVCxDQUF5QkM7QUFBekI7QUFBQSxFQUFnREM7QUFBaEQ7QUFBQTtBQUFBO0FB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IEx0ZFxuQ29weXJpZ2h0IDIwMTkgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZiwgQ2xpcGJvYXJkRXZlbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um9vbX0gZnJvbSAnbWF0cml4LWpzLXNkay9zcmMvbW9kZWxzL3Jvb20nO1xuaW1wb3J0IEVNT1RJQ09OX1JFR0VYIGZyb20gJ2Vtb2ppYmFzZS1yZWdleC9lbW90aWNvbic7XG5cbmltcG9ydCBFZGl0b3JNb2RlbCBmcm9tICcuLi8uLi8uLi9lZGl0b3IvbW9kZWwnO1xuaW1wb3J0IEhpc3RvcnlNYW5hZ2VyIGZyb20gJy4uLy4uLy4uL2VkaXRvci9oaXN0b3J5JztcbmltcG9ydCB7Q2FyZXQsIHNldFNlbGVjdGlvbn0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2NhcmV0JztcbmltcG9ydCB7XG4gICAgZm9ybWF0UmFuZ2VBc1F1b3RlLFxuICAgIGZvcm1hdFJhbmdlQXNDb2RlLFxuICAgIHRvZ2dsZUlubGluZUZvcm1hdCxcbiAgICByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQsXG59IGZyb20gJy4uLy4uLy4uL2VkaXRvci9vcGVyYXRpb25zJztcbmltcG9ydCB7Z2V0Q2FyZXRPZmZzZXRBbmRUZXh0LCBnZXRSYW5nZUZvclNlbGVjdGlvbn0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2RvbSc7XG5pbXBvcnQgQXV0b2NvbXBsZXRlLCB7Z2VuZXJhdGVDb21wbGV0aW9uRG9tSWR9IGZyb20gJy4uL3Jvb21zL0F1dG9jb21wbGV0ZSc7XG5pbXBvcnQge2dldEF1dG9Db21wbGV0ZUNyZWF0b3J9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9wYXJ0cyc7XG5pbXBvcnQge3BhcnNlUGxhaW5UZXh0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vZWRpdG9yL2Rlc2VyaWFsaXplJztcbmltcG9ydCB7cmVuZGVyTW9kZWx9IGZyb20gJy4uLy4uLy4uL2VkaXRvci9yZW5kZXInO1xuaW1wb3J0IFR5cGluZ1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZXMvVHlwaW5nU3RvcmVcIjtcbmltcG9ydCBTZXR0aW5nc1N0b3JlIGZyb20gXCIuLi8uLi8uLi9zZXR0aW5ncy9TZXR0aW5nc1N0b3JlXCI7XG5pbXBvcnQge0tleX0gZnJvbSBcIi4uLy4uLy4uL0tleWJvYXJkXCI7XG5pbXBvcnQge0VNT1RJQ09OX1RPX0VNT0pJfSBmcm9tIFwiLi4vLi4vLi4vZW1vamlcIjtcbmltcG9ydCB7Q29tbWFuZENhdGVnb3JpZXMsIENvbW1hbmRNYXAsIHBhcnNlQ29tbWFuZFN0cmluZ30gZnJvbSBcIi4uLy4uLy4uL1NsYXNoQ29tbWFuZHNcIjtcbmltcG9ydCBSYW5nZSBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL3JhbmdlXCI7XG5pbXBvcnQgTWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyIGZyb20gXCIuL01lc3NhZ2VDb21wb3NlckZvcm1hdEJhclwiO1xuaW1wb3J0IERvY3VtZW50T2Zmc2V0IGZyb20gXCIuLi8uLi8uLi9lZGl0b3Ivb2Zmc2V0XCI7XG5pbXBvcnQge0lEaWZmfSBmcm9tIFwiLi4vLi4vLi4vZWRpdG9yL2RpZmZcIjtcbmltcG9ydCBBdXRvY29tcGxldGVXcmFwcGVyTW9kZWwgZnJvbSBcIi4uLy4uLy4uL2VkaXRvci9hdXRvY29tcGxldGVcIjtcbmltcG9ydCBEb2N1bWVudFBvc2l0aW9uIGZyb20gXCIuLi8uLi8uLi9lZGl0b3IvcG9zaXRpb25cIjtcbmltcG9ydCB7SUNvbXBsZXRpb259IGZyb20gXCIuLi8uLi8uLi9hdXRvY29tcGxldGUvQXV0b2NvbXBsZXRlclwiO1xuaW1wb3J0IHsgQXV0b2NvbXBsZXRlQWN0aW9uLCBnZXRLZXlCaW5kaW5nc01hbmFnZXIsIE1lc3NhZ2VDb21wb3NlckFjdGlvbiB9IGZyb20gJy4uLy4uLy4uL0tleUJpbmRpbmdzTWFuYWdlcic7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuLy8gbWF0Y2hlcyBlbW90aWNvbnMgd2hpY2ggZm9sbG93IHRoZSBzdGFydCBvZiBhIGxpbmUgb3Igd2hpdGVzcGFjZVxuY29uc3QgUkVHRVhfRU1PVElDT05fV0hJVEVTUEFDRSA9IG5ldyBSZWdFeHAoJyg/Ol58XFxcXHMpKCcgKyBFTU9USUNPTl9SRUdFWC5zb3VyY2UgKyAnKVxcXFxzJCcpO1xuXG5jb25zdCBJU19NQUMgPSBuYXZpZ2F0b3IucGxhdGZvcm0uaW5kZXhPZihcIk1hY1wiKSAhPT0gLTE7XG5cbmZ1bmN0aW9uIGN0cmxTaG9ydGN1dExhYmVsKGtleSkge1xuICAgIHJldHVybiAoSVNfTUFDID8gXCLijJhcIiA6IFwiQ3RybFwiKSArIFwiK1wiICsga2V5O1xufVxuXG5mdW5jdGlvbiBjbG9uZVNlbGVjdGlvbihzZWxlY3Rpb246IFNlbGVjdGlvbik6IFBhcnRpYWw8U2VsZWN0aW9uPiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgYW5jaG9yTm9kZTogc2VsZWN0aW9uLmFuY2hvck5vZGUsXG4gICAgICAgIGFuY2hvck9mZnNldDogc2VsZWN0aW9uLmFuY2hvck9mZnNldCxcbiAgICAgICAgZm9jdXNOb2RlOiBzZWxlY3Rpb24uZm9jdXNOb2RlLFxuICAgICAgICBmb2N1c09mZnNldDogc2VsZWN0aW9uLmZvY3VzT2Zmc2V0LFxuICAgICAgICBpc0NvbGxhcHNlZDogc2VsZWN0aW9uLmlzQ29sbGFwc2VkLFxuICAgICAgICByYW5nZUNvdW50OiBzZWxlY3Rpb24ucmFuZ2VDb3VudCxcbiAgICAgICAgdHlwZTogc2VsZWN0aW9uLnR5cGUsXG4gICAgfTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uRXF1YWxzKGE6IFBhcnRpYWw8U2VsZWN0aW9uPiwgYjogU2VsZWN0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGEuYW5jaG9yTm9kZSA9PT0gYi5hbmNob3JOb2RlICYmXG4gICAgICAgIGEuYW5jaG9yT2Zmc2V0ID09PSBiLmFuY2hvck9mZnNldCAmJlxuICAgICAgICBhLmZvY3VzTm9kZSA9PT0gYi5mb2N1c05vZGUgJiZcbiAgICAgICAgYS5mb2N1c09mZnNldCA9PT0gYi5mb2N1c09mZnNldCAmJlxuICAgICAgICBhLmlzQ29sbGFwc2VkID09PSBiLmlzQ29sbGFwc2VkICYmXG4gICAgICAgIGEucmFuZ2VDb3VudCA9PT0gYi5yYW5nZUNvdW50ICYmXG4gICAgICAgIGEudHlwZSA9PT0gYi50eXBlO1xufVxuXG5lbnVtIEZvcm1hdHRpbmcge1xuICAgIEJvbGQgPSBcImJvbGRcIixcbiAgICBJdGFsaWNzID0gXCJpdGFsaWNzXCIsXG4gICAgU3RyaWtldGhyb3VnaCA9IFwic3RyaWtldGhyb3VnaFwiLFxuICAgIENvZGUgPSBcImNvZGVcIixcbiAgICBRdW90ZSA9IFwicXVvdGVcIixcbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgbW9kZWw6IEVkaXRvck1vZGVsO1xuICAgIHJvb206IFJvb207XG4gICAgcGxhY2Vob2xkZXI/OiBzdHJpbmc7XG4gICAgbGFiZWw/OiBzdHJpbmc7XG4gICAgaW5pdGlhbENhcmV0PzogRG9jdW1lbnRPZmZzZXQ7XG4gICAgZGlzYWJsZWQ/OiBib29sZWFuO1xuXG4gICAgb25DaGFuZ2U/KCk7XG4gICAgb25QYXN0ZT8oZXZlbnQ6IENsaXBib2FyZEV2ZW50PEhUTUxEaXZFbGVtZW50PiwgbW9kZWw6IEVkaXRvck1vZGVsKTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIElTdGF0ZSB7XG4gICAgc2hvd1BpbGxBdmF0YXI6IGJvb2xlYW47XG4gICAgcXVlcnk/OiBzdHJpbmc7XG4gICAgc2hvd1Zpc3VhbEJlbGw/OiBib29sZWFuO1xuICAgIGF1dG9Db21wbGV0ZT86IEF1dG9jb21wbGV0ZVdyYXBwZXJNb2RlbDtcbiAgICBjb21wbGV0aW9uSW5kZXg/OiBudW1iZXI7XG59XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLnJvb21zLkJhc2ljTWVzc2FnZUVkaXRvclwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzaWNNZXNzYWdlRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSBlZGl0b3JSZWYgPSBjcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG4gICAgcHJpdmF0ZSBhdXRvY29tcGxldGVSZWYgPSBjcmVhdGVSZWY8QXV0b2NvbXBsZXRlPigpO1xuICAgIHByaXZhdGUgZm9ybWF0QmFyUmVmID0gY3JlYXRlUmVmPHR5cGVvZiBNZXNzYWdlQ29tcG9zZXJGb3JtYXRCYXI+KCk7XG5cbiAgICBwcml2YXRlIG1vZGlmaWVkRmxhZyA9IGZhbHNlO1xuICAgIHByaXZhdGUgaXNJTUVDb21wb3NpbmcgPSBmYWxzZTtcbiAgICBwcml2YXRlIGhhc1RleHRTZWxlY3RlZCA9IGZhbHNlO1xuXG4gICAgcHJpdmF0ZSBfaXNDYXJldEF0RW5kOiBib29sZWFuO1xuICAgIHByaXZhdGUgbGFzdENhcmV0OiBEb2N1bWVudE9mZnNldDtcbiAgICBwcml2YXRlIGxhc3RTZWxlY3Rpb246IFJldHVyblR5cGU8dHlwZW9mIGNsb25lU2VsZWN0aW9uPjtcblxuICAgIHByaXZhdGUgcmVhZG9ubHkgZW1vdGljb25TZXR0aW5nSGFuZGxlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBzaG91bGRTaG93UGlsbEF2YXRhclNldHRpbmdIYW5kbGU6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IGhpc3RvcnlNYW5hZ2VyID0gbmV3IEhpc3RvcnlNYW5hZ2VyKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBzaG93UGlsbEF2YXRhcjogU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIiksXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5lbW90aWNvblNldHRpbmdIYW5kbGUgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZygnTWVzc2FnZUNvbXBvc2VySW5wdXQuYXV0b1JlcGxhY2VFbW9qaScsIG51bGwsXG4gICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUVtb3RpY29uQXV0b1JlcGxhY2UpO1xuICAgICAgICB0aGlzLmNvbmZpZ3VyZUVtb3RpY29uQXV0b1JlcGxhY2UoKTtcbiAgICAgICAgdGhpcy5zaG91bGRTaG93UGlsbEF2YXRhclNldHRpbmdIYW5kbGUgPSBTZXR0aW5nc1N0b3JlLndhdGNoU2V0dGluZyhcIlBpbGwuc2hvdWxkU2hvd1BpbGxBdmF0YXJcIiwgbnVsbCxcbiAgICAgICAgICAgIHRoaXMuY29uZmlndXJlU2hvdWxkU2hvd1BpbGxBdmF0YXIpO1xuICAgIH1cblxuICAgIHB1YmxpYyBjb21wb25lbnREaWRVcGRhdGUocHJldlByb3BzOiBJUHJvcHMpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byByZS1jaGVjayB0aGUgcGxhY2Vob2xkZXIgd2hlbiB0aGUgZW5hYmxlZCBzdGF0ZSBjaGFuZ2VzIGJlY2F1c2UgaXQgY2F1c2VzIHRoZVxuICAgICAgICAvLyBwbGFjZWhvbGRlciBlbGVtZW50IHRvIHJlbW91bnQsIHdoaWNoIGdldHMgcmlkIG9mIHRoZSBgOjpiZWZvcmVgIGNsYXNzLiBSZS1ldmFsdWF0aW5nIHRoZVxuICAgICAgICAvLyBwbGFjZWhvbGRlciBtZWFucyB3ZSBnZXQgYSBwcm9wZXIgYDo6YmVmb3JlYCB3aXRoIHRoZSBwbGFjZWhvbGRlci5cbiAgICAgICAgY29uc3QgZW5hYmxlZENoYW5nZSA9IHRoaXMucHJvcHMuZGlzYWJsZWQgIT09IHByZXZQcm9wcy5kaXNhYmxlZDtcbiAgICAgICAgY29uc3QgcGxhY2Vob2xkZXJDaGFuZ2VkID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlciAhPT0gcHJldlByb3BzLnBsYWNlaG9sZGVyO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wbGFjZWhvbGRlciAmJiAocGxhY2Vob2xkZXJDaGFuZ2VkIHx8IGVuYWJsZWRDaGFuZ2UpKSB7XG4gICAgICAgICAgICBjb25zdCB7aXNFbXB0eX0gPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVQbGFjZWhvbGRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZXBsYWNlRW1vdGljb24gPSAoY2FyZXRQb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbikgPT4ge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBtb2RlbC5zdGFydFJhbmdlKGNhcmV0UG9zaXRpb24pO1xuICAgICAgICAvLyBleHBhbmQgcmFuZ2UgbWF4IDggY2hhcmFjdGVycyBiYWNrd2FyZHMgZnJvbSBjYXJldFBvc2l0aW9uLFxuICAgICAgICAvLyBhcyBhIHNwYWNlIHRvIGxvb2sgZm9yIGFuIGVtb3RpY29uXG4gICAgICAgIGxldCBuID0gODtcbiAgICAgICAgcmFuZ2UuZXhwYW5kQmFja3dhcmRzV2hpbGUoKGluZGV4LCBvZmZzZXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnQgPSBtb2RlbC5wYXJ0c1tpbmRleF07XG4gICAgICAgICAgICBuIC09IDE7XG4gICAgICAgICAgICByZXR1cm4gbiA+PSAwICYmIChwYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fCBwYXJ0LnR5cGUgPT09IFwicGlsbC1jYW5kaWRhdGVcIik7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBlbW90aWNvbk1hdGNoID0gUkVHRVhfRU1PVElDT05fV0hJVEVTUEFDRS5leGVjKHJhbmdlLnRleHQpO1xuICAgICAgICBpZiAoZW1vdGljb25NYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgcXVlcnkgPSBlbW90aWNvbk1hdGNoWzFdLnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuICAgICAgICAgICAgLy8gdHJ5IGJvdGggZXhhY3QgbWF0Y2ggYW5kIGxvd2VyLWNhc2UsIHRoaXMgbWVhbnMgdGhhdCB4ZCB3b24ndCBtYXRjaCB4RCBidXQgOlAgd2lsbCBtYXRjaCA6cFxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IEVNT1RJQ09OX1RPX0VNT0pJLmdldChxdWVyeSkgfHwgRU1PVElDT05fVE9fRU1PSkkuZ2V0KHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHtwYXJ0Q3JlYXRvcn0gPSBtb2RlbDtcbiAgICAgICAgICAgICAgICBjb25zdCBoYXNQcmVjZWRpbmdTcGFjZSA9IGVtb3RpY29uTWF0Y2hbMF1bMF0gPT09IFwiIFwiO1xuICAgICAgICAgICAgICAgIC8vIHdlIG5lZWQgdGhlIHJhbmdlIHRvIG9ubHkgY29tcHJpc2Ugb2YgdGhlIGVtb3RpY29uXG4gICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSdsbCByZXBsYWNlIHRoZSB3aG9sZSByYW5nZSB3aXRoIGFuIGVtb2ppLFxuICAgICAgICAgICAgICAgIC8vIHNvIG1vdmUgdGhlIHN0YXJ0IGZvcndhcmQgdG8gdGhlIHN0YXJ0IG9mIHRoZSBlbW90aWNvbi5cbiAgICAgICAgICAgICAgICAvLyBUYWtlICsgMSBiZWNhdXNlIGluZGV4IGlzIHJlcG9ydGVkIHdpdGhvdXQgdGhlIHBvc3NpYmxlIHByZWNlZGluZyBzcGFjZS5cbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoZW1vdGljb25NYXRjaC5pbmRleCArIChoYXNQcmVjZWRpbmdTcGFjZSA/IDEgOiAwKSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyByZXR1cm5zIHRoZSBhbW91bnQgb2YgYWRkZWQvcmVtb3ZlZCBjaGFyYWN0ZXJzIGR1cmluZyB0aGUgcmVwbGFjZVxuICAgICAgICAgICAgICAgIC8vIHNvIHRoZSBjYXJldCBwb3NpdGlvbiBjYW4gYmUgYWRqdXN0ZWQuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhbmdlLnJlcGxhY2UoW3BhcnRDcmVhdG9yLnBsYWluKGRhdGEudW5pY29kZSArIFwiIFwiKV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgdXBkYXRlRWRpdG9yU3RhdGUgPSAoc2VsZWN0aW9uOiBDYXJldCwgaW5wdXRUeXBlPzogc3RyaW5nLCBkaWZmPzogSURpZmYpID0+IHtcbiAgICAgICAgcmVuZGVyTW9kZWwodGhpcy5lZGl0b3JSZWYuY3VycmVudCwgdGhpcy5wcm9wcy5tb2RlbCk7XG4gICAgICAgIGlmIChzZWxlY3Rpb24pIHsgLy8gc2V0IHRoZSBjYXJldC9zZWxlY3Rpb25cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHRoaXMucHJvcHMubW9kZWwsIHNlbGVjdGlvbik7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBjYXJldCBzZWxlY3Rpb24gaXMgYSByYW5nZSwgdGFrZSB0aGUgZW5kIHBvc2l0aW9uXG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHNlbGVjdGlvbiBpbnN0YW5jZW9mIFJhbmdlID8gc2VsZWN0aW9uLmVuZCA6IHNlbGVjdGlvbjtcbiAgICAgICAgICAgIHRoaXMuc2V0TGFzdENhcmV0RnJvbVBvc2l0aW9uKHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7aXNFbXB0eX0gPSB0aGlzLnByb3BzLm1vZGVsO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5wbGFjZWhvbGRlcikge1xuICAgICAgICAgICAgaWYgKGlzRW1wdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dQbGFjZWhvbGRlcigpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVQbGFjZWhvbGRlcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpc0VtcHR5KSB7XG4gICAgICAgICAgICB0aGlzLmZvcm1hdEJhclJlZi5jdXJyZW50LmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFN0YXRlKHthdXRvQ29tcGxldGU6IHRoaXMucHJvcHMubW9kZWwuYXV0b0NvbXBsZXRlfSk7XG4gICAgICAgIHRoaXMuaGlzdG9yeU1hbmFnZXIudHJ5UHVzaCh0aGlzLnByb3BzLm1vZGVsLCBzZWxlY3Rpb24sIGlucHV0VHlwZSwgZGlmZik7XG5cbiAgICAgICAgbGV0IGlzVHlwaW5nID0gIXRoaXMucHJvcHMubW9kZWwuaXNFbXB0eTtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgaXMgZW50ZXJpbmcgYSBjb21tYW5kLCBvbmx5IGNvbnNpZGVyIHRoZW0gdHlwaW5nIGlmIGl0IGlzIG9uZSB3aGljaCBzZW5kcyBhIG1lc3NhZ2UgaW50byB0aGUgcm9vbVxuICAgICAgICBpZiAoaXNUeXBpbmcgJiYgdGhpcy5wcm9wcy5tb2RlbC5wYXJ0c1swXS50eXBlID09PSBcImNvbW1hbmRcIikge1xuICAgICAgICAgICAgY29uc3Qge2NtZH0gPSBwYXJzZUNvbW1hbmRTdHJpbmcodGhpcy5wcm9wcy5tb2RlbC5wYXJ0c1swXS50ZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBDb21tYW5kTWFwLmdldChjbWQpO1xuICAgICAgICAgICAgaWYgKCFjb21tYW5kIHx8ICFjb21tYW5kLmlzRW5hYmxlZCgpIHx8IGNvbW1hbmQuY2F0ZWdvcnkgIT09IENvbW1hbmRDYXRlZ29yaWVzLm1lc3NhZ2VzKSB7XG4gICAgICAgICAgICAgICAgaXNUeXBpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBUeXBpbmdTdG9yZS5zaGFyZWRJbnN0YW5jZSgpLnNldFNlbGZUeXBpbmcodGhpcy5wcm9wcy5yb29tLnJvb21JZCwgaXNUeXBpbmcpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBzaG93UGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIC8vIGVzY2FwZSBzaW5nbGUgcXVvdGVzXG4gICAgICAgIGNvbnN0IHBsYWNlaG9sZGVyID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlci5yZXBsYWNlKC8nL2csICdcXFxcXFwnJyk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuc3R5bGUuc2V0UHJvcGVydHkoXCItLXBsYWNlaG9sZGVyXCIsIGAnJHtwbGFjZWhvbGRlcn0nYCk7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuY2xhc3NMaXN0LmFkZChcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX2lucHV0RW1wdHlcIik7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoaWRlUGxhY2Vob2xkZXIoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuY2xhc3NMaXN0LnJlbW92ZShcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX2lucHV0RW1wdHlcIik7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuc3R5bGUucmVtb3ZlUHJvcGVydHkoXCItLXBsYWNlaG9sZGVyXCIpO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25Db21wb3NpdGlvblN0YXJ0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmlzSU1FQ29tcG9zaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gZXZlbiBpZiB0aGUgbW9kZWwgaXMgZW1wdHksIHRoZSBjb21wb3NpdGlvbiB0ZXh0IHNob3VsZG4ndCBiZSBtaXhlZCB3aXRoIHRoZSBwbGFjZWhvbGRlclxuICAgICAgICB0aGlzLmhpZGVQbGFjZWhvbGRlcigpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ29tcG9zaXRpb25FbmQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaXNJTUVDb21wb3NpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gc29tZSBicm93c2VycyAoQ2hyb21lKSBkb24ndCBmaXJlIGFuIGlucHV0IGV2ZW50IGFmdGVyIGVuZGluZyBhIGNvbXBvc2l0aW9uLFxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGEgbW9kZWwgdXBkYXRlIGFmdGVyIHRoZSBjb21wb3NpdGlvbiBpcyBkb25lIGJ5IGNhbGxpbmcgdGhlIGlucHV0IGhhbmRsZXIuXG5cbiAgICAgICAgLy8gaG93ZXZlciwgbW9kaWZ5aW5nIHRoZSBET00gKGNhdXNlZCBieSB0aGUgZWRpdG9yIG1vZGVsIHVwZGF0ZSkgZnJvbSB0aGUgY29tcG9zaXRpb25lbmQgaGFuZGxlciBzZWVtc1xuICAgICAgICAvLyB0byBjb25mdXNlIHRoZSBJTUUgaW4gQ2hyb21lLCBsaWtlbHkgY2F1c2luZyBodHRwczovL2dpdGh1Yi5jb20vdmVjdG9yLWltL2VsZW1lbnQtd2ViL2lzc3Vlcy8xMDkxMyAsXG4gICAgICAgIC8vIHNvIHdlIGRvIGl0IGFzeW5jXG5cbiAgICAgICAgLy8gaG93ZXZlciwgZG9pbmcgdGhpcyBhc3luYyBzZWVtcyB0byBicmVhayB0aGluZ3MgaW4gU2FmYXJpIGZvciBzb21lIHJlYXNvbiwgc28gYnJvd3NlciBzbmlmZi5cblxuICAgICAgICBjb25zdCB1YSA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgY29uc3QgaXNTYWZhcmkgPSB1YS5pbmNsdWRlcygnc2FmYXJpLycpICYmICF1YS5pbmNsdWRlcygnY2hyb21lLycpO1xuXG4gICAgICAgIGlmIChpc1NhZmFyaSkge1xuICAgICAgICAgICAgdGhpcy5vbklucHV0KHtpbnB1dFR5cGU6IFwiaW5zZXJ0Q29tcG9zaXRpb25UZXh0XCJ9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMub25JbnB1dCh7aW5wdXRUeXBlOiBcImluc2VydENvbXBvc2l0aW9uVGV4dFwifSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpc0NvbXBvc2luZyhldmVudDogUmVhY3QuS2V5Ym9hcmRFdmVudCkge1xuICAgICAgICAvLyBjaGVja2luZyB0aGUgZXZlbnQuaXNDb21wb3NpbmcgZmxhZyBqdXN0IGluIGNhc2UgYW55IGJyb3dzZXIgb3V0IHRoZXJlXG4gICAgICAgIC8vIGVtaXRzIGV2ZW50cyByZWxhdGVkIHRvIHRoZSBjb21wb3NpdGlvbiBhZnRlciBjb21wb3NpdGlvbmVuZFxuICAgICAgICAvLyBoYXMgYmVlbiBmaXJlZFxuICAgICAgICByZXR1cm4gISEodGhpcy5pc0lNRUNvbXBvc2luZyB8fCAoZXZlbnQubmF0aXZlRXZlbnQgJiYgZXZlbnQubmF0aXZlRXZlbnQuaXNDb21wb3NpbmcpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ3V0Q29weSA9IChldmVudDogQ2xpcGJvYXJkRXZlbnQsIHR5cGU6IHN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgY29uc3QgdGV4dCA9IHNlbGVjdGlvbi50b1N0cmluZygpO1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgY29uc3Qge21vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IGdldFJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIG1vZGVsLCBzZWxlY3Rpb24pO1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRQYXJ0cyA9IHJhbmdlLnBhcnRzLm1hcChwID0+IHAuc2VyaWFsaXplKCkpO1xuICAgICAgICAgICAgZXZlbnQuY2xpcGJvYXJkRGF0YS5zZXREYXRhKFwiYXBwbGljYXRpb24veC1lbGVtZW50LWNvbXBvc2VyXCIsIEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkUGFydHMpKTtcbiAgICAgICAgICAgIGV2ZW50LmNsaXBib2FyZERhdGEuc2V0RGF0YShcInRleHQvcGxhaW5cIiwgdGV4dCk7IC8vIHNvIHBsYWluIGNvcHkvcGFzdGUgd29ya3NcbiAgICAgICAgICAgIGlmICh0eXBlID09PSBcImN1dFwiKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRoZSB0ZXh0LCB1cGRhdGluZyB0aGUgbW9kZWwgYXMgYXBwcm9wcmlhdGVcbiAgICAgICAgICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmVwbGFjZVJhbmdlQW5kTW92ZUNhcmV0KHJhbmdlLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Db3B5ID0gKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgICB0aGlzLm9uQ3V0Q29weShldmVudCwgXCJjb3B5XCIpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ3V0ID0gKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkgPT4ge1xuICAgICAgICB0aGlzLm9uQ3V0Q29weShldmVudCwgXCJjdXRcIik7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25QYXN0ZSA9IChldmVudDogQ2xpcGJvYXJkRXZlbnQ8SFRNTERpdkVsZW1lbnQ+KSA9PiB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7IC8vIHdlIGFsd2F5cyBoYW5kbGUgdGhlIHBhc3RlIG91cnNlbHZlc1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5vblBhc3RlICYmIHRoaXMucHJvcHMub25QYXN0ZShldmVudCwgdGhpcy5wcm9wcy5tb2RlbCkpIHtcbiAgICAgICAgICAgIC8vIHRvIHByZXZlbnQgZG91YmxlIGhhbmRsaW5nLCBhbGxvdyBwcm9wcy5vblBhc3RlIHRvIHNraXAgaW50ZXJuYWwgb25QYXN0ZVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICBjb25zdCBwYXJ0c1RleHQgPSBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJhcHBsaWNhdGlvbi94LWVsZW1lbnQtY29tcG9zZXJcIik7XG4gICAgICAgIGxldCBwYXJ0cztcbiAgICAgICAgaWYgKHBhcnRzVGV4dCkge1xuICAgICAgICAgICAgY29uc3Qgc2VyaWFsaXplZFRleHRQYXJ0cyA9IEpTT04ucGFyc2UocGFydHNUZXh0KTtcbiAgICAgICAgICAgIGNvbnN0IGRlc2VyaWFsaXplZFBhcnRzID0gc2VyaWFsaXplZFRleHRQYXJ0cy5tYXAocCA9PiBwYXJ0Q3JlYXRvci5kZXNlcmlhbGl6ZVBhcnQocCkpO1xuICAgICAgICAgICAgcGFydHMgPSBkZXNlcmlhbGl6ZWRQYXJ0cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBldmVudC5jbGlwYm9hcmREYXRhLmdldERhdGEoXCJ0ZXh0L3BsYWluXCIpO1xuICAgICAgICAgICAgcGFydHMgPSBwYXJzZVBsYWluVGV4dE1lc3NhZ2UodGV4dCwgcGFydENyZWF0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgY29uc3QgcmFuZ2UgPSBnZXRSYW5nZUZvclNlbGVjdGlvbih0aGlzLmVkaXRvclJlZi5jdXJyZW50LCBtb2RlbCwgZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkpO1xuICAgICAgICByZXBsYWNlUmFuZ2VBbmRNb3ZlQ2FyZXQocmFuZ2UsIHBhcnRzKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbklucHV0ID0gKGV2ZW50OiBQYXJ0aWFsPElucHV0RXZlbnQ+KSA9PiB7XG4gICAgICAgIC8vIGlnbm9yZSBhbnkgaW5wdXQgd2hpbGUgZG9pbmcgSU1FIGNvbXBvc2l0aW9uc1xuICAgICAgICBpZiAodGhpcy5pc0lNRUNvbXBvc2luZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgY29uc3Qgc2VsID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGNvbnN0IHtjYXJldCwgdGV4dH0gPSBnZXRDYXJldE9mZnNldEFuZFRleHQodGhpcy5lZGl0b3JSZWYuY3VycmVudCwgc2VsKTtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC51cGRhdGUodGV4dCwgZXZlbnQuaW5wdXRUeXBlLCBjYXJldCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgaW5zZXJ0VGV4dCh0ZXh0VG9JbnNlcnQ6IHN0cmluZywgaW5wdXRUeXBlID0gXCJpbnNlcnRUZXh0XCIpIHtcbiAgICAgICAgY29uc3Qgc2VsID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGNvbnN0IHtjYXJldCwgdGV4dH0gPSBnZXRDYXJldE9mZnNldEFuZFRleHQodGhpcy5lZGl0b3JSZWYuY3VycmVudCwgc2VsKTtcbiAgICAgICAgY29uc3QgbmV3VGV4dCA9IHRleHQuc3Vic3RyKDAsIGNhcmV0Lm9mZnNldCkgKyB0ZXh0VG9JbnNlcnQgKyB0ZXh0LnN1YnN0cihjYXJldC5vZmZzZXQpO1xuICAgICAgICBjYXJldC5vZmZzZXQgKz0gdGV4dFRvSW5zZXJ0Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5tb2RpZmllZEZsYWcgPSB0cnVlO1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnVwZGF0ZShuZXdUZXh0LCBpbnB1dFR5cGUsIGNhcmV0KTtcbiAgICB9XG5cbiAgICAvLyB0aGlzIGlzIHVzZWQgbGF0ZXIgdG8gc2VlIGlmIHdlIG5lZWQgdG8gcmVjYWxjdWxhdGUgdGhlIGNhcmV0XG4gICAgLy8gb24gc2VsZWN0aW9uY2hhbmdlLiBJZiBpdCBpcyBqdXN0IGEgY29uc2VxdWVuY2Ugb2YgdHlwaW5nXG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0by4gQnV0IGlmIHRoZSB1c2VyIGlzIG5hdmlnYXRpbmcgdGhlIGNhcmV0IHdpdGhvdXQgaW5wdXRcbiAgICAvLyB3ZSBuZWVkIHRvIHJlY2FsY3VsYXRlIGl0LCB0byBiZSBhYmxlIHRvIGtub3cgd2hlcmUgdG8gaW5zZXJ0IGNvbnRlbnQgYWZ0ZXJcbiAgICAvLyBsb3NpbmcgZm9jdXNcbiAgICBwcml2YXRlIHNldExhc3RDYXJldEZyb21Qb3NpdGlvbihwb3NpdGlvbjogRG9jdW1lbnRQb3NpdGlvbikge1xuICAgICAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5wcm9wcztcbiAgICAgICAgdGhpcy5faXNDYXJldEF0RW5kID0gcG9zaXRpb24uaXNBdEVuZChtb2RlbCk7XG4gICAgICAgIHRoaXMubGFzdENhcmV0ID0gcG9zaXRpb24uYXNPZmZzZXQobW9kZWwpO1xuICAgICAgICB0aGlzLmxhc3RTZWxlY3Rpb24gPSBjbG9uZVNlbGVjdGlvbihkb2N1bWVudC5nZXRTZWxlY3Rpb24oKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQoKSB7XG4gICAgICAgIC8vIFhYWDogbmVlZGVkIHdoZW4gZ29pbmcgdXAgYW5kIGRvd24gaW4gZWRpdGluZyBtZXNzYWdlcyAuLi4gbm90IHN1cmUgd2h5IHlldFxuICAgICAgICAvLyBiZWNhdXNlIHRoZSBlZGl0b3JzIHNob3VsZCBzdG9wIGRvaW5nIHRoaXMgd2hlbiB3aGVuIGJsdXJyZWQgLi4uXG4gICAgICAgIC8vIG1heWJlIGl0J3Mgb24gZm9jdXMgYW5kIHRoZSBfZWRpdG9yUmVmIGlzbid0IGF2YWlsYWJsZSB5ZXQgb3Igc29tZXRoaW5nLlxuICAgICAgICBpZiAoIXRoaXMuZWRpdG9yUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWxlY3Rpb24gPSBkb2N1bWVudC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgaWYgKCF0aGlzLmxhc3RTZWxlY3Rpb24gfHwgIXNlbGVjdGlvbkVxdWFscyh0aGlzLmxhc3RTZWxlY3Rpb24sIHNlbGVjdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGlvbiA9IGNsb25lU2VsZWN0aW9uKHNlbGVjdGlvbik7XG4gICAgICAgICAgICBjb25zdCB7Y2FyZXQsIHRleHR9ID0gZ2V0Q2FyZXRPZmZzZXRBbmRUZXh0KHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHNlbGVjdGlvbik7XG4gICAgICAgICAgICB0aGlzLmxhc3RDYXJldCA9IGNhcmV0O1xuICAgICAgICAgICAgdGhpcy5faXNDYXJldEF0RW5kID0gY2FyZXQub2Zmc2V0ID09PSB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FyZXQ7XG4gICAgfVxuXG4gICAgY2xlYXJVbmRvSGlzdG9yeSgpIHtcbiAgICAgICAgdGhpcy5oaXN0b3J5TWFuYWdlci5jbGVhcigpO1xuICAgIH1cblxuICAgIGdldENhcmV0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0Q2FyZXQ7XG4gICAgfVxuXG4gICAgaXNTZWxlY3Rpb25Db2xsYXBzZWQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5sYXN0U2VsZWN0aW9uIHx8IHRoaXMubGFzdFNlbGVjdGlvbi5pc0NvbGxhcHNlZDtcbiAgICB9XG5cbiAgICBpc0NhcmV0QXRTdGFydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q2FyZXQoKS5vZmZzZXQgPT09IDA7XG4gICAgfVxuXG4gICAgaXNDYXJldEF0RW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faXNDYXJldEF0RW5kO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25CbHVyID0gKCkgPT4ge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2VsZWN0aW9uY2hhbmdlXCIsIHRoaXMub25TZWxlY3Rpb25DaGFuZ2UpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uRm9jdXMgPSAoKSA9PiB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJzZWxlY3Rpb25jaGFuZ2VcIiwgdGhpcy5vblNlbGVjdGlvbkNoYW5nZSk7XG4gICAgICAgIC8vIGZvcmNlIHRvIHJlY2FsY3VsYXRlXG4gICAgICAgIHRoaXMubGFzdFNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgIHRoaXMucmVmcmVzaExhc3RDYXJldElmTmVlZGVkKCk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25TZWxlY3Rpb25DaGFuZ2UgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtpc0VtcHR5fSA9IHRoaXMucHJvcHMubW9kZWw7XG5cbiAgICAgICAgdGhpcy5yZWZyZXNoTGFzdENhcmV0SWZOZWVkZWQoKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgIGlmICh0aGlzLmhhc1RleHRTZWxlY3RlZCAmJiBzZWxlY3Rpb24uaXNDb2xsYXBzZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaGFzVGV4dFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcy5mb3JtYXRCYXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuaGlkZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCFzZWxlY3Rpb24uaXNDb2xsYXBzZWQgJiYgIWlzRW1wdHkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFzVGV4dFNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZvcm1hdEJhclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0aW9uUmVjdCA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KDApLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuc2hvd0F0KHNlbGVjdGlvblJlY3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25LZXlEb3duID0gKGV2ZW50OiBSZWFjdC5LZXlib2FyZEV2ZW50KSA9PiB7XG4gICAgICAgIGNvbnN0IG1vZGVsID0gdGhpcy5wcm9wcy5tb2RlbDtcbiAgICAgICAgbGV0IGhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgYWN0aW9uID0gZ2V0S2V5QmluZGluZ3NNYW5hZ2VyKCkuZ2V0TWVzc2FnZUNvbXBvc2VyQWN0aW9uKGV2ZW50KTtcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNvbXBvc2VyQWN0aW9uLkZvcm1hdEJvbGQ6XG4gICAgICAgICAgICAgICAgdGhpcy5vbkZvcm1hdEFjdGlvbihGb3JtYXR0aW5nLkJvbGQpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uRm9ybWF0SXRhbGljczpcbiAgICAgICAgICAgICAgICB0aGlzLm9uRm9ybWF0QWN0aW9uKEZvcm1hdHRpbmcuSXRhbGljcyk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDb21wb3NlckFjdGlvbi5Gb3JtYXRRdW90ZTpcbiAgICAgICAgICAgICAgICB0aGlzLm9uRm9ybWF0QWN0aW9uKEZvcm1hdHRpbmcuUXVvdGUpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uRWRpdFJlZG86XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeU1hbmFnZXIuY2FuUmVkbygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHtwYXJ0cywgY2FyZXR9ID0gdGhpcy5oaXN0b3J5TWFuYWdlci5yZWRvKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHBhc3MgbWF0Y2hpbmcgaW5wdXRUeXBlIHNvIGhpc3RvcnlNYW5hZ2VyIGRvZXNuJ3QgcHVzaCBlY2hvXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gaW52b2tlZCBmcm9tIHJlcmVuZGVyIGNhbGxiYWNrLlxuICAgICAgICAgICAgICAgICAgICBtb2RlbC5yZXNldChwYXJ0cywgY2FyZXQsIFwiaGlzdG9yeVJlZG9cIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uRWRpdFVuZG86XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGlzdG9yeU1hbmFnZXIuY2FuVW5kbygpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHtwYXJ0cywgY2FyZXR9ID0gdGhpcy5oaXN0b3J5TWFuYWdlci51bmRvKHRoaXMucHJvcHMubW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICAvLyBwYXNzIG1hdGNoaW5nIGlucHV0VHlwZSBzbyBoaXN0b3J5TWFuYWdlciBkb2Vzbid0IHB1c2ggZWNob1xuICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIGludm9rZWQgZnJvbSByZXJlbmRlciBjYWxsYmFjay5cbiAgICAgICAgICAgICAgICAgICAgbW9kZWwucmVzZXQocGFydHMsIGNhcmV0LCBcImhpc3RvcnlVbmRvXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgTWVzc2FnZUNvbXBvc2VyQWN0aW9uLk5ld0xpbmU6XG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRUZXh0KFwiXFxuXCIpO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBNZXNzYWdlQ29tcG9zZXJBY3Rpb24uTW92ZUN1cnNvclRvU3RhcnQ6XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIG1vZGVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIE1lc3NhZ2VDb21wb3NlckFjdGlvbi5Nb3ZlQ3Vyc29yVG9FbmQ6XG4gICAgICAgICAgICAgICAgc2V0U2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIG1vZGVsLCB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBtb2RlbC5wYXJ0cy5sZW5ndGggLSAxLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IG1vZGVsLnBhcnRzW21vZGVsLnBhcnRzLmxlbmd0aCAtIDFdLnRleHQubGVuZ3RoLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBhdXRvY29tcGxldGVBY3Rpb24gPSBnZXRLZXlCaW5kaW5nc01hbmFnZXIoKS5nZXRBdXRvY29tcGxldGVBY3Rpb24oZXZlbnQpO1xuICAgICAgICBpZiAobW9kZWwuYXV0b0NvbXBsZXRlICYmIG1vZGVsLmF1dG9Db21wbGV0ZS5oYXNDb21wbGV0aW9ucygpKSB7XG4gICAgICAgICAgICBjb25zdCBhdXRvQ29tcGxldGUgPSBtb2RlbC5hdXRvQ29tcGxldGU7XG4gICAgICAgICAgICBzd2l0Y2ggKGF1dG9jb21wbGV0ZUFjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgQXV0b2NvbXBsZXRlQWN0aW9uLkNvbXBsZXRlT3JQcmV2U2VsZWN0aW9uOlxuICAgICAgICAgICAgICAgIGNhc2UgQXV0b2NvbXBsZXRlQWN0aW9uLlByZXZTZWxlY3Rpb246XG4gICAgICAgICAgICAgICAgICAgIGF1dG9Db21wbGV0ZS5zZWxlY3RQcmV2aW91c1NlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBBdXRvY29tcGxldGVBY3Rpb24uQ29tcGxldGVPck5leHRTZWxlY3Rpb246XG4gICAgICAgICAgICAgICAgY2FzZSBBdXRvY29tcGxldGVBY3Rpb24uTmV4dFNlbGVjdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlLnNlbGVjdE5leHRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgQXV0b2NvbXBsZXRlQWN0aW9uLkNhbmNlbDpcbiAgICAgICAgICAgICAgICAgICAgYXV0b0NvbXBsZXRlLm9uRXNjYXBlKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjsgLy8gZG9uJ3QgcHJldmVudERlZmF1bHQgb24gYW55dGhpbmcgZWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGF1dG9jb21wbGV0ZUFjdGlvbiA9PT0gQXV0b2NvbXBsZXRlQWN0aW9uLkNvbXBsZXRlT3JQcmV2U2VsZWN0aW9uXG4gICAgICAgICAgICB8fCBhdXRvY29tcGxldGVBY3Rpb24gPT09IEF1dG9jb21wbGV0ZUFjdGlvbi5Db21wbGV0ZU9yTmV4dFNlbGVjdGlvbikge1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgbm8gY3VycmVudCBhdXRvY29tcGxldGUgd2luZG93LCB0cnkgdG8gb3BlbiBpdFxuICAgICAgICAgICAgdGhpcy50YWJDb21wbGV0ZU5hbWUoKTtcbiAgICAgICAgICAgIGhhbmRsZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gS2V5LkJBQ0tTUEFDRSB8fCBldmVudC5rZXkgPT09IEtleS5ERUxFVEUpIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybWF0QmFyUmVmLmN1cnJlbnQuaGlkZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhhbmRsZWQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIGFzeW5jIHRhYkNvbXBsZXRlTmFtZSgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KHJlc29sdmUgPT4gdGhpcy5zZXRTdGF0ZSh7c2hvd1Zpc3VhbEJlbGw6IGZhbHNlfSwgcmVzb2x2ZSkpO1xuICAgICAgICAgICAgY29uc3Qge21vZGVsfSA9IHRoaXMucHJvcHM7XG4gICAgICAgICAgICBjb25zdCBjYXJldCA9IHRoaXMuZ2V0Q2FyZXQoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0LCBjYXJldC5hdE5vZGVFbmQpO1xuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBtb2RlbC5zdGFydFJhbmdlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIHJhbmdlLmV4cGFuZEJhY2t3YXJkc1doaWxlKChpbmRleCwgb2Zmc2V0LCBwYXJ0KSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnQudGV4dFtvZmZzZXRdICE9PSBcIiBcIiAmJiBwYXJ0LnRleHRbb2Zmc2V0XSAhPT0gXCIrXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwicGxhaW5cIiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwicGlsbC1jYW5kaWRhdGVcIiB8fFxuICAgICAgICAgICAgICAgICAgICBwYXJ0LnR5cGUgPT09IFwiY29tbWFuZFwiXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3Qge3BhcnRDcmVhdG9yfSA9IG1vZGVsO1xuICAgICAgICAgICAgLy8gYXdhaXQgZm9yIGF1dG8tY29tcGxldGUgdG8gYmUgb3BlblxuICAgICAgICAgICAgYXdhaXQgbW9kZWwudHJhbnNmb3JtKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhZGRlZExlbiA9IHJhbmdlLnJlcGxhY2UoW3BhcnRDcmVhdG9yLnBpbGxDYW5kaWRhdGUocmFuZ2UudGV4dCldKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbW9kZWwucG9zaXRpb25Gb3JPZmZzZXQoY2FyZXQub2Zmc2V0ICsgYWRkZWRMZW4sIHRydWUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIERvbid0IHRyeSB0byBkbyB0aGluZ3Mgd2l0aCB0aGUgYXV0b2NvbXBsZXRlIGlmIHRoZXJlIGlzIG5vbmUgc2hvd25cbiAgICAgICAgICAgIGlmIChtb2RlbC5hdXRvQ29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBtb2RlbC5hdXRvQ29tcGxldGUuc3RhcnRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGVsLmF1dG9Db21wbGV0ZS5oYXNTZWxlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtzaG93VmlzdWFsQmVsbDogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICBtb2RlbC5hdXRvQ29tcGxldGUuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNNb2RpZmllZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW9kaWZpZWRGbGFnO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25BdXRvQ29tcGxldGVDb25maXJtID0gKGNvbXBsZXRpb246IElDb21wbGV0aW9uKSA9PiB7XG4gICAgICAgIHRoaXMubW9kaWZpZWRGbGFnID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wcm9wcy5tb2RlbC5hdXRvQ29tcGxldGUub25Db21wb25lbnRDb25maXJtKGNvbXBsZXRpb24pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQXV0b0NvbXBsZXRlU2VsZWN0aW9uQ2hhbmdlID0gKGNvbXBsZXRpb246IElDb21wbGV0aW9uLCBjb21wbGV0aW9uSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgIHRoaXMucHJvcHMubW9kZWwuYXV0b0NvbXBsZXRlLm9uQ29tcG9uZW50U2VsZWN0aW9uQ2hhbmdlKGNvbXBsZXRpb24pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtjb21wbGV0aW9uSW5kZXh9KTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBjb25maWd1cmVFbW90aWNvbkF1dG9SZXBsYWNlID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzaG91bGRSZXBsYWNlID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnTWVzc2FnZUNvbXBvc2VySW5wdXQuYXV0b1JlcGxhY2VFbW9qaScpO1xuICAgICAgICB0aGlzLnByb3BzLm1vZGVsLnNldFRyYW5zZm9ybUNhbGxiYWNrKHNob3VsZFJlcGxhY2UgPyB0aGlzLnJlcGxhY2VFbW90aWNvbiA6IG51bGwpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIGNvbmZpZ3VyZVNob3VsZFNob3dQaWxsQXZhdGFyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzaG93UGlsbEF2YXRhciA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJQaWxsLnNob3VsZFNob3dQaWxsQXZhdGFyXCIpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2hvd1BpbGxBdmF0YXIgfSk7XG4gICAgfTtcblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2VsZWN0aW9uY2hhbmdlXCIsIHRoaXMub25TZWxlY3Rpb25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLm9uSW5wdXQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbnN0YXJ0XCIsIHRoaXMub25Db21wb3NpdGlvblN0YXJ0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiY29tcG9zaXRpb25lbmRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uRW5kLCB0cnVlKTtcbiAgICAgICAgU2V0dGluZ3NTdG9yZS51bndhdGNoU2V0dGluZyh0aGlzLmVtb3RpY29uU2V0dGluZ0hhbmRsZSk7XG4gICAgICAgIFNldHRpbmdzU3RvcmUudW53YXRjaFNldHRpbmcodGhpcy5zaG91bGRTaG93UGlsbEF2YXRhclNldHRpbmdIYW5kbGUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICBjb25zdCBtb2RlbCA9IHRoaXMucHJvcHMubW9kZWw7XG4gICAgICAgIG1vZGVsLnNldFVwZGF0ZUNhbGxiYWNrKHRoaXMudXBkYXRlRWRpdG9yU3RhdGUpO1xuICAgICAgICBjb25zdCBwYXJ0Q3JlYXRvciA9IG1vZGVsLnBhcnRDcmVhdG9yO1xuICAgICAgICAvLyBUT0RPOiBkb2VzIHRoaXMgYWxsb3cgdXMgdG8gZ2V0IHJpZCBvZiBFZGl0b3JTdGF0ZVRyYW5zZmVyP1xuICAgICAgICAvLyBub3QgcmVhbGx5LCBidXQgd2UgY291bGQgbm90IHNlcmlhbGl6ZSB0aGUgcGFydHMsIGFuZCBqdXN0IGNoYW5nZSB0aGUgYXV0b0NvbXBsZXRlclxuICAgICAgICBwYXJ0Q3JlYXRvci5zZXRBdXRvQ29tcGxldGVDcmVhdG9yKGdldEF1dG9Db21wbGV0ZUNyZWF0b3IoXG4gICAgICAgICAgICAoKSA9PiB0aGlzLmF1dG9jb21wbGV0ZVJlZi5jdXJyZW50LFxuICAgICAgICAgICAgcXVlcnkgPT4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB0aGlzLnNldFN0YXRlKHtxdWVyeX0sIHJlc29sdmUpKSxcbiAgICAgICAgKSk7XG4gICAgICAgIC8vIGluaXRpYWwgcmVuZGVyIG9mIG1vZGVsXG4gICAgICAgIHRoaXMudXBkYXRlRWRpdG9yU3RhdGUodGhpcy5nZXRJbml0aWFsQ2FyZXRQb3NpdGlvbigpKTtcbiAgICAgICAgLy8gYXR0YWNoIGlucHV0IGxpc3RlbmVyIGJ5IGhhbmQgc28gUmVhY3QgZG9lc24ndCBwcm94eSB0aGUgZXZlbnRzLFxuICAgICAgICAvLyBhcyB0aGUgcHJveGllZCBldmVudCBkb2Vzbid0IHN1cHBvcnQgaW5wdXRUeXBlLCB3aGljaCB3ZSBuZWVkLlxuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCB0aGlzLm9uSW5wdXQsIHRydWUpO1xuICAgICAgICB0aGlzLmVkaXRvclJlZi5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb21wb3NpdGlvbnN0YXJ0XCIsIHRoaXMub25Db21wb3NpdGlvblN0YXJ0LCB0cnVlKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFwiY29tcG9zaXRpb25lbmRcIiwgdGhpcy5vbkNvbXBvc2l0aW9uRW5kLCB0cnVlKTtcbiAgICAgICAgdGhpcy5lZGl0b3JSZWYuY3VycmVudC5mb2N1cygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0SW5pdGlhbENhcmV0UG9zaXRpb24oKSB7XG4gICAgICAgIGxldCBjYXJldFBvc2l0aW9uO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5pbml0aWFsQ2FyZXQpIHtcbiAgICAgICAgICAgIC8vIGlmIHJlc3RvcmluZyBzdGF0ZSBmcm9tIGEgcHJldmlvdXMgZWRpdG9yLFxuICAgICAgICAgICAgLy8gcmVzdG9yZSBjYXJldCBwb3NpdGlvbiBmcm9tIHRoZSBzdGF0ZVxuICAgICAgICAgICAgY29uc3QgY2FyZXQgPSB0aGlzLnByb3BzLmluaXRpYWxDYXJldDtcbiAgICAgICAgICAgIGNhcmV0UG9zaXRpb24gPSB0aGlzLnByb3BzLm1vZGVsLnBvc2l0aW9uRm9yT2Zmc2V0KGNhcmV0Lm9mZnNldCwgY2FyZXQuYXROb2RlRW5kKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgc2V0IGl0IGF0IHRoZSBlbmRcbiAgICAgICAgICAgIGNhcmV0UG9zaXRpb24gPSB0aGlzLnByb3BzLm1vZGVsLmdldFBvc2l0aW9uQXRFbmQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY2FyZXRQb3NpdGlvbjtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRm9ybWF0QWN0aW9uID0gKGFjdGlvbjogRm9ybWF0dGluZykgPT4ge1xuICAgICAgICBjb25zdCByYW5nZSA9IGdldFJhbmdlRm9yU2VsZWN0aW9uKHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQsIHRoaXMucHJvcHMubW9kZWwsIGRvY3VtZW50LmdldFNlbGVjdGlvbigpKTtcbiAgICAgICAgLy8gdHJpbSB0aGUgcmFuZ2UgYXMgd2Ugd2FudCBpdCB0byBleGNsdWRlIGxlYWRpbmcvdHJhaWxpbmcgc3BhY2VzXG4gICAgICAgIHJhbmdlLnRyaW0oKTtcblxuICAgICAgICBpZiAocmFuZ2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmhpc3RvcnlNYW5hZ2VyLmVuc3VyZUxhc3RDaGFuZ2VzUHVzaGVkKHRoaXMucHJvcHMubW9kZWwpO1xuICAgICAgICB0aGlzLm1vZGlmaWVkRmxhZyA9IHRydWU7XG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIEZvcm1hdHRpbmcuQm9sZDpcbiAgICAgICAgICAgICAgICB0b2dnbGVJbmxpbmVGb3JtYXQocmFuZ2UsIFwiKipcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEZvcm1hdHRpbmcuSXRhbGljczpcbiAgICAgICAgICAgICAgICB0b2dnbGVJbmxpbmVGb3JtYXQocmFuZ2UsIFwiX1wiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRm9ybWF0dGluZy5TdHJpa2V0aHJvdWdoOlxuICAgICAgICAgICAgICAgIHRvZ2dsZUlubGluZUZvcm1hdChyYW5nZSwgXCI8ZGVsPlwiLCBcIjwvZGVsPlwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRm9ybWF0dGluZy5Db2RlOlxuICAgICAgICAgICAgICAgIGZvcm1hdFJhbmdlQXNDb2RlKHJhbmdlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRm9ybWF0dGluZy5RdW90ZTpcbiAgICAgICAgICAgICAgICBmb3JtYXRSYW5nZUFzUXVvdGUocmFuZ2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGF1dG9Db21wbGV0ZTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuYXV0b0NvbXBsZXRlKSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeSA9IHRoaXMuc3RhdGUucXVlcnk7XG4gICAgICAgICAgICBjb25zdCBxdWVyeUxlbiA9IHF1ZXJ5Lmxlbmd0aDtcbiAgICAgICAgICAgIGF1dG9Db21wbGV0ZSA9ICg8ZGl2IGNsYXNzTmFtZT1cIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyX0F1dG9Db21wbGV0ZVdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICA8QXV0b2NvbXBsZXRlXG4gICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5hdXRvY29tcGxldGVSZWZ9XG4gICAgICAgICAgICAgICAgICAgIHF1ZXJ5PXtxdWVyeX1cbiAgICAgICAgICAgICAgICAgICAgb25Db25maXJtPXt0aGlzLm9uQXV0b0NvbXBsZXRlQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgICAgb25TZWxlY3Rpb25DaGFuZ2U9e3RoaXMub25BdXRvQ29tcGxldGVTZWxlY3Rpb25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbj17e2JlZ2lubmluZzogdHJ1ZSwgZW5kOiBxdWVyeUxlbiwgc3RhcnQ6IHF1ZXJ5TGVufX1cbiAgICAgICAgICAgICAgICAgICAgcm9vbT17dGhpcy5wcm9wcy5yb29tfVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L2Rpdj4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdyYXBwZXJDbGFzc2VzID0gY2xhc3NOYW1lcyhcIm14X0Jhc2ljTWVzc2FnZUNvbXBvc2VyXCIsIHtcbiAgICAgICAgICAgIFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRfZXJyb3JcIjogdGhpcy5zdGF0ZS5zaG93VmlzdWFsQmVsbCxcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjbGFzc05hbWVzKFwibXhfQmFzaWNNZXNzYWdlQ29tcG9zZXJfaW5wdXRcIiwge1xuICAgICAgICAgICAgXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dF9zaG91bGRTaG93UGlsbEF2YXRhclwiOiB0aGlzLnN0YXRlLnNob3dQaWxsQXZhdGFyLFxuICAgICAgICAgICAgXCJteF9CYXNpY01lc3NhZ2VDb21wb3Nlcl9pbnB1dF9kaXNhYmxlZFwiOiB0aGlzLnByb3BzLmRpc2FibGVkLFxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzaG9ydGN1dHMgPSB7XG4gICAgICAgICAgICBib2xkOiBjdHJsU2hvcnRjdXRMYWJlbChcIkJcIiksXG4gICAgICAgICAgICBpdGFsaWNzOiBjdHJsU2hvcnRjdXRMYWJlbChcIklcIiksXG4gICAgICAgICAgICBxdW90ZTogY3RybFNob3J0Y3V0TGFiZWwoXCI+XCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHtjb21wbGV0aW9uSW5kZXh9ID0gdGhpcy5zdGF0ZTtcblxuICAgICAgICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPXt3cmFwcGVyQ2xhc3Nlc30+XG4gICAgICAgICAgICB7IGF1dG9Db21wbGV0ZSB9XG4gICAgICAgICAgICA8TWVzc2FnZUNvbXBvc2VyRm9ybWF0QmFyIHJlZj17dGhpcy5mb3JtYXRCYXJSZWZ9IG9uQWN0aW9uPXt0aGlzLm9uRm9ybWF0QWN0aW9ufSBzaG9ydGN1dHM9e3Nob3J0Y3V0c30gLz5cbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzZXN9XG4gICAgICAgICAgICAgICAgY29udGVudEVkaXRhYmxlPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgdGFiSW5kZXg9ezB9XG4gICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLm9uQmx1cn1cbiAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLm9uRm9jdXN9XG4gICAgICAgICAgICAgICAgb25Db3B5PXt0aGlzLm9uQ29weX1cbiAgICAgICAgICAgICAgICBvbkN1dD17dGhpcy5vbkN1dH1cbiAgICAgICAgICAgICAgICBvblBhc3RlPXt0aGlzLm9uUGFzdGV9XG4gICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLm9uS2V5RG93bn1cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuZWRpdG9yUmVmfVxuICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3RoaXMucHJvcHMubGFiZWx9XG4gICAgICAgICAgICAgICAgcm9sZT1cInRleHRib3hcIlxuICAgICAgICAgICAgICAgIGFyaWEtbXVsdGlsaW5lPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgYXJpYS1hdXRvY29tcGxldGU9XCJib3RoXCJcbiAgICAgICAgICAgICAgICBhcmlhLWhhc3BvcHVwPVwibGlzdGJveFwiXG4gICAgICAgICAgICAgICAgYXJpYS1leHBhbmRlZD17Qm9vbGVhbih0aGlzLnN0YXRlLmF1dG9Db21wbGV0ZSl9XG4gICAgICAgICAgICAgICAgYXJpYS1hY3RpdmVkZXNjZW5kYW50PXtjb21wbGV0aW9uSW5kZXggPj0gMCA/IGdlbmVyYXRlQ29tcGxldGlvbkRvbUlkKGNvbXBsZXRpb25JbmRleCkgOiB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgZGlyPVwiYXV0b1wiXG4gICAgICAgICAgICAgICAgYXJpYS1kaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxuXG4gICAgZm9jdXMoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yUmVmLmN1cnJlbnQuZm9jdXMoKTtcbiAgICB9XG59XG4iXX0=