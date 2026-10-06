"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _Keyboard = require("../../Keyboard");

var _Timer = _interopRequireDefault(require("../../utils/Timer"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

/*
Copyright 2015, 2016 OpenMarket Ltd

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


class ScrollPanel extends _react.default.Component {
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

      const delta = mult * scrollNode.clientHeight * 0.5;
      scrollNode.scrollBy(0, delta);

      this._saveScrollState();
    });
    (0, _defineProperty2.default)(this, "handleScrollKey", ev => {
      switch (ev.key) {
        case _Keyboard.Key.PAGE_UP:
          if (!ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            this.scrollRelative(-1);
          }

          break;

        case _Keyboard.Key.PAGE_DOWN:
          if (!ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            this.scrollRelative(1);
          }

          break;

        case _Keyboard.Key.HOME:
          if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            this.scrollToTop();
          }

          break;

        case _Keyboard.Key.END:
          if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
            this.scrollToBottom();
          }

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

}

exports.default = ScrollPanel;
(0, _defineProperty2.default)(ScrollPanel, "propTypes", {
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
});
(0, _defineProperty2.default)(ScrollPanel, "defaultProps", {
  stickyBottom: true,
  startAtBottom: true,
  onFillRequest: function (backwards) {
    return Promise.resolve(false);
  },
  onUnfillRequest: function (backwards, scrollToken) {},
  onScroll: function () {}
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvU2Nyb2xsUGFuZWwuanMiXSwibmFtZXMiOlsiREVCVUdfU0NST0xMIiwiVU5QQUdJTkFUSU9OX1BBRERJTkciLCJVTkZJTExfUkVRVUVTVF9ERUJPVU5DRV9NUyIsIlBBR0VfU0laRSIsImRlYnVnbG9nIiwiY29uc29sZSIsImxvZyIsImJpbmQiLCJTY3JvbGxQYW5lbCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiY29uc3RydWN0b3IiLCJwcm9wcyIsImV2IiwicmVzaXplTm90aWZpZXIiLCJpc1Jlc2l6aW5nIiwiX2dldFNjcm9sbE5vZGUiLCJzY3JvbGxUb3AiLCJfc2Nyb2xsVGltZW91dCIsInJlc3RhcnQiLCJfc2F2ZVNjcm9sbFN0YXRlIiwidXBkYXRlUHJldmVudFNocmlua2luZyIsIm9uU2Nyb2xsIiwiY2hlY2tGaWxsU3RhdGUiLCJjaGVja1Njcm9sbCIsInByZXZlbnRTaHJpbmtpbmdTdGF0ZSIsInByZXZlbnRTaHJpbmtpbmciLCJ1bm1vdW50ZWQiLCJfcmVzdG9yZVNhdmVkU2Nyb2xsU3RhdGUiLCJzbiIsIk1hdGgiLCJhYnMiLCJzY3JvbGxIZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJkZXB0aCIsImlzRmlyc3RDYWxsIiwiX2lzRmlsbGluZyIsIl9maWxsUmVxdWVzdFdoaWxlUnVubmluZyIsIml0ZW1saXN0IiwiX2l0ZW1saXN0IiwiY3VycmVudCIsImZpcnN0VGlsZSIsImZpcnN0RWxlbWVudENoaWxkIiwiY29udGVudFRvcCIsIm9mZnNldFRvcCIsImZpbGxQcm9taXNlcyIsInB1c2giLCJfbWF5YmVGaWxsIiwibGVuZ3RoIiwiUHJvbWlzZSIsImFsbCIsImVyciIsImVycm9yIiwic2Nyb2xsU3RhdGUiLCJzdHVja0F0Qm90dG9tIiwic3RhcnRBdEJvdHRvbSIsIl9ib3R0b21Hcm93dGgiLCJfcGFnZXMiLCJUaW1lciIsIl9oZWlnaHRVcGRhdGVJblByb2dyZXNzIiwibXVsdCIsInNjcm9sbE5vZGUiLCJkZWx0YSIsInNjcm9sbEJ5Iiwia2V5IiwiS2V5IiwiUEFHRV9VUCIsImN0cmxLZXkiLCJzaGlmdEtleSIsImFsdEtleSIsIm1ldGFLZXkiLCJzY3JvbGxSZWxhdGl2ZSIsIlBBR0VfRE9XTiIsIkhPTUUiLCJzY3JvbGxUb1RvcCIsIkVORCIsInNjcm9sbFRvQm90dG9tIiwic2Nyb2xsVG9rZW4iLCJwaXhlbE9mZnNldCIsIm9mZnNldEJhc2UiLCJ0cmFja2VkU2Nyb2xsVG9rZW4iLCJ0cmFja2VkTm9kZSIsIl9nZXRUcmFja2VkTm9kZSIsImRpdlNjcm9sbCIsIl9kaXZTY3JvbGwiLCJtZXNzYWdlTGlzdCIsInRpbGVzIiwiY2hpbGRyZW4iLCJsYXN0VGlsZU5vZGUiLCJpIiwibm9kZSIsImRhdGFzZXQiLCJzY3JvbGxUb2tlbnMiLCJjbGVhclByZXZlbnRTaHJpbmtpbmciLCJvZmZzZXRGcm9tQm90dG9tIiwib2Zmc2V0Tm9kZSIsImJhbGFuY2VFbGVtZW50IiwicGFyZW50RWxlbWVudCIsInN0eWxlIiwicGFkZGluZ0JvdHRvbSIsInNob3VsZENsZWFyIiwic3BhY2VCZWxvd1ZpZXdwb3J0IiwiY3VycmVudE9mZnNldCIsIm9mZnNldERpZmYiLCJfcGVuZGluZ0ZpbGxSZXF1ZXN0cyIsImIiLCJmIiwib24iLCJvblJlc2l6ZSIsInJlc2V0U2Nyb2xsU3RhdGUiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudERpZFVwZGF0ZSIsImNvbXBvbmVudFdpbGxVbm1vdW50IiwicmVtb3ZlTGlzdGVuZXIiLCJfZ2V0RXhjZXNzSGVpZ2h0IiwiYmFja3dhcmRzIiwiY29udGVudEhlaWdodCIsIl9nZXRNZXNzYWdlc0hlaWdodCIsImxpc3RIZWlnaHQiLCJfZ2V0TGlzdEhlaWdodCIsImNsaXBwZWRIZWlnaHQiLCJ1bmNsaXBwZWRTY3JvbGxUb3AiLCJfY2hlY2tVbmZpbGxTdGF0ZSIsImV4Y2Vzc0hlaWdodCIsIm9yaWdFeGNlc3NIZWlnaHQiLCJtYXJrZXJTY3JvbGxUb2tlbiIsInRpbGUiLCJzcGxpdCIsIl91bmZpbGxEZWJvdW5jZXIiLCJjbGVhclRpbWVvdXQiLCJzZXRUaW1lb3V0Iiwib25VbmZpbGxSZXF1ZXN0IiwiZGlyIiwicmVzb2x2ZSIsInRoZW4iLCJvbkZpbGxSZXF1ZXN0IiwiZmluYWxseSIsImhhc01vcmVSZXN1bHRzIiwic3RpY2t5Qm90dG9tIiwiaXNBdEJvdHRvbSIsInZpZXdwb3J0Qm90dG9tIiwibWVzc2FnZXMiLCJfdG9wRnJvbUJvdHRvbSIsImlubmVyVGV4dCIsImJvdHRvbU9mZnNldCIsIm5ld0JvdHRvbU9mZnNldCIsImJvdHRvbURpZmYiLCJuZXdIZWlnaHQiLCJoZWlnaHQiLCJfdXBkYXRlSGVpZ2h0IiwiaXNSdW5uaW5nIiwiZmluaXNoZWQiLCJtaW5IZWlnaHQiLCJtYXgiLCJjZWlsIiwib2xkVG9wIiwibmV3VG9wIiwidG9wRGlmZiIsIm0iLCJpbmRleE9mIiwibGFzdE5vZGUiLCJsYXN0RWxlbWVudENoaWxkIiwibGFzdE5vZGVCb3R0b20iLCJmaXJzdE5vZGVUb3AiLCJFcnJvciIsInJlbmRlciIsIl9jb2xsZWN0U2Nyb2xsIiwiY2xhc3NOYW1lIiwiZml4ZWRDaGlsZHJlbiIsIlByb3BUeXBlcyIsImJvb2wiLCJmdW5jIiwic3RyaW5nIiwib2JqZWN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBZ0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQXBCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFRQSxNQUFNQSxZQUFZLEdBQUcsS0FBckIsQyxDQUVBO0FBQ0E7O0FBQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBN0IsQyxDQUNBO0FBQ0E7O0FBQ0EsTUFBTUMsMEJBQTBCLEdBQUcsR0FBbkMsQyxDQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUNBLE1BQU1DLFNBQVMsR0FBRyxHQUFsQjtBQUVBLElBQUlDLFFBQUo7O0FBQ0EsSUFBSUosWUFB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bkQ7QUFJbEJGLEVBQUFBLGVBQWUsRUFBRSxVQUFTaEIsU0FBVCxFQUFvQnRDLFdBQXBCLEVBQWlDLENBQUUsQ0FKbEM7QUFLbEJ2RCxFQUFBQSxRQUFRLEVBQUUsWUFBVyxDQUFFO0FBTEwsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgS2V5IH0gZnJvbSAnLi4vLi4vS2V5Ym9hcmQnO1xuaW1wb3J0IFRpbWVyIGZyb20gJy4uLy4uL3V0aWxzL1RpbWVyJztcbmltcG9ydCBBdXRvSGlkZVNjcm9sbGJhciBmcm9tIFwiLi9BdXRvSGlkZVNjcm9sbGJhclwiO1xuXG5jb25zdCBERUJVR19TQ1JPTEwgPSBmYWxzZTtcblxuLy8gVGhlIGFtb3VudCBvZiBleHRyYSBzY3JvbGwgZGlzdGFuY2UgdG8gYWxsb3cgcHJpb3IgdG8gdW5maWxsaW5nLlxuLy8gU2VlIF9nZXRFeGNlc3NIZWlnaHQuXG5jb25zdCBVTlBBR0lOQVRJT05fUEFERElORyA9IDYwMDA7XG4vLyBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWJvdW5jZSBjYWxscyB0byBvblVuZmlsbFJlcXVlc3QsIHRvIHByZXZlbnRcbi8vIG1hbnkgc2Nyb2xsIGV2ZW50cyBjYXVzaW5nIG1hbnkgdW5maWxsaW5nIHJlcXVlc3RzLlxuY29uc3QgVU5GSUxMX1JFUVVFU1RfREVCT1VOQ0VfTVMgPSAyMDA7XG4vLyBfdXBkYXRlSGVpZ2h0IG1ha2VzIHRoZSBoZWlnaHQgYSBjZWlsZWQgbXVsdGlwbGUgb2YgdGhpcyBzbyB3ZVxuLy8gZG9uJ3QgaGF2ZSB0byB1cGRhdGUgdGhlIGhlaWdodCB0b28gb2Z0ZW4uIEl0IGFsc28gYWxsb3dzIHRoZSB1c2VyXG4vLyB0byBzY3JvbGwgcGFzdCB0aGUgcGFnaW5hdGlvbiBzcGlubmVyIGEgYml0IHNvIHRoZXkgZG9uJ3QgZmVlbCBibG9ja2VkIHNvXG4vLyBtdWNoIHdoaWxlIHRoZSBjb250ZW50IGxvYWRzLlxuY29uc3QgUEFHRV9TSVpFID0gNDAwO1xuXG5sZXQgZGVidWdsb2c7XG5pZiAoREVCVUdfU0NST0xMKSB7XG4gICAgLy8gdXNpbmcgYmluZCBtZWFucyB0aGF0IHdlIGdldCB0byBrZWVwIHVzZWZ1bCBsaW5lIG51bWJlcnMgaW4gdGhlIGNvbnNvbGVcbiAgICBkZWJ1Z2xvZyA9IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSwgXCJTY3JvbGxQYW5lbCBkZWJ1Z2xvZzpcIik7XG59IGVsc2Uge1xuICAgIGRlYnVnbG9nID0gZnVuY3Rpb24oKSB7fTtcbn1cblxuLyogVGhpcyBjb21wb25lbnQgaW1wbGVtZW50cyBhbiBpbnRlbGxpZ2VudCBzY3JvbGxpbmcgbGlzdC5cbiAqXG4gKiBJdCB3cmFwcyBhIGxpc3Qgb2YgPGxpPiBjaGlsZHJlbjsgd2hlbiBpdGVtcyBhcmUgYWRkZWQgdG8gdGhlIHN0YXJ0IG9yIGVuZFxuICogb2YgdGhlIGxpc3QsIHRoZSBzY3JvbGwgcG9zaXRpb24gaXMgdXBkYXRlZCBzbyB0aGF0IHRoZSB1c2VyIHN0aWxsIHNlZXMgdGhlXG4gKiBzYW1lIHBvc2l0aW9uIGluIHRoZSBsaXN0LlxuICpcbiAqIEl0IGFsc28gcHJvdmlkZXMgYSBob29rIHdoaWNoIGFsbG93cyBwYXJlbnRzIHRvIHByb3ZpZGUgbW9yZSBsaXN0IGVsZW1lbnRzXG4gKiB3aGVuIHdlIGdldCBjbG9zZSB0byB0aGUgc3RhcnQgb3IgZW5kIG9mIHRoZSBsaXN0LlxuICpcbiAqIEVhY2ggY2hpbGQgZWxlbWVudCBzaG91bGQgaGF2ZSBhICdkYXRhLXNjcm9sbC10b2tlbnMnLiBUaGlzIHN0cmluZyBvZlxuICogY29tbWEtc2VwYXJhdGVkIHRva2VucyBtYXkgY29udGFpbiBhIHNpbmdsZSB0b2tlbiBvciBtYW55LCB3aGVyZSBtYW55IGluZGljYXRlc1xuICogdGhhdCB0aGUgZWxlbWVudCBjb250YWlucyBlbGVtZW50cyB0aGF0IGhhdmUgc2Nyb2xsIHRva2VucyB0aGVtc2VsdmVzLiBUaGUgZmlyc3RcbiAqIHRva2VuIGluICdkYXRhLXNjcm9sbC10b2tlbnMnIGlzIHVzZWQgdG8gc2VyaWFsaXNlIHRoZSBzY3JvbGwgc3RhdGUsIGFuZCByZXR1cm5lZFxuICogYXMgdGhlICd0cmFja2VkU2Nyb2xsVG9rZW4nIGF0dHJpYnV0ZSBieSBnZXRTY3JvbGxTdGF0ZSgpLlxuICpcbiAqIElNUE9SVEFOVDogSU5ESVZJRFVBTCBUT0tFTlMgV0lUSElOICdkYXRhLXNjcm9sbC10b2tlbnMnIE1VU1QgTk9UIENPTlRBSU4gQ09NTUFTLlxuICpcbiAqIFNvbWUgbm90ZXMgYWJvdXQgdGhlIGltcGxlbWVudGF0aW9uOlxuICpcbiAqIFRoZSBzYXZlZCAnc2Nyb2xsU3RhdGUnIGNhbiBleGlzdCBpbiBvbmUgb2YgdHdvIHN0YXRlczpcbiAqXG4gKiAgIC0gc3R1Y2tBdEJvdHRvbTogKHRoZSBkZWZhdWx0LCBhbmQgcmVzdG9yZWQgYnkgcmVzZXRTY3JvbGxTdGF0ZSk6IHRoZVxuICogICAgIHZpZXdwb3J0IGlzIHNjcm9sbGVkIGRvd24gYXMgZmFyIGFzIGl0IGNhbiBiZS4gV2hlbiB0aGUgY2hpbGRyZW4gYXJlXG4gKiAgICAgdXBkYXRlZCwgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aWxsIGJlIHVwZGF0ZWQgdG8gZW5zdXJlIGl0IGlzIHN0aWxsIGF0XG4gKiAgICAgdGhlIGJvdHRvbS5cbiAqXG4gKiAgIC0gZml4ZWQsIGluIHdoaWNoIHRoZSB2aWV3cG9ydCBpcyBjb25jZXB0dWFsbHkgdGllZCBhdCBhIHNwZWNpZmljIHNjcm9sbFxuICogICAgIG9mZnNldC4gIFdlIGRvbid0IHNhdmUgdGhlIGFic29sdXRlIHNjcm9sbCBvZmZzZXQsIGJlY2F1c2UgdGhhdCB3b3VsZCBiZVxuICogICAgIGFmZmVjdGVkIGJ5IHdpbmRvdyB3aWR0aCwgem9vbSBsZXZlbCwgYW1vdW50IG9mIHNjcm9sbGJhY2ssIGV0Yy4gSW5zdGVhZFxuICogICAgIHdlIHNhdmUgYW4gaWRlbnRpZmllciBmb3IgdGhlIGxhc3QgZnVsbHktdmlzaWJsZSBtZXNzYWdlLCBhbmQgdGhlIG51bWJlclxuICogICAgIG9mIHBpeGVscyB0aGUgd2luZG93IHdhcyBzY3JvbGxlZCBiZWxvdyBpdCAtIHdoaWNoIGlzIGhvcGVmdWxseSBuZWFyXG4gKiAgICAgZW5vdWdoLlxuICpcbiAqIFRoZSAnc3RpY2t5Qm90dG9tJyBwcm9wZXJ0eSBjb250cm9scyB0aGUgYmVoYXZpb3VyIHdoZW4gd2UgcmVhY2ggdGhlIGJvdHRvbVxuICogb2YgdGhlIHdpbmRvdyAoZWl0aGVyIHRocm91Z2ggYSB1c2VyLWluaXRpYXRlZCBzY3JvbGwsIG9yIGJ5IGNhbGxpbmdcbiAqIHNjcm9sbFRvQm90dG9tKS4gSWYgc3RpY2t5Qm90dG9tIGlzIGVuYWJsZWQsIHRoZSBzY3JvbGxTdGF0ZSB3aWxsIGVudGVyXG4gKiAnc3R1Y2tBdEJvdHRvbScgc3RhdGUgLSBlbnN1cmluZyB0aGF0IG5ldyBhZGRpdGlvbnMgY2F1c2UgdGhlIHdpbmRvdyB0b1xuICogc2Nyb2xsIGRvd24gZnVydGhlci4gSWYgc3RpY2t5Qm90dG9tIGlzIGRpc2FibGVkLCB3ZSBqdXN0IHNhdmUgdGhlIHNjcm9sbFxuICogb2Zmc2V0IGFzIG5vcm1hbC5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY3JvbGxQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogc3RpY2t5Qm90dG9tOiBpZiBzZXQgdG8gdHJ1ZSwgdGhlbiBvbmNlIHRoZSB1c2VyIGhpdHMgdGhlIGJvdHRvbSBvZlxuICAgICAgICAgKiB0aGUgbGlzdCwgYW55IG5ldyBjaGlsZHJlbiBhZGRlZCB0byB0aGUgbGlzdCB3aWxsIGNhdXNlIHRoZSBsaXN0IHRvXG4gICAgICAgICAqIHNjcm9sbCBkb3duIHRvIHNob3cgdGhlIG5ldyBlbGVtZW50LCByYXRoZXIgdGhhbiBwcmVzZXJ2aW5nIHRoZVxuICAgICAgICAgKiBleGlzdGluZyB2aWV3LlxuICAgICAgICAgKi9cbiAgICAgICAgc3RpY2t5Qm90dG9tOiBQcm9wVHlwZXMuYm9vbCxcblxuICAgICAgICAvKiBzdGFydEF0Qm90dG9tOiBpZiBzZXQgdG8gdHJ1ZSwgdGhlIHZpZXcgaXMgYXNzdW1lZCB0byBzdGFydFxuICAgICAgICAgKiBzY3JvbGxlZCB0byB0aGUgYm90dG9tLlxuICAgICAgICAgKiBYWFg6IEl0J3MgbGlrZWx5IHRoaXMgaXMgdW5uZWNlc3NhcnkgYW5kIGNhbiBiZSBkZXJpdmVkIGZyb21cbiAgICAgICAgICogc3RpY2t5Qm90dG9tLCBidXQgSSdtIGFkZGluZyBhbiBleHRyYSBwYXJhbWV0ZXIgdG8gZW5zdXJlXG4gICAgICAgICAqIGJlaGF2aW91ciBzdGF5cyB0aGUgc2FtZSBmb3Igb3RoZXIgdXNlcyBvZiBTY3JvbGxQYW5lbC5cbiAgICAgICAgICogSWYgc28sIGxldCdzIHJlbW92ZSB0aGlzIHBhcmFtZXRlciBkb3duIHRoZSBsaW5lLlxuICAgICAgICAgKi9cbiAgICAgICAgc3RhcnRBdEJvdHRvbTogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogb25GaWxsUmVxdWVzdChiYWNrd2FyZHMpOiBhIGNhbGxiYWNrIHdoaWNoIGlzIGNhbGxlZCBvbiBzY3JvbGwgd2hlblxuICAgICAgICAgKiB0aGUgdXNlciBuZWFycyB0aGUgc3RhcnQgKGJhY2t3YXJkcyA9IHRydWUpIG9yIGVuZCAoYmFja3dhcmRzID1cbiAgICAgICAgICogZmFsc2UpIG9mIHRoZSBsaXN0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBUaGlzIHNob3VsZCByZXR1cm4gYSBwcm9taXNlOyBubyBtb3JlIGNhbGxzIHdpbGwgYmUgbWFkZSB1bnRpbCB0aGVcbiAgICAgICAgICogcHJvbWlzZSBjb21wbGV0ZXMuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoZSBwcm9taXNlIHNob3VsZCByZXNvbHZlIHRvIHRydWUgaWYgdGhlcmUgaXMgbW9yZSBkYXRhIHRvIGJlXG4gICAgICAgICAqIHJldHJpZXZlZCBpbiB0aGlzIGRpcmVjdGlvbiAoaW4gd2hpY2ggY2FzZSBvbkZpbGxSZXF1ZXN0IG1heSBiZVxuICAgICAgICAgKiBjYWxsZWQgYWdhaW4gaW1tZWRpYXRlbHkpLCBvciBmYWxzZSBpZiB0aGVyZSBpcyBubyBtb3JlIGRhdGEgaW4gdGhpc1xuICAgICAgICAgKiBkaXJlY3RvbiAoYXQgdGhpcyB0aW1lKSAtIHdoaWNoIHdpbGwgc3RvcCB0aGUgcGFnaW5hdGlvbiBjeWNsZSB1bnRpbFxuICAgICAgICAgKiB0aGUgdXNlciBzY3JvbGxzIGFnYWluLlxuICAgICAgICAgKi9cbiAgICAgICAgb25GaWxsUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogb25VbmZpbGxSZXF1ZXN0KGJhY2t3YXJkcyk6IGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIG9uIHNjcm9sbCB3aGVuXG4gICAgICAgICAqIHRoZXJlIGFyZSBjaGlsZHJlbiBlbGVtZW50cyB0aGF0IGFyZSBmYXIgb3V0IG9mIHZpZXcgYW5kIGNvdWxkIGJlIHJlbW92ZWRcbiAgICAgICAgICogd2l0aG91dCBjYXVzaW5nIHBhZ2luYXRpb24gdG8gb2NjdXIuXG4gICAgICAgICAqXG4gICAgICAgICAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGFjY2VwdCBhIGJvb2xlYW4sIHdoaWNoIGlzIHRydWUgdG8gaW5kaWNhdGUgdGhlIGJhY2svdG9wXG4gICAgICAgICAqIG9mIHRoZSBwYW5lbCBhbmQgZmFsc2Ugb3RoZXJ3aXNlLCBhbmQgYSBzY3JvbGwgdG9rZW4sIHdoaWNoIHJlZmVycyB0byB0aGVcbiAgICAgICAgICogZmlyc3QgZWxlbWVudCB0byByZW1vdmUgaWYgcmVtb3ZpbmcgZnJvbSB0aGUgZnJvbnQvYm90dG9tLCBhbmQgbGFzdCBlbGVtZW50XG4gICAgICAgICAqIHRvIHJlbW92ZSBpZiByZW1vdmluZyBmcm9tIHRoZSBiYWNrL3RvcC5cbiAgICAgICAgICovXG4gICAgICAgIG9uVW5maWxsUmVxdWVzdDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogb25TY3JvbGw6IGEgY2FsbGJhY2sgd2hpY2ggaXMgY2FsbGVkIHdoZW5ldmVyIGFueSBzY3JvbGwgaGFwcGVucy5cbiAgICAgICAgICovXG4gICAgICAgIG9uU2Nyb2xsOiBQcm9wVHlwZXMuZnVuYyxcblxuICAgICAgICAvKiBjbGFzc05hbWU6IGNsYXNzbmFtZXMgdG8gYWRkIHRvIHRoZSB0b3AtbGV2ZWwgZGl2XG4gICAgICAgICAqL1xuICAgICAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgICAgICAgLyogc3R5bGU6IHN0eWxlcyB0byBhZGQgdG8gdGhlIHRvcC1sZXZlbCBkaXZcbiAgICAgICAgICovXG4gICAgICAgIHN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gICAgICAgIC8qIHJlc2l6ZU5vdGlmaWVyOiBSZXNpemVOb3RpZmllciB0byBrbm93IHdoZW4gbWlkZGxlIGNvbHVtbiBoYXMgY2hhbmdlZCBzaXplXG4gICAgICAgICAqL1xuICAgICAgICByZXNpemVOb3RpZmllcjogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvKiBmaXhlZENoaWxkcmVuOiBhbGxvd3MgZm9yIGNoaWxkcmVuIHRvIGJlIHBhc3NlZCB3aGljaCBhcmUgcmVuZGVyZWQgb3V0c2lkZVxuICAgICAgICAgKiBvZiB0aGUgd3JhcHBlclxuICAgICAgICAgKi9cbiAgICAgICAgZml4ZWRDaGlsZHJlbjogUHJvcFR5cGVzLm5vZGUsXG4gICAgfTtcblxuICAgIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgICAgIHN0aWNreUJvdHRvbTogdHJ1ZSxcbiAgICAgICAgc3RhcnRBdEJvdHRvbTogdHJ1ZSxcbiAgICAgICAgb25GaWxsUmVxdWVzdDogZnVuY3Rpb24oYmFja3dhcmRzKSB7IHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpOyB9LFxuICAgICAgICBvblVuZmlsbFJlcXVlc3Q6IGZ1bmN0aW9uKGJhY2t3YXJkcywgc2Nyb2xsVG9rZW4pIHt9LFxuICAgICAgICBvblNjcm9sbDogZnVuY3Rpb24oKSB7fSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX3BlbmRpbmdGaWxsUmVxdWVzdHMgPSB7YjogbnVsbCwgZjogbnVsbH07XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIpIHtcbiAgICAgICAgICAgIHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIub24oXCJtaWRkbGVQYW5lbFJlc2l6ZWROb2lzeVwiLCB0aGlzLm9uUmVzaXplKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVzZXRTY3JvbGxTdGF0ZSgpO1xuXG4gICAgICAgIHRoaXMuX2l0ZW1saXN0ID0gY3JlYXRlUmVmKCk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuY2hlY2tTY3JvbGwoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgICAgIC8vIGFmdGVyIGFkZGluZyBldmVudCB0aWxlcywgd2UgbWF5IG5lZWQgdG8gdHdlYWsgdGhlIHNjcm9sbCAoZWl0aGVyIHRvXG4gICAgICAgIC8vIGtlZXAgYXQgdGhlIGJvdHRvbSBvZiB0aGUgdGltZWxpbmUsIG9yIHRvIG1haW50YWluIHRoZSB2aWV3IGFmdGVyXG4gICAgICAgIC8vIGFkZGluZyBldmVudHMgdG8gdGhlIHRvcCkuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFRoaXMgd2lsbCBhbHNvIHJlLWNoZWNrIHRoZSBmaWxsIHN0YXRlLCBpbiBjYXNlIHRoZSBwYWdpbmF0ZSB3YXMgaW5hZGVxdWF0ZVxuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgIHRoaXMudXBkYXRlUHJldmVudFNocmlua2luZygpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICAvLyBzZXQgYSBib29sZWFuIHRvIHNheSB3ZSd2ZSBiZWVuIHVubW91bnRlZCwgd2hpY2ggYW55IHBlbmRpbmdcbiAgICAgICAgLy8gcHJvbWlzZXMgY2FuIHVzZSB0byB0aHJvdyBhd2F5IHRoZWlyIHJlc3VsdHMuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIChXZSBjb3VsZCB1c2UgaXNNb3VudGVkKCksIGJ1dCBmYWNlYm9vayBoYXZlIGRlcHJlY2F0ZWQgdGhhdC4pXG4gICAgICAgIHRoaXMudW5tb3VudGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZXNpemVOb3RpZmllcikge1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5yZW1vdmVMaXN0ZW5lcihcIm1pZGRsZVBhbmVsUmVzaXplZE5vaXN5XCIsIHRoaXMub25SZXNpemUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TY3JvbGwgPSBldiA9PiB7XG4gICAgICAgIC8vIHNraXAgc2Nyb2xsIGV2ZW50cyBjYXVzZWQgYnkgcmVzaXppbmdcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVzaXplTm90aWZpZXIgJiYgdGhpcy5wcm9wcy5yZXNpemVOb3RpZmllci5pc1Jlc2l6aW5nKSByZXR1cm47XG4gICAgICAgIGRlYnVnbG9nKFwib25TY3JvbGxcIiwgdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpLnNjcm9sbFRvcCk7XG4gICAgICAgIHRoaXMuX3Njcm9sbFRpbWVvdXQucmVzdGFydCgpO1xuICAgICAgICB0aGlzLl9zYXZlU2Nyb2xsU3RhdGUoKTtcbiAgICAgICAgdGhpcy51cGRhdGVQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgIHRoaXMucHJvcHMub25TY3JvbGwoZXYpO1xuICAgICAgICB0aGlzLmNoZWNrRmlsbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIG9uUmVzaXplID0gKCkgPT4ge1xuICAgICAgICBkZWJ1Z2xvZyhcIm9uUmVzaXplXCIpO1xuICAgICAgICB0aGlzLmNoZWNrU2Nyb2xsKCk7XG4gICAgICAgIC8vIHVwZGF0ZSBwcmV2ZW50U2hyaW5raW5nU3RhdGUgaWYgcHJlc2VudFxuICAgICAgICBpZiAodGhpcy5wcmV2ZW50U2hyaW5raW5nU3RhdGUpIHtcbiAgICAgICAgICAgIHRoaXMucHJldmVudFNocmlua2luZygpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIGFmdGVyIGFuIHVwZGF0ZSB0byB0aGUgY29udGVudHMgb2YgdGhlIHBhbmVsLCBjaGVjayB0aGF0IHRoZSBzY3JvbGwgaXNcbiAgICAvLyB3aGVyZSBpdCBvdWdodCB0byBiZSwgYW5kIHNldCBvZmYgcGFnaW5hdGlvbiByZXF1ZXN0cyBpZiBuZWNlc3NhcnkuXG4gICAgY2hlY2tTY3JvbGwgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVTYXZlZFNjcm9sbFN0YXRlKCk7XG4gICAgICAgIHRoaXMuY2hlY2tGaWxsU3RhdGUoKTtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJuIHRydWUgaWYgdGhlIGNvbnRlbnQgaXMgZnVsbHkgc2Nyb2xsZWQgZG93biByaWdodCBub3c7IGVsc2UgZmFsc2UuXG4gICAgLy9cbiAgICAvLyBub3RlIHRoYXQgdGhpcyBpcyBpbmRlcGVuZGVudCBvZiB0aGUgJ3N0dWNrQXRCb3R0b20nIHN0YXRlIC0gaXQgaXMgc2ltcGx5XG4gICAgLy8gYWJvdXQgd2hldGhlciB0aGUgY29udGVudCBpcyBzY3JvbGxlZCBkb3duIHJpZ2h0IG5vdywgaXJyZXNwZWN0aXZlIG9mXG4gICAgLy8gd2hldGhlciBpdCB3aWxsIHN0YXkgdGhhdCB3YXkgd2hlbiB0aGUgY2hpbGRyZW4gdXBkYXRlLlxuICAgIGlzQXRCb3R0b20gPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHNuID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICAvLyBmcmFjdGlvbmFsIHZhbHVlcyAoYm90aCB0b28gYmlnIGFuZCB0b28gc21hbGwpXG4gICAgICAgIC8vIGZvciBzY3JvbGxUb3AgaGFwcGVuIG9uIGNlcnRhaW4gYnJvd3NlcnMvcGxhdGZvcm1zXG4gICAgICAgIC8vIHdoZW4gc2Nyb2xsZWQgYWxsIHRoZSB3YXkgZG93bi4gRS5nLiBDaHJvbWUgNzIgb24gZGViaWFuLlxuICAgICAgICAvLyBzbyBjaGVjayBkaWZmZXJlbmNlIDw9IDE7XG4gICAgICAgIHJldHVybiBNYXRoLmFicyhzbi5zY3JvbGxIZWlnaHQgLSAoc24uc2Nyb2xsVG9wICsgc24uY2xpZW50SGVpZ2h0KSkgPD0gMTtcbiAgICB9O1xuXG4gICAgLy8gcmV0dXJucyB0aGUgdmVydGljYWwgaGVpZ2h0IGluIHRoZSBnaXZlbiBkaXJlY3Rpb24gdGhhdCBjYW4gYmUgcmVtb3ZlZCBmcm9tXG4gICAgLy8gdGhlIGNvbnRlbnQgYm94ICh3aGljaCBoYXMgYSBoZWlnaHQgb2Ygc2Nyb2xsSGVpZ2h0LCBzZWUgY2hlY2tGaWxsU3RhdGUpIHdpdGhvdXRcbiAgICAvLyBwYWdpbmF0aW9uIG9jY3VyaW5nLlxuICAgIC8vXG4gICAgLy8gcGFkZGluZyogPSBVTlBBR0lOQVRJT05fUEFERElOR1xuICAgIC8vXG4gICAgLy8gIyMjIFJlZ2lvbiBkZXRlcm1pbmVkIGFzIGV4Y2Vzcy5cbiAgICAvL1xuICAgIC8vICAgLi0tLS0tLS0tLS4gICAgICAgICAgICAgICAgICAgICAgICAtICAgICAgICAgICAgICAtXG4gICAgLy8gICB8IyMjIyMjIyMjfCAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwjIyMjIyMjIyN8ICAgLSAgICAgICAgICAgICAgICAgICAgfCAgc2Nyb2xsVG9wICAgfFxuICAgIC8vICAgfCAgICAgICAgIHwgICB8IHBhZGRpbmcqICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gICB8ICAgICAgICAgfCAgIHwgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyAuLSstLS0tLS0tLS0rLS4gLSAgLSAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgIGNsaWVudEhlaWdodCAgIHwgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgICAgICAgICAgICAgICAgfCAgICAgICAgICAgICAgfFxuICAgIC8vIC4tKy0tLS0tLS0tLSstLiAgICAtICAgICAgICAgICAgICAgICAtICAgICAgICAgICAgICB8XG4gICAgLy8gfCB8ICAgICAgICAgfCB8ICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgY2xpZW50SGVpZ2h0ICAgICAgICAgICAgICAgICAgfCBzY3JvbGxIZWlnaHRcbiAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIGAtKy0tLS0tLS0tLSstJyAgICAtICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gOiB8ICAgICAgICAgfCA6ICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyA6IHwgICAgICAgICB8IDogICAgfCAgY2xpZW50SGVpZ2h0ICAgICAgICAgICAgICAgICAgfFxuICAgIC8vIDogfCAgICAgICAgIHwgOiAgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gYC0rLS0tLS0tLS0tKy0nIC0gIC0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwgICAgICAgICB8ICAgfCBwYWRkaW5nKiAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vICAgfCAgICAgICAgIHwgICB8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgLy8gICB8IyMjIyMjIyMjfCAgIC0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAvLyAgIHwjIyMjIyMjIyN8ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgIC8vICAgYC0tLS0tLS0tLScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtXG4gICAgX2dldEV4Y2Vzc0hlaWdodChiYWNrd2FyZHMpIHtcbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIGNvbnN0IGNvbnRlbnRIZWlnaHQgPSB0aGlzLl9nZXRNZXNzYWdlc0hlaWdodCgpO1xuICAgICAgICBjb25zdCBsaXN0SGVpZ2h0ID0gdGhpcy5fZ2V0TGlzdEhlaWdodCgpO1xuICAgICAgICBjb25zdCBjbGlwcGVkSGVpZ2h0ID0gY29udGVudEhlaWdodCAtIGxpc3RIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHVuY2xpcHBlZFNjcm9sbFRvcCA9IHNuLnNjcm9sbFRvcCArIGNsaXBwZWRIZWlnaHQ7XG5cbiAgICAgICAgaWYgKGJhY2t3YXJkcykge1xuICAgICAgICAgICAgcmV0dXJuIHVuY2xpcHBlZFNjcm9sbFRvcCAtIHNuLmNsaWVudEhlaWdodCAtIFVOUEFHSU5BVElPTl9QQURESU5HO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRIZWlnaHQgLSAodW5jbGlwcGVkU2Nyb2xsVG9wICsgMipzbi5jbGllbnRIZWlnaHQpIC0gVU5QQUdJTkFUSU9OX1BBRERJTkc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjaGVjayB0aGUgc2Nyb2xsIHN0YXRlIGFuZCBzZW5kIG91dCBiYWNrZmlsbCByZXF1ZXN0cyBpZiBuZWNlc3NhcnkuXG4gICAgY2hlY2tGaWxsU3RhdGUgPSBhc3luYyAoZGVwdGg9MCkgPT4ge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGlzRmlyc3RDYWxsID0gZGVwdGggPT09IDA7XG4gICAgICAgIGNvbnN0IHNuID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuXG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIGxlc3MgdGhhbiBhIHNjcmVlbmZ1bCBvZiBtZXNzYWdlcyBhYm92ZSBvciBiZWxvdyB0aGVcbiAgICAgICAgLy8gdmlld3BvcnQsIHRyeSB0byBnZXQgc29tZSBtb3JlIG1lc3NhZ2VzLlxuICAgICAgICAvL1xuICAgICAgICAvLyBzY3JvbGxUb3AgaXMgdGhlIG51bWJlciBvZiBwaXhlbHMgYmV0d2VlbiB0aGUgdG9wIG9mIHRoZSBjb250ZW50IGFuZFxuICAgICAgICAvLyAgICAgdGhlIHRvcCBvZiB0aGUgdmlld3BvcnQuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIHNjcm9sbEhlaWdodCBpcyB0aGUgdG90YWwgaGVpZ2h0IG9mIHRoZSBjb250ZW50LlxuICAgICAgICAvL1xuICAgICAgICAvLyBjbGllbnRIZWlnaHQgaXMgdGhlIGhlaWdodCBvZiB0aGUgdmlld3BvcnQgKGV4Y2x1ZGluZyBib3JkZXJzLFxuICAgICAgICAvLyBtYXJnaW5zLCBhbmQgc2Nyb2xsYmFycykuXG4gICAgICAgIC8vXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgLi0tLS0tLS0tLS4gICAgICAgICAgLSAgICAgICAgICAgICAgICAgLVxuICAgICAgICAvLyAgIHwgICAgICAgICB8ICAgICAgICAgIHwgIHNjcm9sbFRvcCAgICAgIHxcbiAgICAgICAgLy8gLi0rLS0tLS0tLS0tKy0uICAgIC0gICAtICAgICAgICAgICAgICAgICB8XG4gICAgICAgIC8vIHwgfCAgICAgICAgIHwgfCAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyB8IHwgICAgICAgICB8IHwgICAgfCAgY2xpZW50SGVpZ2h0ICAgICAgIHwgc2Nyb2xsSGVpZ2h0XG4gICAgICAgIC8vIHwgfCAgICAgICAgIHwgfCAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyBgLSstLS0tLS0tLS0rLScgICAgLSAgICAgICAgICAgICAgICAgICAgIHxcbiAgICAgICAgLy8gICB8ICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gICAgICAgIC8vICAgfCAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICAgICAgICAvLyAgIGAtLS0tLS0tLS0nICAgICAgICAgICAgICAgICAgICAgICAgICAgIC1cbiAgICAgICAgLy9cblxuICAgICAgICAvLyBhcyBmaWxsaW5nIGlzIGFzeW5jIGFuZCByZWN1cnNpdmUsXG4gICAgICAgIC8vIGRvbid0IGFsbG93IG1vcmUgdGhhbiAxIGNoYWluIG9mIGNhbGxzIGNvbmN1cnJlbnRseVxuICAgICAgICAvLyBkbyBtYWtlIGEgbm90ZSB3aGVuIGEgbmV3IHJlcXVlc3QgY29tZXMgaW4gd2hpbGUgYWxyZWFkeSBydW5uaW5nIG9uZSxcbiAgICAgICAgLy8gc28gd2UgY2FuIHRyaWdnZXIgYSBuZXcgY2hhaW4gb2YgY2FsbHMgb25jZSBkb25lLlxuICAgICAgICBpZiAoaXNGaXJzdENhbGwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0ZpbGxpbmcpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcIl9pc0ZpbGxpbmc6IG5vdCBlbnRlcmluZyB3aGlsZSByZXF1ZXN0IGlzIG9uZ29pbmcsIG1hcmtpbmcgZm9yIGEgc3Vic2VxdWVudCByZXF1ZXN0XCIpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2ZpbGxSZXF1ZXN0V2hpbGVSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIl9pc0ZpbGxpbmc6IHNldHRpbmdcIik7XG4gICAgICAgICAgICB0aGlzLl9pc0ZpbGxpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaXRlbWxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBmaXJzdFRpbGUgPSBpdGVtbGlzdCAmJiBpdGVtbGlzdC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgY29uc3QgY29udGVudFRvcCA9IGZpcnN0VGlsZSAmJiBmaXJzdFRpbGUub2Zmc2V0VG9wO1xuICAgICAgICBjb25zdCBmaWxsUHJvbWlzZXMgPSBbXTtcblxuICAgICAgICAvLyBpZiBzY3JvbGxUb3AgZ2V0cyB0byAxIHNjcmVlbiBmcm9tIHRoZSB0b3Agb2YgdGhlIGZpcnN0IHRpbGUsXG4gICAgICAgIC8vIHRyeSBiYWNrd2FyZCBmaWxsaW5nXG4gICAgICAgIGlmICghZmlyc3RUaWxlIHx8IChzbi5zY3JvbGxUb3AgLSBjb250ZW50VG9wKSA8IHNuLmNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgLy8gbmVlZCB0byBiYWNrLWZpbGxcbiAgICAgICAgICAgIGZpbGxQcm9taXNlcy5wdXNoKHRoaXMuX21heWJlRmlsbChkZXB0aCwgdHJ1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHNjcm9sbFRvcCBnZXRzIHRvIDIgc2NyZWVucyBmcm9tIHRoZSBlbmQgKHNvIDEgc2NyZWVuIGJlbG93IHZpZXdwb3J0KSxcbiAgICAgICAgLy8gdHJ5IGZvcndhcmQgZmlsbGluZ1xuICAgICAgICBpZiAoKHNuLnNjcm9sbEhlaWdodCAtIHNuLnNjcm9sbFRvcCkgPCBzbi5jbGllbnRIZWlnaHQgKiAyKSB7XG4gICAgICAgICAgICAvLyBuZWVkIHRvIGZvcndhcmQtZmlsbFxuICAgICAgICAgICAgZmlsbFByb21pc2VzLnB1c2godGhpcy5fbWF5YmVGaWxsKGRlcHRoLCBmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZpbGxQcm9taXNlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoZmlsbFByb21pc2VzKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNGaXJzdENhbGwpIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiX2lzRmlsbGluZzogY2xlYXJpbmdcIik7XG4gICAgICAgICAgICB0aGlzLl9pc0ZpbGxpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9maWxsUmVxdWVzdFdoaWxlUnVubmluZykge1xuICAgICAgICAgICAgdGhpcy5fZmlsbFJlcXVlc3RXaGlsZVJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tGaWxsU3RhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBjaGVjayBpZiB1bmZpbGxpbmcgaXMgcG9zc2libGUgYW5kIHNlbmQgYW4gdW5maWxsIHJlcXVlc3QgaWYgbmVjZXNzYXJ5XG4gICAgX2NoZWNrVW5maWxsU3RhdGUoYmFja3dhcmRzKSB7XG4gICAgICAgIGxldCBleGNlc3NIZWlnaHQgPSB0aGlzLl9nZXRFeGNlc3NIZWlnaHQoYmFja3dhcmRzKTtcbiAgICAgICAgaWYgKGV4Y2Vzc0hlaWdodCA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcmlnRXhjZXNzSGVpZ2h0ID0gZXhjZXNzSGVpZ2h0O1xuXG4gICAgICAgIGNvbnN0IHRpbGVzID0gdGhpcy5faXRlbWxpc3QuY3VycmVudC5jaGlsZHJlbjtcblxuICAgICAgICAvLyBUaGUgc2Nyb2xsIHRva2VuIG9mIHRoZSBmaXJzdC9sYXN0IHRpbGUgdG8gYmUgdW5wYWdpbmF0ZWRcbiAgICAgICAgbGV0IG1hcmtlclNjcm9sbFRva2VuID0gbnVsbDtcblxuICAgICAgICAvLyBTdWJ0cmFjdCBoZWlnaHRzIG9mIHRpbGVzIHRvIHNpbXVsYXRlIHRoZSB0aWxlcyBiZWluZyB1bnBhZ2luYXRlZCB1bnRpbCB0aGVcbiAgICAgICAgLy8gZXhjZXNzIGhlaWdodCBpcyBsZXNzIHRoYW4gdGhlIGhlaWdodCBvZiB0aGUgbmV4dCB0aWxlIHRvIHN1YnRyYWN0LiBUaGlzXG4gICAgICAgIC8vIHByZXZlbnRzIGV4Y2Vzc0hlaWdodCBiZWNvbWluZyBuZWdhdGl2ZSwgd2hpY2ggY291bGQgbGVhZCB0byBmdXR1cmVcbiAgICAgICAgLy8gcGFnaW5hdGlvbi5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gSWYgYmFja3dhcmRzIGlzIHRydWUsIHdlIHVucGFnaW5hdGUgKHJlbW92ZSkgdGlsZXMgZnJvbSB0aGUgYmFjayAodG9wKS5cbiAgICAgICAgbGV0IHRpbGU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRpbGUgPSB0aWxlc1tiYWNrd2FyZHMgPyBpIDogdGlsZXMubGVuZ3RoIC0gMSAtIGldO1xuICAgICAgICAgICAgLy8gU3VidHJhY3QgaGVpZ2h0IG9mIHRpbGUgYXMgaWYgaXQgd2VyZSB1bnBhZ2luYXRlZFxuICAgICAgICAgICAgZXhjZXNzSGVpZ2h0IC09IHRpbGUuY2xpZW50SGVpZ2h0O1xuICAgICAgICAgICAgLy9JZiByZW1vdmluZyB0aGUgdGlsZSB3b3VsZCBsZWFkIHRvIGZ1dHVyZSBwYWdpbmF0aW9uLCBicmVhayBiZWZvcmUgc2V0dGluZyBzY3JvbGwgdG9rZW5cbiAgICAgICAgICAgIGlmICh0aWxlLmNsaWVudEhlaWdodCA+IGV4Y2Vzc0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gVGhlIHRpbGUgbWF5IG5vdCBoYXZlIGEgc2Nyb2xsIHRva2VuLCBzbyBndWFyZCBpdFxuICAgICAgICAgICAgaWYgKHRpbGUuZGF0YXNldC5zY3JvbGxUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBtYXJrZXJTY3JvbGxUb2tlbiA9IHRpbGUuZGF0YXNldC5zY3JvbGxUb2tlbnMuc3BsaXQoJywnKVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtYXJrZXJTY3JvbGxUb2tlbikge1xuICAgICAgICAgICAgLy8gVXNlIGEgZGVib3VuY2VyIHRvIHByZXZlbnQgbXVsdGlwbGUgdW5maWxsIGNhbGxzIGluIHF1aWNrIHN1Y2Nlc3Npb25cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdG8gbWFrZSB0aGUgdW5maWxsaW5nIHByb2Nlc3MgbGVzcyBhZ2dyZXNzaXZlXG4gICAgICAgICAgICBpZiAodGhpcy5fdW5maWxsRGVib3VuY2VyKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3VuZmlsbERlYm91bmNlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl91bmZpbGxEZWJvdW5jZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl91bmZpbGxEZWJvdW5jZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwidW5maWxsaW5nIG5vd1wiLCBiYWNrd2FyZHMsIG9yaWdFeGNlc3NIZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25VbmZpbGxSZXF1ZXN0KGJhY2t3YXJkcywgbWFya2VyU2Nyb2xsVG9rZW4pO1xuICAgICAgICAgICAgfSwgVU5GSUxMX1JFUVVFU1RfREVCT1VOQ0VfTVMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgdGhlcmUgaXMgYWxyZWFkeSBhIHBlbmRpbmcgZmlsbCByZXF1ZXN0LiBJZiBub3QsIHNldCBvbmUgb2ZmLlxuICAgIF9tYXliZUZpbGwoZGVwdGgsIGJhY2t3YXJkcykge1xuICAgICAgICBjb25zdCBkaXIgPSBiYWNrd2FyZHMgPyAnYicgOiAnZic7XG4gICAgICAgIGlmICh0aGlzLl9wZW5kaW5nRmlsbFJlcXVlc3RzW2Rpcl0pIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwiQWxyZWFkeSBhIFwiK2RpcitcIiBmaWxsIGluIHByb2dyZXNzIC0gbm90IHN0YXJ0aW5nIGFub3RoZXJcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZWJ1Z2xvZyhcInN0YXJ0aW5nIFwiK2RpcitcIiBmaWxsXCIpO1xuXG4gICAgICAgIC8vIG9uRmlsbFJlcXVlc3QgY2FuIGVuZCB1cCBjYWxsaW5nIHVzIHJlY3Vyc2l2ZWx5ICh2aWEgb25TY3JvbGxcbiAgICAgICAgLy8gZXZlbnRzKSBzbyBtYWtlIHN1cmUgd2Ugc2V0IHRoaXMgYmVmb3JlIGZpcmluZyBvZmYgdGhlIGNhbGwuXG4gICAgICAgIHRoaXMuX3BlbmRpbmdGaWxsUmVxdWVzdHNbZGlyXSA9IHRydWU7XG5cbiAgICAgICAgLy8gd2FpdCAxbXMgYmVmb3JlIHBhZ2luYXRpbmcsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgICAgIC8vIHRoaXMgd2lsbCBibG9jayB0aGUgc2Nyb2xsIGV2ZW50IGhhbmRsZXIgZm9yICs3MDBtc1xuICAgICAgICAvLyBpZiBtZXNzYWdlcyBhcmUgYWxyZWFkeSBjYWNoZWQgaW4gbWVtb3J5LFxuICAgICAgICAvLyBUaGlzIHdvdWxkIGNhdXNlIGp1bXBpbmcgdG8gaGFwcGVuIG9uIENocm9tZS9tYWNPUy5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0VGltZW91dChyZXNvbHZlLCAxKSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkZpbGxSZXF1ZXN0KGJhY2t3YXJkcyk7XG4gICAgICAgIH0pLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fcGVuZGluZ0ZpbGxSZXF1ZXN0c1tkaXJdID0gZmFsc2U7XG4gICAgICAgIH0pLnRoZW4oKGhhc01vcmVSZXN1bHRzKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBVbnBhZ2luYXRlIG9uY2UgZmlsbGluZyBpcyBjb21wbGV0ZVxuICAgICAgICAgICAgdGhpcy5fY2hlY2tVbmZpbGxTdGF0ZSghYmFja3dhcmRzKTtcblxuICAgICAgICAgICAgZGVidWdsb2coXCJcIitkaXIrXCIgZmlsbCBjb21wbGV0ZTsgaGFzTW9yZVJlc3VsdHM6XCIraGFzTW9yZVJlc3VsdHMpO1xuICAgICAgICAgICAgaWYgKGhhc01vcmVSZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgLy8gZnVydGhlciBwYWdpbmF0aW9uIHJlcXVlc3RzIGhhdmUgYmVlbiBkaXNhYmxlZCB1bnRpbCBub3csIHNvXG4gICAgICAgICAgICAgICAgLy8gaXQncyB0aW1lIHRvIGNoZWNrIHRoZSBmaWxsIHN0YXRlIGFnYWluIGluIGNhc2UgdGhlIHBhZ2luYXRpb25cbiAgICAgICAgICAgICAgICAvLyB3YXMgaW5zdWZmaWNpZW50LlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNoZWNrRmlsbFN0YXRlKGRlcHRoICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIGdldCB0aGUgY3VycmVudCBzY3JvbGwgc3RhdGUuIFRoaXMgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAgICogcHJvcGVydGllczpcbiAgICAgKlxuICAgICAqIGJvb2xlYW4gc3R1Y2tBdEJvdHRvbTogdHJ1ZSBpZiB3ZSBhcmUgdHJhY2tpbmcgdGhlIGJvdHRvbSBvZiB0aGVcbiAgICAgKiAgIHNjcm9sbC4gZmFsc2UgaWYgd2UgYXJlIHRyYWNraW5nIGEgcGFydGljdWxhciBjaGlsZC5cbiAgICAgKlxuICAgICAqIHN0cmluZyB0cmFja2VkU2Nyb2xsVG9rZW46IHVuZGVmaW5lZCBpZiBzdHVja0F0Qm90dG9tIGlzIHRydWU7IGlmIGl0IGlzXG4gICAgICogICBmYWxzZSwgdGhlIGZpcnN0IHRva2VuIGluIGRhdGEtc2Nyb2xsLXRva2VucyBvZiB0aGUgY2hpbGQgd2hpY2ggd2UgYXJlXG4gICAgICogICB0cmFja2luZy5cbiAgICAgKlxuICAgICAqIG51bWJlciBib3R0b21PZmZzZXQ6IHVuZGVmaW5lZCBpZiBzdHVja0F0Qm90dG9tIGlzIHRydWU7IGlmIGl0IGlzIGZhbHNlLFxuICAgICAqICAgdGhlIG51bWJlciBvZiBwaXhlbHMgdGhlIGJvdHRvbSBvZiB0aGUgdHJhY2tlZCBjaGlsZCBpcyBhYm92ZSB0aGVcbiAgICAgKiAgIGJvdHRvbSBvZiB0aGUgc2Nyb2xsIHBhbmVsLlxuICAgICAqL1xuICAgIGdldFNjcm9sbFN0YXRlID0gKCkgPT4gdGhpcy5zY3JvbGxTdGF0ZTtcblxuICAgIC8qIHJlc2V0IHRoZSBzYXZlZCBzY3JvbGwgc3RhdGUuXG4gICAgICpcbiAgICAgKiBUaGlzIGlzIHVzZWZ1bCBpZiB0aGUgbGlzdCBpcyBiZWluZyByZXBsYWNlZCwgYW5kIHlvdSBkb24ndCB3YW50IHRvXG4gICAgICogcHJlc2VydmUgc2Nyb2xsIGV2ZW4gaWYgbmV3IGNoaWxkcmVuIGhhcHBlbiB0byBoYXZlIHRoZSBzYW1lIHNjcm9sbFxuICAgICAqIHRva2VucyBhcyBvbGQgb25lcy5cbiAgICAgKlxuICAgICAqIFRoaXMgd2lsbCBjYXVzZSB0aGUgdmlld3BvcnQgdG8gYmUgc2Nyb2xsZWQgZG93biB0byB0aGUgYm90dG9tIG9uIHRoZVxuICAgICAqIG5leHQgdXBkYXRlIG9mIHRoZSBjaGlsZCBsaXN0LiBUaGlzIGlzIGRpZmZlcmVudCB0byBzY3JvbGxUb0JvdHRvbSgpLFxuICAgICAqIHdoaWNoIHdvdWxkIHNhdmUgdGhlIGN1cnJlbnQgYm90dG9tLW1vc3QgY2hpbGQgYXMgdGhlIGFjdGl2ZSBvbmUgKHNvIGlzXG4gICAgICogbm8gdXNlIGlmIG5vIGNoaWxkcmVuIGV4aXN0IHlldCwgb3IgaWYgeW91IGFyZSBhYm91dCB0byByZXBsYWNlIHRoZVxuICAgICAqIGNoaWxkIGxpc3QuKVxuICAgICAqL1xuICAgIHJlc2V0U2Nyb2xsU3RhdGUgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuc2Nyb2xsU3RhdGUgPSB7XG4gICAgICAgICAgICBzdHVja0F0Qm90dG9tOiB0aGlzLnByb3BzLnN0YXJ0QXRCb3R0b20sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2JvdHRvbUdyb3d0aCA9IDA7XG4gICAgICAgIHRoaXMuX3BhZ2VzID0gMDtcbiAgICAgICAgdGhpcy5fc2Nyb2xsVGltZW91dCA9IG5ldyBUaW1lcigxMDApO1xuICAgICAgICB0aGlzLl9oZWlnaHRVcGRhdGVJblByb2dyZXNzID0gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIGp1bXAgdG8gdGhlIHRvcCBvZiB0aGUgY29udGVudC5cbiAgICAgKi9cbiAgICBzY3JvbGxUb1RvcCA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpLnNjcm9sbFRvcCA9IDA7XG4gICAgICAgIHRoaXMuX3NhdmVTY3JvbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBqdW1wIHRvIHRoZSBib3R0b20gb2YgdGhlIGNvbnRlbnQuXG4gICAgICovXG4gICAgc2Nyb2xsVG9Cb3R0b20gPSAoKSA9PiB7XG4gICAgICAgIC8vIHRoZSBlYXNpZXN0IHdheSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgc2Nyb2xsIHN0YXRlIGlzIGNvcnJlY3RseVxuICAgICAgICAvLyBzYXZlZCBpcyB0byBkbyB0aGUgc2Nyb2xsLCB0aGVuIHNhdmUgdGhlIHVwZGF0ZWQgc3RhdGUuIChDYWxjdWxhdGluZ1xuICAgICAgICAvLyBpdCBvdXJzZWx2ZXMgaXMgaGFyZCwgYW5kIHdlIGNhbid0IHJlbHkgb24gYW4gb25TY3JvbGwgY2FsbGJhY2tcbiAgICAgICAgLy8gaGFwcGVuaW5nLCBzaW5jZSB0aGVyZSBtYXkgYmUgbm8gdXNlci12aXNpYmxlIGNoYW5nZSBoZXJlKS5cbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIHNuLnNjcm9sbFRvcCA9IHNuLnNjcm9sbEhlaWdodDtcbiAgICAgICAgdGhpcy5fc2F2ZVNjcm9sbFN0YXRlKCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFBhZ2UgdXAvZG93bi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtdWx0OiAtMSB0byBwYWdlIHVwLCArMSB0byBwYWdlIGRvd25cbiAgICAgKi9cbiAgICBzY3JvbGxSZWxhdGl2ZSA9IG11bHQgPT4ge1xuICAgICAgICBjb25zdCBzY3JvbGxOb2RlID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBjb25zdCBkZWx0YSA9IG11bHQgKiBzY3JvbGxOb2RlLmNsaWVudEhlaWdodCAqIDAuNTtcbiAgICAgICAgc2Nyb2xsTm9kZS5zY3JvbGxCeSgwLCBkZWx0YSk7XG4gICAgICAgIHRoaXMuX3NhdmVTY3JvbGxTdGF0ZSgpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBTY3JvbGwgdXAvZG93biBpbiByZXNwb25zZSB0byBhIHNjcm9sbCBrZXlcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZXYgdGhlIGtleWJvYXJkIGV2ZW50XG4gICAgICovXG4gICAgaGFuZGxlU2Nyb2xsS2V5ID0gZXYgPT4ge1xuICAgICAgICBzd2l0Y2ggKGV2LmtleSkge1xuICAgICAgICAgICAgY2FzZSBLZXkuUEFHRV9VUDpcbiAgICAgICAgICAgICAgICBpZiAoIWV2LmN0cmxLZXkgJiYgIWV2LnNoaWZ0S2V5ICYmICFldi5hbHRLZXkgJiYgIWV2Lm1ldGFLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zY3JvbGxSZWxhdGl2ZSgtMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEtleS5QQUdFX0RPV046XG4gICAgICAgICAgICAgICAgaWYgKCFldi5jdHJsS2V5ICYmICFldi5zaGlmdEtleSAmJiAhZXYuYWx0S2V5ICYmICFldi5tZXRhS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsUmVsYXRpdmUoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIEtleS5IT01FOlxuICAgICAgICAgICAgICAgIGlmIChldi5jdHJsS2V5ICYmICFldi5zaGlmdEtleSAmJiAhZXYuYWx0S2V5ICYmICFldi5tZXRhS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2Nyb2xsVG9Ub3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgS2V5LkVORDpcbiAgICAgICAgICAgICAgICBpZiAoZXYuY3RybEtleSAmJiAhZXYuc2hpZnRLZXkgJiYgIWV2LmFsdEtleSAmJiAhZXYubWV0YUtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjcm9sbFRvQm90dG9tKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIFNjcm9sbCB0aGUgcGFuZWwgdG8gYnJpbmcgdGhlIERPTSBub2RlIHdpdGggdGhlIHNjcm9sbCB0b2tlblxuICAgICAqIGBzY3JvbGxUb2tlbmAgaW50byB2aWV3LlxuICAgICAqXG4gICAgICogb2Zmc2V0QmFzZSBnaXZlcyB0aGUgcmVmZXJlbmNlIHBvaW50IGZvciB0aGUgcGl4ZWxPZmZzZXQuIDAgbWVhbnMgdGhlXG4gICAgICogdG9wIG9mIHRoZSBjb250YWluZXIsIDEgbWVhbnMgdGhlIGJvdHRvbSwgYW5kIGZyYWN0aW9uYWwgdmFsdWVzIG1lYW5cbiAgICAgKiBzb21ld2hlcmUgaW4gdGhlIG1pZGRsZS4gSWYgb21pdHRlZCwgaXQgZGVmYXVsdHMgdG8gMC5cbiAgICAgKlxuICAgICAqIHBpeGVsT2Zmc2V0IGdpdmVzIHRoZSBudW1iZXIgb2YgcGl4ZWxzICphYm92ZSogdGhlIG9mZnNldEJhc2UgdGhhdCB0aGVcbiAgICAgKiBub2RlIChzcGVjaWZpY2FsbHksIHRoZSBib3R0b20gb2YgaXQpIHdpbGwgYmUgcG9zaXRpb25lZC4gSWYgb21pdHRlZCwgaXRcbiAgICAgKiBkZWZhdWx0cyB0byAwLlxuICAgICAqL1xuICAgIHNjcm9sbFRvVG9rZW4gPSAoc2Nyb2xsVG9rZW4sIHBpeGVsT2Zmc2V0LCBvZmZzZXRCYXNlKSA9PiB7XG4gICAgICAgIHBpeGVsT2Zmc2V0ID0gcGl4ZWxPZmZzZXQgfHwgMDtcbiAgICAgICAgb2Zmc2V0QmFzZSA9IG9mZnNldEJhc2UgfHwgMDtcblxuICAgICAgICAvLyBzZXQgdGhlIHRyYWNrZWRTY3JvbGxUb2tlbiBzbyB3ZSBjYW4gZ2V0IHRoZSBub2RlIHRocm91Z2ggX2dldFRyYWNrZWROb2RlXG4gICAgICAgIHRoaXMuc2Nyb2xsU3RhdGUgPSB7XG4gICAgICAgICAgICBzdHVja0F0Qm90dG9tOiBmYWxzZSxcbiAgICAgICAgICAgIHRyYWNrZWRTY3JvbGxUb2tlbjogc2Nyb2xsVG9rZW4sXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHRyYWNrZWROb2RlID0gdGhpcy5fZ2V0VHJhY2tlZE5vZGUoKTtcbiAgICAgICAgY29uc3Qgc2Nyb2xsTm9kZSA9IHRoaXMuX2dldFNjcm9sbE5vZGUoKTtcbiAgICAgICAgaWYgKHRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICAvLyBzZXQgdGhlIHNjcm9sbFRvcCB0byB0aGUgcG9zaXRpb24gd2Ugd2FudC5cbiAgICAgICAgICAgIC8vIG5vdGUgdGhvdWdoLCB0aGF0IHRoaXMgbWlnaHQgbm90IHN1Y2NlZWQgaWYgdGhlIGNvbWJpbmF0aW9uIG9mIG9mZnNldEJhc2UgYW5kIHBpeGVsT2Zmc2V0XG4gICAgICAgICAgICAvLyB3b3VsZCBwb3NpdGlvbiB0aGUgdHJhY2tlZE5vZGUgdG93YXJkcyB0aGUgdG9wIG9mIHRoZSB2aWV3cG9ydC5cbiAgICAgICAgICAgIC8vIFRoaXMgYmVjYXVzZSB3aGVuIHNldHRpbmcgdGhlIHNjcm9sbFRvcCBvbmx5IDEwIG9yIHNvIGV2ZW50cyBtaWdodCBiZSBsb2FkZWQsXG4gICAgICAgICAgICAvLyBub3QgZ2l2aW5nIGVub3VnaCBjb250ZW50IGJlbG93IHRoZSB0cmFja2VkTm9kZSB0byBzY3JvbGwgZG93bndhcmRzXG4gICAgICAgICAgICAvLyBlbm91Z2ggc28gaXQgZW5kcyB1cCBpbiB0aGUgdG9wIG9mIHRoZSB2aWV3cG9ydC5cbiAgICAgICAgICAgIGRlYnVnbG9nKFwic2Nyb2xsVG9rZW46IHNldHRpbmcgc2Nyb2xsVG9wXCIsIHtvZmZzZXRCYXNlLCBwaXhlbE9mZnNldCwgb2Zmc2V0VG9wOiB0cmFja2VkTm9kZS5vZmZzZXRUb3B9KTtcbiAgICAgICAgICAgIHNjcm9sbE5vZGUuc2Nyb2xsVG9wID0gKHRyYWNrZWROb2RlLm9mZnNldFRvcCAtIChzY3JvbGxOb2RlLmNsaWVudEhlaWdodCAqIG9mZnNldEJhc2UpKSArIHBpeGVsT2Zmc2V0O1xuICAgICAgICAgICAgdGhpcy5fc2F2ZVNjcm9sbFN0YXRlKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgX3NhdmVTY3JvbGxTdGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuc3RpY2t5Qm90dG9tICYmIHRoaXMuaXNBdEJvdHRvbSgpKSB7XG4gICAgICAgICAgICB0aGlzLnNjcm9sbFN0YXRlID0geyBzdHVja0F0Qm90dG9tOiB0cnVlIH07XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInNhdmVkIHN0dWNrQXRCb3R0b20gc3RhdGVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY3JvbGxOb2RlID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICBjb25zdCB2aWV3cG9ydEJvdHRvbSA9IHNjcm9sbE5vZGUuc2Nyb2xsSGVpZ2h0IC0gKHNjcm9sbE5vZGUuc2Nyb2xsVG9wICsgc2Nyb2xsTm9kZS5jbGllbnRIZWlnaHQpO1xuXG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgbWVzc2FnZXMgPSBpdGVtbGlzdC5jaGlsZHJlbjtcbiAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuXG4gICAgICAgIC8vIFRPRE86IGRvIGEgYmluYXJ5IHNlYXJjaCBoZXJlLCBhcyBpdGVtcyBhcmUgc29ydGVkIGJ5IG9mZnNldFRvcFxuICAgICAgICAvLyBsb29wIGJhY2t3YXJkcywgZnJvbSBib3R0b20tbW9zdCBtZXNzYWdlIChhcyB0aGF0IGlzIHRoZSBtb3N0IGNvbW1vbiBjYXNlKVxuICAgICAgICBmb3IgKGxldCBpID0gbWVzc2FnZXMubGVuZ3RoLTE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2VzW2ldLmRhdGFzZXQuc2Nyb2xsVG9rZW5zKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBub2RlID0gbWVzc2FnZXNbaV07XG4gICAgICAgICAgICAvLyBicmVhayBhdCB0aGUgZmlyc3QgbWVzc2FnZSAoY29taW5nIGZyb20gdGhlIGJvdHRvbSlcbiAgICAgICAgICAgIC8vIHRoYXQgaGFzIGl0J3Mgb2Zmc2V0VG9wIGFib3ZlIHRoZSBib3R0b20gb2YgdGhlIHZpZXdwb3J0LlxuICAgICAgICAgICAgaWYgKHRoaXMuX3RvcEZyb21Cb3R0b20obm9kZSkgPiB2aWV3cG9ydEJvdHRvbSkge1xuICAgICAgICAgICAgICAgIC8vIFVzZSB0aGlzIG5vZGUgYXMgdGhlIHNjcm9sbFRva2VuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW5vZGUpIHtcbiAgICAgICAgICAgIGRlYnVnbG9nKFwidW5hYmxlIHRvIHNhdmUgc2Nyb2xsIHN0YXRlOiBmb3VuZCBubyBjaGlsZHJlbiBpbiB0aGUgdmlld3BvcnRcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2Nyb2xsVG9rZW4gPSBub2RlLmRhdGFzZXQuc2Nyb2xsVG9rZW5zLnNwbGl0KCcsJylbMF07XG4gICAgICAgIGRlYnVnbG9nKFwic2F2aW5nIGFuY2hvcmVkIHNjcm9sbCBzdGF0ZSB0byBtZXNzYWdlXCIsIG5vZGUgJiYgbm9kZS5pbm5lclRleHQsIHNjcm9sbFRva2VuKTtcbiAgICAgICAgY29uc3QgYm90dG9tT2Zmc2V0ID0gdGhpcy5fdG9wRnJvbUJvdHRvbShub2RlKTtcbiAgICAgICAgdGhpcy5zY3JvbGxTdGF0ZSA9IHtcbiAgICAgICAgICAgIHN0dWNrQXRCb3R0b206IGZhbHNlLFxuICAgICAgICAgICAgdHJhY2tlZE5vZGU6IG5vZGUsXG4gICAgICAgICAgICB0cmFja2VkU2Nyb2xsVG9rZW46IHNjcm9sbFRva2VuLFxuICAgICAgICAgICAgYm90dG9tT2Zmc2V0OiBib3R0b21PZmZzZXQsXG4gICAgICAgICAgICBwaXhlbE9mZnNldDogYm90dG9tT2Zmc2V0IC0gdmlld3BvcnRCb3R0b20sIC8vbmVlZGVkIGZvciByZXN0b3JpbmcgdGhlIHNjcm9sbCBwb3NpdGlvbiB3aGVuIGNvbWluZyBiYWNrIHRvIHRoZSByb29tXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMgX3Jlc3RvcmVTYXZlZFNjcm9sbFN0YXRlKCkge1xuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IHRoaXMuc2Nyb2xsU3RhdGU7XG5cbiAgICAgICAgaWYgKHNjcm9sbFN0YXRlLnN0dWNrQXRCb3R0b20pIHtcbiAgICAgICAgICAgIGNvbnN0IHNuID0gdGhpcy5fZ2V0U2Nyb2xsTm9kZSgpO1xuICAgICAgICAgICAgaWYgKHNuLnNjcm9sbFRvcCAhPT0gc24uc2Nyb2xsSGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgc24uc2Nyb2xsVG9wID0gc24uc2Nyb2xsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbikge1xuICAgICAgICAgICAgY29uc3QgaXRlbWxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICAgICAgY29uc3QgdHJhY2tlZE5vZGUgPSB0aGlzLl9nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICAgICAgaWYgKHRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3Qm90dG9tT2Zmc2V0ID0gdGhpcy5fdG9wRnJvbUJvdHRvbSh0cmFja2VkTm9kZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYm90dG9tRGlmZiA9IG5ld0JvdHRvbU9mZnNldCAtIHNjcm9sbFN0YXRlLmJvdHRvbU9mZnNldDtcbiAgICAgICAgICAgICAgICB0aGlzLl9ib3R0b21Hcm93dGggKz0gYm90dG9tRGlmZjtcbiAgICAgICAgICAgICAgICBzY3JvbGxTdGF0ZS5ib3R0b21PZmZzZXQgPSBuZXdCb3R0b21PZmZzZXQ7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gYCR7dGhpcy5fZ2V0TGlzdEhlaWdodCgpfXB4YDtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ID0gbmV3SGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcImJhbGFuY2luZyBoZWlnaHQgYmVjYXVzZSBtZXNzYWdlcyBiZWxvdyB2aWV3cG9ydCBncmV3IGJ5XCIsIGJvdHRvbURpZmYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5faGVpZ2h0VXBkYXRlSW5Qcm9ncmVzcykge1xuICAgICAgICAgICAgdGhpcy5faGVpZ2h0VXBkYXRlSW5Qcm9ncmVzcyA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuX3VwZGF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9oZWlnaHRVcGRhdGVJblByb2dyZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcIm5vdCB1cGRhdGluZyBoZWlnaHQgYmVjYXVzZSByZXF1ZXN0IGFscmVhZHkgaW4gcHJvZ3Jlc3NcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBuZWVkIGEgYmV0dGVyIG5hbWUgdGhhdCBhbHNvIGluZGljYXRlcyB0aGlzIHdpbGwgY2hhbmdlIHNjcm9sbFRvcD8gUmViYWxhbmNlIGhlaWdodD8gUmV2ZWFsIGNvbnRlbnQ/XG4gICAgYXN5bmMgX3VwZGF0ZUhlaWdodCgpIHtcbiAgICAgICAgLy8gd2FpdCB1bnRpbCB1c2VyIGhhcyBzdG9wcGVkIHNjcm9sbGluZ1xuICAgICAgICBpZiAodGhpcy5fc2Nyb2xsVGltZW91dC5pc1J1bm5pbmcoKSkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJ1cGRhdGVIZWlnaHQgd2FpdGluZyBmb3Igc2Nyb2xsaW5nIHRvIGVuZCAuLi4gXCIpO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5fc2Nyb2xsVGltZW91dC5maW5pc2hlZCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVidWdsb2coXCJ1cGRhdGVIZWlnaHQgZ2V0dGluZyBzdHJhaWdodCB0byBidXNpbmVzcywgbm8gc2Nyb2xsaW5nIGdvaW5nIG9uLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdlIG1pZ2h0IGhhdmUgdW5tb3VudGVkIHNpbmNlIHRoZSB0aW1lciBmaW5pc2hlZCwgc28gYWJvcnQgaWYgc28uXG4gICAgICAgIGlmICh0aGlzLnVubW91bnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc24gPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgIGNvbnN0IGl0ZW1saXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgY29udGVudEhlaWdodCA9IHRoaXMuX2dldE1lc3NhZ2VzSGVpZ2h0KCk7XG4gICAgICAgIGNvbnN0IG1pbkhlaWdodCA9IHNuLmNsaWVudEhlaWdodDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5tYXgobWluSGVpZ2h0LCBjb250ZW50SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5fcGFnZXMgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gUEFHRV9TSVpFKTtcbiAgICAgICAgdGhpcy5fYm90dG9tR3Jvd3RoID0gMDtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gYCR7dGhpcy5fZ2V0TGlzdEhlaWdodCgpfXB4YDtcblxuICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IHRoaXMuc2Nyb2xsU3RhdGU7XG4gICAgICAgIGlmIChzY3JvbGxTdGF0ZS5zdHVja0F0Qm90dG9tKSB7XG4gICAgICAgICAgICBpZiAoaXRlbWxpc3Quc3R5bGUuaGVpZ2h0ICE9PSBuZXdIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBpdGVtbGlzdC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc24uc2Nyb2xsVG9wICE9PSBzbi5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzbi5zY3JvbGxUb3AgPSBzbi5zY3JvbGxIZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCB0b1wiLCBuZXdIZWlnaHQpO1xuICAgICAgICB9IGVsc2UgaWYgKHNjcm9sbFN0YXRlLnRyYWNrZWRTY3JvbGxUb2tlbikge1xuICAgICAgICAgICAgY29uc3QgdHJhY2tlZE5vZGUgPSB0aGlzLl9nZXRUcmFja2VkTm9kZSgpO1xuICAgICAgICAgICAgLy8gaWYgdGhlIHRpbWVsaW5lIGhhcyBiZWVuIHJlbG9hZGVkXG4gICAgICAgICAgICAvLyB0aGlzIGNhbiBiZSBjYWxsZWQgYmVmb3JlIHNjcm9sbFRvQm90dG9tIG9yIHdoYXRldmVyIGhhcyBiZWVuIGNhbGxlZFxuICAgICAgICAgICAgLy8gc28gZG9uJ3QgZG8gYW55dGhpbmcgaWYgdGhlIG5vZGUgaGFzIGRpc2FwcGVhcmVkIGZyb21cbiAgICAgICAgICAgIC8vIHRoZSBjdXJyZW50bHkgZmlsbGVkIHBpZWNlIG9mIHRoZSB0aW1lbGluZVxuICAgICAgICAgICAgaWYgKHRyYWNrZWROb2RlKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkVG9wID0gdHJhY2tlZE5vZGUub2Zmc2V0VG9wO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtbGlzdC5zdHlsZS5oZWlnaHQgIT09IG5ld0hlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtbGlzdC5zdHlsZS5oZWlnaHQgPSBuZXdIZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1RvcCA9IHRyYWNrZWROb2RlLm9mZnNldFRvcDtcbiAgICAgICAgICAgICAgICBjb25zdCB0b3BEaWZmID0gbmV3VG9wIC0gb2xkVG9wO1xuICAgICAgICAgICAgICAgIC8vIGltcG9ydGFudCB0byBzY3JvbGwgYnkgYSByZWxhdGl2ZSBhbW91bnQgYXNcbiAgICAgICAgICAgICAgICAvLyByZWFkaW5nIHNjcm9sbFRvcCBhbmQgdGhlbiBzZXR0aW5nIGl0IG1pZ2h0XG4gICAgICAgICAgICAgICAgLy8geWllbGQgb3V0IG9mIGRhdGUgdmFsdWVzIGFuZCBjYXVzZSBhIGp1bXBcbiAgICAgICAgICAgICAgICAvLyB3aGVuIHNldHRpbmcgaXRcbiAgICAgICAgICAgICAgICBzbi5zY3JvbGxCeSgwLCB0b3BEaWZmKTtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcInVwZGF0ZUhlaWdodCB0b1wiLCB7bmV3SGVpZ2h0LCB0b3BEaWZmfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0VHJhY2tlZE5vZGUoKSB7XG4gICAgICAgIGNvbnN0IHNjcm9sbFN0YXRlID0gdGhpcy5zY3JvbGxTdGF0ZTtcbiAgICAgICAgY29uc3QgdHJhY2tlZE5vZGUgPSBzY3JvbGxTdGF0ZS50cmFja2VkTm9kZTtcblxuICAgICAgICBpZiAoIXRyYWNrZWROb2RlIHx8ICF0cmFja2VkTm9kZS5wYXJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICBsZXQgbm9kZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5faXRlbWxpc3QuY3VycmVudC5jaGlsZHJlbjtcbiAgICAgICAgICAgIGNvbnN0IHNjcm9sbFRva2VuID0gc2Nyb2xsU3RhdGUudHJhY2tlZFNjcm9sbFRva2VuO1xuXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gbWVzc2FnZXMubGVuZ3RoLTE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbSA9IG1lc3NhZ2VzW2ldO1xuICAgICAgICAgICAgICAgIC8vICdkYXRhLXNjcm9sbC10b2tlbnMnIGlzIGEgRE9NU3RyaW5nIG9mIGNvbW1hLXNlcGFyYXRlZCBzY3JvbGwgdG9rZW5zXG4gICAgICAgICAgICAgICAgLy8gVGhlcmUgbWlnaHQgb25seSBiZSBvbmUgc2Nyb2xsIHRva2VuXG4gICAgICAgICAgICAgICAgaWYgKG0uZGF0YXNldC5zY3JvbGxUb2tlbnMgJiZcbiAgICAgICAgICAgICAgICAgICAgbS5kYXRhc2V0LnNjcm9sbFRva2Vucy5zcGxpdCgnLCcpLmluZGV4T2Yoc2Nyb2xsVG9rZW4pICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gbTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUpIHtcbiAgICAgICAgICAgICAgICBkZWJ1Z2xvZyhcImhhZCB0byBmaW5kIHRyYWNrZWQgbm9kZSBhZ2FpbiBmb3IgXCIgKyBzY3JvbGxTdGF0ZS50cmFja2VkU2Nyb2xsVG9rZW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2Nyb2xsU3RhdGUudHJhY2tlZE5vZGUgPSBub2RlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFzY3JvbGxTdGF0ZS50cmFja2VkTm9kZSkge1xuICAgICAgICAgICAgZGVidWdsb2coXCJObyBub2RlIHdpdGggOyAnXCIrc2Nyb2xsU3RhdGUudHJhY2tlZFNjcm9sbFRva2VuK1wiJ1wiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzY3JvbGxTdGF0ZS50cmFja2VkTm9kZTtcbiAgICB9XG5cbiAgICBfZ2V0TGlzdEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2JvdHRvbUdyb3d0aCArICh0aGlzLl9wYWdlcyAqIFBBR0VfU0laRSk7XG4gICAgfVxuXG4gICAgX2dldE1lc3NhZ2VzSGVpZ2h0KCkge1xuICAgICAgICBjb25zdCBpdGVtbGlzdCA9IHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQ7XG4gICAgICAgIGNvbnN0IGxhc3ROb2RlID0gaXRlbWxpc3QubGFzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgY29uc3QgbGFzdE5vZGVCb3R0b20gPSBsYXN0Tm9kZSA/IGxhc3ROb2RlLm9mZnNldFRvcCArIGxhc3ROb2RlLmNsaWVudEhlaWdodCA6IDA7XG4gICAgICAgIGNvbnN0IGZpcnN0Tm9kZVRvcCA9IGl0ZW1saXN0LmZpcnN0RWxlbWVudENoaWxkID8gaXRlbWxpc3QuZmlyc3RFbGVtZW50Q2hpbGQub2Zmc2V0VG9wIDogMDtcbiAgICAgICAgLy8gMTggaXMgaXRlbWxpc3QgcGFkZGluZ1xuICAgICAgICByZXR1cm4gbGFzdE5vZGVCb3R0b20gLSBmaXJzdE5vZGVUb3AgKyAoMTggKiAyKTtcbiAgICB9XG5cbiAgICBfdG9wRnJvbUJvdHRvbShub2RlKSB7XG4gICAgICAgIC8vIGN1cnJlbnQgY2FwcGVkIGhlaWdodCAtIGRpc3RhbmNlIGZyb20gdG9wID0gZGlzdGFuY2UgZnJvbSBib3R0b20gb2YgY29udGFpbmVyIHRvIHRvcCBvZiB0cmFja2VkIGVsZW1lbnRcbiAgICAgICAgcmV0dXJuIHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQuY2xpZW50SGVpZ2h0IC0gbm9kZS5vZmZzZXRUb3A7XG4gICAgfVxuXG4gICAgLyogZ2V0IHRoZSBET00gbm9kZSB3aGljaCBoYXMgdGhlIHNjcm9sbFRvcCBwcm9wZXJ0eSB3ZSBjYXJlIGFib3V0IGZvciBvdXJcbiAgICAgKiBtZXNzYWdlIHBhbmVsLlxuICAgICAqL1xuICAgIF9nZXRTY3JvbGxOb2RlKCkge1xuICAgICAgICBpZiAodGhpcy51bm1vdW50ZWQpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgc2hvdWxkbid0IGhhcHBlbiwgYnV0IHdoZW4gaXQgZG9lcywgdHVybiB0aGUgTlBFIGludG9cbiAgICAgICAgICAgIC8vIHNvbWV0aGluZyBtb3JlIG1lYW5pbmdmdWwuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY3JvbGxQYW5lbC5fZ2V0U2Nyb2xsTm9kZSBjYWxsZWQgd2hlbiB1bm1vdW50ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuX2RpdlNjcm9sbCkge1xuICAgICAgICAgICAgLy8gTGlrZXdpc2UsIHdlIHNob3VsZCBoYXZlIHRoZSByZWYgYnkgdGhpcyBwb2ludCwgYnV0IGlmIG5vdFxuICAgICAgICAgICAgLy8gdHVybiB0aGUgTlBFIGludG8gc29tZXRoaW5nIG1lYW5pbmdmdWwuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTY3JvbGxQYW5lbC5fZ2V0U2Nyb2xsTm9kZSBjYWxsZWQgYmVmb3JlIEF1dG9IaWRlU2Nyb2xsYmFyIHJlZiBjb2xsZWN0ZWRcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fZGl2U2Nyb2xsO1xuICAgIH1cblxuICAgIF9jb2xsZWN0U2Nyb2xsID0gZGl2U2Nyb2xsID0+IHtcbiAgICAgICAgdGhpcy5fZGl2U2Nyb2xsID0gZGl2U2Nyb2xsO1xuICAgIH07XG5cbiAgICAvKipcbiAgICBNYXJrIHRoZSBib3R0b20gb2Zmc2V0IG9mIHRoZSBsYXN0IHRpbGUgc28gd2UgY2FuIGJhbGFuY2UgaXQgb3V0IHdoZW5cbiAgICBhbnl0aGluZyBiZWxvdyBpdCBjaGFuZ2VzLCBieSBjYWxsaW5nIHVwZGF0ZVByZXZlbnRTaHJpbmtpbmcsIHRvIGtlZXBcbiAgICB0aGUgc2FtZSBtaW5pbXVtIGJvdHRvbSBvZmZzZXQsIGVmZmVjdGl2ZWx5IHByZXZlbnRpbmcgdGhlIHRpbWVsaW5lIHRvIHNocmluay5cbiAgICAqL1xuICAgIHByZXZlbnRTaHJpbmtpbmcgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2VMaXN0ID0gdGhpcy5faXRlbWxpc3QuY3VycmVudDtcbiAgICAgICAgY29uc3QgdGlsZXMgPSBtZXNzYWdlTGlzdCAmJiBtZXNzYWdlTGlzdC5jaGlsZHJlbjtcbiAgICAgICAgaWYgKCFtZXNzYWdlTGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0VGlsZU5vZGU7XG4gICAgICAgIGZvciAobGV0IGkgPSB0aWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHRpbGVzW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUuZGF0YXNldC5zY3JvbGxUb2tlbnMpIHtcbiAgICAgICAgICAgICAgICBsYXN0VGlsZU5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghbGFzdFRpbGVOb2RlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGVhclByZXZlbnRTaHJpbmtpbmcoKTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0RnJvbUJvdHRvbSA9IG1lc3NhZ2VMaXN0LmNsaWVudEhlaWdodCAtIChsYXN0VGlsZU5vZGUub2Zmc2V0VG9wICsgbGFzdFRpbGVOb2RlLmNsaWVudEhlaWdodCk7XG4gICAgICAgIHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlID0ge1xuICAgICAgICAgICAgb2Zmc2V0RnJvbUJvdHRvbTogb2Zmc2V0RnJvbUJvdHRvbSxcbiAgICAgICAgICAgIG9mZnNldE5vZGU6IGxhc3RUaWxlTm9kZSxcbiAgICAgICAgfTtcbiAgICAgICAgZGVidWdsb2coXCJwcmV2ZW50IHNocmlua2luZywgbGFzdCB0aWxlIFwiLCBvZmZzZXRGcm9tQm90dG9tLCBcInB4IGZyb20gYm90dG9tXCIpO1xuICAgIH07XG5cbiAgICAvKiogQ2xlYXIgc2hyaW5raW5nIHByZXZlbnRpb24uIFVzZWQgaW50ZXJuYWxseSwgYW5kIHdoZW4gdGhlIHRpbWVsaW5lIGlzIHJlbG9hZGVkLiAqL1xuICAgIGNsZWFyUHJldmVudFNocmlua2luZyA9ICgpID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUxpc3QgPSB0aGlzLl9pdGVtbGlzdC5jdXJyZW50O1xuICAgICAgICBjb25zdCBiYWxhbmNlRWxlbWVudCA9IG1lc3NhZ2VMaXN0ICYmIG1lc3NhZ2VMaXN0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgIGlmIChiYWxhbmNlRWxlbWVudCkgYmFsYW5jZUVsZW1lbnQuc3R5bGUucGFkZGluZ0JvdHRvbSA9IG51bGw7XG4gICAgICAgIHRoaXMucHJldmVudFNocmlua2luZ1N0YXRlID0gbnVsbDtcbiAgICAgICAgZGVidWdsb2coXCJwcmV2ZW50IHNocmlua2luZyBjbGVhcmVkXCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICB1cGRhdGUgdGhlIGNvbnRhaW5lciBwYWRkaW5nIHRvIGJhbGFuY2VcbiAgICB0aGUgYm90dG9tIG9mZnNldCBvZiB0aGUgbGFzdCB0aWxlIHNpbmNlXG4gICAgcHJldmVudFNocmlua2luZyB3YXMgY2FsbGVkLlxuICAgIENsZWFycyB0aGUgcHJldmVudC1zaHJpbmtpbmcgc3RhdGUgb25lcyB0aGUgb2Zmc2V0XG4gICAgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBtYXJrZWQgdGlsZSBncm93cyBsYXJnZXIgdGhhblxuICAgIHdoYXQgaXQgd2FzIHdoZW4gbWFya2luZy5cbiAgICAqL1xuICAgIHVwZGF0ZVByZXZlbnRTaHJpbmtpbmcgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnByZXZlbnRTaHJpbmtpbmdTdGF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgc24gPSB0aGlzLl9nZXRTY3JvbGxOb2RlKCk7XG4gICAgICAgICAgICBjb25zdCBzY3JvbGxTdGF0ZSA9IHRoaXMuc2Nyb2xsU3RhdGU7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlTGlzdCA9IHRoaXMuX2l0ZW1saXN0LmN1cnJlbnQ7XG4gICAgICAgICAgICBjb25zdCB7b2Zmc2V0Tm9kZSwgb2Zmc2V0RnJvbUJvdHRvbX0gPSB0aGlzLnByZXZlbnRTaHJpbmtpbmdTdGF0ZTtcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgdXNlZCB0byBzZXQgcGFkZGluZ0JvdHRvbSB0byBiYWxhbmNlIHRoZSB0eXBpbmcgbm90aWZzIGRpc2FwcGVhcmluZ1xuICAgICAgICAgICAgY29uc3QgYmFsYW5jZUVsZW1lbnQgPSBtZXNzYWdlTGlzdC5wYXJlbnRFbGVtZW50O1xuICAgICAgICAgICAgLy8gaWYgdGhlIG9mZnNldE5vZGUgZ290IHVubW91bnRlZCwgY2xlYXJcbiAgICAgICAgICAgIGxldCBzaG91bGRDbGVhciA9ICFvZmZzZXROb2RlLnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICAvLyBhbHNvIGlmIDIwMHB4IGZyb20gYm90dG9tXG4gICAgICAgICAgICBpZiAoIXNob3VsZENsZWFyICYmICFzY3JvbGxTdGF0ZS5zdHVja0F0Qm90dG9tKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BhY2VCZWxvd1ZpZXdwb3J0ID0gc24uc2Nyb2xsSGVpZ2h0IC0gKHNuLnNjcm9sbFRvcCArIHNuLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgc2hvdWxkQ2xlYXIgPSBzcGFjZUJlbG93Vmlld3BvcnQgPj0gMjAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdHJ5IHVwZGF0aW5nIGlmIG5vdCBjbGVhcmluZ1xuICAgICAgICAgICAgaWYgKCFzaG91bGRDbGVhcikge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRPZmZzZXQgPSBtZXNzYWdlTGlzdC5jbGllbnRIZWlnaHQgLSAob2Zmc2V0Tm9kZS5vZmZzZXRUb3AgKyBvZmZzZXROb2RlLmNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0RGlmZiA9IG9mZnNldEZyb21Cb3R0b20gLSBjdXJyZW50T2Zmc2V0O1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXREaWZmID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBiYWxhbmNlRWxlbWVudC5zdHlsZS5wYWRkaW5nQm90dG9tID0gYCR7b2Zmc2V0RGlmZn1weGA7XG4gICAgICAgICAgICAgICAgICAgIGRlYnVnbG9nKFwidXBkYXRlIHByZXZlbnQgc2hyaW5raW5nIFwiLCBvZmZzZXREaWZmLCBcInB4IGZyb20gYm90dG9tXCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0RGlmZiA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ2xlYXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzaG91bGRDbGVhcikge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJQcmV2ZW50U2hyaW5raW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBUT0RPOiB0aGUgY2xhc3NuYW1lcyBvbiB0aGUgZGl2IGFuZCBvbCBjb3VsZCBkbyB3aXRoIGJlaW5nIHVwZGF0ZWQgdG9cbiAgICAgICAgLy8gcmVmbGVjdCB0aGUgZmFjdCB0aGF0IHdlIGRvbid0IG5lY2Vzc2FyaWx5IGNvbnRhaW4gYSBsaXN0IG9mIG1lc3NhZ2VzLlxuICAgICAgICAvLyBpdCdzIG5vdCBvYnZpb3VzIHdoeSB3ZSBoYXZlIGEgc2VwYXJhdGUgZGl2IGFuZCBvbCBhbnl3YXkuXG5cbiAgICAgICAgLy8gZ2l2ZSB0aGUgPG9sPiBhbiBleHBsaWNpdCByb2xlPWxpc3QgYmVjYXVzZSBTYWZhcmkrVm9pY2VPdmVyIHNlZW1zIHRvIHRoaW5rIGFuIG9yZGVyZWQtbGlzdCB3aXRoXG4gICAgICAgIC8vIGxpc3Qtc3R5bGUtdHlwZTogbm9uZTsgaXMgbm8gbG9uZ2VyIGEgbGlzdFxuICAgICAgICByZXR1cm4gKDxBdXRvSGlkZVNjcm9sbGJhciB3cmFwcGVkUmVmPXt0aGlzLl9jb2xsZWN0U2Nyb2xsfVxuICAgICAgICAgICAgICAgIG9uU2Nyb2xsPXt0aGlzLm9uU2Nyb2xsfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YG14X1Njcm9sbFBhbmVsICR7dGhpcy5wcm9wcy5jbGFzc05hbWV9YH0gc3R5bGU9e3RoaXMucHJvcHMuc3R5bGV9PlxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuZml4ZWRDaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfbWVzc2FnZUxpc3RXcmFwcGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b2wgcmVmPXt0aGlzLl9pdGVtbGlzdH0gY2xhc3NOYW1lPVwibXhfUm9vbVZpZXdfTWVzc2FnZUxpc3RcIiBhcmlhLWxpdmU9XCJwb2xpdGVcIiByb2xlPVwibGlzdFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlbiB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L29sPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=