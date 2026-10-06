"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _velocityAnimate = _interopRequireDefault(require("velocity-animate"));

var _propTypes = _interopRequireDefault(require("prop-types"));

/**
 * The Velociraptor contains components and animates transitions with velocity.
 * It will only pick up direct changes to properties ('left', currently), and so
 * will not work for animating positional changes where the position is implicit
 * from DOM order. This makes it a lot simpler and lighter: if you need fully
 * automatic positional animation, look at react-shuffle or similar libraries.
 */
class Velociraptor extends _react.default.Component {
  constructor(props) {
    super(props);
    this.nodes = {};

    this._updateChildren(this.props.children);
  }

  componentDidUpdate() {
    this._updateChildren(this.props.children);
  }

  _updateChildren(newChildren) {
    const oldChildren = this.children || {};
    this.children = {};

    _react.default.Children.toArray(newChildren).forEach(c => {
      if (oldChildren[c.key]) {
        const old = oldChildren[c.key];

        const oldNode = _reactDom.default.findDOMNode(this.nodes[old.key]);

        if (oldNode && oldNode.style.left !== c.props.style.left) {
          (0, _velocityAnimate.default)(oldNode, {
            left: c.props.style.left
          }, this.props.transition).then(() => {
            // special case visibility because it's nonsensical to animate an invisible element
            // so we always hidden->visible pre-transition and visible->hidden after
            if (oldNode.style.visibility === 'visible' && c.props.style.visibility === 'hidden') {
              oldNode.style.visibility = c.props.style.visibility;
            }
          }); //console.log("translation: "+oldNode.style.left+" -> "+c.props.style.left);
        }

        if (oldNode && oldNode.style.visibility === 'hidden' && c.props.style.visibility === 'visible') {
          oldNode.style.visibility = c.props.style.visibility;
        } // clone the old element with the props (and children) of the new element
        // so prop updates are still received by the children.


        this.children[c.key] = /*#__PURE__*/_react.default.cloneElement(old, c.props, c.props.children);
      } else {
        // new element. If we have a startStyle, use that as the style and go through
        // the enter animations
        const newProps = {};
        const restingStyle = c.props.style;
        const startStyles = this.props.startStyles;

        if (startStyles.length > 0) {
          const startStyle = startStyles[0];
          newProps.style = startStyle; // console.log("mounted@startstyle0: "+JSON.stringify(startStyle));
        }

        newProps.ref = n => this._collectNode(c.key, n, restingStyle);

        this.children[c.key] = /*#__PURE__*/_react.default.cloneElement(c, newProps);
      }
    });
  }

  _collectNode(k, node, restingStyle) {
    if (node && this.nodes[k] === undefined && this.props.startStyles.length > 0) {
      const startStyles = this.props.startStyles;
      const transitionOpts = this.props.enterTransitionOpts;

      const domNode = _reactDom.default.findDOMNode(node); // start from startStyle 1: 0 is the one we gave it
      // to start with, so now we animate 1 etc.


      for (var i = 1; i < startStyles.length; ++i) {
        (0, _velocityAnimate.default)(domNode, startStyles[i], transitionOpts[i - 1]);
        /*
        console.log("start:",
                    JSON.stringify(transitionOpts[i-1]),
                    "->",
                    JSON.stringify(startStyles[i]),
                    );
        */
      } // and then we animate to the resting state


      (0, _velocityAnimate.default)(domNode, restingStyle, transitionOpts[i - 1]).then(() => {
        // once we've reached the resting state, hide the element if
        // appropriate
        domNode.style.visibility = restingStyle.visibility;
      });
      /*
      console.log("enter:",
                  JSON.stringify(transitionOpts[i-1]),
                  "->",
                  JSON.stringify(restingStyle));
      */
    } else if (node === null) {
      // Velocity stores data on elements using the jQuery .data()
      // method, and assumes you'll be using jQuery's .remove() to
      // remove the element, but we don't use jQuery, so we need to
      // blow away the element's data explicitly otherwise it will leak.
      // This uses Velocity's internal jQuery compatible wrapper.
      // See the bug at
      // https://github.com/julianshapiro/velocity/issues/300
      // and the FAQ entry, "Preventing memory leaks when
      // creating/destroying large numbers of elements"
      // (https://github.com/julianshapiro/velocity/issues/47)
      const domNode = _reactDom.default.findDOMNode(this.nodes[k]);

      if (domNode) _velocityAnimate.default.Utilities.removeData(domNode);
    }

    this.nodes[k] = node;
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("span", null, Object.values(this.children));
  }

}

