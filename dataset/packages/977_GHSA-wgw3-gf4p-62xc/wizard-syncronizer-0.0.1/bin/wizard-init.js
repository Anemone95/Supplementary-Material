var fs=require("fs");

exports.init=function(options){
	var widgetName = options.widgetName;	
	if (!widgetName) {
		console.log("you must specify the name");
		return;
	}
	var currentWorkingDir=process.cwd();
	fs.writeFileSync(currentWorkingDir+"/"+widgetName+".groovy", "");
	fs.writeFileSync(currentWorkingDir+"/"+widgetName+".ftl", "");
	fs.writeFileSync(currentWorkingDir+"/"+widgetName+".js", "");
	console.log("finish initializing app archetype");

}