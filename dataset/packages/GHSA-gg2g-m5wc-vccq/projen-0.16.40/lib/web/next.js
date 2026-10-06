"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextComponent = exports.NextJsTypeDef = exports.NextJsTypeScriptProject = exports.NextJsProject = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const file_1 = require("../file");
const node_project_1 = require("../node-project");
const sample_file_1 = require("../sample-file");
const tasks_1 = require("../tasks");
const typescript_1 = require("../typescript");
const util_1 = require("../util");
const postcss_1 = require("./postcss");
/**
 * (experimental) Next.js project without TypeScript.
 *
 * @experimental
 * @pjid nextjs
 */
class NextJsProject extends node_project_1.NodeProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _e, _f, _g, _h;
        super({
            jest: false,
            ...options,
        });
        this.srcdir = (_e = options.srcdir) !== null && _e !== void 0 ? _e : 'pages';
        this.assetsdir = (_f = options.assetsdir) !== null && _f !== void 0 ? _f : 'public';
        this.tailwind = (_g = options.tailwind) !== null && _g !== void 0 ? _g : true;
        new NextComponent(this, { typescript: false, tailwind: options.tailwind });
        // generate sample code in `pages` and `public` if these directories are empty or non-existent.
        if ((_h = options.sampleCode) !== null && _h !== void 0 ? _h : true) {
            new NextSampleCode(this, {
                fileExt: 'js',
                srcdir: this.srcdir,
                assetsdir: this.assetsdir,
                tailwind: this.tailwind,
            });
        }
    }
}
exports.NextJsProject = NextJsProject;
_a = JSII_RTTI_SYMBOL_1;
NextJsProject[_a] = { fqn: "projen.web.NextJsProject", version: "0.16.40" };
/**
 * (experimental) Next.js project with TypeScript.
 *
 * @experimental
 * @pjid nextjs-ts
 */
class NextJsTypeScriptProject extends typescript_1.TypeScriptAppProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _e, _f, _g, _h;
        const defaultOptions = {
            srcdir: 'pages',
            eslint: false,
            jest: false,
            tsconfig: {
                include: ['**/*.ts', '**/*.tsx'],
                compilerOptions: {
                    // required by Next.js
                    esModuleInterop: true,
                    module: 'esnext',
                    moduleResolution: typescript_1.TypeScriptModuleResolution.NODE,
                    isolatedModules: true,
                    resolveJsonModule: true,
                    jsx: typescript_1.TypeScriptJsxMode.PRESERVE,
                    // recommended by Next.js
                    allowJs: true,
                    skipLibCheck: true,
                    forceConsistentCasingInFileNames: true,
                    noEmit: true,
                    lib: ['dom', 'dom.iterable', 'esnext'],
                    strict: false,
                    target: 'es5',
                },
            },
        };
        // never generate default TypeScript sample code, since this class provides its own
        super(util_1.deepMerge([defaultOptions, options, { sampleCode: false }]));
        this.srcdir = (_e = options.srcdir) !== null && _e !== void 0 ? _e : 'pages';
        this.assetsdir = (_f = options.assetsdir) !== null && _f !== void 0 ? _f : 'public';
        this.tailwind = (_g = options.tailwind) !== null && _g !== void 0 ? _g : true;
        new NextComponent(this, { typescript: true, tailwind: this.tailwind });
        // 'next build' command fails if tsconfig.json is immutable
        if (this.tsconfig) {
            this.tsconfig.file.readonly = false;
        }
        this.nextJsTypeDef = new NextJsTypeDef(this, 'next-env.d.ts');
        // generate sample code in `pages` and `public` if these directories are empty or non-existent.
        if ((_h = options.sampleCode) !== null && _h !== void 0 ? _h : true) {
            new NextSampleCode(this, {
                fileExt: 'tsx',
                srcdir: this.srcdir,
                assetsdir: this.assetsdir,
                tailwind: this.tailwind,
            });
        }
    }
}
exports.NextJsTypeScriptProject = NextJsTypeScriptProject;
_b = JSII_RTTI_SYMBOL_1;
NextJsTypeScriptProject[_b] = { fqn: "projen.web.NextJsTypeScriptProject", version: "0.16.40" };
/**
 * @experimental
 */
class NextJsTypeDef extends file_1.FileBase {
    /**
     * @experimental
     */
    constructor(project, filePath, options = {}) {
        super(project, filePath, options);
    }
    /**
     * (experimental) Implemented by derived classes and returns the contents of the file to emit.
     *
     * @experimental
     */
    synthesizeContent(_) {
        return [
            '/// <reference types="next" />',
            '/// <reference types="next/types/global" />',
        ].join('\n');
    }
}
exports.NextJsTypeDef = NextJsTypeDef;
_c = JSII_RTTI_SYMBOL_1;
NextJsTypeDef[_c] = { fqn: "projen.web.NextJsTypeDef", version: "0.16.40" };
/**
 * @experimental
 */
