var cli = process.env.NM_CLI || 'nmcli'

/** 
 * Command for geting  device status and connection info
 * nmcli  -t  -f type,device,state,connection   d
 * 
 * command for connecting to a particular device
 * nmcli  d connect enp2s0
 * 
 * command for enabling autoconnect and setting unmanaged to managed
 * set [ifname] <ifname> [autoconnect yes|no] [managed yes|no]
 * 
 * List the available network
 * nmcli   -t -f ssid,mode,signal,security  d  wifi
 * Add Ip address to 
 * nmcli   c   modify   88c1acfd-c104-4d6d-9c4b-0c720c910bae   ipv4.addresses 172.17.0.1/24,172.16.0.1/24
 * 
 * Get all the information about a connection
 * nmcli c show  b148ef7e-0a99-4773-9eb0-9a12244f7292
 * XseedDX = xseeddx@BLR
 * Renjith = renjimon1
*/
var regex = /(.*)\.(.*)/g; 
var common = require ('../common');
var getDeviceCmd = cli + ' -t  -f type,device,state,connection d';
var getAvailableWifiNetworkCmd = cli + ' -t -f ssid,mode,signal,security  d  wifi';
var getConnection = cli + ' -t -f uuid,type c';
module.exports = {
    getDevices : function (){
        var devices = [];
        var buf = common.runCommand(getDeviceCmd);
        var str = buf.toString();
        var arr = str.split(/\r?\n/);
        for (var i = 0; i<arr.length; i++){
            var obj = {
                toString : function (){
                   return JSON.stringify(this);
                }
            };
            var row = arr[i];
            var values = row.split(':');
            var type = values[0];
            if (!type ||  (type != 'wifi' &&  type != 'ethernet'))
                continue;
            obj.type = type;
            obj.device = values[1];
            obj.state = values[2];
            obj.connection = values[3];
            devices.push(obj);
        }
        return devices;
    },
    getWifiNetworkAvailable : function (device){
        var networks = [];
        var buf = common.runCommand(getConnection);
        var str = buf.toString();
        var arr = str.split(/\r?\n/);
        for (var i = 0; i<arr.length; i++){
            var buf = common.runCommand(getConnection);
            var obj = {
                toString : function (){
                   return JSON.stringify(this);
                }
            };
            var row = arr[i];
            var values = row.split(':');
            var ssid = values[0];
            if (!ssid )
                continue;
            obj.ssid = ssid;
            obj.mode = values[1];
            obj.signal = values[2];
            obj.security = values[3];
            networks.push(obj);
        }
        return networks;
    },
    getConnection : function (){
        var devices = [];
        var buf = common.runCommand(getConnection);
        var str = buf.toString();
        var arr = str.split(/\r?\n/);
        for (var i = 0; i<arr.length; i++){
            var row = arr[i];
            var values = row.split(':');
            var type = values[1];
            if(type != '802-11-wireless' && type != '802-3-ethernet')
                continue;
            var buf = common.runCommand(cli + ' -t c show ' + values[0]);
            var objStr = buf.toString();

            var objArr = objStr.split(/\r?\n/);
             var obj = {
                    toString : function (){
                        return JSON.stringify(this);
                    }
            };
            for (var j = 0; j < objArr.length; j++){
               
                var objRowVal = objArr[j];
                var values = objRowVal.split(':');
                var keyStr = values[0];
                var objVal = values[1];
                var objKeyValues = keyStr.split('.');
                var rootkey = objKeyValues[0];
                objKeyValues = objKeyValues[1];
                var inx = objKeyValues ? objKeyValues.indexOf('['): -1;
                
                var index = null;
                if (objKeyValues && inx >=0)
                    index = objKeyValues.substring(inx+1, objKeyValues.length-1 ); 
                else
                inx = objKeyValues ? objKeyValues.length : null;

                var childKey = objKeyValues ? objKeyValues.substring(0, inx): null;
                if (rootkey && childKey){
                if (!obj[rootkey]){
                    obj[rootkey] = {}; 
                }
                if(index && !obj[rootkey][childKey]){
                   obj[rootkey][childKey] = []; 
                }

                if (index){
                    obj[rootkey][childKey].push(objVal);
                }else {
                    obj[rootkey][childKey] = objVal;
                }
                }
            }
            devices.push(obj);
        }
        return devices;
    },
};