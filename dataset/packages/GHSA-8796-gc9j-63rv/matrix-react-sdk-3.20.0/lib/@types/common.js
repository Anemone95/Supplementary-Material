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
// Based on https://stackoverflow.com/a/53229857/3532235

/*:: export type Without<T, U> = {[P in Exclude<keyof T, keyof U>] ? : never};*/

/*:: export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;*/

/*:: export type Writeable<T> = { -readonly [P in keyof T]: T[P] };*/

/*:: export type ComponentClass = keyof JSX.IntrinsicElements | JSXElementConstructor<any>;*/
"use strict";
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9AdHlwZXMvY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUlBIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG5cblVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbmRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbldJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxubGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4qL1xuXG5pbXBvcnQgeyBKU1hFbGVtZW50Q29uc3RydWN0b3IgfSBmcm9tIFwicmVhY3RcIjtcblxuLy8gQmFzZWQgb24gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzUzMjI5ODU3LzM1MzIyMzVcbmV4cG9ydCB0eXBlIFdpdGhvdXQ8VCwgVT4gPSB7W1AgaW4gRXhjbHVkZTxrZXlvZiBULCBrZXlvZiBVPl0gPyA6IG5ldmVyfTtcbmV4cG9ydCB0eXBlIFhPUjxULCBVPiA9IChUIHwgVSkgZXh0ZW5kcyBvYmplY3QgPyAoV2l0aG91dDxULCBVPiAmIFUpIHwgKFdpdGhvdXQ8VSwgVD4gJiBUKSA6IFQgfCBVO1xuZXhwb3J0IHR5cGUgV3JpdGVhYmxlPFQ+ID0geyAtcmVhZG9ubHkgW1AgaW4ga2V5b2YgVF06IFRbUF0gfTtcblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50Q2xhc3MgPSBrZXlvZiBKU1guSW50cmluc2ljRWxlbWVudHMgfCBKU1hFbGVtZW50Q29uc3RydWN0b3I8YW55PjtcbiJdfQ==