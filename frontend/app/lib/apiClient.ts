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

  console.log("FINAL URL:", `${API_URL}${url}`)

  const data = await res.json()

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }

    throw new Error(data.message || "API Error")
  }

  return data
}