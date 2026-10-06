var fs=require("fs");

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function initIfNeeded(){
	var path = getUserHome()+"/.wizard";
	if(!fs.existsSync(path)) {
		fs.mkdirSync(path);
	}
}

exports.getWizardHome=function(){
	initIfNeeded();
	return getUserHome()+"/.wizard";
}

exports.saveConfig=function(config) {
	initIfNeeded();
	var path = getUserHome()+"/.wizard/config.json"
	fs.writeFileSync(getUserHome()+"/.wizard/config.json",JSON.stringify(config));
}

exports.loadConfig=function(){
	initIfNeeded();
	var path = getUserHome()+"/.wizard/config.json";
	if(fs.existsSync(path)) {
		return JSON.parse(fs.readFileSync(path,'utf-8'));
	}
	else {
		return {};
	}
}

