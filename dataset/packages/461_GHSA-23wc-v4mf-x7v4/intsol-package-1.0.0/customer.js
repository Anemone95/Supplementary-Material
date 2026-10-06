/**
 * Created by Ramkumar on 11/7/2015.
 */

var randomizer = require('./utilities');

function Customer(id, name, address, credit, status) {
    this.id = id || randomizer.getRandom();
    this.name = name;
    this.address = address;
    this.credit = credit;
    this.status = status;
}

Customer.prototype.format = function () {
    var formattedOutput = '';

    for (var property in this) {
        if (typeof this[property] !== 'function')
            formattedOutput += this[property] + ', ';
    }

    return formattedOutput;
};

module.exports = Customer;