"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const { Platform, PermissionsAndroid } = require('react-native');
exports.default = (permissions, rationale) => __awaiter(void 0, void 0, void 0, function* () {
    if (Platform.OS !== 'android')
        return true;
    let result = yield PermissionsAndroid.check(permissions);
    if (result !== PermissionsAndroid.RESULTS.GRANTED) {
        result = yield PermissionsAndroid.request(permissions, rationale);
    }
    return result === PermissionsAndroid.RESULTS.GRANTED;
});
//# sourceMappingURL=checkPermissions.js.map