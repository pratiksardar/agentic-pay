/**
 * RealAPIService - Calls real APIs from free-apis.github.io
 */

const axios = require('axios');

class RealAPIService {
  /**
   * Call a real API endpoint
   * @param {string} endpoint - API endpoint identifier
   * @param {string} apiKey - User's API key (for tracking)
   * @returns {Promise<Object>} API response
   */
  async callAPI(endpoint, apiKey) {
    try {
      switch (endpoint) {
        case '/api/quotes':
          return await this.getRandomQuote();
        
        case '/api/jokes':
          return await this.getRandomJoke();
        
        case '/api/facts':
          return await this.getRandomFact();
        
        case '/api/dog-facts':
          return await this.getDogFact();
        
        case '/api/cat-facts':
          return await this.getCatFact();
        
        case '/api/bored':
          return await this.getBoredActivity();
        
        case '/api/ip-geo':
          return await this.getIPGeolocation();
        
        case '/api/weather':
          return await this.getWeather();
        
        default:
          throw new Error(`Unknown API endpoint: ${endpoint}`);
      }
    } catch (error) {
      console.error(`Error calling ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Get random quote from quotable.io
   */
  async getRandomQuote() {
    try {
      const response = await axios.get('https://api.quotable.io/random', {
        timeout: 5000,
      });
      return {
        quote: response.data.content,
        author: response.data.author,
        tags: response.data.tags,
        length: response.data.length,
      };
    } catch (error) {
      // Fallback if API is down
      return {
        quote: 'The only way to do great work is to love what you do.',
        author: 'Steve Jobs',
        tags: ['inspirational'],
        length: 52,
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get random joke from official-joke-api
   */
  async getRandomJoke() {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke', {
        timeout: 5000,
      });
      return {
        setup: response.data.setup,
        punchline: response.data.punchline,
        type: response.data.type,
      };
    } catch (error) {
      return {
        setup: 'Why did the programmer quit his job?',
        punchline: 'He didn\'t get arrays!',
        type: 'programming',
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get random fact from uselessfacts.jsph.pl
   */
  async getRandomFact() {
    try {
      const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en', {
        timeout: 5000,
      });
      return {
        fact: response.data.text,
        source: response.data.source,
        source_url: response.data.source_url,
      };
    } catch (error) {
      return {
        fact: 'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!',
        source: 'Fallback',
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get dog fact from dog-api.kinduff.com
   */
  async getDogFact() {
    try {
      const response = await axios.get('https://dog-api.kinduff.com/api/facts', {
        timeout: 5000,
      });
      return {
        facts: response.data.facts,
        success: response.data.success,
      };
    } catch (error) {
      return {
        facts: ['Dogs have a sense of time and can tell when it\'s time for dinner or a walk.'],
        success: true,
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get cat fact from catfact.ninja
   */
  async getCatFact() {
    try {
      const response = await axios.get('https://catfact.ninja/fact', {
        timeout: 5000,
      });
      return {
        fact: response.data.fact,
        length: response.data.length,
      };
    } catch (error) {
      return {
        fact: 'Cats have five toes on their front paws, but only four on their back paws.',
        length: 68,
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get activity suggestion from boredapi.com
   */
  async getBoredActivity() {
    try {
      const response = await axios.get('https://www.boredapi.com/api/activity', {
        timeout: 5000,
      });
      return {
        activity: response.data.activity,
        type: response.data.type,
        participants: response.data.participants,
        price: response.data.price,
        accessibility: response.data.accessibility,
      };
    } catch (error) {
      return {
        activity: 'Learn a new programming language',
        type: 'education',
        participants: 1,
        price: 0,
        accessibility: 0.1,
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get IP geolocation from ipapi.co
   */
  async getIPGeolocation() {
    try {
      // Get user's IP (in production, this would come from request)
      const response = await axios.get('https://ipapi.co/json/', {
        timeout: 5000,
      });
      return {
        ip: response.data.ip,
        city: response.data.city,
        region: response.data.region,
        country: response.data.country_name,
        latitude: response.data.latitude,
        longitude: response.data.longitude,
        timezone: response.data.timezone,
      };
    } catch (error) {
      return {
        ip: '127.0.0.1',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        note: 'Fallback data (API unavailable)',
      };
    }
  }

  /**
   * Get weather data (mock for now, can integrate OpenWeatherMap)
   */
  async getWeather() {
    // This would integrate with OpenWeatherMap API
    // For now, return mock data
    return {
      location: 'San Francisco, CA',
      temperature: 72,
      condition: 'Sunny',
      humidity: 65,
      windSpeed: 8,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new RealAPIService();

