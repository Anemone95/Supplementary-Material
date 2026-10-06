import { JSerPost } from "./JSerPost";
import { AlgoItem } from "../algo/AlgoItem";
import { JSerItem } from "./JSerItem";
export declare class JSerWeek {
    weekNumber: number;
    beginDate: Date;
    endDate: Date;
    post: JSerPost;
    private _items;
    private _algoItem;
    constructor(currentPost: JSerPost, prevPost: JSerPost, algoItem: AlgoItem);
    readonly items: JSerItem[];
}
