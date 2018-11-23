g_OPENWEATHERMAP_URL = "https://api.openweathermap.org/data/2.5/";
g_OPENWEATHERMAP_API_KEY = "f2ac8602071637a20d9af0897d6c8055";

function getCurrentWeather(latitude, longitude) {
    let url = `${g_OPENWEATHERMAP_URL}weather?lat=${latitude}&lon=${longitude}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        console.log(response);
        let currentweather = response;
        let weather = currentweather.weather[0].description;
        let temperature = parseFloat(currentweather.main.temp-273.15).toFixed(1);
        let wind = parseFloat(currentweather.wind.speed).toFixed(1);
        let icon = currentweather.weather[0].icon;
        let weatherDiv = document.getElementById("current-weather");
        if (weatherDiv !== null)
            weatherDiv.innerHTML = `${weather}; Temperature: ${temperature}&deg;C; Wind speed: ${wind}m/s`;
    });
}

function initWeatherButton(latitude, longitude, button) {
    let url = `${g_OPENWEATHERMAP_URL}weather?lat=${latitude}&lon=${longitude}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        let currentweather = response;
        let temperature = parseFloat(currentweather.main.temp-273.15).toFixed(1);
        let icon = currentweather.weather[0].icon;
        let weatherDiv = document.getElementById("current-weather");
        button.innerHTML = `<img width=32 height=32 src="https://openweathermap.org/img/w/${icon}.png"></img> ${Math.round(temperature)}°C`;
    });
}

function getForecastWeather(latitude, longitude) {
    let url = `${g_OPENWEATHERMAP_URL}forecast?lat=${latitude}&lon=${longitude}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        console.log(response);
        //1
        let forecastweather = response.list[1];
        let weather = forecastweather.weather[0].description;
        let temperature = parseFloat(forecastweather.main.temp-273.15).toFixed(1);
        let wind = parseFloat(forecastweather.wind.speed).toFixed(1);
        let time = forecastweather.dt_txt.split(" ")[1].split(":");

        document.getElementById("forecast-weather-1").innerHTML = `${time[0]}:${time[1]}: ${weather}; Temperature: ${temperature}&deg;C; Wind speed: ${wind}m/s`;
        // 2
        forecastweather = response.list[2];
        weather = forecastweather.weather[0].description;
        temperature = parseFloat(forecastweather.main.temp-273.15).toFixed(1);
        wind = parseFloat(forecastweather.wind.speed).toFixed(1);
        time = forecastweather.dt_txt.split(" ")[1].split(":");

        document.getElementById("forecast-weather-2").innerHTML = `${time[0]}:${time[1]}: ${weather}; Temperature: ${temperature}&deg;C; Wind speed: ${wind}m/s`;
    });
}