"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ExternalEditWatcher = require('lib/services/ExternalEditWatcher');
exports.default = {
    externalEditWatcher: () => ExternalEditWatcher.instance().externalApi(),
};
//# sourceMappingURL=actionApi.desktop.js.map