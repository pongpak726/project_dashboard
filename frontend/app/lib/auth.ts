export const decodeToken = (token: string) => {
  try {
    if (!token || token.split(".").length !== 3) return null

    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const payload = JSON.parse(atob(base64))

    // ✅ เช็ค expiry — ถ้าหมดอายุแล้ว return null เลย
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return payload
  } catch {
    return null
  }
}

export const getUser = () => {
  const token = localStorage.getItem("accessToken")
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload) {
    localStorage.removeItem("accessToken")
    return null
  }

  return payload
}