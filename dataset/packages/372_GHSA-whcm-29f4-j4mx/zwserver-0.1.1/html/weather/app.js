$(document).ready(function(){
	//getLocation();
	//$('.js_use_location').prop('checked',true);
	$('.js_use_location').on("change", function(){
		var checked = $('.js_use_location').prop('checked');
		$('.js_city_input').prop('disabled',checked);
		if(checked){
			getLocation();
		}else{
			$('.js_city_input').val("");
		}
	});

	$('.js_submit').click(submit);

	//$('.test').prop('data_source',states);
	$('.js_city_input').typeahead({
		source:getCities,
		updater:function(item){
			//$('.js_city_input').val(item);
			submit(null,item);
			return item;
		}
	});
});

function getCities(query,process){
	var url = "/getcity?q="+query;
	$.getJSON(url,function(cityData){
		var cities = [];
		$.each(cityData, function(i,item){
			cities.push(item.city);
		});
		process(cities);
	});
}

function submit(event,item){
	var city = item || $('.js_city_input').val();
	$('.js_selected').val(city);
	$('.js_weather_list').empty();
	getWeather(city);
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			$.get('https://api.wunderground.com/api/1d0ad700dfd8f51e/geolookup/q/'
				+ position.coords.latitude + ',' + position.coords.longitude + '.json', function(geoData){
					$('.js_city_input').val(geoData.location.city);
					submit();
				});
		});
	} else {
		$('.js_use_location').remove();
	}
}

function getWeather(city) {
	var url = "https://api.wunderground.com/api/1d0ad700dfd8f51e/geolookup/conditions/q/UT/"+city+".json";
	$.get(url,function(weatherData){
		if(weatherData.location){
			$('.js_weather_list').append("<img src='"+weatherData.current_observation.icon_url+"'></img>");
			$('.js_weather_list').append("<li>Location: " + weatherData.location.city+"</li>");
			$('.js_weather_list').append("<li>Temperature: " + weatherData.current_observation.temperature_string+"</li>");
			$('.js_weather_list').append("<li>Weather: " + weatherData.current_observation.weather+"</li>");
		}else{
			$('.js_weather_list').append("No Valid City Selected");
		}
	});
}