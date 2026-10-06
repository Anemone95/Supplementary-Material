"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _highlight = _interopRequireDefault(require("highlight.js"));

var HtmlUtils = _interopRequireWildcard(require("../../../HtmlUtils"));

var _DateUtils = require("../../../DateUtils");

var sdk = _interopRequireWildcard(require("../../../index"));

var _Modal = _interopRequireDefault(require("../../../Modal"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _languageHandler = require("../../../languageHandler");

var ContextMenu = _interopRequireWildcard(require("../../structures/ContextMenu"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _ReplyThread = _interopRequireDefault(require("../elements/ReplyThread"));

var _pillify = require("../../../utils/pillify");

var _IntegrationManagers = require("../../../integrations/IntegrationManagers");

var _Permalinks = require("../../../utils/permalinks/Permalinks");

var _strings = require("../../../utils/strings");

var _AccessibleTooltipButton = _interopRequireDefault(require("../elements/AccessibleTooltipButton"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

class TextualBody extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "onCancelClick", event => {
      this.setState({
        widgetHidden: true
      }); // FIXME: persist this somewhere smarter than local storage

      if (global.localStorage) {
        global.localStorage.setItem("hide_preview_" + this.props.mxEvent.getId(), "1");
      }

      this.forceUpdate();
    });
    (0, _defineProperty2.default)(this, "onEmoteSenderClick", event => {
      const mxEvent = this.props.mxEvent;

      _dispatcher.default.dispatch({
        action: 'insert_mention',
        user_id: mxEvent.getSender()
      });
    });
    (0, _defineProperty2.default)(this, "getEventTileOps", () => ({
      isWidgetHidden: () => {
        return this.state.widgetHidden;
      },
      unhideWidget: () => {
        this.setState({
          widgetHidden: false
        });

        if (global.localStorage) {
          global.localStorage.removeItem("hide_preview_" + this.props.mxEvent.getId());
        }
      }
    }));
    (0, _defineProperty2.default)(this, "onStarterLinkClick", (starterLink, ev) => {
      ev.preventDefault(); // We need to add on our scalar token to the starter link, but we may not have one!
      // In addition, we can't fetch one on click and then go to it immediately as that
      // is then treated as a popup!
      // We can get around this by fetching one now and showing a "confirmation dialog" (hurr hurr)
      // which requires the user to click through and THEN we can open the link in a new tab because
      // the window.open command occurs in the same stack frame as the onClick callback.

      const managers = _IntegrationManagers.IntegrationManagers.sharedInstance();

      if (!managers.hasManager()) {
        managers.openNoManagerDialog();
        return;
      } // Go fetch a scalar token


      const integrationManager = managers.getPrimaryManager();
      const scalarClient = integrationManager.getScalarClient();
      scalarClient.connect().then(() => {
        const completeUrl = scalarClient.getStarterLink(starterLink);
        const QuestionDialog = sdk.getComponent("dialogs.QuestionDialog");
        const integrationsUrl = integrationManager.uiUrl;

        _Modal.default.createTrackedDialog('Add an integration', '', QuestionDialog, {
          title: (0, _languageHandler._t)("Add an Integration"),
          description: /*#__PURE__*/_react.default.createElement("div", null, (0, _languageHandler._t)("You are about to be taken to a third-party site so you can " + "authenticate your account for use with %(integrationsUrl)s. " + "Do you wish to continue?", {
            integrationsUrl: integrationsUrl
          })),
          button: (0, _languageHandler._t)("Continue"),

          onFinished(confirmed) {
            if (!confirmed) {
              return;
            }

            const width = window.screen.width > 1024 ? 1024 : window.screen.width;
            const height = window.screen.height > 800 ? 800 : window.screen.height;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            const features = `height=${height}, width=${width}, top=${top}, left=${left},`;
            const wnd = window.open(completeUrl, '_blank', features);
            wnd.opener = null;
          }

        });
      });
    });
    (0, _defineProperty2.default)(this, "_openHistoryDialog", async () => {
      const MessageEditHistoryDialog = sdk.getComponent("views.dialogs.MessageEditHistoryDialog");

      _Modal.default.createDialog(MessageEditHistoryDialog, {
        mxEvent: this.props.mxEvent
      });
    });
    this._content = /*#__PURE__*/(0, _react.createRef)();
    this.state = {
      // the URLs (if any) to be previewed with a LinkPreviewWidget
      // inside this TextualBody.
      links: [],
      // track whether the preview widget is hidden
      widgetHidden: false
    };
  }

  componentDidMount() {
    this._unmounted = false;
    this._pills = [];

    if (!this.props.editState) {
      this._applyFormatting();
    }
  }

  _applyFormatting() {
    const showLineNumbers = _SettingsStore.default.getValue("showCodeLineNumbers");

    this.activateSpoilers([this._content.current]); // pillifyLinks BEFORE linkifyElement because plain room/user URLs in the composer
    // are still sent as plaintext URLs. If these are ever pillified in the composer,
    // we should be pillify them here by doing the linkifying BEFORE the pillifying.

    (0, _pillify.pillifyLinks)([this._content.current], this.props.mxEvent, this._pills);
    HtmlUtils.linkifyElement(this._content.current);
    this.calculateUrlPreview();

    if (this.props.mxEvent.getContent().format === "org.matrix.custom.html") {
      // Handle expansion and add buttons
      const pres = _reactDom.default.findDOMNode(this).getElementsByTagName("pre");

      if (pres.length > 0) {
        for (let i = 0; i < pres.length; i++) {
          // If there already is a div wrapping the codeblock we want to skip this.
          // This happens after the codeblock was edited.
          if (pres[i].parentNode.className == "mx_EventTile_pre_container") continue; // Wrap a div around <pre> so that the copy button can be correctly positioned
          // when the <pre> overflows and is scrolled horizontally.

          const div = this._wrapInDiv(pres[i]);

          this._handleCodeBlockExpansion(pres[i]);

          this._addCodeExpansionButton(div, pres[i]);

          this._addCodeCopyButton(div);

          if (showLineNumbers) {
            this._addLineNumbers(pres[i]);
          }
        }
      } // Highlight code


      const codes = _reactDom.default.findDOMNode(this).getElementsByTagName("code");

      if (codes.length > 0) {
        // Do this asynchronously: parsing code takes time and we don't
        // need to block the DOM update on it.
        setTimeout(() => {
          if (this._unmounted) return;

          for (let i = 0; i < codes.length; i++) {
            // If the code already has the hljs class we want to skip this.
            // This happens after the codeblock was edited.
            if (codes[i].className.includes("hljs")) continue;

            this._highlightCode(codes[i]);
          }
        }, 10);
      }
    }
  }

  _addCodeExpansionButton(div, pre) {
    // Calculate how many percent does the pre element take up.
    // If it's less than 30% we don't add the expansion button.
    const percentageOfViewport = pre.offsetHeight / window.innerHeight * 100;
    if (percentageOfViewport < 30) return;
    const button = document.createElement("span");
    button.className = "mx_EventTile_button ";

    if (pre.className == "mx_EventTile_collapsedCodeBlock") {
      button.className += "mx_EventTile_expandButton";
    } else {
      button.className += "mx_EventTile_collapseButton";
    }

    button.onclick = async () => {
      button.className = "mx_EventTile_button ";

      if (pre.className == "mx_EventTile_collapsedCodeBlock") {
        pre.className = "";
        button.className += "mx_EventTile_collapseButton";
      } else {
        pre.className = "mx_EventTile_collapsedCodeBlock";
        button.className += "mx_EventTile_expandButton";
      } // By expanding/collapsing we changed
      // the height, therefore we call this


      this.props.onHeightChanged();
    };

    div.appendChild(button);
  }

  _addCodeCopyButton(div) {
    const button = document.createElement("span");
    button.className = "mx_EventTile_button mx_EventTile_copyButton "; // Check if expansion button exists. If so
    // we put the copy button to the bottom

    const expansionButtonExists = div.getElementsByClassName("mx_EventTile_button");
    if (expansionButtonExists.length > 0) button.className += "mx_EventTile_buttonBottom";

    button.onclick = async () => {
      const copyCode = button.parentNode.getElementsByTagName("code")[0];
      const successful = await (0, _strings.copyPlaintext)(copyCode.textContent);
      const buttonRect = button.getBoundingClientRect();
      const GenericTextContextMenu = sdk.getComponent('context_menus.GenericTextContextMenu');
      const {
        close
      } = ContextMenu.createMenu(GenericTextContextMenu, _objectSpread(_objectSpread({}, (0, ContextMenu.toRightOf)(buttonRect, 2)), {}, {
        message: successful ? (0, _languageHandler._t)('Copied!') : (0, _languageHandler._t)('Failed to copy')
      }));
      button.onmouseleave = close;
    };

    div.appendChild(button);
  }

  _wrapInDiv(pre) {
    const div = document.createElement("div");
    div.className = "mx_EventTile_pre_container"; // Insert containing div in place of <pre> block

    pre.parentNode.replaceChild(div, pre); // Append <pre> block and copy button to container

    div.appendChild(pre);
    return div;
  }

  _handleCodeBlockExpansion(pre) {
    if (!_SettingsStore.default.getValue("expandCodeByDefault")) {
      pre.className = "mx_EventTile_collapsedCodeBlock";
    }
  }

  _addLineNumbers(pre) {
    pre.innerHTML = '<span class="mx_EventTile_lineNumbers"></span>' + pre.innerHTML + '<span></span>';
    const lineNumbers = pre.getElementsByClassName("mx_EventTile_lineNumbers")[0]; // Calculate number of lines in pre

    const number = pre.innerHTML.split(/\n/).length; // Iterate through lines starting with 1 (number of the first line is 1)

    for (let i = 1; i < number; i++) {
      lineNumbers.innerHTML += '<span class="mx_EventTile_lineNumber">' + i + '</span>';
    }
  }

  _highlightCode(code) {
    if (_SettingsStore.default.getValue("enableSyntaxHighlightLanguageDetection")) {
      _highlight.default.highlightBlock(code);
    } else {
      // Only syntax highlight if there's a class starting with language-
      const classes = code.className.split(/\s+/).filter(function (cl) {
        return cl.startsWith('language-') && !cl.startsWith('language-_');
      });

      if (classes.length != 0) {
        _highlight.default.highlightBlock(code);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (!this.props.editState) {
      const stoppedEditing = prevProps.editState && !this.props.editState;
      const messageWasEdited = prevProps.replacingEventId !== this.props.replacingEventId;

      if (messageWasEdited || stoppedEditing) {
        this._applyFormatting();
      }
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
    (0, _pillify.unmountPills)(this._pills);
  }

  shouldComponentUpdate(nextProps, nextState) {
    //console.info("shouldComponentUpdate: ShowUrlPreview for %s is %s", this.props.mxEvent.getId(), this.props.showUrlPreview);
    // exploit that events are immutable :)
    return nextProps.mxEvent.getId() !== this.props.mxEvent.getId() || nextProps.highlights !== this.props.highlights || nextProps.replacingEventId !== this.props.replacingEventId || nextProps.highlightLink !== this.props.highlightLink || nextProps.showUrlPreview !== this.props.showUrlPreview || nextProps.editState !== this.props.editState || nextState.links !== this.state.links || nextState.widgetHidden !== this.state.widgetHidden;
  }

  calculateUrlPreview() {
    //console.info("calculateUrlPreview: ShowUrlPreview for %s is %s", this.props.mxEvent.getId(), this.props.showUrlPreview);
    if (this.props.showUrlPreview) {
      // pass only the first child which is the event tile otherwise this recurses on edited events
      let links = this.findLinks([this._content.current]);

      if (links.length) {
        // de-dup the links (but preserve ordering)
        const seen = new Set();
        links = links.filter(link => {
          if (seen.has(link)) return false;
          seen.add(link);
          return true;
        });
        this.setState({
          links: links
        }); // lazy-load the hidden state of the preview widget from localstorage

        if (global.localStorage) {
          const hidden = global.localStorage.getItem("hide_preview_" + this.props.mxEvent.getId());
          this.setState({
            widgetHidden: hidden
          });
        }
      } else if (this.state.links.length) {
        this.setState({
          links: []
        });
      }
    }
  }

  activateSpoilers(nodes) {
    let node = nodes[0];

    while (node) {
      if (node.tagName === "SPAN" && typeof node.getAttribute("data-mx-spoiler") === "string") {
        const spoilerContainer = document.createElement('span');
        const reason = node.getAttribute("data-mx-spoiler");
        const Spoiler = sdk.getComponent('elements.Spoiler');
        node.removeAttribute("data-mx-spoiler"); // we don't want to recurse

        const spoiler = /*#__PURE__*/_react.default.createElement(Spoiler, {
          reason: reason,
          contentHtml: node.outerHTML
        });

        _reactDom.default.render(spoiler, spoilerContainer);

        node.parentNode.replaceChild(spoilerContainer, node);
        node = spoilerContainer;
      }

      if (node.childNodes && node.childNodes.length) {
        this.activateSpoilers(node.childNodes);
      }

      node = node.nextSibling;
    }
  }

  findLinks(nodes) {
    let links = [];

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.tagName === "A" && node.getAttribute("href")) {
        if (this.isLinkPreviewable(node)) {
          links.push(node.getAttribute("href"));
        }
      } else if (node.tagName === "PRE" || node.tagName === "CODE" || node.tagName === "BLOCKQUOTE") {
        continue;
      } else if (node.children && node.children.length) {
        links = links.concat(this.findLinks(node.children));
      }
    }

    return links;
  }

  isLinkPreviewable(node) {
    // don't try to preview relative links
    if (!node.getAttribute("href").startsWith("http://") && !node.getAttribute("href").startsWith("https://")) {
      return false;
    } // as a random heuristic to avoid highlighting things like "foo.pl"
    // we require the linked text to either include a / (either from http://
    // or from a full foo.bar/baz style schemeless URL) - or be a markdown-style
    // link, in which case we check the target text differs from the link value.
    // TODO: make this configurable?


    if (node.textContent.indexOf("/") > -1) {
      return true;
    } else {
      const url = node.getAttribute("href");
      const host = url.match(/^https?:\/\/(.*?)(\/|$)/)[1]; // never preview permalinks (if anything we should give a smart
      // preview of the room/user they point to: nobody needs to be reminded
      // what the matrix.to site looks like).

      if ((0, _Permalinks.isPermalinkHost)(host)) return false;

      if (node.textContent.toLowerCase().trim().startsWith(host.toLowerCase())) {
        // it's a "foo.pl" style link
        return false;
      } else {
        // it's a [foo bar](http://foo.com) style link
        return true;
      }
    }
  }

  _renderEditedMarker() {
    const date = this.props.mxEvent.replacingEventDate();
    const dateString = date && (0, _DateUtils.formatDate)(date);

    const tooltip = /*#__PURE__*/_react.default.createElement("div", null, /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_title"
    }, (0, _languageHandler._t)("Edited at %(date)s", {
      date: dateString
    })), /*#__PURE__*/_react.default.createElement("div", {
      className: "mx_Tooltip_sub"
    }, (0, _languageHandler._t)("Click to view edits")));

    return /*#__PURE__*/_react.default.createElement(_AccessibleTooltipButton.default, {
      className: "mx_EventTile_edited",
      onClick: this._openHistoryDialog,
      title: (0, _languageHandler._t)("Edited at %(date)s. Click to view edits.", {
        date: dateString
      }),
      tooltip: tooltip
    }, /*#__PURE__*/_react.default.createElement("span", null, `(${(0, _languageHandler._t)("edited")})`));
  }

  render() {
    if (this.props.editState) {
      const EditMessageComposer = sdk.getComponent('rooms.EditMessageComposer');
      return /*#__PURE__*/_react.default.createElement(EditMessageComposer, {
        editState: this.props.editState,
        className: "mx_EventTile_content"
      });
    }

    const mxEvent = this.props.mxEvent;
    const content = mxEvent.getContent(); // only strip reply if this is the original replying event, edits thereafter do not have the fallback

    const stripReply = !mxEvent.replacingEvent() && _ReplyThread.default.getParentEventId(mxEvent);

    let body = HtmlUtils.bodyToHtml(content, this.props.highlights, {
      disableBigEmoji: content.msgtype === "m.emote" || !_SettingsStore.default.getValue('TextualBody.enableBigEmoji'),
      // Part of Replies fallback support
      stripReplyFallback: stripReply,
      ref: this._content
    });

    if (this.props.replacingEventId) {
      body = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, body, this._renderEditedMarker());
    }

    if (this.props.highlightLink) {
      body = /*#__PURE__*/_react.default.createElement("a", {
        href: this.props.highlightLink
      }, body);
    } else if (content.data && typeof content.data["org.matrix.neb.starter_link"] === "string") {
      body = /*#__PURE__*/_react.default.createElement("a", {
        href: "#",
        onClick: this.onStarterLinkClick.bind(this, content.data["org.matrix.neb.starter_link"])
      }, body);
    }

    let widgets;

    if (this.state.links.length && !this.state.widgetHidden && this.props.showUrlPreview) {
      const LinkPreviewWidget = sdk.getComponent('rooms.LinkPreviewWidget');
      widgets = this.state.links.map(link => {
        return /*#__PURE__*/_react.default.createElement(LinkPreviewWidget, {
          key: link,
          link: link,
          mxEvent: this.props.mxEvent,
          onCancelClick: this.onCancelClick,
          onHeightChanged: this.props.onHeightChanged
        });
      });
    }

    switch (content.msgtype) {
      case "m.emote":
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MEmoteBody mx_EventTile_content"
        }, "*\xA0", /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MEmoteBody_sender",
          onClick: this.onEmoteSenderClick
        }, mxEvent.sender ? mxEvent.sender.name : mxEvent.getSender()), "\xA0", body, widgets);

      case "m.notice":
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MNoticeBody mx_EventTile_content"
        }, body, widgets);

      default:
        // including "m.text"
        return /*#__PURE__*/_react.default.createElement("span", {
          className: "mx_MTextBody mx_EventTile_content"
        }, body, widgets);
    }
  }

}

