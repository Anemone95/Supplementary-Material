"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _react = _interopRequireWildcard(require("react"));

var _classnames = _interopRequireDefault(require("classnames"));

var AvatarLogic = _interopRequireWildcard(require("../../../Avatar"));

var _SettingsStore = _interopRequireDefault(require("../../../settings/SettingsStore"));

var _AccessibleButton = _interopRequireDefault(require("../elements/AccessibleButton"));

var _MatrixClientContext = _interopRequireDefault(require("../../../contexts/MatrixClientContext"));

var _useEventEmitter = require("../../../hooks/useEventEmitter");

var _units = require("../../../utils/units");

var _languageHandler = require("../../../languageHandler");

/*
Copyright 2015, 2016 OpenMarket Ltd
Copyright 2018 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019, 2020 The Matrix.org Foundation C.I.C.

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
const calculateUrls = (url, urls) => {
  // work out the full set of urls to try to load. This is formed like so:
  // imageUrls: [ props.url, ...props.urls ]
  let _urls = [];

  if (!_SettingsStore.default.getValue("lowBandwidth")) {
    _urls = urls || [];

    if (url) {
      // copy urls and put url first
      _urls = [url, ..._urls];
    }
  } // deduplicate URLs


  return Array.from(new Set(_urls));
};

const useImageUrl = ({
  url,
  urls
}) =>
/*: [string, () => void]*/
{
  const [imageUrls, setUrls] = (0, _react.useState)(calculateUrls(url, urls));
  const [urlsIndex, setIndex] = (0, _react.useState)(0);
  const onError = (0, _react.useCallback)(() => {
    setIndex(i => i + 1); // try the next one
  }, []);
  (0, _react.useEffect)(() => {
    setUrls(calculateUrls(url, urls));
    setIndex(0);
  }, [url, JSON.stringify(urls)]); // eslint-disable-line react-hooks/exhaustive-deps

  const cli = (0, _react.useContext)(_MatrixClientContext.default);
  const onClientSync = (0, _react.useCallback)((syncState, prevState) => {
    // Consider the client reconnected if there is no error with syncing.
    // This means the state could be RECONNECTING, SYNCING, PREPARED or CATCHUP.
    const reconnected = syncState !== "ERROR" && prevState !== syncState;

    if (reconnected) {
      setIndex(0);
    }
  }, []);
  (0, _useEventEmitter.useEventEmitter)(cli, "sync", onClientSync);
  const imageUrl = imageUrls[urlsIndex];
  return [imageUrl, onError];
};

const BaseAvatar = (props
/*: IProps*/
) => {
  const {
    name,
    idName,
    title,
    url,
    urls,
    width = 40,
    height = 40,
    resizeMethod = "crop",
    // eslint-disable-line @typescript-eslint/no-unused-vars
    defaultToInitialLetter = true,
    onClick,
    inputRef,
    className
  } = props,
        otherProps = (0, _objectWithoutProperties2.default)(props, ["name", "idName", "title", "url", "urls", "width", "height", "resizeMethod", "defaultToInitialLetter", "onClick", "inputRef", "className"]);
  const [imageUrl, onError] = useImageUrl({
    url,
    urls
  });

  if (!imageUrl && defaultToInitialLetter) {
    const initialLetter = AvatarLogic.getInitialLetter(name);

    const textNode = /*#__PURE__*/_react.default.createElement("span", {
      className: "mx_BaseAvatar_initial",
      "aria-hidden": "true",
      style: {
        fontSize: (0, _units.toPx)(width * 0.65),
        width: (0, _units.toPx)(width),
        lineHeight: (0, _units.toPx)(height)
      }
    }, initialLetter);

    const imgNode = /*#__PURE__*/_react.default.createElement("img", {
      className: "mx_BaseAvatar_image",
      src: AvatarLogic.defaultAvatarUrlForString(idName || name),
      alt: "",
      title: title,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      "aria-hidden": "true"
    });

    if (onClick) {
      return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
        "aria-label": (0, _languageHandler._t)("Avatar")
      }, otherProps, {
        element: "span",
        className: (0, _classnames.default)("mx_BaseAvatar", className),
        onClick: onClick,
        inputRef: inputRef
      }), textNode, imgNode);
    } else {
      return /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({
        className: (0, _classnames.default)("mx_BaseAvatar", className),
        ref: inputRef
      }, otherProps, {
        role: "presentation"
      }), textNode, imgNode);
    }
  }

  if (onClick) {
    return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({
      className: (0, _classnames.default)("mx_BaseAvatar mx_BaseAvatar_image", className),
      element: "img",
      src: imageUrl,
      onClick: onClick,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      title: title,
      alt: "",
      inputRef: inputRef
    }, otherProps));
  } else {
    return /*#__PURE__*/_react.default.createElement("img", (0, _extends2.default)({
      className: (0, _classnames.default)("mx_BaseAvatar mx_BaseAvatar_image", className),
      src: imageUrl,
      onError: onError,
      style: {
        width: (0, _units.toPx)(width),
        height: (0, _units.toPx)(height)
      },
      title: title,
      alt: "",
      ref: inputRef
    }, otherProps));
  }
};

