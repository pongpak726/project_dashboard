// services/weather.service.js
const axios = require("../utils/axios");

const getWeather = async (city) => {
  try {
    const response = await axios.get("/api/v1/weather?site_name=bangkok_01&limit=10", {
      params: { city },
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error("External API responded with error");
    } else if (error.request) {
      throw new Error("No response from external API");
    } else {
      throw new Error("Request setup error");
    }
  }
};

module.exports = { getWeather };