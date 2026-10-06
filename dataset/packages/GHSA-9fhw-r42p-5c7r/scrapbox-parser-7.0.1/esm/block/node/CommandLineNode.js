import { createNodeParser } from './creator';
const commandLineRegExp = /^[$%] .+$/;
const createCommandLineNode = (raw) => {
    const symbol = raw[0];
    const text = raw.substring(2);
    return {
        type: 'commandLine',
        raw,
        symbol,
        text
    };
};
export const CommandLineNodeParser = createNodeParser(createCommandLineNode, {
    parseOnNested: false,
    parseOnQuoted: false,
    patterns: [commandLineRegExp]
});
//# sourceMappingURL=CommandLineNode.js.map