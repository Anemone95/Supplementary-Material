module.exports = {
	main : function (request, query) {
		return {
			type : 'htmlFile'
		};
	},
	serverSent : function (request, query) {
		var time = new Date().toString();
		return {
			type : 'event-stream',
			data : time
		};
	}
};
