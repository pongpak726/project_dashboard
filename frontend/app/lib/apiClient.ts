export const apiClient = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token")
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || "API Error")
  }

  return data
}