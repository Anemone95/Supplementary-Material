#!namespace Structure.Controller;

class ErrorController extends Structure.Controller.AbstractController {
    onConstruct() {
        super.onConstruct();

    }

    notFoundAction(controller, action) {
        console.log(controller + '.' + action + ' was not found.');
    }
}
