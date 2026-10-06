"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "RovingTabIndexWrapper", {
  enumerable: true,
  get: function () {
    return _RovingTabIndexWrapper.RovingTabIndexWrapper;
  }
});
Object.defineProperty(exports, "RovingAccessibleButton", {
  enumerable: true,
  get: function () {
    return _RovingAccessibleButton.RovingAccessibleButton;
  }
});
Object.defineProperty(exports, "RovingAccessibleTooltipButton", {
  enumerable: true,
  get: function () {
    return _RovingAccessibleTooltipButton.RovingAccessibleTooltipButton;
  }
});
exports.useRovingTabIndex = exports.RovingTabIndexProvider = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireWildcard(require("react"));

var _Keyboard = require("../Keyboard");

var _RovingTabIndexWrapper = require("./roving/RovingTabIndexWrapper");

var _RovingAccessibleButton = require("./roving/RovingAccessibleButton");

var _RovingAccessibleTooltipButton = require("./roving/RovingAccessibleTooltipButton");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

/**
 * Module to simplify implementing the Roving TabIndex accessibility technique
 *
 * Wrap the Widget in an RovingTabIndexContextProvider
 * and then for all buttons make use of useRovingTabIndex or RovingTabIndexWrapper.
 * The code will keep track of which tabIndex was most recently focused and expose that information as `isActive` which
 * can then be used to only set the tabIndex to 0 as expected by the roving tabindex technique.
 * When the active button gets unmounted the closest button will be chosen as expected.
 * Initially the first button to mount will be given active state.
 *
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets#Technique_1_Roving_tabindex
 */
const DOCUMENT_POSITION_PRECEDING = 2;
/*:: export interface IState {
    activeRef: Ref;
    refs: Ref[];
}*/

const RovingTabIndexContext = /*#__PURE__*/(0, _react.createContext)({
  state: {
    activeRef: null,
    refs: [] // list of refs in DOM order

  },
  dispatch: () => {}
});
RovingTabIndexContext.displayName = "RovingTabIndexContext";
var Type;

(function (Type) {
  Type["Register"] = "REGISTER";
  Type["Unregister"] = "UNREGISTER";
  Type["SetFocus"] = "SET_FOCUS";
})(Type || (Type = {}));

const reducer = (state
/*: IState*/
, action
/*: IAction*/
) => {
  switch (action.type) {
    case Type.Register:
      {
        if (state.refs.length === 0) {
          // Our list of refs was empty, set activeRef to this first item
          return _objectSpread(_objectSpread({}, state), {}, {
            activeRef: action.payload.ref,
            refs: [action.payload.ref]
          });
        }

        if (state.refs.includes(action.payload.ref)) {
          return state; // already in refs, this should not happen
        } // find the index of the first ref which is not preceding this one in DOM order


        let newIndex = state.refs.findIndex(ref => {
          return ref.current.compareDocumentPosition(action.payload.ref.current) & DOCUMENT_POSITION_PRECEDING;
        });

        if (newIndex < 0) {
          newIndex = state.refs.length; // append to the end
        } // update the refs list


        return _objectSpread(_objectSpread({}, state), {}, {
          refs: [...state.refs.slice(0, newIndex), action.payload.ref, ...state.refs.slice(newIndex)]
        });
      }

    case Type.Unregister:
      {
        // filter out the ref which we are removing
        const refs = state.refs.filter(r => r !== action.payload.ref);

        if (refs.length === state.refs.length) {
          return state; // already removed, this should not happen
        }

        if (state.activeRef === action.payload.ref) {
          // we just removed the active ref, need to replace it
          // pick the ref which is now in the index the old ref was in
          const oldIndex = state.refs.findIndex(r => r === action.payload.ref);
          return _objectSpread(_objectSpread({}, state), {}, {
            activeRef: oldIndex >= refs.length ? refs[refs.length - 1] : refs[oldIndex],
            refs
          });
        } // update the refs list


        return _objectSpread(_objectSpread({}, state), {}, {
          refs
        });
      }

    case Type.SetFocus:
      {
        // update active ref
        return _objectSpread(_objectSpread({}, state), {}, {
          activeRef: action.payload.ref
        });
      }

    default:
      return state;
  }
};

