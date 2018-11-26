g_OPENWEATHERMAP_URL = "https://api.openweathermap.org/data/2.5/";
g_OPENWEATHERMAP_API_KEY = "f2ac8602071637a20d9af0897d6c8055";
g_FORECAST_COUNT = 3;

function getCurrentWeather(latitude, longitude) {
    let url = `${g_OPENWEATHERMAP_URL}weather?lat=${latitude}&lon=${longitude}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        console.log(response);
        // weather data
        let currentweather = response;
        let weather = currentweather.weather[0].description;
        let icon = currentweather.weather[0].icon;
        let iconurl = `res/weather/${icon}.png`
        let temperature = parseFloat(currentweather.main.temp-273.15).toFixed(1);
        let wind = parseFloat(currentweather.wind.speed).toFixed(1);
        // Turn data into html
        let timehtml = `<span class="badge badge-info"><i class="far fa-clock"></i> Now</span> `;
        let weatherhtml = `<img width=32 height=32 src="${iconurl}"></img><span class="text-capitalize">${weather}</span> `;
        let temperaturehtml = `<i class="fas fa-temperature-low"></i> ${temperature}&deg;C `;
        let windhtml = `<i class="fas fa-wind"></i> ${wind}m/s `;
        let weatherDiv = document.getElementById("current-weather");
        if (weatherDiv !== null)
            weatherDiv.innerHTML = timehtml + weatherhtml + temperaturehtml + windhtml;
    });
}

function updateWeatherButton(button) {
    let url = `${g_OPENWEATHERMAP_URL}weather?lat=${g_myPosition.lat}&lon=${g_myPosition.lng}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        let currentweather = response;
        let temperature = parseFloat(currentweather.main.temp-273.15).toFixed(1);
        let icon = currentweather.weather[0].icon;
        button.innerHTML = `<img width=32 height=32 src="https://openweathermap.org/img/w/${icon}.png"></img> ${Math.round(temperature)}°C`;
    });
}

// Get 5day/3hour forecast from OpenWeatherMap
function getForecastWeather(latitude, longitude) {
    let url = `${g_OPENWEATHERMAP_URL}forecast?lat=${latitude}&lon=${longitude}&APPID=${g_OPENWEATHERMAP_API_KEY}`;
    $.get(url, function(response) {
        console.log(response);
        for(let i=0;i<=g_FORECAST_COUNT;i++) {
            // weather data
            let forecastweather = response.list[i];
            let weather = forecastweather.weather[0].description;
            let icon = forecastweather.weather[0].icon;
            let iconurl = `res/weather/${icon}.png`
            let temperature = parseFloat(forecastweather.main.temp-273.15).toFixed(1);
            let wind = parseFloat(forecastweather.wind.speed).toFixed(1);
            let time = forecastweather.dt_txt.split(" ")[1].split(":");
            // Turn data into html
            let timehtml = `<span class="badge badge-info"><i class="far fa-clock"></i> ${time[0]}:${time[1]}</span> `;
            let weatherhtml = `<img width=32 height=32 src="${iconurl}"></img><span class="text-capitalize">${weather}</span> `;
            let temperaturehtml = `<i class="fas fa-temperature-low"></i> ${temperature}&deg;C `;
            let windhtml = `<i class="fas fa-wind"></i> ${wind}m/s `;
            document.getElementById(`forecast-weather-${i}`).innerHTML =  timehtml + weatherhtml + temperaturehtml + windhtml;
        }
    });
}