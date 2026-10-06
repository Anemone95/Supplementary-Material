"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sleep = sleep;
exports.timeout = timeout;
exports.defer = defer;
exports.allSettled = allSettled;
exports.retry = retry;

/*
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
// Returns a promise which resolves with a given value after the given number of ms
function sleep
/*:: <T>*/
(ms
/*: number*/
, value
/*: T*/
)
/*: Promise<T>*/
{
  return new Promise(resolve => {
    setTimeout(resolve, ms, value);
  });
} // Returns a promise which resolves when the input promise resolves with its value
// or when the timeout of ms is reached with the value of given timeoutValue


async function timeout
/*:: <T>*/
(promise
/*: Promise<T>*/
, timeoutValue
/*: T*/
, ms
/*: number*/
)
/*: Promise<T>*/
{
  const timeoutPromise = new Promise(resolve => {
    const timeoutId = setTimeout(resolve, ms, timeoutValue);
    promise.then(() => {
      clearTimeout(timeoutId);
    });
  });
  return Promise.race([promise, timeoutPromise]);
}
/*:: export interface IDeferred<T> {
    resolve: (value: T) => void;
    reject: (any) => void;
    promise: Promise<T>;
}*/


// Returns a Deferred
function defer
/*:: <T>*/
()
/*: IDeferred<T>*/
{
  let resolve;
  let reject;
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {
    resolve,
    reject,
    promise
  };
} // Promise.allSettled polyfill until browser support is stable in Firefox


function allSettled
/*:: <T>*/
(promises
/*: Promise<T>[]*/
)
/*: Promise<Array<ISettledFulfilled<T> | ISettledRejected>>*/
{
  if (Promise.allSettled) {
    return Promise.allSettled(promises);
  } // @ts-ignore - typescript isn't smart enough to see the disjoint here


  return Promise.all(promises.map(promise => {
    return promise.then(value => ({
      status: "fulfilled",
      value
    })).catch(reason => ({
      status: "rejected",
      reason
    }));
  }));
} // Helper method to retry a Promise a given number of times or until a predicate fails


