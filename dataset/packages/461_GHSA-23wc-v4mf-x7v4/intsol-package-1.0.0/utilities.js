/**
 * Created by Ramkumar on 11/7/2015.
 */
function generateRandom(minimum, maximum) {
    minimum = minimum || 1;
    maximum = maximum || 100000;


    var randomNumber = Math.floor(
        Math.random() * (maximum - minimum ) + minimum);

    return randomNumber;
}

module.exports = {
    getRandom: generateRandom
};