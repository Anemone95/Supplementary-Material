"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useExpiringCounter = exports.useInterval = exports.useTimeout = void 0;

var _react = require("react");

/*
Copyright 2020 The Matrix.org Foundation C.I.C.

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
// Hook to simplify timeouts in functional components
const useTimeout = (handler
/*: Handler*/
, timeoutMs
/*: number*/
) => {
  // Create a ref that stores handler
  const savedHandler = (0, _react.useRef)(); // Update ref.current value if handler changes.

  (0, _react.useEffect)(() => {
    savedHandler.current = handler;
  }, [handler]); // Set up timer

  (0, _react.useEffect)(() => {
    const timeoutID = setTimeout(() => {
      savedHandler.current();
    }, timeoutMs);
    return () => clearTimeout(timeoutID);
  }, [timeoutMs]);
}; // Hook to simplify intervals in functional components


exports.useTimeout = useTimeout;

const useInterval = (handler
/*: Handler*/
, intervalMs
/*: number*/
) => {
  // Create a ref that stores handler
  const savedHandler = (0, _react.useRef)(); // Update ref.current value if handler changes.

  (0, _react.useEffect)(() => {
    savedHandler.current = handler;
  }, [handler]); // Set up timer

  (0, _react.useEffect)(() => {
    const intervalID = setInterval(() => {
      savedHandler.current();
    }, intervalMs);
    return () => clearInterval(intervalID);
  }, [intervalMs]);
}; // Hook to simplify a variable counting down to 0, handler called when it reached 0


exports.useInterval = useInterval;

const useExpiringCounter = (handler
/*: Handler*/
, intervalMs
/*: number*/
, initialCount
/*: number*/
) => {
  const [count, setCount] = (0, _react.useState)(initialCount);
  useInterval(() => setCount(c => c - 1), intervalMs);

  if (count === 0) {
    handler();
  }

  return count;
};

