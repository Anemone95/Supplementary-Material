"use strict";

var _interopRequireWildcard3 = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _react = _interopRequireWildcard3(require("react"));

var _dispatcher = _interopRequireDefault(require("../../../dispatcher/dispatcher"));

var _effects = require("../../../effects");

/*
 Copyright 2020 Nurjin Jafar
 Copyright 2020 Nordeck IT + Consulting GmbH.

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
const EffectsOverlay
/*: FunctionComponent<IProps>*/
= ({
  roomWidth
}) => {
  const canvasRef = (0, _react.useRef)(null);
  const effectsRef = (0, _react.useRef)(new Map());

  const lazyLoadEffectModule = async (name
  /*: string*/
  ) =>
  /*: Promise<ICanvasEffect>*/
  {
    if (!name) return null;
    let effect
    /*: ICanvasEffect | null*/
    = effectsRef.current[name] || null;

    if (effect === null) {
      const options = _effects.CHAT_EFFECTS.find(e => e.command === name)?.options;

      try {
        const {
          default: Effect
        } = await Promise.resolve(`../../../effects/${name}`).then(s => (0, _interopRequireWildcard2.default)(require(s)));
        effect = new Effect(options);
        effectsRef.current[name] = effect;
      } catch (err) {
        console.warn('Unable to load effect module at \'../../../effects/${name}\'.', err);
      }
    }

    return effect;
  };

  (0, _react.useEffect)(() => {
    const resize = () => {
      if (canvasRef.current) {
        canvasRef.current.height = window.innerHeight;
      }
    };

    const onAction = (payload
    /*: { action: string }*/
    ) => {
      const actionPrefix = 'effects.';

      if (payload.action.indexOf(actionPrefix) === 0) {
        const effect = payload.action.substr(actionPrefix.length);
        lazyLoadEffectModule(effect).then(module => module?.start(canvasRef.current));
      }
    };

    const dispatcherRef = _dispatcher.default.register(onAction);

    const canvas = canvasRef.current;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', resize, true);
    return () => {
      _dispatcher.default.unregister(dispatcherRef);

      window.removeEventListener('resize', resize); // eslint-disable-next-line react-hooks/exhaustive-deps

      const currentEffects = effectsRef.current; // this is not a react node ref, warning can be safely ignored

      for (const effect in currentEffects) {
        const effectModule
        /*: ICanvasEffect*/
        = currentEffects[effect];

        if (effectModule && effectModule.isRunning) {
          effectModule.stop();
        }
      }
    };
  }, []);
  return /*#__PURE__*/_react.default.createElement("canvas", {
    ref: canvasRef,
    width: roomWidth,
    style: {
      display: 'block',
      zIndex: 999999,
      pointerEvents: 'none',
      position: 'fixed',
      top: 0,
      right: 0
    }
  });
};

