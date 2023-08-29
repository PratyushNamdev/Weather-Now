var API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
const userWeatherBtn = document.getElementById('user-weather-btn');
const searchWeatherBtn = document.getElementById('search-weather-btn');
const getAccess = document.querySelector('.get-location-container');
const searchContainer = document.querySelector('.search-container');
const weatherContainer = document.querySelector('.weather-container');
const accessBtn = document.getElementById('allow-location');
const loading = document.querySelector('.loading');
const searchBtn = document.getElementById('search-btn');
const searchBox = document.querySelector('.city-search-box');
const searchValue = document.getElementById('search-value');
const noNet = document.querySelector('.nonet');
const cityNotFound = document.querySelector('.citynotfound');
class NoNetwork extends Error {
    constructor(message) {
      super(message);
      this.name = "No Network";
    }
  }


checkSessionStorage();
let currentTab = userWeatherBtn;
function switchTab(tab){
     if(currentTab === tab){     
        console.log("same") 
        return;
     }
     else if(tab === searchWeatherBtn){
        currentTab = tab;
        searchWeatherBtn.style.textDecoration = 'underline';
        userWeatherBtn.style.textDecoration = 'none';
        getAccess.classList.add('hide');
        weatherContainer.classList.add('hide');
        searchContainer.classList.remove('hide')  
    }
    else if(tab === userWeatherBtn){
        currentTab = tab;
        searchWeatherBtn.style.textDecoration = 'none';     
        userWeatherBtn.style.textDecoration = 'underline';
        searchContainer.classList.add('hide') 
        cityNotFound.classList.add('hide') 
        checkSessionStorage();
     }
}

userWeatherBtn.addEventListener('click' , ()=>{
    switchTab(userWeatherBtn);
})
searchWeatherBtn.addEventListener('click' , ()=>{
    switchTab(searchWeatherBtn);
})

function checkSessionStorage(){
    let localCoordinate = sessionStorage.getItem("coordinates");
   
    if(!localCoordinate){
        getAccess.classList.remove('hide')
    }
    else{
        let coordinates = JSON.parse(localCoordinate);     
        fetchUserWeather(coordinates);
    }
}
function renderdata(data){
    const city = document.querySelector('.city');
    const weatherImg = document.querySelector('.weather-img');
    const temperature = document.querySelector('.temperature'); 
    const weatherType = document.querySelector('.weather-type'); 
    const maxT = document.querySelector('.temp-card-row-1'); 
    const feels = document.querySelector('.temp-card-row-2'); 
    const minT = document.querySelector('.temp-card-row-3');
    const wind = document.querySelector('.cd1'); 
    const humidity = document.querySelector('.cd2'); 
    const clouds = document.querySelector('.cd3');
    const pressure = document.querySelector('.cd4');
   
    if(data?.clouds?.all > 60){
        document.body.style.background = '/img/cloudygif.gif';
    }

    
    city.innerHTML = data?.name;
    weatherImg.src = `https://openweathermap.org/img/w/${data?.weather[0]?.icon}.png`;
    temperature.innerHTML = `${data?.main?.temp}`;
    weatherType.innerHTML = data?.weather[0].description;
    maxT.innerHTML= `Max Temperature : ${data?.main.temp_max} °C`;
    feels.innerHTML=`Feels Like : ${data?.main?.feels_like} °C`;
    minT.innerHTML = `Min Temperature : ${data?.main?.temp_min} °C`;
    wind.innerHTML = `WIND-SPEED  <br> ${data?.wind?.speed} m/s` ;
    humidity.innerHTML = `HUMIDITY <br> ${data?.main?.humidity} %`;
    clouds.innerHTML = `CLOUDS <br> ${data?.clouds?.all} %`;
    pressure.innerHTML = `PRESSURE <br> ${data?.main?.pressure} hPa`
    weatherContainer.classList.remove('hide');
}
async function fetchUserWeather(coordinates){
    const {lat , lon} = coordinates;
    getAccess.classList.add('hide');
    loading.classList.remove('hide');
    
    try{
        if(!navigator.onLine){
           throw new error("NO INTERNET");
        }
        var data = await fetch( `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        data = await data.json();
        if(!data?.sys){
            throw data;
        }
        loading.classList.add('hide');
        renderdata(data);
        


    }catch(e){
        loading.classList.add('hide');
        noNet.classList.remove('hide');
    }
}
async function fetchSearchWeather(city){
    loading.classList.remove('hide');
    cityNotFound.classList.add('hide');
    try{
        if(!navigator.onLine){
            throw new NoNetwork("No Network");
         }
       

        let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
     
        let data = await response.json();
        console.log(data);
        if(!data?.sys){
            throw data;
        }

        loading.classList.add('hide');
        renderdata(data);
    }
    catch(e){
        loading.classList.add('hide');
        if( e instanceof NoNetwork){
            noNet.classList.remove('hide');
        }
        else{
            cityNotFound.classList.remove('hide');
            weatherContainer.classList.add('hide')
        }
    }
    
}

accessBtn.addEventListener('click' , ()=>{
        getLocation();
})

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else{
        alert("No Geolocation Support Available");
    }
}

function showError(error) {
    let description = document.querySelector('.get-location-description')
    switch(error?.code){
      case 1: 
        description.innerText = "You denied the request for Geolocation.";
        description.style.color = 'red';
        break;
        case 2:
        description.innerText = "Request Timeout !"
        description.style.color = 'red';
        break ;
        case 3:
        description.innerText = "An Unknown Error Occured ..."
        description.style.color = 'red';
    }
  }
  
  function showPosition(position) {
    const userCoordinates = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    sessionStorage.setItem("coordinates", JSON.stringify(userCoordinates));
    fetchUserWeather(userCoordinates);
  }

  searchBtn.addEventListener('click' ,()=>renderInput() );
  searchValue.addEventListener('keypress' , (Event)=>{
    if(Event.key === 'Enter'){
        Event.preventDefault();
        renderInput();
    }
  })
  function renderInput(){
  
    let inputCity = searchBox.value;
    if(inputCity == ""){
        return;
    }
    else{
        fetchSearchWeather(inputCity);
        searchBox.value = "";
    }
  
  }
