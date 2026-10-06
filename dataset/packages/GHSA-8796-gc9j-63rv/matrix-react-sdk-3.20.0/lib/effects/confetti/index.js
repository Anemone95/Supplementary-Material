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

/*:: export type ConfettiOptions = {
    /**
     * max confetti count
     *-/
    maxCount: number,
    /**
     * particle animation speed
     *-/
    speed: number,
    /**
     * the confetti animation frame interval in milliseconds
     *-/
    frameInterval: number,
    /**
     * the alpha opacity of the confetti (between 0 and 1, where 1 is opaque and 0 is invisible)
     *-/
    alpha: number,
    /**
     * use gradient instead of solid particle color
     *-/
    gradient: boolean,
}*/
const DefaultOptions
/*: ConfettiOptions*/
= {
  maxCount: 150,
  speed: 3,
  frameInterval: 15,
  alpha: 1.0,
  gradient: false
};
exports.DefaultOptions = DefaultOptions;

class Confetti
/*:: implements ICanvasEffect*/
{
  constructor(options
  /*: { [key: string]: any }*/
  ) {
    (0, _defineProperty2.default)(this, "options", void 0);
    (0, _defineProperty2.default)(this, "context", null);
    (0, _defineProperty2.default)(this, "supportsAnimationFrame", window.requestAnimationFrame);
    (0, _defineProperty2.default)(this, "colors", ['rgba(30,144,255,', 'rgba(107,142,35,', 'rgba(255,215,0,', 'rgba(255,192,203,', 'rgba(106,90,205,', 'rgba(173,216,230,', 'rgba(238,130,238,', 'rgba(152,251,152,', 'rgba(70,130,180,', 'rgba(244,164,96,', 'rgba(210,105,30,', 'rgba(220,20,60,']);
    (0, _defineProperty2.default)(this, "lastFrameTime", Date.now());
    (0, _defineProperty2.default)(this, "particles", []);
    (0, _defineProperty2.default)(this, "waveAngle", 0);
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
      this.runAnimation();

      if (timeout) {
        window.setTimeout(this.stop, timeout);
      }
    });
    (0, _defineProperty2.default)(this, "stop", async () => {
      this.isRunning = false;
    });
    (0, _defineProperty2.default)(this, "resetParticle", (particle
    /*: ConfettiParticle*/
    , width
    /*: number*/
    , height
    /*: number*/
    ) =>
    /*: ConfettiParticle*/
    {
      particle.color = this.colors[Math.random() * this.colors.length | 0] + (this.options.alpha + ')');

      if (this.options.gradient) {
        particle.color2 = this.colors[Math.random() * this.colors.length | 0] + (this.options.alpha + ')');
      } else {
        particle.color2 = particle.color;
      }

      particle.x = Math.random() * width;
      particle.y = Math.random() * -height;
      particle.diameter = Math.random() * 10 + 5;
      particle.tilt = Math.random() * -10;
      particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
      particle.tiltAngle = Math.random() * Math.PI;
      return particle;
    });
    (0, _defineProperty2.default)(this, "runAnimation", () =>
    /*: void*/
    {
      if (!this.context || !this.context.canvas) {
        return;
      }

      if (this.particles.length === 0) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
      } else {
        const now = Date.now();
        const delta = now - this.lastFrameTime;

        if (!this.supportsAnimationFrame || delta > this.options.frameInterval) {
          this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
          this.updateParticles();
          this.drawParticles(this.context);
          this.lastFrameTime = now - delta % this.options.frameInterval;
        }

        requestAnimationFrame(this.runAnimation);
      }
    });
    (0, _defineProperty2.default)(this, "drawParticles", (context
    /*: CanvasRenderingContext2D*/
    ) =>
    /*: void*/
    {
      if (!this.context || !this.context.canvas) {
        return;
      }

      let x;
      let x2;
      let y2;

      for (const particle of this.particles) {
        this.context.beginPath();
        context.lineWidth = particle.diameter;
        x2 = particle.x + particle.tilt;
        x = x2 + particle.diameter / 2;
        y2 = particle.y + particle.tilt + particle.diameter / 2;

        if (this.options.gradient) {
          const gradient = context.createLinearGradient(x, particle.y, x2, y2);
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(1.0, particle.color2);
          context.strokeStyle = gradient;
        } else {
          context.strokeStyle = particle.color;
        }

        context.moveTo(x, particle.y);
        context.lineTo(x2, y2);
        context.stroke();
      }
    });
    (0, _defineProperty2.default)(this, "updateParticles", () => {
      if (!this.context || !this.context.canvas) {
        return;
      }

      const width = this.context.canvas.width;
      const height = this.context.canvas.height;
      let particle
      /*: ConfettiParticle*/
      ;
      this.waveAngle += 0.01;

      for (let i = 0; i < this.particles.length; i++) {
        particle = this.particles[i];

        if (!this.isRunning && particle.y < -15) {
          particle.y = height + 100;
        } else {
          particle.tiltAngle += particle.tiltAngleIncrement;
          particle.x += Math.sin(this.waveAngle) - 0.5;
          particle.y += (Math.cos(this.waveAngle) + particle.diameter + this.options.speed) * 0.5;
          particle.tilt = Math.sin(particle.tiltAngle) * 15;
        }

        if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
          if (this.isRunning && this.particles.length <= this.options.maxCount) {
            this.resetParticle(particle, width, height);
          } else {
            this.particles.splice(i, 1);
            i--;
          }
        }
      }
    });
    this.options = _objectSpread(_objectSpread({}, DefaultOptions), options);
  }

}

