"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMerge = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
/**
 * (experimental) Sets up mergify to merging approved pull requests.
 *
 * If `buildJob` is specified, the specified GitHub workflow job ID is required
 * to succeed in order for the PR to be merged.
 *
 * `approvedReviews` specified the number of code review approvals required for
 * the PR to be merged.
 *
 * @experimental
 */
class AutoMerge extends component_1.Component {
    /**
     * @experimental
     */
    constructor(project, options = {}) {
        var _b, _c, _d, _e;
        super(project);
        const successfulBuild = options.buildJob
            ? [`status-success=${options.buildJob}`]
            : [];
        const mergeAction = {
            merge: {
                // squash all commits into a single commit when merging
                method: 'squash',
                // use PR title+body as the commit message
                commit_message: 'title+body',
                // update PR branch so it's up-to-date before merging
                strict: 'smart',
                strict_method: 'merge',
            },
            delete_head_branch: {},
        };
        const approvedReviews = (_b = options.approvedReviews) !== null && _b !== void 0 ? _b : 1;
        (_c = project.github) === null || _c === void 0 ? void 0 : _c.addMergifyRules({
            name: 'Automatic merge on approval and successful build',
            actions: mergeAction,
            conditions: [
                `#approved-reviews-by>=${approvedReviews}`,
                ...successfulBuild,
            ],
        });
        // empty string means disabled.
        const autoMergeLabel = (_d = options.autoMergeLabel) !== null && _d !== void 0 ? _d : 'auto-merge';
        ;
        this.autoMergeLabel = autoMergeLabel;
        if (this.autoMergeLabel) {
            (_e = project.github) === null || _e === void 0 ? void 0 : _e.addMergifyRules({
                name: `Automatic merge PRs with ${autoMergeLabel} label upon successful build`,
                actions: mergeAction,
                conditions: [
                    `label=${autoMergeLabel}`,
                    ...successfulBuild,
                ],
            });
        }
    }
}
exports.AutoMerge = AutoMerge;
_a = JSII_RTTI_SYMBOL_1;
AutoMerge[_a] = { fqn: "projen.github.AutoMerge", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9naXRodWIvYXV0by1tZXJnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDRDQUF5Qzs7Ozs7Ozs7Ozs7O0FBa0N6QyxNQUFhLFNBQVUsU0FBUSxxQkFBUzs7OztJQUd0QyxZQUFZLE9BQWdCLEVBQUUsVUFBNEIsRUFBRzs7UUFDM0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWYsTUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLFFBQVE7WUFDdEMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN4QyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRVAsTUFBTSxXQUFXLEdBQUc7WUFDbEIsS0FBSyxFQUFFO2dCQUNQLHVEQUF1RDtnQkFDckQsTUFBTSxFQUFFLFFBQVE7Z0JBRWhCLDBDQUEwQztnQkFDMUMsY0FBYyxFQUFFLFlBQVk7Z0JBRTVCLHFEQUFxRDtnQkFDckQsTUFBTSxFQUFFLE9BQU87Z0JBQ2YsYUFBYSxFQUFFLE9BQU87YUFDdkI7WUFFRCxrQkFBa0IsRUFBRSxFQUFHO1NBQ3hCLENBQUM7UUFFRixNQUFNLGVBQWUsU0FBRyxPQUFPLENBQUMsZUFBZSxtQ0FBSSxDQUFDLENBQUM7UUFFckQsTUFBQSxPQUFPLENBQUMsTUFBTSwwQ0FBRSxlQUFlLENBQUM7WUFDOUIsSUFBSSxFQUFFLGtEQUFrRDtZQUN4RCxPQUFPLEVBQUUsV0FBVztZQUNwQixVQUFVLEVBQUU7Z0JBQ1YseUJBQXlCLGVBQWUsRUFBRTtnQkFDMUMsR0FBRyxlQUFlO2FBQ25CO1NBQ0YsRUFBRTtRQUVILCtCQUErQjtRQUMvQixNQUFNLGNBQWMsU0FBRyxPQUFPLENBQUMsY0FBYyxtQ0FBSSxZQUFZLENBQUM7UUFBQSxDQUFDO1FBQy9ELElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QixNQUFBLE9BQU8sQ0FBQyxNQUFNLDBDQUFFLGVBQWUsQ0FBQztnQkFDOUIsSUFBSSxFQUFFLDRCQUE0QixjQUFjLDhCQUE4QjtnQkFDOUUsT0FBTyxFQUFFLFdBQVc7Z0JBQ3BCLFVBQVUsRUFBRTtvQkFDVixTQUFTLGNBQWMsRUFBRTtvQkFDekIsR0FBRyxlQUFlO2lCQUNuQjthQUNGLEVBQUU7U0FDSjtJQUNILENBQUM7O0FBbERILDhCQW1EQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJy4uL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi4vcHJvamVjdCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXV0b01lcmdlT3B0aW9ucyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcmVhZG9ubHkgYnVpbGRKb2I/OiBzdHJpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGFwcHJvdmVkUmV2aWV3cz86IG51bWJlcjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHJlYWRvbmx5IGF1dG9NZXJnZUxhYmVsPzogc3RyaW5nO1xufVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIEF1dG9NZXJnZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIHB1YmxpYyByZWFkb25seSBhdXRvTWVyZ2VMYWJlbDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QsIG9wdGlvbnM6IEF1dG9NZXJnZU9wdGlvbnMgPSB7IH0pIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IHN1Y2Nlc3NmdWxCdWlsZCA9IG9wdGlvbnMuYnVpbGRKb2JcbiAgICAgID8gW2BzdGF0dXMtc3VjY2Vzcz0ke29wdGlvbnMuYnVpbGRKb2J9YF1cbiAgICAgIDogW107XG5cbiAgICBjb25zdCBtZXJnZUFjdGlvbiA9IHtcbiAgICAgIG1lcmdlOiB7XG4gICAgICAvLyBzcXVhc2ggYWxsIGNvbW1pdHMgaW50byBhIHNpbmdsZSBjb21taXQgd2hlbiBtZXJnaW5nXG4gICAgICAgIG1ldGhvZDogJ3NxdWFzaCcsXG5cbiAgICAgICAgLy8gdXNlIFBSIHRpdGxlK2JvZHkgYXMgdGhlIGNvbW1pdCBtZXNzYWdlXG4gICAgICAgIGNvbW1pdF9tZXNzYWdlOiAndGl0bGUrYm9keScsXG5cbiAgICAgICAgLy8gdXBkYXRlIFBSIGJyYW5jaCBzbyBpdCdzIHVwLXRvLWRhdGUgYmVmb3JlIG1lcmdpbmdcbiAgICAgICAgc3RyaWN0OiAnc21hcnQnLFxuICAgICAgICBzdHJpY3RfbWV0aG9kOiAnbWVyZ2UnLFxuICAgICAgfSxcblxuICAgICAgZGVsZXRlX2hlYWRfYnJhbmNoOiB7IH0sXG4gICAgfTtcblxuICAgIGNvbnN0IGFwcHJvdmVkUmV2aWV3cyA9IG9wdGlvbnMuYXBwcm92ZWRSZXZpZXdzID8/IDE7XG5cbiAgICBwcm9qZWN0LmdpdGh1Yj8uYWRkTWVyZ2lmeVJ1bGVzKHtcbiAgICAgIG5hbWU6ICdBdXRvbWF0aWMgbWVyZ2Ugb24gYXBwcm92YWwgYW5kIHN1Y2Nlc3NmdWwgYnVpbGQnLFxuICAgICAgYWN0aW9uczogbWVyZ2VBY3Rpb24sXG4gICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgIGAjYXBwcm92ZWQtcmV2aWV3cy1ieT49JHthcHByb3ZlZFJldmlld3N9YCxcbiAgICAgICAgLi4uc3VjY2Vzc2Z1bEJ1aWxkLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIGVtcHR5IHN0cmluZyBtZWFucyBkaXNhYmxlZC5cbiAgICBjb25zdCBhdXRvTWVyZ2VMYWJlbCA9IG9wdGlvbnMuYXV0b01lcmdlTGFiZWwgPz8gJ2F1dG8tbWVyZ2UnOztcbiAgICB0aGlzLmF1dG9NZXJnZUxhYmVsID0gYXV0b01lcmdlTGFiZWw7XG4gICAgaWYgKHRoaXMuYXV0b01lcmdlTGFiZWwpIHtcbiAgICAgIHByb2plY3QuZ2l0aHViPy5hZGRNZXJnaWZ5UnVsZXMoe1xuICAgICAgICBuYW1lOiBgQXV0b21hdGljIG1lcmdlIFBScyB3aXRoICR7YXV0b01lcmdlTGFiZWx9IGxhYmVsIHVwb24gc3VjY2Vzc2Z1bCBidWlsZGAsXG4gICAgICAgIGFjdGlvbnM6IG1lcmdlQWN0aW9uLFxuICAgICAgICBjb25kaXRpb25zOiBbXG4gICAgICAgICAgYGxhYmVsPSR7YXV0b01lcmdlTGFiZWx9YCxcbiAgICAgICAgICAuLi5zdWNjZXNzZnVsQnVpbGQsXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn0iXX0=