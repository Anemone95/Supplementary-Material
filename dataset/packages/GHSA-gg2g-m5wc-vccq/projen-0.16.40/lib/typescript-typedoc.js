"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypedocDocgen = void 0;
const tasks_1 = require("./tasks");
/**
  Adds a simple Typescript documentation generator
 */
class TypedocDocgen {
    constructor(project) {
        project.addDevDeps('typedoc');
        const docgen = project.addTask('docgen', {
            description: `Generate TypeScript API reference ${project.docsDirectory}`,
            category: tasks_1.TaskCategory.RELEASE,
            exec: 'typedoc --out ' + project.docsDirectory,
        });
        project.buildTask.spawn(docgen);
    }
}
exports.TypedocDocgen = TypedocDocgen;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC10eXBlZG9jLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3R5cGVzY3JpcHQtdHlwZWRvYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBdUM7QUFHdkM7O0dBRUc7QUFDSCxNQUFhLGFBQWE7SUFDeEIsWUFBWSxPQUEwQjtRQUNwQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTlCLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLFdBQVcsRUFBRSxxQ0FBcUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtZQUN6RSxRQUFRLEVBQUUsb0JBQVksQ0FBQyxPQUFPO1lBQzlCLElBQUksRUFBRSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsYUFBYTtTQUMvQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0Y7QUFaRCxzQ0FZQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFRhc2tDYXRlZ29yeSB9IGZyb20gJy4vdGFza3MnO1xuaW1wb3J0IHsgVHlwZVNjcmlwdFByb2plY3QgfSBmcm9tICcuL3R5cGVzY3JpcHQnO1xuXG4vKipcbiAgQWRkcyBhIHNpbXBsZSBUeXBlc2NyaXB0IGRvY3VtZW50YXRpb24gZ2VuZXJhdG9yXG4gKi9cbmV4cG9ydCBjbGFzcyBUeXBlZG9jRG9jZ2VuIHtcbiAgY29uc3RydWN0b3IocHJvamVjdDogVHlwZVNjcmlwdFByb2plY3QpIHtcbiAgICBwcm9qZWN0LmFkZERldkRlcHMoJ3R5cGVkb2MnKTtcblxuICAgIGNvbnN0IGRvY2dlbiA9IHByb2plY3QuYWRkVGFzaygnZG9jZ2VuJywge1xuICAgICAgZGVzY3JpcHRpb246IGBHZW5lcmF0ZSBUeXBlU2NyaXB0IEFQSSByZWZlcmVuY2UgJHtwcm9qZWN0LmRvY3NEaXJlY3Rvcnl9YCxcbiAgICAgIGNhdGVnb3J5OiBUYXNrQ2F0ZWdvcnkuUkVMRUFTRSxcbiAgICAgIGV4ZWM6ICd0eXBlZG9jIC0tb3V0ICcgKyBwcm9qZWN0LmRvY3NEaXJlY3RvcnksXG4gICAgfSk7XG5cbiAgICBwcm9qZWN0LmJ1aWxkVGFzay5zcGF3bihkb2NnZW4pO1xuICB9XG59XG4iXX0=