export const decodeToken = (token: string) => {
  try {
    if (!token || token.split(".").length !== 3) return null
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token)
  if (!payload?.exp) return true
  return payload.exp < Math.floor(Date.now() / 1000)
}

export const getUser = () => {
  if (typeof window === "undefined") return null  // ✅ SSR guard อยู่ที่นี่
  const token = localStorage.getItem("accessToken")
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload) {
    localStorage.removeItem("accessToken")
    return null
  }

  if (isTokenExpired(token)) return null

  return payload
}