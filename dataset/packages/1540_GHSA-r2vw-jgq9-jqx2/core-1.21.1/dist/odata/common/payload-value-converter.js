"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
/* eslint-disable valid-jsdoc */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var rambda_1 = require("rambda");
var toNumber = function (value) { return Number(value); };
var toBigNumber = function (value) { return new bignumber_js_1.default(value); };
exports.toGuid = function (value) {
    var guids = /[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}/.exec(value);
    if (!guids || guids.length <= 0) {
        throw new Error("Failed to parse the value: " + value + " to guid.");
    }
    return guids[0];
};
var fromBigNumber = function (value) {
    return value.toString();
};
/**
 * @hidden
 */
function parseNumber(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (value.toLowerCase() === 'inf') {
        return Number.POSITIVE_INFINITY;
    }
    if (value.toLowerCase() === '-inf') {
        return Number.NEGATIVE_INFINITY;
    }
    if (value.toLowerCase() === 'nan') {
        return Number.NaN;
    }
    var num = Number(value);
    if (Number.isNaN(num)) {
        throw new Error("Cannot create number from input \"" + value + "\"");
    }
    return num;
}
exports.parseNumber = parseNumber;
exports.deserializersCommon = {
    'Edm.Binary': rambda_1.identity,
    'Edm.Boolean': rambda_1.identity,
    'Edm.Byte': toNumber,
    'Edm.Decimal': toBigNumber,
    'Edm.Double': parseNumber,
    'Edm.Float': parseNumber,
    'Edm.Int16': toNumber,
    'Edm.Int32': toNumber,
    'Edm.Int64': toBigNumber,
    'Edm.Guid': exports.toGuid,
    'Edm.SByte': toNumber,
    'Edm.Single': parseNumber,
    'Edm.String': rambda_1.identity
};
exports.serializersCommom = {
    'Edm.Binary': rambda_1.identity,
    'Edm.Boolean': rambda_1.identity,
    'Edm.Byte': toNumber,
    'Edm.Decimal': fromBigNumber,
    'Edm.Double': parseNumber,
    'Edm.Float': parseNumber,
    'Edm.Int16': toNumber,
    'Edm.Int32': toNumber,
    'Edm.Int64': fromBigNumber,
    'Edm.Guid': rambda_1.identity,
    'Edm.SByte': toNumber,
    'Edm.Single': parseNumber,
    'Edm.String': rambda_1.identity
};
//# sourceMappingURL=payload-value-converter.js.map