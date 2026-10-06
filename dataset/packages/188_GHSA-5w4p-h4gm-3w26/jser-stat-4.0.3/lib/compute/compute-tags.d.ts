import { JSerWeek } from "../models/JSerWeek";
/**
 * {タグ名:出現回数}のオブジェクトを返す
 * @param {JSerWeek[]} weeks
 * @returns {{string:number}}
 */
export declare function countTagsByGroup(weeks: JSerWeek[]): {
    [index: string]: number;
};
export declare function countByGroup(weeks: JSerWeek[], countFn: any): {
    [index: string]: number;
};
