"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.License = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const fs = require("fs-extra");
const file_1 = require("./file");
/**
 * @experimental
 */
class License extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, spdx, options) {
        var _b, _c;
        super(project, 'LICENSE');
        const textFile = `${__dirname}/../license-text/${spdx}.txt`;
        if (!fs.existsSync(textFile)) {
            throw new Error(`unsupported license ${spdx}`);
        }
        const years = (_b = options.copyrightPeriod) !== null && _b !== void 0 ? _b : new Date().getFullYear().toString();
        const owner = (_c = options.copyrightOwner) !== null && _c !== void 0 ? _c : '';
        this.text = fs.readFileSync(textFile, 'utf-8')
            .replace('[yyyy]', years)
            .replace('[name of copyright owner]', owner);
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(_) {
        return this.text;
    }
}
exports.License = License;
_a = JSII_RTTI_SYMBOL_1;
License[_a] = { fqn: "projen.License", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGljZW5zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWNlbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsK0JBQStCO0FBQy9CLGlDQUE2Qzs7OztBQW1CN0MsTUFBYSxPQUFRLFNBQVEsZUFBUTs7OztJQUduQyxZQUFZLE9BQWdCLEVBQUUsSUFBWSxFQUFFLE9BQXVCOztRQUNqRSxLQUFLLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRTFCLE1BQU0sUUFBUSxHQUFHLEdBQUcsU0FBUyxvQkFBb0IsSUFBSSxNQUFNLENBQUM7UUFDNUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNoRDtRQUVELE1BQU0sS0FBSyxTQUFHLE9BQU8sQ0FBQyxlQUFlLG1DQUFJLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDN0UsTUFBTSxLQUFLLFNBQUcsT0FBTyxDQUFDLGNBQWMsbUNBQUksRUFBRSxDQUFDO1FBRTNDLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDO2FBQzNDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO2FBQ3hCLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNqRCxDQUFDOzs7Ozs7SUFFUyxpQkFBaUIsQ0FBQyxDQUFZO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDOztBQXJCSCwwQkFzQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBGaWxlQmFzZSwgSVJlc29sdmVyIH0gZnJvbSAnLi9maWxlJztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpY2Vuc2VPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb3B5cmlnaHRPd25lcj86IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgY29weXJpZ2h0UGVyaW9kPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgTGljZW5zZSBleHRlbmRzIEZpbGVCYXNlIHtcbiAgcHJpdmF0ZSByZWFkb25seSB0ZXh0OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgc3BkeDogc3RyaW5nLCBvcHRpb25zOiBMaWNlbnNlT3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QsICdMSUNFTlNFJyk7XG5cbiAgICBjb25zdCB0ZXh0RmlsZSA9IGAke19fZGlybmFtZX0vLi4vbGljZW5zZS10ZXh0LyR7c3BkeH0udHh0YDtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModGV4dEZpbGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGxpY2Vuc2UgJHtzcGR4fWApO1xuICAgIH1cblxuICAgIGNvbnN0IHllYXJzID0gb3B0aW9ucy5jb3B5cmlnaHRQZXJpb2QgPz8gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpLnRvU3RyaW5nKCk7XG4gICAgY29uc3Qgb3duZXIgPSBvcHRpb25zLmNvcHlyaWdodE93bmVyID8/ICcnO1xuXG4gICAgdGhpcy50ZXh0ID0gZnMucmVhZEZpbGVTeW5jKHRleHRGaWxlLCAndXRmLTgnKVxuICAgICAgLnJlcGxhY2UoJ1t5eXl5XScsIHllYXJzKVxuICAgICAgLnJlcGxhY2UoJ1tuYW1lIG9mIGNvcHlyaWdodCBvd25lcl0nLCBvd25lcik7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3ludGhlc2l6ZUNvbnRlbnQoXzogSVJlc29sdmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0O1xuICB9XG59Il19