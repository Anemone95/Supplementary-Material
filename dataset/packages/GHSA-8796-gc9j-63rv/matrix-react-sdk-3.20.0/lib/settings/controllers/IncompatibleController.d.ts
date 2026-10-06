import SettingController from "./SettingController";
import { SettingLevel } from "../SettingLevel";
/**
 * Enforces that a boolean setting cannot be enabled if the incompatible setting
 * is also enabled, to prevent cascading undefined behaviour between conflicting
 * labs flags.
 */
export default class IncompatibleController extends SettingController {
    private settingName;
    private forcedValue;
    constructor(settingName: string, forcedValue?: boolean);
    getValueOverride(level: SettingLevel, roomId: string, calculatedValue: any, calculatedAtLevel: SettingLevel): any;
    get incompatibleSettingEnabled(): boolean;
}
