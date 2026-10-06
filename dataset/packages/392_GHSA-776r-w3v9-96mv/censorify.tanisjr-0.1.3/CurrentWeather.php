<!DOCTYPE HTML>

<!-- This is the main page !-->
<head>
	<link rel="stylesheet" type = "text/css" href = "WeatherStyle.css">
	<script src ="https://code.jquery.com/jquery-1.10.2.js"></script>
	<title>Tanis's Webpage</title>
</head>

<body>
	<? include("Menu.php") ?>
	
	<div class = "Image">
		<img src = "CurrentWeather.jpg">
	</div>

	<form>
	Enter a City: <input id="cityfield" type="text"  value=""> <br>
	Suggestion: <span id="texthint">Empty</span>
	<input id="button" type="submit" value="Submit"> <br>
	<p>City:</p>
	<textarea input id ="textBox" type="text" value= ""></textarea> <br>
	<p>Current Weather in your city:</p>
	<div id="currWeather">Nothing currently.</div></li>
	</form>
	
	
	<script>
	$("#cityfield").keyup(function() 
	{
		console.log("Test");
		var city = "staticCity.txt";
		var URL = "http://52.11.134.28/getcity?q=" + $("#cityfield").val();	
//	var URL = "https://students.cs.byu.edu/~clement/CS360/ajax/getcity.cgi?q=" + $("#cityfield").val();
		$.getJSON(URL, function(data)
		{
			console.log("URL is: " + URL);
			var everything;
			everything = "<ul>";
			$.each(data, function(i, item)
			{
				everything += "<li> " + data[i].city+"</li>";
			});
		
			everything +="</ul>";
			$("#texthint").html(everything);

			console.log(data);
			console.log("Got " + data[0]);
			console.log("Got " + data[0].city);

			//	$("#texthint").text("Test");
		})
		

		//$("#texthint").text("City: " + $("#cityfield").val());
		.done(function() {console.log("request success!");})
		.fail(function(jqXHR, textStatus, errorThrown)
		{
			console.log("Failed "+textStatus);
			console.log("incoming "+jqXHR.responseText);
		})
		.always(function() {console.log("getJSON request ended!");})
		.complete(function() {console.log("COMPLETE");});
	});
	
	$("#button").click(function(e)
	{
		$("#textBox").text($("#cityfield").val());
		console.log("Output something.");
		
		//REST request to wunderground...
		//API key...
		var API= "76797ce27fd7e9c1";
		var value = $("#cityfield").val();
		var myurl= "https://api.wunderground.com/api/" + API + "/geolookup/conditions/q/UT/"; 
		myurl += value;
		myurl += ".json";
		console.log(myurl);
		var currentConditions; //This will be the html to be sent as the current weather conditions.
		$.ajax(
		{ 
			url : myurl,
			dataType : "jsonp",
			success : function(data) 
			{ 
				console.log(data);
				var location = data['location']['city'];
				var forecast = "<a href = \"" + data['current_observation']['forecast_url'] + "\"></a>";
				var weather = data['current_observation']['weather'];
				var temperature = data['current_observation']['feelslike_string'];
				
				var toPrint = '<ul>';
				toPrint += '<li>Your location: ' + location;
				//toPrint += '<li>' + forecast + '</li>';
				console.log(forecast);	//Had trouble getting this link to come out... Might use it in the future.
				toPrint += '<li>Skies: ' + weather;
				toPrint += '<li>Feels like: ' + temperature;
				
				toPrint += '</ul>';
				$("#currWeather").html(toPrint);
			}
		});
		
		e.preventDefault();
	});
	
	</script>

</body>
