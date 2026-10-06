module.exports = {
	main: function (request, query){
		return {
			type: 'htmlFile'
		};
	},
	upload: function (request, query){
		return {
			type: 'text',
			data: '文件上传成功'
		};
	}
};