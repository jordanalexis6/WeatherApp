// store the value of the input
let city;

// store api key
const apiKey = "&appid=bf815721c88bed0e2f63277265b25b11";

let date = new Date();

$("#currentDay").text(moment().format("dddd, MMMM Do YYYY"));
$("#currentTime").text(moment().format("LT"));

$("#searchCity").keypress(function (event) {
  // enter key
  if (event.keyCode === 13) {
    event.preventDefault();
    $("#searchBtn").click();
  }
});

// populates history on page
listCities();
function listCities() {
  $("#cityList").html("");
  var cities = JSON.parse(localStorage.getItem("cities")) || [];
  console.log(cities);
  for (var i = 0; i < cities.length; i++)
    $(".list").append('<li class="list-item">' + cities[i] + "</li>");
}
// localStorage
function makeList() {
  var cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (cities.indexOf(city) === -1) {
    cities.push(city);
    console.log(cities);
  }
  localStorage.setItem("cities", JSON.stringify(cities));
  listCities();
}

// sets on click for the list of cities in the history list
$(".list-item").on("click", function () {
  city = $(this).text();
  $("#searchCity").val(city);
  $("#searchBtn").click();
});

// searching a city
$("#searchBtn").on("click", function () {
  // get the value of the input from user
  city = $("#searchCity").val().trim();

  // clear input box
  $("#searchCity").val("");

  // full url to call api
  const queryUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" + city + apiKey;
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(function (response) {
    getCurrentConditions(response);
    getCurrentForecast(response);
    makeList();
  });

  function getCurrentConditions(response) {
    // get the temperature and convert to fahrenheit
    let tempF = (response.main.temp - 273.15) * 1.8 + 32;
    tempF = Math.floor(tempF);
    // pulling lon and lat for the UVIndex
    var lon = response.coord.lon;
    var lat = response.coord.lat;
    $("#currentCity").empty();

    // get and set the content
    const card = $("<div>").addClass("card");
    const cardBody = $("<div>").addClass("card-body");
    const city = $("<h4>").addClass("card-title").text(response.name);
    const cityDate = $("<h4>")
      .addClass("card-title")
      .text(date.toLocaleDateString("en-US"));
    const temperature = $("<p>")
      .addClass("card-text current-temp")
      .text("Temperature: " + tempF + " °F");
    const humidity = $("<p>")
      .addClass("card-text current-humidity")
      .text("Humidity: " + response.main.humidity + "%");
    const wind = $("<p>")
      .addClass("card-text current-wind")
      .text("Wind Speed: " + response.wind.speed + " MPH");
    const image = $("<img>").attr(
      "src",
      "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png"
    );
    // add to page
    city.append(cityDate, image);
    cardBody.append(city, temperature, humidity, wind);
    card.append(cardBody);
    $("#currentCity").append(card);

    // KEVIN HEYYYYY KEVINNNNN :)
    // i made a uvIndex function on line 110 buuuuutttt i cant get it to print on the card
    // right now its functioning the same. it breaks if i try link the uv to the card or move anything around.
    // i havent been able to make the list work besides the first one for some reason. unless i pull lines 128-130 to line 100 BUT no UV or 5 forcast show up.
    // WEIRD right!? ^

    //   * UV index
    // Pulling lon, lat info to uvIndex
    uvIndex(lon, lat);

    function uvIndex(lon, lat) {
      // SEARCHES
      var UVQuery =
        "http://api.openweathermap.org/data/2.5/uvi?" +
        apiKey +
        "&lat=" +
        lat +
        "&lon=" +
        lon;

      $.ajax({
        url: UVQuery,
        method: "GET",
      }).then(function (response) {
        const uvFinal = response.value;
        // then append button with uvFinal printed to it
        $("#currentCity").append(card);
        var badge = $("<div>")
          .addClass(badge)
          .text("UV Index: " + uvFinal);
        $("#currentCity").append(badge);
        // then style uvFinal button with below
        if (uvFinal < 3) {
          // IF RETURN IS 0-2 SYLE GREEN
          badge.attr("class", " badge-pill badge-success");
        } else if (uvFinal < 6) {
          // IF 3-5 STYLE YELLOW
          badge.attr("class", "badge-pill badge-warning");
        } else if (uvFinal < 8) {
          // IF 6-7 STYLE ORANGE
          badge.attr("class", "badge-pill badge-warning");
        } else if (uvFinal < 11) {
          // IF 8-10 STYLE RED
          badge.attr("class", "badge-pill badge-danger");
        } else {
          // IF 11+ STYLE VIOLET
          badge.attr("class", "badge-pill badge-dark");
        }
      });
    }
  }

  function getCurrentForecast() {
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/forecast?q=" + city + apiKey,
      method: "GET",
    }).then(function (response) {
      $("#forecast").empty();

      // variable to hold response.list
      let results = response.list;

      for (let i = 0; i < results.length; i++) {
        let day = Number(results[i].dt_txt.split("-")[2].split(" ")[0]);
        let hour = results[i].dt_txt.split("-")[2].split(" ")[1];

        if (results[i].dt_txt.indexOf("12:00:00") !== -1) {
          // get the temperature and convert to fahrenheit
          let temp = (results[i].main.temp - 273.15) * 1.8 + 32;
          let tempF = Math.floor(temp);

          const card = $("<div>").addClass("card col-md-2 ml-4 text-black");
          const cardBody = $("<div>").addClass("card-body p-3 forecastBody");
          const cityDate = $("<h4>")
            .addClass("card-title")
            .text(moment(results[i].dt_txt).format("MM/DD/YYYY"));
          const temperature = $("<p>")
            .addClass("card-text forecastTemp")
            .text("Temperature: " + tempF + " °F");
          const humidity = $("<p>")
            .addClass("card-text forecastHumidity")
            .text("Humidity: " + results[i].main.humidity + "%");
          const image = $("<img>").attr(
            "src",
            "https://openweathermap.org/img/w/" +
              results[i].weather[0].icon +
              ".png"
          );

          cardBody.append(cityDate, image, temperature, humidity);
          card.append(cardBody);
          $("#forecast").append(card);
        }
      }
    });
  }
});
