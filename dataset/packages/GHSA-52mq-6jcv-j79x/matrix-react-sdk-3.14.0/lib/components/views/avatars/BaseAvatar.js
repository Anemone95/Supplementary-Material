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
      return /*#__PURE__*/_react.default.createElement(_AccessibleButton.default, (0, _extends2.default)({}, otherProps, {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2F2YXRhcnMvQmFzZUF2YXRhci50c3giXSwibmFtZXMiOlsiY2FsY3VsYXRlVXJscyIsInVybCIsInVybHMiLCJfdXJscyIsIlNldHRpbmdzU3RvcmUiLCJnZXRWYWx1ZSIsIkFycmF5IiwiZnJvbSIsIlNldCIsInVzZUltYWdlVXJsIiwiaW1hZ2VVcmxzIiwic2V0VXJscyIsInVybHNJbmRleCIsInNldEluZGV4Iiwib25FcnJvciIsImkiLCJKU09OIiwic3RyaW5naWZ5IiwiY2xpIiwiTWF0cml4Q2xpZW50Q29udGV4dCIsIm9uQ2xpZW50U3luYyIsInN5bmNTdGF0ZSIsInByZXZTdGF0ZSIsInJlY29ubmVjdGVkIiwiaW1hZ2VVcmwiLCJCYXNlQXZhdGFyIiwicHJvcHMiLCJuYW1lIiwiaWROYW1lIiwidGl0bGUiLCJ3aWR0aCIsImhlaWdodCIsInJlc2l6ZU1ldGhvZCIsImRlZmF1bHRUb0luaXRpYWxMZXR0ZXIiLCJvbkNsaWNrIiwiaW5wdXRSZWYiLCJjbGFzc05hbWUiLCJvdGhlclByb3BzIiwiaW5pdGlhbExldHRlciIsIkF2YXRhckxvZ2ljIiwiZ2V0SW5pdGlhbExldHRlciIsInRleHROb2RlIiwiZm9udFNpemUiLCJsaW5lSGVpZ2h0IiwiaW1nTm9kZSIsImRlZmF1bHRBdmF0YXJVcmxGb3JTdHJpbmciXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQW1CQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUExQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBMkJBLE1BQU1BLGFBQWEsR0FBRyxDQUFDQyxHQUFELEVBQU1DLElBQU4sS0FBZTtBQUNqQztBQUNBO0FBRUEsTUFBSUMsS0FBSyxHQUFHLEVBQVo7O0FBQ0EsTUFBSSxDQUFD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QUNJLDZCQUFDLHlCQUFEO0FBQ0ksTUFBQSxTQUFTLEVBQUUseUJBQVcsbUNBQVgsRUFBZ0RFLFNBQWhELENBRGY7QUFFSSxNQUFBLE9BQU8sRUFBQyxLQUZaO0FBR0ksTUFBQSxHQUFHLEVBQUVaLFFBSFQ7QUFJSSxNQUFBLE9BQU8sRUFBRVUsT0FKYjtBQUtJLE1BQUEsT0FBTyxFQUFFcEIsT0FMYjtBQU1JLE1BQUEsS0FBSyxFQUFFO0FBQ0hnQixRQUFBQSxLQUFLLEVBQUUsaUJBQUtBLEtBQUwsQ0FESjtBQUVIQyxRQUFBQSxNQUFNLEVBQUUsaUJBQUtBLE1BQUw7QUFGTCxPQU5YO0FBVUksTUFBQSxLQUFLLEVBQUVGLEtBVlg7QUFVa0IsTUFBQSxHQUFHLEVBQUMsRUFWdEI7QUFXSSxNQUFBLFFBQVEsRUFBRU07QUFYZCxPQVlRRSxVQVpSLEVBREo7QUFlSCxHQWhCRCxNQWdCTztBQUNILHdCQUNJO0FBQ0ksTUFBQSxTQUFTLEVBQUUseUJBQVcsbUNBQVgsRUFBZ0RELFNBQWhELENBRGY7QUFFSSxNQUFBLEdBQUcsRUFBRVosUUFGVDtBQUdJLE1BQUEsT0FBTyxFQUFFVixPQUhiO0FBSUksTUFBQSxLQUFLLEVBQUU7QUFDSGdCLFFBQUFBLEtBQUssRUFBRSxpQkFBS0EsS0FBTCxDQURKO0FBRUhDLFFBQUFBLE1BQU0sRUFBRSxpQkFBS0EsTUFBTDtBQUZMLE9BSlg7QUFRSSxNQUFBLEtBQUssRUFBRUYsS0FSWDtBQVFrQixNQUFBLEdBQUcsRUFBQyxFQVJ0QjtBQVNJLE1BQUEsR0FBRyxFQUFFTTtBQVRULE9BVVFFLFVBVlIsRUFESjtBQWFIO0FBQ0osQ0EzR0Q7O2VBNkdlWixVIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDE1LCAyMDE2IE9wZW5NYXJrZXQgTHRkXG5Db3B5cmlnaHQgMjAxOCBOZXcgVmVjdG9yIEx0ZFxuQ29weXJpZ2h0IDIwMTkgTWljaGFlbCBUZWxhdHluc2tpIDw3dDNjaGd1eUBnbWFpbC5jb20+XG5Db3B5cmlnaHQgMjAxOSwgMjAyMCBUaGUgTWF0cml4Lm9yZyBGb3VuZGF0aW9uIEMuSS5DLlxuXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xueW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG5cbiAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG5TZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG5saW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiovXG5cbmltcG9ydCBSZWFjdCwge3VzZUNhbGxiYWNrLCB1c2VDb250ZXh0LCB1c2VFZmZlY3QsIHVzZVN0YXRlfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgY2xhc3NOYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCAqIGFzIEF2YXRhckxvZ2ljIGZyb20gJy4uLy4uLy4uL0F2YXRhcic7XG5pbXBvcnQgU2V0dGluZ3NTdG9yZSBmcm9tIFwiLi4vLi4vLi4vc2V0dGluZ3MvU2V0dGluZ3NTdG9yZVwiO1xuaW1wb3J0IEFjY2Vzc2libGVCdXR0b24gZnJvbSAnLi4vZWxlbWVudHMvQWNjZXNzaWJsZUJ1dHRvbic7XG5pbXBvcnQgTWF0cml4Q2xpZW50Q29udGV4dCBmcm9tIFwiLi4vLi4vLi4vY29udGV4dHMvTWF0cml4Q2xpZW50Q29udGV4dFwiO1xuaW1wb3J0IHt1c2VFdmVudEVtaXR0ZXJ9IGZyb20gXCIuLi8uLi8uLi9ob29rcy91c2VFdmVudEVtaXR0ZXJcIjtcbmltcG9ydCB7dG9QeH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzL3VuaXRzXCI7XG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIG5hbWU6IHN0cmluZzsgLy8gVGhlIG5hbWUgKGZpcnN0IGluaXRpYWwgdXNlZCBhcyBkZWZhdWx0KVxuICAgIGlkTmFtZT86IHN0cmluZzsgLy8gSUQgZm9yIGdlbmVyYXRpbmcgaGFzaCBjb2xvdXJzXG4gICAgdGl0bGU/OiBzdHJpbmc7IC8vIG9uSG92ZXIgdGl0bGUgdGV4dFxuICAgIHVybD86IHN0cmluZzsgLy8gaGlnaGVzdCBwcmlvcml0eSBvZiB0aGVtIGFsbCwgc2hvcnRjdXQgdG8gc2V0IGluIHVybHNbMF1cbiAgICB1cmxzPzogc3RyaW5nW107IC8vIFtoaWdoZXN0X3ByaW9yaXR5LCAuLi4gLCBsb3dlc3RfcHJpb3JpdHldXG4gICAgd2lkdGg/OiBudW1iZXI7XG4gICAgaGVpZ2h0PzogbnVtYmVyO1xuICAgIC8vIFhYWDogcmVzaXplTWV0aG9kIG5vdCBhY3R1YWxseSB1c2VkLlxuICAgIHJlc2l6ZU1ldGhvZD86IHN0cmluZztcbiAgICBkZWZhdWx0VG9Jbml0aWFsTGV0dGVyPzogYm9vbGVhbjsgLy8gdHJ1ZSB0byBhZGQgZGVmYXVsdCB1cmxcbiAgICBvbkNsaWNrPzogUmVhY3QuTW91c2VFdmVudEhhbmRsZXI7XG4gICAgaW5wdXRSZWY/OiBSZWFjdC5SZWZPYmplY3Q8SFRNTEltYWdlRWxlbWVudCAmIEhUTUxTcGFuRWxlbWVudD47XG4gICAgY2xhc3NOYW1lPzogc3RyaW5nO1xufVxuXG5jb25zdCBjYWxjdWxhdGVVcmxzID0gKHVybCwgdXJscykgPT4ge1xuICAgIC8vIHdvcmsgb3V0IHRoZSBmdWxsIHNldCBvZiB1cmxzIHRvIHRyeSB0byBsb2FkLiBUaGlzIGlzIGZvcm1lZCBsaWtlIHNvOlxuICAgIC8vIGltYWdlVXJsczogWyBwcm9wcy51cmwsIC4uLnByb3BzLnVybHMgXVxuXG4gICAgbGV0IF91cmxzID0gW107XG4gICAgaWYgKCFTZXR0aW5nc1N0b3JlLmdldFZhbHVlKFwibG93QmFuZHdpZHRoXCIpKSB7XG4gICAgICAgIF91cmxzID0gdXJscyB8fCBbXTtcblxuICAgICAgICBpZiAodXJsKSB7XG4gICAgICAgICAgICAvLyBjb3B5IHVybHMgYW5kIHB1dCB1cmwgZmlyc3RcbiAgICAgICAgICAgIF91cmxzID0gW3VybCwgLi4uX3VybHNdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gZGVkdXBsaWNhdGUgVVJMc1xuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoX3VybHMpKTtcbn07XG5cbmNvbnN0IHVzZUltYWdlVXJsID0gKHt1cmwsIHVybHN9KTogW3N0cmluZywgKCkgPT4gdm9pZF0gPT4ge1xuICAgIGNvbnN0IFtpbWFnZVVybHMsIHNldFVybHNdID0gdXNlU3RhdGU8c3RyaW5nW10+KGNhbGN1bGF0ZVVybHModXJsLCB1cmxzKSk7XG4gICAgY29uc3QgW3VybHNJbmRleCwgc2V0SW5kZXhdID0gdXNlU3RhdGU8bnVtYmVyPigwKTtcblxuICAgIGNvbnN0IG9uRXJyb3IgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldEluZGV4KGkgPT4gaSArIDEpOyAvLyB0cnkgdGhlIG5leHQgb25lXG4gICAgfSwgW10pO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgc2V0VXJscyhjYWxjdWxhdGVVcmxzKHVybCwgdXJscykpO1xuICAgICAgICBzZXRJbmRleCgwKTtcbiAgICB9LCBbdXJsLCBKU09OLnN0cmluZ2lmeSh1cmxzKV0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIHJlYWN0LWhvb2tzL2V4aGF1c3RpdmUtZGVwc1xuXG4gICAgY29uc3QgY2xpID0gdXNlQ29udGV4dChNYXRyaXhDbGllbnRDb250ZXh0KTtcbiAgICBjb25zdCBvbkNsaWVudFN5bmMgPSB1c2VDYWxsYmFjaygoc3luY1N0YXRlLCBwcmV2U3RhdGUpID0+IHtcbiAgICAgICAgLy8gQ29uc2lkZXIgdGhlIGNsaWVudCByZWNvbm5lY3RlZCBpZiB0aGVyZSBpcyBubyBlcnJvciB3aXRoIHN5bmNpbmcuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhlIHN0YXRlIGNvdWxkIGJlIFJFQ09OTkVDVElORywgU1lOQ0lORywgUFJFUEFSRUQgb3IgQ0FUQ0hVUC5cbiAgICAgICAgY29uc3QgcmVjb25uZWN0ZWQgPSBzeW5jU3RhdGUgIT09IFwiRVJST1JcIiAmJiBwcmV2U3RhdGUgIT09IHN5bmNTdGF0ZTtcbiAgICAgICAgaWYgKHJlY29ubmVjdGVkKSB7XG4gICAgICAgICAgICBzZXRJbmRleCgwKTtcbiAgICAgICAgfVxuICAgIH0sIFtdKTtcbiAgICB1c2VFdmVudEVtaXR0ZXIoY2xpLCBcInN5bmNcIiwgb25DbGllbnRTeW5jKTtcblxuICAgIGNvbnN0IGltYWdlVXJsID0gaW1hZ2VVcmxzW3VybHNJbmRleF07XG4gICAgcmV0dXJuIFtpbWFnZVVybCwgb25FcnJvcl07XG59O1xuXG5jb25zdCBCYXNlQXZhdGFyID0gKHByb3BzOiBJUHJvcHMpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGlkTmFtZSxcbiAgICAgICAgdGl0bGUsXG4gICAgICAgIHVybCxcbiAgICAgICAgdXJscyxcbiAgICAgICAgd2lkdGggPSA0MCxcbiAgICAgICAgaGVpZ2h0ID0gNDAsXG4gICAgICAgIHJlc2l6ZU1ldGhvZCA9IFwiY3JvcFwiLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuICAgICAgICBkZWZhdWx0VG9Jbml0aWFsTGV0dGVyID0gdHJ1ZSxcbiAgICAgICAgb25DbGljayxcbiAgICAgICAgaW5wdXRSZWYsXG4gICAgICAgIGNsYXNzTmFtZSxcbiAgICAgICAgLi4ub3RoZXJQcm9wc1xuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IFtpbWFnZVVybCwgb25FcnJvcl0gPSB1c2VJbWFnZVVybCh7dXJsLCB1cmxzfSk7XG5cbiAgICBpZiAoIWltYWdlVXJsICYmIGRlZmF1bHRUb0luaXRpYWxMZXR0ZXIpIHtcbiAgICAgICAgY29uc3QgaW5pdGlhbExldHRlciA9IEF2YXRhckxvZ2ljLmdldEluaXRpYWxMZXR0ZXIobmFtZSk7XG4gICAgICAgIGNvbnN0IHRleHROb2RlID0gKFxuICAgICAgICAgICAgPHNwYW5cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJteF9CYXNlQXZhdGFyX2luaXRpYWxcIlxuICAgICAgICAgICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6IHRvUHgod2lkdGggKiAwLjY1KSxcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRvUHgod2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiB0b1B4KGhlaWdodCksXG4gICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICB7IGluaXRpYWxMZXR0ZXIgfVxuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICApO1xuICAgICAgICBjb25zdCBpbWdOb2RlID0gKFxuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm14X0Jhc2VBdmF0YXJfaW1hZ2VcIlxuICAgICAgICAgICAgICAgIHNyYz17QXZhdGFyTG9naWMuZGVmYXVsdEF2YXRhclVybEZvclN0cmluZyhpZE5hbWUgfHwgbmFtZSl9XG4gICAgICAgICAgICAgICAgYWx0PVwiXCJcbiAgICAgICAgICAgICAgICB0aXRsZT17dGl0bGV9XG4gICAgICAgICAgICAgICAgb25FcnJvcj17b25FcnJvcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdG9QeCh3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdG9QeChoZWlnaHQpLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCIgLz5cbiAgICAgICAgKTtcblxuICAgICAgICBpZiAob25DbGljaykge1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc31cbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudD1cInNwYW5cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXCJteF9CYXNlQXZhdGFyXCIsIGNsYXNzTmFtZSl9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGlucHV0UmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgdGV4dE5vZGUgfVxuICAgICAgICAgICAgICAgICAgICB7IGltZ05vZGUgfVxuICAgICAgICAgICAgICAgIDwvQWNjZXNzaWJsZUJ1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXJcIiwgY2xhc3NOYW1lKX1cbiAgICAgICAgICAgICAgICAgICAgcmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9XG4gICAgICAgICAgICAgICAgICAgIHJvbGU9XCJwcmVzZW50YXRpb25cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgeyB0ZXh0Tm9kZSB9XG4gICAgICAgICAgICAgICAgICAgIHsgaW1nTm9kZSB9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChvbkNsaWNrKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8QWNjZXNzaWJsZUJ1dHRvblxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXIgbXhfQmFzZUF2YXRhcl9pbWFnZVwiLCBjbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQ9J2ltZydcbiAgICAgICAgICAgICAgICBzcmM9e2ltYWdlVXJsfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICAgICAgICAgICAgb25FcnJvcj17b25FcnJvcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdG9QeCh3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdG9QeChoZWlnaHQpLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfSBhbHQ9XCJcIlxuICAgICAgICAgICAgICAgIGlucHV0UmVmPXtpbnB1dFJlZn1cbiAgICAgICAgICAgICAgICB7Li4ub3RoZXJQcm9wc30gLz5cbiAgICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGltZ1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcIm14X0Jhc2VBdmF0YXIgbXhfQmFzZUF2YXRhcl9pbWFnZVwiLCBjbGFzc05hbWUpfVxuICAgICAgICAgICAgICAgIHNyYz17aW1hZ2VVcmx9XG4gICAgICAgICAgICAgICAgb25FcnJvcj17b25FcnJvcn1cbiAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogdG9QeCh3aWR0aCksXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogdG9QeChoZWlnaHQpLFxuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgdGl0bGU9e3RpdGxlfSBhbHQ9XCJcIlxuICAgICAgICAgICAgICAgIHJlZj17aW5wdXRSZWZ9XG4gICAgICAgICAgICAgICAgey4uLm90aGVyUHJvcHN9IC8+XG4gICAgICAgICk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgQmFzZUF2YXRhcjtcbmV4cG9ydCB0eXBlIEJhc2VBdmF0YXJUeXBlID0gUmVhY3QuRkM8SVByb3BzPjtcbiJdfQ==