import { JSerItem } from "../models/JSerItem";
export declare class AlgoItem {
    private items;
    private itemTimes;
    /**
     *
     * @param {JSerItem[]} items
     */
    constructor(items: JSerItem[]);
    /**
     *
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerItem[]}
     */
    findItemsBetween(beginDate: Date, endDate: Date): JSerItem[];
}
