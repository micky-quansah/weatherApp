const elements = {
  form: document.querySelector('#search-form'), search: document.querySelector('#search'), status: document.querySelector('#status'), content: document.querySelector('#weather-content'),
  location: document.querySelector('#location'), date: document.querySelector('#date'), main: document.querySelector('#main'), info: document.querySelector('#info'), icon: document.querySelector('#icon'), temp: document.querySelector('#temp'), feelsLike: document.querySelector('#feels-like'), forecast: document.querySelector('#forecast')
};

const conditions = { 0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'], 45: ['Foggy', '🌫️'], 48: ['Rime fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'], 56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'], 61: ['Slight rain', '🌦️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 66: ['Freezing rain', '🌧️'], 67: ['Heavy freezing rain', '🌧️'], 71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '🌨️'], 80: ['Rain showers', '🌦️'], 81: ['Rain showers', '🌧️'], 82: ['Heavy showers', '⛈️'], 85: ['Snow showers', '🌨️'], 86: ['Heavy snow showers', '❄️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️'] };
const conditionFor = code => conditions[code] || ['Unknown conditions', '🌡️'];
const atNoon = date => new Date(`${date}T12:00:00`);

async function request(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.reason || 'Unable to load weather right now.');
  return data;
}
function setStatus(message, type = '') { elements.status.textContent = message; elements.status.className = `status ${type}`; }

function renderCurrent(place, weather) {
  const current = weather.current;
  const [description, icon] = conditionFor(current.weather_code);
  elements.location.textContent = [place.name, place.country_code].filter(Boolean).join(', ');
  elements.date.textContent = atNoon(current.time).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  elements.main.textContent = description;
  elements.info.textContent = current.is_day ? 'Daytime conditions' : 'Night-time conditions';
  elements.icon.textContent = icon;
  elements.temp.textContent = Math.round(current.temperature_2m);
  elements.feelsLike.textContent = `Feels like ${Math.round(current.apparent_temperature)}°`;
}

function renderForecast(daily) {
  elements.forecast.replaceChildren();
  daily.time.slice(0, 5).forEach((date, index) => {
    const [description, icon] = conditionFor(daily.weather_code[index]);
    const item = document.createElement('article');
    item.className = 'forecast-day';
    item.innerHTML = `<p class="forecast-date">${atNoon(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p><span class="forecast-icon" role="img" aria-label="${description}">${icon}</span><p class="forecast-condition">${description}</p><p class="forecast-temp"><strong>${Math.round(daily.temperature_2m_max[index])}°</strong><span>${Math.round(daily.temperature_2m_min[index])}°</span></p>`;
    elements.forecast.append(item);
  });
}

async function loadWeather(city) {
  const cleanCity = city.trim();
  if (!cleanCity) return;
  setStatus('Loading weather…', 'loading'); elements.content.hidden = true;
  try {
    const search = await request(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: cleanCity, count: '1', language: 'en', format: 'json' })}`);
    const place = search.results?.[0];
    if (!place) throw new Error('We could not find that city. Try a city and country, for example “Accra, Ghana”.');
    const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, timezone: 'auto', current: 'temperature_2m,apparent_temperature,weather_code,is_day', daily: 'weather_code,temperature_2m_max,temperature_2m_min', forecast_days: '5' });
    const weather = await request(`https://api.open-meteo.com/v1/forecast?${params}`);
    renderCurrent(place, weather); renderForecast(weather.daily); elements.content.hidden = false; setStatus('');
    localStorage.setItem('weatherly-last-city', cleanCity);
  } catch (error) { setStatus(error.message, 'error'); }
}
elements.form.addEventListener('submit', event => { event.preventDefault(); loadWeather(elements.search.value); });
const savedCity = localStorage.getItem('weatherly-last-city') || 'Accra';
elements.search.value = savedCity;
loadWeather(savedCity);
