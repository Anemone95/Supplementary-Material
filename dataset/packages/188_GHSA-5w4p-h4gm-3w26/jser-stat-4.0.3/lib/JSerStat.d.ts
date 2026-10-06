import { JSerItem } from "./models/JSerItem";
import { JSerPost } from "./models/JSerPost";
import { JSerWeek } from "./models/JSerWeek";
export declare class JSerStat {
    private _rawItems;
    private _rawPosts;
    items: JSerItem[];
    posts: JSerPost[];
    private _weeks;
    private _algoItem;
    private _algoPost;
    private naturalSearch;
    constructor(rawItems: any[], rawPosts: any[]);
    /**
     * 全部で何週あるかを返す(投稿記事の数と一致)
     * @returns {number}
     */
    getTotalWeekCount(): number;
    /**
     * beginからendの範囲のJSerItemの配列を返す
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerItem[]}
     */
    findItemsBetween(beginDate: Date, endDate: Date): JSerItem[];
    getItemsBetWeen(beginDate: Date, endDate: Date): JSerItem[];
    /**
     * 全てのJSerWeekの配列を返す
     * @returns {JSerWeek[]}
     */
    getJSerWeeks(): JSerWeek[];
    /**
     * beginからendの範囲に含まれるJSerWeekの配列を返す
     * JSerWeek#beginDate または JSerWeek#endDate どちらかがかかれば含まれると判断される
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerWeek[]}
     */
    findJSerWeeksBetween(beginDate: Date, endDate: Date): JSerWeek[];
    getJSerWeeksBetWeen(beginDate: Date, endDate: Date): JSerWeek[];
    /**
     * JSer.info #xxx を返す
     * @param {number} number number start with 1
     * @returns {JSerWeek}
     */
    findJSerWeek(number: number): JSerWeek | null;
    /**
     * `postURL`に一致するJSerWeekを返す
     * @param {string} postURL
     * @returns {JSerWeek|undefined}
     */
    findJSerWeekWithURL(postURL: string): JSerWeek | undefined;
    getJSerWeek(number: number): JSerWeek | null;
    /**
     * JSerItemを含んでいるJSerWeekを検索して返す.
     * @param {Object} jserItem the jserItem is raw object for JSerItem
     * @return {JSerWeek|null} The week contain this jserItem.
     * 未来の記事などJSerWeekに所属していない場合もある
     */
    findWeekWithItem(jserItem: any): JSerWeek | undefined;
    /**
     * URLとマッチするJSerItemを返す
     * @param {string} URL
     * @return {JSerItem}
     */
    findItemWithURL(URL: string): JSerItem | undefined;
    /**
     * `item` と関連するJSerItemの配列を返す
     * @param {JSerItem} item
     * @param {number} limit
     * @returns {JSerItem[]}
     */
    findRelatedItems(item: JSerItem, limit?: number): any;
}