exports.default = TextualBody;
(0, _defineProperty2.default)(TextualBody, "propTypes", {
  /* the MatrixEvent to show */
  mxEvent: _propTypes.default.object.isRequired,

  /* a list of words to highlight */
  highlights: _propTypes.default.array,

  /* link URL for the highlights */
  highlightLink: _propTypes.default.string,

  /* should show URL previews for this event */
  showUrlPreview: _propTypes.default.bool,

  /* callback for when our widget has loaded */
  onHeightChanged: _propTypes.default.func,

  /* the shape of the tile, used */
  tileShape: _propTypes.default.string
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1RleHR1YWxCb2R5LmpzIl0sIm5hbWVzIjpbIlRleHR1YWxCb2R5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJzZXRTdGF0ZSIsIndpZGdldEhpZGRlbiIsImdsb2JhbCIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJteEV2ZW50IiwiZ2V0SWQiLCJmb3JjZVVwZGF0ZSIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwidXNlcl9pZCIsImdldFNlbmRlciIsImlzV2lkZ2V0SGlkZGVuIiwic3RhdGUiLCJ1bmhpZGVXaWRnZXQiLCJyZW1vdmVJdGVtIiwic3RhcnRlckxpbmsiLCJldiIsInByZXZlbnREZWZhdWx0IiwibWFuYWdlcnMiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic2hhcmVkSW5zdGFuY2UiLCJoYXNNYW5hZ2VyIiwib3Blbk5vTWFuYWdlckRpYWxvZyIsImludGVncmF0aW9uTWFuYWdlciIsImdldFByaW1hcnlNYW5hZ2VyIiwic2NhbGFyQ2xpZW50IiwiZ2V0U2NhbGFyQ2xpZW50IiwiY29ubmVjdCIsInRoZW4iLCJjb21wbGV0ZVVybCIsImdldFN0YXJ0ZXJMaW5rIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJpbnRlZ3JhdGlvbnNVcmwiLCJ1aVVybCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwid2lkdGgiLCJ3aW5kb3ciLCJzY3JlZW4iLCJoZWlnaHQiLCJsZWZ0IiwidG9wIiwiZmVhdHVyZXMiLCJ3bmQiLCJvcGVuIiwib3BlbmVyIiwiTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIiwiY3JlYXRlRGlhbG9nIiwiX2NvbnRlbnQiLCJsaW5rcyIsImNvbXBvbmVudERpZE1vdW50IiwiX3VubW91bnRlZCIsIl9waWxscyIsImVkaXRTdGF0ZSIsIl9hcHBseUZvcm1hdHRpbmciLCJzaG93TGluZU51bWJlcnMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJhY3RpdmF0ZVNwb2lsZXJzIiwiY3VycmVudCIsIkh0bWxVdGlscyIsImxpbmtpZnlFbGVtZW50IiwiY2FsY3VsYXRlVXJsUHJldmlldyIsImdldENvbnRlbnQiLCJmb3JtYXQiLCJwcmVzIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGVuZ3RoIiwiaSIsInBhcmVudE5vZGUiLCJjbGFzc05hbWUiLCJkaXYiLCJfd3JhcEluRGl2IiwiX2hhbmRsZUNvZGVCbG9ja0V4cGFuc2lvbiIsIl9hZGRDb2RlRXhwYW5zaW9uQnV0dG9uIiwiX2FkZENvZGVDb3B5QnV0dG9uIiwiX2FkZExpbmVOdW1iZXJzIiwiY29kZXMiLCJzZXRUaW1lb3V0IiwiaW5jbHVkZXMiLCJfaGlnaGxpZ2h0Q29kZSIsInByZSIsInBlcmNlbnRhZ2VPZlZpZXdwb3J0Iiwib2Zmc2V0SGVpZ2h0IiwiaW5uZXJIZWlnaHQiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmNsaWNrIiwib25IZWlnaHRDaGFuZ2VkIiwiYXBwZW5kQ2hpbGQiLCJleHBhbnNpb25CdXR0b25FeGlzdHMiLCJnZXRFbGVtZW50c0J5Q2xhc3NOYW1lIiwiY29weUNvZGUiLCJzdWNjZXNzZnVsIiwidGV4dENvbnRlbnQiLCJidXR0b25SZWN0IiwiZ2V0Qm91bmRpbmdDbGllbnRSZWN0IiwiR2VuZXJpY1RleHRDb250ZXh0TWVudSIsImNsb3NlIiwiQ29udGV4dE1lbnUiLCJjcmVhdGVNZW51IiwibWVzc2FnZSIsIm9ubW91c2VsZWF2ZSIsInJlcGxhY2VDaGlsZCIsImlubmVySFRNTCIsImxpbmVOdW1iZXJzIiwibnVtYmVyIiwic3BsaXQiLCJjb2RlIiwiaGlnaGxpZ2h0IiwiaGlnaGxpZ2h0QmxvY2siLCJjbGFzc2VzIiwiZmlsdGVyIiwiY2wiLCJzdGFydHNXaXRoIiwiY29tcG9uZW50RGlkVXBkYXRlIiwicHJldlByb3BzIiwic3RvcHBlZEVkaXRpbmciLCJtZXNzYWdlV2FzRWRpdGVkIiwicmVwbGFjaW5nRXZlbnRJZCIsImNvbXBvbmVudFdpbGxVbm1vdW50Iiwic2hvdWxkQ29tcG9uZW50VXBkYXRlIiwibmV4dFByb3BzIiwibmV4dFN0YXRlIiwiaGlnaGxpZ2h0cyIsImhpZ2hsaWdodExpbmsiLCJzaG93VXJsUHJldmlldyIsImZpbmRMaW5rcyIsInNlZW4iLCJTZXQiLCJsaW5rIiwiaGFzIiwiYWRkIiwiaGlkZGVuIiwiZ2V0SXRlbSIsIm5vZGVzIiwibm9kZSIsInRhZ05hbWUiLCJnZXRBdHRyaWJ1dGUiLCJzcG9pbGVyQ29udGFpbmVyIiwicmVhc29uIiwiU3BvaWxlciIsInJlbW92ZUF0dHJpYnV0ZSIsInNwb2lsZXIiLCJvdXRlckhUTUwiLCJyZW5kZXIiLCJjaGlsZE5vZGVzIiwibmV4dFNpYmxpbmciLCJpc0xpbmtQcmV2aWV3YWJsZSIsInB1c2giLCJjaGlsZHJlbiIsImNvbmNhdCIsImluZGV4T2YiLCJ1cmwiLCJob3N0IiwibWF0Y2giLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJfcmVuZGVyRWRpdGVkTWFya2VyIiwiZGF0ZSIsInJlcGxhY2luZ0V2ZW50RGF0ZSIsImRhdGVTdHJpbmciLCJ0b29sdGlwIiwiX29wZW5IaXN0b3J5RGlhbG9nIiwiRWRpdE1lc3NhZ2VDb21wb3NlciIsImNvbnRlbnQiLCJzdHJpcFJlcGx5IiwicmVwbGFjaW5nRXZlbnQiLCJSZXBseVRocmVhZCIsImdldFBhcmVudEV2ZW50SWQiLCJib2R5IiwiYm9keVRvSHRtbCIsImRpc2FibGVCaWdFbW9qaSIsIm1zZ3R5cGUiLCJzdHJpcFJlcGx5RmFsbGJhY2siLCJyZWYiLCJkYXRhIiwib25TdGFydGVyTGlua0NsaWNrIiwiYmluZCIsIndpZGdldHMiLCJMaW5rUHJldmlld1dpZGdldCIsIm1hcCIsIm9uQ2FuY2VsQ2xpY2siLCJvbkVtb3RlU2VuZGVyQ2xpY2siLCJzZW5kZXIiLCJuYW1lIiwiUHJvcFR5cGVzIiwib2JqZWN0IiwiaXNSZXF1aXJlZCIsImFycmF5Iiwic3RyaW5nIiwiYm9vbCIsImZ1bmMiLCJ0aWxlU2hhcGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFrQkE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUE7O0FBQ0E7Ozs7OztBQUVlLE1BQU1BLFdBQU4sU0FBMEJDLGVBQU1DLFNBQWhDLENBQTBDO0FBcUJyREMsRUFBQUEsV0FBVyxDQUFDQyxLQUFELEVBQVE7QUFDZixVQUFNQSxLQUFOO0FBRGUseURBcVRIQyxLQUFLLElBQUk7QUFDckIsV0FBS0MsUUFBTCxDQUFjO0FBQUVDLFFBQUFBLFlBQVksRUFBRTtBQUFoQixPQUFkLEVBRHFCLENBRXJCOztBQUNBLFVBQUlDLE1BQU0sQ0FBQ0MsWUFBWCxFQUF5QjtBQUNyQkQsUUFBQUEsTUFBTSxDQUFDQyxZQUFQLENBQW9CQyxPQUFwQixDQUE0QixrQkFBa0IsS0FBS04sS0FBTCxDQUFXTyxPQUFYLENBQW1CQyxLQUFuQixFQUE5QyxFQUEwRSxHQUExRTtBQUNIOztBQUNELFdBQUtDLFdBQUw7QUFDSCxLQTVUa0I7QUFBQSw4REE4VEVSLEtBQUssSUFBSTtBQUMxQixZQUFNTSxPQUFPLEdBQUcsS0FBS1AsS0FBTCxDQUFXTyxPQUEzQjs7QUFDQUcsMEJBQUlDLFFBQUosQ0FBYTtBQUNUQyxRQUFBQSxNQUFNLEVBQUUsZ0JBREM7QUFFVEMsUUFBQUEsT0FBTyxFQUFFTixPQUFPLENBQUNPLFNBQVI7QUFGQSxPQUFiO0FBSUgsS0FwVWtCO0FBQUEsMkRBc1VELE9BQU87QUFDckJDLE1BQUFBLGNBQWMsRUFBRSxNQUFNO0FBQ2xCLGVBQU8sS0FBS0MsS0FBTCxDQUFXYixZQUFsQjtBQUNILE9BSG9CO0FBS3JCYyxNQUFBQSxZQUFZLEVB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REo7QUF4QlI7QUErQkg7O0FBaGdCb0Q7Ozs4QkFBcENwTSxXLGVBQ0U7QUFDZjtBQUNBVyxFQUFBQSxPQUFPLEVBQUVnTSxtQkFBVUMsTUFBVixDQUFpQkMsVUFGWDs7QUFJZjtBQUNBaEUsRUFBQUEsVUFBVSxFQUFFOEQsbUJBQVVHLEtBTFA7O0FBT2Y7QUFDQWhFLEVBQUFBLGFBQWEsRUFBRTZELG1CQUFVSSxNQVJWOztBQVVmO0FBQ0FoRSxFQUFBQSxjQUFjLEVBQUU0RCxtQkFBVUssSUFYWDs7QUFhZjtBQUNBdkcsRUFBQUEsZUFBZSxFQUFFa0csbUJBQVVNLElBZFo7O0FBZ0JmO0FBQ0FDLEVBQUFBLFNBQVMsRUFBRVAsbUJBQVVJO0FBakJOLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTUsIDIwMTYgT3Blbk1hcmtldCBMdGRcbkNvcHlyaWdodCAyMDE3IE5ldyBWZWN0b3IgTHRkXG5Db3B5cmlnaHQgMjAxOSBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge2NyZWF0ZVJlZn0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGhpZ2hsaWdodCBmcm9tICdoaWdobGlnaHQuanMnO1xuaW1wb3J0ICogYXMgSHRtbFV0aWxzIGZyb20gJy4uLy4uLy4uL0h0bWxVdGlscyc7XG5pbXBvcnQge2Zvcm1hdERhdGV9IGZyb20gJy4uLy4uLy4uL0RhdGVVdGlscyc7XG5pbXBvcnQgKiBhcyBzZGsgZnJvbSAnLi4vLi4vLi4vaW5kZXgnO1xuaW1wb3J0IE1vZGFsIGZyb20gJy4uLy4uLy4uL01vZGFsJztcbmltcG9ydCBkaXMgZnJvbSAnLi4vLi4vLi4vZGlzcGF0Y2hlci9kaXNwYXRjaGVyJztcbmltcG9ydCB7IF90IH0gZnJvbSAnLi4vLi4vLi4vbGFuZ3VhZ2VIYW5kbGVyJztcbmltcG9ydCAqIGFzIENvbnRleHRNZW51IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnUnO1xuaW1wb3J0IFNldHRpbmdzU3RvcmUgZnJvbSBcIi4uLy4uLy4uL3NldHRpbmdzL1NldHRpbmdzU3RvcmVcIjtcbmltcG9ydCBSZXBseVRocmVhZCBmcm9tIFwiLi4vZWxlbWVudHMvUmVwbHlUaHJlYWRcIjtcbmltcG9ydCB7cGlsbGlmeUxpbmtzLCB1bm1vdW50UGlsbHN9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3BpbGxpZnknO1xuaW1wb3J0IHtJbnRlZ3JhdGlvbk1hbmFnZXJzfSBmcm9tIFwiLi4vLi4vLi4vaW50ZWdyYXRpb25zL0ludGVncmF0aW9uTWFuYWdlcnNcIjtcbmltcG9ydCB7aXNQZXJtYWxpbmtIb3N0fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvcGVybWFsaW5rcy9QZXJtYWxpbmtzXCI7XG5pbXBvcnQge3RvUmlnaHRPZn0gZnJvbSBcIi4uLy4uL3N0cnVjdHVyZXMvQ29udGV4dE1lbnVcIjtcbmltcG9ydCB7Y29weVBsYWludGV4dH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3N0cmluZ3NcIjtcbmltcG9ydCBBY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvbiBmcm9tIFwiLi4vZWxlbWVudHMvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVGV4dHVhbEJvZHkgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgICAgIC8qIHRoZSBNYXRyaXhFdmVudCB0byBzaG93ICovXG4gICAgICAgIG14RXZlbnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcblxuICAgICAgICAvKiBhIGxpc3Qgb2Ygd29yZHMgdG8gaGlnaGxpZ2h0ICovXG4gICAgICAgIGhpZ2hsaWdodHM6IFByb3BUeXBlcy5hcnJheSxcblxuICAgICAgICAvKiBsaW5rIFVSTCBmb3IgdGhlIGhpZ2hsaWdodHMgKi9cbiAgICAgICAgaGlnaGxpZ2h0TGluazogUHJvcFR5cGVzLnN0cmluZyxcblxuICAgICAgICAvKiBzaG91bGQgc2hvdyBVUkwgcHJldmlld3MgZm9yIHRoaXMgZXZlbnQgKi9cbiAgICAgICAgc2hvd1VybFByZXZpZXc6IFByb3BUeXBlcy5ib29sLFxuXG4gICAgICAgIC8qIGNhbGxiYWNrIGZvciB3aGVuIG91ciB3aWRnZXQgaGFzIGxvYWRlZCAqL1xuICAgICAgICBvbkhlaWdodENoYW5nZWQ6IFByb3BUeXBlcy5mdW5jLFxuXG4gICAgICAgIC8qIHRoZSBzaGFwZSBvZiB0aGUgdGlsZSwgdXNlZCAqL1xuICAgICAgICB0aWxlU2hhcGU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgfTtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLl9jb250ZW50ID0gY3JlYXRlUmVmKCk7XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIC8vIHRoZSBVUkxzIChpZiBhbnkpIHRvIGJlIHByZXZpZXdlZCB3aXRoIGEgTGlua1ByZXZpZXdXaWRnZXRcbiAgICAgICAgICAgIC8vIGluc2lkZSB0aGlzIFRleHR1YWxCb2R5LlxuICAgICAgICAgICAgbGlua3M6IFtdLFxuXG4gICAgICAgICAgICAvLyB0cmFjayB3aGV0aGVyIHRoZSBwcmV2aWV3IHdpZGdldCBpcyBoaWRkZW5cbiAgICAgICAgICAgIHdpZGdldEhpZGRlbjogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9waWxscyA9IFtdO1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdFN0YXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9hcHBseUZvcm1hdHRpbmcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9hcHBseUZvcm1hdHRpbmcoKSB7XG4gICAgICAgIGNvbnN0IHNob3dMaW5lTnVtYmVycyA9IFNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJzaG93Q29kZUxpbmVOdW1iZXJzXCIpO1xuICAgICAgICB0aGlzLmFjdGl2YXRlU3BvaWxlcnMoW3RoaXMuX2NvbnRlbnQuY3VycmVudF0pO1xuXG4gICAgICAgIC8vIHBpbGxpZnlMaW5rcyBCRUZPUkUgbGlua2lmeUVsZW1lbnQgYmVjYXVzZSBwbGFpbiByb29tL3VzZXIgVVJMcyBpbiB0aGUgY29tcG9zZXJcbiAgICAgICAgLy8gYXJlIHN0aWxsIHNlbnQgYXMgcGxhaW50ZXh0IFVSTHMuIElmIHRoZXNlIGFyZSBldmVyIHBpbGxpZmllZCBpbiB0aGUgY29tcG9zZXIsXG4gICAgICAgIC8vIHdlIHNob3VsZCBiZSBwaWxsaWZ5IHRoZW0gaGVyZSBieSBkb2luZyB0aGUgbGlua2lmeWluZyBCRUZPUkUgdGhlIHBpbGxpZnlpbmcuXG4gICAgICAgIHBpbGxpZnlMaW5rcyhbdGhpcy5fY29udGVudC5jdXJyZW50XSwgdGhpcy5wcm9wcy5teEV2ZW50LCB0aGlzLl9waWxscyk7XG4gICAgICAgIEh0bWxVdGlscy5saW5raWZ5RWxlbWVudCh0aGlzLl9jb250ZW50LmN1cnJlbnQpO1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVVybFByZXZpZXcoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5teEV2ZW50LmdldENvbnRlbnQoKS5mb3JtYXQgPT09IFwib3JnLm1hdHJpeC5jdXN0b20uaHRtbFwiKSB7XG4gICAgICAgICAgICAvLyBIYW5kbGUgZXhwYW5zaW9uIGFuZCBhZGQgYnV0dG9uc1xuICAgICAgICAgICAgY29uc3QgcHJlcyA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicHJlXCIpO1xuICAgICAgICAgICAgaWYgKHByZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSBhbHJlYWR5IGlzIGEgZGl2IHdyYXBwaW5nIHRoZSBjb2RlYmxvY2sgd2Ugd2FudCB0byBza2lwIHRoaXMuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBhZnRlciB0aGUgY29kZWJsb2NrIHdhcyBlZGl0ZWQuXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVzW2ldLnBhcmVudE5vZGUuY2xhc3NOYW1lID09IFwibXhfRXZlbnRUaWxlX3ByZV9jb250YWluZXJcIikgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdyYXAgYSBkaXYgYXJvdW5kIDxwcmU+IHNvIHRoYXQgdGhlIGNvcHkgYnV0dG9uIGNhbiBiZSBjb3JyZWN0bHkgcG9zaXRpb25lZFxuICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIHRoZSA8cHJlPiBvdmVyZmxvd3MgYW5kIGlzIHNjcm9sbGVkIGhvcml6b250YWxseS5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGl2ID0gdGhpcy5fd3JhcEluRGl2KHByZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9oYW5kbGVDb2RlQmxvY2tFeHBhbnNpb24ocHJlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2FkZENvZGVFeHBhbnNpb25CdXR0b24oZGl2LCBwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29kZUNvcHlCdXR0b24oZGl2KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNob3dMaW5lTnVtYmVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkTGluZU51bWJlcnMocHJlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBIaWdobGlnaHQgY29kZVxuICAgICAgICAgICAgY29uc3QgY29kZXMgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNvZGVcIik7XG4gICAgICAgICAgICBpZiAoY29kZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vIERvIHRoaXMgYXN5bmNocm9ub3VzbHk6IHBhcnNpbmcgY29kZSB0YWtlcyB0aW1lIGFuZCB3ZSBkb24ndFxuICAgICAgICAgICAgICAgIC8vIG5lZWQgdG8gYmxvY2sgdGhlIERPTSB1cGRhdGUgb24gaXQuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl91bm1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGNvZGUgYWxyZWFkeSBoYXMgdGhlIGhsanMgY2xhc3Mgd2Ugd2FudCB0byBza2lwIHRoaXMuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgYWZ0ZXIgdGhlIGNvZGVibG9jayB3YXMgZWRpdGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvZGVzW2ldLmNsYXNzTmFtZS5pbmNsdWRlcyhcImhsanNcIikpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faGlnaGxpZ2h0Q29kZShjb2Rlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAxMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfYWRkQ29kZUV4cGFuc2lvbkJ1dHRvbihkaXYsIHByZSkge1xuICAgICAgICAvLyBDYWxjdWxhdGUgaG93IG1hbnkgcGVyY2VudCBkb2VzIHRoZSBwcmUgZWxlbWVudCB0YWtlIHVwLlxuICAgICAgICAvLyBJZiBpdCdzIGxlc3MgdGhhbiAzMCUgd2UgZG9uJ3QgYWRkIHRoZSBleHBhbnNpb24gYnV0dG9uLlxuICAgICAgICBjb25zdCBwZXJjZW50YWdlT2ZWaWV3cG9ydCA9IHByZS5vZmZzZXRIZWlnaHQgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XG4gICAgICAgIGlmIChwZXJjZW50YWdlT2ZWaWV3cG9ydCA8IDMwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9idXR0b24gXCI7XG4gICAgICAgIGlmIChwcmUuY2xhc3NOYW1lID09IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlZENvZGVCbG9ja1wiKSB7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2V4cGFuZEJ1dHRvblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZUJ1dHRvblwiO1xuICAgICAgICB9XG5cbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfYnV0dG9uIFwiO1xuICAgICAgICAgICAgaWYgKHByZS5jbGFzc05hbWUgPT0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VkQ29kZUJsb2NrXCIpIHtcbiAgICAgICAgICAgICAgICBwcmUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlQnV0dG9uXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZS5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZWRDb2RlQmxvY2tcIjtcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2V4cGFuZEJ1dHRvblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCeSBleHBhbmRpbmcvY29sbGFwc2luZyB3ZSBjaGFuZ2VkXG4gICAgICAgICAgICAvLyB0aGUgaGVpZ2h0LCB0aGVyZWZvcmUgd2UgY2FsbCB0aGlzXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cblxuICAgIF9hZGRDb2RlQ29weUJ1dHRvbihkaXYpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9idXR0b24gbXhfRXZlbnRUaWxlX2NvcHlCdXR0b24gXCI7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZXhwYW5zaW9uIGJ1dHRvbiBleGlzdHMuIElmIHNvXG4gICAgICAgIC8vIHdlIHB1dCB0aGUgY29weSBidXR0b24gdG8gdGhlIGJvdHRvbVxuICAgICAgICBjb25zdCBleHBhbnNpb25CdXR0b25FeGlzdHMgPSBkaXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm14X0V2ZW50VGlsZV9idXR0b25cIik7XG4gICAgICAgIGlmIChleHBhbnNpb25CdXR0b25FeGlzdHMubGVuZ3RoID4gMCkgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9idXR0b25Cb3R0b21cIjtcblxuICAgICAgICBidXR0b24ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlDb2RlID0gYnV0dG9uLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjb2RlXCIpWzBdO1xuICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGF3YWl0IGNvcHlQbGFpbnRleHQoY29weUNvZGUudGV4dENvbnRlbnQpO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b25SZWN0ID0gYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgR2VuZXJpY1RleHRDb250ZXh0TWVudSA9IHNkay5nZXRDb21wb25lbnQoJ2NvbnRleHRfbWVudXMuR2VuZXJpY1RleHRDb250ZXh0TWVudScpO1xuICAgICAgICAgICAgY29uc3Qge2Nsb3NlfSA9IENvbnRleHRNZW51LmNyZWF0ZU1lbnUoR2VuZXJpY1RleHRDb250ZXh0TWVudSwge1xuICAgICAgICAgICAgICAgIC4uLnRvUmlnaHRPZihidXR0b25SZWN0LCAyKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBzdWNjZXNzZnVsID8gX3QoJ0NvcGllZCEnKSA6IF90KCdGYWlsZWQgdG8gY29weScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidXR0b24ub25tb3VzZWxlYXZlID0gY2xvc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuXG4gICAgX3dyYXBJbkRpdihwcmUpIHtcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGl2LmNsYXNzTmFtZSA9IFwibXhfRXZlbnRUaWxlX3ByZV9jb250YWluZXJcIjtcblxuICAgICAgICAvLyBJbnNlcnQgY29udGFpbmluZyBkaXYgaW4gcGxhY2Ugb2YgPHByZT4gYmxvY2tcbiAgICAgICAgcHJlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGRpdiwgcHJlKTtcbiAgICAgICAgLy8gQXBwZW5kIDxwcmU+IGJsb2NrIGFuZCBjb3B5IGJ1dHRvbiB0byBjb250YWluZXJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHByZSk7XG5cbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9XG5cbiAgICBfaGFuZGxlQ29kZUJsb2NrRXhwYW5zaW9uKHByZSkge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJleHBhbmRDb2RlQnlEZWZhdWx0XCIpKSB7XG4gICAgICAgICAgICBwcmUuY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VkQ29kZUJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfYWRkTGluZU51bWJlcnMocHJlKSB7XG4gICAgICAgIHByZS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJteF9FdmVudFRpbGVfbGluZU51bWJlcnNcIj48L3NwYW4+JyArIHByZS5pbm5lckhUTUwgKyAnPHNwYW4+PC9zcGFuPic7XG4gICAgICAgIGNvbnN0IGxpbmVOdW1iZXJzID0gcHJlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJteF9FdmVudFRpbGVfbGluZU51bWJlcnNcIilbMF07XG4gICAgICAgIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgbGluZXMgaW4gcHJlXG4gICAgICAgIGNvbnN0IG51bWJlciA9IHByZS5pbm5lckhUTUwuc3BsaXQoL1xcbi8pLmxlbmd0aDtcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGxpbmVzIHN0YXJ0aW5nIHdpdGggMSAobnVtYmVyIG9mIHRoZSBmaXJzdCBsaW5lIGlzIDEpXG4gICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgICAgIGxpbmVOdW1iZXJzLmlubmVySFRNTCArPSAnPHNwYW4gY2xhc3M9XCJteF9FdmVudFRpbGVfbGluZU51bWJlclwiPicgKyBpICsgJzwvc3Bhbj4nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2hpZ2hsaWdodENvZGUoY29kZSkge1xuICAgICAgICBpZiAoU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImVuYWJsZVN5bnRheEhpZ2hsaWdodExhbmd1YWdlRGV0ZWN0aW9uXCIpKSB7XG4gICAgICAgICAgICBoaWdobGlnaHQuaGlnaGxpZ2h0QmxvY2soY29kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBPbmx5IHN5bnRheCBoaWdobGlnaHQgaWYgdGhlcmUncyBhIGNsYXNzIHN0YXJ0aW5nIHdpdGggbGFuZ3VhZ2UtXG4gICAgICAgICAgICBjb25zdCBjbGFzc2VzID0gY29kZS5jbGFzc05hbWUuc3BsaXQoL1xccysvKS5maWx0ZXIoZnVuY3Rpb24oY2wpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2wuc3RhcnRzV2l0aCgnbGFuZ3VhZ2UtJykgJiYgIWNsLnN0YXJ0c1dpdGgoJ2xhbmd1YWdlLV8nKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoY2xhc3Nlcy5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgICAgIGhpZ2hsaWdodC5oaWdobGlnaHRCbG9jayhjb2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMpIHtcbiAgICAgICAgaWYgKCF0aGlzLnByb3BzLmVkaXRTdGF0ZSkge1xuICAgICAgICAgICAgY29uc3Qgc3RvcHBlZEVkaXRpbmcgPSBwcmV2UHJvcHMuZWRpdFN0YXRlICYmICF0aGlzLnByb3BzLmVkaXRTdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VXYXNFZGl0ZWQgPSBwcmV2UHJvcHMucmVwbGFjaW5nRXZlbnRJZCAhPT0gdGhpcy5wcm9wcy5yZXBsYWNpbmdFdmVudElkO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2VXYXNFZGl0ZWQgfHwgc3RvcHBlZEVkaXRpbmcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseUZvcm1hdHRpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgICAgICB0aGlzLl91bm1vdW50ZWQgPSB0cnVlO1xuICAgICAgICB1bm1vdW50UGlsbHModGhpcy5fcGlsbHMpO1xuICAgIH1cblxuICAgIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHMsIG5leHRTdGF0ZSkge1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhcInNob3VsZENvbXBvbmVudFVwZGF0ZTogU2hvd1VybFByZXZpZXcgZm9yICVzIGlzICVzXCIsIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KTtcblxuICAgICAgICAvLyBleHBsb2l0IHRoYXQgZXZlbnRzIGFyZSBpbW11dGFibGUgOilcbiAgICAgICAgcmV0dXJuIChuZXh0UHJvcHMubXhFdmVudC5nZXRJZCgpICE9PSB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSB8fFxuICAgICAgICAgICAgICAgIG5leHRQcm9wcy5oaWdobGlnaHRzICE9PSB0aGlzLnByb3BzLmhpZ2hsaWdodHMgfHxcbiAgICAgICAgICAgICAgICBuZXh0UHJvcHMucmVwbGFjaW5nRXZlbnRJZCAhPT0gdGhpcy5wcm9wcy5yZXBsYWNpbmdFdmVudElkIHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLmhpZ2hsaWdodExpbmsgIT09IHRoaXMucHJvcHMuaGlnaGxpZ2h0TGluayB8fFxuICAgICAgICAgICAgICAgIG5leHRQcm9wcy5zaG93VXJsUHJldmlldyAhPT0gdGhpcy5wcm9wcy5zaG93VXJsUHJldmlldyB8fFxuICAgICAgICAgICAgICAgIG5leHRQcm9wcy5lZGl0U3RhdGUgIT09IHRoaXMucHJvcHMuZWRpdFN0YXRlIHx8XG4gICAgICAgICAgICAgICAgbmV4dFN0YXRlLmxpbmtzICE9PSB0aGlzLnN0YXRlLmxpbmtzIHx8XG4gICAgICAgICAgICAgICAgbmV4dFN0YXRlLndpZGdldEhpZGRlbiAhPT0gdGhpcy5zdGF0ZS53aWRnZXRIaWRkZW4pO1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVVybFByZXZpZXcoKSB7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwiY2FsY3VsYXRlVXJsUHJldmlldzogU2hvd1VybFByZXZpZXcgZm9yICVzIGlzICVzXCIsIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93VXJsUHJldmlldykge1xuICAgICAgICAgICAgLy8gcGFzcyBvbmx5IHRoZSBmaXJzdCBjaGlsZCB3aGljaCBpcyB0aGUgZXZlbnQgdGlsZSBvdGhlcndpc2UgdGhpcyByZWN1cnNlcyBvbiBlZGl0ZWQgZXZlbnRzXG4gICAgICAgICAgICBsZXQgbGlua3MgPSB0aGlzLmZpbmRMaW5rcyhbdGhpcy5fY29udGVudC5jdXJyZW50XSk7XG4gICAgICAgICAgICBpZiAobGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgLy8gZGUtZHVwIHRoZSBsaW5rcyAoYnV0IHByZXNlcnZlIG9yZGVyaW5nKVxuICAgICAgICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgICAgICAgICAgICAgbGlua3MgPSBsaW5rcy5maWx0ZXIoKGxpbmspID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlZW4uaGFzKGxpbmspKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNlZW4uYWRkKGxpbmspO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBsaW5rczogbGlua3MgfSk7XG5cbiAgICAgICAgICAgICAgICAvLyBsYXp5LWxvYWQgdGhlIGhpZGRlbiBzdGF0ZSBvZiB0aGUgcHJldmlldyB3aWRnZXQgZnJvbSBsb2NhbHN0b3JhZ2VcbiAgICAgICAgICAgICAgICBpZiAoZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBoaWRkZW4gPSBnbG9iYWwubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWRlX3ByZXZpZXdfXCIgKyB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyB3aWRnZXRIaWRkZW46IGhpZGRlbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUubGlua3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpbmtzOiBbXSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFjdGl2YXRlU3BvaWxlcnMobm9kZXMpIHtcbiAgICAgICAgbGV0IG5vZGUgPSBub2Rlc1swXTtcbiAgICAgICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09IFwiU1BBTlwiICYmIHR5cGVvZiBub2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbXgtc3BvaWxlclwiKSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNwb2lsZXJDb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCByZWFzb24gPSBub2RlLmdldEF0dHJpYnV0ZShcImRhdGEtbXgtc3BvaWxlclwiKTtcbiAgICAgICAgICAgICAgICBjb25zdCBTcG9pbGVyID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuU3BvaWxlcicpO1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1teC1zcG9pbGVyXCIpOyAvLyB3ZSBkb24ndCB3YW50IHRvIHJlY3Vyc2VcbiAgICAgICAgICAgICAgICBjb25zdCBzcG9pbGVyID0gPFNwb2lsZXJcbiAgICAgICAgICAgICAgICAgICAgcmVhc29uPXtyZWFzb259XG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnRIdG1sPXtub2RlLm91dGVySFRNTH1cbiAgICAgICAgICAgICAgICAvPjtcblxuICAgICAgICAgICAgICAgIFJlYWN0RE9NLnJlbmRlcihzcG9pbGVyLCBzcG9pbGVyQ29udGFpbmVyKTtcbiAgICAgICAgICAgICAgICBub2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHNwb2lsZXJDb250YWluZXIsIG5vZGUpO1xuXG4gICAgICAgICAgICAgICAgbm9kZSA9IHNwb2lsZXJDb250YWluZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChub2RlLmNoaWxkTm9kZXMgJiYgbm9kZS5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZhdGVTcG9pbGVycyhub2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBub2RlID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZpbmRMaW5rcyhub2Rlcykge1xuICAgICAgICBsZXQgbGlua3MgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAobm9kZS50YWdOYW1lID09PSBcIkFcIiAmJiBub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xpbmtQcmV2aWV3YWJsZShub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBsaW5rcy5wdXNoKG5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChub2RlLnRhZ05hbWUgPT09IFwiUFJFXCIgfHwgbm9kZS50YWdOYW1lID09PSBcIkNPREVcIiB8fFxuICAgICAgICAgICAgICAgICAgICBub2RlLnRhZ05hbWUgPT09IFwiQkxPQ0tRVU9URVwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBsaW5rcyA9IGxpbmtzLmNvbmNhdCh0aGlzLmZpbmRMaW5rcyhub2RlLmNoaWxkcmVuKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxpbmtzO1xuICAgIH1cblxuICAgIGlzTGlua1ByZXZpZXdhYmxlKG5vZGUpIHtcbiAgICAgICAgLy8gZG9uJ3QgdHJ5IHRvIHByZXZpZXcgcmVsYXRpdmUgbGlua3NcbiAgICAgICAgaWYgKCFub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikuc3RhcnRzV2l0aChcImh0dHA6Ly9cIikgJiZcbiAgICAgICAgICAgICFub2RlLmdldEF0dHJpYnV0ZShcImhyZWZcIikuc3RhcnRzV2l0aChcImh0dHBzOi8vXCIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBhcyBhIHJhbmRvbSBoZXVyaXN0aWMgdG8gYXZvaWQgaGlnaGxpZ2h0aW5nIHRoaW5ncyBsaWtlIFwiZm9vLnBsXCJcbiAgICAgICAgLy8gd2UgcmVxdWlyZSB0aGUgbGlua2VkIHRleHQgdG8gZWl0aGVyIGluY2x1ZGUgYSAvIChlaXRoZXIgZnJvbSBodHRwOi8vXG4gICAgICAgIC8vIG9yIGZyb20gYSBmdWxsIGZvby5iYXIvYmF6IHN0eWxlIHNjaGVtZWxlc3MgVVJMKSAtIG9yIGJlIGEgbWFya2Rvd24tc3R5bGVcbiAgICAgICAgLy8gbGluaywgaW4gd2hpY2ggY2FzZSB3ZSBjaGVjayB0aGUgdGFyZ2V0IHRleHQgZGlmZmVycyBmcm9tIHRoZSBsaW5rIHZhbHVlLlxuICAgICAgICAvLyBUT0RPOiBtYWtlIHRoaXMgY29uZmlndXJhYmxlP1xuICAgICAgICBpZiAobm9kZS50ZXh0Q29udGVudC5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKTtcbiAgICAgICAgICAgIGNvbnN0IGhvc3QgPSB1cmwubWF0Y2goL15odHRwcz86XFwvXFwvKC4qPykoXFwvfCQpLylbMV07XG5cbiAgICAgICAgICAgIC8vIG5ldmVyIHByZXZpZXcgcGVybWFsaW5rcyAoaWYgYW55dGhpbmcgd2Ugc2hvdWxkIGdpdmUgYSBzbWFydFxuICAgICAgICAgICAgLy8gcHJldmlldyBvZiB0aGUgcm9vbS91c2VyIHRoZXkgcG9pbnQgdG86IG5vYm9keSBuZWVkcyB0byBiZSByZW1pbmRlZFxuICAgICAgICAgICAgLy8gd2hhdCB0aGUgbWF0cml4LnRvIHNpdGUgbG9va3MgbGlrZSkuXG4gICAgICAgICAgICBpZiAoaXNQZXJtYWxpbmtIb3N0KGhvc3QpKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChub2RlLnRleHRDb250ZW50LnRvTG93ZXJDYXNlKCkudHJpbSgpLnN0YXJ0c1dpdGgoaG9zdC50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBcImZvby5wbFwiIHN0eWxlIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBbZm9vIGJhcl0oaHR0cDovL2Zvby5jb20pIHN0eWxlIGxpbmtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uQ2FuY2VsQ2xpY2sgPSBldmVudCA9PiB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyB3aWRnZXRIaWRkZW46IHRydWUgfSk7XG4gICAgICAgIC8vIEZJWE1FOiBwZXJzaXN0IHRoaXMgc29tZXdoZXJlIHNtYXJ0ZXIgdGhhbiBsb2NhbCBzdG9yYWdlXG4gICAgICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICBnbG9iYWwubG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWRlX3ByZXZpZXdfXCIgKyB0aGlzLnByb3BzLm14RXZlbnQuZ2V0SWQoKSwgXCIxXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9O1xuXG4gICAgb25FbW90ZVNlbmRlckNsaWNrID0gZXZlbnQgPT4ge1xuICAgICAgICBjb25zdCBteEV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBkaXMuZGlzcGF0Y2goe1xuICAgICAgICAgICAgYWN0aW9uOiAnaW5zZXJ0X21lbnRpb24nLFxuICAgICAgICAgICAgdXNlcl9pZDogbXhFdmVudC5nZXRTZW5kZXIoKSxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGdldEV2ZW50VGlsZU9wcyA9ICgpID0+ICh7XG4gICAgICAgIGlzV2lkZ2V0SGlkZGVuOiAoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS53aWRnZXRIaWRkZW47XG4gICAgICAgIH0sXG5cbiAgICAgICAgdW5oaWRlV2lkZ2V0OiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHt3aWRnZXRIaWRkZW46IGZhbHNlfSk7XG4gICAgICAgICAgICBpZiAoZ2xvYmFsLmxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcImhpZGVfcHJldmlld19cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIG9uU3RhcnRlckxpbmtDbGljayA9IChzdGFydGVyTGluaywgZXYpID0+IHtcbiAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBhZGQgb24gb3VyIHNjYWxhciB0b2tlbiB0byB0aGUgc3RhcnRlciBsaW5rLCBidXQgd2UgbWF5IG5vdCBoYXZlIG9uZSFcbiAgICAgICAgLy8gSW4gYWRkaXRpb24sIHdlIGNhbid0IGZldGNoIG9uZSBvbiBjbGljayBhbmQgdGhlbiBnbyB0byBpdCBpbW1lZGlhdGVseSBhcyB0aGF0XG4gICAgICAgIC8vIGlzIHRoZW4gdHJlYXRlZCBhcyBhIHBvcHVwIVxuICAgICAgICAvLyBXZSBjYW4gZ2V0IGFyb3VuZCB0aGlzIGJ5IGZldGNoaW5nIG9uZSBub3cgYW5kIHNob3dpbmcgYSBcImNvbmZpcm1hdGlvbiBkaWFsb2dcIiAoaHVyciBodXJyKVxuICAgICAgICAvLyB3aGljaCByZXF1aXJlcyB0aGUgdXNlciB0byBjbGljayB0aHJvdWdoIGFuZCBUSEVOIHdlIGNhbiBvcGVuIHRoZSBsaW5rIGluIGEgbmV3IHRhYiBiZWNhdXNlXG4gICAgICAgIC8vIHRoZSB3aW5kb3cub3BlbiBjb21tYW5kIG9jY3VycyBpbiB0aGUgc2FtZSBzdGFjayBmcmFtZSBhcyB0aGUgb25DbGljayBjYWxsYmFjay5cblxuICAgICAgICBjb25zdCBtYW5hZ2VycyA9IEludGVncmF0aW9uTWFuYWdlcnMuc2hhcmVkSW5zdGFuY2UoKTtcbiAgICAgICAgaWYgKCFtYW5hZ2Vycy5oYXNNYW5hZ2VyKCkpIHtcbiAgICAgICAgICAgIG1hbmFnZXJzLm9wZW5Ob01hbmFnZXJEaWFsb2coKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEdvIGZldGNoIGEgc2NhbGFyIHRva2VuXG4gICAgICAgIGNvbnN0IGludGVncmF0aW9uTWFuYWdlciA9IG1hbmFnZXJzLmdldFByaW1hcnlNYW5hZ2VyKCk7XG4gICAgICAgIGNvbnN0IHNjYWxhckNsaWVudCA9IGludGVncmF0aW9uTWFuYWdlci5nZXRTY2FsYXJDbGllbnQoKTtcbiAgICAgICAgc2NhbGFyQ2xpZW50LmNvbm5lY3QoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRlVXJsID0gc2NhbGFyQ2xpZW50LmdldFN0YXJ0ZXJMaW5rKHN0YXJ0ZXJMaW5rKTtcbiAgICAgICAgICAgIGNvbnN0IFF1ZXN0aW9uRGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcImRpYWxvZ3MuUXVlc3Rpb25EaWFsb2dcIik7XG4gICAgICAgICAgICBjb25zdCBpbnRlZ3JhdGlvbnNVcmwgPSBpbnRlZ3JhdGlvbk1hbmFnZXIudWlVcmw7XG4gICAgICAgICAgICBNb2RhbC5jcmVhdGVUcmFja2VkRGlhbG9nKCdBZGQgYW4gaW50ZWdyYXRpb24nLCAnJywgUXVlc3Rpb25EaWFsb2csIHtcbiAgICAgICAgICAgICAgICB0aXRsZTogX3QoXCJBZGQgYW4gSW50ZWdyYXRpb25cIiksXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IF90KFwiWW91IGFyZSBhYm91dCB0byBiZSB0YWtlbiB0byBhIHRoaXJkLXBhcnR5IHNpdGUgc28geW91IGNhbiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhdXRoZW50aWNhdGUgeW91ciBhY2NvdW50IGZvciB1c2Ugd2l0aCAlKGludGVncmF0aW9uc1VybClzLiBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJEbyB5b3Ugd2lzaCB0byBjb250aW51ZT9cIiwgeyBpbnRlZ3JhdGlvbnNVcmw6IGludGVncmF0aW9uc1VybCB9KSB9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PixcbiAgICAgICAgICAgICAgICBidXR0b246IF90KFwiQ29udGludWVcIiksXG4gICAgICAgICAgICAgICAgb25GaW5pc2hlZChjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb25maXJtZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWR0aCA9IHdpbmRvdy5zY3JlZW4ud2lkdGggPiAxMDI0ID8gMTAyNCA6IHdpbmRvdy5zY3JlZW4ud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodCA9IHdpbmRvdy5zY3JlZW4uaGVpZ2h0ID4gODAwID8gODAwIDogd2luZG93LnNjcmVlbi5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlZnQgPSAod2luZG93LnNjcmVlbi53aWR0aCAtIHdpZHRoKSAvIDI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvcCA9ICh3aW5kb3cuc2NyZWVuLmhlaWdodCAtIGhlaWdodCkgLyAyO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmZWF0dXJlcyA9IGBoZWlnaHQ9JHtoZWlnaHR9LCB3aWR0aD0ke3dpZHRofSwgdG9wPSR7dG9wfSwgbGVmdD0ke2xlZnR9LGA7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHduZCA9IHdpbmRvdy5vcGVuKGNvbXBsZXRlVXJsLCAnX2JsYW5rJywgZmVhdHVyZXMpO1xuICAgICAgICAgICAgICAgICAgICB3bmQub3BlbmVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBfb3Blbkhpc3RvcnlEaWFsb2cgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IE1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZyA9IHNkay5nZXRDb21wb25lbnQoXCJ2aWV3cy5kaWFsb2dzLk1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZ1wiKTtcbiAgICAgICAgTW9kYWwuY3JlYXRlRGlhbG9nKE1lc3NhZ2VFZGl0SGlzdG9yeURpYWxvZywge214RXZlbnQ6IHRoaXMucHJvcHMubXhFdmVudH0pO1xuICAgIH07XG5cbiAgICBfcmVuZGVyRWRpdGVkTWFya2VyKCkge1xuICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5wcm9wcy5teEV2ZW50LnJlcGxhY2luZ0V2ZW50RGF0ZSgpO1xuICAgICAgICBjb25zdCBkYXRlU3RyaW5nID0gZGF0ZSAmJiBmb3JtYXREYXRlKGRhdGUpO1xuXG4gICAgICAgIGNvbnN0IHRvb2x0aXAgPSA8ZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3RpdGxlXCI+XG4gICAgICAgICAgICAgICAge190KFwiRWRpdGVkIGF0ICUoZGF0ZSlzXCIsIHtkYXRlOiBkYXRlU3RyaW5nfSl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXhfVG9vbHRpcF9zdWJcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJDbGljayB0byB2aWV3IGVkaXRzXCIpfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PjtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPEFjY2Vzc2libGVUb29sdGlwQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2VkaXRlZFwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb3Blbkhpc3RvcnlEaWFsb2d9XG4gICAgICAgICAgICAgICAgdGl0bGU9e190KFwiRWRpdGVkIGF0ICUoZGF0ZSlzLiBDbGljayB0byB2aWV3IGVkaXRzLlwiLCB7ZGF0ZTogZGF0ZVN0cmluZ30pfVxuICAgICAgICAgICAgICAgIHRvb2x0aXA9e3Rvb2x0aXB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+e2AoJHtfdChcImVkaXRlZFwiKX0pYH08L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVUb29sdGlwQnV0dG9uPlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZWRpdFN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBFZGl0TWVzc2FnZUNvbXBvc2VyID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuRWRpdE1lc3NhZ2VDb21wb3NlcicpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGl0TWVzc2FnZUNvbXBvc2VyIGVkaXRTdGF0ZT17dGhpcy5wcm9wcy5lZGl0U3RhdGV9IGNsYXNzTmFtZT1cIm14X0V2ZW50VGlsZV9jb250ZW50XCIgLz47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbXhFdmVudCA9IHRoaXMucHJvcHMubXhFdmVudDtcbiAgICAgICAgY29uc3QgY29udGVudCA9IG14RXZlbnQuZ2V0Q29udGVudCgpO1xuXG4gICAgICAgIC8vIG9ubHkgc3RyaXAgcmVwbHkgaWYgdGhpcyBpcyB0aGUgb3JpZ2luYWwgcmVwbHlpbmcgZXZlbnQsIGVkaXRzIHRoZXJlYWZ0ZXIgZG8gbm90IGhhdmUgdGhlIGZhbGxiYWNrXG4gICAgICAgIGNvbnN0IHN0cmlwUmVwbHkgPSAhbXhFdmVudC5yZXBsYWNpbmdFdmVudCgpICYmIFJlcGx5VGhyZWFkLmdldFBhcmVudEV2ZW50SWQobXhFdmVudCk7XG4gICAgICAgIGxldCBib2R5ID0gSHRtbFV0aWxzLmJvZHlUb0h0bWwoY29udGVudCwgdGhpcy5wcm9wcy5oaWdobGlnaHRzLCB7XG4gICAgICAgICAgICBkaXNhYmxlQmlnRW1vamk6IGNvbnRlbnQubXNndHlwZSA9PT0gXCJtLmVtb3RlXCIgfHwgIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoJ1RleHR1YWxCb2R5LmVuYWJsZUJpZ0Vtb2ppJyksXG4gICAgICAgICAgICAvLyBQYXJ0IG9mIFJlcGxpZXMgZmFsbGJhY2sgc3VwcG9ydFxuICAgICAgICAgICAgc3RyaXBSZXBseUZhbGxiYWNrOiBzdHJpcFJlcGx5LFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9jb250ZW50LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucmVwbGFjaW5nRXZlbnRJZCkge1xuICAgICAgICAgICAgYm9keSA9IDw+XG4gICAgICAgICAgICAgICAge2JvZHl9XG4gICAgICAgICAgICAgICAge3RoaXMuX3JlbmRlckVkaXRlZE1hcmtlcigpfVxuICAgICAgICAgICAgPC8+O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuaGlnaGxpZ2h0TGluaykge1xuICAgICAgICAgICAgYm9keSA9IDxhIGhyZWY9e3RoaXMucHJvcHMuaGlnaGxpZ2h0TGlua30+eyBib2R5IH08L2E+O1xuICAgICAgICB9IGVsc2UgaWYgKGNvbnRlbnQuZGF0YSAmJiB0eXBlb2YgY29udGVudC5kYXRhW1wib3JnLm1hdHJpeC5uZWIuc3RhcnRlcl9saW5rXCJdID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBib2R5ID0gPGEgaHJlZj1cIiNcIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25TdGFydGVyTGlua0NsaWNrLmJpbmQodGhpcywgY29udGVudC5kYXRhW1wib3JnLm1hdHJpeC5uZWIuc3RhcnRlcl9saW5rXCJdKX1cbiAgICAgICAgICAgID57IGJvZHkgfTwvYT47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgd2lkZ2V0cztcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUubGlua3MubGVuZ3RoICYmICF0aGlzLnN0YXRlLndpZGdldEhpZGRlbiAmJiB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KSB7XG4gICAgICAgICAgICBjb25zdCBMaW5rUHJldmlld1dpZGdldCA9IHNkay5nZXRDb21wb25lbnQoJ3Jvb21zLkxpbmtQcmV2aWV3V2lkZ2V0Jyk7XG4gICAgICAgICAgICB3aWRnZXRzID0gdGhpcy5zdGF0ZS5saW5rcy5tYXAoKGxpbmspPT57XG4gICAgICAgICAgICAgICAgcmV0dXJuIDxMaW5rUHJldmlld1dpZGdldFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17bGlua31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5rPXtsaW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG14RXZlbnQ9e3RoaXMucHJvcHMubXhFdmVudH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25IZWlnaHRDaGFuZ2VkPXt0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZH0gLz47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoY29udGVudC5tc2d0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwibS5lbW90ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01FbW90ZUJvZHkgbXhfRXZlbnRUaWxlX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICombmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTUVtb3RlQm9keV9zZW5kZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FbW90ZVNlbmRlckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbXhFdmVudC5zZW5kZXIgPyBteEV2ZW50LnNlbmRlci5uYW1lIDogbXhFdmVudC5nZXRTZW5kZXIoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHdpZGdldHMgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgXCJtLm5vdGljZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01Ob3RpY2VCb2R5IG14X0V2ZW50VGlsZV9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB3aWRnZXRzIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBpbmNsdWRpbmcgXCJtLnRleHRcIlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01UZXh0Qm9keSBteF9FdmVudFRpbGVfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgd2lkZ2V0cyB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19