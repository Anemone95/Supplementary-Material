import * as yargs from 'yargs';
import { TaskRuntime } from '../tasks';
/**
 * Reads .projen/tasks.json and adds CLI commands for all tasks.
 * @param ya yargs
 */
export declare function discoverTaskCommands(runtime: TaskRuntime, ya: yargs.Argv): void;
