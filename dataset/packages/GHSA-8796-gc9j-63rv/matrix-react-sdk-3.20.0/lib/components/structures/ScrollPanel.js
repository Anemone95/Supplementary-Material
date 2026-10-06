"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Timer = _interopRequireDefault(require("../../utils/Timer"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _KeyBindingsManager = require("../../KeyBindingsManager");

var _dec, _class, _class2, _temp;

const DEBUG_SCROLL = false; // The amount of extra scroll distance to allow prior to unfilling.
// See _getExcessHeight.

const UNPAGINATION_PADDING = 6000; // The number of milliseconds to debounce calls to onUnfillRequest, to prevent
// many scroll events causing many unfilling requests.

const UNFILL_REQUEST_DEBOUNCE_MS = 200; // _updateHeight makes the height a ceiled multiple of this so we
// don't have to update the height too often. It also allows the user
// to scroll past the pagination spinner a bit so they don't feel blocked so
// much while the content loads.

const PAGE_SIZE = 400;
let debuglog;

if (DEBUG_SCROLL) {
  // using bind means that we get to keep useful line numbers in the console
  debuglog = console.log.bind(console, "ScrollPanel debuglog:");
} else {
  debuglog = function () {};
}
/* This component implements an intelligent scrolling list.
 *
 * It wraps a list of <li> children; when items are added to the start or end
 * of the list, the scroll position is updated so that the user still sees the
 * same position in the list.
 *
 * It also provides a hook which allows parents to provide more list elements
 * when we get close to the start or end of the list.
 *
 * Each child element should have a 'data-scroll-tokens'. This string of
 * comma-separated tokens may contain a single token or many, where many indicates
 * that the element contains elements that have scroll tokens themselves. The first
 * token in 'data-scroll-tokens' is used to serialise the scroll state, and returned
 * as the 'trackedScrollToken' attribute by getScrollState().
 *
 * IMPORTANT: INDIVIDUAL TOKENS WITHIN 'data-scroll-tokens' MUST NOT CONTAIN COMMAS.
 *
 * Some notes about the implementation:
 *
 * The saved 'scrollState' can exist in one of two states:
 *
 *   - stuckAtBottom: (the default, and restored by resetScrollState): the
 *     viewport is scrolled down as far as it can be. When the children are
 *     updated, the scroll position will be updated to ensure it is still at
 *     the bottom.
 *
 *   - fixed, in which the viewport is conceptually tied at a specific scroll
 *     offset.  We don't save the absolute scroll offset, because that would be
 *     affected by window width, zoom level, amount of scrollback, etc. Instead
 *     we save an identifier for the last fully-visible message, and the number
 *     of pixels the window was scrolled below it - which is hopefully near
 *     enough.
 *
 * The 'stickyBottom' property controls the behaviour when we reach the bottom
 * of the window (either through a user-initiated scroll, or by calling
 * scrollToBottom). If stickyBottom is enabled, the scrollState will enter
 * 'stuckAtBottom' state - ensuring that new additions cause the window to
 * scroll down further. If stickyBottom is disabled, we just save the scroll
 * offset as normal.
 */


