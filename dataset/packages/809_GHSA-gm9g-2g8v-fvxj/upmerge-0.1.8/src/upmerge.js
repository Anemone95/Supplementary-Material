;
//noinspection JSUnresolvedVariable
(function (isNode) {

	var isObject = function (val, countNullAsObject) {
		countNullAsObject = isSet(countNullAsObject) ? !!countNullAsObject : true;

		if (countNullAsObject === false && val === null) {
			return false;
		}

		return typeof val === 'object';
	};

	var isArray = function (val) {
		return isObject(val) && val instanceof Array;
	};

	var isDate = function (val) {
		return isObject(val) && val instanceof Date;
	};

	var isError = function (val) {
		return isObject(val) && val instanceof Error;
	};

	var isUndefined = function (val) {
		return typeof val === 'undefined';
	};

	var isSet = function (val) {
		return !isUndefined(val);
	};

	var getClass = function (obj) {
		if (typeof obj !== 'object' || obj === null) {
			return null;
		}
		var res = obj.constructor.toString().match(/function\s+([^(]+)/);
		return res.length ? res[1].toLowerCase() : null;
	};

	var clone = function (origObj) {

		var cloneObj;

		if (isArray(origObj)) {

			cloneObj = [];

			for (var i = 0; i < origObj.length; i++) {
				cloneObj[i] = origObj[i];
			}

		} else if (isObject(origObj)) {

			if (origObj === null) {

				cloneObj = null;

			} else if (origObj instanceof Date) {

				cloneObj = new Date();
				cloneObj.setTime(origObj.getTime());

			} else if (origObj instanceof Error) {

				cloneObj = new Error(origObj.message);

			} else if (getClass(origObj) === 'object') {

				cloneObj = {};

				for (var prop in origObj) {
					if (origObj.hasOwnProperty(prop)) {
						cloneObj[prop] = clone(origObj[prop]);
					}
				}

			} else {
				var message = 'Unsupported object type (' + getClass(origObj) + '): Please, extend this function';
				console.error(message, 'Failed to clone:', origObj);
				throw new Error(message);
			}

		} else {
			cloneObj = origObj;
		}

		return cloneObj;
	};

	var merge = function(objBase, objExt, options) {

		//--------------------------
		// Handle options: clone, deep, replaceOnly

		if (isUndefined(options)) {
			options = {};
		}

		// Return cloned object (do not change objExt)
		options.clone = isSet(options.clone) ? !!options.clone : true;

		// Recursive object copy (with all nested keys and values)
		options.deep = isSet(options.deep) ? !!options.deep : true;

		// Overlay existing in objBase objects keys, fail if objExt has new keys
		options.replaceOnly = !!options.replaceOnly;

		//--------------------------

		var mergeWorker = function (objBase, objExt) {

			for (var key in objExt) {

				if (key === '__proto__') {
					continue;
				}

				if (objExt.hasOwnProperty(key)) {

					if (options.replaceOnly && isUndefined(objBase[key])) {
						return null;
					}

					if (options.deep && isObject(objExt[key])) {

						if (getClass(objExt[key]) === 'object') {

							var innerMerge = mergeWorker(
								isObject(objBase[key], false) ? objBase[key] : {},
								objExt[key]
							);

							if (innerMerge === null) {
								return null;
							} else {
								objBase[key] = innerMerge;
							}

						} else {
							objBase[key] = clone(objExt[key]);
						}

					} else {
						objBase[key] = objExt[key];
					}
				}
			}

			return objBase;
		};

		return mergeWorker(
			options.clone ? clone(objBase) : objBase,
			objExt
		);
	};

	var methods = {
		clone: clone,
		merge: merge,
		add: function (objBase, objExt) {
			return merge(objBase, objExt, {replaceOnly: true});
		}
	};

	if (isNode) {
		//noinspection JSUnresolvedVariable
		module.exports = methods;
	} else {
		window.upmerge = methods;
	}

})(typeof module === 'object' && typeof module.exports === 'object');
