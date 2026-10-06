import { SettingLevel } from "./SettingLevel";
import SettingController from "./controllers/SettingController";
export interface ISetting {
    isFeature?: boolean;
    displayName?: string | {
        [level: SettingLevel]: string;
    };
    supportedLevels?: SettingLevel[];
    default: any;
    controller?: SettingController;
    supportedLevelsAreOrdered?: boolean;
    invertedSettingName?: string;
}
export declare const SETTINGS: {
    [setting: string]: ISetting;
};
