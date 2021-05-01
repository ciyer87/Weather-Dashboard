//API key for weather app
const APIKey = "fa725517b60d6b90b2734dd00321d734";

//global variable declaration
var userFormEL = document.querySelector("#city-search");
var nameInputEl = document.querySelector("#search-input");
var weatherBody = document.querySelector("#weather-body");
var weatherCard = document.querySelector("#current-weather");
var forecastSection = document.querySelector("#forecast-section");
var fivedayDiv = document.querySelector("#five-day");
var fivedayHeader = document.querySelector("#forecast-header")
var $searchHistory = document.querySelector("#search-history");
var $historyCard = document.querySelector("#history-card");
var searchHistory = [];

//function to update search history in UI
function updateHistory() {
  $searchHistory.textContent = '';
  searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  for (var i = 0; i < searchHistory.length; i++) {
    var pastSearch = document.createElement("li");
    pastSearch.classList.add("list-group-item");
    pastSearch.setAttribute("data-value", searchHistory[i]);
    pastSearch.innerHTML = searchHistory[i];
    $searchHistory.appendChild(pastSearch);
  }
  $historyCard.classList.remove("hide");
}

//function to clear the previous search elements when a new search is initiated
function searchHandler(cityname) {
  //clear results divs:
  weatherBody.innerHTML = '';
  fivedayDiv.innerHTML = '';
  fivedayHeader.innerHTML = '';
  // get value from input element and call the function that fetches weather details from API
  getWeather(cityname);
  getFiveDayForecast(cityname);
};

function addTerm(searchTerm) {
  //if there's local storage, 
  if (localStorage.getItem("searchHistory")) {
    //get items from local storage and add them to searchHistory[]
    searchHistory = JSON.parse(localStorage.getItem("searchHistory"));
  }
  //either way add searchTerm to searchHistory[]
  searchHistory.push(searchTerm);
  //then store the updated searchHistory[] in local storage
  localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  //call the function to update search history display
  updateHistory();
}

//function to call the weather API to fetch the current weather.
var getWeather = function (city) {
  let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=imperial&appid=' + APIKey;

  fetch(queryURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          //function to display current weather
          displayWeather(data);
          cityCoords = data.coord;
          //function to fetch UV index based on the coordinates
          currentUVSearch(cityCoords);
        });
      } else {
        alert("Error: " + response.statusText)
      }
    })
    .catch(function (error) {
      alert("Unable to connect to the API");
    });
};

//function to display the current weather
function displayWeather(report) {
  //div to display current temperature
  var temp = document.createElement("div");
  temp.textContent = "Temperature: " + report.main.temp + "°F";
 // h1 element display city and date
  var city = document.createElement("h1");
  // get today's date
  var timeNow = moment();
  var currentDate = "(" + timeNow.format("MM/DD/YYYY") + ")";
  city.textContent = report.name + " " + currentDate;
  // element to show the icon based on weather
  var weatherIcon = document.createElement("img");
  weatherIcon.setAttribute("src", "https://openweathermap.org/img/w/" + report.weather[0].icon + ".png");
  //element to display wind
  var wind = document.createElement("div");
  wind.textContent = "Wind: " + report.wind.speed + " " + "MPH";
  //element to display humidity
  var humid = document.createElement("div");
  humid.textContent = "Humidity: " + report.main.humidity + " " + "%";
  //append all the values to the weather body
  city.appendChild(weatherIcon);
  weatherBody.appendChild(city);
  weatherBody.appendChild(temp);
  weatherBody.appendChild(wind);
  weatherBody.appendChild(humid);
  //unhide the div to display the current weather 
  weatherCard.classList.remove("hide")

};

//function to get UV index value from the API
function currentUVSearch(cityCoords) {
  var searchCoords = "lat=" + cityCoords.lat + "&lon=" + cityCoords.lon;
  var uvUrl = 'https://api.openweathermap.org/data/2.5/onecall?' + searchCoords + '&exclude=minutely,hourly&units=imperial&appid=' + APIKey;
  fetch(uvUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (uvResponse) {
          displayCurrentUV(uvResponse);
          displayForecast(uvResponse);
          console.log(uvResponse)
        });
      } else {
        alert("Error: " + uvResponse.statusText)
      }
    })
    .catch(function (error) {
      alert("Unable to connect to the API");
    });
}

