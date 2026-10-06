"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitCmdClient = void 0;
const child_process_1 = require("child_process");
class GitCmdClient {
    constructor() {
        this._revParseHash = {};
    }
    currentName() {
        return child_process_1.execSync('git branch | grep "^\\*" | cut -b 3-', { encoding: "utf8" });
    }
    revParse(currentName) {
        if (!this._revParseHash[currentName]) {
            this._revParseHash[currentName] = child_process_1.execSync(`git rev-parse "${currentName}"`, { encoding: "utf8" });
        }
        return this._revParseHash[currentName];
    }
    branches() {
        return child_process_1.execSync("git branch -a", { encoding: "utf8" });
    }
    containedBranches(hash) {
        return child_process_1.execSync(`git branch -a --contains ${hash}`, { encoding: "utf8" });
    }
    logTime(hash) {
        return child_process_1.execSync(`git log --pretty=%ci -n 1 ${hash}`, { encoding: "utf8" });
    }
    logBetween(a, b) {
        return child_process_1.execSync(`git log --oneline ${a}..${b}`, { encoding: "utf8" });
    }
    logGraph() {
        return child_process_1.execSync('git log -n 300 --graph --pretty=format:"%h %p"', { encoding: "utf8" });
    }
    mergeBase(a, b) {
        return child_process_1.execSync(`git merge-base -a ${a} ${b}`, { encoding: "utf8" });
    }
}
exports.GitCmdClient = GitCmdClient;
//# sourceMappingURL=git-cmd-client.js.map