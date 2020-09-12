document.getElementById("bnt_go").addEventListener("click", function() {
  var inputVal = document.getElementById("search").value;
  let text;
  if (inputVal === ""){
    text = "New York";
  } else {
    text = inputVal;
  }
  start(text);
});

let start = async (text = 'new york') => {
  function storageAvailable(type) {
    var storage;
    try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch (e) {
      return e instanceof DOMException && (
        e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        (storage && storage.length !== 0);
    }
  }


  let url = `https://api.openweathermap.org/data/2.5/weather?q=${text}&appid=8d9dc7032044000e2c81cc8834645ad7`;

  let weatherApiResponse = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data
  }
  const getImg = async (icon) => {
    let imgUrl = `https://openweathermap.org/img/wn/` + icon + `@2x.png`;
    const response1 = await fetch(imgUrl);
    const imgSrc = response1.url;
    console.log(imgSrc);
    return imgSrc;
  }

  try {
    let cInfo = await weatherApiResponse(url);
    let {coord, name} = cInfo;
    let {lon, lat} = coord;
    let onecallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly&appid=8d9dc7032044000e2c81cc8834645ad7`
    let info = await weatherApiResponse(onecallUrl);

    let { current, daily } = info;
    
    const { weather, temp, dt, feels_like} = current;
    const { description, main, icon } = weather[0];

    const iconResult = await getImg(icon);

    var time = new Date(dt * 1000).toLocaleTimeString();
    var allDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var d = new Date(dt * 1000);
    var dayName = allDays[d.getDay()];
    let currentDate = dayName + " " + time;
    
    let currentWeatherInfo = {
      temp: temp,
      feels_like: feels_like,
      currentTime: currentDate,
      main: main,
      cityName: name,
      description: description,
      imgSrc: iconResult
    }
    let result = JSON.stringify(currentWeatherInfo);
    localStorage.setItem("weather", result);

    daily.forEach((element) => {
      let createForcast = async function () {

        const { dt, feels_like, weather } = element;
        const { day, eve } = feels_like;
        const { main, icon } = weather[0];
        const iResult = await getImg(icon);

        let dailyWeather = {
          ddt: dt,
          dday: day,
          devening: eve,
          dmain: main,
          dicon: iResult
        }

        if (storageAvailable('localStorage')) {
          let dailyResult = JSON.stringify(dailyWeather);
            localStorage.setItem("weeklyWeather", dailyResult);
            let dailyWeatherApi = JSON.parse(localStorage.getItem('weeklyWeather'));
            console.log(dailyWeatherApi);
            const { ddt, dday, devening, dmain, dicon } = dailyWeatherApi;
  
            const daysWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            let ddays = new Date(ddt * 1000);
            let dayNames = daysWeek[ddays.getDay()];
  
            let dailylist = document.getElementById('forcast');
            dailylist.innerHTML += `
          <p style="background-color:#fff; border-bottom-style: solid; border-bottom-color: rgba(68, 227, 255, 0.829); margin:15px auto; width:70% border-bottom: blue; border-radius:3px;">
          <span style="font-size:70%; padding:0px 5%; width=30vw;"> ${dayNames} </span>
          <span style="font-size:60%; padding:0px 5%; width=30vw;"> ${dday}&#8451/${devening}&#8451 </span>
          <span style="padding:0px 5%; width=30vw;"><img src='${dicon}' alt='Weather Icon' style= "width:20px;" ></span>
          <span style="font-size:70%; padding:0px 5%; width=30vw;"> ${dmain} </span>
          </p>`;
  
            /* if (dmain === 'rain' || 'storm') {
              let el = document.createElement('p').innerHTML = 'EVENT CANCELLED';
              let div = document.getElementById("foo");
              el.appendAfter(div);
            } else {
              document.createElement('p').innerHTML = 'EVENT IN SESSION';
              let div = document.getElementById("foo");
              el.appendAfter(div);
            } */
        }
        else {
          console.log(":( sorry storage not available!");
        }
      }
      createForcast();
    });
  }
  catch (e) {
    console.log('NETWORK ERROR!');
  }
  finally {
    let forCurrentStorage = function () {
      if (storageAvailable('localStorage')) {

        let weatherApi = JSON.parse(localStorage.getItem('weather'));
        console.log(weatherApi);
        const { cityName, main, description, imgSrc, temp, feels_like, currentTime } = weatherApi;

        document.getElementById('icon').innerHTML = `<img src='${imgSrc}' alt='Weather Icon'>`;
        document.getElementById('info').innerHTML = description;
        document.getElementById('date').innerHTML = currentTime;
        document.getElementById('temp').innerHTML = `It Feels Like ${feels_like}&#8451`;
        document.getElementById('mmtemp').innerHTML = `${temp}&#8451`;
        document.getElementById('location').innerHTML = cityName;
        document.getElementById('main').innerHTML = main;

        document.getElementById('icon').style.width = "100px";
        document.getElementById('icon').style.margin = "15px auto";
        document.getElementById('location').style.textAlign = "center";
        document.getElementById('location').style.fontSize = "1.5em";
        document.getElementById('location').style.fontWeight = "bold";
        document.getElementById('location').style.margin = "5px auto";
        document.getElementById('location').style.color = "rgb(27, 29, 29)";
        document.getElementById('main').style.fontSize = "1.2em";
        document.getElementById('main').style.textAlign = "center";
        document.getElementById('main').style.margin = "5px auto";
        document.getElementById('info').style.fontSize = "1.1em";
        document.getElementById('info').style.textAlign = "center";
        document.getElementById('info').style.margin = "5px auto";
        document.getElementById('date').style = "";
        document.getElementById('date').style.textAlign = "center";
        document.getElementById('date').style.margin = "5px auto";
        document.getElementById('temp').style = "";
        document.getElementById('temp').style.textAlign = "center";
        document.getElementById('temp').style.margin = "5px auto";
        document.getElementById('mmtemp').style = "";
        document.getElementById('mmtemp').style.textAlign = "center";
        document.getElementById('mmtemp').style.margin = "5px auto";


      }
      else {
        alert(":( sorry storage not available!")
      }
    }
    forCurrentStorage();
    console.log('finally');
  }

};
start();