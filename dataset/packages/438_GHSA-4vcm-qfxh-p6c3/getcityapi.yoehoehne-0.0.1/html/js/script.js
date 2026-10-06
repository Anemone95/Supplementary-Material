$( document ).ready(function() 
{
//    $("#cityInput").autocomplete({
//        serviceUrl: '/data/getcity.txt',
//        onSelect: function(){
//            alert('You selected: ' + suggestion.value + ', ' + suggestion.data);
//        }
//    });
    
    $( "#cityInput" ).keyup(function() {
        var text = $("#cityInput").val();
	$.getJSON("http://52.11.22.46/getcity?q="+text,findPossibleMatches)
        .fail(function(jqXHR, textStatus, errorThrown){
            console.log("Failed "+textStatus);
            console.log("incoming "+jqXHR.responseText);
        });
    });
    
    
    $("#submitButton").click(function(e){
        var value = $("#cityInput").val();
        $(".dispcity").html("<p>City: "+value+"</p>");
        $("#suggs").html("<div></div>");
        e.preventDefault();
        
        url = "https://api.wunderground.com/api/fd86e4f058fad841/geolookup/conditions/q/UT/";
        url += value + ".json";
        
        $.ajax({ 
            url : url, 
            dataType : "jsonp", 
            success : parseWeather 
        });
    });
});


var parseWeather = function(data)
{
    console.log(data);
    var title = data.location.city+", "+data.location.state
    var observation = data.current_observation;
    
    var weather = '<h1>' + title + '</h1>';
    weather += '<p> Feels like: '+ observation.feelslike_string + '</p>';
    weather += '<p> Temperature: ' + observation.temp_f + ' F </p>';
    weather += '<p> Weather: ' + observation.weather + '</p>';
    $(".weather").html(weather); 
}


var findPossibleMatches = function(data)
{   
    $(".dispcity").html("<div></div>");
    var text = $("#cityInput").val();
    var pattern = new RegExp("^"+text,"i");
    
    var container = $('<div />').attr('id', '#textHint');
    
    $.each(data, function(i, item){
        var city = item.city;
        if(pattern.test(city))
        {
            container.append('<p>'+ city +'</p>');
        }
    });
    
    $("#suggs").html(container);
}
           
