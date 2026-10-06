"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function style() {
    return [
        { name: 'mermaid.min.js' },
        { name: 'mermaid_render.js' },
        {
            inline: true,
            // Note: Mermaid is buggy when rendering below a certain width (500px?)
            // so set an arbitrarily high width here for the container. Once the
            // diagram is rendered it will be reset to 100% in mermaid_render.js
            text: '.mermaid { background-color: white; width: 640px; }',
            mime: 'text/css',
        },
    ];
}
function addContextAssets(context) {
    if ('mermaid' in context.pluginAssets)
        return;
    context.pluginAssets['mermaid'] = style();
}
// @ts-ignore: Keep the function signature as-is despite unusued arguments
function installRule(markdownIt, mdOptions, ruleOptions, context) {
    const defaultRender = markdownIt.renderer.rules.fence || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options, env, self);
    };
    markdownIt.renderer.rules.fence = function (tokens, idx, options, env, self) {
        const token = tokens[idx];
        if (token.info !== 'mermaid')
            return defaultRender(tokens, idx, options, env, self);
        addContextAssets(context);
        const contentHtml = markdownIt.utils.escapeHtml(token.content);
        return `
			<div class="joplin-editable">
				<pre class="joplin-source" data-joplin-language="mermaid" data-joplin-source-open="\`\`\`mermaid&#10;" data-joplin-source-close="&#10;\`\`\`&#10;">${contentHtml}</pre>
				<div class="mermaid">${contentHtml}</div>
			</div>
		`;
    };
}
exports.default = {
    install: function (context, ruleOptions) {
        return function (md, mdOptions) {
            installRule(md, mdOptions, ruleOptions, context);
        };
    },
    style: style,
};
//# sourceMappingURL=mermaid.js.map