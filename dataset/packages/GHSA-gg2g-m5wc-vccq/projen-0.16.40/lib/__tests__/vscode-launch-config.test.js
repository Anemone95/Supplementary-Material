"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const launch_config_1 = require("../vscode/launch-config");
const util_1 = require("./util");
const VSCODE_DEBUGGER_FILE = '.vscode/launch.json';
test('empty launch configuration', () => {
    var _a;
    // GIVEN
    const project = new util_1.TestProject();
    // WHEN
    (_a = project.vscode) === null || _a === void 0 ? void 0 : _a.launchConfiguration;
    // THEN
    expect(util_1.synthSnapshot(project)[VSCODE_DEBUGGER_FILE]).toStrictEqual({
        version: '0.2.0',
        configurations: [],
    });
});
test('adding a launch configuration entry', () => {
    var _a;
    // GIVEN
    const project = new util_1.TestProject();
    // WHEN
    const launchConfig = (_a = project.vscode) === null || _a === void 0 ? void 0 : _a.launchConfiguration;
    launchConfig === null || launchConfig === void 0 ? void 0 : launchConfig.addConfiguration({
        type: 'node',
        request: 'launch',
        name: 'CDK Debugger',
        skipFiles: ['<node_internals>/**'],
        runtimeArgs: ['-r', './node_modules/ts-node/register/transpile-only'],
        args: ['${workspaceFolder}/src/main.ts'],
    });
    // THEN
    expect(util_1.synthSnapshot(project)[VSCODE_DEBUGGER_FILE]).toStrictEqual({
        version: '0.2.0',
        configurations: [
            {
                type: 'node',
                request: 'launch',
                name: 'CDK Debugger',
                skipFiles: ['<node_internals>/**'],
                runtimeArgs: ['-r', './node_modules/ts-node/register/transpile-only'],
                args: ['${workspaceFolder}/src/main.ts'],
            },
        ],
    });
});
test('adding multiple launch configuration entries', () => {
    var _a;
    // GIVEN
    const project = new util_1.TestProject();
    // WHEN
    const launchConfig = (_a = project.vscode) === null || _a === void 0 ? void 0 : _a.launchConfiguration;
    launchConfig === null || launchConfig === void 0 ? void 0 : launchConfig.addConfiguration({
        type: 'node',
        request: 'launch',
        name: 'CDK Debugger',
        skipFiles: ['<node_internals>/**'],
        runtimeArgs: ['-r', './node_modules/ts-node/register/transpile-only'],
        args: ['${workspaceFolder}/src/main.ts'],
    });
    launchConfig === null || launchConfig === void 0 ? void 0 : launchConfig.addConfiguration({
        type: 'node',
        request: 'launch',
        name: 'Launch Program',
        skipFiles: ['<node_internals>/**'],
        program: '${workspaceFolder}/lib/index.js',
        preLaunchTask: 'tsc: build - tsconfig.json',
        outFiles: ['${workspaceFolder}/lib/**/*.js'],
        internalConsoleOptions: launch_config_1.InternalConsoleOptions.OPEN_ON_SESSION_START,
    });
    launchConfig === null || launchConfig === void 0 ? void 0 : launchConfig.addConfiguration({
        type: 'pwa-chrome',
        request: 'launch',
        name: 'Launch Chrome against localhost',
        url: 'http://localhost:8080',
        webRoot: '${workspaceFolder}',
        debugServer: 4711,
    });
    // THEN
    expect(util_1.synthSnapshot(project)[VSCODE_DEBUGGER_FILE]).toStrictEqual({
        version: '0.2.0',
        configurations: [
            {
                type: 'node',
                request: 'launch',
                name: 'CDK Debugger',
                skipFiles: ['<node_internals>/**'],
                runtimeArgs: ['-r', './node_modules/ts-node/register/transpile-only'],
                args: ['${workspaceFolder}/src/main.ts'],
            },
            {
                type: 'node',
                request: 'launch',
                name: 'Launch Program',
                skipFiles: ['<node_internals>/**'],
                program: '${workspaceFolder}/lib/index.js',
                preLaunchTask: 'tsc: build - tsconfig.json',
                outFiles: ['${workspaceFolder}/lib/**/*.js'],
                internalConsoleOptions: 'openOnSessionStart',
            },
            {
                type: 'pwa-chrome',
                request: 'launch',
                name: 'Launch Chrome against localhost',
                url: 'http://localhost:8080',
                webRoot: '${workspaceFolder}',
                debugServer: 4711,
            },
        ],
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlLWxhdW5jaC1jb25maWcudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9fX3Rlc3RzX18vdnNjb2RlLWxhdW5jaC1jb25maWcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUFpRTtBQUNqRSxpQ0FBb0Q7QUFFcEQsTUFBTSxvQkFBb0IsR0FBRyxxQkFBcUIsQ0FBQztBQUVuRCxJQUFJLENBQUMsNEJBQTRCLEVBQUUsR0FBRyxFQUFFOztJQUN0QyxRQUFRO0lBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7SUFFbEMsT0FBTztJQUNQLE1BQUEsT0FBTyxDQUFDLE1BQU0sMENBQUUsbUJBQW1CLENBQUM7SUFFcEMsT0FBTztJQUNQLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDakUsT0FBTyxFQUFFLE9BQU87UUFDaEIsY0FBYyxFQUFFLEVBQUU7S0FDbkIsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFOztJQUMvQyxRQUFRO0lBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7SUFFbEMsT0FBTztJQUNQLE1BQU0sWUFBWSxTQUFHLE9BQU8sQ0FBQyxNQUFNLDBDQUFFLG1CQUFtQixDQUFDO0lBQ3pELFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxnQkFBZ0IsQ0FBQztRQUM3QixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLElBQUksRUFBRSxjQUFjO1FBQ3BCLFNBQVMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1FBQ2xDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQztRQUNyRSxJQUFJLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQztLQUN6QyxFQUFFO0lBRUgsT0FBTztJQUNQLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUM7UUFDakUsT0FBTyxFQUFFLE9BQU87UUFDaEIsY0FBYyxFQUFFO1lBQ2Q7Z0JBQ0UsSUFBSSxFQUFFLE1BQU07Z0JBQ1osT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLElBQUksRUFBRSxjQUFjO2dCQUNwQixTQUFTLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztnQkFDbEMsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFFLGdEQUFnRCxDQUFDO2dCQUNyRSxJQUFJLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQzthQUN6QztTQUNGO0tBQ0YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxJQUFJLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFOztJQUN4RCxRQUFRO0lBQ1IsTUFBTSxPQUFPLEdBQUcsSUFBSSxrQkFBVyxFQUFFLENBQUM7SUFFbEMsT0FBTztJQUNQLE1BQU0sWUFBWSxTQUFHLE9BQU8sQ0FBQyxNQUFNLDBDQUFFLG1CQUFtQixDQUFDO0lBQ3pELFlBQVksYUFBWixZQUFZLHVCQUFaLFlBQVksQ0FBRSxnQkFBZ0IsQ0FBQztRQUM3QixJQUFJLEVBQUUsTUFBTTtRQUNaLE9BQU8sRUFBRSxRQUFRO1FBQ2pCLElBQUksRUFBRSxjQUFjO1FBQ3BCLFNBQVMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1FBQ2xDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQztRQUNyRSxJQUFJLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQztLQUN6QyxFQUFFO0lBRUgsWUFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLGdCQUFnQixDQUFDO1FBQzdCLElBQUksRUFBRSxNQUFNO1FBQ1osT0FBTyxFQUFFLFFBQVE7UUFDakIsSUFBSSxFQUFFLGdCQUFnQjtRQUN0QixTQUFTLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztRQUNsQyxPQUFPLEVBQUUsaUNBQWlDO1FBQzFDLGFBQWEsRUFBRSw0QkFBNEI7UUFDM0MsUUFBUSxFQUFFLENBQUMsZ0NBQWdDLENBQUM7UUFDNUMsc0JBQXNCLEVBQUUsc0NBQXNCLENBQUMscUJBQXFCO0tBQ3JFLEVBQUU7SUFFSCxZQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsZ0JBQWdCLENBQUM7UUFDN0IsSUFBSSxFQUFFLFlBQVk7UUFDbEIsT0FBTyxFQUFFLFFBQVE7UUFDakIsSUFBSSxFQUFFLGlDQUFpQztRQUN2QyxHQUFHLEVBQUUsdUJBQXVCO1FBQzVCLE9BQU8sRUFBRSxvQkFBb0I7UUFDN0IsV0FBVyxFQUFFLElBQUk7S0FDbEIsRUFBRTtJQUVILE9BQU87SUFDUCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDO1FBQ2pFLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLGNBQWMsRUFBRTtZQUNkO2dCQUNFLElBQUksRUFBRSxNQUFNO2dCQUNaLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixJQUFJLEVBQUUsY0FBYztnQkFDcEIsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUM7Z0JBQ2xDLFdBQVcsRUFBRSxDQUFDLElBQUksRUFBRSxnREFBZ0QsQ0FBQztnQkFDckUsSUFBSSxFQUFFLENBQUMsZ0NBQWdDLENBQUM7YUFDekM7WUFDRDtnQkFDRSxJQUFJLEVBQUUsTUFBTTtnQkFDWixPQUFPLEVBQUUsUUFBUTtnQkFDakIsSUFBSSxFQUFFLGdCQUFnQjtnQkFDdEIsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUM7Z0JBQ2xDLE9BQU8sRUFBRSxpQ0FBaUM7Z0JBQzFDLGFBQWEsRUFBRSw0QkFBNEI7Z0JBQzNDLFFBQVEsRUFBRSxDQUFDLGdDQUFnQyxDQUFDO2dCQUM1QyxzQkFBc0IsRUFBRSxvQkFBb0I7YUFDN0M7WUFDRDtnQkFDRSxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLElBQUksRUFBRSxpQ0FBaUM7Z0JBQ3ZDLEdBQUcsRUFBRSx1QkFBdUI7Z0JBQzVCLE9BQU8sRUFBRSxvQkFBb0I7Z0JBQzdCLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1NBQ0Y7S0FDRixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEludGVybmFsQ29uc29sZU9wdGlvbnMgfSBmcm9tICcuLi92c2NvZGUvbGF1bmNoLWNvbmZpZyc7XG5pbXBvcnQgeyBzeW50aFNuYXBzaG90LCBUZXN0UHJvamVjdCB9IGZyb20gJy4vdXRpbCc7XG5cbmNvbnN0IFZTQ09ERV9ERUJVR0dFUl9GSUxFID0gJy52c2NvZGUvbGF1bmNoLmpzb24nO1xuXG50ZXN0KCdlbXB0eSBsYXVuY2ggY29uZmlndXJhdGlvbicsICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gIC8vIFdIRU5cbiAgcHJvamVjdC52c2NvZGU/LmxhdW5jaENvbmZpZ3VyYXRpb247XG5cbiAgLy8gVEhFTlxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcm9qZWN0KVtWU0NPREVfREVCVUdHRVJfRklMRV0pLnRvU3RyaWN0RXF1YWwoe1xuICAgIHZlcnNpb246ICcwLjIuMCcsXG4gICAgY29uZmlndXJhdGlvbnM6IFtdLFxuICB9KTtcbn0pO1xuXG50ZXN0KCdhZGRpbmcgYSBsYXVuY2ggY29uZmlndXJhdGlvbiBlbnRyeScsICgpID0+IHtcbiAgLy8gR0lWRU5cbiAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0UHJvamVjdCgpO1xuXG4gIC8vIFdIRU5cbiAgY29uc3QgbGF1bmNoQ29uZmlnID0gcHJvamVjdC52c2NvZGU/LmxhdW5jaENvbmZpZ3VyYXRpb247XG4gIGxhdW5jaENvbmZpZz8uYWRkQ29uZmlndXJhdGlvbih7XG4gICAgdHlwZTogJ25vZGUnLFxuICAgIHJlcXVlc3Q6ICdsYXVuY2gnLFxuICAgIG5hbWU6ICdDREsgRGVidWdnZXInLFxuICAgIHNraXBGaWxlczogWyc8bm9kZV9pbnRlcm5hbHM+LyoqJ10sXG4gICAgcnVudGltZUFyZ3M6IFsnLXInLCAnLi9ub2RlX21vZHVsZXMvdHMtbm9kZS9yZWdpc3Rlci90cmFuc3BpbGUtb25seSddLFxuICAgIGFyZ3M6IFsnJHt3b3Jrc3BhY2VGb2xkZXJ9L3NyYy9tYWluLnRzJ10sXG4gIH0pO1xuXG4gIC8vIFRIRU5cbiAgZXhwZWN0KHN5bnRoU25hcHNob3QocHJvamVjdClbVlNDT0RFX0RFQlVHR0VSX0ZJTEVdKS50b1N0cmljdEVxdWFsKHtcbiAgICB2ZXJzaW9uOiAnMC4yLjAnLFxuICAgIGNvbmZpZ3VyYXRpb25zOiBbXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdub2RlJyxcbiAgICAgICAgcmVxdWVzdDogJ2xhdW5jaCcsXG4gICAgICAgIG5hbWU6ICdDREsgRGVidWdnZXInLFxuICAgICAgICBza2lwRmlsZXM6IFsnPG5vZGVfaW50ZXJuYWxzPi8qKiddLFxuICAgICAgICBydW50aW1lQXJnczogWyctcicsICcuL25vZGVfbW9kdWxlcy90cy1ub2RlL3JlZ2lzdGVyL3RyYW5zcGlsZS1vbmx5J10sXG4gICAgICAgIGFyZ3M6IFsnJHt3b3Jrc3BhY2VGb2xkZXJ9L3NyYy9tYWluLnRzJ10sXG4gICAgICB9LFxuICAgIF0sXG4gIH0pO1xufSk7XG5cbnRlc3QoJ2FkZGluZyBtdWx0aXBsZSBsYXVuY2ggY29uZmlndXJhdGlvbiBlbnRyaWVzJywgKCkgPT4ge1xuICAvLyBHSVZFTlxuICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RQcm9qZWN0KCk7XG5cbiAgLy8gV0hFTlxuICBjb25zdCBsYXVuY2hDb25maWcgPSBwcm9qZWN0LnZzY29kZT8ubGF1bmNoQ29uZmlndXJhdGlvbjtcbiAgbGF1bmNoQ29uZmlnPy5hZGRDb25maWd1cmF0aW9uKHtcbiAgICB0eXBlOiAnbm9kZScsXG4gICAgcmVxdWVzdDogJ2xhdW5jaCcsXG4gICAgbmFtZTogJ0NESyBEZWJ1Z2dlcicsXG4gICAgc2tpcEZpbGVzOiBbJzxub2RlX2ludGVybmFscz4vKionXSxcbiAgICBydW50aW1lQXJnczogWyctcicsICcuL25vZGVfbW9kdWxlcy90cy1ub2RlL3JlZ2lzdGVyL3RyYW5zcGlsZS1vbmx5J10sXG4gICAgYXJnczogWycke3dvcmtzcGFjZUZvbGRlcn0vc3JjL21haW4udHMnXSxcbiAgfSk7XG5cbiAgbGF1bmNoQ29uZmlnPy5hZGRDb25maWd1cmF0aW9uKHtcbiAgICB0eXBlOiAnbm9kZScsXG4gICAgcmVxdWVzdDogJ2xhdW5jaCcsXG4gICAgbmFtZTogJ0xhdW5jaCBQcm9ncmFtJyxcbiAgICBza2lwRmlsZXM6IFsnPG5vZGVfaW50ZXJuYWxzPi8qKiddLFxuICAgIHByb2dyYW06ICcke3dvcmtzcGFjZUZvbGRlcn0vbGliL2luZGV4LmpzJyxcbiAgICBwcmVMYXVuY2hUYXNrOiAndHNjOiBidWlsZCAtIHRzY29uZmlnLmpzb24nLFxuICAgIG91dEZpbGVzOiBbJyR7d29ya3NwYWNlRm9sZGVyfS9saWIvKiovKi5qcyddLFxuICAgIGludGVybmFsQ29uc29sZU9wdGlvbnM6IEludGVybmFsQ29uc29sZU9wdGlvbnMuT1BFTl9PTl9TRVNTSU9OX1NUQVJULFxuICB9KTtcblxuICBsYXVuY2hDb25maWc/LmFkZENvbmZpZ3VyYXRpb24oe1xuICAgIHR5cGU6ICdwd2EtY2hyb21lJyxcbiAgICByZXF1ZXN0OiAnbGF1bmNoJyxcbiAgICBuYW1lOiAnTGF1bmNoIENocm9tZSBhZ2FpbnN0IGxvY2FsaG9zdCcsXG4gICAgdXJsOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgwJyxcbiAgICB3ZWJSb290OiAnJHt3b3Jrc3BhY2VGb2xkZXJ9JyxcbiAgICBkZWJ1Z1NlcnZlcjogNDcxMSxcbiAgfSk7XG5cbiAgLy8gVEhFTlxuICBleHBlY3Qoc3ludGhTbmFwc2hvdChwcm9qZWN0KVtWU0NPREVfREVCVUdHRVJfRklMRV0pLnRvU3RyaWN0RXF1YWwoe1xuICAgIHZlcnNpb246ICcwLjIuMCcsXG4gICAgY29uZmlndXJhdGlvbnM6IFtcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ25vZGUnLFxuICAgICAgICByZXF1ZXN0OiAnbGF1bmNoJyxcbiAgICAgICAgbmFtZTogJ0NESyBEZWJ1Z2dlcicsXG4gICAgICAgIHNraXBGaWxlczogWyc8bm9kZV9pbnRlcm5hbHM+LyoqJ10sXG4gICAgICAgIHJ1bnRpbWVBcmdzOiBbJy1yJywgJy4vbm9kZV9tb2R1bGVzL3RzLW5vZGUvcmVnaXN0ZXIvdHJhbnNwaWxlLW9ubHknXSxcbiAgICAgICAgYXJnczogWycke3dvcmtzcGFjZUZvbGRlcn0vc3JjL21haW4udHMnXSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdub2RlJyxcbiAgICAgICAgcmVxdWVzdDogJ2xhdW5jaCcsXG4gICAgICAgIG5hbWU6ICdMYXVuY2ggUHJvZ3JhbScsXG4gICAgICAgIHNraXBGaWxlczogWyc8bm9kZV9pbnRlcm5hbHM+LyoqJ10sXG4gICAgICAgIHByb2dyYW06ICcke3dvcmtzcGFjZUZvbGRlcn0vbGliL2luZGV4LmpzJyxcbiAgICAgICAgcHJlTGF1bmNoVGFzazogJ3RzYzogYnVpbGQgLSB0c2NvbmZpZy5qc29uJyxcbiAgICAgICAgb3V0RmlsZXM6IFsnJHt3b3Jrc3BhY2VGb2xkZXJ9L2xpYi8qKi8qLmpzJ10sXG4gICAgICAgIGludGVybmFsQ29uc29sZU9wdGlvbnM6ICdvcGVuT25TZXNzaW9uU3RhcnQnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3B3YS1jaHJvbWUnLFxuICAgICAgICByZXF1ZXN0OiAnbGF1bmNoJyxcbiAgICAgICAgbmFtZTogJ0xhdW5jaCBDaHJvbWUgYWdhaW5zdCBsb2NhbGhvc3QnLFxuICAgICAgICB1cmw6ICdodHRwOi8vbG9jYWxob3N0OjgwODAnLFxuICAgICAgICB3ZWJSb290OiAnJHt3b3Jrc3BhY2VGb2xkZXJ9JyxcbiAgICAgICAgZGVidWdTZXJ2ZXI6IDQ3MTEsXG4gICAgICB9LFxuICAgIF0sXG4gIH0pO1xufSk7XG4iXX0=