/**
 * Created by Ramkumar on 11/7/2015.
 */
var Customer = require('./customer');
var event = require('events');

(function() {
    var emitter = new event.EventEmitter();

    emitter.on('start-the-work', function() {
        var customer = new Customer(
            undefined, 'Northwind', 'Bangalore', 12000, true);

        console.log(customer.format());
    });

    setTimeout(function() {
        emitter.emit('start-the-work');
    }, 3000);
})();