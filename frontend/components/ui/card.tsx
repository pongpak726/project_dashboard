export function Card({ title, value, color }: any) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 text-center border hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{title}</p>

      <p className={`text-3xl font-bold mt-2 ${color}`}>
        {value}
      </p>
    </div>
  )
}