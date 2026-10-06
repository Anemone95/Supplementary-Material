#!namespace Interact.Element;
#!use Environment.Tools.Tools;

class AbstractElement extends Abstract.Core.AbstractCore {
    onConstruct(/*String*/selector) {
        var _ = {//Protected
            pointer: 0,
            selector: selector,
            tags: this.constructor.fetch(selector),
            cache: []
        };

        this._isForeach = false;
        this._isCreated = false;

        this.setPointer = function(/*Integer*/index) {
            if(-1 === index) {
                index = _.tags.length - 1;
            }
            _.pointer = index;

            return this;
        };

        this.saveTag = function() {
            _.cache[_.pointer] = this.clone();
        };

        this.getTags = function() {
            if(Tools.isEmpty(_.tags))
                throw new Error('No matching tags with "' + _.selector + '".');
            return _.tags;
        };

        this.getPointer = function() {
            return _.pointer;
        };

        this.getSelector = function() {
            return _.selector;
        };

        this.getSavedTag = function() {
            return Buns.isSet(_.cache[_.pointer]) ? _.cache[_.pointer] : null;
        };
        this.length = _.tags.length;
    }

    /*Getters*/
    get html() {
        return this.getTag().innerHTML;
    }

    get outerHtml() {
        var tag = this.getTag();
        return tag.outerHTML || (
            function(element) {
                var div = document.createElement('div');
                div.appendChild(element.cloneNode(true));
                var contents = div.innerHTML;
                div = null;
                return contents;
            })(tag);
    }

    get text() {
        return this.getTag().textContent;
    }

    get value() {
        return this.getTag().value;
    }

    /*Setters*/
    set html(/*mixed*/value) {
        this.getTag().innerHTML = value || '';
        return this;
    }

    set text(/*mixed*/value) {
        this.getTag().textContent = value || '';
        return this;
    }

    set value(/*mixed*/value) {
        this.getTag().value = value || '';
        return this;
    }

    /*Other methods*/
    addClass(/*String*/className) {
        this.getTag().classList.add(className);
        return this;
    }

    append(/*Element*/element) {
        this.getTag().innerHTML += element.getOuterHtml();
        element.refresh();
        return this;
    }

    children(/*String*/selector = '') {
        if(Tools.isEmpty(selector))
            selector = '*';
        return new this.constructor(this.getTag().rootPath() + ' > ' + selector);
    }

    clone() {
        return this.getTag().cloneNode(true);
    }

    contains(/*Element*/element) {
        //Buns.checkArguments(arguments, [{type: 'Element'}], 'contains');
        return this.getTag() !== element.tags[element.pointer] && this.getTag().contains(element.tags[element.pointer]);
    }

    forEach(/*Function*/callback) {
        var thus = this, pointer = this.getPointer();
        this._isForeach = true;
        this.getTags().forEach(function(tag, key, value) {
            thus.setPointer(key);
            callback.apply(thus);
        });
        this._isForeach = false;
        return this.setPointer(pointer);
    }

