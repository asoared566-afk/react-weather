import logo from '../assets/images/logo.svg'
import unit from '../assets/images/icon-units.svg'
import dropdown from '../assets/images/icon-dropdown.svg'
import snow from '../assets/images/icon-snow.webp'
import sunny from '../assets/images/icon-sunny.webp'
import drizzle from '../assets/images/icon-drizzle.webp'
import fog from '../assets/images/icon-fog.webp'
import overcast from '../assets/images/icon-overcast.webp'
import partlyCloudy from '../assets/images/icon-partly-cloudy.webp'
import rain from '../assets/images/icon-rain.webp'
import storm from '../assets/images/icon-storm.webp'
import errors from '../assets/images/icon-error.svg'
import retry from '../assets/images/icon-retry.svg'

import { useState } from 'react';

export function Weather() {

    const [selectedDay, setSelectedDay] = useState(0)
    const [units, setUnits] = useState('C'); 
    const [weather, setWeather] = useState(null);
    const [available, setAvailable] = useState(false);
    const [location, setLocation] = useState("");
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [long, setLong] = useState('mm')
    const [speed, setSpeed] = useState('km/h')

    const [isLoading, setIsLoading] = useState(false)

    function formatTemp(temp) {
        if (temp === undefined || temp === null) return '';
        if (units === 'F') {
            return Math.round((temp * 9 / 5) + 32);
        }
        return Math.round(temp);
    }

    function convertSpeed(change) {
        if (speed === 'mph') {
            return Math.round(change * 0.621371);
        }
        return Math.round(change)

    }

    function changeLength(leng) {
        if (long === 'mm') {
            return Math.round(leng / 25.4)
        }
            return Math.round(leng)
    }

    function weatherIcon(code) {
        if (code === 0) return sunny;

        if (code === 1 || code === 2) return partlyCloudy;

        if (code === 3) return overcast;

        if (code === 45 || code === 48) return fog;

        if (code >= 51 && code <= 57) return drizzle;

        if (code >= 61 && code <= 67) return rain;

        if (code >= 71 && code <= 77) return snow;

        if (code >= 80 && code <= 82) return rain;

        if (code >= 85 && code <= 86) return snow;

        if (code >= 95 && code <= 99) return storm;
    }

    async function search() {

        setIsLoading(true)
        setError(null);

        try {
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
            );
            const geoData = await geoResponse.json();


            if (!geoData.results || geoData.results.length === 0) {
                setError("City not found. Please check spelling and try again.");
                setWeather(null)
                setAvailable(true)
                return;
            }

            const { latitude, longitude } = geoData.results[0];


            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&current=temperature_2m,weather_code,relative_humidity_2m,apparent_temperature,wind_speed_10m,precipitation&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`);

            if (!response.ok) throw new Error("Failed to fetch weather data.");

            const data = await response.json();
            setWeather({ ...data, cityName: location });
            setError('')

        } catch (error) {
            console.error(error)

        }finally{
            setIsLoading(false)
        }


    }


    function restart() {
        setWeather(null)
        setAvailable(false)
        setLocation('')
    }



    return (
        <div className='container'>

            <header>
                <img src={logo} alt="" />

                <div
                    onClick={() => setIsOpen(p => !p)}
                    className='units'>
                    <img src={unit} alt="" />
                    <span>units</span>
                    <img src={dropdown} alt="" />
                </div>

                {isOpen && (
                    <div className='unit-parts'>

                        <h3>Switch to Imperial/Metric</h3>

                        <div>
                            <p>Temperature</p>
                            <div className='adjust borders'>
                                <span onClick={(() => setUnits('C'))}
                                >
                                    Celsius (°C)
                                </span>
                                <span
                                    onClick={() => setUnits('F')}
                                >
                                    Fahrenheit (°F)
                                </span>
                            </div>
                        </div>

                        <div>
                            <p>Wind Speed</p>
                            <div className='adjust borders'>
                                <span onClick={() => setSpeed('km/h')}>km/h</span>
                                <span onClick={() => setSpeed('mph')}>mph</span>
                            </div>
                        </div>

                        <div>
                            <p>Precipitation</p>
                            <div className='adjust'>
                                <span onClick={() => setLong('mm')}>Millimeters (mm)</span>
                                <span onClick={() => setLong('in')}>Inches (in)</span>
                            </div>
                        </div>

                    </div>
                )}


            </header>

            <div className='text-div'>

                <div className={available ? 'hidden' : ''}>
                    <h1>How's the sky looking today?</h1>

                    <div className='text-btn'>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            type="text"
                            placeholder='Search for a city, e.g., New York'
                        />
                        <button onClick={search}>Search</button>
                    </div>
                </div>

                <div className={available ? 'error-retry' : 'hidden'}>
                    <img src={errors} alt="" />
                    <h1>Somthing Went Wrong</h1>
                    <span>{error}</span>
                    <button onClick={restart}><img src={retry} alt="" /> Retry</button>
                </div>


            </div>

             

            {isLoading && (
                <div className='loading'>
                    <h1 className='loading-h1'>PLEASE WAIT A SECOND..</h1>
                </div>
                
            )}

            <div className={weather == null ? 'hidden' : 'main-grid'}>

                <div>

                    <div className='top-grid'>


                        <div className='weather'>

                            <div>
                                <h1>{weather?.cityName}</h1>
                                <small>
                                    {weather?.daily?.time[0] &&
                                        new Date(weather.daily.time[0]).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                    }

                                </small>
                            </div>
                            <div className='temp-icon'>
                                <img src={weather?.current?.weather_code !== undefined
                                    ? weatherIcon(weather.current.weather_code)
                                    : undefined}
                                    alt=""
                                />
                                <h1>{formatTemp(weather?.current?.temperature_2m)}°{units}</h1>
                            </div>
                        </div>

                        <div className='divs'>
                            <span className='weather-parts'>Feels Like</span>
                            <span className='results'>{formatTemp(weather?.current?.apparent_temperature)}°{units}</span>
                        </div>

                        <div className='divs'>
                            <span className='weather-parts'>humidity</span>
                            <span className='results'>{weather?.current?.relative_humidity_2m}%</span>
                        </div>

                        <div className='divs'>
                            <span className='weather-parts'>Wind</span>
                            <span className='results'>{convertSpeed(weather?.current?.wind_speed_10m)}{speed}</span>
                        </div>

                        <div className='divs'>
                            <span className='weather-parts'>Precipitation</span>
                            <span className='results'>{changeLength(weather?.current?.precipitation)} {long}</span>
                        </div>

                    </div>


                    <div className='btm-grid'>
                        <h2>Daily forecast</h2>
                        <div className='grids'>

                            {weather?.daily?.time.map((date, i) => (
                                <div key={date} className='grid-divs'>
                                    <p>{new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'short'
                                    })}</p>
                                    <img src={weatherIcon(weather.daily.weather_code[i])} alt="" />
                                    <div>
                                        <span>{formatTemp(weather.daily.temperature_2m_max[i])}°{units}</span>
                                        <span className='temp-min'>{formatTemp(weather.daily.temperature_2m_min[i])}°{units}</span>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>

                </div>

                <div className='side-grid'>

                    <div className='tops'>
                        <h3>Hourly forecast</h3>
                        <div className='week'>
                            <select value={selectedDay}
                                onChange={(e) => setSelectedDay(Number(e.target.value))}
                            >
                                {weather?.daily?.time.map((date, i) => (
                                    <option className='options' key={date} value={i}>
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long'
                                        })}
                                    </option>
                                ))}
                            </select>
                            {/*<img src={dropdown} alt="" />*/}
                        </div>
                    </div>


                    {weather?.hourly?.time
                        .slice(selectedDay * 24, selectedDay * 24 + 8)
                        .map((date, i) => {

                            const hourIndex = selectedDay * 24 + i;

                            return (
                                <div key={date} className='time-weather'>
                                    <div>
                                        <img
                                            src={weatherIcon(
                                                weather.hourly.weather_code[hourIndex]
                                            )}
                                            alt=""
                                        />

                                        <h2>
                                            {new Date(date).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                hour12: true
                                            })}
                                        </h2>
                                    </div>

                                    <span>
                                        {formatTemp(weather.hourly.temperature_2m[hourIndex])}°{units}
                                    </span>
                                </div>
                            );
                        })}


                </div>

            </div>

        </div>
    )
}