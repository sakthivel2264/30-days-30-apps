import React, { useState, useEffect } from 'react';

interface Weather {
  temperature: number;
  description: string;
  city: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

const App: React.FC = () => {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get weather by city name
  const getWeather = async (cityName: string) => {
    if (!cityName.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Get city coordinates
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error('City not found');
      }
      
      const { latitude, longitude, name, country } = geoData.results[0];
      
      // Get weather data
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const weatherData = await weatherResponse.json();
      
      // Weather code to description mapping (simplified)
      const getWeatherDescription = (code: number) => {
        if (code === 0) return { desc: 'Clear sky', icon: '☀️' };
        if (code <= 3) return { desc: 'Partly cloudy', icon: '⛅' };
        if (code <= 48) return { desc: 'Foggy', icon: '🌫️' };
        if (code <= 67) return { desc: 'Rainy', icon: '🌧️' };
        if (code <= 77) return { desc: 'Snowy', icon: '❄️' };
        if (code <= 82) return { desc: 'Showers', icon: '🌦️' };
        return { desc: 'Stormy', icon: '⛈️' };
      };
      
      const weatherInfo = getWeatherDescription(weatherData.current.weather_code);
      
      setWeather({
        temperature: Math.round(weatherData.current.temperature_2m),
        description: weatherInfo.desc,
        city: `${name}, ${country}`,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        icon: weatherInfo.icon
      });
      
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
    }
    
    setLoading(false);
  };

  // Load default city on start
  useEffect(() => {
    getWeather('Chennai');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getWeather(city);
  };

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🌤️ Weather App
        </h1>
        
        {/* Search */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {/* Weather Display */}
        {weather && !loading && (
          <div className="text-center">
            <div className="text-4xl mb-2">{weather.icon}</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {weather.city}
            </h2>
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {weather.temperature}°C
            </div>
            <div className="text-gray-600 mb-4">
              {weather.description}
            </div>
            
            {/* Simple stats */}
            <div className="flex justify-around text-sm text-gray-600">
              <div>
                <div>Humidity</div>
                <div className="font-semibold">{weather.humidity}%</div>
              </div>
              <div>
                <div>Wind</div>
                <div className="font-semibold">{weather.windSpeed} km/h</div>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center">
            <div className="text-2xl">🔄</div>
            <div>Loading weather...</div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
