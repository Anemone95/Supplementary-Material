<!DOCTYPE HTML>

<!-- This is the main page !-->
<head>
	<link rel="stylesheet" type = "text/css" href = "WeatherStyle.css">
	<title>Tanis's Webpage</title>
</head>

<body>
	<? include("Menu.php") ?>

	<div class = "Tennis">
		<table border = "1" class = "MyTable">

		<tr>
			<td>Last Name</td>
			<td>First Name</td>
			<td>Zip Code</td>
		</tr>
		
		<tr>
			<td>Novak</td>
			<td>Djokovic</td>
			<td>84606</td>
		</tr>
		
		<tr>
			<td>Federer</td>
			<td>Roger</td>
			<td>77636</td>
		</tr>

		<tr>
			<td>Nadal</td>
			<td>Rafael</td>
			<td>18207</td>
		</tr>


		</table><br>
		
		<pre style = "text-align: center">Add your full name and zip code. (This is my pre tag usage...)</pre>


		<div class = "MyForm">
		<form>
		First name:
		<input type="text" name="firstname">
		<br>
		Last name:
		<input type="text" name="lastname">
		<br>
		ZIP:
		<input type="text" name="zip">
		</form>
		</div>
	</div>
</body>