"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleDir = exports.SampleFile = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const fs = require("fs-extra");
const component_1 = require("./component");
const util_1 = require("./util");
/**
 * (experimental) Produces a file with the given contents but only once, if the file doesn't already exist.
 *
 * Use this for creating example code files or other resources.
 *
 * @experimental
 */
class SampleFile extends component_1.Component {
    /**
     * (experimental) Creates a new SampleFile object.
     *
     * @param project - the project to tie this file to.
     * @param filePath - the relative path in the project o put the file.
     * @param options - the options for the file.
     * @experimental
     */
    constructor(project, filePath, options) {
        super(project);
        this.filePath = filePath;
        this.options = options;
    }
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize() {
        const contents = this.options.contents;
        this.writeOnceFileContents(this.project.outdir, this.filePath, contents !== null && contents !== void 0 ? contents : '');
    }
    /**
     * A helper function that will write the file once and return if it was written or not.
     * @param dir - the directory for the new file
     * @param filename - the filename for the new file
     * @param contents - the contents of the file to write
     * @return boolean - whether a new file was written or not.
     * @private
     */
    writeOnceFileContents(dir, filename, contents) {
        const fullFilename = path.join(dir, filename);
        if (fs.existsSync(fullFilename)) {
            return;
        }
        util_1.writeFile(fullFilename, contents, { readonly: false });
    }
}
exports.SampleFile = SampleFile;
_a = JSII_RTTI_SYMBOL_1;
SampleFile[_a] = { fqn: "projen.SampleFile", version: "0.16.40" };
/**
 * (experimental) Renders the given files into the directory if the directory does not exist.
 *
 * Use this to create sample code files
 *
 * @experimental
 */
