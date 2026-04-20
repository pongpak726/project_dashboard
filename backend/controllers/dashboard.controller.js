// "site_name": "bangkok_01",              // string: รหัสสถานที่
//   "device_id": "device_01",               // string: รหัสอุปกรณ์
//   "latitude": 13.7563,                    // number: ละติจูด
//   "longitude": 100.5018,                  // number: ลองจิจูด
//   "timestamp": "2025-10-09T11:05:33.412Z", // string (ISO 8601): เวลาที่วัดข้อมูล
//   "weather": {
//     "temp_c": 34.2,                      // number: อุณหภูมิ (°C)
//     "humidity_pct": 67,                  // number: ความชื้นสัมพัทธ์ (%)
//     "pm25_ugm3": 28,                     // number: ฝุ่น PM2.5 (µg/m³)
//     "rain_mm": 0.0,                      // number: ปริมาณฝน (mm)
//     "wind_kph": 12.3,                    // number: ความเร็วลม (km/h)
//     "wind_dir_deg": 140                  // number: ทิศทางลม (องศา)

// controllers/weather.controller.js
const { getWeather } = require("../services/weather.service");

const weatherController = async (req, res) => {
  try {
    const { city } = req.query;

    const data = await getWeather(city);

    res.json({
      city,
      site_name: data.site_name,
      temperature: data.temp,
      condition: data.weather,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { weatherController };