    getAttributes(/*[String|Array]*/conditionName, /*[String|Array]*/conditionValue, /*[Boolean]*/exclude) {
        var attributes = {}, i, tag = this.getTag();
        if(!exclude) {//Get only matching attributes
            for(i = 0; i < tag.attributes.length; ++i) {
                if(tag.attributes[i].specified) {
                    if(!conditionName && !conditionValue) {//Without condition, any attribute is returned
                        attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(conditionName && !conditionValue) {//Only name matches
                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1)//If is object and in object
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(tag.attributes[i].name === conditionName)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(!conditionName && conditionValue) {//Only value matches
                        if(typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].name) > -1)//If is object and in object
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(tag.attributes[i].value === conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(conditionName && conditionValue) {//Both matches
                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1 || typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) > -1)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) > -1 || tag.attributes[i].value === conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(tag.attributes[i].name === conditionName || typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) > -1)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(tag.attributes[i].name === conditionName || tag.attributes[i].value === conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    }
                }
            }
        } else {//Get all attributes but those matching with lists
            for(i = 0; i < tag.attributes.length; ++i) {
                if(tag.attributes[i].specified) {
                    if(!conditionName && !conditionValue) {//Without condition, any attribute is returned
                        attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(conditionName && !conditionValue) {//Only name matches
                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1)//If is object and in object
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(!conditionName && conditionValue) {//Only value matches
                        if(typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)//If is object and in object
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    } else if(conditionName && conditionValue) {//Both matches
                        if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1 && typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionName) === 'object' && conditionName.indexOf(tag.attributes[i].name) === -1 && typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName && typeof (conditionValue) === 'object' && conditionValue.indexOf(tag.attributes[i].value) === -1)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                        else if(typeof (conditionName) === 'string' && tag.attributes[i].name !== conditionName && typeof (conditionValue) === 'string' && tag.attributes[i].value !== conditionValue)
                            attributes[tag.attributes[i].name] = tag.attributes[i].value;
                    }
                }
            }
        }
        return attributes;
    }

    getStyle(/*String*/ruleName) {
        return getComputedStyle(this.getTag())[ruleName];
    }

    getTag(/*Integer*/index = -1) {
        var tags = this.getTags();
        return tags[(-1 !== index ? index : this.getPointer())];
    }

    hasAttribute(/*String*/name) {
        var attribute = this.getTag().getAttribute(name);
        return Tools.isSet(attribute) && attribute !== false;
    }

    hasClass(/*String*/name) {
        return (' ' + this.getTag().className + ' ').indexOf(' ' + name + ' ') > -1;
    }

    indexOf(/*Element*/element) {
        var i, currentTag = this.getTag();
        for(i = 0; i < this.length; ++i) {
            if(currentTag === element.tags[i])
                return i;
        }
        return -1;
    }

    next() {
        this.pointer = this.pointer + 1 >= this.length ? 0 : this.pointer + 1;
        return this;
    }

    offset() {//
        var element = this.getTag();
        return {
            top: element.offsetTop,
            left: element.offsetLeft
        };
    }

    outerHeight(/*Boolean*/margin = false) {//TODO add margin, padding & borders if element depending on box-sizing
        var height, tag = this.getTag();
        if(margin) {
            height = tag.offsetHeight, style = getComputedStyle(tag);
            height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        } else
            height = tag.offsetHeight;
        return height;
    }

    outerWidth(/*Boolean*/margin = false) {
        var width, tag = this.getTag();
        if(margin) {
            width = tag.offsetWidth, style = getComputedStyle(tag);
            width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        } else
            width = tag.offsetWidth;
        return width;
    }

    parent() {
        return new this.constructor(this.getTag().parentNode.rootPath());
    }

    position() {
        var tag = this.getTag();
        return {
            top: tag.offsetTop,
            left: tag.offsetLeft
        };
    }

    prepend(/*Element*/element) {
        var tag = this.getTag();
        tag.innerHTML = element.getOuterHtml() + tag.innerHTML;
        element.refresh();
        return this;
    }

    previous() {
        var pointer = this.getPointer();
        this.setPointer(pointer - 1 < 0 ? this.length - 1 : pointer - 1);
        return this;
    }

    refresh() {
        this.constructor.call(this, this.getSelector());
        return this;
    }

    remove() {
        var tag = this.getTag();
        tag.parentNode.removeChild(tag);
        this.refresh();
    }

    removeAttr(/*String*/attributeName) {
        var tag = this.getTag();
        tag.removeAttribute(attributeName);
        return this;
    }

    removeClass(/*String*/className) {
        this.getTag().classList.remove(className);
        return this;
    }

    attr(/*String*/name, /*String*/value) {
        this.getTag().setAttribute(name, value);
        return this;
    }

    style(/*String*/rule, /*String*/value) {
        var property = rule.toCamel();
        this.getTag().style[property] = value;
        return this;
    }

    styles(/*Object*/rules) {
        var rule, property, tag = this.getTag();
        for(rule in rules) {
            property = rule.toCamel();
            tag.style[property] = rules[rule];
        }
        return this;
    }

    siblings() {
        var element = this.getTag();
        return Array.prototype.filter.call(element.parentNode.children, function(child) {
            return child !== element;
        });
    }

    to(/*Integer*/index) {//setPointer alias
        this.setPointer(index);
        return this;
    }

    toggleClass(/*String*/className) {
        this.getTag().classList.toggle(className);
        return this;
    }

    static fetch(selector) {
        if('window' === selector || 'document' === selector) {
            return [window[selector]];
        }
        function getById(selector) {
            var element = document.getElementById(selector.replace('#', ''));
            return Tools.isSet(element) ? [element] : null;
        }

        function getByClass(selector) {
            var element = document.getElementsByClassName(selector.replace('.', ''));
            return !Tools.isEmpty(element) ? Array.prototype.slice.call(element) : null;
        }

        function getByTag(selector) {
            var element = document.getElementsByTagName(selector);
            return !Tools.isEmpty(element) ? Array.prototype.slice.call(element) : null;
        }

        function getOther(selector) {
            return Array.prototype.slice.call(document.querySelectorAll(selector));
        }
        return getByClass(selector) || getById(selector) || getByTag(selector) || getOther(selector);
    }
}
