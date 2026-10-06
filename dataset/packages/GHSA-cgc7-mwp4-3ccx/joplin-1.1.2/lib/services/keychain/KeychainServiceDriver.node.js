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
const KeychainServiceDriverBase_1 = require("./KeychainServiceDriverBase");
const { shim } = require('lib/shim.js');
// keytar throws an error when system keychain is not present;
// even when keytar itself is installed.
// try/catch to ensure system keychain is present and no error is thrown.
// For now, keychain support is disabled on Linux because when keytar is loaded
// it seems to cause the following error when loading Sharp:
//
// Something went wrong installing the "sharp" module
// /lib/x86_64-linux-gnu/libz.so.1: version `ZLIB_1.2.9' not found (required by /home/travis/build/laurent22/joplin/CliClient/node_modules/sharp/build/Release/../../vendor/lib/libpng16.so.16)
//
// See: https://travis-ci.org/github/laurent22/joplin/jobs/686222036
//
// Also disabled in portable mode obviously.
let keytar;
try {
    keytar = (shim.isWindows() || shim.isMac()) && !shim.isPortable() ? require('keytar') : null;
}
catch (error) {
    console.error('Cannot load keytar - keychain support will be disabled', error);
    keytar = null;
}
class KeychainServiceDriver extends KeychainServiceDriverBase_1.default {
    setPassword(name, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!keytar)
                return false;
            yield keytar.setPassword(`${this.appId}.${name}`, `${this.clientId}@joplin`, password);
            return true;
        });
    }
    password(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!keytar)
                return null;
            return keytar.getPassword(`${this.appId}.${name}`, `${this.clientId}@joplin`);
        });
    }
    deletePassword(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!keytar)
                return;
            yield keytar.deletePassword(`${this.appId}.${name}`, `${this.clientId}@joplin`);
        });
    }
}
exports.default = KeychainServiceDriver;
//# sourceMappingURL=KeychainServiceDriver.node.js.map