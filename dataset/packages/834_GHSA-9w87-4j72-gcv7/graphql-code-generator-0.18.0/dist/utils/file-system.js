"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var file_exists_1 = require("./file-exists");
exports.default = {
    writeSync: function (filepath, content) {
        fs.writeFileSync(filepath, content);
    },
    fileExists: file_exists_1.fileExists
};
//# sourceMappingURL=file-system.js.map