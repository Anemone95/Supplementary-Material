"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const xmlbuilder2_1 = require("xmlbuilder2");
const object_file_1 = require("./object-file");
/**
 * (experimental) Represents an XML file.
 *
 * Objects passed in will be synthesized using the npm "xml" library.
 *
 * @see https://www.npmjs.com/package/xml
 * @experimental
 */
class XmlFile extends object_file_1.ObjectFile {
    /**
     * @experimental
     */
    constructor(project, filePath, options = {}) {
        super(project, filePath, options);
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(resolver) {
        const obj = super.synthesizeContent(resolver);
        if (!obj) {
            return undefined;
        }
        const xmlString = xmlbuilder2_1.create({ encoding: 'UTF-8' }, obj).end({
            prettyPrint: true,
            indent: ' '.repeat(4),
        });
        return [
            xmlString,
            ...(this.marker ? [`<!-- ${XmlFile.PROJEN_MARKER} -->`] : []),
        ].join('\n');
    }
}
exports.XmlFile = XmlFile;
_a = JSII_RTTI_SYMBOL_1;
XmlFile[_a] = { fqn: "projen.XmlFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy94bWxmaWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQWtEO0FBRWxELCtDQUE4RDs7Ozs7Ozs7O0FBYzlELE1BQWEsT0FBUSxTQUFRLHdCQUFVOzs7O0lBQ3JDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLFVBQTBCLEVBQUU7UUFDMUUsS0FBSyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEMsQ0FBQzs7Ozs7O0lBRVMsaUJBQWlCLENBQUMsUUFBbUI7UUFDN0MsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUixPQUFPLFNBQVMsQ0FBQztTQUNsQjtRQUVELE1BQU0sU0FBUyxHQUFHLG9CQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDO1lBQzFELFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUN0QixDQUFDLENBQUM7UUFFSCxPQUFPO1lBQ0wsU0FBUztZQUNULEdBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsT0FBTyxDQUFDLGFBQWEsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUMvRCxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNmLENBQUM7O0FBcEJILDBCQXFCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNyZWF0ZSBhcyBjcmVhdGV4bWwgfSBmcm9tICd4bWxidWlsZGVyMic7XG5pbXBvcnQgeyBJUmVzb2x2ZXIgfSBmcm9tICcuL2ZpbGUnO1xuaW1wb3J0IHsgT2JqZWN0RmlsZSwgT2JqZWN0RmlsZU9wdGlvbnMgfSBmcm9tICcuL29iamVjdC1maWxlJztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgWG1sRmlsZU9wdGlvbnMgZXh0ZW5kcyBPYmplY3RGaWxlT3B0aW9ucyB7fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFhtbEZpbGUgZXh0ZW5kcyBPYmplY3RGaWxlIHtcbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgZmlsZVBhdGg6IHN0cmluZywgb3B0aW9uczogWG1sRmlsZU9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHByb2plY3QsIGZpbGVQYXRoLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzeW50aGVzaXplQ29udGVudChyZXNvbHZlcjogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBvYmogPSBzdXBlci5zeW50aGVzaXplQ29udGVudChyZXNvbHZlcik7XG4gICAgaWYgKCFvYmopIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgeG1sU3RyaW5nID0gY3JlYXRleG1sKHsgZW5jb2Rpbmc6ICdVVEYtOCcgfSwgb2JqKS5lbmQoe1xuICAgICAgcHJldHR5UHJpbnQ6IHRydWUsXG4gICAgICBpbmRlbnQ6ICcgJy5yZXBlYXQoNCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgeG1sU3RyaW5nLFxuICAgICAgLi4uICh0aGlzLm1hcmtlciA/IFtgPCEtLSAke1htbEZpbGUuUFJPSkVOX01BUktFUn0gLS0+YF0gOiBbXSksXG4gICAgXS5qb2luKCdcXG4nKTtcbiAgfVxufSJdfQ==