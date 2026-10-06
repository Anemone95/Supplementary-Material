"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactTypeDef = exports.ReactComponent = exports.ReactTypeScriptProject = exports.ReactProject = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const file_1 = require("../file");
const node_project_1 = require("../node-project");
const sample_file_1 = require("../sample-file");
const tasks_1 = require("../tasks");
const typescript_1 = require("../typescript");
const util_1 = require("../util");
/**
 * (experimental) React project without TypeScript.
 *
 * @experimental
 * @pjid react
 */
class ReactProject extends node_project_1.NodeProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _e, _f;
        super({
            jest: false,
            ...options,
        });
        this.srcdir = (_e = options.srcdir) !== null && _e !== void 0 ? _e : 'src';
        new ReactComponent(this, { typescript: false });
        // generate sample code in `src` and `public` if these directories are empty or non-existent.
        if ((_f = options.sampleCode) !== null && _f !== void 0 ? _f : true) {
            new ReactSampleCode(this, {
                fileExt: 'jsx',
                srcdir: this.srcdir,
            });
        }
    }
}
exports.ReactProject = ReactProject;
_a = JSII_RTTI_SYMBOL_1;
ReactProject[_a] = { fqn: "projen.web.ReactProject", version: "0.16.40" };
/**
 * (experimental) React project with TypeScript.
 *
 * @experimental
 * @pjid react-ts
 */
class ReactTypeScriptProject extends typescript_1.TypeScriptAppProject {
    /**
     * @experimental
     */
    constructor(options) {
        var _e, _f, _g;
        const defaultOptions = {
            srcdir: 'src',
            eslint: false,
            jest: false,
            tsconfig: {
                include: ['src'],
                compilerOptions: {
                    target: 'es5',
                    lib: [
                        'dom',
                        'dom.iterable',
                        'esnext',
                    ],
                    allowJs: true,
                    skipLibCheck: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    strict: true,
                    forceConsistentCasingInFileNames: true,
                    noFallthroughCasesInSwitch: true,
                    module: 'esnext',
                    moduleResolution: typescript_1.TypeScriptModuleResolution.NODE,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: typescript_1.TypeScriptJsxMode.REACT_JSX,
                },
            },
            typescriptVersion: (_e = options.typescriptVersion) !== null && _e !== void 0 ? _e : '^4.0.3',
        };
        // never generate default TypeScript sample code, since this class provides its own
        super(util_1.deepMerge([defaultOptions, options, { sampleCode: false }]));
        this.srcdir = (_f = options.srcdir) !== null && _f !== void 0 ? _f : 'src';
        new ReactComponent(this, { typescript: true });
        this.reactTypeDef = new ReactTypeDef(this, 'react-app-env.d.ts');
        // generate sample code in `src` and `public` if these directories are empty or non-existent.
        if ((_g = options.sampleCode) !== null && _g !== void 0 ? _g : true) {
            new ReactSampleCode(this, {
                fileExt: 'tsx',
                srcdir: this.srcdir,
            });
        }
    }
}
exports.ReactTypeScriptProject = ReactTypeScriptProject;
_b = JSII_RTTI_SYMBOL_1;
ReactTypeScriptProject[_b] = { fqn: "projen.web.ReactTypeScriptProject", version: "0.16.40" };
/**
 * @experimental
 */
