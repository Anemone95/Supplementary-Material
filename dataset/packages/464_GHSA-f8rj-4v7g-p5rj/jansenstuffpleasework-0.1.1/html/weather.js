$(function () {
    $('#weatherCityInput').keyup(function() {
	$('span#hint').html(" ").addClass('ajax-loader');
	$.getJSON("http://ec2-52-10-234-236.us-west-2.compute.amazonaws.com/getCity?q=" + $('#weatherCityInput').val(), function(data) { 
    	    var citySuggestions;
	    citySuggestions = "<ul id='suggestionList'>";
	    $.each(data, function(i, item) {
		citySuggestions += "<li> "+data[i].city;
	    });
	    citySuggestions += "</ul>";
	    $('span#hint').html(citySuggestions).removeClass('ajax-loader');
	});
	
    });

    $('#submitButton').click(function(e) {
	var city = $('#weatherCityInput').val();
	e.preventDefault();
	$('#displayCity').text(city);
	$('#weatherDiv').html("").addClass('ajax-loader');
	$.getJSON("https://api.wunderground.com/api/288e7f8becb27917/geolookup/conditions/q/Utah/" + city + ".json", function(data) {
	    if (data == undefined || data['location'] == undefined) {
		$('#weatherDiv').html("No data found for city <strong>'" + city + "'</strong>.").removeClass('ajax-loader');
		return;
	    }
	    var locationCountry = data['location']['country_name'];
	    var locationState = data['location']['state'];
	    var location = data['location']['city'];
	    var temp_string = data['current_observation']['temperature_string'];
     	    var current_weather = data['current_observation']['weather'];
	    var weatherOutput = "<ul>";
      	    weatherOutput += "<li>Location: "+location;
      	    weatherOutput += "<li>Temperature: "+temp_string;
      	    weatherOutput += "<li>Weather: "+current_weather;
            weatherOutput += "</ul>";
	    $('#weatherDiv').html(weatherOutput).removeClass('ajax-loader');
	});

    });



});
