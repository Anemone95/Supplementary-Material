#!namespace Structure.Application;

class FastApplication extends Structure.Application.AbstractApplication {
    onConstruct(/*Router*/router) {
        this.router = new router();
    }
}
