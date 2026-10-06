"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.issuers = void 0;
const n3_1 = require("n3");
const nmspc_1 = require("nmspc");
const rdf_dereference_1 = __importDefault(require("rdf-dereference"));
const issuers = async function (webid) {
    const { quads: quadStream } = await rdf_dereference_1.default.dereference(webid.toString());
    const store = new n3_1.Store();
    const issuer = [];
    return new Promise((resolve) => {
        store.import(quadStream).on("end", () => {
            store
                .match(n3_1.DataFactory.namedNode(webid.toString()), n3_1.DataFactory.namedNode(nmspc_1.SOLID.oidcIssuer))
                .on("data", (quad) => {
                issuer.push(quad.object.value);
            })
                .on("end", () => resolve(issuer));
        });
    });
};
exports.issuers = issuers;
//# sourceMappingURL=WebID.js.map