let ScrollPanel = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.ScrollPanel"), _dec(_class = (_temp = _class2 = class ScrollPanel extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onScroll", ev => {
      // skip scroll events caused by resizing
      if (this.props.resizeNotifier && this.props.resizeNotifier.isResizing) return;
      debuglog("onScroll", this._getScrollNode().scrollTop);

      this._scrollTimeout.restart();

      this._saveScrollState();

      this.updatePreventShrinking();
      this.props.onScroll(ev);
      this.checkFillState();
    });
    (0, _defineProperty2.default)(this, "onResize", () => {
      debuglog("onResize");
      this.checkScroll(); // update preventShrinkingState if present

      if (this.preventShrinkingState) {
        this.preventShrinking();
      }
    });
    (0, _defineProperty2.default)(this, "checkScroll", () => {
      if (this.unmounted) {
        return;
      }

      this._restoreSavedScrollState();

      this.checkFillState();
    });
    (0, _defineProperty2.default)(this, "isAtBottom", () => {
      const sn = this._getScrollNode(); // fractional values (both too big and too small)
      // for scrollTop happen on certain browsers/platforms
      // when scrolled all the way down. E.g. Chrome 72 on debian.
      // so check difference <= 1;


      return Math.abs(sn.scrollHeight - (sn.scrollTop + sn.clientHeight)) <= 1;
    });
    (0, _defineProperty2.default)(this, "checkFillState", async (depth = 0) => {
      if (this.unmounted) {
        return;
      }

      const isFirstCall = depth === 0;

      const sn = this._getScrollNode(); // if there is less than a screenful of messages above or below the
      // viewport, try to get some more messages.
      //
      // scrollTop is the number of pixels between the top of the content and
      //     the top of the viewport.
      //
      // scrollHeight is the total height of the content.
      //
      // clientHeight is the height of the viewport (excluding borders,
      // margins, and scrollbars).
      //
      //
      //   .---------.          -                 -
      //   |         |          |  scrollTop      |
      // .-+---------+-.    -   -                 |
      // | |         | |    |                     |
      // | |         | |    |  clientHeight       | scrollHeight
      // | |         | |    |                     |
      // `-+---------+-'    -                     |
      //   |         |                            |
      //   |         |                            |
      //   `---------'                            -
      //
      // as filling is async and recursive,
      // don't allow more than 1 chain of calls concurrently
      // do make a note when a new request comes in while already running one,
      // so we can trigger a new chain of calls once done.


      if (isFirstCall) {
        if (this._isFilling) {
          debuglog("_isFilling: not entering while request is ongoing, marking for a subsequent request");
          this._fillRequestWhileRunning = true;
          return;
        }

        debuglog("_isFilling: setting");
        this._isFilling = true;
      }

      const itemlist = this._itemlist.current;
      const firstTile = itemlist && itemlist.firstElementChild;
      const contentTop = firstTile && firstTile.offsetTop;
      const fillPromises = []; // if scrollTop gets to 1 screen from the top of the first tile,
      // try backward filling

      if (!firstTile || sn.scrollTop - contentTop < sn.clientHeight) {
        // need to back-fill
        fillPromises.push(this._maybeFill(depth, true));
      } // if scrollTop gets to 2 screens from the end (so 1 screen below viewport),
      // try forward filling


      if (sn.scrollHeight - sn.scrollTop < sn.clientHeight * 2) {
        // need to forward-fill
        fillPromises.push(this._maybeFill(depth, false));
      }

      if (fillPromises.length) {
        try {
          await Promise.all(fillPromises);
        } catch (err) {
          console.error(err);
        }
      }

      if (isFirstCall) {
        debuglog("_isFilling: clearing");
        this._isFilling = false;
      }

      if (this._fillRequestWhileRunning) {
        this._fillRequestWhileRunning = false;
        this.checkFillState();
      }
    });
    (0, _defineProperty2.default)(this, "getScrollState", () => this.scrollState);
    (0, _defineProperty2.default)(this, "resetScrollState", () => {
      this.scrollState = {
        stuckAtBottom: this.props.startAtBottom
      };
      this._bottomGrowth = 0;
      this._pages = 0;
      this._scrollTimeout = new _Timer.default(100);
      this._heightUpdateInProgress = false;
    });
    (0, _defineProperty2.default)(this, "scrollToTop", () => {
      this._getScrollNode().scrollTop = 0;

      this._saveScrollState();
    });
    (0, _defineProperty2.default)(this, "scrollToBottom", () => {
      // the easiest way to make sure that the scroll state is correctly
      // saved is to do the scroll, then save the updated state. (Calculating
      // it ourselves is hard, and we can't rely on an onScroll callback
      // happening, since there may be no user-visible change here).
      const sn = this._getScrollNode();

      sn.scrollTop = sn.scrollHeight;

      this._saveScrollState();
    });
    (0, _defineProperty2.default)(this, "scrollRelative", mult => {
      const scrollNode = this._getScrollNode();

      const delta = mult * scrollNode.clientHeight * 0.9;
      scrollNode.scrollBy(0, delta);

      this._saveScrollState();
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      const roomAction = (0, _KeyBindingsManager.getKeyBindingsManager)().getRoomAction(ev);

      switch (roomAction) {
        case _KeyBindingsManager.RoomAction.ScrollUp:
          this.scrollRelative(-1);
          break;

        case _KeyBindingsManager.RoomAction.RoomScrollDown:
          this.scrollRelative(1);
          break;

        case _KeyBindingsManager.RoomAction.JumpToFirstMessage:
          this.scrollToTop();
          break;

        case _KeyBindingsManager.RoomAction.JumpToLatestMessage:
          this.scrollToBottom();
          break;
      }
    });
    (0, _defineProperty2.default)(this, "scrollToToken", (scrollToken, pixelOffset, offsetBase) => {
      pixelOffset = pixelOffset || 0;
      offsetBase = offsetBase || 0; // set the trackedScrollToken so we can get the node through _getTrackedNode

      this.scrollState = {
        stuckAtBottom: false,
        trackedScrollToken: scrollToken
      };

      const trackedNode = this._getTrackedNode();

      const scrollNode = this._getScrollNode();

      if (trackedNode) {
        // set the scrollTop to the position we want.
        // note though, that this might not succeed if the combination of offsetBase and pixelOffset
        // would position the trackedNode towards the top of the viewport.
        // This because when setting the scrollTop only 10 or so events might be loaded,
        // not giving enough content below the trackedNode to scroll downwards
        // enough so it ends up in the top of the viewport.
        debuglog("scrollToken: setting scrollTop", {
          offsetBase,
          pixelOffset,
          offsetTop: trackedNode.offsetTop
        });
        scrollNode.scrollTop = trackedNode.offsetTop - scrollNode.clientHeight * offsetBase + pixelOffset;

        this._saveScrollState();
      }
    });
    (0, _defineProperty2.default)(this, "_collectScroll", divScroll => {
      this._divScroll = divScroll;
    });
    (0, _defineProperty2.default)(this, "preventShrinking", () => {
      const messageList = this._itemlist.current;
      const tiles = messageList && messageList.children;

      if (!messageList) {
        return;
      }

      let lastTileNode;

      for (let i = tiles.length - 1; i >= 0; i--) {
        const node = tiles[i];

        if (node.dataset.scrollTokens) {
          lastTileNode = node;
          break;
        }
      }

      if (!lastTileNode) {
        return;
      }

      this.clearPreventShrinking();
      const offsetFromBottom = messageList.clientHeight - (lastTileNode.offsetTop + lastTileNode.clientHeight);
      this.preventShrinkingState = {
        offsetFromBottom: offsetFromBottom,
        offsetNode: lastTileNode
      };
      debuglog("prevent shrinking, last tile ", offsetFromBottom, "px from bottom");
    });
    (0, _defineProperty2.default)(this, "clearPreventShrinking", () => {
      const messageList = this._itemlist.current;
      const balanceElement = messageList && messageList.parentElement;
      if (balanceElement) balanceElement.style.paddingBottom = null;
      this.preventShrinkingState = null;
      debuglog("prevent shrinking cleared");
    });
    (0, _defineProperty2.default)(this, "updatePreventShrinking", () => {
      if (this.preventShrinkingState) {
        const sn = this._getScrollNode();

        const scrollState = this.scrollState;
        const messageList = this._itemlist.current;
        const {
          offsetNode,
          offsetFromBottom
        } = this.preventShrinkingState; // element used to set paddingBottom to balance the typing notifs disappearing

        const balanceElement = messageList.parentElement; // if the offsetNode got unmounted, clear

        let shouldClear = !offsetNode.parentElement; // also if 200px from bottom

        if (!shouldClear && !scrollState.stuckAtBottom) {
          const spaceBelowViewport = sn.scrollHeight - (sn.scrollTop + sn.clientHeight);
          shouldClear = spaceBelowViewport >= 200;
        } // try updating if not clearing


        if (!shouldClear) {
          const currentOffset = messageList.clientHeight - (offsetNode.offsetTop + offsetNode.clientHeight);
          const offsetDiff = offsetFromBottom - currentOffset;

          if (offsetDiff > 0) {
            balanceElement.style.paddingBottom = `${offsetDiff}px`;
            debuglog("update prevent shrinking ", offsetDiff, "px from bottom");
          } else if (offsetDiff < 0) {
            shouldClear = true;
          }
        }

        if (shouldClear) {
          this.clearPreventShrinking();
        }
      }
    });
    this._pendingFillRequests = {
      b: null,
      f: null
    };

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.on("middlePanelResizedNoisy", this.onResize);
    }

    this.resetScrollState();
    this._itemlist = /*#__PURE__*/(0, _react.createRef)();
  }

  componentDidMount() {
    this.checkScroll();
  }

  componentDidUpdate() {
    // after adding event tiles, we may need to tweak the scroll (either to
    // keep at the bottom of the timeline, or to maintain the view after
    // adding events to the top).
    //
    // This will also re-check the fill state, in case the paginate was inadequate
    this.checkScroll();
    this.updatePreventShrinking();
  }

  componentWillUnmount() {
    // set a boolean to say we've been unmounted, which any pending
    // promises can use to throw away their results.
    //
    // (We could use isMounted(), but facebook have deprecated that.)
    this.unmounted = true;

    if (this.props.resizeNotifier) {
      this.props.resizeNotifier.removeListener("middlePanelResizedNoisy", this.onResize);
    }
  }

  // returns the vertical height in the given direction that can be removed from
  // the content box (which has a height of scrollHeight, see checkFillState) without
  // pagination occuring.
  //
  // padding* = UNPAGINATION_PADDING
  //
  // ### Region determined as excess.
  //
  //   .---------.                        -              -
  //   |#########|                        |              |
  //   |#########|   -                    |  scrollTop   |
  //   |         |   | padding*           |              |
  //   |         |   |                    |              |
  // .-+---------+-. -  -                 |              |
  // : |         | :    |                 |              |
  // : |         | :    |  clientHeight   |              |
  // : |         | :    |                 |              |
  // .-+---------+-.    -                 -              |
  // | |         | |    |                                |
  // | |         | |    |  clientHeight                  | scrollHeight
  // | |         | |    |                                |
  // `-+---------+-'    -                                |
  // : |         | :    |                                |
  // : |         | :    |  clientHeight                  |
  // : |         | :    |                                |
  // `-+---------+-' -  -                                |
  //   |         |   | padding*                          |
  //   |         |   |                                   |
  //   |#########|   -                                   |
  //   |#########|                                       |
  //   `---------'                                       -
  _getExcessHeight(backwards) {
    const sn = this._getScrollNode();

    const contentHeight = this._getMessagesHeight();

    const listHeight = this._getListHeight();

    const clippedHeight = contentHeight - listHeight;
    const unclippedScrollTop = sn.scrollTop + clippedHeight;

    if (backwards) {
      return unclippedScrollTop - sn.clientHeight - UNPAGINATION_PADDING;
    } else {
      return contentHeight - (unclippedScrollTop + 2 * sn.clientHeight) - UNPAGINATION_PADDING;
    }
  } // check the scroll state and send out backfill requests if necessary.


  // check if unfilling is possible and send an unfill request if necessary
  _checkUnfillState(backwards) {
    let excessHeight = this._getExcessHeight(backwards);

    if (excessHeight <= 0) {
      return;
    }

    const origExcessHeight = excessHeight;
    const tiles = this._itemlist.current.children; // The scroll token of the first/last tile to be unpaginated

    let markerScrollToken = null; // Subtract heights of tiles to simulate the tiles being unpaginated until the
    // excess height is less than the height of the next tile to subtract. This
    // prevents excessHeight becoming negative, which could lead to future
    // pagination.
    //
    // If backwards is true, we unpaginate (remove) tiles from the back (top).

    let tile;

    for (let i = 0; i < tiles.length; i++) {
      tile = tiles[backwards ? i : tiles.length - 1 - i]; // Subtract height of tile as if it were unpaginated

      excessHeight -= tile.clientHeight; //If removing the tile would lead to future pagination, break before setting scroll token

      if (tile.clientHeight > excessHeight) {
        break;
      } // The tile may not have a scroll token, so guard it


      if (tile.dataset.scrollTokens) {
        markerScrollToken = tile.dataset.scrollTokens.split(',')[0];
      }
    }

    if (markerScrollToken) {
      // Use a debouncer to prevent multiple unfill calls in quick succession
      // This is to make the unfilling process less aggressive
      if (this._unfillDebouncer) {
        clearTimeout(this._unfillDebouncer);
      }

      this._unfillDebouncer = setTimeout(() => {
        this._unfillDebouncer = null;
        debuglog("unfilling now", backwards, origExcessHeight);
        this.props.onUnfillRequest(backwards, markerScrollToken);
      }, UNFILL_REQUEST_DEBOUNCE_MS);
    }
  } // check if there is already a pending fill request. If not, set one off.


  _maybeFill(depth, backwards) {
    const dir = backwards ? 'b' : 'f';

    if (this._pendingFillRequests[dir]) {
      debuglog("Already a " + dir + " fill in progress - not starting another");
      return;
    }

    debuglog("starting " + dir + " fill"); // onFillRequest can end up calling us recursively (via onScroll
    // events) so make sure we set this before firing off the call.

    this._pendingFillRequests[dir] = true; // wait 1ms before paginating, because otherwise
    // this will block the scroll event handler for +700ms
    // if messages are already cached in memory,
    // This would cause jumping to happen on Chrome/macOS.

    return new Promise(resolve => setTimeout(resolve, 1)).then(() => {
      return this.props.onFillRequest(backwards);
    }).finally(() => {
      this._pendingFillRequests[dir] = false;
    }).then(hasMoreResults => {
      if (this.unmounted) {
        return;
      } // Unpaginate once filling is complete


      this._checkUnfillState(!backwards);

      debuglog("" + dir + " fill complete; hasMoreResults:" + hasMoreResults);

      if (hasMoreResults) {
        // further pagination requests have been disabled until now, so
        // it's time to check the fill state again in case the pagination
        // was insufficient.
        return this.checkFillState(depth + 1);
      }
    });
  }
  /* get the current scroll state. This returns an object with the following
   * properties:
   *
   * boolean stuckAtBottom: true if we are tracking the bottom of the
   *   scroll. false if we are tracking a particular child.
   *
   * string trackedScrollToken: undefined if stuckAtBottom is true; if it is
   *   false, the first token in data-scroll-tokens of the child which we are
   *   tracking.
   *
   * number bottomOffset: undefined if stuckAtBottom is true; if it is false,
   *   the number of pixels the bottom of the tracked child is above the
   *   bottom of the scroll panel.
   */


  _saveScrollState() {
    if (this.props.stickyBottom && this.isAtBottom()) {
      this.scrollState = {
        stuckAtBottom: true
      };
      debuglog("saved stuckAtBottom state");
      return;
    }

    const scrollNode = this._getScrollNode();

    const viewportBottom = scrollNode.scrollHeight - (scrollNode.scrollTop + scrollNode.clientHeight);
    const itemlist = this._itemlist.current;
    const messages = itemlist.children;
    let node = null; // TODO: do a binary search here, as items are sorted by offsetTop
    // loop backwards, from bottom-most message (as that is the most common case)

    for (let i = messages.length - 1; i >= 0; --i) {
      if (!messages[i].dataset.scrollTokens) {
        continue;
      }

      node = messages[i]; // break at the first message (coming from the bottom)
      // that has it's offsetTop above the bottom of the viewport.

      if (this._topFromBottom(node) > viewportBottom) {
        // Use this node as the scrollToken
        break;
      }
    }

    if (!node) {
      debuglog("unable to save scroll state: found no children in the viewport");
      return;
    }

    const scrollToken = node.dataset.scrollTokens.split(',')[0];
    debuglog("saving anchored scroll state to message", node && node.innerText, scrollToken);

    const bottomOffset = this._topFromBottom(node);

    this.scrollState = {
      stuckAtBottom: false,
      trackedNode: node,
      trackedScrollToken: scrollToken,
      bottomOffset: bottomOffset,
      pixelOffset: bottomOffset - viewportBottom //needed for restoring the scroll position when coming back to the room

    };
  }

  async _restoreSavedScrollState() {
    const scrollState = this.scrollState;

    if (scrollState.stuckAtBottom) {
      const sn = this._getScrollNode();

      if (sn.scrollTop !== sn.scrollHeight) {
        sn.scrollTop = sn.scrollHeight;
      }
    } else if (scrollState.trackedScrollToken) {
      const itemlist = this._itemlist.current;

      const trackedNode = this._getTrackedNode();

      if (trackedNode) {
        const newBottomOffset = this._topFromBottom(trackedNode);

        const bottomDiff = newBottomOffset - scrollState.bottomOffset;
        this._bottomGrowth += bottomDiff;
        scrollState.bottomOffset = newBottomOffset;
        const newHeight = `${this._getListHeight()}px`;

        if (itemlist.style.height !== newHeight) {
          itemlist.style.height = newHeight;
        }

        debuglog("balancing height because messages below viewport grew by", bottomDiff);
      }
    }

    if (!this._heightUpdateInProgress) {
      this._heightUpdateInProgress = true;

      try {
        await this._updateHeight();
      } finally {
        this._heightUpdateInProgress = false;
      }
    } else {
      debuglog("not updating height because request already in progress");
    }
  } // need a better name that also indicates this will change scrollTop? Rebalance height? Reveal content?


  async _updateHeight() {
    // wait until user has stopped scrolling
    if (this._scrollTimeout.isRunning()) {
      debuglog("updateHeight waiting for scrolling to end ... ");
      await this._scrollTimeout.finished();
    } else {
      debuglog("updateHeight getting straight to business, no scrolling going on.");
    } // We might have unmounted since the timer finished, so abort if so.


    if (this.unmounted) {
      return;
    }

    const sn = this._getScrollNode();

    const itemlist = this._itemlist.current;

    const contentHeight = this._getMessagesHeight();

    const minHeight = sn.clientHeight;
    const height = Math.max(minHeight, contentHeight);
    this._pages = Math.ceil(height / PAGE_SIZE);
    this._bottomGrowth = 0;
    const newHeight = `${this._getListHeight()}px`;
    const scrollState = this.scrollState;

    if (scrollState.stuckAtBottom) {
      if (itemlist.style.height !== newHeight) {
        itemlist.style.height = newHeight;
      }

      if (sn.scrollTop !== sn.scrollHeight) {
        sn.scrollTop = sn.scrollHeight;
      }

      debuglog("updateHeight to", newHeight);
    } else if (scrollState.trackedScrollToken) {
      const trackedNode = this._getTrackedNode(); // if the timeline has been reloaded
      // this can be called before scrollToBottom or whatever has been called
      // so don't do anything if the node has disappeared from
      // the currently filled piece of the timeline


      if (trackedNode) {
        const oldTop = trackedNode.offsetTop;

        if (itemlist.style.height !== newHeight) {
          itemlist.style.height = newHeight;
        }

        const newTop = trackedNode.offsetTop;
        const topDiff = newTop - oldTop; // important to scroll by a relative amount as
        // reading scrollTop and then setting it might
        // yield out of date values and cause a jump
        // when setting it

        sn.scrollBy(0, topDiff);
        debuglog("updateHeight to", {
          newHeight,
          topDiff
        });
      }
    }
  }

  _getTrackedNode() {
    const scrollState = this.scrollState;
    const trackedNode = scrollState.trackedNode;

    if (!trackedNode || !trackedNode.parentElement) {
      let node;
      const messages = this._itemlist.current.children;
      const scrollToken = scrollState.trackedScrollToken;

      for (let i = messages.length - 1; i >= 0; --i) {
        const m = messages[i]; // 'data-scroll-tokens' is a DOMString of comma-separated scroll tokens
        // There might only be one scroll token

        if (m.dataset.scrollTokens && m.dataset.scrollTokens.split(',').indexOf(scrollToken) !== -1) {
          node = m;
          break;
        }
      }

      if (node) {
        debuglog("had to find tracked node again for " + scrollState.trackedScrollToken);
      }

      scrollState.trackedNode = node;
    }

    if (!scrollState.trackedNode) {
      debuglog("No node with ; '" + scrollState.trackedScrollToken + "'");
      return;
    }

    return scrollState.trackedNode;
  }

  _getListHeight() {
    return this._bottomGrowth + this._pages * PAGE_SIZE;
  }

  _getMessagesHeight() {
    const itemlist = this._itemlist.current;
    const lastNode = itemlist.lastElementChild;
    const lastNodeBottom = lastNode ? lastNode.offsetTop + lastNode.clientHeight : 0;
    const firstNodeTop = itemlist.firstElementChild ? itemlist.firstElementChild.offsetTop : 0; // 18 is itemlist padding

    return lastNodeBottom - firstNodeTop + 18 * 2;
  }

  _topFromBottom(node) {
    // current capped height - distance from top = distance from bottom of container to top of tracked element
    return this._itemlist.current.clientHeight - node.offsetTop;
  }
  /* get the DOM node which has the scrollTop property we care about for our
   * message panel.
   */


  _getScrollNode() {
    if (this.unmounted) {
      // this shouldn't happen, but when it does, turn the NPE into
      // something more meaningful.
      throw new Error("ScrollPanel._getScrollNode called when unmounted");
    }

    if (!this._divScroll) {
      // Likewise, we should have the ref by this point, but if not
      // turn the NPE into something meaningful.
      throw new Error("ScrollPanel._getScrollNode called before AutoHideScrollbar ref collected");
    }

    return this._divScroll;
  }

  render() {
    // TODO: the classnames on the div and ol could do with being updated to
    // reflect the fact that we don't necessarily contain a list of messages.
    // it's not obvious why we have a separate div and ol anyway.
    // give the <ol> an explicit role=list because Safari+VoiceOver seems to think an ordered-list with
    // list-style-type: none; is no longer a list
    return /*#__PURE__*/_react.default.createElement(_AutoHideScrollbar.default, {
      wrappedRef: this._collectScroll,
      onScroll: this.onScroll,
      className: `mx_ScrollPanel ${this.props.className}`,
      style: this.props.style
    }, this.props.fixedChildren, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_RoomView_messageListWrapper"
    }, /*#__PURE__*/_react.default.createElement("ol", {
      ref: this._itemlist,
      className: "mx_RoomView_MessageList",
      "aria-live": "polite",
      role: "list"
    }, this.props.children)));
  }

}, (0, _defineProperty2.default)(_class2, "propTypes", {
  /* stickyBottom: if set to true, then once the user hits the bottom of
   * the list, any new children added to the list will cause the list to
   * scroll down to show the new element, rather than preserving the
   * existing view.
   */
  stickyBottom: _propTypes.default.bool,

  /* startAtBottom: if set to true, the view is assumed to start
   * scrolled to the bottom.
   * XXX: It's likely this is unnecessary and can be derived from
   * stickyBottom, but I'm adding an extra parameter to ensure
   * behaviour stays the same for other uses of ScrollPanel.
   * If so, let's remove this parameter down the line.
   */
  startAtBottom: _propTypes.default.bool,

  /* onFillRequest(backwards): a callback which is called on scroll when
   * the user nears the start (backwards = true) or end (backwards =
   * false) of the list.
   *
   * This should return a promise; no more calls will be made until the
   * promise completes.
   *
   * The promise should resolve to true if there is more data to be
   * retrieved in this direction (in which case onFillRequest may be
   * called again immediately), or false if there is no more data in this
   * directon (at this time) - which will stop the pagination cycle until
   * the user scrolls again.
   */
  onFillRequest: _propTypes.default.func,

  /* onUnfillRequest(backwards): a callback which is called on scroll when
   * there are children elements that are far out of view and could be removed
   * without causing pagination to occur.
   *
   * This function should accept a boolean, which is true to indicate the back/top
   * of the panel and false otherwise, and a scroll token, which refers to the
   * first element to remove if removing from the front/bottom, and last element
   * to remove if removing from the back/top.
   */
  onUnfillRequest: _propTypes.default.func,

  /* onScroll: a callback which is called whenever any scroll happens.
   */
  onScroll: _propTypes.default.func,

  /* className: classnames to add to the top-level div
   */
  className: _propTypes.default.string,

  /* style: styles to add to the top-level div
   */
  style: _propTypes.default.object,

  /* resizeNotifier: ResizeNotifier to know when middle column has changed size
   */
  resizeNotifier: _propTypes.default.object,

  /* fixedChildren: allows for children to be passed which are rendered outside
   * of the wrapper
   */
  fixedChildren: _propTypes.default.node
}), (0, _defineProperty2.default)(_class2, "defaultProps", {
  stickyBottom: true,
  startAtBottom: true,
  onFillRequest: function (backwards) {
    return Promise.resolve(false);
  },
  onUnfillRequest: function (backwards, scrollToken) {},
  onScroll: function () {}
}), _temp)) || _class);
exports.default = ScrollPanel;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU2Nyb2xsUGFuZWwuanMiXSwibmFtZXMiOlsiREVCVUdfU0NST0xMIiwiVU5QQUdJTkFUSU9OX1BBRERJTkciLCJVTkZJTExfUkVRVUVTVF9ERUJPVU5DRV9NUyIsIlBBR0VfU0laRSIsImRlYnVnbG9nIiwiY29uc29sZSIsImxvZyIsImJpbmQiLCJTY3JvbGxQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2IiwicmVzaXplTm90aWZpZXIiLCJpc1Jlc2l6aW5nIiwiX2dldFNjcm9sbE5vZGUiLCJzY3JvbGxUb3AiLCJfc2Nyb2xsVGltZW91dCIsInJlc3RhcnQiLCJfc2F2ZVNjcm9sbFN0YXRlIiwidXBkYXRlUHJldmVudFNocmlua2luZyIsIm9uU2Nyb2xsIiwiY2hlY2tGaWxsU3RhdGUiLCJjaGVja1Njcm9sbCIsInByZXZlbnRTaHJpbmtpbmdTdGF0ZSIsInByZXZlbnRTaHJpbmtpbmciLCJ1bm1vdW50ZWQiLCJfcmVzdG9yZVNhdmVkU2Nyb2xsU3RhdGUiLCJzbiIsIk1hdGgiLCJhYnMiLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJkZXB0aCIsImlzRmlyc3RDYWxsIiwiX2lzRmlsbGluZyIsIl9maWxsUmVxdWVzdFdoaWxlUnVubmluZyIsIml0ZW1saXN0IiwiX2l0ZW1saXN0IiwiY3VycmVudCIsImZpcnN0VGlsZSIsImZpcnN0RWxlbWVudENoaWxkIiwiY29udGVudFRvcCIsIm9mZnNldFRvcCIsImZpbGxQcm9taXNlcyIsInB1c2giLCJfbWF5YmVGaWxsIiwibGVuZ3RoIiwiUHJvbWlzZSIsImFsbCIsImVyciIsImVycm9yIiwic2Nyb2xsU3RhdGUiLCJzdHVja0F0Qm90dG9tIiwic3RhcnRBdEJvdHRvbSIsIl9ib3R0b21Hcm93dGgiLCJfcGFnZXMiLCJUaW1lciIsIl9oZWlnaHRVcGRhdGVJblByb2dyZXNzIiwibXVsdCIsInNjcm9sbE5vZGUiLCJkZWx0YSIsInNjcm9sbEJ5Iiwicm9vbUFjdGlvbiIsImdldFJvb21BY3Rpb24iLCJSb29tQWN0aW9uIiwiU2Nyb2xsVXAiLCJzY3JvbGxSZWxhdGl2ZSIsIlJvb21TY3JvbGxEb3duIiwiSnVtcFRvRmlyc3RNZXNzYWdlIiwic2Nyb2xsVG9Ub3AiLCJKdW1wVG9MYXRlc3RNZXNzYWdlIiwic2Nyb2xsVG9Cb3R0b20iLCJzY3JvbGxUb2tlbiIsInBpeGVsT2Zmc2V0Iiwib2Zmc2V0QmFzZSIsInRyYWNrZWRTY3JvbGxUb2tlbiIsInRyYWNrZWROb2RlIiwiX2dldFRyYWNrZWROb2RlIiwiZGl2U2Nyb2xsIiwiX2RpdlNjcm9sbCIsIm1lc3NhZ2VMaXN0IiwidGlsZXMiLCJjaGlsZHJlbiIsImxhc3RUaWxlTm9kZSIsImkiLCJub2RlIiwiZGF0YXNldCIsInNjcm9sbFRva2VucyIsImNsZWFyUHJldmVudFNocmlua2luZyIsIm9mZnNldEZyb21Cb3R0b20iLCJvZmZzZXROb2RlIiwiYmFsYW5jZUVsZW1lbnQiLCJwYXJlbnRFbGVtZW50Iiwic3R5bGUiLCJwYWRkaW5nQm90dG9tIiwic2hvdWxkQ2xlYXIiLCJzcGFjZUJlbG93Vmlld3BvcnQiLCJjdXJyZW50T2Zmc2V0Iiwib2Zmc2V0RGlmZiIsIl9wZW5kaW5nRmlsbFJlcXVlc3RzIiwiYiIsImYiLCJvbiIsIm9uUmVzaXplIiwicmVzZXRTY3JvbGxTdGF0ZSIsImNvbXBvbmVudERpZE1vdW50IiwiY29tcG9uZW50RGlkVXBkYXRlIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJyZW1vdmVMaXN0ZW5lciIsIl9nZXRFeGNlc3NIZWlnaHQiLCJiYWNrd2FyZHMiLCJjb250ZW50SGVpZ2h0IiwiX2dldE1lc3NhZ2VzSGVpZ2h0IiwibGlzdEhlaWdodCIsIl9nZXRMaXN0SGVpZ2h0IiwiY2xpcHBlZEhlaWdodCIsInVuY2xpcHBlZFNjcm9sbFRvcCIsIl9jaGVja1VuZmlsbFN0YXRlIiwiZXhjZXNzSGVpZ2h0Iiwib3JpZ0V4Y2Vzc0hlaWdodCIsIm1hcmtlclNjcm9sbFRva2VuIiwidGlsZSIsInNwbGl0IiwiX3VuZmlsbERlYm91bmNlciIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJvblVuZmlsbFJlcXVlc3QiLCJkaXIiLCJyZXNvbHZlIiwidGhlbiIsIm9uRmlsbFJlcXVlc3QiLCJmaW5hbGx5IiwiaGFzTW9yZVJlc3VsdHMiLCJzdGlja3lCb3R0b20iLCJpc0F0Qm90dG9tIiwidmlld3BvcnRCb3R0b20iLCJtZXNzYWdlcyIsIl90b3BGcm9tQm90dG9tIiwiaW5uZXJUZXh0IiwiYm90dG9tT2Zmc2V0IiwibmV3Qm90dG9tT2Zmc2V0IiwiYm90dG9tRGlmZiIsIm5ld0hlaWdodCIsImhlaWdodCIsIl91cGRhdGVIZWlnaHQiLCJpc1J1bm5pbmciLCJmaW5pc2hlZCIsIm1pbkhlaWdodCIsIm1heCIsImNlaWwiLCJvbGRUb3AiLCJuZXdUb3AiLCJ0b3BEaWZmIiwibSIsImluZGV4T2YiLCJsYXN0Tm9kZSIsImxhc3RFbGVtZW50Q2hpbGQiLCJsYXN0Tm9kZUJvdHRvbSIsImZpcnN0Tm9kZVRvcCIsIkVycm9yIiwicmVuZGVyIiwiX2NvbGxlY3RTY3JvbGwiLCJjbGFzc05hbWUiLCJmaXhlZENoaWxkcmVuIiwiUHJvcFR5cGVzIiwiYm9vbCIsImZ1bmMiLCJzdHJpbmciLCJvYmplY3QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFnQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFFQSxNQUFNQSxZQUFZLEdBQUcsS0FBckIsQyxDQUVBO0FBQ0E7O0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBN0IsQyxDQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsR0FBbkMsQyxDQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQU1DLFNBQVMsR0FBRyxHQUFsQjtBQUVBLElBQUlDLFFBQUo7O0FBQ0EsSUFBSUosWUFBSixFQUFrQjtBQUNkO0FBQ0FJLEVBQUFBLFFBQVEsR0FBR0MsT0FBTyxD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QVVFLElBN0NMOztBQStDZjtBQUNSO0FBQ1FKLEVBQUFBLFNBQVMsRUFBRUUsbUJBQVVHLE1BakROOztBQW1EZjtBQUNSO0FBQ1ExRSxFQUFBQSxLQUFLLEVBQUV1RSxtQkFBVUksTUFyREY7O0FBdURmO0FBQ1I7QUFDUTVKLEVBQUFBLGNBQWMsRUFBRXdKLG1CQUFVSSxNQXpEWDs7QUEyRGY7QUFDUjtBQUNBO0FBQ1FMLEVBQUFBLGFBQWEsRUFBRUMsbUJBQVUvRTtBQTlEVixDLDBEQWlFRztBQUNsQmdELEVBQUFBLFlBQVksRUFBRSxJQURJO0FBRWxCaEYsRUFBQUEsYUFBYSxFQUFFLElBRkc7QUFHbEI2RSxFQUFBQSxhQUFhLEVBQUUsVUFBU3BCLFNBQVQsRUFBb0I7QUFBRSxXQUFPL0QsT0FBTyxDQUFDaUYsT0FBUixDQUFnQixLQUFoQixDQUFQO0FBQWdDLEdBSG5EO0FBSWxCRixFQUFBQSxlQUFlLEVBQUUsVUFBU2hCLFNBQVQsRUFBb0J0QyxXQUFwQixFQUFpQyxDQUFFLENBSmxDO0FBS2xCcEQsRUFBQUEsUUFBUSxFQUFFLFlBQVcsQ0FBRTtBQUxMLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgUmVhY3QsIHtjcmVhdGVSZWZ9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBUaW1lciBmcm9tICcuLi8uLi91dGlscy9UaW1lcic7XG5pbXBvcnQgQXV0b0hpZGVTY3JvbGxiYXIgZnJvbSBcIi4vQXV0b0hpZGVTY3JvbGxiYXJcIjtcbmltcG9ydCB7cmVwbGFjZWFibGVDb21wb25lbnR9IGZyb20gXCIuLi8uLi91dGlscy9yZXBsYWNlYWJsZUNvbXBvbmVudFwiO1xuaW1wb3J0IHtnZXRLZXlCaW5kaW5nc01hbmFnZXIsIFJvb21BY3Rpb259IGZyb20gXCIuLi8uLi9LZXlCaW5kaW5nc01hbmFnZXJcIjtcblxuY29uc3QgREVCVUdfU0NST0xMID0gZmFsc2U7XG5cbi8vIFRoZSBhbW91bnQgb2YgZXh0cmEgc2Nyb2xsIGRpc3RhbmNlIHRvIGFsbG93IHByaW9yIHRvIHVuZmlsbGluZy5cbi8vIFNlZSBfZ2V0RXhjZXNzSGVpZ2h0LlxuY29uc3QgVU5QQUdJTkFUSU9OX1BBRERJTkcgPSA2MDAwO1xuLy8gVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gZGVib3VuY2UgY2FsbHMgdG8gb25VbmZpbGxSZXF1ZXN0LCB0byBwcmV2ZW50XG4vLyBtYW55IHNjcm9sbCBldmVudHMgY2F1c2luZyBtYW55IHVuZmlsbGluZyByZXF1ZXN0cy5cbmNvbnN0IFVORklMTF9SRVFVRVNUX0RFQk9VTkNFX01TID0gMjAwO1xuLy8gX3VwZGF0ZUhlaWdodCBtYWtlcyB0aGUgaGVpZ2h0IGEgY2VpbGVkIG11bHRpcGxlIG9mIHRoaXMgc28gd2Vcbi8vIGRvbid0IGhhdmUgdG8gdXBkYXRlIHRoZSBoZWlnaHQgdG9vIG9mdGVuLiBJdCBhbHNvIGFsbG93cyB0aGUgdXNlclxuLy8gdG8gc2Nyb2xsIHBhc3QgdGhlIHBhZ2luYXRpb24gc3Bpbm5lciBhIGJpdCBzbyB0aGV5IGRvbid0IGZlZWwgYmxvY2tlZCBzb1xuLy8gbXVjaCB3aGlsZSB0aGUgY29udGVudCBsb2Fkcy5cbmNvbnN0IFBBR0VfU0laRSA9IDQwMDtcblxubGV0IGRlYnVnbG9nO1xuaWYgKERFQlVHX1NDUk9MTCkge1xuICAgIC8vIHVzaW5nIGJpbmQgbWVhbnMgdGhhdCB3ZSBnZXQgdG8ga2VlcCB1c2VmdWwgbGluZSBudW1iZXJzIGluIHRoZSBjb25zb2xlXG4gICAgZGVidWdsb2cgPSBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUsIFwiU2Nyb2xsUGFuZWwgZGVidWdsb2c6XCIpO1xufSBlbHNlIHtcbiAgICBkZWJ1Z2xvZyA9IGZ1bmN0aW9uKCkge307XG59XG5cbi8qIFRoaXMgY29tcG9uZW50IGltcGxlbWVudHMgYW4gaW50ZWxsaWdlbnQgc2Nyb2xsaW5nIGxpc3QuXG4gKlxuICogSXQgd3JhcHMgYSBsaXN0IG9mIDxsaT4gY2hpbGRyZW47IHdoZW4gaXRlbXMgYXJlIGFkZGVkIHRvIHRoZSBzdGFydCBvciBlbmRcbiAqIG9mIHRoZSBsaXN0LCB0aGUgc2Nyb2xsIHBvc2l0aW9uIGlzIHVwZGF0ZWQgc28gdGhhdCB0aGUgdXNlciBzdGlsbCBzZWVzIHRoZVxuICogc2FtZSBwb3NpdGlvbiBpbiB0aGUgbGlzdC5cbiAqXG4gKiBJdCBhbHNvIHByb3ZpZGVzIGEgaG9vayB3aGljaCBhbGxvd3MgcGFyZW50cyB0byBwcm92aWRlIG1vcmUgbGlzdCBlbGVtZW50c1xuICogd2hlbiB3ZSBnZXQgY2xvc2UgdG8gdGhlIHN0YXJ0IG9yIGVuZCBvZiB0aGUgbGlzdC5cbiAqXG4gKiBFYWNoIGNoaWxkIGVsZW1lbnQgc2hvdWxkIGhhdmUgYSAnZGF0YS1zY3JvbGwtdG9rZW5zJy4gVGhpcyBzdHJpbmcgb2ZcbiAqIGNvbW1hLXNlcGFyYXRlZCB0b2tlbnMgbWF5IGNvbnRhaW4gYSBzaW5nbGUgdG9rZW4gb3IgbWFueSwgd2hlcmUgbWFueSBpbmRpY2F0ZXNcbiAqIHRoYXQgdGhlIGVsZW1lbnQgY29udGFpbnMgZWxlbWVudHMgdGhhdCBoYXZlIHNjcm9sbCB0b2tlbnMgdGhlbXNlbHZlcy4gVGhlIGZpcnN0XG4gKiB0b2tlbiBpbiAnZGF0YS1zY3JvbGwtdG9rZW5zJyBpcyB1c2VkIHRvIHNlcmlhbGlzZSB0aGUgc2Nyb2xsIHN0YXRlLCBhbmQgcmV0dXJuZWRcbiAqIGFzIHRoZSAndHJhY2tlZFNjcm9sbFRva2VuJyBhdHRyaWJ1dGUgYnkgZ2V0U2Nyb2xsU3RhdGUoKS5cbiAqXG4gKiBJTVBPUlRBTlQ6IElORElWSURVQUwgVE9LRU5TIFdJVEhJTiAnZGF0YS1zY3JvbGwtdG9rZW5zJyBNVVNUIE5PVCBDT05UQUlOIENPTU1BUy5cbiAqXG4gKiBTb21lIG5vdGVzIGFib3V0IHRoZSBpbXBsZW1lbnRhdGlvbjpcbiAqXG4gKiBUaGUgc2F2ZWQgJ3Njcm9sbFN0YXRlJyBjYW4gZXhpc3QgaW4gb25lIG9mIHR3byBzdGF0ZXM6XG4gKlxuICogICAtIHN0dWNrQXRCb3R0b206ICh0aGUgZGVmYXVsdCwgYW5kIHJlc3RvcmVkIGJ5IHJlc2V0U2Nyb2xsU3RhdGUpOiB0aGVcbiAqICAgICB2aWV3cG9ydCBpcyBzY3JvbGxlZCBkb3duIGFzIGZhciBhcyBpdCBjYW4gYmUuIFdoZW4gdGhlIGNoaWxkcmVuIGFyZVxuICogICAgIHVwZGF0ZWQsIHRoZSBzY3JvbGwgcG9zaXRpb24gd2lsbCBiZSB1cGRhdGVkIHRvIGVuc3VyZSBpdCBpcyBzdGlsbCBhdFxuICogICAgIHRoZSBib3R0b20uXG4gKlxuICogICAtIGZpeGVkLCBpbiB3aGljaCB0aGUgdmlld3BvcnQgaXMgY29uY2VwdHVhbGx5IHRpZWQgYXQgYSBzcGVjaWZpYyBzY3JvbGxcbiAqICAgICBvZmZzZXQuICBXZSBkb24ndCBzYXZlIHRoZSBhYnNvbHV0ZSBzY3JvbGwgb2Zmc2V0LCBiZWNhdXNlIHRoYXQgd291bGQgYmVcbiAqICAgICBhZmZlY3RlZCBieSB3aW5kb3cgd2lkdGgsIHpvb20gbGV2ZWwsIGFtb3VudCBvZiBzY3JvbGxiYWNrLCBldGMuIEluc3RlYWRcbiAqICAgICB3ZSBzYXZlIGFuIGlkZW50aWZpZXIgZm9yIHRoZSBsYXN0IGZ1bGx5LXZpc2libGUgbWVzc2FnZSwgYW5kIHRoZSBudW1iZXJcbiAqICAgICBvZiBwaXhlbHMgdGhlIHdpbmRvdyB3YXMgc2Nyb2xsZWQgYmVsb3cgaXQgLSB3aGljaCBpcyBob3BlZnVsbHkgbmVhclxuICogICAgIGVub3VnaC5cbiAqXG4gKiBUaGUgJ3N0aWNreUJvdHRvbScgcHJvcGVydHkgY29udHJvbHMgdGhlIGJlaGF2aW91ciB3aGVuIHdlIHJlYWNoIHRoZSBib3R0b21cbiAqIG9mIHRoZSB3aW5kb3cgKGVpdGhlciB0aHJvdWdoIGEgdXNlci1pbml0aWF0ZWQgc2Nyb2xsLCBvciBieSBjYWxsaW5nXG4gKiBzY3JvbGxUb0JvdHRvbSkuIElmIHN0aWNreUJvdHRvbSBpcyBlbmFibGVkLCB0aGUgc2Nyb2xsU3RhdGUgd2lsbCBlbnRlclxuICogJ3N0dWNrQXRCb3R0b20nIHN0YXRlIC0gZW5zdXJpbmcgdGhhdCBuZXcgYWRkaXRpb25zIGNhdXNlIHRoZSB3aW5kb3cgdG9cbiAqIHNjcm9sbCBkb3duIGZ1cnRoZXIuIElmIHN0aWNreUJvdHRvbSBpcyBkaXNhYmxlZCwgd2UganVzdCBzYXZlIHRoZSBzY3JvbGxcbiAqIG9mZnNldCBhcyBub3JtYWwuXG4gKi9cblxuQHJlcGxhY2VhYmxlQ29tcG9uZW50KFwic3RydWN0dXJlcy5TY3JvbGxQYW5lbFwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2Nyb2xsUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHN0aWNreUJvdHRvbTogaWYgc2V0IHRvIHRydWUsIHRoZW4gb25jZSB0aGUgdXNlciBoaXRzIHRoZSBib3R0b20gb2ZcbiAgICAgICAgICogdGhlIGxpc3QsIGFueSBuZXcgY2hpbGRyZW4gYWRkZWQgdG8gdGhlIGxpc3Qgd2lsbCBjYXVzZSB0aGUgbGlzdCB0b1xuICAgICAgICAgKiBzY3JvbGwgZG93biB0byBzaG93IHRoZSBuZXcgZWxlbWVudCwgcmF0aGVyIHRoYW4gcHJlc2VydmluZyB0aGVcbiAgICAgICAgICogZXhpc3Rpbmcgdmlldy5cbiAgICAgICAgICovXG4gICAgICAgIHN0aWNreUJvdHRvbTogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogc3RhcnRBdEJvdHRvbTogaWYgc2V0IHRvIHRydWUsIHRoZSB2aWV3IGlzIGFzc3VtZWQgdG8gc3RhcnRcbiAgICAgICAgICogc2Nyb2xsZWQgdG8gdGhlIGJvdHRvbS5cbiAgICAgICAgICogWFhYOiBJdCdzIGxpa2VseSB0aGlzIGlzIHVubmVjZXNzYXJ5IGFuZCBjYW4gYmUgZGVyaXZlZCBmcm9tXG4gICAgICAgICAqIHN0aWNreUJvdHRvbSwgYnV0IEknbSBhZGRpbmcgYW4gZXh0cmEgcGFyYW1ldGVyIHRvIGVuc3VyZVxuICAgICAgICAgKiBiZWhhdmlvdXIgc3RheXMgdGhlIHNhbWUgZm9yIG90aGVyIHVzZXMgb2YgU2Nyb2xsUGFuZWwuXG4gICAgICAgICAqIElmIHNvLCBsZXQncyByZW1vdmUgdGhpcyBwYXJhbWV0ZXIgZG93biB0aGUgbGluZS5cbiAgICAgICAgICovXG4gICAgICAgIHN0YXJ0QXRCb3R0b206IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8qIG9uRmlsbFJlcXVlc3QoYmFja3dhcmRzKTogYSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgb24gc2Nyb2xsIHdoZW5cbiAgICAgICAgICogdGhlIHVzZXIgbmVhcnMgdGhlIHN0YXJ0IChiYWNrd2FyZHMgPSB0cnVlKSBvciBlbmQgKGJhY2t3YXJkcyA9XG4gICAgICAgICAqIGZhbHNlKSBvZiB0aGUgbGlzdC5cbiAgICAgICAgICpcbiAgICAgICAgICogVGhpcyBzaG91bGQgcmV0dXJuIGEgcHJvbWlzZTsgbm8gbW9yZSBjYWxscyB3aWxsIGJlIG1hZGUgdW50aWwgdGhlXG4gICAgICAgICAqIHByb21pc2UgY29tcGxldGVzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGUgcHJvbWlzZSBzaG91bGQgcmVzb2x2ZSB0byB0cnVlIGlmIHRoZXJlIGlzIG1vcmUgZGF0YSB0byBiZVxuICAgICAgICAgKiByZXRyaWV2ZWQgaW4gdGhpcyBkaXJlY3Rpb24gKGluIHdoaWNoIGNhc2Ugb25GaWxsUmVxdWVzdCBtYXkgYmVcbiAgICAgICAgICogY2FsbGVkIGFnYWluIGltbWVkaWF0ZWx5KSwgb3IgZmFsc2UgaWYgdGhlcmUgaXMgbm8gbW9yZSBkYXRhIGluIHRoaXNcbiAgICAgICAgICogZGlyZWN0b24gKGF0IHRoaXMgdGltZSkgLSB3aGljaCB3aWxsIHN0b3AgdGhlIHBhZ2luYXRpb24gY3ljbGUgdW50aWxcbiAgICAgICAgICogdGhlIHVzZXIgc2Nyb2xscyBhZ2Fpbi5cbiAgICAgICAgICovXG4gICAgICAgIG9uRmlsbFJlcXVlc3Q6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8qIG9uVW5maWxsUmVxdWVzdChiYWNrd2FyZHMpOiBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBvbiBzY3JvbGwgd2hlblxuICAgICAgICAgKiB0aGVyZSBhcmUgY2hpbGRyZW4gZWxlbWVudHMgdGhhdCBhcmUgZmFyIG91dCBvZiB2aWV3IGFuZCBjb3VsZCBiZSByZW1vdmVkXG4gICAgICAgICAqIHdpdGhvdXQgY2F1c2luZyBwYWdpbmF0aW9uIHRvIG9jY3VyLlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBhY2NlcHQgYSBib29sZWFuLCB3aGljaCBpcyB0cnVlIHRvIGluZGljYXRlIHRoZSBiYWNrL3RvcFxuICAgICAgICAgKiBvZiB0aGUgcGFuZWwgYW5kIGZhbHNlIG90aGVyd2lzZSwgYW5kIGEgc2Nyb2xsIHRva2VuLCB3aGljaCByZWZlcnMgdG8gdGhlXG4gICAgICAgICAqIGZpcnN0IGVsZW1lbnQgdG8gcmVtb3ZlIGlmIHJlbW92aW5nIGZyb20gdGhlIGZyb250L2JvdHRvbSwgYW5kIGxhc3QgZWxlbWVudFxuICAgICAgICAgKiB0byByZW1vdmUgaWYgcmVtb3ZpbmcgZnJvbSB0aGUgYmFjay90b3AuXG4gICAgICAgICAqL1xuICAgICAgICBvblVuZmlsbFJlcXVlc3Q6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8qIG9uU2Nyb2xsOiBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCB3aGVuZXZlciBhbnkgc2Nyb2xsIGhhcHBlbnMuXG4gICAgICAgICAqL1xuICAgICAgICBvblNjcm9sbDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogY2xhc3NOYW1lOiBjbGFzc25hbWVzIHRvIGFkZCB0byB0aGUgdG9wLWxldmVsIGRpdlxuICAgICAgICAgKi9cbiAgICAgICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8qIHN0eWxlOiBzdHlsZXMgdG8gYWRkIHRvIHRoZSB0b3AtbGV2ZWwgZGl2XG4gICAgICAgICAqL1xuICAgICAgICBzdHlsZTogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvKiByZXNpemVOb3RpZmllcjogUmVzaXplTm90aWZpZXIgdG8ga25vdyB3aGVuIG1pZGRsZSBjb2x1bW4gaGFzIGNoYW5nZWQgc2l6ZVxuICAgICAgICAgKi9cbiAgICAgICAgcmVzaXplTm90aWZpZXI6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgICAgICAgLyogZml4ZWRDaGlsZHJlbjogYWxsb3dzIGZvciBjaGlsZHJlbiB0byBiZSBwYXNzZWQgd2hpY2ggYXJlIHJlbmRlcmVkIG91dHNpZGVcbiAgICAgICAgICogb2YgdGhlIHdyYXBwZXJcbiAgICAgICAgICovXG4gICAgICAgIGZpeGVkQ2hpbGRyZW46IFByb3BUeXBlcy5ub2RlLFxuICAgIH07XG5cbiAgICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgICAgICBzdGlja3lCb3R0b206IHRydWUsXG4gICAgICAgIHN0YXJ0QXRCb3R0b206IHRydWUsXG4gICAgICAgIG9uRmlsbFJlcXVlc3Q6IGZ1bmN0aW9uKGJhY2t3YXJkcykgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTsgfSxcbiAgICAgICAgb25VbmZpbGxSZXF1ZXN0OiBmdW5jdGlvbihiYWNrd2FyZHMsIHNjcm9sbFRva2VuKSB7fSxcbiAgICAgICAgb25TY3JvbGw6IGZ1bmN0aW9uKCkge30sXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9wZW5kaW5nRmlsbFJlcXVlc3RzID0ge2I6IG51bGwsIGY6IG51bGx9O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyLm9uKFwibWlkZGxlUGFuZWxSZXNpemVkTm9pc3lcIiwgdGhpcy5vblJlc2l6ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc2V0U2Nyb2xsU3RhdGUoKTtcblxuICAgICAgICB0aGlzLl9pdGVtbGlzdCA9IGNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICAvLyBhZnRlciBhZGRpbmcgZXZlbnQgdGlsZXMsIHdlIG1heSBuZWVkIHRvIHR3ZWFrIHRoZSBzY3JvbGwgKGVpdGhlciB0b1xuICAgICAgICAvLyBrZWVwIGF0IHRoZSBib3R0b20gb2YgdGhlIHRpbWVsaW5lLCBvciB0byBtYWludGFpbiB0aGUgdmlldyBhZnRlclxuICAgICAgICAvLyBhZGRpbmcgZXZlbnRzIHRvIHRoZSB0b3ApLlxuICAgICAgICAvL1xuICAgICAgICAvLyBUaGlzIHdpbGwgYWxzbyByZS1jaGVjayB0aGUgZmlsbCBzdGF0ZSwgaW4gY2FzZSB0aGUgcGFnaW5hdGUgd2FzIGluYWRlcXVhdGVcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbCgpO1xuICAgICAgICB0aGlzLnVwZGF0ZVByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAgICAgLy8gc2V0IGEgYm9vbGVhbiB0byBzYXkgd2UndmUgYmVlbiB1bm1vdW50ZWQsIHdoaWNoIGFueSBwZW5kaW5nXG4gICAgICAgIC8vIHByb21pc2VzIGNhbiB1c2UgdG8gdGhyb3cgYXdheSB0aGVpciByZXN1bHRzLlxuICAgICAgICAvL1xuICAgICAgICAvLyAoV2UgY291bGQgdXNlIGlzTW91bnRlZCgpLCBidXQgZmFjZWJvb2sgaGF2ZSBkZXByZWNhdGVkIHRoYXQuKVxuICAgICAgICB0aGlzLnVubW91bnRlZCA9IHRydWU7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIucmVtb3ZlTGlzdGVuZXIoXCJtaWRkbGVQYW5lbFJlc2l6ZWROb2lzeVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU2Nyb2xsID0gZXYgPT4ge1xuICAgICAgICAvLyBza2lwIHNjcm9sbCBldmVudHMgY2F1c2VkIGJ5IHJlc2l6aW5nXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnJlc2l6ZU5vdGlmaWVyICYmIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIuaXNSZXNpemluZykgcmV0dXJuO1xuICAgICAgICBkZWJ1Z2xvZyhcIm9uU2Nyb2xsXCIsIHRoaXMuX2dldFNjcm9sbE5vZGUoKS5zY3JvbGxUb3ApO1xuICAgICAgICB0aGlzLl9zY3JvbGxUaW1lb3V0LnJlc3RhcnQoKTtcbiAgICAgICAgdGhpcy5fc2F2ZVNjcm9sbFN0YXRlKCk7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmVudFNocmlua2luZygpO1xuICAgICAgICB0aGlzLnByb3BzLm9uU2Nyb2xsKGV2KTtcbiAgICAgICAgdGhpcy5jaGVja0ZpbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICBvblJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgZGVidWdsb2coXCJvblJlc2l6ZVwiKTtcbiAgICAgICAgdGhpcy5jaGVja1Njcm9sbCgpO1xuICAgICAgICAvLyB1cGRhdGUgcHJldmVudFNocmlua2luZ1N0YXRlIGlmIHByZXNlbnRcbiAgICAgICAgaWYgKHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBhZnRlciBhbiB1cGRhdGUgdG8gdGhlIGNvbnRlbnRzIG9mIHRoZSBwYW5lbCwgY2hlY2sgdGhhdCB0aGUgc2Nyb2xsIGlzXG4gICAgLy8gd2hlcmUgaXQgb3VnaHQgdG8gYmUsIGFuZCBzZXQgb2ZmIHBhZ2luYXRpb24gcmVxdWVzdHMgaWYgbmVjZXNzYXJ5LlxuICAgIGNoZWNrU2Nyb2xsID0gKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZXN0b3JlU2F2ZWRTY3JvbGxTdGF0ZSgpO1xuICAgICAgICB0aGlzLmNoZWNrRmlsbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIC8vIHJldHVybiB0cnVlIGlmIHRoZSBjb250ZW50IGlzIGZ1bGx5IHNjcm9sbGVkIGRvd24gcmlnaHQgbm93OyBlbHNlIGZhbHNlLlxuICAgIC8vXG4gICAgLy8gbm90ZSB0aGF0IHRoaXMgaXMgaW5kZXBlbmRlbnQgb2YgdGhlICdzdHVja0F0Qm90dG9tJyBzdGF0ZSAtIGl0IGlzIHNpbXBseVxuICAgIC8vIGFib3V0IHdoZXRoZXIgdGhlIGNvbnRlbnQgaXMgc2Nyb2xsZWQgZG93biByaWdodCBub3csIGlycmVzcGVjdGl2ZSBvZlxuICAgIC8vIHdoZXRoZXIgaXQgd2lsbCBzdGF5IHRoYXQgd2F5IHdoZW4gdGhlIGNoaWxkcmVuIHVwZGF0ZS5cbiAgICBpc0F0Qm90dG9tID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBzbiA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgLy8gZnJhY3Rpb25hbCB2YWx1ZXMgKGJvdGggdG9vIGJpZyBhbmQgdG9vIHNtYWxsKVxuICAgICAgICAvLyBmb3Igc2Nyb2xsVG9wIGhhcHBlbiBvbiBjZXJ0YWluIGJyb3dzZXJzL3BsYXRmb3Jtc1xuICAgICAgICAvLyB3aGVuIHNjcm9sbGVkIGFsbCB0aGUgd2F5IGRvd24uIEUuZy4gQ2hyb21lIDcyIG9uIGRlYmlhbi5cbiAgICAgICAgLy8gc28gY2hlY2sgZGlmZmVyZW5jZSA8PSAxO1xuICAgICAgICByZXR1cm4gTWF0aC5hYnMoc24uc2Nyb2xsSGVpZ2h0IC0gKHNuLnNjcm9sbFRvcCArIHNuLmNsaWVudEhlaWdodCkpIDw9IDE7XG4gICAgfTtcblxuICAgIC8vIHJldHVybnMgdGhlIHZlcnRpY2FsIGhlaWdodCBpbiB0aGUgZ2l2ZW4gZGlyZWN0aW9uIHRoYXQgY2FuIGJlIHJlbW92ZWQgZnJvbVxuICAgIC8vIHRoZSBjb250ZW50IGJveCAod2hpY2ggaGFzIGEgaGVpZ2h0IG9mIHNjcm9sbEhlaWdodCwgc2VlIGNoZWNrRmlsbFN0YXRlKSB3aXRob3V0XG4gICAgLy8gcGFnaW5hdGlvbiBvY2N1cmluZy5cbiAgICAvL1xuICAgIC8vIHBhZGRpbmcqID0gVU5QQUdJTkFUSU9OX1BBRERJTkdcbiAgICAvL1xuICAgIC8vICMjIyBSZWdpb24gZGV0ZXJtaW5lZCBhcyBleGNlc3MuXG4gICAgLy9cbiAgICAvLyAgIC4tLS0tLS0tLS0uICAgICAgICAgICAgICAgICAgICAgICAgLSAgICAgICAgICAgICAgLVxuICAgIC8vICAgfCMjIyMjIyMjI3wgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gICB8IyMjIyMjIyMjfCAgIC0gICAgICAgICAgICAgICAgICAgIHwgIHNjcm9sbFRvcCAgIHxcbiAgICAvLyAgIHwgICAgICAgICB8ICAgfCBwYWRkaW5nKiAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gLi0rLS0tLS0tLS0tKy0uIC0gIC0gICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICBjbGllbnRIZWlnaHQgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyAuLSstLS0tLS0tLS0rLS4gICAgLSAgICAgICAgICAgICAgICAgLSAgICAgICAgICAgICAgfFxuICAgIC8vIHwgfCAgICAgICAgIHwgfCAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gfCB8ICAgICAgICAgfCB8ICAgIHwgIGNsaWVudEhlaWdodCAgICAgICAgICAgICAgICAgIHwgc2Nyb2xsSGVpZ2h0XG4gICAgLy8gfCB8ICAgICAgICAgfCB8ICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyBgLSstLS0tLS0tLS0rLScgICAgLSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgIGNsaWVudEhlaWdodCAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIGAtKy0tLS0tLS0tLSstJyAtICAtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gICB8ICAgICAgICAgfCAgIHwgcGFkZGluZyogICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwgICAgICAgICB8ICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCMjIyMjIyMjI3wgICAtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gICB8IyMjIyMjIyMjfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyAgIGAtLS0tLS0tLS0nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLVxuICAgIF9nZXRFeGNlc3NIZWlnaHQoYmFja3dhcmRzKSB7XG4gICAgICAgIGNvbnN0IHNuID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBjb25zdCBjb250ZW50SGVpZ2h0ID0gdGhpcy5fZ2V0TWVzc2FnZXNIZWlnaHQoKTtcbiAgICAgICAgY29uc3QgbGlzdEhlaWdodCA9IHRoaXMuX2dldExpc3RIZWlnaHQoKTtcbiAgICAgICAgY29uc3QgY2xpcHBlZEhlaWdodCA9IGNvbnRlbnRIZWlnaHQgLSBsaXN0SGVpZ2h0O1xuICAgICAgICBjb25zdCB1bmNsaXBwZWRTY3JvbGxUb3AgPSBzbi5zY3JvbGxUb3AgKyBjbGlwcGVkSGVpZ2h0O1xuXG4gICAgICAgIGlmIChiYWNrd2FyZHMpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmNsaXBwZWRTY3JvbGxUb3AgLSBzbi5jbGllbnRIZWlnaHQgLSBVTlBBR0lOQVRJT05fUEFERElORztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBjb250ZW50SGVpZ2h0IC0gKHVuY2xpcHBlZFNjcm9sbFRvcCArIDIqc24uY2xpZW50SGVpZ2h0KSAtIFVOUEFHSU5BVElPTl9QQURESU5HO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgdGhlIHNjcm9sbCBzdGF0ZSBhbmQgc2VuZCBvdXQgYmFja2ZpbGwgcmVxdWVzdHMgaWYgbmVjZXNzYXJ5LlxuICAgIGNoZWNrRmlsbFN0YXRlID0gYXN5bmMgKGRlcHRoPTApID0+IHtcbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc0ZpcnN0Q2FsbCA9IGRlcHRoID09PSAwO1xuICAgICAgICBjb25zdCBzbiA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcblxuICAgICAgICAvLyBpZiB0aGVyZSBpcyBsZXNzIHRoYW4gYSBzY3JlZW5mdWwgb2YgbWVzc2FnZXMgYWJvdmUgb3IgYmVsb3cgdGhlXG4gICAgICAgIC8vIHZpZXdwb3J0LCB0cnkgdG8gZ2V0IHNvbWUgbW9yZSBtZXNzYWdlcy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gc2Nyb2xsVG9wIGlzIHRoZSBudW1iZXIgb2YgcGl4ZWxzIGJldHdlZW4gdGhlIHRvcCBvZiB0aGUgY29udGVudCBhbmRcbiAgICAgICAgLy8gICAgIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAvL1xuICAgICAgICAvLyBzY3JvbGxIZWlnaHQgaXMgdGhlIHRvdGFsIGhlaWdodCBvZiB0aGUgY29udGVudC5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gY2xpZW50SGVpZ2h0IGlzIHRoZSBoZWlnaHQgb2YgdGhlIHZpZXdwb3J0IChleGNsdWRpbmcgYm9yZGVycyxcbiAgICAgICAgLy8gbWFyZ2lucywgYW5kIHNjcm9sbGJhcnMpLlxuICAgICAgICAvL1xuICAgICAgICAvL1xuICAgICAgICAvLyAgIC4tLS0tLS0tLS0uICAgICAgICAgIC0gICAgICAgICAgICAgICAgIC1cbiAgICAgICAgLy8gICB8ICAgICAgICAgfCAgICAgICAgICB8ICBzY3JvbGxUb3AgICAgICB8XG4gICAgICAgIC8vIC4tKy0tLS0tLS0tLSstLiAgICAtICAgLSAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gfCB8ICAgICAgICAgfCB8ICAgIHwgIGNsaWVudEhlaWdodCAgICAgICB8IHNjcm9sbEhlaWdodFxuICAgICAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gYC0rLS0tLS0tLS0tKy0nICAgIC0gICAgICAgICAgICAgICAgICAgICB8XG4gICAgICAgIC8vICAgfCAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyAgIHwgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gICBgLS0tLS0tLS0tJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAtXG4gICAgICAgIC8vXG5cbiAgICAgICAgLy8gYXMgZmlsbGluZyBpcyBhc3luYyBhbmQgcmVjdXJzaXZlLFxuICAgICAgICAvLyBkb24ndCBhbGxvdyBtb3JlIHRoYW4gMSBjaGFpbiBvZiBjYWxscyBjb25jdXJyZW50bHlcbiAgICAgICAgLy8gZG8gbWFrZSBhIG5vdGUgd2hlbiBhIG5ldyByZXF1ZXN0IGNvbWVzIGluIHdoaWxlIGFscmVhZHkgcnVubmluZyBvbmUsXG4gICAgICAgIC8vIHNvIHdlIGNhbiB0cmlnZ2VyIGEgbmV3IGNoYWluIG9mIGNhbGxzIG9uY2UgZG9uZS5cbiAgICAgICAgaWYgKGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNGaWxsaW5nKSB7XG4gICAgICAgICAgICAgICAgZGVidWdsb2coXCJfaXNGaWxsaW5nOiBub3QgZW50ZXJpbmcgd2hpbGUgcmVxdWVzdCBpcyBvbmdvaW5nLCBtYXJraW5nIGZvciBhIHN1YnNlcXVlbnQgcmVxdWVzdFwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9maWxsUmVxdWVzdFdoaWxlUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVidWdsb2coXCJfaXNGaWxsaW5nOiBzZXR0aW5nXCIpO1xuICAgICAgICAgICAgdGhpcy5faXNGaWxsaW5nID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgZmlyc3RUaWxlID0gaXRlbWxpc3QgJiYgaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRUb3AgPSBmaXJzdFRpbGUgJiYgZmlyc3RUaWxlLm9mZnNldFRvcDtcbiAgICAgICAgY29uc3QgZmlsbFByb21pc2VzID0gW107XG5cbiAgICAgICAgLy8gaWYgc2Nyb2xsVG9wIGdldHMgdG8gMSBzY3JlZW4gZnJvbSB0aGUgdG9wIG9mIHRoZSBmaXJzdCB0aWxlLFxuICAgICAgICAvLyB0cnkgYmFja3dhcmQgZmlsbGluZ1xuICAgICAgICBpZiAoIWZpcnN0VGlsZSB8fCAoc24uc2Nyb2xsVG9wIC0gY29udGVudFRvcCkgPCBzbi5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gYmFjay1maWxsXG4gICAgICAgICAgICBmaWxsUHJvbWlzZXMucHVzaCh0aGlzLl9tYXliZUZpbGwoZGVwdGgsIHRydWUpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiBzY3JvbGxUb3AgZ2V0cyB0byAyIHNjcmVlbnMgZnJvbSB0aGUgZW5kIChzbyAxIHNjcmVlbiBiZWxvdyB2aWV3cG9ydCksXG4gICAgICAgIC8vIHRyeSBmb3J3YXJkIGZpbGxpbmdcbiAgICAgICAgaWYgKChzbi5zY3JvbGxIZWlnaHQgLSBzbi5zY3JvbGxUb3ApIDwgc24uY2xpZW50SGVpZ2h0ICogMikge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBmb3J3YXJkLWZpbGxcbiAgICAgICAgICAgIGZpbGxQcm9taXNlcy5wdXNoKHRoaXMuX21heWJlRmlsbChkZXB0aCwgZmFsc2UpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxsUHJvbWlzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKGZpbGxQcm9taXNlcyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzRmlyc3RDYWxsKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIl9pc0ZpbGxpbmc6IGNsZWFyaW5nXCIpO1xuICAgICAgICAgICAgdGhpcy5faXNGaWxsaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fZmlsbFJlcXVlc3RXaGlsZVJ1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZpbGxSZXF1ZXN0V2hpbGVSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRmlsbFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gY2hlY2sgaWYgdW5maWxsaW5nIGlzIHBvc3NpYmxlIGFuZCBzZW5kIGFuIHVuZmlsbCByZXF1ZXN0IGlmIG5lY2Vzc2FyeVxuICAgIF9jaGVja1VuZmlsbFN0YXRlKGJhY2t3YXJkcykge1xuICAgICAgICBsZXQgZXhjZXNzSGVpZ2h0ID0gdGhpcy5fZ2V0RXhjZXNzSGVpZ2h0KGJhY2t3YXJkcyk7XG4gICAgICAgIGlmIChleGNlc3NIZWlnaHQgPD0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgb3JpZ0V4Y2Vzc0hlaWdodCA9IGV4Y2Vzc0hlaWdodDtcblxuICAgICAgICBjb25zdCB0aWxlcyA9IHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQuY2hpbGRyZW47XG5cbiAgICAgICAgLy8gVGhlIHNjcm9sbCB0b2tlbiBvZiB0aGUgZmlyc3QvbGFzdCB0aWxlIHRvIGJlIHVucGFnaW5hdGVkXG4gICAgICAgIGxldCBtYXJrZXJTY3JvbGxUb2tlbiA9IG51bGw7XG5cbiAgICAgICAgLy8gU3VidHJhY3QgaGVpZ2h0cyBvZiB0aWxlcyB0byBzaW11bGF0ZSB0aGUgdGlsZXMgYmVpbmcgdW5wYWdpbmF0ZWQgdW50aWwgdGhlXG4gICAgICAgIC8vIGV4Y2VzcyBoZWlnaHQgaXMgbGVzcyB0aGFuIHRoZSBoZWlnaHQgb2YgdGhlIG5leHQgdGlsZSB0byBzdWJ0cmFjdC4gVGhpc1xuICAgICAgICAvLyBwcmV2ZW50cyBleGNlc3NIZWlnaHQgYmVjb21pbmcgbmVnYXRpdmUsIHdoaWNoIGNvdWxkIGxlYWQgdG8gZnV0dXJlXG4gICAgICAgIC8vIHBhZ2luYXRpb24uXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIGJhY2t3YXJkcyBpcyB0cnVlLCB3ZSB1bnBhZ2luYXRlIChyZW1vdmUpIHRpbGVzIGZyb20gdGhlIGJhY2sgKHRvcCkuXG4gICAgICAgIGxldCB0aWxlO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aWxlID0gdGlsZXNbYmFja3dhcmRzID8gaSA6IHRpbGVzLmxlbmd0aCAtIDEgLSBpXTtcbiAgICAgICAgICAgIC8vIFN1YnRyYWN0IGhlaWdodCBvZiB0aWxlIGFzIGlmIGl0IHdlcmUgdW5wYWdpbmF0ZWRcbiAgICAgICAgICAgIGV4Y2Vzc0hlaWdodCAtPSB0aWxlLmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIC8vSWYgcmVtb3ZpbmcgdGhlIHRpbGUgd291bGQgbGVhZCB0byBmdXR1cmUgcGFnaW5hdGlvbiwgYnJlYWsgYmVmb3JlIHNldHRpbmcgc2Nyb2xsIHRva2VuXG4gICAgICAgICAgICBpZiAodGlsZS5jbGllbnRIZWlnaHQgPiBleGNlc3NIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRoZSB0aWxlIG1heSBub3QgaGF2ZSBhIHNjcm9sbCB0b2tlbiwgc28gZ3VhcmQgaXRcbiAgICAgICAgICAgIGlmICh0aWxlLmRhdGFzZXQuc2Nyb2xsVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgbWFya2VyU2Nyb2xsVG9rZW4gPSB0aWxlLmRhdGFzZXQuc2Nyb2xsVG9rZW5zLnNwbGl0KCcsJylbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWFya2VyU2Nyb2xsVG9rZW4pIHtcbiAgICAgICAgICAgIC8vIFVzZSBhIGRlYm91bmNlciB0byBwcmV2ZW50IG11bHRpcGxlIHVuZmlsbCBjYWxscyBpbiBxdWljayBzdWNjZXNzaW9uXG4gICAgICAgICAgICAvLyBUaGlzIGlzIHRvIG1ha2UgdGhlIHVuZmlsbGluZyBwcm9jZXNzIGxlc3MgYWdncmVzc2l2ZVxuICAgICAgICAgICAgaWYgKHRoaXMuX3VuZmlsbERlYm91bmNlcikge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl91bmZpbGxEZWJvdW5jZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fdW5maWxsRGVib3VuY2VyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdW5maWxsRGVib3VuY2VyID0gbnVsbDtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcInVuZmlsbGluZyBub3dcIiwgYmFja3dhcmRzLCBvcmlnRXhjZXNzSGVpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uVW5maWxsUmVxdWVzdChiYWNrd2FyZHMsIG1hcmtlclNjcm9sbFRva2VuKTtcbiAgICAgICAgICAgIH0sIFVORklMTF9SRVFVRVNUX0RFQk9VTkNFX01TKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIGFscmVhZHkgYSBwZW5kaW5nIGZpbGwgcmVxdWVzdC4gSWYgbm90LCBzZXQgb25lIG9mZi5cbiAgICBfbWF5YmVGaWxsKGRlcHRoLCBiYWNrd2FyZHMpIHtcbiAgICAgICAgY29uc3QgZGlyID0gYmFja3dhcmRzID8gJ2InIDogJ2YnO1xuICAgICAgICBpZiAodGhpcy5fcGVuZGluZ0ZpbGxSZXF1ZXN0c1tkaXJdKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIkFscmVhZHkgYSBcIitkaXIrXCIgZmlsbCBpbiBwcm9ncmVzcyAtIG5vdCBzdGFydGluZyBhbm90aGVyXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVidWdsb2coXCJzdGFydGluZyBcIitkaXIrXCIgZmlsbFwiKTtcblxuICAgICAgICAvLyBvbkZpbGxSZXF1ZXN0IGNhbiBlbmQgdXAgY2FsbGluZyB1cyByZWN1cnNpdmVseSAodmlhIG9uU2Nyb2xsXG4gICAgICAgIC8vIGV2ZW50cykgc28gbWFrZSBzdXJlIHdlIHNldCB0aGlzIGJlZm9yZSBmaXJpbmcgb2ZmIHRoZSBjYWxsLlxuICAgICAgICB0aGlzLl9wZW5kaW5nRmlsbFJlcXVlc3RzW2Rpcl0gPSB0cnVlO1xuXG4gICAgICAgIC8vIHdhaXQgMW1zIGJlZm9yZSBwYWdpbmF0aW5nLCBiZWNhdXNlIG90aGVyd2lzZVxuICAgICAgICAvLyB0aGlzIHdpbGwgYmxvY2sgdGhlIHNjcm9sbCBldmVudCBoYW5kbGVyIGZvciArNzAwbXNcbiAgICAgICAgLy8gaWYgbWVzc2FnZXMgYXJlIGFscmVhZHkgY2FjaGVkIGluIG1lbW9yeSxcbiAgICAgICAgLy8gVGhpcyB3b3VsZCBjYXVzZSBqdW1waW5nIHRvIGhhcHBlbiBvbiBDaHJvbWUvbWFjT1MuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMSkpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25GaWxsUmVxdWVzdChiYWNrd2FyZHMpO1xuICAgICAgICB9KS5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3BlbmRpbmdGaWxsUmVxdWVzdHNbZGlyXSA9IGZhbHNlO1xuICAgICAgICB9KS50aGVuKChoYXNNb3JlUmVzdWx0cykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVW5wYWdpbmF0ZSBvbmNlIGZpbGxpbmcgaXMgY29tcGxldGVcbiAgICAgICAgICAgIHRoaXMuX2NoZWNrVW5maWxsU3RhdGUoIWJhY2t3YXJkcyk7XG5cbiAgICAgICAgICAgIGRlYnVnbG9nKFwiXCIrZGlyK1wiIGZpbGwgY29tcGxldGU7IGhhc01vcmVSZXN1bHRzOlwiK2hhc01vcmVSZXN1bHRzKTtcbiAgICAgICAgICAgIGlmIChoYXNNb3JlUmVzdWx0cykge1xuICAgICAgICAgICAgICAgIC8vIGZ1cnRoZXIgcGFnaW5hdGlvbiByZXF1ZXN0cyBoYXZlIGJlZW4gZGlzYWJsZWQgdW50aWwgbm93LCBzb1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgdGltZSB0byBjaGVjayB0aGUgZmlsbCBzdGF0ZSBhZ2FpbiBpbiBjYXNlIHRoZSBwYWdpbmF0aW9uXG4gICAgICAgICAgICAgICAgLy8gd2FzIGluc3VmZmljaWVudC5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jaGVja0ZpbGxTdGF0ZShkZXB0aCArIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBnZXQgdGhlIGN1cnJlbnQgc2Nyb2xsIHN0YXRlLiBUaGlzIHJldHVybnMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZ1xuICAgICAqIHByb3BlcnRpZXM6XG4gICAgICpcbiAgICAgKiBib29sZWFuIHN0dWNrQXRCb3R0b206IHRydWUgaWYgd2UgYXJlIHRyYWNraW5nIHRoZSBib3R0b20gb2YgdGhlXG4gICAgICogICBzY3JvbGwuIGZhbHNlIGlmIHdlIGFyZSB0cmFja2luZyBhIHBhcnRpY3VsYXIgY2hpbGQuXG4gICAgICpcbiAgICAgKiBzdHJpbmcgdHJhY2tlZFNjcm9sbFRva2VuOiB1bmRlZmluZWQgaWYgc3R1Y2tBdEJvdHRvbSBpcyB0cnVlOyBpZiBpdCBpc1xuICAgICAqICAgZmFsc2UsIHRoZSBmaXJzdCB0b2tlbiBpbiBkYXRhLXNjcm9sbC10b2tlbnMgb2YgdGhlIGNoaWxkIHdoaWNoIHdlIGFyZVxuICAgICAqICAgdHJhY2tpbmcuXG4gICAgICpcbiAgICAgKiBudW1iZXIgYm90dG9tT2Zmc2V0OiB1bmRlZmluZWQgaWYgc3R1Y2tBdEJvdHRvbSBpcyB0cnVlOyBpZiBpdCBpcyBmYWxzZSxcbiAgICAgKiAgIHRoZSBudW1iZXIgb2YgcGl4ZWxzIHRoZSBib3R0b20gb2YgdGhlIHRyYWNrZWQgY2hpbGQgaXMgYWJvdmUgdGhlXG4gICAgICogICBib3R0b20gb2YgdGhlIHNjcm9sbCBwYW5lbC5cbiAgICAgKi9cbiAgICBnZXRTY3JvbGxTdGF0ZSA9ICgpID0+IHRoaXMuc2Nyb2xsU3RhdGU7XG5cbiAgICAvKiByZXNldCB0aGUgc2F2ZWQgc2Nyb2xsIHN0YXRlLlxuICAgICAqXG4gICAgICogVGhpcyBpcyB1c2VmdWwgaWYgdGhlIGxpc3QgaXMgYmVpbmcgcmVwbGFjZWQsIGFuZCB5b3UgZG9uJ3Qgd2FudCB0b1xuICAgICAqIHByZXNlcnZlIHNjcm9sbCBldmVuIGlmIG5ldyBjaGlsZHJlbiBoYXBwZW4gdG8gaGF2ZSB0aGUgc2FtZSBzY3JvbGxcbiAgICAgKiB0b2tlbnMgYXMgb2xkIG9uZXMuXG4gICAgICpcbiAgICAgKiBUaGlzIHdpbGwgY2F1c2UgdGhlIHZpZXdwb3J0IHRvIGJlIHNjcm9sbGVkIGRvd24gdG8gdGhlIGJvdHRvbSBvbiB0aGVcbiAgICAgKiBuZXh0IHVwZGF0ZSBvZiB0aGUgY2hpbGQgbGlzdC4gVGhpcyBpcyBkaWZmZXJlbnQgdG8gc2Nyb2xsVG9Cb3R0b20oKSxcbiAgICAgKiB3aGljaCB3b3VsZCBzYXZlIHRoZSBjdXJyZW50IGJvdHRvbS1tb3N0IGNoaWxkIGFzIHRoZSBhY3RpdmUgb25lIChzbyBpc1xuICAgICAqIG5vIHVzZSBpZiBubyBjaGlsZHJlbiBleGlzdCB5ZXQsIG9yIGlmIHlvdSBhcmUgYWJvdXQgdG8gcmVwbGFjZSB0aGVcbiAgICAgKiBjaGlsZCBsaXN0LilcbiAgICAgKi9cbiAgICByZXNldFNjcm9sbFN0YXRlID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNjcm9sbFN0YXRlID0ge1xuICAgICAgICAgICAgc3R1Y2tBdEJvdHRvbTogdGhpcy5wcm9wcy5zdGFydEF0Qm90dG9tLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9ib3R0b21Hcm93dGggPSAwO1xuICAgICAgICB0aGlzLl9wYWdlcyA9IDA7XG4gICAgICAgIHRoaXMuX3Njcm9sbFRpbWVvdXQgPSBuZXcgVGltZXIoMTAwKTtcbiAgICAgICAgdGhpcy5faGVpZ2h0VXBkYXRlSW5Qcm9ncmVzcyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBqdW1wIHRvIHRoZSB0b3Agb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Ub3AgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2dldFNjcm9sbE5vZGUoKS5zY3JvbGxUb3AgPSAwO1xuICAgICAgICB0aGlzLl9zYXZlU2Nyb2xsU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICoganVtcCB0byB0aGUgYm90dG9tIG9mIHRoZSBjb250ZW50LlxuICAgICAqL1xuICAgIHNjcm9sbFRvQm90dG9tID0gKCkgPT4ge1xuICAgICAgICAvLyB0aGUgZWFzaWVzdCB3YXkgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHNjcm9sbCBzdGF0ZSBpcyBjb3JyZWN0bHlcbiAgICAgICAgLy8gc2F2ZWQgaXMgdG8gZG8gdGhlIHNjcm9sbCwgdGhlbiBzYXZlIHRoZSB1cGRhdGVkIHN0YXRlLiAoQ2FsY3VsYXRpbmdcbiAgICAgICAgLy8gaXQgb3Vyc2VsdmVzIGlzIGhhcmQsIGFuZCB3ZSBjYW4ndCByZWx5IG9uIGFuIG9uU2Nyb2xsIGNhbGxiYWNrXG4gICAgICAgIC8vIGhhcHBlbmluZywgc2luY2UgdGhlcmUgbWF5IGJlIG5vIHVzZXItdmlzaWJsZSBjaGFuZ2UgaGVyZSkuXG4gICAgICAgIGNvbnN0IHNuID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBzbi5zY3JvbGxUb3AgPSBzbi5zY3JvbGxIZWlnaHQ7XG4gICAgICAgIHRoaXMuX3NhdmVTY3JvbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYWdlIHVwL2Rvd24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbXVsdDogLTEgdG8gcGFnZSB1cCwgKzEgdG8gcGFnZSBkb3duXG4gICAgICovXG4gICAgc2Nyb2xsUmVsYXRpdmUgPSBtdWx0ID0+IHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsTm9kZSA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgY29uc3QgZGVsdGEgPSBtdWx0ICogc2Nyb2xsTm9kZS5jbGllbnRIZWlnaHQgKiAwLjk7XG4gICAgICAgIHNjcm9sbE5vZGUuc2Nyb2xsQnkoMCwgZGVsdGEpO1xuICAgICAgICB0aGlzLl9zYXZlU2Nyb2xsU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2Nyb2xsIHVwL2Rvd24gaW4gcmVzcG9uc2UgdG8gYSBzY3JvbGwga2V5XG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2IHRoZSBrZXlib2FyZCBldmVudFxuICAgICAqL1xuICAgIGhhbmRsZVNjcm9sbEtleSA9IGV2ID0+IHtcbiAgICAgICAgY29uc3Qgcm9vbUFjdGlvbiA9IGdldEtleUJpbmRpbmdzTWFuYWdlcigpLmdldFJvb21BY3Rpb24oZXYpO1xuICAgICAgICBzd2l0Y2ggKHJvb21BY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5TY3JvbGxVcDpcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFJlbGF0aXZlKC0xKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUm9vbUFjdGlvbi5Sb29tU2Nyb2xsRG93bjpcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFJlbGF0aXZlKDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBSb29tQWN0aW9uLkp1bXBUb0ZpcnN0TWVzc2FnZTpcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvVG9wKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFJvb21BY3Rpb24uSnVtcFRvTGF0ZXN0TWVzc2FnZTpcbiAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogU2Nyb2xsIHRoZSBwYW5lbCB0byBicmluZyB0aGUgRE9NIG5vZGUgd2l0aCB0aGUgc2Nyb2xsIHRva2VuXG4gICAgICogYHNjcm9sbFRva2VuYCBpbnRvIHZpZXcuXG4gICAgICpcbiAgICAgKiBvZmZzZXRCYXNlIGdpdmVzIHRoZSByZWZlcmVuY2UgcG9pbnQgZm9yIHRoZSBwaXhlbE9mZnNldC4gMCBtZWFucyB0aGVcbiAgICAgKiB0b3Agb2YgdGhlIGNvbnRhaW5lciwgMSBtZWFucyB0aGUgYm90dG9tLCBhbmQgZnJhY3Rpb25hbCB2YWx1ZXMgbWVhblxuICAgICAqIHNvbWV3aGVyZSBpbiB0aGUgbWlkZGxlLiBJZiBvbWl0dGVkLCBpdCBkZWZhdWx0cyB0byAwLlxuICAgICAqXG4gICAgICogcGl4ZWxPZmZzZXQgZ2l2ZXMgdGhlIG51bWJlciBvZiBwaXhlbHMgKmFib3ZlKiB0aGUgb2Zmc2V0QmFzZSB0aGF0IHRoZVxuICAgICAqIG5vZGUgKHNwZWNpZmljYWxseSwgdGhlIGJvdHRvbSBvZiBpdCkgd2lsbCBiZSBwb3NpdGlvbmVkLiBJZiBvbWl0dGVkLCBpdFxuICAgICAqIGRlZmF1bHRzIHRvIDAuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Ub2tlbiA9IChzY3JvbGxUb2tlbiwgcGl4ZWxPZmZzZXQsIG9mZnNldEJhc2UpID0+IHtcbiAgICAgICAgcGl4ZWxPZmZzZXQgPSBwaXhlbE9mZnNldCB8fCAwO1xuICAgICAgICBvZmZzZXRCYXNlID0gb2Zmc2V0QmFzZSB8fCAwO1xuXG4gICAgICAgIC8vIHNldCB0aGUgdHJhY2tlZFNjcm9sbFRva2VuIHNvIHdlIGNhbiBnZXQgdGhlIG5vZGUgdGhyb3VnaCBfZ2V0VHJhY2tlZE5vZGVcbiAgICAgICAgdGhpcy5zY3JvbGxTdGF0ZSA9IHtcbiAgICAgICAgICAgIHN0dWNrQXRCb3R0b206IGZhbHNlLFxuICAgICAgICAgICAgdHJhY2tlZFNjcm9sbFRva2VuOiBzY3JvbGxUb2tlbixcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgdHJhY2tlZE5vZGUgPSB0aGlzLl9nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICBjb25zdCBzY3JvbGxOb2RlID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBpZiAodHJhY2tlZE5vZGUpIHtcbiAgICAgICAgICAgIC8vIHNldCB0aGUgc2Nyb2xsVG9wIHRvIHRoZSBwb3NpdGlvbiB3ZSB3YW50LlxuICAgICAgICAgICAgLy8gbm90ZSB0aG91Z2gsIHRoYXQgdGhpcyBtaWdodCBub3Qgc3VjY2VlZCBpZiB0aGUgY29tYmluYXRpb24gb2Ygb2Zmc2V0QmFzZSBhbmQgcGl4ZWxPZmZzZXRcbiAgICAgICAgICAgIC8vIHdvdWxkIHBvc2l0aW9uIHRoZSB0cmFja2VkTm9kZSB0b3dhcmRzIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgLy8gVGhpcyBiZWNhdXNlIHdoZW4gc2V0dGluZyB0aGUgc2Nyb2xsVG9wIG9ubHkgMTAgb3Igc28gZXZlbnRzIG1pZ2h0IGJlIGxvYWRlZCxcbiAgICAgICAgICAgIC8vIG5vdCBnaXZpbmcgZW5vdWdoIGNvbnRlbnQgYmVsb3cgdGhlIHRyYWNrZWROb2RlIHRvIHNjcm9sbCBkb3dud2FyZHNcbiAgICAgICAgICAgIC8vIGVub3VnaCBzbyBpdCBlbmRzIHVwIGluIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgZGVidWdsb2coXCJzY3JvbGxUb2tlbjogc2V0dGluZyBzY3JvbGxUb3BcIiwge29mZnNldEJhc2UsIHBpeGVsT2Zmc2V0LCBvZmZzZXRUb3A6IHRyYWNrZWROb2RlLm9mZnNldFRvcH0pO1xuICAgICAgICAgICAgc2Nyb2xsTm9kZS5zY3JvbGxUb3AgPSAodHJhY2tlZE5vZGUub2Zmc2V0VG9wIC0gKHNjcm9sbE5vZGUuY2xpZW50SGVpZ2h0ICogb2Zmc2V0QmFzZSkpICsgcGl4ZWxPZmZzZXQ7XG4gICAgICAgICAgICB0aGlzLl9zYXZlU2Nyb2xsU3RhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBfc2F2ZVNjcm9sbFN0YXRlKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zdGlja3lCb3R0b20gJiYgdGhpcy5pc0F0Qm90dG9tKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsU3RhdGUgPSB7IHN0dWNrQXRCb3R0b206IHRydWUgfTtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwic2F2ZWQgc3R1Y2tBdEJvdHRvbSBzdGF0ZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjcm9sbE5vZGUgPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0Qm90dG9tID0gc2Nyb2xsTm9kZS5zY3JvbGxIZWlnaHQgLSAoc2Nyb2xsTm9kZS5zY3JvbGxUb3AgKyBzY3JvbGxOb2RlLmNsaWVudEhlaWdodCk7XG5cbiAgICAgICAgY29uc3QgaXRlbWxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBtZXNzYWdlcyA9IGl0ZW1saXN0LmNoaWxkcmVuO1xuICAgICAgICBsZXQgbm9kZSA9IG51bGw7XG5cbiAgICAgICAgLy8gVE9ETzogZG8gYSBiaW5hcnkgc2VhcmNoIGhlcmUsIGFzIGl0ZW1zIGFyZSBzb3J0ZWQgYnkgb2Zmc2V0VG9wXG4gICAgICAgIC8vIGxvb3AgYmFja3dhcmRzLCBmcm9tIGJvdHRvbS1tb3N0IG1lc3NhZ2UgKGFzIHRoYXQgaXMgdGhlIG1vc3QgY29tbW9uIGNhc2UpXG4gICAgICAgIGZvciAobGV0IGkgPSBtZXNzYWdlcy5sZW5ndGgtMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgIGlmICghbWVzc2FnZXNbaV0uZGF0YXNldC5zY3JvbGxUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBtZXNzYWdlc1tpXTtcbiAgICAgICAgICAgIC8vIGJyZWFrIGF0IHRoZSBmaXJzdCBtZXNzYWdlIChjb21pbmcgZnJvbSB0aGUgYm90dG9tKVxuICAgICAgICAgICAgLy8gdGhhdCBoYXMgaXQncyBvZmZzZXRUb3AgYWJvdmUgdGhlIGJvdHRvbSBvZiB0aGUgdmlld3BvcnQuXG4gICAgICAgICAgICBpZiAodGhpcy5fdG9wRnJvbUJvdHRvbShub2RlKSA+IHZpZXdwb3J0Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgLy8gVXNlIHRoaXMgbm9kZSBhcyB0aGUgc2Nyb2xsVG9rZW5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJ1bmFibGUgdG8gc2F2ZSBzY3JvbGwgc3RhdGU6IGZvdW5kIG5vIGNoaWxkcmVuIGluIHRoZSB2aWV3cG9ydFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzY3JvbGxUb2tlbiA9IG5vZGUuZGF0YXNldC5zY3JvbGxUb2tlbnMuc3BsaXQoJywnKVswXTtcbiAgICAgICAgZGVidWdsb2coXCJzYXZpbmcgYW5jaG9yZWQgc2Nyb2xsIHN0YXRlIHRvIG1lc3NhZ2VcIiwgbm9kZSAmJiBub2RlLmlubmVyVGV4dCwgc2Nyb2xsVG9rZW4pO1xuICAgICAgICBjb25zdCBib3R0b21PZmZzZXQgPSB0aGlzLl90b3BGcm9tQm90dG9tKG5vZGUpO1xuICAgICAgICB0aGlzLnNjcm9sbFN0YXRlID0ge1xuICAgICAgICAgICAgc3R1Y2tBdEJvdHRvbTogZmFsc2UsXG4gICAgICAgICAgICB0cmFja2VkTm9kZTogbm9kZSxcbiAgICAgICAgICAgIHRyYWNrZWRTY3JvbGxUb2tlbjogc2Nyb2xsVG9rZW4sXG4gICAgICAgICAgICBib3R0b21PZmZzZXQ6IGJvdHRvbU9mZnNldCxcbiAgICAgICAgICAgIHBpeGVsT2Zmc2V0OiBib3R0b21PZmZzZXQgLSB2aWV3cG9ydEJvdHRvbSwgLy9uZWVkZWQgZm9yIHJlc3RvcmluZyB0aGUgc2Nyb2xsIHBvc2l0aW9uIHdoZW4gY29taW5nIGJhY2sgdG8gdGhlIHJvb21cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYyBfcmVzdG9yZVNhdmVkU2Nyb2xsU3RhdGUoKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gdGhpcy5zY3JvbGxTdGF0ZTtcblxuICAgICAgICBpZiAoc2Nyb2xsU3RhdGUuc3R1Y2tBdEJvdHRvbSkge1xuICAgICAgICAgICAgY29uc3Qgc24gPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgICAgICBpZiAoc24uc2Nyb2xsVG9wICE9PSBzbi5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzbi5zY3JvbGxUb3AgPSBzbi5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsU3RhdGUudHJhY2tlZFNjcm9sbFRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCBpdGVtbGlzdCA9IHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQ7XG4gICAgICAgICAgICBjb25zdCB0cmFja2VkTm9kZSA9IHRoaXMuX2dldFRyYWNrZWROb2RlKCk7XG4gICAgICAgICAgICBpZiAodHJhY2tlZE5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdCb3R0b21PZmZzZXQgPSB0aGlzLl90b3BGcm9tQm90dG9tKHRyYWNrZWROb2RlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBib3R0b21EaWZmID0gbmV3Qm90dG9tT2Zmc2V0IC0gc2Nyb2xsU3RhdGUuYm90dG9tT2Zmc2V0O1xuICAgICAgICAgICAgICAgIHRoaXMuX2JvdHRvbUdyb3d0aCArPSBib3R0b21EaWZmO1xuICAgICAgICAgICAgICAgIHNjcm9sbFN0YXRlLmJvdHRvbU9mZnNldCA9IG5ld0JvdHRvbU9mZnNldDtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBgJHt0aGlzLl9nZXRMaXN0SGVpZ2h0KCl9cHhgO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtbGlzdC5zdHlsZS5oZWlnaHQgIT09IG5ld0hlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtbGlzdC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwiYmFsYW5jaW5nIGhlaWdodCBiZWNhdXNlIG1lc3NhZ2VzIGJlbG93IHZpZXdwb3J0IGdyZXcgYnlcIiwgYm90dG9tRGlmZik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLl9oZWlnaHRVcGRhdGVJblByb2dyZXNzKSB7XG4gICAgICAgICAgICB0aGlzLl9oZWlnaHRVcGRhdGVJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5fdXBkYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2hlaWdodFVwZGF0ZUluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwibm90IHVwZGF0aW5nIGhlaWdodCBiZWNhdXNlIHJlcXVlc3QgYWxyZWFkeSBpbiBwcm9ncmVzc1wiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIG5lZWQgYSBiZXR0ZXIgbmFtZSB0aGF0IGFsc28gaW5kaWNhdGVzIHRoaXMgd2lsbCBjaGFuZ2Ugc2Nyb2xsVG9wPyBSZWJhbGFuY2UgaGVpZ2h0PyBSZXZlYWwgY29udGVudD9cbiAgICBhc3luYyBfdXBkYXRlSGVpZ2h0KCkge1xuICAgICAgICAvLyB3YWl0IHVudGlsIHVzZXIgaGFzIHN0b3BwZWQgc2Nyb2xsaW5nXG4gICAgICAgIGlmICh0aGlzLl9zY3JvbGxUaW1lb3V0LmlzUnVubmluZygpKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCB3YWl0aW5nIGZvciBzY3JvbGxpbmcgdG8gZW5kIC4uLiBcIik7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLl9zY3JvbGxUaW1lb3V0LmZpbmlzaGVkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCBnZXR0aW5nIHN0cmFpZ2h0IHRvIGJ1c2luZXNzLCBubyBzY3JvbGxpbmcgZ29pbmcgb24uXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgbWlnaHQgaGF2ZSB1bm1vdW50ZWQgc2luY2UgdGhlIHRpbWVyIGZpbmlzaGVkLCBzbyBhYm9ydCBpZiBzby5cbiAgICAgICAgaWYgKHRoaXMudW5tb3VudGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzbiA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgY29uc3QgaXRlbWxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBjb250ZW50SGVpZ2h0ID0gdGhpcy5fZ2V0TWVzc2FnZXNIZWlnaHQoKTtcbiAgICAgICAgY29uc3QgbWluSGVpZ2h0ID0gc24uY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBNYXRoLm1heChtaW5IZWlnaHQsIGNvbnRlbnRIZWlnaHQpO1xuICAgICAgICB0aGlzLl9wYWdlcyA9IE1hdGguY2VpbChoZWlnaHQgLyBQQUdFX1NJWkUpO1xuICAgICAgICB0aGlzLl9ib3R0b21Hcm93dGggPSAwO1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBgJHt0aGlzLl9nZXRMaXN0SGVpZ2h0KCl9cHhgO1xuXG4gICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gdGhpcy5zY3JvbGxTdGF0ZTtcbiAgICAgICAgaWYgKHNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIGlmIChpdGVtbGlzdC5zdHlsZS5oZWlnaHQgIT09IG5ld0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGl0ZW1saXN0LnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzbi5zY3JvbGxUb3AgIT09IHNuLnNjcm9sbEhlaWdodCkge1xuICAgICAgICAgICAgICAgIHNuLnNjcm9sbFRvcCA9IHNuLnNjcm9sbEhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlYnVnbG9nKFwidXBkYXRlSGVpZ2h0IHRvXCIsIG5ld0hlaWdodCk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2Nyb2xsU3RhdGUudHJhY2tlZFNjcm9sbFRva2VuKSB7XG4gICAgICAgICAgICBjb25zdCB0cmFja2VkTm9kZSA9IHRoaXMuX2dldFRyYWNrZWROb2RlKCk7XG4gICAgICAgICAgICAvLyBpZiB0aGUgdGltZWxpbmUgaGFzIGJlZW4gcmVsb2FkZWRcbiAgICAgICAgICAgIC8vIHRoaXMgY2FuIGJlIGNhbGxlZCBiZWZvcmUgc2Nyb2xsVG9Cb3R0b20gb3Igd2hhdGV2ZXIgaGFzIGJlZW4gY2FsbGVkXG4gICAgICAgICAgICAvLyBzbyBkb24ndCBkbyBhbnl0aGluZyBpZiB0aGUgbm9kZSBoYXMgZGlzYXBwZWFyZWQgZnJvbVxuICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnRseSBmaWxsZWQgcGllY2Ugb2YgdGhlIHRpbWVsaW5lXG4gICAgICAgICAgICBpZiAodHJhY2tlZE5vZGUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGRUb3AgPSB0cmFja2VkTm9kZS5vZmZzZXRUb3A7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1saXN0LnN0eWxlLmhlaWdodCAhPT0gbmV3SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW1saXN0LnN0eWxlLmhlaWdodCA9IG5ld0hlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3VG9wID0gdHJhY2tlZE5vZGUub2Zmc2V0VG9wO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvcERpZmYgPSBuZXdUb3AgLSBvbGRUb3A7XG4gICAgICAgICAgICAgICAgLy8gaW1wb3J0YW50IHRvIHNjcm9sbCBieSBhIHJlbGF0aXZlIGFtb3VudCBhc1xuICAgICAgICAgICAgICAgIC8vIHJlYWRpbmcgc2Nyb2xsVG9wIGFuZCB0aGVuIHNldHRpbmcgaXQgbWlnaHRcbiAgICAgICAgICAgICAgICAvLyB5aWVsZCBvdXQgb2YgZGF0ZSB2YWx1ZXMgYW5kIGNhdXNlIGEganVtcFxuICAgICAgICAgICAgICAgIC8vIHdoZW4gc2V0dGluZyBpdFxuICAgICAgICAgICAgICAgIHNuLnNjcm9sbEJ5KDAsIHRvcERpZmYpO1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwidXBkYXRlSGVpZ2h0IHRvXCIsIHtuZXdIZWlnaHQsIHRvcERpZmZ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRUcmFja2VkTm9kZSgpIHtcbiAgICAgICAgY29uc3Qgc2Nyb2xsU3RhdGUgPSB0aGlzLnNjcm9sbFN0YXRlO1xuICAgICAgICBjb25zdCB0cmFja2VkTm9kZSA9IHNjcm9sbFN0YXRlLnRyYWNrZWROb2RlO1xuXG4gICAgICAgIGlmICghdHJhY2tlZE5vZGUgfHwgIXRyYWNrZWROb2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCBub2RlO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZXMgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50LmNoaWxkcmVuO1xuICAgICAgICAgICAgY29uc3Qgc2Nyb2xsVG9rZW4gPSBzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW47XG5cbiAgICAgICAgICAgIGZvciAobGV0IGkgPSBtZXNzYWdlcy5sZW5ndGgtMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICAgICAgLy8gJ2RhdGEtc2Nyb2xsLXRva2VucycgaXMgYSBET01TdHJpbmcgb2YgY29tbWEtc2VwYXJhdGVkIHNjcm9sbCB0b2tlbnNcbiAgICAgICAgICAgICAgICAvLyBUaGVyZSBtaWdodCBvbmx5IGJlIG9uZSBzY3JvbGwgdG9rZW5cbiAgICAgICAgICAgICAgICBpZiAobS5kYXRhc2V0LnNjcm9sbFRva2VucyAmJlxuICAgICAgICAgICAgICAgICAgICBtLmRhdGFzZXQuc2Nyb2xsVG9rZW5zLnNwbGl0KCcsJykuaW5kZXhPZihzY3JvbGxUb2tlbikgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSBtO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobm9kZSkge1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwiaGFkIHRvIGZpbmQgdHJhY2tlZCBub2RlIGFnYWluIGZvciBcIiArIHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY3JvbGxTdGF0ZS50cmFja2VkTm9kZSA9IG5vZGU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNjcm9sbFN0YXRlLnRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIk5vIG5vZGUgd2l0aCA7ICdcIitzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4rXCInXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNjcm9sbFN0YXRlLnRyYWNrZWROb2RlO1xuICAgIH1cblxuICAgIF9nZXRMaXN0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYm90dG9tR3Jvd3RoICsgKHRoaXMuX3BhZ2VzICogUEFHRV9TSVpFKTtcbiAgICB9XG5cbiAgICBfZ2V0TWVzc2FnZXNIZWlnaHQoKSB7XG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgbGFzdE5vZGUgPSBpdGVtbGlzdC5sYXN0RWxlbWVudENoaWxkO1xuICAgICAgICBjb25zdCBsYXN0Tm9kZUJvdHRvbSA9IGxhc3ROb2RlID8gbGFzdE5vZGUub2Zmc2V0VG9wICsgbGFzdE5vZGUuY2xpZW50SGVpZ2h0IDogMDtcbiAgICAgICAgY29uc3QgZmlyc3ROb2RlVG9wID0gaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQgPyBpdGVtbGlzdC5maXJzdEVsZW1lbnRDaGlsZC5vZmZzZXRUb3AgOiAwO1xuICAgICAgICAvLyAxOCBpcyBpdGVtbGlzdCBwYWRkaW5nXG4gICAgICAgIHJldHVybiBsYXN0Tm9kZUJvdHRvbSAtIGZpcnN0Tm9kZVRvcCArICgxOCAqIDIpO1xuICAgIH1cblxuICAgIF90b3BGcm9tQm90dG9tKG5vZGUpIHtcbiAgICAgICAgLy8gY3VycmVudCBjYXBwZWQgaGVpZ2h0IC0gZGlzdGFuY2UgZnJvbSB0b3AgPSBkaXN0YW5jZSBmcm9tIGJvdHRvbSBvZiBjb250YWluZXIgdG8gdG9wIG9mIHRyYWNrZWQgZWxlbWVudFxuICAgICAgICByZXR1cm4gdGhpcy5faXRlbWxpc3QuY3VycmVudC5jbGllbnRIZWlnaHQgLSBub2RlLm9mZnNldFRvcDtcbiAgICB9XG5cbiAgICAvKiBnZXQgdGhlIERPTSBub2RlIHdoaWNoIGhhcyB0aGUgc2Nyb2xsVG9wIHByb3BlcnR5IHdlIGNhcmUgYWJvdXQgZm9yIG91clxuICAgICAqIG1lc3NhZ2UgcGFuZWwuXG4gICAgICovXG4gICAgX2dldFNjcm9sbE5vZGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgLy8gdGhpcyBzaG91bGRuJ3QgaGFwcGVuLCBidXQgd2hlbiBpdCBkb2VzLCB0dXJuIHRoZSBOUEUgaW50b1xuICAgICAgICAgICAgLy8gc29tZXRoaW5nIG1vcmUgbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjcm9sbFBhbmVsLl9nZXRTY3JvbGxOb2RlIGNhbGxlZCB3aGVuIHVubW91bnRlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fZGl2U2Nyb2xsKSB7XG4gICAgICAgICAgICAvLyBMaWtld2lzZSwgd2Ugc2hvdWxkIGhhdmUgdGhlIHJlZiBieSB0aGlzIHBvaW50LCBidXQgaWYgbm90XG4gICAgICAgICAgICAvLyB0dXJuIHRoZSBOUEUgaW50byBzb21ldGhpbmcgbWVhbmluZ2Z1bC5cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNjcm9sbFBhbmVsLl9nZXRTY3JvbGxOb2RlIGNhbGxlZCBiZWZvcmUgQXV0b0hpZGVTY3JvbGxiYXIgcmVmIGNvbGxlY3RlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXZTY3JvbGw7XG4gICAgfVxuXG4gICAgX2NvbGxlY3RTY3JvbGwgPSBkaXZTY3JvbGwgPT4ge1xuICAgICAgICB0aGlzLl9kaXZTY3JvbGwgPSBkaXZTY3JvbGw7XG4gICAgfTtcblxuICAgIC8qKlxuICAgIE1hcmsgdGhlIGJvdHRvbSBvZmZzZXQgb2YgdGhlIGxhc3QgdGlsZSBzbyB3ZSBjYW4gYmFsYW5jZSBpdCBvdXQgd2hlblxuICAgIGFueXRoaW5nIGJlbG93IGl0IGNoYW5nZXMsIGJ5IGNhbGxpbmcgdXBkYXRlUHJldmVudFNocmlua2luZywgdG8ga2VlcFxuICAgIHRoZSBzYW1lIG1pbmltdW0gYm90dG9tIG9mZnNldCwgZWZmZWN0aXZlbHkgcHJldmVudGluZyB0aGUgdGltZWxpbmUgdG8gc2hyaW5rLlxuICAgICovXG4gICAgcHJldmVudFNocmlua2luZyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCB0aWxlcyA9IG1lc3NhZ2VMaXN0ICYmIG1lc3NhZ2VMaXN0LmNoaWxkcmVuO1xuICAgICAgICBpZiAoIW1lc3NhZ2VMaXN0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxhc3RUaWxlTm9kZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IHRpbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gdGlsZXNbaV07XG4gICAgICAgICAgICBpZiAobm9kZS5kYXRhc2V0LnNjcm9sbFRva2Vucykge1xuICAgICAgICAgICAgICAgIGxhc3RUaWxlTm9kZSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFsYXN0VGlsZU5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsZWFyUHJldmVudFNocmlua2luZygpO1xuICAgICAgICBjb25zdCBvZmZzZXRGcm9tQm90dG9tID0gbWVzc2FnZUxpc3QuY2xpZW50SGVpZ2h0IC0gKGxhc3RUaWxlTm9kZS5vZmZzZXRUb3AgKyBsYXN0VGlsZU5vZGUuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5wcmV2ZW50U2hyaW5raW5nU3RhdGUgPSB7XG4gICAgICAgICAgICBvZmZzZXRGcm9tQm90dG9tOiBvZmZzZXRGcm9tQm90dG9tLFxuICAgICAgICAgICAgb2Zmc2V0Tm9kZTogbGFzdFRpbGVOb2RlLFxuICAgICAgICB9O1xuICAgICAgICBkZWJ1Z2xvZyhcInByZXZlbnQgc2hyaW5raW5nLCBsYXN0IHRpbGUgXCIsIG9mZnNldEZyb21Cb3R0b20sIFwicHggZnJvbSBib3R0b21cIik7XG4gICAgfTtcblxuICAgIC8qKiBDbGVhciBzaHJpbmtpbmcgcHJldmVudGlvbi4gVXNlZCBpbnRlcm5hbGx5LCBhbmQgd2hlbiB0aGUgdGltZWxpbmUgaXMgcmVsb2FkZWQuICovXG4gICAgY2xlYXJQcmV2ZW50U2hyaW5raW5nID0gKCkgPT4ge1xuICAgICAgICBjb25zdCBtZXNzYWdlTGlzdCA9IHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IGJhbGFuY2VFbGVtZW50ID0gbWVzc2FnZUxpc3QgJiYgbWVzc2FnZUxpc3QucGFyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKGJhbGFuY2VFbGVtZW50KSBiYWxhbmNlRWxlbWVudC5zdHlsZS5wYWRkaW5nQm90dG9tID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcmV2ZW50U2hyaW5raW5nU3RhdGUgPSBudWxsO1xuICAgICAgICBkZWJ1Z2xvZyhcInByZXZlbnQgc2hyaW5raW5nIGNsZWFyZWRcIik7XG4gICAgfTtcblxuICAgIC8qKlxuICAgIHVwZGF0ZSB0aGUgY29udGFpbmVyIHBhZGRpbmcgdG8gYmFsYW5jZVxuICAgIHRoZSBib3R0b20gb2Zmc2V0IG9mIHRoZSBsYXN0IHRpbGUgc2luY2VcbiAgICBwcmV2ZW50U2hyaW5raW5nIHdhcyBjYWxsZWQuXG4gICAgQ2xlYXJzIHRoZSBwcmV2ZW50LXNocmlua2luZyBzdGF0ZSBvbmVzIHRoZSBvZmZzZXRcbiAgICBmcm9tIHRoZSBib3R0b20gb2YgdGhlIG1hcmtlZCB0aWxlIGdyb3dzIGxhcmdlciB0aGFuXG4gICAgd2hhdCBpdCB3YXMgd2hlbiBtYXJraW5nLlxuICAgICovXG4gICAgdXBkYXRlUHJldmVudFNocmlua2luZyA9ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBzbiA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gdGhpcy5zY3JvbGxTdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VMaXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgICAgIGNvbnN0IHtvZmZzZXROb2RlLCBvZmZzZXRGcm9tQm90dG9tfSA9IHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlO1xuICAgICAgICAgICAgLy8gZWxlbWVudCB1c2VkIHRvIHNldCBwYWRkaW5nQm90dG9tIHRvIGJhbGFuY2UgdGhlIHR5cGluZyBub3RpZnMgZGlzYXBwZWFyaW5nXG4gICAgICAgICAgICBjb25zdCBiYWxhbmNlRWxlbWVudCA9IG1lc3NhZ2VMaXN0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAvLyBpZiB0aGUgb2Zmc2V0Tm9kZSBnb3QgdW5tb3VudGVkLCBjbGVhclxuICAgICAgICAgICAgbGV0IHNob3VsZENsZWFyID0gIW9mZnNldE5vZGUucGFyZW50RWxlbWVudDtcbiAgICAgICAgICAgIC8vIGFsc28gaWYgMjAwcHggZnJvbSBib3R0b21cbiAgICAgICAgICAgIGlmICghc2hvdWxkQ2xlYXIgJiYgIXNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzcGFjZUJlbG93Vmlld3BvcnQgPSBzbi5zY3JvbGxIZWlnaHQgLSAoc24uc2Nyb2xsVG9wICsgc24uY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBzaG91bGRDbGVhciA9IHNwYWNlQmVsb3dWaWV3cG9ydCA+PSAyMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyB0cnkgdXBkYXRpbmcgaWYgbm90IGNsZWFyaW5nXG4gICAgICAgICAgICBpZiAoIXNob3VsZENsZWFyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudE9mZnNldCA9IG1lc3NhZ2VMaXN0LmNsaWVudEhlaWdodCAtIChvZmZzZXROb2RlLm9mZnNldFRvcCArIG9mZnNldE5vZGUuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXREaWZmID0gb2Zmc2V0RnJvbUJvdHRvbSAtIGN1cnJlbnRPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldERpZmYgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhbGFuY2VFbGVtZW50LnN0eWxlLnBhZGRpbmdCb3R0b20gPSBgJHtvZmZzZXREaWZmfXB4YDtcbiAgICAgICAgICAgICAgICAgICAgZGVidWdsb2coXCJ1cGRhdGUgcHJldmVudCBzaHJpbmtpbmcgXCIsIG9mZnNldERpZmYsIFwicHggZnJvbSBib3R0b21cIik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXREaWZmIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBzaG91bGRDbGVhciA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNob3VsZENsZWFyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhclByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIFRPRE86IHRoZSBjbGFzc25hbWVzIG9uIHRoZSBkaXYgYW5kIG9sIGNvdWxkIGRvIHdpdGggYmVpbmcgdXBkYXRlZCB0b1xuICAgICAgICAvLyByZWZsZWN0IHRoZSBmYWN0IHRoYXQgd2UgZG9uJ3QgbmVjZXNzYXJpbHkgY29udGFpbiBhIGxpc3Qgb2YgbWVzc2FnZXMuXG4gICAgICAgIC8vIGl0J3Mgbm90IG9idmlvdXMgd2h5IHdlIGhhdmUgYSBzZXBhcmF0ZSBkaXYgYW5kIG9sIGFueXdheS5cblxuICAgICAgICAvLyBnaXZlIHRoZSA8b2w+IGFuIGV4cGxpY2l0IHJvbGU9bGlzdCBiZWNhdXNlIFNhZmFyaStWb2ljZU92ZXIgc2VlbXMgdG8gdGhpbmsgYW4gb3JkZXJlZC1saXN0IHdpdGhcbiAgICAgICAgLy8gbGlzdC1zdHlsZS10eXBlOiBub25lOyBpcyBubyBsb25nZXIgYSBsaXN0XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXJcbiAgICAgICAgICAgICAgICB3cmFwcGVkUmVmPXt0aGlzLl9jb2xsZWN0U2Nyb2xsfVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YG14X1Njcm9sbFBhbmVsICR7dGhpcy5wcm9wcy5jbGFzc05hbWV9YH1cbiAgICAgICAgICAgICAgICBzdHlsZT17dGhpcy5wcm9wcy5zdHlsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZml4ZWRDaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Sb29tVmlld19tZXNzYWdlTGlzdFdyYXBwZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPG9sIHJlZj17dGhpcy5faXRlbWxpc3R9IGNsYXNzTmFtZT1cIm14X1Jvb21WaWV3X01lc3NhZ2VMaXN0XCIgYXJpYS1saXZlPVwicG9saXRlXCIgcm9sZT1cImxpc3RcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgICAgIDwvb2w+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICApO1xuICAgIH1cbn1cbiJdfQ==