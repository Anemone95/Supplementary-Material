"use strict";
/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../../util");
var common_1 = require("../common");
var collection_field_1 = require("../v4/selectable/collection-field");
// eslint-disable-next-line valid-jsdoc
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
function entitySerializer(tsToEdm) {
    /**
     * Converts an instance of an entity class into a JSON payload to be sent to an OData service.
     *
     * @param entity - An instance of an entity.
     * @param entityConstructor - The constructor function of that entity.
     * @returns JSON.
     */
    function serializeEntity(entity, entityConstructor) {
        return __assign(__assign({}, serializeEntityNonCustomFields(entity, entityConstructor)), entity.getCustomFields());
    }
    /**
     * Converts an instance of an entity class into a JSON payload to be sent to an OData service, ignoring custom fields.
     *
     * @param entity - An instance of an entity.
     * @param entityConstructor - The constructor function of that entity.
     * @returns JSON.
     */
    function serializeEntityNonCustomFields(entity, entityConstructor) {
        if (!entity) {
            return {};
        }
        return Object.keys(entity).reduce(function (serialized, key) {
            var field = entityConstructor[util_1.toStaticPropertyFormat(key)];
            var fieldValue = entity[key];
            if (fieldValue === null || fieldValue === undefined) {
                serialized[field._fieldName] = null;
            }
            else if (field instanceof common_1.EdmTypeField) {
                serialized[field._fieldName] = tsToEdm(fieldValue, field.edmType);
            }
            else if (field instanceof common_1.OneToOneLink) {
                serialized[field._fieldName] = serializeEntityNonCustomFields(fieldValue, field._linkedEntity);
            }
            else if (field instanceof common_1.Link) {
                serialized[field._fieldName] = fieldValue.map(function (linkedEntity) {
                    return serializeEntityNonCustomFields(linkedEntity, field._linkedEntity);
                });
            }
            else if (field instanceof common_1.ComplexTypeField) {
                serialized[field._fieldName] = serializeComplexTypeField(field, fieldValue);
            }
            else if (field instanceof collection_field_1.CollectionField) {
                serialized[field._fieldName] = serializeCollectionField(fieldValue, field);
            }
            return serialized;
        }, {});
    }
    function serializeComplexTypeField(complexTypeField, fieldValue) {
        return Object.entries(complexTypeField).reduce(function (complexTypeObject, _a) {
            var propertyKey = _a[0], propertyValue = _a[1];
            var value = fieldValue[propertyKey];
            if (propertyValue instanceof common_1.EdmTypeField &&
                typeof value !== 'undefined') {
                complexTypeObject[propertyValue._fieldName] = tsToEdm(fieldValue[propertyKey], propertyValue.edmType);
            }
            return complexTypeObject;
        }, {});
    }
    function serializeCollectionField(fieldValue, selectable) {
        if (selectable._fieldType instanceof common_1.EdmTypeField) {
            var edmType_1 = selectable._fieldType.edmType;
            return fieldValue.map(function (v) { return tsToEdm(v, edmType_1); });
        }
        if (selectable._fieldType instanceof common_1.ComplexTypeField) {
            var complexTypeField_1 = selectable._fieldType;
            return fieldValue.map(function (v) {
                return serializeComplexTypeField(complexTypeField_1, v);
            });
        }
    }
    return {
        serializeEntity: serializeEntity,
        serializeEntityNonCustomFields: serializeEntityNonCustomFields
    };
}
exports.entitySerializer = entitySerializer;
//# sourceMappingURL=entity-serializer.js.map