import { useEffect, useState } from 'react'
import 'semantic-ui-css/semantic.min.css'
// Using some semantic-ui-react components for styling, so import the ones we used.
import { Segment, Card, Label, LabelDetail, Icon } from 'semantic-ui-react';
import './App.css';

// API configuration
const API_TOKEN = "97b936d4-e681-4890-bc79-5d58010ea333";
const STATION_ID = "81414";

// Build the API URL with all required parameters
const API_URL = `https://swd.weatherflow.com/swd/rest/better_forecast?station_id=${STATION_ID}&token=${API_TOKEN}&units_temp=f&units_wind=mph&units_pressure=inhg&units_precip=in&units_distance=mi&units_other=imperial`;

// Current Conditions Component - shows current weather
function CurrentConditions(props) {
  const current = props.current;
  const location = props.location;

    console.log('Current conditions dataaa:', current);  // ← Add this to see what's available

  
  const now = new Date(current.time * 1000);
  const dateString = now.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  
  return (
    <Card>
      <Segment>
        <Label attached="top" color='black'>
          {location} - {dateString} - {timeString}
        </Label>
        
        <div className="current-temp">
          <Icon name="thermometer" />
          {current.air_temperature}°F
        </div>

        <div className="current-info-item-container"> 
          <div className="current-info-item">
            <Icon name="rain" />
            <strong>Precipitation:</strong> {current.precip_probability || 0}% chance
          </div>
          
          <div className="current-info-item">
            <Icon name="arrow alternate circle right" />
            <strong>Wind Speed:</strong> {Math.round(current.wind_avg)} mph
          </div>
          
          <div className="current-info-item">
            <Icon name="tachometer alternate" />
            <strong>Pressure:</strong> {current.sea_level_pressure} inHg
          </div>
          
          <div className="current-info-item">
            <Icon name="bolt" />
            <strong>Last Lightning:</strong> {current.lightning_strike_last_distance 
              ? `${current.lightning_strike_last_distance} mi away` 
              : 'None detected'}
          </div>
        </div>
      </Segment>
    </Card>
  );
}

// This React Component will show a single days weather forecast using data from the tempest weather API
function DayTile(props) {
    // The API returns epoch times in seconds, convert to milliseconds for JS Date
    const dayStart = new Date(props.forecast.day_start_local * 1000);
    // Show short form of date as title for the tile.
    const dayString = dayStart.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    // Longer version of these
    const sunrise = new Date(props.forecast.sunrise * 1000).toLocaleTimeString('en-US');
    const sunset = new Date(props.forecast.sunset * 1000).toLocaleTimeString('en-US');

  const getWeatherIcon = (conditions) => {
  const lower = conditions.toLowerCase();
  const currentHour = dayStart.getHours();
  const isNightTime = currentHour < 6 || currentHour > 18;  // Night between 6pm-6am
  
  if (lower.includes('snow')) {
    return './weather-icons/snow.svg';
  } else if (lower.includes('rain') || lower.includes('drizzle')) {
    return './weather-icons/overcast-rain.svg';
  } else if (lower.includes('cloud') || lower.includes('overcast')) {
    return './weather-icons/overcast.svg';
  } else if (lower.includes('clear') || lower.includes('sunny')) {
    return isNightTime ? './weather-icons/clear-night.svg' : './weather-icons/clear-day.svg';
  } else if  (lower.includes('thunder')) {
    return './weather-icons/thunderstorms.svg';
  } else {
    return './weather-icons/clear-day.svg';  // Default
  }
};


    // The "blank" used blow as {" "} is just used to add a space in JSX
    return (
        <Card>
            <Segment>
                <Label attached="top" color='black'> {dayString} </Label>

        {/* Weather icon */}
        <img 
          src={getWeatherIcon(props.forecast.conditions)} 
          alt={props.forecast.conditions}
          className="weather-icon-img"
        />

                <Icon name="thermometer" />
                <span className="nowrap"><Icon name="arrow up" />{props.forecast.air_temp_high}°F </span>
                <span className="nowrap"><Icon name="arrow down" />{props.forecast.air_temp_low}°F</span>
                <div><Label size='small' horizontal>
                    <LabelDetail>{props.forecast.conditions}</LabelDetail> {" "}
                </Label></div>
                {props.forecast.precip_probability > 0 ? (
                    <p> {props.forecast.precip_probability}% chance of {props.forecast.precip_type}</p>
                ) : <p> No precipitation </p>}
                <span className="nowrap"><Icon name="sun" /> {sunrise} </span>
                <span className="nowrap"><Icon name="moon" /> {sunset}</span>
            </Segment>
        </Card>
    );
}

function App() {
  const [weatherData, setWeatherData] = useState(null);

  // Call the API and fetch weather data
  const fetchWeatherData = () => {
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        console.log(data); // Show the fetched data in the console
        setWeatherData(data); // Store the data
      })
      .catch(error => console.error("Error fetching weather data:", error));
  }

  // Fetch weather data when the component loads
  useEffect(() => {
    fetchWeatherData();
  }, []); // Empty dependency array means this runs once on load
    
    // Display the data (for now, just show if we got it)
  return (
    <>
    {/* Background GIF layer */}
    <div className="background-gif" />

    {/* Dark overlay */}
    <div className="background-overlay" />

    <div className='app-container'>
      <div className='main-header'>
        <h1 className='main-title'>Tempest Weather React</h1>
        <button className="refresh-button" onClick={fetchWeatherData}>
          <Icon name="refresh" />
        </button>
      </div>

      {weatherData ? (
        <div>
          {/* Current day - First container */}
          <div className='current-conditions'>
            <h2>Current Conditions</h2>
            <CurrentConditions
              current={weatherData.current_conditions}
              location={weatherData.location_name}
            />
          </div>

          {/* 10 Day Forecast - Second container */}
          <div className='ten-day-forecast'>
            <h2>10 Day Forecast</h2>
            <div className='ten-grid'>
              {weatherData.forecast.daily.slice().map((day, index) => (
                <DayTile key={index} forecast={day} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className='loading'>Loading...</p>
      )}
    </div>
    </>
  );
}

export default App
