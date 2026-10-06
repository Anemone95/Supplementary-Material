"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Version = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const path = require("path");
const fs = require("fs-extra");
const component_1 = require("./component");
const json_1 = require("./json");
const tasks_1 = require("./tasks");
const VERSION_FILE = 'version.json';
/**
 * @experimental
 */
class Version extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options) {
        var _b;
        super(project);
        // this command determines if there were any changes since the last release
        // (the top-most commit is not a bump). it is used as a condition for both
        // the `bump` and the `release` tasks.
        const changesSinceLastRelease = '! git log --oneline -1 | grep -q "chore(release):"';
        this.bumpTask = project.addTask('bump', {
            description: 'Commits a bump to the package version based on conventional commits',
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'standard-version',
            condition: changesSinceLastRelease,
        });
        const release = project.addTask('release', {
            description: `Bumps version & push to ${options.releaseBranch}`,
            category: tasks_1.TaskCategory.RELEASE,
            condition: changesSinceLastRelease,
        });
        release.spawn(this.bumpTask);
        release.exec(`git push --follow-tags origin ${options.releaseBranch}`);
        project.addDevDeps('standard-version@^9');
        (_b = project.npmignore) === null || _b === void 0 ? void 0 : _b.exclude('/.versionrc.json');
        project.gitignore.include(VERSION_FILE);
        let projenCommand = project.package.projenCommand;
        if (project.parent) {
            projenCommand = `cd ${path.relative(project.outdir, project.root.outdir)} && ${project.package.projenCommand}`;
        }
        new json_1.JsonFile(project, '.versionrc.json', {
            obj: {
                packageFiles: [{ filename: VERSION_FILE, type: 'json' }],
                bumpFiles: [{ filename: VERSION_FILE, type: 'json' }],
                commitAll: true,
                scripts: {
                    // run projen after release to update package.json
                    postbump: `${projenCommand} && git add .`,
                },
            },
        });
    }
    /**
     * (experimental) Returns the current version of the project.
     *
     * @experimental
     */
    get currentVersion() {
        const outdir = this.project.outdir;
        const versionFile = `${outdir}/${VERSION_FILE}`;
        if (!fs.existsSync(versionFile)) {
            if (!fs.existsSync(outdir)) {
                fs.mkdirpSync(outdir);
            }
            fs.writeFileSync(versionFile, JSON.stringify({ version: '0.0.0' }));
        }
        return JSON.parse(fs.readFileSync(versionFile, 'utf-8')).version;
    }
}
exports.Version = Version;
_a = JSII_RTTI_SYMBOL_1;
Version[_a] = { fqn: "projen.Version", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkJBQTZCO0FBQzdCLCtCQUErQjtBQUMvQiwyQ0FBd0M7QUFDeEMsaUNBQWtDO0FBRWxDLG1DQUE2QztBQUU3QyxNQUFNLFlBQVksR0FBRyxjQUFjLENBQUM7Ozs7QUFTcEMsTUFBYSxPQUFRLFNBQVEscUJBQVM7Ozs7SUFJcEMsWUFBWSxPQUFvQixFQUFFLE9BQXVCOztRQUN2RCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZiwyRUFBMkU7UUFDM0UsMEVBQTBFO1FBQzFFLHNDQUFzQztRQUN0QyxNQUFNLHVCQUF1QixHQUFHLG9EQUFvRCxDQUFDO1FBRXJGLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdEMsV0FBVyxFQUFFLHFFQUFxRTtZQUNsRixRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPO1lBQzlCLElBQUksRUFBRSxrQkFBa0I7WUFDeEIsU0FBUyxFQUFFLHVCQUF1QjtTQUNuQyxDQUFDLENBQUM7UUFFSCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUN6QyxXQUFXLEVBQUUsMkJBQTJCLE9BQU8sQ0FBQyxhQUFhLEVBQUU7WUFDL0QsUUFBUSxFQUFFLG9CQUFZLENBQUMsT0FBTztZQUM5QixTQUFTLEVBQUUsdUJBQXVCO1NBQ25DLENBQUMsQ0FBQztRQUVILE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1FBRXZFLE9BQU8sQ0FBQyxVQUFVLENBQ2hCLHFCQUFxQixDQUN0QixDQUFDO1FBRUYsTUFBQSxPQUFPLENBQUMsU0FBUywwQ0FBRSxPQUFPLENBQUMsa0JBQWtCLEVBQUU7UUFDL0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFeEMsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFDbEQsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ2xCLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUM7U0FDaEg7UUFDRCxJQUFJLGVBQVEsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUU7WUFDdkMsR0FBRyxFQUFFO2dCQUNILFlBQVksRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ3hELFNBQVMsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLENBQUM7Z0JBQ3JELFNBQVMsRUFBRSxJQUFJO2dCQUNmLE9BQU8sRUFBRTtvQkFDUCxrREFBa0Q7b0JBQ2xELFFBQVEsRUFBRSxHQUFHLGFBQWEsZUFBZTtpQkFDMUM7YUFDRjtTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7Ozs7OztJQUtELElBQVcsY0FBYztRQUN2QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUNuQyxNQUFNLFdBQVcsR0FBRyxHQUFHLE1BQU0sSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtZQUMvQixJQUFJLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDMUIsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN2QjtZQUNELEVBQUUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3JFO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ25FLENBQUM7O0FBbEVILDBCQW1FQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBKc29uRmlsZSB9IGZyb20gJy4vanNvbic7XG5pbXBvcnQgeyBOb2RlUHJvamVjdCB9IGZyb20gJy4vbm9kZS1wcm9qZWN0JztcbmltcG9ydCB7IFRhc2ssIFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuXG5jb25zdCBWRVJTSU9OX0ZJTEUgPSAndmVyc2lvbi5qc29uJztcblxuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICByZWFkb25seSByZWxlYXNlQnJhbmNoOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBWZXJzaW9uIGV4dGVuZHMgQ29tcG9uZW50IHtcblxuICBwdWJsaWMgcmVhZG9ubHkgYnVtcFRhc2s6IFRhc2s7XG5cbiAgY29uc3RydWN0b3IocHJvamVjdDogTm9kZVByb2plY3QsIG9wdGlvbnM6IFZlcnNpb25PcHRpb25zKSB7XG4gICAgc3VwZXIocHJvamVjdCk7XG5cbiAgICAvLyB0aGlzIGNvbW1hbmQgZGV0ZXJtaW5lcyBpZiB0aGVyZSB3ZXJlIGFueSBjaGFuZ2VzIHNpbmNlIHRoZSBsYXN0IHJlbGVhc2VcbiAgICAvLyAodGhlIHRvcC1tb3N0IGNvbW1pdCBpcyBub3QgYSBidW1wKS4gaXQgaXMgdXNlZCBhcyBhIGNvbmRpdGlvbiBmb3IgYm90aFxuICAgIC8vIHRoZSBgYnVtcGAgYW5kIHRoZSBgcmVsZWFzZWAgdGFza3MuXG4gICAgY29uc3QgY2hhbmdlc1NpbmNlTGFzdFJlbGVhc2UgPSAnISBnaXQgbG9nIC0tb25lbGluZSAtMSB8IGdyZXAgLXEgXCJjaG9yZShyZWxlYXNlKTpcIic7XG5cbiAgICB0aGlzLmJ1bXBUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdidW1wJywge1xuICAgICAgZGVzY3JpcHRpb246ICdDb21taXRzIGEgYnVtcCB0byB0aGUgcGFja2FnZSB2ZXJzaW9uIGJhc2VkIG9uIGNvbnZlbnRpb25hbCBjb21taXRzJyxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuUkVMRUFTRSxcbiAgICAgIGV4ZWM6ICdzdGFuZGFyZC12ZXJzaW9uJyxcbiAgICAgIGNvbmRpdGlvbjogY2hhbmdlc1NpbmNlTGFzdFJlbGVhc2UsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZWxlYXNlID0gcHJvamVjdC5hZGRUYXNrKCdyZWxlYXNlJywge1xuICAgICAgZGVzY3JpcHRpb246IGBCdW1wcyB2ZXJzaW9uICYgcHVzaCB0byAke29wdGlvbnMucmVsZWFzZUJyYW5jaH1gLFxuICAgICAgY2F0ZWdvcnk6IFRhc2tDYXRlZ29yeS5SRUxFQVNFLFxuICAgICAgY29uZGl0aW9uOiBjaGFuZ2VzU2luY2VMYXN0UmVsZWFzZSxcbiAgICB9KTtcblxuICAgIHJlbGVhc2Uuc3Bhd24odGhpcy5idW1wVGFzayk7XG4gICAgcmVsZWFzZS5leGVjKGBnaXQgcHVzaCAtLWZvbGxvdy10YWdzIG9yaWdpbiAke29wdGlvbnMucmVsZWFzZUJyYW5jaH1gKTtcblxuICAgIHByb2plY3QuYWRkRGV2RGVwcyhcbiAgICAgICdzdGFuZGFyZC12ZXJzaW9uQF45JyxcbiAgICApO1xuXG4gICAgcHJvamVjdC5ucG1pZ25vcmU/LmV4Y2x1ZGUoJy8udmVyc2lvbnJjLmpzb24nKTtcbiAgICBwcm9qZWN0LmdpdGlnbm9yZS5pbmNsdWRlKFZFUlNJT05fRklMRSk7XG5cbiAgICBsZXQgcHJvamVuQ29tbWFuZCA9IHByb2plY3QucGFja2FnZS5wcm9qZW5Db21tYW5kO1xuICAgIGlmIChwcm9qZWN0LnBhcmVudCkge1xuICAgICAgcHJvamVuQ29tbWFuZCA9IGBjZCAke3BhdGgucmVsYXRpdmUocHJvamVjdC5vdXRkaXIsIHByb2plY3Qucm9vdC5vdXRkaXIpfSAmJiAke3Byb2plY3QucGFja2FnZS5wcm9qZW5Db21tYW5kfWA7XG4gICAgfVxuICAgIG5ldyBKc29uRmlsZShwcm9qZWN0LCAnLnZlcnNpb25yYy5qc29uJywge1xuICAgICAgb2JqOiB7XG4gICAgICAgIHBhY2thZ2VGaWxlczogW3sgZmlsZW5hbWU6IFZFUlNJT05fRklMRSwgdHlwZTogJ2pzb24nIH1dLFxuICAgICAgICBidW1wRmlsZXM6IFt7IGZpbGVuYW1lOiBWRVJTSU9OX0ZJTEUsIHR5cGU6ICdqc29uJyB9XSxcbiAgICAgICAgY29tbWl0QWxsOiB0cnVlLFxuICAgICAgICBzY3JpcHRzOiB7XG4gICAgICAgICAgLy8gcnVuIHByb2plbiBhZnRlciByZWxlYXNlIHRvIHVwZGF0ZSBwYWNrYWdlLmpzb25cbiAgICAgICAgICBwb3N0YnVtcDogYCR7cHJvamVuQ29tbWFuZH0gJiYgZ2l0IGFkZCAuYCxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBnZXQgY3VycmVudFZlcnNpb24oKSB7XG4gICAgY29uc3Qgb3V0ZGlyID0gdGhpcy5wcm9qZWN0Lm91dGRpcjtcbiAgICBjb25zdCB2ZXJzaW9uRmlsZSA9IGAke291dGRpcn0vJHtWRVJTSU9OX0ZJTEV9YDtcbiAgICBpZiAoIWZzLmV4aXN0c1N5bmModmVyc2lvbkZpbGUpKSB7XG4gICAgICBpZiAoIWZzLmV4aXN0c1N5bmMob3V0ZGlyKSkge1xuICAgICAgICBmcy5ta2RpcnBTeW5jKG91dGRpcik7XG4gICAgICB9XG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHZlcnNpb25GaWxlLCBKU09OLnN0cmluZ2lmeSh7IHZlcnNpb246ICcwLjAuMCcgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh2ZXJzaW9uRmlsZSwgJ3V0Zi04JykpLnZlcnNpb247XG4gIH1cbn1cbiJdfQ==