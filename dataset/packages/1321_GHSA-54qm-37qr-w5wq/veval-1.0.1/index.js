const vm = require("vm");

/**
 * V(m)EVAL - VM Based Evaluation Function
 * @param {object} ctx The context/virtual space for the eval
 * @param {string} scr The script/snipped to evaluate
 */
function veval(ctx = {}, scr = "")
{
    let context = vm.createContext(ctx);
    let output = null;
    try {
        output = vm.runInContext(scr, context);
    } catch(ex) {
        output = ex;
    }
    return output;
}

module.exports = veval;