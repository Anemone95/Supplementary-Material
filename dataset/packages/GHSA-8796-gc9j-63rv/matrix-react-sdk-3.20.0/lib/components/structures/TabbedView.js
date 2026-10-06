"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Tab = void 0;

var React = _interopRequireWildcard(require("react"));

var _languageHandler = require("../../languageHandler");

var sdk = _interopRequireWildcard(require("../../index"));

var _AutoHideScrollbar = _interopRequireDefault(require("./AutoHideScrollbar"));

var _replaceableComponent = require("../../utils/replaceableComponent");

var _dec, _class;

/**
 * Represents a tab for the TabbedView.
 */
class Tab {
  /**
   * Creates a new tab.
   * @param {string} id The tab's ID.
   * @param {string} label The untranslated tab label.
   * @param {string} icon The class for the tab icon. This should be a simple mask.
   * @param {React.ReactNode} body The JSX for the tab container.
   */
  constructor(id
  /*: string*/
  , label
  /*: string*/
  , icon
  /*: string*/
  , body
  /*: React.ReactNode*/
  ) {
    this.id
    /*:: */
    = id
    /*:: */
    ;
    this.label
    /*:: */
    = label
    /*:: */
    ;
    this.icon
    /*:: */
    = icon
    /*:: */
    ;
    this.body
    /*:: */
    = body
    /*:: */
    ;
  }

}

