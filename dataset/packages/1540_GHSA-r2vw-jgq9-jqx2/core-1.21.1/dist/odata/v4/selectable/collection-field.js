"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var selectable_1 = require("../../common/selectable");
/**
 * @experimental This is experimental and is subject to change. Use with caution.
 */
var CollectionField = /** @class */ (function (_super) {
    __extends(CollectionField, _super);
    function CollectionField(_fieldName, _entityConstructor, 
    // TODO because complex type field is then used when calling `deserializeComplexType`
    _fieldType) {
        var _this = _super.call(this, _fieldName, _entityConstructor) || this;
        _this._fieldName = _fieldName;
        _this._entityConstructor = _entityConstructor;
        _this._fieldType = _fieldType;
        return _this;
    }
    return CollectionField;
}(selectable_1.Field));
exports.CollectionField = CollectionField;
//# sourceMappingURL=collection-field.js.map