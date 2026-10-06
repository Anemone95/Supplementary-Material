"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_toolkit_1 = require("graphql-toolkit");
var graphql_tools_1 = require("graphql-tools");
function mergeSchemas(schemas) {
    var compactSchemas = schemas.filter(function (s) { return s; });
    if (compactSchemas.length === 0) {
        return null;
    }
    else {
        return graphql_toolkit_1.mergeTypeDefs(compactSchemas);
    }
}
exports.mergeSchemas = mergeSchemas;
function buildSchema(node) {
    return graphql_tools_1.makeExecutableSchema({
        typeDefs: node,
        allowUndefinedInResolve: true,
        resolverValidationOptions: {
            requireResolversForResolveType: false,
            requireResolversForAllFields: false,
            requireResolversForNonScalar: false,
            requireResolversForArgs: false
        }
    });
}
exports.buildSchema = buildSchema;
//# sourceMappingURL=merge-schemas.js.map