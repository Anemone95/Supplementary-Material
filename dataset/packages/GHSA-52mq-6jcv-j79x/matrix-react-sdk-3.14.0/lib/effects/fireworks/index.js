"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DefaultOptions = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty2.default)(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

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

/*:: export type FireworksOptions = {
    /**
     * max fireworks count
     *-/
    maxCount: number;
    /**
     * gravity value that firework adds to shift from it's start position
     *-/
    gravity: number;
}*/
const DefaultOptions
/*: FireworksOptions*/
= {
  maxCount: 500,
  gravity: 0.05
};
exports.DefaultOptions = DefaultOptions;

class Fireworks
/*:: implements ICanvasEffect*/
{
  constructor(options
  /*: { [key: string]: any }*/
  ) {
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "supportsAnimationFrame", window.requestAnimationFrame);
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "isRunning", void 0);
    (0, _defineProperty2.default)(this, "start", async (canvas
    /*: HTMLCanvasElement*/
    , timeout = 3000) => {
      if (!canvas) {
        return;
      }

      this.isRunning = true;
      this.context = canvas.getContext('2d');
      this.supportsAnimationFrame.call(window, this.updateWorld);

      if (timeout) {
        window.setTimeout(this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "updateWorld", () => {
      if (!this.isRunning && this.particles.length === 0) return;
      this.update();
      this.paint();
      this.supportsAnimationFrame.call(window, this.updateWorld);
    });
    (0, _defineProperty2.default)(this, "update", () => {
      if (this.particles.length < this.options.maxCount && this.isRunning) {
        this.createFirework();
      }

      const alive = [];

      for (let i = 0; i < this.particles.length; i++) {
        if (this.move(this.particles[i])) {
          alive.push(this.particles[i]);
        }
      }

      this.particles = alive;
    });
    (0, _defineProperty2.default)(this, "paint", () => {
      if (!this.context || !this.context.canvas) return;
      this.context.globalCompositeOperation = 'destination-out';
      this.context.fillStyle = "rgba(0,0,0,0.5)";
      this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      this.context.globalCompositeOperation = 'lighter';

      for (let i = 0; i < this.particles.length; i++) {
        this.drawParticle(this.particles[i]);
      }
    });
    (0, _defineProperty2.default)(this, "createFirework", () => {
      if (!this.context || !this.context.canvas) return;
      const width = this.context.canvas.width;
      const height = this.context.canvas.height;
      const xPoint = Math.random() * (width - 200) + 100;
      const yPoint = Math.random() * (height - 200) + 100;
      const nFire = Math.random() * 50 + 100;
      const color = "rgb(" + ~~(Math.random() * 200 + 55) + "," + ~~(Math.random() * 200 + 55) + "," + ~~(Math.random() * 200 + 55) + ")";

      for (let i = 0; i < nFire; i++) {
        const particle = {};
        particle.color = color;
        particle.w = particle.h = Math.random() * 4 + 1;
        particle.x = xPoint - particle.w / 2;
        particle.y = yPoint - particle.h / 2;
        particle.vx = (Math.random() - 0.5) * 10;
        particle.vy = (Math.random() - 0.5) * 10;
        particle.alpha = Math.random() * .5 + .5;
        const vy = Math.sqrt(25 - particle.vx * particle.vx);

        if (Math.abs(particle.vy) > vy) {
          particle.vy = particle.vy > 0 ? vy : -vy;
        }

        this.particles.push(particle);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "drawParticle", (particle
    /*: FireworksParticle*/
    ) =>
    /*: void*/
    {
      if (!this.context || !this.context.canvas) {
        return;
      }

      this.context.save();
      this.context.beginPath();
      this.context.translate(particle.x + particle.w / 2, particle.y + particle.h / 2);
      this.context.arc(0, 0, particle.w, 0, Math.PI * 2);
      this.context.fillStyle = particle.color;
      this.context.globalAlpha = particle.alpha;
      this.context.closePath();
      this.context.fill();
      this.context.restore();
    });
    (0, _defineProperty2.default)(this, "move", (particle
    /*: FireworksParticle*/
    ) => {
      particle.x += particle.vx;
      particle.vy += this.options.gravity;
      particle.y += particle.vy;
      particle.alpha -= 0.01;
      return !(particle.x <= -particle.w || particle.x >= screen.width || particle.y >= screen.height || particle.alpha <= 0);
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

}

exports.default = Fireworks;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lZmZlY3RzL2ZpcmV3b3Jrcy9pbmRleC50cyJdLCJuYW1lcyI6WyJEZWZhdWx0T3B0aW9ucyIsIm1heENvdW50IiwiZ3Jhdml0eSIsIkZpcmV3b3JrcyIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIndpbmRvdyIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImNhbnZhcyIsInRpbWVvdXQiLCJpc1J1bm5pbmciLCJjb250ZXh0IiwiZ2V0Q29udGV4dCIsInN1cHBvcnRzQW5pbWF0aW9uRnJhbWUiLCJjYWxsIiwidXBkYXRlV29ybGQiLCJzZXRUaW1lb3V0Iiwic3RvcCIsInBhcnRpY2xlcyIsImxlbmd0aCIsInVwZGF0ZSIsInBhaW50IiwiY3JlYXRlRmlyZXdvcmsiLCJhbGl2ZSIsImkiLCJtb3ZlIiwicHVzaCIsImdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiIsImZpbGxTdHlsZSIsImZpbGxSZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJkcmF3UGFydGljbGUiLCJ4UG9pbnQiLCJNYXRoIiwicmFuZG9tIiwieVBvaW50IiwibkZpcmUiLCJjb2xvciIsInBhcnRpY2xlIiwidyIsImgiLCJ4IiwieSIsInZ4IiwidnkiLCJhbHBoYSIsInNxcnQiLCJhYnMiLCJzYXZlIiwiYmVnaW5QYXRoIiwidHJhbnNsYXRlIiwiYXJjIiwiUEkiLCJnbG9iYWxBbHBoYSIsImNsb3NlUGF0aCIsImZpbGwiLCJyZXN0b3JlIiwic2NyZWVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBZ0RPLE1BQU1BO0FBQWdDO0FBQUEsRUFBRztBQUM1Q0MsRUFBQUEsUUFBUSxFQUFFLEdBRGtDO0FBRTVDQyxFQUFBQSxPQUFPLEVB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TCxDQUFheUMsR0FBYixDQUFpQixDQUFqQixFQUFvQixDQUFwQixFQUF1QmIsUUFBUSxDQUFDQyxDQUFoQyxFQUFtQyxDQUFuQyxFQUFzQ04sSUFBSSxDQUFDbUIsRUFBTCxHQUFVLENBQWhEO0FBQ0EsV0FBSzFDLE9BQUwsQ0FBYWlCLFNBQWIsR0FBeUJXLFFBQVEsQ0FBQ0QsS0FBbEM7QUFDQSxXQUFLM0IsT0FBTCxDQUFhMkMsV0FBYixHQUEyQmYsUUFBUSxDQUFDTyxLQUFwQztBQUVBLFdBQUtuQyxPQUFMLENBQWE0QyxTQUFiO0FBQ0EsV0FBSzVDLE9BQUwsQ0FBYTZDLElBQWI7QUFDQSxXQUFLN0MsT0FBTCxDQUFhOEMsT0FBYjtBQUNILEtBakc0QztBQUFBLGdEQW9HOUIsQ0FBQ2xCO0FBQUQ7QUFBQSxTQUFpQztBQUM1Q0EsTUFBQUEsUUFBUSxDQUFDRyxDQUFULElBQWNILFFBQVEsQ0FBQ0ssRUFBdkI7QUFDQUwsTUFBQUEsUUFBUSxDQUFDTSxFQUFULElBQWUsS0FBS3hDLE9BQUwsQ0FBYUgsT0FBNUI7QUFDQXFDLE1BQUFBLFFBQVEsQ0FBQ0ksQ0FBVCxJQUFjSixRQUFRLENBQUNNLEVBQXZCO0FBQ0FOLE1BQUFBLFFBQVEsQ0FBQ08sS0FBVCxJQUFrQixJQUFsQjtBQUNBLGFBQU8sRUFBRVAsUUFBUSxDQUFDRyxDQUFULElBQWMsQ0FBQ0gsUUFBUSxDQUFDQyxDQUF4QixJQUE2QkQsUUFBUSxDQUFDRyxDQUFULElBQWNnQixNQUFNLENBQUM1QixLQUFsRCxJQUNMUyxRQUFRLENBQUNJLENBQVQsSUFBY2UsTUFBTSxDQUFDM0IsTUFEaEIsSUFFTFEsUUFBUSxDQUFDTyxLQUFULElBQWtCLENBRmYsQ0FBUDtBQUdILEtBNUc0QztBQUN6QyxTQUFLekMsT0FBTCxtQ0FBbUJMLGNBQW5CLEdBQXNDSyxPQUF0QztBQUNIOztBQUxtRCIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gQ29weXJpZ2h0IDIwMjAgTnVyamluIEphZmFyXG4gQ29weXJpZ2h0IDIwMjAgTm9yZGVjayBJVCArIENvbnN1bHRpbmcgR21iSC5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgSUNhbnZhc0VmZmVjdCBmcm9tICcuLi9JQ2FudmFzRWZmZWN0JztcblxuZXhwb3J0IHR5cGUgRmlyZXdvcmtzT3B0aW9ucyA9IHtcbiAgICAvKipcbiAgICAgKiBtYXggZmlyZXdvcmtzIGNvdW50XG4gICAgICovXG4gICAgbWF4Q291bnQ6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBncmF2aXR5IHZhbHVlIHRoYXQgZmlyZXdvcmsgYWRkcyB0byBzaGlmdCBmcm9tIGl0J3Mgc3RhcnQgcG9zaXRpb25cbiAgICAgKi9cbiAgICBncmF2aXR5OiBudW1iZXI7XG59XG5cbnR5cGUgRmlyZXdvcmtzUGFydGljbGUgPSB7XG4gICAgLyoqXG4gICAgICogY29sb3JcbiAgICAgKi9cbiAgICBjb2xvcjogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIHgseSBhcmUgdGhlIHBvaW50IHdoZXJlIHRoZSBwYXJ0aWNsZSBzdGFydHMgdG8gcG9zaXRpb24gb24gY2FudmFzXG4gICAgICovXG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiB2eCx2eSBzaGlmdCB2YWx1ZXMgZnJvbSB4IGFuZCB5XG4gICAgICovXG4gICAgdng6IG51bWJlcjtcbiAgICB2eTogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIHRoZSBhbHBoYSBvcGFjaXR5IG9mIHRoZSBmaXJld29yayBwYXJ0aWNsZSAoYmV0d2VlbiAwIGFuZCAxLCB3aGVyZSAxIGlzIG9wYXF1ZSBhbmQgMCBpcyBpbnZpc2libGUpXG4gICAgICovXG4gICAgYWxwaGE6IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiB3LGggd2lkdGggYW5kIGhlaWdodFxuICAgICAqL1xuICAgIHc6IG51bWJlcjtcbiAgICBoOiBudW1iZXI7XG59XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0T3B0aW9uczogRmlyZXdvcmtzT3B0aW9ucyA9IHtcbiAgICBtYXhDb3VudDogNTAwLFxuICAgIGdyYXZpdHk6IDAuMDUsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaXJld29ya3MgaW1wbGVtZW50cyBJQ2FudmFzRWZmZWN0IHtcbiAgICBwcml2YXRlIHJlYWRvbmx5IG9wdGlvbnM6IEZpcmV3b3Jrc09wdGlvbnM7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7IFtrZXk6IHN0cmluZ106IGFueSB9KSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHsuLi5EZWZhdWx0T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb250ZXh0OiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHN1cHBvcnRzQW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHByaXZhdGUgcGFydGljbGVzOiBBcnJheTxGaXJld29ya3NQYXJ0aWNsZT4gPSBbXTtcbiAgICBwdWJsaWMgaXNSdW5uaW5nOiBib29sZWFuO1xuXG4gICAgcHVibGljIHN0YXJ0ID0gYXN5bmMgKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHRpbWVvdXQgPSAzMDAwKSA9PiB7XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgdGhpcy5zdXBwb3J0c0FuaW1hdGlvbkZyYW1lLmNhbGwod2luZG93LCB0aGlzLnVwZGF0ZVdvcmxkKTtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuc3RvcCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVdvcmxkID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nICYmIHRoaXMucGFydGljbGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB0aGlzLnBhaW50KCk7XG4gICAgICAgIHRoaXMuc3VwcG9ydHNBbmltYXRpb25GcmFtZS5jYWxsKHdpbmRvdywgdGhpcy51cGRhdGVXb3JsZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB1cGRhdGUgPSAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPCB0aGlzLm9wdGlvbnMubWF4Q291bnQgJiYgdGhpcy5pc1J1bm5pbmcpIHtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRmlyZXdvcmsoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhbGl2ZSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdmUodGhpcy5wYXJ0aWNsZXNbaV0pKSB7XG4gICAgICAgICAgICAgICAgYWxpdmUucHVzaCh0aGlzLnBhcnRpY2xlc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wYXJ0aWNsZXMgPSBhbGl2ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHBhaW50ID0gKCkgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykgcmV0dXJuO1xuICAgICAgICB0aGlzLmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2Rlc3RpbmF0aW9uLW91dCc7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC41KVwiO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB0aGlzLmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uID0gJ2xpZ2h0ZXInO1xuICAgICAgICBmb3IgKGxldCBpPTA7IGk8dGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuZHJhd1BhcnRpY2xlKHRoaXMucGFydGljbGVzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlRmlyZXdvcmsgPSAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5jb250ZXh0IHx8ICF0aGlzLmNvbnRleHQuY2FudmFzKSByZXR1cm47XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IHhQb2ludCA9IE1hdGgucmFuZG9tKCkgKiAod2lkdGggLSAyMDApICsgMTAwO1xuICAgICAgICBjb25zdCB5UG9pbnQgPSBNYXRoLnJhbmRvbSgpICogKGhlaWdodCAtIDIwMCkgKyAxMDA7XG4gICAgICAgIGNvbnN0IG5GaXJlID0gTWF0aC5yYW5kb20oKSAqIDUwICsgMTAwO1xuICAgICAgICBjb25zdCBjb2xvciA9IFwicmdiKFwiKyh+fihNYXRoLnJhbmRvbSgpKjIwMCs1NSkpK1wiLFwiXG4gICAgICAgICAgICArKH5+KE1hdGgucmFuZG9tKCkqMjAwKzU1KSkrXCIsXCIrKH5+KE1hdGgucmFuZG9tKCkqMjAwKzU1KSkrXCIpXCI7XG4gICAgICAgIGZvciAobGV0IGk9MDsgaTxuRmlyZTsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBwYXJ0aWNsZSA9IDxGaXJld29ya3NQYXJ0aWNsZT57fTtcbiAgICAgICAgICAgIHBhcnRpY2xlLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgICBwYXJ0aWNsZS53ID0gcGFydGljbGUuaCA9IE1hdGgucmFuZG9tKCkgKiA0ICsgMTtcbiAgICAgICAgICAgIHBhcnRpY2xlLnggPSB4UG9pbnQgLSBwYXJ0aWNsZS53IC8gMjtcbiAgICAgICAgICAgIHBhcnRpY2xlLnkgPSB5UG9pbnQgLSBwYXJ0aWNsZS5oIC8gMjtcbiAgICAgICAgICAgIHBhcnRpY2xlLnZ4ID0gKE1hdGgucmFuZG9tKCktMC41KSoxMDtcbiAgICAgICAgICAgIHBhcnRpY2xlLnZ5ID0gKE1hdGgucmFuZG9tKCktMC41KSoxMDtcbiAgICAgICAgICAgIHBhcnRpY2xlLmFscGhhID0gTWF0aC5yYW5kb20oKSouNSsuNTtcbiAgICAgICAgICAgIGNvbnN0IHZ5ID0gTWF0aC5zcXJ0KDI1IC0gcGFydGljbGUudnggKiBwYXJ0aWNsZS52eCk7XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnMocGFydGljbGUudnkpID4gdnkpIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS52eSA9IHBhcnRpY2xlLnZ5ID4gMCA/IHZ5OiAtdnk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBhcnRpY2xlcy5wdXNoKHBhcnRpY2xlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzdG9wID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHByaXZhdGUgZHJhd1BhcnRpY2xlID0gKHBhcnRpY2xlOiBGaXJld29ya3NQYXJ0aWNsZSk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29udGV4dC5zYXZlKCk7XG4gICAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcblxuICAgICAgICB0aGlzLmNvbnRleHQudHJhbnNsYXRlKHBhcnRpY2xlLnggKyBwYXJ0aWNsZS53IC8gMiwgcGFydGljbGUueSArIHBhcnRpY2xlLmggLyAyKTtcbiAgICAgICAgdGhpcy5jb250ZXh0LmFyYygwLCAwLCBwYXJ0aWNsZS53LCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIHRoaXMuY29udGV4dC5maWxsU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgdGhpcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gcGFydGljbGUuYWxwaGE7XG5cbiAgICAgICAgdGhpcy5jb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICB0aGlzLmNvbnRleHQuZmlsbCgpO1xuICAgICAgICB0aGlzLmNvbnRleHQucmVzdG9yZSgpO1xuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBtb3ZlID0gKHBhcnRpY2xlOiBGaXJld29ya3NQYXJ0aWNsZSkgPT4ge1xuICAgICAgICBwYXJ0aWNsZS54ICs9IHBhcnRpY2xlLnZ4O1xuICAgICAgICBwYXJ0aWNsZS52eSArPSB0aGlzLm9wdGlvbnMuZ3Jhdml0eTtcbiAgICAgICAgcGFydGljbGUueSArPSBwYXJ0aWNsZS52eTtcbiAgICAgICAgcGFydGljbGUuYWxwaGEgLT0gMC4wMTtcbiAgICAgICAgcmV0dXJuICEocGFydGljbGUueCA8PSAtcGFydGljbGUudyB8fCBwYXJ0aWNsZS54ID49IHNjcmVlbi53aWR0aCB8fFxuICAgICAgICAgICAgcGFydGljbGUueSA+PSBzY3JlZW4uaGVpZ2h0IHx8XG4gICAgICAgICAgICBwYXJ0aWNsZS5hbHBoYSA8PSAwKTtcbiAgICB9XG59XG4iXX0=