"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverTaskCommands = void 0;
const logging = require("../logging");
/**
 * Reads .projen/tasks.json and adds CLI commands for all tasks.
 * @param ya yargs
 */
function discoverTaskCommands(runtime, ya) {
    var _a, _b;
    const tasks = (_a = runtime.manifest.tasks) !== null && _a !== void 0 ? _a : {};
    for (const task of Object.values(tasks)) {
        ya.command(task.name, (_b = task.description) !== null && _b !== void 0 ? _b : '', taskCommandHandler(task.name));
    }
    function taskCommandHandler(taskName) {
        return (args) => {
            args.option('inspect', { alias: 'i', desc: 'show all steps in this task' });
            const argv = args.argv;
            if (argv.inspect) {
                return inspectTask(taskName);
            }
            else {
                try {
                    runtime.runTask(taskName);
                }
                catch (e) {
                    logging.error(e.message);
                    process.exit(1);
                }
            }
        };
    }
    function inspectTask(name, indent = 0) {
        var _a;
        const writeln = (s) => console.log(' '.repeat(indent) + s);
        const task = runtime.tryFindTask(name);
        if (!task) {
            throw new Error(`${name}: unable to resolve subtask with name "${name}"`);
        }
        for (const step of (_a = task.steps) !== null && _a !== void 0 ? _a : []) {
            if (step.spawn) {
                writeln(`${step.spawn}:`);
                inspectTask(step.spawn, indent + 3);
            }
            else if (step.exec) {
                writeln(step.exec);
            }
        }
    }
    ;
}
exports.discoverTaskCommands = discoverTaskCommands;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFza3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpL3Rhc2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHNDQUFzQztBQUd0Qzs7O0dBR0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxPQUFvQixFQUFFLEVBQWM7O0lBQ3ZFLE1BQU0sS0FBSyxTQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxtQ0FBSSxFQUFFLENBQUM7SUFDM0MsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3ZDLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksUUFBRSxJQUFJLENBQUMsV0FBVyxtQ0FBSSxFQUFFLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDOUU7SUFFRCxTQUFTLGtCQUFrQixDQUFDLFFBQWdCO1FBQzFDLE9BQU8sQ0FBQyxJQUFnQixFQUFFLEVBQUU7WUFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSw2QkFBNkIsRUFBRSxDQUFDLENBQUM7WUFFNUUsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztZQUV2QixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7Z0JBQ2hCLE9BQU8sV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNMLElBQUk7b0JBQ0YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDM0I7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ3pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO2FBQ0Y7UUFDSCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBUyxXQUFXLENBQUMsSUFBWSxFQUFFLE1BQU0sR0FBRyxDQUFDOztRQUMzQyxNQUFNLE9BQU8sR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRW5FLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxJQUFJLDBDQUEwQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBQzNFO1FBRUQsS0FBSyxNQUFNLElBQUksVUFBSSxJQUFJLENBQUMsS0FBSyxtQ0FBSSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQixXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7YUFDckM7aUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3BCO1NBQ0Y7SUFDSCxDQUFDO0lBQUEsQ0FBQztBQUNKLENBQUM7QUExQ0Qsb0RBMENDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0ICogYXMgbG9nZ2luZyBmcm9tICcuLi9sb2dnaW5nJztcbmltcG9ydCB7IFRhc2tSdW50aW1lIH0gZnJvbSAnLi4vdGFza3MnO1xuXG4vKipcbiAqIFJlYWRzIC5wcm9qZW4vdGFza3MuanNvbiBhbmQgYWRkcyBDTEkgY29tbWFuZHMgZm9yIGFsbCB0YXNrcy5cbiAqIEBwYXJhbSB5YSB5YXJnc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzY292ZXJUYXNrQ29tbWFuZHMocnVudGltZTogVGFza1J1bnRpbWUsIHlhOiB5YXJncy5Bcmd2KSB7XG4gIGNvbnN0IHRhc2tzID0gcnVudGltZS5tYW5pZmVzdC50YXNrcyA/PyB7fTtcbiAgZm9yIChjb25zdCB0YXNrIG9mIE9iamVjdC52YWx1ZXModGFza3MpKSB7XG4gICAgeWEuY29tbWFuZCh0YXNrLm5hbWUsIHRhc2suZGVzY3JpcHRpb24gPz8gJycsIHRhc2tDb21tYW5kSGFuZGxlcih0YXNrLm5hbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRhc2tDb21tYW5kSGFuZGxlcih0YXNrTmFtZTogc3RyaW5nKSB7XG4gICAgcmV0dXJuIChhcmdzOiB5YXJncy5Bcmd2KSA9PiB7XG4gICAgICBhcmdzLm9wdGlvbignaW5zcGVjdCcsIHsgYWxpYXM6ICdpJywgZGVzYzogJ3Nob3cgYWxsIHN0ZXBzIGluIHRoaXMgdGFzaycgfSk7XG5cbiAgICAgIGNvbnN0IGFyZ3YgPSBhcmdzLmFyZ3Y7XG5cbiAgICAgIGlmIChhcmd2Lmluc3BlY3QpIHtcbiAgICAgICAgcmV0dXJuIGluc3BlY3RUYXNrKHRhc2tOYW1lKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcnVudGltZS5ydW5UYXNrKHRhc2tOYW1lKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGxvZ2dpbmcuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5zcGVjdFRhc2sobmFtZTogc3RyaW5nLCBpbmRlbnQgPSAwKSB7XG4gICAgY29uc3Qgd3JpdGVsbiA9IChzOiBzdHJpbmcpID0+IGNvbnNvbGUubG9nKCcgJy5yZXBlYXQoaW5kZW50KSArIHMpO1xuXG4gICAgY29uc3QgdGFzayA9IHJ1bnRpbWUudHJ5RmluZFRhc2sobmFtZSk7XG4gICAgaWYgKCF0YXNrKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bmFtZX06IHVuYWJsZSB0byByZXNvbHZlIHN1YnRhc2sgd2l0aCBuYW1lIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzdGVwIG9mIHRhc2suc3RlcHMgPz8gW10pIHtcbiAgICAgIGlmIChzdGVwLnNwYXduKSB7XG4gICAgICAgIHdyaXRlbG4oYCR7c3RlcC5zcGF3bn06YCk7XG4gICAgICAgIGluc3BlY3RUYXNrKHN0ZXAuc3Bhd24sIGluZGVudCArIDMpO1xuICAgICAgfSBlbHNlIGlmIChzdGVwLmV4ZWMpIHtcbiAgICAgICAgd3JpdGVsbihzdGVwLmV4ZWMpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbn0iXX0=