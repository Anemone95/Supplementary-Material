"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsiiDocgen = void 0;
const tasks_1 = require("./tasks");
/**
 * Creates an API.md file based on the jsii manifest:
 * - Adds a `docgen` script to package.json
 * - Runs `jsii-docgen` after compilation
 * - Enforces that API.md is checked in
 */
class JsiiDocgen {
    constructor(project) {
        project.addDevDeps('jsii-docgen');
        const docgen = project.addTask('docgen', {
            description: 'Generate API.md from .jsii manifest',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'jsii-docgen',
        });
        project.compileTask.spawn(docgen);
        project.gitignore.include('/API.md');
    }
}
exports.JsiiDocgen = JsiiDocgen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNpaS1kb2NnZW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvanNpaS1kb2NnZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQXVDO0FBRXZDOzs7OztHQUtHO0FBQ0gsTUFBYSxVQUFVO0lBQ3JCLFlBQVksT0FBb0I7UUFDOUIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVsQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtZQUN2QyxXQUFXLEVBQUUscUNBQXFDO1lBQ2xELFFBQVEsRUFBRSxvQkFBWSxDQUFDLE9BQU87WUFDOUIsSUFBSSxFQUFFLGFBQWE7U0FDcEIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkMsQ0FBQztDQUNGO0FBYkQsZ0NBYUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBKc2lpUHJvamVjdCB9IGZyb20gJy4vanNpaS1wcm9qZWN0JztcbmltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gQVBJLm1kIGZpbGUgYmFzZWQgb24gdGhlIGpzaWkgbWFuaWZlc3Q6XG4gKiAtIEFkZHMgYSBgZG9jZ2VuYCBzY3JpcHQgdG8gcGFja2FnZS5qc29uXG4gKiAtIFJ1bnMgYGpzaWktZG9jZ2VuYCBhZnRlciBjb21waWxhdGlvblxuICogLSBFbmZvcmNlcyB0aGF0IEFQSS5tZCBpcyBjaGVja2VkIGluXG4gKi9cbmV4cG9ydCBjbGFzcyBKc2lpRG9jZ2VuIHtcbiAgY29uc3RydWN0b3IocHJvamVjdDogSnNpaVByb2plY3QpIHtcbiAgICBwcm9qZWN0LmFkZERldkRlcHMoJ2pzaWktZG9jZ2VuJyk7XG5cbiAgICBjb25zdCBkb2NnZW4gPSBwcm9qZWN0LmFkZFRhc2soJ2RvY2dlbicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgQVBJLm1kIGZyb20gLmpzaWkgbWFuaWZlc3QnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ2pzaWktZG9jZ2VuJyxcbiAgICB9KTtcblxuICAgIHByb2plY3QuY29tcGlsZVRhc2suc3Bhd24oZG9jZ2VuKTtcbiAgICBwcm9qZWN0LmdpdGlnbm9yZS5pbmNsdWRlKCcvQVBJLm1kJyk7XG4gIH1cbn0iXX0=