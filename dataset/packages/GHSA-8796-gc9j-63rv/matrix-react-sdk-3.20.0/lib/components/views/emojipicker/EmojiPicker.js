"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.EMOJIS_PER_ROW = exports.EMOJI_HEIGHT = exports.CATEGORY_HEADER_HEIGHT = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _languageHandler = require("../../../languageHandler");

var recent = _interopRequireWildcard(require("../../../emojipicker/recent"));

var _emoji = require("../../../emoji");

var _AutoHideScrollbar = _interopRequireDefault(require("../../structures/AutoHideScrollbar"));

var _Header = _interopRequireDefault(require("./Header"));

var _Search = _interopRequireDefault(require("./Search"));

var _Preview = _interopRequireDefault(require("./Preview"));

var _QuickReactions = _interopRequireDefault(require("./QuickReactions"));

var _Category = _interopRequireDefault(require("./Category"));

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const CATEGORY_HEADER_HEIGHT = 22;
exports.CATEGORY_HEADER_HEIGHT = CATEGORY_HEADER_HEIGHT;
const EMOJI_HEIGHT = 37;
exports.EMOJI_HEIGHT = EMOJI_HEIGHT;
const EMOJIS_PER_ROW = 8;
exports.EMOJIS_PER_ROW = EMOJIS_PER_ROW;
let EmojiPicker = (_dec = (0, _replaceableComponent.replaceableComponent)("views.emojipicker.EmojiPicker"), _dec(_class = (_temp = class EmojiPicker extends _react.default.Component
/*:: <IProps, IState>*/
{
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "recentlyUsed", void 0);
    (0, _defineProperty2.default)(this, "memoizedDataByCategory", void 0);
    (0, _defineProperty2.default)(this, "categories", void 0);
    (0, _defineProperty2.default)(this, "bodyRef", /*#__PURE__*/_react.default.createRef());
    (0, _defineProperty2.default)(this, "onScroll", () => {
      const body = this.bodyRef.current;
      this.setState({
        scrollTop: body.scrollTop,
        viewportHeight: body.clientHeight
      });
      this.updateVisibility();
    });
    (0, _defineProperty2.default)(this, "updateVisibility", () => {
      const body = this.bodyRef.current;
      const rect = body.getBoundingClientRect();

      for (const cat of this.categories) {
        const elem = body.querySelector(`[data-category-id="${cat.id}"]`);

        if (!elem) {
          cat.visible = false;
          cat.ref.current.classList.remove("mx_EmojiPicker_anchor_visible");
          continue;
        }

        const elemRect = elem.getBoundingClientRect();
        const y = elemRect.y - rect.y;
        const yEnd = elemRect.y + elemRect.height - rect.y;
        cat.visible = y < rect.height && yEnd > 0; // We update this here instead of through React to avoid re-render on scroll.

        if (cat.visible) {
          cat.ref.current.classList.add("mx_EmojiPicker_anchor_visible");
          cat.ref.current.setAttribute("aria-selected", "true");
          cat.ref.current.setAttribute("tabindex", "0");
        } else {
          cat.ref.current.classList.remove("mx_EmojiPicker_anchor_visible");
          cat.ref.current.setAttribute("aria-selected", "false");
          cat.ref.current.setAttribute("tabindex", "-1");
        }
      }
    });
    (0, _defineProperty2.default)(this, "scrollToCategory", (category
    /*: string*/
    ) => {
      this.bodyRef.current.querySelector(`[data-category-id="${category}"]`).scrollIntoView();
    });
    (0, _defineProperty2.default)(this, "onChangeFilter", (filter
    /*: string*/
    ) => {
      filter = filter.toLowerCase(); // filter is case insensitive stored lower-case

      for (const cat of this.categories) {
        let emojis; // If the new filter string includes the old filter string, we don't have to re-filter the whole dataset.

        if (filter.includes(this.state.filter)) {
          emojis = this.memoizedDataByCategory[cat.id];
        } else {
          emojis = cat.id === "recent" ? this.recentlyUsed : _emoji.DATA_BY_CATEGORY[cat.id];
        }

        emojis = emojis.filter(emoji => emoji.filterString.includes(filter));
        this.memoizedDataByCategory[cat.id] = emojis;
        cat.enabled = emojis.length > 0; // The setState below doesn't re-render the header and we already have the refs for updateVisibility, so...

        cat.ref.current.disabled = !cat.enabled;
      }

      this.setState({
        filter
      }); // Header underlines need to be updated, but updating requires knowing
      // where the categories are, so we wait for a tick.

      setTimeout(this.updateVisibility, 0);
    });
    (0, _defineProperty2.default)(this, "onEnterFilter", () => {
      const btn = this.bodyRef.current.querySelector(".mx_EmojiPicker_item");

      if (btn) {
        btn.click();
      }
    });
    (0, _defineProperty2.default)(this, "onHoverEmoji", (emoji
    /*: IEmoji*/
    ) => {
      this.setState({
        previewEmoji: emoji
      });
    });
    (0, _defineProperty2.default)(this, "onHoverEmojiEnd", (emoji
    /*: IEmoji*/
    ) => {
      this.setState({
        previewEmoji: null
      });
    });
    (0, _defineProperty2.default)(this, "onClickEmoji", (emoji
    /*: IEmoji*/
    ) => {
      if (this.props.onChoose(emoji.unicode) !== false) {
        recent.add(emoji.unicode);
      }
    });
    this.state = {
      filter: "",
      previewEmoji: null,
      scrollTop: 0,
      viewportHeight: 280
    }; // Convert recent emoji characters to emoji data, removing unknowns and duplicates

    this.recentlyUsed = Array.from(new Set(recent.get().map(_emoji.getEmojiFromUnicode).filter(Boolean)));
    this.memoizedDataByCategory = _objectSpread({
      recent: this.recentlyUsed
    }, _emoji.DATA_BY_CATEGORY);
    this.categories = [{
      id: "recent",
      name: (0, _languageHandler._t)("Frequently Used"),
      enabled: this.recentlyUsed.length > 0,
      visible: this.recentlyUsed.length > 0,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "people",
      name: (0, _languageHandler._t)("Smileys & People"),
      enabled: true,
      visible: true,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "nature",
      name: (0, _languageHandler._t)("Animals & Nature"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "foods",
      name: (0, _languageHandler._t)("Food & Drink"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "activity",
      name: (0, _languageHandler._t)("Activities"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "places",
      name: (0, _languageHandler._t)("Travel & Places"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "objects",
      name: (0, _languageHandler._t)("Objects"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "symbols",
      name: (0, _languageHandler._t)("Symbols"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }, {
      id: "flags",
      name: (0, _languageHandler._t)("Flags"),
      enabled: true,
      visible: false,
      ref: /*#__PURE__*/_react.default.createRef()
    }];
  }

  static categoryHeightForEmojiCount(count
  /*: number*/
  ) {
    if (count === 0) {
      return 0;
    }

    return CATEGORY_HEADER_HEIGHT + Math.ceil(count / EMOJIS_PER_ROW) * EMOJI_HEIGHT;
  }

  render() {
    let heightBefore = 0;
    return /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_EmojiPicker"
    }, /*#__PURE__*/_react.default.createElement(_Header.default, {
      categories: this.categories,
      onAnchorClick: this.scrollToCategory
    }), /*#__PURE__*/_react.default.createElement(_Search.default, {
      query: this.state.filter,
      onChange: this.onChangeFilter,
      onEnter: this.onEnterFilter
    }), /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      className: "mx_EmojiPicker_body",
      wrappedRef: ref => {
        // @ts-ignore - AutoHideScrollbar should accept a RefObject or fall back to its own instead
        this.bodyRef.current = ref;
      },
      onScroll: this.onScroll
    }, this.categories.map(category => {
      const emojis = this.memoizedDataByCategory[category.id];

      const categoryElement = /*#__PURE__*/_react.default.createElement(_Category.default, {
        key: category.id,
        id: category.id,
        name: category.name,
        heightBefore: heightBefore,
        viewportHeight: this.state.viewportHeight,
        scrollTop: this.state.scrollTop,
        emojis: emojis,
        onClick: this.onClickEmoji,
        onMouseEnter: this.onHoverEmoji,
        onMouseLeave: this.onHoverEmojiEnd,
        selectedEmojis: this.props.selectedEmojis
      });

      const height = EmojiPicker.categoryHeightForEmojiCount(emojis.length);
      heightBefore += height;
      return categoryElement;
    })), this.state.previewEmoji || !this.props.showQuickReactions ? /*#__PURE__*/_react.default.createElement(_Preview.default, {
      emoji: this.state.previewEmoji
    }) : /*#__PURE__*/_react.default.createElement(_QuickReactions.default, {
      onClick: this.onClickEmoji,
      selectedEmojis: this.props.selectedEmojis
    }));
  }

}, _temp)) || _class);
var _default = EmojiPicker;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2Vtb2ppcGlja2VyL0Vtb2ppUGlja2VyLnRzeCJdLCJuYW1lcyI6WyJDQVRFR09SWV9IRUFERVJfSEVJR0hUIiwiRU1PSklfSEVJR0hUIiwiRU1PSklTX1BFUl9ST1ciLCJFbW9qaVBpY2tlciIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImNyZWF0ZVJlZiIsImJvZHkiLCJib2R5UmVmIiwiY3VycmVudCIsInNldFN0YXRlIiwic2Nyb2xsVG9wIiwidmlld3BvcnRIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJ1cGRhdGVWaXNpYmlsaXR5IiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsImNhdCIsImNhdGVnb3JpZXMiLCJlbGVtIiwicXVlcnlTZWxlY3RvciIsImlkIiwidmlzaWJsZSIsInJlZiIsImNsYXNzTGlzdCIsInJlbW92ZSIsImVsZW1SZWN0IiwieSIsInlFbmQiLCJoZWlnaHQiLCJhZGQiLCJzZXRBdHRyaWJ1dGUiLCJjYXRlZ29yeSIsInNjcm9sbEludG9WaWV3IiwiZmlsdGVyIiwidG9Mb3dlckNhc2UiLCJlbW9qaXMiLCJpbmNsdWRlcyIsInN0YXRlIiwibWVtb2l6ZWREYXRhQnlDYXRlZ29yeSIsInJlY2VudGx5VXNlZCIsIkRBVEFfQllfQ0FURUdPUlkiLCJlbW9qaSIsImZpbHRlclN0cmluZyIsImVuYWJsZWQiLCJsZW5ndGgiLCJkaXNhYmxlZCIsInNldFRpbWVvdXQiLCJidG4iLCJjbGljayIsInByZXZpZXdFbW9qaSIsIm9uQ2hvb3NlIiwidW5pY29kZSIsInJlY2VudCIsIkFycmF5IiwiZnJvbSIsIlNldCIsImdldCIsIm1hcCIsImdldEVtb2ppRnJvbVVuaWNvZGUiLCJCb29sZWFuIiwibmFtZSIsImNhdGVnb3J5SGVpZ2h0Rm9yRW1vamlDb3VudCIsImNvdW50IiwiTWF0aCIsImNlaWwiLCJyZW5kZXIiLCJoZWlnaHRCZWZvcmUiLCJzY3JvbGxUb0NhdGVnb3J5Iiwib25DaGFuZ2VGaWx0ZXIiLCJvbkVudGVyRmlsdGVyIiwib25TY3JvbGwiLCJjYXRlZ29yeUVsZW1lbnQiLCJvbkNsaWNrRW1vamkiLCJvbkhvdmVyRW1vamkiLCJvbkhvdmVyRW1vamlFbmQiLCJzZWxlY3RlZEVtb2ppcyIsInNob3dRdWlja1JlYWN0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWlCQTs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7QUFFTyxNQUFNQSxzQkFBc0IsR0FBRyxFQUEvQjs7QUFDQSxNQUFNQyxZQUFZLEdBQUcsRUFBckI7O0FBQ0EsTUFBTUMsY0FBYyxHQUFHLENBQXZCOztJQW1CREMsVyxXQURMLGdEQUFxQiwrQkFBckIsQyx5QkFBRCxNQUNNQSxXQUROLFNBQzBCQyxlQUFNQztBQURoQztBQUMwRDtBQU90REMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGU7QUFBQTtBQUFBO0FBQUEsZ0VBRkRILGVBQU1JLFNBQU4sRUFFQztBQUFBLG9EQTBFQSxNQUFNO0FBQ3JCLFlBQU1DLElBQUksR0FBRyxLQUFLQyxPQUFMLENBQWFDLE9BQTFCO0FBQ0EsV0FBS0MsUUFBTCxDQUFjO0FBQ1ZDLFFBQUFBLFNBQVMsRUFBRUosSUFBSSxDQUFDSSxTQUROO0FBRVZDLFFBQUFBLGNBQWMsRUFBRUwsSUFBSSxDQUFDTTtBQUZYLE9BQWQ7QUFJQSxXQUFLQyxnQkFBTDtBQUNILEtBakZrQjtBQUFBLDREQW1GUSxNQUFNO0FBQzdCLFlBQU1QLElBQUksR0FBRyxLQUFLQyxPQUFMLENBQWFDLE9BQTFCO0FBQ0EsWUFBTU0sSUFBSSxHQUFHUixJQUFJLENBQUNTLHFCQUFMLEVBQWI7O0FBQ0EsV0FBSyxNQUFNQyxHQUFYLElBQWtCLEtBQUtDLFVBQXZCLEVBQW1DO0FBQy9CLGNBQU1DLElBQUksR0FBR1osSUFBSSxDQUFDYSxh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QUMsaUJBQUQ7QUFDSSxRQUFBLEdBQUcsRUFBRXhDLFFBQVEsQ0FBQ1gsRUFEbEI7QUFFSSxRQUFBLEVBQUUsRUFBRVcsUUFBUSxDQUFDWCxFQUZqQjtBQUdJLFFBQUEsSUFBSSxFQUFFVyxRQUFRLENBQUM2QixJQUhuQjtBQUlJLFFBQUEsWUFBWSxFQUFFTSxZQUpsQjtBQUtJLFFBQUEsY0FBYyxFQUFFLEtBQUs3QixLQUFMLENBQVcxQixjQUwvQjtBQU1JLFFBQUEsU0FBUyxFQUFFLEtBQUswQixLQUFMLENBQVczQixTQU4xQjtBQU9JLFFBQUEsTUFBTSxFQUFFeUIsTUFQWjtBQVFJLFFBQUEsT0FBTyxFQUFFLEtBQUtxQyxZQVJsQjtBQVNJLFFBQUEsWUFBWSxFQUFFLEtBQUtDLFlBVHZCO0FBVUksUUFBQSxZQUFZLEVBQUUsS0FBS0MsZUFWdkI7QUFXSSxRQUFBLGNBQWMsRUFBRSxLQUFLdEUsS0FBTCxDQUFXdUU7QUFYL0IsUUFESjs7QUFlQSxZQUFNL0MsTUFBTSxHQUFHNUIsV0FBVyxDQUFDNkQsMkJBQVosQ0FBd0MxQixNQUFNLENBQUNTLE1BQS9DLENBQWY7QUFDQXNCLE1BQUFBLFlBQVksSUFBSXRDLE1BQWhCO0FBQ0EsYUFBTzJDLGVBQVA7QUFDSCxLQXBCQSxDQVJMLENBSEosRUFpQ0ssS0FBS2xDLEtBQUwsQ0FBV1ksWUFBWCxJQUEyQixDQUFDLEtBQUs3QyxLQUFMLENBQVd3RSxrQkFBdkMsZ0JBQ0ssNkJBQUMsZ0JBQUQ7QUFBUyxNQUFBLEtBQUssRUFBRSxLQUFLdkMsS0FBTCxDQUFXWTtBQUEzQixNQURMLGdCQUVLLDZCQUFDLHVCQUFEO0FBQWdCLE1BQUEsT0FBTyxFQUFFLEtBQUt1QixZQUE5QjtBQUE0QyxNQUFBLGNBQWMsRUFBRSxLQUFLcEUsS0FBTCxDQUFXdUU7QUFBdkUsTUFuQ1YsQ0FESjtBQXVDSDs7QUF4TnFELEM7ZUEyTjNDM0UsVyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxOSBUdWxpciBBc29rYW4gPHR1bGlyQG1hdW5pdW0ubmV0PlxuQ29weXJpZ2h0IDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5pbXBvcnQgeyBfdCB9IGZyb20gJy4uLy4uLy4uL2xhbmd1YWdlSGFuZGxlcic7XG5pbXBvcnQgKiBhcyByZWNlbnQgZnJvbSAnLi4vLi4vLi4vZW1vamlwaWNrZXIvcmVjZW50JztcbmltcG9ydCB7REFUQV9CWV9DQVRFR09SWSwgZ2V0RW1vamlGcm9tVW5pY29kZSwgSUVtb2ppfSBmcm9tIFwiLi4vLi4vLi4vZW1vamlcIjtcbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9BdXRvSGlkZVNjcm9sbGJhclwiO1xuaW1wb3J0IEhlYWRlciBmcm9tIFwiLi9IZWFkZXJcIjtcbmltcG9ydCBTZWFyY2ggZnJvbSBcIi4vU2VhcmNoXCI7XG5pbXBvcnQgUHJldmlldyBmcm9tIFwiLi9QcmV2aWV3XCI7XG5pbXBvcnQgUXVpY2tSZWFjdGlvbnMgZnJvbSBcIi4vUXVpY2tSZWFjdGlvbnNcIjtcbmltcG9ydCBDYXRlZ29yeSwge0lDYXRlZ29yeSwgQ2F0ZWdvcnlLZXl9IGZyb20gXCIuL0NhdGVnb3J5XCI7XG5pbXBvcnQge3JlcGxhY2VhYmxlQ29tcG9uZW50fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcmVwbGFjZWFibGVDb21wb25lbnRcIjtcblxuZXhwb3J0IGNvbnN0IENBVEVHT1JZX0hFQURFUl9IRUlHSFQgPSAyMjtcbmV4cG9ydCBjb25zdCBFTU9KSV9IRUlHSFQgPSAzNztcbmV4cG9ydCBjb25zdCBFTU9KSVNfUEVSX1JPVyA9IDg7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHNlbGVjdGVkRW1vamlzOiBTZXQ8c3RyaW5nPjtcbiAgICBzaG93UXVpY2tSZWFjdGlvbnM/OiBib29sZWFuO1xuICAgIG9uQ2hvb3NlKHVuaWNvZGU6IHN0cmluZyk6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBJU3RhdGUge1xuICAgIGZpbHRlcjogc3RyaW5nO1xuICAgIHByZXZpZXdFbW9qaT86IElFbW9qaTtcbiAgICBzY3JvbGxUb3A6IG51bWJlcjtcbiAgICAvLyBpbml0aWFsIGVzdGltYXRpb24gb2YgaGVpZ2h0LCBkaWFsb2cgaXMgaGFyZGNvZGVkIHRvIDQ1MHB4IGhlaWdodC5cbiAgICAvLyBzaG91bGQgYmUgZW5vdWdoIHRvIG5ldmVyIGhhdmUgYmxhbmsgcm93cyBvZiBlbW9qaXMgYXNcbiAgICAvLyAzIHJvd3Mgb2Ygb3ZlcmZsb3cgYXJlIGFsc28gcmVuZGVyZWQuIFRoZSBhY3R1YWwgdmFsdWUgaXMgdXBkYXRlZCBvbiBzY3JvbGwuXG4gICAgdmlld3BvcnRIZWlnaHQ6IG51bWJlcjtcbn1cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwidmlld3MuZW1vamlwaWNrZXIuRW1vamlQaWNrZXJcIilcbmNsYXNzIEVtb2ppUGlja2VyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PElQcm9wcywgSVN0YXRlPiB7XG4gICAgcHJpdmF0ZSByZWFkb25seSByZWNlbnRseVVzZWQ6IElFbW9qaVtdO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbWVtb2l6ZWREYXRhQnlDYXRlZ29yeTogUmVjb3JkPENhdGVnb3J5S2V5LCBJRW1vamlbXT47XG4gICAgcHJpdmF0ZSByZWFkb25seSBjYXRlZ29yaWVzOiBJQ2F0ZWdvcnlbXTtcblxuICAgIHByaXZhdGUgYm9keVJlZiA9IFJlYWN0LmNyZWF0ZVJlZjxIVE1MRGl2RWxlbWVudD4oKTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZmlsdGVyOiBcIlwiLFxuICAgICAgICAgICAgcHJldmlld0Vtb2ppOiBudWxsLFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiAwLFxuICAgICAgICAgICAgdmlld3BvcnRIZWlnaHQ6IDI4MCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBDb252ZXJ0IHJlY2VudCBlbW9qaSBjaGFyYWN0ZXJzIHRvIGVtb2ppIGRhdGEsIHJlbW92aW5nIHVua25vd25zIGFuZCBkdXBsaWNhdGVzXG4gICAgICAgIHRoaXMucmVjZW50bHlVc2VkID0gQXJyYXkuZnJvbShuZXcgU2V0KHJlY2VudC5nZXQoKS5tYXAoZ2V0RW1vamlGcm9tVW5pY29kZSkuZmlsdGVyKEJvb2xlYW4pKSk7XG4gICAgICAgIHRoaXMubWVtb2l6ZWREYXRhQnlDYXRlZ29yeSA9IHtcbiAgICAgICAgICAgIHJlY2VudDogdGhpcy5yZWNlbnRseVVzZWQsXG4gICAgICAgICAgICAuLi5EQVRBX0JZX0NBVEVHT1JZLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuY2F0ZWdvcmllcyA9IFt7XG4gICAgICAgICAgICBpZDogXCJyZWNlbnRcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiRnJlcXVlbnRseSBVc2VkXCIpLFxuICAgICAgICAgICAgZW5hYmxlZDogdGhpcy5yZWNlbnRseVVzZWQubGVuZ3RoID4gMCxcbiAgICAgICAgICAgIHZpc2libGU6IHRoaXMucmVjZW50bHlVc2VkLmxlbmd0aCA+IDAsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJwZW9wbGVcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiU21pbGV5cyAmIFBlb3BsZVwiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IFwibmF0dXJlXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIkFuaW1hbHMgJiBOYXR1cmVcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJmb29kc1wiLFxuICAgICAgICAgICAgbmFtZTogX3QoXCJGb29kICYgRHJpbmtcIiksXG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICByZWY6IFJlYWN0LmNyZWF0ZVJlZigpLFxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBpZDogXCJhY3Rpdml0eVwiLFxuICAgICAgICAgICAgbmFtZTogX3QoXCJBY3Rpdml0aWVzXCIpLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgaWQ6IFwicGxhY2VzXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIlRyYXZlbCAmIFBsYWNlc1wiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiBcIm9iamVjdHNcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiT2JqZWN0c1wiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiBcInN5bWJvbHNcIixcbiAgICAgICAgICAgIG5hbWU6IF90KFwiU3ltYm9sc1wiKSxcbiAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgIHJlZjogUmVhY3QuY3JlYXRlUmVmKCksXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGlkOiBcImZsYWdzXCIsXG4gICAgICAgICAgICBuYW1lOiBfdChcIkZsYWdzXCIpLFxuICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgcmVmOiBSZWFjdC5jcmVhdGVSZWYoKSxcbiAgICAgICAgfV07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNjcm9sbCA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IHRoaXMuYm9keVJlZi5jdXJyZW50O1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNjcm9sbFRvcDogYm9keS5zY3JvbGxUb3AsXG4gICAgICAgICAgICB2aWV3cG9ydEhlaWdodDogYm9keS5jbGllbnRIZWlnaHQsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHkoKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSB1cGRhdGVWaXNpYmlsaXR5ID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBib2R5ID0gdGhpcy5ib2R5UmVmLmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IHJlY3QgPSBib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBmb3IgKGNvbnN0IGNhdCBvZiB0aGlzLmNhdGVnb3JpZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGVsZW0gPSBib2R5LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhdGVnb3J5LWlkPVwiJHtjYXQuaWR9XCJdYCk7XG4gICAgICAgICAgICBpZiAoIWVsZW0pIHtcbiAgICAgICAgICAgICAgICBjYXQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNhdC5yZWYuY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKFwibXhfRW1vamlQaWNrZXJfYW5jaG9yX3Zpc2libGVcIik7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBlbGVtUmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICBjb25zdCB5ID0gZWxlbVJlY3QueSAtIHJlY3QueTtcbiAgICAgICAgICAgIGNvbnN0IHlFbmQgPSBlbGVtUmVjdC55ICsgZWxlbVJlY3QuaGVpZ2h0IC0gcmVjdC55O1xuICAgICAgICAgICAgY2F0LnZpc2libGUgPSB5IDwgcmVjdC5oZWlnaHQgJiYgeUVuZCA+IDA7XG4gICAgICAgICAgICAvLyBXZSB1cGRhdGUgdGhpcyBoZXJlIGluc3RlYWQgb2YgdGhyb3VnaCBSZWFjdCB0byBhdm9pZCByZS1yZW5kZXIgb24gc2Nyb2xsLlxuICAgICAgICAgICAgaWYgKGNhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LmNsYXNzTGlzdC5hZGQoXCJteF9FbW9qaVBpY2tlcl9hbmNob3JfdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICBjYXQucmVmLmN1cnJlbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBcInRydWVcIik7XG4gICAgICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LnNldEF0dHJpYnV0ZShcInRhYmluZGV4XCIsIFwiMFwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJteF9FbW9qaVBpY2tlcl9hbmNob3JfdmlzaWJsZVwiKTtcbiAgICAgICAgICAgICAgICBjYXQucmVmLmN1cnJlbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiLCBcImZhbHNlXCIpO1xuICAgICAgICAgICAgICAgIGNhdC5yZWYuY3VycmVudC5zZXRBdHRyaWJ1dGUoXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgc2Nyb2xsVG9DYXRlZ29yeSA9IChjYXRlZ29yeTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuYm9keVJlZi5jdXJyZW50LnF1ZXJ5U2VsZWN0b3IoYFtkYXRhLWNhdGVnb3J5LWlkPVwiJHtjYXRlZ29yeX1cIl1gKS5zY3JvbGxJbnRvVmlldygpO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2hhbmdlRmlsdGVyID0gKGZpbHRlcjogc3RyaW5nKSA9PiB7XG4gICAgICAgIGZpbHRlciA9IGZpbHRlci50b0xvd2VyQ2FzZSgpOyAvLyBmaWx0ZXIgaXMgY2FzZSBpbnNlbnNpdGl2ZSBzdG9yZWQgbG93ZXItY2FzZVxuICAgICAgICBmb3IgKGNvbnN0IGNhdCBvZiB0aGlzLmNhdGVnb3JpZXMpIHtcbiAgICAgICAgICAgIGxldCBlbW9qaXM7XG4gICAgICAgICAgICAvLyBJZiB0aGUgbmV3IGZpbHRlciBzdHJpbmcgaW5jbHVkZXMgdGhlIG9sZCBmaWx0ZXIgc3RyaW5nLCB3ZSBkb24ndCBoYXZlIHRvIHJlLWZpbHRlciB0aGUgd2hvbGUgZGF0YXNldC5cbiAgICAgICAgICAgIGlmIChmaWx0ZXIuaW5jbHVkZXModGhpcy5zdGF0ZS5maWx0ZXIpKSB7XG4gICAgICAgICAgICAgICAgZW1vamlzID0gdGhpcy5tZW1vaXplZERhdGFCeUNhdGVnb3J5W2NhdC5pZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVtb2ppcyA9IGNhdC5pZCA9PT0gXCJyZWNlbnRcIiA/IHRoaXMucmVjZW50bHlVc2VkIDogREFUQV9CWV9DQVRFR09SWVtjYXQuaWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW1vamlzID0gZW1vamlzLmZpbHRlcihlbW9qaSA9PiBlbW9qaS5maWx0ZXJTdHJpbmcuaW5jbHVkZXMoZmlsdGVyKSk7XG4gICAgICAgICAgICB0aGlzLm1lbW9pemVkRGF0YUJ5Q2F0ZWdvcnlbY2F0LmlkXSA9IGVtb2ppcztcbiAgICAgICAgICAgIGNhdC5lbmFibGVkID0gZW1vamlzLmxlbmd0aCA+IDA7XG4gICAgICAgICAgICAvLyBUaGUgc2V0U3RhdGUgYmVsb3cgZG9lc24ndCByZS1yZW5kZXIgdGhlIGhlYWRlciBhbmQgd2UgYWxyZWFkeSBoYXZlIHRoZSByZWZzIGZvciB1cGRhdGVWaXNpYmlsaXR5LCBzby4uLlxuICAgICAgICAgICAgY2F0LnJlZi5jdXJyZW50LmRpc2FibGVkID0gIWNhdC5lbmFibGVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWx0ZXIgfSk7XG4gICAgICAgIC8vIEhlYWRlciB1bmRlcmxpbmVzIG5lZWQgdG8gYmUgdXBkYXRlZCwgYnV0IHVwZGF0aW5nIHJlcXVpcmVzIGtub3dpbmdcbiAgICAgICAgLy8gd2hlcmUgdGhlIGNhdGVnb3JpZXMgYXJlLCBzbyB3ZSB3YWl0IGZvciBhIHRpY2suXG4gICAgICAgIHNldFRpbWVvdXQodGhpcy51cGRhdGVWaXNpYmlsaXR5LCAwKTtcbiAgICB9O1xuXG4gICAgcHJpdmF0ZSBvbkVudGVyRmlsdGVyID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBidG4gPSB0aGlzLmJvZHlSZWYuY3VycmVudC5xdWVyeVNlbGVjdG9yPEhUTUxCdXR0b25FbGVtZW50PihcIi5teF9FbW9qaVBpY2tlcl9pdGVtXCIpO1xuICAgICAgICBpZiAoYnRuKSB7XG4gICAgICAgICAgICBidG4uY2xpY2soKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIG9uSG92ZXJFbW9qaSA9IChlbW9qaTogSUVtb2ppKSA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlld0Vtb2ppOiBlbW9qaSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHByaXZhdGUgb25Ib3ZlckVtb2ppRW5kID0gKGVtb2ppOiBJRW1vamkpID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aWV3RW1vamk6IG51bGwsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBwcml2YXRlIG9uQ2xpY2tFbW9qaSA9IChlbW9qaTogSUVtb2ppKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hvb3NlKGVtb2ppLnVuaWNvZGUpICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmVjZW50LmFkZChlbW9qaS51bmljb2RlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBwcml2YXRlIHN0YXRpYyBjYXRlZ29yeUhlaWdodEZvckVtb2ppQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBDQVRFR09SWV9IRUFERVJfSEVJR0hUICsgKE1hdGguY2VpbChjb3VudCAvIEVNT0pJU19QRVJfUk9XKSAqIEVNT0pJX0hFSUdIVCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgaGVpZ2h0QmVmb3JlID0gMDtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfRW1vamlQaWNrZXJcIj5cbiAgICAgICAgICAgICAgICA8SGVhZGVyIGNhdGVnb3JpZXM9e3RoaXMuY2F0ZWdvcmllc30gb25BbmNob3JDbGljaz17dGhpcy5zY3JvbGxUb0NhdGVnb3J5fSAvPlxuICAgICAgICAgICAgICAgIDxTZWFyY2ggcXVlcnk9e3RoaXMuc3RhdGUuZmlsdGVyfSBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZUZpbHRlcn0gb25FbnRlcj17dGhpcy5vbkVudGVyRmlsdGVyfSAvPlxuICAgICAgICAgICAgICAgIDxBdXRvSGlkZVNjcm9sbGJhclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FbW9qaVBpY2tlcl9ib2R5XCJcbiAgICAgICAgICAgICAgICAgICAgd3JhcHBlZFJlZj17cmVmID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgLSBBdXRvSGlkZVNjcm9sbGJhciBzaG91bGQgYWNjZXB0IGEgUmVmT2JqZWN0IG9yIGZhbGwgYmFjayB0byBpdHMgb3duIGluc3RlYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYm9keVJlZi5jdXJyZW50ID0gcmVmXG4gICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3RoaXMuY2F0ZWdvcmllcy5tYXAoY2F0ZWdvcnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1vamlzID0gdGhpcy5tZW1vaXplZERhdGFCeUNhdGVnb3J5W2NhdGVnb3J5LmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNhdGVnb3J5RWxlbWVudCA9ICgoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENhdGVnb3J5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17Y2F0ZWdvcnkuaWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPXtjYXRlZ29yeS5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT17Y2F0ZWdvcnkubmFtZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0QmVmb3JlPXtoZWlnaHRCZWZvcmV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXdwb3J0SGVpZ2h0PXt0aGlzLnN0YXRlLnZpZXdwb3J0SGVpZ2h0fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3A9e3RoaXMuc3RhdGUuc2Nyb2xsVG9wfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbW9qaXM9e2Vtb2ppc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vbkNsaWNrRW1vaml9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbkhvdmVyRW1vaml9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbkhvdmVyRW1vamlFbmR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRW1vamlzPXt0aGlzLnByb3BzLnNlbGVjdGVkRW1vamlzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IEVtb2ppUGlja2VyLmNhdGVnb3J5SGVpZ2h0Rm9yRW1vamlDb3VudChlbW9qaXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodEJlZm9yZSArPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2F0ZWdvcnlFbGVtZW50O1xuICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICAgICAgICAgIHt0aGlzLnN0YXRlLnByZXZpZXdFbW9qaSB8fCAhdGhpcy5wcm9wcy5zaG93UXVpY2tSZWFjdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgPyA8UHJldmlldyBlbW9qaT17dGhpcy5zdGF0ZS5wcmV2aWV3RW1vaml9IC8+XG4gICAgICAgICAgICAgICAgICAgIDogPFF1aWNrUmVhY3Rpb25zIG9uQ2xpY2s9e3RoaXMub25DbGlja0Vtb2ppfSBzZWxlY3RlZEVtb2ppcz17dGhpcy5wcm9wcy5zZWxlY3RlZEVtb2ppc30gLz4gfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBFbW9qaVBpY2tlcjtcbiJdfQ==