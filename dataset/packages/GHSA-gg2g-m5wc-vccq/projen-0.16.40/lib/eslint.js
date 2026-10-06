"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Eslint = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const common_1 = require("./common");
const component_1 = require("./component");
const json_1 = require("./json");
const tasks_1 = require("./tasks");
/**
 * @experimental
 */
class Eslint extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _b, _c, _d, _e, _f, _g, _h;
        super(project);
        project.addDevDeps('eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint-import-resolver-node', 'eslint-import-resolver-typescript', 'eslint-plugin-import', 'json-schema');
        const dirs = [...options.dirs, ...(_b = options.devdirs) !== null && _b !== void 0 ? _b : []];
        const fileExtensions = (_c = options.fileExtensions) !== null && _c !== void 0 ? _c : ['.ts'];
        const lintProjenRc = (_d = options.lintProjenRc) !== null && _d !== void 0 ? _d : true;
        const eslint = project.addTask('eslint', {
            description: 'Runs eslint against the codebase',
            category: tasks_1.TaskCategory.TEST,
            exec: [
                'eslint',
                `--ext ${fileExtensions.join(',')}`,
                '--fix',
                '--no-error-on-unmatched-pattern',
                ...dirs,
                ...lintProjenRc ? [common_1.PROJEN_RC] : [],
            ].join(' '),
        });
        project.testTask.spawn(eslint);
        // exclude some files
        (_e = project.npmignore) === null || _e === void 0 ? void 0 : _e.exclude('/.eslintrc.json');
        this.rules = {
            // Require use of the `import { foo } from 'bar';` form instead of `import foo = require('bar');`
            '@typescript-eslint/no-require-imports': ['error'],
            // see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
            'indent': ['off'],
            '@typescript-eslint/indent': ['error', 2],
            // Style
            'quotes': ['error', 'single', { avoidEscape: true }],
            'comma-dangle': ['error', 'always-multiline'],
            'comma-spacing': ['error', { before: false, after: true }],
            'no-multi-spaces': ['error', { ignoreEOLComments: false }],
            'array-bracket-spacing': ['error', 'never'],
            'array-bracket-newline': ['error', 'consistent'],
            'object-curly-spacing': ['error', 'always'],
            'object-curly-newline': ['error', { multiline: true, consistent: true }],
            'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
            'keyword-spacing': ['error'],
            'brace-style': ['error', '1tbs', { allowSingleLine: true }],
            'space-before-blocks': ['error'],
            'curly': ['error', 'multi-line', 'consistent'],
            '@typescript-eslint/member-delimiter-style': ['error'],
            // Require all imported dependencies are actually declared in package.json
            'import/no-extraneous-dependencies': [
                'error',
                {
                    // Only allow importing devDependencies from "devdirs".
                    devDependencies: ((_f = options.devdirs) !== null && _f !== void 0 ? _f : []).map(dir => `**/${dir}/**`),
                    optionalDependencies: false,
                    peerDependencies: true,
                },
            ],
            // Require all imported libraries actually resolve (!!required for import/no-extraneous-dependencies to work!!)
            'import/no-unresolved': ['error'],
            // Require an ordering on all imports
            'import/order': ['warn', {
                    groups: ['builtin', 'external'],
                    alphabetize: { order: 'asc', caseInsensitive: true },
                }],
            // Cannot import from the same module twice
            'no-duplicate-imports': ['error'],
            // Cannot shadow names
            'no-shadow': ['off'],
            '@typescript-eslint/no-shadow': ['error'],
            // Required spacing in property declarations (copied from TSLint, defaults are good)
            'key-spacing': ['error'],
            // Require semicolons
            'semi': ['error', 'always'],
            // Don't unnecessarily quote properties
            'quote-props': ['error', 'consistent-as-needed'],
            // No multiple empty lines
            'no-multiple-empty-lines': ['error'],
            // Max line lengths
            'max-len': ['error', {
                    code: 150,
                    ignoreUrls: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                    ignoreComments: true,
                    ignoreRegExpLiterals: true,
                }],
            // One of the easiest mistakes to make
            '@typescript-eslint/no-floating-promises': ['error'],
            // Make sure that inside try/catch blocks, promises are 'return await'ed
            // (must disable the base rule as it can report incorrect errors)
            'no-return-await': ['off'],
            '@typescript-eslint/return-await': ['error'],
            // Useless diff results
            'no-trailing-spaces': ['error'],
            // Must use foo.bar instead of foo['bar'] if possible
            'dot-notation': ['error'],
            // Are you sure | is not a typo for || ?
            'no-bitwise': ['error'],
            // Member ordering
            '@typescript-eslint/member-ordering': ['error', {
                    default: [
                        'public-static-field',
                        'public-static-method',
                        'protected-static-field',
                        'protected-static-method',
                        'private-static-field',
                        'private-static-method',
                        'field',
                        // Constructors
                        'constructor',
                        // Methods
                        'method',
                    ],
                }],
        };
        // Overrides for .projenrc.js
        this.overrides = [
            {
                files: [common_1.PROJEN_RC],
                rules: {
                    '@typescript-eslint/no-require-imports': 'off',
                    'import/no-extraneous-dependencies': 'off',
                },
            },
        ];
        this.ignorePatterns = (_g = options.ignorePatterns) !== null && _g !== void 0 ? _g : [
            '*.js',
            `!${common_1.PROJEN_RC}`,
            '*.d.ts',
            'node_modules/',
            '*.generated.ts',
            'coverage',
        ];
        const tsconfig = (_h = options.tsconfigPath) !== null && _h !== void 0 ? _h : './tsconfig.json';
        this.config = {
            env: {
                jest: true,
                node: true,
            },
            root: true,
            plugins: [
                '@typescript-eslint',
                'import',
            ],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2018,
                sourceType: 'module',
                project: tsconfig,
            },
            extends: [
                'plugin:import/typescript',
            ],
            settings: {
                'import/parsers': {
                    '@typescript-eslint/parser': ['.ts', '.tsx'],
                },
                'import/resolver': {
                    node: {},
                    typescript: {
                        project: tsconfig,
                    },
                },
            },
            ignorePatterns: this.ignorePatterns,
            rules: this.rules,
            overrides: this.overrides,
        };
        new json_1.JsonFile(project, '.eslintrc.json', { obj: this.config });
    }
    /**
     * (experimental) Add an eslint rule.
     *
     * @experimental
     */
    addRules(rules) {
        for (const [k, v] of Object.entries(rules)) {
            this.rules[k] = v;
        }
    }
    /**
     * (experimental) Add an eslint override.
     *
     * @experimental
     */
    addOverride(override) {
        this.overrides.push(override);
    }
    /**
     * (experimental) Do not lint these files.
     *
     * @experimental
     */
    addIgnorePattern(pattern) {
        this.ignorePatterns.push(pattern);
    }
}
exports.Eslint = Eslint;
_a = JSII_RTTI_SYMBOL_1;
Eslint[_a] = { fqn: "projen.Eslint", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNsaW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VzbGludC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFDQUFxQztBQUNyQywyQ0FBd0M7QUFDeEMsaUNBQWtDO0FBRWxDLG1DQUF1Qzs7OztBQXlEdkMsTUFBYSxNQUFPLFNBQVEscUJBQVM7Ozs7SUFxQm5DLFlBQVksT0FBb0IsRUFBRSxPQUFzQjs7UUFDdEQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsT0FBTyxDQUFDLFVBQVUsQ0FDaEIsUUFBUSxFQUNSLGtDQUFrQyxFQUNsQywyQkFBMkIsRUFDM0IsNkJBQTZCLEVBQzdCLG1DQUFtQyxFQUNuQyxzQkFBc0IsRUFDdEIsYUFBYSxDQUNkLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFHLE9BQU8sQ0FBQyxPQUFPLG1DQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sY0FBYyxTQUFHLE9BQU8sQ0FBQyxjQUFjLG1DQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFekQsTUFBTSxZQUFZLFNBQUcsT0FBTyxDQUFDLFlBQVksbUNBQUksSUFBSSxDQUFDO1FBRWxELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLFdBQVcsRUFBRSxrQ0FBa0M7WUFDL0MsUUFBUSxFQUFFLG9CQUFZLENBQUMsSUFBSTtZQUMzQixJQUFJLEVBQUU7Z0JBQ0osUUFBUTtnQkFDUixTQUFTLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ25DLE9BQU87Z0JBQ1AsaUNBQWlDO2dCQUNqQyxHQUFHLElBQUk7Z0JBQ1AsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2FBQ25DLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNaLENB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QyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDbkI7SUFDSCxDQUFDOzs7Ozs7SUFLTSxXQUFXLENBQUMsUUFBd0I7UUFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsQ0FBQzs7Ozs7O0lBS00sZ0JBQWdCLENBQUMsT0FBZTtRQUNyQyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwQyxDQUFDOztBQXpQSCx3QkEwUEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQUk9KRU5fUkMgfSBmcm9tICcuL2NvbW1vbic7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBOb2RlUHJvamVjdCB9IGZyb20gJy4vbm9kZS1wcm9qZWN0JztcbmltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEVzbGludE9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdHNjb25maWdQYXRoPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBkaXJzOiBzdHJpbmdbXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgZGV2ZGlycz86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBmaWxlRXh0ZW5zaW9ucz86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBpZ25vcmVQYXR0ZXJucz86IHN0cmluZ1tdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgbGludFByb2plblJjPzogYm9vbGVhbjtcbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBpbnRlcmZhY2UgRXNsaW50T3ZlcnJpZGUge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBmaWxlczogc3RyaW5nW107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSBydWxlczogeyBbcnVsZTogc3RyaW5nXTogYW55IH07XG59XG5cbmV4cG9ydCBjbGFzcyBFc2xpbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBydWxlczogeyBbcnVsZTogc3RyaW5nXTogYW55W10gfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgb3ZlcnJpZGVzOiBFc2xpbnRPdmVycmlkZVtdO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBjb25maWc6IGFueTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGlnbm9yZVBhdHRlcm5zOiBzdHJpbmdbXTtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBOb2RlUHJvamVjdCwgb3B0aW9uczogRXNsaW50T3B0aW9ucykge1xuICAgIHN1cGVyKHByb2plY3QpO1xuXG4gICAgcHJvamVjdC5hZGREZXZEZXBzKFxuICAgICAgJ2VzbGludCcsXG4gICAgICAnQHR5cGVzY3JpcHQtZXNsaW50L2VzbGludC1wbHVnaW4nLFxuICAgICAgJ0B0eXBlc2NyaXB0LWVzbGludC9wYXJzZXInLFxuICAgICAgJ2VzbGludC1pbXBvcnQtcmVzb2x2ZXItbm9kZScsXG4gICAgICAnZXNsaW50LWltcG9ydC1yZXNvbHZlci10eXBlc2NyaXB0JyxcbiAgICAgICdlc2xpbnQtcGx1Z2luLWltcG9ydCcsXG4gICAgICAnanNvbi1zY2hlbWEnLFxuICAgICk7XG5cbiAgICBjb25zdCBkaXJzID0gWy4uLm9wdGlvbnMuZGlycywgLi4ub3B0aW9ucy5kZXZkaXJzID8/IFtdXTtcbiAgICBjb25zdCBmaWxlRXh0ZW5zaW9ucyA9IG9wdGlvbnMuZmlsZUV4dGVuc2lvbnMgPz8gWycudHMnXTtcblxuICAgIGNvbnN0IGxpbnRQcm9qZW5SYyA9IG9wdGlvbnMubGludFByb2plblJjID8/IHRydWU7XG5cbiAgICBjb25zdCBlc2xpbnQgPSBwcm9qZWN0LmFkZFRhc2soJ2VzbGludCcsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnUnVucyBlc2xpbnQgYWdhaW5zdCB0aGUgY29kZWJhc2UnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5URVNULFxuICAgICAgZXhlYzogW1xuICAgICAgICAnZXNsaW50JyxcbiAgICAgICAgYC0tZXh0ICR7ZmlsZUV4dGVuc2lvbnMuam9pbignLCcpfWAsXG4gICAgICAgICctLWZpeCcsXG4gICAgICAgICctLW5vLWVycm9yLW9uLXVubWF0Y2hlZC1wYXR0ZXJuJyxcbiAgICAgICAgLi4uZGlycyxcbiAgICAgICAgLi4ubGludFByb2plblJjID8gW1BST0pFTl9SQ10gOiBbXSxcbiAgICAgIF0uam9pbignICcpLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC50ZXN0VGFzay5zcGF3bihlc2xpbnQpO1xuXG4gICAgLy8gZXhjbHVkZSBzb21lIGZpbGVzXG4gICAgcHJvamVjdC5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy8uZXNsaW50cmMuanNvbicpO1xuXG4gICAgdGhpcy5ydWxlcyA9IHtcbiAgICAgIC8vIFJlcXVpcmUgdXNlIG9mIHRoZSBgaW1wb3J0IHsgZm9vIH0gZnJvbSAnYmFyJztgIGZvcm0gaW5zdGVhZCBvZiBgaW1wb3J0IGZvbyA9IHJlcXVpcmUoJ2JhcicpO2BcbiAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzJzogWydlcnJvciddLFxuXG4gICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3R5cGVzY3JpcHQtZXNsaW50L3R5cGVzY3JpcHQtZXNsaW50L2Jsb2IvbWFzdGVyL3BhY2thZ2VzL2VzbGludC1wbHVnaW4vZG9jcy9ydWxlcy9pbmRlbnQubWRcbiAgICAgICdpbmRlbnQnOiBbJ29mZiddLFxuICAgICAgJ0B0eXBlc2NyaXB0LWVzbGludC9pbmRlbnQnOiBbJ2Vycm9yJywgMl0sXG5cbiAgICAgIC8vIFN0eWxlXG4gICAgICAncXVvdGVzJzogWydlcnJvcicsICdzaW5nbGUnLCB7IGF2b2lkRXNjYXBlOiB0cnVlIH1dLFxuICAgICAgJ2NvbW1hLWRhbmdsZSc6IFsnZXJyb3InLCAnYWx3YXlzLW11bHRpbGluZSddLCAvLyBlbnN1cmVzIGNsZWFuIGRpZmZzLCBzZWUgaHR0cHM6Ly9tZWRpdW0uY29tL0BuaWtncmFmL3doeS15b3Utc2hvdWxkLWVuZm9yY2UtZGFuZ2xpbmctY29tbWFzLWZvci1tdWx0aWxpbmUtc3RhdGVtZW50cy1kMDM0Yzk4ZTM2ZjhcbiAgICAgICdjb21tYS1zcGFjaW5nJzogWydlcnJvcicsIHsgYmVmb3JlOiBmYWxzZSwgYWZ0ZXI6IHRydWUgfV0sIC8vIHNwYWNlIGFmdGVyLCBubyBzcGFjZSBiZWZvcmVcbiAgICAgICduby1tdWx0aS1zcGFjZXMnOiBbJ2Vycm9yJywgeyBpZ25vcmVFT0xDb21tZW50czogZmFsc2UgfV0sIC8vIG5vIG11bHRpIHNwYWNlc1xuICAgICAgJ2FycmF5LWJyYWNrZXQtc3BhY2luZyc6IFsnZXJyb3InLCAnbmV2ZXInXSwgLy8gWzEsIDIsIDNdXG4gICAgICAnYXJyYXktYnJhY2tldC1uZXdsaW5lJzogWydlcnJvcicsICdjb25zaXN0ZW50J10sIC8vIGVuZm9yY2UgY29uc2lzdGVudCBsaW5lIGJyZWFrcyBiZXR3ZWVuIGJyYWNrZXRzXG4gICAgICAnb2JqZWN0LWN1cmx5LXNwYWNpbmcnOiBbJ2Vycm9yJywgJ2Fsd2F5cyddLCAvLyB7IGtleTogJ3ZhbHVlJyB9XG4gICAgICAnb2JqZWN0LWN1cmx5LW5ld2xpbmUnOiBbJ2Vycm9yJywgeyBtdWx0aWxpbmU6IHRydWUsIGNvbnNpc3RlbnQ6IHRydWUgfV0sIC8vIGVuZm9yY2UgY29uc2lzdGVudCBsaW5lIGJyZWFrcyBiZXR3ZWVuIGJyYWNlc1xuICAgICAgJ29iamVjdC1wcm9wZXJ0eS1uZXdsaW5lJzogWydlcnJvcicsIHsgYWxsb3dBbGxQcm9wZXJ0aWVzT25TYW1lTGluZTogdHJ1ZSB9XSwgLy8gZW5mb3JjZSBcInNhbWUgbGluZVwiIG9yIFwibXVsdGlwbGUgbGluZVwiIG9uIG9iamVjdCBwcm9wZXJ0aWVzXG4gICAgICAna2V5d29yZC1zcGFjaW5nJzogWydlcnJvciddLCAvLyByZXF1aXJlIGEgc3BhY2UgYmVmb3JlICYgYWZ0ZXIga2V5d29yZHNcbiAgICAgICdicmFjZS1zdHlsZSc6IFsnZXJyb3InLCAnMXRicycsIHsgYWxsb3dTaW5nbGVMaW5lOiB0cnVlIH1dLCAvLyBlbmZvcmNlIG9uZSB0cnVlIGJyYWNlIHN0eWxlXG4gICAgICAnc3BhY2UtYmVmb3JlLWJsb2Nrcyc6IFsnZXJyb3InXSwgLy8gcmVxdWlyZSBzcGFjZSBiZWZvcmUgYmxvY2tzXG4gICAgICAnY3VybHknOiBbJ2Vycm9yJywgJ211bHRpLWxpbmUnLCAnY29uc2lzdGVudCddLCAvLyByZXF1aXJlIGN1cmx5IGJyYWNlcyBmb3IgbXVsdGlsaW5lIGNvbnRyb2wgc3RhdGVtZW50c1xuICAgICAgJ0B0eXBlc2NyaXB0LWVzbGludC9tZW1iZXItZGVsaW1pdGVyLXN0eWxlJzogWydlcnJvciddLFxuXG4gICAgICAvLyBSZXF1aXJlIGFsbCBpbXBvcnRlZCBkZXBlbmRlbmNpZXMgYXJlIGFjdHVhbGx5IGRlY2xhcmVkIGluIHBhY2thZ2UuanNvblxuICAgICAgJ2ltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyc6IFtcbiAgICAgICAgJ2Vycm9yJyxcbiAgICAgICAge1xuICAgICAgICAgIC8vIE9ubHkgYWxsb3cgaW1wb3J0aW5nIGRldkRlcGVuZGVuY2llcyBmcm9tIFwiZGV2ZGlyc1wiLlxuICAgICAgICAgIGRldkRlcGVuZGVuY2llczogKG9wdGlvbnMuZGV2ZGlycyA/PyBbXSkubWFwKGRpciA9PiBgKiovJHtkaXJ9LyoqYCksXG4gICAgICAgICAgb3B0aW9uYWxEZXBlbmRlbmNpZXM6IGZhbHNlLCAvLyBEaXNhbGxvdyBpbXBvcnRpbmcgb3B0aW9uYWwgZGVwZW5kZW5jaWVzICh0aG9zZSBzaG91bGRuJ3QgYmUgaW4gdXNlIGluIHRoZSBwcm9qZWN0KVxuICAgICAgICAgIHBlZXJEZXBlbmRlbmNpZXM6IHRydWUsIC8vIEFsbG93IGltcG9ydGluZyBwZWVyIGRlcGVuZGVuY2llcyAodGhhdCBhcmVuJ3QgYWxzbyBkaXJlY3QgZGVwZW5kZW5jaWVzKVxuICAgICAgICB9LFxuICAgICAgXSxcblxuICAgICAgLy8gUmVxdWlyZSBhbGwgaW1wb3J0ZWQgbGlicmFyaWVzIGFjdHVhbGx5IHJlc29sdmUgKCEhcmVxdWlyZWQgZm9yIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyB0byB3b3JrISEpXG4gICAgICAnaW1wb3J0L25vLXVucmVzb2x2ZWQnOiBbJ2Vycm9yJ10sXG5cbiAgICAgIC8vIFJlcXVpcmUgYW4gb3JkZXJpbmcgb24gYWxsIGltcG9ydHNcbiAgICAgICdpbXBvcnQvb3JkZXInOiBbJ3dhcm4nLCB7XG4gICAgICAgIGdyb3VwczogWydidWlsdGluJywgJ2V4dGVybmFsJ10sXG4gICAgICAgIGFscGhhYmV0aXplOiB7IG9yZGVyOiAnYXNjJywgY2FzZUluc2Vuc2l0aXZlOiB0cnVlIH0sXG4gICAgICB9XSxcblxuICAgICAgLy8gQ2Fubm90IGltcG9ydCBmcm9tIHRoZSBzYW1lIG1vZHVsZSB0d2ljZVxuICAgICAgJ25vLWR1cGxpY2F0ZS1pbXBvcnRzJzogWydlcnJvciddLFxuXG4gICAgICAvLyBDYW5ub3Qgc2hhZG93IG5hbWVzXG4gICAgICAnbm8tc2hhZG93JzogWydvZmYnXSxcbiAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tc2hhZG93JzogWydlcnJvciddLFxuXG4gICAgICAvLyBSZXF1aXJlZCBzcGFjaW5nIGluIHByb3BlcnR5IGRlY2xhcmF0aW9ucyAoY29waWVkIGZyb20gVFNMaW50LCBkZWZhdWx0cyBhcmUgZ29vZClcbiAgICAgICdrZXktc3BhY2luZyc6IFsnZXJyb3InXSxcblxuICAgICAgLy8gUmVxdWlyZSBzZW1pY29sb25zXG4gICAgICAnc2VtaSc6IFsnZXJyb3InLCAnYWx3YXlzJ10sXG5cbiAgICAgIC8vIERvbid0IHVubmVjZXNzYXJpbHkgcXVvdGUgcHJvcGVydGllc1xuICAgICAgJ3F1b3RlLXByb3BzJzogWydlcnJvcicsICdjb25zaXN0ZW50LWFzLW5lZWRlZCddLFxuXG4gICAgICAvLyBObyBtdWx0aXBsZSBlbXB0eSBsaW5lc1xuICAgICAgJ25vLW11bHRpcGxlLWVtcHR5LWxpbmVzJzogWydlcnJvciddLFxuXG4gICAgICAvLyBNYXggbGluZSBsZW5ndGhzXG4gICAgICAnbWF4LWxlbic6IFsnZXJyb3InLCB7XG4gICAgICAgIGNvZGU6IDE1MCxcbiAgICAgICAgaWdub3JlVXJsczogdHJ1ZSwgLy8gTW9zdCBjb21tb24gcmVhc29uIHRvIGRpc2FibGUgaXRcbiAgICAgICAgaWdub3JlU3RyaW5nczogdHJ1ZSwgLy8gVGhlc2UgYXJlIG5vdCBmYW50YXN0aWMgYnV0IG5lY2Vzc2FyeSBmb3IgZXJyb3IgbWVzc2FnZXNcbiAgICAgICAgaWdub3JlVGVtcGxhdGVMaXRlcmFsczogdHJ1ZSxcbiAgICAgICAgaWdub3JlQ29tbWVudHM6IHRydWUsXG4gICAgICAgIGlnbm9yZVJlZ0V4cExpdGVyYWxzOiB0cnVlLFxuICAgICAgfV0sXG5cbiAgICAgIC8vIE9uZSBvZiB0aGUgZWFzaWVzdCBtaXN0YWtlcyB0byBtYWtlXG4gICAgICAnQHR5cGVzY3JpcHQtZXNsaW50L25vLWZsb2F0aW5nLXByb21pc2VzJzogWydlcnJvciddLFxuXG4gICAgICAvLyBNYWtlIHN1cmUgdGhhdCBpbnNpZGUgdHJ5L2NhdGNoIGJsb2NrcywgcHJvbWlzZXMgYXJlICdyZXR1cm4gYXdhaXQnZWRcbiAgICAgIC8vIChtdXN0IGRpc2FibGUgdGhlIGJhc2UgcnVsZSBhcyBpdCBjYW4gcmVwb3J0IGluY29ycmVjdCBlcnJvcnMpXG4gICAgICAnbm8tcmV0dXJuLWF3YWl0JzogWydvZmYnXSxcbiAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvcmV0dXJuLWF3YWl0JzogWydlcnJvciddLFxuXG4gICAgICAvLyBVc2VsZXNzIGRpZmYgcmVzdWx0c1xuICAgICAgJ25vLXRyYWlsaW5nLXNwYWNlcyc6IFsnZXJyb3InXSxcblxuICAgICAgLy8gTXVzdCB1c2UgZm9vLmJhciBpbnN0ZWFkIG9mIGZvb1snYmFyJ10gaWYgcG9zc2libGVcbiAgICAgICdkb3Qtbm90YXRpb24nOiBbJ2Vycm9yJ10sXG5cbiAgICAgIC8vIEFyZSB5b3Ugc3VyZSB8IGlzIG5vdCBhIHR5cG8gZm9yIHx8ID9cbiAgICAgICduby1iaXR3aXNlJzogWydlcnJvciddLFxuXG4gICAgICAvLyBNZW1iZXIgb3JkZXJpbmdcbiAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbWVtYmVyLW9yZGVyaW5nJzogWydlcnJvcicsIHtcbiAgICAgICAgZGVmYXVsdDogW1xuICAgICAgICAgICdwdWJsaWMtc3RhdGljLWZpZWxkJyxcbiAgICAgICAgICAncHVibGljLXN0YXRpYy1tZXRob2QnLFxuICAgICAgICAgICdwcm90ZWN0ZWQtc3RhdGljLWZpZWxkJyxcbiAgICAgICAgICAncHJvdGVjdGVkLXN0YXRpYy1tZXRob2QnLFxuICAgICAgICAgICdwcml2YXRlLXN0YXRpYy1maWVsZCcsXG4gICAgICAgICAgJ3ByaXZhdGUtc3RhdGljLW1ldGhvZCcsXG5cbiAgICAgICAgICAnZmllbGQnLFxuXG4gICAgICAgICAgLy8gQ29uc3RydWN0b3JzXG4gICAgICAgICAgJ2NvbnN0cnVjdG9yJywgLy8gPSBbXCJwdWJsaWMtY29uc3RydWN0b3JcIiwgXCJwcm90ZWN0ZWQtY29uc3RydWN0b3JcIiwgXCJwcml2YXRlLWNvbnN0cnVjdG9yXCJdXG5cbiAgICAgICAgICAvLyBNZXRob2RzXG4gICAgICAgICAgJ21ldGhvZCcsXG4gICAgICAgIF0sXG4gICAgICB9XSxcbiAgICB9O1xuXG4gICAgLy8gT3ZlcnJpZGVzIGZvciAucHJvamVucmMuanNcbiAgICB0aGlzLm92ZXJyaWRlcyA9IFtcbiAgICAgIHtcbiAgICAgICAgZmlsZXM6IFtQUk9KRU5fUkNdLFxuICAgICAgICBydWxlczoge1xuICAgICAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzJzogJ29mZicsXG4gICAgICAgICAgJ2ltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyc6ICdvZmYnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgdGhpcy5pZ25vcmVQYXR0ZXJucyA9IG9wdGlvbnMuaWdub3JlUGF0dGVybnMgPz8gW1xuICAgICAgJyouanMnLFxuICAgICAgYCEke1BST0pFTl9SQ31gLFxuICAgICAgJyouZC50cycsXG4gICAgICAnbm9kZV9tb2R1bGVzLycsXG4gICAgICAnKi5nZW5lcmF0ZWQudHMnLFxuICAgICAgJ2NvdmVyYWdlJyxcbiAgICBdO1xuXG4gICAgY29uc3QgdHNjb25maWcgPSBvcHRpb25zLnRzY29uZmlnUGF0aCA/PyAnLi90c2NvbmZpZy5qc29uJztcblxuICAgIHRoaXMuY29uZmlnID0ge1xuICAgICAgZW52OiB7XG4gICAgICAgIGplc3Q6IHRydWUsXG4gICAgICAgIG5vZGU6IHRydWUsXG4gICAgICB9LFxuICAgICAgcm9vdDogdHJ1ZSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgJ0B0eXBlc2NyaXB0LWVzbGludCcsXG4gICAgICAgICdpbXBvcnQnLFxuICAgICAgXSxcbiAgICAgIHBhcnNlcjogJ0B0eXBlc2NyaXB0LWVzbGludC9wYXJzZXInLFxuICAgICAgcGFyc2VyT3B0aW9uczoge1xuICAgICAgICBlY21hVmVyc2lvbjogMjAxOCxcbiAgICAgICAgc291cmNlVHlwZTogJ21vZHVsZScsXG4gICAgICAgIHByb2plY3Q6IHRzY29uZmlnLFxuICAgICAgfSxcbiAgICAgIGV4dGVuZHM6IFtcbiAgICAgICAgJ3BsdWdpbjppbXBvcnQvdHlwZXNjcmlwdCcsXG4gICAgICBdLFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgJ2ltcG9ydC9wYXJzZXJzJzoge1xuICAgICAgICAgICdAdHlwZXNjcmlwdC1lc2xpbnQvcGFyc2VyJzogWycudHMnLCAnLnRzeCddLFxuICAgICAgICB9LFxuICAgICAgICAnaW1wb3J0L3Jlc29sdmVyJzoge1xuICAgICAgICAgIG5vZGU6IHt9LFxuICAgICAgICAgIHR5cGVzY3JpcHQ6IHtcbiAgICAgICAgICAgIHByb2plY3Q6IHRzY29uZmlnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgaWdub3JlUGF0dGVybnM6IHRoaXMuaWdub3JlUGF0dGVybnMsXG4gICAgICBydWxlczogdGhpcy5ydWxlcyxcbiAgICAgIG92ZXJyaWRlczogdGhpcy5vdmVycmlkZXMsXG4gICAgfTtcblxuICAgIG5ldyBKc29uRmlsZShwcm9qZWN0LCAnLmVzbGludHJjLmpzb24nLCB7IG9iajogdGhpcy5jb25maWcgfSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRSdWxlcyhydWxlczogeyBbcnVsZTogc3RyaW5nXTogYW55IH0pIHtcbiAgICBmb3IgKGNvbnN0IFtrLCB2XSBvZiBPYmplY3QuZW50cmllcyhydWxlcykpIHtcbiAgICAgIHRoaXMucnVsZXNba10gPSB2O1xuICAgIH1cbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBhZGRPdmVycmlkZShvdmVycmlkZTogRXNsaW50T3ZlcnJpZGUpIHtcbiAgICB0aGlzLm92ZXJyaWRlcy5wdXNoKG92ZXJyaWRlKTtcbiAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgYWRkSWdub3JlUGF0dGVybihwYXR0ZXJuOiBzdHJpbmcpIHtcbiAgICB0aGlzLmlnbm9yZVBhdHRlcm5zLnB1c2gocGF0dGVybik7XG4gIH1cbn1cbiJdfQ==