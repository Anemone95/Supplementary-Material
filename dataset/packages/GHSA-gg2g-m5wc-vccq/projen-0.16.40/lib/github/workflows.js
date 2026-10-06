"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubWorkflow = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
const component_1 = require("../component");
const yaml_1 = require("../yaml");
/**
 * @experimental
 */
class GithubWorkflow extends component_1.Component {
    /**
     * @experimental
     */
    constructor(github, name) {
        super(github.project);
        this.events = {};
        this.jobs = {};
        this.name = name;
        this.file = new yaml_1.YamlFile(this.project, `.github/workflows/${name.toLocaleLowerCase()}.yml`, {
            obj: () => this.renderWorkflow(),
            marker: true,
        });
    }
    /**
     * @experimental
     */
    on(events) {
        this.events = {
            ...this.events,
            ...events,
        };
    }
    /**
     * @experimental
     */
    addJobs(jobs) {
        this.jobs = {
            ...this.jobs,
            ...jobs,
        };
    }
    renderWorkflow() {
        return {
            name: this.name,
            on: this.events,
            jobs: this.jobs,
        };
    }
}
exports.GithubWorkflow = GithubWorkflow;
_a = JSII_RTTI_SYMBOL_1;
GithubWorkflow[_a] = { fqn: "projen.github.GithubWorkflow", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3dzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2dpdGh1Yi93b3JrZmxvd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0Q0FBeUM7QUFDekMsa0NBQW1DOzs7O0FBR25DLE1BQWEsY0FBZSxTQUFRLHFCQUFTOzs7O0lBTTNDLFlBQVksTUFBYyxFQUFFLElBQVk7UUFDdEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUxoQixXQUFNLEdBQTZCLEVBQUcsQ0FBQztRQUN2QyxTQUFJLEdBQTZCLEVBQUcsQ0FBQztRQU0zQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksZUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLEVBQUU7WUFDMUYsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7WUFDaEMsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7SUFDTCxDQUFDOzs7O0lBRU0sRUFBRSxDQUFDLE1BQWdDO1FBQ3hDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFDWixHQUFHLElBQUksQ0FBQyxNQUFNO1lBQ2QsR0FBRyxNQUFNO1NBQ1YsQ0FBQztJQUNKLENBQUM7Ozs7SUFFTSxPQUFPLENBQUMsSUFBOEI7UUFDM0MsSUFBSSxDQUFDLElBQUksR0FBRztZQUNWLEdBQUcsSUFBSSxDQUFDLElBQUk7WUFDWixHQUFHLElBQUk7U0FDUixDQUFDO0lBQ0osQ0FBQztJQUVPLGNBQWM7UUFDcEIsT0FBTztZQUNMLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEVBQUUsRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtTQUNoQixDQUFDO0lBQ0osQ0FBQzs7QUFwQ0gsd0NBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnLi4vY29tcG9uZW50JztcbmltcG9ydCB7IFlhbWxGaWxlIH0gZnJvbSAnLi4veWFtbCc7XG5pbXBvcnQgeyBHaXRIdWIgfSBmcm9tICcuL2dpdGh1Yic7XG5cbmV4cG9ydCBjbGFzcyBHaXRodWJXb3JrZmxvdyBleHRlbmRzIENvbXBvbmVudCB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICBwcml2YXRlIGV2ZW50czogeyBbZXZlbnQ6IHN0cmluZ106IGFueSB9ID0geyB9O1xuICBwcml2YXRlIGpvYnM6IHsgW2pvYmlkOiBzdHJpbmddOiBhbnkgfSA9IHsgfTtcbiAgcHVibGljIHJlYWRvbmx5IGZpbGU6IFlhbWxGaWxlO1xuXG4gIGNvbnN0cnVjdG9yKGdpdGh1YjogR2l0SHViLCBuYW1lOiBzdHJpbmcpIHtcbiAgICBzdXBlcihnaXRodWIucHJvamVjdCk7XG5cbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuZmlsZSA9IG5ldyBZYW1sRmlsZSh0aGlzLnByb2plY3QsIGAuZ2l0aHViL3dvcmtmbG93cy8ke25hbWUudG9Mb2NhbGVMb3dlckNhc2UoKX0ueW1sYCwge1xuICAgICAgb2JqOiAoKSA9PiB0aGlzLnJlbmRlcldvcmtmbG93KCksXG4gICAgICBtYXJrZXI6IHRydWUsXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgb24oZXZlbnRzOiB7IFtldmVudDogc3RyaW5nXTogYW55IH0pIHtcbiAgICB0aGlzLmV2ZW50cyA9IHtcbiAgICAgIC4uLnRoaXMuZXZlbnRzLFxuICAgICAgLi4uZXZlbnRzLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgYWRkSm9icyhqb2JzOiB7IFtqb2JpZDogc3RyaW5nXTogYW55IH0pIHtcbiAgICB0aGlzLmpvYnMgPSB7XG4gICAgICAuLi50aGlzLmpvYnMsXG4gICAgICAuLi5qb2JzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIHJlbmRlcldvcmtmbG93KCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBvbjogdGhpcy5ldmVudHMsXG4gICAgICBqb2JzOiB0aGlzLmpvYnMsXG4gICAgfTtcbiAgfVxufVxuIl19