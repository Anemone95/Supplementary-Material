"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const util_1 = require("./util");
describe('author', () => {
    test('authorEmail and authorAddress can be the same value', () => {
        const project = new TestJsiiProject({
            authorAddress: 'hello@hello.com',
            authorEmail: 'hello@hello.com',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'project',
            defaultReleaseBranch: 'master',
        });
        const pkgjson = util_1.synthSnapshot(project)['package.json'];
        expect(pkgjson.author).toStrictEqual({
            email: 'hello@hello.com',
            name: 'My Name',
            organization: false,
        });
    });
    test('authorUrl and authorAddress can be the same value', () => {
        const project = new TestJsiiProject({
            authorAddress: 'https://foo.bar',
            authorUrl: 'https://foo.bar',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'project',
            defaultReleaseBranch: 'master',
        });
        const pkgjson = util_1.synthSnapshot(project)['package.json'];
        expect(pkgjson.author).toStrictEqual({
            name: 'My Name',
            organization: false,
            url: 'https://foo.bar',
        });
    });
});
describe('maven repository options', () => {
    test('use maven central as repository', () => {
        const project = new TestJsiiProject({
            authorAddress: 'https://foo.bar',
            authorUrl: 'https://foo.bar',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'testproject',
            publishToMaven: {
                javaPackage: 'com.github.eladb.watchful',
                mavenGroupId: 'com.github.eladb',
                mavenArtifactId: 'cdk-watchful',
            },
            defaultReleaseBranch: 'master',
        });
        const workflow = util_1.synthSnapshot(project)['.github/workflows/release.yml'];
        expect(workflow).toContain('run: npx -p jsii-release@latest jsii-release-maven');
        expect(workflow).not.toContainEqual('MAVEN_SERVER_ID');
        expect(workflow).not.toContainEqual('MAVEN_REPOSITORY_URL');
    });
    test('use github as repository', () => {
        const project = new TestJsiiProject({
            authorAddress: 'https://foo.bar',
            authorUrl: 'https://foo.bar',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'testproject',
            publishToMaven: {
                javaPackage: 'com.github.eladb.watchful',
                mavenGroupId: 'com.github.eladb',
                mavenArtifactId: 'cdk-watchful',
                mavenServerId: 'github',
                mavenRepositoryUrl: 'https://maven.pkg.github.com/eladb',
            },
            defaultReleaseBranch: 'master',
        });
        const workflow = util_1.synthSnapshot(project)['.github/workflows/release.yml'];
        expect(workflow).toContain('MAVEN_SERVER_ID: github');
        expect(workflow).toContain('MAVEN_REPOSITORY_URL: https://maven.pkg.github.com/eladb');
    });
});
describe('publish to go', () => {
    test('defaults', () => {
        const project = new TestJsiiProject({
            authorAddress: 'https://foo.bar',
            authorUrl: 'https://foo.bar',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'testproject',
            publishToGo: {
                moduleName: 'github.com/foo/bar',
            },
            defaultReleaseBranch: 'master',
        });
        const output = util_1.synthSnapshot(project);
        const targets = output['package.json'].jsii.targets;
        expect(targets).toStrictEqual({
            go: {
                moduleName: 'github.com/foo/bar',
            },
        });
        expect(output['.github/workflows/release.yml']).toMatchSnapshot();
    });
    test('customizations', () => {
        const project = new TestJsiiProject({
            authorAddress: 'https://foo.bar',
            authorUrl: 'https://foo.bar',
            repositoryUrl: 'https://github.com/foo/bar.git',
            author: 'My Name',
            name: 'testproject',
            publishToGo: {
                moduleName: 'github.com/foo/bar',
                gitBranch: 'custom-branch',
                gitCommitMessage: 'custom commit message',
                gitUserEmail: 'custom@email.com',
                gitUserName: 'custom user',
                githubRepo: 'github.com/foo/bar',
                githubTokenSecret: 'CUSTOM_SECRET',
            },
            defaultReleaseBranch: 'master',
            excludeTypescript: ['src/**/test/*.ts', 'src/**/__tests__/*.ts'],
        });
        const output = util_1.synthSnapshot(project);
        expect(output['package.json'].jsii.targets.go).toStrictEqual({ moduleName: 'github.com/foo/bar' });
        expect(output['.github/workflows/release.yml']).toMatchSnapshot();
        expect(output['package.json'].jsii.excludeTypescript).toStrictEqual(['src/**/test/*.ts', 'src/**/__tests__/*.ts']);
    });
});
class TestJsiiProject extends __1.JsiiProject {
    constructor(options) {
        super({
            outdir: util_1.mkdtemp(),
            logging: {
                level: __1.LogLevel.OFF,
            },
            ...options,
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNpaS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL19fdGVzdHNfXy9qc2lpLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBK0Q7QUFDL0QsaUNBQWdEO0FBRWhELFFBQVEsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO0lBQ3RCLElBQUksQ0FBQyxxREFBcUQsRUFBRSxHQUFHLEVBQUU7UUFDL0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQUM7WUFDbEMsYUFBYSxFQUFFLGlCQUFpQjtZQUNoQyxXQUFXLEVBQUUsaUJBQWlCO1lBQzlCLGFBQWEsRUFBRSxnQ0FBZ0M7WUFDL0MsTUFBTSxFQUFFLFNBQVM7WUFDakIsSUFBSSxFQUFFLFNBQVM7WUFDZixvQkFBb0IsRUFBRSxRQUFRO1NBQy9CLENBQUMsQ0FBQztRQUVILE1BQU0sT0FBTyxHQUFHLG9CQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLENBQUM7WUFDbkMsS0FBSyxFQUFFLGlCQUFpQjtZQUN4QixJQUFJLEVBQUUsU0FBUztZQUNmLFlBQVksRUFBRSxLQUFLO1NBQ3BCLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDLG1EQUFtRCxFQUFFLEdBQUcsRUFBRTtRQUM3RCxNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQztZQUNsQyxhQUFhLEVBQUUsaUJBQWlCO1lBQ2hDLFNBQVMsRUFBRSxpQkFBaUI7WUFDNUIsYUFBYSxFQUFFLGdDQUFnQztZQUMvQyxNQUFNLEVBQUUsU0FBUztZQUNqQixJQUFJLEVBQUUsU0FBUztZQUNmLG9CQUFvQixFQUFFLFFBQVE7U0FDL0IsQ0FBQyxDQUFDO1FBRUgsTUFBTSxPQUFPLEdBQUcsb0JBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FB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QUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsdUJBQXVCLENBQUMsQ0FBQyxDQUFDO0lBQ3JILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUM7QUFFSCxNQUFNLGVBQWdCLFNBQVEsZUFBVztJQUN2QyxZQUFZLE9BQTJCO1FBQ3JDLEtBQUssQ0FBQztZQUNKLE1BQU0sRUFBRSxjQUFPLEVBQUU7WUFDakIsT0FBTyxFQUFFO2dCQUNQLEtBQUssRUFBRSxZQUFRLENBQUMsR0FBRzthQUNwQjtZQUNELEdBQUcsT0FBTztTQUNYLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEpzaWlQcm9qZWN0LCBKc2lpUHJvamVjdE9wdGlvbnMsIExvZ0xldmVsIH0gZnJvbSAnLi4nO1xuaW1wb3J0IHsgbWtkdGVtcCwgc3ludGhTbmFwc2hvdCB9IGZyb20gJy4vdXRpbCc7XG5cbmRlc2NyaWJlKCdhdXRob3InLCAoKSA9PiB7XG4gIHRlc3QoJ2F1dGhvckVtYWlsIGFuZCBhdXRob3JBZGRyZXNzIGNhbiBiZSB0aGUgc2FtZSB2YWx1ZScsICgpID0+IHtcbiAgICBjb25zdCBwcm9qZWN0ID0gbmV3IFRlc3RKc2lpUHJvamVjdCh7XG4gICAgICBhdXRob3JBZGRyZXNzOiAnaGVsbG9AaGVsbG8uY29tJyxcbiAgICAgIGF1dGhvckVtYWlsOiAnaGVsbG9AaGVsbG8uY29tJyxcbiAgICAgIHJlcG9zaXRvcnlVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vZm9vL2Jhci5naXQnLFxuICAgICAgYXV0aG9yOiAnTXkgTmFtZScsXG4gICAgICBuYW1lOiAncHJvamVjdCcsXG4gICAgICBkZWZhdWx0UmVsZWFzZUJyYW5jaDogJ21hc3RlcicsXG4gICAgfSk7XG5cbiAgICBjb25zdCBwa2dqc29uID0gc3ludGhTbmFwc2hvdChwcm9qZWN0KVsncGFja2FnZS5qc29uJ107XG4gICAgZXhwZWN0KHBrZ2pzb24uYXV0aG9yKS50b1N0cmljdEVxdWFsKHtcbiAgICAgIGVtYWlsOiAnaGVsbG9AaGVsbG8uY29tJyxcbiAgICAgIG5hbWU6ICdNeSBOYW1lJyxcbiAgICAgIG9yZ2FuaXphdGlvbjogZmFsc2UsXG4gICAgfSk7XG4gIH0pO1xuXG4gIHRlc3QoJ2F1dGhvclVybCBhbmQgYXV0aG9yQWRkcmVzcyBjYW4gYmUgdGhlIHNhbWUgdmFsdWUnLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0SnNpaVByb2plY3Qoe1xuICAgICAgYXV0aG9yQWRkcmVzczogJ2h0dHBzOi8vZm9vLmJhcicsXG4gICAgICBhdXRob3JVcmw6ICdodHRwczovL2Zvby5iYXInLFxuICAgICAgcmVwb3NpdG9yeVVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9mb28vYmFyLmdpdCcsXG4gICAgICBhdXRob3I6ICdNeSBOYW1lJyxcbiAgICAgIG5hbWU6ICdwcm9qZWN0JyxcbiAgICAgIGRlZmF1bHRSZWxlYXNlQnJhbmNoOiAnbWFzdGVyJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHBrZ2pzb24gPSBzeW50aFNuYXBzaG90KHByb2plY3QpWydwYWNrYWdlLmpzb24nXTtcbiAgICBleHBlY3QocGtnanNvbi5hdXRob3IpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgbmFtZTogJ015IE5hbWUnLFxuICAgICAgb3JnYW5pemF0aW9uOiBmYWxzZSxcbiAgICAgIHVybDogJ2h0dHBzOi8vZm9vLmJhcicsXG4gICAgfSk7XG4gIH0pO1xufSk7XG5cbmRlc2NyaWJlKCdtYXZlbiByZXBvc2l0b3J5IG9wdGlvbnMnLCAoKSA9PiB7XG4gIHRlc3QoJ3VzZSBtYXZlbiBjZW50cmFsIGFzIHJlcG9zaXRvcnknLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0SnNpaVByb2plY3Qoe1xuICAgICAgYXV0aG9yQWRkcmVzczogJ2h0dHBzOi8vZm9vLmJhcicsXG4gICAgICBhdXRob3JVcmw6ICdodHRwczovL2Zvby5iYXInLFxuICAgICAgcmVwb3NpdG9yeVVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9mb28vYmFyLmdpdCcsXG4gICAgICBhdXRob3I6ICdNeSBOYW1lJyxcbiAgICAgIG5hbWU6ICd0ZXN0cHJvamVjdCcsXG4gICAgICBwdWJsaXNoVG9NYXZlbjoge1xuICAgICAgICBqYXZhUGFja2FnZTogJ2NvbS5naXRodWIuZWxhZGIud2F0Y2hmdWwnLFxuICAgICAgICBtYXZlbkdyb3VwSWQ6ICdjb20uZ2l0aHViLmVsYWRiJyxcbiAgICAgICAgbWF2ZW5BcnRpZmFjdElkOiAnY2RrLXdhdGNoZnVsJyxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0UmVsZWFzZUJyYW5jaDogJ21hc3RlcicsXG4gICAgfSk7XG5cbiAgICBjb25zdCB3b3JrZmxvdyA9IHN5bnRoU25hcHNob3QocHJvamVjdClbJy5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sJ107XG4gICAgZXhwZWN0KHdvcmtmbG93KS50b0NvbnRhaW4oJ3J1bjogbnB4IC1wIGpzaWktcmVsZWFzZUBsYXRlc3QganNpaS1yZWxlYXNlLW1hdmVuJyk7XG4gICAgZXhwZWN0KHdvcmtmbG93KS5ub3QudG9Db250YWluRXF1YWwoJ01BVkVOX1NFUlZFUl9JRCcpO1xuICAgIGV4cGVjdCh3b3JrZmxvdykubm90LnRvQ29udGFpbkVxdWFsKCdNQVZFTl9SRVBPU0lUT1JZX1VSTCcpO1xuICB9KTtcblxuICB0ZXN0KCd1c2UgZ2l0aHViIGFzIHJlcG9zaXRvcnknLCAoKSA9PiB7XG4gICAgY29uc3QgcHJvamVjdCA9IG5ldyBUZXN0SnNpaVByb2plY3Qoe1xuICAgICAgYXV0aG9yQWRkcmVzczogJ2h0dHBzOi8vZm9vLmJhcicsXG4gICAgICBhdXRob3JVcmw6ICdodHRwczovL2Zvby5iYXInLFxuICAgICAgcmVwb3NpdG9yeVVybDogJ2h0dHBzOi8vZ2l0aHViLmNvbS9mb28vYmFyLmdpdCcsXG4gICAgICBhdXRob3I6ICdNeSBOYW1lJyxcbiAgICAgIG5hbWU6ICd0ZXN0cHJvamVjdCcsXG4gICAgICBwdWJsaXNoVG9NYXZlbjoge1xuICAgICAgICBqYXZhUGFja2FnZTogJ2NvbS5naXRodWIuZWxhZGIud2F0Y2hmdWwnLFxuICAgICAgICBtYXZlbkdyb3VwSWQ6ICdjb20uZ2l0aHViLmVsYWRiJyxcbiAgICAgICAgbWF2ZW5BcnRpZmFjdElkOiAnY2RrLXdhdGNoZnVsJyxcbiAgICAgICAgbWF2ZW5TZXJ2ZXJJZDogJ2dpdGh1YicsXG4gICAgICAgIG1hdmVuUmVwb3NpdG9yeVVybDogJ2h0dHBzOi8vbWF2ZW4ucGtnLmdpdGh1Yi5jb20vZWxhZGInLFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRSZWxlYXNlQnJhbmNoOiAnbWFzdGVyJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHdvcmtmbG93ID0gc3ludGhTbmFwc2hvdChwcm9qZWN0KVsnLmdpdGh1Yi93b3JrZmxvd3MvcmVsZWFzZS55bWwnXTtcbiAgICBleHBlY3Qod29ya2Zsb3cpLnRvQ29udGFpbignTUFWRU5fU0VSVkVSX0lEOiBnaXRodWInKTtcbiAgICBleHBlY3Qod29ya2Zsb3cpLnRvQ29udGFpbignTUFWRU5fUkVQT1NJVE9SWV9VUkw6IGh0dHBzOi8vbWF2ZW4ucGtnLmdpdGh1Yi5jb20vZWxhZGInKTtcbiAgfSk7XG59KTtcblxuZGVzY3JpYmUoJ3B1Ymxpc2ggdG8gZ28nLCAoKSA9PiB7XG4gIHRlc3QoJ2RlZmF1bHRzJywgKCkgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdEpzaWlQcm9qZWN0KHtcbiAgICAgIGF1dGhvckFkZHJlc3M6ICdodHRwczovL2Zvby5iYXInLFxuICAgICAgYXV0aG9yVXJsOiAnaHR0cHM6Ly9mb28uYmFyJyxcbiAgICAgIHJlcG9zaXRvcnlVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vZm9vL2Jhci5naXQnLFxuICAgICAgYXV0aG9yOiAnTXkgTmFtZScsXG4gICAgICBuYW1lOiAndGVzdHByb2plY3QnLFxuICAgICAgcHVibGlzaFRvR286IHtcbiAgICAgICAgbW9kdWxlTmFtZTogJ2dpdGh1Yi5jb20vZm9vL2JhcicsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFJlbGVhc2VCcmFuY2g6ICdtYXN0ZXInLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gc3ludGhTbmFwc2hvdChwcm9qZWN0KTtcbiAgICBjb25zdCB0YXJnZXRzID0gb3V0cHV0WydwYWNrYWdlLmpzb24nXS5qc2lpLnRhcmdldHM7XG4gICAgZXhwZWN0KHRhcmdldHMpLnRvU3RyaWN0RXF1YWwoe1xuICAgICAgZ286IHtcbiAgICAgICAgbW9kdWxlTmFtZTogJ2dpdGh1Yi5jb20vZm9vL2JhcicsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgZXhwZWN0KG91dHB1dFsnLmdpdGh1Yi93b3JrZmxvd3MvcmVsZWFzZS55bWwnXSkudG9NYXRjaFNuYXBzaG90KCk7XG4gIH0pO1xuXG4gIHRlc3QoJ2N1c3RvbWl6YXRpb25zJywgKCkgPT4ge1xuICAgIGNvbnN0IHByb2plY3QgPSBuZXcgVGVzdEpzaWlQcm9qZWN0KHtcbiAgICAgIGF1dGhvckFkZHJlc3M6ICdodHRwczovL2Zvby5iYXInLFxuICAgICAgYXV0aG9yVXJsOiAnaHR0cHM6Ly9mb28uYmFyJyxcbiAgICAgIHJlcG9zaXRvcnlVcmw6ICdodHRwczovL2dpdGh1Yi5jb20vZm9vL2Jhci5naXQnLFxuICAgICAgYXV0aG9yOiAnTXkgTmFtZScsXG4gICAgICBuYW1lOiAndGVzdHByb2plY3QnLFxuICAgICAgcHVibGlzaFRvR286IHtcbiAgICAgICAgbW9kdWxlTmFtZTogJ2dpdGh1Yi5jb20vZm9vL2JhcicsXG5cbiAgICAgICAgZ2l0QnJhbmNoOiAnY3VzdG9tLWJyYW5jaCcsXG4gICAgICAgIGdpdENvbW1pdE1lc3NhZ2U6ICdjdXN0b20gY29tbWl0IG1lc3NhZ2UnLFxuICAgICAgICBnaXRVc2VyRW1haWw6ICdjdXN0b21AZW1haWwuY29tJyxcbiAgICAgICAgZ2l0VXNlck5hbWU6ICdjdXN0b20gdXNlcicsXG4gICAgICAgIGdpdGh1YlJlcG86ICdnaXRodWIuY29tL2Zvby9iYXInLFxuICAgICAgICBnaXRodWJUb2tlblNlY3JldDogJ0NVU1RPTV9TRUNSRVQnLFxuICAgICAgfSxcbiAgICAgIGRlZmF1bHRSZWxlYXNlQnJhbmNoOiAnbWFzdGVyJyxcbiAgICAgIGV4Y2x1ZGVUeXBlc2NyaXB0OiBbJ3NyYy8qKi90ZXN0LyoudHMnLCAnc3JjLyoqL19fdGVzdHNfXy8qLnRzJ10sXG4gICAgfSk7XG5cbiAgICBjb25zdCBvdXRwdXQgPSBzeW50aFNuYXBzaG90KHByb2plY3QpO1xuICAgIGV4cGVjdChvdXRwdXRbJ3BhY2thZ2UuanNvbiddLmpzaWkudGFyZ2V0cy5nbykudG9TdHJpY3RFcXVhbCh7IG1vZHVsZU5hbWU6ICdnaXRodWIuY29tL2Zvby9iYXInIH0pO1xuICAgIGV4cGVjdChvdXRwdXRbJy5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sJ10pLnRvTWF0Y2hTbmFwc2hvdCgpO1xuICAgIGV4cGVjdChvdXRwdXRbJ3BhY2thZ2UuanNvbiddLmpzaWkuZXhjbHVkZVR5cGVzY3JpcHQpLnRvU3RyaWN0RXF1YWwoWydzcmMvKiovdGVzdC8qLnRzJywgJ3NyYy8qKi9fX3Rlc3RzX18vKi50cyddKTtcbiAgfSk7XG59KTtcblxuY2xhc3MgVGVzdEpzaWlQcm9qZWN0IGV4dGVuZHMgSnNpaVByb2plY3Qge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBKc2lpUHJvamVjdE9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBvdXRkaXI6IG1rZHRlbXAoKSxcbiAgICAgIGxvZ2dpbmc6IHtcbiAgICAgICAgbGV2ZWw6IExvZ0xldmVsLk9GRixcbiAgICAgIH0sXG4gICAgICAuLi5vcHRpb25zLFxuICAgIH0pO1xuICB9XG59XG4iXX0=