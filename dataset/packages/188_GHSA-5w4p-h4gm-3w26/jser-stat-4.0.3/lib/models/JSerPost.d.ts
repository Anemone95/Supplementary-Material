export declare class JSerPost {
    postNumber: number;
    /** @type {string} */
    title: string;
    /** @type {string} */
    url: string;
    /** @type {string} */
    content: string;
    /** @type {string} */
    category: string;
    /** @type {Date} */
    date: Date;
    /** @type {string[]} */
    tags: string[];
    constructor(number: number, post: any);
}
