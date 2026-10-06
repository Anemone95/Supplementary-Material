"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_codegen_core_1 = require("graphql-codegen-core");
var js_yaml_1 = require("js-yaml");
function parseConfigFile(ymlString) {
    if (typeof process !== 'undefined' && 'env' in process) {
        graphql_codegen_core_1.debugLog("[CLI] Interpolation of Environmental Variables");
        ymlString = ymlString.replace(/\$\{(.*)\}/g, function (str, variable, index) { return process.env[variable]; });
    }
    graphql_codegen_core_1.debugLog("[CLI] Parsing YAML file");
    return js_yaml_1.safeLoad(ymlString);
}
exports.parseConfigFile = parseConfigFile;
//# sourceMappingURL=yml.js.map