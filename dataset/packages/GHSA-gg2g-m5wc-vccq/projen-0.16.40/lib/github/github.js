"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHub = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const dependabot_1 = require("./dependabot");
const mergify_1 = require("./mergify");
const pr_template_1 = require("./pr-template");
const workflows_1 = require("./workflows");
/**
 * @experimental
 */
class GitHub extends component_1.Component {
    /**
     * @experimental
     */
    addMergifyRules(...rules) {
        if (!this.mergify) {
            this.mergify = new mergify_1.Mergify(this);
        }
        for (const r of rules) {
            this.mergify.addRule(r);
        }
    }
    /**
     * @experimental
     */
    addWorkflow(name) {
        return new workflows_1.GithubWorkflow(this, name);
    }
    /**
     * @experimental
     */
    addPullRequestTemplate(...content) {
        return new pr_template_1.PullRequestTemplate(this, { lines: content });
    }
    /**
     * @experimental
     */
    addDependabot(options) {
        return new dependabot_1.Dependabot(this, options);
    }
}
exports.GitHub = GitHub;
_a = JSII_RTTI_SYMBOL_1;
GitHub[_a] = { fqn: "projen.github.GitHub", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dpdGh1Yi9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFDekMsNkNBQTZEO0FBQzdELHVDQUFpRDtBQUNqRCwrQ0FBb0Q7QUFDcEQsMkNBQTZDOzs7O0FBRTdDLE1BQWEsTUFBTyxTQUFRLHFCQUFTOzs7O0lBRzVCLGVBQWUsQ0FBQyxHQUFHLEtBQW9CO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xDO1FBRUQsS0FBSyxNQUFNLENBQUMsSUFBSSxLQUFLLEVBQUU7WUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekI7SUFDSCxDQUFDOzs7O0lBRU0sV0FBVyxDQUFDLElBQVk7UUFDN0IsT0FBTyxJQUFJLDBCQUFjLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3hDLENBQUM7Ozs7SUFFTSxzQkFBc0IsQ0FBQyxHQUFHLE9BQWlCO1FBQ2hELE9BQU8sSUFBSSxpQ0FBbUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUMzRCxDQUFDOzs7O0lBRU0sYUFBYSxDQUFDLE9BQTJCO1FBQzlDLE9BQU8sSUFBSSx1QkFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxDQUFDOztBQXZCSCx3QkF3QkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuLi9jb21wb25lbnQnO1xuaW1wb3J0IHsgRGVwZW5kYWJvdCwgRGVwZW5kYWJvdE9wdGlvbnMgfSBmcm9tICcuL2RlcGVuZGFib3QnO1xuaW1wb3J0IHsgTWVyZ2lmeSwgTWVyZ2lmeVJ1bGUgfSBmcm9tICcuL21lcmdpZnknO1xuaW1wb3J0IHsgUHVsbFJlcXVlc3RUZW1wbGF0ZSB9IGZyb20gJy4vcHItdGVtcGxhdGUnO1xuaW1wb3J0IHsgR2l0aHViV29ya2Zsb3cgfSBmcm9tICcuL3dvcmtmbG93cyc7XG5cbmV4cG9ydCBjbGFzcyBHaXRIdWIgZXh0ZW5kcyBDb21wb25lbnQge1xuICBwcml2YXRlIG1lcmdpZnk/OiBNZXJnaWZ5O1xuXG4gIHB1YmxpYyBhZGRNZXJnaWZ5UnVsZXMoLi4ucnVsZXM6IE1lcmdpZnlSdWxlW10pIHtcbiAgICBpZiAoIXRoaXMubWVyZ2lmeSkge1xuICAgICAgdGhpcy5tZXJnaWZ5ID0gbmV3IE1lcmdpZnkodGhpcyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCByIG9mIHJ1bGVzKSB7XG4gICAgICB0aGlzLm1lcmdpZnkuYWRkUnVsZShyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgYWRkV29ya2Zsb3cobmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBHaXRodWJXb3JrZmxvdyh0aGlzLCBuYW1lKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRQdWxsUmVxdWVzdFRlbXBsYXRlKC4uLmNvbnRlbnQ6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdFRlbXBsYXRlKHRoaXMsIHsgbGluZXM6IGNvbnRlbnQgfSk7XG4gIH1cblxuICBwdWJsaWMgYWRkRGVwZW5kYWJvdChvcHRpb25zPzogRGVwZW5kYWJvdE9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IERlcGVuZGFib3QodGhpcywgb3B0aW9ucyk7XG4gIH1cbn0iXX0=