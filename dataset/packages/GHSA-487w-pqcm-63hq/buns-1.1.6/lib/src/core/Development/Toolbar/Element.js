#!namespace Development.Toolbar;
#!use Environment.Tools.Tools;

class Element extends Abstract.Core.AbstractCore {
    onConstruct(/*String*/value, /*Object*/options = {}) {
        this._value = value;

        var defaultOptions = {
            type: 'value',
            content: '',
            group: 'secondary',
            formatter: function(value) {
                return value;
            }
        };

        options = Tools.merge(defaultOptions, options);
        this._type = options.type;
        this._group = options.group;
        this._content = options.content;
        this._formatter = options.formatter;
        this._watch = false;
        this._state = 'valid';
    }

    loopCompare() {
        var state, thus = this;
        ['valid', 'warning', 'error'].some(function(val) {
            if(thus['_' + val](thus._value)) {
                state = val;
                return true;
            }
        });
        this._state = state;
        return this;
    }

    compare(/*Function*/isValid, /*Function*/isWarning, /*Function*/isError) {
        this._watch = true;
        this._valid = isValid;
        this._warning = isWarning;
        this._error = isError;    
        return this.loopCompare();
    }

    update(/*String*/value, /*String*/content) {
        this._value = value;
        if(this._watch) {
            this.loopCompare();
        }

        if(Tools.isSet(content))
            this._content = content;
        return this;
    }
}