const RovingTabIndexProvider
/*: React.FC<IProps>*/
= ({
  children,
  handleHomeEnd,
  onKeyDown
}) => {
  const [state, dispatch] = (0, _react.useReducer)(reducer, {
    activeRef: null,
    refs: []
  });
  const context = (0, _react.useMemo)(() => ({
    state,
    dispatch
  }), [state]);
  const onKeyDownHandler = (0, _react.useCallback)(ev => {
    let handled = false; // Don't interfere with input default keydown behaviour

    if (handleHomeEnd && ev.target.tagName !== "INPUT") {
      // check if we actually have any items
      switch (ev.key) {
        case _Keyboard.Key.HOME:
          handled = true; // move focus to first item

          if (context.state.refs.length > 0) {
            context.state.refs[0].current.focus();
          }

          break;

        case _Keyboard.Key.END:
          handled = true; // move focus to last item

          if (context.state.refs.length > 0) {
            context.state.refs[context.state.refs.length - 1].current.focus();
          }

          break;
      }
    }

    if (handled) {
      ev.preventDefault();
      ev.stopPropagation();
    } else if (onKeyDown) {
      return onKeyDown(ev, context.state);
    }
  }, [context.state, onKeyDown, handleHomeEnd]);
  return /*#__PURE__*/_react.default.createElement(RovingTabIndexContext.Provider, {
    value: context
  }, children({
    onKeyDownHandler
  }));
}; // Hook to register a roving tab index
// inputRef parameter specifies the ref to use
// onFocus should be called when the index gained focus in any manner
// isActive should be used to set tabIndex in a manner such as `tabIndex={isActive ? 0 : -1}`
// ref should be passed to a DOM node which will be used for DOM compareDocumentPosition


exports.RovingTabIndexProvider = RovingTabIndexProvider;