class SampleDir extends component_1.Component {
    /**
     * (experimental) Create sample files in the given directory if the given directory does not exist.
     *
     * @param project Parent project to add files to.
     * @param dir directory to add files to.
     * @param options options for which files to create.
     * @experimental
     */
    constructor(project, dir, options) {
        super(project);
        this.dir = dir;
        this.options = options;
    }
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize() {
        const fullOutdir = path.join(this.project.outdir, this.dir);
        if (fs.pathExistsSync(fullOutdir)) {
            return;
        }
        for (const filename in this.options.files) {
            util_1.writeFile(path.join(fullOutdir, filename), this.options.files[filename]);
        }
    }
}
exports.SampleDir = SampleDir;
_b = JSII_RTTI_SYMBOL_1;
SampleDir[_b] = { fqn: "projen.SampleDir", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FtcGxlLWZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2FtcGxlLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLDJDQUF3QztBQUV4QyxpQ0FBbUM7Ozs7Ozs7O0FBZ0JuQyxNQUFhLFVBQVcsU0FBUSxxQkFBUzs7Ozs7Ozs7O0lBVXZDLFlBQVksT0FBZ0IsRUFBRSxRQUFnQixFQUFFLE9BQTBCO1FBQ3hFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7Ozs7OztJQUVNLFVBQVU7UUFDZixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUN2QyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxFQUFFLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNLLHFCQUFxQixDQUFDLEdBQVcsRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQzNFLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUMvQixPQUFPO1NBQ1I7UUFDRCxnQkFBUyxDQUFDLFlBQVksRUFBRSxRQUFRLEVBQUUsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDOztBQW5DSCxnQ0FvQ0M7Ozs7Ozs7Ozs7QUFlRCxNQUFhLFNBQVUsU0FBUSxxQkFBUzs7Ozs7Ozs7O0lBVXRDLFlBQVksT0FBZ0IsRUFBRSxHQUFXLEVBQUUsT0FBeUI7UUFDbEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDOzs7Ozs7SUFFTSxVQUFVO1FBQ2YsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDNUQsSUFBSSxFQUFFLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ2pDLE9BQU87U0FDUjtRQUVELEtBQUssTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUU7WUFDekMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQzFFO0lBQ0gsQ0FBQzs7QUF6QkgsOEJBMEJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4vY29tcG9uZW50JztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QnO1xuaW1wb3J0IHsgd3JpdGVGaWxlIH0gZnJvbSAnLi91dGlsJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgaW50ZXJmYWNlIFNhbXBsZUZpbGVPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBjb250ZW50czogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFNhbXBsZUZpbGUgZXh0ZW5kcyBDb21wb25lbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IGZpbGVQYXRoOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgb3B0aW9uczogU2FtcGxlRmlsZU9wdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBQcm9qZWN0LCBmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBTYW1wbGVGaWxlT3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QpO1xuICAgIHRoaXMuZmlsZVBhdGggPSBmaWxlUGF0aDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgcHVibGljIHN5bnRoZXNpemUoKSB7XG4gICAgY29uc3QgY29udGVudHMgPSB0aGlzLm9wdGlvbnMuY29udGVudHM7XG4gICAgdGhpcy53cml0ZU9uY2VGaWxlQ29udGVudHModGhpcy5wcm9qZWN0Lm91dGRpciwgdGhpcy5maWxlUGF0aCwgY29udGVudHMgPz8gJycpO1xuICB9XG5cbiAgLyoqXG4gICAqIEEgaGVscGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCB3cml0ZSB0aGUgZmlsZSBvbmNlIGFuZCByZXR1cm4gaWYgaXQgd2FzIHdyaXR0ZW4gb3Igbm90LlxuICAgKiBAcGFyYW0gZGlyIC0gdGhlIGRpcmVjdG9yeSBmb3IgdGhlIG5ldyBmaWxlXG4gICAqIEBwYXJhbSBmaWxlbmFtZSAtIHRoZSBmaWxlbmFtZSBmb3IgdGhlIG5ldyBmaWxlXG4gICAqIEBwYXJhbSBjb250ZW50cyAtIHRoZSBjb250ZW50cyBvZiB0aGUgZmlsZSB0byB3cml0ZVxuICAgKiBAcmV0dXJuIGJvb2xlYW4gLSB3aGV0aGVyIGEgbmV3IGZpbGUgd2FzIHdyaXR0ZW4gb3Igbm90LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgcHJpdmF0ZSB3cml0ZU9uY2VGaWxlQ29udGVudHMoZGlyOiBzdHJpbmcsIGZpbGVuYW1lOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBmdWxsRmlsZW5hbWUgPSBwYXRoLmpvaW4oZGlyLCBmaWxlbmFtZSk7XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZnVsbEZpbGVuYW1lKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB3cml0ZUZpbGUoZnVsbEZpbGVuYW1lLCBjb250ZW50cywgeyByZWFkb25seTogZmFsc2UgfSk7XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGludGVyZmFjZSBTYW1wbGVEaXJPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZmlsZXM6IHsgW2ZpbGVOYW1lOiBzdHJpbmddOiBzdHJpbmcgfTtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5leHBvcnQgY2xhc3MgU2FtcGxlRGlyIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBkaXI6IHN0cmluZztcbiAgcHJpdmF0ZSByZWFkb25seSBvcHRpb25zOiBTYW1wbGVEaXJPcHRpb25zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgY29uc3RydWN0b3IocHJvamVjdDogUHJvamVjdCwgZGlyOiBzdHJpbmcsIG9wdGlvbnM6IFNhbXBsZURpck9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcbiAgICB0aGlzLmRpciA9IGRpcjtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB9XG5cbiAgcHVibGljIHN5bnRoZXNpemUoKSB7XG4gICAgY29uc3QgZnVsbE91dGRpciA9IHBhdGguam9pbih0aGlzLnByb2plY3Qub3V0ZGlyLCB0aGlzLmRpcik7XG4gICAgaWYgKGZzLnBhdGhFeGlzdHNTeW5jKGZ1bGxPdXRkaXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBmaWxlbmFtZSBpbiB0aGlzLm9wdGlvbnMuZmlsZXMpIHtcbiAgICAgIHdyaXRlRmlsZShwYXRoLmpvaW4oZnVsbE91dGRpciwgZmlsZW5hbWUpLCB0aGlzLm9wdGlvbnMuZmlsZXNbZmlsZW5hbWVdKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==