"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Component = void 0;
const JSII_RTTI_SYMBOL_1 = Symbol.for("jsii.rtti");
/**
 * (experimental) Represents a project component.
 *
 * @experimental
 */
class Component {
    /**
     * @experimental
     */
    constructor(project) {
        this.project = project;
        project._addComponent(this);
    }
    /**
     * (experimental) Called before synthesis.
     *
     * @experimental
     */
    preSynthesize() { }
    /**
     * (experimental) Synthesizes files to the project output directory.
     *
     * @experimental
     */
    synthesize() { }
    /**
     * (experimental) Called after synthesis.
     *
     * Order is *not* guaranteed.
     *
     * @experimental
     */
    postSynthesize() { }
}
exports.Component = Component;
_a = JSII_RTTI_SYMBOL_1;
Component[_a] = { fqn: "projen.Component", version: "0.16.40" };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBS0EsTUFBYSxTQUFTOzs7O0lBQ3BCLFlBQTRCLE9BQWdCO1FBQWhCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDMUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDOzs7Ozs7SUFLTSxhQUFhLEtBQUssQ0FBQzs7Ozs7O0lBS25CLFVBQVUsS0FBSSxDQUFDOzs7Ozs7OztJQUtmLGNBQWMsS0FBSSxDQUFDOztBQWxCNUIsOEJBbUJDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4vcHJvamVjdCc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBwcm9qZWN0OiBQcm9qZWN0KSB7XG4gICAgcHJvamVjdC5fYWRkQ29tcG9uZW50KHRoaXMpO1xuICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBwcmVTeW50aGVzaXplKCkgeyB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgcHVibGljIHN5bnRoZXNpemUoKSB7fVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gIHB1YmxpYyBwb3N0U3ludGhlc2l6ZSgpIHt9XG59Il19