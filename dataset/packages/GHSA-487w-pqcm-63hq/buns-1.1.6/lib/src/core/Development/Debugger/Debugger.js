#!namespace Development.Debugger;
#!use Development.Toolbar.Toolbar, Development.Toolbar.Element;

class Debugger extends Abstract.Core.AbstractCore {
    static init() {
        var thus = this;
        this.type = '';
        this.message = '';
        this.file = '';
        this.funcName = '';
        this.line = 0;
        this.column = 0;

        window.addEventListener('error', function(event) {
            event.preventDefault();
            event.stopPropagation();
            //this.message = event.message;
            //var error = this.errorTemplate;
            console.log(event.error);
            console.log(
                thus.file, thus.funcName, thus.message,
                thus.line, thus.column
            );
        });

        var versionElement = new Element(
            BUNS_VERSION, {
                group: 'main1',
                content: '',//TODO
            }
        );
        versionElement.compare(function(value) {
            return value === BUNS_LATEST_VERSION;
        }, function(value) {
            return value !== BUNS_LATEST_VERSION && value !== BUNS_DEPRECATED_VERSION;
        }, function(value) {
            return value === BUNS_DEPRECATED_VERSION;
        });

        var controllerElement = new Element(
            this.controller + '.' + this.action, {
                group: 'main1'
            }
        );

        var timeElement = new Element(
            this.duration, {
                group: 'main2',
                formatter: function(value) {
                    return value + 'ms';
                }
            }
        );
        timeElement.compare(function(value) {
            return 100 > parseInt(value);
        }, function(value) {
            return 200 > parseInt(value);
        }, function(value) {
            return 200 < parseInt(value);
        });

        var debugElement = new Element(
            '0', {
                group: 'main2',
                content: '',//TODO
                formatter: function(value) {
                    value = parseInt(value);
                    return value + ' error' + (0 === value || 1 === value ? '' : 's');
                }
            }
        );

        Toolbar.add('version', versionElement);
        Toolbar.add('controller', controllerElement);
        Toolbar.add('debug', debugElement);
        Toolbar.add('time', timeElement);
    }

    static get errorTemplate() {
        return
        `
        <div class="buns-error-element-container">
            <span class="buns-error-remover">x</span>
            <h1 id="buns-error-type">` + this.error + ` !</h1>
            <div id="buns-error-message">` + this.message + `</div>
            <div id="buns-error-file">File : ` + this.file + `</div>
            <div id="buns-error-location">Line : ` + this.line + `</div>
        </div>
        `;
    }
}