class ReactComponent extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _e, _f;
        super(project);
        this.typescript = (_e = options.typescript) !== null && _e !== void 0 ? _e : false;
        // No compile for react app
        project.compileTask.reset();
        project.addDeps('react', 'react-dom', 'react-scripts@^4.0.0', 'web-vitals');
        project.addDevDeps('@testing-library/jest-dom', '@testing-library/react', '@testing-library/user-event');
        if (this.typescript) {
            project.addDevDeps('@types/jest', '@types/node', '@types/react', '@types/react-dom');
        }
        // Create React App CLI commands, see: https://create-react-app.dev/docs/available-scripts/
        project.addTask('dev', {
            description: 'Starts the react application',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'react-scripts start',
        });
        project.addTask('build', {
            description: 'Creates an optimized production build of your React application',
            category: tasks_1.TaskCategory.BUILD,
            exec: 'react-scripts build',
        });
        project.addTask('eject', {
            description: 'Ejects your React application from react-scripts',
            category: tasks_1.TaskCategory.MISC,
            exec: 'react-scripts eject',
        });
        project.addTask('test', {
            description: 'Runs tests',
            category: tasks_1.TaskCategory.TEST,
            exec: 'react-scripts test',
        });
        (_f = project.npmignore) === null || _f === void 0 ? void 0 : _f.exclude('# Build', '/build');
        project.gitignore.exclude('# Build', '/build');
        project.package.addField('eslintConfig', {
            extends: [
                'react-app',
                'react-app/jest',
            ],
        });
        project.package.addField('browserslist', {
            production: [
                '>0.2%',
                'not dead',
                'not op_mini all',
            ],
            development: [
                'last 1 chrome version',
                'last 1 firefox version',
                'last 1 safari version',
            ],
        });
    }
}
exports.ReactComponent = ReactComponent;
_c = JSII_RTTI_SYMBOL_1;
ReactComponent[_c] = { fqn: "projen.web.ReactComponent", version: "0.16.40" };
class ReactSampleCode extends component_1.Component {
    constructor(project, options) {
        var _e;
        super(project);
        this.fileExt = (_e = options.fileExt) !== null && _e !== void 0 ? _e : 'jsx';
        this.srcdir = options.srcdir;
        const logoSvg = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 841.9 595.3">',
            '    <g fill="#61DAFB">',
            '        <path d="M666.3 296.5c0-32.5-40.7-63.3-103.1-82.4 14.4-63.6 8-114.2-20.2-130.4-6.5-3.8-14.1-5.6-22.4-5.6v22.3c4.6 0 8.3.9 11.4 2.6 13.6 7.8 19.5 37.5 14.9 75.7-1.1 9.4-2.9 19.3-5.1 29.4-19.6-4.8-41-8.5-63.5-10.9-13.5-18.5-27.5-35.3-41.6-50 32.6-30.3 63.2-46.9 84-46.9V78c-27.5 0-63.5 19.6-99.9 53.6-36.4-33.8-72.4-53.2-99.9-53.2v22.3c20.7 0 51.4 16.5 84 46.6-14 14.7-28 31.4-41.3 49.9-22.6 2.4-44 6.1-63.6 11-2.3-10-4-19.7-5.2-29-4.7-38.2 1.1-67.9 14.6-75.8 3-1.8 6.9-2.6 11.5-2.6V78.5c-8.4 0-16 1.8-22.6 5.6-28.1 16.2-34.4 66.7-19.9 130.1-62.2 19.2-102.7 49.9-102.7 82.3 0 32.5 40.7 63.3 103.1 82.4-14.4 63.6-8 114.2 20.2 130.4 6.5 3.8 14.1 5.6 22.5 5.6 27.5 0 63.5-19.6 99.9-53.6 36.4 33.8 72.4 53.2 99.9 53.2 8.4 0 16-1.8 22.6-5.6 28.1-16.2 34.4-66.7 19.9-130.1 62-19.1 102.5-49.9 102.5-82.3zm-130.2-66.7c-3.7 12.9-8.3 26.2-13.5 39.5-4.1-8-8.4-16-13.1-24-4.6-8-9.5-15.8-14.4-23.4 14.2 2.1 27.9 4.7 41 7.9zm-45.8 106.5c-7.8 13.5-15.8 26.3-24.1 38.2-14.9 1.3-30 2-45.2 2-15.1 0-30.2-.7-45-1.9-8.3-11.9-16.4-24.6-24.2-38-7.6-13.1-14.5-26.4-20.8-39.8 6.2-13.4 13.2-26.8 20.7-39.9 7.8-13.5 15.8-26.3 24.1-38.2 14.9-1.3 30-2 45.2-2 15.1 0 30.2.7 45 1.9 8.3 11.9 16.4 24.6 24.2 38 7.6 13.1 14.5 26.4 20.8 39.8-6.3 13.4-13.2 26.8-20.7 39.9zm32.3-13c5.4 13.4 10 26.8 13.8 39.8-13.1 3.2-26.9 5.9-41.2 8 4.9-7.7 9.8-15.6 14.4-23.7 4.6-8 8.9-16.1 13-24.1zM421.2 430c-9.3-9.6-18.6-20.3-27.8-32 9 .4 18.2.7 27.5.7 9.4 0 18.7-.2 27.8-.7-9 11.7-18.3 22.4-27.5 32zm-74.4-58.9c-14.2-2.1-27.9-4.7-41-7.9 3.7-12.9 8.3-26.2 13.5-39.5 4.1 8 8.4 16 13.1 24 4.7 8 9.5 15.8 14.4 23.4zM420.7 163c9.3 9.6 18.6 20.3 27.8 32-9-.4-18.2-.7-27.5-.7-9.4 0-18.7.2-27.8.7 9-11.7 18.3-22.4 27.5-32zm-74 58.9c-4.9 7.7-9.8 15.6-14.4 23.7-4.6 8-8.9 16-13 24-5.4-13.4-10-26.8-13.8-39.8 13.1-3.1 26.9-5.8 41.2-7.9zm-90.5 125.2c-35.4-15.1-58.3-34.9-58.3-50.6 0-15.7 22.9-35.6 58.3-50.6 8.6-3.7 18-7 27.7-10.1 5.7 19.6 13.2 40 22.5 60.9-9.2 20.8-16.6 41.1-22.2 60.6-9.9-3.1-19.3-6.5-28-10.2zM310 490c-13.6-7.8-19.5-37.5-14.9-75.7 1.1-9.4 2.9-19.3 5.1-29.4 19.6 4.8 41 8.5 63.5 10.9 13.5 18.5 27.5 35.3 41.6 50-32.6 30.3-63.2 46.9-84 46.9-4.5-.1-8.3-1-11.3-2.7zm237.2-76.2c4.7 38.2-1.1 67.9-14.6 75.8-3 1.8-6.9 2.6-11.5 2.6-20.7 0-51.4-16.5-84-46.6 14-14.7 28-31.4 41.3-49.9 22.6-2.4 44-6.1 63.6-11 2.3 10.1 4.1 19.8 5.2 29.1zm38.5-66.7c-8.6 3.7-18 7-27.7 10.1-5.7-19.6-13.2-40-22.5-60.9 9.2-20.8 16.6-41.1 22.2-60.6 9.9 3.1 19.3 6.5 28.1 10.2 35.4 15.1 58.3 34.9 58.3 50.6-.1 15.7-23 35.6-58.4 50.6zM320.8 78.4z"/>',
            '        <circle cx="420.9" cy="296.5" r="45.7"/>',
            '        <path d="M520.5 78.1z"/>',
            '    </g>',
            '</svg>',
            '',
        ];
        const appJsx = [
            "import logo from './logo.svg';",
            "import './App.css'",
            '',
            'function App() {',
            '  return (',
            '   <div className="App">',
            '      <header className="App-header">',
            '        <img src={logo} className="App-logo" alt="logo" />',
            '        <p>',
            `          Edit <code>src/App.${this.fileExt}</code> and save to reload.`,
            '        </p>',
            '        <a className="App-link"',
            '          href="https://reactjs.org"',
            '          target="_blank"',
            '          rel="noopener noreferrer"',
            '        >',
            '          Learn React',
            '        </a>',
            '      </header>',
            '    </div>',
            '  );',
            '}',
            '',
            'export default App;',
            '',
        ];
        const appCss = [
            '.App {',
            '  text-align: center;',
            '}',
            '',
            '.App-logo {',
            '  height: 40vmin;',
            '  pointer-events: none;',
            '}',
            '',
            '@media (prefers-reduced-motion: no-preference) {',
            '  .App-logo {',
            '    animation: App-logo-spin infinite 20s linear;',
            '  }',
            '}',
            '',
            '.App-header {',
            '  background-color: #282c34;',
            '  min-height: 100vh;',
            '  display: flex;',
            '  flex-direction: column;',
            '  align-items: center;',
            '  justify-content: center;',
            '  font-size: calc(10px + 2vmin);',
            '  color: white;',
            '}',
            '',
            '.App-link {',
            '  color: #61dafb;',
            '}',
            '',
            '@keyframes App-logo-spin {',
            '  from {',
            '    transform: rotate(0deg);',
            '  }',
            '  to {',
            '    transform: rotate(360deg);',
            '  }',
            '}',
            '',
        ];
        const appTestJsx = [
            "import React from 'react';",
            "import { render, screen } from '@testing-library/react';",
            "import App from './App';",
            '',
            "test('renders learn react link', () => {",
            '  render(<App />);',
            '  const linkElement = screen.getByText(/learn react/i);',
            '  expect(linkElement).toBeInTheDocument();',
            '});',
            '',
        ];
        const indexJsx = [
            "import React from 'react';",
            "import ReactDOM from 'react-dom';",
            "import './index.css';",
            "import App from './App';",
            "import reportWebVitals from './reportWebVitals';",
            '',
            'ReactDOM.render(',
            '  <React.StrictMode>',
            '    <App />',
            '  </React.StrictMode>,',
            "  document.getElementById('root')",
            ');',
            '',
            '// If you want to start measuring performance in your app, pass a function',
            '// to log results (for example: reportWebVitals(console.log))',
            '// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals',
            'reportWebVitals();',
            '',
        ];
        const indexCss = [
            'body {',
            '  margin: 0;',
            "  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',",
            "    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',",
            '    sans-serif;',
            '  -webkit-font-smoothing: antialiased;',
            '  -moz-osx-font-smoothing: grayscale;',
            '}',
            '',
            'code {',
            "  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',",
            '    monospace;',
            '}',
            '',
        ];
        const reportWebVitalsJs = [
            "import { ReportHandler } from 'web-vitals';",
            '',
            'const reportWebVitals = (onPerfEntry?: ReportHandler) => {',
            '  if (onPerfEntry && onPerfEntry instanceof Function) {',
            "    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {",
            '      getCLS(onPerfEntry);',
            '      getFID(onPerfEntry);',
            '      getFCP(onPerfEntry);',
            '      getLCP(onPerfEntry);',
            '      getTTFB(onPerfEntry);',
            '    });',
            '  }',
            '}',
            '',
            'export default reportWebVitals;',
        ];
        const setupTestsJs = [
            '// jest-dom adds custom jest matchers for asserting on DOM nodes.',
            '// allows you to do things like:',
            '// expect(element).toHaveTextContent(/react/i)',
            '// learn more: https://github.com/testing-library/jest-dom',
            "import '@testing-library/jest-dom';",
            '',
        ];
        // js/ts not jsx/tsx
        const fileExtWithoutX = this.fileExt.replace('x', '');
        new sample_file_1.SampleDir(project, this.srcdir, {
            files: {
                'logo.svg': logoSvg.join('\n'),
                ['App.' + this.fileExt]: appJsx.join('\n'),
                ['App.test.' + this.fileExt]: appTestJsx.join('\n'),
                'App.css': appCss.join('\n'),
                ['index.' + this.fileExt]: indexJsx.join('\n'),
                'index.css': indexCss.join('\n'),
                ['reportWebVitals.' + fileExtWithoutX]: reportWebVitalsJs.join('\n'),
                ['setupTests.' + fileExtWithoutX]: setupTestsJs.join('\n'),
            },
        });
        const indexHtml = [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '  <head>',
            '    <meta charset="utf-8" />',
            '    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />',
            '    <meta name = "viewport" content = "width=device-width, initial-scale=1" />',
            '    <meta name="theme-color" content = "#000000" />',
            '    <meta name="description" content = "Web site created using create-react-app" />',
            '    <link rel="apple-touch-icon" href = "%PUBLIC_URL%/logo192.png" />',
            '    <!--',
            '      manifest.json provides metadata used when your web app is installed on a',
            "      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/",
            '    -->',
            '    <link rel="manifest" href = "%PUBLIC_URL%/manifest.json" />',
            '    <!--',
            '      Notice the use of % PUBLIC_URL % in the tags above.',
            '      It will be replaced with the URL of the`public` folder during the build.',
            '      Only files inside the`public` folder can be referenced from the HTML.',
            '',
            '      Unlike "/favicon.ico" or "favicon.ico", "%PUBLIC_URL%/favicon.ico" will',
            '      work correctly both with client - side routing and a non - root public URL.',
            '      Learn how to configure a non-root public URL by running`npm run build`.',
            '    -->',
            '    <title>React App </title>',
            '  </head>',
            '  <body>',
            '    <noscript>You need to enable JavaScript to run this app.</noscript>',
            '    <div id="root"> </div>',
            '    <!--',
            '      This HTML file is a template.',
            '      If you open it directly in the browser, you will see an empty page.',
            '      You can add webfonts, meta tags, or analytics to this file.',
            '      The build step will place the bundled scripts into the <body> tag.',
            '',
            '      To begin the development, run `npm start` or `yarn start`.',
            '      To create a production bundle, use `npm run build` or `yarn build`.',
            '    -->',
            '  </body>',
            '</html>',
        ];
        const publicManifest = {
            short_name: 'React App',
            name: 'Create React App Sample',
            icons: [],
            start_url: '.',
            display: 'standalone',
            theme_color: '#000000',
            background_color: '#ffffff',
        };
        const robotTxt = [
            '# https://www.robotstxt.org/robotstxt.html',
            'User-agent: *',
            'Disallow:',
        ];
        new sample_file_1.SampleDir(project, 'public', {
            files: {
                'index.html': indexHtml.join('\n'),
                'manifest.json': JSON.stringify(publicManifest, undefined, 2),
                'robots.txt': robotTxt.join('\n'),
            },
        });
    }
}
/**
 * @experimental
 */
