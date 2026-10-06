"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjenUpgrade = void 0;
const tasks_1 = require("./tasks");
/**
 * Checks for new versions of projen and creates a PR with an upgrade change.
 */
class ProjenUpgrade {
    constructor(project, options = {}) {
        var _a;
        const upgradeTask = project.addTask('projen:upgrade', {
            description: 'upgrades projen to the latest version',
            category: tasks_1.TaskCategory.MAINTAIN,
        });
        upgradeTask.exec('yarn upgrade -L projen');
        upgradeTask.exec('CI="" yarn projen');
        if (options.autoUpgradeSecret) {
            if (!project.github) {
                throw new Error('github workflows are required in order for auto-update');
            }
            const workflow = project.github.addWorkflow('ProjenUpgrade');
            workflow.on({
                schedule: options.autoUpgradeSchedule
                    ? options.autoUpgradeSchedule.map(s => ({ cron: s }))
                    : [{ cron: '0 6 * * *' }],
                workflow_dispatch: {},
            });
            const withOptions = {
                'token': '${{ secrets.' + options.autoUpgradeSecret + ' }}',
                'commit-message': 'chore: upgrade projen',
                'branch': 'auto/projen-upgrade',
                'title': 'chore: upgrade projen',
                'body': 'This PR upgrades projen to the latest version',
            };
            if ((_a = options.labels) === null || _a === void 0 ? void 0 : _a.length) {
                withOptions.labels = options.labels.join(',');
            }
            workflow.addJobs({
                upgrade: {
                    'runs-on': 'ubuntu-latest',
                    'steps': [
                        // check out sources.
                        {
                            name: 'Checkout',
                            uses: 'actions/checkout@v2',
                        },
                        // install dependencies (and runs projen)
                        ...project.installWorkflowSteps,
                        // upgrade
                        {
                            name: 'Upgrade projen',
                            run: project.runTaskCommand(upgradeTask),
                        },
                        // submit a PR
                        {
                            name: 'Create pull request',
                            uses: 'peter-evans/create-pull-request@v3',
                            with: withOptions,
                        },
                    ],
                },
            });
        }
    }
}
exports.ProjenUpgrade = ProjenUpgrade;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVuLXVwZ3JhZGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcHJvamVuLXVwZ3JhZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsbUNBQXVDO0FBNkJ2Qzs7R0FFRztBQUNILE1BQWEsYUFBYTtJQUN4QixZQUFZLE9BQW9CLEVBQUUsVUFBZ0MsRUFBRzs7UUFDbkUsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtZQUNwRCxXQUFXLEVBQUUsdUNBQXVDO1lBQ3BELFFBQVEsRUFBRSxvQkFBWSxDQUFDLFFBQVE7U0FDaEMsQ0FBQyxDQUFDO1FBRUgsV0FBVyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQzNDLFdBQVcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUV0QyxJQUFJLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTtZQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO2FBQzNFO1lBRUQsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFN0QsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDVixRQUFRLEVBQUUsT0FBTyxDQUFDLG1CQUFtQjtvQkFDbkMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3JELENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO2dCQUMzQixpQkFBaUIsRUFBRSxFQUFFO2FBQ3RCLENBQUMsQ0FBQztZQUVILE1BQU0sV0FBVyxHQUEyQjtnQkFDMUMsT0FBTyxFQUFFLGNBQWMsR0FBRyxPQUFPLENBQUMsaUJBQWlCLEdBQUcsS0FBSztnQkFDM0QsZ0JBQWdCLEVBQUUsdUJBQXVCO2dCQUN6QyxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixPQUFPLEVBQUUsdUJBQXVCO2dCQUNoQyxNQUFNLEVBQUUsK0NBQStDO2FBQ3hELENBQUM7WUFFRixVQUFJLE9BQU8sQ0FBQyxNQUFNLDBDQUFFLE1BQU0sRUFBRTtnQkFDMUIsV0FBVyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUMvQztZQUVELFFBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ2YsT0FBTyxFQUFFO29CQUNQLFNBQVMsRUFBRSxlQUFlO29CQUMxQixPQUFPLEVBQUU7d0JBQ1AscUJBQXFCO3dCQUNyQjs0QkFDRSxJQUFJLEVBQUUsVUFBVTs0QkFDaEIsSUFBSSxFQUFFLHFCQUFxQjt5QkFDNUI7d0JBRUQseUNBQXlDO3dCQUN6QyxHQUFHLE9BQU8sQ0FBQyxvQkFBb0I7d0JBRS9CLFVBQVU7d0JBQ1Y7NEJBQ0UsSUFBSSxFQUFFLGdCQUFnQjs0QkFDdEIsR0FBRyxFQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDO3lCQUN6Qzt3QkFFRCxjQUFjO3dCQUNkOzRCQUNFLElBQUksRUFBRSxxQkFBcUI7NEJBQzNCLElBQUksRUFBRSxvQ0FBb0M7NEJBQzFDLElBQUksRUFBRSxXQUFXO3lCQUNsQjtxQkFDRjtpQkFDRjthQUNGLENBQUMsQ0FBQztTQUNKO0lBQ0gsQ0FBQztDQUNGO0FBbEVELHNDQWtFQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5vZGVQcm9qZWN0IH0gZnJvbSAnLi9ub2RlLXByb2plY3QnO1xuaW1wb3J0IHsgVGFza0NhdGVnb3J5IH0gZnJvbSAnLi90YXNrcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvamVuVXBncmFkZU9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHNlY3JldCBuYW1lIHdoaWNoIGNvbnRhaW5zIGEgR2l0SHViIEFjY2VzcyBUb2tlbiB3aXRoIGByZXBvYCBhbmRcbiAgICogYHdvcmtmbG93YCBwZXJtaXNzaW9ucy4gVGhpcyB0b2tlbiBpcyB1c2VkIHRvIHN1Ym1pdCB0aGUgdXBncmFkZSBwdWxsXG4gICAqIHJlcXVlc3QsIHdoaWNoIHdpbGwgbGlrZWx5IGluY2x1ZGUgd29ya2Zsb3cgdXBkYXRlcy5cbiAgICpcbiAgICogQGRlZmF1bHQgLSBhdXRvLXVwZ3JhZGUgaXMgZGlzYWJsZWRcbiAgICovXG4gIHJlYWRvbmx5IGF1dG9VcGdyYWRlU2VjcmV0Pzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBcHBseSBsYWJlbHMgdG8gdGhlIFBSLiBGb3IgZXhhbXBsZSwgeW91IGNhbiBhZGQgdGhlIGxhYmVsIFwiYXV0by1tZXJnZVwiLFxuICAgKiB3aGljaCwgaW4tdGFuZGVtIHdpdGggbWVyZ2lmeSBjb25maWd1cmF0aW9uIHdpbGwgYXV0b21hdGljYWxseSBtZXJnZSB0aGVzZVxuICAgKiBQUnMgaWYgdGhlaXIgYnVpbGQgcGFzc2VzLlxuICAgKlxuICAgKiBAZGVmYXVsdCBbXVxuICAgKi9cbiAgcmVhZG9ubHkgbGFiZWxzPzogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEN1c3RvbWl6ZSB0aGUgcHJvamVuVXBncmFkZSBzY2hlZHVsZSBpbiBjcm9uIGV4cHJlc3Npb24uXG4gICAqXG4gICBAZGVmYXVsdCBbICcwIDYgKiAqIConIF1cbiAgICovXG4gIHJlYWRvbmx5IGF1dG9VcGdyYWRlU2NoZWR1bGU/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBDaGVja3MgZm9yIG5ldyB2ZXJzaW9ucyBvZiBwcm9qZW4gYW5kIGNyZWF0ZXMgYSBQUiB3aXRoIGFuIHVwZ3JhZGUgY2hhbmdlLlxuICovXG5leHBvcnQgY2xhc3MgUHJvamVuVXBncmFkZSB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IE5vZGVQcm9qZWN0LCBvcHRpb25zOiBQcm9qZW5VcGdyYWRlT3B0aW9ucyA9IHsgfSkge1xuICAgIGNvbnN0IHVwZ3JhZGVUYXNrID0gcHJvamVjdC5hZGRUYXNrKCdwcm9qZW46dXBncmFkZScsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAndXBncmFkZXMgcHJvamVuIHRvIHRoZSBsYXRlc3QgdmVyc2lvbicsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5Lk1BSU5UQUlOLFxuICAgIH0pO1xuXG4gICAgdXBncmFkZVRhc2suZXhlYygneWFybiB1cGdyYWRlIC1MIHByb2plbicpO1xuICAgIHVwZ3JhZGVUYXNrLmV4ZWMoJ0NJPVwiXCIgeWFybiBwcm9qZW4nKTtcblxuICAgIGlmIChvcHRpb25zLmF1dG9VcGdyYWRlU2VjcmV0KSB7XG4gICAgICBpZiAoIXByb2plY3QuZ2l0aHViKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZ2l0aHViIHdvcmtmbG93cyBhcmUgcmVxdWlyZWQgaW4gb3JkZXIgZm9yIGF1dG8tdXBkYXRlJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHdvcmtmbG93ID0gcHJvamVjdC5naXRodWIuYWRkV29ya2Zsb3coJ1Byb2plblVwZ3JhZGUnKTtcblxuICAgICAgd29ya2Zsb3cub24oe1xuICAgICAgICBzY2hlZHVsZTogb3B0aW9ucy5hdXRvVXBncmFkZVNjaGVkdWxlXG4gICAgICAgICAgPyBvcHRpb25zLmF1dG9VcGdyYWRlU2NoZWR1bGUubWFwKHMgPT4gKHsgY3JvbjogcyB9KSlcbiAgICAgICAgICA6IFt7IGNyb246ICcwIDYgKiAqIConIH1dLCAvLyA2YW0gZXZlcnkgZGF5XG4gICAgICAgIHdvcmtmbG93X2Rpc3BhdGNoOiB7fSwgLy8gYWxsb3cgbWFudWFsIHRyaWdnZXJpbmdcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCB3aXRoT3B0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgJ3Rva2VuJzogJyR7eyBzZWNyZXRzLicgKyBvcHRpb25zLmF1dG9VcGdyYWRlU2VjcmV0ICsgJyB9fScsXG4gICAgICAgICdjb21taXQtbWVzc2FnZSc6ICdjaG9yZTogdXBncmFkZSBwcm9qZW4nLFxuICAgICAgICAnYnJhbmNoJzogJ2F1dG8vcHJvamVuLXVwZ3JhZGUnLFxuICAgICAgICAndGl0bGUnOiAnY2hvcmU6IHVwZ3JhZGUgcHJvamVuJyxcbiAgICAgICAgJ2JvZHknOiAnVGhpcyBQUiB1cGdyYWRlcyBwcm9qZW4gdG8gdGhlIGxhdGVzdCB2ZXJzaW9uJyxcbiAgICAgIH07XG5cbiAgICAgIGlmIChvcHRpb25zLmxhYmVscz8ubGVuZ3RoKSB7XG4gICAgICAgIHdpdGhPcHRpb25zLmxhYmVscyA9IG9wdGlvbnMubGFiZWxzLmpvaW4oJywnKTtcbiAgICAgIH1cblxuICAgICAgd29ya2Zsb3cuYWRkSm9icyh7XG4gICAgICAgIHVwZ3JhZGU6IHtcbiAgICAgICAgICAncnVucy1vbic6ICd1YnVudHUtbGF0ZXN0JyxcbiAgICAgICAgICAnc3RlcHMnOiBbXG4gICAgICAgICAgICAvLyBjaGVjayBvdXQgc291cmNlcy5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogJ0NoZWNrb3V0JyxcbiAgICAgICAgICAgICAgdXNlczogJ2FjdGlvbnMvY2hlY2tvdXRAdjInLFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgKGFuZCBydW5zIHByb2plbilcbiAgICAgICAgICAgIC4uLnByb2plY3QuaW5zdGFsbFdvcmtmbG93U3RlcHMsXG5cbiAgICAgICAgICAgIC8vIHVwZ3JhZGVcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgbmFtZTogJ1VwZ3JhZGUgcHJvamVuJyxcbiAgICAgICAgICAgICAgcnVuOiBwcm9qZWN0LnJ1blRhc2tDb21tYW5kKHVwZ3JhZGVUYXNrKSxcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8vIHN1Ym1pdCBhIFBSXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdDcmVhdGUgcHVsbCByZXF1ZXN0JyxcbiAgICAgICAgICAgICAgdXNlczogJ3BldGVyLWV2YW5zL2NyZWF0ZS1wdWxsLXJlcXVlc3RAdjMnLFxuICAgICAgICAgICAgICB3aXRoOiB3aXRoT3B0aW9ucyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufVxuIl19