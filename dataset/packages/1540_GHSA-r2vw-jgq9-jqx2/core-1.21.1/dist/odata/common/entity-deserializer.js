"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../../util");
var common_1 = require("../common");
var collection_field_1 = require("../v4/selectable/collection-field");
// eslint-disable-next-line valid-jsdoc
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
function entityDeserializer(edmToTs) {
    /**
     * Extracts all custom fields from the JSON payload for a single entity.
     * In this context, a custom fields is every property that is not known in the corresponding entity class.
     *
     * @param json - The JSON payload.
     * @param entityConstructor - The constructor function of the entity class.
     * @returns An object containing the custom fields as key-value pairs.
     */
    function extractCustomFields(json, entityConstructor) {
        var regularODataProperties = __spreadArrays([
            '__metadata',
            '__deferred'
        ], entityConstructor._allFields.map(function (field) { return field._fieldName; }));
        var regularFields = new Set(regularODataProperties);
        return Object.keys(json)
            .filter(function (key) { return !regularFields.has(key); })
            .reduce(function (customFields, key) {
            customFields[key] = json[key];
            return customFields;
        }, {});
    }
    /**
     * Converts the JSON payload for a single entity into an instance of the corresponding generated entity class.
     * It sets the remote state to the data provided by the JSON payload.
     * If a version identifier is found in the '__metadata' or in the request header, the method also sets it.
     *
     * @param json - The JSON payload.
     * @param entityConstructor - The constructor function of the entity class.
     * @param requestHeader - Optional parameter which may be used to add a version identifier (etag) to the entity
     * @returns An instance of the entity class.
     */
    function deserializeEntity(json, entityConstructor, requestHeader) {
        var etag = extractODataETag(json) || extractEtagFromHeader(requestHeader);
        return entityConstructor._allFields // type assertion for backwards compatibility, TODO: remove in v2.0
            .filter(function (field) { return common_1.isSelectedProperty(json, field); })
            .reduce(function (entity, staticField) {
            entity[util_1.toPropertyFormat(staticField._fieldName)] = getFieldValue(json, staticField);
            return entity;
        }, new entityConstructor())
            .initializeCustomFields(extractCustomFields(json, entityConstructor))
            .setVersionIdentifier(etag)
            .setOrInitializeRemoteState();
    }
    function extractEtagFromHeader(headers) {
        return headers ? headers['Etag'] || headers['etag'] : undefined;
    }
    function extractODataETag(json) {
        return '__metadata' in json ? json['__metadata']['etag'] : undefined;
    }
    function getFieldValue(json, field) {
        if (field instanceof common_1.EdmTypeField) {
            return edmToTs(json[field._fieldName], field.edmType);
        }
        if (field instanceof common_1.Link) {
            return getLinkFromJson(json, field);
        }
        if (field instanceof common_1.ComplexTypeField) {
            return json[field._fieldName]
                ? deserializeComplexType(json[field._fieldName], field)
                : undefined;
        }
        if (field instanceof collection_field_1.CollectionField) {
            return deserializeCollectionType(json[field._fieldName], field);
        }
    }
    function getLinkFromJson(json, link) {
        return link instanceof common_1.OneToOneLink
            ? getSingleLinkFromJson(json, link)
            : getMultiLinkFromJson(json, link);
    }
    // Be careful: if the return type is changed to `LinkedEntityT | undefined`, the test 'navigation properties should never be undefined' of the 'business-partner.spec.ts' will fail.
    // Not sure the purpose of the usage of null.
    function getSingleLinkFromJson(json, link) {
        if (common_1.isExpandedProperty(json, link)) {
            return deserializeEntity(json[link._fieldName], link._linkedEntity);
        }
        return null;
    }
    function getMultiLinkFromJson(json, link) {
        if (common_1.isSelectedProperty(json, link)) {
            var results = json[link._fieldName].results || [];
            return results.map(function (linkJson) {
                return deserializeEntity(linkJson, link._linkedEntity);
            });
        }
    }
    function deserializeComplexType(json, complexTypeField) {
        return Object.entries(complexTypeField)
            .filter(function (_a) {
            var _ = _a[0], field = _a[1];
            return field instanceof common_1.EdmTypeField &&
                typeof json[field._fieldName] !== 'undefined';
        })
            .reduce(function (complexTypeObject, _a) {
            var fieldName = _a[0], field = _a[1];
            complexTypeObject[util_1.toPropertyFormat(fieldName)] = edmToTs(json[field._fieldName], field.edmType);
            return complexTypeObject;
        }, {});
    }
    function deserializeCollectionType(json, selectable) {
        if (selectable._fieldType instanceof common_1.EdmTypeField) {
            var edmType_1 = selectable._fieldType.edmType;
            return json.map(function (v) { return edmToTs(v, edmType_1); });
        }
        if (selectable._fieldType instanceof common_1.ComplexTypeField) {
            var complexTypeField_1 = selectable._fieldType;
            return json.map(function (v) { return deserializeComplexType(v, complexTypeField_1); });
        }
    }
    // TODO: extractCustomFields should not be exported here. This was probably done only for testing
    return {
        extractCustomFields: extractCustomFields,
        deserializeEntity: deserializeEntity
    };
}
exports.entityDeserializer = entityDeserializer;
//# sourceMappingURL=entity-deserializer.js.map