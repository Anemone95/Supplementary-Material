import { Project } from './project';
/**
 * (experimental) Represents a project component.
 *
 * @experimental
 */
export declare class Component {
    readonly project: Project;
    /**
     * @experimental
     */
    constructor(project: Project);
    /**
     * (experimental) Called before synthesis.
     *
     * @experimental
     */
    preSynthesize(): void;
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize(): void;
    /**
     * (experimental) Called after synthesis.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize(): void;
}
