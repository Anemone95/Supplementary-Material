/**
 * Created by Ramkumar on 11/7/2015.
 */
var Customer = require('./customer');
var Customers = require('./customers');

(function () {
    var intervalSchedule = process.env.INTERVAL_SCHEDULE || 4000;
    var customers = new Customers();

    customers.on('add-customer',
        function (data) {
            console.log('Add Customer Event Triggered ... and Handled ... ' +
                JSON.stringify(data));
        });

    var interval = setInterval(
        function () {
            var customer = new Customer(undefined,
                "Customer #1", "Bangalore", 12000, true);

            customers.addCustomer(customer);
        }, intervalSchedule);

    setTimeout(function () {
        console.log('Time to Quit!');
        clearInterval(interval);
    }, 15000);
})();