exports.default = Velociraptor;
(0, _defineProperty2.default)(Velociraptor, "propTypes", {
  // either a list of child nodes, or a single child.
  children: _propTypes.default.any,
  // optional transition information for changing existing children
  transition: _propTypes.default.object,
  // a list of state objects to apply to each child node in turn
  startStyles: _propTypes.default.array,
  // a list of transition options from the corresponding startStyle
  enterTransitionOpts: _propTypes.default.array
});
(0, _defineProperty2.default)(Velociraptor, "defaultProps", {
  startStyles: [],
  enterTransitionOpts: []
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9WZWxvY2lyYXB0b3IuanMiXSwibmFtZXMiOlsiVmVsb2NpcmFwdG9yIiwiUmVhY3QiLCJDb21wb25lbnQiLCJjb25zdHJ1Y3RvciIsInByb3BzIiwibm9kZXMiLCJfdXBkYXRlQ2hpbGRyZW4iLCJjaGlsZHJlbiIsImNvbXBvbmVudERpZFVwZGF0ZSIsIm5ld0NoaWxkcmVuIiwib2xkQ2hpbGRyZW4iLCJDaGlsZHJlbiIsInRvQXJyYXkiLCJmb3JFYWNoIiwiYyIsImtleSIsIm9sZCIsIm9sZE5vZGUiLCJSZWFjdERvbSIsImZpbmRET01Ob2RlIiwic3R5bGUiLCJsZWZ0IiwidHJhbnNpdGlvbiIsInRoZW4iLCJ2aXNpYmlsaXR5IiwiY2xvbmVFbGVtZW50IiwibmV3UHJvcHMiLCJyZXN0aW5nU3R5bGUiLCJzdGFydFN0eWxlcyIsImxlbmd0aCIsInN0YXJ0U3R5bGUiLCJyZWYiLCJuIiwiX2NvbGxlY3ROb2RlIiwiayIsIm5vZGUiLCJ1bmRlZmluZWQiLCJ0cmFuc2l0aW9uT3B0cyIsImVudGVyVHJhbnNpdGlvbk9wdHMiLCJkb21Ob2RlIiwiaSIsIlZlbG9jaXR5IiwiVXRpbGl0aWVzIiwicmVtb3ZlRGF0YSIsInJlbmRlciIsIk9iamVjdCIsInZhbHVlcyIsIlByb3BUeXBlcyIsImFueSIsIm9iamVjdCIsImFycmF5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ2UsTUFBTUEsWUFBTixTQUEyQkMsZUFBTUMsU0FBakMsQ0FBMkM7QUFvQnREQyxFQUFBQSxXQUFXLENBQUNDLEtBQUQsRUFBUTtBQUNmLFVBQU1BLEtBQU47QUFFQSxTQUFLQyxLQUFMLEdBQWEsRUFBYjs7QUFDQSxTQUFLQyxlQUFMLENBQXFCLEtBQUtGLEtBQUwsQ0FBV0csUUFBaEM7QUFDSDs7QUFFREMsRUFBQUEsa0JBQWtCLEdBQUc7QUFDakIsU0FBS0YsZUFB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QixrQkFBU0MsV0FBVCxDQUFxQixLQUFLZCxLQUFMLENBQVc2QixDQUFYLENBQXJCLENBQWhCOztBQUNBLFVBQUlLLE9BQUosRUFBYUUseUJBQVNDLFNBQVQsQ0FBbUJDLFVBQW5CLENBQThCSixPQUE5QjtBQUNoQjs7QUFDRCxTQUFLbEMsS0FBTCxDQUFXNkIsQ0FBWCxJQUFnQkMsSUFBaEI7QUFDSDs7QUFFRFMsRUFBQUEsTUFBTSxHQUFHO0FBQ0wsd0JBQ0ksMkNBQ01DLE1BQU0sQ0FBQ0MsTUFBUCxDQUFjLEtBQUt2QyxRQUFuQixDQUROLENBREo7QUFLSDs7QUF6SXFEOzs7OEJBQXJDUCxZLGVBQ0U7QUFDZjtBQUNBTyxFQUFBQSxRQUFRLEVBQUV3QyxtQkFBVUMsR0FGTDtBQUlmO0FBQ0ExQixFQUFBQSxVQUFVLEVBQUV5QixtQkFBVUUsTUFMUDtBQU9mO0FBQ0FyQixFQUFBQSxXQUFXLEVBQUVtQixtQkFBVUcsS0FSUjtBQVVmO0FBQ0FaLEVBQUFBLG1CQUFtQixFQUFFUyxtQkFBVUc7QUFYaEIsQzs4QkFERmxELFksa0JBZUs7QUFDbEI0QixFQUFBQSxXQUFXLEVBQUUsRUFESztBQUVsQlUsRUFBQUEsbUJBQW1CLEVBQUU7QUFGSCxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFJlYWN0RG9tIGZyb20gXCJyZWFjdC1kb21cIjtcbmltcG9ydCBWZWxvY2l0eSBmcm9tIFwidmVsb2NpdHktYW5pbWF0ZVwiO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuLyoqXG4gKiBUaGUgVmVsb2NpcmFwdG9yIGNvbnRhaW5zIGNvbXBvbmVudHMgYW5kIGFuaW1hdGVzIHRyYW5zaXRpb25zIHdpdGggdmVsb2NpdHkuXG4gKiBJdCB3aWxsIG9ubHkgcGljayB1cCBkaXJlY3QgY2hhbmdlcyB0byBwcm9wZXJ0aWVzICgnbGVmdCcsIGN1cnJlbnRseSksIGFuZCBzb1xuICogd2lsbCBub3Qgd29yayBmb3IgYW5pbWF0aW5nIHBvc2l0aW9uYWwgY2hhbmdlcyB3aGVyZSB0aGUgcG9zaXRpb24gaXMgaW1wbGljaXRcbiAqIGZyb20gRE9NIG9yZGVyLiBUaGlzIG1ha2VzIGl0IGEgbG90IHNpbXBsZXIgYW5kIGxpZ2h0ZXI6IGlmIHlvdSBuZWVkIGZ1bGx5XG4gKiBhdXRvbWF0aWMgcG9zaXRpb25hbCBhbmltYXRpb24sIGxvb2sgYXQgcmVhY3Qtc2h1ZmZsZSBvciBzaW1pbGFyIGxpYnJhcmllcy5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmVsb2NpcmFwdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgICAgICAvLyBlaXRoZXIgYSBsaXN0IG9mIGNoaWxkIG5vZGVzLCBvciBhIHNpbmdsZSBjaGlsZC5cbiAgICAgICAgY2hpbGRyZW46IFByb3BUeXBlcy5hbnksXG5cbiAgICAgICAgLy8gb3B0aW9uYWwgdHJhbnNpdGlvbiBpbmZvcm1hdGlvbiBmb3IgY2hhbmdpbmcgZXhpc3RpbmcgY2hpbGRyZW5cbiAgICAgICAgdHJhbnNpdGlvbjogUHJvcFR5cGVzLm9iamVjdCxcblxuICAgICAgICAvLyBhIGxpc3Qgb2Ygc3RhdGUgb2JqZWN0cyB0byBhcHBseSB0byBlYWNoIGNoaWxkIG5vZGUgaW4gdHVyblxuICAgICAgICBzdGFydFN0eWxlczogUHJvcFR5cGVzLmFycmF5LFxuXG4gICAgICAgIC8vIGEgbGlzdCBvZiB0cmFuc2l0aW9uIG9wdGlvbnMgZnJvbSB0aGUgY29ycmVzcG9uZGluZyBzdGFydFN0eWxlXG4gICAgICAgIGVudGVyVHJhbnNpdGlvbk9wdHM6IFByb3BUeXBlcy5hcnJheSxcbiAgICB9O1xuXG4gICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAgICAgc3RhcnRTdHlsZXM6IFtdLFxuICAgICAgICBlbnRlclRyYW5zaXRpb25PcHRzOiBbXSxcbiAgICB9O1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgIHRoaXMubm9kZXMgPSB7fTtcbiAgICAgICAgdGhpcy5fdXBkYXRlQ2hpbGRyZW4odGhpcy5wcm9wcy5jaGlsZHJlbik7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgICAgICB0aGlzLl91cGRhdGVDaGlsZHJlbih0aGlzLnByb3BzLmNoaWxkcmVuKTtcbiAgICB9XG5cbiAgICBfdXBkYXRlQ2hpbGRyZW4obmV3Q2hpbGRyZW4pIHtcbiAgICAgICAgY29uc3Qgb2xkQ2hpbGRyZW4gPSB0aGlzLmNoaWxkcmVuIHx8IHt9O1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0ge307XG4gICAgICAgIFJlYWN0LkNoaWxkcmVuLnRvQXJyYXkobmV3Q2hpbGRyZW4pLmZvckVhY2goKGMpID0+IHtcbiAgICAgICAgICAgIGlmIChvbGRDaGlsZHJlbltjLmtleV0pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbGQgPSBvbGRDaGlsZHJlbltjLmtleV07XG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkTm9kZSA9IFJlYWN0RG9tLmZpbmRET01Ob2RlKHRoaXMubm9kZXNbb2xkLmtleV0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9sZE5vZGUgJiYgb2xkTm9kZS5zdHlsZS5sZWZ0ICE9PSBjLnByb3BzLnN0eWxlLmxlZnQpIHtcbiAgICAgICAgICAgICAgICAgICAgVmVsb2NpdHkob2xkTm9kZSwgeyBsZWZ0OiBjLnByb3BzLnN0eWxlLmxlZnQgfSwgdGhpcy5wcm9wcy50cmFuc2l0aW9uKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNwZWNpYWwgY2FzZSB2aXNpYmlsaXR5IGJlY2F1c2UgaXQncyBub25zZW5zaWNhbCB0byBhbmltYXRlIGFuIGludmlzaWJsZSBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBhbHdheXMgaGlkZGVuLT52aXNpYmxlIHByZS10cmFuc2l0aW9uIGFuZCB2aXNpYmxlLT5oaWRkZW4gYWZ0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbGROb2RlLnN0eWxlLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJyAmJiBjLnByb3BzLnN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkTm9kZS5zdHlsZS52aXNpYmlsaXR5ID0gYy5wcm9wcy5zdHlsZS52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInRyYW5zbGF0aW9uOiBcIitvbGROb2RlLnN0eWxlLmxlZnQrXCIgLT4gXCIrYy5wcm9wcy5zdHlsZS5sZWZ0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9sZE5vZGUgJiYgb2xkTm9kZS5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyAmJiBjLnByb3BzLnN0eWxlLnZpc2liaWxpdHkgPT09ICd2aXNpYmxlJykge1xuICAgICAgICAgICAgICAgICAgICBvbGROb2RlLnN0eWxlLnZpc2liaWxpdHkgPSBjLnByb3BzLnN0eWxlLnZpc2liaWxpdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGNsb25lIHRoZSBvbGQgZWxlbWVudCB3aXRoIHRoZSBwcm9wcyAoYW5kIGNoaWxkcmVuKSBvZiB0aGUgbmV3IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAvLyBzbyBwcm9wIHVwZGF0ZXMgYXJlIHN0aWxsIHJlY2VpdmVkIGJ5IHRoZSBjaGlsZHJlbi5cbiAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuW2Mua2V5XSA9IFJlYWN0LmNsb25lRWxlbWVudChvbGQsIGMucHJvcHMsIGMucHJvcHMuY2hpbGRyZW4pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBuZXcgZWxlbWVudC4gSWYgd2UgaGF2ZSBhIHN0YXJ0U3R5bGUsIHVzZSB0aGF0IGFzIHRoZSBzdHlsZSBhbmQgZ28gdGhyb3VnaFxuICAgICAgICAgICAgICAgIC8vIHRoZSBlbnRlciBhbmltYXRpb25zXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3UHJvcHMgPSB7fTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN0aW5nU3R5bGUgPSBjLnByb3BzLnN0eWxlO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhcnRTdHlsZXMgPSB0aGlzLnByb3BzLnN0YXJ0U3R5bGVzO1xuICAgICAgICAgICAgICAgIGlmIChzdGFydFN0eWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXJ0U3R5bGUgPSBzdGFydFN0eWxlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgbmV3UHJvcHMuc3R5bGUgPSBzdGFydFN0eWxlO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIm1vdW50ZWRAc3RhcnRzdHlsZTA6IFwiK0pTT04uc3RyaW5naWZ5KHN0YXJ0U3R5bGUpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBuZXdQcm9wcy5yZWYgPSAoKG4pID0+IHRoaXMuX2NvbGxlY3ROb2RlKFxuICAgICAgICAgICAgICAgICAgICBjLmtleSwgbiwgcmVzdGluZ1N0eWxlLFxuICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jaGlsZHJlbltjLmtleV0gPSBSZWFjdC5jbG9uZUVsZW1lbnQoYywgbmV3UHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBfY29sbGVjdE5vZGUoaywgbm9kZSwgcmVzdGluZ1N0eWxlKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAgIG5vZGUgJiZcbiAgICAgICAgICAgIHRoaXMubm9kZXNba10gPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgdGhpcy5wcm9wcy5zdGFydFN0eWxlcy5sZW5ndGggPiAwXG4gICAgICAgICkge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnRTdHlsZXMgPSB0aGlzLnByb3BzLnN0YXJ0U3R5bGVzO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNpdGlvbk9wdHMgPSB0aGlzLnByb3BzLmVudGVyVHJhbnNpdGlvbk9wdHM7XG4gICAgICAgICAgICBjb25zdCBkb21Ob2RlID0gUmVhY3REb20uZmluZERPTU5vZGUobm9kZSk7XG4gICAgICAgICAgICAvLyBzdGFydCBmcm9tIHN0YXJ0U3R5bGUgMTogMCBpcyB0aGUgb25lIHdlIGdhdmUgaXRcbiAgICAgICAgICAgIC8vIHRvIHN0YXJ0IHdpdGgsIHNvIG5vdyB3ZSBhbmltYXRlIDEgZXRjLlxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBzdGFydFN0eWxlcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIFZlbG9jaXR5KGRvbU5vZGUsIHN0YXJ0U3R5bGVzW2ldLCB0cmFuc2l0aW9uT3B0c1tpLTFdKTtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwic3RhcnQ6XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkodHJhbnNpdGlvbk9wdHNbaS0xXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCItPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHN0YXJ0U3R5bGVzW2ldKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGFuZCB0aGVuIHdlIGFuaW1hdGUgdG8gdGhlIHJlc3Rpbmcgc3RhdGVcbiAgICAgICAgICAgIFZlbG9jaXR5KGRvbU5vZGUsIHJlc3RpbmdTdHlsZSxcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uT3B0c1tpLTFdKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gb25jZSB3ZSd2ZSByZWFjaGVkIHRoZSByZXN0aW5nIHN0YXRlLCBoaWRlIHRoZSBlbGVtZW50IGlmXG4gICAgICAgICAgICAgICAgICAgIC8vIGFwcHJvcHJpYXRlXG4gICAgICAgICAgICAgICAgICAgIGRvbU5vZGUuc3R5bGUudmlzaWJpbGl0eSA9IHJlc3RpbmdTdHlsZS52aXNpYmlsaXR5O1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJlbnRlcjpcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRyYW5zaXRpb25PcHRzW2ktMV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCItPlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocmVzdGluZ1N0eWxlKSk7XG4gICAgICAgICAgICAqL1xuICAgICAgICB9IGVsc2UgaWYgKG5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFZlbG9jaXR5IHN0b3JlcyBkYXRhIG9uIGVsZW1lbnRzIHVzaW5nIHRoZSBqUXVlcnkgLmRhdGEoKVxuICAgICAgICAgICAgLy8gbWV0aG9kLCBhbmQgYXNzdW1lcyB5b3UnbGwgYmUgdXNpbmcgalF1ZXJ5J3MgLnJlbW92ZSgpIHRvXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIGVsZW1lbnQsIGJ1dCB3ZSBkb24ndCB1c2UgalF1ZXJ5LCBzbyB3ZSBuZWVkIHRvXG4gICAgICAgICAgICAvLyBibG93IGF3YXkgdGhlIGVsZW1lbnQncyBkYXRhIGV4cGxpY2l0bHkgb3RoZXJ3aXNlIGl0IHdpbGwgbGVhay5cbiAgICAgICAgICAgIC8vIFRoaXMgdXNlcyBWZWxvY2l0eSdzIGludGVybmFsIGpRdWVyeSBjb21wYXRpYmxlIHdyYXBwZXIuXG4gICAgICAgICAgICAvLyBTZWUgdGhlIGJ1ZyBhdFxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2p1bGlhbnNoYXBpcm8vdmVsb2NpdHkvaXNzdWVzLzMwMFxuICAgICAgICAgICAgLy8gYW5kIHRoZSBGQVEgZW50cnksIFwiUHJldmVudGluZyBtZW1vcnkgbGVha3Mgd2hlblxuICAgICAgICAgICAgLy8gY3JlYXRpbmcvZGVzdHJveWluZyBsYXJnZSBudW1iZXJzIG9mIGVsZW1lbnRzXCJcbiAgICAgICAgICAgIC8vIChodHRwczovL2dpdGh1Yi5jb20vanVsaWFuc2hhcGlyby92ZWxvY2l0eS9pc3N1ZXMvNDcpXG4gICAgICAgICAgICBjb25zdCBkb21Ob2RlID0gUmVhY3REb20uZmluZERPTU5vZGUodGhpcy5ub2Rlc1trXSk7XG4gICAgICAgICAgICBpZiAoZG9tTm9kZSkgVmVsb2NpdHkuVXRpbGl0aWVzLnJlbW92ZURhdGEoZG9tTm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub2Rlc1trXSA9IG5vZGU7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAgeyBPYmplY3QudmFsdWVzKHRoaXMuY2hpbGRyZW4pIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=