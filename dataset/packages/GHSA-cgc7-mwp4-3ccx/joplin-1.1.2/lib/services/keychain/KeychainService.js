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
const Setting = require('lib/models/Setting');
const BaseService = require('lib/services/BaseService');
class KeychainService extends BaseService {
    static instance() {
        if (!this.instance_)
            this.instance_ = new KeychainService();
        return this.instance_;
    }
    initialize(driver) {
        if (!driver.appId || !driver.clientId)
            throw new Error('appId and clientId must be set on the KeychainServiceDriver');
        this.driver = driver;
    }
    setPassword(name, password) {
        return __awaiter(this, void 0, void 0, function* () {
            // Due to a bug in macOS, this may throw an exception "The user name or passphrase you entered is not correct."
            // The fix is to open Keychain Access.app. Right-click on the login keychain and try locking it and then unlocking it again.
            // https://github.com/atom/node-keytar/issues/76
            return this.driver.setPassword(name, password);
        });
    }
    password(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.driver.password(name);
        });
    }
    deletePassword(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.deletePassword(name);
        });
    }
    detectIfKeychainSupported() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger().info('KeychainService: checking if keychain supported');
            if (Setting.value('keychain.supported') >= 0) {
                this.logger().info('KeychainService: check was already done - skipping. Supported:', Setting.value('keychain.supported'));
                return;
            }
            const passwordIsSet = yield this.setPassword('zz_testingkeychain', 'mytest');
            if (!passwordIsSet) {
                this.logger().info('KeychainService: could not set test password - keychain support will be disabled');
                Setting.setValue('keychain.supported', 0);
            }
            else {
                const result = yield this.password('zz_testingkeychain');
                yield this.deletePassword('zz_testingkeychain');
                this.logger().info('KeychainService: tried to set and get password. Result was:', result);
                Setting.setValue('keychain.supported', result === 'mytest' ? 1 : 0);
            }
        });
    }
}
exports.default = KeychainService;
//# sourceMappingURL=KeychainService.js.map