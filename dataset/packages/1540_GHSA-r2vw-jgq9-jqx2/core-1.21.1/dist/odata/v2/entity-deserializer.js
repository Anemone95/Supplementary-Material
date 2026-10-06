"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
Object.defineProperty(exports, "__esModule", { value: true });
var entity_deserializer_1 = require("../common/entity-deserializer");
var payload_value_converter_1 = require("./payload-value-converter");
var deserializer = entity_deserializer_1.entityDeserializer(payload_value_converter_1.edmToTs);
exports.extractCustomFields = deserializer.extractCustomFields;
exports.deserializeEntity = deserializer.deserializeEntity;
//# sourceMappingURL=entity-deserializer.js.map