exports.default = Confetti;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9lZmZlY3RzL2NvbmZldHRpL2luZGV4LnRzIl0sIm5hbWVzIjpbIkRlZmF1bHRPcHRpb25zIiwibWF4Q291bnQiLCJzcGVlZCIsImZyYW1lSW50ZXJ2YWwiLCJhbHBoYSIsImdyYWRpZW50IiwiQ29uZmV0dGkiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJ3aW5kb3ciLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJEYXRlIiwibm93IiwiY2FudmFzIiwidGltZW91dCIsImNvbnRleHQiLCJnZXRDb250ZXh0IiwicGFydGljbGVzIiwiY291bnQiLCJsZW5ndGgiLCJwdXNoIiwicmVzZXRQYXJ0aWNsZSIsIndpZHRoIiwiaGVpZ2h0IiwiaXNSdW5uaW5nIiwicnVuQW5pbWF0aW9uIiwic2V0VGltZW91dCIsInN0b3AiLCJwYXJ0aWNsZSIsImNvbG9yIiwiY29sb3JzIiwiTWF0aCIsInJhbmRvbSIsImNvbG9yMiIsIngiLCJ5IiwiZGlhbWV0ZXIiLCJ0aWx0IiwidGlsdEFuZ2xlSW5jcmVtZW50IiwidGlsdEFuZ2xlIiwiUEkiLCJjbGVhclJlY3QiLCJkZWx0YSIsImxhc3RGcmFtZVRpbWUiLCJzdXBwb3J0c0FuaW1hdGlvbkZyYW1lIiwidXBkYXRlUGFydGljbGVzIiwiZHJhd1BhcnRpY2xlcyIsIngyIiwieTIiLCJiZWdpblBhdGgiLCJsaW5lV2lkdGgiLCJjcmVhdGVMaW5lYXJHcmFkaWVudCIsImFkZENvbG9yU3RvcCIsInN0cm9rZVN0eWxlIiwibW92ZVRvIiwibGluZVRvIiwic3Ryb2tlIiwid2F2ZUFuZ2xlIiwiaSIsInNpbiIsImNvcyIsInNwbGljZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQWZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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IjpbIi8qXG4gQ29weXJpZ2h0IDIwMjAgTnVyamluIEphZmFyXG4gQ29weXJpZ2h0IDIwMjAgTm9yZGVjayBJVCArIENvbnN1bHRpbmcgR21iSC5cblxuIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cbiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IElDYW52YXNFZmZlY3QgZnJvbSAnLi4vSUNhbnZhc0VmZmVjdCc7XG5cbmV4cG9ydCB0eXBlIENvbmZldHRpT3B0aW9ucyA9IHtcbiAgICAvKipcbiAgICAgKiBtYXggY29uZmV0dGkgY291bnRcbiAgICAgKi9cbiAgICBtYXhDb3VudDogbnVtYmVyLFxuICAgIC8qKlxuICAgICAqIHBhcnRpY2xlIGFuaW1hdGlvbiBzcGVlZFxuICAgICAqL1xuICAgIHNwZWVkOiBudW1iZXIsXG4gICAgLyoqXG4gICAgICogdGhlIGNvbmZldHRpIGFuaW1hdGlvbiBmcmFtZSBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHNcbiAgICAgKi9cbiAgICBmcmFtZUludGVydmFsOiBudW1iZXIsXG4gICAgLyoqXG4gICAgICogdGhlIGFscGhhIG9wYWNpdHkgb2YgdGhlIGNvbmZldHRpIChiZXR3ZWVuIDAgYW5kIDEsIHdoZXJlIDEgaXMgb3BhcXVlIGFuZCAwIGlzIGludmlzaWJsZSlcbiAgICAgKi9cbiAgICBhbHBoYTogbnVtYmVyLFxuICAgIC8qKlxuICAgICAqIHVzZSBncmFkaWVudCBpbnN0ZWFkIG9mIHNvbGlkIHBhcnRpY2xlIGNvbG9yXG4gICAgICovXG4gICAgZ3JhZGllbnQ6IGJvb2xlYW4sXG59XG5cbnR5cGUgQ29uZmV0dGlQYXJ0aWNsZSA9IHtcbiAgICBjb2xvcjogc3RyaW5nLFxuICAgIGNvbG9yMjogc3RyaW5nLFxuICAgIHg6IG51bWJlcixcbiAgICB5OiBudW1iZXIsXG4gICAgZGlhbWV0ZXI6IG51bWJlcixcbiAgICB0aWx0OiBudW1iZXIsXG4gICAgdGlsdEFuZ2xlSW5jcmVtZW50OiBudW1iZXIsXG4gICAgdGlsdEFuZ2xlOiBudW1iZXIsXG59XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0T3B0aW9uczogQ29uZmV0dGlPcHRpb25zID0ge1xuICAgIG1heENvdW50OiAxNTAsXG4gICAgc3BlZWQ6IDMsXG4gICAgZnJhbWVJbnRlcnZhbDogMTUsXG4gICAgYWxwaGE6IDEuMCxcbiAgICBncmFkaWVudDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb25mZXR0aSBpbXBsZW1lbnRzIElDYW52YXNFZmZlY3Qge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogQ29uZmV0dGlPcHRpb25zO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSkge1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7Li4uRGVmYXVsdE9wdGlvbnMsIC4uLm9wdGlvbnN9O1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzdXBwb3J0c0FuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICBwcml2YXRlIGNvbG9ycyA9IFsncmdiYSgzMCwxNDQsMjU1LCcsICdyZ2JhKDEwNywxNDIsMzUsJywgJ3JnYmEoMjU1LDIxNSwwLCcsXG4gICAgICAgICdyZ2JhKDI1NSwxOTIsMjAzLCcsICdyZ2JhKDEwNiw5MCwyMDUsJywgJ3JnYmEoMTczLDIxNiwyMzAsJyxcbiAgICAgICAgJ3JnYmEoMjM4LDEzMCwyMzgsJywgJ3JnYmEoMTUyLDI1MSwxNTIsJywgJ3JnYmEoNzAsMTMwLDE4MCwnLFxuICAgICAgICAncmdiYSgyNDQsMTY0LDk2LCcsICdyZ2JhKDIxMCwxMDUsMzAsJywgJ3JnYmEoMjIwLDIwLDYwLCddO1xuXG4gICAgcHJpdmF0ZSBsYXN0RnJhbWVUaW1lID0gRGF0ZS5ub3coKTtcbiAgICBwcml2YXRlIHBhcnRpY2xlczogQXJyYXk8Q29uZmV0dGlQYXJ0aWNsZT4gPSBbXTtcbiAgICBwcml2YXRlIHdhdmVBbmdsZSA9IDA7XG5cbiAgICBwdWJsaWMgaXNSdW5uaW5nOiBib29sZWFuO1xuXG4gICAgcHVibGljIHN0YXJ0ID0gYXN5bmMgKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsIHRpbWVvdXQgPSAzMDAwKSA9PiB7XG4gICAgICAgIGlmICghY2FudmFzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIHRoaXMucGFydGljbGVzID0gW107XG4gICAgICAgIGNvbnN0IGNvdW50ID0gdGhpcy5vcHRpb25zLm1heENvdW50O1xuICAgICAgICB3aGlsZSAodGhpcy5wYXJ0aWNsZXMubGVuZ3RoIDwgY291bnQpIHtcbiAgICAgICAgICAgIHRoaXMucGFydGljbGVzLnB1c2godGhpcy5yZXNldFBhcnRpY2xlKHt9IGFzIENvbmZldHRpUGFydGljbGUsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ydW5BbmltYXRpb24oKTtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KHRoaXMuc3RvcCwgdGltZW91dCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc3RvcCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlc2V0UGFydGljbGUgPSAocGFydGljbGU6IENvbmZldHRpUGFydGljbGUsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogQ29uZmV0dGlQYXJ0aWNsZSA9PiB7XG4gICAgICAgIHBhcnRpY2xlLmNvbG9yID0gdGhpcy5jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLmNvbG9ycy5sZW5ndGgpIHwgMF0gKyAodGhpcy5vcHRpb25zLmFscGhhICsgJyknKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgICAgICAgcGFydGljbGUuY29sb3IyID0gdGhpcy5jb2xvcnNbKE1hdGgucmFuZG9tKCkgKiB0aGlzLmNvbG9ycy5sZW5ndGgpIHwgMF0gKyAodGhpcy5vcHRpb25zLmFscGhhICsgJyknKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcnRpY2xlLmNvbG9yMiA9IHBhcnRpY2xlLmNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIHBhcnRpY2xlLnggPSBNYXRoLnJhbmRvbSgpICogd2lkdGg7XG4gICAgICAgIHBhcnRpY2xlLnkgPSBNYXRoLnJhbmRvbSgpICogLWhlaWdodDtcbiAgICAgICAgcGFydGljbGUuZGlhbWV0ZXIgPSBNYXRoLnJhbmRvbSgpICogMTAgKyA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5yYW5kb20oKSAqIC0xMDtcbiAgICAgICAgcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50ID0gTWF0aC5yYW5kb20oKSAqIDAuMDcgKyAwLjA1O1xuICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgPSBNYXRoLnJhbmRvbSgpICogTWF0aC5QSTtcbiAgICAgICAgcmV0dXJuIHBhcnRpY2xlO1xuICAgIH1cblxuICAgIHByaXZhdGUgcnVuQW5pbWF0aW9uID0gKCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBhcnRpY2xlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgbm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gbm93IC0gdGhpcy5sYXN0RnJhbWVUaW1lO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRzQW5pbWF0aW9uRnJhbWUgfHwgZGVsdGEgPiB0aGlzLm9wdGlvbnMuZnJhbWVJbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdGhpcy5jb250ZXh0LmNhbnZhcy53aWR0aCwgdGhpcy5jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUGFydGljbGVzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3UGFydGljbGVzKHRoaXMuY29udGV4dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0RnJhbWVUaW1lID0gbm93IC0gKGRlbHRhICUgdGhpcy5vcHRpb25zLmZyYW1lSW50ZXJ2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucnVuQW5pbWF0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHJpdmF0ZSBkcmF3UGFydGljbGVzID0gKGNvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuY29udGV4dCB8fCAhdGhpcy5jb250ZXh0LmNhbnZhcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGxldCB4OyBsZXQgeDI7IGxldCB5MjtcbiAgICAgICAgZm9yIChjb25zdCBwYXJ0aWNsZSBvZiB0aGlzLnBhcnRpY2xlcykge1xuICAgICAgICAgICAgdGhpcy5jb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lV2lkdGggPSBwYXJ0aWNsZS5kaWFtZXRlcjtcbiAgICAgICAgICAgIHgyID0gcGFydGljbGUueCArIHBhcnRpY2xlLnRpbHQ7XG4gICAgICAgICAgICB4ID0geDIgKyBwYXJ0aWNsZS5kaWFtZXRlciAvIDI7XG4gICAgICAgICAgICB5MiA9IHBhcnRpY2xlLnkgKyBwYXJ0aWNsZS50aWx0ICsgcGFydGljbGUuZGlhbWV0ZXIgLyAyO1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5ncmFkaWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCh4LCBwYXJ0aWNsZS55LCB4MiwgeTIpO1xuICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCBwYXJ0aWNsZS5jb2xvcik7XG4gICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEuMCwgcGFydGljbGUuY29sb3IyKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBwYXJ0aWNsZS5jb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHgsIHBhcnRpY2xlLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8oeDIsIHkyKTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHVwZGF0ZVBhcnRpY2xlcyA9ICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLmNvbnRleHQgfHwgIXRoaXMuY29udGV4dC5jYW52YXMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMuY29udGV4dC5jYW52YXMud2lkdGg7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuY29udGV4dC5jYW52YXMuaGVpZ2h0O1xuICAgICAgICBsZXQgcGFydGljbGU6IENvbmZldHRpUGFydGljbGU7XG4gICAgICAgIHRoaXMud2F2ZUFuZ2xlICs9IDAuMDE7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5wYXJ0aWNsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBhcnRpY2xlID0gdGhpcy5wYXJ0aWNsZXNbaV07XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNSdW5uaW5nICYmIHBhcnRpY2xlLnkgPCAtMTUpIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS55ID0gaGVpZ2h0ICsgMTAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0QW5nbGUgKz0gcGFydGljbGUudGlsdEFuZ2xlSW5jcmVtZW50O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnggKz0gTWF0aC5zaW4odGhpcy53YXZlQW5nbGUpIC0gMC41O1xuICAgICAgICAgICAgICAgIHBhcnRpY2xlLnkgKz0gKE1hdGguY29zKHRoaXMud2F2ZUFuZ2xlKSArIHBhcnRpY2xlLmRpYW1ldGVyICsgdGhpcy5vcHRpb25zLnNwZWVkKSAqIDAuNTtcbiAgICAgICAgICAgICAgICBwYXJ0aWNsZS50aWx0ID0gTWF0aC5zaW4ocGFydGljbGUudGlsdEFuZ2xlKSAqIDE1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcnRpY2xlLnggPiB3aWR0aCArIDIwIHx8IHBhcnRpY2xlLnggPCAtMjAgfHwgcGFydGljbGUueSA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzUnVubmluZyAmJiB0aGlzLnBhcnRpY2xlcy5sZW5ndGggPD0gdGhpcy5vcHRpb25zLm1heENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzZXRQYXJ0aWNsZShwYXJ0aWNsZSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19