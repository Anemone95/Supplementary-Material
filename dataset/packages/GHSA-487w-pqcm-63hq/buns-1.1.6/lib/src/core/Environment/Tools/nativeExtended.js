Array.prototype.contains = function(value) {
	return -1 < this.indexOf(value);
};

HTMLElement.prototype.rootPath = function() {
    var sameTag = Array.prototype.slice.call(document.getElementsByTagName(this.tagName)), i, match, siblingsSameTag = [];
        for(i = 0; i < sameTag.length; ++i) {
        if(sameTag[i].parentNode === this.parentNode)
            siblingsSameTag.push(sameTag[i]);
    }
    for(i = 0; i < sameTag.length; ++i) {
        if(siblingsSameTag[i] === this) {
            match = i + 1;
            break;
        }
    }
    var targetString = this.tagName !== 'HTML' && this.tagName !== 'BODY' ? ':nth-of-type(' + match + ')' : targetString = '';
    return this.parentNode.tagName !== undefined ? this.parentNode.rootPath() + ' > ' + this.tagName.toLowerCase() + targetString : this.tagName.toLowerCase() + targetString;
};

String.prototype.addSlashes = function(string) {
    return (string + '')
            .replace(/[\\"']/g, '\\jnt&')
            .replace(/\u0000/g, '\\0');
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.matchIn = function(regexes) {
    var thus = this;
    return regexes.some(function(val) {
        return thus.match(new RegExp(val));
    });
};

String.prototype.matchAtLeast = function(number, regexes) {
    var thus = this, matches = 0;
    return regexes.some(function(val) {
        if(thus.match(new RegExp(val)))
            ++matches;
        if(matches === number)
            return true;
    });
};

String.prototype.matchAtMost = function(number, regexes) {
    var thus = this, flag = true, matches = 0;
    regexes.forEach(function(val) {
        if(thus.match(new RegExp(val)))
            ++matches;
        if(matches > number)
            flag = false;
    });
    return flag;
};

String.prototype.matchAll = function(regexp) {
	var reg = new RegExp(regexp);
	var text = this;
	var result;
	var matches = [];
	while ((result = reg.exec(text)) !== null) {
		matches.push([result[0], result[1]]);
	    var LinkText = result[1];
	    var Match = result[0];
	    text = text.replace(Match, '');
	}
	return matches;
};

String.prototype.htmlentities = function() {
    return String(this).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match;
    });
};

String.prototype.stripAccents = function(toReplace) {
    var stripAccents = (function() {
        var in_chrs = 'àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
                out_chrs = 'aaaaaceeeeiiiinooooouuuuyyAAAAACEEEEIIIINOOOOOUUUUY',
                chars_rgx = new RegExp('[' + in_chrs + ']', 'g'),
                transl = {}, i,
                lookup = function(m) {
                    return transl[m] || m;
                };
        for(i = 0; i < in_chrs.length; i++)
            transl[ in_chrs[i] ] = out_chrs[i];

        return function(s) {
            return s.replace(chars_rgx, lookup);
        };
    })();
    return stripAccents(toReplace);
};


// Truncate a string to a given length
String.prototype.truncate = function(length) {
    var output;
    if (this.length > length)
        output = this.substring(0, length);
    return output;
};

String.prototype.onlyLetters = function() {
    return this.toLowerCase().replace(/[^a-z]/g, '');
};

String.prototype.onlyAlphanum = function() {
    return this.toLowerCase().replace(/[^a-z,0-9,-]/g, '');
};

String.prototype.toCamel = function(upperFirst = false){
    var tmp = this.replace(/(\-[a-z])/g, function($1){return $1.toUpperCase().replace('-','');});
	return upperFirst ? tmp.capitalize() : tmp;
};

String.prototype.toDash = function(){
    return this.replace(/([A-Z])/g, function($1){return '-'+$1.toLowerCase();});
};

String.prototype.toUnderscore = function(){
    return this.replace(/([A-Z])/g, function($1){return '_'+$1.toLowerCase();});
};

String.prototype.contains = function(string) {
    return -1 < this.indexOf(string);
};

String.prototype.escape = function() {
    return this.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

String.prototype.slugify = function() {
    var slug = '';
    var trimmed = this.trim();
    slug = trimmed.replace(/[^a-z0-9-]/gi, '-').
        replace(/-+/g, '-').
        replace(/^-|-$/g, '');
    return slug.toLowerCase();
};
