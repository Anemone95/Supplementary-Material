"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var logUpdate = require("log-update");
var indentString = require("indent-string");
var logSymbol = require("log-symbols");
var UpdateRenderer = require("listr-update-renderer");
var common_tags_1 = require("common-tags");
var errors_1 = require("../errors");
var graphql_codegen_core_1 = require("graphql-codegen-core");
var Renderer = /** @class */ (function () {
    function Renderer(tasks, options) {
        this.updateRenderer = new UpdateRenderer(tasks, options);
    }
    Renderer.prototype.render = function () {
        return this.updateRenderer.render();
    };
    Renderer.prototype.end = function (err) {
        this.updateRenderer.end(err);
        if (typeof err === undefined) {
            logUpdate.clear();
            return;
        }
        // persist the output
        logUpdate.done();
        // show errors
        if (err) {
            var errorCount = err.errors ? err.errors.length : 0;
            if (errorCount > 0) {
                var count = indentString(chalk_1.default.red.bold("Found " + errorCount + " error" + (errorCount > 1 ? 's' : '')), 1);
                var details = err.errors
                    .map(function (error) {
                    graphql_codegen_core_1.debugLog("[CLI] Exited with an error", error);
                    return errors_1.isDetailedError(error) ? error.details : error;
                })
                    .map(function (msg, i) {
                    var source = err.errors[i].source;
                    msg = chalk_1.default.gray(indentString(common_tags_1.stripIndent("" + msg), 4));
                    if (source) {
                        var sourceOfError = typeof source === 'string' ? source : source.name;
                        var title = indentString(logSymbol.error + " " + sourceOfError, 2);
                        return [title, msg].join('\n');
                    }
                    return msg;
                })
                    .join('\n\n');
                logUpdate(['', count, details, ''].join('\n\n'));
            }
            else {
                logUpdate(chalk_1.default.red.bold(err.message));
            }
        }
        logUpdate.done();
        graphql_codegen_core_1.printLogs();
    };
    return Renderer;
}());
exports.Renderer = Renderer;
//# sourceMappingURL=listr-renderer.js.map