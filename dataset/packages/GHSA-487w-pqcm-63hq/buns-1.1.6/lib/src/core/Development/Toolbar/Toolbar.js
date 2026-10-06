#!namespace Development.Toolbar;
#!use Environment.Tools.Tools;

class Toolbar extends Abstract.Core.AbstractCore {
    static init() {
        if(!Tools.isSet(this._initialised)) {
            this._initialised = true;
            var body = document.getElementsByTagName('body')[0];

            body.innerHTML +=
                '<div class="buns-toolbar">\
                    <div class="buns-group buns-group-main1"><div class="buns-panel"></div></div>\
                    <div class="buns-group buns-group-secondary"><div class="buns-arrow buns-arrow-left"></div><div class="buns-slider-container"></div><div class="buns-arrow buns-arrow-right"></div><div class="buns-panel"></div></div>\
                    <div class="buns-group buns-group-main2"><div class="buns-panel"></div></div>\
                    <div class="buns-toolbar-toggle toggle-off"></div>\
                </div>';

            var toggle = document.getElementsByClassName('buns-toolbar-toggle')[0],
                panels = Array.prototype.splice(document.getElementsByClassName('buns-panel'));

            this._toolbar = document.getElementsByClassName('buns-toolbar')[0];

            this._elements = {};
            var thus = this;
            toggle.addEventListener('click', function() {
                if(this.classList.contains('toggle-off')) {
                    thus._toolbar.style.bottom = '-81px';
                } else {
                    thus._toolbar.style.bottom = '';
                }
                this.classList.toggle('toggle-off');
                this.classList.toggle('toggle-on');
            });

            this._groups = {
                main1: {
                    max: 3,
                    count: 0
                },
                main2: {
                    max: 3,
                    count: 0
                },
                secondary: {
                    max: 20,
                    count: 0
                }
            }

            thus._toolbar.addEventListener('click', function(e) {
                var element = e.target, exit = false, panel,
                    i, bunsElement;

                do {
                    if(element.className.contains('buns-element')) {
                        bunsElement = element;
                    }
                    element = element.parentNode;
                    if(!element) {
                        exit = true;
                    }
                } while (!exit && element.className && !element.className.contains('buns-group'));

                if(bunsElement) {
                    for(i = 0; i < element.childNodes.length; ++i) {
                        if('buns-panel' === element.childNodes[i].className) {
                            panel = element.childNodes[i];
                            if('block' === panel.style.display) {
                                panel.style.display = 'none';
                                panel.innerHTML = '';
                            } else {
                                panel.style.display = 'block';
                                panel.innerHTML = bunsElement.querySelector('.buns-element-content').innerHTML;
                            }
                        }
                    }
                }
            }, true);
        }
    }

    static add(/*String*/id, /*Element*/element) {
        this.init();
        if(this._groups[element._group].count + 1 > this._groups[element._group].max) {
            throw new Error('Could not add element to group "' + element._group + '" as maximum number (' + this._groups[element._group].max + ') is reached.');
        } else {
            var domId = 'buns-' + id.slugify(),
                group = document.getElementsByClassName('buns-group-' + element._group)[0],
                value = element._formatter(element._value),
                content =
                '<div id="' + domId + '" class="buns-element state-' + element._state + '" title="' + value + '">\
                    <span class="buns-element-icon"></span>\
                    <span class="buns-element-value">' + value + '</span>\
                    <span class="buns-element-content">' + element._content + '</span>\
                </div>';

            if('secondary' === element._group) {
                group.querySelector('.buns-slider-container').innerHTML += content;
            } else {
                group.innerHTML += content;
            }

            ++this._groups[element._group].count;

            this._elements[id] = {
                element: element,
                dom: document.getElementById(domId)
            };
        }
    }

    //TODO
    static remove(/*String*/id) {
        // var domId = 'buns-' + id.slugify();
        // this._toolbar.removeChild(document.getElementById(id));
    }

    static refresh(/*String*/id, /*String*/value, /*String*/content) {
        var domId = 'buns-' + id.slugify(), value = this._elements[id].element._formatter(value), i;
        this._elements[id].dom = document.getElementById(domId);
        this._elements[id].element.update(value, content);

        for(i = 0; i < this._elements[id].dom.childNodes.length; ++i) {
            if('buns-element-value' === this._elements[id].dom.childNodes[i].className) {
                this._elements[id].dom.childNodes[i].innerHTML = value;
            }
            if('buns-element-content' === this._elements[id].dom.childNodes[i].className) {
                this._elements[id].dom.childNodes[i].innerHTML = this._elements[id].element._content;
            }
        }
        this._elements[id].dom.title = value;
        var state = this._elements[id].dom.className.match(new RegExp(/state-(\w+)/));
        this._elements[id].dom.className = this._elements[id].dom.className.replace(state[1], this._elements[id].element._state);
    }
}
