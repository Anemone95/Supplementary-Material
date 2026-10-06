var chalk = require('chalk');

process.on('SIGINT', function () {
    // Exit after timeout
    setTimeout(function () {
        process.exit();
    }, 1000);
});

process.on('uncaughtException', function (error) {
    console.error(error);
    process.exit(1);
});

function main(argv) {
    var limit = argv[0] || null;
    if (limit) {
        limit = parseInt(limit, 10);
        if (isNaN(limit)) {
            throw new Error('Invalid limit');
            process.exit(1);
        }
    } else {
        limit = Infinity;
    }

    var id = String.fromCharCode(55 + Math.round(Math.random() * 80));

    setInterval(function(){
        var date = new Date();
        if (date.getSeconds() % 5 === 0) {
            console.log(chalk.green(date.toString()), '-', id);
        } else {
            console.log(date.toString(), '-', id);
        }

        limit--;

        if (! limit) process.exit(0);

    }, 1000);
}


main(process.argv.slice(2));
