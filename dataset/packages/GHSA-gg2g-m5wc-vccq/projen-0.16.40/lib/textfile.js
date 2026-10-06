"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const file_1 = require("./file");
/**
 * (experimental) A text file.
 *
 * @experimental
 */
class TextFile extends file_1.FileBase {
    /**
     * (experimental) Defines a text file.
     *
     * @param project The project.
     * @param filePath File path.
     * @param options Options.
     * @experimental
     */
    constructor(project, filePath, options = {}) {
        var _b;
        super(project, filePath, options);
        this.lines = (_b = options.lines) !== null && _b !== void 0 ? _b : [];
    }
    /**
     * (experimental) Adds a line to the text file.
     *
     * @param line the line to add (can use tokens).
     * @experimental
     */
    addLine(line) {
        this.lines.push(line);
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(_) {
        return this.lines.join('\n');
    }
}
exports.TextFile = TextFile;
_a = JSII_RTTI_SYMBOL_1;
TextFile[_a] = { fqn: "projen.TextFile", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGV4dGZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxpQ0FBOEQ7Ozs7OztBQWtCOUQsTUFBYSxRQUFTLFNBQVEsZUFBUTs7Ozs7Ozs7O0lBVXBDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLFVBQTJCLEVBQUc7O1FBQzVFLEtBQUssQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxDLElBQUksQ0FBQyxLQUFLLFNBQUcsT0FBTyxDQUFDLEtBQUssbUNBQUksRUFBRSxDQUFDO0lBQ25DLENBQUM7Ozs7Ozs7SUFNTSxPQUFPLENBQUMsSUFBWTtRQUN6QixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDOzs7Ozs7SUFFUyxpQkFBaUIsQ0FBQyxDQUFZO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsQ0FBQzs7QUExQkgsNEJBMkJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRmlsZUJhc2UsIEZpbGVCYXNlT3B0aW9ucywgSVJlc29sdmVyIH0gZnJvbSAnLi9maWxlJztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFRleHRGaWxlT3B0aW9ucyBleHRlbmRzIEZpbGVCYXNlT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGxpbmVzPzogc3RyaW5nW107XG59XG5cbiAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgVGV4dEZpbGUgZXh0ZW5kcyBGaWxlQmFzZSB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbGluZXM6IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QsIGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IFRleHRGaWxlT3B0aW9ucyA9IHsgfSkge1xuICAgIHN1cGVyKHByb2plY3QsIGZpbGVQYXRoLCBvcHRpb25zKTtcblxuICAgIHRoaXMubGluZXMgPSBvcHRpb25zLmxpbmVzID8/IFtdO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkTGluZShsaW5lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmxpbmVzLnB1c2gobGluZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3ludGhlc2l6ZUNvbnRlbnQoXzogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5saW5lcy5qb2luKCdcXG4nKTtcbiAgfVxufVxuIl19