exports.Tab = Tab;
let TabbedView = (_dec = (0, _replaceableComponent.replaceableComponent)("structures.TabbedView"), _dec(_class = class TabbedView extends React.Component
/*:: <IProps, IState>*/
{
  constructor(props
  /*: IProps*/
  ) {
    super(props);
    let activeTabIndex = 0;

    if (props.initialTabId) {
      const tabIndex = props.tabs.findIndex(t => t.id === props.initialTabId);
      if (tabIndex >= 0) activeTabIndex = tabIndex;
    }

    this.state = {
      activeTabIndex
    };
  }

  _getActiveTabIndex() {
    if (!this.state || !this.state.activeTabIndex) return 0;
    return this.state.activeTabIndex;
  }
  /**
   * Shows the given tab
   * @param {Tab} tab the tab to show
   * @private
   */


  _setActiveTab(tab
  /*: Tab*/
  ) {
    const idx = this.props.tabs.indexOf(tab);

    if (idx !== -1) {
      this.setState({
        activeTabIndex: idx
      });
    } else {
      console.error("Could not find tab " + tab.label + " in tabs");
    }
  }

  _renderTabLabel(tab
  /*: Tab*/
  ) {
    const AccessibleButton = sdk.getComponent('elements.AccessibleButton');
    let classes = "mx_TabbedView_tabLabel ";
    const idx = this.props.tabs.indexOf(tab);
    if (idx === this._getActiveTabIndex()) classes += "mx_TabbedView_tabLabel_active";
    let tabIcon = null;

    if (tab.icon) {
      tabIcon = /*#__PURE__*/React.createElement("span", {
        className: `mx_TabbedView_maskedIcon ${tab.icon}`
      });
    }

    const onClickHandler = () => this._setActiveTab(tab);

    const label = (0, _languageHandler._t)(tab.label);
    return /*#__PURE__*/React.createElement(AccessibleButton, {
      className: classes,
      key: "tab_label_" + tab.label,
      onClick: onClickHandler
    }, tabIcon, /*#__PURE__*/React.createElement("span", {
      className: "mx_TabbedView_tabLabel_text"
    }, label));
  }

  _renderTabPanel(tab
  /*: Tab*/
  )
  /*: React.ReactNode*/
  {
    return /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabPanel",
      key: "mx_tabpanel_" + tab.label
    }, /*#__PURE__*/React.createElement(_AutoHideScrollbar.default, {
      className: "mx_TabbedView_tabPanelContent"
    }, tab.body));
  }

  render()
  /*: React.ReactNode*/
  {
    const labels = this.props.tabs.map(tab => this._renderTabLabel(tab));

    const panel = this._renderTabPanel(this.props.tabs[this._getActiveTabIndex()]);

    return /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView"
    }, /*#__PURE__*/React.createElement("div", {
      className: "mx_TabbedView_tabLabels"
    }, labels), panel);
  }

}) || _class);
exports.default = TabbedView;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3N0cnVjdHVyZXMvVGFiYmVkVmlldy50c3giXSwibmFtZXMiOlsiVGFiIiwiY29uc3RydWN0b3IiLCJpZCIsImxhYmVsIiwiaWNvbiIsImJvZHkiLCJUYWJiZWRWaWV3IiwiUmVhY3QiLCJDb21wb25lbnQiLCJwcm9wcyIsImFjdGl2ZVRhYkluZGV4IiwiaW5pdGlhbFRhYklkIiwidGFiSW5kZXgiLCJ0YWJzIiwiZmluZEluZGV4IiwidCIsInN0YXRlIiwiX2dldEFjdGl2ZVRhYkluZGV4IiwiX3NldEFjdGl2ZVRhYiIsInRhYiIsImlkeCIsImluZGV4T2YiLCJzZXRTdGF0ZSIsImNvbnNvbGUiLCJlcnJvciIsIl9yZW5kZXJUYWJMYWJlbCIsIkFjY2Vzc2libGVCdXR0b24iLCJzZGsiLCJnZXRDb21wb25lbnQiLCJjbGFzc2VzIiwidGFiSWNvbiIsIm9uQ2xpY2tIYW5kbGVyIiwiX3JlbmRlclRhYlBhbmVsIiwicmVuZGVyIiwibGFiZWxzIiwibWFwIiwicGFuZWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBa0JBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUE7QUFDQTtBQUNBO0FBQ08sTUFBTUEsR0FBTixDQUFVO0FBQ2I7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSUMsRUFBQUEsV0FBVyxDQUFRQztBQUFSO0FBQUEsSUFBMkJDO0FBQTNCO0FBQUEsSUFBaURDO0FBQWpEO0FBQUEsSUFBc0VDO0FBQXRFO0FBQUEsSUFBNkY7QUFBQSxTQUFyRkg7QUFBcUY7QUFBQSxNQUFyRkE7QUFBcUY7QUFBQTtBQUFBLFNBQWxFQztBQUFrRTtBQUFBLE1BQWxFQTtBQUFrRTtBQUFBO0FBQUEsU0FBNUNDO0FBQTRDO0FBQUEsTUFBNUNBO0FBQTRDO0FBQUE7QUFBQSxTQUF2QkM7QUFBdUI7QUFBQSxNQUF2QkE7QUFBdUI7QUFBQTtBQUN2Rzs7QUFUWTs7O0lBc0JJQyxVLFdBRHBCLGdEQUFx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O0FBRU00QixFQUFBQSxNQUFQO0FBQUE7QUFBaUM7QUFDN0IsVUFBTUMsTUFBTSxHQUFHLEtBQUt6QixLQUFMLENBQVdJLElBQVgsQ0FBZ0JzQixHQUFoQixDQUFvQmhCLEdBQUcsSUFBSSxLQUFLTSxlQUFMLENBQXFCTixHQUFyQixDQUEzQixDQUFmOztBQUNBLFVBQU1pQixLQUFLLEdBQUcsS0FBS0osZUFBTCxDQUFxQixLQUFLdkIsS0FBTCxDQUFXSSxJQUFYLENBQWdCLEtBQUtJLGtCQUFMLEVBQWhCLENBQXJCLENBQWQ7O0FBRUEsd0JBQ0k7QUFBSyxNQUFBLFNBQVMsRUFBQztBQUFmLG9CQUNJO0FBQUssTUFBQSxTQUFTLEVBQUM7QUFBZixPQUNLaUIsTUFETCxDQURKLEVBSUtFLEtBSkwsQ0FESjtBQVFIOztBQWxGbUUsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5Db3B5cmlnaHQgMjAxNyBUcmF2aXMgUmFsc3RvblxuQ29weXJpZ2h0IDIwMTkgTmV3IFZlY3RvciBMdGRcbkNvcHlyaWdodCAyMDE5LCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQge190fSBmcm9tICcuLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuaW1wb3J0ICogYXMgc2RrIGZyb20gXCIuLi8uLi9pbmRleFwiO1xuaW1wb3J0IEF1dG9IaWRlU2Nyb2xsYmFyIGZyb20gJy4vQXV0b0hpZGVTY3JvbGxiYXInO1xuaW1wb3J0IHtyZXBsYWNlYWJsZUNvbXBvbmVudH0gZnJvbSBcIi4uLy4uL3V0aWxzL3JlcGxhY2VhYmxlQ29tcG9uZW50XCI7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHRhYiBmb3IgdGhlIFRhYmJlZFZpZXcuXG4gKi9cbmV4cG9ydCBjbGFzcyBUYWIge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgdGFiLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgdGFiJ3MgSUQuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGxhYmVsIFRoZSB1bnRyYW5zbGF0ZWQgdGFiIGxhYmVsLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpY29uIFRoZSBjbGFzcyBmb3IgdGhlIHRhYiBpY29uLiBUaGlzIHNob3VsZCBiZSBhIHNpbXBsZSBtYXNrLlxuICAgICAqIEBwYXJhbSB7UmVhY3QuUmVhY3ROb2RlfSBib2R5IFRoZSBKU1ggZm9yIHRoZSB0YWIgY29udGFpbmVyLlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgbGFiZWw6IHN0cmluZywgcHVibGljIGljb246IHN0cmluZywgcHVibGljIGJvZHk6IFJlYWN0LlJlYWN0Tm9kZSkge1xuICAgIH1cbn1cblxuaW50ZXJmYWNlIElQcm9wcyB7XG4gICAgdGFiczogVGFiW107XG4gICAgaW5pdGlhbFRhYklkPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBhY3RpdmVUYWJJbmRleDogbnVtYmVyO1xufVxuXG5AcmVwbGFjZWFibGVDb21wb25lbnQoXCJzdHJ1Y3R1cmVzLlRhYmJlZFZpZXdcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmJlZFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8SVByb3BzLCBJU3RhdGU+IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wczogSVByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICBsZXQgYWN0aXZlVGFiSW5kZXggPSAwO1xuICAgICAgICBpZiAocHJvcHMuaW5pdGlhbFRhYklkKSB7XG4gICAgICAgICAgICBjb25zdCB0YWJJbmRleCA9IHByb3BzLnRhYnMuZmluZEluZGV4KHQgPT4gdC5pZCA9PT0gcHJvcHMuaW5pdGlhbFRhYklkKTtcbiAgICAgICAgICAgIGlmICh0YWJJbmRleCA+PSAwKSBhY3RpdmVUYWJJbmRleCA9IHRhYkluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGFjdGl2ZVRhYkluZGV4LFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgX2dldEFjdGl2ZVRhYkluZGV4KCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUgfHwgIXRoaXMuc3RhdGUuYWN0aXZlVGFiSW5kZXgpIHJldHVybiAwO1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5hY3RpdmVUYWJJbmRleDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgZ2l2ZW4gdGFiXG4gICAgICogQHBhcmFtIHtUYWJ9IHRhYiB0aGUgdGFiIHRvIHNob3dcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIHByaXZhdGUgX3NldEFjdGl2ZVRhYih0YWI6IFRhYikge1xuICAgICAgICBjb25zdCBpZHggPSB0aGlzLnByb3BzLnRhYnMuaW5kZXhPZih0YWIpO1xuICAgICAgICBpZiAoaWR4ICE9PSAtMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7YWN0aXZlVGFiSW5kZXg6IGlkeH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNvdWxkIG5vdCBmaW5kIHRhYiBcIiArIHRhYi5sYWJlbCArIFwiIGluIHRhYnNcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZW5kZXJUYWJMYWJlbCh0YWI6IFRhYikge1xuICAgICAgICBjb25zdCBBY2Nlc3NpYmxlQnV0dG9uID0gc2RrLmdldENvbXBvbmVudCgnZWxlbWVudHMuQWNjZXNzaWJsZUJ1dHRvbicpO1xuXG4gICAgICAgIGxldCBjbGFzc2VzID0gXCJteF9UYWJiZWRWaWV3X3RhYkxhYmVsIFwiO1xuXG4gICAgICAgIGNvbnN0IGlkeCA9IHRoaXMucHJvcHMudGFicy5pbmRleE9mKHRhYik7XG4gICAgICAgIGlmIChpZHggPT09IHRoaXMuX2dldEFjdGl2ZVRhYkluZGV4KCkpIGNsYXNzZXMgKz0gXCJteF9UYWJiZWRWaWV3X3RhYkxhYmVsX2FjdGl2ZVwiO1xuXG4gICAgICAgIGxldCB0YWJJY29uID0gbnVsbDtcbiAgICAgICAgaWYgKHRhYi5pY29uKSB7XG4gICAgICAgICAgICB0YWJJY29uID0gPHNwYW4gY2xhc3NOYW1lPXtgbXhfVGFiYmVkVmlld19tYXNrZWRJY29uICR7dGFiLmljb259YH0gLz47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvbkNsaWNrSGFuZGxlciA9ICgpID0+IHRoaXMuX3NldEFjdGl2ZVRhYih0YWIpO1xuXG4gICAgICAgIGNvbnN0IGxhYmVsID0gX3QodGFiLmxhYmVsKTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uIGNsYXNzTmFtZT17Y2xhc3Nlc30ga2V5PXtcInRhYl9sYWJlbF9cIiArIHRhYi5sYWJlbH0gb25DbGljaz17b25DbGlja0hhbmRsZXJ9PlxuICAgICAgICAgICAgICAgIHt0YWJJY29ufVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdfdGFiTGFiZWxfdGV4dFwiPlxuICAgICAgICAgICAgICAgICAgICB7IGxhYmVsIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L0FjY2Vzc2libGVCdXR0b24+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVuZGVyVGFiUGFuZWwodGFiOiBUYWIpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteF9UYWJiZWRWaWV3X3RhYlBhbmVsXCIga2V5PXtcIm14X3RhYnBhbmVsX1wiICsgdGFiLmxhYmVsfT5cbiAgICAgICAgICAgICAgICA8QXV0b0hpZGVTY3JvbGxiYXIgY2xhc3NOYW1lPSdteF9UYWJiZWRWaWV3X3RhYlBhbmVsQ29udGVudCc+XG4gICAgICAgICAgICAgICAgICAgIHt0YWIuYm9keX1cbiAgICAgICAgICAgICAgICA8L0F1dG9IaWRlU2Nyb2xsYmFyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpOiBSZWFjdC5SZWFjdE5vZGUge1xuICAgICAgICBjb25zdCBsYWJlbHMgPSB0aGlzLnByb3BzLnRhYnMubWFwKHRhYiA9PiB0aGlzLl9yZW5kZXJUYWJMYWJlbCh0YWIpKTtcbiAgICAgICAgY29uc3QgcGFuZWwgPSB0aGlzLl9yZW5kZXJUYWJQYW5lbCh0aGlzLnByb3BzLnRhYnNbdGhpcy5fZ2V0QWN0aXZlVGFiSW5kZXgoKV0pO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14X1RhYmJlZFZpZXdfdGFiTGFiZWxzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtsYWJlbHN9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3BhbmVsfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxufVxuIl19