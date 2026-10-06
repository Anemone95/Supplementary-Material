"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DefaultOptions = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _arrays = require("../../utils/arrays");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

const DefaultOptions
/*: SnowfallOptions*/
= {
  maxCount: 200,
  gravity: 0.05,
  maxDrift: 5
};
exports.DefaultOptions = DefaultOptions;
const KEY_FRAME_INTERVAL = 15; // 15ms, roughly

class Snowfall
/*:: implements ICanvasEffect*/
{
  constructor(options
  /*: { [key: string]: any }*/
  ) {
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "lastAnimationTime", void 0);
    (0, _defineProperty2.default)(this, "isRunning", void 0);
    (0, _defineProperty2.default)(this, "start", async (canvas
    /*: HTMLCanvasElement*/
    , timeout = 3000) => {
      if (!canvas) {
        return;
      }

      this.context = canvas.getContext('2d');
      this.particles = [];
      const count = this.options.maxCount;

      while (this.particles.length < count) {
        this.particles.push(this.resetParticle({}, canvas.width, canvas.height));
      }

      this.isRunning = true;
      requestAnimationFrame(this.renderLoop);

      if (timeout) {
        window.setTimeout(this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "resetParticle", (particle
    /*: Snowflake*/
    , width
    /*: number*/
    , height
    /*: number*/
    ) =>
    /*: Snowflake*/
    {
      particle.x = Math.random() * width;
      particle.y = Math.random() * -height;
      particle.xCol = particle.x;
      particle.diameter = Math.random() * 7 + 4;
      particle.maximumDrift = Math.random() * this.options.maxDrift + 3.5;
      particle.gravity = this.options.gravity + Math.random() * 6 + 4;
      return particle;
    });
    (0, _defineProperty2.default)(this, "renderLoop", () =>
    /*: void*/
    {
      if (!this.context || !this.context.canvas) {
        return;
      }

      if (this.particles.length === 0) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      } else {
        const timeDelta = Date.now() - this.lastAnimationTime;

        if (timeDelta >= KEY_FRAME_INTERVAL || !this.lastAnimationTime) {
          // Clear the screen first
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.lastAnimationTime = Date.now();
          this.animateAndRenderSnowflakes();
        }

        requestAnimationFrame(this.renderLoop);
      }
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

  animateAndRenderSnowflakes() {
    if (!this.context || !this.context.canvas) {
      return;
    }

    const height = this.context.canvas.height;

    for (const particle of (0, _arrays.arrayFastClone)(this.particles)) {
      particle.y += particle.gravity; // We treat the drift as a sine function to have a more fluid-like movement instead
      // of a pong-like movement off walls of the X column. This means that for
      // $x=A\sin(\frac{2\pi}{P}y)$ we use the `maximumDrift` as the amplitude (A) and a
      // large multiplier to create a very long waveform through P.

      const peakDistance = 75 * particle.maximumDrift;
      const PI2 = Math.PI * 2;
      particle.x = particle.maximumDrift * Math.sin(PI2 / peakDistance * particle.y);
      particle.x += particle.xCol; // bring the particle to the right place

      const radius = particle.diameter / 2;
      this.context.save();
      this.context.beginPath();
      this.context.ellipse(particle.x, particle.y, radius, radius, 0, 0, 360);
      this.context.fillStyle = '#eaeaea'; // grey so it shows up on the light theme

      this.context.fill();
      this.context.closePath();
      this.context.restore(); // Remove any dead snowflakes

      const maxBounds = radius * 4; // make sure it's *really* off screen

      if (particle.y > height + maxBounds) {
        const idx = this.particles.indexOf(particle);
        this.particles.splice(idx, 1);
      }
    }
  }

}

exports.default = Snowfall;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lZmZlY3RzL3Nub3dmYWxsL2luZGV4LnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRPcHRpb25zIiwibWF4Q291bnQiLCJncmF2aXR5IiwibWF4RHJpZnQiLCJLRVlfRlJBTUVfSU5URVJWQUwiLCJTbm93ZmFsbCIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsImNhbnZhcyIsInRpbWVvdXQiLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInBhcnRpY2xlcyIsImNvdW50IiwibGVuZ3RoIiwicHVzaCIsInJlc2V0UGFydGljbGUiLCJ3aWR0aCIsImhlaWdodCIsImlzUnVubmluZyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInJlbmRlckxvb3AiLCJ3aW5kb3ciLCJzZXRUaW1lb3V0Iiwic3RvcCIsInBhcnRpY2xlIiwieCIsIk1hdGgiLCJyYW5kb20iLCJ5IiwieENvbCIsImRpYW1ldGVyIiwibWF4aW11bURyaWZ0IiwiY2xlYXJSZWN0IiwidGltZURlbHRhIiwiRGF0ZSIsIm5vdyIsImxhc3RBbmltYXRpb25UaW1lIiwiYW5pbWF0ZUFuZFJlbmRlclNub3dmbGFrZXMiLCJwZWFrRGlzdGFuY2UiLCJQSTIiLCJQSSIsInNpbiIsInJhZGl1cyIsInNhdmUiLCJiZWdpblBhdGgiLCJlbGxpcHNlIiwiZmlsbFN0eWxlIiwiZmlsbCIsImNsb3NlUGF0aCIsInJlc3RvcmUiLCJtYXhCb3VuZHMiLCJpZHgiLCJpbmRleE9mIiwic3BsaWNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQWdCQTs7Ozs7O0FBMEJPLE1BQU1BO0FBQStCO0FBQUEsRUFBRztBQUMzQ0MsRUFBQUEsUUFBUSxFQUFFLEdBRGlDO0FBRTNDQyxFQUFBQSxPQUFPLEVBQUUsSUFGa0M7QUFHM0NDLEVBQUFBLFFBQVEsRUFBRTtBQUhpQyxDQUF4Qzs7QUFNUCxNQUFNQyxrQkFBa0IsR0FBRyxFQUEzQixDLENBQStCOztBQUVoQixNQUFNQztBQUFOO0FBQXdDO0FBR25EQyxFQUFB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S25DLE9BQUwsQ0FBYW9DLE9BQWIsQ0FBcUJyQixRQUFRLENBQUNDLENBQTlCLEVBQWlDRCxRQUFRLENBQUNJLENBQTFDLEVBQTZDYyxNQUE3QyxFQUFxREEsTUFBckQsRUFBNkQsQ0FBN0QsRUFBZ0UsQ0FBaEUsRUFBbUUsR0FBbkU7QUFDQSxXQUFLakMsT0FBTCxDQUFhcUMsU0FBYixHQUF5QixTQUF6QixDQWhCbUQsQ0FnQmY7O0FBQ3BDLFdBQUtyQyxPQUFMLENBQWFzQyxJQUFiO0FBQ0EsV0FBS3RDLE9BQUwsQ0FBYXVDLFNBQWI7QUFDQSxXQUFLdkMsT0FBTCxDQUFhd0MsT0FBYixHQW5CbUQsQ0FxQm5EOztBQUNBLFlBQU1DLFNBQVMsR0FBR1IsTUFBTSxHQUFHLENBQTNCLENBdEJtRCxDQXNCckI7O0FBQzlCLFVBQUlsQixRQUFRLENBQUNJLENBQVQsR0FBY1gsTUFBTSxHQUFHaUMsU0FBM0IsRUFBdUM7QUFDbkMsY0FBTUMsR0FBRyxHQUFHLEtBQUt4QyxTQUFMLENBQWV5QyxPQUFmLENBQXVCNUIsUUFBdkIsQ0FBWjtBQUNBLGFBQUtiLFNBQUwsQ0FBZTBDLE1BQWYsQ0FBc0JGLEdBQXRCLEVBQTJCLENBQTNCO0FBQ0g7QUFDSjtBQUNKOztBQWhHa0QiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuIENvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG4gVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gKi9cbmltcG9ydCBJQ2FudmFzRWZmZWN0IGZyb20gJy4uL0lDYW52YXNFZmZlY3QnO1xuaW1wb3J0IHsgYXJyYXlGYXN0Q2xvbmUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvYXJyYXlzXCI7XG5cbmV4cG9ydCB0eXBlIFNub3dmYWxsT3B0aW9ucyA9IHtcbiAgICAvKipcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc25vd2ZsYWtlcyB0byByZW5kZXIgYXQgYSBnaXZlbiB0aW1lXG4gICAgICovXG4gICAgbWF4Q291bnQ6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBUaGUgYW1vdW50IG9mIGdyYXZpdHkgdG8gYXBwbHkgdG8gdGhlIHNub3dmbGFrZXNcbiAgICAgKi9cbiAgICBncmF2aXR5OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogVGhlIGFtb3VudCBvZiBkcmlmdCAoaG9yaXpvbnRhbCBzd2F5KSB0byBhcHBseSB0byB0aGUgc25vd2ZsYWtlcy4gRWFjaCBzbm93Zmxha2UgdmFyaWVzLlxuICAgICAqL1xuICAgIG1heERyaWZ0OiBudW1iZXI7XG59XG5cbnR5cGUgU25vd2ZsYWtlID0ge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgeENvbDogbnVtYmVyO1xuICAgIGRpYW1ldGVyOiBudW1iZXI7XG4gICAgbWF4aW11bURyaWZ0OiBudW1iZXI7XG4gICAgZ3Jhdml0eTogbnVtYmVyO1xufVxuXG5leHBvcnQgY29uc3QgRGVmYXVsdE9wdGlvbnM6IFNub3dmYWxsT3B0aW9ucyA9IHtcbiAgICBtYXhDb3VudDogMjAwLFxuICAgIGdyYXZpdHk6IDAuMDUsXG4gICAgbWF4RHJpZnQ6IDUsXG59O1xuXG5jb25zdCBLRVlfRlJBTUVfSU5URVJWQUwgPSAxNTsgLy8gMTVtcywgcm91Z2hseVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbm93ZmFsbCBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogU25vd2ZhbGxPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7Li4uRGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnN9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBwYXJ0aWNsZXM6IEFycmF5PFNub3dmbGFrZT4gPSBbXTtcbiAgICBwcml2YXRlIGxhc3RBbmltYXRpb25UaW1lOiBudW1iZXI7XG5cbiAgICBwdWJsaWMgaXNSdW5uaW5nOiBib29sZWFuO1xuXG4gICAgcHVibGljIHN0YXJ0ID0gYXN5bmMgKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHRpbWVvdXQgPSAzMDAwKSA9PiB7XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5vcHRpb25zLm1heENvdW50O1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgY291bnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2godGhpcy5yZXNldFBhcnRpY2xlKHt9IGFzIFNub3dmbGFrZSwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJMb29wKTtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuc3RvcCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0UGFydGljbGUgPSAocGFydGljbGU6IFNub3dmbGFrZSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpOiBTbm93Zmxha2UgPT4ge1xuICAgICAgICBwYXJ0aWNsZS54ID0gTWF0aC5yYW5kb20oKSAqIHdpZHRoO1xuICAgICAgICBwYXJ0aWNsZS55ID0gTWF0aC5yYW5kb20oKSAqIC1oZWlnaHQ7XG4gICAgICAgIHBhcnRpY2xlLnhDb2wgPSBwYXJ0aWNsZS54O1xuICAgICAgICBwYXJ0aWNsZS5kaWFtZXRlciA9IChNYXRoLnJhbmRvbSgpICogNykgKyA0O1xuICAgICAgICBwYXJ0aWNsZS5tYXhpbXVtRHJpZnQgPSAoTWF0aC5yYW5kb20oKSAqIHRoaXMub3B0aW9ucy5tYXhEcmlmdCkgKyAzLjU7XG4gICAgICAgIHBhcnRpY2xlLmdyYXZpdHkgPSB0aGlzLm9wdGlvbnMuZ3Jhdml0eSArIChNYXRoLnJhbmRvbSgpICogNikgKyA0O1xuICAgICAgICByZXR1cm4gcGFydGljbGU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJMb29wID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdGltZURlbHRhID0gRGF0ZS5ub3coKSAtIHRoaXMubGFzdEFuaW1hdGlvblRpbWU7XG4gICAgICAgICAgICBpZiAodGltZURlbHRhID49IEtFWV9GUkFNRV9JTlRFUlZBTCB8fCAhdGhpcy5sYXN0QW5pbWF0aW9uVGltZSkge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHRoZSBzY3JlZW4gZmlyc3RcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY29udGV4dC5jYW52YXMud2lkdGgsIHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEFuaW1hdGlvblRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0ZUFuZFJlbmRlclNub3dmbGFrZXMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJlbmRlckxvb3ApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHByaXZhdGUgYW5pbWF0ZUFuZFJlbmRlclNub3dmbGFrZXMoKSB7XG4gICAgICAgIGlmICghdGhpcy5jb250ZXh0IHx8ICF0aGlzLmNvbnRleHQuY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGZvciAoY29uc3QgcGFydGljbGUgb2YgYXJyYXlGYXN0Q2xvbmUodGhpcy5wYXJ0aWNsZXMpKSB7XG4gICAgICAgICAgICBwYXJ0aWNsZS55ICs9IHBhcnRpY2xlLmdyYXZpdHk7XG5cbiAgICAgICAgICAgIC8vIFdlIHRyZWF0IHRoZSBkcmlmdCBhcyBhIHNpbmUgZnVuY3Rpb24gdG8gaGF2ZSBhIG1vcmUgZmx1aWQtbGlrZSBtb3ZlbWVudCBpbnN0ZWFkXG4gICAgICAgICAgICAvLyBvZiBhIHBvbmctbGlrZSBtb3ZlbWVudCBvZmYgd2FsbHMgb2YgdGhlIFggY29sdW1uLiBUaGlzIG1lYW5zIHRoYXQgZm9yXG4gICAgICAgICAgICAvLyAkeD1BXFxzaW4oXFxmcmFjezJcXHBpfXtQfXkpJCB3ZSB1c2UgdGhlIGBtYXhpbXVtRHJpZnRgIGFzIHRoZSBhbXBsaXR1ZGUgKEEpIGFuZCBhXG4gICAgICAgICAgICAvLyBsYXJnZSBtdWx0aXBsaWVyIHRvIGNyZWF0ZSBhIHZlcnkgbG9uZyB3YXZlZm9ybSB0aHJvdWdoIFAuXG4gICAgICAgICAgICBjb25zdCBwZWFrRGlzdGFuY2UgPSA3NSAqIHBhcnRpY2xlLm1heGltdW1EcmlmdDtcbiAgICAgICAgICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgcGFydGljbGUueCA9IHBhcnRpY2xlLm1heGltdW1EcmlmdCAqIE1hdGguc2luKChQSTIgLyBwZWFrRGlzdGFuY2UpICogcGFydGljbGUueSk7XG4gICAgICAgICAgICBwYXJ0aWNsZS54ICs9IHBhcnRpY2xlLnhDb2w7IC8vIGJyaW5nIHRoZSBwYXJ0aWNsZSB0byB0aGUgcmlnaHQgcGxhY2VcblxuICAgICAgICAgICAgY29uc3QgcmFkaXVzID0gcGFydGljbGUuZGlhbWV0ZXIgLyAyO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5lbGxpcHNlKHBhcnRpY2xlLngsIHBhcnRpY2xlLnksIHJhZGl1cywgcmFkaXVzLCAwLCAwLCAzNjApO1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmZpbGxTdHlsZSA9ICcjZWFlYWVhJzsgLy8gZ3JleSBzbyBpdCBzaG93cyB1cCBvbiB0aGUgbGlnaHQgdGhlbWVcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5maWxsKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRlYWQgc25vd2ZsYWtlc1xuICAgICAgICAgICAgY29uc3QgbWF4Qm91bmRzID0gcmFkaXVzICogNDsgLy8gbWFrZSBzdXJlIGl0J3MgKnJlYWxseSogb2ZmIHNjcmVlblxuICAgICAgICAgICAgaWYgKHBhcnRpY2xlLnkgPiAoaGVpZ2h0ICsgbWF4Qm91bmRzKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IHRoaXMucGFydGljbGVzLmluZGV4T2YocGFydGljbGUpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19