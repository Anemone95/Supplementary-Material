function trace(context, func, args, line, col, file) {
	//console.trace();
	Development.Debugger.Debugger.line = line;
	Development.Debugger.Debugger.column = col;
	Development.Debugger.Debugger.funcName = func;
	Development.Debugger.Debugger.file = file;
	if (undefined === context) {
		throw new Error('Error, context is undefined.');
	}

	if (null === context) {
		context = window;
	}

	var toCall;
	if('function' === typeof(func)) {
		toCall = func;
	} else if('function' === typeof context[func]) {
		toCall = context[func];
	} else {
		throw new Error('Error, "' + func + '" is not a function.');
	}

	return toCall.apply(context, args);
}

function traceInstance(className, args, line, col, file) {
	//console.trace();
    var emptyObj = {};//We need an empty object as first argument for bind function
    args.unshift(emptyObj);
    Development.Debugger.Debugger.line = line;
    Development.Debugger.Debugger.column = col;
    Development.Debugger.Debugger.funcName = className;
    Development.Debugger.Debugger.file = file;
    return new (Function.prototype.bind.apply(className, args))();
}

const BUNS_START = Date.now();
