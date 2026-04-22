let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

const processQueue = (token: string) => {
  refreshQueue.forEach(cb => cb(token))
  refreshQueue = []
}

export const apiClient = async (
  url: string,
  options: RequestInit = {}
) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL

  let accessToken = localStorage.getItem("accessToken")

  const makeRequest = (token: string | null) =>
    fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.headers
      }
    })

  let res = await makeRequest(accessToken)

  // ✅ ถ้า token ยังใช้ได้
  if (res.status !== 401) {
    return res.json()
  }

  // 🚨 ถ้า 401 → refresh flow
  const refreshToken = localStorage.getItem("refreshToken")

  if (!refreshToken) {
    localStorage.clear()
    window.location.href = "/login"
    return
  }

  // 🔥 ป้องกันยิง refresh ซ้ำหลายครั้ง
  if (isRefreshing) {
    return new Promise(resolve => {
      refreshQueue.push(async (newToken: string) => {
        const retryRes = await makeRequest(newToken)
        resolve(retryRes.json())
      })
    })
  }

  isRefreshing = true

  try {
    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    })

    if (!refreshRes.ok) {
      throw new Error("Refresh failed")
    }

    const data = await refreshRes.json()

    localStorage.setItem("accessToken", data.accessToken)

    processQueue(data.accessToken)

    // 🔁 retry request เดิม
    const retryRes = await makeRequest(data.accessToken)
    return retryRes.json()

  } catch (err) {
    localStorage.clear()
    window.location.href = "/login"
  } finally {
    isRefreshing = false
  }
}