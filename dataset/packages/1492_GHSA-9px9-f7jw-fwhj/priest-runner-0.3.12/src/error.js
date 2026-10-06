var util = require('util');

module.exports = PriestError;

function PriestError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message || '';
}

util.inherits(PriestError, Error);