class NextComponent extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _e, _f, _g;
        super(project);
        this.typescript = (_e = options.typescript) !== null && _e !== void 0 ? _e : false;
        this.tailwind = (_f = options.tailwind) !== null && _f !== void 0 ? _f : true;
        project.addDeps('next', 'react', 'react-dom');
        if (this.typescript) {
            project.addDevDeps('@types/react', '@types/react-dom');
        }
        if (this.tailwind) {
            new postcss_1.PostCss(project, { tailwind: true });
        }
        // NextJS CLI commands, see: https://nextjs.org/docs/api-reference/cli
        project.addTask('dev', {
            description: 'Starts the Next.js application in development mode',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'next dev',
        });
        project.addTask('build', {
            description: 'Creates an optimized production build of your Next.js application',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'next build',
        });
        project.addTask('server', {
            description: 'Starts the Next.js application in production mode',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'next start',
        });
        project.addTask('telemetry', {
            description: 'Checks the status of Next.js telemetry collection',
            category: tasks_1.TaskCategory.MISC,
            exec: 'next telemetry',
        });
        (_g = project.npmignore) === null || _g === void 0 ? void 0 : _g.exclude('# Next.js', '/.next/');
        project.gitignore.exclude('# Next.js', '/.next/');
    }
}
exports.NextComponent = NextComponent;
_d = JSII_RTTI_SYMBOL_1;
NextComponent[_d] = { fqn: "projen.web.NextComponent", version: "0.16.40" };
class NextSampleCode extends component_1.Component {
    constructor(project, options) {
        var _e;
        super(project);
        this.fileExt = (_e = options.fileExt) !== null && _e !== void 0 ? _e : 'js';
        this.srcdir = options.srcdir;
        this.assetsdir = options.assetsdir;
        this.tailwind = options.tailwind;
        const indexJs = [
            'import Head from "next/head"',
            '',
            'export default function Home() {',
            '  return (',
            '    <div className="container">',
            '      <Head>',
            '        <title>Create Next App</title>',
            '      </Head>',
            '',
            '      <main>',
            '        <h1 className="title">',
            '          Welcome to <a href="https://nextjs.org">Next.js!</a>',
            '        </h1>',
            '',
            '        <p className="description">',
            '          Get started by editing <code>pages/index.js</code>',
            '        </p>',
            '',
            '        <div className="grid">',
            '          <a href="https://nextjs.org/docs" className="card">',
            '            <h3>Documentation &rarr;</h3>',
            '            <p>Find in-depth information about Next.js features and API.</p>',
            '          </a>',
            '',
            '          <a href="https://nextjs.org/learn" className="card">',
            '            <h3>Learn &rarr;</h3>',
            '            <p>Learn about Next.js in an interactive course with quizzes!</p>',
            '          </a>',
            '',
            '          <a',
            '            href="https://github.com/vercel/next.js/tree/master/examples"',
            '            className="card"',
            '          >',
            '            <h3>Examples &rarr;</h3>',
            '            <p>Discover and deploy boilerplate example Next.js projects.</p>',
            '          </a>',
            '',
            '          <a',
            '            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"',
            '            className="card"',
            '          >',
            '            <h3>Deploy &rarr;</h3>',
            '            <p>',
            '              Instantly deploy your Next.js site to a public URL with Vercel.',
            '            </p>',
            '          </a>',
            '        </div>',
            '      </main>',
            '',
            '      <footer>',
            '        <a',
            '          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"',
            '          target="_blank"',
            '          rel="noopener noreferrer"',
            '        >',
            '          Powered by Vercel',
            '          <img src="/vercel.svg" alt="Vercel Logo" className="logo" />',
            '        </a>',
            '      </footer>',
            '',
            '      <style jsx>{`',
            '        .container {',
            '          min-height: 100vh;',
            '          padding: 0 0.5rem;',
            '          display: flex;',
            '          flex-direction: column;',
            '          justify-content: center;',
            '          align-items: center;',
            '        }',
            '',
            '        main {',
            '          padding: 5rem 0;',
            '          flex: 1;',
            '          display: flex;',
            '          flex-direction: column;',
            '          justify-content: center;',
            '          align-items: center;',
            '        }',
            '',
            '        footer {',
            '          width: 100%;',
            '          height: 100px;',
            '          border-top: 1px solid #eaeaea;',
            '          display: flex;',
            '          justify-content: center;',
            '          align-items: center;',
            '        }',
            '',
            '        footer img {',
            '          margin-left: 0.5rem;',
            '        }',
            '',
            '        footer a {',
            '          display: flex;',
            '          justify-content: center;',
            '          align-items: center;',
            '        }',
            '',
            '        a {',
            '          color: inherit;',
            '          text-decoration: none;',
            '        }',
            '',
            '        .title a {',
            '          color: #0070f3;',
            '          text-decoration: none;',
            '        }',
            '',
            '        .title a:hover,',
            '        .title a:focus,',
            '        .title a:active {',
            '          text-decoration: underline;',
            '        }',
            '',
            '        .title {',
            '          margin: 0;',
            '          line-height: 1.15;',
            '          font-size: 4rem;',
            '        }',
            '',
            '        .title,',
            '        .description {',
            '          text-align: center;',
            '        }',
            '',
            '        .description {',
            '          line-height: 1.5;',
            '          font-size: 1.5rem;',
            '        }',
            '',
            '        code {',
            '          background: #fafafa;',
            '          border-radius: 5px;',
            '          padding: 0.75rem;',
            '          font-size: 1.1rem;',
            '          font-family: Menlo, Monaco, Lucida Console, Liberation Mono,',
            '            DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;',
            '        }',
            '',
            '        .grid {',
            '          display: flex;',
            '          align-items: center;',
            '          justify-content: center;',
            '          flex-wrap: wrap;',
            '',
            '          max-width: 800px;',
            '          margin-top: 3rem;',
            '        }',
            '',
            '        .card {',
            '          margin: 1rem;',
            '          flex-basis: 45%;',
            '          padding: 1.5rem;',
            '          text-align: left;',
            '          color: inherit;',
            '          text-decoration: none;',
            '          border: 1px solid #eaeaea;',
            '          border-radius: 10px;',
            '          transition: color 0.15s ease, border-color 0.15s ease;',
            '        }',
            '',
            '        .card:hover,',
            '        .card:focus,',
            '        .card:active {',
            '          color: #0070f3;',
            '          border-color: #0070f3;',
            '        }',
            '',
            '        .card h3 {',
            '          margin: 0 0 1rem 0;',
            '          font-size: 1.5rem;',
            '        }',
            '',
            '        .card p {',
            '          margin: 0;',
            '          font-size: 1.25rem;',
            '          line-height: 1.5;',
            '        }',
            '',
            '        .logo {',
            '          height: 1em;',
            '        }',
            '',
            '        @media (max-width: 600px) {',
            '          .grid {',
            '            width: 100%;',
            '            flex-direction: column;',
            '          }',
            '        }',
            '      `}</style>',
            '',
            '      <style jsx global>{`',
            '        html,',
            '        body {',
            '          padding: 0;',
            '          margin: 0;',
            '          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,',
            '            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,',
            '            sans-serif;',
            '        }',
            '',
            '        * {',
            '          box-sizing: border-box;',
            '        }',
            '      `}</style>',
            '    </div>',
            '  )',
            '}',
            '',
        ];
        if (this.tailwind) {
            indexJs.unshift('import "tailwindcss/tailwind.css"');
        }
        const vercelSvg = [
            '<svg width="283" height="64" viewBox="0 0 283 64" fill="none" ',
            '    xmlns="http://www.w3.org/2000/svg">',
            '    <path d="M141.04 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM248.72 16c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zM200.24 34c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9V5h9zM36.95 0L73.9 64H0L36.95 0zm92.38 5l-27.71 48L73.91 5H84.3l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10V51h-9V17h9v9.2c0-5.08 5.91-9.2 13.2-9.2z" fill="#000"/>',
            '</svg>',
        ];
        new sample_file_1.SampleDir(project, this.srcdir, {
            files: {
                ['index.' + this.fileExt]: indexJs.join('\n'),
            },
        });
        new sample_file_1.SampleDir(project, this.assetsdir, {
            files: {
                'vercel.svg': vercelSvg.join('\n'),
            },
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy93ZWIvbmV4dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUF5QztBQUN6QyxrQ0FBK0Q7QUFDL0Qsa0RBQWtFO0FBQ2xFLGdEQUEyQztBQUMzQyxvQ0FBd0M7QUFDeEMsOENBQThIO0FBQzlILGtDQUFvQztBQUNwQyx1Q0FBb0M7Ozs7Ozs7QUEwQ3BDLE1BQWEsYUFBYyxTQUFRLDBCQUFXOzs7O0lBa0I1QyxZQUFZLE9BQTZCOztRQUN2QyxLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsS0FBSztZQUNYLEdBQUcsT0FBTztTQUNYLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLFNBQUcsT0FBTyxDQUFDLE1BQU0sbUNBQUksT0FBTyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLFNBQUcsT0FBTyxDQUFDLFNBQVMsbUNBQUksUUFBUSxDQUFDO1FBQy9DLElBQUksQ0FBQyxRQUFRLFNBQUcsT0FBTyxDQUFDLFFBQVEsbUNBQUksSUFBSSxDQUFDO1FBRXpDLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTNFLCtGQUErRjtRQUMvRixVQUFJLE9BQU8sQ0FBQyxVQUFVLG1DQUFJLElBQUksRUFBRTtZQUM5QixJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3ZCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2dCQUN6QixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7YUFDeEIsQ0FBQyxDQUFDO1NBQ0o7SUFDSCxDQUFDOztBQXZDSCxzQ0F3Q0M7Ozs7Ozs7OztBQU9ELE1BQWEsdUJBQXdCLFNBQVEsaUNBQW9COzs7O0lBMEIvRCxZQUFZ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Q3RCLDZFQUE2RTtZQUM3RSwrRUFBK0U7WUFDL0UseUJBQXlCO1lBQ3pCLFdBQVc7WUFDWCxFQUFFO1lBQ0YsYUFBYTtZQUNiLG1DQUFtQztZQUNuQyxXQUFXO1lBQ1gsa0JBQWtCO1lBQ2xCLFlBQVk7WUFDWixLQUFLO1lBQ0wsR0FBRztZQUNILEVBQUU7U0FDSCxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsbUNBQW1DLENBQUMsQ0FBQztTQUN0RDtRQUVELE1BQU0sU0FBUyxHQUFHO1lBQ2hCLGdFQUFnRTtZQUNoRSx5Q0FBeUM7WUFDekMsaStCQUFpK0I7WUFDaitCLFFBQVE7U0FDVCxDQUFDO1FBRUYsSUFBSSx1QkFBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2xDLEtBQUssRUFBRTtnQkFDTCxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDOUM7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLHVCQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDckMsS0FBSyxFQUFFO2dCQUNMLFlBQVksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNuQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWxlQmFzZSwgRmlsZUJhc2VPcHRpb25zLCBJUmVzb2x2ZXIgfSBmcm9tICcuLi9maWxlJztcbmltcG9ydCB7IE5vZGVQcm9qZWN0LCBOb2RlUHJvamVjdE9wdGlvbnMgfSBmcm9tICcuLi9ub2RlLXByb2plY3QnO1xuaW1wb3J0IHsgU2FtcGxlRGlyIH0gZnJvbSAnLi4vc2FtcGxlLWZpbGUnO1xuaW1wb3J0IHsgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdEFwcFByb2plY3QsIFR5cGVTY3JpcHRKc3hNb2RlLCBUeXBlU2NyaXB0TW9kdWxlUmVzb2x1dGlvbiwgVHlwZVNjcmlwdFByb2plY3RPcHRpb25zIH0gZnJvbSAnLi4vdHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBkZWVwTWVyZ2UgfSBmcm9tICcuLi91dGlsJztcbmltcG9ydCB7IFBvc3RDc3MgfSBmcm9tICcuL3Bvc3Rjc3MnO1xuXG5leHBvcnQgaW50ZXJmYWNlIE5leHRKc0NvbW1vblByb2plY3RPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYXNzZXRzZGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSB0YWlsd2luZD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV4dEpzVHlwZVNjcmlwdFByb2plY3RPcHRpb25zIGV4dGVuZHMgTmV4dEpzQ29tbW9uUHJvamVjdE9wdGlvbnMsIFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucyB7IH1cblxuZXhwb3J0IGludGVyZmFjZSBOZXh0SnNQcm9qZWN0T3B0aW9ucyBleHRlbmRzIE5leHRKc0NvbW1vblByb2plY3RPcHRpb25zLCBOb2RlUHJvamVjdE9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgc3JjZGlyPzogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNhbXBsZUNvZGU/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIE5leHRKc1Byb2plY3QgZXh0ZW5kcyBOb2RlUHJvamVjdCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IHNyY2Rpcjogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBhc3NldHNkaXI6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgdGFpbHdpbmQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogTmV4dEpzUHJvamVjdE9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBqZXN0OiBmYWxzZSxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgfSk7XG5cbiAgICB0aGlzLnNyY2RpciA9IG9wdGlvbnMuc3JjZGlyID8/ICdwYWdlcyc7XG4gICAgdGhpcy5hc3NldHNkaXIgPSBvcHRpb25zLmFzc2V0c2RpciA/PyAncHVibGljJztcbiAgICB0aGlzLnRhaWx3aW5kID0gb3B0aW9ucy50YWlsd2luZCA/PyB0cnVlO1xuXG4gICAgbmV3IE5leHRDb21wb25lbnQodGhpcywgeyB0eXBlc2NyaXB0OiBmYWxzZSwgdGFpbHdpbmQ6IG9wdGlvbnMudGFpbHdpbmQgfSk7XG5cbiAgICAvLyBnZW5lcmF0ZSBzYW1wbGUgY29kZSBpbiBgcGFnZXNgIGFuZCBgcHVibGljYCBpZiB0aGVzZSBkaXJlY3RvcmllcyBhcmUgZW1wdHkgb3Igbm9uLWV4aXN0ZW50LlxuICAgIGlmIChvcHRpb25zLnNhbXBsZUNvZGUgPz8gdHJ1ZSkge1xuICAgICAgbmV3IE5leHRTYW1wbGVDb2RlKHRoaXMsIHtcbiAgICAgICAgZmlsZUV4dDogJ2pzJyxcbiAgICAgICAgc3JjZGlyOiB0aGlzLnNyY2RpcixcbiAgICAgICAgYXNzZXRzZGlyOiB0aGlzLmFzc2V0c2RpcixcbiAgICAgICAgdGFpbHdpbmQ6IHRoaXMudGFpbHdpbmQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBOZXh0SnNUeXBlU2NyaXB0UHJvamVjdCBleHRlbmRzIFR5cGVTY3JpcHRBcHBQcm9qZWN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICBwdWJsaWMgcmVhZG9ubHkgc3JjZGlyOiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IGFzc2V0c2Rpcjogc3RyaW5nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSB0YWlsd2luZDogYm9vbGVhbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHJlYWRvbmx5IG5leHRKc1R5cGVEZWY6IE5leHRKc1R5cGVEZWY7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogTmV4dEpzVHlwZVNjcmlwdFByb2plY3RPcHRpb25zKSB7XG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBzcmNkaXI6ICdwYWdlcycsXG4gICAgICBlc2xpbnQ6IGZhbHNlLFxuICAgICAgamVzdDogZmFsc2UsXG4gICAgICB0c2NvbmZpZzoge1xuICAgICAgICBpbmNsdWRlOiBbJyoqLyoudHMnLCAnKiovKi50c3gnXSxcbiAgICAgICAgY29tcGlsZXJPcHRpb25zOiB7XG4gICAgICAgICAgLy8gcmVxdWlyZWQgYnkgTmV4dC5qc1xuICAgICAgICAgIGVzTW9kdWxlSW50ZXJvcDogdHJ1ZSxcbiAgICAgICAgICBtb2R1bGU6ICdlc25leHQnLFxuICAgICAgICAgIG1vZHVsZVJlc29sdXRpb246IFR5cGVTY3JpcHRNb2R1bGVSZXNvbHV0aW9uLk5PREUsXG4gICAgICAgICAgaXNvbGF0ZWRNb2R1bGVzOiB0cnVlLFxuICAgICAgICAgIHJlc29sdmVKc29uTW9kdWxlOiB0cnVlLFxuICAgICAgICAgIGpzeDogVHlwZVNjcmlwdEpzeE1vZGUuUFJFU0VSVkUsXG5cbiAgICAgICAgICAvLyByZWNvbW1lbmRlZCBieSBOZXh0LmpzXG4gICAgICAgICAgYWxsb3dKczogdHJ1ZSxcbiAgICAgICAgICBza2lwTGliQ2hlY2s6IHRydWUsXG4gICAgICAgICAgZm9yY2VDb25zaXN0ZW50Q2FzaW5nSW5GaWxlTmFtZXM6IHRydWUsXG4gICAgICAgICAgbm9FbWl0OiB0cnVlLFxuICAgICAgICAgIGxpYjogWydkb20nLCAnZG9tLml0ZXJhYmxlJywgJ2VzbmV4dCddLFxuICAgICAgICAgIHN0cmljdDogZmFsc2UsXG4gICAgICAgICAgdGFyZ2V0OiAnZXM1JyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIG5ldmVyIGdlbmVyYXRlIGRlZmF1bHQgVHlwZVNjcmlwdCBzYW1wbGUgY29kZSwgc2luY2UgdGhpcyBjbGFzcyBwcm92aWRlcyBpdHMgb3duXG4gICAgc3VwZXIoZGVlcE1lcmdlKFtkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgeyBzYW1wbGVDb2RlOiBmYWxzZSB9XSkgYXMgVHlwZVNjcmlwdFByb2plY3RPcHRpb25zKTtcblxuICAgIHRoaXMuc3JjZGlyID0gb3B0aW9ucy5zcmNkaXIgPz8gJ3BhZ2VzJztcbiAgICB0aGlzLmFzc2V0c2RpciA9IG9wdGlvbnMuYXNzZXRzZGlyID8/ICdwdWJsaWMnO1xuICAgIHRoaXMudGFpbHdpbmQgPSBvcHRpb25zLnRhaWx3aW5kID8/IHRydWU7XG5cbiAgICBuZXcgTmV4dENvbXBvbmVudCh0aGlzLCB7IHR5cGVzY3JpcHQ6IHRydWUsIHRhaWx3aW5kOiB0aGlzLnRhaWx3aW5kIH0pO1xuXG4gICAgLy8gJ25leHQgYnVpbGQnIGNvbW1hbmQgZmFpbHMgaWYgdHNjb25maWcuanNvbiBpcyBpbW11dGFibGVcbiAgICBpZiAodGhpcy50c2NvbmZpZykge1xuICAgICAgdGhpcy50c2NvbmZpZy5maWxlLnJlYWRvbmx5ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5uZXh0SnNUeXBlRGVmID0gbmV3IE5leHRKc1R5cGVEZWYodGhpcywgJ25leHQtZW52LmQudHMnKTtcblxuICAgIC8vIGdlbmVyYXRlIHNhbXBsZSBjb2RlIGluIGBwYWdlc2AgYW5kIGBwdWJsaWNgIGlmIHRoZXNlIGRpcmVjdG9yaWVzIGFyZSBlbXB0eSBvciBub24tZXhpc3RlbnQuXG4gICAgaWYgKG9wdGlvbnMuc2FtcGxlQ29kZSA/PyB0cnVlKSB7XG4gICAgICBuZXcgTmV4dFNhbXBsZUNvZGUodGhpcywge1xuICAgICAgICBmaWxlRXh0OiAndHN4JyxcbiAgICAgICAgc3JjZGlyOiB0aGlzLnNyY2RpcixcbiAgICAgICAgYXNzZXRzZGlyOiB0aGlzLmFzc2V0c2RpcixcbiAgICAgICAgdGFpbHdpbmQ6IHRoaXMudGFpbHdpbmQsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBOZXh0SnNUeXBlRGVmT3B0aW9ucyBleHRlbmRzIEZpbGVCYXNlT3B0aW9ucyB7IH1cblxuZXhwb3J0IGNsYXNzIE5leHRKc1R5cGVEZWYgZXh0ZW5kcyBGaWxlQmFzZSB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IE5leHRKc1R5cGVTY3JpcHRQcm9qZWN0LCBmaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zOiBOZXh0SnNUeXBlRGVmT3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIocHJvamVjdCwgZmlsZVBhdGgsIG9wdGlvbnMpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN5bnRoZXNpemVDb250ZW50KF86IElSZXNvbHZlcik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIFtcbiAgICAgICcvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIm5leHRcIiAvPicsXG4gICAgICAnLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJuZXh0L3R5cGVzL2dsb2JhbFwiIC8+JyxcbiAgICBdLmpvaW4oJ1xcbicpO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmV4dENvbXBvbmVudE9wdGlvbnMge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHR5cGVzY3JpcHQ/OiBib29sZWFuO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHRhaWx3aW5kPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIE5leHRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICBwcml2YXRlIHJlYWRvbmx5IHR5cGVzY3JpcHQ6IGJvb2xlYW47XG4gIHByaXZhdGUgcmVhZG9ubHkgdGFpbHdpbmQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogTm9kZVByb2plY3QsIG9wdGlvbnM6IE5leHRDb21wb25lbnRPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICB0aGlzLnR5cGVzY3JpcHQgPSBvcHRpb25zLnR5cGVzY3JpcHQgPz8gZmFsc2U7XG4gICAgdGhpcy50YWlsd2luZCA9IG9wdGlvbnMudGFpbHdpbmQgPz8gdHJ1ZTtcblxuICAgIHByb2plY3QuYWRkRGVwcygnbmV4dCcsICdyZWFjdCcsICdyZWFjdC1kb20nKTtcbiAgICBpZiAodGhpcy50eXBlc2NyaXB0KSB7XG4gICAgICBwcm9qZWN0LmFkZERldkRlcHMoJ0B0eXBlcy9yZWFjdCcsICdAdHlwZXMvcmVhY3QtZG9tJyk7XG4gICAgfVxuICAgIGlmICh0aGlzLnRhaWx3aW5kKSB7XG4gICAgICBuZXcgUG9zdENzcyhwcm9qZWN0LCB7IHRhaWx3aW5kOiB0cnVlIH0pO1xuICAgIH1cblxuICAgIC8vIE5leHRKUyBDTEkgY29tbWFuZHMsIHNlZTogaHR0cHM6Ly9uZXh0anMub3JnL2RvY3MvYXBpLXJlZmVyZW5jZS9jbGlcbiAgICBwcm9qZWN0LmFkZFRhc2soJ2RldicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3RhcnRzIHRoZSBOZXh0LmpzIGFwcGxpY2F0aW9uIGluIGRldmVsb3BtZW50IG1vZGUnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5CVUlMRCxcbiAgICAgIGV4ZWM6ICduZXh0IGRldicsXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LmFkZFRhc2soJ2J1aWxkJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDcmVhdGVzIGFuIG9wdGltaXplZCBwcm9kdWN0aW9uIGJ1aWxkIG9mIHlvdXIgTmV4dC5qcyBhcHBsaWNhdGlvbicsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgICAgZXhlYzogJ25leHQgYnVpbGQnLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5hZGRUYXNrKCdzZXJ2ZXInLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1N0YXJ0cyB0aGUgTmV4dC5qcyBhcHBsaWNhdGlvbiBpbiBwcm9kdWN0aW9uIG1vZGUnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgZXhlYzogJ25leHQgc3RhcnQnLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5hZGRUYXNrKCd0ZWxlbWV0cnknLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ0NoZWNrcyB0aGUgc3RhdHVzIG9mIE5leHQuanMgdGVsZW1ldHJ5IGNvbGxlY3Rpb24nLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5NSVNDLFxuICAgICAgZXhlYzogJ25leHQgdGVsZW1ldHJ5JyxcbiAgICB9KTtcblxuICAgIHByb2plY3QubnBtaWdub3JlPy5leGNsdWRlKCcjIE5leHQuanMnLCAnLy5uZXh0LycpO1xuICAgIHByb2plY3QuZ2l0aWdub3JlLmV4Y2x1ZGUoJyMgTmV4dC5qcycsICcvLm5leHQvJyk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIE5leHRTYW1wbGVDb2RlT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBGaWxlIGV4dGVuc2lvbiBmb3Igc2FtcGxlIGphdmFzY3JpcHQgY29kZSB0byBiZSBzYXZlZCBhcy5cbiAgICpcbiAgICogQGRlZmF1bHQgXCJqc1wiXG4gICAqL1xuICByZWFkb25seSBmaWxlRXh0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZGlyZWN0b3J5IGluIHdoaWNoIE5leHQuanMgcGFnZXMgYXJlIGRlY2xhcmVkLlxuICAgKi9cbiAgcmVhZG9ubHkgc3JjZGlyOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBkaXJlY3RvcnkgaW4gd2hpY2ggYXBwIGFzc2V0cyByZXNpZGUuXG4gICAqL1xuICByZWFkb25seSBhc3NldHNkaXI6IHN0cmluZztcblxuICAvKipcbiAgICogU2V0dXAgVGFpbHdpbmQgYXMgYSBQb3N0Q1NTIHBsdWdpbi5cbiAgICovXG4gIHJlYWRvbmx5IHRhaWx3aW5kOiBib29sZWFuO1xufVxuXG5jbGFzcyBOZXh0U2FtcGxlQ29kZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgZmlsZUV4dDogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IHNyY2Rpcjogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IGFzc2V0c2Rpcjogc3RyaW5nO1xuICBwcml2YXRlIHJlYWRvbmx5IHRhaWx3aW5kOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IE5vZGVQcm9qZWN0LCBvcHRpb25zOiBOZXh0U2FtcGxlQ29kZU9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIHRoaXMuZmlsZUV4dCA9IG9wdGlvbnMuZmlsZUV4dCA/PyAnanMnO1xuICAgIHRoaXMuc3JjZGlyID0gb3B0aW9ucy5zcmNkaXI7XG4gICAgdGhpcy5hc3NldHNkaXIgPSBvcHRpb25zLmFzc2V0c2RpcjtcbiAgICB0aGlzLnRhaWx3aW5kID0gb3B0aW9ucy50YWlsd2luZDtcblxuICAgIGNvbnN0IGluZGV4SnMgPSBbXG4gICAgICAnaW1wb3J0IEhlYWQgZnJvbSBcIm5leHQvaGVhZFwiJyxcbiAgICAgICcnLFxuICAgICAgJ2V4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEhvbWUoKSB7JyxcbiAgICAgICcgIHJldHVybiAoJyxcbiAgICAgICcgICAgPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXJcIj4nLFxuICAgICAgJyAgICAgIDxIZWFkPicsXG4gICAgICAnICAgICAgICA8dGl0bGU+Q3JlYXRlIE5leHQgQXBwPC90aXRsZT4nLFxuICAgICAgJyAgICAgIDwvSGVhZD4nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgPG1haW4+JyxcbiAgICAgICcgICAgICAgIDxoMSBjbGFzc05hbWU9XCJ0aXRsZVwiPicsXG4gICAgICAnICAgICAgICAgIFdlbGNvbWUgdG8gPGEgaHJlZj1cImh0dHBzOi8vbmV4dGpzLm9yZ1wiPk5leHQuanMhPC9hPicsXG4gICAgICAnICAgICAgICA8L2gxPicsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIDxwIGNsYXNzTmFtZT1cImRlc2NyaXB0aW9uXCI+JyxcbiAgICAgICcgICAgICAgICAgR2V0IHN0YXJ0ZWQgYnkgZWRpdGluZyA8Y29kZT5wYWdlcy9pbmRleC5qczwvY29kZT4nLFxuICAgICAgJyAgICAgICAgPC9wPicsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZFwiPicsXG4gICAgICAnICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL25leHRqcy5vcmcvZG9jc1wiIGNsYXNzTmFtZT1cImNhcmRcIj4nLFxuICAgICAgJyAgICAgICAgICAgIDxoMz5Eb2N1bWVudGF0aW9uICZyYXJyOzwvaDM+JyxcbiAgICAgICcgICAgICAgICAgICA8cD5GaW5kIGluLWRlcHRoIGluZm9ybWF0aW9uIGFib3V0IE5leHQuanMgZmVhdHVyZXMgYW5kIEFQSS48L3A+JyxcbiAgICAgICcgICAgICAgICAgPC9hPicsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vbmV4dGpzLm9yZy9sZWFyblwiIGNsYXNzTmFtZT1cImNhcmRcIj4nLFxuICAgICAgJyAgICAgICAgICAgIDxoMz5MZWFybiAmcmFycjs8L2gzPicsXG4gICAgICAnICAgICAgICAgICAgPHA+TGVhcm4gYWJvdXQgTmV4dC5qcyBpbiBhbiBpbnRlcmFjdGl2ZSBjb3Vyc2Ugd2l0aCBxdWl6emVzITwvcD4nLFxuICAgICAgJyAgICAgICAgICA8L2E+JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgICA8YScsXG4gICAgICAnICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS92ZXJjZWwvbmV4dC5qcy90cmVlL21hc3Rlci9leGFtcGxlc1wiJyxcbiAgICAgICcgICAgICAgICAgICBjbGFzc05hbWU9XCJjYXJkXCInLFxuICAgICAgJyAgICAgICAgICA+JyxcbiAgICAgICcgICAgICAgICAgICA8aDM+RXhhbXBsZXMgJnJhcnI7PC9oMz4nLFxuICAgICAgJyAgICAgICAgICAgIDxwPkRpc2NvdmVyIGFuZCBkZXBsb3kgYm9pbGVycGxhdGUgZXhhbXBsZSBOZXh0LmpzIHByb2plY3RzLjwvcD4nLFxuICAgICAgJyAgICAgICAgICA8L2E+JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgICA8YScsXG4gICAgICAnICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vdmVyY2VsLmNvbS9pbXBvcnQ/ZmlsdGVyPW5leHQuanMmdXRtX3NvdXJjZT1jcmVhdGUtbmV4dC1hcHAmdXRtX21lZGl1bT1kZWZhdWx0LXRlbXBsYXRlJnV0bV9jYW1wYWlnbj1jcmVhdGUtbmV4dC1hcHBcIicsXG4gICAgICAnICAgICAgICAgICAgY2xhc3NOYW1lPVwiY2FyZFwiJyxcbiAgICAgICcgICAgICAgICAgPicsXG4gICAgICAnICAgICAgICAgICAgPGgzPkRlcGxveSAmcmFycjs8L2gzPicsXG4gICAgICAnICAgICAgICAgICAgPHA+JyxcbiAgICAgICcgICAgICAgICAgICAgIEluc3RhbnRseSBkZXBsb3kgeW91ciBOZXh0LmpzIHNpdGUgdG8gYSBwdWJsaWMgVVJMIHdpdGggVmVyY2VsLicsXG4gICAgICAnICAgICAgICAgICAgPC9wPicsXG4gICAgICAnICAgICAgICAgIDwvYT4nLFxuICAgICAgJyAgICAgICAgPC9kaXY+JyxcbiAgICAgICcgICAgICA8L21haW4+JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgIDxmb290ZXI+JyxcbiAgICAgICcgICAgICAgIDxhJyxcbiAgICAgICcgICAgICAgICAgaHJlZj1cImh0dHBzOi8vdmVyY2VsLmNvbT91dG1fc291cmNlPWNyZWF0ZS1uZXh0LWFwcCZ1dG1fbWVkaXVtPWRlZmF1bHQtdGVtcGxhdGUmdXRtX2NhbXBhaWduPWNyZWF0ZS1uZXh0LWFwcFwiJyxcbiAgICAgICcgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCInLFxuICAgICAgJyAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCInLFxuICAgICAgJyAgICAgICAgPicsXG4gICAgICAnICAgICAgICAgIFBvd2VyZWQgYnkgVmVyY2VsJyxcbiAgICAgICcgICAgICAgICAgPGltZyBzcmM9XCIvdmVyY2VsLnN2Z1wiIGFsdD1cIlZlcmNlbCBMb2dvXCIgY2xhc3NOYW1lPVwibG9nb1wiIC8+JyxcbiAgICAgICcgICAgICAgIDwvYT4nLFxuICAgICAgJyAgICAgIDwvZm9vdGVyPicsXG4gICAgICAnJyxcbiAgICAgICcgICAgICA8c3R5bGUganN4PntgJyxcbiAgICAgICcgICAgICAgIC5jb250YWluZXIgeycsXG4gICAgICAnICAgICAgICAgIG1pbi1oZWlnaHQ6IDEwMHZoOycsXG4gICAgICAnICAgICAgICAgIHBhZGRpbmc6IDAgMC41cmVtOycsXG4gICAgICAnICAgICAgICAgIGRpc3BsYXk6IGZsZXg7JyxcbiAgICAgICcgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsnLFxuICAgICAgJyAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsnLFxuICAgICAgJyAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgbWFpbiB7JyxcbiAgICAgICcgICAgICAgICAgcGFkZGluZzogNXJlbSAwOycsXG4gICAgICAnICAgICAgICAgIGZsZXg6IDE7JyxcbiAgICAgICcgICAgICAgICAgZGlzcGxheTogZmxleDsnLFxuICAgICAgJyAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uOycsXG4gICAgICAnICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOycsXG4gICAgICAnICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICBmb290ZXIgeycsXG4gICAgICAnICAgICAgICAgIHdpZHRoOiAxMDAlOycsXG4gICAgICAnICAgICAgICAgIGhlaWdodDogMTAwcHg7JyxcbiAgICAgICcgICAgICAgICAgYm9yZGVyLXRvcDogMXB4IHNvbGlkICNlYWVhZWE7JyxcbiAgICAgICcgICAgICAgICAgZGlzcGxheTogZmxleDsnLFxuICAgICAgJyAgICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjsnLFxuICAgICAgJyAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgZm9vdGVyIGltZyB7JyxcbiAgICAgICcgICAgICAgICAgbWFyZ2luLWxlZnQ6IDAuNXJlbTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIGZvb3RlciBhIHsnLFxuICAgICAgJyAgICAgICAgICBkaXNwbGF5OiBmbGV4OycsXG4gICAgICAnICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOycsXG4gICAgICAnICAgICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICBhIHsnLFxuICAgICAgJyAgICAgICAgICBjb2xvcjogaW5oZXJpdDsnLFxuICAgICAgJyAgICAgICAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICAudGl0bGUgYSB7JyxcbiAgICAgICcgICAgICAgICAgY29sb3I6ICMwMDcwZjM7JyxcbiAgICAgICcgICAgICAgICAgdGV4dC1kZWNvcmF0aW9uOiBub25lOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgLnRpdGxlIGE6aG92ZXIsJyxcbiAgICAgICcgICAgICAgIC50aXRsZSBhOmZvY3VzLCcsXG4gICAgICAnICAgICAgICAudGl0bGUgYTphY3RpdmUgeycsXG4gICAgICAnICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgLnRpdGxlIHsnLFxuICAgICAgJyAgICAgICAgICBtYXJnaW46IDA7JyxcbiAgICAgICcgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuMTU7JyxcbiAgICAgICcgICAgICAgICAgZm9udC1zaXplOiA0cmVtOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgLnRpdGxlLCcsXG4gICAgICAnICAgICAgICAuZGVzY3JpcHRpb24geycsXG4gICAgICAnICAgICAgICAgIHRleHQtYWxpZ246IGNlbnRlcjsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIC5kZXNjcmlwdGlvbiB7JyxcbiAgICAgICcgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTsnLFxuICAgICAgJyAgICAgICAgICBmb250LXNpemU6IDEuNXJlbTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIGNvZGUgeycsXG4gICAgICAnICAgICAgICAgIGJhY2tncm91bmQ6ICNmYWZhZmE7JyxcbiAgICAgICcgICAgICAgICAgYm9yZGVyLXJhZGl1czogNXB4OycsXG4gICAgICAnICAgICAgICAgIHBhZGRpbmc6IDAuNzVyZW07JyxcbiAgICAgICcgICAgICAgICAgZm9udC1zaXplOiAxLjFyZW07JyxcbiAgICAgICcgICAgICAgICAgZm9udC1mYW1pbHk6IE1lbmxvLCBNb25hY28sIEx1Y2lkYSBDb25zb2xlLCBMaWJlcmF0aW9uIE1vbm8sJyxcbiAgICAgICcgICAgICAgICAgICBEZWphVnUgU2FucyBNb25vLCBCaXRzdHJlYW0gVmVyYSBTYW5zIE1vbm8sIENvdXJpZXIgTmV3LCBtb25vc3BhY2U7JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICAuZ3JpZCB7JyxcbiAgICAgICcgICAgICAgICAgZGlzcGxheTogZmxleDsnLFxuICAgICAgJyAgICAgICAgICBhbGlnbi1pdGVtczogY2VudGVyOycsXG4gICAgICAnICAgICAgICAgIGp1c3RpZnktY29udGVudDogY2VudGVyOycsXG4gICAgICAnICAgICAgICAgIGZsZXgtd3JhcDogd3JhcDsnLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICAgIG1heC13aWR0aDogODAwcHg7JyxcbiAgICAgICcgICAgICAgICAgbWFyZ2luLXRvcDogM3JlbTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIC5jYXJkIHsnLFxuICAgICAgJyAgICAgICAgICBtYXJnaW46IDFyZW07JyxcbiAgICAgICcgICAgICAgICAgZmxleC1iYXNpczogNDUlOycsXG4gICAgICAnICAgICAgICAgIHBhZGRpbmc6IDEuNXJlbTsnLFxuICAgICAgJyAgICAgICAgICB0ZXh0LWFsaWduOiBsZWZ0OycsXG4gICAgICAnICAgICAgICAgIGNvbG9yOiBpbmhlcml0OycsXG4gICAgICAnICAgICAgICAgIHRleHQtZGVjb3JhdGlvbjogbm9uZTsnLFxuICAgICAgJyAgICAgICAgICBib3JkZXI6IDFweCBzb2xpZCAjZWFlYWVhOycsXG4gICAgICAnICAgICAgICAgIGJvcmRlci1yYWRpdXM6IDEwcHg7JyxcbiAgICAgICcgICAgICAgICAgdHJhbnNpdGlvbjogY29sb3IgMC4xNXMgZWFzZSwgYm9yZGVyLWNvbG9yIDAuMTVzIGVhc2U7JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgICAuY2FyZDpob3ZlciwnLFxuICAgICAgJyAgICAgICAgLmNhcmQ6Zm9jdXMsJyxcbiAgICAgICcgICAgICAgIC5jYXJkOmFjdGl2ZSB7JyxcbiAgICAgICcgICAgICAgICAgY29sb3I6ICMwMDcwZjM7JyxcbiAgICAgICcgICAgICAgICAgYm9yZGVyLWNvbG9yOiAjMDA3MGYzOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgLmNhcmQgaDMgeycsXG4gICAgICAnICAgICAgICAgIG1hcmdpbjogMCAwIDFyZW0gMDsnLFxuICAgICAgJyAgICAgICAgICBmb250LXNpemU6IDEuNXJlbTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIC5jYXJkIHAgeycsXG4gICAgICAnICAgICAgICAgIG1hcmdpbjogMDsnLFxuICAgICAgJyAgICAgICAgICBmb250LXNpemU6IDEuMjVyZW07JyxcbiAgICAgICcgICAgICAgICAgbGluZS1oZWlnaHQ6IDEuNTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIC5sb2dvIHsnLFxuICAgICAgJyAgICAgICAgICBoZWlnaHQ6IDFlbTsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnJyxcbiAgICAgICcgICAgICAgIEBtZWRpYSAobWF4LXdpZHRoOiA2MDBweCkgeycsXG4gICAgICAnICAgICAgICAgIC5ncmlkIHsnLFxuICAgICAgJyAgICAgICAgICAgIHdpZHRoOiAxMDAlOycsXG4gICAgICAnICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsnLFxuICAgICAgJyAgICAgICAgICB9JyxcbiAgICAgICcgICAgICAgIH0nLFxuICAgICAgJyAgICAgIGB9PC9zdHlsZT4nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgPHN0eWxlIGpzeCBnbG9iYWw+e2AnLFxuICAgICAgJyAgICAgICAgaHRtbCwnLFxuICAgICAgJyAgICAgICAgYm9keSB7JyxcbiAgICAgICcgICAgICAgICAgcGFkZGluZzogMDsnLFxuICAgICAgJyAgICAgICAgICBtYXJnaW46IDA7JyxcbiAgICAgICcgICAgICAgICAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgU2Vnb2UgVUksIFJvYm90bywnLFxuICAgICAgJyAgICAgICAgICAgIE94eWdlbiwgVWJ1bnR1LCBDYW50YXJlbGwsIEZpcmEgU2FucywgRHJvaWQgU2FucywgSGVsdmV0aWNhIE5ldWUsJyxcbiAgICAgICcgICAgICAgICAgICBzYW5zLXNlcmlmOycsXG4gICAgICAnICAgICAgICB9JyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgICAgKiB7JyxcbiAgICAgICcgICAgICAgICAgYm94LXNpemluZzogYm9yZGVyLWJveDsnLFxuICAgICAgJyAgICAgICAgfScsXG4gICAgICAnICAgICAgYH08L3N0eWxlPicsXG4gICAgICAnICAgIDwvZGl2PicsXG4gICAgICAnICApJyxcbiAgICAgICd9JyxcbiAgICAgICcnLFxuICAgIF07XG5cbiAgICBpZiAodGhpcy50YWlsd2luZCkge1xuICAgICAgaW5kZXhKcy51bnNoaWZ0KCdpbXBvcnQgXCJ0YWlsd2luZGNzcy90YWlsd2luZC5jc3NcIicpO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcmNlbFN2ZyA9IFtcbiAgICAgICc8c3ZnIHdpZHRoPVwiMjgzXCIgaGVpZ2h0PVwiNjRcIiB2aWV3Qm94PVwiMCAwIDI4MyA2NFwiIGZpbGw9XCJub25lXCIgJyxcbiAgICAgICcgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPicsXG4gICAgICAnICAgIDxwYXRoIGQ9XCJNMTQxLjA0IDE2Yy0xMS4wNCAwLTE5IDcuMi0xOSAxOHM4Ljk2IDE4IDIwIDE4YzYuNjcgMCAxMi41NS0yLjY0IDE2LjE5LTcuMDlsLTcuNjUtNC40MmMtMi4wMiAyLjIxLTUuMDkgMy41LTguNTQgMy41LTQuNzkgMC04Ljg2LTIuNS0xMC4zNy02LjVoMjguMDJjLjIyLTEuMTIuMzUtMi4yOC4zNS0zLjUgMC0xMC43OS03Ljk2LTE3Ljk5LTE5LTE3Ljk5em0tOS40NiAxNC41YzEuMjUtMy45OSA0LjY3LTYuNSA5LjQ1LTYuNSA0Ljc5IDAgOC4yMSAyLjUxIDkuNDUgNi41aC0xOC45ek0yNDguNzIgMTZjLTExLjA0IDAtMTkgNy4yLTE5IDE4czguOTYgMTggMjAgMThjNi42NyAwIDEyLjU1LTIuNjQgMTYuMTktNy4wOWwtNy42NS00LjQyYy0yLjAyIDIuMjEtNS4wOSAzLjUtOC41NCAzLjUtNC43OSAwLTguODYtMi41LTEwLjM3LTYuNWgyOC4wMmMuMjItMS4xMi4zNS0yLjI4LjM1LTMuNSAwLTEwLjc5LTcuOTYtMTcuOTktMTktMTcuOTl6bS05LjQ1IDE0LjVjMS4yNS0zLjk5IDQuNjctNi41IDkuNDUtNi41IDQuNzkgMCA4LjIxIDIuNTEgOS40NSA2LjVoLTE4Ljl6TTIwMC4yNCAzNGMwIDYgMy45MiAxMCAxMCAxMCA0LjEyIDAgNy4yMS0xLjg3IDguOC00LjkybDcuNjggNC40M2MtMy4xOCA1LjMtOS4xNCA4LjQ5LTE2LjQ4IDguNDktMTEuMDUgMC0xOS03LjItMTktMThzNy45Ni0xOCAxOS0xOGM3LjM0IDAgMTMuMjkgMy4xOSAxNi40OCA4LjQ5bC03LjY4IDQuNDNjLTEuNTktMy4wNS00LjY4LTQuOTItOC44LTQuOTItNi4wNyAwLTEwIDQtMTAgMTB6bTgyLjQ4LTI5djQ2aC05VjVoOXpNMzYuOTUgMEw3My45IDY0SDBMMzYuOTUgMHptOTIuMzggNWwtMjcuNzEgNDhMNzMuOTEgNUg4NC4zbDE3LjMyIDMwIDE3LjMyLTMwaDEwLjM5em01OC45MSAxMnY5LjY5Yy0xLS4yOS0yLjA2LS40OS0zLjItLjQ5LTUuODEgMC0xMCA0LTEwIDEwVjUxaC05VjE3aDl2OS4yYzAtNS4wOCA1LjkxLTkuMiAxMy4yLTkuMnpcIiBmaWxsPVwiIzAwMFwiLz4nLFxuICAgICAgJzwvc3ZnPicsXG4gICAgXTtcblxuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgdGhpcy5zcmNkaXIsIHtcbiAgICAgIGZpbGVzOiB7XG4gICAgICAgIFsnaW5kZXguJyArIHRoaXMuZmlsZUV4dF06IGluZGV4SnMuam9pbignXFxuJyksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgbmV3IFNhbXBsZURpcihwcm9qZWN0LCB0aGlzLmFzc2V0c2Rpciwge1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgJ3ZlcmNlbC5zdmcnOiB2ZXJjZWxTdmcuam9pbignXFxuJyksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=