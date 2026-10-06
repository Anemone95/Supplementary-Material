"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { NativeModules, Platform } = require('react-native');
const ShareExtension = (Platform.OS === 'android' && NativeModules.ShareExtension) ?
    {
        data: () => NativeModules.ShareExtension.data(),
        close: () => NativeModules.ShareExtension.close(),
    } :
    {
        data: () => { },
        close: () => { },
    };
exports.default = ShareExtension;
//# sourceMappingURL=ShareExtension.js.map