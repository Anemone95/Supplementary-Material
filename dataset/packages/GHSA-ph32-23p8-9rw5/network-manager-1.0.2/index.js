var platform = process.platform;
switch (platform){
    case 'linux':
    module.exports = require('./linux/manager.js');
    break;
    
    default:
    throw 'Unknown Platform '+ platform; 
}