async function retry
/*:: <T, E extends Error>*/
(fn
/*: () => Promise<T>*/
, num
/*: number*/
, predicate
/*: (e: E) => boolean*/
) {
  let lastErr
  /*: E*/
  ;

  for (let i = 0; i < num; i++) {
    try {
      const v = await fn(); // If `await fn()` throws then we won't reach here

      return v;
    } catch (err) {
      if (predicate && !predicate(err)) {
        throw err;
      }

      lastErr = err;
    }
  }

  throw lastErr;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9wcm9taXNlLnRzIl0sIm5hbWVzIjpbInNsZWVwIiwibXMiLCJ2YWx1ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwic2V0VGltZW91dCIsInRpbWVvdXQiLCJwcm9taXNlIiwidGltZW91dFZhbHVlIiwidGltZW91dFByb21pc2UiLCJ0aW1lb3V0SWQiLCJ0aGVuIiwiY2xlYXJUaW1lb3V0IiwicmFjZSIsImRlZmVyIiwicmVqZWN0IiwiX3Jlc29sdmUiLCJfcmVqZWN0IiwiYWxsU2V0dGxlZCIsInByb21pc2VzIiwiYWxsIiwibWFwIiwic3RhdHVzIiwiY2F0Y2giLCJyZWFzb24iLCJyZXRyeSIsImZuIiwibnVtIiwicHJlZGljYXRlIiwibGFzdEVyciIsImkiLCJ2IiwiZXJyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ08sU0FBU0E7QUFBVDtBQUFBLENBQWtCQztBQUFsQjtBQUFBLEVBQThCQztBQUE5QjtBQUFBO0FBQUE7QUFBcUQ7QUFDeEQsU0FBTyxJQUFJQyxPQUFKLENBQWFDLE9BQU8sSUFBSTtBQUFFQyxJQUFBQSxVQUFVLENBQUNELE9BQUQsRUFBVUgsRUFBVixFQUFjQyxLQUFkLENBQVY7QUFBaUMsR0FBM0QsQ0FBUDtBQUNILEMsQ0FFRDtBQUNBOzs7QUFDTyxlQUFlSTtBQUFmO0FBQUEsQ0FBMEJDO0FBQTFCO0FBQUEsRUFBK0NDO0FBQS9DO0FBQUEsRUFBZ0VQO0FBQWhFO0FBQUE7QUFBQTtBQUF3RjtBQUMzRixRQUFNUSxjQUFjLEdBQUcsSUFBSU4sT0FBSixDQUFnQkMsT0FBRCxJQUFhO0FBQy9DLFVBQU1NLFNBQVMsR0FBR0wsVUFBVSxDQUFDRCxPQUFELEVBQVVILEVBQVYsRUFBY08sWUFBZCxDQUE1QjtBQUNBRCxJQUFBQSxPQUFPLENBQUNJLElBQVIsQ0FBYSxNQUFNO0FBQ2ZDLE1BQUFBLFlBQVksQ0FBQ0YsU0FBRCxDQUFaO0FBQ0gsS0FGRDtBQUdILEdBTHNCLENBQXZCO0FBT0EsU0FBT1AsT0FBTyxDQUFDVSxJQUFSLENBQWEsQ0FBQ04sT0FBRCxFQUFVRSxjQUFWLENBQWIsQ0FBUDtBQUNIOztBQWhDRDtBQUNBO0FBQ0E7QUFDQTs7O0FBcUNBO0FBQ08sU0FBU0s7QUFBVDtBQUFBO0FBQUE7QUFBa0M7QUFDckMsTUFBSVYsT0FBSjtBQUNBLE1BQUlXLE1BQUo7QUFFQSxRQUFNUixPQUFPLEdBQUcsSUFBSUosT0FBSixDQUFlLENBQUNhLFFBQUQsRUFBV0MsT0FBWCxLQUF1QjtBQUNsRGIsSUFBQUEsT0FBTyxHQUFHWSxRQUFWO0FBQ0FELElBQUFBLE1BQU0sR0FBR0UsT0FBVDtBQUNILEdBSGUsQ0FBaEI7QUFLQSxTQUFPO0FBQUNiLElBQUFBLE9BQUQ7QUFBVVcsSUFBQUEsTUFBVjtBQUFrQlIsSUFBQUE7QUFBbEIsR0FBUDtBQUNILEMsQ0FFRDs7O0FBQ08sU0FBU1c7QUFBVDtBQUFBLENBQXVCQztBQUF2QjtBQUFBO0FBQUE7QUFBd0c7QUFDM0csTUFBSWhCLE9BQU8sQ0FBQ2UsVUFBWixFQUF3QjtBQUNwQixXQUFPZixPQUFPLENBQUNlLFVBQVIsQ0FBc0JDLFFBQXRCLENBQVA7QUFDSCxHQUgwRyxDQUszRzs7O0FBQ0EsU0FBT2hCLE9BQU8sQ0FBQ2lCLEdBQVIsQ0FBWUQsUUFBUSxDQUFDRSxHQUFULENBQWNkLE9BQUQsSUFBYTtBQUN6QyxXQUFPQSxPQUFPLENBQUNJLElBQVIsQ0FBYVQsS0FBSyxLQUFLO0FBQzFCb0IsTUFBQUEsTUFBTSxFQUFFLFdBRGtCO0FBRTFCcEIsTUFBQUE7QUFGMEIsS0FBTCxDQUFsQixFQUdIcUIsS0FIRyxDQUdHQyxNQUFNLEtBQUs7QUFDakJGLE1BQUFBLE1BQU0sRUFBRSxVQURTO0FBRWpCRSxNQUFBQTtBQUZpQixLQUFMLENBSFQsQ0FBUDtBQU9ILEdBUmtCLENBQVosQ0FBUDtBQVNILEMsQ0FFRDs7O0FBQ08sZUFBZUM7QUFBZjtBQUFBLENBQXlDQztBQUF6QztBQUFBLEVBQStEQztBQUEvRDtBQUFBLEVBQTRFQztBQUE1RTtBQUFBLEVBQTJHO0FBQzlHLE1BQUlDO0FBQVU7QUFBZDs7QUFDQSxPQUFLLElBQUlDLENBQUMsR0FBRyxDQUFiLEVBQWdCQSxDQUFDLEdBQUdILEdBQXBCLEVBQXlCRyxDQUFDLEVBQTFCLEVBQThCO0FBQzFCLFFBQUk7QUFDQSxZQUFNQyxDQUFDLEdBQUcsTUFBTUwsRUFBRSxFQUFsQixDQURBLENBRUE7O0FBQ0EsYUFBT0ssQ0FBUDtBQUNILEtBSkQsQ0FJRSxPQUFPQyxHQUFQLEVBQVk7QUFDVixVQUFJSixTQUFTLElBQUksQ0FBQ0EsU0FBUyxDQUFDSSxHQUFELENBQTNCLEVBQWtDO0FBQzlCLGNBQU1BLEdBQU47QUFDSDs7QUFDREgsTUFBQUEsT0FBTyxHQUFHRyxHQUFWO0FBQ0g7QUFDSjs7QUFDRCxRQUFNSCxPQUFOO0FBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuQ29weXJpZ2h0IDIwMTksIDIwMjAgVGhlIE1hdHJpeC5vcmcgRm91bmRhdGlvbiBDLkkuQy5cblxuTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbnlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbllvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuXG4gICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG4vLyBSZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGEgZ2l2ZW4gdmFsdWUgYWZ0ZXIgdGhlIGdpdmVuIG51bWJlciBvZiBtc1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwPFQ+KG1zOiBudW1iZXIsIHZhbHVlPzogVCk6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSA9PiB7IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMsIHZhbHVlKTsgfSkpO1xufVxuXG4vLyBSZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aGVuIHRoZSBpbnB1dCBwcm9taXNlIHJlc29sdmVzIHdpdGggaXRzIHZhbHVlXG4vLyBvciB3aGVuIHRoZSB0aW1lb3V0IG9mIG1zIGlzIHJlYWNoZWQgd2l0aCB0aGUgdmFsdWUgb2YgZ2l2ZW4gdGltZW91dFZhbHVlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGltZW91dDxUPihwcm9taXNlOiBQcm9taXNlPFQ+LCB0aW1lb3V0VmFsdWU6IFQsIG1zOiBudW1iZXIpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRJZCA9IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMsIHRpbWVvdXRWYWx1ZSk7XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yYWNlKFtwcm9taXNlLCB0aW1lb3V0UHJvbWlzZV0pO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIElEZWZlcnJlZDxUPiB7XG4gICAgcmVzb2x2ZTogKHZhbHVlOiBUKSA9PiB2b2lkO1xuICAgIHJlamVjdDogKGFueSkgPT4gdm9pZDtcbiAgICBwcm9taXNlOiBQcm9taXNlPFQ+O1xufVxuXG4vLyBSZXR1cm5zIGEgRGVmZXJyZWRcbmV4cG9ydCBmdW5jdGlvbiBkZWZlcjxUPigpOiBJRGVmZXJyZWQ8VD4ge1xuICAgIGxldCByZXNvbHZlO1xuICAgIGxldCByZWplY3Q7XG5cbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2U8VD4oKF9yZXNvbHZlLCBfcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlc29sdmUgPSBfcmVzb2x2ZTtcbiAgICAgICAgcmVqZWN0ID0gX3JlamVjdDtcbiAgICB9KTtcblxuICAgIHJldHVybiB7cmVzb2x2ZSwgcmVqZWN0LCBwcm9taXNlfTtcbn1cblxuLy8gUHJvbWlzZS5hbGxTZXR0bGVkIHBvbHlmaWxsIHVudGlsIGJyb3dzZXIgc3VwcG9ydCBpcyBzdGFibGUgaW4gRmlyZWZveFxuZXhwb3J0IGZ1bmN0aW9uIGFsbFNldHRsZWQ8VD4ocHJvbWlzZXM6IFByb21pc2U8VD5bXSk6IFByb21pc2U8QXJyYXk8SVNldHRsZWRGdWxmaWxsZWQ8VD4gfCBJU2V0dGxlZFJlamVjdGVkPj4ge1xuICAgIGlmIChQcm9taXNlLmFsbFNldHRsZWQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZDxUPihwcm9taXNlcyk7XG4gICAgfVxuXG4gICAgLy8gQHRzLWlnbm9yZSAtIHR5cGVzY3JpcHQgaXNuJ3Qgc21hcnQgZW5vdWdoIHRvIHNlZSB0aGUgZGlzam9pbnQgaGVyZVxuICAgIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcy5tYXAoKHByb21pc2UpID0+IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbih2YWx1ZSA9PiAoe1xuICAgICAgICAgICAgc3RhdHVzOiBcImZ1bGZpbGxlZFwiLFxuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgIH0pKS5jYXRjaChyZWFzb24gPT4gKHtcbiAgICAgICAgICAgIHN0YXR1czogXCJyZWplY3RlZFwiLFxuICAgICAgICAgICAgcmVhc29uLFxuICAgICAgICB9KSk7XG4gICAgfSkpO1xufVxuXG4vLyBIZWxwZXIgbWV0aG9kIHRvIHJldHJ5IGEgUHJvbWlzZSBhIGdpdmVuIG51bWJlciBvZiB0aW1lcyBvciB1bnRpbCBhIHByZWRpY2F0ZSBmYWlsc1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJldHJ5PFQsIEUgZXh0ZW5kcyBFcnJvcj4oZm46ICgpID0+IFByb21pc2U8VD4sIG51bTogbnVtYmVyLCBwcmVkaWNhdGU/OiAoZTogRSkgPT4gYm9vbGVhbikge1xuICAgIGxldCBsYXN0RXJyOiBFO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSBhd2FpdCBmbigpO1xuICAgICAgICAgICAgLy8gSWYgYGF3YWl0IGZuKClgIHRocm93cyB0aGVuIHdlIHdvbid0IHJlYWNoIGhlcmVcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUgJiYgIXByZWRpY2F0ZShlcnIpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGFzdEVyciA9IGVycjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBsYXN0RXJyO1xufVxuIl19