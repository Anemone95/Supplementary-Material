var childProcess = require('child_process');
module.exports = {
 runCommand : function (cli , options){
    var options = options || {};
    options.timeout =  options.timeout || 3000;
    var pOut  = null;
    try {
        
        pOut = childProcess.execSync(cli, options);
    } catch (err){
        if (err.signal === 'SIGTERM' && t0 <= Date.now() - max_wait) {
            throw new Error('Timeout');
        }
        throw err;
    }

    return pOut;
 }
}