var _default = BaseAvatar;
/*:: export type BaseAvatarType = React.FC<IProps>;*/

exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F2YXRhcnMvQmFzZUF2YXRhci50c3giXSwibmFtZXMiOlsiY2FsY3VsYXRlVXJscyIsInVybCIsInVybHMiLCJfdXJscyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkFycmF5IiwiZnJvbSIsIlNldCIsInVzZUltYWdlVXJsIiwiaW1hZ2VVcmxzIiwic2V0VXJscyIsInVybHNJbmRleCIsInNldEluZGV4Iiwib25FcnJvciIsImkiLCJKU09OIiwic3RyaW5naWZ5IiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIm9uQ2xpZW50U3luYyIsInN5bmNTdGF0ZSIsInByZXZTdGF0ZSIsInJlY29ubmVjdGVkIiwiaW1hZ2VVcmwiLCJCYXNlQXZhdGFyIiwicHJvcHMiLCJuYW1lIiwiaWROYW1lIiwidGl0bGUiLCJ3aWR0aCIsImhlaWdodCIsInJlc2l6ZU1ldGhvZCIsImRlZmF1bHRUb0luaXRpYWxMZXR0ZXIiLCJvbkNsaWNrIiwiaW5wdXRSZWYiLCJjbGFzc05hbWUiLCJvdGhlclByb3BzIiwiaW5pdGlhbExldHRlciIsIkF2YXRhckxvZ2ljIiwiZ2V0SW5pdGlhbExldHRlciIsInRleHROb2RlIiwiZm9udFNpemUiLCJsaW5lSGVpZ2h0IiwiaW1nTm9kZSIsImRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQTs7QUE1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBNkJBLE1BQU1BLGFBQWEsR0FBRyxDQUFDQyxHQUFELEVBQU1DLElBQU4sS0FBZTtBQUNqQztBQUNBO0FBRUEsTUFBSUMsS0FBSyxHQUFHLEVBQVo7O0FBQ0EsTUFB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QUNKOztBQUVELE1BQUlWLE9BQUosRUFBYTtBQUNULHdCQUNJLDZCQUFDLHlCQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUseUJBQVcsbUNBQVgsRUFBZ0RFLFNBQWhELENBRGY7QUFFSSxNQUFBLE9BQU8sRUFBQyxLQUZaO0FBR0ksTUFBQSxHQUFHLEVBQUVaLFFBSFQ7QUFJSSxNQUFBLE9BQU8sRUFBRVUsT0FKYjtBQUtJLE1BQUEsT0FBTyxFQUFFcEIsT0FMYjtBQU1JLE1BQUEsS0FBSyxFQUFFO0FBQ0hnQixRQUFBQSxLQUFLLEVBQUUsaUJBQUtBLEtBQUwsQ0FESjtBQUVIQyxRQUFBQSxNQUFNLEVBQUUsaUJBQUtBLE1BQUw7QUFGTCxPQU5YO0FBVUksTUFBQSxLQUFLLEVBQUVGLEtBVlg7QUFVa0IsTUFBQSxHQUFHLEVBQUMsRUFWdEI7QUFXSSxNQUFBLFFBQVEsRUFBRU07QUFYZCxPQVlRRSxVQVpSLEVBREo7QUFlSCxHQWhCRCxNQWdCTztBQUNILHdCQUNJO0FBQ0ksTUFBQSxTQUFTLEVBQUUseUJBQVcsbUNBQVgsRUFBZ0RELFNBQWhELENBRGY7QUFFSSxNQUFBLEdBQUcsRUFBRVosUUFGVDtBQUdJLE1BQUEsT0FBTyxFQUFFVixPQUhiO0FBSUksTUFBQSxLQUFLLEVBQUU7QUFDSGdCLFFBQUFBLEtBQUssRUFBRSxpQkFBS0EsS0FBTCxDQURKO0FBRUhDLFFBQUFBLE1BQU0sRUFBRSxpQkFBS0EsTUFBTDtBQUZMLE9BSlg7QUFRSSxNQUFBLEtBQUssRUFBRUYsS0FSWDtBQVFrQixNQUFBLEdBQUcsRUFBQyxFQVJ0QjtBQVNJLE1BQUEsR0FBRyxFQUFFTTtBQVRULE9BVVFFLFVBVlIsRUFESjtBQWFIO0FBQ0osQ0E1R0Q7O2VBOEdlWixVIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge3VzZUNhbGxiYWNrLCB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVN0YXRlfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCAqIGFzIEF2YXRhckxvZ2ljIGZyb20gJy4uLy4uLy4uL0F2YXRhcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHt1c2VFdmVudEVtaXR0ZXJ9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCB7dG9QeH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3VuaXRzXCI7XG5pbXBvcnQge1Jlc2l6ZU1ldGhvZH0gZnJvbSBcIi4uLy4uLy4uL0F2YXRhclwiO1xuaW1wb3J0IHsgX3QgfSBmcm9tICcuLi8uLi8uLi9sYW5ndWFnZUhhbmRsZXInO1xuXG5pbnRlcmZhY2UgSVByb3BzIHtcbiAgICBuYW1lOiBzdHJpbmc7IC8vIFRoZSBuYW1lIChmaXJzdCBpbml0aWFsIHVzZWQgYXMgZGVmYXVsdClcbiAgICBpZE5hbWU/OiBzdHJpbmc7IC8vIElEIGZvciBnZW5lcmF0aW5nIGhhc2ggY29sb3Vyc1xuICAgIHRpdGxlPzogc3RyaW5nOyAvLyBvbkhvdmVyIHRpdGxlIHRleHRcbiAgICB1cmw/OiBzdHJpbmc7IC8vIGhpZ2hlc3QgcHJpb3JpdHkgb2YgdGhlbSBhbGwsIHNob3J0Y3V0IHRvIHNldCBpbiB1cmxzWzBdXG4gICAgdXJscz86IHN0cmluZ1tdOyAvLyBbaGlnaGVzdF9wcmlvcml0eSwgLi4uICwgbG93ZXN0X3ByaW9yaXR5XVxuICAgIHdpZHRoPzogbnVtYmVyO1xuICAgIGhlaWdodD86IG51bWJlcjtcbiAgICAvLyBYWFg6IHJlc2l6ZU1ldGhvZCBub3QgYWN0dWFsbHkgdXNlZC5cbiAgICByZXNpemVNZXRob2Q/OiBSZXNpemVNZXRob2Q7XG4gICAgZGVmYXVsdFRvSW5pdGlhbExldHRlcj86IGJvb2xlYW47IC8vIHRydWUgdG8gYWRkIGRlZmF1bHQgdXJsXG4gICAgb25DbGljaz86IFJlYWN0Lk1vdXNlRXZlbnRIYW5kbGVyO1xuICAgIGlucHV0UmVmPzogUmVhY3QuUmVmT2JqZWN0PEhUTUxJbWFnZUVsZW1lbnQgJiBIVE1MU3BhbkVsZW1lbnQ+O1xuICAgIGNsYXNzTmFtZT86IHN0cmluZztcbn1cblxuY29uc3QgY2FsY3VsYXRlVXJscyA9ICh1cmwsIHVybHMpID0+IHtcbiAgICAvLyB3b3JrIG91dCB0aGUgZnVsbCBzZXQgb2YgdXJscyB0byB0cnkgdG8gbG9hZC4gVGhpcyBpcyBmb3JtZWQgbGlrZSBzbzpcbiAgICAvLyBpbWFnZVVybHM6IFsgcHJvcHMudXJsLCAuLi5wcm9wcy51cmxzIF1cblxuICAgIGxldCBfdXJscyA9IFtdO1xuICAgIGlmICghU2V0dGluZ3NTdG9yZS5nZXRWYWx1ZShcImxvd0JhbmR3aWR0aFwiKSkge1xuICAgICAgICBfdXJscyA9IHVybHMgfHwgW107XG5cbiAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgLy8gY29weSB1cmxzIGFuZCBwdXQgdXJsIGZpcnN0XG4gICAgICAgICAgICBfdXJscyA9IFt1cmwsIC4uLl91cmxzXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGRlZHVwbGljYXRlIFVSTHNcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KF91cmxzKSk7XG59O1xuXG5jb25zdCB1c2VJbWFnZVVybCA9ICh7dXJsLCB1cmxzfSk6IFtzdHJpbmcsICgpID0+IHZvaWRdID0+IHtcbiAgICBjb25zdCBbaW1hZ2VVcmxzLCBzZXRVcmxzXSA9IHVzZVN0YXRlPHN0cmluZ1tdPihjYWxjdWxhdGVVcmxzKHVybCwgdXJscykpO1xuICAgIGNvbnN0IFt1cmxzSW5kZXgsIHNldEluZGV4XSA9IHVzZVN0YXRlPG51bWJlcj4oMCk7XG5cbiAgICBjb25zdCBvbkVycm9yID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBzZXRJbmRleChpID0+IGkgKyAxKTsgLy8gdHJ5IHRoZSBuZXh0IG9uZVxuICAgIH0sIFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNldFVybHMoY2FsY3VsYXRlVXJscyh1cmwsIHVybHMpKTtcbiAgICAgICAgc2V0SW5kZXgoMCk7XG4gICAgfSwgW3VybCwgSlNPTi5zdHJpbmdpZnkodXJscyldKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSByZWFjdC1ob29rcy9leGhhdXN0aXZlLWRlcHNcblxuICAgIGNvbnN0IGNsaSA9IHVzZUNvbnRleHQoTWF0cml4Q2xpZW50Q29udGV4dCk7XG4gICAgY29uc3Qgb25DbGllbnRTeW5jID0gdXNlQ2FsbGJhY2soKHN5bmNTdGF0ZSwgcHJldlN0YXRlKSA9PiB7XG4gICAgICAgIC8vIENvbnNpZGVyIHRoZSBjbGllbnQgcmVjb25uZWN0ZWQgaWYgdGhlcmUgaXMgbm8gZXJyb3Igd2l0aCBzeW5jaW5nLlxuICAgICAgICAvLyBUaGlzIG1lYW5zIHRoZSBzdGF0ZSBjb3VsZCBiZSBSRUNPTk5FQ1RJTkcsIFNZTkNJTkcsIFBSRVBBUkVEIG9yIENBVENIVVAuXG4gICAgICAgIGNvbnN0IHJlY29ubmVjdGVkID0gc3luY1N0YXRlICE9PSBcIkVSUk9SXCIgJiYgcHJldlN0YXRlICE9PSBzeW5jU3RhdGU7XG4gICAgICAgIGlmIChyZWNvbm5lY3RlZCkge1xuICAgICAgICAgICAgc2V0SW5kZXgoMCk7XG4gICAgICAgIH1cbiAgICB9LCBbXSk7XG4gICAgdXNlRXZlbnRFbWl0dGVyKGNsaSwgXCJzeW5jXCIsIG9uQ2xpZW50U3luYyk7XG5cbiAgICBjb25zdCBpbWFnZVVybCA9IGltYWdlVXJsc1t1cmxzSW5kZXhdO1xuICAgIHJldHVybiBbaW1hZ2VVcmwsIG9uRXJyb3JdO1xufTtcblxuY29uc3QgQmFzZUF2YXRhciA9IChwcm9wczogSVByb3BzKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICBuYW1lLFxuICAgICAgICBpZE5hbWUsXG4gICAgICAgIHRpdGxlLFxuICAgICAgICB1cmwsXG4gICAgICAgIHVybHMsXG4gICAgICAgIHdpZHRoID0gNDAsXG4gICAgICAgIGhlaWdodCA9IDQwLFxuICAgICAgICByZXNpemVNZXRob2QgPSBcImNyb3BcIiwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbiAgICAgICAgZGVmYXVsdFRvSW5pdGlhbExldHRlciA9IHRydWUsXG4gICAgICAgIG9uQ2xpY2ssXG4gICAgICAgIGlucHV0UmVmLFxuICAgICAgICBjbGFzc05hbWUsXG4gICAgICAgIC4uLm90aGVyUHJvcHNcbiAgICB9ID0gcHJvcHM7XG5cbiAgICBjb25zdCBbaW1hZ2VVcmwsIG9uRXJyb3JdID0gdXNlSW1hZ2VVcmwoe3VybCwgdXJsc30pO1xuXG4gICAgaWYgKCFpbWFnZVVybCAmJiBkZWZhdWx0VG9Jbml0aWFsTGV0dGVyKSB7XG4gICAgICAgIGNvbnN0IGluaXRpYWxMZXR0ZXIgPSBBdmF0YXJMb2dpYy5nZXRJbml0aWFsTGV0dGVyKG5hbWUpO1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IChcbiAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXhfQmFzZUF2YXRhcl9pbml0aWFsXCJcbiAgICAgICAgICAgICAgICBhcmlhLWhpZGRlbj1cInRydWVcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiB0b1B4KHdpZHRoICogMC42NSksXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0b1B4KHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogdG9QeChoZWlnaHQpLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgeyBpbml0aWFsTGV0dGVyIH1cbiAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgaW1nTm9kZSA9IChcbiAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9CYXNlQXZhdGFyX2ltYWdlXCJcbiAgICAgICAgICAgICAgICBzcmM9e0F2YXRhckxvZ2ljLmRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmcoaWROYW1lIHx8IG5hbWUpfVxuICAgICAgICAgICAgICAgIGFsdD1cIlwiXG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfVxuICAgICAgICAgICAgICAgIG9uRXJyb3I9e29uRXJyb3J9XG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRvUHgod2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHRvUHgoaGVpZ2h0KSxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiIC8+XG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPEFjY2Vzc2libGVCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD17X3QoXCJBdmF0YXJcIil9XG4gICAgICAgICAgICAgICAgICAgIHsuLi5vdGhlclByb3BzfVxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50PVwic3BhblwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXJcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgICAgICAgICAgICAgaW5wdXRSZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0ZXh0Tm9kZSB9XG4gICAgICAgICAgICAgICAgICAgIHsgaW1nTm9kZSB9XG4gICAgICAgICAgICAgICAgPC9BY2Nlc3NpYmxlQnV0dG9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfQmFzZUF2YXRhclwiLCBjbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgICAgICByZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IHRleHROb2RlIH1cbiAgICAgICAgICAgICAgICAgICAgeyBpbWdOb2RlIH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxBY2Nlc3NpYmxlQnV0dG9uXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfQmFzZUF2YXRhciBteF9CYXNlQXZhdGFyX2ltYWdlXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgZWxlbWVudD0naW1nJ1xuICAgICAgICAgICAgICAgIHNyYz17aW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgb25DbGljaz17b25DbGlja31cbiAgICAgICAgICAgICAgICBvbkVycm9yPXtvbkVycm9yfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0b1B4KHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0b1B4KGhlaWdodCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9IGFsdD1cIlwiXG4gICAgICAgICAgICAgICAgaW5wdXRSZWY9e2lucHV0UmVmfVxuICAgICAgICAgICAgICAgIHsuLi5vdGhlclByb3BzfSAvPlxuICAgICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKFwibXhfQmFzZUF2YXRhciBteF9CYXNlQXZhdGFyX2ltYWdlXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgc3JjPXtpbWFnZVVybH1cbiAgICAgICAgICAgICAgICBvbkVycm9yPXtvbkVycm9yfVxuICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB0b1B4KHdpZHRoKSxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiB0b1B4KGhlaWdodCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9IGFsdD1cIlwiXG4gICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc30gLz5cbiAgICAgICAgKTtcbiAgICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNlQXZhdGFyO1xuZXhwb3J0IHR5cGUgQmFzZUF2YXRhclR5cGUgPSBSZWFjdC5GQzxJUHJvcHM+O1xuIl19