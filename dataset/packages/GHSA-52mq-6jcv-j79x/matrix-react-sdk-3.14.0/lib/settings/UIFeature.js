"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UIFeature = void 0;

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
// see settings.md for documentation on conventions
let UIFeature;
exports.UIFeature = UIFeature;

(function (UIFeature) {
  UIFeature["AdvancedEncryption"] = "UIFeature.advancedEncryption";
  UIFeature["URLPreviews"] = "UIFeature.urlPreviews";
  UIFeature["Widgets"] = "UIFeature.widgets";
  UIFeature["Voip"] = "UIFeature.voip";
  UIFeature["Feedback"] = "UIFeature.feedback";
  UIFeature["Registration"] = "UIFeature.registration";
  UIFeature["PasswordReset"] = "UIFeature.passwordReset";
  UIFeature["Deactivate"] = "UIFeature.deactivate";
  UIFeature["ShareQRCode"] = "UIFeature.shareQrCode";
  UIFeature["ShareSocial"] = "UIFeature.shareSocial";
  UIFeature["IdentityServer"] = "UIFeature.identityServer";
  UIFeature["ThirdPartyID"] = "UIFeature.thirdPartyId";
  UIFeature["Flair"] = "UIFeature.flair";
  UIFeature["Communities"] = "UIFeature.communities";
  UIFeature["AdvancedSettings"] = "UIFeature.advancedSettings";
  UIFeature["RoomHistorySettings"] = "UIFeature.roomHistorySettings";
})(UIFeature || (exports.UIFeature = UIFeature = {}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXR0aW5ncy9VSUZlYXR1cmUudHMiXSwibmFtZXMiOlsiVUlGZWF0dXJlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7SUFDWUEsUzs7O1dBQUFBLFM7QUFBQUEsRUFBQUEsUztBQUFBQSxFQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztBQUFBQSxFQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztBQUFBQSxFQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztBQUFBQSxFQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztBQUFBQSxFQUFBQSxTO0FBQUFBLEVBQUFBLFM7QUFBQUEsRUFBQUEsUztHQUFBQSxTLHlCQUFBQSxTIiwic291cmNlc0NvbnRlbnQiOlsiLypcbkNvcHlyaWdodCAyMDIwIFRoZSBNYXRyaXgub3JnIEZvdW5kYXRpb24gQy5JLkMuXG5cbkxpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG55b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG5Zb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcblxuICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuXG5Vbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG5kaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG5XSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cblNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbmxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuKi9cblxuLy8gc2VlIHNldHRpbmdzLm1kIGZvciBkb2N1bWVudGF0aW9uIG9uIGNvbnZlbnRpb25zXG5leHBvcnQgZW51bSBVSUZlYXR1cmUge1xuICAgIEFkdmFuY2VkRW5jcnlwdGlvbiA9IFwiVUlGZWF0dXJlLmFkdmFuY2VkRW5jcnlwdGlvblwiLFxuICAgIFVSTFByZXZpZXdzID0gXCJVSUZlYXR1cmUudXJsUHJldmlld3NcIixcbiAgICBXaWRnZXRzID0gXCJVSUZlYXR1cmUud2lkZ2V0c1wiLFxuICAgIFZvaXAgPSBcIlVJRmVhdHVyZS52b2lwXCIsXG4gICAgRmVlZGJhY2sgPSBcIlVJRmVhdHVyZS5mZWVkYmFja1wiLFxuICAgIFJlZ2lzdHJhdGlvbiA9IFwiVUlGZWF0dXJlLnJlZ2lzdHJhdGlvblwiLFxuICAgIFBhc3N3b3JkUmVzZXQgPSBcIlVJRmVhdHVyZS5wYXNzd29yZFJlc2V0XCIsXG4gICAgRGVhY3RpdmF0ZSA9IFwiVUlGZWF0dXJlLmRlYWN0aXZhdGVcIixcbiAgICBTaGFyZVFSQ29kZSA9IFwiVUlGZWF0dXJlLnNoYXJlUXJDb2RlXCIsXG4gICAgU2hhcmVTb2NpYWwgPSBcIlVJRmVhdHVyZS5zaGFyZVNvY2lhbFwiLFxuICAgIElkZW50aXR5U2VydmVyID0gXCJVSUZlYXR1cmUuaWRlbnRpdHlTZXJ2ZXJcIixcbiAgICBUaGlyZFBhcnR5SUQgPSBcIlVJRmVhdHVyZS50aGlyZFBhcnR5SWRcIixcbiAgICBGbGFpciA9IFwiVUlGZWF0dXJlLmZsYWlyXCIsXG4gICAgQ29tbXVuaXRpZXMgPSBcIlVJRmVhdHVyZS5jb21tdW5pdGllc1wiLFxuICAgIEFkdmFuY2VkU2V0dGluZ3MgPSBcIlVJRmVhdHVyZS5hZHZhbmNlZFNldHRpbmdzXCIsXG4gICAgUm9vbUhpc3RvcnlTZXR0aW5ncyA9IFwiVUlGZWF0dXJlLnJvb21IaXN0b3J5U2V0dGluZ3NcIixcbn1cbiJdfQ==