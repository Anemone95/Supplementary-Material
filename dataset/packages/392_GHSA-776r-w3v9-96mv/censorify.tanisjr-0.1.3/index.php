<!DOCTYPE html>

<!-- This is the main page !-->
<head>
	<link rel="stylesheet" type = "text/css" href = "WeatherStyle.css">
	<title>Tanis's Webpage</title>
</head>

<body>	
	<? include("Menu.php") ?>
	
	<!--	I was a little confused about whether we were supposed to write our entire resume from scratch using html and css or if we could import it from somewhere else.
			Since I already had my resume and it's quite extensive, I decided to convert it to a web page and include it with php to simplify things.
			This is what I would do in the real world as hard coding all of the font settings and style by hand would be a nightmare. This way was more efficient.
			Hopefully this wasn't an issue...

			Thanks!
			-Tanis


	<div class = "resume">
	<h1><b>Tanis Reed</b></h1>
	
	<p>445 N 400 E Apt. Wouldn't you like to know.	* Tel. ___-___-____ * email: tanis.reed@yahoo.com</p>
	<br><br>
	
	<p style = "font-size: 26px"><b>Experience</b></p><br>
	<p>*
	

	</div>!-->

	<br>

	<? include("Resume.php") ?>
</body>