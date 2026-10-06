"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clobber = void 0;
const component_1 = require("./component");
const tasks_1 = require("./tasks");
class Clobber extends component_1.Component {
    constructor(project) {
        super(project);
        const task = this.project.addTask('clobber', {
            description: 'hard resets to HEAD of origin and cleans the local repo',
            category: tasks_1.TaskCategory.MAINTAIN,
            condition: 'git diff --exit-code > /dev/null',
            env: {
                BRANCH: '$(git branch --show-current)',
            },
        });
        task.exec('git checkout -b scratch', { name: 'save current HEAD in "scratch" branch' });
        task.exec('git checkout $BRANCH');
        task.exec('git fetch origin', { name: 'fetch latest changes from origin' });
        task.exec('git reset --hard origin/$BRANCH', { name: 'hard reset to origin commit' });
        task.exec('git clean -fdx', { name: 'clean all untracked files' });
        task.say('ready to rock! (unpushed commits are under the "scratch" branch)');
    }
}
exports.Clobber = Clobber;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvYmJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jbG9iYmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUF3QztBQUV4QyxtQ0FBdUM7QUFFdkMsTUFBYSxPQUFRLFNBQVEscUJBQVM7SUFDcEMsWUFBWSxPQUFnQjtRQUMxQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFZixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUU7WUFDM0MsV0FBVyxFQUFFLHlEQUF5RDtZQUN0RSxRQUFRLEVBQUUsb0JBQVksQ0FBQyxRQUFRO1lBQy9CLFNBQVMsRUFBRSxrQ0FBa0M7WUFDN0MsR0FBRyxFQUFFO2dCQUNILE1BQU0sRUFBRSw4QkFBOEI7YUFDdkM7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLEVBQUUsSUFBSSxFQUFFLHVDQUF1QyxFQUFFLENBQUMsQ0FBQztRQUN4RixJQUFJLENBQUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLElBQUksRUFBRSxrQ0FBa0MsRUFBRSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLElBQUksQ0FBQyxpQ0FBaUMsRUFBRSxFQUFFLElBQUksRUFBRSw2QkFBNkIsRUFBRSxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSwyQkFBMkIsRUFBRSxDQUFDLENBQUM7UUFDbkUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO0lBQy9FLENBQUM7Q0FDRjtBQXBCRCwwQkFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICcuL2NvbXBvbmVudCc7XG5pbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0JztcbmltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuXG5leHBvcnQgY2xhc3MgQ2xvYmJlciBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb2plY3Q6IFByb2plY3QpIHtcbiAgICBzdXBlcihwcm9qZWN0KTtcblxuICAgIGNvbnN0IHRhc2sgPSB0aGlzLnByb2plY3QuYWRkVGFzaygnY2xvYmJlcicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnaGFyZCByZXNldHMgdG8gSEVBRCBvZiBvcmlnaW4gYW5kIGNsZWFucyB0aGUgbG9jYWwgcmVwbycsXG4gICAgICBjYXRlZ29yeTogVGFza0NhdGVnb3J5Lk1BSU5UQUlOLFxuICAgICAgY29uZGl0aW9uOiAnZ2l0IGRpZmYgLS1leGl0LWNvZGUgPiAvZGV2L251bGwnLFxuICAgICAgZW52OiB7XG4gICAgICAgIEJSQU5DSDogJyQoZ2l0IGJyYW5jaCAtLXNob3ctY3VycmVudCknLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRhc2suZXhlYygnZ2l0IGNoZWNrb3V0IC1iIHNjcmF0Y2gnLCB7IG5hbWU6ICdzYXZlIGN1cnJlbnQgSEVBRCBpbiBcInNjcmF0Y2hcIiBicmFuY2gnIH0pO1xuICAgIHRhc2suZXhlYygnZ2l0IGNoZWNrb3V0ICRCUkFOQ0gnKTtcbiAgICB0YXNrLmV4ZWMoJ2dpdCBmZXRjaCBvcmlnaW4nLCB7IG5hbWU6ICdmZXRjaCBsYXRlc3QgY2hhbmdlcyBmcm9tIG9yaWdpbicgfSk7XG4gICAgdGFzay5leGVjKCdnaXQgcmVzZXQgLS1oYXJkIG9yaWdpbi8kQlJBTkNIJywgeyBuYW1lOiAnaGFyZCByZXNldCB0byBvcmlnaW4gY29tbWl0JyB9KTtcbiAgICB0YXNrLmV4ZWMoJ2dpdCBjbGVhbiAtZmR4JywgeyBuYW1lOiAnY2xlYW4gYWxsIHVudHJhY2tlZCBmaWxlcycgfSk7XG4gICAgdGFzay5zYXkoJ3JlYWR5IHRvIHJvY2shICh1bnB1c2hlZCBjb21taXRzIGFyZSB1bmRlciB0aGUgXCJzY3JhdGNoXCIgYnJhbmNoKScpO1xuICB9XG59Il19