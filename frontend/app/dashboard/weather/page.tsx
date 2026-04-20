type StationData = {
  id: string;
  device: string;
  pm25: number;
  temperature: number;
  humidity: number;
  updatedAt: string;
};

const data: StationData[] = [
  {
    id: "bangkok_01",
    device: "weather-station-001",
    pm25: 44,
    temperature: 37.5,
    humidity: 42,
    updatedAt: "20/4/2569 14:00:01",
  },
];

function PM25Badge({ value }: { value: number }) {
  const color =
    value <= 25
      ? "bg-green-100 text-green-800"
      : value <= 50
      ? "bg-yellow-300 text-yellow-900"
      : "bg-red-400 text-red-900";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {value} μg/m³
    </span>
  );
}


export default function WeatherPage() {
  return (
    <div className="text-black text-[100px]">
      {/* <div className="text-center font-bold text-2xl pt-2 pb-4">Weather</div> */}

      <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mt-4 mx-4">
        <table className="w-full text-sm border-collapse">
          <thead >
            <tr className="border-b border-gray-200 bg-blue-500 ">
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">Location</th>
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">Device</th>
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">PM2.5</th>
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">Temperature</th>
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">Humidity</th>
              <th className="text-left text-lg px-4 py-2 font-semibold text-white">Update time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="px-4 py-3 font-medium">{row.id}</td>
                <td className="px-4 py-3">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {row.device}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PM25Badge value={row.pm25} />
                </td>
                <td className="px-4 py-3">{row.temperature.toFixed(2)}°C</td>
                <td className="px-4 py-3">{row.humidity}%</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{row.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}