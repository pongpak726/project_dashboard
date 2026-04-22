let isRefreshing = false
let refreshQueue: ((token: string) => void)[] = []

const processQueue = (token: string) => {
  refreshQueue.forEach(cb => cb(token))
  refreshQueue = []
}

// ✅ helper แยก parse + check error
const parseResponse = async (res: Response) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "API Error")
  return data
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
    return parseResponse(res)  // ✅ ใช้ helper
  }

  // 🚨 401 → refresh flow
  const refreshToken = localStorage.getItem("refreshToken")

  if (!refreshToken) {
    localStorage.clear()
    window.location.href = "/login"
    return
  }

  // ป้องกันยิง refresh ซ้ำ
  if (isRefreshing) {
    return new Promise((resolve, reject) => {  // ✅ เพิ่ม reject
      refreshQueue.push(async (newToken: string) => {
        try {
          const retryRes = await makeRequest(newToken)
          resolve(await parseResponse(retryRes))  // ✅ check error ด้วย
        } catch (err) {
          reject(err)  // ✅ propagate error
        }
      })
    })
  }

  isRefreshing = true

  try {
    console.log("401 → REFRESH")

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    })

    if (!refreshRes.ok) throw new Error("Refresh failed")

    const data = await refreshRes.json()
    console.log("NEW TOKEN:", data.accessToken)

    localStorage.setItem("accessToken", data.accessToken)
    processQueue(data.accessToken)

    console.log("TRY REQUEST")

    // ✅ retry + check error
    const retryRes = await makeRequest(data.accessToken)
    return parseResponse(retryRes)

  } catch (err) {
    localStorage.clear()
    window.location.href = "/login"
  } finally {
    isRefreshing = false
  }
}