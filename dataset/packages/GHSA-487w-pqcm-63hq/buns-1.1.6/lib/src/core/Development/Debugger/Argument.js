#!namespace Development.Debugger;

class Argument extends Abstract.Core.AbstractCore {
    static check(/*Array*/args, /*String*/funcName = [], /*String*/fileName) {
        Development.Debugger.Debugger.file = fileName;
        function checkType(index, object, prop) {
            type = Object.keys(object)[0].capitalize();
            if(!Environment.Tools.Tools['is' + type](object[prop])) {
                //console.log('Argument #' + index + ' must be ' + type + ', ' + typeof(object[prop]) + ' passed (' + funcName + ', ' + fileName + ').');
                throw new Error('Argument #' + index + ' must be ' + type + ', ' + typeof(object[prop]) + ' passed.');
            }
        }

        var type, prop;
        args.forEach(function(object, index) {
            ++index;
            for(prop in object) {};

            if(!Environment.Tools.Tools.isSet(object[prop])) {
                //console.log('Argument #' + index + ' is undefined.');
                throw new Error('Argument #' + index + ' is undefined.');
            }
            checkType(index, object, prop);
        });
    }
}
