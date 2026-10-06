/**
 * Created by Ramkumar on 11/7/2015.
 */

var Customer = require('./customer');
var events = require('events');
var util = require('util');

function Customers() {
    this.customers = [];
}

util.inherits(Customers, events.EventEmitter);

Customers.prototype.addCustomer = function (customer) {
    if (customer && customer instanceof Customer) {
        this.customers.push(customer);

        this.emit('add-customer', {
            time: new Date(),
            customer: customer
        });
    }
};

module.exports = Customers;