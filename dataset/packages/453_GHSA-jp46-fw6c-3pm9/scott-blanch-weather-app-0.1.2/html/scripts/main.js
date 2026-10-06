$(function() {

  var APIKEY = '3d0b628fcd637271';

  function htmlSuggestedCities( listCity ){
    var html = '';

    for(var i =0; i< listCity.length; i++){
      html+= '<li>' + listCity[i] + '</li>';
    }

    return html;

  }

  function htmlWeatherInCity( location, temperature, weather ){
    var html = '<li>Location: {{location}}</li>' +
    '<li>Temperature: {{temperature}}</li>'+
    '<li>Weather: {{weather}}</li>';

    return html
            .replace('{{location}}', location)
            .replace('{{temperature}}', temperature)
            .replace('{{weather}}', weather);

    


  }


  function formattedCityName( cityName ){
    var formattedCityName;
    if(!cityName || !cityName.length || cityName.length <=0 ){
      formattedCityName = '';
    }else{
      formattedCityName = cityName.charAt(0).toUpperCase() + cityName.substr(1).toLowerCase();
    }
    return formattedCityName;
  }

  $('#city-input').on('keyup', function(){

    var city = formattedCityName( $('#city-input').val() );
    var cityArray = [];

    if(city.length <=0 ){
      $('#suggested-cities').html( htmlSuggestedCities(cityArray) );
      return;
    }


    if(!( /^[a-zA-Z\s]*$/.test(city)) ){
      alert('input letters only please');
      $('#city-input').val( city.replace(/[^A-Za-z\s]/g, '') );
      return;
    }

    $.ajax({
      dataType: "json",
      type: "GET",
      url: '/getcity.cgi?q=' + city,
      success: function( response ){

        
        if(!response || !response.length || response.length <=0) {
          cityArray = [];
        }else{
          cityArray = $.map( response, function( val, i ) {
            return val.city;
          });
        }
        $('#suggested-cities').html( htmlSuggestedCities(cityArray) );
        
      }
    });

    


  });


  $('#submit-city-btn').on('click', function(){

    var city = formattedCityName( $('#city-input').val() );

    $('#city-to-find-weather').val(city);

    $.ajax({
      dataType: "json",
      type: "GET",
      url: 'https://api.wunderground.com/api/' + APIKEY + '/geolookup/conditions/q/Utah/'+city+'.json',
      success: function( response ){

        if(!response || response.response.error){
          alert('error with getting the weather from the location');
          return;
        }
        
        $('#city-temperature').html( htmlWeatherInCity(
            response.location.city, 
            response.current_observation.temperature_string, 
            response.current_observation.weather) );
      },
      error: function(){
        alert('error getting the weather');
      }
    });
  });







});