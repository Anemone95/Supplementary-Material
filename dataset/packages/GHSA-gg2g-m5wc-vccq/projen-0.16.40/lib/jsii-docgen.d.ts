import { JsiiProject } from './jsii-project';
/**
 * Creates an API.md file based on the jsii manifest:
 * - Adds a `docgen` script to package.json
 * - Runs `jsii-docgen` after compilation
 * - Enforces that API.md is checked in
 */
export declare class JsiiDocgen {
    constructor(project: JsiiProject);
}
