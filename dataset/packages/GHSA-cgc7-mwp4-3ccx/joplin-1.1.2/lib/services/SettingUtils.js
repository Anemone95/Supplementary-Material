"use strict";
/* eslint-disable import/prefer-default-export */
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
const KeychainService_1 = require("./keychain/KeychainService");
const Setting = require('lib/models/Setting');
const { uuid } = require('lib/uuid.js');
// This function takes care of initialising both the keychain service and settings.
//
// Loading the settings became more complicated with the keychain integration. This is because
// the settings needs a keychain service, and the keychain service needs a clientId, which
// is set dynamically and saved to the settings.
// In other words, it's not possible to load the settings without the KS service and it's not
// possible to initialise the KS service without the settings.
// The solution is to fetch just the client ID directly from the database.
function loadKeychainServiceAndSettings(KeychainServiceDriver) {
    return __awaiter(this, void 0, void 0, function* () {
        const clientIdSetting = yield Setting.loadOne('clientId');
        const clientId = clientIdSetting ? clientIdSetting.value : uuid.create();
        KeychainService_1.default.instance().initialize(new KeychainServiceDriver(Setting.value('appId'), clientId));
        Setting.setKeychainService(KeychainService_1.default.instance());
        yield Setting.load();
        if (!clientIdSetting)
            Setting.setValue('clientId', clientId);
        yield KeychainService_1.default.instance().detectIfKeychainSupported();
    });
}
exports.loadKeychainServiceAndSettings = loadKeychainServiceAndSettings;
//# sourceMappingURL=SettingUtils.js.map