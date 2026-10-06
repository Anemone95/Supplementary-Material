#!namespace Structure.View;

class AbstractViewEngine extends Abstract.Core.AbstractCore {
    onConstruct(data, code) {
        this.data = data;
        this.code = code;
    }

    render() {}
}