const useRovingTabIndex = (inputRef
/*: Ref*/
) =>
/*: [FocusHandler, boolean, Ref]*/
{
  const context = (0, _react.useContext)(RovingTabIndexContext);
  let ref = (0, _react.useRef)(null);

  if (inputRef) {
    // if we are given a ref, use it instead of ours
    ref = inputRef;
  } // setup (after refs)


  (0, _react.useLayoutEffect)(() => {
    context.dispatch({
      type: Type.Register,
      payload: {
        ref
      }
    }); // teardown

    return () => {
      context.dispatch({
        type: Type.Unregister,
        payload: {
          ref
        }
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onFocus = (0, _react.useCallback)(() => {
    context.dispatch({
      type: Type.SetFocus,
      payload: {
        ref
      }
    });
  }, [ref, context]);
  const isActive = context.state.activeRef === ref;
  return [onFocus, isActive, ref];
}; // re-export the semantic helper components for simplicity


exports.useRovingTabIndex = useRovingTabIndex;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hY2Nlc3NpYmlsaXR5L1JvdmluZ1RhYkluZGV4LnRzeCJdLCJuYW1lcyI6WyJET0NVTUVOVF9QT1NJVElPTl9QUkVDRURJTkciLCJSb3ZpbmdUYWJJbmRleENvbnRleHQiLCJzdGF0ZSIsImFjdGl2ZVJlZiIsInJlZnMiLCJkaXNwYXRjaCIsImRpc3BsYXlOYW1lIiwiVHlwZSIsInJlZHVjZXIiLCJhY3Rpb24iLCJ0eXBlIiwiUmVnaXN0ZXIiLCJsZW5ndGgiLCJwYXlsb2FkIiwicmVmIiwiaW5jbHVkZXMiLCJuZXdJbmRleCIsImZpbmRJbmRleCIsImN1cnJlbnQiLCJjb21wYXJlRG9jdW1lbnRQb3NpdGlvbiIsInNsaWNlIiwiVW5yZWdpc3RlciIsImZpbHRlciIsInIiLCJvbGRJbmRleCIsIlNldEZvY3VzIiwiUm92aW5nVGFiSW5kZXhQcm92aWRlciIsImNoaWxkcmVuIiwiaGFuZGxlSG9tZUVuZCIsIm9uS2V5RG93biIsImNvbnRleHQiLCJvbktleURvd25IYW5kbGVyIiwiZXYiLCJoYW5kbGVkIiwidGFyZ2V0IiwidGFnTmFtZSIsImtleSIsIktleSIsIkhPTUUiLCJmb2N1cyIsIkVORCIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwidXNlUm92aW5nVGFiSW5kZXgiLCJpbnB1dFJlZiIsIm9uRm9jdXMiLCJpc0FjdGl2ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFZQTs7QUF1TkE7O0FBQ0E7O0FBQ0E7Ozs7OztBQXROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQSxNQUFNQSwyQkFBMkIsR0FBRyxDQUFwQzs7QUE1Q0E7QUFDQTtBQUNBOztBQXNEQSxNQUFNQyxxQkFBcUIsZ0JBQUcsMEJBQXdCO0FBQ2xEQyxFQUFBQSxLQUFLLEVBQUU7QUFDSEMsSUFBQUEsU0FBUyxFQUFFLElBRFI7QUFF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QixJQUFBQSxHQUFHLEdBQUc4QixRQUFOO0FBQ0gsR0FQOEUsQ0FTL0U7OztBQUNBLDhCQUFnQixNQUFNO0FBQ2xCZCxJQUFBQSxPQUFPLENBQUN6QixRQUFSLENBQWlCO0FBQ2JLLE1BQUFBLElBQUksRUFBRUgsSUFBSSxDQUFDSSxRQURFO0FBRWJFLE1BQUFBLE9BQU8sRUFBRTtBQUFDQyxRQUFBQTtBQUFEO0FBRkksS0FBakIsRUFEa0IsQ0FLbEI7O0FBQ0EsV0FBTyxNQUFNO0FBQ1RnQixNQUFBQSxPQUFPLENBQUN6QixRQUFSLENBQWlCO0FBQ2JLLFFBQUFBLElBQUksRUFBRUgsSUFBSSxDQUFDYyxVQURFO0FBRWJSLFFBQUFBLE9BQU8sRUFBRTtBQUFDQyxVQUFBQTtBQUFEO0FBRkksT0FBakI7QUFJSCxLQUxEO0FBTUgsR0FaRCxFQVlHLEVBWkgsRUFWK0UsQ0FzQnZFOztBQUVSLFFBQU0rQixPQUFPLEdBQUcsd0JBQVksTUFBTTtBQUM5QmYsSUFBQUEsT0FBTyxDQUFDekIsUUFBUixDQUFpQjtBQUNiSyxNQUFBQSxJQUFJLEVBQUVILElBQUksQ0FBQ2tCLFFBREU7QUFFYlosTUFBQUEsT0FBTyxFQUFFO0FBQUNDLFFBQUFBO0FBQUQ7QUFGSSxLQUFqQjtBQUlILEdBTGUsRUFLYixDQUFDQSxHQUFELEVBQU1nQixPQUFOLENBTGEsQ0FBaEI7QUFPQSxRQUFNZ0IsUUFBUSxHQUFHaEIsT0FBTyxDQUFDNUIsS0FBUixDQUFjQyxTQUFkLEtBQTRCVyxHQUE3QztBQUNBLFNBQU8sQ0FBQytCLE9BQUQsRUFBVUMsUUFBVixFQUFvQmhDLEdBQXBCLENBQVA7QUFDSCxDQWpDTSxDLENBbUNQIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IFJlYWN0LCB7XG4gICAgY3JlYXRlQ29udGV4dCxcbiAgICB1c2VDYWxsYmFjayxcbiAgICB1c2VDb250ZXh0LFxuICAgIHVzZUxheW91dEVmZmVjdCxcbiAgICB1c2VNZW1vLFxuICAgIHVzZVJlZixcbiAgICB1c2VSZWR1Y2VyLFxuICAgIFJlZHVjZXIsXG4gICAgRGlzcGF0Y2gsXG59IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQge0tleX0gZnJvbSBcIi4uL0tleWJvYXJkXCI7XG5pbXBvcnQge0ZvY3VzSGFuZGxlciwgUmVmfSBmcm9tIFwiLi9yb3ZpbmcvdHlwZXNcIjtcblxuLyoqXG4gKiBNb2R1bGUgdG8gc2ltcGxpZnkgaW1wbGVtZW50aW5nIHRoZSBSb3ZpbmcgVGFiSW5kZXggYWNjZXNzaWJpbGl0eSB0ZWNobmlxdWVcbiAqXG4gKiBXcmFwIHRoZSBXaWRnZXQgaW4gYW4gUm92aW5nVGFiSW5kZXhDb250ZXh0UHJvdmlkZXJcbiAqIGFuZCB0aGVuIGZvciBhbGwgYnV0dG9ucyBtYWtlIHVzZSBvZiB1c2VSb3ZpbmdUYWJJbmRleCBvciBSb3ZpbmdUYWJJbmRleFdyYXBwZXIuXG4gKiBUaGUgY29kZSB3aWxsIGtlZXAgdHJhY2sgb2Ygd2hpY2ggdGFiSW5kZXggd2FzIG1vc3QgcmVjZW50bHkgZm9jdXNlZCBhbmQgZXhwb3NlIHRoYXQgaW5mb3JtYXRpb24gYXMgYGlzQWN0aXZlYCB3aGljaFxuICogY2FuIHRoZW4gYmUgdXNlZCB0byBvbmx5IHNldCB0aGUgdGFiSW5kZXggdG8gMCBhcyBleHBlY3RlZCBieSB0aGUgcm92aW5nIHRhYmluZGV4IHRlY2huaXF1ZS5cbiAqIFdoZW4gdGhlIGFjdGl2ZSBidXR0b24gZ2V0cyB1bm1vdW50ZWQgdGhlIGNsb3Nlc3QgYnV0dG9uIHdpbGwgYmUgY2hvc2VuIGFzIGV4cGVjdGVkLlxuICogSW5pdGlhbGx5IHRoZSBmaXJzdCBidXR0b24gdG8gbW91bnQgd2lsbCBiZSBnaXZlbiBhY3RpdmUgc3RhdGUuXG4gKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQWNjZXNzaWJpbGl0eS9LZXlib2FyZC1uYXZpZ2FibGVfSmF2YVNjcmlwdF93aWRnZXRzI1RlY2huaXF1ZV8xX1JvdmluZ190YWJpbmRleFxuICovXG5cbmNvbnN0IERPQ1VNRU5UX1BPU0lUSU9OX1BSRUNFRElORyA9IDI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0YXRlIHtcbiAgICBhY3RpdmVSZWY6IFJlZjtcbiAgICByZWZzOiBSZWZbXTtcbn1cblxuaW50ZXJmYWNlIElDb250ZXh0IHtcbiAgICBzdGF0ZTogSVN0YXRlO1xuICAgIGRpc3BhdGNoOiBEaXNwYXRjaDxJQWN0aW9uPjtcbn1cblxuY29uc3QgUm92aW5nVGFiSW5kZXhDb250ZXh0ID0gY3JlYXRlQ29udGV4dDxJQ29udGV4dD4oe1xuICAgIHN0YXRlOiB7XG4gICAgICAgIGFjdGl2ZVJlZjogbnVsbCxcbiAgICAgICAgcmVmczogW10sIC8vIGxpc3Qgb2YgcmVmcyBpbiBET00gb3JkZXJcbiAgICB9LFxuICAgIGRpc3BhdGNoOiAoKSA9PiB7fSxcbn0pO1xuUm92aW5nVGFiSW5kZXhDb250ZXh0LmRpc3BsYXlOYW1lID0gXCJSb3ZpbmdUYWJJbmRleENvbnRleHRcIjtcblxuZW51bSBUeXBlIHtcbiAgICBSZWdpc3RlciA9IFwiUkVHSVNURVJcIixcbiAgICBVbnJlZ2lzdGVyID0gXCJVTlJFR0lTVEVSXCIsXG4gICAgU2V0Rm9jdXMgPSBcIlNFVF9GT0NVU1wiLFxufVxuXG5pbnRlcmZhY2UgSUFjdGlvbiB7XG4gICAgdHlwZTogVHlwZTtcbiAgICBwYXlsb2FkOiB7XG4gICAgICAgIHJlZjogUmVmO1xuICAgIH07XG59XG5cbmNvbnN0IHJlZHVjZXIgPSAoc3RhdGU6IElTdGF0ZSwgYWN0aW9uOiBJQWN0aW9uKSA9PiB7XG4gICAgc3dpdGNoIChhY3Rpb24udHlwZSkge1xuICAgICAgICBjYXNlIFR5cGUuUmVnaXN0ZXI6IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5yZWZzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIE91ciBsaXN0IG9mIHJlZnMgd2FzIGVtcHR5LCBzZXQgYWN0aXZlUmVmIHRvIHRoaXMgZmlyc3QgaXRlbVxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgICAgICBhY3RpdmVSZWY6IGFjdGlvbi5wYXlsb2FkLnJlZixcbiAgICAgICAgICAgICAgICAgICAgcmVmczogW2FjdGlvbi5wYXlsb2FkLnJlZl0sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHN0YXRlLnJlZnMuaW5jbHVkZXMoYWN0aW9uLnBheWxvYWQucmVmKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZTsgLy8gYWxyZWFkeSBpbiByZWZzLCB0aGlzIHNob3VsZCBub3QgaGFwcGVuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpbmQgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCByZWYgd2hpY2ggaXMgbm90IHByZWNlZGluZyB0aGlzIG9uZSBpbiBET00gb3JkZXJcbiAgICAgICAgICAgIGxldCBuZXdJbmRleCA9IHN0YXRlLnJlZnMuZmluZEluZGV4KHJlZiA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlZi5jdXJyZW50LmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGFjdGlvbi5wYXlsb2FkLnJlZi5jdXJyZW50KSAmIERPQ1VNRU5UX1BPU0lUSU9OX1BSRUNFRElORztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAobmV3SW5kZXggPCAwKSB7XG4gICAgICAgICAgICAgICAgbmV3SW5kZXggPSBzdGF0ZS5yZWZzLmxlbmd0aDsgLy8gYXBwZW5kIHRvIHRoZSBlbmRcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSByZWZzIGxpc3RcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgICAgcmVmczogW1xuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5yZWZzLnNsaWNlKDAsIG5ld0luZGV4KSxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uLnBheWxvYWQucmVmLFxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5yZWZzLnNsaWNlKG5ld0luZGV4KSxcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFR5cGUuVW5yZWdpc3Rlcjoge1xuICAgICAgICAgICAgLy8gZmlsdGVyIG91dCB0aGUgcmVmIHdoaWNoIHdlIGFyZSByZW1vdmluZ1xuICAgICAgICAgICAgY29uc3QgcmVmcyA9IHN0YXRlLnJlZnMuZmlsdGVyKHIgPT4gciAhPT0gYWN0aW9uLnBheWxvYWQucmVmKTtcblxuICAgICAgICAgICAgaWYgKHJlZnMubGVuZ3RoID09PSBzdGF0ZS5yZWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZTsgLy8gYWxyZWFkeSByZW1vdmVkLCB0aGlzIHNob3VsZCBub3QgaGFwcGVuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZS5hY3RpdmVSZWYgPT09IGFjdGlvbi5wYXlsb2FkLnJlZikge1xuICAgICAgICAgICAgICAgIC8vIHdlIGp1c3QgcmVtb3ZlZCB0aGUgYWN0aXZlIHJlZiwgbmVlZCB0byByZXBsYWNlIGl0XG4gICAgICAgICAgICAgICAgLy8gcGljayB0aGUgcmVmIHdoaWNoIGlzIG5vdyBpbiB0aGUgaW5kZXggdGhlIG9sZCByZWYgd2FzIGluXG4gICAgICAgICAgICAgICAgY29uc3Qgb2xkSW5kZXggPSBzdGF0ZS5yZWZzLmZpbmRJbmRleChyID0+IHIgPT09IGFjdGlvbi5wYXlsb2FkLnJlZik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2ZVJlZjogb2xkSW5kZXggPj0gcmVmcy5sZW5ndGggPyByZWZzW3JlZnMubGVuZ3RoIC0gMV0gOiByZWZzW29sZEluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIHJlZnMgbGlzdFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcbiAgICAgICAgICAgICAgICByZWZzLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIFR5cGUuU2V0Rm9jdXM6IHtcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBhY3RpdmUgcmVmXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxuICAgICAgICAgICAgICAgIGFjdGl2ZVJlZjogYWN0aW9uLnBheWxvYWQucmVmLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbn07XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIGhhbmRsZUhvbWVFbmQ/OiBib29sZWFuO1xuICAgIGNoaWxkcmVuKHJlbmRlclByb3BzOiB7XG4gICAgICAgIG9uS2V5RG93bkhhbmRsZXIoZXY6IFJlYWN0LktleWJvYXJkRXZlbnQpO1xuICAgIH0pO1xuICAgIG9uS2V5RG93bj8oZXY6IFJlYWN0LktleWJvYXJkRXZlbnQsIHN0YXRlOiBJU3RhdGUpO1xufVxuXG5leHBvcnQgY29uc3QgUm92aW5nVGFiSW5kZXhQcm92aWRlcjogUmVhY3QuRkM8SVByb3BzPiA9ICh7Y2hpbGRyZW4sIGhhbmRsZUhvbWVFbmQsIG9uS2V5RG93bn0pID0+IHtcbiAgICBjb25zdCBbc3RhdGUsIGRpc3BhdGNoXSA9IHVzZVJlZHVjZXI8UmVkdWNlcjxJU3RhdGUsIElBY3Rpb24+PihyZWR1Y2VyLCB7XG4gICAgICAgIGFjdGl2ZVJlZjogbnVsbCxcbiAgICAgICAgcmVmczogW10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250ZXh0ID0gdXNlTWVtbzxJQ29udGV4dD4oKCkgPT4gKHtzdGF0ZSwgZGlzcGF0Y2h9KSwgW3N0YXRlXSk7XG5cbiAgICBjb25zdCBvbktleURvd25IYW5kbGVyID0gdXNlQ2FsbGJhY2soKGV2KSA9PiB7XG4gICAgICAgIGxldCBoYW5kbGVkID0gZmFsc2U7XG4gICAgICAgIC8vIERvbid0IGludGVyZmVyZSB3aXRoIGlucHV0IGRlZmF1bHQga2V5ZG93biBiZWhhdmlvdXJcbiAgICAgICAgaWYgKGhhbmRsZUhvbWVFbmQgJiYgZXYudGFyZ2V0LnRhZ05hbWUgIT09IFwiSU5QVVRcIikge1xuICAgICAgICAgICAgLy8gY2hlY2sgaWYgd2UgYWN0dWFsbHkgaGF2ZSBhbnkgaXRlbXNcbiAgICAgICAgICAgIHN3aXRjaCAoZXYua2V5KSB7XG4gICAgICAgICAgICAgICAgY2FzZSBLZXkuSE9NRTpcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIG1vdmUgZm9jdXMgdG8gZmlyc3QgaXRlbVxuICAgICAgICAgICAgICAgICAgICBpZiAoY29udGV4dC5zdGF0ZS5yZWZzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRleHQuc3RhdGUucmVmc1swXS5jdXJyZW50LmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBLZXkuRU5EOlxuICAgICAgICAgICAgICAgICAgICBoYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbW92ZSBmb2N1cyB0byBsYXN0IGl0ZW1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnRleHQuc3RhdGUucmVmcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZXh0LnN0YXRlLnJlZnNbY29udGV4dC5zdGF0ZS5yZWZzLmxlbmd0aCAtIDFdLmN1cnJlbnQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYW5kbGVkKSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH0gZWxzZSBpZiAob25LZXlEb3duKSB7XG4gICAgICAgICAgICByZXR1cm4gb25LZXlEb3duKGV2LCBjb250ZXh0LnN0YXRlKTtcbiAgICAgICAgfVxuICAgIH0sIFtjb250ZXh0LnN0YXRlLCBvbktleURvd24sIGhhbmRsZUhvbWVFbmRdKTtcblxuICAgIHJldHVybiA8Um92aW5nVGFiSW5kZXhDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXtjb250ZXh0fT5cbiAgICAgICAgeyBjaGlsZHJlbih7b25LZXlEb3duSGFuZGxlcn0pIH1cbiAgICA8L1JvdmluZ1RhYkluZGV4Q29udGV4dC5Qcm92aWRlcj47XG59O1xuXG4vLyBIb29rIHRvIHJlZ2lzdGVyIGEgcm92aW5nIHRhYiBpbmRleFxuLy8gaW5wdXRSZWYgcGFyYW1ldGVyIHNwZWNpZmllcyB0aGUgcmVmIHRvIHVzZVxuLy8gb25Gb2N1cyBzaG91bGQgYmUgY2FsbGVkIHdoZW4gdGhlIGluZGV4IGdhaW5lZCBmb2N1cyBpbiBhbnkgbWFubmVyXG4vLyBpc0FjdGl2ZSBzaG91bGQgYmUgdXNlZCB0byBzZXQgdGFiSW5kZXggaW4gYSBtYW5uZXIgc3VjaCBhcyBgdGFiSW5kZXg9e2lzQWN0aXZlID8gMCA6IC0xfWBcbi8vIHJlZiBzaG91bGQgYmUgcGFzc2VkIHRvIGEgRE9NIG5vZGUgd2hpY2ggd2lsbCBiZSB1c2VkIGZvciBET00gY29tcGFyZURvY3VtZW50UG9zaXRpb25cbmV4cG9ydCBjb25zdCB1c2VSb3ZpbmdUYWJJbmRleCA9IChpbnB1dFJlZj86IFJlZik6IFtGb2N1c0hhbmRsZXIsIGJvb2xlYW4sIFJlZl0gPT4ge1xuICAgIGNvbnN0IGNvbnRleHQgPSB1c2VDb250ZXh0KFJvdmluZ1RhYkluZGV4Q29udGV4dCk7XG4gICAgbGV0IHJlZiA9IHVzZVJlZjxIVE1MRWxlbWVudD4obnVsbCk7XG5cbiAgICBpZiAoaW5wdXRSZWYpIHtcbiAgICAgICAgLy8gaWYgd2UgYXJlIGdpdmVuIGEgcmVmLCB1c2UgaXQgaW5zdGVhZCBvZiBvdXJzXG4gICAgICAgIHJlZiA9IGlucHV0UmVmO1xuICAgIH1cblxuICAgIC8vIHNldHVwIChhZnRlciByZWZzKVxuICAgIHVzZUxheW91dEVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogVHlwZS5SZWdpc3RlcixcbiAgICAgICAgICAgIHBheWxvYWQ6IHtyZWZ9LFxuICAgICAgICB9KTtcbiAgICAgICAgLy8gdGVhcmRvd25cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNvbnRleHQuZGlzcGF0Y2goe1xuICAgICAgICAgICAgICAgIHR5cGU6IFR5cGUuVW5yZWdpc3RlcixcbiAgICAgICAgICAgICAgICBwYXlsb2FkOiB7cmVmfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICAgIGNvbnN0IG9uRm9jdXMgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnRleHQuZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogVHlwZS5TZXRGb2N1cyxcbiAgICAgICAgICAgIHBheWxvYWQ6IHtyZWZ9LFxuICAgICAgICB9KTtcbiAgICB9LCBbcmVmLCBjb250ZXh0XSk7XG5cbiAgICBjb25zdCBpc0FjdGl2ZSA9IGNvbnRleHQuc3RhdGUuYWN0aXZlUmVmID09PSByZWY7XG4gICAgcmV0dXJuIFtvbkZvY3VzLCBpc0FjdGl2ZSwgcmVmXTtcbn07XG5cbi8vIHJlLWV4cG9ydCB0aGUgc2VtYW50aWMgaGVscGVyIGNvbXBvbmVudHMgZm9yIHNpbXBsaWNpdHlcbmV4cG9ydCB7Um92aW5nVGFiSW5kZXhXcmFwcGVyfSBmcm9tIFwiLi9yb3ZpbmcvUm92aW5nVGFiSW5kZXhXcmFwcGVyXCI7XG5leHBvcnQge1JvdmluZ0FjY2Vzc2libGVCdXR0b259IGZyb20gXCIuL3JvdmluZy9Sb3ZpbmdBY2Nlc3NpYmxlQnV0dG9uXCI7XG5leHBvcnQge1JvdmluZ0FjY2Vzc2libGVUb29sdGlwQnV0dG9ufSBmcm9tIFwiLi9yb3ZpbmcvUm92aW5nQWNjZXNzaWJsZVRvb2x0aXBCdXR0b25cIjtcbiJdfQ==