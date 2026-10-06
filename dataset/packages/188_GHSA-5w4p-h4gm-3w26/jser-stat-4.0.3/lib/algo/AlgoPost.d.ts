import { JSerPost } from "../models/JSerPost";
export default class AlgoPost {
    private posts;
    private postTimeIndex;
    /**
     *
     * @param {JSerPost[]} posts
     */
    constructor(posts: JSerPost[]);
    /**
     *
     * @param {Date} beginDate
     * @param {Date} endDate
     * @returns {JSerPost[]}
     */
    findPostsBetween(beginDate: Date, endDate: Date): JSerPost[];
}
