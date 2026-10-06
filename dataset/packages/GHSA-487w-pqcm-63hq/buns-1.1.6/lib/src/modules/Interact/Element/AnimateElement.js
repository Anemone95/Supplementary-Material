#!namespace Interact.Element;

class AnimateElement extends Interact.Element.AbstractElement {
    onConstruct(/*String*/selector) {
        super.onConstruct(selector);
        var _ = {activeAnimations: []};

        this.getActiveAnimations = function() {
            return _.activeAnimations;
        };
    }

    static get ANIMATE_EFFECTS() {
        return [
            'bounce', 'flash', 'pulse', 'rubberBand', 'shake',
            'swing', 'tada', 'wobble', 'jello',
            'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight',
            'bounceInUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft',
            'bounceOutRight', 'bounceOutUp', 'fadeIn', 'fadeInDown',
            'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight',
            'fadeInRightBig', 'fadeInUp', 'fadeInUpBig', 'fadeOut',
            'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig',
            'fadeOutRight', 'fadeOutRightBig', 'fadeOutUp', 'fadeOutUpBig',
            'flipInX', 'flipInY', 'flipOutX', 'flipOutY', 'lightSpeedIn',
            'lightSpeedOut', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight',
            'rotateInUpLeft', 'rotateInUpRight', 'rotateOut', 'rotateOutDownLeft',
            'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'hinge',
            'rollIn', 'rollOut', 'zoomIn', 'zoomInDown',
            'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOut',
            'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp',
            'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp',
            'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp'
        ];
    }

    animate(/*String*/effect, /*[Object]*/settings) {
        var duration = 1, loop = 1, delay = 0, callback, index = this.getPointer(), tag = this.getTag(),
            vendors = ['', '-webkit-', '-moz-', '-ms-', '-o-'], thus = this;

        //thus.removeClass('animated');
        if(!isSet(this.activeAnimation))
            this.activeAnimation = [];
        if(!isSet(this.activeAnimation[index]))
            this.activeAnimation[index] = [];

        if(settings) {
            if(isSet(settings.delay))
                delay = settings.delay;
            if(isSet(settings.duration))
                duration = settings.duration;
            if(isSet(settings.loop)) {
                if(-1 === settings.loop)
                    settings.loop = 'infinite';
                loop = settings.loop;
            }

            if(isSet(settings.callback))
                callback = settings.callback;
        }
        this.activeAnimation[index].push({
            effect: effect, duration: duration, loop: loop,
            delay: delay, callback: callback
        });

        if(1 === this.activeAnimation[index].length) {
            thus.addClass('animated');
            function recursEffect(current) {
                this.ANIMATE_EFFECTS.forEach(function(item) {
                    if(thus.hasClass(item))
                        thus.removeClass(item);
                });
                vendors.forEach(function(prefix) {
                    thus.setStyle(prefix + 'animation-iteration-count', current.loop);
                    thus.setStyle(prefix + 'animation-delay', current.delay + 's');
                    thus.setStyle(prefix + 'animation-duration', current.duration + 's');
                });
                thus.addClass(current.effect);
                thus.animationTimeout = setTimeout(function(current) {
                    var next = isSet(thus.activeAnimation) ? thus.activeAnimation[index][1] : null;
                    if(!isSet(next))
                        thus.removeClass(current.effect);
                    /*
                    if(isSet(next))
                        recursEffect(next);
                    else if(!isSet(next))
                        thus.removeClass('animated');*/

                    thus.activeAnimation[index].shift();
                    if(isFunction(current.callback))
                        current.callback();
                },
                current.duration * 1000,
                current);
            }

            recursEffect(this.activeAnimation[index][0]);

            // if(isEmpty(this.activeAnimation[index]))
            //     delete this.activeAnimation[index];
        }
        return this;
    }

    stop(/*[Integer]*/toStop) {
        if(!this.activeAnimation)
            return this;
        clearTimeout(this.animationTimeout);
        var thus = this, index = this.getPointer(), i = 0, removed;
        if(!isSet(toStop)) {
            //delete this.activeAnimation[index];
            Effects.forEach(function(effect) {
                if(thus.hasClass(effect))
                    thus.removeClass(effect);
            });
        } else {
            while(i < toStop) {
                removed = this.activeAnimation[index].shift();
                this.ANIMATE_EFFECTS.forEach(function(effect) {
                    if(thus.hasClass(removed.effect))
                        thus.removeClass(effect);
                });
                ++i;
            }
            // if(isEmpty(this.activeAnimation[index]))
            //     delete this.activeAnimation[index];
        }

        // if(1 === this.activeAnimation.length && isSet(this.activeAnimation[0]))
        //     delete this.activeAnimation;
        return this;
    }

    setStyle(/*Object*/rules, /*[Integer]*/duration) {
        var tag = this.getTag(), backTransition = tag.style.transition, property,
            transitionDuration = (!isSet(duration) ? 0 : duration / 1000) + 's';
        tag.style.transition = transitionDuration;
        property = rule.toCamelcase();
        tag.style[property] = value;
        setTimeout(function() {

            tag.style.transition = !isEmpty(backTransition) ? backTransition : '';
        }, duration);
        return this;
    }

    setStyles(/*String*/rule, /*mixed*/value, /*[Integer]*/duration) {
        var tag = this.getTag(), backTransition = tag.style.transition, rule, property, savedTag = this.getSavedTag(),
            transitionDuration = (!isSet(duration) ? 0 : duration / 1000) + 's';

        if(!isSet(savedTag)) {
            this.saveTag();
            savedTag = this.getSavedTag();
        }

        backTransition = savedTag.style.transition;
        tag.style.transition = transitionDuration;
        for(rule in rules) {
            property = rule.toCamelcase();
            tag.style[property] = rules[rule];
        }
        setTimeout(function() {
            tag.style.transition = !isEmpty(backTransition) ? backTransition : '';
        }, duration);
        return this;
    }
}