//function to display UV Index value
function displayCurrentUV(uvResponse) {
  //set up div for uv
  var weatherUV = document.createElement("div");
  //set up span to set the background color of UV index
  var uv_value = document.createElement("span");
  uv_value.textContent = uvResponse.current.uvi;
  // UV index 0 to 2 - green, 3 to 5 - yellow, 6 to 7 - orange, 8 to 10 - Red
  if (uvResponse.current.uvi <= 2) {
    uv_value.style.backgroundColor = "green";
  }
  else if (uvResponse.current.uvi > 2 && uvResponse.current.uvi <= 5) {
    uv_value.style.backgroundColor = "yellow";
  }
  else if (uvResponse.current.uvi > 5 && uvResponse.current.uvi <= 7) {
    uv_value.style.backgroundColor = "orange";
  }
  else {
    uv_value.style.backgroundColor = "red";
  }
  weatherUV.textContent = "UV Index: ";
  weatherUV.append(uv_value);
  //add uv to card
  weatherBody.appendChild(weatherUV);
  //show current weather card since last element has been added:
  weatherCard.classList.remove("hide");
}

//function to call the weather API to fetch the 5 day forecast
var getFiveDayForecast = function (city_name) {
  let queryURLForecast = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city_name + '&units=imperial&appid=' + APIKey;

  fetch(queryURLForecast)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (forecastData) {
          // displayForecast(forecastData);
        });
      } else {
        alert("Error: " + response.statusText)
      }
    })
    .catch(function (error) {
      alert("Unable to connect to the API");
    });
}

//function to convert date in unix to UTC for 5 day forecast
function formatDate(date) {
  var date = new Date(date * 1000);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getUTCFullYear()}`;
}

//funciton to add 5 Day forecast response to page
function displayForecast(data) {
  console.log(data);

  //5-day forecast header
  var forecastHead = document.createElement("h3");
  forecastHead.classList.add("title");
  forecastHead.textContent = "5-Day Forecast";
  fivedayHeader.appendChild(forecastHead);
  //for loop to get the 5 day weather details
  for (let i = 1; i < 6; i++) {
    // div to display the forecast
    var forecastCard = document.createElement("div");
    forecastCard.classList.add("card", "bg-primary", "col-10", "col-lg-2", "p-0", "mx-auto", "mt-3");
    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-light", "p-2");
    //h5 element to display date
    var forecastTitle = document.createElement("h5");
    forecastTitle.classList.add("card-title");
    date = formatDate(data.daily[i].dt);
    forecastTitle.textContent = date;
    //img icon to represent weather
    var forecastIcon = document.createElement("img");
    forecastIcon.setAttribute("src", "https://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png");
    //div to display temperature
    var forecastTemp = document.createElement("div");
    forecastTemp.textContent = "Temp: " + (data.daily[i].temp.day) + " F°";
    //div to display wind
    var forecastWind = document.createElement("div");
    forecastWind.textContent = "Wind: " + (data.daily[i].wind_speed) + " " + "MPH";
    //div to display humidity
    var forecastHumid = document.createElement("div");
    forecastHumid.textContent = "Humidity: " + (data.daily[i].humidity) + "%";
    //append the weather details to the card
    cardBody.appendChild(forecastTitle);
    cardBody.appendChild(forecastIcon);
    cardBody.appendChild(forecastTemp);
    cardBody.appendChild(forecastWind);
    cardBody.appendChild(forecastHumid);
    forecastCard.appendChild(cardBody);
    fivedayDiv.appendChild(forecastCard);
   
  }
  //unhide the card to display the weather.
  forecastSection.classList.remove("hide");
}


//addeventlistener to capture the city selected from search history and call the corresponding function to display
$searchHistory.addEventListener("click", function (event) {
  event.preventDefault();
  //capture the city clicked 
  var itemClicked = event.target;
  if (itemClicked.matches("li")) {
    var clickSearch = itemClicked.getAttribute("data-value");
    //send the captured city to the searchhandler to clear previous state and go through the rest of the functions to display data
    searchHandler(clickSearch);
  }
});

//addeventlistener to capture the city and start the app
userFormEL.addEventListener("submit", function (event) {
  event.preventDefault();
  var cityname = nameInputEl.value.trim();
  searchHandler(cityname);
  cityname.value = ' ';
  //call function to add city to local storage
  addTerm(cityname);
});

