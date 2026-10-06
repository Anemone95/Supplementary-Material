
$(function(){

	$('#button').click(function(){
		/* $.post('getJson', function(result){
			if(result){
				$('#content').html(result.name + "--" + new Date());
			}
		}); */
		$.ajax({
			url: 'ajax!getJson',
			type: 'post',
			async: true,
			data: {name: 'hjf', age: 32},
			dataType: 'json', //返回的字符串按json解析，JSON.parse()
			success: function (result){
				if(result){
					$('#content').html(result.name + "--" + new Date());
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
	$('#button_a').click(function (){
		$.ajax({
			url: 'ajax!getXml',
			type: 'get',
			async: true,
			dataType: 'xml', //返回的字符串按xml解析，得到document类型的节点
			success: function (result){ //返回的为document类型的节点，（即根点，有方法getElementById等）
				if(result){
					$('#content').append(result.documentElement);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
	$('#button_b').click(function (){
		$.ajax({
			url: 'ajax!getHtml',
			type: 'get',
			async: true,
			dataType: 'html', // 返回的字符串未解析，直接传给success函数
			success: function (result){ //
				if(result){
					$('#content').append(result);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
	$('#button_c').click(function (){
		$.ajax({
			url: 'ajax!getScript',
			type: 'get',
			async: true,
			dataType: 'script', // 返回的字符串会被当做script脚本解析执行（eval（）），执行后把字符串传给success
			success: function (result){ //
				if(result){
					$('#content').append(result);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
	$('#button_d').click(function (){
		$.ajax({
			url: 'ajax!getMembersOfRequest',
			type: 'post',
			data: {name: 'you', age: 12},
			async: true,
			dataType: 'text', 
			success: function (result){ 
				if(result){
					$('#content').text(result);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
	
	/**
	* jsonp实现方式不是通过xhr，而是通过“插入script元素”的方式，随机生成的回调函数将后台数据传递给success函数并执行
	**/
	$('#button_e').click(function (){
		$.ajax({
			url: 'ajax!getJsonp',
			type: 'get',
			data: {name: 'you', age: 12},
			async: true,
			dataType: 'jsonp', 
			jsonp: "mycallback",
			success: function (result){ 
				if(result){
					$('#content').html(result.name + ':' + result.age + ':' + result.time);
				}
			},
			error: function (XMLHttpRequest, textStatus, errorThrown){
				console.log(textStatus || errorThrown);
			}
		});
	});
	
});