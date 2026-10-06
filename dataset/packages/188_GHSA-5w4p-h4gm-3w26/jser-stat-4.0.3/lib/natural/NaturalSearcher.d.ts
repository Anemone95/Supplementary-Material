import { JSerItem } from "../models/JSerItem";
export default class NaturalSearcher {
    private items;
    private tfidf;
    constructor(items: JSerItem[]);
    addItemsAsDocuments(items: JSerItem[]): void;
    /**
     *
     * @param {JSerItem} targetItem
     * @param {number} limit
     */
    findRelatedItems(targetItem: JSerItem, limit: number): JSerItem[];
}
