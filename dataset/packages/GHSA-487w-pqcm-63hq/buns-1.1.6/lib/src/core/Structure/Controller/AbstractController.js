#!namespace Structure.Controller;

class AbstractController extends Abstract.Core.AbstractCore {
    onConstruct() {}

    onInitialize() {}

    /**
     * Used each time an action is about to be performed.
     * If it returns false, the action won't be triggered.
     */
    onCall() {
        return true;
    }

    onFinish() {}

    /**
     * Called before the action is triggered.
     */
    beforeDispatch() {}

    /**
     * Called after the action is triggered.
     */
    afterDispatch() {}

    /**
     * Default action
     */
    mainAction() {}
}
