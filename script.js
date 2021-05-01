const APIKey = "fa725517b60d6b90b2734dd00321d734";

var userFormEL = document.querySelector("#city-search");
var nameInputEl = document.querySelector("#search-input");
var weatherBody = document.querySelector("#weather-body");
var weatherCard = document.querySelector("#current-weather");
var forecastSection = document.querySelector("#forecast-section");
var fivedayDiv = document.querySelector("#five-day");
var fivedayHeader=document.querySelector("#forecast-header")
var $searchHistory = document.querySelector("#search-history");
var $historyCard = document.querySelector("#history-card");
var searchHistory = [];

//var savedSearch = JSON.parse(localStorage.getItem('history')) || [];

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

function searchHandler(cityname) {
  
  //clear results divs:
  
  weatherBody.innerHTML = '';
  fivedayDiv.innerHTML = '';
  fivedayHeader.innerHTML = '';
  

  // get value from input element
  
    getWeather(cityname);
    getFiveDayForecast(cityname);
  
};

function addTerm(searchTerm){
  //if there's local storage, 
  if(localStorage.getItem("searchHistory")){
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


var getWeather = function (city) {
  let queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=imperial&appid=' + APIKey;

  fetch(queryURL)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          displayWeather(data);
          cityCoords = data.coord;
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

function displayWeather(report) {

  var temp = document.createElement("div");
  temp.textContent = "Temperature: " + report.main.temp + "°F";

  var city = document.createElement("h1");
  var timeNow = moment();
  var currentDate = "(" + timeNow.format("MM/DD/YYYY") + ")";
  city.textContent = report.name + " " + currentDate;
  var weatherIcon = document.createElement("img");
  weatherIcon.setAttribute("src", "https://openweathermap.org/img/w/" + report.weather[0].icon + ".png");

  var wind = document.createElement("div");
  wind.textContent = "Wind: " + report.wind.speed + " " + "MPH";

  var humid = document.createElement("div");
  humid.textContent = "Humidity: " + report.main.humidity + " " + "%";
  var uvIndex = document.createElement("div");
  city.appendChild(weatherIcon);
  weatherBody.appendChild(city);
  weatherBody.appendChild(temp);
  weatherBody.appendChild(wind);
  weatherBody.appendChild(humid);

  weatherCard.classList.remove("hide")

};

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


function displayCurrentUV(uvResponse) {
  //set up div for uv

  var weatherUV = document.createElement("div");

  var uv_value = document.createElement("span");
  uv_value.textContent = uvResponse.current.uvi;
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
  //console.log("hi");

}

function formatDate(date) {
  var date = new Date(date * 1000);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getUTCFullYear()}`;
}
//add 5 Day forecast response to page:
function displayForecast(data) {
  console.log(data);
  let pointer = 1;
  var forecastHead = document.createElement("h3");
  forecastHead.classList.add("title");
  forecastHead.textContent = "5-Day Forecast";
  fivedayHeader.appendChild(forecastHead);
  for (let i = 1; i < 6; i++) {

    var forecastCard = document.createElement("div");
    forecastCard.classList.add("card", "bg-primary", "col-10", "col-lg-2", "p-0", "mx-auto", "mt-3");

    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "text-light", "p-2");

    var forecastTitle = document.createElement("h5");
    forecastTitle.classList.add("card-title");
    date = formatDate(data.daily[i].dt);
    forecastTitle.textContent = date;

    var forecastIcon = document.createElement("img");
    forecastIcon.setAttribute("src", "https://openweathermap.org/img/w/" + data.daily[i].weather[0].icon + ".png");
    //forecastIcon.setAttribute("alt", responseRef.daily[i].main + " - " + responseRef.daily[i].weather[i].description);


    var forecastTemp = document.createElement("div");
    forecastTemp.textContent = "Temp: " + (data.daily[i].temp.day) + " F°";


    var forecastWind = document.createElement("div");
    forecastWind.textContent = "Wind: " + (data.daily[i].wind_speed) + " " + "MPH";

    var forecastHumid = document.createElement("div");
    forecastHumid.textContent = "Humidity: " + (data.daily[i].humidity) + "%";

    cardBody.appendChild(forecastTitle);
    cardBody.appendChild(forecastIcon);
    cardBody.appendChild(forecastTemp);
    cardBody.appendChild(forecastWind);
    cardBody.appendChild(forecastHumid);

    forecastCard.appendChild(cardBody);
    fivedayDiv.appendChild(forecastCard);

    pointer++;
  }
}
forecastSection.classList.remove("hide");

$searchHistory.addEventListener("click", function(event){
  event.preventDefault();
  var itemClicked = event.target;
  if(itemClicked.matches("li")){
    var clickSearch = itemClicked.getAttribute("data-value");
    //i want to splice the item clicked from the array and then readd it... but since i am allowing repeated items onto the array it's difficult rn
    //run a search with the term clicked
    searchHandler(clickSearch);  
  }
});

userFormEL.addEventListener("submit", function(event){
  event.preventDefault();
  var cityname = nameInputEl.value.trim();
  searchHandler(cityname);
  cityname.value = ' ';
  addTerm(cityname);
});

