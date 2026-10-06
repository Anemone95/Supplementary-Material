"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

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

var _replaceableComponent = require("../../../utils/replaceableComponent");

var _dec, _class, _class2, _temp;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

let TextualBody = (_dec = (0, _replaceableComponent.replaceableComponent)("views.messages.TextualBody"), _dec(_class = (_temp = _class2 = class TextualBody extends _react.default.Component {
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
          if (pres[i].parentNode.className == "mx_EventTile_pre_container") continue; // Add code element if it's missing since we depend on it

          if (pres[i].getElementsByTagName("code").length == 0) {
            this._addCodeElement(pres[i]);
          } // Wrap a div around <pre> so that the copy button can be correctly positioned
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

  _addCodeElement(pre) {
    const code = document.createElement("code");
    code.append(...pre.childNodes);
    pre.appendChild(code);
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
    // Calculate number of lines in pre
    const number = pre.innerHTML.replace(/\n(<\/code>)?$/, "").split(/\n/).length;
    pre.innerHTML = '<span class="mx_EventTile_lineNumbers"></span>' + pre.innerHTML + '<span></span>';
    const lineNumbers = pre.getElementsByClassName("mx_EventTile_lineNumbers")[0]; // Iterate through lines starting with 1 (number of the first line is 1)

    for (let i = 1; i <= number; i++) {
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

}, (0, _defineProperty2.default)(_class2, "propTypes", {
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
}), _temp)) || _class);
exports.default = TextualBody;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL21lc3NhZ2VzL1RleHR1YWxCb2R5LmpzIl0sIm5hbWVzIjpbIlRleHR1YWxCb2R5IiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwiZXZlbnQiLCJzZXRTdGF0ZSIsIndpZGdldEhpZGRlbiIsImdsb2JhbCIsImxvY2FsU3RvcmFnZSIsInNldEl0ZW0iLCJteEV2ZW50IiwiZ2V0SWQiLCJmb3JjZVVwZGF0ZSIsImRpcyIsImRpc3BhdGNoIiwiYWN0aW9uIiwidXNlcl9pZCIsImdldFNlbmRlciIsImlzV2lkZ2V0SGlkZGVuIiwic3RhdGUiLCJ1bmhpZGVXaWRnZXQiLCJyZW1vdmVJdGVtIiwic3RhcnRlckxpbmsiLCJldiIsInByZXZlbnREZWZhdWx0IiwibWFuYWdlcnMiLCJJbnRlZ3JhdGlvbk1hbmFnZXJzIiwic2hhcmVkSW5zdGFuY2UiLCJoYXNNYW5hZ2VyIiwib3Blbk5vTWFuYWdlckRpYWxvZyIsImludGVncmF0aW9uTWFuYWdlciIsImdldFByaW1hcnlNYW5hZ2VyIiwic2NhbGFyQ2xpZW50IiwiZ2V0U2NhbGFyQ2xpZW50IiwiY29ubmVjdCIsInRoZW4iLCJjb21wbGV0ZVVybCIsImdldFN0YXJ0ZXJMaW5rIiwiUXVlc3Rpb25EaWFsb2ciLCJzZGsiLCJnZXRDb21wb25lbnQiLCJpbnRlZ3JhdGlvbnNVcmwiLCJ1aVVybCIsIk1vZGFsIiwiY3JlYXRlVHJhY2tlZERpYWxvZyIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJidXR0b24iLCJvbkZpbmlzaGVkIiwiY29uZmlybWVkIiwid2lkdGgiLCJ3aW5kb3ciLCJzY3JlZW4iLCJoZWlnaHQiLCJsZWZ0IiwidG9wIiwiZmVhdHVyZXMiLCJ3bmQiLCJvcGVuIiwib3BlbmVyIiwiTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nIiwiY3JlYXRlRGlhbG9nIiwiX2NvbnRlbnQiLCJsaW5rcyIsImNvbXBvbmVudERpZE1vdW50IiwiX3VubW91bnRlZCIsIl9waWxscyIsImVkaXRTdGF0ZSIsIl9hcHBseUZvcm1hdHRpbmciLCJzaG93TGluZU51bWJlcnMiLCJTZXR0aW5nc1N0b3JlIiwiZ2V0VmFsdWUiLCJhY3RpdmF0ZVNwb2lsZXJzIiwiY3VycmVudCIsIkh0bWxVdGlscyIsImxpbmtpZnlFbGVtZW50IiwiY2FsY3VsYXRlVXJsUHJldmlldyIsImdldENvbnRlbnQiLCJmb3JtYXQiLCJwcmVzIiwiUmVhY3RET00iLCJmaW5kRE9NTm9kZSIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGVuZ3RoIiwiaSIsInBhcmVudE5vZGUiLCJjbGFzc05hbWUiLCJfYWRkQ29kZUVsZW1lbnQiLCJkaXYiLCJfd3JhcEluRGl2IiwiX2hhbmRsZUNvZGVCbG9ja0V4cGFuc2lvbiIsIl9hZGRDb2RlRXhwYW5zaW9uQnV0dG9uIiwiX2FkZENvZGVDb3B5QnV0dG9uIiwiX2FkZExpbmVOdW1iZXJzIiwiY29kZXMiLCJzZXRUaW1lb3V0IiwiaW5jbHVkZXMiLCJfaGlnaGxpZ2h0Q29kZSIsInByZSIsImNvZGUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJhcHBlbmQiLCJjaGlsZE5vZGVzIiwiYXBwZW5kQ2hpbGQiLCJwZXJjZW50YWdlT2ZWaWV3cG9ydCIsIm9mZnNldEhlaWdodCIsImlubmVySGVpZ2h0Iiwib25jbGljayIsIm9uSGVpZ2h0Q2hhbmdlZCIsImV4cGFuc2lvbkJ1dHRvbkV4aXN0cyIsImdldEVsZW1lbnRzQnlDbGFzc05hbWUiLCJjb3B5Q29kZSIsInN1Y2Nlc3NmdWwiLCJ0ZXh0Q29udGVudCIsImJ1dHRvblJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJHZW5lcmljVGV4dENvbnRleHRNZW51IiwiY2xvc2UiLCJDb250ZXh0TWVudSIsImNyZWF0ZU1lbnUiLCJtZXNzYWdlIiwib25tb3VzZWxlYXZlIiwicmVwbGFjZUNoaWxkIiwibnVtYmVyIiwiaW5uZXJIVE1MIiwicmVwbGFjZSIsInNwbGl0IiwibGluZU51bWJlcnMiLCJoaWdobGlnaHQiLCJoaWdobGlnaHRCbG9jayIsImNsYXNzZXMiLCJmaWx0ZXIiLCJjbCIsInN0YXJ0c1dpdGgiLCJjb21wb25lbnREaWRVcGRhdGUiLCJwcmV2UHJvcHMiLCJzdG9wcGVkRWRpdGluZyIsIm1lc3NhZ2VXYXNFZGl0ZWQiLCJyZXBsYWNpbmdFdmVudElkIiwiY29tcG9uZW50V2lsbFVubW91bnQiLCJzaG91bGRDb21wb25lbnRVcGRhdGUiLCJuZXh0UHJvcHMiLCJuZXh0U3RhdGUiLCJoaWdobGlnaHRzIiwiaGlnaGxpZ2h0TGluayIsInNob3dVcmxQcmV2aWV3IiwiZmluZExpbmtzIiwic2VlbiIsIlNldCIsImxpbmsiLCJoYXMiLCJhZGQiLCJoaWRkZW4iLCJnZXRJdGVtIiwibm9kZXMiLCJub2RlIiwidGFnTmFtZSIsImdldEF0dHJpYnV0ZSIsInNwb2lsZXJDb250YWluZXIiLCJyZWFzb24iLCJTcG9pbGVyIiwicmVtb3ZlQXR0cmlidXRlIiwic3BvaWxlciIsIm91dGVySFRNTCIsInJlbmRlciIsIm5leHRTaWJsaW5nIiwiaXNMaW5rUHJldmlld2FibGUiLCJwdXNoIiwiY2hpbGRyZW4iLCJjb25jYXQiLCJpbmRleE9mIiwidXJsIiwiaG9zdCIsIm1hdGNoIiwidG9Mb3dlckNhc2UiLCJ0cmltIiwiX3JlbmRlckVkaXRlZE1hcmtlciIsImRhdGUiLCJyZXBsYWNpbmdFdmVudERhdGUiLCJkYXRlU3RyaW5nIiwidG9vbHRpcCIsIl9vcGVuSGlzdG9yeURpYWxvZyIsIkVkaXRNZXNzYWdlQ29tcG9zZXIiLCJjb250ZW50Iiwic3RyaXBSZXBseSIsInJlcGxhY2luZ0V2ZW50IiwiUmVwbHlUaHJlYWQiLCJnZXRQYXJlbnRFdmVudElkIiwiYm9keSIsImJvZHlUb0h0bWwiLCJkaXNhYmxlQmlnRW1vamkiLCJtc2d0eXBlIiwic3RyaXBSZXBseUZhbGxiYWNrIiwicmVmIiwiZGF0YSIsIm9uU3RhcnRlckxpbmtDbGljayIsImJpbmQiLCJ3aWRnZXRzIiwiTGlua1ByZXZpZXdXaWRnZXQiLCJtYXAiLCJvbkNhbmNlbENsaWNrIiwib25FbW90ZVNlbmRlckNsaWNrIiwic2VuZGVyIiwibmFtZSIsIlByb3BUeXBlcyIsIm9iamVjdCIsImlzUmVxdWlyZWQiLCJhcnJheSIsInN0cmluZyIsImJvb2wiLCJmdW5jIiwidGlsZVNoYXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBOztBQUNBOztBQUNBOzs7Ozs7OztJQUdxQkEsVyxXQURwQixnREFBcUIsNEJBQXJCLEMsbUNBQUQsTUFDcUJBLFdBRHJCLFNBQ3lDQyxlQUFNQyxTQUQvQyxDQUN5RDtBQXFCckRDLEVBQUFBLFdBQVcsQ0FBQ0MsS0FBRCxFQUFRO0FBQ2YsVUFBTUEsS0FBTjtBQURlLHlEQStUSEMsS0FBSyxJQUFJO0FBQ3JCLFdBQUtDLFFBQUwsQ0FBYztBQUFFQyxRQUFBQSxZQUFZLEVBQUU7QUFBaEIsT0FBZCxFQURxQixDQUVyQjs7QUFDQSxVQUFJQyxNQUFNLENBQUNDLFlBQVgsRUFBeUI7QUFDckJELFFBQUFBLE1BQU0sQ0FBQ0MsWUFBUCxDQUFvQkMsT0FBcEIsQ0FBNEIsa0JBQWtCLEtBQUtOLEtBQUwsQ0FBV08sT0FBWCxDQUFtQkMsS0FBbkIsRUFBOUMsRUFBMEUsR0FBMUU7QUFDSDs7QUFDRCxXQUFLQyxXQUFMO0FBQ0gsS0F0VWtCO0FBQUEsOERBd1VFUixLQUFLLElBQUk7QUFDMUIsWUFBTU0sT0FBTyxHQUFHLEtBQUtQLEtBQUwsQ0FBV08sT0FBM0I7O0FBQ0FHLDBCQUFJQyxRQUFKLENBQWE7QUFDVEMsUUFBQUEsTUFBTSxFQUFFLGdCQURDO0FBRVRDLFFBQUFBLE9BQU8sRUFBRU4sT0FBTyxDQUFDTyxTQUFSO0FBRkEsT0FBYjtBQUlILEtBOVVrQjtBQUFBLDJEQWdWRCxPQUFPO0FBQ3JCQyxNQUFBQSxj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QUwsQ0FBVzBHO0FBTHpCLFVBQVA7QUFPSCxPQVJTLENBQVY7QUFTSDs7QUFFRCxZQUFRMkUsT0FBTyxDQUFDUSxPQUFoQjtBQUNJLFdBQUssU0FBTDtBQUNJLDRCQUNJO0FBQU0sVUFBQSxTQUFTLEVBQUM7QUFBaEIsaUNBRUk7QUFDSSxVQUFBLFNBQVMsRUFBQyxzQkFEZDtBQUVJLFVBQUEsT0FBTyxFQUFFLEtBQUtVO0FBRmxCLFdBSU1oTSxPQUFPLENBQUNpTSxNQUFSLEdBQWlCak0sT0FBTyxDQUFDaU0sTUFBUixDQUFlQyxJQUFoQyxHQUF1Q2xNLE9BQU8sQ0FBQ08sU0FBUixFQUo3QyxDQUZKLFVBU000SyxJQVROLEVBVU1TLE9BVk4sQ0FESjs7QUFjSixXQUFLLFVBQUw7QUFDSSw0QkFDSTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFdBQ01ULElBRE4sRUFFTVMsT0FGTixDQURKOztBQU1KO0FBQVM7QUFDTCw0QkFDSTtBQUFNLFVBQUEsU0FBUyxFQUFDO0FBQWhCLFdBQ01ULElBRE4sRUFFTVMsT0FGTixDQURKO0FBeEJSO0FBK0JIOztBQTNnQm9ELEMsc0RBQ2xDO0FBQ2Y7QUFDQTVMLEVBQUFBLE9BQU8sRUFBRW1NLG1CQUFVQyxNQUFWLENBQWlCQyxVQUZYOztBQUlmO0FBQ0EvRCxFQUFBQSxVQUFVLEVBQUU2RCxtQkFBVUcsS0FMUDs7QUFPZjtBQUNBL0QsRUFBQUEsYUFBYSxFQUFFNEQsbUJBQVVJLE1BUlY7O0FBVWY7QUFDQS9ELEVBQUFBLGNBQWMsRUFBRTJELG1CQUFVSyxJQVhYOztBQWFmO0FBQ0FyRyxFQUFBQSxlQUFlLEVBQUVnRyxtQkFBVU0sSUFkWjs7QUFnQmY7QUFDQUMsRUFBQUEsU0FBUyxFQUFFUCxtQkFBVUk7QUFqQk4sQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNSwgMjAxNiBPcGVuTWFya2V0IEx0ZFxuQ29weXJpZ2h0IDIwMTcgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5IFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7Y3JlYXRlUmVmfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgaGlnaGxpZ2h0IGZyb20gJ2hpZ2hsaWdodC5qcyc7XG5pbXBvcnQgKiBhcyBIdG1sVXRpbHMgZnJvbSAnLi4vLi4vLi4vSHRtbFV0aWxzJztcbmltcG9ydCB7Zm9ybWF0RGF0ZX0gZnJvbSAnLi4vLi4vLi4vRGF0ZVV0aWxzJztcbmltcG9ydCAqIGFzIHNkayBmcm9tICcuLi8uLi8uLi9pbmRleCc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vLi4vLi4vTW9kYWwnO1xuaW1wb3J0IGRpcyBmcm9tICcuLi8uLi8uLi9kaXNwYXRjaGVyL2Rpc3BhdGNoZXInO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudSc7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IFJlcGx5VGhyZWFkIGZyb20gXCIuLi9lbGVtZW50cy9SZXBseVRocmVhZFwiO1xuaW1wb3J0IHtwaWxsaWZ5TGlua3MsIHVubW91bnRQaWxsc30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvcGlsbGlmeSc7XG5pbXBvcnQge0ludGVncmF0aW9uTWFuYWdlcnN9IGZyb20gXCIuLi8uLi8uLi9pbnRlZ3JhdGlvbnMvSW50ZWdyYXRpb25NYW5hZ2Vyc1wiO1xuaW1wb3J0IHtpc1Blcm1hbGlua0hvc3R9IGZyb20gXCIuLi8uLi8uLi91dGlscy9wZXJtYWxpbmtzL1Blcm1hbGlua3NcIjtcbmltcG9ydCB7dG9SaWdodE9mfSBmcm9tIFwiLi4vLi4vc3RydWN0dXJlcy9Db250ZXh0TWVudVwiO1xuaW1wb3J0IHtjb3B5UGxhaW50ZXh0fSBmcm9tIFwiLi4vLi4vLi4vdXRpbHMvc3RyaW5nc1wiO1xuaW1wb3J0IEFjY2Vzc2libGVUb29sdGlwQnV0dG9uIGZyb20gXCIuLi9lbGVtZW50cy9BY2Nlc3NpYmxlVG9vbHRpcEJ1dHRvblwiO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbkByZXBsYWNlYWJsZUNvbXBvbmVudChcInZpZXdzLm1lc3NhZ2VzLlRleHR1YWxCb2R5XCIpXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUZXh0dWFsQm9keSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICAgICAgLyogdGhlIE1hdHJpeEV2ZW50IHRvIHNob3cgKi9cbiAgICAgICAgbXhFdmVudDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuXG4gICAgICAgIC8qIGEgbGlzdCBvZiB3b3JkcyB0byBoaWdobGlnaHQgKi9cbiAgICAgICAgaGlnaGxpZ2h0czogUHJvcFR5cGVzLmFycmF5LFxuXG4gICAgICAgIC8qIGxpbmsgVVJMIGZvciB0aGUgaGlnaGxpZ2h0cyAqL1xuICAgICAgICBoaWdobGlnaHRMaW5rOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgICAgIC8qIHNob3VsZCBzaG93IFVSTCBwcmV2aWV3cyBmb3IgdGhpcyBldmVudCAqL1xuICAgICAgICBzaG93VXJsUHJldmlldzogUHJvcFR5cGVzLmJvb2wsXG5cbiAgICAgICAgLyogY2FsbGJhY2sgZm9yIHdoZW4gb3VyIHdpZGdldCBoYXMgbG9hZGVkICovXG4gICAgICAgIG9uSGVpZ2h0Q2hhbmdlZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgICAgICAgLyogdGhlIHNoYXBlIG9mIHRoZSB0aWxlLCB1c2VkICovXG4gICAgICAgIHRpbGVTaGFwZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMuX2NvbnRlbnQgPSBjcmVhdGVSZWYoKTtcblxuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgLy8gdGhlIFVSTHMgKGlmIGFueSkgdG8gYmUgcHJldmlld2VkIHdpdGggYSBMaW5rUHJldmlld1dpZGdldFxuICAgICAgICAgICAgLy8gaW5zaWRlIHRoaXMgVGV4dHVhbEJvZHkuXG4gICAgICAgICAgICBsaW5rczogW10sXG5cbiAgICAgICAgICAgIC8vIHRyYWNrIHdoZXRoZXIgdGhlIHByZXZpZXcgd2lkZ2V0IGlzIGhpZGRlblxuICAgICAgICAgICAgd2lkZ2V0SGlkZGVuOiBmYWxzZSxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5fdW5tb3VudGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BpbGxzID0gW107XG4gICAgICAgIGlmICghdGhpcy5wcm9wcy5lZGl0U3RhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX2FwcGx5Rm9ybWF0dGluZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2FwcGx5Rm9ybWF0dGluZygpIHtcbiAgICAgICAgY29uc3Qgc2hvd0xpbmVOdW1iZXJzID0gU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcInNob3dDb2RlTGluZU51bWJlcnNcIik7XG4gICAgICAgIHRoaXMuYWN0aXZhdGVTcG9pbGVycyhbdGhpcy5fY29udGVudC5jdXJyZW50XSk7XG5cbiAgICAgICAgLy8gcGlsbGlmeUxpbmtzIEJFRk9SRSBsaW5raWZ5RWxlbWVudCBiZWNhdXNlIHBsYWluIHJvb20vdXNlciBVUkxzIGluIHRoZSBjb21wb3NlclxuICAgICAgICAvLyBhcmUgc3RpbGwgc2VudCBhcyBwbGFpbnRleHQgVVJMcy4gSWYgdGhlc2UgYXJlIGV2ZXIgcGlsbGlmaWVkIGluIHRoZSBjb21wb3NlcixcbiAgICAgICAgLy8gd2Ugc2hvdWxkIGJlIHBpbGxpZnkgdGhlbSBoZXJlIGJ5IGRvaW5nIHRoZSBsaW5raWZ5aW5nIEJFRk9SRSB0aGUgcGlsbGlmeWluZy5cbiAgICAgICAgcGlsbGlmeUxpbmtzKFt0aGlzLl9jb250ZW50LmN1cnJlbnRdLCB0aGlzLnByb3BzLm14RXZlbnQsIHRoaXMuX3BpbGxzKTtcbiAgICAgICAgSHRtbFV0aWxzLmxpbmtpZnlFbGVtZW50KHRoaXMuX2NvbnRlbnQuY3VycmVudCk7XG4gICAgICAgIHRoaXMuY2FsY3VsYXRlVXJsUHJldmlldygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm14RXZlbnQuZ2V0Q29udGVudCgpLmZvcm1hdCA9PT0gXCJvcmcubWF0cml4LmN1c3RvbS5odG1sXCIpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBleHBhbnNpb24gYW5kIGFkZCBidXR0b25zXG4gICAgICAgICAgICBjb25zdCBwcmVzID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcykuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwcmVcIik7XG4gICAgICAgICAgICBpZiAocHJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlIGFscmVhZHkgaXMgYSBkaXYgd3JhcHBpbmcgdGhlIGNvZGVibG9jayB3ZSB3YW50IHRvIHNraXAgdGhpcy5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGFmdGVyIHRoZSBjb2RlYmxvY2sgd2FzIGVkaXRlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXNbaV0ucGFyZW50Tm9kZS5jbGFzc05hbWUgPT0gXCJteF9FdmVudFRpbGVfcHJlX2NvbnRhaW5lclwiKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gQWRkIGNvZGUgZWxlbWVudCBpZiBpdCdzIG1pc3Npbmcgc2luY2Ugd2UgZGVwZW5kIG9uIGl0XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmVzW2ldLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY29kZVwiKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29kZUVsZW1lbnQocHJlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gV3JhcCBhIGRpdiBhcm91bmQgPHByZT4gc28gdGhhdCB0aGUgY29weSBidXR0b24gY2FuIGJlIGNvcnJlY3RseSBwb3NpdGlvbmVkXG4gICAgICAgICAgICAgICAgICAgIC8vIHdoZW4gdGhlIDxwcmU+IG92ZXJmbG93cyBhbmQgaXMgc2Nyb2xsZWQgaG9yaXpvbnRhbGx5LlxuICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXYgPSB0aGlzLl93cmFwSW5EaXYocHJlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUNvZGVCbG9ja0V4cGFuc2lvbihwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYWRkQ29kZUV4cGFuc2lvbkJ1dHRvbihkaXYsIHByZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRDb2RlQ29weUJ1dHRvbihkaXYpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvd0xpbmVOdW1iZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hZGRMaW5lTnVtYmVycyhwcmVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhpZ2hsaWdodCBjb2RlXG4gICAgICAgICAgICBjb25zdCBjb2RlcyA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY29kZVwiKTtcbiAgICAgICAgICAgIGlmIChjb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy8gRG8gdGhpcyBhc3luY2hyb25vdXNseTogcGFyc2luZyBjb2RlIHRha2VzIHRpbWUgYW5kIHdlIGRvbid0XG4gICAgICAgICAgICAgICAgLy8gbmVlZCB0byBibG9jayB0aGUgRE9NIHVwZGF0ZSBvbiBpdC5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3VubW91bnRlZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgY29kZSBhbHJlYWR5IGhhcyB0aGUgaGxqcyBjbGFzcyB3ZSB3YW50IHRvIHNraXAgdGhpcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgaGFwcGVucyBhZnRlciB0aGUgY29kZWJsb2NrIHdhcyBlZGl0ZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29kZXNbaV0uY2xhc3NOYW1lLmluY2x1ZGVzKFwiaGxqc1wiKSkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9oaWdobGlnaHRDb2RlKGNvZGVzW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIDEwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9hZGRDb2RlRWxlbWVudChwcmUpIHtcbiAgICAgICAgY29uc3QgY29kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjb2RlXCIpO1xuICAgICAgICBjb2RlLmFwcGVuZCguLi5wcmUuY2hpbGROb2Rlcyk7XG4gICAgICAgIHByZS5hcHBlbmRDaGlsZChjb2RlKTtcbiAgICB9XG5cbiAgICBfYWRkQ29kZUV4cGFuc2lvbkJ1dHRvbihkaXYsIHByZSkge1xuICAgICAgICAvLyBDYWxjdWxhdGUgaG93IG1hbnkgcGVyY2VudCBkb2VzIHRoZSBwcmUgZWxlbWVudCB0YWtlIHVwLlxuICAgICAgICAvLyBJZiBpdCdzIGxlc3MgdGhhbiAzMCUgd2UgZG9uJ3QgYWRkIHRoZSBleHBhbnNpb24gYnV0dG9uLlxuICAgICAgICBjb25zdCBwZXJjZW50YWdlT2ZWaWV3cG9ydCA9IHByZS5vZmZzZXRIZWlnaHQgLyB3aW5kb3cuaW5uZXJIZWlnaHQgKiAxMDA7XG4gICAgICAgIGlmIChwZXJjZW50YWdlT2ZWaWV3cG9ydCA8IDMwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9idXR0b24gXCI7XG4gICAgICAgIGlmIChwcmUuY2xhc3NOYW1lID09IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlZENvZGVCbG9ja1wiKSB7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2V4cGFuZEJ1dHRvblwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZUJ1dHRvblwiO1xuICAgICAgICB9XG5cbiAgICAgICAgYnV0dG9uLm9uY2xpY2sgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfYnV0dG9uIFwiO1xuICAgICAgICAgICAgaWYgKHByZS5jbGFzc05hbWUgPT0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VkQ29kZUJsb2NrXCIpIHtcbiAgICAgICAgICAgICAgICBwcmUuY2xhc3NOYW1lID0gXCJcIjtcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2NvbGxhcHNlQnV0dG9uXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHByZS5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9jb2xsYXBzZWRDb2RlQmxvY2tcIjtcbiAgICAgICAgICAgICAgICBidXR0b24uY2xhc3NOYW1lICs9IFwibXhfRXZlbnRUaWxlX2V4cGFuZEJ1dHRvblwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCeSBleHBhbmRpbmcvY29sbGFwc2luZyB3ZSBjaGFuZ2VkXG4gICAgICAgICAgICAvLyB0aGUgaGVpZ2h0LCB0aGVyZWZvcmUgd2UgY2FsbCB0aGlzXG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uSGVpZ2h0Q2hhbmdlZCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChidXR0b24pO1xuICAgIH1cblxuICAgIF9hZGRDb2RlQ29weUJ1dHRvbihkaXYpIHtcbiAgICAgICAgY29uc3QgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcIm14X0V2ZW50VGlsZV9idXR0b24gbXhfRXZlbnRUaWxlX2NvcHlCdXR0b24gXCI7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgZXhwYW5zaW9uIGJ1dHRvbiBleGlzdHMuIElmIHNvXG4gICAgICAgIC8vIHdlIHB1dCB0aGUgY29weSBidXR0b24gdG8gdGhlIGJvdHRvbVxuICAgICAgICBjb25zdCBleHBhbnNpb25CdXR0b25FeGlzdHMgPSBkaXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcIm14X0V2ZW50VGlsZV9idXR0b25cIik7XG4gICAgICAgIGlmIChleHBhbnNpb25CdXR0b25FeGlzdHMubGVuZ3RoID4gMCkgYnV0dG9uLmNsYXNzTmFtZSArPSBcIm14X0V2ZW50VGlsZV9idXR0b25Cb3R0b21cIjtcblxuICAgICAgICBidXR0b24ub25jbGljayA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvcHlDb2RlID0gYnV0dG9uLnBhcmVudE5vZGUuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjb2RlXCIpWzBdO1xuICAgICAgICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGF3YWl0IGNvcHlQbGFpbnRleHQoY29weUNvZGUudGV4dENvbnRlbnQpO1xuXG4gICAgICAgICAgICBjb25zdCBidXR0b25SZWN0ID0gYnV0dG9uLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgICAgY29uc3QgR2VuZXJpY1RleHRDb250ZXh0TWVudSA9IHNkay5nZXRDb21wb25lbnQoJ2NvbnRleHRfbWVudXMuR2VuZXJpY1RleHRDb250ZXh0TWVudScpO1xuICAgICAgICAgICAgY29uc3Qge2Nsb3NlfSA9IENvbnRleHRNZW51LmNyZWF0ZU1lbnUoR2VuZXJpY1RleHRDb250ZXh0TWVudSwge1xuICAgICAgICAgICAgICAgIC4uLnRvUmlnaHRPZihidXR0b25SZWN0LCAyKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBzdWNjZXNzZnVsID8gX3QoJ0NvcGllZCEnKSA6IF90KCdGYWlsZWQgdG8gY29weScpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBidXR0b24ub25tb3VzZWxlYXZlID0gY2xvc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgfVxuXG4gICAgX3dyYXBJbkRpdihwcmUpIHtcbiAgICAgICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgZGl2LmNsYXNzTmFtZSA9IFwibXhfRXZlbnRUaWxlX3ByZV9jb250YWluZXJcIjtcblxuICAgICAgICAvLyBJbnNlcnQgY29udGFpbmluZyBkaXYgaW4gcGxhY2Ugb2YgPHByZT4gYmxvY2tcbiAgICAgICAgcHJlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGRpdiwgcHJlKTtcbiAgICAgICAgLy8gQXBwZW5kIDxwcmU+IGJsb2NrIGFuZCBjb3B5IGJ1dHRvbiB0byBjb250YWluZXJcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHByZSk7XG5cbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9XG5cbiAgICBfaGFuZGxlQ29kZUJsb2NrRXhwYW5zaW9uKHByZSkge1xuICAgICAgICBpZiAoIVNldHRpbmdzU3RvcmUuZ2V0VmFsdWUoXCJleHBhbmRDb2RlQnlEZWZhdWx0XCIpKSB7XG4gICAgICAgICAgICBwcmUuY2xhc3NOYW1lID0gXCJteF9FdmVudFRpbGVfY29sbGFwc2VkQ29kZUJsb2NrXCI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfYWRkTGluZU51bWJlcnMocHJlKSB7XG4gICAgICAgIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgbGluZXMgaW4gcHJlXG4gICAgICAgIGNvbnN0IG51bWJlciA9IHByZS5pbm5lckhUTUwucmVwbGFjZSgvXFxuKDxcXC9jb2RlPik/JC8sIFwiXCIpLnNwbGl0KC9cXG4vKS5sZW5ndGg7XG4gICAgICAgIHByZS5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJteF9FdmVudFRpbGVfbGluZU51bWJlcnNcIj48L3NwYW4+JyArIHByZS5pbm5lckhUTUwgKyAnPHNwYW4+PC9zcGFuPic7XG4gICAgICAgIGNvbnN0IGxpbmVOdW1iZXJzID0gcHJlLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJteF9FdmVudFRpbGVfbGluZU51bWJlcnNcIilbMF07XG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBsaW5lcyBzdGFydGluZyB3aXRoIDEgKG51bWJlciBvZiB0aGUgZmlyc3QgbGluZSBpcyAxKVxuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBudW1iZXI7IGkrKykge1xuICAgICAgICAgICAgbGluZU51bWJlcnMuaW5uZXJIVE1MICs9ICc8c3BhbiBjbGFzcz1cIm14X0V2ZW50VGlsZV9saW5lTnVtYmVyXCI+JyArIGkgKyAnPC9zcGFuPic7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfaGlnaGxpZ2h0Q29kZShjb2RlKSB7XG4gICAgICAgIGlmIChTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwiZW5hYmxlU3ludGF4SGlnaGxpZ2h0TGFuZ3VhZ2VEZXRlY3Rpb25cIikpIHtcbiAgICAgICAgICAgIGhpZ2hsaWdodC5oaWdobGlnaHRCbG9jayhjb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE9ubHkgc3ludGF4IGhpZ2hsaWdodCBpZiB0aGVyZSdzIGEgY2xhc3Mgc3RhcnRpbmcgd2l0aCBsYW5ndWFnZS1cbiAgICAgICAgICAgIGNvbnN0IGNsYXNzZXMgPSBjb2RlLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy8pLmZpbHRlcihmdW5jdGlvbihjbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbC5zdGFydHNXaXRoKCdsYW5ndWFnZS0nKSAmJiAhY2wuc3RhcnRzV2l0aCgnbGFuZ3VhZ2UtXycpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjbGFzc2VzLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICAgICAgaGlnaGxpZ2h0LmhpZ2hsaWdodEJsb2NrKGNvZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wcykge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMuZWRpdFN0YXRlKSB7XG4gICAgICAgICAgICBjb25zdCBzdG9wcGVkRWRpdGluZyA9IHByZXZQcm9wcy5lZGl0U3RhdGUgJiYgIXRoaXMucHJvcHMuZWRpdFN0YXRlO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZVdhc0VkaXRlZCA9IHByZXZQcm9wcy5yZXBsYWNpbmdFdmVudElkICE9PSB0aGlzLnByb3BzLnJlcGxhY2luZ0V2ZW50SWQ7XG4gICAgICAgICAgICBpZiAobWVzc2FnZVdhc0VkaXRlZCB8fCBzdG9wcGVkRWRpdGluZykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5Rm9ybWF0dGluZygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgICAgIHRoaXMuX3VubW91bnRlZCA9IHRydWU7XG4gICAgICAgIHVubW91bnRQaWxscyh0aGlzLl9waWxscyk7XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKFwic2hvdWxkQ29tcG9uZW50VXBkYXRlOiBTaG93VXJsUHJldmlldyBmb3IgJXMgaXMgJXNcIiwgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksIHRoaXMucHJvcHMuc2hvd1VybFByZXZpZXcpO1xuXG4gICAgICAgIC8vIGV4cGxvaXQgdGhhdCBldmVudHMgYXJlIGltbXV0YWJsZSA6KVxuICAgICAgICByZXR1cm4gKG5leHRQcm9wcy5teEV2ZW50LmdldElkKCkgIT09IHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpIHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLmhpZ2hsaWdodHMgIT09IHRoaXMucHJvcHMuaGlnaGxpZ2h0cyB8fFxuICAgICAgICAgICAgICAgIG5leHRQcm9wcy5yZXBsYWNpbmdFdmVudElkICE9PSB0aGlzLnByb3BzLnJlcGxhY2luZ0V2ZW50SWQgfHxcbiAgICAgICAgICAgICAgICBuZXh0UHJvcHMuaGlnaGxpZ2h0TGluayAhPT0gdGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rIHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLnNob3dVcmxQcmV2aWV3ICE9PSB0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3IHx8XG4gICAgICAgICAgICAgICAgbmV4dFByb3BzLmVkaXRTdGF0ZSAhPT0gdGhpcy5wcm9wcy5lZGl0U3RhdGUgfHxcbiAgICAgICAgICAgICAgICBuZXh0U3RhdGUubGlua3MgIT09IHRoaXMuc3RhdGUubGlua3MgfHxcbiAgICAgICAgICAgICAgICBuZXh0U3RhdGUud2lkZ2V0SGlkZGVuICE9PSB0aGlzLnN0YXRlLndpZGdldEhpZGRlbik7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlVXJsUHJldmlldygpIHtcbiAgICAgICAgLy9jb25zb2xlLmluZm8oXCJjYWxjdWxhdGVVcmxQcmV2aWV3OiBTaG93VXJsUHJldmlldyBmb3IgJXMgaXMgJXNcIiwgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCksIHRoaXMucHJvcHMuc2hvd1VybFByZXZpZXcpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLnNob3dVcmxQcmV2aWV3KSB7XG4gICAgICAgICAgICAvLyBwYXNzIG9ubHkgdGhlIGZpcnN0IGNoaWxkIHdoaWNoIGlzIHRoZSBldmVudCB0aWxlIG90aGVyd2lzZSB0aGlzIHJlY3Vyc2VzIG9uIGVkaXRlZCBldmVudHNcbiAgICAgICAgICAgIGxldCBsaW5rcyA9IHRoaXMuZmluZExpbmtzKFt0aGlzLl9jb250ZW50LmN1cnJlbnRdKTtcbiAgICAgICAgICAgIGlmIChsaW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAvLyBkZS1kdXAgdGhlIGxpbmtzIChidXQgcHJlc2VydmUgb3JkZXJpbmcpXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcbiAgICAgICAgICAgICAgICBsaW5rcyA9IGxpbmtzLmZpbHRlcigobGluaykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2Vlbi5oYXMobGluaykpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgc2Vlbi5hZGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGxpbmtzOiBsaW5rcyB9KTtcblxuICAgICAgICAgICAgICAgIC8vIGxhenktbG9hZCB0aGUgaGlkZGVuIHN0YXRlIG9mIHRoZSBwcmV2aWV3IHdpZGdldCBmcm9tIGxvY2Fsc3RvcmFnZVxuICAgICAgICAgICAgICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGhpZGRlbiA9IGdsb2JhbC5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZGVfcHJldmlld19cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHdpZGdldEhpZGRlbjogaGlkZGVuIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5saW5rcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgbGlua3M6IFtdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWN0aXZhdGVTcG9pbGVycyhub2Rlcykge1xuICAgICAgICBsZXQgbm9kZSA9IG5vZGVzWzBdO1xuICAgICAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJTUEFOXCIgJiYgdHlwZW9mIG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1teC1zcG9pbGVyXCIpID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BvaWxlckNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHJlYXNvbiA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiZGF0YS1teC1zcG9pbGVyXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFNwb2lsZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdlbGVtZW50cy5TcG9pbGVyJyk7XG4gICAgICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLW14LXNwb2lsZXJcIik7IC8vIHdlIGRvbid0IHdhbnQgdG8gcmVjdXJzZVxuICAgICAgICAgICAgICAgIGNvbnN0IHNwb2lsZXIgPSA8U3BvaWxlclxuICAgICAgICAgICAgICAgICAgICByZWFzb249e3JlYXNvbn1cbiAgICAgICAgICAgICAgICAgICAgY29udGVudEh0bWw9e25vZGUub3V0ZXJIVE1MfVxuICAgICAgICAgICAgICAgIC8+O1xuXG4gICAgICAgICAgICAgICAgUmVhY3RET00ucmVuZGVyKHNwb2lsZXIsIHNwb2lsZXJDb250YWluZXIpO1xuICAgICAgICAgICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoc3BvaWxlckNvbnRhaW5lciwgbm9kZSk7XG5cbiAgICAgICAgICAgICAgICBub2RlID0gc3BvaWxlckNvbnRhaW5lcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGROb2RlcyAmJiBub2RlLmNoaWxkTm9kZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmF0ZVNwb2lsZXJzKG5vZGUuY2hpbGROb2Rlcyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZmluZExpbmtzKG5vZGVzKSB7XG4gICAgICAgIGxldCBsaW5rcyA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgIGlmIChub2RlLnRhZ05hbWUgPT09IFwiQVwiICYmIG5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTGlua1ByZXZpZXdhYmxlKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmtzLnB1c2gobm9kZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudGFnTmFtZSA9PT0gXCJQUkVcIiB8fCBub2RlLnRhZ05hbWUgPT09IFwiQ09ERVwiIHx8XG4gICAgICAgICAgICAgICAgICAgIG5vZGUudGFnTmFtZSA9PT0gXCJCTE9DS1FVT1RFXCIpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpbmtzID0gbGlua3MuY29uY2F0KHRoaXMuZmluZExpbmtzKG5vZGUuY2hpbGRyZW4pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGlua3M7XG4gICAgfVxuXG4gICAgaXNMaW5rUHJldmlld2FibGUobm9kZSkge1xuICAgICAgICAvLyBkb24ndCB0cnkgdG8gcHJldmlldyByZWxhdGl2ZSBsaW5rc1xuICAgICAgICBpZiAoIW5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKS5zdGFydHNXaXRoKFwiaHR0cDovL1wiKSAmJlxuICAgICAgICAgICAgIW5vZGUuZ2V0QXR0cmlidXRlKFwiaHJlZlwiKS5zdGFydHNXaXRoKFwiaHR0cHM6Ly9cIikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGFzIGEgcmFuZG9tIGhldXJpc3RpYyB0byBhdm9pZCBoaWdobGlnaHRpbmcgdGhpbmdzIGxpa2UgXCJmb28ucGxcIlxuICAgICAgICAvLyB3ZSByZXF1aXJlIHRoZSBsaW5rZWQgdGV4dCB0byBlaXRoZXIgaW5jbHVkZSBhIC8gKGVpdGhlciBmcm9tIGh0dHA6Ly9cbiAgICAgICAgLy8gb3IgZnJvbSBhIGZ1bGwgZm9vLmJhci9iYXogc3R5bGUgc2NoZW1lbGVzcyBVUkwpIC0gb3IgYmUgYSBtYXJrZG93bi1zdHlsZVxuICAgICAgICAvLyBsaW5rLCBpbiB3aGljaCBjYXNlIHdlIGNoZWNrIHRoZSB0YXJnZXQgdGV4dCBkaWZmZXJzIGZyb20gdGhlIGxpbmsgdmFsdWUuXG4gICAgICAgIC8vIFRPRE86IG1ha2UgdGhpcyBjb25maWd1cmFibGU/XG4gICAgICAgIGlmIChub2RlLnRleHRDb250ZW50LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJocmVmXCIpO1xuICAgICAgICAgICAgY29uc3QgaG9zdCA9IHVybC5tYXRjaCgvXmh0dHBzPzpcXC9cXC8oLio/KShcXC98JCkvKVsxXTtcblxuICAgICAgICAgICAgLy8gbmV2ZXIgcHJldmlldyBwZXJtYWxpbmtzIChpZiBhbnl0aGluZyB3ZSBzaG91bGQgZ2l2ZSBhIHNtYXJ0XG4gICAgICAgICAgICAvLyBwcmV2aWV3IG9mIHRoZSByb29tL3VzZXIgdGhleSBwb2ludCB0bzogbm9ib2R5IG5lZWRzIHRvIGJlIHJlbWluZGVkXG4gICAgICAgICAgICAvLyB3aGF0IHRoZSBtYXRyaXgudG8gc2l0ZSBsb29rcyBsaWtlKS5cbiAgICAgICAgICAgIGlmIChpc1Blcm1hbGlua0hvc3QoaG9zdCkpIHJldHVybiBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKG5vZGUudGV4dENvbnRlbnQudG9Mb3dlckNhc2UoKS50cmltKCkuc3RhcnRzV2l0aChob3N0LnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICAgICAgLy8gaXQncyBhIFwiZm9vLnBsXCIgc3R5bGUgbGlua1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaXQncyBhIFtmb28gYmFyXShodHRwOi8vZm9vLmNvbSkgc3R5bGUgbGlua1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25DYW5jZWxDbGljayA9IGV2ZW50ID0+IHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHdpZGdldEhpZGRlbjogdHJ1ZSB9KTtcbiAgICAgICAgLy8gRklYTUU6IHBlcnNpc3QgdGhpcyBzb21ld2hlcmUgc21hcnRlciB0aGFuIGxvY2FsIHN0b3JhZ2VcbiAgICAgICAgaWYgKGdsb2JhbC5sb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIGdsb2JhbC5sb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZGVfcHJldmlld19cIiArIHRoaXMucHJvcHMubXhFdmVudC5nZXRJZCgpLCBcIjFcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBvbkVtb3RlU2VuZGVyQ2xpY2sgPSBldmVudCA9PiB7XG4gICAgICAgIGNvbnN0IG14RXZlbnQgPSB0aGlzLnByb3BzLm14RXZlbnQ7XG4gICAgICAgIGRpcy5kaXNwYXRjaCh7XG4gICAgICAgICAgICBhY3Rpb246ICdpbnNlcnRfbWVudGlvbicsXG4gICAgICAgICAgICB1c2VyX2lkOiBteEV2ZW50LmdldFNlbmRlcigpLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZ2V0RXZlbnRUaWxlT3BzID0gKCkgPT4gKHtcbiAgICAgICAgaXNXaWRnZXRIaWRkZW46ICgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0YXRlLndpZGdldEhpZGRlbjtcbiAgICAgICAgfSxcblxuICAgICAgICB1bmhpZGVXaWRnZXQ6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3dpZGdldEhpZGRlbjogZmFsc2V9KTtcbiAgICAgICAgICAgIGlmIChnbG9iYWwubG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsLmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwiaGlkZV9wcmV2aWV3X1wiICsgdGhpcy5wcm9wcy5teEV2ZW50LmdldElkKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgIH0pO1xuXG4gICAgb25TdGFydGVyTGlua0NsaWNrID0gKHN0YXJ0ZXJMaW5rLCBldikgPT4ge1xuICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBXZSBuZWVkIHRvIGFkZCBvbiBvdXIgc2NhbGFyIHRva2VuIHRvIHRoZSBzdGFydGVyIGxpbmssIGJ1dCB3ZSBtYXkgbm90IGhhdmUgb25lIVxuICAgICAgICAvLyBJbiBhZGRpdGlvbiwgd2UgY2FuJ3QgZmV0Y2ggb25lIG9uIGNsaWNrIGFuZCB0aGVuIGdvIHRvIGl0IGltbWVkaWF0ZWx5IGFzIHRoYXRcbiAgICAgICAgLy8gaXMgdGhlbiB0cmVhdGVkIGFzIGEgcG9wdXAhXG4gICAgICAgIC8vIFdlIGNhbiBnZXQgYXJvdW5kIHRoaXMgYnkgZmV0Y2hpbmcgb25lIG5vdyBhbmQgc2hvd2luZyBhIFwiY29uZmlybWF0aW9uIGRpYWxvZ1wiIChodXJyIGh1cnIpXG4gICAgICAgIC8vIHdoaWNoIHJlcXVpcmVzIHRoZSB1c2VyIHRvIGNsaWNrIHRocm91Z2ggYW5kIFRIRU4gd2UgY2FuIG9wZW4gdGhlIGxpbmsgaW4gYSBuZXcgdGFiIGJlY2F1c2VcbiAgICAgICAgLy8gdGhlIHdpbmRvdy5vcGVuIGNvbW1hbmQgb2NjdXJzIGluIHRoZSBzYW1lIHN0YWNrIGZyYW1lIGFzIHRoZSBvbkNsaWNrIGNhbGxiYWNrLlxuXG4gICAgICAgIGNvbnN0IG1hbmFnZXJzID0gSW50ZWdyYXRpb25NYW5hZ2Vycy5zaGFyZWRJbnN0YW5jZSgpO1xuICAgICAgICBpZiAoIW1hbmFnZXJzLmhhc01hbmFnZXIoKSkge1xuICAgICAgICAgICAgbWFuYWdlcnMub3Blbk5vTWFuYWdlckRpYWxvZygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR28gZmV0Y2ggYSBzY2FsYXIgdG9rZW5cbiAgICAgICAgY29uc3QgaW50ZWdyYXRpb25NYW5hZ2VyID0gbWFuYWdlcnMuZ2V0UHJpbWFyeU1hbmFnZXIoKTtcbiAgICAgICAgY29uc3Qgc2NhbGFyQ2xpZW50ID0gaW50ZWdyYXRpb25NYW5hZ2VyLmdldFNjYWxhckNsaWVudCgpO1xuICAgICAgICBzY2FsYXJDbGllbnQuY29ubmVjdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY29tcGxldGVVcmwgPSBzY2FsYXJDbGllbnQuZ2V0U3RhcnRlckxpbmsoc3RhcnRlckxpbmspO1xuICAgICAgICAgICAgY29uc3QgUXVlc3Rpb25EaWFsb2cgPSBzZGsuZ2V0Q29tcG9uZW50KFwiZGlhbG9ncy5RdWVzdGlvbkRpYWxvZ1wiKTtcbiAgICAgICAgICAgIGNvbnN0IGludGVncmF0aW9uc1VybCA9IGludGVncmF0aW9uTWFuYWdlci51aVVybDtcbiAgICAgICAgICAgIE1vZGFsLmNyZWF0ZVRyYWNrZWREaWFsb2coJ0FkZCBhbiBpbnRlZ3JhdGlvbicsICcnLCBRdWVzdGlvbkRpYWxvZywge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBfdChcIkFkZCBhbiBJbnRlZ3JhdGlvblwiKSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgX3QoXCJZb3UgYXJlIGFib3V0IHRvIGJlIHRha2VuIHRvIGEgdGhpcmQtcGFydHkgc2l0ZSBzbyB5b3UgY2FuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImF1dGhlbnRpY2F0ZSB5b3VyIGFjY291bnQgZm9yIHVzZSB3aXRoICUoaW50ZWdyYXRpb25zVXJsKXMuIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIkRvIHlvdSB3aXNoIHRvIGNvbnRpbnVlP1wiLCB7IGludGVncmF0aW9uc1VybDogaW50ZWdyYXRpb25zVXJsIH0pIH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+LFxuICAgICAgICAgICAgICAgIGJ1dHRvbjogX3QoXCJDb250aW51ZVwiKSxcbiAgICAgICAgICAgICAgICBvbkZpbmlzaGVkKGNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbmZpcm1lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoID0gd2luZG93LnNjcmVlbi53aWR0aCA+IDEwMjQgPyAxMDI0IDogd2luZG93LnNjcmVlbi53aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0ID0gd2luZG93LnNjcmVlbi5oZWlnaHQgPiA4MDAgPyA4MDAgOiB3aW5kb3cuc2NyZWVuLmhlaWdodDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbGVmdCA9ICh3aW5kb3cuc2NyZWVuLndpZHRoIC0gd2lkdGgpIC8gMjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG9wID0gKHdpbmRvdy5zY3JlZW4uaGVpZ2h0IC0gaGVpZ2h0KSAvIDI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZlYXR1cmVzID0gYGhlaWdodD0ke2hlaWdodH0sIHdpZHRoPSR7d2lkdGh9LCB0b3A9JHt0b3B9LCBsZWZ0PSR7bGVmdH0sYDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd25kID0gd2luZG93Lm9wZW4oY29tcGxldGVVcmwsICdfYmxhbmsnLCBmZWF0dXJlcyk7XG4gICAgICAgICAgICAgICAgICAgIHduZC5vcGVuZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIF9vcGVuSGlzdG9yeURpYWxvZyA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nID0gc2RrLmdldENvbXBvbmVudChcInZpZXdzLmRpYWxvZ3MuTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nXCIpO1xuICAgICAgICBNb2RhbC5jcmVhdGVEaWFsb2coTWVzc2FnZUVkaXRIaXN0b3J5RGlhbG9nLCB7bXhFdmVudDogdGhpcy5wcm9wcy5teEV2ZW50fSk7XG4gICAgfTtcblxuICAgIF9yZW5kZXJFZGl0ZWRNYXJrZXIoKSB7XG4gICAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLnByb3BzLm14RXZlbnQucmVwbGFjaW5nRXZlbnREYXRlKCk7XG4gICAgICAgIGNvbnN0IGRhdGVTdHJpbmcgPSBkYXRlICYmIGZvcm1hdERhdGUoZGF0ZSk7XG5cbiAgICAgICAgY29uc3QgdG9vbHRpcCA9IDxkaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1Rvb2x0aXBfdGl0bGVcIj5cbiAgICAgICAgICAgICAgICB7X3QoXCJFZGl0ZWQgYXQgJShkYXRlKXNcIiwge2RhdGU6IGRhdGVTdHJpbmd9KX1cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9Ub29sdGlwX3N1YlwiPlxuICAgICAgICAgICAgICAgIHtfdChcIkNsaWNrIHRvIHZpZXcgZWRpdHNcIil9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+O1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9FdmVudFRpbGVfZWRpdGVkXCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9vcGVuSGlzdG9yeURpYWxvZ31cbiAgICAgICAgICAgICAgICB0aXRsZT17X3QoXCJFZGl0ZWQgYXQgJShkYXRlKXMuIENsaWNrIHRvIHZpZXcgZWRpdHMuXCIsIHtkYXRlOiBkYXRlU3RyaW5nfSl9XG4gICAgICAgICAgICAgICAgdG9vbHRpcD17dG9vbHRpcH1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj57YCgke190KFwiZWRpdGVkXCIpfSlgfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvQWNjZXNzaWJsZVRvb2x0aXBCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5lZGl0U3RhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IEVkaXRNZXNzYWdlQ29tcG9zZXIgPSBzZGsuZ2V0Q29tcG9uZW50KCdyb29tcy5FZGl0TWVzc2FnZUNvbXBvc2VyJyk7XG4gICAgICAgICAgICByZXR1cm4gPEVkaXRNZXNzYWdlQ29tcG9zZXIgZWRpdFN0YXRlPXt0aGlzLnByb3BzLmVkaXRTdGF0ZX0gY2xhc3NOYW1lPVwibXhfRXZlbnRUaWxlX2NvbnRlbnRcIiAvPjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBteEV2ZW50ID0gdGhpcy5wcm9wcy5teEV2ZW50O1xuICAgICAgICBjb25zdCBjb250ZW50ID0gbXhFdmVudC5nZXRDb250ZW50KCk7XG5cbiAgICAgICAgLy8gb25seSBzdHJpcCByZXBseSBpZiB0aGlzIGlzIHRoZSBvcmlnaW5hbCByZXBseWluZyBldmVudCwgZWRpdHMgdGhlcmVhZnRlciBkbyBub3QgaGF2ZSB0aGUgZmFsbGJhY2tcbiAgICAgICAgY29uc3Qgc3RyaXBSZXBseSA9ICFteEV2ZW50LnJlcGxhY2luZ0V2ZW50KCkgJiYgUmVwbHlUaHJlYWQuZ2V0UGFyZW50RXZlbnRJZChteEV2ZW50KTtcbiAgICAgICAgbGV0IGJvZHkgPSBIdG1sVXRpbHMuYm9keVRvSHRtbChjb250ZW50LCB0aGlzLnByb3BzLmhpZ2hsaWdodHMsIHtcbiAgICAgICAgICAgIGRpc2FibGVCaWdFbW9qaTogY29udGVudC5tc2d0eXBlID09PSBcIm0uZW1vdGVcIiB8fCAhU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZSgnVGV4dHVhbEJvZHkuZW5hYmxlQmlnRW1vamknKSxcbiAgICAgICAgICAgIC8vIFBhcnQgb2YgUmVwbGllcyBmYWxsYmFjayBzdXBwb3J0XG4gICAgICAgICAgICBzdHJpcFJlcGx5RmFsbGJhY2s6IHN0cmlwUmVwbHksXG4gICAgICAgICAgICByZWY6IHRoaXMuX2NvbnRlbnQsXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5yZXBsYWNpbmdFdmVudElkKSB7XG4gICAgICAgICAgICBib2R5ID0gPD5cbiAgICAgICAgICAgICAgICB7Ym9keX1cbiAgICAgICAgICAgICAgICB7dGhpcy5fcmVuZGVyRWRpdGVkTWFya2VyKCl9XG4gICAgICAgICAgICA8Lz47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rKSB7XG4gICAgICAgICAgICBib2R5ID0gPGEgaHJlZj17dGhpcy5wcm9wcy5oaWdobGlnaHRMaW5rfT57IGJvZHkgfTwvYT47XG4gICAgICAgIH0gZWxzZSBpZiAoY29udGVudC5kYXRhICYmIHR5cGVvZiBjb250ZW50LmRhdGFbXCJvcmcubWF0cml4Lm5lYi5zdGFydGVyX2xpbmtcIl0gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGJvZHkgPSA8YSBocmVmPVwiI1wiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5vblN0YXJ0ZXJMaW5rQ2xpY2suYmluZCh0aGlzLCBjb250ZW50LmRhdGFbXCJvcmcubWF0cml4Lm5lYi5zdGFydGVyX2xpbmtcIl0pfVxuICAgICAgICAgICAgPnsgYm9keSB9PC9hPjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB3aWRnZXRzO1xuICAgICAgICBpZiAodGhpcy5zdGF0ZS5saW5rcy5sZW5ndGggJiYgIXRoaXMuc3RhdGUud2lkZ2V0SGlkZGVuICYmIHRoaXMucHJvcHMuc2hvd1VybFByZXZpZXcpIHtcbiAgICAgICAgICAgIGNvbnN0IExpbmtQcmV2aWV3V2lkZ2V0ID0gc2RrLmdldENvbXBvbmVudCgncm9vbXMuTGlua1ByZXZpZXdXaWRnZXQnKTtcbiAgICAgICAgICAgIHdpZGdldHMgPSB0aGlzLnN0YXRlLmxpbmtzLm1hcCgobGluayk9PntcbiAgICAgICAgICAgICAgICByZXR1cm4gPExpbmtQcmV2aWV3V2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgIGtleT17bGlua31cbiAgICAgICAgICAgICAgICAgICAgbGluaz17bGlua31cbiAgICAgICAgICAgICAgICAgICAgbXhFdmVudD17dGhpcy5wcm9wcy5teEV2ZW50fVxuICAgICAgICAgICAgICAgICAgICBvbkNhbmNlbENsaWNrPXt0aGlzLm9uQ2FuY2VsQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIG9uSGVpZ2h0Q2hhbmdlZD17dGhpcy5wcm9wcy5vbkhlaWdodENoYW5nZWR9XG4gICAgICAgICAgICAgICAgLz47XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAoY29udGVudC5tc2d0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFwibS5lbW90ZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01FbW90ZUJvZHkgbXhfRXZlbnRUaWxlX2NvbnRlbnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICombmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfTUVtb3RlQm9keV9zZW5kZXJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25FbW90ZVNlbmRlckNsaWNrfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgbXhFdmVudC5zZW5kZXIgPyBteEV2ZW50LnNlbmRlci5uYW1lIDogbXhFdmVudC5nZXRTZW5kZXIoKSB9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAmbmJzcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgYm9keSB9XG4gICAgICAgICAgICAgICAgICAgICAgICB7IHdpZGdldHMgfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGNhc2UgXCJtLm5vdGljZVwiOlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01Ob3RpY2VCb2R5IG14X0V2ZW50VGlsZV9jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7IGJvZHkgfVxuICAgICAgICAgICAgICAgICAgICAgICAgeyB3aWRnZXRzIH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICBkZWZhdWx0OiAvLyBpbmNsdWRpbmcgXCJtLnRleHRcIlxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X01UZXh0Qm9keSBteF9FdmVudFRpbGVfY29udGVudFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgeyBib2R5IH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHsgd2lkZ2V0cyB9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19