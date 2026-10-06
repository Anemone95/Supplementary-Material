"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tasks_1 = require("../../tasks");
const start_app_1 = require("./start-app");
class Command {
    constructor() {
        this.command = 'start';
        this.describe = 'Prints all project commands';
    }
    builder(args) {
        return args.option('interactive', { alias: 'i', desc: 'Interactive menu', default: true });
    }
    async handler(opts) {
        const tasks = new tasks_1.TaskRuntime(process.cwd());
        if (opts.interactive) {
            await start_app_1.showStartMenu(tasks);
        }
        else {
            start_app_1.printStartMenu(tasks);
        }
    }
}
module.exports = new Command();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2xpL2NtZHMvc3RhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1Q0FBMEM7QUFDMUMsMkNBQTREO0FBRTVELE1BQU0sT0FBTztJQUFiO1FBQ0UsWUFBTyxHQUFHLE9BQU8sQ0FBQztRQUNsQixhQUFRLEdBQUcsNkJBQTZCLENBQUM7SUFjM0MsQ0FBQztJQVpRLE9BQU8sQ0FBQyxJQUFnQjtRQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBUztRQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLG1CQUFXLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLE1BQU0seUJBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM1QjthQUFNO1lBQ0wsMEJBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUM7Q0FDRjtBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcbmltcG9ydCB7IFRhc2tSdW50aW1lIH0gZnJvbSAnLi4vLi4vdGFza3MnO1xuaW1wb3J0IHsgcHJpbnRTdGFydE1lbnUsIHNob3dTdGFydE1lbnUgfSBmcm9tICcuL3N0YXJ0LWFwcCc7XG5cbmNsYXNzIENvbW1hbmQgaW1wbGVtZW50cyB5YXJncy5Db21tYW5kTW9kdWxlIHtcbiAgY29tbWFuZCA9ICdzdGFydCc7XG4gIGRlc2NyaWJlID0gJ1ByaW50cyBhbGwgcHJvamVjdCBjb21tYW5kcyc7XG5cbiAgcHVibGljIGJ1aWxkZXIoYXJnczogeWFyZ3MuQXJndikge1xuICAgIHJldHVybiBhcmdzLm9wdGlvbignaW50ZXJhY3RpdmUnLCB7IGFsaWFzOiAnaScsIGRlc2M6ICdJbnRlcmFjdGl2ZSBtZW51JywgZGVmYXVsdDogdHJ1ZSB9KTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZXIob3B0czogYW55KSB7XG4gICAgY29uc3QgdGFza3MgPSBuZXcgVGFza1J1bnRpbWUocHJvY2Vzcy5jd2QoKSk7XG4gICAgaWYgKG9wdHMuaW50ZXJhY3RpdmUpIHtcbiAgICAgIGF3YWl0IHNob3dTdGFydE1lbnUodGFza3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmludFN0YXJ0TWVudSh0YXNrcyk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IENvbW1hbmQoKTsiXX0=