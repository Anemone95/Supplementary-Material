export interface ProjectOption {
    path: string[];
    name: string;
    switch: string;
    type: string;
    parent: string;
    docs?: string;
    default?: string;
    optional?: boolean;
    deprecated?: boolean;
}
export interface ProjectType {
    moduleName: string;
    pjid: string;
    fqn: string;
    typename: string;
    options: ProjectOption[];
    docs?: string;
    docsurl: string;
}
/**
 * Returns a list of project types exported the modules defined in `moduleDirs`.
 * This list will always also include the built-in projen project types.
 * Modules without a .jsii manifest are skipped.
 *
 * @param moduleDirs A list of npm module directories
 */
export declare function discover(...moduleDirs: string[]): ProjectType[];