class ReactTypeDef extends file_1.FileBase {
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
            '/// <reference types="react-scripts" />',
        ].join('\n');
    }
}
exports.ReactTypeDef = ReactTypeDef;
_d = JSII_RTTI_SYMBOL_1;
ReactTypeDef[_d] = { fqn: "projen.web.ReactTypeDef", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhY3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvd2ViL3JlYWN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNENBQXlDO0FBQ3pDLGtDQUErRDtBQUMvRCxrREFBa0U7QUFDbEUsZ0RBQTJDO0FBQzNDLG9DQUF3QztBQUN4Qyw4Q0FBOEg7QUFDOUgsa0NBQW9DOzs7Ozs7O0FBdUJwQyxNQUFhLFlBQWEsU0FBUSwwQkFBVzs7OztJQU8zQyxZQUFZLE9BQTRCOztRQUN0QyxLQUFLLENBQUM7WUFDSixJQUFJLEVBQUUsS0FBSztZQUNYLEdBQUcsT0FBTztTQUNYLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxNQUFNLFNBQUcsT0FBTyxDQUFDLE1BQU0sbUNBQUksS0FBSyxDQUFDO1FBRXRDLElBQUksY0FBYyxDQUFDLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBRWhELDZGQUE2RjtRQUM3RixVQUFJLE9BQU8sQ0FBQyxVQUFVLG1DQUFJLElBQUksRUFBRTtZQUM5QixJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3hCLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTthQUNwQixDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7O0FBeEJILG9DQXlCQzs7Ozs7Ozs7O0FBT0QsTUFBYSxzQkFBdUIsU0FBUSxpQ0FBb0I7Ozs7SUFhOUQsWUFBWSxPQUFzQzs7UUFDaEQsTUFBTSxjQUFjLEdBQUc7WUFDckIsTUFBTSxFQUFFLEtBQUs7WUFDYixNQUFNLEVBQUUsS0FBSztZQUNiLElBQUksRUFBRSxLQUFLO1lBQ1gsUUFBUSxFQUFFO2dCQUNSLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztnQkFDaEIsZUFBZSxFQUFFO29CQUNmLE1BQU0sRUFBRSxLQUFLO29CQUNiLEdBQUcsRUFBRTt3QkFDSCxLQUFLO3dCQUNMLGNBQWM7d0JBQ2QsUUFB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dCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWxlQmFzZSwgRmlsZUJhc2VPcHRpb25zLCBJUmVzb2x2ZXIgfSBmcm9tICcuLi9maWxlJztcbmltcG9ydCB7IE5vZGVQcm9qZWN0LCBOb2RlUHJvamVjdE9wdGlvbnMgfSBmcm9tICcuLi9ub2RlLXByb2plY3QnO1xuaW1wb3J0IHsgU2FtcGxlRGlyIH0gZnJvbSAnLi4vc2FtcGxlLWZpbGUnO1xuaW1wb3J0IHsgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdEFwcFByb2plY3QsIFR5cGVTY3JpcHRKc3hNb2RlLCBUeXBlU2NyaXB0TW9kdWxlUmVzb2x1dGlvbiwgVHlwZVNjcmlwdFByb2plY3RPcHRpb25zIH0gZnJvbSAnLi4vdHlwZXNjcmlwdCc7XG5pbXBvcnQgeyBkZWVwTWVyZ2UgfSBmcm9tICcuLi91dGlsJztcblxuZXhwb3J0IGludGVyZmFjZSBSZWFjdFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucyBleHRlbmRzIFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucyB7IH1cblxuZXhwb3J0IGludGVyZmFjZSBSZWFjdFByb2plY3RPcHRpb25zIGV4dGVuZHMgTm9kZVByb2plY3RPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNyY2Rpcj86IHN0cmluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IHNhbXBsZUNvZGU/OiBib29sZWFuO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIFJlYWN0UHJvamVjdCBleHRlbmRzIE5vZGVQcm9qZWN0IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBzcmNkaXI6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBSZWFjdFByb2plY3RPcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgamVzdDogZmFsc2UsXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuXG4gICAgdGhpcy5zcmNkaXIgPSBvcHRpb25zLnNyY2RpciA/PyAnc3JjJztcblxuICAgIG5ldyBSZWFjdENvbXBvbmVudCh0aGlzLCB7IHR5cGVzY3JpcHQ6IGZhbHNlIH0pO1xuXG4gICAgLy8gZ2VuZXJhdGUgc2FtcGxlIGNvZGUgaW4gYHNyY2AgYW5kIGBwdWJsaWNgIGlmIHRoZXNlIGRpcmVjdG9yaWVzIGFyZSBlbXB0eSBvciBub24tZXhpc3RlbnQuXG4gICAgaWYgKG9wdGlvbnMuc2FtcGxlQ29kZSA/PyB0cnVlKSB7XG4gICAgICBuZXcgUmVhY3RTYW1wbGVDb2RlKHRoaXMsIHtcbiAgICAgICAgZmlsZUV4dDogJ2pzeCcsXG4gICAgICAgIHNyY2RpcjogdGhpcy5zcmNkaXIsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbmV4cG9ydCBjbGFzcyBSZWFjdFR5cGVTY3JpcHRQcm9qZWN0IGV4dGVuZHMgVHlwZVNjcmlwdEFwcFByb2plY3Qge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSBzcmNkaXI6IHN0cmluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyByZWFkb25seSByZWFjdFR5cGVEZWY6IFJlYWN0VHlwZURlZjtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBSZWFjdFR5cGVTY3JpcHRQcm9qZWN0T3B0aW9ucykge1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgc3JjZGlyOiAnc3JjJyxcbiAgICAgIGVzbGludDogZmFsc2UsXG4gICAgICBqZXN0OiBmYWxzZSxcbiAgICAgIHRzY29uZmlnOiB7XG4gICAgICAgIGluY2x1ZGU6IFsnc3JjJ10sXG4gICAgICAgIGNvbXBpbGVyT3B0aW9uczoge1xuICAgICAgICAgIHRhcmdldDogJ2VzNScsXG4gICAgICAgICAgbGliOiBbXG4gICAgICAgICAgICAnZG9tJyxcbiAgICAgICAgICAgICdkb20uaXRlcmFibGUnLFxuICAgICAgICAgICAgJ2VzbmV4dCcsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBhbGxvd0pzOiB0cnVlLFxuICAgICAgICAgIHNraXBMaWJDaGVjazogdHJ1ZSxcbiAgICAgICAgICBlc01vZHVsZUludGVyb3A6IHRydWUsXG4gICAgICAgICAgYWxsb3dTeW50aGV0aWNEZWZhdWx0SW1wb3J0czogdHJ1ZSxcbiAgICAgICAgICBzdHJpY3Q6IHRydWUsXG4gICAgICAgICAgZm9yY2VDb25zaXN0ZW50Q2FzaW5nSW5GaWxlTmFtZXM6IHRydWUsXG4gICAgICAgICAgbm9GYWxsdGhyb3VnaENhc2VzSW5Td2l0Y2g6IHRydWUsXG4gICAgICAgICAgbW9kdWxlOiAnZXNuZXh0JyxcbiAgICAgICAgICBtb2R1bGVSZXNvbHV0aW9uOiBUeXBlU2NyaXB0TW9kdWxlUmVzb2x1dGlvbi5OT0RFLFxuICAgICAgICAgIHJlc29sdmVKc29uTW9kdWxlOiB0cnVlLFxuICAgICAgICAgIGlzb2xhdGVkTW9kdWxlczogdHJ1ZSxcbiAgICAgICAgICBub0VtaXQ6IHRydWUsXG4gICAgICAgICAganN4OiBUeXBlU2NyaXB0SnN4TW9kZS5SRUFDVF9KU1gsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgdHlwZXNjcmlwdFZlcnNpb246IG9wdGlvbnMudHlwZXNjcmlwdFZlcnNpb24gPz8gJ140LjAuMycsXG4gICAgfTtcblxuICAgIC8vIG5ldmVyIGdlbmVyYXRlIGRlZmF1bHQgVHlwZVNjcmlwdCBzYW1wbGUgY29kZSwgc2luY2UgdGhpcyBjbGFzcyBwcm92aWRlcyBpdHMgb3duXG4gICAgc3VwZXIoZGVlcE1lcmdlKFtkZWZhdWx0T3B0aW9ucywgb3B0aW9ucywgeyBzYW1wbGVDb2RlOiBmYWxzZSB9XSkgYXMgVHlwZVNjcmlwdFByb2plY3RPcHRpb25zKTtcblxuICAgIHRoaXMuc3JjZGlyID0gb3B0aW9ucy5zcmNkaXIgPz8gJ3NyYyc7XG5cbiAgICBuZXcgUmVhY3RDb21wb25lbnQodGhpcywgeyB0eXBlc2NyaXB0OiB0cnVlIH0pO1xuXG4gICAgdGhpcy5yZWFjdFR5cGVEZWYgPSBuZXcgUmVhY3RUeXBlRGVmKHRoaXMsICdyZWFjdC1hcHAtZW52LmQudHMnKTtcblxuICAgIC8vIGdlbmVyYXRlIHNhbXBsZSBjb2RlIGluIGBzcmNgIGFuZCBgcHVibGljYCBpZiB0aGVzZSBkaXJlY3RvcmllcyBhcmUgZW1wdHkgb3Igbm9uLWV4aXN0ZW50LlxuICAgIGlmIChvcHRpb25zLnNhbXBsZUNvZGUgPz8gdHJ1ZSkge1xuICAgICAgbmV3IFJlYWN0U2FtcGxlQ29kZSh0aGlzLCB7XG4gICAgICAgIGZpbGVFeHQ6ICd0c3gnLFxuICAgICAgICBzcmNkaXI6IHRoaXMuc3JjZGlyLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVhY3RDb21wb25lbnRPcHRpb25zIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgdHlwZXNjcmlwdD86IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBSZWFjdENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgdHlwZXNjcmlwdDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcihwcm9qZWN0OiBOb2RlUHJvamVjdCwgb3B0aW9uczogUmVhY3RDb21wb25lbnRPcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICB0aGlzLnR5cGVzY3JpcHQgPSBvcHRpb25zLnR5cGVzY3JpcHQgPz8gZmFsc2U7XG5cbiAgICAvLyBObyBjb21waWxlIGZvciByZWFjdCBhcHBcbiAgICBwcm9qZWN0LmNvbXBpbGVUYXNrLnJlc2V0KCk7XG5cbiAgICBwcm9qZWN0LmFkZERlcHMoJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1zY3JpcHRzQF40LjAuMCcsICd3ZWItdml0YWxzJyk7XG4gICAgcHJvamVjdC5hZGREZXZEZXBzKCdAdGVzdGluZy1saWJyYXJ5L2plc3QtZG9tJywgJ0B0ZXN0aW5nLWxpYnJhcnkvcmVhY3QnLCAnQHRlc3RpbmctbGlicmFyeS91c2VyLWV2ZW50Jyk7XG4gICAgaWYgKHRoaXMudHlwZXNjcmlwdCkge1xuICAgICAgcHJvamVjdC5hZGREZXZEZXBzKCdAdHlwZXMvamVzdCcsICdAdHlwZXMvbm9kZScsICdAdHlwZXMvcmVhY3QnLCAnQHR5cGVzL3JlYWN0LWRvbScpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBSZWFjdCBBcHAgQ0xJIGNvbW1hbmRzLCBzZWU6IGh0dHBzOi8vY3JlYXRlLXJlYWN0LWFwcC5kZXYvZG9jcy9hdmFpbGFibGUtc2NyaXB0cy9cbiAgICBwcm9qZWN0LmFkZFRhc2soJ2RldicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3RhcnRzIHRoZSByZWFjdCBhcHBsaWNhdGlvbicsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5LkJVSUxELFxuICAgICAgZXhlYzogJ3JlYWN0LXNjcmlwdHMgc3RhcnQnLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5hZGRUYXNrKCdidWlsZCcsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ3JlYXRlcyBhbiBvcHRpbWl6ZWQgcHJvZHVjdGlvbiBidWlsZCBvZiB5b3VyIFJlYWN0IGFwcGxpY2F0aW9uJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuQlVJTEQsXG4gICAgICBleGVjOiAncmVhY3Qtc2NyaXB0cyBidWlsZCcsXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LmFkZFRhc2soJ2VqZWN0Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdFamVjdHMgeW91ciBSZWFjdCBhcHBsaWNhdGlvbiBmcm9tIHJlYWN0LXNjcmlwdHMnLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5NSVNDLFxuICAgICAgZXhlYzogJ3JlYWN0LXNjcmlwdHMgZWplY3QnLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5hZGRUYXNrKCd0ZXN0Jywge1xuICAgICAgZGVzY3JpcHRpb246ICdSdW5zIHRlc3RzJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuVEVTVCxcbiAgICAgIGV4ZWM6ICdyZWFjdC1zY3JpcHRzIHRlc3QnLFxuICAgIH0pO1xuXG4gICAgcHJvamVjdC5ucG1pZ25vcmU/LmV4Y2x1ZGUoJyMgQnVpbGQnLCAnL2J1aWxkJyk7XG4gICAgcHJvamVjdC5naXRpZ25vcmUuZXhjbHVkZSgnIyBCdWlsZCcsICcvYnVpbGQnKTtcblxuICAgIHByb2plY3QucGFja2FnZS5hZGRGaWVsZCgnZXNsaW50Q29uZmlnJywge1xuICAgICAgZXh0ZW5kczogW1xuICAgICAgICAncmVhY3QtYXBwJyxcbiAgICAgICAgJ3JlYWN0LWFwcC9qZXN0JyxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LnBhY2thZ2UuYWRkRmllbGQoJ2Jyb3dzZXJzbGlzdCcsIHtcbiAgICAgIHByb2R1Y3Rpb246IFtcbiAgICAgICAgJz4wLjIlJyxcbiAgICAgICAgJ25vdCBkZWFkJyxcbiAgICAgICAgJ25vdCBvcF9taW5pIGFsbCcsXG4gICAgICBdLFxuICAgICAgZGV2ZWxvcG1lbnQ6IFtcbiAgICAgICAgJ2xhc3QgMSBjaHJvbWUgdmVyc2lvbicsXG4gICAgICAgICdsYXN0IDEgZmlyZWZveCB2ZXJzaW9uJyxcbiAgICAgICAgJ2xhc3QgMSBzYWZhcmkgdmVyc2lvbicsXG4gICAgICBdLFxuICAgIH0pO1xuICB9XG59XG5cbmludGVyZmFjZSBSZWFjdFNhbXBsZUNvZGVPcHRpb25zIHtcbiAgLyoqXG4gICAqIEZpbGUgZXh0ZW5zaW9uIGZvciBzYW1wbGUgamF2YXNjcmlwdCBjb2RlIHRvIGJlIHNhdmVkIGFzLlxuICAgKlxuICAgKiBAZGVmYXVsdCBcImpzeFwiXG4gICAqL1xuICByZWFkb25seSBmaWxlRXh0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgZGlyZWN0b3J5IGluIHdoaWNoIFJlYWN0IGpzeCBmaWxlcyBhcmUgZGVjbGFyZWQuXG4gICAqL1xuICByZWFkb25seSBzcmNkaXI6IHN0cmluZztcbn1cblxuY2xhc3MgUmVhY3RTYW1wbGVDb2RlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByZWFkb25seSBmaWxlRXh0OiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgc3JjZGlyOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogTm9kZVByb2plY3QsIG9wdGlvbnM6IFJlYWN0U2FtcGxlQ29kZU9wdGlvbnMpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIHRoaXMuZmlsZUV4dCA9IG9wdGlvbnMuZmlsZUV4dCA/PyAnanN4JztcbiAgICB0aGlzLnNyY2RpciA9IG9wdGlvbnMuc3JjZGlyO1xuXG4gICAgY29uc3QgbG9nb1N2ZyA9IFtcbiAgICAgICc8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDg0MS45IDU5NS4zXCI+JyxcbiAgICAgICcgICAgPGcgZmlsbD1cIiM2MURBRkJcIj4nLFxuICAgICAgJyAgICAgICAgPHBhdGggZD1cIk02NjYuMyAyOTYuNWMwLTMyLjUtNDAuNy02My4zLTEwMy4xLTgyLjQgMTQuNC02My42IDgtMTE0LjItMjAuMi0xMzAuNC02LjUtMy44LTE0LjEtNS42LTIyLjQtNS42djIyLjNjNC42IDAgOC4zLjkgMTEuNCAyLjYgMTMuNiA3LjggMTkuNSAzNy41IDE0LjkgNzUuNy0xLjEgOS40LTIuOSAxOS4zLTUuMSAyOS40LTE5LjYtNC44LTQxLTguNS02My41LTEwLjktMTMuNS0xOC41LTI3LjUtMzUuMy00MS42LTUwIDMyLjYtMzAuMyA2My4yLTQ2LjkgODQtNDYuOVY3OGMtMjcuNSAwLTYzLjUgMTkuNi05OS45IDUzLjYtMzYuNC0zMy44LTcyLjQtNTMuMi05OS45LTUzLjJ2MjIuM2MyMC43IDAgNTEuNCAxNi41IDg0IDQ2LjYtMTQgMTQuNy0yOCAzMS40LTQxLjMgNDkuOS0yMi42IDIuNC00NCA2LjEtNjMuNiAxMS0yLjMtMTAtNC0xOS43LTUuMi0yOS00LjctMzguMiAxLjEtNjcuOSAxNC42LTc1LjggMy0xLjggNi45LTIuNiAxMS41LTIuNlY3OC41Yy04LjQgMC0xNiAxLjgtMjIuNiA1LjYtMjguMSAxNi4yLTM0LjQgNjYuNy0xOS45IDEzMC4xLTYyLjIgMTkuMi0xMDIuNyA0OS45LTEwMi43IDgyLjMgMCAzMi41IDQwLjcgNjMuMyAxMDMuMSA4Mi40LTE0LjQgNjMuNi04IDExNC4yIDIwLjIgMTMwLjQgNi41IDMuOCAxNC4xIDUuNiAyMi41IDUuNiAyNy41IDAgNjMuNS0xOS42IDk5LjktNTMuNiAzNi40IDMzLjggNzIuNCA1My4yIDk5LjkgNTMuMiA4LjQgMCAxNi0xLjggMjIuNi01LjYgMjguMS0xNi4yIDM0LjQtNjYuNyAxOS45LTEzMC4xIDYyLTE5LjEgMTAyLjUtNDkuOSAxMDIuNS04Mi4zem0tMTMwLjItNjYuN2MtMy43IDEyLjktOC4zIDI2LjItMTMuNSAzOS41LTQuMS04LTguNC0xNi0xMy4xLTI0LTQuNi04LTkuNS0xNS44LTE0LjQtMjMuNCAxNC4yIDIuMSAyNy45IDQuNyA0MSA3Ljl6bS00NS44IDEwNi41Yy03LjggMTMuNS0xNS44IDI2LjMtMjQuMSAzOC4yLTE0LjkgMS4zLTMwIDItNDUuMiAyLTE1LjEgMC0zMC4yLS43LTQ1LTEuOS04LjMtMTEuOS0xNi40LTI0LjYtMjQuMi0zOC03LjYtMTMuMS0xNC41LTI2LjQtMjAuOC0zOS44IDYuMi0xMy40IDEzLjItMjYuOCAyMC43LTM5LjkgNy44LTEzLjUgMTUuOC0yNi4zIDI0LjEtMzguMiAxNC45LTEuMyAzMC0yIDQ1LjItMiAxNS4xIDAgMzAuMi43IDQ1IDEuOSA4LjMgMTEuOSAxNi40IDI0LjYgMjQuMiAzOCA3LjYgMTMuMSAxNC41IDI2LjQgMjAuOCAzOS44LTYuMyAxMy40LTEzLjIgMjYuOC0yMC43IDM5Ljl6bTMyLjMtMTNjNS40IDEzLjQgMTAgMjYuOCAxMy44IDM5LjgtMTMuMSAzLjItMjYuOSA1LjktNDEuMiA4IDQuOS03LjcgOS44LTE1LjYgMTQuNC0yMy43IDQuNi04IDguOS0xNi4xIDEzLTI0LjF6TTQyMS4yIDQzMGMtOS4zLTkuNi0xOC42LTIwLjMtMjcuOC0zMiA5IC40IDE4LjIuNyAyNy41LjcgOS40IDAgMTguNy0uMiAyNy44LS43LTkgMTEuNy0xOC4zIDIyLjQtMjcuNSAzMnptLTc0LjQtNTguOWMtMTQuMi0yLjEtMjcuOS00LjctNDEtNy45IDMuNy0xMi45IDguMy0yNi4yIDEzLjUtMzkuNSA0LjEgOCA4LjQgMTYgMTMuMSAyNCA0LjcgOCA5LjUgMTUuOCAxNC40IDIzLjR6TTQyMC43IDE2M2M5LjMgOS42IDE4LjYgMjAuMyAyNy44IDMyLTktLjQtMTguMi0uNy0yNy41LS43LTkuNCAwLTE4LjcuMi0yNy44LjcgOS0xMS43IDE4LjMtMjIuNCAyNy41LTMyem0tNzQgNTguOWMtNC45IDcuNy05LjggMTUuNi0xNC40IDIzLjctNC42IDgtOC45IDE2LTEzIDI0LTUuNC0xMy40LTEwLTI2LjgtMTMuOC0zOS44IDEzLjEtMy4xIDI2LjktNS44IDQxLjItNy45em0tOTAuNSAxMjUuMmMtMzUuNC0xNS4xLTU4LjMtMzQuOS01OC4zLTUwLjYgMC0xNS43IDIyLjktMzUuNiA1OC4zLTUwLjYgOC42LTMuNyAxOC03IDI3LjctMTAuMSA1LjcgMTkuNiAxMy4yIDQwIDIyLjUgNjAuOS05LjIgMjAuOC0xNi42IDQxLjEtMjIuMiA2MC42LTkuOS0zLjEtMTkuMy02LjUtMjgtMTAuMnpNMzEwIDQ5MGMtMTMuNi03LjgtMTkuNS0zNy41LTE0LjktNzUuNyAxLjEtOS40IDIuOS0xOS4zIDUuMS0yOS40IDE5LjYgNC44IDQxIDguNSA2My41IDEwLjkgMTMuNSAxOC41IDI3LjUgMzUuMyA0MS42IDUwLTMyLjYgMzAuMy02My4yIDQ2LjktODQgNDYuOS00LjUtLjEtOC4zLTEtMTEuMy0yLjd6bTIzNy4yLTc2LjJjNC43IDM4LjItMS4xIDY3LjktMTQuNiA3NS44LTMgMS44LTYuOSAyLjYtMTEuNSAyLjYtMjAuNyAwLTUxLjQtMTYuNS04NC00Ni42IDE0LTE0LjcgMjgtMzEuNCA0MS4zLTQ5LjkgMjIuNi0yLjQgNDQtNi4xIDYzLjYtMTEgMi4zIDEwLjEgNC4xIDE5LjggNS4yIDI5LjF6bTM4LjUtNjYuN2MtOC42IDMuNy0xOCA3LTI3LjcgMTAuMS01LjctMTkuNi0xMy4yLTQwLTIyLjUtNjAuOSA5LjItMjAuOCAxNi42LTQxLjEgMjIuMi02MC42IDkuOSAzLjEgMTkuMyA2LjUgMjguMSAxMC4yIDM1LjQgMTUuMSA1OC4zIDM0LjkgNTguMyA1MC42LS4xIDE1LjctMjMgMzUuNi01OC40IDUwLjZ6TTMyMC44IDc4LjR6XCIvPicsXG4gICAgICAnICAgICAgICA8Y2lyY2xlIGN4PVwiNDIwLjlcIiBjeT1cIjI5Ni41XCIgcj1cIjQ1LjdcIi8+JyxcbiAgICAgICcgICAgICAgIDxwYXRoIGQ9XCJNNTIwLjUgNzguMXpcIi8+JyxcbiAgICAgICcgICAgPC9nPicsXG4gICAgICAnPC9zdmc+JyxcbiAgICAgICcnLFxuICAgIF07XG5cbiAgICBjb25zdCBhcHBKc3ggPSBbXG4gICAgICBcImltcG9ydCBsb2dvIGZyb20gJy4vbG9nby5zdmcnO1wiLFxuICAgICAgXCJpbXBvcnQgJy4vQXBwLmNzcydcIixcbiAgICAgICcnLFxuICAgICAgJ2Z1bmN0aW9uIEFwcCgpIHsnLFxuICAgICAgJyAgcmV0dXJuICgnLFxuICAgICAgJyAgIDxkaXYgY2xhc3NOYW1lPVwiQXBwXCI+JyxcbiAgICAgICcgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cIkFwcC1oZWFkZXJcIj4nLFxuICAgICAgJyAgICAgICAgPGltZyBzcmM9e2xvZ299IGNsYXNzTmFtZT1cIkFwcC1sb2dvXCIgYWx0PVwibG9nb1wiIC8+JyxcbiAgICAgICcgICAgICAgIDxwPicsXG4gICAgICBgICAgICAgICAgIEVkaXQgPGNvZGU+c3JjL0FwcC4ke3RoaXMuZmlsZUV4dH08L2NvZGU+IGFuZCBzYXZlIHRvIHJlbG9hZC5gLFxuICAgICAgJyAgICAgICAgPC9wPicsXG4gICAgICAnICAgICAgICA8YSBjbGFzc05hbWU9XCJBcHAtbGlua1wiJyxcbiAgICAgICcgICAgICAgICAgaHJlZj1cImh0dHBzOi8vcmVhY3Rqcy5vcmdcIicsXG4gICAgICAnICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiJyxcbiAgICAgICcgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiJyxcbiAgICAgICcgICAgICAgID4nLFxuICAgICAgJyAgICAgICAgICBMZWFybiBSZWFjdCcsXG4gICAgICAnICAgICAgICA8L2E+JyxcbiAgICAgICcgICAgICA8L2hlYWRlcj4nLFxuICAgICAgJyAgICA8L2Rpdj4nLFxuICAgICAgJyAgKTsnLFxuICAgICAgJ30nLFxuICAgICAgJycsXG4gICAgICAnZXhwb3J0IGRlZmF1bHQgQXBwOycsXG4gICAgICAnJyxcbiAgICBdO1xuXG4gICAgY29uc3QgYXBwQ3NzID0gW1xuICAgICAgJy5BcHAgeycsXG4gICAgICAnICB0ZXh0LWFsaWduOiBjZW50ZXI7JyxcbiAgICAgICd9JyxcbiAgICAgICcnLFxuICAgICAgJy5BcHAtbG9nbyB7JyxcbiAgICAgICcgIGhlaWdodDogNDB2bWluOycsXG4gICAgICAnICBwb2ludGVyLWV2ZW50czogbm9uZTsnLFxuICAgICAgJ30nLFxuICAgICAgJycsXG4gICAgICAnQG1lZGlhIChwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiBuby1wcmVmZXJlbmNlKSB7JyxcbiAgICAgICcgIC5BcHAtbG9nbyB7JyxcbiAgICAgICcgICAgYW5pbWF0aW9uOiBBcHAtbG9nby1zcGluIGluZmluaXRlIDIwcyBsaW5lYXI7JyxcbiAgICAgICcgIH0nLFxuICAgICAgJ30nLFxuICAgICAgJycsXG4gICAgICAnLkFwcC1oZWFkZXIgeycsXG4gICAgICAnICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjgyYzM0OycsXG4gICAgICAnICBtaW4taGVpZ2h0OiAxMDB2aDsnLFxuICAgICAgJyAgZGlzcGxheTogZmxleDsnLFxuICAgICAgJyAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjsnLFxuICAgICAgJyAgYWxpZ24taXRlbXM6IGNlbnRlcjsnLFxuICAgICAgJyAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7JyxcbiAgICAgICcgIGZvbnQtc2l6ZTogY2FsYygxMHB4ICsgMnZtaW4pOycsXG4gICAgICAnICBjb2xvcjogd2hpdGU7JyxcbiAgICAgICd9JyxcbiAgICAgICcnLFxuICAgICAgJy5BcHAtbGluayB7JyxcbiAgICAgICcgIGNvbG9yOiAjNjFkYWZiOycsXG4gICAgICAnfScsXG4gICAgICAnJyxcbiAgICAgICdAa2V5ZnJhbWVzIEFwcC1sb2dvLXNwaW4geycsXG4gICAgICAnICBmcm9tIHsnLFxuICAgICAgJyAgICB0cmFuc2Zvcm06IHJvdGF0ZSgwZGVnKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnICB0byB7JyxcbiAgICAgICcgICAgdHJhbnNmb3JtOiByb3RhdGUoMzYwZGVnKTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnfScsXG4gICAgICAnJyxcbiAgICBdO1xuXG4gICAgY29uc3QgYXBwVGVzdEpzeCA9IFtcbiAgICAgIFwiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcIixcbiAgICAgIFwiaW1wb3J0IHsgcmVuZGVyLCBzY3JlZW4gfSBmcm9tICdAdGVzdGluZy1saWJyYXJ5L3JlYWN0JztcIixcbiAgICAgIFwiaW1wb3J0IEFwcCBmcm9tICcuL0FwcCc7XCIsXG4gICAgICAnJyxcbiAgICAgIFwidGVzdCgncmVuZGVycyBsZWFybiByZWFjdCBsaW5rJywgKCkgPT4ge1wiLFxuICAgICAgJyAgcmVuZGVyKDxBcHAgLz4pOycsXG4gICAgICAnICBjb25zdCBsaW5rRWxlbWVudCA9IHNjcmVlbi5nZXRCeVRleHQoL2xlYXJuIHJlYWN0L2kpOycsXG4gICAgICAnICBleHBlY3QobGlua0VsZW1lbnQpLnRvQmVJblRoZURvY3VtZW50KCk7JyxcbiAgICAgICd9KTsnLFxuICAgICAgJycsXG4gICAgXTtcblxuICAgIGNvbnN0IGluZGV4SnN4ID0gW1xuICAgICAgXCJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1wiLFxuICAgICAgXCJpbXBvcnQgUmVhY3RET00gZnJvbSAncmVhY3QtZG9tJztcIixcbiAgICAgIFwiaW1wb3J0ICcuL2luZGV4LmNzcyc7XCIsXG4gICAgICBcImltcG9ydCBBcHAgZnJvbSAnLi9BcHAnO1wiLFxuICAgICAgXCJpbXBvcnQgcmVwb3J0V2ViVml0YWxzIGZyb20gJy4vcmVwb3J0V2ViVml0YWxzJztcIixcbiAgICAgICcnLFxuICAgICAgJ1JlYWN0RE9NLnJlbmRlcignLFxuICAgICAgJyAgPFJlYWN0LlN0cmljdE1vZGU+JyxcbiAgICAgICcgICAgPEFwcCAvPicsXG4gICAgICAnICA8L1JlYWN0LlN0cmljdE1vZGU+LCcsXG4gICAgICBcIiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKVwiLFxuICAgICAgJyk7JyxcbiAgICAgICcnLFxuICAgICAgJy8vIElmIHlvdSB3YW50IHRvIHN0YXJ0IG1lYXN1cmluZyBwZXJmb3JtYW5jZSBpbiB5b3VyIGFwcCwgcGFzcyBhIGZ1bmN0aW9uJyxcbiAgICAgICcvLyB0byBsb2cgcmVzdWx0cyAoZm9yIGV4YW1wbGU6IHJlcG9ydFdlYlZpdGFscyhjb25zb2xlLmxvZykpJyxcbiAgICAgICcvLyBvciBzZW5kIHRvIGFuIGFuYWx5dGljcyBlbmRwb2ludC4gTGVhcm4gbW9yZTogaHR0cHM6Ly9iaXQubHkvQ1JBLXZpdGFscycsXG4gICAgICAncmVwb3J0V2ViVml0YWxzKCk7JyxcbiAgICAgICcnLFxuICAgIF07XG5cbiAgICBjb25zdCBpbmRleENzcyA9IFtcbiAgICAgICdib2R5IHsnLFxuICAgICAgJyAgbWFyZ2luOiAwOycsXG4gICAgICBcIiAgZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgJ1NlZ29lIFVJJywgJ1JvYm90bycsICdPeHlnZW4nLFwiLFxuICAgICAgXCIgICAgJ1VidW50dScsICdDYW50YXJlbGwnLCAnRmlyYSBTYW5zJywgJ0Ryb2lkIFNhbnMnLCAnSGVsdmV0aWNhIE5ldWUnLFwiLFxuICAgICAgJyAgICBzYW5zLXNlcmlmOycsXG4gICAgICAnICAtd2Via2l0LWZvbnQtc21vb3RoaW5nOiBhbnRpYWxpYXNlZDsnLFxuICAgICAgJyAgLW1vei1vc3gtZm9udC1zbW9vdGhpbmc6IGdyYXlzY2FsZTsnLFxuICAgICAgJ30nLFxuICAgICAgJycsXG4gICAgICAnY29kZSB7JyxcbiAgICAgIFwiICBmb250LWZhbWlseTogc291cmNlLWNvZGUtcHJvLCBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgJ0NvdXJpZXIgTmV3JyxcIixcbiAgICAgICcgICAgbW9ub3NwYWNlOycsXG4gICAgICAnfScsXG4gICAgICAnJyxcbiAgICBdO1xuXG4gICAgY29uc3QgcmVwb3J0V2ViVml0YWxzSnMgPSBbXG4gICAgICBcImltcG9ydCB7IFJlcG9ydEhhbmRsZXIgfSBmcm9tICd3ZWItdml0YWxzJztcIixcbiAgICAgICcnLFxuICAgICAgJ2NvbnN0IHJlcG9ydFdlYlZpdGFscyA9IChvblBlcmZFbnRyeT86IFJlcG9ydEhhbmRsZXIpID0+IHsnLFxuICAgICAgJyAgaWYgKG9uUGVyZkVudHJ5ICYmIG9uUGVyZkVudHJ5IGluc3RhbmNlb2YgRnVuY3Rpb24pIHsnLFxuICAgICAgXCIgICAgaW1wb3J0KCd3ZWItdml0YWxzJykudGhlbigoeyBnZXRDTFMsIGdldEZJRCwgZ2V0RkNQLCBnZXRMQ1AsIGdldFRURkIgfSkgPT4ge1wiLFxuICAgICAgJyAgICAgIGdldENMUyhvblBlcmZFbnRyeSk7JyxcbiAgICAgICcgICAgICBnZXRGSUQob25QZXJmRW50cnkpOycsXG4gICAgICAnICAgICAgZ2V0RkNQKG9uUGVyZkVudHJ5KTsnLFxuICAgICAgJyAgICAgIGdldExDUChvblBlcmZFbnRyeSk7JyxcbiAgICAgICcgICAgICBnZXRUVEZCKG9uUGVyZkVudHJ5KTsnLFxuICAgICAgJyAgICB9KTsnLFxuICAgICAgJyAgfScsXG4gICAgICAnfScsXG4gICAgICAnJyxcbiAgICAgICdleHBvcnQgZGVmYXVsdCByZXBvcnRXZWJWaXRhbHM7JyxcbiAgICBdO1xuXG4gICAgY29uc3Qgc2V0dXBUZXN0c0pzID0gW1xuICAgICAgJy8vIGplc3QtZG9tIGFkZHMgY3VzdG9tIGplc3QgbWF0Y2hlcnMgZm9yIGFzc2VydGluZyBvbiBET00gbm9kZXMuJyxcbiAgICAgICcvLyBhbGxvd3MgeW91IHRvIGRvIHRoaW5ncyBsaWtlOicsXG4gICAgICAnLy8gZXhwZWN0KGVsZW1lbnQpLnRvSGF2ZVRleHRDb250ZW50KC9yZWFjdC9pKScsXG4gICAgICAnLy8gbGVhcm4gbW9yZTogaHR0cHM6Ly9naXRodWIuY29tL3Rlc3RpbmctbGlicmFyeS9qZXN0LWRvbScsXG4gICAgICBcImltcG9ydCAnQHRlc3RpbmctbGlicmFyeS9qZXN0LWRvbSc7XCIsXG4gICAgICAnJyxcbiAgICBdO1xuXG4gICAgLy8ganMvdHMgbm90IGpzeC90c3hcbiAgICBjb25zdCBmaWxlRXh0V2l0aG91dFggPSB0aGlzLmZpbGVFeHQucmVwbGFjZSgneCcsICcnKTtcblxuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgdGhpcy5zcmNkaXIsIHtcbiAgICAgIGZpbGVzOiB7XG4gICAgICAgICdsb2dvLnN2Zyc6IGxvZ29Tdmcuam9pbignXFxuJyksXG4gICAgICAgIFsnQXBwLicgKyB0aGlzLmZpbGVFeHRdOiBhcHBKc3guam9pbignXFxuJyksXG4gICAgICAgIFsnQXBwLnRlc3QuJyArIHRoaXMuZmlsZUV4dF06IGFwcFRlc3RKc3guam9pbignXFxuJyksXG4gICAgICAgICdBcHAuY3NzJzogYXBwQ3NzLmpvaW4oJ1xcbicpLFxuICAgICAgICBbJ2luZGV4LicgKyB0aGlzLmZpbGVFeHRdOiBpbmRleEpzeC5qb2luKCdcXG4nKSxcbiAgICAgICAgJ2luZGV4LmNzcyc6IGluZGV4Q3NzLmpvaW4oJ1xcbicpLFxuICAgICAgICBbJ3JlcG9ydFdlYlZpdGFscy4nICsgZmlsZUV4dFdpdGhvdXRYXTogcmVwb3J0V2ViVml0YWxzSnMuam9pbignXFxuJyksXG4gICAgICAgIFsnc2V0dXBUZXN0cy4nICsgZmlsZUV4dFdpdGhvdXRYXTogc2V0dXBUZXN0c0pzLmpvaW4oJ1xcbicpLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGluZGV4SHRtbCA9IFtcbiAgICAgICc8IURPQ1RZUEUgaHRtbD4nLFxuICAgICAgJzxodG1sIGxhbmc9XCJlblwiPicsXG4gICAgICAnICA8aGVhZD4nLFxuICAgICAgJyAgICA8bWV0YSBjaGFyc2V0PVwidXRmLThcIiAvPicsXG4gICAgICAnICAgIDxsaW5rIHJlbD1cImljb25cIiBocmVmPVwiJVBVQkxJQ19VUkwlL2Zhdmljb24uaWNvXCIgLz4nLFxuICAgICAgJyAgICA8bWV0YSBuYW1lID0gXCJ2aWV3cG9ydFwiIGNvbnRlbnQgPSBcIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xXCIgLz4nLFxuICAgICAgJyAgICA8bWV0YSBuYW1lPVwidGhlbWUtY29sb3JcIiBjb250ZW50ID0gXCIjMDAwMDAwXCIgLz4nLFxuICAgICAgJyAgICA8bWV0YSBuYW1lPVwiZGVzY3JpcHRpb25cIiBjb250ZW50ID0gXCJXZWIgc2l0ZSBjcmVhdGVkIHVzaW5nIGNyZWF0ZS1yZWFjdC1hcHBcIiAvPicsXG4gICAgICAnICAgIDxsaW5rIHJlbD1cImFwcGxlLXRvdWNoLWljb25cIiBocmVmID0gXCIlUFVCTElDX1VSTCUvbG9nbzE5Mi5wbmdcIiAvPicsXG4gICAgICAnICAgIDwhLS0nLFxuICAgICAgJyAgICAgIG1hbmlmZXN0Lmpzb24gcHJvdmlkZXMgbWV0YWRhdGEgdXNlZCB3aGVuIHlvdXIgd2ViIGFwcCBpcyBpbnN0YWxsZWQgb24gYScsXG4gICAgICBcIiAgICAgIHVzZXIncyBtb2JpbGUgZGV2aWNlIG9yIGRlc2t0b3AuIFNlZSBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS93ZWIvZnVuZGFtZW50YWxzL3dlYi1hcHAtbWFuaWZlc3QvXCIsXG4gICAgICAnICAgIC0tPicsXG4gICAgICAnICAgIDxsaW5rIHJlbD1cIm1hbmlmZXN0XCIgaHJlZiA9IFwiJVBVQkxJQ19VUkwlL21hbmlmZXN0Lmpzb25cIiAvPicsXG4gICAgICAnICAgIDwhLS0nLFxuICAgICAgJyAgICAgIE5vdGljZSB0aGUgdXNlIG9mICUgUFVCTElDX1VSTCAlIGluIHRoZSB0YWdzIGFib3ZlLicsXG4gICAgICAnICAgICAgSXQgd2lsbCBiZSByZXBsYWNlZCB3aXRoIHRoZSBVUkwgb2YgdGhlYHB1YmxpY2AgZm9sZGVyIGR1cmluZyB0aGUgYnVpbGQuJyxcbiAgICAgICcgICAgICBPbmx5IGZpbGVzIGluc2lkZSB0aGVgcHVibGljYCBmb2xkZXIgY2FuIGJlIHJlZmVyZW5jZWQgZnJvbSB0aGUgSFRNTC4nLFxuICAgICAgJycsXG4gICAgICAnICAgICAgVW5saWtlIFwiL2Zhdmljb24uaWNvXCIgb3IgXCJmYXZpY29uLmljb1wiLCBcIiVQVUJMSUNfVVJMJS9mYXZpY29uLmljb1wiIHdpbGwnLFxuICAgICAgJyAgICAgIHdvcmsgY29ycmVjdGx5IGJvdGggd2l0aCBjbGllbnQgLSBzaWRlIHJvdXRpbmcgYW5kIGEgbm9uIC0gcm9vdCBwdWJsaWMgVVJMLicsXG4gICAgICAnICAgICAgTGVhcm4gaG93IHRvIGNvbmZpZ3VyZSBhIG5vbi1yb290IHB1YmxpYyBVUkwgYnkgcnVubmluZ2BucG0gcnVuIGJ1aWxkYC4nLFxuICAgICAgJyAgICAtLT4nLFxuICAgICAgJyAgICA8dGl0bGU+UmVhY3QgQXBwIDwvdGl0bGU+JyxcbiAgICAgICcgIDwvaGVhZD4nLFxuICAgICAgJyAgPGJvZHk+JyxcbiAgICAgICcgICAgPG5vc2NyaXB0PllvdSBuZWVkIHRvIGVuYWJsZSBKYXZhU2NyaXB0IHRvIHJ1biB0aGlzIGFwcC48L25vc2NyaXB0PicsXG4gICAgICAnICAgIDxkaXYgaWQ9XCJyb290XCI+IDwvZGl2PicsXG4gICAgICAnICAgIDwhLS0nLFxuICAgICAgJyAgICAgIFRoaXMgSFRNTCBmaWxlIGlzIGEgdGVtcGxhdGUuJyxcbiAgICAgICcgICAgICBJZiB5b3Ugb3BlbiBpdCBkaXJlY3RseSBpbiB0aGUgYnJvd3NlciwgeW91IHdpbGwgc2VlIGFuIGVtcHR5IHBhZ2UuJyxcbiAgICAgICcgICAgICBZb3UgY2FuIGFkZCB3ZWJmb250cywgbWV0YSB0YWdzLCBvciBhbmFseXRpY3MgdG8gdGhpcyBmaWxlLicsXG4gICAgICAnICAgICAgVGhlIGJ1aWxkIHN0ZXAgd2lsbCBwbGFjZSB0aGUgYnVuZGxlZCBzY3JpcHRzIGludG8gdGhlIDxib2R5PiB0YWcuJyxcbiAgICAgICcnLFxuICAgICAgJyAgICAgIFRvIGJlZ2luIHRoZSBkZXZlbG9wbWVudCwgcnVuIGBucG0gc3RhcnRgIG9yIGB5YXJuIHN0YXJ0YC4nLFxuICAgICAgJyAgICAgIFRvIGNyZWF0ZSBhIHByb2R1Y3Rpb24gYnVuZGxlLCB1c2UgYG5wbSBydW4gYnVpbGRgIG9yIGB5YXJuIGJ1aWxkYC4nLFxuICAgICAgJyAgICAtLT4nLFxuICAgICAgJyAgPC9ib2R5PicsXG4gICAgICAnPC9odG1sPicsXG4gICAgXTtcblxuICAgIGNvbnN0IHB1YmxpY01hbmlmZXN0ID0ge1xuICAgICAgc2hvcnRfbmFtZTogJ1JlYWN0IEFwcCcsXG4gICAgICBuYW1lOiAnQ3JlYXRlIFJlYWN0IEFwcCBTYW1wbGUnLFxuICAgICAgaWNvbnM6IFtdLFxuICAgICAgc3RhcnRfdXJsOiAnLicsXG4gICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICB0aGVtZV9jb2xvcjogJyMwMDAwMDAnLFxuICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyNmZmZmZmYnLFxuICAgIH07XG5cbiAgICBjb25zdCByb2JvdFR4dCA9IFtcbiAgICAgICcjIGh0dHBzOi8vd3d3LnJvYm90c3R4dC5vcmcvcm9ib3RzdHh0Lmh0bWwnLFxuICAgICAgJ1VzZXItYWdlbnQ6IConLFxuICAgICAgJ0Rpc2FsbG93OicsXG4gICAgXTtcblxuICAgIG5ldyBTYW1wbGVEaXIocHJvamVjdCwgJ3B1YmxpYycsIHtcbiAgICAgIGZpbGVzOiB7XG4gICAgICAgICdpbmRleC5odG1sJzogaW5kZXhIdG1sLmpvaW4oJ1xcbicpLFxuICAgICAgICAnbWFuaWZlc3QuanNvbic6IEpTT04uc3RyaW5naWZ5KHB1YmxpY01hbmlmZXN0LCB1bmRlZmluZWQsIDIpLFxuICAgICAgICAncm9ib3RzLnR4dCc6IHJvYm90VHh0LmpvaW4oJ1xcbicpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlYWN0VHlwZURlZk9wdGlvbnMgZXh0ZW5kcyBGaWxlQmFzZU9wdGlvbnMgeyB9XG5cbmV4cG9ydCBjbGFzcyBSZWFjdFR5cGVEZWYgZXh0ZW5kcyBGaWxlQmFzZSB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFJlYWN0VHlwZVNjcmlwdFByb2plY3QsIGZpbGVQYXRoOiBzdHJpbmcsIG9wdGlvbnM6IFJlYWN0VHlwZURlZk9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHByb2plY3QsIGZpbGVQYXRoLCBvcHRpb25zKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzeW50aGVzaXplQ29udGVudChfOiBJUmVzb2x2ZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBbXG4gICAgICAnLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJyZWFjdC1zY3JpcHRzXCIgLz4nLFxuICAgIF0uam9pbignXFxuJyk7XG4gIH1cbn1cbiJdfQ==