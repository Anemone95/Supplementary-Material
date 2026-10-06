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
var util_1 = require("../../../util");
var filter_1 = require("../filter");
var selectable_1 = require("../selectable");
var uri_value_converter_1 = require("./uri-value-converter");
// eslint-disable-next-line valid-jsdoc
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
function createGetFilter(uriConverter) {
    /**
     * Get an object containing the given filter as query parameter, or an empty object if none was given.
     *
     * @typeparam EntityT - Type of the entity to filter on
     * @param filter - The filter to transform to a query parameter
     * @param entityConstructor - Constructor type of the entity to filter on
     * @returns An object containing the query parameter or an empty object
     */
    function getFilter(filter, entityConstructor) {
        if (typeof filter !== 'undefined') {
            var filterExpression = getODataFilterExpression(filter, [], entityConstructor);
            if (filterExpression) {
                return {
                    filter: filterExpression
                };
            }
        }
        return {};
    }
    function getODataFilterExpression(filter, parentFieldNames, targetEntityConstructor) {
        if (parentFieldNames === void 0) { parentFieldNames = []; }
        if (filter_1.isFilterList(filter)) {
            filter.flatten();
            var andExp = filter.andFilters
                .map(function (subFilter) {
                return getODataFilterExpression(subFilter, parentFieldNames, targetEntityConstructor);
            })
                .filter(function (f) { return !!f; })
                .join(' and ');
            andExp = andExp ? "(" + andExp + ")" : andExp;
            var orExp = filter.orFilters
                .map(function (subFilter) {
                return getODataFilterExpression(subFilter, parentFieldNames, targetEntityConstructor);
            })
                .filter(function (f) { return !!f; })
                .join(' or ');
            orExp = orExp ? "(" + orExp + ")" : orExp;
            var exp = [];
            if (andExp) {
                exp.push(andExp);
            }
            if (orExp) {
                exp.push(orExp);
            }
            return exp.join(' and ');
        }
        if (filter_1.isFilterLink(filter)) {
            var linkExp = filter.filters
                .map(function (subFilter) {
                return getODataFilterExpression(subFilter, __spreadArrays(parentFieldNames, [filter.link._fieldName]), filter.link._linkedEntity);
            })
                .filter(function (f) { return !!f; })
                .join(' and ');
            linkExp = linkExp ? "(" + linkExp + ")" : linkExp;
            return linkExp;
        }
        if (filter_1.isFilter(filter)) {
            if (typeof filter.field === 'string') {
                var field = retrieveField(filter.field, targetEntityConstructor, filter.edmType);
                return [
                    __spreadArrays(parentFieldNames, [filter.field]).join('/'),
                    filter.operator,
                    uriConverter.convertToUriFormat(filter.value, field.edmType)
                ].join(' ');
            }
            return [
                filterFunctionToString(filter.field, parentFieldNames),
                filter.operator,
                uriConverter.convertToUriFormat(filter.value, filter.edmType)
            ].join(' ');
        }
    }
    function retrieveField(filterField, targetEntityConstructor, filterEdmType) {
        // In case of complex types there will be a property name as part of the filter.field
        var fieldName = filterField.split('/')[0];
        var field = targetEntityConstructor[util_1.toStaticPropertyFormat(fieldName)];
        if (field instanceof selectable_1.ComplexTypeField) {
            return Object.values(field)
                .filter(function (pField) { return pField === null || pField === void 0 ? void 0 : pField.fieldPath; }) // Filter for ComplexTypePropertyFields only
                .find(function (pField) {
                return pField.fieldPath() === filterField;
            });
        }
        // In case of custom field we infer then the returned field from the filter edmType property
        return field || { edmType: filterEdmType };
    }
    function filterFunctionToString(filterFunction, parentFieldNames) {
        if (parentFieldNames === void 0) { parentFieldNames = []; }
        var params = filterFunction.parameters
            .map(function (param) { return filterFunctionParameterToString(param, parentFieldNames); })
            .join(', ');
        return filterFunction.functionName + "(" + params + ")";
    }
    function filterFunctionParameterToString(param, parentFieldNames) {
        if (typeof param === 'number') {
            return param.toString();
        }
        if (typeof param === 'string') {
            return uri_value_converter_1.convertToUriForEdmString(param);
        }
        if (param instanceof filter_1.FilterFunction) {
            return filterFunctionToString(param, parentFieldNames);
        }
        return __spreadArrays(parentFieldNames, [param._fieldName]).join('/');
    }
    return {
        getFilter: getFilter
    };
}
exports.createGetFilter = createGetFilter;
//# sourceMappingURL=get-filter.js.map