exports.useExpiringCounter = useExpiringCounter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ob29rcy91c2VUaW1lb3V0LnRzIl0sIm5hbWVzIjpbInVzZVRpbWVvdXQiLCJoYW5kbGVyIiwidGltZW91dE1zIiwic2F2ZWRIYW5kbGVyIiwiY3VycmVudCIsInRpbWVvdXRJRCIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJ1c2VJbnRlcnZhbCIsImludGVydmFsTXMiLCJpbnRlcnZhbElEIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwidXNlRXhwaXJpbmdDb3VudGVyIiwiaW5pdGlhbENvdW50IiwiY291bnQiLCJzZXRDb3VudCIsImMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFnQkE7O0FBaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQU1BO0FBQ08sTUFBTUEsVUFBVSxHQUFHLENBQUNDO0FBQUQ7QUFBQSxFQUFtQkM7QUFBbkI7QUFBQSxLQUF5QztBQUMvRDtBQUNBLFFBQU1DLFlBQVksR0FBRyxvQkFBckIsQ0FGK0QsQ0FJL0Q7O0FBQ0Esd0JBQVUsTUFBTTtBQUNaQSxJQUFBQSxZQUFZLENBQUNDLE9BQWIsR0FBdUJILE9BQXZCO0FBQ0gsR0FGRCxFQUVHLENBQUNBLE9BQUQsQ0FGSCxFQUwrRCxDQVMvRDs7QUFDQSx3QkFBVSxNQUFNO0FBQ1osVUFBTUksU0FBUyxHQUFHQyxVQUFVLENBQUMsTUFBTTtBQUMvQkgsTUFBQUEsWUFBWSxDQUFDQyxPQUFiO0FBQ0gsS0FGMkIsRUFFekJGLFNBRnlCLENBQTVCO0FBR0EsV0FBTyxNQUFNSyxZQUFZLENBQUNGLFNBQUQsQ0FBekI7QUFDSCxHQUxELEVBS0csQ0FBQ0gsU0FBRCxDQUxIO0FBTUgsQ0FoQk0sQyxDQWtCUDs7Ozs7QUFDTyxNQUFNTSxXQUFXLEdBQUcsQ0FBQ1A7QUFBRDtBQUFBLEVBQW1CUTtBQUFuQjtBQUFBLEtBQTBDO0FBQ2pFO0FBQ0EsUUFBTU4sWUFBWSxHQUFHLG9CQUFyQixDQUZpRSxDQUlqRTs7QUFDQSx3QkFBVSxNQUFNO0FBQ1pBLElBQUFBLFlBQVksQ0FBQ0MsT0FBYixHQUF1QkgsT0FBdkI7QUFDSCxHQUZELEVBRUcsQ0FBQ0EsT0FBRCxDQUZILEVBTGlFLENBU2pFOztBQUNBLHdCQUFVLE1BQU07QUFDWixVQUFNUyxVQUFVLEdBQUdDLFdBQVcsQ0FBQyxNQUFNO0FBQ2pDUixNQUFBQSxZQUFZLENBQUNDLE9BQWI7QUFDSCxLQUY2QixFQUUzQkssVUFGMkIsQ0FBOUI7QUFHQSxXQUFPLE1BQU1HLGFBQWEsQ0FBQ0YsVUFBRCxDQUExQjtBQUNILEdBTEQsRUFLRyxDQUFDRCxVQUFELENBTEg7QUFNSCxDQWhCTSxDLENBa0JQOzs7OztBQUNPLE1BQU1JLGtCQUFrQixHQUFHLENBQUNaO0FBQUQ7QUFBQSxFQUFtQlE7QUFBbkI7QUFBQSxFQUF1Q0s7QUFBdkM7QUFBQSxLQUFnRTtBQUM5RixRQUFNLENBQUNDLEtBQUQsRUFBUUMsUUFBUixJQUFvQixxQkFBU0YsWUFBVCxDQUExQjtBQUNBTixFQUFBQSxXQUFXLENBQUMsTUFBTVEsUUFBUSxDQUFDQyxDQUFDLElBQUlBLENBQUMsR0FBRyxDQUFWLENBQWYsRUFBNkJSLFVBQTdCLENBQVg7O0FBQ0EsTUFBSU0sS0FBSyxLQUFLLENBQWQsRUFBaUI7QUFDYmQsSUFBQUEsT0FBTztBQUNWOztBQUNELFNBQU9jLEtBQVA7QUFDSCxDQVBNIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuaW1wb3J0IHt1c2VFZmZlY3QsIHVzZVJlZiwgdXNlU3RhdGV9IGZyb20gXCJyZWFjdFwiO1xuXG50eXBlIEhhbmRsZXIgPSAoKSA9PiB2b2lkO1xuXG4vLyBIb29rIHRvIHNpbXBsaWZ5IHRpbWVvdXRzIGluIGZ1bmN0aW9uYWwgY29tcG9uZW50c1xuZXhwb3J0IGNvbnN0IHVzZVRpbWVvdXQgPSAoaGFuZGxlcjogSGFuZGxlciwgdGltZW91dE1zOiBudW1iZXIpID0+IHtcbiAgICAvLyBDcmVhdGUgYSByZWYgdGhhdCBzdG9yZXMgaGFuZGxlclxuICAgIGNvbnN0IHNhdmVkSGFuZGxlciA9IHVzZVJlZjxIYW5kbGVyPigpO1xuXG4gICAgLy8gVXBkYXRlIHJlZi5jdXJyZW50IHZhbHVlIGlmIGhhbmRsZXIgY2hhbmdlcy5cbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBzYXZlZEhhbmRsZXIuY3VycmVudCA9IGhhbmRsZXI7XG4gICAgfSwgW2hhbmRsZXJdKTtcblxuICAgIC8vIFNldCB1cCB0aW1lclxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRpbWVvdXRJRCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgc2F2ZWRIYW5kbGVyLmN1cnJlbnQoKTtcbiAgICAgICAgfSwgdGltZW91dE1zKTtcbiAgICAgICAgcmV0dXJuICgpID0+IGNsZWFyVGltZW91dCh0aW1lb3V0SUQpO1xuICAgIH0sIFt0aW1lb3V0TXNdKTtcbn07XG5cbi8vIEhvb2sgdG8gc2ltcGxpZnkgaW50ZXJ2YWxzIGluIGZ1bmN0aW9uYWwgY29tcG9uZW50c1xuZXhwb3J0IGNvbnN0IHVzZUludGVydmFsID0gKGhhbmRsZXI6IEhhbmRsZXIsIGludGVydmFsTXM6IG51bWJlcikgPT4ge1xuICAgIC8vIENyZWF0ZSBhIHJlZiB0aGF0IHN0b3JlcyBoYW5kbGVyXG4gICAgY29uc3Qgc2F2ZWRIYW5kbGVyID0gdXNlUmVmPEhhbmRsZXI+KCk7XG5cbiAgICAvLyBVcGRhdGUgcmVmLmN1cnJlbnQgdmFsdWUgaWYgaGFuZGxlciBjaGFuZ2VzLlxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIHNhdmVkSGFuZGxlci5jdXJyZW50ID0gaGFuZGxlcjtcbiAgICB9LCBbaGFuZGxlcl0pO1xuXG4gICAgLy8gU2V0IHVwIHRpbWVyXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHNhdmVkSGFuZGxlci5jdXJyZW50KCk7XG4gICAgICAgIH0sIGludGVydmFsTXMpO1xuICAgICAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbElEKTtcbiAgICB9LCBbaW50ZXJ2YWxNc10pO1xufTtcblxuLy8gSG9vayB0byBzaW1wbGlmeSBhIHZhcmlhYmxlIGNvdW50aW5nIGRvd24gdG8gMCwgaGFuZGxlciBjYWxsZWQgd2hlbiBpdCByZWFjaGVkIDBcbmV4cG9ydCBjb25zdCB1c2VFeHBpcmluZ0NvdW50ZXIgPSAoaGFuZGxlcjogSGFuZGxlciwgaW50ZXJ2YWxNczogbnVtYmVyLCBpbml0aWFsQ291bnQ6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IFtjb3VudCwgc2V0Q291bnRdID0gdXNlU3RhdGUoaW5pdGlhbENvdW50KTtcbiAgICB1c2VJbnRlcnZhbCgoKSA9PiBzZXRDb3VudChjID0+IGMgLSAxKSwgaW50ZXJ2YWxNcyk7XG4gICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgIGhhbmRsZXIoKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvdW50O1xufTtcbiJdfQ==