var _default = EffectsOverlay;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb21wb25lbnRzL3ZpZXdzL2VsZW1lbnRzL0VmZmVjdHNPdmVybGF5LnRzeCJdLCJuYW1lcyI6WyJFZmZlY3RzT3ZlcmxheSIsInJvb21XaWR0aCIsImNhbnZhc1JlZiIsImVmZmVjdHNSZWYiLCJNYXAiLCJsYXp5TG9hZEVmZmVjdE1vZHVsZSIsIm5hbWUiLCJlZmZlY3QiLCJjdXJyZW50Iiwib3B0aW9ucyIsIkNIQVRfRUZGRUNUUyIsImZpbmQiLCJlIiwiY29tbWFuZCIsImRlZmF1bHQiLCJFZmZlY3QiLCJlcnIiLCJjb25zb2xlIiwid2FybiIsInJlc2l6ZSIsImhlaWdodCIsIndpbmRvdyIsImlubmVySGVpZ2h0Iiwib25BY3Rpb24iLCJwYXlsb2FkIiwiYWN0aW9uUHJlZml4IiwiYWN0aW9uIiwiaW5kZXhPZiIsInN1YnN0ciIsImxlbmd0aCIsInRoZW4iLCJtb2R1bGUiLCJzdGFydCIsImRpc3BhdGNoZXJSZWYiLCJkaXMiLCJyZWdpc3RlciIsImNhbnZhcyIsImFkZEV2ZW50TGlzdGVuZXIiLCJ1bnJlZ2lzdGVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImN1cnJlbnRFZmZlY3RzIiwiZWZmZWN0TW9kdWxlIiwiaXNSdW5uaW5nIiwic3RvcCIsImRpc3BsYXkiLCJ6SW5kZXgiLCJwb2ludGVyRXZlbnRzIiwicG9zaXRpb24iLCJ0b3AiLCJyaWdodCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWdCQTs7QUFDQTs7QUFFQTs7QUFuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFVQSxNQUFNQTtBQUF5QztBQUFBLEVBQUcsQ0FBQztBQUFFQyxFQUFBQTtBQUFGLENBQUQsS0FBbUI7QUFDakUsUUFBTUMsU0FBUyxHQUFHLG1CQUEwQixJQUExQixDQUFsQjtBQUNBLFFBQU1DLFVBQVUsR0FBRyxtQkFBbUMsSUFBSUMsR0FBSixFQUFuQyxDQUFuQjs7QUFFQSxRQUFNQyxvQkFBb0IsR0FBRyxPQUFPQztBQUFQO0FBQUE7QUFBQTtBQUFnRDtBQUN6RSxRQUFJLENBQUNBLElBQUwsRUFBVyxPQUFPLElBQVA7QUFDWCxRQUFJQztBQUE0QjtBQUFBLE1BQUdKLFVBQVUsQ0FBQ0ssT0FBWCxDQUFtQkYsSUFBbkIsS0FBNEIsSUFBL0Q7O0FBQ0EsUUFBSUMsTUFBTSxLQUFLLElBQWYsRUFBcUI7QUFDakIsWUFBTUUsT0FBTyxHQUFHQyxzQkFBYUMsSUFBYixDQUFtQkMsQ0FBRCxJQUFPQSxDQUFDLENBQUNDLE9BQUYsS0FBY1AsSUFBdkMsR0FBOENHLE9BQTlEOztBQUNBLFVBQUk7QUFDQSxjQUFNO0FBQUVLLFVBQUFBLE9BQU8sRUFBRUM7QUFBWCxZQUFzQixzQkFBYyxvQkFBbUJULElBQUssRUFBdEMsOERBQTVCO0FBQ0FDLFFBQUFBLE1BQU0sR0FBRyxJQUFJUSxNQUFKLENBQVdOLE9BQVgsQ0FBVDtBQUNBTixRQUFBQSxVQUFVLENBQUNLLE9BQVgsQ0FBbUJGLElBQW5CLElBQTJCQyxNQUEzQjtBQUNILE9BSkQsQ0FJRSxPQUFPUyxHQUFQLEVBQVk7QUFDVkMsUUFBQUEsT0FBTyxDQUFDQyxJQUFSLENBQWEsK0RBQWIsRUFBOEVGLEdBQTlFO0FBQ0g7QUFDSjs7QUFDRCxXQUFPVCxNQUFQO0FBQ0gsR0FkRDs7QUFnQkEsd0JBQVUsTUFBTTtBQUNaLFVBQU1ZLE1BQU0sR0FBRyxNQUFNO0FBQ2pCLFVBQUlqQixTQUFTLENBQUNNLE9BQWQsRUFBdUI7QUFDbkJOLFFBQUFBLFNBQVMsQ0FBQ00sT0FBVixDQUFrQlksTUFBbEIsR0FBMkJDLE1BQU0sQ0FBQ0MsV0FBbEM7QUFDSDtBQUNKLEtBSkQ7O0FBS0EsVUFBTUMsUUFBUSxHQUFHLENBQUNDO0FBQUQ7QUFBQSxTQUFpQztBQUM5QyxZQUFNQyxZQUFZLEdBQUcsVUFBckI7O0FBQ0EsVUFBSUQsT0FBTyxDQUFDRSxNQUFSLENBQWVDLE9BQWYsQ0FBdUJGLFlBQXZCLE1BQXlDLENBQTdDLEVBQWdEO0FBQzVDLGNBQU1sQixNQUFNLEdBQUdpQixPQUFPLENBQUNFLE1BQVIsQ0FBZUUsTUFBZixDQUFzQkgsWUFBWSxDQUFDSSxNQUFuQyxDQUFmO0FBQ0F4QixRQUFBQSxvQkFBb0IsQ0FBQ0UsTUFBRCxDQUFwQixDQUE2QnVCLElBQTdCLENBQW1DQyxNQUFELElBQVlBLE1BQU0sRUFBRUMsS0FBUixDQUFjOUIsU0FBUyxDQUFDTSxPQUF4QixDQUE5QztBQUNIO0FBQ0osS0FORDs7QUFPQSxVQUFNeUIsYUFBYSxHQUFHQyxvQkFBSUMsUUFBSixDQUFhWixRQUFiLENBQXRCOztBQUNBLFVBQU1hLE1BQU0sR0FBR2xDLFNBQVMsQ0FBQ00sT0FBekI7QUFDQTRCLElBQUFBLE1BQU0sQ0FBQ2hCLE1BQVAsR0FBZ0JDLE1BQU0sQ0FBQ0MsV0FBdkI7QUFDQUQsSUFBQUEsTUFBTSxDQUFDZ0IsZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0NsQixNQUFsQyxFQUEwQyxJQUExQztBQUVBLFdBQU8sTUFBTTtBQUNUZSwwQkFBSUksVUFBSixDQUFlTCxhQUFmOztBQUNBWixNQUFBQSxNQUFNLENBQUNrQixtQkFBUCxDQUEyQixRQUEzQixFQUFxQ3BCLE1BQXJDLEVBRlMsQ0FHVDs7QUFDQSxZQUFNcUIsY0FBYyxHQUFHckMsVUFBVSxDQUFDSyxPQUFsQyxDQUpTLENBSWtDOztBQUMzQyxXQUFLLE1BQU1ELE1BQVgsSUFBcUJpQyxjQUFyQixFQUFxQztBQUNqQyxjQUFNQztBQUEyQjtBQUFBLFVBQUdELGNBQWMsQ0FBQ2pDLE1BQUQsQ0FBbEQ7O0FBQ0EsWUFBSWtDLFlBQVksSUFBSUEsWUFBWSxDQUFDQyxTQUFqQyxFQUE0QztBQUN4Q0QsVUFBQUEsWUFBWSxDQUFDRSxJQUFiO0FBQ0g7QUFDSjtBQUNKLEtBWEQ7QUFZSCxHQTlCRCxFQThCRyxFQTlCSDtBQWdDQSxzQkFDSTtBQUNJLElBQUEsR0FBRyxFQUFFekMsU0FEVDtBQUVJLElBQUEsS0FBSyxFQUFFRCxTQUZYO0FBR0ksSUFBQSxLQUFLLEVBQUU7QUFDSDJDLE1BQUFBLE9BQU8sRUFBRSxPQUROO0FBRUhDLE1BQUFBLE1BQU0sRUFBRSxNQUZMO0FBR0hDLE1BQUFBLGFBQWEsRUFBRSxNQUhaO0FBSUhDLE1BQUFBLFFBQVEsRUFBRSxPQUpQO0FBS0hDLE1BQUFBLEdBQUcsRUFBRSxDQUxGO0FBTUhDLE1BQUFBLEtBQUssRUFBRTtBQU5KO0FBSFgsSUFESjtBQWNILENBbEVEOztlQW9FZWpELGMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDIwIE51cmppbiBKYWZhclxuIENvcHlyaWdodCAyMDIwIE5vcmRlY2sgSVQgKyBDb25zdWx0aW5nIEdtYkguXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCBSZWFjdCwgeyBGdW5jdGlvbkNvbXBvbmVudCwgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzIGZyb20gJy4uLy4uLy4uL2Rpc3BhdGNoZXIvZGlzcGF0Y2hlcic7XG5pbXBvcnQgSUNhbnZhc0VmZmVjdCBmcm9tICcuLi8uLi8uLi9lZmZlY3RzL0lDYW52YXNFZmZlY3QnO1xuaW1wb3J0IHtDSEFUX0VGRkVDVFN9IGZyb20gJy4uLy4uLy4uL2VmZmVjdHMnXG5cbmludGVyZmFjZSBJUHJvcHMge1xuICAgIHJvb21XaWR0aDogbnVtYmVyO1xufVxuXG5jb25zdCBFZmZlY3RzT3ZlcmxheTogRnVuY3Rpb25Db21wb25lbnQ8SVByb3BzPiA9ICh7IHJvb21XaWR0aCB9KSA9PiB7XG4gICAgY29uc3QgY2FudmFzUmVmID0gdXNlUmVmPEhUTUxDYW52YXNFbGVtZW50PihudWxsKTtcbiAgICBjb25zdCBlZmZlY3RzUmVmID0gdXNlUmVmPE1hcDxzdHJpbmcsIElDYW52YXNFZmZlY3Q+PihuZXcgTWFwPHN0cmluZywgSUNhbnZhc0VmZmVjdD4oKSk7XG5cbiAgICBjb25zdCBsYXp5TG9hZEVmZmVjdE1vZHVsZSA9IGFzeW5jIChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPElDYW52YXNFZmZlY3Q+ID0+IHtcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm4gbnVsbDtcbiAgICAgICAgbGV0IGVmZmVjdDogSUNhbnZhc0VmZmVjdCB8IG51bGwgPSBlZmZlY3RzUmVmLmN1cnJlbnRbbmFtZV0gfHwgbnVsbDtcbiAgICAgICAgaWYgKGVmZmVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IENIQVRfRUZGRUNUUy5maW5kKChlKSA9PiBlLmNvbW1hbmQgPT09IG5hbWUpPy5vcHRpb25zXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgZGVmYXVsdDogRWZmZWN0IH0gPSBhd2FpdCBpbXBvcnQoYC4uLy4uLy4uL2VmZmVjdHMvJHtuYW1lfWApO1xuICAgICAgICAgICAgICAgIGVmZmVjdCA9IG5ldyBFZmZlY3Qob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgZWZmZWN0c1JlZi5jdXJyZW50W25hbWVdID0gZWZmZWN0O1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbmFibGUgdG8gbG9hZCBlZmZlY3QgbW9kdWxlIGF0IFxcJy4uLy4uLy4uL2VmZmVjdHMvJHtuYW1lfVxcJy4nLCBlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlZmZlY3Q7XG4gICAgfTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc2l6ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChjYW52YXNSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNhbnZhc1JlZi5jdXJyZW50LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY29uc3Qgb25BY3Rpb24gPSAocGF5bG9hZDogeyBhY3Rpb246IHN0cmluZyB9KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhY3Rpb25QcmVmaXggPSAnZWZmZWN0cy4nO1xuICAgICAgICAgICAgaWYgKHBheWxvYWQuYWN0aW9uLmluZGV4T2YoYWN0aW9uUHJlZml4KSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVmZmVjdCA9IHBheWxvYWQuYWN0aW9uLnN1YnN0cihhY3Rpb25QcmVmaXgubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBsYXp5TG9hZEVmZmVjdE1vZHVsZShlZmZlY3QpLnRoZW4oKG1vZHVsZSkgPT4gbW9kdWxlPy5zdGFydChjYW52YXNSZWYuY3VycmVudCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRpc3BhdGNoZXJSZWYgPSBkaXMucmVnaXN0ZXIob25BY3Rpb24pO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjYW52YXNSZWYuY3VycmVudDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGRpcy51bnJlZ2lzdGVyKGRpc3BhdGNoZXJSZWYpO1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZSk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcmVhY3QtaG9va3MvZXhoYXVzdGl2ZS1kZXBzXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50RWZmZWN0cyA9IGVmZmVjdHNSZWYuY3VycmVudDsgLy8gdGhpcyBpcyBub3QgYSByZWFjdCBub2RlIHJlZiwgd2FybmluZyBjYW4gYmUgc2FmZWx5IGlnbm9yZWRcbiAgICAgICAgICAgIGZvciAoY29uc3QgZWZmZWN0IGluIGN1cnJlbnRFZmZlY3RzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWZmZWN0TW9kdWxlOiBJQ2FudmFzRWZmZWN0ID0gY3VycmVudEVmZmVjdHNbZWZmZWN0XTtcbiAgICAgICAgICAgICAgICBpZiAoZWZmZWN0TW9kdWxlICYmIGVmZmVjdE1vZHVsZS5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgZWZmZWN0TW9kdWxlLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSwgW10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGNhbnZhc1xuICAgICAgICAgICAgcmVmPXtjYW52YXNSZWZ9XG4gICAgICAgICAgICB3aWR0aD17cm9vbVdpZHRofVxuICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnYmxvY2snLFxuICAgICAgICAgICAgICAgIHpJbmRleDogOTk5OTk5LFxuICAgICAgICAgICAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcbiAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgcmlnaHQ6IDAsXG4gICAgICAgICAgICB9fVxuICAgICAgICAvPlxuICAgIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgRWZmZWN0c092ZXJsYXk7XG4iXX0=