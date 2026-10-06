export declare class JSerItem {
    title: string;
    url: string;
    content: string;
    tags: string[];
    date: Date;
    relatedLinks: {
        title: string;
        url: string;
    }[];
    constructor(item: any);
    /**
     * @param {JSerItem} item
     * @returns {boolean}
     */
    isEqualItem(item: JSerItem): boolean;
}
